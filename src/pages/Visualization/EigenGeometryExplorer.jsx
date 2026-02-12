import React from 'react';
import EigenGeometryVisualizer from '../../components/Visualizations/EigenGeometry/EigenGeometryVisualizer';

const EigenGeometryExplorerPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Eigenvector and Eigenvalue Geometry Explorer</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Eigenvectors are special directions that a linear transformation does not rotate; it only scales them. The
          corresponding scaling factors are the eigenvalues. Together they reveal the transformation’s core geometric
          behavior.
        </p>
        <p>
          This explorer focuses on 2x2 matrices and shows how grids, vectors, and the unit circle transform. It also reports
          determinant, trace, and real versus complex eigenstructure, linking algebraic formulas to visual intuition.
        </p>
      </div>

      <EigenGeometryVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">How to Read the Visualization</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Invariant Directions</h3>
            <p>
              Dashed amber lines mark real eigenvector directions. Any vector on one of these lines is mapped back onto the
              same line by the transformation, only stretched or flipped by the associated eigenvalue.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Determinant and Area</h3>
            <p>
              The determinant is the area-scaling factor. If det(A) is negative, orientation is reversed (a flip). If
              det(A)=0, the transformation is singular and collapses area to a line or point.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Complex Eigenvalues</h3>
            <p>
              When the discriminant is negative, eigenvalues are complex and there are no real invariant directions. In 2D,
              this often appears as rotation combined with scaling.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Why This Matters</h2>
          <p>
            Eigen-analysis is foundational in differential equations, stability analysis, principal component analysis,
            quantum mechanics, and many numerical algorithms. Understanding the geometry helps make these topics less abstract.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EigenGeometryExplorerPage;
