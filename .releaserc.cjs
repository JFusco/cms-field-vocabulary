'use strict';

const conventionalCommits = {
  preset: 'conventionalcommits',
  presetConfig: {},
};

module.exports = {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        ...conventionalCommits,
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'feat', release: 'minor' },
          ...['build', 'chore', 'ci', 'docs', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'].map(
            (type) => ({ type, release: 'patch' }),
          ),
        ],
      },
    ],
    ['@semantic-release/release-notes-generator', conventionalCommits],
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    ['@semantic-release/npm', { npmPublish: true }],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'pnpm-lock.yaml'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        successCommentCondition: false,
        failCommentCondition: false,
        releasedLabels: false,
      },
    ],
  ],
};
