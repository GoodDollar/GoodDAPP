const { fixBabelImports, addBabelPlugins, addPostcssPlugins, override, addBabelPresets } = require('customize-cra')
const path = require('path')

module.exports = override(
    addPostcssPlugins([require('tailwindcss'), require('postcss-preset-env')({ stage: 1 })]),
    ...addBabelPlugins(
        'babel-plugin-react-native-web'
        // '@babel/plugin-proposal-class-properties',
    ),
    ...addBabelPresets('@babel/preset-flow', '@babel/preset-react', '@babel/preset-typescript'),
    fixBabelImports('module-resolver', {
        alias: {
            '^react-native$': 'react-native-web',
        },
    })
)
