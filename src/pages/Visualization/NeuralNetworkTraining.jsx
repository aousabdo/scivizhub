import React from 'react';
import NeuralNetworkTrainingVisualizer from '../../components/Visualizations/NeuralNetwork/NeuralNetworkTrainingVisualizer';

const NeuralNetworkTrainingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Neural Network Training</h1>
      
      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          Neural networks are a cornerstone of modern machine learning, inspired by the structure and function of 
          the human brain. This interactive visualization allows you to watch a neural network learn to classify 
          data in real-time, providing intuition about how these powerful algorithms work.
        </p>
        <p>
          You can adjust the network architecture, training parameters, and dataset properties to see how they 
          affect the learning process. The visualization reveals both the decision boundary as it evolves and the 
          training metrics to track progress.
        </p>
      </div>
      
      <NeuralNetworkTrainingVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Understanding Neural Networks</h2>
        
        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">How Neural Networks Learn</h3>
            <p>
              Neural networks learn through a process called backpropagation, which involves:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-3">
              <li><strong>Forward Pass:</strong> Input data flows through the network to produce predictions</li>
              <li><strong>Loss Calculation:</strong> The error between predictions and actual values is measured</li>
              <li><strong>Backward Pass:</strong> The error is propagated backwards to calculate how each weight contributes to it</li>
              <li><strong>Weight Update:</strong> Weights are adjusted to reduce the error using gradient descent</li>
            </ol>
            <p className="mt-3">
              This process is repeated many times over different examples, gradually improving the network's performance.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">Key Concepts in Neural Networks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Architecture Components</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong>Neurons:</strong> Basic computational units</li>
                  <li><strong>Weights:</strong> Connection strengths between neurons</li>
                  <li><strong>Biases:</strong> Threshold values for neuron activation</li>
                  <li><strong>Activation Functions:</strong> Non-linearities that enable complex learning</li>
                  <li><strong>Layers:</strong> Organized groups of neurons</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Training Parameters</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong>Learning Rate:</strong> Step size for weight updates</li>
                  <li><strong>Batch Size:</strong> Number of examples processed together</li>
                  <li><strong>Epochs:</strong> Complete passes through the training data</li>
                  <li><strong>Loss Function:</strong> Measure of prediction error</li>
                  <li><strong>Regularization:</strong> Techniques to prevent overfitting</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-3">Neural Network Applications</h3>
            <p>
              Neural networks power many of the technologies we use every day:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Computer Vision:</strong> Image recognition, object detection, facial recognition</li>
              <li><strong>Natural Language Processing:</strong> Translation, sentiment analysis, chatbots</li>
              <li><strong>Speech Recognition:</strong> Voice assistants, transcription services</li>
              <li><strong>Recommendation Systems:</strong> Personalized content on streaming and shopping platforms</li>
              <li><strong>Medical Diagnostics:</strong> Disease detection from medical images</li>
              <li><strong>Financial Analysis:</strong> Fraud detection, algorithmic trading</li>
              <li><strong>Gaming:</strong> AI opponents, procedural content generation</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">Tips for Experimentation</h2>
          <p>
            To get the most out of this visualization, try the following experiments:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Dataset Complexity:</strong> Start with simple datasets like XOR, then progress to more complex ones like spirals</li>
            <li><strong>Network Depth:</strong> Compare how networks with different numbers of layers handle the same dataset</li>
            <li><strong>Neuron Count:</strong> Observe how having too few or too many neurons affects learning</li>
            <li><strong>Learning Rate:</strong> See how this parameter affects training speed and stability</li>
            <li><strong>Activation Functions:</strong> Compare different activations to understand their strengths</li>
            <li><strong>Decision Boundaries:</strong> Watch how the boundary evolves during training</li>
            <li><strong>Noise Level:</strong> Observe how increasing noise affects the network's ability to find patterns</li>
          </ul>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "The power of neural networks lies not in their individual neurons, but in the emergent behaviors that arise from their connections."
          </p>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkTrainingPage;