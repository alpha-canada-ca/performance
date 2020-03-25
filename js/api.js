$(document).ready(function() {
    $("#canvas-container").hide(); $("#loading").hide(); $("#notfound").hide();

    var dd = new Calendar({
        element: $(".one"),
        earliest_date: "2017-07-01",
        latest_date: moment(self.latest_date),
        start_date: moment(self.latest_date).subtract(6, "week"),
        end_date: moment().subtract(1, "day")
    });
});

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

/*
const pieChartTable = (lab, val) => {
    $.each(lab, function(index, value) {
        $typ = $("#type" + index)
        $typ.html(value);
    });

    $.each(val, function(index, value) {
        $val = $("#percent" + index)
        const arrSum = val => val.reduce((a, b) => a + b, 0)
        per = (value * 100 / arrSum(val)).toFixed(1) + "%";
        $val.html(per);
    });
}

const trendChartTable = (lab, val, lval) => {
    $.each(lab, function(index, value) {
        $lab = $("#lab" + index);
        $lab.html(value);
    });

    $.each(val, function(index, value) {
        $val = $("#val" + index);
        $val.html(value.toLocaleString());
    });

    $.each(lval, function(index, value) {
        $lval = $("#lval" + index);
        $lval.html(value.toLocaleString());
    });
}
*/

/**
 * Generates table head
 *
 * @param      {<type>}  table   The table
 * @param      {<type>}  data    The data
 * @param      {<type>}  title   The title (caption)
 */
function generateTableHead(table, data, title) {
    let cap = (table.createCaption()).innerHTML = title
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
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
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
const jsonPieGenerate = (json) => {
    var rows = json["rows"][0];
    
    if (rows != null) {
        $("#chart").remove()
        $("#chart-canvas").append("<canvas id='chart'></canvas>")
        
        val = rows["data"];
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
            /*
            tooltips: {
                callbacks: {
                  label: function (item, data) { 
                      console.log(data.datasets[item.datasetIndex]);
                    var labels = data.datasets[item.datasetIndex].labels;
                    var values = data.datasets[item.datasetIndex].data;
                    var value = data.datasets[item.datasetIndex].data[item.index];
                    var colour = data.datasets[item.datasetIndex].backgroundColor
                    var total = 0;
                    for (var i in values) {
                      total += values[i];
                   }
                    
                    var totally = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    var label = [];
                    for (var j in labels) {
                        var percentage = Math.round((values[j] / total) * 100);
                      label.push (labels[j] + " : " + values[j].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " (" + percentage + "%)");
                    }       
                    label.push("Total : " + totally)
                    return label;
                  }
                }
              },*/
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
                labels: ["Desktop", "Mobile Phone", "Tablet", "Other"]
            },
            options: options
        });

        //pieChartTable(chart.data.labels, val)

        sum = val.reduce(function(acc, val) { return acc + val; }, 0)

        let srch = [];

        $.each(val, function(index, value) {
            val = value
            lab = chart.data.labels[index]
            per = (val * 100 / sum).toFixed(2) + "%"
            val = value.toLocaleString()

            srch.push({
                "Device Type": lab,
                Visits: val,
                Percent: per
            });
        });

        let table = document.querySelector("table#tbl-pltfrm");
        let dtx = Object.keys(srch[0]);
        table.innerHTML = ""
        generateTableHead(table, dtx, "Number of visits by devices used");
        generateTable(table, srch);

        $("#chart-pltfrms").show();
        $("#chrtp").hide();
    } else {
        $("#chart-pltfrms").hide();
        $("#chrtp").show();
    }
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
            /*
            plugins: {
                datalabels: {
                    formatter: (value, ctx) => {
                        return kFormatter(value);
                    },
                    backgroundColor: function(context) {
                        return context.dataset.backgroundColor;
                    },
                    borderRadius: 4,
                    color: "white",
                    font: {
                        weight: "bold"
                    },
                    align: function(ctx) {
                        var idx = ctx.dataIndex;
                        var val = ctx.dataset.data[idx];
                        var datasets = ctx.chart.data.datasets;
                        var min = val;
                        var max = val;
                        var i, ilen, ival;

                        for (i = 0, ilen = datasets.length; i < ilen; ++i) {
                            if (i === ctx.datasetIndex) {
                                continue;
                            }

                            ival = datasets[i].data[idx];
                            min = Math.min(min, ival);
                            max = Math.max(max, ival);

                            maxMed = max / 2
                            if (val < maxMed) {
                                return "end"
                            } else if (val > min && val < max) {
                                return "center";
                            }
                        }

                        return val <= min ? "start" : "end";
                    }
                }
            },
            * */
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
                        labelString: "Number of visits"
                    }
                }],
                xAxes: [ {
                  scaleLabel: {
                    display: true,
                    labelString: (granularity + " of selected date range")
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
                    label: "Current year",
                    data: val,
                    backgroundColor: dynamicColors()
                }, {
                    label: "Previous year",
                    data: lval,
                    backgroundColor: dynamicColors()
                }]
            },
            options: options
        });

        //trendChartTable(chart2.data.labels, val, lval)

        let srch = [];
        var cntrx = 1

        $.each(val, function(index, value) {
            vals = val[index]
            lvals = lval[index]
            lab = chart2.data.labels[index]
            gran = granularity + " " + cntrx
            cntrx++
            diff = ((( vals - lvals ) / lvals) * 100).toFixed(1) + "%"
            vals = val[index].toLocaleString()
            lvals = lval[index].toLocaleString()

            srch.push({
                [granularity]: gran,
                "Current Year": vals,
                "Previous Year": lvals,
                "Difference": diff
            });
        });

        let table = document.querySelector("table#tbl-trnds");
        let dtx = Object.keys(srch[0]);
        table.innerHTML = ""
        generateTableHead(table, dtx, "Visits trend by current year and previous year");
        generateTable(table, srch);
        
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
        $uv.prepend("<span class='h1'>" + uvDays +"</span> <strong>per day</strong></br><span class='small'>" + uv +" total</span>");
        
        rap = (rows["data"][1])
        rapWeeks = parseInt( rap / $weeks ).toLocaleString();
        rap = parseInt(rap).toLocaleString();
        $rap.prepend("<span class='h1'>" + rapWeeks +"</span> <strong>per week</strong></br><span class='small'>" + rap +" total</span>");
        
        itemid = (rows["itemId"]);
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

const getPageH1 = html => {
    var $html = html[0].html;
    $html = $html.substr($html.indexOf("<h1"), $html.length);
    $html = $html.substr(0, $html.indexOf("</h1>"));
    return $html;
}

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
                
                f = (url == "blank page url") ? "Direct traffic / Bookmark" : ("<a href='" + url + "'>" + term + "</a>");
                $prev.append($("<li>").append(f));
            });
        }).catch(console.error.bind(console));
        
    } else {
        $prev.html("No data");
    }
}

const jsonForward = json => {
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
        $snum.prepend("<span class='h1'>" + snumDays +"</span> <strong>per day</strong></br><span class='small'>" + snum +" total</span>");
        
        itemid = (rows["itemId"]);

        return itemid;
    } else {
        var arrayNum = 4;
        var array = new Array(arrayNum);

        $snum.html("0");
        $search = $("#search0");
        $search.html("No data");
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
        $dwnld.html("No data");
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

const jsonSearch = ( json, val, title ) => {
    var rows = json["rows"][0];
    var $search = $(val);

    if (rows != null) {
        var array = json["rows"];
        $search.html("");

        var srch = [];

        $.each(array, function(index, value) {
            term = value["value"];
            pos = value["data"][0];
            imp = value["data"][1];
            clicks = value["data"][2];
            ctr = (clicks * 100 / imp).toFixed(1) + "%"
            
            pos = pos.toFixed(1);
            imp = imp.toLocaleString();
            clicks = clicks.toLocaleString();

            if (pos != "NaN" && term != "(Low Traffic)" && term != "Unspecified") {
                srch.push({
                    Term: term,
                    Position: pos,
                    Impressions: imp,
                    Clicks: clicks,
                    "Click Through Rate (CTR)": ctr
                });
            }
        });

        let table = document.querySelector("table"+val);
        let data = Object.keys(srch[0]);
        generateTableHead(table, data, title);
        generateTable(table, srch);


    } else {
        $search.html("No data");
    }
}


const jsonSearchesInstitution = json => {
    var title = "Contextual searches to page";
    var val = "#srchI";
    jsonSearch(json, val, title);
}

const jsonSearchesGlobal = json => {
   var title = "Global searches to page";
   var val = "#srchG";
   jsonSearch(json, val, title);
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

var cnt = 0;
const apiCall = (d, i, a, aa, uu) => a.map( type => {
    url = ( type == "fle" ) ? "php/file.php" : "php/process.php"

    if ( type == "trnd") {
        day = parseInt( $("#numDays").html() );
        if ( day <= 31 ) {
            day = "day"
        } else if ( day > 31 && day <= 105 ) {
            day = "week"
        } else if ( day > 105 && day <= 365 ) {
            day = "month"
        } else {
            day = "year"
        }

        d.push( day );
    }
    
    post = { dates: d, url: i, type: type };

    let request = new Request(url, { 
        method: "POST",
        body: JSON.stringify(post)
    });

    return fetch(request).then(res => res.json()).then(res => {
        cnt++; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        //console.log(type);
        //console.log(res);
        switch (type) {
            case "uvrap" : return jsonUv(res);
            case "fle" : return jsonFile(res);
            case "snm" : return jsonSnum(res);
            case "srch" : return jsonSearches(res);
            case "trnd" : return jsonTrendGenerate(res, day);
            case "pltfrm" : return jsonPieGenerate(res);
            case "prvs" : return jsonPrevious(res);
            case "frwrd" : return jsonForward(res);
            case "srchI" : return jsonSearchesInstitution(res);
            case "srchG" : return jsonSearchesGlobal(res);
            //case "dwnld" : return jsonDownload(res, uu);
            //case "outbnd" : return jsonOutbound(res, uu);
        }
    }).catch(function (err) {
        console.log(type);
        console.log(err.message);
        console.log(err.stack);
    });

});

$("#urlform").submit(function(event) {
    event.preventDefault();

    $("#canvas-container").hide();
    $("#notfound").hide()
    $("#loading").show();

    $success = 0;

    var url = $("#urlval").val();

    url = (url.substring(0, 8) == "https://") ? url.substring(8, url.length) : url;

    if (url.substring(0, 4) == "www." && url.substring(url.length - 5, url.length) == ".html") {
        url = (url.length > 255) ? url.substring((url.length) - 255, url.length) : url;
        vStart = $(".dr-date-start").html();
        vEnd = $(".dr-date-end").html();

        var start = moment(vStart, "MMMM DD, YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS");
        var end = moment(vEnd, "MMMM DD, YYYY").add(1, "day").format("YYYY-MM-DDTHH:mm:ss.SSS");
        var d = [ start, end ]
        
        var fromdaterange = moment(vStart, "MMMM DD, YYYY").format("dddd MMMM DD, YYYY");
        var todaterange = moment(vEnd, "MMMM DD, YYYY").format("dddd MMMM DD, YYYY");
        
        $("#fromdaterange").html(fromdaterange);
        $("#todaterange").html(todaterange);
        
        var start = moment(vStart, "MMMM DD, YYYY");
        var end = moment(vEnd, "MMMM DD, YYYY").add(1, "day");
        
        dDay = end.diff(start, "days");
        dWeek = end.diff(start, "week", true);
        dMonth = end.diff(start, "month", true);
        dQuarter = end.diff(start, "quarter", true);
        dYear = end.diff(start, "year", true);
        
        $("#numDays").html(dDay);
        $("#numWeeks").html(dWeek);

        $("#searchBttn").prop("disabled",true);

        var match = [ "snm", "uvrap", "pltfrm", "trnd", "fle" ];
        //var match = [ "snm", "uvrap" ];
        var previousURL = [ "srch", "frwrd", "srchI", "srchG" ];
        var pageURL = [ "prvs" ]; //, "dwnld", "outbnd" ];
        let aa = (match.concat(previousURL).concat(pageURL)).length;
        cnt = 0; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");

        const getMatch = () => { return Promise.all( apiCall(d, url, match, aa, url)) }
        const getPreviousPage = id => {
            if (id != null) return Promise.all( apiCall(d, id, previousURL, aa, url));
            else $("#np").html("No data");
        }
        const getPageURL = id => {
            if (id != null) return Promise.all( apiCall(d, id, pageURL, aa, url));
            else $("#pp").html("No data");
        }
        
        getMatch().then( res => { getPreviousPage(res[0]); return res; })
                .then( res => getPageURL(res[1]) )
                .then( () => { $("#loading").hide(); $("#notfound").hide(); $("#canvas-container").show(); $("#searchBttn").prop("disabled",false); })
                .catch(console.error.bind(console));

        $success = 1;

    }

    if (!$success) { $("#loading").hide(); $("#notfound").show(); }
});
