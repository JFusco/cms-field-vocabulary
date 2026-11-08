import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const ROOT = path.resolve(__dirname, '..');
const { filterReleaseCommits } = require(path.join(ROOT, 'scripts/release-commits.cjs'));
const { analyzeCommits } = require(path.join(ROOT, 'scripts/semantic-release-analyzer.cjs'));
const { generateNotes } = require(path.join(ROOT, 'scripts/semantic-release-notes.cjs'));
const { waitForRegistry } = require(path.join(ROOT, 'scripts/registry-readiness.cjs'));
const { releasePayload } = require(path.join(ROOT, 'scripts/notify-pin-courier.cjs'));
const config = require(path.join(ROOT, '.releaserc.cjs'));
const options = config.plugins[0][1];
const logger = { log() {}, error() {}, success() {} };

const histories = [
  ['ordinary maintenance', ['chore(deps): bump tool [skip release]'], null],
  ['security maintenance', ['chore(deps): bump tool [SECURITY] [skip release]'], null],
  ['merge maintenance', ['chore(deps): bump tool [skip release]', 'Merge pull request #1 from renovate/tool'], null],
  ['squash maintenance', ['chore(deps): bump tool [skip release]\n\nMaintenance squashed.'], null],
  ['marked breaking header', ['feat(api)!: replace API [skip release]'], null],
  ['marked breaking footer', ['feat(api): replace API\n\nBREAKING CHANGE: replaced\n\n[skip release]'], null],
  ['marker in body', ['fix(api): generated work\n\n[skip release]'], null],
  ['mixed marked head', ['fix(api): correct output', 'chore(deps): bump tool [skip release]'], 'patch'],
  ['mixed marked breaking', ['feat(api)!: replace API [skip release]', 'feat(api): add endpoint'], 'minor'],
  ['patch control', ['fix(api): correct output'], 'patch'],
  ['minor control', ['feat(api): add endpoint'], 'minor'],
  ['major control', ['feat(api)!: replace API'], 'major'],
];

for (const [name, messages, expected] of histories) {
  test(`analyzer preserves release policy: ${name}`, async () => {
    const commits = Object.freeze(messages.map((message, i) => Object.freeze({ message, hash: String(i).padStart(40, 'a') })));
    const context = Object.freeze({ cwd: ROOT, commits, logger });
    assert.equal(await analyzeCommits(options, context), expected);
    assert.equal(context.commits, commits);
    assert.deepEqual(commits.map(c => c.message), messages);
  });
}

test('filter is literal, case sensitive, and leaves the input untouched', () => {
  const commits = [{ message: 'fix(api): keep [SKIP RELEASE]' }, { message: 'fix(api): omit\n\n[skip release]' }];
  assert.deepEqual(filterReleaseCommits(commits), [commits[0]]);
  assert.equal(commits.length, 2);
});

test('release notes omit marked commits without changing legitimate release notes', async () => {
  const context = { cwd: ROOT, logger,
    commits: [{ hash: 'a'.repeat(40), message: 'fix(api): visible fix' }, { hash: 'b'.repeat(40), message: 'feat(api)!: hidden change [skip release]' }],
    options: { repositoryUrl: 'https://github.com/JFusco/example.git' },
    lastRelease: { version: '1.0.0', gitTag: 'v1.0.0', gitHead: 'c'.repeat(40) },
    nextRelease: { version: '1.0.1', gitTag: 'v1.0.1', gitHead: 'd'.repeat(40) },
  };
  const notes = await generateNotes({ preset: 'conventionalcommits' }, context);
  assert.match(notes, /visible fix/);
  assert.doesNotMatch(notes, /hidden change|skip release/);
  assert.equal(context.commits.length, 2);
  if (ROOT.endsWith('cms-field-vocabulary')) {
    const headings = [...notes.matchAll(/^## (.+)$/gm)].map(m => m[1]);
    assert.deepEqual(headings, ['Summary', 'Breaking changes', 'Features', 'Fixes', 'Other changes']);
  }
});

test('real semantic-release Git fixtures suppress publish, tags and dispatch on reruns', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'release-policy-'));
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    for (const [name, messages, expected] of histories) {
      const cwd = path.join(temp, name.replaceAll(' ', '-'));
      const remote = `${cwd}.git`;
      fs.mkdirSync(cwd);
      git(temp, 'init', '--bare', remote);
      git(cwd, 'init', '-b', 'main');
      git(cwd, 'config', 'user.name', 'Release fixture');
      git(cwd, 'config', 'user.email', 'fixture@example.invalid');
      git(cwd, 'commit', '--allow-empty', '-m', 'chore(repo): initialize');
      git(cwd, 'tag', 'v1.0.0');
      git(cwd, 'remote', 'add', 'origin', pathToFileURL(remote).href);
      git(cwd, 'push', '--tags', '-u', 'origin', 'main');
      for (const message of messages) git(cwd, 'commit', '--allow-empty', '-m', message);
      const output = path.join(temp, 'result.json');
      const env = { PATH: process.env.PATH, HOME: temp, GIT_AUTHOR_NAME: 'Fixture',
        GIT_AUTHOR_EMAIL: 'fixture@example.invalid', GIT_COMMITTER_NAME: 'Fixture',
        GIT_COMMITTER_EMAIL: 'fixture@example.invalid' };
      execFileSync(process.execPath, [path.join(ROOT, 'scripts/tests/fixtures/release-run.cjs'),
        cwd, pathToFileURL(remote).href, output], { env, stdio: ['ignore', 'pipe', 'pipe'] });
      const result = JSON.parse(fs.readFileSync(output, 'utf8'));
      assert.equal(result.type, expected, name);
      const count = expected ? 1 : 0;
      assert.deepEqual(result.effects, { publish: count, dispatch: count }, name);
      assert.equal(git(cwd, 'tag').split('\n').length, count + 1, name);
      assert.equal(result.rerun, false, `${name} manual rerun`);
    }
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test('registry readiness requires version and tarball, with explicit timeout', async () => {
  const base = { name: 'example', version: '1.0.0', attempts: 2, sleep: async () => {} };
  assert.equal(await waitForRegistry({ ...base, fetch: async (_url, opts) => opts.method === 'HEAD'
    ? { ok: true } : { ok: true, json: async () => ({ versions: { '1.0.0': { dist: { tarball: 'https://example.invalid/package.tgz' } } } }) } }), 'ready');
  assert.equal(await waitForRegistry({ ...base, fetch: async () => ({ ok: false }) }), 'timeout');
  assert.equal(await waitForRegistry({ ...base, fetch: async () => { throw new Error('unavailable'); } }), 'timeout');
});

test('publication summaries expose readiness errors and partial notification failure', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'release-summary-'));
  try {
    for (const [registry, token, notify, exit] of [['ready', 'success', 'success', 0], ['timeout', 'success', 'success', 0], ['error', 'failure', 'skipped', 1], ['ready', 'success', 'failure', 1]]) {
      const file = path.join(temp, 'summary');
      fs.writeFileSync(file, '');
      const result = require('node:child_process').spawnSync(process.execPath, ['scripts/release-notification-summary.cjs'], { cwd: ROOT,
        env: { ...process.env, GITHUB_STEP_SUMMARY: file, REGISTRY_STATUS: registry, REGISTRY_OUTCOME: registry === 'error' ? 'failure' : 'success', TOKEN_OUTCOME: token, NOTIFY_OUTCOME: notify }, encoding: 'utf8' });
      assert.equal(result.status, exit);
      assert.match(fs.readFileSync(file, 'utf8'), new RegExp(`Registry: ${registry}`));
      assert.match(fs.readFileSync(file, 'utf8'), new RegExp(`Notification: ${exit ? 'failed' : 'accepted'}`));
    }
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test('notification replay contains only a repository dispatch, with metadata as JSON data', () => {
  const payload = releasePayload({ publisher: 'JFusco/example', name: 'example', version: '1.0.1', revision: 'a'.repeat(40) });
  assert.equal(payload.event_type, 'package-released');
  assert.deepEqual(Object.keys(payload.client_payload), ['publisher', 'package', 'version', 'revision', 'release_url']);
  const workflow = fs.readFileSync(path.join(ROOT, '.github/workflows/release.yml'), 'utf8');
  assert.match(workflow, /timeout-minutes: 12/);
  assert.doesNotMatch(workflow, /head_commit.message|uses: actions\/[^\n]+@v\d/);
  assert.match(workflow, /REGISTRY_OUTCOME: \$\{\{ steps.registry.outcome \}\}/);
  assert.match(workflow, /TOKEN_OUTCOME: \$\{\{ steps.courier.outcome \}\}/);
});

test("release markers do not weaken the existing breaking-body preflight guard", () => {
  const { validateReleaseCommits } = require("../scripts/check-release-commit.cjs");
  for (const body of ["BREAKING CHANGE: replaced", "BREAKING CHANGE: replaced\n\n[skip release]"]) {
    assert.ok(validateReleaseCommits([{ hash: "a".repeat(40), subject: "feat(api): replace API", body }]).length > 0);
  }
  assert.deepEqual(validateReleaseCommits([{ hash: "a".repeat(40), subject: "feat(api)!: replace API [skip release]", body: "" }]), []);
});
