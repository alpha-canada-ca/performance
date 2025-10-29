function handleDateRangeSetup(start, end) {
  const aDayAgo = new Date();
  // Subtract one day to get the previous day
  aDayAgo.setDate(aDayAgo.getDate() - 1);
  const currentDate = aDayAgo.toISOString().split("T")[0];

  // Set max dates for start and end
  $("#startdate, #enddate").attr("max", currentDate);

  // Calculate three years ago
  const threeYearsAgo = new Date();
  threeYearsAgo.setDate(threeYearsAgo.getDate() - 1);
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const formattedThreeYearsAgo = threeYearsAgo.toISOString().slice(0, 10);

  // Set the minimum date for start and end
  $("#startdate, #enddate").attr("min", formattedThreeYearsAgo);

  $("#startdate").on("input", function () {
    $("#enddate").attr("min", $(this).val());
  });

  $("#enddate").on("input", function () {
    $("#startdate").attr("max", $(this).val());
  });

  // If start and end dates are provided
  if (start && end) {
    $("#startdate").val(start);
    $("#enddate").val(end);
    $("#enddate").attr("min", start);
    $("#startdate").attr("max", end);
  }
}

$(document).ready(function () {
  handleDateRangeSetup();
});

$(document).on("wb-ready.wb", function () {
  const params = getQueryParams();
  $.i18n()
    .load({
      en: "./assets/js/i18n/en.json",
      fr: "./assets/js/i18n/fr.json",
    })
    .done(function () {
      $("html").i18n();
      $(".app-name").addClass("hidden");
      $("#allspan").removeClass("hidden");

      tippy("[data-template]", {
        content(reference) {
          const id = reference.getAttribute("data-template");
          const template = $.i18n(id);
          return template;
        },
        allowHTML: true,
      });

      var [start, end] = getSpecifiedParams(params, ["start", "end"]);
      if (start && end) {
        handleDateRangeSetup(start, end);
      }
    });

  var [url, date, start, end] = getSpecifiedParams(params, [
    "url",
    "date",
    "start",
    "end",
  ]);

  if (start && end) {
    start = moment(start).format("MMMM D, YYYY");
    end = moment(end).format("MMMM D, YYYY");
    $(".dr-date-start").html(start);
    $(".dr-date-end").html(end);
  }

  if (url) {
    $("#urlval").val(url);
    if ($.isNumeric(date)) {
      $("#date-range").val(date).change();
    }

    mainQueue(url, start, end, 0);
  }
});

function getQueryParams() {
  return window.location.search
    .slice(1)
    .split("&")
    .reduce((acc, item) => {
      const [key, value] = item.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function extractJSON(obj, indent) {
  var isError = false;
  for (const i in obj) {
    if (Array.isArray(obj[i]) || typeof obj[i] === "object") {
      console.log(indent + i + " is array or object");
      isError = extractJSON(obj[i], indent + " > " + i + " > ");
      if (i === "error") {
        isError = true;
        console.log(isError);
      }
    } else {
      console.log(indent + i + ": " + obj[i]);
      if (i === "error") {
        isError = true;
        $("#errorHeader").html(obj[i]);
        console.log(isError);
      } else if (i === "message") {
        isError = true;
        $("#errorDetails").html(obj[i]);
        console.log(isError);
      }
    }
  }
  return isError;
}

function setQueryParams(url, start, end) {
  window.history.pushState(
    "Query Parameters",
    "Addition of Queries",
    `?url=${url}&start=${start}&end=${end}&lang=${document.documentElement.lang}`
  );
}

function getSpecifiedParams(object, keys) {
  return keys.map((key) => object[key]);
}

const kFormatter = (num) =>
  num > 999
    ? `${Math.sign(num) * (Math.abs(num) / 1000).toFixed(1)}k`
    : `${Math.sign(num) * Math.abs(num)}`;

const dynamicColors = () =>
  `rgba(${[...Array(3)]
    .map(() => Math.floor(Math.random() * 200))
    .join(",")}, 0.7)`;

const poolColors = (num) => Array.from({ length: num }, dynamicColors);

function isInt(value) {
  return Number.isInteger(parseFloat(value));
}

function generateTableHead(table, data, title) {
  const caption = table.createCaption();
  caption.innerHTML = `<div class='wb-inv'>${title}</div>`;
  const thead = table.createTHead();
  const row = thead.insertRow();
  for (const key of data) {
    const th = document.createElement("th");
    th.setAttribute("scope", "col");
    th.appendChild(document.createTextNode(key));
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (const element of data) {
    const row = table.insertRow();
    for (const key in element) {
      const cell = row.insertCell();
      cell.innerHTML = element[key].toLocaleString(
        document.documentElement.lang + "-CA"
      );
    }
  }
}

const jsonPieGenerate = (arr) => {
  $("#chart").remove();
  $("#chart-canvas").append("<canvas id='chart'></canvas>");

  val = arr;
  cnt = val.length;

  let datas = [];

  sum = val.reduce(function (acc, val) {
    return acc + val;
  }, 0);

  for (i = 0; i < val.length; i++) {
    value = val[i];
    per = parseFloat(((value * 100) / sum).toFixed(0)); //.toLocaleString(document.documentElement.lang + "-CA")

    datas.push(per);
  }

  bgColor = ["#56B4E9", "#009E73", "#0072B2", "#000000"];

  /*
    const formatter = (value, ctx) => {
        let total = 0;
        let dataArr = ctx.chart.data.datasets[0].data;
        dataArr.map(data => {
            total += data;
        });

        if (document.documentElement.lang == "fr") {
            return parseFloat( (value / total * 100).toFixed(1) ).toLocaleString(document.documentElement.lang + "-CA") + " %";
        } else {
            return parseFloat( (value / total * 100).toFixed(1) ).toLocaleString(document.documentElement.lang + "-CA") + "%";
        }
    };
    */

  var data = [
    {
      data: datas,
      backgroundColor: bgColor,
    },
  ];

  var options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      beforeInit: (chart, options) => {
        Chart.Legend.afterFit = function () {
          this.height = this.height + 50;
        };
      },
      datalabels: {
        //formatter: formatter,
        backgroundColor: function (context) {
          return context.dataset.backgroundColor;
        },
        borderRadius: 4,
        color: "white",
        font: {
          weight: "bold",
          size: 18,
        },
      },
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            fontSize: 18,
          },
          scaleLabel: {
            display: true,
            labelString: $.i18n("DeviceType"),
            fontSize: 18,
          },
        },
      ],
      yAxes: [
        {
          /*gridLines: {
                    display:false
                },*/
          ticks: {
            fontSize: 18,
            beginAtZero: true,
            // Return an empty string to draw the tick line but hide the tick label
            // Return `null` or `undefined` to hide the tick line entirely

            /*callback: function(value, index, values) {
                        return Intl.NumberFormat().format((value/1000));
                    }*/

            callback: function (value) {
              if (document.documentElement.lang == "fr") {
                return value.toFixed(0) + " %"; // convert it to percentage
              } else {
                return value.toFixed(0) + "%"; // convert it to percentage
              }
            },
            min: 0,
            max: 100,
            step: 10,
          },
          scaleLabel: {
            display: true,
            labelString: $.i18n("Percentageofvisits"),
            fontSize: 18,
          },
        },
      ],
    },
    tooltips: "false",
    /*
        {
            mode: 'index',
            titleFontSize: 18,
            bodyFontSize: 16,
            callbacks: {
                label: function(tooltipItem, data) { 
                    var indice = tooltipItem.index;                 
                    return  data.labels[indice] +': '+ (data.datasets[0].data[indice]).toLocaleString() + ' visits';
                }
            }
        },*/
    legend: {
      /*
            position: "bottom",
            minSize: {
                height: 500
            },
            labels: {
                fontSize: 18
            }*/
      display: false,
    },
    layout: {
      padding: {
        top: 25,
      },
    },
  };
  var ctx = document.getElementById("chart").getContext("2d");
  var chart = new Chart(ctx, {
    type: "bar",
    data: {
      datasets: data,
      labels: [
        $.i18n("Desktop"),
        $.i18n("MobilePhone"),
        $.i18n("Tablet"),
        $.i18n("Other"),
      ],
    },
    options: options,
  });

  let srch = [];

  for (i = 0; i < val.length; i++) {
    value = val[i];

    lab = chart.data.labels[i];
    per = parseFloat(((value * 100) / sum).toFixed(2)).toLocaleString(
      document.documentElement.lang + "-CA"
    );
    if (document.documentElement.lang == "fr") {
      var end = "&nbsp;%";
    } else {
      var end = "%";
    }
    per = per + end;
    vals = value.toLocaleString(document.documentElement.lang + "-CA");
    var obj = {};
    obj[$.i18n("DeviceType")] = lab;
    obj[$.i18n("Visits")] = vals;
    obj[$.i18n("Percent")] = per;
    srch.push(obj);
  }

  let table = document.querySelector("table#tbl-pltfrm");
  let dtx = Object.keys(srch[0]);
  table.innerHTML = "";
  generateTable(table, srch);
  generateTableHead(
    table,
    dtx,
    $.i18n("Percentage (%) of visits by device used")
  );

  $("#chart-pltfrms").show();
  $("#chrtp").hide();
};

/**
 * Gets the range between two numbers
 *
 * @class      RANGE asd
 * @param      {<type>}  a       { parameter_description }
 * @param      {<type>}  b       { parameter_description }
 * @return     {<type>}  { description_of_the_return_value }
 */

const RANGE = (a, b) =>
  Array.from(
    (function* (x, y) {
      while (x <= y) yield x++;
    })(a, b)
  );

// Return with commas in between
var numberWithCommas = function (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Daily visits table
// dates[0] = start date, dates[1] = end date, oRange = number of days in the range
const jsonTrendGenerate = (json, dates, oRange) => {
  // convert dates[1] from format '2023-06-08' into format 'June 8, 2023'
  var datesEndReformat = moment(dates[1]).format("MMM D, YYYY");
  console.log("dates[1] is " + dates[1]);
  console.log("datesEndReformat is " + datesEndReformat);

  // the day before datesEndReformat
  var datesEndReformatPrev = moment(dates[1]).subtract(1, "days");
  datesEndReformatPrev = moment(datesEndReformatPrev).format("MMM D, YYYY");
  console.log("datesEndReformatPrev is " + datesEndReformatPrev);

  // add 1 day to dates[1]
  // this fixes a bug where the enddate is labelled as undefined in 'Visits for current year and previous year - Table'
  dates[1] = moment(dates[1]).add(1, "days").format("YYYY-MM-DD");

  var rows = json["rows"];

  // loop thru each row in rows
  $endDateIndex = 0;
  for (let i = 0; i < rows.length; i++) {
    if (datesEndReformatPrev == rows[i]["value"]) {
      // find the index of the day before the end date in the json
      // this is a workaround for a bug where the api returns days up to the day before the end date, but not including the end date in the res variable
      // this usually happens if the end date is today and the date range is large
      // such as https://www.canada.ca/en/services/benefits/publicpensions.html, 2022-02-08 to 2023-07-04
      // the daily visits graph will return values: start date - day before end date
      $endDateIndex = i;
    }

    if (datesEndReformat == rows[i]["value"]) {
      // find the index of the end date in the json
      $endDateIndex = i;
      break;
    }
  }

  console.log("endDateIndex is " + $endDateIndex);

  if (rows != null) {
    $("#trends").remove();
    $("#trends-canvas").append("<canvas id='trends'></canvas>");

    var keys = Object.keys(rows);
    var arr = []; // arr is an array that contains both the current and previous year data, plus garbage data for days that fall just outside the user's range
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      arr.push(rows[key]["data"]);
      // console.log("pushed " + rows[key]["data"]);
    }

    $cnt = arr.length;
    console.log("cnt is " + $cnt);
    console.log("arr is " + arr);

    val = arr.slice(0, $endDateIndex + 1); // current year data: start of the array - the end date index
    val = val.slice(-oRange); // current year data: the last oRange elements of val
    lval = arr.slice(-oRange); // previous year data: the last oRange elements of arr

    console.log("val after " + val);
    console.log("lval after " + lval);

    $cnt = val.length;

    var valVar = [];
    var valVarLong = [];

    for (var m = moment(dates[0]); m.isBefore(dates[1]); m.add(1, "days")) {
      valVar.push(m.locale(document.documentElement.lang).format("MMM-DD"));

      // if English language is selected
      if (document.documentElement.lang == "en") {
        valVarLong.push(
          m.locale(document.documentElement.lang).format("MMMM DD, YYYY")
        );
      }
      // else if French language is selected
      else {
        valVarLong.push(
          m.locale(document.documentElement.lang).format("DD MMMM YYYY")
        );
      }
    }

    //console.log(val)

    $rng = RANGE(1, $cnt);
    console.log($rng);
    var dd = "day";
    const granularity = dd.replace(/^\w/, (c) => c.toUpperCase());

    //console.log($rng);

    var updateChartTicks = function (scale) {
      var incrementAmount = 0;
      var previousAmount = 0;
      var newTicks = [];
      newTicks = scale.ticks;
      for (x = 0; x < newTicks.length; x++) {
        incrementAmount = previousAmount - newTicks[x];
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
          display: false,
        },
      },

      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: $.i18n("Numberofvisits"),
              fontSize: 18,
            },
            ticks: {
              beginAtZero: true,
              // Return an empty string to draw the tick line but hide the tick label
              // Return `null` or `undefined` to hide the tick line entirely
              callback: function (value, index, values) {
                return Intl.NumberFormat().format(value / 1000);
              },
              fontSize: 18,
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: $.i18n("Day"),
              fontSize: 18,
            },
            gridLines: {
              display: false,
            },
            ticks: {
              fontSize: 18,
            },
          },
        ],
      },
      tooltips: "false",
      /*{
                mode: "index",
                intersect: false,
                titleFontSize: 18,
                bodyFontSize: 16,
                callbacks: {
                    label: function(tooltipItem, data) { 
                      return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel) + ' visits';
                    }
                }
            },*/
      hover: {
        mode: "nearest",
        intersect: true,
      },
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          fontSize: 18,
        },
      },
      layout: {
        padding: {
          top: 25,
        },
      },
    };
    var ctx2 = document.getElementById("trends").getContext("2d");
    var chart2 = new Chart(ctx2, {
      type: "line",
      data: {
        labels: valVar,
        datasets: [
          // the current year graph
          {
            label: $.i18n("CurrentYear"),
            data: val,
            borderColor: "#56B4E9",
            backgroundColor: "#56B4E9",
            fill: false,
          },
          // the previous year graph
          /* {
            label: $.i18n("PreviousYear"),
            data: lval,
            borderColor: "#009E73",
            backgroundColor: "#009E73",
            fill: false,
          },*/
        ],
      },
      options: options,
    });

    let srch = [];
    var cntrx = 1;

    $.each(val, function (index, value) {
      vals = val[index];
      lvals = lval[index];
      lab = chart2.data.labels[index];
      /*
            gran = $.i18n(granularity) + "&nbsp;" + cntrx
            cntrx++
            */
      diff = (((vals - lvals) / lvals) * 100).toFixed(1);
      if (diff == "Infinity") diff = $.i18n("NotAvailable");
      else if (document.documentElement.lang == "fr") {
        diff =
          parseFloat(diff).toLocaleString(
            document.documentElement.lang + "-CA"
          ) + "&nbsp;%";
      } else {
        diff = parseFloat(diff) + "%";
      }
      vals = val[index].toLocaleString(document.documentElement.lang + "-CA");
      lvals = lval[index].toLocaleString(document.documentElement.lang + "-CA");
      var obj = {};
      obj[$.i18n(granularity)] = valVarLong[index];
      obj[$.i18n("CurrentYear")] = vals; // the current year visits column in the table
      // obj[$.i18n("PreviousYear")] = lvals; // the previous year visits column in the table
      // obj[$.i18n("Difference")] = diff; // the difference column in the table
      srch.push(obj);
    });

    let table = document.querySelector("table#tbl-trnds");
    let dtx = Object.keys(srch[0]);
    table.innerHTML = "";
    generateTable(table, srch);
    generateTableHead(
      table,
      dtx,
      $.i18n("Visitstrendbycurrentyearandpreviousyear")
    );

    $("#chart-trnds").show();
    $("#chrtt").hide();
  } else {
    $("#chart-trnds").hide();
    $("#chrtt").show();
  }
};

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

const jsonFile = (json) => {
  //console.log(json);
};

const getPageTitle = (a) =>
  Object.keys(a).map((key, index) => {
    var url = a[key]["value"];
    url = url.indexOf("https://") !== -1 ? url : "https://" + url;
    // if url contains "canada.ca"
    if (url.indexOf("canada.ca") !== -1) {
      let request = new Request(url, { method: "GET" }); // create a new request object as a GET request to url
      return fetch(request)
        .then((res) => res.text()) // fetch the contents of the url
        .then((res) => $(res).find("h1:first").text()) // extracts the text of the first h1 tag on that url page
        .catch(console.error.bind(console)); // log any errors to the console
    }
  });

const getPageH1 = (url) => {
  console.log("1: " + url);
  url = url.indexOf("https://") !== -1 ? url : "https://" + url;
  //if (url.indexOf("canada.ca") !== -1) {
  let request = new Request(url, { method: "GET" });
  return fetch(request)
    .then((res) => res.text())
    //.then((res) => $(res).find("h1:first").text())
    .then((res) => {
      const h1Text = $(res).find("h1:first").text();
      return h1Text ? h1Text : "";
    })
    .catch(console.error.bind(console));
  //}
};

const getPage = (url) => {
  url = url.indexOf("https://") !== -1 ? url : "https://" + url;
  // if url contains "canada.ca"
  if (url.indexOf("canada.ca") !== -1) {
    let request = new Request(url, { method: "GET" });
    return fetch(request)
      .then((res) => res.text())
      .then((res) => {
        var html = { html: res };
        return html;
      })
      .catch(console.error.bind(console));
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

    $.each(arrayP, function (index, value) {
      url = value["value"];
      term = url;
      clicks = value["data"][day];
      f =
        url == "blank page url"
          ? $.i18n("Directtraffic/Bookmark")
          : "<a href='https://" + url + "'>" + term + "</a>";

      var obj = {};
      obj[$.i18n("PreviouspageURL")] = f;
      obj[$.i18n("Visits")] = clicks;
      ref.push(obj);
    });

    if (ref.length != 0) {
      //res.sort((a, b)=> b[$.i18n("Visits")] - a[$.i18n("Visits")]);

      $(val).html(getTable(10, "false")); // by default, show 10 rows per page
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
};

const jsonForward = (json) => {
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
};

const jsonSnum = (json, day) => {
  var rows = json["rows"][0];
  var $snum = $("#snum");
  var $days = parseInt($("#numDays").html());
  $snum.html("");

  if (rows != null) {
    snum = rows["data"][day];
    snumDays = parseInt(snum / $days).toLocaleString(
      document.documentElement.lang + "-CA"
    );
    snum = parseInt(snum).toLocaleString(document.documentElement.lang + "-CA");
    if (day == 2) {
      $snum.prepend(
        "<span class='h1'>" +
          snum +
          "</span> <strong>" +
          $.i18n("total") +
          "</strong>"
      );
    } else {
      $snum.prepend(
        "<span class='h1'>" +
          snumDays +
          "</span> <strong>" +
          $.i18n("averageperday") +
          "</strong></br><span class='small'>" +
          snum +
          " " +
          $.i18n("total") +
          "</span>"
      );
    }

    itemid = rows["itemId"];
    //console.log(itemid);
    return itemid;
  } else {
    $snum.html($.i18n("Nodata"));
  }
};

const jsonSearches = (json, day) => {
  var rows = json["rows"][0];

  if (rows != null) {
    var array = json["rows"];

    var searcha = [];

    $.each(array, function (index, value) {
      search = value["value"];
      searchurl =
        "https://www.canada.ca/en/revenue-agency/search.html?cdn=canada&st=s&num=10&langs=en&st1rt=1&s5bm3ts21rch=x&q=" +
        search +
        "&_charset_=UTF-8&wb-srch-sub=";
      searchv = value["data"][day];

      if (searchv != "0") {
        searcha.push({
          Term: search,
          url: searchurl,
          Clicks: searchv,
        });
      }
    });

    if (searcha.length != 0) {
      searcha.sort((a, b) => b.Clicks - a.Clicks);

      $.each(searcha, function (index, value) {
        $search = "#search" + index;
        $searchhtml = $($search);
        $searchhtml.html("");

        $($search)
          .append("<a href='" + value.url + "'>" + value.Term + "</a>")
          .append(
            " (" +
              value.Clicks.toLocaleString(
                document.documentElement.lang + "-CA"
              ) +
              ")"
          );
      });
    }
  } else {
    var arrayNum = 4;
    var array = new Array(arrayNum);

    $search = $("#search0");
    $search.html($.i18n("Nodata"));
    $.each(array, function (index, value) {
      if (index != 0) {
        $search = $("#search" + index);
        $search.html("");
      }
    });
  }
};

const jsonDownload = (json) => {
  var rows = json["rows"][0];
  $dwnld = $("#dwnld");

  if (rows != null) {
    var arrayO = json["rows"];
    $dwnld.html("");
    $dwnld.append($("<ul class='colcount-sm-2'>"));
    $dwnld = $("#dwnld ul");

    /*
        $.each(arrayO, function(index, value) {
            text = value["value"];
            dwnld = value["data"][0];
            $dwnld.append($("<li>").append(text + " (" + dwnld.toLocaleString() + ")"));
        });
        */

    var srch = [];
    var srchClick = [];

    $.each(arrayO, function (index, value) {
      var term = value["value"];
      var clicks = value["data"][0];

      if (term.includes(".pdf")) {
        if (term.includes("-lp")) type = "Large Print";
        if (term.includes("-fill-")) type = "Fillable";
        else type = "Flat";
      } else if (term.includes(".txt")) type = "E-Text";
      else type = term.split("/").pop().split(".").pop().toUpperCase();

      var filename = term.split("/").pop();

      srch.push(term);
      srchClick.push({
        term: term,
        clicks: clicks,
        type: type,
        filename: filename,
      });
    });

    //console.log(srch)
    //console.log(srchClick)

    //console.log(srchClick.sort(sort_by('type', true, (a) =>  a.toUpperCase())));

    $url =
      "https://www.canada.ca/en/revenue-agency/services/forms-publications/td1-personal-tax-credits-returns/td1-forms-pay-received-on-january-1-later/td1.html";
    //        $url = "https://www.canada.ca/en/revenue-agency/services/forms-publications.html";

    var $str = $url.split("/").pop().split(".").shift();
    //console.log( $str );

    var srchP = srch.findReg(
      "^https://www.canada.ca/.*?" + $str + "-(fill-)*([0-9]{1,2})"
    );
    //console.log( srchP );

    var $next = $("#np");
    $next.html("");
    $next.append($("<ul class='colcount-sm-2>"));
    $next = $("#np ul");

    $.each(srchClick, function (index, value) {
      $.each(srchP, function (i, v) {
        if (value["term"] == v)
          $next.append(
            $("<li>").append(
              value["filename"] +
                " (" +
                value["clicks"].toLocaleString(
                  document.documentElement.lang + "-CA"
                ) +
                ") [<em>" +
                value["type"] +
                "</em>]"
            )
          );
      });
    });

    //console.log(srch)
  } else {
    $dwnld.html($.i18n("Nodata"));
  }
};

const jsonOutbound = (json, url) => {
  var rows = json["rows"][0];
  $outbnd = $("#outbnd");

  if (rows != null) {
    var arrayO = json["rows"];
    $outbnd.html("");
    $outbnd.append($("<ul class='colcount-sm-2'>"));
    $outbnd = $("#outbnd ul");

    Promise.all([getPage(url)]).then((res) => {
      var $html = res[0].html;
      //console.log( $html );
      $.each(arrayO, function (index, value) {
        text = value["value"];
        outbnd = value["data"][0];
        $outbnd.append(
          $("<li>").append(
            text +
              " (" +
              outbnd.toLocaleString(document.documentElement.lang + "-CA") +
              ")"
          )
        );
      });
    });
  } else {
    $outbnd.html($.i18n("Nodata"));
  }
};

const jsonRT = (json, day) => {
  //var rows = json["rows"][0];
  val = "#reft";
  title = $.i18n("Referringtypes");
  var $ref = $(val);

  var array = json;
  $ref.html("");

  var ref = [];

  $.each(array, function (index, value) {
    term = value[0];
    clicks = value[1];
    var obj = {};
    obj[$.i18n("Type")] = $.i18n(term.replace(/\s/g, ""));
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
};

const jsonTable = (json, val, title, headers, day) => {
  //var rows = json["rows"][0];
  title = $.i18n(title);
  var $ref = $(val);

  var array = json;
  $ref.html("");

  var ref = [];

  $.each(array, function (index, value) {
    console.log(array);

    var obj = {};

    for (var $i = 0; $i < headers.length; $i++) {
      term = value[$i];

      console.log(term);

      if (!isInt(term)) {
        if (term.indexOf("||") !== -1) {
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

    // if generating the provChart table, don't paginate unless over 15 rows
    if (val == "#provChart") {
      $(val).html(getTable(15, "false", "false", "false"));
    } else {
      $(val).html(getTable(10, "false", "false", "false"));
    }

    let table = document.querySelector(val + " table");
    let data = Object.keys(ref[0]);
    generateTable(table, ref);
    generateTableHead(table, data, title);

    $(val + " table").trigger("wb-init.wb-tables");
  } else {
    $ref.html($.i18n("Nodata"));
  }
};
/*
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
*/

function getTable(
  $pageLength = null,
  $search = null,
  $info = null,
  $lengthChange = null,
  $order = null,
  $length = null,
  $display = null,
  $class = null,
  $TableFormattedCol = null
) {
  if (!$class) {
    $class = "wb-tables table table-responsive";
  }
  if (!$pageLength) {
    $pageLength = 5;
  }
  if (!$search) {
    $search = false;
  }
  if (!$info) {
    $info = true;
  }
  if (!$lengthChange) {
    $lengthChange = true;
  }
  if (!$order) {
    $order = [1, "&quot;desc&quot;"];
  }
  if (!$length) {
    $length = [5, 10, 25, -1];
  }
  if (!$display) {
    $display = [5, 10, 25, "&quot;All&quot;"];
  }
  if (!$TableFormattedCol) {
    $TableFormattedCol = [
      "{ &quot;type&quot;: &quot;html&quot; }",
      "{ &quot;type&quot;: &quot;formatted-num&quot; }",
    ];
  } else if ($TableFormattedCol == "gsc-tables") {
    $TableFormattedCol = [
      "{ &quot;type&quot;: &quot;html&quot; }",
      "{ &quot;type&quot;: &quot;formatted-num&quot; }",
      "{ &quot;type&quot;: &quot;formatted-num&quot; }",
      "{ &quot;type&quot;: &quot;formatted-num&quot; }",
      "{ &quot;type&quot;: &quot;formatted-num&quot; }",
    ];
  }

  return (
    '<table class="' +
    $class +
    "\" data-wb-tables='{ " +
    "&quot;pageLength&quot; : " +
    $pageLength +
    ", " +
    "&quot;order&quot; : [ " +
    $order +
    " ] , " +
    "&quot;lengthMenu&quot; : [ [ " +
    $length +
    " ], [ " +
    $display +
    " ] ] ," +
    "&quot;searching&quot; : " +
    $search +
    "," +
    "&quot;info&quot; : " +
    $info +
    "," +
    "&quot;lengthChange&quot; : " +
    $lengthChange +
    "," +
    "&quot;columns&quot; : [ " +
    $TableFormattedCol +
    " ] " +
    "}'>" +
    "</table>"
  );
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

    $.each(array, function (index, value) {
      term = value["value"];
      clicks = value["data"][day];

      if (term != "(Low Traffic)" && term != "Unspecified" && clicks != 0) {
        var obj = {};
        obj[$.i18n("Term")] = term;
        obj[$.i18n("Searches")] = clicks;
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
};

const jsonSearchesPhrases = (json, day) => {
  var title = $.i18n("Searches from page");
  var val = "#srchP";
  jsonSearch(json, val, title, day);

  $(val + " table").trigger("wb-init.wb-tables");
};

const jsonSearchesAll = (json, day) => {
  var title = $.i18n("Searches to page");
  var val = "#srchA";
  jsonSearch(json, val, title, day);

  $(val + " table").trigger("wb-init.wb-tables");

  // this enables search on table
  $(val + " table").attr("data-wb-tables", '{ "ordering" : false }');
};

const jsonSearchesInstitution = (json) => {
  var title = $.i18n("Contextualsearchestopage");
  var val = "#srchI";
  jsonSearch(json, val, title);

  $(val).trigger("wb-init.wb-tables");
};

const jsonSearchesGlobal = (json) => {
  var title = $.i18n("Globalsearchestopage");
  var val = "#srchG";
  jsonSearch(json, val, title);

  $(val).trigger("wb-init.wb-tables");
};

function sortByCol(arr) {
  return arr.sort((a, b) => b.Clicks - a.Clicks);
}

//const jsonAM = (json, day, url) => {
const jsonAM = (json, day) => {
  var rows = json["rows"][0];
  var val = "#np";
  var $next = $("#np");

  if (rows != null) {
    var array = json["rows"];
    $next.html("");

    var next = [];

    $.each(array, function (index, value) {
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

      // this enables search on table
      $(val + " table").attr("data-wb-tables", '{ "ordering" : false }');
    } else {
      $next.html($.i18n("Nodata"));
    }
  } else {
    $next.html($.i18n("Nodata"));
  }
  // // If page is NON canada.ca: Hide the '#np' table and Show the 'What visitors clicked on data temporarily removed' alert text;
  // if (url.indexOf("canada.ca") !== -1) { //canada.ca page
  //   $next.show();
  //   $("#np-container .alert").hide();
  // }
  // else { // NON canada.ca page
  //   $next.hide();
  //   $("#np-container .alert").show();
  // }
  
};

const jsonFWYLF = (json, day) => {
  var rows = json["rows"][0];
  var $next = $("#fwylfReason");
  var val = "#fwylfReason";
  var title = $.i18n("NoClicks");

  arrEn = [
    "I can't find the information",
    "The information is hard to understand",
    "There was an error / something didn't work",
    "Other reason",
  ];
  arrFr = [
    "Je ne peux pas trouver l’information",
    "L'information est difficile à comprendre",
    "Il y avait une erreur / quelque chose ne fonctionnait pas",
    "Autre raison",
  ];

  if (rows != null) {
    var array = json["rows"];
    $next.html("");

    var next = [];

    $.each(array, function (index, value) {
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

      if (document.documentElement.lang == "fr") {
        for (i = 0; i < arrEn.length; i++) {
          if (term == arrEn[i]) {
            term = arrFr[i];
            break;
          }
        }
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
};

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
  var conversationalAiToolsNum = 153 + parseInt(day);

  $uv.html("");
  $visit.html("");
  $pagev.html("");
  $avgtime.html("");

  if (rows != null) {
    uv = parseInt(rows[uvNum]);
    uvDays = parseInt(uv / $days).toLocaleString(
      document.documentElement.lang + "-CA"
    );
    uv = parseInt(uv).toLocaleString(document.documentElement.lang + "-CA");
    //$uv.prepend("<span class='h1'>" + uvDays + "</span> <strong>" + $.i18n("averageperday") + "</strong></br><span class='small'>" + uv + " " + $.i18n("total") + "</span>");
    //$uv.prepend("<span class='h2'>" + uvDays + "</span></br><span class='small'>" + uv + " " + $.i18n("total") + "</span>");

    visit = parseInt(rows[vNum]);
    vDays = parseInt(visit / $days).toLocaleString(
      document.documentElement.lang + "-CA"
    );
    visit = parseInt(visit).toLocaleString(
      document.documentElement.lang + "-CA"
    );
    //$visit.prepend("<span class='h2'>" + vDays + "</span></br><span class='small'>" + visit + " " + $.i18n("total") + "</span>");

    pv = parseInt(rows[pvNum]);
    pvDays = parseInt(pv / $days).toLocaleString(
      document.documentElement.lang + "-CA"
    );
    pv = parseInt(pv).toLocaleString(document.documentElement.lang + "-CA");
    //$pagev.prepend("<span class='h2'>" + pvDays + "</span></br><span class='small'>" + pv + " " + $.i18n("total") + "</span>");

    atMin = moment.utc(rows[avgtimeNum] * 1000).format("m"); //parseInt(rows[uvNum])
    atSec = moment.utc(rows[avgtimeNum] * 1000).format("ss"); //parseInt(rows[uvNum])
    //uvDays = parseInt( uv / $days ).toLocaleString(document.documentElement.lang+"-CA");
    //uv = parseInt(uv).toLocaleString(document.documentElement.lang+"-CA");
    $avgtime.prepend(
      "<span class='h2'>" + atMin + " min " + atSec + " sec" + "</span>"
    ); //</br><span class'small'>" + $.i18n("hours") + "</span>"); //</br><span class='small'>" + uv +" "+ $.i18n("total")+"</span>");

    // Determine if startDateWA and endDateWA are the same day and set sameDay to true or false accordingly
    var startDateWA = $("#startdate").val();
    var endDateWA = $("#enddate").val();
    var sameDay = moment(startDateWA).isSame(moment(endDateWA), "day");

    if (sameDay) {
      // if startDateWA and endDateWA are the same day, do not display averages for unique visits, visits, and page views on the Web analytics tab
      $uv.prepend("<span class='h2'>" + uv + "</span>");
      $visit.prepend("<span class='h2'>" + visit + "</span>");
      $pagev.prepend("<span class='h2'>" + pv + "</span>");
      $avgtime.closest("section").height("98px");
    } else {
      // otherwise display the daily averages for unique visits, visits, and page views on the Web analytics tab
      $uv.prepend(
        "<span class='h2'>" +
          uv +
          "</span></br><div class='small'>" +
          $.i18n("Dailyaverage") +
          "</br>" +
          uvDays +
          "</div>"
      );
      $visit.prepend(
        "<span class='h2'>" +
          visit +
          "</span></br><div class='small'>" +
          $.i18n("Dailyaverage") +
          "</br>" +
          vDays +
          "</div>"
      );
      $pagev.prepend(
        "<span class='h2'>" +
          pv +
          "</span></br><div class='small'>" +
          $.i18n("Dailyaverage") +
          "</br>" +
          pvDays +
          "</div>"
      );
      $avgtime.closest("section").height("138px");
    }

    if (
      parseInt(rows[findLookingForInstancesNum]) == NaN ||
      parseInt(rows[findLookingForTotalNum]) == 0
    ) {
      $("#rapCont").html('<p id="rap"></p>');
      rap = parseInt(rows[rapNum]);
      rapDays = Math.round(rap / $days).toLocaleString(
        document.documentElement.lang + "-CA"
      );
      rap = parseInt(rap).toLocaleString(document.documentElement.lang + "-CA");
      if (day == 2) {
        $("#rap").prepend(
          "<span class='h1'>" +
            rap +
            "</span> <strong>" +
            $.i18n("total") +
            "</strong>"
        );
      } else {
        $("#rap").prepend(
          "<span class='h1'>" +
            rapDays +
            "</span> <strong>" +
            $.i18n("averageperday") +
            "</strong></br><span class='small'>" +
            rap +
            " " +
            $.i18n("total") +
            "</span>"
        );
      }
      $("#fwylfCont").html(
        '<div id="fwylfTable"></div><div id="fwylfReason"></div>'
      );
      $("#rap-container").show();
      $("#fwylf-container").hide();
    } else {
      $("#fwylfCont").html(
        '<div id="fwylfTable"></div><div id="fwylfReason"></div>'
      );
      $("#fwylfTable").html(
        '<table class="table table-striped"><thead><th scope="col">' +
          $.i18n("Yes") +
          '</th><th scope="col">' +
          $.i18n("No") +
          '</th></thead><tr><td id="fwylfYes"></td><td id="fwylfNo"></td></tr></table>'
      );
      $("#fwylfYes").html(rows[findLookingForYesNum]);
      $("#fwylfNo").html(rows[findLookingForNoNum]);
      $("#rapCont").html("");
      $("#rap-container").hide();
      $("#fwylf-container").show();
    }

    desktop = parseInt(rows[desktopNum]);
    mobile = parseInt(rows[mobileNum]);
    tablet = parseInt(rows[tabletNum]);
    other = parseInt(rows[otherNum]);

    var arr = [desktop, mobile, tablet, other];

    jsonPieGenerate(arr);

    searchEngine = parseInt(rows[searchEngineNum]);
    otherWebsites = parseInt(rows[otherWebsitesNum]);
    socialNetworks = parseInt(rows[socialNetworksNum]);
    typedBookmarked = parseInt(rows[typedBookmarkedNum]);
    conversationalAiTools = parseInt(rows[conversationalAiToolsNum]);

    let referrerType = [
      ["Search Engines", searchEngine],
      ["Other Web Sites", otherWebsites],
      ["Social Networks", socialNetworks],
      ["Typed / Bookmarked", typedBookmarked],
      ["Conversational AI Tools", conversationalAiTools],
    ];

    jsonRT(referrerType, day);

    rapVal = "#rapReason";
    rapTitle = $.i18n("reportaproblem");
    rapHeaders = [$.i18n("Itemsselected"), $.i18n("Timesreported")];

    rapICantFind = parseInt(rows[rapICantFindNum]);
    rapLoginError = parseInt(rows[rapLoginErrorNum]);
    rapOtherIssue = parseInt(rows[rapOtherIssueNum]);
    rapSIN = parseInt(rows[rapSINNum]);
    rapInfoIsMissing = parseInt(rows[rapInfoIsMissingNum]);
    rapSecureKey = parseInt(rows[rapSecureKeyNum]);
    rapOtherLoginNotList = parseInt(rows[rapOtherLoginNotListNum]);
    rapGCKey = parseInt(rows[rapGCKeyNum]);
    rapInfoOutdated = parseInt(rows[rapInfoOutdatedNum]);
    rapSpellingMistake = parseInt(rows[rapSpellingMistakeNum]);
    rapPAC = parseInt(rows[rapPACNum]);
    rapLinkButtonNotWork = parseInt(rows[rapLinkButtonNotWorkNum]);
    rap404 = parseInt(rows[rap404Num]);
    rapBlank = parseInt(rows[rapBlankNum]);

    let reportAProblemArray = [
      [
        "I can't find what I'm looking for||Je n'arrive pas à trouver ce que je cherche",
        rapICantFind,
      ],
      [
        "Login error when trying to access an account (e.g. My Service Canada Account)||Message d'erreur à l'ouverture de la session lorsque je tente d'accéder à un compte (ex. Mon dossier Service Canada)",
        rapLoginError,
      ],
      [
        "Other issue not in this list||Autre problème qui ne figure pas sur cette liste",
        rapOtherIssue,
      ],
      [
        "Social Insurance Number (SIN) validation problems||Problème lié à la validation du numéro d'assurance sociale (NAS)",
        rapSIN,
      ],
      [
        "Information is missing||Les renseignements sont incomplets",
        rapInfoIsMissing,
      ],
      [
        "SecureKey Concierge (Banking Credential) access||Accès SecureKey Service de Concierge (justificatifs d'identité bancaires)",
        rapSecureKey,
      ],
      [
        "Other login error not in this list||Autre erreur lors de l'ouverture de session qui ne figure pas sur cette liste",
        rapOtherLoginNotList,
      ],
      ["GC Key access||Accès CléGC", rapGCKey],
      [
        "Information is outdated or wrong||L'information n'est plus à jour ou est erronée",
        rapInfoOutdated,
      ],
      [
        "It has a spelling mistake||Il y a une erreur d'orthographe ou de grammaire",
        rapSpellingMistake,
      ],
      [
        "Personal Access Code (PAC) problems or EI Access Code (AC) problems||Problème avec le Code d'accès personnel (CAP) ou avec le Code d'accès (CA) de l'assurance emploi",
        rapPAC,
      ],
      [
        "A link, button or video is not working||Un lien, un bouton ou une vidéo ne fonctionne pas",
        rapLinkButtonNotWork,
      ],
      [
        "Report a problem submissions that are 404 Pages||Signaler un problème dans les soumissions de 404 pages",
        rap404,
      ],
      [
        "Report a problem submissions with no boxes checked||Signaler une soumission de problème sans case cochée",
        rapBlank,
      ],
    ];

    jsonTable(reportAProblemArray, rapVal, rapTitle, rapHeaders, day);

    provVal = "#provChart";
    provTitle = $.i18n("provTerr");
    provHeaders = [$.i18n("provTerrHeader"), "Visits"];

    provAlberta = parseInt(rows[albertaNum]);
    provBC = parseInt(rows[bcNum]);
    provMB = parseInt(rows[manitobaNum]);
    provNB = parseInt(rows[newBrunswickNum]);
    provNFL = parseInt(rows[newfoundlandNum]);
    provNWT = parseInt(rows[northwestTerritoriesNum]);
    provNS = parseInt(rows[novaScotiaNum]);
    provNV = parseInt(rows[nunavutNum]);
    provON = parseInt(rows[ontarioNum]);
    provOutCAN = parseInt(rows[outsideCanadaNum]);
    provPEI = parseInt(rows[peiNum]);
    provQB = parseInt(rows[quebecNum]);
    provSK = parseInt(rows[saskatchewanNum]);
    provYK = parseInt(rows[yukonNum]);

    let provArray = [
      ["Alberta||L'Alberta", provAlberta],
      ["British Columbia||La Colombie-Britannique", provBC],
      ["Manitoba||Le Manitoba", provMB],
      ["New Brunswick||Le Nouveau-Brunswick", provNB],
      ["Newfoundland and Labrador||La Terre-Neuve-et-Labrador", provNFL],
      ["Northwest Territories||Les Territoires du Nord-Ouest", provNWT],
      ["Nova Scotia||La Nouvelle-Écosse", provNS],
      ["Nunavut||Le Nunavut", provNV],
      ["Ontario||L'Ontario", provON],
      ["Outside Canada||À l'extérieur du Canada", provOutCAN],
      ["Prince Edward Island||Île-du-Prince-Édouard", provPEI],
      ["Quebec||Le Québec", provQB],
      ["Saskatchewan||La Saskatchewan", provSK],
      ["Yukon||Le Yukon", provYK],
    ];

    jsonTable(provArray, provVal, provTitle, provHeaders, day);
  } else {
    $uv.html("0");
    $rap.html("0");
  }
};

function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  var num = parseFloat((num / si[i].value).toFixed(digits)).toLocaleString(
    document.documentElement.lang + "-CA"
  );
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

  $clicks.html("");
  $imp.html("");
  $ctr.html("");
  $pos.html("");

  if (rows != null) {
    for (let r of rows) {
      clicks = parseInt(r["clicks"]);
      fClicks = clicks.toLocaleString(document.documentElement.lang + "-CA"); //.toLocaleString(document.documentElement.lang+"-CA");
      vClicks = parseInt(clicks / $days).toLocaleString(
        document.documentElement.lang + "-CA"
      );
      //" <strong>Total clicks"+$.i18n("averageperday")+"</strong></br><span class='small'>" + clicks +" "+ $.i18n("total")+"</span>");

      imp = parseInt(r["impressions"]);
      fImp = imp.toLocaleString(document.documentElement.lang + "-CA");
      vImp = parseInt(imp / $days).toLocaleString(
        document.documentElement.lang + "-CA"
      );
      //</br><span class='small'>" + visit +" "+ $.i18n("total")+"</span>");

      // Determine if startDateGSC and endDateGSC are the same day and set sameDay to true or false accordingly
      var startDateGSC = $("#startdate").val();
      var endDateGSC = $("#enddate").val();
      var sameDay = moment(startDateGSC).isSame(moment(endDateGSC), "day");

      if (sameDay) {
        // if startDateGSC and endDateGSC are the same day, do not display averages for clicks and impressions on the Google search analytics tab
        $clicks.prepend("<span class='h2'>" + fClicks + "</span>");
        $imp.prepend("<span class='h2'>" + fImp + "</span>");
      } else {
        // otherwise display the daily averages for clicks and impressions on the Google search analytics tab
        $clicks.prepend(
          "<span class='h2'>" +
            fClicks +
            "</span></br><div class='small'>" +
            $.i18n("Dailyaverage") +
            "</br>" +
            vClicks +
            "</div>"
        );
        $imp.prepend(
          "<span class='h2'>" +
            fImp +
            "</span></br><div class='small'>" +
            $.i18n("Dailyaverage") +
            "</br>" +
            vImp +
            "</div>"
        );
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
    $clicks.html("0");
    $imp.html("0");
    $ctr.html("0");
    $pos.html("0");
  }
};

const jsonGSCGenerate = (json, day) => {
  var rows = json["rows"];

  if (rows != null) {
    $("#gsc").remove();
    $("#gsc-canvas").append("<canvas id='gsc'></canvas>");

    $cnt = rows.length;

    var clicks = [],
      imp = [],
      keys = [],
      $obj = [],
      ctr = [],
      pos = [];

    $.each(rows, function (index, value) {
      val = value;
      clicks.push(parseInt(val["clicks"]));
      imp.push(parseInt(val["impressions"]));
      if (document.documentElement.lang == "fr") {
        var end = "&nbsp;%";
      } else {
        var end = "%";
      }
      /*
            ctr.push(parseFloat((val['ctr'] * 100)).toFixed(1));
            pos.push(parseFloat(val['position']).toFixed(1));
            */
      var $date = moment(val["keys"][0])
        .locale(document.documentElement.lang)
        .format("MMM-DD");

      // if English language is selected
      if (document.documentElement.lang == "en") {
        var $dateLong = moment(val["keys"][0])
          .locale(document.documentElement.lang)
          .format("MMMM DD, YYYY"); // EN format
      }
      // else if French language is selected
      else {
        var $dateLong = moment(val["keys"][0])
          .locale(document.documentElement.lang)
          .format("DD MMMM YYYY"); // FR format
      }

      keys.push($date);

      var obj = {};
      obj[$.i18n("Day")] = $dateLong;
      obj[$.i18n("Clicks")] = val["clicks"].toLocaleString(
        document.documentElement.lang + "-CA"
      );
      obj[$.i18n("Impressions")] = val["impressions"].toLocaleString(
        document.documentElement.lang + "-CA"
      );
      /*
            obj[$.i18n("CTR")] = parseFloat((val['ctr'] * 100).toFixed(1)).toLocaleString(document.documentElement.lang + "-CA") + end;
            obj[$.i18n("Position")] = val['position'].toFixed(1).toLocaleString(document.documentElement.lang + "-CA");
            */
      $obj.push(obj);
    });

    var options = {
      plugins: {
        datalabels: {
          display: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            id: "y-axis-0",
            type: "linear",
            display: true,
            position: "left",
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                return Intl.NumberFormat().format(value / 1000);
              },
              fontSize: 18,
            },
            scaleLabel: {
              display: true,
              labelString: $.i18n("GSCClicks"),
              fontSize: 18,
            },
          },
          {
            id: "y-axis-1",
            type: "linear",
            display: true,
            position: "right",
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                return Intl.NumberFormat().format(value / 1000);
              },
              fontSize: 18,
            },
            scaleLabel: {
              display: true,
              labelString: $.i18n("GSCImpressions"),
              fontSize: 18,
            },
          } /*, {

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
                }*/,
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: $.i18n("Dayofselecteddaterange2"),
              fontSize: 18,
            },
            ticks: {
              fontSize: 18,
            },
          },
        ],
      },
      tooltips: false,
      hover: {
        mode: "nearest",
        intersect: true,
      },
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
        },
      },
      layout: {
        padding: {
          top: 25,
        },
      },
    };

    Chart.defaults.global.showTooltips = false;

    var ctx3 = document.getElementById("gsc").getContext("2d");
    var chart3 = new Chart(ctx3, {
      type: "line",
      data: {
        labels: keys,
        datasets: [
          {
            yAxisID: "y-axis-0",
            label: $.i18n("Clicks"),
            data: clicks,
            fill: false,
            borderColor: "#4285f4",
          },
          {
            yAxisID: "y-axis-1",
            label: $.i18n("Impressions"),
            data: imp,
            fill: false,
            borderColor: "#5e35b1",
          } /*, {
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
                }*/,
        ],
      },
      options: options,
    });

    let table = document.querySelector("table#tbl-gsc");
    let dtx = Object.keys($obj[0]);
    table.innerHTML = "";
    generateTable(table, $obj);
    generateTableHead(
      table,
      dtx,
      $.i18n("Visitstrendbycurrentyearandpreviousyear")
    );

    $("#chartgsc").show();
    $("#chrtgsc").hide();
  } else {
    $("#chartgsc").hide();
    $("#chrtgsc").hide();
  }
};

const jsonGSC = (json, val, title, col, lang) => {
  var rows = json["rows"];
  var $qry = $(val);

  console.log(rows);

  if (rows != null) {
    var array = json["rows"];
    $qry.html("");

    var srch = [];

    $.each(array, function (index, value) {
      term = value["keys"][lang];
      clicks = value["clicks"];
      imp = value["impressions"];
      ctr = (value["ctr"] * 100).toLocaleString(
        document.documentElement.lang + "-CA",
        { minimumFractionDigits: 1, maximumFractionDigits: 1 }
      );
      pos = value["position"].toLocaleString(
        document.documentElement.lang + "-CA",
        { minimumFractionDigits: 1, maximumFractionDigits: 1 }
      );
      if (document.documentElement.lang == "fr") {
        var end = "&nbsp;%";
      } else {
        var end = "%";
      }
      var obj = {};
      obj[col[0]] = term;
      obj[col[1]] = clicks;
      obj[col[2]] = imp;
      obj[col[3]] = ctr + end;
      obj[col[4]] = pos;
      srch.push(obj);
    });

    if (srch.length != 0) {
      //srch.sort((a, b)=> b[$.i18n("Clicks")] - a[$.i18n("Clicks")]);
      var $pageLength = 10;
      //$(val).html(getTable($pageLength));
      $(val).html(
        getTable(
          $pageLength,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          "gsc-tables"
        )
      );
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
};

const jsonGSCQryAll = (json, day) => {
  var title = $.i18n("All - Queries");
  var val = "#gscQryAll";
  var col = [
    $.i18n("Term"),
    $.i18n("Clicks"),
    $.i18n("Impressions"),
    $.i18n("CTR"),
    $.i18n("Position"),
  ];
  jsonGSC(json, val, title, col, 0);

  $(val + " table").trigger("wb-init.wb-tables");
};

const jsonGSCQryMobile = (json, day) => {
  var title = $.i18n("Mobile - Queries");
  var val = "#gscQryMob";
  var col = [
    $.i18n("Term"),
    $.i18n("Clicks"),
    $.i18n("Impressions"),
    $.i18n("CTR"),
    $.i18n("Position"),
  ];
  jsonGSC(json, val, title, col, 0);

  $(val + " table").trigger("wb-init.wb-tables");
};

const jsonGSCQryDesktop = (json, day) => {
  var title = $.i18n("Desktop - Queries");
  var val = "#gscQryDesk";
  var col = [
    $.i18n("Term"),
    $.i18n("Clicks"),
    $.i18n("Impressions"),
    $.i18n("CTR"),
    $.i18n("Position"),
  ];
  jsonGSC(json, val, title, col, 0);

  $(val + " table").trigger("wb-init.wb-tables");
};

const jsonGSCQryTablet = (json, day) => {
  var title = $.i18n("Desktop - Queries");
  var val = "#gscQryTab";
  var col = [
    $.i18n("Term"),
    $.i18n("Clicks"),
    $.i18n("Impressions"),
    $.i18n("CTR"),
    $.i18n("Position"),
  ];
  jsonGSC(json, val, title, col, 0);

  $(val + " table").trigger("wb-init.wb-tables");
};

const jsonGSCCountry = (json, day) => {
  if (document.documentElement.lang == "en") {
    lang = 0;
  } else {
    lang = 1;
  }

  var title = $.i18n("Countries");
  var val = "#gscCountry";
  var col = [
    $.i18n("Country"),
    $.i18n("Clicks"),
    $.i18n("Impressions"),
    $.i18n("CTR"),
    $.i18n("Position"),
  ];
  jsonGSC(json, val, title, col, lang);

  $(val + " table").trigger("wb-init.wb-tables");
};

//  returns an object with the sought country's data if the search yields a result
//  returns undefined if no results could be found or if argument is incorrect
function search_country(query) {
  var countries = JSON.parse("../assets/js/json/country-en.json");
  condole.log(countries);

  // if argument is not valid return false
  if (
    undefined === query.id &&
    undefined === query.alpha2 &&
    undefined === query.alpha3
  )
    return undefined;

  // iterate over the array of countries
  return countries
    .filter(function (country) {
      // return country's data if
      return (
        // we are searching by ID and we have a match
        (undefined !== query.id &&
          parseInt(country.id, 10) === parseInt(query.id, 10)) ||
        // or we are searching by alpha2 and we have a match
        (undefined !== query.alpha2 &&
          country.alpha2 === query.alpha2.toLowerCase()) ||
        // or we are searching by alpha3 and we have a match
        (undefined !== query.alpha3 &&
          country.alpha3 === query.alpha3.toLowerCase())
      );

      // since "filter" returns an array we use pop to get just the data object
    })
    .pop();
}

function fetchWithTimeout(url, options, delay, onTimeout) {
  const timer = new Promise((resolve) => {
    setTimeout(resolve, delay, {
      timeout: true,
    });
  });
  return Promise.race([fetch(url, options), timer]).then((response) => {
    if (response.timeout) {
      onTimeout();
    }
    return response;
  });
}

const apiCall = (d, i, a, uu, dd, fld, lg, r, e) =>
  a.map((type) => {
    url = type == "fle" ? "php/file.php" : "php/process.php";

    post = {
      dates: d,
      url: i,
      type: type,
      oUrl: uu,
      field: fld,
      lang: lg,
      oRangeStartToEnd: r,
      oRangeEndToToday: e,
    };

    let request = new Request(url, {
      method: "POST",
      body: JSON.stringify(post),
    });

    return fetch(request)
      .then((res) => res.json())
      .then((res) => {
        //cnt++; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        console.log(type);
        console.log(res); // prints res parameter for each case in console as Object
        if (res["error"]) {
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
              return jsonTrendGenerate(res, d, r);
            //case "pltfrm" : return jsonPieGenerate(res);
            case "prvs":
              return jsonPrevious(res, dd);
            case "frwrd":
              return jsonForward(res);
            case "srchAll":
              return jsonSearchesAll(res, dd);
            case "activityMap":
              //return jsonAM(res, dd, uu);
              return jsonAM(res, dd);
            case "metrics-new":
              return jsonMetrics(res, dd);
            //case "refType": return jsonRT(res, dd);
            case "fwylf":
              return jsonFWYLF(res, dd);
            //case "dwnld" : return jsonDownload(res, uu);
            //case "outbnd" : return jsonOutbound(res, uu);
            case "cntry":
              return jsonGSCCountry(res, dd);
            case "qryAll":
              return jsonGSCQryAll(res, dd);
            case "qryMobile":
              return jsonGSCQryMobile(res, dd);
            case "qryDesktop":
              return jsonGSCQryDesktop(res, dd);
            case "qryTablet":
              return jsonGSCQryTablet(res, dd);
            case "totals":
              return jsonGSCTotal(res, dd);
            case "totalDate":
              return jsonGSCGenerate(res, dd);
          }
        }
      })
      .catch(function (err) {
        console.log(type);
        console.log(err.message);
        console.log(err.stack);
      });
  });

const apiCall2 = (d, i, a, uu, lg, r, e) =>
  a.map((type) => {
    url = "php/process-new.php";

    post = {
      dates: d,
      url: i,
      oUrl: uu,
      lang: lg,
      oRangeStartToEnd: r,
      oRangeEndToToday: e,
    };

    let request = new Request(url, {
      method: "POST",
      body: JSON.stringify(post),
    });

    return fetch(request)
      .then((res) => res.json())
      .then((res) => {
        //cnt++; $("#percent").html((cnt * 100 / aa).toFixed(1) + "%");
        //console.log(type);
        //console.log(res);

        $("#urlStatic").html("https://" + res["url"]);
        return res;
      })
      .catch(function (err) {
        console.log(type);
        console.log(err.message);
        console.log(err.stack);
      });
  });

const apiCallGSC2 = (d, i, a, uu, dd, lg, r, e) =>
  a.map((type) => {
    url = "php/process-gsc.php";

    post = {
      dates: d,
      url: i,
      oUrl: uu,
      day: dd,
      lang: lg,
      oRangeStartToEnd: r,
      oRangeEndToToday: e,
    };

    let request = new Request(url, {
      method: "POST",
      body: JSON.stringify(post),
    });

    return fetch(request)
      .then((res) => res.json())
      .then((res) => {
        // display the date range on the frontend in the format "Tuesday May 30, 2023 to Friday June 02, 2023"
        var vStart2 = $("#startdate").val();
        var vEnd2 = $("#enddate").val();
        var start2 = moment(vStart2).format("YYYY-MM-DDTHH:mm:ss.SSS");
        var end2 = moment(vEnd2).format("YYYY-MM-DDTHH:mm:ss.SSS");
        var localLocaleStart = moment(start2);
        var localLocaleEnd = moment(end2);

        var diff = localLocaleEnd.diff(localLocaleStart, "days") + 1;

        $("#urlStatic").html(res["url"]);
        $("#fromGSC").html(res["start"]);
        $("#toGSC").html(res["end"]);

        // display the date in either English or French depending on the language selected
        localLocaleStart.locale(document.documentElement.lang);
        localLocaleEnd.locale(document.documentElement.lang);

        var startDateWordsSet = new Date(vStart2);
        startDateWordsSet.setDate(startDateWordsSet.getDate() + 1);
        var endDateWordsSet = new Date(vEnd2);
        endDateWordsSet.setDate(endDateWordsSet.getDate() + 1);
        var startDateWords = startDateWordsSet
          .toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .replace(",", "");
        var endDateWords = endDateWordsSet
          .toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .replace(",", "");

        startDateWords = localLocaleStart.format("dddd MMMM DD, YYYY");
        endDateWords = localLocaleEnd.format("dddd MMMM DD, YYYY");

        // if French language is selected, change format to standard French formatting
        if (document.documentElement.lang == "fr") {
          startDateWords = localLocaleStart.format("dddd DD MMMM YYYY");
          endDateWords = localLocaleEnd.format("dddd DD MMMM YYYY");
        }

        $dd = $("#date-range").find(":selected").data("index");
        $("#fromdaterangegsc").html(startDateWords);
        $("#todaterangegsc").html(endDateWords);

        $("#numDaysgsc").html(diff);

        return res;
      })
      .catch(function (err) {
        console.log(type);
        console.log(err.message);
        console.log(err.stack);
      });
  });

const apiCallBP = (d, i, a, uu) =>
  a.map((type) => {
    url = "php/process-bp.php";

    post = { dates: d, url: i, oUrl: uu, lang: document.documentElement.lang };

    let request = new Request(url, {
      method: "POST",
      body: JSON.stringify(post),
    });

    return fetch(request)
      .then((res) => res.json())
      .then((res) => {
        if (res["html"].indexOf("No data") == -1) {
          $("#bp-content").html(res["html"]);
          $("#bp-content").append(
            "<p> For more options and date ranges, please visit <a href='https://feedback-by-page.tbs.alpha.canada.ca/bypage?page=" +
              uu +
              "' target='_blank'>" +
              "https://feedback-by-page.tbs.alpha.canada.ca/bypage?page=" +
              uu +
              "</a></p>"
          );
          $("#details-panel3-lnk").closest("li").removeClass("hidden");
          $("#details-panel3").removeClass("hidden");
        } else {
          $("#bp-content").html("");
          $("#details-panel3-lnk").closest("li").addClass("hidden");
          $("#details-panel3").addClass("hidden");

          if ($("#details-panel3-lnk").parent().hasClass("active")) {
            $("#details-panel3-lnk").parent().removeClass("active");
            $("#details-panel1-lnk").click();
          }
        }
      })
      .catch(function (err) {
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

const apiCallRead = (d, i, a, uu) =>
  a.map((type) => {
    url = "php/process-read.php";

    post = { dates: d, url: i, oUrl: uu, lang: document.documentElement.lang };

    let request = new Request(url, {
      method: "POST",
      body: JSON.stringify(post),
    });

    return fetch(request)
      .then((res) => res.json())
      .then((res) => {
        if (res["html"].indexOf("No data") == -1) {
          $("#read-content").html(res["html"]);
          $("#details-panel4-lnk").parent().removeClass("hidden");
        } else {
          $("#read-content").html("");
          $("#details-panel4-lnk").parent().addClass("hidden");
          if ($("#details-panel4-lnk").parent().hasClass("active")) {
            $("#details-panel4-lnk").parent().removeClass("active");
            $("#details-panel3-lnk").click();
          }
        }
      })
      .catch(function (err) {
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
  var canvas = document.querySelector("#canvas-container");
  //creates image
  /*var canvasImg = canvas.toDataURL("image/png", 1.0);
  
    //creates PDF from img*/
  var doc = new jsPDF("portrait");
  doc.setFontSize(20);
  doc.text(15, 15, "Cool Chart");
  doc.addImage(canvasImg, "PNG", 10, 10, 280, 150);
  doc.save("canvas.pdf");
}

$("#urlform").submit(function (event) {
  event.preventDefault();
  url = $("#urlval").val();
  $("#urlStatic").html(url);
  start = $(".dr-date-start").html();
  //end = moment();
  end = moment().subtract(1, 'days');

  mainQueue(url, start, end, 0);
});

$("a#h2href").click(function () {
  event.preventDefault();
  url = $("#urlStatic").html();
  start = $(".dr-date-start").html();
  //end = moment();
  end = moment().subtract(1, 'days');
  if ($("#urlLang").html() == 1) {
    $("#urlLang").html(0);
  } else {
    $("#urlLang").html(1);
  }

  mainQueue(url, start, end, "1");
});

$("#ddRange").submit(function (event) {
  event.preventDefault();
  url = $("#urlval").val();
  $("#urlStatic").html(url);
  start = $(".dr-date-start").html();
  //end = moment();
  end = moment().subtract(1, 'days');
  //dd = $('#date-range').find(':selected').data('index');

  mainQueue(url, start, end, 0); //, dd);
});

function hideError() {
  $("#error").addClass("hidden");
}

function showError() {
  $("#error").removeClass("hidden");

  if ($("#errorHeader").text().includes("No data")) {
    errTrack = "CRA-ARC:Page analytics tool - Error: No data";
    errKey = "errorOccuredNodata";
  } else if ($("#errorHeader").text().includes("429050")) {
    errTrack = "CRA-ARC:Page analytics tool - Error: Too many requests";
    errKey = "errorOccuredTooMany";
  } else {
    errTrack = "CRA-ARC:Page analytics tool - Error: Generic Error Message";
    errKey = "errorOccured";
  }

  $("#error-canvas").addClass("hidden");

  $("#error").attr("data-gc-analytics-customcall", errTrack);
  $(".error_display").attr("data-i18n", errKey);
  $(".error_display").text($.i18n(errKey));
  $(".error_display").attr("data-i18n-aria-label", errKey);

  _satellite.track("CUSTOM_TRACK");
}

const removeQueryString = (url) => {
  var a = document.createElement("a"); // dummy element
  a.href = url; // set full url
  a.search = ""; // blank out query string
  $href = a.href;
  if (/Edge/.test(navigator.userAgent)) {
    $href = $href.substring(0, $href.length - 1);
  }
  return $href;
};

const containsAny = (str, substrings) => {
  for (var i = 0; i != substrings.length; i++) {
    var substring = substrings[i];
    if (str.indexOf(substring) != -1) {
      return substring;
    }
  }
  return null;
};

const mainQueue = (url, start, end, lang) => {
  console.log(url);
  console.log(start);
  console.log("***");  
  console.log(end);

  $("#canvas-container").addClass("hidden");
  $("#whole-canvas").addClass("hidden");
  $("#notfound").addClass("hidden");
  $("#notfoundGC").addClass("hidden");
  hideError();
  $("#loading").removeClass("hidden");

  if (document.documentElement.lang == "fr") {
    $("#table-of-contents-french").removeClass("hidden");
    $("#mesures-clés").removeClass("hidden");
    $("#sources-de-trafic").removeClass("hidden");
    $("#profil-du-visiteur").removeClass("hidden");
    $("#activité-de-visiteur").removeClass("hidden");

    $("#table-of-contents-english").addClass("hidden");
    $("#key-metrics").addClass("hidden");
    $("#traffic-sources").addClass("hidden");
    $("#visitor-profile").addClass("hidden");
    $("#visitor-activity").addClass("hidden");
  } else {
    $("#table-of-contents-french").addClass("hidden");
    $("#mesures-clés").addClass("hidden");
    $("#sources-de-trafic").addClass("hidden");
    $("#profil-du-visiteur").addClass("hidden");
    $("#activité-de-visiteur").addClass("hidden");

    $("#table-of-contents-english").removeClass("hidden");
    $("#key-metrics").removeClass("hidden");
    $("#traffic-sources").removeClass("hidden");
    $("#visitor-profile").removeClass("hidden");
    $("#visitor-activity").removeClass("hidden");
  }

  $success = 0;

  if (start && end) {
    $("#startdate").val(start);
    $("#enddate").val(end);
    var vStart2 = start;
    var vEnd2 = end;
  } else {
    var vStart2 = $("#startdate").val();
    var vEnd2 = $("#enddate").val();
  }

  var start2 = moment(vStart2).format("YYYY-MM-DDTHH:mm:ss.SSS");
  var end2 = moment(vEnd2).format("YYYY-MM-DDTHH:mm:ss.SSS");

  console.log("start2" + start2);
  console.log("end2" + end2);

  var startDateWordsSet = new Date(vStart2);
  startDateWordsSet.setDate(startDateWordsSet.getDate() + 1);
  var endDateWordsSet = new Date(vEnd2);
  endDateWordsSet.setDate(endDateWordsSet.getDate() + 1);
  var startDateWords = startDateWordsSet
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .replace(",", "");
  var endDateWords = endDateWordsSet
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .replace(",", "");

  console.log("startDateWords " + startDateWords);
  console.log("endDateWords " + endDateWords);

  var rangeStart2ToEnd2 = moment(end2).diff(moment(start2), "days") + 1;
  var rangeEnd2ToToday = moment().subtract(1, "day").diff(moment(end2), "days");

  console.log(
    "Numerical date range between start2 and end2: " + rangeStart2ToEnd2
  );
  console.log(
    "Numerical date range between end2 and today: " + rangeEnd2ToToday
  );

  //var threeYearsAgo = moment().subtract(3, "years").format("YYYY-MM-DD");
  var threeYearsAgo = moment().subtract(1, "days").subtract(3, "years").format("YYYY-MM-DD");

  if (
    startDateWords == "Invalid Date" ||
    endDateWords == "Invalid Date" ||
    rangeStart2ToEnd2 == "NaN" ||
    rangeEnd2ToToday == "NaN" ||
    rangeStart2ToEnd2 <= 0 ||
    moment(vStart2).isBefore(threeYearsAgo) ||
    moment(vStart2).isAfter(moment().subtract(1, 'days')) ||
    moment(vEnd2).isBefore(threeYearsAgo) ||
    moment(vEnd2).isAfter(moment().subtract(1, 'days'))
  ) {
    $("#loading").addClass("hidden");
    $("#loadFD").empty();
    $("#searchBttn").prop("disabled", false);
  }

  var sameDay = moment(vStart2).isSame(moment(vEnd2), "day");

  url = url.indexOf("www") === 0 ? "https://" + url : url;

  if (url.substring(0, 8) == "https://" && containsAny(url, substrings)) {
    $isApp = /(apps[1-8].ams-sga.cra-arc.gc.ca)/.test(url) ? 1 : 0;

    console.log("isApp: " + $isApp);

    oUrl = url;
    url = url.substring(8, url.length);
    console.log(url);

    url = url.length > 255 ? url.substring(url.length - 255, url.length) : url;

    moment.locale("en");

    $dd = $("#date-range").find(":selected").data("index");

    if (!$.isNumeric($dd)) $dd = 1;

    if (start && end) {
      vStart = start;
      vEnd = end;
    } else {
      //var start = moment();
      var start = moment().subtract(1, 'days');
      var vEnd = moment().subtract(1, 'days').format("dddd MMMM DD, YYYY");
      if ($dd == 0) {
        vStart = moment(start)
          .subtract(30, "days")
          .format("dddd MMMM DD, YYYY");
      } else if ($dd == 1) {
        vStart = moment(start).subtract(7, "days").format("dddd MMMM DD, YYYY");
      } else if ($dd == 2) {
        vStart = moment(start).subtract(1, "days").format("dddd MMMM DD, YYYY");
      }
    }
    var start = moment(vStart2).format("YYYY-MM-DDTHH:mm:ss.SSS");
    var end = moment(vEnd2).format("YYYY-MM-DDTHH:mm:ss.SSS");
    var endMD = moment(vEnd2)
      .subtract(1, "days")
      .format("YYYY-MM-DDTHH:mm:ss.SSS");

    var dateMD = [start, endMD];
    var d = [start, end];

    console.log(d);

    var localLocaleStart = moment(vStart2);
    var localLocaleEnd = moment(vEnd2);

    localLocaleStart.locale(document.documentElement.lang);
    localLocaleEnd.locale(document.documentElement.lang);

    startDateWords = localLocaleStart.format("dddd MMMM DD, YYYY");
    endDateWords = localLocaleEnd.format("dddd MMMM DD, YYYY");

    // if French language is selected, change format to standard French formatting
    if (document.documentElement.lang == "fr") {
      startDateWords = localLocaleStart.format("dddd DD MMMM YYYY");
      endDateWords = localLocaleEnd.format("dddd DD MMMM YYYY");
    }
    // display the start date and end date in words in index.html
    $("#fromdaterange").html(startDateWords);
    $("#todaterange").html(endDateWords);
    var start = moment(vStart);
    var end = moment(vEnd);

    dDay = end.diff(start, "days");
    dWeek = end.diff(start, "week", true);

    $("#numDays").html(rangeStart2ToEnd2);
    $("#numWeeks").html(dWeek);

    // if user does not select an invalid date range, then disable the search button to let user know that the search is in progress
    if (
      startDateWords != "Invalid date" && // "Invalid Date" is transformed into "Invalid date" by moment.js
      endDateWords != "Invalid date" &&
      rangeStart2ToEnd2 != "NaN" &&
      rangeEnd2ToToday != "NaN" &&
      rangeStart2ToEnd2 > 0 && // if the start date is before the end date
      !moment(vStart2).isBefore(threeYearsAgo) && // if the start date is less than three years ago today
      !moment(vStart2).isAfter(moment().subtract(1, 'days')) && // if the start date is not after today
      !moment(vEnd2).isBefore(threeYearsAgo) && // if the end date is less than three years ago today
      !moment(vEnd2).isAfter(moment().subtract(1, 'days')) // if the end date is not after today
    ) {
      $("#searchBttn").prop("disabled", true);
    }

    var dbCall = ["dbGet"];
    var langAbbr;
    console.log("language: " + lang);
    if ($isApp) {
      var match = ["trnd", "prvs", "metrics-new"];
      if ($("#urlLang").html() == 1) {
        langAbbr = "fr";
      } else {
        langAbbr = "en";
      }
      url = url.substring(5, url.length);
    } else {
      var match = [
        "trnd",
        "prvs",
        "srchAll",
        "snmAll",
        "srchLeftAll",
        "activityMap",
        "metrics-new",
        "fwylf",
      ];
      var langAbbr = "bi";
    }
    var gsc = [
      "cntry",
      "qryAll",
      "qryMobile",
      "qryDesktop",
      "qryTablet",
      "totals",
      "totalDate",
    ];
    var previousURL = [];
    var pageURL = [];

    const dbGetBPMatch = (res) => {
      url = $("#urlStatic").html();
      oUrl = $("#urlStatic").html();
      Promise.all(apiCallBP(dateMD, url, dbCall, oUrl));
      return res;
    };

    const dbGetReadMatch = () => {
      url = $("#urlStatic").html();
      oUrl = $("#urlStatic").html();
      return Promise.all(apiCallRead(d, url, dbCall, oUrl));
    };

    // Get AA data and if it is not in database pull it
    const dbGetMatch = () => {
      $("#loadGSC").empty();
      $("#loadAA").html($.i18n("FetchdataAA"));
      url = $("#urlStatic").html();
      oUrl = $("#urlStatic").html();

      return Promise.all(
        apiCall2(
          d,
          url,
          dbCall,
          oUrl,
          lang,
          rangeStart2ToEnd2,
          rangeEnd2ToToday
        )
      );
    };

    // Get Google Search Console data if it is cached, if not it will query and update database
    const dbGetGSC = () => {
      if (!$isApp) {
        $("#loadGSC").html($.i18n("FetchdataGSC"));
        return Promise.all(
          apiCallGSC2(
            d,
            url,
            dbCall,
            oUrl,
            dDay,
            lang,
            rangeStart2ToEnd2,
            rangeEnd2ToToday
          )
        );
      }
      return Promise.resolve("null");
    };
    // pull AA data and display
    const getMatch = () => {
      $("#loadAA").empty();
      $("#loadFD").html($.i18n("FetchdataFD"));
      if ($isApp) {
        oUrl2 = url.substring(13, url.length);
        url = url.substring(13, url.length);
      } else {
        url = $("#urlStatic").html();
        oUrl2 = $("#urlStatic").html();
      }
      return Promise.all(
        apiCall(
          d,
          url,
          match,
          oUrl2,
          $dd,
          "aa",
          langAbbr,
          rangeStart2ToEnd2,
          rangeEnd2ToToday
        )
      );
    };

    // pull GSC data and display
    const getGSC = (res) => {
      console.log("LOOOG " + res);
      if (!$isApp) {
        url = $("#urlStatic").html();
        oUrl = $("#urlStatic").html();
        dd = [$("#fromGSC").text(), $("#toGSC").text()];
        Promise.all(
          apiCall(
            dd,
            url,
            gsc,
            oUrl,
            $dd,
            "gsc",
            langAbbr,
            rangeStart2ToEnd2,
            rangeEnd2ToToday
          )
        );
        return res;
      }
      return res;
    };
    const checkErrorMatch = (res) => {
      console.log("-----------------------------");
      console.log(res);

      var $tf = extractJSON(res, "");
      console.log($tf);

      $("#searchBttn").prop("disabled", false);
      return Promise.resolve($tf);
    };
    const getTitle = (h2) => {
      if (!$isApp) {
        if (!h2[0] || !h2[0]["url"]) {
          return Promise.resolve(); // is this OK? 
        }
        return Promise.all([getPageH1(h2[0]["url"])]);
      }
      return Promise.resolve($.i18n("Page-levelstatistics"));
    };

    const chainError = (err) => {
      return Promise.reject(err);
    };

    dbGetGSC()
      .then((res) => getTitle(res))
      .then((res) => {
        $("#h2title").html(res);
      })
      .then(() => dbGetMatch())
      .then(() => getMatch())
      .then((res) => checkErrorMatch(res))
      .then((res) => getGSC(res))
      .then((res) => {
        console.log("log: " + res);

        if (
          ($("#urlStatic").html().indexOf("/fr/") !== -1 && !$isApp) ||
          ($("#urlLang").html() == 1 && $isApp)
        ) {
          $("a#h2href").html($.i18n("LanguageToggleFR"));
        } else {
          $("a#h2href").html($.i18n("LanguageToggleEN"));
        }

        const $start = moment($("#fromdaterange").text()).format("YYYY-MM-DD");
        const $end = moment($("#todaterange").text()).format("YYYY-MM-DD");

        if ($isApp) {
          $("#rap-container").addClass("hidden");
          $("#snum-container").addClass("hidden");
          $("#search-container").addClass("hidden");
          $("#fwlf-container").addClass("hidden");
          $("#srchA-container").addClass("hidden");
          $("#np-container").addClass("hidden");

          $("#details-panel2-lnk").closest("li").addClass("hidden");
          $("#details-panel2").addClass("hidden");
        } else {
          $("#rap-container").removeClass("hidden");
          $("#snum-container").removeClass("hidden");
          $("#search-container").removeClass("hidden");
          $("#fwlf-container").removeClass("hidden");
          $("#srchA-container").removeClass("hidden");
          $("#np-container").removeClass("hidden");

          $("#details-panel2-lnk").closest("li").removeClass("hidden");
          $("#details-panel2").removeClass("hidden");
        }

        if (res) {
          $("#loading").addClass("hidden");
          $("#loadFD").empty();
          $("#notfound").addClass("hidden");
          $("#notfoundGC").addClass("hidden");
          showError();
          $("#errorHeader").val($("#urlStatic").text());
          $("#searchBttn").prop("disabled", false);
          $("#urlval").val($("#urlStatic").text());
          date = $("#date-range").val();
          $("#loadComp").html($.i18n("FetchdataComplete"));
          setQueryParams(oUrl, $start, $end);
          $("#loadComp").empty();
        } else {
          $("#loading").addClass("hidden");
          $("#loadFD").empty();
          hideError();
          $("#notfound").addClass("hidden");
          $("#notfoundGC").addClass("hidden");
          $("#whole-canvas").removeClass("hidden");
          $("#searchBttn").prop("disabled", false);
          $("#urlval").val($("#urlStatic").text());
          date = $("#date-range").val();
          $("#loadComp").html($.i18n("FetchdataComplete"));
          setQueryParams(oUrl, $start, $end);
          $("#loadComp").empty();

          // if not canada.ca site, hide these sections from the page
          if (!url.includes("www.canada.ca")) {
            // 👉️ substring is contained in string
            $("#srchA-container").addClass("hidden"); // Canada.ca site search terms leading to this page
            $("#snum-container").addClass("hidden"); // Canada.ca site searches started from this page
            $("#search-container").addClass("hidden"); // does not exist
            $("#h2href").addClass("hidden"); // View data for the equivalent French page
            $("#details-panel2").addClass("hidden"); // Google search analytics tab
            $("#details-panel2-lnk").closest("li").addClass("hidden"); // Google search analytics
          }

          $("#canvas-container").removeClass("hidden");
        }

        if ($dd == 0) {
          $("#gscDate").html($.i18n("Last30days"));
          $("#ddDate").html($.i18n("Last30days"));
        } else if ($dd == 1) {
          $("#gscDate").html($.i18n("Last7days"));
          $("#ddDate").html($.i18n("Last7days"));
        } else if ($dd == 2) {
          $("#gscDate").html($.i18n("Yesterday"));
          $("#ddDate").html($.i18n("Yesterday"));
        }
        // if sameDay (the date range is a single day) is true then hide the "to" date range becasue it is the same as the "from" date range
        if (sameDay) {
          $("#todaterange").addClass("hidden");
          $("#to").addClass("hidden");
          $("#todaterangegsc").addClass("hidden");
          $("#gscto").addClass("hidden");
          $("#chart-trnds").addClass("hidden"); // hide the daily visits graph in web analytics tab
          $("#chartgsc").addClass("hidden"); // hide the daily visits graph in gsc tab
        } else {
          $("#todaterange").removeClass("hidden");
          $("#to").removeClass("hidden");
          $("#todaterangegsc").removeClass("hidden");
          $("#gscto").removeClass("hidden");
          $("#chart-trnds").removeClass("hidden");
          $("#chartgsc").removeClass("hidden");
        }
      })
      .catch(console.error.bind(console));
    $success = 1; // set $success to 1, which is true, if we get to this point, then all the API calls were successful
  }
  // display error message notfound if $success is still 0 after all the API calls
  if (!$success) {
    //$("#loading-popup-modal").addClass("hidden");
    $("#loading").addClass("hidden");
    // if url is not empty, display notfound error message
    // if url is empty, no need for notfound error message because other error message already displayed
    if (url) {
      // if the url contains canada.ca or gc.ca
      if (url.includes("canada.ca") || url.includes("gc.ca")) {
        $("#notfoundGC").removeClass("hidden");
      } else {
        $("#notfound").removeClass("hidden");
      }
    }

    $("#notfound").attr(
      "data-gc-analytics-customcall",
      "CRA-ARC Page analytics tool - Error:Search unsuccessful"
    );
    _satellite.track("CUSTOM_TRACK");
  }
};
