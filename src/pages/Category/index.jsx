import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VisualizationCard from '../../components/UI/VisualizationCard';
import { getVisualizationsByCategory, CATEGORIES } from '../../data/visualizations';

// Helper to get human-readable category names
const getCategoryName = (categorySlug) => {
  switch (categorySlug) {
    case CATEGORIES.PROBABILITY:
      return 'Probability & Statistics';
    case CATEGORIES.CALCULUS:
      return 'Calculus';
    case CATEGORIES.PHYSICS:
      return 'Physics';
    case CATEGORIES.ENGINEERING:
      return 'Engineering';
    case CATEGORIES.LINEAR_ALGEBRA:
      return 'Linear Algebra';
    case CATEGORIES.STATISTICS:
      return 'Statistics';
    case CATEGORIES.COMPUTER_SCIENCE:
      return 'Computer Science';
    case CATEGORIES.CHEMISTRY:
      return 'Chemistry';
    case CATEGORIES.BIOLOGY:
      return 'Biology';
    default:
      return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  }
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get visualizations for the selected category
    setLoading(true);
    const categoryVisualizations = getVisualizationsByCategory(categoryId);
    setVisualizations(categoryVisualizations);
    setLoading(false);
    window.scrollTo(0, 0);
  }, [categoryId]);
  
  const categoryName = getCategoryName(categoryId);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{categoryName}</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <p>Loading visualizations...</p>
        </div>
      ) : visualizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visualizations.map((visualization) => (
            <VisualizationCard 
              key={visualization.id}
              visualization={visualization}
              detailed={true}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-600 mb-4">
            No visualizations available in this category yet.
          </p>
          <p className="text-gray-500">
            Check back soon or explore other categories!
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage; 
