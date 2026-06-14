---
name: eduquest-course-pack
description: >-
  Use when the user wants to create, generate, or author a NEW EduQuest course
  content package (a "course pack" / "content pack" / "lesson pack") for this
  repo — phrases like "make a course pack for grade 5 math", "generate a Spanish
  course package", "build a content pack for <subject/grade/language>", "convert
  this curriculum into an EduQuest pack", or "add a new course to the app".
  Produces a complete, schema-valid, playable package JSON, wires it into
  public/content/index.json, and validates it. Do NOT use for editing the package
  FORMAT/schema itself (that's src/content/schema.ts code work), for questions
  about user progress/state (that is per-user state, not package content), or for
  general app feature work.
---

# Authoring an EduQuest course pack

A **content package** is one JSON file that supplies *all* course content the app
renders — subjects, lessons, flashcards, shop, themes, achievements, stickers,
arcade games, the study pet, branding, and the reward economy. Swap the package
and you get a different course with **no code changes**. Your job in this skill is
to produce one such JSON file, wire it in, and verify it loads.

## Authoritative sources (read these first)

These live in the repo and are the source of truth. Read them before generating —
do not author from this cheat-sheet alone if anything is unclear:

- `CONTENT_FORMAT.md` — the full human/AI authoring guide (every section, examples, tips).
- `src/content/schema.ts` — the canonical TypeScript schema + `validateContentPackage()` + `normalizeContentPackage()` (the defaults logic).
- `src/content/core.package.json` — the complete, real reference package (lớp 4 VN course).
- `public/content/space.json` — a smaller second example.

If the schema and this file ever disagree, **the schema wins** — re-read it.

## Workflow

Follow these steps in order. This is flexible guidance — adapt content to the
request, but do not skip validation or wiring.

1. **Gather requirements.** Establish: language/`locale`, target grade or age,
   the subjects to cover, how many lessons per subject, questions per lesson, and
   whether to include the optional richness (decks, shop, themes, achievements,
   stickers, pet, custom economy/branding). If the user was vague, pick sensible
   defaults (4 subjects, 3–4 lessons each, 4 questions each) and state them.
2. **Read the authoritative sources** above for the exact field shapes.
3. **Author the package** (see cheat-sheet + rules below). Write it to
   `public/content/<id>.json` where `<id>` matches `meta.id`.
4. **Register it** in `public/content/index.json` (see Wiring).
5. **Validate** (see Validation). Fix every error before claiming done.
6. **Verify it loads** end-to-end (see Verification).

## Top-level shape

Only `format`, `formatVersion`, `meta`, `subjects`, and `lessons` are required.
Everything else gets sensible defaults via `normalizeContentPackage`, so a small
"subjects + lessons" pack is fully playable.

```jsonc
{
  "format": "eduquest-content",   // REQUIRED — must be exactly this string
  "formatVersion": 1,             // REQUIRED — number
  "meta": { ... },                // REQUIRED
  "subjects": [ ... ],            // REQUIRED — >= 1 (provide 4 for best layout)
  "lessons": [ ... ],             // REQUIRED — >= 1
  "app": { ... },                 // optional — branding + daily challenge
  "economy": { ... },             // optional — per-field defaults applied
  "defaultProfile": { ... },      // optional — new-player profile
  "decks": [ ... ],               // optional — flashcards
  "shopItems": [ ... ],           // optional
  "themes": [ ... ],              // optional — a default is injected if omitted
  "achievements": [ ... ],        // optional — declarative criteria
  "stickers": [ ... ],            // optional
  "arcadeGames": [ ... ],         // optional — Memory Match injected if omitted
  "pet": { ... }                  // optional
}
```

## Field cheat-sheet

Enums are exact — wrong values fail validation or silently fall back.

- **meta** (required): `{ id, name, description, author, version, locale, cover, createdAt? }`.
  `id` must be unique (it is the pack key + filename). `cover` is an emoji for the picker.
- **subjects[]** (required): `{ id, name, description, icon, emoji, colorClass }`.
  - `icon` = a Font Awesome 6 class (e.g. `"fas fa-calculator"`).
  - `colorClass` ∈ `english`(purple) · `math`(red) · `science`(cyan) · `art`(orange) · `music`(pink) · `coding`(blue). It is just a palette slot — pick any color; it need not match the subject's meaning.
  - Home shows the first 4 subjects (2×2); Adventure Map shows the first 6. Prefer 4.
- **lessons[]** (required): `{ id, subjectId, title, description, order, estMinutes, coinReward, gemReward, questions[] }`.
  - `subjectId` MUST match a `subjects[].id`.
  - `order` controls position in the path (sorted ascending).
  - **questions[]**: `{ id, type, prompt, options[], correctIndex, hint? }`. `type` is a free-text tag (e.g. `"Addition"`). 2–4 `options`; `correctIndex` is 0-based and must be in range.
- **decks[]** (optional): `{ id, subject, title, description, iconEmoji, difficulty, cards[] }`.
  - `subject` MUST match a subject id. `difficulty` ∈ `Easy | Medium | Hard`.
  - **cards[]**: `{ id, deckId, frontEmoji, frontText, backContent, backDetails }`. `deckId` MUST match the deck's `id`. Cards use SM-2 spaced repetition.
- **shopItems[]** (optional): `{ id, category, name, preview, price, currency, rarity?, payload? }`.
  - `category` ∈ `avatars | themes | pets | powerups`. `currency` ∈ `coins | gems`. `rarity` ∈ `common | new | hot | rare`.
  - `payload`: for **avatars/pets** the emoji to equip; for **themes** the theme `id` to apply (must match a `themes[].id`); for **power-ups** a tag string (`freeze | hint | double | heart`).
- **themes[]** (optional): `{ id, name, emoji, description, swatch[] }`. `id` `""` is the built-in default. Theme ids with real CSS palettes: `"" | ocean | forest | sunset | candy | midnight`. Custom ids show their swatch but fall back to the default palette in-app.
- **achievements[]** (optional, declarative): `{ id, name, emoji, description, criteria }`.
  - `criteria` = `{ stat, gte, minSamples? }`. `stat` ∈ `lessonsCompleted | streak | competeWins | coins | xp | ownedItems | threeStarLessons | perfectLessons | masteredCards | avgAccuracy`. Earned when stat `>= gte`. `avgAccuracy` is 0–1 and needs `minSamples` (e.g. `{ "stat": "avgAccuracy", "gte": 0.9, "minSamples": 3 }`).
- **stickers[]** (optional): `{ id, name, emoji, rarity, collection }`. `rarity` ∈ `common | rare | epic | shiny`. Grouped by `collection`.
- **arcadeGames[]** (optional): `{ id, title, desc, icon, bg, tags, badge?, engine }`. `engine` `"memory"` launches the built-in playable game; `"none"` = coming-soon card. `badge` ∈ `POPULAR | NEW`. `tags` = array of `[label, bgColor, textColor]` triples.
- **pet** (optional): `{ species, name, evolutionStages[] }` where each stage is `{ emoji, label }` (index = stage, typically 4 stages).
- **app** (optional): `{ title, tagline, dailyChallengeLessonId, dailyChallenge? }`. `dailyChallengeLessonId` should match a lesson id (defaults to the first lesson); `dailyChallenge` card copy is derived from that lesson if omitted.
- **economy** (optional, per-field defaults): `startingCoins`, `startingGems`, `levels{baseXp,stepXp,maxLevel,bands[]}`, `combo[]`, `streakMilestones[]`, `lesson{...}`, `flashcard{...}`, `compete{...}`, `dailySpinPrizes[]`. Any omitted field uses `DEFAULT_ECONOMY` from `schema.ts`. Level-L XP threshold = `baseXp + (L-1)*stepXp`.

## Wiring (make the pack selectable in the app)

The built-in `core` pack is bundled and auto-synced (`scripts/sync-content.mjs`
copies `src/content/core.package.json` → `public/content/core.json` on
predev/prebuild — do not hand-edit `core.json`). A **new** pack is a static-folder
pack:

1. Write the package to `public/content/<id>.json`.
2. Add an entry to the `packages` array in `public/content/index.json`:
   ```jsonc
   { "id": "<id>", "name": "<display name>", "description": "<short>", "cover": "<emoji>", "file": "<id>.json" }
   ```
   The manifest file itself is `{ "format": "eduquest-manifest", "packages": [ ... ] }`. `id` must match `meta.id`; `file` is the filename in `public/content/`.

Users then pick it under **Settings → Course Pack**, which fetches the file and
caches it as the active package in `localStorage` (`eduquest.content`).

## Validation

`validateContentPackage()` in `src/content/schema.ts` is the gate the app uses on
load. Reproduce its checks — these are hard **errors** that block loading:

- `format` === `"eduquest-content"`; `formatVersion` is a number.
- `meta.id` and `meta.name` are non-empty strings.
- `subjects` is a non-empty array; `lessons` is a non-empty array.
- every lesson has ≥1 question; every question has ≥2 `options`; every `correctIndex` is `0 ≤ i < options.length`.

These are **warnings** (tolerated, but fix them): a lesson whose `subjectId` is
not a known subject; a deck with no cards.

Run the checks. Two good options:

- **Fast structural check:** `node -e "JSON.parse(require('fs').readFileSync('public/content/<id>.json','utf8'))"` to confirm valid JSON, then manually confirm every rule above and every referential link (`subjectId`, `deckId`, theme `payload` → `themes[].id`, `app.dailyChallengeLessonId` → a lesson id).
- **Run the suite:** `npm test`. To get the real validator over your new pack, temporarily add it to `src/content/content.test.ts` (it already imports `validateContentPackage` and reads shipped packs) and assert `validateContentPackage(pkg).ok === true`, then run `npm test`.

## Verification (prove it actually loads)

Don't claim done on validation alone. Start the app and load the pack:

1. `npm run dev` (this also runs the content sync).
2. Open the app → **Settings → Course Pack** → select your pack → confirm it
   activates, Home shows your subjects, and a lesson plays through. (The
   `verify` / `run` skills and chrome-devtools MCP can drive this if available.)

## Common pitfalls

- Mismatched ids: `lesson.subjectId`, `deck.subject`, `card.deckId`, shop theme
  `payload`, and `app.dailyChallengeLessonId` must reference ids that exist.
- Wrong `format` string or non-numeric `formatVersion` → load is rejected.
- `correctIndex` off-by-one or out of range → validation error.
- Inventing `colorClass` / `rarity` / `category` / `difficulty` values outside the
  enums → fallback or failure. Stick to the listed sets.
- Editing `public/content/core.json` directly — it is regenerated from
  `src/content/core.package.json`. Edit the source, or ship a new pack.
- Emojis are the entire art system — use them for subjects, cards, avatars,
  stickers, pet. No image assets.

## Minimal valid package (smallest thing that loads)

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

Everything else (economy, themes, pet, arcade…) is filled by defaults. For a rich,
production-quality pack, mirror the structure and breadth of
`src/content/core.package.json`.
