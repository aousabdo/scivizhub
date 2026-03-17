import React, { useState, useEffect, useRef, useCallback } from 'react';

const COULOMB_K = 500; // Scaled constant for visualization
const FIELD_LINE_STEP = 2; // Step size for field line tracing
const FIELD_LINE_MAX_STEPS = 600;
const FIELD_LINE_LINES_PER_UNIT_CHARGE = 12;
const CHARGE_RADIUS = 18;
const MIN_DIST = 5; // Minimum distance to avoid singularity
const GRID_SPACING = 30;
const ARROW_SIZE = 8;

const ElectromagneticFieldsVisualizer = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);

  const [charges, setCharges] = useState([]);
  const [selectedChargeType, setSelectedChargeType] = useState(1); // +1 or -1
  const [chargeMagnitude, setChargeMagnitude] = useState(2);
  const [showFieldVectors, setShowFieldVectors] = useState(false);
  const [showEquipotentials, setShowEquipotentials] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [testChargeMode, setTestChargeMode] = useState(false);
  const [testCharge, setTestCharge] = useState(null);
  const [cursorPos, setCursorPos] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(-1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const chargesRef = useRef(charges);
  chargesRef.current = charges;

  const testChargeRef = useRef(testCharge);
  testChargeRef.current = testCharge;

  const showFieldVectorsRef = useRef(showFieldVectors);
  showFieldVectorsRef.current = showFieldVectors;

  const showEquipotentialsRef = useRef(showEquipotentials);
  showEquipotentialsRef.current = showEquipotentials;

  const showHeatMapRef = useRef(showHeatMap);
  showHeatMapRef.current = showHeatMap;

  const cursorPosRef = useRef(cursorPos);
  cursorPosRef.current = cursorPos;

  const draggingIndexRef = useRef(draggingIndex);
  draggingIndexRef.current = draggingIndex;

  // Compute electric field at a point due to all charges
  const computeField = useCallback((x, y, chargeList) => {
    let Ex = 0, Ey = 0;
    for (const c of chargeList) {
      const dx = x - c.x;
      const dy = y - c.y;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2);
      if (r < MIN_DIST) continue;
      const mag = COULOMB_K * c.q / r2;
      Ex += mag * dx / r;
      Ey += mag * dy / r;
    }
    return { Ex, Ey };
  }, []);

  // Compute electric potential at a point
  const computePotential = useCallback((x, y, chargeList) => {
    let V = 0;
    for (const c of chargeList) {
      const dx = x - c.x;
      const dy = y - c.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r < MIN_DIST) continue;
      V += COULOMB_K * c.q / r;
    }
    return V;
  }, []);

  // Trace a single field line using RK2 integration
  const traceFieldLine = useCallback((startX, startY, direction, chargeList, w, h) => {
    const points = [{ x: startX, y: startY }];
    let x = startX, y = startY;

    for (let i = 0; i < FIELD_LINE_MAX_STEPS; i++) {
      // RK2 (midpoint method)
      const { Ex: ex1, Ey: ey1 } = computeField(x, y, chargeList);
      const mag1 = Math.sqrt(ex1 * ex1 + ey1 * ey1);
      if (mag1 < 0.01) break;

      const dx1 = direction * ex1 / mag1 * FIELD_LINE_STEP;
      const dy1 = direction * ey1 / mag1 * FIELD_LINE_STEP;

      const xMid = x + dx1 * 0.5;
      const yMid = y + dy1 * 0.5;

      const { Ex: ex2, Ey: ey2 } = computeField(xMid, yMid, chargeList);
      const mag2 = Math.sqrt(ex2 * ex2 + ey2 * ey2);
      if (mag2 < 0.01) break;

      const dx2 = direction * ex2 / mag2 * FIELD_LINE_STEP;
      const dy2 = direction * ey2 / mag2 * FIELD_LINE_STEP;

      x += dx2;
      y += dy2;

      // Check bounds
      if (x < -20 || x > w + 20 || y < -20 || y > h + 20) break;

      // Check if we hit a charge
      let hitCharge = false;
      for (const c of chargeList) {
        const cdx = x - c.x;
        const cdy = y - c.y;
        if (cdx * cdx + cdy * cdy < CHARGE_RADIUS * CHARGE_RADIUS) {
          hitCharge = true;
          break;
        }
      }
      if (hitCharge) {
        points.push({ x, y });
        break;
      }

      points.push({ x, y });
    }
    return points;
  }, [computeField]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = Math.min(600, Math.max(400, w * 0.6));
        setCanvasSize({ width: w, height: h });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw everything
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const currentCharges = chargesRef.current;

    // Dark background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = 'rgba(48, 54, 61, 0.5)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (currentCharges.length === 0) {
      ctx.fillStyle = 'rgba(139, 148, 158, 0.6)';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click on the canvas to place charges', w / 2, h / 2);
      ctx.font = '14px sans-serif';
      ctx.fillText('Select charge type and magnitude using the controls below', w / 2, h / 2 + 30);
      return;
    }

    // Heat map
    if (showHeatMapRef.current && currentCharges.length > 0) {
      const resolution = 4;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let py = 0; py < h; py += resolution) {
        for (let px = 0; px < w; px += resolution) {
          const { Ex, Ey } = computeField(px, py, currentCharges);
          const mag = Math.sqrt(Ex * Ex + Ey * Ey);
          const normalized = Math.min(1, mag / 50);

          // Color: dark blue -> cyan -> yellow -> red
          let r, g, b;
          if (normalized < 0.25) {
            const t = normalized / 0.25;
            r = 10; g = Math.floor(20 + t * 80); b = Math.floor(60 + t * 140);
          } else if (normalized < 0.5) {
            const t = (normalized - 0.25) / 0.25;
            r = Math.floor(10 + t * 50); g = Math.floor(100 + t * 155); b = Math.floor(200 - t * 50);
          } else if (normalized < 0.75) {
            const t = (normalized - 0.5) / 0.25;
            r = Math.floor(60 + t * 195); g = Math.floor(255 - t * 40); b = Math.floor(150 - t * 130);
          } else {
            const t = (normalized - 0.75) / 0.25;
            r = 255; g = Math.floor(215 - t * 215); b = Math.floor(20 - t * 20);
          }

          for (let dy = 0; dy < resolution && py + dy < h; dy++) {
            for (let dx = 0; dx < resolution && px + dx < w; dx++) {
              const idx = ((py + dy) * w + (px + dx)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 140;
            }
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Equipotential lines
    if (showEquipotentialsRef.current && currentCharges.length > 0) {
      const resolution = 3;
      const potentialGrid = [];
      for (let py = 0; py < h; py += resolution) {
        const row = [];
        for (let px = 0; px < w; px += resolution) {
          row.push(computePotential(px, py, currentCharges));
        }
        potentialGrid.push(row);
      }

      // Draw contours at specific potential values
      const levels = [];
      for (let v = -200; v <= 200; v += 15) {
        if (v !== 0) levels.push(v);
      }

      ctx.lineWidth = 1;
      for (const level of levels) {
        const isPositive = level > 0;
        ctx.strokeStyle = isPositive
          ? `rgba(255, 120, 100, ${Math.min(0.6, 0.2 + Math.abs(level) / 400)})`
          : `rgba(100, 160, 255, ${Math.min(0.6, 0.2 + Math.abs(level) / 400)})`;
        ctx.beginPath();

        const rows = potentialGrid.length;
        const cols = potentialGrid[0].length;

        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            // Simple marching squares
            const tl = potentialGrid[j][i];
            const tr = potentialGrid[j][i + 1];
            const bl = potentialGrid[j + 1][i];
            const br = potentialGrid[j + 1][i + 1];

            const x0 = i * resolution;
            const y0 = j * resolution;

            const edges = [];

            // Check each edge for crossing
            if ((tl - level) * (tr - level) < 0) {
              const t = (level - tl) / (tr - tl);
              edges.push({ x: x0 + t * resolution, y: y0 });
            }
            if ((tr - level) * (br - level) < 0) {
              const t = (level - tr) / (br - tr);
              edges.push({ x: x0 + resolution, y: y0 + t * resolution });
            }
            if ((bl - level) * (br - level) < 0) {
              const t = (level - bl) / (br - bl);
              edges.push({ x: x0 + t * resolution, y: y0 + resolution });
            }
            if ((tl - level) * (bl - level) < 0) {
              const t = (level - tl) / (bl - tl);
              edges.push({ x: x0, y: y0 + t * resolution });
            }

            if (edges.length >= 2) {
              ctx.moveTo(edges[0].x, edges[0].y);
              ctx.lineTo(edges[1].x, edges[1].y);
            }
          }
        }
        ctx.stroke();
      }
    }

    // Field lines
    if (currentCharges.length > 0) {
      for (const charge of currentCharges) {
        const numLines = Math.round(Math.abs(charge.q) * FIELD_LINE_LINES_PER_UNIT_CHARGE);
        const direction = charge.q > 0 ? 1 : -1;

        for (let i = 0; i < numLines; i++) {
          const angle = (2 * Math.PI * i) / numLines;
          const startX = charge.x + Math.cos(angle) * (CHARGE_RADIUS + 2);
          const startY = charge.y + Math.sin(angle) * (CHARGE_RADIUS + 2);

          const points = traceFieldLine(startX, startY, direction, currentCharges, w, h);

          if (points.length < 2) continue;

          // Draw with glow
          ctx.save();
          ctx.shadowColor = charge.q > 0 ? 'rgba(255, 100, 80, 0.4)' : 'rgba(80, 160, 255, 0.4)';
          ctx.shadowBlur = 4;

          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let p = 1; p < points.length; p++) {
            ctx.lineTo(points[p].x, points[p].y);
          }

          // Gradient along the line
          const grad = ctx.createLinearGradient(
            points[0].x, points[0].y,
            points[points.length - 1].x, points[points.length - 1].y
          );
          if (charge.q > 0) {
            grad.addColorStop(0, 'rgba(255, 130, 100, 0.9)');
            grad.addColorStop(1, 'rgba(255, 130, 100, 0.15)');
          } else {
            grad.addColorStop(0, 'rgba(100, 170, 255, 0.9)');
            grad.addColorStop(1, 'rgba(100, 170, 255, 0.15)');
          }

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();

          // Draw arrowheads along the line
          const arrowInterval = 40;
          for (let p = arrowInterval; p < points.length - 2; p += arrowInterval) {
            const px = points[p].x;
            const py = points[p].y;
            const nx = points[p + 1].x;
            const ny = points[p + 1].y;
            const adx = nx - px;
            const ady = ny - py;
            const aMag = Math.sqrt(adx * adx + ady * ady);
            if (aMag < 0.1) continue;
            const ux = adx / aMag;
            const uy = ady / aMag;

            const progress = p / points.length;
            const alpha = Math.max(0.15, 0.8 - progress * 0.7);
            ctx.fillStyle = charge.q > 0
              ? `rgba(255, 130, 100, ${alpha})`
              : `rgba(100, 170, 255, ${alpha})`;

            ctx.beginPath();
            ctx.moveTo(px + ux * 5, py + uy * 5);
            ctx.lineTo(px - ux * 2 + uy * 3, py - uy * 2 - ux * 3);
            ctx.lineTo(px - ux * 2 - uy * 3, py - uy * 2 + ux * 3);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    // Field vector grid
    if (showFieldVectorsRef.current && currentCharges.length > 0) {
      for (let gx = GRID_SPACING; gx < w; gx += GRID_SPACING) {
        for (let gy = GRID_SPACING; gy < h; gy += GRID_SPACING) {
          // Skip near charges
          let nearCharge = false;
          for (const c of currentCharges) {
            if ((gx - c.x) ** 2 + (gy - c.y) ** 2 < (CHARGE_RADIUS + 10) ** 2) {
              nearCharge = true;
              break;
            }
          }
          if (nearCharge) continue;

          const { Ex, Ey } = computeField(gx, gy, currentCharges);
          const mag = Math.sqrt(Ex * Ex + Ey * Ey);
          if (mag < 0.1) continue;

          const ux = Ex / mag;
          const uy = Ey / mag;
          const len = Math.min(GRID_SPACING * 0.4, mag * 0.5 + 4);
          const alpha = Math.min(0.8, mag / 30 + 0.15);

          ctx.strokeStyle = `rgba(180, 220, 255, ${alpha})`;
          ctx.fillStyle = `rgba(180, 220, 255, ${alpha})`;
          ctx.lineWidth = 1;

          const x1 = gx - ux * len * 0.5;
          const y1 = gy - uy * len * 0.5;
          const x2 = gx + ux * len * 0.5;
          const y2 = gy + uy * len * 0.5;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Arrowhead
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - ux * ARROW_SIZE * 0.5 + uy * ARROW_SIZE * 0.3, y2 - uy * ARROW_SIZE * 0.5 - ux * ARROW_SIZE * 0.3);
          ctx.lineTo(x2 - ux * ARROW_SIZE * 0.5 - uy * ARROW_SIZE * 0.3, y2 - uy * ARROW_SIZE * 0.5 + ux * ARROW_SIZE * 0.3);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Draw charges
    for (let i = 0; i < currentCharges.length; i++) {
      const c = currentCharges[i];
      const isPositive = c.q > 0;

      // Glow
      const gradient = ctx.createRadialGradient(c.x, c.y, CHARGE_RADIUS * 0.5, c.x, c.y, CHARGE_RADIUS * 2.5);
      if (isPositive) {
        gradient.addColorStop(0, 'rgba(255, 80, 60, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 80, 60, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(60, 140, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(60, 140, 255, 0)');
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(c.x, c.y, CHARGE_RADIUS * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Charge body
      ctx.beginPath();
      ctx.arc(c.x, c.y, CHARGE_RADIUS, 0, Math.PI * 2);
      const bodyGrad = ctx.createRadialGradient(c.x - 4, c.y - 4, 2, c.x, c.y, CHARGE_RADIUS);
      if (isPositive) {
        bodyGrad.addColorStop(0, '#ff6b5b');
        bodyGrad.addColorStop(1, '#cc3322');
      } else {
        bodyGrad.addColorStop(0, '#5b9bff');
        bodyGrad.addColorStop(1, '#2255cc');
      }
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = isPositive ? '#ff8877' : '#77aaff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sign symbol
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPositive ? '+' : '\u2013', c.x, c.y);

      // Magnitude label
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(`${isPositive ? '+' : ''}${c.q}`, c.x, c.y + CHARGE_RADIUS + 14);
    }

    // Test charge
    const tc = testChargeRef.current;
    if (tc) {
      ctx.beginPath();
      ctx.arc(tc.x, tc.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#ffed4a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glow for test charge
      const tcGlow = ctx.createRadialGradient(tc.x, tc.y, 2, tc.x, tc.y, 15);
      tcGlow.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
      tcGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = tcGlow;
      ctx.beginPath();
      ctx.arc(tc.x, tc.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Trail
      if (tc.trail && tc.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(tc.trail[0].x, tc.trail[0].y);
        for (let t = 1; t < tc.trail.length; t++) {
          ctx.lineTo(tc.trail[t].x, tc.trail[t].y);
        }
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Voltage at cursor
    const cp = cursorPosRef.current;
    if (cp && currentCharges.length > 0) {
      const V = computePotential(cp.x, cp.y, currentCharges);
      const { Ex, Ey } = computeField(cp.x, cp.y, currentCharges);
      const Emag = Math.sqrt(Ex * Ex + Ey * Ey);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      const boxW = 170;
      const boxH = 44;
      const bx = Math.min(cp.x + 15, w - boxW - 5);
      const by = Math.max(cp.y - 50, 5);
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, boxW, boxH);

      ctx.fillStyle = '#e0e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`V = ${V.toFixed(1)} V`, bx + 8, by + 6);
      ctx.fillText(`|E| = ${Emag.toFixed(1)} N/C`, bx + 8, by + 24);
    }
  }, [computeField, computePotential, traceFieldLine]);

  // Animation loop for test charge
  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) return;

      const tc = testChargeRef.current;
      if (tc && chargesRef.current.length > 0) {
        const { Ex, Ey } = computeField(tc.x, tc.y, chargesRef.current);
        const mag = Math.sqrt(Ex * Ex + Ey * Ey);

        if (mag > 0.1) {
          const speed = Math.min(3, mag * 0.05 + 0.5);
          const nx = tc.x + (Ex / mag) * speed;
          const ny = tc.y + (Ey / mag) * speed;

          // Check bounds and if hit a charge
          const canvas = canvasRef.current;
          if (canvas && nx > 0 && nx < canvas.width && ny > 0 && ny < canvas.height) {
            let hit = false;
            for (const c of chargesRef.current) {
              if ((nx - c.x) ** 2 + (ny - c.y) ** 2 < CHARGE_RADIUS * CHARGE_RADIUS) {
                hit = true;
                break;
              }
            }
            if (!hit) {
              const trail = tc.trail ? [...tc.trail, { x: nx, y: ny }] : [{ x: tc.x, y: tc.y }, { x: nx, y: ny }];
              if (trail.length > 300) trail.shift();
              setTestCharge({ x: nx, y: ny, trail });
            }
          }
        }
      }

      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [draw, computeField]);

  // Mouse handlers
  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    const pos = getCanvasPos(e);

    // Check if clicking on a charge
    const currentCharges = chargesRef.current;
    for (let i = 0; i < currentCharges.length; i++) {
      const dx = pos.x - currentCharges[i].x;
      const dy = pos.y - currentCharges[i].y;
      if (dx * dx + dy * dy < CHARGE_RADIUS * CHARGE_RADIUS) {
        setDraggingIndex(i);
        return;
      }
    }

    // Place test charge
    if (testChargeMode) {
      setTestCharge({ x: pos.x, y: pos.y, trail: [] });
      return;
    }

    // Place new charge
    const q = selectedChargeType * chargeMagnitude;
    setCharges(prev => [...prev, { x: pos.x, y: pos.y, q }]);
  }, [getCanvasPos, selectedChargeType, chargeMagnitude, testChargeMode]);

  const handleMouseMove = useCallback((e) => {
    const pos = getCanvasPos(e);
    setCursorPos(pos);

    if (draggingIndexRef.current >= 0) {
      setCharges(prev => {
        const updated = [...prev];
        if (draggingIndexRef.current < updated.length) {
          updated[draggingIndexRef.current] = { ...updated[draggingIndexRef.current], x: pos.x, y: pos.y };
        }
        return updated;
      });
    }
  }, [getCanvasPos]);

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(-1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursorPos(null);
    setDraggingIndex(-1);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const syntheticEvent = { clientX: touch.clientX, clientY: touch.clientY };
    handleMouseDown(syntheticEvent);
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const syntheticEvent = { clientX: touch.clientX, clientY: touch.clientY };
    handleMouseMove(syntheticEvent);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  // Presets
  const applyPreset = useCallback((name) => {
    const w = canvasSize.width;
    const h = canvasSize.height;
    const cx = w / 2;
    const cy = h / 2;
    setTestCharge(null);

    switch (name) {
      case 'dipole':
        setCharges([
          { x: cx - 80, y: cy, q: 2 },
          { x: cx + 80, y: cy, q: -2 },
        ]);
        break;
      case 'parallel':
        setCharges([
          { x: cx - 120, y: cy - 100, q: 3 },
          { x: cx - 120, y: cy - 50, q: 3 },
          { x: cx - 120, y: cy, q: 3 },
          { x: cx - 120, y: cy + 50, q: 3 },
          { x: cx - 120, y: cy + 100, q: 3 },
          { x: cx + 120, y: cy - 100, q: -3 },
          { x: cx + 120, y: cy - 50, q: -3 },
          { x: cx + 120, y: cy, q: -3 },
          { x: cx + 120, y: cy + 50, q: -3 },
          { x: cx + 120, y: cy + 100, q: -3 },
        ]);
        break;
      case 'quadrupole':
        setCharges([
          { x: cx - 70, y: cy - 70, q: 2 },
          { x: cx + 70, y: cy - 70, q: -2 },
          { x: cx - 70, y: cy + 70, q: -2 },
          { x: cx + 70, y: cy + 70, q: 2 },
        ]);
        break;
      case 'point':
        setCharges([
          { x: cx, y: cy, q: 3 },
        ]);
        break;
      default:
        break;
    }
  }, [canvasSize]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Controls */}
      <div className="bg-gray-900 rounded-t-xl p-4 flex flex-wrap gap-4 items-center border border-gray-700 border-b-0">
        {/* Charge type toggle */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm font-medium">Charge:</span>
          <button
            onClick={() => { setSelectedChargeType(1); setTestChargeMode(false); }}
            className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
              selectedChargeType === 1 && !testChargeMode
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            + Positive
          </button>
          <button
            onClick={() => { setSelectedChargeType(-1); setTestChargeMode(false); }}
            className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
              selectedChargeType === -1 && !testChargeMode
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            - Negative
          </button>
        </div>

        {/* Magnitude slider */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm font-medium">Magnitude:</span>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={chargeMagnitude}
            onChange={(e) => setChargeMagnitude(parseInt(e.target.value))}
            className="w-20 accent-yellow-500"
          />
          <span className="text-yellow-400 text-sm font-mono w-4">{chargeMagnitude}</span>
        </div>

        {/* Test charge */}
        <button
          onClick={() => setTestChargeMode(!testChargeMode)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            testChargeMode
              ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/50'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Test Charge
        </button>

        {/* Clear */}
        <button
          onClick={() => { setCharges([]); setTestCharge(null); }}
          className="px-3 py-1.5 rounded text-sm font-medium bg-gray-700 text-gray-300 hover:bg-red-700 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative border-x border-gray-700">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full block cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-900 rounded-b-xl p-4 flex flex-wrap gap-4 items-center border border-gray-700 border-t-0">
        {/* Presets */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm font-medium">Presets:</span>
          <button onClick={() => applyPreset('dipole')} className="px-2.5 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300 hover:bg-purple-700 hover:text-white transition-colors">Dipole</button>
          <button onClick={() => applyPreset('parallel')} className="px-2.5 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300 hover:bg-purple-700 hover:text-white transition-colors">Parallel Plates</button>
          <button onClick={() => applyPreset('quadrupole')} className="px-2.5 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300 hover:bg-purple-700 hover:text-white transition-colors">Quadrupole</button>
          <button onClick={() => applyPreset('point')} className="px-2.5 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300 hover:bg-purple-700 hover:text-white transition-colors">Point Charge</button>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-3 ml-auto">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showFieldVectors}
              onChange={(e) => setShowFieldVectors(e.target.checked)}
              className="accent-cyan-500"
            />
            <span className="text-gray-300 text-sm">Vectors</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showEquipotentials}
              onChange={(e) => setShowEquipotentials(e.target.checked)}
              className="accent-cyan-500"
            />
            <span className="text-gray-300 text-sm">Equipotentials</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHeatMap}
              onChange={(e) => setShowHeatMap(e.target.checked)}
              className="accent-cyan-500"
            />
            <span className="text-gray-300 text-sm">Heat Map</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ElectromagneticFieldsVisualizer;
