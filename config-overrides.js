const assign = require('lodash/assign')
const rewireReactHotLoader = require('react-app-rewire-hot-loader')

module.exports = {
  webpack: (conf, env) => {
    const configType = env === 'production' ? 'prod' : 'dev'
    const webpackConfig = require(`./config/webpack.config.${configType}`)
    const config = assign(conf, webpackConfig)

    if (configType == 'dev') config.resolve.alias['react-dom'] = '@hot-loader/react-dom'

    return rewireReactHotLoader(config, env)
  },

  jest: config => {
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
