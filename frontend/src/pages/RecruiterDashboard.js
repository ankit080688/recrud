import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState({ candidates: 0, assessments: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch all candidates and assessments to compute stats
    const fetchStats = async () => {
      try {
        const [usersRes, assessRes] = await Promise.all([
          fetch('http://localhost:5000/users', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/assessments', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const usersData = await usersRes.json();
        const assessData = await assessRes.json();
        if (usersRes.ok && assessRes.ok) {
          // Count candidates (assuming /users returns all users or at least all candidates)
          const candidateCount = usersData.filter(u => u.role === 'candidate').length;
          setStats({ 
            candidates: candidateCount, 
            assessments: assessData.length 
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Recruiter Dashboard</Typography>
      <Typography variant="body1">Welcome to the ATS Dashboard. Here are some quick stats:</Typography>
      <ul>
        <li>Total Candidates: {stats.candidates}</li>
        <li>Total Assessments: {stats.assessments}</li>
      </ul>
      <Typography variant="body2" color="text.secondary">
        Use the navigation above to manage candidates, monitor tests, set up new assessments, and view detailed reports.
      </Typography>
    </Container>
  );
};

export default RecruiterDashboard;
