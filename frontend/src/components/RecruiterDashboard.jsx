import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import ReportsPage from './ReportsPage';
import PostJobPage from './PostJobPage';

function Home() {
  return (
    <div>
      <h2>Recruiter Dashboard</h2>
      <Link to="reports/1">Candidate Report</Link>
      <br />
      <Link to="post-job">Post Job</Link>
    </div>
  );
}

function RecruiterDashboard() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="reports/:id" element={<ReportsPage />} />
      <Route path="post-job" element={<PostJobPage />} />
    </Routes>
  );
}

export default RecruiterDashboard;
