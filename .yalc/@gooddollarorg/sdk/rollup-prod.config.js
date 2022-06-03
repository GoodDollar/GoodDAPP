// import typescript from 'rollup-plugin-typescript2';
// import { terser } from 'rollup-plugin-terser';
// import {nodeResolve}  from '@rollup/plugin-node-resolve';
// import json from '@rollup/plugin-json';
// import commonjs from '@rollup/plugin-commonjs';
// import eslint from '@rollup/plugin-eslint';
// import nodePolyfills from 'rollup-plugin-node-polyfills';

// // import pkg from './package.json';

// // const external = [
// //   ...Object.keys(pkg.dependencies || {}),
// //   ...Object.keys(pkg.peerDependencies || {}),
// // ]

// export default {
//   input: './src/index.ts',
//   output: [
//     {
//       dir: 'dist',
//       format: 'esm',
//       sourcemap: false,
//     },
//   ],
//   context: "window",
//   plugins: [
//     eslint(),
//     json({
//       compact: true
//     }),
//     nodeResolve({
//       jsnext: true,
//       main: true,
//       browser: true,
//       preferBuiltins: false
//     }),
//     commonjs(),
//     terser(),
//     typescript({ 
//       tsconfig: './tsconfig.json', 
//       exclude: 'node_modules/*',
//       useTsconfigDeclarationDir: true,
//       module: "esnext",
//       clean: true,
//     }),
//     nodePolyfills({
//       crypto: true,
//       stream: true,
//       https: true,
//       http: true,
//       os: true
//     }),
//   ]
// };