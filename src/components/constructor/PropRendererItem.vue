<script setup>
import { ref, computed } from 'vue';
import {
  LxTextInput,
  LxValuePicker,
  LxToggle,
  lxIconUtils,
  LxAutoComplete,
  LxIcon,
  LxButton,
  LxModal,
  LxAppendableList,
  lxFormatUtils,
  LxRow,
  LxDateTimePicker,
} from '@dativa-lv/lx-ui';

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
  texts: {
    type: Object,
    default: () => ({
      save: 'Saglabāt',
      close: 'Aizvērt',
      edit: 'Labot',
    }),
  },
});

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const availableIcons = computed(() =>
  lxIconUtils.getAvailableIcons('cds')?.map((i) => ({ id: i, name: i }))
);

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
    props.name !== 'icon'
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

function actionModalActionClicked(action) {
  if (action === 'save') {
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

function editItems() {
  itemsModal.value.open();
  itemsModel.value = lxFormatUtils.objectClone(props.modelValue[props.name]);
}

function itemsActionClicked(action) {
  if (action === 'save') {
    const res = itemsList.value.clearModel(itemsModel.value);
    model.value[props.name] = res;
    itemsModal.value.close();
  }
}

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
  <!-- IconDisplay -->
  <LxAutoComplete v-if="props.name === 'icon'" v-model="model[name]" :items="availableIcons">
    <template #customItem="item">
      <div class="custom-auto-complete-item-with-icon lx-item-display">
        <LxIcon :value="item.name" />
        <p>{{ item.name }}</p>
      </div>
    </template>
  </LxAutoComplete>
  <template v-if="props.name === 'index'">
    <LxButton :label="texts.edit" kind="secondary" icon="edit" @click="editFormIndex" />

    <LxModal
      ref="indexModal"
      label="index"
      size="m"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      @actionClick="indexModelActionClicked"
    >
      <LxAppendableList ref="indexList" v-model="indexModel" :columnCount="2" requiredMode="none">
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
  <template v-if="props.name === 'actionDefinitions'">
    <LxButton :label="texts.edit" icon="edit" kind="secondary" @click="editActionDefinitions" />
    <LxModal
      ref="actionDefinitionsModal"
      label="actionDefinitions"
      size="l"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      @actionClick="actionModalActionClicked"
    >
      <LxAppendableList
        ref="actionDefList"
        v-model="actionDefModel"
        :columnCount="8"
        requiredMode="required-asterisk"
      >
        <template #customItem="{ item }">
          <LxRow label="id" columnSpan="2" :required="true">
            <LxTextInput v-model="item.id" />
          </LxRow>
          <LxRow label="name" columnSpan="2" :required="true">
            <LxTextInput v-model="item.name" />
          </LxRow>
          <LxRow label="title" columnSpan="2">
            <LxTextInput v-model="item.title" />
          </LxRow>
          <LxRow label="kind" columnSpan="2" :required="true">
            <LxValuePicker
              v-model="item.kind"
              variant="dropdown"
              :items="[
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
              ]"
            />
          </LxRow>
          <LxRow label="icon" columnSpan="2">
            <LxAutoComplete v-model="item.icon" :items="availableIcons">
              <template #customItem="item">
                <div class="custom-auto-complete-item-with-icon lx-item-display">
                  <LxIcon :value="item.name" />
                  <p>{{ item.name }}</p>
                </div>
              </template>
            </LxAutoComplete>
          </LxRow>
          <LxRow label="iconSet" columnSpan="2">
            <LxValuePicker
              v-model="item.iconSet"
              variant="dropdown"
              :items="[
                {
                  id: 'cds',
                  name: 'cds',
                },
                {
                  id: 'material',
                  name: 'material',
                },
                {
                  id: 'brand',
                  name: 'brand',
                },
                {
                  id: 'additional',
                  name: 'additional',
                },
              ]"
            />
          </LxRow>
          <LxRow label="disabled">
            <LxToggle v-model="item.disabled" />
          </LxRow>
          <LxRow label="loading">
            <LxToggle v-model="item.loading" />
          </LxRow>
          <LxRow label="busy">
            <LxToggle v-model="item.busy" />
          </LxRow>
          <LxRow label="destructive">
            <LxToggle v-model="item.destructive" />
          </LxRow>

          <LxRow label="badge" columnSpan="2">
            <LxTextInput v-model="item.badge" />
          </LxRow>
          <LxRow label="badgeType" columnSpan="2">
            <LxValuePicker
              v-model="item.badgeType"
              variant="dropdown"
              :items="[
                {
                  id: 'default',
                  name: 'default',
                },
                {
                  id: 'info',
                  name: 'info',
                },
                {
                  id: 'success',
                  name: 'success',
                },
                {
                  id: 'warning',
                  name: 'warning',
                },
                {
                  id: 'error',
                  name: 'error',
                },
              ]"
            />
          </LxRow>
          <LxRow label="badgeIcon" columnSpan="2">
            <LxAutoComplete v-model="item.badgeIcon" :items="availableIcons">
              <template #customItem="item">
                <div class="custom-auto-complete-item-with-icon lx-item-display">
                  <LxIcon :value="item.name" />
                  <p>{{ item.name }}</p>
                </div>
              </template>
            </LxAutoComplete>
          </LxRow>
          <LxRow label="badgeTitle" columnSpan="2">
            <LxTextInput v-model="item.badgeTitle" />
          </LxRow>
        </template>
      </LxAppendableList>
    </LxModal>
  </template>

  <template v-if="props.name === 'items'">
    <LxButton :label="texts.edit" icon="edit" kind="secondary" @click="editItems" />
    <LxModal
      ref="itemsModal"
      label="items"
      size="l"
      :actionDefinitions="[
        { id: 'save', name: texts.save, kind: 'primary' },
        { id: 'close', name: texts.close, kind: 'secondary' },
      ]"
      @actionClick="itemsActionClicked"
    >
      <LxAppendableList
        ref="itemsList"
        v-model="itemsModel"
        :columnCount="4"
        requiredMode="required-asterisk"
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
              <LxAutoComplete v-model="item.icon" :items="availableIcons">
                <template #customItem="item">
                  <div class="custom-auto-complete-item-with-icon lx-item-display">
                    <LxIcon :value="item.name" />
                    <p>{{ item.name }}</p>
                  </div>
                </template>
              </LxAutoComplete>
            </LxRow>
            <LxRow label="iconSet">
              <LxValuePicker
                v-model="item.iconSet"
                variant="dropdown"
                :items="[
                  {
                    id: 'cds',
                    name: 'cds',
                  },
                  {
                    id: 'material',
                    name: 'material',
                  },
                  {
                    id: 'brand',
                    name: 'brand',
                  },
                  {
                    id: 'additional',
                    name: 'additional',
                  },
                ]"
              />
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
</template>
