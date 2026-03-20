import React from 'react';
import MontyHallVisualizer from '../../components/Visualizations/MontyHall/MontyHallVisualizer';

const MontyHallPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Monty Hall Simulator</h1>

      <div className="prose max-w-5xl mx-auto mb-8">
        <p>
          The Monty Hall problem is a classic probability puzzle based on a game show setup: you choose one of three doors,
          one hides a car and two hide goats. The host, who knows where the car is, opens one of the remaining doors to
          reveal a goat and gives you a choice to stay or switch.
        </p>
        <p>
          This simulator lets you play rounds manually and run large trial batches to compare strategies. Use it to build
          intuition for conditional probability and see why switching wins more often in the long run.
        </p>
      </div>

      <MontyHallVisualizer />

      <div className="mt-12 prose max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold">Why Switching Works</h2>

        <div className="mt-8 grid gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">Initial Choice Odds</h3>
            <p>
              Before any door is opened, your first pick has a 1/3 chance of being the car and a 2/3 chance of being a goat.
              Those probabilities are fixed at the moment of your first choice.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">Host Action Adds Information</h3>
            <p>
              The host never opens the car door. By revealing a goat among the two doors you did not pick, the host
              effectively concentrates the original 2/3 probability mass onto the one unopened alternative door.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Long-Run Strategy Results</h3>
            <p>
              If you always stay, you win when your original 1/3 guess was correct. If you always switch, you win in the
              complementary 2/3 of rounds where the first guess was wrong. Simulations converge toward this split as trial
              count increases.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600 my-8">
          <h2 className="text-xl font-bold mb-4">Real Learning Goal</h2>
          <p>
            The puzzle is less about game shows and more about probabilistic reasoning under partial information. It helps
            reinforce key ideas used in statistics, machine learning, and decision-making under uncertainty.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MontyHallPage;
