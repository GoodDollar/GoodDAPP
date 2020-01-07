/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const nodeLibs = require('node-libs-browser')

module.exports = {
  resolver: {
    extraNodeModules: {
      ...nodeLibs,
      fs: require.resolve('react-native-fs'),
      net: require.resolve('react-native-tcp'),
      vm: require.resolve('vm-browserify'),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
    assetPlugins: ['react-native-svg-asset-plugin'],
  },
};
