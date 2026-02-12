import React, { useMemo, useState } from 'react';
import {
  DEFAULT_PROJECTILE_PARAMS,
  buildSvgPath,
  clamp,
  roundTo,
  simulateProjectile,
  solveNoDragMetrics,
} from './projectileMotionUtils';

const SVG_WIDTH = 960;
const SVG_HEIGHT = 430;
const PADDING = 58;

const formatStat = (value, unit = '', digits = 2) => `${roundTo(value, digits).toFixed(digits)}${unit}`;

const SliderControl = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  disabled = false,
  unit = '',
}) => (
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
      disabled={disabled}
      className="w-full disabled:opacity-50"
    />
  </div>
);

const ProjectileMotionVisualizer = () => {
  const [launchSpeed, setLaunchSpeed] = useState(DEFAULT_PROJECTILE_PARAMS.launchSpeed);
  const [launchAngleDeg, setLaunchAngleDeg] = useState(DEFAULT_PROJECTILE_PARAMS.launchAngleDeg);
  const [gravity, setGravity] = useState(DEFAULT_PROJECTILE_PARAMS.gravity);
  const [initialHeight, setInitialHeight] = useState(DEFAULT_PROJECTILE_PARAMS.initialHeight);
  const [dragEnabled, setDragEnabled] = useState(true);
  const [dragCoefficient, setDragCoefficient] = useState(DEFAULT_PROJECTILE_PARAMS.dragCoefficient);
  const [windSpeed, setWindSpeed] = useState(DEFAULT_PROJECTILE_PARAMS.windSpeed);
  const [showNoDragReference, setShowNoDragReference] = useState(true);

  const effectiveDrag = dragEnabled ? dragCoefficient : 0;

  const trajectory = useMemo(() => {
    return simulateProjectile({
      launchSpeed,
      launchAngleDeg,
      gravity,
      initialHeight,
      dragCoefficient: effectiveDrag,
      windSpeed,
    });
  }, [launchSpeed, launchAngleDeg, gravity, initialHeight, effectiveDrag, windSpeed]);

  const noDragTrajectory = useMemo(() => {
    return simulateProjectile({
      launchSpeed,
      launchAngleDeg,
      gravity,
      initialHeight,
      dragCoefficient: 0,
      windSpeed: 0,
    });
  }, [launchSpeed, launchAngleDeg, gravity, initialHeight]);

  const noDragMetrics = useMemo(() => {
    return solveNoDragMetrics({
      launchSpeed,
      launchAngleDeg,
      gravity,
      initialHeight,
    });
  }, [launchSpeed, launchAngleDeg, gravity, initialHeight]);

  const maxX = Math.max(
    trajectory.metrics.range,
    noDragTrajectory.metrics.range,
    10
  );
  const maxY = Math.max(
    trajectory.metrics.maxHeight,
    noDragTrajectory.metrics.maxHeight,
    initialHeight + 1
  );

  const xDomainMax = maxX * 1.08;
  const yDomainMax = maxY * 1.16;

  const xToPx = (x) => {
    return PADDING + (x / xDomainMax) * (SVG_WIDTH - 2 * PADDING);
  };

  const yToPx = (y) => {
    return SVG_HEIGHT - PADDING - (y / yDomainMax) * (SVG_HEIGHT - 2 * PADDING);
  };

  const primaryPath = useMemo(() => buildSvgPath(trajectory.points, xToPx, yToPx), [trajectory, xDomainMax, yDomainMax]);
  const noDragPath = useMemo(() => buildSvgPath(noDragTrajectory.points, xToPx, yToPx), [noDragTrajectory, xDomainMax, yDomainMax]);

  const gridLines = useMemo(() => {
    const xTicks = 8;
    const yTicks = 6;
    const vertical = [];
    const horizontal = [];

    for (let i = 0; i <= xTicks; i += 1) {
      const value = (xDomainMax * i) / xTicks;
      vertical.push({
        value,
        px: xToPx(value),
      });
    }

    for (let j = 0; j <= yTicks; j += 1) {
      const value = (yDomainMax * j) / yTicks;
      horizontal.push({
        value,
        px: yToPx(value),
      });
    }

    return { vertical, horizontal };
  }, [xDomainMax, yDomainMax]);

  const resetToDefaults = () => {
    setLaunchSpeed(DEFAULT_PROJECTILE_PARAMS.launchSpeed);
    setLaunchAngleDeg(DEFAULT_PROJECTILE_PARAMS.launchAngleDeg);
    setGravity(DEFAULT_PROJECTILE_PARAMS.gravity);
    setInitialHeight(DEFAULT_PROJECTILE_PARAMS.initialHeight);
    setDragEnabled(true);
    setDragCoefficient(DEFAULT_PROJECTILE_PARAMS.dragCoefficient);
    setWindSpeed(DEFAULT_PROJECTILE_PARAMS.windSpeed);
    setShowNoDragReference(true);
  };

  const setEarthPreset = () => {
    setGravity(9.81);
    setDragEnabled(true);
    setDragCoefficient(0.06);
    setWindSpeed(0);
  };

  const setMoonPreset = () => {
    setGravity(1.62);
    setDragEnabled(false);
    setDragCoefficient(0);
    setWindSpeed(0);
  };

  const setMarsPreset = () => {
    setGravity(3.71);
    setDragEnabled(true);
    setDragCoefficient(0.03);
    setWindSpeed(0);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">Projectile Motion Lab</h2>
        <p className="text-gray-700 mb-5">
          Adjust launch conditions and environmental parameters to explore trajectory shape, range, and flight time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SliderControl
            label="Launch Speed"
            min={5}
            max={120}
            step={1}
            value={launchSpeed}
            unit=" m/s"
            onChange={(value) => setLaunchSpeed(clamp(value, 5, 120))}
          />
          <SliderControl
            label="Launch Angle"
            min={5}
            max={85}
            step={1}
            value={launchAngleDeg}
            unit="°"
            onChange={(value) => setLaunchAngleDeg(clamp(value, 5, 85))}
          />
          <SliderControl
            label="Initial Height"
            min={0}
            max={40}
            step={0.5}
            value={initialHeight}
            unit=" m"
            onChange={(value) => setInitialHeight(clamp(value, 0, 40))}
          />
          <SliderControl
            label="Gravity"
            min={1}
            max={24}
            step={0.01}
            value={roundTo(gravity, 2)}
            unit=" m/s²"
            onChange={(value) => setGravity(clamp(value, 1, 24))}
          />
          <SliderControl
            label="Wind Speed"
            min={-25}
            max={25}
            step={0.5}
            value={windSpeed}
            unit=" m/s"
            onChange={(value) => setWindSpeed(clamp(value, -25, 25))}
          />
          <SliderControl
            label="Drag Coefficient"
            min={0}
            max={0.25}
            step={0.005}
            value={roundTo(dragCoefficient, 3)}
            onChange={(value) => setDragCoefficient(clamp(value, 0, 0.25))}
            disabled={!dragEnabled}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDragEnabled((current) => !current)}
            className={`px-4 py-2 rounded-md border ${dragEnabled ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
          >
            Air Resistance: {dragEnabled ? 'On' : 'Off'}
          </button>

          <button
            type="button"
            onClick={() => setShowNoDragReference((current) => !current)}
            className={`px-4 py-2 rounded-md border ${showNoDragReference ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
          >
            No-Drag Reference: {showNoDragReference ? 'Shown' : 'Hidden'}
          </button>

          <button type="button" onClick={setEarthPreset} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            Earth Preset
          </button>
          <button type="button" onClick={setMoonPreset} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            Moon Preset
          </button>
          <button type="button" onClick={setMarsPreset} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            Mars Preset
          </button>
          <button type="button" onClick={resetToDefaults} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="min-w-[720px]">
          {gridLines.vertical.map((tick) => (
            <g key={`x-${tick.value}`}>
              <line
                x1={tick.px}
                y1={PADDING}
                x2={tick.px}
                y2={SVG_HEIGHT - PADDING}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={tick.px}
                y={SVG_HEIGHT - PADDING + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {roundTo(tick.value, 0)}
              </text>
            </g>
          ))}

          {gridLines.horizontal.map((tick) => (
            <g key={`y-${tick.value}`}>
              <line
                x1={PADDING}
                y1={tick.px}
                x2={SVG_WIDTH - PADDING}
                y2={tick.px}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={PADDING - 12}
                y={tick.px + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
              >
                {roundTo(tick.value, 0)}
              </text>
            </g>
          ))}

          <line
            x1={PADDING}
            y1={yToPx(0)}
            x2={SVG_WIDTH - PADDING}
            y2={yToPx(0)}
            stroke="#475569"
            strokeWidth="2"
          />

          {showNoDragReference && (
            <path
              d={noDragPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="6 5"
            />
          )}

          <path d={primaryPath} fill="none" stroke="#2563eb" strokeWidth="3" />

          <circle cx={xToPx(0)} cy={yToPx(initialHeight)} r="5" fill="#0f172a" />
          <text x={xToPx(0) + 8} y={yToPx(initialHeight) - 8} fontSize="12" fill="#0f172a">
            Launch Point
          </text>

          <circle
            cx={xToPx(trajectory.metrics.range)}
            cy={yToPx(0)}
            r="5"
            fill="#1d4ed8"
          />

          <text x={SVG_WIDTH - PADDING} y={PADDING - 10} textAnchor="end" fontSize="12" fill="#334155">
            Height (m)
          </text>
          <text x={SVG_WIDTH - PADDING} y={SVG_HEIGHT - PADDING + 32} textAnchor="end" fontSize="12" fill="#334155">
            Horizontal Distance (m)
          </text>
        </svg>

        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-[3px] bg-blue-600" />
            <span>Current simulation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-[3px] bg-slate-500" style={{ borderTop: '2px dashed #64748b' }} />
            <span>No-drag reference</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="text-xl font-semibold text-blue-900 mb-3">Simulated Results</h3>
          <div className="space-y-2 text-blue-900">
            <p>Time of flight: {formatStat(trajectory.metrics.timeOfFlight, ' s')}</p>
            <p>Range: {formatStat(trajectory.metrics.range, ' m')}</p>
            <p>Maximum height: {formatStat(trajectory.metrics.maxHeight, ' m')}</p>
            <p>Impact speed: {formatStat(trajectory.metrics.impactSpeed, ' m/s')}</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <h3 className="text-xl font-semibold text-emerald-900 mb-3">Vacuum Baseline (Analytic)</h3>
          {noDragMetrics ? (
            <div className="space-y-2 text-emerald-900">
              <p>Time of flight: {formatStat(noDragMetrics.timeOfFlight, ' s')}</p>
              <p>Range: {formatStat(noDragMetrics.range, ' m')}</p>
              <p>Maximum height: {formatStat(noDragMetrics.maxHeight, ' m')}</p>
              <p>Impact speed: {formatStat(noDragMetrics.impactSpeed, ' m/s')}</p>
            </div>
          ) : (
            <p className="text-emerald-900">No closed-form solution available for current parameters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectileMotionVisualizer;
