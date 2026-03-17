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

const Header = () => {
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
    <header className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">SciVizHub</span>
            <span className="ml-2 text-sm text-gray-500 hidden sm:inline">Scientific Visualization Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Home
            </Link>

            {/* Explore Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className="flex items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fadeIn">
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
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded transition-colors"
                      >
                        <span className="mr-2 text-base w-5 text-center">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              About
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
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
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium">
              Home
            </Link>
            <Link to="/categories" className="block px-3 py-2 text-primary-600 hover:bg-primary-50 rounded font-semibold">
              All Categories
            </Link>
            <div className="grid grid-cols-2 gap-0.5 pl-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link to="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium">
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
