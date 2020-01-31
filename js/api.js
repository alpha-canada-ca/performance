$(document).ready(function() {
    $("#canvas-container").hide(); $("#loading").hide(); $("#notfound").hide();

    nd = new Date();
    nd.setDate(nd.getDate() - 1);

    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    todaterange = new Date(nd);
    todaterange = todaterange.toLocaleDateString("en-US", options);

    nd.setDate(nd.getDate() - 41);

    fromdaterange = new Date(nd);
    fromdaterange = fromdaterange.toLocaleDateString("en-US", options);

    $("#fromdaterange").html(fromdaterange);
    $("#todaterange").html(todaterange);
});

const kFormatter = (num) => {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
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

const jsonPieGenerate = (json) => {
    console.log(json)
    var rows = json['rows'][0];
    
    if (rows != null) {
        $("#chart").remove()
        $("#chart-canvas").append('<canvas id="chart"></canvas>')
        
        val = rows['data'];

        var data = [{
            data: val,
            backgroundColor: poolColors(2)
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
                    color: 'white',
                    font: {
                        weight: 'bold'
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
        var ctx = document.getElementById("chart").getContext('2d');
        var chart = new Chart(ctx, {
            type: 'pie',
            data: {
                datasets: data,
                labels: ["Mobile", "Desktop"]
            },
            options: options
        });

        pieChartTable(chart.data.labels, val)
        $("#chart-pltfrms").show();
        $("#chrtp").hide();
    } else {
        $("#chart-pltfrms").hide();
        $("#chrtp").show();
    }
}

const jsonTrendGenerate = json => {
    console.log(json);
    var rows = json['rows'][0];
    
    if (rows != null) {
        $("#trends").remove()
        $("#trends-canvas").append('<canvas id="trends"></canvas>')
        
        arr = rows['data'];
        val = arr.slice(0, 6);
        lval = arr.slice(6, 12);

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
                    formatter: (value, ctx) => {
                        return kFormatter(value);
                    },
                    backgroundColor: function(context) {
                        //return context.dataset.backgroundColor;
                        return context.dataset.backgroundColor;
                    },
                    borderRadius: 4,
                    color: 'white',
                    font: {
                        weight: 'bold'
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
                                return 'end'
                            } else if (val > min && val < max) {
                                return 'center';
                            }
                        }

                        return val <= min ? 'start' : 'end';
                    }
                }
            },
            scales: {
                yAxes: [{
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
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of visits'
                    }
                }]
            },
            tooltips: {
                enabled: false
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
        var ctx2 = document.getElementById("trends").getContext('2d');
        var chart2 = new Chart(ctx2, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Current year',
                    data: val,
                    backgroundColor: dynamicColors()
                }, {
                    label: 'Previous year',
                    data: lval,
                    backgroundColor: dynamicColors()
                }],
                labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]
            },
            options: options
        });

        trendChartTable(chart2.data.labels, val, lval)
        
        $("#chart-trnds").show();
        $("#chrtt").hide();
    } else {
        $("#chart-trnds").hide();
        $("#chrtt").show();
    }
}

const jsonUv = json => {
    console.log(json);
    var rows = json['rows'][0];
    var $uv = $("#uv");
    var $rap = $("#rap");
    
    if (rows != null) {
        uv = (rows['data'][0]) / 7 / 6;
        $uv.html(parseInt(uv).toLocaleString());

        rap = (rows['data'][1]) / 7;
        $rap.html(parseInt(rap).toLocaleString());
        
        itemid = (rows['itemId']);
        return itemid;
    } else {
        $uv.html("0");
        $rap.html("0");
    }
}

const jsonFile = json => {
    console.log(json);
}

const getPageTitle = a => Object.keys(a).map( (key, index) => {
    var url = a[key]['value'];
    url = ( url.indexOf("https://") !== -1 ) ? url : "https://" + url;
    if ( url.indexOf("canada.ca") !== -1) {
        let request = new Request(url, { method: 'GET' });
        return fetch(request).then(res => res.text()).then(res => $(res).find('h1:first').text()).catch(console.error.bind(console));
    }
});

const jsonPrevious = json => {
    console.log(json);
    var rows = json['rows'][0];
    var $prev = $("#pp");
    
    if (rows != null) {
        array = json['rows'];
        $prev.html("");
        $prev.append($('<ul>'));
        $prev = $("#pp ul")

        Promise.all( getPageTitle(array) ).then(res => {
            $.each(array, function(index, value) {
                url = value['value'];
                term = (res[index] == null) ? url : res[index];
                val = value['data'][0];
                
                f = (url == "blank page url") ? "Direct traffic / Bookmark" : ("<a href='" + url + "'>" + term + "</a>");
                $prev.append($('<li>').append(f));
            });
        }).catch(console.error.bind(console));
        
    } else {
        $prev.html("No data");
    }
}

const jsonForward = json => {
    console.log(json);
    var rows = json['rows'][0];
    var $next = $("#np");
    
    if (rows != null) {
        array = json['rows'];
        $next.html("");
        $next.append($('<ul>'));
        $next = $("#np ul")

        Promise.all( getPageTitle(array) ).then(res => {
            $.each(array, function(index, value) {
                url = "https://" + value['value'];
                term = (res[index] == null) ? url : res[index];
                val = value['data'][0];

                $next.append($('<li>').append("<a href='" + url + "'>" + term + "</a>"));
            });
        }).catch(console.error.bind(console));
        
    } else {
        $next.html("No data");
    }
}

const jsonSnum = (json) => {
    console.log(json);
    var rows = json['rows'][0];
    var $snum = $("#snum");

    if (rows != null) {
        snum = (rows['data']) / 7 / 6;
        itemid = (rows['itemId']);
        $snum.html(parseInt(snum).toLocaleString());

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
    console.log(json);
    array = json['rows'];

    $.each(array, function(index, value) {
        $search = $("#search" + index);
        $search.html("");

        search = value['value'];
        searchurl = "https://www.canada.ca/en/revenue-agency/search.html?cdn=canada&st=s&num=10&langs=en&st1rt=1&s5bm3ts21rch=x&q=" + search + "&_charset_=UTF-8&wb-srch-sub=";
        searchv = value['data'][0];

        $search.append("<a href='" + searchurl + "'>" + search + "</a>").append(" (" + searchv.toLocaleString() + ")");
    });
}

var cnt = 0;
const apiCall = (i, a, aa) => a.map( type => {
    url = ( type == 'fle' ) ? "php/file.php" : "php/process.php"
    post = { url: i,  type: type };
	let request = new Request(url, { 
		method: 'POST',
		body: $.param(post),
		headers: {
			"Accept": "application/json, text/plain, */*",
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
		}
	});
	return fetch(request).then(res => res.json()).then(res => {
        cnt++; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
		switch (type) {
			case "uvrap" : return jsonUv(res);
			case "fle" : return jsonFile(res);
			case "snm" : return jsonSnum(res);
			case "srch" : return jsonSearches(res);
			case "trnd" : return jsonTrendGenerate(res);
			case "pltfrm" : return jsonPieGenerate(res);
			case "prvs" : return jsonPrevious(res);
			case "frwrd" : return jsonForward(res);
		}
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
        
        $("#searchBttn").prop('disabled',true);

        var match = [ 'snm', 'uvrap', 'pltfrm', 'trnd', 'fle' ];
        var previousURL = [ 'srch', 'frwrd' ];
        var pageURL = [ 'prvs' ];
        let aa = (match.concat(previousURL).concat(pageURL)).length;
        cnt = 0; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");

        const getMatch = () => { return Promise.all( apiCall(url, match, aa) ) }
        const getPreviousPage = id => {
            if (id != null) return Promise.all( apiCall(id, previousURL, aa) );
            else $("#np").html("No data");
        }
        const getPageURL = id => {
            if (id != null) return Promise.all( apiCall(id, pageURL, aa) );
            else $("#pp").html("No data");
        }
        
        getMatch().then( res => { getPreviousPage(res[0]); return res; })
                .then( res => getPageURL(res[1]) )
                .then( () => { $("#loading").hide(); $("#notfound").hide(); $("#canvas-container").show(); $("#searchBttn").prop('disabled',false); })
                .catch(console.error.bind(console));

        $success = 1;

    }

    if (!$success) { $("#loading").hide(); $("#notfound").show(); }
});