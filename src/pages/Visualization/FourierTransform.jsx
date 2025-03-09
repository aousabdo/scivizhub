import React from 'react';
import FourierTransformVisualizer from '../../components/Visualizations/FourierTransform/FourierTransformVisualizer';

const FourierTransformPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Fourier Transform Visualization</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The Fourier Transform is a powerful mathematical technique that decomposes complex signals into a sum of simple
          sine waves. This fundamental concept revolutionized signal processing, data analysis, and countless scientific fields
          by providing a way to analyze signals in the frequency domain rather than just the time domain.
        </p>
        <p>
          This interactive visualization allows you to explore how different signals can be built from sine waves of various
          frequencies, amplitudes, and phases. Watch in real-time as complex waveforms are synthesized and decomposed,
          gaining intuition for one of the most important mathematical tools in modern science and engineering.
        </p>
      </div>
      
      <FourierTransformVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Fourier Transforms</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Mathematical Foundation</h3>
            <p>
              The Fourier Transform is based on the principle that any periodic function can be expressed as an infinite sum
              of sine and cosine functions with different frequencies:
            </p>
            
            <div className="my-4 p-4 bg-white rounded-lg border border-gray-200 text-center">
              <p className="font-mono">
                f(t) = a₀/2 + Σ [aₙcos(nωt) + bₙsin(nωt)]
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Where aₙ and bₙ are the amplitudes of the cosine and sine components for each frequency n
              </p>
            </div>
            
            <p>
              This fundamental insight, first developed by Joseph Fourier in the early 19th century, allows us to move 
              between the time domain (where signals are represented as amplitude versus time) and the frequency domain 
              (where signals are represented as amplitude versus frequency).
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Time and Frequency Domains</h3>
            <p>
              The Fourier Transform reveals information about a signal that might not be obvious in the time domain:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Time Domain:</strong> Shows how a signal's amplitude changes over time</li>
              <li><strong>Frequency Domain:</strong> Shows which frequencies are present in the signal and their relative strengths</li>
              <li><strong>Phase Information:</strong> Shows the phase relationships between different frequency components</li>
            </ul>
            <p className="mt-3">
              This dual perspective is incredibly powerful, making certain problems much easier to solve in one domain than the other.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Real-World Applications</h3>
            <p>
              Fourier transforms are everywhere in modern technology and science:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Audio Processing:</strong> Equalizers, noise reduction, voice recognition</li>
              <li><strong>Image Processing:</strong> JPEG compression, feature extraction, filtering</li>
              <li><strong>Medical Imaging:</strong> MRI, CT scans, ultrasound processing</li>
              <li><strong>Communications:</strong> Modulation, signal filtering, spectrum analysis</li>
              <li><strong>Quantum Mechanics:</strong> Analyzing wave functions and energy states</li>
              <li><strong>Optics:</strong> Analyzing light patterns, telescope imaging, holography</li>
              <li><strong>Electrical Engineering:</strong> Circuit analysis, filter design</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">Types of Fourier Transforms</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-3 border-collapse">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Used For</th>
                    <th className="p-2 border">Domain</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Fourier Series</td>
                    <td className="p-2 border">Periodic, continuous signals</td>
                    <td className="p-2 border">Continuous, discrete frequencies</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Continuous Fourier Transform (CFT)</td>
                    <td className="p-2 border">Non-periodic, continuous signals</td>
                    <td className="p-2 border">Continuous time and frequency</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Discrete Fourier Transform (DFT)</td>
                    <td className="p-2 border">Discrete sampled signals</td>
                    <td className="p-2 border">Discrete time and frequency</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Fast Fourier Transform (FFT)</td>
                    <td className="p-2 border">Efficient computation of the DFT</td>
                    <td className="p-2 border">Discrete time and frequency</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              This visualization primarily demonstrates Fourier Series concepts, showing how periodic signals can be 
              constructed from harmonic components.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Key Insights from Fourier Analysis</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Parseval's Theorem:</strong> The energy of a signal is the same whether calculated in the time domain or the frequency domain
            </li>
            <li>
              <strong>Convolution Theorem:</strong> Convolution in the time domain equals multiplication in the frequency domain, making many signal processing tasks simpler
            </li>
            <li>
              <strong>Uncertainty Principle:</strong> Similar to quantum mechanics, there's a fundamental trade-off between time and frequency resolution
            </li>
            <li>
              <strong>Gibbs Phenomenon:</strong> When approximating a discontinuous function with Fourier series, oscillations occur near the discontinuities
            </li>
            <li>
              <strong>Spectral Leakage:</strong> Analyzing finite samples of signals can cause frequency "leakage" in the spectrum
            </li>
          </ul>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "Fourier's theorem is not only one of the most beautiful results of modern analysis, but it may be said to furnish an indispensable instrument in the treatment of nearly every recondite question in modern physics."
            <br />— Lord Kelvin
          </p>
        </div>
      </div>
    </div>
  );
};

export default FourierTransformPage;