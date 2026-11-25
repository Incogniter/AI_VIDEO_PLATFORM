# Database setup

FastAPI service and SQLAlchemy connection to Supabase PostgreSQL using psycopg2. SQLAlchemy model metadata targets the private `app` schema. Cross-device login requests use the separately provisioned `private.device_login_requests` table.

## Local setup (PowerShell)

From this `backend` directory:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Set `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME` in `.env` using the connection details from Supabase. Keep `.env` and the database password out of source control. The connection should use the Session Pooler endpoint when connecting from an IPv4-only network; the application assembles the SQLAlchemy URL from these settings and requires SSL.

For Supabase Auth, set `SUPABASE_URL` and the public `SUPABASE_PUBLISHABLE_KEY` in the backend environment. `GET /Synapse/auth/me` validates a signed-in user's bearer access token. `POST /Synapse/auth/device-login-requests` accepts an email without a user token, creates a pending five-minute request, and returns a random request secret once; only its SHA-256 hash is stored in the private table. The email sign-in screen calls this endpoint before requesting a Supabase magic link, and includes the request ID in the redirect URL. Mobile approval, Realtime notification, and laptop session exchange are the next implementation stages, so cross-device completion is not active yet. Never configure a service-role key in the frontend.

Add the frontend's local and deployed origins to `BACKEND_CORS_ORIGINS`. In Supabase Auth settings, enable Google and Phone providers, configure Google OAuth credentials, add the frontend origins to the redirect allow list, keep the magic-link email template configured to use `{{ .ConfirmationURL }}`, and connect an SMS provider for phone OTP.

Run the API:

```powershell
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`. The database check is `/Synapse/health/db` (the prefix is configurable through `API_V1_PREFIX`).

## Database schema

SQLAlchemy model metadata defaults to the private `app` schema. Cross-device login requests are stored in `private.device_login_requests`, with RLS enabled and no direct client read or write policies.
