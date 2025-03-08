import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, getVisualizationsByCategory } from '../../data/visualizations';

const categoryInfo = [
  {
    id: CATEGORIES.PROBABILITY,
    name: 'Probability & Statistics',
    description: 'Explore concepts in probability theory, statistical analysis, and data interpretation through interactive visualizations.',
    color: 'bg-blue-100 hover:bg-blue-200',
    textColor: 'text-blue-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    id: CATEGORIES.CALCULUS,
    name: 'Calculus',
    description: 'Visualize derivatives, integrals, and other calculus concepts to develop an intuitive understanding of rates of change and accumulation.',
    color: 'bg-green-100 hover:bg-green-200',
    textColor: 'text-green-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: CATEGORIES.PHYSICS,
    name: 'Physics',
    description: 'Interact with simulations of physical phenomena to better understand mechanics, electromagnetism, thermodynamics, and more.',
    color: 'bg-red-100 hover:bg-red-200',
    textColor: 'text-red-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: CATEGORIES.ENGINEERING,
    name: 'Engineering',
    description: 'See engineering principles in action through interactive models and simulations of mechanical, electrical, and civil engineering concepts.',
    color: 'bg-yellow-100 hover:bg-yellow-200',
    textColor: 'text-yellow-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: CATEGORIES.LINEAR_ALGEBRA,
    name: 'Linear Algebra',
    description: 'Visualize vectors, matrices, and transformations to build intuition for this fundamental mathematical field.',
    color: 'bg-indigo-100 hover:bg-indigo-200',
    textColor: 'text-indigo-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
      </svg>
    ),
  },
  {
    id: CATEGORIES.COMPUTER_SCIENCE,
    name: 'Computer Science',
    description: 'Explore algorithms, data structures, and computational concepts through interactive visualizations and simulations.',
    color: 'bg-purple-100 hover:bg-purple-200',
    textColor: 'text-purple-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const AllCategoriesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore by Category</h1>
      
      <p className="text-lg text-gray-600 mb-8 max-w-3xl">
        Browse our collection of interactive visualizations by subject area. Each category contains 
        visualizations designed to help you understand key concepts through interactive exploration.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categoryInfo.map((category) => {
          const visualizationCount = getVisualizationsByCategory(category.id).length;
          
          return (
            <Link 
              key={category.id}
              to={`/category/${category.id}`}
              className={`${category.color} p-6 rounded-lg transition-all ${visualizationCount > 0 ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-full ${category.textColor} bg-white bg-opacity-50 mr-4`}>
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                  <p className="text-gray-700 mb-3">{category.description}</p>
                  <div className="flex items-center">
                    <span className={`font-medium ${category.textColor}`}>
                      {visualizationCount} {visualizationCount === 1 ? 'visualization' : 'visualizations'} available
                    </span>
                    {visualizationCount > 0 && (
                      <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AllCategoriesPage; 