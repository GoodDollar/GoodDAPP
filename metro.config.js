/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const nodeLibs = require('node-libs-react-native')
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts

module.exports = {
  resolver: {
    extraNodeModules: {
      ...nodeLibs,
      vm: require.resolve('vm-browserify')
    },
    sourceExts: process.env.TEST_REACT_NATIVE
      ? ['e2e.js'].concat(defaultSourceExts)
      : defaultSourceExts
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
