export const APPROXIMATION_METHODS = {
  LEFT: 'left',
  RIGHT: 'right',
  MIDPOINT: 'midpoint',
  TRAPEZOID: 'trapezoid',
};

export const FUNCTION_PRESETS = {
  quadratic: {
    id: 'quadratic',
    label: 'f(x) = x²/4 + 1',
    description: 'A smooth upward-opening parabola that is always above the x-axis.',
    domain: { min: -6, max: 6 },
    evaluate: (x) => (x * x) / 4 + 1,
    antiderivative: (x) => (x * x * x) / 12 + x,
  },
  sineShifted: {
    id: 'sineShifted',
    label: 'f(x) = sin(x) + 2',
    description: 'A periodic function shifted upward, useful for seeing oscillatory accumulation.',
    domain: { min: -6.2, max: 6.2 },
    evaluate: (x) => Math.sin(x) + 2,
    antiderivative: (x) => -Math.cos(x) + 2 * x,
  },
  linear: {
    id: 'linear',
    label: 'f(x) = 0.5x + 2.5',
    description: 'A line with positive slope where area growth is easy to reason about geometrically.',
    domain: { min: -6, max: 6 },
    evaluate: (x) => 0.5 * x + 2.5,
    antiderivative: (x) => 0.25 * x * x + 2.5 * x,
  },
};

export const roundTo = (value, decimals = 4) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const enforceBoundsGap = (left, right, minGap = 0.2) => {
  if (right - left >= minGap) {
    return { left, right };
  }
  return {
    left,
    right: left + minGap,
  };
};

export const buildPartition = (a, b, n) => {
  const dx = (b - a) / n;
  const segments = [];

  for (let i = 0; i < n; i += 1) {
    const x0 = a + i * dx;
    const x1 = x0 + dx;
    const xm = (x0 + x1) / 2;
    segments.push({ x0, x1, xm, dx });
  }

  return segments;
};

export const computeApproximation = (fn, partition, method) => {
  let estimate = 0;

  partition.forEach(({ x0, x1, xm, dx }) => {
    if (method === APPROXIMATION_METHODS.LEFT) {
      estimate += fn(x0) * dx;
      return;
    }

    if (method === APPROXIMATION_METHODS.RIGHT) {
      estimate += fn(x1) * dx;
      return;
    }

    if (method === APPROXIMATION_METHODS.MIDPOINT) {
      estimate += fn(xm) * dx;
      return;
    }

    estimate += ((fn(x0) + fn(x1)) / 2) * dx;
  });

  return estimate;
};

export const getMethodLabel = (method) => {
  switch (method) {
    case APPROXIMATION_METHODS.LEFT:
      return 'Left Riemann Sum';
    case APPROXIMATION_METHODS.RIGHT:
      return 'Right Riemann Sum';
    case APPROXIMATION_METHODS.MIDPOINT:
      return 'Midpoint Riemann Sum';
    case APPROXIMATION_METHODS.TRAPEZOID:
      return 'Trapezoidal Rule';
    default:
      return 'Approximation';
  }
};

export const getMethodDescription = (method) => {
  switch (method) {
    case APPROXIMATION_METHODS.LEFT:
      return 'Each subinterval uses the function value at the left endpoint.';
    case APPROXIMATION_METHODS.RIGHT:
      return 'Each subinterval uses the function value at the right endpoint.';
    case APPROXIMATION_METHODS.MIDPOINT:
      return 'Each subinterval uses the function value at the midpoint.';
    case APPROXIMATION_METHODS.TRAPEZOID:
      return 'Each subinterval is modeled by a trapezoid between consecutive endpoints.';
    default:
      return '';
  }
};

export const sampleFunction = (fn, minX, maxX, sampleCount = 280) => {
  const points = [];
  const step = (maxX - minX) / (sampleCount - 1);

  for (let i = 0; i < sampleCount; i += 1) {
    const x = minX + i * step;
    points.push({ x, y: fn(x) });
  }

  return points;
};

export const getYDomain = (curvePoints, partitionHeights) => {
  const yValues = [0];
  curvePoints.forEach((point) => yValues.push(point.y));
  partitionHeights.forEach((height) => yValues.push(height));

  const rawMin = Math.min(...yValues);
  const rawMax = Math.max(...yValues);
  const spread = Math.max(1, rawMax - rawMin);
  const padding = spread * 0.12;

  return {
    min: rawMin - padding,
    max: rawMax + padding,
  };
};
