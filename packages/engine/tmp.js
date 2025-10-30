// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distFolder = path.resolve(__dirname, '../../dist/engine'); // workspace root/dist/

export default [
  {
    input: 'src/index.ts',
    output: {
      file: path.join(distFolder, 'engine.esm.js'),
      format: 'esm',
      sourcemap: true
    },
    plugins: [typescript()],
  },
  {
    input: 'src/index.umd.ts',
    output: {
      file: path.join(distFolder, 'engine.umd.js'),
      format: 'umd',
      name: 'STEMEngine',
      sourcemap: true
    },
    plugins: [typescript()],
  },

  // single types build
  {
    input: 'src/types/index.d.ts',    // entry point for all types
    output: {
      file: path.join(distFolder, 'engine.d.ts'),
      format: 'es'
    },
    plugins: [dts()]
  },
  // {
  //   input: 'src/main.ts',
  //   output: {
  //     file: path.join(distFolder, 'demo.js'),
  //     format: 'iife',
  //     name: 'STEMEngineDemo',
  //     sourcemap: true
  //   },
  //   plugins: [typescript()],
  // }
];
