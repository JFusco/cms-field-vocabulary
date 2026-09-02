import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  classifyObservation,
  discoverObservedTokens,
  fetchOfficialSource,
  mapWithConcurrency,
  normalizeDocument,
  observeSource,
  requiresAttention,
} from '../scripts/source-scan.mjs';
import { canonicalJson } from './helpers.mjs';

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
