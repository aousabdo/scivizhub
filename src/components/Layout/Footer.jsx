import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">SciVizHub</h3>
            <p className="text-gray-300 mb-4">
              Making complex scientific concepts intuitive and accessible through interactive visualizations.
            </p>
            <p className="text-gray-400 text-sm">
              © {currentYear} SciVizHub. All rights reserved.
            </p>
          </div>
          
          {/* Categories Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/probability" className="text-gray-300 hover:text-white">
                  Probability & Statistics
                </Link>
              </li>
              <li>
                <Link to="/category/calculus" className="text-gray-300 hover:text-white">
                  Calculus
                </Link>
              </li>
              <li>
                <Link to="/category/physics" className="text-gray-300 hover:text-white">
                  Physics
                </Link>
              </li>
              <li>
                <Link to="/category/engineering" className="text-gray-300 hover:text-white">
                  Engineering
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contribute" className="text-gray-300 hover:text-white">
                  Contribute
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/your-username/scivizhub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@scivizhub.org" 
                  className="text-gray-300 hover:text-white"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>
            SciVizHub is an open educational resource created for students and educators.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 