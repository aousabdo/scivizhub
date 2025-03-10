import React from 'react';
import TravelingSalesmanVisualizer from '../../components/Visualizations/TravelingSalesman/TravelingSalesmanVisualizer';

const TravelingSalesmanPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Traveling Salesman Problem</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The Traveling Salesman Problem (TSP) is one of the most intensively studied problems in computational 
          mathematics. It asks: "Given a list of cities and the distances between each pair of cities, what is the 
          shortest possible route that visits each city exactly once and returns to the origin city?"
        </p>
        <p>
          This visualization demonstrates different heuristic approaches to solving this NP-hard problem, comparing
          their effectiveness, speed, and tradeoffs through interactive animation.
        </p>
      </div>
      
      <TravelingSalesmanVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Exploring the Traveling Salesman Problem</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">The Computational Challenge</h3>
            <p>
              The TSP is classified as an NP-hard problem, which means finding the exact optimal solution 
              is believed to require time that grows exponentially with the problem size.
            </p>
            
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono">
                Possible routes for n cities: (n-1)!/2
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                For just 20 cities, there are over 60 quintillion possible routes!
              </p>
              <div className="mt-3 text-center">
                <table className="mx-auto text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-1">Cities</th>
                      <th className="px-3 py-1">Possible Routes</th>
                      <th className="px-3 py-1">Time at 1 billion routes/second</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-1 border">5</td>
                      <td className="px-3 py-1 border">12</td>
                      <td className="px-3 py-1 border">&lt;0.000001 sec</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1 border">10</td>
                      <td className="px-3 py-1 border">181,440</td>
                      <td className="px-3 py-1 border">0.0002 sec</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1 border">15</td>
                      <td className="px-3 py-1 border">43.6 billion</td>
                      <td className="px-3 py-1 border">43.6 sec</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1 border">20</td>
                      <td className="px-3 py-1 border">60 quintillion</td>
                      <td className="px-3 py-1 border">1.9 trillion years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <p>
              This is why we use heuristic approaches that can find good (but not necessarily optimal) solutions 
              in reasonable time. The visualization demonstrates three common heuristic strategies.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Heuristic Approaches</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-3 border-collapse">
                <thead>
                  <tr className="bg-green-100">
                    <th className="p-2 border">Algorithm</th>
                    <th className="p-2 border">Approach</th>
                    <th className="p-2 border">Quality of Solution</th>
                    <th className="p-2 border">Speed</th>
                    <th className="p-2 border">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Nearest Neighbor</td>
                    <td className="p-2 border">Greedy selection of closest unvisited city</td>
                    <td className="p-2 border">Fair (~25% above optimal)</td>
                    <td className="p-2 border">Very Fast</td>
                    <td className="p-2 border">Quick approximations, initial solutions</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">2-Opt</td>
                    <td className="p-2 border">Iterative improvement by edge exchange</td>
                    <td className="p-2 border">Good (~5-10% above optimal)</td>
                    <td className="p-2 border">Medium</td>
                    <td className="p-2 border">Refining existing solutions</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Genetic Algorithm</td>
                    <td className="p-2 border">Evolutionary search using population</td>
                    <td className="p-2 border">Very Good (often close to optimal)</td>
                    <td className="p-2 border">Slow</td>
                    <td className="p-2 border">Complex problems, high-quality solutions</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              Often, these approaches are combined: a fast algorithm like Nearest Neighbor generates an initial solution,
              then improvement methods like 2-Opt or genetic algorithms refine it.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Real-World Applications</h3>
            <p>
              The TSP appears in many practical scenarios, sometimes in disguised forms:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Logistics and Delivery:</strong> Route planning for delivery vehicles, service technicians, and transportation</li>
              <li><strong>Manufacturing:</strong> Optimizing tool paths for machines like drill presses, CNC machines, and 3D printers</li>
              <li><strong>Circuit Design:</strong> Arranging components and wiring on printed circuit boards</li>
              <li><strong>Genome Sequencing:</strong> Assembling DNA fragments in the correct order</li>
              <li><strong>Astronomy:</strong> Planning telescope observation schedules to minimize movement time</li>
              <li><strong>Warehouse Operations:</strong> Optimizing picking routes for order fulfillment</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">Variations and Extensions</h3>
            <p>
              The classic TSP has spawned numerous variations to address real-world constraints:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Multiple Traveling Salesmen Problem (mTSP):</strong> Multiple routes starting from a central depot</li>
              <li><strong>Vehicle Routing Problem (VRP):</strong> Routes for multiple vehicles with capacity constraints</li>
              <li><strong>TSP with Time Windows:</strong> Cities must be visited within specific time periods</li>
              <li><strong>Open TSP:</strong> No requirement to return to the starting city</li>
              <li><strong>Clustered TSP:</strong> Cities are grouped, and all cities in a group must be visited consecutively</li>
              <li><strong>Euclidean TSP:</strong> Distances satisfy the triangle inequality (as in our visualization)</li>
              <li><strong>Asymmetric TSP:</strong> Distance from A to B may differ from B to A (e.g., one-way streets)</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Historical Context</h2>
          <p>
            The TSP has a rich history dating back to the 1800s, though it wasn't formalized until the 1930s when 
            mathematicians Karl Menger and Hassler Whitney began studying it. It became especially prominent during 
            the rise of computer science in the 1950s and 1960s.
          </p>
          <p className="mt-3">
            In 1954, George Dantzig, Ray Fulkerson, and Selmer Johnson published a method to solve a 49-city instance, 
            remarkable for its time. Since then, solving increasingly larger instances has been a benchmark for 
            computational methods.
          </p>
          <p className="mt-3">
            Today, the largest exactly solved instance has 85,900 cities, achieved in 2006 by Cook, Espinoza, and 
            Goycoolea. This incredible achievement relied on sophisticated mathematical techniques and substantial 
            computing power.
          </p>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The traveling salesman problem is deceptively simple, yet it encapsulates the core challenges 
            of computational complexity and optimization that drive computer science forward."
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravelingSalesmanPage;