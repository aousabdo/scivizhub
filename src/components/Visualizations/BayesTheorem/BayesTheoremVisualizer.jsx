import React, { useState } from 'react';

const BayesTheoremVisualizer = () => {
  // Default values for medical test example
  const [prevalence, setPrevalence] = useState(0.01); // 1% of population has the disease
  const [sensitivity, setSensitivity] = useState(0.95); // 95% true positive rate
  const [specificity, setSpecificity] = useState(0.90); // 90% true negative rate
  const [activeTab, setActiveTab] = useState('interactive');
  
  // Calculated values
  const populationSize = 1000;
  const diseaseCount = Math.round(populationSize * prevalence);
  const healthyCount = populationSize - diseaseCount;
  
  const truePositives = Math.round(diseaseCount * sensitivity);
  const falseNegatives = diseaseCount - truePositives;
  
  const trueNegatives = Math.round(healthyCount * specificity);
  const falsePositives = healthyCount - trueNegatives;
  
  const totalPositives = truePositives + falsePositives;
  
  // Bayes' theorem result: P(Disease|Positive) = P(Positive|Disease) * P(Disease) / P(Positive)
  const posteriorProbability = totalPositives > 0 ? (truePositives / totalPositives) : 0;
  
  const handleInputChange = (setter) => (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setter(value);
    }
  };
  
  // Interactive 2x2 Table View
  const TableView = () => (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">2×2 Contingency Table (Population of {populationSize})</h3>
      
      <div className="grid grid-cols-3 gap-1 text-center mb-6">
        <div className="border p-2 bg-gray-100"></div>
        <div className="border p-2 bg-gray-100 font-medium">Test Positive</div>
        <div className="border p-2 bg-gray-100 font-medium">Test Negative</div>
        
        <div className="border p-2 bg-gray-100 font-medium">Has Disease</div>
        <div className="border p-2 bg-green-100">{truePositives} <span className="text-sm text-gray-500">(True Positives)</span></div>
        <div className="border p-2 bg-red-100">{falseNegatives} <span className="text-sm text-gray-500">(False Negatives)</span></div>
        
        <div className="border p-2 bg-gray-100 font-medium">No Disease</div>
        <div className="border p-2 bg-red-100">{falsePositives} <span className="text-sm text-gray-500">(False Positives)</span></div>
        <div className="border p-2 bg-green-100">{trueNegatives} <span className="text-sm text-gray-500">(True Negatives)</span></div>
        
        <div className="border p-2 bg-gray-100 font-medium">Total</div>
        <div className="border p-2 bg-blue-50">{totalPositives}</div>
        <div className="border p-2 bg-blue-50">{populationSize - totalPositives}</div>
      </div>
      
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6">
        <h4 className="font-semibold mb-2">Bayes' Theorem in Action:</h4>
        <p>If you test positive, what's the probability you actually have the disease?</p>
        <div className="mt-2 flex flex-col gap-2">
          <div className="font-mono">P(Disease|Positive) = P(Positive|Disease) × P(Disease) / P(Positive)</div>
          <div className="font-mono">P(Disease|Positive) = {sensitivity.toFixed(2)} × {prevalence.toFixed(4)} / {(totalPositives/populationSize).toFixed(4)}</div>
          <div className="font-mono">P(Disease|Positive) = {posteriorProbability.toFixed(4)} = {(posteriorProbability * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
  
  // Tree Diagram View
  const TreeDiagram = () => (
    <div className="p-4 border rounded-lg bg-white shadow-sm flex justify-center">
      <svg width="500" height="400" viewBox="0 0 500 400">
        {/* Tree Root */}
        <circle cx="250" cy="40" r="20" fill="#e0e0e0" />
        <text x="250" y="45" textAnchor="middle" fontSize="12">Population</text>
        
        {/* Disease Branch */}
        <line x1="250" y1="60" x2="150" y2="120" stroke="black" strokeWidth="2" />
        <circle cx="150" cy="120" r="20" fill="#f0f0f0" />
        <text x="150" y="125" textAnchor="middle" fontSize="12">Disease</text>
        <text x="200" y="105" textAnchor="middle" fontSize="10" fill="#666">{(prevalence * 100).toFixed(1)}%</text>
        
        {/* No Disease Branch */}
        <line x1="250" y1="60" x2="350" y2="120" stroke="black" strokeWidth="2" />
        <circle cx="350" cy="120" r="20" fill="#f0f0f0" />
        <text x="350" y="125" textAnchor="middle" fontSize="12">No Disease</text>
        <text x="300" y="105" textAnchor="middle" fontSize="10" fill="#666">{((1-prevalence) * 100).toFixed(1)}%</text>
        
        {/* Disease+Test Branches */}
        <line x1="150" y1="140" x2="100" y2="200" stroke="black" strokeWidth="2" />
        <circle cx="100" cy="200" r="20" fill="#aaffaa" />
        <text x="100" y="205" textAnchor="middle" fontSize="10">Test +</text>
        <text x="125" y="185" textAnchor="middle" fontSize="10" fill="#666">{(sensitivity * 100).toFixed(0)}%</text>
        
        <line x1="150" y1="140" x2="200" y2="200" stroke="black" strokeWidth="2" />
        <circle cx="200" cy="200" r="20" fill="#ffaaaa" />
        <text x="200" y="205" textAnchor="middle" fontSize="10">Test -</text>
        <text x="175" y="185" textAnchor="middle" fontSize="10" fill="#666">{((1-sensitivity) * 100).toFixed(0)}%</text>
        
        {/* No Disease+Test Branches */}
        <line x1="350" y1="140" x2="300" y2="200" stroke="black" strokeWidth="2" />
        <circle cx="300" cy="200" r="20" fill="#ffaaaa" />
        <text x="300" y="205" textAnchor="middle" fontSize="10">Test +</text>
        <text x="325" y="185" textAnchor="middle" fontSize="10" fill="#666">{((1-specificity) * 100).toFixed(0)}%</text>
        
        <line x1="350" y1="140" x2="400" y2="200" stroke="black" strokeWidth="2" />
        <circle cx="400" cy="200" r="20" fill="#aaffaa" />
        <text x="400" y="205" textAnchor="middle" fontSize="10">Test -</text>
        <text x="375" y="185" textAnchor="middle" fontSize="10" fill="#666">{(specificity * 100).toFixed(0)}%</text>
        
        {/* Results Boxes */}
        <rect x="50" y="240" width="100" height="40" rx="5" fill="#e6ffe6" stroke="#aaa" />
        <text x="100" y="260" textAnchor="middle" fontSize="12">True Positives</text>
        <text x="100" y="275" textAnchor="middle" fontSize="12">{truePositives} / {populationSize}</text>
        
        <rect x="150" y="240" width="100" height="40" rx="5" fill="#ffe6e6" stroke="#aaa" />
        <text x="200" y="260" textAnchor="middle" fontSize="12">False Negatives</text>
        <text x="200" y="275" textAnchor="middle" fontSize="12">{falseNegatives} / {populationSize}</text>
        
        <rect x="250" y="240" width="100" height="40" rx="5" fill="#ffe6e6" stroke="#aaa" />
        <text x="300" y="260" textAnchor="middle" fontSize="12">False Positives</text>
        <text x="300" y="275" textAnchor="middle" fontSize="12">{falsePositives} / {populationSize}</text>
        
        <rect x="350" y="240" width="100" height="40" rx="5" fill="#e6ffe6" stroke="#aaa" />
        <text x="400" y="260" textAnchor="middle" fontSize="12">True Negatives</text>
        <text x="400" y="275" textAnchor="middle" fontSize="12">{trueNegatives} / {populationSize}</text>
        
        {/* Bayes Result Box */}
        <rect x="125" y="320" width="250" height="60" rx="8" fill="#fff7e0" stroke="#e0c070" strokeWidth="2" />
        <text x="250" y="340" textAnchor="middle" fontSize="14" fontWeight="bold">If test is positive:</text>
        <text x="250" y="365" textAnchor="middle" fontSize="14">
          P(Disease|Positive) = {(posteriorProbability * 100).toFixed(1)}%
        </text>
      </svg>
    </div>
  );
  
  // Venn Diagram View
  const VennDiagram = () => {
    // Calculate values for visualization
    const populationSize = 1000;
    const diseaseCount = Math.round(populationSize * prevalence);
    const healthyCount = populationSize - diseaseCount;
    const truePositives = Math.round(diseaseCount * sensitivity);
    const falseNegatives = diseaseCount - truePositives;
    const falsePositives = Math.round(healthyCount * (1 - specificity));
    const trueNegatives = healthyCount - falsePositives;
    const totalPositives = truePositives + falsePositives;
    
    // Calculated circle dimensions based on actual proportions
    const diagramWidth = 600;
    const diagramHeight = 500;
    const centerY = 220;
    const centerX = diagramWidth / 2;
    
    // Disease circle (blue)
    const diseaseProportion = diseaseCount / populationSize;
    const diseaseRadius = Math.sqrt(diseaseProportion) * 140;
    const diseaseCenterX = centerX - 60;
    
    // Test positive circle (red)
    const positiveProportion = totalPositives / populationSize;
    const positiveRadius = Math.sqrt(positiveProportion) * 140;
    const positiveCenterX = centerX + 60;
    
    // Color scheme
    const colors = {
      disease: {
        fill: '#adf',
        border: '#68c',
        dark: '#37c',
        light: '#e5f5ff'
      },
      positive: {
        fill: '#faa',
        border: '#d88',
        dark: '#c44',
        light: '#ffebeb'
      },
      truePositive: {
        fill: '#afa',
        border: '#4a4',
        dark: '#383',
        light: '#efffef'
      },
      falseNegative: {
        fill: 'none',
        border: '#900',
        dark: '#700',
        light: '#ffeeee'
      },
      falsePositive: {
        fill: 'none',
        border: '#900',
        dark: '#700',
        light: '#ffeeee'
      },
      trueNegative: {
        fill: 'none',
        border: '#080',
        dark: '#070',
        light: '#efffef'
      },
      labels: {
        bg: 'rgba(255, 255, 255, 0.9)',
        border: '#aaa',
        text: '#333'
      },
      result: {
        fill: '#fff7e0',
        border: '#e0c070',
        text: '#805000'
      }
    };
    
    // Helper function to create pointer lines from labels to diagram parts
    const createPointer = (fromX, fromY, toX, toY, color, dashed = false) => {
      const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      const controlX = midX + (toY - fromY) * 0.2;
      const controlY = midY - (toX - fromX) * 0.2;
      
      return (
        <path 
          d={`M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={dashed ? "4,3" : "none"}
          markerEnd="url(#arrowhead)"
        />
      );
    };
    
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex flex-col">
          {/* Diagram Section */}
          <div className="flex justify-center mb-10 relative">
            <svg width={diagramWidth} height={diagramHeight} viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}>
              {/* Title */}
              <text x={centerX} y="30" textAnchor="middle" fontSize="20" fontWeight="bold">
                Venn Diagram of Disease and Test Results
              </text>
              
              {/* Population indicator */}
              <text x="50" y="80" fontSize="16" fontWeight="bold">
                Population: {populationSize} people
              </text>
              
              {/* Define arrow markers for pointers */}
              <defs>
                <marker 
                  id="arrowhead" 
                  markerWidth="10" 
                  markerHeight="7" 
                  refX="9" 
                  refY="3.5" 
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#777" />
                </marker>
              </defs>
              
              {/* Main circles container for proper centering */}
              <g transform={`translate(0, 50)`}>
                {/* Disease Circle */}
                <circle 
                  cx={diseaseCenterX} 
                  cy={centerY} 
                  r={diseaseRadius} 
                  fill={colors.disease.fill} 
                  fillOpacity="0.8" 
                  stroke={colors.disease.border} 
                  strokeWidth="2"
                />
                
                {/* Positive Test Circle */}
                <circle 
                  cx={positiveCenterX} 
                  cy={centerY} 
                  r={positiveRadius} 
                  fill={colors.positive.fill} 
                  fillOpacity="0.8" 
                  stroke={colors.positive.border} 
                  strokeWidth="2"
                />
                
                {/* Disease Label - Outside with pointer */}
                <rect 
                  x={40} 
                  y={120} 
                  width={120} 
                  height={50} 
                  fill="white" 
                  stroke={colors.disease.border}
                  strokeWidth="1"
                  rx="4"
                />
                <text x={100} y={140} textAnchor="middle" fontSize="14" fontWeight="bold" fill={colors.disease.dark}>
                  Disease
                </text>
                <text x={100} y={160} textAnchor="middle" fontSize="12">
                  {diseaseCount} people ({(prevalence * 100).toFixed(1)}%)
                </text>
                {createPointer(120, 145, diseaseCenterX - 25, centerY, colors.disease.dark)}
                
                {/* Test Positive Label - Outside with pointer */}
                <rect 
                  x={diagramWidth - 160} 
                  y={120} 
                  width={120} 
                  height={50} 
                  fill="white" 
                  stroke={colors.positive.border}
                  strokeWidth="1"
                  rx="4"
                />
                <text x={diagramWidth - 100} y={140} textAnchor="middle" fontSize="14" fontWeight="bold" fill={colors.positive.dark}>
                  Positive Test
                </text>
                <text x={diagramWidth - 100} y={160} textAnchor="middle" fontSize="12">
                  {totalPositives} people ({(totalPositives/populationSize*100).toFixed(1)}%)
                </text>
                {createPointer(diagramWidth - 120, 145, positiveCenterX + 25, centerY, colors.positive.dark)}
                
                {/* True Positives Label - Outside with pointer */}
                <rect 
                  x={centerX - 65} 
                  y={140} 
                  width={130} 
                  height={50} 
                  fill="white" 
                  stroke={colors.truePositive.border}
                  strokeWidth="1.5"
                  rx="4"
                />
                <text x={centerX} y={160} textAnchor="middle" fontSize="14" fontWeight="bold" fill={colors.truePositive.dark}>
                  True Positives
                </text>
                <text x={centerX} y={180} textAnchor="middle" fontSize="12">
                  {truePositives} ({(truePositives/populationSize*100).toFixed(1)}%)
                </text>
                {createPointer(centerX, 190, centerX, centerY - 20, colors.truePositive.dark)}
                
                {/* False Negatives Label */}
                <rect 
                  x={60} 
                  y={centerY + 60} 
                  width={140} 
                  height={50} 
                  fill="white" 
                  stroke={colors.falseNegative.border}
                  strokeWidth="1"
                  strokeDasharray="4,2"
                  rx="4"
                />
                <text x={130} y={centerY + 80} textAnchor="middle" fontSize="14" fontWeight="bold" fill={colors.falseNegative.dark}>
                  False Negatives
                </text>
                <text x={130} y={centerY + 100} textAnchor="middle" fontSize="12">
                  {falseNegatives} ({(falseNegatives/populationSize*100).toFixed(1)}%)
                </text>
                {createPointer(130, centerY + 60, diseaseCenterX - 10, centerY + 30, colors.falseNegative.dark, true)}
                
                {/* False Positives Label */}
                <rect 
                  x={diagramWidth - 200} 
                  y={centerY + 60} 
                  width={140} 
                  height={50} 
                  fill="white" 
                  stroke={colors.falsePositive.border}
                  strokeWidth="1"
                  strokeDasharray="4,2"
                  rx="4"
                />
                <text x={diagramWidth - 130} y={centerY + 80} textAnchor="middle" fontSize="14" fontWeight="bold" fill={colors.falsePositive.dark}>
                  False Positives
                </text>
                <text x={diagramWidth - 130} y={centerY + 100} textAnchor="middle" fontSize="12">
                  {falsePositives} ({(falsePositives/populationSize*100).toFixed(1)}%)
                </text>
                {createPointer(diagramWidth - 130, centerY + 60, positiveCenterX + 10, centerY + 30, colors.falsePositive.dark, true)}
                
                {/* True Negatives Label */}
                <rect 
                  x={centerX - 70} 
                  y={centerY + 100} 
                  width={140} 
                  height={50} 
                  fill="white" 
                  stroke={colors.trueNegative.border}
                  strokeWidth="1"
                  strokeDasharray="4,2"
                  rx="4"
                />
                <text x={centerX} y={centerY + 120} textAnchor="middle" fontSize="14" fontWeight="bold" fill={colors.trueNegative.dark}>
                  True Negatives
                </text>
                <text x={centerX} y={centerY + 140} textAnchor="middle" fontSize="12">
                  {trueNegatives} ({(trueNegatives/populationSize*100).toFixed(1)}%)
                </text>
                {createPointer(centerX, centerY + 100, centerX, centerY + 60, colors.trueNegative.dark, true)}
              </g>
              
              {/* Bayes' Theorem Result Box */}
              <rect 
                x={centerX - 120} 
                y={centerY + 180} 
                width={240} 
                height={120} 
                rx="8" 
                fill={colors.result.fill} 
                stroke={colors.result.border} 
                strokeWidth="2"
              />
              <text x={centerX} y={centerY + 210} textAnchor="middle" fontSize="18" fontWeight="bold" fill={colors.result.text}>
                Bayes' Theorem:
              </text>
              <text x={centerX} y={centerY + 235} textAnchor="middle" fontSize="14">
                P(Disease|Positive) = 
              </text>
              
              <line x1={centerX - 60} y1={centerY + 255} x2={centerX + 60} y2={centerY + 255} stroke="#444" strokeWidth="1.5" />
              
              <text x={centerX} y={centerY + 253} textAnchor="middle" fontSize="14">
                {truePositives} (true positives)
              </text>
              <text x={centerX} y={centerY + 273} textAnchor="middle" fontSize="14">
                {totalPositives} (all positives)
              </text>
              
              <text x={centerX} y={centerY + 295} textAnchor="middle" fontSize="20" fontWeight="bold" fill={colors.result.text}>
                = {(posteriorProbability * 100).toFixed(1)}%
              </text>
            </svg>
          </div>
          
          {/* Information Section - Below Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Key Terminology */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-3">Key Terminology</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-blue-200 border border-blue-600 mr-2 mt-1"></div>
                  <div>
                    <span className="font-medium block">Disease Prevalence:</span> 
                    <span className="block">{(prevalence * 100).toFixed(1)}% of population ({diseaseCount} of {populationSize} people)</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-red-200 border border-red-600 mr-2 mt-1"></div>
                  <div>
                    <span className="font-medium block">Test Results:</span> 
                    <span className="block">{totalPositives} positive tests ({(totalPositives/populationSize*100).toFixed(1)}% of population)</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-green-200 border border-green-600 mr-2 mt-1"></div>
                  <div>
                    <span className="font-medium block">True Positives:</span> 
                    <span className="block">People with disease who test positive ({truePositives} people)</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-red-200 border-dashed border-red-600 mr-2 mt-1"></div>
                  <div>
                    <span className="font-medium block">False Positives:</span> 
                    <span className="block">People without disease who test positive ({falsePositives} people)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Probability Breakdown */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-3">Probability Breakdown</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-mono">P(Disease)</span> = <strong>{prevalence.toFixed(4)}</strong> 
                  <span className="text-sm text-gray-500 ml-1">(prior probability)</span>
                </div>
                
                <div>
                  <span className="font-mono">P(Positive|Disease)</span> = <strong>{sensitivity.toFixed(2)}</strong> 
                  <span className="text-sm text-gray-500 ml-1">(sensitivity)</span>
                </div>
                
                <div>
                  <span className="font-mono">P(Negative|No Disease)</span> = <strong>{specificity.toFixed(2)}</strong> 
                  <span className="text-sm text-gray-500 ml-1">(specificity)</span>
                </div>
                
                <div>
                  <span className="font-mono">P(Positive)</span> = <strong>{(totalPositives/populationSize).toFixed(4)}</strong> 
                  <span className="text-sm text-gray-500 ml-1">(total positive rate)</span>
                </div>
                
                <div className="pt-2 font-semibold border-t mt-2">
                  <span className="font-mono">P(Disease|Positive)</span> = <strong>{posteriorProbability.toFixed(4)}</strong>
                  <span className="text-sm text-gray-500 ml-1">(posterior)</span>
                  <div className="font-bold text-lg text-center mt-1 p-1 bg-yellow-50 rounded-md">
                    = {(posteriorProbability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <h4 className="font-medium mb-2">Base Rate Fallacy</h4>
                <p className="text-sm">
                  Many people expect a positive test to mean the probability of disease is close to the test's 
                  accuracy (<strong>{(sensitivity * 100).toFixed(0)}%</strong>). However, with rare diseases, 
                  the actual probability can be surprisingly different 
                  (<strong>{(posteriorProbability * 100).toFixed(1)}%</strong>).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Understanding Bayes' Theorem</h2>
        <p className="mb-2">
          Bayes' theorem helps us update our beliefs when new evidence comes in. The formula is:
        </p>
        <div className="p-3 bg-gray-100 font-mono rounded mb-4 text-center">
          P(A|B) = P(B|A) × P(A) / P(B)
        </div>
        <p className="mb-4">
          In medical testing, this translates to:
        </p>
        <div className="p-3 bg-gray-100 font-mono rounded mb-4 text-center">
          P(Disease|Positive) = P(Positive|Disease) × P(Disease) / P(Positive)
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-2">Medical Test Example</h3>
        <p className="mb-4">
          Adjust the sliders to see how different values affect the final probability:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-1">
              Disease Prevalence: {(prevalence * 100).toFixed(1)}%
            </label>
            <input 
              type="range" 
              min="0.001" 
              max="0.5" 
              step="0.001" 
              value={prevalence} 
              onChange={handleInputChange(setPrevalence)} 
              className="w-full"
            />
            <div className="text-sm text-gray-500">Base rate in population</div>
          </div>
          
          <div>
            <label className="block mb-1">
              Test Sensitivity: {(sensitivity * 100).toFixed(0)}%
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="1" 
              step="0.01" 
              value={sensitivity} 
              onChange={handleInputChange(setSensitivity)} 
              className="w-full"
            />
            <div className="text-sm text-gray-500">True positive rate</div>
          </div>
          
          <div>
            <label className="block mb-1">
              Test Specificity: {(specificity * 100).toFixed(0)}%
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="1" 
              step="0.01" 
              value={specificity} 
              onChange={handleInputChange(setSpecificity)} 
              className="w-full"
            />
            <div className="text-sm text-gray-500">True negative rate</div>
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'interactive' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('interactive')}
            >
              2×2 Table
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'tree' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('tree')}
            >
              Tree Diagram
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'venn' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('venn')}
            >
              Venn Diagram
            </button>
          </nav>
        </div>
      </div>
      
      <div className="mt-4">
        {activeTab === 'interactive' && <TableView />}
        {activeTab === 'tree' && <TreeDiagram />}
        {activeTab === 'venn' && <VennDiagram />}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
        <ul className="space-y-2">
          <li>• When a disease is rare (low prevalence), even a highly accurate test can result in many false positives.</li>
          <li>• The posterior probability P(Disease|Positive) can be surprisingly low even with good tests.</li>
          <li>• This is why medical professionals often perform multiple tests to confirm a diagnosis.</li>
          <li>• This concept applies beyond medicine - in any situation where you're updating beliefs based on evidence.</li>
        </ul>
      </div>
    </div>
  );
};

export default BayesTheoremVisualizer; 