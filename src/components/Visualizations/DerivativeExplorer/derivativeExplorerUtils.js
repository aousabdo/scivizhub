/**
 * Derivative Explorer Utility Functions
 * 
 * This file contains utility functions for the Derivative Explorer visualization,
 * including function definitions, derivative calculations, and helper functions
 * for tangent and secant line calculations.
 */

// Define the available functions and their derivatives
export const FUNCTIONS = {
    // f(x) = x^2
    quadratic: {
      name: 'Quadratic',
      expression: 'x²',
      func: (x) => x * x,
      derivative: (x) => 2 * x
    },
    // f(x) = x^3
    cubic: {
      name: 'Cubic',
      expression: 'x³',
      func: (x) => x * x * x,
      derivative: (x) => 3 * x * x
    },
    // f(x) = sin(x)
    sine: {
      name: 'Sine',
      expression: 'sin(x)',
      func: (x) => Math.sin(x),
      derivative: (x) => Math.cos(x)
    },
    // f(x) = cos(x)
    cosine: {
      name: 'Cosine',
      expression: 'cos(x)',
      func: (x) => Math.cos(x),
      derivative: (x) => -Math.sin(x)
    },
    // f(x) = e^x
    exponential: {
      name: 'Exponential',
      expression: 'eˣ',
      func: (x) => Math.exp(x),
      derivative: (x) => Math.exp(x)
    },
    // f(x) = ln(x)
    logarithmic: {
      name: 'Logarithmic',
      expression: 'ln(x)',
      func: (x) => (x <= 0 ? 0 : Math.log(x)),
      derivative: (x) => (x <= 0 ? 0 : 1 / x)
    },
    // f(x) = 1/x
    reciprocal: {
      name: 'Reciprocal',
      expression: '1/x',
      func: (x) => (x === 0 ? 0 : 1 / x),
      derivative: (x) => (x === 0 ? 0 : -1 / (x * x))
    },
    // f(x) = √x
    squareRoot: {
      name: 'Square Root',
      expression: '√x',
      func: (x) => (x < 0 ? 0 : Math.sqrt(x)),
      derivative: (x) => (x <= 0 ? 0 : 0.5 / Math.sqrt(x))
    },
    // f(x) = |x|
    absolute: {
      name: 'Absolute Value',
      expression: '|x|',
      func: (x) => Math.abs(x),
      derivative: (x) => (x === 0 ? 0 : x > 0 ? 1 : -1)
    },
    // f(x) = x^2 - 2x + 1
    quadraticPolynomial: {
      name: 'Quadratic Polynomial',
      expression: 'x² - 2x + 1',
      func: (x) => x * x - 2 * x + 1,
      derivative: (x) => 2 * x - 2
    }
  };
  
  /**
   * Evaluates the specified function at the given x value
   * 
   * @param {string} functionType - The type of function to evaluate
   * @param {number} x - The x value to evaluate the function at
   * @returns {number} The function value at x
   */
  export const evaluateFunction = (functionType, x) => {
    if (!FUNCTIONS[functionType]) {
      console.error(`Unknown function type: ${functionType}`);
      return 0;
    }
    return FUNCTIONS[functionType].func(x);
  };
  
  /**
   * Evaluates the derivative of the specified function at the given x value
   * 
   * @param {string} functionType - The type of function to evaluate the derivative for
   * @param {number} x - The x value to evaluate the derivative at
   * @returns {number} The derivative value at x
   */
  export const evaluateDerivative = (functionType, x) => {
    if (!FUNCTIONS[functionType]) {
      console.error(`Unknown function type: ${functionType}`);
      return 0;
    }
    return FUNCTIONS[functionType].derivative(x);
  };
  
  /**
   * Gets the display label for the specified function
   * 
   * @param {string} functionType - The type of function
   * @returns {string} The display label for the function
   */
  export const getFunctionLabel = (functionType) => {
    if (!FUNCTIONS[functionType]) {
      return functionType;
    }
    return FUNCTIONS[functionType].name;
  };
  
  /**
   * Gets the mathematical expression for the specified function
   * 
   * @param {string} functionType - The type of function
   * @returns {string} The mathematical expression for the function
   */
  export const getFunctionExpression = (functionType) => {
    if (!FUNCTIONS[functionType]) {
      return functionType;
    }
    return FUNCTIONS[functionType].expression;
  };
  
  /**
   * Calculates the tangent line at a specific point on the curve
   * 
   * The tangent line is represented by the point-slope form:
   * y - y₀ = m(x - x₀)
   * where m is the slope (derivative value at the point),
   * (x₀, y₀) is the point of tangency.
   * 
   * @param {string} functionType - The type of function
   * @param {number} x - The x-coordinate of the point
   * @returns {Object} An object with the slope and y-intercept of the tangent line
   */
  export const calculateTangentLine = (functionType, x) => {
    const y = evaluateFunction(functionType, x);
    const slope = evaluateDerivative(functionType, x);
    const yIntercept = y - slope * x;
    
    return {
      slope,
      yIntercept,
      // Helper function to get y value for any x on the tangent line
      getY: (xValue) => slope * (xValue - x) + y
    };
  };
  
  /**
   * Calculates the secant line between two points on the curve
   * 
   * The secant line passes through two points on the curve:
   * (x₁, f(x₁)) and (x₂, f(x₂))
   * The slope of the secant line is (f(x₂) - f(x₁)) / (x₂ - x₁)
   * 
   * @param {string} functionType - The type of function
   * @param {number} x1 - The x-coordinate of the first point
   * @param {number} deltaX - The difference between x2 and x1
   * @returns {Object} An object with the slope and y-intercept of the secant line
   */
  export const calculateSecantLine = (functionType, x1, deltaX) => {
    const x2 = x1 + deltaX;
    const y1 = evaluateFunction(functionType, x1);
    const y2 = evaluateFunction(functionType, x2);
    
    // Avoid division by zero
    if (Math.abs(deltaX) < 1e-10) {
      return null;
    }
    
    const slope = (y2 - y1) / deltaX;
    const yIntercept = y1 - slope * x1;
    
    return {
      slope,
      yIntercept,
      // Helper function to get y value for any x on the secant line
      getY: (xValue) => slope * xValue + yIntercept
    };
  };
  
  /**
   * Numerically calculates the derivative using the limit definition
   * 
   * The derivative is defined as the limit:
   * f'(x) = lim(h→0) [f(x+h) - f(x)] / h
   * 
   * This function approximates this limit with a small value of h.
   * 
   * @param {string} functionType - The type of function
   * @param {number} x - The x-coordinate to calculate the derivative at
   * @param {number} h - The small delta x value (defaults to 0.00001)
   * @returns {number} The approximated derivative value
   */
  export const numericalDerivative = (functionType, x, h = 0.00001) => {
    const y1 = evaluateFunction(functionType, x);
    const y2 = evaluateFunction(functionType, x + h);
    return (y2 - y1) / h;
  };
  
  /**
   * Calculates the zoomed view of a function around a specific point
   * 
   * When we zoom in on a function at a point, the function appears increasingly linear.
   * This is the geometric interpretation of the derivative - at a small scale,
   * the function looks like its tangent line.
   * 
   * @param {string} functionType - The type of function
   * @param {number} centerX - The x-coordinate of the center point
   * @param {number} centerY - The y-coordinate of the center point
   * @param {number} zoomLevel - The zoom level (higher means more zoomed in)
   * @param {number} width - The width of the view
   * @param {number} height - The height of the view
   * @returns {Object} Object with viewBox parameters and function points
   */
  export const calculateZoomedView = (functionType, centerX, centerY, zoomLevel, width, height) => {
    // Calculate the view box based on zoom level
    const viewWidth = width / zoomLevel;
    const viewHeight = height / zoomLevel;
    
    const viewBox = {
      x: centerX - viewWidth / 2,
      y: centerY - viewHeight / 2,
      width: viewWidth,
      height: viewHeight
    };
    
    // Generate function points for the zoomed view
    const step = viewWidth / 100; // 100 points across the view
    const points = [];
    
    for (let i = 0; i <= 100; i++) {
      const x = viewBox.x + i * step;
      const y = evaluateFunction(functionType, x);
      points.push({ x, y });
    }
    
    // Generate tangent line points for comparison
    const tangentLine = calculateTangentLine(functionType, centerX);
    const tangentPoints = [];
    
    for (let i = 0; i <= 100; i++) {
      const x = viewBox.x + i * step;
      const y = tangentLine.getY(x);
      tangentPoints.push({ x, y });
    }
    
    return {
      viewBox,
      functionPoints: points,
      tangentPoints
    };
  };
  
  /**
   * Calculates the error between the function and its tangent line
   * within a certain range around a point.
   * 
   * This helps illustrate how well the tangent line approximates the function.
   * 
   * @param {string} functionType - The type of function
   * @param {number} x - The x-coordinate of the point
   * @param {number} range - The range around x to evaluate
   * @param {number} steps - The number of evaluation points
   * @returns {Array} Array of error values { x, error }
   */
  export const calculateLinearizationError = (functionType, x, range = 2, steps = 100) => {
    const tangentLine = calculateTangentLine(functionType, x);
    const errors = [];
    
    const step = (2 * range) / steps;
    for (let i = 0; i <= steps; i++) {
      const xValue = x - range + i * step;
      const functionValue = evaluateFunction(functionType, xValue);
      const tangentValue = tangentLine.getY(xValue);
      const error = Math.abs(functionValue - tangentValue);
      
      errors.push({
        x: xValue,
        error
      });
    }
    
    return errors;
  };