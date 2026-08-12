const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'android/**',
      'node_modules/**',
      'docs/**',
      'design-catalog/**',
      'design-catalog - Copy/**',
      '.expo/**',
    ],
  },
];
