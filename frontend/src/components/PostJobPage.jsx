import React, { useState } from 'react';
import { API_BASE } from '../api';

function PostJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const token = localStorage.getItem('token');

  const submit = async () => {
    await fetch(`${API_BASE}/jobs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });
    setTitle('');
    setDescription('');
    alert('Posted');
  };

  return (
    <div>
      <h2>Post Job</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <br />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <button onClick={submit}>Submit</button>
    </div>
  );
}

export default PostJobPage;
