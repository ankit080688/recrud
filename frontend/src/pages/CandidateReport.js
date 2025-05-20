import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const CandidateReport = () => {
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem('token');

  // Extract candidateId from URL using window.location or useParams from react-router
  const candidateId = window.location.pathname.split('/').pop(); 
  // Alternatively: import { useParams } from 'react-router-dom'; then const { candidateId } = useParams();

  useEffect(() => {
    // Fetch report data for the candidate
    const fetchReport = async () => {
      try {
        const res = await fetch(`http://localhost:5000/report/${candidateId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setReport(data);
        }
      } catch (err) {
        console.error('Failed to fetch report', err);
      }
    };
    // Fetch proctoring logs for this candidate (could use /get_logs and filter or a dedicated endpoint)
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:5000/get_logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const candidateLogs = data.filter(log => String(log.user_id) === String(candidateId));
          setLogs(candidateLogs);
        }
      } catch (err) {
        console.error('Failed to fetch logs', err);
      }
    };

    fetchReport();
    fetchLogs();
  }, [candidateId, token]);

  // Prepare chart data: e.g., bar chart for solved vs unsolved questions
  const chartData = report ? {
    labels: ['Solved', 'Unsolved'],
    datasets: [{
      label: 'Questions',
      data: [report.solved_questions, report.total_questions - report.solved_questions],
      backgroundColor: ['#4caf50', '#f44336']
    }]
  } : null;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Candidate Report (User {candidateId})</Typography>
      {report ? (
        <div>
          <Typography>Score: {report.solved_questions} out of {report.total_questions} questions solved.</Typography>
          <Typography>Proctoring Alerts: {report.proctoring_flags}</Typography>
          {chartData && 
            <div style={{ maxWidth: '400px', margin: '20px 0' }}>
              <Bar data={chartData} options={{ indexAxis: 'y' }} /> 
              {/* horizontal bar chart showing solved vs unsolved */}
            </div>
          }
          <Typography variant="subtitle1">Proctoring Events:</Typography>
          <List>
            {logs.map(log => (
              <ListItem key={log.id}>
                <ListItemText 
                  primary={`${log.event_type}`} 
                  secondary={new Date(log.timestamp).toLocaleString()} 
                />
              </ListItem>
            ))}
            {logs.length === 0 && <ListItem><ListItemText primary="No proctoring alerts." /></ListItem>}
          </List>
        </div>
      ) : (
        <Typography>Loading report...</Typography>
      )}
    </Container>
  );
};

export default CandidateReport;
