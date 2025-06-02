import React from 'react';
import { Link } from 'react-router-dom';

function CandidateDashboard() {
  return (
    <div>
      <h2>Candidate Dashboard</h2>
      <Link to="/assessment/1">Take Assessment</Link>
      <br />
      <Link to="/reports/1">View Report</Link>
      <br />
      <Link to="/candidate/jobs">Jobs</Link>
    </div>
  );
}

export default CandidateDashboard;
