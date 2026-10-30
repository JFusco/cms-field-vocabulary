import assert from 'node:assert/strict';
import test from 'node:test';
import { compileCatalog } from '../scripts/lib/catalog.mjs';
import { loadRuntime } from './helpers.mjs';

const PROFILE_ID = 'optimizely-saas.cms-api-v1';
const DATA_TYPES = { sourceId: 'optimizely-saas.content-types', locator: 'Properties > Data types' };
const VALIDATION_FIELDS = { sourceId: 'optimizely-saas.content-types', locator: 'Properties > Validation fields' };

async function profile() {
  const compiled = await compileCatalog();
  const result = compiled.profiles.find((candidate) => candidate.id === PROFILE_ID);
  assert.ok(result);
  return result;
}

function field(candidateProfile, nativeToken) {
  const result = candidateProfile.fields.find((candidate) => candidate.nativeToken === nativeToken);
  assert.ok(result, nativeToken);
  return result;
}

test('CMS SaaS API URL values are documented strings with a direct operation', async () => {
  const url = field(await profile(), 'url');
  assert.deepEqual(url.claims.valueShape, {
    status: 'documented',
    value: { kind: 'string', nullable: true },
    evidence: [DATA_TYPES],
  });
  assert.deepEqual(url.renderingOperations.map(({ operation, authority, prohibitionCodes }) => ({
    operation,
    authority,
    prohibitionCodes,
  })), [{ operation: 'direct', authority: 'contract-derived', prohibitionCodes: [] }]);
});

test('CMS SaaS API Content documents composition without asserting a wire shape', async () => {
  const content = field(await profile(), 'content');
  for (const claim of ['valueShape', 'storageShape', 'deliveryShape']) {
    assert.deepEqual(content.claims[claim], { status: 'undocumented', value: null, evidence: [] }, claim);
  }
  assert.deepEqual(content.renderingOperations, []);
  assert.deepEqual(content.claims.typicalUse, {
    status: 'documented',
    value: 'Composition of another content item, inline or referenced.',
    evidence: [DATA_TYPES],
  });
  assert.match(content.claims.editorBehavior.value, /restrictedTypes takes priority over allowedTypes/);
  assert.deepEqual(content.claims.editorBehavior.evidence, [VALIDATION_FIELDS, DATA_TYPES]);
});

test('CMS SaaS API resolver selection reflects the corrected URL and Content contracts', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: PROFILE_ID,
    fieldIds: [`${PROFILE_ID}.url`, `${PROFILE_ID}.content`],
    agentProfile: 'react-nextjs',
  });
  const byToken = new Map(selected.contracts.map((contract) => [contract.nativeToken, contract]));
  assert.equal(byToken.get('content').valueShape, null);
  assert.deepEqual(byToken.get('content').operations, []);
  assert.deepEqual(byToken.get('url').valueShape, { kind: 'string', nullable: true });
  assert.deepEqual(byToken.get('url').operations.map(({ operation }) => operation), ['direct']);
});
