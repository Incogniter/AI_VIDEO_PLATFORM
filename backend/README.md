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

For Supabase Auth, set `SUPABASE_URL` and the public `SUPABASE_PUBLISHABLE_KEY` in the backend environment. The protected `GET /Synapse/auth/me` endpoint validates a bearer access token with Supabase Auth. Never configure a service-role key in the frontend.

Add the frontend's local and deployed origins to `BACKEND_CORS_ORIGINS`. In Supabase Auth settings, enable Google and Phone providers, configure Google OAuth credentials, add the frontend origins to the redirect allow list, configure the email template to include `{{ .Token }}`, and connect an SMS provider for phone OTP.

Run the API:

```powershell
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`. The database check is `/Synapse/health/db` (the prefix is configurable through `API_V1_PREFIX`).

## Database schema

SQLAlchemy model metadata defaults to the private `app` schema. Application tables have not been added or created yet.
