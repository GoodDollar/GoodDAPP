module.exports = function(api) {
  api.cache(true)

  return {
    presets: [
      'module:metro-react-native-babel-preset',
      [
        '@babel/preset-env',
        {
          modules: false,
          exclude: ['@babel/plugin-transform-typeof-symbol']
        },
      ],
    ],
    plugins: [
      'react-native-paper/babel',
      'lodash',
      'transform-class-properties',
      'macros',
      ["@babel/plugin-proposal-class-properties", {loose: true}],
      ["@babel/plugin-proposal-private-methods", {loose: true}],
      ["@babel/plugin-proposal-private-property-in-object", {loose: true}]
    ],
    ignore: [
      /react\-native\-facetec\/web\/sdk/i,
    ]
  }
}
