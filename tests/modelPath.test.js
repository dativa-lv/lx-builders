import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LxFormBuilderListItem from '@/components/FormBuilderListItem.vue';
import ConstructorPropRenderer from '@/components/constructor/ConstructorPropRenderer.vue';
import { getListRowKeys, resolveListModelPath } from '@/utils/builderUtils';

// lx-ui components are async, the ones used by ConstructorPropRenderer are replaced with synchronous stubs
vi.mock('@dativa-lv/lx-ui', async (importOriginal) => {
  const slotStub = { template: '<div><slot /></div>' };
  return {
    ...(await importOriginal()),
    LxForm: slotStub,
    LxRow: slotStub,
    LxStack: slotStub,
    LxExpander: slotStub,
    LxEmptyState: { template: '<div />' },
    LxButton: {
      emits: ['click'],
      template: '<button class="reset-button" @click="$emit(\'click\')" />',
    },
    LxTextInput: {
      props: ['modelValue', 'invalid', 'invalidationMessage'],
      emits: ['update:modelValue'],
      template:
        '<input class="attribute-input" :value="modelValue" :data-invalid="invalid" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
  };
});

describe('getListRowKeys', () => {
  test('row relative keys', () => {
    expect(getListRowKeys('list.name', 'list')).toEqual(['name']);
    expect(getListRowKeys('list.person.firstName', 'list')).toEqual(['person', 'firstName']);
  });

  test('path to the row itself', () => {
    expect(getListRowKeys('list', 'list')).toEqual([]);
  });

  test('nested list', () => {
    expect(getListRowKeys('form.section.list.name', 'form.section.list')).toEqual(['name']);
  });

  test('path outside of the list row is not supported', () => {
    expect(getListRowKeys('otherList.name', 'list')).toBe(null);
    expect(getListRowKeys('form.name', 'form.section.list')).toBe(null);
    expect(getListRowKeys('listName', 'list')).toBe(null);
    expect(getListRowKeys(null, 'list')).toBe(null);
    expect(getListRowKeys('list.name', null)).toBe(null);
    expect(getListRowKeys('', 'list')).toBe(null);
  });
});

describe('resolveListModelPath', () => {
  const row = { name: 'Row name', person: { firstName: 'John' } };

  test('resolves from row', () => {
    expect(resolveListModelPath('list.name', row, 'list')).toBe('Row name');
    expect(resolveListModelPath('list.person.firstName', row, 'list')).toBe('John');
    expect(resolveListModelPath('list', row, 'list')).toBe(row);
  });

  test('missing values', () => {
    expect(resolveListModelPath('list.missing.x', row, 'list')).toBe(undefined);
    expect(resolveListModelPath('form.name', row, 'list')).toBe(undefined);
  });
});

describe('LxFormBuilderListItem lx.modelPath', () => {
  const row = { id: 1, name: 'Flat name', nested: { name: 'Nested name' } };
  const listPath = 'list';

  const mountItem = (props) => mount(LxFormBuilderListItem, { props });

  test('uses old nested mechanism when modelPath is not defined', () => {
    const wrapper = mountItem({
      itemValue: { lx: { displayType: 'primaryText' } },
      itemName: 'name',
      item: row.nested,
      row,
      listPath,
    });
    expect(wrapper.text()).toBe('Nested name');
  });

  test('ignores modelPath outside of a list (no row)', () => {
    const wrapper = mountItem({
      itemValue: { lx: { displayType: 'primaryText', modelPath: 'list.name' } },
      itemName: 'name',
      item: row.nested,
    });
    expect(wrapper.text()).toBe('Nested name');
  });

  test('own modelPath references a flat row value', () => {
    const wrapper = mountItem({
      itemValue: { lx: { displayType: 'primaryText', modelPath: 'list.name' } },
      itemName: 'some-uuid',
      item: row.nested,
      row,
      listPath,
    });
    expect(wrapper.text()).toBe('Flat name');
  });

  test('modelPath of a nested list', () => {
    const wrapper = mountItem({
      itemValue: { lx: { displayType: 'primaryText', modelPath: 'form.section.list.name' } },
      itemName: 'some-uuid',
      row,
      listPath: 'form.section.list',
    });
    expect(wrapper.text()).toBe('Flat name');
  });

  test('the same value can be referenced by more than one displayer', () => {
    const itemValue = { lx: { displayType: 'secondaryText', modelPath: 'list.name' } };
    const first = mountItem({ itemValue, itemName: 'a', item: row, row, listPath });
    const second = mountItem({ itemValue, itemName: 'b', item: row, row, listPath });
    expect(first.text()).toBe('Flat name');
    expect(second.text()).toBe('Flat name');
  });
});
describe('ConstructorPropRenderer modelPath attribute', () => {
  const componentModel = {
    type: 'string',
    lx: { displayType: 'primaryText', modelPath: 'list.person.name' },
  };
  const mountRenderer = (props = {}) =>
    mount(ConstructorPropRenderer, {
      props: {
        componentName: 'PrimaryText',
        componentModel,
        schemaInfo: { isInsideCustomItemsList: true },
        texts: { modelPathAttributeError: 'error' },
        ...props,
      },
    });

  test('shows the last attribute of modelPath', () => {
    const wrapper = mountRenderer();
    expect(wrapper.find('.attribute-input').element.value).toBe('name');
  });

  describe('debounced update', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    test('changes only the last attribute of modelPath after debounce', async () => {
      const wrapper = mountRenderer();
      await wrapper.find('.attribute-input').setValue('first');
      await wrapper.find('.attribute-input').setValue('firstName');
      expect(wrapper.emitted('update:componentModel')).toBeUndefined();

      await vi.advanceTimersByTimeAsync(500);
      const emitted = wrapper.emitted('update:componentModel');
      expect(emitted).toHaveLength(1);
      expect(emitted[0][0].lx.modelPath).toBe('list.person.firstName');
      expect(emitted[0][0].lx.displayType).toBe('primaryText');
    });

    test('invalid value cancels the pending update and shows reset', async () => {
      const wrapper = mountRenderer();
      const input = wrapper.find('.attribute-input');
      await input.setValue('first');
      await input.setValue('first.');
      expect(input.attributes('data-invalid')).toBe('true');
      expect(wrapper.find('.reset-button').exists()).toBe(true);

      await vi.advanceTimersByTimeAsync(500);
      expect(wrapper.emitted('update:componentModel')).toBeUndefined();
    });

    test('reset restores the current attribute', async () => {
      const wrapper = mountRenderer();
      const input = wrapper.find('.attribute-input');
      await input.setValue('');
      await wrapper.find('.reset-button').trigger('click');

      expect(input.element.value).toBe('name');
      expect(input.attributes('data-invalid')).toBe('false');
      expect(wrapper.find('.reset-button').exists()).toBe(false);

      await vi.advanceTimersByTimeAsync(500);
      expect(wrapper.emitted('update:componentModel')).toBeUndefined();
    });
  });

  test('is hidden when modelPath has no attribute (points to the row itself)', () => {
    const wrapper = mountRenderer({
      componentModel: { lx: { displayType: 'primaryText', modelPath: 'list' } },
    });
    expect(wrapper.find('.attribute-input').exists()).toBe(false);
  });

  test('is hidden when the item has no modelPath', () => {
    const wrapper = mountRenderer({ componentModel: { lx: { displayType: 'stack' } } });
    expect(wrapper.find('.attribute-input').exists()).toBe(false);
  });
});
