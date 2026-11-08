'use strict';
const fs = require('node:fs');
const { Writable } = require('node:stream');
const { analyzeCommits } = require('../../semantic-release-analyzer.cjs');
const options = require('../../../.releaserc.cjs').plugins[0][1];
async function main() {
  const { default: semanticRelease } = await import('semantic-release');
  const [cwd, repositoryUrl, output] = process.argv.slice(2);
  const effects = { publish: 0, dispatch: 0 };
  const plugin = { analyzeCommits: (_, context) => analyzeCommits(options, context),
    generateNotes: () => 'Fixture release',
    publish: () => { effects.publish++; return { name: 'fake publication' }; },
    success: () => { effects.dispatch++; } };
  const sink = new Writable({ write(_chunk, _encoding, done) { done(); } });
  const run = () => semanticRelease({ branches: ['main'], repositoryUrl, ci: false, plugins: [plugin] },
    { cwd, env: process.env, stdout: sink, stderr: sink });
  const first = await run();
  const rerun = await run();
  fs.writeFileSync(output, JSON.stringify({ type: first ? first.nextRelease.type : null, rerun, effects }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
