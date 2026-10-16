# Changelog

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
