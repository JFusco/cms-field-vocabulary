import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  classifyObservation,
  discoverObservedTokens,
  extractItemText,
  fetchOfficialSource,
  mapWithConcurrency,
  normalizeDocument,
  observeSource,
  requiresAttention,
  validateItemTextConfiguration,
} from '../scripts/source-scan.mjs';
import { canonicalJson, readJson } from './helpers.mjs';

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function observation(overrides = {}) {
  return {
    sourceId: 'vendor.source',
    reviewStatus: 'reviewed',
    rawSha256: hash('current raw content'),
    normalizedSha256: hash('current normalized content'),
    fragmentSha256: hash('current normalized content'),
    requiredTokenSetSha256: hash(canonicalJson(['A', 'B'])),
    requiredTokens: ['A', 'B'],
    observedTokenSetSha256: null,
    observedTokens: null,
    missingRequiredTokens: [],
    missingObservedTokens: [],
    ...overrides,
  };
}

function locked(overrides = {}) {
  return {
    sourceId: 'vendor.source',
    reviewStatus: 'reviewed',
    rawSha256: hash('current raw content'),
    normalizedSha256: hash('current normalized content'),
    fragmentSha256: hash('current normalized content'),
    requiredTokenSetSha256: hash(canonicalJson(['A', 'B'])),
    requiredTokens: ['A', 'B'],
    observedTokenSetSha256: null,
    observedTokens: null,
    ...overrides,
  };
}

function discoverySource(overrides = {}) {
  return {
    id: 'vendor.source',
    role: 'enumeration',
    extract: {
      tokens: ['A', 'B'],
      tokenDiscovery: {
        maximumTokens: 20,
        regions: [
          {
            id: 'field-types',
            startPattern: '<h2>Field types</h2>',
            endPattern: '<h2>',
            itemPattern: '<code>([^<]+)</code>',
            itemCapture: 1,
          },
        ],
      },
    },
    ...overrides,
  };
}

test('document normalization removes volatile markup without altering claim text', () => {
  const first = normalizeDocument(`
    <style>.generated { color: red }</style>
    <main nonce="one" data-request-id="abc" data-cfemail="volatile-one">A &amp; B</main>
    <script>window.generated = 1</script>
  `);
  const second = normalizeDocument(`
    <main data-timestamp='2026-09-01' nonce="two" data-cfemail="volatile-two"> A &amp; B </main>
  `);
  assert.equal(first, '<main >A & B</main>');
  assert.equal(second, '<main > A & B </main>');
  assert.equal(normalizeDocument('A   &amp;   B'), 'A & B');
});

test('source scan classification covers unchanged and unreachable observations first', () => {
  assert.equal(classifyObservation(observation(), locked(), 'enumeration'), 'unchanged');
  assert.equal(classifyObservation(observation({ reviewStatus: 'unreachable' }), locked(), 'enumeration'), 'unreachable');
});

test('missing required tokens are enumeration-changing regardless of source role or lock state', () => {
  const missing = observation({ missingRequiredTokens: ['B'] });
  assert.equal(classifyObservation(missing, locked(), 'enumeration'), 'enumeration-changing');
  assert.equal(classifyObservation(missing, undefined, 'release-index'), 'enumeration-changing');
});

test('a newly observed source is version-changing', () => {
  assert.equal(classifyObservation(observation(), undefined, 'enumeration'), 'version-changing');
});

test('content drift is claim-changing except on a release-index source', () => {
  const changed = observation({
    normalizedSha256: hash('changed claim text'),
    fragmentSha256: hash('changed claim text'),
  });
  assert.equal(classifyObservation(changed, locked(), { role: 'enumeration', extract: { tokens: ['A', 'B'] } }), 'claim-changing');
  assert.equal(classifyObservation(changed, locked({ reviewStatus: 'reviewed-manual' }), 'delivery'), 'claim-changing');
  assert.equal(classifyObservation(changed, locked(), 'release-index'), 'version-changing');
});

test('independently observed token additions and removals are enumeration-changing', () => {
  const baseline = locked({
    observedTokenSetSha256: hash(canonicalJson(['A', 'B'])),
    observedTokens: ['A', 'B'],
  });
  const added = observation({
    observedTokenSetSha256: hash(canonicalJson(['A', 'B', 'C'])),
    observedTokens: ['A', 'B', 'C'],
  });
  const removed = observation({
    observedTokenSetSha256: hash(canonicalJson(['A'])),
    observedTokens: ['A'],
  });
  assert.equal(classifyObservation(added, baseline, discoverySource()), 'enumeration-changing');
  assert.equal(classifyObservation(removed, baseline, discoverySource()), 'enumeration-changing');
});

test('claim drift is not misclassified when the independent enumeration is unchanged', () => {
  const observedTokenSetSha256 = hash(canonicalJson(['A', 'B']));
  const changed = observation({
    normalizedSha256: hash('changed claim text'),
    fragmentSha256: hash('changed claim text'),
    observedTokenSetSha256,
    observedTokens: ['A', 'B'],
  });
  const baseline = locked({ observedTokenSetSha256, observedTokens: ['A', 'B'] });
  assert.equal(classifyObservation(changed, baseline, discoverySource()), 'claim-changing');
});

test('token discovery is structurally bounded and independent of required tokens', () => {
  const source = discoverySource();
  const normalized = [
    '<code>Outside</code>',
    '<h2>Field types</h2>',
    '<p><code>A</code> <code>B</code> <code>C</code></p>',
    '<h2>Other section</h2>',
    '<code>AlsoOutside</code>',
  ].join(' ');
  assert.deepEqual(discoverObservedTokens(source, normalized), ['A', 'B', 'C']);
});

test('token discovery rejects circular patterns that embed approved tokens', () => {
  const source = discoverySource();
  source.extract.tokenDiscovery.regions[0].itemPattern = '<code>(A|B)</code>';
  assert.throws(() => discoverObservedTokens(source, '<code>A</code>'), /must not embed required token A/);
});

test('token discovery extraction failures require enumeration review', () => {
  const observedTokenSetSha256 = hash(canonicalJson(['A', 'B']));
  const failed = observation({
    observedTokenSetSha256: null,
    observedTokens: null,
    enumerationExtractionError: 'field type section moved',
  });
  const baseline = locked({ observedTokenSetSha256, observedTokens: ['A', 'B'] });
  assert.equal(classifyObservation(failed, baseline, discoverySource()), 'enumeration-changing');
});

test('concurrent source mapping preserves input order and honors the concurrency bound', async () => {
  let active = 0;
  let peak = 0;
  const values = [5, 4, 3, 2, 1];
  const output = await mapWithConcurrency(values, 2, async (value) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, value));
    active -= 1;
    return value * 2;
  });
  assert.deepEqual(output, [10, 8, 6, 4, 2]);
  assert.ok(peak <= 2);
  assert.ok(peak > 1);
});

test('source token observation is exact and case-sensitive', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => new Response('<main>RichText ResourceLink</main>', { status: 200 });
  const result = await observeSource({
    id: 'vendor.source',
    url: 'https://docs.vendor.example/field-types',
    allowedHosts: ['docs.vendor.example'],
    extract: { tokens: ['RichText', 'richText', 'ResourceLink'] },
  });
  assert.equal(result.reviewStatus, 'reviewed');
  assert.deepEqual(result.missingRequiredTokens, ['richText']);
});

test('source fetching refuses redirects outside each source allowlist', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, {
      status: 302,
      headers: { location: 'https://untrusted.example/field-types' },
    });
  };
  await assert.rejects(
    fetchOfficialSource({
      url: 'https://docs.vendor.example/field-types',
      allowedHosts: ['docs.vendor.example'],
    }),
    /Redirect escaped official host allowlist: untrusted\.example/,
  );
  assert.equal(calls, 1);
});

test('Optimizely release indexes identify dated entries and reject pages without them', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const manifest = await readJson('sources/official-sources.json');
  const source = manifest.sources.find((entry) => entry.id === 'optimizely-paas.cms13-release-notes-index');
  globalThis.fetch = async () => new Response([
    '<h1>2026 Optimizely CMS 13 release notes</h1>',
    '<h2 id="release-highlights" class="ab-h2">Release highlights</h2>',
    '<h2 id="august-27" class="ab-h2">August 27</h2>',
    '<h3 class="ab-h3" id="october-271350">October 27—13.5.0</h3>',
    '<a href="/cms-13/release-notes#october-261342">October 26</a>',
  ].join(''), { status: 200 });
  const listed = await observeSource(source);
  assert.equal(listed.reviewStatus, 'reviewed');
  assert.deepEqual(listed.identities, ['august-27', 'october-271350']);

  globalThis.fetch = async () => new Response('<h1>Sign in</h1><h2 id="sign-in-to-optimizely">Sign in to Optimizely</h2>', { status: 200 });
  const signIn = await observeSource(source);
  assert.equal(signIn.reviewStatus, 'unreachable');
  assert.match(signIn.note, /no version or entry identities/);
  assert.equal(classifyObservation(signIn, locked(), source), 'unreachable');
});

test('release indexes reject redirects to a different product document', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const manifest = await readJson('sources/official-sources.json');
  const source = manifest.sources.find((entry) => entry.id === 'optimizely-saas.release-notes-index');
  const page = '<h2 id="october-9" class="ab-h2">October 9</h2>';
  const redirectTo = (location) => async (url) => (String(url) === source.url
    ? new Response(null, { status: 301, headers: { location } })
    : new Response(page, { status: 200 }));

  globalThis.fetch = redirectTo('https://docs.optimizely.com/cms-12/release-notes');
  const wrongProduct = await observeSource(source);
  assert.equal(wrongProduct.reviewStatus, 'unreachable');
  assert.equal(wrongProduct.url, source.url);
  assert.deepEqual(wrongProduct.identities, []);
  assert.match(wrongProduct.note, /redirected to a different document: https:\/\/docs\.optimizely\.com\/cms-12\/release-notes/);
  assert.equal(classifyObservation(wrongProduct, locked(), source), 'unreachable');

  globalThis.fetch = redirectTo(`${source.url}/?lang=en`);
  const sameDocument = await observeSource(source);
  assert.equal(sameDocument.reviewStatus, 'reviewed');
  assert.deepEqual(sameDocument.identities, ['october-9']);
});

test('a source present in the reviewed lock but removed from the manifest is classified as removed', () => {
  assert.equal(classifyObservation(observation({ removed: true }), locked(), 'enumeration'), 'removed');
});

test('a raw-only document change outside normalized claim content is classified as cosmetic', () => {
  const rawOnlyChange = observation({ rawSha256: hash('changed raw wrapper') });
  assert.equal(classifyObservation(rawOnlyChange, locked(), 'delivery'), 'cosmetic');
});

test('only semantic, enumeration, version, reachability, or removal drift requires attention', () => {
  assert.equal(requiresAttention('unchanged'), false);
  assert.equal(requiresAttention('cosmetic'), false);
  for (const classification of [
    'claim-changing',
    'enumeration-changing',
    'version-changing',
    'unreachable',
    'removed',
  ]) {
    assert.equal(requiresAttention(classification), true);
  }
});

function rssItem({ link, title, pubDate, description }) {
  return `<item><title><![CDATA[${title}]]></title><description><![CDATA[${description}]]></description><link>${link}</link><pubDate>${pubDate}</pubDate></item>`;
}

function rssFeed(items) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>',
    '<title><![CDATA[Contentstack Changelog]]></title>',
    '<link>https://www.contentstack.com/docs/changelog/</link>',
    ...items.map(rssItem),
    '</channel></rss>',
  ].join('\n');
}

const visualBuilderEntry = {
  link: 'https://www.contentstack.com/docs/changelog/?cs_source=rss#manage-entries-directly-from-the-visual-builder-form-panel',
  title: 'Manage Entries Directly from the Visual Builder Form Panel',
  pubDate: 'Tue, 03 Nov 2026 00:00:00 GMT',
  description: '<p><strong>New Features</strong></p><ul><li>Edit <span class="code">reference</span> fields &amp; entries in the form panel.</li></ul>',
};
const webhookEntry = {
  link: 'https://www.contentstack.com/docs/changelog/?cs_source=rss#webhook-rate-limit',
  title: 'Webhook Rate Limit',
  pubDate: 'Mon, 02 Nov 2026 00:00:00 GMT',
  description: '<p>Webhooks are limited to 10 requests per second.</p>',
};

async function contentstackSource() {
  const manifest = await readJson('sources/official-sources.json');
  return manifest.sources.find((entry) => entry.id === 'contentstack.product-changelog-index');
}

test('Contentstack changelog scans retain each RSS item title, date and description with its identity', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const source = await contentstackSource();
  globalThis.fetch = async () => new Response(rssFeed([visualBuilderEntry, webhookEntry]), { status: 200 });
  const result = await observeSource(source);
  assert.equal(result.reviewStatus, 'reviewed');
  assert.deepEqual(result.items, [
    {
      identity: visualBuilderEntry.link,
      title: 'Manage Entries Directly from the Visual Builder Form Panel',
      publishedAt: 'Tue, 03 Nov 2026 00:00:00 GMT',
      description: 'New Features Edit reference fields & entries in the form panel.',
      truncated: false,
    },
    {
      identity: webhookEntry.link,
      title: 'Webhook Rate Limit',
      publishedAt: 'Mon, 02 Nov 2026 00:00:00 GMT',
      description: 'Webhooks are limited to 10 requests per second.',
      truncated: false,
    },
  ]);
  assert.equal(result.identities.length, 3);
  assert.equal(result.fragmentSha256, hash(canonicalJson(result.identities)), 'the fingerprint still covers identities only');
});

test('retained item text is bounded and read only for links on the registered allowed host', async () => {
  const source = await contentstackSource();
  const long = { ...webhookEntry, description: `<p>${'Webhook detail. '.repeat(400)}</p>` };
  const offHost = { ...visualBuilderEntry, link: 'https://untrusted.example/changelog#entry' };
  const escaped = rssFeed([long, offHost]).replace(
    '<![CDATA[Webhook Rate Limit]]>',
    '&lt;strong&gt;Webhook&lt;/strong&gt; Rate &amp;amp; Limit',
  );
  const items = extractItemText(source, escaped);
  assert.deepEqual(items.map((item) => item.identity), [webhookEntry.link]);
  assert.equal(items[0].title, 'Webhook Rate & Limit');
  assert.equal(items[0].truncated, true);
  assert.ok([...items[0].description].length <= source.itemText.maximumCharacters);
  assert.ok(items[0].description.startsWith('Webhook detail. Webhook detail.'));
});

test('item text requires an opted-in release index and is absent elsewhere', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const source = await contentstackSource();
  assert.throws(
    () => validateItemTextConfiguration({ ...source, role: 'editor' }),
    /itemText requires a release-index source with an identityPattern/,
  );
  globalThis.fetch = async () => new Response(rssFeed([webhookEntry]), { status: 200 });
  const { itemText, ...withoutItemText } = source;
  assert.ok(itemText);
  assert.equal('items' in await observeSource(withoutItemText), false);

  globalThis.fetch = async () => new Response(null, { status: 302, headers: { location: 'https://untrusted.example/rss.xml' } });
  const escapedHost = await observeSource(source);
  assert.equal(escapedHost.reviewStatus, 'unreachable');
  assert.deepEqual(escapedHost.items, []);
});

test('an identity withdrawn from a later feed keeps its earlier retained text readable', async (t) => {
  const originalFetch = globalThis.fetch;
  const directory = await mkdtemp(path.join(os.tmpdir(), 'source-scan-items-'));
  t.after(async () => {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  });
  const source = await contentstackSource();
  globalThis.fetch = async () => new Response(rssFeed([visualBuilderEntry, webhookEntry]), { status: 200 });
  const earlier = await observeSource(source);
  const earlierReport = path.join(directory, 'index-earlier.json');
  await writeFile(earlierReport, canonicalJson({ schemaVersion: 2, mode: 'index', observations: [earlier] }));

  globalThis.fetch = async () => new Response(rssFeed([webhookEntry]), { status: 200 });
  const later = await observeSource(source);
  assert.equal(later.identities.includes(visualBuilderEntry.link), false);
  assert.deepEqual(later.items.map((item) => item.identity), [webhookEntry.link]);
  assert.equal(classifyObservation(later, locked({ fragmentSha256: earlier.fragmentSha256 }), source), 'version-changing');

  const retained = JSON.parse(await readFile(earlierReport, 'utf8')).observations[0].items
    .find((item) => item.identity === visualBuilderEntry.link);
  assert.equal(retained.title, 'Manage Entries Directly from the Visual Builder Form Panel');
  assert.equal(retained.publishedAt, 'Tue, 03 Nov 2026 00:00:00 GMT');
  assert.equal(retained.description, 'New Features Edit reference fields & entries in the form panel.');
});
