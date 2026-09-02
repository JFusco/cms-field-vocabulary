import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  compileSourceProfile,
  loadSourceProfiles,
} from '../scripts/lib/catalog.mjs';
import { ROOT, readJson } from './helpers.mjs';

const EXPECTED_NATIVE_TOKENS = {
  'contentful.cma.saas': [
    'Symbol', 'Text', 'RichText', 'Integer', 'Number', 'Date', 'Boolean', 'Object',
    'Location', 'Array', 'Link', 'ResourceLink',
  ],
  'contentstack.cma.saas': [
    'text', 'json', 'blocks', 'number', 'boolean', 'isodate', 'file', 'link',
    'reference', 'group', 'global_field', 'taxonomy',
  ],
  'optimizely-paas.cms12-model': [
    'String', 'XhtmlString', 'Int', 'DateTime', 'Double', 'Boolean', 'PageType',
    'Blob', 'PageReference', 'ContentReference', 'Url', 'ContentArea',
    'LinkItemCollection', 'LinkItem', 'ContentReferenceList',
  ],
  'optimizely-paas.cms12-property-data-type': [
    'Block', 'Boolean', 'Category', 'ContentReference', 'Date', 'FloatNumber',
    'Json', 'LinkCollection', 'LongString', 'Number', 'PageReference', 'PageType',
    'String',
  ],
  'optimizely-paas.cms13-admin': [
    'Block', 'Drop-down list', 'Select List (multiple selection)',
    'Selected/Not selected', 'Content Area', 'Content Area Item',
    'Content Reference', 'DateTime', 'Link Collection', 'LinkItem',
    'URL to Document', 'URL to image', 'URL to page/external address', 'Integer',
    'Floating point number', 'String (<= 255)', 'Long string (>255)',
    'XHTML string (>255)', 'Blob', 'Guid', 'JsonString', 'OptiAlloy',
  ],
  'optimizely-paas.cms13-model': [
    'String', 'XhtmlString', 'Int', 'DateTime', 'Double', 'Boolean', 'PageType',
    'Blob', 'ContentArea', 'ContentReference', 'ContentReference<T>', 'Url',
    'LinkItemCollection', 'LinkItem', 'ContentReferenceList',
  ],
  'optimizely-saas.cms-api-v1': [
    'string', 'richText', 'boolean', 'integer', 'float', 'dateTime', 'url', 'link',
    'json', 'content', 'contentReference', 'array', 'component',
  ],
  'optimizely-saas.sdk-2': [
    'string', 'richText', 'boolean', 'integer', 'float', 'dateTime', 'url', 'link',
    'binary', 'json', 'content', 'contentReference', 'array', 'component',
  ],
  'sitecore-ai.authoring.current': [
    'Checkbox', 'File', 'Date', 'Datetime', 'Image', 'Integer', 'Number',
    'Single-Line Text', 'Multi-Line Text', 'Rich Text', 'General link with search',
    'General link', 'Droplink', 'Droptree', 'Version link', 'Droplist', 'Multilist',
    'Treelist', 'TreelistEx', 'Checklist', 'Multiroot Treelist', 'Taglist', 'Icon',
    'IFrame', 'Tristate', 'Query Datasource', 'Attachment', 'File Drop Area',
    'Internal Link', 'Layout', 'Rules', 'Security', 'Template Field Source', 'Thumbnail',
  ],
  'sitecore-ai.content-sdk2': [
    'Checkbox', 'File', 'Date', 'Datetime', 'Image', 'Integer', 'Number',
    'Single-Line Text', 'Multi-Line Text', 'Rich Text', 'General Link with search',
    'General Link', 'Droplink', 'Droptree', 'Version link', 'Droplist', 'Multilist',
    'Multilist with Search', 'Treelist', 'TreelistEx', 'Checklist', 'Grouped Droplink',
    'Grouped Droplist', 'Name Value List', 'Multiroot Treelist', 'Taglist', 'Icon',
    'IFrame', 'Tristate', 'Query Datasource', 'Attachment', 'File Drop Area',
    'Internal Link', 'Layout', 'Rules', 'Security', 'Template Field Source', 'Thumbnail',
  ],
  'sitecore-on-prem.headless22': [
    'Checkbox', 'Date', 'Datetime', 'File', 'Image', 'Integer', 'Number',
    'Single-Line Text', 'Multi-Line Text', 'Rich Text', 'General Link',
  ],
  'sitecore-on-prem.xp104-authoring': [
    'Checkbox', 'Date', 'Datetime', 'File', 'Image', 'Integer', 'Number', 'Password',
    'Single-Line Text', 'Multi-Line Text', 'Rich Text', 'General link',
    'Multilist with Search', 'Treelist with Search', 'Checklist', 'Droplist',
    'Grouped Droplink', 'Grouped Droplist', 'Multilist', 'Name Value List', 'Treelist',
    'TreelistEx', 'General link with search', 'Droplink', 'Droptree', 'Version link',
    'Icon', 'IFrame', 'Tristate', 'Query Datasource', 'Attachment', 'Custom',
    'File Drop Area', 'Internal Link', 'Layout', 'Rules', 'Security',
    'Template Field Source', 'Thumbnail',
  ],
  'wordpress.core71-block-attribute-source': ['attribute', 'text', 'html', 'query', 'meta'],
  'wordpress.core71-block-attributes': ['null', 'boolean', 'object', 'array', 'string', 'integer', 'number'],
  'wordpress.core71-meta': ['string', 'boolean', 'integer', 'number', 'array', 'object'],
  'wordpress.core71-rest-schema': ['string', 'null', 'number', 'integer', 'boolean', 'array', 'object'],
};

function sourceTokens(profile) {
  return profile.fields.map((field) => typeof field === 'string' ? field : field.nativeToken);
}

function field(profile, nativeToken) {
  const match = profile.fields.find((candidate) => candidate.nativeToken === nativeToken);
  assert.ok(match, `${profile.id} must include ${nativeToken}`);
  return match;
}

async function compileProfile(sourceProfile) {
  const manifest = await readJson('sources/official-sources.json');
  return compileSourceProfile(sourceProfile, manifest.sources);
}

test('official source profiles preserve the exact profile-local native vocabulary and casing', async () => {
  const profiles = await loadSourceProfiles();
  assert.deepEqual(profiles.map((profile) => profile.id), Object.keys(EXPECTED_NATIVE_TOKENS).sort());
  for (const profile of profiles) {
    assert.deepEqual(sourceTokens(profile), EXPECTED_NATIVE_TOKENS[profile.id], profile.id);
    assert.equal(new Set(sourceTokens(profile)).size, profile.fields.length, `${profile.id} contains duplicate native tokens`);
  }
});

test('surface-specific vocabularies remain isolated instead of being collapsed by vendor or token', async () => {
  const profiles = new Map((await loadSourceProfiles()).map((profile) => [profile.id, profile]));
  const wordpress = [...profiles.values()].filter((profile) => profile.platform === 'wordpress');
  assert.deepEqual(wordpress.map((profile) => profile.id), [
    'wordpress.core71-block-attribute-source',
    'wordpress.core71-block-attributes',
    'wordpress.core71-meta',
    'wordpress.core71-rest-schema',
  ]);
  assert.equal(wordpress.filter((profile) => sourceTokens(profile).includes('string')).length, 3);

  const api = profiles.get('optimizely-saas.cms-api-v1');
  const sdk = profiles.get('optimizely-saas.sdk-2');
  assert.ok(api && sdk);
  assert.equal(sourceTokens(api).includes('binary'), false);
  assert.equal(sourceTokens(sdk).includes('binary'), true);
  assert.notEqual(api.surface, sdk.surface);

  for (const profileId of ['contentful.cma.saas', 'contentstack.cma.saas']) {
    const management = await compileProfile(profiles.get(profileId));
    for (const candidate of management.fields) {
      assert.equal(candidate.claims.storageShape.status, 'undocumented', candidate.canonicalId);
      assert.equal(candidate.claims.deliveryShape.status, 'undocumented', candidate.canonicalId);
    }
  }

  const cms12Model = profiles.get('optimizely-paas.cms12-model');
  const cms12Storage = profiles.get('optimizely-paas.cms12-property-data-type');
  const cms13Admin = profiles.get('optimizely-paas.cms13-admin');
  const cms13Model = profiles.get('optimizely-paas.cms13-model');
  assert.ok(cms12Model && cms12Storage && cms13Admin && cms13Model);
  assert.deepEqual(
    [cms12Model.surface, cms12Storage.surface, cms13Admin.surface, cms13Model.surface],
    ['sdk', 'storage', 'authoring', 'sdk'],
  );
  assert.equal(sourceTokens(cms13Admin).includes('Integer'), true);
  assert.equal(sourceTokens(cms13Admin).includes('Int'), false);
  assert.equal(sourceTokens(cms13Model).includes('Integer'), false);
  assert.equal(sourceTokens(cms13Model).includes('Int'), true);

  const sitecoreAiAuthoring = profiles.get('sitecore-ai.authoring.current');
  const sitecoreAiSdk = profiles.get('sitecore-ai.content-sdk2');
  const sitecoreXpAuthoring = profiles.get('sitecore-on-prem.xp104-authoring');
  const sitecoreXpSdk = profiles.get('sitecore-on-prem.headless22');
  assert.ok(sitecoreAiAuthoring && sitecoreAiSdk && sitecoreXpAuthoring && sitecoreXpSdk);
  assert.deepEqual(
    [sitecoreAiAuthoring.surface, sitecoreAiSdk.surface, sitecoreXpAuthoring.surface, sitecoreXpSdk.surface],
    ['authoring', 'sdk', 'authoring', 'sdk'],
  );
  assert.ok(sitecoreAiAuthoring.fields.every((candidate) => (
    typeof candidate === 'string' || candidate.renderingOperations.length === 0
  )));
  assert.ok(sitecoreXpAuthoring.fields.every((candidate) => (
    typeof candidate === 'string' || candidate.renderingOperations.length === 0
  )));
  assert.ok(sitecoreAiSdk.fields.some((candidate) => (
    typeof candidate !== 'string' && candidate.renderingOperations.length > 0
  )));
  assert.ok(sitecoreXpSdk.fields.every((candidate) => candidate.renderingOperations.length > 0));
});

test('compiled canonical IDs remain profile-qualified and native evidence stays profile-local', async () => {
  const sourceProfiles = await loadSourceProfiles();
  const manifest = await readJson('sources/official-sources.json');
  const officialSources = new Map(manifest.sources.map((source) => [source.id, source]));
  const canonicalIds = new Set();
  for (const sourceProfile of sourceProfiles) {
    const compiled = await compileProfile(sourceProfile);
    assert.deepEqual(
      compiled.fields.map((candidate) => candidate.canonicalId),
      [...compiled.fields.map((candidate) => candidate.canonicalId)].sort((left, right) => left.localeCompare(right)),
    );
    for (const candidate of compiled.fields) {
      assert.match(candidate.canonicalId, new RegExp(`^${sourceProfile.id.replaceAll('.', '\\.')}\\.`));
      assert.equal(canonicalIds.has(candidate.canonicalId), false, candidate.canonicalId);
      canonicalIds.add(candidate.canonicalId);
      assert.equal(candidate.claims.nativeType.status, 'documented');
      assert.equal(candidate.claims.nativeType.value, candidate.nativeToken);
      assert.ok(candidate.claims.nativeType.evidence.length > 0);
      assert.ok(
        candidate.claims.nativeType.evidence.some((evidence) => (
          officialSources.get(evidence.sourceId)?.extract.tokens || []
        ).includes(candidate.nativeToken)),
        `${candidate.canonicalId} must cite an official extraction containing its exact native token`,
      );
      for (const evidence of candidate.claims.nativeType.evidence) {
        assert.ok(sourceProfile.sourceIds.includes(evidence.sourceId), `${candidate.canonicalId}: ${evidence.sourceId}`);
      }
      for (const claim of Object.values(candidate.claims)) {
        if (claim.status === 'undocumented') assert.deepEqual(claim, { status: 'undocumented', value: null, evidence: [] });
      }
    }
  }
});

test('known vendor casing conflicts are represented explicitly and never silently normalized', async () => {
  const sourceProfiles = await loadSourceProfiles();
  const profiles = new Map(await Promise.all(sourceProfiles.map(async (profile) => [profile.id, await compileProfile(profile)])));
  const cms12 = profiles.get('optimizely-paas.cms12-model');
  assert.ok(cms12);
  const xhtml = field(cms12, 'XhtmlString');
  assert.equal(cms12.fields.some((candidate) => candidate.nativeToken === 'XHtmlString'), false);
  assert.deepEqual(
    xhtml.claims.nativeType.evidence.map((evidence) => evidence.sourceId).sort(),
    ['optimizely-paas.cms12-property-attributes'],
  );
  const manifest = await readJson('sources/official-sources.json');
  const builtins = manifest.sources.find((source) => source.id === 'optimizely-paas.cms12-builtins');
  assert.ok(builtins.extract.tokens.includes('XHtmlString'));
  assert.equal(builtins.extract.tokens.includes('XhtmlString'), false);

  const cms13 = profiles.get('optimizely-paas.cms13-model');
  assert.ok(cms13);
  const cms13Xhtml = field(cms13, 'XhtmlString');
  assert.equal(cms13.fields.some((candidate) => candidate.nativeToken === 'XHtmlString'), false);
  assert.ok(cms13Xhtml.claims.nativeType.evidence.some((evidence) => (
    evidence.sourceId === 'optimizely-paas.cms13-property-attributes'
    || evidence.sourceId === 'optimizely-paas.cms13-develop-properties'
  )));
  const cms13Builtins = manifest.sources.find((source) => source.id === 'optimizely-paas.cms13-builtins');
  assert.ok(cms13Builtins.extract.tokens.includes('XHtmlString'));
  assert.equal(cms13Builtins.extract.tokens.includes('XhtmlString'), false);

  const sitecoreAuthoring = profiles.get('sitecore-ai.authoring.current');
  const sitecoreSdk = profiles.get('sitecore-ai.content-sdk2');
  assert.ok(sitecoreAuthoring && sitecoreSdk);
  assert.equal(field(sitecoreAuthoring, 'TreelistEx').canonicalId, 'sitecore-ai.authoring.current.TreelistEx');
  assert.equal(field(sitecoreAuthoring, 'General link').canonicalId, 'sitecore-ai.authoring.current.GeneralLink');
  assert.equal(field(sitecoreAuthoring, 'General link with search').canonicalId, 'sitecore-ai.authoring.current.GeneralLinkWithSearch');
  assert.equal(field(sitecoreAuthoring, 'Version link').canonicalId, 'sitecore-ai.authoring.current.VersionLink');
  assert.equal(field(sitecoreAuthoring, 'Multi-Line Text').canonicalId, 'sitecore-ai.authoring.current.MultiLineText');
  assert.equal(field(sitecoreSdk, 'General Link').canonicalId, 'sitecore-ai.content-sdk2.GeneralLink');
  assert.equal(field(sitecoreSdk, 'General Link with search').canonicalId, 'sitecore-ai.content-sdk2.GeneralLinkWithSearch');

  const contentful = profiles.get('contentful.cma.saas');
  assert.ok(contentful);
  assert.equal(field(contentful, 'ResourceLink').canonicalId, 'contentful.cma.saas.ResourceLink');

  const sitecoreXp = profiles.get('sitecore-on-prem.xp104-authoring');
  assert.ok(sitecoreXp);
  assert.equal(field(sitecoreXp, 'General link').canonicalId, 'sitecore-on-prem.xp104-authoring.GeneralLink');
  assert.equal(field(sitecoreXp, 'General link with search').canonicalId, 'sitecore-on-prem.xp104-authoring.GeneralLinkWithSearch');
  assert.equal(field(sitecoreXp, 'Version link').canonicalId, 'sitecore-on-prem.xp104-authoring.VersionLink');
});

test('official source identifiers, locators, and profile routing agree in both directions', async () => {
  const manifest = await readJson('sources/official-sources.json');
  const sourceProfiles = await loadSourceProfiles();
  const profileIds = new Set(sourceProfiles.map((profile) => profile.id));
  const sources = new Map(manifest.sources.map((source) => [source.id, source]));

  for (const profile of sourceProfiles) {
    assert.ok(sources.has(profile.defaultEvidence.sourceId), profile.id);
    assert.ok(profile.defaultEvidence.locator.length > 0);
    for (const sourceId of profile.sourceIds) {
      const source = sources.get(sourceId);
      assert.ok(source, `${profile.id}: ${sourceId}`);
      assert.ok(source.profiles.includes(profile.id), `${sourceId} omits ${profile.id}`);
    }
  }
  for (const source of manifest.sources) {
    for (const profileId of source.profiles) {
      assert.ok(profileIds.has(profileId), `${source.id}: ${profileId}`);
      const profile = sourceProfiles.find((candidate) => candidate.id === profileId);
      assert.ok(profile.sourceIds.includes(source.id), `${profileId} omits ${source.id}`);
    }
  }
});

test('the Phase 1 mandated official documentation URLs remain directly registered or explicitly replaced', async () => {
  const manifest = await readJson('sources/official-sources.json');
  const recordedUrls = new Set();
  for (const source of manifest.sources) {
    recordedUrls.add(source.url);
    for (const replacement of source.replacementHistory || []) {
      if (replacement.replacedUrl) recordedUrls.add(replacement.replacedUrl);
      if (replacement.replacementUrl) recordedUrls.add(replacement.replacementUrl);
    }
  }
  for (const required of [
    'https://www.contentful.com/developers/docs/references/content-management-api/content-types/',
    'https://www.contentful.com/developers/docs/references/content-management-api/#/reference/editor-interface',
    'https://www.contentstack.com/docs/headless-cms/json-schema-for-creating-a-content-type',
    'https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/content-types-saas',
    'https://docs.developers.optimizely.com/content-management-system/v13.0.0-CMS/docs/built-in-property-types',
    'https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/data-templates/data-template-fields/the-data-template-field-types.html',
    'https://doc.sitecore.com/xp/en/developers/104/sitecore-experience-manager/the-data-template-field-types.html',
    'https://developer.wordpress.org/reference/functions/register_meta/',
    'https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/',
  ]) {
    assert.equal(recordedUrls.has(required), true, required);
  }
});

test('WordPress 7.1 facts use immutable official revisions while public docs remain rolling companions', async () => {
  const manifest = await readJson('sources/official-sources.json');
  const sources = new Map(manifest.sources.map((source) => [source.id, source]));
  for (const sourceId of ['wordpress.register-meta', 'wordpress.rest-schema', 'wordpress.block-attributes']) {
    const source = sources.get(sourceId);
    assert.equal(source.version.mode, 'rolling-documentation', sourceId);
    assert.equal(source.completeness, 'supplemental', sourceId);
  }
  const coreRevision = 'daaca56d3d6a9a42a0c87f6eda766c33a77c1d05';
  for (const sourceId of ['wordpress.register-meta-core-7.1.0', 'wordpress.rest-schema-core-7.1.0']) {
    const source = sources.get(sourceId);
    assert.equal(source.version.mode, 'pinned-git-commit', sourceId);
    assert.equal(source.version.value, coreRevision, sourceId);
    assert.match(source.url, new RegExp(coreRevision), sourceId);
    assert.equal(source.completeness, 'exhaustive', sourceId);
  }
  const block = sources.get('wordpress.block-attributes-gutenberg-943e0d8');
  assert.equal(block.version.value, '943e0d825bb66ba582e9a10d32743cbb136de460');
  assert.match(block.url, /943e0d825bb66ba582e9a10d32743cbb136de460/);
  const compatibility = sources.get('wordpress.core-7.1.0-gutenberg-manifest');
  assert.deepEqual(compatibility.extract.tokens, [
    '7.1.0',
    '943e0d825bb66ba582e9a10d32743cbb136de460',
  ]);

  const blockProfile = await readJson('sources/profiles/wordpress.core71-block-attributes.json');
  const number = blockProfile.fields.find((field) => field.nativeToken === 'number');
  assert.equal(number.valueShape.kind, 'integer');
  assert.match(blockProfile.notes.join(' '), /number as the same value category as integer/);
});

test('freshness v2 retains independently observed exhaustive token sets', async () => {
  const manifest = await readJson('sources/official-sources.json');
  const lock = await readJson('sources.lock.json');
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(lock.schemaVersion, 2);
  const lockById = new Map(lock.sources.map((source) => [source.sourceId, source]));
  const enumerationRoles = new Set(['enumeration', 'management-schema', 'storage', 'delivery', 'sdk-source']);
  for (const source of manifest.sources) {
    if (source.completeness !== 'exhaustive' || !enumerationRoles.has(source.role)) continue;
    assert.ok(source.extract.tokenDiscovery, `${source.id}: tokenDiscovery`);
    const reviewed = lockById.get(source.id);
    assert.deepEqual(
      [...reviewed.observedTokens].sort(),
      [...source.extract.tokens].sort(),
      `${source.id}: independently observed token set`,
    );
  }
});

test('canonical facts and consumer policy maintain separate authority and provenance channels', async () => {
  const sourceProfiles = await loadSourceProfiles();
  for (const sourceProfile of sourceProfiles) {
    const compiled = await compileProfile(sourceProfile);
    for (const candidate of compiled.fields) {
      for (const operation of candidate.renderingOperations) {
        assert.notEqual(operation.authority, 'consumer-policy', operation.id);
        assert.equal('policyId' in operation, false, operation.id);
        if (operation.authority === 'official') {
          assert.ok(operation.evidence?.length > 0, operation.id);
          assert.equal('claimRefs' in operation, false, operation.id);
        } else {
          assert.equal(operation.authority, 'contract-derived', operation.id);
          assert.ok(operation.claimRefs?.length > 0, operation.id);
          assert.equal('evidence' in operation, false, operation.id);
        }
      }
    }
  }

  for (const relative of ['profiles/agent/generic.json', 'profiles/agent/react-nextjs.json']) {
    const agent = await readJson(relative);
    for (const rule of agent.rules) {
      for (const operation of rule.operations) {
        assert.equal(operation.authority, 'consumer-policy', operation.id);
        assert.ok(operation.policyId, operation.id);
        assert.equal('evidence' in operation, false, operation.id);
        assert.equal('claimRefs' in operation, false, operation.id);
      }
    }
  }
});

test('consumer profile routes are exact and do not expose unrouted CMS surfaces', async () => {
  const expected = {
    'ai-orchestration': {
      'contentful': 'contentful.cma.saas',
      'contentstack': 'contentstack.cma.saas',
      'optimizely-saas': 'optimizely-saas.sdk-2',
      'optimizely-paas': 'optimizely-paas.cms13-model',
      'sitecore-ai': 'sitecore-ai.content-sdk2',
      'sitecore-on-prem': 'sitecore-on-prem.headless22',
      'wordpress': 'wordpress.core71-meta',
    },
    cos: {
      contentful: 'contentful.cma.saas',
      contentstack: 'contentstack.cma.saas',
      optimizely: 'optimizely-saas.cms-api-v1',
      optimizelypaas: 'optimizely-paas.cms13-admin',
      sitecore: 'sitecore-ai.authoring.current',
      sitecoreonprem: 'sitecore-on-prem.xp104-authoring',
      wordpress: 'wordpress.core71-meta',
    },
    generic: {
      'contentful': 'contentful.cma.saas',
      'contentstack': 'contentstack.cma.saas',
      'optimizely-saas': 'optimizely-saas.sdk-2',
      'optimizely-paas': 'optimizely-paas.cms13-model',
      'sitecore-ai': 'sitecore-ai.content-sdk2',
      'sitecore-on-prem': 'sitecore-on-prem.headless22',
      'wordpress': 'wordpress.core71-meta',
    },
  };
  for (const [id, adapters] of Object.entries(expected)) {
    const profile = await readJson(`profiles/consumers/${id}.json`);
    assert.equal(profile.outputMode, id === 'cos' ? 'official-data' : 'selected-contract');
    assert.equal('agentProfile' in profile, id !== 'cos');
    assert.equal(profile.includeProvenanceInAgentContext, false);
    assert.deepEqual(profile.adapters, adapters);
  }
});

test('source claims do not contain local repository provenance', async () => {
  const files = await Promise.all(
    Object.keys(EXPECTED_NATIVE_TOKENS).map((id) => readFile(path.join(ROOT, 'sources/profiles', `${id}.json`), 'utf8')),
  );
  const joined = files.join('\n');
  assert.doesNotMatch(joined, /\/Users\//);
  assert.doesNotMatch(joined, /(?:ai-orchestration|COS-monorepo)\//);
});
