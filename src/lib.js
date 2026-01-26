import { setGlobalProperties } from '@/utils/global';

const plugin = {
  /**
   * @param {import('vue').App} app
   * @param {object} [options]
   */
  async install(app, options = {}) {
    const { lxOptions, ...buildersGlobals } = options || {};
    setGlobalProperties(buildersGlobals);

    // Optional convenience: also install lx-ui if config is provided.
    // This keeps @dativa-lv/builders usable in non-portal projects.
    if (lxOptions) {
      const { createLx } = await import('@dativa-lv/lx-ui');
      app.use(createLx, lxOptions);
    }
  },
};

export const createLxBuilders = (options) => ({
  async install(app) {
    app.use(plugin, options);
  },
});

export { plugin as lxBuildersPlugin };

// Allow component use individually
export * from '@/components';

// Allow util use individually
export * from '@/utils';

export * from '@/constants';
