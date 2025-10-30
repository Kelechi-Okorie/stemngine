import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// find all .ts files recursively
const files = fg.sync('src/**/*.ts');
const inputFiles = {};
files.forEach(f => {
  const name = path.basename(f, '.ts');
  inputFiles[name] = path.resolve(__dirname, f);
});

export default {
  input: inputFiles,
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    entryFileNames: '[name].js'
  },
  plugins: [
    resolve({ preferBuiltins: false }),
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true
    })
  ]
};
