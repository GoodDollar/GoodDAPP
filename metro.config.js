/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig } = require('metro-config')
const nodeLibs = require('node-libs-react-native')

/**
 * 
 * packages that use new package.json export.
 * solving issues with latest ceramic
 */
const packageExports = {
  // "varintes": "",
  // "multihashes-sync": "",
  // "cartonne": "",
  // "codeco": "",
  // "multiformats": "./node_modules/multiformats/cjs/src/",
}

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig()

  const defaultSourceExts = [...sourceExts, 'svg', 'mjs', 'cjs', 'jsx']

  return {
    resolver: {
      resolveRequest: (context, moduleName, platform) => {
        const [packageName, ...packagePath] = moduleName.split("/")
        const packageExport = packageExports[packageName]
        const packagePathJoined = packagePath.join("/")
        let filePath
        if (packageExport !== undefined) {
          try {
            console.log("resolving", {moduleName, packageExport, packagePath})
            // indexeddbshim case
            if (packageExport.length > 0 && packagePathJoined.length === 0) {
              filePath = require.resolve(packageExport);
            }
            if (packageExport.length > 0) {
              filePath = require.resolve(packageExport + packagePathJoined)
            }
            else {
              filePath = require.resolve(`./node_modules/${packageName}/dist/${packagePathJoined || 'index.js'}`)
            }
            return {
              filePath,
              type: 'sourceFile',
            }
          }
          catch (e) {
            console.log("failed resolving", {moduleName, packageExport, packagePath, filePath, }, e.message)
          }
        }

        // Optionally, chain to the standard Metro resolver.
        return context.resolveRequest(context, moduleName, platform);
      },
      extraNodeModules: {
        ...nodeLibs,
        vm: require.resolve('vm-browserify'),
        "node:crypto": nodeLibs.crypto,
        fs: require.resolve('react-native-fs'),
      },

      assetExts: assetExts.filter(ext => ext !== 'svg'),

      sourceExts: process.env.TEST_REACT_NATIVE ? ['e2e.js'].concat(defaultSourceExts) : defaultSourceExts,
    },
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
  }
})()
