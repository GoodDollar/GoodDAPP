module.exports = function(api) {
  api.cache(true);
  return {
    presets: [['module:metro-react-native-babel-preset']],
    env: {
      production: {
        plugins: ['react-native-paper/babel', "lodash", "transform-class-properties"],
      },
    },
  };
};
