import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Optimize from './pages/Optimize';
import Results from './pages/Results';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/optimize" element={<Optimize />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}
