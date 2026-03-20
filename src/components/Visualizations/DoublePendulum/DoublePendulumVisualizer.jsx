import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';

const PRESETS = {
  symmetric: {
    label: 'Symmetric',
    m1: 2, m2: 2, L1: 120, L2: 120, gravity: 9.8,
    angle1: 90, angle2: 90, damping: 0, trailLength: 200,
  },
  asymmetric: {
    label: 'Asymmetric',
    m1: 3, m2: 1, L1: 150, L2: 80, gravity: 9.8,
    angle1: 120, angle2: -60, damping: 0, trailLength: 300,
  },
  highEnergy: {
    label: 'High Energy',
    m1: 2, m2: 2, L1: 100, L2: 100, gravity: 9.8,
    angle1: 170, angle2: -170, damping: 0, trailLength: 400,
  },
  butterflyEffect: {
    label: 'Butterfly Effect',
    m1: 2, m2: 2, L1: 120, L2: 120, gravity: 9.8,
    angle1: 90, angle2: 90, damping: 0, trailLength: 300,
    compare: true, angleDiff: 0.5,
  },
};

const DEG = Math.PI / 180;

const DoublePendulumVisualizer = () => {
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(2);
  const [L1, setL1] = useState(120);
  const [L2, setL2] = useState(120);
  const [gravity, setGravity] = useState(9.8);
  const [initAngle1, setInitAngle1] = useState(90);
  const [initAngle2, setInitAngle2] = useState(90);
  const [trailLength, setTrailLength] = useState(200);
  const [damping, setDamping] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [compareMode, setCompareMode] = useState(false);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef(null);    // primary pendulum state {th1, th2, w1, w2}
  const state2Ref = useRef(null);   // compare pendulum state
  const trail1Ref = useRef([]);
  const trail2Ref = useRef([]);
  const timeRef = useRef(0);
  const statsRef = useRef({ th1: 0, th2: 0, w1: 0, w2: 0, energy: 0 });
  const [stats, setStats] = useState({ th1: 0, th2: 0, w1: 0, w2: 0, energy: 0 });
  const statsCounterRef = useRef(0);

  useVisualizationShortcuts({ onTogglePlay: () => setIsRunning(r => !r) });

  // ---- Physics: Lagrangian equations of motion for double pendulum ----
  const computeDerivatives = useCallback((st, params) => {
    const { th1, th2, w1, w2 } = st;
    const { m1: pm1, m2: pm2, L1: pL1, L2: pL2, g, damp } = params;
    const delta = th1 - th2;
    const sinD = Math.sin(delta);
    const cosD = Math.cos(delta);
    const M = pm1 + pm2;

    const den1 = M * pL1 - pm2 * pL1 * cosD * cosD;
    const den2 = (pL2 / pL1) * den1;

    const a1 = (pm2 * pL1 * w1 * w1 * sinD * cosD
      + pm2 * g * Math.sin(th2) * cosD
      + pm2 * pL2 * w2 * w2 * sinD
      - M * g * Math.sin(th1)) / den1;

    const a2 = (-pm2 * pL2 * w2 * w2 * sinD * cosD
      + M * g * Math.sin(th1) * cosD
      - M * pL1 * w1 * w1 * sinD
      - M * g * Math.sin(th2)) / den2;

    return {
      dth1: w1,
      dth2: w2,
      dw1: a1 - damp * w1,
      dw2: a2 - damp * w2,
    };
  }, []);

  // Runge-Kutta 4th order integration step
  const rk4Step = useCallback((st, dt, params) => {
    const k1 = computeDerivatives(st, params);
    const s2 = {
      th1: st.th1 + k1.dth1 * dt / 2,
      th2: st.th2 + k1.dth2 * dt / 2,
      w1: st.w1 + k1.dw1 * dt / 2,
      w2: st.w2 + k1.dw2 * dt / 2,
    };
    const k2 = computeDerivatives(s2, params);
    const s3 = {
      th1: st.th1 + k2.dth1 * dt / 2,
      th2: st.th2 + k2.dth2 * dt / 2,
      w1: st.w1 + k2.dw1 * dt / 2,
      w2: st.w2 + k2.dw2 * dt / 2,
    };
    const k3 = computeDerivatives(s3, params);
    const s4 = {
      th1: st.th1 + k3.dth1 * dt,
      th2: st.th2 + k3.dth2 * dt,
      w1: st.w1 + k3.dw1 * dt,
      w2: st.w2 + k3.dw2 * dt,
    };
    const k4 = computeDerivatives(s4, params);

    return {
      th1: st.th1 + (k1.dth1 + 2 * k2.dth1 + 2 * k3.dth1 + k4.dth1) * dt / 6,
      th2: st.th2 + (k1.dth2 + 2 * k2.dth2 + 2 * k3.dth2 + k4.dth2) * dt / 6,
      w1: st.w1 + (k1.dw1 + 2 * k2.dw1 + 2 * k3.dw1 + k4.dw1) * dt / 6,
      w2: st.w2 + (k1.dw2 + 2 * k2.dw2 + 2 * k3.dw2 + k4.dw2) * dt / 6,
    };
  }, [computeDerivatives]);

  // Total energy (KE + PE)
  const computeEnergy = useCallback((st, params) => {
    const { th1, th2, w1, w2 } = st;
    const { m1: pm1, m2: pm2, L1: pL1, L2: pL2, g } = params;
    const cosD = Math.cos(th1 - th2);
    const KE = 0.5 * pm1 * pL1 * pL1 * w1 * w1
      + 0.5 * pm2 * (pL1 * pL1 * w1 * w1 + pL2 * pL2 * w2 * w2
        + 2 * pL1 * pL2 * w1 * w2 * cosD);
    const PE = -(pm1 + pm2) * g * pL1 * Math.cos(th1)
      - pm2 * g * pL2 * Math.cos(th2);
    return { KE, PE, total: KE + PE };
  }, []);

  // Convert pendulum bob positions
  const getBobPositions = useCallback((st, params, cx, cy) => {
    const x1 = cx + params.L1 * Math.sin(st.th1);
    const y1 = cy + params.L1 * Math.cos(st.th1);
    const x2 = x1 + params.L2 * Math.sin(st.th2);
    const y2 = y1 + params.L2 * Math.cos(st.th2);
    return { x1, y1, x2, y2 };
  }, []);

  // ---- Initialization ----
  const initState = useCallback((angle1Deg, angle2Deg) => {
    return {
      th1: angle1Deg * DEG,
      th2: angle2Deg * DEG,
      w1: 0,
      w2: 0,
    };
  }, []);

  const resetSimulation = useCallback(() => {
    stateRef.current = initState(initAngle1, initAngle2);
    if (compareMode) {
      state2Ref.current = initState(initAngle1 + 0.5, initAngle2 + 0.5);
    } else {
      state2Ref.current = null;
    }
    trail1Ref.current = [];
    trail2Ref.current = [];
    timeRef.current = 0;
    statsCounterRef.current = 0;
  }, [initAngle1, initAngle2, compareMode, initState]);

  // Reset on parameter change
  useEffect(() => {
    resetSimulation();
    if (!isRunning) {
      drawFrame();
    }
  }, [m1, m2, L1, L2, gravity, initAngle1, initAngle2, damping, compareMode, trailLength]);

  // ---- Canvas resize ----
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = Math.max(500, (L1 + L2) * 1.4 + 160);
      if (!isRunning) drawFrame();
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [L1, L2]);

  // ---- Animation loop ----
  useEffect(() => {
    if (isRunning) {
      let lastTs = performance.now();
      const step = (ts) => {
        const dtReal = Math.min((ts - lastTs) / 1000, 0.04);
        lastTs = ts;
        const params = { m1, m2, L1, L2, g: gravity, damp: damping };
        // Substep for stability
        const nSub = 4;
        const dtSub = dtReal / nSub;
        for (let i = 0; i < nSub; i++) {
          stateRef.current = rk4Step(stateRef.current, dtSub, params);
          if (state2Ref.current) {
            state2Ref.current = rk4Step(state2Ref.current, dtSub, params);
          }
        }
        timeRef.current += dtReal;

        // Record trail points
        const canvas = canvasRef.current;
        if (canvas) {
          const cx = compareMode ? canvas.width / 4 : canvas.width / 2;
          const cy = 80;
          const pos = getBobPositions(stateRef.current, params, cx, cy);
          trail1Ref.current.push({ x: pos.x2, y: pos.y2, t: timeRef.current });
          if (trail1Ref.current.length > trailLength) trail1Ref.current.shift();

          if (state2Ref.current) {
            const cx2 = (3 * canvas.width) / 4;
            const pos2 = getBobPositions(state2Ref.current, params, cx2, cy);
            trail2Ref.current.push({ x: pos2.x2, y: pos2.y2, t: timeRef.current });
            if (trail2Ref.current.length > trailLength) trail2Ref.current.shift();
          }
        }

        // Update stats (throttled)
        statsCounterRef.current++;
        if (statsCounterRef.current % 6 === 0) {
          const e = computeEnergy(stateRef.current, params);
          const s = stateRef.current;
          setStats({
            th1: (s.th1 / DEG).toFixed(1),
            th2: (s.th2 / DEG).toFixed(1),
            w1: s.w1.toFixed(2),
            w2: s.w2.toFixed(2),
            energy: e.total.toFixed(1),
            KE: e.KE.toFixed(1),
            PE: e.PE.toFixed(1),
          });
        }

        drawFrame();
        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, m1, m2, L1, L2, gravity, damping, compareMode, trailLength, rk4Step, getBobPositions, computeEnergy]);

  // ---- Drawing ----
  const drawPendulum = useCallback((ctx, st, params, cx, cy, trail, colorOffset) => {
    const pos = getBobPositions(st, params, cx, cy);
    const bobRadius1 = 6 + params.m1 * 2;
    const bobRadius2 = 6 + params.m2 * 2;

    // Draw trail
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        const hue = (colorOffset + (trail[i].t * 60) % 360) % 360;
        ctx.strokeStyle = `hsla(${hue}, 85%, 55%, ${alpha * 0.8})`;
        ctx.lineWidth = 1.5 + alpha;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
    }

    // Draw arms
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pos.x1, pos.y1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pos.x1, pos.y1);
    ctx.lineTo(pos.x2, pos.y2);
    ctx.stroke();

    // Draw pivot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#666';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw bob 1
    const grad1 = ctx.createRadialGradient(pos.x1 - 2, pos.y1 - 2, 1, pos.x1, pos.y1, bobRadius1);
    grad1.addColorStop(0, '#6ec6ff');
    grad1.addColorStop(0.7, '#2196f3');
    grad1.addColorStop(1, '#0d47a1');
    ctx.beginPath();
    ctx.arc(pos.x1, pos.y1, bobRadius1, 0, Math.PI * 2);
    ctx.fillStyle = grad1;
    ctx.fill();
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw bob 2
    const grad2 = ctx.createRadialGradient(pos.x2 - 2, pos.y2 - 2, 1, pos.x2, pos.y2, bobRadius2);
    grad2.addColorStop(0, '#ff8a65');
    grad2.addColorStop(0.7, '#f44336');
    grad2.addColorStop(1, '#b71c1c');
    ctx.beginPath();
    ctx.arc(pos.x2, pos.y2, bobRadius2, 0, Math.PI * 2);
    ctx.fillStyle = grad2;
    ctx.fill();
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Highlight reflections
    ctx.beginPath();
    ctx.arc(pos.x1 - 3, pos.y1 - 3, bobRadius1 * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pos.x2 - 3, pos.y2 - 3, bobRadius2 * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
  }, [getBobPositions]);

  const drawEnergyBar = useCallback((ctx, st, params, x, y, w, h) => {
    const e = computeEnergy(st, params);
    const maxE = (params.m1 + params.m2) * params.g * (params.L1 + params.L2) * 1.2;
    const keRatio = Math.max(0, e.KE) / maxE;
    const peRatio = Math.max(0, e.PE + (params.m1 + params.m2) * params.g * (params.L1 + params.L2)) / maxE;

    // Background
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(x, y, w, h);

    // KE
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x, y, w * Math.min(keRatio, 1), h / 2);

    // PE (shifted)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x, y + h / 2, w * Math.min(peRatio, 1), h / 2);

    // Border
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('KE', x + 3, y + h / 2 - 3);
    ctx.fillText('PE', x + 3, y + h - 3);
  }, [computeEnergy]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const params = { m1, m2, L1, L2, g: gravity, damp: damping };

    // Clear
    const bg = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, height);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    if (!stateRef.current) return;

    if (compareMode && state2Ref.current) {
      // Divider
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Pendulum A', width / 4, 30);
      ctx.fillText('Pendulum B (+0.5\u00b0)', (3 * width) / 4, 30);

      const cy = 80;
      drawPendulum(ctx, stateRef.current, params, width / 4, cy, trail1Ref.current, 0);
      drawPendulum(ctx, state2Ref.current, params, (3 * width) / 4, cy, trail2Ref.current, 180);

      // Energy bars
      drawEnergyBar(ctx, stateRef.current, params, 20, height - 50, width / 2 - 40, 30);
      drawEnergyBar(ctx, state2Ref.current, params, width / 2 + 20, height - 50, width / 2 - 40, 30);
    } else {
      const cx = width / 2;
      const cy = 80;
      drawPendulum(ctx, stateRef.current, params, cx, cy, trail1Ref.current, 0);

      // Energy bar
      drawEnergyBar(ctx, stateRef.current, params, 20, height - 50, width - 40, 30);
    }

    // Time display
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`t = ${timeRef.current.toFixed(1)}s`, width - 15, 25);
  }, [m1, m2, L1, L2, gravity, damping, compareMode, drawPendulum, drawEnergyBar]);

  // ---- Preset loading ----
  const loadPreset = useCallback((key) => {
    const p = PRESETS[key];
    setIsRunning(false);
    setM1(p.m1);
    setM2(p.m2);
    setL1(p.L1);
    setL2(p.L2);
    setGravity(p.gravity);
    setInitAngle1(p.angle1);
    setInitAngle2(p.angle2);
    setDamping(p.damping);
    setTrailLength(p.trailLength);
    setCompareMode(!!p.compare);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    // We need a slight delay so state updates propagate before resetSimulation runs in the effect
    setTimeout(() => {
      resetSimulation();
      drawFrame();
    }, 0);
  }, [resetSimulation, drawFrame]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Double Pendulum Chaos Visualizer</h2>
            <p className="text-gray-600 max-w-3xl">
              Watch how a double pendulum exhibits chaotic motion. Tiny changes in initial conditions
              lead to wildly different trajectories, illustrating the butterfly effect.
            </p>
          </div>

          <div className="flex space-x-3 mt-2 sm:mt-0">
            <button
              onClick={() => setIsRunning(!isRunning)}
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

        {/* Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Presets</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => loadPreset(key)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Column 1: Masses and lengths */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mass 1: {m1.toFixed(1)} kg
              </label>
              <input type="range" min="0.5" max="5" step="0.1" value={m1}
                onChange={(e) => setM1(parseFloat(e.target.value))} className="w-full" disabled={isRunning} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mass 2: {m2.toFixed(1)} kg
              </label>
              <input type="range" min="0.5" max="5" step="0.1" value={m2}
                onChange={(e) => setM2(parseFloat(e.target.value))} className="w-full" disabled={isRunning} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Length 1: {L1} px
              </label>
              <input type="range" min="50" max="200" value={L1}
                onChange={(e) => setL1(parseInt(e.target.value))} className="w-full" disabled={isRunning} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Length 2: {L2} px
              </label>
              <input type="range" min="50" max="200" value={L2}
                onChange={(e) => setL2(parseInt(e.target.value))} className="w-full" disabled={isRunning} />
            </div>
          </div>

          {/* Column 2: Angles and gravity */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Angle 1: {initAngle1}&deg;
              </label>
              <input type="range" min="-180" max="180" value={initAngle1}
                onChange={(e) => setInitAngle1(parseInt(e.target.value))} className="w-full" disabled={isRunning} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Angle 2: {initAngle2}&deg;
              </label>
              <input type="range" min="-180" max="180" value={initAngle2}
                onChange={(e) => setInitAngle2(parseInt(e.target.value))} className="w-full" disabled={isRunning} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gravity: {gravity.toFixed(1)} m/s&sup2;
              </label>
              <input type="range" min="1" max="20" step="0.1" value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))} className="w-full" disabled={isRunning} />
            </div>
          </div>

          {/* Column 3: Trail, damping, compare */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trail Length: {trailLength} points
              </label>
              <input type="range" min="0" max="500" value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Damping: {damping.toFixed(3)}
              </label>
              <input type="range" min="0" max="0.1" step="0.001" value={damping}
                onChange={(e) => setDamping(parseFloat(e.target.value))} className="w-full" disabled={isRunning} />
              <p className="text-xs text-gray-500">0 = no damping (energy conserved)</p>
            </div>
            <div className="flex items-center mt-2">
              <input type="checkbox" id="compareMode" checked={compareMode}
                onChange={() => setCompareMode(!compareMode)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isRunning} />
              <label htmlFor="compareMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Compare Mode (two pendulums, +0.5&deg; offset)
              </label>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Angle 1</p>
            <p className="text-lg font-mono font-bold text-blue-600">{stats.th1}&deg;</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Angle 2</p>
            <p className="text-lg font-mono font-bold text-red-600">{stats.th2}&deg;</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">&omega;1 / &omega;2</p>
            <p className="text-lg font-mono font-bold text-gray-700 dark:text-gray-300">{stats.w1} / {stats.w2}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Energy</p>
            <p className="text-lg font-mono font-bold text-green-600">{stats.energy}</p>
            <p className="text-xs text-gray-400">KE: {stats.KE || '0.0'} | PE: {stats.PE || '0.0'}</p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:shadow-gray-900 mb-6">
        <div className="w-full" style={{ minHeight: '500px' }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
      <KeyboardShortcutHint showReset={false} />
    </div>
  );
};

export default DoublePendulumVisualizer;
