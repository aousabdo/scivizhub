import React, { useState, useEffect, useRef } from 'react';
import { 
  applyTransformation, 
  generateGrid, 
  generateUnitCircle, 
  generateUnitCube, 
  interpolateMatrices,
  presetTransformations
} from './matrixTransformationUtils';

const MatrixTransformationVisualizer = () => {
  // State for 2D/3D mode
  const [mode, setMode] = useState('2d'); // '2d' or '3d'
  
  // Matrix state
  const [matrix2D, setMatrix2D] = useState([
    [1, 0],
    [0, 1]
  ]);
  
  const [matrix3D, setMatrix3D] = useState([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]);
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // milliseconds
  const [showUnitShape, setShowUnitShape] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  
  // Transformation sequence
  const [transformationSequence, setTransformationSequence] = useState([]);
  const [currentTransformationIndex, setCurrentTransformationIndex] = useState(0);
  
  // Visualization elements
  const [grid, setGrid] = useState([]);
  const [unitShape, setUnitShape] = useState([]);
  const [basisVectors, setBasisVectors] = useState({
    x: mode === '2d' ? [1, 0] : [1, 0, 0],
    y: mode === '2d' ? [0, 1] : [0, 1, 0],
    z: mode === '3d' ? [0, 0, 1] : null
  });
  
  // Canvas refs
  const canvasRef = useRef(null);
  const animationTimerRef = useRef(null);
  
  // Set up initial visualization
  useEffect(() => {
    setupVisualization();
    
    // Clean up animation timers on unmount
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [mode]);
  
  // Update visualization when matrix changes
  useEffect(() => {
    updateVisualization();
  }, [matrix2D, matrix3D, showGrid, showUnitShape, showAxes, showVectors, mode]);
  
  // Set up the visualization based on mode
 // Setup visualization function with error handling
const setupVisualization = () => {
    try {
      const newGrid = generateGrid(mode);
      
      // Safety check for generated grid
      if (!newGrid || !Array.isArray(newGrid) || newGrid.length === 0) {
        console.error("Generated grid is invalid:", newGrid);
        setGrid([]);
        return;
      }
      
      setGrid(newGrid);
      
      if (mode === '2d') {
        const unitCircle = generateUnitCircle();
        setUnitShape(unitCircle || []);
        setBasisVectors({
          x: [1, 0],
          y: [0, 1],
          z: null
        });
      } else {
        const unitCube = generateUnitCube();
        setUnitShape(unitCube || []);
        setBasisVectors({
          x: [1, 0, 0],
          y: [0, 1, 0],
          z: [0, 0, 1]
        });
      }
      
      // Reset transformations
      setTransformationSequence([]);
      setCurrentTransformationIndex(0);
      
      // Draw initial state - but wrap in setTimeout to ensure state is updated
      setTimeout(() => {
        updateVisualization();
      }, 0);
    } catch (error) {
      console.error("Error in setupVisualization:", error);
    }
  };
  
  // Update the visualization based on current matrix
  const updateVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("Canvas ref is null");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set origin to center of canvas
    ctx.save();
    ctx.translate(width / 2, height / 2);
    
    // In 2D mode, flip Y axis to make positive Y go upward
    if (mode === '2d') {
      ctx.scale(1, -1);
    }
    
    // Scale for better visualization
    const scaleFactor = Math.min(width, height) / 5;
    ctx.scale(scaleFactor, scaleFactor);
    
    // Draw coordinate grid if enabled and grid is valid
    if (showGrid && grid && Array.isArray(grid) && grid.length > 0) {
      drawGrid(ctx, grid);
    }
    
    // Rest of the function remains the same...
    
    ctx.restore();
  };
  
  // Draw the coordinate grid
// Updated drawGrid function with more robust error handling
const drawGrid = (ctx, gridPoints) => {
    // Guard against undefined or empty grid
    if (!ctx || !gridPoints || !Array.isArray(gridPoints) || gridPoints.length === 0) {
      console.warn("Invalid grid or context for drawing");
      return;
    }
  
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.02;
    
    if (mode === '2d') {
      // Draw grid lines for 2D
      // Make sure we have pairs of points for lines
      for (let i = 0; i < gridPoints.length - 1; i += 2) {
        // Safety check to ensure both points exist and have coordinates
        if (!gridPoints[i] || !gridPoints[i+1] || 
            !Array.isArray(gridPoints[i]) || !Array.isArray(gridPoints[i+1]) ||
            gridPoints[i].length < 2 || gridPoints[i+1].length < 2) {
          continue; // Skip this pair if data is incomplete
        }
        
        ctx.beginPath();
        ctx.moveTo(gridPoints[i][0], gridPoints[i][1]);
        ctx.lineTo(gridPoints[i+1][0], gridPoints[i+1][1]);
        ctx.stroke();
      }
    } else {
      // In 3D mode, project and draw grid with depth cues
      // This is a simplified approach - a proper 3D renderer would be better
      
      // Safety check: ensure sortedPoints is an array we can use
      let sortedPoints = [];
      try {
        // Only include valid 3D points (with x, y, z coordinates)
        sortedPoints = gridPoints.filter(point => 
          Array.isArray(point) && point.length >= 3
        ).sort((a, b) => a[2] - b[2]);
      } catch (error) {
        console.error("Error sorting grid points:", error);
        return;
      }
      
      // Draw lines if we have enough points
      for (let i = 0; i < sortedPoints.length - 1; i += 2) {
        if (!sortedPoints[i] || !sortedPoints[i+1]) continue;
        
        const startPoint = sortedPoints[i];
        const endPoint = sortedPoints[i+1];
        
        // Simple orthographic projection
        const alpha = 0.5 + (0.5 * (startPoint[2] + 1) / 2); // Depth-based opacity
        
        ctx.strokeStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(startPoint[0], startPoint[1]);
        ctx.lineTo(endPoint[0], endPoint[1]);
        ctx.stroke();
      }
    }
  };
  
  // Draw coordinate axes
  const drawAxes = (ctx) => {
    // X axis (red)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(2, 0);
    ctx.stroke();
    
    // Y axis (green)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, 2);
    ctx.stroke();
    
    if (mode === '3d') {
      // Z axis (blue) - simplified for 2D canvas
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(1, 1);
      ctx.stroke();
    }
  };
  
  // Draw a shape (unit circle/cube)
  const drawShape = (ctx, points, fillColor, strokeColor) => {
    if (mode === '2d') {
      // Draw unit circle
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.03;
      
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Draw unit cube (simplified for 2D canvas)
      const edgePairs = [
        [0, 1], [1, 3], [3, 2], [2, 0], // Bottom face
        [4, 5], [5, 7], [7, 6], [6, 4], // Top face
        [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
      ];
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.03;
      
      for (const [i, j] of edgePairs) {
        // Simple depth cue - points with higher z-coordinate are drawn with higher opacity
        const depth = (points[i][2] + points[j][2] + 2) / 4; // Normalize to [0,1]
        const alpha = 0.3 + 0.7 * depth;
        
        ctx.strokeStyle = `rgba(75, 192, 192, ${alpha})`;
        
        ctx.beginPath();
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.lineTo(points[j][0], points[j][1]);
        ctx.stroke();
      }
    }
  };
  
  // Draw transformed basis vectors
  const drawBasisVectors = (ctx) => {
    const matrix = mode === '2d' ? matrix2D : matrix3D;
    
    // Apply transformation to basis vectors
    let transformedX, transformedY, transformedZ;
    
    if (mode === '2d') {
      transformedX = [matrix[0][0], matrix[1][0]];
      transformedY = [matrix[0][1], matrix[1][1]];
    } else {
      transformedX = [matrix[0][0], matrix[1][0], matrix[2][0]];
      transformedY = [matrix[0][1], matrix[1][1], matrix[2][1]];
      transformedZ = [matrix[0][2], matrix[1][2], matrix[2][2]];
    }
    
    // Draw X basis vector
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 0.08;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(transformedX[0], transformedX[1]);
    ctx.stroke();
    
    // Draw Y basis vector
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(transformedY[0], transformedY[1]);
    ctx.stroke();
    
    // Draw Z basis vector in 3D mode
    if (mode === '3d') {
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(transformedZ[0], transformedZ[1]);
      ctx.stroke();
    }
    
    // Draw vector labels
    ctx.fillStyle = 'red';
    ctx.fillText('x', transformedX[0], transformedX[1]);
    ctx.fillStyle = 'green';
    ctx.fillText('y', transformedY[0], transformedY[1]);
    if (mode === '3d') {
      ctx.fillStyle = 'blue';
      ctx.fillText('z', transformedZ[0], transformedZ[1]);
    }
  };
  
  // Handle matrix input change
  const handleMatrixChange = (value, rowIdx, colIdx) => {
    const parsedValue = parseFloat(value) || 0;
    
    if (mode === '2d') {
      const newMatrix = [...matrix2D];
      newMatrix[rowIdx][colIdx] = parsedValue;
      setMatrix2D(newMatrix);
    } else {
      const newMatrix = [...matrix3D];
      newMatrix[rowIdx][colIdx] = parsedValue;
      setMatrix3D(newMatrix);
    }
  };
  
  // Reset matrix to identity
  const resetMatrix = () => {
    if (mode === '2d') {
      setMatrix2D([
        [1, 0],
        [0, 1]
      ]);
    } else {
      setMatrix3D([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]);
    }
  };
  
  // Apply a preset transformation
  const applyPreset = (presetName) => {
    const preset = presetTransformations[mode][presetName];
    if (!preset) return;
    
    if (mode === '2d') {
      setMatrix2D(preset);
    } else {
      setMatrix3D(preset);
    }
  };
  
  // Add current matrix to transformation sequence
  const addToSequence = () => {
    const currentMatrix = mode === '2d' ? matrix2D : matrix3D;
    setTransformationSequence(prev => [...prev, currentMatrix]);
  };
  
  // Remove last transformation from sequence
  const removeLastFromSequence = () => {
    setTransformationSequence(prev => prev.slice(0, -1));
  };
  
  // Clear transformation sequence
  const clearSequence = () => {
    setTransformationSequence([]);
  };
  
  // Start animation through transformation sequence
  const animateSequence = () => {
    if (isAnimating) {
      stopAnimation();
      return;
    }
    
    if (transformationSequence.length < 2) {
      alert('Add at least two transformations to the sequence to animate.');
      return;
    }
    
    setIsAnimating(true);
    setCurrentTransformationIndex(0);
    
    // Reset to first matrix in sequence
    if (mode === '2d') {
      setMatrix2D(transformationSequence[0]);
    } else {
      setMatrix3D(transformationSequence[0]);
    }
    
    animateNextStep();
  };
  
  // Animate transition to next matrix in sequence
  const animateNextStep = () => {
    if (currentTransformationIndex >= transformationSequence.length - 1) {
      setIsAnimating(false);
      return;
    }
    
    const startMatrix = transformationSequence[currentTransformationIndex];
    const endMatrix = transformationSequence[currentTransformationIndex + 1];
    const totalSteps = 30; // Number of frames for smooth animation
    
    let stepCount = 0;
    
    const performStep = () => {
      const progress = stepCount / totalSteps;
      const interpolatedMatrix = interpolateMatrices(startMatrix, endMatrix, progress, mode);
      
      if (mode === '2d') {
        setMatrix2D(interpolatedMatrix);
      } else {
        setMatrix3D(interpolatedMatrix);
      }
      
      stepCount++;
      
      if (stepCount <= totalSteps) {
        animationTimerRef.current = setTimeout(performStep, animationSpeed / totalSteps);
      } else {
        setCurrentTransformationIndex(prev => prev + 1);
        
        if (currentTransformationIndex < transformationSequence.length - 2) {
          animationTimerRef.current = setTimeout(animateNextStep, animationSpeed / 2);
        } else {
          setIsAnimating(false);
        }
      }
    };
    
    performStep();
  };
  
  // Stop animation
  const stopAnimation = () => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    setIsAnimating(false);
  };
  
  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 500; // Fixed height, adjust as needed
        updateVisualization();
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateVisualization]);
  
  // Format matrix for display
  const formatMatrix = (value) => {
    return value.toFixed(2);
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Matrix Transformation Visualizer</h2>
            <p className="text-gray-600">
              Explore how matrices transform space by visualizing various linear transformations.
            </p>
          </div>
          
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <button
              onClick={() => setMode(mode === '2d' ? '3d' : '2d')}
              className="px-4 py-2 bg-purple-500 text-white rounded-md font-medium hover:bg-purple-600 transition-colors"
            >
              Switch to {mode === '2d' ? '3D' : '2D'} Mode
            </button>
            
            <button
              onClick={resetMatrix}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              Reset Matrix
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="canvas-container bg-gray-50 border rounded-md overflow-hidden">
              <canvas ref={canvasRef} className="w-full"></canvas>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={() => setShowGrid(!showGrid)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Show Grid</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnitShape}
                  onChange={() => setShowUnitShape(!showUnitShape)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Show Unit {mode === '2d' ? 'Circle' : 'Cube'}</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showAxes}
                  onChange={() => setShowAxes(!showAxes)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Show Axes</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={() => setShowVectors(!showVectors)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Show Basis Vectors</span>
              </label>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="text-lg font-semibold mb-3">Transformation Matrix</h3>
              
              {mode === '2d' ? (
                <div className="matrix-input space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={matrix2D[0][0]}
                      onChange={(e) => handleMatrixChange(e.target.value, 0, 0)}
                      className="w-16 p-2 border rounded-md"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={matrix2D[0][1]}
                      onChange={(e) => handleMatrixChange(e.target.value, 0, 1)}
                      className="w-16 p-2 border rounded-md"
                      step="0.1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={matrix2D[1][0]}
                      onChange={(e) => handleMatrixChange(e.target.value, 1, 0)}
                      className="w-16 p-2 border rounded-md"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={matrix2D[1][1]}
                      onChange={(e) => handleMatrixChange(e.target.value, 1, 1)}
                      className="w-16 p-2 border rounded-md"
                      step="0.1"
                    />
                  </div>
                </div>
              ) : (
                <div className="matrix-input space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={matrix3D[0][0]}
                      onChange={(e) => handleMatrixChange(e.target.value, 0, 0)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={matrix3D[0][1]}
                      onChange={(e) => handleMatrixChange(e.target.value, 0, 1)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={matrix3D[0][2]}
                      onChange={(e) => handleMatrixChange(e.target.value, 0, 2)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={matrix3D[1][0]}
                      onChange={(e) => handleMatrixChange(e.target.value, 1, 0)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={matrix3D[1][1]}
                      onChange={(e) => handleMatrixChange(e.target.value, 1, 1)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={matrix3D[1][2]}
                      onChange={(e) => handleMatrixChange(e.target.value, 1, 2)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={matrix3D[2][0]}
                      onChange={(e) => handleMatrixChange(e.target.value, 2, 0)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={matrix3D[2][1]}
                      onChange={(e) => handleMatrixChange(e.target.value, 2, 1)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={matrix3D[2][2]}
                      onChange={(e) => handleMatrixChange(e.target.value, 2, 2)}
                      className="w-12 p-1 border rounded-md"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-semibold mt-6 mb-3">Preset Transformations</h3>
              <div className="grid grid-cols-2 gap-2">
                {mode === '2d' ? (
                  <>
                    <button 
                      onClick={() => applyPreset('identity')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Identity
                    </button>
                    <button 
                      onClick={() => applyPreset('scale2x')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Scale 2×
                    </button>
                    <button 
                      onClick={() => applyPreset('reflection')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Reflection
                    </button>
                    <button 
                      onClick={() => applyPreset('rotation45')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Rotate 45°
                    </button>
                    <button 
                      onClick={() => applyPreset('shearX')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Shear X
                    </button>
                    <button 
                      onClick={() => applyPreset('shearY')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Shear Y
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => applyPreset('identity')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Identity
                    </button>
                    <button 
                      onClick={() => applyPreset('scale2x')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Scale 2×
                    </button>
                    <button 
                      onClick={() => applyPreset('rotateX')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Rotate X
                    </button>
                    <button 
                      onClick={() => applyPreset('rotateY')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Rotate Y
                    </button>
                    <button 
                      onClick={() => applyPreset('rotateZ')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Rotate Z
                    </button>
                    <button 
                      onClick={() => applyPreset('shear')}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Shear
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md border">
          <h3 className="text-lg font-semibold mb-3">Transformation Sequence</h3>
          
          <div className="flex space-x-2 mb-4">
            <button
              onClick={addToSequence}
              className="px-4 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors"
            >
              Add Current Matrix
            </button>
            
            <button
              onClick={removeLastFromSequence}
              className="px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors"
              disabled={transformationSequence.length === 0}
            >
              Remove Last
            </button>
            
            <button
              onClick={clearSequence}
              className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors"
              disabled={transformationSequence.length === 0}
            >
              Clear All
            </button>
            
            <button
              onClick={animateSequence}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isAnimating 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              disabled={transformationSequence.length < 2}
            >
              {isAnimating ? 'Stop Animation' : 'Animate Sequence'}
            </button>
          </div>
          
          <div className="animation-speed">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animation Speed: {animationSpeed}ms
            </label>
            <input
              type="range"
              min="200"
              max="3000"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="sequence-display mt-4">
            <h4 className="font-medium mb-2">Sequence ({transformationSequence.length} matrices):</h4>
            <div className="flex flex-wrap gap-4">
              {transformationSequence.map((matrix, index) => (
                <div 
                  key={index} 
                  className={`p-2 border rounded-md ${
                    index === currentTransformationIndex && isAnimating 
                      ? 'bg-yellow-100 border-yellow-400' 
                      : 'bg-white'
                  }`}
                >
                  <div className="text-xs font-mono">
                    {matrix.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex space-x-2">
                        {row.map((value, colIdx) => (
                          <span key={colIdx} className="w-10 text-center">
                            {formatMatrix(value)}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {transformationSequence.length === 0 && (
                <p className="text-gray-500 italic">Add matrices to create a sequence for animation.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Understanding Matrix Transformations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h4 className="font-semibold text-lg mb-2">Basic Transformations</h4>
            <ul className="space-y-2 list-disc pl-6">
              <li><strong>Scaling:</strong> Changes the size of shapes</li>
              <li><strong>Rotation:</strong> Rotates shapes around the origin</li>
              <li><strong>Reflection:</strong> Mirrors shapes across an axis</li>
              <li><strong>Shearing:</strong> Slants shapes in one direction</li>
              <li><strong>Translation:</strong> Moves shapes (requires homogeneous coordinates)</li>
            </ul>
            
            <p className="mt-4">
              A {mode === '2d' ? '2×2' : '3×3'} matrix transforms a point by matrix multiplication.
              The columns of the matrix represent where the unit basis vectors are sent.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Matrix Properties</h4>
            <ul className="space-y-2 list-disc pl-6">
              <li><strong>Determinant:</strong> Measures the scaling of area/volume</li>
              <li><strong>Eigenvalues:</strong> Directions that are only scaled, not rotated</li>
              <li><strong>Orthogonal matrices:</strong> Preserve angles and distances</li>
              <li><strong>Singular matrices:</strong> Collapse dimensions (non-invertible)</li>
            </ul>
            
            <p className="mt-4">
              Matrix composition (applying multiple transformations) is done by multiplying the matrices together.
              The order of multiplication matters!
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-lg mb-2">Applications</h4>
          <p className="mb-2">
            Matrix transformations are fundamental in many fields:
          </p>
          <ul className="list-disc pl-6 grid grid-cols-1 md:grid-cols-2 gap-2">
            <li>Computer graphics and animation</li>
            <li>Robotics and computer vision</li>
            <li>Physics simulations</li>
            <li>Data analysis and machine learning</li>
            <li>Engineering and structural analysis</li>
            <li>Game development</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatrixTransformationVisualizer;