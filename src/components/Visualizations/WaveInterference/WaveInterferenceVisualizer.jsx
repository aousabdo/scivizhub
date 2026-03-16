import React, { useState, useEffect, useRef, useCallback } from 'react';

const WaveInterferenceVisualizer = () => {
  // Configuration state
  const [isRunning, setIsRunning] = useState(false);
  const [frequency, setFrequency] = useState(2.0);
  const [wavelength, setWavelength] = useState(40);
  const [amplitude, setAmplitude] = useState(0.8);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [viewMode, setViewMode] = useState('ripple'); // 'ripple' or 'crossSection'
  const [crossSectionY, setCrossSectionY] = useState(0.5); // 0-1 fraction of canvas height

  // Wave sources
  const [sources, setSources] = useState([
    { x: 0.35, y: 0.5 },
    { x: 0.65, y: 0.5 },
  ]);

  // Barriers for double slit
  const [barriers, setBarriers] = useState([]);

  // Refs
  const canvasRef = useRef(null);
  const crossSectionCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const imageDataRef = useRef(null);

  // Preset configurations
  const presets = {
    twoSources: {
      label: 'Two Sources',
      sources: [
        { x: 0.35, y: 0.5 },
        { x: 0.65, y: 0.5 },
      ],
      barriers: [],
      frequency: 2.0,
      wavelength: 40,
    },
    threeSources: {
      label: 'Three Sources',
      sources: [
        { x: 0.3, y: 0.5 },
        { x: 0.5, y: 0.5 },
        { x: 0.7, y: 0.5 },
      ],
      barriers: [],
      frequency: 2.0,
      wavelength: 35,
    },
    doubleSlit: {
      label: 'Double Slit',
      sources: [
        { x: 0.15, y: 0.5 },
      ],
      barriers: [
        // Wall with two gaps: top section, middle section, bottom section
        { x1: 0.45, y1: 0.0, x2: 0.47, y2: 0.35 },
        { x1: 0.45, y1: 0.42, x2: 0.47, y2: 0.58 },
        { x1: 0.45, y1: 0.65, x2: 0.47, y2: 1.0 },
      ],
      frequency: 2.5,
      wavelength: 30,
    },
    circularBarrier: {
      label: 'Circular Barrier',
      sources: [
        { x: 0.25, y: 0.5 },
        { x: 0.75, y: 0.5 },
      ],
      barriers: [
        // Approximate a circular barrier with segments
        { x1: 0.46, y1: 0.3, x2: 0.54, y2: 0.32 },
        { x1: 0.54, y1: 0.32, x2: 0.56, y2: 0.4 },
        { x1: 0.56, y1: 0.4, x2: 0.56, y2: 0.6 },
        { x1: 0.56, y1: 0.6, x2: 0.54, y2: 0.68 },
        { x1: 0.54, y1: 0.68, x2: 0.46, y2: 0.7 },
        { x1: 0.46, y1: 0.7, x2: 0.44, y2: 0.6 },
        { x1: 0.44, y1: 0.6, x2: 0.44, y2: 0.4 },
        { x1: 0.44, y1: 0.4, x2: 0.46, y2: 0.3 },
      ],
      frequency: 2.0,
      wavelength: 35,
    },
  };

  const applyPreset = useCallback((presetKey) => {
    const preset = presets[presetKey];
    if (!preset) return;
    setSources([...preset.sources]);
    setBarriers([...preset.barriers]);
    setFrequency(preset.frequency);
    setWavelength(preset.wavelength);
    timeRef.current = 0;
  }, []);

  // Check if a point is inside or behind a barrier
  const isBlockedByBarrier = useCallback((sx, sy, px, py, barriersArr, canvasWidth, canvasHeight) => {
    for (const b of barriersArr) {
      const bx1 = b.x1 * canvasWidth;
      const by1 = b.y1 * canvasHeight;
      const bx2 = b.x2 * canvasWidth;
      const by2 = b.y2 * canvasHeight;

      // Check if the line from source to point intersects this barrier rectangle
      const minBx = Math.min(bx1, bx2);
      const maxBx = Math.max(bx1, bx2);
      const minBy = Math.min(by1, by2);
      const maxBy = Math.max(by1, by2);

      // Simple check: is the point inside the barrier?
      if (px >= minBx && px <= maxBx && py >= minBy && py <= maxBy) {
        return true;
      }

      // Check if the line segment from source to point crosses the barrier
      // Use parametric line-rectangle intersection
      if (lineIntersectsRect(sx, sy, px, py, minBx, minBy, maxBx, maxBy)) {
        return true;
      }
    }
    return false;
  }, []);

  // Line-rectangle intersection test
  const lineIntersectsRect = (x1, y1, x2, y2, rx1, ry1, rx2, ry2) => {
    // Check intersection with each edge of the rectangle
    const edges = [
      [rx1, ry1, rx2, ry1], // top
      [rx2, ry1, rx2, ry2], // right
      [rx1, ry2, rx2, ry2], // bottom
      [rx1, ry1, rx1, ry2], // left
    ];

    for (const [ex1, ey1, ex2, ey2] of edges) {
      if (lineSegmentsIntersect(x1, y1, x2, y2, ex1, ey1, ex2, ey2)) {
        return true;
      }
    }
    return false;
  };

  // Check if two line segments intersect
  const lineSegmentsIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 0.0001) return false;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  // Compute wave value at a point
  const computeWaveAt = useCallback((px, py, time, canvasWidth, canvasHeight) => {
    let totalAmplitude = 0;

    for (const source of sources) {
      const sx = source.x * canvasWidth;
      const sy = source.y * canvasHeight;

      // Check barrier blocking
      if (barriers.length > 0 && isBlockedByBarrier(sx, sy, px, py, barriers, canvasWidth, canvasHeight)) {
        continue;
      }

      const dx = px - sx;
      const dy = py - sy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Wave equation: A * sin(kx - wt) / sqrt(r) for 2D circular waves
      const k = (2 * Math.PI) / wavelength; // wave number
      const omega = 2 * Math.PI * frequency; // angular frequency
      const decay = 1 / Math.max(1, Math.sqrt(distance / 10)); // amplitude decay

      totalAmplitude += amplitude * decay * Math.sin(k * distance - omega * time);
    }

    return totalAmplitude;
  }, [sources, barriers, wavelength, frequency, amplitude, isBlockedByBarrier]);

  // Map wave amplitude to HSL color
  const amplitudeToColor = (value) => {
    // Clamp value to -1..1
    const clamped = Math.max(-1, Math.min(1, value));

    // Map: -1 = deep blue (trough), 0 = white, +1 = deep red (peak)
    if (clamped >= 0) {
      // White to red
      const intensity = clamped;
      const r = 255;
      const g = Math.round(255 * (1 - intensity));
      const b = Math.round(255 * (1 - intensity));
      return [r, g, b];
    } else {
      // White to blue
      const intensity = -clamped;
      const r = Math.round(255 * (1 - intensity));
      const g = Math.round(255 * (1 - intensity));
      const b = 255;
      return [r, g, b];
    }
  };

  // Draw ripple tank view
  const drawRippleTank = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Use pixel stepping for performance (render at lower resolution, then scale)
    const step = 3;
    const renderWidth = Math.ceil(width / step);
    const renderHeight = Math.ceil(height / step);

    // Create or reuse offscreen image data
    if (
      !imageDataRef.current ||
      imageDataRef.current.width !== renderWidth ||
      imageDataRef.current.height !== renderHeight
    ) {
      imageDataRef.current = ctx.createImageData(renderWidth, renderHeight);
    }

    const data = imageDataRef.current.data;
    const time = timeRef.current;

    for (let ry = 0; ry < renderHeight; ry++) {
      for (let rx = 0; rx < renderWidth; rx++) {
        const px = rx * step + step / 2;
        const py = ry * step + step / 2;

        // Check if inside a barrier
        let insideBarrier = false;
        for (const b of barriers) {
          const bx1 = Math.min(b.x1, b.x2) * width;
          const bx2 = Math.max(b.x1, b.x2) * width;
          const by1 = Math.min(b.y1, b.y2) * height;
          const by2 = Math.max(b.y1, b.y2) * height;
          if (px >= bx1 && px <= bx2 && py >= by1 && py <= by2) {
            insideBarrier = true;
            break;
          }
        }

        const idx = (ry * renderWidth + rx) * 4;

        if (insideBarrier) {
          data[idx] = 60;
          data[idx + 1] = 60;
          data[idx + 2] = 60;
          data[idx + 3] = 255;
        } else {
          const val = computeWaveAt(px, py, time, width, height);
          const [r, g, b] = amplitudeToColor(val);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }

    // Draw at low resolution then scale up
    const offCanvas = document.createElement('canvas');
    offCanvas.width = renderWidth;
    offCanvas.height = renderHeight;
    const offCtx = offCanvas.getContext('2d');
    offCtx.putImageData(imageDataRef.current, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(offCanvas, 0, 0, renderWidth, renderHeight, 0, 0, width, height);

    // Draw source markers
    for (let i = 0; i < sources.length; i++) {
      const sx = sources[i].x * width;
      const sy = sources[i].y * height;

      // Pulsing glow
      const pulsePhase = Math.sin(2 * Math.PI * frequency * time);
      const glowRadius = 12 + pulsePhase * 3;

      ctx.beginPath();
      ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(sx, sy, 2, sx, sy, glowRadius);
      glow.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
      glow.addColorStop(0.5, 'rgba(255, 200, 0, 0.4)');
      glow.addColorStop(1, 'rgba(255, 200, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fill();

      // Source dot
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`S${i + 1}`, sx, sy);
    }

    // Draw cross-section line indicator when in ripple mode
    if (viewMode === 'ripple') {
      const csY = crossSectionY * height;
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, csY);
      ctx.lineTo(width, csY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(0, 255, 100, 0.9)';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Cross-section line', 5, csY - 6);
    }

    // Info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, 180, 52);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Sources: ${sources.length}`, 10, 18);
    ctx.fillText(`Mode: Ripple Tank`, 10, 35);
    ctx.fillText(`Click canvas to add source`, 10, 48);
  }, [sources, barriers, computeWaveAt, frequency, viewMode, crossSectionY]);

  // Draw cross-section view
  const drawCrossSection = useCallback(() => {
    const csCanvas = crossSectionCanvasRef.current;
    if (!csCanvas) return;
    const ctx = csCanvas.getContext('2d');
    const width = csCanvas.width;
    const height = csCanvas.height;

    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const mainWidth = mainCanvas.width;
    const mainHeight = mainCanvas.height;

    const time = timeRef.current;
    const sliceY = crossSectionY * mainHeight;

    ctx.clearRect(0, 0, width, height);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center line (zero amplitude)
    const centerY = height / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('+A', width - 5, centerY - (height * 0.35));
    ctx.fillText('0', width - 5, centerY + 4);
    ctx.fillText('-A', width - 5, centerY + (height * 0.35));

    // Compute and draw per-source waves + superposition
    const superpositionValues = [];
    const perSourceValues = [];

    for (let si = 0; si < sources.length; si++) {
      perSourceValues.push([]);
    }

    const scaleY = height * 0.38;

    for (let px = 0; px < width; px++) {
      const worldX = (px / width) * mainWidth;
      let total = 0;

      for (let si = 0; si < sources.length; si++) {
        const sx = sources[si].x * mainWidth;
        const sy = sources[si].y * mainHeight;
        let blocked = false;

        if (barriers.length > 0) {
          blocked = isBlockedByBarrier(sx, sy, worldX, sliceY, barriers, mainWidth, mainHeight);
        }

        if (blocked) {
          perSourceValues[si].push(0);
          continue;
        }

        const dx = worldX - sx;
        const dy = sliceY - sy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const k = (2 * Math.PI) / wavelength;
        const omega = 2 * Math.PI * frequency;
        const decay = 1 / Math.max(1, Math.sqrt(distance / 10));
        const val = amplitude * decay * Math.sin(k * distance - omega * time);
        perSourceValues[si].push(val);
        total += val;
      }

      superpositionValues.push(total);
    }

    // Draw individual source waves (dimmed)
    const sourceColors = ['rgba(100,180,255,0.4)', 'rgba(255,130,130,0.4)', 'rgba(130,255,130,0.4)', 'rgba(255,200,100,0.4)'];
    for (let si = 0; si < sources.length; si++) {
      ctx.beginPath();
      ctx.strokeStyle = sourceColors[si % sourceColors.length];
      ctx.lineWidth = 1.5;
      for (let px = 0; px < width; px++) {
        const y = centerY - perSourceValues[si][px] * scaleY;
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
    }

    // Draw superposition wave (bright)
    ctx.beginPath();
    for (let px = 0; px < width; px++) {
      const y = centerY - superpositionValues[px] * scaleY;
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }

    // Gradient stroke for superposition
    const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
    waveGrad.addColorStop(0, '#00f0ff');
    waveGrad.addColorStop(0.5, '#ff00ff');
    waveGrad.addColorStop(1, '#00f0ff');
    ctx.strokeStyle = waveGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill under the superposition curve
    ctx.lineTo(width, centerY);
    ctx.lineTo(0, centerY);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, width, 0);
    fillGrad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    fillGrad.addColorStop(0.5, 'rgba(255, 0, 255, 0.08)');
    fillGrad.addColorStop(1, 'rgba(0, 240, 255, 0.08)');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Cross-Section Amplitude', width / 2, 18);

    // Legend
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    let legendX = 10;
    for (let si = 0; si < sources.length; si++) {
      ctx.fillStyle = sourceColors[si % sourceColors.length].replace('0.4', '1');
      ctx.fillText(`S${si + 1}`, legendX, height - 10);
      legendX += 30;
    }
    ctx.fillStyle = '#ff00ff';
    ctx.fillText('Superposition', legendX, height - 10);
  }, [sources, barriers, computeWaveAt, frequency, wavelength, amplitude, crossSectionY, isBlockedByBarrier]);

  // Animation loop
  const animate = useCallback(() => {
    const now = performance.now() / 1000;
    const delta = Math.min(0.05, now - lastFrameTimeRef.current);
    lastFrameTimeRef.current = now;
    timeRef.current += delta * animationSpeed;

    drawRippleTank();
    if (viewMode === 'crossSection' || viewMode === 'ripple') {
      drawCrossSection();
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [animationSpeed, drawRippleTank, drawCrossSection, viewMode]);

  // Start/stop animation
  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now() / 1000;
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, animate]);

  // Canvas resize handler
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const csCanvas = crossSectionCanvasRef.current;

      if (canvas) {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = Math.max(400, Math.min(550, container.clientWidth * 0.6));

        if (!isRunning) {
          drawRippleTank();
        }
      }

      if (csCanvas) {
        const container = csCanvas.parentElement;
        csCanvas.width = container.clientWidth;
        csCanvas.height = 200;

        if (!isRunning) {
          drawCrossSection();
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [drawRippleTank, drawCrossSection, isRunning]);

  // Handle canvas click to add sources
  const handleCanvasClick = useCallback((e) => {
    if (sources.length >= 4) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((e.clientX - rect.left) * scaleX) / canvas.width;
    const y = ((e.clientY - rect.top) * scaleY) / canvas.height;

    setSources((prev) => [...prev, { x, y }]);
  }, [sources.length]);

  // Control handlers
  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    timeRef.current = 0;
    setSources([
      { x: 0.35, y: 0.5 },
      { x: 0.65, y: 0.5 },
    ]);
    setBarriers([]);
    setFrequency(2.0);
    setWavelength(40);
    setAmplitude(0.8);
    setAnimationSpeed(1.0);

    // Redraw after state settles
    setTimeout(() => {
      if (canvasRef.current) drawRippleTank();
      if (crossSectionCanvasRef.current) drawCrossSection();
    }, 50);
  };

  const clearSources = () => {
    setSources([]);
    setBarriers([]);
  };

  const getStatusDescription = () => {
    if (!isRunning && timeRef.current === 0) {
      return 'Click Play to start the wave simulation';
    }
    if (!isRunning) {
      return 'Simulation paused';
    }
    if (sources.length === 0) {
      return 'Click on the canvas to place a wave source';
    }
    if (sources.length === 1) {
      return 'Single source - circular wave pattern';
    }
    return `${sources.length} sources - interference pattern forming`;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Wave Interference Simulator</h2>
            <p className="text-gray-600 max-w-3xl">
              Explore how waves from multiple sources interact to create beautiful interference patterns.
              Click on the canvas to place up to 4 wave sources and observe constructive and destructive interference.
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
              {isRunning ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors border border-indigo-200"
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={clearSources}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency: {frequency.toFixed(1)} Hz
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wavelength: {wavelength} px
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={wavelength}
                onChange={(e) => setWavelength(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amplitude: {amplitude.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={amplitude}
                onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed: {animationSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cross-Section Position: {(crossSectionY * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={crossSectionY}
                onChange={(e) => setCrossSectionY(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Adjusts the green line on the ripple tank for the cross-section view</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('ripple')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'ripple'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ripple Tank
                </button>
                <button
                  onClick={() => setViewMode('crossSection')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'crossSection'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cross Section
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium">
            Status: <span className="text-blue-600">{getStatusDescription()}</span>
          </p>
        </div>
      </div>

      {/* Ripple Tank Canvas */}
      <div className="visualization-container bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="canvas-container w-full" style={{ minHeight: '400px' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onClick={handleCanvasClick}
          ></canvas>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>Click on the canvas to place a wave source (max 4)</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: '#ef4444' }}></span>
              Peak (constructive)
            </span>
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: '#fff', border: '1px solid #ccc' }}></span>
              Zero
            </span>
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: '#3b82f6' }}></span>
              Trough (destructive)
            </span>
          </div>
        </div>
      </div>

      {/* Cross Section Canvas */}
      <div className="visualization-container bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="canvas-container w-full" style={{ height: '200px' }}>
          <canvas ref={crossSectionCanvasRef} className="w-full h-full"></canvas>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Understanding Wave Interference</h3>

        <div className="prose max-w-none">
          <p className="mb-3">
            Wave interference occurs when two or more waves overlap in space. The resulting wave amplitude at any
            point is the sum of the individual wave amplitudes, a principle known as superposition.
          </p>

          <div className="p-3 bg-gray-50 rounded mb-3 text-center font-mono">
            Superposition: y(x,t) = y1(x,t) + y2(x,t) + ... + yn(x,t)
          </div>

          <p className="mb-3">
            Each circular wave spreads outward from its source with the equation
            y = A sin(kr - wt) / sqrt(r), where k is the wave number (2pi/lambda),
            omega is the angular frequency, and r is the distance from the source.
          </p>

          <h4 className="text-md font-semibold mt-4 mb-2">Key Interference Concepts:</h4>

          <ul className="list-disc list-inside space-y-1 mb-3">
            <li><strong>Constructive Interference:</strong> Waves arrive in phase, amplitudes add (bright red regions).</li>
            <li><strong>Destructive Interference:</strong> Waves arrive out of phase, amplitudes cancel (dark blue regions).</li>
            <li><strong>Nodal Lines:</strong> Paths of permanent destructive interference between sources.</li>
            <li><strong>Antinodal Lines:</strong> Paths of permanent constructive interference between sources.</li>
            <li><strong>Diffraction:</strong> Waves bending around barriers and through slits (try the Double Slit preset).</li>
          </ul>

          <div className="p-3 border border-gray-200 rounded-lg bg-blue-50 mt-4">
            <h4 className="font-semibold mb-2">Try This:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Place two sources and observe the characteristic hyperbolic nodal lines</li>
              <li>Use the Double Slit preset to see the classic diffraction pattern</li>
              <li>Adjust wavelength to see how it affects the spacing of interference fringes</li>
              <li>Move the cross-section line through constructive and destructive regions</li>
              <li>Add a third or fourth source to see complex multi-source interference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveInterferenceVisualizer;
