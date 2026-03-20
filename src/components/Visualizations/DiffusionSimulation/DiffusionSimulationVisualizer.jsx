import React, { useState, useRef, useEffect, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';

const PARTICLE_RADIUS = 2.5;

const MODES = {
  FREE: 'Free Diffusion',
  GRADIENT: 'Concentration Gradient',
};

const PRESETS = {
  'Drop of Ink': {
    mode: MODES.FREE,
    particleCount: 800,
    temperature: 1.0,
    showTrails: false,
  },
  'Osmosis': {
    mode: MODES.GRADIENT,
    particleCount: 600,
    temperature: 0.7,
    showTrails: false,
  },
  'Hot vs Cold': {
    mode: MODES.FREE,
    particleCount: 1000,
    temperature: 2.0,
    showTrails: false,
  },
};

const DEFAULT = PRESETS['Drop of Ink'];

function createParticles(count, mode, canvasW, canvasH) {
  const particles = [];
  const simH = canvasH * 0.6; // top 60% is simulation area
  for (let i = 0; i < count; i++) {
    let x, y, type;
    if (mode === MODES.FREE) {
      // All particles concentrated in center
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 30;
      x = canvasW / 2 + Math.cos(angle) * r;
      y = simH / 2 + Math.sin(angle) * r;
      type = i < count / 2 ? 0 : 1; // red and blue
    } else {
      // Concentration gradient: two chambers
      const half = canvasW / 2;
      if (i < count / 2) {
        // Red particles in left chamber
        x = 20 + Math.random() * (half - 40);
        y = 20 + Math.random() * (simH - 40);
        type = 0;
      } else {
        // Blue particles in right chamber
        x = half + 20 + Math.random() * (half - 40);
        y = 20 + Math.random() * (simH - 40);
        type = 1;
      }
    }
    particles.push({ x, y, type, startX: x, startY: y });
  }
  return particles;
}

const SliderControl = ({ label, min, max, step, value, onChange, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}: <span className="font-semibold">{typeof step === 'number' && step < 1 ? value.toFixed(1) : value}</span>
    </label>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      disabled={disabled} className="w-full disabled:opacity-50"
    />
  </div>
);

const DiffusionSimulationVisualizer = () => {
  const [mode, setMode] = useState(DEFAULT.mode);
  const [particleCount, setParticleCount] = useState(DEFAULT.particleCount);
  const [temperature, setTemperature] = useState(DEFAULT.temperature);
  const [isRunning, setIsRunning] = useState(false);
  const [membraneOpen, setMembraneOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const frameRef = useRef(0);
  const msdHistoryRef = useRef([]);
  const membraneOpenRef = useRef(false);
  const modeRef = useRef(mode);
  const temperatureRef = useRef(temperature);
  const canvasSizeRef = useRef({ w: 800, h: 600 });

  useVisualizationShortcuts({ onTogglePlay: () => setIsRunning(r => !r) });

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { temperatureRef.current = temperature; }, [temperature]);
  useEffect(() => { membraneOpenRef.current = membraneOpen; }, [membraneOpen]);

  const getCanvasSize = useCallback(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return { w: 800, h: 600 };
    const w = Math.min(container.clientWidth, 900);
    const h = Math.round(w * 0.75);
    return { w, h };
  }, []);

  const resetSimulation = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRunning(false);
    frameRef.current = 0;
    msdHistoryRef.current = [];
    setMembraneOpen(false);
    membraneOpenRef.current = false;
    setElapsedTime(0);

    const { w, h } = canvasSizeRef.current;
    const ps = createParticles(particleCount, mode, w, h);
    particlesRef.current = ps;
    drawFrame(ps, w, h, 0);
  }, [particleCount, mode]);

  const drawFrame = useCallback((particles, canvasW, canvasH, frame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const simH = canvasH * 0.6;
    const histY = simH + 10;
    const histH = (canvasH - simH - 10) * 0.5 - 5;
    const msdY = histY + histH + 10;
    const msdH = canvasH - msdY - 5;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Simulation area border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvasW, simH);

    // Draw membrane for gradient mode
    const curMode = modeRef.current;
    if (curMode === MODES.GRADIENT) {
      const midX = canvasW / 2;
      ctx.strokeStyle = membraneOpenRef.current ? '#4ade80' : '#f97316';
      ctx.lineWidth = 2;
      if (!membraneOpenRef.current) {
        ctx.beginPath();
        ctx.moveTo(midX, 0);
        ctx.lineTo(midX, simH);
        ctx.stroke();
      } else {
        // Draw membrane with gaps (pores)
        const gapSize = 20;
        const numGaps = 5;
        const segmentH = simH / numGaps;
        ctx.beginPath();
        for (let i = 0; i < numGaps; i++) {
          const sy = i * segmentH;
          ctx.moveTo(midX, sy);
          ctx.lineTo(midX, sy + segmentH - gapSize);
        }
        ctx.stroke();
      }
      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chamber A', canvasW * 0.25, 15);
      ctx.fillText('Chamber B', canvasW * 0.75, 15);
    }

    // Draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 0 ? '#ef4444' : '#60a5fa';
      ctx.fill();
    }

    // --- Concentration histogram ---
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, histY, canvasW, histH);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(0, histY, canvasW, histH);

    const numBins = 30;
    const binW = canvasW / numBins;
    const binsRed = new Array(numBins).fill(0);
    const binsBlue = new Array(numBins).fill(0);
    for (const p of particles) {
      const bin = Math.min(numBins - 1, Math.max(0, Math.floor(p.x / canvasW * numBins)));
      if (p.type === 0) binsRed[bin]++;
      else binsBlue[bin]++;
    }
    const maxBin = Math.max(1, ...binsRed, ...binsBlue);

    for (let i = 0; i < numBins; i++) {
      const bx = i * binW;
      // Red bars
      const rh = (binsRed[i] / maxBin) * (histH - 20);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.fillRect(bx + 1, histY + histH - rh - 2, binW / 2 - 1, rh);
      // Blue bars
      const bh = (binsBlue[i] / maxBin) * (histH - 20);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.7)';
      ctx.fillRect(bx + binW / 2, histY + histH - bh - 2, binW / 2 - 1, bh);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Concentration Distribution', 8, histY + 13);

    // Legend
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(canvasW - 120, histY + 5, 10, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Red', canvasW - 106, histY + 14);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(canvasW - 70, histY + 5, 10, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Blue', canvasW - 56, histY + 14);

    // --- MSD vs Time chart ---
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, msdY, canvasW, msdH);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(0, msdY, canvasW, msdH);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Mean Squared Displacement vs Time', 8, msdY + 13);

    const msdData = msdHistoryRef.current;
    if (msdData.length > 1) {
      const maxMSD = Math.max(1, ...msdData.map(d => d.msd));
      const chartLeft = 5;
      const chartRight = canvasW - 5;
      const chartTop = msdY + 20;
      const chartBottom = msdY + msdH - 5;
      const chartW = chartRight - chartLeft;
      const chartH = chartBottom - chartTop;

      // Draw ideal linear diffusion line
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartBottom);
      ctx.lineTo(chartRight, chartTop);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
      ctx.font = '9px sans-serif';
      ctx.fillText('ideal linear', chartRight - 65, chartTop + 10);

      // Draw MSD curve
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < msdData.length; i++) {
        const px = chartLeft + (i / (msdData.length - 1)) * chartW;
        const py = chartBottom - (msdData[i].msd / maxMSD) * chartH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Current MSD value
      const currentMSD = msdData[msdData.length - 1]?.msd || 0;
      ctx.fillStyle = '#fbbf24';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`MSD: ${currentMSD.toFixed(1)}`, canvasW - 10, msdY + 13);
      ctx.textAlign = 'left';
    }
  }, []);

  const simulate = useCallback(() => {
    const particles = particlesRef.current;
    const curMode = modeRef.current;
    const temp = temperatureRef.current;
    const { w: canvasW, h: canvasH } = canvasSizeRef.current;
    const simH = canvasH * 0.6;
    const midX = canvasW / 2;

    // Brownian motion step: random displacement proportional to sqrt(temperature)
    const stepScale = Math.sqrt(temp) * 1.8;

    for (const p of particles) {
      // Gaussian-like random step using Box-Muller
      const u1 = Math.random();
      const u2 = Math.random();
      const mag = Math.sqrt(-2 * Math.log(u1 + 1e-10));
      const dx = mag * Math.cos(2 * Math.PI * u2) * stepScale;
      const dy = mag * Math.sin(2 * Math.PI * u2) * stepScale;

      let nx = p.x + dx;
      let ny = p.y + dy;

      // Boundary reflection
      if (nx < PARTICLE_RADIUS) nx = PARTICLE_RADIUS;
      if (nx > canvasW - PARTICLE_RADIUS) nx = canvasW - PARTICLE_RADIUS;
      if (ny < PARTICLE_RADIUS) ny = PARTICLE_RADIUS;
      if (ny > simH - PARTICLE_RADIUS) ny = simH - PARTICLE_RADIUS;

      // Membrane collision for gradient mode
      if (curMode === MODES.GRADIENT && !membraneOpenRef.current) {
        // Block crossing the membrane
        if ((p.x < midX && nx >= midX) || (p.x > midX && nx <= midX)) {
          nx = p.x; // bounce back
        }
      } else if (curMode === MODES.GRADIENT && membraneOpenRef.current) {
        // Semi-permeable: allow through gaps only
        const gapSize = 20;
        const numGaps = 5;
        const segmentH = simH / numGaps;
        if ((p.x < midX && nx >= midX) || (p.x > midX && nx <= midX)) {
          let canPass = false;
          for (let i = 0; i < numGaps; i++) {
            const gapStart = i * segmentH + segmentH - gapSize;
            const gapEnd = i * segmentH + segmentH;
            if (ny >= gapStart && ny <= gapEnd) {
              canPass = true;
              break;
            }
          }
          if (!canPass) nx = p.x;
        }
      }

      p.x = nx;
      p.y = ny;
    }

    // Compute MSD
    let totalSqDisp = 0;
    for (const p of particles) {
      const dx = p.x - p.startX;
      const dy = p.y - p.startY;
      totalSqDisp += dx * dx + dy * dy;
    }
    const msd = totalSqDisp / particles.length;

    frameRef.current++;
    const frame = frameRef.current;

    // Record MSD every 5 frames, keep last 200 points
    if (frame % 5 === 0) {
      msdHistoryRef.current.push({ time: frame, msd });
      if (msdHistoryRef.current.length > 200) {
        msdHistoryRef.current.shift();
      }
    }

    setElapsedTime(frame);
    drawFrame(particles, canvasW, canvasH, frame);

    animationRef.current = requestAnimationFrame(simulate);
  }, [drawFrame]);

  // Start/stop loop
  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(simulate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, simulate]);

  // Initialize on mount and handle resize
  useEffect(() => {
    const handleResize = () => {
      const { w, h } = getCanvasSize();
      canvasSizeRef.current = { w, h };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
      }
      if (!isRunning) {
        drawFrame(particlesRef.current, w, h, frameRef.current);
      }
    };

    handleResize();
    resetSimulation();
    setIsRunning(true);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when mode or particle count changes
  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  const applyPreset = useCallback((name) => {
    const preset = PRESETS[name];
    if (!preset) return;
    setMode(preset.mode);
    setParticleCount(preset.particleCount);
    setTemperature(preset.temperature);
  }, []);

  const handleToggleMembrane = useCallback(() => {
    setMembraneOpen(prev => {
      membraneOpenRef.current = !prev;
      return !prev;
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls */}
        <div className="lg:w-72 space-y-4">
          {/* Presets */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Presets</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map(name => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Mode</h3>
            <div className="flex flex-col gap-2">
              {Object.values(MODES).map(m => (
                <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio" name="mode" value={m} checked={mode === m}
                    onChange={() => setMode(m)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  {m}
                </label>
              ))}
            </div>
            {mode === MODES.GRADIENT && (
              <button
                onClick={handleToggleMembrane}
                className={`mt-3 w-full px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  membraneOpen
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {membraneOpen ? 'Membrane Open' : 'Open Membrane'}
              </button>
            )}
          </div>

          {/* Parameters */}
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Parameters</h3>
            <SliderControl
              label="Particles" min={100} max={2000} step={50}
              value={particleCount} onChange={setParticleCount}
            />
            <SliderControl
              label="Temperature" min={0.1} max={3.0} step={0.1}
              value={temperature} onChange={setTemperature}
            />
          </div>

          {/* Playback */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Playback</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(r => !r)}
                className={`flex-1 px-4 py-2 rounded font-medium text-white text-sm transition-colors ${
                  isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRunning ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={resetSimulation}
                className="flex-1 px-4 py-2 rounded font-medium text-white text-sm bg-gray-500 hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Frame: {elapsedTime}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Info</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle" />
                Red particles: {particlesRef.current.filter(p => p.type === 0).length}
              </p>
              <p>
                <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-1 align-middle" />
                Blue particles: {particlesRef.current.filter(p => p.type === 1).length}
              </p>
              <p className="mt-2 text-gray-500">
                MSD grows linearly with time for true diffusion (D = MSD / 4t in 2D).
              </p>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <canvas
              ref={canvasRef}
              className="w-full block"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>
      <KeyboardShortcutHint showReset={false} />
    </div>
  );
};

export default DiffusionSimulationVisualizer;
