# Frontend

Minimal React frontend with candidate and recruiter dashboards.

## Setup

1. Install dependencies with npm or yarn.
2. Run the development server:
   ```bash
   npm start
   ```

The application assumes the backend API is available at

`http://localhost:5000`. If you run the backend on a different URL, set the
`REACT_APP_API_BASE` environment variable or edit `src/api.js` and update the
`API_BASE` constant to point to the correct location.
