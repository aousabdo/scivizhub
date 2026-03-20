import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import VisualizationCard from '../../components/UI/VisualizationCard';
import { getAllVisualizations, getFeaturedVisualizations, CATEGORIES, DIFFICULTY } from '../../data/visualizations';

const CATEGORY_INFO = [
  { id: CATEGORIES.PROBABILITY, name: 'Probability', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300', active: 'bg-blue-500 text-white' },
  { id: CATEGORIES.STATISTICS, name: 'Statistics', color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300', active: 'bg-cyan-500 text-white' },
  { id: CATEGORIES.CALCULUS, name: 'Calculus', color: 'bg-green-100 hover:bg-green-200 border-green-300', active: 'bg-green-500 text-white' },
  { id: CATEGORIES.LINEAR_ALGEBRA, name: 'Linear Algebra', color: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300', active: 'bg-indigo-500 text-white' },
  { id: CATEGORIES.MATHEMATICS, name: 'Mathematics', color: 'bg-pink-100 hover:bg-pink-200 border-pink-300', active: 'bg-pink-500 text-white' },
  { id: CATEGORIES.PHYSICS, name: 'Physics', color: 'bg-red-100 hover:bg-red-200 border-red-300', active: 'bg-red-500 text-white' },
  { id: CATEGORIES.ENGINEERING, name: 'Engineering', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300', active: 'bg-yellow-500 text-white' },
  { id: CATEGORIES.COMPUTER_SCIENCE, name: 'Computer Science', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300', active: 'bg-purple-500 text-white' },
  { id: CATEGORIES.CHEMISTRY, name: 'Chemistry', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300', active: 'bg-orange-500 text-white' },
  { id: CATEGORIES.BIOLOGY, name: 'Biology', color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300', active: 'bg-emerald-500 text-white' },
];

const HomePage = () => {
  const [featuredVisualizations, setFeaturedVisualizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeDifficulty, setActiveDifficulty] = useState(null);
  const location = useLocation();

  const allVisualizations = useMemo(() => getAllVisualizations(), []);

  useEffect(() => {
    const randomVisualizations = getFeaturedVisualizations(3);
    setFeaturedVisualizations(randomVisualizations);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isFiltering = searchTerm || activeCategory || activeDifficulty;

  const filteredVisualizations = useMemo(() => {
    let results = allVisualizations;

    if (activeCategory) {
      results = results.filter(v => v.category === activeCategory);
    }

    if (activeDifficulty) {
      results = results.filter(v => v.difficulty === activeDifficulty);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(v =>
        v.title.toLowerCase().includes(term) ||
        v.shortDescription.toLowerCase().includes(term) ||
        v.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return results;
  }, [allVisualizations, searchTerm, activeCategory, activeDifficulty]);

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory(null);
    setActiveDifficulty(null);
  };

  // Count visualizations per category (for badges)
  const categoryCounts = useMemo(() => {
    const counts = {};
    allVisualizations.forEach(v => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [allVisualizations]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>SciVizHub — Interactive Science Visualizations</title>
        <meta name="description" content="Explore interactive visualizations that make complex scientific concepts intuitive and accessible. Physics, math, computer science, and more." />
        <meta property="og:title" content="SciVizHub — Interactive Science Visualizations" />
        <meta property="og:description" content="Explore interactive visualizations that make complex scientific concepts intuitive and accessible." />
      </Helmet>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">SciVizHub</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
          Interactive visualizations that make complex scientific concepts intuitive and accessible.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search visualizations... (e.g. sorting, pendulum, probability)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none text-base"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORY_INFO.filter(c => categoryCounts[c.id]).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat.id
                  ? cat.active
                  : cat.color
              }`}
            >
              {cat.name}
              <span className="ml-1 opacity-70">({categoryCounts[cat.id]})</span>
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2 justify-center mt-3">
          {[DIFFICULTY.BEGINNER, DIFFICULTY.INTERMEDIATE, DIFFICULTY.ADVANCED].map((diff) => (
            <button
              key={diff}
              onClick={() => setActiveDifficulty(activeDifficulty === diff ? null : diff)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeDifficulty === diff
                  ? 'bg-gray-700 text-white border-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>

        {/* Active filter indicator */}
        {isFiltering && (
          <div className="text-center mt-3">
            <span className="text-sm text-gray-500">
              {filteredVisualizations.length} result{filteredVisualizations.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearFilters}
              className="ml-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Search / filter results */}
      {isFiltering ? (
        <div className="mb-12">
          {filteredVisualizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVisualizations.map((visualization) => (
                <VisualizationCard
                  key={visualization.id}
                  visualization={visualization}
                  detailed={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No visualizations match your search.</p>
              <p className="text-gray-400 text-sm">Try different keywords or clear the filters.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Featured Visualizations */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Featured Visualizations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVisualizations.map((visualization) => (
                <VisualizationCard
                  key={visualization.id}
                  visualization={visualization}
                  detailed={true}
                />
              ))}
            </div>
          </div>

          {/* Browse All */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">All Visualizations</h2>
              <span className="text-sm text-gray-500">{allVisualizations.length} total</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allVisualizations.map((visualization) => (
                <VisualizationCard
                  key={visualization.id}
                  visualization={visualization}
                  detailed={true}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Why SciVizHub */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 mb-12">
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
