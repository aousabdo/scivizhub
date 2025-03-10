/**
 * Utility functions for Matrix Transformation Visualization
 */

// Generate grid for visualization
export const generateGrid = (mode) => {
    const grid = [];
    
    try {
      // 2D grid with coordinate lines
      if (mode === '2d') {
        // Generate horizontal lines
        for (let y = -2; y <= 2; y += 0.5) {
          grid.push([-2, y], [2, y]);
        }
        
        // Generate vertical lines
        for (let x = -2; x <= 2; x += 0.5) {
          grid.push([x, -2], [x, 2]);
        }
      } else {
        // 3D grid with coordinate planes
        // XY plane
        for (let x = -1; x <= 1; x += 0.5) {
          for (let y = -1; y <= 1; y += 0.5) {
            // Add points for a grid rather than individual points
            if (x === -1 || x === 1 || y === -1 || y === 1 || x === 0 || y === 0) {
              // Create line segments instead of points
              if (x === -1 || x === 1 || x === 0) {
                grid.push([x, -1, 0], [x, 1, 0]);
              }
              if (y === -1 || y === 1 || y === 0) {
                grid.push([-1, y, 0], [1, y, 0]);
              }
            }
          }
        }
        
        // XZ plane - simplified to reduce complexity
        for (let x = -1; x <= 1; x += 0.5) {
          grid.push([x, 0, -1], [x, 0, 1]);
        }
        for (let z = -1; z <= 1; z += 0.5) {
          grid.push([-1, 0, z], [1, 0, z]);
        }
        
        // YZ plane - simplified to reduce complexity
        for (let y = -1; y <= 1; y += 0.5) {
          grid.push([0, y, -1], [0, y, 1]);
        }
        for (let z = -1; z <= 1; z += 0.5) {
          grid.push([0, -1, z], [0, 1, z]);
        }
      }
    } catch (error) {
      console.error("Error generating grid:", error);
      // Return a minimal valid grid in case of error
      return mode === '2d' 
        ? [[-1, 0], [1, 0], [0, -1], [0, 1]]
        : [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]];
    }
    
    return grid;
  };
  
  // Generate unit circle for 2D visualization
  export const generateUnitCircle = () => {
    const points = [];
    const segments = 32;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      points.push([x, y]);
    }
    
    return points;
  };
  
  // Generate unit cube for 3D visualization
  export const generateUnitCube = () => {
    return [
      // Bottom face
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [0.5, 0.5, -0.5],
      [-0.5, 0.5, -0.5],
      
      // Top face
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
      [-0.5, 0.5, 0.5]
    ];
  };
  
  // Apply transformation matrix to a point or array of points
  export const applyTransformation = (points, matrix, mode) => {
    // Safety checks
    if (!points || !Array.isArray(points) || points.length === 0) {
      console.warn("Invalid points for transformation");
      return [];
    }
    
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
      console.warn("Invalid transformation matrix");
      return points; // Return original points if matrix is invalid
    }
    
    try {
      // Handle both single point and array of points
      const inputPoints = Array.isArray(points[0]) ? points : [points];
      const result = [];
      
      for (const point of inputPoints) {
        if (!Array.isArray(point)) {
          console.warn("Invalid point:", point);
          continue;
        }
        
        if (mode === '2d') {
          // 2D transformation
          const x = point[0] || 0;
          const y = point[1] || 0;
          
          // Check for valid matrix dimensions
          if (!matrix[0] || !matrix[1] || 
              !Array.isArray(matrix[0]) || !Array.isArray(matrix[1]) ||
              matrix[0].length < 2 || matrix[1].length < 2) {
            console.warn("Invalid 2D matrix structure");
            result.push([x, y]); // Return original point
            continue;
          }
          
          const transformedX = matrix[0][0] * x + matrix[0][1] * y;
          const transformedY = matrix[1][0] * x + matrix[1][1] * y;
          
          result.push([transformedX, transformedY]);
        } else {
          // 3D transformation
          const x = point[0] || 0;
          const y = point[1] || 0;
          const z = point[2] || 0;
          
          // Check for valid matrix dimensions
          if (!matrix[0] || !matrix[1] || !matrix[2] ||
              !Array.isArray(matrix[0]) || !Array.isArray(matrix[1]) || !Array.isArray(matrix[2]) ||
              matrix[0].length < 3 || matrix[1].length < 3 || matrix[2].length < 3) {
            console.warn("Invalid 3D matrix structure");
            result.push([x, y, z]); // Return original point
            continue;
          }
          
          const transformedX = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z;
          const transformedY = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z;
          const transformedZ = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z;
          
          result.push([transformedX, transformedY, transformedZ]);
        }
      }
      
      return Array.isArray(points[0]) ? result : result[0];
    } catch (error) {
      console.error("Error applying transformation:", error);
      return points; // Return original points in case of error
    }
  };
  
  // Smoothly interpolate between two matrices for animation
  export const interpolateMatrices = (matrixA, matrixB, t, mode) => {
    const result = [];
    
    // Determine matrix dimensions based on mode
    const dim = mode === '2d' ? 2 : 3;
    
    // Create the result matrix with the same dimensions
    for (let i = 0; i < dim; i++) {
      result[i] = [];
      for (let j = 0; j < dim; j++) {
        result[i][j] = (1 - t) * matrixA[i][j] + t * matrixB[i][j];
      }
    }
    
    return result;
  };
  
  // Preset transformations
  export const presetTransformations = {
    '2d': {
      'identity': [
        [1, 0],
        [0, 1]
      ],
      'scale2x': [
        [2, 0],
        [0, 2]
      ],
      'reflection': [
        [1, 0],
        [0, -1]
      ],
      'rotation45': [
        [Math.cos(Math.PI/4), -Math.sin(Math.PI/4)],
        [Math.sin(Math.PI/4), Math.cos(Math.PI/4)]
      ],
      'shearX': [
        [1, 0.5],
        [0, 1]
      ],
      'shearY': [
        [1, 0],
        [0.5, 1]
      ]
    },
    '3d': {
      'identity': [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ],
      'scale2x': [
        [2, 0, 0],
        [0, 2, 0],
        [0, 0, 2]
      ],
      'rotateX': [
        [1, 0, 0],
        [0, Math.cos(Math.PI/4), -Math.sin(Math.PI/4)],
        [0, Math.sin(Math.PI/4), Math.cos(Math.PI/4)]
      ],
      'rotateY': [
        [Math.cos(Math.PI/4), 0, Math.sin(Math.PI/4)],
        [0, 1, 0],
        [-Math.sin(Math.PI/4), 0, Math.cos(Math.PI/4)]
      ],
      'rotateZ': [
        [Math.cos(Math.PI/4), -Math.sin(Math.PI/4), 0],
        [Math.sin(Math.PI/4), Math.cos(Math.PI/4), 0],
        [0, 0, 1]
      ],
      'shear': [
        [1, 0.5, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]
    }
  };