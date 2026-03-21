import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import EigenGeometryVisualizer from '../../components/Visualizations/EigenGeometry/EigenGeometryVisualizer';

const EigenGeometryExplorerPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Eigenvector and Eigenvalue Geometry Explorer</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Eigenvectors are special directions that a linear transformation does not rotate; it only scales them. The
          corresponding scaling factors are the eigenvalues. The defining equation is:
        </p>
        <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
          <BlockMath>{"A\\mathbf{v} = \\lambda\\mathbf{v}"}</BlockMath>
        </div>
        <p>
          where <InlineMath>{"A"}</InlineMath> is the transformation matrix, <InlineMath>{"\\mathbf{v}"}</InlineMath> is
          an eigenvector, and <InlineMath>{"\\lambda"}</InlineMath> is the corresponding eigenvalue. Together they reveal
          the transformation’s core geometric behavior.
        </p>
        <p>
          This explorer focuses on 2×2 matrices and shows how grids, vectors, and the unit circle transform. It also reports
          determinant, trace, and real versus complex eigenstructure, linking algebraic formulas to visual intuition.
        </p>
      </div>

      <EigenGeometryVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">How to Read the Visualization</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">Invariant Directions</h3>
            <p>
              Dashed amber lines mark real eigenvector directions. Any vector on one of these lines is mapped back onto the
              same line by the transformation, only stretched or flipped by the associated eigenvalue <InlineMath>{"\\lambda"}</InlineMath>.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">Determinant and Area</h3>
            <p>
              The determinant is the area-scaling factor and equals the product of the eigenvalues:
            </p>
            <div className="my-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
              <BlockMath>{"\\det(A) = \\lambda_1 \\cdot \\lambda_2"}</BlockMath>
            </div>
            <p>
              If <InlineMath>{"\\det(A) < 0"}</InlineMath>, orientation is reversed (a flip). If <InlineMath>{"\\det(A) = 0"}</InlineMath>,
              the transformation is singular and collapses area to a line or point.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Complex Eigenvalues</h3>
            <p>
              For a 2×2 matrix, eigenvalues are found via the characteristic equation:
            </p>
            <div className="my-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
              <BlockMath>{"\\lambda^2 - \\text{tr}(A)\\,\\lambda + \\det(A) = 0"}</BlockMath>
            </div>
            <p>
              When the discriminant <InlineMath>{"\\text{tr}(A)^2 - 4\\det(A) < 0"}</InlineMath>, eigenvalues are complex
              conjugates <InlineMath>{"\\lambda = \\alpha \\pm \\beta i"}</InlineMath> and there are no real invariant
              directions. In 2-D this appears as rotation combined with scaling.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600 my-8">
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
