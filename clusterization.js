let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let canvasSize;
function createCanvas(){
    canvasSize = parseInt(document.getElementById('size').value);
    if (canvasSize > 20) {
        canvasSize = 20;
      }

    canvas.width = canvasSize * 50;
    canvas.height = canvasSize * 50;

    ctx.beginPath();
    for(let i = 0; i <= canvas.width; i += 50){
        ctx.moveTo(i,0);
        ctx.lineTo(i,canvas.height);
    }
    for (let i = 0; i <= canvas.width; i += 50) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }
    for (let i = 0; i <= canvas.height; i += 50) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
    canvas.style.backgroundColor = 'black';
    ctx.strokeStyle = "#ccc";
    ctx.stroke();  
}
var data = [];
let start = null;
canvas.addEventListener('click', handleClick);

function handleClick(event) {
    let x = event.clientX - canvas.offsetLeft;
    let y = event.clientY - canvas.offsetTop;

    let row = Math.floor(y / 50);
    let col = Math.floor(x / 50);


    data.push([col, row]);
    drawCell(row, col, '#0f0');
}

function drawCell(row, col, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * 50, row * 50, 50, 50);
}

function clusters(){
  let kVal = document.getElementById("clusternum");
  let k = kVal.value;
  
  var kmeans = new KMeans({
    canvas: canvas,
    context: ctx,
    data: data,
    k: k
  });
}
function KMeans(opts) {
  if (!(this instanceof KMeans)) {
    return new KMeans(opts);
  }

  opts = opts || {};
  this.canvas = opts.canvas;
  this.context = opts.context;
  this.width = this.canvas.width;
  this.height = this.canvas.height;

  this.k = opts.k;

  this.data = opts.data;

  this.assignments = [];

  this.extents = this.dataDimensionExtents();

  this.ranges = this.dataExtentRanges();

  this.means = this.seeds();

  this.clusterColors = this.clusterColors();

  this.iterations = 0;

  this.draw();

  this.drawDelay = 20;

  this.run();
}

KMeans.prototype.dataDimensionExtents = function() {
  data = data || this.data;
  var extents = [];

  for (var i = 0; i < data.length; i++) {
    var point = data[i];

    for (var j = 0; j < point.length; j++) {
      if (!extents[j]) {
        extents[j] = {min: 1000, max: 0};
      }

      if (point[j] < extents[j].min) {
        extents[j].min = point[j];
      }

      if (point[j] > extents[j].max) {
        extents[j].max = point[j];
      }
    }
  }

  return extents;
};

KMeans.prototype.dataExtentRanges = function() {
  var ranges = [];

  for (var i = 0; i < this.extents.length; i++) {
    ranges[i] = this.extents[i].max - this.extents[i].min;
  }

  return ranges;
};

KMeans.prototype.seeds = function() {
  var means = [];
  while (this.k--) {
    var mean = [];

    for (var i = 0; i < this.extents.length; i++) {
      mean[i] = this.extents[i].min + (Math.random() * this.ranges[i]);
    }

    means.push(mean);
  }

  return means;
};

KMeans.prototype.assignClusterToDataPoints = function() {
  var assignments = [];

  for (var i = 0; i < this.data.length; i++) {
    var point = this.data[i];
    var distances = [];

    for (var j = 0; j < this.means.length; j++) {
      var mean = this.means[j];
      var sum = 0;

      for (var dim = 0; dim < point.length; dim++) {
        var difference = point[dim] - mean[dim];

        difference = Math.pow(difference, 2);

        sum += difference;
      }

      distances[j] = Math.sqrt(sum);
    }

    assignments[i] = distances.indexOf(Math.min.apply(null, distances));
  }

  return assignments;
};

KMeans.prototype.moveMeans = function() {
  var sums = fillArray(this.means.length, 0);
  var counts = fillArray(this.means.length, 0);
  var moved = false;
  var i;
  var meanIndex;
  var dim;

  for (i = 0; i < this.means.length; i++) {
    sums[i] = fillArray(this.means[i].length, 0);
  }

  for (var pointIndex = 0; pointIndex < this.assignments.length; pointIndex++) {
    meanIndex = this.assignments[pointIndex];
    var point = this.data[pointIndex];
    var mean = this.means[meanIndex];

    counts[meanIndex]++;

    for (dim = 0; dim < mean.length; dim++) {
      sums[meanIndex][dim] += point[dim];
    }
  }

  for (meanIndex = 0; meanIndex < sums.length; meanIndex++) {
    if (0 === counts[meanIndex]) {
      sums[meanIndex] = this.means[meanIndex];

      for (dim = 0; dim < this.extents.length; dim++) {
        sums[meanIndex][dim] = this.extents[dim].min + (Math.random() * this.ranges[dim]);
      }
      continue;
    }

    for (dim = 0; dim < sums[meanIndex].length; dim++) {
      sums[meanIndex][dim] /= counts[meanIndex];
      sums[meanIndex][dim] = Math.round(100*sums[meanIndex][dim])/100;
    }
  }

  if (this.means.toString() !== sums.toString()) {
    var diff;
    moved = true;

    for (meanIndex = 0; meanIndex < sums.length; meanIndex++) {
      for (dim = 0; dim < sums[meanIndex].length; dim++) {
        diff = (sums[meanIndex][dim] - this.means[meanIndex][dim]);
        if (Math.abs(diff) > 0.1) {
          var stepsPerIteration = 10;
          this.means[meanIndex][dim] += diff / stepsPerIteration;
          this.means[meanIndex][dim] = Math.round(100*this.means[meanIndex][dim])/100;
        } else {
          this.means[meanIndex][dim] = sums[meanIndex][dim];
        }
      }
    }
  }

  return moved;
};

KMeans.prototype.run = function() {
  ++this.iterations;

  this.assignments = this.assignClusterToDataPoints();

  var meansMoved = this.moveMeans();

  if (meansMoved) {
    this.draw();
    this.timer = setTimeout(this.run.bind(this), this.drawDelay);
  }
};

KMeans.prototype.draw = function() {

  var point;
  var i;

  for (i = 0; i < this.assignments.length; i++) {
    var meanIndex = this.assignments[i];
    point = this.data[i];
    var mean = this.means[meanIndex];

    this.context.globalAlpha = 0.1;

    this.context.save();

    this.context.beginPath();

    this.context.moveTo(
      (point[0] - this.extents[0].min + 1) * (this.width / (this.ranges[0] + 2)),
      (point[1] - this.extents[1].min + 1) * (this.height / (this.ranges[1] + 2))
    );

    this.context.lineTo(
      (mean[0] - this.extents[0].min + 1) * (this.width / (this.ranges[0] + 2)),
      (mean[1] - this.extents[1].min + 1) * (this.height / (this.ranges[1] + 2))
    );

    this.context.strokeStyle = 'white';
    this.context.stroke();

    this.context.restore();
  }

  for (i = 0; i < data.length; i++) {
    this.context.save();

    point = this.data[i];

    this.context.globalAlpha = 1;

    this.context.translate(
      (point[0] - this.extents[0].min + 1) * (this.width / (this.ranges[0] + 2)),
      (point[1] - this.extents[1].min + 1) * (this.width / (this.ranges[1] + 2))
    );

    this.context.beginPath();

    this.context.arc(0, 0, 5, 0, Math.PI*2, true);

    this.context.strokeStyle = this.clusterColor(this.assignments[i]);

    this.context.stroke();
    this.context.closePath();

    this.context.restore();
  }

  for (i = 0; i < this.means.length; i++) {
    this.context.save();

    point = this.means[i];

    this.context.globalAlpha = 0.5;
    this.context.fillStyle = this.clusterColor(i);
    this.context.translate(
      (point[0] - this.extents[0].min + 1) * (this.width / (this.ranges[0] + 2)),
      (point[1] - this.extents[1].min + 1) * (this.width / (this.ranges[1] + 2))
    );
    this.context.beginPath();
    this.context.arc(0, 0, 5, 0, Math.PI*2, true);
    this.context.fill();
    this.context.closePath();

    this.context.restore();
  }
};


KMeans.prototype.clusterColors = function() {
  var colors = [];

  for (var i = 0; i < this.data.length; i++) {
    colors.push('#'+((Math.random()*(1<<24))|0).toString(16));
  }

  return colors;
};

KMeans.prototype.clusterColor = function(n) {
  return this.clusterColors[n];
};

function fillArray(length, val) {
  return Array.apply(null, Array(length)).map(function() { return val; });
}
