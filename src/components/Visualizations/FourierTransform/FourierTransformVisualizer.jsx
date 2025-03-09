import React, { useState, useEffect, useRef } from 'react';
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { generateSignal, presetSignals, computeFourierSeries, computeFourierTransform } from './fourierUtils';

const FourierTransformVisualizer = () => {
  // Signal parameters
  const [signalType, setSignalType] = useState('sine');
  const [customSignal, setCustomSignal] = useState(null);
  const [frequency, setFrequency] = useState(1);
  const [amplitude, setAmplitude] = useState(1);
  const [phase, setPhase] = useState(0);
  const [harmonics, setHarmonics] = useState(5);
  
  // Visualization state
  const [timeData, setTimeData] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);
  const [harmonicComponents, setHarmonicComponents] = useState([]);
  const [showHarmonics, setShowHarmonics] = useState(true);
  const [showReconstructed, setShowReconstructed] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [samplingRate, setSamplingRate] = useState(128);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  
  // Canvas refs for drawing
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const isDrawingRef = useRef(false);
  const customSignalPointsRef = useRef([]);
  
  // Generate signal data on parameter changes
  useEffect(() => {
    updateSignalData();
  }, [signalType, frequency, amplitude, phase, harmonics, customSignal, samplingRate]);
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Initialize drawing canvas
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      context.strokeStyle = '#3B82F6';
      context.lineWidth = 2;
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw x-axis
      context.beginPath();
      context.moveTo(0, canvas.height / 2);
      context.lineTo(canvas.width, canvas.height / 2);
      context.strokeStyle = '#CBD5E1';
      context.stroke();
    }
  }, []);
  
  // Generate and update signal data
  const updateSignalData = () => {
    let signalData;
    
    if (signalType === 'custom' && customSignal) {
      signalData = customSignal;
    } else {
      signalData = generateSignal(signalType, {
        frequency, 
        amplitude, 
        phase, 
        samplingRate
      });
    }
    
    // Compute Fourier coefficients
    const { 
      timeData, 
      frequencyData, 
      harmonicComponents 
    } = computeFourierSeries(signalData, harmonics);
    
    setTimeData(timeData);
    setFrequencyData(frequencyData);
    setHarmonicComponents(harmonicComponents);
  };
  
  // Start animation to show harmonic synthesis
  const startAnimation = () => {
    if (isAnimating) {
      stopAnimation();
      return;
    }
    
    setIsAnimating(true);
    setAnimationProgress(0);
    
    let progress = 0;
    const animate = () => {
      progress += 0.5;
      if (progress > 100) {
        setIsAnimating(false);
        return;
      }
      
      setAnimationProgress(progress);
      animationRef.current = setTimeout(animate, animationSpeed);
    };
    
    animate();
  };
  
  // Stop the animation
  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
  };
  
  // Handle drawing on canvas
  const startDrawing = (e) => {
    isDrawingRef.current = true;
    customSignalPointsRef.current = [];
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();
    
    // Start new path
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#3B82F6';
    
    customSignalPointsRef.current.push({
      x: x / canvas.width,  // Normalize to 0-1
      y: 1 - (y / canvas.height) * 2  // Normalize to -1 to 1
    });
  };
  
  const draw = (e) => {
    if (!isDrawingRef.current) return;
    
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    
    customSignalPointsRef.current.push({
      x: x / canvas.width,  // Normalize to 0-1
      y: 1 - (y / canvas.height) * 2  // Normalize to -1 to 1
    });
  };
  
  const endDrawing = () => {
    isDrawingRef.current = false;
    
    if (customSignalPointsRef.current.length > 0) {
      // Process points to create a time-domain signal
      const points = customSignalPointsRef.current;
      
      // Sort by x coordinate to ensure time ordering
      points.sort((a, b) => a.x - b.x);
      
      // Create a signal with evenly spaced points by interpolation
      const numPoints = samplingRate;
      const signal = [];
      
      for (let i = 0; i < numPoints; i++) {
        const x = i / (numPoints - 1);
        
        // Find surrounding points for interpolation
        let lowerIndex = 0;
        while (lowerIndex < points.length - 1 && points[lowerIndex + 1].x < x) {
          lowerIndex++;
        }
        
        let upperIndex = points.length - 1;
        while (upperIndex > 0 && points[upperIndex - 1].x > x) {
          upperIndex--;
        }
        
        // If exactly at a point, use that value
        if (Math.abs(points[lowerIndex].x - x) < 0.001) {
          signal.push(points[lowerIndex].y);
        }
        // If exactly at upper point
        else if (Math.abs(points[upperIndex].x - x) < 0.001) {
          signal.push(points[upperIndex].y);
        }
        // Otherwise interpolate
        else if (lowerIndex < upperIndex) {
          const lowerX = points[lowerIndex].x;
          const upperX = points[upperIndex].x;
          const lowerY = points[lowerIndex].y;
          const upperY = points[upperIndex].y;
          
          // Linear interpolation
          const ratio = (x - lowerX) / (upperX - lowerX);
          const y = lowerY + ratio * (upperY - lowerY);
          signal.push(y);
        } else {
          // If we can't interpolate, use nearest
          const nearest = Math.abs(points[lowerIndex].x - x) < Math.abs(points[upperIndex].x - x) 
            ? points[lowerIndex] 
            : points[upperIndex];
          signal.push(nearest.y);
        }
      }
      
      setCustomSignal(signal);
      setSignalType('custom');
    }
  };
  
  // Get visible harmonics based on animation progress
  const getVisibleHarmonics = () => {
    if (!isAnimating || !showHarmonics) {
      return harmonicComponents;
    }
    
    const visibleCount = Math.ceil((animationProgress / 100) * harmonicComponents.length);
    return harmonicComponents.slice(0, visibleCount);
  };
  
  // Generate the synthesized signal based on visible harmonics
  const getSynthesizedSignal = () => {
    if (!showReconstructed) return [];
    
    const visibleHarmonics = getVisibleHarmonics();
    if (visibleHarmonics.length === 0) return [];
    
    // Combine visible harmonics to create the synthesized signal
    return timeData.map((point, index) => {
      let sum = 0;
      visibleHarmonics.forEach(harmonicData => {
        sum += harmonicData[index].y;
      });
      
      return {
        x: point.x,
        synthetic: sum
      };
    });
  };
  
  // Apply a preset signal
  const applyPreset = (preset) => {
    const presetConfig = presetSignals[preset];
    if (presetConfig) {
      setSignalType(preset);
      setFrequency(presetConfig.frequency || 1);
      setAmplitude(presetConfig.amplitude || 1);
      setPhase(presetConfig.phase || 0);
      setHarmonics(presetConfig.harmonics || 5);
    }
  };
  
  // Get the appropriate description for the current signal
  const getSignalDescription = () => {
    switch (signalType) {
      case 'sine':
        return "A pure sine wave contains only one frequency component.";
      case 'square':
        return "A square wave contains only odd harmonics (1, 3, 5, ...) with amplitudes decreasing as 1/n.";
      case 'sawtooth':
        return "A sawtooth wave contains all harmonics with amplitudes decreasing as 1/n.";
      case 'triangle':
        return "A triangle wave contains only odd harmonics with amplitudes decreasing as 1/n².";
      case 'custom':
        return "Your custom drawn signal decomposed into frequency components.";
      default:
        return "Observe how different signals are composed of sine waves.";
    }
  };
  
  // Format number for display
  const formatNumber = (num) => {
    return Math.abs(num) < 0.01 ? num.toExponential(2) : num.toFixed(2);
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Fourier Series Visualizer</h2>
            <p className="text-gray-600">{getSignalDescription()}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-0">
            <button
              onClick={startAnimation}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isAnimating
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isAnimating ? 'Stop Animation' : 'Animate Synthesis'}
            </button>
            
            <button
              onClick={updateSignalData}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              Update Signal
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signal Type:
              </label>
              <select
                value={signalType}
                onChange={(e) => setSignalType(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="sine">Sine Wave</option>
                <option value="square">Square Wave</option>
                <option value="sawtooth">Sawtooth Wave</option>
                <option value="triangle">Triangle Wave</option>
                <option value="custom">Custom Drawn</option>
              </select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => applyPreset('sine')} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Sine Example
              </button>
              <button 
                onClick={() => applyPreset('square')} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Square Example
              </button>
              <button 
                onClick={() => applyPreset('sawtooth')} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Sawtooth Example
              </button>
              <button 
                onClick={() => applyPreset('triangle')} 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Triangle Example
              </button>
            </div>
            
            {signalType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Draw Custom Signal:
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <canvas
                    ref={drawingCanvasRef}
                    width={400}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    className="w-full bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Click and drag to draw a custom signal</p>
              </div>
            )}
            
            {signalType !== 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency: {frequency} Hz
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={frequency}
                    onChange={(e) => setFrequency(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amplitude: {amplitude}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={amplitude}
                    onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phase: {phase.toFixed(2)} radians
                  </label>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.1"
                    value={phase}
                    onChange={(e) => setPhase(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Harmonics: {harmonics}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={harmonics}
                onChange={(e) => setHarmonics(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">More harmonics provide better approximation of the signal</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed: {animationSpeed}ms
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showHarmonics"
                  checked={showHarmonics}
                  onChange={(e) => setShowHarmonics(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showHarmonics" className="ml-2 block text-sm text-gray-700">
                  Show Harmonic Components
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showReconstructed"
                  checked={showReconstructed}
                  onChange={(e) => setShowReconstructed(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showReconstructed" className="ml-2 block text-sm text-gray-700">
                  Show Reconstructed Signal
                </label>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2">Fourier Series Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Signal Type:</span> {signalType.charAt(0).toUpperCase() + signalType.slice(1)}
                </div>
                <div>
                  <span className="font-semibold">Harmonics Used:</span> {harmonics}
                </div>
                <div>
                  <span className="font-semibold">Fundamental Frequency:</span> {frequency} Hz
                </div>
                <div>
                  <span className="font-semibold">Animation Status:</span>{' '}
                  {isAnimating ? 'Running' : 'Stopped'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Signal in Time Domain */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Signal in Time Domain</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="x" 
                  label={{ value: 'Time', position: 'insideBottom', offset: -5 }} 
                  domain={[0, 1]}
                />
                <YAxis 
                  label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
                  domain={[-2, 2]}
                />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke="#3B82F6" 
                  name="Original Signal" 
                  dot={false} 
                  strokeWidth={2}
                />
                
                {/* Show harmonic components if enabled */}
                {showHarmonics && getVisibleHarmonics().map((harmonic, index) => (
                  <Line
                    key={`harmonic-${index}`}
                    type="monotone"
                    data={harmonic}
                    dataKey="y"
                    stroke={`hsl(${(index * 30) % 360}, 70%, 60%)`}
                    name={`Harmonic ${index + 1}`}
                    dot={false}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    opacity={0.7}
                  />
                ))}
                
                {/* Show synthesized signal if enabled */}
                {showReconstructed && (
                  <Line
                    type="monotone"
                    data={getSynthesizedSignal()}
                    dataKey="synthetic"
                    stroke="#10B981"
                    name="Reconstructed Signal"
                    dot={false}
                    strokeWidth={2}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {isAnimating && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${animationProgress}%` }}
                ></div>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Adding harmonic components: {Math.ceil((animationProgress / 100) * harmonics)} / {harmonics}
              </div>
            </div>
          )}
        </div>
        
        {/* Frequency Spectrum */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Frequency Spectrum</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="frequency" 
                  label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Magnitude', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
                <Bar 
                  dataKey="magnitude" 
                  name="Magnitude" 
                  fill="#3B82F6" 
                />
                <Line 
                  type="monotone" 
                  dataKey="phase" 
                  name="Phase" 
                  stroke="#EF4444" 
                  yAxisId={1}
                  dot
                />
                <YAxis 
                  yAxisId={1} 
                  orientation="right"
                  label={{ value: 'Phase (radians)', angle: 90, position: 'insideRight' }}
                  domain={[-Math.PI, Math.PI]}
                  ticks={[-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI]}
                  tickFormatter={(value) => {
                    if (value === Math.PI) return "π";
                    if (value === -Math.PI) return "-π";
                    if (value === Math.PI/2) return "π/2";
                    if (value === -Math.PI/2) return "-π/2";
                    return "0";
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">How to Use This Visualization</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Select a signal type or draw your own custom signal</li>
          <li>Adjust parameters like frequency, amplitude, and phase</li>
          <li>Set the number of harmonic components to visualize</li>
          <li>Click "Animate Synthesis" to see how harmonic components build the signal</li>
          <li>Toggle showing harmonic components and the reconstructed signal</li>
          <li>Observe how different signals have unique frequency spectra</li>
        </ul>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-2">Key Observations:</h4>
          <ul className="list-disc list-inside text-gray-700">
            <li>A pure sine wave has a single frequency component</li>
            <li>Square waves contain only odd harmonics (1, 3, 5, ...)</li>
            <li>Sawtooth waves contain all harmonics with amplitudes decreasing as 1/n</li>
            <li>Triangle waves contain only odd harmonics with amplitudes decreasing rapidly (1/n²)</li>
            <li>More complex signals require more harmonics for accurate reconstruction</li>
            <li>The Gibbs phenomenon causes "ringing" near sharp transitions when using finite harmonics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FourierTransformVisualizer;