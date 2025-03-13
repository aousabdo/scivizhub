/**
 * Visualization Registry
 * 
 * This file contains metadata for all visualizations in the SciVizHub project.
 * Add new visualizations here to make them available throughout the application.
 */

// Categories for visualizations
export const CATEGORIES = {
  PROBABILITY: 'probability',
  CALCULUS: 'calculus',
  PHYSICS: 'physics',
  ENGINEERING: 'engineering',
  LINEAR_ALGEBRA: 'linear-algebra',
  STATISTICS: 'statistics',
  COMPUTER_SCIENCE: 'computer-science',
  CHEMISTRY: 'chemistry',
  BIOLOGY: 'biology',
};

// Difficulty levels
export const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

// List of all visualizations
const visualizations = [
  {
    id: 'bayes-theorem',
    title: 'Bayes\' Theorem',
    shortDescription: 'Understand the fundamentals of conditional probability through interactive visual explanations.',
    fullDescription: `Bayes' theorem is a fundamental concept in probability theory that describes how to update our beliefs
    based on new evidence. This visualization helps you understand Bayes' theorem through multiple perspectives:
    a contingency table, a tree diagram, and a Venn diagram. Use the interactive controls to see how different
    variables affect the probabilities.`,
    route: '/visualization/bayes-theorem',
    thumbnail: process.env.PUBLIC_URL + '/images/bayes-thumbnail.jpg',
    category: CATEGORIES.PROBABILITY,
    tags: ['probability', 'statistics', 'conditional probability', 'bayes theorem'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '10-15 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-03-08',
    featured: true,
    relatedVisualizations: [], // Will contain ids of related visualizations when more are added
    prerequisites: [], // Concepts to understand before this visualization
    concepts: ['Conditional Probability', 'Probability Theory', 'Statistical Inference'],
  },

  {
    id: 'sorting-algorithms',
    title: 'Sorting Algorithms',
    shortDescription: 'Visualize and compare different sorting algorithms to understand their efficiency and mechanisms.',
    fullDescription: `This interactive visualization demonstrates how various sorting algorithms work by animating the
    process of arranging elements. Compare algorithms like Bubble Sort, Selection Sort, Insertion Sort, Merge Sort,
    and Quick Sort to see their performance characteristics and understand algorithmic complexity in an intuitive way.`,
    route: '/visualization/sorting-algorithms',
    thumbnail: process.env.PUBLIC_URL + '/images/sorting-thumbnail.jpg', // You'll need to create this image
    category: CATEGORIES.COMPUTER_SCIENCE,
    tags: ['algorithms', 'sorting', 'computer science', 'data structures', 'visualization'],
    difficulty: DIFFICULTY.BEGINNER,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-03-10',
    featured: true,
    relatedVisualizations: ['bayes-theorem'], // Connect related visualizations
    prerequisites: ['Basic programming concepts'],
    concepts: ['Algorithm Complexity', 'Comparison Sorting', 'Time Complexity', 'Space Complexity'],
  },

  {
    id: 'central-limit-theorem',
    title: 'Central Limit Theorem',
    shortDescription: 'Explore how sample means converge to a normal distribution regardless of the original population distribution.',
    fullDescription: `The Central Limit Theorem is a fundamental concept in statistics that explains why normal distributions are so common in nature. This interactive visualization lets you select different population distributions (uniform, exponential, bimodal, etc.) and observe how the distribution of sample means approaches a normal distribution as sample size increases.`,
    route: '/visualization/central-limit-theorem',
    thumbnail: process.env.PUBLIC_URL + '/images/clt-thumbnail.jpg', // You'll need to create this image
    // category: CATEGORIES.STATISTICS,
    category: CATEGORIES.PROBABILITY,
    tags: ['statistics', 'probability', 'normal distribution', 'sampling', 'inferential statistics'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-03-12',
    featured: true,
    relatedVisualizations: ['bayes-theorem'], // Connect related visualizations
    prerequisites: ['Basic statistics concepts'],
    concepts: ['Sampling Distribution', 'Normal Distribution', 'Statistical Inference', 'Standard Error'],
  },

  {
    id: 'pathfinding-algorithms',
    title: 'Pathfinding Algorithms',
    shortDescription: 'Visualize how algorithms like A* and Dijkstras find optimal paths through mazes and obstacles.',
    fullDescription: `This interactive visualization demonstrates how different pathfinding algorithms work by animating
    their search process through a customizable grid. Compare algorithms like Dijkstra's, A*, Breadth-First Search, 
    Depth-First Search, and Greedy Best-First Search to understand their efficiency, completeness, and optimality properties.
    Create walls, move start and end points, and watch in real-time as the algorithms navigate the terrain.`,
    route: '/visualization/pathfinding-algorithms',
    thumbnail: process.env.PUBLIC_URL + '/images/pathfinding-thumbnail.jpg', // You'll need to create this image
    category: CATEGORIES.COMPUTER_SCIENCE,
    tags: ['algorithms', 'pathfinding', 'computer science', 'graph theory', 'artificial intelligence', 'maze solving'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-25 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-03-15',
    featured: true,
    relatedVisualizations: ['sorting-algorithms'], // Connect related visualizations
    prerequisites: ['Basic graph theory concepts'],
    concepts: ['Graph Traversal', 'Heuristics', 'Algorithm Complexity', 'Shortest Path Problems'],
  },

  {
    id: 'pendulum-wave',
    title: 'Pendulum Wave Dynamics',
    shortDescription: 'Explore mesmerizing wave patterns created by pendulums of different lengths moving in and out of phase.',
    fullDescription: `This visualization demonstrates the fascinating pendulum wave effect, where a series of pendulums with
    precisely calculated lengths create beautiful wave patterns as they move in and out of phase with each other.
    Watch as the pendulums start in alignment, then create traveling waves, standing waves, and complex patterns before
    returning to their original formation. Adjust parameters like pendulum count, length, and cycle time to explore
    how these factors affect the patterns that emerge.`,
    route: '/visualization/pendulum-wave',
    thumbnail: process.env.PUBLIC_URL + '/images/pendulum-wave-thumbnail.jpg', // You'll need to create this image
    category: CATEGORIES.PHYSICS,
    tags: ['physics', 'waves', 'oscillation', 'harmonic motion', 'phase', 'resonance', 'interference'],
    difficulty: DIFFICULTY.BEGINNER,
    estimatedTime: '10-15 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-03-18',
    featured: true,
    relatedVisualizations: [], // Connect related visualizations when available
    prerequisites: ['Basic understanding of waves and oscillation'],
    concepts: ['Simple Harmonic Motion', 'Phase Relationships', 'Wave Interference', 'Resonance'],
  },

  {
    id: 'compression-algorithms',
    title: 'Data Compression Algorithms',
    shortDescription: 'Visualize how compression algorithms like Huffman, RLE, and LZW reduce data size through smart encoding.',
    fullDescription: `This interactive visualization demonstrates how different compression algorithms work to reduce data size 
    by identifying and encoding patterns more efficiently. Explore Run-Length Encoding, Huffman Coding, and LZW compression 
    through step-by-step animations that reveal the inner workings of these fundamental data processing techniques.`,
    route: '/visualization/compression-algorithms',
    thumbnail: process.env.PUBLIC_URL + '/images/compression-thumbnail.jpg', // You'll need to create this image
    category: CATEGORIES.COMPUTER_SCIENCE,
    tags: ['compression', 'algorithms', 'data structures', 'information theory', 'huffman coding', 'run-length encoding', 'lzw'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-04-05',
    featured: true,
    relatedVisualizations: ['sorting-algorithms', 'pathfinding-algorithms'], // Connect to related visualizations
    prerequisites: ['Basic understanding of data representation'],
    concepts: ['Data Compression', 'Information Theory', 'Lossless Compression', 'Entropy', 'Variable-Length Coding'],
  },


  {
    id: 'fourier-transform',
    title: 'Fourier Transform',
    shortDescription: 'Explore how complex signals can be decomposed into simple sine waves of different frequencies.',
    fullDescription: `The Fourier Transform is a powerful mathematical technique that decomposes complex signals into a sum of simple
    sine waves. This interactive visualization lets you see how different signals (square waves, sawtooth, etc.) can be built
    from sine waves of various frequencies, amplitudes, and phases. Draw your own custom signals and watch in real-time as 
    they're synthesized and decomposed, gaining intuition for this fundamental concept in signal processing.`,
    route: '/visualization/fourier-transform',
    thumbnail: process.env.PUBLIC_URL + '/images/fourier-thumbnail.jpg', // You'll need to create this image
    category: CATEGORIES.ENGINEERING,
    tags: ['signal processing', 'wave theory', 'fourier analysis', 'frequency domain', 'harmonics', 'mathematics'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-04-15',
    featured: true,
    relatedVisualizations: ['pendulum-wave'], // Connect to related visualizations
    prerequisites: ['Basic trigonometry'],
    concepts: ['Signal Decomposition', 'Frequency Domain', 'Harmonic Analysis', 'Signal Synthesis', 'Spectrum Analysis'],
  },

  {
    id: 'neural-network-training',
    title: 'Neural Network Training',
    shortDescription: 'Watch a simple neural network learn to classify data in real-time, visualizing how decision boundaries evolve during training.',
    fullDescription: `This interactive visualization demonstrates how neural networks learn patterns from data through training.
    Observe as a neural network adapts its decision boundary to classify different datasets, from simple geometric 
    patterns to complex non-linear distributions. Adjust the network architecture, learning parameters, and dataset
    properties to gain an intuitive understanding of how these powerful algorithms work.`,
    route: '/visualization/neural-network-training',
    thumbnail: process.env.PUBLIC_URL + '/images/neural-network-thumbnail.jpg',
    category: CATEGORIES.COMPUTER_SCIENCE,
    tags: ['machine learning', 'neural networks', 'artificial intelligence', 'classification', 'deep learning'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-05-01',
    featured: true,
    relatedVisualizations: ['pathfinding-algorithms', 'sorting-algorithms'],
    prerequisites: ['Basic understanding of machine learning concepts'],
    concepts: ['Neural Networks', 'Supervised Learning', 'Gradient Descent', 'Classification', 'Decision Boundaries'],
  },

  {
    id: 'traveling-salesman',
    title: 'Traveling Salesman Problem',
    shortDescription: 'Explore different heuristic approaches (nearest neighbor, 2-opt, genetic algorithms) to solving this classic NP-hard optimization problem.',
    fullDescription: `The Traveling Salesman Problem (TSP) asks: "Given a list of cities and the distances between them, what is the shortest possible route that visits each city exactly once and returns to the origin?" This interactive visualization demonstrates several heuristic approaches to this computationally challenging problem, comparing their effectiveness and tradeoffs.`,
    route: '/visualization/traveling-salesman',
    thumbnail: process.env.PUBLIC_URL + '/images/tsp-thumbnail.jpg', // Will need to create this image
    category: CATEGORIES.COMPUTER_SCIENCE,
    tags: ['algorithms', 'optimization', 'np-hard', 'graph theory', 'computer science', 'heuristics', 'operations research'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-05-01',
    featured: true,
    relatedVisualizations: ['pathfinding-algorithms', 'sorting-algorithms'], // Connect to related visualizations
    prerequisites: ['Basic understanding of algorithms and optimization'],
    concepts: ['NP-Hard Problems', 'Heuristic Algorithms', 'Optimization', 'Graph Theory', 'Genetic Algorithms'],
  },

  {
    id: 'maze-generation',
    title: 'Maze Generation Algorithms',
    shortDescription: 'Visualize different techniques for generating mazes including recursive backtracking, Kruskal\'s algorithm, Prim\'s algorithm, and recursive division.',
    fullDescription: `Maze generation algorithms transform a simple grid into complex labyrinths through systematic processes of adding or removing walls. This visualization demonstrates several approaches to maze generation, showing how each algorithm creates mazes with distinct characteristics and visual patterns. Watch the step-by-step maze creation process and compare the resulting structures.`,
    route: '/visualization/maze-generation',
    thumbnail: process.env.PUBLIC_URL + '/images/maze-generation-thumbnail.jpg', // Will need to create this image
    category: CATEGORIES.COMPUTER_SCIENCE,
    tags: ['algorithms', 'maze generation', 'graph theory', 'computer science', 'procedural generation', 'spanning trees', 'recursive algorithms'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-05-15',
    featured: true,
    relatedVisualizations: ['pathfinding-algorithms', 'traveling-salesman'], // Connect to related visualizations
    prerequisites: ['Basic understanding of algorithms and data structures'],
    concepts: ['Graph Theory', 'Spanning Trees', 'Recursive Algorithms', 'Procedural Generation', 'Minimum Spanning Trees'],
  },

  {
    id: 'matrix-transformation',
    title: 'Matrix Transformation Visualizer',
    shortDescription: 'Explore how matrices transform space by visualizing various linear transformations in 2D and 3D.',
    fullDescription: `This interactive visualization demonstrates how matrices transform space, allowing you to visualize 
    linear transformations such as scaling, rotation, reflection, and shearing. Experiment with different matrices 
    in both 2D and 3D modes, observe how they affect the coordinate grid and unit shapes, and create animation 
    sequences to understand transformation composition.`,
    route: '/visualization/matrix-transformation',
    thumbnail: process.env.PUBLIC_URL + '/images/matrix-transformation-thumbnail.jpg', // You'll need to create this image
    category: CATEGORIES.LINEAR_ALGEBRA,
    tags: ['linear algebra', 'matrices', 'transformations', 'computer graphics', 'mathematics', 'vectors'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2023-06-01',
    featured: true,
    relatedVisualizations: ['fourier-transform'], // Connect to related visualizations
    prerequisites: ['Basic understanding of matrices and vectors'],
    concepts: ['Linear Transformations', 'Matrix Operations', 'Vector Spaces', 'Basis Vectors', 'Coordinate Systems'],
  },

  {
    id: 'derivative-explorer',
    title: 'Derivative Explorer',
    shortDescription: 'Explore the geometric meaning of derivatives as the slope of tangent lines with interactive visualizations.',
    fullDescription: `This interactive visualization demonstrates the fundamental concept of derivatives in calculus through a 
    geometric perspective. Explore how the derivative represents the slope of the tangent line at any point on a curve. 
    Drag points along various functions to see tangent lines update in real-time, toggle between different function types 
    (polynomial, trigonometric, exponential), visualize the limit definition with secant lines approaching the tangent, 
    and use the zooming feature to observe how functions appear increasingly linear at smaller scales.`,
    route: '/visualization/derivative-explorer',
    thumbnail: process.env.PUBLIC_URL + '/images/derivative-explorer-thumbnail.png',
    category: CATEGORIES.LINEAR_ALGEBRA,
    tags: ['calculus', 'derivatives', 'tangent lines', 'slopes', 'limits'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15-20 minutes',
    author: 'SciVizHub Team',
    dateAdded: '2025-03-12',
    featured: true,
    relatedVisualizations: ['fourier-transform'], 
    prerequisites: ['Basic understanding of functions and graphs'],
    concepts: ['Derivatives', 'Tangent Lines', 'Limit Definition', 'Local Linearity'],
  },

  // Template for adding new visualizations
  /* 
  {
    id: 'unique-identifier',
    title: 'Visualization Title',
    shortDescription: 'Brief description (1-2 sentences) for cards and lists',
    fullDescription: 'Longer description with more details about the visualization',
    route: '/visualization/route-path',
    thumbnail: process.env.PUBLIC_URL + '/images/thumbnail-image.jpg',
    category: CATEGORIES.CATEGORY_NAME,
    tags: ['tag1', 'tag2', 'tag3'],
    difficulty: DIFFICULTY.LEVEL,
    estimatedTime: 'X-Y minutes',
    author: 'Author Name',
    dateAdded: 'YYYY-MM-DD',
    featured: true/false,
    relatedVisualizations: ['related-id-1', 'related-id-2'],
    prerequisites: ['concept1', 'concept2'],
    concepts: ['Concept1', 'Concept2', 'Concept3'],
  },
  */
];

// Utility functions to work with the visualization registry

/**
 * Get all visualizations
 * @returns {Array} All visualizations
 */
export const getAllVisualizations = () => visualizations;

/**
 * Get featured visualizations for homepage
 * @param {number} limit - Maximum number of visualizations to return
 * @returns {Array} Featured visualizations
 */
export const getFeaturedVisualizations = (limit = 3) => {
  // Get all visualizations
  const allVisualizations = [...visualizations];
  
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = allVisualizations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allVisualizations[i], allVisualizations[j]] = [allVisualizations[j], allVisualizations[i]];
  }
  
  // Return the first 'limit' visualizations
  return allVisualizations.slice(0, limit);
};

/**
 * Get visualizations by category
 * @param {string} category - Category to filter by
 * @returns {Array} Visualizations in the given category
 */
export const getVisualizationsByCategory = (category) => {
  return visualizations.filter(viz => viz.category === category);
};

/**
 * Get a visualization by its ID
 * @param {string} id - Visualization ID
 * @returns {Object|null} Visualization object or null if not found
 */
export const getVisualizationById = (id) => {
  return visualizations.find(viz => viz.id === id) || null;
};

/**
 * Get related visualizations
 * @param {string} id - Visualization ID to find related content for
 * @returns {Array} Related visualizations
 */
export const getRelatedVisualizations = (id) => {
  const visualization = getVisualizationById(id);
  if (!visualization) return [];
  
  return visualization.relatedVisualizations
    .map(relatedId => getVisualizationById(relatedId))
    .filter(Boolean); // Remove null values
};

/**
 * Search visualizations by search term
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Matching visualizations
 */
export const searchVisualizations = (searchTerm) => {
  if (!searchTerm) return [];
  
  const term = searchTerm.toLowerCase();
  return visualizations.filter(viz => 
    viz.title.toLowerCase().includes(term) ||
    viz.shortDescription.toLowerCase().includes(term) ||
    viz.fullDescription.toLowerCase().includes(term) ||
    viz.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

export default visualizations; 