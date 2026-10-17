#!/usr/bin/env node
// Pre-push checks for the gh-pages site. A push to gh-pages deploys, and this
// script is the only gate before it.
//
//   node tools/check-pages.mjs              check index.html, aarshjul/index.html and site files
//   node tools/check-pages.mjs --self-test  every rule must catch its planted mistake (fixture,
//                                           mistakes applied to the real pages, a broken temp site)
//
// tools/pre-push runs both on every gh-pages push. Install it once per clone:
//   cp tools/pre-push "$(git rev-parse --git-common-dir)/hooks/pre-push"
//
// Exit code 0 when every check passes, 1 otherwise.

import { readFileSync, existsSync, statSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_BASE = 'https://mahmoodseoud.github.io/circalify/';
const SUBJECTS = [
  'Pro: klik paa early access',
  'Pro: early access tilmelding',
  'Skabeloner: download fra /aarshjul/'
];
const RETIRED_SUBJECTS = ['Poll: aarshjul i dag'];
const EVENT_PATHS = [
  'pro-door-seen', 'pro-door-click', 'pro-signup',
  'pro-door-seen-inbox', 'pro-door-click-inbox', 'pro-signup-inbox',
  'templates-download', 'wheel-fallback'
];
const POLL_KEYS = ['powerpoint', 'excel', 'plandisc', 'canva', 'ai', 'andet'];

// The English Pro door is counted apart from the Danish gate
const DOORS = {
  da: { subjects: SUBJECTS, events: EVENT_PATHS, poll: true, wheelNeedles: ['enableDetailPanel: false', "locale: 'da'"] },
  en: {
    subjects: ['Pro EN: early access click', 'Pro EN: early access signup'],
    events: ['pro-en-door-seen', 'pro-en-door-click', 'pro-en-signup', 'wheel-fallback-en'],
    poll: false,
    wheelNeedles: ['enableDetailPanel: false']
  }
};
const ENGINE_FILES = 11;
const MAX_PNG_BYTES = 200 * 1024;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// HTML comments and whole-line JS comments, so a rule never matches documentation
function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
}

// Every src, href and data-src attribute value
function attrUrls(html) {
  return [...stripComments(html).matchAll(/\s(?:src|href|data-src)\s*=\s*["']([^"']*)["']/gi)].map(m => m[1]);
}

// Quoted string literals inside scripts that look like relative file paths
function scriptPaths(html) {
  const out = [];
  for (const [, body] of stripComments(html).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const m of body.matchAll(/['"](\.\.?\/[^'"\s]+)['"]/g)) out.push(m[1]);
  }
  return out;
}

function isRelative(url) {
  return url !== '' && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url);
}

function metaContent(html, key) {
  const re = new RegExp(`<meta\\s+(?:property|name)=["']${key}["']\\s+content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  return m ? m[1] : null;
}

function scripts(html) {
  return [...stripComments(html).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(m => ({ attrs: m[1], body: m[2] }));
}

// ---------------------------------------------------------------------------
// Page rules: each returns a list of failure messages for one page
// ---------------------------------------------------------------------------

const pageRules = {
  'relative-targets-exist'(html, file) {
    const dir = dirname(file);
    const urls = [...attrUrls(html), ...scriptPaths(html)].filter(isRelative);
    return [...new Set(urls.map(u => u.split(/[?#]/)[0]))]
      .filter(u => u && !existsSync(join(dir, u)))
      .map(u => `relative target does not exist on disk: ${u}`);
  },

  'no-root-absolute'(html) {
    // A GitHub project page is served under /circalify/, so "/x" leaves the site
    return attrUrls(html)
      .filter(u => u.startsWith('/') && !u.startsWith('//'))
      .map(u => `root-absolute URL 404s on a project page: ${u}`);
  },

  'share-tags-absolute'(html) {
    const keys = ['og:url', 'og:image', 'twitter:image'];
    const fails = [];
    for (const k of keys) {
      const v = metaContent(html, k);
      if (!v) fails.push(`missing ${k}`);
      else if (!v.startsWith(SITE_BASE)) fails.push(`${k} must be an absolute URL under ${SITE_BASE}, got ${v}`);
    }
    return fails;
  },

  'web3forms-botcheck'(html) {
    // Every script or form that posts to web3forms must carry the honeypot
    const fails = [];
    for (const s of scripts(html)) {
      if (/api\.web3forms\.com/.test(s.body) && !/['"]botcheck['"]/.test(s.body)) {
        fails.push('a script posts to web3forms without a botcheck field');
      }
    }
    for (const [form] of stripComments(html).matchAll(/<form\b[^>]*action=["'][^"']*web3forms[^"']*["'][\s\S]*?<\/form>/gi)) {
      if (!/name=["']botcheck["']/.test(form)) fails.push('a web3forms form has no botcheck input');
    }
    return fails;
  },

  'number-unit-nbsp'(html) {
    // DESIGN.md: a number never wraps away from its unit, so visible copy joins them with &nbsp;
    const visible = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
    return [...visible.matchAll(/(?:\d[\d.,]*|<\/span>)[ \t]+(?:kr\.|md\.|måned(?:er)?\b|months?\b|a (?:month|year)\b|\/ month\b)/g)]
      .map(m => `number and unit split by a plain space, use &nbsp;: "${m[0]}"`);
  },

  'title-sync'(html) {
    // The h1 is copied by hand into the share cards and the tab title; a missed copy ships a stale card
    const h1 = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
    if (h1 === undefined) return ['page has no <h1>'];
    const text = h1.replace(/<[^>]+>/g, '').trim();
    const fails = [];
    for (const key of ['og:title', 'twitter:title']) {
      const v = metaContent(html, key);
      if (v === null) fails.push(`missing ${key}`);
      else if (v !== text) fails.push(`${key} "${v}" does not match the h1 "${text}"`);
    }
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
    if (title === undefined) fails.push('missing <title>');
    else if (!title.startsWith(text)) fails.push(`<title> "${title}" does not start with the h1 "${text}"`);
    return fails;
  },

  'goatcounter-tag'(html) {
    const tags = scripts(html).filter(s => /data-goatcounter=/.test(s.attrs));
    if (tags.length !== 1) return [`expected exactly one GoatCounter script tag, found ${tags.length}`];
    const fails = [];
    const attrs = tags[0].attrs;
    if (!/\basync\b/.test(attrs)) fails.push('GoatCounter tag must load async');
    if (/GOATCOUNTER_CODE/.test(attrs)) fails.push('LAUNCH BLOCKER: GoatCounter site code not set (replace GOATCOUNTER_CODE)');
    else if (!/data-goatcounter=["']https:\/\/[a-z0-9-]+\.goatcounter\.com\/count["']/.test(attrs)) fails.push('GoatCounter endpoint must be https://<code>.goatcounter.com/count');
    return fails;
  }
};

// Rules for a Pro door page, parameterized by DOORS.da / DOORS.en
const doorRules = (door) => ({
  'subjects-exact'(html) {
    const fails = [];
    for (const s of door.subjects) if (!html.includes(`'${s}'`)) fails.push(`missing web3forms subject '${s}'`);
    for (const s of RETIRED_SUBJECTS) if (html.includes(s)) fails.push(`retired subject still present: '${s}'`);
    return fails;
  },

  'event-paths'(html) {
    const fails = [];
    for (const p of door.events) if (!html.includes(`'${p}'`)) fails.push(`missing GoatCounter event path '${p}'`);
    if (door.poll) {
      for (const k of POLL_KEYS) if (!html.includes(`data-answer="${k}"`)) fails.push(`missing poll answer ${k}`);
      if (!html.includes("'poll-' + key")) fails.push('poll events must be built as poll-<answer>');
    }
    if (/gcEvent\(\s*['"]\//.test(html)) fails.push('GoatCounter event paths must not start with /');
    return fails;
  },

  'gc-queue'(html) {
    const fails = [];
    const tag = scripts(html).find(s => /data-goatcounter=/.test(s.attrs));
    if (!tag || !/onload=["']flushGc\(\)["']/.test(tag.attrs)) fails.push('GoatCounter tag must flush queued events with onload="flushGc()"');
    const flush = html.match(/function flushGc\(\) \{[\s\S]*?\n\s*\}\n/);
    if (!flush) fails.push('flushGc() is not defined');
    else if (!/if \(!\(window\.goatcounter && window\.goatcounter\.count\)\) return;/.test(flush[0])) {
      fails.push('flushGc() must return early while goatcounter.count is missing, or it loops forever');
    }
    return fails;
  },

  'wheel-config'(page) {
    // Only the example wheel's config counts, not other code on the page (the playground)
    const fn = page.match(/function renderWheel\([\s\S]*?\n\s*\}\n/);
    if (!fn) return ['renderWheel() not found'];
    const html = fn[0];
    const fails = [];
    for (const needle of door.wheelNeedles) {
      if (!html.includes(needle)) fails.push(`wheel config must contain ${needle}`);
    }
    const ringCount = (html.match(/\{ type: 'data'[^}]*\}/g) || []).length;
    const nonInteractive = (html.match(/\{ type: 'data'[^}]*interactive: false[^}]*\}/g) || []).length;
    if (!/startYear: y,[\s\S]{0,80}interactive: false/.test(html)) fails.push('general wheel config must contain interactive: false');
    if (ringCount === 0) fails.push('renderWheel has no data ring literal the checker can read');
    else if (ringCount !== nonInteractive) fails.push('every data ring must set interactive: false');
    return fails;
  },

  'modulepreload-pinned'(html) {
    const m = html.match(/const IMPORT_URL = '(https:\/\/unpkg\.com\/circalify@(\d+\.\d+\.\d+)\/src\/index\.js)'/);
    if (!m) return ['IMPORT_URL must be pinned to an exact circalify version'];
    const version = m[2];
    const preloads = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)"/g)].map(x => x[1]);
    const fails = [];
    if (preloads.length !== ENGINE_FILES) fails.push(`expected ${ENGINE_FILES} modulepreload links, found ${preloads.length}`);
    for (const href of preloads) {
      if (!href.startsWith(`https://unpkg.com/circalify@${version}/src/`)) fails.push(`modulepreload not pinned to ${version}: ${href}`);
    }
    return fails;
  }
});

// ---------------------------------------------------------------------------
// Site rules: files on disk and the English page's link to the Danish page
// ---------------------------------------------------------------------------

const siteRules = {
  'sitemap-and-robots'(root) {
    const fails = [];
    const sitemap = join(root, 'sitemap.xml');
    const robots = join(root, 'robots.txt');
    if (!existsSync(sitemap)) fails.push('sitemap.xml missing');
    else for (const loc of [SITE_BASE, SITE_BASE + 'aarshjul/']) {
      if (!readFileSync(sitemap, 'utf8').includes(`<loc>${loc}</loc>`)) fails.push(`sitemap.xml missing ${loc}`);
    }
    if (!existsSync(robots)) fails.push('robots.txt missing');
    else if (!readFileSync(robots, 'utf8').includes(`Sitemap: ${SITE_BASE}sitemap.xml`)) fails.push('robots.txt missing the Sitemap line');
    return fails;
  },

  'share-image-size'(root) {
    const png = join(root, 'images', 'aarshjul-eksempel.png');
    if (!existsSync(png)) return ['images/aarshjul-eksempel.png missing'];
    const size = statSync(png).size;
    return size > MAX_PNG_BYTES ? [`images/aarshjul-eksempel.png is ${size} bytes, limit ${MAX_PNG_BYTES}`] : [];
  },

  'english-links-danish'(root) {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    return /href="aarshjul\/"/.test(html) ? [] : ['index.html must link to the Danish page with href="aarshjul/"'];
  }
};

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function runHtml(raw, file, rules) {
  const html = stripComments(raw);
  const results = {};
  for (const [name, rule] of Object.entries(rules)) results[name] = rule(html, file);
  return results;
}

function runPage(file, rules) {
  return runHtml(readFileSync(file, 'utf8'), file, rules);
}

function report(label, results) {
  let failed = 0;
  for (const [name, fails] of Object.entries(results)) {
    if (fails.length === 0) console.log(`PASS ${label} ${name}`);
    for (const f of fails) {
      console.log(`FAIL ${label} ${name}: ${f}`);
      failed++;
    }
  }
  return failed;
}

// ---------------------------------------------------------------------------
// Self-test: every rule and sub-check must catch the exact mistake it exists for
// ---------------------------------------------------------------------------

// The one planted violation per rule in tools/fixtures/bad-aarshjul.html
const FIXTURE_EXPECT = {
  'relative-targets-exist': 'relative target does not exist on disk: ../templates/missing.zip',
  'no-root-absolute': 'root-absolute URL 404s on a project page: /aarshjul/',
  'share-tags-absolute': 'og:url must be an absolute URL',
  'web3forms-botcheck': 'a script posts to web3forms without a botcheck field',
  'goatcounter-tag': 'GoatCounter tag must load async',
  'number-unit-nbsp': 'number and unit split by a plain space, use &nbsp;: "349 kr."',
  'title-sync': 'og:title "Årshjul online" does not match the h1 "Årshjul til foreninger"',
  'subjects-exact': "missing web3forms subject 'Skabeloner: download fra /aarshjul/'",
  'event-paths': "missing GoatCounter event path 'wheel-fallback'",
  'gc-queue': 'onload="flushGc()"',
  'wheel-config': 'wheel config must contain enableDetailPanel: false',
  'modulepreload-pinned': 'modulepreload not pinned to 0.1.9'
};

// Single mistakes applied to the real pages: [page, door, rule, mistake, edit, expected message]
// The target must occur exactly once, so the mistake lands where the rule looks
const one = (from, to) => html => {
  const count = from instanceof RegExp ? (html.match(new RegExp(from.source, 'g')) || []).length : html.split(from).length - 1;
  if (count !== 1) throw new Error(`self-test mutation target must occur once, found ${count}: ${String(from).slice(0, 60)}`);
  return html.replace(from, to);
};
const inRenderWheel = (from, to) => html => {
  const fn = html.match(/function renderWheel\([\s\S]*?\n\s*\}\n/)[0];
  if (!(from instanceof RegExp ? from.test(fn) : fn.includes(from))) throw new Error(`self-test mutation target not found in renderWheel: ${from}`);
  return html.replace(fn, fn.replace(from, to));
};
const addScript = code => html => html.replace('</body>', `<script>${code}</script></body>`);
const DA = join('aarshjul', 'index.html');
const MUTATIONS = [
  [DA, 'da', 'goatcounter-tag', 'site code placeholder left in', one('matooize', 'GOATCOUNTER_CODE'), 'LAUNCH BLOCKER'],
  [DA, 'da', 'goatcounter-tag', 'wrong endpoint', one('https://matooize.goatcounter.com/count', 'http://matooize.example.com/count'), 'endpoint must be'],
  [DA, 'da', 'subjects-exact', 'retired poll subject back', addScript("const s = 'Poll: aarshjul i dag';"), 'retired subject still present'],
  [DA, 'da', 'event-paths', 'poll answer missing', one('data-answer="canva"', 'data-answer="canvas"'), 'missing poll answer canva'],
  [DA, 'da', 'event-paths', 'poll path built differently', one("'poll-' + key", "'poll_' + key"), 'poll events must be built as poll-<answer>'],
  [DA, 'da', 'event-paths', 'event path with a slash', addScript("gcEvent('/door');"), 'must not start with /'],
  [DA, 'da', 'modulepreload-pinned', 'one preload missing', one(/[ \t]*<link rel="modulepreload" href="https:\/\/unpkg\.com\/circalify@[\d.]+\/src\/circalify\.js" \/>\n/, ''), 'expected 11 modulepreload links, found 10'],
  [DA, 'da', 'modulepreload-pinned', 'engine not pinned', one("const IMPORT_URL = 'https://unpkg.com/circalify@0.1.10/src/index.js'", "const IMPORT_URL = 'https://unpkg.com/circalify@latest/src/index.js'"), 'must be pinned to an exact circalify version'],
  [DA, 'da', 'wheel-config', 'general wheel interactive', inRenderWheel(/\n\s*interactive: false,(?=\n)/, ''), 'general wheel config must contain interactive: false'],
  [DA, 'da', 'wheel-config', 'data ring interactive', inRenderWheel(', interactive: false }', ' }'), 'every data ring must set interactive: false'],
  [DA, 'da', 'wheel-config', 'unreadable ring literal', inRenderWheel("{ type: 'data',", '{ type: "data",'), 'no data ring literal'],
  [DA, 'da', 'gc-queue', 'flushGc spins without count', one(/\n\s*if \(!\(window\.goatcounter && window\.goatcounter\.count\)\) return;(?=\n)/, ''), 'loops forever'],
  [DA, 'da', 'gc-queue', 'flushGc missing', one('function flushGc() {', 'function flushQueue() {'), 'flushGc() is not defined'],
  [DA, 'da', 'web3forms-botcheck', 'honeypot dropped', one("body.append('botcheck', '');", ''), 'without a botcheck field'],
  [DA, 'da', 'share-tags-absolute', 'relative share image', one('<meta property="og:image" content="https://mahmoodseoud.github.io/circalify/images/aarshjul-eksempel.png" />', '<meta property="og:image" content="../images/aarshjul-eksempel.png" />'), 'og:image must be an absolute URL'],
  [DA, 'da', 'no-root-absolute', 'root-absolute link', one('<a href="../">', '<a href="/">'), 'root-absolute URL'],
  [DA, 'da', 'title-sync', 'share title left behind', one('<meta property="og:title" content="Årshjul til foreninger" />', '<meta property="og:title" content="Lav årshjulet online" />'), 'og:title "Lav årshjulet online" does not match the h1'],
  ['index.html', 'en', 'title-sync', 'English tab title left behind', one('<title>Year wheels for associations | Circalify</title>', '<title>Make your year wheel online | Circalify</title>'), '<title> "Make your year wheel online | Circalify" does not start with the h1'],
  [DA, 'da', 'number-unit-nbsp', 'price wraps from its unit', one('349</span>&nbsp;kr./md.', '349</span> kr./md.'), 'number and unit split by a plain space'],
  ['index.html', 'en', 'number-unit-nbsp', 'English months wrap from the number', one('10&nbsp;months', '10 months'), 'number and unit split by a plain space'],
  [DA, 'da', 'relative-targets-exist', 'missing download', one("const TEMPLATES_ZIP = '../templates/circalify-templates.zip';", "const TEMPLATES_ZIP = '../templates/nope.zip';"), 'does not exist on disk: ../templates/nope.zip'],
  ['index.html', 'en', 'subjects-exact', 'English signup subject changed', one("const SUBJECT_SIGNUP = 'Pro EN: early access signup';", "const SUBJECT_SIGNUP = 'Pro EN: signup';"), "missing web3forms subject 'Pro EN: early access signup'"],
  ['index.html', 'en', 'event-paths', 'English event mixed with Danish', one("'pro-en-door-seen'", "'pro-door-seen'"), "missing GoatCounter event path 'pro-en-door-seen'"],
  ['index.html', 'en', 'wheel-config', 'English detail panel on', inRenderWheel(/\n\s*enableDetailPanel: false,(?=\n)/, ''), 'enableDetailPanel: false'],
  ['index.html', 'en', 'gc-queue', 'English queue never flushed', one(' onload="flushGc()"', ''), 'onload="flushGc()"'],
  ['index.html', 'en', 'modulepreload-pinned', 'English preload on another version', one('href="https://unpkg.com/circalify@0.1.10/src/data-ring.js"', 'href="https://unpkg.com/circalify@0.1.9/src/data-ring.js"'), 'modulepreload not pinned to 0.1.10']
];

function selfTest() {
  let bad = 0;
  const pass = msg => console.log(`PASS self-test ${msg}`);
  const fail = msg => { console.log(`FAIL self-test ${msg}`); bad++; };

  // 1. Fixture: exactly the planted failure, with the expected message
  const fixture = join(ROOT, 'tools', 'fixtures', 'bad-aarshjul.html');
  const results = runPage(fixture, { ...pageRules, ...doorRules(DOORS.da) });
  for (const [name, fails] of Object.entries(results)) {
    const want = FIXTURE_EXPECT[name];
    if (!want) fail(`${name}: no expected message recorded for the fixture`);
    else if (fails.length === 1 && fails[0].includes(want)) pass(`fixture ${name}: ${fails[0]}`);
    else fail(`fixture ${name}: expected one failure containing "${want}", got ${fails.length ? fails.join(' | ') : 'none'}`);
  }

  // 2. Real pages: clean before the mistake, caught after it
  for (const [page, door, rule, mistake, edit, want] of MUTATIONS) {
    const file = join(ROOT, page);
    const rules = { ...pageRules, ...doorRules(DOORS[door]) };
    const raw = readFileSync(file, 'utf8');
    const before = runHtml(raw, file, { [rule]: rules[rule] })[rule];
    let after;
    try {
      after = runHtml(edit(raw), file, { [rule]: rules[rule] })[rule];
    } catch (e) {
      fail(`${page} ${rule} (${mistake}): ${e.message}`);
      continue;
    }
    if (before.length) fail(`${page} ${rule}: the real page already fails: ${before.join(' | ')}`);
    else if (after.some(f => f.includes(want))) pass(`${page} ${rule} catches ${mistake}`);
    else fail(`${page} ${rule} (${mistake}): expected a failure containing "${want}", got ${after.length ? after.join(' | ') : 'none'}`);
  }

  // 3. Site rules on a broken temporary site: one failure each, with the expected message
  const tmp = mkdtempSync(join(tmpdir(), 'check-pages-'));
  try {
    writeFileSync(join(tmp, 'sitemap.xml'), `<urlset><url><loc>${SITE_BASE}</loc></url></urlset>`);
    writeFileSync(join(tmp, 'robots.txt'), `Sitemap: ${SITE_BASE}sitemap.xml\n`);
    writeFileSync(join(tmp, 'index.html'), '<a href="/aarshjul/">dansk</a>');
    const siteExpect = {
      'sitemap-and-robots': `sitemap.xml missing ${SITE_BASE}aarshjul/`,
      'share-image-size': 'images/aarshjul-eksempel.png missing',
      'english-links-danish': 'index.html must link to the Danish page'
    };
    for (const [name, rule] of Object.entries(siteRules)) {
      const fails = rule(tmp);
      const want = siteExpect[name];
      if (!want) fail(`site ${name}: no expected message recorded`);
      else if (fails.length === 1 && fails[0].includes(want)) pass(`site ${name}: ${fails[0]}`);
      else fail(`site ${name}: expected one failure containing "${want}", got ${fails.length ? fails.join(' | ') : 'none'}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  console.log(bad ? `\n${bad} self-test check(s) failed.` : '\nSelf-test passed.');
  return bad;
}

if (process.argv.includes('--self-test')) {
  process.exit(selfTest() ? 1 : 0);
}

let failed = 0;
failed += report('index.html', runPage(join(ROOT, 'index.html'), { ...pageRules, ...doorRules(DOORS.en) }));
failed += report('aarshjul/index.html', runPage(join(ROOT, 'aarshjul', 'index.html'), { ...pageRules, ...doorRules(DOORS.da) }));
const site = {};
for (const [name, rule] of Object.entries(siteRules)) site[name] = rule(ROOT);
failed += report('site', site);

console.log(failed ? `\n${failed} check(s) failed. Do not push.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
