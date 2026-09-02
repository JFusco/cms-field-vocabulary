# Security policy

## Supported versions

The first public release is `1.0.0`. After release, security fixes are provided for the latest `1.x` release. Development snapshots such as `0.0.0-development` and older minors are not supported distribution channels.

| Version | Supported |
| --- | --- |
| Latest `1.x` | Yes |
| Development snapshots | No |
| Older major versions | No |

Support here means the maintainers will assess a report and, when warranted, publish a fixed release. No response-time or remediation-time guarantee is made.

## Report a vulnerability privately

Use [GitHub private vulnerability reporting](https://github.com/JFusco/cms-field-vocabulary/security/advisories/new). Include:

- affected package version and entry point;
- reproduction steps or a minimal proof of concept;
- security impact and required preconditions;
- whether the issue affects the CLI, programmatic API, source scanner, generated projection, packed artifact, or release process;
- any suggested mitigation.

Do not open a public issue with exploit details, tokens, private repository paths, or unpublished vendor information. If private vulnerability reporting is unavailable, open a minimal public issue asking the maintainer to establish a private channel, without describing the vulnerability.

Normal corrections to a public CMS field token, description, source locator, or freshness observation are data-quality issues and can use the public issue tracker. Treat one as a security report when crafted catalog data or vendor content can cause code execution, path traversal, credential disclosure, package compromise, or another security boundary failure.

## Security boundaries

Official vendor pages are evidence, but fetched page content is still untrusted input. The freshness scanner:

- follows only HTTPS sources and checks every redirect against each source's host allowlist;
- limits redirects, retries, response time, and fetch concurrency;
- normalizes documents and compares hashes and declared tokens;
- writes reports only;
- does not update canonical profiles, accept a new source lock, create a vocabulary pull request, or publish a package.

Human review remains required before `sources.lock.json` or canonical vocabulary source changes.

Consumer projection code rejects absolute or escaping target paths, symlink traversal, unmarked targets, unexpected files, and modified generated files. It writes into a staging directory and replaces a verified target by rename. A vulnerability that bypasses any of those checks is in scope.

Published packages are configured for public npm provenance. Packed-artifact verification checks the expected file boundary, installs the tarball into clean consumers, and scans packed content for known credential and local-path patterns. These controls reduce risk but do not make vendor documentation or generated coding guidance a security warranty.

## Maintainer response

Maintainers should acknowledge the report privately, reproduce it in an isolated environment, determine affected versions, and coordinate a fix and advisory before public disclosure. For a compromised release, pause publication, revoke affected credentials or trusted-publisher access, deprecate the affected npm version, and publish a clean higher version. Do not overwrite an existing npm version or move an existing release tag.

Never request or accept production CMS credentials, npm tokens, GitHub tokens, or customer content as part of a reproduction.
