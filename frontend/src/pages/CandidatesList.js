import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch('http://localhost:5000/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          // Filter only candidate users
          const candidateUsers = data.filter(user => user.role === 'candidate');
          setCandidates(candidateUsers);
        }
      } catch (err) {
        console.error('Failed to fetch candidates', err);
      }
    };
    fetchCandidates();
  }, [token]);

  const filteredCandidates = candidates.filter(c => 
    c.username.toLowerCase().includes(filter.toLowerCase()) || 
    (c.name && c.name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Candidates</Typography>
      <TextField 
        label="Search candidates" 
        variant="outlined" 
        fullWidth 
        margin="normal"
        value={filter} 
        onChange={(e) => setFilter(e.target.value)} 
      />
      <List>
        {filteredCandidates.map(candidate => (
          <ListItem 
            key={candidate.id} 
            button 
            onClick={() => navigate(`/recruiter/report/${candidate.id}`)}
          >
            <ListItemText 
              primary={candidate.name ? `${candidate.name} (${candidate.username})` : candidate.username} 
              secondary={`ID: ${candidate.id}`} 
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default CandidatesList;
