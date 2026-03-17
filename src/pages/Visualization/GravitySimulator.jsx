import React from 'react';
import GravitySimulatorVisualizer from '../../components/Visualizations/GravitySimulator/GravitySimulatorVisualizer';

const GravitySimulatorPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Gravity Simulator</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Gravity is the fundamental force that shapes the cosmos -- from the orbits of planets around
          stars to the spiraling dance of binary star systems and the chaotic trajectories of three-body
          encounters. This N-body gravity simulator lets you witness these gravitational interactions
          firsthand, watching how bodies of different masses attract and orbit one another according to
          Newton's law of universal gravitation.
        </p>
        <p>
          Explore preset configurations like a simplified solar system, a binary star with a circumbinary
          planet, or the famous figure-eight three-body solution. You can also create your own scenarios
          by clicking to place bodies and dragging to launch them with an initial velocity. Watch the
          orbital trails trace out ellipses, spirals, and chaotic paths as gravitational interactions
          unfold in real time.
        </p>
      </div>

      <GravitySimulatorVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Science of Gravitational Dynamics</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Newton's Law of Universal Gravitation</h3>
            <p>
              Every object with mass attracts every other object with a force proportional to the
              product of their masses and inversely proportional to the square of the distance
              between them. This elegant inverse-square law governs everything from falling apples
              to galaxy formation.
            </p>

            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono text-sm">
                F = G &middot; m<sub>1</sub> &middot; m<sub>2</sub> / r&sup2;
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                where G is the gravitational constant (6.674 &times; 10<sup>-11</sup> N m&sup2; kg<sup>-2</sup>),
                m<sub>1</sub> and m<sub>2</sub> are the masses, and r is the distance between their centers.
              </p>
            </div>

            <p>
              This simulation computes the gravitational force between every pair of bodies at each
              time step and updates positions and velocities accordingly. A softening parameter
              prevents numerical singularities when two bodies pass very close together, mimicking
              the finite size of real celestial objects.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Kepler's Laws of Planetary Motion</h3>
            <p>
              In the special case of two bodies (one much more massive than the other), orbits
              follow Kepler's three laws, which emerge naturally from Newton's gravitational law:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>First Law (Ellipses):</strong> Planets orbit in ellipses with the star at
                one focus. Circular orbits are a special case where both foci coincide. In this
                simulator, you can observe nearly elliptical orbits when a small body orbits a
                massive central star.
              </li>
              <li>
                <strong>Second Law (Equal Areas):</strong> A line segment joining a planet to its
                star sweeps out equal areas in equal time intervals. This means planets move faster
                when closer to the star (perihelion) and slower when farther away (aphelion). Watch
                the trail spacing to see this effect.
              </li>
              <li>
                <strong>Third Law (Harmonic Law):</strong> The square of the orbital period is
                proportional to the cube of the semi-major axis: T&sup2; &prop; a&sup3;. Outer
                planets take longer to complete their orbits, which you can verify by watching
                the Solar System preset.
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Orbital Mechanics & the N-Body Problem</h3>
            <p>
              While two-body orbits are perfectly predictable, adding even one more body makes
              the system vastly more complex. The three-body problem, famously studied by
              Poincare, has no general closed-form solution and can produce chaotic trajectories.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Orbital Elements:</strong> An orbit in the two-body problem is fully
                described by six parameters: semi-major axis, eccentricity, inclination,
                longitude of ascending node, argument of periapsis, and true anomaly. In our
                2D simulation, only the first two are relevant.
              </li>
              <li>
                <strong>Escape Velocity:</strong> A body must reach v<sub>esc</sub> = &radic;(2GM/r)
                to escape the gravitational pull of a massive body. Try launching a body with
                a high initial velocity to see it fly away on a hyperbolic trajectory.
              </li>
              <li>
                <strong>Three-Body Choreographies:</strong> Special solutions to the three-body
                problem exist where all bodies follow the same closed curve. The Figure Eight
                preset demonstrates one such remarkable solution, discovered by Moore in 1993
                and proven by Chenciner and Montgomery in 2000.
              </li>
              <li>
                <strong>Gravitational Slingshot:</strong> A smaller body passing near a massive
                one can gain speed through a gravitational assist, a technique used by spacecraft
                to reach the outer solar system.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">Conservation Laws</h3>
            <p>
              Fundamental conservation laws constrain the behavior of gravitational systems and
              serve as powerful checks on the accuracy of numerical simulations:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Conservation of Energy:</strong> The total energy (kinetic + potential)
                remains constant in an isolated system. The energy display shows KE, PE, and their
                sum. In a well-behaved simulation, the total energy should remain approximately
                constant over time. The Velocity Verlet integrator used here is symplectic,
                meaning it conserves energy much better than simpler methods like Euler integration.
              </li>
              <li>
                <strong>Conservation of Momentum:</strong> The total linear momentum of the system
                is conserved. If the center of mass starts at rest, it will remain at rest regardless
                of how the bodies interact.
              </li>
              <li>
                <strong>Conservation of Angular Momentum:</strong> The total angular momentum about
                any point is conserved. This is why orbits remain in a plane and why spinning objects
                (like galaxies) maintain their rotation.
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4">Numerical Methods: Velocity Verlet Integration</h3>
            <p>
              This simulation uses the Velocity Verlet algorithm, a second-order symplectic
              integrator widely used in molecular dynamics and celestial mechanics. Unlike
              simple Euler integration, which accumulates energy errors over time, the Verlet
              method is time-reversible and conserves the structure of Hamiltonian systems.
            </p>

            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono text-sm">
                x(t + &Delta;t) = x(t) + v(t)&Delta;t + &frac12;a(t)&Delta;t&sup2;
              </p>
              <p className="text-center font-mono text-sm mt-1">
                v(t + &Delta;t) = v(t) + &frac12;[a(t) + a(t + &Delta;t)]&Delta;t
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                Positions are updated first using current accelerations, then accelerations are
                recomputed at the new positions, and finally velocities are updated using the
                average of old and new accelerations.
              </p>
            </div>

            <p>
              For an N-body system, computing all pairwise gravitational forces requires
              O(N&sup2;) operations per time step. Real astrophysical simulations with millions
              of bodies use tree-based approximations (Barnes-Hut algorithm, O(N log N)) or
              fast multipole methods (O(N)) to make the computation tractable. Our simulation
              uses the direct O(N&sup2;) approach, which is perfectly adequate for the small
              number of bodies shown here.
            </p>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "If I have seen further, it is by standing on the shoulders of giants."
            -- Isaac Newton, 1675
          </p>
        </div>
      </div>
    </div>
  );
};

export default GravitySimulatorPage;
