# Brief — eduquest-course-pack

- **Name:** eduquest-course-pack (project-scoped: .claude/skills/ of the edugame repo)
- **Goal/output:** generate a complete, schema-valid, playable EduQuest content
  package JSON, wire it into public/content/index.json, validate + verify it loads.
- **Trigger:** user asks to create/generate/author a NEW course pack / content
  pack / lessons-as-a-pack for a grade/subject/language in this repo.
- **Not-trigger:** editing the format/schema code (src/content/schema.ts); user
  progress/state questions; general app feature work.
- **Type:** guidance (flexible — domain authoring). No scripts, no MCP; uses
  Read/Write/Edit/Bash that the host session already has.
- **SDLC phase:** authoring/content-generation.
- **Decompose? gate:** considered — kept unified. "Author + wire + validate" is one
  coherent task; splitting validate/wire into separate skills would fragment a
  single short procedure. No split.
- **Grounding:** authoritative in-repo sources (CONTENT_FORMAT.md,
  src/content/schema.ts, core.package.json, space.json) are referenced rather than
  duplicated to avoid drift; a compact cheat-sheet is embedded for standalone use.
- **Composition:** downstream may use `verify` / `run` / chrome-devtools MCP to
  confirm the pack loads.
