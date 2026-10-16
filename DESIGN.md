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
    fontFamily: Familjen Grotesk
    fontWeight: 600
    fontSize: clamp(1.75rem, 4vw, 2.5rem)
    letterSpacing: -0.01em
  body:
    fontFamily: Hanken Grotesk
    fontSize: 1rem
    lineHeight: 1.6
  label:
    fontFamily: Hanken Grotesk
    fontWeight: 600
    fontSize: 0.875rem
    letterSpacing: 0.04em
  price:
    fontFamily: Familjen Grotesk
    fontWeight: 600
    fontSize: 2rem
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

**Familjen Grotesk** (Google Fonts, OFL, Stockholm studio Familjen) is the display voice: headings and the price, weight 600, tight tracking, sentence case. **Hanken Grotesk** (Google Fonts, OFL) carries body, UI and the wheel's labels at 400, 500 and 700. Both cover æ ø å. Load with one request: `https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;600&family=Hanken+Grotesk:wght@400;500;700&display=swap`.
Atkinson Hyperlegible Next was considered for legibility and rejected: its only zero is slashed, which a Danish reader takes for Ø ("3.490" reads "3.49Ø"). Prices use tabular figures. Body text is never below 16px; headings sit at least two steps above body.
On the wheel, set the engine's `fontFamily` to `'Hanken Grotesk', sans-serif` and label sizes in SVG units (about 30 for events at a 430px wheel); see CONFIGURATION.md.

## Layout

Single column below 768px; two columns (text and offer card left, wheel right) at 768px and up; max content width 1100px with a 16px side gutter. Sections are separated by a 1px `border` rule, not boxes. The offer card groups price and the single primary button (approved 2026-10-16 in /design-shotgun) and must stay above the fold on a 375x812 phone and a 1440x900 laptop. Lower sections align to the hero's left edge with a 640px text measure.

## Elevation & Depth

Flat. Depth comes from the surface tone (`surface` on `background`) and 1-1.5px borders, never glows. Small offset shadows tinted with the slate text colour are allowed on the English page's cards; no zero-offset halos. The only raised-looking thing is the wheel itself. Code editors and code blocks sit on slate (#1F2A2E, panels #2B373B, text #DCE0D9).

## Shapes

One radius, 6px (`rounded.md`), for buttons, inputs, poll buttons and the offer card; 4px for small tags. No pills. Nothing is nested inside a card; the offer card holds content, not other cards.

## Components

- **Primary button:** pine fill, white 18px semibold label, min height 48px, full width inside the offer card. Hover darkens to `primary-hover`; focus-visible draws a 2px pine outline offset 2px; disabled drops to 60 percent opacity with the label "Sender...". One per view.
- **Secondary button / poll button:** surface fill, 2px `border`, slate label, min height 44px; hover turns border and label pine.
- **Input:** surface fill, 2px `border`, 48px tall, visible label above (never placeholder-only); focus turns the border pine.
- **Offer card:** surface fill, 1.5px `border-strong`, 6px radius, no shadow; holds the price block, the button (or the signup panel after the click) and the "Til bestyrelsen" lines under a 1px rule.
- **Status lines:** success in slate semibold; errors in `error` with a mailto fallback; both `aria-live="polite"`.
- **Hidden state:** a global `[hidden] { display: none !important; }` rule, because component display rules otherwise override the attribute.

## Do's and Don'ts

- Do keep exactly one pine filled button per view.
- Do use the six wheel colours, in this order, for a wheel's events before inventing new ones.
- Do check zero, æ, ø and å in any new face before adopting it.
- Do keep the fog ground; use `surface` for anything that holds input.
- Don't use pure white (#FFFFFF) as a page background or black (#000000) for text.
- Don't bring back orange, gradients, glows, pill buttons or drop-shadowed cards.
- Don't decorate sections with icons in tiles or stock photos; the wheel is the picture.
- Don't put a kicker label above headings beyond the existing "Circalify Pro" eyebrow on the door page.
- Don't address Danish readers as "I" or "jeres"; write impersonally or in the imperative.

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
