# Backend

This is a minimal Flask backend providing authentication, assessments,
submissions, proctoring logs and reporting endpoints.

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   python -m backend.app
   ```

The application uses SQLite (`app.db`) for storage and JWT for
authentication.
