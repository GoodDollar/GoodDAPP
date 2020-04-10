module.exports = function(api) {
  api.cache(true)
  return {
    presets: [['module:metro-react-native-babel-preset'], ['react-app'], ['@babel/preset-env', {
      modules: false,
      targets: {
        node: 4,
      }
    }]],
    comments: true,
    env: {
      production: {
        plugins: ['react-native-paper/babel']
      }
    },
    ignore: ['node_modules/art/core/color.js', 'src/lib/zoom/ZoomAuthentication.js'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '^react-native$': 'react-native-web',
            WebView: 'react-native-web-webview'
          }
        }
      ],
      'lodash',
      '@babel/plugin-proposal-class-properties',
    ]
  }
}
