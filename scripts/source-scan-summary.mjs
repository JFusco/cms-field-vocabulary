import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { readJson } from './lib/catalog.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function shortList(values, limit = 12) {
  if (values.length === 0) return 'none';
  const shown = values.slice(0, limit).map((value) => `\`${String(value).replaceAll('`', '\\`')}\``);
  if (values.length > limit) shown.push(`and ${values.length - limit} more in the JSON report`);
  return shown.join(', ');
}

export function renderScanSummary(reports, lock, manifest, runUrl) {
  const byId = new Map();
  for (const report of reports) {
    for (const observation of report.observations || []) byId.set(observation.sourceId, observation);
  }
  const locked = new Map((lock.sources || []).map((source) => [source.sourceId, source]));
  const sources = new Map((manifest.sources || []).map((source) => [source.id, source]));
  const attention = [...byId.values()].filter((item) => !['unchanged', 'cosmetic'].includes(item.classification));
  const lines = [
    '# Vendor documentation freshness',
    '',
    `- Run: ${runUrl}`,
    `- Reports: ${reports.map((report) => report.mode).join(', ')}`,
    `- Sources needing triage: ${attention.length}`,
    '',
  ];
  for (const item of attention) {
    const source = sources.get(item.sourceId);
    const previous = locked.get(item.sourceId);
    const before = new Set(previous?.identities || []);
    const after = new Set(item.identities || []);
    const added = [...after].filter((identity) => !before.has(identity));
    const removed = [...before].filter((identity) => !after.has(identity));
    lines.push(`## ${item.sourceId}: ${item.classification}`);
    lines.push('');
    lines.push(`- Official source: ${source?.url || item.url || 'not registered'}`);
    lines.push(`- Locator: ${source?.locator || 'not registered'}`);
    lines.push(`- Affected profiles: ${(source?.profiles || []).join(', ') || 'none'}`);
    lines.push(`- Observation fingerprint: \`${item.fragmentSha256 || item.normalizedSha256 || 'unavailable'}\``);
    if (item.note) lines.push(`- Fetch result: ${item.note}`);
    if (source?.role === 'release-index') {
      lines.push(`- Added identities (${added.length}): ${shortList(added)}`);
      lines.push(`- Removed identities (${removed.length}): ${shortList(removed)}`);
      lines.push('- Review the linked release entries for changes to the registered field surface; a new feed entry alone does not establish a vocabulary change.');
    } else {
      lines.push(`- Missing required tokens: ${shortList(item.missingRequiredTokens || [])}`);
      lines.push(`- Missing observed tokens: ${shortList(item.missingObservedTokens || [])}`);
      lines.push(`- Observed native tokens: ${item.observedTokens?.length ?? 'not independently extracted'}`);
      lines.push('- Compare the official locator with structured claims. A fragment hash change alone does not identify a changed claim.');
    }
    lines.push('');
  }
  if (attention.length === 0) lines.push('No source needs triage.', '');
  return lines.join('\n');
}

async function main() {
  const indexPath = argument('--index');
  const outputPath = argument('--output');
  if (!indexPath || !outputPath) throw new Error('--index and --output are required');
  const reports = [JSON.parse(await readFile(indexPath, 'utf8'))];
  const fullPath = argument('--full');
  if (fullPath) reports.push(JSON.parse(await readFile(fullPath, 'utf8')));
  const [lock, manifest] = await Promise.all([
    readJson('sources.lock.json'),
    readJson('sources/official-sources.json'),
  ]);
  await writeFile(outputPath, renderScanSummary(reports, lock, manifest, argument('--run-url') || 'local scan'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
