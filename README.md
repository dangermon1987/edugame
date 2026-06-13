# EduQuest 🎓

A gamified learning adventure for kids ages 5–12 — built as a **local-first**, **static-deployable** React web app. Children learn English, Math, Science, and Art through lessons, quizzes, flashcards, and live "Compete" matches, all wrapped in a coins / gems / XP / streaks / achievements reward economy.

This is a full implementation of the EduQuest spec (`EduQuest-Engineering-Handoff-Spec.docx` + the Flashcards & Compete feature spec), faithful to the approved HTML prototypes.

---

## Highlights

- **20+ screens**: Home, Subject Hub, Quiz, Reward Shop, Profile/Achievements, Parent Dashboard (PIN-gated), Flashcards (hub / study / results), Compete (lobby / matchmaking / live / podium), Study Pet, Adventure Map, Arcade, a playable Memory Match game, Sticker collection, Quiz Workshop, and Theme settings.
- **Data-driven courses**: all content (subjects, lessons, decks, shop, themes, achievements, stickers, games, branding, economy) comes from a swappable **Content Package** (one JSON file). Different package = different course, no code changes. Packages are AI-generatable, uploadable, and loadable from a static folder or Google Drive. See **[CONTENT_FORMAT.md](CONTENT_FORMAT.md)**.
- **Local-first storage** in the browser (a NoSQL-style document snapshot in `localStorage`), with **Google Drive sync every 5 minutes** for long-term, cross-device persistence.
- **Swappable persistence** — one interface (`SnapshotPersistence`) is all you implement to move to a real server/database. A `RestApiPersistence` reference implementation is included.
- **Pure, tested game logic**: XP/leveling, streaks, combo multipliers, SM-2 spaced repetition, and AI compete bots.
- **Ships as a compiled static site** — host on GitHub Pages or any cheap static/object storage. No backend required.
- Accessibility-minded (reduced-motion support, ARIA roles, 44px targets) and COPPA-conscious (earn-only gems, parental gate, no external links/ads).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # type-check + produce static site in dist/
npm run preview      # serve the production build on :4173
npm run test         # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright) — builds + previews automatically
```

---

## Architecture

```
src/
  domain/      Pure game logic (no React): leveling, streak, combo, sm2, bots, types
  content/     Content Package system: schema (format + validate + normalize),
               core.package.json (canonical course), runtime (active package store +
               loader + Drive), evaluate (declarative achievements)
  storage/     Swappable persistence layer + 5-minute SyncEngine
  state/       Zustand store wiring domain + content + storage; derived selectors
  lib/         Google Drive (GIS + Drive API) client, id + color helpers
  components/  AppShell (device frame), BottomNav, StatusBar, Overlays, shared UI
  screens/     One file per screen; content comes from the active package via useContent()
  styles/      legacy.css (ported design system) + shell.css (React/a11y/theming overrides)
public/content/ index.json (pack manifest) + core.json + space.json (a 2nd demo course)
```

### Content packages (courses)

All course content is a single JSON document validated against
[`src/content/schema.ts`](src/content/schema.ts). The app resolves the active
package as: cached pick in `localStorage` → built-in core. Users can also load a
pack from the static `/content` folder, **upload** a `.json` file, or save/load it
to Google Drive — all from **Settings → Course Pack**. Two courses ship as a demo
of swappability: *EduQuest Core* and *Space Explorers*. Authoring guide (and the
format for AI generation): **[CONTENT_FORMAT.md](CONTENT_FORMAT.md)**.

`npm run dev`/`build` run a prebuild step that mirrors `core.package.json` into
`public/content/core.json` so the static-folder path serves the same data.

### Data flow & persistence

The single source of truth is one `UserState` object (document collections held as id-keyed maps — the "browser NoSQL database"). It lives in a Zustand store and is mirrored to `localStorage` synchronously on every change.

```
UI → store actions → UserState (in memory) → localStorage (instant, short-term)
                                           ↘ SyncEngine → remote (every 5 min, long-term)
```

The **only** seam you touch to change backends is:

```ts
interface SnapshotPersistence {
  load(): Promise<PersistedSnapshot | null>
  save(snapshot: PersistedSnapshot): Promise<void>
  clear(): Promise<void>
  isAvailable(): boolean
}
```

Provided implementations: `LocalStoragePersistence` (primary), `GoogleDrivePersistence` (long-term sync, `appDataFolder`), `MemoryPersistence` (tests), and `RestApiPersistence` (a documented stub for moving to a real server). Conflict resolution is snapshot-level last-write-wins by `updatedAt`; the `applyRemote` callback is the hook for a smarter merge later.

**To switch to a real server:** implement `SnapshotPersistence` against your API (or copy `RestApiPersistence`), construct it, and hand it to the `SyncEngine` in `state/store.ts`. Nothing in the UI or domain layers changes.

---

## Google Drive sync (optional)

Without configuration, EduQuest runs fully in local-only mode. To enable cloud sync:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an **OAuth 2.0 Web application** client.
2. Enable the **Google Drive API**.
3. Add your origins (e.g. `http://localhost:5173` and your Pages URL) to **Authorized JavaScript origins**.
4. Copy `.env.example` to `.env` and set `VITE_GOOGLE_CLIENT_ID`.
5. In the app: **Profile → Settings → Cloud Sync → Connect**.

The save lives in Drive's hidden `appDataFolder` (private to this app, invisible in the user's normal Drive). Sync runs every 5 minutes and on tab hide/close.

---

## Deploying as a static site

### GitHub Pages (included workflow)

Push to `main`. `.github/workflows/deploy.yml` type-checks, tests, builds with the correct base path (`/<repo>/`), and publishes `dist/` to Pages. Enable Pages → "GitHub Actions" in repo settings. (Optionally add a `VITE_GOOGLE_CLIENT_ID` Actions **variable** to bake in Drive sync.)

Routing uses `HashRouter`, so deep links work on static hosts with no server config (a `404.html` copy is added as a belt-and-suspenders fallback).

### Any static / object storage (S3, R2, Netlify, etc.)

```bash
VITE_BASE=/ npm run build      # or VITE_BASE=/subpath/ if served under a path
# upload the contents of dist/ to your bucket / CDN
```

---

## Testing

- **Unit** (Vitest, jsdom): domain logic, the SyncEngine conflict resolution, and store actions (rewards, purchases, lessons, achievements, persistence).
- **E2E** (Playwright): home load, navigation, a full lesson run with rewards, a flashcard session, a shop purchase, a complete Compete match through the podium, the parent PIN gate, and the memory game.

```bash
npm run test
npm run test:e2e
```

---

## Tech stack

React 18 · TypeScript · Vite · React Router (Hash) · Zustand · Vitest · Playwright · Google Identity Services + Drive REST API. No backend.
