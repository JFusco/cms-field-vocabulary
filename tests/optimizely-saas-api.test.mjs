import assert from 'node:assert/strict';
import test from 'node:test';
import { compileCatalog } from '../scripts/lib/catalog.mjs';
import { loadRuntime } from './helpers.mjs';

const PROFILE_ID = 'optimizely-saas.cms-api-v1';
const DATA_TYPES = { sourceId: 'optimizely-saas.content-types', locator: 'Properties > Data types' };
const VALIDATION_FIELDS = { sourceId: 'optimizely-saas.content-types', locator: 'Properties > Validation fields' };
const PROPERTY_TYPES = { sourceId: 'optimizely-saas.content-types', locator: 'Property types' };
const RELEASE_NOTES = 'optimizely-saas.release-notes-index';
const RICH_TEXT_MEDIA = 'November 10 > Insert images and video from CMS or Optimizely DAM in rich text';
const RICH_TEXT_CONFIGURATIONS = 'November 18 > Create your own rich-text editor configurations';
const FORMAT = { sourceId: 'optimizely-saas.content-types', locator: 'Properties > format' };
const NESTING_LIMITS = { sourceId: 'optimizely-saas.content-types', locator: 'Nesting limits' };
const STRING_FIX = { sourceId: RELEASE_NOTES, locator: 'November 18 > Bug fixes' };
const SAVE_RULE = /whole item is checked on every save.*unrelated edit.*400 Bad Request with the path of the field/;

async function profile(id = PROFILE_ID) {
  const compiled = await compileCatalog();
  const result = compiled.profiles.find((candidate) => candidate.id === id);
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
  assert.deepEqual(content.claims.editorBehavior.evidence, [VALIDATION_FIELDS, DATA_TYPES, NESTING_LIMITS]);
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

test('CMS SaaS API rich text documents media and editor configurations without a delivery shape', async () => {
  const apiProfile = await profile();
  assert.equal(apiProfile.fields.length, 14);
  const richText = field(apiProfile, 'richText');
  assert.deepEqual(richText.claims.valueShape, {
    status: 'documented',
    value: { kind: 'rich-text', nullable: true },
    evidence: [PROPERTY_TYPES],
  });
  assert.match(richText.claims.editorBehavior.value, /pick an Optimizely DAM asset when DAM is configured/);
  assert.match(richText.claims.editorBehavior.value, /named TinyMCE configurations/);
  assert.match(richText.claims.editorBehavior.value, /Minimal, Standard and Expanded configurations cannot be edited or deleted/);
  assert.match(richText.claims.editorBehavior.value, /configuration in use cannot be deleted/);
  assert.deepEqual(richText.claims.editorBehavior.evidence, [
    PROPERTY_TYPES,
    { sourceId: RELEASE_NOTES, locator: RICH_TEXT_MEDIA },
    { sourceId: RELEASE_NOTES, locator: RICH_TEXT_CONFIGURATIONS },
  ]);
  assert.match(richText.claims.storageShape.value, /cms:\/\/content reference in an img src or a video source src/);
  assert.deepEqual(richText.claims.storageShape.evidence, [
    PROPERTY_TYPES,
    { sourceId: RELEASE_NOTES, locator: `${RICH_TEXT_MEDIA} > DAM assets in rich text` },
    { sourceId: RELEASE_NOTES, locator: `${RICH_TEXT_MEDIA} > Optimizely Graph and the Content Management API` },
  ]);
  assert.deepEqual(richText.claims.deliveryShape, { status: 'undocumented', value: null, evidence: [] });

  for (const sdkProfileId of ['optimizely-saas.sdk-2', 'optimizely-saas.sdk-3', 'optimizely-saas.sdk-3-1']) {
    const sdkRichText = field(await profile(sdkProfileId), 'richText');
    const citedSources = Object.values(sdkRichText.claims).flatMap((claim) => claim.evidence.map(({ sourceId }) => sourceId));
    assert.ok(!citedSources.includes(RELEASE_NOTES), sdkProfileId);
  }
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
  assert.deepEqual(composition.claims.editorBehavior.evidence, [FORMAT, VALIDATION_FIELDS, DATA_TYPES, NESTING_LIMITS]);
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

test('CMS SaaS API string editor documents length and pattern constraints and the minimum-length fix', async () => {
  const string = field(await profile(), 'string');
  assert.match(string.claims.editorBehavior.value, /^Text editor refined by format and constraints: minLength and maxLength bound the character length, and pattern requires a regular-expression match\./);
  assert.match(string.claims.editorBehavior.value, /minimum but no maximum length accepts text of any length instead of being capped at 255 characters/);
  assert.match(string.claims.editorBehavior.value, /Min Length field/);
  assert.match(string.claims.editorBehavior.value, /keeps a minimum length set through the REST API/);
  assert.deepEqual(string.claims.editorBehavior.evidence, [PROPERTY_TYPES, VALIDATION_FIELDS, STRING_FIX]);
  assert.deepEqual(string.claims.valueShape, { status: 'documented', value: { kind: 'string', nullable: true }, evidence: [PROPERTY_TYPES] });
  assert.deepEqual(string.claims.storageShape, { status: 'documented', value: 'String.', evidence: [PROPERTY_TYPES] });
  assert.deepEqual(string.claims.deliveryShape, { status: 'undocumented', value: null, evidence: [] });
});

test('CMS SaaS API nesting limits are cited per field without changing shapes or the request-body limit', async () => {
  const apiProfile = await profile();
  assert.equal(apiProfile.fields.length, 14);
  const expected = {
    json: { pattern: /Values can be nested at most eight levels deep\./, evidence: [PROPERTY_TYPES, DATA_TYPES, NESTING_LIMITS] },
    content: { pattern: /Nested blocks are limited to eight levels.*shared block or shared section counts as one level/, evidence: [VALIDATION_FIELDS, DATA_TYPES, NESTING_LIMITS] },
    component: { pattern: /^Component selection requiring contentType\. Nested blocks are limited to eight levels/, evidence: [PROPERTY_TYPES, NESTING_LIMITS] },
    array: { pattern: /Arrays of components count toward the eight-level limit on nested blocks/, evidence: [PROPERTY_TYPES, NESTING_LIMITS] },
    composition: { pattern: /can be nested at most four levels deep/, evidence: [FORMAT, VALIDATION_FIELDS, DATA_TYPES, NESTING_LIMITS] },
  };
  for (const [nativeToken, { pattern, evidence }] of Object.entries(expected)) {
    const candidate = field(apiProfile, nativeToken);
    assert.match(candidate.claims.editorBehavior.value, pattern, nativeToken);
    assert.match(candidate.claims.editorBehavior.value, SAVE_RULE, nativeToken);
    assert.doesNotMatch(candidate.claims.editorBehavior.value, /\b64\b/, nativeToken);
    assert.deepEqual(candidate.claims.editorBehavior.evidence, evidence, nativeToken);
  }
  assert.deepEqual(field(apiProfile, 'json').claims.storageShape, { status: 'documented', value: 'JSON value.', evidence: [PROPERTY_TYPES] });
  assert.deepEqual(field(apiProfile, 'array').claims.valueShape, {
    status: 'documented',
    value: { kind: 'array', nullable: true, itemKind: 'property-defined' },
    evidence: [PROPERTY_TYPES],
  });
  assert.deepEqual(field(apiProfile, 'component').claims.storageShape, { status: 'documented', value: 'Embedded component value.', evidence: [PROPERTY_TYPES] });
  for (const nativeToken of ['json', 'array', 'component']) {
    assert.deepEqual(field(apiProfile, nativeToken).claims.deliveryShape, { status: 'undocumented', value: null, evidence: [] }, nativeToken);
  }
  for (const sdkProfileId of ['optimizely-saas.sdk-2', 'optimizely-saas.sdk-3', 'optimizely-saas.sdk-3-1']) {
    const cited = (await profile(sdkProfileId)).fields.flatMap((candidate) => Object.values(candidate.claims).flatMap((claim) => claim.evidence));
    assert.ok(!cited.some(({ locator }) => locator === NESTING_LIMITS.locator || locator === STRING_FIX.locator), sdkProfileId);
  }
});
