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
    thumbnail: '/images/bayes-thumbnail.jpg',
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
    thumbnail: '/images/sorting-thumbnail.jpg', // You'll need to create this image
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
  // Template for adding new visualizations
  /* 
  {
    id: 'unique-identifier',
    title: 'Visualization Title',
    shortDescription: 'Brief description (1-2 sentences) for cards and lists',
    fullDescription: 'Longer description with more details about the visualization',
    route: '/visualization/route-path',
    thumbnail: '/images/thumbnail-image.jpg',
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