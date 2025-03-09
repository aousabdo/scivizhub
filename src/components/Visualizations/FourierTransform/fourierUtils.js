/**
 * Utility functions for Fourier Transform Visualization
 */

// Define preset signals
export const presetSignals = {
    sine: {
      frequency: 1,
      amplitude: 1,
      phase: 0,
      harmonics: 1
    },
    square: {
      frequency: 1,
      amplitude: 1,
      phase: 0,
      harmonics: 15
    },
    sawtooth: {
      frequency: 1,
      amplitude: 1,
      phase: 0,
      harmonics: 15
    },
    triangle: {
      frequency: 1,
      amplitude: 1,
      phase: 0,
      harmonics: 15
    }
  };
  
  /**
   * Generate a signal based on type and parameters
   * @param {string} type - Type of signal (sine, square, sawtooth, triangle)
   * @param {Object} params - Signal parameters
   * @returns {Array} - Array of signal values
   */
  export function generateSignal(type, params = {}) {
    const { frequency = 1, amplitude = 1, phase = 0, samplingRate = 128 } = params;
    const signal = [];
    
    // Create time points
    for (let i = 0; i < samplingRate; i++) {
      const t = i / (samplingRate - 1); // Normalize time to [0, 1]
      let value = 0;
      
      switch (type) {
        case 'sine':
          value = amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
          break;
          
        case 'square':
          value = amplitude * Math.sign(Math.sin(2 * Math.PI * frequency * t + phase));
          break;
          
        case 'sawtooth':
          // Sawtooth formula: 2 * (t / T - Math.floor(t / T + 0.5))
          const periodNormalized = t * frequency;
          value = amplitude * (2 * (periodNormalized - Math.floor(periodNormalized + 0.5)));
          break;
          
        case 'triangle':
          // Triangle formula: 2 * abs(sawtooth) - 1
          const saw = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          value = amplitude * (2 * Math.abs(saw) - 1);
          break;
          
        default:
          value = 0;
      }
      
      signal.push(value);
    }
    
    return signal;
  }
  
  /**
   * Compute Fourier Series for a signal
   * @param {Array} signal - Input signal values
   * @param {number} numHarmonics - Number of harmonics to compute
   * @returns {Object} - Time domain, frequency domain, and harmonic component data
   */
  export function computeFourierSeries(signal, numHarmonics = 5) {
    const N = signal.length;
    const timeData = [];
    const harmonicComponents = [];
    const frequencyData = [];
    
    // Initialize harmonic components
    for (let h = 0; h < numHarmonics; h++) {
      harmonicComponents.push([]);
    }
    
    // Compute DC component (a₀)
    let a0 = 0;
    for (let i = 0; i < N; i++) {
      a0 += signal[i];
    }
    a0 /= N;
    
    // Add DC component to frequency data
    frequencyData.push({
      frequency: 0,
      magnitude: Math.abs(a0),
      phase: 0
    });
    
    // Compute coefficients for each harmonic
    for (let h = 1; h <= numHarmonics; h++) {
      let a = 0; // Cosine coefficient
      let b = 0; // Sine coefficient
      
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1); // Normalize time to [0, 1]
        const angle = 2 * Math.PI * h * t;
        a += signal[i] * Math.cos(angle);
        b += signal[i] * Math.sin(angle);
      }
      
      a = (2 / N) * a;
      b = (2 / N) * b;
      
      // Calculate magnitude and phase
      const magnitude = Math.sqrt(a * a + b * b);
      const phase = Math.atan2(b, a);
      
      // Add to frequency data
      frequencyData.push({
        frequency: h,
        magnitude,
        phase,
        a,
        b
      });
    }
    
    // Generate time domain data and harmonic components
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1); // Normalize time to [0, 1]
      
      timeData.push({
        x: t,
        y: signal[i]
      });
      
      // Compute each harmonic component
      for (let h = 0; h < numHarmonics; h++) {
        const harmonicIndex = h + 1; // 1-based indexing for harmonics
        const frequency = harmonicIndex;
        const { a, b } = frequencyData[harmonicIndex]; // Get coefficients
        
        const angle = 2 * Math.PI * frequency * t;
        const harmonicValue = a * Math.cos(angle) + b * Math.sin(angle);
        
        harmonicComponents[h].push({
          x: t,
          y: harmonicValue
        });
      }
    }
    
    return {
      timeData,
      frequencyData,
      harmonicComponents
    };
  }
  
  /**
   * Compute Discrete Fourier Transform
   * @param {Array} signal - Input signal values
   * @returns {Array} - Complex DFT coefficients
   */
  export function computeFourierTransform(signal) {
    const N = signal.length;
    const result = [];
    
    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        real += signal[n] * Math.cos(angle);
        imag -= signal[n] * Math.sin(angle);
      }
      
      real /= N;
      imag /= N;
      
      const magnitude = Math.sqrt(real * real + imag * imag);
      const phase = Math.atan2(imag, real);
      
      result.push({
        frequency: k,
        real,
        imag,
        magnitude,
        phase
      });
    }
    
    return result;
  }
  
  /**
   * Compute Inverse Fourier Transform
   * @param {Array} dft - DFT coefficients
   * @returns {Array} - Reconstructed signal
   */
  export function computeInverseFourierTransform(dft) {
    const N = dft.length;
    const signal = [];
    
    for (let n = 0; n < N; n++) {
      let value = 0;
      
      for (let k = 0; k < N; k++) {
        const angle = (2 * Math.PI * k * n) / N;
        const { real, imag } = dft[k];
        value += real * Math.cos(angle) - imag * Math.sin(angle);
      }
      
      signal.push(value);
    }
    
    return signal;
  }