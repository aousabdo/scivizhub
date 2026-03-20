import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const categories = [
  { id: 'probability', name: 'Probability', icon: '🎲' },
  { id: 'statistics', name: 'Statistics', icon: '📊' },
  { id: 'calculus', name: 'Calculus', icon: '∫' },
  { id: 'linear-algebra', name: 'Linear Algebra', icon: '⊡' },
  { id: 'mathematics', name: 'Mathematics', icon: '∞' },
  { id: 'physics', name: 'Physics', icon: '⚛' },
  { id: 'engineering', name: 'Engineering', icon: '⚙' },
  { id: 'computer-science', name: 'Computer Science', icon: '💻' },
  { id: 'chemistry', name: 'Chemistry', icon: '⚗' },
  { id: 'biology', name: 'Biology', icon: '🧬' },
];

const Header = ({ dark, setDark }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExploreOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md relative z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">SciVizHub</span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Scientific Visualization Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
              Home
            </Link>

            {/* Explore Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors"
              >
                Explore
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {exploreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-fadeIn">
                  <Link
                    to="/categories"
                    className="flex items-center px-4 py-2.5 text-primary-600 hover:bg-primary-50 font-semibold border-b border-gray-100 mb-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    All Categories
                  </Link>
                  <div className="grid grid-cols-2 gap-0.5 px-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.id}`}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 rounded transition-colors"
                      >
                        <span className="mr-2 text-base w-5 text-center">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
              About
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 space-y-1">
            <Link to="/" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium">
              Home
            </Link>
            <Link to="/categories" className="block px-3 py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 rounded font-semibold">
              All Categories
            </Link>
            <div className="grid grid-cols-2 gap-0.5 pl-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link to="/about" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium">
              About
            </Link>
            <button
              onClick={() => setDark(!dark)}
              className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium"
            >
              {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
