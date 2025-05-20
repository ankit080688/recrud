import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../api';

function ReportsPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${BASE_URL}/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setReport(data));
  }, [id, token]);

  if (!report) return <p>Loading...</p>;
  return (
    <div>
      <h2>Report for {report.user}</h2>
      <ul>
        {report.results.map((r, i) => (
          <li key={i}>Question {r.question_id}: {r.score}</li>
        ))}
      </ul>
    </div>
  );
}

export default ReportsPage;
