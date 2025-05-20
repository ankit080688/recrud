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
   To expose the API on your network, set the `HOST` environment variable:
   ```bash
   HOST=0.0.0.0 python -m backend.app
   ```

The application uses SQLite (`app.db`) for storage and JWT for
authentication.

## Creating a user

Run `create_user.py` to insert a sample candidate account (email `Ankit`,
password `priyal`) directly into the database:

```bash
python create_user.py
```
