import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { ROOT, loadRuntime, makeConsumerWorkspace } from './helpers.mjs';

const executable = path.join(ROOT, 'bin/cms-field-vocabulary.mjs');

function run(arguments_, cwd) {
  return spawnSync(process.execPath, [executable, ...arguments_], {
    cwd,
    encoding: 'utf8',
  });
}

test('CLI resolves explicit link and media branches and fails closed otherwise', async (t) => {
  const workspace = await makeConsumerWorkspace({
    profile: 'ai-orchestration',
    adapter: 'optimizely-saas',
  });
  t.after(() => workspace.cleanup());
  const { syncProjection } = await loadRuntime();
  await syncProjection({ configPath: workspace.configPath, root: workspace.root });
  const fieldId = 'optimizely-saas.sdk-2.contentReference';
  const base = ['resolve', '--config', workspace.configPath, '--field-id', fieldId];

  const unresolved = run([...base, '--output', 'resolved/unresolved.json'], workspace.root);
  assert.equal(unresolved.status, 1);
  assert.match(unresolved.stderr, /requires an explicit content-reference-usage rendering selection/);
  await assert.rejects(access(path.join(workspace.root, 'resolved/unresolved.json')));

  for (const [value, operationIds] of [
    ['link', ['optimizely.content-reference.reference']],
    ['media', [
      'react-nextjs.optimizely.media-reference-dam',
      'react-nextjs.optimizely.media-reference-src',
    ]],
  ]) {
    const output = `resolved/${value}.json`;
    const result = run([
      ...base,
      '--rendering-selection',
      `${fieldId}:content-reference-usage=${value}`,
      '--output',
      output,
    ], workspace.root);
    assert.equal(result.status, 0, result.stderr);
    const selected = JSON.parse(await readFile(path.join(workspace.root, output), 'utf8'));
    assert.deepEqual(selected.contracts[0].operations.map((operation) => operation.id), operationIds);
  }

  const invalid = run([
    ...base,
    '--rendering-selection',
    `${fieldId}:content-reference-usage=invalid`,
    '--output',
    'resolved/invalid.json',
  ], workspace.root);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Unknown content-reference-usage selection value: invalid/);
  await assert.rejects(access(path.join(workspace.root, 'resolved/invalid.json')));

  const malformed = run([
    ...base,
    '--rendering-selection',
    'not-a-selection',
    '--output',
    'resolved/malformed.json',
  ], workspace.root);
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /must use <field-id>:<discriminator>=<value>/);

  const empty = run([
    'resolve',
    '--config', workspace.configPath,
    '--output', 'resolved/empty.json',
  ], workspace.root);
  assert.equal(empty.status, 1);
  assert.match(empty.stderr, /requires at least one --field-id/);
  await assert.rejects(access(path.join(workspace.root, 'resolved/empty.json')));
});

test('CLI enforces its narrow command grammar and conditional sync semantics', async (t) => {
  const workspace = await makeConsumerWorkspace({ profile: 'generic' });
  t.after(() => workspace.cleanup());
  const config = ['--config', workspace.configPath];

  for (const arguments_ of [
    ['sync', ...config, '--output', 'ignored.json'],
    ['check', ...config, '--if-needed'],
    ['resolve', ...config, '--if-needed', '--field-id', 'contentful.cma.saas.Symbol', '--output', 'ignored.json'],
  ]) {
    const result = run(arguments_, workspace.root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /is not valid for/);
  }
  await assert.rejects(access(workspace.target));

  const first = run(['sync', ...config], workspace.root);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /synchronized/);
  const conditional = run(['sync', ...config, '--if-needed'], workspace.root);
  assert.equal(conditional.status, 0, conditional.stderr);
  assert.match(conditional.stdout, /is current/);
  const forced = run(['sync', ...config], workspace.root);
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(forced.stdout, /synchronized/);

  const duplicate = run([
    'resolve', ...config,
    '--field-id', 'contentful.cma.saas.Symbol',
    '--field-id', 'contentful.cma.saas.Symbol',
    '--output', 'resolved/deduplicated.json',
  ], workspace.root);
  assert.equal(duplicate.status, 0, duplicate.stderr);
  assert.match(duplicate.stdout, /Resolved 1 selected CMS field contract/);

  const duplicateConfig = run(['check', ...config, ...config], workspace.root);
  assert.equal(duplicateConfig.status, 1);
  assert.match(duplicateConfig.stderr, /Duplicate option: --config/);
  const missingValue = run(['resolve', ...config, '--field-id', '--output', 'ignored.json'], workspace.root);
  assert.equal(missingValue.status, 1);
  assert.match(missingValue.stderr, /--field-id requires a value/);
});
