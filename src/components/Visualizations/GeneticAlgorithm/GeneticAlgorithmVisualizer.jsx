import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';

// ── Helper utilities ──────────────────────────────────────────────────────────

const lerp = (a, b, t) => a + (b - a) * t;

const fitnessColor = (fitness) => {
  // 0 = red, 1 = green
  const r = Math.round(lerp(220, 30, fitness));
  const g = Math.round(lerp(50, 200, fitness));
  const b = Math.round(lerp(50, 80, fitness));
  return `rgb(${r},${g},${b})`;
};

// ── DNA class ─────────────────────────────────────────────────────────────────

const LIFESPAN = 300; // number of movement steps per generation

class DNA {
  constructor(genes) {
    if (genes) {
      this.genes = genes;
    } else {
      this.genes = [];
      for (let i = 0; i < LIFESPAN; i++) {
        const angle = Math.random() * Math.PI * 2;
        const mag = 0.3 + Math.random() * 0.5;
        this.genes.push({ x: Math.cos(angle) * mag, y: Math.sin(angle) * mag });
      }
    }
  }

  crossover(partner) {
    const newGenes = [];
    const mid = Math.floor(Math.random() * this.genes.length);
    for (let i = 0; i < this.genes.length; i++) {
      newGenes.push(i < mid ? this.genes[i] : partner.genes[i]);
    }
    return new DNA(newGenes);
  }

  mutate(rate) {
    for (let i = 0; i < this.genes.length; i++) {
      if (Math.random() < rate) {
        const angle = Math.random() * Math.PI * 2;
        const mag = 0.3 + Math.random() * 0.5;
        this.genes[i] = { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
      }
    }
  }
}

// ── Dot class ─────────────────────────────────────────────────────────────────

class Dot {
  constructor(startX, startY, dna) {
    this.pos = { x: startX, y: startY };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.dna = dna || new DNA();
    this.fitness = 0;
    this.dead = false;
    this.reachedTarget = false;
    this.stepsToTarget = LIFESPAN;
  }

  applyForce(force) {
    this.acc.x += force.x;
    this.acc.y += force.y;
  }

  update(step, obstacles, target, canvasW, canvasH) {
    if (this.dead || this.reachedTarget) return;

    // Check target reached
    const dx = this.pos.x - target.x;
    const dy = this.pos.y - target.y;
    if (Math.sqrt(dx * dx + dy * dy) < target.r) {
      this.reachedTarget = true;
      this.stepsToTarget = step;
      return;
    }

    // Check wall collision
    if (this.pos.x < 4 || this.pos.x > canvasW - 4 || this.pos.y < 4 || this.pos.y > canvasH - 4) {
      this.dead = true;
      return;
    }

    // Check obstacle collision
    for (const obs of obstacles) {
      if (
        this.pos.x > obs.x &&
        this.pos.x < obs.x + obs.w &&
        this.pos.y > obs.y &&
        this.pos.y < obs.y + obs.h
      ) {
        this.dead = true;
        return;
      }
    }

    if (step < this.dna.genes.length) {
      this.applyForce(this.dna.genes[step]);
    }

    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    // Clamp velocity
    const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
    if (speed > 4) {
      this.vel.x = (this.vel.x / speed) * 4;
      this.vel.y = (this.vel.y / speed) * 4;
    }
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  calcFitness(target) {
    const dx = this.pos.x - target.x;
    const dy = this.pos.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (this.reachedTarget) {
      // Reward reaching target faster
      this.fitness = 1.0 + (1.0 - this.stepsToTarget / LIFESPAN);
    } else if (this.dead) {
      this.fitness = Math.max(0.001, 1.0 / (dist * dist) * 100);
    } else {
      this.fitness = Math.max(0.001, 1.0 / (dist * dist) * 1000);
    }
  }
}

// ── Population class ──────────────────────────────────────────────────────────

class Population {
  constructor(size, startX, startY) {
    this.size = size;
    this.startX = startX;
    this.startY = startY;
    this.dots = [];
    this.generation = 1;
    this.bestFitness = 0;
    this.avgFitness = 0;
    this.matingPool = [];

    for (let i = 0; i < size; i++) {
      this.dots.push(new Dot(startX, startY));
    }
  }

  evaluate(target) {
    let maxFitness = 0;
    let totalFitness = 0;

    for (const dot of this.dots) {
      dot.calcFitness(target);
      if (dot.fitness > maxFitness) maxFitness = dot.fitness;
      totalFitness += dot.fitness;
    }

    this.bestFitness = maxFitness;
    this.avgFitness = totalFitness / this.dots.length;

    // Normalize fitness and build mating pool
    this.matingPool = [];
    for (const dot of this.dots) {
      const normalizedFitness = maxFitness > 0 ? dot.fitness / maxFitness : 0;
      const n = Math.floor(normalizedFitness * 100);
      for (let j = 0; j < n; j++) {
        this.matingPool.push(dot);
      }
    }
    if (this.matingPool.length === 0) {
      this.matingPool = [...this.dots];
    }
  }

  selection(mutationRate) {
    const newDots = [];
    for (let i = 0; i < this.size; i++) {
      const parentA = this.matingPool[Math.floor(Math.random() * this.matingPool.length)];
      const parentB = this.matingPool[Math.floor(Math.random() * this.matingPool.length)];
      const childDNA = parentA.dna.crossover(parentB.dna);
      childDNA.mutate(mutationRate);
      newDots.push(new Dot(this.startX, this.startY, childDNA));
    }
    this.dots = newDots;
    this.generation++;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

const GeneticAlgorithmVisualizer = () => {
  // Controls state
  const [populationSize, setPopulationSize] = useState(200);
  const [mutationRate, setMutationRate] = useState(0.01);
  const [speed, setSpeed] = useState(2); // steps per frame
  const [isRunning, setIsRunning] = useState(false);

  // Stats state
  const [generation, setGeneration] = useState(1);
  const [bestFitness, setBestFitness] = useState(0);
  const [avgFitness, setAvgFitness] = useState(0);
  const [reachedCount, setReachedCount] = useState(0);

  useVisualizationShortcuts({ onTogglePlay: () => setIsRunning(r => !r) });

  // Refs
  const mainCanvasRef = useRef(null);
  const chartCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const populationRef = useRef(null);
  const stepRef = useRef(0);
  const animFrameRef = useRef(null);
  const fitnessHistoryRef = useRef([]);
  const avgHistoryRef = useRef([]);
  const canvasSizeRef = useRef({ w: 800, h: 500 });

  // Obstacle and target layout (in normalised 0-1 coords, mapped to canvas)
  const obstaclesNorm = useRef([
    { x: 0.0, y: 0.42, w: 0.42, h: 0.04 },
    { x: 0.58, y: 0.42, w: 0.42, h: 0.04 },
    { x: 0.25, y: 0.7, w: 0.5, h: 0.04 },
    { x: 0.15, y: 0.2, w: 0.04, h: 0.22 },
    { x: 0.81, y: 0.2, w: 0.04, h: 0.22 },
  ]);
  const targetNorm = useRef({ x: 0.5, y: 0.08, r: 0.03 });
  const startNorm = useRef({ x: 0.5, y: 0.9 });

  const getScaled = useCallback(() => {
    const { w, h } = canvasSizeRef.current;
    const obstacles = obstaclesNorm.current.map((o) => ({
      x: o.x * w,
      y: o.y * h,
      w: o.w * w,
      h: o.h * h,
    }));
    const target = {
      x: targetNorm.current.x * w,
      y: targetNorm.current.y * h,
      r: targetNorm.current.r * Math.min(w, h),
    };
    const start = {
      x: startNorm.current.x * w,
      y: startNorm.current.y * h,
    };
    return { obstacles, target, start };
  }, []);

  // ── Initialise / reset ────────────────────────────────────────────────────

  const initPopulation = useCallback(() => {
    const { start } = getScaled();
    populationRef.current = new Population(populationSize, start.x, start.y);
    stepRef.current = 0;
    fitnessHistoryRef.current = [];
    avgHistoryRef.current = [];
    setGeneration(1);
    setBestFitness(0);
    setAvgFitness(0);
    setReachedCount(0);
  }, [populationSize, getScaled]);

  // ── Resize handling ───────────────────────────────────────────────────────

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = Math.min(Math.round(w * 0.625), 500);
      canvasSizeRef.current = { w, h };

      if (mainCanvasRef.current) {
        mainCanvasRef.current.width = w;
        mainCanvasRef.current.height = h;
      }
      if (chartCanvasRef.current) {
        chartCanvasRef.current.width = w;
        chartCanvasRef.current.height = 180;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Init population on mount or when popSize changes while stopped
  useEffect(() => {
    initPopulation();
  }, [initPopulation]);

  // ── Drawing ───────────────────────────────────────────────────────────────

  const drawMain = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = canvasSizeRef.current;
    const { obstacles, target, start } = getScaled();

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, w, h);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Obstacles
    for (const obs of obstacles) {
      ctx.fillStyle = 'rgba(239,68,68,0.6)';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = 'rgba(239,68,68,0.9)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }

    // Start area
    ctx.beginPath();
    ctx.arc(start.x, start.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59,130,246,0.4)';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#93c5fd';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('START', start.x, start.y + 24);

    // Target
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34,197,94,0.35)';
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Pulsing ring
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r + 6 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(34,197,94,${0.4 * (1 - pulse)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#86efac';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET', target.x, target.y - target.r - 8);

    // Dots
    const pop = populationRef.current;
    if (!pop) return;

    // Find max fitness for normalisation
    let maxFit = 0;
    for (const dot of pop.dots) {
      if (dot.fitness > maxFit) maxFit = dot.fitness;
    }

    for (const dot of pop.dots) {
      const normFit = maxFit > 0 ? dot.fitness / maxFit : 0;
      const color = fitnessColor(normFit);
      const radius = 2.5 + normFit * 2;
      ctx.beginPath();
      ctx.arc(dot.pos.x, dot.pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = dot.dead
        ? 'rgba(100,100,100,0.25)'
        : dot.reachedTarget
        ? 'rgba(34,197,94,0.9)'
        : color;
      ctx.fill();
    }

    // Generation label
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Gen ${pop.generation}`, 10, 20);
    ctx.font = '11px sans-serif';
    ctx.fillText(`Step ${stepRef.current}/${LIFESPAN}`, 10, 36);
  }, [getScaled]);

  const drawChart = useCallback(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, w, h);

    const bestHist = fitnessHistoryRef.current;
    const avgHist = avgHistoryRef.current;
    if (bestHist.length < 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Fitness chart will appear after a few generations...', w / 2, h / 2);
      return;
    }

    const pad = { top: 20, right: 15, bottom: 30, left: 55 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Determine max value for y-axis
    const maxVal = Math.max(...bestHist, 0.1);

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const yVal = (maxVal / 4) * i;
      const yPos = pad.top + plotH - (i / 4) * plotH;
      ctx.fillText(yVal.toFixed(2), pad.left - 6, yPos + 3);
      // Grid line
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      ctx.moveTo(pad.left, yPos);
      ctx.lineTo(pad.left + plotW, yPos);
      ctx.stroke();
    }

    // X label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generation', pad.left + plotW / 2, h - 4);

    // Draw lines helper
    const drawLine = (data, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = 0; i < data.length; i++) {
        const x = pad.left + (i / (data.length - 1)) * plotW;
        const y = pad.top + plotH - (data[i] / maxVal) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawLine(bestHist, '#22c55e');
    drawLine(avgHist, '#60a5fa');

    // Legend
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(pad.left + 8, pad.top + 4, 12, 3);
    ctx.fillText('Best', pad.left + 24, pad.top + 10);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(pad.left + 65, pad.top + 4, 12, 3);
    ctx.fillText('Avg', pad.left + 81, pad.top + 10);
  }, []);

  // ── Simulation loop ───────────────────────────────────────────────────────

  const tick = useCallback(() => {
    const pop = populationRef.current;
    if (!pop) return;

    const { obstacles, target } = getScaled();
    const { w, h } = canvasSizeRef.current;

    for (let s = 0; s < speed; s++) {
      if (stepRef.current >= LIFESPAN) {
        // End of generation – evaluate and breed
        pop.evaluate(target);

        fitnessHistoryRef.current.push(pop.bestFitness);
        avgHistoryRef.current.push(pop.avgFitness);

        const reached = pop.dots.filter((d) => d.reachedTarget).length;
        setGeneration(pop.generation);
        setBestFitness(pop.bestFitness);
        setAvgFitness(pop.avgFitness);
        setReachedCount(reached);

        pop.selection(mutationRate);
        stepRef.current = 0;
        break; // draw this frame before continuing
      }

      for (const dot of pop.dots) {
        dot.update(stepRef.current, obstacles, target, w, h);
      }
      stepRef.current++;
    }

    drawMain();
    drawChart();

    animFrameRef.current = requestAnimationFrame(tick);
  }, [speed, mutationRate, getScaled, drawMain, drawChart]);

  useEffect(() => {
    if (isRunning) {
      animFrameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, tick]);

  // Draw initial state
  useEffect(() => {
    drawMain();
    drawChart();
  }, [drawMain, drawChart]);

  // Auto-start on mount
  const gaInitRef = useRef(false);
  useEffect(() => {
    if (!gaInitRef.current) {
      gaInitRef.current = true;
      setIsRunning(true);
    }
  }, []);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleReset = () => {
    setIsRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    initPopulation();
    setTimeout(() => {
      drawMain();
      drawChart();
    }, 0);
  };

  const handlePlayPause = () => {
    setIsRunning((prev) => !prev);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls */}
      <div className="bg-gray-800 rounded-t-xl p-4 flex flex-wrap items-center gap-4 text-sm text-gray-200">
        {/* Play / Pause / Reset */}
        <div className="flex gap-2">
          <button
            onClick={handlePlayPause}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-500 text-white transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Population Size */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-0.5">Population: {populationSize}</label>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={populationSize}
            onChange={(e) => {
              setPopulationSize(Number(e.target.value));
            }}
            disabled={isRunning}
            className="w-28 accent-blue-500"
          />
        </div>

        {/* Mutation Rate */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-0.5">
            Mutation: {(mutationRate * 100).toFixed(1)}%
          </label>
          <input
            type="range"
            min={0.001}
            max={0.15}
            step={0.001}
            value={mutationRate}
            onChange={(e) => setMutationRate(Number(e.target.value))}
            className="w-28 accent-purple-500"
          />
        </div>

        {/* Speed */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-0.5">Speed: {speed}x</label>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-28 accent-cyan-500"
          />
        </div>
      </div>

      {/* Main canvas */}
      <div ref={containerRef} className="w-full bg-gray-900">
        <canvas
          ref={mainCanvasRef}
          width={800}
          height={500}
          className="w-full block"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Stats bar */}
      <div className="bg-gray-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs">Generation</div>
          <div className="text-white font-bold text-lg">{generation}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs">Best Fitness</div>
          <div className="text-green-400 font-bold text-lg">{bestFitness.toFixed(3)}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs">Avg Fitness</div>
          <div className="text-blue-400 font-bold text-lg">{avgFitness.toFixed(3)}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2">
          <div className="text-gray-400 text-xs">Reached Target</div>
          <div className="text-emerald-400 font-bold text-lg">{reachedCount}</div>
        </div>
      </div>

      {/* Fitness chart */}
      <div className="bg-gray-900 rounded-b-xl overflow-hidden">
        <canvas
          ref={chartCanvasRef}
          width={800}
          height={180}
          className="w-full block"
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 justify-center text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Low fitness
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> High fitness
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-500" /> Dead (hit obstacle)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500/60" /> Obstacles
        </span>
      </div>
      <KeyboardShortcutHint showReset={false} />
    </div>
  );
};

export default GeneticAlgorithmVisualizer;
