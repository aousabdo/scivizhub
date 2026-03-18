import React from 'react';
import OrbitalMechanicsVisualizer from '../../components/Visualizations/OrbitalMechanics/OrbitalMechanicsVisualizer';

const OrbitalMechanicsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Orbital Mechanics</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Orbital mechanics is the branch of physics that governs the motion of objects under the
          influence of gravity. From the graceful ellipses traced by planets around stars to the
          chaotic dance of three-body systems, gravitational dynamics shapes the structure of the
          universe at every scale. This simulator lets you explore these phenomena firsthand using
          Newtonian gravity and accurate numerical integration.
        </p>
        <p>
          Choose from preset configurations -- a simplified solar system, a binary star with a
          circumbinary planet, the famous figure-8 three-body solution, orbits with varying
          eccentricities, or a transfer orbit scenario. You can also build your own systems by
          clicking to place bodies and dragging to launch them with an initial velocity. Toggle
          velocity and force vectors to see the physics at work, and watch the stats panel to verify
          conservation laws in real time.
        </p>
      </div>

      <OrbitalMechanicsVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Orbital Mechanics</h2>

        <div className="mt-8 grid gap-8">
          {/* Kepler's Laws */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Kepler&apos;s Laws of Planetary Motion</h3>
            <p>
              In the early 17th century, Johannes Kepler distilled decades of precise astronomical
              observations by Tycho Brahe into three elegant laws that describe how planets move
              around the Sun. These empirical laws were later shown by Newton to be direct
              consequences of the inverse-square law of gravity.
            </p>
            <ul className="list-disc pl-5 space-y-3 mt-3">
              <li>
                <strong>First Law (Law of Ellipses):</strong> Every planet moves in an ellipse with
                the Sun at one focus. A circle is the special case where both foci coincide. In the
                simulator, observe how the &ldquo;Eccentric Orbits&rdquo; preset shows orbits
                ranging from nearly circular to highly elongated.
              </li>
              <li>
                <strong>Second Law (Equal Areas):</strong> A line drawn from the Sun to a planet
                sweeps out equal areas in equal time intervals. This means planets move faster near
                perihelion (closest approach) and slower near aphelion (farthest point). Enable
                trails and watch how the spacing between trail points changes along an eccentric orbit.
              </li>
              <li>
                <strong>Third Law (Harmonic Law):</strong> The square of a planet&apos;s orbital
                period is proportional to the cube of its semi-major axis: T&sup2; &prop; a&sup3;.
                In the Solar System preset, notice how outer planets take much longer to complete
                their orbits. The period estimates displayed in the body list let you verify this
                relationship quantitatively.
              </li>
            </ul>
          </div>

          {/* Newton's Gravitation */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Newton&apos;s Law of Universal Gravitation</h3>
            <p>
              Isaac Newton unified terrestrial and celestial mechanics with a single law: every
              object with mass attracts every other object with a force proportional to the product
              of their masses and inversely proportional to the square of the distance between them.
            </p>

            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono text-sm">
                F = G &middot; m<sub>1</sub> &middot; m<sub>2</sub> / r&sup2;
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                G = 6.674 &times; 10<sup>-11</sup> N m&sup2; kg<sup>-2</sup> is the gravitational
                constant, m<sub>1</sub> and m<sub>2</sub> are the masses, and r is the distance
                between their centers of mass.
              </p>
            </div>

            <p>
              This inverse-square law gives rise to conic-section orbits (circles, ellipses,
              parabolas, and hyperbolas). The simulator uses a softening parameter to prevent
              numerical singularities at very close approach, mimicking the finite size of real
              celestial objects.
            </p>

            <p className="mt-3">
              Enable the <strong>force vectors</strong> (red arrows) to see the gravitational pull on
              each body. Notice how the force always points toward the attracting mass and grows
              stronger as bodies approach each other.
            </p>
          </div>

          {/* Conservation Laws */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Conservation Laws</h3>
            <p>
              Fundamental conservation principles govern isolated gravitational systems. The stats
              panel tracks these quantities so you can verify them as the simulation runs.
            </p>
            <ul className="list-disc pl-5 space-y-3 mt-3">
              <li>
                <strong>Conservation of Energy:</strong> The total mechanical energy (kinetic +
                gravitational potential) remains constant. Kinetic energy (red) and potential energy
                (blue) trade back and forth as bodies speed up near close approach and slow down at
                distance, but their sum (green) stays fixed. The Velocity Verlet integrator is
                symplectic, meaning it preserves this energy balance far better than naive Euler methods.
              </li>
              <li>
                <strong>Conservation of Angular Momentum:</strong> The total angular momentum
                L = &Sigma; m(x &middot; v<sub>y</sub> &minus; y &middot; v<sub>x</sub>) about the
                origin is conserved. This is a consequence of the central nature of gravity -- the
                force between two bodies lies along the line connecting them, producing no torque.
                Angular momentum conservation is why orbits remain planar and why spinning systems
                resist changes to their rotation axis.
              </li>
              <li>
                <strong>Conservation of Linear Momentum:</strong> The total momentum of the system
                is conserved. If the center of mass starts at rest, it remains at rest regardless
                of how the bodies interact. This is why the &ldquo;Binary Star&rdquo; preset shows
                both stars orbiting a stationary center point.
              </li>
            </ul>
          </div>

          {/* Applications */}
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">Applications</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Space Missions &amp; Orbital Transfers:</strong> Getting a spacecraft from
                one orbit to another requires precise velocity changes (delta-v). The
                &ldquo;Transfer Orbit&rdquo; preset demonstrates a Hohmann-like transfer, where a
                spacecraft is launched from an inner planet with extra velocity so that its apoapsis
                reaches the outer planet&apos;s orbit. Real missions to Mars, Jupiter, and beyond
                rely on these principles.
              </li>
              <li>
                <strong>Gravitational Slingshots:</strong> A spacecraft passing near a massive body
                can gain or lose speed through a gravitational assist. NASA&apos;s Voyager missions
                used slingshots around Jupiter and Saturn to reach the outer solar system. Try
                placing a small body near a massive one with a tangential velocity to see this effect.
              </li>
              <li>
                <strong>Exoplanet Detection:</strong> The radial velocity method detects exoplanets
                by measuring the tiny wobble a planet induces in its host star. In the simulator,
                watch how even the massive Sun shifts slightly due to Jupiter&apos;s gravitational
                pull (visible when the Sun is not fixed). The transit method detects periodic dips
                in starlight as a planet crosses in front of its star.
              </li>
              <li>
                <strong>Satellite Orbits &amp; GPS:</strong> Artificial satellites in low Earth
                orbit, geostationary orbit, and GPS constellations all follow Keplerian trajectories
                modified by perturbations from Earth&apos;s oblateness, atmospheric drag, and
                lunar/solar gravity.
              </li>
            </ul>
          </div>

          {/* Historical Context */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4">Historical Context</h3>
            <p>
              The story of orbital mechanics spans millennia of human curiosity about the heavens:
            </p>
            <ul className="list-disc pl-5 space-y-3 mt-3">
              <li>
                <strong>Claudius Ptolemy (~150 AD):</strong> Codified the geocentric model with
                epicycles -- circles upon circles -- to explain planetary motion. Despite being
                fundamentally wrong, the Ptolemaic system predicted planetary positions with
                reasonable accuracy for over a thousand years.
              </li>
              <li>
                <strong>Nicolaus Copernicus (1543):</strong> Proposed the heliocentric model,
                placing the Sun at the center. This simplified the description of planetary motion
                but still used circular orbits and required epicycles for accuracy.
              </li>
              <li>
                <strong>Johannes Kepler (1609-1619):</strong> Using Tycho Brahe&apos;s meticulous
                observations, Kepler discovered that orbits are ellipses, not circles, and
                formulated his three laws. This was a triumph of empirical science over geometric
                prejudice.
              </li>
              <li>
                <strong>Isaac Newton (1687):</strong> In the <em>Principia Mathematica</em>, Newton
                derived Kepler&apos;s laws from first principles using his law of universal
                gravitation and the calculus he co-invented. He showed that the same force causing
                an apple to fall also keeps the Moon in orbit -- unifying terrestrial and celestial
                mechanics for the first time.
              </li>
              <li>
                <strong>Henri Poincar&eacute; (1890s):</strong> Showed that the three-body problem
                has no general closed-form solution and can exhibit sensitive dependence on initial
                conditions -- laying the groundwork for chaos theory. The &ldquo;Figure-8&rdquo;
                preset demonstrates one of the rare periodic solutions to this problem.
              </li>
              <li>
                <strong>Modern Era:</strong> Today, orbital mechanics underpins everything from GPS
                navigation to interplanetary exploration. Numerical N-body simulations running on
                supercomputers model galaxy formation, dark matter dynamics, and the long-term
                stability of planetary systems.
              </li>
            </ul>
          </div>

          {/* Numerical Methods */}
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
            <h3 className="text-xl font-bold text-indigo-800 mb-3">Numerical Integration: Velocity Verlet</h3>
            <p>
              This simulator uses the Velocity Verlet algorithm, a second-order symplectic
              integrator widely used in celestial mechanics and molecular dynamics. Unlike simple
              Euler integration, which systematically gains or loses energy over time, the Verlet
              method is time-reversible and preserves the geometric structure of Hamiltonian systems.
            </p>

            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono text-sm">
                x(t + &Delta;t) = x(t) + v(t)&middot;&Delta;t + &frac12;a(t)&middot;&Delta;t&sup2;
              </p>
              <p className="text-center font-mono text-sm mt-1">
                v(t + &Delta;t) = v(t) + &frac12;[a(t) + a(t + &Delta;t)]&middot;&Delta;t
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                Positions are updated first using current accelerations, then forces are recomputed
                at the new positions, and velocities are updated using the average of old and new
                accelerations.
              </p>
            </div>

            <p>
              The simulation runs multiple sub-steps per animation frame for stability. For N
              bodies, computing all pairwise forces requires O(N&sup2;) operations. Large-scale
              astrophysical simulations use tree-based methods (Barnes-Hut, O(N log N)) or fast
              multipole methods (O(N)) for efficiency, but the direct approach works well for the
              handful of bodies shown here.
            </p>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            &ldquo;Truth is ever to be found in simplicity, and not in the multiplicity and
            confusion of things.&rdquo; -- Isaac Newton
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrbitalMechanicsPage;
