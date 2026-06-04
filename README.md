# FIFA World Cup 2026 Hub

Fan-built site to follow the 2026 World Cup — fixtures, standings, teams, knockout bracket, and favorites — powered by the [Zafronix World Cup API](https://api.zafronix.com/). Includes a separate **tournament prediction simulator** (entertainment only; not linked to real results). Not affiliated with FIFA.

**Live demo:** [https://fifa-wc-2026-alpha.vercel.app/](https://fifa-wc-2026-alpha.vercel.app/)

## Features

- **Home** — Hero slider, match feed with stage filters, high-voltage / favorite countdowns, 48-team format guide
- **Hub** — All 12 group tables, calendar view, finished results, draggable knockout bracket
- **Favorites** — Star nations in the navbar; filtered fixtures and countdowns (stored in your browser)
- **Teams** — Browse nations, FIFA rankings, squads, links to team pages
- **Match / team pages** — Scores, stats, events, kickoffs in your local timezone
- **Simulator** — Predict every group score and play through knockouts (optional penalties); `localStorage` for 60 days
- **High voltage** — Highlights top-ranked clashes and key knockout ties
- **Privacy** — Policy plus clear browser data (favorites, simulator, session flags)
- **Theme** — Dark / light toggle

## Stack

- Next.js 16 (App Router) · React 19 · Tailwind CSS
- [Zafronix API](https://api.zafronix.com/) — fixtures, standings, squads
- TheSportsDB — player photo lookups (cached in `data/player-photos.json`)
- `@teispace/next-themes` · `lucide-react` · Swiper (home hero)

## Setup

```bash
git clone <repo-url>
cd fifa-wc-2026

cp .env.example .env.local
# Add ZAFRONIX_API_KEY from https://api.zafronix.com/signup

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: warm API disk cache

```bash
npm run cache:warm
```

Writes JSON under `data/api-cache/` (gitignored) to speed up local dev and cold starts.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `ZAFRONIX_API_KEY` | Yes* | Primary API key (`X-API-Key` header) |
| `ZAFRONIX_API_KEYS` | No | Comma-separated fallback keys on 429 rate limit |
| `WC_YEAR` | No | Tournament year (default `2026`) |
| `NEXT_PUBLIC_APP_URL` | No | Canonical app URL (metadata / links) |

\*Or set only `ZAFRONIX_API_KEYS`.

API keys are **server-only** — never exposed to the client. Pages use internal `/api/*` routes and ISR (typically 5 minutes for hub/home data).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run cache:warm` | Populate `data/api-cache/` from Zafronix |
| `npm run lint` | ESLint (may need `eslint.config` migration on ESLint 9) |

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/hub` | Groups, calendar, results, bracket |
| `/favorites` | Starred teams |
| `/teams` | Team list & rankings |
| `/team/[id]` | Team detail & squad |
| `/match/[id]` | Match detail |
| `/simulator` | Prediction simulator |
| `/about` | Site overview & credits |
| `/privacy` | Privacy policy |

### API routes

`GET /api/fixtures` · `GET /api/standings` · `GET /api/team/[id]` · `GET /api/match/[id]` · `GET /api/search?q=` · `POST /api/player-photos` · `GET /api/captain-photos?home=&away=`

## Project structure

```
app/                 # App Router pages & API routes
components/          # UI (home, hub, simulator, shared)
lib/                 # API client, cache, simulator logic, utils
data/                # Static JSON (rankings, photos, captains)
scripts/             # cache warm, hero image verify
```

## Deploy (Vercel)

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. **Settings → Environment Variables** — add `ZAFRONIX_API_KEY` (and optional vars above) for Production, Preview, and Development.
3. Deploy (or redeploy after adding env vars).

**Notes:**

- **Web Analytics** — Vercel Web Analytics is enabled in the root layout; view stats in the Vercel dashboard (Analytics tab).
- **Disk cache** — `data/api-cache/` writes are best-effort on Vercel; in-memory + API caching still applies.
- Commit static `data/` files (`player-photos.json`, `fifa-rankings.json`, etc.). `data/api-cache/` is gitignored.

## 2026 tournament format

48 teams · 12 groups of 4 · top two per group plus eight best third-place teams → Round of 32 through Final (104 matches). Co-hosted by USA, Canada, and Mexico.

## License

Private project — see repository owner for terms.
