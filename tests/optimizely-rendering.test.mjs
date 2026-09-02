import assert from 'node:assert/strict';
import test from 'node:test';
import { compileSourceProfile } from '../scripts/lib/catalog.mjs';
import { readJson } from './helpers.mjs';

async function sdkProfile() {
  const source = await readJson('sources/profiles/optimizely-saas.sdk-2.json');
  const manifest = await readJson('sources/official-sources.json');
  return compileSourceProfile(source, manifest.sources);
}

function field(profile, token) {
  const match = profile.fields.find((candidate) => candidate.nativeToken === token);
  assert.ok(match, `missing Optimizely SDK field ${token}`);
  return match;
}

function operation(candidate, id) {
  const match = candidate.renderingOperations.find((item) => item.id === id);
  assert.ok(match, `${candidate.canonicalId} is missing ${id}`);
  return match;
}

test('Optimizely SDK profile keeps its exact property type and format vocabulary', async () => {
  const profile = await sdkProfile();
  assert.deepEqual(profile.fields.map((candidate) => candidate.nativeToken).sort(), [
    'array', 'binary', 'boolean', 'component', 'content', 'contentReference',
    'dateTime', 'float', 'integer', 'json', 'link', 'richText', 'string', 'url',
  ]);
  assert.deepEqual(field(profile, 'string').formats.map((format) => [format.nativeToken, format.requires || []]), [
    ['shortString', []],
    ['guid', []],
    ['selectOne', ['enum']],
  ]);
  assert.deepEqual(field(profile, 'url').formats.map((format) => format.nativeToken), ['DocumentUrl', 'ImageUrl']);
  assert.deepEqual(field(profile, 'array').formats.map((format) => [format.nativeToken, format.requires]), [
    ['selectMany', ['items.type:string', 'items.enum']],
  ]);
  for (const candidate of profile.fields) {
    for (const format of candidate.formats) assert.ok(format.evidence.length > 0, `${candidate.canonicalId}.${format.nativeToken}`);
  }
});

test('Optimizely rich text remains structured and is rendered from .json', async () => {
  const richText = field(await sdkProfile(), 'richText');
  assert.deepEqual(richText.claims.valueShape.value, {
    kind: 'rich-text',
    nullable: true,
    valuePath: '$.json',
  });
  const render = operation(richText, 'optimizely.richtext.component');
  assert.equal(render.operation, 'component');
  assert.equal(render.rendererId, 'optimizely.cms-sdk.RichText');
  assert.equal(render.valuePath, '$.json');
  assert.deepEqual(render.props, { content: '$.json' });
  assert.ok(render.prohibitionCodes.includes('coerce-rich-text-to-html-string'));
});

test('Optimizely URL, link, content, and contentReference retain distinct SDK shapes', async () => {
  const profile = await sdkProfile();
  const url = field(profile, 'url');
  assert.deepEqual(url.claims.valueShape.value.members, ['default', 'base', 'hierarchical', 'internal']);
  assert.deepEqual(operation(url, 'optimizely.url.anchor').attributes, { href: '$.default' });
  assert.ok(operation(url, 'optimizely.url.anchor').prohibitionCodes.includes('pass-url-to-content-reference-resolver'));

  const link = field(profile, 'link');
  assert.deepEqual(link.claims.valueShape.value.members, ['url', 'text', 'title', 'target']);
  assert.deepEqual(operation(link, 'optimizely.link.anchor').attributes, {
    href: '$.url',
    title: '$.title',
    target: '$.target',
  });

  const content = field(profile, 'content');
  assert.deepEqual(content.claims.valueShape.value.members, ['__typename']);
  assert.equal(operation(content, 'optimizely.content.resolved').rendererId, 'optimizely.cms-sdk.OptimizelyComponent');

  const reference = field(profile, 'contentReference');
  assert.deepEqual(reference.claims.valueShape.value.members, ['key', 'url', 'item']);
  assert.equal(operation(reference, 'optimizely.content-reference.reference').operation, 'reference');
  assert.deepEqual(operation(reference, 'optimizely.content-reference.reference').selection, {
    discriminator: 'content-reference-usage',
    equals: 'link',
  });
  assert.equal('rendererId' in operation(reference, 'optimizely.content-reference.reference'), false);
  assert.ok(operation(reference, 'optimizely.content-reference.reference').prohibitionCodes.includes('pass-content-reference-to-optimizely-component'));
});

test('Optimizely binary, JSON, array, and component implications preserve their boundaries', async () => {
  const profile = await sdkProfile();
  assert.ok(operation(field(profile, 'binary'), 'optimizely.binary.asset').prohibitionCodes.includes('assume-binary-string-url'));
  assert.ok(operation(field(profile, 'json'), 'optimizely-saas.sdk-2.json.render').prohibitionCodes.includes('flatten-structured-value'));

  const array = operation(field(profile, 'array'), 'optimizely.array.iterate');
  assert.equal(array.editTarget, 'container');
  assert.deepEqual(array.stableKeyPaths, ['$item._metadata.key']);
  assert.deepEqual(array.constraintKeys, ['minItems', 'maxItems']);
  assert.ok(array.prohibitionCodes.includes('apply-edit-attribute-per-item'));

  const component = operation(field(profile, 'component'), 'optimizely.component.component');
  assert.equal(component.rendererId, 'optimizely.cms-sdk.OptimizelyComponent');
  assert.deepEqual(component.constraintKeys, ['contentType']);
  assert.ok(component.prohibitionCodes.includes('omit-component-content-type'));
});

test('Optimizely numeric and date-time implications preserve constraints and shared formatting', async () => {
  const profile = await sdkProfile();
  for (const [nativeToken, operationId] of [
    ['integer', 'optimizely.integer.direct'],
    ['float', 'optimizely.float.direct'],
  ]) {
    const render = operation(field(profile, nativeToken), operationId);
    assert.equal(render.operation, 'direct');
    assert.deepEqual(render.constraintKeys, ['minimum', 'maximum']);
    assert.deepEqual(render.claimRefs, ['claims.valueShape', 'claims.editorBehavior']);
  }
  const dateTime = operation(field(profile, 'dateTime'), 'optimizely.datetime.format');
  assert.equal(dateTime.operation, 'format');
  assert.equal(dateTime.formatStrategy, 'shared-util');
  assert.deepEqual(dateTime.constraintKeys, ['minimum', 'maximum']);
  assert.deepEqual(dateTime.claimRefs, ['claims.valueShape', 'claims.editorBehavior']);
});

test('framework policy augments canonical Optimizely implications without claiming vendor authority', async () => {
  const agent = await readJson('profiles/agent/react-nextjs.json');
  assert.equal(
    agent.rendererBindings['optimizely.cms-sdk.RichText'],
    '@optimizely/cms-sdk/react/richText#RichText',
  );
  assert.equal(
    agent.rendererBindings['optimizely.cms-sdk.OptimizelyComponent'],
    '@optimizely/cms-sdk/react/server#OptimizelyComponent',
  );
  const byField = new Map(agent.rules.map((rule) => [rule.fieldId, rule.operations]));
  const richText = byField.get('optimizely-saas.sdk-2.richText');
  assert.ok(richText);
  assert.equal(richText[0].editTarget, 'wrapper');
  assert.ok(richText[0].prohibitionCodes.includes('apply-preview-attributes-to-richtext-renderer'));

  const link = byField.get('optimizely-saas.sdk-2.link');
  assert.ok(link);
  assert.deepEqual(link[0].conditions, [{
    path: '$.target',
    equals: '_blank',
    attributes: { rel: 'noopener noreferrer' },
  }]);

  const reference = byField.get('optimizely-saas.sdk-2.contentReference');
  assert.ok(reference);
  assert.equal(reference.length, 2);
  assert.equal(reference[0].operation, 'asset');
  assert.equal(reference[0].rendererId, 'optimizely.cms-sdk.damAssets');
  assert.equal(reference[1].operation, 'reference');
  assert.equal(reference[1].rendererId, 'optimizely.cms-sdk.getPreviewUtils.src');
  for (const item of reference) {
    assert.deepEqual(item.selection, {
      discriminator: 'content-reference-usage',
      equals: 'media',
    });
    assert.ok(item.prohibitionCodes.includes('pass-content-reference-to-optimizely-component'));
  }

  const array = byField.get('optimizely-saas.sdk-2.array');
  assert.ok(array);
  assert.deepEqual(array[0].stableKeyPaths, ['$item._metadata.key']);
  assert.equal(array[0].stableKeyFallback, 'index-primitive-or-no-identity');
  for (const operations of byField.values()) {
    for (const item of operations) {
      assert.equal(item.authority, 'consumer-policy');
      assert.ok(item.policyId);
      assert.equal('evidence' in item, false);
      assert.equal('claimRefs' in item, false);
      if (item.rendererId) assert.ok(agent.rendererBindings[item.rendererId], `${item.rendererId} must have an exact import binding`);
    }
  }
});
