import { test } from 'node:test';
import assert from 'node:assert/strict';

import ConfigParser from '../src/config-parser.js';
import LayoutCalculator from '../src/layout-calculator.js';
import DataRing from '../src/data-ring.js';

const EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DA = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
const RINGS = [{ type: 'calendar' }];

const parseGeneral = (extra = {}) => new ConfigParser().parse({ rings: RINGS, ...extra }).general;

test('ConfigParser and LayoutCalculator load without a browser window', () => {
  assert.equal(typeof window, 'undefined');
  assert.doesNotThrow(() => new ConfigParser());
  assert.equal(LayoutCalculator.MONTHS_PER_YEAR, 12);
});

test('default locale gives English month labels', () => {
  const general = parseGeneral();
  assert.equal(general.locale, 'en');
  assert.deepEqual(general.monthLabels, EN);
});

test("locale 'da' gives Danish month labels", () => {
  const general = parseGeneral({ locale: 'da' });
  assert.equal(general.locale, 'da');
  assert.deepEqual(general.monthLabels, DA);
});

test('explicit monthLabels win over locale', () => {
  const custom = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  assert.deepEqual(parseGeneral({ locale: 'da', monthLabels: custom }).monthLabels, custom);
  assert.deepEqual(parseGeneral({ monthLabels: custom }).monthLabels, custom);
});

test('resolved labels are a copy, not the shared constant', () => {
  const general = parseGeneral({ locale: 'da' });
  general.monthLabels[0] = 'changed';
  assert.deepEqual(parseGeneral({ locale: 'da' }).monthLabels, DA);
});

test('unknown locale throws the documented message', () => {
  assert.throws(() => parseGeneral({ locale: 'xx' }), {
    message: "ConfigParser: locale must be one of en, da, got 'xx'"
  });
});

test('monthLabels of the wrong length throws the documented message', () => {
  assert.throws(() => parseGeneral({ monthLabels: ['Jan', 'Feb'] }), {
    message: 'ConfigParser: monthLabels must be an array of 12 strings, got 2'
  });
  assert.throws(() => parseGeneral({ monthLabels: [...EN.slice(0, 11), 12] }), {
    message: 'ConfigParser: monthLabels must be an array of 12 strings, got 12'
  });
});

test('existing defaults are unchanged', () => {
  const general = parseGeneral();
  assert.equal(general.interactive, true);
  assert.equal(general.enableDetailPanel, true);
  assert.equal(general.startMonth, 0);
  assert.equal(general.numberOfMonths, 12);
  assert.equal(general.title, '');
});

// Empty-segment hover and click must respect the general interactive option,
// not only the per-ring one.
function segmentListeners(ringInteractive, generalInteractive) {
  const appended = [];
  const ring = new DataRing(
    { interactive: ringInteractive, separator: false },
    { inner: 100, outer: 120, center: 110, height: 20 },
    {
      cx: 0, cy: 0, defs: null,
      svgGroups: { rings: { appendChild: el => appended.push(el) }, segments: { appendChild() {} } },
      generalConfig: { interactive: generalInteractive }
    }
  );
  ring._createArcPath = () => 'M0 0';
  ring._createSVGElement = (tag, attrs) => ({ tag, attrs, listeners: [], addEventListener(type) { this.listeners.push(type); } });
  ring._createSegment(0, 1);
  return appended[0];
}

test('empty segments are interactive when ring and general config allow it', () => {
  const segment = segmentListeners(true, true);
  assert.deepEqual(segment.listeners, ['mouseenter', 'mouseleave', 'click']);
  assert.equal(segment.attrs.cursor, 'pointer');
});

test('general interactive false disables empty-segment hover and click', () => {
  const segment = segmentListeners(true, false);
  assert.deepEqual(segment.listeners, []);
  assert.equal(segment.attrs.cursor, 'default');
});

test('ring interactive false disables empty-segment hover and click', () => {
  const segment = segmentListeners(false, true);
  assert.deepEqual(segment.listeners, []);
  assert.equal(segment.attrs.cursor, 'default');
});
