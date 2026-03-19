import React, { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = [
  {
    name: 'Sierpinski Triangle',
    vertices: 3,
    ratio: 0.5,
    restriction: 'none',
    description: 'The classic Sierpinski triangle emerges from 3 vertices with ratio 1/2.',
  },
  {
    name: 'Square Fractal',
    vertices: 4,
    ratio: 0.5,
    restriction: 'no-repeat',
    description: 'A square with ratio 1/2 and the restriction that the same vertex cannot be chosen twice in a row.',
  },
  {
    name: 'Pentagon Fractal',
    vertices: 5,
    ratio: 0.618,
    restriction: 'none',
    description: 'A pentagonal fractal using the golden ratio (~0.618).',
  },
  {
    name: 'Hexagon Fractal',
    vertices: 6,
    ratio: 1 / 3,
    restriction: 'none',
    description: 'A hexagonal fractal with ratio 1/3 produces a beautiful snowflake-like pattern.',
  },
  {
    name: 'Custom',
    vertices: 3,
    ratio: 0.5,
    restriction: 'none',
    description: 'Choose your own number of vertices, jump ratio, and restriction rules.',
  },
];

const COLOR_MODES = ['By Vertex', 'By Age', 'Single Color'];

const VERTEX_COLORS = [
  [255, 60, 60],
  [60, 200, 60],
  [80, 120, 255],
  [255, 200, 40],
  [200, 80, 255],
  [60, 220, 220],
  [255, 140, 40],
  [255, 100, 180],
];

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [
    Math.floor((r + m) * 255),
    Math.floor((g + m) * 255),
    Math.floor((b + m) * 255),
  ];
}

function generateVertices(n, cx, cy, radius) {
  const verts = [];
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    verts.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return verts;
}

const ChaosGameVisualizer = () => {
  const [presetIndex, setPresetIndex] = useState(0);
  const [numVertices, setNumVertices] = useState(3);
  const [jumpRatio, setJumpRatio] = useState(0.5);
  const [restriction, setRestriction] = useState('none');
  const [colorMode, setColorMode] = useState('By Vertex');
  const [speed, setSpeed] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [pointCount, setPointCount] = useState(0);
  const [singleColor, setSingleColor] = useState([0, 220, 180]);

  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    x: 0,
    y: 0,
    lastVertex: -1,
    totalPoints: 0,
    started: false,
  });
  const verticesRef = useRef([]);
  const canvasSizeRef = useRef({ w: 800, h: 600 });

  const getCanvasSize = useCallback(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return { w: 800, h: 600 };
    const w = Math.min(container.clientWidth, 900);
    const h = Math.round(w * 0.75);
    return { w, h };
  }, []);

  const initVertices = useCallback(() => {
    const { w, h } = canvasSizeRef.current;
    const padding = 40;
    const radius = Math.min(w, h) / 2 - padding;
    const cx = w / 2;
    const cy = h / 2;
    verticesRef.current = generateVertices(numVertices, cx, cy, radius);
  }, [numVertices]);

  const drawBackground = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = canvasSizeRef.current;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, w, h);

    // Draw vertices
    const verts = verticesRef.current;
    verts.forEach((v, i) => {
      const [r, g, b] = VERTEX_COLORS[i % VERTEX_COLORS.length];
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(v.x, v.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelDist = 20;
      const angle = Math.atan2(v.y - canvasSizeRef.current.h / 2, v.x - canvasSizeRef.current.w / 2);
      const lx = v.x + labelDist * Math.cos(angle);
      const ly = v.y + labelDist * Math.sin(angle);
      ctx.fillText(`V${i + 1}`, lx, ly);
    });
  }, []);

  const resetGame = useCallback(() => {
    const { w, h } = canvasSizeRef.current;

    // Create or resize offscreen canvas
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }
    offscreenRef.current.width = w;
    offscreenRef.current.height = h;
    const offCtx = offscreenRef.current.getContext('2d');
    offCtx.fillStyle = '#111827';
    offCtx.fillRect(0, 0, w, h);

    stateRef.current = {
      x: w / 2,
      y: h / 2,
      lastVertex: -1,
      totalPoints: 0,
      started: false,
    };
    setPointCount(0);

    initVertices();
    drawBackground();
  }, [initVertices, drawBackground]);

  const clearPoints = useCallback(() => {
    setPlaying(false);
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    resetGame();
  }, [resetGame]);

  // Initialize on mount and when params change
  useEffect(() => {
    const { w, h } = getCanvasSize();
    canvasSizeRef.current = { w, h };
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = w;
      canvas.height = h;
    }
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numVertices, jumpRatio, restriction]);

  // Auto-start on first mount
  const chaosInitRef = useRef(false);
  useEffect(() => {
    if (!chaosInitRef.current) {
      chaosInitRef.current = true;
      setPlaying(true);
    }
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const { w, h } = getCanvasSize();
      canvasSizeRef.current = { w, h };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
      }
      setPlaying(false);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      resetGame();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getCanvasSize, resetGame]);

  // Preset changes
  useEffect(() => {
    const preset = PRESETS[presetIndex];
    if (preset.name !== 'Custom') {
      setNumVertices(preset.vertices);
      setJumpRatio(preset.ratio);
      setRestriction(preset.restriction);
    }
  }, [presetIndex]);

  // Main animation loop
  useEffect(() => {
    if (!playing) return;

    const verts = verticesRef.current;
    if (verts.length === 0) return;

    const offCanvas = offscreenRef.current;
    if (!offCanvas) return;
    const offCtx = offCanvas.getContext('2d');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let frameId;

    const step = () => {
      const st = stateRef.current;

      // Skip first few points to let the iteration settle
      if (!st.started) {
        const idx = Math.floor(Math.random() * verts.length);
        st.x = verts[idx].x;
        st.y = verts[idx].y;
        st.started = true;
        // Run a few throw-away iterations
        for (let i = 0; i < 5; i++) {
          const vi = Math.floor(Math.random() * verts.length);
          st.x = st.x + (verts[vi].x - st.x) * jumpRatio;
          st.y = st.y + (verts[vi].y - st.y) * jumpRatio;
          st.lastVertex = vi;
        }
      }

      const pointsThisFrame = speed;

      for (let p = 0; p < pointsThisFrame; p++) {
        let chosenVertex;
        let attempts = 0;
        do {
          chosenVertex = Math.floor(Math.random() * verts.length);
          attempts++;
          if (attempts > 20) break;
        } while (
          restriction === 'no-repeat' && chosenVertex === st.lastVertex
        );

        st.x = st.x + (verts[chosenVertex].x - st.x) * jumpRatio;
        st.y = st.y + (verts[chosenVertex].y - st.y) * jumpRatio;
        st.lastVertex = chosenVertex;
        st.totalPoints++;

        // Determine color
        let r, g, b;
        if (colorMode === 'By Vertex') {
          [r, g, b] = VERTEX_COLORS[chosenVertex % VERTEX_COLORS.length];
        } else if (colorMode === 'By Age') {
          const hue = (st.totalPoints * 0.02) % 360;
          [r, g, b] = hslToRgb(hue, 1, 0.55);
        } else {
          [r, g, b] = singleColor;
        }

        offCtx.fillStyle = `rgba(${r},${g},${b},0.7)`;
        offCtx.fillRect(Math.round(st.x), Math.round(st.y), 1.5, 1.5);
      }

      // Composite offscreen onto main canvas
      ctx.drawImage(offCanvas, 0, 0);

      // Draw vertices on top
      verts.forEach((v, i) => {
        const [vr, vg, vb] = VERTEX_COLORS[i % VERTEX_COLORS.length];
        ctx.fillStyle = `rgb(${vr},${vg},${vb})`;
        ctx.beginPath();
        ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelDist = 20;
        const { w, h } = canvasSizeRef.current;
        const angle = Math.atan2(v.y - h / 2, v.x - w / 2);
        ctx.fillText(`V${i + 1}`, v.x + labelDist * Math.cos(angle), v.y + labelDist * Math.sin(angle));
      });

      // Draw current point indicator
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(st.x, st.y, 3, 0, Math.PI * 2);
      ctx.fill();

      setPointCount(st.totalPoints);
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    animRef.current = frameId;

    return () => {
      cancelAnimationFrame(frameId);
      animRef.current = null;
    };
  }, [playing, jumpRatio, restriction, colorMode, speed, singleColor]);

  const isCustom = PRESETS[presetIndex].name === 'Custom';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls */}
      <div className="bg-gray-800 rounded-t-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Preset */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">Preset</label>
          <select
            value={presetIndex}
            onChange={(e) => {
              setPlaying(false);
              if (animRef.current) cancelAnimationFrame(animRef.current);
              setPresetIndex(Number(e.target.value));
            }}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {PRESETS.map((p, i) => (
              <option key={p.name} value={i}>{p.name}</option>
            ))}
          </select>
          <p className="text-gray-400 text-xs mt-1">{PRESETS[presetIndex].description}</p>
        </div>

        {/* Vertices & Ratio (Custom only) */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Vertices: {numVertices}
          </label>
          <input
            type="range"
            min={3}
            max={8}
            step={1}
            value={numVertices}
            disabled={!isCustom}
            onChange={(e) => {
              setPlaying(false);
              if (animRef.current) cancelAnimationFrame(animRef.current);
              setNumVertices(Number(e.target.value));
            }}
            className="w-full accent-blue-500"
          />
          <label className="block text-gray-300 text-sm font-medium mb-1 mt-2">
            Jump Ratio: {jumpRatio.toFixed(3)}
          </label>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.001}
            value={jumpRatio}
            disabled={!isCustom}
            onChange={(e) => {
              setPlaying(false);
              if (animRef.current) cancelAnimationFrame(animRef.current);
              setJumpRatio(Number(e.target.value));
            }}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Color & Restriction */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">Color Mode</label>
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {COLOR_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {isCustom && (
            <>
              <label className="block text-gray-300 text-sm font-medium mb-1 mt-2">Restriction</label>
              <select
                value={restriction}
                onChange={(e) => {
                  setPlaying(false);
                  if (animRef.current) cancelAnimationFrame(animRef.current);
                  setRestriction(e.target.value);
                }}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="none">None</option>
                <option value="no-repeat">No same vertex twice</option>
              </select>
            </>
          )}
        </div>

        {/* Speed & Point Counter */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Speed: {speed} pts/frame
          </label>
          <input
            type="range"
            min={1}
            max={1000}
            step={1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="mt-3 text-center">
            <span className="text-gray-300 text-sm font-medium">Points: </span>
            <span className="text-white text-lg font-bold font-mono">{pointCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setPlaying(!playing)}
          className={`px-5 py-2 rounded font-medium text-sm transition-colors ${
            playing
              ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            if (animRef.current) cancelAnimationFrame(animRef.current);
            // Reset iteration state but keep settings
            const { w, h } = canvasSizeRef.current;
            stateRef.current = {
              x: w / 2,
              y: h / 2,
              lastVertex: -1,
              totalPoints: 0,
              started: false,
            };
            setPointCount(0);
            // Re-init offscreen canvas and redraw background
            if (offscreenRef.current) {
              const offCtx = offscreenRef.current.getContext('2d');
              offCtx.fillStyle = '#111827';
              offCtx.fillRect(0, 0, w, h);
            }
            drawBackground();
          }}
          className="px-5 py-2 rounded font-medium text-sm bg-orange-600 hover:bg-orange-700 text-white transition-colors"
        >
          Clear
        </button>
        <button
          onClick={clearPoints}
          className="px-5 py-2 rounded font-medium text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Canvas */}
      <div className="bg-gray-900 rounded-b-xl overflow-hidden flex justify-center">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ maxWidth: '900px', imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};

export default ChaosGameVisualizer;
