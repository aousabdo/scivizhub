import React, { useState, useEffect, useRef, useCallback } from 'react';
import VisualizationToolbar from '../../UI/VisualizationToolbar';

const PRESETS = [
  { name: 'Full View', type: 'mandelbrot', centerX: -0.5, centerY: 0, zoom: 1, maxIter: 150, juliaR: -0.7, juliaI: 0.27015 },
  { name: 'Seahorse Valley', type: 'mandelbrot', centerX: -0.745, centerY: 0.186, zoom: 200, maxIter: 300, juliaR: -0.7, juliaI: 0.27015 },
  { name: 'Spiral', type: 'mandelbrot', centerX: -0.7463, centerY: 0.1102, zoom: 800, maxIter: 400, juliaR: -0.7, juliaI: 0.27015 },
  { name: 'Julia Classic', type: 'julia', centerX: 0, centerY: 0, zoom: 1, maxIter: 200, juliaR: -0.7, juliaI: 0.27015 },
  { name: 'Julia Dendrite', type: 'julia', centerX: 0, centerY: 0, zoom: 1, maxIter: 200, juliaR: 0, juliaI: 1 },
  { name: 'Burning Ship', type: 'burningship', centerX: -0.4, centerY: -0.6, zoom: 1, maxIter: 200, juliaR: -0.7, juliaI: 0.27015 },
];

const COLOR_SCHEMES = ['Classic', 'Fire', 'Rainbow', 'Grayscale', 'Ocean'];

function getColor(scheme, t) {
  // t is normalized 0..1
  if (t <= 0 || t >= 1) return [0, 0, 0];

  switch (scheme) {
    case 'Classic': {
      const r = Math.floor(9 * (1 - t) * t * t * t * 255);
      const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
      const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
      return [r, g, b];
    }
    case 'Fire': {
      if (t < 0.33) {
        const s = t / 0.33;
        return [Math.floor(s * 200), 0, 0];
      } else if (t < 0.66) {
        const s = (t - 0.33) / 0.33;
        return [200 + Math.floor(s * 55), Math.floor(s * 200), 0];
      } else {
        const s = (t - 0.66) / 0.34;
        return [255, 200 + Math.floor(s * 55), Math.floor(s * 255)];
      }
    }
    case 'Rainbow': {
      const h = t * 360;
      const s = 1, l = 0.5;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      let r1, g1, b1;
      if (h < 60) { r1 = c; g1 = x; b1 = 0; }
      else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
      else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
      else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
      else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
      else { r1 = c; g1 = 0; b1 = x; }
      return [Math.floor((r1 + m) * 255), Math.floor((g1 + m) * 255), Math.floor((b1 + m) * 255)];
    }
    case 'Grayscale': {
      const v = Math.floor(t * 255);
      return [v, v, v];
    }
    case 'Ocean': {
      if (t < 0.5) {
        const s = t / 0.5;
        return [0, Math.floor(s * 60), Math.floor(40 + s * 140)];
      } else {
        const s = (t - 0.5) / 0.5;
        return [Math.floor(s * 80), 60 + Math.floor(s * 195), 180 + Math.floor(s * 75)];
      }
    }
    default:
      return [0, 0, 0];
  }
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const MINIMAP_SIZE = 120;

const FractalExplorerVisualizer = () => {
  const [fractalType, setFractalType] = useState('mandelbrot');
  const [maxIterations, setMaxIterations] = useState(150);
  const [colorScheme, setColorScheme] = useState('Classic');
  const [juliaReal, setJuliaReal] = useState(-0.7);
  const [juliaImag, setJuliaImag] = useState(0.27015);
  const [centerX, setCenterX] = useState(-0.5);
  const [centerY, setCenterY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [mouseCoords, setMouseCoords] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [histogram, setHistogram] = useState(null);

  const canvasRef = useRef(null);
  const minimapCanvasRef = useRef(null);
  const renderIdRef = useRef(0);

  const computeFractal = useCallback((cx, cy, zoomLevel, type, maxIter, jR, jI) => {
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    const imageData = new Uint8ClampedArray(width * height * 4);
    const iterCounts = new Float64Array(width * height);

    const scale = 3.0 / (zoomLevel * Math.min(width, height));
    const offsetX = cx;
    const offsetY = cy;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x0 = (px - width / 2) * scale + offsetX;
        const y0 = (py - height / 2) * scale + offsetY;

        let zx, zy, cr, ci;

        if (type === 'julia') {
          zx = x0;
          zy = y0;
          cr = jR;
          ci = jI;
        } else {
          zx = 0;
          zy = 0;
          cr = x0;
          ci = y0;
        }

        let iter = 0;
        let zx2 = zx * zx;
        let zy2 = zy * zy;

        while (zx2 + zy2 <= 4 && iter < maxIter) {
          if (type === 'burningship') {
            zy = Math.abs(2 * zx * zy) + ci;
            zx = zx2 - zy2 + cr;
          } else {
            zy = 2 * zx * zy + ci;
            zx = zx2 - zy2 + cr;
          }
          zx2 = zx * zx;
          zy2 = zy * zy;
          iter++;
        }

        let smoothIter = iter;
        if (iter < maxIter) {
          // Smooth coloring: n + 1 - log(log(|z|))/log(2)
          const logZn = Math.log(zx2 + zy2) / 2;
          const nu = Math.log(logZn / Math.LN2) / Math.LN2;
          smoothIter = iter + 1 - nu;
          if (isNaN(smoothIter) || smoothIter < 0) smoothIter = 0;
        }

        iterCounts[py * width + px] = smoothIter;
      }
    }

    return { iterCounts, width, height };
  }, []);

  const renderToCanvas = useCallback((iterCounts, width, height, maxIter, scheme, canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Build histogram for display
    const histBuckets = 32;
    const hist = new Array(histBuckets).fill(0);

    for (let i = 0; i < width * height; i++) {
      const smoothIter = iterCounts[i];
      const t = smoothIter >= maxIter ? 0 : (smoothIter % 40) / 40;
      const [r, g, b] = getColor(scheme, t);

      const idx = i * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;

      // histogram
      if (smoothIter < maxIter) {
        const bucket = Math.min(histBuckets - 1, Math.floor((smoothIter / maxIter) * histBuckets));
        hist[bucket]++;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return hist;
  }, []);

  // Render minimap (always full Mandelbrot view)
  const renderMinimap = useCallback(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const mw = MINIMAP_SIZE;
    const mh = Math.floor(MINIMAP_SIZE * 2 / 3);
    canvas.width = mw;
    canvas.height = mh;

    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(mw, mh);
    const data = imgData.data;
    const scale = 3.0 / Math.min(mw, mh);
    const ox = -0.5, oy = 0;

    for (let py = 0; py < mh; py++) {
      for (let px = 0; px < mw; px++) {
        const cr = (px - mw / 2) * scale + ox;
        const ci = (py - mh / 2) * scale + oy;
        let zx = 0, zy = 0, iter = 0;
        while (zx * zx + zy * zy <= 4 && iter < 60) {
          const tmp = zx * zx - zy * zy + cr;
          zy = 2 * zx * zy + ci;
          zx = tmp;
          iter++;
        }
        const t = iter >= 60 ? 0 : (iter % 20) / 20;
        const [r, g, b] = getColor('Classic', t);
        const idx = (py * mw + px) * 4;
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw viewport indicator
    const viewScale = 3.0 / (zoom * Math.min(CANVAS_WIDTH, CANVAS_HEIGHT));
    const halfW = (CANVAS_WIDTH / 2) * viewScale;
    const halfH = (CANVAS_HEIGHT / 2) * viewScale;
    const left = ((centerX - halfW - (ox - mw / 2 * scale)) / (mw * scale)) * mw;
    const top = ((centerY - halfH - (oy - mh / 2 * scale)) / (mh * scale)) * mh;
    const rw = (2 * halfW / (mw * scale)) * mw;
    const rh = (2 * halfH / (mh * scale)) * mh;

    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(left, top, rw, rh);
  }, [centerX, centerY, zoom]);

  // Main render
  useEffect(() => {
    const currentRenderId = ++renderIdRef.current;
    setRendering(true);

    // Use requestAnimationFrame to keep UI responsive
    requestAnimationFrame(() => {
      if (currentRenderId !== renderIdRef.current) return;

      const result = computeFractal(centerX, centerY, zoom, fractalType, maxIterations, juliaReal, juliaImag);
      if (currentRenderId !== renderIdRef.current) return;

      const hist = renderToCanvas(result.iterCounts, result.width, result.height, maxIterations, colorScheme, canvasRef.current);
      setHistogram(hist);
      setRendering(false);

      if (fractalType === 'mandelbrot') {
        renderMinimap();
      }
    });
  }, [fractalType, maxIterations, colorScheme, juliaReal, juliaImag, centerX, centerY, zoom, computeFractal, renderToCanvas, renderMinimap]);

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    const scale = 3.0 / (zoom * Math.min(CANVAS_WIDTH, CANVAS_HEIGHT));
    const newCX = (px - CANVAS_WIDTH / 2) * scale + centerX;
    const newCY = (py - CANVAS_HEIGHT / 2) * scale + centerY;

    if (e.shiftKey || e.button === 2) {
      // Zoom out
      setZoom(z => z / 2);
    } else {
      // Zoom in centered on click
      setCenterX(newCX);
      setCenterY(newCY);
      setZoom(z => z * 2);
    }
  }, [centerX, centerY, zoom]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    handleCanvasClick({ ...e, shiftKey: true });
  }, [handleCanvasClick]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    const scale = 3.0 / (zoom * Math.min(CANVAS_WIDTH, CANVAS_HEIGHT));
    const realPart = (px - CANVAS_WIDTH / 2) * scale + centerX;
    const imagPart = (py - CANVAS_HEIGHT / 2) * scale + centerY;
    setMouseCoords({ re: realPart, im: imagPart });
  }, [centerX, centerY, zoom]);

  const handleMouseLeave = useCallback(() => {
    setMouseCoords(null);
  }, []);

  const applyPreset = useCallback((preset) => {
    setFractalType(preset.type);
    setCenterX(preset.centerX);
    setCenterY(preset.centerY);
    setZoom(preset.zoom);
    setMaxIterations(preset.maxIter);
    setJuliaReal(preset.juliaR);
    setJuliaImag(preset.juliaI);
  }, []);

  const resetView = useCallback(() => {
    if (fractalType === 'mandelbrot') {
      setCenterX(-0.5);
      setCenterY(0);
    } else {
      setCenterX(0);
      setCenterY(0);
    }
    setZoom(1);
  }, [fractalType]);

  const zoomDisplay = zoom >= 1000
    ? `${(zoom / 1000).toFixed(1)}Kx`
    : `${zoom.toFixed(zoom < 10 ? 1 : 0)}x`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
      <VisualizationToolbar canvasRef={canvasRef} filename="fractal-explorer" />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Fractal Explorer</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Click to zoom in. Shift+click or right-click to zoom out. Explore the infinite complexity of fractals.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fractal Type</label>
          <select
            value={fractalType}
            onChange={(e) => {
              setFractalType(e.target.value);
              if (e.target.value === 'mandelbrot') {
                setCenterX(-0.5); setCenterY(0);
              } else if (e.target.value === 'burningship') {
                setCenterX(-0.4); setCenterY(-0.6);
              } else {
                setCenterX(0); setCenterY(0);
              }
              setZoom(1);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
          >
            <option value="mandelbrot">Mandelbrot Set</option>
            <option value="julia">Julia Set</option>
            <option value="burningship">Burning Ship</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Max Iterations: {maxIterations}
          </label>
          <input
            type="range"
            min="50"
            max="500"
            value={maxIterations}
            onChange={(e) => setMaxIterations(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Color Scheme</label>
          <select
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
          >
            {COLOR_SCHEMES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={resetView}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Julia set controls */}
      {fractalType === 'julia' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div>
            <label className="block text-sm font-semibold text-purple-800 mb-1">
              Julia c (Real): {juliaReal.toFixed(4)}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.001"
              value={juliaReal}
              onChange={(e) => setJuliaReal(parseFloat(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-purple-800 mb-1">
              Julia c (Imaginary): {juliaImag.toFixed(4)}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.001"
              value={juliaImag}
              onChange={(e) => setJuliaImag(parseFloat(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
        </div>
      )}

      {/* Canvas area */}
      <div className="relative">
        <div className="relative bg-black rounded-lg overflow-hidden mx-auto" style={{ maxWidth: CANVAS_WIDTH }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleCanvasClick}
            onContextMenu={handleContextMenu}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-auto cursor-crosshair block"
          />

          {/* Rendering indicator */}
          {rendering && (
            <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-yellow-300 px-3 py-1.5 rounded-lg text-sm font-medium animate-pulse">
              Rendering...
            </div>
          )}

          {/* Zoom display */}
          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-lg text-sm font-mono">
            Zoom: {zoomDisplay}
          </div>

          {/* Coordinate display */}
          {mouseCoords && (
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-green-300 px-3 py-1.5 rounded-lg text-xs font-mono">
              {mouseCoords.re >= 0 ? ' ' : ''}{mouseCoords.re.toFixed(8)} {mouseCoords.im >= 0 ? '+' : '-'} {Math.abs(mouseCoords.im).toFixed(8)}i
            </div>
          )}

          {/* Minimap */}
          {fractalType === 'mandelbrot' && zoom > 1 && (
            <div className="absolute bottom-3 right-3 border-2 border-yellow-400 rounded shadow-lg">
              <canvas
                ref={minimapCanvasRef}
                width={MINIMAP_SIZE}
                height={Math.floor(MINIMAP_SIZE * 2 / 3)}
                className="block"
                style={{ width: MINIMAP_SIZE, height: Math.floor(MINIMAP_SIZE * 2 / 3) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Histogram */}
      {histogram && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Iteration Count Histogram</label>
          <div className="flex items-end gap-0.5" style={{ height: 60 }}>
            {(() => {
              const maxVal = Math.max(...histogram, 1);
              return histogram.map((val, i) => {
                const h = Math.max(1, (val / maxVal) * 56);
                const t = i / histogram.length;
                const [r, g, b] = getColor(colorScheme, t);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: h,
                      backgroundColor: `rgb(${r}, ${g}, ${b})`,
                      minWidth: 2,
                    }}
                    title={`Bucket ${i}: ${val} pixels`}
                  />
                );
              });
            })()}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low iterations</span>
            <span>High iterations</span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Center:</span>{' '}
          <span className="font-mono text-xs">{centerX.toFixed(6)}, {centerY.toFixed(6)}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Zoom Level:</span>{' '}
          <span className="font-mono text-xs">{zoomDisplay}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Pixel Size:</span>{' '}
          <span className="font-mono text-xs">{(3.0 / (zoom * Math.min(CANVAS_WIDTH, CANVAS_HEIGHT))).toExponential(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default FractalExplorerVisualizer;
