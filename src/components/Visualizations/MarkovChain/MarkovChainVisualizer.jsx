import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Preset transition matrices ─────────────────────────────────────
const PRESETS = {
  weather: {
    name: 'Weather',
    states: ['Sunny', 'Rainy'],
    matrix: [
      [0.8, 0.2],
      [0.4, 0.6],
    ],
    colors: ['#f59e0b', '#3b82f6'],
  },
  randomWalk: {
    name: 'Random Walk',
    states: ['Left', 'Center', 'Right'],
    matrix: [
      [0.3, 0.7, 0.0],
      [0.3, 0.4, 0.3],
      [0.0, 0.7, 0.3],
    ],
    colors: ['#ef4444', '#8b5cf6', '#10b981'],
  },
  gambler: {
    name: "Gambler's Ruin",
    states: ['$0', '$1', '$2', '$3', '$4'],
    matrix: [
      [1.0, 0.0, 0.0, 0.0, 0.0],
      [0.4, 0.0, 0.6, 0.0, 0.0],
      [0.0, 0.4, 0.0, 0.6, 0.0],
      [0.0, 0.0, 0.4, 0.0, 0.6],
      [0.0, 0.0, 0.0, 0.0, 1.0],
    ],
    colors: ['#dc2626', '#f97316', '#eab308', '#22c55e', '#0ea5e9'],
  },
  pageRank: {
    name: 'Page Rank',
    states: ['Page A', 'Page B', 'Page C', 'Page D'],
    matrix: [
      [0.0, 0.5, 0.5, 0.0],
      [0.33, 0.0, 0.33, 0.34],
      [0.0, 0.5, 0.0, 0.5],
      [1.0, 0.0, 0.0, 0.0],
    ],
    colors: ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'],
  },
};

// ── Helpers ─────────────────────────────────────────────────────────
const sampleNext = (row) => {
  const r = Math.random();
  let cumulative = 0;
  for (let j = 0; j < row.length; j++) {
    cumulative += row[j];
    if (r < cumulative) return j;
  }
  return row.length - 1;
};

const computeSteadyState = (matrix) => {
  const n = matrix.length;
  // Power iteration: raise matrix to high power
  let dist = Array(n).fill(1 / n);
  for (let iter = 0; iter < 200; iter++) {
    const next = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        next[j] += dist[i] * matrix[i][j];
      }
    }
    dist = next;
  }
  return dist;
};

// ── Main Component ──────────────────────────────────────────────────
const MarkovChainVisualizer = () => {
  const [presetKey, setPresetKey] = useState('weather');
  const [states, setStates] = useState(PRESETS.weather.states);
  const [matrix, setMatrix] = useState(PRESETS.weather.matrix);
  const [colors, setColors] = useState(PRESETS.weather.colors);
  const [currentState, setCurrentState] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [visitCounts, setVisitCounts] = useState([1, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [showSteadyState, setShowSteadyState] = useState(false);
  const [animatingTransition, setAnimatingTransition] = useState(null);
  const [editingMatrix, setEditingMatrix] = useState(false);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const playIntervalRef = useRef(null);
  const containerRef = useRef(null);
  const canvasSizeRef = useRef({ width: 600, height: 450 });

  const statePositionsRef = useRef([]);
  const n = states.length;

  // ── Compute state positions (circle layout) ─────────────────────
  const computePositions = useCallback((width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.32;
    const positions = [];
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      positions.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }
    statePositionsRef.current = positions;
    return positions;
  }, [n]);

  // ── Load preset ─────────────────────────────────────────────────
  const loadPreset = useCallback((key) => {
    const p = PRESETS[key];
    setPresetKey(key);
    setStates(p.states);
    setMatrix(p.matrix);
    setColors(p.colors);
    setCurrentState(0);
    setStepCount(0);
    setVisitCounts(Array(p.states.length).fill(0).map((_, i) => (i === 0 ? 1 : 0)));
    setIsPlaying(false);
    setAnimatingTransition(null);
    setEditingMatrix(false);
  }, []);

  // ── Step forward ────────────────────────────────────────────────
  const stepForward = useCallback(() => {
    setCurrentState((prev) => {
      const next = sampleNext(matrix[prev]);
      setAnimatingTransition({ from: prev, to: next, progress: 0, startTime: performance.now() });
      setStepCount((s) => s + 1);
      setVisitCounts((vc) => {
        const copy = [...vc];
        copy[next] = (copy[next] || 0) + 1;
        return copy;
      });
      return next;
    });
  }, [matrix]);

  // ── Reset ───────────────────────────────────────────────────────
  const resetChain = useCallback(() => {
    setCurrentState(0);
    setStepCount(0);
    setVisitCounts(Array(n).fill(0).map((_, i) => (i === 0 ? 1 : 0)));
    setIsPlaying(false);
    setAnimatingTransition(null);
  }, [n]);

  // ── Click on state to set initial ───────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const positions = statePositionsRef.current;
    const stateRadius = Math.min(canvasSizeRef.current.width, canvasSizeRef.current.height) * 0.08;

    for (let i = 0; i < positions.length; i++) {
      const dx = mx - positions[i].x;
      const dy = my - positions[i].y;
      if (dx * dx + dy * dy < stateRadius * stateRadius) {
        setCurrentState(i);
        setStepCount(0);
        setVisitCounts(Array(n).fill(0).map((_, j) => (j === i ? 1 : 0)));
        setIsPlaying(false);
        setAnimatingTransition(null);
        return;
      }
    }
  }, [n]);

  // ── Auto-play ───────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        stepForward();
      }, speed);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, speed, stepForward]);

  // ── Resize observer ─────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        const h = Math.min(450, Math.floor(w * 0.75));
        canvasSizeRef.current = { width: w, height: h };
        if (canvasRef.current) {
          canvasRef.current.width = w * 2;
          canvasRef.current.height = h * 2;
          canvasRef.current.style.width = w + 'px';
          canvasRef.current.style.height = h + 'px';
        }
        computePositions(w * 2, h * 2);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [computePositions]);

  // ── Drawing ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = (timestamp) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const positions = statePositionsRef.current;
      if (positions.length === 0) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const stateRadius = Math.min(w, h) * 0.08;
      const fontSize = Math.max(12, Math.min(w, h) * 0.028);

      // ── Draw arrows ──────────────────────────────────────────
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (matrix[i][j] <= 0) continue;
          const prob = matrix[i][j];
          const alpha = 0.3 + 0.7 * prob;

          if (i === j) {
            // Self-loop
            const pos = positions[i];
            const loopRadius = stateRadius * 0.6;
            const loopCx = pos.x;
            const loopCy = pos.y - stateRadius - loopRadius * 0.7;
            ctx.beginPath();
            ctx.arc(loopCx, loopCy, loopRadius, 0.3, Math.PI * 2 - 0.3);
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 1.5 + 2 * prob;
            ctx.stroke();

            // Self-loop arrowhead
            const arrowAngle = Math.PI * 2 - 0.3;
            const ax = loopCx + loopRadius * Math.cos(arrowAngle);
            const ay = loopCy + loopRadius * Math.sin(arrowAngle);
            const headLen = 10;
            const tangentAngle = arrowAngle + Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - headLen * Math.cos(tangentAngle - 0.4), ay - headLen * Math.sin(tangentAngle - 0.4));
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - headLen * Math.cos(tangentAngle + 0.4), ay - headLen * Math.sin(tangentAngle + 0.4));
            ctx.stroke();

            // Label
            ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
            ctx.font = `${fontSize * 0.8}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(prob.toFixed(2), loopCx, loopCy - loopRadius - 4);
          } else {
            // Curved arrow between states
            const from = positions[i];
            const to = positions[j];
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;

            // Offset start and end by state radius
            const sx = from.x + nx * stateRadius;
            const sy = from.y + ny * stateRadius;
            const ex = to.x - nx * stateRadius;
            const ey = to.y - ny * stateRadius;

            // Curve control point (perpendicular offset for bidirectional distinction)
            const perpX = -ny;
            const perpY = nx;
            const curvature = dist * 0.18;
            const cpx = (sx + ex) / 2 + perpX * curvature;
            const cpy = (sy + ey) / 2 + perpY * curvature;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(cpx, cpy, ex, ey);
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 1.5 + 2 * prob;
            ctx.stroke();

            // Arrowhead
            const t = 0.95;
            const tangX = 2 * (1 - t) * (cpx - sx) + 2 * t * (ex - cpx);
            const tangY = 2 * (1 - t) * (cpy - sy) + 2 * t * (ey - cpy);
            const tangLen = Math.sqrt(tangX * tangX + tangY * tangY);
            const tnx = tangX / tangLen;
            const tny = tangY / tangLen;
            const headLen = 12;

            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - headLen * (tnx * Math.cos(0.35) - tny * Math.sin(0.35)),
                       ey - headLen * (tny * Math.cos(0.35) + tnx * Math.sin(0.35)));
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - headLen * (tnx * Math.cos(-0.35) - tny * Math.sin(-0.35)),
                       ey - headLen * (tny * Math.cos(-0.35) + tnx * Math.sin(-0.35)));
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Probability label
            const labelT = 0.45;
            const lx = (1 - labelT) * (1 - labelT) * sx + 2 * (1 - labelT) * labelT * cpx + labelT * labelT * ex;
            const ly = (1 - labelT) * (1 - labelT) * sy + 2 * (1 - labelT) * labelT * cpy + labelT * labelT * ey;
            ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0.6, alpha)})`;
            ctx.font = `bold ${fontSize * 0.75}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Background for readability
            const labelText = prob.toFixed(2);
            const metrics = ctx.measureText(labelText);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(lx - metrics.width / 2 - 4, ly - fontSize * 0.4, metrics.width + 8, fontSize * 0.85);
            ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0.6, alpha)})`;
            ctx.fillText(labelText, lx, ly);
          }
        }
      }

      // ── Draw animated particle ───────────────────────────────
      if (animatingTransition) {
        const { from, to, startTime } = animatingTransition;
        const elapsed = timestamp - startTime;
        const duration = Math.min(speed * 0.6, 350);
        const progress = Math.min(1, elapsed / duration);

        if (from === to) {
          // Self-loop animation
          const pos = positions[from];
          const loopRadius = stateRadius * 0.6;
          const loopCx = pos.x;
          const loopCy = pos.y - stateRadius - loopRadius * 0.7;
          const angle = 0.3 + progress * (Math.PI * 2 - 0.6);
          const px = loopCx + loopRadius * Math.cos(angle);
          const py = loopCy + loopRadius * Math.sin(angle);

          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          const fromPos = positions[from];
          const toPos = positions[to];
          const dx = toPos.x - fromPos.x;
          const dy = toPos.y - fromPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nxd = dx / dist;
          const nyd = dy / dist;
          const sx = fromPos.x + nxd * stateRadius;
          const sy = fromPos.y + nyd * stateRadius;
          const ex = toPos.x - nxd * stateRadius;
          const ey = toPos.y - nyd * stateRadius;
          const perpX = -nyd;
          const perpY = nxd;
          const curvature = dist * 0.18;
          const cpx = (sx + ex) / 2 + perpX * curvature;
          const cpy = (sy + ey) / 2 + perpY * curvature;

          const t = progress;
          const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cpx + t * t * ex;
          const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cpy + t * t * ey;

          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        if (progress >= 1) {
          setAnimatingTransition(null);
        }
      }

      // ── Draw state circles ───────────────────────────────────
      for (let i = 0; i < n; i++) {
        const pos = positions[i];
        const isActive = i === currentState;

        // Glow for active state
        if (isActive) {
          const pulsePhase = Math.sin(timestamp / 300) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, stateRadius + 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${0.15 * pulsePhase})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, stateRadius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251, 191, 36, ${0.6 * pulsePhase})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // State circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, stateRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(pos.x - stateRadius * 0.3, pos.y - stateRadius * 0.3, 0, pos.x, pos.y, stateRadius);
        gradient.addColorStop(0, colors[i] || '#6366f1');
        gradient.addColorStop(1, darkenColor(colors[i] || '#6366f1', 0.6));
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = isActive ? '#fbbf24' : 'rgba(226, 232, 240, 0.5)';
        ctx.lineWidth = isActive ? 3 : 1.5;
        ctx.stroke();

        // State label
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(states[i], pos.x, pos.y);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [n, states, matrix, colors, currentState, animatingTransition, speed, computePositions]);

  // ── Matrix editing ──────────────────────────────────────────────
  const handleMatrixChange = (i, j, value) => {
    const val = parseFloat(value);
    if (isNaN(val) || val < 0 || val > 1) return;
    setMatrix((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[i][j] = val;
      return copy;
    });
  };

  // ── Derived data ────────────────────────────────────────────────
  const totalVisits = visitCounts.reduce((a, b) => a + b, 0);
  const visitFreqs = visitCounts.map((v) => (totalVisits > 0 ? v / totalVisits : 0));
  const steadyState = showSteadyState ? computeSteadyState(matrix) : null;

  const maxFreq = Math.max(...visitFreqs, ...(steadyState || []), 0.01);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Controls bar */}
      <div className="bg-gray-800 rounded-t-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300 font-medium">Preset:</label>
          <select
            className="bg-gray-700 text-white text-sm rounded px-2 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={presetKey}
            onChange={(e) => loadPreset(e.target.value)}
          >
            {Object.entries(PRESETS).map(([key, p]) => (
              <option key={key} value={key}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={stepForward}
            disabled={isPlaying}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded font-medium transition-colors"
          >
            Step
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 text-white text-sm rounded font-medium transition-colors ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={resetChain}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Speed:</label>
          <input
            type="range"
            min={50}
            max={1500}
            step={50}
            value={1550 - speed}
            onChange={(e) => setSpeed(1550 - parseInt(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-xs text-gray-400 w-14">{speed}ms</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showSteadyState}
              onChange={(e) => setShowSteadyState(e.target.checked)}
              className="accent-purple-500"
            />
            Steady State
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={editingMatrix}
              onChange={(e) => setEditingMatrix(e.target.checked)}
              className="accent-purple-500"
            />
            Edit Matrix
          </label>
        </div>
      </div>

      {/* State info bar */}
      <div className="bg-gray-750 bg-gray-900 px-4 py-2 flex flex-wrap items-center gap-4 text-sm border-t border-gray-700">
        <span className="text-gray-300">
          Step: <span className="text-white font-bold">{stepCount}</span>
        </span>
        <span className="text-gray-300">
          Current State:{' '}
          <span className="font-bold" style={{ color: colors[currentState] }}>
            {states[currentState]}
          </span>
        </span>
        <span className="text-gray-400 text-xs ml-auto">Click a state to set as initial</span>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="bg-slate-900 w-full" style={{ minHeight: 300 }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full"
          style={{ display: 'block' }}
        />
      </div>

      {/* Visit frequency bar chart */}
      <div className="bg-gray-900 p-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Visit Frequency (converging to steady state)</h3>
        <div className="flex items-end gap-2 h-32">
          {states.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{(visitFreqs[i] * 100).toFixed(1)}%</span>
              <div className="w-full flex items-end gap-0.5" style={{ height: 80 }}>
                {/* Visit frequency bar */}
                <div
                  className="flex-1 rounded-t transition-all duration-300"
                  style={{
                    height: `${(visitFreqs[i] / maxFreq) * 100}%`,
                    backgroundColor: colors[i] || '#6366f1',
                    opacity: 0.85,
                  }}
                />
                {/* Steady state bar */}
                {steadyState && (
                  <div
                    className="flex-1 rounded-t border-2 border-dashed transition-all duration-300"
                    style={{
                      height: `${(steadyState[i] / maxFreq) * 100}%`,
                      borderColor: colors[i] || '#6366f1',
                      backgroundColor: 'transparent',
                    }}
                  />
                )}
              </div>
              <span className="text-xs text-gray-300 font-medium truncate max-w-full">{label}</span>
              {steadyState && (
                <span className="text-xs text-gray-500">{(steadyState[i] * 100).toFixed(1)}%</span>
              )}
            </div>
          ))}
        </div>
        {steadyState && (
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-gray-500 rounded-sm opacity-70" /> Observed
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-dashed border-gray-500 rounded-sm" /> Steady State
            </span>
          </div>
        )}
      </div>

      {/* Transition matrix */}
      <div className="bg-gray-900 p-4 rounded-b-xl border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Transition Matrix P</h3>
        <div className="overflow-x-auto">
          <table className="text-sm text-center">
            <thead>
              <tr>
                <th className="px-2 py-1 text-gray-500 text-xs">From \ To</th>
                {states.map((s, j) => (
                  <th key={j} className="px-2 py-1 text-xs font-medium" style={{ color: colors[j] }}>
                    {s}
                  </th>
                ))}
                <th className="px-2 py-1 text-gray-500 text-xs">Sum</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => {
                const rowSum = row.reduce((a, b) => a + b, 0);
                const isValid = Math.abs(rowSum - 1) < 0.01;
                return (
                  <tr key={i}>
                    <td className="px-2 py-1 text-xs font-medium" style={{ color: colors[i] }}>
                      {states[i]}
                    </td>
                    {row.map((val, j) => (
                      <td key={j} className="px-1 py-1">
                        {editingMatrix ? (
                          <input
                            type="number"
                            min={0}
                            max={1}
                            step={0.05}
                            value={val}
                            onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                            className="w-16 bg-gray-800 text-white text-center text-xs rounded px-1 py-0.5 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className={`text-xs ${val > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                            {val.toFixed(2)}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className={`px-2 py-1 text-xs font-mono ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                      {rowSum.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {editingMatrix && (
          <p className="text-xs text-gray-500 mt-2">Each row should sum to 1.00 for a valid transition matrix.</p>
        )}
      </div>
    </div>
  );
};

// ── Utility: darken a hex color ─────────────────────────────────────
function darkenColor(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}

export default MarkovChainVisualizer;
