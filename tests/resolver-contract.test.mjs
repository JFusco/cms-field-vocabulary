import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { loadRuntime, makeConsumerWorkspace } from './helpers.mjs';

test('in-memory resolver emits only the sorted, de-duplicated selected contracts', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: [
      'optimizely-saas.sdk-2.richText',
      'optimizely-saas.sdk-2.link',
      'optimizely-saas.sdk-2.richText',
    ],
    agentProfile: 'react-nextjs',
  });
  assert.deepEqual(selected.contracts.map((contract) => contract.canonicalId), [
    'optimizely-saas.sdk-2.link',
    'optimizely-saas.sdk-2.richText',
  ]);
  assert.deepEqual(selected.rendererBindings, {
    'optimizely.cms-sdk.RichText': '@optimizely/cms-sdk/react/richText#RichText',
  });
  const serialized = JSON.stringify(selected);
  assert.doesNotMatch(serialized, /"evidence"/);
  assert.doesNotMatch(serialized, /"claimRefs"/);
  assert.doesNotMatch(serialized, /"typicalUse"|"editorBehavior"|"storageShape"|"deliveryShape"/);
});

test('selected resolver output keeps canonical, derived, and policy operations distinguishable', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: [
      'optimizely-saas.sdk-2.array',
      'optimizely-saas.sdk-2.contentReference',
      'optimizely-saas.sdk-2.link',
      'optimizely-saas.sdk-2.richText',
    ],
    agentProfile: 'react-nextjs',
    renderingSelections: [{
      fieldId: 'optimizely-saas.sdk-2.contentReference',
      discriminator: 'content-reference-usage',
      value: 'media',
    }],
  });
  const operations = selected.contracts.flatMap((contract) => contract.operations);
  assert.ok(operations.some((operation) => operation.authority === 'contract-derived'));
  assert.ok(operations.some((operation) => operation.authority === 'consumer-policy'));
  for (const operation of operations) {
    assert.equal('evidence' in operation, false, operation.id);
    assert.equal('claimRefs' in operation, false, operation.id);
    if (operation.authority === 'consumer-policy') assert.ok(operation.policyId, operation.id);
    else assert.equal('policyId' in operation, false, operation.id);
    if (operation.rendererId) {
      assert.ok(selected.rendererBindings[operation.rendererId], `${operation.rendererId} must have an exact import binding`);
    }
  }
  assert.deepEqual(operations.map((operation) => operation.id), [
    'optimizely.array.iterate',
    'react-nextjs.optimizely.array-identity',
    'react-nextjs.optimizely.media-reference-dam',
    'react-nextjs.optimizely.media-reference-src',
    'optimizely.link.anchor',
    'react-nextjs.link-attributes',
    'optimizely.richtext.component',
    'react-nextjs.optimizely.richtext-edit-wrapper',
  ]);
});

test('contentReference rendering selection emits only the explicit link or media branch', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const base = {
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: ['optimizely-saas.sdk-2.contentReference'],
    agentProfile: 'react-nextjs',
  };
  const link = resolveFieldContracts({
    ...base,
    renderingSelections: [{
      fieldId: 'optimizely-saas.sdk-2.contentReference',
      discriminator: 'content-reference-usage',
      value: 'link',
    }],
  });
  assert.deepEqual(link.contracts[0].operations.map((operation) => operation.id), [
    'optimizely.content-reference.reference',
  ]);
  assert.deepEqual(link.rendererBindings, {});

  const media = resolveFieldContracts({
    ...base,
    renderingSelections: [{
      fieldId: 'optimizely-saas.sdk-2.contentReference',
      discriminator: 'content-reference-usage',
      value: 'media',
    }],
  });
  assert.deepEqual(media.contracts[0].operations.map((operation) => operation.id), [
    'react-nextjs.optimizely.media-reference-dam',
    'react-nextjs.optimizely.media-reference-src',
  ]);
  assert.deepEqual(media.rendererBindings, {
    'optimizely.cms-sdk.damAssets': '@optimizely/cms-sdk#damAssets',
    'optimizely.cms-sdk.getPreviewUtils.src': '@optimizely/cms-sdk/react/server#getPreviewUtils.src',
  });
});

test('rendering selections reject unknown, duplicate, unrequested, and unsupported choices', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const base = {
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: ['optimizely-saas.sdk-2.contentReference'],
    agentProfile: 'react-nextjs',
  };
  assert.throws(() => resolveFieldContracts(base), /requires an explicit content-reference-usage rendering selection/);
  assert.throws(() => resolveFieldContracts({
    ...base,
    renderingSelections: [{ fieldId: base.fieldIds[0], discriminator: 'unknown', value: 'link' }],
  }), /Unknown rendering selection discriminator: unknown/);
  for (const discriminator of ['toString', 'constructor', '__proto__']) {
    assert.throws(() => resolveFieldContracts({
      ...base,
      renderingSelections: [{ fieldId: base.fieldIds[0], discriminator, value: 'link' }],
    }), new RegExp(`Unknown rendering selection discriminator: ${discriminator}`));
  }
  assert.throws(() => resolveFieldContracts({
    ...base,
    renderingSelections: [{ fieldId: base.fieldIds[0], discriminator: 'content-reference-usage', value: 'unknown' }],
  }), /Unknown content-reference-usage selection value: unknown/);
  assert.throws(() => resolveFieldContracts({
    ...base,
    renderingSelections: [
      { fieldId: base.fieldIds[0], discriminator: 'content-reference-usage', value: 'link' },
      { fieldId: base.fieldIds[0], discriminator: 'content-reference-usage', value: 'media' },
    ],
  }), /Duplicate content-reference-usage selection/);
  assert.throws(() => resolveFieldContracts({
    ...base,
    renderingSelections: [{ fieldId: 'optimizely-saas.sdk-2.link', discriminator: 'content-reference-usage', value: 'link' }],
  }), /references unrequested field/);
  assert.throws(() => resolveFieldContracts({
    ...base,
    agentProfile: 'generic',
    renderingSelections: [{ fieldId: base.fieldIds[0], discriminator: 'content-reference-usage', value: 'media' }],
  }), /does not support content-reference-usage=media/);
});

test('Optimizely component resolution uses the SDK server entrypoint', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: ['optimizely-saas.sdk-2.component', 'optimizely-saas.sdk-2.content'],
    agentProfile: 'react-nextjs',
  });
  assert.deepEqual(selected.rendererBindings, {
    'optimizely.cms-sdk.OptimizelyComponent': '@optimizely/cms-sdk/react/server#OptimizelyComponent',
  });
});

test('official rendering authority survives compaction without leaking source evidence', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: 'sitecore-ai.content-sdk2',
    fieldIds: ['sitecore-ai.content-sdk2.RichText'],
    agentProfile: 'react-nextjs',
  });
  assert.deepEqual(selected.rendererBindings, {
    'sitecore.content-sdk.RichText': '@sitecore-content-sdk/nextjs#RichText',
  });
  assert.equal(selected.contracts.length, 1);
  assert.equal(selected.contracts[0].operations.length, 1);
  assert.equal(selected.contracts[0].operations[0].authority, 'official');
  assert.equal('evidence' in selected.contracts[0].operations[0], false);
  assert.equal('claimRefs' in selected.contracts[0].operations[0], false);
});

test('generic agent contracts retain exact bindings for canonical SDK renderers', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: 'sitecore-ai.content-sdk2',
    fieldIds: ['sitecore-ai.content-sdk2.RichText'],
    agentProfile: 'generic',
  });
  assert.deepEqual(selected.rendererBindings, {
    'sitecore.content-sdk.RichText': '@sitecore-content-sdk/nextjs#RichText',
  });
});

test('CMS-free in-memory resolution returns null so callers inject no CMS context', async () => {
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: 'contentful.cma.saas',
    fieldIds: [],
    agentProfile: 'react-nextjs',
  });
  assert.equal(selected, null);
  const inputs = {};
  if (selected) inputs.cmsFieldContracts = selected;
  assert.deepEqual(inputs, {});
  assert.doesNotMatch(JSON.stringify(inputs), /profileId|agentProfile|rendererBindings|contracts/);
});

test('resolver rejects unknown profiles, agents, field IDs, and cross-profile IDs', async () => {
  const {
    findFieldFact,
    getFieldFact,
    getProfile,
    resolveFieldContracts,
  } = await loadRuntime();
  assert.throws(() => getProfile('unknown'), /Unknown CMS vocabulary profile: unknown/);
  assert.throws(() => findFieldFact('string'), /Unknown CMS field ID: string/);
  assert.throws(
    () => getFieldFact('contentful.cma.saas', 'optimizely-saas.sdk-2.string'),
    /does not belong to profile contentful\.cma\.saas/,
  );
  assert.throws(
    () => resolveFieldContracts({
      profileId: 'contentful.cma.saas',
      fieldIds: ['contentful.cma.saas.Symbol'],
      agentProfile: 'unknown',
    }),
    /Unknown coding-agent profile: unknown/,
  );
  assert.throws(
    () => resolveFieldContracts({
      profileId: 'contentful.cma.saas',
      fieldIds: ['contentful.cma.saas.NotAField'],
      agentProfile: 'generic',
    }),
    /does not belong to profile contentful\.cma\.saas/,
  );
});

test('file resolver writes only selected IDs and de-duplicates repeated selections', async (t) => {
  const workspace = await makeConsumerWorkspace({ profile: 'generic' });
  t.after(() => workspace.cleanup());
  const { resolveProjectionFields, syncProjection } = await loadRuntime();
  await syncProjection({ configPath: workspace.configPath, root: workspace.root });
  const output = 'resolved/fields.json';
  await resolveProjectionFields({
    configPath: workspace.configPath,
    fieldIds: [
      'contentful.cma.saas.Symbol',
      'contentful.cma.saas.Symbol',
      'contentful.cma.saas.RichText',
    ],
    output,
    root: workspace.root,
  });
  const result = JSON.parse(await readFile(path.join(workspace.root, output), 'utf8'));
  assert.deepEqual(result.contracts.map((contract) => contract.canonicalId), [
    'contentful.cma.saas.RichText',
    'contentful.cma.saas.Symbol',
  ]);
  assert.equal(result.profileId, 'contentful.cma.saas');
  assert.deepEqual(result.rendererBindings, {});
  assert.doesNotMatch(JSON.stringify(result), /"evidence"|"claimRefs"/);
});

test('file resolver rejects ambiguous multi-profile selections before writing output', async (t) => {
  const workspace = await makeConsumerWorkspace({ profile: 'generic' });
  t.after(() => workspace.cleanup());
  const { resolveProjectionFields, syncProjection } = await loadRuntime();
  await syncProjection({ configPath: workspace.configPath, root: workspace.root });
  const output = 'resolved/ambiguous.json';
  await assert.rejects(
    resolveProjectionFields({
      configPath: workspace.configPath,
      fieldIds: ['contentful.cma.saas.Symbol', 'optimizely-saas.sdk-2.string'],
      output,
      root: workspace.root,
    }),
    /one exact CMS profile/,
  );
  await assert.rejects(access(path.join(workspace.root, output)));
});

test('file resolver rejects a known profile that is not active for the configured adapter', async (t) => {
  const workspace = await makeConsumerWorkspace({ profile: 'generic' });
  t.after(() => workspace.cleanup());
  const { resolveProjectionFields, syncProjection } = await loadRuntime();
  await syncProjection({ configPath: workspace.configPath, root: workspace.root });
  const output = 'resolved/unrouted.json';
  await assert.rejects(
    resolveProjectionFields({
      configPath: workspace.configPath,
      fieldIds: ['optimizely-saas.cms-api-v1.string'],
      output,
      root: workspace.root,
    }),
    /Profile optimizely-saas\.cms-api-v1 is not active for adapter contentful; expected contentful\.cma\.saas/,
  );
  await assert.rejects(access(path.join(workspace.root, output)));
});

test('file resolver treats a CMS-free selection as a successful no-op and rejects unknown IDs', async (t) => {
  const workspace = await makeConsumerWorkspace({ profile: 'generic' });
  t.after(() => workspace.cleanup());
  const { resolveProjectionFields, syncProjection } = await loadRuntime();
  await syncProjection({ configPath: workspace.configPath, root: workspace.root });
  const emptyOutput = 'resolved/empty.json';
  assert.equal(await resolveProjectionFields({
    configPath: workspace.configPath,
    fieldIds: [],
    output: emptyOutput,
    root: workspace.root,
  }), null);
  await assert.rejects(access(path.join(workspace.root, emptyOutput)));
  await assert.rejects(
    resolveProjectionFields({
      configPath: workspace.configPath,
      fieldIds: [],
      renderingSelections: [{
        fieldId: 'contentful.cma.saas.Symbol',
        discriminator: 'content-reference-usage',
        value: 'link',
      }],
      output: emptyOutput,
      root: workspace.root,
    }),
    /Rendering selections require at least one requested field/,
  );
  for (const [fieldIds, name, message] of [
    [['string'], 'bare-token.json', /Unknown CMS field ID: string/],
    [['unknown.profile.field'], 'unknown.json', /Unknown CMS field ID: unknown\.profile\.field/],
  ]) {
    const output = `resolved/${name}`;
    await assert.rejects(
      resolveProjectionFields({ configPath: workspace.configPath, fieldIds, output, root: workspace.root }),
      message,
    );
    await assert.rejects(access(path.join(workspace.root, output)));
  }
});

test('file resolver requires and applies deterministic rendering selections', async (t) => {
  const workspace = await makeConsumerWorkspace({
    profile: 'ai-orchestration',
    adapter: 'optimizely-saas',
  });
  t.after(() => workspace.cleanup());
  const { resolveProjectionFields, syncProjection } = await loadRuntime();
  await syncProjection({ configPath: workspace.configPath, root: workspace.root });
  const fieldId = 'optimizely-saas.sdk-2.contentReference';
  await assert.rejects(
    resolveProjectionFields({
      configPath: workspace.configPath,
      fieldIds: [fieldId],
      output: 'resolved/unresolved.json',
      root: workspace.root,
    }),
    /requires an explicit content-reference-usage rendering selection/,
  );
  await assert.rejects(access(path.join(workspace.root, 'resolved/unresolved.json')));

  for (const [value, expected] of [
    ['link', ['optimizely.content-reference.reference']],
    ['media', [
      'react-nextjs.optimizely.media-reference-dam',
      'react-nextjs.optimizely.media-reference-src',
    ]],
  ]) {
    const output = `resolved/${value}.json`;
    const selected = await resolveProjectionFields({
      configPath: workspace.configPath,
      fieldIds: [fieldId],
      renderingSelections: [{
        fieldId,
        discriminator: 'content-reference-usage',
        value,
      }],
      output,
      root: workspace.root,
    });
    assert.deepEqual(selected.contracts[0].operations.map((operation) => operation.id), expected);
    assert.deepEqual(
      JSON.parse(await readFile(path.join(workspace.root, output), 'utf8')),
      selected,
    );
  }

  await assert.rejects(
    resolveProjectionFields({
      configPath: workspace.configPath,
      fieldIds: [fieldId],
      renderingSelections: [{
        fieldId,
        discriminator: 'content-reference-usage',
        value: 'invalid',
      }],
      output: 'resolved/invalid.json',
      root: workspace.root,
    }),
    /Unknown content-reference-usage selection value: invalid/,
  );
  await assert.rejects(access(path.join(workspace.root, 'resolved/invalid.json')));
});
