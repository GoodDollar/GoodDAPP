module.exports = function(api) {
  api.cache(true);
  return {
    presets: [["module:metro-react-native-babel-preset"], ['react-app']],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
    ignore: [ "node_modules/art/core/color.js" ],
    plugins: [
      ["module-resolver", {
        "alias": {
          "^react-native$": "react-native-web",
          "WebView": "react-native-web-webview"
        }
      }]
    ],
  };
};
