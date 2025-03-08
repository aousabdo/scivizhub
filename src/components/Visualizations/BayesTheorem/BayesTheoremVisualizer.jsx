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
    
    // Simple, clean implementation with basic dimensions
    const width = 600;
    const height = 400;
    const centerY = 180;
    
    // Basic circle dimensions
    const radius = 100;
    // Adjust separation to make overlap visually representative
    const separation = radius * 0.8;
    
    // Calculate centers
    const diseaseCenterX = width / 2 - separation;
    const positiveCenterX = width / 2 + separation;
    
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold">Venn Diagram of Disease and Test Results</h3>
          <p className="text-md mt-1">Population: {populationSize.toLocaleString()} people</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Diagram Area */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4 relative overflow-hidden">
              <svg 
                width="100%" 
                height="360" 
                viewBox={`0 0 ${width} 360`} 
                className="overflow-visible"
                style={{ maxWidth: '100%' }}
              >
                {/* Background annotation for True Negatives */}
                <text 
                  x="100" 
                  y="320" 
                  fontSize="14" 
                  fill="#666"
                  fontWeight="bold"
                >
                  True Negatives: {trueNegatives} ({(trueNegatives/populationSize*100).toFixed(1)}%)
                </text>
                
                {/* Disease Circle (Blue) */}
                <circle 
                  cx={diseaseCenterX} 
                  cy={centerY} 
                  r={radius} 
                  fill="rgba(179, 211, 255, 0.85)" 
                  stroke="#4a86e8" 
                  strokeWidth="2"
                />
                
                {/* Positive Test Circle (Red) */}
                <circle 
                  cx={positiveCenterX} 
                  cy={centerY} 
                  r={radius} 
                  fill="rgba(255, 179, 179, 0.85)" 
                  stroke="#e06666" 
                  strokeWidth="2"
                />
                
                {/* Disease Label */}
                <text 
                  x={diseaseCenterX - 50} 
                  y={centerY - 30} 
                  fontSize="16" 
                  fontWeight="bold"
                  fill="#333"
                >
                  Disease
                </text>
                <text 
                  x={diseaseCenterX - 50} 
                  y={centerY - 10} 
                  fontSize="14"
                  fill="#333"
                >
                  {diseaseCount} people
                </text>
                <text 
                  x={diseaseCenterX - 50} 
                  y={centerY + 10} 
                  fontSize="14"
                  fill="#333"
                >
                  ({(diseaseCount/populationSize*100).toFixed(1)}%)
                </text>
                
                {/* Positive Test Label */}
                <text 
                  x={positiveCenterX + 20} 
                  y={centerY - 30} 
                  fontSize="16" 
                  fontWeight="bold"
                  fill="#333"
                >
                  Positive Test
                </text>
                <text 
                  x={positiveCenterX + 20} 
                  y={centerY - 10} 
                  fontSize="14"
                  fill="#333"
                >
                  {totalPositives} people
                </text>
                <text 
                  x={positiveCenterX + 20} 
                  y={centerY + 10} 
                  fontSize="14"
                  fill="#333"
                >
                  ({(totalPositives/populationSize*100).toFixed(1)}%)
                </text>
                
                {/* True Positives Label (Centered between circles) */}
                <text 
                  x={width/2} 
                  y={centerY - 5} 
                  textAnchor="middle" 
                  fontSize="15" 
                  fontWeight="bold"
                  fill="#008800"
                >
                  True Positives: {truePositives}
                </text>
                <text 
                  x={width/2} 
                  y={centerY + 15} 
                  textAnchor="middle" 
                  fontSize="13"
                  fill="#008800"
                >
                  ({(truePositives/populationSize*100).toFixed(1)}%)
                </text>
                
                {/* False Negatives Label */}
                <text 
                  x={diseaseCenterX - 40} 
                  y={centerY + 70} 
                  fontSize="14" 
                  fontWeight="bold"
                  fill="#cc0000"
                >
                  False Negatives: {falseNegatives}
                </text>
                <text 
                  x={diseaseCenterX - 40} 
                  y={centerY + 90} 
                  fontSize="12"
                  fill="#cc0000"
                >
                  ({(falseNegatives/populationSize*100).toFixed(1)}%)
                </text>
                
                {/* False Positives Label */}
                <text 
                  x={positiveCenterX + 10} 
                  y={centerY + 70} 
                  fontSize="14" 
                  fontWeight="bold"
                  fill="#cc0000"
                >
                  False Positives: {falsePositives}
                </text>
                <text 
                  x={positiveCenterX + 10} 
                  y={centerY + 90} 
                  fontSize="12"
                  fill="#cc0000"
                >
                  ({(falsePositives/populationSize*100).toFixed(1)}%)
                </text>
              </svg>
            </div>
            
            {/* Bayes' Theorem Box */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <h4 className="text-xl font-bold mb-3 text-amber-800">Bayes' Theorem</h4>
              <div className="inline-block mx-auto text-center">
                <div className="mb-2 font-mono text-lg">P(Disease|Positive) =</div>
                <div className="flex flex-col items-center">
                  <div className="px-4 font-mono">{truePositives} (true positives)</div>
                  <div className="border-t border-gray-500 w-full my-1"></div>
                  <div className="px-4 font-mono">{totalPositives} (all positives)</div>
                </div>
                <div className="text-2xl font-bold mt-3">
                  = {(posteriorProbability * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend and Information */}
          <div className="md:w-80 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-4 border mb-4">
              <h4 className="text-lg font-bold border-b pb-2 mb-3">Diagram Legend</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-blue-200 border border-blue-600 mr-2 mt-1 rounded"></div>
                  <div>
                    <div className="font-medium">Disease</div>
                    <div className="text-sm">{diseaseCount} people ({(diseaseCount/populationSize*100).toFixed(1)}%)</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-red-200 border border-red-600 mr-2 mt-1 rounded"></div>
                  <div>
                    <div className="font-medium">Positive Test</div>
                    <div className="text-sm">{totalPositives} people ({(totalPositives/populationSize*100).toFixed(1)}%)</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-green-200 border border-green-600 mr-2 mt-1 rounded"></div>
                  <div>
                    <div className="font-medium">True Positives</div>
                    <div className="text-sm">People with disease who test positive</div>
                    <div className="text-sm font-medium">{truePositives} ({(truePositives/populationSize*100).toFixed(1)}%)</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-blue-100 border-dashed border border-red-600 mr-2 mt-1 rounded"></div>
                  <div>
                    <div className="font-medium">False Negatives</div>
                    <div className="text-sm">People with disease who test negative</div>
                    <div className="text-sm font-medium">{falseNegatives} ({(falseNegatives/populationSize*100).toFixed(1)}%)</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-red-100 border-dashed border border-red-600 mr-2 mt-1 rounded"></div>
                  <div>
                    <div className="font-medium">False Positives</div>
                    <div className="text-sm">People without disease who test positive</div>
                    <div className="text-sm font-medium">{falsePositives} ({(falsePositives/populationSize*100).toFixed(1)}%)</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-gray-100 border border-gray-400 mr-2 mt-1 rounded"></div>
                  <div>
                    <div className="font-medium">True Negatives</div>
                    <div className="text-sm">People without disease who test negative</div>
                    <div className="text-sm font-medium">{trueNegatives} ({(trueNegatives/populationSize*100).toFixed(1)}%)</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="text-lg font-bold border-b pb-2 mb-3">Base Rate Fallacy</h4>
              <p className="text-sm mb-2">
                Many people expect a positive test to indicate a high probability of disease 
                (close to the test's sensitivity of <strong>{(sensitivity * 100).toFixed(0)}%</strong>).
              </p>
              <p className="text-sm">
                However, when disease prevalence is low ({(prevalence * 100).toFixed(1)}%), the 
                actual probability is only <strong>{(posteriorProbability * 100).toFixed(1)}%</strong>.
              </p>
            </div>
          </div>
        </div>
        
        {/* Probability Breakdown - Bottom Card */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-bold border-b pb-2 mb-4">Probability Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-2 bg-white rounded border">
              <div className="font-mono text-sm mb-1">P(Disease)</div>
              <div className="text-xl font-bold">{prevalence.toFixed(4)}</div>
              <div className="text-xs text-gray-500">Prior probability</div>
            </div>
            
            <div className="p-2 bg-white rounded border">
              <div className="font-mono text-sm mb-1">P(Positive|Disease)</div>
              <div className="text-xl font-bold">{sensitivity.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Sensitivity</div>
            </div>
            
            <div className="p-2 bg-white rounded border">
              <div className="font-mono text-sm mb-1">P(Negative|No Disease)</div>
              <div className="text-xl font-bold">{specificity.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Specificity</div>
            </div>
            
            <div className="p-2 bg-white rounded border">
              <div className="font-mono text-sm mb-1">P(Positive)</div>
              <div className="text-xl font-bold">{(totalPositives/populationSize).toFixed(4)}</div>
              <div className="text-xs text-gray-500">Total positive rate</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t text-center">
            <div className="font-mono text-lg mb-2">P(Disease|Positive)</div>
            <div className="inline-block px-8 py-2 bg-yellow-100 rounded-lg border border-yellow-300">
              <span className="text-3xl font-bold">{(posteriorProbability * 100).toFixed(1)}%</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">Posterior probability</div>
          </div>
        </div>
      </div>
    );
  };

  // Visual Proof tab
  const VisualProof = () => (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold">Visual Proof of Bayes' Theorem</h3>
        <p className="text-md mt-2 max-w-3xl mx-auto">
          This visual explanation helps understand how Bayes' Theorem works by showing the relationship
          between prior probability, likelihood, and posterior probability.
        </p>
      </div>
      
      <div className="flex justify-center">
        <img
          src="/bayes_theorem_visual_proof.jpeg"
          alt="Visual proof of Bayes' Theorem"
          className="max-w-full rounded-lg shadow-md"
          style={{ maxHeight: '70vh' }}
        />
      </div>
      
      <div className="mt-6 mx-auto max-w-3xl">
        <h4 className="text-xl font-bold mb-3">Key Insights</h4>
        <ul className="space-y-2 list-disc pl-6">
          <li>Bayes' Theorem allows us to update our beliefs based on new evidence</li>
          <li>The prior probability (initial belief) is transformed into the posterior probability after considering evidence</li>
          <li>The visual representation shows how conditional probability relates to the joint probability of events</li>
          <li>By visualizing the process, we can better understand why the formula works the way it does</li>
        </ul>
      </div>
    </div>
  );

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
          <nav className="flex flex-wrap">
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
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'visual-proof' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('visual-proof')}
            >
              Visual Proof
            </button>
          </nav>
        </div>
      </div>
      
      <div className="mt-4">
        {activeTab === 'interactive' && <TableView />}
        {activeTab === 'tree' && <TreeDiagram />}
        {activeTab === 'venn' && <VennDiagram />}
        {activeTab === 'visual-proof' && <VisualProof />}
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