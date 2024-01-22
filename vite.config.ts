import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import dynamicImports from 'vite-plugin-dynamic-import'
import * as path from 'path'
import svgLoader from 'vite-plugin-svgr'
import * as esbuild from 'esbuild'
import fs from 'fs'
import { flowPlugin, esbuildFlowPlugin } from '@bunchtogether/vite-plugin-flow'

const extensions = ['.web.tsx', '.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.jsx', '.mjs', '.js', '.json']

const jsxTransform = (matchers: RegExp[]) => ({
  name: 'js-in-jsx',
  load(id: string) {
    if (matchers.some(matcher => matcher.test(id)) && id.endsWith('.js')) {
      const file = fs.readFileSync(id, { encoding: 'utf-8' })
      return esbuild.transformSync(file, { loader: 'jsx', jsx: 'automatic' })
    }
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  envPrefix: ['REACT_APP_'],
  define: {
    // https://github.com/bevacqua/dragula/issues/602#issuecomment-1296313369
    global: 'globalThis',
  },
  plugins: [
    svgLoader({ include: '**/*.svg', exclude: ['**/*.svg?url'] }),
    flowPlugin(),
    react({
      babel: {
        // babel-macro is needed for lingui
        plugins: ['macros'],
      },
    }),
    dynamicImports(),
    nodePolyfills({
      include: [
        'buffer',
        'crypto',
        '_stream_duplex',
        '_stream_readable',
        'stream',
        'http',
        'https',
        '_stream_writable',
        '_stream_passthrough',
        '_stream_transform',
      ],
      globals: { process: true, Buffer: true, global: true },
    }),
  ],
  resolve: {
    extensions,
    alias: {
      'react-native': 'react-native-web',
      'lottie-react-native': 'react-native-web-lottie',
      'react-native-svg': 'react-native-svg-web',
      'react-native-webview': 'react-native-web-webview',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      jsbi: path.resolve(__dirname, '..', 'node_modules', 'jsbi', 'dist', 'jsbi-cjs.js'),
    },
    dedupe: ['react', 'ethers', 'react-dom', 'native-base'],
  },
  build: {
    manifest: true,
    outDir: 'build',
    commonjsOptions: {
      extensions: ['.js', '.jsx', '.web.js', '.web.jsx'],
      ignore: id => id.includes('es5-ext/global') || id.includes('expo-'), //required to make importing of missing packages to fail
      include: [/node_modules/],
      exclude: [/FaceTecSDK.web.js/], // required so it will be loaded as umd module in global
      transformMixedEsModules: true, //handle deps that use "require" and "module.exports"
    },
    rollupOptions: {
      plugins: [jsxTransform([/react-native-.*\.jsx?$/])], //for some reason react-native packages are not being transpiled even with esbuild jsx settings
    },
  },
  optimizeDeps: {
    exclude: [],
    esbuildOptions: {
      plugins: [esbuildFlowPlugin(/\.(flow|jsx?)$/, () => 'jsx')], //default to jsx loader
      resolveExtensions: extensions,
      loader: {
        '.html': 'text', // allow import or require of html files
      },
    },
  },
})
