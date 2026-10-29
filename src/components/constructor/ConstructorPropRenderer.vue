<script setup>
import { computed, ref, nextTick, watch } from 'vue';
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
  navigation: {
    type: Array,
    default: () => [],
  },
  selectedModel: {
    type: [Object, Array, String, Number, Boolean],
    default: null,
  },
  templateMode: {
    type: Boolean,
    default: false,
  },
  schemaInfo: {
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
      editing: 'Labošana',
      notFoundSearch: 'Nav atrasts:',
      notFoundProps: 'Nav atrasts',
      searchText: 'Meklēt',
      invalidArrayOfObjects: 'Nederīgs JSON objekts. Ievadiet masīvu ar objektiem',
      removeItem: 'Dzēst ierakstu',
      removeItemHint: 'Nospiediet Delete, lai noņemtu ierakstu',
      addItemButtonTooltip: 'Pievienot ierakstu',
      addButtonLabel: 'Pievienot ierakstu',
      showAllFields: 'Rādīt visus laukus',
      row: 'Rinda',
      column: 'Kolonna',
      autoSize: 'Automātisks izmērs (auto)',
      sizeRatio: 'Izmēra proporcija',
      modelPathAttributeError: 'Atribūts nedrīkst būt tukšs un saturēt punktus vai atstarpes',
      validations: {
        required: 'Lauks ir obligāts',
        unique: 'Vērtībai jābūt unikālai',
      },
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

const emits = defineEmits([
  'update:modelValue',
  'update:componentModel',
  'update:schemaKey',
  'update:selectedModel',
  'error',
]);

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
  if (componentName === 'LxForm' && !props.navigation?.some((nav) => nav?.name === 'LxFilters')) {
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

function filterMainProps(propValues, component) {
  if (component === 'LxForm' && props.navigation?.some((nav) => nav?.name === 'LxFilters')) {
    return {};
  }
  if (component === 'LxSection' && props.navigation?.some((nav) => nav?.name === 'LxFilters')) {
    const { columnCount } = propValues;
    return columnCount ? { columnCount } : {};
  }
  return propValues;
}

function filterAdditionalProps(propValues, component) {
  if (component === 'LxForm' && props.navigation?.some((nav) => nav?.name === 'LxFilters')) {
    return {};
  }
  if (component === 'LxSection' && props.navigation?.some((nav) => nav?.name === 'LxFilters')) {
    return {};
  }
  return propValues;
}

const hasSchemaKeyEdit = computed(() => {
  if (!props.componentName) return false;
  if (
    props.componentName === 'LxForm' &&
    props.navigation?.some((nav) => nav?.name === 'LxFilters')
  ) {
    return false;
  }
  if (props.componentName === 'LxViewLayout') return false;
  return true;
});

const isSchemaKeyVisible = computed(() => {
  if (!hasSchemaKeyEdit.value || props.templateMode || props.schemaInfo?.isInsideCustomItemsList)
    return false;
  if (props.searchString) {
    return 'schemaKey'?.includes(props.searchString?.toLowerCase());
  }
  return true;
});

const mainProps = computed(() => {
  // If in template mode, show only attribute props in main section
  if (props.templateMode) {
    const filtered = Object.entries(props.componentPropsDefinitions ?? {}).filter(([key]) =>
      key.includes('Attribute')
    );
    const searched = props.searchString
      ? filtered.filter(([key]) => key.toLowerCase().includes(props.searchString.toLowerCase()))
      : filtered;
    return Object.fromEntries(searched);
  }

  const res = filterByGroup(props.componentPropsDefinitions, 'main');

  const nonPropItems = getNonPropItems(props.componentName);

  if (nonPropItems) {
    return { ...res, ...nonPropItems };
  }

  return filterMainProps(res, props.componentName);
});

const additionalProps = computed(() => {
  if (props.templateMode) {
    return {};
  }

  return filterAdditionalProps(
    filterByGroup(props.componentPropsDefinitions, 'additional'),
    props.componentName
  );
});
const modeProps = computed(() => {
  if (props.templateMode) {
    return {};
  }
  return filterByGroup(props.componentPropsDefinitions, 'mode');
});

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

  if (key === 'preHeaderInfo') {
    updatedModel.lx.showPreHeaderInfo = !compModel.value.lx.showPreHeaderInfo;
  } else if (key === 'postHeaderInfo') {
    updatedModel.lx.showPostHeaderInfo = !compModel.value.lx.showPostHeaderInfo;
  }

  compModel.value = updatedModel;

  // Fix for the preHeaderInfo and postHeaderInfo slots not showing after updating them from null
  nextTick(() => {
    if (key === 'preHeaderInfo') {
      updatedModel.lx.showPreHeaderInfo = !compModel.value.lx.showPreHeaderInfo;
    } else if (key === 'postHeaderInfo') {
      updatedModel.lx.showPostHeaderInfo = !compModel.value.lx.showPostHeaderInfo;
    }
    compModel.value = updatedModel;
  });
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

function handleErrorEmit(params) {
  emits('error', params);
}

function handleUpdateSelectedModel(params) {
  emits('update:selectedModel', params);
}

// Splits list custom item lx.modelPath into the editable last attribute and the rest,
// e.g. 'list.person.name' -> { prefix: 'list.person.', attribute: 'name' }
const modelPathParts = computed(() => {
  const match = compModel.value?.lx?.modelPath?.match(/^(.*\.)([^.]+)$/);
  return match ? { prefix: match[1], attribute: match[2] } : null;
});

const modelPathAttribute = ref(null);
const modelPathAttributeError = ref(null);

watch(
  () => modelPathParts.value?.attribute,
  (value) => {
    modelPathAttribute.value = value ?? null;
    modelPathAttributeError.value = null;
  },
  { immediate: true }
);

// Applies the attribute only if the same element (with the same modelPath) is still selected
const debouncedModelPathAttributeUpdate = useDebounceFn((modelPath, attribute) => {
  const parts = modelPathParts.value;
  if (!attribute || !parts || compModel.value?.lx?.modelPath !== modelPath) return;
  if (attribute === parts.attribute) return;

  compModel.value = {
    ...compModel.value,
    lx: {
      ...compModel.value.lx,
      modelPath: `${parts.prefix}${attribute}`,
    },
  };
}, 500);

// Changes only the last attribute of lx.modelPath
function updateModelPathAttribute(value) {
  modelPathAttribute.value = value;

  const attribute = value?.trim();
  if (!attribute || /[.\s]/.test(attribute)) {
    modelPathAttributeError.value = props.texts?.modelPathAttributeError;
    // Cancels the pending update of the previous valid value
    debouncedModelPathAttributeUpdate(null, null);
    return;
  }
  modelPathAttributeError.value = null;
  debouncedModelPathAttributeUpdate(compModel.value?.lx?.modelPath, attribute);
}

function resetModelPathAttribute() {
  debouncedModelPathAttributeUpdate(null, null);
  modelPathAttribute.value = modelPathParts.value?.attribute ?? null;
  modelPathAttributeError.value = null;
}

function hasCustomAttributeField() {
  return (
    props.schemaInfo?.isInsideCustomItemsList &&
    props.componentName !== 'LxList' &&
    !!modelPathParts.value
  );
}
</script>

<template>
  <LxEmptyState
    :label="
      searchString
        ? `${texts.notFoundSearch} ${JSON.stringify(props.searchString)}`
        : texts.notFoundProps
    "
    v-if="
      !Object.keys(mainProps).length &&
      !Object.keys(additionalProps).length &&
      !Object.keys(modeProps).length &&
      !isSchemaKeyVisible &&
      !hasCustomAttributeField()
    "
  />
  <LxForm kind="stripped" v-if="Object.keys(mainProps).length || hasCustomAttributeField()">
    <LxRow label="value" v-if="hasCustomAttributeField()">
      <LxStack orientation="horizontal" kind="compact">
        <LxTextInput
          :modelValue="modelPathAttribute"
          :invalid="!!modelPathAttributeError"
          :invalidationMessage="modelPathAttributeError"
          @update:modelValue="updateModelPathAttribute"
        />
        <LxButton
          v-if="modelPathAttributeError"
          icon="reset"
          kind="tertiary"
          :label="texts?.resetKey"
          variant="icon-only"
          @click="resetModelPathAttribute()"
        />
      </LxStack>
    </LxRow>
    <LxRow
      v-for="(item, key) in mainProps"
      :key="item.name"
      :label="`:${key}`"
      v-show="!item.extra"
    >
      <PropRendererItem
        :modelValue="model"
        :item="item"
        :componentPropsDefinitions="componentPropsDefinitions"
        :name="key"
        :componentName="componentName"
        :selectedModel="selectedModel"
        :texts="texts"
        @error="handleErrorEmit"
        @update:selectedModel="handleUpdateSelectedModel"
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
    v-if="Object.keys(additionalProps).length || isSchemaKeyVisible"
  >
    <LxForm kind="stripped">
      <LxRow label="schemaKey" v-if="isSchemaKeyVisible">
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
          :componentPropsDefinitions="componentPropsDefinitions"
          :name="key"
          :componentName="componentName"
          :selectedModel="selectedModel"
          :texts="texts"
          @error="handleErrorEmit"
          @update:selectedModel="handleUpdateSelectedModel"
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
          :componentPropsDefinitions="componentPropsDefinitions"
          :name="key"
          :componentName="componentName"
          :selectedModel="selectedModel"
          :texts="texts"
          @error="handleErrorEmit"
          @update:selectedModel="handleUpdateSelectedModel"
        />
      </LxRow>
    </LxForm>
  </LxExpander>
</template>
