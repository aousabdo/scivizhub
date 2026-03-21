import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 450;
const QUARANTINE_X = CANVAS_WIDTH * 0.75;

const STATUS = { SUSCEPTIBLE: 0, INFECTED: 1, RECOVERED: 2, DECEASED: 3 };
const COLORS = { [STATUS.SUSCEPTIBLE]: '#22c55e', [STATUS.INFECTED]: '#ef4444', [STATUS.RECOVERED]: '#3b82f6', [STATUS.DECEASED]: '#9ca3af' };

const PRESETS = {
  'No Intervention': { populationSize: 300, initialInfected: 5, infectionRadius: 15, infectionProbability: 0.4, recoveryTime: 200, mortalityRate: 0.05, vaccinationRate: 0, movementSpeed: 1.5, socialDistancing: false, quarantine: false },
  'Mild Flu': { populationSize: 300, initialInfected: 3, infectionRadius: 10, infectionProbability: 0.3, recoveryTime: 150, mortalityRate: 0.01, vaccinationRate: 0, movementSpeed: 1.5, socialDistancing: false, quarantine: false },
  'Aggressive Virus': { populationSize: 300, initialInfected: 5, infectionRadius: 20, infectionProbability: 0.7, recoveryTime: 300, mortalityRate: 0.15, vaccinationRate: 0, movementSpeed: 2.0, socialDistancing: false, quarantine: false },
  'With Vaccination': { populationSize: 300, initialInfected: 5, infectionRadius: 15, infectionProbability: 0.5, recoveryTime: 200, mortalityRate: 0.05, vaccinationRate: 0.4, movementSpeed: 1.5, socialDistancing: false, quarantine: false },
  'Social Distancing': { populationSize: 300, initialInfected: 5, infectionRadius: 15, infectionProbability: 0.4, recoveryTime: 200, mortalityRate: 0.05, vaccinationRate: 0, movementSpeed: 1.5, socialDistancing: true, quarantine: false },
};

const DEFAULT_PARAMS = PRESETS['No Intervention'];

const SliderControl = ({ label, min, max, step, value, onChange, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}: <span className="font-semibold">{typeof value === 'number' ? (Number.isInteger(step) ? value : value.toFixed(2)) : value}</span>
    </label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} disabled={disabled} className="w-full disabled:opacity-50" />
  </div>
);

const ToggleControl = ({ label, checked, onChange, disabled = false }) => (
  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} className="w-4 h-4" />
    {label}
  </label>
);

function createPopulation(params) {
  const { populationSize, initialInfected, vaccinationRate, movementSpeed } = params;
  const people = [];
  const vaccinatedCount = Math.floor(populationSize * vaccinationRate);

  for (let i = 0; i < populationSize; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.5 + Math.random()) * movementSpeed;
    let status = STATUS.SUSCEPTIBLE;

    if (i < initialInfected) {
      status = STATUS.INFECTED;
    } else if (i < initialInfected + vaccinatedCount) {
      status = STATUS.RECOVERED;
    }

    people.push({
      x: 20 + Math.random() * (CANVAS_WIDTH - 40),
      y: 20 + Math.random() * (CANVAS_HEIGHT - 40),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      status,
      infectedFrame: status === STATUS.INFECTED ? 0 : -1,
      transmissions: 0,
    });
  }
  return people;
}

const EpidemicSIRVisualizer = () => {
  const [populationSize, setPopulationSize] = useState(DEFAULT_PARAMS.populationSize);
  const [initialInfected, setInitialInfected] = useState(DEFAULT_PARAMS.initialInfected);
  const [infectionRadius, setInfectionRadius] = useState(DEFAULT_PARAMS.infectionRadius);
  const [infectionProbability, setInfectionProbability] = useState(DEFAULT_PARAMS.infectionProbability);
  const [recoveryTime, setRecoveryTime] = useState(DEFAULT_PARAMS.recoveryTime);
  const [mortalityRate, setMortalityRate] = useState(DEFAULT_PARAMS.mortalityRate);
  const [vaccinationRate, setVaccinationRate] = useState(DEFAULT_PARAMS.vaccinationRate);
  const [movementSpeed, setMovementSpeed] = useState(DEFAULT_PARAMS.movementSpeed);
  const [socialDistancing, setSocialDistancing] = useState(DEFAULT_PARAMS.socialDistancing);
  const [quarantine, setQuarantine] = useState(DEFAULT_PARAMS.quarantine);

  const [isRunning, setIsRunning] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ S: 0, I: 0, R: 0, D: 0, R0: 0 });

  const canvasRef = useRef(null);
  const populationRef = useRef([]);
  const frameRef = useRef(0);
  const animationRef = useRef(null);
  const chartAccRef = useRef([]);
  const totalTransmissionsRef = useRef(0);
  const totalRecoveredAndDeadRef = useRef(0);

  useVisualizationShortcuts({ onTogglePlay: () => setIsRunning(r => !r) });

  const getParams = useCallback(() => ({
    populationSize, initialInfected, infectionRadius, infectionProbability,
    recoveryTime, mortalityRate, vaccinationRate, movementSpeed,
    socialDistancing, quarantine,
  }), [populationSize, initialInfected, infectionRadius, infectionProbability, recoveryTime, mortalityRate, vaccinationRate, movementSpeed, socialDistancing, quarantine]);

  const computeStats = useCallback((people) => {
    let S = 0, I = 0, R = 0, D = 0;
    for (const p of people) {
      if (p.status === STATUS.SUSCEPTIBLE) S++;
      else if (p.status === STATUS.INFECTED) I++;
      else if (p.status === STATUS.RECOVERED) R++;
      else if (p.status === STATUS.DECEASED) D++;
    }
    const resolved = totalRecoveredAndDeadRef.current;
    const R0 = resolved > 0 ? totalTransmissionsRef.current / resolved : 0;
    return { S, I, R, D, R0: Math.round(R0 * 100) / 100 };
  }, []);

  const resetSimulation = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRunning(false);
    frameRef.current = 0;
    totalTransmissionsRef.current = 0;
    totalRecoveredAndDeadRef.current = 0;
    const params = getParams();
    const people = createPopulation(params);
    populationRef.current = people;
    chartAccRef.current = [];
    const s = computeStats(people);
    setStats(s);
    setChartData([{ frame: 0, Susceptible: s.S, Infected: s.I, Recovered: s.R, Deceased: s.D }]);
    drawCanvas(people, params);
  }, [getParams, computeStats]);

  const drawCanvas = useCallback((people, params) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Quarantine zone
    if (params.quarantine) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.06)';
      ctx.fillRect(QUARANTINE_X, 0, CANVAS_WIDTH - QUARANTINE_X, CANVAS_HEIGHT);
      ctx.strokeStyle = '#fca5a5';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(QUARANTINE_X, 0);
      ctx.lineTo(QUARANTINE_X, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f87171';
      ctx.font = '11px sans-serif';
      ctx.fillText('Quarantine Zone', QUARANTINE_X + 8, 16);
    }

    // Draw people
    for (const p of people) {
      if (p.status === STATUS.DECEASED) {
        ctx.fillStyle = COLORS[STATUS.DECEASED];
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[p.status];
        ctx.fill();

        // Infection radius visual for infected
        if (p.status === STATUS.INFECTED) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, params.infectionRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.stroke();
        }
      }
    }

    // Border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, []);

  const tick = useCallback(() => {
    const params = getParams();
    const people = populationRef.current;
    const frame = frameRef.current;
    const speedMultiplier = params.socialDistancing ? 0.3 : 1.0;

    for (const p of people) {
      if (p.status === STATUS.DECEASED) continue;

      // Move toward quarantine if quarantine is on and infected
      if (params.quarantine && p.status === STATUS.INFECTED) {
        if (p.x < QUARANTINE_X + 20) {
          p.vx = Math.abs(p.vx) * 0.5 + 0.5;
        }
      }

      p.x += p.vx * speedMultiplier;
      p.y += p.vy * speedMultiplier;

      // Random direction change
      if (Math.random() < 0.02) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      }

      // Bounce off walls
      if (p.x < 3) { p.x = 3; p.vx = Math.abs(p.vx); }
      if (p.x > CANVAS_WIDTH - 3) { p.x = CANVAS_WIDTH - 3; p.vx = -Math.abs(p.vx); }
      if (p.y < 3) { p.y = 3; p.vy = Math.abs(p.vy); }
      if (p.y > CANVAS_HEIGHT - 3) { p.y = CANVAS_HEIGHT - 3; p.vy = -Math.abs(p.vy); }
    }

    // Infection spread — spatial grid for O(n) instead of O(n²)
    const cellSize = Math.max(params.infectionRadius, 10);
    const gridCols = Math.ceil(CANVAS_WIDTH / cellSize);
    const gridRows = Math.ceil(CANVAS_HEIGHT / cellSize);
    const grid = new Array(gridCols * gridRows);

    // Bin susceptible people into grid cells
    for (const p of people) {
      if (p.status !== STATUS.SUSCEPTIBLE) continue;
      const cx = Math.min(Math.floor(p.x / cellSize), gridCols - 1);
      const cy = Math.min(Math.floor(p.y / cellSize), gridRows - 1);
      const idx = cy * gridCols + cx;
      if (!grid[idx]) grid[idx] = [];
      grid[idx].push(p);
    }

    // For each infected person, only check nearby grid cells
    const r2 = params.infectionRadius * params.infectionRadius;
    for (const a of people) {
      if (a.status !== STATUS.INFECTED) continue;
      const cx = Math.min(Math.floor(a.x / cellSize), gridCols - 1);
      const cy = Math.min(Math.floor(a.y / cellSize), gridRows - 1);

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || nx >= gridCols || ny < 0 || ny >= gridRows) continue;
          const cell = grid[ny * gridCols + nx];
          if (!cell) continue;
          for (const b of cell) {
            const ddx = a.x - b.x;
            const ddy = a.y - b.y;
            if (ddx * ddx + ddy * ddy < r2 && Math.random() < params.infectionProbability * 0.05) {
              b.status = STATUS.INFECTED;
              b.infectedFrame = frame;
              a.transmissions++;
              totalTransmissionsRef.current++;
            }
          }
        }
      }
    }

    // Recovery / death
    for (const p of people) {
      if (p.status === STATUS.INFECTED && frame - p.infectedFrame >= params.recoveryTime) {
        if (Math.random() < params.mortalityRate) {
          p.status = STATUS.DECEASED;
        } else {
          p.status = STATUS.RECOVERED;
        }
        totalRecoveredAndDeadRef.current++;
      }
    }

    frameRef.current = frame + 1;

    const s = computeStats(people);
    setStats(s);

    // Record chart data every 5 frames (push in place, batch state update)
    if (frame % 5 === 0) {
      chartAccRef.current.push({ frame, Susceptible: s.S, Infected: s.I, Recovered: s.R, Deceased: s.D });
      // Only trigger React re-render every 20 frames to reduce chart redraws
      if (frame % 20 === 0) {
        setChartData([...chartAccRef.current]);
      }
    }

    drawCanvas(people, params);

    // Stop if no infected remain
    if (s.I === 0 && frame > 0) {
      setIsRunning(false);
      return;
    }

    animationRef.current = requestAnimationFrame(tick);
  }, [getParams, computeStats, drawCanvas]);

  useEffect(() => {
    resetSimulation();
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(tick);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isRunning, tick]);

  const applyPreset = (name) => {
    const p = PRESETS[name];
    if (!p) return;
    setPopulationSize(p.populationSize);
    setInitialInfected(p.initialInfected);
    setInfectionRadius(p.infectionRadius);
    setInfectionProbability(p.infectionProbability);
    setRecoveryTime(p.recoveryTime);
    setMortalityRate(p.mortalityRate);
    setVaccinationRate(p.vaccinationRate);
    setMovementSpeed(p.movementSpeed);
    setSocialDistancing(p.socialDistancing);
    setQuarantine(p.quarantine);
    // Reset will be triggered by user pressing Reset
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-7xl mx-auto">
      {/* Preset Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-sm font-semibold text-gray-600 self-center mr-2">Presets:</span>
        {Object.keys(PRESETS).map(name => (
          <button key={name} onClick={() => applyPreset(name)} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors">
            {name}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls Panel */}
        <div className="lg:w-64 space-y-3 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800">Parameters</h3>

          <SliderControl label="Population" min={100} max={500} step={10} value={populationSize} onChange={setPopulationSize} disabled={isRunning} />
          <SliderControl label="Initial Infected" min={1} max={20} step={1} value={initialInfected} onChange={setInitialInfected} disabled={isRunning} />
          <SliderControl label="Infection Radius" min={5} max={30} step={1} value={infectionRadius} onChange={setInfectionRadius} />
          <SliderControl label="Infection Prob." min={0.1} max={1.0} step={0.05} value={infectionProbability} onChange={setInfectionProbability} />
          <SliderControl label="Recovery Time" min={50} max={500} step={10} value={recoveryTime} onChange={setRecoveryTime} />
          <SliderControl label="Mortality Rate" min={0} max={0.3} step={0.01} value={mortalityRate} onChange={setMortalityRate} />
          <SliderControl label="Vaccination Rate" min={0} max={0.5} step={0.05} value={vaccinationRate} onChange={setVaccinationRate} disabled={isRunning} />
          <SliderControl label="Movement Speed" min={0.5} max={3.0} step={0.1} value={movementSpeed} onChange={setMovementSpeed} disabled={isRunning} />

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <ToggleControl label="Social Distancing" checked={socialDistancing} onChange={setSocialDistancing} />
            <ToggleControl label="Quarantine" checked={quarantine} onChange={setQuarantine} />
          </div>

          {/* Play / Pause / Reset */}
          <div className="flex gap-2 pt-3">
            <button onClick={() => setIsRunning(!isRunning)} className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}>
              {isRunning ? 'Pause' : 'Play'}
            </button>
            <button onClick={resetSimulation} className="flex-1 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="flex-1 space-y-4">
          {/* Real-time Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="text-sm font-medium">Susceptible: <strong>{stats.S}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="text-sm font-medium">Infected: <strong>{stats.I}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span className="text-sm font-medium">Recovered: <strong>{stats.R}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200">
              <span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span>
              <span className="text-sm font-medium">Deceased: <strong>{stats.D}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-sm font-medium">R0 Estimate: <strong>{stats.R0}</strong></span>
            </div>
          </div>

          {/* Two panels side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Population Canvas */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Population Simulation</h4>
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full border border-gray-300 rounded-lg"
                style={{ maxWidth: CANVAS_WIDTH }}
              />
            </div>

            {/* SIR Curves Chart */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">SIR Curves Over Time</h4>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800" style={{ height: CANVAS_HEIGHT }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="frame" label={{ value: 'Time (frames)', position: 'insideBottom', offset: -5, fontSize: 12 }} tick={{ fontSize: 11 }} />
                    <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft', fontSize: 12 }} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Susceptible" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Infected" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Recovered" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Deceased" stroke="#9ca3af" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      <KeyboardShortcutHint showReset={false} />
    </div>
  );
};

export default EpidemicSIRVisualizer;
