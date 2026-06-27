import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Optimize from './pages/Optimize';
import Results from './pages/Results';
import ApiKeyModal from './components/ApiKeyModal';
import WelcomeModal from './components/WelcomeModal';
import './index.css';

const ONBOARDED_KEY = 'atsboost_onboarded';

export default function App() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome modal on first ever visit
    if (!localStorage.getItem(ONBOARDED_KEY)) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeDismiss = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setShowWelcome(false);
  };

  return (
    <HashRouter>
      {showWelcome && <WelcomeModal onDismiss={handleWelcomeDismiss} />}
      {showApiKey && !showWelcome && (
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
