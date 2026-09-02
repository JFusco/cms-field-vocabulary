import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ROOT, json, readJson, sha256 } from './lib/catalog.mjs';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function decodeHtml(value) {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

export function normalizeDocument(value) {
  return decodeHtml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/\b(?:nonce|data-request-id|data-build-id|data-timestamp|data-cfemail)=(['"])[\s\S]*?\1/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function allOccurrences(value, token) {
  const positions = [];
  let offset = 0;
  while (positions.length < 256) {
    const found = value.indexOf(token, offset);
    if (found === -1) break;
    positions.push(found);
    offset = found + Math.max(token.length, 1);
  }
  return positions;
}

function smallestTokenWindow(value, tokens) {
  const occurrences = tokens.flatMap((token, tokenIndex) =>
    allOccurrences(value, token).map((position) => ({ position, tokenIndex, length: token.length })),
  ).sort((left, right) => left.position - right.position);
  if (occurrences.length === 0) return null;
  const counts = new Map();
  let covered = 0;
  let left = 0;
  let best = null;
  for (let right = 0; right < occurrences.length; right += 1) {
    const rightOccurrence = occurrences[right];
    const nextCount = (counts.get(rightOccurrence.tokenIndex) || 0) + 1;
    counts.set(rightOccurrence.tokenIndex, nextCount);
    if (nextCount === 1) covered += 1;
    while (covered === tokens.length && left <= right) {
      const leftOccurrence = occurrences[left];
      const end = rightOccurrence.position + rightOccurrence.length;
      if (!best || end - leftOccurrence.position < best.end - best.start) {
        best = { start: leftOccurrence.position, end };
      }
      const remaining = counts.get(leftOccurrence.tokenIndex) - 1;
      counts.set(leftOccurrence.tokenIndex, remaining);
      if (remaining === 0) covered -= 1;
      left += 1;
    }
  }
  return best;
}

function lastStructuralStart(value, expression, before) {
  let result = -1;
  for (const match of value.matchAll(expression)) {
    if (match.index > before) break;
    result = match.index;
  }
  return result;
}

function structuralFragment(value, kind, window) {
  const radius = 2048;
  let start = Math.max(0, window.start - radius);
  let end = Math.min(value.length, window.end + radius);
  const structures = {
    table: { start: /<table\b/gi, end: /<\/table\s*>/gi },
    list: { start: /<(?:ul|ol)\b/gi, end: /<\/(?:ul|ol)\s*>/gi },
    heading: { start: /<h[1-6]\b/gi, end: /<h[1-6]\b/gi },
  };
  const structure = structures[kind];
  if (!structure) return value.slice(start, end);
  const structuredStart = lastStructuralStart(value, structure.start, window.start);
  structure.end.lastIndex = window.end;
  const structuredEnd = structure.end.exec(value);
  if (structuredStart !== -1) start = structuredStart;
  if (structuredEnd) end = kind === 'heading' ? structuredEnd.index : structuredEnd.index + structuredEnd[0].length;
  return value.slice(start, end);
}

export function extractEvidenceFragment(source, normalized) {
  const identities = extractSourceIdentities(source, normalized);
  if (source.extract.identityPattern) return json(identities);
  const declaredTokens = [...(source.extract.tokens || [])];
  const tokenWindow = smallestTokenWindow(normalized, declaredTokens);
  if (tokenWindow) return structuralFragment(normalized, source.extract.kind, tokenWindow);
  const locatorValue = source.locator || '';
  const locatorCandidates = [
    locatorValue,
    ...locatorValue.split('>').map((part) => part.trim()).filter(Boolean).sort((left, right) => right.length - left.length),
  ].filter(Boolean);
  for (const locator of locatorCandidates) {
    const index = normalized.indexOf(locator);
    if (index !== -1) return structuralFragment(normalized, source.extract.kind, { start: index, end: index + locator.length });
  }
  return normalized;
}

export function extractSourceIdentities(source, normalized) {
  if (!source.extract.identityPattern) return [];
  const configuredFlags = source.extract.identityFlags || 'g';
  const flags = configuredFlags.includes('g') ? configuredFlags : `${configuredFlags}g`;
  const expression = new RegExp(source.extract.identityPattern, flags);
  const capture = source.extract.identityCapture || 0;
  const identities = new Set();
  for (const match of normalized.matchAll(expression)) {
    const value = match[capture];
    if (typeof value === 'string' && value.trim()) identities.add(value.trim());
    if (identities.size >= 2000) throw new Error(`${source.id}: identity extraction exceeded 2000 entries`);
  }
  return [...identities].sort();
}

export function extractRequiredTokens(source, fragment) {
  return [...(source.extract.tokens || [])].filter((token) => fragment.includes(token)).sort();
}

function compileDiscoveryPattern(source, region, property, repeated = false) {
  const pattern = region[property];
  if (!pattern) return null;
  const flagsProperty = property === 'itemPattern' ? 'itemFlags' : 'boundaryFlags';
  let flags = region[flagsProperty] || '';
  if (repeated && !flags.includes('g')) flags += 'g';
  try {
    return new RegExp(pattern, flags);
  } catch (error) {
    throw new Error(`${source.id}: token discovery region ${region.id} has invalid ${property}: ${error.message}`, { cause: error });
  }
}

export function validateTokenDiscoveryConfiguration(source) {
  const discovery = source.extract.tokenDiscovery;
  if (!discovery) return;
  const regionIds = new Set();
  const requiredTokens = source.extract.tokens || [];
  if (discovery.maximumTokens < requiredTokens.length) {
    throw new Error(`${source.id}: token discovery maximumTokens is smaller than the required token set`);
  }
  for (const region of discovery.regions) {
    if (regionIds.has(region.id)) throw new Error(`${source.id}: duplicate token discovery region ${region.id}`);
    regionIds.add(region.id);
    for (const property of ['startPattern', 'endPattern', 'itemPattern']) {
      if (!region[property]) continue;
      for (const token of requiredTokens) {
        if (region[property].includes(token)) {
          throw new Error(`${source.id}: token discovery ${property} must not embed required token ${token}`);
        }
      }
      compileDiscoveryPattern(source, region, property, property === 'itemPattern');
    }
  }
}

function discoveryRegion(source, normalized, region) {
  let scoped = normalized;
  if (region.startPattern) {
    const startExpression = compileDiscoveryPattern(source, region, 'startPattern');
    const startMatch = startExpression.exec(normalized);
    if (!startMatch) throw new Error(`${source.id}: token discovery region ${region.id} start boundary was not found`);
    const start = startMatch.index + startMatch[0].length;
    const remainder = normalized.slice(start);
    const endExpression = compileDiscoveryPattern(source, region, 'endPattern');
    const endMatch = endExpression.exec(remainder);
    if (!endMatch) throw new Error(`${source.id}: token discovery region ${region.id} end boundary was not found`);
    scoped = remainder.slice(0, endMatch.index);
  }
  const expression = compileDiscoveryPattern(source, region, 'itemPattern', true);
  const values = [];
  for (const match of scoped.matchAll(expression)) {
    const value = match[region.itemCapture];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${source.id}: token discovery region ${region.id} did not populate capture ${region.itemCapture}`);
    }
    values.push(value.trim());
    if (values.length > 5000) throw new Error(`${source.id}: token discovery region ${region.id} exceeded 5000 matches`);
  }
  if (values.length === 0) throw new Error(`${source.id}: token discovery region ${region.id} found no tokens`);
  return values;
}

export function discoverObservedTokens(source, normalized) {
  const discovery = source.extract.tokenDiscovery;
  if (!discovery) return null;
  validateTokenDiscoveryConfiguration(source);
  const tokens = [...new Set(discovery.regions.flatMap((region) => discoveryRegion(source, normalized, region)))].sort();
  if (tokens.length > discovery.maximumTokens) {
    throw new Error(`${source.id}: token discovery found ${tokens.length} tokens, exceeding maximumTokens ${discovery.maximumTokens}`);
  }
  return tokens;
}

export async function fetchOfficialSource(source) {
  let current = new URL(source.url);
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    if (!source.allowedHosts.includes(current.hostname)) throw new Error(`Redirect escaped official host allowlist: ${current.hostname}`);
    let response;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      response = await fetch(current, {
        redirect: 'manual',
        headers: {
          'user-agent': 'cms-field-vocabulary-freshness/1.0 (+https://github.com/JFusco/cms-field-vocabulary)',
          accept: 'text/html,application/json,text/plain;q=0.9',
        },
        signal: AbortSignal.timeout(30000),
      });
      if (response.status !== 429 && response.status < 500) break;
      const retryAfter = Number(response.headers.get('retry-after'));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 10000)
        : 750 * (2 ** attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`Redirect ${response.status} omitted Location`);
      current = new URL(location, current);
      continue;
    }
    if (response?.status === 404 || response?.status === 410) {
      return { url: current.toString(), body: '', removed: true, status: response.status };
    }
    if (!response || !response.ok) throw new Error(`HTTP ${response?.status || 'unknown'}`);
    return { url: current.toString(), body: await response.text(), removed: false, status: response.status };
  }
  throw new Error('Too many redirects');
}

export async function observeSource(source) {
  const observedAt = new Date().toISOString();
  try {
    const fetched = await fetchOfficialSource(source);
    if (fetched.removed) {
      return {
        sourceId: source.id,
        url: fetched.url,
        observedAt,
        reviewStatus: 'removed',
        rawSha256: null,
        normalizedSha256: null,
        fragmentSha256: null,
        requiredTokenSetSha256: null,
        requiredTokens: [],
        observedTokenSetSha256: null,
        observedTokens: null,
        identities: [],
        missingRequiredTokens: [...(source.extract.tokens || [])],
        missingObservedTokens: [],
        removed: true,
        note: `Official source returned HTTP ${fetched.status}`,
      };
    }
    const normalized = normalizeDocument(fetched.body);
    const identities = extractSourceIdentities(source, normalized);
    const fragment = source.extract.identityPattern ? json(identities) : extractEvidenceFragment(source, normalized);
    const declaredTokens = [...(source.extract.tokens || [])];
    const requiredTokens = extractRequiredTokens(source, fragment);
    const requiredTokenSet = new Set(requiredTokens);
    const missingRequiredTokens = declaredTokens.filter((token) => !requiredTokenSet.has(token));
    let observedTokens = null;
    let enumerationExtractionError;
    try {
      observedTokens = discoverObservedTokens(source, normalized);
    } catch (error) {
      enumerationExtractionError = error instanceof Error ? error.message : String(error);
    }
    const observedTokenSet = new Set(observedTokens || []);
    const missingObservedTokens = observedTokens
      ? declaredTokens.filter((token) => !observedTokenSet.has(token))
      : [];
    return {
      sourceId: source.id,
      url: fetched.url,
      observedAt,
      reviewStatus: 'reviewed',
      rawSha256: sha256(fetched.body),
      normalizedSha256: sha256(normalized),
      fragmentSha256: sha256(fragment),
      requiredTokenSetSha256: sha256(json(requiredTokens)),
      requiredTokens,
      observedTokenSetSha256: observedTokens ? sha256(json(observedTokens)) : null,
      observedTokens,
      identities,
      missingRequiredTokens,
      missingObservedTokens,
      ...(enumerationExtractionError ? { enumerationExtractionError } : {}),
    };
  } catch (error) {
    return {
      sourceId: source.id,
      url: source.url,
      observedAt,
      reviewStatus: 'unreachable',
      rawSha256: null,
      normalizedSha256: null,
      fragmentSha256: null,
      requiredTokenSetSha256: null,
      requiredTokens: [],
      observedTokenSetSha256: null,
      observedTokens: null,
      identities: [],
      missingRequiredTokens: [],
      missingObservedTokens: [],
      note: error instanceof Error ? error.message : String(error),
    };
  }
}

export function classifyObservation(observation, locked, sourceOrRole) {
  const role = typeof sourceOrRole === 'string' ? sourceOrRole : sourceOrRole.role;
  const tokenDiscoveryConfigured = typeof sourceOrRole === 'object' && Boolean(sourceOrRole.extract.tokenDiscovery);
  const missingRequiredTokens = observation.missingRequiredTokens || observation.missingTokens || [];
  const missingObservedTokens = observation.missingObservedTokens || [];
  if (observation.removed === true) return 'removed';
  if (observation.reviewStatus === 'unreachable') return 'unreachable';
  if (missingRequiredTokens.length > 0 || missingObservedTokens.length > 0) return 'enumeration-changing';
  if (!locked) return 'version-changing';
  if (tokenDiscoveryConfigured) {
    if (observation.enumerationExtractionError) return 'enumeration-changing';
    if (!observation.observedTokenSetSha256 || !locked.observedTokenSetSha256) return 'enumeration-changing';
    if (locked.observedTokenSetSha256 !== observation.observedTokenSetSha256) return 'enumeration-changing';
  }
  const observedFragmentSha256 = observation.fragmentSha256 || observation.normalizedSha256;
  const lockedFragmentSha256 = locked.fragmentSha256 || locked.normalizedSha256;
  if (lockedFragmentSha256 === observedFragmentSha256) {
    if (locked.rawSha256 && observation.rawSha256 && locked.rawSha256 !== observation.rawSha256) return 'cosmetic';
    return 'unchanged';
  }
  if (role === 'release-index') return 'version-changing';
  return 'claim-changing';
}

export function requiresAttention(classification) {
  return classification !== 'unchanged' && classification !== 'cosmetic';
}

function outputFile(outputPath) {
  const absolute = path.isAbsolute(outputPath) ? path.normalize(outputPath) : path.resolve(ROOT, outputPath);
  const allowedRoots = [path.resolve(ROOT, 'reports'), path.resolve(process.env.RUNNER_TEMP || tmpdir())];
  const allowed = allowedRoots.some((root) => absolute === root || absolute.startsWith(`${root}${path.sep}`));
  if (!allowed) throw new Error(`Scan output must stay below reports/ or the runner temporary directory: ${absolute}`);
  return absolute;
}

export async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let next = 0;
  async function worker() {
    while (next < values.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

async function main() {
  const mode = argument('--mode');
  if (!['index', 'full'].includes(mode)) throw new Error('--mode must be index or full');
  const outputPath = argument('--output', `reports/source-scan-${mode}.json`);
  const manifest = await readJson('sources/official-sources.json');
  const lock = JSON.parse(await readFile(path.join(ROOT, 'sources.lock.json'), 'utf8').catch(() => '{"sources":[]}'));
  const lockById = new Map((lock.sources || []).map((entry) => [entry.sourceId, entry]));
  const selected = manifest.sources.filter((source) => mode === 'full' || source.role === 'release-index');
  const observations = await mapWithConcurrency(selected, 3, async (source) => {
    const observation = await observeSource(source);
    return {
      ...observation,
      classification: classifyObservation(observation, lockById.get(source.id), source),
    };
  });
  const manifestIds = new Set(manifest.sources.map((source) => source.id));
  for (const locked of lock.sources || []) {
    if (manifestIds.has(locked.sourceId)) continue;
    observations.push({
      ...locked,
      missingRequiredTokens: [],
      missingObservedTokens: [],
      removed: true,
      classification: classifyObservation({ ...locked, missingRequiredTokens: [], missingObservedTokens: [], removed: true }, locked, 'enumeration'),
    });
  }
  const report = {
    schemaVersion: 2,
    mode,
    observedAt: new Date().toISOString(),
    attentionRequired: observations.some((observation) => requiresAttention(observation.classification)),
    observations,
  };
  const absolute = outputFile(outputPath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, json(report));
  console.log(absolute);
  if (report.attentionRequired) process.exitCode = 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  await main();
}
