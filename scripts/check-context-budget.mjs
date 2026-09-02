import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveFieldContracts } from '../dist/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const budgetPath = path.join(root, 'profiles/context-budget.json');
const budget = JSON.parse(await readFile(budgetPath, 'utf8'));
const fixtures = {
  empty: { profileId: 'optimizely-saas.sdk-2', fieldIds: [], agentProfile: 'react-nextjs' },
  'optimizely-richtext-link': {
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: ['optimizely-saas.sdk-2.richText', 'optimizely-saas.sdk-2.link'],
    agentProfile: 'react-nextjs',
  },
  'optimizely-content-reference-link': {
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: ['optimizely-saas.sdk-2.contentReference'],
    agentProfile: 'react-nextjs',
    renderingSelections: [{
      fieldId: 'optimizely-saas.sdk-2.contentReference',
      discriminator: 'content-reference-usage',
      value: 'link',
    }],
  },
  'optimizely-content-reference-media': {
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: ['optimizely-saas.sdk-2.contentReference'],
    agentProfile: 'react-nextjs',
    renderingSelections: [{
      fieldId: 'optimizely-saas.sdk-2.contentReference',
      discriminator: 'content-reference-usage',
      value: 'media',
    }],
  },
  'optimizely-paas-richtext-reference': {
    profileId: 'optimizely-paas.cms13-model',
    fieldIds: [
      'optimizely-paas.cms13-model.XhtmlString',
      'optimizely-paas.cms13-model.ContentReferenceGeneric',
    ],
    agentProfile: 'generic',
  },
  'sitecore-ai-text-image': {
    profileId: 'sitecore-ai.content-sdk2',
    fieldIds: ['sitecore-ai.content-sdk2.SingleLineText', 'sitecore-ai.content-sdk2.Image'],
    agentProfile: 'react-nextjs',
  },
  'contentstack-link-reference': {
    profileId: 'contentstack.cma.saas',
    fieldIds: ['contentstack.cma.saas.link', 'contentstack.cma.saas.reference'],
    agentProfile: 'react-nextjs',
  },
};

const update = process.argv.includes('--update');
const wordsPerToken = 0.75;
const fixtureNames = Object.keys(fixtures).sort();
const configuredNames = Object.keys(budget.fixtures || {}).sort();
if (budget.schemaVersion !== 1 || budget.benchmarkVersion !== 1 || budget.policy !== 'ratchet') {
  throw new Error('profiles/context-budget.json has an unsupported benchmark contract');
}
if (budget.wordsPerToken !== wordsPerToken) {
  throw new Error(`profiles/context-budget.json must use wordsPerToken ${wordsPerToken}`);
}
if (JSON.stringify(configuredNames) !== JSON.stringify(fixtureNames)) {
  throw new Error('profiles/context-budget.json fixture names are stale; run pnpm context:update and review the diff');
}

function estimateTokens(serialized) {
  const words = serialized.trim() ? serialized.trim().split(/\s+/).length : 0;
  return Math.round(words / wordsPerToken);
}

const observed = Object.fromEntries(fixtureNames.map((name) => {
  const serialized = `${JSON.stringify(resolveFieldContracts(fixtures[name]), null, 2)}\n`;
  return [name, {
    maxBytes: Buffer.byteLength(serialized),
    maxTokens: estimateTokens(serialized),
  }];
}));

if (update) {
  const next = {
    schemaVersion: 1,
    benchmarkVersion: 1,
    policy: 'ratchet',
    wordsPerToken,
    fixtures: observed,
  };
  await writeFile(budgetPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Updated ${fixtureNames.length} selected-contract context baselines.`);
  process.exit(0);
}

const errors = [];
for (const name of fixtureNames) {
  const current = observed[name];
  const ceiling = budget.fixtures[name];
  if (!Number.isInteger(ceiling.maxBytes) || !Number.isInteger(ceiling.maxTokens)) {
    errors.push(`${name}: ratchet must define integer maxBytes and maxTokens`);
    continue;
  }
  if (current.maxBytes > ceiling.maxBytes) {
    errors.push(`${name}: ${current.maxBytes} bytes exceeds ratchet ${ceiling.maxBytes}`);
  }
  if (current.maxTokens > ceiling.maxTokens) {
    errors.push(`${name}: ${current.maxTokens} tokens exceeds ratchet ${ceiling.maxTokens}`);
  }
  console.log(`${name}: ${current.maxBytes}/${ceiling.maxBytes} bytes; ${current.maxTokens}/${ceiling.maxTokens} tokens`);
}
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
