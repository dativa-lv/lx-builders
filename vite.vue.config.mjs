/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import fs from 'fs';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
const vueConfig = defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/lib.js'),
      name: 'VueCarbonComponents',
      fileName: (format) => `dativa-lx-builders.${format}.js`,
      formats: ['esm', 'umd'],
    },
    rollupOptions: {
      external: ['vue', '@dativa-lv/lx-ui'],
      output: {
        minifyInternalExports: false,
        assetFileNames: '[name][extname]',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [
    vue(),
    dts({
      outDir: 'dist/types',
      include: ['src/**/*'],
      exclude: ['tests/**', '**/*.test.*', '**/*.spec.*'],
      afterBuild: () => {
        fs.writeFileSync(
          path.resolve(import.meta.dirname, 'dist/dativa-lx-builders.d.ts'),
          "export * from './types/lib';\n"
        );
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 30_000,
  },
});

export default vueConfig;
