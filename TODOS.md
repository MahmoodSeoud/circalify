# TODOS

Deferred work with context. Added by /plan-eng-review 2026-08-07.

## Port the remaining 7 templates to Danish JSON

- **What:** Convert the other 7 English, 2025-anchored templates to the new Danish template JSON format.
- **Why:** v1 ships 2-3 Danish templates (eng-review decision 8A); the other 7 are proven designs worth adding when the gallery needs depth.
- **Context:** Source files live in the gh-pages branch at `templates/circalify-templates.zip` (English labels, `startYear: 2025`, events fed via five sequential `setData` calls). The template format + loader built for v1 defines the target shape; each port is ~30 min with the pipeline in place.
- **Trigger:** First organic user request for more templates, or the 10+ organic-conversion band hitting.
- **Depends on:** Template format + loader shipped; validation gate passed.

## English language toggle for the maker

- **What:** English UI option — maker strings, panel labels config, 1-2 English templates.
- **Why:** Danish-only v1 is a deliberate constraint; English unlocks the non-Nordic long tail if the wedge works.
- **Context:** The engine's labels config (eng-review decision 9A) is the i18n hook — no framework needed. Maker strings should live in one strings object from day one so this stays a strings-file task.
- **Trigger:** A non-Danish demand signal (form submission, GitHub issue, search-traffic evidence).
- **Depends on:** Validation gate passed.

## Center-hub idle label (year + org name)

- **What:** Render year + org name in the wheel center when idle, hidden while hover info shows.
- **Why:** Cut from v1 (eng-review decision 11A — hover-collision surgery, no validation value), but it makes exported/printed wheels self-describing, which matters for wheels hung on a wall.
- **Context:** `title` config is deleted from `config-parser.js` in v1; this returns as a new deliberate feature (e.g. `centerLabel`), not a resurrection. Touches `_showCenterInfo`'s hover path (`circalify-core.js:1775`) — needs idle/hover state management.
- **Trigger:** Validation passed and a user comment that exports lack identification.
- **Depends on:** Validation gate passed.
