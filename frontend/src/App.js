import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CandidateDashboard from './components/CandidateDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import AssessmentPage from './components/AssessmentPage';
import ReportsPage from './components/ReportsPage';

function App() {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/candidate"
          element={token && role === 'candidate' ? <CandidateDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/recruiter/*"
          element={token && role === 'recruiter' ? <RecruiterDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/assessment/:id"
          element={token ? <AssessmentPage /> : <Navigate to="/" />}
        />
        <Route
          path="/reports/:id"
          element={token ? <ReportsPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
