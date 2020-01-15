const path = require('path');
const {
  override,
  addDecoratorsLegacy,
  disableEsLint,
  addBundleVisualizer,
  addWebpackAlias,
  babelInclude,
  addExternalBabelPlugins,
  addBabelPresets,
  fixBabelImports,
  babelExclude,
  adjustWorkbox
} = require("customize-cra");
// const rewireAliases = require('react-app-rewire-aliases');

module.exports = override(
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
  )
)


// module.exports = function override(config, env) {
//   config.module.rules.push({
//     test: /\.js$/,
//     exclude: /node_modules[/\\](?!react-native-paper|react-native-vector-icons|react-native-safe-area-view)/,
//     use: {
//       loader: "babel-loader",
//       options: {
//         // Disable reading babel configuration
//         babelrc: false,
//         configFile: false,
//
//         // The configuration for compilation
//         presets: [
//           ["@babel/preset-env", { useBuiltIns: "usage" }],
//           "@babel/preset-react",
//           "@babel/preset-flow"
//         ],
//         plugins: [
//           "@babel/plugin-proposal-class-properties",
//           "@babel/plugin-proposal-object-rest-spread",
//         ]
//       }
//     }
//   });
//
//   config.module.rules.push({
//     test: /\.js$/,
//     include: [
//       path.resolve(__dirname, './node_modules/react-navigation'),
//       path.resolve(__dirname, './node_modules/react-native-paper'),
//       path.resolve(__dirname, './node_modules/react-native-vector-icons'),
//       path.resolve(__dirname, './node_modules/react-native-safe-area-view')
//     ],
//     use: {
//       loader: 'babel-loader',
//       options: {
//         plugins: ['react-native-web'],
//         presets: ['react-native'],
//       },
//     },
//   })
//
//   config = rewireAliases.aliasesOptions({
//     'react-native-linear-gradient': 'react-native-web-linear-gradient',
//   })(config, env);
//
//   return config;
// };
