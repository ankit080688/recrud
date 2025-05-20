import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import ReportsPage from './ReportsPage';

function Home() {
  return (
    <div>
      <h2>Recruiter Dashboard</h2>
      <Link to="reports/1">Candidate Report</Link>
    </div>
  );
}

function RecruiterDashboard() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="reports/:id" element={<ReportsPage />} />
    </Routes>
  );
}

export default RecruiterDashboard;
