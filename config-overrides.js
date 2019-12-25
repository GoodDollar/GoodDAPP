const rewireAliases = require('react-app-rewire-aliases');

module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.js$/,
    exclude: /node_modules[/\\](?!react-native-paper|react-native-vector-icons|react-native-safe-area-view)/,
    use: {
      loader: "babel-loader",
      options: {
        // Disable reading babel configuration
        babelrc: false,
        configFile: false,

        // The configuration for compilation
        presets: [
          ["@babel/preset-env", { useBuiltIns: "usage" }],
          "@babel/preset-react",
          "@babel/preset-flow"
        ],
        plugins: [
          "@babel/plugin-proposal-class-properties",
          "@babel/plugin-proposal-object-rest-spread",
        ]
      }
    }
  });

  config = rewireAliases.aliasesOptions({
    'react-native-linear-gradient': 'react-native-web-linear-gradient',
  })(config, env);

  return config;
};
