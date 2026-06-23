import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Optimize from './pages/Optimize';
import Results from './pages/Results';
import ApiKeyModal from './components/ApiKeyModal';
import './index.css';

export default function App() {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <HashRouter>
      {showApiKey && (
        <ApiKeyModal isUpdate onSaved={() => setShowApiKey(false)} />
      )}
      <Navbar onApiKeyClick={() => setShowApiKey(true)} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/optimize" element={<Optimize />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </HashRouter>
  );
}
