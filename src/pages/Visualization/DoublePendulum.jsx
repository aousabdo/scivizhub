import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import DoublePendulumVisualizer from '../../components/Visualizations/DoublePendulum/DoublePendulumVisualizer';

const DoublePendulumPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Double Pendulum & Chaos Theory</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The double pendulum is one of the simplest physical systems that exhibits chaotic behavior.
          Despite being governed by deterministic equations, a double pendulum's motion is exquisitely
          sensitive to its initial conditions -- a hallmark of chaos. Two pendulums released from
          nearly identical starting positions will rapidly diverge into completely different trajectories.
        </p>
        <p>
          This visualization lets you explore the rich dynamics of the double pendulum: watch the
          mesmerizing trails, compare two nearly identical setups to witness the butterfly effect
          firsthand, and track how energy flows between kinetic and potential forms while the total
          remains conserved.
        </p>
      </div>

      <DoublePendulumVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Science Behind Double Pendulum Chaos</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">Mathematical Foundation</h3>
            <p>
              The double pendulum is analyzed using Lagrangian mechanics. The Lagrangian
              <InlineMath>{"L = T - V"}</InlineMath> (kinetic minus potential energy) yields two coupled second-order
              differential equations for the angles <InlineMath>{"\\theta_1"}</InlineMath> and <InlineMath>{"\\theta_2"}</InlineMath>.
            </p>

            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"L = \\tfrac{1}{2}(m_1+m_2)L_1^2\\dot{\\theta}_1^2 + \\tfrac{1}{2}m_2 L_2^2\\dot{\\theta}_2^2 + m_2 L_1 L_2 \\dot{\\theta}_1 \\dot{\\theta}_2 \\cos(\\theta_1 - \\theta_2)"}</BlockMath>
              <BlockMath>{"\\quad + (m_1+m_2)gL_1\\cos\\theta_1 + m_2 gL_2\\cos\\theta_2"}</BlockMath>
              <p className="mt-2 text-sm text-center text-gray-600">
                Applying the Euler–Lagrange equations <InlineMath>{"\\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot{\\theta}} - \\frac{\\partial L}{\\partial \\theta} = 0"}</InlineMath> yields the equations of motion for each angle.
              </p>
            </div>

            <p>
              These coupled nonlinear ODEs cannot be solved analytically. The simulation uses
              Runge-Kutta 4th order (RK4) numerical integration, which provides excellent accuracy
              by evaluating derivatives at four points per time step and computing a weighted average.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">Chaos Theory</h3>
            <p>
              The double pendulum is a paradigmatic example of deterministic chaos. Key concepts
              illustrated by this system include:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Sensitive Dependence on Initial Conditions:</strong> Often called the
                "butterfly effect," this means that two trajectories starting infinitesimally
                close together will diverge exponentially over time. Use the Compare mode to see
                how a mere 0.5° difference leads to completely different behavior.
              </li>
              <li>
                <strong>Lyapunov Exponents:</strong> These quantify the rate of divergence between
                nearby trajectories. A positive largest Lyapunov exponent is the mathematical
                signature of chaos. For the double pendulum at high energies, this exponent is
                positive, confirming chaotic dynamics.
              </li>
              <li>
                <strong>Strange Attractors:</strong> When damping is present, the system's
                phase-space trajectory converges to a fractal set called a strange attractor.
                The attractor has a non-integer dimension, reflecting its infinitely complex structure.
              </li>
              <li>
                <strong>Mixing of Regular and Chaotic Regions:</strong> At lower energies the
                double pendulum can exhibit quasi-periodic (regular) motion, while at higher
                energies the motion becomes fully chaotic. This transition is visible in Poincare
                sections of the phase space.
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Applications</h3>
            <p>
              The principles of chaos theory revealed by the double pendulum extend far beyond
              this simple mechanical system:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Weather Prediction:</strong> Edward Lorenz discovered that atmospheric
                convection models exhibit sensitive dependence, fundamentally limiting long-range
                weather forecasts. This is why reliable predictions rarely extend beyond about
                10 days.
              </li>
              <li>
                <strong>Population Dynamics:</strong> The logistic map and Lotka-Volterra equations
                show that simple ecological models can produce chaotic population fluctuations,
                explaining why some species populations vary unpredictably.
              </li>
              <li>
                <strong>Turbulence:</strong> Fluid flows transition from laminar to turbulent
                through a cascade of bifurcations analogous to the onset of chaos in the double
                pendulum. Understanding this transition remains one of the great open problems
                in physics.
              </li>
              <li>
                <strong>Cardiac Fibrillation:</strong> The heart's electrical system can transition
                from regular beating to chaotic rhythms, and chaos theory provides frameworks for
                understanding and treating arrhythmias.
              </li>
              <li>
                <strong>Cryptography:</strong> Chaotic maps are used to design encryption
                algorithms, leveraging their sensitivity and mixing properties to produce
                cryptographically strong sequences.
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600">
            <h3 className="text-xl font-bold mb-4">Historical Context</h3>
            <p>
              The study of chaos has deep roots. In the 1880s, <strong>Henri Poincare</strong> discovered
              that the three-body problem in celestial mechanics could not be solved in closed form
              and that solutions could exhibit extraordinarily complex behavior. He recognized
              sensitive dependence on initial conditions more than half a century before the term
              "chaos" was coined.
            </p>
            <p className="mt-3">
              The modern era of chaos theory began in 1963 when meteorologist <strong>Edward Lorenz</strong> found
              that a simple three-equation model of atmospheric convection produced wildly different
              outcomes when initial conditions were rounded from six decimal places to three. His
              landmark paper "Deterministic Nonperiodic Flow" established the butterfly effect and
              opened the floodgates of research into nonlinear dynamics.
            </p>
            <p className="mt-3">
              In the 1970s and 1980s, researchers such as <strong>Mitchell Feigenbaum</strong> discovered
              universal constants governing the period-doubling route to chaos, while
              <strong> Benoit Mandelbrot</strong> developed fractal geometry to describe the
              self-similar structures that arise in chaotic systems. Together, these advances
              transformed our understanding of complexity in nature.
            </p>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "Does the flap of a butterfly's wings in Brazil set off a tornado in Texas?"
            -- Edward Lorenz, 1972
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoublePendulumPage;
