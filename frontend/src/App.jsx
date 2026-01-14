import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Conflicts from './pages/Conflicts';
import { LayoutDashboard, AlertTriangle } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="container">
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: 'var(--accent)' }}>Sync</span>Master
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" className="btn glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none' }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/conflicts" className="btn glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none' }}>
              <AlertTriangle size={18} /> Conflicts
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/conflicts" element={<Conflicts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
