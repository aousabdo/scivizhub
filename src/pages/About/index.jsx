import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About SciVizHub</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
        <p className="text-lg mb-4">
          SciVizHub is an open educational platform dedicated to making complex scientific concepts
          intuitive and accessible through interactive visualizations. We provide a growing collection
          of carefully designed, interactive tools across various disciplines from mathematics to computer science.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p>
          Our mission is to transform abstract concepts into engaging visual experiences. We believe learning
          is enhanced when students can directly manipulate variables, observe cause-and-effect relationships,
          and develop intuition through interactive exploration. SciVizHub bridges the gap between theoretical
          understanding and practical insight across scientific and technical fields.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Visualizations</h2>
        <p>
          Our platform currently features a diverse range of interactive visualizations including:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4">
          <div>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li><span className="font-medium">Bayes' Theorem</span> - Explore conditional probability</li>
              <li><span className="font-medium">Sorting Algorithms</span> - Visualize different sorting methods</li>
              <li><span className="font-medium">Central Limit Theorem</span> - See sampling distributions in action</li>
              <li><span className="font-medium">Pathfinding Algorithms</span> - Compare A*, Dijkstra's and more</li>
              <li><span className="font-medium">Pendulum Wave</span> - Discover harmonic motion and phase relationships</li>
              <li><span className="font-medium">Data Compression</span> - Learn how compression algorithms work</li>
            </ul>
          </div>
          <div>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li><span className="font-medium">Fourier Transform</span> - See signal decomposition in real-time</li>
              <li><span className="font-medium">Neural Networks</span> - Watch ML models learn before your eyes</li>
              <li><span className="font-medium">Traveling Salesman</span> - Explore optimization heuristics</li>
              <li><span className="font-medium">Maze Generation</span> - Understand procedural generation</li>
              <li><span className="font-medium">Matrix Transformations</span> - Visualize linear transformations</li>
            </ul>
          </div>
        </div>

        <p>Each visualization is:</p>
        <ul className="list-disc ml-6 mt-2 mb-4">
          <li><span className="font-medium">Fully Interactive</span> - Adjust parameters and see changes in real-time</li>
          <li><span className="font-medium">Educational</span> - Includes detailed explanations of the underlying concepts</li>
          <li><span className="font-medium">Responsive</span> - Works on desktops, tablets, and mobile devices</li>
          <li><span className="font-medium">Open Access</span> - Free to use for educational purposes</li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 my-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Categories</h3>
          <p className="mb-3">Our visualizations span multiple disciplines:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Link to="/category/probability" className="py-2 px-3 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-md text-center transition-colors">
              Probability & Statistics
            </Link>
            <Link to="/category/computer-science" className="py-2 px-3 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-md text-center transition-colors">
              Computer Science
            </Link>
            <Link to="/category/physics" className="py-2 px-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md text-center transition-colors">
              Physics
            </Link>
            <Link to="/category/calculus" className="py-2 px-3 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-md text-center transition-colors">
              Calculus
            </Link>
            <Link to="/category/engineering" className="py-2 px-3 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-md text-center transition-colors">
              Engineering
            </Link>
            <Link to="/category/linear-algebra" className="py-2 px-3 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-md text-center transition-colors">
              Linear Algebra
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Who We Are</h2>
        <p>
          SciVizHub is created by a passionate community of educators, developers, and science enthusiasts
          who believe in the power of visual learning. Our team is dedicated to making complex concepts
          accessible to everyone through interactive technology.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Technical Details</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 mt-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Our Technical Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Frontend</h4>
              <ul className="space-y-1">
                <li><span className="font-medium">Framework:</span> React with React Router</li>
                <li><span className="font-medium">Styling:</span> Tailwind CSS</li>
                <li><span className="font-medium">Mathematics:</span> KaTeX for LaTeX rendering</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Visualization Libraries</h4>
              <ul className="space-y-1">
                <li><span className="font-medium">Data Visualization:</span> Recharts, D3.js</li>
                <li><span className="font-medium">3D Rendering:</span> Three.js</li>
                <li><span className="font-medium">Canvas Manipulation:</span> HTML5 Canvas API</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            The project is open-source and hosted on GitHub, with continuous deployment through Vercel/Netlify.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Contributing</h2>
        <p>
          SciVizHub is an open-source project that welcomes contributions from the community.
          Whether you're a developer, educator, designer, or enthusiast, there are many ways to get involved:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-300">For Developers</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Implement new visualizations</li>
              <li>Improve existing visualizations</li>
              <li>Enhance performance</li>
              <li>Fix bugs and issues</li>
              <li>Add new features</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">For Educators</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Suggest concepts to visualize</li>
              <li>Provide educational content</li>
              <li>Offer feedback on accuracy</li>
              <li>Test in classroom settings</li>
              <li>Share teaching materials</li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">For Everyone</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Report bugs and issues</li>
              <li>Suggest improvements</li>
              <li>Share with others</li>
              <li>Star our GitHub repo</li>
              <li>Provide feedback</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mt-6 mb-6 text-center">
          <h3 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-300">Get Started Contributing</h3>
          <p className="mb-4">
            Ready to contribute? Check out our GitHub repository and contribution guidelines!
          </p>
          <a
            href="https://github.com/aousabdo/scivizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </div>

      <div className="mt-10 text-center bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Start Exploring</h2>
        <p className="mb-6">Dive into our interactive visualizations and enhance your understanding of complex concepts.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/categories"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Categories
          </Link>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Featured Visualizations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
