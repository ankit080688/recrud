import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PrivateRoute from './components/PrivateRoute';

// Import pages for candidates
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CodeTest from './pages/CodeTest';
import Insights from './pages/Insights';
import CandidateJobs from './pages/CandidateJobs';

// Import pages for recruiters
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidatesList from './pages/CandidatesList';
import RealTimeMonitor from './pages/RealTimeMonitor';
import TestSetup from './pages/TestSetup';
import CandidateReport from './pages/CandidateReport';
import RecruiterJobs from './pages/RecruiterJobs';

function App() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // On app load, check localStorage for token and role to maintain logged-in state
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (token && role) {
      setUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    // Clear token and role from storage and state on logout
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUserRole(null);
    navigate('/login');
  };

  return (
    <div>
      {/* Top navigation bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Coding Assessment Platform
          </Typography>
          {/* Show links based on user role */}
          {userRole === 'candidate' && (
            <>
              <Button color="inherit" component={Link} to="/candidate/profile">Profile</Button>
              <Button color="inherit" component={Link} to="/candidate/test">Take Test</Button>
              <Button color="inherit" component={Link} to="/candidate/insights">Insights</Button>
              <Button color="inherit" component={Link} to="/candidate/jobs">Jobs</Button>
            </>
          )}
          {userRole === 'recruiter' && (
            <>
              <Button color="inherit" component={Link} to="/recruiter/dashboard">Dashboard</Button>
              <Button color="inherit" component={Link} to="/recruiter/candidates">Candidates</Button>
              <Button color="inherit" component={Link} to="/recruiter/monitor">Real-Time Monitor</Button>
              <Button color="inherit" component={Link} to="/recruiter/test-setup">Test Setup</Button>
              <Button color="inherit" component={Link} to="/recruiter/jobs">Jobs</Button>
            </>
          )}
          {userRole && (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Define application routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login onLogin={(role) => setUserRole(role)} />} />
        <Route path="/register" element={<Register />} />

        {/* Candidate protected routes */}
        <Route path="/candidate/profile" 
               element={
                 <PrivateRoute allowedRoles={['candidate']}>
                   <Profile />
                 </PrivateRoute>
               } 
        />
        <Route path="/candidate/test" 
               element={
                 <PrivateRoute allowedRoles={['candidate']}>
                   <CodeTest />
                 </PrivateRoute>
               } 
        />
        <Route path="/candidate/insights"
               element={
                 <PrivateRoute allowedRoles={['candidate']}>
                   <Insights />
                 </PrivateRoute>
               }
        />
        <Route path="/candidate/jobs"
               element={
                 <PrivateRoute allowedRoles={['candidate']}>
                   <CandidateJobs />
                 </PrivateRoute>
               }
        />

        {/* Recruiter protected routes */}
        <Route path="/recruiter/dashboard" 
               element={
                 <PrivateRoute allowedRoles={['recruiter']}>
                   <RecruiterDashboard />
                 </PrivateRoute>
               } 
        />
        <Route path="/recruiter/candidates" 
               element={
                 <PrivateRoute allowedRoles={['recruiter']}>
                   <CandidatesList />
                 </PrivateRoute>
               } 
        />
        <Route path="/recruiter/monitor" 
               element={
                 <PrivateRoute allowedRoles={['recruiter']}>
                   <RealTimeMonitor />
                 </PrivateRoute>
               } 
        />
        <Route path="/recruiter/test-setup"
               element={
                 <PrivateRoute allowedRoles={['recruiter']}>
                   <TestSetup />
                 </PrivateRoute>
               }
        />
        <Route path="/recruiter/jobs"
               element={
                 <PrivateRoute allowedRoles={['recruiter']}>
                   <RecruiterJobs />
                 </PrivateRoute>
               }
        />
        <Route path="/recruiter/report/:candidateId" 
               element={
                 <PrivateRoute allowedRoles={['recruiter']}>
                   <CandidateReport />
                 </PrivateRoute>
               } 
        />

        {/* Default route: redirect to login if not logged in */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;

