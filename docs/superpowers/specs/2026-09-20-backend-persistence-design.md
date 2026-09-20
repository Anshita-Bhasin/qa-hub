# Backend, Sub-project 1: Server + Database + Persistence API

**Status:** Approved for planning
**Date:** 2026-09-20
**Scope:** First of three sequential sub-projects toward a "real backend" for the QA tool. This sub-project makes issues, runs, pins, and scraped products durable and served from a real API. It does **not** implement real scraping or real Playwright execution — those are sub-projects 2 and 3, to be designed and specced separately once this lands.

## Context

The app (`qa-hub`) is currently a pure frontend prototype: React + Vite + TypeScript. All data — `DetectedIssue`, `ExecutionRun`, `ReviewPin`, `ProductItem`, `TestSuite` — lives in React `useState`, seeded from static fixtures in [`src/data/initialData.ts`](../../../src/data/initialData.ts). The one exception is [`src/utils/runHistory.ts`](../../../src/utils/runHistory.ts), which persists `ExecutionRun`s to `localStorage`. The scraper (`ScraperScreen`) and test runner (`FunctionalTestsScreen`) simulate their work with `setTimeout`, returning canned data — no real scraping or test execution occurs. `express` and `dotenv` are already listed in `package.json` dependencies but are currently unused (no server code exists).

## Goals

- Replace in-memory/localStorage state for issues, runs, and pins with a real server-backed store.
- Give the (future) scraper sub-project a place to persist `ProductItem` results.
- Establish the server/DB/API pattern that sub-projects 2 and 3 will build on.
- Preserve current UI behavior and appearance exactly — this is a plumbing change, not a UX change.

## Non-goals

- Real web scraping (sub-project 2).
- Real Playwright test execution (sub-project 3).
- Authentication/authorization (single-user local tool for now).
- Production deployment configuration.
- Changing any component's visual design or interaction flow.

## Architecture

A standalone Node/Express server lives under `server/`, run as a separate process from the Vite dev server.

```
Browser (Vite dev server, :3000)
   │  fetch('/api/...')
   ▼
Vite dev proxy  ──────────────►  Express server (:PORT, e.g. 3001)
                                        │
                                        ▼
                                  SQLite file (server/data/qa-hub.db)
                                  via better-sqlite3
```

- **Dev orchestration:** `npm run dev` runs both the Vite dev server and the Express server concurrently (via the `concurrently` package). Vite's `server.proxy` config forwards `/api/*` requests to the Express server's port.
- **Database:** SQLite via `better-sqlite3` — synchronous API, zero external infra, a single file on disk. Matches this app's single-user, local-first usage. (If this ever needs multi-user/hosted use, the DB access is isolated behind a small data-access module, making a Postgres swap contained.)
- **Server structure:**
  ```
  server/
    index.ts          # Express app setup, middleware, route mounting
    db.ts              # better-sqlite3 connection + schema migration on boot
    routes/
      issues.ts
      runs.ts
      pins.ts
      products.ts
    seed.ts             # one-time seed from src/data/initialData.ts
  ```

## Data model

SQLite tables mirroring the existing TypeScript types in `src/types.ts`. Each table's columns match its interface's fields; complex fields (`reproSteps: string[]`, `steps: TestStep[]`) are stored as JSON text columns and parsed/serialized at the API boundary, since SQLite has no native array/object column type and these fields are always read/written whole (never queried by sub-field).

- **`issues`** — mirrors `DetectedIssue`. Primary key `id`. JSON columns: `reproSteps`.
- **`runs`** — mirrors `ExecutionRun`. Primary key `id`.
- **`pins`** — mirrors `ReviewPin`. Primary key `id`.
- **`products`** — mirrors `ProductItem`. Primary key `id`. Created now (for sub-project 2 to use) even though no UI writes to it yet.

Schema is created via a migration run at server boot (`db.ts` checks for table existence and runs `CREATE TABLE IF NOT EXISTS` — no formal migration framework needed at this scale).

## API surface

REST, JSON request/response bodies, mounted under `/api`:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/issues` | List all issues |
| POST | `/api/issues` | Create issue(s) — accepts a single issue or array (for scraper/pin sync bulk-adds) |
| PATCH | `/api/issues/:id` | Partial update (used today for status changes) |
| GET | `/api/runs` | List all runs, newest first |
| POST | `/api/runs` | Record a new run |
| GET | `/api/pins` | List all pins |
| POST | `/api/pins` | Create a pin |
| PATCH | `/api/pins/:id` | Update a pin (status) |
| DELETE | `/api/pins/:id` | Delete a pin |
| GET | `/api/products` | List products (unused by UI yet, ready for sub-project 2) |
| POST | `/api/products` | Bulk-upsert products |

No pagination/filtering for v1 — current UI always loads the full list client-side, matching today's behavior.

## Frontend changes

- New `src/utils/api.ts`: thin `fetch` wrapper (`getJSON`, `postJSON`, `patchJSON`, `del`) with a shared base path (`/api`) and consistent error handling (throws on non-2xx with parsed error body when available).
- `App.tsx`: replace `useState(INITIAL_ISSUES)` / `useState(INITIAL_RUNS)` with a `useEffect` fetch on mount into state, and route existing mutation handlers (`handleUpdateIssueStatus`, `handleAddScrapedIssues`, `handleRunSwarm`'s run-recording) through the API client instead of local array manipulation + `recordRun`.
- `ReviewPinsScreen.tsx`: fetch pins on mount instead of `useState(INITIAL_PINS)`; create/delete/sync-to-issues go through the API.
- `src/utils/runHistory.ts` is deleted; the `runs` table replaces its localStorage role.
- `src/data/initialData.ts` stops being imported by any component once the seed script has consumed it (kept in the repo as the seed source, not deleted).
- Loading states: each screen shows its existing skeleton/empty state (already present in the UI) while the initial fetch is in flight — no new loading UI needs to be designed.

## Seeding

`server/seed.ts`, run manually once (`npm run db:seed`) or automatically on first boot if the `issues` table is empty: reads the exported arrays from `src/data/initialData.ts` (`INITIAL_ISSUES`, `INITIAL_PRODUCTS`, `PROBLEM_USER_PRODUCTS`, `INITIAL_PINS`, and whatever run fixtures exist) and inserts them into the corresponding tables. This makes first-run appearance identical to today's hardcoded UI, but backed by real rows.

## Error handling

- Server: routes wrap DB calls in try/catch, return `{ error: string }` with appropriate status codes (400 for bad input, 404 for missing id, 500 for unexpected). No retry/queueing logic needed at this scale.
- Client: `api.ts` surfaces errors via the existing toast (`showToast`) mechanism already in `App.tsx`, so failures are visible the same way other notifications are today.

## Testing

- **Server:** integration tests using `supertest` against the Express app, pointed at a temp SQLite file per test run (created fresh, deleted after). Cover create/read/update/delete for each resource, plus the seed script producing the expected row counts.
- **Frontend:** no new component tests introduced (none exist today); verify manually via `npm run dev` that each screen's behavior (viewing, status updates, pin creation/deletion, swarm-run recording) is unchanged from a user's perspective.

## Open questions for future sub-projects (not blocking this one)

- Sub-project 2 (real scraper) will need to decide how scrape jobs are triggered/run (inline in the request vs. background job) and how `products` rows relate to generated `issues`.
- Sub-project 3 (real Playwright execution) will need a job runner/queue since browser automation is long-running and shouldn't block an HTTP request — likely a separate concern from this REST API.
