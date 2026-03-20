import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';

// ---- Preset configurations ----
const PRESETS = {
  solarSystem: {
    label: 'Solar System',
    bodies: [
      { x: 0, y: 0, vx: 0, vy: 0, mass: 5000, color: '#FFD700', name: 'Sun', fixed: true },
      { x: 100, y: 0, vx: 0, vy: 6.0, mass: 6, color: '#B0B0B0', name: 'Mercury' },
      { x: 160, y: 0, vx: 0, vy: 4.8, mass: 12, color: '#E8CDA0', name: 'Venus' },
      { x: 220, y: 0, vx: 0, vy: 4.1, mass: 15, color: '#4499FF', name: 'Earth' },
      { x: 310, y: 0, vx: 0, vy: 3.4, mass: 10, color: '#CC5533', name: 'Mars' },
      { x: 450, y: 0, vx: 0, vy: 2.8, mass: 70, color: '#D4A06A', name: 'Jupiter' },
    ],
    G: 1.0,
    softening: 4,
    description: 'A simplified model of our inner solar system with Jupiter.',
  },
  binaryStar: {
    label: 'Binary Star',
    bodies: [
      { x: -80, y: 0, vx: 0, vy: -2.2, mass: 2000, color: '#FF7744', name: 'Star A' },
      { x: 80, y: 0, vx: 0, vy: 2.2, mass: 2000, color: '#5599FF', name: 'Star B' },
      { x: 280, y: 0, vx: 0, vy: 3.8, mass: 5, color: '#88EE88', name: 'Planet' },
    ],
    G: 1.0,
    softening: 6,
    description: 'Two stars orbiting their common center of mass with a circumbinary planet.',
  },
  figureEight: {
    label: 'Figure-8 Three-Body',
    bodies: [
      { x: -97.00436, y: 24.30886, vx: 0.4662036850, vy: 0.4323657300, mass: 1000, color: '#FF4466', name: 'Body 1' },
      { x: 97.00436, y: -24.30886, vx: 0.4662036850, vy: 0.4323657300, mass: 1000, color: '#44FF66', name: 'Body 2' },
      { x: 0, y: 0, vx: -0.9324073700, vy: -0.8647314600, mass: 1000, color: '#4466FF', name: 'Body 3' },
    ],
    G: 1.0,
    softening: 3,
    description: 'A remarkable periodic solution where three equal-mass bodies trace a figure-8 path.',
  },
  eccentricOrbits: {
    label: 'Eccentric Orbits',
    bodies: [
      { x: 0, y: 0, vx: 0, vy: 0, mass: 5000, color: '#FFD700', name: 'Star', fixed: true },
      { x: 80, y: 0, vx: 0, vy: 7.5, mass: 8, color: '#FF6688', name: 'Comet (e~0.7)' },
      { x: 200, y: 0, vx: 0, vy: 4.0, mass: 12, color: '#66BBFF', name: 'Planet (e~0.1)' },
      { x: 350, y: 0, vx: 0, vy: 2.2, mass: 10, color: '#AABB44', name: 'Elliptical (e~0.5)' },
    ],
    G: 1.0,
    softening: 4,
    description: 'Orbits with different eccentricities, from nearly circular to highly elliptical.',
  },
  hohmannTransfer: {
    label: 'Transfer Orbit',
    bodies: [
      { x: 0, y: 0, vx: 0, vy: 0, mass: 5000, color: '#FFD700', name: 'Star', fixed: true },
      { x: 150, y: 0, vx: 0, vy: 4.9, mass: 12, color: '#4499FF', name: 'Inner Planet' },
      { x: 350, y: 0, vx: 0, vy: 3.2, mass: 14, color: '#CC5533', name: 'Outer Planet' },
      { x: 150, y: 0, vx: 0, vy: 5.9, mass: 1, color: '#FFFFFF', name: 'Spacecraft' },
    ],
    G: 1.0,
    softening: 4,
    description: 'A spacecraft launched from the inner planet on a transfer orbit toward the outer planet.',
  },
};

// ---- Helpers ----
const massToRadius = (mass) => Math.max(2, Math.min(22, 2 + Math.pow(mass, 0.33) * 0.8));

const massToColor = (mass) => {
  if (mass > 3000) return '#FFD700';
  if (mass > 1000) return '#FF8844';
  if (mass > 500) return '#FF6666';
  if (mass > 100) return '#CC88FF';
  if (mass > 30) return '#66BBFF';
  return '#88DDAA';
};

function shadeColor(color, percent) {
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const num = parseInt(hex, 16);
  let r = Math.max(0, Math.min(255, (num >> 16) + percent));
  let g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  let b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

// ---- Stars background cache ----
const generateStars = (count, seed) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      xFrac: ((seed * (i + 1) * 7919) % 10000) / 10000,
      yFrac: ((seed * (i + 1) * 6271) % 10000) / 10000,
      r: ((seed * (i + 1) * 3571) % 10000) / 10000 * 1.5 + 0.3,
      brightness: 0.15 + ((seed * (i + 1) * 4447) % 10000) / 10000 * 0.5,
    });
  }
  return stars;
};

const BG_STARS = generateStars(120, 42);

// ================================================================
// Main Visualizer Component
// ================================================================
const OrbitalMechanicsVisualizer = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [showTrails, setShowTrails] = useState(true);
  const [trailLength, setTrailLength] = useState(400);
  const [showVelocityVectors, setShowVelocityVectors] = useState(false);
  const [showForceVectors, setShowForceVectors] = useState(false);
  const [activePreset, setActivePreset] = useState('solarSystem');
  const [bodyCount, setBodyCount] = useState(0);
  const [stats, setStats] = useState({ KE: 0, PE: 0, total: 0, angularMom: 0, time: 0 });
  const [selectedBody, setSelectedBody] = useState(null);
  const [newBodyMass, setNewBodyMass] = useState(15);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const bodiesRef = useRef([]);
  const trailsRef = useRef([]);
  const timeRef = useRef(0);
  const statsCounterRef = useRef(0);
  const mouseRef = useRef({ down: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const GRef = useRef(1.0);
  const softeningRef = useRef(4);
  const periodTrackerRef = useRef({}); // track orbital periods

  useVisualizationShortcuts({ onTogglePlay: () => setIsRunning(r => !r) });

  // ---- Physics: compute accelerations ----
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
        const force = gConst / (distSq * dist);
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

  // ---- Velocity Verlet integration step ----
  const velocityVerletStep = useCallback((bodies, dt, gConst, soft) => {
    const n = bodies.length;
    if (n === 0) return bodies;
    const { ax: ax0, ay: ay0 } = computeAccelerations(bodies, gConst, soft);
    const newBodies = bodies.map((b, i) => {
      if (b.fixed) return { ...b };
      return {
        ...b,
        x: b.x + b.vx * dt + 0.5 * ax0[i] * dt * dt,
        y: b.y + b.vy * dt + 0.5 * ay0[i] * dt * dt,
        _ax0: ax0[i],
        _ay0: ay0[i],
      };
    });
    const { ax: ax1, ay: ay1 } = computeAccelerations(newBodies, gConst, soft);
    for (let i = 0; i < n; i++) {
      if (newBodies[i].fixed) continue;
      newBodies[i].vx += 0.5 * ((newBodies[i]._ax0 || 0) + ax1[i]) * dt;
      newBodies[i].vy += 0.5 * ((newBodies[i]._ay0 || 0) + ay1[i]) * dt;
      delete newBodies[i]._ax0;
      delete newBodies[i]._ay0;
    }
    return newBodies;
  }, [computeAccelerations]);

  // ---- Energy & angular momentum ----
  const computeEnergy = useCallback((bodies, gConst, soft) => {
    let KE = 0, PE = 0, Lz = 0;
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      KE += 0.5 * b.mass * (b.vx * b.vx + b.vy * b.vy);
      Lz += b.mass * (b.x * b.vy - b.y * b.vx);
      for (let j = i + 1; j < bodies.length; j++) {
        const dx = bodies[j].x - b.x;
        const dy = bodies[j].y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy + soft * soft);
        PE -= gConst * b.mass * bodies[j].mass / dist;
      }
    }
    return { KE, PE, total: KE + PE, angularMom: Lz };
  }, []);

  // ---- Orbital period tracker ----
  const trackPeriods = useCallback((bodies, time) => {
    // Track when orbiting bodies cross the positive x-axis (y changes sign from - to +)
    const tracker = periodTrackerRef.current;
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      if (b.fixed || b.mass > 1000) continue;
      const key = b.name || `body_${i}`;
      if (!tracker[key]) {
        tracker[key] = { lastY: b.y, lastCrossTime: null, period: null };
      }
      const t = tracker[key];
      // Detect crossing y=0 from below (lastY < 0, current y >= 0) and x > 0
      if (t.lastY < 0 && b.y >= 0 && b.x > 0) {
        if (t.lastCrossTime !== null) {
          t.period = time - t.lastCrossTime;
        }
        t.lastCrossTime = time;
      }
      t.lastY = b.y;
    }
  }, []);

  // ---- Coordinate transforms ----
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

  // ---- Load preset ----
  const loadPreset = useCallback((key) => {
    const preset = PRESETS[key];
    const bodies = preset.bodies.map((b) => ({ ...b }));
    bodiesRef.current = bodies;
    trailsRef.current = bodies.map(() => []);
    timeRef.current = 0;
    statsCounterRef.current = 0;
    periodTrackerRef.current = {};
    GRef.current = preset.G;
    softeningRef.current = preset.softening;
    setActivePreset(key);
    setBodyCount(bodies.length);
    setSelectedBody(null);
    cameraRef.current = { x: 0, y: 0, zoom: 1 };
  }, []);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    loadPreset(activePreset);
  }, [activePreset, loadPreset]);

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
      const h = Math.max(500, Math.min(700, window.innerHeight * 0.65));
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
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleMouseDown = (e) => {
      e.preventDefault();
      const coords = getCanvasCoords(e);
      mouseRef.current = { down: true, startX: coords.x, startY: coords.y, currentX: coords.x, currentY: coords.y };
    };

    const handleMouseMove = (e) => {
      if (mouseRef.current.down) {
        e.preventDefault();
        const coords = getCanvasCoords(e);
        mouseRef.current.currentX = coords.x;
        mouseRef.current.currentY = coords.y;
      }
    };

    const handleMouseUp = (e) => {
      if (!mouseRef.current.down) return;
      const coords = e.changedTouches
        ? { x: e.changedTouches[0].clientX - canvas.getBoundingClientRect().left, y: e.changedTouches[0].clientY - canvas.getBoundingClientRect().top }
        : getCanvasCoords(e);
      const dx = coords.x - mouseRef.current.startX;
      const dy = coords.y - mouseRef.current.startY;

      const dpr = window.devicePixelRatio || 1;
      const logicalW = canvas.width / dpr;
      const logicalH = canvas.height / dpr;
      const tempCanvas = { width: logicalW, height: logicalH };
      const worldPos = screenToWorld(mouseRef.current.startX, mouseRef.current.startY, tempCanvas);

      const velScale = 0.04;
      const mass = newBodyMass;
      const newBody = {
        x: worldPos.x,
        y: worldPos.y,
        vx: dx * velScale,
        vy: dy * velScale,
        mass,
        color: massToColor(mass),
        name: `Body ${bodiesRef.current.length + 1}`,
      };

      bodiesRef.current = [...bodiesRef.current, newBody];
      trailsRef.current = [...trailsRef.current, []];
      setBodyCount(bodiesRef.current.length);
      mouseRef.current.down = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      cameraRef.current.zoom = Math.max(0.1, Math.min(5, cameraRef.current.zoom * factor));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', () => { mouseRef.current.down = false; });
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
    canvas.addEventListener('touchmove', handleMouseMove, { passive: false });
    canvas.addEventListener('touchend', handleMouseUp, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', () => {});
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  }, [screenToWorld, newBodyMass]);

  // ---- Drawing ----
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const bodies = bodiesRef.current;
    const trails = trailsRef.current;
    const zoom = cameraRef.current.zoom;

    // -- Background --
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    bgGrad.addColorStop(0, '#0b0b30');
    bgGrad.addColorStop(0.5, '#060622');
    bgGrad.addColorStop(1, '#020212');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // -- Stars --
    for (const s of BG_STARS) {
      ctx.fillStyle = `rgba(255,255,255,${s.brightness})`;
      ctx.beginPath();
      ctx.arc(s.xFrac * W, s.yFrac * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // -- Trails --
    if (showTrails) {
      for (let i = 0; i < bodies.length; i++) {
        const trail = trails[i];
        if (!trail || trail.length < 2) continue;
        const rgb = hexToRgb(bodies[i].color);
        for (let j = 1; j < trail.length; j++) {
          const alpha = (j / trail.length) * 0.75;
          const p1 = worldToScreen(trail[j - 1].x, trail[j - 1].y, { width: W, height: H });
          const p2 = worldToScreen(trail[j].x, trail[j].y, { width: W, height: H });
          ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
          ctx.lineWidth = 1 + alpha * 1.2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // -- Force vectors --
    if (showForceVectors) {
      const gConst = GRef.current;
      const soft = softeningRef.current;
      for (let i = 0; i < bodies.length; i++) {
        let fx = 0, fy = 0;
        for (let j = 0; j < bodies.length; j++) {
          if (i === j) continue;
          const dx = bodies[j].x - bodies[i].x;
          const dy = bodies[j].y - bodies[i].y;
          const distSq = dx * dx + dy * dy + soft * soft;
          const dist = Math.sqrt(distSq);
          const f = gConst * bodies[i].mass * bodies[j].mass / distSq;
          fx += f * dx / dist;
          fy += f * dy / dist;
        }
        const screen = worldToScreen(bodies[i].x, bodies[i].y, { width: W, height: H });
        const fMag = Math.sqrt(fx * fx + fy * fy);
        if (fMag < 0.001) continue;
        const scale = Math.min(60, 0.3 + Math.log(1 + fMag) * 8);
        const ex = screen.x + (fx / fMag) * scale;
        const ey = screen.y + (fy / fMag) * scale;
        const angle = Math.atan2(fy, fx);
        ctx.strokeStyle = 'rgba(255,100,100,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 7 * Math.cos(angle - 0.4), ey - 7 * Math.sin(angle - 0.4));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 7 * Math.cos(angle + 0.4), ey - 7 * Math.sin(angle + 0.4));
        ctx.stroke();
      }
    }

    // -- Velocity vectors --
    if (showVelocityVectors) {
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const vMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (vMag < 0.01) continue;
        const screen = worldToScreen(b.x, b.y, { width: W, height: H });
        const scale = Math.min(70, 6 + vMag * 8);
        const ex = screen.x + (b.vx / vMag) * scale;
        const ey = screen.y + (b.vy / vMag) * scale;
        const angle = Math.atan2(b.vy, b.vx);
        ctx.strokeStyle = 'rgba(100,255,150,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 7 * Math.cos(angle - 0.4), ey - 7 * Math.sin(angle - 0.4));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 7 * Math.cos(angle + 0.4), ey - 7 * Math.sin(angle + 0.4));
        ctx.stroke();
      }
    }

    // -- Bodies --
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const screen = worldToScreen(b.x, b.y, { width: W, height: H });
      const radius = massToRadius(b.mass) * zoom;
      const clampedR = Math.max(1.5, Math.min(radius, 30));

      // Glow
      const glowSize = clampedR * 3;
      const glow = ctx.createRadialGradient(screen.x, screen.y, clampedR * 0.4, screen.x, screen.y, glowSize);
      glow.addColorStop(0, b.color + '66');
      glow.addColorStop(0.4, b.color + '22');
      glow.addColorStop(1, b.color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Body sphere
      const bodyGrad = ctx.createRadialGradient(
        screen.x - clampedR * 0.3, screen.y - clampedR * 0.3, clampedR * 0.1,
        screen.x, screen.y, clampedR
      );
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.3, b.color);
      bodyGrad.addColorStop(1, shadeColor(b.color, -40));
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, clampedR, 0, Math.PI * 2);
      ctx.fill();

      // Extra glow for massive bodies (stars)
      if (b.mass > 1000) {
        const starGlow = ctx.createRadialGradient(screen.x, screen.y, clampedR, screen.x, screen.y, clampedR * 5);
        starGlow.addColorStop(0, b.color + '44');
        starGlow.addColorStop(0.5, b.color + '11');
        starGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, clampedR * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Selection highlight
      if (selectedBody === i) {
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, clampedR + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Name label for selected or massive bodies
      if (selectedBody === i || b.mass > 500) {
        ctx.fillStyle = '#ffffffaa';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, screen.x, screen.y - clampedR - 6);
      }
    }

    // -- Placement preview --
    if (mouseRef.current.down) {
      const sx = mouseRef.current.startX;
      const sy = mouseRef.current.startY;
      const cx = mouseRef.current.currentX;
      const cy = mouseRef.current.currentY;

      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const adx = cx - sx;
      const ady = cy - sy;
      const alen = Math.sqrt(adx * adx + ady * ady);
      if (alen > 4) {
        ctx.strokeStyle = '#ffffff66';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        const angle = Math.atan2(ady, adx);
        ctx.strokeStyle = '#ffffff66';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 9 * Math.cos(angle - 0.3), cy - 9 * Math.sin(angle - 0.3));
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 9 * Math.cos(angle + 0.3), cy - 9 * Math.sin(angle + 0.3));
        ctx.stroke();
      }
    }

    // -- HUD --
    ctx.fillStyle = '#ffffffbb';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Bodies: ${bodies.length}  |  t = ${timeRef.current.toFixed(1)}`, 10, 18);
    ctx.textAlign = 'right';
    ctx.fillText(`Zoom: ${zoom.toFixed(2)}x`, W - 10, 18);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff55';
    ctx.font = '10px sans-serif';
    ctx.fillText('Click to place a body \u2022 Drag to set velocity \u2022 Scroll to zoom', W / 2, H - 8);
  }, [showTrails, showVelocityVectors, showForceVectors, worldToScreen, selectedBody]);

  // ---- Animation loop ----
  useEffect(() => {
    if (isRunning) {
      let lastTs = performance.now();
      const step = (ts) => {
        const dtReal = Math.min((ts - lastTs) / 1000, 0.05) * speed;
        lastTs = ts;

        const nSub = 10;
        const dtSub = dtReal / nSub;
        for (let s = 0; s < nSub; s++) {
          bodiesRef.current = velocityVerletStep(bodiesRef.current, dtSub, GRef.current, softeningRef.current);
        }
        timeRef.current += dtReal;

        // Trails
        const bodies = bodiesRef.current;
        for (let i = 0; i < bodies.length; i++) {
          if (!trailsRef.current[i]) trailsRef.current[i] = [];
          trailsRef.current[i].push({ x: bodies[i].x, y: bodies[i].y });
          if (trailsRef.current[i].length > trailLength) trailsRef.current[i].shift();
        }

        // Period tracking
        trackPeriods(bodies, timeRef.current);

        // Stats (throttled)
        statsCounterRef.current++;
        if (statsCounterRef.current % 10 === 0) {
          const e = computeEnergy(bodies, GRef.current, softeningRef.current);
          setStats({
            KE: e.KE.toFixed(1),
            PE: e.PE.toFixed(1),
            total: e.total.toFixed(1),
            angularMom: e.angularMom.toFixed(1),
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
      drawFrame();
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, speed, trailLength, showTrails, showVelocityVectors, showForceVectors, selectedBody, velocityVerletStep, computeEnergy, trackPeriods, drawFrame]);

  // ---- Preset handler ----
  const handlePreset = useCallback((key) => {
    setIsRunning(false);
    setTimeout(() => {
      loadPreset(key);
      setTimeout(() => drawFrame(), 0);
    }, 0);
  }, [loadPreset, drawFrame]);

  // ---- Get period info for a body ----
  const getPeriod = (name) => {
    const t = periodTrackerRef.current[name];
    if (t && t.period) return t.period.toFixed(1);
    return '--';
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start mb-4 gap-3">
          <div>
            <h2 className="text-2xl font-bold mb-1">Orbital Mechanics Simulator</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-2xl">
              {PRESETS[activePreset]?.description || 'Explore gravitational orbits using Newtonian mechanics with Velocity Verlet integration.'}
            </p>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                isRunning ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isRunning ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={resetSimulation}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors text-sm"
            >
              Reset
            </button>
            <button
              onClick={removeLastBody}
              className="px-3 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors text-sm"
            >
              Remove Last
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preset Systems</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => handlePreset(key)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  activePreset === key
                    ? 'bg-indigo-100 border-indigo-400 text-indigo-800 font-medium'
                    : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-600 border-gray-300 text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Column 1: Simulation */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Speed: {speed.toFixed(1)}x
              </label>
              <input
                type="range" min="0.1" max="5" step="0.1" value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Body Mass: {newBodyMass}
              </label>
              <input
                type="range" min="1" max="200" step="1" value={newBodyMass}
                onChange={(e) => setNewBodyMass(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Column 2: Display options */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Display</label>
            <div className="flex items-center">
              <input type="checkbox" id="omTrails" checked={showTrails} onChange={() => setShowTrails(!showTrails)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label htmlFor="omTrails" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Orbital Trails</label>
            </div>
            {showTrails && (
              <div className="ml-6">
                <label className="block text-xs text-gray-500 mb-0.5">Trail Length: {trailLength}</label>
                <input type="range" min="50" max="800" step="10" value={trailLength}
                  onChange={(e) => setTrailLength(parseInt(e.target.value))} className="w-full" />
              </div>
            )}
            <div className="flex items-center">
              <input type="checkbox" id="omVelVec" checked={showVelocityVectors} onChange={() => setShowVelocityVectors(!showVelocityVectors)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded" />
              <label htmlFor="omVelVec" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Velocity Vectors <span className="text-green-500 text-xs">(green)</span>
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="omForceVec" checked={showForceVectors} onChange={() => setShowForceVectors(!showForceVectors)}
                className="h-4 w-4 text-red-600 border-gray-300 rounded" />
              <label htmlFor="omForceVec" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Force Vectors <span className="text-red-400 text-xs">(red)</span>
              </label>
            </div>
          </div>

          {/* Column 3: Bodies */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Bodies ({bodyCount})
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {bodiesRef.current.map((b, i) => {
                const period = getPeriod(b.name);
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedBody(selectedBody === i ? null : i)}
                    className={`flex items-center text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                      selectedBody === i ? 'bg-indigo-50 border border-indigo-300' : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-600 border border-transparent'
                    }`}
                  >
                    <span className="inline-block w-3 h-3 rounded-full flex-shrink-0 mr-2" style={{ backgroundColor: b.color }} />
                    <span className="font-medium truncate">{b.name}</span>
                    <span className="text-gray-400 ml-auto flex-shrink-0 pl-2">
                      m={b.mass.toFixed(0)}
                      {period !== '--' && <span className="text-indigo-400 ml-1">T={period}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Kinetic Energy</p>
            <p className="text-base font-mono font-bold text-red-500">{stats.KE}</p>
          </div>
          <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Potential Energy</p>
            <p className="text-base font-mono font-bold text-blue-500">{stats.PE}</p>
          </div>
          <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Energy</p>
            <p className="text-base font-mono font-bold text-green-600">{stats.total}</p>
          </div>
          <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Angular Mom.</p>
            <p className="text-base font-mono font-bold text-purple-500">{stats.angularMom}</p>
          </div>
          <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Elapsed</p>
            <p className="text-base font-mono font-bold text-gray-700 dark:text-gray-300">{stats.time}s</p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-gray-900 p-1 rounded-lg shadow-lg mb-6">
        <div className="w-full" style={{ minHeight: '500px' }}>
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

export default OrbitalMechanicsVisualizer;
