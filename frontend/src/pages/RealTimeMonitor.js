import React, { useEffect, useState } from 'react';
import { Container, Typography, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText } from '@mui/material';

const RealTimeMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [filterUser, setFilterUser] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Poll logs every 5 seconds
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:5000/get_logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setLogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch logs', err);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [token]);

  // Apply filters to logs
  const displayedLogs = logs.filter(log => {
    const userMatch = (filterUser === 'all') || (String(log.user_id) === filterUser);
    const eventMatch = (filterEvent === 'all') || (log.event_type === filterEvent);
    return userMatch && eventMatch;
  });

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Real-Time Proctoring Monitor</Typography>
      {/* Filter controls */}
      <FormControl sx={{ mr: 2, minWidth: 120 }}>
        <InputLabel id="user-filter-label">Candidate</InputLabel>
        <Select
          labelId="user-filter-label"
          value={filterUser}
          label="Candidate"
          onChange={(e) => setFilterUser(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          {/* Dynamically populate unique user_ids from logs for filtering */}
          {[...new Set(logs.map(l => String(l.user_id)))].map(userId => (
            <MenuItem key={userId} value={userId}>User {userId}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ mr: 2, minWidth: 150 }}>
        <InputLabel id="event-filter-label">Event Type</InputLabel>
        <Select
          labelId="event-filter-label"
          value={filterEvent}
          label="Event Type"
          onChange={(e) => setFilterEvent(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="TAB_SWITCH">Tab Switch</MenuItem>
          <MenuItem value="COPY_PASTE">Copy/Paste</MenuItem>
          <MenuItem value="WEBCAM_DISABLED">Webcam Disabled</MenuItem>
        </Select>
      </FormControl>
      {/* Logs list */}
      <List sx={{ maxHeight: 300, overflow: 'auto', mt: 2, border: '1px solid #ccc' }}>
        {displayedLogs.map(log => (
          <ListItem key={log.id}>
            <ListItemText 
              primary={`User ${log.user_id} - ${log.event_type}`} 
              secondary={new Date(log.timestamp).toLocaleString()} 
            />
          </ListItem>
        ))}
        {displayedLogs.length === 0 && <ListItem><ListItemText primary="No events to display" /></ListItem>}
      </List>
    </Container>
  );
};

export default RealTimeMonitor;
