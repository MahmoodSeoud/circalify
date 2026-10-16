# Changelog

## 0.1.11

### Fixed
- `centerLabel` no longer overlaps the hover info: the title hides while an event's details use the center and returns when they clear.
- A long `centerLabel` keeps a readable size (at least 18 SVG units) and is shortened with "..." instead of shrinking to a few pixels.
- `locale` accepts BCP-47 tags in any case: `'da-DK'`, `'DA'` and `'en-US'` no longer stop the wheel from rendering.
- The month sidebar, the month buttons and the detail panel follow `locale`: full month names, day names and every label ("VIEW AGENDA" / "SE AGENDA", "Save" / "Gem", "No events this month" / "Ingen aktiviteter i denne måned", "Untitled event" / "Uden titel"). Sidebar event dates use the ring's month labels, so a custom `monthLabels` applies there too. Before, the sidebar was always Danish and the buttons and detail panel always English, whatever the locale.

### Docs
- The README CDN example pins a version instead of `@latest`, with a note that `@latest` picks up rendering changes as soon as they are published.
- README browser support now states the real minimum (Chrome/Edge 94, Firefox 93, Safari 16.4): the engine has used class static blocks since 0.1.10, so the old Chrome 61 / Safari 11 floor was already wrong.

### Changed
- Removed dead code: the unused `_wrapTextToLines` helper, the unused `ELLIPSIS_WIDTH_CHARS` constant and fallback defaults that repeated constants.js.

### Tests
- New tests for the month-button gate, the parser-to-ring month labels, the center title (lines, floor, hide on hover), radial label fallbacks and more validation errors.

## 0.1.10

### Added
- `centerLabel` option: a title in the center circle, with an optional smaller second line after `\n`, sized to fit. `centerLabelColor` sets its color.
- Radial event labels can break a long compound word onto two lines at a soft hyphen (`\u00AD`), e.g. `'General\u00ADforsamling'`. Curved labels drop the soft hyphen.

### Changed
- Radial event labels are sized on the right axes: their length fits the ring's thickness and their height fits the arc's width. Labels keep their full text at the largest font that fits, wrap onto two lines when that is larger, and truncate only when nothing else fits. Before, a long label on a thick ring was cut short while the ring had room for it.
- Event labels no longer have a drop shadow.

### Fixed
- `BaseRing` imports its constants instead of reading `window.CIRCALIFY_CONSTANTS`, so rings built outside a browser get the real dimensions instead of incomplete fallbacks.

## 0.1.9

### Added
- `locale` option (`'en'` or `'da'`, default `'en'`) for the calendar ring's month labels. `'da'` gives Jan, Feb, Mar, Apr, Maj, Jun, Jul, Aug, Sep, Okt, Nov, Dec.
- `monthLabels` option: an array of 12 strings that overrides `locale`, for any other language.
- First test suite (`npm test`, node:test). `npm publish` runs it first.

### Fixed
- Behaviour change: the general `interactive: false` option now turns off every hover and click on the wheel, including adding events by clicking empty segments. To keep adding events with hover off, set `interactive` per ring instead. In detail, it now covers: the "+" indicator and click on empty data-ring segments, and the hover "VIEW AGENDA" month buttons. Before, only a ring's own `interactive: false` covered empty segments, the month buttons ignored the option, and a click could open the detail panel or month sidebar on a wheel meant to be static.
- `ConfigParser` and `LayoutCalculator` import their constants instead of reading `window.CIRCALIFY_CONSTANTS`, so they load outside a browser.

## 0.1.8

- Previous release.
