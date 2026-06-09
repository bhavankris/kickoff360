// Monorepo-aware Metro config + NativeWind.
// Without watchFolders + nodeModulesPaths, Metro can't resolve @repo/core — the
// single most common Expo-in-a-monorepo failure.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole monorepo so edits to @repo/core hot-reload.
config.watchFolders = [monorepoRoot];

// 2. Resolve modules from both the app and the workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './src/global.css' });
