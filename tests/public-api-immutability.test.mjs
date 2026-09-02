import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRuntime } from './helpers.mjs';

test('public catalog is deeply frozen and lookup results are detached copies', async () => {
  const {
    catalog,
    findFieldFact,
    getFieldFact,
    getProfile,
    listFieldFacts,
  } = await loadRuntime();
  assert.equal(Object.isFrozen(catalog), true);
  assert.equal(Object.isFrozen(catalog.profiles), true);
  assert.equal(Object.isFrozen(catalog.profiles[0].fields[0].claims), true);
  assert.throws(() => {
    catalog.profiles[0].fields[0].nativeToken = 'mutated';
  }, TypeError);

  const profile = getProfile('optimizely-saas.sdk-2');
  const originalProfileToken = profile.fields[0].nativeToken;
  profile.fields[0].nativeToken = 'mutated profile copy';
  assert.equal(getProfile(profile.id).fields[0].nativeToken, originalProfileToken);

  const fieldId = 'optimizely-saas.sdk-2.richText';
  const field = getFieldFact(profile.id, fieldId);
  const originalKind = field.claims.valueShape.value.kind;
  field.claims.valueShape.value.kind = 'unknown';
  field.renderingOperations[0].prohibitionCodes.push('invent-fallback-value');
  const freshField = getFieldFact(profile.id, fieldId);
  assert.equal(freshField.claims.valueShape.value.kind, originalKind);
  assert.equal(freshField.renderingOperations[0].prohibitionCodes.includes('invent-fallback-value'), false);

  const listed = listFieldFacts(profile.id);
  listed[0].nativeToken = 'mutated list copy';
  assert.equal(listFieldFacts(profile.id)[0].nativeToken, originalProfileToken);

  const found = findFieldFact(fieldId);
  found.field.nativeToken = 'mutated find copy';
  found.profile.product = 'mutated product';
  assert.equal(findFieldFact(fieldId).field.nativeToken, 'richText');
  assert.notEqual(findFieldFact(fieldId).profile.product, 'mutated product');
});

test('mutating one resolved contract cannot alter later resolutions or canonical facts', async () => {
  const { getFieldFact, resolveFieldContracts } = await loadRuntime();
  const input = {
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: ['optimizely-saas.sdk-2.contentReference'],
    agentProfile: 'react-nextjs',
    renderingSelections: [{
      fieldId: 'optimizely-saas.sdk-2.contentReference',
      discriminator: 'content-reference-usage',
      value: 'media',
    }],
  };
  const first = resolveFieldContracts(input);
  first.contracts[0].valueShape.kind = 'unknown';
  first.contracts[0].operations[0].props.content = '$mutated';
  first.rendererBindings['optimizely.cms-sdk.damAssets'] = 'mutated#import';

  const second = resolveFieldContracts(input);
  assert.notEqual(second.contracts[0].valueShape.kind, 'unknown');
  assert.equal(second.contracts[0].operations[0].props.content, '$content');
  assert.equal(
    second.rendererBindings['optimizely.cms-sdk.damAssets'],
    '@optimizely/cms-sdk#damAssets',
  );
  assert.equal(
    getFieldFact(input.profileId, input.fieldIds[0]).renderingOperations.some(
      (operation) => operation.props?.content === '$mutated',
    ),
    false,
  );
});
