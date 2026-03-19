import React, { useState, useRef, useEffect, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 450;
const GRAPH_WIDTH = 600;
const GRAPH_HEIGHT = 450;
const PHASE_WIDTH = 350;
const PHASE_HEIGHT = 300;

const PRESETS = {
  'Stable Oscillation': { preyBirthRate: 0.03, predatorDeathRate: 0.02, predationRate: 0.6, predatorReproRate: 0.4, initialPrey: 120, initialPredators: 30 },
  'Predator Extinction': { preyBirthRate: 0.02, predatorDeathRate: 0.05, predationRate: 0.3, predatorReproRate: 0.2, initialPrey: 80, initialPredators: 50 },
  'Prey Explosion': { preyBirthRate: 0.06, predatorDeathRate: 0.04, predationRate: 0.2, predatorReproRate: 0.15, initialPrey: 150, initialPredators: 10 },
  'Balanced Ecosystem': { preyBirthRate: 0.035, predatorDeathRate: 0.025, predationRate: 0.5, predatorReproRate: 0.35, initialPrey: 100, initialPredators: 25 },
};

const DEFAULT_PARAMS = PRESETS['Stable Oscillation'];

const SliderControl = ({ label, min, max, step, value, onChange, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}: <span className="font-semibold">{typeof value === 'number' ? (Number.isInteger(step) ? value : value.toFixed(3)) : value}</span>
    </label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} disabled={disabled} className="w-full disabled:opacity-50" />
  </div>
);

function createAgent(type, x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = type === 'prey' ? 0.8 + Math.random() * 0.6 : 1.0 + Math.random() * 0.8;
  return {
    type,
    x: x !== undefined ? x : 10 + Math.random() * (CANVAS_WIDTH - 20),
    y: y !== undefined ? y : 10 + Math.random() * (CANVAS_HEIGHT - 20),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    energy: type === 'predator' ? 80 + Math.random() * 40 : 0,
    reproTimer: Math.random() * 60,
  };
}

function createPopulation(params) {
  const agents = [];
  for (let i = 0; i < params.initialPrey; i++) {
    agents.push(createAgent('prey'));
  }
  for (let i = 0; i < params.initialPredators; i++) {
    agents.push(createAgent('predator'));
  }
  return agents;
}

const PredatorPreyVisualizer = () => {
  const [preyBirthRate, setPreyBirthRate] = useState(DEFAULT_PARAMS.preyBirthRate);
  const [predatorDeathRate, setPredatorDeathRate] = useState(DEFAULT_PARAMS.predatorDeathRate);
  const [predationRate, setPredationRate] = useState(DEFAULT_PARAMS.predationRate);
  const [predatorReproRate, setPredatorReproRate] = useState(DEFAULT_PARAMS.predatorReproRate);
  const [initialPrey, setInitialPrey] = useState(DEFAULT_PARAMS.initialPrey);
  const [initialPredators, setInitialPredators] = useState(DEFAULT_PARAMS.initialPredators);
  const [speed, setSpeed] = useState(1);
  const [showPhase, setShowPhase] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ prey: 0, predators: 0 });

  const agentCanvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const phaseCanvasRef = useRef(null);
  const agentsRef = useRef([]);
  const frameRef = useRef(0);
  const animationRef = useRef(null);
  const historyRef = useRef([]);
  const maxPopRef = useRef(200);

  const getParams = useCallback(() => ({
    preyBirthRate, predatorDeathRate, predationRate, predatorReproRate,
    initialPrey, initialPredators,
  }), [preyBirthRate, predatorDeathRate, predationRate, predatorReproRate, initialPrey, initialPredators]);

  const drawAgentCanvas = useCallback((agents) => {
    const canvas = agentCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background - natural terrain
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle grass texture dots
    ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
    for (let i = 0; i < 60; i++) {
      const gx = (i * 97) % CANVAS_WIDTH;
      const gy = (i * 131) % CANVAS_HEIGHT;
      ctx.beginPath();
      ctx.arc(gx, gy, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw prey (green dots)
    for (const a of agents) {
      if (a.type === 'prey') {
        ctx.beginPath();
        ctx.arc(a.x, a.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#16a34a';
        ctx.fill();
      }
    }

    // Draw predators (red dots, slightly larger)
    for (const a of agents) {
      if (a.type === 'predator') {
        ctx.beginPath();
        ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        // Slight glow for hunting range
        ctx.beginPath();
        ctx.arc(a.x, a.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.1)';
        ctx.stroke();
      }
    }

    // Border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Legend
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(15, CANVAS_HEIGHT - 15, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.font = '11px sans-serif';
    ctx.fillText('Prey (Rabbits)', 24, CANVAS_HEIGHT - 11);

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(130, CANVAS_HEIGHT - 15, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.fillText('Predators (Wolves)', 139, CANVAS_HEIGHT - 11);
  }, []);

  const drawGraphCanvas = useCallback((history) => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, GRAPH_WIDTH, GRAPH_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, GRAPH_WIDTH, GRAPH_HEIGHT);

    const marginLeft = 50;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 35;
    const plotW = GRAPH_WIDTH - marginLeft - marginRight;
    const plotH = GRAPH_HEIGHT - marginTop - marginBottom;

    // Grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = marginTop + (plotH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + plotW, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft, marginTop + plotH);
    ctx.lineTo(marginLeft + plotW, marginTop + plotH);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time', marginLeft + plotW / 2, GRAPH_HEIGHT - 5);
    ctx.save();
    ctx.translate(12, marginTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Population', 0, 0);
    ctx.restore();

    if (history.length < 2) {
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, GRAPH_WIDTH, GRAPH_HEIGHT);
      return;
    }

    // Update max population for scaling
    let maxP = 50;
    for (const h of history) {
      if (h.prey > maxP) maxP = h.prey;
      if (h.predators > maxP) maxP = h.predators;
    }
    maxPopRef.current = Math.max(maxPopRef.current, maxP);
    const maxVal = maxPopRef.current * 1.1;

    // Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const val = Math.round((maxVal / 5) * (5 - i));
      const y = marginTop + (plotH / 5) * i;
      ctx.fillText(val, marginLeft - 5, y + 3);
    }

    const visiblePoints = Math.min(history.length, 600);
    const startIdx = Math.max(0, history.length - visiblePoints);
    const pointSpacing = plotW / Math.max(visiblePoints - 1, 1);

    // Draw prey line (green)
    ctx.beginPath();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    for (let i = 0; i < visiblePoints; i++) {
      const h = history[startIdx + i];
      const x = marginLeft + i * pointSpacing;
      const y = marginTop + plotH - (h.prey / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw predator line (red)
    ctx.beginPath();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    for (let i = 0; i < visiblePoints; i++) {
      const h = history[startIdx + i];
      const x = marginLeft + i * pointSpacing;
      const y = marginTop + plotH - (h.predators / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(marginLeft + 10, marginTop + 5, 12, 3);
    ctx.fillStyle = '#374151';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Prey', marginLeft + 26, marginTop + 10);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(marginLeft + 70, marginTop + 5, 12, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText('Predators', marginLeft + 86, marginTop + 10);

    // Border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, GRAPH_WIDTH, GRAPH_HEIGHT);
  }, []);

  const drawPhaseCanvas = useCallback((history) => {
    const canvas = phaseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, PHASE_WIDTH, PHASE_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PHASE_WIDTH, PHASE_HEIGHT);

    const marginLeft = 50;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 40;
    const plotW = PHASE_WIDTH - marginLeft - marginRight;
    const plotH = PHASE_HEIGHT - marginTop - marginBottom;

    // Axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft, marginTop + plotH);
    ctx.lineTo(marginLeft + plotW, marginTop + plotH);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Prey Population', marginLeft + plotW / 2, PHASE_HEIGHT - 5);
    ctx.save();
    ctx.translate(12, marginTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Predator Population', 0, 0);
    ctx.restore();

    if (history.length < 2) {
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, PHASE_WIDTH, PHASE_HEIGHT);
      return;
    }

    let maxPrey = 50, maxPred = 50;
    for (const h of history) {
      if (h.prey > maxPrey) maxPrey = h.prey;
      if (h.predators > maxPred) maxPred = h.predators;
    }
    maxPrey *= 1.1;
    maxPred *= 1.1;

    // Grid
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = marginTop + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + plotW, y);
      ctx.stroke();
      const x = marginLeft + (plotW / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + plotH);
      ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxPred / 4) * (4 - i));
      const y = marginTop + (plotH / 4) * i;
      ctx.fillText(val, marginLeft - 5, y + 3);
    }
    // X-axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxPrey / 4) * i);
      const x = marginLeft + (plotW / 4) * i;
      ctx.fillText(val, x, marginTop + plotH + 14);
    }

    // Draw phase trajectory with fading color
    const totalPts = history.length;
    const startIdx = Math.max(0, totalPts - 800);
    const pts = totalPts - startIdx;

    for (let i = 1; i < pts; i++) {
      const h0 = history[startIdx + i - 1];
      const h1 = history[startIdx + i];
      const alpha = 0.15 + 0.85 * (i / pts);
      const x0 = marginLeft + (h0.prey / maxPrey) * plotW;
      const y0 = marginTop + plotH - (h0.predators / maxPred) * plotH;
      const x1 = marginLeft + (h1.prey / maxPrey) * plotW;
      const y1 = marginTop + plotH - (h1.predators / maxPred) * plotH;

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Current point
    if (totalPts > 0) {
      const last = history[totalPts - 1];
      const cx = marginLeft + (last.prey / maxPrey) * plotW;
      const cy = marginTop + plotH - (last.predators / maxPred) * plotH;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#7c3aed';
      ctx.fill();
    }

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, PHASE_WIDTH, PHASE_HEIGHT);
  }, []);

  const resetSimulation = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRunning(false);
    frameRef.current = 0;
    maxPopRef.current = 200;
    const params = getParams();
    const agents = createPopulation(params);
    agentsRef.current = agents;
    const preyCount = agents.filter(a => a.type === 'prey').length;
    const predCount = agents.filter(a => a.type === 'predator').length;
    historyRef.current = [{ prey: preyCount, predators: predCount }];
    setStats({ prey: preyCount, predators: predCount });
    drawAgentCanvas(agents);
    drawGraphCanvas(historyRef.current);
    if (showPhase) drawPhaseCanvas(historyRef.current);
  }, [getParams, drawAgentCanvas, drawGraphCanvas, drawPhaseCanvas, showPhase]);

  const tick = useCallback(() => {
    const params = getParams();
    let agents = agentsRef.current;
    const stepsPerFrame = speed;

    for (let step = 0; step < stepsPerFrame; step++) {
      const newAgents = [];

      // Move all agents
      for (const a of agents) {
        // Random direction change
        if (Math.random() < 0.03) {
          const angle = Math.random() * Math.PI * 2;
          const spd = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
          a.vx = Math.cos(angle) * spd;
          a.vy = Math.sin(angle) * spd;
        }

        if (a.type === 'predator') {
          // Predators chase nearest prey
          let nearestPrey = null;
          let nearestDist = 80; // detection range
          for (const b of agents) {
            if (b.type !== 'prey') continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearestPrey = b;
            }
          }
          if (nearestPrey) {
            const dx = nearestPrey.x - a.x;
            const dy = nearestPrey.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              a.vx += (dx / dist) * 0.3;
              a.vy += (dy / dist) * 0.3;
              // Clamp speed
              const spd = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
              if (spd > 2.0) {
                a.vx = (a.vx / spd) * 2.0;
                a.vy = (a.vy / spd) * 2.0;
              }
            }
          }
        }

        a.x += a.vx;
        a.y += a.vy;

        // Bounce off walls
        if (a.x < 5) { a.x = 5; a.vx = Math.abs(a.vx); }
        if (a.x > CANVAS_WIDTH - 5) { a.x = CANVAS_WIDTH - 5; a.vx = -Math.abs(a.vx); }
        if (a.y < 5) { a.y = 5; a.vy = Math.abs(a.vy); }
        if (a.y > CANVAS_HEIGHT - 5) { a.y = CANVAS_HEIGHT - 5; a.vy = -Math.abs(a.vy); }
      }

      // Predation: predators eat nearby prey
      const preyEaten = new Set();
      for (const a of agents) {
        if (a.type !== 'predator') continue;
        for (let i = 0; i < agents.length; i++) {
          const b = agents[i];
          if (b.type !== 'prey' || preyEaten.has(i)) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 10 && Math.random() < params.predationRate * 0.1) {
            preyEaten.add(i);
            a.energy += 50;
            break; // one prey per tick per predator
          }
        }
      }

      // Build next generation
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];

        if (a.type === 'prey') {
          if (preyEaten.has(i)) continue; // eaten

          // Prey reproduction
          a.reproTimer++;
          if (a.reproTimer > 30 && Math.random() < params.preyBirthRate) {
            a.reproTimer = 0;
            // Cap prey population to prevent performance issues
            const currentPrey = agents.filter(ag => ag.type === 'prey').length - preyEaten.size + newAgents.filter(ag => ag.type === 'prey').length;
            if (currentPrey < 500) {
              newAgents.push(createAgent('prey', a.x + (Math.random() - 0.5) * 20, a.y + (Math.random() - 0.5) * 20));
            }
          }
        } else {
          // Predator energy drain
          a.energy -= params.predatorDeathRate * 2;

          // Predator death
          if (a.energy <= 0) continue; // dies

          // Predator reproduction
          a.reproTimer++;
          if (a.energy > 100 && a.reproTimer > 50 && Math.random() < params.predatorReproRate * 0.02) {
            a.reproTimer = 0;
            a.energy *= 0.5;
            const currentPred = agents.filter(ag => ag.type === 'predator').length + newAgents.filter(ag => ag.type === 'predator').length;
            if (currentPred < 200) {
              const child = createAgent('predator', a.x + (Math.random() - 0.5) * 20, a.y + (Math.random() - 0.5) * 20);
              child.energy = a.energy * 0.5;
              newAgents.push(child);
            }
          }
        }
      }

      // Surviving agents + new births
      const survivors = agents.filter((a, i) => {
        if (a.type === 'prey' && preyEaten.has(i)) return false;
        if (a.type === 'predator' && a.energy <= 0) return false;
        return true;
      });

      agents = [...survivors, ...newAgents];
    }

    agentsRef.current = agents;
    frameRef.current++;

    const preyCount = agents.filter(a => a.type === 'prey').length;
    const predCount = agents.filter(a => a.type === 'predator').length;
    setStats({ prey: preyCount, predators: predCount });

    // Record history every 3 frames
    if (frameRef.current % 3 === 0) {
      historyRef.current = [...historyRef.current, { prey: preyCount, predators: predCount }];
      // Keep last 1000 points for graph
      if (historyRef.current.length > 1000) {
        historyRef.current = historyRef.current.slice(-800);
      }
    }

    drawAgentCanvas(agents);
    drawGraphCanvas(historyRef.current);
    if (showPhase) drawPhaseCanvas(historyRef.current);

    // Stop if either population is fully gone for a while
    if ((preyCount === 0 || predCount === 0) && frameRef.current > 60) {
      // Let it run a bit more so graphs look complete, then stop
      if (preyCount === 0 && predCount === 0) {
        setIsRunning(false);
        return;
      }
    }

    animationRef.current = requestAnimationFrame(tick);
  }, [getParams, speed, showPhase, drawAgentCanvas, drawGraphCanvas, drawPhaseCanvas]);

  useEffect(() => {
    resetSimulation();
    // Auto-start after initialization
    setIsRunning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(tick);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isRunning, tick]);

  // Redraw phase portrait when toggled on
  useEffect(() => {
    if (showPhase && historyRef.current.length > 0) {
      drawPhaseCanvas(historyRef.current);
    }
  }, [showPhase, drawPhaseCanvas]);

  const applyPreset = (name) => {
    const p = PRESETS[name];
    if (!p) return;
    setPreyBirthRate(p.preyBirthRate);
    setPredatorDeathRate(p.predatorDeathRate);
    setPredationRate(p.predationRate);
    setPredatorReproRate(p.predatorReproRate);
    setInitialPrey(p.initialPrey);
    setInitialPredators(p.initialPredators);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-7xl mx-auto">
      {/* Preset Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-sm font-semibold text-gray-600 self-center mr-2">Presets:</span>
        {Object.keys(PRESETS).map(name => (
          <button key={name} onClick={() => applyPreset(name)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors">
            {name}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls Panel */}
        <div className="lg:w-64 space-y-3 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800">Parameters</h3>

          <SliderControl label="Initial Prey" min={20} max={200} step={10} value={initialPrey} onChange={setInitialPrey} disabled={isRunning} />
          <SliderControl label="Initial Predators" min={5} max={80} step={5} value={initialPredators} onChange={setInitialPredators} disabled={isRunning} />
          <SliderControl label="Prey Birth Rate" min={0.005} max={0.08} step={0.005} value={preyBirthRate} onChange={setPreyBirthRate} />
          <SliderControl label="Predator Death Rate" min={0.005} max={0.08} step={0.005} value={predatorDeathRate} onChange={setPredatorDeathRate} />
          <SliderControl label="Predation Rate" min={0.1} max={1.0} step={0.05} value={predationRate} onChange={setPredationRate} />
          <SliderControl label="Predator Repro. Rate" min={0.05} max={0.8} step={0.05} value={predatorReproRate} onChange={setPredatorReproRate} />
          <SliderControl label="Simulation Speed" min={1} max={5} step={1} value={speed} onChange={setSpeed} />

          <div className="pt-2 border-t border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={showPhase} onChange={e => setShowPhase(e.target.checked)} className="w-4 h-4" />
              Show Phase Portrait
            </label>
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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span>
              <span className="text-sm font-medium">Prey (Rabbits): <strong>{stats.prey}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
              <span className="text-sm font-medium">Predators (Wolves): <strong>{stats.predators}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium">Total: <strong>{stats.prey + stats.predators}</strong></span>
            </div>
          </div>

          {/* Agent-based Canvas + Population Graph */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Ecosystem View</h4>
              <canvas
                ref={agentCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full border border-gray-300 rounded-lg"
                style={{ maxWidth: CANVAS_WIDTH }}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Population Over Time</h4>
              <canvas
                ref={graphCanvasRef}
                width={GRAPH_WIDTH}
                height={GRAPH_HEIGHT}
                className="w-full border border-gray-300 rounded-lg"
                style={{ maxWidth: GRAPH_WIDTH }}
              />
              {showPhase && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Phase Portrait (Prey vs Predator)</h4>
                  <canvas
                    ref={phaseCanvasRef}
                    width={PHASE_WIDTH}
                    height={PHASE_HEIGHT}
                    className="w-full border border-gray-300 rounded-lg"
                    style={{ maxWidth: PHASE_WIDTH }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredatorPreyVisualizer;
