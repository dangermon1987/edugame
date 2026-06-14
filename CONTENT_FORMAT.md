# EduQuest Content Package format

A **content package** is one JSON file that supplies *all* the course content the
app renders — subjects, lessons, flashcards, the shop, themes, achievements,
stickers, arcade games, the study pet, branding, and the reward economy. Swap the
package and you get a completely different course, with **no code changes**.

This document is the authoring guide. It is written so an AI (or a human) can
generate a valid package. The canonical, complete example is
[`src/content/core.package.json`](src/content/core.package.json); a second,
smaller example is [`public/content/space.json`](public/content/space.json).

Schema + validation live in [`src/content/schema.ts`](src/content/schema.ts).

---

## What is and isn't in a package

- **In a package (course content):** subjects, lessons + questions, flashcard
  decks + cards, shop items, themes, achievements, stickers, arcade games, pet,
  app branding, reward economy, default new-player profile.
- **Not in a package (per user):** progress, coins/gems/XP earned, owned items,
  streaks. That is user state, stored separately and synced to Google Drive.

Currency, XP and earned achievements are global across courses; lesson/card
*progress* is keyed by content id, so switching packs naturally shows fresh
progress for the new course.

---

## How packages are loaded

Resolution order at boot (`src/content/runtime.ts`):

1. **Cached active package** in `localStorage` (`eduquest.content`) — set when the
   user uploads, switches, or loads a pack.
2. **Built-in core package** (bundled `core.package.json`) as the always-available
   fallback.

Additional sources, surfaced in **Settings → Course Pack**:

- **Static folder** — `public/content/index.json` lists installable packs; each
  entry points to a `*.json` file in `public/content/`. Selecting one fetches it
  and caches it as active. (This is the "load from static folder into
  localStorage" path.)
- **Upload** — import any `*.json` package file from disk.
- **Google Drive** — save/load the active pack to the user's Drive appData folder.

---

## Language (`meta.locale`) drives the whole UI

The app's chrome (nav, buttons, headings, etc.) is localized and **follows the
active course's `meta.locale`** — supported: `en`, `vi`, `zh`, `ja` (others fall
back to English). So a `"locale": "zh"` pack makes the entire interface Chinese,
not just its content. Author each pack's content **in its locale's language**;
the UI will match automatically. (UI strings live in `src/i18n/`; course content
lives in the package.)

## Top-level shape

```jsonc
{
  "format": "eduquest-content",   // required, must be exactly this
  "formatVersion": 1,             // required
  "meta": { ... },                // required
  "app": { ... },                 // optional (branding + daily challenge)
  "economy": { ... },             // optional (defaults applied per-field)
  "defaultProfile": { ... },      // optional (new-player profile)
  "subjects": [ ... ],            // required, >= 1
  "lessons": [ ... ],             // required, >= 1
  "decks": [ ... ],               // optional
  "shopItems": [ ... ],           // optional
  "themes": [ ... ],              // optional (a default is injected if omitted)
  "achievements": [ ... ],        // optional
  "stickers": [ ... ],            // optional
  "arcadeGames": [ ... ],         // optional (Memory Match injected if omitted)
  "pet": { ... }                  // optional
}
```

Only `format`, `formatVersion`, `meta`, `subjects`, and `lessons` are required.
Everything else gets sensible defaults via `normalizeContentPackage`, so a tiny
"subjects + lessons" package is fully playable.

---

## Sections

### meta (required)
```jsonc
{ "id": "core", "name": "EduQuest Core", "description": "…",
  "author": "EduQuest", "version": "1.0.0", "locale": "en",
  "cover": "🎓", "createdAt": "2026-06-14" }
```
`id` must be unique (used as the pack key). `cover` is an emoji for the picker.

### subjects (required, ≥1)
```jsonc
{ "id": "math", "name": "Math", "description": "Addition & Shapes",
  "icon": "fas fa-calculator", "emoji": "🔢", "colorClass": "math" }
```
- `id` — any string (arbitrary; e.g. `"planets"`).
- `icon` — a Font Awesome 6 class.
- `colorClass` — a **palette slot**, one of:
  `english` (purple) · `math` (red) · `science` (cyan) · `art` (orange) ·
  `music` (pink) · `coding` (blue). Pick whichever color you want the subject to
  use; it does not have to relate to the subject name.

The Home screen shows the first 4 subjects in a 2×2 grid; the Adventure Map shows
the first 6. Provide 4 for the best fit.

### lessons (required, ≥1)
```jsonc
{ "id": "math-l1", "subjectId": "math", "title": "Counting Fun",
  "description": "Count from 1 to 20", "order": 1, "estMinutes": 12,
  "coinReward": 50, "gemReward": 0,
  "questions": [
    { "id": "q1", "type": "Counting", "prompt": "What comes after 7?",
      "options": ["8", "6", "9", "5"], "correctIndex": 0, "hint": "optional" }
  ] }
```
- `subjectId` must match a subject `id`.
- `order` controls position in the learning path.
- 2–4 `options` per question; `correctIndex` is 0-based.
- `coinReward`/`gemReward` are the lesson's base reward; XP and perfect bonuses
  come from `economy.lesson`.

### decks + cards (optional)
```jsonc
{ "id": "deck-animals", "subject": "science", "title": "Animal Friends",
  "description": "…", "iconEmoji": "🦁", "difficulty": "Easy",
  "cards": [
    { "id": "c1", "deckId": "deck-animals", "frontEmoji": "🦁",
      "frontText": "What animal is this?", "backContent": "Lion",
      "backDetails": "Lions live in groups called prides." }
  ] }
```
`difficulty` ∈ `Easy | Medium | Hard`. Flashcards use SM-2 spaced repetition.

### shopItems (optional)
```jsonc
{ "id": "av-lion", "category": "avatars", "name": "Lion King",
  "preview": "🦁", "price": 500, "currency": "coins",
  "rarity": "new", "payload": "🦁" }
```
- `category` ∈ `avatars | themes | pets | powerups`.
- `currency` ∈ `coins | gems`.
- `rarity` (optional) ∈ `common | new | hot | rare`.
- `payload`: for **avatars** the emoji to equip; for **themes** the theme `id` to
  apply (must match a `themes[].id`); for power-ups a tag string.

### themes (optional)
```jsonc
{ "id": "ocean", "name": "Ocean Blue", "emoji": "🌊",
  "description": "Cool and calm", "swatch": ["#2e86de", "#54a0ff", "#1dd1a1"] }
```
`id` `""` is the built-in default. Available theme ids with real CSS palettes:
`"" | ocean | forest | sunset | candy | midnight`. (Custom ids render with their
swatch preview but fall back to the default palette in-app.)

### achievements (optional) — declarative criteria
```jsonc
{ "id": "bookworm", "name": "Bookworm", "emoji": "📚",
  "description": "Complete 10 lessons",
  "criteria": { "stat": "lessonsCompleted", "gte": 10 } }
```
`criteria.stat` ∈
`lessonsCompleted | streak | competeWins | coins | xp | ownedItems |
threeStarLessons | perfectLessons | masteredCards | avgAccuracy`.
Earned when the stat `>= gte`. For `avgAccuracy` add `minSamples` (0–1 scale,
e.g. `{ "stat": "avgAccuracy", "gte": 0.9, "minSamples": 3 }`).

### stickers (optional)
```jsonc
{ "id": "st-lion", "name": "Lion King", "emoji": "🦁",
  "rarity": "shiny", "collection": "Animals" }
```
`rarity` ∈ `common | rare | epic | shiny`. Grouped by `collection`.

### arcadeGames (optional)
```jsonc
{ "id": "memory", "title": "Memory Match", "desc": "Find pairs!",
  "icon": "🃏", "bg": "#EDE7FF",
  "tags": [["Memory", "#E0FFF5", "var(--color-accent-mint)"], ["2-5 min", "#F0EEF8", "var(--color-primary)"]],
  "badge": "POPULAR", "engine": "memory" }
```
`engine`: `"memory"` launches the built-in playable Memory game; `"none"` shows a
"coming soon" card. `badge` (optional) ∈ `POPULAR | NEW`.

### pet (optional)
```jsonc
{ "species": "🐉", "name": "Sparky",
  "evolutionStages": [
    { "emoji": "🥚", "label": "Egg" }, { "emoji": "🐣", "label": "Baby" },
    { "emoji": "🐲", "label": "Teen" }, { "emoji": "🐉", "label": "Adult" }
  ] }
```

### app (optional)
```jsonc
{ "title": "EduQuest", "tagline": "A learning adventure!",
  "dailyChallengeLessonId": "math-l2" }
```
`dailyChallengeLessonId` is the lesson the Home "Daily Challenge" launches
(defaults to the first lesson).

### economy (optional, per-field defaults)
```jsonc
{ "startingCoins": 200, "startingGems": 0,
  "levels": { "baseXp": 100, "stepXp": 80, "maxLevel": 50,
              "bands": [{ "minLevel": 1, "title": "Beginner" }, …] },
  "combo": [{ "minStreak": 3, "multiplier": 2 }, …],
  "streakMilestones": [7, 14, 30, 60, 100],
  "lesson": { "xpPerCorrect": 10, "perfectBonusXp": 50, "perfectBonusGems": 2 },
  "flashcard": { "baseCoins": 25, "coinsPerGotIt": 5, "baseXp": 50,
                 "xpPerGotIt": 10, "perfectBonusXp": 100, "perfectGems": 5 },
  "compete": { "placements": [{ "coins": 100, "xp": 200 }, …], "perfectGems": 5 },
  "dailySpinPrizes": [{ "coins": 50 }, { "gems": 5 }, …] }
```
XP for a level L is `baseXp + (L-1)*stepXp`. Any omitted field uses the default.

---

## Minimal valid package

```json
{
  "format": "eduquest-content",
  "formatVersion": 1,
  "meta": { "id": "mini", "name": "Mini Course", "description": "Tiny demo", "author": "me", "version": "1.0.0", "locale": "en", "cover": "✨" },
  "subjects": [
    { "id": "abc", "name": "ABCs", "description": "Letters", "icon": "fas fa-a", "emoji": "🔤", "colorClass": "english" }
  ],
  "lessons": [
    { "id": "abc-1", "subjectId": "abc", "title": "First Letters", "description": "A B C", "order": 1, "estMinutes": 5, "coinReward": 20, "gemReward": 0,
      "questions": [
        { "id": "q1", "type": "Letters", "prompt": "Which is the first letter?", "options": ["A", "B", "C"], "correctIndex": 0 }
      ] }
  ]
}
```

Everything else (economy, themes, pet, arcade, etc.) is filled with defaults.

---

## Validating a package

The app validates on load and shows errors. Programmatically:

```ts
import { validateContentPackage } from '@/content/schema'
const { ok, errors, warnings } = validateContentPackage(pkg)
```

`errors` block loading (e.g. wrong `format`, lesson with no questions, bad
`correctIndex`). `warnings` are tolerated (e.g. a lesson referencing an unknown
subject). The repo's `src/content/content.test.ts` validates both shipped packs.

---

## Tips for AI generation

- Keep `id`s unique and stable; questions reference nothing, but `subjectId`,
  `deckId`, and theme `payload`s must match real ids.
- 4 subjects, ~3–4 lessons each, 3–4 questions per lesson is a good size.
- Pick `colorClass` from the 6 palette slots; pick theme `payload`s from the 6
  real theme ids if you want shop themes to actually change colors.
- Emojis are the art system — use them for subjects, cards, avatars, stickers.
