module.exports = function(api) {
  api.cache(true);
  return {
    presets: [['module:metro-react-native-babel-preset']],
    env: {
      production: {
        plugins: [
          'react-native-paper/babel',
          "lodash",
          "transform-class-properties",
          "inline-import",
          {
            "extensions": [".embed.html"]
          }
        ],
      },
    },
    ignore: [
      'src/lib/zoom/ZoomAuthentication.js'
    ]
  }
}
