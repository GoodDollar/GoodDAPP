/* eslint-disable quote-props, quotes */

module.exports = {
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/src/__tests__/__mocks__/styleMock.js"
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
  ],
  resolver: "jest-pnp-resolver",
  preset: "react-native-web",
  rootDir: '../',
  setupFiles: [
    'react-app-polyfill/jsdom',
    '<rootDir>/config/initTest.js',
    'jest-canvas-mock',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}'
  ],
  testEnvironment: 'jsdom',
  browser: true,
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|react-navigation|react-navigation-redux-helpers|react-phone-number-input|webrtc-adapter)'
  ],
  moduleFileExtensions: [
    'web.js',
    'js',
    'json',
    'web.jsx',
    'jsx',
    'node'
  ],
  testPathIgnorePatterns: [
    "/__tests__/__util__/",
    "/__tests__/__mocks__/",
    "<rootDir>/src/.*/.*(android|ios|native)\.js",
    "<rootDir>/src/index.js",
    "<rootDir>/src/init.js",
    "<rootDir>/src/serviceWorker.js"
  ]
  ,
  coveragePathIgnorePatterns: [
    "/__tests__/__util__/",
    "<rootDir>/src/.*/.*(android|ios|native)\.js",
    "<rootDir>/src/index.js",
    "<rootDir>/src/init.js",
    "<rootDir>/src/serviceWorker.js"
  ],
  globals: {
    "TZ" : "UTC"
  }
};
