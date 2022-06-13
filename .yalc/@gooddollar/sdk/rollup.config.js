import typescript from 'rollup-plugin-typescript2';
import {nodeResolve}  from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';

const plugins = [
  eslint(),
  json({
    compact: true
  }),
  nodeResolve({
    jsnext: true,
    main: true,
    browser: true,
    preferBuiltins: false,
    moduleDirectories: ['node_modules', 'src'],
    extensions: ['.mjs', '.js', '.json', '.node'],
  }),
  commonjs(),
  typescript({ 
    tsconfig: './tsconfig.dist.json',
    exclude: 'node_modules/*',
    clean: true,
    module: "esnext",
  }),
]

export default {
  input: {
    index: 'src/index.ts',
    "hooks/index": "src/hooks/index.ts",
    "constants/index": "src/constants/index.ts",
    "core/index": "src/core/index.ts",
    "core/apollo": 'src/core/apollo.ts',
    "core/staking": 'src/core/staking.ts',
    "constants/addresses": "src/constants/addresses.ts",
  },
  output: [
    {
      dir: 'dist',
      chunkFileNames: 'chunks/[name].js',
      // entryFileNames: '[name].js',
      // file: `core/${path.basename(input)}`,
      format: 'esm',
    },
  ],
  context: "window",
  plugins: plugins,
  external: ['react', 'react-dom', 'react-router-dom']
};