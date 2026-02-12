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
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
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
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        {/* Atom icon with orbits - perfect for physics */}
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.66 0 1.3-.07 1.91-.2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5" />
        <ellipse cx="12" cy="12" rx="10" ry="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="rotate(-60 12 12)" />
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
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
  {
    id: CATEGORIES.STATISTICS,
    name: 'Statistics',
    description: 'Build intuition for inference, estimation, and uncertainty through data-driven interactive experiments.',
    color: 'bg-cyan-100 hover:bg-cyan-200',
    textColor: 'text-cyan-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 3a1 1 0 011 1v12h12a1 1 0 110 2H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
        <path d="M6 13a1 1 0 011-1h1a1 1 0 011 1v3H6v-3zM10 10a1 1 0 011-1h1a1 1 0 011 1v6h-3v-6zM14 7a1 1 0 011-1h1a1 1 0 011 1v9h-3V7z" />
      </svg>
    ),
  },
  {
    id: CATEGORIES.CHEMISTRY,
    name: 'Chemistry',
    description: 'Visualize molecules, reactions, and equilibrium behavior to connect symbolic chemistry to physical intuition.',
    color: 'bg-orange-100 hover:bg-orange-200',
    textColor: 'text-orange-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 2a1 1 0 000 2v3.586l-4.707 6.293A2 2 0 004.893 17h10.214a2 2 0 001.6-3.121L12 7.586V4a1 1 0 100-2H8zm2 7.25L6.2 14.5h7.6L10 9.25z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: CATEGORIES.BIOLOGY,
    name: 'Biology',
    description: 'Explore living systems with interactive models of populations, cells, and ecological dynamics.',
    color: 'bg-emerald-100 hover:bg-emerald-200',
    textColor: 'text-emerald-800',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a7 7 0 017 7v7a1 1 0 11-2 0v-2.2A5.5 5.5 0 014.2 9H2a1 1 0 110-2h2.2A7 7 0 015 3z" />
        <path d="M15 3a1 1 0 011 1c0 3.314-2.686 6-6 6a1 1 0 110-2c2.21 0 4-1.79 4-4a1 1 0 011-1z" />
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
