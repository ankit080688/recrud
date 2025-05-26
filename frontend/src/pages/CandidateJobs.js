import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText } from '@mui/material';

const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setJobs(data);
        }
      } catch (err) {
        console.error('Failed to load jobs', err);
      }
    };
    fetchJobs();
  }, [token]);

  const apply = async (jobId) => {
    try {
      const res = await fetch('http://localhost:5000/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ job_id: jobId })
      });
      if (res.ok) {
        alert('Applied!');
      } else {
        const data = await res.json();
        alert(data.msg || 'Failed');
      }
    } catch (err) {
      alert('Error applying');
    }
  };

  return (
    <Container sx={{ mt:4 }}>
      <Typography variant="h6" gutterBottom>Open Jobs</Typography>
      <List>
        {jobs.map(job => (
          <ListItem key={job.id} divider>
            <ListItemText primary={job.title} secondary={job.description} />
            <Button variant="contained" onClick={() => apply(job.id)}>Apply</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default CandidateJobs;
