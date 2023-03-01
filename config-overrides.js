const {
    fixBabelImports,
    addExternalBabelPlugins,
    addPostcssPlugins,
    override,
    addBabelPresets,
    addWebpackAlias,
} = require('customize-cra')
const path = require('path')

module.exports = override(
    addPostcssPlugins([require('tailwindcss'), require('postcss-preset-env')({ stage: 1 })]),
    ...addExternalBabelPlugins(
        'babel-plugin-react-native-web',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-syntax-bigint'
        // '@babel/plugin-proposal-class-properties',
    ),
    ...addBabelPresets(
      '@babel/preset-flow',
      '@babel/preset-react',
      '@babel/preset-typescript',
    ),
    fixBabelImports('module-resolver', {
        alias: {
            '^react-native$': 'react-native-web',
        },
    }),
    //this is so it works with yarn link with goodweb3mono
    addWebpackAlias({
        react: path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        'native-base': path.resolve(__dirname, './node_modules/native-base'),
    })
)
