import React from 'react';
import PendulumWaveVisualizer from '../../components/Visualizations/PendulumWave/PendulumWaveVisualizer';

const PendulumWavePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Pendulum Wave Dynamics</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Pendulum waves create one of the most mesmerizing physical demonstrations of wave behavior and phase relationships.
          This visualization shows how a series of pendulums with precisely calculated lengths create beautiful wave patterns
          as they move in and out of phase with each other.
        </p>
        <p>
          The pendulums start in alignment but quickly diverge due to their different periods, creating
          various patterns before eventually returning to their original formation. This cycle repeats indefinitely
          (with some damping for realism), illustrating fundamental principles of oscillation, wave motion, and harmonic resonance.
        </p>
      </div>
      
      <PendulumWaveVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Science Behind Pendulum Waves</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Mathematical Foundation</h3>
            <p>
              The pendulum wave effect is based on precise mathematical relationships between the lengths of the pendulums
              and their periods of oscillation.
            </p>
            
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono">
                Period of a pendulum: T = 2π√(L/g)
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                Where T is the period (seconds), L is the length (meters), and g is gravitational acceleration (9.8 m/s²)
              </p>
            </div>
            
            <p>
              For a pendulum wave, we precisely calculate each pendulum's length so that after a specific time (the cycle time),
              all pendulums will realign exactly as they started. This requires carefully tuning the frequencies to be
              integer multiples of a base frequency.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Wave Patterns and Phases</h3>
            <p>
              As the pendulums swing, they create a variety of fascinating patterns due to their phase relationships:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Alignment</strong> (0% and 100% of cycle) - All pendulums align perfectly</li>
              <li><strong>Traveling Wave</strong> (25% and 75% of cycle) - A wave appears to move across the pendulums</li>
              <li><strong>Standing Wave</strong> (50% of cycle) - Pendulums create alternating patterns</li>
              <li><strong>Complex Patterns</strong> - During transitions, intricate and sometimes chaotic patterns form</li>
            </ul>
            <p className="mt-3">
              These patterns are a visual representation of the mathematical concept of phase interference,
              where waves of different frequencies interact to create complex but predictable patterns.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Applications and Related Phenomena</h3>
            <p>
              The principles demonstrated by pendulum waves appear throughout science and nature:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Sound and Music:</strong> Beats and harmonic overtones arise from similar phase relationships</li>
              <li><strong>Quantum Mechanics:</strong> Electron wave functions and probability distributions</li>
              <li><strong>Light:</strong> Interference patterns in optics and diffraction</li>
              <li><strong>Electronics:</strong> Signal processing, modulation, and filtering</li>
              <li><strong>Oceanography:</strong> Wave interactions in water bodies</li>
              <li><strong>Seismology:</strong> Earthquake wave propagation</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Historical Context</h2>
          <p>
            The pendulum wave demonstration has its roots in the early studies of harmonic motion and wave mechanics.
            The pendulum itself was famously studied by Galileo Galilei in the 17th century, who discovered that a pendulum's
            period is independent of its amplitude (for small swings) and depends primarily on its length.
          </p>
          <p className="mt-3">
            Modern pendulum wave demonstrations were popularized by science museums and educational institutions
            in the 20th century as a way to visualize complex wave phenomena in an accessible and captivating manner.
            The Harvard Natural Sciences Lecture Demonstrations created one of the most famous physical pendulum wave
            exhibits that has been widely shared online.
          </p>
          <p className="mt-3">
            Today, pendulum waves continue to be used in physics education to introduce concepts of oscillation, 
            phase, resonance, and wave behavior.
          </p>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The mathematical perfectness of Nature reveals itself in the pendulum wave as a dance of physics, 
            where time and space harmonize in predictable yet mesmerizing patterns."
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendulumWavePage;