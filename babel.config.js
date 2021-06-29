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
    plugins: ['react-native-paper/babel', 'lodash', 'transform-class-properties'],
    ignore: [/src\/lib\/facetec/i]
  }
}
