import React from 'react';
import MazeGenerationVisualizer from '../../components/Visualizations/MazeGeneration/MazeGenerationVisualizer';

const MazeGenerationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Maze Generation Algorithms</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Maze generation algorithms create complex labyrinths through systematic processes of adding or removing walls.
          This visualization demonstrates different techniques for generating mazes, each with unique properties and
          visual patterns.
        </p>
        <p>
          Watch the step-by-step process as algorithms like Recursive Backtracking, Kruskal's, Prim's, and Recursive Division
          transform a simple grid into intricate maze structures with varying characteristics and complexity.
        </p>
      </div>
      
      <MazeGenerationVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Art and Science of Maze Generation</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Perfect vs. Braided Mazes</h3>
            <p>
              Mazes can be classified based on their topological properties:
            </p>
            
            <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2">Perfect Mazes</h4>
                <p className="text-sm">
                  A perfect maze has exactly one path between any two points, with no loops or inaccessible areas.
                  These mazes form a spanning tree where each cell is a node and passages are edges.
                </p>
                <ul className="text-sm list-disc pl-5 mt-2">
                  <li>Always has a unique solution</li>
                  <li>Contains many dead ends</li>
                  <li>Solution path often includes many twists and turns</li>
                </ul>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2">Braided Mazes</h4>
                <p className="text-sm">
                  Braided mazes intentionally contain loops and multiple paths between points.
                  Some walls are removed from perfect mazes to create these additional paths.
                </p>
                <ul className="text-sm list-disc pl-5 mt-2">
                  <li>Multiple potential solutions</li>
                  <li>Fewer dead ends</li>
                  <li>Often visually more interesting</li>
                  <li>Can be more difficult to solve due to choice paralysis</li>
                </ul>
              </div>
            </div>
            
            <p className="text-sm mt-2">
              Most of the algorithms visualized here generate perfect mazes, though they can be modified to 
              create braided mazes by strategically removing walls after generation.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Algorithm Characteristics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-3 border-collapse">
                <thead>
                  <tr className="bg-green-100">
                    <th className="p-2 border">Algorithm</th>
                    <th className="p-2 border">Pattern</th>
                    <th className="p-2 border">Solution Path</th>
                    <th className="p-2 border">Implementation</th>
                    <th className="p-2 border">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Recursive Backtracking</td>
                    <td className="p-2 border">Long, winding passages with few branches</td>
                    <td className="p-2 border">Often very twisty and deep</td>
                    <td className="p-2 border">Simple, depth-first</td>
                    <td className="p-2 border">Complex, winding mazes</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Kruskal's Algorithm</td>
                    <td className="p-2 border">Balanced branching structure</td>
                    <td className="p-2 border">Medium length with moderate turns</td>
                    <td className="p-2 border">Uses disjoint sets</td>
                    <td className="p-2 border">Visually balanced mazes</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Prim's Algorithm</td>
                    <td className="p-2 border">Tree-like with many short dead ends</td>
                    <td className="p-2 border">Often shorter but more confusing</td>
                    <td className="p-2 border">Edge-focused growth</td>
                    <td className="p-2 border">Mazes with a "natural" feel</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Recursive Division</td>
                    <td className="p-2 border">Long, straight corridors and geometric patterns</td>
                    <td className="p-2 border">Predictable but can be long</td>
                    <td className="p-2 border">Divide and conquer</td>
                    <td className="p-2 border">Visually distinct, structured mazes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Evaluating Maze Complexity</h3>
            <p>
              Several metrics can be used to evaluate the complexity and difficulty of generated mazes:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Solution Length:</strong> Distance from start to end along the correct path</li>
              <li><strong>Dead End Count:</strong> Number of passages that terminate without connecting to others</li>
              <li><strong>Branching Factor:</strong> Average number of choices at each junction</li>
              <li><strong>River Factor:</strong> Tendency of passages to continue straight rather than turn</li>
              <li><strong>Braid Ratio:</strong> Percentage of dead ends converted to loops</li>
              <li><strong>Deepest Point:</strong> Cell with the maximum distance from the entrance</li>
            </ul>
            <p className="mt-3">
              Different algorithms create mazes with different profiles across these metrics. For example,
              Recursive Backtracking tends to create mazes with long solution paths and many dead ends,
              while Recursive Division creates more structured mazes with long, straight corridors.
            </p>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">Historical and Cultural Significance</h3>
            <p>
              Mazes have fascinated humans across cultures and throughout history:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Ancient Origins:</strong> The earliest known mazes date back over 4,000 years to Ancient Egypt and Crete</li>
              <li><strong>Classical Mythology:</strong> The Labyrinth of King Minos and the Minotaur is perhaps the most famous maze in literature</li>
              <li><strong>Garden Mazes:</strong> Hedge mazes became popular in European gardens during the Renaissance</li>
              <li><strong>Modern Applications:</strong> From puzzles to psychology experiments to computer algorithms</li>
              <li><strong>Computational Complexity:</strong> Maze solving algorithms are studied in computer science for path-finding and optimization</li>
            </ul>
            <p className="mt-3 text-sm italic">
              "A maze is a path or collection of paths, typically from an entrance to a goal."
              — The earliest printed maze appeared in 1577 in a book by Italian Renaissance architect Giovanni Battista Belici.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Beyond the Grid</h2>
          <p>
            While this visualization focuses on 2D orthogonal grid mazes, many variations exist:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>3D Mazes:</strong> Extend into three dimensions with passages that go up and down</li>
            <li><strong>Weave Mazes:</strong> Allow passages to cross over or under each other</li>
            <li><strong>Circular Mazes:</strong> Built on concentric circles rather than a grid</li>
            <li><strong>Hex Mazes:</strong> Based on hexagonal cells rather than squares</li>
            <li><strong>Triangular Mazes:</strong> Use triangular cells for a different geometric experience</li>
            <li><strong>Fractal Mazes:</strong> Self-similar patterns that repeat at different scales</li>
            <li><strong>Logic Mazes:</strong> Incorporate rules or constraints beyond simple wall navigation</li>
          </ul>
          <p className="mt-3">
            The algorithms demonstrated here can often be adapted to these different maze types by changing
            the underlying cell structure and connectivity rules.
          </p>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "There's a difference between a maze and a labyrinth. A maze is designed to make you lose your way,
            but a labyrinth is designed to help you find it."
          </p>
        </div>
      </div>
    </div>
  );
};

export default MazeGenerationPage;