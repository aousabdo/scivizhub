import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';

// ---- Preset configurations ----
const PRESETS = {
  solarSystem: {
    label: 'Solar System',
    bodies: [
      { x: 0, y: 0, vx: 0, vy: 0, mass: 5000, color: '#FFD700', name: 'Sun' },
      { x: 120, y: 0, vx: 0, vy: 5.5, mass: 8, color: '#A0A0A0', name: 'Mercury' },
      { x: 180, y: 0, vx: 0, vy: 4.5, mass: 15, color: '#E8CDA0', name: 'Venus' },
      { x: 250, y: 0, vx: 0, vy: 3.8, mass: 18, color: '#4488FF', name: 'Earth' },
      { x: 340, y: 0, vx: 0, vy: 3.2, mass: 12, color: '#CC4422', name: 'Mars' },
      { x: 480, y: 0, vx: 0, vy: 2.7, mass: 80, color: '#CC9966', name: 'Jupiter' },
    ],
    G: 1.0,
    softening: 5,
  },
  binaryStar: {
    label: 'Binary Star',
    bodies: [
      { x: -100, y: 0, vx: 0, vy: -2.0, mass: 2000, color: '#FF6644', name: 'Star A' },
      { x: 100, y: 0, vx: 0, vy: 2.0, mass: 2000, color: '#4488FF', name: 'Star B' },
      { x: 300, y: 0, vx: 0, vy: 3.5, mass: 5, color: '#88FF88', name: 'Planet' },
    ],
    G: 1.0,
    softening: 8,
  },
  figureEight: {
    label: 'Figure Eight',
    bodies: [
      { x: -97.00436, y: 24.30886, vx: 0.4662036850, vy: 0.4323657300, mass: 1000, color: '#FF4466', name: 'Body 1' },
      { x: 97.00436, y: -24.30886, vx: 0.4662036850, vy: 0.4323657300, mass: 1000, color: '#44FF66', name: 'Body 2' },
      { x: 0, y: 0, vx: -0.9324073700, vy: -0.8647314600, mass: 1000, color: '#4466FF', name: 'Body 3' },
    ],
    G: 1.0,
    softening: 3,
  },
  randomOrbits: {
    label: 'Random Orbits',
    bodies: null, // generated dynamically
    G: 1.0,
    softening: 5,
  },
};

// ---- Helper functions ----
const massToRadius = (mass) => {
  return Math.max(2, Math.min(20, 2 + Math.pow(mass, 0.33) * 0.8));
};

const massToColor = (mass) => {
  if (mass > 3000) return '#FFD700';
  if (mass > 1000) return '#FF8844';
  if (mass > 500) return '#FF6666';
  if (mass > 100) return '#CC88FF';
  if (mass > 30) return '#66BBFF';
  return '#88DDAA';
};

const generateRandomBodies = () => {
  const bodies = [
    { x: 0, y: 0, vx: 0, vy: 0, mass: 3000, color: '#FFD700', name: 'Central Star' },
  ];
  const count = 4 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 350;
    const mass = 5 + Math.random() * 60;
    const orbitalSpeed = Math.sqrt(3000 / dist) * (0.85 + Math.random() * 0.3);
    bodies.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      vx: -Math.sin(angle) * orbitalSpeed,
      vy: Math.cos(angle) * orbitalSpeed,
      mass,
      color: massToColor(mass),
      name: `Planet ${i + 1}`,
    });
  }
  return bodies;
};

const GravitySimulatorVisualizer = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [showTrails, setShowTrails] = useState(true);
  const [trailLength, setTrailLength] = useState(300);
  const [G, setG] = useState(1.0);
  const [softening, setSoftening] = useState(5);
  const [activePreset, setActivePreset] = useState('solarSystem');
  const [bodyCount, setBodyCount] = useState(0);
  const [stats, setStats] = useState({ KE: 0, PE: 0, total: 0, time: 0 });
  const [interactionMode, setInteractionMode] = useState('add'); // 'add' or 'drag'

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const bodiesRef = useRef([]);
  const trailsRef = useRef([]);
  const timeRef = useRef(0);
  const statsCounterRef = useRef(0);
  const mouseRef = useRef({ down: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

  useVisualizationShortcuts({ onTogglePlay: () => setIsRunning(r => !r) });

  // ---- Physics: Velocity Verlet integration ----
  const computeAccelerations = useCallback((bodies, gConst, soft) => {
    const n = bodies.length;
    const ax = new Float64Array(n);
    const ay = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const distSq = dx * dx + dy * dy + soft * soft;
        const dist = Math.sqrt(distSq);
        const force = gConst / (distSq * dist); // G*m1*m2 / r^2, divided by r for unit vector

        const fx = force * dx;
        const fy = force * dy;

        ax[i] += fx * bodies[j].mass;
        ay[i] += fy * bodies[j].mass;
        ax[j] -= fx * bodies[i].mass;
        ay[j] -= fy * bodies[i].mass;
      }
    }
    return { ax, ay };
  }, []);

  const velocityVerletStep = useCallback((bodies, dt, gConst, soft) => {
    const n = bodies.length;
    if (n === 0) return bodies;

    // Compute current accelerations
    const { ax: ax0, ay: ay0 } = computeAccelerations(bodies, gConst, soft);

    // Update positions: x += v*dt + 0.5*a*dt^2
    const newBodies = bodies.map((b, i) => ({
      ...b,
      x: b.x + b.vx * dt + 0.5 * ax0[i] * dt * dt,
      y: b.y + b.vy * dt + 0.5 * ay0[i] * dt * dt,
      _ax0: ax0[i],
      _ay0: ay0[i],
    }));

    // Compute new accelerations at updated positions
    const { ax: ax1, ay: ay1 } = computeAccelerations(newBodies, gConst, soft);

    // Update velocities: v += 0.5*(a_old + a_new)*dt
    for (let i = 0; i < n; i++) {
      newBodies[i].vx += 0.5 * (newBodies[i]._ax0 + ax1[i]) * dt;
      newBodies[i].vy += 0.5 * (newBodies[i]._ay0 + ay1[i]) * dt;
      delete newBodies[i]._ax0;
      delete newBodies[i]._ay0;
    }

    return newBodies;
  }, [computeAccelerations]);

  // ---- Energy computation ----
  const computeEnergy = useCallback((bodies, gConst, soft) => {
    let KE = 0;
    let PE = 0;

    for (let i = 0; i < bodies.length; i++) {
      KE += 0.5 * bodies[i].mass * (bodies[i].vx * bodies[i].vx + bodies[i].vy * bodies[i].vy);
      for (let j = i + 1; j < bodies.length; j++) {
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy + soft * soft);
        PE -= gConst * bodies[i].mass * bodies[j].mass / dist;
      }
    }

    return { KE, PE, total: KE + PE };
  }, []);

  // ---- World <-> Screen coordinate transforms ----
  const worldToScreen = useCallback((wx, wy, canvas) => {
    const cam = cameraRef.current;
    return {
      x: (wx - cam.x) * cam.zoom + canvas.width / 2,
      y: (wy - cam.y) * cam.zoom + canvas.height / 2,
    };
  }, []);

  const screenToWorld = useCallback((sx, sy, canvas) => {
    const cam = cameraRef.current;
    return {
      x: (sx - canvas.width / 2) / cam.zoom + cam.x,
      y: (sy - canvas.height / 2) / cam.zoom + cam.y,
    };
  }, []);

  // ---- Initialize bodies from preset ----
  const loadPreset = useCallback((key) => {
    const preset = PRESETS[key];
    let bodies;
    if (key === 'randomOrbits') {
      bodies = generateRandomBodies();
    } else {
      bodies = preset.bodies.map((b) => ({ ...b }));
    }
    bodiesRef.current = bodies;
    trailsRef.current = bodies.map(() => []);
    timeRef.current = 0;
    statsCounterRef.current = 0;
    setG(preset.G);
    setSoftening(preset.softening);
    setActivePreset(key);
    setBodyCount(bodies.length);
    cameraRef.current = { x: 0, y: 0, zoom: 1 };
  }, []);

  // ---- Reset ----
  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    loadPreset(activePreset);
  }, [activePreset, loadPreset]);

  // ---- Remove body ----
  const removeLastBody = useCallback(() => {
    if (bodiesRef.current.length > 1) {
      bodiesRef.current = bodiesRef.current.slice(0, -1);
      trailsRef.current = trailsRef.current.slice(0, -1);
      setBodyCount(bodiesRef.current.length);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPreset('solarSystem');
  }, [loadPreset]);

  // ---- Canvas resize ----
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const container = canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = Math.max(550, Math.min(700, window.innerHeight * 0.6));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // ---- Mouse interactions ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (e) => {
      const coords = getCanvasCoords(e);
      mouseRef.current = {
        down: true,
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      };
    };

    const handleMouseMove = (e) => {
      if (mouseRef.current.down) {
        const coords = getCanvasCoords(e);
        mouseRef.current.currentX = coords.x;
        mouseRef.current.currentY = coords.y;
      }
    };

    const handleMouseUp = (e) => {
      if (!mouseRef.current.down) return;
      const coords = getCanvasCoords(e);
      const dx = coords.x - mouseRef.current.startX;
      const dy = coords.y - mouseRef.current.startY;

      if (interactionMode === 'add') {
        // Place new body at click position, drag direction = initial velocity
        const logicalW = canvas.width / (window.devicePixelRatio || 1);
        const logicalH = canvas.height / (window.devicePixelRatio || 1);
        const tempCanvas = { width: logicalW, height: logicalH };
        const worldPos = screenToWorld(mouseRef.current.startX, mouseRef.current.startY, tempCanvas);

        const velScale = 0.03;
        const newBody = {
          x: worldPos.x,
          y: worldPos.y,
          vx: dx * velScale,
          vy: dy * velScale,
          mass: 20,
          color: massToColor(20),
          name: `Body ${bodiesRef.current.length + 1}`,
        };

        bodiesRef.current = [...bodiesRef.current, newBody];
        trailsRef.current = [...trailsRef.current, []];
        setBodyCount(bodiesRef.current.length);
      }

      mouseRef.current.down = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      cameraRef.current.zoom = Math.max(0.1, Math.min(5, cameraRef.current.zoom * zoomFactor));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', () => { mouseRef.current.down = false; });
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', () => {});
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [interactionMode, screenToWorld]);

  // ---- Drawing ----
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const bodies = bodiesRef.current;
    const trails = trailsRef.current;

    // Dark space background
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
    bgGrad.addColorStop(0, '#0a0a2e');
    bgGrad.addColorStop(0.5, '#050520');
    bgGrad.addColorStop(1, '#020210');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle star field (static dots)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    const starSeed = 42;
    for (let i = 0; i < 80; i++) {
      const sx = ((starSeed * (i + 1) * 7919) % 10000) / 10000 * width;
      const sy = ((starSeed * (i + 1) * 6271) % 10000) / 10000 * height;
      const sr = ((starSeed * (i + 1) * 3571) % 10000) / 10000 * 1.5 + 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw trails
    if (showTrails) {
      for (let i = 0; i < bodies.length; i++) {
        const trail = trails[i];
        if (!trail || trail.length < 2) continue;
        const bodyColor = bodies[i].color;

        for (let j = 1; j < trail.length; j++) {
          const alpha = (j / trail.length) * 0.7;
          const p1 = worldToScreen(trail[j - 1].x, trail[j - 1].y, { width, height });
          const p2 = worldToScreen(trail[j].x, trail[j].y, { width, height });

          ctx.strokeStyle = bodyColor;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1 + alpha;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draw bodies
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const screen = worldToScreen(b.x, b.y, { width, height });
      const radius = massToRadius(b.mass) * cameraRef.current.zoom;
      const clampedRadius = Math.max(1.5, Math.min(radius, 30));

      // Glow effect
      const glowSize = clampedRadius * 3;
      const glow = ctx.createRadialGradient(screen.x, screen.y, clampedRadius * 0.5, screen.x, screen.y, glowSize);
      glow.addColorStop(0, b.color + '66');
      glow.addColorStop(0.4, b.color + '22');
      glow.addColorStop(1, b.color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Body
      const bodyGrad = ctx.createRadialGradient(
        screen.x - clampedRadius * 0.3, screen.y - clampedRadius * 0.3,
        clampedRadius * 0.1,
        screen.x, screen.y, clampedRadius
      );
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.3, b.color);
      bodyGrad.addColorStop(1, shadeColor(b.color, -40));
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, clampedRadius, 0, Math.PI * 2);
      ctx.fill();

      // Extra glow for massive bodies (stars)
      if (b.mass > 1000) {
        const starGlow = ctx.createRadialGradient(screen.x, screen.y, clampedRadius, screen.x, screen.y, clampedRadius * 5);
        starGlow.addColorStop(0, b.color + '44');
        starGlow.addColorStop(0.5, b.color + '11');
        starGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, clampedRadius * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw velocity arrow while placing a new body
    if (mouseRef.current.down && interactionMode === 'add') {
      const sx = mouseRef.current.startX;
      const sy = mouseRef.current.startY;
      const cx = mouseRef.current.currentX;
      const cy = mouseRef.current.currentY;

      // Draw circle at placement point
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw velocity arrow
      const adx = cx - sx;
      const ady = cy - sy;
      const alen = Math.sqrt(adx * adx + ady * ady);
      if (alen > 5) {
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrowhead
        const angle = Math.atan2(ady, adx);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 10 * Math.cos(angle - 0.3), cy - 10 * Math.sin(angle - 0.3));
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 10 * Math.cos(angle + 0.3), cy - 10 * Math.sin(angle + 0.3));
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // HUD overlay
    ctx.fillStyle = '#ffffffcc';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Bodies: ${bodies.length}`, 12, 20);
    ctx.fillText(`t = ${timeRef.current.toFixed(1)}s`, 12, 36);
    ctx.textAlign = 'right';
    ctx.fillText(`Zoom: ${cameraRef.current.zoom.toFixed(2)}x`, width - 12, 20);

    if (interactionMode === 'add') {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff66';
      ctx.font = '11px sans-serif';
      ctx.fillText('Click to place a body. Drag to set initial velocity.', width / 2, height - 12);
    }
  }, [showTrails, worldToScreen, interactionMode]);

  // ---- Animation loop ----
  useEffect(() => {
    if (isRunning) {
      let lastTs = performance.now();
      const step = (ts) => {
        const dtReal = Math.min((ts - lastTs) / 1000, 0.05) * speed;
        lastTs = ts;

        // Sub-steps for stability
        const nSub = 8;
        const dtSub = dtReal / nSub;
        for (let s = 0; s < nSub; s++) {
          bodiesRef.current = velocityVerletStep(bodiesRef.current, dtSub, G, softening);
        }
        timeRef.current += dtReal;

        // Record trails
        const bodies = bodiesRef.current;
        for (let i = 0; i < bodies.length; i++) {
          if (!trailsRef.current[i]) trailsRef.current[i] = [];
          trailsRef.current[i].push({ x: bodies[i].x, y: bodies[i].y });
          if (trailsRef.current[i].length > trailLength) {
            trailsRef.current[i].shift();
          }
        }

        // Update stats (throttled)
        statsCounterRef.current++;
        if (statsCounterRef.current % 8 === 0) {
          const e = computeEnergy(bodies, G, softening);
          setStats({
            KE: e.KE.toFixed(1),
            PE: e.PE.toFixed(1),
            total: e.total.toFixed(1),
            time: timeRef.current.toFixed(1),
          });
          setBodyCount(bodies.length);
        }

        drawFrame();
        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Draw static frame
      drawFrame();
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, speed, G, softening, trailLength, showTrails, velocityVerletStep, computeEnergy, drawFrame]);

  // ---- Preset handler ----
  const handlePreset = useCallback((key) => {
    setIsRunning(false);
    setTimeout(() => {
      loadPreset(key);
      // drawFrame on next tick after state settles
      setTimeout(() => drawFrame(), 0);
    }, 0);
  }, [loadPreset, drawFrame]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">N-Body Gravity Simulator</h2>
            <p className="text-gray-600 max-w-3xl">
              Watch gravitational interactions between celestial bodies. Click the canvas to place new bodies;
              drag to set their initial velocity. Scroll to zoom in and out.
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
              onClick={resetSimulation}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={removeLastBody}
              className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              Remove Last
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
                onClick={() => handlePreset(key)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  activePreset === key
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 border-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Column 1: Simulation parameters */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Simulation Speed: {speed.toFixed(1)}x
              </label>
              <input
                type="range" min="0.1" max="5" step="0.1" value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gravitational Constant: {G.toFixed(2)}
              </label>
              <input
                type="range" min="0.1" max="5" step="0.05" value={G}
                onChange={(e) => setG(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Softening: {softening.toFixed(1)}
              </label>
              <input
                type="range" min="1" max="30" step="0.5" value={softening}
                onChange={(e) => setSoftening(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Prevents singularities at close approach</p>
            </div>
          </div>

          {/* Column 2: Trail controls */}
          <div className="space-y-3">
            <div className="flex items-center mt-1">
              <input
                type="checkbox" id="showTrails" checked={showTrails}
                onChange={() => setShowTrails(!showTrails)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showTrails" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Show Orbital Trails
              </label>
            </div>
            {showTrails && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trail Length: {trailLength} points
                </label>
                <input
                  type="range" min="50" max="800" step="10" value={trailLength}
                  onChange={(e) => setTrailLength(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interaction Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInteractionMode('add')}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    interactionMode === 'add'
                      ? 'bg-green-100 border-green-400 text-green-800'
                      : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 border-gray-300'
                  }`}
                >
                  Add Body
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Body list */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bodies ({bodyCount})
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1">
              {bodiesRef.current.map((b, i) => (
                <div key={i} className="flex items-center text-xs space-x-2 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="font-medium truncate">{b.name}</span>
                  <span className="text-gray-400 ml-auto flex-shrink-0">m={b.mass.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Kinetic Energy</p>
            <p className="text-lg font-mono font-bold text-red-500">{stats.KE}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Potential Energy</p>
            <p className="text-lg font-mono font-bold text-blue-500">{stats.PE}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Energy</p>
            <p className="text-lg font-mono font-bold text-green-600">{stats.total}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Elapsed Time</p>
            <p className="text-lg font-mono font-bold text-gray-700 dark:text-gray-300">{stats.time}s</p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-gray-900 p-1 rounded-lg shadow-md mb-6">
        <div className="w-full" style={{ minHeight: '550px' }}>
          <canvas
            ref={canvasRef}
            className="w-full rounded cursor-crosshair"
            style={{ display: 'block' }}
          />
        </div>
      </div>
      <KeyboardShortcutHint showReset={false} />
    </div>
  );
};

// ---- Utility: darken/lighten a hex color ----
function shadeColor(color, percent) {
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const num = parseInt(hex, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default GravitySimulatorVisualizer;
