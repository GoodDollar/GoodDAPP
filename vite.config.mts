import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import dynamicImports from 'vite-plugin-dynamic-import'
import * as path from 'path'
import svgLoader from 'vite-plugin-svgr'
import * as esbuild from 'esbuild'
import fs from 'fs'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { flowPlugin, esbuildFlowPlugin } from '@bunchtogether/vite-plugin-flow'
import { VitePWA } from 'vite-plugin-pwa'

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
  // new CopyPlugin(['images', 'resources'].map(from => {
  //   const context = 'node_modules/@gooddollar/react-native-facetec/web/sdk'

  //   return { context, from, to: 'facetec/' + from }
  // })),
  plugins: [
    VitePWA({
      injectRegister: null,
      workbox: {
        skipWaiting: false,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,gif}'],
        navigateFallbackDenylist: [
          // Exclude URLs starting with /_, as they're likely an API call
          new RegExp('^/_'),
          // Exclude URLs containing a dot, as they're likely a resource in
          // public/ and not a SPA route
          new RegExp('/[^/]+\\.[^/]+$'),
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        /* other options */
      },
    }),
    viteStaticCopy({
      targets: [
        { src: 'node_modules/@gooddollar/react-native-facetec/web/sdk/images', dest: 'facetec' },
        { src: 'node_modules/@gooddollar/react-native-facetec/web/sdk/resources', dest: 'facetec' },
      ],
    }),
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
      ignore: id => id.includes('es5-ext/global'), //required to make importing of missing packages to fail.
      include: [/node_modules/],
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
