// rollup.dev.config.js
import typescript from 'rollup-plugin-typescript2';
import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const distFolder = path.resolve(__dirname, '../../dist/webgl');

const distFolder = 'dist';

export default [
  {
    input: 'src/webgl.ts',
    output: {
      file: path.join(distFolder, 'webgl.esm.js'),
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
