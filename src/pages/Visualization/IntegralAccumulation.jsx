import React from 'react';
import IntegralAccumulationVisualizer from '../../components/Visualizations/IntegralAccumulation/IntegralAccumulationVisualizer';

const IntegralAccumulationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Integral Accumulation Visualizer</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Definite integrals measure accumulated change. Geometrically, they represent signed area under a curve between two
          bounds, often approximated by partitioning the interval into smaller pieces.
        </p>
        <p>
          This interactive tool lets you compare common numerical methods, including Riemann sums and the trapezoidal rule,
          against the exact integral for selected functions.
        </p>
      </div>

      <IntegralAccumulationVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Core Ideas Behind Integral Accumulation</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Partitioning the Interval</h3>
            <p>
              We split the interval [a, b] into n equal subintervals with width Δx = (b-a)/n. Each method uses these slices
              to estimate area contributions that are then summed.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Approximation vs Exact Value</h3>
            <p>
              Numerical rules estimate the integral using finite geometry. When an antiderivative is known, the exact value
              comes from the Fundamental Theorem of Calculus: ∫[a,b] f(x)dx = F(b) - F(a).
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Convergence</h3>
            <p>
              Increasing n usually decreases error because each slice becomes narrower and tracks the curve more closely.
              Different methods converge at different rates depending on function shape.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Where This Matters</h2>
          <p>
            Integral accumulation appears across physics, engineering, economics, and data science whenever continuous rates
            must be aggregated into total quantities, such as displacement from velocity or total probability mass.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegralAccumulationPage;
