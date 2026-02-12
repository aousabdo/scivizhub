import React, { useMemo, useState } from 'react';
import {
  APPROXIMATION_METHODS,
  FUNCTION_PRESETS,
  buildPartition,
  clamp,
  computeApproximation,
  enforceBoundsGap,
  getMethodDescription,
  getMethodLabel,
  getYDomain,
  roundTo,
  sampleFunction,
} from './integralAccumulationUtils';

const SVG_WIDTH = 940;
const SVG_HEIGHT = 420;
const PADDING = 54;
const MIN_GAP = 0.2;

const toDisplay = (value, decimals = 4) => roundTo(value, decimals).toFixed(decimals);

const IntegralAccumulationVisualizer = () => {
  const [functionId, setFunctionId] = useState('quadratic');
  const [method, setMethod] = useState(APPROXIMATION_METHODS.MIDPOINT);
  const [subintervals, setSubintervals] = useState(12);
  const [leftBound, setLeftBound] = useState(-3);
  const [rightBound, setRightBound] = useState(3);

  const preset = FUNCTION_PRESETS[functionId];
  const { min: domainMin, max: domainMax } = preset.domain;

  const normalizedBounds = useMemo(() => {
    const clampedLeft = clamp(leftBound, domainMin, domainMax - MIN_GAP);
    const clampedRight = clamp(rightBound, domainMin + MIN_GAP, domainMax);
    return enforceBoundsGap(clampedLeft, clampedRight, MIN_GAP);
  }, [leftBound, rightBound, domainMin, domainMax]);

  const a = normalizedBounds.left;
  const b = normalizedBounds.right;

  const partition = useMemo(() => buildPartition(a, b, subintervals), [a, b, subintervals]);

  const exactIntegral = useMemo(() => {
    return preset.antiderivative(b) - preset.antiderivative(a);
  }, [preset, a, b]);

  const estimate = useMemo(() => {
    return computeApproximation(preset.evaluate, partition, method);
  }, [preset, partition, method]);

  const absoluteError = Math.abs(estimate - exactIntegral);

  const partitionHeights = useMemo(() => {
    return partition.flatMap(({ x0, x1, xm }) => [preset.evaluate(x0), preset.evaluate(x1), preset.evaluate(xm)]);
  }, [partition, preset]);

  const curvePoints = useMemo(() => {
    return sampleFunction(preset.evaluate, domainMin, domainMax);
  }, [preset, domainMin, domainMax]);

  const yDomain = useMemo(() => getYDomain(curvePoints, partitionHeights), [curvePoints, partitionHeights]);

  const xToPx = (x) => {
    return PADDING + ((x - domainMin) / (domainMax - domainMin)) * (SVG_WIDTH - 2 * PADDING);
  };

  const yToPx = (y) => {
    return SVG_HEIGHT - PADDING - ((y - yDomain.min) / (yDomain.max - yDomain.min)) * (SVG_HEIGHT - 2 * PADDING);
  };

  const xAxisY = yToPx(0);
  const yAxisX = xToPx(0);

  const curvePath = useMemo(() => {
    return curvePoints
      .map((point, index) => {
        const prefix = index === 0 ? 'M' : 'L';
        return `${prefix} ${xToPx(point.x)} ${yToPx(point.y)}`;
      })
      .join(' ');
  }, [curvePoints]);

  const partitionShapes = useMemo(() => {
    return partition.map(({ x0, x1, xm }, index) => {
      const y0 = yToPx(0);
      const leftY = yToPx(preset.evaluate(x0));
      const rightY = yToPx(preset.evaluate(x1));
      const midY = yToPx(preset.evaluate(xm));
      const px0 = xToPx(x0);
      const px1 = xToPx(x1);
      const pm = xToPx(xm);

      return {
        index,
        px0,
        px1,
        pm,
        y0,
        leftY,
        rightY,
        midY,
      };
    });
  }, [partition, preset, yDomain, domainMin, domainMax]);

  const renderApproximationShape = (shape) => {
    if (method === APPROXIMATION_METHODS.LEFT) {
      const top = Math.min(shape.leftY, shape.y0);
      const height = Math.abs(shape.leftY - shape.y0);
      return (
        <rect
          key={`left-${shape.index}`}
          x={shape.px0}
          y={top}
          width={shape.px1 - shape.px0}
          height={height}
          fill="rgba(59,130,246,0.28)"
          stroke="rgba(37,99,235,0.7)"
          strokeWidth="1"
        />
      );
    }

    if (method === APPROXIMATION_METHODS.RIGHT) {
      const top = Math.min(shape.rightY, shape.y0);
      const height = Math.abs(shape.rightY - shape.y0);
      return (
        <rect
          key={`right-${shape.index}`}
          x={shape.px0}
          y={top}
          width={shape.px1 - shape.px0}
          height={height}
          fill="rgba(34,197,94,0.28)"
          stroke="rgba(22,163,74,0.7)"
          strokeWidth="1"
        />
      );
    }

    if (method === APPROXIMATION_METHODS.MIDPOINT) {
      const top = Math.min(shape.midY, shape.y0);
      const height = Math.abs(shape.midY - shape.y0);
      return (
        <rect
          key={`mid-${shape.index}`}
          x={shape.px0}
          y={top}
          width={shape.px1 - shape.px0}
          height={height}
          fill="rgba(236,72,153,0.25)"
          stroke="rgba(190,24,93,0.7)"
          strokeWidth="1"
        />
      );
    }

    return (
      <polygon
        key={`trap-${shape.index}`}
        points={`${shape.px0},${shape.y0} ${shape.px0},${shape.leftY} ${shape.px1},${shape.rightY} ${shape.px1},${shape.y0}`}
        fill="rgba(249,115,22,0.25)"
        stroke="rgba(194,65,12,0.7)"
        strokeWidth="1"
      />
    );
  };

  const resetControls = () => {
    setFunctionId('quadratic');
    setMethod(APPROXIMATION_METHODS.MIDPOINT);
    setSubintervals(12);
    setLeftBound(-3);
    setRightBound(3);
  };

  const onLeftBoundChange = (nextLeft) => {
    const next = clamp(nextLeft, domainMin, domainMax - MIN_GAP);
    setLeftBound(next);
    if (rightBound - next < MIN_GAP) {
      setRightBound(clamp(next + MIN_GAP, domainMin + MIN_GAP, domainMax));
    }
  };

  const onRightBoundChange = (nextRight) => {
    const next = clamp(nextRight, domainMin + MIN_GAP, domainMax);
    setRightBound(next);
    if (next - leftBound < MIN_GAP) {
      setLeftBound(clamp(next - MIN_GAP, domainMin, domainMax - MIN_GAP));
    }
  };

  const onFunctionChange = (nextId) => {
    const nextPreset = FUNCTION_PRESETS[nextId];
    const nextMin = nextPreset.domain.min;
    const nextMax = nextPreset.domain.max;

    setFunctionId(nextId);
    setLeftBound(clamp(-3, nextMin, nextMax - MIN_GAP));
    setRightBound(clamp(3, nextMin + MIN_GAP, nextMax));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">Integral Accumulation Explorer</h2>
        <p className="text-gray-700">
          Approximate area under a curve using {getMethodLabel(method)} and compare it to the exact integral.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Function</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={functionId}
              onChange={(event) => onFunctionChange(event.target.value)}
            >
              {Object.values(FUNCTION_PRESETS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">{preset.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Approximation Method</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option value={APPROXIMATION_METHODS.LEFT}>Left Riemann Sum</option>
              <option value={APPROXIMATION_METHODS.RIGHT}>Right Riemann Sum</option>
              <option value={APPROXIMATION_METHODS.MIDPOINT}>Midpoint Riemann Sum</option>
              <option value={APPROXIMATION_METHODS.TRAPEZOID}>Trapezoidal Rule</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">{getMethodDescription(method)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subintervals (n): {subintervals}
            </label>
            <input
              type="range"
              min="2"
              max="120"
              value={subintervals}
              onChange={(event) => setSubintervals(parseInt(event.target.value, 10))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">
              More subintervals generally reduce approximation error.
            </p>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetControls}
              className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Reset Controls
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lower Bound a: {toDisplay(a, 2)}
            </label>
            <input
              type="range"
              min={domainMin}
              max={domainMax - MIN_GAP}
              step="0.1"
              value={a}
              onChange={(event) => onLeftBoundChange(parseFloat(event.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upper Bound b: {toDisplay(b, 2)}
            </label>
            <input
              type="range"
              min={domainMin + MIN_GAP}
              max={domainMax}
              step="0.1"
              value={b}
              onChange={(event) => onRightBoundChange(parseFloat(event.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="min-w-[720px]">
          <line x1={PADDING} y1={xAxisY} x2={SVG_WIDTH - PADDING} y2={xAxisY} stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={yAxisX} y1={PADDING} x2={yAxisX} y2={SVG_HEIGHT - PADDING} stroke="#94a3b8" strokeWidth="1.5" />

          {partitionShapes.map((shape) => renderApproximationShape(shape))}

          <path d={curvePath} fill="none" stroke="#0f172a" strokeWidth="2.4" />

          <line x1={xToPx(a)} y1={PADDING} x2={xToPx(a)} y2={SVG_HEIGHT - PADDING} stroke="#64748b" strokeDasharray="5 4" />
          <line x1={xToPx(b)} y1={PADDING} x2={xToPx(b)} y2={SVG_HEIGHT - PADDING} stroke="#64748b" strokeDasharray="5 4" />

          <text x={xToPx(a)} y={SVG_HEIGHT - PADDING + 20} textAnchor="middle" fontSize="12" fill="#334155">
            a = {toDisplay(a, 2)}
          </text>
          <text x={xToPx(b)} y={SVG_HEIGHT - PADDING + 20} textAnchor="middle" fontSize="12" fill="#334155">
            b = {toDisplay(b, 2)}
          </text>
          <text x={SVG_WIDTH - PADDING} y={xAxisY - 8} textAnchor="end" fontSize="12" fill="#334155">
            x
          </text>
          <text x={yAxisX + 10} y={PADDING + 10} fontSize="12" fill="#334155">
            y
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Approximation</h3>
          <p className="text-sm text-blue-800">{getMethodLabel(method)}</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">{toDisplay(estimate)}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-emerald-900 mb-2">Exact Integral</h3>
          <p className="text-sm text-emerald-800">F(b) - F(a)</p>
          <p className="text-2xl font-bold text-emerald-900 mt-2">{toDisplay(exactIntegral)}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Absolute Error</h3>
          <p className="text-sm text-amber-800">|Approximation - Exact|</p>
          <p className="text-2xl font-bold text-amber-900 mt-2">{toDisplay(absoluteError)}</p>
        </div>
      </div>
    </div>
  );
};

export default IntegralAccumulationVisualizer;
