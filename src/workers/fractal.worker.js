/**
 * Fractal computation Web Worker.
 *
 * Receives: { taskId, payload: { width, height, centerX, centerY, zoom, type, maxIter, juliaR, juliaI, colorScheme } }
 * Returns:  { taskId, payload: { imageBuffer, histogram } }
 *   imageBuffer is a transferable ArrayBuffer (RGBA pixel data)
 */

/* eslint-disable no-restricted-globals */

// ── Color functions (duplicated here since workers can't import from main bundle) ──

function getColor(scheme, t) {
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
      const l = 0.5;
      const c = 1; // (1 - Math.abs(2*l - 1)) * 1
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

// ── Fractal computation ──

function computeAndRender({ width, height, centerX, centerY, zoom, type, maxIter, juliaR, juliaI, colorScheme }) {
  const pixelCount = width * height;
  const imageData = new Uint8ClampedArray(pixelCount * 4);

  const scale = 3.0 / (zoom * Math.min(width, height));

  // Histogram buckets
  const histBuckets = 32;
  const hist = new Array(histBuckets).fill(0);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x0 = (px - width / 2) * scale + centerX;
      const y0 = (py - height / 2) * scale + centerY;

      let zx, zy, cr, ci;

      if (type === 'julia') {
        zx = x0;
        zy = y0;
        cr = juliaR;
        ci = juliaI;
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

      // Smooth coloring
      let smoothIter = iter;
      if (iter < maxIter) {
        const logZn = Math.log(zx2 + zy2) / 2;
        const nu = Math.log(logZn / Math.LN2) / Math.LN2;
        smoothIter = iter + 1 - nu;
        if (isNaN(smoothIter) || smoothIter < 0) smoothIter = 0;
      }

      // Color mapping
      const t = smoothIter >= maxIter ? 0 : (smoothIter % 40) / 40;
      const [r, g, b] = getColor(colorScheme, t);

      const idx = (py * width + px) * 4;
      imageData[idx] = r;
      imageData[idx + 1] = g;
      imageData[idx + 2] = b;
      imageData[idx + 3] = 255;

      // Histogram
      if (smoothIter < maxIter) {
        const bucket = Math.min(histBuckets - 1, Math.floor((smoothIter / maxIter) * histBuckets));
        hist[bucket]++;
      }
    }
  }

  return { imageData, histogram: hist };
}

// ── Message handler ──

self.onmessage = function (e) {
  const { taskId, payload } = e.data;
  try {
    const { imageData, histogram } = computeAndRender(payload);
    // Transfer the ArrayBuffer for zero-copy performance
    const buffer = imageData.buffer;
    self.postMessage(
      { taskId, payload: { imageBuffer: buffer, histogram, width: payload.width, height: payload.height } },
      [buffer]
    );
  } catch (err) {
    self.postMessage({ taskId, error: err.message || 'Computation failed' });
  }
};
