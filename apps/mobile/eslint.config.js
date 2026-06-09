// Expo's flat ESLint config. Routes/screens are platform code, so no Purity Rule here.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
];
