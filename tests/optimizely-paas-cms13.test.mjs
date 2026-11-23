import assert from 'node:assert/strict';
import test from 'node:test';
import { compileCatalog } from '../scripts/lib/catalog.mjs';

async function profile() {
  const compiled = await compileCatalog();
  const result = compiled.profiles.find((candidate) => candidate.id === 'optimizely-paas.cms13-model');
  assert.ok(result);
  return result;
}

function field(candidateProfile, nativeToken) {
  const result = candidateProfile.fields.find((candidate) => candidate.nativeToken === nativeToken);
  assert.ok(result, nativeToken);
  return result;
}

test('CMS 13 model vocabulary excludes obsolete and editor-only tokens', async () => {
  const candidate = await profile();
  assert.deepEqual(candidate.fields.map(({ nativeToken }) => nativeToken), [
    'Blob',
    'Boolean',
    'ContentArea',
    'ContentReference',
    'ContentReference<T>',
    'ContentReferenceList',
    'DateTime',
    'Double',
    'Int',
    'LinkItem',
    'LinkItemCollection',
    'PageType',
    'String',
    'Url',
    'XhtmlString',
  ]);
  for (const excluded of ['PageReference', 'SelectOne', 'SelectMany', 'AutoSuggestion']) {
    assert.equal(candidate.fields.some(({ nativeToken }) => nativeToken === excluded), false, excluded);
  }
});

test('CMS 13 rendering implications preserve value shapes and official constraints', async () => {
  const candidate = await profile();
  const richText = field(candidate, 'XhtmlString');
  assert.equal(richText.claims.valueShape.value.kind, 'rich-text');
  assert.ok(richText.renderingOperations[0].prohibitionCodes.includes('coerce-rich-text-to-plain-string'));
  assert.equal(richText.renderingOperations[0].nullHandling, 'preserve');

  assert.deepEqual(field(candidate, 'String').renderingOperations[0].constraintKeys, ['StringLength']);
  for (const token of ['Int', 'DateTime', 'Double']) {
    assert.deepEqual(field(candidate, token).renderingOperations[0].constraintKeys, ['Range']);
  }
  for (const token of ['ContentArea', 'ContentReference', 'ContentReference<T>', 'ContentReferenceList']) {
    assert.deepEqual(field(candidate, token).renderingOperations[0].constraintKeys, ['AllowedTypes']);
  }
  assert.equal(field(candidate, 'Url').claims.valueShape.value.kind, 'object');
  assert.ok(field(candidate, 'LinkItem').renderingOperations[0].prohibitionCodes.includes('flatten-link-object'));
});

test('CMS 13 model claims do not absorb storage or delivery surfaces', async () => {
  const candidate = await profile();
  for (const candidateField of candidate.fields) {
    assert.equal(candidateField.claims.storageShape.status, 'undocumented');
    assert.equal(candidateField.claims.deliveryShape.status, 'undocumented');
  }
});

test('CMS 13 admin XHTML editor claim is qualified to CMS Core 13.7.0', async () => {
  const compiled = await compileCatalog();
  const admin = compiled.profiles.find((candidate) => candidate.id === 'optimizely-paas.cms13-admin');
  assert.ok(admin);
  const xhtml = field(admin, 'XHTML string (>255)');
  const editor = xhtml.claims.editorBehavior;
  assert.equal(editor.status, 'documented');
  assert.match(editor.value, /From EPiServer\.CMS\.Core 13\.7\.0, image and video buttons insert media from CMS or Optimizely DAM/);
  assert.match(editor.value, /dragged or pasted images upload to CMS before insertion/);
  assert.deepEqual(editor.evidence, [
    { sourceId: 'optimizely-paas.cms13-text-property', locator: 'Text Type > XHTML string (>255)' },
    {
      sourceId: 'optimizely-paas.cms13-release-notes-index',
      locator: 'CMS Core > November 18—13.7.0 > Enhancements',
    },
  ]);
  assert.deepEqual(xhtml.claims.valueShape.value, { kind: 'rich-text', nullable: true });
  assert.equal(xhtml.claims.storageShape.status, 'undocumented');
  assert.equal(xhtml.claims.deliveryShape.status, 'undocumented');

  const model = field(await profile(), 'XhtmlString');
  assert.doesNotMatch(model.claims.editorBehavior.value, /13\.7\.0/);
});
