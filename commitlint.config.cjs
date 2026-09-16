const baseConfig = require('@verndale/ai-commit');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // Dependabot group titles include dependency versions and the group name.
    // Keep the shared 120-character header cap while allowing those subjects.
    'subject-max-length': [2, 'always', 100],
  },
};
