import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Alert } from '@mui/material';

const Profile = () => {
  const [name, setName] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    // Fetch profile data on component mount
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setName(data.name || '');  // populate name if exists
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/user/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      if (!res.ok) {
        throw new Error('Update failed');
      }
      setMsg('Profile updated successfully.');
    } catch (err) {
      setMsg('Error updating profile.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>My Profile</Typography>
      {msg && <Alert severity={msg.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>{msg}</Alert>}
      <form onSubmit={saveProfile}>
        <TextField 
          label="Full Name" 
          variant="outlined" 
          fullWidth 
          margin="normal"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <Button variant="contained" color="primary" type="submit">Save</Button>
      </form>
    </Container>
  );
};

export default Profile;
