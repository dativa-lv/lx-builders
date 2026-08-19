<script setup>
import { ref, computed } from 'vue';
import {
  LxTextInput,
  LxValuePicker,
  LxToggle,
  LxButton,
  LxModal,
  LxAppendableList,
  lxFormatUtils,
  LxRow,
  LxDateTimePicker,
  LxForm,
  LxEmptyState,
  LxStack,
  LxTextArea,
} from '@dativa-lv/lx-ui';
import LxFormBuilder from '@/components/FormBuilder.vue';
import IconSelection from '@/components/constructor/helperComponents/IconSelection.vue';
import {
  columnDefinitionsSizes,
  columnDefinitionsTypes,
  columnDefinitionsKinds,
  badgeDefinitionTypeItems,
  badgeTypeItems,
  iconSetItems,
} from '@/utils/constructorUtils';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  componentName: {
    type: String,
    default: null,
  },
  selectedModel: {
    type: [Object, Array, String, Number, Boolean],
    default: null,
  },
  texts: {
    type: Object,
    default: () => ({
      save: 'Saglabāt',
      close: 'Aizvērt',
      edit: 'Labot',
      editing: 'Labošana',
      searchText: 'Meklēt',
      notFoundSearch: 'Nav atrasts:',
      invalidArrayOfObjects: 'Nederīgs. Ievadiet masīvu ar objektiem',
      removeItem: 'Dzēst ierakstu',
      removeItemHint: 'Nospiediet Delete, lai noņemtu ierakstu',
      addItemButtonTooltip: 'Pievienot ierakstu',
      addButtonLabel: 'Pievienot ierakstu',
      showAllFields: 'Rādīt visus laukus',
      validations: {
        required: 'Lauks ir obligāts',
        unique: 'Vērtībai jābūt unikālai',
      },
    }),
  },
});

const emits = defineEmits(['update:modelValue', 'update:selectedModel', 'error']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

function isPropNumber(data) {
  return (
    data.type.name === 'Number' ||
    (Array.isArray(data.type) && data.type.some((type) => type.name === 'Number'))
  );
}

function isPropString(data) {
  return (
    (data.type.name === 'String' ||
      (Array.isArray(data.type) && data.type.some((type) => type.name === 'String'))) &&
    props.name !== 'icon' &&
    props.name !== 'emptyStateIcon'
  );
}

function isPropBoolean(data) {
  return (
    data.type.name === 'Boolean' ||
    (Array.isArray(data.type) && data.type.some((type) => type.name === 'Boolean'))
  );
}

function isPropDate(data) {
  return data.type.name === 'Date';
}

function formatOptions(options) {
  return (options || [])
    .filter((option) => option != null)
    .map((option) => ({
      id: option,
      name: option,
    }));
}

const actionDefinitionsModal = ref();
const actionDefModel = ref(null);
const actionDefList = ref();

function editActionDefinitions() {
  actionDefinitionsModal.value.open();
  actionDefModel.value = lxFormatUtils.objectClone(props.modelValue[props.name]);
}

const isActionDefinitionsForToolbar = computed(
  () =>
    props.name === 'toolbarActionDefinitions' ||
    props.name === 'selectionActionDefinitions' ||
    props.componentName === 'LxDrawPad' ||
    props.componentName === 'LxMarkdownTextArea' ||
    props.componentName === 'LxCamera' ||
    props.componentName === 'LxQrScanner' ||
    (props.name === 'actionDefinitions' &&
      (props.componentName === 'LxList' || props.componentName === 'LxDataGrid'))
);

const actionDefinitionsErrors = ref({});

function validateActionDefinitions(actions, isToolbar) {
  const ids = new Set();
  const errors = {};
  actionDefinitionsErrors.value = {};

  actions.forEach((action) => {
    const obj = {};
    if (!action.id) {
      obj.id = props.texts.validations.required;
    } else if (ids.has(action.id)) {
      obj.id = props.texts.validations.unique;
    } else {
      ids.add(action.id);
    }

    if (!action.name) {
      obj.name = props.texts.validations.required;
    }

    // If the action is not for a toolbar, validate that the kind is provided
    if (!action.kind && !isToolbar) {
      obj.kind = props.texts.validations.required;
    }

    if (Object.keys(obj).length > 0) {
      errors[action._lx_appendableKey] = obj;
    }
  });

  actionDefinitionsErrors.value = errors;

  return Object.keys(errors)?.length === 0;
}

function actionModalActionClicked(action) {
  if (action === 'save') {
    if (props.name !== 'emptyStateActionDefinitions') {
      if (!validateActionDefinitions(actionDefModel.value, isActionDefinitionsForToolbar.value)) {
        emits('error', 'actionDefinitionsValidation');
        return;
      }
    }

    const res = actionDefList.value.clearModel(actionDefModel.value);

    model.value[props.name] = res;
    actionDefinitionsModal.value.close();
  }
}

const indexModal = ref();
const indexModel = ref(null);
const indexList = ref();
function editFormIndex() {
  indexModel.value = lxFormatUtils.objectClone(props.modelValue.index);
  indexModal.value.open();
}

function indexModelActionClicked(action) {
  if (action === 'save') {
    const res = indexList.value.clearModel(indexModel.value);
    model.value.index = res;
    indexModal.value.close();
  }
}

const itemsModal = ref();
const itemsModel = ref(null);
const itemsList = ref();
const itemsInvalidMessage = ref(null);

function editItems() {
  itemsInvalidMessage.value = null;

  if (props.componentName === 'LxList' || props.componentName === 'LxDataGrid') {
    itemsModel.value = JSON.stringify(props.selectedModel, null, 2);
  } else {
    itemsModel.value = lxFormatUtils.objectClone(props.modelValue[props.name]);
  }
  itemsModal.value.open();
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateArrayOfObjects(value) {
  let parsedValue = value;

  if (typeof parsedValue === 'string') {
    try {
      parsedValue = JSON.parse(parsedValue);
    } catch {
      return false;
    }
  }

  return Array.isArray(parsedValue) && parsedValue.every((item) => isPlainObject(item));
}

function itemsActionClicked(action) {
  if (action === 'save') {
    itemsInvalidMessage.value = null;

    if (props.componentName === 'LxList' || props.componentName === 'LxDataGrid') {
      let parsedItems = itemsModel.value;

      if (typeof parsedItems === 'string') {
        if (!parsedItems.trim()) {
          parsedItems = [];
        } else {
          try {
            parsedItems = JSON.parse(parsedItems);
          } catch {
            itemsInvalidMessage.value = props.texts?.invalidArrayOfObjects;
            emits('error', 'itemsValidation');
            return;
          }
        }
      }

      if (validateArrayOfObjects(parsedItems)) {
        emits('update:selectedModel', parsedItems);
      } else {
        itemsInvalidMessage.value = props.texts?.invalidArrayOfObjects;
        emits('error', 'itemsValidation');
        return;
      }

      itemsModal.value.close();
    } else {
      const res = itemsList.value.clearModel(itemsModel.value);
      model.value[props.name] = res;
      itemsModal.value.close();
    }
  }
}

const textsModal = ref();
const textsModel = ref(null);
const textsSchema = ref(null);

function flattenObjectHierarchyToSchema(source) {
  const properties = {};

  function flattenRecursive(current, parentPath = '') {
    if (!isPlainObject(current)) {
      return;
    }

    Object.entries(current).forEach(([key, value]) => {
      const path = parentPath ? `${parentPath}.${key}` : key;
      if (isPlainObject(value)) {
        flattenRecursive(value, path);
      } else {
        properties[path] = { type: 'string' };
      }
    });
  }

  flattenRecursive(source);

  return {
    type: 'object',
    properties,
  };
}

function mergeOptionsRecursive(schemaTexts, defaultTexts) {
  const result = {};

  function mergeRecursive(currentSchema, currentDefault, parentPath = '') {
    if (!isPlainObject(currentDefault)) {
      return;
    }

    Object.entries(currentDefault).forEach(([key, defaultValue]) => {
      const path = parentPath ? `${parentPath}.${key}` : key;
      const schemaValue = isPlainObject(currentSchema) ? currentSchema[key] : undefined;

      if (isPlainObject(defaultValue)) {
        mergeRecursive(schemaValue, defaultValue, path);
      } else if (schemaValue === undefined) {
        result[path] = lxFormatUtils.objectClone(defaultValue);
      } else {
        result[path] = lxFormatUtils.objectClone(schemaValue);
      }
    });
  }

  mergeRecursive(schemaTexts, defaultTexts);

  return result;
}

function unflattenDotNotationObject(flatObject) {
  const result = {};

  if (!isPlainObject(flatObject)) {
    return result;
  }

  Object.entries(flatObject).forEach(([flatKey, value]) => {
    if (!flatKey.includes('.')) {
      result[flatKey] = lxFormatUtils.objectClone(value);
      return;
    }

    const parts = flatKey.split('.').filter(Boolean);
    let current = result;

    parts.forEach((part, index) => {
      const isLeaf = index === parts.length - 1;
      if (isLeaf) {
        current[part] = lxFormatUtils.objectClone(value);
        return;
      }

      if (!isPlainObject(current[part])) {
        current[part] = {};
      }

      current = current[part];
    });
  });

  return result;
}

function editTexts() {
  textsModal.value.open();

  const defaultTexts = props.item?.options || {};
  textsSchema.value = flattenObjectHierarchyToSchema(defaultTexts);
  textsModel.value = mergeOptionsRecursive(props.modelValue.texts, defaultTexts);
}

function textsActionClicked(action) {
  if (action === 'save') {
    model.value.texts = unflattenDotNotationObject(textsModel.value);
    textsModal.value.close();
  }
}

const textSearchModel = ref('');
const filteredTextsSchema = computed(() => {
  if (!textSearchModel.value) {
    return textsSchema.value;
  }
  return {
    properties: Object.fromEntries(
      Object.entries(textsSchema.value.properties).filter(([key]) =>
        key.toLowerCase().includes(textSearchModel.value.toLowerCase())
      )
    ),
  };
});

const actionDefinitionsKindItems = computed(() => {
  if (isActionDefinitionsForToolbar.value) {
    return [
      {
        id: 'primary',
        name: 'primary',
      },
      {
        id: 'secondary',
        name: 'secondary',
      },
      {
        id: 'tertiary',
        name: 'tertiary',
      },
      {
        id: 'ghost',
        name: 'ghost',
      },
      {
        id: 'toggle',
        name: 'toggle',
      },
    ];
  }

  return [
    {
      id: 'primary',
      name: 'primary',
    },
    {
      id: 'secondary',
      name: 'secondary',
    },
    {
      id: 'tertiary',
      name: 'tertiary',
    },
    {
      id: 'additional',
      name: 'additional',
    },
  ];
});

function getValuePickerVariant(options) {
  if (
    props.name === 'columnSpan' ||
    props.name === 'rowSpan' ||
    props.name === 'columnCount' ||
    props.name === 'cadenceOfMinutes' ||
    props.name === 'cadenceOfSeconds'
  )
    return 'tags';
  return options.length > 5 ? 'dropdown' : 'default';
}

const badgeDefinitionsModal = ref();
const badgeDefinitionsModel = ref(null);
const badgeDefinitionsList = ref();

function editBadgeDefinitions() {
  badgeDefinitionsModel.value = lxFormatUtils.objectClone(props.modelValue[props.name] || []);
  badgeDefinitionsModal.value.open();
}

function badgeDefinitionsActionClicked(action) {
  if (action === 'save') {
    const res = badgeDefinitionsList.value.clearModel(badgeDefinitionsModel.value);
    model.value[props.name] = res;
    badgeDefinitionsModal.value.close();
  }
}

const groupDefinitionsModal = ref();
const groupDefinitionsModel = ref(null);
const groupDefinitionsList = ref();

const actionModalToggleValue = ref(false);
const selectionModalToggleValue = ref(false);
const listActionsModalToggleValue = ref(false);

function editGroupDefinitions() {
  groupDefinitionsModel.value = lxFormatUtils.objectClone(props.modelValue[props.name]);
  groupDefinitionsModal.value.open();
}

function groupDefinitionsActionClicked(action) {
  if (action === 'save') {
    const res = groupDefinitionsList.value.clearModel(groupDefinitionsModel.value);
    model.value[props.name] = res;
    groupDefinitionsModal.value.close();
  }
}

function getAppendableListTexts() {
  return {
    removeItem: props.texts?.removeItem,
    removeItemHint: props.texts?.removeItemHint,
    addItemButtonTooltip: props.texts?.addItemButtonTooltip,
    addButtonLabel: props.texts?.addButtonLabel,
  };
}
</script>

<template>
  <LxDateTimePicker
    v-model="model[name]"
    kind="dateTime"
    v-if="(isPropString(item) || isPropDate(item)) && (name === 'minDate' || name === 'maxDate')"
  />
  <LxTextInput v-model="model[name]" v-else-if="isPropString(item) && !item.options" />
  <LxTextInput
    v-model="model[name]"
    mask="integer"
    :convertToString="false"
    v-else-if="!item.options && isPropNumber(item)"
  />
  <LxToggle v-model="model[name]" v-else-if="isPropBoolean(item)" />
  <LxValuePicker
    v-model="model[name]"
    :items="formatOptions(item.options)"
    v-else-if="item.options && (isPropString(item) || isPropNumber(item))"
    :variant="getValuePickerVariant(item.options)"
    :nullable="item.options.includes(null)"
    :convertToString="!isPropString(item)"
  />
  <IconSelection
    v-if="props.name === 'icon' || props.name === 'emptyStateIcon'"
    v-model="model[name]"
  />
  <template v-if="props.name === 'index'">
    <LxButton :label="texts.edit" kind="secondary" icon="edit" @click="editFormIndex" />

    <LxModal
      ref="indexModal"
      :label="texts?.editing"
      size="m"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      :texts="{ close: texts.close }"
      @actionClick="indexModelActionClicked"
    >
      <LxAppendableList
        ref="indexList"
        v-model="indexModel"
        :columnCount="2"
        requiredMode="none"
        :texts="getAppendableListTexts()"
      >
        <template #customItem="{ item }">
          <LxRow label="id">
            <LxTextInput v-model="item.id" />
          </LxRow>
          <LxRow label="name">
            <LxTextInput v-model="item.name" />
          </LxRow>
        </template>
      </LxAppendableList>
    </LxModal>
  </template>
  <template
    v-if="
      props.name === 'actionDefinitions' ||
      props.name === 'toolbarActionDefinitions' ||
      props.name === 'selectionActionDefinitions' ||
      props.name === 'emptyStateActionDefinitions'
    "
  >
    <LxButton :label="texts.edit" icon="edit" kind="secondary" @click="editActionDefinitions" />
    <LxModal
      ref="actionDefinitionsModal"
      :label="texts?.editing"
      size="l"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      :texts="{ close: texts.close }"
      @actionClick="actionModalActionClicked"
    >
      <LxAppendableList
        v-if="
          props.name === 'emptyStateActionDefinitions' ||
          (props.name === 'actionDefinitions' &&
            (props.componentName === 'LxForm' || props.componentName === 'LxSection'))
        "
        ref="actionDefList"
        v-model="actionDefModel"
        :columnCount="8"
        requiredMode="required-asterisk"
        :toolbarActionDefinitions="[
          {
            id: 'advanced',
            kind: 'toggle',
            value: actionModalToggleValue,
            title: texts.showAllFields,
          },
        ]"
        :texts="getAppendableListTexts()"
        @toolbarActionClick="(_, x) => (actionModalToggleValue = x)"
      >
        <template #customItem="{ item }">
          <LxRow label="id" columnSpan="2" :required="true">
            <LxTextInput
              v-model="item.id"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.id"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.id"
            />
          </LxRow>
          <LxRow
            label="name"
            :columnSpan="props.name !== 'emptyStateActionDefinitions' ? '2' : '4'"
            :required="true"
          >
            <LxTextInput
              v-model="item.name"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.name"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.name"
            />
          </LxRow>
          <LxRow label="icon" columnSpan="2">
            <IconSelection v-model="item.icon" :iconSet="item?.iconSet" />
          </LxRow>

          <LxRow
            v-if="props.name !== 'emptyStateActionDefinitions'"
            label="kind"
            columnSpan="2"
            :required="!isActionDefinitionsForToolbar"
          >
            <LxValuePicker
              v-model="item.kind"
              variant="dropdown"
              :items="actionDefinitionsKindItems"
              :nullable="isActionDefinitionsForToolbar"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.kind"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.kind"
            />
          </LxRow>

          <LxRow label="iconSet" columnSpan="2" v-if="actionModalToggleValue">
            <LxValuePicker v-model="item.iconSet" variant="dropdown" :items="iconSetItems" />
          </LxRow>

          <LxRow label="title" columnSpan="2" v-if="actionModalToggleValue">
            <LxTextInput v-model="item.title" />
          </LxRow>

          <LxRow label="badge" columnSpan="2" v-if="actionModalToggleValue">
            <LxTextInput v-model="item.badge" />
          </LxRow>
          <LxRow label="badgeType" columnSpan="2" v-if="actionModalToggleValue">
            <LxValuePicker v-model="item.badgeType" variant="dropdown" :items="badgeTypeItems" />
          </LxRow>
          <LxRow label="badgeIcon" columnSpan="2" v-if="actionModalToggleValue">
            <IconSelection v-model="item.badgeIcon" />
          </LxRow>
          <LxRow label="badgeTitle" columnSpan="2" v-if="actionModalToggleValue">
            <LxTextInput v-model="item.badgeTitle" />
          </LxRow>

          <LxRow label="destructive" v-if="actionModalToggleValue">
            <LxToggle v-model="item.destructive" />
          </LxRow>

          <LxRow label="disabled" v-if="actionModalToggleValue">
            <LxToggle v-model="item.disabled" />
          </LxRow>
          <LxRow label="loading" v-if="actionModalToggleValue">
            <LxToggle v-model="item.loading" />
          </LxRow>
          <LxRow label="busy" v-if="actionModalToggleValue">
            <LxToggle v-model="item.busy" />
          </LxRow>
        </template>
      </LxAppendableList>
      <LxAppendableList
        v-if="
          props.name === 'actionDefinitions' &&
          (props.componentName === 'LxList' || props.componentName === 'LxDataGrid')
        "
        ref="actionDefList"
        v-model="actionDefModel"
        :columnCount="8"
        requiredMode="required-asterisk"
        :toolbarActionDefinitions="[
          {
            id: 'advanced',
            kind: 'toggle',
            value: listActionsModalToggleValue,
            title: texts.showAllFields,
          },
        ]"
        :texts="getAppendableListTexts()"
        @toolbarActionClick="(_, x) => (listActionsModalToggleValue = x)"
      >
        <template #customItem="{ item }">
          <LxRow label="id" columnSpan="2" :required="true">
            <LxTextInput
              v-model="item.id"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.id"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.id"
            />
          </LxRow>
          <LxRow label="name" columnSpan="2" :required="true">
            <LxTextInput
              v-model="item.name"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.name"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.name"
            />
          </LxRow>

          <LxRow label="icon" columnSpan="2">
            <IconSelection v-model="item.icon" :iconSet="item?.iconSet" />
          </LxRow>

          <LxRow label="kind" columnSpan="2" :required="!isActionDefinitionsForToolbar">
            <LxValuePicker
              v-model="item.kind"
              variant="dropdown"
              :items="actionDefinitionsKindItems"
              :nullable="isActionDefinitionsForToolbar"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.kind"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.kind"
            />
          </LxRow>
          <LxRow label="iconSet" columnSpan="2" v-if="listActionsModalToggleValue">
            <LxValuePicker v-model="item.iconSet" variant="dropdown" :items="iconSetItems" />
          </LxRow>
          <LxRow label="title" columnSpan="2" v-if="listActionsModalToggleValue">
            <LxTextInput v-model="item.title" />
          </LxRow>

          <LxRow label="enableByAttribute" columnSpan="2" v-if="listActionsModalToggleValue">
            <LxTextInput v-model="item.enableByAttribute" />
          </LxRow>
          <LxRow label="visibleByAttribute" columnSpan="2" v-if="listActionsModalToggleValue">
            <LxTextInput v-model="item.visibleByAttribute" />
          </LxRow>

          <LxRow label="badgeType" columnSpan="2" v-if="listActionsModalToggleValue">
            <LxValuePicker v-model="item.badgeType" variant="dropdown" :items="badgeTypeItems" />
          </LxRow>
          <LxRow label="badge" columnSpan="2" v-if="listActionsModalToggleValue">
            <LxTextInput v-model="item.badge" />
          </LxRow>

          <LxRow label="badgeIcon" columnSpan="2" v-if="listActionsModalToggleValue">
            <IconSelection v-model="item.badgeIcon" />
          </LxRow>
          <LxRow label="badgeTitle" columnSpan="2" v-if="listActionsModalToggleValue">
            <LxTextInput v-model="item.badgeTitle" />
          </LxRow>

          <LxRow label="destructive" v-if="listActionsModalToggleValue">
            <LxToggle v-model="item.destructive" />
          </LxRow>
          <LxRow label="disabled" v-if="listActionsModalToggleValue">
            <LxToggle v-model="item.disabled" />
          </LxRow>
          <LxRow label="loading" v-if="listActionsModalToggleValue">
            <LxToggle v-model="item.loading" />
          </LxRow>
          <LxRow label="busy" v-if="listActionsModalToggleValue">
            <LxToggle v-model="item.busy" />
          </LxRow>
        </template>
      </LxAppendableList>
      <LxAppendableList
        v-else-if="isActionDefinitionsForToolbar"
        ref="actionDefList"
        v-model="actionDefModel"
        :columnCount="8"
        requiredMode="required-asterisk"
        :toolbarActionDefinitions="[
          {
            id: 'advanced',
            kind: 'toggle',
            value: selectionModalToggleValue,
            title: texts.showAllFields,
          },
        ]"
        :texts="getAppendableListTexts()"
        @toolbarActionClick="(_, x) => (selectionModalToggleValue = x)"
      >
        <template #customItem="{ item }">
          <LxRow label="id" columnSpan="2" :required="true">
            <LxTextInput
              v-model="item.id"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.id"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.id"
            />
          </LxRow>
          <LxRow label="name" columnSpan="2" :required="true">
            <LxTextInput
              v-model="item.name"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.name"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.name"
            />
          </LxRow>

          <LxRow label="icon" columnSpan="2">
            <IconSelection v-model="item.icon" :iconSet="item?.iconSet" />
          </LxRow>

          <LxRow label="kind" columnSpan="2" :required="!isActionDefinitionsForToolbar">
            <LxValuePicker
              v-model="item.kind"
              variant="dropdown"
              :items="actionDefinitionsKindItems"
              :nullable="isActionDefinitionsForToolbar"
              :invalid="!!actionDefinitionsErrors?.[item?._lx_appendableKey]?.kind"
              :invalidationMessage="actionDefinitionsErrors?.[item?._lx_appendableKey]?.kind"
            />
          </LxRow>
          <LxRow label="iconSet" columnSpan="2" v-if="selectionModalToggleValue">
            <LxValuePicker v-model="item.iconSet" variant="dropdown" :items="iconSetItems" />
          </LxRow>
          <LxRow label="title" columnSpan="2" v-if="selectionModalToggleValue">
            <LxTextInput v-model="item.title" />
          </LxRow>
          <LxRow label="area" columnSpan="2" v-if="selectionModalToggleValue">
            <LxValuePicker
              v-model="item.area"
              :items="[
                { id: 'left', name: 'left' },
                { id: 'right', name: 'right' },
              ]"
              :nullable="true"
              variant="dropdown"
            />
          </LxRow>
          <LxRow label="value" columnSpan="2" v-if="selectionModalToggleValue">
            <LxToggle v-model="item.value" />
          </LxRow>

          <LxRow label="badgeType" columnSpan="2" v-if="selectionModalToggleValue">
            <LxValuePicker v-model="item.badgeType" variant="dropdown" :items="badgeTypeItems" />
          </LxRow>
          <LxRow label="badge" columnSpan="2" v-if="selectionModalToggleValue">
            <LxTextInput v-model="item.badge" />
          </LxRow>

          <LxRow label="badgeIcon" columnSpan="2" v-if="selectionModalToggleValue">
            <IconSelection v-model="item.badgeIcon" />
          </LxRow>
          <LxRow label="badgeTitle" columnSpan="2" v-if="selectionModalToggleValue">
            <LxTextInput v-model="item.badgeTitle" />
          </LxRow>

          <LxRow label="groupId" columnSpan="2" v-if="selectionModalToggleValue">
            <LxTextInput v-model="item.groupId" />
          </LxRow>
          <LxRow label="nestedGroupId" columnSpan="2" v-if="selectionModalToggleValue">
            <LxTextInput v-model="item.nestedGroupId" />
          </LxRow>

          <LxRow label="priority" columnSpan="2" v-if="selectionModalToggleValue">
            <LxTextInput v-model="item.priority" mask="integer" :convertToString="false" />
          </LxRow>

          <LxRow label="nonResponsive" columnSpan="2" v-if="selectionModalToggleValue">
            <LxToggle v-model="item.nonResponsive" />
          </LxRow>

          <LxRow label="destructive" v-if="selectionModalToggleValue">
            <LxToggle v-model="item.destructive" />
          </LxRow>
          <LxRow label="disabled" v-if="selectionModalToggleValue">
            <LxToggle v-model="item.disabled" />
          </LxRow>
          <LxRow label="loading" v-if="selectionModalToggleValue">
            <LxToggle v-model="item.loading" />
          </LxRow>
          <LxRow label="busy" v-if="selectionModalToggleValue">
            <LxToggle v-model="item.busy" />
          </LxRow>
        </template>
      </LxAppendableList>
    </LxModal>
  </template>

  <template v-if="props.name === 'items'">
    <LxButton :label="texts.edit" icon="edit" kind="secondary" @click="editItems" />
    <LxModal
      ref="itemsModal"
      :label="texts?.editing"
      size="l"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      :texts="{ close: texts.close }"
      @actionClick="itemsActionClicked"
    >
      <LxTextArea
        v-model="itemsModel"
        :rows="20"
        :invalid="!!itemsInvalidMessage"
        :invalidationMessage="itemsInvalidMessage"
        v-if="componentName === 'LxList' || componentName === 'LxDataGrid'"
      />

      <LxAppendableList
        v-else
        ref="itemsList"
        v-model="itemsModel"
        :columnCount="4"
        requiredMode="required-asterisk"
        :texts="getAppendableListTexts()"
      >
        <template #customItem="{ item }">
          <template v-if="componentName === 'LxContentSwitcher'">
            <LxRow label="id" :required="true">
              <LxTextInput v-model="item.id" />
            </LxRow>
            <LxRow label="name" :required="true">
              <LxTextInput v-model="item.name" />
            </LxRow>
            <LxRow label="icon">
              <IconSelection v-model="item.icon" :iconSet="item?.iconSet" />
            </LxRow>
            <LxRow label="iconSet">
              <LxValuePicker v-model="item.iconSet" variant="dropdown" :items="iconSetItems" />
            </LxRow>
          </template>
          <template v-else>
            <LxRow label="id" columnSpan="1">
              <LxTextInput v-model="item.id" />
            </LxRow>
            <LxRow label="name" columnSpan="2">
              <LxTextInput v-model="item.name" />
            </LxRow>
            <LxRow label="description" columnSpan="1">
              <LxTextInput v-model="item.description" />
            </LxRow>
          </template>
        </template>
      </LxAppendableList>
    </LxModal>
  </template>
  <template v-if="props.name === 'groupDefinitions' || props.name === 'columnDefinitions'">
    <LxButton :label="texts.edit" kind="secondary" icon="edit" @click="editGroupDefinitions" />
    <LxModal
      ref="groupDefinitionsModal"
      :label="texts?.editing"
      size="m"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      :texts="{ close: texts.close }"
      @actionClick="groupDefinitionsActionClicked"
    >
      <LxAppendableList
        v-if="props.name === 'groupDefinitions'"
        ref="groupDefinitionsList"
        v-model="groupDefinitionsModel"
        :columnCount="3"
        requiredMode="none"
        :texts="getAppendableListTexts()"
      >
        <template #customItem="{ item }">
          <LxRow label="id">
            <LxTextInput v-model="item.id" />
          </LxRow>
          <LxRow label="name">
            <LxTextInput v-model="item.name" />
          </LxRow>
          <LxRow label="badge">
            <LxTextInput v-model="item.badge" />
          </LxRow>
          <LxRow label="badgeIcon">
            <IconSelection v-model="item.badgeIcon" />
          </LxRow>

          <LxRow label="badgeType">
            <LxValuePicker v-model="item.badgeType" variant="dropdown" :items="badgeTypeItems" />
          </LxRow>
          <LxRow label="badgeTitle">
            <LxTextInput v-model="item.badgeTitle" />
          </LxRow>
          <!-- TODO: missing expanded attribute -->
        </template>
      </LxAppendableList>

      <LxAppendableList
        v-else
        ref="groupDefinitionsList"
        v-model="groupDefinitionsModel"
        :columnCount="4"
        requiredMode="none"
        :texts="getAppendableListTexts()"
      >
        <template #customItem="{ item }">
          <LxRow label="id">
            <LxTextInput v-model="item.id" />
          </LxRow>
          <LxRow label="attributeName">
            <LxTextInput v-model="item.attributeName" />
          </LxRow>
          <LxRow label="attributeDescription">
            <LxTextInput v-model="item.attributeDescription" />
          </LxRow>
          <LxRow label="name">
            <LxTextInput v-model="item.name" />
          </LxRow>
          <LxRow label="title">
            <LxTextInput v-model="item.title" />
          </LxRow>
          <!-- TODO: add dictionary attribute -->

          <LxRow label="kind">
            <LxValuePicker
              v-model="item.kind"
              variant="dropdown"
              :items="columnDefinitionsKinds"
              :nullable="true"
            />
          </LxRow>

          <LxRow label="type">
            <LxValuePicker
              v-model="item.type"
              variant="dropdown"
              :items="columnDefinitionsTypes"
              :nullable="true"
            />
          </LxRow>
          <LxRow label="size">
            <LxValuePicker
              v-model="item.size"
              variant="dropdown"
              :items="columnDefinitionsSizes"
              :nullable="true"
            />
          </LxRow>

          <!-- TODO: add "option" attribute -->

          <LxRow label="sortingTooltips">
            <LxTextInput v-model="item.sortingTooltips" />
          </LxRow>
        </template>
      </LxAppendableList>
    </LxModal>
  </template>

  <template v-if="props.name === 'texts'">
    <LxButton :label="texts.edit" icon="edit" kind="secondary" @click="editTexts" />
    <LxModal
      ref="textsModal"
      :label="texts?.editing"
      size="l"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      :texts="{ close: texts.close }"
      @actionClick="textsActionClicked"
      @close="textSearchModel = ''"
    >
      <LxForm :columnCount="3" kind="stripped">
        <LxRow columnSpan="3" :hideLabel="true">
          <LxStack horizontalAlignment="stretch">
            <LxTextInput v-model="textSearchModel" kind="search" :placeholder="texts.searchText" />
            <LxEmptyState
              :label="`${texts?.notFoundSearch} ${textSearchModel}`"
              v-if="!Object.keys(filteredTextsSchema?.properties || {}).length"
            />
          </LxStack>
        </LxRow>
        <LxFormBuilder v-model="textsModel" :schema="filteredTextsSchema" />
      </LxForm>
    </LxModal>
  </template>

  <template v-if="props.name === 'badgeDefinitions'">
    <LxButton :label="texts.edit" kind="secondary" icon="edit" @click="editBadgeDefinitions" />
    <LxModal
      ref="badgeDefinitionsModal"
      :label="texts?.editing"
      size="l"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      :texts="{ close: texts.close }"
      @actionClick="badgeDefinitionsActionClicked"
    >
      <LxAppendableList
        ref="badgeDefinitionsList"
        v-model="badgeDefinitionsModel"
        :columnCount="3"
        requiredMode="none"
        :texts="getAppendableListTexts()"
      >
        <template #customItem="{ item }">
          <LxRow label="id">
            <LxTextInput v-model="item.id" />
          </LxRow>
          <LxRow label="name">
            <LxTextInput v-model="item.name" />
          </LxRow>
          <LxRow label="icon">
            <IconSelection v-model="item.icon" :iconSet="item?.iconSet" />
          </LxRow>
          <LxRow label="iconSet">
            <LxValuePicker v-model="item.iconSet" :items="iconSetItems" variant="dropdown" />
          </LxRow>
          <LxRow label="title">
            <LxTextInput v-model="item.title" />
          </LxRow>
          <LxRow label="type">
            <LxValuePicker
              v-model="item.type"
              :items="badgeDefinitionTypeItems"
              variant="dropdown"
              :nullable="true"
            />
          </LxRow>
        </template>
      </LxAppendableList>
    </LxModal>
  </template>
</template>
