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
  addWebpackModuleRule,
} = require("customize-cra");

module.exports = {
  webpack: override(
    fixBabelImports('module-resolver', {
      alias: {
        '^react-native$': 'react-native-web',
        '^react-native-linear-gradient$': 'react-native-web-linear-gradient',
      },
    }),

    babelInclude([
      path.resolve('src'),
      path.resolve('node_modules/react-navigation'),
      path.resolve('node_modules/@react-navigation'),
      path.resolve('node_modules/react-native-paper'),
      path.resolve('node_modules/react-native-safe-area-view'),
      path.resolve('node_modules/react-native-vector-icons'),
      path.resolve('node_modules/react-native-gesture-handler'),
    ]),

    babelExclude([
      path.resolve('node_modules/@react-navigation/core/lib/module/utils'),
      path.resolve('node_modules/@react-navigation/native/dist/utils'),
      path.resolve('node_modules/@react-navigation/web'),
    ]),

    addWebpackAlias({
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'react-native': 'react-native-web',
    }),

    ...addExternalBabelPlugins(
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread"
    ),

    ...addBabelPresets(
      ["@babel/preset-env", { useBuiltIns: "usage" }],
      "@babel/preset-react",
      "@babel/preset-flow"
    ),

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
