import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  compileCatalog,
  existingGeneratedFiles,
  json,
  profileMarkdown,
  sha256,
} from './lib/catalog.mjs';

const check = process.argv.includes('--check');
const { body, profiles, sourceManifest } = await compileCatalog();
const catalogJson = json(body);
const files = new Map();
files.set('catalog/catalog.json', catalogJson);
for (const profile of profiles) {
  files.set(`catalog/profiles/${profile.id}.json`, json(profile));
  files.set(`docs/platforms/${profile.id}.md`, profileMarkdown(profile));
}
files.set('docs/platforms/INDEX.md', [
  '# CMS field vocabulary profiles',
  '',
  '> Generated index. Human-readable tables are package documentation and are not projected into consumer skills.',
  '',
  ...profiles.map((profile) => `- [${profile.id}](./${profile.id}.md) — ${profile.product}; ${profile.surface}; ${profile.version.label}`),
  '',
].join('\n'));

const catalogManifest = {
  schemaVersion: 1,
  catalogDigest: `sha256:${sha256(catalogJson)}`,
  sourceManifestDigest: `sha256:${sha256(json(sourceManifest))}`,
  sourceLockDigest: body.sourceLockDigest,
  profiles: profiles.map((profile) => ({
    id: profile.id,
    digest: `sha256:${sha256(json(profile))}`,
    fieldCount: profile.fields.length,
  })),
};
files.set('catalog/manifest.json', json(catalogManifest));

const managed = [
  ...(await existingGeneratedFiles('catalog/profiles')),
  ...(await existingGeneratedFiles('docs/platforms')),
  'catalog/catalog.json',
  'catalog/manifest.json',
].sort();
const expected = [...files.keys()].sort();
const extra = managed.filter((file) => !files.has(file));

if (check) {
  const errors = [];
  for (const [relative, content] of files) {
    try {
      const actual = await readFile(path.join(ROOT, relative), 'utf8');
      if (actual !== content) errors.push(`${relative} is stale`);
    } catch {
      errors.push(`${relative} is missing`);
    }
  }
  for (const file of extra) errors.push(`${file} is an unexpected generated file`);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Catalog is current: ${profiles.length} profiles, ${profiles.reduce((sum, profile) => sum + profile.fields.length, 0)} fields.`);
  }
} else {
  for (const [relative, content] of files) {
    const absolute = path.join(ROOT, relative);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, content);
  }
  if (extra.length > 0) throw new Error(`Remove unexpected generated files before rebuilding: ${extra.join(', ')}`);
  console.log(`Built ${expected.length} generated files for ${profiles.length} profiles.`);
}
