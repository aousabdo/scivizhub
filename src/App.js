import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import BayesTheoremPage from './pages/Visualization/BayesTheorem';
import AboutPage from './pages/About';
import CategoryPage from './pages/Category';
import AllCategoriesPage from './pages/Category/AllCategories';
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/visualization/bayes-theorem" element={<BayesTheoremPage />} />
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
