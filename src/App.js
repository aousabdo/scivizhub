import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import BayesTheoremPage from './pages/Visualization/BayesTheorem';
import AboutPage from './pages/About';
import CategoryPage from './pages/Category';
import AllCategoriesPage from './pages/Category/AllCategories';
import Layout from './components/Layout/Layout';
import SortingAlgorithmsPage from './pages/Visualization/SortingAlgorithms';
import CentralLimitTheoremPage from './pages/Visualization/CentralLimitTheorem';
import PathfindingAlgorithmsPage from './pages/Visualization/PathfindingAlgorithms';
import PendulumWavePage from './pages/Visualization/PendulumWave';



import './App.css';

function App() {
  return (
    <Router basename="/scivizhub">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/visualization/bayes-theorem" element={<BayesTheoremPage />} />
          <Route path="/visualization/sorting-algorithms" element={<SortingAlgorithmsPage />} />
          <Route path="/visualization/central-limit-theorem" element={<CentralLimitTheoremPage />} />
          <Route path="/visualization/pathfinding-algorithms" element={<PathfindingAlgorithmsPage />} />
          <Route path="/visualization/pendulum-wave" element={<PendulumWavePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/categories" element={<AllCategoriesPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          {/* Add more routes as you develop more pages */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
