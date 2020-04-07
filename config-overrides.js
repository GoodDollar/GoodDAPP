const path = require('path');
const {
  override,
  addBundleVisualizer,
  addWebpackAlias,
  babelInclude,
  addExternalBabelPlugins,
  addBabelPresets,
  fixBabelImports,
  babelExclude,
} = require("customize-cra");
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const lodashWebpackPluginOverride = (config) => {
  config.plugins.unshift(
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true,
      flattening: true,
      currying: true,
      placeholder: true,
      caching: true,
    }),
  )

  return config
}

// SVGR is an tool that converts your SVG files into React components that you can use directly in JXS.
const svgrOverride = config => {
  let loaders = config.module.rules[2].oneOf
  loaders.splice(loaders.length - 1, 0, {
    test: /\.svg$/,
    use: [{
      loader: '@svgr/webpack',
      options: {
        template: function defaultTemplate({ template }, opts, { imports, interfaces, componentName, props, jsx, exports }) {
          const plugins = ['jsx']
          let exportLoadedFileAsUrl = ''

          if (opts.state.caller.previousExport) {
            exportLoadedFileAsUrl = opts.state.caller.previousExport.replace('default', 'const url =')
          }

          if (opts.typescript) {
            plugins.push('typescript')
          }

          const typeScriptTpl = template.smart({ plugins })

          return typeScriptTpl.ast`${imports}
            ${interfaces}
            function ${componentName}(${props}) {
              return ${jsx};
            }
            ${exportLoadedFileAsUrl}
            export default ${componentName}
            `
        }
      }
    }, {
      loader: 'file-loader'
    }],
  })

  return config
}

module.exports = {
  webpack: override(
    fixBabelImports('module-resolver', {
      alias: {
        '^react-native$': 'react-native-web',
        '^lottie-react-native$': 'react-native-web-lottie',
        '^react-native-linear-gradient$': 'react-native-web-linear-gradient',
      },
    }),

    svgrOverride,

    babelInclude([
      path.resolve('src'),
      path.resolve('node_modules/react-navigation'),
      path.resolve('node_modules/@react-navigation'),
      path.resolve('node_modules/react-native-paper'),
      path.resolve('node_modules/react-native-safe-area-view'),
      path.resolve('node_modules/react-native-vector-icons'),
      path.resolve('node_modules/react-native-gesture-handler'),
      path.resolve('node_modules/react-native-keyboard-aware-scroll-view'),
      path.resolve('node_modules/react-native-animatable'),
    ]),

    babelExclude([
      path.resolve('node_modules/@react-navigation/core/lib/module/utils'),
      path.resolve('node_modules/@react-navigation/native/dist/utils'),
      path.resolve('node_modules/@react-navigation/web'),
    ]),

    addWebpackAlias({
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'react-native': 'react-native-web',
      'lottie-react-native': 'react-native-web-lottie',
    }),

    ...addExternalBabelPlugins(
      "lodash",
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread"
    ),

    ...addBabelPresets(
      ["@babel/preset-env", { useBuiltIns: "usage" }],
      "@babel/preset-react",
      "@babel/preset-flow"
    ),

    lodashWebpackPluginOverride,

    addBundleVisualizer({}, true),
  ),

  jest: function(config) {
    config.transformIgnorePatterns = [
      'node_modules/(?!(jest-)?react-native|react-navigation|react-navigation-redux-helpers|react-phone-number-input|webrtc-adapter)'
    ]
    config.setupFiles.push("./config/initTest.js")

    config.globals = {
      "TZ": "UTC",
      "__DEV__": false
    }

    config.testPathIgnorePatterns = [
      "/__tests__/__util__/",
      "/__tests__/__mocks__/",
      "<rootDir>/src/index.js",
      "<rootDir>/src/init.js",
      "<rootDir>/src/serviceWorker.js"
    ]

    if (process.env.TEST_REACT_NATIVE) {
      config.coverageDirectory = 'coverageNative'
      config.preset = 'react-native'
      config.browser = false
      config.testPathIgnorePatterns.push("<rootDir>/src/.*/.*(web)\.js")
      config.moduleNameMapper = {}
    } else {
      config.moduleNameMapper = {
        ...config.moduleNameMapper,
        '^react-native-linear-gradient$': 'react-native-web-linear-gradient',
      }
      config.resolver = "jest-pnp-resolver"
      config.browser = true
      config.testURL = 'http://localhost'
      config.testPathIgnorePatterns.push("<rootDir>/src/.*/.*(android|ios|native)\.js")
    }

    return config;
  }
}
