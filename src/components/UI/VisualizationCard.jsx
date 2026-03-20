import React from 'react';
import { Link } from 'react-router-dom';
import { DIFFICULTY } from '../../data/visualizations';

/**
 * VisualizationCard Component
 * 
 * Displays a card for a visualization with title, description, image, and metadata.
 * Used on the homepage, category pages, and search results.
 * 
 * @param {Object} visualization - Visualization data object
 * @param {boolean} detailed - Whether to show additional metadata (default: false)
 */
const VisualizationCard = ({ visualization, detailed = false }) => {
  if (!visualization) return null;

  const {
    title,
    shortDescription,
    route,
    thumbnail,
    difficulty,
    estimatedTime,
    category,
    tags,
  } = visualization;

  // Helper to get the appropriate color for difficulty badge
  const getDifficultyColor = (level) => {
    switch(level) {
      case DIFFICULTY.BEGINNER:
        return 'bg-green-100 text-green-800';
      case DIFFICULTY.INTERMEDIATE:
        return 'bg-blue-100 text-blue-800';
      case DIFFICULTY.ADVANCED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to format difficulty label
  const formatDifficulty = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      <div className="relative">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-48 object-cover" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/placeholder.svg';
          }}
        />
        
        {/* Difficulty badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
          {formatDifficulty(difficulty)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-700 mb-4">{shortDescription}</p>
        
        {detailed && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600">{estimatedTime}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <Link 
          to={route} 
          className="mt-2 inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Explore
        </Link>
      </div>
    </div>
  );
};

export default VisualizationCard; 