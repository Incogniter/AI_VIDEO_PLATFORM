# FastAPI backend

Python 3.12 API foundation for the AI Video & Communication Platform. The initial implementation includes application configuration, API routing, basic health endpoints, and an async SQLAlchemy connection to Supabase PostgreSQL.

## Local setup (PowerShell)

From this `backend` directory:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and replace the database password and `SECRET_KEY`. Rotate the database password that was previously shared before connecting. Never commit `.env`, database credentials, or Supabase secret/service-role keys.

Run the API:

```powershell
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`. Health endpoints are `/api/v1/health` and `/api/v1/health/db`.

## Database migrations

Alembic is included as a dependency and the `alembic/` migration directory is reserved. Configure Alembic after the first SQLAlchemy models are added; no schema migration is created yet.

## Docker

Build from this directory with `docker build -t ai-video-platform-api .`. Supply secrets at runtime through environment variables or a secret manager.
