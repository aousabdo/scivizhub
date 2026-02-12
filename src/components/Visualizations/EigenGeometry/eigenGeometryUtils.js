export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const roundTo = (value, decimals = 3) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const getIdentityMatrix2 = () => ({
  a: 1,
  b: 0,
  c: 0,
  d: 1,
});

export const interpolateFromIdentity = (matrix, t) => {
  const clampedT = clamp(t, 0, 1);
  return {
    a: 1 + clampedT * (matrix.a - 1),
    b: clampedT * matrix.b,
    c: clampedT * matrix.c,
    d: 1 + clampedT * (matrix.d - 1),
  };
};

export const applyMatrix2 = (matrix, vector) => ({
  x: matrix.a * vector.x + matrix.b * vector.y,
  y: matrix.c * vector.x + matrix.d * vector.y,
});

export const determinant2 = (matrix) => matrix.a * matrix.d - matrix.b * matrix.c;

export const trace2 = (matrix) => matrix.a + matrix.d;

const normalize = (vector) => {
  const magnitude = Math.hypot(vector.x, vector.y);
  if (magnitude < 1e-10) return null;
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
};

const eigenvectorForLambda = (matrix, lambda) => {
  const candidateA = {
    x: matrix.b,
    y: lambda - matrix.a,
  };
  const normalizedA = normalize(candidateA);
  if (normalizedA) return normalizedA;

  const candidateB = {
    x: lambda - matrix.d,
    y: matrix.c,
  };
  const normalizedB = normalize(candidateB);
  if (normalizedB) return normalizedB;

  return { x: 1, y: 0 };
};

const rankOfShifted = (matrix, lambda) => {
  const r1 = [matrix.a - lambda, matrix.b];
  const r2 = [matrix.c, matrix.d - lambda];
  const eps = 1e-9;

  const rowNorm = (row) => Math.abs(row[0]) + Math.abs(row[1]);
  const n1 = rowNorm(r1);
  const n2 = rowNorm(r2);

  if (n1 < eps && n2 < eps) return 0;

  const determinant = r1[0] * r2[1] - r1[1] * r2[0];
  if (Math.abs(determinant) > eps) return 2;

  return 1;
};

export const eigenDecomposition2 = (matrix) => {
  const tr = trace2(matrix);
  const det = determinant2(matrix);
  const discriminant = tr * tr - 4 * det;
  const eps = 1e-9;

  if (discriminant < -eps) {
    const realPart = tr / 2;
    const imaginaryPart = Math.sqrt(-discriminant) / 2;

    return {
      trace: tr,
      determinant: det,
      discriminant,
      type: 'complex',
      eigenvalues: [
        { real: realPart, imag: imaginaryPart },
        { real: realPart, imag: -imaginaryPart },
      ],
      eigenvectors: [],
      repeated: false,
      defective: false,
    };
  }

  const sqrtDisc = Math.sqrt(Math.max(0, discriminant));
  const lambda1 = (tr + sqrtDisc) / 2;
  const lambda2 = (tr - sqrtDisc) / 2;

  if (Math.abs(lambda1 - lambda2) < eps) {
    const rank = rankOfShifted(matrix, lambda1);
    const eigenspaceDimension = 2 - rank;

    return {
      trace: tr,
      determinant: det,
      discriminant,
      type: 'real',
      repeated: true,
      defective: eigenspaceDimension === 1,
      eigenvalues: [{ real: lambda1, imag: 0 }, { real: lambda2, imag: 0 }],
      eigenvectors: eigenspaceDimension === 2
        ? [{ lambda: lambda1, vector: { x: 1, y: 0 } }, { lambda: lambda1, vector: { x: 0, y: 1 } }]
        : [{ lambda: lambda1, vector: eigenvectorForLambda(matrix, lambda1) }],
    };
  }

  return {
    trace: tr,
    determinant: det,
    discriminant,
    type: 'real',
    repeated: false,
    defective: false,
    eigenvalues: [{ real: lambda1, imag: 0 }, { real: lambda2, imag: 0 }],
    eigenvectors: [
      { lambda: lambda1, vector: eigenvectorForLambda(matrix, lambda1) },
      { lambda: lambda2, vector: eigenvectorForLambda(matrix, lambda2) },
    ],
  };
};

export const sampleCirclePoints = (radius = 1, count = 120) => {
  const points = [];
  for (let i = 0; i <= count; i += 1) {
    const theta = (i / count) * Math.PI * 2;
    points.push({
      x: radius * Math.cos(theta),
      y: radius * Math.sin(theta),
    });
  }
  return points;
};

export const buildSvgPath = (points, xToPx, yToPx) => {
  if (!points.length) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xToPx(point.x)} ${yToPx(point.y)}`)
    .join(' ');
};

export const gridLines = (range = 5, step = 1) => {
  const lines = [];
  for (let x = -range; x <= range; x += step) {
    lines.push({
      from: { x, y: -range },
      to: { x, y: range },
      axis: x === 0,
    });
  }
  for (let y = -range; y <= range; y += step) {
    lines.push({
      from: { x: -range, y },
      to: { x: range, y },
      axis: y === 0,
    });
  }
  return lines;
};

export const matrixPresets = [
  {
    id: 'stretch',
    label: 'Axis Stretch',
    matrix: { a: 2.0, b: 0, c: 0, d: 0.5 },
  },
  {
    id: 'shear',
    label: 'Shear',
    matrix: { a: 1, b: 1.2, c: 0.2, d: 1 },
  },
  {
    id: 'reflection',
    label: 'Reflect Y-Axis',
    matrix: { a: -1, b: 0, c: 0, d: 1 },
  },
  {
    id: 'rotation',
    label: 'Rotation 45°',
    matrix: {
      a: Math.cos(Math.PI / 4),
      b: -Math.sin(Math.PI / 4),
      c: Math.sin(Math.PI / 4),
      d: Math.cos(Math.PI / 4),
    },
  },
  {
    id: 'saddle',
    label: 'Saddle',
    matrix: { a: 1.5, b: 0.8, c: 0.3, d: -0.6 },
  },
];
