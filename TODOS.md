# TODOS

Deferred work with context. Added by /plan-eng-review 2026-08-07.

## Port the remaining 7 templates to Danish JSON

- **What:** Convert the other 7 English, 2025-anchored templates to the new Danish template JSON format.
- **Why:** v1 ships 2-3 Danish templates (eng-review decision 8A); the other 7 are proven designs worth adding when the gallery needs depth.
- **Context:** Source files live in the gh-pages branch at `templates/circalify-templates.zip` (English labels, `startYear: 2025`, events fed via five sequential `setData` calls). The template format + loader built for v1 defines the target shape; each port is ~30 min with the pipeline in place.
- **Trigger:** First organic user request for more templates, or the 10+ organic-conversion band hitting.
- **Depends on:** Template format + loader shipped; the done-for-you test passing (see the validation gate entry below).

## English language toggle for the maker

- **What:** English UI option — maker strings, panel labels config, 1-2 English templates.
- **Why:** Danish-only v1 is a deliberate constraint; English unlocks the non-Nordic long tail if the wedge works.
- **Context:** The engine's `locale` and `monthLabels` options (circalify 0.1.9, eng review 2026-10-16; this supersedes the 2026-08-07 labels-config shape from eng-review decision 9A, which was never built) are the i18n hook, no framework needed. Maker strings should live in one strings object from day one so this stays a strings-file task.
- **Trigger:** A non-Danish demand signal (form submission, GitHub issue, search-traffic evidence). Norwegian and Swedish signups already exist (one company each, 2026); a Nordic reply to the Danish /aarshjul/ page or a done-for-you order from a .no/.se organisation is the specific trigger to add Norwegian and Swedish copy variants of the Danish page before an English one (deferred by CEO review 2026-10-16, CEO-0G-7).
- **Depends on:** The done-for-you test passing (see the validation gate entry below).

## Validation gate: done-for-you wheel test (replaces the fake door)

- **What:** The gate the items above depend on is now the 1.500 kr. done-for-you test in `docs/designs/circalify-done-for-you-wheels.md`: 10 in-segment offers to municipal MED committees, phone follow-up, pass at 2 or more written orders read on 2026-11-27 (one extension to 15 offers on exactly 1 order; meeting-bound leads get a late read on 2026-12-18).
- **Why:** The 349 kr./md. fake door (`docs/designs/circalify-pro-fake-door.md`) was retired on 2026-10-30. Circlio and Yearspan ship free Danish aarshjul editors, so a priced door for an unbuilt editor could not be read.
- **Context:** On a pass, the next step is /office-hours on Approach B (plan-to-wheel intake plus a yearly update price) or C (municipal MED package); the maker in TODOS items above is not built before 3 paid wheels show a repeat need (premise 5).
- **Trigger:** The final read recorded in the design doc's Review record.
- **Depends on:** The /aarshjul/ page change (T1, patch in `docs/designs/patches/`) live on gh-pages, and the calls.

## Hero composition variants for the Danish page

- **What:** Two or three visual variants of the /aarshjul/ hero (wheel left or right, price block placement, eyebrow weight) compared side by side with /design-shotgun.
- **Why:** The Phase 2 design review of the fake-door plan (2026-10-16) specified one hero composition from reasoning alone. The door it was meant to tune was retired on 2026-10-30; the hero now carries the done-for-you offer card.
- **Pros:** Cheap (CC: ~30 min); directly targets the measured block.
- **Cons:** Variants need traffic to compare, and the gate's 300 visitors cannot support an A/B; this is a pre-launch taste pass, not an experiment.
- **Context:** Design tokens and page order are fixed in docs/designs/circalify-pro-fake-door.md (Recommended Approach, page structure item 1). Start from the shipped aarshjul/index.html on gh-pages.
- **Trigger:** Only if the done-for-you test passes and /aarshjul/ starts getting real traffic; the service test is driven by calls, not the page.
- **Depends on / blocked by:** The Danish page shipped on gh-pages.


## Poll buttons show no chosen answer (QA ISSUE-002, Low, UX)

- **What:** After a visitor answers "Hvor laver foreningen årshjulet i dag?", mark the chosen button (aria-pressed="true" plus a selected style) and show the others as inactive.
- **Why:** Later clicks are ignored correctly (no double counting), but all six buttons still look clickable, so a second click seems to do nothing.
- **Repro:** /aarshjul/, click Excel, then click Canva: the thank-you line stays "Tak for svaret: Excel." and no button looks selected.
- **Context:** Found by /qa on 2026-10-17 (report: ../circalify-gh-pages/.gstack/qa-reports/qa-report-localhost-2026-10-17.md). The poll handler is in the inline script of aarshjul/index.html on gh-pages.
- **Effort:** human S / CC S. **Priority:** P3.

## Declare a favicon on the Pro pages (QA ISSUE-003, Low, visual)

- **What:** Add a link rel="icon" (for example a small SVG wheel in the six wheel colours) to index.html and aarshjul/index.html on gh-pages.
- **Why:** Neither page declares an icon, so tabs and bookmarks show a generic icon and browsers request /favicon.ico, which the project site does not serve.
- **Context:** Found by /qa on 2026-10-17. Needs a small asset that follows DESIGN.md (no orange); the check-pages relative-targets rule will verify the path.
- **Effort:** human S / CC S. **Priority:** P3.
