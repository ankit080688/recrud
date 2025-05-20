# Recrud Demo Application

This repository contains a minimal full-stack demo showcasing a coding
assessment platform with separate Candidate and Recruiter interfaces.

## Structure

- `backend/` – Flask API providing authentication, assessments,
  submissions, proctoring logs and reports.
- `frontend/` – React application with simple dashboards for each role.

## Running

1. Install Python dependencies and start the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m backend.app
   ```
2. Install Node dependencies and start the frontend:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

These applications are simplified to demonstrate the flow of creating
assessments, submitting code and viewing results.
