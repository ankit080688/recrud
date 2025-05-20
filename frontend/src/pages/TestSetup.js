import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert } from '@mui/material';

const TestSetup = () => {
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [message, setMessage] = useState(null);
  const token = localStorage.getItem('token');

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setMessage(null);
    // Build payload with assessment title and one question
    const payload = {
      title,
      questions: [
        { text: questionText, sample_input: sampleInput, expected_output: expectedOutput }
      ]
    };
    try {
      const res = await fetch('http://localhost:5000/assessments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error('Failed to create assessment');
      }
      setMessage('New assessment created successfully.');
      // Reset form fields
      setTitle('');
      setQuestionText('');
      setSampleInput('');
      setExpectedOutput('');
    } catch (err) {
      setMessage('Error creating assessment.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>New Assessment</Typography>
      {message && <Alert severity={message.startsWith('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>{message}</Alert>}
      <form onSubmit={handleCreateTest}>
        <TextField 
          label="Assessment Title" 
          variant="outlined" 
          fullWidth 
          required 
          margin="normal"
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <TextField 
          label="Question Text" 
          variant="outlined" 
          fullWidth 
          required 
          multiline 
          margin="normal"
          value={questionText} 
          onChange={(e) => setQuestionText(e.target.value)} 
        />
        <TextField 
          label="Sample Input" 
          variant="outlined" 
          fullWidth 
          margin="normal"
          value={sampleInput} 
          onChange={(e) => setSampleInput(e.target.value)} 
        />
        <TextField 
          label="Expected Output" 
          variant="outlined" 
          fullWidth 
          margin="normal"
          value={expectedOutput} 
          onChange={(e) => setExpectedOutput(e.target.value)} 
        />
        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>Create Assessment</Button>
      </form>
    </Container>
  );
};

export default TestSetup;
