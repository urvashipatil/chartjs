function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
//E31928
function getColor(rating) {
  switch (rating.toLowerCase()) {
    case "positive":
      return "#068E3E";
    case "negative":
      return "#ED7D31";
    default:
      return "#AEAEAE";
  }
}

async function renderPercentage() {
  let url = `http://localhost:3000/getpercentage`;

  console.log(url);
  let res = await fetch(url);
  let respData = await res.json();
  let negative = respData.find((r) => r.TotalRating == "Negative");
  $("#dvNegativePercent").html((negative ? negative["percentage"] : 0) + "%");
  let positive = respData.find((r) => r.TotalRating == "Positive");
  $("#dvPositivePercent").html((positive ? positive["percentage"] : 0) + "%");
  let neutral = respData.find((r) => r.TotalRating == "Neutral");
  $("#dvNeutralPercent").html((neutral ? neutral["percentage"] : 0) + "%");
}

async function renderBarChartForAllPages() {
  let url = `http://localhost:3000/allpages/ratings`;

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
    dataSetObject.backgroundColor = getColor(ratingLabel); //getRandomColor();
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

  console.log("barChartData", barChartData);

  var barScreensChart = $("#barScreensChart");
  var barChart = new Chart(barScreensChart, {
    type: "bar",
    data: barChartData,
    options: {
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
            stepSize: 1,
          },
        },
      },
      // plugins: {
      //   title: {
      //     display: true,
      //     text: "Chart.js Bar Chart - Stacked",
      //   },
      // },
      responsive: true,
      // scales: {
      //   xAxes: [
      //     {
      //       // stacked: true,
      //       ticks: {
      //         beginAtZero: true,
      //         maxRotation: 0,
      //         minRotation: 0,
      //       },
      //     },
      //   ],
      //   yAxes: [
      //     {
      //       // stacked: true,
      //       stepSize: 1,
      //       grace: "5%",
      //     },
      //   ],
      // },
    },
  });
}

async function renderLineChartDaywise() {
  let url = `http://localhost:3000/allpages/ratings/datewise`;

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
    let existingLabel = uniqueLabels.find((l) => l == rd.DATE_CREATED);
    if (!existingLabel) {
      uniqueLabels.push(rd.DATE_CREATED);
    }
  });
  barChartData.labels = uniqueLabels;
  let datasets = [];
  uniqueStackLabels.forEach((ratingLabel) => {
    let ratingData = [];
    let dataSetObject = {};
    dataSetObject.label = ratingLabel;
    dataSetObject.borderColor = getColor(ratingLabel); //getRandomColor();
    dataSetObject.fill = false;
    dataSetObject.data = [];
    uniqueLabels.map((pageLabel) => {
      let isRatingFound = false;
      respData.filter((d) => {
        if (d.DATE_CREATED == pageLabel && d.TotalRating == ratingLabel) {
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

  console.log("lineChart", barChartData);

  var barScreensChart = $("#lineChart");
  var barChart = new Chart(barScreensChart, {
    type: "line",
    data: barChartData,
    options: {
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
            stepSize: 1,
          },
        },
      },
      // plugins: {
      //   title: {
      //     display: true,
      //     text: "Chart.js Bar Chart - Stacked",
      //   },
      // },
      responsive: true,
      // scales: {
      //   xAxes: [
      //     {
      //       ticks: {
      //         beginAtZero: true,
      //         maxRotation: 0,
      //         minRotation: 0,
      //       },
      //     },
      //   ],
      //   yAxes: [
      //     {
      //       // stacked: true,
      //     },
      //   ],
      // },
    },
  });
}

async function getLatestComments() {
  let url = `http://localhost:3000/getlatestcomments`;

  console.log(url);
  let res = await fetch(url);
  let respData = await res.json();
  console.log(respData);
  let commentsHtml = "";
  respData.map((obj) => {
    commentsHtml += `
    <div class="comment-block rounded">
      <div>User Id - ${obj.userId}</div>
      <div> ${obj.comment}</div>
    </div>`;
  });
  $("#dvComments").html(commentsHtml);
}

$(function () {
  renderPercentage();
  renderBarChartForAllPages();
  renderLineChartDaywise();
  getLatestComments();
});
