

$(document).on("wb-ready.wb",function() {
    $.i18n().load( {
        'en': './assets/js/i18n/en.json',
        'fr': './assets/js/i18n/fr.json'
    } ).done(function () {
        $("html").i18n();
        $(".app-name").text($.i18n("app-title"));
        $("#allspan").removeClass("hidden");
    });
    
    
    let params = getQueryParams()
    var url, start, end;
    url = getSpecifiedParam(params, "url")
    start = getSpecifiedParam(params, "start")
    end = getSpecifiedParam(params, "end")
    if (start && end) {
        start = moment(start).format("MMMM D, YYYY");
        end = moment(end).format("MMMM D, YYYY");
        $(".dr-date-start").html(start);
        $(".dr-date-end").html(end);
    }

    if (url) {
        $("#urlval").val(url);
        mainQueue(url, start, end);
    }
});

function getQueryParams() {
  // initialize an empty object
  let result = {};
  // get URL query string
  let params = window.location.search;
  // remove the '?' character
  params = params.substr(1);
  let queryParamArray = ( params.split('&') );
  // iterate over parameter array
  queryParamArray.forEach(function(queryParam) {
    // split the query parameter over '='
    let item = queryParam.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  // return result object
  return result;
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
    let cap = (table.createCaption()).innerHTML = "<div class='wb-inv'>"+title+"</div";
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
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
                key = key.toLocaleString();
            }
            let text = document.createTextNode(key);
            cell.appendChild(text);
        }
    }
}

/**
 * { function_description }
 *
 * @param      {<type>}  json    The json
 * @return     {<type>}  { description_of_the_return_value }
 */
const jsonPieGenerate = (arr) => {

        $("#chart").remove();
        $("#chart-canvas").append("<canvas id='chart' data-i18n='Textalternativeforthiscanvasgraphicisinthedatatablebelow.'></canvas>");

        val = arr;
        cnt = val.length;

        var data = [{
            data: val,
            backgroundColor: poolColors(cnt)
        }];

        var options = {
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

                        let percentage = (value * 100 / sum).toFixed(1) + "%";
                        return percentage;
                    },
                    backgroundColor: function(context) {
                        return context.dataset.backgroundColor;
                    },
                    borderRadius: 4,
                    color: "white",
                    font: {
                        weight: "bold"
                    }
                }
            },
            tooltips: {
                enabled: false
            },
            legend: {
                position: "bottom",
                minSize: {
                    height: 500
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
                labels: [$.i18n("Desktop"), $.i18n("Mobile Phone"), $.i18n("Tablet"), $.i18n("Other")]
            },
            options: options
        });

        

        sum = val.reduce(function(acc, val) { return acc + val; }, 0)

        let srch = [];

        $.each(val, function(index, value) {
            val = value
            lab = chart.data.labels[index]
            per = (val * 100 / sum).toFixed(2) + "%"
            val = value.toLocaleString()
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
        generateTableHead(table, dtx, $.i18n("Number of visits by devices used"));

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

const RANGE = (a,b) => Array.from((function*(x,y){
  while (x <= y) yield x++;
})(a,b));

const jsonTrendGenerate = ( json, day ) => {
    var rows = json["rows"][0];
    
    if (rows != null) {
        $("#trends").remove()
        $("#trends-canvas").append("<canvas id='trends'></canvas>")
        
        arr = rows["data"];
        $cnt = arr.length
        val = arr.slice(0, $cnt/2);
        lval = arr.slice($cnt/2, $cnt);

        $rng = RANGE(1, $cnt/2);
        const granularity = day.replace(/^\w/, c => c.toUpperCase());

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
            plugins: {
                datalabels: {
                    display: false
                }
            },
           
            scales: {
                yAxes: [{/*
                    afterBuildTicks: function(scale) {
                        scale.ticks = updateChartTicks(scale);
                        return;
                    },
                    beforeUpdate: function(oScale) {
                        return;
                    },
                    ticks: {
                        beginAtZero: true,
                        beginAtZero: true,
                        padding: 6,
                        callback: function(value, index, values) {
                            return kFormatter(value);
                        }
                    },*/
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("Numberofvisits")
                    }
                }],
                xAxes: [ {
                  scaleLabel: {
                    display: true,
                    labelString: ($.i18n(granularity) + $.i18n("Dayofselecteddaterange"))
                  }
                }]
            },
            tooltips: {
                mode: "index",
                intersect: false,
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            legend: {
                position: "bottom",
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
        var ctx2 = document.getElementById("trends").getContext("2d");
        var chart2 = new Chart(ctx2, {
            type: "line",
            data: {
                labels: $rng,
                datasets: [{
                    label: $.i18n("CurrentYear"),
                    data: val,
                    backgroundColor: dynamicColors()
                }, {
                    label: $.i18n("PreviousYear"),
                    data: lval,
                    backgroundColor: dynamicColors()
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
            gran = $.i18n(granularity) + " " + cntrx
            cntrx++
            diff = ((( vals - lvals ) / lvals) * 100).toFixed(1) + "%"
            vals = val[index].toLocaleString()
            lvals = lval[index].toLocaleString()
            var obj = {};
            obj[$.i18n("CurrentYear")] = vals;
            obj[$.i18n("PreviousYear")] = lvals;
            obj[$.i18n("Difference")] = lvals;
            obj[granularity]= gran;
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

const jsonUv = json => {
    var rows = json["rows"][0];
    var $uv = $("#uv");
    var $rap = $("#rap");
    var $days = parseInt( $("#numDays").html() );
    var $weeks = parseInt( $("#numWeeks").html() );
    $uv.html("")
    $rap.html("")
    if (rows != null) {
        uv = (rows["data"][0])
        uvDays = parseInt( uv / $days ).toLocaleString();
        uv = parseInt(uv).toLocaleString();
        $uv.prepend("<span class='h1'>" + uvDays +"</span> <strong>" + $.i18n("averageperday") + "</strong></br><span class='small'>" + uv +" "+ $.i18n("total")+"</span>");
        
        rap = (rows["data"][1])
        rapWeeks = parseInt( rap / $weeks ).toLocaleString();
        rap = parseInt(rap).toLocaleString();
        $rap.prepend("<span class='h1'>" + rapWeeks +"</span> <strong>" + $.i18n("averageperweek") + "</strong></br><span class='small'>" + rap +" "+ $.i18n("total")+"</span>");
        
        itemid = (rows["itemId"]);
        console.log(itemid);
        return itemid;
    } else {
        $uv.html("0");
        $rap.html("0");
    }
}

const jsonFile = json => {
    //console.log(json);
}

const getPageTitle = a => Object.keys(a).map( (key, index) => {
    var url = a[key]["value"];
    url = ( url.indexOf("https://") !== -1 ) ? url : "https://" + url;
    if ( url.indexOf("canada.ca") !== -1) {
        let request = new Request(url, { method: "GET" });
        return fetch(request).then(res => res.text()).then(res => $(res).find("h1:first").text()).catch(console.error.bind(console));
    }
});

const getPageH1 = url => {
    url = ( url.indexOf("https://") !== -1 ) ? url : "https://" + url;
    if ( url.indexOf("canada.ca") !== -1) {
        let request = new Request(url, { method: "GET" });
        return fetch(request).then(res => res.text()).then(res => $(res).find("h1:first").text()).catch(console.error.bind(console));
    }
};

const getPage = url => {
    url = ( url.indexOf("https://") !== -1 ) ? url : "https://" + url;
    if ( url.indexOf("canada.ca") !== -1) {
        let request = new Request(url, { method: "GET" });
        return fetch(request).then(res => res.text()).then(res => { var html = { html : res }; return html; }).catch(console.error.bind(console));
    }
};

const jsonPrevious = json => {
    var rows = json["rows"][0];
    var $prev = $("#pp");
    
    if (rows != null) {
        arrayP = json["rows"];
        $prev.html("");
        $prev.append($("<ul>"));
        $prev = $("#pp ul")

        Promise.all( getPageTitle(arrayP) ).then(res => {
            $.each(arrayP, function(index, value) {
                url = value["value"];
                term = (res[index] == null) ? url : res[index];
                val = value["data"][0];
                
                f = (url == "blank page url") ? $.i18n("Directtraffic/Bookmark") : ("<a href='" + url + "'>" + term + "</a>");
                $prev.append($("<li>").append(f));
            });
        }).catch(console.error.bind(console));
        
    } else {
        $prev.html($.i18n("Nodata"));
    }
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

const jsonSnum = (json) => {
    var rows = json["rows"][0];
    var $snum = $("#snum");
    var $days = parseInt( $("#numDays").html() );
    $snum.html("")

    if (rows != null) {
        snum = (rows["data"])
        snumDays = parseInt( snum / $days ).toLocaleString();
        snum = parseInt(snum).toLocaleString();
        $snum.prepend("<span class='h1'>" + snumDays +"</span> <strong>" + $.i18n("averageperday") + "</strong></br><span class='small'>" + snum +" "+ $.i18n("total")+"</span>");
        
        itemid = (rows["itemId"]);
        console.log(itemid);
        return itemid;
    } else {
        var arrayNum = 4;
        var array = new Array(arrayNum);

        $snum.html("0");
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

const jsonSearches = (json) => {
    arrayS = json["rows"];

    $.each(arrayS, function(index, value) {
        $search = $("#search" + index);
        $search.html("");

        search = value["value"];
        searchurl = "https://www.canada.ca/en/revenue-agency/search.html?cdn=canada&st=s&num=10&langs=en&st1rt=1&s5bm3ts21rch=x&q=" + search + "&_charset_=UTF-8&wb-srch-sub=";
        searchv = value["data"][0];

        $search.append("<a href='" + searchurl + "'>" + search + "</a>").append(" (" + searchv.toLocaleString() + ")");
    });
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

            if ( term.includes('.pdf') ) {
                if (term.includes('-lp')) type = "Large Print"
                if (term.includes('-fill-')) type = "Fillable"
                else type = "Flat"
            } else if ( term.includes('.txt') ) type = "E-Text"
            else type = (term.split('/').pop().split('.').pop()).toUpperCase();
            
            var filename = term.split('/').pop();

            srch.push( term );
            srchClick.push( { 'term' : term, 'clicks' : clicks, 'type' : type, 'filename' : filename } );
        });
        
        //console.log(srch)
        //console.log(srchClick)
        
        
//console.log(srchClick.sort(sort_by('type', true, (a) =>  a.toUpperCase())));

$url = "https://www.canada.ca/en/revenue-agency/services/forms-publications/td1-personal-tax-credits-returns/td1-forms-pay-received-on-january-1-later/td1.html";
//        $url = "https://www.canada.ca/en/revenue-agency/services/forms-publications.html";
            
            
            var $str = $url.split('/').pop().split('.').shift();
            //console.log( $str );
        
        var srchP = srch.findReg("^https://www.canada.ca/.*?"+$str+"-(fill-)*([0-9]{1,2})")
        //console.log( srchP );
        
        var $next = $("#np");
        $next.html("");
        $next.append($("<ul class='colcount-sm-2>"));
        $next = $("#np ul")
        
        $.each( srchClick, function(index, value) {
            $.each ( srchP, function(i, v) {
                if ( value['term'] == v) $next.append($('<li>').append(value['filename'] + " (" + value['clicks'].toLocaleString() + ") [<em>" + value['type'] + "</em>]"));
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
        
        Promise.all( [ getPage(url) ] ).then(res => {     
            var $html = res[0].html;
            //console.log( $html );
            $.each(arrayO, function(index, value) {
                text = value["value"];
                outbnd = value["data"][0];
                $outbnd.append($("<li>").append(text + " (" + outbnd.toLocaleString() + ")"));
            });
        });
    } else {
        $outbnd.html("No data");
    }
}

const jsonRT = ( json, day ) => {
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

    } else {
        $ref.html($.i18n("Nodata"));
    }
}

const jsonSearch = ( json, val, title, day ) => {
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
            srch.sort((a, b)=> b.Clicks - a.Clicks);
            let table = document.querySelector("table"+val);
            let data = Object.keys(srch[0]);
            generateTable(table, srch);
            generateTableHead(table, data, title);
        } else {
            $search.html($.i18n("Nodata"));
        }

    } else {
        $search.html($("Nodata"));
    }
}


const jsonSearchesAll = ( json, day ) => {
    
    var title = $.i18n("Searches to page");
    var val = "#srchA";
    jsonSearch(json, val, title, day);

    $(val).trigger("wb-init.wb-tables");
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
  return arr.sort((a, b)=> b.Clicks - a.Clicks);
}

const jsonAM = ( json, day ) => {

   var rows = json["rows"][0];
    var $next = $("#np");

    if (rows != null) {
        var array = json["rows"];
        $next.html("");

        var next = [];

        $.each(array, function(index, value) {
            term = value["value"];
            val = value["data"][day];

            if (term != "(Low Traffic)" && term != "Unspecified" && val != "0") {
                var obj = {};
                obj[$.i18n("LinkText")] = term;
                obj[$.i18n("Clicks")] = val;
                next.push(obj);
            }
        });

        if (next.length != 0) {
            next.sort((a, b)=> b.Clicks - a.Clicks);

            let table = document.querySelector("table#np");
            let data = Object.keys(next[0]);
            generateTable(table, next);
            generateTableHead(table, data, $.i18n("OutboundClicksonPage"));

        } else {
            $next.html($.i18n("Nodata"));
        }
        

    } else {
        $next.html($.i18n("Nodata"));
    }

}

const jsonMetrics = ( json, day ) => {

   var rows = json["summaryData"]["filteredTotals"];

   var $uv = $("#uv");
    var $rap = $("#rap");
    var $days = parseInt( $("#numDays").html() );
    var $weeks = parseFloat( $("#numWeeks").html() );
    var uvNum = 9 + parseInt(day);
    var rapNum = 36 + parseInt(day);

    var desktopNum = 12 + parseInt(day);
    var mobileNum = 15 + parseInt(day);
    var tabletNum = 18 + parseInt(day);
    var otherNum = 21 + parseInt(day);

    $uv.html("")
    $rap.html("")
    if (rows != null) {
        uv = parseInt(rows[uvNum])
        uvDays = parseInt( uv / $days ).toLocaleString();
        uv = parseInt(uv).toLocaleString();
        $uv.prepend("<span class='h1'>" + uvDays +"</span> <strong>"+$.i18n("averageperday")+"</strong></br><span class='small'>" + uv +" "+ $.i18n("total")+"</span>");
        
        rap = parseInt(rows[rapNum])
        if (day == 2) $weeks = 1;
        rapWeeks = parseInt( rap / $weeks ).toLocaleString();
        rap = parseInt(rap).toLocaleString();
        $rap.prepend("<span class='h1'>" + rapWeeks +"</span> <strong>"+$.i18n("averageperweek")+"</strong></br><span class='small'>" + rap +" "+ $.i18n("total")+"</span>");

        desktop = parseInt(rows[desktopNum])
        mobile = parseInt(rows[mobileNum])
        tablet = parseInt(rows[tabletNum])
        other = parseInt(rows[otherNum])

        //console.log ( desktop + " " + mobile + " " + tablet + " " + other );

        var arr  = [ desktop, mobile, tablet, other ];

        jsonPieGenerate( arr );

    } else {
        $uv.html("0");
        $rap.html("0");
    }

   /*
    var $next = $("#np");

    if (rows != null) {
        var array = json["rows"];
        $next.html("");

        var next = [];

        $.each(array, function(index, value) {
            term = value["value"];
            val = value["data"][day];

            if (term != "(Low Traffic)" && term != "Unspecified" && val != "0") {
                next.push({
                    "Link Text": term,
                    Clicks: val
                });
            }
        });

        if (next.length != 0) {

            sortByCol(next);

            let table = document.querySelector("table#np");
            let data = Object.keys(next[0]);
            generateTable(table, next);
            generateTableHead(table, data, "Outbound Clicks on Page");

        } else {
            $next.html("No data");
        }
        

    } else {
        $next.html("No data");
    }

    */

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

const apiCall = (d, i, a, uu, dd) => a.map( type => {
    url = ( type == "fle" ) ? "php/file.php" : "php/process.php"
    
    post = { dates: d, url: i, type: type, oUrl: uu };

    let request = new Request(url, { 
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).then(res => res.json()).then(res => {
        //cnt++; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        //console.log(type);
        //console.log(res);
        switch (type) {
            //case "uvrap" : return jsonUv(res);
            case "fle" : return jsonFile(res);
            case "snm" : return jsonSnum(res);
            case "srch" : return jsonSearches(res);
            case "trnd" : return jsonTrendGenerate(res, "day");
            //case "pltfrm" : return jsonPieGenerate(res);
            case "prvs" : return jsonPrevious(res);
            case "frwrd" : return jsonForward(res);
            case "srchAll" : return jsonSearchesAll(res, dd);
            case "activityMap" : return jsonAM(res, dd);
            case "metrics" : return jsonMetrics(res, dd);
            case "refType" : return jsonRT(res, dd);
            //case "dwnld" : return jsonDownload(res, uu);
            //case "outbnd" : return jsonOutbound(res, uu);
        }
    }).catch(function (err) {
        console.log(type);
        console.log(err.message);
        console.log(err.stack);
    });

});

const apiCall2 = (d, i, a, uu) => a.map( type => {    
    url = "php/process-new.php";
    
    post = { dates: d, url: i, oUrl: uu };

    let request = new Request(url, { 
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).catch(function (err) {
        console.log(err.message);
        console.log(err.stack);
    });

});

$("#urlform").submit(function(event) {
    event.preventDefault();
    url = $("#urlval").val();
    start = $(".dr-date-start").html()
    end = moment();

    

    mainQueue(url, start, end);
});

const removeQueryString = (url) => {
    var a = document.createElement('a'); // dummy element
    a.href = url;   // set full url
    a.search = "";  // blank out query string
    return a.href;
}

const mainQueue = (url, start, end) => {
    url = removeQueryString(url);
    $("#canvas-container").addClass("hidden");
    $("#notfound").addClass("hidden")
    $("#loading").removeClass("hidden");

    $success = 0;
    url = (url.substring(0, 8) == "https://") ? url.substring(8, url.length) : url;

    if (url.substring(0, 4) == "www." && url.substring(url.length - 5, url.length) == ".html") {
        oUrl = "https://" + url;
        url = (url.length > 255) ? url.substring((url.length) - 255, url.length) : url;

        Promise.all( [ getPageH1(oUrl) ] )
        .then(res => { $("#h1title").html(res); } )

        $dd = $("input[name=dd-value").val();
        if (!$dd) $dd=1;

        if (start && end) {
            vStart = start;
            vEnd = end;
        } else {
            var start = moment();
            var vEnd = moment().format("dddd MMMM DD, YYYY");
            if ( $dd == 0 ) vStart = moment(start).subtract(30, 'days').format("dddd MMMM DD, YYYY");
            else if ( $dd == 1 ) vStart = moment(start).subtract(7, 'days').format("dddd MMMM DD, YYYY");
            else if ( $dd == 2 ) vStart = moment(start).subtract(1, 'days').format("dddd MMMM DD, YYYY");
        }
        var start = moment(vStart).format("YYYY-MM-DDTHH:mm:ss.SSS");
        var end = moment(vEnd).format("YYYY-MM-DDTHH:mm:ss.SSS");
        
        var d = [ start, end ];

        console.log( d );
        
        var fromdaterange = moment(vStart).format("dddd MMMM DD, YYYY");
        var todaterange = moment(vEnd).subtract(1, "days").format("dddd MMMM DD, YYYY");
        
        $("#fromdaterange").html("<strong>"+fromdaterange+"</strong>");
        $("#todaterange").html("<strong>"+todaterange+"</strong>");
        
        var start = moment(vStart);
        var end = moment(vEnd);
        
        dDay = end.diff(start, "days");
        dWeek = end.diff(start, "week", true);
        console.log(dWeek);
        /*
        dMonth = end.diff(start, "month", true);
        dQuarter = end.diff(start, "quarter", true);
        dYear = end.diff(start, "year", true);
        */

        $("#numDays").html(dDay);
        $("#numWeeks").html(dWeek);

        $("#searchBttn").prop("disabled",true);

        var dbCall = [ "dbGet" ];
        var match = [ "snm", "trnd", "fle", "srch", "frwrd", "prvs", "srchAll", "activityMap", "refType", "metrics" ];
        //var match = [ "snm", "uvrap" ];
        var previousURL = [];
        var pageURL = [  ]; //, "dwnld", "outbnd" ];
        /*
        let aa = (match.concat(previousURL).concat(pageURL)).length;
        cnt = 0; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        */
        const dbGetMatch= () => { return Promise.all( apiCall2(d, url, dbCall, oUrl, $dd)) }
        const getMatch = () => { return Promise.all( apiCall(d, url, match, oUrl, $dd)) }
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
        
        dbGetMatch().then ( () => getMatch() )
        /*.then( res => { getPreviousPage(res[0]); return res; })
                .then( res => getPageURL(res[1]) ) */
                .then( () => { $("#loading").addClass("hidden"); $("#notfound").addClass("hidden"); $("#canvas-container").removeClass("hidden"); $("#searchBttn").prop("disabled",false); })
                .catch(console.error.bind(console));

        $success = 1;

    }

    if (!$success) { $("#loading").addClass("hidden"); $("#notfound").removeClass("hidden"); }
}