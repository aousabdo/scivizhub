import React from 'react';
import BayesTheoremVisualizer from '../../components/Visualizations/BayesTheorem/BayesTheoremVisualizer';

const BayesTheoremPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Understanding Bayes' Theorem</h1>
      
      <div className="prose max-w-4xl mx-auto mb-8">
        <p>
          Bayes' theorem is a fundamental concept in probability theory that describes how to update our beliefs based on new evidence. It's named after Reverend Thomas Bayes, who formulated the theorem in the 18th century.
        </p>
        <p>
          This visualization helps you understand Bayes' theorem through multiple perspectives: a visual proof, a contingency table, a tree diagram, and a Venn diagram. Use the interactive controls to see how different variables affect the probabilities.
        </p>
      </div>
      
      <BayesTheoremVisualizer />
      
      <div className="mt-12 prose max-w-4xl mx-auto">
        <h1 className="text-center text-2xl font-bold">Applications of Bayes' Theorem</h1>
        
        <p className="my-6">
          Bayes' theorem has countless applications across various fields, making it one of the most versatile and powerful tools in probability and statistics. This theorem allows us to update our beliefs when new evidence emerges, providing a formal framework for evidence-based decision making.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-3">Medicine</h2>
            <p className="mb-3">Bayes' theorem is fundamental to medical diagnostics, helping doctors interpret test results correctly:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Evaluating the true probability of disease given positive test results</li>
              <li>Understanding why multiple tests are needed for rare conditions</li>
              <li>Developing screening programs that balance sensitivity and specificity</li>
              <li>Predicting treatment outcomes based on patient characteristics</li>
              <li>Evidence-based medicine relies on Bayesian updating as new clinical evidence emerges</li>
            </ul>
            <div className="mt-4 text-sm text-blue-700 italic">
              Example: A positive mammogram increases the probability of breast cancer, but the magnitude depends on age, family history, and other risk factors.
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h2 className="text-xl font-bold text-green-800 mb-3">Machine Learning</h2>
            <p className="mb-3">Bayesian methods are central to many machine learning algorithms:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Naive Bayes classifiers for text categorization and spam filtering</li>
              <li>Bayesian networks for modeling complex relationships between variables</li>
              <li>Probabilistic graphical models for inference under uncertainty</li>
              <li>Bayesian optimization for hyperparameter tuning</li>
              <li>Bayesian deep learning for quantifying model uncertainty</li>
            </ul>
            <div className="mt-4 text-sm text-green-700 italic">
              Example: Gmail uses Naive Bayes algorithms to filter spam by calculating the probability that an email is spam given its features (words, sender, etc.).
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h2 className="text-xl font-bold text-purple-800 mb-3">Statistics</h2>
            <p className="mb-3">Bayesian statistics offers a powerful alternative to traditional frequentist approaches:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Prior distributions encode existing knowledge or beliefs</li>
              <li>Posterior distributions represent updated beliefs after observing data</li>
              <li>Credible intervals provide intuitive uncertainty quantification</li>
              <li>Hypothesis testing through Bayes factors and posterior probabilities</li>
              <li>Hierarchical models for complex data structures</li>
            </ul>
            <div className="mt-4 text-sm text-purple-700 italic">
              Example: Polling predictions for elections often use Bayesian methods to incorporate historical voting patterns and demographic information.
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-xl font-bold text-red-800 mb-3">Search Algorithms</h2>
            <p className="mb-3">Information retrieval and search engines leverage Bayesian principles:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Spam filtering based on word frequencies and patterns</li>
              <li>Recommendation systems that predict user preferences</li>
              <li>Relevance ranking in search engine results</li>
              <li>Anomaly detection in website traffic or user behavior</li>
              <li>Content personalization based on user interaction history</li>
            </ul>
            <div className="mt-4 text-sm text-red-700 italic">
              Example: Netflix and Amazon recommend content by calculating the probability you'll like an item given your previous choices and similar users' preferences.
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-800 mb-3">Decision Theory</h2>
            <p className="mb-3">Bayes' theorem provides a framework for rational decision-making:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sequential decision problems with evolving information</li>
              <li>Optimal stopping problems (when to make a final decision)</li>
              <li>Value of information calculations</li>
              <li>Risk analysis and management</li>
              <li>Game theory and strategic decision-making</li>
            </ul>
            <div className="mt-4 text-sm text-yellow-700 italic">
              Example: Insurance companies use Bayesian methods to update risk profiles as they gather more information about clients.
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
            <h2 className="text-xl font-bold text-indigo-800 mb-3">More Applications</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Finance:</strong> Stock price prediction, risk assessment, portfolio optimization</li>
              <li><strong>Genetics:</strong> Gene mapping, ancestry analysis, genetic disease risk</li>
              <li><strong>Natural Language Processing:</strong> Speech recognition, text classification</li>
              <li><strong>Ecology:</strong> Species distribution modeling, population estimates</li>
              <li><strong>Forensics:</strong> DNA evidence interpretation, crime scene analysis</li>
              <li><strong>Meteorology:</strong> Weather forecasting and climate modeling</li>
              <li><strong>Sports Analytics:</strong> Player performance prediction, game outcome modeling</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 my-8">
          <h2 className="text-xl font-bold mb-4">The Power of Bayesian Thinking</h2>
          <p>
            Beyond formal applications, Bayesian thinking provides a powerful mental model for reasoning in everyday life. It reminds us to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Consider prior probabilities before jumping to conclusions</li>
            <li>Update beliefs gradually as new evidence emerges</li>
            <li>Recognize that the same evidence can have different implications depending on context</li>
            <li>Understand that correlation doesn't imply causation</li>
            <li>Be aware of our own cognitive biases when evaluating evidence</li>
          </ul>
          <p className="mt-4">
            By applying Bayesian principles, we can make more rational decisions in the face of uncertainty, avoiding both overconfidence and excessive skepticism.
          </p>
        </div>

        <div className="my-8 text-center">
          <p className="text-gray-600 italic">
            "When the facts change, I change my mind. What do you do, sir?" — John Maynard Keynes (embodying the Bayesian spirit)
          </p>
        </div>
      </div>
    </div>
  );
};

export default BayesTheoremPage;