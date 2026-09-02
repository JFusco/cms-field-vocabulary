import Ajv2020 from 'ajv/dist/2020.js';
import { compileCatalog, json, listJson, readJson, sha256 } from './lib/catalog.mjs';
import { buildEvidenceLocatorIndex, validateProfileEvidence } from './lib/evidence.mjs';
import { validateTokenDiscoveryConfiguration } from './source-scan.mjs';

const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const schemas = {
  sourceManifest: await readJson('schemas/source-manifest.schema.json'),
  officialSource: await readJson('schemas/official-source.schema.json'),
  sourceProfile: await readJson('schemas/source-profile.schema.json'),
  profile: await readJson('schemas/profile.schema.json'),
  catalog: await readJson('schemas/catalog.schema.json'),
  selectedContract: await readJson('schemas/selected-contract.schema.json'),
  officialDataProjection: await readJson('schemas/official-data-projection.schema.json'),
  agentProfile: await readJson('schemas/agent-profile.schema.json'),
  consumerProfile: await readJson('schemas/consumer-profile.schema.json'),
  consumerConfig: await readJson('schemas/consumer-config.schema.json'),
  projectionManifest: await readJson('schemas/projection-manifest.schema.json'),
  sourceLock: await readJson('schemas/sources-lock.schema.json'),
  evidenceLocators: await readJson('schemas/evidence-locators.schema.json'),
  renderingDefinitions: await readJson('schemas/rendering-definitions.schema.json'),
};
for (const schema of Object.values(schemas)) ajv.addSchema(schema);

function assertSchema(schema, data, label) {
  const validate = ajv.getSchema(schema.$id);
  if (!validate(data)) throw new Error(`${label}: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);
}

const sourceManifest = await readJson('sources/official-sources.json');
const sourceLock = await readJson('sources.lock.json');
const locatorRegistry = await readJson('sources/evidence-locators.json');
const definitions = await readJson('definitions/rendering-operations.json');
assertSchema(schemas.sourceManifest, sourceManifest, 'sources/official-sources.json');
for (const source of sourceManifest.sources) assertSchema(schemas.officialSource, source, `official source ${source.id}`);
assertSchema(schemas.sourceLock, sourceLock, 'sources.lock.json');
assertSchema(schemas.evidenceLocators, locatorRegistry, 'sources/evidence-locators.json');
assertSchema(schemas.renderingDefinitions, definitions, 'definitions/rendering-operations.json');
const { officialSources, locatorSources } = buildEvidenceLocatorIndex(sourceManifest, locatorRegistry);

const sourceIds = new Set(sourceManifest.sources.map((source) => source.id));
if (sourceIds.size !== sourceManifest.sources.length) throw new Error('Official source IDs must be unique');
const lockIds = new Set(sourceLock.sources.map((source) => source.sourceId));
const lockById = new Map(sourceLock.sources.map((source) => [source.sourceId, source]));
const enumerationRoles = new Set(['enumeration', 'management-schema', 'storage', 'delivery', 'sdk-source']);
for (const sourceId of sourceIds) if (!lockIds.has(sourceId)) throw new Error(`sources.lock.json is missing ${sourceId}`);
for (const sourceId of lockIds) if (!sourceIds.has(sourceId)) throw new Error(`sources.lock.json contains unknown ${sourceId}`);
for (const source of sourceManifest.sources) {
  const locked = lockById.get(source.id);
  validateTokenDiscoveryConfiguration(source);
  if (
    sourceManifest.schemaVersion >= 2
    && source.completeness === 'exhaustive'
    && enumerationRoles.has(source.role)
    && !source.extract.tokenDiscovery
  ) {
    throw new Error(`${source.id}: exhaustive enumeration-bearing sources require independent tokenDiscovery`);
  }
  const declaredTokens = [...(source.extract.tokens || [])].sort();
  const reviewedTokens = [...(locked.requiredTokens || locked.tokens)].sort();
  const requiredTokenSetSha256 = locked.requiredTokenSetSha256 || locked.tokenSetSha256;
  if (json(declaredTokens) !== json(reviewedTokens)) throw new Error(`${source.id}: manifest tokens differ from the reviewed official token set`);
  if (requiredTokenSetSha256 !== sha256(json(reviewedTokens))) throw new Error(`${source.id}: reviewed required-token-set digest is invalid`);
  if (source.extract.tokenDiscovery) {
    if (!locked.observedTokens || !locked.observedTokenSetSha256) {
      throw new Error(`${source.id}: independent observed-token baseline is missing; review the official source`);
    }
    const observedTokens = [...locked.observedTokens].sort();
    if (locked.observedTokenSetSha256 !== sha256(json(observedTokens))) {
      throw new Error(`${source.id}: independent observed-token-set digest is invalid`);
    }
    const observedTokenSet = new Set(observedTokens);
    const absent = declaredTokens.filter((token) => !observedTokenSet.has(token));
    if (absent.length > 0) {
      throw new Error(`${source.id}: tokenDiscovery baseline omits required token(s): ${absent.join(', ')}`);
    }
  } else if (sourceLock.schemaVersion >= 2 && (locked.observedTokens !== null || locked.observedTokenSetSha256 !== null)) {
    throw new Error(`${source.id}: observed-token baseline requires tokenDiscovery configuration`);
  }
  for (const [label, current, reviewed] of [
    ['vendor', source.vendor, locked.vendor],
    ['title', source.title, locked.title],
    ['role', source.role, locked.sourceRole],
    ['completeness', source.completeness, locked.completeness],
    ['version', source.version, locked.sourceVersion],
    ['locator', source.locator, locked.locator],
    ['extraction', source.extract, locked.extraction],
  ]) {
    if (json(current) !== json(reviewed)) throw new Error(`${source.id}: reviewed ${label} snapshot is stale`);
  }
  if (locked.reviewer !== source.reviewOwner) throw new Error(`${source.id}: reviewed owner snapshot is stale`);
  const reviewedUrl = new URL(locked.url);
  if (reviewedUrl.protocol !== 'https:' || !source.allowedHosts.includes(reviewedUrl.hostname)) {
    throw new Error(`${source.id}: reviewed URL escaped the official host allowlist`);
  }
  if (source.version.value && locked.resolvedRevision !== source.version.value) {
    throw new Error(`${source.id}: reviewed revision does not match the pinned source version`);
  }
  if (source.role === 'release-index' && locked.identities.length === 0) {
    throw new Error(`${source.id}: reviewed release index has no extracted identities`);
  }
  if (source.replacementHistory && json(source.replacementHistory) !== json(locked.replacementHistory)) {
    throw new Error(`${source.id}: replacement history is not retained in the reviewed lock`);
  }
}

const { body, sourceProfiles, profiles } = await compileCatalog();
assertSchema(schemas.catalog, body, 'compiled catalog');
const profileIds = new Set();
const fieldIds = new Set();
const sourceProfilesById = new Map(sourceProfiles.map((profile) => [profile.id, profile]));
const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
for (const source of sourceManifest.sources) {
  const expectedApplicability = source.profiles.map((profileId) => {
    const profile = sourceProfilesById.get(profileId);
    if (!profile) throw new Error(`${source.id}: unknown applicability profile ${profileId}`);
    return {
      profileId,
      product: profile.product,
      version: profile.version,
      surface: profile.surface,
      transport: profile.transport,
    };
  });
  if (json(expectedApplicability) !== json(lockById.get(source.id).applicability)) {
    throw new Error(`${source.id}: reviewed product/version/transport applicability is stale`);
  }
}
for (const sourceProfile of sourceProfiles) {
  assertSchema(schemas.sourceProfile, sourceProfile, `source profile ${sourceProfile.id}`);
  if (profileIds.has(sourceProfile.id)) throw new Error(`Duplicate profile ID ${sourceProfile.id}`);
  profileIds.add(sourceProfile.id);
  for (const sourceId of sourceProfile.sourceIds) if (!sourceIds.has(sourceId)) throw new Error(`${sourceProfile.id}: unknown source ${sourceId}`);
}
for (const profile of profiles) {
  assertSchema(schemas.profile, profile, `compiled profile ${profile.id}`);
  validateProfileEvidence({
    sourceProfile: sourceProfilesById.get(profile.id),
    profile,
    officialSources,
    locatorSources,
    definitions,
  });
  for (const field of profile.fields) {
    if (fieldIds.has(field.canonicalId)) throw new Error(`Duplicate field ID ${field.canonicalId}`);
    fieldIds.add(field.canonicalId);
    for (const claim of Object.values(field.claims)) {
      if (claim.status === 'documented' && claim.evidence.length === 0) throw new Error(`${field.canonicalId}: documented claim lacks evidence`);
      if (claim.status === 'undocumented' && (claim.value !== null || claim.evidence.length !== 0)) throw new Error(`${field.canonicalId}: undocumented claim must be null and uncited`);
    }
    for (const operation of field.renderingOperations) {
      if (operation.authority === 'official') {
        if (!operation.evidence || operation.evidence.length === 0) throw new Error(`${operation.id}: official operation lacks evidence`);
        if (operation.claimRefs) throw new Error(`${operation.id}: official operation cannot claim contract-derived authority`);
      }
      if (operation.authority === 'contract-derived') {
        if (!operation.claimRefs || operation.claimRefs.length === 0) throw new Error(`${operation.id}: contract-derived operation lacks claimRefs`);
        if (operation.evidence) throw new Error(`${operation.id}: contract-derived operation cannot claim official evidence`);
      }
      if (operation.authority === 'consumer-policy') throw new Error(`${operation.id}: consumer policy cannot live in canonical source`);
    }
  }
}

const agentProfiles = new Map();
const operationKinds = new Set(definitions.operationKinds);
const authorities = new Set(definitions.authorities);
const formatStrategies = new Set(definitions.formatStrategies);
const prohibitionCodes = new Set(definitions.prohibitionCodes);
const selectionDiscriminators = new Map(Object.entries(definitions.selectionDiscriminators));
for (const file of await listJson('profiles/agent')) {
  const profile = await readJson(`profiles/agent/${file}`);
  assertSchema(schemas.agentProfile, profile, `agent profile ${profile.id}`);
  if (agentProfiles.has(profile.id)) throw new Error(`Duplicate agent profile ${profile.id}`);
  agentProfiles.set(profile.id, profile);
  for (const rule of profile.rules) {
    if (!fieldIds.has(rule.fieldId)) throw new Error(`${profile.id}: unknown field ${rule.fieldId}`);
    for (const operation of rule.operations) {
      if (operation.authority !== 'consumer-policy' || !operation.policyId) throw new Error(`${operation.id}: agent rules must be labeled consumer-policy with policyId`);
      if (operation.evidence || operation.claimRefs) throw new Error(`${operation.id}: consumer policy cannot claim vendor evidence`);
      if (!operationKinds.has(operation.operation)) throw new Error(`${operation.id}: unknown rendering operation ${operation.operation}`);
      if (!authorities.has(operation.authority)) throw new Error(`${operation.id}: unknown rendering authority ${operation.authority}`);
      if (operation.formatStrategy && !formatStrategies.has(operation.formatStrategy)) throw new Error(`${operation.id}: unknown format strategy ${operation.formatStrategy}`);
      if (operation.selection) {
        const allowed = selectionDiscriminators.get(operation.selection.discriminator);
        if (!allowed) throw new Error(`${operation.id}: unknown rendering selection discriminator ${operation.selection.discriminator}`);
        if (!allowed.includes(operation.selection.equals)) throw new Error(`${operation.id}: unknown ${operation.selection.discriminator} value ${operation.selection.equals}`);
      }
      for (const code of operation.prohibitionCodes) if (!prohibitionCodes.has(code)) throw new Error(`${operation.id}: unknown prohibition code ${code}`);
      if (operation.rendererId && (
        !Object.hasOwn(profile.rendererBindings, operation.rendererId)
        || typeof profile.rendererBindings[operation.rendererId] !== 'string'
        || profile.rendererBindings[operation.rendererId].length === 0
      )) throw new Error(`${operation.id}: ${profile.id} lacks renderer binding ${operation.rendererId}`);
    }
  }
}

for (const file of await listJson('profiles/consumers')) {
  const profile = await readJson(`profiles/consumers/${file}`);
  assertSchema(schemas.consumerProfile, profile, `consumer profile ${profile.id}`);
  const agent = profile.outputMode === 'selected-contract'
    ? agentProfiles.get(profile.agentProfile)
    : null;
  if (profile.outputMode === 'selected-contract' && !agent) {
    throw new Error(`${profile.id}: unknown agent profile ${profile.agentProfile}`);
  }
  for (const profileId of Object.values(profile.adapters)) {
    if (!profileIds.has(profileId)) throw new Error(`${profile.id}: unknown vocabulary profile ${profileId}`);
    for (const field of profilesById.get(profileId).fields) {
      for (const operation of field.renderingOperations) {
        if (operation.rendererId && agent && (
          !Object.hasOwn(agent.rendererBindings, operation.rendererId)
          || typeof agent.rendererBindings[operation.rendererId] !== 'string'
          || agent.rendererBindings[operation.rendererId].length === 0
        )) {
          throw new Error(`${profile.id}: ${agent.id} lacks renderer binding ${operation.rendererId} required by ${field.canonicalId}`);
        }
      }
    }
  }
}

const requiredPlatforms = ['contentful', 'contentstack', 'optimizely-saas', 'optimizely-paas', 'sitecore-ai', 'sitecore-on-prem', 'wordpress'];
const platforms = new Set(profiles.map((profile) => profile.platform));
for (const platform of requiredPlatforms) if (!platforms.has(platform)) throw new Error(`Missing required platform ${platform}`);

console.log(`Validated ${sourceIds.size} official sources, ${profiles.length} profiles, and ${fieldIds.size} native field facts.`);
