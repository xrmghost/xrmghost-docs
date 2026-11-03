import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const howToDir = join(root, 'src/content/docs/how-to');
const dist = join(root, 'dist');
const SITE = 'https://docs.xrmghost.tech';

const NEWEST = 'zz-fixture-newest';
const OLDEST = 'zz-fixture-oldest';
const NODATE = 'zz-fixture-nodate';
const NESTED_DIR = 'zz-fixture-nested';
const NESTED = `${NESTED_DIR}/deep`;
const fixtureFile = (id) => join(howToDir, `${id}.mdx`);

function writeFixture(id, date) {
  mkdirSync(dirname(fixtureFile(id)), { recursive: true });
  const dateLine = date ? `date: ${date}\n` : '';
  writeFileSync(
    fixtureFile(id),
    `---\ntitle: "Fixture ${id}"\ndescription: "Temporary fixture ${id}."\n${dateLine}---\n\nTemporary.\n`,
  );
}

function removeFixtures() {
  for (const id of [NEWEST, OLDEST, NODATE]) rmSync(fixtureFile(id), { force: true });
  rmSync(join(howToDir, NESTED_DIR), { recursive: true, force: true });
}

function build() {
  return spawnSync('npx', ['astro', 'build'], { cwd: root, encoding: 'utf8', shell: false });
}

const read = (p) => readFileSync(join(dist, p), 'utf8');

// Estrae i "how-to/<id>" nell'ordine in cui compaiono.
const orderIn = (text, re) => [...text.matchAll(re)].map((m) => m[1]);

// Elenco ricorsivo dei .mdx sotto how-to/, con id = percorso relativo senza estensione.
function listEntries(dir = howToDir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (d.isDirectory()) return listEntries(join(dir, d.name), `${prefix}${d.name}/`);
    if (!d.name.endsWith('.mdx') || (prefix === '' && d.name === 'index.mdx')) return [];
    if (d.name.startsWith('zz-fixture-')) return [];
    return [{ id: `${prefix}${d.name.replace(/\.mdx$/, '')}`, file: join(dir, d.name) }];
  });
}

// Le voci esistenti, con la data letta dal frontmatter.
function existingEntries() {
  return listEntries()
    .filter((e) => !e.id.startsWith(`${NESTED_DIR}/`))
    .map(({ id, file }) => {
      const date = readFileSync(file, 'utf8').match(/^date:\s*(\S+)/m)?.[1];
      assert.ok(date, `${id} must carry a date`);
      return { id, date };
    });
}

// Ordine atteso = data decrescente, poi id crescente.
const sortEntries = (entries) =>
  [...entries].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id),
  );

before(() => removeFixtures());
after(() => removeFixtures());

test('landing, feed, sitemap e alternate sul build con fixture datate', () => {
  try {
    writeFixture(NEWEST, '2026-10-28');
    writeFixture(OLDEST, '2026-01-01');
    writeFixture(NESTED, '2026-10-20');
    const r = build();
    assert.equal(r.status, 0, `build failed:\n${r.stdout}\n${r.stderr}`);

    const entries = [
      ...existingEntries(),
      { id: NEWEST, date: '2026-10-28' },
      { id: OLDEST, date: '2026-01-01' },
      { id: NESTED, date: '2026-10-20' },
    ];
    const expected = sortEntries(entries).map((e) => e.id);
    const dateOf = Object.fromEntries(entries.map((e) => [e.id, e.date]));
    // Date esplicite delle voci consegnate, oltre a quelle lette dal frontmatter.
    for (const id of ['first-plugin-local-run', 'windows-smart-app-control']) {
      assert.equal(dateOf[id], '2026-10-08', `${id} date`);
    }
    for (const id of ['assert-expected-exceptions', 'debug-plugin-visual-studio-without-profiler']) {
      assert.equal(dateOf[id], '2026-10-27', `${id} date`);
    }
    assert.ok(expected.includes(NESTED), 'nested fixture in inventory');

    const landing = read('how-to/index.html');
    const landingOrder = orderIn(
      landing,
      /<li>\s*<a href="https:\/\/docs\.xrmghost\.tech\/how-to\/([^"]+?)\/">/g,
    );
    assert.deepEqual(landingOrder, expected, 'landing order');

    const rss = read('how-to/rss.xml');
    const items = rss.split('<item>').slice(1);
    const rssOrder = items.map((i) => i.match(/<link>[^<]*?\/how-to\/([^<]+?)\/<\/link>/)[1]);
    assert.deepEqual(rssOrder, expected, 'rss order');

    // Per ogni item RSS: l'URL corrisponde alla data attesa
    for (const item of items) {
      const id = item.match(/<link>[^<]*?\/how-to\/([^<]+?)\/<\/link>/)[1];
      const pub = new Date(item.match(/<pubDate>([^<]+)</)[1]).toISOString().slice(0, 10);
      assert.equal(pub, dateOf[id], `rss pubDate for ${id}`);
    }

    // Campi e link assoluti
    assert.match(rss, /<title>XrmGhost how-to guides<\/title>/);
    for (const item of items) {
      assert.match(item, /<title>[^<]+<\/title>/);
      assert.match(item, /<description>[^<]+<\/description>/);
      assert.match(item, /<pubDate>[^<]+<\/pubDate>/);
      assert.match(item, new RegExp(`<link>${SITE}/how-to/[^<]+/</link>`));
    }
    assert.equal(new Date(items[0].match(/<pubDate>([^<]+)</)[1]).toISOString().slice(0, 10), '2026-10-28');
    assert.equal(
      new Date(items.at(-1).match(/<pubDate>([^<]+)</)[1]).toISOString().slice(0, 10),
      '2026-01-01',
    );

    // La landing non e' una voce del feed
    assert.ok(!rssOrder.includes('index'));
    assert.ok(!rss.includes(`<link>${SITE}/how-to/</link>`), 'landing excluded from feed');

    // Sitemap
    const sitemap = readdirSync(dist)
      .filter((f) => /^sitemap-\d+\.xml$/.test(f))
      .map((f) => read(f))
      .join('\n');
    assert.ok(sitemap.includes(`<loc>${SITE}/how-to/</loc>`), '/how-to/ in sitemap');

    // Alternate: solo sulle rotte how-to, mai nel head globale
    const alt = `<link rel="alternate" type="application/rss+xml" title="XrmGhost how-to guides" href="${SITE}/how-to/rss.xml"`;
    const hasAlt = (html) => html.replace(/\s+/g, ' ').includes(alt) ||
      (/rel="alternate"/.test(html) && html.includes(`href="${SITE}/how-to/rss.xml"`));
    assert.ok(hasAlt(landing), 'alternate on /how-to/');
    assert.ok(hasAlt(read('how-to/first-plugin-local-run/index.html')), 'alternate on how-to/*');
    assert.ok(!read('faq/index.html').includes('/how-to/rss.xml'), 'no alternate on /faq/');
    assert.ok(!read('overview/index.html').includes('/how-to/rss.xml'), 'no alternate on /overview/');
    assert.ok(!read('how-to/rss.xml').includes('rel="alternate"'));
    // Il head globale resta intatto
    assert.ok(landing.includes('application/ld+json'));
    assert.ok(landing.includes('api.pirsch.io/pa.js'));

    // Sidebar: /how-to/ compare una sola volta nel gruppo
    const sidebarLinks = landing.match(/<a href="\/how-to\/"/g) ?? [];
    assert.equal(sidebarLinks.length, 1, 'single /how-to/ sidebar entry');
  } finally {
    removeFixtures();
  }
});

test('una voce how-to senza data fa fallire la build nominando il file', () => {
  try {
    writeFixture(NODATE, null);
    const r = build();
    assert.notEqual(r.status, 0, 'build must fail');
    assert.ok(`${r.stdout}${r.stderr}`.includes(NODATE), 'error names the fixture');
  } finally {
    removeFixtures();
  }
});

test('nessuna fixture resta nel contenuto', () => {
  removeFixtures();
  for (const id of [NEWEST, OLDEST, NODATE]) assert.ok(!existsSync(fixtureFile(id)), id);
});
