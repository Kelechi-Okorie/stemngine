// rollup.prod.config.js
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import { terser } from '@rollup/plugin-terser';
import obfuscatorPlugin from 'rollup-plugin-obfuscator';
import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const distFolder = path.resolve(__dirname, '../../dist/engine');

const distFolder = 'dist';

export default [
  // UMD (minified + obfuscated)
  {
    input: 'src/engine.ts',
    output: {
      file: path.join(distFolder, 'engine.umd.min.js'),
      format: 'umd',
      name: 'STEMEngine',
      sourcemap: false,
    },
    plugins: [
      typescript(),
      terser(),
      obfuscatorPlugin({
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        rotateStringArray: true,
      }),
    ],
  },

  // ESM (clean, modern build)
  {
    input: 'src/engine.ts',
    output: {
      file: path.join(distFolder, 'engine.esm.js'),
      format: 'esm',
      sourcemap: true,
    },
    plugins: [typescript()],
  },

  // Types (single .d.ts bundle)
  {
    input: 'src/types/index.d.ts',
    output: {
      file: path.join(distFolder, 'engine.d.ts'),
      format: 'es',
    },
    plugins: [dts()],
  },
];
