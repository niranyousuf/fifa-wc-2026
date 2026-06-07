# API cache (24h)

Zafronix responses are stored here, one folder per endpoint:

```
teams/2026.json       ← GET /teams?tournament=2026
standings/2026.json   ← GET /standings?year=2026
matches/2026.json     ← GET /matches?year=2026
```

Each file includes `savedAt` (timestamp) and `data` (API JSON).

- **Fresh window:** 24 hours — the app prefers this file instead of calling the API.
- **Stale fallback:** up to 7 days if the API returns 429 or errors.
- **Refresh:** `npm run cache:warm` locally, or **GitHub Actions every 6h** (commits + pushes → Vercel redeploy). Optional: Vercel Cron `/api/cron/refresh-cache`.

These files are committed so production always has a fallback when API quota is exhausted.
