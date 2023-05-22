const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.style.backgroundColor = 'black';
ctx.strokeStyle = '#00FF00';
const populationSize = 100;
const mutationRate = 0.02;
const generations = 100;
let cities = [];
let Cities;

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

const loadButton = document.getElementById('loadButton');
const runButton = document.getElementById('runButton');

loadButton.addEventListener('click', loadPoints);
runButton.addEventListener('click', runGeneticAlgorithm);

function loadPoints() {
  let bestRoute = null;
  Cities = parseInt(document.getElementById('numCities').value, 10);
  cities = generateRandomCities(Cities);
  drawCities();
}

function generateRandomCities(numCities) {
  const generatedCities = [];
  const canvasRect = canvas.getBoundingClientRect();

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

function runGeneticAlgorithm() {
  if (cities.length < 2) {
    alert('Please load cities points first.');
    return;
  }

  const ga = new GeneticAlgorithm(cities, populationSize, mutationRate, generations);
  ga.runAnimation();
}

class GeneticAlgorithm {
  constructor(cities, populationSize, mutationRate, generations) {
    this.cities = cities;
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.generations = generations;
    this.population = [];
    this.bestRoute = null;
    this.animationFrame = null;
  }

  runAnimation() {
    this.initializePopulation();
    this.evaluatePopulation();

    this.animationFrame = requestAnimationFrame(this.animationLoop.bind(this));
  }

  animationLoop() {
    this.selection();
    this.crossover();
    this.mutation();
    this.evaluatePopulation();
    this.drawBestRoute();

    if (this.generations > 0) {
      this.generations--;
      setTimeout(this.animationLoop.bind(this), 50);
    }
  }

  initializePopulation() {
    for (let i = 0; i < this.populationSize; i++) {
      const route = this.cities.slice();
      this.shuffleArray(route);
      this.population.push({ route });
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  evaluatePopulation() {
    this.population.forEach(individual => {
      individual.distance = this.calculateDistance(individual.route);
    });

    this.population.sort((a, b) => a.distance - b.distance);
    this.bestRoute = this.population[0];
  }

  calculateDistance(route) {
    let distance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const cityA = route[i];
      const cityB = route[i + 1];
      distance += this.calculateDistanceBetweenCities(cityA, cityB);
    }
    return distance;
  }

  calculateDistanceBetweenCities(cityA, cityB) {
    const dx = cityA.x - cityB.x;
    const dy = cityA.y - cityB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  selection() {
    const selectedIndividuals = [];
  
    while (selectedIndividuals.length < this.populationSize) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      const selectedIndividual = this.population[randomIndex];
      selectedIndividuals.push(selectedIndividual);
    }

    this.population = selectedIndividuals;
  }

  selectParent() {
    const randomIndex = Math.floor(Math.random() * this.population.length);
    return this.population[randomIndex];
  }

  performCrossover(parent1Route, parent2Route) {
    const length = parent1Route.length;
    const child1 = new Array(length).fill(null);
    const child2 = new Array(length).fill(null);

    const startPoint = Math.floor(Math.random() * length);
    const endPoint = Math.floor(Math.random() * (length - startPoint)) + startPoint;

    for (let i = startPoint; i <= endPoint; i++) {
      child1[i] = parent1Route[i];
      child2[i] = parent2Route[i];
    }

    let childIndex = (endPoint + 1) % length;
    let parentIndex = (endPoint + 1) % length;

    while (child1.includes(null)) {
      const parentGene = parent2Route[parentIndex];
      if (!child1.includes(parentGene)) {
        child1[childIndex] = parentGene;
      }
      parentIndex = (parentIndex + 1) % length;
      childIndex = (childIndex + 1) % length;
    }

    childIndex = (endPoint + 1) % length;
    parentIndex = (endPoint + 1) % length;

    while (child2.includes(null)) {
      const parentGene = parent1Route[parentIndex];
      if (!child2.includes(parentGene)) {
        child2[childIndex] = parentGene;
      }
      parentIndex = (parentIndex + 1) % length;
      childIndex = (childIndex + 1) % length;
    }

    return [child1, child2];
  }

  crossover() {
    const offspring = [];

    while (offspring.length < this.populationSize) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();
      const [child1, child2] = this.performCrossover(parent1.route, parent2.route);
      offspring.push({ route: child1 });
      offspring.push({ route: child2 });
    }

    this.population = offspring;
  }

  mutation() {
    for (let i = 0; i < this.population.length; i++) {
      const individual = this.population[i];

      if (Math.random() < this.mutationRate) {
        const mutatedRoute = this.performSwapMutation(individual.route);
        individual.route = mutatedRoute;
      }
    }
  }

  performSwapMutation(route) {
    const mutatedRoute = route.slice();

    const position1 = Math.floor(Math.random() * mutatedRoute.length);
    let position2 = Math.floor(Math.random() * mutatedRoute.length);

    while (position2 === position1) {
      position2 = Math.floor(Math.random() * mutatedRoute.length);
    }

    [mutatedRoute[position1], mutatedRoute[position2]] = [mutatedRoute[position2], mutatedRoute[position1]];

    return mutatedRoute;
  }

  drawBestRoute() {
    canvas.style.backgroundColor = 'black';
    ctx.beginPath();
    ctx.moveTo(this.bestRoute.route[0].x, this.bestRoute.route[0].y);

    this.bestRoute.route.forEach(city => {
      ctx.lineTo(city.x, city.y);
    });

    ctx.lineTo(this.bestRoute.route[0].x, this.bestRoute.route[0].y);
    ctx.strokeStyle = '#0000ff';
    ctx.stroke();
  }
}
