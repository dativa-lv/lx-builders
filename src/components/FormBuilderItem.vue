<script setup>
import { computed, ref } from 'vue';
import {
  LxRow,
  LxTextInput,
  LxTextArea,
  LxToggle,
  LxValuePicker,
  LxDateTimePicker,
  LxPlaceholder,
  LxAppendableList,
  LxDataBlock,
  LxForm,
  LxList,
  LxModal,
  LxButton,
  LxListItem,
  LxDataGrid,
  LxCamera,
  LxCheckbox,
  LxContentSwitcher,
  LxDataVisualizer,
  LxDropDownMenu,
  LxFileUploader,
  LxFileViewer,
  LxFlag,
  LxIcon,
  LxIllustration,
  LxLink,
  LxMap,
  LxMarkdownTextArea,
  LxNumberSlider,
  LxPersonDisplay,
  LxQr,
  LxQrScanner,
  LxRating,
  LxRichTextDisplay,
  LxStateDisplay,
  LxSteps,
  LxVisualPicker,
  LxDayInput,
  LxDrawPad,
  LxLogoDisplay,
  LxAutoComplete,
  LxDateTimeRange,
  lxDevUtils,
  LxStack,
} from '@dativa-lv/lx-ui';
import useLx from '@/hooks/useLx';
import { getOtherSelectComponent } from '@/components/formBuilderOtherSelect';
import LxFormBuilderListItem from '@/components/FormBuilderListItem.vue';
import LxAppendableListSimple from '@/components/AppendableListSimple.vue';
import { isDate } from '@/utils/builderUtils';

const props = defineProps({
  id: { type: String, default: null },
  displaySchema: { type: Object, default: null },
  schema: { type: Object, default: null },
  modelValue: { type: Object, default: null },
  row: { type: Object, default: null },
  name: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  vv: { type: Object, default: null },
  orderedObject: { type: Object, default: () => {} },
  parentName: { type: String, default: null },
  validations: { type: Object, default: null },
  texts: { type: Object, default: () => {} },
  builderOptions: {
    type: Object,
    default: () => ({
      schemaPath: null,
      componentStack: [],
      useRegistry: false,
    }),
  },
});

const emits = defineEmits(['update:modelValue', 'rowActionClick', 'emit', 'filterBuilderFilter']);

const model = computed({
  get() {
    if (!props.modelValue) return {};
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const modalRefs = ref({});
const arrayModelValue = ref({});

function examplesValue(row) {
  if (row?.lx?.placeholder) return row?.lx?.placeholder;
  if (Array.isArray(row?.examples)) return row?.examples[0];
  return row?.examples;
}

function isReadOnly(row) {
  if (row?.readOnly === null || row?.readOnly === undefined) return props.readOnly;
  return row?.readOnly;
}
function stringNumberMask(mask, type) {
  if (!mask && type === 'number') return 'decimal';
  if (!mask && type === 'string') return 'default';
  return mask;
}

function stringSelect(row) {
  if (
    (row?.type === 'string' &&
      row?.lx?.kind !== 'multiline' &&
      !row?.lx?.variant &&
      !isDate(row?.format) &&
      !row?.enum) ||
    (row?.type === 'number' && !row?.lx?.variant && !isDate(row?.format) && !row?.enum)
  )
    return 'textInputDefault';
  if (row?.type === 'string' && row?.lx?.kind === 'multiline') return 'textArea';
  if (row?.type === 'string' && isDate(row?.format)) return 'dateTimePicker';
  return '';
}

function arraySelect(row) {
  if (row?.type === 'array' && row?.lx?.displayType === 'list') return 'arrayList';
  if (row?.type === 'array' && row?.lx?.displayType === 'listModal') return 'arrayListModal';
  if (row?.type === 'array' && row?.lx?.displayType === 'table') return 'arrayTable';
  if (row?.type === 'array' && row?.lx?.displayType === 'tableModal') return 'arrayTableModal';
  if (Array.isArray(row?.lx?.items) || row?.enum) {
    return 'valuePicker';
  }
  if (row?.items?.properties && row?.type === 'array') return 'appendableList';
  if (row?.type === 'array' && row?.items?.type !== 'object' && row?.items)
    return 'smallAppendableList';
  return '';
}

function objectSelect(row, name) {
  if (row?.lx?.displayType === 'map' && row?.type === 'object') return 'map';
  if (
    row?.type === 'object' &&
    model.value?.[name] !== undefined &&
    model.value?.[name] !== null &&
    row?.lx?.displayType === 'modal'
  )
    return 'objectList';
  if (row?.type === 'object' && !model.value?.[name] && row?.lx?.displayType === 'modal')
    return 'objectButton';
  if (row?.type === 'object' && model.value?.[name] !== undefined && model.value?.[name] !== null)
    return 'dataBlock';
  return '';
}

function otherSelect(row) {
  return getOtherSelectComponent(row, { excludedDisplayTypes: ['stack'] });
}

function componentSelect(row, name, log = false) {
  if (row?.lx?.wrapper === 'placeholder') return 'lxPlaceholder';
  const res = otherSelect(row);
  if (res) return res;

  if (stringSelect(row) === 'textInputDefault') return 'textInputDefault';
  if (stringSelect(row) === 'textArea') return 'textArea';
  if (stringSelect(row) === 'dateTimePicker') return 'dateTimePicker';

  if (row?.type === 'integer') return 'textInputInteger';

  if (row?.type === 'boolean') return 'toggle';

  if ((row?.type === 'string' && (row?.lx?.variant || row?.enum)) || row?.type === 'array') {
    if (arraySelect(row) !== '') return arraySelect(row);
  }
  if (objectSelect(row, name) !== '') return objectSelect(row, name);

  if (name && log)
    lxDevUtils.log(
      `Property '${name}' couldn't be rendered`,
      useLx().getGlobals()?.environment,
      'warn'
    );
  return 'lxPlaceholder';
}

const selectedComponent = computed(() => componentSelect(props.row, props.name, true));

function rowActionClicked(action, value, schemaName, index) {
  emits(
    'rowActionClick',
    action,
    value,
    props.parentName ? `${props.parentName}.${schemaName}` : schemaName,
    index
  );
}

function componentEmit(emitName, key, value = undefined, additionalParams = undefined) {
  emits(
    'emit',
    emitName,
    props.parentName ? `${props.parentName}.${key}` : key,
    value,
    additionalParams
  );
}

function enumToObject(value) {
  const res = [];
  value?.enum?.forEach((x) => {
    const obj = { id: x, name: x };
    res.push(obj);
  });
  return res;
}

function deleteObject(name) {
  delete model.value[name];
}

function initializeObject(name) {
  const res = {};
  Object.entries(props.displaySchema?.properties[name])?.forEach(([key]) => {
    res[key] = '';
  });
  model.value[name] = res;
}

function openObjectModal(name, rawName) {
  if (!model.value[rawName]) {
    initializeObject(rawName);
  }
  modalRefs.value[name].open();
}

function appendableListRequiredRow(requiredValue, row) {
  const find = requiredValue?.find((x) => x === row);
  if (!find) return null;
  return true;
}
function deleteArrayObject(action, value, name, actionDefinitions = undefined) {
  if (actionDefinitions && actionDefinitions?.length > 0) {
    componentEmit(action, name);
  } else if (action === 'remove') {
    if (props.displaySchema?.properties[name]?.lx?.idAttribute) {
      const index = model.value[name].findIndex(
        (x) => x[props.displaySchema?.properties[name]?.lx?.idAttribute] === value
      );
      if (index !== -1) {
        model.value[name].splice(index, 1);
      }
    } else {
      const index = model.value[name].findIndex((x) => x?.id === value);
      if (index !== -1) {
        model.value[name].splice(index, 1);
      }
    }
  }
}

function saveNewElement(name) {
  if (!model.value[name]) model.value[name] = [];
  model.value[name].push(arrayModelValue.value[`${props.id}-${name}`]);
  modalRefs.value[`${props.id}-${name}`].close();
}

function listModalAction(action, value, name, actionDefinitions = undefined) {
  if (actionDefinitions && actionDefinitions?.length > 0) {
    componentEmit(action, name);
  }
  if (action === 'click') {
    let obj = {};
    if (props.displaySchema?.properties[name]?.lx?.idAttribute) {
      obj = model.value[name].find(
        (x) => x[props.displaySchema?.properties[name]?.lx?.idAttribute] === value
      );
    } else {
      obj = model.value[name].find((x) => x.id === value);
    }
    const res = `${props.id}-${name}`;
    arrayModelValue.value[res] = obj;
    modalRefs.value[res].open();
  } else if (action === 'remove') {
    deleteArrayObject(action, value, name);
  }
}

function getColumnDefinitions(def) {
  const res = [];
  if (def) {
    Object.entries(def)?.forEach(([key, value]) => {
      const obj = {};
      obj.id = key;
      obj.attributeName = key;
      obj.name = value?.title;
      obj.size = value?.size;
      obj.kind = value?.kind;
      if (value.type === 'string') obj.type = 'default';
      else if (value.type === 'integer') obj.type = 'number';
      else if (value.type === 'number') obj.type = 'decimal';
      else if (value.type === 'boolean') obj.type = 'bool';
      if (obj.type) res.push(obj);
    });
  }
  return res;
}

const newObject = ref(false);

function addArrayObject(name) {
  newObject.value = true;
  const temp = ref({});
  const res = `${props.id}-${name}`;
  arrayModelValue.value[res] = temp;
  modalRefs.value[res].open();
}

function dataGridActions(action, id, additionalParameter, name, actionDefinitions = undefined) {
  if (actionDefinitions && actionDefinitions?.length > 0) {
    componentEmit('actionClick', name, action, id);
  } else {
    if (action === 'open') {
      listModalAction('click', id, name);
    }
    if (action === 'remove') {
      deleteArrayObject(action, id, name);
    }
  }
}

const isInvalid = computed(() => {
  if (props.validations?.[props.name]) return true;
  if (!props.vv?.value?.modelClone) return false;
  if (props.parentName) {
    const parentKeys = props.parentName.split('.');
    let parentObj = props.vv.value.modelClone;
    parentObj = parentKeys.reduce((obj, key) => (obj ? obj[key] : undefined), parentObj);
    return parentObj?.[props.name]?.$error;
  }
  return props.vv.value.modelClone?.[props.name]?.$error;
});

const invalidMessage = computed(() => {
  if (props.validations?.[props.name]) return props.validations?.[props.name];
  let res = null;
  if (!props.vv?.value?.modelClone) return null;
  if (props.parentName) {
    const parentKeys = props.parentName.split('.');
    let parentObj = props.vv.value.modelClone;
    parentObj = parentKeys.reduce((obj, key) => (obj ? obj[key] : undefined), parentObj);
    return parentObj?.[props.name]?.$errors?.[0]?.$message;
  }
  res = props.vv.value.modelClone?.[props.name]?.$errors?.[0]?.$message;

  return res;
});

function getCustomVariant(row) {
  if (row?.lx?.hasCustomItems) {
    if (!row?.lx?.variant?.endsWith('-custom')) return `${row?.lx?.variant || 'default'}-custom`;
  }
  return row?.lx?.variant;
}

const getActions = computed(() => {
  const actions = [
    {
      id: 'saveElement',
      name: props.texts.saveElement,
      kind: 'primary',
    },
  ];
  return newObject.value ? actions : null;
});

function handleModalActionClick(action, name) {
  if (action === 'saveElement') {
    saveNewElement(name);
  }
}

const builderNameComputed = computed(() => {
  if (props.builderOptions?.schemaPath) return `${props.builderOptions?.schemaPath}.${props.name}`;
  return props.name;
});

const builderOptions = computed(() => ({
  componentStack: props.builderOptions?.componentStack,
  schemaPath: builderNameComputed.value,
  useRegistry: props.builderOptions?.useRegistry,
}));
</script>
<template>
  <!-- TODO: if type number / decimal / integer then conferToString - false -->
  <LxTextInput
    v-if="selectedComponent === 'textInputDefault'"
    :id="`${id}-${name}`"
    :mask="
      stringNumberMask(
        displaySchema?.properties[name]?.lx?.mask,
        displaySchema?.properties[name]?.type
      )
    "
    :maxlength="displaySchema?.properties[name]?.maxLength"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :scale="displaySchema?.properties[name]?.lx?.scale"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :uppercase="displaySchema?.properties[name]?.lx?.uppercase"
    :convert-to-string="displaySchema?.properties[name]?.lx?.convertToString"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :signed="displaySchema?.properties[name]?.lx?.signed"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :custom-mask-value="displaySchema?.properties[name]?.lx?.customMaskValue"
    :autocomplete="displaySchema?.properties[name]?.lx?.autocomplete"
    :options="displaySchema?.properties[name]?.lx?.options"
    :helperText="displaySchema?.properties[name]?.lx?.helperText"
    :helperTextKind="displaySchema?.properties[name]?.lx?.helperTextKind"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @keyup.enter="emits('filterBuilderFilter')"
  />
  <LxTextArea
    v-else-if="selectedComponent === 'textArea'"
    :id="`${id}-${name}`"
    :maxlength="displaySchema?.properties[name]?.maxLength"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :rows="displaySchema?.properties[name]?.lx?.rows"
    :dynamic-height="displaySchema?.properties[name]?.lx?.dynamicHeight"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :helperText="displaySchema?.properties[name]?.lx?.helperText"
    :helperTextKind="displaySchema?.properties[name]?.lx?.helperTextKind"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @keyup.enter="emits('filterBuilderFilter')"
  />
  <LxDateTimePicker
    v-else-if="selectedComponent === 'dateTimePicker'"
    :id="`${id}-${name}`"
    :kind="displaySchema?.properties[name]?.format"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :min-date="displaySchema?.properties[name]?.lx?.minDate"
    :max-date="displaySchema?.properties[name]?.lx?.maxDate"
    :required="displaySchema?.properties[name]?.lx?.required"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :time-adjust="displaySchema?.properties[name]?.lx?.timeAdjust"
    :clear-if-not-exact="displaySchema?.properties[name]?.lx?.clearIfNotExact"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    :locale="displaySchema?.properties[name]?.lx?.locale"
    :special-dates="displaySchema?.properties[name]?.lx?.specialDates"
    :dictionary="displaySchema?.properties[name]?.lx?.dictionary"
    :variant="displaySchema?.properties[name]?.lx?.variant"
    :cadenceOfMinutes="displaySchema?.properties[name]?.lx?.cadenceOfMinutes"
    :cadenceOfSeconds="displaySchema?.properties[name]?.lx?.cadenceOfSeconds"
    :helperText="displaySchema?.properties[name]?.lx?.helperText"
    :helperTextKind="displaySchema?.properties[name]?.lx?.helperTextKind"
    :readOnly="isReadOnly(row)"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :builderOptions="builderOptions"
    v-model="model[name]"
  />
  <LxTextInput
    v-else-if="selectedComponent === 'textInputInteger'"
    :id="`${id}-${name}`"
    mask="integer"
    :maxlength="displaySchema?.properties[name]?.maxLength"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :scale="displaySchema?.properties[name]?.lx?.scale"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :uppercase="displaySchema?.properties[name]?.lx?.uppercase"
    :convert-to-string="displaySchema?.properties[name]?.lx?.convertToString"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :helperText="displaySchema?.properties[name]?.lx?.helperText"
    :helperTextKind="displaySchema?.properties[name]?.lx?.helperTextKind"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @keyup.enter="emits('filterBuilderFilter')"
  />
  <LxToggle
    v-else-if="selectedComponent === 'toggle'"
    :id="`${id}-${name}`"
    :size="displaySchema?.properties[name]?.lx?.size"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    :builderOptions="builderOptions"
    v-model="model[name]"
  >
    <template #on>
      <span v-if="row?.lx?.labelOn">{{ row?.lx?.labelOn }}</span>
      <span v-else>Jā</span>
    </template>
    <template #off>
      <span v-if="row?.lx?.labelOff">{{ row?.lx?.labelOff }}</span>
      <span v-else>Nē</span>
    </template>
    <template #indeterminate>
      <span v-if="row?.lx?.labelIndeterminate">{{ row?.lx?.labelIndeterminate }}</span>
      <span v-else-if="isReadOnly(displaySchema?.properties[name])">
        <p class="lx-data">—</p>
      </span>
      <span v-else>—</span>
    </template>
  </LxToggle>
  <LxValuePicker
    v-else-if="selectedComponent === 'valuePicker'"
    :id="`${id}-${name}`"
    :selectionKind="displaySchema?.properties[name]?.type === 'array' ? 'multiple' : 'single'"
    :items="
      displaySchema?.properties[name]?.lx?.items || enumToObject(displaySchema?.properties[name])
    "
    :id-attribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :name-attribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :icon-attribute="displaySchema?.properties[name]?.lx?.iconAttribute"
    :icon-set-attribute="displaySchema?.properties[name]?.lx?.iconSetAttribute"
    :category-attribute="displaySchema?.properties[name]?.lx?.categoryAttribute"
    :description-attribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
    :variant="getCustomVariant(displaySchema?.properties[name])"
    :has-search="displaySchema?.properties[name]?.lx?.hasSearch"
    :always-as-array="displaySchema?.properties[name]?.lx?.alwaysAsArray"
    :nullable="displaySchema?.properties[name]?.lx?.nullable"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :search-attributes="displaySchema?.properties[name]?.lx?.searchAttributes"
    :has-select-all="displaySchema?.properties[name]?.lx?.hasSelectAll"
    :read-only-render-type="displaySchema?.properties[name]?.lx?.readOnlyRenderType"
    :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :builderOptions="builderOptions"
    v-model="model[name]"
  >
    <template
      #customItem="item"
      v-if="displaySchema?.properties[name]?.lx?.hasCustomItems === 'default'"
    >
      <LxStack
        :orientation="displaySchema?.properties[name]?.lx?.stack?.orientation"
        :kind="displaySchema?.properties[name]?.lx?.stack?.kind"
        :mode="displaySchema?.properties[name]?.lx?.stack?.mode || 'grid'"
        :horizontal-alignment="displaySchema?.properties[name]?.lx?.stack?.horizontalAlignment"
        :vertical-alignment="displaySchema?.properties[name]?.lx?.stack?.verticalAlignment"
        :horizontal-config="displaySchema?.properties[name]?.lx?.stack?.horizontalConfig"
        :vertical-config="displaySchema?.properties[name]?.lx?.stack?.verticalConfig"
      >
        <template
          v-for="(itemValue, itemName) in displaySchema?.properties[name]?.lx?.customItems
            ?.properties"
          :key="itemName"
        >
          <LxFormBuilderListItem
            :itemValue="itemValue"
            :itemName="itemName"
            :item="item"
            :useStyles="true"
          />
        </template>
      </LxStack>
    </template>
    <template
      #customItem="item"
      v-else-if="displaySchema?.properties[name]?.lx?.hasCustomItems === 'nested'"
    >
      <template
        v-for="(itemValue, itemName) in displaySchema?.properties[name]?.lx?.customItems
          ?.properties"
        :key="itemName"
      >
        <LxStack
          v-if="itemValue?.lx?.displayType === 'stack'"
          :orientation="itemValue?.lx?.orientation"
          :kind="itemValue?.lx?.kind"
          :mode="itemValue?.lx?.mode"
          :horizontal-alignment="itemValue?.lx?.horizontalAlignment"
          :vertical-alignment="itemValue?.lx?.verticalAlignment"
          :horizontal-config="itemValue?.lx?.horizontalConfig"
          :vertical-config="itemValue?.lx?.verticalConfig"
        >
          <template
            v-for="(nestedItemValue, nestedItemName) in itemValue?.properties"
            :key="nestedItemName"
          >
            <LxStack
              v-if="nestedItemValue?.lx?.displayType === 'stack'"
              :orientation="nestedItemValue?.lx?.orientation"
              :kind="nestedItemValue?.lx?.kind"
              :mode="nestedItemValue?.lx?.mode"
              :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
              :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
              :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
              :vertical-config="nestedItemValue?.lx?.verticalConfig"
            >
              <template
                v-for="(innerNestedItemValue, innerNestedItemName) in nestedItemValue?.properties"
                :key="innerNestedItemName"
              >
                <LxFormBuilderListItem
                  :itemValue="innerNestedItemValue"
                  :itemName="innerNestedItemName"
                  :item="item?.[itemName]?.[nestedItemName]"
                />
              </template>
            </LxStack>
            <LxFormBuilderListItem
              v-else
              :itemValue="nestedItemValue"
              :itemName="nestedItemName"
              :item="item?.[itemName]"
            />
          </template>
        </LxStack>
        <LxFormBuilderListItem :itemValue="itemValue" :itemName="itemName" :item="item" v-else />
      </template>
    </template>
  </LxValuePicker>
  <LxDataBlock
    v-else-if="selectedComponent === 'dataBlock'"
    :expandable="true"
    :size="displaySchema?.properties[name]?.lx?.size"
    :icon="displaySchema?.properties[name]?.lx?.icon"
    :icon-set="displaySchema?.properties[name]?.lx?.iconSet"
    :name="
      model?.[name]?.[displaySchema?.properties?.[name]?.lx?.nameAttribute] || model?.[name]?.name
    "
    :description="
      model?.[name]?.[displaySchema?.properties?.[name]?.lx?.descriptionAttribute] ||
      model?.[name]?.description
    "
    :uppercase="displaySchema?.properties[name]?.lx?.uppercase"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :busy="displaySchema?.properties[name]?.lx?.busy"
    :actionDefinitions="displaySchema?.properties[name]?.lx?.actionDefinitions"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    class="form-builder-data-block"
    @actionClick="(a, b) => componentEmit('actionClick', name, a, b)"
  >
    <LxForm
      :showHeader="false"
      :showFooter="false"
      :column-count="displaySchema?.properties[name]?.lx?.formColumnCount"
      kind="stripped"
    >
      <template
        v-for="(item, itemName) in displaySchema?.properties[name]?.properties"
        :key="itemName"
      >
        <LxPlaceholder v-if="componentSelect(item, itemName) === 'lxPlaceholder'" />
        <LxRow
          v-else
          :label="item?.title || itemName"
          :rowSpan="item?.lx?.rowSpan"
          :columnSpan="item?.lx?.columnSpan"
          :action-definitions="item?.lx?.actionDefinitions"
          @actionClick="(a, b, c) => rowActionClicked(b, c, `${name}.${itemName}`, undefined)"
        >
          <LxTextInput
            v-if="componentSelect(item, itemName) === 'textInputDefault'"
            :mask="stringNumberMask(item?.lx?.mask, item?.type)"
            :maxlength="item?.maxLength"
            :kind="item?.lx?.kind"
            :tooltip="item?.lx?.tooltip"
            :scale="item?.lx?.scale"
            :disabled="item?.lx?.disabled"
            :uppercase="item?.lx?.uppercase"
            :convert-to-string="item?.lx?.convertToString"
            :placeholder="examplesValue(item)"
            :signed="item?.lx?.signed"
            :readOnly="isReadOnly(item)"
            :custom-mask-value="item?.lx?.customMaskValue"
            :autocomplete="item?.lx?.autocomplete"
            :options="item?.lx?.options"
            :helperText="item?.lx?.helperText"
            :helperTextKind="item?.lx?.helperTextKind"
            :texts="item?.lx?.texts"
            v-model="model[name][itemName]"
          />
          <LxTextArea
            v-if="componentSelect(item, itemName) === 'textArea'"
            :maxlength="item?.maxLength"
            :placeholder="examplesValue(item)"
            :rows="item?.lx?.rows"
            :dynamic-height="item?.lx?.dynamicHeight"
            :disabled="item?.lx?.disabled"
            :tooltip="item?.lx?.tooltip"
            :readOnly="isReadOnly(item)"
            :helperText="item?.lx?.helperText"
            :helperTextKind="item?.lx?.helperTextKind"
            :texts="item?.lx?.texts"
            v-model="model[name][itemName]"
          />
          <LxTextInput
            v-else-if="componentSelect(item, itemName) === 'textInputInteger'"
            mask="integer"
            :maxlength="item?.maxLength"
            :kind="item?.lx?.kind"
            :tooltip="item?.lx?.tooltip"
            :scale="item?.lx?.scale"
            :disabled="item?.lx?.disabled"
            :uppercase="item?.lx?.uppercase"
            :convert-to-string="item?.lx?.convertToString"
            :placeholder="examplesValue(item)"
            :signed="item?.lx?.signed"
            :readOnly="isReadOnly(item)"
            :helperText="item?.lx?.helperText"
            :helperTextKind="item?.lx?.helperTextKind"
            :texts="item?.lx?.texts"
            v-model="model[name][itemName]"
          />
          <LxToggle
            v-else-if="componentSelect(item, itemName) === 'toggle'"
            :size="item?.lx?.size"
            :disabled="item?.lx?.disabled"
            :tooltip="item?.lx?.tooltip"
            :readOnly="isReadOnly(item)"
            :texts="item?.lx?.texts"
            v-model="model[name][itemName]"
          />
          <LxDateTimePicker
            v-else-if="componentSelect(item, itemName) === 'dateTimePicker'"
            :kind="item?.format"
            :placeholder="examplesValue(item)"
            :tooltip="item?.lx?.tooltip"
            :min-date="item?.lx?.minDate"
            :max-date="item?.lx?.maxDate"
            :required="item?.lx?.required"
            :disabled="item?.lx?.disabled"
            :time-adjust="item?.lx?.timeAdjust"
            :clear-if-not-exact="item?.lx?.clearIfNotExact"
            :locale="item?.lx?.locale"
            :special-dates="item?.lx?.specialDates"
            :dictionary="item?.lx?.dictionary"
            :variant="item?.lx?.variant"
            :cadenceOfMinutes="item?.lx?.cadenceOfMinutes"
            :cadenceOfSeconds="item?.lx?.cadenceOfSeconds"
            :helperText="item?.lx?.helperText"
            :helperTextKind="item?.lx?.helperTextKind"
            :texts="item?.lx?.texts"
            :readOnly="isReadOnly(item)"
            v-model="model[name][itemName]"
          />
          <LxValuePicker
            v-else-if="componentSelect(item, itemName) === 'valuePicker'"
            :selectionKind="item?.type === 'array' ? 'multiple' : 'single'"
            :items="item?.lx?.items || enumToObject(item)"
            :id-attribute="item?.lx?.idAttribute"
            :name-attribute="item?.lx?.nameAttribute"
            :icon-attribute="item?.lx?.iconAttribute"
            :icon-set-attribute="item?.lx?.iconSetAttribute"
            :category-attribute="item?.lx?.categoryAttribute"
            :description-attribute="item?.lx?.descriptionAttribute"
            :variant="getCustomVariant(item)"
            :has-search="item?.lx?.hasSearch"
            :always-as-array="item?.lx?.alwaysAsArray"
            :nullable="item?.lx?.nullable"
            :tooltip="item?.lx?.tooltip"
            :texts="item?.lx?.texts"
            :placeholder="examplesValue(item)"
            :disabled="item?.lx?.disabled"
            :search-attributes="item?.lx?.searchAttributes"
            :has-select-all="item?.lx?.hasSelectAll"
            :read-only-render-type="item?.lx?.readOnlyRenderType"
            :stickyToolbar="item?.lx?.stickyToolbar"
            :readOnly="isReadOnly(item)"
            v-model="model[name][itemName]"
          >
            <template #customItem="customItem" v-if="item?.lx?.hasCustomItems === 'default'">
              <LxStack
                :orientation="item?.lx?.stack?.orientation"
                :kind="item?.lx?.stack?.kind"
                :mode="item?.lx?.stack?.mode || 'grid'"
                :horizontal-alignment="item?.lx?.stack?.horizontalAlignment"
                :vertical-alignment="item?.lx?.stack?.verticalAlignment"
                :horizontal-config="item?.lx?.stack?.horizontalConfig"
                :vertical-config="item?.lx?.stack?.verticalConfig"
              >
                <template
                  v-for="(stackItemValue, stackItemName) in item?.lx?.customItems?.properties"
                  :key="stackItemName"
                >
                  <LxFormBuilderListItem
                    :itemValue="stackItemValue"
                    :itemName="stackItemName"
                    :item="customItem"
                    :useStyles="true"
                  />
                </template>
              </LxStack>
            </template>
            <template #customItem="customItem" v-else-if="item?.lx?.hasCustomItems === 'nested'">
              <template
                v-for="(stackItemValue, stackItemName) in item?.lx?.customItems?.properties"
                :key="stackItemName"
              >
                <LxStack
                  v-if="stackItemValue?.lx?.displayType === 'stack'"
                  :orientation="stackItemValue?.lx?.orientation"
                  :kind="stackItemValue?.lx?.kind"
                  :mode="stackItemValue?.lx?.mode"
                  :horizontal-alignment="stackItemValue?.lx?.horizontalAlignment"
                  :vertical-alignment="stackItemValue?.lx?.verticalAlignment"
                  :horizontal-config="stackItemValue?.lx?.horizontalConfig"
                  :vertical-config="stackItemValue?.lx?.verticalConfig"
                >
                  <template
                    v-for="(nestedItemValue, nestedItemName) in stackItemValue?.properties"
                    :key="nestedItemName"
                  >
                    <LxStack
                      v-if="nestedItemValue?.lx?.displayType === 'stack'"
                      :orientation="nestedItemValue?.lx?.orientation"
                      :kind="nestedItemValue?.lx?.kind"
                      :mode="nestedItemValue?.lx?.mode"
                      :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
                      :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
                      :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
                      :vertical-config="nestedItemValue?.lx?.verticalConfig"
                    >
                      <template
                        v-for="(
                          innerNestedItemValue, innerNestedItemName
                        ) in nestedItemValue?.properties"
                        :key="innerNestedItemName"
                      >
                        <LxFormBuilderListItem
                          :itemValue="innerNestedItemValue"
                          :itemName="innerNestedItemName"
                          :item="customItem?.[itemName]?.[nestedItemName]"
                        />
                      </template>
                    </LxStack>
                    <LxFormBuilderListItem
                      v-else
                      :itemValue="nestedItemValue"
                      :itemName="nestedItemName"
                      :item="customItem?.[itemName]"
                    />
                  </template>
                </LxStack>
                <LxFormBuilderListItem
                  :itemValue="stackItemValue"
                  :itemName="stackItemName"
                  :item="customItem"
                  v-else
                />
              </template>
            </template>
          </LxValuePicker>
        </LxRow>
      </template>
    </LxForm>
  </LxDataBlock>
  <div v-else-if="selectedComponent === 'objectButton' || selectedComponent === 'objectList'">
    <LxListItem
      v-if="selectedComponent === 'objectList'"
      :value="model[name]"
      :label="model[name][displaySchema?.properties[name].lx.nameAttribute] || model[name]?.name"
      :description="
        model[name][displaySchema?.properties[name].lx.descriptionAttribute] ||
        model[name]?.description
      "
      icon="edit"
      :clickable="true"
      :actionDefinitions="[
        { id: 'remove', name: 'remove', icon: 'remove-item', destructive: true },
      ]"
      @action-click="deleteObject(name)"
      @click="openObjectModal(`${id}-${name}`, name)"
    />

    <LxButton
      v-if="selectedComponent === 'objectButton'"
      :label="texts?.addObject"
      icon="add-item"
      kind="ghost"
      @click="openObjectModal(`${id}-${name}`, name)"
    />
    <LxModal :id="`${id}-${name}`" :ref="(el) => (modalRefs[`${id}-${name}`] = el)">
      <LxForm
        :showHeader="false"
        :showFooter="false"
        :column-count="displaySchema?.properties[name]?.lx?.formColumnCount"
        kind="stripped"
      >
        <template
          v-for="(item, itemName) in displaySchema?.properties[name]?.properties"
          :key="itemName"
        >
          <LxPlaceholder v-if="componentSelect(item, itemName) === 'lxPlaceholder'" />
          <LxRow
            v-else
            :label="item?.title ? item?.title : itemName"
            :rowSpan="item?.lx?.rowSpan"
            :columnSpan="item?.lx?.columnSpan"
            :actionDefinitions="item?.lx?.actionDefinitions"
            @actionClick="(a, b, c) => rowActionClicked(b, c, `${name}.${itemName}`, undefined)"
          >
            <LxTextInput
              v-if="componentSelect(item, itemName) === 'textInputDefault'"
              :mask="stringNumberMask(item?.lx?.mask, item?.type)"
              :maxlength="item?.maxLength"
              :kind="item?.lx?.kind"
              :tooltip="item?.lx?.tooltip"
              :scale="item?.lx?.scale"
              :disabled="item?.lx?.disabled"
              :uppercase="item?.lx?.uppercase"
              :convert-to-string="item?.lx?.convertToString"
              :placeholder="examplesValue(item)"
              :signed="item?.lx?.signed"
              :readOnly="isReadOnly(item)"
              :custom-mask-value="item?.lx?.customMaskValue"
              :autocomplete="item?.lx?.autocomplete"
              :options="item?.lx?.options"
              :helperText="item?.lx?.helperText"
              :helperTextKind="item?.lx?.helperTextKind"
              v-model="model[name][itemName]"
            />
            <LxTextArea
              v-if="componentSelect(item, itemName) === 'textArea'"
              :maxlength="item?.maxLength"
              :placeholder="examplesValue(item)"
              :rows="item?.lx?.rows"
              :dynamic-height="item?.lx?.dynamicHeight"
              :disabled="item?.lx?.disabled"
              :tooltip="item?.lx?.tooltip"
              :helperText="item?.lx?.helperText"
              :helperTextKind="item?.lx?.helperTextKind"
              :texts="item?.lx?.texts"
              :readOnly="isReadOnly(item)"
              v-model="model[name][itemName]"
            />
            <LxTextInput
              v-else-if="componentSelect(item, itemName) === 'textInputInteger'"
              mask="integer"
              :maxlength="item?.maxLength"
              :kind="item?.lx?.kind"
              :tooltip="item?.lx?.tooltip"
              :scale="item?.lx?.scale"
              :disabled="item?.lx?.disabled"
              :uppercase="item?.lx?.uppercase"
              :convert-to-string="item?.lx?.convertToString"
              :placeholder="examplesValue(item)"
              :signed="item?.lx?.signed"
              :readOnly="isReadOnly(item)"
              :helperText="item?.lx?.helperText"
              :helperTextKind="item?.lx?.helperTextKind"
              v-model="model[name][itemName]"
            />
            <LxToggle
              v-else-if="componentSelect(item, itemName) === 'toggle'"
              :size="item?.lx?.size"
              :disabled="item?.lx?.disabled"
              :tooltip="item?.lx?.tooltip"
              :readOnly="isReadOnly(item)"
              v-model="model[name][itemName]"
            />
            <LxDateTimePicker
              v-else-if="componentSelect(item, itemName) === 'dateTimePicker'"
              :kind="item?.format"
              :placeholder="examplesValue(item)"
              :tooltip="item?.lx?.tooltip"
              :min-date="item?.lx?.minDate"
              :max-date="item?.lx?.maxDate"
              :required="item?.lx?.required"
              :disabled="item?.lx?.disabled"
              :time-adjust="item?.lx?.timeAdjust"
              :clear-if-not-exact="item?.lx?.clearIfNotExact"
              :locale="item?.lx?.locale"
              :special-dates="item?.lx?.specialDates"
              :dictionary="item?.lx?.dictionary"
              :variant="item?.lx?.variant"
              :cadenceOfMinutes="item?.lx?.cadenceOfMinutes"
              :cadenceOfSeconds="item?.lx?.cadenceOfSeconds"
              :helperText="item?.lx?.helperText"
              :helperTextKind="item?.lx?.helperTextKind"
              :texts="item?.lx?.texts"
              :readOnly="isReadOnly(item)"
              v-model="model[name][itemName]"
            />
            <LxValuePicker
              v-else-if="componentSelect(item, itemName) === 'valuePicker'"
              :selectionKind="item?.type === 'array' ? 'multiple' : 'single'"
              :items="item?.lx?.items || enumToObject(item)"
              :id-attribute="item?.lx?.idAttribute"
              :name-attribute="item?.lx?.nameAttribute"
              :icon-attribute="item?.lx?.iconAttribute"
              :icon-set-attribute="item?.lx?.iconSetAttribute"
              :category-attribute="item?.lx?.categoryAttribute"
              :description-attribute="item?.lx?.descriptionAttribute"
              :variant="getCustomVariant(item)"
              :has-search="item?.lx?.hasSearch"
              :always-as-array="item?.lx?.alwaysAsArray"
              :nullable="item?.lx?.nullable"
              :tooltip="item?.lx?.tooltip"
              :texts="item?.lx?.texts"
              :placeholder="examplesValue(item)"
              :disabled="item?.lx?.disabled"
              :readOnly="isReadOnly(item)"
              :search-attributes="item?.lx?.searchAttributes"
              :has-select-all="item?.lx?.hasSelectAll"
              :read-only-render-type="item?.lx?.readOnlyRenderType"
              :stickyToolbar="item?.lx?.stickyToolbar"
              v-model="model[name][itemName]"
            >
              <template #customItem="customItem" v-if="item?.lx?.hasCustomItems === 'default'">
                <LxStack
                  :orientation="item?.lx?.stack?.orientation"
                  :kind="item?.lx?.stack?.kind"
                  :mode="item?.lx?.stack?.mode || 'grid'"
                  :horizontal-alignment="item?.lx?.stack?.horizontalAlignment"
                  :vertical-alignment="item?.lx?.stack?.verticalAlignment"
                  :horizontal-config="item?.lx?.stack?.horizontalConfig"
                  :vertical-config="item?.lx?.stack?.verticalConfig"
                >
                  <template
                    v-for="(stackItemValue, stackItemName) in item?.lx?.customItems?.properties"
                    :key="stackItemName"
                  >
                    <LxFormBuilderListItem
                      :itemValue="stackItemValue"
                      :itemName="stackItemName"
                      :item="customItem"
                      :useStyles="true"
                    />
                  </template>
                </LxStack>
              </template>
              <template #customItem="customItem" v-else-if="item?.lx?.hasCustomItems === 'nested'">
                <template
                  v-for="(stackItemValue, stackItemName) in item?.lx?.customItems?.properties"
                  :key="stackItemName"
                >
                  <LxStack
                    v-if="stackItemValue?.lx?.displayType === 'stack'"
                    :orientation="stackItemValue?.lx?.orientation"
                    :kind="stackItemValue?.lx?.kind"
                    :mode="stackItemValue?.lx?.mode"
                    :horizontal-alignment="stackItemValue?.lx?.horizontalAlignment"
                    :vertical-alignment="stackItemValue?.lx?.verticalAlignment"
                    :horizontal-config="stackItemValue?.lx?.horizontalConfig"
                    :vertical-config="stackItemValue?.lx?.verticalConfig"
                  >
                    <template
                      v-for="(nestedItemValue, nestedItemName) in stackItemValue?.properties"
                      :key="nestedItemName"
                    >
                      <LxStack
                        v-if="nestedItemValue?.lx?.displayType === 'stack'"
                        :orientation="nestedItemValue?.lx?.orientation"
                        :kind="nestedItemValue?.lx?.kind"
                        :mode="nestedItemValue?.lx?.mode"
                        :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
                        :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
                        :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
                        :vertical-config="nestedItemValue?.lx?.verticalConfig"
                      >
                        <template
                          v-for="(
                            innerNestedItemValue, innerNestedItemName
                          ) in nestedItemValue?.properties"
                          :key="innerNestedItemName"
                        >
                          <LxFormBuilderListItem
                            :itemValue="innerNestedItemValue"
                            :itemName="innerNestedItemName"
                            :item="customItem?.[itemName]?.[nestedItemName]"
                          />
                        </template>
                      </LxStack>
                      <LxFormBuilderListItem
                        v-else
                        :itemValue="nestedItemValue"
                        :itemName="nestedItemName"
                        :item="customItem?.[itemName]"
                      />
                    </template>
                  </LxStack>
                  <LxFormBuilderListItem
                    :itemValue="stackItemValue"
                    :itemName="stackItemName"
                    :item="customItem"
                    v-else
                  />
                </template>
              </template>
            </LxValuePicker>
          </LxRow>
        </template>
      </LxForm>
    </LxModal>
  </div>
  <LxList
    v-else-if="selectedComponent === 'arrayList'"
    :items="model[name]"
    :actionDefinitions="
      displaySchema?.properties[name]?.lx?.actionDefinitions || [
        { id: 'remove', title: texts?.deleteElement, icon: 'remove-item', destructive: true },
      ]
    "
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :descriptionAttribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
    :hrefAttribute="displaySchema?.properties[name]?.lx?.hrefAttribute"
    :groupAttribute="displaySchema?.properties[name]?.lx?.groupAttribute"
    :clickableAttribute="displaySchema?.properties[name]?.lx?.clickableAttribute"
    :iconAttribute="displaySchema?.properties[name]?.lx?.iconAttribute"
    :iconSetAttribute="displaySchema?.properties[name]?.lx?.iconSetAttribute"
    :tooltipAttribute="displaySchema?.properties[name]?.lx?.tooltipAttribute"
    :categoryAttribute="displaySchema?.properties[name]?.lx?.categoryAttribute"
    :orderAttribute="displaySchema?.properties[name]?.lx?.orderAttribute"
    :hasSearch="displaySchema?.properties[name]?.lx?.hasSearch"
    :groupDefinitions="displaySchema?.properties[name]?.lx?.groupDefinitions"
    :icon="displaySchema?.properties[name]?.lx?.icon"
    :iconSet="displaySchema?.properties[name]?.lx?.iconSet"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :emptyStateIcon="displaySchema?.properties[name]?.lx?.emptyStateIcon"
    :listType="displaySchema?.properties[name]?.lx?.listType || '1'"
    :searchString="displaySchema?.properties[name]?.lx?.searchString"
    :searchSide="displaySchema?.properties[name]?.lx?.searchSide"
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :busy="displaySchema?.properties[name]?.lx?.busy"
    :hideFilteredItems="displaySchema?.properties[name]?.lx?.hideFilteredItems"
    :includeUnspecifiedGroups="displaySchema?.properties[name]?.lx?.includeUnspecifiedGroups"
    :toolbarActionDefinitions="displaySchema?.properties[name]?.lx?.toolbarActionDefinitions"
    :actionsLayout="displaySchema?.properties[name]?.lx?.actionsLayout"
    :emptyStateActionDefinitions="displaySchema?.properties[name]?.lx?.emptyStateActionDefinitions"
    :showLoadMore="displaySchema?.properties[name]?.lx?.showLoadMore"
    :hasSelecting="displaySchema?.properties[name]?.lx?.hasSelecting"
    :selectionKind="displaySchema?.properties[name]?.lx?.selectionKind"
    :selectionActionDefinitions="displaySchema?.properties[name]?.lx?.selectionActionDefinitions"
    :itemStates="displaySchema?.properties[name]?.lx?.itemStates"
    :mode="displaySchema?.properties[name]?.lx?.mode"
    :searchMode="displaySchema?.properties[name]?.lx?.searchMode"
    :hasSkipLink="displaySchema?.properties[name]?.lx?.hasSkipLink"
    :hasVirtualization="displaySchema?.properties[name]?.lx?.hasVirtualization"
    :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    @actionClick="
      (val, item) =>
        deleteArrayObject(val, item, name, displaySchema?.properties[name]?.lx?.actionDefinitions)
    "
    @toolbarActionClick="(a, b) => componentEmit('toolbarActionClick', name, a, b)"
    @emptyStateActionClick="(a, b) => componentEmit('emptyStateActionClick', name, a, b)"
    @selectionChange="(selection) => componentEmit('selectionChange', name, selection)"
    @selectionActionClick="(a, b) => componentEmit('selectionActionClick', name, a, b)"
    @loadMore="() => componentEmit('loadMore', name)"
    @update:searchString="(a) => componentEmit('update:searchString', name, a)"
    @update:itemStates="(a) => componentEmit('update:itemStates', name, a)"
    @search="(a) => componentEmit('search', name, a)"
  >
    <template
      #customItem="item"
      v-if="displaySchema?.properties[name]?.lx?.hasCustomItems === 'default'"
    >
      <LxStack
        :orientation="displaySchema?.properties[name]?.lx?.stack?.orientation"
        :kind="displaySchema?.properties[name]?.lx?.stack?.kind"
        :mode="displaySchema?.properties[name]?.lx?.stack?.mode || 'grid'"
        :horizontal-alignment="displaySchema?.properties[name]?.lx?.stack?.horizontalAlignment"
        :vertical-alignment="displaySchema?.properties[name]?.lx?.stack?.verticalAlignment"
        :horizontal-config="displaySchema?.properties[name]?.lx?.stack?.horizontalConfig"
        :vertical-config="displaySchema?.properties[name]?.lx?.stack?.verticalConfig"
      >
        <template
          v-for="(itemValue, itemName) in displaySchema?.properties[name]?.items?.properties"
          :key="itemName"
        >
          <LxFormBuilderListItem
            :itemValue="itemValue"
            :itemName="itemName"
            :item="item"
            :useStyles="true"
          />
        </template>
      </LxStack>
    </template>
    <template
      #customItem="item"
      v-else-if="displaySchema?.properties[name]?.lx?.hasCustomItems === 'nested'"
    >
      <template
        v-for="(itemValue, itemName) in displaySchema?.properties[name]?.items?.properties"
        :key="itemName"
      >
        <LxStack
          v-if="itemValue?.lx?.displayType === 'stack'"
          :orientation="itemValue?.lx?.orientation"
          :kind="itemValue?.lx?.kind"
          :mode="itemValue?.lx?.mode"
          :horizontal-alignment="itemValue?.lx?.horizontalAlignment"
          :vertical-alignment="itemValue?.lx?.verticalAlignment"
          :horizontal-config="itemValue?.lx?.horizontalConfig"
          :vertical-config="itemValue?.lx?.verticalConfig"
        >
          <template
            v-for="(nestedItemValue, nestedItemName) in itemValue?.properties"
            :key="nestedItemName"
          >
            <LxStack
              v-if="nestedItemValue?.lx?.displayType === 'stack'"
              :orientation="nestedItemValue?.lx?.orientation"
              :kind="nestedItemValue?.lx?.kind"
              :mode="nestedItemValue?.lx?.mode"
              :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
              :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
              :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
              :vertical-config="nestedItemValue?.lx?.verticalConfig"
            >
              <template
                v-for="(innerNestedItemValue, innerNestedItemName) in nestedItemValue?.properties"
                :key="innerNestedItemName"
              >
                <LxFormBuilderListItem
                  :itemValue="innerNestedItemValue"
                  :itemName="innerNestedItemName"
                  :item="item?.[itemName]?.[nestedItemName]"
                />
              </template>
            </LxStack>
            <LxFormBuilderListItem
              v-else
              :itemValue="nestedItemValue"
              :itemName="nestedItemName"
              :item="item?.[itemName]"
            />
          </template>
        </LxStack>
        <LxFormBuilderListItem :itemValue="itemValue" :itemName="itemName" :item="item" v-else />
      </template>
    </template>
  </LxList>
  <div v-else-if="selectedComponent === 'arrayListModal'">
    <LxList
      :items="model[name]"
      :actionDefinitions="
        displaySchema?.properties[name]?.lx?.actionDefinitions || [
          { id: 'remove', title: texts?.deleteElement, icon: 'remove-item', destructive: true },
        ]
      "
      :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
      :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
      :descriptionAttribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
      :hrefAttribute="displaySchema?.properties[name]?.lx?.hrefAttribute"
      :groupAttribute="displaySchema?.properties[name]?.lx?.groupAttribute"
      :clickableAttribute="displaySchema?.properties[name]?.lx?.nameAttribute || 'name'"
      :iconAttribute="displaySchema?.properties[name]?.lx?.iconAttribute"
      :iconSetAttribute="displaySchema?.properties[name]?.lx?.iconSetAttribute"
      :tooltipAttribute="displaySchema?.properties[name]?.lx?.tooltipAttribute"
      :categoryAttribute="displaySchema?.properties[name]?.lx?.categoryAttribute"
      :orderAttribute="displaySchema?.properties[name]?.lx?.orderAttribute"
      :hasSearch="displaySchema?.properties[name]?.lx?.hasSearch"
      :groupDefinitions="displaySchema?.properties[name]?.lx?.groupDefinitions"
      :icon="displaySchema?.properties[name]?.lx?.icon"
      :iconSet="displaySchema?.properties[name]?.lx?.iconSet"
      :kind="displaySchema?.properties[name]?.lx?.kind"
      :emptyStateIcon="displaySchema?.properties[name]?.lx?.emptyStateIcon"
      :listType="displaySchema?.properties[name]?.lx?.listType || '1'"
      :searchString="displaySchema?.properties[name]?.lx?.searchString"
      :searchSide="displaySchema?.properties[name]?.lx?.searchSide"
      :loading="displaySchema?.properties[name]?.lx?.loading"
      :busy="displaySchema?.properties[name]?.lx?.busy"
      :hideFilteredItems="displaySchema?.properties[name]?.lx?.hideFilteredItems"
      :includeUnspecifiedGroup="displaySchema?.properties[name]?.lx?.includeUnspecifiedGroup"
      :toolbarActionDefinitions="displaySchema?.properties[name]?.lx?.toolbarActionDefinitions"
      :actionsLayout="displaySchema?.properties[name]?.lx?.actionsLayout"
      :emptyStateActionDefinitions="
        displaySchema?.properties[name]?.lx?.emptyStateActionDefinitions
      "
      :showLoadMore="displaySchema?.properties[name]?.lx?.showLoadMore"
      :hasSelecting="displaySchema?.properties[name]?.lx?.hasSelecting"
      :selectionKind="displaySchema?.properties[name]?.lx?.selectionKind"
      :selectionActionDefinitions="displaySchema?.properties[name]?.lx?.selectionActionDefinitions"
      :itemStates="displaySchema?.properties[name]?.lx?.itemStates"
      :mode="displaySchema?.properties[name]?.lx?.mode"
      :searchMode="displaySchema?.properties[name]?.lx?.searchMode"
      :hasSkipLink="displaySchema?.properties[name]?.lx?.hasSkipLink"
      :hasVirtualization="displaySchema?.properties[name]?.lx?.hasVirtualization"
      :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
      :texts="displaySchema?.properties[name]?.lx?.texts"
      @actionClick="
        (val, item) =>
          listModalAction(val, item, name, displaySchema?.properties[name]?.lx?.actionDefinitions)
      "
      @toolbarActionClick="(a, b) => componentEmit('toolbarActionClick', name, a, b)"
      @emptyStateActionClick="(a, b) => componentEmit('emptyStateActionClick', name, a, b)"
      @selectionChange="(selection) => componentEmit('selectionChange', name, selection)"
      @selectionActionClick="(a, b) => componentEmit('selectionActionClick', name, a, b)"
      @loadMore="() => componentEmit('loadMore', name)"
      @update:searchString="(a) => componentEmit('update:searchString', name, a)"
      @update:itemStates="(a) => componentEmit('update:itemStates', name, a)"
      @search="(a) => componentEmit('search', name, a)"
    >
      <template #toolbar>
        <LxButton
          v-if="!displaySchema?.properties[name]?.lx?.hideAddButton"
          icon="add-item"
          :label="texts?.addElement"
          kind="ghost"
          @click="addArrayObject(name)"
        />
      </template>
      <template
        #customItem="item"
        v-if="displaySchema?.properties[name]?.lx?.hasCustomItems === 'default'"
      >
        <LxStack
          :orientation="displaySchema?.properties[name]?.lx?.stack?.orientation"
          :kind="displaySchema?.properties[name]?.lx?.stack?.kind"
          :mode="displaySchema?.properties[name]?.lx?.stack?.mode || 'grid'"
          :horizontal-alignment="displaySchema?.properties[name]?.lx?.stack?.horizontalAlignment"
          :vertical-alignment="displaySchema?.properties[name]?.lx?.stack?.verticalAlignment"
          :horizontal-config="displaySchema?.properties[name]?.lx?.stack?.horizontalConfig"
          :vertical-config="displaySchema?.properties[name]?.lx?.stack?.verticalConfig"
        >
          <template
            v-for="(itemValue, itemName) in displaySchema?.properties[name]?.items?.properties"
            :key="itemName"
          >
            <LxFormBuilderListItem
              :itemValue="itemValue"
              :itemName="itemName"
              :item="item"
              :useStyles="true"
            />
          </template>
        </LxStack>
      </template>
      <template
        #customItem="item"
        v-else-if="displaySchema?.properties[name]?.lx?.hasCustomItems === 'nested'"
      >
        <template
          v-for="(itemValue, itemName) in displaySchema?.properties[name]?.items?.properties"
          :key="itemName"
        >
          <LxStack
            v-if="itemValue?.lx?.displayType === 'stack'"
            :orientation="itemValue?.lx?.orientation"
            :kind="itemValue?.lx?.kind"
            :mode="itemValue?.lx?.mode"
            :horizontal-alignment="itemValue?.lx?.horizontalAlignment"
            :vertical-alignment="itemValue?.lx?.verticalAlignment"
            :horizontal-config="itemValue?.lx?.horizontalConfig"
            :vertical-config="itemValue?.lx?.verticalConfig"
          >
            <template
              v-for="(nestedItemValue, nestedItemName) in itemValue?.properties"
              :key="nestedItemName"
            >
              <LxStack
                v-if="nestedItemValue?.lx?.displayType === 'stack'"
                :orientation="nestedItemValue?.lx?.orientation"
                :kind="nestedItemValue?.lx?.kind"
                :mode="nestedItemValue?.lx?.mode"
                :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
                :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
                :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
                :vertical-config="nestedItemValue?.lx?.verticalConfig"
              >
                <template
                  v-for="(innerNestedItemValue, innerNestedItemName) in nestedItemValue?.properties"
                  :key="innerNestedItemName"
                >
                  <LxFormBuilderListItem
                    :itemValue="innerNestedItemValue"
                    :itemName="innerNestedItemName"
                    :item="item?.[itemName]?.[nestedItemName]"
                  />
                </template>
              </LxStack>
              <LxFormBuilderListItem
                v-else
                :itemValue="nestedItemValue"
                :itemName="nestedItemName"
                :item="item?.[itemName]"
              />
            </template>
          </LxStack>
          <LxFormBuilderListItem :itemValue="itemValue" :itemName="itemName" :item="item" v-else />
        </template>
      </template>
    </LxList>
    <LxModal
      :ref="(el) => (modalRefs[`${id}-${name}`] = el)"
      :actionDefinitions="getActions"
      @close="newObject = false"
      @actionClick="handleModalActionClick($event, name)"
    >
      <LxForm
        :showHeader="false"
        :showFooter="false"
        :column-count="displaySchema?.properties[name]?.lx?.formColumnCount"
        kind="stripped"
      >
        <template
          v-for="(itemValue, itemName) in displaySchema?.properties[name]?.items?.properties"
          :key="itemName"
        >
          <LxPlaceholder v-if="componentSelect(itemValue, itemName) === 'lxPlaceholder'" />
          <LxRow
            v-else
            :label="itemValue?.title ? itemValue?.title : itemName"
            :rowSpan="itemValue?.lx?.rowSpan"
            :columnSpan="itemValue?.lx?.columnSpan"
            :actionDefinitions="itemValue?.lx?.actionDefinitions"
            @actionClick="(a, b, c) => rowActionClicked(b, c, `${name}.${itemName}`, undefined)"
          >
            <LxTextInput
              v-if="componentSelect(itemValue, itemName) === 'textInputDefault'"
              :mask="stringNumberMask(itemValue?.lx?.mask, itemValue?.type)"
              :maxlength="itemValue?.maxLength"
              :kind="itemValue?.lx?.kind"
              :tooltip="itemValue?.lx?.tooltip"
              :scale="itemValue?.lx?.scale"
              :disabled="itemValue?.lx?.disabled"
              :uppercase="itemValue?.lx?.uppercase"
              :convert-to-string="itemValue?.lx?.convertToString"
              :placeholder="examplesValue(itemValue)"
              :signed="itemValue?.lx?.signed"
              :readOnly="isReadOnly(itemValue)"
              :custom-mask-value="itemValue?.lx?.customMaskValue"
              :autocomplete="itemValue?.lx?.autocomplete"
              :options="itemValue?.lx?.options"
              :helperText="itemValue?.lx?.helperText"
              :helperTextKind="itemValue?.lx?.helperTextKind"
              :texts="itemValue?.lx?.texts"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxTextArea
              v-if="componentSelect(itemValue, itemName) === 'textArea'"
              :maxlength="itemValue?.maxLength"
              :placeholder="examplesValue(itemValue)"
              :rows="itemValue?.lx?.rows"
              :dynamic-height="itemValue?.lx?.dynamicHeight"
              :disabled="itemValue?.lx?.disabled"
              :tooltip="itemValue?.lx?.tooltip"
              :readOnly="isReadOnly(itemValue)"
              :helperText="itemValue?.lx?.helperText"
              :helperTextKind="itemValue?.lx?.helperTextKind"
              :texts="itemValue?.lx?.texts"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxTextInput
              v-else-if="componentSelect(itemValue, itemName) === 'textInputInteger'"
              mask="integer"
              :maxlength="itemValue?.maxLength"
              :kind="itemValue?.lx?.kind"
              :tooltip="itemValue?.lx?.tooltip"
              :scale="itemValue?.lx?.scale"
              :disabled="itemValue?.lx?.disabled"
              :uppercase="itemValue?.lx?.uppercase"
              :convert-to-string="itemValue?.lx?.convertToString"
              :placeholder="examplesValue(itemValue)"
              :signed="itemValue?.lx?.signed"
              :readOnly="isReadOnly(itemValue)"
              :helperText="itemValue?.lx?.helperText"
              :helperTextKind="itemValue?.lx?.helperTextKind"
              :texts="itemValue?.lx?.texts"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxToggle
              v-else-if="componentSelect(itemValue, itemName) === 'toggle'"
              :size="itemValue?.lx?.size"
              :disabled="itemValue?.lx?.disabled"
              :tooltip="itemValue?.lx?.tooltip"
              :readOnly="isReadOnly(itemValue)"
              :texts="itemValue?.lx?.texts"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxDateTimePicker
              v-else-if="componentSelect(itemValue, itemName) === 'dateTimePicker'"
              :kind="itemValue?.format"
              :placeholder="examplesValue(itemValue)"
              :tooltip="itemValue?.lx?.tooltip"
              :min-date="itemValue?.lx?.minDate"
              :max-date="itemValue?.lx?.maxDate"
              :required="itemValue?.lx?.required"
              :disabled="itemValue?.lx?.disabled"
              :time-adjust="itemValue?.lx?.timeAdjust"
              :clear-if-not-exact="itemValue?.lx?.clearIfNotExact"
              :locale="itemValue?.lx?.locale"
              :special-dates="itemValue?.lx?.specialDates"
              :dictionary="itemValue?.lx?.dictionary"
              :variant="itemValue?.lx?.variant"
              :cadenceOfMinutes="itemValue?.lx?.cadenceOfMinutes"
              :cadenceOfSeconds="itemValue?.lx?.cadenceOfSeconds"
              :helperText="itemValue?.lx?.helperText"
              :helperTextKind="itemValue?.lx?.helperTextKind"
              :texts="itemValue?.lx?.texts"
              :readOnly="isReadOnly(itemValue)"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxValuePicker
              v-else-if="componentSelect(itemValue, itemName) === 'valuePicker'"
              :selectionKind="itemValue?.type === 'array' ? 'multiple' : 'single'"
              :items="itemValue?.lx?.items || enumToObject(itemValue)"
              :id-attribute="itemValue?.lx?.idAttribute"
              :name-attribute="itemValue?.lx?.nameAttribute"
              :icon-attribute="itemValue?.lx?.iconAttribute"
              :icon-set-attribute="itemValue?.lx?.iconSetAttribute"
              :category-attribute="itemValue?.lx?.categoryAttribute"
              :description-attribute="itemValue?.lx?.descriptionAttribute"
              :variant="getCustomVariant(itemValue)"
              :has-search="itemValue?.lx?.hasSearch"
              :always-as-array="itemValue?.lx?.alwaysAsArray"
              :nullable="itemValue?.lx?.nullable"
              :tooltip="itemValue?.lx?.tooltip"
              :texts="itemValue?.lx?.texts"
              :placeholder="examplesValue(itemValue)"
              :disabled="itemValue?.lx?.disabled"
              :readOnly="isReadOnly(itemValue)"
              :has-select-all="itemValue?.lx?.hasSelectAll"
              :search-attributes="itemValue?.lx?.searchAttributes"
              :read-only-render-type="itemValue?.lx?.readOnlyRenderType"
              :stickyToolbar="itemValue?.lx?.stickyToolbar"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            >
              <template #customItem="customItem" v-if="itemValue?.lx?.hasCustomItems === 'default'">
                <LxStack
                  :orientation="itemValue?.lx?.stack?.orientation"
                  :kind="itemValue?.lx?.stack?.kind"
                  :mode="itemValue?.lx?.stack?.mode || 'grid'"
                  :horizontal-alignment="itemValue?.lx?.stack?.horizontalAlignment"
                  :vertical-alignment="itemValue?.lx?.stack?.verticalAlignment"
                  :horizontal-config="itemValue?.lx?.stack?.horizontalConfig"
                  :vertical-config="itemValue?.lx?.stack?.verticalConfig"
                >
                  <template
                    v-for="(stackItemValue, stackItemName) in itemValue?.lx?.customItems
                      ?.properties"
                    :key="stackItemName"
                  >
                    <LxFormBuilderListItem
                      :itemValue="stackItemValue"
                      :itemName="stackItemName"
                      :item="customItem"
                      :useStyles="true"
                    />
                  </template>
                </LxStack>
              </template>
              <template
                #customItem="customItem"
                v-else-if="itemValue?.lx?.hasCustomItems === 'nested'"
              >
                <template
                  v-for="(stackItemValue, stackItemName) in itemValue?.lx?.customItems?.properties"
                  :key="stackItemName"
                >
                  <LxStack
                    v-if="stackItemValue?.lx?.displayType === 'stack'"
                    :orientation="stackItemValue?.lx?.orientation"
                    :kind="stackItemValue?.lx?.kind"
                    :mode="stackItemValue?.lx?.mode"
                    :horizontal-alignment="stackItemValue?.lx?.horizontalAlignment"
                    :vertical-alignment="stackItemValue?.lx?.verticalAlignment"
                    :horizontal-config="stackItemValue?.lx?.horizontalConfig"
                    :vertical-config="stackItemValue?.lx?.verticalConfig"
                  >
                    <template
                      v-for="(nestedItemValue, nestedItemName) in stackItemValue?.properties"
                      :key="nestedItemName"
                    >
                      <LxStack
                        v-if="nestedItemValue?.lx?.displayType === 'stack'"
                        :orientation="nestedItemValue?.lx?.orientation"
                        :kind="nestedItemValue?.lx?.kind"
                        :mode="nestedItemValue?.lx?.mode"
                        :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
                        :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
                        :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
                        :vertical-config="nestedItemValue?.lx?.verticalConfig"
                      >
                        <template
                          v-for="(
                            innerNestedItemValue, innerNestedItemName
                          ) in nestedItemValue?.properties"
                          :key="innerNestedItemName"
                        >
                          <LxFormBuilderListItem
                            :itemValue="innerNestedItemValue"
                            :itemName="innerNestedItemName"
                            :item="customItem?.[itemName]?.[nestedItemName]"
                          />
                        </template>
                      </LxStack>
                      <LxFormBuilderListItem
                        v-else
                        :itemValue="nestedItemValue"
                        :itemName="nestedItemName"
                        :item="customItem?.[itemName]"
                      />
                    </template>
                  </LxStack>
                  <LxFormBuilderListItem
                    :itemValue="stackItemValue"
                    :itemName="stackItemName"
                    :item="customItem"
                    v-else
                  />
                </template>
              </template>
            </LxValuePicker>
            <LxAppendableList
              v-else-if="componentSelect(itemValue, itemName) === 'appendableList'"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            >
              <template #customItem="{ item, index }">
                <template
                  v-for="(appendableItem, appendableItemName) in itemValue?.items?.properties"
                  :key="appendableItemName"
                >
                  <LxPlaceholder
                    v-if="componentSelect(appendableItem, appendableItemName) === 'lxPlaceholder'"
                    class="lx-placeholder"
                  />
                  <LxRow
                    v-else
                    :label="appendableItem?.title ? appendableItem?.title : appendableItemName"
                    :rowSpan="appendableItem?.lx?.rowSpan"
                    :columnSpan="appendableItem?.lx?.columnSpan"
                    :required="appendableListRequiredRow(row?.items?.required, appendableItemName)"
                    :inputId="`${name}-${appendableItemName}-${index}`"
                    :action-definitions="appendableItem?.lx?.actionDefinitions"
                    @action-click="
                      (a, b, c) => rowActionClicked(b, c, `${name}.${appendableItemName}`, index)
                    "
                  >
                    <LxTextInput
                      v-if="
                        componentSelect(appendableItem, appendableItemName) === 'textInputDefault'
                      "
                      :id="`${name}-${appendableItemName}-${index}`"
                      :mask="stringNumberMask(appendableItem?.lx?.mask, appendableItem?.type)"
                      :maxlength="appendableItem?.maxLength"
                      :kind="appendableItem?.lx?.kind"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :scale="appendableItem?.lx?.scale"
                      :disabled="appendableItem?.lx?.disabled"
                      :uppercase="appendableItem?.lx?.uppercase"
                      :convert-to-string="appendableItem?.lx?.convertToString"
                      :placeholder="examplesValue(appendableItem)"
                      :signed="appendableItem?.lx?.signed"
                      :readOnly="isReadOnly(appendableItem)"
                      :custom-mask-value="appendableItem?.lx?.customMaskValue"
                      :autocomplete="appendableItem?.lx?.autocomplete"
                      :options="appendableItem?.lx?.options"
                      :helperText="appendableItem?.lx?.helperText"
                      :helperTextKind="appendableItem?.lx?.helperTextKind"
                      :texts="appendableItem?.lx?.texts"
                      v-model="item[appendableItemName]"
                    />
                    <LxTextArea
                      v-else-if="componentSelect(appendableItem, appendableItemName) === 'textArea'"
                      :id="`${name}-${appendableItemName}-${index}`"
                      :maxlength="appendableItem?.maxLength"
                      :placeholder="examplesValue(appendableItem)"
                      :rows="appendableItem?.lx?.rows"
                      :dynamic-height="appendableItem?.lx?.dynamicHeight"
                      :disabled="appendableItem?.lx?.disabled"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :readOnly="isReadOnly(appendableItem)"
                      :helperText="appendableItem?.lx?.helperText"
                      :helperTextKind="appendableItem?.lx?.helperTextKind"
                      :texts="appendableItem?.lx?.texts"
                      v-model="item[appendableItemName]"
                    />
                    <LxDateTimePicker
                      v-else-if="
                        componentSelect(appendableItem, appendableItemName) === 'dateTimePicker'
                      "
                      :id="`${name}-${appendableItemName}-${index}`"
                      :kind="
                        appendableItem?.format === 'date-time' ? 'dateTime' : appendableItem?.format
                      "
                      :placeholder="examplesValue(appendableItem)"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :min-date="appendableItem?.lx?.minDate"
                      :max-date="appendableItem?.lx?.maxDate"
                      :required="appendableItem?.lx?.required"
                      :disabled="appendableItem?.lx?.disabled"
                      :time-adjust="appendableItem?.lx?.timeAdjust"
                      :clear-if-not-exact="appendableItem?.lx?.clearIfNotExact"
                      :locale="appendableItem?.lx?.locale"
                      :special-dates="appendableItem?.lx?.specialDates"
                      :dictionary="appendableItem?.lx?.dictionary"
                      :variant="appendableItem?.lx?.variant"
                      :cadenceOfMinutes="appendableItem?.lx?.cadenceOfMinutes"
                      :cadenceOfSeconds="appendableItem?.lx?.cadenceOfSeconds"
                      :helperText="appendableItem?.lx?.helperText"
                      :helperTextKind="appendableItem?.lx?.helperTextKind"
                      :texts="appendableItem?.lx?.texts"
                      :readOnly="isReadOnly(appendableItem)"
                      v-model="item[appendableItemName]"
                    />
                    <LxTextInput
                      v-else-if="
                        componentSelect(appendableItem, appendableItemName) === 'textInputInteger'
                      "
                      :id="`${name}-${appendableItemName}-${index}`"
                      mask="integer"
                      :maxlength="appendableItem?.maxLength"
                      :kind="appendableItem?.lx?.kind"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :scale="appendableItem?.lx?.scale"
                      :disabled="appendableItem?.lx?.disabled"
                      :uppercase="appendableItem?.lx?.uppercase"
                      :convert-to-string="appendableItem?.lx?.convertToString"
                      :placeholder="examplesValue(appendableItem)"
                      :readOnly="isReadOnly(appendableItem)"
                      :helperText="appendableItem?.lx?.helperText"
                      :helperTextKind="appendableItem?.lx?.helperTextKind"
                      :texts="appendableItem?.lx?.texts"
                      v-model="item[appendableItemName]"
                    />
                    <LxToggle
                      v-else-if="componentSelect(appendableItem, appendableItemName) === 'toggle'"
                      :id="`${name}-${appendableItemName}-${index}`"
                      :size="appendableItem?.lx?.size"
                      :disabled="appendableItem?.lx?.disabled"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :readOnly="isReadOnly(appendableItem)"
                      :texts="appendableItem?.lx?.texts"
                      v-model="item[appendableItemName]"
                    >
                      <span v-if="appendableItem?.lx?.label">{{ appendableItem?.lx?.label }}</span>
                    </LxToggle>
                    <LxValuePicker
                      v-else-if="
                        componentSelect(appendableItem, appendableItemName) === 'valuePicker'
                      "
                      :id="`${name}-${appendableItemName}-${index}`"
                      :selectionKind="appendableItem?.type === 'array' ? 'multiple' : 'single'"
                      :items="appendableItem?.lx?.items || enumToObject(appendableItem)"
                      :id-attribute="appendableItem?.lx?.idAttribute"
                      :name-attribute="appendableItem?.lx?.nameAttribute"
                      :icon-attribute="appendableItem?.lx?.iconAttribute"
                      :icon-set-attribute="appendableItem?.lx?.iconSetAttribute"
                      :category-attribute="appendableItem?.lx?.categoryAttribute"
                      :description-attribute="appendableItem?.lx?.descriptionAttribute"
                      :variant="getCustomVariant(appendableItem)"
                      :has-search="appendableItem?.lx?.hasSearch"
                      :always-as-array="appendableItem?.lx?.alwaysAsArray"
                      :nullable="appendableItem?.lx?.nullable"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :texts="appendableItem?.lx?.texts"
                      :placeholder="examplesValue(appendableItem)"
                      :disabled="appendableItem?.lx?.disabled"
                      :readOnly="isReadOnly(appendableItem)"
                      :has-select-all="appendableItem?.lx?.hasSelectAll"
                      :search-attributes="appendableItem?.lx?.searchAttributes"
                      :read-only-render-type="appendableItem?.lx?.readOnlyRenderType"
                      :stickyToolbar="appendableItem?.lx?.stickyToolbar"
                      v-model="item[appendableItemName]"
                    >
                      <template
                        #customItem="customItem"
                        v-if="appendableItem?.lx?.hasCustomItems === 'default'"
                      >
                        <LxStack
                          :orientation="appendableItem?.lx?.stack?.orientation"
                          :kind="appendableItem?.lx?.stack?.kind"
                          :mode="appendableItem?.lx?.stack?.mode || 'grid'"
                          :horizontal-alignment="appendableItem?.lx?.stack?.horizontalAlignment"
                          :vertical-alignment="appendableItem?.lx?.stack?.verticalAlignment"
                          :horizontal-config="appendableItem?.lx?.stack?.horizontalConfig"
                          :vertical-config="appendableItem?.lx?.stack?.verticalConfig"
                        >
                          <template
                            v-for="(stackItemValue, stackItemName) in appendableItem?.lx
                              ?.customItems?.properties"
                            :key="stackItemName"
                          >
                            <LxFormBuilderListItem
                              :itemValue="stackItemValue"
                              :itemName="stackItemName"
                              :item="customItem"
                              :useStyles="true"
                            />
                          </template>
                        </LxStack>
                      </template>
                      <template
                        #customItem="customItem"
                        v-else-if="appendableItem?.lx?.hasCustomItems === 'nested'"
                      >
                        <template
                          v-for="(stackItemValue, stackItemName) in appendableItem?.lx?.customItems
                            ?.properties"
                          :key="stackItemName"
                        >
                          <LxStack
                            v-if="stackItemValue?.lx?.displayType === 'stack'"
                            :orientation="stackItemValue?.lx?.orientation"
                            :kind="stackItemValue?.lx?.kind"
                            :mode="stackItemValue?.lx?.mode"
                            :horizontal-alignment="stackItemValue?.lx?.horizontalAlignment"
                            :vertical-alignment="stackItemValue?.lx?.verticalAlignment"
                            :horizontal-config="stackItemValue?.lx?.horizontalConfig"
                            :vertical-config="stackItemValue?.lx?.verticalConfig"
                          >
                            <template
                              v-for="(
                                nestedItemValue, nestedItemName
                              ) in stackItemValue?.properties"
                              :key="nestedItemName"
                            >
                              <LxStack
                                v-if="nestedItemValue?.lx?.displayType === 'stack'"
                                :orientation="nestedItemValue?.lx?.orientation"
                                :kind="nestedItemValue?.lx?.kind"
                                :mode="nestedItemValue?.lx?.mode"
                                :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
                                :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
                                :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
                                :vertical-config="nestedItemValue?.lx?.verticalConfig"
                              >
                                <template
                                  v-for="(
                                    innerNestedItemValue, innerNestedItemName
                                  ) in nestedItemValue?.properties"
                                  :key="innerNestedItemName"
                                >
                                  <LxFormBuilderListItem
                                    :itemValue="innerNestedItemValue"
                                    :itemName="innerNestedItemName"
                                    :item="customItem?.[itemName]?.[nestedItemName]"
                                  />
                                </template>
                              </LxStack>
                              <LxFormBuilderListItem
                                v-else
                                :itemValue="nestedItemValue"
                                :itemName="nestedItemName"
                                :item="customItem?.[itemName]"
                              />
                            </template>
                          </LxStack>
                          <LxFormBuilderListItem
                            :itemValue="stackItemValue"
                            :itemName="stackItemName"
                            :item="customItem"
                            v-else
                          />
                        </template>
                      </template>
                    </LxValuePicker>
                  </LxRow>
                </template>
              </template>
            </LxAppendableList>
          </LxRow>
        </template>
      </LxForm>
    </LxModal>
  </div>
  <LxDataGrid
    v-else-if="selectedComponent === 'arrayTable'"
    :items="model[name]"
    :label="displaySchema?.properties[name]?.lx?.label"
    :description="displaySchema?.properties[name]?.lx?.description"
    :columnDefinitions="getColumnDefinitions(displaySchema?.properties[name]?.items?.properties)"
    :scrollable="
      displaySchema?.properties[name]?.items?.properties
        ? Object?.keys(displaySchema?.properties[name]?.items?.properties)?.length > 4
        : null
    "
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :busy="displaySchema?.properties[name]?.lx?.busy"
    :skeletonRowCount="displaySchema?.properties[name]?.lx?.skeletonRowCount"
    :showHeader="displaySchema?.properties[name]?.lx?.showHeader"
    :showStatusBar="displaySchema?.properties[name]?.lx?.showStatusBar"
    :showAllColumns="displaySchema?.properties[name]?.lx?.showAllColumns"
    :hasSorting="displaySchema?.properties[name]?.lx?.hasSorting"
    :sortingIgnoreEmpty="displaySchema?.properties[name]?.lx?.sortingIgnoreEmpty"
    :itemsPerPage="displaySchema?.properties[name]?.lx?.itemsPerPage"
    :totalItems="displaySchema?.properties[name]?.lx?.totalItems"
    :sortingMode="displaySchema?.properties[name]?.lx?.sortingMode"
    :actionDefinitions="displaySchema?.properties[name]?.lx?.actionDefinitions"
    :defaultActionName="displaySchema?.properties[name]?.lx?.defaultActionName"
    :toolbarActionDefinitions="displaySchema?.properties[name]?.lx?.toolbarActionDefinitions"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    @actionClick="(val, item, _) => componentEmit('actionClick', name, val, item)"
    @toolbarActionClick="(val) => componentEmit('toolbarActionClick', name, val)"
  />
  <div v-else-if="selectedComponent === 'arrayTableModal'">
    <LxDataGrid
      :items="model[name]"
      :label="displaySchema?.properties[name]?.lx?.label"
      :description="displaySchema?.properties[name]?.lx?.description"
      :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
      :columnDefinitions="getColumnDefinitions(displaySchema?.properties[name]?.items?.properties)"
      :scrollable="
        displaySchema?.properties[name]?.items?.properties
          ? Object?.keys(displaySchema?.properties[name]?.items?.properties)?.length > 4
          : null
      "
      :loading="displaySchema?.properties[name]?.lx?.loading"
      :busy="displaySchema?.properties[name]?.lx?.busy"
      :skeletonRowCount="displaySchema?.properties[name]?.lx?.skeletonRowCount"
      :showHeader="displaySchema?.properties[name]?.lx?.showHeader"
      :showToolbar="displaySchema?.properties[name]?.lx?.showToolbar || true"
      :showStatusBar="displaySchema?.properties[name]?.lx?.showStatusBar"
      :showAllColumns="displaySchema?.properties[name]?.lx?.showAllColumns"
      :hasSorting="displaySchema?.properties[name]?.lx?.hasSorting"
      :sortingIgnoreEmpty="displaySchema?.properties[name]?.lx?.sortingIgnoreEmpty"
      :itemsPerPage="displaySchema?.properties[name]?.lx?.itemsPerPage"
      :totalItems="displaySchema?.properties[name]?.lx?.totalItems"
      :sortingMode="displaySchema?.properties[name]?.lx?.sortingMode"
      :actionDefinitions="
        displaySchema?.properties[name]?.lx?.actionDefinitions || [
          { id: 'open', name: texts?.addElement, icon: 'open' },
          { id: 'remove', name: texts?.deleteElement, icon: 'remove-item', destructive: true },
        ]
      "
      :defaultActionName="displaySchema?.properties[name]?.lx?.defaultActionName || 'open'"
      :toolbarActionDefinitions="displaySchema?.properties[name]?.lx?.toolbarActionDefinitions"
      :hasVirtualization="displaySchema?.properties[name]?.lx?.hasVirtualization"
      :stickyHeader="displaySchema?.properties[name]?.lx?.stickyHeader"
      :hasPaging="displaySchema?.properties[name]?.lx?.hasPaging"
      :hasSelecting="displaySchema?.properties[name]?.lx?.hasSelecting"
      :selectionKind="displaySchema?.properties[name]?.lx?.selectionKind"
      :sortingSide="displaySchema?.properties[name]?.lx?.sortingSide"
      :emptyStateActionDefinitions="
        displaySchema?.properties[name]?.lx?.emptyStateActionDefinitions
      "
      :emptyStateIcon="displaySchema?.properties[name]?.lx?.emptyStateIcon"
      :hasSearch="displaySchema?.properties[name]?.lx?.hasSearch"
      :searchMode="displaySchema?.properties[name]?.lx?.searchMode"
      :searchString="displaySchema?.properties[name]?.lx?.searchString"
      :locale="displaySchema?.properties[name]?.lx?.locale"
      :fullBleed="displaySchema?.properties[name]?.lx?.fullBleed"
      :badgeDefinitions="displaySchema?.properties[name]?.lx?.badgeDefinitions"
      :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
      :texts="displaySchema?.properties[name]?.lx?.texts"
      @actionClick="
        (val, item, additional) =>
          dataGridActions(
            val,
            item,
            additional,
            name,
            displaySchema?.properties[name]?.lx?.actionDefinitions
          )
      "
      @toolbarActionClick="(val) => componentEmit('toolbarActionClick', name, val)"
      @selectionActionClick="
        (val, items) => componentEmit('selectionActionClick', name, val, items)
      "
      @update:searchString="(val) => componentEmit('update:searchString', name, val)"
      @search="(val) => componentEmit('search', name, val)"
      @selectPage="(val) => componentEmit('selectPage', name, val)"
      @sortingChange="(val) => componentEmit('sortingChange', name, val)"
      @selectionChange="(val) => componentEmit('selectionChange', name, val)"
      @itemsPerPageChange="(val) => componentEmit('itemsPerPageChange', name, val)"
      @emptyStateActionClick="(val) => componentEmit('emptyStateActionClick', name, val)"
    >
      <template #toolbar>
        <LxButton
          v-if="!displaySchema?.properties[name]?.lx?.hideAddButton"
          icon="add-item"
          :label="texts?.addElement"
          kind="ghost"
          @click="addArrayObject(name)"
        />
      </template>
    </LxDataGrid>
    <LxModal
      :ref="(el) => (modalRefs[`${id}-${name}`] = el)"
      :actionDefinitions="getActions"
      @close="newObject = false"
      @actionClick="handleModalActionClick($event, name)"
    >
      <LxForm
        :showHeader="false"
        :showFooter="false"
        :column-count="displaySchema?.properties[name]?.lx?.formColumnCount"
        kind="stripped"
      >
        <template
          v-for="(itemValue, itemName) in displaySchema?.properties[name]?.items?.properties"
          :key="itemName"
        >
          <LxPlaceholder v-if="componentSelect(itemValue, itemName) === 'lxPlaceholder'" />
          <LxRow
            v-else
            :label="itemValue?.title ? itemValue?.title : itemName"
            :rowSpan="itemValue?.lx?.rowSpan"
            :columnSpan="itemValue?.lx?.columnSpan"
            :action-definitions="itemValue?.lx?.actionDefinitions"
            @action-click="(a, b, c) => rowActionClicked(b, c, `${name}.${itemName}`, undefined)"
          >
            <LxTextInput
              v-if="componentSelect(itemValue, itemName) === 'textInputDefault'"
              :mask="stringNumberMask(itemValue?.lx?.mask, itemValue?.type)"
              :maxlength="itemValue?.maxLength"
              :kind="itemValue?.lx?.kind"
              :tooltip="itemValue?.lx?.tooltip"
              :scale="itemValue?.lx?.scale"
              :disabled="itemValue?.lx?.disabled"
              :uppercase="itemValue?.lx?.uppercase"
              :convert-to-string="itemValue?.lx?.convertToString"
              :placeholder="examplesValue(itemValue)"
              :signed="itemValue?.lx?.signed"
              :readOnly="isReadOnly(itemValue)"
              :custom-mask-value="itemValue?.lx?.customMaskValue"
              :autocomplete="itemValue?.lx?.autocomplete"
              :options="itemValue?.lx?.options"
              :helperText="itemValue?.lx?.helperText"
              :helperTextKind="itemValue?.lx?.helperTextKind"
              :texts="itemValue?.lx?.texts"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxTextArea
              v-if="componentSelect(itemValue, itemName) === 'textArea'"
              :maxlength="itemValue?.maxLength"
              :placeholder="examplesValue(itemValue)"
              :rows="itemValue?.lx?.rows"
              :dynamic-height="itemValue?.lx?.dynamicHeight"
              :disabled="itemValue?.lx?.disabled"
              :tooltip="itemValue?.lx?.tooltip"
              :readOnly="isReadOnly(itemValue)"
              :helperText="itemValue?.lx?.helperText"
              :helperTextKind="itemValue?.lx?.helperTextKind"
              :texts="itemValue?.lx?.texts"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxTextInput
              v-else-if="componentSelect(itemValue, itemName) === 'textInputInteger'"
              mask="integer"
              :maxlength="itemValue?.maxLength"
              :kind="itemValue?.lx?.kind"
              :tooltip="itemValue?.lx?.tooltip"
              :scale="itemValue?.lx?.scale"
              :disabled="itemValue?.lx?.disabled"
              :uppercase="itemValue?.lx?.uppercase"
              :convert-to-string="itemValue?.lx?.convertToString"
              :placeholder="examplesValue(itemValue)"
              :signed="itemValue?.lx?.signed"
              :readOnly="isReadOnly(itemValue)"
              :helperText="itemValue?.lx?.helperText"
              :helperTextKind="itemValue?.lx?.helperTextKind"
              :texts="itemValue?.lx?.texts"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxToggle
              v-else-if="componentSelect(itemValue, itemName) === 'toggle'"
              :size="itemValue?.lx?.size"
              :disabled="itemValue?.lx?.disabled"
              :tooltip="itemValue?.lx?.tooltip"
              :readOnly="isReadOnly(itemValue)"
              :texts="itemValue?.lx?.texts"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxDateTimePicker
              v-else-if="componentSelect(itemValue, itemName) === 'dateTimePicker'"
              :kind="itemValue?.format"
              :placeholder="examplesValue(itemValue)"
              :tooltip="itemValue?.lx?.tooltip"
              :min-date="itemValue?.lx?.minDate"
              :max-date="itemValue?.lx?.maxDate"
              :required="itemValue?.lx?.required"
              :disabled="itemValue?.lx?.disabled"
              :time-adjust="itemValue?.lx?.timeAdjust"
              :clear-if-not-exact="itemValue?.lx?.clearIfNotExact"
              :locale="itemValue?.lx?.locale"
              :special-dates="itemValue?.lx?.specialDates"
              :dictionary="itemValue?.lx?.dictionary"
              :variant="itemValue?.lx?.variant"
              :cadenceOfMinutes="itemValue?.lx?.cadenceOfMinutes"
              :cadenceOfSeconds="itemValue?.lx?.cadenceOfSeconds"
              :helperText="itemValue?.lx?.helperText"
              :helperTextKind="itemValue?.lx?.helperTextKind"
              :texts="itemValue?.lx?.texts"
              :readOnly="isReadOnly(itemValue)"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            />
            <LxValuePicker
              v-else-if="componentSelect(itemValue, itemName) === 'valuePicker'"
              :selectionKind="itemValue?.type === 'array' ? 'multiple' : 'single'"
              :items="itemValue?.lx?.items || enumToObject(itemValue)"
              :id-attribute="itemValue?.lx?.idAttribute"
              :name-attribute="itemValue?.lx?.nameAttribute"
              :icon-attribute="itemValue?.lx?.iconAttribute"
              :icon-set-attribute="itemValue?.lx?.iconSetAttribute"
              :category-attribute="itemValue?.lx?.categoryAttribute"
              :description-attribute="itemValue?.lx?.descriptionAttribute"
              :variant="getCustomVariant(itemValue)"
              :has-search="itemValue?.lx?.hasSearch"
              :always-as-array="itemValue?.lx?.alwaysAsArray"
              :nullable="itemValue?.lx?.nullable"
              :tooltip="itemValue?.lx?.tooltip"
              :texts="itemValue?.lx?.texts"
              :placeholder="examplesValue(itemValue)"
              :disabled="itemValue?.lx?.disabled"
              :readOnly="isReadOnly(itemValue)"
              :has-select-all="itemValue?.lx?.hasSelectAll"
              :search-attributes="itemValue?.lx?.searchAttributes"
              :read-only-render-type="itemValue?.lx?.readOnlyRenderType"
              :stickyToolbar="itemValue?.lx?.stickyToolbar"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            >
              <template #customItem="customItem" v-if="itemValue?.lx?.hasCustomItems === 'default'">
                <LxStack
                  :orientation="itemValue?.lx?.stack?.orientation"
                  :kind="itemValue?.lx?.stack?.kind"
                  :mode="itemValue?.lx?.stack?.mode || 'grid'"
                  :horizontal-alignment="itemValue?.lx?.stack?.horizontalAlignment"
                  :vertical-alignment="itemValue?.lx?.stack?.verticalAlignment"
                  :horizontal-config="itemValue?.lx?.stack?.horizontalConfig"
                  :vertical-config="itemValue?.lx?.stack?.verticalConfig"
                >
                  <template
                    v-for="(stackItemValue, stackItemName) in itemValue?.lx?.customItems
                      ?.properties"
                    :key="stackItemName"
                  >
                    <LxFormBuilderListItem
                      :itemValue="stackItemValue"
                      :itemName="stackItemName"
                      :item="customItem"
                      :useStyles="true"
                    />
                  </template>
                </LxStack>
              </template>
              <template
                #customItem="customItem"
                v-else-if="itemValue?.lx?.hasCustomItems === 'nested'"
              >
                <template
                  v-for="(stackItemValue, stackItemName) in itemValue?.lx?.customItems?.properties"
                  :key="stackItemName"
                >
                  <LxStack
                    v-if="stackItemValue?.lx?.displayType === 'stack'"
                    :orientation="stackItemValue?.lx?.orientation"
                    :kind="stackItemValue?.lx?.kind"
                    :mode="stackItemValue?.lx?.mode"
                    :horizontal-alignment="stackItemValue?.lx?.horizontalAlignment"
                    :vertical-alignment="stackItemValue?.lx?.verticalAlignment"
                    :horizontal-config="stackItemValue?.lx?.horizontalConfig"
                    :vertical-config="stackItemValue?.lx?.verticalConfig"
                  >
                    <template
                      v-for="(nestedItemValue, nestedItemName) in stackItemValue?.properties"
                      :key="nestedItemName"
                    >
                      <LxStack
                        v-if="nestedItemValue?.lx?.displayType === 'stack'"
                        :orientation="nestedItemValue?.lx?.orientation"
                        :kind="nestedItemValue?.lx?.kind"
                        :mode="nestedItemValue?.lx?.mode"
                        :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
                        :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
                        :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
                        :vertical-config="nestedItemValue?.lx?.verticalConfig"
                      >
                        <template
                          v-for="(
                            innerNestedItemValue, innerNestedItemName
                          ) in nestedItemValue?.properties"
                          :key="innerNestedItemName"
                        >
                          <LxFormBuilderListItem
                            :itemValue="innerNestedItemValue"
                            :itemName="innerNestedItemName"
                            :item="customItem?.[itemName]?.[nestedItemName]"
                          />
                        </template>
                      </LxStack>
                      <LxFormBuilderListItem
                        v-else
                        :itemValue="nestedItemValue"
                        :itemName="nestedItemName"
                        :item="customItem?.[itemName]"
                      />
                    </template>
                  </LxStack>
                  <LxFormBuilderListItem
                    :itemValue="stackItemValue"
                    :itemName="stackItemName"
                    :item="customItem"
                    v-else
                  />
                </template>
              </template>
            </LxValuePicker>
            <LxAppendableList
              v-else-if="componentSelect(itemValue, itemName) === 'appendableList'"
              v-model="arrayModelValue[`${id}-${name}`][itemName]"
            >
              <template #customItem="{ item, index }">
                <template
                  v-for="(appendableItem, appendableItemName) in itemValue?.items?.properties"
                  :key="appendableItemName"
                >
                  <LxPlaceholder
                    v-if="componentSelect(appendableItem, appendableItemName) === 'lxPlaceholder'"
                    class="lx-placeholder"
                  />
                  <LxRow
                    v-else
                    :label="appendableItem?.title ? appendableItem?.title : appendableItemName"
                    :rowSpan="appendableItem?.lx?.rowSpan"
                    :columnSpan="appendableItem?.lx?.columnSpan"
                    :required="appendableListRequiredRow(row?.items?.required, appendableItemName)"
                    :inputId="`${name}-${appendableItemName}-${index}`"
                    :action-definitions="appendableItem?.lx?.actionDefinitions"
                    @action-click="
                      (a, b, c) => rowActionClicked(b, c, `${name}.${appendableItemName}`, index)
                    "
                  >
                    <LxTextInput
                      v-if="
                        componentSelect(appendableItem, appendableItemName) === 'textInputDefault'
                      "
                      :id="`${name}-${appendableItemName}-${index}`"
                      :mask="stringNumberMask(appendableItem?.lx?.mask, appendableItem?.type)"
                      :maxlength="appendableItem?.maxLength"
                      :kind="appendableItem?.lx?.kind"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :scale="appendableItem?.lx?.scale"
                      :disabled="appendableItem?.lx?.disabled"
                      :uppercase="appendableItem?.lx?.uppercase"
                      :convert-to-string="appendableItem?.lx?.convertToString"
                      :placeholder="examplesValue(appendableItem)"
                      :signed="appendableItem?.lx?.signed"
                      :readOnly="isReadOnly(appendableItem)"
                      :custom-mask-value="appendableItem?.lx?.customMaskValue"
                      :autocomplete="appendableItem?.lx?.autocomplete"
                      :options="appendableItem?.lx?.options"
                      :helperText="appendableItem?.lx?.helperText"
                      :helperTextKind="appendableItem?.lx?.helperTextKind"
                      :texts="appendableItem?.lx?.texts"
                      v-model="item[appendableItemName]"
                    />
                    <LxTextArea
                      v-else-if="componentSelect(appendableItem, appendableItemName) === 'textArea'"
                      :id="`${name}-${appendableItemName}-${index}`"
                      :maxlength="appendableItem?.maxLength"
                      :placeholder="examplesValue(appendableItem)"
                      :rows="appendableItem?.lx?.rows"
                      :dynamic-height="appendableItem?.lx?.dynamicHeight"
                      :disabled="appendableItem?.lx?.disabled"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :readOnly="isReadOnly(appendableItem)"
                      :helperText="appendableItem?.lx?.helperText"
                      :helperTextKind="appendableItem?.lx?.helperTextKind"
                      :texts="appendableItem?.lx?.texts"
                      v-model="item[appendableItemName]"
                    />
                    <LxDateTimePicker
                      v-else-if="
                        componentSelect(appendableItem, appendableItemName) === 'dateTimePicker'
                      "
                      :id="`${name}-${appendableItemName}-${index}`"
                      :kind="appendableItem?.format"
                      :placeholder="examplesValue(appendableItem)"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :min-date="appendableItem?.lx?.minDate"
                      :max-date="appendableItem?.lx?.maxDate"
                      :required="appendableItem?.lx?.required"
                      :disabled="appendableItem?.lx?.disabled"
                      :time-adjust="appendableItem?.lx?.timeAdjust"
                      :clear-if-not-exact="appendableItem?.lx?.clearIfNotExact"
                      :locale="appendableItem?.lx?.locale"
                      :special-dates="appendableItem?.lx?.specialDates"
                      :dictionary="appendableItem?.lx?.dictionary"
                      :variant="appendableItem?.lx?.variant"
                      :cadenceOfMinutes="appendableItem?.lx?.cadenceOfMinutes"
                      :cadenceOfSeconds="appendableItem?.lx?.cadenceOfSeconds"
                      :helperText="appendableItem?.lx?.helperText"
                      :helperTextKind="appendableItem?.lx?.helperTextKind"
                      :texts="appendableItem?.lx?.texts"
                      :readOnly="isReadOnly(appendableItem)"
                      v-model="item[appendableItemName]"
                    />
                    <LxTextInput
                      v-else-if="
                        componentSelect(appendableItem, appendableItemName) === 'textInputInteger'
                      "
                      :id="`${name}-${appendableItemName}-${index}`"
                      mask="integer"
                      :maxlength="appendableItem?.maxLength"
                      :kind="appendableItem?.lx?.kind"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :scale="appendableItem?.lx?.scale"
                      :disabled="appendableItem?.lx?.disabled"
                      :uppercase="appendableItem?.lx?.uppercase"
                      :convert-to-string="appendableItem?.lx?.convertToString"
                      :placeholder="examplesValue(appendableItem)"
                      :readOnly="isReadOnly(appendableItem)"
                      :helperText="appendableItem?.lx?.helperText"
                      :helperTextKind="appendableItem?.lx?.helperTextKind"
                      :texts="appendableItem?.lx?.texts"
                      v-model="item[appendableItemName]"
                    />
                    <LxToggle
                      v-else-if="componentSelect(appendableItem, appendableItemName) === 'toggle'"
                      :id="`${name}-${appendableItemName}-${index}`"
                      :size="appendableItem?.lx?.size"
                      :disabled="appendableItem?.lx?.disabled"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :readOnly="isReadOnly(appendableItem)"
                      :texts="appendableItem?.lx?.texts"
                      v-model="item[appendableItemName]"
                    >
                      <span v-if="appendableItem?.lx?.label">
                        {{ appendableItem?.lx?.label }}
                      </span>
                    </LxToggle>
                    <LxValuePicker
                      v-else-if="
                        componentSelect(appendableItem, appendableItemName) === 'valuePicker'
                      "
                      :id="`${name}-${appendableItemName}-${index}`"
                      :selectionKind="appendableItem?.type === 'array' ? 'multiple' : 'single'"
                      :items="appendableItem?.lx?.items || enumToObject(appendableItem)"
                      :id-attribute="appendableItem?.lx?.idAttribute"
                      :name-attribute="appendableItem?.lx?.nameAttribute"
                      :icon-attribute="appendableItem?.lx?.iconAttribute"
                      :icon-set-attribute="appendableItem?.lx?.iconSetAttribute"
                      :category-attribute="appendableItem?.lx?.categoryAttribute"
                      :description-attribute="appendableItem?.lx?.descriptionAttribute"
                      :variant="getCustomVariant(appendableItem)"
                      :has-search="appendableItem?.lx?.hasSearch"
                      :always-as-array="appendableItem?.lx?.alwaysAsArray"
                      :nullable="appendableItem?.lx?.nullable"
                      :tooltip="appendableItem?.lx?.tooltip"
                      :texts="appendableItem?.lx?.texts"
                      :placeholder="examplesValue(appendableItem)"
                      :disabled="appendableItem?.lx?.disabled"
                      :readOnly="isReadOnly(appendableItem)"
                      :has-select-all="appendableItem?.lx?.hasSelectAll"
                      :search-attributes="appendableItem?.lx?.searchAttributes"
                      :read-only-render-type="appendableItem?.lx?.readOnlyRenderType"
                      :stickyToolbar="appendableItem?.lx?.stickyToolbar"
                      v-model="item[appendableItemName]"
                    >
                      <template
                        #customItem="customItem"
                        v-if="appendableItem?.lx?.hasCustomItems === 'default'"
                      >
                        <LxStack
                          :orientation="appendableItem?.lx?.stack?.orientation"
                          :kind="appendableItem?.lx?.stack?.kind"
                          :mode="appendableItem?.lx?.stack?.mode || 'grid'"
                          :horizontal-alignment="appendableItem?.lx?.stack?.horizontalAlignment"
                          :vertical-alignment="appendableItem?.lx?.stack?.verticalAlignment"
                          :horizontal-config="appendableItem?.lx?.stack?.horizontalConfig"
                          :vertical-config="appendableItem?.lx?.stack?.verticalConfig"
                        >
                          <template
                            v-for="(stackItemValue, stackItemName) in appendableItem?.lx
                              ?.customItems?.properties"
                            :key="stackItemName"
                          >
                            <LxFormBuilderListItem
                              :itemValue="stackItemValue"
                              :itemName="stackItemName"
                              :item="customItem"
                              :useStyles="true"
                            />
                          </template>
                        </LxStack>
                      </template>
                      <template
                        #customItem="customItem"
                        v-else-if="appendableItem?.lx?.hasCustomItems === 'nested'"
                      >
                        <template
                          v-for="(stackItemValue, stackItemName) in appendableItem?.lx?.customItems
                            ?.properties"
                          :key="stackItemName"
                        >
                          <LxStack
                            v-if="stackItemValue?.lx?.displayType === 'stack'"
                            :orientation="stackItemValue?.lx?.orientation"
                            :kind="stackItemValue?.lx?.kind"
                            :mode="stackItemValue?.lx?.mode"
                            :horizontal-alignment="stackItemValue?.lx?.horizontalAlignment"
                            :vertical-alignment="stackItemValue?.lx?.verticalAlignment"
                            :horizontal-config="stackItemValue?.lx?.horizontalConfig"
                            :vertical-config="stackItemValue?.lx?.verticalConfig"
                          >
                            <template
                              v-for="(
                                nestedItemValue, nestedItemName
                              ) in stackItemValue?.properties"
                              :key="nestedItemName"
                            >
                              <LxStack
                                v-if="nestedItemValue?.lx?.displayType === 'stack'"
                                :orientation="nestedItemValue?.lx?.orientation"
                                :kind="nestedItemValue?.lx?.kind"
                                :mode="nestedItemValue?.lx?.mode"
                                :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
                                :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
                                :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
                                :vertical-config="nestedItemValue?.lx?.verticalConfig"
                              >
                                <template
                                  v-for="(
                                    innerNestedItemValue, innerNestedItemName
                                  ) in nestedItemValue?.properties"
                                  :key="innerNestedItemName"
                                >
                                  <LxFormBuilderListItem
                                    :itemValue="innerNestedItemValue"
                                    :itemName="innerNestedItemName"
                                    :item="customItem?.[itemName]?.[nestedItemName]"
                                  />
                                </template>
                              </LxStack>
                              <LxFormBuilderListItem
                                v-else
                                :itemValue="nestedItemValue"
                                :itemName="nestedItemName"
                                :item="customItem?.[itemName]"
                              />
                            </template>
                          </LxStack>
                          <LxFormBuilderListItem
                            :itemValue="stackItemValue"
                            :itemName="stackItemName"
                            :item="customItem"
                            v-else
                          />
                        </template>
                      </template>
                    </LxValuePicker>
                  </LxRow>
                </template>
              </template>
            </LxAppendableList>
          </LxRow>
        </template>
      </LxForm>
    </LxModal>
  </div>
  <LxAppendableList
    v-else-if="selectedComponent === 'appendableList'"
    v-model="model[name]"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :expandable="displaySchema?.properties[name]?.lx?.expandable"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :descriptionAttribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
    :iconAttribute="displaySchema?.properties[name]?.lx?.iconAttribute"
    :hideRemoveAttribute="displaySchema?.properties[name]?.lx?.hideRemoveAttribute"
    :removeEnableByAttribute="displaySchema?.properties[name]?.lx?.removeEnableByAttribute"
    :removeVisibleByAttribute="displaySchema?.properties[name]?.lx?.removeVisibleByAttribute"
    :columnCount="displaySchema?.properties[name]?.lx?.columnCount"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :requiredMode="displaySchema?.properties[name]?.lx?.requiredMode"
    :canAddItems="displaySchema?.properties[name]?.lx?.canAddItems"
    :uppercase="displaySchema?.properties[name]?.lx?.uppercase"
    :defaultExpanded="displaySchema?.properties[name]?.lx?.defaultExpanded"
    :expandedAttribute="displaySchema?.properties[name]?.lx?.expandedAttribute"
    :actionDefinitions="displaySchema?.properties[name]?.lx?.actionDefinitions"
    :toolbarActionDefinitions="displaySchema?.properties[name]?.lx?.toolbarActionDefinitions"
    :hasSelecting="displaySchema?.properties[name]?.lx?.hasSelecting"
    :selectionKind="displaySchema?.properties[name]?.lx?.selectionKind"
    :invalidAttribute="displaySchema?.properties[name]?.lx?.invalidAttribute"
    :selectedValues="displaySchema?.properties[name]?.lx?.selectedValues"
    :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    @actionClick="(val, item, index) => componentEmit('actionClick', name, val, { item, index })"
    @toolbarActionClick="(id, val) => componentEmit('toolbarActionClick', name, id, val)"
    @update:selectedValues="(val) => componentEmit('update:selectedValues', name, val)"
  >
    <template #customItem="{ item, index }">
      <template
        v-for="(appendableItem, appendableItemName) in orderedObject?.[name]?.items?.properties"
        :key="appendableItemName"
      >
        <LxPlaceholder
          v-if="componentSelect(appendableItem, appendableItemName) === 'lxPlaceholder'"
          class="lx-placeholder"
        />
        <LxRow
          v-else
          :label="appendableItem?.title ? appendableItem?.title : appendableItemName"
          :rowSpan="appendableItem?.lx?.rowSpan"
          :columnSpan="appendableItem?.lx?.columnSpan"
          :required="appendableListRequiredRow(row?.items?.required, appendableItemName)"
          :inputId="`${name}-${appendableItemName}-${index}`"
          :action-definitions="appendableItem?.lx?.actionDefinitions"
          @action-click="
            (a, b, c) => rowActionClicked(b, c, `${name}.${appendableItemName}`, index)
          "
        >
          <LxTextInput
            v-if="componentSelect(appendableItem, appendableItemName) === 'textInputDefault'"
            :id="`${name}-${appendableItemName}-${index}`"
            :mask="stringNumberMask(appendableItem?.lx?.mask, appendableItem?.type)"
            :maxlength="appendableItem?.maxLength"
            :kind="appendableItem?.lx?.kind"
            :tooltip="appendableItem?.lx?.tooltip"
            :scale="appendableItem?.lx?.scale"
            :disabled="appendableItem?.lx?.disabled"
            :uppercase="appendableItem?.lx?.uppercase"
            :convert-to-string="appendableItem?.lx?.convertToString"
            :placeholder="examplesValue(appendableItem)"
            :signed="appendableItem?.lx?.signed"
            :readOnly="isReadOnly(appendableItem)"
            :custom-mask-value="appendableItem?.lx?.customMaskValue"
            :autocomplete="appendableItem?.lx?.autocomplete"
            :options="appendableItem?.lx?.options"
            :helperText="appendableItem?.lx?.helperText"
            :helperTextKind="appendableItem?.lx?.helperTextKind"
            :texts="appendableItem?.lx?.texts"
            v-model="item[appendableItemName]"
          />
          <LxTextArea
            v-else-if="componentSelect(appendableItem, appendableItemName) === 'textArea'"
            :id="`${name}-${appendableItemName}-${index}`"
            :maxlength="appendableItem?.maxLength"
            :placeholder="examplesValue(appendableItem)"
            :rows="appendableItem?.lx?.rows"
            :dynamic-height="appendableItem?.lx?.dynamicHeight"
            :disabled="appendableItem?.lx?.disabled"
            :tooltip="appendableItem?.lx?.tooltip"
            :readOnly="isReadOnly(appendableItem)"
            :helperText="appendableItem?.lx?.helperText"
            :helperTextKind="appendableItem?.lx?.helperTextKind"
            :texts="appendableItem?.lx?.texts"
            v-model="item[appendableItemName]"
          />
          <LxDateTimePicker
            v-else-if="componentSelect(appendableItem, appendableItemName) === 'dateTimePicker'"
            :id="`${name}-${appendableItemName}-${index}`"
            :kind="appendableItem?.format"
            :placeholder="examplesValue(appendableItem)"
            :tooltip="appendableItem?.lx?.tooltip"
            :min-date="appendableItem?.lx?.minDate"
            :max-date="appendableItem?.lx?.maxDate"
            :required="appendableItem?.lx?.required"
            :disabled="appendableItem?.lx?.disabled"
            :time-adjust="appendableItem?.lx?.timeAdjust"
            :clear-if-not-exact="appendableItem?.lx?.clearIfNotExact"
            :locale="appendableItem?.lx?.locale"
            :special-dates="appendableItem?.lx?.specialDates"
            :dictionary="appendableItem?.lx?.dictionary"
            :variant="appendableItem?.lx?.variant"
            :cadenceOfMinutes="appendableItem?.lx?.cadenceOfMinutes"
            :cadenceOfSeconds="appendableItem?.lx?.cadenceOfSeconds"
            :helperText="appendableItem?.lx?.helperText"
            :helperTextKind="appendableItem?.lx?.helperTextKind"
            :texts="appendableItem?.lx?.texts"
            :readOnly="isReadOnly(appendableItem)"
            v-model="item[appendableItemName]"
          />
          <LxTextInput
            v-else-if="componentSelect(appendableItem, appendableItemName) === 'textInputInteger'"
            :id="`${name}-${appendableItemName}-${index}`"
            mask="integer"
            :maxlength="appendableItem?.maxLength"
            :kind="appendableItem?.lx?.kind"
            :tooltip="appendableItem?.lx?.tooltip"
            :scale="appendableItem?.lx?.scale"
            :disabled="appendableItem?.lx?.disabled"
            :uppercase="appendableItem?.lx?.uppercase"
            :convert-to-string="appendableItem?.lx?.convertToString"
            :placeholder="examplesValue(appendableItem)"
            :readOnly="isReadOnly(appendableItem)"
            :helperText="appendableItem?.lx?.helperText"
            :helperTextKind="appendableItem?.lx?.helperTextKind"
            :texts="appendableItem?.lx?.texts"
            v-model="item[appendableItemName]"
          />
          <LxToggle
            v-else-if="componentSelect(appendableItem, appendableItemName) === 'toggle'"
            :id="`${name}-${appendableItemName}-${index}`"
            :size="appendableItem?.lx?.size"
            :disabled="appendableItem?.lx?.disabled"
            :tooltip="appendableItem?.lx?.tooltip"
            :readOnly="isReadOnly(appendableItem)"
            :texts="appendableItem?.lx?.texts"
            v-model="item[appendableItemName]"
          >
            <span v-if="appendableItem?.lx?.label">{{ appendableItem?.lx?.label }}</span>
          </LxToggle>
          <LxValuePicker
            v-else-if="componentSelect(appendableItem, appendableItemName) === 'valuePicker'"
            :id="`${name}-${appendableItemName}-${index}`"
            :selectionKind="appendableItem?.type === 'array' ? 'multiple' : 'single'"
            :items="appendableItem?.lx?.items || enumToObject(appendableItem)"
            :id-attribute="appendableItem?.lx?.idAttribute"
            :name-attribute="appendableItem?.lx?.nameAttribute"
            :icon-attribute="appendableItem?.lx?.iconAttribute"
            :icon-set-attribute="appendableItem?.lx?.iconSetAttribute"
            :category-attribute="appendableItem?.lx?.categoryAttribute"
            :description-attribute="appendableItem?.lx?.descriptionAttribute"
            :variant="getCustomVariant(appendableItem)"
            :has-search="appendableItem?.lx?.hasSearch"
            :always-as-array="appendableItem?.lx?.alwaysAsArray"
            :nullable="appendableItem?.lx?.nullable"
            :tooltip="appendableItem?.lx?.tooltip"
            :texts="appendableItem?.lx?.texts"
            :placeholder="examplesValue(appendableItem)"
            :disabled="appendableItem?.lx?.disabled"
            :readOnly="isReadOnly(appendableItem)"
            :has-select-all="appendableItem?.lx?.hasSelectAll"
            :search-attributes="appendableItem?.lx?.searchAttributes"
            :read-only-render-type="appendableItem?.lx?.readOnlyRenderType"
            :stickyToolbar="appendableItem?.lx?.stickyToolbar"
            v-model="item[appendableItemName]"
          >
            <template
              #customItem="customItem"
              v-if="appendableItem?.lx?.hasCustomItems === 'default'"
            >
              <LxStack
                :orientation="appendableItem?.lx?.stack?.orientation"
                :kind="appendableItem?.lx?.stack?.kind"
                :mode="appendableItem?.lx?.stack?.mode || 'grid'"
                :horizontal-alignment="appendableItem?.lx?.stack?.horizontalAlignment"
                :vertical-alignment="appendableItem?.lx?.stack?.verticalAlignment"
                :horizontal-config="appendableItem?.lx?.stack?.horizontalConfig"
                :vertical-config="appendableItem?.lx?.stack?.verticalConfig"
              >
                <template
                  v-for="(stackItemValue, stackItemName) in appendableItem?.lx?.customItems
                    ?.properties"
                  :key="stackItemName"
                >
                  <LxFormBuilderListItem
                    :itemValue="stackItemValue"
                    :itemName="stackItemName"
                    :item="customItem"
                    :useStyles="true"
                  />
                </template>
              </LxStack>
            </template>
            <template
              #customItem="customItem"
              v-else-if="appendableItem?.lx?.hasCustomItems === 'nested'"
            >
              <template
                v-for="(stackItemValue, stackItemName) in appendableItem?.lx?.customItems
                  ?.properties"
                :key="stackItemName"
              >
                <LxStack
                  v-if="stackItemValue?.lx?.displayType === 'stack'"
                  :orientation="stackItemValue?.lx?.orientation"
                  :kind="stackItemValue?.lx?.kind"
                  :mode="stackItemValue?.lx?.mode"
                  :horizontal-alignment="stackItemValue?.lx?.horizontalAlignment"
                  :vertical-alignment="stackItemValue?.lx?.verticalAlignment"
                  :horizontal-config="stackItemValue?.lx?.horizontalConfig"
                  :vertical-config="stackItemValue?.lx?.verticalConfig"
                >
                  <template
                    v-for="(nestedItemValue, nestedItemName) in stackItemValue?.properties"
                    :key="nestedItemName"
                  >
                    <LxStack
                      v-if="nestedItemValue?.lx?.displayType === 'stack'"
                      :orientation="nestedItemValue?.lx?.orientation"
                      :kind="nestedItemValue?.lx?.kind"
                      :mode="nestedItemValue?.lx?.mode"
                      :horizontal-alignment="nestedItemValue?.lx?.horizontalAlignment"
                      :vertical-alignment="nestedItemValue?.lx?.verticalAlignment"
                      :horizontal-config="nestedItemValue?.lx?.horizontalConfig"
                      :vertical-config="nestedItemValue?.lx?.verticalConfig"
                    >
                      <template
                        v-for="(
                          innerNestedItemValue, innerNestedItemName
                        ) in nestedItemValue?.properties"
                        :key="innerNestedItemName"
                      >
                        <LxFormBuilderListItem
                          :itemValue="innerNestedItemValue"
                          :itemName="innerNestedItemName"
                          :item="customItem?.[stackItemName]?.[nestedItemName]"
                        />
                      </template>
                    </LxStack>
                    <LxFormBuilderListItem
                      v-else
                      :itemValue="nestedItemValue"
                      :itemName="nestedItemName"
                      :item="customItem?.[stackItemName]"
                    />
                  </template>
                </LxStack>
                <LxFormBuilderListItem
                  :itemValue="stackItemValue"
                  :itemName="stackItemName"
                  :item="customItem"
                  v-else
                />
              </template>
            </template>
          </LxValuePicker>
        </LxRow>
      </template>
    </template>
  </LxAppendableList>
  <LxAppendableListSimple
    v-else-if="selectedComponent === 'smallAppendableList'"
    v-model="model[name]"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :columnCount="displaySchema?.properties[name]?.lx?.columnCount"
    :kind="displaySchema?.properties[name]?.lx?.kind || 'compact'"
    :requiredMode="displaySchema?.properties[name]?.lx?.requiredMode"
    :canAddItems="displaySchema?.properties[name]?.lx?.canAddItems"
    :texts="displaySchema?.properties[name]?.lx?.texts"
  >
    <template #customItem="{ index }">
      <LxPlaceholder
        v-if="componentSelect(row?.items, name) === 'lxPlaceholder'"
        class="lx-placeholder"
      />
      <LxRow
        v-else
        :hideLabel="true"
        :rowSpan="row?.items?.lx?.rowSpan"
        :columnSpan="row?.items?.lx?.columnSpan"
        :actionDefinitions="row?.items?.lx?.actionDefinitions"
        @actionClick="(a, b, c) => rowActionClicked(b, c, name, index)"
      >
        <LxTextInput
          v-if="componentSelect(row?.items, name) === 'textInputDefault'"
          :mask="stringNumberMask(row?.items?.lx?.mask, row?.items?.type)"
          :maxlength="row?.items?.maxLength"
          :kind="row?.items?.lx?.kind"
          :tooltip="row?.items?.lx?.tooltip"
          :scale="row?.items?.lx?.scale"
          :disabled="row?.items?.lx?.disabled"
          :uppercase="row?.items?.lx?.uppercase"
          :convert-to-string="row?.items?.lx?.convertToString"
          :placeholder="examplesValue(row?.items)"
          :signed="row?.items?.lx?.signed"
          :readOnly="isReadOnly(row?.items)"
          :custom-mask-value="row?.items?.lx?.customMaskValue"
          :autocomplete="row?.items?.lx?.autocomplete"
          :options="row?.items?.lx?.options"
          :helperText="row?.items?.lx?.helperText"
          :helperTextKind="row?.items?.lx?.helperTextKind"
          :texts="row?.items?.lx?.texts"
          v-model="model[name][index]"
        />
        <LxTextInput
          v-else-if="componentSelect(row?.items, name) === 'textInputInteger'"
          mask="integer"
          :maxlength="row?.items?.maxLength"
          :kind="row?.items?.lx?.kind"
          :tooltip="row?.items?.lx?.tooltip"
          :scale="row?.items?.lx?.scale"
          :disabled="row?.items?.lx?.disabled"
          :uppercase="row?.items?.lx?.uppercase"
          :convert-to-string="row?.items?.lx?.convertToString"
          :placeholder="examplesValue(row?.items)"
          :signed="row?.items?.lx?.signed"
          :readOnly="isReadOnly(row?.items)"
          :helperText="row?.items?.lx?.helperText"
          :helperTextKind="row?.items?.lx?.helperTextKind"
          :texts="row?.items?.lx?.texts"
          v-model="model[name][index]"
        />
        <LxToggle
          v-else-if="componentSelect(row?.items, name) === 'toggle'"
          :size="row?.items?.lx?.size"
          :disabled="row?.items?.lx?.disabled"
          :tooltip="row?.items?.lx?.tooltip"
          :readOnly="isReadOnly(row?.items)"
          :texts="row?.items?.lx?.texts"
          v-model="model[name][index]"
        >
          <template #on>
            <span v-if="row?.items?.lx?.labelOn">{{ row?.items?.lx?.labelOn }}</span>
            <span v-else>Jā</span>
          </template>
          <template #off>
            <span v-if="row?.items?.lx?.labelOff">{{ row?.items?.lx?.labelOff }}</span>
            <span v-else>Nē</span>
          </template>
          <template #indeterminate>
            <span v-if="row?.items?.lx?.labelIndeterminate">
              {{ row?.items?.lx?.labelIndeterminate }}
            </span>
            <span v-else-if="isReadOnly(row?.items)">
              <p class="lx-data">—</p>
            </span>
            <span v-else>—</span>
          </template>
        </LxToggle>
        <LxDateTimePicker
          v-else-if="componentSelect(row?.items, name) === 'dateTimePicker'"
          :kind="row?.items?.format"
          :tooltip="row?.items?.lx?.tooltip"
          :placeholder="examplesValue(row?.items)"
          :min-date="row?.items?.lx?.minDate"
          :max-date="row?.items?.lx?.maxDate"
          :required="row?.items?.lx?.required"
          :disabled="row?.items?.lx?.disabled"
          :time-adjust="row?.items?.lx?.timeAdjust"
          :clear-if-not-exact="row?.items?.lx?.clearIfNotExact"
          :locale="row?.items?.lx?.locale"
          :special-dates="row?.items?.lx?.specialDates"
          :dictionary="row?.items?.lx?.dictionary"
          :cadenceOfMinutes="row?.items?.lx?.cadenceOfMinutes"
          :cadenceOfSeconds="row?.items?.lx?.cadenceOfSeconds"
          :variant="row?.items?.lx?.variant"
          :helperText="row?.items?.lx?.helperText"
          :helperTextKind="row?.items?.lx?.helperTextKind"
          :texts="row?.items?.lx?.texts"
          :readOnly="isReadOnly(row?.items)"
          v-model="model[name][index]"
        />
      </LxRow>
    </template>
  </LxAppendableListSimple>

  <LxAutoComplete
    v-else-if="selectedComponent === 'autoComplete'"
    :id="`${id}-${name}`"
    :items="displaySchema?.properties[name]?.lx?.items"
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :dictionary="displaySchema?.properties[name]?.lx?.dictionary"
    :groupId="displaySchema?.properties[name]?.lx?.groupId"
    :queryMinLength="displaySchema?.properties[name]?.lx?.queryMinLength"
    :queryMaxLength="displaySchema?.properties[name]?.lx?.queryMaxLength"
    :queryDebounce="displaySchema?.properties[name]?.lx?.queryDebounce"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :hasDetails="displaySchema?.properties[name]?.lx?.hasDetails"
    :selectionKind="displaySchema?.properties[name]?.type === 'array' ? 'multiple' : 'single'"
    :detailMode="displaySchema?.properties[name]?.lx?.detailMode"
    :preloadedItems="displaySchema?.properties[name]?.lx?.preloadedItems"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :hasSelectAll="displaySchema?.properties[name]?.lx?.hasSelectAll"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    :searchAttributes="displaySchema?.properties[name]?.lx?.searchAttributes"
    :enableAdditionalText="displaySchema?.properties[name]?.lx?.enableAdditionalText"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @openDetails="(a) => componentEmit('openDetails', name, a)"
  />
  <LxButton
    v-else-if="selectedComponent === 'button'"
    :id="`${id}-${name}`"
    :label="model[name]?.label || model[name] || displaySchema?.properties[name]?.lx?.label"
    :title="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.title
        : displaySchema?.properties[name]?.lx?.title
    "
    :busyTooltip="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.busyTooltip
        : displaySchema?.properties[name]?.lx?.busyTooltip
    "
    :icon="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.icon
        : displaySchema?.properties[name]?.lx?.icon
    "
    :iconSet="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.iconSet
        : displaySchema?.properties[name]?.lx?.iconSet
    "
    :iconVariant="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.iconVariant
        : displaySchema?.properties[name]?.lx?.iconVariant
    "
    :kind="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.kind
        : displaySchema?.properties[name]?.lx?.kind
    "
    :variant="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.variant
        : displaySchema?.properties[name]?.lx?.variant
    "
    :size="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.size
        : displaySchema?.properties[name]?.lx?.size
    "
    :destructive="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.destructive
        : displaySchema?.properties[name]?.lx?.destructive
    "
    :href="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.href
        : displaySchema?.properties[name]?.lx?.href
    "
    :disabled="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.disabled
        : displaySchema?.properties[name]?.lx?.disabled
    "
    :loading="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.loading
        : displaySchema?.properties[name]?.lx?.loading
    "
    :busy="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.busy
        : displaySchema?.properties[name]?.lx?.busy
    "
    :badge="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.badge
        : displaySchema?.properties[name]?.lx?.badge
    "
    :badgeIcon="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.badgeIcon
        : displaySchema?.properties[name]?.lx?.badgeIcon
    "
    :badgeType="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.badgeType
        : displaySchema?.properties[name]?.lx?.badgeType
    "
    :badgeTitle="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.badgeTitle
        : displaySchema?.properties[name]?.lx?.badgeTitle
    "
    :active="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.active
        : displaySchema?.properties[name]?.lx?.active
    "
    :tabindex="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.tabindex
        : displaySchema?.properties[name]?.lx?.tabindex
    "
    :customClass="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.customClass
        : displaySchema?.properties[name]?.lx?.customClass
    "
    :openInNewTab="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.openInNewTab
        : displaySchema?.properties[name]?.lx?.openInNewTab
    "
    @click="(_, b) => componentEmit('click', name, b)"
  />
  <LxCamera
    v-else-if="selectedComponent === 'camera'"
    :id="`${id}-${name}`"
    :cameraSwitcherMode="displaySchema?.properties[name]?.lx?.cameraSwitcherMode"
    :hasFlashlightToggle="displaySchema?.properties[name]?.lx?.hasFlashlightToggle"
    :imageSize="displaySchema?.properties[name]?.lx?.imageSize"
    :preferencesId="displaySchema?.properties[name]?.lx?.preferencesId"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :actionDefinitions="displaySchema?.properties[name]?.lx?.actionDefinitions"
    :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @actionClick="(a, b) => componentEmit('actionClick', name, a, b)"
  />
  <LxCheckbox
    v-else-if="selectedComponent === 'checkbox'"
    :id="`${id}-${name}`"
    :groupId="displaySchema?.properties[name]?.lx?.groupId"
    :label="displaySchema?.properties[name]?.lx?.label"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :value="displaySchema?.properties[name]?.lx?.value"
    :tabindex="displaySchema?.properties[name]?.lx?.tabindex"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @click="() => componentEmit('click', name)"
  />
  <LxContentSwitcher
    v-else-if="selectedComponent === 'contentSwitcher'"
    :id="`${id}-${name}`"
    :items="displaySchema?.properties[name]?.lx?.items"
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :icon="displaySchema?.properties[name]?.lx?.icon"
    :iconSet="displaySchema?.properties[name]?.lx?.iconSet"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    v-model="model[name]"
    :builderOptions="builderOptions"
  />
  <LxDataVisualizer
    v-else-if="selectedComponent === 'dataVisualizer'"
    :id="`${id}-${name}`"
    :kind="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.kind
        : displaySchema?.properties[name]?.lx?.kind
    "
    :items="model?.[name]?.items || model?.[name] || displaySchema?.properties[name]?.lx?.items"
    :thresholds="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.thresholds
        : displaySchema?.properties[name]?.lx?.thresholds
    "
    :showValues="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.showValues
        : displaySchema?.properties[name]?.lx?.showValues
    "
    :idAttribute="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.idAttribute
        : displaySchema?.properties[name]?.lx?.idAttribute
    "
    :nameAttribute="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.nameAttribute
        : displaySchema?.properties[name]?.lx?.nameAttribute
    "
    :colorAttribute="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.colorAttribute
        : displaySchema?.properties[name]?.lx?.colorAttribute
    "
    :valueAttribute="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.valueAttribute
        : displaySchema?.properties[name]?.lx?.valueAttribute
    "
    :showLegend="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.showLegend
        : displaySchema?.properties[name]?.lx?.showLegend
    "
    :targets="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.targets
        : displaySchema?.properties[name]?.lx?.targets
    "
    :maxValue="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.maxValue
        : displaySchema?.properties[name]?.lx?.maxValue
    "
    :mode="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.mode
        : displaySchema?.properties[name]?.lx?.mode
    "
    :texts="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.texts
        : displaySchema?.properties[name]?.lx?.texts
    "
    @click="(a) => componentEmit('click', name, a)"
  />
  <LxDateTimeRange
    v-else-if="selectedComponent === 'dateTimeRange' && model[name]"
    :id="`${id}-${name}`"
    v-model:startDate="model[name].startDate"
    v-model:endDate="model[name].endDate"
    :kind="displaySchema?.properties[name]?.format"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :minDate="displaySchema?.properties[name]?.lx?.minDate"
    :maxDate="displaySchema?.properties[name]?.lx?.maxDate"
    :required="displaySchema?.properties[name]?.lx?.required"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :helperText="displaySchema?.properties[name]?.lx?.helperText"
    :helperTextKind="displaySchema?.properties[name]?.lx?.helperTextKind"
    :timeAdjust="displaySchema?.properties[name]?.lx?.timeAdjust"
    :locale="displaySchema?.properties[name]?.lx?.locale"
    :rangeMonths="displaySchema?.properties[name]?.lx?.rangeMonths"
    :clearIfNotExact="displaySchema?.properties[name]?.lx?.clearIfNotExact"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    :builderOptions="builderOptions"
    @outOfRange:startDate="(x) => componentEmit('outOfRange:startDate', name, x)"
    @outOfRange:endDate="(x) => componentEmit('outOfRange:endDate', name, x)"
    @outOfRange="(x) => componentEmit('outOfRange', name, x)"
  />
  <LxDropDownMenu
    v-else-if="selectedComponent === 'dropDownMenu'"
    :placement="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.placement
        : displaySchema?.properties[name]?.lx?.placement
    "
    :disabled="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.disabled
        : displaySchema?.properties[name]?.lx?.disabled
    "
    :triggerClick="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.triggerClick
        : displaySchema?.properties[name]?.lx?.triggerClick
    "
    :offsetSkid="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.offsetSkid
        : displaySchema?.properties[name]?.lx?.offsetSkid
    "
    :actionDefinitions="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.actionDefinitions
        : displaySchema?.properties[name]?.lx?.actionDefinitions
    "
    :groupDefinitions="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.groupDefinitions
        : displaySchema?.properties[name]?.lx?.groupDefinitions
    "
    @actionClick="(a, b) => componentEmit('actionClick', name, a, b)"
  >
    <LxButton
      :id="`${id}-${name}`"
      :label="model[name]?.label || model[name] || displaySchema?.properties[name]?.lx?.label"
      :title="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.title
          : displaySchema?.properties[name]?.lx?.title
      "
      :busyTooltip="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.busyTooltip
          : displaySchema?.properties[name]?.lx?.busyTooltip
      "
      :icon="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.icon
          : displaySchema?.properties[name]?.lx?.icon
      "
      :iconSet="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.iconSet
          : displaySchema?.properties[name]?.lx?.iconSet
      "
      :iconVariant="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.iconVariant
          : displaySchema?.properties[name]?.lx?.iconVariant
      "
      :kind="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.kind
          : displaySchema?.properties[name]?.lx?.kind
      "
      :variant="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.variant
          : displaySchema?.properties[name]?.lx?.variant
      "
      :size="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.size
          : displaySchema?.properties[name]?.lx?.size
      "
      :destructive="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.destructive
          : displaySchema?.properties[name]?.lx?.destructive
      "
      :href="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.href
          : displaySchema?.properties[name]?.lx?.href
      "
      :disabled="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.disabled
          : displaySchema?.properties[name]?.lx?.disabled
      "
      :loading="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.loading
          : displaySchema?.properties[name]?.lx?.loading
      "
      :busy="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.busy
          : displaySchema?.properties[name]?.lx?.busy
      "
      :badge="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.badge
          : displaySchema?.properties[name]?.lx?.badge
      "
      :badgeType="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.badgeType
          : displaySchema?.properties[name]?.lx?.badgeType
      "
      :active="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.active
          : displaySchema?.properties[name]?.lx?.active
      "
      :tabindex="-1"
      :customClass="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.customClass
          : displaySchema?.properties[name]?.lx?.customClass
      "
      :openInNewTab="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.openInNewTab
          : displaySchema?.properties[name]?.lx?.openInNewTab
      "
    />
    <template #panel>
      <LxButton
        v-for="(item, index) in displaySchema?.properties[name]?.lx?.items"
        :key="index"
        :label="item?.label"
        :title="item?.title"
        :busyTooltip="item?.busyTooltip"
        :icon="item?.icon"
        :iconSet="item?.iconSet"
        :iconVariant="item?.iconVariant"
        :kind="item?.kind"
        :variant="item?.variant"
        :size="item?.size"
        :destructive="item?.destructive"
        :href="item?.href"
        :disabled="item?.disabled"
        :loading="item?.loading"
        :busy="item?.busy"
        :badge="item?.badge"
        :badgeType="item?.badgeType"
        :active="item?.active"
        :tabindex="item?.tabindex"
        :customClass="item?.customClass"
        :openInNewTab="item?.openInNewTab"
        @click="() => componentEmit('click', `${name}.${index}`, item?.id || item?.label)"
      />
    </template>
  </LxDropDownMenu>

  <LxFileUploader
    v-else-if="selectedComponent === 'file'"
    :id="`${id}-${name}`"
    :selectionKind="displaySchema?.properties[name]?.lx?.selectionKind"
    :mode="displaySchema?.properties[name]?.lx?.mode"
    :maxlength="displaySchema?.properties[name]?.maxLength"
    :draggable="displaySchema?.properties[name]?.lx?.draggable"
    :dataType="displaySchema?.properties[name]?.lx?.dataType"
    :hasSearch="displaySchema?.properties[name]?.lx?.hasSearch"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :busy="displaySchema?.properties[name]?.lx?.busy"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :allowedFileExtensions="displaySchema?.properties[name]?.lx?.allowedFileExtensions"
    :maxFileSize="displaySchema?.properties[name]?.lx?.maxFileSize"
    :hasDownloadButton="displaySchema?.properties[name]?.lx?.hasDownloadButton"
    :showMeta="displaySchema?.properties[name]?.lx?.showMeta"
    :maxSizeForMeta="displaySchema?.properties[name]?.lx?.maxSizeForMeta"
    :hasCamera="displaySchema?.properties[name]?.lx?.hasCamera"
    :cameraSwitcherMode="displaySchema?.properties[name]?.lx?.cameraSwitcherMode"
    :hasFlashlightToggle="displaySchema?.properties[name]?.lx?.hasFlashlightToggle"
    :itemsStates="displaySchema?.properties[name]?.lx?.itemsStates"
    :imageSize="displaySchema?.properties[name]?.lx?.imageSize"
    :preferencesId="displaySchema?.properties[name]?.lx?.preferencesId"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @onError="(a, b) => componentEmit('onError', name, a, b)"
    @downloadFile="(a) => componentEmit('downloadFile', name, a)"
    @update:itemsStates="(a) => componentEmit('update:itemsStates', name, a)"
  />
  <LxFileViewer
    v-else-if="selectedComponent === 'fileViewer'"
    :id="`${id}-${name}`"
    :scrollable="displaySchema?.properties[name]?.lx?.scrollable"
    :width="displaySchema?.properties[name]?.lx?.width"
    :height="displaySchema?.properties[name]?.lx?.height"
    :fileName="displaySchema?.properties[name]?.lx?.fileName"
    :showPrintButton="displaySchema?.properties[name]?.lx?.showPrintButton"
    :showFullScreenButton="displaySchema?.properties[name]?.lx?.showFullScreenButton"
    :primaryDownloadButton="displaySchema?.properties[name]?.lx?.primaryDownloadButton"
    :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
    :zoomLevel="displaySchema?.properties[name]?.lx?.zoomLevel"
    :downloadType="displaySchema?.properties[name]?.lx?.downloadType"
    :preloadLibs="displaySchema?.properties[name]?.lx?.preloadLibs"
    v-model="model[name]"
    @download="(a) => componentEmit('download', name, a)"
  />
  <LxFlag
    v-else-if="selectedComponent === 'flag'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :size="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.size
        : displaySchema?.properties[name]?.lx?.size
    "
    :title="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.title
        : displaySchema?.properties[name]?.lx?.title
    "
    :locale="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.locale
        : displaySchema?.properties[name]?.lx?.locale
    "
    :meaningful="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.meaningful
        : displaySchema?.properties[name]?.lx?.meaningful
    "
  />
  <LxIcon
    v-else-if="selectedComponent === 'icon'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :iconSet="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.iconSet
        : displaySchema?.properties[name]?.lx?.iconSet
    "
    :variant="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.variant
        : displaySchema?.properties[name]?.lx?.variant
    "
    :customClass="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.customClass
        : displaySchema?.properties[name]?.lx?.customClass
    "
    :animation="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.animation
        : displaySchema?.properties[name]?.lx?.animation
    "
    :meaningful="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.meaningful
        : displaySchema?.properties[name]?.lx?.meaningful
    "
    :title="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.title
        : displaySchema?.properties[name]?.lx?.title
    "
    :desc="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.desc
        : displaySchema?.properties[name]?.lx?.desc
    "
    :texts="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.texts
        : displaySchema?.properties[name]?.lx?.texts
    "
  />
  <LxIllustration
    v-else-if="selectedComponent === 'illustration'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :class="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.class
        : displaySchema?.properties[name]?.lx?.class
    "
    :animation="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.animation
        : displaySchema?.properties[name]?.lx?.animation
    "
  />
  <LxLink
    v-else-if="selectedComponent === 'link'"
    :href="model?.[name]?.href || model?.[name] || displaySchema?.properties[name]?.lx?.href"
  />

  <LxMap
    v-else-if="selectedComponent === 'map'"
    :id="`${id}-${name}`"
    :baseLayerDefinitions="model[name].baseLayerDefinitions"
    v-model:selectedBaseLayer="model[name].selectedBaseLayer"
    :overlayLayerDefinitions="model[name].overlayLayerDefinitions"
    v-model:selectedOverlayLayers="model[name].selectedOverlayLayers"
    v-model:zoom="model[name].zoom"
    v-model:center="model[name].center"
    :objectDefinitions="model[name].objectDefinitions"
    :showSearch="model[name].showSearch"
    :showToolbar="model[name].showToolbar"
    :ignoreThemeChange="model[name].ignoreThemeChange"
    :hasUserLocation="model[name].hasUserLocation"
    :actionDefinitions="model[name].actionDefinitions"
    :stickyToolbar="model[name].stickyToolbar"
    :texts="model[name].texts"
    @search="(a) => componentEmit('search', name, a)"
    @actionClick="(a, b) => componentEmit('actionClick', name, a, b)"
  />
  <LxMarkdownTextArea
    v-else-if="selectedComponent === 'markdownTextArea'"
    :id="`${id}-${name}`"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :rows="displaySchema?.properties[name]?.lx?.rows"
    :maxlength="displaySchema?.properties[name]?.maxLength"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :showColorPicker="displaySchema?.properties[name]?.lx?.showColorPicker"
    :invalid="isInvalid"
    :invalidation-message="invalidMessage"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :showLinkEditor="displaySchema?.properties[name]?.lx?.showLinkEditor"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :showPlaceholderPicker="displaySchema?.properties[name]?.lx?.showPlaceholderPicker"
    :showImagePicker="displaySchema?.properties[name]?.lx?.showImagePicker"
    :showUnderlineToggle="displaySchema?.properties[name]?.lx?.showUnderlineToggle"
    :showHeadingPicker="displaySchema?.properties[name]?.lx?.showHeadingPicker"
    :imageMaxSize="displaySchema?.properties[name]?.lx?.imageMaxSize"
    :dictionary="displaySchema?.properties[name]?.lx?.dictionary"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
    :actionDefinitions="displaySchema?.properties[name]?.lx?.actionDefinitions"
    :helperText="displaySchema?.properties[name]?.lx?.helperText"
    :helperTextKind="displaySchema?.properties[name]?.lx?.helperTextKind"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @notification="(a) => componentEmit('notification', name, a)"
    @preparedImage="
      (a, b, c, d) => componentEmit('preparedImage', name, { base64: a, id: b, alt: c, title: d })
    "
    @actionClick="(a, b) => componentEmit('actionClick', name, a, b)"
  />
  <LxNumberSlider
    v-else-if="selectedComponent === 'numberSlider'"
    :id="`${id}-${name}`"
    :min="displaySchema?.properties[name]?.lx?.min"
    :max="displaySchema?.properties[name]?.lx?.max"
    :step="displaySchema?.properties[name]?.lx?.step"
    :stepMultiplier="displaySchema?.properties[name]?.lx?.stepMultiplier"
    :hasInput="displaySchema?.properties[name]?.lx?.hasInput"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :disableArrowKeys="displaySchema?.properties[name]?.lx?.disableArrowKeys"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
  />
  <LxPersonDisplay
    v-else-if="selectedComponent === 'personDisplay'"
    :value="model?.[name]"
    :name="displaySchema?.properties[name]?.lx?.name"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :size="displaySchema?.properties[name]?.lx?.size"
    :variant="displaySchema?.properties[name]?.lx?.variant"
    :description="displaySchema?.properties[name]?.lx?.description"
    :role="displaySchema?.properties[name]?.lx?.role"
    :institution="displaySchema?.properties[name]?.lx?.institution"
    :icon="displaySchema?.properties[name]?.lx?.icon"
    :iconSet="displaySchema?.properties[name]?.lx?.iconSet"
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :firstNameAttribute="displaySchema?.properties[name]?.lx?.firstNameAttribute"
    :lastNameAttribute="displaySchema?.properties[name]?.lx?.lastNameAttribute"
    :descriptionAttribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
    :roleAttribute="displaySchema?.properties[name]?.lx?.roleAttribute"
    :institutionAttribute="displaySchema?.properties[name]?.lx?.institutionAttribute"
    :iconAttribute="displaySchema?.properties[name]?.lx?.iconAttribute"
    :iconSetAttribute="displaySchema?.properties[name]?.lx?.iconSetAttribute"
    :maxLength="displaySchema?.properties[name]?.lx?.maxLength"
    :customAttributes="displaySchema?.properties[name]?.lx?.customAttributes"
    :customRole="displaySchema?.properties[name]?.lx?.customRole"
    :focusable="displaySchema?.properties[name]?.lx?.focusable"
    :texts="displaySchema?.properties[name]?.lx?.texts"
  />
  <LxQr
    v-else-if="selectedComponent === 'qr'"
    :id="`${id}-${name}`"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :size="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.size
        : displaySchema?.properties[name]?.lx?.size
    "
    :ignoreTheme="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.ignoreTheme
        : displaySchema?.properties[name]?.lx?.ignoreTheme
    "
  />
  <LxQrScanner
    v-else-if="selectedComponent === 'qrScanner'"
    :id="`${id}-${name}`"
    :formats="model?.[name]?.formats || displaySchema?.properties[name]?.lx?.formats"
    :hasFileUploader="
      model?.[name]?.hasFileUploader || displaySchema?.properties[name]?.lx?.hasFileUploader
    "
    :selectionKind="
      model?.[name]?.selectionKind || displaySchema?.properties[name]?.lx?.selectionKind
    "
    :cameraSwitcherMode="
      model?.[name]?.cameraSwitcherMode || displaySchema?.properties[name]?.lx?.cameraSwitcherMode
    "
    :hasFlashlightToggle="
      model?.[name]?.hasFlashlightToggle || displaySchema?.properties[name]?.lx?.hasFlashlightToggle
    "
    :showAlerts="model?.[name]?.showAlerts || displaySchema?.properties[name]?.lx?.showAlerts"
    :labelId="model?.[name]?.labelId || displaySchema?.properties[name]?.lx?.labelId"
    :stickyToolbar="
      model?.[name]?.stickyToolbar || displaySchema?.properties[name]?.lx?.stickyToolbar
    "
    :actionDefinitions="
      model?.[name]?.actionDefinitions || displaySchema?.properties[name]?.lx?.actionDefinitions
    "
    :texts="model?.[name]?.texts || displaySchema?.properties[name]?.lx?.texts"
    :builderOptions="builderOptions"
    @value="(a) => componentEmit('value', name, a)"
    @error="(a) => componentEmit('error', name, a)"
    @actionClick="(a, b) => componentEmit('actionClick', name, a, b)"
  />
  <LxRating
    v-else-if="selectedComponent === 'rating'"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :variant="displaySchema?.properties[name]?.lx?.variant"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :focusable="displaySchema?.properties[name]?.lx?.focusable"
    :invalid="isInvalid"
    :invalidationMessage="invalidMessage"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
  />
  <LxRichTextDisplay
    v-else-if="selectedComponent === 'richTextDisplay'"
    :id="`${id}-${name}`"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :loading="
      displaySchema?.properties[name]?.type === 'object'
        ? model?.[name]?.loading
        : displaySchema?.properties[name]?.lx?.loading
    "
  />
  <LxStateDisplay
    v-else-if="selectedComponent === 'stateDisplay'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :dictionary="
      displaySchema?.properties[name]?.type === 'object'
        ? model?.[name]?.dictionary
        : displaySchema?.properties[name]?.lx?.dictionary
    "
  />
  <LxSteps
    v-else-if="selectedComponent === 'steps'"
    :id="`${id}-${name}`"
    :items="displaySchema?.properties[name]?.lx?.items"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :descriptionAttribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
    :stateAttribute="displaySchema?.properties[name]?.lx?.stateAttribute"
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :busy="displaySchema?.properties[name]?.lx?.busy"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    v-model="model[name]"
  />
  <LxVisualPicker
    v-else-if="selectedComponent === 'visualPicker'"
    :id="`${id}-${name}`"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :mode="displaySchema?.properties[name]?.lx?.mode"
    :selectionKind="displaySchema?.properties[name]?.type === 'array' ? 'multiple' : 'single'"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
  />

  <LxDayInput
    v-else-if="selectedComponent === 'dayInput'"
    :id="`${id}-${name}`"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :variant="displaySchema?.properties[name]?.lx?.variant"
    :invalid="isInvalid"
    :invalidationMessage="invalidMessage"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
  />
  <LxDrawPad
    v-else-if="selectedComponent === 'drawPad'"
    :id="`${id}-${name}`"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :width="displaySchema?.properties[name]?.lx?.width"
    :height="displaySchema?.properties[name]?.lx?.height"
    :instrument="displaySchema?.properties[name]?.lx?.instrument"
    :color="displaySchema?.properties[name]?.lx?.color"
    :showInstruments="displaySchema?.properties[name]?.lx?.showInstruments"
    :showColorPicker="displaySchema?.properties[name]?.lx?.showColorPicker"
    :showClearAll="displaySchema?.properties[name]?.lx?.showClearAll"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :stickyToolbar="displaySchema?.properties[name]?.lx?.stickyToolbar"
    :actionDefinitions="displaySchema?.properties[name]?.lx?.actionDefinitions"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    :builderOptions="builderOptions"
    @actionClick="(a, b) => componentEmit('actionClick', name, a, b)"
    @update:instrument="(a) => componentEmit('update:instrument', name, a)"
    @update:color="(a) => componentEmit('update:color', name, a)"
  />
  <LxLogoDisplay
    v-else-if="selectedComponent === 'logoDisplay'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :kind="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.kind
        : displaySchema?.properties[name]?.lx?.kind
    "
    :size="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.size
        : displaySchema?.properties[name]?.lx?.size
    "
    :theme="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.theme
        : displaySchema?.properties[name]?.lx?.theme
    "
  />
  <p class="lx-data" v-else-if="selectedComponent === 'text'">
    {{ model[name] }}
  </p>
</template>
