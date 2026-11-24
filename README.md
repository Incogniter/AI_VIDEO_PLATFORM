# Streamline frontend

React, TypeScript, and Vite frontend for the Streamline AI video platform.

## Local development

```powershell
npm.cmd install
```

Use `.env.example` as a template for a fresh local `.env`. Set `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY`. The ignored local `.env` is configured for the current Supabase project. The publishable key is intended for browser clients; do not put a service-role key in the frontend.

In Supabase Auth settings, enable Google and Phone providers, configure Google OAuth credentials, and add the local and deployed frontend origins to the redirect allow list. Configure the email template to include the OTP token (`{{ .Token }}`) and connect an SMS provider for phone codes.

The React app reads the Supabase session and attaches its access token to API requests through the Axios request interceptor. MW validates protected requests with Supabase Auth at `GET /auth/me`.

```powershell
npm.cmd run dev
```

Set `VITE_API_BASE_URL` in a local `.env` file to the FastAPI API root, including its `/Synapse` prefix. It defaults to `http://localhost:8000/Synapse`. `public/runtime-config.json` has separate `development` and `production` URLs, so local Vite development uses localhost and the production build uses Render. Update those values when the backend URL changes. The FE fetches this file at runtime and falls back to `VITE_API_BASE_URL` if it is missing or invalid. The runtime config is public and must not contain secrets.

Axios request and response interceptors are centralized in `src/api/client.ts`. The app polls `/health` for connection status and requests `/videos` for the Discovery feed. The current backend only implements health and authentication routes, so Discovery shows sample videos until a `/videos` endpoint is added.

Upload is opened from the navigation menu. It submits a multipart `POST /videos` request with `file`, `title`, and `description`. The API should assign `uploadedAt` and `duration`; the UI calculates the displayed age from `uploadedAt`. The backend upload route still needs to be implemented before uploads can complete.

The other navigation areas are scaffolded for incremental API integration.

## Docker deployment

The root `Dockerfile` builds the Vite app with Node and serves `dist` through Nginx. Nginx falls back to `index.html` for React Router paths, serves the runtime API configuration without caching, and listens on Render's `PORT` (default `10000`). The image build accepts `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` build arguments; pass the public Supabase values through GitHub Actions when building the image. `public/runtime-config.json` selects localhost for development and the Render backend for production.

## Source structure

- `src/components/<ComponentName>/` contains a component and its colocated stylesheet.
- `src/pages/<PageName>/` contains a page and its colocated stylesheet.
- `src/styles/global.css` contains shared tokens, resets, and reusable styles.
- `src/api/`, `src/hooks/`, `src/data/`, and `src/utils/` contain API clients, query hooks, mock data, and helpers.
- `src/auth/` contains Supabase session state, auth flows, and profile metadata helpers.
