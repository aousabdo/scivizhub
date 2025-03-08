import React from 'react';
import BayesTheoremVisualizer from '../../components/Visualizations/BayesTheorem/BayesTheoremVisualizer';

const BayesTheoremPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Understanding Bayes' Theorem</h1>
      
      <div className="prose max-w-none mb-8">
        <p>
          Bayes' theorem is a fundamental concept in probability theory that describes how to update our beliefs based on new evidence. It's named after Reverend Thomas Bayes, who formulated the theorem in the 18th century.
        </p>
        <p>
          This visualization helps you understand Bayes' theorem through multiple perspectives: a visual proof, a contingency table, a tree diagram, and a Venn diagram. Use the interactive controls to see how different variables affect the probabilities.
        </p>
      </div>
      
      <BayesTheoremVisualizer />
      
      <div className="mt-12 prose max-w-none">
        <h2>Applications of Bayes' Theorem</h2>
        <p>
          Bayes' theorem has countless applications across various fields:
        </p>
        <ul>
          <li><strong>Medicine:</strong> Interpreting test results and diagnosis</li>
          <li><strong>Machine Learning:</strong> Naive Bayes classifiers, Bayesian networks</li>
          <li><strong>Statistics:</strong> Bayesian inference and analysis</li>
          <li><strong>Search algorithms:</strong> Spam filtering, recommendation systems</li>
          <li><strong>Decision theory:</strong> Updating probabilities based on new information</li>
        </ul>
      </div>
    </div>
  );
};

export default BayesTheoremPage; 