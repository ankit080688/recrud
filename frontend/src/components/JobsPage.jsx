import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_BASE}/jobs/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, [token]);

  const apply = async (id) => {
    await fetch(`${API_BASE}/jobs/${id}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({})
    });
    alert('Applied');
  };

  return (
    <div>
      <h2>Jobs</h2>
      <ul>
        {jobs.map((j) => (
          <li key={j.id}>
            {j.title}
            <button onClick={() => apply(j.id)}>Apply</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobsPage;
