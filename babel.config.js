module.exports = function(api) {
  api.cache(true)

  return {
    presets: [
      ['module:metro-react-native-babel-preset', {unstable_disableES6Transforms: true}],
      [
        '@babel/preset-env',
        {
          modules: false,
          exclude: ['@babel/plugin-transform-typeof-symbol']
        },
      ],
    ],
    plugins: [
      'import-graphql',
      'react-native-paper/babel',
      'lodash',
      'transform-class-properties',
      'macros',
      ["@babel/plugin-proposal-class-properties", {loose: true}],
      ["@babel/plugin-proposal-private-methods", {loose: true}],
      ["@babel/plugin-proposal-private-property-in-object", {loose: true}],
      ["@babel/plugin-syntax-dynamic-import", {loose: true}],
      ["babel-plugin-inline-import",{"extensions": [".svg"]}]
    ],
    "env": {
      "test": {
        "presets": [["@babel/preset-env",{"exclude": ["transform-exponentiation-operator"]}]],
        "plugins": [
          "babel-plugin-transform-vite-meta-env",
          "dynamic-import-node"
        ]
      }
    },
    ignore: [
      /react\-native\-facetec\/web\/sdk/i,
    ]
  }
}
