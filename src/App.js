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
import DerivativeExplorer from './pages/Visualization/DerivativeExplorer';


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
          <Route path="/visualization/derivative-explorer" element={<DerivativeExplorer />} />
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
