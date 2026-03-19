import React, { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = {
  single: {
    label: 'Single Oscillator',
    numMasses: 1,
    springK: 20,
    damping: 0,
    massValue: 1.0,
    displacements: [80],
    velocities: [0],
  },
  twoCoupled: {
    label: 'Two Coupled',
    numMasses: 2,
    springK: 20,
    damping: 0,
    massValue: 1.0,
    displacements: [60, 0],
    velocities: [0, 0],
  },
  normalMode1: {
    label: 'Normal Mode 1',
    numMasses: 3,
    springK: 20,
    damping: 0,
    massValue: 1.0,
    displacements: [40, 40, 40],
    velocities: [0, 0, 0],
  },
  normalMode2: {
    label: 'Normal Mode 2',
    numMasses: 3,
    springK: 20,
    damping: 0,
    massValue: 1.0,
    displacements: [50, 0, -50],
    velocities: [0, 0, 0],
  },
  wavePulse: {
    label: 'Wave Pulse',
    numMasses: 5,
    springK: 30,
    damping: 0.1,
    massValue: 1.0,
    displacements: [80, 0, 0, 0, 0],
    velocities: [0, 0, 0, 0, 0],
  },
};

const MASS_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7'];

const SpringMassSystemVisualizer = () => {
  const [numMasses, setNumMasses] = useState(2);
  const [springK, setSpringK] = useState(20);
  const [damping, setDamping] = useState(0);
  const [massValue, setMassValue] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [showGraph, setShowGraph] = useState(true);

  const canvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef(null);
  const historyRef = useRef([]);
  const timeRef = useRef(0);
  const energyRef = useRef({ kinetic: 0, potential: 0 });
  const [energy, setEnergy] = useState({ kinetic: 0, potential: 0 });
  const dragRef = useRef({ active: false, massIndex: -1 });
  const paramsRef = useRef({ numMasses: 2, springK: 20, damping: 0, massValue: 1.0 });
  const canvasContainerRef = useRef(null);

  // Keep params ref in sync
  useEffect(() => {
    paramsRef.current = { numMasses, springK, damping, massValue };
  }, [numMasses, springK, damping, massValue]);

  // Equilibrium position for mass i (0-indexed)
  const getEquilibriumX = useCallback((i, n, canvasWidth) => {
    const wallX = 50;
    const spacing = (canvasWidth - 100) / (n + 1);
    return wallX + spacing * (i + 1);
  }, []);

  // Initialize state
  const initState = useCallback((n, displacements, velocities) => {
    const positions = new Float64Array(n);
    const vels = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      positions[i] = displacements && displacements[i] ? displacements[i] : 0;
      vels[i] = velocities && velocities[i] ? velocities[i] : 0;
    }
    return { positions, velocities: vels };
  }, []);

  // Compute accelerations using Hooke's law for coupled springs
  const computeAccelerations = useCallback((positions, velocities, k, m, damp, n) => {
    const acc = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      // Spring to the left (wall or previous mass)
      const leftDisp = i === 0 ? positions[i] : (positions[i] - positions[i - 1]);
      // Spring to the right (if exists)
      let force = -k * leftDisp;
      if (i < n - 1) {
        const rightDisp = positions[i + 1] - positions[i];
        force += k * rightDisp;
      }
      // Damping
      force -= damp * velocities[i];
      acc[i] = force / m;
    }
    return acc;
  }, []);

  // Velocity Verlet integration step
  const verletStep = useCallback((state, dt, params) => {
    const { positions, velocities } = state;
    const { springK: k, massValue: m, damping: damp, numMasses: n } = params;
    const newPos = new Float64Array(n);
    const newVel = new Float64Array(n);

    const acc = computeAccelerations(positions, velocities, k, m, damp, n);

    // Update positions
    for (let i = 0; i < n; i++) {
      newPos[i] = positions[i] + velocities[i] * dt + 0.5 * acc[i] * dt * dt;
    }

    // Compute new accelerations
    const newAcc = computeAccelerations(newPos, velocities, k, m, damp, n);

    // Update velocities
    for (let i = 0; i < n; i++) {
      newVel[i] = velocities[i] + 0.5 * (acc[i] + newAcc[i]) * dt;
    }

    return { positions: newPos, velocities: newVel };
  }, [computeAccelerations]);

  // Compute energy
  const computeEnergy = useCallback((state, params) => {
    const { positions, velocities } = state;
    const { springK: k, massValue: m, numMasses: n } = params;
    let kinetic = 0;
    let potential = 0;
    for (let i = 0; i < n; i++) {
      kinetic += 0.5 * m * velocities[i] * velocities[i];
      const leftDisp = i === 0 ? positions[i] : (positions[i] - positions[i - 1]);
      potential += 0.5 * k * leftDisp * leftDisp;
    }
    return { kinetic, potential };
  }, []);

  // Reset simulation
  const resetSimulation = useCallback((displacements, velocities) => {
    const n = paramsRef.current.numMasses;
    stateRef.current = initState(n, displacements, velocities);
    historyRef.current = [];
    timeRef.current = 0;
    const e = computeEnergy(stateRef.current, paramsRef.current);
    energyRef.current = e;
    setEnergy(e);
  }, [initState, computeEnergy]);

  // Initialize on mount and when numMasses changes
  const mountedRef = useRef(false);
  useEffect(() => {
    resetSimulation();
    if (!mountedRef.current) {
      // Auto-start on first mount
      mountedRef.current = true;
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [numMasses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Draw a zigzag spring between two x-coordinates at a given y
  const drawSpring = useCallback((ctx, x1, x2, y, coils = 12) => {
    const len = x2 - x1;
    const coilWidth = Math.min(14, Math.max(4, 80 / Math.max(1, Math.abs(len / 30))));
    const segLen = len / (coils * 2 + 2);

    ctx.beginPath();
    ctx.moveTo(x1, y);
    // Lead-in
    ctx.lineTo(x1 + segLen, y);

    for (let i = 0; i < coils; i++) {
      const baseX = x1 + segLen + i * 2 * segLen;
      const dir = i % 2 === 0 ? -1 : 1;
      ctx.lineTo(baseX + segLen, y + dir * coilWidth);
      ctx.lineTo(baseX + 2 * segLen, y - dir * coilWidth);
    }

    // Lead-out
    ctx.lineTo(x2 - segLen, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }, []);

  // Draw the main visualization
  const drawScene = useCallback((canvas, state) => {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const n = paramsRef.current.numMasses;
    const midY = H / 2;
    const massRadius = 20;
    const wallX = 50;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Wall
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, wallX, H);
    // Wall hatch marks
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    for (let hy = 10; hy < H; hy += 15) {
      ctx.beginPath();
      ctx.moveTo(wallX - 12, hy);
      ctx.lineTo(wallX, hy - 12);
      ctx.stroke();
    }

    // Draw floor line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(wallX, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (!state) return;

    // Draw springs and masses
    for (let i = 0; i < n; i++) {
      const eqX = getEquilibriumX(i, n, W);
      const massX = eqX + state.positions[i];
      const prevX = i === 0
        ? wallX
        : getEquilibriumX(i - 1, n, W) + state.positions[i - 1];
      const springStartX = i === 0 ? wallX : prevX + massRadius;
      const springEndX = massX - massRadius;

      // Draw spring
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      if (springEndX > springStartX + 5) {
        drawSpring(ctx, springStartX, springEndX, midY);
      } else {
        // Compressed: draw a thick line
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(springStartX, midY);
        ctx.lineTo(springEndX, midY);
        ctx.stroke();
      }

      // Draw mass
      const color = MASS_COLORS[i % MASS_COLORS.length];
      ctx.beginPath();
      ctx.arc(massX, midY, massRadius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mass label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`m${i + 1}`, massX, midY);

      // Displacement indicator
      const disp = state.positions[i];
      if (Math.abs(disp) > 2) {
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Arial, sans-serif';
        ctx.fillText(`${disp > 0 ? '+' : ''}${disp.toFixed(1)}`, massX, midY + massRadius + 14);
      }
    }

    // Energy bar
    const e = energyRef.current;
    const total = e.kinetic + e.potential;
    const barX = wallX + 10;
    const barY = H - 40;
    const barW = W - wallX - 30;
    const barH = 18;

    if (total > 0) {
      const kFrac = e.kinetic / total;
      // Potential (blue)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(barX, barY, barW, barH);
      // Kinetic (red) overlay
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, barW * kFrac, barH);
      // Border
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
      // Labels
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`KE`, barX + 4, barY - 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`${e.kinetic.toFixed(1)}`, barX + 22, barY - 5);
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText(`PE`, barX + barW * 0.5, barY - 5);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`${e.potential.toFixed(1)}`, barX + barW * 0.5 + 20, barY - 5);
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'right';
      ctx.fillText(`Total: ${total.toFixed(1)}`, barX + barW, barY - 5);
    }
  }, [getEquilibriumX, drawSpring]);

  // Draw position vs time graph
  const drawGraph = useCallback((canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const n = paramsRef.current.numMasses;
    const history = historyRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, W, H);

    // Axes
    const padL = 45;
    const padR = 15;
    const padT = 15;
    const padB = 25;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const midY = padT + plotH / 2;

    // Grid
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padL, midY);
    ctx.lineTo(padL + plotW, midY);
    ctx.stroke();

    // Y axis
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('x(t)', padL - 5, padT + 5);
    ctx.textAlign = 'center';
    ctx.fillText('time', padL + plotW / 2, H - 3);

    if (history.length < 2) return;

    const maxT = Math.max(5, timeRef.current);
    const startT = Math.max(0, maxT - 10);
    const maxDisp = 120;

    for (let m = 0; m < n; m++) {
      ctx.strokeStyle = MASS_COLORS[m % MASS_COLORS.length];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let j = 0; j < history.length; j++) {
        const entry = history[j];
        if (entry.time < startT) continue;
        const px = padL + ((entry.time - startT) / (maxT - startT)) * plotW;
        const val = entry.positions[m] || 0;
        const py = midY - (val / maxDisp) * (plotH / 2);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // Legend
    for (let m = 0; m < n; m++) {
      ctx.fillStyle = MASS_COLORS[m % MASS_COLORS.length];
      ctx.fillRect(padL + 10 + m * 55, padT + 2, 12, 12);
      ctx.fillStyle = '#334155';
      ctx.font = '11px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`m${m + 1}`, padL + 24 + m * 55, padT + 12);
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const dt = 0.016; // ~60fps
    const subSteps = 4;
    const subDt = dt / subSteps;

    if (stateRef.current && !dragRef.current.active) {
      for (let s = 0; s < subSteps; s++) {
        stateRef.current = verletStep(stateRef.current, subDt, paramsRef.current);
      }
      timeRef.current += dt;

      const e = computeEnergy(stateRef.current, paramsRef.current);
      energyRef.current = e;

      // Record history for graph (throttled)
      if (historyRef.current.length === 0 ||
          timeRef.current - historyRef.current[historyRef.current.length - 1].time > 0.03) {
        historyRef.current.push({
          time: timeRef.current,
          positions: Array.from(stateRef.current.positions),
        });
        // Keep ~350 entries max
        if (historyRef.current.length > 350) {
          historyRef.current = historyRef.current.slice(-300);
        }
      }

      // Update energy display periodically
      if (Math.floor(timeRef.current * 10) % 3 === 0) {
        setEnergy({ ...e });
      }
    }

    // Draw
    const canvas = canvasRef.current;
    if (canvas && stateRef.current) {
      drawScene(canvas, stateRef.current);
    }
    if (showGraph && graphCanvasRef.current) {
      drawGraph(graphCanvasRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [verletStep, computeEnergy, drawScene, drawGraph, showGraph]);

  // Start/stop
  useEffect(() => {
    if (isRunning) {
      if (!stateRef.current) {
        resetSimulation();
      }
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isRunning, animate, resetSimulation]);

  // Draw initial frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && stateRef.current) {
      drawScene(canvas, stateRef.current);
    }
    if (showGraph && graphCanvasRef.current) {
      drawGraph(graphCanvasRef.current);
    }
  }, [drawScene, drawGraph, showGraph]);

  // Resize canvases
  useEffect(() => {
    const resizeCanvases = () => {
      const container = canvasContainerRef.current;
      if (!container) return;
      const w = container.clientWidth;
      if (canvasRef.current) {
        canvasRef.current.width = w;
        canvasRef.current.height = 400;
      }
      if (graphCanvasRef.current) {
        graphCanvasRef.current.width = w;
        graphCanvasRef.current.height = 160;
      }
      if (canvasRef.current && stateRef.current) {
        drawScene(canvasRef.current, stateRef.current);
      }
      if (showGraph && graphCanvasRef.current) {
        drawGraph(graphCanvasRef.current);
      }
    };
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    return () => window.removeEventListener('resize', resizeCanvases);
  }, [drawScene, drawGraph, showGraph]);

  // Mouse interaction for dragging masses
  const getMousePos = useCallback((canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current) return;
    const pos = getMousePos(canvas, e);
    const n = paramsRef.current.numMasses;
    const midY = canvas.height / 2;
    const massRadius = 20;

    for (let i = 0; i < n; i++) {
      const eqX = getEquilibriumX(i, n, canvas.width);
      const massX = eqX + stateRef.current.positions[i];
      const dx = pos.x - massX;
      const dy = pos.y - midY;
      if (dx * dx + dy * dy < (massRadius + 10) * (massRadius + 10)) {
        dragRef.current = { active: true, massIndex: i };
        // Pause velocities while dragging
        for (let j = 0; j < n; j++) {
          stateRef.current.velocities[j] = 0;
        }
        if (!isRunning) {
          setIsRunning(true);
        }
        e.preventDefault();
        return;
      }
    }
  }, [getMousePos, getEquilibriumX, isRunning]);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.active || !stateRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getMousePos(canvas, e);
    const n = paramsRef.current.numMasses;
    const i = dragRef.current.massIndex;
    const eqX = getEquilibriumX(i, n, canvas.width);
    const disp = pos.x - eqX;
    stateRef.current.positions[i] = Math.max(-120, Math.min(120, disp));
    stateRef.current.velocities[i] = 0;
    const en = computeEnergy(stateRef.current, paramsRef.current);
    energyRef.current = en;
    setEnergy({ ...en });
    drawScene(canvas, stateRef.current);
    e.preventDefault();
  }, [getMousePos, getEquilibriumX, computeEnergy, drawScene]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { active: false, massIndex: -1 };
  }, []);

  // Touch support
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
    }
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 1 && dragRef.current.active) {
      const touch = e.touches[0];
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
    }
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const applyPreset = useCallback((key) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setNumMasses(preset.numMasses);
    setSpringK(preset.springK);
    setDamping(preset.damping);
    setMassValue(preset.massValue);

    // Need to defer state init because numMasses setState is async
    setTimeout(() => {
      paramsRef.current = {
        numMasses: preset.numMasses,
        springK: preset.springK,
        damping: preset.damping,
        massValue: preset.massValue,
      };
      stateRef.current = {
        positions: new Float64Array(preset.displacements),
        velocities: new Float64Array(preset.velocities),
      };
      historyRef.current = [];
      timeRef.current = 0;
      const e = computeEnergy(stateRef.current, paramsRef.current);
      energyRef.current = e;
      setEnergy(e);
      if (canvasRef.current) {
        drawScene(canvasRef.current, stateRef.current);
      }
      if (graphCanvasRef.current) {
        drawGraph(graphCanvasRef.current);
      }
    }, 50);
  }, [computeEnergy, drawScene, drawGraph]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Presets */}
        <div className="mb-4">
          <span className="text-sm font-semibold text-gray-600 mr-2">Presets:</span>
          <div className="inline-flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Masses: {numMasses}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={numMasses}
              onChange={(e) => setNumMasses(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Spring k: {springK}
            </label>
            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={springK}
              onChange={(e) => setSpringK(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Damping: {damping.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mass: {massValue.toFixed(1)} kg
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={massValue}
              onChange={(e) => setMassValue(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-5 py-2 rounded-lg font-semibold text-sm text-white transition-colors ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
              }
              resetSimulation();
              setTimeout(() => {
                if (canvasRef.current && stateRef.current) {
                  drawScene(canvasRef.current, stateRef.current);
                }
                if (graphCanvasRef.current) {
                  drawGraph(graphCanvasRef.current);
                }
              }, 20);
            }}
            className="px-5 py-2 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
          <label className="flex items-center gap-2 ml-auto text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showGraph}
              onChange={(e) => setShowGraph(e.target.checked)}
              className="accent-indigo-600"
            />
            Show Graph
          </label>
        </div>

        {/* Canvas */}
        <div ref={canvasContainerRef} className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <div className="absolute top-2 right-2 text-xs text-gray-400">
            Click and drag a mass to displace it
          </div>
        </div>

        {/* Energy display */}
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
            Kinetic: {energy.kinetic.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
            Potential: {energy.potential.toFixed(1)}
          </span>
          <span className="font-semibold">
            Total: {(energy.kinetic + energy.potential).toFixed(1)}
          </span>
        </div>

        {/* Graph */}
        {showGraph && (
          <div className="mt-4">
            <canvas
              ref={graphCanvasRef}
              width={800}
              height={160}
              className="w-full rounded-lg border border-gray-200"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">Position vs. Time</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpringMassSystemVisualizer;
