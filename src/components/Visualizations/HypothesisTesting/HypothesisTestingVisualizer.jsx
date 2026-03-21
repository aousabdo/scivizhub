import React, { useState, useEffect, useRef, useCallback } from 'react';

// Normal PDF
const normalPDF = (x, mean, stdDev) => {
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
  return coefficient * Math.exp(exponent);
};

// Standard normal CDF approximation (Abramowitz & Stegun)
const normalCDF = (x) => {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);
  return 0.5 * (1.0 + sign * y);
};

// Inverse normal CDF approximation (rational approximation)
const normalInvCDF = (p) => {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00
  ];
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01,
    -1.328068155288572e+01
  ];
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
    4.374664141464968e+00, 2.938163982698783e+00
  ];
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q, r;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
};

const PRESETS = {
  medical: {
    label: 'Medical Trial',
    alpha: 0.01,
    effectSize: 0.8,
    sampleSize: 50,
    twoTailed: true,
    description: 'Conservative threshold to avoid false positives in drug approval',
  },
  abtest: {
    label: 'A/B Test',
    alpha: 0.05,
    effectSize: 0.3,
    sampleSize: 200,
    twoTailed: true,
    description: 'Detecting small conversion rate differences in web experiments',
  },
  quality: {
    label: 'Quality Control',
    alpha: 0.05,
    effectSize: 1.0,
    sampleSize: 30,
    twoTailed: false,
    description: 'One-sided test for detecting defective product batches',
  },
};

const HypothesisTestingVisualizer = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const canvasHeight = 450;

  const [alpha, setAlpha] = useState(0.05);
  const [effectSize, setEffectSize] = useState(0.5);
  const [sampleSize, setSampleSize] = useState(30);
  const [twoTailed, setTwoTailed] = useState(true);
  const [testStatPosition, setTestStatPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // Derived statistics
  const standardError = 1 / Math.sqrt(sampleSize);
  const h0Mean = 0;
  const h1Mean = effectSize / standardError; // non-centrality in z-units
  const stdDev = 1; // working in z-space

  // Critical values
  const criticalValueRight = twoTailed
    ? normalInvCDF(1 - alpha / 2)
    : normalInvCDF(1 - alpha);
  const criticalValueLeft = twoTailed
    ? normalInvCDF(alpha / 2)
    : -Infinity;

  // Power and beta
  const beta = twoTailed
    ? normalCDF(criticalValueRight - h1Mean) - normalCDF(criticalValueLeft - h1Mean)
    : normalCDF(criticalValueRight - h1Mean);
  const power = 1 - beta;

  // Test statistic and p-value
  const testStat = testStatPosition !== null ? testStatPosition : h1Mean * 0.6;
  const pValue = twoTailed
    ? 2 * (1 - normalCDF(Math.abs(testStat)))
    : 1 - normalCDF(testStat);
  const rejectNull = pValue < alpha;

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setCanvasWidth(w);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Initialize test stat position
  useEffect(() => {
    if (testStatPosition === null) {
      setTestStatPosition(h1Mean * 0.6);
    }
  }, []);

  // Drawing
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Layout
    const margin = { top: 40, right: 30, bottom: 60, left: 50 };
    const plotW = canvasWidth - margin.left - margin.right;
    const plotH = canvasHeight - margin.top - margin.bottom;

    // X range: cover both distributions well
    const xMin = Math.min(h0Mean - 4 * stdDev, h1Mean - 4 * stdDev, -4);
    const xMax = Math.max(h0Mean + 4 * stdDev, h1Mean + 4 * stdDev, 4);
    const xRange = xMax - xMin;

    const toCanvasX = (x) => margin.left + ((x - xMin) / xRange) * plotW;
    const toDataX = (cx) => xMin + ((cx - margin.left) / plotW) * xRange;

    // Y range
    const yMax = Math.max(normalPDF(h0Mean, h0Mean, stdDev), normalPDF(h1Mean, h1Mean, stdDev)) * 1.15;
    const toCanvasY = (y) => margin.top + plotH - (y / yMax) * plotH;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (plotH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotW, y);
      ctx.stroke();
    }

    const step = xRange > 10 ? 2 : 1;
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += step) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, margin.top);
      ctx.lineTo(cx, margin.top + plotH);
      ctx.stroke();
    }

    // Helper: fill region under curve
    const fillRegion = (mean, sd, xStart, xEnd, color) => {
      const resolution = 200;
      const dx = (xEnd - xStart) / resolution;
      ctx.beginPath();
      ctx.moveTo(toCanvasX(xStart), toCanvasY(0));
      for (let i = 0; i <= resolution; i++) {
        const x = xStart + i * dx;
        const y = normalPDF(x, mean, sd);
        ctx.lineTo(toCanvasX(x), toCanvasY(y));
      }
      ctx.lineTo(toCanvasX(xEnd), toCanvasY(0));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    // Shade Type I error (alpha) - rejection region under H0
    if (twoTailed) {
      fillRegion(h0Mean, stdDev, xMin, criticalValueLeft, 'rgba(239, 68, 68, 0.3)');
      fillRegion(h0Mean, stdDev, criticalValueRight, xMax, 'rgba(239, 68, 68, 0.3)');
    } else {
      fillRegion(h0Mean, stdDev, criticalValueRight, xMax, 'rgba(239, 68, 68, 0.3)');
    }

    // Shade Type II error (beta) - acceptance region under H1
    if (twoTailed) {
      fillRegion(h1Mean, stdDev, criticalValueLeft, criticalValueRight, 'rgba(251, 191, 36, 0.3)');
    } else {
      fillRegion(h1Mean, stdDev, xMin, criticalValueRight, 'rgba(251, 191, 36, 0.3)');
    }

    // Shade Power (1-beta) - rejection region under H1
    if (twoTailed) {
      fillRegion(h1Mean, stdDev, criticalValueRight, xMax, 'rgba(34, 197, 94, 0.3)');
      fillRegion(h1Mean, stdDev, xMin, criticalValueLeft, 'rgba(34, 197, 94, 0.15)');
    } else {
      fillRegion(h1Mean, stdDev, criticalValueRight, xMax, 'rgba(34, 197, 94, 0.3)');
    }

    // Draw H0 distribution curve
    const drawCurve = (mean, sd, color, lineWidth) => {
      const resolution = 300;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      for (let i = 0; i <= resolution; i++) {
        const x = xMin + (i / resolution) * xRange;
        const y = normalPDF(x, mean, sd);
        const cx = toCanvasX(x);
        const cy = toCanvasY(y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    };

    drawCurve(h0Mean, stdDev, '#3b82f6', 2.5);
    drawCurve(h1Mean, stdDev, '#f97316', 2.5);

    // Critical value lines
    const drawCriticalLine = (xVal) => {
      if (!isFinite(xVal)) return;
      const cx = toCanvasX(xVal);
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.moveTo(cx, margin.top);
      ctx.lineTo(cx, margin.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawCriticalLine(criticalValueRight);
    if (twoTailed) drawCriticalLine(criticalValueLeft);

    // Test statistic marker
    const currentTestStat = testStat;
    const tsX = toCanvasX(currentTestStat);
    const tsY = toCanvasY(normalPDF(currentTestStat, h0Mean, stdDev));

    // Vertical line for test statistic
    ctx.beginPath();
    ctx.strokeStyle = rejectNull ? '#dc2626' : '#6b7280';
    ctx.lineWidth = 2.5;
    ctx.moveTo(tsX, margin.top + plotH);
    ctx.lineTo(tsX, tsY);
    ctx.stroke();

    // Triangle marker at bottom
    ctx.beginPath();
    ctx.fillStyle = rejectNull ? '#dc2626' : '#4b5563';
    ctx.moveTo(tsX, margin.top + plotH);
    ctx.lineTo(tsX - 8, margin.top + plotH + 14);
    ctx.lineTo(tsX + 8, margin.top + plotH + 14);
    ctx.closePath();
    ctx.fill();

    // Draggable circle on top
    ctx.beginPath();
    ctx.arc(tsX, tsY, 7, 0, 2 * Math.PI);
    ctx.fillStyle = rejectNull ? '#dc2626' : '#4b5563';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // X axis
    ctx.beginPath();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.moveTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    ctx.stroke();

    // X axis ticks and labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += step) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, margin.top + plotH);
      ctx.lineTo(cx, margin.top + plotH + 5);
      ctx.stroke();
      ctx.fillText(x.toString(), cx, margin.top + plotH + 20);
    }

    // X axis label
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Test Statistic (z)', margin.left + plotW / 2, canvasHeight - 8);

    // Y axis label
    ctx.save();
    ctx.translate(14, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Probability Density', 0, 0);
    ctx.restore();

    // Legend
    const legendX = margin.left + 12;
    const legendY = margin.top + 10;
    const legendItems = [
      { color: '#3b82f6', label: 'H\u2080 (Null)', lineWidth: 2.5 },
      { color: '#f97316', label: 'H\u2081 (Alternative)', lineWidth: 2.5 },
      { color: 'rgba(239, 68, 68, 0.4)', label: 'Type I Error (\u03b1)', fill: true },
      { color: 'rgba(251, 191, 36, 0.4)', label: 'Type II Error (\u03b2)', fill: true },
      { color: 'rgba(34, 197, 94, 0.4)', label: 'Power (1\u2013\u03b2)', fill: true },
    ];

    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    legendItems.forEach((item, i) => {
      const y = legendY + i * 18;
      if (item.fill) {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, y - 5, 16, 10);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(legendX, y - 5, 16, 10);
      } else {
        ctx.beginPath();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.lineWidth;
        ctx.moveTo(legendX, y);
        ctx.lineTo(legendX + 16, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#374151';
      ctx.fillText(item.label, legendX + 22, y + 4);
    });

    // Critical value labels
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    if (isFinite(criticalValueRight)) {
      ctx.fillText(`z = ${criticalValueRight.toFixed(2)}`, toCanvasX(criticalValueRight), margin.top - 5);
    }
    if (twoTailed && isFinite(criticalValueLeft)) {
      ctx.fillText(`z = ${criticalValueLeft.toFixed(2)}`, toCanvasX(criticalValueLeft), margin.top - 5);
    }

    // Test stat label
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = rejectNull ? '#dc2626' : '#4b5563';
    ctx.textAlign = 'center';
    const labelText = `z = ${currentTestStat.toFixed(2)}`;
    ctx.fillText(labelText, tsX, margin.top + plotH + 28);
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('(drag me)', tsX, margin.top + plotH + 42);

    // Store mapping for mouse events
    canvas._toDataX = toDataX;
    canvas._margin = margin;
    canvas._plotH = plotH;
    canvas._plotW = plotW;
    canvas._tsX = tsX;
    canvas._tsY = tsY;
  }, [
    canvasWidth, h0Mean, h1Mean, stdDev, criticalValueLeft, criticalValueRight,
    twoTailed, testStat, rejectNull, alpha, effectSize, sampleSize,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse interaction for dragging test statistic
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left);
    const my = (e.clientY - rect.top);
    const tsScreenX = canvas._tsX;
    const tsScreenY = canvas._tsY;
    const margin = canvas._margin;
    const plotH = canvas._plotH;
    // Check if click is near the test stat marker or its line
    if (Math.abs(mx - tsScreenX) < 15 && my >= tsScreenY - 10 && my <= margin.top + plotH + 20) {
      setIsDragging(true);
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas || !canvas._toDataX) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const newX = canvas._toDataX(mx);
    setTestStatPosition(Math.max(-5, Math.min(newX, 10)));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;
    const tsScreenX = canvas._tsX;
    const tsScreenY = canvas._tsY;
    const margin = canvas._margin;
    const plotH = canvas._plotH;
    if (Math.abs(mx - tsScreenX) < 25 && my >= tsScreenY - 15 && my <= margin.top + plotH + 25) {
      setIsDragging(true);
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas || !canvas._toDataX) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mx = touch.clientX - rect.left;
    const newX = canvas._toDataX(mx);
    setTestStatPosition(Math.max(-5, Math.min(newX, 10)));
    e.preventDefault();
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);

  const applyPreset = (key) => {
    const preset = PRESETS[key];
    setAlpha(preset.alpha);
    setEffectSize(preset.effectSize);
    setSampleSize(preset.sampleSize);
    setTwoTailed(preset.twoTailed);
    setActivePreset(key);
    setTestStatPosition(null);
    setTimeout(() => {
      setTestStatPosition((preset.effectSize / (1 / Math.sqrt(preset.sampleSize))) * 0.6);
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Presets */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
              activePreset === key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 dark:text-gray-300 border border-gray-300 hover:bg-gray-50 hover:border-blue-400'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {activePreset && (
        <p className="text-center text-sm text-gray-500 mb-4 italic">
          {PRESETS[activePreset].description}
        </p>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Significance Level (&alpha;)
          </label>
          <input
            type="range"
            min="0.001"
            max="0.2"
            step="0.001"
            value={alpha}
            onChange={(e) => {
              setAlpha(parseFloat(e.target.value));
              setActivePreset(null);
            }}
            className="w-full accent-red-500"
          />
          <div className="text-center font-mono text-lg text-red-600 font-bold mt-1">
            {alpha.toFixed(3)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Effect Size (Cohen&apos;s d)
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={effectSize}
            onChange={(e) => {
              setEffectSize(parseFloat(e.target.value));
              setActivePreset(null);
              setTestStatPosition(null);
              const newES = parseFloat(e.target.value);
              const newSE = 1 / Math.sqrt(sampleSize);
              setTimeout(() => setTestStatPosition((newES / newSE) * 0.6), 0);
            }}
            className="w-full accent-orange-500"
          />
          <div className="text-center font-mono text-lg text-orange-600 font-bold mt-1">
            {effectSize.toFixed(2)}
          </div>
          <div className="text-center text-xs text-gray-400 mt-0.5">
            {effectSize < 0.2 ? 'Negligible' : effectSize < 0.5 ? 'Small' : effectSize < 0.8 ? 'Medium' : 'Large'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Sample Size (n)
          </label>
          <input
            type="range"
            min="5"
            max="500"
            step="1"
            value={sampleSize}
            onChange={(e) => {
              setSampleSize(parseInt(e.target.value));
              setActivePreset(null);
              setTestStatPosition(null);
              const newSE = 1 / Math.sqrt(parseInt(e.target.value));
              setTimeout(() => setTestStatPosition((effectSize / newSE) * 0.6), 0);
            }}
            className="w-full accent-blue-500"
          />
          <div className="text-center font-mono text-lg text-blue-600 font-bold mt-1">
            {sampleSize}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Test Type
          </label>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => { setTwoTailed(true); setActivePreset(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                twoTailed
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Two-tailed
            </button>
            <button
              onClick={() => { setTwoTailed(false); setActivePreset(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                !twoTailed
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-600 hover:bg-gray-200'
              }`}
            >
              One-tailed
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden mb-6"
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ width: '100%', height: canvasHeight, cursor: isDragging ? 'grabbing' : 'default' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        />
      </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4 text-center">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            Type I Error (&alpha;)
          </div>
          <div className="text-2xl font-bold text-red-700">
            {(alpha * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-red-500 mt-1">
            False positive rate
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4 text-center">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
            Type II Error (&beta;)
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {(beta * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-amber-500 mt-1">
            False negative rate
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4 text-center">
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
            Power (1 &minus; &beta;)
          </div>
          <div className="text-2xl font-bold text-green-700">
            {(power * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-green-500 mt-1">
            True positive rate
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 text-center">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Effect Size
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {effectSize.toFixed(2)}
          </div>
          <div className="text-xs text-blue-500 mt-1">
            Cohen&apos;s d
          </div>
        </div>
      </div>

      {/* Decision Panel */}
      <div className={`rounded-xl border-2 p-5 mb-6 transition-colors ${
        rejectNull
          ? 'border-red-400 bg-red-50'
          : 'border-gray-300 bg-gray-50'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className={`text-lg font-bold ${rejectNull ? 'text-red-700' : 'text-gray-700'}`}>
              {rejectNull ? 'Reject H\u2080' : 'Fail to Reject H\u2080'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {rejectNull
                ? 'The test statistic falls in the rejection region. There is sufficient evidence against the null hypothesis.'
                : 'The test statistic does not fall in the rejection region. There is insufficient evidence to reject the null hypothesis.'}
            </p>
          </div>
          <div className="flex gap-6 text-center shrink-0">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Test Statistic</div>
              <div className="text-xl font-mono font-bold text-gray-800 dark:text-gray-200">
                z = {testStat.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">p-value</div>
              <div className={`text-xl font-mono font-bold ${pValue < alpha ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>
                {pValue < 0.001 ? pValue.toExponential(2) : pValue.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Critical Value</div>
              <div className="text-xl font-mono font-bold text-gray-800 dark:text-gray-200">
                z = {twoTailed ? '\u00B1' : ''}{criticalValueRight.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HypothesisTestingVisualizer;
