# Frontend

Minimal React frontend with candidate and recruiter dashboards.

## Setup

1. Install dependencies with npm or yarn.
2. Run the development server:
   ```bash
   npm start
   ```

The application assumes the backend API is available at
`http://localhost:5000`. To use a different server, set `REACT_APP_API_BASE`
when starting webpack:

```bash
REACT_APP_API_BASE="http://192.168.1.10:5000" npm start
```
