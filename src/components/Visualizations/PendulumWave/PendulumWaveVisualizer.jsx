import React, { useState, useEffect, useRef } from 'react';

const PendulumWaveVisualizer = () => {
  // Configuration state
  const [isRunning, setIsRunning] = useState(false);
  const [pendulumCount, setPendulumCount] = useState(15);
  const [pendulumLength, setPendulumLength] = useState(200);
  const [gravity, setGravity] = useState(9.8);
  const [cycleTime, setCycleTime] = useState(60); // seconds for all pendulums to realign
  const [dampingFactor, setDampingFactor] = useState(0.999); // slight damping for realism
  const [showTrails, setShowTrails] = useState(false);
  const [trailsLength, setTrailsLength] = useState(50);
  const [showPhaseInfo, setShowPhaseInfo] = useState(true);
  
  // Animation variables
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const pendulumDataRef = useRef([]);
  const pendulumTrailsRef = useRef([]);
  const startTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  // Reset and initialize pendulums with proper length ratios
  const initializePendulums = () => {
    const pendulums = [];
    const trails = [];
    
    // For pendulum wave, lengths are proportional to the square of periods
    // We want them to all return to their original configuration after cycleTime seconds
    const baseFrequency = 2 * Math.PI / cycleTime; // frequency of the cycle
    
    for (let i = 0; i < pendulumCount; i++) {
      // Calculate period for this pendulum
      // For pendulum wave, we want frequencies that differ by a small amount (baseFrequency)
      const frequency = baseFrequency * (pendulumCount) / (i + 1);
      
      // Using pendulum period formula T = 2π√(L/g), solve for L
      // L = g * (T/(2π))^2, where T is the period (1/frequency)
      const lengthFactor = gravity * Math.pow(1 / (frequency * 2 * Math.PI), 2);
      
      // Scale to desired visual length
      const length = pendulumLength * (lengthFactor / lengthFactor);
      
      pendulums.push({
        length: pendulumLength * Math.pow((pendulumCount - i) / pendulumCount, 2),
        angle: 0, // start at rest, vertically
        angularVelocity: 0,
        frequency: Math.sqrt(gravity / (pendulumLength * Math.pow((pendulumCount - i) / pendulumCount, 2))),
        color: getHSLColor(i, pendulumCount)
      });
      
      // Initialize empty trails array for each pendulum
      trails.push([]);
    }
    
    pendulumDataRef.current = pendulums;
    pendulumTrailsRef.current = trails;
    startTimeRef.current = Date.now() / 1000; // seconds
    lastTimeRef.current = startTimeRef.current;
  };
  
  // Generate a HSL color for each pendulum
  const getHSLColor = (index, total) => {
    const hue = (index / total) * 360;
    return `hsl(${hue}, 80%, 50%)`;
  };
  
  // Initialize on component mount and when configuration changes
  useEffect(() => {
    initializePendulums();
  }, [pendulumCount, pendulumLength, gravity, cycleTime]);
  
  // Start/stop animation
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() / 1000;
      lastTimeRef.current = startTimeRef.current;
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);
  
  // Update pendulum positions based on elapsed time
  const animate = () => {
    if (!canvasRef.current) return;
    
    const currentTime = Date.now() / 1000;
    const deltaTime = Math.min(0.03, currentTime - lastTimeRef.current); // cap at 30ms for stability
    lastTimeRef.current = currentTime;
    
    updatePendulums(deltaTime);
    drawPendulums();
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Update physics for each pendulum
  const updatePendulums = (deltaTime) => {
    const pendulums = pendulumDataRef.current;
    const trails = pendulumTrailsRef.current;
    const elapsed = lastTimeRef.current - startTimeRef.current;
    
    // Calculate angles for pendulums at current time
    pendulums.forEach((pendulum, i) => {
      // For pendulum wave, we directly calculate angle for each time point
      // This is more stable than numerical integration for this visualization
      const amplitude = Math.PI / 6; // 30 degrees swing
      
      // Calculate precise angle based on frequency
      pendulum.angle = amplitude * Math.sin(pendulum.frequency * elapsed);
      
      // Apply a very small damping over time for realism
      const dampingMultiplier = Math.pow(dampingFactor, elapsed * 60); // 60Hz damping
      pendulum.angle *= dampingMultiplier;
      
      // Add current position to trails if enabled
      if (showTrails) {
        const pendulumX = Math.sin(pendulum.angle) * pendulum.length;
        const pendulumY = Math.cos(pendulum.angle) * pendulum.length;
        
        trails[i].push({ x: pendulumX, y: pendulumY });
        
        // Limit trail length
        if (trails[i].length > trailsLength) {
          trails[i].shift();
        }
      } else {
        // Clear trails if disabled
        trails[i] = [];
      }
    });
    
    pendulumTrailsRef.current = trails;
  };
  
  // Render pendulums to canvas
  const drawPendulums = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pendulums = pendulumDataRef.current;
    const trails = pendulumTrailsRef.current;
    
    // Get canvas dimensions and calculate center
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const topY = 60; // offset from top of canvas for pivot point
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw mounting bar
    ctx.fillStyle = '#555';
    ctx.fillRect(centerX - (pendulumCount * 15) / 2, topY - 5, pendulumCount * 15, 10);
    
    // Draw pendulums
    pendulums.forEach((pendulum, i) => {
      const pivotX = centerX - ((pendulumCount - 1) * 15) / 2 + i * 15;
      
      const pendulumX = pivotX + Math.sin(pendulum.angle) * pendulum.length;
      const pendulumY = topY + Math.cos(pendulum.angle) * pendulum.length;
      
      // Draw string
      ctx.beginPath();
      ctx.moveTo(pivotX, topY);
      ctx.lineTo(pendulumX, pendulumY);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw trails if enabled
      if (showTrails && trails[i].length > 1) {
        ctx.beginPath();
        
        // Start at last trail point
        ctx.moveTo(pivotX + trails[i][0].x, topY + trails[i][0].y);
        
        // Connect all trail points
        for (let j = 1; j < trails[i].length; j++) {
          ctx.lineTo(pivotX + trails[i][j].x, topY + trails[i][j].y);
        }
        
        // Style and stroke the trail
        ctx.strokeStyle = pendulum.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
      
      // Draw bob
      ctx.beginPath();
      ctx.arc(pendulumX, pendulumY, 10, 0, Math.PI * 2);
      ctx.fillStyle = pendulum.color;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw phase information if enabled
    if (showPhaseInfo) {
      // Calculate elapsed fraction of cycle time
      const elapsed = (lastTimeRef.current - startTimeRef.current) % cycleTime;
      const cyclePercentage = (elapsed / cycleTime * 100).toFixed(1);
      
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Cycle: ${cyclePercentage}%`, centerX, height - 20);
      
      // Draw time progress bar
      const barWidth = width * 0.8;
      const barHeight = 10;
      const barX = (width - barWidth) / 2;
      const barY = height - 40;
      
      // Bar background
      ctx.fillStyle = '#eee';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Progress
      ctx.fillStyle = 'rgba(75, 192, 192, 0.7)';
      ctx.fillRect(barX, barY, barWidth * (elapsed / cycleTime), barHeight);
      
      // Border
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  };

  // Handle canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        // Set height based on the pendulum length to ensure visibility
        canvas.height = Math.max(container.clientHeight, pendulumLength * 1.5 + 100);
        
        if (!isRunning) {
          drawPendulums();
        }
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [pendulumLength]);
  
  // Handle reset button
  const handleReset = () => {
    setIsRunning(false);
    initializePendulums();
    drawPendulums();
  };
  
  // Handle toggles
  const toggleAnimation = () => {
    if (!isRunning) {
      // If restarting, reset the timer
      startTimeRef.current = Date.now() / 1000;
      lastTimeRef.current = startTimeRef.current;
    }
    setIsRunning(!isRunning);
  };
  
  // Get the current pattern type based on elapsed time
  const getPatternDescription = () => {
    if (!isRunning && lastTimeRef.current === startTimeRef.current) {
      return 'Start the animation to see the wave patterns';
    }
    
    const elapsed = (lastTimeRef.current - startTimeRef.current) % cycleTime;
    const percentage = elapsed / cycleTime;
    
    if (percentage < 0.05 || percentage > 0.95) {
      return 'In-phase alignment (all pendulums aligned)';
    } else if (percentage > 0.45 && percentage < 0.55) {
      return 'Anti-phase alignment (alternating pattern)';
    } else if (percentage > 0.20 && percentage < 0.30) {
      return 'Wave pattern forming (traveling wave)';
    } else if (percentage > 0.70 && percentage < 0.80) {
      return 'Reverse wave pattern (traveling in opposite direction)';
    } else {
      return 'Transitional pattern (complex phasing)';
    }
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Pendulum Wave Dynamics</h2>
            <p className="text-gray-600 max-w-3xl">
              This visualization demonstrates how pendulums of carefully calculated lengths 
              create mesmerizing wave patterns as they move in and out of phase with each other over time.
            </p>
          </div>
          
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <button
              onClick={toggleAnimation}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isRunning 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Pendulums: {pendulumCount}
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={pendulumCount}
                onChange={(e) => setPendulumCount(parseInt(e.target.value))}
                className="w-full"
                disabled={isRunning}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pendulum Length: {pendulumLength} pixels
              </label>
              <input
                type="range"
                min="100"
                max="300"
                value={pendulumLength}
                onChange={(e) => setPendulumLength(parseInt(e.target.value))}
                className="w-full"
                disabled={isRunning}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cycle Time: {cycleTime} seconds
              </label>
              <input
                type="range"
                min="20"
                max="120"
                value={cycleTime}
                onChange={(e) => setCycleTime(parseInt(e.target.value))}
                className="w-full"
                disabled={isRunning}
              />
              <p className="text-xs text-gray-500">Time for pendulums to return to their initial formation</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gravity: {gravity.toFixed(1)} m/s²
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full"
                disabled={isRunning}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Damping Factor: {dampingFactor.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.99"
                max="0.999"
                step="0.001"
                value={dampingFactor}
                onChange={(e) => setDampingFactor(parseFloat(e.target.value))}
                className="w-full"
                disabled={isRunning}
              />
              <p className="text-xs text-gray-500">Higher values mean less damping</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showTrails"
                  checked={showTrails}
                  onChange={() => setShowTrails(!showTrails)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showTrails" className="ml-2 block text-sm text-gray-700">
                  Show Pendulum Trails
                </label>
              </div>
              
              {showTrails && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trail Length: {trailsLength}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={trailsLength}
                    onChange={(e) => setTrailsLength(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPhaseInfo"
                  checked={showPhaseInfo}
                  onChange={() => setShowPhaseInfo(!showPhaseInfo)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showPhaseInfo" className="ml-2 block text-sm text-gray-700">
                  Show Phase Information
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium">
            Current Pattern: <span className="text-blue-600">{getPatternDescription()}</span>
          </p>
        </div>
      </div>
      
      <div className="visualization-container bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="canvas-container w-full" style={{ minHeight: '400px' }}>
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Understanding Pendulum Waves</h3>
        
        <div className="prose max-w-none">
          <p className="mb-3">
            The pendulum wave demonstration shows the physical principle of phase interference patterns. 
            Each pendulum has a slightly different length, which causes its oscillation period to vary 
            according to the pendulum length formula:
          </p>
          
          <div className="p-3 bg-gray-50 rounded mb-3 text-center font-mono">
            T = 2π√(L/g)
          </div>
          
          <p className="mb-3">
            Where T is the period, L is the pendulum's length, and g is the acceleration due to gravity.
            By carefully choosing each pendulum's length, we create a system where all pendulums return to 
            their initial formation after a specific cycle time.
          </p>
          
          <h4 className="text-md font-semibold mt-4 mb-2">Key Physics Concepts Demonstrated:</h4>
          
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li><strong>Simple Harmonic Motion:</strong> Each pendulum follows the classic sine wave oscillation pattern.</li>
            <li><strong>Phase Relationships:</strong> Adjacent pendulums have slightly different frequencies, creating evolving phase patterns.</li>
            <li><strong>Wave Propagation:</strong> The collective motion creates apparent traveling waves across the system.</li>
            <li><strong>Interference Patterns:</strong> The superposition of different oscillation phases creates complex visual patterns.</li>
            <li><strong>Resonance:</strong> All pendulums return to their initial state after a complete cycle time.</li>
          </ul>
          
          <p className="mb-3">
            This visualization is not only mesmerizing to watch but demonstrates fundamental principles 
            in physics that apply to many wave phenomena including sound waves, light, quantum mechanics, 
            and even crowd behavior.
          </p>
          
          <div className="p-3 border border-gray-200 rounded-lg bg-blue-50 mt-4">
            <h4 className="font-semibold mb-2">Try This:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Watch for specific patterns that emerge at different points in the cycle</li>
              <li>Notice how the wave appears to change direction at certain times</li>
              <li>Enable trails to see the envelope patterns formed by the pendulum paths</li>
              <li>Adjust the pendulum count to see how complexity changes with more oscillators</li>
              <li>Change the cycle time to speed up or slow down the pattern evolution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendulumWaveVisualizer;