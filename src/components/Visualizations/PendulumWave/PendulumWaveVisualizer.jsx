import React, { useState, useEffect, useRef } from 'react';

const PendulumWaveVisualizer = () => {
  // Configuration state
  const [isRunning, setIsRunning] = useState(false);
  const [pendulumCount, setPendulumCount] = useState(15);
  const [pendulumLength, setPendulumLength] = useState(200);
  const [gravity, setGravity] = useState(9.8);
  const [cycleTime, setCycleTime] = useState(30); // Reduced from 60 to 30 seconds for faster visualization
  const [dampingFactor, setDampingFactor] = useState(0.999); // slight damping for realism
  const [showTrails, setShowTrails] = useState(true); // Enabled by default
  const [trailsLength, setTrailsLength] = useState(50);
  const [showPhaseInfo, setShowPhaseInfo] = useState(true);
  const [showSineWave, setShowSineWave] = useState(true); // New option for sine wave visualization
  
  // Animation variables
  const canvasRef = useRef(null);
  const sineCanvasRef = useRef(null); // New canvas for sine wave visualization
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
    
    // Draw sine wave visualization if enabled
    if (showSineWave && sineCanvasRef.current) {
      drawSineWave();
    }
    
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
    
    // Draw subtle radial gradient background for visual appeal
    const gradient = ctx.createRadialGradient(centerX, height/2, 10, centerX, height/2, height);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f8f9fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw decorative elements - reference lines
    ctx.strokeStyle = '#dddddd';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    
    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX, height - 60);
    ctx.stroke();
    
    // Reset line style
    ctx.setLineDash([]);
    
    // Draw amplitude arc guides
    const maxLength = pendulums[0].length;
    const arcRadius = 30; // Angle guide radius
    
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.beginPath();
    ctx.arc(centerX, topY, maxLength, -Math.PI/6, Math.PI/6);
    ctx.stroke();
    
    // Draw mounting bar with enhanced styling
    const barWidth = pendulumCount * 15 + 20;
    const barHeight = 12;
    
    // Drop shadow for bar
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    
    // Bar gradient
    const barGradient = ctx.createLinearGradient(0, topY - barHeight/2, 0, topY + barHeight/2);
    barGradient.addColorStop(0, '#666');
    barGradient.addColorStop(1, '#444');
    
    ctx.fillStyle = barGradient;
    ctx.fillRect(centerX - barWidth/2, topY - barHeight/2, barWidth, barHeight);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Add small mounting points over the bar
    pendulums.forEach((pendulum, i) => {
      const pivotX = centerX - ((pendulumCount - 1) * 15) / 2 + i * 15;
      
      ctx.beginPath();
      ctx.arc(pivotX, topY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#aaa';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw floor/ground reference line
    const groundY = topY + maxLength + 40;
    if (groundY < height - 60) {
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - barWidth/2 - 20, groundY);
      ctx.lineTo(centerX + barWidth/2 + 20, groundY);
      ctx.stroke();
      
      // Add small tick marks
      for (let x = centerX - barWidth/2; x <= centerX + barWidth/2; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, groundY + 5);
        ctx.stroke();
      }
    }
    
    // Draw pendulums with enhanced styling
    pendulums.forEach((pendulum, i) => {
      const pivotX = centerX - ((pendulumCount - 1) * 15) / 2 + i * 15;
      
      const pendulumX = pivotX + Math.sin(pendulum.angle) * pendulum.length;
      const pendulumY = topY + Math.cos(pendulum.angle) * pendulum.length;
      
      // Draw trails if enabled
      if (showTrails && trails[i].length > 1) {
        ctx.beginPath();
        
        // Start at last trail point
        ctx.moveTo(pivotX + trails[i][0].x, topY + trails[i][0].y);
        
        // Connect all trail points
        for (let j = 1; j < trails[i].length; j++) {
          ctx.lineTo(pivotX + trails[i][j].x, topY + trails[i][j].y);
        }
        
        // Style and stroke the trail - make it more vibrant
        ctx.strokeStyle = pendulum.color;
        ctx.lineWidth = 2.5;
        
        // Create gradient trail effect - fade out older points
        const trailGradient = ctx.createLinearGradient(
          pivotX + trails[i][0].x, topY + trails[i][0].y,
          pivotX + trails[i][trails[i].length-1].x, topY + trails[i][trails[i].length-1].y
        );
        
        // Create transparent version of the color by converting hsl to hsla
        let transparentColor = pendulum.color;
        if (pendulum.color.startsWith('hsl')) {
          transparentColor = pendulum.color.replace('hsl', 'hsla').replace(')', ', 0.1)');
        }
        
        trailGradient.addColorStop(0, transparentColor); // Almost transparent
        trailGradient.addColorStop(1, pendulum.color);
        
        ctx.strokeStyle = trailGradient;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
      
      // Draw string with subtle depth effect
      ctx.beginPath();
      ctx.moveTo(pivotX, topY);
      ctx.lineTo(pendulumX, pendulumY);
      
      // String gradient
      const stringGradient = ctx.createLinearGradient(pivotX, topY, pendulumX, pendulumY);
      stringGradient.addColorStop(0, '#888');
      stringGradient.addColorStop(1, '#444');
      
      ctx.strokeStyle = stringGradient;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Draw bob with enhanced styling - 3D effect
      ctx.beginPath();
      ctx.arc(pendulumX, pendulumY, 12, 0, Math.PI * 2);
      
      // Create radial gradient for 3D effect
      const ballGradient = ctx.createRadialGradient(
        pendulumX - 3, pendulumY - 3, 1,
        pendulumX, pendulumY, 12
      );
      ballGradient.addColorStop(0, lightenColor(pendulum.color, 40));
      ballGradient.addColorStop(0.7, pendulum.color);
      ballGradient.addColorStop(1, darkenColor(pendulum.color, 30));
      
      ctx.fillStyle = ballGradient;
      ctx.fill();
      
      // Add highlight reflection
      ctx.beginPath();
      ctx.arc(pendulumX - 4, pendulumY - 4, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      
      // Add pendulum number for clarity
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i+1, pendulumX, pendulumY);
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
      
      // Draw time progress bar with enhanced styling
      const barWidth = width * 0.8;
      const barHeight = 12;
      const barX = (width - barWidth) / 2;
      const barY = height - 40;
      
      // Progress bar background with gradient
      const bgGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
      bgGradient.addColorStop(0, '#f0f0f0');
      bgGradient.addColorStop(1, '#e0e0e0');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Progress indicator with gradient
      const progressGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
      progressGradient.addColorStop(0, 'rgba(75, 192, 192, 0.8)');
      progressGradient.addColorStop(1, 'rgba(75, 150, 192, 0.8)');
      
      ctx.fillStyle = progressGradient;
      ctx.fillRect(barX, barY, barWidth * (elapsed / cycleTime), barHeight);
      
      // Border with rounded corners
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 6);
      ctx.stroke();
    }
  };
  
  // Helper functions for color manipulation
  const lightenColor = (color, percent) => {
    // Only works with hsl colors
    if (color.startsWith('hsl')) {
      const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        const h = match[1];
        const s = match[2];
        const l = Math.min(100, parseInt(match[3]) + percent);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
    }
    return color;
  };
  
  const darkenColor = (color, percent) => {
    // Only works with hsl colors
    if (color.startsWith('hsl')) {
      const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        const h = match[1];
        const s = match[2];
        const l = Math.max(0, parseInt(match[3]) - percent);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
    }
    return color;
  };
  
  // Draw sine wave visualization that shows phase relationships
  const drawSineWave = () => {
    const canvas = sineCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const pendulums = pendulumDataRef.current;
    
    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw center line
    ctx.strokeStyle = '#aaa';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw sine wave axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Position', 10, 20);
    
    ctx.textAlign = 'right';
    ctx.fillText('Time →', width - 10, height - 10);
    
    // Set up for drawing phase relationships
    const elapsed = lastTimeRef.current - startTimeRef.current;
    
    // Calculate vertical spacing to separate the sine waves
    const pendulumSpacing = Math.min(20, height / (pendulumCount * 2)); 
    const graphAmplitude = Math.min(pendulumSpacing * 0.8, 25); // Amplitude of the sine waves
    
    // Show a longer timespan to better appreciate phase differences
    const timeWindow = 5; // seconds to display - increased from 2 to 5
    const pixelsPerSecond = width / timeWindow;
    
    // Draw vertical time markers with labels
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let t = 0; t <= timeWindow; t += 1) {
      const x = width - t * pixelsPerSecond;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Add time labels
      if (t === 0) {
        ctx.fillText('Now', x, height - 5);
      } else {
        ctx.fillText(`-${t}s`, x, height - 5);
      }
    }
    
    // Draw time-based sine waves for each pendulum with vertical offset
    pendulums.forEach((pendulum, i) => {
      ctx.strokeStyle = pendulum.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Calculate the center line for this pendulum
      const centerY = height / 2 + (i - pendulumCount / 2 + 0.5) * pendulumSpacing * 2;
      
      // Draw the pendulum's center line (dotted)
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = `${pendulum.color}33`; // Transparent version of color
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Label each pendulum line
      ctx.fillStyle = pendulum.color;
      ctx.textAlign = 'left';
      ctx.font = '10px Arial';
      ctx.fillText(`P${i+1}`, 5, centerY + 3);
      
      // Draw the actual sine wave
      ctx.strokeStyle = pendulum.color;
      ctx.beginPath();
      
      let firstPoint = true;
      for (let t = 0; t <= timeWindow; t += 0.05) {
        const x = width - t * pixelsPerSecond;
        const waveTime = elapsed - t;
        if (waveTime < 0) continue;
        
        const amplitude = Math.PI / 6; // Same as in updatePendulums
        const angle = amplitude * Math.sin(pendulum.frequency * waveTime) * Math.pow(dampingFactor, waveTime * 60);
        const y = centerY - angle * graphAmplitude; // Convert angle to y position
        
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Draw a dot at the current position (right edge)
      const currentAngle = pendulum.angle;
      const currentY = centerY - currentAngle * graphAmplitude;
      
      ctx.beginPath();
      ctx.arc(width, currentY, 4, 0, Math.PI * 2);
      ctx.fillStyle = pendulum.color;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw current time marker
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width, height);
    ctx.stroke();
    
    // Add title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Phase Relationships (Sine Wave Visualization)', width / 2, 20);
    
    // Add legend for periods
    ctx.textAlign = 'left';
    ctx.font = '11px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Periods:', 10, height - 40);
    
    pendulums.slice(0, Math.min(5, pendulumCount)).forEach((pendulum, i) => {
      ctx.fillStyle = pendulum.color;
      ctx.fillText(`P${i+1}: ${(2 * Math.PI / pendulum.frequency).toFixed(2)}s`, 10, height - 25 + i * 15);
    });
  };

  // Handle canvas resize
  useEffect(() => {
    // Handle canvas resize
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const sineCanvas = sineCanvasRef.current;
      
      if (canvas) {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        // Set height based on the pendulum length to ensure visibility
        canvas.height = Math.max(400, pendulumLength * 1.8 + 120); // Increased height for better visibility
        
        if (!isRunning) {
          drawPendulums();
        }
      }
      
      if (sineCanvas) {
        const container = sineCanvas.parentElement;
        sineCanvas.width = container.clientWidth;
        sineCanvas.height = 250; // Increased height for sine wave visualization
        
        if (!isRunning && showSineWave) {
          drawSineWave();
        }
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [pendulumLength, showSineWave]);
  
  // Handle reset button
  const handleReset = () => {
    setIsRunning(false);
    initializePendulums();
    drawPendulums();
    if (showSineWave) {
      drawSineWave();
    }
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
                min="10"
                max="60"
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
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showSineWave"
                  checked={showSineWave}
                  onChange={() => setShowSineWave(!showSineWave)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showSineWave" className="ml-2 block text-sm text-gray-700">
                  Show Sine Wave Visualization
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
      
      {showSineWave && (
        <div className="visualization-container bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="canvas-container w-full" style={{ height: '200px' }}>
            <canvas ref={sineCanvasRef} className="w-full h-full"></canvas>
          </div>
        </div>
      )}
      
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