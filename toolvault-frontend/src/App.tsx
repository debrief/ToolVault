import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import TestTools from './pages/TestTools';
import ToolBrowser from './components/ToolBrowser/ToolBrowser';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test-tools" element={<TestTools />} />
          <Route path="/browse" element={<ToolBrowser />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
