import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { getAllVisualizations } from '../../data/visualizations';

// Map visualization IDs to their lazy-loaded visualizer components
const VISUALIZER_MAP = {
  'bayes-theorem': lazy(() => import('../../components/Visualizations/BayesTheorem/BayesTheoremVisualizer')),
  'monty-hall': lazy(() => import('../../components/Visualizations/MontyHall/MontyHallVisualizer')),
  'integral-accumulation': lazy(() => import('../../components/Visualizations/IntegralAccumulation/IntegralAccumulationVisualizer')),
  'sorting-algorithms': lazy(() => import('../../components/Visualizations/SortingAlgorithms/SortingAlgorithmVisualizer')),
  'central-limit-theorem': lazy(() => import('../../components/Visualizations/CentralLimitTheorem/CentralLimitTheoremVisualizer')),
  'pathfinding-algorithms': lazy(() => import('../../components/Visualizations/PathfindingAlgorithms/PathfindingAlgorithmVisualizer')),
  'pendulum-wave': lazy(() => import('../../components/Visualizations/PendulumWave/PendulumWaveVisualizer')),
  'projectile-motion-lab': lazy(() => import('../../components/Visualizations/ProjectileMotion/ProjectileMotionVisualizer')),
  'compression-algorithms': lazy(() => import('../../components/Visualizations/CompressionAlgorithms/CompressionAlgorithmVisualizer')),
  'fourier-transform': lazy(() => import('../../components/Visualizations/FourierTransform/FourierTransformVisualizer')),
  'neural-network-training': lazy(() => import('../../components/Visualizations/NeuralNetwork/NeuralNetworkTrainingVisualizer')),
  'traveling-salesman': lazy(() => import('../../components/Visualizations/TravelingSalesman/TravelingSalesmanVisualizer')),
  'maze-generation': lazy(() => import('../../components/Visualizations/MazeGeneration/MazeGenerationVisualizer')),
  'matrix-transformation': lazy(() => import('../../components/Visualizations/MatrixTransformation/MatrixTransformationVisualizer')),
  'eigen-geometry-explorer': lazy(() => import('../../components/Visualizations/EigenGeometry/EigenGeometryVisualizer')),
  'derivative-explorer': lazy(() => import('../../components/Visualizations/DerivativeExplorer/DerivativeExplorerVisualizer')),
  'wave-interference': lazy(() => import('../../components/Visualizations/WaveInterference/WaveInterferenceVisualizer')),
  'double-pendulum': lazy(() => import('../../components/Visualizations/DoublePendulum/DoublePendulumVisualizer')),
  'epidemic-sir': lazy(() => import('../../components/Visualizations/EpidemicSIR/EpidemicSIRVisualizer')),
  'reaction-kinetics': lazy(() => import('../../components/Visualizations/ReactionKinetics/ReactionKineticsVisualizer')),
  'fractal-explorer': lazy(() => import('../../components/Visualizations/FractalExplorer/FractalExplorerVisualizer')),
  'gravity-simulator': lazy(() => import('../../components/Visualizations/GravitySimulator/GravitySimulatorVisualizer')),
  'binary-search-tree': lazy(() => import('../../components/Visualizations/BinarySearchTree/BinarySearchTreeVisualizer')),
  'game-of-life': lazy(() => import('../../components/Visualizations/GameOfLife/GameOfLifeVisualizer')),
  'hypothesis-testing': lazy(() => import('../../components/Visualizations/HypothesisTesting/HypothesisTestingVisualizer')),
  'electromagnetic-fields': lazy(() => import('../../components/Visualizations/ElectromagneticFields/ElectromagneticFieldsVisualizer')),
  'predator-prey': lazy(() => import('../../components/Visualizations/PredatorPrey/PredatorPreyVisualizer')),
  'markov-chain': lazy(() => import('../../components/Visualizations/MarkovChain/MarkovChainVisualizer')),
  'lorenz-attractor': lazy(() => import('../../components/Visualizations/LorenzAttractor/LorenzAttractorVisualizer')),
  'voronoi-diagram': lazy(() => import('../../components/Visualizations/VoronoiDiagram/VoronoiDiagramVisualizer')),
  'spring-mass-system': lazy(() => import('../../components/Visualizations/SpringMassSystem/SpringMassSystemVisualizer')),
  'taylor-series': lazy(() => import('../../components/Visualizations/TaylorSeries/TaylorSeriesVisualizer')),
  'genetic-algorithm': lazy(() => import('../../components/Visualizations/GeneticAlgorithm/GeneticAlgorithmVisualizer')),
  'orbital-mechanics': lazy(() => import('../../components/Visualizations/OrbitalMechanics/OrbitalMechanicsVisualizer')),
  'diffusion-simulation': lazy(() => import('../../components/Visualizations/DiffusionSimulation/DiffusionSimulationVisualizer')),
  'chaos-game': lazy(() => import('../../components/Visualizations/ChaosGame/ChaosGameVisualizer')),
};

const LoadingPanel = () => (
  <div className="animate-pulse p-4">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

const ComparePage = () => {
  const allViz = useMemo(() => getAllVisualizations(), []);
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');

  const LeftComponent = leftId ? VISUALIZER_MAP[leftId] : null;
  const RightComponent = rightId ? VISUALIZER_MAP[rightId] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Compare Visualizations — SciVizHub</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-2 text-center">Compare Visualizations</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        Select two visualizations to view them side by side.
      </p>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Left Visualization
          </label>
          <select
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
          >
            <option value="">Choose a visualization...</option>
            {allViz.map((v) => (
              <option key={v.id} value={v.id} disabled={v.id === rightId}>
                {v.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Right Visualization
          </label>
          <select
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
          >
            <option value="">Choose a visualization...</option>
            {allViz.map((v) => (
              <option key={v.id} value={v.id} disabled={v.id === leftId}>
                {v.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 min-h-[400px]">
          {LeftComponent ? (
            <div className="p-2">
              <h3 className="text-lg font-semibold mb-2 px-2">
                {allViz.find((v) => v.id === leftId)?.title}
              </h3>
              <Suspense fallback={<LoadingPanel />}>
                <LeftComponent />
              </Suspense>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <p className="text-sm">Select a visualization above</p>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 min-h-[400px]">
          {RightComponent ? (
            <div className="p-2">
              <h3 className="text-lg font-semibold mb-2 px-2">
                {allViz.find((v) => v.id === rightId)?.title}
              </h3>
              <Suspense fallback={<LoadingPanel />}>
                <RightComponent />
              </Suspense>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <p className="text-sm">Select a visualization above</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helpful tip */}
      {leftId && rightId && (
        <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 text-sm text-indigo-800 dark:text-indigo-300">
          <strong>Tip:</strong> Each visualization runs independently. Adjust parameters in each panel to compare behavior across different configurations or algorithms.
        </div>
      )}
    </div>
  );
};

export default ComparePage;
