/* eslint-disable no-restricted-imports */
/* eslint-disable import/extensions */
import { defineConfig } from 'vite';
import vueConfig from './vite.vue.config.mjs';
import { cssConfig } from './vite.css.config.mjs';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return vueConfig;
  }
  if (mode === 'css') {
    return cssConfig;
  }
  throw new Error('Unknown mode!');
});
