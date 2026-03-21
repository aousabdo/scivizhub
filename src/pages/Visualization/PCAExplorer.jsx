import React from 'react';
import PCAExplorerVisualizer from '../../components/Visualizations/PCAExplorer/PCAExplorerVisualizer';

const PCAExplorerPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        PCA &amp; Dimensionality Reduction Visualizer
      </h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          <strong>Principal Component Analysis (PCA)</strong> is one of the most widely used techniques
          in data science and machine learning. It takes high-dimensional data and finds a new coordinate
          system — the <em>principal components</em> — oriented so that the first axis captures the maximum
          possible variance, the second axis captures the maximum of the remaining variance orthogonal to
          the first, and so on. By retaining only the top few components you can compress data while
          preserving most of its structure.
        </p>
        <p>
          This visualizer generates 3-D Gaussian clusters and computes their principal components from
          scratch using a full Jacobi eigendecomposition of the covariance matrix. You can watch the
          projection animation to see how 3-D points collapse onto the PC1–PC2 plane, observe how the
          principal-component arrows (eigenvectors) are oriented relative to your data, and read off
          exactly how much variance each component explains.
        </p>
      </div>

      <PCAExplorerVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding PCA</h2>

        <div className="mt-8 grid gap-8">
          {/* Card 1 — What PCA does */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">
              What PCA Does
            </h3>
            <p>
              PCA rotates your data into a new coordinate frame where the axes are ordered by the amount
              of variance they explain. The first principal component (PC1) points in the direction of
              greatest spread. PC2 is perpendicular to PC1 and captures the next most variance. In 3-D
              data these two components often explain the overwhelming majority of the total variance,
              allowing you to visualise and model the data in 2-D with minimal information loss.
            </p>
            <p className="mt-2">
              Crucially, PCA is a <em>linear</em> method — it finds linear combinations of the original
              features. This makes it interpretable and computationally cheap, though it cannot capture
              non-linear structure the way techniques like t-SNE or UMAP can.
            </p>
          </div>

          {/* Card 2 — Covariance matrix */}
          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
              The Covariance Matrix
            </h3>
            <p>
              Before computing principal components we first <em>centre</em> the data by subtracting
              the column means. Then we compute the <strong>covariance matrix</strong>:
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-3 my-3 font-mono text-sm text-gray-700 dark:text-gray-300">
              C = (1 / (n − 1)) · Xᵀ X
            </div>
            <p>
              where <strong>X</strong> is the centred n × d data matrix. Each entry C[i,j] measures
              how much features i and j vary together. Diagonal entries are the variances of individual
              features; off-diagonal entries capture correlations. Because C is real and symmetric, its
              eigenvectors are guaranteed to be orthogonal and its eigenvalues are real and non-negative.
            </p>
            <p className="mt-2">
              The <strong>Correlation</strong> slider in the visualizer controls the off-diagonal strength
              of the cluster generating process — higher values tilt the data cloud and increase the
              dominance of PC1.
            </p>
          </div>

          {/* Card 3 — Eigendecomposition */}
          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">
              Eigendecomposition via the Jacobi Method
            </h3>
            <p>
              The principal components are the <strong>eigenvectors</strong> of the covariance matrix C,
              and the variance explained by each component equals the corresponding{' '}
              <strong>eigenvalue</strong> divided by the sum of all eigenvalues:
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-3 my-3 font-mono text-sm text-gray-700 dark:text-gray-300">
              C · vₖ = λₖ · vₖ &nbsp;&nbsp; → &nbsp;&nbsp; var_k = λₖ / Σ λᵢ
            </div>
            <p>
              This visualizer implements the <strong>Jacobi eigenvalue algorithm</strong> from scratch.
              It works by repeatedly applying Givens rotations to zero out the largest off-diagonal element,
              converging to a diagonal matrix whose entries are the eigenvalues. The accumulated rotations
              give the eigenvectors. For a 3 × 3 symmetric matrix this converges in a handful of sweeps
              and is exact to floating-point precision.
            </p>
            <p className="mt-2">
              The purple, orange, and sky-blue arrows in the 3-D view represent PC1, PC2, and PC3
              respectively. Their lengths are proportional to the square root of the corresponding
              eigenvalue (i.e., the standard deviation along that component).
            </p>
          </div>

          {/* Card 4 — Applications */}
          <div className="bg-amber-50 dark:bg-amber-900/30 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">
              Applications in Data Science
            </h3>
            <p>
              PCA underpins a surprisingly wide range of real-world workflows:
            </p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>
                <strong>Feature compression:</strong> Image datasets with thousands of pixel features can
                be reduced to a few hundred components while retaining over 95 % of the variance, shrinking
                storage and accelerating downstream models.
              </li>
              <li>
                <strong>Noise filtering:</strong> By projecting data onto the top-k components and
                reconstructing, you discard the low-variance directions that often carry noise, effectively
                denoising the signal.
              </li>
              <li>
                <strong>Exploratory analysis:</strong> Plotting the first two principal components of
                labelled data — a "PCA scatter plot" — is often the first step in understanding cluster
                structure in genomics, finance, and NLP.
              </li>
              <li>
                <strong>Multicollinearity removal:</strong> In regression, highly correlated predictors
                cause unstable coefficient estimates. Replacing them with orthogonal principal components
                stabilises the model (Principal Component Regression).
              </li>
              <li>
                <strong>Face recognition (Eigenfaces):</strong> The classic Turk &amp; Pentland method
                computes PCA on a database of face images; new faces are compared by their projections
                onto the top eigenvectors ("eigenfaces").
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600 my-8">
          <h2 className="text-xl font-bold mb-4">Tips for Exploring</h2>
          <p>
            Increase the <strong>Correlation</strong> slider to make the data strongly elongated along one
            direction — watch PC1 dominate the variance chart. Lower correlation produces a more spherical
            cloud where variance is spread more evenly. Use <strong>Spread</strong> to overlap the clusters
            and see how PCA struggles when class separation is low. Hit <strong>Project → PC1–PC2</strong>{' '}
            (or press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Space</kbd>)
            to animate the 3-D points collapsing onto the principal plane, and press it again to restore
            the 3-D view. Press{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">R</kbd>{' '}
            to regenerate a fresh random dataset.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PCAExplorerPage;
