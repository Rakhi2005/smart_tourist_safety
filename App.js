import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TouristDashboard from './pages/TouristDashboard';
import Incidents from './pages/Incidents';
import Locations from './pages/Locations';
import SafetyAlerts from './pages/SafetyAlerts';
import SafetyInfo from './pages/SafetyInfo';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user.role === 'user' ? <TouristDashboard /> : <Dashboard />} />
        <Route path="/dashboard" element={user.role === 'user' ? <TouristDashboard /> : <Dashboard />} />
        <Route path="/tourist-dashboard" element={<TouristDashboard />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/safety-alerts" element={<SafetyAlerts />} />
        <Route path="/safety-info" element={<SafetyInfo />} />
        <Route path="/profile" element={<Profile />} />
        {user.role === 'admin' && (
          <Route path="/admin" element={<AdminPanel />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
