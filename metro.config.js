/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig } = require("metro-config");
const nodeLibs = require('node-libs-react-native')

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig()
  const defaultSourceExts = [ ...sourceExts, 'svg' ]

  return {
    resolver: {
      extraNodeModules: {
        ...nodeLibs,
        vm: require.resolve('vm-browserify')
      },
      assetExts: assetExts.filter(ext => ext !== "svg"),
      sourceExts: process.env.TEST_REACT_NATIVE
        ? ['e2e.js'].concat(defaultSourceExts)
        : defaultSourceExts
    },
    transformer: {
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
  }
})();
