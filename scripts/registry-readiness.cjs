'use strict';

const fs = require('node:fs');

async function waitForRegistry({ name, version, fetch: request = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), attempts = 40 }) {
  const url = `https://registry.npmjs.org/${name.replace('/', '%2F')}`;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      // One bounded signal covers both requests; forty checks fit the 12-minute step.
      const signal = AbortSignal.timeout(2000);
      const response = await request(url, { signal });
      const tarball = response.ok && (await response.json()).versions?.[version]?.dist?.tarball;
      if (tarball && (await request(tarball, { method: 'HEAD', signal })).ok) return 'ready';
    } catch {
      // Registry/network failures can settle on a later poll.
    }
    if (attempt < attempts) await sleep(15_000);
  }
  return 'timeout';
}

async function main() {
  const output = status => fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=${status}\n`);
  output('error');
  const { name, version } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const status = await waitForRegistry({ name, version });
  output(status);
  if (status !== 'ready') console.log('::warning::Registry availability is delayed; notifying anyway. Scheduled scans provide fallback.');
}

if (require.main === module) main().catch(error => {
  console.error(`::warning::Registry readiness could not complete: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { waitForRegistry };
