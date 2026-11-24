# Streamline frontend

React, TypeScript, and Vite frontend for the Streamline AI video platform.

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

Set `VITE_API_BASE_URL` in a local `.env` file to the FastAPI API root, including its `/Synapse` prefix. It defaults to `http://localhost:8000/Synapse`; use the deployed Render URL for a hosted frontend.

Axios request and response interceptors are centralized in `src/api/client.ts`. The request interceptor adds JSON headers and an optional bearer token from `localStorage`; the response interceptor normalizes API errors. The app polls `/health` for connection status and requests `/videos` for the Discovery feed. The current backend only implements health routes, so Discovery shows sample videos until a `/videos` endpoint is added.

The other navigation areas are scaffolded for incremental API integration.
