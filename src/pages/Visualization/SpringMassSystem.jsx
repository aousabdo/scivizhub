import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import SpringMassSystemVisualizer from '../../components/Visualizations/SpringMassSystem/SpringMassSystemVisualizer';

const SpringMassSystemPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Spring-Mass System</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Coupled oscillators are among the most important systems in all of physics. From atoms
          vibrating in a crystal lattice to the suspension of a car, the spring-mass model captures
          the essential behavior of systems that oscillate around equilibrium. When multiple masses
          are linked by springs, energy flows back and forth between them in patterns called
          normal modes -- the fundamental building blocks of all vibrations.
        </p>
        <p>
          This interactive simulation lets you build a chain of up to five masses connected by
          springs anchored to a wall. Click and drag any mass to displace it, then release to
          watch the system oscillate. Explore how spring stiffness, mass, and damping affect the
          motion, and discover the beautiful normal modes where every mass oscillates at the same
          frequency.
        </p>
      </div>

      <SpringMassSystemVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Physics of Coupled Oscillators</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">Hooke's Law & Simple Harmonic Motion</h3>
            <p>
              A single mass on a spring obeys Hooke's law: the restoring force is proportional
              to displacement. This produces simple harmonic motion (SHM), the most fundamental
              type of periodic motion in nature.
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"F = -kx \\quad \\Rightarrow \\quad m\\frac{d^2x}{dt^2} = -kx"}</BlockMath>
              <BlockMath>{"x(t) = A\\cos(\\omega t + \\phi) \\quad \\text{where} \\quad \\omega = \\sqrt{k/m}"}</BlockMath>
              <p className="mt-2 text-sm text-center text-gray-600">
                The angular frequency <InlineMath>{"\\omega"}</InlineMath> depends only on the spring constant <InlineMath>{"k"}</InlineMath> and the mass <InlineMath>{"m"}</InlineMath>,
                not on the amplitude. This is the hallmark of a linear oscillator.
              </p>
            </div>
            <p>
              The period <InlineMath>{"T = 2\\pi/\\omega = 2\\pi\\sqrt{m/k}"}</InlineMath> tells us that stiffer springs oscillate
              faster while heavier masses oscillate slower. Try adjusting the sliders to verify this!
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">Coupled Oscillators & Normal Modes</h3>
            <p>
              When two or more masses are connected by springs, their motions become coupled:
              displacing one mass exerts forces on its neighbors. The resulting motion can look
              complicated, but it can always be decomposed into a sum of <strong>normal modes</strong> --
              special patterns where every mass oscillates at the same frequency.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Mode 1 (lowest frequency):</strong> All masses move together in the same
                direction, like a group swaying in unison. This is the fundamental mode.
              </li>
              <li>
                <strong>Mode 2:</strong> Adjacent masses move in opposite directions, creating a
                standing-wave-like pattern with a node in the middle.
              </li>
              <li>
                <strong>Higher modes:</strong> Each successive mode has one more node, with the
                highest mode having all adjacent masses perfectly out of phase.
              </li>
            </ul>
            <p className="mt-3">
              For N coupled masses, there are exactly N normal modes with N distinct frequencies.
              Any possible motion of the system can be written as a superposition of these modes.
              Try the "Normal Mode 1" and "Normal Mode 2" presets to see them in action.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Energy Conservation</h3>
            <p>
              In an undamped spring-mass system, energy is continuously exchanged between two forms
              but the total remains constant:
            </p>
            <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <BlockMath>{"E_{\\text{total}} = KE + PE = \\tfrac{1}{2}mv^2 + \\tfrac{1}{2}kx^2 = \\text{constant}"}</BlockMath>
              <p className="mt-2 text-sm text-center text-gray-600">
                Kinetic energy is maximum at equilibrium (maximum velocity); potential energy
                is maximum at maximum displacement (zero velocity).
              </p>
            </div>
            <p>
              Watch the energy bar in the simulation: as each mass passes through equilibrium,
              energy shifts from potential (blue) to kinetic (red). With damping set to zero,
              the total energy remains perfectly constant, demonstrating conservation of energy.
              Increase damping to see how friction gradually converts mechanical energy into heat.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/30 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">Damping & Resonance</h3>
            <p>
              Real oscillators always experience some form of energy dissipation. The damping
              force, proportional to velocity (<InlineMath>{"F_{\\text{damp}} = -bv"}</InlineMath>), causes oscillations
              to decay exponentially over time. The behavior depends on the damping ratio:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Underdamped:</strong> The system oscillates with gradually decreasing
                amplitude. Most musical instruments and mechanical systems operate in this regime.
              </li>
              <li>
                <strong>Critically damped:</strong> The system returns to equilibrium as quickly
                as possible without overshooting. Door closers are designed for this.
              </li>
              <li>
                <strong>Overdamped:</strong> The system returns to equilibrium slowly without
                oscillating, like pushing through thick honey.
              </li>
            </ul>
            <p className="mt-3">
              When a periodic driving force matches a system's natural frequency, resonance occurs
              and the amplitude grows dramatically. This is why soldiers break step on bridges
              and why opera singers can shatter glass.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600">
            <h3 className="text-xl font-bold mb-4">Real-World Applications</h3>
            <p>
              The spring-mass model is one of the most widely applied concepts in science and
              engineering:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Vehicle Suspension:</strong> Cars use spring-damper systems to absorb
                road bumps. Engineers carefully tune the spring constant and damping to balance
                comfort and handling -- a direct application of coupled oscillator theory.
              </li>
              <li>
                <strong>Molecular Vibrations:</strong> Atoms in molecules oscillate about their
                equilibrium bond lengths. Infrared spectroscopy detects these vibrations to
                identify chemical compounds, treating bonds as tiny springs between atomic masses.
              </li>
              <li>
                <strong>Seismic Engineering:</strong> Buildings sway during earthquakes like
                coupled spring-mass systems. Engineers design tuned mass dampers -- massive
                counterweights on springs -- to suppress dangerous resonant oscillations in
                skyscrapers.
              </li>
              <li>
                <strong>Musical Instruments:</strong> Vibrating strings, drumheads, and air columns
                all behave as coupled oscillator systems. The normal modes of these systems
                produce the harmonic overtones that give each instrument its distinctive timbre.
              </li>
              <li>
                <strong>Phonons in Solids:</strong> The vibrational normal modes of a crystal
                lattice are quantized as phonons. These quantum spring-mass oscillations carry
                heat and sound through materials and are central to understanding thermal
                conductivity, superconductivity, and specific heat.
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The career of a young theoretical physicist consists of treating the harmonic
            oscillator in ever-increasing levels of abstraction."
            -- Sidney Coleman
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpringMassSystemPage;
