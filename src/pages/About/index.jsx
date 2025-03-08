import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About SciVizHub</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg mb-4">
          SciVizHub is an open educational platform dedicated to making complex scientific concepts 
          intuitive and accessible through interactive visualizations.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p>
          Our mission is to help students, educators, and anyone curious about science to understand 
          difficult concepts through visual, interactive learning experiences. We believe that seeing 
          and interacting with concepts can lead to deeper understanding than static textbook diagrams 
          or equations alone.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
        <p>
          Each visualization on SciVizHub is carefully designed to illustrate a specific concept from 
          mathematics, physics, engineering, or other scientific fields. The visualizations are:
        </p>
        <ul className="list-disc ml-6 mt-2 mb-4">
          <li>Interactive - allowing you to change parameters and see their effects</li>
          <li>Educational - with explanations alongside the visualizations</li>
          <li>Accessible - designed to work on various devices and screen sizes</li>
          <li>Free - available to everyone without restrictions</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Who We Are</h2>
        <p>
          SciVizHub is created by educators, developers, and science enthusiasts who believe in the 
          power of visual learning. Our team is dedicated to creating high-quality educational content 
          that's freely available to everyone.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Contributing</h2>
        <p>
          SciVizHub is an open project and we welcome contributions! There are several ways you can contribute:
        </p>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">For Developers</h3>
        <p>
          If you're a developer interested in creating visualizations:
        </p>
        <ol className="list-decimal ml-6 mt-2 mb-4">
          <li>Fork the repository on GitHub</li>
          <li>Set up your local development environment</li>
          <li>Create a new visualization following our guidelines</li>
          <li>Submit a pull request with your visualization</li>
        </ol>
        <p>
          We use React for our frontend and various visualization libraries like D3.js, Three.js, and Recharts.
          Check out our GitHub repository for detailed contribution guidelines.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg border mt-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">Technical Stack</h3>
          <ul className="space-y-1">
            <li><span className="font-medium">Frontend Framework:</span> React</li>
            <li><span className="font-medium">Styling:</span> Tailwind CSS</li>
            <li><span className="font-medium">Visualization Libraries:</span> D3.js, Recharts, Three.js</li>
            <li><span className="font-medium">Mathematical Notation:</span> KaTeX</li>
            <li><span className="font-medium">Deployment:</span> Vercel/Netlify</li>
          </ul>
        </div>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">For Educators</h3>
        <p>
          If you're an educator:
        </p>
        <ul className="list-disc ml-6 mt-2 mb-4">
          <li>Suggest concepts that would benefit from visualization</li>
          <li>Provide feedback on existing visualizations</li>
          <li>Share how you're using SciVizHub in your teaching</li>
          <li>Collaborate on educational content and explanations</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">For Everyone</h3>
        <p>
          Even if you're not a developer or educator, you can:
        </p>
        <ul className="list-disc ml-6 mt-2 mb-4">
          <li>Report bugs or issues you encounter</li>
          <li>Suggest improvements for existing visualizations</li>
          <li>Share SciVizHub with others who might benefit</li>
          <li>Star and watch our repository on GitHub</li>
        </ul>
        
        <div className="bg-primary-50 p-6 rounded-lg border border-primary-200 mt-6 mb-6">
          <h3 className="text-lg font-semibold mb-2 text-primary-800">Get Started Contributing</h3>
          <p className="mb-4">
            Ready to contribute? Check out our GitHub repository and contribution guidelines!
          </p>
          <a 
            href="https://github.com/aousabdo/scivizhub" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Explore Visualizations</h2>
        <p className="mb-6">Ready to start exploring? Check out our visualizations by category.</p>
        <Link 
          to="/categories" 
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Browse Categories
        </Link>
      </div>
    </div>
  );
};

export default AboutPage; 