import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ── Loss functions and their gradients ───────────────────────────────────────

const FUNCTIONS = {
  bowl: {
    label: 'Bowl (x² + y²)',
    fn: (x, y) => x * x + y * y,
    grad: (x, y) => ({ dx: 2 * x, dy: 2 * y }),
    range: 3,
    start: { x: 2.5, y: 2.5 },
    minVal: 0,
    maxVal: 18,
  },
  rosenbrock: {
    label: 'Rosenbrock',
    fn: (x, y) => Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2),
    grad: (x, y) => ({
      dx: -2 * (1 - x) + 100 * 2 * (y - x * x) * (-2 * x),
      dy: 100 * 2 * (y - x * x),
    }),
    range: 2,
    start: { x: -1.5, y: 1.5 },
    minVal: 0,
    maxVal: 2500,
  },
  himmelblau: {
    label: "Himmelblau's",
    fn: (x, y) => Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2),
    grad: (x, y) => ({
      dx: 2 * (x * x + y - 11) * (2 * x) + 2 * (x + y * y - 7),
      dy: 2 * (x * x + y - 11) + 2 * (x + y * y - 7) * (2 * y),
    }),
    range: 5,
    start: { x: -4, y: 4 },
    minVal: 0,
    maxVal: 1000,
  },
  rastrigin: {
    label: 'Rastrigin',
    fn: (x, y) =>
      20 +
      x * x -
      10 * Math.cos(2 * Math.PI * x) +
      y * y -
      10 * Math.cos(2 * Math.PI * y),
    grad: (x, y) => ({
      dx: 2 * x + 10 * 2 * Math.PI * Math.sin(2 * Math.PI * x),
      dy: 2 * y + 10 * 2 * Math.PI * Math.sin(2 * Math.PI * y),
    }),
    range: 5,
    start: { x: 4.5, y: 4.5 },
    minVal: 0,
    maxVal: 80,
  },
};

// ── Optimizer colors ──────────────────────────────────────────────────────────

const OPTIMIZERS = [
  { key: 'sgd', label: 'SGD', color: '#f87171' },          // red-400
  { key: 'momentum', label: 'SGD+Momentum', color: '#facc15' }, // yellow-400
  { key: 'rmsprop', label: 'RMSProp', color: '#34d399' },   // emerald-400
  { key: 'adam', label: 'Adam', color: '#818cf8' },          // indigo-400
];

const TRAIL_LENGTH = 80;
const MAX_ITERS = 400;

// ── Optimizer step implementations ───────────────────────────────────────────

function createOptimizerState(funcKey) {
  const func = FUNCTIONS[funcKey];
  return {
    sgd: { x: func.start.x, y: func.start.y },
    momentum: { x: func.start.x, y: func.start.y, vx: 0, vy: 0 },
    rmsprop: { x: func.start.x, y: func.start.y, sx: 1e-8, sy: 1e-8 },
    adam: { x: func.start.x, y: func.start.y, mx: 0, my: 0, vx: 1e-8, vy: 1e-8, t: 0 },
  };
}

function stepOptimizer(key, state, func, lr) {
  const { dx, dy } = func.grad(state.x, state.y);
  const clamp = (v) => Math.max(-10, Math.min(10, v));
  const gdx = clamp(dx);
  const gdy = clamp(dy);

  switch (key) {
    case 'sgd': {
      return { ...state, x: state.x - lr * gdx, y: state.y - lr * gdy };
    }
    case 'momentum': {
      const beta = 0.9;
      const vx = beta * state.vx + lr * gdx;
      const vy = beta * state.vy + lr * gdy;
      return { ...state, x: state.x - vx, y: state.y - vy, vx, vy };
    }
    case 'rmsprop': {
      const beta = 0.99;
      const eps = 1e-8;
      const sx = beta * state.sx + (1 - beta) * gdx * gdx;
      const sy = beta * state.sy + (1 - beta) * gdy * gdy;
      return {
        ...state,
        x: state.x - (lr * gdx) / Math.sqrt(sx + eps),
        y: state.y - (lr * gdy) / Math.sqrt(sy + eps),
        sx,
        sy,
      };
    }
    case 'adam': {
      const beta1 = 0.9;
      const beta2 = 0.999;
      const eps = 1e-8;
      const t = state.t + 1;
      const mx = beta1 * state.mx + (1 - beta1) * gdx;
      const my = beta1 * state.my + (1 - beta1) * gdy;
      const vx = beta2 * state.vx + (1 - beta2) * gdx * gdx;
      const vy = beta2 * state.vy + (1 - beta2) * gdy * gdy;
      const mxHat = mx / (1 - Math.pow(beta1, t));
      const myHat = my / (1 - Math.pow(beta1, t));
      const vxHat = vx / (1 - Math.pow(beta2, t));
      const vyHat = vy / (1 - Math.pow(beta2, t));
      return {
        ...state,
        x: state.x - (lr * mxHat) / (Math.sqrt(vxHat) + eps),
        y: state.y - (lr * myHat) / (Math.sqrt(vyHat) + eps),
        mx,
        my,
        vx,
        vy,
        t,
      };
    }
    default:
      return state;
  }
}

// ── Heatmap color mapping ─────────────────────────────────────────────────────

function lossToColor(normalizedVal) {
  // Blues (low) -> Greens -> Yellows -> Reds (high)
  // Clamp
  const t = Math.max(0, Math.min(1, normalizedVal));

  let r, g, b;
  if (t < 0.25) {
    const s = t / 0.25;
    r = Math.round(5 + s * 5);
    g = Math.round(48 + s * 80);
    b = Math.round(97 + s * 100);
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    r = Math.round(10 + s * 120);
    g = Math.round(128 + s * 72);
    b = Math.round(197 - s * 160);
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    r = Math.round(130 + s * 125);
    g = Math.round(200 - s * 60);
    b = Math.round(37 - s * 20);
  } else {
    const s = (t - 0.75) / 0.25;
    r = Math.round(255);
    g = Math.round(140 - s * 130);
    b = Math.round(17 - s * 10);
  }
  return [r, g, b];
}

// ── Main Component ────────────────────────────────────────────────────────────

const GradientDescentVisualizer = () => {
  const [funcKey, setFuncKey] = useState('bowl');
  const [learningRate, setLearningRate] = useState(0.05);
  const [speed, setSpeed] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);

  // Per-optimizer state (kept in refs for animation loop performance)
  const optimizerStatesRef = useRef(null);
  // Trails: {key: [{x, y}]}
  const trailsRef = useRef(null);
  // Loss history for chart: [{iter, sgd, momentum, rmsprop, adam}]
  const lossHistoryRef = useRef([]);

  // Stats displayed in the stats bar (react state, updated from animation loop)
  const [stats, setStats] = useState(
    OPTIMIZERS.reduce((acc, o) => ({ ...acc, [o.key]: { loss: null, converged: false } }), {})
  );
  const [chartData, setChartData] = useState([]);
  const [iterDisplay, setIterDisplay] = useState(0);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const iterRef = useRef(0);
  const funcKeyRef = useRef(funcKey);
  const lrRef = useRef(learningRate);
  const speedRef = useRef(speed);
  const isRunningRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { funcKeyRef.current = funcKey; }, [funcKey]);
  useEffect(() => { lrRef.current = learningRate; }, [learningRate]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // ── Initialization ──────────────────────────────────────────────────────

  const initState = useCallback((fKey) => {
    optimizerStatesRef.current = createOptimizerState(fKey);
    trailsRef.current = OPTIMIZERS.reduce((acc, o) => {
      const func = FUNCTIONS[fKey];
      acc[o.key] = [{ x: func.start.x, y: func.start.y }];
      return acc;
    }, {});
    lossHistoryRef.current = [];
    iterRef.current = 0;
    setIteration(0);
    setIterDisplay(0);
    setChartData([]);
    setStats(
      OPTIMIZERS.reduce((acc, o) => {
        const func = FUNCTIONS[fKey];
        const loss = func.fn(func.start.x, func.start.y);
        return { ...acc, [o.key]: { loss, converged: false } };
      }, {})
    );
  }, []);

  useEffect(() => {
    initState(funcKey);
  }, [funcKey, initState]);

  // ── Canvas drawing ──────────────────────────────────────────────────────

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const func = FUNCTIONS[funcKeyRef.current];
    const range = func.range;

    // Draw heatmap using ImageData
    const imageData = ctx.createImageData(W, H);
    const data = imageData.data;
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const wx = (px / W) * 2 * range - range;
        const wy = range - (py / H) * 2 * range;
        const raw = func.fn(wx, wy);
        // Use log scale for better visual contrast
        const logMax = Math.log(func.maxVal + 1);
        const logVal = Math.log(Math.max(0, raw) + 1);
        const normalized = Math.min(1, logVal / logMax);
        const [r, g, b] = lossToColor(normalized);
        const idx = (py * W + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Helper: world -> canvas
    const toCanvas = (wx, wy) => ({
      cx: ((wx + range) / (2 * range)) * W,
      cy: ((range - wy) / (2 * range)) * H,
    });

    // Draw trails
    const trails = trailsRef.current;
    if (trails) {
      OPTIMIZERS.forEach((opt) => {
        const trail = trails[opt.key];
        if (!trail || trail.length < 2) return;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        const start = Math.max(0, trail.length - TRAIL_LENGTH);
        for (let i = start; i < trail.length - 1; i++) {
          const alpha = (i - start) / (trail.length - 1 - start);
          ctx.globalAlpha = 0.3 + alpha * 0.7;
          ctx.strokeStyle = opt.color;
          ctx.beginPath();
          const { cx: x1, cy: y1 } = toCanvas(trail[i].x, trail[i].y);
          const { cx: x2, cy: y2 } = toCanvas(trail[i + 1].x, trail[i + 1].y);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Draw current position dot
        const pos = trail[trail.length - 1];
        const { cx, cy } = toCanvas(pos.x, pos.y);
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = opt.color;
        ctx.shadowColor = opt.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Optimizer label near dot
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = opt.color;
        ctx.fillText(opt.label, cx + 8, cy - 6);
      });
    }

    // Draw minimum marker for bowl-like functions
    if (funcKeyRef.current === 'bowl') {
      const { cx, cy } = toCanvas(0, 0);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fill();
    }

    // Draw color scale legend
    const legendX = W - 20;
    const legendY = 20;
    const legendH = 120;
    for (let i = 0; i < legendH; i++) {
      const t = 1 - i / legendH;
      const [r, g, b] = lossToColor(t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(legendX, legendY + i, 14, 1);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 14, legendH);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('High', legendX - 28, legendY + 8);
    ctx.fillText('Low', legendX - 22, legendY + legendH);
  }, []);

  // ── Animation loop ──────────────────────────────────────────────────────

  const tick = useCallback(() => {
    if (!isRunningRef.current) return;

    const stepsPerFrame = speedRef.current;
    const func = FUNCTIONS[funcKeyRef.current];
    const lr = lrRef.current;

    let newStats = {};
    for (let s = 0; s < stepsPerFrame; s++) {
      if (iterRef.current >= MAX_ITERS) {
        isRunningRef.current = false;
        setIsRunning(false);
        break;
      }

      const newEntry = { iter: iterRef.current };
      OPTIMIZERS.forEach((opt) => {
        const state = optimizerStatesRef.current[opt.key];
        // Check if in bounds
        const inBounds =
          Math.abs(state.x) <= func.range * 1.5 &&
          Math.abs(state.y) <= func.range * 1.5;

        if (inBounds) {
          const newState = stepOptimizer(opt.key, state, func, lr);
          optimizerStatesRef.current[opt.key] = newState;
          const loss = func.fn(newState.x, newState.y);
          trailsRef.current[opt.key].push({ x: newState.x, y: newState.y });
          newEntry[opt.key] = Math.max(0, loss);
          const converged = loss < 0.01 || (iterRef.current > 5 && Math.abs(loss) < 0.001);
          newStats[opt.key] = { loss, converged };
        } else {
          const loss = func.fn(state.x, state.y);
          newEntry[opt.key] = Math.max(0, loss);
          newStats[opt.key] = { loss, converged: false };
        }
      });

      // Store every 5th iteration for chart to keep it manageable
      if (iterRef.current % 5 === 0) {
        lossHistoryRef.current.push(newEntry);
      }

      iterRef.current++;
    }

    setIterDisplay(iterRef.current);
    setStats(newStats);

    // Update chart data (show last 60 data points)
    const history = lossHistoryRef.current;
    const slice = history.slice(Math.max(0, history.length - 60));
    setChartData([...slice]);

    drawCanvas();
    animFrameRef.current = requestAnimationFrame(tick);
  }, [drawCanvas]);

  // ── Running control ─────────────────────────────────────────────────────

  useEffect(() => {
    isRunningRef.current = isRunning;
    if (isRunning) {
      animFrameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, tick]);

  // Initial draw
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, funcKey]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    initState(funcKeyRef.current);
    setTimeout(() => drawCanvas(), 0);
  }, [initState, drawCanvas]);

  const handleTogglePlay = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;
      isRunningRef.current = next;
      return next;
    });
  }, []);

  const handleFuncChange = (e) => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const newKey = e.target.value;
    setFuncKey(newKey);
    funcKeyRef.current = newKey;
    initState(newKey);
    setTimeout(() => drawCanvas(), 0);
  };

  useVisualizationShortcuts({ onTogglePlay: handleTogglePlay, onReset: handleReset });

  // ── Chart formatting ─────────────────────────────────────────────────────

  const formatLoss = (v) => {
    if (v === null || v === undefined) return '—';
    if (v < 0.001) return v.toExponential(2);
    if (v >= 1000) return v.toFixed(0);
    return v.toFixed(4);
  };

  const isConverged = (loss) => loss !== null && loss < 0.01;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls */}
      <div className="bg-gray-800 rounded-t-xl p-4 flex flex-wrap items-center gap-4 text-sm text-gray-200">
        {/* Play / Pause / Reset */}
        <div className="flex gap-2">
          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-500 text-white transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Function selector */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-0.5">Loss Function</label>
          <select
            value={funcKey}
            onChange={handleFuncChange}
            className="bg-gray-700 text-gray-200 rounded-lg px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(FUNCTIONS).map(([key, f]) => (
              <option key={key} value={key}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Learning rate slider */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-0.5">
            Learning Rate: {learningRate.toFixed(3)}
          </label>
          <input
            type="range"
            min={0.001}
            max={1.0}
            step={0.001}
            value={learningRate}
            onChange={(e) => setLearningRate(Number(e.target.value))}
            className="w-32 accent-blue-500"
          />
        </div>

        {/* Speed slider */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-0.5">Speed: {speed}x</label>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-28 accent-purple-500"
          />
        </div>

        {/* Iteration counter */}
        <div className="ml-auto text-xs text-gray-400">
          Iter: <span className="text-white font-mono font-bold">{iterDisplay}</span>
          <span className="text-gray-500"> / {MAX_ITERS}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full bg-gray-900">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full block"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Stats bar */}
      <div className="bg-gray-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
        {OPTIMIZERS.map((opt) => {
          const s = stats[opt.key];
          const loss = s ? s.loss : null;
          const converged = s ? s.converged : false;
          return (
            <div key={opt.key} className="bg-gray-700 rounded-lg p-2">
              <div className="text-xs mb-1 font-semibold" style={{ color: opt.color }}>
                {opt.label}
              </div>
              <div className="text-white font-bold font-mono text-sm">
                {loss !== null ? formatLoss(loss) : '—'}
              </div>
              <div className="text-xs mt-0.5">
                {converged ? (
                  <span className="text-emerald-400">Converged</span>
                ) : (
                  <span className="text-gray-500">Running...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Convergence chart */}
      <div className="bg-gray-900 rounded-b-xl p-4">
        <div className="text-xs text-gray-400 mb-2 text-center font-semibold tracking-wide uppercase">
          Loss over Iterations
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="iter"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              label={{ value: 'Iteration', position: 'insideBottom', fill: '#6b7280', fontSize: 11, dy: 10 }}
              height={30}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2))}
              width={55}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#e5e7eb', fontSize: 11 }}
              itemStyle={{ fontSize: 11 }}
              formatter={(v, name) => [formatLoss(v), name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value) => (
                <span style={{ color: OPTIMIZERS.find((o) => o.key === value)?.color ?? '#fff' }}>
                  {OPTIMIZERS.find((o) => o.key === value)?.label ?? value}
                </span>
              )}
            />
            {OPTIMIZERS.map((opt) => (
              <Line
                key={opt.key}
                type="monotone"
                dataKey={opt.key}
                stroke={opt.color}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Optimizer legend */}
      <div className="mt-3 flex flex-wrap gap-4 justify-center text-xs text-gray-400">
        {OPTIMIZERS.map((opt) => (
          <span key={opt.key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: opt.color }}
            />
            {opt.label}
          </span>
        ))}
      </div>

      <KeyboardShortcutHint />
    </div>
  );
};

export default GradientDescentVisualizer;
