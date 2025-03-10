import React, { useState, useEffect, useRef } from 'react';

const TravelingSalesmanVisualizer = () => {
  // State for visualization parameters
  const [cities, setCities] = useState([]);
  const [cityCount, setCityCount] = useState(20);
  const [algorithm, setAlgorithm] = useState('nearestNeighbor');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(50); // 10-200 range
  const [solutions, setSolutions] = useState({
    nearestNeighbor: null,
    twoOpt: null,
    genetic: null
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [stats, setStats] = useState({
    nearestNeighbor: { distance: 0, improvement: 0 },
    twoOpt: { distance: 0, improvement: 0 },
    genetic: { distance: 0, improvement: 0 }
  });
  
  // Refs
  const canvasRef = useRef(null);
  const animationTimerRef = useRef(null);
  
  // Options for visualization
  const options = {
    width: 800,
    height: 500,
    nodeRadius: 8,
    nodeColor: "#3498db",
    edgeColor: "#34495e",
    heuristicColors: {
      nearestNeighbor: "#e74c3c",
      twoOpt: "#2ecc71",
      genetic: "#9b59b6"
    },
    populationSize: 50, // For genetic algorithm
    mutationRate: 0.01,  // For genetic algorithm
    generationCount: 100 // For genetic algorithm
  };
  
  // Initialize cities on component mount
  useEffect(() => {
    generateRandomCities();
    
    // Handle resize events for responsive canvas
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing
    
    return () => {
      window.removeEventListener('resize', handleResize);
      // Clear any animation timers
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);
  
  // Update render when cities or solutions change
  useEffect(() => {
    render();
  }, [cities, solutions, currentStep]);
  
  // Generate random cities
  const generateRandomCities = () => {
    const newCities = [];
    const padding = options.nodeRadius * 2;
    
    for (let i = 0; i < cityCount; i++) {
      newCities.push({
        id: i,
        x: padding + Math.random() * (options.width - padding * 2),
        y: padding + Math.random() * (options.height - padding * 2),
        label: `City ${i + 1}`
      });
    }
    
    setCities(newCities);
    setSolutions({
      nearestNeighbor: null,
      twoOpt: null,
      genetic: null
    });
    setAnimationSteps([]);
    setCurrentStep(0);
    setStats({
      nearestNeighbor: { distance: 0, improvement: 0 },
      twoOpt: { distance: 0, improvement: 0 },
      genetic: { distance: 0, improvement: 0 }
    });
  };
  
  // Calculate distance between two cities
  const distance = (cityA, cityB) => {
    const dx = cityA.x - cityB.x;
    const dy = cityA.y - cityB.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Calculate total tour distance
  const calculateTourDistance = (tour) => {
    let totalDistance = 0;
    
    for (let i = 0; i < tour.length - 1; i++) {
      totalDistance += distance(cities[tour[i]], cities[tour[i + 1]]);
    }
    
    // Add distance back to start
    totalDistance += distance(cities[tour[tour.length - 1]], cities[tour[0]]);
    
    return totalDistance;
  };
  
  // Calculate a random tour distance for comparison
  const calculateRandomTourDistance = () => {
    const randomTour = [...Array(cities.length).keys()];
    shuffleArray(randomTour);
    return calculateTourDistance(randomTour);
  };
  
  // Helper function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Nearest Neighbor Algorithm
  const runNearestNeighbor = () => {
    const n = cities.length;
    const visited = new Array(n).fill(false);
    const tour = [];
    const steps = [];
    
    // Start with a random city
    const startIdx = Math.floor(Math.random() * n);
    tour.push(startIdx);
    visited[startIdx] = true;
    steps.push([...tour]);
    
    // Build tour by selecting nearest unvisited city
    while (tour.length < n) {
      const currentCity = tour[tour.length - 1];
      let bestDistance = Infinity;
      let bestCity = -1;
      
      for (let i = 0; i < n; i++) {
        if (!visited[i]) {
          const d = distance(cities[currentCity], cities[i]);
          if (d < bestDistance) {
            bestDistance = d;
            bestCity = i;
          }
        }
      }
      
      tour.push(bestCity);
      visited[bestCity] = true;
      steps.push([...tour]);
    }
    
    // Calculate statistics
    const tourDistance = calculateTourDistance(tour);
    const randomDistance = calculateRandomTourDistance();
    const improvement = ((randomDistance - tourDistance) / randomDistance * 100);
    
    setSolutions(prev => ({ ...prev, nearestNeighbor: tour }));
    setStats(prev => ({ 
      ...prev, 
      nearestNeighbor: { 
        distance: tourDistance, 
        improvement 
      } 
    }));
    
    return steps;
  };
  
  // 2-Opt Improvement Algorithm
  const runTwoOpt = () => {
    // Generate initial tour using nearest neighbor if not already available
    let initialTour;
    if (solutions.nearestNeighbor) {
      initialTour = [...solutions.nearestNeighbor];
    } else {
      const nnSteps = runNearestNeighbor();
      initialTour = nnSteps[nnSteps.length - 1];
    }
    
    let currentTour = [...initialTour];
    const steps = [currentTour];
    let improved = true;
    let iteration = 0;
    const maxIterations = 100; // Limit iterations for animation purposes
    
    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;
      
      for (let i = 1; i < currentTour.length - 1; i++) {
        for (let j = i + 1; j < currentTour.length; j++) {
          // Skip adjacent edges
          if (j - i === 1) continue;
          
          // Calculate distances for current path and potential new path
          const a = currentTour[i - 1];
          const b = currentTour[i];
          const c = currentTour[j - 1];
          const d = currentTour[j];
          
          const currentDistance = 
            distance(cities[a], cities[b]) + 
            distance(cities[c], cities[d]);
            
          const newDistance = 
            distance(cities[a], cities[c]) + 
            distance(cities[b], cities[d]);
            
          // If new connection is shorter, swap edges
          if (newDistance < currentDistance) {
            // Reverse the sub-path from i to j-1
            const newTour = [...currentTour];
            let left = i;
            let right = j - 1;
            
            while (left < right) {
              [newTour[left], newTour[right]] = [newTour[right], newTour[left]];
              left++;
              right--;
            }
            
            currentTour = newTour;
            steps.push([...currentTour]);
            improved = true;
            break;
          }
        }
        
        if (improved) break;
      }
    }
    
    // Calculate statistics
    const tourDistance = calculateTourDistance(currentTour);
    const randomDistance = calculateRandomTourDistance();
    const improvement = ((randomDistance - tourDistance) / randomDistance * 100);
    
    setSolutions(prev => ({ ...prev, twoOpt: currentTour }));
    setStats(prev => ({ 
      ...prev, 
      twoOpt: { 
        distance: tourDistance, 
        improvement 
      } 
    }));
    
    return steps;
  };
  
  // Genetic Algorithm
  const runGenetic = () => {
    const popSize = options.populationSize;
    const mutationRate = options.mutationRate;
    const generationCount = options.generationCount;
    const n = cities.length;
    
    // Initialize population with random tours
    let population = [];
    for (let i = 0; i < popSize; i++) {
      const tour = shuffleArray([...Array(n).keys()]);
      population.push({
        tour: tour,
        fitness: calculateTourDistance(tour)
      });
    }
    
    // Sort population by fitness (shorter distance is better)
    population.sort((a, b) => a.fitness - b.fitness);
    
    const steps = [];
    steps.push([...population[0].tour]); // Add initial best tour
    
    // Evolution loop
    for (let generation = 0; generation < generationCount; generation++) {
      // Create new generation
      const newPopulation = [];
      
      // Elitism: Keep the best individuals
      const eliteCount = Math.max(1, Math.floor(popSize * 0.1));
      for (let i = 0; i < eliteCount; i++) {
        newPopulation.push(population[i]);
      }
      
      // Crossover and mutation to create the rest
      while (newPopulation.length < popSize) {
        // Select parents via tournament selection
        const parent1 = tournamentSelection(population, 3);
        const parent2 = tournamentSelection(population, 3);
        
        // Ordered crossover
        let child = orderedCrossover(parent1.tour, parent2.tour);
        
        // Mutation
        if (Math.random() < mutationRate) {
          child = mutateTour(child);
        }
        
        newPopulation.push({
          tour: child,
          fitness: calculateTourDistance(child)
        });
      }
      
      // Replace old population
      population = newPopulation;
      
      // Sort by fitness
      population.sort((a, b) => a.fitness - b.fitness);
      
      // Store best tour for animation
      if (generation % 5 === 0 || generation === generationCount - 1) {
        steps.push([...population[0].tour]);
      }
    }
    
    // Calculate statistics
    const tourDistance = calculateTourDistance(population[0].tour);
    const randomDistance = calculateRandomTourDistance();
    const improvement = ((randomDistance - tourDistance) / randomDistance * 100);
    
    setSolutions(prev => ({ ...prev, genetic: population[0].tour }));
    setStats(prev => ({ 
      ...prev, 
      genetic: { 
        distance: tourDistance, 
        improvement 
      } 
    }));
    
    return steps;
  };
  
  // Tournament selection for genetic algorithm
  const tournamentSelection = (population, tournamentSize) => {
    let best = null;
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIdx = Math.floor(Math.random() * population.length);
      const candidate = population[randomIdx];
      
      if (best === null || candidate.fitness < best.fitness) {
        best = candidate;
      }
    }
    
    return best;
  };
  
  // Ordered crossover for genetic algorithm
  const orderedCrossover = (parent1, parent2) => {
    const n = parent1.length;
    const child = new Array(n).fill(-1);
    
    // Select a subsequence from parent1
    const start = Math.floor(Math.random() * (n - 1));
    const end = start + Math.floor(Math.random() * (n - start));
    
    // Copy the subsequence from parent1 to child
    for (let i = start; i <= end; i++) {
      child[i] = parent1[i];
    }
    
    // Fill the remaining positions with cities from parent2 in order
    let j = 0;
    for (let i = 0; i < n; i++) {
      if (j === start) j = end + 1;
      
      if (j < n) {
        const city = parent2[i];
        if (!child.includes(city)) {
          child[j] = city;
          j++;
        }
      }
    }
    
    return child;
  };
  
  // Mutation for genetic algorithm
  const mutateTour = (tour) => {
    const mutatedTour = [...tour];
    
    // Swap mutation - swap two random cities
    const idx1 = Math.floor(Math.random() * tour.length);
    let idx2 = Math.floor(Math.random() * tour.length);
    
    // Ensure idx2 is different from idx1
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * tour.length);
    }
    
    // Swap
    [mutatedTour[idx1], mutatedTour[idx2]] = [mutatedTour[idx2], mutatedTour[idx1]];
    
    return mutatedTour;
  };
  
  // Run selected algorithm
  const runAlgorithm = (algorithmName) => {
    // Stop current animation if running
    if (isAnimating) {
      stopAnimation();
      return;
    }
    
    setAlgorithm(algorithmName);
    let steps = [];
    
    switch (algorithmName) {
      case 'nearestNeighbor':
        steps = runNearestNeighbor();
        break;
      case 'twoOpt':
        steps = runTwoOpt();
        break;
      case 'genetic':
        steps = runGenetic();
        break;
      default:
        break;
    }
    
    setAnimationSteps(steps);
    startAnimation(steps);
  };
  
  // Start animation of algorithm steps
  const startAnimation = (steps) => {
    setIsAnimating(true);
    setCurrentStep(0);
    
    // Use a reference to track the current step in the animation loop
    const stepRef = { current: 0 };
    
    const animate = () => {
      if (stepRef.current < steps.length - 1) {
        // Increment our reference counter
        stepRef.current += 1;
        // Update the state for rendering
        setCurrentStep(stepRef.current);
        animationTimerRef.current = setTimeout(animate, animationSpeed);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationTimerRef.current = setTimeout(animate, animationSpeed);
  };
  
  // Stop the animation
  const stopAnimation = () => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    setIsAnimating(false);
    // When stopping manually, make sure we display the final result
    if (animationSteps.length > 0) {
      setCurrentStep(animationSteps.length - 1);
    }
  };
  
  // Render the visualization to canvas
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw guides/grid if helpful
    drawGrid(ctx);
    
    // Draw tour based on animation state
    if (isAnimating && animationSteps.length > 0) {
      const tour = animationSteps[currentStep];
      drawTour(ctx, tour, options.heuristicColors[algorithm]);
    } else {
      // Draw all solutions if not animating
      if (solutions.nearestNeighbor) {
        drawTour(ctx, solutions.nearestNeighbor, options.heuristicColors.nearestNeighbor, 1);
      }
      
      if (solutions.twoOpt) {
        drawTour(ctx, solutions.twoOpt, options.heuristicColors.twoOpt, 2);
      }
      
      if (solutions.genetic) {
        drawTour(ctx, solutions.genetic, options.heuristicColors.genetic, 3);
      }
    }
    
    // Draw cities
    cities.forEach((city, index) => {
      ctx.beginPath();
      ctx.arc(city.x, city.y, options.nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = options.nodeColor;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw city index
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(index, city.x, city.y + 3);
    });
  };
  
  // Draw grid for reference
  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x < ctx.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < ctx.canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  };
  
  // Draw a tour on the canvas
  const drawTour = (ctx, tour, color, offset = 0) => {
    if (!tour || tour.length < 2) return;
    
    ctx.beginPath();
    
    // Start at the first city
    const firstCity = cities[tour[0]];
    ctx.moveTo(firstCity.x, firstCity.y);
    
    // Connect all cities in order
    for (let i = 1; i < tour.length; i++) {
      const city = cities[tour[i]];
      ctx.lineTo(city.x, city.y);
    }
    
    // Close the loop
    ctx.lineTo(firstCity.x, firstCity.y);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Add offset for multiple tours
    if (offset > 0) {
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = offset * 5;
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
  };
  
  // Get description for current algorithm
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'nearestNeighbor':
        return {
          name: 'Nearest Neighbor',
          description: 'A greedy algorithm that always selects the closest unvisited city next. Fast but often suboptimal.',
          complexity: 'O(n²)',
          strengths: 'Simple, fast, and provides a reasonable approximation',
          weaknesses: 'Can miss the optimal solution by a significant margin',
        };
      case 'twoOpt':
        return {
          name: '2-Opt Improvement',
          description: 'Iteratively improves a tour by swapping two edges when it would reduce the total distance.',
          complexity: 'O(n²) per iteration',
          strengths: 'Can improve upon an existing solution, often significant improvement over Nearest Neighbor',
          weaknesses: 'Can get stuck in local optima, results depend on initial tour',
        };
      case 'genetic':
        return {
          name: 'Genetic Algorithm',
          description: 'Evolves a population of possible tours using selection, crossover, and mutation operators.',
          complexity: 'O(g × p × n) where g=generations, p=population size, n=cities',
          strengths: 'Can escape local optima, often finds high-quality solutions for large problems',
          weaknesses: 'Slow execution, results are non-deterministic, requires parameter tuning',
        };
      default:
        return {
          name: 'Select an Algorithm',
          description: '',
          complexity: '',
          strengths: '',
          weaknesses: '',
        };
    }
  };
  
  const algorithmInfo = getAlgorithmDescription();

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Traveling Salesman Problem</h2>
            <p className="text-gray-600 max-w-2xl">
              The Traveling Salesman Problem (TSP) asks: "Given a list of cities and distances between them, what is the shortest possible route that visits each city exactly once and returns to the origin?"
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => generateRandomCities()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
              disabled={isAnimating}
            >
              Generate New Cities
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Cities: {cityCount}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={cityCount}
                onChange={(e) => {
                  setCityCount(parseInt(e.target.value));
                  generateRandomCities();
                }}
                className="w-full"
                disabled={isAnimating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed: {animationSpeed}ms
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="py-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heuristic Algorithms:
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => runAlgorithm('nearestNeighbor')}
                  className="px-3 py-1.5 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors"
                >
                  {isAnimating && algorithm === 'nearestNeighbor' ? 'Stop' : 'Nearest Neighbor'}
                </button>
                <button
                  onClick={() => runAlgorithm('twoOpt')}
                  className="px-3 py-1.5 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition-colors"
                >
                  {isAnimating && algorithm === 'twoOpt' ? 'Stop' : '2-Opt'}
                </button>
                <button
                  onClick={() => runAlgorithm('genetic')}
                  className="px-3 py-1.5 bg-purple-500 text-white rounded font-medium hover:bg-purple-600 transition-colors"
                >
                  {isAnimating && algorithm === 'genetic' ? 'Stop' : 'Genetic Algorithm'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">{algorithmInfo.name}</h3>
              <p className="text-sm mt-1">{algorithmInfo.description}</p>
              
              {algorithmInfo.complexity && (
                <p className="text-sm mt-2"><strong>Complexity:</strong> {algorithmInfo.complexity}</p>
              )}
              
              {(algorithmInfo.strengths || algorithmInfo.weaknesses) && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  {algorithmInfo.strengths && (
                    <div className="p-1.5 bg-green-50 rounded border border-green-200">
                      <strong>Strengths:</strong> {algorithmInfo.strengths}
                    </div>
                  )}
                  {algorithmInfo.weaknesses && (
                    <div className="p-1.5 bg-red-50 rounded border border-red-200">
                      <strong>Weaknesses:</strong> {algorithmInfo.weaknesses}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg grid grid-cols-3 gap-2 text-sm">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="p-2 bg-white rounded border">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ backgroundColor: options.heuristicColors[key] }}
                  ></div>
                  <p className="font-medium mt-1">{key === 'nearestNeighbor' ? 'Nearest Neighbor' : key === 'twoOpt' ? '2-Opt' : 'Genetic'}</p>
                  <p className="mt-1 text-xs">Distance: {value.distance.toFixed(2)}</p>
                  <p className="text-xs">Improvement: {value.improvement.toFixed(2)}%</p>
                </div>
              ))}
            </div>
            
            {isAnimating && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${(currentStep / (animationSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>
                <p className="text-center text-xs mt-1">
                  Step {currentStep + 1} of {animationSteps.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <canvas 
          ref={canvasRef} 
          width={options.width} 
          height={options.height}
          className="w-full border rounded-lg"
        ></canvas>
        
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
            <span className="text-sm">Nearest Neighbor</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
            <span className="text-sm">2-Opt Improvement</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-sm mr-2"></div>
            <span className="text-sm">Genetic Algorithm</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
            <span className="text-sm">Cities</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Understanding the Traveling Salesman Problem</h3>
        
        <div className="prose max-w-none">
          <p>
            The Traveling Salesman Problem (TSP) is a classic algorithmic problem in computer science and operations research. 
            It asks: Given a list of cities and the distances between them, what is the shortest possible route that visits 
            each city exactly once and returns to the original city?
          </p>
          
          <p>
            The TSP is an NP-hard problem, which means there's no known polynomial-time solution. For a small number of cities, 
            an exact solution can be found, but as the number of cities increases, the problem becomes computationally intractable. 
            For n cities, there are (n-1)!/2 possible routes to check in the worst case.
          </p>
          
          <h4 className="text-md font-semibold mt-4">Why are heuristics used?</h4>
          
          <p>
            Since finding the optimal solution for large instances is impractical, we use heuristic algorithms that can find 
            good (but not necessarily optimal) solutions in reasonable time. This visualization demonstrates three common approaches:
          </p>
          
          <ul className="list-disc ml-6 mt-2 mb-4">
            <li><strong>Nearest Neighbor:</strong> Start at a city and repeatedly visit the nearest unvisited city</li>
            <li><strong>2-Opt:</strong> Iteratively improve a tour by replacing two edges when doing so reduces the total distance</li>
            <li><strong>Genetic Algorithm:</strong> Mimic natural selection by evolving a population of tours through selection, crossover, and mutation</li>
          </ul>
          
          <h4 className="text-md font-semibold mt-4">Real-World Applications</h4>
          
          <p>
            The TSP has numerous practical applications beyond just route planning for salespeople:
          </p>
          
          <ul className="list-disc ml-6 mt-2 mb-4">
            <li>Logistics and delivery route optimization</li>
            <li>Circuit board drilling - minimizing the time to drill holes in PCBs</li>
            <li>DNA sequencing - finding the shortest superstring</li>
            <li>Vehicle routing problems like garbage collection or school bus routing</li>
            <li>Warehouse order picking optimization</li>
            <li>Computer wiring and network design</li>
          </ul>
          
          <p className="text-sm text-gray-600 mt-4">
            This visualization is highly simplified. Real-world TSP instances often have additional constraints 
            like time windows, multiple vehicles, and capacity limitations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravelingSalesmanVisualizer;