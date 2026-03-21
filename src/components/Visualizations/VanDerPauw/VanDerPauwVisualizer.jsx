import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import useVisualizationShortcuts from '../../../hooks/useVisualizationShortcuts';
import KeyboardShortcutHint from '../../UI/KeyboardShortcutHint';

const SAMPLE_SHAPES = {
  square: 'Square',
  circle: 'Circular',
  cloverleaf: 'Cloverleaf',
  rectangle: 'Rectangular',
  irregular: 'L-Shape',
};

const PRESETS = {
  ideal: { label: 'Ideal Square', shape: 'square', resistivity: 1e-4, thickness: 0.5, contactSize: 0.02, temperature: 300 },
  silicon: { label: 'Silicon Wafer', shape: 'circle', resistivity: 10, thickness: 0.5, contactSize: 0.01, temperature: 300 },
  metal: { label: 'Thin Metal Film', shape: 'square', resistivity: 2.65e-6, thickness: 0.001, contactSize: 0.05, temperature: 300 },
  semiconductor: { label: 'GaAs Wafer', shape: 'cloverleaf', resistivity: 0.003, thickness: 0.35, contactSize: 0.01, temperature: 300 },
};

// Van der Pauw equation solver: exp(-pi*R_A/R_s) + exp(-pi*R_B/R_s) = 1
function solveVanDerPauw(R_A, R_B, maxIter = 100, tol = 1e-10) {
  // Newton's method to solve for sheet resistance R_s
  let Rs = (Math.PI / Math.log(2)) * (R_A + R_B) / 2; // initial guess

  for (let i = 0; i < maxIter; i++) {
    const expA = Math.exp(-Math.PI * R_A / Rs);
    const expB = Math.exp(-Math.PI * R_B / Rs);
    const f = expA + expB - 1;
    const df = (Math.PI / (Rs * Rs)) * (R_A * expA + R_B * expB);

    const delta = f / df;
    Rs -= delta;

    if (Math.abs(delta) < tol * Rs) break;
  }

  return Rs;
}

// Geometric correction factor for non-ideal contact placement
function geometricCorrectionFactor(R_A, R_B) {
  const ratio = R_A / R_B;
  if (ratio < 0.001 || ratio > 1000) return 0.5;
  // Approximate correction factor f(R_A/R_B) from Van der Pauw's original paper
  const r = Math.max(ratio, 1 / ratio);
  const x = (r - 1) / (r + 1);
  const f = 1 - x * x * (0.5 - 0.3388 * x * x - 0.0677 * x * x * x * x);
  return f;
}

const formatSci = (val) => {
  if (val === 0) return '0';
  if (Math.abs(val) < 0.001 || Math.abs(val) >= 1e6) {
    return val.toExponential(3);
  }
  return val.toPrecision(4);
};

const VanDerPauwVisualizer = () => {
  const [shape, setShape] = useState('square');
  const [resistivity, setResistivity] = useState(1e-4); // Ω·m
  const [thickness, setThickness] = useState(0.5); // mm
  const [contactSize, setContactSize] = useState(0.02); // fraction of perimeter
  const [temperature, setTemperature] = useState(300); // K
  const [currentValue, setCurrentValue] = useState(1); // mA
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showEquipotentials, setShowEquipotentials] = useState(true);
  const [activeConfig, setActiveConfig] = useState('A'); // A or B measurement configuration
  const [selectedPreset, setSelectedPreset] = useState('ideal');
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);

  useVisualizationShortcuts({
    onTogglePlay: () => setIsAnimating(prev => !prev),
    onReset: () => {
      applyPreset('ideal');
      setIsAnimating(false);
    },
  });

  const applyPreset = useCallback((presetKey) => {
    const p = PRESETS[presetKey];
    setShape(p.shape);
    setResistivity(p.resistivity);
    setThickness(p.thickness);
    setContactSize(p.contactSize);
    setTemperature(p.temperature);
    setSelectedPreset(presetKey);
  }, []);

  // Calculate Van der Pauw results
  const results = useMemo(() => {
    const t = thickness * 1e-3; // convert mm to m
    const sheetResistance = resistivity / t; // Ω/sq

    // Temperature coefficient (simplified model)
    const tempCoeff = 1 + 0.004 * (temperature - 300);
    const adjustedResistivity = resistivity * tempCoeff;
    const adjustedSheetResistance = adjustedResistivity / t;

    // Simulate R_A and R_B measurements
    // For ideal square sample with contacts at corners: R_A = R_B
    let asymmetryFactor;
    switch (shape) {
      case 'rectangle': asymmetryFactor = 1.8; break;
      case 'irregular': asymmetryFactor = 2.5; break;
      case 'cloverleaf': asymmetryFactor = 1.01; break;
      default: asymmetryFactor = 1.0; break;
    }

    // Contact size error
    const contactError = 1 + 0.5 * contactSize * contactSize;

    const I = currentValue * 1e-3; // mA to A
    const V_A = adjustedSheetResistance * I * (Math.log(2) / Math.PI) * contactError;
    const V_B = V_A * asymmetryFactor;
    const R_A = V_A / I;
    const R_B = V_B / I;

    // Solve Van der Pauw equation
    const Rs_measured = solveVanDerPauw(R_A, R_B);
    const correctionFactor = geometricCorrectionFactor(R_A, R_B);

    // Calculate resistivity from measured sheet resistance
    const measuredResistivity = Rs_measured * t;

    // Error from non-ideal contacts
    const contactSizeError = ((Rs_measured - adjustedSheetResistance) / adjustedSheetResistance) * 100;

    return {
      sheetResistance: adjustedSheetResistance,
      R_A,
      R_B,
      V_A: V_A * 1e3, // back to mV
      V_B: V_B * 1e3,
      Rs_measured,
      correctionFactor,
      measuredResistivity,
      actualResistivity: adjustedResistivity,
      error: contactSizeError,
      ratio: R_A / R_B,
    };
  }, [resistivity, thickness, temperature, shape, contactSize, currentValue]);

  // Draw sample and field visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const size = Math.min(w, h) * 0.35;

    const isDark = document.documentElement.classList.contains('dark');

    const draw = (time) => {
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = isDark ? '#1f2937' : '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      // Draw sample shape
      ctx.save();
      ctx.translate(cx, cy);

      // Sample fill
      ctx.fillStyle = isDark ? '#374151' : '#e2e8f0';
      ctx.strokeStyle = isDark ? '#6b7280' : '#94a3b8';
      ctx.lineWidth = 2;

      switch (shape) {
        case 'square':
          ctx.beginPath();
          ctx.rect(-size, -size, size * 2, size * 2);
          ctx.fill();
          ctx.stroke();
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        case 'cloverleaf': {
          ctx.beginPath();
          // Main circle
          ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Four protruding arms for contacts
          const armLen = size * 0.45;
          const armW = size * 0.15;
          for (let a = 0; a < 4; a++) {
            const angle = (a * Math.PI) / 2;
            ctx.save();
            ctx.rotate(angle);
            ctx.fillRect(-armW, -size * 0.6 - armLen, armW * 2, armLen);
            ctx.strokeRect(-armW, -size * 0.6 - armLen, armW * 2, armLen);
            ctx.restore();
          }
          break;
        }
        case 'rectangle':
          ctx.beginPath();
          ctx.rect(-size * 1.5, -size * 0.6, size * 3, size * 1.2);
          ctx.fill();
          ctx.stroke();
          break;
        case 'irregular':
          ctx.beginPath();
          ctx.moveTo(-size, -size);
          ctx.lineTo(size, -size);
          ctx.lineTo(size, 0);
          ctx.lineTo(0, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size, size);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        default: break;
      }

      // Contact positions
      const contacts = getContactPositions(shape, size);

      // Draw field lines / equipotentials
      if (showFieldLines || showEquipotentials) {
        ctx.save();
        ctx.globalAlpha = 0.4;

        const sourceIdx = activeConfig === 'A' ? 0 : 1;
        const sinkIdx = activeConfig === 'A' ? 1 : 2;
        const src = contacts[sourceIdx];
        const sink = contacts[sinkIdx];

        if (showFieldLines) {
          ctx.strokeStyle = isDark ? '#60a5fa' : '#3b82f6';
          ctx.lineWidth = 1.5;
          const numLines = 12;
          for (let i = 0; i < numLines; i++) {
            const spread = ((i - numLines / 2 + 0.5) / numLines) * size * 1.2;
            ctx.beginPath();
            const steps = 30;
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const x = src.x + (sink.x - src.x) * t;
              const perpX = -(sink.y - src.y);
              const perpY = sink.x - src.x;
              const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
              const curve = Math.sin(t * Math.PI) * spread;
              const px = x + (perpX / len) * curve;
              const py = src.y + (sink.y - src.y) * t + (perpY / len) * curve;
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
        }

        if (showEquipotentials) {
          ctx.strokeStyle = isDark ? '#f87171' : '#ef4444';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          const numEqui = 8;
          for (let i = 1; i < numEqui; i++) {
            const t = i / numEqui;
            const midX = src.x + (sink.x - src.x) * t;
            const midY = src.y + (sink.y - src.y) * t;
            const perpX = -(sink.y - src.y);
            const perpY = sink.x - src.x;
            const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
            ctx.beginPath();
            const eqLen = size * 0.8;
            ctx.moveTo(midX - (perpX / len) * eqLen, midY - (perpY / len) * eqLen);
            ctx.lineTo(midX + (perpX / len) * eqLen, midY + (perpY / len) * eqLen);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        ctx.restore();
      }

      // Draw contacts
      const labels = ['1', '2', '3', '4'];
      const configColors = activeConfig === 'A'
        ? ['#ef4444', '#ef4444', '#22c55e', '#22c55e'] // I: 1→2, V: 3→4
        : ['#22c55e', '#ef4444', '#ef4444', '#22c55e']; // I: 2→3, V: 4→1

      contacts.forEach((c, i) => {
        const contactR = 8 + contactSize * 100;

        // Pulsing animation for current contacts
        const isCurrentContact = (activeConfig === 'A' && (i === 0 || i === 1)) ||
          (activeConfig === 'B' && (i === 1 || i === 2));

        let pulseR = 0;
        if (isAnimating && isCurrentContact) {
          pulseR = Math.sin(time * 3) * 3;
        }

        // Contact circle
        ctx.beginPath();
        ctx.arc(c.x, c.y, contactR + pulseR, 0, Math.PI * 2);
        ctx.fillStyle = configColors[i];
        ctx.fill();
        ctx.strokeStyle = isDark ? '#e5e7eb' : '#1f2937';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], c.x, c.y);

        // Label outside
        const labelOffset = contactR + 18;
        const angle = Math.atan2(c.y, c.x);
        const lx = c.x + Math.cos(angle) * labelOffset;
        const ly = c.y + Math.sin(angle) * labelOffset;
        ctx.fillStyle = isDark ? '#d1d5db' : '#374151';
        ctx.font = '12px sans-serif';

        let desc;
        if (activeConfig === 'A') {
          if (i === 0) desc = 'I+';
          else if (i === 1) desc = 'I−';
          else if (i === 2) desc = 'V+';
          else desc = 'V−';
        } else {
          if (i === 0) desc = 'V−';
          else if (i === 1) desc = 'I+';
          else if (i === 2) desc = 'I−';
          else desc = 'V+';
        }
        ctx.fillText(desc, lx, ly);
      });

      // Current flow animation arrows
      if (isAnimating) {
        const sourceIdx = activeConfig === 'A' ? 0 : 1;
        const sinkIdx = activeConfig === 'A' ? 1 : 2;
        const src = contacts[sourceIdx];
        const sink = contacts[sinkIdx];

        ctx.strokeStyle = isDark ? '#fbbf24' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;

        const arrowPos = ((time * 0.5) % 1);
        const ax = src.x + (sink.x - src.x) * arrowPos;
        const ay = src.y + (sink.y - src.y) * arrowPos;
        const angle = Math.atan2(sink.y - src.y, sink.x - src.x);

        ctx.beginPath();
        ctx.moveTo(ax - Math.cos(angle - 0.4) * 12, ay - Math.sin(angle - 0.4) * 12);
        ctx.lineTo(ax, ay);
        ctx.lineTo(ax - Math.cos(angle + 0.4) * 12, ay - Math.sin(angle + 0.4) * 12);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      // Legend
      ctx.font = '12px sans-serif';
      ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
      ctx.textAlign = 'left';
      const legendY = h - 40;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, legendY, 12, 12);
      ctx.fillStyle = isDark ? '#d1d5db' : '#374151';
      ctx.fillText('Current contacts', 28, legendY + 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(140, legendY, 12, 12);
      ctx.fillStyle = isDark ? '#d1d5db' : '#374151';
      ctx.fillText('Voltage contacts', 158, legendY + 10);
    };

    if (isAnimating) {
      const animate = () => {
        timeRef.current += 0.016;
        draw(timeRef.current);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    } else {
      draw(0);
    }
  }, [shape, contactSize, activeConfig, showFieldLines, showEquipotentials, isAnimating]);

  function getContactPositions(shape, size) {
    switch (shape) {
      case 'square':
        return [
          { x: -size, y: -size },
          { x: size, y: -size },
          { x: size, y: size },
          { x: -size, y: size },
        ];
      case 'circle': {
        const r = size;
        return [0, 1, 2, 3].map(i => {
          const angle = -Math.PI / 4 + (i * Math.PI) / 2;
          return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
        });
      }
      case 'cloverleaf': {
        const r = size * 0.6 + size * 0.45;
        return [0, 1, 2, 3].map(i => {
          const angle = -Math.PI / 2 + (i * Math.PI) / 2;
          return { x: r * Math.cos(angle) * 0.6, y: r * Math.sin(angle) * 0.6 };
        });
      }
      case 'rectangle':
        return [
          { x: -size * 1.5, y: -size * 0.6 },
          { x: size * 1.5, y: -size * 0.6 },
          { x: size * 1.5, y: size * 0.6 },
          { x: -size * 1.5, y: size * 0.6 },
        ];
      case 'irregular':
        return [
          { x: -size, y: -size },
          { x: size, y: -size },
          { x: 0, y: size },
          { x: -size, y: size },
        ];
      default:
        return [
          { x: -size, y: -size },
          { x: size, y: -size },
          { x: size, y: size },
          { x: -size, y: size },
        ];
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <KeyboardShortcutHint />

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPreset === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">Sample Parameters</h3>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sample Shape
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {Object.entries(SAMPLE_SHAPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resistivity: {formatSci(resistivity)} Ω·m
            </label>
            <input
              type="range"
              min={-8}
              max={2}
              step={0.1}
              value={Math.log10(resistivity)}
              onChange={(e) => setResistivity(Math.pow(10, parseFloat(e.target.value)))}
              className="w-full mb-3"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
              <span>10⁻⁸ (Metal)</span>
              <span>10² (Insulator)</span>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thickness: {thickness.toFixed(2)} mm
            </label>
            <input
              type="range"
              min={0.001}
              max={5}
              step={0.001}
              value={thickness}
              onChange={(e) => setThickness(parseFloat(e.target.value))}
              className="w-full mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Size: {(contactSize * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min={0.005}
              max={0.15}
              step={0.005}
              value={contactSize}
              onChange={(e) => setContactSize(parseFloat(e.target.value))}
              className="w-full mb-3"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Smaller contacts give more accurate measurements
            </p>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temperature: {temperature} K
            </label>
            <input
              type="range"
              min={77}
              max={500}
              step={1}
              value={temperature}
              onChange={(e) => setTemperature(parseInt(e.target.value))}
              className="w-full mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current: {currentValue} mA
            </label>
            <input
              type="range"
              min={0.01}
              max={100}
              step={0.01}
              value={currentValue}
              onChange={(e) => setCurrentValue(parseFloat(e.target.value))}
              className="w-full mb-3"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">Display Options</h3>

            <div className="flex gap-4 mb-3">
              <button
                onClick={() => setActiveConfig('A')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeConfig === 'A'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Config A (I: 1→2)
              </button>
              <button
                onClick={() => setActiveConfig('B')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeConfig === 'B'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Config B (I: 2→3)
              </button>
            </div>

            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFieldLines}
                onChange={(e) => setShowFieldLines(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show field lines</span>
            </label>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showEquipotentials}
                onChange={(e) => setShowEquipotentials(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show equipotentials</span>
            </label>

            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAnimating
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isAnimating ? 'Stop Animation' : 'Animate Current Flow'}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">
              Sample View — Configuration {activeConfig}
            </h3>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {activeConfig === 'A'
                ? 'Current flows 1→2, voltage measured 3→4'
                : 'Current flows 2→3, voltage measured 4→1'}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResultCard
          label={`R_${activeConfig}`}
          value={formatSci(activeConfig === 'A' ? results.R_A : results.R_B)}
          unit="Ω"
          sublabel={`V = ${formatSci(activeConfig === 'A' ? results.V_A : results.V_B)} mV`}
        />
        <ResultCard
          label="Sheet Resistance"
          value={formatSci(results.Rs_measured)}
          unit="Ω/□"
          sublabel={`Actual: ${formatSci(results.sheetResistance)} Ω/□`}
        />
        <ResultCard
          label="Measured ρ"
          value={formatSci(results.measuredResistivity)}
          unit="Ω·m"
          sublabel={`Actual: ${formatSci(results.actualResistivity)} Ω·m`}
        />
        <ResultCard
          label="R_A / R_B"
          value={results.ratio.toFixed(4)}
          unit=""
          sublabel={`Correction f = ${results.correctionFactor.toFixed(4)}`}
        />
      </div>

      {/* Van der Pauw equation visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Van der Pauw Equation</h3>
        <div className="text-center mb-4">
          <div className="inline-block bg-gray-50 dark:bg-gray-900 rounded-lg px-6 py-4 border border-gray-200 dark:border-gray-600">
            <span className="font-mono text-lg text-gray-900 dark:text-gray-100">
              e<sup>−πR<sub>A</sub>/R<sub>s</sub></sup> + e<sup>−πR<sub>B</sub>/R<sub>s</sub></sup> = 1
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <div className="font-medium text-blue-800 dark:text-blue-300">Term 1</div>
            <div className="font-mono text-gray-800 dark:text-gray-200">
              e<sup>−π×{formatSci(results.R_A)}/{formatSci(results.Rs_measured)}</sup> = {Math.exp(-Math.PI * results.R_A / results.Rs_measured).toFixed(4)}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <div className="font-medium text-green-800 dark:text-green-300">Term 2</div>
            <div className="font-mono text-gray-800 dark:text-gray-200">
              e<sup>−π×{formatSci(results.R_B)}/{formatSci(results.Rs_measured)}</sup> = {Math.exp(-Math.PI * results.R_B / results.Rs_measured).toFixed(4)}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <div className="font-medium text-purple-800 dark:text-purple-300">Sum</div>
            <div className="font-mono text-gray-800 dark:text-gray-200">
              {(Math.exp(-Math.PI * results.R_A / results.Rs_measured) + Math.exp(-Math.PI * results.R_B / results.Rs_measured)).toFixed(6)} ≈ 1 ✓
            </div>
          </div>
        </div>
      </div>

      {/* Measurement procedure */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Measurement Procedure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              activeConfig === 'A'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => setActiveConfig('A')}
          >
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Step 1: Configuration A</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Apply current I between contacts 1 and 2.
              Measure voltage V between contacts 3 and 4.
            </p>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
              R<sub>A</sub> = V<sub>34</sub> / I<sub>12</sub> = {formatSci(results.R_A)} Ω
            </div>
          </div>
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              activeConfig === 'B'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => setActiveConfig('B')}
          >
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Step 2: Configuration B</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Apply current I between contacts 2 and 3.
              Measure voltage V between contacts 4 and 1.
            </p>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
              R<sub>B</sub> = V<sub>41</sub> / I<sub>23</sub> = {formatSci(results.R_B)} Ω
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ label, value, unit, sublabel }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700 text-center">
    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      {value} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{unit}</span>
    </div>
    {sublabel && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sublabel}</div>}
  </div>
);

export default VanDerPauwVisualizer;
