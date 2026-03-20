import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';

// Polyfill for roundRect (not available in all browsers)
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
    const radius = typeof r === 'object' ? r : { tl: r, tr: r, br: r, bl: r };
    const tl = radius.tl || 0, tr = radius.tr || 0, br = radius.br || 0, bl = radius.bl || 0;
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

const FUNCTIONS = {
  sin: {
    label: 'sin(x)',
    fn: Math.sin,
    // Taylor coefficients: sin(x) = x - x^3/3! + x^5/5! - ...
    taylorTerm: (n) => {
      // n-th term (0-indexed): coefficient of x^k where k = 2n+1
      const k = 2 * n + 1;
      let fact = 1;
      for (let i = 2; i <= k; i++) fact *= i;
      return { coeff: Math.pow(-1, n) / fact, power: k };
    },
    color: '#2563eb',
    radiusOfConvergence: Infinity,
    rocLabel: 'R = \u221e',
  },
  cos: {
    label: 'cos(x)',
    fn: Math.cos,
    taylorTerm: (n) => {
      const k = 2 * n;
      let fact = 1;
      for (let i = 2; i <= k; i++) fact *= i;
      return { coeff: Math.pow(-1, n) / (k === 0 ? 1 : fact), power: k };
    },
    color: '#2563eb',
    radiusOfConvergence: Infinity,
    rocLabel: 'R = \u221e',
  },
  exp: {
    label: 'e^x',
    fn: Math.exp,
    taylorTerm: (n) => {
      let fact = 1;
      for (let i = 2; i <= n; i++) fact *= i;
      return { coeff: 1 / fact, power: n };
    },
    color: '#2563eb',
    radiusOfConvergence: Infinity,
    rocLabel: 'R = \u221e',
  },
  ln: {
    label: 'ln(1+x)',
    fn: (x) => Math.log(1 + x),
    taylorTerm: (n) => {
      // ln(1+x) = x - x^2/2 + x^3/3 - x^4/4 + ...
      // n-th term (0-indexed): n=0 => x^1/1, n=1 => -x^2/2, ...
      const k = n + 1;
      return { coeff: Math.pow(-1, n) / k, power: k };
    },
    color: '#2563eb',
    radiusOfConvergence: 1,
    rocLabel: 'R = 1',
  },
};

const MAX_TERMS = 20;

const PRESETS = {
  sinBasic: { label: 'sin(x) - 5 terms', func: 'sin', numTerms: 5 },
  expConverge: { label: 'exp(x) - 10 terms', func: 'exp', numTerms: 10 },
  lnExpand: { label: 'ln(1+x) - 8 terms', func: 'ln', numTerms: 8 },
  cosHighOrder: { label: 'cos(x) - 15 terms', func: 'cos', numTerms: 15 },
};

const TaylorSeriesVisualizer = () => {
  const [selectedFn, setSelectedFn] = useState('sin');
  const [numTerms, setNumTerms] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewXRange, setViewXRange] = useState(8);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastTickRef = useRef(0);
  const statsRef = useRef({ maxError: 0 });
  const [stats, setStats] = useState({ maxError: 0 });

  useVisualizationShortcuts({ onTogglePlay: () => setIsPlaying(p => !p) });

  const loadPreset = useCallback((key) => {
    const p = PRESETS[key];
    if (!p) return;
    setIsPlaying(false);
    setSelectedFn(p.func);
    setNumTerms(p.numTerms);
  }, []);

  // Evaluate Taylor polynomial at x for given function and number of terms
  const evalTaylor = useCallback((fnKey, x, nTerms) => {
    const fnDef = FUNCTIONS[fnKey];
    let sum = 0;
    for (let i = 0; i < nTerms; i++) {
      const { coeff, power } = fnDef.taylorTerm(i);
      sum += coeff * Math.pow(x, power);
    }
    return sum;
  }, []);

  // Build the formula string for display
  const getFormulaTerms = useCallback((fnKey, nTerms) => {
    const terms = [];
    for (let i = 0; i < nTerms; i++) {
      const { coeff, power } = FUNCTIONS[fnKey].taylorTerm(i);
      // Build readable term
      let sign = coeff >= 0 ? '+' : '-';
      let absCoeff = Math.abs(coeff);

      let coeffStr;
      // Check if it's 1/n! pattern
      let denom = 1;
      for (let j = 2; j <= power; j++) denom *= j;
      if (Math.abs(absCoeff - 1 / denom) < 1e-15 && power > 0) {
        coeffStr = denom === 1 ? '' : `1/${denom}`;
      } else if (Math.abs(absCoeff - 1) < 1e-15) {
        coeffStr = power === 0 ? '1' : '';
      } else {
        // For ln(1+x): coeff is 1/k
        const invCoeff = Math.round(1 / absCoeff);
        if (Math.abs(absCoeff * invCoeff - 1) < 1e-12) {
          coeffStr = `1/${invCoeff}`;
        } else {
          coeffStr = absCoeff.toFixed(4);
        }
      }

      let powerStr;
      if (power === 0) powerStr = '';
      else if (power === 1) powerStr = 'x';
      else powerStr = `x^${power}`;

      let term = coeffStr + (coeffStr && powerStr ? '\u00b7' : '') + powerStr;
      if (!term) term = '1';

      if (i === 0) {
        terms.push(coeff < 0 ? `-${term}` : term);
      } else {
        terms.push(` ${sign} ${term}`);
      }
    }
    return terms.join('');
  }, []);

  // Compute max error in the visible range
  const computeMaxError = useCallback((fnKey, nTerms, xRange) => {
    const fnDef = FUNCTIONS[fnKey];
    let maxErr = 0;
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = -xRange + (2 * xRange * i) / steps;
      // For ln(1+x), skip where the function is undefined
      if (fnKey === 'ln' && x <= -1) continue;
      const actual = fnDef.fn(x);
      const approx = evalTaylor(fnKey, x, nTerms);
      if (isFinite(actual) && isFinite(approx)) {
        maxErr = Math.max(maxErr, Math.abs(actual - approx));
      }
    }
    return maxErr;
  }, [evalTaylor]);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      const tick = (ts) => {
        if (ts - lastTickRef.current > 800) {
          lastTickRef.current = ts;
          setNumTerms((prev) => {
            if (prev >= MAX_TERMS) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }
        animationRef.current = requestAnimationFrame(tick);
      };
      lastTickRef.current = performance.now();
      animationRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Draw frame whenever parameters change
  useEffect(() => {
    drawFrame();
    const err = computeMaxError(selectedFn, numTerms, viewXRange);
    statsRef.current.maxError = err;
    setStats({ maxError: err });
  }, [selectedFn, numTerms, viewXRange]);

  // Canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = Math.max(500, Math.min(600, window.innerHeight * 0.6));
      drawFrame();
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedFn, numTerms, viewXRange]);

  // Main drawing function
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const fnDef = FUNCTIONS[selectedFn];

    const xMin = -viewXRange;
    const xMax = viewXRange;
    const yRange = viewXRange * (H / W);
    const yMin = -yRange;
    const yMax = yRange;

    // Coordinate transforms
    const toScreenX = (x) => ((x - xMin) / (xMax - xMin)) * W;
    const toScreenY = (y) => H - ((y - yMin) / (yMax - yMin)) * H;
    const fromScreenX = (sx) => xMin + (sx / W) * (xMax - xMin);

    // --- Background gradient ---
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#f8fafc');
    bg.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // --- Grid ---
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;

    // Vertical grid lines
    const gridStep = viewXRange <= 4 ? 0.5 : viewXRange <= 8 ? 1 : 2;
    for (let x = Math.ceil(xMin / gridStep) * gridStep; x <= xMax; x += gridStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, H);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = Math.ceil(yMin / gridStep) * gridStep; y <= yMax; y += gridStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
      ctx.stroke();
    }

    // --- Axes ---
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;

    // X axis
    const axisY = toScreenY(0);
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(W, axisY);
    ctx.stroke();

    // Y axis
    const axisX = toScreenX(0);
    ctx.beginPath();
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, H);
    ctx.stroke();

    // --- Axis labels ---
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      if (x === 0) continue;
      const sx = toScreenX(x);
      ctx.fillText(x.toString(), sx, axisY + 15);
      // Tick mark
      ctx.beginPath();
      ctx.moveTo(sx, axisY - 3);
      ctx.lineTo(sx, axisY + 3);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      if (y === 0) continue;
      const sy = toScreenY(y);
      ctx.fillText(y.toString(), axisX - 8, sy + 4);
      ctx.beginPath();
      ctx.moveTo(axisX - 3, sy);
      ctx.lineTo(axisX + 3, sy);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Origin label
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText('0', axisX - 6, axisY + 14);

    // --- Radius of convergence shading for ln(1+x) ---
    if (fnDef.radiusOfConvergence !== Infinity) {
      const roc = fnDef.radiusOfConvergence;
      const leftBound = toScreenX(-roc);
      const rightBound = toScreenX(roc);

      // Shade outside the radius of convergence
      ctx.fillStyle = 'rgba(239, 68, 68, 0.06)';
      ctx.fillRect(0, 0, Math.max(0, leftBound), H);
      ctx.fillRect(Math.min(W, rightBound), 0, W - Math.min(W, rightBound), H);

      // Draw convergence boundaries
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(leftBound, 0);
      ctx.lineTo(leftBound, H);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightBound, 0);
      ctx.lineTo(rightBound, H);
      ctx.stroke();

      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Radius of Convergence: ${fnDef.rocLabel}`, W / 2, 20);
    }

    // --- Plot original function ---
    ctx.strokeStyle = fnDef.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    const plotSteps = W * 2;
    for (let i = 0; i <= plotSteps; i++) {
      const x = fromScreenX((i / plotSteps) * W);
      let y = fnDef.fn(x);
      if (!isFinite(y) || Math.abs(y) > yMax * 3) {
        started = false;
        continue;
      }
      const sx = (i / plotSteps) * W;
      const sy = toScreenY(y);
      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // --- Plot Taylor approximation ---
    const approxGrad = ctx.createLinearGradient(0, 0, W, 0);
    approxGrad.addColorStop(0, '#f97316');
    approxGrad.addColorStop(0.5, '#ef4444');
    approxGrad.addColorStop(1, '#f97316');
    ctx.strokeStyle = approxGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    started = false;
    for (let i = 0; i <= plotSteps; i++) {
      const x = fromScreenX((i / plotSteps) * W);
      let y = evalTaylor(selectedFn, x, numTerms);
      // Clamp to avoid huge values going off screen
      if (!isFinite(y)) { started = false; continue; }
      const clampedY = Math.max(yMin * 2, Math.min(yMax * 2, y));
      const sx = (i / plotSteps) * W;
      const sy = toScreenY(clampedY);
      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // --- Error shading between curves ---
    ctx.fillStyle = 'rgba(249, 115, 22, 0.08)';
    ctx.beginPath();
    for (let i = 0; i <= plotSteps; i++) {
      const x = fromScreenX((i / plotSteps) * W);
      let yActual = fnDef.fn(x);
      if (!isFinite(yActual)) continue;
      const sx = (i / plotSteps) * W;
      const sy = toScreenY(Math.max(yMin, Math.min(yMax, yActual)));
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    for (let i = plotSteps; i >= 0; i--) {
      const x = fromScreenX((i / plotSteps) * W);
      let yApprox = evalTaylor(selectedFn, x, numTerms);
      if (!isFinite(yApprox)) continue;
      const clampedY = Math.max(yMin, Math.min(yMax, yApprox));
      const sx = (i / plotSteps) * W;
      const sy = toScreenY(clampedY);
      ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();

    // --- Legend ---
    const legendX = W - 200;
    const legendY = 30;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, 185, 58, 8);
    ctx.fill();
    ctx.stroke();

    // Original function line
    ctx.strokeStyle = fnDef.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(legendX + 10, legendY + 18);
    ctx.lineTo(legendX + 40, legendY + 18);
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`f(x) = ${fnDef.label}`, legendX + 48, legendY + 22);

    // Approximation line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX + 10, legendY + 42);
    ctx.lineTo(legendX + 40, legendY + 42);
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`Taylor (${numTerms} term${numTerms > 1 ? 's' : ''})`, legendX + 48, legendY + 46);

    // --- Formula display at bottom ---
    const formula = getFormulaTerms(selectedFn, numTerms);
    const formulaText = `T(x) = ${formula}${numTerms < MAX_TERMS ? ' + ...' : ''}`;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    const formulaWidth = Math.min(W - 40, ctx.measureText(formulaText).width + 40);
    const formulaX = (W - Math.max(formulaWidth, 300)) / 2;
    ctx.beginPath();
    ctx.roundRect(formulaX, H - 50, Math.max(formulaWidth, 300), 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    // Truncate if too long
    const maxFormulaLen = Math.floor((W - 80) / 8);
    const displayFormula = formulaText.length > maxFormulaLen
      ? formulaText.slice(0, maxFormulaLen - 3) + '...'
      : formulaText;
    ctx.fillText(displayFormula, W / 2, H - 28);
  }, [selectedFn, numTerms, viewXRange, evalTaylor, getFormulaTerms]);

  const handleFnSelect = useCallback((key) => {
    setSelectedFn(key);
    setNumTerms(1);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (numTerms >= MAX_TERMS) {
      setNumTerms(1);
    }
    setIsPlaying((prev) => !prev);
  }, [numTerms]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setNumTerms(1);
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Taylor Series Approximation Visualizer</h2>
            <p className="text-gray-600 max-w-3xl">
              Watch how adding more terms to a Taylor polynomial makes it converge toward
              the original function. Select a function, adjust the number of terms, or press
              play to animate the convergence.
            </p>
          </div>

          <div className="flex space-x-3 mt-2 sm:mt-0">
            <button
              onClick={handlePlayPause}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isPlaying
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isPlaying ? 'Pause' : 'Play'}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button key={key} onClick={() => loadPreset(key)}
                className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Function selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Function</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FUNCTIONS).map(([key, def]) => (
              <button
                key={key}
                onClick={() => handleFnSelect(key)}
                className={`px-4 py-2 text-sm rounded-md border font-medium transition-colors ${
                  selectedFn === key
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                }`}
              >
                {def.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Terms: <span className="font-mono font-bold text-blue-600">{numTerms}</span>
            </label>
            <input
              type="range"
              min="1"
              max={MAX_TERMS}
              step="1"
              value={numTerms}
              onChange={(e) => {
                setNumTerms(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>{MAX_TERMS}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View Range: <span className="font-mono font-bold text-blue-600">&plusmn;{viewXRange}</span>
            </label>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={viewXRange}
              onChange={(e) => setViewXRange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>&plusmn;2</span>
              <span>&plusmn;16</span>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Function</p>
            <p className="text-lg font-mono font-bold text-blue-600">{FUNCTIONS[selectedFn].label}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Terms</p>
            <p className="text-lg font-mono font-bold text-orange-600">{numTerms}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Max Error (in view)</p>
            <p className="text-lg font-mono font-bold text-red-600">
              {stats.maxError < 0.001 ? stats.maxError.toExponential(2) : stats.maxError.toFixed(4)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Convergence Radius</p>
            <p className="text-lg font-mono font-bold text-green-600">{FUNCTIONS[selectedFn].rocLabel}</p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="w-full" style={{ minHeight: '500px' }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
      <KeyboardShortcutHint showReset={false} />
    </div>
  );
};

export default TaylorSeriesVisualizer;
