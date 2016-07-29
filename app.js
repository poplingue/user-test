/*
 * @Author: paulinegaudet-chardonnet
 * @Date:   2016-07-26 16:29:10
 * @Last Modified by:   Pauline GC
 * @Last Modified time: 2016-07-29 11:15:08
 */

'use strict';

// 1 - détecteur émotions --> graphique
// 2 - enregistrement caméra
// 3 - enregistrement écran

var app = {

    init: function() {
        this.start = new Date();
        this.timeCapture = null;
        this.now = null;
        this.chunks = [];
        this.detector = null;
        this.nbExpressions = 21;
        this.listExp = false;
        var self = this;

        this.arrayColors = ['#7FFFD4', '#0000FF', '#8A2BE2', '#8B008B', '#A52A2A', '#00008B', '#DC143C', '#6495ED', '#006400', '#8FBC8F', '#00008B', '#B8860B', '#FF7F50', '#CD5C5C', '#20B2AA', '#00CED1', '#9400D3', '#008000', '#778899', '#00FA9A', '#6B8E23'];

        this.expressionCaptationInit();
        this.canvasChartInit();

        document.getElementById('start').addEventListener('click', function() {
            self.detector.start();
            self.webcamRecorder();
        });

        document.getElementById('stop').addEventListener('click', function() {
            self.mediaRecorder.stop();
            self.getMediaRecorded();
            self.detector.stop();
        });

        this.detector.addEventListener("onImageResultsSuccess", function(faces) {
            self.expressionsCapture(faces);
        });

    },

    hasGetUserMedia: function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
    },

    webcamRecorder: function() {
        var self = this,
            constraints,
            startRecording,
            options;

        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

        if (this.hasGetUserMedia()) {

            //options capture
            options = { "audio": true, "video": { "mandatory": { "minWidth": 320, "maxWidth": 320, "minHeight": 240, "maxHeight": 240 }, "optional": [] } };

            startRecording = function(stream) {
                var options = { mimeType: 'video/webm;codecs=vp9' };
                self.mediaRecorder = new MediaRecorder(stream, options);
                self.mediaRecorder.start();

                self.mediaRecorder.ondataavailable = function(e) {
                    self.chunks.push(e.data);
                };
            }

            navigator.getUserMedia(options, startRecording, this.errorCallback);

        } else {
            alert('getUserMedia() is not supported in your browser');
        }
    },

    getMediaRecorded: function() {
        var blob, today, nam, videoURL, downloadLink;

        blob = new Blob(this.chunks, { type: "video/webm" });
        this.chunks = [];

        //get temp url media
        videoURL = window.URL.createObjectURL(blob);

        //update link to download video file
        downloadLink = document.getElementById('downloadLink');
        downloadLink.href = videoURL;
        downloadLink.innerHTML = 'Download video file';

        today = new Date();
        name = "video_" + today.getDate() + "_" + (parseInt(today.getMonth()) + 1) + "_" + today.getFullYear() + "_" + today.getHours() + "h" + today.getMinutes() + ".webm";

        downloadLink.setAttribute("download", name);
        downloadLink.setAttribute("name", name);
    },

    errorCallback: function() {
        console.log('error video recorder');
    },

    expressionCaptationInit: function() {

        var divRoot = document.getElementById('affdex_elements');
        // The captured frame's width in pixels
        var width = 640;
        // The captured frame's height in pixels
        var height = 480;
        /*
           Face detector configuration - If not specified, defaults to 
           affdex.FaceDetectorMode.LARGE_FACES
           affdex.FaceDetectorMode.LARGE_FACES=Faces occupying large portions of the frame
           affdex.FaceDetectorMode.SMALL_FACES=Faces occupying small portions of the frame
        */
        var faceMode = affdex.FaceDetectorMode.LARGE_FACES;

        //Construct a CameraDetector and specify the image width / height and face detector mode.
        this.detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
        this.detector.detectAllExpressions();

        //prepare array of arrays expression
        this.expArray = [];
        for (var i = 0; i < this.nbExpressions; i++) {
            this.expArray[i] = [];
        }

    },

    expressionsCapture: function(faces) {

        var i = 0,
            self = this;

        if (faces[0]) {

            //loop object containing expressions x21
            for (var prop in faces[0].expressions) {

                self.expArray[i].push({
                    expValue: faces[0].expressions[prop].toFixed ? Number(faces[0].expressions[prop].toFixed(0)) : faces[0].expressions[prop],
                    expression: prop
                });

                //list expressions
                if (!this.listExp) {
                    // document.getElementById('expression-list').innerHTML += '<li style="color:' + this.arrayColors[i] + '">' + prop + '</li>';
                    this.chart[i].legendText = prop;
                }

                i++;
            }
            self.updateChart();
            //update canvas chart each expression's change
            this.listExp = true;

        }
    },

    canvasChartInit: function() {
        var self = this;
        this.chart = [];
        this.dps = []; // dataPoints
        this.xVal;

        for (var i = 0; i < this.nbExpressions; i++) {

            this.dps[i] = [];

            //config charts
            this.chart.push({
                type: "splineArea", //scatter, splineArea
                dataPoints: this.dps[i],
                markerSize: 4,
                showInLegend: true,
                xVal: 0,
                yVal: 0,
                visible: false
            });
        }

        //config canvas
        this.canvasChart = new CanvasJS.Chart("chartContainer", {
            data: self.chart,
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

        this.dataLength = 200; // number of dataPoints visible at any point

    },

    updateChart: function() {
        var count = count || 1;
        // count is number of times loop runs to generate random dataPoints.
        this.now = +new Date();
        this.timeCapture = ((this.now - this.start) / 1000) % 60;

        for (var j = 0; j < count; j++) {

            for (var i = 0; i < this.nbExpressions; i++) {

                this.chart[i].yVal = this.expArray[i][this.expArray[i].length - 1].expValue;

                this.chart[i].dataPoints.push({
                    x: this.timeCapture,
                    y: this.chart[i].yVal
                });

                //to limit length of chart
                // if (this.chart[i].dataPoints.length > this.dataLength) {
                //     this.chart[i].dataPoints.shift();
                // }

            }

        };

        this.canvasChart.render();
    }
};
