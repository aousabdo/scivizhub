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
import WithChat from './components/Chat/WithChat';
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
