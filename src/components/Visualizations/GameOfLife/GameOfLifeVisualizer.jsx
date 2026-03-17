import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Pattern presets ──────────────────────────────────────────────────
const PRESETS = {
  glider: {
    name: 'Glider',
    cells: [[0,1],[1,2],[2,0],[2,1],[2,2]],
  },
  lwss: {
    name: 'Lightweight Spaceship',
    cells: [[0,1],[0,4],[1,0],[2,0],[2,4],[3,0],[3,1],[3,2],[3,3]],
  },
  pulsar: {
    name: 'Pulsar',
    cells: (() => {
      const q = [];
      const rows = [1,2,3,8,9,10];
      const cols = [5,11];
      rows.forEach(r => cols.forEach(c => q.push([r,c])));
      const rows2 = [5,11];
      const cols2 = [1,2,3,8,9,10];
      rows2.forEach(r => cols2.forEach(c => q.push([r,c])));
      // symmetry across both axes within 13x13 bounding box
      const rows3 = [0,5,7,12];
      const cols3 = [2,3,4,8,9,10];
      // Proper pulsar coordinates (period 3 oscillator)
      return [
        // top
        [0,2],[0,3],[0,4],[0,8],[0,9],[0,10],
        [2,0],[2,5],[2,6],[2,7],[2,12],
        [3,0],[3,5],[3,6],[3,7],[3,12],
        [4,0],[4,5],[4,6],[4,7],[4,12],
        [5,2],[5,3],[5,4],[5,8],[5,9],[5,10],
        // bottom (mirror)
        [7,2],[7,3],[7,4],[7,8],[7,9],[7,10],
        [8,0],[8,5],[8,6],[8,7],[8,12],
        [9,0],[9,5],[9,6],[9,7],[9,12],
        [10,0],[10,5],[10,6],[10,7],[10,12],
        [12,2],[12,3],[12,4],[12,8],[12,9],[12,10],
      ];
    })(),
  },
  rpentomino: {
    name: 'R-pentomino',
    cells: [[0,1],[0,2],[1,0],[1,1],[2,1]],
  },
  acorn: {
    name: 'Acorn',
    cells: [[0,1],[1,3],[2,0],[2,1],[2,4],[2,5],[2,6]],
  },
  gosperGun: {
    name: 'Glider Gun (Gosper)',
    cells: [
      [0,24],
      [1,22],[1,24],
      [2,12],[2,13],[2,20],[2,21],[2,34],[2,35],
      [3,11],[3,15],[3,20],[3,21],[3,34],[3,35],
      [4,0],[4,1],[4,10],[4,16],[4,20],[4,21],
      [5,0],[5,1],[5,10],[5,14],[5,16],[5,17],[5,22],[5,24],
      [6,10],[6,16],[6,24],
      [7,11],[7,15],
      [8,12],[8,13],
    ],
  },
  random: {
    name: 'Random Soup',
    cells: null, // handled specially
  },
};

// ── Helper: create empty grid ────────────────────────────────────────
const createGrid = (rows, cols) =>
  Array.from({ length: rows }, () => new Uint8Array(cols));

// ── Helper: create age grid ──────────────────────────────────────────
const createAgeGrid = (rows, cols) =>
  Array.from({ length: rows }, () => new Float64Array(cols));

// ── Component ────────────────────────────────────────────────────────
const GameOfLifeVisualizer = () => {
  // Grid dimensions
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(70);

  // Simulation state
  const gridRef = useRef(createGrid(50, 70));
  const ageRef = useRef(createAgeGrid(50, 70));
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(10); // generations per second
  const [toroidal, setToroidal] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [placingPreset, setPlacingPreset] = useState(null);

  // Canvas / view state
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(12);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const drawModeRef = useRef(true); // true = set alive, false = kill
  const runningRef = useRef(false);
  const speedRef = useRef(10);
  const animFrameRef = useRef(null);
  const lastTickRef = useRef(0);
  const renderRequestRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // ── Grid helpers ─────────────────────────────────────────────────
  const resetGrid = useCallback((r = rows, c = cols) => {
    gridRef.current = createGrid(r, c);
    ageRef.current = createAgeGrid(r, c);
    setGeneration(0);
    setPopulation(0);
    setRunning(false);
    scheduleRender();
  }, [rows, cols]);

  const countPopulation = useCallback((grid) => {
    let count = 0;
    for (let r = 0; r < grid.length; r++)
      for (let c = 0; c < grid[0].length; c++)
        count += grid[r][c];
    return count;
  }, []);

  // ── Simulation step ──────────────────────────────────────────────
  const step = useCallback(() => {
    const grid = gridRef.current;
    const age = ageRef.current;
    const R = grid.length;
    const C = grid[0].length;
    const next = createGrid(R, C);
    const nextAge = createAgeGrid(R, C);
    const wrap = toroidal;

    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        let neighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            let nr = r + dr;
            let nc = c + dc;
            if (wrap) {
              nr = (nr + R) % R;
              nc = (nc + C) % C;
            } else if (nr < 0 || nr >= R || nc < 0 || nc >= C) {
              continue;
            }
            neighbors += grid[nr][nc];
          }
        }
        if (grid[r][c]) {
          if (neighbors === 2 || neighbors === 3) {
            next[r][c] = 1;
            nextAge[r][c] = age[r][c] + 1;
          }
        } else {
          if (neighbors === 3) {
            next[r][c] = 1;
            nextAge[r][c] = 1;
          }
        }
      }
    }
    gridRef.current = next;
    ageRef.current = nextAge;
    setGeneration(g => g + 1);
    setPopulation(countPopulation(next));
    scheduleRender();
  }, [toroidal, countPopulation]);

  // ── Animation loop ───────────────────────────────────────────────
  useEffect(() => {
    let frameId;
    const loop = (ts) => {
      if (!runningRef.current) return;
      const interval = 1000 / speedRef.current;
      if (ts - lastTickRef.current >= interval) {
        lastTickRef.current = ts;
        step();
      }
      frameId = requestAnimationFrame(loop);
    };
    if (running) {
      lastTickRef.current = performance.now();
      frameId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(frameId);
  }, [running, step]);

  // ── Render ───────────────────────────────────────────────────────
  const scheduleRender = useCallback(() => {
    if (renderRequestRef.current) return;
    renderRequestRef.current = requestAnimationFrame(() => {
      renderRequestRef.current = null;
      render();
    });
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const grid = gridRef.current;
    const age = ageRef.current;
    const R = grid.length;
    const C = grid[0].length;
    const cs = cellSize;
    const ox = offset.x;
    const oy = offset.y;

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, w, h);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(55, 65, 81, 0.5)';
    ctx.lineWidth = 0.5;
    const startCol = Math.max(0, Math.floor(-ox / cs));
    const endCol = Math.min(C, Math.ceil((w - ox) / cs));
    const startRow = Math.max(0, Math.floor(-oy / cs));
    const endRow = Math.min(R, Math.ceil((h - oy) / cs));

    for (let c = startCol; c <= endCol; c++) {
      const x = ox + c * cs;
      ctx.beginPath();
      ctx.moveTo(x, Math.max(0, oy));
      ctx.lineTo(x, Math.min(h, oy + R * cs));
      ctx.stroke();
    }
    for (let r = startRow; r <= endRow; r++) {
      const y = oy + r * cs;
      ctx.beginPath();
      ctx.moveTo(Math.max(0, ox), y);
      ctx.lineTo(Math.min(w, ox + C * cs), y);
      ctx.stroke();
    }

    // Cells with age-based coloring and glow
    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        if (!grid[r][c]) continue;
        const a = age[r][c];
        const x = ox + c * cs;
        const y = oy + r * cs;

        // Color based on age: bright green -> yellow -> orange
        let color;
        if (a <= 1) {
          color = '#4ade80'; // bright green (newborn)
        } else if (a <= 5) {
          const t = (a - 1) / 4;
          const rr = Math.round(74 + t * (250 - 74));
          const gg = Math.round(222 + t * (204 - 222));
          const bb = Math.round(128 + t * (0 - 128));
          color = `rgb(${rr},${gg},${bb})`;
        } else if (a <= 20) {
          const t = (a - 5) / 15;
          const rr = Math.round(250 + t * (249 - 250));
          const gg = Math.round(204 + t * (115 - 204));
          const bb = Math.round(0 + t * (22 - 0));
          color = `rgb(${rr},${gg},${bb})`;
        } else {
          color = '#f97316'; // orange (old)
        }

        // Glow effect
        if (cs >= 6) {
          ctx.shadowColor = color;
          ctx.shadowBlur = cs >= 10 ? 6 : 3;
        }
        ctx.fillStyle = color;
        const pad = Math.max(0.5, cs * 0.08);
        ctx.fillRect(x + pad, y + pad, cs - pad * 2, cs - pad * 2);
      }
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Placement preview
    if (placingPreset) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#60a5fa';
      placingPreset.forEach(([pr, pc]) => {
        const x = ox + pc * cs;
        const y = oy + pr * cs;
        ctx.fillRect(x, y, cs, cs);
      });
      ctx.globalAlpha = 1;
    }
  }, [cellSize, offset, placingPreset]);

  // Trigger render on dependency changes
  useEffect(() => { scheduleRender(); }, [cellSize, offset, placingPreset, render, scheduleRender]);

  // ── Canvas sizing ────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 600 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = '600px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      // Reset the scale so render uses CSS pixels
      canvas.width = rect.width;
      canvas.height = 600;
      scheduleRender();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [scheduleRender]);

  // ── Mouse handlers ───────────────────────────────────────────────
  const cellFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const c = Math.floor((mx - offset.x) / cellSize);
    const r = Math.floor((my - offset.y) / cellSize);
    const grid = gridRef.current;
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return null;
    return { r, c };
  }, [cellSize, offset]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();

    // Right-click or middle-click: start panning
    if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
      return;
    }

    // Place preset pattern
    if (selectedPreset) {
      const pos = cellFromEvent(e);
      if (!pos) return;
      const preset = PRESETS[selectedPreset];
      if (preset.cells === null) return; // random is not placed
      const grid = gridRef.current;
      const age = ageRef.current;
      preset.cells.forEach(([pr, pc]) => {
        const nr = pos.r + pr;
        const nc = pos.c + pc;
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
          grid[nr][nc] = 1;
          age[nr][nc] = 1;
        }
      });
      setPopulation(countPopulation(grid));
      setSelectedPreset(null);
      setPlacingPreset(null);
      scheduleRender();
      return;
    }

    // Draw/erase
    const pos = cellFromEvent(e);
    if (!pos) return;
    const grid = gridRef.current;
    const age = ageRef.current;
    const alive = grid[pos.r][pos.c];
    drawModeRef.current = !alive;
    grid[pos.r][pos.c] = alive ? 0 : 1;
    age[pos.r][pos.c] = alive ? 0 : 1;
    setIsDrawing(true);
    setPopulation(countPopulation(grid));
    scheduleRender();
  }, [cellSize, offset, selectedPreset, cellFromEvent, countPopulation, scheduleRender]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setOffset({
        x: panStart.current.ox + (e.clientX - panStart.current.x),
        y: panStart.current.oy + (e.clientY - panStart.current.y),
      });
      return;
    }

    // Show placement preview
    if (selectedPreset && PRESETS[selectedPreset].cells) {
      const pos = cellFromEvent(e);
      if (!pos) return;
      setPlacingPreset(PRESETS[selectedPreset].cells.map(([pr, pc]) => [pos.r + pr, pos.c + pc]));
    }

    if (!isDrawing) return;
    const pos = cellFromEvent(e);
    if (!pos) return;
    const grid = gridRef.current;
    const age = ageRef.current;
    grid[pos.r][pos.c] = drawModeRef.current ? 1 : 0;
    age[pos.r][pos.c] = drawModeRef.current ? 1 : 0;
    setPopulation(countPopulation(grid));
    scheduleRender();
  }, [isPanning, isDrawing, selectedPreset, cellFromEvent, countPopulation, scheduleRender]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const newSize = Math.max(3, Math.min(50, Math.round(cellSize * zoomFactor)));
    if (newSize === cellSize) return;
    // Zoom toward mouse position
    const scale = newSize / cellSize;
    setOffset(prev => ({
      x: mx - (mx - prev.x) * scale,
      y: my - (my - prev.y) * scale,
    }));
    setCellSize(newSize);
  }, [cellSize]);

  const handleContextMenu = useCallback((e) => e.preventDefault(), []);

  // ── Grid resize ──────────────────────────────────────────────────
  const handleGridSizeChange = useCallback((newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    gridRef.current = createGrid(newRows, newCols);
    ageRef.current = createAgeGrid(newRows, newCols);
    setGeneration(0);
    setPopulation(0);
    setRunning(false);
    setOffset({ x: 0, y: 0 });
    scheduleRender();
  }, [scheduleRender]);

  // ── Presets ──────────────────────────────────────────────────────
  const loadPreset = useCallback((key) => {
    if (key === 'random') {
      const grid = gridRef.current;
      const age = ageRef.current;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
          const alive = Math.random() < 0.3 ? 1 : 0;
          grid[r][c] = alive;
          age[r][c] = alive;
        }
      }
      setPopulation(countPopulation(grid));
      setGeneration(0);
      scheduleRender();
      return;
    }
    setSelectedPreset(key);
  }, [countPopulation, scheduleRender]);

  const cancelPreset = useCallback(() => {
    setSelectedPreset(null);
    setPlacingPreset(null);
  }, []);

  // ── Render UI ────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Controls bar */}
      <div className="bg-gray-900 rounded-t-xl p-4 flex flex-wrap items-center gap-3">
        {/* Play / Pause / Step / Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(r => !r)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              running
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {running ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => { if (!running) step(); }}
            disabled={running}
            className="px-4 py-2 rounded-lg font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40 transition-colors"
          >
            Step
          </button>
          <button
            onClick={() => resetGrid()}
            className="px-4 py-2 rounded-lg font-semibold text-sm bg-gray-600 hover:bg-gray-500 text-white transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Speed slider */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-gray-300 text-xs whitespace-nowrap">Speed</span>
          <input
            type="range"
            min="1"
            max="60"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="w-24 accent-green-500"
          />
          <span className="text-gray-400 text-xs w-12">{speed} g/s</span>
        </div>

        {/* Toroidal toggle */}
        <label className="flex items-center gap-1.5 text-gray-300 text-xs cursor-pointer ml-2">
          <input
            type="checkbox"
            checked={toroidal}
            onChange={e => setToroidal(e.target.checked)}
            className="accent-green-500"
          />
          Wrap edges
        </label>

        {/* Counters */}
        <div className="flex items-center gap-4 ml-auto">
          <span className="text-gray-400 text-sm">Gen: <span className="text-white font-mono">{generation}</span></span>
          <span className="text-gray-400 text-sm">Pop: <span className="text-white font-mono">{population}</span></span>
        </div>
      </div>

      {/* Presets bar */}
      <div className="bg-gray-800 px-4 py-3 flex flex-wrap items-center gap-2">
        <span className="text-gray-400 text-xs mr-1">Presets:</span>
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              selectedPreset === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset.name}
          </button>
        ))}
        {selectedPreset && (
          <>
            <span className="text-yellow-400 text-xs ml-2">Click on the grid to place pattern</span>
            <button
              onClick={cancelPreset}
              className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-500"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Grid size controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex flex-wrap items-center gap-3">
        <span className="text-gray-400 text-xs">Grid:</span>
        {[
          { label: '30x20', r: 20, c: 30 },
          { label: '60x40', r: 40, c: 60 },
          { label: '70x50', r: 50, c: 70 },
          { label: '100x70', r: 70, c: 100 },
          { label: '150x100', r: 100, c: 150 },
        ].map(({ label, r, c }) => (
          <button
            key={label}
            onClick={() => handleGridSizeChange(r, c)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              rows === r && cols === c
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="text-gray-500 text-xs ml-2">Zoom: scroll wheel | Pan: middle-click drag</span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative bg-gray-950 border-x-2 border-b-2 border-gray-700 rounded-b-xl overflow-hidden"
        style={{ cursor: selectedPreset ? 'crosshair' : isPanning ? 'grabbing' : 'cell' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
          className="block"
        />
      </div>

      {/* Instructions */}
      <div className="mt-3 text-center text-sm text-gray-500">
        <span className="inline-block mx-2">Click/drag to draw cells</span>
        <span className="inline-block mx-2">|</span>
        <span className="inline-block mx-2">Select a preset, then click to place</span>
        <span className="inline-block mx-2">|</span>
        <span className="inline-block mx-2">Scroll to zoom, middle-click to pan</span>
      </div>
    </div>
  );
};

export default GameOfLifeVisualizer;
