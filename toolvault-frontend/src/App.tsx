import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import TestTools from './pages/TestTools';
import ToolDetail from './pages/ToolDetail';
import ToolBrowser from './components/ToolBrowser/ToolBrowser';
import './App.css';

function App() {
  // Get the base path from Vite's configuration
  const basename = import.meta.env.BASE_URL;
  
  return (
    <Router basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test-tools" element={<TestTools />} />
          <Route path="/browse" element={<ToolBrowser />} />
          <Route path="/tool/:id" element={<ToolDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
