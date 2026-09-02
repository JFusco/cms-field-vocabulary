import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, json, loadSourceProfiles, readJson } from './lib/catalog.mjs';
import { mapWithConcurrency, observeSource } from './source-scan.mjs';

const requested = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const all = process.argv.includes('--all');
const allowManual = process.argv.includes('--allow-manual');
const metadataOnly = process.argv.includes('--metadata-only');
const manifest = await readJson('sources/official-sources.json');
const selected = all
  ? manifest.sources
  : manifest.sources.filter((source) => requested.includes(source.id));
if (selected.length === 0 && !metadataOnly) throw new Error('Usage: pnpm sources:review -- <source-id> [<source-id>...] or --all');
const unknown = requested.filter((id) => !manifest.sources.some((source) => source.id === id));
if (unknown.length > 0) throw new Error(`Unknown source ID(s): ${unknown.join(', ')}`);

let existing = { schemaVersion: 1, reviewedAt: new Date(0).toISOString(), sources: [] };
try {
  existing = await readJson('sources.lock.json');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
const byId = new Map(existing.sources.map((entry) => [entry.sourceId, entry]));
const sourceProfiles = await loadSourceProfiles();
const profileById = new Map(sourceProfiles.map((profile) => [profile.id, profile]));

function applicability(source) {
  return source.profiles.map((profileId) => {
    const profile = profileById.get(profileId);
    if (!profile) throw new Error(`${source.id}: unknown profile ${profileId}`);
    return {
      profileId,
      product: profile.product,
      version: profile.version,
      surface: profile.surface,
      transport: profile.transport,
    };
  });
}

function lockEntry(source, observation, previous) {
  const reviewed = Object.fromEntries(
    Object.entries(observation).filter(([key]) => ![
      'enumerationExtractionError',
      'missingObservedTokens',
      'missingRequiredTokens',
      'removed',
    ].includes(key)),
  );
  const entry = {
    ...reviewed,
    sourceId: source.id,
    vendor: source.vendor,
    title: source.title,
    sourceRole: source.role,
    completeness: source.completeness,
    sourceVersion: source.version,
    applicability: applicability(source),
    locator: source.locator,
    extraction: source.extract,
    reviewedAt: observation.observedAt,
    reviewer: source.reviewOwner,
    reviewStatus: 'reviewed',
    replacementHistory: source.replacementHistory || previous?.replacementHistory || [],
  };
  if (source.version.value) entry.resolvedRevision = source.version.value;
  return entry;
}

function enrichExisting(source, previous) {
  if (!previous) throw new Error(`No reviewed observation exists for ${source.id}`);
  const rawSha256 = previous.rawSha256;
  const normalizedSha256 = previous.normalizedSha256;
  const fragmentSha256 = previous.fragmentSha256 || normalizedSha256;
  const requiredTokenSetSha256 = previous.requiredTokenSetSha256 || previous.tokenSetSha256;
  const requiredTokens = previous.requiredTokens || previous.tokens;
  if (!rawSha256 || !normalizedSha256 || !fragmentSha256 || !requiredTokenSetSha256 || !requiredTokens) {
    throw new Error(`${source.id} has no retained reviewed fingerprint; review the official source before catalog publication`);
  }
  if (json(previous.extraction) !== json(source.extract)) {
    throw new Error(`${source.id}: extraction changed; review this official source instead of migrating metadata only`);
  }
  const discoveryConfigured = Boolean(source.extract.tokenDiscovery);
  const observedTokenSetSha256 = previous.observedTokenSetSha256 || null;
  const observedTokens = previous.observedTokens || null;
  if (discoveryConfigured && (!observedTokenSetSha256 || !observedTokens)) {
    throw new Error(`${source.id}: token discovery has no independently reviewed baseline; review this official source`);
  }
  return {
    sourceId: source.id,
    vendor: source.vendor,
    title: source.title,
    sourceRole: source.role,
    completeness: source.completeness,
    sourceVersion: source.version,
    applicability: applicability(source),
    locator: source.locator,
    extraction: source.extract,
    url: previous.url,
    observedAt: previous.observedAt,
    reviewedAt: previous.reviewedAt || previous.observedAt,
    reviewer: previous.reviewer || source.reviewOwner,
    reviewStatus: previous.reviewStatus === 'reviewed-manual' ? 'reviewed-manual' : 'reviewed',
    rawSha256,
    normalizedSha256,
    fragmentSha256,
    requiredTokenSetSha256,
    requiredTokens,
    observedTokenSetSha256,
    observedTokens,
    identities: previous.identities || [],
    ...(previous.resolvedRevision || source.version.value ? { resolvedRevision: previous.resolvedRevision || source.version.value } : {}),
    ...(previous.note ? { note: previous.note } : {}),
    replacementHistory: source.replacementHistory || previous.replacementHistory || [],
  };
}

const observations = metadataOnly
  ? []
  : await mapWithConcurrency(selected, 3, async (source) => ({ source, observation: await observeSource(source) }));
for (const { source, observation } of observations) {
  if (observation.reviewStatus !== 'reviewed') {
    if (!allowManual) throw new Error(`${source.id} could not be reviewed: ${observation.note}`);
    const previous = byId.get(source.id);
    if (!previous?.rawSha256 || !previous?.normalizedSha256) {
      throw new Error(`${source.id} is unavailable and has no prior reviewed snapshot to retain`);
    }
    console.warn(`Retaining the last reviewed snapshot for unavailable source ${source.id}: ${observation.note}`);
    continue;
  }
  const { enumerationExtractionError, missingObservedTokens, missingRequiredTokens } = observation;
  if (missingRequiredTokens.length > 0) {
    throw new Error(`${source.id} is missing required official token(s): ${missingRequiredTokens.join(', ')}`);
  }
  if (enumerationExtractionError) throw new Error(enumerationExtractionError);
  if (missingObservedTokens.length > 0) {
    throw new Error(`${source.id} token discovery missed required official token(s): ${missingObservedTokens.join(', ')}`);
  }
  if (source.extract.tokenDiscovery && (!observation.observedTokens || observation.observedTokens.length === 0)) {
    throw new Error(`${source.id} token discovery produced no independent enumeration baseline`);
  }
  if (source.role === 'release-index' && observation.identities.length === 0) {
    throw new Error(`${source.id} release-index extraction found no version or entry identities`);
  }
  byId.set(source.id, lockEntry(source, observation, byId.get(source.id)));
}

const lock = {
  schemaVersion: 2,
  reviewedAt: metadataOnly ? existing.reviewedAt : new Date().toISOString(),
  sources: manifest.sources.map((source) => {
    return enrichExisting(source, byId.get(source.id));
  }),
};
await writeFile(path.join(ROOT, 'sources.lock.json'), json(lock));
console.log(`Reviewed ${selected.length} source(s); lock contains ${lock.sources.length}.`);
