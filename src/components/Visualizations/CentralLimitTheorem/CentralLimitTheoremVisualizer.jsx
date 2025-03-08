import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

// Distribution functions
const distributions = {
  // Uniform distribution between min and max
  uniform: (min, max) => {
    return () => min + Math.random() * (max - min);
  },
  
  // Normal distribution with given mean and standard deviation
  normal: (mean, stdDev) => {
    return () => {
      // Box-Muller transform
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return mean + z * stdDev;
    };
  },
  
  // Exponential distribution with rate parameter lambda
  exponential: (lambda) => {
    return () => {
      return -Math.log(1 - Math.random()) / lambda;
    };
  },
  
  // Bimodal distribution - mix of two normal distributions
  bimodal: (mean1, stdDev1, mean2, stdDev2) => {
    const dist1 = distributions.normal(mean1, stdDev1);
    const dist2 = distributions.normal(mean2, stdDev2);
    return () => {
      return Math.random() < 0.5 ? dist1() : dist2();
    };
  },
  
  // Right-skewed distribution (positive skew - long tail on right)
  rightSkewed: () => {
    return () => {
      // Using chi-squared-like distribution (which is right-skewed)
      let sum = 0;
      // Sum of squared normal variates
      for (let i = 0; i < 3; i++) {
        const u = Math.random();
        const v = Math.random();
        // Box-Muller for normal random variables
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        sum += z * z;
      }
      // Scale and shift to get values primarily between 0-100
      return Math.min(Math.max(sum * 10 + 20, 0), 100);
    };
  },
  
  // Left-skewed distribution (negative skew - long tail on left)
  leftSkewed: () => {
    return () => {
      // We can transform a right-skewed distribution to make it left-skewed
      const rightSkewedValue = distributions.rightSkewed()();
      // Reflect around the midpoint of our scale (50)
      return 100 - rightSkewedValue;
    };
  }
};

// Function to generate histogram data from raw values
const generateHistogram = (values, bins) => {
  if (!values || values.length === 0) return [];
  
  // Find min and max values
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Create bins
  const binWidth = (max - min) / bins;
  const histogramData = Array(bins).fill(0).map((_, i) => ({
    x: min + i * binWidth + binWidth / 2, // bin center
    frequency: 0,
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth
  }));
  
  // Count values in each bin
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
    if (binIndex >= 0 && binIndex < bins) {
      histogramData[binIndex].frequency++;
    }
  });
  
  // Convert to relative frequency (proportion)
  histogramData.forEach(bin => {
    bin.frequency = bin.frequency / values.length;
  });
  
  return histogramData;
};

// Function to generate normal distribution curve
const generateNormalCurve = (mean, stdDev, points, range) => {
  const curve = [];
  const min = mean - range * stdDev;
  const max = mean + range * stdDev;
  const step = (max - min) / (points - 1);
  
  for (let i = 0; i < points; i++) {
    const x = min + i * step;
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    curve.push({ x, y });
  }
  
  return curve;
};

// Calculate mean of an array
const calculateMean = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

// Calculate standard deviation of an array
const calculateStdDev = (arr) => {
  if (!arr || arr.length <= 1) return 0;
  const mean = calculateMean(arr);
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
};

const CentralLimitTheoremVisualizer = () => {
  // State for visualization parameters
  const [distributionType, setDistributionType] = useState('uniform');
  const [sampleSize, setSampleSize] = useState(30);
  const [numberOfSamples, setNumberOfSamples] = useState(1000);
  const [histogramBins, setHistogramBins] = useState(20);
  const [showTheory, setShowTheory] = useState(true);
  
  // State for generated data
  const [populationValues, setPopulationValues] = useState([]);
  const [populationHistogram, setPopulationHistogram] = useState([]);
  const [populationMean, setPopulationMean] = useState(0);
  const [populationStdDev, setPopulationStdDev] = useState(0);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [sampleMeansHistogram, setSampleMeansHistogram] = useState([]);
  const [sampleMeanOfMeans, setSampleMeanOfMeans] = useState(0);
  const [sampleStdDevOfMeans, setSampleStdDevOfMeans] = useState(0);
  const [theoryNormalCurve, setTheoryNormalCurve] = useState([]);
  
  // Get distribution function based on selected type
  const getDistributionFunction = () => {
    switch (distributionType) {
      case 'uniform':
        return distributions.uniform(0, 100);
      case 'normal':
        return distributions.normal(50, 15);
      case 'exponential':
        return distributions.exponential(0.02);
      case 'bimodal':
        return distributions.bimodal(30, 10, 70, 10);
      case 'rightSkewed':
        return distributions.rightSkewed();
      case 'leftSkewed':
        return distributions.leftSkewed();
      default:
        return distributions.uniform(0, 100);
    }
  };
  
  // Generate population data
  const generatePopulationData = () => {
    const distributionFn = getDistributionFunction();
    const populationSize = 10000; // Large population
    const values = Array(populationSize).fill(0).map(() => distributionFn());
    
    setPopulationValues(values);
    
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);
    
    setPopulationMean(mean);
    setPopulationStdDev(stdDev);
    setPopulationHistogram(generateHistogram(values, histogramBins));
  };
  
  // Generate sample means
  const generateSampleMeans = () => {
    if (populationValues.length === 0) return;
    
    const means = [];
    for (let i = 0; i < numberOfSamples; i++) {
      // Take a random sample from the population
      const sample = [];
      for (let j = 0; j < sampleSize; j++) {
        const randomIndex = Math.floor(Math.random() * populationValues.length);
        sample.push(populationValues[randomIndex]);
      }
      means.push(calculateMean(sample));
    }
    
    setSampleMeans(means);
    
    const meanOfMeans = calculateMean(means);
    const stdDevOfMeans = calculateStdDev(means);
    
    setSampleMeanOfMeans(meanOfMeans);
    setSampleStdDevOfMeans(stdDevOfMeans);
    setSampleMeansHistogram(generateHistogram(means, histogramBins));
    
    // Generate theoretical normal curve
    setTheoryNormalCurve(generateNormalCurve(
      meanOfMeans, 
      stdDevOfMeans, 
      100, // number of points
      3    // range in terms of standard deviations
    ));
  };
  
  // Effect to regenerate data when parameters change
  useEffect(() => {
    generatePopulationData();
  }, [distributionType, histogramBins]);
  
  useEffect(() => {
    if (populationValues.length > 0) {
      generateSampleMeans();
    }
  }, [populationValues, sampleSize, numberOfSamples, histogramBins]);
  
  // Prepare combined data for the sample means chart
  const combinedSampleMeansData = [];
  const maxFrequency = Math.max(
    ...sampleMeansHistogram.map(d => d.frequency),
    ...theoryNormalCurve.map(d => d.y)
  );
  
  // Scale the normal curve to match the histogram height
  const normalScaleFactor = maxFrequency / Math.max(...theoryNormalCurve.map(d => d.y || 0));
  
  // Combine histogram and curve data for the chart
  sampleMeansHistogram.forEach(bin => {
    const matchingCurvePoint = theoryNormalCurve.find(p => 
      Math.abs(p.x - bin.x) < (bin.binEnd - bin.binStart) / 2
    );
    
    combinedSampleMeansData.push({
      x: bin.x.toFixed(2),
      frequency: bin.frequency,
      normalCurve: matchingCurvePoint ? matchingCurvePoint.y * normalScaleFactor : 0
    });
  });
  
  // If there are curve points not matched with histogram bins, add them
  theoryNormalCurve.forEach(point => {
    if (!combinedSampleMeansData.some(d => Math.abs(parseFloat(d.x) - point.x) < 0.01)) {
      combinedSampleMeansData.push({
        x: point.x.toFixed(2),
        frequency: 0,
        normalCurve: point.y * normalScaleFactor
      });
    }
  });
  
  // Sort by x for proper rendering
  combinedSampleMeansData.sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
  
  // Get text description of the current distribution
  const getDistributionDescription = () => {
    switch (distributionType) {
      case 'uniform':
        return "Uniform distribution (equal probability across all values)";
      case 'normal':
        return "Normal distribution (bell curve)";
      case 'exponential':
        return "Exponential distribution (rapid decay)";
      case 'bimodal':
        return "Bimodal distribution (two peaks)";
      case 'rightSkewed':
        return "Right-skewed distribution (long tail to the right)";
      case 'leftSkewed':
        return "Left-skewed distribution (long tail to the left)";
      default:
        return "Selected distribution";
    }
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Central Limit Theorem</h2>
            <p className="text-gray-600">
              See how the distribution of sample means approaches a normal distribution regardless of the original population's distribution.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Population Distribution:
              </label>
              <select
                value={distributionType}
                onChange={(e) => setDistributionType(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="uniform">Uniform</option>
                <option value="normal">Normal</option>
                <option value="exponential">Exponential</option>
                <option value="bimodal">Bimodal</option>
                <option value="rightSkewed">Right-skewed</option>
                <option value="leftSkewed">Left-skewed</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">{getDistributionDescription()}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Size (n): {sampleSize}
              </label>
              <input
                type="range"
                min="2"
                max="100"
                value={sampleSize}
                onChange={(e) => setSampleSize(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Number of observations in each sample</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Samples: {numberOfSamples}
              </label>
              <input
                type="range"
                min="10"
                max="5000"
                step="10"
                value={numberOfSamples}
                onChange={(e) => setNumberOfSamples(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Total number of sample means to calculate</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Histogram Bins: {histogramBins}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={histogramBins}
                onChange={(e) => setHistogramBins(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Number of bins in the histogram visualization</p>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="showTheory"
                checked={showTheory}
                onChange={(e) => setShowTheory(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showTheory" className="ml-2 block text-sm text-gray-700">
                Show theoretical normal curve
              </label>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => {
                  generatePopulationData();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
              >
                Regenerate Data
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div className="p-2 bg-blue-50 rounded">
            <span className="font-semibold">Population Mean:</span> {populationMean.toFixed(2)}
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <span className="font-semibold">Population Std Dev:</span> {populationStdDev.toFixed(2)}
          </div>
          <div className="p-2 bg-green-50 rounded">
            <span className="font-semibold">Mean of Sample Means:</span> {sampleMeanOfMeans.toFixed(2)}
          </div>
          <div className="p-2 bg-green-50 rounded">
            <span className="font-semibold">Std Dev of Sample Means:</span> {sampleStdDevOfMeans.toFixed(2)} 
            {" "}<span className="font-semibold text-gray-500">vs. Theoretical:</span>{" "}
            {(populationStdDev / Math.sqrt(sampleSize)).toFixed(2)}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-center">Population Distribution</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={populationHistogram}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="x" 
                  tickFormatter={(value) => value.toFixed(0)}
                  label={{ value: 'Value', position: 'bottom', offset: 15, style: { fontSize: '1rem', fontWeight: 500 } }} 
                  scale="linear"
                  tick={{ fontSize: 12 }}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  label={{ 
                    value: 'Relative Frequency', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: -5,
                    style: { fontSize: '1rem', fontWeight: 500, textAnchor: 'middle' } 
                  }}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip 
                  formatter={(value, name) => [value.toFixed(3), 'Frequency']}
                  labelFormatter={(label) => `Value: ${Math.round(parseFloat(label))}`}
                  contentStyle={{ fontSize: '14px' }}
                />
                <Bar dataKey="frequency" fill="#8884d8" barSize={100/histogramBins} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-center">Distribution of Sample Means</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={combinedSampleMeansData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="x" 
                  label={{ 
                    value: 'Sample Mean', 
                    position: 'bottom', 
                    offset: 35, // Increased offset to avoid overlap with legend
                    style: { fontSize: '1rem', fontWeight: 500 } 
                  }} 
                  scale="linear"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => parseFloat(value).toFixed(1)}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  label={{ 
                    value: 'Relative Frequency', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: -5,
                    style: { fontSize: '1rem', fontWeight: 500, textAnchor: 'middle' } 
                  }}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    value.toFixed(3), 
                    name === 'frequency' ? 'Actual Frequency' : 'Theoretical Normal'
                  ]}
                  labelFormatter={(label) => `Mean: ${parseFloat(label).toFixed(1)}`}
                  contentStyle={{ fontSize: '14px' }}
                />
                <Bar dataKey="frequency" fill="#82ca9d" barSize={100/histogramBins} />
                {showTheory && (
                  <Line 
                    type="monotone" 
                    dataKey="normalCurve" 
                    stroke="#ff7300" 
                    dot={false}
                    strokeWidth={2}
                    name="Theoretical Normal"
                  />
                )}
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ bottom: 10, left: 0, right: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">How This Visualization Works</h3>
        <p className="text-gray-700 mb-4">
          This visualization demonstrates the Central Limit Theorem, which states that when independent random variables are 
          added together, their sum tends toward a normal distribution even if the original variables are not normally distributed.
        </p>
        
        <div className="mt-4">
          <h4 className="font-semibold">The Central Limit Theorem states:</h4>
          <p className="ml-4 mt-2 text-gray-700">
            Given a population with mean μ and standard deviation σ, the sampling distribution of the mean 
            approaches a normal distribution with mean μ and standard deviation σ/√n as the sample size (n) increases.
          </p>
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold">In this visualization:</h4>
          <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-2">
            <li>We start with a population having any distribution (uniform, exponential, etc.)</li>
            <li>We take many random samples of size n from this population</li>
            <li>We calculate the mean of each sample</li>
            <li>We plot the distribution of these sample means</li>
            <li>As predicted by the Central Limit Theorem, this distribution approaches a normal distribution</li>
          </ol>
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold">Tips:</h4>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            <li>Try different population distributions to see that the CLT works regardless of the original shape</li>
            <li>Increase the sample size to see the distribution of means become more normal</li>
            <li>Note how the standard deviation of sample means decreases as sample size increases (by a factor of 1/√n)</li>
            <li>Compare the actual distribution of sample means with the theoretical normal curve</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CentralLimitTheoremVisualizer;