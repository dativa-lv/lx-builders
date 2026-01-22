import { setGlobalProperties } from '@/utils/global';

/**
 * Vue plugin (Vue 3) for @wntr/builders.
 *
 * This plugin only stores builders-specific globals (environment, iconSet, ...).
 * If you also want to install lx-ui here, pass `lxOptions`.
 */
const plugin = {
  /**
   * @param {import('vue').App} app
   * @param {object} [options]
   */
  async install(app, options = {}) {
    // Note: don't hard-block re-installation because consumers may want
    // to override globals per app instance. (Vue itself guards against
    // installing the exact same plugin twice, but factory plugins are new objects.)

    const { lxOptions, ...buildersGlobals } = options || {};
    setGlobalProperties(buildersGlobals);

    // Optional convenience: also install lx-ui if config is provided.
    // This keeps @wntr/builders usable in non-portal projects.
    if (lxOptions) {
      // Lazy import to avoid forcing consumers that don't use lx-ui.
      // (This package is ESM; using require() would fail in real usage.)
      const { createLx } = await import('@wntr/lx-ui');
      app.use(createLx, lxOptions);
    }
  },
};

/**
 * Factory form so consumers can do: `app.use(createLxBuilders({ ... }))`.
 *
 * @param {object} [options]
 */
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
