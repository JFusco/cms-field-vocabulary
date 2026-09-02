import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const PACKAGE_NAME = 'cms-field-vocabulary';
const PROFILES = ['ai-orchestration', 'cos', 'generic'];
const root = process.cwd();
let isolatedNpmCache;

function run(command, args, cwd, options = {}) {
  const env = {
    ...process.env,
    npm_config_audit: 'false',
    npm_config_fund: 'false',
  };
  if (isolatedNpmCache) env.npm_config_cache = isolatedNpmCache;
  if (options.offline) env.npm_config_offline = 'true';
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: options.capture ? 'pipe' : 'inherit',
    env,
  });
}

async function jsonFilesBelow(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await jsonFilesBelow(absolute)));
    else if (entry.isFile() && entry.name.endsWith('.json')) found.push(absolute);
  }
  return found.sort();
}

function findCanonicalId(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findCanonicalId(item);
      if (found) return found;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  if (typeof value.canonicalId === 'string' && value.canonicalId.trim()) return value.canonicalId;
  for (const child of Object.values(value)) {
    const found = findCanonicalId(child);
    if (found) return found;
  }
  return null;
}

async function firstCanonicalId(generatedRoot) {
  for (const file of await jsonFilesBelow(generatedRoot)) {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    const found = findCanonicalId(parsed);
    if (found) return found;
  }
  throw new Error(`packed generic projection contains no canonicalId below ${generatedRoot}`);
}

const sandbox = await mkdtemp(join(tmpdir(), 'cms-field-vocabulary-packed-'));
isolatedNpmCache = join(sandbox, 'npm-cache');
try {
  const packDirectory = join(sandbox, 'pack');
  const consumerRoot = join(sandbox, 'consumer');
  await mkdir(packDirectory, { recursive: true });
  await mkdir(consumerRoot, { recursive: true });

  const packedOutput = run(
    'npm',
    ['pack', '--ignore-scripts', '--pack-destination', packDirectory],
    root,
    { capture: true },
  );
  const tarballName = packedOutput.trim().split(/\r?\n/).at(-1);
  const tarball = join(packDirectory, tarballName);
  const listing = run('tar', ['-tzf', tarball], root, { capture: true });

  for (const expected of [
    'package/package.json',
    'package/bin/cms-field-vocabulary.mjs',
    'package/catalog/catalog.json',
    'package/catalog/profiles/optimizely-saas.sdk-2.json',
    'package/definitions/rendering-operations.json',
    'package/profiles/agent/react-nextjs.json',
    'package/schemas/consumer-config.schema.json',
    'package/schemas/selected-contract.schema.json',
    'package/sources/evidence-locators.json',
    'package/sources/official-sources.json',
    'package/sources.lock.json',
  ]) {
    assert.match(listing, new RegExp(`^${expected.replaceAll('.', '\\.')}$`, 'm'));
  }
  for (const excluded of ['package/.github/', 'package/tests/', 'package/wiki/', 'package/.env']) {
    assert.doesNotMatch(listing, new RegExp(`^${excluded.replaceAll('.', '\\.')}`, 'm'));
  }
  const packedContent = run('tar', ['-xOzf', tarball], root, { capture: true });
  assert.doesNotMatch(
    packedContent,
    /(?:\/Users\/[^/]+\/Projects|npm_[A-Za-z0-9]{30,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|registry\.npmjs\.org\/:_authToken=\S+)/,
  );

  const packedManifest = JSON.parse(
    run('tar', ['-xOf', tarball, 'package/package.json'], root, { capture: true }),
  );
  assert.equal(packedManifest.name, PACKAGE_NAME);
  assert.notEqual(packedManifest.private, true);
  assert.deepEqual(packedManifest.publishConfig, { access: 'public', provenance: true });
  assert.equal(packedManifest.bin?.[PACKAGE_NAME], 'bin/cms-field-vocabulary.mjs');

  let genericConfig;
  let genericTarget;
  let genericExecutable;
  for (const profile of PROFILES) {
    const profileRoot = join(consumerRoot, profile);
    const target = 'generated/cms-field-vocabulary';
    const configArgument = 'cms-field-vocabulary.config.json';
    const config = join(profileRoot, configArgument);
    await mkdir(profileRoot, { recursive: true });
    await writeFile(
      join(profileRoot, 'package.json'),
      `${JSON.stringify({
        name: `cms-field-vocabulary-packed-${profile}`,
        private: true,
        packageManager: 'pnpm@11.1.1',
        dependencies: { [PACKAGE_NAME]: `file:${tarball}` },
      }, null, 2)}\n`,
    );
    run(
      'pnpm',
      ['install', '--offline', '--ignore-scripts', '--no-frozen-lockfile'],
      profileRoot,
      { offline: true },
    );
    await writeFile(
      config,
      `${JSON.stringify({
        $schema: './node_modules/cms-field-vocabulary/schemas/consumer-config.schema.json',
        packageName: PACKAGE_NAME,
        profile,
        adapter: 'contentful',
        target,
      }, null, 2)}\n`,
    );
    const executable = join(profileRoot, 'node_modules', '.bin', PACKAGE_NAME);
    run(executable, ['sync', '--config', configArgument], profileRoot, { offline: true });
    run(executable, ['sync', '--config', configArgument, '--if-needed'], profileRoot, {
      offline: true,
    });
    run(executable, ['check', '--config', configArgument], profileRoot, { offline: true });
    if (profile === 'generic') {
      genericConfig = configArgument;
      genericTarget = join(profileRoot, ...target.split('/'));
      genericExecutable = executable;
    }
  }

  const canonicalId = await firstCanonicalId(genericTarget);
  const genericRoot = join(consumerRoot, 'generic');
  run('node', ['--input-type=module', '--eval', [
    "import { resolveFieldContracts } from 'cms-field-vocabulary';",
    "import { PROHIBITION_CODES, RENDERING_OPERATION_DEFINITIONS } from 'cms-field-vocabulary/definitions';",
    "import sdkProfile from 'cms-field-vocabulary/catalog/profiles/optimizely-saas.sdk-2' with { type: 'json' };",
    "import agentProfile from 'cms-field-vocabulary/profiles/agent/react-nextjs' with { type: 'json' };",
    "import selectedSchema from 'cms-field-vocabulary/schema/selected-contract' with { type: 'json' };",
    "if (!PROHIBITION_CODES.includes('flatten-reference')) process.exit(1);",
    "if (RENDERING_OPERATION_DEFINITIONS.selectionDiscriminators['content-reference-usage'].join(',') !== 'link,media') process.exit(1);",
    "if (RENDERING_OPERATION_DEFINITIONS.schemaVersion !== 1) process.exit(1);",
    "if (sdkProfile.id !== 'optimizely-saas.sdk-2') process.exit(1);",
    "if (agentProfile.id !== 'react-nextjs') process.exit(1);",
    "if (!selectedSchema.$id.endsWith('/selected-contract.schema.json')) process.exit(1);",
    "const selected = resolveFieldContracts({ profileId: sdkProfile.id, fieldIds: ['optimizely-saas.sdk-2.contentReference'], agentProfile: agentProfile.id, renderingSelections: [{ fieldId: 'optimizely-saas.sdk-2.contentReference', discriminator: 'content-reference-usage', value: 'link' }] });",
    "if (selected.contracts[0].operations.map(({ id }) => id).join(',') !== 'optimizely.content-reference.reference') process.exit(1);",
  ].join('\n')], genericRoot);
  run('node', ['--eval', [
    "const { resolveFieldContracts } = require('cms-field-vocabulary');",
    "const { PROHIBITION_CODES } = require('cms-field-vocabulary/definitions');",
    "const sdkProfile = require('cms-field-vocabulary/catalog/profiles/optimizely-saas.sdk-2');",
    "const agentProfile = require('cms-field-vocabulary/profiles/agent/react-nextjs');",
    "if (!PROHIBITION_CODES.includes('flatten-reference')) process.exit(1);",
    "if (sdkProfile.id !== 'optimizely-saas.sdk-2') process.exit(1);",
    "if (agentProfile.id !== 'react-nextjs') process.exit(1);",
    "const selected = resolveFieldContracts({ profileId: sdkProfile.id, fieldIds: ['optimizely-saas.sdk-2.contentReference'], agentProfile: agentProfile.id, renderingSelections: [{ fieldId: 'optimizely-saas.sdk-2.contentReference', discriminator: 'content-reference-usage', value: 'media' }] });",
    "if (selected.contracts[0].operations.length !== 2) process.exit(1);",
  ].join('\n')], genericRoot);
  const typecheckPath = join(genericRoot, 'typecheck.mts');
  await writeFile(typecheckPath, [
    "import { catalog, getProfile, RENDERING_OPERATION_KINDS } from 'cms-field-vocabulary';",
    "// @ts-expect-error The canonical singleton is deeply readonly.",
    "catalog.profiles[0]!.fields[0]!.nativeToken = 'mutated';",
    "// @ts-expect-error Frozen rendering-definition arrays are readonly.",
    "RENDERING_OPERATION_KINDS.push('direct');",
    "const detached = getProfile('contentful.cma.saas');",
    "detached.fields[0]!.nativeToken = 'consumer-owned-copy';",
  ].join('\n'));
  run(
    join(root, 'node_modules', '.bin', 'tsc'),
    [
      '--noEmit',
      '--strict',
      '--module', 'NodeNext',
      '--moduleResolution', 'NodeNext',
      '--target', 'ES2023',
      typecheckPath,
    ],
    genericRoot,
  );
  const resolvedArgument = 'resolved-field.json';
  const resolved = join(genericRoot, resolvedArgument);
  run(
    genericExecutable,
    [
      'resolve',
      '--config',
      genericConfig,
      '--field-id',
      canonicalId,
      '--output',
      resolvedArgument,
    ],
    genericRoot,
    { offline: true },
  );
  const resolvedValue = JSON.parse(await readFile(resolved, 'utf8'));
  assert.equal(findCanonicalId(resolvedValue), canonicalId);

  process.stdout.write(
    `PASS packed ${PACKAGE_NAME}@${packedManifest.version} synced all profiles and resolved ${canonicalId}.\n`,
  );
} finally {
  await rm(sandbox, { recursive: true, force: true });
}
