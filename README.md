# semantic-segmentation-web

Angular 19 UI for the Semantic Segmentation API — lite purple theme, auth hero, upload → SegFormer viewer, analytics, reports, and history.

## Prerequisites

- API running at `http://127.0.0.1:8000`
- MongoDB (`./scripts/start-mongodb.sh` in API repo), Redis, Celery worker

## Run

```bash
npm install
npm start
```

Open http://localhost:4200 — dev server proxies `/api` to the FastAPI backend (`proxy.conf.json`).

## Flow

1. **Register / Login** — JWT stored in `localStorage`
2. **Upload** — road image, traffic scene, or dashcam video
3. **Viewer** — polls job until SegFormer completes; shows original, overlay, legend
4. **Analytics / Reports / History** — wired to API modules 6–8
5. **Profile** — update name or password

## Production API URL

Set `apiUrl` in `src/environments/environment.prod.ts` to your deployed API base (e.g. `https://api.example.com/api/v1`).
