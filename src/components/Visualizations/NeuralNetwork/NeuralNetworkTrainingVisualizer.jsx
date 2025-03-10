import React, { useState, useEffect, useRef } from 'react';
import { 
  createNeuralNetwork, 
  generateData, 
  predictPoint, 
  trainNeuralNetwork,
  drawDataPoints,
  drawDecisionBoundary
} from './neuralNetworkUtils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';

const NeuralNetworkTrainingVisualizer = () => {
  // Network configuration state
  const [networkConfig, setNetworkConfig] = useState({
    hiddenLayers: [5],
    learningRate: 0.03,
    activation: 'sigmoid',
    outputActivation: 'sigmoid'
  });
  
  // Training data state
  const [datasetType, setDatasetType] = useState('circles');
  const [dataPointCount, setDataPointCount] = useState(200);
  const [noise, setNoise] = useState(0.1);
  const [trainingData, setTrainingData] = useState([]);
  const [testData, setTestData] = useState([]);
  
  // Training state
  const [network, setNetwork] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [maxEpochs, setMaxEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(32);
  const [trainingMetrics, setTrainingMetrics] = useState([]);
  const [accuracy, setAccuracy] = useState(0);
  const [showBoundary, setShowBoundary] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  
  // Animation and visualization state
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [boundaryResolution, setBoundaryResolution] = useState(50);
  
  // Refs
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Initialize on component mount
  useEffect(() => {
    generateNewData();
    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        clearTimeout(animationRef.current);
      }
    };
  }, []);
  
  // Update canvas on data or network change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Ensure canvas is properly sized
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = canvas.width; // Make it square
      }
      
      // Draw the visualization
      drawVisualization();
    }
  }, [trainingData, network, epoch, showBoundary]);
  
  // Generate new dataset based on settings
  const generateNewData = () => {
    console.log("Generating new data, type:", datasetType, "count:", dataPointCount);
    
    try {
      // Generate data points
      const { data, labels } = generateData(datasetType, dataPointCount, noise);
      console.log("Generated data points:", data.length);
      
      if (!data || data.length === 0) {
        console.error("No data generated");
        return;
      }
      
      // Split into training/test sets (80/20)
      const splitIndex = Math.floor(data.length * 0.8);
      
      // Format data for the neural network
      const trainData = [];
      const testData = [];
      
      for (let i = 0; i < data.length; i++) {
        const point = {
          x: data[i][0],
          y: data[i][1],
          label: labels[i]
        };
        
        if (i < splitIndex) {
          trainData.push(point);
        } else {
          testData.push(point);
        }
      }
      
      console.log("Training data:", trainData.length, "Test data:", testData.length);
      
      // Update state
      setTrainingData(trainData);
      setTestData(testData);
      setEpoch(0);
      setTrainingMetrics([]);
      setAccuracy(0);
      setPredictionResult(null);
      setSelectedPoint(null);
      
      // Create a new neural network
      initializeNetwork();
      
    } catch (error) {
      console.error("Error generating data:", error);
    }
  };
  
  // Initialize a new neural network
  const initializeNetwork = () => {
    const inputSize = 2; // x, y coordinates
    const outputSize = 1; // binary classification
    
    // Create a fresh network with current config
    const newNetwork = createNeuralNetwork(
      inputSize,
      networkConfig.hiddenLayers,
      outputSize,
      networkConfig.activation,
      networkConfig.outputActivation || 'sigmoid' // Ensure we have an output activation
    );
    
    console.log("Created new neural network:", newNetwork);
    
    setNetwork(newNetwork);
    setEpoch(0);
    setTrainingMetrics([]);
    setAccuracy(0);
    
    // Immediately draw with the new network
    setTimeout(() => {
      drawVisualization();
    }, 0);
  };
  
  // Start or stop the training process
  const toggleTraining = () => {
    if (isTraining) {
      setIsTraining(false);
      return;
    }
    
    setIsTraining(true);
    trainNetwork();
  };
  
  // Train the network for one epoch
  const trainNetwork = () => {
    console.log("Training network, epoch:", epoch, "max:", maxEpochs);
    
    if (!network) {
      console.error("No network available for training");
      setIsTraining(false);
      return;
    }
    
    if (!isTraining || epoch >= maxEpochs) {
      console.log("Training stopped - isTraining:", isTraining, "epoch:", epoch);
      setIsTraining(false);
      return;
    }
    
    try {
      // Use a simple function to perform one epoch of training
      console.log("Training one epoch...");
      const doTrainingStep = async () => {
        // Train for one epoch
        const result = await trainNeuralNetwork(
          network,
          trainingData,
          batchSize, 
          networkConfig.learningRate
        );
        
        console.log("Training result:", result);
        
        // Update state with the new network
        setNetwork(result.updatedNetwork);
        setEpoch(e => e + 1);
        
        // Calculate accuracy on test set
        const acc = calculateAccuracy(result.updatedNetwork, testData);
        setAccuracy(acc);
        
        // Update training metrics
        setTrainingMetrics(prev => [
          ...prev,
          {
            epoch: epoch + 1,
            loss: result.loss,
            accuracy: acc
          }
        ]);
        
        // Schedule next epoch
        animationRef.current = setTimeout(() => {
          if (isTraining && epoch < maxEpochs - 1) {
            trainNetwork();
          } else {
            setIsTraining(false);
          }
        }, animationSpeed);
      };
      
      // Execute the training step
      doTrainingStep();
      
    } catch (error) {
      console.error("Error during neural network training:", error);
      setIsTraining(false);
    }
  };
  
  // Calculate accuracy on a dataset
  const calculateAccuracy = (network, dataset) => {
    if (!network || !dataset.length) return 0;
    
    let correct = 0;
    
    for (const point of dataset) {
      const input = [point.x, point.y];
      const prediction = predictPoint(network, input) > 0.5 ? 1 : 0;
      if (prediction === point.label) {
        correct++;
      }
    }
    
    return correct / dataset.length;
  };
  
  // Draw the visualization on canvas
  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas ref is null");
      return;
    }
    
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw coordinate grid
      drawGrid(ctx, width, height);
      
      // Draw decision boundary if network exists and option enabled
      if (network && showBoundary) {
        console.log("Drawing decision boundary...");
        drawDecisionBoundary(ctx, network, width, height, boundaryResolution);
      }
      
      // Draw data points
      if (trainingData && trainingData.length > 0) {
        console.log("Drawing data points...");
        drawDataPoints(ctx, trainingData, width, height);
      } else {
        console.warn("No training data to draw");
      }
      
      // Highlight selected point if any
      if (selectedPoint) {
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 3;
        
        const scaledX = (selectedPoint.x + 1) * width / 2;
        const scaledY = (1 - selectedPoint.y) * height / 2;
        
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      console.log("Visualization drawn successfully");
    } catch (error) {
      console.error("Error drawing visualization:", error);
    }
  };
  
  // Draw coordinate grid
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    
    // Draw x and y axes
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#F0F0F0';
    const gridSize = 4; // Number of grid cells in each quadrant
    
    for (let i = 1; i < gridSize; i++) {
      const x = i * width / (gridSize * 2);
      
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(width / 2 + x, 0);
      ctx.lineTo(width / 2 + x, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width / 2 - x, 0);
      ctx.lineTo(width / 2 - x, height);
      ctx.stroke();
      
      // Horizontal lines
      const y = i * height / (gridSize * 2);
      ctx.beginPath();
      ctx.moveTo(0, height / 2 + y);
      ctx.lineTo(width, height / 2 + y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, height / 2 - y);
      ctx.lineTo(width, height / 2 - y);
      ctx.stroke();
    }
  };
  
  // Handle canvas click - make prediction for clicked point
  const handleCanvasClick = (e) => {
    if (!network) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width * 2 - 1; // Convert to -1 to 1 range
    const y = 1 - (e.clientY - rect.top) / canvas.height * 2; // Convert to -1 to 1 range and flip y
    
    const newPoint = { x, y };
    setSelectedPoint(newPoint);
    
    // Make prediction
    const prediction = predictPoint(network, [x, y]);
    setPredictionResult({
      rawOutput: prediction,
      classLabel: prediction > 0.5 ? 1 : 0
    });
  };
  
  // Reset the visualization
  const handleReset = () => {
    setIsTraining(false);
    generateNewData();
  };
  
  // Update hidden layer configuration
  const updateHiddenLayers = (index, value) => {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue) || newValue < 1) return;
    
    const newHiddenLayers = [...networkConfig.hiddenLayers];
    newHiddenLayers[index] = newValue;
    
    setNetworkConfig({
      ...networkConfig,
      hiddenLayers: newHiddenLayers
    });
  };
  
  // Add new hidden layer
  const addHiddenLayer = () => {
    const newHiddenLayers = [...networkConfig.hiddenLayers, 5];
    setNetworkConfig({
      ...networkConfig,
      hiddenLayers: newHiddenLayers
    });
  };
  
  // Remove hidden layer
  const removeHiddenLayer = (index) => {
    if (networkConfig.hiddenLayers.length <= 1) return;
    
    const newHiddenLayers = networkConfig.hiddenLayers.filter((_, i) => i !== index);
    setNetworkConfig({
      ...networkConfig,
      hiddenLayers: newHiddenLayers
    });
  };
  
  // Format number for display
  const formatNumber = (num) => {
    return Math.abs(num) < 0.01 ? num.toExponential(2) : num.toFixed(3);
  };
  
  // Get name of current activation function
  const getActivationName = (key) => {
    const activations = {
      sigmoid: 'Sigmoid',
      tanh: 'Tanh',
      relu: 'ReLU'
    };
    return activations[key] || key;
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Neural Network Training Visualization</h2>
            <p className="text-gray-600">Watch a neural network learn to classify data in real-time.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-0">
            <button
              onClick={toggleTraining}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isTraining
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isTraining ? 'Stop Training' : 'Start Training'}
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
              disabled={isTraining}
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dataset Type:
              </label>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
                disabled={isTraining}
              >
                <option value="circles">Concentric Circles</option>
                <option value="moons">Two Moons</option>
                <option value="spiral">Spiral</option>
                <option value="xor">XOR Pattern</option>
                <option value="random">Random Clusters</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Points: {dataPointCount}
              </label>
              <input
                type="range"
                min="50"
                max="500"
                value={dataPointCount}
                onChange={(e) => setDataPointCount(parseInt(e.target.value))}
                className="w-full"
                disabled={isTraining}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Noise Level: {noise.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.01"
                value={noise}
                onChange={(e) => setNoise(parseFloat(e.target.value))}
                className="w-full"
                disabled={isTraining}
              />
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-md font-medium mb-2">Network Architecture</h3>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hidden Layers:
                </label>
                <div className="flex flex-col space-y-2">
                  {networkConfig.hiddenLayers.map((neurons, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={neurons}
                        onChange={(e) => updateHiddenLayers(index, e.target.value)}
                        className="w-20 p-1 border border-gray-300 rounded-md"
                        disabled={isTraining}
                      />
                      <span className="text-sm text-gray-600">neurons in layer {index + 1}</span>
                      <button
                        onClick={() => removeHiddenLayer(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                        disabled={networkConfig.hiddenLayers.length <= 1 || isTraining}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addHiddenLayer}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors self-start"
                    disabled={networkConfig.hiddenLayers.length >= 5 || isTraining}
                  >
                    + Add Layer
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activation Function:
                  </label>
                  <select
                    value={networkConfig.activation}
                    onChange={(e) => setNetworkConfig({...networkConfig, activation: e.target.value})}
                    className="block w-full p-1 border border-gray-300 rounded-md text-sm"
                    disabled={isTraining}
                  >
                    <option value="sigmoid">Sigmoid</option>
                    <option value="tanh">Tanh</option>
                    <option value="relu">ReLU</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Rate: {networkConfig.learningRate}
                  </label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={networkConfig.learningRate}
                    onChange={(e) => setNetworkConfig({...networkConfig, learningRate: parseFloat(e.target.value)})}
                    className="w-full"
                    disabled={isTraining}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Epochs: {maxEpochs}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={maxEpochs}
                onChange={(e) => setMaxEpochs(parseInt(e.target.value))}
                className="w-full"
                disabled={isTraining}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size: {batchSize}
              </label>
              <input
                type="range"
                min="1"
                max="64"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full"
                disabled={isTraining}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed: {animationSpeed}ms
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="showBoundary"
                checked={showBoundary}
                onChange={() => setShowBoundary(!showBoundary)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showBoundary" className="ml-2 block text-sm text-gray-700">
                Show Decision Boundary
              </label>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-md font-medium mb-2">Training Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-2 bg-blue-50 rounded">
                  <span className="font-semibold">Current Epoch:</span> {epoch} / {maxEpochs}
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <span className="font-semibold">Test Accuracy:</span> {(accuracy * 100).toFixed(1)}%
                </div>
                {selectedPoint && predictionResult && (
                  <>
                    <div className="p-2 bg-yellow-50 rounded">
                      <span className="font-semibold">Network Output:</span> {formatNumber(predictionResult.rawOutput)}
                    </div>
                    <div className="p-2 bg-yellow-50 rounded">
                      <span className="font-semibold">Predicted Class:</span> {predictionResult.classLabel}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Click on the visualization to test predictions at specific points</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Network Visualization</h3>
          <div className="relative">
            <canvas 
              ref={canvasRef} 
              width={500} 
              height={500} 
              className="border border-gray-300 rounded-lg w-full h-auto cursor-crosshair"
              onClick={handleCanvasClick}
            />
            
            <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-md p-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span>Class 0</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span>Class 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
          <div className="h-80">
            {trainingMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trainingMetrics}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="epoch" 
                    label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} 
                    domain={[0, 'auto']}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ value: 'Accuracy', angle: 90, position: 'insideRight' }} 
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip formatter={(value, name) => {
                    return name === 'accuracy' 
                      ? `${(value * 100).toFixed(1)}%` 
                      : value.toFixed(4);
                  }} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#8884d8" 
                    name="Loss" 
                    dot={false}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#82ca9d" 
                    name="Accuracy" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 border rounded-lg">
                <p className="text-gray-500">Start training to see metrics</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">About Neural Networks</h3>
        <div className="prose max-w-none">
          <p>
            Neural networks are computational systems inspired by the human brain. They consist of layers of 
            interconnected nodes or "neurons" that process information and learn patterns from data.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg my-4 border border-blue-200">
            <h4 className="text-md font-semibold mb-2">Network Architecture</h4>
            <ul className="list-disc list-inside">
              <li><strong>Input Layer:</strong> Receives raw data (in this case, x and y coordinates)</li>
              <li><strong>Hidden Layers:</strong> Intermediate layers that extract and process features</li>
              <li><strong>Output Layer:</strong> Produces the final prediction (class probability)</li>
              <li><strong>Activation Functions:</strong> Non-linear functions that allow networks to learn complex patterns</li>
            </ul>
            
            <h4 className="text-md font-semibold mt-4 mb-2">Neural Network Training</h4>
            <ul className="list-disc list-inside">
              <li><strong>Forward Pass:</strong> Data flows through the network, producing predictions</li>
              <li><strong>Loss Calculation:</strong> The difference between predictions and actual values is measured</li>
              <li><strong>Backpropagation:</strong> Error is propagated backward to adjust weights</li>
              <li><strong>Gradient Descent:</strong> Weights are updated to minimize the loss function</li>
            </ul>
          </div>
          
          <p>
            In this visualization, you can observe how a neural network learns to classify data points into two classes. 
            The decision boundary shows the regions where the network predicts class 0 (blue) and class 1 (red).
          </p>
          
          <p>
            Try different dataset types and network architectures to see how they affect the learning process and 
            the final decision boundary. Complex datasets may require more neurons or layers to classify correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkTrainingVisualizer;