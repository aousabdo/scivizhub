import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';

// ─── Math utilities ───────────────────────────────────────────────────────────

/** Log-gamma via Lanczos approximation */
function logGamma(x) {
  if (x <= 0) return Infinity;
  if (x < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  let sum = c[0];
  for (let i = 1; i < g + 2; i++) sum += c[i] / (x + i);
  const t = x + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(sum);
}

function logBeta(a, b) {
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

/** Beta distribution PDF at x in (0,1) */
function betaPDF(x, alpha, beta) {
  if (x <= 0 || x >= 1) return 0;
  const logVal = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta(alpha, beta);
  return Math.exp(logVal);
}

/** Normal PDF */
function normalPDF(x, mu, sigma) {
  if (sigma <= 0) return 0;
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

/** Normal random sample using Box-Muller */
function sampleNormal(mu, sigma) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Beta distribution mean */
const betaMean = (a, b) => a / (a + b);
/** Beta distribution variance */
const betaVar = (a, b) => (a * b) / ((a + b) ** 2 * (a + b + 1));
/** Beta 95% credible interval via numerical quantile search */
function betaCredible(a, b, level = 0.95) {
  const lo = (1 - level) / 2;
  const hi = 1 - lo;
  // Use regularised incomplete beta CDF via Newton's method
  const betaCDF = (x, a, b) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Use continued fraction (Lentz) for regularised incomplete beta
    return regularisedIncompleteBeta(x, a, b);
  };
  const findQuantile = (p) => {
    // Initial guess from normal approximation
    let x = betaMean(a, b);
    for (let i = 0; i < 60; i++) {
      const fx = betaCDF(x, a, b) - p;
      const fpx = betaPDF(x, a, b);
      if (fpx < 1e-14) break;
      const dx = fx / fpx;
      x = Math.max(1e-8, Math.min(1 - 1e-8, x - dx));
      if (Math.abs(dx) < 1e-8) break;
    }
    return x;
  };
  return [findQuantile(lo), findQuantile(hi)];
}

/** Regularised incomplete beta function (series + CF) */
function regularisedIncompleteBeta(x, a, b) {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;
  // Use symmetry relation if needed for numerical stability
  const logBetaAB = logBeta(a, b);
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - regularisedIncompleteBeta(1 - x, b, a);
  }
  // Continued fraction expansion (Lentz)
  const fpmin = 1e-30;
  let h = 1;
  let c = 1 / fpmin;
  let d = 1 - (a + b) * x / (a + 1);
  d = Math.abs(d) < fpmin ? fpmin : d;
  d = 1 / d;
  h = d;
  for (let m = 1; m <= 200; m++) {
    // Even step
    let aa = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + aa * d;
    c = 1 + aa / c;
    d = Math.abs(d) < fpmin ? fpmin : d;
    c = Math.abs(c) < fpmin ? fpmin : c;
    d = 1 / d;
    h *= d * c;
    // Odd step
    aa = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + aa * d;
    c = 1 + aa / c;
    d = Math.abs(d) < fpmin ? fpmin : d;
    c = Math.abs(c) < fpmin ? fpmin : c;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-10) break;
  }
  return Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logBetaAB) * h / a;
}

/** Normal 95% credible interval (posterior is Gaussian) */
function normalCredible(mu, sigma, level = 0.95) {
  const z = 1.959964; // ~qnorm(0.975)
  return [mu - z * sigma, mu + z * sigma];
}

// ─── Canvas drawing ───────────────────────────────────────────────────────────

const COLORS = { prior: '#60a5fa', likelihood: '#f97316', posterior: '#4ade80' };
const CANVAS_W = 800;
const CANVAS_H = 500;

function drawCurves(ctx, w, h, curves, observations, model) {
  const margin = { top: 40, right: 30, bottom: 60, left: 55 };
  const plotW = w - margin.left - margin.right;
  const plotH = h - margin.top - margin.bottom;

  // Background
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, w, h);

  // Determine x range
  const xMin = model === 'coin' ? 0 : curves.xMin;
  const xMax = model === 'coin' ? 1 : curves.xMax;
  const xRange = xMax - xMin;

  // Determine y range
  const allY = [...curves.prior, ...curves.likelihood, ...curves.posterior].map(p => p.y);
  const yMax = Math.max(...allY, 0.01) * 1.1;

  const tx = (x) => margin.left + ((x - xMin) / xRange) * plotW;
  const ty = (y) => margin.top + plotH - (y / yMax) * plotH;

  // Grid lines
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + (plotH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + plotW, y);
    ctx.stroke();
    // Y labels
    const val = (yMax * (5 - i) / 5).toFixed(2);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val, margin.left - 6, y + 4);
  }
  const xTicks = model === 'coin' ? 5 : 6;
  for (let i = 0; i <= xTicks; i++) {
    const xVal = xMin + (xRange * i) / xTicks;
    const cx = tx(xVal);
    ctx.beginPath();
    ctx.moveTo(cx, margin.top);
    ctx.lineTo(cx, margin.top + plotH);
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText(xVal.toFixed(model === 'coin' ? 1 : 2), cx, margin.top + plotH + 18);
  }

  // Axis lines
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotH);
  ctx.lineTo(margin.left + plotW, margin.top + plotH);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(model === 'coin' ? 'Coin bias p' : 'Mean μ', margin.left + plotW / 2, h - 8);
  ctx.save();
  ctx.translate(14, margin.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Probability density', 0, 0);
  ctx.restore();

  // Draw filled posterior
  if (curves.posterior.length > 1) {
    ctx.beginPath();
    ctx.moveTo(tx(curves.posterior[0].x), ty(0));
    curves.posterior.forEach(p => ctx.lineTo(tx(p.x), ty(p.y)));
    ctx.lineTo(tx(curves.posterior[curves.posterior.length - 1].x), ty(0));
    ctx.closePath();
    ctx.fillStyle = 'rgba(74, 222, 128, 0.18)';
    ctx.fill();

    ctx.beginPath();
    curves.posterior.forEach((p, i) => {
      i === 0 ? ctx.moveTo(tx(p.x), ty(p.y)) : ctx.lineTo(tx(p.x), ty(p.y));
    });
    ctx.strokeStyle = COLORS.posterior;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Draw likelihood
  if (curves.likelihood.length > 1) {
    ctx.beginPath();
    curves.likelihood.forEach((p, i) => {
      i === 0 ? ctx.moveTo(tx(p.x), ty(p.y)) : ctx.lineTo(tx(p.x), ty(p.y));
    });
    ctx.strokeStyle = COLORS.likelihood;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([]);
    ctx.stroke();
  }

  // Draw prior (dashed)
  if (curves.prior.length > 1) {
    ctx.beginPath();
    curves.prior.forEach((p, i) => {
      i === 0 ? ctx.moveTo(tx(p.x), ty(p.y)) : ctx.lineTo(tx(p.x), ty(p.y));
    });
    ctx.strokeStyle = COLORS.prior;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Data point ticks below plot
  if (observations.length > 0) {
    const tickY = margin.top + plotH + 36;
    observations.forEach(obs => {
      const cx = tx(model === 'coin' ? obs : obs);
      if (cx < margin.left || cx > margin.left + plotW) return;
      ctx.fillStyle = model === 'coin'
        ? (obs === 1 ? '#4ade80' : '#f87171')
        : '#a78bfa';
      ctx.beginPath();
      ctx.arc(cx, tickY, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  // Title
  ctx.fillStyle = '#e5e7eb';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Bayesian Posterior Update', margin.left + plotW / 2, 22);

  // Legend
  const legendItems = [
    { label: 'Prior', color: COLORS.prior, dash: true },
    { label: 'Likelihood', color: COLORS.likelihood, dash: false },
    { label: 'Posterior', color: COLORS.posterior, dash: false },
  ];
  let lx = margin.left + plotW - 200;
  const ly = margin.top + 14;
  legendItems.forEach(item => {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2;
    if (item.dash) ctx.setLineDash([5, 3]); else ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + 24, ly);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#d1d5db';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, lx + 28, ly + 4);
    lx += 68;
  });
}

// ─── Curve generators ────────────────────────────────────────────────────────

function buildCoinCurves(priorAlpha, priorBeta, heads, tails) {
  const N = 200;
  const postA = priorAlpha + heads;
  const postB = priorBeta + tails;
  const n = heads + tails;
  const prior = [];
  const likelihood = [];
  const posterior = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    const px = x === 0 || x === 1 ? 0 : betaPDF(x, priorAlpha, priorBeta);
    const lx = n === 0 ? 1 : (x === 0 && heads > 0 ? 0 : x === 1 && tails > 0 ? 0 : Math.exp(
      heads * Math.log(Math.max(x, 1e-15)) + tails * Math.log(Math.max(1 - x, 1e-15))
    ));
    const qx = betaPDF(x, postA, postB);
    prior.push({ x, y: isFinite(px) ? px : 0 });
    likelihood.push({ x, y: isFinite(lx) ? lx : 0 });
    posterior.push({ x, y: isFinite(qx) ? qx : 0 });
  }
  // Normalise likelihood to same scale as posterior for visual clarity
  const likMax = Math.max(...likelihood.map(p => p.y), 1e-15);
  const postMax = Math.max(...posterior.map(p => p.y), 1e-15);
  const likScale = postMax / likMax;
  return {
    prior,
    likelihood: likelihood.map(p => ({ x: p.x, y: p.y * likScale })),
    posterior,
    xMin: 0,
    xMax: 1,
  };
}

function buildNormalCurves(mu0, sigma0, observations) {
  const n = observations.length;
  let postMu = mu0;
  let postSigma = sigma0;
  let obsMean = 0;
  if (n > 0) {
    obsMean = observations.reduce((s, v) => s + v, 0) / n;
    const sigmaLik = sigma0; // assume known noise = prior sigma
    const varPost = 1 / (1 / sigma0 ** 2 + n / sigmaLik ** 2);
    postSigma = Math.sqrt(varPost);
    postMu = varPost * (mu0 / sigma0 ** 2 + n * obsMean / sigmaLik ** 2);
  }

  // Pre-compute sufficient statistics for likelihood (avoid O(n*m) inner loop)
  // The log-likelihood geometric mean at x is:
  //   (1/n) * sum_i [ -0.5*((o_i - x)/sigma0)^2 ] - log(sigma0*sqrt(2pi))
  // = -0.5/(n*sigma0^2) * sum_i (o_i - x)^2 - log(sigma0*sqrt(2pi))
  // sum_i (o_i - x)^2 = sum_i o_i^2 - 2x*sum_i o_i + n*x^2
  let obsSum = 0, obsSumSq = 0;
  if (n > 0) {
    for (let i = 0; i < n; i++) {
      obsSum += observations[i];
      obsSumSq += observations[i] * observations[i];
    }
  }

  // X range spanning all relevant distributions
  let obsMin = Infinity, obsMax = -Infinity;
  for (let i = 0; i < n; i++) {
    if (observations[i] < obsMin) obsMin = observations[i];
    if (observations[i] > obsMax) obsMax = observations[i];
  }
  const xMin = Math.min(mu0 - 4 * sigma0, postMu - 4 * postSigma, n > 0 ? obsMin : Infinity) - 0.5;
  const xMax = Math.max(mu0 + 4 * sigma0, postMu + 4 * postSigma, n > 0 ? obsMax : -Infinity) + 0.5;
  const range = xMax - xMin;
  const N = 300;
  const prior = [];
  const likelihood = [];
  const posterior = [];
  const logNorm = Math.log(sigma0 * Math.sqrt(2 * Math.PI));
  const invVar2n = 0.5 / (n * sigma0 * sigma0);
  for (let i = 0; i <= N; i++) {
    const x = xMin + (range * i) / N;
    prior.push({ x, y: normalPDF(x, mu0, sigma0) });
    posterior.push({ x, y: normalPDF(x, postMu, postSigma) });
    let lx = 0;
    if (n > 0) {
      // Geometric mean of likelihoods using sufficient statistics (O(1) per x)
      const ssq = obsSumSq - 2 * x * obsSum + n * x * x;
      const logGeomMean = -invVar2n * ssq - logNorm;
      lx = Math.exp(logGeomMean);
    }
    likelihood.push({ x, y: lx });
  }
  // Normalise likelihood
  let likMax = 1e-30, postMaxV = 1e-15;
  for (let i = 0; i <= N; i++) {
    if (likelihood[i].y > likMax) likMax = likelihood[i].y;
    if (posterior[i].y > postMaxV) postMaxV = posterior[i].y;
  }
  const sc = postMaxV / likMax;

  return {
    prior,
    likelihood: likelihood.map(p => ({ x: p.x, y: p.y * sc })),
    posterior,
    xMin,
    xMax,
    postMu,
    postSigma,
  };
}

// ─── Main component ──────────────────────────────────────────────────────────

const BayesianUpdatingVisualizer = () => {
  // Model selection
  const [model, setModel] = useState('coin');

  // Coin model params
  const [priorAlpha, setPriorAlpha] = useState(2);
  const [priorBeta, setPriorBeta] = useState(2);
  const [trueBias, setTrueBias] = useState(0.6);

  // Normal model params
  const [mu0, setMu0] = useState(0);
  const [sigma0, setSigma0] = useState(2);
  const [trueMu, setTrueMu] = useState(1.5);

  // Observations
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [normalObs, setNormalObs] = useState([]);

  // Playback
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [revealTrue, setRevealTrue] = useState(false);

  // Convergence history
  const [convergenceData, setConvergenceData] = useState([]);

  // Canvas
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasW, setCanvasW] = useState(CANVAS_W);
  const animFrameRef = useRef(null);
  const autoIntervalRef = useRef(null);

  // ── Derived state ──────────────────────────────────────────────────────────
  const coinN = heads + tails;
  const postAlpha = priorAlpha + heads;
  const postBeta = priorBeta + tails;

  const posteriorMeanCoin = betaMean(postAlpha, postBeta);
  const posteriorStdCoin = Math.sqrt(betaVar(postAlpha, postBeta));
  const priorMeanCoin = betaMean(priorAlpha, priorBeta);
  const [ci95LoCoin, ci95HiCoin] = betaCredible(postAlpha, postBeta);

  const normalResult = useMemo(() => buildNormalCurves(mu0, sigma0, normalObs), [mu0, sigma0, normalObs]);
  const posteriorMuNormal = normalResult.postMu;
  const posteriorSigmaNormal = normalResult.postSigma;
  const [ci95LoNormal, ci95HiNormal] = normalCredible(posteriorMuNormal, posteriorSigmaNormal);

  // ── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let tid = null;
    const ro = new ResizeObserver(entries => {
      clearTimeout(tid);
      tid = setTimeout(() => {
        for (const e of entries) {
          const w = Math.floor(e.contentRect.width);
          if (w > 0) setCanvasW(w);
        }
      }, 100);
    });
    ro.observe(el);
    return () => { clearTimeout(tid); ro.disconnect(); };
  }, []);

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvasW;
    const h = CANVAS_H;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    let curves;
    if (model === 'coin') {
      curves = buildCoinCurves(priorAlpha, priorBeta, heads, tails);
    } else {
      curves = normalResult;
    }
    drawCurves(ctx, w, h, curves, model === 'coin' ? Array(heads).fill(1).concat(Array(tails).fill(0)) : normalObs, model);
  }, [canvasW, model, priorAlpha, priorBeta, heads, tails, normalObs, normalResult]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ── Add single observation ─────────────────────────────────────────────────
  const addObservation = useCallback(() => {
    if (model === 'coin') {
      const flip = Math.random() < trueBias ? 1 : 0;
      const newHeads = heads + flip;
      const newTails = tails + (1 - flip);
      const newPostA = priorAlpha + newHeads;
      const newPostB = priorBeta + newTails;
      setHeads(newHeads);
      setTails(newTails);
      const pm = betaMean(newPostA, newPostB);
      const [lo, hi] = betaCredible(newPostA, newPostB);
      setConvergenceData(prev => {
        const next = [...prev, {
          n: newHeads + newTails,
          posteriorMean: parseFloat(pm.toFixed(4)),
          ciWidth: parseFloat((hi - lo).toFixed(4)),
          true: trueBias,
        }];
        return next.length > 500 ? next.slice(-500) : next;
      });
    } else {
      const obs = sampleNormal(trueMu, sigma0);
      const newObs = normalObs.length >= 500 ? [...normalObs.slice(-499), obs] : [...normalObs, obs];
      setNormalObs(newObs);
      const r = buildNormalCurves(mu0, sigma0, newObs);
      const [lo, hi] = normalCredible(r.postMu, r.postSigma);
      setConvergenceData(prev => {
        const next = [...prev, {
          n: newObs.length,
          posteriorMean: parseFloat(r.postMu.toFixed(4)),
          ciWidth: parseFloat((hi - lo).toFixed(4)),
          true: trueMu,
        }];
        return next.length > 500 ? next.slice(-500) : next;
      });
    }
  }, [model, trueBias, trueMu, heads, tails, priorAlpha, priorBeta, normalObs, mu0, sigma0]);

  // ── Auto-run ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      const delay = Math.max(80, 1000 / (speed * 3));
      autoIntervalRef.current = setInterval(() => {
        addObservation();
      }, delay);
    } else {
      clearInterval(autoIntervalRef.current);
    }
    return () => clearInterval(autoIntervalRef.current);
  }, [isRunning, speed, addObservation]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setIsRunning(false);
    setHeads(0);
    setTails(0);
    setNormalObs([]);
    setConvergenceData([]);
    setRevealTrue(false);
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useVisualizationShortcuts({ onTogglePlay: () => setIsRunning(r => !r), onReset: reset });

  // ── Derived display values ─────────────────────────────────────────────────
  const nObs = model === 'coin' ? coinN : normalObs.length;
  const dispPriorMean = model === 'coin' ? priorMeanCoin.toFixed(3) : mu0.toFixed(2);
  const dispPostMean = model === 'coin' ? posteriorMeanCoin.toFixed(3) : posteriorMuNormal.toFixed(3);
  const dispPostStd = model === 'coin' ? posteriorStdCoin.toFixed(3) : posteriorSigmaNormal.toFixed(3);
  const dispCI = model === 'coin'
    ? `[${ci95LoCoin.toFixed(3)}, ${ci95HiCoin.toFixed(3)}]`
    : `[${ci95LoNormal.toFixed(3)}, ${ci95HiNormal.toFixed(3)}]`;
  const dispTrue = model === 'coin' ? trueBias.toFixed(2) : trueMu.toFixed(2);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls */}
      <div className="bg-gray-800 rounded-t-xl p-4 flex flex-wrap items-center gap-4 text-sm text-gray-200">
        {/* Model selector */}
        <div className="flex items-center gap-2">
          <label className="text-gray-400 font-medium whitespace-nowrap">Model:</label>
          <select
            value={model}
            onChange={e => { setModel(e.target.value); reset(); }}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="coin">Coin Bias (Beta-Binomial)</option>
            <option value="normal">Mean Estimation (Normal-Normal)</option>
          </select>
        </div>

        {/* Model-specific sliders */}
        {model === 'coin' ? (
          <>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 whitespace-nowrap">α (prior):</label>
              <input type="range" min="0.5" max="20" step="0.5" value={priorAlpha}
                onChange={e => { setPriorAlpha(parseFloat(e.target.value)); reset(); }}
                className="w-24" />
              <span className="w-8 text-right">{priorAlpha}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 whitespace-nowrap">β (prior):</label>
              <input type="range" min="0.5" max="20" step="0.5" value={priorBeta}
                onChange={e => { setPriorBeta(parseFloat(e.target.value)); reset(); }}
                className="w-24" />
              <span className="w-8 text-right">{priorBeta}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 whitespace-nowrap">True bias:</label>
              <input type="range" min="0.05" max="0.95" step="0.05" value={trueBias}
                onChange={e => setTrueBias(parseFloat(e.target.value))}
                className="w-24" />
              <span className="w-8 text-right">{trueBias.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 whitespace-nowrap">μ₀ (prior mean):</label>
              <input type="range" min="-5" max="5" step="0.5" value={mu0}
                onChange={e => { setMu0(parseFloat(e.target.value)); reset(); }}
                className="w-24" />
              <span className="w-8 text-right">{mu0}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 whitespace-nowrap">σ₀ (prior std):</label>
              <input type="range" min="0.5" max="5" step="0.5" value={sigma0}
                onChange={e => { setSigma0(parseFloat(e.target.value)); reset(); }}
                className="w-24" />
              <span className="w-8 text-right">{sigma0}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 whitespace-nowrap">True μ:</label>
              <input type="range" min="-5" max="5" step="0.5" value={trueMu}
                onChange={e => setTrueMu(parseFloat(e.target.value))}
                className="w-24" />
              <span className="w-8 text-right">{trueMu}</span>
            </div>
          </>
        )}

        {/* Speed */}
        <div className="flex items-center gap-2">
          <label className="text-gray-400 whitespace-nowrap">Speed:</label>
          <input type="range" min="0.5" max="5" step="0.5" value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            className="w-20" />
          <span className="w-6 text-right">{speed}x</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={addObservation}
            disabled={isRunning}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded text-white font-medium transition-colors"
          >
            + Flip / Observe
          </button>
          <button
            onClick={() => setIsRunning(r => !r)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${isRunning ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} text-white`}
          >
            {isRunning ? '⏸ Pause' : '▶ Auto-run'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-white font-medium transition-colors"
          >
            ↺ Reset
          </button>
          <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 ml-1">
            <input type="checkbox" checked={revealTrue} onChange={e => setRevealTrue(e.target.checked)}
              className="w-3.5 h-3.5" />
            Reveal true
          </label>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full bg-gray-900" ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full block"
          style={{ height: `${CANVAS_H}px` }}
        />
      </div>

      {/* Stats bar */}
      <div className="bg-gray-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">Prior Mean</div>
          <div className="text-blue-300 font-mono font-semibold">{dispPriorMean}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">Posterior Mean</div>
          <div className="text-green-300 font-mono font-semibold">{dispPostMean}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">Posterior Std</div>
          <div className="text-green-300 font-mono font-semibold">{dispPostStd}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">Observations</div>
          <div className="text-white font-mono font-semibold">{nObs}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2 sm:col-span-2">
          <div className="text-gray-400 text-xs mb-1">95% Credible Interval</div>
          <div className="text-amber-300 font-mono font-semibold">{dispCI}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">
            {model === 'coin' ? 'Heads / Tails' : 'Obs Mean'}
          </div>
          <div className="text-gray-200 font-mono font-semibold">
            {model === 'coin'
              ? `${heads} / ${tails}`
              : normalObs.length > 0
                ? (normalObs.reduce((s, v) => s + v, 0) / normalObs.length).toFixed(3)
                : '—'}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">True Value</div>
          <div className={`font-mono font-semibold ${revealTrue ? 'text-red-300' : 'text-gray-500'}`}>
            {revealTrue ? dispTrue : '???'}
          </div>
        </div>
      </div>

      {/* Convergence chart */}
      {convergenceData.length >= 2 && (
        <div className="bg-gray-900 p-4 rounded-b-xl">
          <h3 className="text-gray-300 text-sm font-semibold mb-3 text-center">
            Posterior Convergence — Mean &amp; 95% CI Width
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={convergenceData} margin={{ top: 8, right: 30, bottom: 8, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="n" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }}
                label={{ value: 'Observations', position: 'insideBottomRight', offset: -5, fill: '#6b7280', fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6 }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Line type="monotone" dataKey="posteriorMean" stroke="#4ade80" strokeWidth={2}
                dot={false} name="Posterior mean" />
              <Line type="monotone" dataKey="ciWidth" stroke="#f97316" strokeWidth={1.5}
                dot={false} strokeDasharray="5 3" name="95% CI width" />
              {revealTrue && (
                <Line type="monotone" dataKey="true" stroke="#f87171" strokeWidth={1.5}
                  dot={false} strokeDasharray="8 4" name="True value" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {convergenceData.length < 2 && (
        <div className="bg-gray-900 rounded-b-xl p-4 text-center text-gray-500 text-sm">
          Add at least 2 observations to see the convergence chart.
        </div>
      )}

      <KeyboardShortcutHint />
    </div>
  );
};

export default BayesianUpdatingVisualizer;
