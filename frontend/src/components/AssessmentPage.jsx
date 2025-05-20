import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../api';

function AssessmentPage() {
  const { id } = useParams();
  const [code, setCode] = useState('');
  const [score, setScore] = useState(null);
  const token = localStorage.getItem('token');

  const submit = async () => {
    const res = await fetch(`${API_BASE}/submissions/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    setScore(data.score);
  };

  return (
    <div>
      <h2>Assessment {id}</h2>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={submit}>Submit</button>
      {score !== null && <p>Score: {score}</p>}
    </div>
  );
}

export default AssessmentPage;
