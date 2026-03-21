import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import WithChat from './components/Chat/WithChat';
import HomePage from './pages/Home';
import './App.css';

// Lazy-loaded pages
const AboutPage = lazy(() => import('./pages/About'));
const ContributePage = lazy(() => import('./pages/Contribute'));
const CategoryPage = lazy(() => import('./pages/Category'));
const AllCategoriesPage = lazy(() => import('./pages/Category/AllCategories'));
const ComparePage = lazy(() => import('./pages/Compare'));

// Lazy-loaded visualizations
const BayesTheoremPage = lazy(() => import('./pages/Visualization/BayesTheorem'));
const MontyHallPage = lazy(() => import('./pages/Visualization/MontyHall'));
const IntegralAccumulationPage = lazy(() => import('./pages/Visualization/IntegralAccumulation'));
const ProjectileMotionPage = lazy(() => import('./pages/Visualization/ProjectileMotion'));
const SortingAlgorithmsPage = lazy(() => import('./pages/Visualization/SortingAlgorithms'));
const CentralLimitTheoremPage = lazy(() => import('./pages/Visualization/CentralLimitTheorem'));
const PathfindingAlgorithmsPage = lazy(() => import('./pages/Visualization/PathfindingAlgorithms'));
const PendulumWavePage = lazy(() => import('./pages/Visualization/PendulumWave'));
const CompressionAlgorithmsPage = lazy(() => import('./pages/Visualization/CompressionAlgorithms'));
const FourierTransformPage = lazy(() => import('./pages/Visualization/FourierTransform'));
const NeuralNetworkTrainingPage = lazy(() => import('./pages/Visualization/NeuralNetworkTraining'));
const TravelingSalesmanPage = lazy(() => import('./pages/Visualization/TravelingSalesman'));
const MazeGenerationPage = lazy(() => import('./pages/Visualization/MazeGeneration'));
const MatrixTransformationPage = lazy(() => import('./pages/Visualization/MatrixTransformation'));
const EigenGeometryExplorerPage = lazy(() => import('./pages/Visualization/EigenGeometryExplorer'));
const DerivativeExplorer = lazy(() => import('./pages/Visualization/DerivativeExplorer'));
const WaveInterferencePage = lazy(() => import('./pages/Visualization/WaveInterference'));
const DoublePendulumPage = lazy(() => import('./pages/Visualization/DoublePendulum'));
const EpidemicSIRPage = lazy(() => import('./pages/Visualization/EpidemicSIR'));
const ReactionKineticsPage = lazy(() => import('./pages/Visualization/ReactionKinetics'));
const FractalExplorerPage = lazy(() => import('./pages/Visualization/FractalExplorer'));
const GravitySimulatorPage = lazy(() => import('./pages/Visualization/GravitySimulator'));
const BinarySearchTreePage = lazy(() => import('./pages/Visualization/BinarySearchTree'));
const GameOfLifePage = lazy(() => import('./pages/Visualization/GameOfLife'));
const HypothesisTestingPage = lazy(() => import('./pages/Visualization/HypothesisTesting'));
const ElectromagneticFieldsPage = lazy(() => import('./pages/Visualization/ElectromagneticFields'));
const PredatorPreyPage = lazy(() => import('./pages/Visualization/PredatorPrey'));
const MarkovChainPage = lazy(() => import('./pages/Visualization/MarkovChain'));
const LorenzAttractorPage = lazy(() => import('./pages/Visualization/LorenzAttractor'));
const VoronoiDiagramPage = lazy(() => import('./pages/Visualization/VoronoiDiagram'));
const SpringMassSystemPage = lazy(() => import('./pages/Visualization/SpringMassSystem'));
const TaylorSeriesPage = lazy(() => import('./pages/Visualization/TaylorSeries'));
const GeneticAlgorithmPage = lazy(() => import('./pages/Visualization/GeneticAlgorithm'));
const OrbitalMechanicsPage = lazy(() => import('./pages/Visualization/OrbitalMechanics'));
const DiffusionSimulationPage = lazy(() => import('./pages/Visualization/DiffusionSimulation'));
const ChaosGamePage = lazy(() => import('./pages/Visualization/ChaosGame'));
const VanDerPauwPage = lazy(() => import('./pages/Visualization/VanDerPauw'));
const GradientDescentPage = lazy(() => import('./pages/Visualization/GradientDescent'));
const MonteCarloPage = lazy(() => import('./pages/Visualization/MonteCarlo'));
const PCAExplorerPage = lazy(() => import('./pages/Visualization/PCAExplorer'));
const BayesianUpdatingPage = lazy(() => import('./pages/Visualization/BayesianUpdating'));

const Loading = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    {/* Title skeleton */}
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
    {/* Controls skeleton */}
    <div className="flex gap-3 mb-6">
      <div className="h-10 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
    {/* Canvas skeleton */}
    <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
    {/* Info skeleton */}
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

function App() {
  return (
    <Router basename="/scivizhub">
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/visualization/bayes-theorem" element={<WithChat id="bayes-theorem" title="Bayes' Theorem"><BayesTheoremPage /></WithChat>} />
            <Route path="/visualization/monty-hall" element={<WithChat id="monty-hall" title="Monty Hall Problem"><MontyHallPage /></WithChat>} />
            <Route path="/visualization/integral-accumulation" element={<WithChat id="integral-accumulation" title="Integral Accumulation"><IntegralAccumulationPage /></WithChat>} />
            <Route path="/visualization/projectile-motion-lab" element={<WithChat id="projectile-motion" title="Projectile Motion"><ProjectileMotionPage /></WithChat>} />
            <Route path="/visualization/sorting-algorithms" element={<WithChat id="sorting-algorithms" title="Sorting Algorithms"><SortingAlgorithmsPage /></WithChat>} />
            <Route path="/visualization/central-limit-theorem" element={<WithChat id="central-limit-theorem" title="Central Limit Theorem"><CentralLimitTheoremPage /></WithChat>} />
            <Route path="/visualization/pathfinding-algorithms" element={<WithChat id="pathfinding-algorithms" title="Pathfinding Algorithms"><PathfindingAlgorithmsPage /></WithChat>} />
            <Route path="/visualization/pendulum-wave" element={<WithChat id="pendulum-wave" title="Pendulum Wave"><PendulumWavePage /></WithChat>} />
            <Route path="/visualization/compression-algorithms" element={<WithChat id="compression-algorithms" title="Compression Algorithms"><CompressionAlgorithmsPage /></WithChat>} />
            <Route path="/visualization/fourier-transform" element={<WithChat id="fourier-transform" title="Fourier Transform"><FourierTransformPage /></WithChat>} />
            <Route path="/visualization/neural-network-training" element={<WithChat id="neural-network-training" title="Neural Network Training"><NeuralNetworkTrainingPage /></WithChat>} />
            <Route path="/visualization/traveling-salesman" element={<WithChat id="traveling-salesman" title="Traveling Salesman Problem"><TravelingSalesmanPage /></WithChat>} />
            <Route path="/visualization/maze-generation" element={<WithChat id="maze-generation" title="Maze Generation"><MazeGenerationPage /></WithChat>} />
            <Route path="/visualization/matrix-transformation" element={<WithChat id="matrix-transformation" title="Matrix Transformations"><MatrixTransformationPage /></WithChat>} />
            <Route path="/visualization/eigen-geometry-explorer" element={<WithChat id="eigen-geometry-explorer" title="Eigen Geometry"><EigenGeometryExplorerPage /></WithChat>} />
            <Route path="/visualization/derivative-explorer" element={<WithChat id="derivative-explorer" title="Derivative Explorer"><DerivativeExplorer /></WithChat>} />
            <Route path="/visualization/wave-interference" element={<WithChat id="wave-interference" title="Wave Interference"><WaveInterferencePage /></WithChat>} />
            <Route path="/visualization/double-pendulum" element={<WithChat id="double-pendulum" title="Double Pendulum"><DoublePendulumPage /></WithChat>} />
            <Route path="/visualization/epidemic-sir" element={<WithChat id="epidemic-sir" title="SIR Epidemic Model"><EpidemicSIRPage /></WithChat>} />
            <Route path="/visualization/reaction-kinetics" element={<WithChat id="reaction-kinetics" title="Reaction Kinetics"><ReactionKineticsPage /></WithChat>} />
            <Route path="/visualization/fractal-explorer" element={<WithChat id="fractal-explorer" title="Fractal Explorer"><FractalExplorerPage /></WithChat>} />
            <Route path="/visualization/gravity-simulator" element={<WithChat id="gravity-simulator" title="Gravity Simulator"><GravitySimulatorPage /></WithChat>} />
            <Route path="/visualization/binary-search-tree" element={<WithChat id="binary-search-tree" title="Binary Search Tree"><BinarySearchTreePage /></WithChat>} />
            <Route path="/visualization/game-of-life" element={<WithChat id="game-of-life" title="Conway's Game of Life"><GameOfLifePage /></WithChat>} />
            <Route path="/visualization/hypothesis-testing" element={<WithChat id="hypothesis-testing" title="Hypothesis Testing"><HypothesisTestingPage /></WithChat>} />
            <Route path="/visualization/electromagnetic-fields" element={<WithChat id="electromagnetic-fields" title="Electromagnetic Fields"><ElectromagneticFieldsPage /></WithChat>} />
            <Route path="/visualization/predator-prey" element={<WithChat id="predator-prey" title="Predator-Prey Model"><PredatorPreyPage /></WithChat>} />
            <Route path="/visualization/markov-chain" element={<WithChat id="markov-chain" title="Markov Chains"><MarkovChainPage /></WithChat>} />
            <Route path="/visualization/lorenz-attractor" element={<WithChat id="lorenz-attractor" title="Lorenz Attractor"><LorenzAttractorPage /></WithChat>} />
            <Route path="/visualization/voronoi-diagram" element={<WithChat id="voronoi-diagram" title="Voronoi Diagram"><VoronoiDiagramPage /></WithChat>} />
            <Route path="/visualization/spring-mass-system" element={<WithChat id="spring-mass-system" title="Spring-Mass System"><SpringMassSystemPage /></WithChat>} />
            <Route path="/visualization/taylor-series" element={<WithChat id="taylor-series" title="Taylor Series"><TaylorSeriesPage /></WithChat>} />
            <Route path="/visualization/genetic-algorithm" element={<WithChat id="genetic-algorithm" title="Genetic Algorithm"><GeneticAlgorithmPage /></WithChat>} />
            <Route path="/visualization/orbital-mechanics" element={<WithChat id="orbital-mechanics" title="Orbital Mechanics"><OrbitalMechanicsPage /></WithChat>} />
            <Route path="/visualization/diffusion-simulation" element={<WithChat id="diffusion-simulation" title="Diffusion & Brownian Motion"><DiffusionSimulationPage /></WithChat>} />
            <Route path="/visualization/chaos-game" element={<WithChat id="chaos-game" title="Chaos Game"><ChaosGamePage /></WithChat>} />
            <Route path="/visualization/van-der-pauw" element={<WithChat id="van-der-pauw" title="Van der Pauw Method"><VanDerPauwPage /></WithChat>} />
            <Route path="/visualization/gradient-descent" element={<WithChat id="gradient-descent" title="Gradient Descent"><GradientDescentPage /></WithChat>} />
            <Route path="/visualization/monte-carlo" element={<WithChat id="monte-carlo" title="Monte Carlo Simulation"><MonteCarloPage /></WithChat>} />
            <Route path="/visualization/pca-explorer" element={<WithChat id="pca-explorer" title="PCA Explorer"><PCAExplorerPage /></WithChat>} />
            <Route path="/visualization/bayesian-updating" element={<WithChat id="bayesian-updating" title="Bayesian Updating"><BayesianUpdatingPage /></WithChat>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/categories" element={<AllCategoriesPage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
