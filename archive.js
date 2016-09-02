/*
* @Author: paulinegaudet-chardonnet
* @Date:   2016-07-26 16:29:10
* @Last Modified by:   Pauline GC
* @Last Modified time: 2016-07-31 15:41:27
*/

'use strict';

// 1 - détecteur émotions --> graphique
// 2 - enregistrement caméra
// 3 - enregistrement écran

var app = {

  init: function() {
    var self = this;
    this.start = new Date();
    this.timeCapture = null;
    this.nbExpressions = 21;
    self.charts = [];
    this.archiveList();
    this.prom;
    this.i = 0;

    this.arrayColors = ['#0000FF', '#8A2BE2', '#8B008B', '#A52A2A', '#00008B', '#DC143C', '#6495ED', '#006400', '#8FBC8F', '#00008B', '#B8860B', '#FF7F50', '#CD5C5C', '#20B2AA', '#00CED1', '#9400D3', '#008000', '#778899', '#00FA9A', '#6B8E23', '#e44', '#f56', '#a91', '#C400E2', '#00A6E2', '#0DCE00', '#4933DD'];
    CanvasJS.addColorSet('customColors', this.arrayColors);

    document.getElementById('archive-list').addEventListener('click', function(e) {
      e.preventDefault();
      self.openArchive(e);
    });
  },

  archiveList: function() {
    $.ajax({
      url: 'count_list.php',
      success: function(nb) {
        var list = document.getElementById('archive-list'),
          index = 1;
        for (var i = 0; i < nb; i++) {
          list.innerHTML += '<a href="#" class="list-group-item chart" data-chart="' + index + '">Chart ' + index + '</a>';
          index++
        }
      }
    });
  },
  initVideoView: function(target) {
    var self = this;
    var video = document.getElementById('video');
    var source = document.createElement('source');

    source.setAttribute('src', 'http://localhost/user-test/output/video/' + target + '.webm');
    video.appendChild(source);
    video.className += 'video-js vjs-default-skin controls';

    video.addEventListener('timeupdate', function(time) {
      self.updateChart();
    });

    videojs("video", {
      "controls": true,
      "autoplay": false,
      "muted": true,
    });

  },

  openArchive: function(e) {
    var targetChart = e.target.dataset.chart,
      divChart = document.getElementById('current-chart'),
      self = this;

    this.initVideoView(targetChart);

    $.ajax({
      url: 'output/chart/chart_' + targetChart + '.json'
    }).then(
      function(data) {
        self.charts = data;
        self.canvasChartFn();
      });
  },

  updateChart: function() {
    var index = this.i++;

    for (var i = 0; i < 21; i++) {
      this.newChart[i].dataPoints.push({
        x: this.charts[i].dataPoints[index].x,
        y: this.charts[i].dataPoints[index].y
      });
    }

    this.canvasChart.render();
  },

  canvasChartFn: function() {

    this.newChart = [];
    this.dps = []; // dataPoints

    for (var i = 0; i < 21; i++) {
      this.dps[i] = [];

      //config charts
      this.newChart.push({
        type: "splineArea", //scatter, splineArea
        dataPoints: this.dps[i],
        markerSize: 4,
        showInLegend: true,
        xVal: 0,
        yVal: 0,
        visible: false
      });
    }

    this.canvasChart = new CanvasJS.Chart('current-chart', {
      colorSet: 'customColors',
      data: this.newChart,
      zoomEnabled: true,
      height: 500,
      title: {
        text: "Emotions chart"
      },
      theme: "theme2",
      axisX: {
        title: "Temps",
        labelFormatter: function(e) {
          return ' ';
        }
      },
      axisY: {
        title: "Intensité",
        tickLength: 10
      },
      legend: {
        cursor: "pointer",
        fontSize: 18,
        fontFamily: "tahoma",
        itemWidth: 250,
        maxWidth: 800,
        itemclick: function(e) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      }
    });
  // this.canvasChart.render();
  }
};
