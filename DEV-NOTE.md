# 🏆 FIFA World Cup 2026 — Next.js App Dev Note

## Project Overview

A full-stack Next.js web app where users can browse FIFA World Cup 2026 fixtures, results, group standings, team details, match statistics, and knockout bracket. A persistent visitor counter is displayed on the sidebar/corner at all times.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Theme Toggle | `next-themes` |
| Icons | `lucide-react` |
| Data Source | API-Football (v3) |
| Visitor Store | JSON file (`data/visitors.json`) |
| Deployment Target | Vercel (or any Node host) |

---

## Environment Variables

```env
# .env.local
API_FOOTBALL_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Project Structure

```
wc2026/
├── app/
│   ├── layout.js                        # Root layout — Navbar + VisitorCounter + ThemeProvider
│   ├── page.js                          # Home — default Group view, toggle to Calendar view
│   ├── team/[id]/page.js                # Team detail page — info + squad
│   ├── match/[id]/page.js               # Match detail page — stats + events
│   └── api/
│       ├── fixtures/route.js            # GET fixtures (filter by status, round)
│       ├── standings/route.js           # GET group standings (all 12 groups)
│       ├── team/[id]/route.js           # GET team info + squad
│       ├── match/[id]/route.js          # GET match detail + statistics
│       ├── search/route.js              # GET search teams by name
│       └── visitor/route.js            # GET count | POST increment
├── components/
│   ├── Navbar.jsx                       # Logo + SearchBar + ThemeToggle
│   ├── VisitorCounter.jsx               # Fixed position counter widget
│   ├── ViewToggle.jsx                   # "Group View" vs "Calendar View" switcher
│   ├── GroupTable.jsx                   # Single group standings table
│   ├── FixtureCard.jsx                  # Single match card (teams, score, date)
│   ├── CalendarView.jsx                 # Fixtures grouped by date
│   ├── KnockoutBracket.jsx              # Visual bracket (Round of 32 → Final)
│   ├── MatchStats.jsx                   # Bar chart style match statistics
│   ├── TeamSquad.jsx                    # Squad list with player details
│   └── SearchResults.jsx               # Dropdown search result list
├── lib/
│   └── api.js                           # footballFetch() helper + WC constants
├── data/
│   └── visitors.json                    # { "count": 0 } — persisted visitor count
└── .env.local
```

---

## API Routes Detail

### `GET /api/fixtures`
Fetches fixtures from API-Football. Supports query params:

| Param | Type | Example | Description |
|---|---|---|---|
| `status` | string | `FT` | Filter by match status |
| `round` | string | `Group Stage - 1` | Filter by round name |

**Match status codes:**
- `NS` — Not Started
- `FT` — Full Time (completed)
- `PEN` — Penalty Shootout
- `AET` — After Extra Time

**API-Football call:**
```
GET /fixtures?league=1&season=2026&status=FT
```

---

### `GET /api/standings`
Returns all 12 group tables.

**API-Football call:**
```
GET /standings?league=1&season=2026
```

Response shape per group:
```json
{
  "group": "Group A",
  "standings": [
    { "rank": 1, "team": { "id": 1, "name": "Brazil", "logo": "..." }, "points": 9, "goalsDiff": 5, "all": { "played": 3, "win": 3, "draw": 0, "lose": 0 } }
  ]
}
```

---

### `GET /api/team/[id]`
Returns team info + squad. Fetches two endpoints in parallel via `Promise.all`.

**API-Football calls:**
```
GET /teams?id={id}
GET /players/squads?team={id}
```

---

### `GET /api/match/[id]`
Returns fixture details + match statistics. Fetches two endpoints in parallel.

**API-Football calls:**
```
GET /fixtures?id={id}
GET /fixtures/statistics?fixture={id}
```

---

### `GET /api/search?q=brazil`
Searches teams by name within the World Cup league.

**API-Football call:**
```
GET /teams?league=1&season=2026&search={q}
```

---

### `GET /api/visitor` → Read count
### `POST /api/visitor` → Increment count

Uses Node.js `fs` module to read/write `data/visitors.json` synchronously.

```json
// data/visitors.json (initial file — create manually)
{ "count": 0 }
```

> ⚠️ JSON file works for dev/single-instance deployment. For multi-instance (e.g. scaled Vercel), replace with Upstash Redis or Supabase later.

---

## Page Details

### `/` — Home Page

- Default view: **Group View** — shows all 12 groups side by side using `GroupTable` component
- Toggle to **Calendar View** — shows all fixtures grouped by date using `CalendarView`
- `ViewToggle` component switches between the two views (stored in `useState`)
- On load, fetch both standings + fixtures (NS + FT) simultaneously

---

### `/match/[id]` — Match Detail Page

- Header: Team logos, names, score (or kickoff time if not started)
- Tabs: **Statistics** | **Events** (goals, cards, substitutions)
- `MatchStats` component renders stat bars (possession, shots, corners, etc.)

---

### `/team/[id]` — Team Detail Page

- Team logo, name, country flag
- `TeamSquad` component: list of players with position, age, number

---

## Components Detail

### `VisitorCounter.jsx`
- Fixed position — bottom-right corner, always visible
- On mount: calls `POST /api/visitor` (increment), then `GET /api/visitor` (read)
- Displays: `👁 12,345 visitors`
- Animate count on load with a simple count-up effect

### `Navbar.jsx`
- Left: App logo/name "WC 2026"
- Center: Search input — debounced (300ms), calls `GET /api/search?q=`
- Right: Dark/Light theme toggle button using `next-themes`
- Search results shown in a dropdown (`SearchResults` component), clicking navigates to `/team/[id]`

### `KnockoutBracket.jsx`
- Visual tree bracket: Round of 32 → Round of 16 → QF → SF → Final
- Each slot shows: Team name/logo + score (or "TBD" if not played)
- Data source: fixtures filtered by round name (e.g. `Round of 16`)

### `GroupTable.jsx`
- Standard football standings table
- Columns: Rank, Team, P, W, D, L, GF, GA, GD, Pts
- Top 2 rows highlighted (qualify), 3rd row conditionally highlighted (best 3rd)

### `FixtureCard.jsx`
- Shows: Home team — Score — Away team (or date/time if upcoming)
- Clicking navigates to `/match/[id]`

---

## Data Fetching Strategy

| Data | Method | Cache |
|---|---|---|
| Standings | Server Component fetch | `revalidate: 300` (5 min) |
| Fixtures | Server Component fetch | `revalidate: 300` (5 min) |
| Match detail | Server Component fetch | `revalidate: 60` (1 min) |
| Team/Squad | Server Component fetch | `revalidate: 3600` (1 hr) |
| Search | Client-side fetch (debounced) | No cache |
| Visitor count | Client-side fetch | No cache |

All API-Football calls go through internal `/api/*` routes — **API key is never exposed to the client.**

---

## UI / Design Direction

- **Theme:** Dark (FIFA-style deep navy/black) + Light (clean white) — toggle via `next-themes`
- **Font:** Display font for headings (e.g. `Bebas Neue` or `Barlow Condensed`), clean sans for body
- **Colors:**
  - Dark mode: `#0a0f1e` background, `#FFD700` gold accent, `#ffffff` text
  - Light mode: `#f5f5f5` background, `#1a237e` navy accent, `#111` text
- **Layout:** Max width `1400px`, centered, responsive grid
- **FixtureCard:** Subtle hover lift + border glow effect
- **Bracket:** SVG or CSS-grid based connector lines between rounds

---

## Setup Instructions

```bash
# 1. Create project
npx create-next-app@latest wc2026 --tailwind --eslint --app
cd wc2026

# 2. Install dependencies
npm install next-themes lucide-react
npx shadcn@latest init
npx shadcn@latest add button badge tabs card

# 3. Create initial visitor file
mkdir data && echo '{"count":0}' > data/visitors.json

# 4. Add .env.local with API key

# 5. Run dev
npm run dev
```

---

## Important Notes for Agent

1. **API key** must only be used server-side (inside `app/api/` routes or Server Components). Never pass to client.
2. **`data/visitors.json`** path must use `process.cwd()` — not `__dirname` — in Next.js App Router.
3. **`fs` module** only works in Node.js runtime. Ensure `export const runtime = 'nodejs'` in visitor route if needed.
4. **ISR (Incremental Static Regeneration)** via `next: { revalidate: N }` in fetch — do not use `cache: 'no-store'` for standings/fixtures (too many API calls, free tier limit is 100/day).
5. **API-Football free tier:** 100 requests/day. Use ISR caching aggressively.
6. **Knockout bracket data:** filter fixtures by round name strings like `"Round of 32"`, `"Round of 16"`, `"Quarter-finals"`, `"Semi-finals"`, `"Final"`.
7. **Search:** must be debounced (min 300ms delay, min 2 chars) to avoid burning API quota.
8. World Cup starts **June 11, 2026** — before that, only `NS` (upcoming) fixtures will return. No `FT` results until then.

---

## API Reference

- API-Football Docs: https://www.api-football.com/documentation-v3
- Free tier dashboard: https://dashboard.api-football.com
- World Cup league ID: `1`
- Season: `2026`