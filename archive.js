/*
 * @Author: paulinegaudet-chardonnet
 * @Date:   2016-07-26 16:29:10
 * @Last Modified by:   Pauline GC
 * @Last Modified time: 2016-07-29 15:32:30
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
        self.chart = '';
        this.archiveList();

        this.arrayColors = ['#7FFFD4', '#0000FF', '#8A2BE2', '#8B008B', '#A52A2A', '#00008B', '#DC143C', '#6495ED', '#006400', '#8FBC8F', '#00008B', '#B8860B', '#FF7F50', '#CD5C5C', '#20B2AA', '#00CED1', '#9400D3', '#008000', '#778899', '#00FA9A', '#6B8E23'];

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
                    index = 0;
                for (var i = 0; i < nb; i++) {
                    list.innerHTML += '<li><a href="#" class="chart" data-chart="' + index + '">Chart ' + index + '</a></li>';
                    index++
                }
            }
        });
    },

    openArchive: function(e) {
        var targetChart = e.target.dataset.chart,
            divChart = document.getElementById('current-chart'),
            self = this;

        var prom = new Promise(function(resolve, reject) {

            $.ajax({
                url: 'output/chart/chart_' + targetChart + '.json'
            }).done(resolve).fail(reject).then(
                function(data) {
                    self.canvasChart(data);
                });
        });

    },

    canvasChart: function(data) {

        this.canvasChart = new CanvasJS.Chart('current-chart', {
            data: data,
            colorSet: this.arrayColors,
            zoomEnabled: true,
            title: {
                text: "Live Emotions"
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
                itemclick: function(e) {
                    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    } else {
                        e.dataSeries.visible = true;
                    }
                    e.chart.render();
                }
            }
        });
        this.canvasChart.render();
    }
};
