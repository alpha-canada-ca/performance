$(document).on("wb-ready.wb", function() {
    $.i18n().load({
        'en': './assets/js/i18n/en.json',
        'fr': './assets/js/i18n/fr.json'
    }).done(function() {
        $("html").i18n();
        $(".app-name").addClass("hidden");
        $("#allspan").removeClass("hidden");

        tippy('[data-template]', {
            content(reference) {
                const id = reference.getAttribute('data-template');
                const template = $.i18n(id);
                return template;
            },
            allowHTML: true
        });

    });

    let params = getQueryParams()
    var url, start, end;
    url = getSpecifiedParam(params, "url")
    start = getSpecifiedParam(params, "start")
    end = getSpecifiedParam(params, "end")
    date = getSpecifiedParam(params, "date")

    if (start && end) {
        start = moment(start).format("MMMM D, YYYY");
        end = moment(end).format("MMMM D, YYYY");
        $(".dr-date-start").html(start);
        $(".dr-date-end").html(end);
    }

    if (url) {
        $("#urlval").val(url);
        if ($.isNumeric(date)) {
            $('#date-range').val(date).change();
        }

        mainQueue(url, start, end, 0);
    }




});

function getQueryParams() {
    // initialize an empty object
    let result = {};
    // get URL query string
    let params = window.location.search;
    // remove the '?' character
    params = params.substr(1);
    let queryParamArray = (params.split('&'));
    // iterate over parameter array
    queryParamArray.forEach(function(queryParam) {
        // split the query parameter over '='
        let item = queryParam.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    // return result object
    return result;
}

function extractJSON (obj, indent) {
        var isError = false;
          for (const i in obj) {
            if (Array.isArray(obj[i]) || typeof obj[i] === 'object') {
              console.log(indent + i + ' is array or object');
              isError = extractJSON(obj[i], indent + ' > ' + i + ' > ');
              if (i === "error") {
                isError = true;
                console.log(isError)
              }
            } else {
              console.log(indent + i + ': ' + obj[i]);
              if (i === "error") {
                isError = true;
                $("#errorHeader").html(obj[i]);
                console.log(isError)
              } else if ( i === "message" ) {
                isError = true;
                $("#errorDetails").html(obj[i]);
                console.log(isError)
              }
            }
          }
          return isError;
        }

function setQueryParams(url, date) {
    window.history.pushState("Query Parameters", "Addition of Queries", "?url=" + url + "&date=" + date + "&lang=" + document.documentElement.lang);
}

function getSpecifiedParam(object, val) {
    for (let [key, value] of Object.entries(object)) {
        if (key === val) return value;
    }
}

const kFormatter = (num) => {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + "k" : Math.sign(num) * Math.abs(num)
}

const dynamicColors = () => {
    var r = Math.floor(Math.random() * 200);
    var g = Math.floor(Math.random() * 200);
    var b = Math.floor(Math.random() * 200);
    return "rgba(" + r + "," + g + "," + b + ", 0.7)";
}

const poolColors = (a) => {
    var pool = [];
    for (i = 0; i < a; i++) {
        pool.push(dynamicColors());
    }
    return pool;
}

function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}


/**
 * Generates table head
 *
 * @param      {<type>}  table   The table
 * @param      {<type>}  data    The data
 * @param      {<type>}  title   The title (caption)
 */
function generateTableHead(table, data, title) {
    let cap = (table.createCaption()).innerHTML = "<div class='wb-inv'>" + title + "</div";
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);

        th.setAttribute("scope", "col")
        /*
        if ( text == "CTR" ) {
            console.log("yes, CTR called")
            th.appendChild(text + "<sup> <a class=\"fas fa-question-circle fas-1 wb-lbx lbx-modal\" title=\"Help for term 'CTR'\" href=\"#gscctr_content_modal\"></a></sup>")
        }
        else {
            th.appendChild(text);
        }
        */
        th.appendChild(text);
        row.appendChild(th);
    }
}

/**
 * { function_description }
 *
 * @param      {<type>}  table   The table
 * @param      {<type>}  data    The data
 */
function generateTable(table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (key in element) {
            var key = element[key];
            let cell = row.insertCell();
            if (isInt(key)) {
                key = key.toLocaleString(document.documentElement.lang + "-CA");
            }
            cell.insertAdjacentHTML('beforeend', key);
            //let text = document.createTextNode(key);
            //cell.appendChild(text);
        }
    }
}

    function getPDF2(){
        var arr = [ '#canvas-container' ];
        var deferreds = [];
        var pdf = new jsPDF();
        $.each(arr, function( i, val ) {
            console.log(val)
            var deferred = $.Deferred();
            generateCanvas(val, pdf, deferred);
            deferreds.push(deferred.promise());
        });

        $.when.apply($, deferreds).then(function () { // executes after adding all images
          pdf.save("HTML-Document.pdf");
        });
    }

    function generateCanvas ( val, pdf, deferred ) {
        var HTML_Width = $( val ).width();
        var HTML_Height = $( val ).height();
        var top_left_margin = 20;
        var PDF_Width = HTML_Width+(top_left_margin*2);
        var PDF_Height = (PDF_Width*1.5)+(top_left_margin*2);
        var canvas_image_width = HTML_Width;
        var canvas_image_height = HTML_Height;
        
        var totalPDFPages = Math.ceil(HTML_Height/PDF_Height)-1;
        

        html2canvas($( val )[0],{allowTaint:true, scrollX: 0, scrollY: -window.scrollY }).then(function(canvas) {

                 canvas.getContext('2d');

console.log(canvas.height+"  "+canvas.width);
            
            
            var imgData = canvas.toDataURL("image/jpeg", 1.0);
            var pdf = new jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
            //pdf.setFontSize(40)
            //pdf.text(35, 25, 'Paranyan loves jsPDF')

            pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);
            
            
            for (var i = 1; i <= totalPDFPages; i++) { 
                pdf.addPage(PDF_Width, PDF_Height);
                //pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+(top_left_margin*4),canvas_image_width,canvas_image_height);
                pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+(top_left_margin*(2*i+1)), canvas_image_width,canvas_image_height);
            }

            /*
            var img = canvas.toDataURL();
            doc.addImage(img, 'PNG');
            doc.addPage(); 
            */

            deferred.resolve();
            
            

        });
    }

function genPDF() { 

    var arr = [ '#canvas-container' ];
        var deferreds = [];
        var pdf = new jsPDF();
        $.each(arr, function( i, val ) {
            console.log(val)
            var deferred = $.Deferred();
            generateCanvas(val, pdf, deferred);
        });


    $.when.apply($, deferreds).then(function () { // executes after adding all images
      pdf
      .save('test.pdf');
    });
}

function generateCanvas2(i, doc, deferred){

    html2canvas($(i)[0], {

        onrendered: function (canvas) {

            var img = canvas.toDataURL();
            doc.addImage(img, 'PNG');
            doc.addPage(); 

            deferred.resolve();
         }
    });
}

    function getPDF(){

        var HTML_Width = $("main").width();
        var HTML_Height = $("main").height();
        var top_left_margin = 20;
        var PDF_Width = HTML_Width+(top_left_margin*2);
        var PDF_Height = (PDF_Width*1.5)+(top_left_margin*2);
        var canvas_image_width = HTML_Width;
        var canvas_image_height = HTML_Height;
        
        var totalPDFPages = Math.ceil(HTML_Height/PDF_Height)-1;
        

        html2canvas($("main")[0],{allowTaint:true, scrollX: 0, scrollY: -window.scrollY }).then(function(canvas) {
            canvas.getContext('2d');
            
            console.log(canvas.height+"  "+canvas.width);
            
            
            var imgData = canvas.toDataURL("image/jpeg", 1.0);
            var pdf = new jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
            //pdf.setFontSize(40)
            //pdf.text(35, 25, 'Paranyan loves jsPDF')

            pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);
            
            
            for (var i = 1; i <= totalPDFPages; i++) { 
                pdf.addPage(PDF_Width, PDF_Height);
                //pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+(top_left_margin*4),canvas_image_width,canvas_image_height);
                pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+(top_left_margin*(2*i+1)), canvas_image_width,canvas_image_height);
            }
            
            pdf.save("HTML-Document.pdf");
        });
    }

/*
    var options = {
            pagesplit: true,
            background: '#fff' //background is transparent if you don't set it, which turns it black for some reason.
        };
        pdf.addHTML($('#canvas-container')[0], options, function () {
                pdf.save('Test.pdf');
        });
        */

function printToPDF() {
  console.log('converting...');

  /*

  var printableArea = document.getElementById('printable');

  html2canvas(printableArea, {
    useCORS: true,
    onrendered: function(canvas) {

      var pdf = new jsPDF('p', 'pt', 'letter');

      var pageHeight = 980;
      var pageWidth = 900;
      for (var i = 0; i <= printableArea.clientHeight / pageHeight; i++) {
        var srcImg = canvas;
        var sX = 0;
        var sY = pageHeight * i; // start 1 pageHeight down for every new page
        var sWidth = pageWidth;
        var sHeight = pageHeight;
        var dX = 0;
        var dY = 0;
        var dWidth = pageWidth;
        var dHeight = pageHeight;

        window.onePageCanvas = document.createElement("canvas");
        onePageCanvas.setAttribute('width', pageWidth);
        onePageCanvas.setAttribute('height', pageHeight);
        var ctx = onePageCanvas.getContext('2d');
        ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

        var canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);
        var width = onePageCanvas.width;
        var height = onePageCanvas.clientHeight;

        if (i > 0) // if we're on anything other than the first page, add another page
          pdf.addPage(612, 791); // 8.5" x 11" in pts (inches*72)

        pdf.setPage(i + 1); // now we declare that we're working on that page
        pdf.addImage(canvasDataURL, 'PNG', 20, 40, (width * .62), (height * .62)); // add content to the page

      }
      pdf.save('test.pdf');
    }
  });
  */
  /*
  var doc = new jsPDF();          
var elementHandler = {
  '#ignorePDF': function (element, renderer) {
    return true;
  }
};
var source = window.document.getElementsByTagName("main")[0];
console.log( source );
doc.fromHTML(
    source,
    15,
    15,
    {
      'width': 180,'elementHandlers': elementHandler
    });

doc.output("dataurlnewwindow");




 var pdf = new jsPDF('p', 'pt', [1400, 792]);
 pdf.setFontSize(5);
   pdf.text(20, 20, 'Consulta');
    // source can be HTML-formatted string, or a reference
    // to an actual DOM element from which the text will be scraped.
    source = window.document.getElementsByTagName("main")[0]; //$('#customers')[0];

    // we support special element handlers. Register them with jQuery-style 
    // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
    // There is no support for any other type of selectors 
    // (class, of compound) at this time.
    specialElementHandlers = {
        // element with id of "bypass" - jQuery style selector
        '#bypassme': function (element, renderer) {
            // true = "handled elsewhere, bypass text extraction"
            return true
        }
    };
    margins = {
        top: 80,
        bottom: 60,
        left: 40,
        width: 522
    };

    // all coords and widths are in jsPDF instance's declared units
    // 'inches' in this case
    pdf.fromHTML(
    source, // HTML string or DOM elem ref.
    margins.left, // x coord
    margins.top, { // y coord
        'width': margins.width, // max width of content on PDF
        'elementHandlers': specialElementHandlers
    },

    function (dispose) {
        // dispose: object with X, Y of the last line add to the PDF 
        //          this allow the insertion of new lines after html
        pdf.save('Test.pdf');
    }, margins);
    */

    var pdf = new jsPDF('p', 'pt', 'letter');
        var options = {
            pagesplit: true,
            background: '#fff' //background is transparent if you don't set it, which turns it black for some reason.
        };
        pdf.addHTML($('#canvas-container')[0], options, function () {
                pdf.save('Test.pdf');
        });
}

/**
 * { function_description }
 *
 * @param      {<type>}  json    The json
 * @return     {<type>}  { description_of_the_return_value }
 */
const jsonPieGenerate = (arr) => {

    $("#chart").remove()
    $("#chart-canvas").append("<canvas id='chart'></canvas>")

    val = arr;
    cnt = val.length;

    bgColor = [ "#56B4E9", "#009E73", "#0072B2", "#000000"]

    var data = [{
        data: val,
        backgroundColor: bgColor
    }];

    var options = {
        responsive : true,
        maintainAspectRatio: false,
        plugins: {
            beforeInit: (chart, options) => {
                Chart.Legend.afterFit = function() {
                    this.height = this.height + 50;
                };
            },
            datalabels: {
                formatter: (value, ctx) => {
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });

                    let percentage = parseFloat((value * 100 / sum).toFixed(1)).toLocaleString(document.documentElement.lang + "-CA");
                    if (document.documentElement.lang == "fr") {
                        var end = " %"
                    } else {
                        var end = "%";
                    }
                    return percentage + end;
                },
                backgroundColor: function(context) {
                    return context.dataset.backgroundColor;
                },
                borderRadius: 4,
                color: "white",
                font: {
                    weight: "bold",
                    size: 14
                }
            }
        },
        tooltips: {
            mode: 'index',
            titleFontSize: 18,
            bodyFontSize: 16,
            callbacks: {
                label: function(tooltipItem, data) { 
                    var indice = tooltipItem.index;                 
                    return  data.labels[indice] +': '+ (data.datasets[0].data[indice]).toLocaleString() + ' visits';
                }
            }
        },
        legend: {
            position: "bottom",
            minSize: {
                height: 500
            },
            labels: {
                fontSize: 14
            }
        },
        layout: {
            padding: {
                top: 25
            }
        }
    };
    var ctx = document.getElementById("chart").getContext("2d");
    var chart = new Chart(ctx, {
        type: "pie",
        data: {
            datasets: data,
            labels: [$.i18n("Desktop"), $.i18n("MobilePhone"), $.i18n("Tablet"), $.i18n("Other")]
        },
        options: options
    });

    sum = val.reduce(function(acc, val) { return acc + val; }, 0)

    let srch = [];

    $.each(val, function(index, value) {
        val = value
        lab = chart.data.labels[index]
        per = parseFloat((val * 100 / sum).toFixed(2)).toLocaleString(document.documentElement.lang + "-CA")
        if (document.documentElement.lang == "fr") {
            var end = "&nbsp;%"
        } else {
            var end = "%";
        }
        per = per + end;
        val = value.toLocaleString(document.documentElement.lang + "-CA")
        var obj = {};
        obj[$.i18n("DeviceType")] = lab;
        obj[$.i18n("Visits")] = val;
        obj[$.i18n("Percent")] = per;
        srch.push(obj);
    });

    let table = document.querySelector("table#tbl-pltfrm");
    let dtx = Object.keys(srch[0]);
    table.innerHTML = ""
    generateTable(table, srch);
    generateTableHead(table, dtx, $.i18n("Percentage (%) of visits by device used"));

    $("#chart-pltfrms").show();
    $("#chrtp").hide();
}

/**
 * Gets the range between two numbers
 *
 * @class      RANGE asd
 * @param      {<type>}  a       { parameter_description }
 * @param      {<type>}  b       { parameter_description }
 * @return     {<type>}  { description_of_the_return_value }
 */

const RANGE = (a, b) => Array.from((function*(x, y) {
    while (x <= y) yield x++;
})(a, b));

// Return with commas in between
  var numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

const jsonTrendGenerate = (json, day, dates) => {
    var rows = json['rows'];

    if (rows != null) {
        $("#trends").remove()
        $("#trends-canvas").append("<canvas id='trends'></canvas>")

        var keys = Object.keys(rows);
        var arr = [];
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            arr.push( rows[key]['data'] )
        }

        $cnt = arr.length
        val = arr.slice(0, $cnt / 2);
        lval = arr.slice($cnt / 2, $cnt);

        if (day == 1) {
            val = val.slice(-7);
            lval = lval.slice(-7);
        } else if (day == 2) {
            val = val.slice(-1);
            lval = lval.slice(-1);
        }

        console.log(val)

        $cnt = val.length;

        var valVar = [];
        var valVarLong = [];

        for (var m = moment(dates[0]); m.isBefore(dates[1]); m.add(1, 'days')) {
            valVar.push( m.locale(document.documentElement.lang).format('MMM-DD'));
            valVarLong.push( m.locale(document.documentElement.lang).format('MMMM DD'));
        }

        //console.log(val)

        $rng = RANGE(1, $cnt);
        console.log($rng)
        var dd = "day"
        const granularity = dd.replace(/^\w/, c => c.toUpperCase());

        //console.log($rng);

        var updateChartTicks = function(scale) {
            var incrementAmount = 0;
            var previousAmount = 0;
            var newTicks = [];
            newTicks = scale.ticks;
            for (x = 0; x < newTicks.length; x++) {
                incrementAmount = (previousAmount - newTicks[x]);
                previousAmount = newTicks[x];
            }
            if (newTicks.length > 2) {
                if (newTicks[0] - newTicks[1] != incrementAmount) {
                    newTicks[0] = newTicks[1] + incrementAmount;
                }
            }
            return newTicks;
        };

        var options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    display: false
                }
            },

            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("Numberofvisits"),
                        fontSize: 16
                    },
                    ticks: {
                        beginAtZero: true,
                        // Return an empty string to draw the tick line but hide the tick label
                        // Return `null` or `undefined` to hide the tick line entirely
                       callback: function(value, index, values) {
                            return Intl.NumberFormat().format((value/1000));
                        },
                        fontSize: 16
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: ($.i18n(granularity) + $.i18n("Dayofselecteddaterange")),
                        fontSize: 16
                    },
                    gridLines: {
                        display:false
                    },
                    ticks: {
                        fontSize: 16
                    }
                }]
            },
            tooltips: {
                mode: "index",
                intersect: false,
                titleFontSize: 18,
                bodyFontSize: 16,
                callbacks: {
                    label: function(tooltipItem, data) { 
                      return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel) + ' visits';
                    }
                }
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    fontSize: 14
                }
            },
            layout: {
                padding: {
                    top: 25
                }
            }
        };
        var ctx2 = document.getElementById("trends").getContext("2d");
        var chart2 = new Chart(ctx2, {
            type: "line",
            data: {
                labels: valVar,
                datasets: [{
                    label: $.i18n("CurrentYear"),
                    data: val,
                    borderColor: "#56B4E9",
                    backgroundColor: "#56B4E9",
                    fill: false
                }, {
                    label: $.i18n("PreviousYear"),
                    data: lval,
                    borderColor: "#009E73",
                    backgroundColor: "#009E73",
                    fill: false
                }]
            },
            options: options
        });

        let srch = [];
        var cntrx = 1

        $.each(val, function(index, value) {
            vals = val[index]
            lvals = lval[index]
            lab = chart2.data.labels[index]
            /*
            gran = $.i18n(granularity) + "&nbsp;" + cntrx
            cntrx++
            */
            diff = ((vals - lvals) / lvals * 100).toFixed(1);
            if (diff == "Infinity") diff = $.i18n("NotAvailable");
            else if (document.documentElement.lang == "fr") {
                diff = parseFloat(diff).toLocaleString(document.documentElement.lang + "-CA") + "&nbsp;%";
            } else {
                diff = parseFloat(diff) + "%";
            }
            vals = val[index].toLocaleString(document.documentElement.lang + "-CA")
            lvals = lval[index].toLocaleString(document.documentElement.lang + "-CA")
            var obj = {};
            obj[$.i18n(granularity)] = valVarLong[index];
            obj[$.i18n("CurrentYear")] = vals;
            obj[$.i18n("PreviousYear")] = lvals;
            obj[$.i18n("Difference")] = diff;
            srch.push(obj);
        });

        let table = document.querySelector("table#tbl-trnds");
        let dtx = Object.keys(srch[0]);
        table.innerHTML = ""
        generateTable(table, srch);
        generateTableHead(table, dtx, $.i18n("Visitstrendbycurrentyearandpreviousyear"));

        $("#chart-trnds").show();
        $("#chrtt").hide();
    } else {
        $("#chart-trnds").hide();
        $("#chrtt").show();
    }
}

/*

const jsonUv = json => {
    var rows = json["rows"][0];
    var $uv = $("#uv");
    var $rap = $("#rap");
    var $days = parseInt($("#numDays").html());
    var $weeks = parseInt($("#numWeeks").html());
    $uv.html("")
    $rap.html("")
    if (rows != null) {
        uv = (rows["data"][0])
        uvDays = parseInt(uv / $days).toLocaleString(document.documentElement.lang + "-CA");
        uv = parseInt(uv).toLocaleString(document.documentElement.lang + "-CA");
        $uv.prepend("<span class='h1'>" + uvDays + "</span> <strong>" + $.i18n("averageperday") + "</strong></br><span class='small'>" + uv + " " + $.i18n("total") + "</span>");

        rap = (rows["data"][1])
        rapWeeks = parseInt(rap / $weeks).toLocaleString(document.documentElement.lang + "-CA");
        rap = parseInt(rap).toLocaleString(document.documentElement.lang + "-CA");
        $rap.prepend("<span class='h1'>" + rapWeeks + "</span> <strong>" + $.i18n("averageperweek") + "</strong></br><span class='small'>" + rap + " " + $.i18n("total") + "</span>");

        itemid = (rows["itemId"]);
        //console.log(itemid);
        return itemid;
    } else {
        $uv.html("0");
        $rap.html("0");
    }
}

*/

const jsonFile = json => {
    //console.log(json);
}

const getPageTitle = a => Object.keys(a).map((key, index) => {
    var url = a[key]["value"];
    url = (url.indexOf("https://") !== -1) ? url : "https://" + url;
    if (url.indexOf("canada.ca") !== -1) {
        let request = new Request(url, { method: "GET" });
        return fetch(request).then(res => res.text()).then(res => $(res).find("h1:first").text()).catch(console.error.bind(console));
    }
});

const getPageH1 = url => {
    console.log("1: " + url);
    url = (url.indexOf("https://") !== -1) ? url : "https://" + url;
    //if (url.indexOf("canada.ca") !== -1) {
        let request = new Request(url, { method: "GET" });
        return fetch(request).then(res => res.text()).then(res => $(res).find("h1:first").text()).catch(console.error.bind(console));
    //}
};

const getPage = url => {
    url = (url.indexOf("https://") !== -1) ? url : "https://" + url;
    if (url.indexOf("canada.ca") !== -1) {
        let request = new Request(url, { method: "GET" });
        return fetch(request).then(res => res.text()).then(res => { var html = { html: res }; return html; }).catch(console.error.bind(console));
    }
};

const jsonPrevious = (json, day) => {
    var rows = json["rows"][0];
    var val = "#ppt";
    title = $.i18n("Whereuserscamefrom");
    var $prev = $(val);

    if (rows != null) {
        var arrayP = json["rows"];
        $prev.html("");

        var ref = [];

        /*Promise.all(getPageTitle(arrayP)).then(res => {
            $.each(arrayP, function(index, value) {
                url = value["value"];
                term = (res[index] == null) ? url : res[index];
                clicks = value["data"][day];
                f = (url == "blank page url") ? $.i18n("Directtraffic/Bookmark") : ("<a href='" + url + "'>" + term + "</a>");

                var obj = {};
                obj[$.i18n("PreviouspageURL")] = f;
                obj[$.i18n("Visits")] = clicks;
                ref.push(obj);
            });
            return ref;
        }).then(res => {
            if (res.length != 0) {
                //res.sort((a, b)=> b[$.i18n("Visits")] - a[$.i18n("Visits")]);

                $(val).html(getTable(5, "false"));
                let table = document.querySelector(val + " table");
                let data = Object.keys(res[0]);
                generateTable(table, res);
                generateTableHead(table, data, title);

                $(val + " table").trigger("wb-init.wb-tables");
            } else {
                $prev.html($.i18n("Nodata"));
            }
        }).catch(console.error.bind(console));
        */

            $.each(arrayP, function(index, value) {
                url = value["value"];
                term = url;
                clicks = value["data"][day];
                f = (url == "blank page url") ? $.i18n("Directtraffic/Bookmark") : ("<a href='" + url + "'>" + term + "</a>");

                var obj = {};
                obj[$.i18n("PreviouspageURL")] = f;
                obj[$.i18n("Visits")] = clicks;
                ref.push(obj);
            });

            if (ref.length != 0) {
                //res.sort((a, b)=> b[$.i18n("Visits")] - a[$.i18n("Visits")]);

                $(val).html(getTable(5, "false"));
                let table = document.querySelector(val + " table");
                let data = Object.keys(ref[0]);
                generateTable(table, ref);
                generateTableHead(table, data, title);

                $(val + " table").trigger("wb-init.wb-tables");
            } else {
                $prev.html($.i18n("Nodata"));
            }


        //console.log(ref[0]);
        //console.log(ref.length)



    } else {
        $prev.html($.i18n("Nodata"));
    }

    /*

    var rows = json["rows"][0];
    val = "#reft";
    title = "Referring types";
    var $ref = $(val);

    if (rows != null) {
        var array = json["rows"];
        $ref.html("");

        var ref = [];

        $.each(array, function(index, value) {
            term = value["value"];
            clicks = value["data"][day];
            var obj = {};
            obj[$.i18n("Type")]  = $.i18n(term.replace(/\s/g,''));
            obj[$.i18n("Visits")]  = clicks;
            ref.push(obj);
        });

        if (ref.length != 0) {
            ref.sort((a, b)=> b.Visits - a.Visits);
            let table = document.querySelector("table#reft");
            let data = Object.keys(ref[0]);
            generateTable(table, ref);
            generateTableHead(table, data, title);

            $(val).trigger("wb-init.wb-tables");
        } else {
            $ref.html($.i18n("Nodata"));
        }

        */
}

const jsonForward = json => {
    /*
    var rows = json["rows"][0];
    var $next = $("#np");
    
    if (rows != null) {
        arrayF = json["rows"];
        $next.html("");
        $next.append($("<ul>"));
        $next = $("#np ul")

        Promise.all( getPageTitle(arrayF) ).then(res => {
            $.each(arrayF, function(index, value) {
                url = "https://" + value["value"];
                term = (res[index] == null) ? url : res[index];
                val = value["data"][0];

                $next.append($("<li>").append("<a href='" + url + "'>" + term + "</a>"));
            });
        }).catch(console.error.bind(console));
        
    } else {
        $next.html("No data");
    }
    */
}

const jsonSnum = (json, day) => {
    var rows = json["rows"][0];
    var $snum = $("#snum");
    var $days = parseInt($("#numDays").html());
    $snum.html("")

    if (rows != null) {

        snum = (rows["data"][day])
        snumDays = parseInt(snum / $days).toLocaleString(document.documentElement.lang + "-CA");
        snum = parseInt(snum).toLocaleString(document.documentElement.lang + "-CA");
        if (day == 2) { $snum.prepend("<span class='h1'>" + snum + "</span> <strong>" + $.i18n("total") + "</strong>"); }
        else { $snum.prepend("<span class='h1'>" + snumDays + "</span> <strong>" + $.i18n("averageperday") + "</strong></br><span class='small'>" + snum + " " + $.i18n("total") + "</span>"); }

        itemid = (rows["itemId"]);
        //console.log(itemid);
        return itemid;
    } else {
        $snum.html("No data");
    }

}

const jsonSearches = (json, day) => {
    var rows = json["rows"][0];

    if (rows != null) {
        var array = json["rows"];

        var searcha = [];

        $.each(array, function(index, value) {
            search = value["value"];
            searchurl = "https://www.canada.ca/en/revenue-agency/search.html?cdn=canada&st=s&num=10&langs=en&st1rt=1&s5bm3ts21rch=x&q=" + search + "&_charset_=UTF-8&wb-srch-sub=";
            searchv = value["data"][day];

            if (searchv != "0") {
                searcha.push({
                    Term: search,
                    url: searchurl,
                    Clicks: searchv
                });
            }
        });

        if (searcha.length != 0) {
            searcha.sort((a, b) => b.Clicks - a.Clicks);

            $.each(searcha, function(index, value) {
                $search = "#search" + index;
                $searchhtml = $($search);
                $searchhtml.html("");

                $($search).append("<a href='" + value.url + "'>" + value.Term + "</a>").append(" (" + (value.Clicks).toLocaleString(document.documentElement.lang + "-CA") + ")");
            });

        }

    } else {
        var arrayNum = 4;
        var array = new Array(arrayNum);

        $search = $("#search0");
        $search.html($.i18n("Nodata"));
        $.each(array, function(index, value) {
            if (index != 0) {
                $search = $("#search" + index);
                $search.html("");
            }
        });
    }
}

const jsonDownload = (json) => {
    var rows = json["rows"][0];
    $dwnld = $("#dwnld");

    if (rows != null) {

        var arrayO = json["rows"];
        $dwnld.html("");
        $dwnld.append($("<ul class='colcount-sm-2'>"));
        $dwnld = $("#dwnld ul")

        /*
        $.each(arrayO, function(index, value) {
            text = value["value"];
            dwnld = value["data"][0];
            $dwnld.append($("<li>").append(text + " (" + dwnld.toLocaleString() + ")"));
        });
        */

        var srch = [];
        var srchClick = [];

        $.each(arrayO, function(index, value) {
            var term = value['value'];
            var clicks = value['data'][0];

            if (term.includes('.pdf')) {
                if (term.includes('-lp')) type = "Large Print"
                if (term.includes('-fill-')) type = "Fillable"
                else type = "Flat"
            } else if (term.includes('.txt')) type = "E-Text"
            else type = (term.split('/').pop().split('.').pop()).toUpperCase();

            var filename = term.split('/').pop();

            srch.push(term);
            srchClick.push({ 'term': term, 'clicks': clicks, 'type': type, 'filename': filename });
        });

        //console.log(srch)
        //console.log(srchClick)


        //console.log(srchClick.sort(sort_by('type', true, (a) =>  a.toUpperCase())));

        $url = "https://www.canada.ca/en/revenue-agency/services/forms-publications/td1-personal-tax-credits-returns/td1-forms-pay-received-on-january-1-later/td1.html";
        //        $url = "https://www.canada.ca/en/revenue-agency/services/forms-publications.html";


        var $str = $url.split('/').pop().split('.').shift();
        //console.log( $str );

        var srchP = srch.findReg("^https://www.canada.ca/.*?" + $str + "-(fill-)*([0-9]{1,2})")
            //console.log( srchP );

        var $next = $("#np");
        $next.html("");
        $next.append($("<ul class='colcount-sm-2>"));
        $next = $("#np ul")

        $.each(srchClick, function(index, value) {
            $.each(srchP, function(i, v) {
                if (value['term'] == v) $next.append($('<li>').append(value['filename'] + " (" + value['clicks'].toLocaleString(document.documentElement.lang + "-CA") + ") [<em>" + value['type'] + "</em>]"));
            });
        });



        //console.log(srch)

    } else {
        $dwnld.html($.i18n("Nodata"));
    }
}

const jsonOutbound = (json, url) => {
    var rows = json["rows"][0];
    $outbnd = $("#outbnd");


    if (rows != null) {

        var arrayO = json["rows"];
        $outbnd.html("");
        $outbnd.append($("<ul class='colcount-sm-2'>"));
        $outbnd = $("#outbnd ul")

        Promise.all([getPage(url)]).then(res => {
            var $html = res[0].html;
            //console.log( $html );
            $.each(arrayO, function(index, value) {
                text = value["value"];
                outbnd = value["data"][0];
                $outbnd.append($("<li>").append(text + " (" + outbnd.toLocaleString(document.documentElement.lang + "-CA") + ")"));
            });
        });
    } else {
        $outbnd.html($.i18n("Nodata"));
    }
}

const jsonRT = (json, day) => {
    //var rows = json["rows"][0];
    val = "#reft";
    title = $.i18n("Referringtypes");
    var $ref = $(val);

        var array = json;
        $ref.html("");

        var ref = [];

        $.each(array, function(index, value) {
            term = value[0];
            clicks = value[1];
            var obj = {};
            obj[$.i18n("Type")] = $.i18n(term.replace(/\s/g, ''));
            obj[$.i18n("Visits")] = clicks;
            ref.push(obj);
        });

        //console.log(ref);
        //console.log(ref.length)

        if (ref.length != 0) {
            //ref.sort((a, b)=> b[$.i18n("Visits")] - a[$.i18n("Visits")] );

            /*let div = document.querySelector("div#reft");
            let tbl = div.html('<table></table>').addClass('wb-table');
            let data = Object.keys(ref[0]);
            generateTable(tbl, ref);
            generateTableHead(tbl, data, title);

            $(val).trigger("wb-init.wb-tables");
            */

            $(val).html(getTable(5, "false", "false", "false"));
            let table = document.querySelector(val + " table");
            let data = Object.keys(ref[0]);
            generateTable(table, ref);
            generateTableHead(table, data, title);

            $(val + " table").trigger("wb-init.wb-tables");

        } else {
            $ref.html($.i18n("Nodata"));
        }
}

const jsonTable = (json, val, title, headers, day) => {
    //var rows = json["rows"][0];
    title = $.i18n(title);
    var $ref = $(val);

        var array = json;
        $ref.html("");

        var ref = [];

        $.each(array, function(index, value) {

            var obj = {};

            for ( var $i = 0; $i < headers.length; $i++ ) {
                
                term = value[$i];

                if (!isInt(term)) {
                    if ( term.indexOf("||") !== -1 ) {
                    var terms = term.split("||");
                    if (terms.length > 1) {
                        if (document.documentElement.lang == "en") {
                            term = terms[0];
                        } else {
                            term = terms[1];
                        }
                    }
                }
                }
                obj[$.i18n(headers[$i])] = term;
            }

            ref.push(obj);
        });

        //console.log(ref);
        //console.log(ref.length)

        if (ref.length != 0) {
            //ref.sort((a, b)=> b[$.i18n("Visits")] - a[$.i18n("Visits")] );

            /*let div = document.querySelector("div#reft");
            let tbl = div.html('<table></table>').addClass('wb-table');
            let data = Object.keys(ref[0]);
            generateTable(tbl, ref);
            generateTableHead(tbl, data, title);

            $(val).trigger("wb-init.wb-tables");
            */

            $(val).html(getTable(10, "false", "false", "false"));
            let table = document.querySelector(val + " table");
            let data = Object.keys(ref[0]);
            generateTable(table, ref);
            generateTableHead(table, data, title);

            $(val + " table").trigger("wb-init.wb-tables");

        } else {
            $ref.html($.i18n("Nodata"));
        }
}

function getTable($pageLength = null, $search = null, $info = null, $lengthChange = null, $order = null, $length = null, $display = null, $class = null) {
    if (!$class) { $class = "wb-tables table table-responsive"; }
    if (!$pageLength) { $pageLength = 5; }
    if (!$search) { $search = false; }
    if (!$info) { $info = true; }
    if (!$lengthChange) { $lengthChange = true; }
    if (!$order) { $order = [1, "&quot;desc&quot;"]; }
    if (!$length) { $length = [5, 10, 25, -1]; }
    if (!$display) { $display = [5, 10, 25, "&quot;All&quot;"]; }

    return '<table class="' + $class + '" data-wb-tables=\'{ ' +
        '&quot;pageLength&quot; : ' + $pageLength + ', ' +
        '&quot;order&quot; : [ ' + $order + ' ] , ' +
        '&quot;lengthMenu&quot; : [ [ ' + $length + ' ], [ ' + $display + ' ] ] ,' +
        '&quot;searching&quot; : ' + $search + ',' +
        '&quot;info&quot; : ' + $info + ',' +
        '&quot;lengthChange&quot; : ' + $lengthChange +

        '}\'>' +
        '</table>';
}

/*
function makeTableHead(table, data, title) {

    var result = '<table class="wb-tables table" data-wb-tables=\'{ ' +
                    '&quot;pageLength&quot; : 5, ' +
                    '&quot;order&quot; : [ 1, &quot;desc&quot;], ' +
                    '&quot;lengthMenu&quot; : [ [5, 10, 25, -1], [5, 10, 25, &quot;All&quot;] ]' +
                 '}\'>';
    result += "<caption><div class='wb-inv'>"+title+"</div></caption>";

    result += "<thead>";
    for (let key of data) {
        result += "<th width='50%'>" + key + "</th>";
    }
    console.log(result)
    result += "</thead>" + table + "</table>";

    console.log(result)
    console.log(table)

    return result;

}

function makeTable(data) {

    var result = "<tbody>";
    for (let element of data) {
        result += "<tr>";
        for (key in element) {
            var key = element[key];
            result += "<td>";
            if (isInt(key)) {
                key = key.toLocaleString(document.documentElement.lang+"-CA");
            }
            result += key + "</td>";
        }
        result += "</tr>";
    }
    result += "</tbody>";
    //result += "</table>";
    console.log(result)

    return result;

/*
    for(var i=0; i<myArray.length; i++) {
        result += "<tr>";
        for(var j=0; j<myArray[i].length; j++){
            result += "<td>"+myArray[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
    
}
*/

const jsonSearch = (json, val, title, day) => {
    
    var rows = json["rows"][0];
    var $search = $(val);

    if (rows != null) {
        var array = json["rows"];
        $search.html("");

        var srch = [];

        $.each(array, function(index, value) {
            term = value["value"];
            clicks = value["data"][day];

            if (term != "(Low Traffic)" && term != "Unspecified" && clicks != 0) {
                var obj = {};
                obj[$.i18n("Term")] = term;
                obj[$.i18n("Clicks")] = clicks;
                srch.push(obj);
            }
        });

        if (srch.length != 0) {
            //srch.sort((a, b)=> b[$.i18n("Clicks")] - a[$.i18n("Clicks")]);

            var $pageLength = 10;
            $(val).html(getTable($pageLength));
            let table = document.querySelector(val + " table");
            let data = Object.keys(srch[0]);
            generateTable(table, srch);
            generateTableHead(table, data, title);

        } else {
            $search.html($.i18n("Nodata"));
        }

    } else {
        $search.html($.i18n("Nodata"));
    }
}

const jsonSearchesPhrases = (json, day) => {

    var title = $.i18n("Searches from page");
    var val = "#srchP";
    jsonSearch(json, val, title, day);


    $(val + " table").trigger("wb-init.wb-tables");
}

const jsonSearchesAll = (json, day) => {

    var title = $.i18n("Searches to page");
    var val = "#srchA";
    jsonSearch(json, val, title, day);

    $(val + " table").trigger("wb-init.wb-tables");
}

const jsonSearchesInstitution = json => {

    var title = $.i18n("Contextualsearchestopage");
    var val = "#srchI";
    jsonSearch(json, val, title);

    $(val).trigger("wb-init.wb-tables");
}

const jsonSearchesGlobal = json => {
    var title = $.i18n("Globalsearchestopage");
    var val = "#srchG";
    jsonSearch(json, val, title);

    $(val).trigger("wb-init.wb-tables");
}

function sortByCol(arr) {
    return arr.sort((a, b) => b.Clicks - a.Clicks);
}

const jsonAM = (json, day) => {

    var rows = json["rows"][0];
    var val = "#np";
    var $next = $("#np");

    if (rows != null) {
        var array = json["rows"];
        $next.html("");

        var next = [];

        $.each(array, function(index, value) {
            term = value["value"];
            clicks = value["data"][day];

            if (term != "(Low Traffic)" && term != "Unspecified" && val != "0") {
                var obj = {};
                obj[$.i18n("LinkText")] = term;
                obj[$.i18n("Clicks")] = clicks;
                next.push(obj);
            }
        });

        if (next.length != 0) {
            //next.sort((a, b)=> b[$.i18n("Clicks")] - a[$.i18n("Clicks")]);

            var $pageLength = 10;
            $next.html(getTable($pageLength));
            let table = document.querySelector(val + " table");
            let data = Object.keys(next[0]);
            generateTable(table, next);
            generateTableHead(table, data, $.i18n("OutboundClicksonPage"));

            $(val + " table").trigger("wb-init.wb-tables");

        } else {
            $next.html($.i18n("Nodata"));
        }


    } else {
        $next.html($.i18n("Nodata"));
    }

}

const jsonFWYLF = (json, day) => {
    var rows = json["rows"][0];
    var $next = $("#fwylfReason");
    var val = "#fwylfReason";
    var title = $.i18n("NoClicks");

    if (rows != null) {
        var array = json["rows"];
        $next.html("");

        var next = [];

        $.each(array, function(index, value) {
            term = value["value"];
            clicks = value["data"][day];


            var obj = {};
            var terms = term.split("-");
            if (terms.length > 1) {
                if (document.documentElement.lang == "en") {
                    term = terms[0];
                } else {
                    term = terms[1];
                }
            } else {
                term = $.i18n(terms[0]);
            }
            obj[$.i18n("Reason")] = term;
            obj[$.i18n("Submits")] = clicks;
            next.push(obj);

        });

        if (next.length != 0) {
            //next.sort((a, b)=> b.NumSelected - a.NumSelected);

            /*
            let table = document.querySelector("table#fwylfReason");
            let data = Object.keys(next[0]);
            generateTable(table, next);
            generateTableHead(table, data, $.i18n("NoClicks"));

            var $pageLength = 10;
            $(val).html( getTable( $pageLength ) );
            */
            var $pageLength = 10;
            $next.html(getTable($pageLength, "false", "false", "false"));
            let table = document.querySelector(val + " table");
            let data = Object.keys(next[0]);
            generateTable(table, next);
            generateTableHead(table, data, title);

            $(val + " table").trigger("wb-init.wb-tables");

        } else {
            $next.html($.i18n("Nodata"));
        }


    }
}

const jsonMetrics = (json, day) => {
    var rows = json["summaryData"]["filteredTotals"];
    var $uv = $("#uv");

    var $uniquevisit = $("#uniquevisit");
    var $visit = $("#visit");
    var $pagev = $("#pagev");
    var $avgtime = $("#avgtime");

    var $days = parseInt($("#numDays").html());
    var $weeks = parseFloat($("#numWeeks").html());

    var pvNum = 0 + parseInt(day);
    var vNum = 6 + parseInt(day);
    var uvNum = 9 + parseInt(day);

    var avgtimeNum = 24 + parseInt(day);
    var rapNum = 30 + parseInt(day);

    var desktopNum = 12 + parseInt(day);
    var mobileNum = 15 + parseInt(day);
    var tabletNum = 18 + parseInt(day);
    var otherNum = 21 + parseInt(day);

    var findLookingForTotalNum = 45 + parseInt(day);
    var findLookingForNoNum = 48 + parseInt(day);
    var findLookingForYesNum = 51 + parseInt(day);
    var findLookingForInstancesNum = 54 + parseInt(day);

    var albertaNum = 57 + parseInt(day);
    var bcNum = 60 + parseInt(day);
    var manitobaNum = 63 + parseInt(day);
    var newBrunswickNum = 66 + parseInt(day);
    var newfoundlandNum = 69 + parseInt(day);
    var northwestTerritoriesNum = 72 + parseInt(day);
    var novaScotiaNum = 75 + parseInt(day);
    var nunavutNum = 78 + parseInt(day);
    var ontarioNum = 81 + parseInt(day);
    var outsideCanadaNum = 84 + parseInt(day);
    var peiNum = 87 + parseInt(day);
    var quebecNum = 90 + parseInt(day);
    var saskatchewanNum = 93 + parseInt(day);
    var yukonNum = 96 + parseInt(day);

    var rapICantFindNum = 111 + parseInt(day);
    var rapLoginErrorNum = 114 + parseInt(day);
    var rapOtherIssueNum = 117 + parseInt(day);
    var rapSINNum = 120 + parseInt(day);
    var rapInfoIsMissingNum = 123 + parseInt(day);
    var rapSecureKeyNum = 126 + parseInt(day);
    var rapOtherLoginNotListNum = 129 + parseInt(day);
    var rapGCKeyNum = 132 + parseInt(day);
    var rapInfoOutdatedNum = 135 + parseInt(day);
    var rapSpellingMistakeNum = 138 + parseInt(day);
    var rapPACNum = 141 + parseInt(day);
    var rapLinkButtonNotWorkNum = 144 + parseInt(day);
    var rap404Num = 147 + parseInt(day);
    var rapBlankNum = 150 + parseInt(day);

    var searchEngineNum = 99 + parseInt(day);
    var otherWebsitesNum = 102 + parseInt(day);
    var socialNetworksNum = 105 + parseInt(day);
    var typedBookmarkedNum = 108 + parseInt(day);

    $uv.html("")
    $visit.html("")
    $pagev.html("")
    $avgtime.html("")
    

    if (rows != null) {

        uv = parseInt(rows[uvNum])
        uvDays = parseInt(uv / $days).toLocaleString(document.documentElement.lang + "-CA");
        uv = parseInt(uv).toLocaleString(document.documentElement.lang + "-CA");
        //$uv.prepend("<span class='h1'>" + uvDays + "</span> <strong>" + $.i18n("averageperday") + "</strong></br><span class='small'>" + uv + " " + $.i18n("total") + "</span>");
        //$uv.prepend("<span class='h2'>" + uvDays + "</span></br><span class='small'>" + uv + " " + $.i18n("total") + "</span>");

        visit = parseInt(rows[vNum])
        vDays = parseInt(visit / $days).toLocaleString(document.documentElement.lang + "-CA");
        visit = parseInt(visit).toLocaleString(document.documentElement.lang + "-CA");
        //$visit.prepend("<span class='h2'>" + vDays + "</span></br><span class='small'>" + visit + " " + $.i18n("total") + "</span>");

        pv = parseInt(rows[pvNum])
        pvDays = parseInt(pv / $days).toLocaleString(document.documentElement.lang + "-CA");
        pv = parseInt(pv).toLocaleString(document.documentElement.lang + "-CA");
        //$pagev.prepend("<span class='h2'>" + pvDays + "</span></br><span class='small'>" + pv + " " + $.i18n("total") + "</span>");

        atMin = moment.utc(rows[avgtimeNum] * 1000).format('m'); //parseInt(rows[uvNum])
        atSec = moment.utc(rows[avgtimeNum] * 1000).format('ss'); //parseInt(rows[uvNum])
        //uvDays = parseInt( uv / $days ).toLocaleString(document.documentElement.lang+"-CA");
        //uv = parseInt(uv).toLocaleString(document.documentElement.lang+"-CA");
        $avgtime.prepend("<span class='h2'>" + atMin + " min " + atSec + " sec" + "</span>"); //</br><span class'small'>" + $.i18n("hours") + "</span>"); //</br><span class='small'>" + uv +" "+ $.i18n("total")+"</span>");

        if ( day === 2 ) {
            $uv.prepend("<span class='h2'>" + uv + "</span>");
            $visit.prepend("<span class='h2'>" + visit + "</span>");
            $pagev.prepend("<span class='h2'>" + pv + "</span>");
            ($avgtime.closest('section')).height('98px');
        } else {
            $uv.prepend("<span class='h2'>" + uv + "</span></br><div class='small'>" + $.i18n("Dailyaverage") + "</br>" + uvDays + "</div>");
            $visit.prepend("<span class='h2'>" + visit + "</span></br><div class='small'>" + $.i18n("Dailyaverage") + "</br>" + vDays + "</div>");
            $pagev.prepend("<span class='h2'>" + pv + "</span></br><div class='small'>" + $.i18n("Dailyaverage") + "</br>" + pvDays + "</div>");
            ($avgtime.closest('section')).height('138px');
        }


        if (parseInt(rows[findLookingForInstancesNum]) == NaN || parseInt(rows[findLookingForTotalNum]) == 0) {
            $("#rapCont").html('<p id="rap"></p>');
            rap = parseInt(rows[rapNum])
            if (day == 2) $weeks = 1;
            rapWeeks = parseInt(rap / $weeks).toLocaleString(document.documentElement.lang + "-CA");
            rap = parseInt(rap).toLocaleString(document.documentElement.lang + "-CA");
            if (day == 2) { $("#rap").prepend("<span class='h1'>" + rap + "</span> <strong>" + $.i18n("total") + "</strong>"); }
            else { $("#rap").prepend("<span class='h1'>" + rapWeeks + "</span> <strong>" + $.i18n("averageperweek") + "</strong></br><span class='small'>" + rap + " " + $.i18n("total") + "</span>"); }
            $("#fwylfCont").html('<div id="fwylfTable"></div><div id="fwylfReason"></div>');
            $("#rap-container").show();
            $("#fwylf-container").hide();
        } else {
            $("#fwylfCont").html('<div id="fwylfTable"></div><div id="fwylfReason"></div>');
            $("#fwylfTable").html('<table class="table table-striped"><thead><th scope="col">' + $.i18n("Yes") + '</th><th scope="col">' + $.i18n("No") + '</th></thead><tr><td id="fwylfYes"></td><td id="fwylfNo"></td></tr></table>');
            $("#fwylfYes").html(rows[findLookingForYesNum]);
            $("#fwylfNo").html(rows[findLookingForTotalNum]);
            $("#rapCont").html("");
            $("#rap-container").hide();
            $("#fwylf-container").show();
        }

        desktop = parseInt(rows[desktopNum])
        mobile = parseInt(rows[mobileNum])
        tablet = parseInt(rows[tabletNum])
        other = parseInt(rows[otherNum])

        var arr = [desktop, mobile, tablet, other];

        jsonPieGenerate(arr);

        searchEngine = parseInt(rows[searchEngineNum])
        otherWebsites = parseInt(rows[otherWebsitesNum])
        socialNetworks = parseInt(rows[socialNetworksNum])
        typedBookmarked = parseInt(rows[typedBookmarkedNum])

        let referrerType = [
            [ "Search Engines", searchEngine ],
            [ "Other Web Sites", otherWebsites ],
            [ "Social Networks", socialNetworks ],
            [ "Typed / Bookmarked", typedBookmarked]
        ];

        jsonRT(referrerType, day)

        rapVal = "#rapReason";
        rapTitle = $.i18n("reportaproblem");
        rapHeaders = [ "Response", "Clicks" ]

        rapICantFind = parseInt(rows[rapICantFindNum])
        rapLoginError = parseInt(rows[rapLoginErrorNum])
        rapOtherIssue = parseInt(rows[rapOtherIssueNum])
        rapSIN = parseInt(rows[rapSINNum])
        rapInfoIsMissing = parseInt(rows[rapInfoIsMissingNum])
        rapSecureKey = parseInt(rows[rapSecureKeyNum])
        rapOtherLoginNotList = parseInt(rows[rapOtherLoginNotListNum])
        rapGCKey = parseInt(rows[rapGCKeyNum])
        rapInfoOutdated = parseInt(rows[rapInfoOutdatedNum])
        rapSpellingMistake = parseInt(rows[rapSpellingMistakeNum])
        rapPAC = parseInt(rows[rapPACNum])
        rapLinkButtonNotWork = parseInt(rows[rapLinkButtonNotWorkNum])
        rap404 = parseInt(rows[rap404Num])
        rapBlank = parseInt(rows[rapBlankNum])

        let reportAProblemArray = [
            [ "I can't find what I'm looking for||Je n'arrive pas à trouver ce que je cherche", rapICantFind ],
            [ "Login error when trying to access an account (e.g. My Service Canada Account)||Message d'erreur à l'ouverture de la session lorsque je tente d'accéder à un compte (ex. Mon dossier Service Canada)", rapLoginError ],
            [ "Other issue not in this list||Autre problème qui ne figure pas sur cette liste", rapOtherIssue ],
            [ "Social Insurance Number (SIN) validation problems||Problème lié à la validation du numéro d'assurance sociale (NAS)", rapSIN ],
            [ "Information is missing||Les renseignements sont incomplets",  rapInfoIsMissing ],
            [ "SecureKey Concierge (Banking Credential) access||Accès SecureKey Service de Concierge (justificatifs d'identité bancaires)", rapSecureKey ],
            [ "Other login error not in this list||Autre erreur lors de l'ouverture de session qui ne figure pas sur cette liste", rapOtherLoginNotList ],
            [ "GC Key access||Accès CléGC", rapGCKey ],
            [ "Information is outdated or wrong||L'information n'est plus à jour ou est erronée", rapInfoOutdated ],
            [ "It has a spelling mistake||Il y a une erreur d'orthographe ou de grammaire", rapSpellingMistake ],
            [ "Personal Access Code (PAC) problems or EI Access Code (AC) problems||Problème avec le Code d'accès personnel (CAP) ou avec le Code d'accès (CA) de l'assurance emploi", rapPAC ],
            [ "A link, button or video is not working||Un lien, un bouton ou une vidéo ne fonctionne pas", rapLinkButtonNotWork ],
            [ "Report a problem submissions that are 404 Pages||Signaler un problème dans les soumissions de 404 pages", rap404 ],
            [ "Report a problem submissions with no boxes checked||Signaler une soumission de problème sans case cochée", rapBlank ],
        ];

        jsonTable(reportAProblemArray, rapVal, rapTitle, rapHeaders, day)

        provVal = "#provChart";
        provTitle = $.i18n("provTerr");
        provHeaders = [ $.i18n("provTerrHeader"), "Visits" ]

        provAlberta = parseInt(rows[albertaNum])
        provBC = parseInt(rows[bcNum])
        provMB = parseInt(rows[manitobaNum])
        provNB = parseInt(rows[newBrunswickNum])
        provNFL = parseInt(rows[newfoundlandNum])
        provNWT = parseInt(rows[northwestTerritoriesNum])
        provNS = parseInt(rows[novaScotiaNum])
        provNV = parseInt(rows[nunavutNum])
        provON = parseInt(rows[ontarioNum])
        provOutCAN = parseInt(rows[outsideCanadaNum])
        provPEI = parseInt(rows[peiNum])
        provQB = parseInt(rows[quebecNum])
        provSK = parseInt(rows[saskatchewanNum])
        provYK = parseInt(rows[yukonNum])
        
        let provArray = [
            [ "Alberta||L'Alberta", provAlberta],
            [ "British Columbia||La Colombie-Britannique", provBC],
            [ "Manitoba||Le Manitoba", provMB],
            [ "New Brunswick||Le Nouveau-Brunswick", provNB],
            [ "Newfoundland and Labrador||La Terre-Neuve-et-Labrador", provNFL],
            [ "Northwest Territories||Les Territoires du Nord-Ouest", provNWT],
            [ "Nova Scotia||La Nouvelle-Écosse", provNS],
            [ "Nunavut||Le Nunavut", provNV],
            [ "Ontario||L'Ontario", provON],
            [ "Outside Canada||À l'extérieur du Canada", provOutCAN],
            [ "Prince Edward Island||Île-du-Prince-Édouard", provPEI],
            [ "Quebec||Le Québec", provQB],
            [ "Saskatchewan||La Saskatchewan", provSK],
            [ "Yukon (Territory)||Le Yukon (Territoire)", provYK]
        ];

      jsonTable(provArray, provVal, provTitle, provHeaders, day)

    } else {
        $uv.html("0");
        $rap.html("0");
    }

}

function nFormatter(num, digits) {
    var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "K" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    var num = parseFloat((num / si[i].value).toFixed(digits)).toLocaleString(document.documentElement.lang + "-CA");
    return num.replace(rx, "$1") + si[i].symbol;
}

const jsonGSCTotal = (json, day) => {
    var rows = json["rows"];
    var $clicks = $("#gsc-clicks");
    var $imp = $("#gsc-imp");
    var $ctr = $("#gsc-ctr");
    var $pos = $("#gsc-pos");

    var $days = parseInt($("#numDaysgsc").html());
    //console.log( "DAAAAAAAAAAAAYSSSS: ---------- " + day + " -------- $daysss: -------- " + $days)

    $clicks.html("")
    $imp.html("")
    $ctr.html("")
    $pos.html("")

    if (rows != null) {

        for (let r of rows) {
            clicks = parseInt(r["clicks"]);
            fClicks = clicks.toLocaleString(document.documentElement.lang + "-CA"); //.toLocaleString(document.documentElement.lang+"-CA");
            vClicks = parseInt(clicks / $days).toLocaleString(document.documentElement.lang + "-CA");
            //" <strong>Total clicks"+$.i18n("averageperday")+"</strong></br><span class='small'>" + clicks +" "+ $.i18n("total")+"</span>");

            imp = parseInt(r["impressions"]);
            fImp = imp.toLocaleString(document.documentElement.lang + "-CA");
            vImp = parseInt(imp / $days).toLocaleString(document.documentElement.lang + "-CA");
             //</br><span class='small'>" + visit +" "+ $.i18n("total")+"</span>");

            if ( day === 2 ) {
                $clicks.prepend("<span class='h2'>" + fClicks + "</span>"); 
                $imp.prepend("<span class='h2'>" + fImp + "</span>");
            } else {
                $clicks.prepend("<span class='h2'>" + fClicks + "</span></br><div class='small'>" + $.i18n("Dailyaverage") + "</br>" + vClicks + "</div>"); 
                $imp.prepend("<span class='h2'>" + fImp + "</span></br><div class='small'>" + $.i18n("Dailyaverage") + "</br>" + vImp + "</div>");
            }

            /*
            ctr = parseFloat(r["ctr"])
            if (document.documentElement.lang == "fr") {
                var end = "&nbsp;%"
            } else {
                var end = "%";
            }
            fCtr = parseFloat((ctr * 100).toFixed(1)).toLocaleString(document.documentElement.lang + "-CA") + end;
            $ctr.prepend("<span class='h1'>" + fCtr + "</span>"); //</br><span class='small'>" + pv +" "+ $.i18n("total")+"</span>");

            pos = parseFloat(r["position"])
            fPos = nFormatter(pos, 1);
            $pos.prepend("<span class='h1'>" + fPos + "</span>"); //</br><span class='small'>" + pv +" "+ $.i18n("total")+"</span>");
            */
        }

    } else {
        $clicks.html("0")
        $imp.html("0")
        $ctr.html("0")
        $pos.html("0")   
    }

}

const jsonGSCGenerate = (json, day) => {
    var rows = json["rows"];

    if (rows != null) {
        $("#gsc").remove()
        $("#gsc-canvas").append("<canvas id='gsc'></canvas>")

        $cnt = rows.length;

        var clicks = [],
            imp = [],
            keys = [],
            $obj = [],
            ctr = [],
            pos = [];

        $.each(rows, function(index, value) {
            val = value
            clicks.push(parseInt(val['clicks']));
            imp.push(parseInt(val['impressions']));
            if (document.documentElement.lang == "fr") {
                var end = "&nbsp;%"
            } else {
                var end = "%";
            }
            /*
            ctr.push(parseFloat((val['ctr'] * 100)).toFixed(1));
            pos.push(parseFloat(val['position']).toFixed(1));
            */
            var $date = moment( val['keys'][0] ).locale(document.documentElement.lang).format('MMM-DD');
            var $dateLong = moment( val['keys'][0] ).locale(document.documentElement.lang).format("MMMM DD, YYYY")
            keys.push( $date );

            var obj = {};
            obj[$.i18n("Day")] = $dateLong;
            obj[$.i18n("Clicks")] = val['clicks'].toLocaleString(document.documentElement.lang + "-CA");
            obj[$.i18n("Impressions")] = val['impressions'].toLocaleString(document.documentElement.lang + "-CA");
            /*
            obj[$.i18n("CTR")] = parseFloat((val['ctr'] * 100).toFixed(1)).toLocaleString(document.documentElement.lang + "-CA") + end;
            obj[$.i18n("Position")] = val['position'].toFixed(1).toLocaleString(document.documentElement.lang + "-CA");
            */
            $obj.push(obj);
        });

        var options = {
            plugins: {
                datalabels: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    id: 'y-axis-0',
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        beginAtZero: true,
                        callback: function(value, index, values) {
                            return Intl.NumberFormat().format((value/1000));
                        },
                        fontSize: 16
                    },
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("GSCClicks"),
                        fontSize: 16
                    }
                }, {

                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        beginAtZero: true,
                        callback: function(value, index, values) {
                            return Intl.NumberFormat().format((value/1000));
                        },
                        fontSize: 16
                    },
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("GSCImpressions"),
                        fontSize: 16
                    }
                }/*, {

                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("CTR")
                    }
                }, {

                    id: 'y-axis-3',
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("Position")
                    }
                }*/],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("Dayofselecteddaterange2"),
                        fontSize: 16
                    },
                    ticks: {
                        fontSize: 16
                    }
                }]
            },
            tooltips: {
                mode: "index",
                intersect: false,
                titleFontSize: 18,
                bodyFontSize: 16,
                callbacks: {
                    label: function(tooltipItem, data) { 
                      return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel);
                    }
                }
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            legend: {
                position: "top",
                labels: {
                    usePointStyle: true
                }
            },
            layout: {
                padding: {
                    top: 25
                }
            }
        };

        var ctx3 = document.getElementById("gsc").getContext("2d");
        var chart3 = new Chart(ctx3, {
            type: "line",
            data: {
                labels: keys,
                datasets: [{
                    yAxisID: 'y-axis-0',
                    label: $.i18n("Clicks"),
                    data: clicks,
                    fill: false,
                    borderColor: "#4285f4"
                }, {
                    yAxisID: 'y-axis-1',
                    label: $.i18n("Impressions"),
                    data: imp,
                    fill: false,
                    borderColor: "#5e35b1"
                }/*, {
                    yAxisID: 'y-axis-2',
                    label: $.i18n("CTR"),
                    data: ctr,
                    fill: false,
                    borderColor: "#18897b"
                }, {
                    yAxisID: 'y-axis-3',
                    label: $.i18n("Position"),
                    data: pos,
                    fill: false,
                    borderColor: "#e8710a"
                }*/]
            },
            options: options
        });

        let table = document.querySelector("table#tbl-gsc");
        let dtx = Object.keys($obj[0]);
        table.innerHTML = ""
        generateTable(table, $obj);
        generateTableHead(table, dtx, $.i18n("Visitstrendbycurrentyearandpreviousyear"));

        $("#chart-gsc").show();
        $("#chrtgsc").hide();
    } else {
        $("#chart-gsc").hide();
        $("#chrtgsc").show();
    }
}

const jsonGSC = (json, val, title, lang) => {

    var rows = json["rows"];
    var $qry = $(val);

    console.log(rows);

    if (rows != null) {
        var array = json["rows"];
        $qry.html("");

        var srch = [];

        $.each(array, function(index, value) {
            term = value["keys"][lang];
            clicks = value["clicks"];
            imp = value["impressions"];
            ctr = parseFloat((value['ctr'] * 100)).toFixed(1);
            pos = value['position'].toFixed(1);
            if (document.documentElement.lang == "fr") {
                var end = "&nbsp;%"
            } else {
                var end = "%";
            }
            var obj = {};
            obj[$.i18n("Term")] = term;
            obj[$.i18n("Clicks")] = clicks;
            obj[$.i18n("Impressions")] = imp;
            obj[$.i18n("CTR")] = (ctr + end);
            obj[$.i18n("Position")] = pos;
            srch.push(obj);
        });

        if (srch.length != 0) {
            //srch.sort((a, b)=> b[$.i18n("Clicks")] - a[$.i18n("Clicks")]);
            var $pageLength = 10;
            $(val).html(getTable($pageLength));
            let table = document.querySelector(val + " table");
            let data = Object.keys(srch[0]);
            generateTable(table, srch);
            generateTableHead(table, data, title);

        } else {
            $qry.html($.i18n("Nodata"));
        }

    } else {
        $qry.html($.i18n("Nodata"));
    }
}

const jsonGSCQryAll = (json, day) => {

    var title = $.i18n("All - Queries");
    var val = "#gscQryAll";
    jsonGSC(json, val, title, 0);

    $(val + " table").trigger("wb-init.wb-tables");
}

const jsonGSCQryMobile = (json, day) => {

    var title = $.i18n("Mobile - Queries");
    var val = "#gscQryMob";
    jsonGSC(json, val, title, 0);

    $(val + " table").trigger("wb-init.wb-tables");
}

const jsonGSCQryDesktop = (json, day) => {

    var title = $.i18n("Desktop - Queries");
    var val = "#gscQryDesk";
    jsonGSC(json, val, title, 0);

    $(val + " table").trigger("wb-init.wb-tables");
}

const jsonGSCQryTablet = (json, day) => {

    var title = $.i18n("Desktop - Queries");
    var val = "#gscQryTab";
    jsonGSC(json, val, title, 0);

    $(val + " table").trigger("wb-init.wb-tables");
}

const jsonGSCCountry = (json, day) => {

    if (document.documentElement.lang == "en") {
        lang = 0;
    } else {
        lang = 1;
    }

    var title = $.i18n("Countries");
    var val = "#gscCountry";
    jsonGSC(json, val, title, lang);

    $(val + " table").trigger("wb-init.wb-tables");
}

//  returns an object with the sought country's data if the search yields a result
//  returns undefined if no results could be found or if argument is incorrect
function search_country(query) {

    var countries = JSON.parse("../assets/js/json/country-en.json");
    condole.log(countries);

    // if argument is not valid return false
    if (undefined === query.id && undefined === query.alpha2 && undefined === query.alpha3) return undefined;

    // iterate over the array of countries
    return countries.filter(function(country) {

        // return country's data if
        return (
            // we are searching by ID and we have a match
            (undefined !== query.id && parseInt(country.id, 10) === parseInt(query.id, 10))
            // or we are searching by alpha2 and we have a match
            ||
            (undefined !== query.alpha2 && country.alpha2 === query.alpha2.toLowerCase())
            // or we are searching by alpha3 and we have a match
            ||
            (undefined !== query.alpha3 && country.alpha3 === query.alpha3.toLowerCase())
        )

        // since "filter" returns an array we use pop to get just the data object
    }).pop()

}

function fetchWithTimeout(url, options, delay, onTimeout) {
    const timer = new Promise((resolve) => {
        setTimeout(resolve, delay, {
            timeout: true,
        });
    });
    return Promise.race([
        fetch(url, options),
        timer
    ]).then(response => {
        if (response.timeout) {
            onTimeout();
        }
        return response;
    })
}

const apiCall = (d, i, a, uu, dd, fld, lg) => a.map(type => {
    url = (type == "fle") ? "php/file.php" : "php/process.php"

    post = { dates: d, url: i, type: type, oUrl: uu, field: fld, lang : lg };

    let request = new Request(url, {
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).then(res => res.json()).then(res => {
        //cnt++; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        console.log(type);
        console.log(res);
        if (res['error']) {
            return Promise.resolve(res);
        } else {
        switch (type) {
            //case "uvrap" : return jsonUv(res);
            case "fle":
                return jsonFile(res);
            case "snmAll":
                return jsonSnum(res, dd);
            case "srchLeftAll":
                return jsonSearchesPhrases(res, dd);
            case "trnd":
                return jsonTrendGenerate(res, dd, d);
                //case "pltfrm" : return jsonPieGenerate(res);
            case "prvs":
                return jsonPrevious(res, dd);
            case "frwrd":
                return jsonForward(res);
            case "srchAll":
                return jsonSearchesAll(res, dd);
            case "activityMap":
                return jsonAM(res, dd);
            case "metrics-new":
                return jsonMetrics(res, dd);
            //case "refType": return jsonRT(res, dd);
            case "fwylf":
                return jsonFWYLF(res, dd);
                //case "dwnld" : return jsonDownload(res, uu);
                //case "outbnd" : return jsonOutbound(res, uu);
            case 'cntry':
                return jsonGSCCountry(res, dd);
            case 'qryAll':
                return jsonGSCQryAll(res, dd);
            case 'qryMobile':
                return jsonGSCQryMobile(res, dd);
            case 'qryDesktop':
                return jsonGSCQryDesktop(res, dd);
            case 'qryTablet':
                return jsonGSCQryTablet(res, dd);
            case 'totals':
                return jsonGSCTotal(res, dd);
            case 'totalDate':
                return jsonGSCGenerate(res, dd);
        }
    }
    }).catch(function(err) {
        console.log(type);
        console.log(err.message);
        console.log(err.stack);
    });

});

const apiCall2 = (d, i, a, uu, lg) => a.map(type => {
    url = "php/process-new.php";

    post = { dates: d, url: i, oUrl: uu, lang: lg };

    let request = new Request(url, {
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).then(res => res.json()).then(res => {
        //cnt++; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        //console.log(type);
        //console.log(res);

        $("#urlStatic").html("https://" + res['url']);
        return res;
    }).catch(function(err) {
        console.log(type);
        console.log(err.message);
        console.log(err.stack);
    });

});

const apiCallGSC2 = (d, i, a, uu, dd, lg) => a.map(type => {
    url = "php/process-gsc.php";

    post = { dates: d, url: i, oUrl: uu, day: dd, lang: lg };

    let request = new Request(url, {
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).then(res => res.json()).then(res => {

        var localLocaleStart = moment(res['start']);
        var localLocaleEnd = moment(res['end']);
        var diff = localLocaleEnd.diff(localLocaleStart, 'days') + 1;

        $("#urlStatic").html(res['url']);
        $("#fromGSC").html(res['start']);
        $("#toGSC").html(res['end']);

        localLocaleStart.locale(document.documentElement.lang);
        localLocaleEnd.locale(document.documentElement.lang);

        var fromdaterangegsc = localLocaleStart.format("dddd MMMM DD, YYYY");
        var todaterangegsc = localLocaleEnd.format("dddd MMMM DD, YYYY");


        $dd = $('#date-range').find(':selected').data('index');
        $("#fromdaterangegsc").html("<strong>" + fromdaterangegsc + "</strong>");
        $("#todaterangegsc").html("<strong>" + todaterangegsc + "</strong>");

        $("#numDaysgsc").html(diff);


        return res;
    }).catch(function(err) {
        console.log(type);
        console.log(err.message);
        console.log(err.stack);
    });

});

const apiCallBP = (d, i, a, uu) => a.map(type => {
    url = "php/process-bp.php";

    post = { dates: d, url: i, oUrl: uu, lang: document.documentElement.lang };

    let request = new Request(url, {
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).then(res => res.json()).then(res => {
        if (res['html'].indexOf("No data") == -1) {
            $("#bp-content").html(res['html']);
            $("#bp-content").append("<p> For more options and date ranges, please visit <a href='https://feedback-by-page.tbs.alpha.canada.ca/bypage?page=" + uu + "' target='_blank'>"+ "https://feedback-by-page.tbs.alpha.canada.ca/bypage?page=" + uu + "</a></p>");
            ($("#details-panel3-lnk").closest("li")).removeClass("hidden");
            ($("#details-panel3")).removeClass("hidden");
        } else {
            $("#bp-content").html("");
            ($("#details-panel3-lnk").closest("li")).addClass("hidden");
            ($("#details-panel3")).addClass("hidden");

            if ($("#details-panel3-lnk").parent().hasClass("active")) {
                $("#details-panel3-lnk").parent().removeClass("active");
                $("#details-panel1-lnk").click();
            }
        }

    }).catch(function(err) {
        $("#bp-content").html("");
        $("#details-panel3-lnk").parent().addClass("hidden");
        if ($("#details-panel3-lnk").parent().hasClass("active")) {
            $("#details-panel3-lnk").parent().removeClass("active");
            $("#details-panel1-lnk").click();
        }
        //console.log(type);
        //console.log(err.message);
        //console.log(err.stack);
    });

});

const apiCallRead = (d, i, a, uu) => a.map(type => {
    url = "php/process-read.php";

    post = { dates: d, url: i, oUrl: uu, lang: document.documentElement.lang };

    let request = new Request(url, {
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).then(res => res.json()).then(res => {
        if (res['html'].indexOf("No data") == -1) {
            $("#read-content").html(res['html']);
            $("#details-panel4-lnk").parent().removeClass("hidden");
        } else {
            $("#read-content").html("");
            $("#details-panel4-lnk").parent().addClass("hidden");
            if ($("#details-panel4-lnk").parent().hasClass("active")) {
                $("#details-panel4-lnk").parent().removeClass("active");
                $("#details-panel3-lnk").click();
            }
        }

    }).catch(function(err) {
        $("#read-content").html("");
        $("#details-panel4-lnk").parent().addClass("hidden");
        if ($("#details-panel4-lnk").parent().hasClass("active")) {
            $("#details-panel4-lnk").parent().removeClass("active");
            $("#details-panel3-lnk").click();
        }
        //console.log(type);
        //console.log(err.message);
        //console.log(err.stack);
    });

});

//document.getElementById('download-pdf').addEventListener("click", downloadPDF);
function downloadPDF() {
  var canvas = document.querySelector('#canvas-container');
    //creates image
    /*var canvasImg = canvas.toDataURL("image/png", 1.0);
  
    //creates PDF from img*/
    var doc = new jsPDF('portrait');
    doc.setFontSize(20);
    doc.text(15, 15, "Cool Chart");
    doc.addImage(canvasImg, 'PNG', 10, 10, 280, 150 );
    doc.save('canvas.pdf');
}

$("#urlform").submit(function(event) {
    event.preventDefault();
    url = $("#urlval").val();
    $("#urlStatic").html(url);
    start = $(".dr-date-start").html()
    end = moment();

    mainQueue(url, start, end, 0);
});



$('a#h2href').click(function() {
    event.preventDefault();
    url = $("#urlStatic").html();
    start = $(".dr-date-start").html()
    end = moment();
    if ( $('#urlLang').html() == 1 ) {
        $('#urlLang').html(0)
    } else { $('#urlLang').html(1) }

    mainQueue(url, start, end, "1");
});

$("#ddRange").submit(function(event) {
    event.preventDefault();
  url = $("#urlval").val();
    $("#urlStatic").html(url);
    start = $(".dr-date-start").html()
    end = moment();
    //dd = $('#date-range').find(':selected').data('index');

    mainQueue(url, start, end, 0);//, dd);
});


const removeQueryString = (url) => {
    var a = document.createElement('a'); // dummy element
    a.href = url; // set full url
    a.search = ""; // blank out query string
    $href = a.href;
    if (/Edge/.test(navigator.userAgent)) {
        $href = $href.substring(0, $href.length - 1);
    }
    return $href;
}

const containsAny = (str, substrings) => {
    for (var i = 0; i != substrings.length; i++) {
       var substring = substrings[i];
       if (str.indexOf(substring) != - 1) {
         return substring;
       }
    }
    return null; 
}

const mainQueue = (url, start, end, lang) => {

    console.log(url);

    //url = removeQueryString(url);
    $("#canvas-container").addClass("hidden");
    $("#whole-canvas").addClass("hidden");
    $("#notfound").addClass("hidden")
    $("#error").addClass("hidden");
    $("#loading").removeClass("hidden");

    $success = 0;

    console.log(url);

        /*
    console.log(url);
    url = (url.substring(0, 8) == "https://") ? url.substring(8, url.length) : url;
    console.log(url)
    /*
    if (url.substring(0, 4) == "www." && url.substring(url.length - 5, url.length) == ".html" ||
        /^(apps[1-8].ams-sga.cra-arc.gc.ca)/.test(url) ) {
    
    if (substrings.some(url.includes.bind(url))) {
        console.log("worked")
    } else {
        console.log("not work")
    }
    */

    if ( (url.substring(0, 8) == "https://") && containsAny( url, substrings ) ) {

        $isApp = ( /(apps[1-8].ams-sga.cra-arc.gc.ca)/.test(url) ) ? 1 : 0;

    console.log("isApp: " + $isApp)

        oUrl = url;
        url = url.substring(8, url.length)
        console.log(url)

        url = (url.length > 255) ? url.substring((url.length) - 255, url.length) : url;

        moment.locale('en'); // default the locale to English

        $dd = $('#date-range').find(':selected').data('index');
        //console.log( "---------------------->> " + $dd );
        //$dd = $("input[name=dd-value").val();
        if (!$.isNumeric($dd)) $dd = 1;
        
        if (start && end) {
            vStart = start;
            vEnd = end;
        } else {
            var start = moment();
            var vEnd = moment().format("dddd MMMM DD, YYYY");
            if ($dd == 0) { vStart = moment(start).subtract(30, 'days').format("dddd MMMM DD, YYYY");  }
            else if ($dd == 1) { vStart = moment(start).subtract(7, 'days').format("dddd MMMM DD, YYYY");  }
            else if ($dd == 2) { vStart = moment(start).subtract(1, 'days').format("dddd MMMM DD, YYYY");  }
        }
        var start = moment(vStart).format("YYYY-MM-DDTHH:mm:ss.SSS");
        var end = moment(vEnd).format("YYYY-MM-DDTHH:mm:ss.SSS");
        var endMD = moment(vEnd).subtract(1, "days").format("YYYY-MM-DDTHH:mm:ss.SSS")

        var dateMD = [ start , endMD ]
        var d = [start, end];

        console.log( d );

        var localLocaleStart = moment(vStart);
        var localLocaleEnd = moment(vEnd);

        localLocaleStart.locale(document.documentElement.lang);
        localLocaleEnd.locale(document.documentElement.lang);

        var fromdaterange = localLocaleStart.format("dddd MMMM DD, YYYY");
        var todaterange = localLocaleEnd.subtract(1, "days").format("dddd MMMM DD, YYYY");

        $("#fromdaterange").html("<strong>" + fromdaterange + "</strong>");
        $("#todaterange").html("<strong>" + todaterange + "</strong>");

        var start = moment(vStart);
        var end = moment(vEnd);

        dDay = end.diff(start, "days");
        dWeek = end.diff(start, "week", true);
        //console.log(dWeek);
        /*
        dMonth = end.diff(start, "month", true);
        dQuarter = end.diff(start, "quarter", true);
        dYear = end.diff(start, "year", true);
        */

        $("#numDays").html(dDay);
        $("#numWeeks").html(dWeek);

        $("#searchBttn").prop("disabled", true);

        var dbCall = ["dbGet"];
        var langAbbr;
        console.log("language: " + lang)
        if ($isApp) {
            var match = ["trnd", "prvs", "metrics-new" ]; //, "fle"];
            if ( $('#urlLang').html() == 1 ) { langAbbr = "fr"; }
            else { langAbbr = "en"; }
            url = url.substring(5, url.length)
        } else {
            var match = ["trnd", "prvs", "srchAll", "snmAll", "srchLeftAll", "activityMap", "metrics-new", "fwylf" ]; //, "fle"];
            var langAbbr = "bi";
        }
        var gsc = ['cntry', 'qryAll', 'qryMobile', 'qryDesktop', 'qryTablet', 'totals', 'totalDate'];
        //var match = [ "snm", "uvrap" ];
        var previousURL = [];
        var pageURL = []; //, "dwnld", "outbnd" ];
        console.log("language abbr: " + langAbbr);
        /*
        let aa = (match.concat(previousURL).concat(pageURL)).length;
        cnt = 0; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        */
        // Get by page data from database, if not pull it
        const dbGetBPMatch = (res) => {
            url = $("#urlStatic").html();
            oUrl = $("#urlStatic").html();
            Promise.all(apiCallBP(dateMD, url, dbCall, oUrl))
            return res
        }

        const dbGetReadMatch = () => {
            url = $("#urlStatic").html();
            oUrl = $("#urlStatic").html();
            return Promise.all(apiCallRead(d, url, dbCall, oUrl))
        }


        // Get AA data and if it is not in database pull it
        const dbGetMatch = () => {
            $("#loadGSC").empty();
            $("#loadAA").html($.i18n("FetchdataAA"));
            url = $("#urlStatic").html();
            oUrl = $("#urlStatic").html();

            return Promise.all(apiCall2(d, url, dbCall, oUrl, lang))
        }

        // Get Google Search Console data if it is cached, if not it will query and update database 
        const dbGetGSC = () => {
                if ( !$isApp ) {
                    $("#loadGSC").html($.i18n("FetchdataGSC"));
                    return Promise.all(apiCallGSC2(d, url, dbCall, oUrl, dDay, lang))
                }
                return Promise.resolve("null");
            }
            // pull AA data and display
        const getMatch = () => {
            $("#loadAA").empty();
            $("#loadFD").html($.i18n("FetchdataFD"));
            if ( $isApp ) { oUrl2 = url.substring(13, url.length); url = url.substring(13, url.length) }
            else {
                url = $("#urlStatic").html();
                oUrl2 = $("#urlStatic").html();
            }
            return Promise.all(apiCall(d, url, match, oUrl2, $dd, "aa", langAbbr))
        }

        // pull GSC data and display
        const getGSC = (res) => {
            console.log("LOOOG " + res)
            if ( !$isApp ) {
                url = $("#urlStatic").html();
                oUrl = $("#urlStatic").html();
                dd = [$("#fromGSC").text(), $("#toGSC").text()];
                Promise.all(apiCall(dd, url, gsc, oUrl, $dd, "gsc"))
                return res;
            }
            return res;
        }
        const checkErrorMatch = (res) => {
            //console.log(res.some( vendor => vendor === "error" )); //res.some(item => item.name === 'Blofeld'))
           
               console.log("-----------------------------")
            console.log(res)

            /*

            Object.keys(res).map((key, index) => {
                if (Array.isArray(res[i]) || typeof obj[i] === 'object') {
                    console.log( res[key] );
                }

            });

            */

            var $tf = extractJSON(res, '');
            console.log($tf)
            
            $("#searchBttn").prop("disabled", false);
            return Promise.resolve($tf);
            
        }
        const getTitle = h2 => { if ( !$isApp ) { return Promise.all([getPageH1(h2[0]['url'])]) } return Promise.resolve($.i18n("Page-levelstatistics"));} 

        const chainError = (err) => {
          return Promise.reject(err)
        }

        
/*
         const extractJSON = (obj, indent) => {
          Object.keys(obj).map((key, index) => {
            if (Array.isArray(obj[i]) || typeof obj[i] === 'object') {
              console.log(indent + i + ' is array or object');
              extractJSON(obj[i], indent + ' > ' + i + ' > ');
            } else {
              console.log(indent + i + ': ' + obj[i] + i + i);
            }
          });
        }
            /*
            const getPreviousPage = id => {
                if (id != null) return Promise.all( apiCall(d, id, previousURL, aa, url));
                else $("#np").html("No data");
            }
            const getPageURL = id => {
                if (id != null) return Promise.all( apiCall(d, id, pageURL, aa, url));
                else $("#pp").html("No data");
            }
            */

        dbGetGSC()
            .then(res => getTitle(res))
            .then(res => { $("#h2title").html(res); })
            .then(() => dbGetMatch())
            .then(() => getMatch())
            .then(res => checkErrorMatch(res))//, chainError())
            .then(res => getGSC(res))
            //.then(res => dbGetBPMatch(res))
            //.then(() => dbGetReadMatch())
            /*.then( res => { getPreviousPage(res[0]); return res; })
             */
            .then(res => {
                console.log("log: " + res)
                /*
                $("#loadGSC").addClass("hidden");
                $("#loadAA").removeClass("hidden");
                */
            //Object.keys(res)
                
                if ( ( ( $("#urlStatic").html() ).indexOf("/fr/") !== -1 && !$isApp ) ||
                       ( $('#urlLang').html() == 1 && $isApp ) ) {
                    $("a#h2href").html($.i18n("LanguageToggleFR"));
                } else {
                    $("a#h2href").html($.i18n("LanguageToggleEN"));
                }

                if ( $isApp ) {
                    $("#rap-container").addClass("hidden");
                    $("#snum-container").addClass("hidden");
                    $("#search-container").addClass("hidden");
                    $("#fwlf-container").addClass("hidden");
                    $("#srchA-container").addClass("hidden");
                    $("#np-container").addClass("hidden");

                    ($("#details-panel2-lnk").closest("li")).addClass("hidden");
                    ($("#details-panel2")).addClass("hidden");
                } else {
                    $("#rap-container").removeClass("hidden");
                    $("#snum-container").removeClass("hidden");
                    $("#search-container").removeClass("hidden");
                    $("#fwlf-container").removeClass("hidden");
                    $("#srchA-container").removeClass("hidden");
                    $("#np-container").removeClass("hidden");

                    ($("#details-panel2-lnk").closest("li")).removeClass("hidden");
                    ($("#details-panel2")).removeClass("hidden");
                }

                if ( res ) {
                    $("#loading").addClass("hidden");
                    $("#notfound").addClass("hidden");
                    $("#error").removeClass("hidden");
                    $('#errorHeader').val($('#urlStatic').text());
                    $("#searchBttn").prop("disabled", false);
                    $('#urlval').val($('#urlStatic').text());
                    date = $('#date-range').val();
                    $("#loadComp").html($.i18n("FetchdataComplete"))
                    setQueryParams(oUrl, date);
                    $("#loadComp").empty()
                } else {
                    $("#loading").addClass("hidden");
                    $("#loadFD").empty();
                    $("#error").addClass("hidden");
                    $("#notfound").addClass("hidden");
                    $("#whole-canvas").removeClass("hidden");
                    $("#searchBttn").prop("disabled", false);
                    $('#urlval').val($('#urlStatic').text());
                    date = $('#date-range').val();
                    $("#loadComp").html($.i18n("FetchdataComplete"))
                    setQueryParams(oUrl, date);
                    $("#loadComp").empty()

                    $("#canvas-container").removeClass("hidden");
                }

                

                if ( $dd == 0 ) { $("#gscDate").html($.i18n("Last30days")); $("#ddDate").html($.i18n("Last30days")); }
                else if ( $dd == 1 ) { $("#gscDate").html($.i18n("Last7days")); $("#ddDate").html($.i18n("Last7days")); }
                else if ( $dd == 2 ) { $("#gscDate").html($.i18n("Yesterday")); $("#ddDate").html($.i18n("Yesterday")); }

                if ( $dd === 2 ) {
                    $("#todaterange").addClass('hidden');
                    $("#to").addClass('hidden');
                    $("#todaterangegsc").addClass('hidden');
                    $("#gscto").addClass('hidden');
                } else {
                    $("#todaterange").removeClass('hidden');
                    $("#to").removeClass('hidden');
                    $("#todaterangegsc").removeClass('hidden');
                    $("#gscto").removeClass('hidden');
                }
                

                
            })
            .catch(console.error.bind(console));

        $success = 1;

    }

    if (!$success) {
        $("#loading").addClass("hidden");
        $("#notfound").removeClass("hidden");
    }
}

