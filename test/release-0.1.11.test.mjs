import { test } from 'node:test';
import assert from 'node:assert/strict';

import ConfigParser from '../src/config-parser.js';
import CalendarRing from '../src/calendar-ring.js';
import CircalifyCore from '../src/circalify-core.js';
import RingFactory from '../src/ring-factory.js';
import DataRing from '../src/data-ring.js';

const parse = extra => new ConfigParser().parse({ rings: [{ type: 'calendar' }], ...extra }).general;

// A core instance without a DOM: only the fields the method under test reads
function bareCore(fields) {
  const core = Object.create(CircalifyCore.prototype);
  Object.assign(core, fields);
  core._createSVGElement = (tag, attrs) => ({
    tag, attrs, children: [], textContent: '',
    appendChild(c) { this.children.push(c); },
    setAttribute(k, v) { this.attrs[k] = v; }
  });
  return core;
}

function centerLabelGroup(text, innerRadius = 150) {
  const appended = [];
  const core = bareCore({
    cx: 500, cy: 500,
    generalConfig: { centerLabel: text, innerRadius, fontFamily: 'x', centerLabelColor: '#000' },
    svgGroups: { rings: { appendChild: el => appended.push(el) } }
  });
  core._drawCenterLabel();
  return { core, group: appended[0] };
}

test('locale accepts BCP-47 tags and any case', () => {
  assert.equal(parse({ locale: 'da-DK' }).locale, 'da');
  assert.equal(parse({ locale: 'DA' }).monthLabels[4], 'Maj');
  assert.equal(parse({ locale: 'en-US' }).locale, 'en');
  assert.throws(() => parse({ locale: 'xx-YY' }), { message: "ConfigParser: locale must be one of en, da, got 'xx-YY'" });
});

test('full month names follow the locale', () => {
  assert.equal(parse().monthNames[0], 'January');
  assert.equal(parse({ locale: 'da' }).monthNames[2], 'Marts');
});

test('the month sidebar title uses the locale month names', () => {
  const core = bareCore({ generalConfig: parse() });
  assert.equal(core._monthName(0), 'January');
  core.generalConfig = parse({ locale: 'da' });
  assert.equal(core._monthName(0), 'Januar');
});

test('CalendarRing uses the month labels resolved by ConfigParser', () => {
  const general = parse({ locale: 'da' });
  const ring = new CalendarRing({}, { inner: 100, outer: 120, center: 110, height: 20 },
    { cx: 0, cy: 0, defs: null, svgGroups: {}, generalConfig: general });
  assert.equal(ring.monthLabels[4], 'Maj');
  assert.equal(ring.monthLabels[9], 'Okt');
});

test('general interactive: false adds no month hover overlays', (t) => {
  t.mock.method(RingFactory, 'createRings', () => []);
  for (const [interactive, expected] of [[false, 0], [true, 1]]) {
    let calls = 0;
    const core = bareCore({ cx: 0, cy: 0, svgGroups: {}, defs: null, ringConfigs: [], ringBoundaries: [], generalConfig: { interactive } });
    core._addMonthInteractionOverlays = () => { calls++; };
    core._createRings();
    assert.equal(calls, expected);
  }
});

test('centerLabel draws a bold first line and a smaller second line', () => {
  const { group } = centerLabelGroup('Foreningsaar\n2026');
  assert.equal(group.children.length, 2);
  assert.equal(group.children[0].textContent, 'Foreningsaar');
  assert.ok(group.children[1].attrs['font-size'] < group.children[0].attrs['font-size']);
});

test('whitespace-only centerLabel draws nothing; a third line is dropped', () => {
  assert.equal(centerLabelGroup(' \n  ').group, undefined);
  assert.equal(centerLabelGroup('a\nb\nc').group.children.length, 2);
});

test('a long centerLabel keeps a readable size and is shortened to fit', () => {
  const { group } = centerLabelGroup('A'.repeat(80));
  const line = group.children[0];
  assert.ok(line.attrs['font-size'] >= 18, `font-size ${line.attrs['font-size']}`);
  assert.ok(line.textContent.length < 80 && line.textContent.endsWith('...'));
  assert.ok(line.textContent.length * line.attrs['font-size'] * 0.6 <= 150 * 1.5 + 1e-9);
});

test('centerLabel hides while hover info shows and returns when it clears', () => {
  const { core, group } = centerLabelGroup('Foreningsaar');
  core.svgGroups.centerInfo = { innerHTML: '', appendChild() {} };
  const saved = globalThis.document;
  globalThis.document = { createElement: () => ({ style: {}, appendChild() {}, textContent: '' }) };
  try {
    core._showCenterInfo({ label: 'Budget', color: '#A9CBD6' });
    assert.equal(group.attrs.visibility, 'hidden');
    core._clearCenterInfo();
    assert.equal(group.attrs.visibility, 'visible');
    core._showCenterInfo(null);
    assert.equal(group.attrs.visibility, 'visible');
  } finally {
    globalThis.document = saved;
  }
});

test('radial labels: thin ring falls back to a bold first letter; empty or unreadable gives null', () => {
  const ring = () => new DataRing({ fontSize: 14, fontColor: '#000', fontWeight: '600', interactive: false },
    { inner: 100, outer: 300, center: 200, height: 200 },
    { cx: 0, cy: 0, defs: null, svgGroups: {}, generalConfig: { interactive: false, fontFamily: 'x' } });
  const letter = ring()._layoutRadialLabel('generalforsamling', 10, 40);
  assert.deepEqual(letter.lines, ['G']);
  assert.equal(letter.fontWeight, '700');
  assert.equal(ring()._layoutRadialLabel('Budget', 200, 2), null);
  assert.equal(ring()._layoutRadialLabel('   ', 200, 60), null);
  assert.equal(ring()._layoutRadialLabel('­', 200, 60), null);
});

test('non-array monthLabels and non-string centerLabelColor throw the documented messages', () => {
  assert.throws(() => parse({ monthLabels: 'Jan,Feb' }), { message: 'ConfigParser: monthLabels must be an array of 12 strings, got string' });
  assert.throws(() => parse({ centerLabelColor: 1 }), { message: 'ConfigParser: centerLabelColor must be a string, got number' });
});

test('a centerLabel that exactly fills the width is not shortened', () => {
  const { group } = centerLabelGroup('Foreningsår\n2026');
  assert.equal(group.children[0].textContent, 'Foreningsår');
});

test('UI strings follow the locale', () => {
  const en = bareCore({ generalConfig: parse() });
  const da = bareCore({ generalConfig: parse({ locale: 'da' }) });
  assert.equal(en._t('save'), 'Save');
  assert.equal(da._t('save'), 'Gem');
  assert.equal(en._t('monthAgenda', { month: 'MARCH' }), 'MARCH AGENDA');
  assert.equal(da._t('monthAgenda', { month: 'MARTS' }), 'AGENDA FOR MARTS');
  assert.equal(en._t('noEvents'), 'No events this month');
  assert.equal(da._t('dayNamesShort')[1], 'man.');
  assert.equal(en._t('dayNamesShort')[1], 'Mon');
});

test('every locale defines the same UI string keys', () => {
  const en = parse().strings, da = parse({ locale: 'da' }).strings;
  assert.deepEqual(Object.keys(da).sort(), Object.keys(en).sort());
});

test('no hard-coded UI strings remain in the core', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../src/circalify-core.js', import.meta.url), 'utf8');
  for (const literal of ["'VIEW AGENDA'", 'Zoom Ind', 'Ingen begivenheder', "'Add title'", "'Save'", "'Delete'", "'Start date'", "'søn.'", "'Untitled Event'", "'maj'"]) {
    assert.ok(!src.includes(literal), `still hard-coded: ${literal}`);
  }
});

test('a shortened centerLabel never splits a character outside the BMP', () => {
  const { group } = centerLabelGroup('\u{1D504}'.repeat(80));
  assert.doesNotMatch(group.children[0].textContent, /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/);
});

test('sidebar event dates and untitled events follow the locale and custom labels', () => {
  const en = bareCore({ generalConfig: parse() });
  const da = bareCore({ generalConfig: parse({ locale: 'da' }) });
  const custom = bareCore({ generalConfig: parse({ monthLabels: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'] }) });
  assert.equal(en._formatShortDate('2026-05-12'), '12 May');
  assert.equal(da._formatShortDate('2026-05-12'), '12 maj');
  assert.equal(custom._formatShortDate('2026-05-12'), '12 mai');
  assert.equal(en._t('untitledEvent'), 'Untitled event');
  assert.equal(da._t('untitledEvent'), 'Uden titel');
});
