let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let canvasSize;
function createCanvas(){
    canvasSize = parseInt(document.getElementById('size').value);
    if (canvasSize > 30) {
      alert("The size of the canvas should be minimal 30");
      return;
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
let matrix;
canvas.addEventListener('mousedown', handleClick);

function handleClick(event) {
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
    let cellSize = canvas.width / canvasSize;

    let row = Math.floor(y / cellSize);
    let col = Math.floor(x / cellSize);

    data.push([row, col]);
    drawCell(row, col, '#0f0');
    matrix = createMatrix(canvasSize, data);

}
function createMatrix(size, data) {
  const matrix = Array(size).fill().map(() => Array(size).fill(0));
  for (const [row, col] of data) {
    matrix[row][col] = 1;
  }
  return matrix;
}

function drawCell(row, col, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * 50, row * 50, 50, 50);
}

function clusters(){
  data = [];
  start = null;

  let kVal = document.getElementById("clusternum");
  let k = kVal.value;
  if(k>7){
    alert("There are only 7 different colors");
  }
  const clusters = kMeansClustering(matrix, k);

const colors = ['#f60984', '#b103ab', '#620186', '#2c0271', '#080149', '#808080','#993300'];

for (let i = 0; i < clusters.length; i++) {
  const cluster = clusters[i];
  const color = colors[i % colors.length];
  for (const point of cluster) {
    drawCell(point.y, point.x, color);
    ctx.strokeStyle = "#ccc";
  }
}
}

function kMeansClustering(matrix, k) {
  const points = [];
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === 1) {
        points.push({ x: col, y: row });
      }
    }
  }

  let centroids = initializeCentroids(points, k);
  let clusters = assignPointsToClusters(points, centroids);
  let prevCentroids;

  do {
    prevCentroids = centroids;

    centroids = calculateCentroids(clusters);

    clusters = assignPointsToClusters(points, centroids);
  } while (!hasConverged(prevCentroids, centroids));

  return clusters;
}

function initializeCentroids(points, k) {
  const centroids = [];
  const pointsCopy = [...points];
  while (centroids.length < k) {
    const randomIndex = Math.floor(Math.random() * pointsCopy.length);
    const centroid = pointsCopy.splice(randomIndex, 1)[0];
    centroids.push(centroid);
  }

  return centroids;
}

function assignPointsToClusters(points, centroids) {
  const clusters = new Array(centroids.length).fill().map(() => []);

  for (const point of points) {
    let minDistance = Infinity;
    let closestCentroidIndex = 0;

    for (let i = 0; i < centroids.length; i++) {
      const centroid = centroids[i];
      const distance = euclideanDistance(point, centroid);

      if (distance < minDistance) {
        minDistance = distance;
        closestCentroidIndex = i;
      }
    }

    clusters[closestCentroidIndex].push(point);
  }

  return clusters;
}

function calculateCentroids(clusters) {
  return clusters.map((cluster) => {
    const clusterSize = cluster.length;
    const clusterSum = cluster.reduce(
      (sum, point) => ({
        x: sum.x + point.x,
        y: sum.y + point.y,
      }),
      { x: 0, y: 0 }
    );
    return {
      x: clusterSum.x / clusterSize,
      y: clusterSum.y / clusterSize,
    };
  });
}

function euclideanDistance(pointA, pointB) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function hasConverged(prevCentroids, centroids) {
  for (let i = 0; i < centroids.length; i++) {
    if (euclideanDistance(prevCentroids[i], centroids[i]) > 0.0001) {
      return false;
    }
  }
  return true;
}