import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import WeaknessReport from './pages/WeaknessReport';
import RoadmapPage from './pages/RoadmapPage';
import Onboarding from './components/Onboarding'; // Adjusted to look inside your components folder
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/weakness" element={<WeaknessReport />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;