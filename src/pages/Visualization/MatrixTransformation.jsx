import React from 'react';
import MatrixTransformationVisualizer from '../../components/Visualizations/MatrixTransformation/MatrixTransformationVisualizer';

const MatrixTransformationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Matrix Transformation Visualizer</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Matrix transformations are fundamental to computer graphics, physics simulations, and many areas of applied 
          mathematics. This interactive visualization demonstrates how matrices transform space, allowing you to 
          explore various linear transformations and visualize their effects.
        </p>
        <p>
          Experiment with different matrices in both 2D and 3D modes, see how they affect the coordinate grid, unit shapes, 
          and basis vectors, and create animation sequences to understand transformation composition.
        </p>
      </div>
      
      <MatrixTransformationVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Matrix Transformations</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Linear Transformations</h3>
            <p>
              A linear transformation is a function between vector spaces that preserves vector addition and scalar multiplication.
              In simpler terms, it's a transformation where:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Straight lines remain straight (no curves)</li>
              <li>The origin remains fixed in place</li>
              <li>Parallel lines remain parallel</li>
              <li>Evenly spaced points remain evenly spaced</li>
            </ul>
            <p className="mt-3">
              Every linear transformation can be represented by a matrix, which provides a compact way to express
              and compute the transformation.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Common Transformations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-3 border-collapse">
                <thead>
                  <tr className="bg-green-100">
                    <th className="p-2 border">Transformation</th>
                    <th className="p-2 border">2D Matrix</th>
                    <th className="p-2 border">Effect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Identity</td>
                    <td className="p-2 border font-mono">
                      [1 0]<br />
                      [0 1]
                    </td>
                    <td className="p-2 border">No change (baseline)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Scale</td>
                    <td className="p-2 border font-mono">
                      [sx 0]<br />
                      [0 sy]
                    </td>
                    <td className="p-2 border">Stretches or shrinks in x and y directions</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Rotation</td>
                    <td className="p-2 border font-mono">
                      [cos(θ) -sin(θ)]<br />
                      [sin(θ) cos(θ)]
                    </td>
                    <td className="p-2 border">Rotates by angle θ</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Reflection</td>
                    <td className="p-2 border font-mono">
                      [1 0]<br />
                      [0 -1]
                    </td>
                    <td className="p-2 border">Reflects across the x-axis (example)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Shear</td>
                    <td className="p-2 border font-mono">
                      [1 k]<br />
                      [0 1]
                    </td>
                    <td className="p-2 border">Horizontal shear (example)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Matrix Properties</h3>
            <p>
              The properties of a transformation matrix reveal important characteristics of the transformation:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Determinant:</strong> Represents the scaling factor of area/volume. A zero determinant indicates a loss of dimension.</li>
              <li><strong>Eigenvalues:</strong> Directions that are only scaled, not rotated, by the transformation.</li>
              <li><strong>Orthogonality:</strong> Orthogonal matrices (where rows/columns form orthonormal bases) preserve angles and distances.</li>
              <li><strong>Inverse:</strong> The inverse matrix undoes the transformation. Singular matrices have no inverse.</li>
              <li><strong>Trace:</strong> The sum of diagonal elements relates to rotation characteristics.</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">Real-World Applications</h3>
            <p>
              Matrix transformations are essential in numerous fields:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Computer Graphics:</strong> 3D rendering, animations, game development</li>
              <li><strong>Computer Vision:</strong> Image processing, feature detection, perspective transformations</li>
              <li><strong>Robotics:</strong> Kinematics, path planning, coordinate transformations</li>
              <li><strong>Physics:</strong> Quantum mechanics, relativity, rigid body dynamics</li>
              <li><strong>Engineering:</strong> Stress analysis, electrical networks, control systems</li>
              <li><strong>Data Science:</strong> Principal Component Analysis, dimensionality reduction</li>
              <li><strong>Cryptography:</strong> Hill cipher and other matrix-based encryption methods</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Tips for Using This Visualization</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Start with preset transformations</strong> to get a feel for common matrix operations
            </li>
            <li>
              <strong>Create transformation sequences</strong> to visualize matrix multiplication and composition
            </li>
            <li>
              <strong>Toggle different visualization elements</strong> (grid, unit shape, axes, vectors) to focus on specific aspects
            </li>
            <li>
              <strong>Compare 2D and 3D transformations</strong> to understand dimensional differences
            </li>
            <li>
              <strong>Animate sequences</strong> to see smooth transitions between transformation states
            </li>
            <li>
              <strong>Experiment with singular matrices</strong> to observe dimension collapse
            </li>
          </ul>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "Linear algebra is the language of the universe. Matrix transformations provide us with a window into 
            how space itself can be stretched, rotated, and reshaped by the fundamental laws of mathematics."
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatrixTransformationPage;