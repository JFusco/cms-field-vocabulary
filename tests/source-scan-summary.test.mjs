import assert from 'node:assert/strict';
import test from 'node:test';
import { renderScanSummary } from '../scripts/source-scan-summary.mjs';

test('scan summary shows source identity deltas and lets the full report supersede the index report', () => {
  const lock = { sources: [{ sourceId: 'vendor.release-index', identities: ['v1'] }] };
  const manifest = {
    sources: [{ id: 'vendor.release-index', role: 'release-index', url: 'https://example.com/releases', locator: 'versions', profiles: ['vendor.sdk1'] }],
  };
  const index = { mode: 'index', observations: [{ sourceId: 'vendor.release-index', classification: 'unreachable', note: 'timeout' }] };
  const full = {
    mode: 'full',
    observations: [{ sourceId: 'vendor.release-index', classification: 'version-changing', identities: ['v2'], fragmentSha256: 'new-digest' }],
  };
  const summary = renderScanSummary([index, full], lock, manifest, 'https://example.com/run');
  assert.match(summary, /Added identities \(1\): `v2`/);
  assert.match(summary, /Removed identities \(1\): `v1`/);
  assert.match(summary, /Observation fingerprint: `new-digest`/);
  assert.doesNotMatch(summary, /timeout/);
});
