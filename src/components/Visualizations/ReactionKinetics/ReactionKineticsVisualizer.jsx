import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const R_GAS = 8.314; // J/(mol·K)
const A_FACTOR = 1e10; // Pre-exponential factor

const PRESETS = {
  fast: {
    label: 'Fast Reaction',
    temperature: 500,
    activationEnergy: 20,
    initialA: 50,
    initialB: 50,
    reactionType: 'irreversible',
    catalystActive: false,
    volume: 500,
  },
  slow: {
    label: 'Slow Reaction',
    temperature: 250,
    activationEnergy: 80,
    initialA: 50,
    initialB: 50,
    reactionType: 'irreversible',
    catalystActive: false,
    volume: 500,
  },
  equilibrium: {
    label: 'Equilibrium',
    temperature: 400,
    activationEnergy: 40,
    initialA: 60,
    initialB: 60,
    reactionType: 'reversible',
    catalystActive: false,
    volume: 500,
  },
  catalyst: {
    label: 'With Catalyst',
    temperature: 350,
    activationEnergy: 70,
    initialA: 50,
    initialB: 50,
    reactionType: 'irreversible',
    catalystActive: true,
    volume: 500,
  },
  lechatelier: {
    label: 'Le Chatelier Demo',
    temperature: 380,
    activationEnergy: 35,
    initialA: 70,
    initialB: 70,
    reactionType: 'reversible',
    catalystActive: false,
    volume: 400,
  },
};

const PARTICLE_RADIUS = 5;
const COLLISION_DISTANCE = 12;
const FLASH_DURATION = 15;
const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 380;

const arrheniusRate = (Ea, T) => {
  return A_FACTOR * Math.exp((-Ea * 1000) / (R_GAS * T));
};

const createParticle = (type, canvasW, canvasH) => ({
  x: PARTICLE_RADIUS + Math.random() * (canvasW - 2 * PARTICLE_RADIUS),
  y: PARTICLE_RADIUS + Math.random() * (canvasH - 2 * PARTICLE_RADIUS),
  vx: (Math.random() - 0.5) * 3,
  vy: (Math.random() - 0.5) * 3,
  type,
  flash: 0,
});

const COLORS = { A: '#ef4444', B: '#3b82f6', C: '#22c55e', D: '#eab308' };
const COLOR_LABELS = { A: 'Reactant A (red)', B: 'Reactant B (blue)', C: 'Product C (green)', D: 'Product D (yellow)' };

const SliderControl = ({ label, min, max, step, value, onChange, unit = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}: {value}{unit}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full"
    />
  </div>
);

const EnergyDiagram = ({ activationEnergy, catalystActive, reactionType }) => {
  const w = 280;
  const h = 160;
  const pad = 30;
  const catalystEa = activationEnergy * 0.4;
  const reactantY = h - pad - 30;
  const productY = reactionType === 'reversible' ? reactantY - 10 : reactantY + 15;
  const peakY_no_cat = reactantY - (activationEnergy / 100) * (reactantY - pad - 10);
  const peakY_cat = reactantY - (catalystEa / 100) * (reactantY - pad - 10);
  const midX = w / 2;

  return (
    <svg width={w} height={h} className="bg-white rounded border border-gray-200">
      <text x={w / 2} y={14} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151">
        Energy Diagram
      </text>
      {/* Reactants level */}
      <line x1={pad} y1={reactantY} x2={midX - 40} y2={reactantY} stroke="#ef4444" strokeWidth={2} />
      <text x={pad + 5} y={reactantY - 6} fontSize="9" fill="#ef4444">A + B</text>
      {/* Products level */}
      <line x1={midX + 40} y1={productY} x2={w - pad} y2={productY} stroke="#22c55e" strokeWidth={2} />
      <text x={w - pad - 30} y={productY - 6} fontSize="9" fill="#22c55e">
        {reactionType === 'reversible' ? 'C + D' : 'C'}
      </text>
      {/* Without catalyst curve */}
      <path
        d={`M ${midX - 40} ${reactantY} Q ${midX} ${peakY_no_cat} ${midX + 40} ${productY}`}
        fill="none"
        stroke="#6b7280"
        strokeWidth={1.5}
        strokeDasharray="4 2"
      />
      <text x={midX + 2} y={peakY_no_cat - 4} textAnchor="middle" fontSize="8" fill="#6b7280">
        Ea = {activationEnergy} kJ/mol
      </text>
      {/* With catalyst curve */}
      {catalystActive && (
        <>
          <path
            d={`M ${midX - 40} ${reactantY} Q ${midX} ${peakY_cat} ${midX + 40} ${productY}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={1.5}
          />
          <text x={midX + 2} y={peakY_cat - 4} textAnchor="middle" fontSize="8" fill="#f59e0b">
            Ea(cat) = {catalystEa.toFixed(0)} kJ/mol
          </text>
        </>
      )}
      {/* Axis */}
      <line x1={pad - 5} y1={h - pad + 10} x2={w - pad + 5} y2={h - pad + 10} stroke="#9ca3af" strokeWidth={1} />
      <text x={w / 2} y={h - 8} textAnchor="middle" fontSize="9" fill="#6b7280">Reaction Progress</text>
      <text x={12} y={h / 2} textAnchor="middle" fontSize="9" fill="#6b7280" transform={`rotate(-90, 12, ${h / 2})`}>
        Energy
      </text>
    </svg>
  );
};

const ReactionKineticsVisualizer = () => {
  const [temperature, setTemperature] = useState(400);
  const [activationEnergy, setActivationEnergy] = useState(40);
  const [initialA, setInitialA] = useState(50);
  const [initialB, setInitialB] = useState(50);
  const [reactionType, setReactionType] = useState('reversible');
  const [catalystActive, setCatalystActive] = useState(false);
  const [volume, setVolume] = useState(500);
  const [running, setRunning] = useState(false);
  const [concentrationData, setConcentrationData] = useState([]);

  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  const tickRef = useRef(0);
  const runningRef = useRef(false);

  const effectiveEa = catalystActive ? activationEnergy * 0.4 : activationEnergy;
  const kForward = arrheniusRate(effectiveEa, temperature);
  const kReverse = reactionType === 'reversible' ? arrheniusRate(effectiveEa + 15, temperature) : 0;

  const scaleFactor = volume / 500;
  const canvasW = Math.max(300, Math.round(CANVAS_WIDTH * Math.sqrt(scaleFactor)));
  const canvasH = Math.max(200, Math.round(CANVAS_HEIGHT * Math.sqrt(scaleFactor)));

  const countParticles = useCallback(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    particlesRef.current.forEach((p) => { counts[p.type]++; });
    return counts;
  }, []);

  const reactionProbability = useCallback((k) => {
    const volumeFactor = 500 / volume;
    return Math.min(1, k * 1e-8 * volumeFactor);
  }, [volume]);

  const initParticles = useCallback(() => {
    const particles = [];
    for (let i = 0; i < initialA; i++) particles.push(createParticle('A', canvasW, canvasH));
    for (let i = 0; i < initialB; i++) particles.push(createParticle('B', canvasW, canvasH));
    particlesRef.current = particles;
    tickRef.current = 0;
    setConcentrationData([]);
  }, [initialA, initialB, canvasW, canvasH]);

  const handleReset = useCallback(() => {
    setRunning(false);
    runningRef.current = false;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    initParticles();
  }, [initParticles]);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  const speedScale = useCallback(() => {
    return 0.5 + (temperature - 200) / 400 * 2.5;
  }, [temperature]);

  const animate = useCallback(() => {
    if (!runningRef.current) return;

    const particles = particlesRef.current;
    const speed = speedScale();

    // Move particles
    for (const p of particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      // Bounce off walls
      if (p.x <= PARTICLE_RADIUS) { p.x = PARTICLE_RADIUS; p.vx = Math.abs(p.vx); }
      if (p.x >= canvasW - PARTICLE_RADIUS) { p.x = canvasW - PARTICLE_RADIUS; p.vx = -Math.abs(p.vx); }
      if (p.y <= PARTICLE_RADIUS) { p.y = PARTICLE_RADIUS; p.vy = Math.abs(p.vy); }
      if (p.y >= canvasH - PARTICLE_RADIUS) { p.y = canvasH - PARTICLE_RADIUS; p.vy = -Math.abs(p.vy); }

      // Random perturbation
      p.vx += (Math.random() - 0.5) * 0.3;
      p.vy += (Math.random() - 0.5) * 0.3;
      const maxV = 3 * speed;
      const mag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (mag > maxV) { p.vx = (p.vx / mag) * maxV; p.vy = (p.vy / mag) * maxV; }

      if (p.flash > 0) p.flash--;
    }

    // Forward reactions: A + B -> C (+ D)
    const probF = reactionProbability(arrheniusRate(effectiveEa, temperature));
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        if ((a.type === 'A' && b.type === 'B') || (a.type === 'B' && b.type === 'A')) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (dx * dx + dy * dy < COLLISION_DISTANCE * COLLISION_DISTANCE) {
            if (Math.random() < probF) {
              const reactantA = a.type === 'A' ? a : b;
              const reactantB = a.type === 'B' ? a : b;
              reactantA.type = 'C';
              reactantA.flash = FLASH_DURATION;
              reactantA.vx = (Math.random() - 0.5) * 2;
              reactantA.vy = (Math.random() - 0.5) * 2;
              if (reactionType === 'reversible') {
                reactantB.type = 'D';
                reactantB.flash = FLASH_DURATION;
                reactantB.vx = (Math.random() - 0.5) * 2;
                reactantB.vy = (Math.random() - 0.5) * 2;
              } else {
                // Remove B particle for irreversible A+B->C
                particles.splice(particles.indexOf(reactantB), 1);
              }
              break;
            }
          }
        }
      }
    }

    // Reverse reactions: C + D -> A + B (only reversible)
    if (reactionType === 'reversible') {
      const probR = reactionProbability(arrheniusRate(effectiveEa + 15, temperature));
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          if ((a.type === 'C' && b.type === 'D') || (a.type === 'D' && b.type === 'C')) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            if (dx * dx + dy * dy < COLLISION_DISTANCE * COLLISION_DISTANCE) {
              if (Math.random() < probR) {
                const productC = a.type === 'C' ? a : b;
                const productD = a.type === 'D' ? a : b;
                productC.type = 'A';
                productC.flash = FLASH_DURATION;
                productD.type = 'B';
                productD.flash = FLASH_DURATION;
                break;
              }
            }
          }
        }
      }
    }

    // Draw
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvasW, canvasH);

      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvasW, canvasH);

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[p.type];
        ctx.fill();

        if (p.flash > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, PARTICLE_RADIUS + 4 + (p.flash / FLASH_DURATION) * 6, 0, Math.PI * 2);
          ctx.strokeStyle = COLORS[p.type];
          ctx.globalAlpha = p.flash / FLASH_DURATION * 0.6;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Record data periodically
    tickRef.current++;
    if (tickRef.current % 5 === 0) {
      const counts = countParticles();
      const total = Math.max(1, counts.A + counts.B + counts.C + counts.D);
      setConcentrationData((prev) => {
        const newPoint = {
          time: (tickRef.current / 5).toFixed(0),
          A: counts.A,
          B: counts.B,
          C: counts.C,
          D: reactionType === 'reversible' ? counts.D : undefined,
        };
        const next = [...prev, newPoint];
        if (next.length > 200) return next.slice(-200);
        return next;
      });
    }

    frameRef.current = requestAnimationFrame(animate);
  }, [canvasW, canvasH, effectiveEa, temperature, reactionType, reactionProbability, speedScale, countParticles]);

  useEffect(() => {
    runningRef.current = running;
    if (running) {
      frameRef.current = requestAnimationFrame(animate);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [running, animate]);

  // Draw initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasW, canvasH);
    for (const p of particlesRef.current) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[p.type];
      ctx.fill();
    }
  }, [canvasW, canvasH, initialA, initialB]);

  const loadPreset = (key) => {
    const p = PRESETS[key];
    setRunning(false);
    runningRef.current = false;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setTemperature(p.temperature);
    setActivationEnergy(p.activationEnergy);
    setInitialA(p.initialA);
    setInitialB(p.initialB);
    setReactionType(p.reactionType);
    setCatalystActive(p.catalystActive);
    setVolume(p.volume);
  };

  const counts = countParticles();
  const totalParticles = counts.A + counts.B + counts.C + counts.D;
  const concA = totalParticles > 0 ? counts.A / totalParticles : 0;
  const concB = totalParticles > 0 ? counts.B / totalParticles : 0;
  const concC = totalParticles > 0 ? counts.C / totalParticles : 0;
  const concD = totalParticles > 0 ? counts.D / totalParticles : 0;

  const equilibriumK =
    reactionType === 'reversible' && counts.A > 0 && counts.B > 0
      ? ((counts.C * counts.D) / (counts.A * counts.B)).toFixed(3)
      : '--';

  const isNearEquilibrium =
    reactionType === 'reversible' &&
    concentrationData.length > 20 &&
    (() => {
      const recent = concentrationData.slice(-10);
      const aVals = recent.map((d) => d.A);
      const range = Math.max(...aVals) - Math.min(...aVals);
      return range <= 2;
    })();

  const currentRate = (arrheniusRate(effectiveEa, temperature) * 1e-8).toExponential(2);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-7xl mx-auto">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Controls</h3>

          <SliderControl
            label="Temperature"
            min={200}
            max={600}
            step={10}
            value={temperature}
            onChange={setTemperature}
            unit=" K"
          />
          <SliderControl
            label="Activation Energy (Ea)"
            min={10}
            max={100}
            step={5}
            value={activationEnergy}
            onChange={setActivationEnergy}
            unit=" kJ/mol"
          />
          <SliderControl
            label="Initial [A]"
            min={10}
            max={100}
            step={5}
            value={initialA}
            onChange={setInitialA}
            unit=" particles"
          />
          <SliderControl
            label="Initial [B]"
            min={10}
            max={100}
            step={5}
            value={initialB}
            onChange={setInitialB}
            unit=" particles"
          />
          <SliderControl
            label="Volume"
            min={200}
            max={800}
            step={50}
            value={volume}
            onChange={setVolume}
            unit=" (arb.)"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reaction Type</label>
            <select
              value={reactionType}
              onChange={(e) => setReactionType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="irreversible">A + B &rarr; C (Irreversible)</option>
              <option value="reversible">A + B &#8652; C + D (Reversible)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="catalyst"
              checked={catalystActive}
              onChange={(e) => setCatalystActive(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <label htmlFor="catalyst" className="text-sm font-medium text-gray-700">
              Catalyst (lowers Ea by 60%)
            </label>
          </div>

          {/* Play / Pause / Reset */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setRunning(!running)}
              className={`flex-1 px-4 py-2 rounded-md text-white font-medium transition-colors ${
                running ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {running ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 rounded-md bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Energy Diagram */}
          <div className="pt-2">
            <EnergyDiagram
              activationEnergy={activationEnergy}
              catalystActive={catalystActive}
              reactionType={reactionType}
            />
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['A', 'B', 'C', ...(reactionType === 'reversible' ? ['D'] : [])].map((species) => (
              <div
                key={species}
                className="bg-gray-50 rounded-lg p-3 text-center border"
                style={{ borderColor: COLORS[species] }}
              >
                <div className="text-xs text-gray-500 uppercase font-medium">{species}</div>
                <div className="text-2xl font-bold" style={{ color: COLORS[species] }}>
                  {counts[species]}
                </div>
              </div>
            ))}
          </div>

          {/* Rate and Equilibrium Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Rate constant: <strong>{currentRate}</strong>
            </span>
            {reactionType === 'reversible' && (
              <>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  K<sub>eq</sub> = <strong>{equilibriumK}</strong>
                </span>
                <span
                  className={`px-3 py-1 rounded-full ${
                    isNearEquilibrium ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {isNearEquilibrium ? 'Near Equilibrium' : 'Approaching Equilibrium'}
                </span>
              </>
            )}
          </div>

          {/* Particle Canvas */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Particle Simulation</h4>
            <canvas
              ref={canvasRef}
              width={canvasW}
              height={canvasH}
              className="w-full rounded-lg border border-gray-200"
              style={{ maxWidth: canvasW, aspectRatio: `${canvasW}/${canvasH}` }}
            />
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              {Object.entries(COLOR_LABELS).map(([key, label]) => {
                if (key === 'D' && reactionType !== 'reversible') return null;
                return (
                  <span key={key} className="flex items-center gap-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[key] }}
                    />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Concentration Chart */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Concentration Over Time</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={concentrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  label={{ value: 'Time (ticks)', position: 'insideBottomRight', offset: -5 }}
                  fontSize={11}
                />
                <YAxis
                  label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                  fontSize={11}
                />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="A" stroke={COLORS.A} dot={false} strokeWidth={2} name="[A]" />
                <Line type="monotone" dataKey="B" stroke={COLORS.B} dot={false} strokeWidth={2} name="[B]" />
                <Line type="monotone" dataKey="C" stroke={COLORS.C} dot={false} strokeWidth={2} name="[C]" />
                {reactionType === 'reversible' && (
                  <Line type="monotone" dataKey="D" stroke={COLORS.D} dot={false} strokeWidth={2} name="[D]" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Le Chatelier Hint */}
      {reactionType === 'reversible' && running && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>Le Chatelier&apos;s Principle:</strong> Try changing the temperature, volume, or adding a catalyst
          while the simulation is running. Watch how the system shifts to re-establish equilibrium.
        </div>
      )}
    </div>
  );
};

export default ReactionKineticsVisualizer;
