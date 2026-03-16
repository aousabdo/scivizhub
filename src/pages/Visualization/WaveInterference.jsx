import React from 'react';
import WaveInterferenceVisualizer from '../../components/Visualizations/WaveInterference/WaveInterferenceVisualizer';

const WaveInterferencePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Wave Interference Simulator</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Wave interference is one of the most fundamental phenomena in physics, occurring whenever two or more
          waves overlap in space. This interactive simulator lets you explore how waves from multiple sources
          combine to create stunning interference patterns — from the iconic double-slit experiment to complex
          multi-source configurations.
        </p>
        <p>
          Place wave sources on the ripple tank, adjust their frequency and wavelength, and watch as
          constructive and destructive interference paint beautiful patterns across the simulation. These same
          principles govern everything from sound waves to light to quantum mechanics.
        </p>
      </div>

      <WaveInterferenceVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">The Science of Wave Interference</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">The Superposition Principle</h3>
            <p>
              When two or more waves meet at a point, the resulting displacement is the sum of the individual
              displacements. This is the principle of superposition — waves don't bounce off each other, they
              pass through and combine linearly.
            </p>
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-mono">
                y_total(x, t) = y₁(x, t) + y₂(x, t) + ... + yₙ(x, t)
              </p>
              <p className="mt-2 text-sm text-center text-gray-600">
                The total wave amplitude at any point is the algebraic sum of all individual wave amplitudes.
              </p>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Constructive & Destructive Interference</h3>
            <p>
              When waves meet in phase (crests aligning with crests), their amplitudes add together, producing
              brighter, louder, or stronger signals — this is <strong>constructive interference</strong>. When
              waves meet out of phase (crests aligning with troughs), they cancel each other out —
              this is <strong>destructive interference</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Constructive:</strong> Path difference = nλ (integer multiples of wavelength)</li>
              <li><strong>Destructive:</strong> Path difference = (n + ½)λ (half-integer multiples)</li>
              <li><strong>Partial:</strong> Most points show intermediate interference between the two extremes</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">The Double-Slit Experiment</h3>
            <p>
              Thomas Young's double-slit experiment (1801) was one of the most important experiments in physics.
              By passing light through two narrow slits, Young demonstrated that light produces an interference
              pattern — proving its wave nature. This experiment has since been repeated with electrons, atoms,
              and even large molecules, revealing the wave-particle duality at the heart of quantum mechanics.
            </p>
            <p className="mt-3">
              The pattern of bright and dark fringes on a screen behind the slits can be predicted precisely
              using wave theory, with fringe spacing proportional to wavelength and inversely proportional to slit separation.
            </p>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3">Real-World Applications</h3>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Noise-Canceling Headphones:</strong> Use destructive interference to eliminate unwanted sound</li>
              <li><strong>Radio Antennas:</strong> Phased arrays use constructive interference to focus signals</li>
              <li><strong>Thin Film Iridescence:</strong> Oil slicks and soap bubbles create colors through interference</li>
              <li><strong>Holography:</strong> Records interference patterns to reconstruct 3D images</li>
              <li><strong>Gravitational Wave Detection:</strong> LIGO uses laser interferometry to detect spacetime ripples</li>
              <li><strong>X-ray Crystallography:</strong> Diffraction patterns reveal molecular structures</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Historical Context</h2>
          <p>
            The wave theory of light was championed by Christiaan Huygens in the 17th century, but it was
            Thomas Young who provided the definitive experimental proof with his double-slit experiment in 1801.
            Augustin-Jean Fresnel later developed the mathematical framework that fully explained diffraction
            and interference, finally overturning Newton's particle theory of light.
          </p>
          <p className="mt-3">
            In the 20th century, the double-slit experiment took on even deeper significance when quantum
            mechanics revealed that individual particles could interfere with themselves — a phenomenon that
            Richard Feynman called "the only mystery" of quantum mechanics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaveInterferencePage;
