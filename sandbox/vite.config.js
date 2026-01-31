// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'src',  // your HTML files live here
  resolve: {
    alias: {
      // '@stemngine/engine': path.resolve(__dirname, '../packages/engine/dist/engine.esm.js')
      '@stemngine/engine': path.resolve(__dirname, '../packages/engine/src/engine.ts')
    }
  },
  // build: {
  //   outDir: path.resolve(__dirname, 'dist'),
  //   emptyOutDir: true
  // },
  server: {
    host: true,
    port: 5173,      // optional: specify dev server port
    // open: true       // automatically opens browser
  }
});
