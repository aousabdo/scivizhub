import React from 'react';
import LorenzAttractorVisualizer from '../../components/Visualizations/LorenzAttractor/LorenzAttractorVisualizer';

const LorenzAttractorPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Lorenz Attractor</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The Lorenz attractor is one of the most iconic images in chaos theory. Discovered by meteorologist
          Edward Lorenz in 1963 while modeling atmospheric convection, this deceptively simple system of three
          equations produces a mesmerizing, never-repeating butterfly-shaped trajectory that stretches to infinity
          yet remains bounded in space.
        </p>
        <p>
          Adjust the parameters &sigma; (sigma), &rho; (rho), and &beta; (beta) to see how the attractor changes shape.
          Even tiny changes can dramatically alter the system's behavior &mdash; the essence of chaos.
        </p>
      </div>

      <LorenzAttractorVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Mathematics of Chaos</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">The Lorenz System</h3>
            <p>
              The Lorenz system is defined by three coupled ordinary differential equations that model
              a simplified version of atmospheric convection &mdash; the rising of warm air and sinking
              of cool air in a fluid layer heated from below:
            </p>

            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono text-sm">
                dx/dt = &sigma;(y &minus; x)
              </p>
              <p className="text-center font-mono text-sm mt-1">
                dy/dt = x(&rho; &minus; z) &minus; y
              </p>
              <p className="text-center font-mono text-sm mt-1">
                dz/dt = xy &minus; &beta;z
              </p>
              <p className="mt-3 text-sm text-center text-gray-600">
                Here <em>x</em> represents the rate of convective overturning, <em>y</em> represents the horizontal
                temperature variation, and <em>z</em> represents the vertical temperature variation.
              </p>
            </div>

            <p>
              The three parameters control the system's behavior: <strong>&sigma;</strong> (the Prandtl number)
              relates viscosity to thermal conductivity, <strong>&rho;</strong> (the Rayleigh number) measures the
              temperature difference driving convection, and <strong>&beta;</strong> is a geometric factor related
              to the aspect ratio of the convection rolls. With the classic values &sigma; = 10, &rho; = 28,
              and &beta; = 8/3, the system exhibits chaotic behavior.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">The Butterfly Effect</h3>
            <p>
              The Lorenz system is the origin of the famous "butterfly effect" &mdash; the idea that a butterfly
              flapping its wings in Brazil might set off a tornado in Texas. More precisely, it demonstrates
              <strong> sensitive dependence on initial conditions</strong>: two trajectories starting
              infinitesimally close together will diverge exponentially over time.
            </p>
            <p className="mt-3">
              Lorenz discovered this accidentally in 1961 when he restarted a weather simulation using printout
              values rounded to three decimal places instead of the full six-decimal precision stored in memory.
              The resulting forecast diverged wildly from the original, revealing that long-range weather
              prediction is fundamentally limited &mdash; not by our models or measurements, but by the
              intrinsic nature of the atmosphere itself.
            </p>
            <p className="mt-3">
              The rate of divergence is quantified by the system's largest <strong>Lyapunov exponent</strong>,
              which for the classic Lorenz parameters is approximately 0.9056. This means nearby trajectories
              separate by a factor of <em>e</em> roughly every 1.1 time units, making long-term prediction
              impossible despite the system being completely deterministic.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Strange Attractors</h3>
            <p>
              The Lorenz attractor is a <strong>strange attractor</strong> &mdash; a fractal set in phase space
              toward which all nearby trajectories converge, yet on which no two trajectories ever merge. It
              occupies zero volume in three-dimensional space but has a fractal dimension of approximately 2.06,
              meaning it is more than a surface but less than a solid.
            </p>
            <p className="mt-3">
              The butterfly shape arises because the trajectory spirals around one of two unstable fixed points
              (located at the centers of the two "wings"), then unpredictably switches to the other. The number
              of loops around each wing before switching is sensitive to initial conditions, creating the
              system's characteristic unpredictability.
            </p>
            <p className="mt-3">
              Despite this unpredictability in detail, the attractor's overall shape is remarkably stable. No
              matter where you start the system (except at exactly the unstable fixed points), the trajectory
              will settle onto this same butterfly structure. This is the paradox of chaos: the individual
              trajectories are unpredictable, but the statistical properties and geometric structure of the
              attractor are completely determined.
            </p>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">History and Discovery</h3>
            <p>
              In the early 1960s, <strong>Edward Norton Lorenz</strong>, a mathematician and meteorologist at MIT,
              was using a simple computer model to study weather patterns. His model consisted of twelve
              differential equations representing atmospheric dynamics. While investigating the behavior of a
              simplified three-equation subset, he made his serendipitous discovery of deterministic chaos.
            </p>
            <p className="mt-3">
              Lorenz published his findings in the 1963 paper <em>"Deterministic Nonperiodic Flow"</em> in the
              Journal of the Atmospheric Sciences. The paper went largely unnoticed by the physics and mathematics
              communities for over a decade, partly because it appeared in a meteorology journal. It was not until
              the mid-1970s, when scientists like <strong>James Yorke</strong> and <strong>Robert May</strong>
              popularized the study of nonlinear dynamics, that Lorenz's work gained the recognition it deserved.
            </p>
            <p className="mt-3">
              The term "butterfly effect" itself came from Lorenz's 1972 talk at the American Association for
              the Advancement of Science, titled <em>"Does the Flap of a Butterfly's Wings in Brazil Set Off
              a Tornado in Texas?"</em> The evocative name, combined with the visually striking shape of the
              attractor, helped make chaos theory one of the most widely known scientific concepts of the
              20th century.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4">Real-World Applications</h3>
            <p>
              The principles revealed by the Lorenz system extend far beyond meteorology, influencing fields
              across science and engineering:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Weather and Climate Science:</strong> Lorenz's work established fundamental limits
                on weather predictability, leading to the development of ensemble forecasting &mdash; running
                many simulations with slightly different initial conditions to estimate forecast uncertainty.
                Modern weather centers run dozens of ensemble members for each forecast cycle.
              </li>
              <li>
                <strong>Fluid Dynamics and Turbulence:</strong> The Lorenz equations were derived from a
                simplified model of Rayleigh&ndash;B&eacute;nard convection. The transition from steady
                convection to chaotic flow as the Rayleigh number (&rho;) increases mirrors the onset
                of turbulence in real fluid systems, from ocean currents to stellar interiors.
              </li>
              <li>
                <strong>Secure Communications:</strong> Chaotic systems can be synchronized, enabling
                chaos-based encryption schemes where a message is masked by a chaotic signal and recovered
                only by a synchronized receiver. This approach has been demonstrated in optical fiber
                communication systems.
              </li>
              <li>
                <strong>Laser Physics:</strong> Single-mode lasers under certain conditions produce intensity
                fluctuations governed by equations mathematically equivalent to the Lorenz system, known as
                the Lorenz&ndash;Haken model. Understanding this chaos helps in designing stable laser systems.
              </li>
              <li>
                <strong>Chemical Kinetics:</strong> The Belousov&ndash;Zhabotinsky reaction and other
                oscillating chemical reactions can exhibit chaotic dynamics analogous to the Lorenz system,
                with concentrations of reactants playing the role of the state variables x, y, and z.
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The present determines the future, but the approximate present does not approximately
            determine the future." &mdash; Edward Lorenz
          </p>
        </div>
      </div>
    </div>
  );
};

export default LorenzAttractorPage;
