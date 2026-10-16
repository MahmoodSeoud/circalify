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
- **Context:** The engine's `locale` and `monthLabels` options (circalify 0.1.9, eng review 2026-10-16; this supersedes the 2026-08-07 labels-config shape from eng-review decision 9A, which was never built) are the i18n hook, no framework needed. Maker strings should live in one strings object from day one so this stays a strings-file task.
- **Trigger:** A non-Danish demand signal (form submission, GitHub issue, search-traffic evidence). Norwegian and Swedish signups already exist (one company each, 2026); a Nordic reply to the Danish /aarshjul/ page or a Pro early-access signup from a .no/.se organisation is the specific trigger to add Norwegian and Swedish copy variants of the Danish page before an English one (deferred by CEO review 2026-10-16, CEO-0G-7).
- **Depends on:** Validation gate passed.

## Validation gate instrument (fake door) — context for the maker

- **What:** The gate the three items above depend on is now defined: a Danish landing page `aarshjul/index.html` on gh-pages with a priced "Circalify Pro" early-access door, GoatCounter counting and web3forms routing, 60-day window. Full plan: `docs/designs/circalify-pro-fake-door.md`.
- **Why:** The TODOS above said "validation gate passed" without a number; the design doc sets the bar (300 unique visitors, 5 percent door clicks, 5 emails, 2 conversations).
- **Context:** If the gate passes, the maker (Approach C in the design doc, a client-side Danish editor whose share button is the Pro upsell) is the free tier and reuses the page's subject lines, event names and counter. Deferred by CEO review 2026-10-16 (CEO-0G-8) because the editor was ruled out before validation.
- **Trigger:** Gate result recorded in the design doc's Review record.
- **Depends on:** The fake door shipping and the window closing.

## Hero composition variants for the Danish page

- **What:** Two or three visual variants of the /aarshjul/ hero (wheel left or right, price block placement, eyebrow weight) compared side by side with /design-shotgun.
- **Why:** The Phase 2 design review of the fake-door plan (2026-10-16) specified one hero composition from reasoning alone; mockups were skipped because the comparison loop is interactive and /autoplan cannot run it. A door that converts badly for layout reasons would read as "no demand".
- **Pros:** Cheap (CC: ~30 min); directly targets the measured block.
- **Cons:** Variants need traffic to compare, and the gate's 300 visitors cannot support an A/B; this is a pre-launch taste pass, not an experiment.
- **Context:** Design tokens and page order are fixed in docs/designs/circalify-pro-fake-door.md (Recommended Approach, page structure item 1). Start from the shipped aarshjul/index.html on gh-pages.
- **Trigger:** Before the first link post if the founder wants a second look at the hero, or after the gate if the click rate lands within two clicks of the 5 percent bar.
- **Depends on / blocked by:** The Danish page shipped on gh-pages.

