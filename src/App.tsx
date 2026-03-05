import { Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Viewer from './pages/Viewer';
import Landing from './pages/Landing';

export default function App() {
  useThemeStore();

  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={isDemo ? <Landing /> : <Dashboard />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:projectId" element={<Editor />} />
        <Route path="/view/:projectId" element={<Viewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
