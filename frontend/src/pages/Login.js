import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Send login request to backend
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Login failed');
      }
      const data = await response.json();
      // On success, store token, role and id, update App state and navigate
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userId', data.user.id);
      onLogin(data.user.role);  // inform App of the logged-in user's role
      if (data.user.role === 'candidate') {
        navigate('/candidate/profile');
      } else if (data.user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Login</Typography>
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
        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
          Sign In
        </Button>
        <Button color="secondary" onClick={() => navigate('/register')} fullWidth sx={{ mt: 1 }}>
          Create an Account
        </Button>
      </form>
    </Container>
  );
};

export default Login;
