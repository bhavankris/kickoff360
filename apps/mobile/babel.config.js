module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo also wires up react-native-worklets/reanimated automatically.
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
