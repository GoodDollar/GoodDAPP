/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const nodeLibs = require('node-libs-browser')
const path = require('path')
const cwd = path.resolve(__dirname)

module.exports = {
  resolver: {
    extraNodeModules: {
      ...nodeLibs,
      fs: require.resolve('react-native-fs'),
      net: require.resolve('react-native-tcp'),
      vm: require.resolve('vm-browserify'),
      'crypto-js': path.resolve(cwd, 'node_modules/crypto-js'),
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
