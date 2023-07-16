const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.style.backgroundColor = 'black';
ctx.strokeStyle = '#00FF00';
for (let x = 0; x <= canvas.width; x += 50) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, canvas.height);
  ctx.stroke();
}

for (let y = 0; y <= canvas.height; y += 50) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(canvas.width, y);
  ctx.stroke();
}
let numCities;
const numAnts = 10;
const numIterations = 100;
const evaporationRate = 0.1;
const alpha = 1; 
const beta = 2;

let cities = [];
let pheromone = [];

const loadButton = document.getElementById('loadButton');
const runButton = document.getElementById('runButton');

loadButton.addEventListener('click', loadPoints);
runButton.addEventListener('click', runAntColonyOptimization);

function loadPoints() {
  numCities = parseInt(document.getElementById('numSurvival').value, 10);
  cities = generateRandomCities(numCities);
  drawCities();
  initializePheromoneMatrix();
}

function generateRandomCities(numCities) {
  const generatedCities = [];

  for (let i = 0; i < numCities; i++) {
    const x = Math.floor(Math.random() * canvas.width);
    const y = Math.floor(Math.random() * canvas.height);
    generatedCities.push({ x, y });
  }

  return generatedCities;
}

function drawCities() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff0000';

  cities.forEach(city => {
    ctx.beginPath();
    ctx.arc(city.x, city.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = '#00FF00';

  for (let x = 0; x <= canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function initializePheromoneMatrix() {
  pheromone = [];

  for (let i = 0; i < numCities; i++) {
    pheromone.push([]);

    for (let j = 0; j < numCities; j++) {
      pheromone[i][j] = 1;
    }
  }
}

function calculateDistance(city1, city2) {
  const dx = city1.x - city2.x;
  const dy = city1.y - city2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateProbabilities(ant, currentCity) {
  const probabilities = [];

  for (let i = 0; i < numCities; i++) {
    if (!ant.visited[i]) {
      const pheromoneLevel = pheromone[currentCity][i];
      const distance = calculateDistance(cities[currentCity], cities[i]);
      const probability = Math.pow(pheromoneLevel, alpha) * Math.pow(1 / distance, beta);
      probabilities.push({ cityIndex: i, probability });
    }
  }

  return probabilities;
}

function chooseNextCity(ant, currentCity) {
  const probabilities = calculateProbabilities(ant, currentCity);

  const totalProbability = probabilities.reduce((sum, { probability }) => sum + probability, 0);
  let random = Math.random() * totalProbability;

  for (const { cityIndex, probability } of probabilities) {
    random -= probability;
    if (random <= 0) {
      return cityIndex;
    }
  }

  return probabilities[probabilities.length - 1].cityIndex;
}

function updatePheromone(trails) {
  for (let i = 0; i < numCities; i++) {
    for (let j = 0; j < numCities; j++) {
      if (i !== j) {
        pheromone[i][j] *= 1 - evaporationRate;
      }
    }
  }

  for (const trail of trails) {
    const trailDistance = calculateDistanceOfTrail(trail);

    for (let i = 0; i < numCities - 1; i++) {
      const from = trail[i];
      const to = trail[i + 1];
      pheromone[from][to] += 1 / trailDistance;
      pheromone[to][from] += 1 / trailDistance;
    }
  }
}

function calculateDistanceOfTrail(trail) {
  let distance = 0;

  for (let i = 0; i < numCities - 1; i++) {
    const from = trail[i];
    const to = trail[i + 1];
    distance += calculateDistance(cities[from], cities[to]);
  }

  return distance;
}

function findBestTrail(trails) {
  let bestTrail = trails[0];
  let bestDistance = calculateDistanceOfTrail(bestTrail);

  for (let i = 1; i < trails.length; i++) {
    const trail = trails[i];
    const distance = calculateDistanceOfTrail(trail);

    if (distance < bestDistance) {
      bestTrail = trail;
      bestDistance = distance;
    }
  }

  return { trail: bestTrail, distance: bestDistance };
}

function runAntColonyOptimization() {
  const ants = [];
 
  for (let i = 0; i < numAnts; i++) {
    ants.push({ trail: [], visited: new Array(numCities).fill(false) });
  }

  let bestTrailOverall = null;

  for (let iteration = 0; iteration < numIterations; iteration++) {
    for (const ant of ants) {
      ant.trail = [];
      ant.visited.fill(false);

      const startCity = Math.floor(Math.random() * numCities);
      ant.trail.push(startCity);
      ant.visited[startCity] = true;

      let currentCity = startCity;

      while (ant.trail.length < numCities) {
        const nextCity = chooseNextCity(ant, currentCity);
        ant.trail.push(nextCity);
        ant.visited[nextCity] = true;
        currentCity = nextCity;
      }

      ant.trail.push(startCity);
    }

    const bestTrailIteration = findBestTrail(ants.map(ant => ant.trail));

    if (!bestTrailOverall || bestTrailIteration.distance < bestTrailOverall.distance) {
      bestTrailOverall = bestTrailIteration;
    }

    updatePheromone(ants.map(ant => ant.trail));
  }

  drawBestTrail(bestTrailOverall.trail);
  console.log(`Best Distance: ${bestTrailOverall.distance}`);
}

function drawBestTrail(trail) {
  
  ctx.strokeStyle = '#00FF00';

  for (let x = 0; x <= canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(cities[trail[0]].x, cities[trail[0]].y);

  for (let i = 1; i < trail.length; i++) {
    const city = cities[trail[i]];
    ctx.lineTo(city.x, city.y);
  }

  ctx.lineTo(cities[trail[0]].x, cities[trail[0]].y);
  ctx.strokeStyle = '#0000ff';
  ctx.stroke();
}

loadButton.addEventListener('click', loadPoints);
runButton.addEventListener('click', runAntColonyOptimization);
