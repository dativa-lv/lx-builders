import { test, expect, afterEach, vi } from 'vitest';
import { LxForm } from '@dativa-lv/lx-ui';
import LxFormBuilder from '@/components/FormBuilder.vue';
import { mount } from '@vue/test-utils';
import { h } from 'vue';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
    wrapper = null;
  }
});

const buildWrapper = (schema, modelValue) =>
  mount(
    {
      setup() {
        return () =>
          h(
            LxForm,
            { showHeader: false },
            { default: () => h(LxFormBuilder, { schema, modelValue }) }
          );
      },
    },
    { global: { stubs: ['router-link', 'teleport'] } }
  );

const buildSingle = (property, modelValue) =>
  buildWrapper({ type: 'object', properties: { item: property } }, modelValue);

// LxChat

const chatUsers = [
  { id: 'bob', name: 'Bob the builder', isAi: true },
  { id: 'tod', name: 'Tod Smith', isMe: true },
];

test('LxChat renders messages from modelValue', async () => {
  wrapper = buildWrapper(
    {
      type: 'object',
      properties: {
        chat: { type: 'array', lx: { displayType: 'chat', userDefinitions: chatUsers } },
      },
    },
    {
      chat: [
        { id: 'm1', text: 'First message text', userId: 'bob', createdAt: '2026-10-27T12:00:00' },
        { id: 'm2', text: 'Second message text', userId: 'tod', createdAt: '2026-10-27T12:01:00' },
      ],
    }
  );
  await vi.waitFor(
    () => {
      expect(wrapper.find('.lx-chat-wrapper').exists()).toBe(true);
      expect(wrapper.text()).toContain('First message text');
      expect(wrapper.text()).toContain('Second message text');
    },
    { timeout: 5000 }
  );
});

test('LxChat applies kind and mode and renders message composer', async () => {
  wrapper = buildWrapper(
    {
      type: 'object',
      properties: {
        chat: {
          type: 'array',
          lx: {
            displayType: 'chat',
            kind: 'comments',
            mode: 'compact',
            userDefinitions: chatUsers,
          },
        },
      },
    },
    {
      chat: [{ id: 'm1', text: 'Comment text', userId: 'bob', createdAt: '2026-10-27T12:00:00' }],
    }
  );
  await vi.waitFor(
    () => {
      expect(wrapper.find('.lx-chat-wrapper').exists()).toBe(true);
    },
    { timeout: 5000 }
  );
  const classes = wrapper.find('.lx-chat-wrapper').classes();
  expect(classes).toContain('lx-chat-comments');
  expect(classes).toContain('lx-chat-mode-compact');
  expect(wrapper.find('.lx-chat-composer').exists()).toBe(true);
});

// LxCard

test('LxCard renders with default kind and label slot', async () => {
  wrapper = buildSingle(
    { type: 'boolean', lx: { displayType: 'card', label: 'Front side' } },
    { item: false }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-card-wrapper').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-card-front').text()).toContain('Front side');
  expect(wrapper.find('.lx-card-wrapper').classes()).not.toContain('lx-card-flipped');
});

test('LxCard applies kind, interactive and flipped state', async () => {
  wrapper = buildSingle(
    {
      type: 'boolean',
      lx: { displayType: 'card', kind: 'clickable', interactive: true, labelReverse: 'Back side' },
    },
    { item: true }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-card-wrapper').exists()).toBe(true);
  });
  const classes = wrapper.find('.lx-card-wrapper').classes();
  expect(classes).toContain('lx-card-clickable');
  expect(classes).toContain('lx-card-interactive');
  expect(classes).toContain('lx-card-flipped');
  expect(wrapper.find('.lx-card-back').text()).toContain('Back side');
});

// LxEmptyState

test('LxEmptyState renders label and description from modelValue', async () => {
  wrapper = buildSingle(
    { type: 'object', lx: { displayType: 'emptyState' } },
    { item: { label: 'Nothing here', description: 'Add something first' } }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-empty-state-wrapper').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-empty-state-data .lx-primary').text()).toBe('Nothing here');
  expect(wrapper.find('.lx-empty-state-data .lx-secondary').text()).toBe('Add something first');
});

test('LxEmptyState renders action buttons and announces label', async () => {
  wrapper = buildSingle(
    { type: 'object', lx: { displayType: 'emptyState' } },
    {
      item: {
        label: 'No results',
        actionDefinitions: [{ id: 'create', name: 'Create new', icon: 'add' }],
        announce: true,
      },
    }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-empty-state-buttons').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-empty-state-buttons').text()).toContain('Create new');
  expect(wrapper.find('[role="status"]').text()).toBe('No results');
});

// LxErrorPage

test('LxErrorPage renders description from modelValue', async () => {
  wrapper = buildSingle(
    { type: 'object', lx: { displayType: 'errorPage' } },
    { item: { kind: '404', description: 'Custom error description' } }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-error-landing').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-description').text()).toBe('Custom error description');
});

test('LxErrorPage renders action definitions', async () => {
  wrapper = buildSingle(
    { type: 'object', lx: { displayType: 'errorPage' } },
    {
      item: {
        kind: '500',
        actionDefinitions: [{ id: 'retry', name: 'Retry', kind: 'primary' }],
      },
    }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-error-action-definitions').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-error-action-definitions').text()).toContain('Retry');
});

// LxLoader

test('LxLoader renders indeterminate loader when loading', async () => {
  wrapper = buildSingle(
    { type: 'number', lx: { displayType: 'loader', loading: true } },
    { item: 0 }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-loader-wrapper').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-loader-indeterminate').exists()).toBe(true);
  expect(wrapper.find('.lx-loader-large').exists()).toBe(true);
});

test('LxLoader renders progress kind with model value, size and label', async () => {
  wrapper = buildSingle(
    {
      type: 'number',
      lx: { displayType: 'loader', kind: 'progress', size: 's', label: 'Uploading' },
    },
    { item: 0.5 }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-loader-progress').exists()).toBe(true);
  });
  expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('0.5');
  expect(wrapper.find('.lx-loader-small').exists()).toBe(true);
  expect(wrapper.find('.lx-loader-wrapper').attributes('aria-label')).toBe('Uploading');
});

// LxToolbar

test('LxToolbar renders with toolbar role and actions', async () => {
  wrapper = buildSingle(
    { type: 'object', lx: { displayType: 'toolbar' } },
    {
      item: {
        actionDefinitions: [
          { id: 'one', name: 'Action one', icon: 'flash', kind: 'primary' },
          { id: 'two', name: 'Action two', icon: 'bug', area: 'right' },
        ],
      },
    }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-component-toolbar').exists()).toBe(true);
  });
  expect(wrapper.find('[role="toolbar"]').exists()).toBe(true);
  expect(wrapper.text()).toContain('Action one');
});

test('LxToolbar applies noBorders, sticky and customClass', async () => {
  wrapper = buildSingle(
    { type: 'object', lx: { displayType: 'toolbar' } },
    { item: { noBorders: true, sticky: true, customClass: 'my-toolbar', actionDefinitions: [] } }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-component-toolbar').exists()).toBe(true);
  });
  const classes = wrapper.find('.lx-component-toolbar').classes();
  expect(classes).toContain('lx-toolbar-no-borders');
  expect(classes).toContain('lx-toolbar-sticky');
  expect(classes).toContain('my-toolbar');
});

// Indicators in a plain row

test('indicator primaryText', async () => {
  wrapper = buildSingle(
    { type: 'string', lx: { displayType: 'primaryText' } },
    { item: 'Primary value' }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('p.lx-primary').exists()).toBe(true);
  });
  expect(wrapper.find('p.lx-primary').text()).toBe('Primary value');
});

test('indicator secondaryText', async () => {
  wrapper = buildSingle(
    { type: 'string', lx: { displayType: 'secondaryText' } },
    { item: 'Secondary value' }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('p.lx-secondary').exists()).toBe(true);
  });
  expect(wrapper.find('p.lx-secondary').text()).toBe('Secondary value');
});

test('indicator flag', async () => {
  wrapper = buildSingle(
    { type: 'string', lx: { displayType: 'flag', size: 'l', title: 'Latvia' } },
    { item: 'lv' }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-flag').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-flag').classes()).toContain('lx-large');
  expect(wrapper.find('.lx-flag').attributes('aria-label')).toBe('Latvia');
});

test('indicator stateDisplay', async () => {
  wrapper = buildSingle(
    {
      type: 'string',
      lx: {
        displayType: 'stateDisplay',
        dictionary: [
          { value: 'active', displayName: 'Active', displayType: 'green', displayShape: 'circle' },
        ],
      },
    },
    { item: 'active' }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-state').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-state').classes()).toContain('lx-state-green');
  expect(wrapper.find('.lx-state-text').text()).toBe('Active');
});

test('indicator personDisplay', async () => {
  wrapper = buildSingle(
    { type: 'object', lx: { displayType: 'personDisplay' } },
    { item: { name: 'John Smith', description: 'Developer' } }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-person-display-wrapper').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-person-display-name').text()).toBe('John Smith');
});

test('indicator icon', async () => {
  wrapper = buildSingle(
    { type: 'string', lx: { displayType: 'icon', iconSet: 'cds', desc: 'Flash icon description' } },
    { item: 'flash' }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('svg[data-component="lx-icon"]').exists()).toBe(true);
  });
  expect(wrapper.find('svg[data-component="lx-icon"] desc').text()).toBe('Flash icon description');
});

test('indicator badge', async () => {
  wrapper = buildSingle(
    { type: 'string', lx: { displayType: 'badge', tooltip: 'Unread count' } },
    { item: '5' }
  );
  await vi.waitFor(() => {
    expect(wrapper.find('.lx-badge').exists()).toBe(true);
  });
  expect(wrapper.find('.lx-badge-text').text()).toBe('5');
  expect(wrapper.find('.lx-badge-type-number').exists()).toBe(true);
  expect(wrapper.find('.lx-badge').attributes('aria-label')).toBe('Unread count');
});
