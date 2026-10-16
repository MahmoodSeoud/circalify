import { test } from 'node:test';
import assert from 'node:assert/strict';

import ConfigParser from '../src/config-parser.js';
import DataRing from '../src/data-ring.js';

function ring(fontSize) {
  return new DataRing(
    { fontSize, fontColor: '#000', fontWeight: '600', interactive: false },
    { inner: 100, outer: 300, center: 200, height: 200 },
    { cx: 0, cy: 0, defs: null, svgGroups: {}, generalConfig: { interactive: false, fontFamily: 'Inter' } }
  );
}

test('a long word on a thick ring keeps its full text at the configured size', () => {
  // 200 units along the radius, 60 across the arc: "Generalforsamling" fits whole.
  const layout = ring(14)._layoutRadialLabel('Generalforsamling', 200, 60);
  assert.deepEqual(layout.lines, ['Generalforsamling']);
  assert.equal(layout.fontSize, 14);
});

test('radial font shrinks to fit the ring thickness instead of truncating', () => {
  // 17 chars * 0.6 * 30 = 306 > 170 room, so the font must come down, not the text.
  const layout = ring(30)._layoutRadialLabel('Generalforsamling', 200, 100);
  assert.deepEqual(layout.lines, ['Generalforsamling']);
  assert.ok(layout.fontSize < 30 && layout.fontSize >= 16, `fontSize ${layout.fontSize}`);
});

test('radial font never exceeds what the arc width can hold', () => {
  const layout = ring(40)._layoutRadialLabel('Budget', 200, 30);
  assert.ok(layout.fontSize <= 30 * 0.7 + 1e-9, `fontSize ${layout.fontSize}`);
});

test('two words wrap onto two lines when that gives a larger font', () => {
  const layout = ring(40)._layoutRadialLabel('Sommerfest for alle', 120, 120);
  assert.equal(layout.lines.length, 2);
  assert.equal(layout.lines.join(' '), 'Sommerfest for alle');
});

test('labels truncate only when the minimum font cannot fit them', () => {
  const layout = ring(14)._layoutRadialLabel('Generalforsamling', 40, 20);
  assert.ok(layout.lines[0].length < 'Generalforsamling'.length);
  assert.ok('Generalforsamling'.startsWith(layout.lines[0]));
});

test('rendered radial labels carry no drop shadow', () => {
  const r = ring(14);
  const made = [];
  r._createSVGElement = (tag, attrs) => { const el = { tag, attrs, children: [], appendChild(c) { this.children.push(c); } }; made.push(el); return el; };
  r._polarToCartesian = () => ({ x: 0, y: 0 });
  const group = { children: [], appendChild(c) { this.children.push(c); } };
  r._addRadialEventLabel('Budget', 0, 200, 200, 60, group);
  const text = made.find(e => e.tag === 'text');
  assert.ok(text, 'a text element is rendered');
  assert.doesNotMatch(text.attrs.style, /text-shadow/);
});

test('centerLabel defaults to empty and validates its type', () => {
  const parse = extra => new ConfigParser().parse({ rings: [{ type: 'calendar' }], ...extra }).general;
  assert.equal(parse().centerLabel, '');
  assert.equal(parse({ centerLabel: 'Foreningsår\n2026' }).centerLabel, 'Foreningsår\n2026');
  assert.equal(parse().centerLabelColor, '#1F2937');
  assert.throws(() => parse({ centerLabel: 2026 }), { message: 'ConfigParser: centerLabel must be a string, got number' });
});

test('a soft hyphen lets a long compound word break onto two lines with a hyphen', () => {
  const layout = ring(30)._layoutRadialLabel('General\u00ADforsamling', 120, 100);
  assert.deepEqual(layout.lines, ['General-', 'forsamling']);
});

test('an unused soft hyphen stays invisible', () => {
  const layout = ring(14)._layoutRadialLabel('General\u00ADforsamling', 200, 60);
  assert.deepEqual(layout.lines, ['Generalforsamling']);
});
