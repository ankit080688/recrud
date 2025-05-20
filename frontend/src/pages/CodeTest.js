import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, TextField, Button, Alert } from '@mui/material';

const CodeTest = () => {
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('// Write your solution here\n');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const codeInputRef = useRef(null);
  const token = localStorage.getItem('token');

  // Fetch the test (assessment) for the candidate.
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch('http://localhost:5000/assessments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.length > 0) {
          // For simplicity, take the first assessment assigned to this candidate
          const assessment = data[0];
          if (assessment.questions && assessment.questions.length > 0) {
            setQuestion(assessment.questions[0]);  // take first question for demo
          } else {
            setQuestion({ text: 'No questions available.' });
          }
        } else {
          console.error('No assessment found or error fetching assessment');
        }
      } catch (err) {
        console.error('Failed to load assessment', err);
      }
    };
    fetchAssessment();
  }, [token]);

  // Proctoring: log an event to the server
  const logEvent = async (eventType) => {
    try {
      await fetch('http://localhost:5000/log_event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ event: eventType })
      });
    } catch (err) {
      console.error('Failed to log event', err);
    }
  };

  // Setup proctoring event listeners (tab switch, copy-paste, webcam)
  useEffect(() => {
    // Tab switch monitoring
    const handleBlur = () => {
      // User switched away from tab
      logEvent('TAB_SWITCH');
    };
    const handleFocus = () => {
      // You could log focus return or just handle accordingly
    };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // Copy-paste prevention in code editor
    const codeElem = codeInputRef.current;
    if (codeElem) {
      codeElem.addEventListener('paste', (e) => {
        e.preventDefault();
        alert('Pasting is disabled during the test!');
        logEvent('COPY_PASTE');
      });
      codeElem.addEventListener('copy', (e) => {
        e.preventDefault();
        alert('Copying is disabled during the test!');
        logEvent('COPY_PASTE');
      });
    }

    // Webcam monitoring stub
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // We have webcam access; stop it immediately since we only needed a check
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          // If user denies or there's an error, log an event and alert
          logEvent('WEBCAM_DISABLED');
          alert('Webcam access was denied or unavailable!');
        });
    }

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      if (codeElem) {
        codeElem.onpaste = null;
        codeElem.oncopy = null;
      }
    };
  }, [token]);

  const handleSubmitCode = async () => {
    setResult(null);
    setError(null);
    if (!question) return;
    try {
      const res = await fetch('http://localhost:5000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question_id: question.id, code })
      });
      const data = await res.json();
      if (!res.ok) {
        // If server returns an error (e.g., code execution error)
        setError(data.details || 'Error executing code');
      } else {
        // Show result: "passed" or "failed", and any output
        setResult(data.result === 'passed' ? 'All test cases passed!' : `Test cases failed. Output: ${data.output}`);
      }
    } catch (err) {
      setError('Submission failed');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Coding Challenge</Typography>
      {question ? (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {/* Display the question prompt */}
            <strong>Problem:</strong> {question.text}
          </Typography>
          {/* Simple code editor as a textarea */}
          <TextField
            inputRef={codeInputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            multiline
            minRows={10}
            maxRows={20}
            fullWidth
            variant="outlined"
            label="Your Code"
          />
          <Button variant="contained" color="primary" onClick={handleSubmitCode} sx={{ mt: 2 }}>Submit Code</Button>
        </>
      ) : (
        <Typography>Loading question...</Typography>
      )}
      {result && <Alert severity="success" sx={{ mt: 2 }}>{result}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Container>
  );
};

export default CodeTest;
