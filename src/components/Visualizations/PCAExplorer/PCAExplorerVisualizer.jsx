import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─────────────────────────── constants ────────────────────────────────────────

const CLUSTER_COLORS = [
  { fill: '#60a5fa', stroke: '#2563eb' },
  { fill: '#f87171', stroke: '#dc2626' },
  { fill: '#34d399', stroke: '#059669' },
  { fill: '#fbbf24', stroke: '#d97706' },
];

const ISO_ANGLE_X = Math.PI / 6; // 30°
const ISO_ANGLE_Y = Math.PI / 6;

// ─────────────────────────── linear-algebra helpers ──────────────────────────

/** Seeded PRNG (LCG) so we can regenerate deterministically */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller transform using a provided uniform-random function */
function boxMuller(rand) {
  const u = Math.max(1e-12, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Generate `n` 3-D points for a cluster centred at `centre` with given
 * spread and off-diagonal correlation (applied to the first two axes).
 */
function generateCluster(n, centre, spread, correlation, rand) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const z1 = boxMuller(rand);
    const z2 = boxMuller(rand);
    const z3 = boxMuller(rand);
    // Cholesky-style: x = z1, y = corr*z1 + sqrt(1-corr²)*z2
    const x = centre[0] + spread * z1;
    const y = centre[1] + spread * (correlation * z1 + Math.sqrt(Math.max(0, 1 - correlation * correlation)) * z2);
    const z = centre[2] + spread * 0.6 * z3;
    pts.push([x, y, z]);
  }
  return pts;
}

/** Compute mean vector (length d) of an n×d data matrix */
function columnMeans(data) {
  const n = data.length;
  const d = data[0].length;
  const mean = new Array(d).fill(0);
  for (const pt of data) {
    for (let j = 0; j < d; j++) mean[j] += pt[j];
  }
  return mean.map((v) => v / n);
}

/** Return centred data (subtract column means) */
function centerData(data, mean) {
  return data.map((pt) => pt.map((v, j) => v - mean[j]));
}

/**
 * Compute the d×d covariance matrix (unbiased, n-1 denominator) from
 * centred data (n×d).
 */
function covarianceMatrix(centred) {
  const n = centred.length;
  const d = centred[0].length;
  const cov = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const pt of centred) {
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        cov[i][j] += pt[i] * pt[j];
      }
    }
  }
  for (let i = 0; i < d; i++)
    for (let j = 0; j < d; j++)
      cov[i][j] /= n - 1;
  return cov;
}

/**
 * Jacobi eigendecomposition for a real symmetric matrix.
 * Returns { eigenvalues: number[], eigenvectors: number[][] }
 * where eigenvectors[k] is the k-th eigenvector (row), sorted descending.
 */
function jacobiEigen(A) {
  const n = A.length;
  // Work on a copy
  const S = A.map((row) => [...row]);
  // Accumulate rotations in V (starts as identity)
  let V = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  const MAX_ITER = 200;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    // Find largest off-diagonal element
    let p = 0,
      q = 1,
      maxVal = Math.abs(S[0][1]);
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(S[i][j]) > maxVal) {
          maxVal = Math.abs(S[i][j]);
          p = i;
          q = j;
        }
      }
    }
    if (maxVal < 1e-12) break;

    // Compute rotation angle
    const theta =
      S[p][p] === S[q][q]
        ? Math.PI / 4
        : 0.5 * Math.atan2(2 * S[p][q], S[p][p] - S[q][q]);
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    // Update S
    const Spp = c * c * S[p][p] + 2 * c * s * S[p][q] + s * s * S[q][q];
    const Sqq = s * s * S[p][p] - 2 * c * s * S[p][q] + c * c * S[q][q];
    const Spq = 0;
    const newS = S.map((row) => [...row]);
    newS[p][p] = Spp;
    newS[q][q] = Sqq;
    newS[p][q] = Spq;
    newS[q][p] = Spq;
    for (let r = 0; r < n; r++) {
      if (r !== p && r !== q) {
        const Srp = c * S[r][p] + s * S[r][q];
        const Srq = -s * S[r][p] + c * S[r][q];
        newS[r][p] = Srp;
        newS[p][r] = Srp;
        newS[r][q] = Srq;
        newS[q][r] = Srq;
      }
    }
    // Update V
    for (let r = 0; r < n; r++) {
      const Vrp = c * V[r][p] + s * V[r][q];
      const Vrq = -s * V[r][p] + c * V[r][q];
      V[r][p] = Vrp;
      V[r][q] = Vrq;
    }
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        S[i][j] = newS[i][j];
  }

  // Eigenvalues are the diagonal of S
  const eigenvalues = S.map((_, i) => S[i][i]);
  // Eigenvectors are the columns of V
  const eigenvectors = Array.from({ length: n }, (_, k) =>
    Array.from({ length: n }, (_, r) => V[r][k])
  );

  // Sort descending by eigenvalue
  const order = eigenvalues
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v)
    .map((o) => o.i);

  return {
    eigenvalues: order.map((i) => Math.max(0, eigenvalues[i])),
    eigenvectors: order.map((i) => eigenvectors[i]),
  };
}

/** Project a 3-D point onto the top-2 principal components */
function projectToPCPlane(pt, mean, pc1, pc2) {
  const centred = pt.map((v, i) => v - mean[i]);
  const s1 = centred.reduce((sum, v, i) => sum + v * pc1[i], 0);
  const s2 = centred.reduce((sum, v, i) => sum + v * pc2[i], 0);
  return [s1, s2];
}

// ─────────────────────────── isometric projection ────────────────────────────

/**
 * Map a 3-D world point to 2-D canvas coordinates using a simple
 * isometric / cavalier projection.
 * We treat [x,y,z] ∈ ℝ³ and project:
 *   px = cx + scale*(x - z*cos(ISO_ANGLE_X))
 *   py = cy - scale*(y - z*sin(ISO_ANGLE_Y))
 */
function isoProject(x, y, z, cx, cy, scale) {
  const px = cx + scale * (x - z * Math.cos(ISO_ANGLE_X));
  const py = cy - scale * (y - z * Math.sin(ISO_ANGLE_Y));
  return { px, py };
}

// ─────────────────────────── canvas drawing helpers ──────────────────────────

function drawArrow(ctx, x1, y1, x2, y2, color, width = 2, headLen = 10) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return;
  const angle = Math.atan2(dy, dx);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

// ─────────────────────────── component ───────────────────────────────────────

const DEFAULT_STATE = {
  numClusters: 3,
  spread: 1.2,
  correlation: 0.6,
  sampleSize: 200,
};

const PCAExplorerVisualizer = () => {
  const [numClusters, setNumClusters] = useState(DEFAULT_STATE.numClusters);
  const [spread, setSpread] = useState(DEFAULT_STATE.spread);
  const [correlation, setCorrelation] = useState(DEFAULT_STATE.correlation);
  const [sampleSize, setSampleSize] = useState(DEFAULT_STATE.sampleSize);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProjected, setIsProjected] = useState(false);
  const [animProgress, setAnimProgress] = useState(0); // 0 = 3D, 1 = projected

  // PCA results
  const [eigenvalues, setEigenvalues] = useState([0, 0, 0]);
  const [varianceExplained, setVarianceExplained] = useState([0, 0, 0]);

  const canvasRef = useRef(null);
  const dataRef = useRef(null); // { points: [x,y,z][], clusterIds: number[], mean: number[], pc1, pc2, pc3 }
  const animFrameRef = useRef(null);
  const animStartRef = useRef(null);
  const animProgressRef = useRef(0);
  const seedRef = useRef(42);

  // ── data generation ──────────────────────────────────────────────────────

  const generateData = useCallback(
    (clusters, sp, corr, n) => {
      const rand = mulberry32(seedRef.current);
      // Spread cluster centres across a wide range
      const centres = [
        [0, 0, 0],
        [4, 3, -1],
        [-3, 4, 2],
        [2, -3, 3],
      ].slice(0, clusters);

      const points = [];
      const clusterIds = [];
      const perCluster = Math.floor(n / clusters);

      for (let c = 0; c < clusters; c++) {
        const count = c === clusters - 1 ? n - perCluster * (clusters - 1) : perCluster;
        const clusterPts = generateCluster(count, centres[c], sp, corr, rand);
        points.push(...clusterPts);
        clusterIds.push(...Array(count).fill(c));
      }

      const mean = columnMeans(points);
      const centred = centerData(points, mean);
      const cov = covarianceMatrix(centred);
      const { eigenvalues: evals, eigenvectors: evecs } = jacobiEigen(cov);

      const totalVar = evals.reduce((s, v) => s + v, 0) || 1;
      const varExp = evals.map((v) => v / totalVar);

      return {
        points,
        clusterIds,
        mean,
        pc1: evecs[0],
        pc2: evecs[1],
        pc3: evecs[2],
        eigenvalues: evals,
        varianceExplained: varExp,
      };
    },
    []
  );

  const regenerate = useCallback(() => {
    const data = generateData(numClusters, spread, correlation, sampleSize);
    dataRef.current = data;
    setEigenvalues(data.eigenvalues);
    setVarianceExplained(data.varianceExplained);
    setIsProjected(false);
    setIsAnimating(false);
    setAnimProgress(0);
    animProgressRef.current = 0;
  }, [numClusters, spread, correlation, sampleSize, generateData]);

  // Initial + when params change
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  // ── canvas rendering ─────────────────────────────────────────────────────

  const render = useCallback((progress) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = dataRef.current;
    if (!data) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const { points, clusterIds, mean, pc1, pc2, eigenvalues: evals } = data;

    // Choose a scale to fit data in canvas
    const scale = 38;
    const cx = W * 0.48;
    const cy = H * 0.5;

    // Draw faint axis grid lines
    const gridColor = 'rgba(148,163,184,0.15)';
    // x-axis
    const axisOrigin = isoProject(0, 0, 0, cx, cy, scale);
    const axisX = isoProject(6, 0, 0, cx, cy, scale);
    const axisY = isoProject(0, 6, 0, cx, cy, scale);
    const axisZ = isoProject(0, 0, 6, cx, cy, scale);
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(axisOrigin.px, axisOrigin.py);
    ctx.lineTo(axisX.px, axisX.py);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(axisOrigin.px, axisOrigin.py);
    ctx.lineTo(axisY.px, axisY.py);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(axisOrigin.px, axisOrigin.py);
    ctx.lineTo(axisZ.px, axisZ.py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis labels
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.font = '11px monospace';
    ctx.fillText('x₁', axisX.px + 4, axisX.py);
    ctx.fillText('x₂', axisY.px + 4, axisY.py);
    ctx.fillText('x₃', axisZ.px + 4, axisZ.py);

    // Interpolate between 3D position and PC projection
    const pc2D = points.map((pt) => {
      // Projected 2D coords in the PC plane
      const [s1, s2] = projectToPCPlane(pt, mean, pc1, pc2);
      // Reconstructed 3D point on the PC plane: mean + s1*pc1 + s2*pc2
      const proj3d = mean.map((m, i) => m + s1 * pc1[i] + s2 * pc2[i]);
      // Lerp between original and projected
      const lx = pt[0] * (1 - progress) + proj3d[0] * progress;
      const ly = pt[1] * (1 - progress) + proj3d[1] * progress;
      const lz = pt[2] * (1 - progress) + proj3d[2] * progress;
      return isoProject(lx - mean[0], ly - mean[1], lz - mean[2], cx, cy, scale);
    });

    // Draw points
    for (let i = 0; i < points.length; i++) {
      const { px, py } = pc2D[i];
      const cid = clusterIds[i];
      const { fill, stroke } = CLUSTER_COLORS[cid % CLUSTER_COLORS.length];

      const alpha = 0.55 + 0.35 * (1 - progress); // slightly more opaque in 3D
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = fill.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace(
        /rgba\(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}), /i,
        (_, r, g, b) => `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, `
      );
      // Simpler approach: just use fixed alphas per colour index
      const colors = [
        `rgba(96,165,250,${alpha})`,
        `rgba(248,113,113,${alpha})`,
        `rgba(52,211,153,${alpha})`,
        `rgba(251,191,36,${alpha})`,
      ];
      ctx.fillStyle = colors[cid % colors.length];
      ctx.fill();
    }

    // Draw principal component axes as arrows from mean (origin in centred space)
    const arrowLen = [
      Math.sqrt(evals[0]) * scale * 2.2,
      Math.sqrt(evals[1]) * scale * 2.2,
      Math.sqrt(evals[2]) * scale * 2.2,
    ];

    const pcColors = ['#a78bfa', '#fb923c', '#38bdf8'];
    const pcLabels = ['PC1', 'PC2', 'PC3'];

    for (let k = 0; k < 3; k++) {
      const len = arrowLen[k] || 10;
      const vec = k === 0 ? pc1 : k === 1 ? pc2 : data.pc3;
      if (!vec) continue;

      // Endpoint in world space
      const ex = vec[0] * len / scale;
      const ey = vec[1] * len / scale;
      const ez = vec[2] * len / scale;

      const tip = isoProject(ex, ey, ez, cx, cy, scale);
      const tail = isoProject(0, 0, 0, cx, cy, scale);

      // Fade PC3 during projection animation
      const alphaFactor = k === 2 ? (1 - progress) : 1;
      if (alphaFactor < 0.02) continue;

      const color = pcColors[k];
      ctx.globalAlpha = alphaFactor;
      drawArrow(ctx, tail.px, tail.py, tip.px, tip.py, color, 2.5, 10);

      // Label
      ctx.fillStyle = color;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(pcLabels[k], tip.px + 5, tip.py - 5);
      ctx.globalAlpha = 1;
    }

    // When fully projected, draw PC plane outline
    if (progress > 0.5) {
      const planeAlpha = (progress - 0.5) * 2;
      ctx.globalAlpha = planeAlpha * 0.12;
      // Draw a faint rectangle in PC1-PC2 plane
      const corners = [
        [-4, -4], [4, -4], [4, 4], [-4, 4],
      ];
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      const firstCorner = isoProject(
        corners[0][0] * pc1[0] + corners[0][1] * pc2[0],
        corners[0][0] * pc1[1] + corners[0][1] * pc2[1],
        corners[0][0] * pc1[2] + corners[0][1] * pc2[2],
        cx, cy, scale
      );
      ctx.moveTo(firstCorner.px, firstCorner.py);
      for (let ci = 1; ci < 4; ci++) {
        const cp = isoProject(
          corners[ci][0] * pc1[0] + corners[ci][1] * pc2[0],
          corners[ci][0] * pc1[1] + corners[ci][1] * pc2[1],
          corners[ci][0] * pc1[2] + corners[ci][1] * pc2[2],
          cx, cy, scale
        );
        ctx.lineTo(cp.px, cp.py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Legend
    const legendX = W - 120;
    const legendY = 20;
    for (let c = 0; c < numClusters; c++) {
      const cy2 = legendY + c * 20;
      ctx.fillStyle = CLUSTER_COLORS[c].fill;
      ctx.beginPath();
      ctx.arc(legendX + 8, cy2 + 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Cluster ${c + 1}`, legendX + 18, cy2 + 10);
    }

    // Status label
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = '11px sans-serif';
    const statusLabel =
      progress < 0.05
        ? '3D View'
        : progress > 0.95
        ? 'Projected onto PC1-PC2 Plane'
        : 'Projecting…';
    ctx.fillText(statusLabel, 12, H - 10);
  }, [numClusters]);

  // ── animation loop ───────────────────────────────────────────────────────

  const ANIM_DURATION = 1400; // ms

  const animateProjection = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const targetProgress = isProjected ? 0 : 1;
    const startProgress = animProgressRef.current;
    animStartRef.current = null;

    const step = (ts) => {
      if (!animStartRef.current) animStartRef.current = ts;
      const elapsed = ts - animStartRef.current;
      const raw = elapsed / ANIM_DURATION;
      // Ease in-out cubic
      const t = raw < 1 ? raw * raw * (3 - 2 * raw) : 1;
      const prog = startProgress + (targetProgress - startProgress) * t;
      animProgressRef.current = prog;
      setAnimProgress(prog);
      render(prog);

      if (raw < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animProgressRef.current = targetProgress;
        setAnimProgress(targetProgress);
        render(targetProgress);
        setIsAnimating(false);
        setIsProjected(targetProgress > 0.5);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [isProjected, render]);

  const handleTogglePlay = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    animateProjection();
  }, [isAnimating, animateProjection]);

  const handleReset = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    seedRef.current = Math.floor(Math.random() * 100000);
    setIsAnimating(false);
    setIsProjected(false);
    setAnimProgress(0);
    animProgressRef.current = 0;
    const data = generateData(numClusters, spread, correlation, sampleSize);
    dataRef.current = data;
    setEigenvalues(data.eigenvalues);
    setVarianceExplained(data.varianceExplained);
  }, [numClusters, spread, correlation, sampleSize, generateData]);

  useVisualizationShortcuts({ onTogglePlay: handleTogglePlay, onReset: handleReset });

  // Re-render when progress or data changes
  useEffect(() => {
    if (!isAnimating) {
      render(animProgressRef.current);
    }
  }, [render, isAnimating, eigenvalues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── variance chart data ──────────────────────────────────────────────────

  const chartData = [
    { name: 'PC1', variance: parseFloat((varianceExplained[0] * 100).toFixed(1)), cumulative: parseFloat((varianceExplained[0] * 100).toFixed(1)) },
    { name: 'PC2', variance: parseFloat((varianceExplained[1] * 100).toFixed(1)), cumulative: parseFloat(((varianceExplained[0] + varianceExplained[1]) * 100).toFixed(1)) },
    { name: 'PC3', variance: parseFloat((varianceExplained[2] * 100).toFixed(1)), cumulative: parseFloat(((varianceExplained[0] + varianceExplained[1] + varianceExplained[2]) * 100).toFixed(1)) },
  ];

  const totalVarPC12 = ((varianceExplained[0] + varianceExplained[1]) * 100).toFixed(1);
  const eigenRatio = eigenvalues[1] > 0.001 ? (eigenvalues[0] / eigenvalues[1]).toFixed(2) : '∞';

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls bar */}
      <div className="bg-gray-800 rounded-t-xl p-4 flex flex-wrap items-center gap-4 text-sm text-gray-200">
        {/* Clusters */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-gray-400 text-xs">Clusters: {numClusters}</label>
          <input
            type="range"
            min={2}
            max={4}
            step={1}
            value={numClusters}
            onChange={(e) => setNumClusters(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
        {/* Spread */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-gray-400 text-xs">Spread: {spread.toFixed(1)}</label>
          <input
            type="range"
            min={0.3}
            max={3.0}
            step={0.1}
            value={spread}
            onChange={(e) => setSpread(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        {/* Correlation */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-gray-400 text-xs">Correlation: {correlation.toFixed(2)}</label>
          <input
            type="range"
            min={-0.95}
            max={0.95}
            step={0.05}
            value={correlation}
            onChange={(e) => setCorrelation(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        {/* Sample size */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-gray-400 text-xs">Points: {sampleSize}</label>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={sampleSize}
            onChange={(e) => setSampleSize(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
        {/* Action buttons */}
        <div className="flex gap-2 ml-auto flex-wrap">
          <button
            onClick={handleTogglePlay}
            disabled={isAnimating}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              isAnimating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : isProjected
                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {isAnimating ? 'Animating…' : isProjected ? 'Restore 3D' : 'Project → PC1-PC2'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold text-sm transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full bg-gray-900">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full block"
        />
      </div>

      {/* Stats bar */}
      <div className="bg-gray-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">PC1 Variance</div>
          <div className="text-violet-300 font-bold text-lg">
            {(varianceExplained[0] * 100).toFixed(1)}%
          </div>
          <div className="text-gray-500 text-xs">λ₁ = {eigenvalues[0].toFixed(3)}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">PC2 Variance</div>
          <div className="text-orange-300 font-bold text-lg">
            {(varianceExplained[1] * 100).toFixed(1)}%
          </div>
          <div className="text-gray-500 text-xs">λ₂ = {eigenvalues[1].toFixed(3)}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">PC1+PC2 Total</div>
          <div className="text-sky-300 font-bold text-lg">{totalVarPC12}%</div>
          <div className="text-gray-500 text-xs">variance retained</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">Eigenvalue Ratio</div>
          <div className="text-emerald-300 font-bold text-lg">λ₁/λ₂ = {eigenRatio}</div>
          <div className="text-gray-500 text-xs">λ₃ = {eigenvalues[2].toFixed(3)}</div>
        </div>
      </div>

      {/* Variance-explained bar chart */}
      <div className="bg-gray-800 rounded-b-xl p-4">
        <p className="text-gray-400 text-xs mb-3 text-center">Variance Explained by Principal Component</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value, name) => [`${value}%`, name === 'variance' ? 'Variance' : 'Cumulative']}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#9ca3af', fontSize: 12 }}>
                  {value === 'variance' ? 'Individual Variance' : 'Cumulative Variance'}
                </span>
              )}
            />
            <Bar dataKey="variance" fill="#a78bfa" radius={[4, 4, 0, 0]} name="variance" />
            <Bar dataKey="cumulative" fill="#38bdf8" radius={[4, 4, 0, 0]} name="cumulative" />
          </BarChart>
        </ResponsiveContainer>

        <KeyboardShortcutHint />
      </div>
    </div>
  );
};

export default PCAExplorerVisualizer;
