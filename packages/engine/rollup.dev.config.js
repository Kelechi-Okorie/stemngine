// rollup.dev.config.js
import typescript from 'rollup-plugin-typescript2';
import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const distFolder = path.resolve(__dirname, '../../dist/engine');

const distFolder = 'dist';

export default [
  {
    input: 'src/engine.ts',
    output: {
      file: path.join(distFolder, 'engine.esm.js'),
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true,
        clean: true
      })
    ],
  },
];
