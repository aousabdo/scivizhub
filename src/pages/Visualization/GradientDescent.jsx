import React from 'react';
import GradientDescentVisualizer from '../../components/Visualizations/GradientDescent/GradientDescentVisualizer';

const GradientDescentPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Gradient Descent Visualizer</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Gradient descent is the workhorse optimization algorithm behind virtually every machine
          learning model trained today. Given a differentiable loss function — a mathematical measure
          of how wrong a model's predictions are — gradient descent iteratively nudges the model's
          parameters in the direction that most steeply reduces the loss.
        </p>
        <p>
          This visualization renders a 2D loss surface as a heatmap (cool blues = low loss, hot reds
          = high loss) and simultaneously animates four popular optimizers as they each attempt to
          find the global minimum. Watch how different strategies handle flat regions, steep valleys,
          and the notorious saddle points found in high-dimensional parameter spaces.
        </p>
      </div>

      <GradientDescentVisualizer />

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-8">Understanding Gradient Descent</h2>

        <div className="grid gap-6">

          {/* How gradient descent works */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">
              How Gradient Descent Works
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The gradient of a function at any point is a vector pointing in the direction of
              steepest ascent. By moving a small step in the <em>opposite</em> direction — the
              negative gradient — we descend the loss surface. Formally, for parameters{' '}
              <strong>θ</strong>:
            </p>
            <pre className="mt-3 bg-blue-100 dark:bg-blue-900/50 rounded p-3 text-sm font-mono text-blue-900 dark:text-blue-200 overflow-x-auto">
              θ ← θ − α · ∇f(θ)
            </pre>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              Here <strong>α</strong> is the learning rate — a critical hyperparameter controlling
              the step size. Too large and the optimizer overshoots and diverges; too small and
              convergence is painfully slow. Try adjusting the learning rate slider and observe how
              the paths change.
            </p>
            <ul className="mt-3 space-y-1 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Bowl (x² + y²)</strong> — Strongly convex; all optimizers converge to the
                unique global minimum at (0, 0).
              </li>
              <li>
                <strong>Rosenbrock</strong> — A narrow, curved valley with the minimum at (1, 1).
                Tests an optimizer's ability to navigate an ill-conditioned landscape.
              </li>
              <li>
                <strong>Himmelblau's</strong> — Four global minima of equal value; demonstrates how
                different optimizers can converge to different solutions.
              </li>
              <li>
                <strong>Rastrigin</strong> — Highly multimodal with many local minima; a benchmark
                for global optimization difficulty.
              </li>
            </ul>
          </div>

          {/* Optimizer comparisons */}
          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
              Optimizer Comparisons
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              All four optimizers shown are in everyday use in deep learning frameworks like PyTorch
              and TensorFlow. Each builds on the last with additional mechanisms to handle common
              failure modes:
            </p>
            <ul className="mt-3 space-y-3 text-gray-700 dark:text-gray-300">
              <li>
                <strong className="text-red-500">SGD</strong> — Vanilla stochastic gradient descent.
                Simple and interpretable, but sensitive to learning rate and slow on ill-conditioned
                surfaces. Update rule: <code>θ ← θ − α·∇f</code>.
              </li>
              <li>
                <strong className="text-yellow-500">SGD + Momentum</strong> — Accumulates a velocity
                vector in the direction of persistent gradients, damping oscillations and accelerating
                convergence in shallow, consistent directions. Update rule:{' '}
                <code>v ← β·v + α·∇f; θ ← θ − v</code>.
              </li>
              <li>
                <strong className="text-emerald-500">RMSProp</strong> — Maintains a per-parameter
                running average of squared gradients to adaptively scale the learning rate. Large
                gradients shrink the effective step; small gradients enlarge it — helping escape
                flat regions. Update rule:{' '}
                <code>s ← β·s + (1−β)·(∇f)²; θ ← θ − α·∇f / √(s+ε)</code>.
              </li>
              <li>
                <strong className="text-indigo-400">Adam</strong> — Combines momentum
                (first moment) with RMSProp-style adaptive scaling (second moment) plus bias
                correction for the first few steps. Generally the most robust out-of-the-box
                optimizer for deep learning.
              </li>
            </ul>
          </div>

          {/* Learning rate effects */}
          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">
              Learning Rate Effects
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The learning rate is arguably the single most important hyperparameter to tune. Use
              the slider to explore three regimes:
            </p>
            <ul className="mt-3 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Too small (≤ 0.005)</strong> — The optimizer takes tiny steps and converges
                very slowly. In practice this translates to hours or days of unnecessary extra
                training time.
              </li>
              <li>
                <strong>Just right (0.01 – 0.1)</strong> — Smooth, efficient descent. The exact
                sweet spot depends on the function landscape and the optimizer.
              </li>
              <li>
                <strong>Too large (≥ 0.5)</strong> — The optimizer overshoots the minimum,
                oscillates wildly, or diverges entirely, especially for SGD on non-convex surfaces.
                Adaptive methods (RMSProp, Adam) are more forgiving because their effective per-
                parameter rate is automatically rescaled.
              </li>
            </ul>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              Modern practice often uses <em>learning rate schedules</em> — starting high for rapid
              initial progress, then decaying to allow fine-grained convergence — or automated
              methods like cyclical learning rates and warm restarts.
            </p>
          </div>

          {/* Real-world applications */}
          <div className="bg-amber-50 dark:bg-amber-900/30 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">
              Real-World Applications
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Every time a neural network learns — whether it is recognizing images, translating
              languages, or generating text — gradient descent (or one of its variants) is running
              under the hood. The 2D loss surfaces shown here are a toy stand-in for parameter
              spaces with millions or billions of dimensions, but the core math is identical.
            </p>
            <ul className="mt-3 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Deep Learning</strong> — Training GPT, ResNet, and Stable Diffusion all rely
                on Adam or AdamW (Adam with decoupled weight decay) applied to loss surfaces of
                staggering complexity.
              </li>
              <li>
                <strong>Logistic Regression</strong> — A convex bowl-shaped loss (like the first
                function shown) where gradient descent is guaranteed to find the global minimum.
              </li>
              <li>
                <strong>Reinforcement Learning</strong> — Policy gradient methods use noisy gradient
                estimates from sampled trajectories, requiring robust adaptive optimizers to handle
                high variance.
              </li>
              <li>
                <strong>Scientific Computing</strong> — Inverse problems in physics, chemistry, and
                engineering — fitting a model to experimental data — are often framed as loss
                minimization and solved with the exact same algorithms.
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GradientDescentPage;
