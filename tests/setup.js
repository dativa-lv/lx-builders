import { config } from '@vue/test-utils';
import { vTooltip } from '@dativa-lv/lx-ui';

config.global.directives = {
  ...config.global.directives,
  tooltip: vTooltip,
};
