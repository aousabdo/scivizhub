import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import BayesTheoremPage from './pages/Visualization/BayesTheorem';
import MontyHallPage from './pages/Visualization/MontyHall';
import IntegralAccumulationPage from './pages/Visualization/IntegralAccumulation';
import ProjectileMotionPage from './pages/Visualization/ProjectileMotion';
import AboutPage from './pages/About';
import ContributePage from './pages/Contribute';
import CategoryPage from './pages/Category';
import AllCategoriesPage from './pages/Category/AllCategories';
import Layout from './components/Layout/Layout';
import SortingAlgorithmsPage from './pages/Visualization/SortingAlgorithms';
import CentralLimitTheoremPage from './pages/Visualization/CentralLimitTheorem';
import PathfindingAlgorithmsPage from './pages/Visualization/PathfindingAlgorithms';
import PendulumWavePage from './pages/Visualization/PendulumWave';
import CompressionAlgorithmsPage from './pages/Visualization/CompressionAlgorithms';
import FourierTransformPage from './pages/Visualization/FourierTransform';
import NeuralNetworkTrainingPage from './pages/Visualization/NeuralNetworkTraining';
import TravelingSalesmanPage from './pages/Visualization/TravelingSalesman';
import MazeGenerationPage from './pages/Visualization/MazeGeneration';
import MatrixTransformationPage from './pages/Visualization/MatrixTransformation';
import EigenGeometryExplorerPage from './pages/Visualization/EigenGeometryExplorer';
import DerivativeExplorer from './pages/Visualization/DerivativeExplorer';
import WaveInterferencePage from './pages/Visualization/WaveInterference';
import DoublePendulumPage from './pages/Visualization/DoublePendulum';
import EpidemicSIRPage from './pages/Visualization/EpidemicSIR';
import ReactionKineticsPage from './pages/Visualization/ReactionKinetics';
import FractalExplorerPage from './pages/Visualization/FractalExplorer';
import GravitySimulatorPage from './pages/Visualization/GravitySimulator';
import BinarySearchTreePage from './pages/Visualization/BinarySearchTree';
import GameOfLifePage from './pages/Visualization/GameOfLife';
import HypothesisTestingPage from './pages/Visualization/HypothesisTesting';
import ElectromagneticFieldsPage from './pages/Visualization/ElectromagneticFields';
import PredatorPreyPage from './pages/Visualization/PredatorPrey';
import MarkovChainPage from './pages/Visualization/MarkovChain';
import LorenzAttractorPage from './pages/Visualization/LorenzAttractor';
import VoronoiDiagramPage from './pages/Visualization/VoronoiDiagram';
import SpringMassSystemPage from './pages/Visualization/SpringMassSystem';
import TaylorSeriesPage from './pages/Visualization/TaylorSeries';
import GeneticAlgorithmPage from './pages/Visualization/GeneticAlgorithm';
import OrbitalMechanicsPage from './pages/Visualization/OrbitalMechanics';
import DiffusionSimulationPage from './pages/Visualization/DiffusionSimulation';
import ChaosGamePage from './pages/Visualization/ChaosGame';


import './App.css';

function App() {
  return (
    <Router basename="/scivizhub">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/visualization/bayes-theorem" element={<BayesTheoremPage />} />
          <Route path="/visualization/monty-hall" element={<MontyHallPage />} />
          <Route path="/visualization/integral-accumulation" element={<IntegralAccumulationPage />} />
          <Route path="/visualization/projectile-motion-lab" element={<ProjectileMotionPage />} />
          <Route path="/visualization/sorting-algorithms" element={<SortingAlgorithmsPage />} />
          <Route path="/visualization/central-limit-theorem" element={<CentralLimitTheoremPage />} />
          <Route path="/visualization/pathfinding-algorithms" element={<PathfindingAlgorithmsPage />} />
          <Route path="/visualization/pendulum-wave" element={<PendulumWavePage />} />
          <Route path="/visualization/compression-algorithms" element={<CompressionAlgorithmsPage />} />
          <Route path="/visualization/fourier-transform" element={<FourierTransformPage />} />
          <Route path="/visualization/neural-network-training" element={<NeuralNetworkTrainingPage />} />
          <Route path="/visualization/traveling-salesman" element={<TravelingSalesmanPage />} />
          <Route path="/visualization/maze-generation" element={<MazeGenerationPage />} />
          <Route path="/visualization/matrix-transformation" element={<MatrixTransformationPage />} />
          <Route path="/visualization/eigen-geometry-explorer" element={<EigenGeometryExplorerPage />} />
          <Route path="/visualization/derivative-explorer" element={<DerivativeExplorer />} />
          <Route path="/visualization/wave-interference" element={<WaveInterferencePage />} />
          <Route path="/visualization/double-pendulum" element={<DoublePendulumPage />} />
          <Route path="/visualization/epidemic-sir" element={<EpidemicSIRPage />} />
          <Route path="/visualization/reaction-kinetics" element={<ReactionKineticsPage />} />
          <Route path="/visualization/fractal-explorer" element={<FractalExplorerPage />} />
          <Route path="/visualization/gravity-simulator" element={<GravitySimulatorPage />} />
          <Route path="/visualization/binary-search-tree" element={<BinarySearchTreePage />} />
          <Route path="/visualization/game-of-life" element={<GameOfLifePage />} />
          <Route path="/visualization/hypothesis-testing" element={<HypothesisTestingPage />} />
          <Route path="/visualization/electromagnetic-fields" element={<ElectromagneticFieldsPage />} />
          <Route path="/visualization/predator-prey" element={<PredatorPreyPage />} />
          <Route path="/visualization/markov-chain" element={<MarkovChainPage />} />
          <Route path="/visualization/lorenz-attractor" element={<LorenzAttractorPage />} />
          <Route path="/visualization/voronoi-diagram" element={<VoronoiDiagramPage />} />
          <Route path="/visualization/spring-mass-system" element={<SpringMassSystemPage />} />
          <Route path="/visualization/taylor-series" element={<TaylorSeriesPage />} />
          <Route path="/visualization/genetic-algorithm" element={<GeneticAlgorithmPage />} />
          <Route path="/visualization/orbital-mechanics" element={<OrbitalMechanicsPage />} />
          <Route path="/visualization/diffusion-simulation" element={<DiffusionSimulationPage />} />
          <Route path="/visualization/chaos-game" element={<ChaosGamePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/categories" element={<AllCategoriesPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          {/* Add more routes as you develop more pages */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
