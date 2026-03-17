import React from 'react';
import VoronoiDiagramVisualizer from '../../components/Visualizations/VoronoiDiagram/VoronoiDiagramVisualizer';

const VoronoiDiagramPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Voronoi Diagram Explorer</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          A Voronoi diagram partitions a plane into regions based on proximity to a set of seed points.
          Each region contains all the points that are closer to its seed than to any other seed, creating
          a beautiful tessellation that appears throughout nature, science, and engineering. From the
          patterns on a giraffe's skin to the service areas of cell towers, Voronoi diagrams describe
          how space is naturally divided by competing centers of influence.
        </p>
        <p>
          Click on the canvas to place seed points and watch the diagram update in real time. Enable
          animation to see the seeds drift and the regions reshape dynamically. Toggle the Delaunay
          triangulation overlay to explore the elegant dual-graph relationship, or turn on distance
          coloring to visualize how proximity varies within each cell.
        </p>
      </div>

      <VoronoiDiagramVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Voronoi Diagrams</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">What Is a Voronoi Diagram?</h3>
            <p>
              Given a set of seed points (also called sites or generators) in a plane, a Voronoi diagram
              divides the plane into regions called <strong>Voronoi cells</strong>. Each cell contains
              exactly one seed, and every point within that cell is closer to its seed than to any other
              seed in the set. The boundaries between cells are formed by the perpendicular bisectors of
              the line segments connecting neighboring seeds.
            </p>
            <p className="mt-3">
              Formally, for a set of seeds S = {'{'}s_1, s_2, ..., s_n{'}'}, the Voronoi cell for seed s_i
              is the set of all points p such that d(p, s_i) &le; d(p, s_j) for all j &ne; i, where d is
              the Euclidean distance function. The result is a partition of the entire plane into convex
              polygonal regions (with some cells extending to infinity at the boundary).
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono text-sm">
                V(s_i) = {'{'} p : ||p - s_i|| &le; ||p - s_j|| for all j &ne; i {'}'}
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                The Voronoi cell for seed s_i contains all points nearest to s_i
              </p>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Delaunay Triangulation</h3>
            <p>
              The <strong>Delaunay triangulation</strong> is the geometric dual of the Voronoi diagram.
              Two seeds are connected by a Delaunay edge if and only if their Voronoi cells share a
              boundary. The result is a triangulation of the seed points with a remarkable property:
              no seed point lies inside the circumscribed circle of any triangle.
            </p>
            <p className="mt-3">
              This <strong>empty circumcircle property</strong> makes the Delaunay triangulation optimal
              in several ways. It maximizes the minimum angle across all triangulations of the same point
              set, avoiding thin, elongated triangles that cause numerical instability. This makes it the
              preferred triangulation for finite element methods, terrain modeling, and mesh generation.
            </p>
            <p className="mt-3">
              The duality is elegant: Voronoi vertices (where three or more cell boundaries meet) correspond
              to Delaunay triangles, and Voronoi edges correspond to Delaunay edges. Computing one gives you
              the other essentially for free.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Fortune's Algorithm</h3>
            <p>
              While the brute-force approach of checking every pixel against every seed works for small
              point sets, computing Voronoi diagrams efficiently requires sophisticated algorithms.
              <strong> Fortune's sweep line algorithm</strong>, published by Steven Fortune in 1986,
              computes the Voronoi diagram in O(n log n) time using O(n) space.
            </p>
            <p className="mt-3">
              The algorithm sweeps a horizontal line across the plane from top to bottom. Above the
              sweep line, the Voronoi diagram is fully determined. The critical insight is that the
              boundary between the known and unknown regions forms a <strong>beach line</strong> -- a
              chain of parabolic arcs, each associated with a seed point. As the sweep line advances,
              the parabolas grow, and two events can occur:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Site events:</strong> A new seed is encountered, inserting a new parabolic arc
                into the beach line.
              </li>
              <li>
                <strong>Circle events:</strong> Three consecutive arcs converge, causing the middle arc
                to disappear and creating a Voronoi vertex.
              </li>
            </ul>
            <p className="mt-3">
              These events are processed using a priority queue, yielding the optimal O(n log n)
              complexity -- the same as sorting, and provably optimal for this problem.
            </p>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">Applications</h3>
            <p>
              Voronoi diagrams appear in a remarkable range of fields, wherever the notion of
              "nearest neighbor" or "territory" is relevant:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Geography and Urban Planning:</strong> Defining service areas for hospitals,
                fire stations, post offices, and cell towers. Each facility "owns" the region of
                people closest to it.
              </li>
              <li>
                <strong>Cell Biology:</strong> The pattern of cells in biological tissue closely
                resembles Voronoi tessellations. Cell growth from nucleation points naturally produces
                Voronoi-like boundaries as cells expand until they meet their neighbors.
              </li>
              <li>
                <strong>Crystallography:</strong> The Wigner-Seitz cell in solid-state physics is a
                Voronoi cell around each atom in a crystal lattice. Crystal grain boundaries formed
                during solidification follow Voronoi patterns.
              </li>
              <li>
                <strong>Ecology and Animal Behavior:</strong> Territorial animals often divide space
                in Voronoi-like patterns. The foraging territories of ant colonies and the nesting
                territories of birds approximate Voronoi diagrams.
              </li>
              <li>
                <strong>Computer Graphics and Game AI:</strong> Procedural terrain generation, texture
                synthesis, and spatial partitioning for pathfinding and collision detection all use
                Voronoi diagrams as fundamental building blocks.
              </li>
              <li>
                <strong>Astronomy:</strong> The large-scale structure of the universe -- galaxy clusters,
                filaments, and voids -- can be modeled using Voronoi tessellations of matter distribution.
              </li>
            </ul>
          </div>

          <div className="bg-rose-50 p-6 rounded-lg border border-rose-200">
            <h3 className="text-xl font-bold text-rose-800 mb-3">History and Mathematical Lineage</h3>
            <p>
              The concept of partitioning space by nearest-neighbor proximity has been independently
              discovered multiple times across mathematics and science:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>1644 -- Rene Descartes</strong> sketched the first known Voronoi-like diagram
                in his treatise <em>Principia Philosophiae</em>, depicting how matter in the solar
                system is divided into vortices around stars.
              </li>
              <li>
                <strong>1850 -- Peter Gustav Lejeune Dirichlet</strong> formally studied these
                partitions in the context of number theory and quadratic forms in two and three
                dimensions. In some fields, Voronoi cells are still called <em>Dirichlet domains</em>.
              </li>
              <li>
                <strong>1908 -- Georgy Voronoi</strong> generalized Dirichlet's work to arbitrary
                dimensions, providing the rigorous mathematical framework that bears his name. His
                work connected these geometric structures to the theory of lattices and positive
                definite quadratic forms.
              </li>
              <li>
                <strong>1911 -- Alfred Lotka</strong> and later ecologists recognized Voronoi-like
                patterns in natural territories. The <em>Thiessen polygons</em> used in meteorology
                (named after Alfred Thiessen, 1911) are the same concept applied to rain gauge
                interpolation.
              </li>
              <li>
                <strong>1985--present</strong> -- The computational geometry revolution brought efficient
                algorithms (Fortune's sweep line, randomized incremental construction) and applications
                in computer science, making Voronoi diagrams one of the most studied structures in the field.
              </li>
            </ul>
            <p className="mt-3 text-sm italic">
              "The Voronoi diagram is one of the most fundamental data structures in computational geometry."
              -- Mark de Berg, Computational Geometry: Algorithms and Applications
            </p>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "Nature uses Voronoi diagrams everywhere -- from the cracking of dried mud to the
            arrangement of seeds in a sunflower."
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoronoiDiagramPage;
