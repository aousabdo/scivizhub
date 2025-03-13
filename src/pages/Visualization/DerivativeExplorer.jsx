import React from 'react';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import DerivativeExplorerVisualizer from '../../components/Visualizations/DerivativeExplorer/DerivativeExplorerVisualizer';
import './DerivativeExplorer.css';

/**
 * DerivativeExplorer Page Component
 * 
 * This page provides a comprehensive educational resource on derivatives,
 * featuring an interactive visualization that demonstrates the geometric
 * interpretation of derivatives as the slope of tangent lines.
 */
const DerivativeExplorer = () => {
  return (
    <MathJaxContext>
      <div className="visualization-container">
          <div className="visualization-header">
            <h1>Derivative Explorer</h1>
            <h2>Understanding the Geometric Meaning of Derivatives</h2>
          </div>
          
          <div className="visualization-section">
            <h3>Interact with the Visualization</h3>
            <p>
              Drag the green point along the curve to see how the tangent line and its slope (the derivative) change. 
              Toggle between different functions and explore the relationship between secant lines and the tangent line.
            </p>
            
            <DerivativeExplorerVisualizer />
            
            <div className="visualization-note">
              <p>* Drag the green point to move along the curve. Use the controls to adjust parameters and toggle display options.</p>
            </div>
          </div>
          
          <div className="info-grid">
            <div className="info-card">
              <h3>What is a Derivative?</h3>
              <p>
                The derivative of a function at a specific point represents the rate of change or slope of the function at that point. 
                Geometrically, it's the slope of the tangent line to the curve at that point.
              </p>
              
              <div className="math-formula">
                <MathJax>{`f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}`}</MathJax>
              </div>
              
              <p>
                This formula describes the limit definition of the derivative. As h approaches zero, the secant line becomes 
                the tangent line to the curve at point x.
              </p>
              
              <h3>The Limit Definition of Derivatives</h3>
              <p>
                The secant line connects two points on a curve. As we bring these points closer together 
                (reducing Δx), the secant line approaches the tangent line. This is the key insight of calculus: 
                the derivative is defined as the limit of the secant line slope as Δx approaches zero.
              </p>
              
              <div className="math-formula">
                <MathJax>{`\\text{Secant slope} = \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}`}</MathJax>
              </div>
              <div className="math-formula">
                <MathJax>{`\\text{Tangent slope} = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}`}</MathJax>
              </div>
            </div>
            
            <div className="info-card">
              <h3>Local Linearity & Zooming In</h3>
              <p>
                One of the most powerful insights in calculus is that when we zoom in 
                sufficiently close to a well-behaved function, it appears nearly linear. This 
                "local linearity" property is why the tangent line is such a good approximation 
                of the function near the point of tangency.
              </p>
              
              <p>
                Use the zoom buttons in the visualization to see this principle in action. As you zoom in 
                around the point of tangency, the curve appears increasingly straight, becoming almost 
                indistinguishable from its tangent line.
              </p>
              
              <h3>Applications of Derivatives</h3>
              <p>Derivatives are fundamental in many fields:</p>
              <ul>
                <li>Physics: Velocity (derivative of position) and acceleration (derivative of velocity)</li>
                <li>Economics: Marginal cost, marginal revenue, elasticity</li>
                <li>Engineering: Rates of change in systems, optimization problems</li>
                <li>Machine Learning: Gradient descent algorithms</li>
                <li>Biology: Population growth rates, reaction rates</li>
              </ul>
            </div>
          </div>
          
          <div className="info-card full-width">
            <h3>Common Derivatives</h3>
            <div className="formula-grid">
              <div className="formula-column">
                <div className="math-formula">
                  <MathJax>{`\\frac{d}{dx}(x^n) = nx^{n-1}`}</MathJax>
                </div>
                <div className="math-formula">
                  <MathJax>{`\\frac{d}{dx}(e^x) = e^x`}</MathJax>
                </div>
                <div className="math-formula">
                  <MathJax>{`\\frac{d}{dx}(\\ln(x)) = \\frac{1}{x}`}</MathJax>
                </div>
                <div className="math-formula">
                  <MathJax>{`\\frac{d}{dx}(\\sin(x)) = \\cos(x)`}</MathJax>
                </div>
              </div>
              <div className="formula-column">
                <div className="math-formula">
                  <MathJax>{`\\frac{d}{dx}(\\cos(x)) = -\\sin(x)`}</MathJax>
                </div>
                <div className="math-formula">
                  <MathJax>{`\\frac{d}{dx}(\\tan(x)) = \\sec^2(x)`}</MathJax>
                </div>
                <div className="math-formula">
                  <MathJax>{`\\frac{d}{dx}(\\sqrt{x}) = \\frac{1}{2\\sqrt{x}}`}</MathJax>
                </div>
                <div className="math-formula">
                  <MathJax>{`\\frac{d}{dx}(\\frac{1}{x}) = -\\frac{1}{x^2}`}</MathJax>
                </div>
              </div>
            </div>
          </div>
          
          <div className="info-card full-width">
            <h3>Deeper Insights</h3>
            <p>Derivatives provide powerful information about functions:</p>
            
            <div className="insight-grid">
              <div className="insight-item">
                <h4>Critical Points</h4>
                <p>
                  When f'(x) {'>'} 0, the function is increasing.
                  When f'(x) {'<'} 0, the function is decreasing.
                </p>
              </div>
              
              <div className="insight-item">
                <h4>Increasing/Decreasing</h4>
                <p>
                  When f'(x) {'>'} 0, the function is increasing.
                  When f'(x) {'<'} 0, the function is decreasing.
                </p>
              </div>
              
              <div className="insight-item">
                <h4>Concavity</h4>
                <p>
                  The second derivative f''(x) tells us about concavity.
                  When f''(x) {'>'} 0, the curve is concave up (cup-shaped).
                  When f''(x) {'<'} 0, the curve is concave down (cap-shaped).
                </p>
              </div>
            </div>
            
            <hr className="divider" />
            
            <h3>Further Learning</h3>
            <p>To deepen your understanding of derivatives, explore these resources:</p>
            <ul>
              <li>
                <a href="https://www.khanacademy.org/math/calculus-1/cs1-derivatives-definition-and-basic-rules" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  Khan Academy: Derivatives
                </a>
              </li>
              <li>
                <a href="https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  MIT OpenCourseWare: Single Variable Calculus
                </a>
              </li>
              <li>
                <a href="https://en.wikipedia.org/wiki/Derivative" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  Wikipedia: Derivatives
                </a>
              </li>
            </ul>
          </div>
      </div>
    </MathJaxContext>
  );
};

export default DerivativeExplorer;