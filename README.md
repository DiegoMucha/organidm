# OrganiDM

Vite React frontend with a separate backend folder reserved for the FastAPI API.

## Project Structure

- `frontend/` contains the Vite React app.
- `backend/` is reserved for the FastAPI backend.

## Development

Run the frontend:

```sh
cd frontend
npm run dev
```

Build the frontend:

```sh
cd frontend
npm run build
```

The Vite dev server proxies `/api` to `http://127.0.0.1:8000`.

## Environment

For production, set `VITE_API_URL` in Netlify to your backend URL, for example:

```sh
VITE_API_URL=https://your-backend.onrender.com
```

For local frontend env values, copy `frontend/.env.example` to `frontend/.env`.
