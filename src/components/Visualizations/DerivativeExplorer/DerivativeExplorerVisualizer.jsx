import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  evaluateFunction,
  evaluateDerivative,
  getFunctionLabel,
  getFunctionExpression,
  calculateTangentLine,
  calculateSecantLine,
  FUNCTIONS
} from './derivativeExplorerUtils';
import './DerivativeExplorerVisualizer.css';

/**
 * DerivativeExplorerVisualizer - Interactive visualization for exploring derivatives geometrically
 * 
 * This component visualizes the geometric interpretation of derivatives as the slope
 * of the tangent line to a curve at a specific point. Users can interact with the
 * visualization by dragging a point along various functions, toggling between different
 * function types, and exploring the relationship between secant lines and tangent lines.
 */
const DerivativeExplorerVisualizer = () => {
  // SVG dimensions and margins
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  // Refs for the SVG and axes
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  // State variables for interactive elements
  const [selectedFunction, setSelectedFunction] = useState('quadratic');
  const [xValue, setXValue] = useState(0.5);
  const [deltaX, setDeltaX] = useState(1);
  const [showSecantLine, setShowSecantLine] = useState(true);
  const [showDerivativeValue, setShowDerivativeValue] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  
  // Calculate domain based on zoom level
  const getDomain = () => {
    const baseDomain = [-5, 5];
    const zoomFactor = 1 / zoomLevel;
    return [baseDomain[0] * zoomFactor, baseDomain[1] * zoomFactor];
  };

  // Set up the visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Make the SVG responsive
    const containerWidth = containerRef.current.clientWidth;
    const scale = containerWidth / (width + margin.left + margin.right);
    const scaledHeight = (height + margin.top + margin.bottom) * scale;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create the SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", scaledHeight)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const domain = getDomain();
    const xScale = d3.scaleLinear()
      .domain(domain)
      .range([0, width]);
    
    const yDomain = domain.map(x => evaluateFunction(selectedFunction, x));
    const yMin = Math.min(yDomain[0], yDomain[1], -5 / zoomLevel);
    const yMax = Math.max(yDomain[0], yDomain[1], 5 / zoomLevel);
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    // Add axes to the SVG
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height/2})`)
      .call(xAxis);
    
    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${width/2},0)`)
      .call(yAxis);
    
    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis.tickSize(-height).tickFormat(""));
    
    svg.append("g")
      .attr("class", "grid")
      .call(yAxis.tickSize(-width).tickFormat(""));
    
    // Create the function curve
    const line = d3.line()
      .x(d => xScale(d))
      .y(d => yScale(evaluateFunction(selectedFunction, d)))
      .curve(d3.curveNatural);
    
    // Generate points for the curve
    const curvePoints = d3.range(domain[0], domain[1], 0.1);
    
    // Add the function curve
    svg.append("path")
      .datum(curvePoints)
      .attr("class", "function-curve")
      .attr("fill", "none")
      .attr("stroke", "#4a90e2")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add the point of tangency
    const tangentPointX = xValue;
    const tangentPointY = evaluateFunction(selectedFunction, tangentPointX);
    
    // Calculate the tangent line
    const tangentLine = calculateTangentLine(selectedFunction, tangentPointX);
    
    // Calculate the secant line if showSecantLine is true
    let secantLine;
    if (showSecantLine) {
      secantLine = calculateSecantLine(selectedFunction, tangentPointX, deltaX);
    }
    
    // Add the secant line if showSecantLine is true
    if (showSecantLine && secantLine) {
      // Generate points for the secant line
      const secantX1 = tangentPointX;
      const secantY1 = tangentPointY;
      const secantX2 = tangentPointX + deltaX;
      const secantY2 = evaluateFunction(selectedFunction, secantX2);
      
      svg.append("line")
        .attr("class", "secant-line")
        .attr("x1", xScale(secantX1))
        .attr("y1", yScale(secantY1))
        .attr("x2", xScale(secantX2))
        .attr("y2", yScale(secantY2))
        .attr("stroke", "#ff7f0e")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      // Add the point at the end of the secant line
      svg.append("circle")
        .attr("class", "secant-point")
        .attr("cx", xScale(secantX2))
        .attr("cy", yScale(secantY2))
        .attr("r", 5)
        .attr("fill", "#ff7f0e");

      // Label the secant slope
      svg.append("text")
        .attr("class", "secant-label")
        .attr("x", xScale((secantX1 + secantX2) / 2) + 10)
        .attr("y", yScale((secantY1 + secantY2) / 2) - 10)
        .attr("fill", "#ff7f0e")
        .text(`Secant slope: ${secantLine.slope.toFixed(2)}`);
    }
    
    // Add the tangent line
    if (tangentLine) {
      // Calculate points for the tangent line
      const tangentX1 = tangentPointX - 2 / zoomLevel;
      const tangentY1 = tangentLine.slope * (tangentX1 - tangentPointX) + tangentPointY;
      const tangentX2 = tangentPointX + 2 / zoomLevel;
      const tangentY2 = tangentLine.slope * (tangentX2 - tangentPointX) + tangentPointY;
      
      svg.append("line")
        .attr("class", "tangent-line")
        .attr("x1", xScale(tangentX1))
        .attr("y1", yScale(tangentY1))
        .attr("x2", xScale(tangentX2))
        .attr("y2", yScale(tangentY2))
        .attr("stroke", "#2ca02c")
        .attr("stroke-width", 2);
      
      // Add the point of tangency
      svg.append("circle")
        .attr("class", "tangent-point")
        .attr("cx", xScale(tangentPointX))
        .attr("cy", yScale(tangentPointY))
        .attr("r", 6)
        .attr("fill", "#2ca02c")
        .attr("cursor", "grab")
        .call(d3.drag()
          .on("start", () => setDragActive(true))
          .on("drag", (event) => {
            const newX = xScale.invert(event.x);
            if (newX >= domain[0] && newX <= domain[1]) {
              setXValue(newX);
            }
          })
          .on("end", () => setDragActive(false))
        );

      // Label the tangent slope (derivative value)
      if (showDerivativeValue) {
        svg.append("text")
          .attr("class", "tangent-label")
          .attr("x", xScale(tangentPointX) + 10)
          .attr("y", yScale(tangentPointY) - 20)
          .attr("fill", "#2ca02c")
          .text(`f'(${tangentPointX.toFixed(2)}) = ${tangentLine.slope.toFixed(2)}`);
      }
    }
    
    // Add equation and current value display
    svg.append("text")
      .attr("class", "equation-label")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "16px")
      .text(`f(x) = ${getFunctionExpression(selectedFunction)}`);
    
    // Add axis labels
    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 2)
      .attr("text-anchor", "middle")
      .text("x");
    
    svg.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left / 2)
      .attr("text-anchor", "middle")
      .text("f(x)");
    
  }, [selectedFunction, xValue, deltaX, showSecantLine, showDerivativeValue, zoomLevel, width, height]);

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 10));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };

  // Reset all parameters
  const handleReset = () => {
    setXValue(0.5);
    setDeltaX(1);
    setZoomLevel(1);
    setShowSecantLine(true);
    setShowDerivativeValue(true);
  };

  return (
    <div className="derivative-explorer" ref={containerRef}>
      <div className="controls-panel">
        <div className="control-section">
          <label className="control-label">Function</label>
          <div className="radio-group">
            {Object.keys(FUNCTIONS).map(funcKey => (
              <label key={funcKey} className="radio-label">
                <input 
                  type="radio" 
                  name="function-type" 
                  value={funcKey} 
                  checked={selectedFunction === funcKey}
                  onChange={() => setSelectedFunction(funcKey)}
                />
                {getFunctionLabel(funcKey)}
              </label>
            ))}
          </div>
        </div>
        
        <div className="slider-controls">
          <div className="slider-container">
            <label htmlFor="point-position">Point Position (x = {xValue.toFixed(2)})</label>
            <input
              id="point-position"
              type="range"
              min="-5"
              max="5"
              step="0.01"
              value={xValue}
              onChange={(e) => setXValue(parseFloat(e.target.value))}
              disabled={dragActive}
              className="slider"
            />
          </div>
          
          <div className="slider-container">
            <label htmlFor="secant-dx">Secant Line Δx = {deltaX.toFixed(2)}</label>
            <input
              id="secant-dx"
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              value={deltaX}
              onChange={(e) => setDeltaX(parseFloat(e.target.value))}
              disabled={!showSecantLine}
              className="slider"
            />
          </div>
        </div>
        
        <div className="button-controls">
          <div className="button-group">
            <button 
              onClick={handleZoomIn}
              className="control-button"
            >
              Zoom In
            </button>
            <button 
              onClick={handleZoomOut}
              className="control-button"
            >
              Zoom Out
            </button>
            <button 
              onClick={handleReset}
              className="control-button"
            >
              Reset
            </button>
          </div>
          
          <div className="toggle-buttons">
            <button 
              onClick={() => setShowSecantLine(!showSecantLine)}
              className={`toggle-button ${showSecantLine ? 'active' : ''}`}
            >
              {showSecantLine ? "Hide Secant Line" : "Show Secant Line"}
            </button>
            
            <button 
              onClick={() => setShowDerivativeValue(!showDerivativeValue)}
              className={`toggle-button ${showDerivativeValue ? 'active' : ''}`}
            >
              {showDerivativeValue ? "Hide Derivative Value" : "Show Derivative Value"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="visualization-card">
        <svg ref={svgRef}></svg>
      </div>

      <div className="function-info">
        <div className="info-item">
          <span className="info-label">Current Point:</span>
          <span className="info-value">({xValue.toFixed(2)}, {evaluateFunction(selectedFunction, xValue).toFixed(2)})</span>
        </div>
        <div className="info-item">
          <span className="info-label">Derivative value at x = {xValue.toFixed(2)}:</span>
          <span className="info-value">{evaluateDerivative(selectedFunction, xValue).toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};

export default DerivativeExplorerVisualizer;