import React from 'react';
import MonteCarloVisualizer from '../../components/Visualizations/MonteCarlo/MonteCarloVisualizer';

const MonteCarloPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Monte Carlo Simulation</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Monte Carlo methods are a family of computational algorithms that rely on repeated random
          sampling to obtain numerical results. The name evokes the famous casino in Monaco, reflecting
          the central role of randomness. Despite their simplicity, these methods can solve problems of
          extraordinary complexity — from estimating the value of &pi; to pricing financial derivatives
          and simulating the behavior of subatomic particles.
        </p>
        <p>
          The key insight is that random sampling, when performed at scale, can approximate
          deterministic quantities with surprising accuracy. Choose a mode below to see three classic
          demonstrations: using random points in a square to estimate &pi;, using random sampling to
          compute definite integrals, and Buffon's famous needle-drop experiment — one of the oldest
          Monte Carlo techniques, described in 1777.
        </p>
      </div>

      <MonteCarloVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Monte Carlo Methods</h2>

        <div className="mt-8 grid gap-8">

          {/* Card 1: What are Monte Carlo methods */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">
              What Are Monte Carlo Methods?
            </h3>
            <p>
              A Monte Carlo method is any technique that uses random numbers to solve a problem that might
              be deterministic in principle but is too complex to solve analytically or by direct numerical
              calculation. The approach was formalized in the 1940s by mathematicians{' '}
              <strong>Stanislaw Ulam</strong> and <strong>John von Neumann</strong> while working on nuclear
              weapons simulations at Los Alamos, though the underlying ideas trace back centuries.
            </p>
            <p className="mt-3">
              The <strong>Estimate &pi;</strong> mode shown above is the canonical demonstration. A unit
              square contains an inscribed quarter-circle of radius 1. The ratio of the circle's area
              (&pi;/4) to the square's area (1) means that a random point (x, y) falls inside the circle
              whenever x&sup2;&nbsp;+&nbsp;y&sup2;&nbsp;&le;&nbsp;1. By counting hits versus total throws:
            </p>
            <div className="my-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-center font-mono text-sm">
              &pi; &asymp; 4 &times; (points inside circle) / (total points)
            </div>
            <p>
              With enough samples this estimate converges to the true value, illustrating how a purely
              probabilistic experiment can pin down a geometric constant with arbitrary precision.
            </p>
          </div>

          {/* Card 2: Law of Large Numbers */}
          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
              The Law of Large Numbers
            </h3>
            <p>
              Why do Monte Carlo estimates improve with more samples? The answer lies in one of the
              foundational theorems of probability: the <strong>Law of Large Numbers</strong>. It states
              that as the number of independent, identically distributed random trials n increases, the
              sample average converges to the true expected value:
            </p>
            <div className="my-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-center font-mono text-sm">
              (1/n) &sum; X&#8305; &rarr; E[X] &nbsp; as &nbsp; n &rarr; &infin;
            </div>
            <p>
              In the pi estimation mode, each random point is a Bernoulli trial: it either falls inside
              the quarter-circle (probability &pi;/4) or outside (probability 1 &minus; &pi;/4). The
              sample proportion of "hits" is the sample mean of these Bernoulli variables, and by the
              Law of Large Numbers it converges to &pi;/4. Multiplying by 4 recovers &pi;.
            </p>
            <p className="mt-3">
              The convergence chart above makes this tangible — watch the green line's oscillations dampen
              over time as the estimate homes in on the blue dashed reference line marking the true value.
              This is the Law of Large Numbers playing out in real time.
            </p>
          </div>

          {/* Card 3: Convergence rate */}
          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">
              Convergence Rate: 1/&radic;n
            </h3>
            <p>
              The <strong>Central Limit Theorem</strong> tells us precisely how fast a Monte Carlo estimate
              converges. The standard error of the sample mean — a measure of the typical estimation error
              — decreases as:
            </p>
            <div className="my-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-center font-mono text-sm">
              &sigma;&sub;x&#772; = &sigma; / &radic;n
            </div>
            <p>
              where &sigma; is the standard deviation of the underlying distribution. This 1/&radic;n rate
              is both the strength and the limitation of Monte Carlo methods. To halve the error you need
              four times as many samples; to reduce it by a factor of ten requires one hundred times as
              many samples.
            </p>
            <p className="mt-3">
              Contrast this with classical numerical integration (quadrature), which achieves error rates
              of order 1/n&sup2; or better in one dimension. Monte Carlo integration shines in{' '}
              <em>high-dimensional problems</em>: while quadrature error scales exponentially with
              dimension (the "curse of dimensionality"), Monte Carlo's 1/&radic;n rate is{' '}
              <strong>dimension-independent</strong>. This makes it indispensable when integrating over
              dozens or hundreds of dimensions, as in quantum chemistry or Bayesian inference.
            </p>
            <p className="mt-3">
              Researchers combat the slow 1/&radic;n rate with <strong>variance reduction techniques</strong> —
              importance sampling, stratified sampling, control variates, and quasi-Monte Carlo sequences
              (like Sobol or Halton sequences) that replace pseudo-random points with low-discrepancy
              sequences, effectively achieving convergence closer to 1/n.
            </p>
          </div>

          {/* Card 4: Real-world applications */}
          <div className="bg-amber-50 dark:bg-amber-900/30 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">
              Real-World Applications
            </h3>
            <p>
              Monte Carlo methods are ubiquitous across science, engineering, and finance. A few key
              application domains:
            </p>
            <ul className="mt-3 space-y-3 list-none pl-0">
              <li>
                <strong className="text-amber-800 dark:text-amber-300">Finance &amp; Risk:</strong>{' '}
                The Black-Scholes model and its extensions use Monte Carlo simulation to price options
                and complex derivatives whose payoffs depend on multiple correlated asset paths. Risk
                managers use Monte Carlo to estimate Value-at-Risk (VaR) and Expected Shortfall by
                simulating thousands of possible portfolio outcomes under different market scenarios.
              </li>
              <li>
                <strong className="text-amber-800 dark:text-amber-300">Particle Physics:</strong>{' '}
                The GEANT4 toolkit, used at CERN and laboratories worldwide, simulates the passage of
                particles through matter using Monte Carlo methods. Billions of virtual particles are
                "fired" through a detector geometry to predict detector response and validate theoretical
                models — including the discovery of the Higgs boson in 2012.
              </li>
              <li>
                <strong className="text-amber-800 dark:text-amber-300">Machine Learning:</strong>{' '}
                Monte Carlo Tree Search (MCTS) powers game-playing AI including AlphaGo. Markov Chain
                Monte Carlo (MCMC) — algorithms like Metropolis-Hastings and Hamiltonian Monte Carlo —
                underpins Bayesian inference, allowing practitioners to sample from complex posterior
                distributions that have no closed-form solution.
              </li>
              <li>
                <strong className="text-amber-800 dark:text-amber-300">Climate Modeling:</strong>{' '}
                General circulation models run ensemble simulations using Monte Carlo perturbations of
                initial conditions and physical parameters to quantify forecast uncertainty. Radiative
                transfer through clouds — critically important for climate sensitivity estimates — is
                modeled using photon Monte Carlo methods.
              </li>
              <li>
                <strong className="text-amber-800 dark:text-amber-300">Computer Graphics:</strong>{' '}
                Path tracing, used in modern photorealistic rendering (Pixar, Disney, NVIDIA RTX), is a
                Monte Carlo integration over all possible light paths. Each rendered pixel is the
                average of many randomly sampled light transport paths, with noise decreasing as
                1/&radic;(samples per pixel).
              </li>
            </ul>
          </div>

        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 italic">
            "Anyone who considers arithmetical methods of producing random digits is, of course, in a
            state of sin." &mdash; John von Neumann, 1951
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonteCarloPage;
