import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// ─── Mode definitions ─────────────────────────────────────────────────────────

const MODES = {
  PI: 'pi',
  INTEGRATE: 'integrate',
  BUFFON: 'buffon',
};

const FUNCTION_DEFS = {
  sin: {
    label: 'sin(x)  [0, π]',
    fn: (x) => Math.sin(x),
    xMin: 0,
    xMax: Math.PI,
    yMin: 0,
    yMax: 1,
    trueValue: 2,           // ∫₀^π sin(x)dx = 2
    trueLabel: '2.000000',
  },
  xsq: {
    label: 'x²  [0, 1]',
    fn: (x) => x * x,
    xMin: 0,
    xMax: 1,
    yMin: 0,
    yMax: 1,
    trueValue: 1 / 3,       // ∫₀¹ x² dx = 1/3
    trueLabel: '0.333333',
  },
  gauss: {
    label: 'e^(−x²)  [−2, 2]',
    fn: (x) => Math.exp(-x * x),
    xMin: -2,
    xMax: 2,
    yMin: 0,
    yMax: 1,
    trueValue: Math.sqrt(Math.PI) * (1 - 2 * 0.004677734981),  // erf(2)*√π ≈ 1.764162
    trueLabel: '1.764162',
  },
};

const SPEEDS = [1, 10, 100, 1000];

// ─── Math helpers ─────────────────────────────────────────────────────────────

function trueValueForMode(mode, funcKey) {
  if (mode === MODES.PI || mode === MODES.BUFFON) return Math.PI;
  return FUNCTION_DEFS[funcKey].trueValue;
}

// ─── Canvas drawing helpers ──────────────────────────────────────────────────

const CANVAS_W = 800;
const CANVAS_H = 500;

function clearCanvas(ctx, w, h) {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, w, h);
}

// Draw the unit-circle quarter for Pi mode
function drawPiBackground(ctx, w, h) {
  clearCanvas(ctx, w, h);
  const pad = 30;
  const size = Math.min(w, h) - pad * 2;
  const ox = pad;
  const oy = pad;

  // Square border
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ox, oy, size, size);

  // Quarter circle
  ctx.beginPath();
  ctx.arc(ox, oy + size, size, -Math.PI / 2, 0);
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('(1,0)', ox + size, oy + size + 16);
  ctx.fillText('(0,1)', ox - 10, oy + 8);
  ctx.textAlign = 'left';
}

// Draw function bounding box for integrate mode
function drawIntegrateBackground(ctx, w, h, funcKey) {
  clearCanvas(ctx, w, h);
  const def = FUNCTION_DEFS[funcKey];
  const pad = 40;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  // Bounding box
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad, pad, innerW, innerH);

  // Function curve
  ctx.beginPath();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const xVal = def.xMin + t * (def.xMax - def.xMin);
    const yVal = def.fn(xVal);
    const canvasX = pad + t * innerW;
    const canvasY = pad + innerH - ((yVal - def.yMin) / (def.yMax - def.yMin)) * innerH;
    if (i === 0) ctx.moveTo(canvasX, canvasY);
    else ctx.lineTo(canvasX, canvasY);
  }
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#9ca3af';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(def.xMin.toFixed(2), pad, h - 8);
  ctx.fillText(def.xMax.toFixed(2), pad + innerW, h - 8);
  ctx.textAlign = 'right';
  ctx.fillText(def.yMax.toFixed(1), pad - 4, pad + 4);
  ctx.fillText(def.yMin.toFixed(1), pad - 4, pad + innerH + 4);
}

// Draw Buffon's needle lines
function drawBuffonBackground(ctx, w, h, lineSpacing) {
  clearCanvas(ctx, w, h);
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  const numLines = Math.floor(h / lineSpacing) + 1;
  for (let i = 0; i <= numLines; i++) {
    const y = (i * lineSpacing) % h + (lineSpacing / 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // Label spacing
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`d = ${lineSpacing}px`, 6, 14);
}

// ─── Main Component ──────────────────────────────────────────────────────────

const MonteCarloVisualizer = () => {
  const [mode, setMode] = useState(MODES.PI);
  const [funcKey, setFuncKey] = useState('sin');
  const [speed, setSpeed] = useState(100);
  const [playing, setPlaying] = useState(false);

  // Simulation state (stored in refs for perf, mirrored to React state for display)
  const simRef = useRef({
    totalSamples: 0,
    hits: 0,
    estimate: 0,
    history: [],          // [{n, estimate}]
  });

  const [displayStats, setDisplayStats] = useState({
    totalSamples: 0,
    hits: 0,
    estimate: 0,
    error: 0,
    history: [],
  });

  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Needle length for Buffon (half-length relative to line spacing)
  const BUFFON_LINE_SPACING = 80;
  const BUFFON_NEEDLE_HALF = 30; // needle half-length in pixels

  // ── Reset ─────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setPlaying(false);
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    simRef.current = { totalSamples: 0, hits: 0, estimate: 0, history: [] };
    setDisplayStats({ totalSamples: 0, hits: 0, estimate: 0, error: 0, history: [] });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    if (mode === MODES.PI) drawPiBackground(ctx, w, h);
    else if (mode === MODES.INTEGRATE) drawIntegrateBackground(ctx, w, h, funcKey);
    else drawBuffonBackground(ctx, w, h, BUFFON_LINE_SPACING);
  }, [mode, funcKey]);

  // Reset when mode or funcKey changes
  useEffect(() => { reset(); }, [reset]);

  useVisualizationShortcuts({ onTogglePlay: () => setPlaying(p => !p), onReset: reset });

  // ── Sample functions ───────────────────────────────────────────────────────

  const samplePi = useCallback((ctx, w, h) => {
    const pad = 30;
    const size = Math.min(w, h) - pad * 2;
    const ox = pad;
    const oy = pad + size; // origin at bottom-left

    const x = Math.random();
    const y = Math.random();
    const inside = x * x + y * y <= 1;

    // Canvas coordinates
    const cx = ox + x * size;
    const cy = oy - y * size;

    ctx.fillStyle = inside ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    return inside ? 1 : 0;
  }, []);

  const sampleIntegrate = useCallback((ctx, w, h) => {
    const def = FUNCTION_DEFS[funcKey];
    const pad = 40;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    const xRand = Math.random();
    const yRand = Math.random();
    const xVal = def.xMin + xRand * (def.xMax - def.xMin);
    const yVal = def.yMin + yRand * (def.yMax - def.yMin);
    const fVal = def.fn(xVal);
    const inside = yVal <= fVal;

    const cx = pad + xRand * innerW;
    const cy = pad + innerH - yRand * innerH;

    ctx.fillStyle = inside ? 'rgba(34,197,94,0.65)' : 'rgba(239,68,68,0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    return inside ? 1 : 0;
  }, [funcKey]);

  const sampleBuffon = useCallback((ctx, w, h) => {
    // Random center position and angle
    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const theta = Math.random() * Math.PI; // [0, π]

    const dx = BUFFON_NEEDLE_HALF * Math.cos(theta);
    const dy = BUFFON_NEEDLE_HALF * Math.sin(theta);

    const x1 = cx - dx;
    const y1 = cy - dy;
    const x2 = cx + dx;
    const y2 = cy + dy;

    // Check if needle crosses any horizontal line (spaced BUFFON_LINE_SPACING apart)
    const lineOffset = BUFFON_LINE_SPACING / 2;
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    // Find the nearest line below minY
    const firstLine = Math.ceil((minY - lineOffset) / BUFFON_LINE_SPACING) * BUFFON_LINE_SPACING + lineOffset;
    const crosses = firstLine <= maxY;

    ctx.strokeStyle = crosses ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    return crosses ? 1 : 0;
  }, []);

  // ── Animation loop ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!playing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    let frameId;

    const step = () => {
      const sim = simRef.current;
      const def = mode === MODES.INTEGRATE ? FUNCTION_DEFS[funcKey] : null;

      for (let i = 0; i < speed; i++) {
        let hit = 0;
        if (mode === MODES.PI) hit = samplePi(ctx, w, h);
        else if (mode === MODES.INTEGRATE) hit = sampleIntegrate(ctx, w, h);
        else hit = sampleBuffon(ctx, w, h);

        sim.hits += hit;
        sim.totalSamples += 1;
      }

      // Compute running estimate
      let estimate;
      if (mode === MODES.PI) {
        estimate = (sim.hits / sim.totalSamples) * 4;
      } else if (mode === MODES.INTEGRATE) {
        const boxArea = (def.xMax - def.xMin) * (def.yMax - def.yMin);
        estimate = (sim.hits / sim.totalSamples) * boxArea;
      } else {
        // Buffon: π ≈ (2 * L * n) / (d * hits)
        // L = needle length, d = line spacing
        const L = BUFFON_NEEDLE_HALF * 2;
        const d = BUFFON_LINE_SPACING;
        estimate = sim.hits > 0 ? (2 * L * sim.totalSamples) / (d * sim.hits) : 0;
      }

      sim.estimate = estimate;

      // Record history every 50 samples (but cap history length for performance)
      if (sim.totalSamples % 50 === 0 || sim.totalSamples <= 10) {
        const entry = { n: sim.totalSamples, estimate: parseFloat(estimate.toFixed(6)) };
        if (sim.history.length < 500) {
          sim.history = [...sim.history, entry];
        } else {
          // Thin history: keep every other point when at cap
          const thinned = sim.history.filter((_, idx) => idx % 2 === 0);
          sim.history = [...thinned, entry];
        }
      }

      const trueVal = trueValueForMode(mode, funcKey);
      const errorPct = trueVal !== 0 ? Math.abs((estimate - trueVal) / trueVal) * 100 : 0;

      setDisplayStats({
        totalSamples: sim.totalSamples,
        hits: sim.hits,
        estimate,
        error: errorPct,
        history: sim.history,
      });

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    animRef.current = frameId;

    return () => {
      cancelAnimationFrame(frameId);
      animRef.current = null;
    };
  }, [playing, mode, funcKey, speed, samplePi, sampleIntegrate, sampleBuffon]);

  // ── Derived display values ─────────────────────────────────────────────────

  const trueVal = trueValueForMode(mode, funcKey);

  const trueLabelStr =
    mode === MODES.PI
      ? Math.PI.toFixed(6)
      : mode === MODES.INTEGRATE
      ? FUNCTION_DEFS[funcKey].trueLabel
      : Math.PI.toFixed(6);

  const estimateLabel =
    mode === MODES.PI
      ? 'π Estimate'
      : mode === MODES.INTEGRATE
      ? 'Integral Estimate'
      : 'π Estimate (Buffon)';

  const modeLabel =
    mode === MODES.PI
      ? 'Estimate π'
      : mode === MODES.INTEGRATE
      ? 'Integrate Function'
      : "Buffon's Needle";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls bar */}
      <div className="bg-gray-800 rounded-t-xl p-4 flex flex-wrap items-center gap-4 text-sm text-gray-200">

        {/* Mode selector */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Mode</label>
          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value); }}
            className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value={MODES.PI}>Estimate π</option>
            <option value={MODES.INTEGRATE}>Integrate Function</option>
            <option value={MODES.BUFFON}>Buffon's Needle</option>
          </select>
        </div>

        {/* Function selector (only for integrate mode) */}
        {mode === MODES.INTEGRATE && (
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Function</label>
            <select
              value={funcKey}
              onChange={(e) => { setFuncKey(e.target.value); }}
              className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Object.entries(FUNCTION_DEFS).map(([key, def]) => (
                <option key={key} value={key}>{def.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Speed selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Samples/frame</label>
          <div className="flex gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                  speed === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Play/Pause & Reset buttons */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPlaying(p => !p)}
            className={`px-5 py-2 rounded font-medium text-sm transition-colors ${
              playing
                ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={reset}
            className="px-5 py-2 rounded font-medium text-sm bg-red-700 hover:bg-red-800 text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full bg-gray-900">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full block"
        />
      </div>

      {/* Stats bar */}
      <div className="bg-gray-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-0.5">Total Samples</div>
          <div className="text-white font-bold font-mono text-base">
            {displayStats.totalSamples.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-0.5">{estimateLabel}</div>
          <div className="text-green-400 font-bold font-mono text-base">
            {displayStats.totalSamples > 0 ? displayStats.estimate.toFixed(6) : '—'}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-0.5">True Value</div>
          <div className="text-blue-400 font-bold font-mono text-base">{trueLabelStr}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-0.5">Error %</div>
          <div className={`font-bold font-mono text-base ${
            displayStats.error < 0.5
              ? 'text-green-400'
              : displayStats.error < 2
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}>
            {displayStats.totalSamples > 0 ? displayStats.error.toFixed(3) + '%' : '—'}
          </div>
        </div>
      </div>

      {/* Convergence Chart */}
      <div className="bg-gray-900 p-4 rounded-b-xl">
        <h3 className="text-gray-300 text-sm font-medium mb-3 text-center">
          Convergence: {modeLabel}
        </h3>
        {displayStats.history.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={displayStats.history}
              margin={{ top: 8, right: 20, left: 10, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="n"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                label={{ value: 'Samples (n)', position: 'insideBottom', offset: -4, fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                domain={['auto', 'auto']}
                tickFormatter={(v) => v.toFixed(3)}
                width={60}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
                labelStyle={{ color: '#9ca3af', fontSize: '11px' }}
                itemStyle={{ color: '#34d399', fontSize: '11px' }}
                formatter={(v) => [v.toFixed(6), estimateLabel]}
                labelFormatter={(n) => `n = ${Number(n).toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <ReferenceLine
                y={trueVal}
                stroke="#60a5fa"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{ value: `True: ${trueLabelStr}`, position: 'right', fill: '#60a5fa', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="estimate"
                name={estimateLabel}
                stroke="#34d399"
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">
            Press <span className="mx-1 px-2 py-0.5 bg-gray-700 rounded text-gray-300 font-mono text-xs">Play</span> to start the simulation
          </div>
        )}
      </div>

      <KeyboardShortcutHint />
    </div>
  );
};

export default MonteCarloVisualizer;
