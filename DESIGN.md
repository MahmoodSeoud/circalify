---
# gstack: design-md-format=spec
name: Circalify
description: Gråvejrsalmanak. A calm Nordic almanac on an overcast day, muted but clear colours, a tidy forening binder rather than a SaaS dashboard.
colors:
  background: "#E4E7E1"
  surface: "#F2F3EE"
  surface-sunk: "#DCE0D9"
  border: "#CBD1C8"
  border-strong: "#B9C1B6"
  text: "#1F2A2E"
  text-muted: "#5B6668"
  primary: "#2D5A4A"
  primary-hover: "#24493C"
  on-primary: "#FFFFFF"
  wheel-raps: "#E9D27A"
  wheel-boegeloev: "#B9D29A"
  wheel-hav: "#A9CBD6"
  wheel-lyng: "#C9B3D6"
  wheel-roennebaer: "#EDB49A"
  wheel-rug: "#D9C7A8"
  wheel-empty: "#F2F3EE"
  success: "#2D5A4A"
  error: "#A3362A"
typography:
  display:
    fontFamily: Source Serif 4
    fontWeight: 600
    fontSize: clamp(2rem, 5vw, 3.5rem)
    lineHeight: 1.1
    letterSpacing: -0.005em
  body:
    fontFamily: Source Sans 3
    fontSize: 1.0625rem
    lineHeight: 1.6
  heading:
    fontFamily: Source Serif 4
    fontWeight: 600
    fontSize: 1.75rem
  price:
    fontFamily: Source Serif 4
    fontWeight: 600
    fontSize: 1.75rem
    fontFeature: tnum
rounded:
  sm: 4px
  md: 6px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
  offer-card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.md}"
---

# Circalify

## Overview

**Creative North Star:** Gråvejrsalmanak, a grey-weather almanac: the calm of an overcast Danish day, so a forening chairman thinks "this is the tidy, trustworthy way to run our year."
**Product context:** Circalify draws årshjul. The MIT library serves developers; Circalify Pro (a hosted no-code editor, 349 kr./md. per organisation, viewers free) is being validated with Danish forening chairmen, board volunteers, schools and municipal teams. Peers: Plandisc (incumbent, navy and corporate blue), Conventus (forening admin, green and orange).
**Mode per surface:** Danish landing page /aarshjul/: Persuade. English developer page: Persuade, with an Operate playground (its code editor and code blocks use the slate code surfaces). Future editor: Operate.
**Reference sites:** plandisc.com, conventus.dk, pleo.io/da, linear.app (screenshots 2026-10-16).
**Key characteristics:**
- Fog-grey ground, never pure white: no glare on screens, clean on projectors and paper.
- The wheel's farming-year colours carry the identity; pine green only marks actions.
- Slate text, not black; quiet type with one warm Nordic display face.
- Nothing shouts except the one action button.

## Colors

**Strategy:** Restrained chrome, full wheel. Neutrals are green-tinted greys derived from the fog ground; pine (`primary`) is the only interactive colour and appears once per view as a filled button. The brand's colour lives in the wheel palette, named after the Danish year (raps, bøgeløv, hav, lyng, rønnebær, rug). Every customer's wheel uses it by default, so every shared wheel looks like Circalify.
**Light or dark:** Light, chosen from the use scene: chairmen on a phone in the evening, board meetings on a projector in a lit room, wheels printed for the binder. Projectors wash dark pages out and dark wheels waste toner. The fog ground removes the harsh white glare the founder disliked. A dark theme is not part of this system.
Contrast (WCAG, measured): text on background 11.8:1, text on surface 13.2:1, muted on background 4.7:1, muted on surface 5.3:1, white on primary 7.9:1, slate labels on every wheel colour 7.6:1 or better. `wheel-empty` marks months without events. No orange anywhere: it read as the old developer page and sits next to Conventus's logo.

## Typography

**Source Serif 4** (Google Fonts, OFL, Adobe) is the display voice: headings and the price, weight 600, upright, sentence case, near-normal tracking. It reads as a printed almanac rather than a startup page. **Source Sans 3** (Google Fonts, OFL, Adobe, the same family's sans) carries body and UI at 400 and 500; 600 and 700 are for the wheel's labels only. Both have an open zero and cover æ ø å. Load with one request: `https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600&family=Source+Sans+3:wght@400;500;600;700&display=swap`; the serif's optical-size axis keeps the 56px headline and the 28px price both crisp. Familjen Grotesk and Hanken Grotesk were used until 2026-10-17 and dropped because the pair read as a generated startup page.
Atkinson Hyperlegible Next was considered for legibility and rejected: its only zero is slashed, which a Danish reader takes for Ø ("3.490" reads "3.49Ø"). Prices use tabular figures.

Three sizes, set as tokens on `:root`: `--size-l` (the h1, clamp(2rem, 5vw, 3.5rem): 32px on a phone, 56px at 1440, line height 1.1, tracking -0.005em), `--size-m` (section headings and the price, 1.75rem) and `--size-s` (everything else, 1.0625rem, so 17px for Source Sans 3's small x-height: body, labels, buttons, captions, footer). The English page adds `--size-code` (0.875rem) for monospace and the editor's chrome only. Hierarchy comes from size and colour (`text` against `muted`), not from weight: body and UI stay at 500 or below outside the wheel, `strong` is 500, and the serif display is 600 because it reads thin at 500. No uppercase, no letter-spaced labels. (Adopted 2026-10-17 from the "AI tells" in YC's design review of Paper.) The h1 sets `text-wrap: balance` (even lines, no one-word last line, at every width) and a measure chosen per copy so it takes two lines at desktop: 760px for the Danish headline, 700px for the English one. Re-check the break whenever the headline copy changes. A number and its unit never split across lines: join them with a non-breaking space (`349&nbsp;kr.`, `10&nbsp;måneder`).
On the wheel, set the engine's `fontFamily` to `'Source Sans 3', sans-serif` and label sizes in SVG units (about 30 for events at a 430px wheel); see CONFIGURATION.md.

## Layout

Max content width 1100px with a 16px side gutter. **Danish hero (the calm cover), 900px and up:** a two-column grid: the h1 (48px, one line), the support line and the offer card (440px) on the left; the whole example wheel (up to 580px, all twelve months visible, never cropped) on the right, vertically centred against them. **Below 900px:** one column in the order h1, support, offer card, whole wheel. The offer card ends above the fold on 375x812 and 1440x900. The English page keeps the almanac spread (h1 across the top, card and 520px wheel level below) until it gets the same pass. On the Danish page sections are separated by space (96px), not rules or boxes; the English page still uses a 1px `border` rule. The offer card groups price and the single primary button (approved 2026-10-16 in /design-shotgun) and must stay above the fold on a 375x812 phone and a 1440x900 laptop. Lower sections align to the hero's left edge with a 640px text measure.

## Elevation & Depth

Flat. Depth comes from the surface tone (`surface` on `background`) and 1-1.5px borders, never glows. Small offset shadows tinted with the slate text colour are allowed on the English page's cards; no zero-offset halos. The only raised-looking thing is the wheel itself. Code editors and code blocks sit on slate (#1F2A2E, panels #2B373B, text #DCE0D9).

## Shapes

One radius, 6px (`rounded.md`), for buttons, inputs, poll buttons and the offer card; 4px for small tags. No pills. Nothing is nested inside a card; the offer card holds content, not other cards.

## Components

- **Wheel:** labels in Source Sans 3: centre title 700, event labels 600, month names 500. One event label size, 30 units on the engine's 1000-unit viewBox, shrinking only when a label does not fit its segment (never growing to fill a big one). Events take the six wheel colours in order; empty months are `surface`; the month ring is `background`; ring separators are `border`, never the engine's default cool grey (#e5e7eb). A static wheel carries no filter, shadow or glow. The viewBox is cropped to the wheel's outer ring so the drawn wheel fills its box and its top edge aligns with whatever sits beside it. Label cap and separator colour are not engine options yet (`src/circalify-core.js` hardcodes the stroke); until they are, the pages may not fully match this rule.
- **Primary button:** pine fill, white 16px medium (500) label, min height 48px, full width inside the offer card. Hover darkens to `primary-hover`; focus-visible draws a 2px pine outline offset 2px; disabled drops to 60 percent opacity with the label "Sender...". One per view.
- **Secondary button / poll button:** surface fill, 2px `border`, slate label, min height 44px; hover turns border and label pine.
- **Input:** surface fill, 2px `border`, 48px tall, visible label above (never placeholder-only); focus turns the border pine.
- **Offer card:** surface fill, 1.5px `border-strong`, 6px radius, no shadow; holds the price block, the button (or the signup panel after the click) and the "Til bestyrelsen" lines under a 1px rule.
- **Status lines:** success in slate at 500; errors in `error` with a mailto fallback; both `aria-live="polite"`.
- **Hidden state:** a global `[hidden] { display: none !important; }` rule, because component display rules otherwise override the attribute.

## Do's and Don'ts

- Do keep exactly one pine filled button per view.
- Do use the six wheel colours, in this order, for a wheel's events before inventing new ones.
- Do check zero, æ, ø and å in any new face before adopting it.
- Do keep the fog ground; use `surface` for anything that holds input.
- Don't use pure white (#FFFFFF) as a page background or black (#000000) for text.
- Don't bring back orange, gradients, glows, pill buttons or drop-shadowed cards.
- Don't decorate sections with icons in tiles or stock photos; the wheel is the picture.
- Don't put a kicker label above headings. The product name "Circalify Pro" is the first line inside the offer card, in muted 16px.
- Don't add badges, pills or trust rows ("MIT licensed", star counts) or icon card grids; say it in a sentence or a plain list.
- Don't centre sections. Headings, lists and code align to the hero's left edge; only the wheel's caption is centred.
- Don't use em dashes or Title Case in copy; headings are sentence case.
- Don't let a number wrap away from its unit (kr., md., måneder); use `&nbsp;`.
- Don't address Danish readers as "I" or "jeres"; write to one person ("du", "din forening") or in the imperative, the way Danish forening tools do (Conventus, ForeningLet, Plandisc). Check new Danish copy against how those sites phrase the same idea: "overblik", "ét sted", "spar tid", "frivillige".

## Motion

- **Approach:** minimal-functional.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **The one authored moment:** the example wheel draws in once over 600ms on first render, only under `prefers-reduced-motion: no-preference`.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-16 | Initial design system created | /design-consultation from the Pro fake-door brief, research on plandisc.com, conventus.dk, pleo.io/da and linear.app, and one independent Claude subagent proposal (Gråvejrsalmanak); founder: "calm and Nordic" |
| 2026-10-16 | Hanken Grotesk replaces Atkinson Hyperlegible Next for body | Atkinson's only zero is slashed and reads as Ø in Danish prices |
| 2026-10-16 | "Til bestyrelsen" lines added to the offer card | Helps the chairman get the board's approval; new copy on the measured block, so read the gate with it in mind |
| 2026-10-16 | Deferred: a "nu" hand on the wheel pointing at today | Needs an engine feature; revisit for the editor |
| 2026-10-16 | Danish copy avoids the plural address "I/jeres" | The founder: addressing readers as "I" is unusual in Danish marketing; use impersonal phrasing or the imperative, and "du" only in one-to-one lines from Mahmood |
| 2026-10-16 | English page moved onto this system; its dark mode and toggle removed | One light system per DESIGN.md; also removes the only localStorage write on the site |
| 2026-10-17 | Three type sizes, weights at 500 or below, no kicker, badges, icon cards or centred sections | Founder asked to apply YC's Paper design review ("AI tells"); both pages cleaned the same day |
| 2026-10-17 | Hero becomes the almanac spread (h1 across, card and 520px wheel level below); --size-l to clamp(2rem, 5vw, 3.5rem); wheel rules written down; mobile order and fold rule; number and unit joined with &nbsp; | /design-consultation in Paper (Scratchpad file, page "Circalify Pro"): current, B "almanac spread", C "wheel first" and a 375 frame compared side by side; founder picked B. Live checks found event labels varying 27.5 to 36, separators in Tailwind grey #e5e7eb, Hanken 600 not loaded, and "3.490 / kr." splitting at 375 |
| 2026-10-17 | Source Serif 4 (display, 600) and Source Sans 3 (body, 17px) replace Familjen Grotesk and Hanken Grotesk; page copy edited for AI patterns | Founder: "the font and the text itself look very AI". Four pairings rendered live with the real headline, prices and æ ø å (all with open zeros); founder picked the almanac serif. Copy: repeated "del det med et link" removed from the support line, passive and vague lines made direct, an invented "monthly showcases" promise replaced with the occasional email the form already states |
| 2026-10-17 | Headlines are plain what-and-who ("Årshjul til foreninger", "Year wheels for associations") and the support line names the old way it replaces | Founder asked for YC-style copy after rejecting translated-English and adjective headlines. Changed during the door test: read door metrics before and after 2026-10-17 |
| 2026-10-17 | Danish hero becomes the almanac cover: an 88px serif title and a large example wheel cropped at the right edge; the "Hvem bruger et årshjul?" use-case list is removed; section rules replaced by space | /frontend-design pass; founder picked A ("the almanac cover") over a live demo and a tidy-up. Reverses CEO plan item CEO-HOLD-1 (keep the use cases). The template form stays because it is the gate's free-intent baseline (CEO-HOLD-2) |
| 2026-10-17 | Almanac cover reverted the same day; Danish hero becomes the calm cover (48px one-line h1, card left, whole 580px wheel right). Danish copy rewritten in the register of Danish forening tools | Founder: "you ruined it". The cropped wheel cut the product's point (all twelve months) and the 88px title shouted. Frame D was mocked in Paper and approved before code. Copy method from the founder: read Danish sites in the space and copy their language type |
