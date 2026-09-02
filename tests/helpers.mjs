import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

export function canonicalJson(value) {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export async function readJson(relativePath, root = ROOT) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

export async function makeConsumerWorkspace(options = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cms-field-vocabulary-test-'));
  const config = {
    $schema: './node_modules/cms-field-vocabulary/schemas/consumer-config.schema.json',
    packageName: 'cms-field-vocabulary',
    profile: options.profile || 'generic',
    adapter: options.adapter || 'contentful',
    target: options.target || 'generated/cms-field-vocabulary',
  };
  const configPath = 'cms-field-vocabulary.config.json';
  await writeFile(path.join(root, configPath), canonicalJson(config));
  return {
    config,
    configPath,
    root,
    target: path.join(root, config.target),
    async cleanup() {
      await rm(root, { recursive: true, force: true });
    },
  };
}

export async function listFiles(root) {
  const output = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else output.push(path.relative(root, absolute).split(path.sep).join('/'));
    }
  }
  await visit(root);
  return output.sort();
}

export async function snapshotFiles(root) {
  const files = await listFiles(root);
  return Object.fromEntries(
    await Promise.all(files.map(async (file) => [file, await readFile(path.join(root, file), 'utf8')])),
  );
}

export async function loadRuntime() {
  return import('../dist/index.js');
}
