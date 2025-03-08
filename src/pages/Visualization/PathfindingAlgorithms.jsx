import React from 'react';
import PathfindingAlgorithmVisualizer from '../../components/Visualizations/PathfindingAlgorithms/PathfindingAlgorithmVisualizer';

const PathfindingAlgorithmsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Pathfinding Algorithms Visualizer</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Pathfinding algorithms are essential tools in computer science that solve the problem of finding the shortest 
          or most efficient route between two points. This interactive visualization lets you explore and compare 
          different algorithms as they search for paths through mazes and obstacles.
        </p>
        <p>
          Create walls by clicking and dragging on the grid, place the start and end points, and observe how different 
          algorithms navigate the terrain. Watch in real-time as the algorithms explore the grid, and see the resulting path once they reach the target.
        </p>
      </div>
      
      <PathfindingAlgorithmVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Pathfinding Algorithms</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Algorithm Characteristics</h3>
            <p>
              When comparing pathfinding algorithms, it's important to understand several key properties:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Completeness:</strong> Will the algorithm always find a path if one exists?</li>
              <li><strong>Optimality:</strong> Does the algorithm guarantee the shortest path?</li>
              <li><strong>Time Complexity:</strong> How does the runtime scale with grid size?</li>
              <li><strong>Space Complexity:</strong> How much memory does the algorithm require?</li>
              <li><strong>Heuristics:</strong> Does the algorithm use estimated distances to guide the search?</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Algorithm Comparison</h3>
            <p>
              The visualization includes several popular pathfinding algorithms:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-3 border-collapse">
                <thead>
                  <tr className="bg-green-100">
                    <th className="p-2 border">Algorithm</th>
                    <th className="p-2 border">Optimal Path</th>
                    <th className="p-2 border">Speed</th>
                    <th className="p-2 border">Memory Usage</th>
                    <th className="p-2 border">Best Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Dijkstra's</td>
                    <td className="p-2 border">Guaranteed</td>
                    <td className="p-2 border">Moderate</td>
                    <td className="p-2 border">Moderate</td>
                    <td className="p-2 border">When optimality is crucial in weighted graphs</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">A*</td>
                    <td className="p-2 border">Guaranteed*</td>
                    <td className="p-2 border">Fast</td>
                    <td className="p-2 border">Moderate</td>
                    <td className="p-2 border">When efficiency and optimality are both important</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Breadth-First</td>
                    <td className="p-2 border">Guaranteed in unweighted graphs</td>
                    <td className="p-2 border">Slow</td>
                    <td className="p-2 border">High</td>
                    <td className="p-2 border">When all edges have equal weight</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Depth-First</td>
                    <td className="p-2 border">Not guaranteed</td>
                    <td className="p-2 border">Fast</td>
                    <td className="p-2 border">Low</td>
                    <td className="p-2 border">Maze generation, exploring all possibilities</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Greedy Best-First</td>
                    <td className="p-2 border">Not guaranteed</td>
                    <td className="p-2 border">Very Fast</td>
                    <td className="p-2 border">Low</td>
                    <td className="p-2 border">When speed is more important than optimality</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-2">*Guaranteed optimal if the heuristic is admissible (never overestimates)</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Real-World Applications</h3>
            <p>
              Pathfinding algorithms have numerous practical applications:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>GPS Navigation:</strong> Finding optimal routes on road networks</li>
              <li><strong>Video Games:</strong> Character movement and AI decision making</li>
              <li><strong>Robotics:</strong> Autonomous navigation in physical environments</li>
              <li><strong>Network Routing:</strong> Data packet routing in computer networks</li>
              <li><strong>Logistics:</strong> Planning delivery routes for transportation</li>
              <li><strong>Artificial Intelligence:</strong> Problem-solving and planning tasks</li>
              <li><strong>City Planning:</strong> Designing efficient public transportation networks</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Key Insights</h2>
          <p>
            Experimenting with this visualization reveals several important insights about pathfinding:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>
              The optimal algorithm depends on your specific constraints (speed, memory, optimality)
            </li>
            <li>
              A* typically offers the best balance between efficiency and finding the shortest path
            </li>
            <li>
              Some algorithms (like DFS) can get "stuck" exploring distant branches before finding the target
            </li>
            <li>
              Grid topology significantly affects algorithm performance - open spaces vs maze-like environments
            </li>
            <li>
              Heuristic-guided algorithms perform better when there's a clear "direction" to the goal
            </li>
          </ul>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "Pathfinding algorithms represent one of the most beautiful intersections of mathematics, computer science, and practical problem-solving."
          </p>
        </div>
      </div>
    </div>
  );
};

export default PathfindingAlgorithmsPage;