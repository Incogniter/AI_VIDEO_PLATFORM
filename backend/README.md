# Database setup

Minimal FastAPI health check and SQLAlchemy connection to Supabase PostgreSQL using psycopg2. SQLAlchemy model metadata targets the private `app` schema; no application tables are defined yet.

## Local setup (PowerShell)

From this `backend` directory:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Set `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME` in `.env` using the connection details from Supabase. Keep `.env` and the database password out of source control. The connection should use the Session Pooler endpoint when connecting from an IPv4-only network; the application assembles the SQLAlchemy URL from these settings and requires SSL.

Run the API:

```powershell
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`. The database check is `/Synapse/health/db` (the prefix is configurable through `API_V1_PREFIX`).

## Database schema

SQLAlchemy model metadata defaults to the private `app` schema. Application tables have not been added or created yet.
