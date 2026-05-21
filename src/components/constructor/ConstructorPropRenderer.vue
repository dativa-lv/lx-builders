<script setup>
import { computed, ref } from 'vue';
import {
  LxForm,
  LxRow,
  LxExpander,
  LxTextInput,
  LxButton,
  LxStack,
  LxEmptyState,
} from '@dativa-lv/lx-ui';
import { useDebounceFn } from '@vueuse/core';
import PropRendererItem from '@/components/constructor/PropRendererItem.vue';

const props = defineProps({
  componentName: {
    type: String,
    default: null,
  },
  componentPropsDefinitions: {
    type: Object,
    default: () => ({}),
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  searchString: {
    type: String,
    default: null,
  },
  componentModel: {
    type: Object,
    default: () => ({}),
  },
  texts: {
    type: Object,
    default: () => ({
      additionalLabel: 'Additional',
      modeLabel: 'Mode',
      resetKey: 'Atiestatīt',
      save: 'Saglabāt',
      close: 'Aizvērt',
      edit: 'Labot',
      notFoundSearch: 'Nav atrasts:',
    }),
  },
  schemaKey: {
    type: String,
    default: '',
  },
  schemaKeyError: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['update:modelValue', 'update:componentModel', 'update:schemaKey']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const compModel = computed({
  get() {
    return props.componentModel;
  },
  set(value) {
    emits('update:componentModel', value);
  },
});

function getNonPropItems(componentName) {
  // Define non-prop items for specific components
  if (componentName === 'LxForm') {
    const res = {
      header: {
        name: 'header',
        type: 'String',
        group: 'main',
        extra: true,
      },
      preHeader: {
        name: 'preHeader',
        type: 'String',
        group: 'main',
        extra: true,
      },
      preHeaderInfo: {
        name: 'preHeaderInfo',
        type: 'String',
        group: 'main',
        extra: true,
      },
      postHeader: {
        name: 'postHeader',
        type: 'String',
        group: 'main',
        extra: true,
      },
      postHeaderInfo: {
        name: 'postHeaderInfo',
        type: 'string',
        group: 'main',
        extra: true,
      },
    };

    const searched = props.searchString
      ? Object.entries(res).filter(([key]) =>
          key.toLowerCase().includes(props.searchString.toLowerCase())
        )
      : Object.entries(res);

    return Object.fromEntries(searched);
  }
  return null;
}

function filterByGroup(object, group) {
  if (!object) return {};
  // Filter by group
  const filtered = Object.entries(object).filter(([, value]) => value?.group === group);
  // Sort by sequence
  const sorted = filtered.sort(([, a], [, b]) => (a.sequence || 0) - (b.sequence || 0));

  const searched = props.searchString
    ? sorted.filter(([key]) => key.toLowerCase().includes(props.searchString.toLowerCase()))
    : sorted;
  // Convert back to object
  return Object.fromEntries(searched);
}

const mainProps = computed(() => {
  const res = filterByGroup(props.componentPropsDefinitions, 'main');

  const nonPropItems = getNonPropItems(props.componentName);

  if (nonPropItems) {
    return { ...res, ...nonPropItems };
  }

  return res;
});

const additionalProps = computed(() =>
  filterByGroup(props.componentPropsDefinitions, 'additional')
);
const modeProps = computed(() => filterByGroup(props.componentPropsDefinitions, 'mode'));

function updateFormHeader(key, value) {
  let updatedModel = null;
  if (key === 'header') {
    updatedModel = {
      ...compModel.value,
    };
    updatedModel.title = value;
  } else {
    updatedModel = {
      ...compModel.value,
      lx: {
        ...compModel.value.lx,
        [key]: {
          properties: {
            text: {
              type: 'string',
              lx: {
                value,
              },
            },
          },
        },
      },
    };
  }

  compModel.value = updatedModel;
}

function getFormHeaderValue(item, key) {
  if (key === 'header') {
    return compModel.value.title;
  }
  return compModel.value.lx?.[key]?.properties?.text?.lx?.value;
}

const debouncedUpdate = useDebounceFn((value) => {
  emits('update:schemaKey', value);
}, 500);

const schemaKeyModel = computed({
  get() {
    return props.schemaKey;
  },
  set(value) {
    debouncedUpdate(value);
  },
});

const schemaKeyRender = ref(0);

function resetSchemaKeyInput() {
  schemaKeyModel.value = props.schemaKey;
  schemaKeyRender.value += 1;
}
</script>

<template>
  <LxEmptyState
    :label="`${texts.notFoundSearch} ${JSON.stringify(props.searchString)}`"
    v-if="
      !Object.keys(mainProps).length &&
      !Object.keys(additionalProps).length &&
      !Object.keys(modeProps).length
    "
  />
  <LxForm kind="stripped" v-if="Object.keys(mainProps).length">
    <LxRow
      v-for="(item, key) in mainProps"
      :key="item.name"
      :label="`:${key}`"
      v-show="!item.extra"
    >
      <PropRendererItem
        :modelValue="model"
        :item="item"
        :name="key"
        :componentName="componentName"
        :texts="texts"
      />
    </LxRow>
    <LxRow v-for="(item, key) in mainProps" :key="item.name" :label="`${key}`" v-show="item.extra">
      <LxTextInput
        v-if="item?.extra"
        :modelValue="getFormHeaderValue(item, key)"
        @update:modelValue="(x) => updateFormHeader(key, x)"
      />
    </LxRow>
  </LxForm>
  <LxExpander
    :label="texts.additionalLabel"
    v-if="
      Object.keys(additionalProps).length ||
      (componentName && componentName !== 'LxViewLayout' && !searchString) ||
      (searchString && 'schemaKey'?.includes(searchString?.toLowerCase()))
    "
  >
    <LxForm kind="stripped">
      <LxRow
        label="schemaKey"
        v-if="!searchString || (searchString && 'schemaKey'?.includes(searchString?.toLowerCase()))"
      >
        <LxStack orientation="horizontal" kind="compact">
          <LxTextInput
            :key="schemaKeyRender"
            v-model="schemaKeyModel"
            :invalid="!!schemaKeyError"
            :invalidationMessage="schemaKeyError"
          />
          <LxButton
            v-if="schemaKeyError"
            icon="reset"
            kind="tertiary"
            :label="texts?.resetKey"
            variant="icon-only"
            @click="resetSchemaKeyInput()"
          />
        </LxStack>
      </LxRow>
      <LxRow v-for="(item, key) in additionalProps" :key="item.name" :label="`:${key}`">
        <PropRendererItem
          :modelValue="model"
          :item="item"
          :name="key"
          :componentName="componentName"
          :texts="texts"
        />
      </LxRow>
    </LxForm>
  </LxExpander>
  <LxExpander :label="texts.modeLabel" v-if="Object.keys(modeProps).length">
    <LxForm kind="stripped">
      <LxRow v-for="(item, key) in modeProps" :key="item.name" :label="`:${key}`">
        <PropRendererItem
          :modelValue="model"
          :item="item"
          :name="key"
          :componentName="componentName"
          :texts="texts"
        />
      </LxRow>
    </LxForm>
  </LxExpander>
</template>
