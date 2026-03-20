import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import LandingPage from './pages/LandingPage';
import CitizenLogin from './pages/CitizenLogin';
import CitizenReportPage from './pages/CitizenReportPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ReportForm from './pages/ReportForm';
import Analytics from './pages/Analytics';

// Components
import Sidebar from './components/Sidebar';

function App() {
  const [admin, setAdmin] = useState(null);
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('token');
    const savedAdmin = localStorage.getItem('admin');
    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
      }
    }

    const savedCitizen = localStorage.getItem('citizen');
    if (savedCitizen) {
      try {
        setCitizen(JSON.parse(savedCitizen));
      } catch {
        localStorage.removeItem('citizen');
      }
    }
    
    setLoading(false);
  }, []);

  const handleAdminLogin = (adminData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const handleCitizenLogin = (citizenData) => {
    localStorage.setItem('citizen', JSON.stringify(citizenData));
    setCitizen(citizenData);
  };

  const handleCitizenLogout = () => {
    localStorage.removeItem('citizen');
    setCitizen(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 font-sans">
        <Routes>
          {/* Public Landing Page */}
          <Route 
            path="/" 
            element={<LandingPage onClearAdmin={handleAdminLogout} onClearCitizen={handleCitizenLogout} />} 
          />

          {/* Citizen Portal Flow */}
          <Route 
            path="/citizen-login" 
            element={citizen ? <Navigate to="/report" replace /> : <CitizenLogin onLogin={handleCitizenLogin} />} 
          />
          <Route 
            path="/report" 
            element={citizen ? <CitizenReportPage citizen={citizen} onLogout={handleCitizenLogout} /> : <Navigate to="/citizen-login" replace />} 
          />

          {/* Admin Portal Flow */}
          <Route 
            path="/admin-login" 
            element={admin ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleAdminLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={admin ? (
              <div className="flex h-screen overflow-hidden">
                <Sidebar admin={admin} onLogout={handleAdminLogout} />
                <main className="flex-1 overflow-y-auto">
                  <Dashboard admin={admin} />
                </main>
              </div>
            ) : <Navigate to="/admin-login" replace />} 
          />
          <Route 
            path="/reports/new" 
            element={admin ? (
              <div className="flex h-screen overflow-hidden">
                <Sidebar admin={admin} onLogout={handleAdminLogout} />
                <main className="flex-1 overflow-y-auto">
                  <ReportForm admin={admin} />
                </main>
              </div>
            ) : <Navigate to="/admin-login" replace />} 
          />
          <Route 
            path="/analytics" 
            element={admin ? (
              <div className="flex h-screen overflow-hidden">
                <Sidebar admin={admin} onLogout={handleAdminLogout} />
                <main className="flex-1 overflow-y-auto">
                  <Analytics admin={admin} />
                </main>
              </div>
            ) : <Navigate to="/admin-login" replace />} 
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
