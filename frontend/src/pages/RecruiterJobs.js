import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const token = localStorage.getItem('token');

  const loadJobs = async () => {
    const res = await fetch('http://localhost:5000/jobs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setJobs(data);
  };

  useEffect(() => { loadJobs(); }, [token]);

  const createJob = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });
    if (res.ok) {
      setTitle('');
      setDescription('');
      loadJobs();
    } else {
      alert('Failed to create job');
    }
  };

  return (
    <Container sx={{ mt:4 }}>
      <Typography variant="h6" gutterBottom>Post Job</Typography>
      <form onSubmit={createJob} style={{ marginBottom: '2rem' }}>
        <TextField label="Title" fullWidth value={title} onChange={e => setTitle(e.target.value)} margin="normal" required />
        <TextField label="Description" fullWidth multiline minRows={3} value={description} onChange={e => setDescription(e.target.value)} margin="normal" />
        <Button variant="contained" type="submit">Create</Button>
      </form>
      <Typography variant="h6" gutterBottom>Posted Jobs</Typography>
      <List>
        {jobs.map(job => (
          <ListItem key={job.id} divider>
            <ListItemText primary={job.title} secondary={job.description} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default RecruiterJobs;
