import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Registration failed');
      }
      // Registration successful
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Register</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField 
          label="Username" 
          variant="outlined" 
          fullWidth 
          required 
          margin="normal"
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <TextField 
          label="Password" 
          type="password" 
          variant="outlined" 
          fullWidth 
          required 
          margin="normal"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-label">Role</InputLabel>
          <Select labelId="role-label" value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="candidate">Candidate</MenuItem>
            <MenuItem value="recruiter">Recruiter</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
          Sign Up
        </Button>
        <Button color="secondary" onClick={() => navigate('/login')} fullWidth sx={{ mt: 1 }}>
          Back to Login
        </Button>
      </form>
    </Container>
  );
};

export default Register;
