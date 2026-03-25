import { test, expect, afterEach } from 'vitest';
import { LxForm, LxStack } from '@dativa-lv/lx-ui';
import LxFormBuilder from '@/components/FormBuilder.vue';
import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

const dummyClickAway = {
  beforeMount() {},
  mounted() {},
  beforeUnmount() {},
  unmounted() {},
};

const buildFormBuilderWrapper = (schema, { formProps = {}, builderProps = {}, global = {} } = {}) =>
  mount(
    {
      components: { LxForm, LxFormBuilder },
      setup() {
        return () =>
          h(
            LxForm,
            { showHeader: false, ...formProps },
            { default: () => h(LxFormBuilder, { schema, ...builderProps }) }
          );
      },
    },
    { global }
  );

test('LxFormBuilder with one row', async () => {
  const schema = { type: 'object', properties: { name: { type: 'string' } } };
  wrapper = await buildFormBuilderWrapper(schema, {
    global: {
      stubs: ['LxStack'],
    },
  });
  await flushPromises();
  // process.stdout.write(`${wrapper.html()}\n`);
  expect(wrapper.find('.lx-row').exists()).toBe(true);
});

test('LxFormBuilder LxRow label', async () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', label: 'name' } },
  };

  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });

  const label = wrapper.find('.lx-row').find('label');
  expect(label.text()).toBe('name');
});

test('LxFormBuilder order', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      one: { type: 'string', label: 'one', lx: { order: 2 } },
      two: { type: 'string', label: 'two', lx: { order: 1 } },
      three: { type: 'string', label: 'three' },
    },
  };

  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  const label = wrapper.findAll('.lx-row');
  expect(label[0].find('label').text()).toBe('two');
  expect(label[1].find('label').text()).toBe('one');
  expect(label[2].find('label').text()).toBe('three');
});

test('LxFormBuilder order 2', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      one: { type: 'string', label: 'one', lx: { order: 2 } },
      two: { type: 'string', label: 'two', lx: { order: 1 } },
      three: { type: 'string', label: 'three' },
      four: { type: 'string', label: 'four', lx: { order: 10 } },
    },
  };

  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  const label = wrapper.findAll('.lx-row');
  expect(label[0].find('label').text()).toBe('two');
  expect(label[1].find('label').text()).toBe('one');
  expect(label[2].find('label').text()).toBe('four');
  expect(label[3].find('label').text()).toBe('three');
});

// Input component tests
test('LxFormBuilder with LxTextInput', () => {
  const schemaValue = { type: 'object', properties: { name: { type: 'string' } } };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  expect(wrapper.find('.lx-text-input').exists()).toBe(true);
});

test('LxFormBuilder with LxTextArea', async () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', lx: { kind: 'multiline' } } },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  await flushPromises();
  expect(wrapper.find('.lx-text-area').exists()).toBe(true);
});

test('LxFormBuilder with LxDateTimePicker', async () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', format: 'date' } },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['router-link', 'LxStack'],
      directives: {
        ClickAway: dummyClickAway,
      },
    },
  });
  await flushPromises();
  expect(wrapper.find('.lx-date-time-picker').exists()).toBe(true);
});

test('LxFormBuilder with LxDateTimePicker time', async () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', format: 'time' } },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['router-link', 'LxStack'],
      directives: {
        ClickAway: dummyClickAway,
      },
    },
  });
  await flushPromises();
  expect(wrapper.find('.lx-time').exists()).toBe(true);
});

test('LxFormBuilder with LxDateTimePicker dateTime', async () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', format: 'date-time' } },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['router-link', 'LxStack'],
      directives: {
        ClickAway: dummyClickAway,
      },
    },
  });
  await flushPromises();
  expect(wrapper.find('.lx-date-time').exists()).toBe(true);
});

test('LxFormBuilder with LxToggle', async () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'boolean' } },
  };

  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  await flushPromises();
  expect(wrapper.find('.lx-toggle').exists()).toBe(true);
});

test('LxFormBuilder with LxValuePicker default', async () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        lx: {
          variant: 'default',
          items: [
            { id: 'one', name: 'one' },
            { id: 'two', name: 'two' },
          ],
        },
      },
    },
  };

  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  await flushPromises();
  expect(wrapper.find('.lx-value-picker-default-wrapper').exists()).toBe(true);
});

test('LxFormBuilder with LxValuePicker tags', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        lx: {
          variant: 'tags',
          items: [
            { id: 'one', name: 'one' },
            { id: 'two', name: 'two' },
          ],
        },
      },
    },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  expect(wrapper.find('.lx-value-picker-tags').exists()).toBe(true);
});

test('LxFormBuilder with LxValuePicker multiple', async () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        lx: {
          items: [
            { id: 'one', name: 'one' },
            { id: 'two', name: 'two' },
          ],
        },
      },
    },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  await flushPromises();
  const valuePicker = wrapper.find('.lx-value-picker-default-wrapper');
  expect(valuePicker.find('.lx-checkbox').exists()).toBe(true);
});

test('LxFormBuilder with LxValuePicker 4 items', async () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        lx: {
          items: [
            { id: 'one', name: 'one' },
            { id: 'two', name: 'two' },
            { id: 'three', name: 'three' },
            { id: 'four', name: 'four' },
          ],
        },
      },
    },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });
  await flushPromises();
  const checkboxes = wrapper.find('.lx-value-picker-default-wrapper').findAll('.lx-checkbox');
  expect(checkboxes.length).toBe(4);
});

test('LxFormBuilder with LxValuePicker 4 items using enum', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        enum: ['one', 'two', 'three', 'four'],
      },
    },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['LxStack'],
    },
  });

  const checkboxes = wrapper.find('.lx-value-picker-default-wrapper').findAll('.lx-checkbox');
  expect(checkboxes.length).toBe(4);
});

test('LxFormBuilder with LxDataBlock', async () => {
  const schemaValue = {
    type: 'object',
    properties: {
      one: {
        type: 'object',
        properties: { name: { type: 'string' } },
      },
    },
  };
  const modelValue = { one: { name: 'one' } };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    builderProps: { modelValue },
    global: {
      stubs: ['LxStack'],
    },
  });
  await flushPromises();
  expect(wrapper.find('.lx-data-block').exists()).toBe(true);
});

test('LxFormBuilder with LxPlaceholder', async () => {
  const schemaValue = {
    type: 'object',
    properties: {
      one: {
        lx: {
          wrapper: 'placeholder',
        },
      },
    },
  };
  wrapper = buildFormBuilderWrapper(schemaValue);
  await flushPromises();
  expect(wrapper.find('.lx-placeholder').exists()).toBe(true);
});

test('LxFormBuilder cannot render LxRow', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      one: {
        type: 'object',
      },
    },
  };
  wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-placeholder').exists()).toBe(true);
});

// tests with LxAppendablelist and LxAppenableListSimple

test('LxFormBuilder with LxAppendableList', async () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        lx: {
          variant: 'default',
        },
        items: {
          properties: {
            name: {
              type: 'string',
              title: 'Vārds',
            },
            surname: {
              type: 'string',
              title: 'Uzvārds',
            },
          },
        },
      },
    },
  };

  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['router-link', 'LxStack'],
    },
  });
  await flushPromises();
  expect(wrapper.find('.lx-appendable-list').exists()).toBe(true);
});
test('LxFormBuilder with LxAppendableListSimple', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        lx: {
          variant: 'default',
        },
        items: { type: 'string' },
      },
    },
  };
  wrapper = buildFormBuilderWrapper(schemaValue, {
    global: {
      stubs: ['router-link', 'LxStack'],
    },
  });
  expect(wrapper.find('.lx-appendable-list-simple').exists()).toBe(true);
});
