# Database setup

Minimal FastAPI health check and SQLAlchemy connection to Supabase PostgreSQL using psycopg2. SQLAlchemy model metadata targets the private `app` schema; no application tables are defined yet.

## Local setup (PowerShell)

From this `backend` directory:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` with the database credentials and endpoint from Supabase. Keep `.env` and the database password out of source control. Use the Session Pooler endpoint if the direct database endpoint is unreachable on an IPv4-only network.

Run the API:

```powershell
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`. The database check is `/Synapse/health/db` (the prefix is configurable through `API_V1_PREFIX`).

## Database schema

SQLAlchemy model metadata defaults to the private `app` schema. Application tables have not been added or created yet.
