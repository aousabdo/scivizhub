/**
 * Neural Network Utilities
 * 
 * This file contains functions for creating, training, and visualizing neural networks.
 */

// Create a neural network with specified architecture
export const createNeuralNetwork = (inputSize, hiddenLayerSizes, outputSize, activationName, outputActivationName) => {
    // Activation functions
    const activations = {
      sigmoid: x => 1 / (1 + Math.exp(-x)),
      tanh: x => Math.tanh(x),
      relu: x => Math.max(0, x),
      linear: x => x
    };
    
    // Activation derivatives (for backpropagation)
    const activationDerivatives = {
      sigmoid: (x) => {
        const s = activations.sigmoid(x);
        return s * (1 - s);
      },
      tanh: (x) => 1 - Math.pow(Math.tanh(x), 2),
      relu: (x) => x > 0 ? 1 : 0,
      linear: () => 1
    };
    
    // Get the activation functions
    const activation = activations[activationName] || activations.sigmoid;
    const activationDerivative = activationDerivatives[activationName] || activationDerivatives.sigmoid;
    
    const outputActivation = activations[outputActivationName] || activations.sigmoid;
    const outputActivationDerivative = activationDerivatives[outputActivationName] || activationDerivatives.sigmoid;
    
    // Define the network architecture
    const layerSizes = [inputSize, ...hiddenLayerSizes, outputSize];
    
    // Initialize weights and biases with Xavier/Glorot initialization
    const weights = [];
    const biases = [];
    
    for (let i = 0; i < layerSizes.length - 1; i++) {
      const inputSize = layerSizes[i];
      const outputSize = layerSizes[i + 1];
      
      // Initialize weights with small random values
      const layerWeights = Array(outputSize).fill().map(() => 
        Array(inputSize).fill().map(() => 
          (Math.random() * 2 - 1) * Math.sqrt(6 / (inputSize + outputSize))
        )
      );
      
      // Initialize biases with small random values
      const layerBiases = Array(outputSize).fill().map(() => 
        (Math.random() * 2 - 1) * 0.1
      );
      
      weights.push(layerWeights);
      biases.push(layerBiases);
    }
    
    return {
      weights,
      biases,
      layerSizes,
      activation,
      activationDerivative,
      outputActivation,
      outputActivationDerivative
    };
  };
  
  // Forward propagation - compute network output for an input
  export const forwardPropagation = (network, input) => {
    const { weights, biases, activation, outputActivation } = network;
    
    // Initialize with input
    let layerOutput = input;
    const allActivations = [layerOutput]; // Store all layer activations for backprop
    const allZs = []; // Store all pre-activation values for backprop
    
    // Process each layer except the last one
    for (let i = 0; i < weights.length - 1; i++) {
      const layerWeights = weights[i];
      const layerBiases = biases[i];
      
      // Calculate weighted sum for each neuron in the layer
      const zs = layerWeights.map((neuronWeights, neuronIndex) => {
        let sum = layerBiases[neuronIndex];
        for (let j = 0; j < neuronWeights.length; j++) {
          sum += neuronWeights[j] * layerOutput[j];
        }
        return sum;
      });
      
      allZs.push(zs);
      
      // Apply activation function
      layerOutput = zs.map(z => activation(z));
      allActivations.push(layerOutput);
    }
    
    // Process the output layer
    const outputLayerIndex = weights.length - 1;
    const outputLayerWeights = weights[outputLayerIndex];
    const outputLayerBiases = biases[outputLayerIndex];
    
    const outputZs = outputLayerWeights.map((neuronWeights, neuronIndex) => {
      let sum = outputLayerBiases[neuronIndex];
      for (let j = 0; j < neuronWeights.length; j++) {
        sum += neuronWeights[j] * layerOutput[j];
      }
      return sum;
    });
    
    allZs.push(outputZs);
    
    // Apply output activation function
    const finalOutput = outputZs.map(z => outputActivation(z));
    allActivations.push(finalOutput);
    
    return {
      output: finalOutput,
      activations: allActivations,
      zs: allZs
    };
  };
  
  // Backpropagation - compute gradients for weights and biases
  export const backpropagation = (network, input, target) => {
    const { weights, biases, activation, activationDerivative, outputActivation, outputActivationDerivative } = network;
    
    // Forward pass to get activations and zs
    const { activations, zs } = forwardPropagation(network, input);
    
    // Initialize arrays for gradients
    const weightGradients = weights.map(layerWeights => 
      layerWeights.map(neuronWeights => 
        Array(neuronWeights.length).fill(0)
      )
    );
    
    const biasGradients = biases.map(layerBiases => 
      Array(layerBiases.length).fill(0)
    );
    
    // Calculate output layer error (delta)
    const outputLayerIndex = zs.length - 1;
    const outputError = [];
    
    for (let i = 0; i < activations[activations.length - 1].length; i++) {
      const a = activations[activations.length - 1][i];
      const z = zs[outputLayerIndex][i];
      
      // Binary cross-entropy derivative * activation derivative
      // For binary classification, this simplifies to (a - target)
      const error = (a - target[i]) * outputActivationDerivative(z);
      outputError.push(error);
    }
    
    // Backpropagate the error through the network
    let currentLayerError = outputError;
    
    for (let l = outputLayerIndex; l >= 0; l--) {
      // Calculate gradients for weights and biases
      for (let i = 0; i < currentLayerError.length; i++) {
        biasGradients[l][i] = currentLayerError[i];
        
        for (let j = 0; j < activations[l].length; j++) {
          weightGradients[l][i][j] = currentLayerError[i] * activations[l][j];
        }
      }
      
      // Propagate error to previous layer (if not at input layer)
      if (l > 0) {
        const prevLayerError = [];
        
        for (let j = 0; j < activations[l - 1].length; j++) {
          let error = 0;
          
          for (let i = 0; i < currentLayerError.length; i++) {
            error += currentLayerError[i] * weights[l][i][j];
          }
          
          error *= activationDerivative(zs[l - 1][j]);
          prevLayerError.push(error);
        }
        
        currentLayerError = prevLayerError;
      }
    }
    
    return {
      weightGradients,
      biasGradients
    };
  };
  
  // Update network parameters using gradients and learning rate
  export const updateNetwork = (network, weightGradients, biasGradients, learningRate) => {
    const updatedWeights = network.weights.map((layerWeights, l) => 
      layerWeights.map((neuronWeights, i) => 
        neuronWeights.map((weight, j) => 
          weight - learningRate * weightGradients[l][i][j]
        )
      )
    );
    
    const updatedBiases = network.biases.map((layerBiases, l) => 
      layerBiases.map((bias, i) => 
        bias - learningRate * biasGradients[l][i]
      )
    );
    
    return {
      ...network,
      weights: updatedWeights,
      biases: updatedBiases
    };
  };
  
  // Predict a single point
  export const predictPoint = (network, input) => {
    const { output } = forwardPropagation(network, input);
    return output[0]; // For binary classification, we return the single output
  };
  
  // Train the neural network for one epoch - simplified version
  export const trainNeuralNetwork = async (network, trainingData, batchSize, learningRate) => {
    if (!network || !trainingData || trainingData.length === 0) {
      console.error("Invalid network or training data");
      return { loss: Infinity, updatedNetwork: network };
    }
    
    try {
      // Make deep copy of network to avoid reference issues
      const updatedNetwork = JSON.parse(JSON.stringify(network));
      
      // Shuffle the training data
      const shuffledData = [...trainingData].sort(() => Math.random() - 0.5);
      
      let totalLoss = 0;
      let samplesProcessed = 0;
      
      // Process data in mini-batches
      for (let i = 0; i < shuffledData.length; i += batchSize) {
        const batch = shuffledData.slice(i, Math.min(i + batchSize, shuffledData.length));
        
        // Train on this batch
        for (const example of batch) {
          // Convert data point to network input format
          const input = [example.x, example.y];
          const target = [example.label]; 
          
          // Forward pass
          const { output } = forwardPropagation(updatedNetwork, input);
          
          // Calculate loss (binary cross-entropy)
          const prediction = output[0];
          const label = target[0];
          
          // Avoid log(0) errors
          const epsilon = 1e-15;
          const clippedPred = Math.max(epsilon, Math.min(1 - epsilon, prediction));
          
          // Binary cross-entropy loss
          const loss = -1 * (label * Math.log(clippedPred) + (1 - label) * Math.log(1 - clippedPred));
          totalLoss += loss;
          
          // Get gradients via backpropagation
          const { weightGradients, biasGradients } = backpropagation(updatedNetwork, input, target);
          
          // Apply gradients immediately (stochastic gradient descent)
          for (let l = 0; l < updatedNetwork.weights.length; l++) {
            for (let i = 0; i < updatedNetwork.weights[l].length; i++) {
              for (let j = 0; j < updatedNetwork.weights[l][i].length; j++) {
                updatedNetwork.weights[l][i][j] -= learningRate * weightGradients[l][i][j];
              }
            }
          }
          
          for (let l = 0; l < updatedNetwork.biases.length; l++) {
            for (let i = 0; i < updatedNetwork.biases[l].length; i++) {
              updatedNetwork.biases[l][i] -= learningRate * biasGradients[l][i];
            }
          }
          
          samplesProcessed++;
        }
      }
      
      // Calculate average loss
      const averageLoss = totalLoss / samplesProcessed;
      
      return {
        loss: averageLoss,
        updatedNetwork: updatedNetwork
      };
    } catch (error) {
      console.error("Error in neural network training:", error);
      return { loss: Infinity, updatedNetwork: network };
    }
  };
  
  // Generate synthetic datasets for binary classification
  export const generateData = (type, count, noiseLevel = 0.1) => {
    const data = [];
    const labels = [];
    
    switch (type) {
      case 'circles':
        // Concentric circles
        for (let i = 0; i < count; i++) {
          const r1 = 0.3 + noiseLevel * (Math.random() - 0.5);
          const r2 = 0.7 + noiseLevel * (Math.random() - 0.5);
          const angle = Math.random() * 2 * Math.PI;
          
          // Decide which circle this point belongs to
          const radius = Math.random() > 0.5 ? r1 : r2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          
          data.push([x, y]);
          labels.push(radius < 0.5 ? 0 : 1); // Inner circle is class 0, outer is class 1
        }
        break;
      
      case 'moons':
        // Two interleaving half-moons
        for (let i = 0; i < count; i++) {
          const label = Math.random() > 0.5 ? 0 : 1;
          
          if (label === 0) {
            // Bottom moon
            const angle = Math.PI * Math.random();
            const x = Math.cos(angle) + noiseLevel * (Math.random() - 0.5) * 2;
            const y = Math.sin(angle) - 0.5 + noiseLevel * (Math.random() - 0.5) * 2;
            
            data.push([x, y]);
            labels.push(label);
          } else {
            // Top moon
            const angle = Math.PI * Math.random();
            const x = 1 - Math.cos(angle) + noiseLevel * (Math.random() - 0.5) * 2;
            const y = 1 - Math.sin(angle) - 0.5 + noiseLevel * (Math.random() - 0.5) * 2;
            
            data.push([x, y]);
            labels.push(label);
          }
        }
        break;
      
      case 'spiral':
        // Two intertwined spirals
        for (let i = 0; i < count; i++) {
          const label = Math.random() > 0.5 ? 0 : 1;
          const r = Math.random() * 0.7 + 0.1;
          
          let theta = 3 * Math.PI * r;
          if (label === 1) {
            theta = theta + Math.PI; // Rotate by 180 degrees for second spiral
          }
          
          const x = r * Math.cos(theta) + noiseLevel * (Math.random() - 0.5) * 2;
          const y = r * Math.sin(theta) + noiseLevel * (Math.random() - 0.5) * 2;
          
          data.push([x, y]);
          labels.push(label);
        }
        break;
      
      case 'xor':
        // XOR pattern (four quadrants)
        for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * 2;
          const y = (Math.random() - 0.5) * 2;
          
          // Add noise to coordinates
          const noisyX = x + noiseLevel * (Math.random() - 0.5);
          const noisyY = y + noiseLevel * (Math.random() - 0.5);
          
          // XOR logic: different class if signs are the same
          const label = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : 0;
          
          data.push([noisyX, noisyY]);
          labels.push(label);
        }
        break;
      
      case 'random':
      default:
        // Random clusters
        const centers = [
          [-0.5, 0.5], [0.5, 0.5], [0, -0.5], [-0.8, -0.8], [0.8, -0.8]
        ];
        
        const clusterLabels = [0, 1, 1, 0, 1]; // Assigned class for each cluster
        
        for (let i = 0; i < count; i++) {
          // Select a random cluster
          const clusterIndex = Math.floor(Math.random() * centers.length);
          const [centerX, centerY] = centers[clusterIndex];
          
          // Add point with noise around the center
          const x = centerX + noiseLevel * 2 * (Math.random() - 0.5);
          const y = centerY + noiseLevel * 2 * (Math.random() - 0.5);
          
          data.push([x, y]);
          labels.push(clusterLabels[clusterIndex]);
        }
        break;
    }
    
    return { data, labels };
  };
  
  // Draw data points on the canvas
  export const drawDataPoints = (ctx, data, width, height) => {
    if (!ctx || !data) return;
    
    // Scale from data coordinates to canvas coordinates
    const scaleX = (x) => (x + 1) * width / 2;
    const scaleY = (y) => (1 - y) * height / 2;
    
    // Draw each data point
    data.forEach(point => {
      const { x, y, label } = point;
      
      // Set color based on class
      ctx.fillStyle = label === 0 ? '#3B82F6' : '#EF4444';
      
      // Draw the point
      ctx.beginPath();
      ctx.arc(scaleX(x), scaleY(y), 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };
  
  // Draw decision boundary on the canvas
  export const drawDecisionBoundary = (ctx, network, width, height, resolution = 50) => {
    if (!ctx || !network) return;
    
    // Create grid of points covering the canvas
    const step = 2 / resolution; // Step size in data coordinates (-1 to 1)
    
    // Create an ImageData object for efficient pixel manipulation
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // For each point in the grid, predict the class and color the pixel
    for (let i = 0; i < resolution; i++) {
      const x = -1 + i * step;
      
      for (let j = 0; j < resolution; j++) {
        const y = 1 - j * step;
        
        // Predict class
        const prediction = predictPoint(network, [x, y]);
        
        // Convert prediction to color (blue for class 0, red for class 1)
        // Use an alpha channel for visualization
        const alpha = 0.2; // Set transparency
        
        if (prediction < 0.5) {
          // Class 0 - Blue gradient based on confidence
          const intensity = 1 - prediction * 2; // 1.0 to 0.0 as prediction goes from 0.0 to 0.5
          const r = 0;
          const g = Math.floor(120 * intensity);
          const b = Math.floor(255 * intensity);
          
          // Map data coordinates to canvas pixel coordinates
          const canvasX = Math.floor((x + 1) * width / 2);
          const canvasY = Math.floor((1 - y) * height / 2);
          
          // Skip if outside canvas bounds
          if (canvasX < 0 || canvasX >= width || canvasY < 0 || canvasY >= height) continue;
          
          // Set pixel color in ImageData (accounting for pixel scaling)
          const scale = width / resolution;
          for (let pixelX = 0; pixelX < scale; pixelX++) {
            for (let pixelY = 0; pixelY < scale; pixelY++) {
              const dataIndex = 4 * ((canvasY + pixelY) * width + (canvasX + pixelX));
              if (dataIndex < 0 || dataIndex >= data.length - 3) continue;
              
              // Only color if not overwriting existing data point
              if (data[dataIndex + 3] === 0) {
                data[dataIndex] = r;     // R
                data[dataIndex + 1] = g; // G
                data[dataIndex + 2] = b; // B
                data[dataIndex + 3] = Math.floor(255 * alpha); // A
              }
            }
          }
        } else {
          // Class 1 - Red gradient based on confidence
          const intensity = (prediction - 0.5) * 2; // 0.0 to 1.0 as prediction goes from 0.5 to 1.0
          const r = Math.floor(255 * intensity);
          const g = Math.floor(50 * intensity);
          const b = 0;
          
          // Map data coordinates to canvas pixel coordinates
          const canvasX = Math.floor((x + 1) * width / 2);
          const canvasY = Math.floor((1 - y) * height / 2);
          
          // Skip if outside canvas bounds
          if (canvasX < 0 || canvasX >= width || canvasY < 0 || canvasY >= height) continue;
          
          // Set pixel color in ImageData (accounting for pixel scaling)
          const scale = width / resolution;
          for (let pixelX = 0; pixelX < scale; pixelX++) {
            for (let pixelY = 0; pixelY < scale; pixelY++) {
              const dataIndex = 4 * ((canvasY + pixelY) * width + (canvasX + pixelX));
              if (dataIndex < 0 || dataIndex >= data.length - 3) continue;
              
              // Only color if not overwriting existing data point
              if (data[dataIndex + 3] === 0) {
                data[dataIndex] = r;     // R
                data[dataIndex + 1] = g; // G
                data[dataIndex + 2] = b; // B
                data[dataIndex + 3] = Math.floor(255 * alpha); // A
              }
            }
          }
        }
      }
    }
    
    // Draw the ImageData to the canvas
    ctx.putImageData(imageData, 0, 0);
  };