import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
// Import Chart.js components (assuming react-chartjs-2 and chart.js installed)
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const Insights = () => {
  const [report, setReport] = useState(null);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');  // store user ID in localStorage on login if needed

  useEffect(() => {
    // Fetch the candidate's own report data
    const fetchReport = async () => {
      try {
        const res = await fetch(`http://localhost:5000/report/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setReport(data);
        }
      } catch (err) {
        console.error('Failed to load insights', err);
      }
    };
    if (userId) {
      fetchReport();
    }
  }, [token, userId]);

  // Prepare data for chart if report is available
  let chartData = null;
  if (report) {
    const solved = report.solved_questions || 0;
    const total = report.total_questions || 0;
    const unsolved = total - solved;
    chartData = {
      labels: ['Solved', 'Unsolved'],
      datasets: [
        {
          data: [solved, unsolved],
          backgroundColor: ['#4caf50', '#f44336']
        }
      ]
    };
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>My Performance Insights</Typography>
      {report ? (
        <div>
          <Typography>Questions Solved: {report.solved_questions} / {report.total_questions}</Typography>
          <Typography>Proctoring Alerts Triggered: {report.proctoring_flags}</Typography>
          {chartData && 
            <div style={{ maxWidth: '300px', marginTop: '20px' }}>
              <Doughnut data={chartData} />
            </div>
          }
        </div>
      ) : (
        <Typography>Loading insights...</Typography>
      )}
    </Container>
  );
};

export default Insights;
