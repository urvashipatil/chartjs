async function getPagewiseCountData() {
  let res = await fetch("http://localhost:3000/pagewisecount");
  let respData = await res.json();
  console.log(respData);

  let chartData = respData.reduce(
    (acc, item) => {
      acc.labels.push(item.SCREEN_FROM);
      acc.data.push(item.noOfFeedbacks);
      return acc;
    },
    { data: [], labels: [] }
  );

  renderPieChart(chartData);
}

async function getRatingsForPage(page) {
  let res = await fetch("http://localhost:3000/pagewisecount");
  let respData = await res.json();
  console.log(respData);

  let chartData = respData.reduce(
    (acc, item) => {
      acc.labels.push(item.SCREEN_FROM);
      acc.data.push(item.noOfFeedbacks);
      return acc;
    },
    { data: [], labels: [] }
  );

  renderPieChart(chartData);
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function renderPieChart(chartData) {
  var data = {
    datasets: [
      {
        data: chartData.data, //[11, 16, 7, 3, 14],
        backgroundColor: [
          "#FF6384",
          "#4BC0C0",
          "#FFCE56",
          "#E7E9ED",
          "#36A2EB",
        ],
        label: "My dataset", // for legend
      },
    ],
    labels: chartData.labels, //["Red", "Green", "Yellow", "Grey", "Blue"],
  };

  var pieOptions = {
    events: false,
    animation: {
      duration: 500,
      easing: "easeOutQuart",
      onComplete: function () {
        var ctx = this.chart.ctx;
        ctx.font = Chart.helpers.fontString(
          Chart.defaults.global.defaultFontFamily,
          "normal",
          Chart.defaults.global.defaultFontFamily
        );
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        this.data.datasets.forEach(function (dataset) {
          for (var i = 0; i < dataset.data.length; i++) {
            var model =
                dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
              total = dataset._meta[Object.keys(dataset._meta)[0]].total,
              mid_radius =
                model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
              start_angle = model.startAngle,
              end_angle = model.endAngle,
              mid_angle = start_angle + (end_angle - start_angle) / 2;

            var x = mid_radius * Math.cos(mid_angle);
            var y = mid_radius * Math.sin(mid_angle);

            ctx.fillStyle = "#fff";
            if (i == 3) {
              // Darker text color for lighter background
              ctx.fillStyle = "#444";
            }
            var percent =
              String(Math.round((dataset.data[i] / total) * 100)) + "%";
            ctx.fillText(dataset.data[i], model.x + x, model.y + y);
            // Display percent in another line, line break doesn't work for fillText
            ctx.fillText(percent, model.x + x, model.y + y + 15);
          }
        });
      },
    },
  };

  var pieChartCanvas = $("#pieChart");
  var pieChart = new Chart(pieChartCanvas, {
    type: "pie", // or doughnut
    data: data,
    options: pieOptions,
  });

  document.getElementById("pieChart").onclick = async function (evt) {
    var activePoints = pieChart.getElementsAtEvent(evt);
    if (activePoints[0]) {
      var chartData = activePoints[0]["_chart"].config.data;
      var idx = activePoints[0]["_index"];

      var label = chartData.labels[idx];
      var value = chartData.datasets[0].data[idx];

      let url = `http://localhost:3000/page/${label}`;

      // var url = "http://example.com/?label=" + label + "&value=" + value;
      console.log(url);
      alert(url);
      let res = await fetch(url);
      let respData = await res.json();
      console.log(respData);
      let barChartData = respData.reduce(
        (acc, item, index) => {
          // acc.labels.push(item.SCREEN_FROM);
          let existingLabel = acc.labels.find((l) => l == item.SCREEN_FROM);
          if (!existingLabel) {
            acc.labels.push(item.SCREEN_FROM);
          }
          acc.datasets.push({
            label: item.TotalRating,
            data: [item.count],
            // backgroundColor: `rgba(255, 99, 132, ${index + 1 * 0.8})`,
            backgroundColor: getRandomColor(),
          });
          // acc.data.push(item.count);
          return acc;
        },
        { labels: [], datasets: [] }
      );
      console.log("barChartData", barChartData);
      renderBarChart(barChartData);
    }
  };
}

function renderBarChart(chartData) {
  const data = {
    labels: chartData.labels, //["CSS"], //[chartData.labels[0]],
    datasets: chartData.datasets,
    // datasets: [
    //   {
    //     label: "Dataset 1",
    //     data: [14], //chartData.data,
    //     backgroundColor: "rgba(255, 99, 132, 0.7)",
    //   },
    //   {
    //     label: "Dataset 2",
    //     data: [20], //chartData.data,
    //     backgroundColor: "rgba(75, 192, 192, 0.7)",
    //   },
    //   {
    //     label: "Dataset 3",
    //     data: [20], //chartData.data,
    //     backgroundColor: "rgba(255, 159, 64, 0.8)",
    //   },
    // ],
  };

  var barChartCanvas = $("#barScreenWiseChart");
  var barChart = new Chart(barChartCanvas, {
    type: "bar",
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
          text: "Chart.js Bar Chart - Stacked",
        },
      },
      responsive: true,
      scales: {
        xAxes: [
          {
            //stacked: true,
            stacked: true,
            ticks: {
              beginAtZero: true,
              maxRotation: 0,
              minRotation: 0,
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    },
  });
}

async function renderBarChartForAllPages() {
  let url = `http://localhost:3000/allpages/ratings`;

  // var url = "http://example.com/?label=" + label + "&value=" + value;
  console.log(url);
  let res = await fetch(url);
  let respData = await res.json();
  console.log(respData);
  let barChartData = { labels: [], datasets: [] };
  let uniqueLabels = [];
  let uniqueStackLabels = _.uniqBy(respData, "TotalRating") || [];
  uniqueStackLabels = uniqueStackLabels.map((t) => t.TotalRating);
  console.log("uniqueStackLabels", uniqueStackLabels);
  respData.map((rd) => {
    let existingLabel = uniqueLabels.find((l) => l == rd.SCREEN_FROM);
    if (!existingLabel) {
      uniqueLabels.push(rd.SCREEN_FROM);
    }
  });
  barChartData.labels = uniqueLabels;
  let datasets = [];
  uniqueStackLabels.forEach((ratingLabel) => {
    let ratingData = [];
    let dataSetObject = {};
    dataSetObject.label = ratingLabel;
    dataSetObject.backgroundColor = getRandomColor();
    dataSetObject.data = [];
    uniqueLabels.map((pageLabel) => {
      let isRatingFound = false;
      respData.filter((d) => {
        if (d.SCREEN_FROM == pageLabel && d.TotalRating == ratingLabel) {
          dataSetObject.data.push(d.count);
          isRatingFound = true;
        }
      });
      if (!isRatingFound) {
        dataSetObject.data.push(0);
      }
    });
    datasets.push(dataSetObject);
  });

  barChartData.datasets = datasets;

  // let barChartData = respData.reduce(
  //   (acc, item, index) => {
  //     let existingLabel = acc.labels.find((l) => l == item.SCREEN_FROM);
  //     if (!existingLabel) {
  //       acc.labels.push(item.SCREEN_FROM);
  //     }
  //     //check if page present in dataset the push in its data
  //     let existingPage = acc.datasets.find((d) => d.label == item.TotalRating);
  //     if (existingPage) {
  //       existingPage.data.push(item.count);
  //     } else {
  //       acc.datasets.push({
  //         label: item.TotalRating,
  //         // label: item.SCREEN_FROM,
  //         data: [item.count],
  //         // backgroundColor: `rgba(255, 99, 132, ${index + 1 * 0.8})`,
  //         backgroundColor: getRandomColor(),
  //       });
  //     }
  //     // acc.data.push(item.count);
  //     return acc;
  //   },
  //   { labels: [], datasets: [] }
  // );
  console.log("barChartData", barChartData);
  // // renderBarChart(barChartData);

  var barScreensChart = $("#barScreensChart");
  var barChart = new Chart(barScreensChart, {
    type: "bar",
    data: barChartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: "Chart.js Bar Chart - Stacked",
        },
      },
      responsive: true,
      scales: {
        xAxes: [
          {
            //stacked: true,
            stacked: true,
            ticks: {
              beginAtZero: true,
              maxRotation: 0,
              minRotation: 0,
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    },
  });
}

async function renderBarChartForAllPagesQuarterwise() {
  let url = `http://localhost:3000/allpages/ratings/quarterwise`;

  // var url = "http://example.com/?label=" + label + "&value=" + value;
  console.log(url);
  let res = await fetch(url);
  let respData = await res.json();
  console.log(respData);
  let barChartData = { labels: [], datasets: [] };
  let uniqueLabels = [];
  let uniqueStackLabels = _.uniqBy(respData, "TotalRating") || [];
  uniqueStackLabels = uniqueStackLabels.map((t) => t.TotalRating);
  console.log("uniqueStackLabels", uniqueStackLabels);
  respData.map((rd) => {
    let existingLabel = uniqueLabels.find((l) => l == rd.quarter);
    if (!existingLabel) {
      uniqueLabels.push(rd.quarter);
    }
  });
  barChartData.labels = uniqueLabels;
  let datasets = [];
  uniqueStackLabels.forEach((ratingLabel) => {
    let ratingData = [];
    let dataSetObject = {};
    dataSetObject.label = ratingLabel;
    dataSetObject.backgroundColor = getRandomColor();
    dataSetObject.data = [];
    uniqueLabels.map((quarterLabel) => {
      let isRatingFound = false;
      respData.filter((d) => {
        if (d.quarter == quarterLabel && d.TotalRating == ratingLabel) {
          dataSetObject.data.push(d.count);
          isRatingFound = true;
        }
      });
      if (!isRatingFound) {
        dataSetObject.data.push(0);
      }
    });
    datasets.push(dataSetObject);
  });

  barChartData.datasets = datasets;

  // let barChartData = respData.reduce(
  //   (acc, item, index) => {
  //     let existingLabel = acc.labels.find((l) => l == item.SCREEN_FROM);
  //     if (!existingLabel) {
  //       acc.labels.push(item.SCREEN_FROM);
  //     }
  //     //check if page present in dataset the push in its data
  //     let existingPage = acc.datasets.find((d) => d.label == item.TotalRating);
  //     if (existingPage) {
  //       existingPage.data.push(item.count);
  //     } else {
  //       acc.datasets.push({
  //         label: item.TotalRating,
  //         // label: item.SCREEN_FROM,
  //         data: [item.count],
  //         // backgroundColor: `rgba(255, 99, 132, ${index + 1 * 0.8})`,
  //         backgroundColor: getRandomColor(),
  //       });
  //     }
  //     // acc.data.push(item.count);
  //     return acc;
  //   },
  //   { labels: [], datasets: [] }
  // );
  console.log("barChartQuarterData", barChartData);
  // // renderBarChart(barChartData);

  var barScreensChart = $("#barQuarterwiseChart");
  var barChart = new Chart(barScreensChart, {
    type: "bar",
    data: barChartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: "Chart.js Bar Chart - Stacked",
        },
      },
      responsive: true,
      scales: {
        xAxes: [
          {
            //stacked: true,
            stacked: true,
            ticks: {
              beginAtZero: true,
              maxRotation: 0,
              minRotation: 0,
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    },
  });
}

$(function () {
  getPagewiseCountData();
  renderBarChartForAllPages();
  renderBarChartForAllPagesQuarterwise();
});
