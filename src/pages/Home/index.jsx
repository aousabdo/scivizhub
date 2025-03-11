import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import VisualizationCard from '../../components/UI/VisualizationCard';
import { getFeaturedVisualizations, CATEGORIES } from '../../data/visualizations';

const HomePage = () => {
  const [featuredVisualizations, setFeaturedVisualizations] = useState([]);
  const location = useLocation();
  
  // Get featured visualizations when the component mounts or location changes
  useEffect(() => {
    // Get random featured visualizations
    const randomVisualizations = getFeaturedVisualizations(3);
    setFeaturedVisualizations(randomVisualizations);
    
    // Scroll to top when visiting the home page
    window.scrollTo(0, 0);
  }, [location.pathname]); // Re-run when the URL path changes
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">SciVizHub</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Interactive visualizations that make complex scientific concepts intuitive and accessible.
        </p>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Featured Visualizations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVisualizations.length > 0 ? (
            featuredVisualizations.map((visualization) => (
              <VisualizationCard 
                key={visualization.id}
                visualization={visualization}
                detailed={true}
              />
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500 py-8">
              No featured visualizations available yet. Check back soon!
            </p>
          )}
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={`/category/${CATEGORIES.PROBABILITY}`} className="p-6 bg-blue-100 rounded-lg text-center hover:bg-blue-200">
            <h3 className="text-xl font-semibold">Probability & Statistics</h3>
          </Link>
          <Link to={`/category/${CATEGORIES.CALCULUS}`} className="p-6 bg-green-100 rounded-lg text-center hover:bg-green-200">
            <h3 className="text-xl font-semibold">Calculus</h3>
          </Link>
          <Link to={`/category/${CATEGORIES.PHYSICS}`} className="p-6 bg-red-100 rounded-lg text-center hover:bg-red-200">
            <h3 className="text-xl font-semibold">Physics</h3>
          </Link>
          <Link to={`/category/${CATEGORIES.ENGINEERING}`} className="p-6 bg-yellow-100 rounded-lg text-center hover:bg-yellow-200">
            <h3 className="text-xl font-semibold">Engineering</h3>
          </Link>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border mb-12">
        <h2 className="text-2xl font-bold mb-4">Why SciVizHub?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="bg-primary-100 text-primary-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Visual Learning</h3>
            <p className="text-gray-600">
              Interactive visuals make complex concepts easier to understand and remember.
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-primary-100 text-primary-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Interactive Exploration</h3>
            <p className="text-gray-600">
              Adjust parameters and see results in real-time for deeper understanding.
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-primary-100 text-primary-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Open Access</h3>
            <p className="text-gray-600">
              Free educational resources available to anyone, anywhere, anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 