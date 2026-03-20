import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';
import ShareButton from '../../UI/ShareButton';

const PRESETS = {
  classic: {
    label: 'Classic',
    sigma: 10, rho: 28, beta: 8 / 3, speed: 1, trailLength: 2000,
  },
  periodic: {
    label: 'Periodic',
    sigma: 10, rho: 13, beta: 8 / 3, speed: 1, trailLength: 2000,
  },
  transient: {
    label: 'Transient Chaos',
    sigma: 10, rho: 21, beta: 8 / 3, speed: 1, trailLength: 3000,
  },
  highRho: {
    label: 'High Rho',
    sigma: 10, rho: 99.96, beta: 8 / 3, speed: 0.5, trailLength: 4000,
  },
  custom1: {
    label: 'Wide Wings',
    sigma: 14, rho: 28, beta: 3, speed: 1, trailLength: 2500,
  },
};

const LorenzAttractorVisualizer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const p = (k, d) => { const v = searchParams.get(k); return v !== null ? Number(v) : d; };

  const [sigma, setSigma] = useState(() => p('sigma', 10));
  const [rho, setRho] = useState(() => p('rho', 28));
  const [beta, setBeta] = useState(() => p('beta', 8 / 3));
  const [speed, setSpeed] = useState(() => p('speed', 1));
  const [trailLength, setTrailLength] = useState(() => p('trail', 2000));
  const [isRunning, setIsRunning] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const buildShareURL = useCallback(() => {
    const params = new URLSearchParams();
    params.set('sigma', sigma);
    params.set('rho', rho);
    params.set('beta', beta.toFixed(4));
    params.set('speed', speed);
    params.set('trail', trailLength);
    return `${window.location.origin}${window.location.pathname}?${params}`;
  }, [sigma, rho, beta, speed, trailLength]);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const pointsRef = useRef([]);
  const currentRef = useRef({ x: 0.1, y: 0, z: 0 });
  const rotationRef = useRef({ angleY: 0.4, angleX: -0.3 });
  const timeRef = useRef(0);
  const statsRef = useRef({ x: 0.1, y: 0, z: 0 });
  const [stats, setStats] = useState({ x: '0.1', y: '0.0', z: '0.0' });
  const statsCounterRef = useRef(0);

  useVisualizationShortcuts({ onTogglePlay: () => setIsRunning(r => !r) });

  // Lorenz system derivatives
  const lorenzDerivatives = useCallback((x, y, z, s, r, b) => {
    return {
      dx: s * (y - x),
      dy: x * (r - z) - y,
      dz: x * y - b * z,
    };
  }, []);

  // RK4 integration step
  const rk4Step = useCallback((state, dt, s, r, b) => {
    const { x, y, z } = state;

    const k1 = lorenzDerivatives(x, y, z, s, r, b);
    const k2 = lorenzDerivatives(
      x + k1.dx * dt / 2, y + k1.dy * dt / 2, z + k1.dz * dt / 2, s, r, b
    );
    const k3 = lorenzDerivatives(
      x + k2.dx * dt / 2, y + k2.dy * dt / 2, z + k2.dz * dt / 2, s, r, b
    );
    const k4 = lorenzDerivatives(
      x + k3.dx * dt, y + k3.dy * dt, z + k3.dz * dt, s, r, b
    );

    return {
      x: x + (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx) * dt / 6,
      y: y + (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy) * dt / 6,
      z: z + (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz) * dt / 6,
    };
  }, [lorenzDerivatives]);

  // 3D to 2D projection with rotation
  const project = useCallback((x, y, z, angleY, angleX, cx, cy, scale) => {
    // Rotate around Y axis
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const rx = x * cosY - z * sinY;
    const rz = x * sinY + z * cosY;

    // Rotate around X axis
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const ry = y * cosX - rz * sinX;
    const rz2 = y * sinX + rz * cosX;

    // Simple perspective projection
    const perspective = 300 / (300 + rz2);
    const px = cx + rx * scale * perspective;
    const py = cy - ry * scale * perspective;

    return { px, py, depth: rz2 };
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    currentRef.current = { x: 0.1, y: 0, z: 0 };
    pointsRef.current = [];
    timeRef.current = 0;
    statsCounterRef.current = 0;
  }, []);

  // Reset on parameter change
  useEffect(() => {
    resetSimulation();
  }, [sigma, rho, beta]);

  // Canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const container = canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = 500;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Animation loop
  useEffect(() => {
    let lastTs = performance.now();

    const step = (ts) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      const dtReal = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;

      if (isRunning) {
        // Integration substeps
        const stepsPerFrame = Math.round(20 * speed);
        const dt = 0.005;
        for (let i = 0; i < stepsPerFrame; i++) {
          currentRef.current = rk4Step(currentRef.current, dt, sigma, rho, beta);
          timeRef.current += dt;

          pointsRef.current.push({
            x: currentRef.current.x,
            y: currentRef.current.y,
            z: currentRef.current.z,
          });
        }

        // Trim trail
        while (pointsRef.current.length > trailLength) {
          pointsRef.current.shift();
        }

        // Auto-rotate
        if (autoRotate) {
          rotationRef.current.angleY += dtReal * 0.3;
        }

        // Update stats (throttled)
        statsCounterRef.current++;
        if (statsCounterRef.current % 6 === 0) {
          const c = currentRef.current;
          setStats({
            x: c.x.toFixed(2),
            y: c.y.toFixed(2),
            z: c.z.toFixed(2),
          });
        }
      }

      // Draw
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Background
      const bg = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, height);
      bg.addColorStop(0, '#1a1a2e');
      bg.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 20;
      const scale = 6;
      const { angleY, angleX } = rotationRef.current;
      const points = pointsRef.current;

      // Draw trail
      if (points.length > 1) {
        for (let i = 1; i < points.length; i++) {
          const p0 = project(points[i - 1].x, points[i - 1].y, points[i - 1].z - 25, angleY, angleX, cx, cy, scale);
          const p1 = project(points[i].x, points[i].y, points[i].z - 25, angleY, angleX, cx, cy, scale);

          const t = i / points.length;
          // HSL gradient: old = blue (240), new = red/orange (0-30)
          const hue = 240 - t * 240;
          const lightness = 40 + t * 20;
          const alpha = 0.1 + t * 0.85;
          const lineWidth = 0.5 + t * 2;

          ctx.strokeStyle = `hsla(${hue}, 90%, ${lightness}%, ${alpha})`;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(p0.px, p0.py);
          ctx.lineTo(p1.px, p1.py);
          ctx.stroke();
        }
      }

      // Draw current point as glowing dot
      if (points.length > 0) {
        const cur = currentRef.current;
        const pc = project(cur.x, cur.y, cur.z - 25, angleY, angleX, cx, cy, scale);

        // Outer glow
        const glow = ctx.createRadialGradient(pc.px, pc.py, 0, pc.px, pc.py, 20);
        glow.addColorStop(0, 'rgba(255, 100, 50, 0.8)');
        glow.addColorStop(0.3, 'rgba(255, 100, 50, 0.3)');
        glow.addColorStop(1, 'rgba(255, 100, 50, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pc.px, pc.py, 20, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(pc.px, pc.py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw subtle axes
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      const axisLen = 30;
      const axes = [
        { x: axisLen, y: 0, z: 0, label: 'X' },
        { x: 0, y: axisLen, z: 0, label: 'Y' },
        { x: 0, y: 0, z: axisLen, label: 'Z' },
      ];
      const origin = project(0, 0, -25, angleY, angleX, cx, cy, scale);
      for (const axis of axes) {
        const end = project(axis.x, axis.y, axis.z - 25, angleY, angleX, cx, cy, scale);
        ctx.beginPath();
        ctx.moveTo(origin.px, origin.py);
        ctx.lineTo(end.px, end.py);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Time display
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`t = ${timeRef.current.toFixed(1)}`, width - 15, 25);

      ctx.restore();
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, sigma, rho, beta, speed, trailLength, autoRotate, rk4Step, project]);

  const loadPreset = useCallback((key) => {
    const p = PRESETS[key];
    setSigma(p.sigma);
    setRho(p.rho);
    setBeta(p.beta);
    setSpeed(p.speed);
    setTrailLength(p.trailLength);
  }, []);

  const handleReset = useCallback(() => {
    resetSimulation();
  }, [resetSimulation]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Lorenz Attractor Visualizer</h2>
            <p className="text-gray-600 max-w-3xl">
              Watch the Lorenz system trace its iconic butterfly-shaped strange attractor in 3D.
              Adjust parameters to explore how small changes create dramatically different dynamics.
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
            <ShareButton getURL={buildShareURL} />
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
          {/* Column 1: Lorenz parameters */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                &sigma; (Sigma): {sigma.toFixed(1)}
              </label>
              <input type="range" min="0" max="30" step="0.1" value={sigma}
                onChange={(e) => setSigma(parseFloat(e.target.value))} className="w-full" />
              <p className="text-xs text-gray-500">Prandtl number (default: 10)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                &rho; (Rho): {rho.toFixed(1)}
              </label>
              <input type="range" min="0" max="100" step="0.1" value={rho}
                onChange={(e) => setRho(parseFloat(e.target.value))} className="w-full" />
              <p className="text-xs text-gray-500">Rayleigh number (default: 28)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                &beta; (Beta): {beta.toFixed(2)}
              </label>
              <input type="range" min="0.1" max="10" step="0.01" value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))} className="w-full" />
              <p className="text-xs text-gray-500">Geometric factor (default: 8/3)</p>
            </div>
          </div>

          {/* Column 2: Speed and trail */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Speed: {speed.toFixed(1)}x
              </label>
              <input type="range" min="0.1" max="3" step="0.1" value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trail Length: {trailLength} points
              </label>
              <input type="range" min="100" max="5000" step="100" value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))} className="w-full" />
            </div>
          </div>

          {/* Column 3: View controls */}
          <div className="space-y-3">
            <div className="flex items-center mt-2">
              <input type="checkbox" id="autoRotate" checked={autoRotate}
                onChange={() => setAutoRotate(!autoRotate)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="autoRotate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Auto-Rotate View
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The attractor auto-rotates to show its 3D structure. Disable to keep a fixed viewpoint.
            </p>
          </div>
        </div>

        {/* Stats panel */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">X</p>
            <p className="text-lg font-mono font-bold text-blue-600">{stats.x}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Y</p>
            <p className="text-lg font-mono font-bold text-red-600">{stats.y}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Z</p>
            <p className="text-lg font-mono font-bold text-green-600">{stats.z}</p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-gray-900 p-2 rounded-lg shadow-md mb-6">
        <div className="w-full" style={{ height: '500px' }}>
          <canvas ref={canvasRef} className="w-full h-full rounded" />
        </div>
      </div>
      <KeyboardShortcutHint showReset={false} />
    </div>
  );
};

export default LorenzAttractorVisualizer;
