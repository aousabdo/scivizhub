import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">SciVizHub</span>
            <span className="ml-2 text-sm text-gray-500 hidden sm:inline">Scientific Visualization Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium">Home</Link>
            <Link to="/categories" className="text-gray-700 hover:text-primary-600 font-medium">Categories</Link>
            <Link to="/category/probability" className="text-gray-700 hover:text-primary-600 font-medium">Probability</Link>
            <Link to="/category/calculus" className="text-gray-700 hover:text-primary-600 font-medium">Calculus</Link>
            <Link to="/category/physics" className="text-gray-700 hover:text-primary-600 font-medium">Physics</Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium">About</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={toggleMobileMenu}
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
          <nav className="md:hidden mt-4 pb-2 space-y-3">
            <Link 
              to="/" 
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/categories" 
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              to="/category/probability" 
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Probability
            </Link>
            <Link 
              to="/category/calculus" 
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Calculus
            </Link>
            <Link 
              to="/category/physics" 
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Physics
            </Link>
            <Link 
              to="/about" 
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 