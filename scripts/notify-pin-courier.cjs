'use strict';

const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

function releasePayload({ publisher, name, version, revision }) {
  return { event_type: 'package-released', client_payload: {
    publisher, package: name, version, revision,
    release_url: `https://github.com/${publisher}/releases/tag/v${version}`,
  } };
}

if (require.main === module) {
  const { name, version } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const input = JSON.stringify(releasePayload({ publisher: process.env.GITHUB_REPOSITORY, name, version, revision }));
  execFileSync('gh', ['api', '--method', 'POST', 'repos/JFusco/renovate-config/dispatches', '--input', '-'], {
    input, stdio: ['pipe', 'ignore', 'inherit'],
  });
}

module.exports = { releasePayload };
