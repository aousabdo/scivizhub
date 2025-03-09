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
  return visualizations
    .filter(viz => viz.featured)
    .slice(0, limit);
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