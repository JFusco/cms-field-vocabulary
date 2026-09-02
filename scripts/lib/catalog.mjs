import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

export function json(value) {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), 'utf8'));
}

export async function listJson(relativeDirectory) {
  const directory = path.join(ROOT, relativeDirectory);
  const entries = await readdir(directory);
  return entries.filter((entry) => entry.endsWith('.json')).sort();
}

function canonicalSuffix(nativeToken) {
  const compact = nativeToken.replace(/[^A-Za-z0-9._-]+/g, ' ').trim();
  const pieces = compact.split(/[\s_-]+/).filter(Boolean);
  if (pieces.length === 0) throw new Error(`Cannot derive canonical suffix from ${JSON.stringify(nativeToken)}`);
  if (pieces.length === 1 && /^[a-z][A-Za-z0-9.]*$/.test(pieces[0])) return pieces[0];
  return pieces.map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1)).join('');
}

function uniqueEvidence(...groups) {
  const result = [];
  const seen = new Set();
  for (const group of groups) {
    for (const evidence of group || []) {
      const key = `${evidence.sourceId}\0${evidence.locator}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(evidence);
      }
    }
  }
  return result;
}

function textClaim(value, evidence) {
  return value === null || value === undefined
    ? { status: 'undocumented', value: null, evidence: [] }
    : { status: 'documented', value, evidence };
}

const EVIDENCE_BACKED_CLAIMS = [
  'valueShape',
  'typicalUse',
  'editorBehavior',
  'storageShape',
  'deliveryShape',
];

function defaultRendering(profileId, suffix, valueShape) {
  const operationSuffix = suffix.toLowerCase();
  const operationByKind = {
    string: 'direct',
    boolean: 'branch',
    integer: 'direct',
    number: 'direct',
    datetime: 'format',
    object: 'pass-through',
    array: 'iterate',
    reference: 'reference',
    'rich-text': 'pass-through',
    binary: 'asset',
    unknown: 'pass-through',
  };
  const prohibitionByKind = {
    object: ['flatten-structured-value'],
    array: ['flatten-list'],
    reference: ['flatten-reference'],
    'rich-text': ['coerce-rich-text-to-plain-string'],
    binary: ['assume-binary-string-url'],
    unknown: ['assume-undocumented-shape'],
  };
  return [{
    id: `${profileId}.${operationSuffix}.render`,
    operation: operationByKind[valueShape.kind],
    authority: 'contract-derived',
    valuePath: valueShape.valuePath || '$',
    nullHandling: valueShape.nullable ? 'preserve' : 'not-applicable',
    prohibitionCodes: prohibitionByKind[valueShape.kind] || [],
    claimRefs: ['claims.valueShape'],
  }];
}

export function compileSourceProfile(sourceProfile, officialSources = []) {
  const profileSourceIds = new Set(sourceProfile.sourceIds);
  const nativeTokens = new Set();
  const canonicalIds = new Set();
  const fields = sourceProfile.fields.map((sourceField) => {
    const field = typeof sourceField === 'string'
      ? { nativeToken: sourceField, valueShape: null, renderingOperations: [] }
      : sourceField;
    if (nativeTokens.has(field.nativeToken)) throw new Error(`${sourceProfile.id}: duplicate nativeToken ${field.nativeToken}`);
    nativeTokens.add(field.nativeToken);
    const suffix = field.canonicalSuffix || canonicalSuffix(field.nativeToken);
    const canonicalId = `${sourceProfile.id}.${suffix}`;
    if (canonicalIds.has(canonicalId)) throw new Error(`${sourceProfile.id}: duplicate canonicalId ${canonicalId}`);
    canonicalIds.add(canonicalId);

    const exactTokenEvidence = officialSources
      .filter((source) => profileSourceIds.has(source.id) && (source.extract.tokens || []).includes(field.nativeToken))
      .map((source) => ({ sourceId: source.id, locator: source.locator }));
    const typeEvidence = uniqueEvidence(exactTokenEvidence, field.evidence);
    if (typeEvidence.length === 0) {
      throw new Error(`${sourceProfile.id}: native token ${JSON.stringify(field.nativeToken)} has no exact official-source evidence`);
    }
    const claimEvidence = (claim) => uniqueEvidence(field.claimEvidence?.[claim]);
    for (const claim of EVIDENCE_BACKED_CLAIMS) {
      if (field[claim] !== null && field[claim] !== undefined && claimEvidence(claim).length === 0) {
        throw new Error(
          `${sourceProfile.id}.${field.nativeToken}.${claim}: authored claim requires explicit claimEvidence`,
        );
      }
    }
    const hasValueShape = Boolean(field.valueShape);
    const renderingOperations = hasValueShape
      ? (field.renderingOperations.length > 0
          ? field.renderingOperations
          : defaultRendering(sourceProfile.id, suffix, field.valueShape))
      : [];

    return {
      canonicalId,
      nativeToken: field.nativeToken,
      ...(field.displayName ? { displayName: field.displayName } : {}),
      origin: 'native',
      applicability: {
        profileId: sourceProfile.id,
        product: sourceProfile.product,
        version: sourceProfile.version,
        surface: sourceProfile.surface,
        transport: sourceProfile.transport,
      },
      claims: {
        nativeType: textClaim(field.nativeToken, typeEvidence),
        valueShape: hasValueShape
          ? { status: 'documented', value: field.valueShape, evidence: claimEvidence('valueShape') }
          : { status: 'undocumented', value: null, evidence: [] },
        typicalUse: textClaim(field.typicalUse, claimEvidence('typicalUse')),
        editorBehavior: textClaim(field.editorBehavior, claimEvidence('editorBehavior')),
        storageShape: textClaim(field.storageShape, claimEvidence('storageShape')),
        deliveryShape: textClaim(field.deliveryShape, claimEvidence('deliveryShape')),
      },
      renderingOperations,
      formats: field.formats || [],
    };
  });

  return {
    schemaVersion: sourceProfile.schemaVersion,
    id: sourceProfile.id,
    platform: sourceProfile.platform,
    product: sourceProfile.product,
    version: sourceProfile.version,
    surface: sourceProfile.surface,
    transport: sourceProfile.transport,
    extensibility: sourceProfile.extensibility,
    ...(sourceProfile.notes ? { notes: sourceProfile.notes } : {}),
    sourceIds: [...sourceProfile.sourceIds].sort(),
    fields: fields.sort((left, right) => left.canonicalId.localeCompare(right.canonicalId)),
  };
}

export async function loadSourceProfiles() {
  const files = await listJson('sources/profiles');
  const profiles = [];
  for (const file of files) profiles.push(await readJson(`sources/profiles/${file}`));
  return profiles.sort((left, right) => left.id.localeCompare(right.id));
}

export async function compileCatalog() {
  const sourceManifest = await readJson('sources/official-sources.json');
  const sourceLock = await readJson('sources.lock.json');
  const sourceProfiles = await loadSourceProfiles();
  const lockedSources = new Map(sourceLock.sources.map((source) => [source.sourceId, source]));
  const reviewedOfficialSources = sourceManifest.sources.map((source) => {
    const locked = lockedSources.get(source.id);
    if (!locked) throw new Error(`sources.lock.json is missing ${source.id}`);
    return {
      ...source,
      extract: {
        ...source.extract,
        tokens: locked.requiredTokens || locked.tokens,
      },
    };
  });
  const profiles = sourceProfiles.map((profile) => compileSourceProfile(profile, reviewedOfficialSources));
  const platforms = [...new Set(profiles.map((profile) => profile.platform))].sort();
  const sourceLockDigest = `sha256:${sha256(json(sourceLock))}`;
  const body = {
    schemaVersion: 1,
    catalogVersion: 1,
    sourceLockDigest,
    platforms,
    profiles,
  };
  return { body, sourceManifest, sourceLock, sourceProfiles, profiles };
}

function claimText(claim) {
  if (!claim || claim.status === 'undocumented') return 'Undocumented';
  if (typeof claim.value === 'string') return claim.value;
  return JSON.stringify(claim.value);
}

function renderingText(field) {
  if (field.renderingOperations.length === 0) return 'Undocumented';
  return field.renderingOperations.map((operation) => {
    const parts = [operation.operation];
    if (operation.valuePath) parts.push(`read ${operation.valuePath}`);
    if (operation.rendererId) parts.push(`renderer ${operation.rendererId}`);
    if (operation.editTarget) parts.push(`edit target ${operation.editTarget}`);
    if (operation.selection) parts.push(`when ${operation.selection.discriminator}=${operation.selection.equals}`);
    if (operation.prohibitionCodes.length > 0) parts.push(`forbid ${operation.prohibitionCodes.join(', ')}`);
    return parts.join('; ');
  }).join('<br>');
}

function evidenceText(field) {
  const ids = new Set();
  for (const claim of Object.values(field.claims)) {
    for (const evidence of claim.evidence) ids.add(`${evidence.sourceId} — ${evidence.locator}`);
  }
  for (const operation of field.renderingOperations) {
    for (const evidence of operation.evidence || []) ids.add(`${evidence.sourceId} — ${evidence.locator}`);
  }
  return [...ids].sort().join('<br>');
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

export function profileMarkdown(profile) {
  const rows = profile.fields.map((field) => {
    const authorities = [...new Set(field.renderingOperations.map((operation) => operation.authority))].sort().join(', ') || 'undocumented';
    return `| \`${escapeCell(field.nativeToken)}\` | ${escapeCell(claimText(field.claims.valueShape))} | ${escapeCell(claimText(field.claims.typicalUse))} | ${escapeCell(renderingText(field))} | ${escapeCell(authorities)} | ${escapeCell(evidenceText(field))} |`;
  });
  return [
    `# ${profile.product}: ${profile.id}`,
    '',
    '> Generated from structured, official-source-backed records. Do not edit this file manually.',
    '',
    `- Surface: ${profile.surface}`,
    `- Transport: ${profile.transport}`,
    `- Version: ${profile.version.label}`,
    `- Extensibility: ${profile.extensibility}`,
    '',
    '| Native type | What it holds | Typical use | Rendering implication | Authority | Evidence |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}

export async function existingGeneratedFiles(relativeDirectory) {
  const root = path.join(ROOT, relativeDirectory);
  try {
    const rootStat = await stat(root);
    if (!rootStat.isDirectory()) return [];
  } catch {
    return [];
  }
  const output = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else output.push(path.relative(ROOT, absolute).split(path.sep).join('/'));
    }
  }
  await visit(root);
  return output.sort();
}
