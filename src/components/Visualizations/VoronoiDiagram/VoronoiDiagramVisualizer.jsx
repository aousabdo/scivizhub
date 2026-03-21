import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Pastel color palette ─────────────────────────────────────────────
const PASTEL_COLORS = [
  [255, 179, 186], [255, 223, 186], [255, 255, 186], [186, 255, 201],
  [186, 225, 255], [218, 186, 255], [255, 186, 243], [186, 255, 255],
  [255, 210, 160], [200, 255, 186], [186, 200, 255], [255, 186, 210],
  [230, 255, 186], [186, 255, 230], [210, 186, 255], [255, 240, 186],
  [186, 240, 255], [240, 186, 255], [255, 186, 186], [186, 255, 186],
  [200, 220, 255], [255, 220, 200], [220, 255, 200], [200, 255, 220],
  [255, 200, 220], [220, 200, 255], [240, 255, 200], [200, 240, 255],
  [255, 200, 240], [240, 200, 255], [200, 255, 240], [255, 240, 200],
  [225, 200, 255], [200, 225, 255], [255, 225, 200], [200, 255, 225],
  [255, 200, 225], [225, 255, 200], [210, 210, 255], [255, 210, 210],
  [210, 255, 210], [230, 210, 255], [255, 230, 210], [210, 255, 230],
  [255, 210, 230], [230, 255, 210], [210, 230, 255], [240, 220, 255],
  [255, 240, 220], [220, 255, 240],
];

// ── Preset generators ────────────────────────────────────────────────
function generatePreset(name, width, height) {
  const pad = 30;
  const w = width - pad * 2;
  const h = height - pad * 2;

  switch (name) {
    case 'random10': {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        pts.push({ x: pad + Math.random() * w, y: pad + Math.random() * h });
      }
      return pts;
    }
    case 'random50': {
      const pts = [];
      for (let i = 0; i < 50; i++) {
        pts.push({ x: pad + Math.random() * w, y: pad + Math.random() * h });
      }
      return pts;
    }
    case 'grid': {
      const pts = [];
      const cols = 6;
      const rows = 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pts.push({
            x: pad + (c + 0.5) * (w / cols),
            y: pad + (r + 0.5) * (h / rows),
          });
        }
      }
      return pts;
    }
    case 'spiral': {
      const pts = [];
      const n = 30;
      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const angle = t * Math.PI * 6;
        const radius = t * Math.min(w, h) * 0.45;
        pts.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        });
      }
      return pts;
    }
    case 'clusters': {
      const pts = [];
      const centers = [
        { x: width * 0.25, y: height * 0.3 },
        { x: width * 0.7, y: height * 0.25 },
        { x: width * 0.5, y: height * 0.7 },
        { x: width * 0.15, y: height * 0.75 },
        { x: width * 0.85, y: height * 0.65 },
      ];
      centers.forEach((center) => {
        const count = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
          pts.push({
            x: center.x + (Math.random() - 0.5) * 80,
            y: center.y + (Math.random() - 0.5) * 80,
          });
        }
      });
      return pts;
    }
    default:
      return [];
  }
}

// ── Distance squared helper ──────────────────────────────────────────
function distSq(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

// ── Canvas dimensions ────────────────────────────────────────────────
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// ── Component ────────────────────────────────────────────────────────
const VoronoiDiagramVisualizer = () => {
  const [seeds, setSeeds] = useState(() => generatePreset('random10', CANVAS_WIDTH, CANVAS_HEIGHT));
  const [showDelaunay, setShowDelaunay] = useState(false);
  const [showDistanceColor, setShowDistanceColor] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [velocities, setVelocities] = useState([]);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const seedsRef = useRef(seeds);
  const velocitiesRef = useRef(velocities);

  // Keep refs in sync
  useEffect(() => {
    seedsRef.current = seeds;
  }, [seeds]);

  useEffect(() => {
    velocitiesRef.current = velocities;
  }, [velocities]);

  // ── Render Voronoi diagram ───────────────────────────────────────
  const renderVoronoi = useCallback((currentSeeds) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    if (currentSeeds.length === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click on the canvas to add seed points', width / 2, height / 2);
      return;
    }

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const numSeeds = currentSeeds.length;

    // Precompute seed positions into flat arrays for speed
    const sx = new Float64Array(numSeeds);
    const sy = new Float64Array(numSeeds);
    for (let i = 0; i < numSeeds; i++) {
      sx[i] = currentSeeds[i].x;
      sy[i] = currentSeeds[i].y;
    }

    // For each pixel, find nearest seed
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        let minDist = Infinity;
        let nearest = 0;
        for (let i = 0; i < numSeeds; i++) {
          const d = distSq(px, py, sx[i], sy[i]);
          if (d < minDist) {
            minDist = d;
            nearest = i;
          }
        }

        const colorIdx = nearest % PASTEL_COLORS.length;
        const base = PASTEL_COLORS[colorIdx];
        const idx = (py * width + px) * 4;

        if (showDistanceColor) {
          // Darken based on distance to seed for a gradient effect
          const dist = Math.sqrt(minDist);
          const maxDist = 150;
          const factor = Math.max(0.55, 1 - (dist / maxDist) * 0.45);
          data[idx] = Math.floor(base[0] * factor);
          data[idx + 1] = Math.floor(base[1] * factor);
          data[idx + 2] = Math.floor(base[2] * factor);
        } else {
          data[idx] = base[0];
          data[idx + 1] = base[1];
          data[idx + 2] = base[2];
        }
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // ── Draw cell edges by detecting boundary pixels ───────────────
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 1;
    // Simple edge detection: check if neighbors belong to different seeds
    // We recompute nearest for boundary detection (lighter pass)
    const nearest2D = new Uint16Array(width * height);
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        let minD = Infinity;
        let near = 0;
        for (let i = 0; i < numSeeds; i++) {
          const d = distSq(px, py, sx[i], sy[i]);
          if (d < minD) { minD = d; near = i; }
        }
        nearest2D[py * width + px] = near;
      }
    }

    // Draw edges
    ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
    for (let py = 1; py < height - 1; py++) {
      for (let px = 1; px < width - 1; px++) {
        const c = nearest2D[py * width + px];
        if (
          nearest2D[py * width + px + 1] !== c ||
          nearest2D[(py + 1) * width + px] !== c
        ) {
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }

    // ── Draw Delaunay triangulation ────────────────────────────────
    if (showDelaunay && numSeeds >= 3) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Simple brute-force Delaunay: two seeds share a Delaunay edge if
      // they have adjacent Voronoi cells. We already have nearest2D.
      const edgeSet = new Set();
      for (let py = 0; py < height - 1; py++) {
        for (let px = 0; px < width - 1; px++) {
          const c = nearest2D[py * width + px];
          const r = nearest2D[py * width + px + 1];
          const b = nearest2D[(py + 1) * width + px];
          if (r !== c) {
            const key = c < r ? `${c}-${r}` : `${r}-${c}`;
            edgeSet.add(key);
          }
          if (b !== c) {
            const key = c < b ? `${c}-${b}` : `${b}-${c}`;
            edgeSet.add(key);
          }
        }
      }

      edgeSet.forEach((key) => {
        const [a, b] = key.split('-').map(Number);
        ctx.beginPath();
        ctx.moveTo(sx[a], sy[a]);
        ctx.lineTo(sx[b], sy[b]);
        ctx.stroke();
      });

      ctx.setLineDash([]);
    }

    // ── Draw seed points ───────────────────────────────────────────
    currentSeeds.forEach((seed) => {
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [showDelaunay, showDistanceColor]);

  // ── Render when seeds or options change ──────────────────────────
  useEffect(() => {
    if (!animating) {
      renderVoronoi(seeds);
    }
  }, [seeds, showDelaunay, showDistanceColor, animating, renderVoronoi]);

  // ── Animation loop ───────────────────────────────────────────────
  useEffect(() => {
    if (!animating) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    // Initialize velocities if needed
    if (velocitiesRef.current.length !== seedsRef.current.length) {
      const newVel = seedsRef.current.map(() => ({
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      }));
      setVelocities(newVel);
      velocitiesRef.current = newVel;
    }

    const animate = () => {
      const currentSeeds = seedsRef.current;
      const currentVel = velocitiesRef.current;
      const width = CANVAS_WIDTH;
      const height = CANVAS_HEIGHT;

      const newSeeds = currentSeeds.map((s, i) => {
        const v = currentVel[i] || { vx: 0, vy: 0 };
        let nx = s.x + v.vx;
        let ny = s.y + v.vy;

        // Bounce off walls
        if (nx < 5 || nx > width - 5) {
          currentVel[i] = { ...v, vx: -v.vx };
          nx = Math.max(5, Math.min(width - 5, nx));
        }
        if (ny < 5 || ny > height - 5) {
          currentVel[i] = { ...v, vy: -v.vy };
          ny = Math.max(5, Math.min(height - 5, ny));
        }

        return { x: nx, y: ny };
      });

      seedsRef.current = newSeeds;
      setSeeds(newSeeds);
      renderVoronoi(newSeeds);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [animating, renderVoronoi]);

  // ── Cleanup on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // ── Canvas click handler ─────────────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setSeeds((prev) => [...prev, { x, y }]);
    if (animating) {
      setVelocities((prev) => [
        ...prev,
        { vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5 },
      ]);
    }
  }, [animating]);

  // ── Control handlers ─────────────────────────────────────────────
  const addRandomPoint = useCallback(() => {
    const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
    const y = 30 + Math.random() * (CANVAS_HEIGHT - 60);
    setSeeds((prev) => [...prev, { x, y }]);
    if (animating) {
      setVelocities((prev) => [
        ...prev,
        { vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5 },
      ]);
    }
  }, [animating]);

  const clearAll = useCallback(() => {
    setSeeds([]);
    setVelocities([]);
  }, []);

  const loadPreset = useCallback((presetName) => {
    const pts = generatePreset(presetName, CANVAS_WIDTH, CANVAS_HEIGHT);
    setSeeds(pts);
    setVelocities(
      pts.map(() => ({
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      }))
    );
  }, []);

  const toggleAnimation = useCallback(() => {
    setAnimating((prev) => !prev);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={addRandomPoint}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition-colors"
            >
              Add Random Point
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={toggleAnimation}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                animating
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {animating ? 'Stop Animation' : 'Animate'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={showDelaunay}
                onChange={(e) => setShowDelaunay(e.target.checked)}
                className="rounded"
              />
              Delaunay
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={showDistanceColor}
                onChange={(e) => setShowDistanceColor(e.target.checked)}
                className="rounded"
              />
              Distance Coloring
            </label>
          </div>

          <span className="text-sm text-gray-600 font-medium">
            Points: {seeds.length}
          </span>
        </div>

        {/* Presets */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 font-medium">Presets:</span>
          {[
            ['random10', 'Random (10)'],
            ['random50', 'Random (50)'],
            ['grid', 'Grid'],
            ['spiral', 'Spiral'],
            ['clusters', 'Clusters'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800/40 text-sm transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          className="w-full rounded cursor-crosshair border border-gray-200"
          style={{ maxHeight: '600px' }}
        />
        <p className="text-center text-xs text-gray-400 mt-1">
          Click anywhere on the canvas to add a seed point
        </p>
      </div>
    </div>
  );
};

export default VoronoiDiagramVisualizer;
