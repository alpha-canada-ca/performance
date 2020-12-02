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

function setQueryParams(url, date) {
    window.history.pushState("Query Parameters", "Addition of Queries", "?url=" + url + "&date=" + date);
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
                    weight: "bold"
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

const RANGE = (a, b) => Array.from((function*(x, y) {
    while (x <= y) yield x++;
})(a, b));

// Return with commas in between
  var numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

const jsonTrendGenerate = (json, day, dates) => {
    var rows = json["rows"][0];

    if (rows != null) {
        $("#trends").remove()
        $("#trends-canvas").append("<canvas id='trends'></canvas>")

        arr = rows["data"];
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

        for (var m = moment(dates[0]); m.isBefore(dates[1]); m.add(1, 'days')) {
            valVar.push( m.format('YYYY-MM-DD'));
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
            plugins: {
                datalabels: {
                    display: false
                }
            },

            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("Numberofvisits")
                    },
                    ticks: {
                        beginAtZero: true,
                        // Return an empty string to draw the tick line but hide the tick label
                        // Return `null` or `undefined` to hide the tick line entirely
                       callback: function(value, index, values) {
                            return Intl.NumberFormat().format((value/1000)) + 'K';
                        }
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: ($.i18n(granularity) + $.i18n("Dayofselecteddaterange"))
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
                labels: valVar,
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
            gran = $.i18n(granularity) + "&nbsp;" + cntrx
            cntrx++
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
            obj[$.i18n(granularity)] = gran;
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
    if (url.indexOf("canada.ca") !== -1) {
        let request = new Request(url, { method: "GET" });
        return fetch(request).then(res => res.text()).then(res => $(res).find("h1:first").text()).catch(console.error.bind(console));
    }
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
        $snum.prepend("<span class='h1'>" + snumDays + "</span> <strong>" + $.i18n("averageperday") + "</strong></br><span class='small'>" + snum + " " + $.i18n("total") + "</span>");

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
    var rows = json["rows"][0];
    val = "#reft";
    title = $.i18n("Referringtypes");
    var $ref = $(val);

    if (rows != null) {
        var array = json["rows"];
        $ref.html("");

        var ref = [];

        $.each(array, function(index, value) {
            term = value["value"];
            clicks = value["data"][day];
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
            obj[$.i18n("Clicks")] = clicks;
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
            $next.html(getTable($pageLength));
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
    var rapNum = 36 + parseInt(day);

    var desktopNum = 12 + parseInt(day);
    var mobileNum = 15 + parseInt(day);
    var tabletNum = 18 + parseInt(day);
    var otherNum = 21 + parseInt(day);

    var findLookingForTotalNum = 45 + parseInt(day);
    var findLookingForNoNum = 48 + parseInt(day);
    var findLookingForYesNum = 51 + parseInt(day);
    var findLookingForInstancesNum = 54 + parseInt(day);

    $uv.html("")
    $visit.html("")
    $pagev.html("")
    $avgtime.html("")

    if (rows != null) {

        uv = parseInt(rows[uvNum])
        uvDays = parseInt(uv / $days).toLocaleString(document.documentElement.lang + "-CA");
        uv = parseInt(uv).toLocaleString(document.documentElement.lang + "-CA");
        //$uv.prepend("<span class='h1'>" + uvDays + "</span> <strong>" + $.i18n("averageperday") + "</strong></br><span class='small'>" + uv + " " + $.i18n("total") + "</span>");
        $uv.prepend("<span class='h2'>" + uvDays + "</span></br><span class='small'>" + uv + " " + $.i18n("total") + "</span>");

        visit = parseInt(rows[vNum])
        vDays = parseInt(visit / $days).toLocaleString(document.documentElement.lang + "-CA");
        visit = parseInt(visit).toLocaleString(document.documentElement.lang + "-CA");
        $visit.prepend("<span class='h2'>" + vDays + "</span></br><span class='small'>" + visit + " " + $.i18n("total") + "</span>");

        pv = parseInt(rows[pvNum])
        pvDays = parseInt(pv / $days).toLocaleString(document.documentElement.lang + "-CA");
        pv = parseInt(pv).toLocaleString(document.documentElement.lang + "-CA");
        $pagev.prepend("<span class='h2'>" + pvDays + "</span></br><span class='small'>" + pv + " " + $.i18n("total") + "</span>");

        atMin = moment.utc(rows[avgtimeNum] * 1000).format('m'); //parseInt(rows[uvNum])
        atSec = moment.utc(rows[avgtimeNum] * 1000).format('ss'); //parseInt(rows[uvNum])
        //uvDays = parseInt( uv / $days ).toLocaleString(document.documentElement.lang+"-CA");
        //uv = parseInt(uv).toLocaleString(document.documentElement.lang+"-CA");
        $avgtime.prepend("<span class='h2'>" + atMin + " min " + atSec + " sec" + "</span>"); //</br><span class'small'>" + $.i18n("hours") + "</span>"); //</br><span class='small'>" + uv +" "+ $.i18n("total")+"</span>");


        if (parseInt(rows[findLookingForInstancesNum]) == NaN || parseInt(rows[findLookingForTotalNum]) == 0) {
            $("#rapCont").html('<p id="rap"></p>');
            rap = parseInt(rows[rapNum])
            if (day == 2) $weeks = 1;
            rapWeeks = parseInt(rap / $weeks).toLocaleString(document.documentElement.lang + "-CA");
            rap = parseInt(rap).toLocaleString(document.documentElement.lang + "-CA");
            $("#rap").prepend("<span class='h1'>" + rapWeeks + "</span> <strong>" + $.i18n("averageperweek") + "</strong></br><span class='small'>" + rap + " " + $.i18n("total") + "</span>");
            $("#fwylfCont").html('<div id="fwylfTable"></div><div id="fwylfReason"></div>');
            $("#rap-container").show();
            $("#fwylf-container").hide();
        } else {
            $("#fwylfCont").html('<div id="fwylfTable"></div><div id="fwylfReason"></div>');
            $("#fwylfTable").html('<table class="table table-striped"><thead><th>' + $.i18n("Yes") + '</th><th>' + $.i18n("No") + '</th></thead><tr><td id="fwylfYes"></td><td id="fwylfNo"></td></tr></table>');
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

    $clicks.html("")
    $imp.html("")
    $ctr.html("")
    $pos.html("")

    if (rows != null) {

        for (let r of rows) {
            clicks = parseInt(r["clicks"]);
            fClicks = nFormatter(clicks, 1); //.toLocaleString(document.documentElement.lang+"-CA");
            $clicks.prepend("<span class='h1'>" + fClicks + "</span>"); //" <strong>Total clicks"+$.i18n("averageperday")+"</strong></br><span class='small'>" + clicks +" "+ $.i18n("total")+"</span>");

            imp = parseInt(r["impressions"])
            fImp = nFormatter(imp, 1);
            $imp.prepend("<span class='h1'>" + fImp + "</span>"); //</br><span class='small'>" + visit +" "+ $.i18n("total")+"</span>");

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
            keys.push(val['keys'][0]);

            var obj = {};
            obj[$.i18n("Day")] = val['keys'][0];
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
                            return Intl.NumberFormat().format((value/1000)) + 'K';
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("Clicks")
                    }
                }, {

                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        beginAtZero: true,
                        callback: function(value, index, values) {
                            return Intl.NumberFormat().format((value/1000)) + 'K';
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: $.i18n("Impressions")
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
                        labelString: $.i18n("Day")
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

const apiCall = (d, i, a, uu, dd, fld) => a.map(type => {
    url = (type == "fle") ? "php/file.php" : "php/process.php"

    post = { dates: d, url: i, type: type, oUrl: uu, field: fld };

    let request = new Request(url, {
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).then(res => res.json()).then(res => {
        //cnt++; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        console.log(type);
        console.log(res);
        switch (type) {
            //case "uvrap" : return jsonUv(res);
            case "fle":
                return jsonFile(res);
            case "snmAll":
                return jsonSnum(res, dd);
            case "srchLeftAll":
                return jsonSearches(res, dd);
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
            case "metrics":
                return jsonMetrics(res, dd);
            case "refType":
                return jsonRT(res, dd);
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
                return jsonGSCTotal(res);
            case 'totalDate':
                return jsonGSCGenerate(res, dd);
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

        var fromdaterange = localLocaleStart.format("dddd MMMM DD, YYYY");
        var todaterange = localLocaleEnd.format("dddd MMMM DD, YYYY");

        $("#fromdaterangegsc").html("<strong>" + fromdaterange + "</strong>");
        $("#todaterangegsc").html("<strong>" + todaterange + "</strong>");

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
            $("#details-panel3-lnk").parent().removeClass("hidden");
        } else {
            $("#bp-content").html("");
            $("#details-panel3-lnk").parent().addClass("hidden");
            if ($("#details-panel3-lnk").parent().hasClass("active")) {
                $("#details-panel3-lnk").parent().removeClass("active");
                $("#details-panel2-lnk").click();
            }
        }

    }).catch(function(err) {
        $("#bp-content").html("");
        $("#details-panel3-lnk").parent().addClass("hidden");
        if ($("#details-panel3-lnk").parent().hasClass("active")) {
            $("#details-panel3-lnk").parent().removeClass("active");
            $("#details-panel2-lnk").click();
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

    mainQueue(url, start, end, 1);
});

$('select#date-range').change(function(){
  url = $("#urlval").val();
    $("#urlStatic").html(url);
    start = $(".dr-date-start").html()
    end = moment();

    mainQueue(url, start, end, 0);
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

const mainQueue = (url, start, end, lang) => {

    url = removeQueryString(url);
    $("#canvas-container").addClass("hidden");
    $("#whole-canvas").addClass("hidden");
    $("#notfound").addClass("hidden")
    $("#loading").removeClass("hidden");

    $success = 0;

    //console.log(url);
    url = (url.substring(0, 8) == "https://") ? url.substring(8, url.length) : url;

    if (url.substring(0, 4) == "www." && url.substring(url.length - 5, url.length) == ".html") {
        oUrl = "https://" + url;
        url = (url.length > 255) ? url.substring((url.length) - 255, url.length) : url;

        moment.locale('en'); // default the locale to Englishy

        $dd = $('#date-range').find(':selected').data('index');
        //$dd = $("input[name=dd-value").val();
        if (!$.isNumeric($dd)) $dd = 1;
        
        if (start && end) {
            vStart = start;
            vEnd = end;
        } else {
            var start = moment();
            var vEnd = moment().format("dddd MMMM DD, YYYY");
            if ($dd == 0) vStart = moment(start).subtract(30, 'days').format("dddd MMMM DD, YYYY");
            else if ($dd == 1) vStart = moment(start).subtract(7, 'days').format("dddd MMMM DD, YYYY");
            else if ($dd == 2) vStart = moment(start).subtract(1, 'days').format("dddd MMMM DD, YYYY");
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
        var match = ["trnd", "fle", "prvs", "srchAll", "snmAll", "srchLeftAll", "activityMap", "refType", "metrics", "fwylf"];
        var gsc = ['cntry', 'qryAll', 'qryMobile', 'qryDesktop', 'qryTablet', 'totals', 'totalDate'];
        //var match = [ "snm", "uvrap" ];
        var previousURL = [];
        var pageURL = []; //, "dwnld", "outbnd" ];
        /*
        let aa = (match.concat(previousURL).concat(pageURL)).length;
        cnt = 0; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        */
        // Get by page data from database, if not pull it
        const dbGetBPMatch = () => {
            url = $("#urlStatic").html();
            oUrl = $("#urlStatic").html();
            return Promise.all(apiCallBP(dateMD, url, dbCall, oUrl))
        }

        const dbGetReadMatch = () => {
            url = $("#urlStatic").html();
            oUrl = $("#urlStatic").html();
            return Promise.all(apiCallRead(d, url, dbCall, oUrl))
        }


        // Get AA data and if it is not in database pull it
        const dbGetMatch = () => {
            $("#loadGSC").addClass("hidden");
            $("#loadAA").removeClass("hidden");
            url = $("#urlStatic").html();
            oUrl = $("#urlStatic").html();
            return Promise.all(apiCall2(d, url, dbCall, oUrl, lang))
        }

        // Get Google Search Console data if it is cached, if not it will query and update database 
        const dbGetGSC = () => {
                $("#loadGSC").removeClass("hidden");
                return Promise.all(apiCallGSC2(d, url, dbCall, oUrl, dDay, lang))
            }
            // pull AA data and display
        const getMatch = () => {
            $("#loadAA").addClass("hidden");
            $("#loadFD").removeClass("hidden");
            url = $("#urlStatic").html();
            oUrl = $("#urlStatic").html();
            return Promise.all(apiCall(d, url, match, oUrl, $dd, "aa"))
        }

        // pull GSC data and display
        const getGSC = () => {
            url = $("#urlStatic").html();
            oUrl = $("#urlStatic").html();
            dd = [$("#fromGSC").text(), $("#toGSC").text()];
            return Promise.all(apiCall(dd, url, gsc, oUrl, $dd, "gsc"))
        }
        const getTitle = h2 => { return Promise.all([getPageH1(h2[0]['url'])]) }
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
            .then(() => getGSC())
            .then(() => dbGetBPMatch())
            //.then(() => dbGetReadMatch())
            /*.then( res => { getPreviousPage(res[0]); return res; })
             */
            .then(() => {
                if (($("#urlStatic").html()).indexOf("/fr/") !== -1) {
                    $("a#h2href").html($.i18n("LanguageToggleFR"));
                } else {
                    $("a#h2href").html($.i18n("LanguageToggleEN"));
                }
                $("#loading").addClass("hidden");
                $("#loadFD").addClass("hidden");
                $("#notfound").addClass("hidden");
                $("#whole-canvas").removeClass("hidden");
                $("#canvas-container").removeClass("hidden");
                $("#searchBttn").prop("disabled", false);
                $('#urlval').val($('#urlStatic').text());
                date = $('#date-range').val();
                setQueryParams(oUrl, date);
            })
            .catch(console.error.bind(console));

        $success = 1;

    }

    if (!$success) {
        $("#loading").addClass("hidden");
        $("#notfound").removeClass("hidden");
    }
}