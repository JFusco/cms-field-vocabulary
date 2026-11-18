import assert from 'node:assert/strict';
import test from 'node:test';
import { compileCatalog } from '../scripts/lib/catalog.mjs';
import { loadRuntime } from './helpers.mjs';

const PROFILE_ID = 'optimizely-saas.cms-api-v1';
const DATA_TYPES = { sourceId: 'optimizely-saas.content-types', locator: 'Properties > Data types' };
const VALIDATION_FIELDS = { sourceId: 'optimizely-saas.content-types', locator: 'Properties > Validation fields' };
const FORMAT = { sourceId: 'optimizely-saas.content-types', locator: 'Properties > format' };

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

test('CMS SaaS API composition documents a Visual Builder layout without asserting a wire shape', async () => {
  const candidateProfile = await profile();
  const composition = field(candidateProfile, 'composition');
  assert.equal(composition.canonicalId, `${PROFILE_ID}.composition`);
  for (const claim of ['valueShape', 'storageShape', 'deliveryShape']) {
    assert.deepEqual(composition.claims[claim], { status: 'undocumented', value: null, evidence: [] }, claim);
  }
  assert.deepEqual(composition.renderingOperations, []);
  assert.deepEqual(composition.claims.typicalUse, {
    status: 'documented',
    value: 'Visual Builder layout with the content it contains, supported only on content types with the _experience base type and not as an array item.',
    evidence: [DATA_TYPES],
  });
  assert.match(composition.claims.editorBehavior.value, /^format names the layout type to use\./);
  assert.match(composition.claims.editorBehavior.value, /restrictedTypes takes priority over allowedTypes/);
  assert.deepEqual(composition.claims.editorBehavior.evidence, [FORMAT, VALIDATION_FIELDS, DATA_TYPES]);
  // The built-in content-type composition setting also covers section types; the property does not.
  assert.doesNotMatch(JSON.stringify(composition.claims), /section/i);
  assert.notDeepEqual(composition.claims, field(candidateProfile, 'content').claims);
  assert.notDeepEqual(composition.claims, field(candidateProfile, 'component').claims);
});

test('CMS SaaS API resolver selects composition with no value shape or operations', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: PROFILE_ID,
    fieldIds: [`${PROFILE_ID}.composition`],
    agentProfile: 'react-nextjs',
  });
  assert.deepEqual(selected.contracts.map(({ nativeToken }) => nativeToken), ['composition']);
  assert.equal(selected.contracts[0].valueShape, null);
  assert.deepEqual(selected.contracts[0].operations, []);
});
