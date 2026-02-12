import React, { useMemo, useState } from 'react';
import {
  applyMatrix2,
  buildSvgPath,
  clamp,
  eigenDecomposition2,
  getIdentityMatrix2,
  gridLines,
  interpolateFromIdentity,
  matrixPresets,
  roundTo,
  sampleCirclePoints,
} from './eigenGeometryUtils';

const SVG_WIDTH = 940;
const SVG_HEIGHT = 470;
const PADDING = 54;

const formatScalar = (value, digits = 3) => roundTo(value, digits).toFixed(digits);

const getOrientationLabel = (determinant) => {
  if (Math.abs(determinant) < 1e-8) {
    return 'Singular (collapses area)';
  }
  return determinant > 0 ? 'Orientation preserved' : 'Orientation reversed';
};

const SliderInput = ({ label, value, min, max, step, onChange, unit = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}: {value}
      {unit}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(parseFloat(event.target.value))}
      className="w-full"
    />
  </div>
);

const EigenGeometryVisualizer = () => {
  const [baseMatrix, setBaseMatrix] = useState({
    a: 2.0,
    b: 0.6,
    c: 0.3,
    d: 0.8,
  });
  const [interpolation, setInterpolation] = useState(1);
  const [vectorX, setVectorX] = useState(1.5);
  const [vectorY, setVectorY] = useState(1.0);
  const [showGrid, setShowGrid] = useState(true);
  const [showTransformedGrid, setShowTransformedGrid] = useState(true);
  const [showUnitCircle, setShowUnitCircle] = useState(true);
  const [showEigenDirections, setShowEigenDirections] = useState(true);

  const currentMatrix = useMemo(
    () => interpolateFromIdentity(baseMatrix, interpolation),
    [baseMatrix, interpolation]
  );

  const eigenData = useMemo(() => eigenDecomposition2(currentMatrix), [currentMatrix]);

  const inputVector = useMemo(() => ({ x: vectorX, y: vectorY }), [vectorX, vectorY]);
  const transformedVector = useMemo(
    () => applyMatrix2(currentMatrix, inputVector),
    [currentMatrix, inputVector]
  );

  const baseCircle = useMemo(() => sampleCirclePoints(1, 140), []);
  const transformedCircle = useMemo(
    () => baseCircle.map((point) => applyMatrix2(currentMatrix, point)),
    [baseCircle, currentMatrix]
  );

  const staticGrid = useMemo(() => gridLines(4, 1), []);
  const transformedGrid = useMemo(() => {
    return staticGrid.map((line) => ({
      ...line,
      fromT: applyMatrix2(currentMatrix, line.from),
      toT: applyMatrix2(currentMatrix, line.to),
    }));
  }, [staticGrid, currentMatrix]);

  const worldExtent = useMemo(() => {
    const samples = [
      ...transformedCircle,
      inputVector,
      transformedVector,
      ...transformedGrid.flatMap((line) => [line.fromT, line.toT]),
    ];
    const maxAbs = samples.reduce(
      (maxValue, point) => Math.max(maxValue, Math.abs(point.x), Math.abs(point.y)),
      4.5
    );
    return clamp(maxAbs * 1.15, 4.5, 16);
  }, [transformedCircle, inputVector, transformedVector, transformedGrid]);

  const xToPx = (x) => {
    return PADDING + ((x + worldExtent) / (2 * worldExtent)) * (SVG_WIDTH - 2 * PADDING);
  };
  const yToPx = (y) => {
    return SVG_HEIGHT - PADDING - ((y + worldExtent) / (2 * worldExtent)) * (SVG_HEIGHT - 2 * PADDING);
  };

  const baseCirclePath = useMemo(() => buildSvgPath(baseCircle, xToPx, yToPx), [baseCircle, worldExtent]);
  const transformedCirclePath = useMemo(
    () => buildSvgPath(transformedCircle, xToPx, yToPx),
    [transformedCircle, worldExtent]
  );

  const applyPreset = (matrix) => {
    setBaseMatrix(matrix);
    setInterpolation(1);
  };

  const updateMatrixEntry = (key, value) => {
    setBaseMatrix((current) => ({
      ...current,
      [key]: clamp(value, -3, 3),
    }));
  };

  const resetAll = () => {
    setBaseMatrix(getIdentityMatrix2());
    setInterpolation(1);
    setVectorX(1.5);
    setVectorY(1.0);
    setShowGrid(true);
    setShowTransformedGrid(true);
    setShowUnitCircle(true);
    setShowEigenDirections(true);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">Eigen Geometry Explorer (2x2)</h2>
        <p className="text-gray-700 mb-6">
          Explore how linear transformations stretch, flip, or rotate space, and identify invariant eigenvector directions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <SliderInput label="a₁₁" min={-3} max={3} step={0.05} value={baseMatrix.a} onChange={(v) => updateMatrixEntry('a', v)} />
            <SliderInput label="a₁₂" min={-3} max={3} step={0.05} value={baseMatrix.b} onChange={(v) => updateMatrixEntry('b', v)} />
            <SliderInput label="a₂₁" min={-3} max={3} step={0.05} value={baseMatrix.c} onChange={(v) => updateMatrixEntry('c', v)} />
            <SliderInput label="a₂₂" min={-3} max={3} step={0.05} value={baseMatrix.d} onChange={(v) => updateMatrixEntry('d', v)} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <SliderInput
              label="Interpolation t (I → A)"
              min={0}
              max={1}
              step={0.01}
              value={roundTo(interpolation, 2)}
              onChange={(v) => setInterpolation(clamp(v, 0, 1))}
            />
            <SliderInput
              label="Input Vector x"
              min={-4}
              max={4}
              step={0.1}
              value={roundTo(vectorX, 1)}
              onChange={(v) => setVectorX(clamp(v, -4, 4))}
            />
            <SliderInput
              label="Input Vector y"
              min={-4}
              max={4}
              step={0.1}
              value={roundTo(vectorY, 1)}
              onChange={(v) => setVectorY(clamp(v, -4, 4))}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {matrixPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.matrix)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              {preset.label}
            </button>
          ))}
          <button type="button" onClick={resetAll} className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            Reset
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowGrid((value) => !value)}
            className={`px-3 py-2 border rounded-md ${showGrid ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'}`}
          >
            Original Grid: {showGrid ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={() => setShowTransformedGrid((value) => !value)}
            className={`px-3 py-2 border rounded-md ${showTransformedGrid ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-300'}`}
          >
            Transformed Grid: {showTransformedGrid ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={() => setShowUnitCircle((value) => !value)}
            className={`px-3 py-2 border rounded-md ${showUnitCircle ? 'bg-purple-100 border-purple-300' : 'bg-gray-100 border-gray-300'}`}
          >
            Unit Circle: {showUnitCircle ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={() => setShowEigenDirections((value) => !value)}
            className={`px-3 py-2 border rounded-md ${showEigenDirections ? 'bg-amber-100 border-amber-300' : 'bg-gray-100 border-gray-300'}`}
          >
            Eigen Directions: {showEigenDirections ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="min-w-[760px]">
          <defs>
            <marker id="arrowInput" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#1e293b" />
            </marker>
            <marker id="arrowOutput" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#2563eb" />
            </marker>
          </defs>

          {showGrid &&
            staticGrid.map((line, index) => (
              <line
                key={`grid-${index}`}
                x1={xToPx(line.from.x)}
                y1={yToPx(line.from.y)}
                x2={xToPx(line.to.x)}
                y2={yToPx(line.to.y)}
                stroke={line.axis ? '#94a3b8' : '#e2e8f0'}
                strokeWidth={line.axis ? '1.7' : '1'}
              />
            ))}

          {showTransformedGrid &&
            transformedGrid.map((line, index) => (
              <line
                key={`tgrid-${index}`}
                x1={xToPx(line.fromT.x)}
                y1={yToPx(line.fromT.y)}
                x2={xToPx(line.toT.x)}
                y2={yToPx(line.toT.y)}
                stroke={line.axis ? 'rgba(16,185,129,0.8)' : 'rgba(16,185,129,0.45)'}
                strokeWidth={line.axis ? '1.8' : '1'}
              />
            ))}

          {showUnitCircle && (
            <>
              <path d={baseCirclePath} fill="none" stroke="rgba(99,102,241,0.75)" strokeWidth="1.8" strokeDasharray="5 4" />
              <path d={transformedCirclePath} fill="none" stroke="rgba(236,72,153,0.85)" strokeWidth="2.4" />
            </>
          )}

          {showEigenDirections &&
            eigenData.type === 'real' &&
            eigenData.eigenvectors.map((entry, index) => {
              const scale = worldExtent * 1.2;
              const p1 = { x: -entry.vector.x * scale, y: -entry.vector.y * scale };
              const p2 = { x: entry.vector.x * scale, y: entry.vector.y * scale };
              return (
                <line
                  key={`eigen-${index}`}
                  x1={xToPx(p1.x)}
                  y1={yToPx(p1.y)}
                  x2={xToPx(p2.x)}
                  y2={yToPx(p2.y)}
                  stroke="rgba(217,119,6,0.8)"
                  strokeWidth="2.2"
                  strokeDasharray="7 5"
                />
              );
            })}

          <line
            x1={xToPx(0)}
            y1={yToPx(0)}
            x2={xToPx(inputVector.x)}
            y2={yToPx(inputVector.y)}
            stroke="#1e293b"
            strokeWidth="2.5"
            markerEnd="url(#arrowInput)"
          />

          <line
            x1={xToPx(0)}
            y1={yToPx(0)}
            x2={xToPx(transformedVector.x)}
            y2={yToPx(transformedVector.y)}
            stroke="#2563eb"
            strokeWidth="2.9"
            markerEnd="url(#arrowOutput)"
          />

          <text x={xToPx(inputVector.x) + 7} y={yToPx(inputVector.y) - 7} fontSize="12" fill="#1e293b">
            v
          </text>
          <text x={xToPx(transformedVector.x) + 7} y={yToPx(transformedVector.y) - 7} fontSize="12" fill="#1d4ed8">
            Av
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Matrix + Invariants</h3>
          <div className="text-blue-900 space-y-1 text-sm">
            <p>
              A = [[{formatScalar(currentMatrix.a, 2)}, {formatScalar(currentMatrix.b, 2)}], [{formatScalar(currentMatrix.c, 2)}, {formatScalar(currentMatrix.d, 2)}]]
            </p>
            <p>trace(A) = {formatScalar(eigenData.trace)}</p>
            <p>det(A) = {formatScalar(eigenData.determinant)}</p>
            <p>{getOrientationLabel(eigenData.determinant)}</p>
            <p>Area scale = |det(A)| = {formatScalar(Math.abs(eigenData.determinant))}</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-emerald-900 mb-3">Eigenvalues</h3>
          {eigenData.type === 'complex' ? (
            <div className="text-emerald-900 space-y-1 text-sm">
              <p>λ₁ = {formatScalar(eigenData.eigenvalues[0].real)} + {formatScalar(eigenData.eigenvalues[0].imag)}i</p>
              <p>λ₂ = {formatScalar(eigenData.eigenvalues[1].real)} - {formatScalar(eigenData.eigenvalues[0].imag)}i</p>
              <p>No real eigenvector directions in 2D.</p>
            </div>
          ) : (
            <div className="text-emerald-900 space-y-1 text-sm">
              <p>λ₁ = {formatScalar(eigenData.eigenvalues[0].real)}</p>
              <p>λ₂ = {formatScalar(eigenData.eigenvalues[1].real)}</p>
              <p>Discriminant = {formatScalar(eigenData.discriminant)}</p>
              {eigenData.repeated && <p>Repeated eigenvalue case</p>}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">Eigenvectors</h3>
          {eigenData.type === 'real' ? (
            <div className="text-amber-900 text-sm space-y-1">
              {eigenData.eigenvectors.map((entry, index) => (
                <p key={`ev-${index}`}>
                  v{index + 1} ≈ ({formatScalar(entry.vector.x, 3)}, {formatScalar(entry.vector.y, 3)}) for λ = {formatScalar(entry.lambda)}
                </p>
              ))}
              {eigenData.defective && <p>Defective matrix: only one independent eigenvector direction.</p>}
            </div>
          ) : (
            <p className="text-amber-900 text-sm">
              Complex eigenvalues imply rotation-scaling behavior without real invariant lines.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EigenGeometryVisualizer;
