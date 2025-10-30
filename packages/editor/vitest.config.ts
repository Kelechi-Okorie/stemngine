import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,    // lets you use describe/it/expect without imports
    environment: 'node',    // use "jsdom" if test testing DOM stuff
    include: ["test/**/*.test.ts"],
    coverage: {
      reporter: ['text', 'html']
    }
  }
})
