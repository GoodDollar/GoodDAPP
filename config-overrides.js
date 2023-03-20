const { assign } = require('lodash')
const dotenv = require('dotenv')
const { existsSync } = require('fs')

module.exports = {
  webpack: (conf, env) => {
    const configType = env === 'production' ? 'prod' : 'dev'
    const webpackConfig = require(`./config/webpack.config.${configType}`)
    const config = assign(conf, webpackConfig)

    if (configType === 'dev') {
      config.resolve.alias['react-dom'] = '@hot-loader/react-dom'
    }

    return config
  },

  jest: config => {
    // some shells like zsh + oh-my-zsh plugins set
    // are preloading .env file to the shell env
    // so dotenv won't update those vars (already existing)
    // latest dotenv versions have override option
    // for now we will just clean up process.env from react_app vars
    // then re-setup dotenv with .env.test
    // TODO: update dotenv
    if (existsSync('./.env')) {
      Object
        .keys(process.env)
        .filter(key => key.startsWith('REACT_APP'))
        .forEach(key => delete process.env[key])
  
      dotenv.config({ path: './.env.test' })
    }

    config.transformIgnorePatterns = [
      '<rootDir>/node_modules/@gooddollar/react-native-facetec/web/sdk',
      '<rootDir>/node_modules/(?!(jest-)?react-native|react-navigation|react-navigation-redux-helpers|react-phone-number-input|webrtc-adapter|@gooddollar/react-native-facetec|@ceramicnetwork)',
    ]

    config.setupFiles = [
      'react-app-polyfill/jsdom',
      '<rootDir>/config/initTest.js',
    ]

    config.globals = {
      TZ: 'UTC',
    }

    config.testPathIgnorePatterns = [
      '/__tests__/__util__/',
      '/__tests__/__suites__/',
      '/__tests__/__mocks__/',
      '<rootDir>/src/index.js',
      '<rootDir>/src/init.js',
      '<rootDir>/src/serviceWorker.js',
    ]

    config.coveragePathIgnorePatterns = [
      "/__tests__/__util__/",
      "/__tests__/__suites__/",
      "<rootDir>/src/index.js",
      "<rootDir>/src/init.js",
      "<rootDir>/src/serviceWorker.js",
      "<rootDir>/node_modules/@gooddollar/react-native-facetec/web/sdk"
    ]

    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '\\.(css|less)$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
      'lottie-react-native': 'react-native-web-lottie',
    }

    if (process.env.TEST_REACT_NATIVE === 'true') {
      config.coverageDirectory = 'coverageNative'
      config.preset = 'react-native'
      config.testPathIgnorePatterns.push('<rootDir>/src/.*/.*(web).js')
      config.coveragePathIgnorePatterns.push('<rootDir>/src/.*/.*(web).js')
    } else {
      config.moduleNameMapper = {
        ...config.moduleNameMapper,
        '^react-native-linear-gradient$': 'react-native-web-linear-gradient',
      }
      config.resolver = 'jest-pnp-resolver'
      config.testURL = 'http://localhost'
      config.testPathIgnorePatterns.push('<rootDir>/src/.*/.*(android|ios|native).js')
      config.coveragePathIgnorePatterns.push('<rootDir>/src/.*/.*(android|ios|native).js')
    }

    return config
  },
}
