<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  LxButton,
  LxDropDownMenu,
  LxIcon,
  LxTextInput,
  LxList,
  lxFormatUtils,
  LxEmptyState,
  lxGeneralUtils,
} from '@dativa-lv/lx-ui';

import { useDebounceFn } from '@vueuse/core';
import { getLXComponents } from '@/utils/constructorUtils';
import ConstructorPropRenderer from '@/components/constructor/ConstructorPropRenderer.vue';

const props = defineProps({
  componentName: {
    type: String,
    default: null,
  },
  componentProps: {
    type: Object,
    default: null,
  },
  componentPropsDefinitions: {
    type: Object,
    default: null,
  },
  navigation: {
    type: Array,
    default: () => [],
  },
  componentModel: {
    type: Object,
    default: () => ({}),
  },
  schemaKey: {
    type: String,
    default: '',
  },
  schemaKeyError: {
    type: String,
    default: null,
  },
  schemaInfo: {
    type: Object,
    default: null,
  },
  selectedTab: {
    type: String,
    default: null,
  },
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const textsDefault = {
  export: 'Saglabāt',
  import: 'Atvērt',
  editSchema: 'Labot shēmu',
  editModel: 'Labot datus',
  reportIssue: 'Ziņot par kļūdu',
  reset: 'Atiestatīt vērtības',
  openPanel: 'Atvērt paneli',
  closePanel: 'Aizvērt paneli',
  config: 'Konfigurācija',
  components: 'Komponentes',
  settings: 'Iestatījumi',
  duplicate: 'Dublēt',
  delete: 'Dzēst',
  resetKey: 'Atiestatīt',
  searchProps: 'Meklēt propus',
  searchComponents: 'Meklēt komponenti',
  clear: 'Notīrīt',
  noItems: 'Nav ierakstu',
  notFoundSearch: 'Nav atrasts:',
  notFoundProps: 'Nav atrasts',
  actionPanel: 'Darbību panelis',
  save: 'Saglabāt',
  additionalLabel: 'Additional',
  modeLabel: 'Mode',
  noComponentSelected: 'Nav izvēlēts elements',
  inputs: 'Ievadlauki',
  containers: 'Konteineri',
  close: 'Aizvērt',
  edit: 'Labot',
};

const displayTexts = computed(() => lxGeneralUtils.getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits([
  'export',
  'import',
  'reportIssue',
  'reset',
  'editSchema',
  'editModel',
  'componentAdd',
  'componentChange',
  'removeComponent',
  'duplicateComponent',
  'update:componentModel',
  'update:componentProps',
  'update:viewLayout',
  'update:schemaKey',
  'update:selectedTab',
]);

const compModel = computed({
  get() {
    return props.componentModel;
  },
  set(value) {
    emits('update:componentModel', value);
  },
});

const open = ref(true);

const tab = computed({
  get() {
    return props.selectedTab || (open.value ? 'config' : null);
  },
  set(value) {
    emits('update:selectedTab', value);
  },
});

function togglePanel(value) {
  open.value = !value;
  if (value) tab.value = null;
  else tab.value = 'config';
}

const usageGroupDefinitions = computed(() => [
  {
    id: 'inputs',
    name: displayTexts.value?.inputs,
    badgeTitle: displayTexts.value?.inputs,
    expanded: true,
  },
  {
    id: 'containers',
    name: displayTexts.value?.containers,
    badgeTitle: displayTexts.value?.containers,
    expanded: true,
  },
]);

const lxComponents = ref(getLXComponents());

// Can only add LxSection if:
// It's plain LxForm, or it's LxForm inside LxFilters, but has no LxSection yet
function canAddLxSection() {
  return props.componentName === 'LxForm' && !props.schemaInfo?.isSectionInFilterForm;
}

const componentItems = computed(() => {
  if (!props.componentName) return [];
  let res = [...lxComponents.value];
  res = res.map((x) => ({
    ...x,
    clickable: props.componentName !== 'LxForm',
  }));

  res.push(
    {
      id: 'LxSection',
      name: 'LxSection',
      usageGroup: 'containers',
      clickable: canAddLxSection(),
    },
    {
      id: 'LxForm',
      name: 'LxForm',
      usageGroup: 'containers',
      clickable:
        props.componentName === 'LxViewLayout' &&
        !props.schemaInfo?.hasForm &&
        !props.schemaInfo?.hasFilters,
    },
    {
      id: 'LxFilters',
      name: 'LxFilters',
      usageGroup: 'containers',
      clickable:
        props.componentName === 'LxViewLayout' &&
        !props.schemaInfo?.hasForm &&
        !props.schemaInfo?.hasFilters,
    }
  );

  return res.filter((x) => x.clickable)?.sort((a, b) => a?.name?.localeCompare(b?.name));
});

// Highlight newly selected element
function changeNavigationItem(id) {
  // if its the same item, do nothing
  if (props.navigation[props.navigation.length - 1]?.id === id) return;
  emits(
    'componentChange',
    props.navigation.find((x) => x.id === id)
  );
}

// Convert component props to according schema
function propsToSchema(component, propValues) {
  const res = lxFormatUtils.objectClone(props.componentModel) || {};
  if (component === 'LxTextInput') {
    res.type = 'string';
    res.maxLength = propValues.maxlength;
    res.lx = res.lx || {};
    res.lx.mask = propValues.mask || 'default';
    res.lx.kind = propValues.kind || 'default';
    res.lx.scale = propValues.scale;
    res.lx.tooltip = propValues.tooltip;
    res.lx.disabled = propValues.disabled || false;
    res.lx.uppercase = propValues.uppercase || false;
    res.lx.convertToString = propValues.convertToString || false;
    res.lx.placeholder = propValues.placeholder;
    res.lx.signed = propValues.signed || false;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxToggle') {
    res.type = 'boolean';
    res.lx = res.lx || {};
    res.lx.size = propValues.size || 'm';
    res.lx.disabled = propValues.disabled || false;
    res.lx.tooltip = propValues.tooltip;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxValuePicker') {
    res.type = propValues.selectionKind === 'multiple' ? 'array' : 'string';
    res.lx = res.lx || {};
    res.lx.items = propValues.items || [];
    res.lx.idAttribute = propValues.idAttribute;
    res.lx.nameAttribute = propValues.nameAttribute;
    res.lx.iconAttribute = propValues.iconAttribute;
    res.lx.iconSetAttribute = propValues.iconSetAttribute;
    res.lx.categoryAttribute = propValues.categoryAttribute;
    res.lx.descriptionAttribute = propValues.descriptionAttribute;
    res.lx.variant = propValues.variant;
    res.lx.hasSearch = propValues.hasSearch || false;
    res.lx.alwaysAsArray = propValues.alwaysAsArray || false;
    res.lx.nullable = propValues.nullable || false;
    res.lx.tooltip = propValues.tooltip;
    res.lx.texts = propValues.texts;
    res.lx.placeholder = propValues.placeholder;
    res.lx.disabled = propValues.disabled || false;
    res.readOnly = propValues.readOnly || false;
    res.lx.searchAttributes = propValues.searchAttributes;
    res.lx.hasSelectAll = propValues.hasSelectAll || false;
    res.lx.readOnlyRenderType = propValues.readOnlyRenderType || 'row';
  } else if (component === 'LxRow') {
    res.title = propValues.label;
    res.lx = res.lx || {};
    res.lx.columnSpan = propValues.columnSpan || '1';
    res.lx.rowSpan = propValues.rowSpan || '1';
    res.lx.rowActionDefinitions = propValues.rowActionDefinitions;
  } else if (component === 'LxTextArea') {
    res.type = 'string';
    res.maxLength = propValues.maxlength;
    res.lx = res.lx || {};
    res.lx.kind = 'multiline';
    res.lx.placeholder = propValues.placeholder;
    res.lx.rows = propValues.rows || 3;
    res.lx.disabled = propValues.disabled || false;
    res.lx.dynamicHeight = propValues.dynamicHeight || false;
    res.lx.tooltip = propValues.tooltip;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxDateTimePicker') {
    res.type = 'string';
    res.lx = res.lx || {};
    res.format = propValues.kind || 'date';
    res.lx.placeholder = propValues.placeholder;
    res.lx.tooltip = propValues.tooltip;
    res.lx.minDate = propValues.minDate;
    res.lx.maxDate = propValues.maxDate;
    res.lx.required = propValues.required || false;
    res.lx.disabled = propValues.disabled || false;
    res.lx.timeAdjust = propValues.timeAdjust;
    res.lx.clearIfNotExact = propValues.clearIfNotExact || false;
    res.lx.texts = propValues.texts;
    res.lx.locale = propValues.locale;
    res.lx.specialDates = propValues.specialDates;
    res.lx.dictionary = propValues.dictionary;
    res.lx.variant = propValues.variant || 'default';
    res.lx.cadenceOfMinutes = propValues.cadenceOfMinutes ? Number(propValues.cadenceOfMinutes) : 1;
    res.lx.cadenceOfSeconds = propValues.cadenceOfSeconds ? Number(propValues.cadenceOfSeconds) : 1;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxAutoComplete') {
    res.type = propValues.selectionKind === 'multiple' ? 'array' : 'string';
    res.lx = res.lx || {};
    res.lx.items = propValues.items || [];
    res.lx.idAttribute = propValues.idAttribute || 'id';
    res.lx.nameAttribute = propValues.nameAttribute || 'name';
    res.lx.dictionary = propValues.dictionary;
    res.lx.groupId = propValues.groupId;
    res.lx.queryMinLength = propValues.queryMinLength || 0;
    res.lx.queryMaxLength = propValues.queryMaxLength;
    res.lx.queryDebounce = propValues.queryDebounce || 200;
    res.lx.placeholder = propValues.placeholder;
    res.lx.tooltip = propValues.tooltip;
    res.lx.disabled = propValues.disabled || false;
    res.lx.loading = propValues.loading || false;
    res.lx.hasDetails = propValues.hasDetails || false;
    res.lx.selectionKind = propValues.selectionKind || 'single';
    res.lx.preloadedItems = propValues.preloadedItems;
    res.lx.labelId = propValues.labelId;
    res.lx.hasSelectAll = propValues.hasSelectAll || false;
    res.lx.enableAdditionalText = propValues.enableAdditionalText || false;
    res.lx.texts = propValues.texts;
    res.lx.searchAttributes = propValues.searchAttributes;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxCamera') {
    res.type = 'string';
    res.lx = res.lx || {};
    res.lx.cameraSwitcherMode = propValues.cameraSwitcherMode || 'toggle';
    res.lx.hasFlashlightToggle = propValues.hasFlashlightToggle || false;
    res.lx.imageSize = propValues.imageSize || 'default';
    res.lx.preferencesId = propValues.preferencesId || 'lx-camera-settings';
    res.lx.labelId = propValues.labelId;
    res.lx.texts = propValues.texts;
  } else if (component === 'LxCheckbox') {
    res.type = 'boolean';
    res.lx = res.lx || {};
    res.lx.groupId = propValues.groupId;
    res.lx.label = propValues.label;
    res.lx.disabled = propValues.disabled || false;
    res.lx.value = propValues.value || 'none';
    res.lx.tabindex = propValues.tabindex || '0';
    res.lx.labelId = propValues.labelId;
  } else if (component === 'LxContentSwitcher') {
    res.type = 'string';
    res.lx = res.lx || {};
    res.lx.items = propValues.items;
    res.lx.idAttribute = propValues.idAttribute || 'id';
    res.lx.nameAttribute = propValues.nameAttribute || 'name';
    res.lx.disabled = propValues.disabled || false;
    res.lx.kind = propValues.kind || 'default';
    res.lx.icon = propValues.icon;
    res.lx.iconSet = propValues.iconSet;
    res.lx.tooltip = propValues.tooltip;
    res.lx.labelId = propValues.labelId;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxDateTimeRange') {
    res.type = 'object';
    res.format = propValues.kind || 'date';
    res.lx = res.lx || {};
    res.lx.placeholder = propValues.placeholder;
    res.lx.tooltip = propValues.tooltip;
    res.lx.minDate = propValues.minDate;
    res.lx.maxDate = propValues.maxDate;
    res.lx.required = propValues.required || false;
    res.lx.disabled = propValues.disabled || false;
    res.lx.timeAdjust = propValues.timeAdjust;
    res.lx.locale = propValues.locale;
    res.lx.rangeMonths = propValues.rangeMonths || 'next';
    res.lx.clearIfNotExact = propValues.clearIfNotExact || false;
    res.lx.labelId = propValues.labelId;
    res.lx.texts = propValues.texts;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxFileUploader') {
    res.type = 'array';
    res.lx = res.lx || {};
    res.lx.selectionKind = propValues.selectionKind || 'single';
    res.lx.mode = propValues.mode || 'default';
    res.lx.draggable = propValues.draggable || false;
    res.lx.dataType = propValues.dataType || 'meta';
    res.lx.hasSearch = propValues.hasSearch || false;
    res.lx.disabled = propValues.disabled || false;
    res.lx.loading = propValues.loading || false;
    res.lx.busy = propValues.busy || false;
    res.lx.allowedFileExtensions = propValues.allowedFileExtensions || [];
    res.lx.maxFileSize = propValues.maxFileSize || 30000000;
    res.lx.hasDownloadButton = propValues.hasDownloadButton || false;
    res.lx.showMeta = propValues.showMeta ?? true;
    res.lx.maxSizeForMeta = propValues.maxSizeForMeta || 30000000;
    res.lx.hasCamera = propValues.hasCamera || false;
    res.lx.cameraSwitcherMode = propValues.cameraSwitcherMode || 'toggle';
    res.lx.hasFlashlightToggle = propValues.hasFlashlightToggle || false;
    res.lx.imageSize = propValues.imageSize || 'default';
    res.lx.preferencesId = propValues.preferencesId || 'lx-camera-settings';
    res.lx.labelId = propValues.labelId;
    res.lx.texts = propValues.texts;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxNumberSlider') {
    res.type = 'integer';
    res.lx = res.lx || {};
    res.lx.min = propValues.min || 0;
    res.lx.max = propValues.max || 9999;
    res.lx.step = propValues.step || 1;
    res.lx.stepMultiplier = propValues.stepMultiplier || 5;
    res.lx.hasInput = propValues.hasInput || false;
    res.lx.labelId = propValues.labelId;
    res.lx.disabled = propValues.disabled || false;
    res.lx.kind = propValues.kind || 'slider';
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxQrScanner') {
    res.type = 'object';
    res.lx = res.lx || {};
    res.lx.formats = propValues.formats || ['qr_code'];
    res.lx.hasFileUploader = propValues.hasFileUploader ?? true;
    res.lx.selectionKind = propValues.selectionKind || 'single';
    res.lx.cameraSwitcherMode = propValues.cameraSwitcherMode || 'list';
    res.lx.hasFlashlightToggle = propValues.hasFlashlightToggle || false;
    res.lx.showAlerts = propValues.showAlerts ?? true;
    res.lx.labelId = propValues.labelId;
    res.lx.texts = propValues.texts;
  } else if (component === 'LxVisualPicker') {
    res.type = propValues.selectionKind === 'multiple' ? 'array' : 'string';
    res.lx = res.lx || {};
    res.lx.kind = propValues.kind || 'europe';
    res.lx.mode = propValues.mode || 'default';
    res.lx.selectionKind = propValues.selectionKind || 'multiple';
    res.lx.labelId = propValues.labelId;
    res.lx.texts = propValues.texts;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxDayInput') {
    res.type = 'integer';
    res.lx = res.lx || {};
    res.lx.disabled = propValues.disabled || false;
    res.lx.kind = propValues.kind || 'label';
    res.lx.labelId = propValues.labelId;
    res.lx.texts = propValues.texts;
    res.readOnly = propValues.readOnly || false;
  } else if (component === 'LxDrawPad') {
    res.type = 'string';
    res.lx = res.lx || {};
    res.lx.disabled = propValues.disabled ?? false;
    res.lx.width = propValues.width || '500';
    res.lx.height = propValues.height || '400';
    res.lx.instrument = propValues.instrument || 'brush';
    res.lx.color = propValues.color || 'black';
    res.lx.showInstruments = propValues.showInstruments ?? false;
    res.lx.showColorPicker = propValues.showColorPicker ?? false;
    res.lx.showClearAll = propValues.showClearAll ?? false;
    res.lx.labelId = propValues.labelId;
    res.lx.texts = propValues.texts;
    res.readOnly = propValues.readOnly ?? false;
  } else if (component === 'LxMarkdownTextArea') {
    res.type = 'string';
    res.lx = res.lx || {};
    res.lx.placeholder = propValues.placeholder;
    res.lx.rows = propValues.rows;
    res.maxLength = propValues.maxlength;
    res.lx.disabled = propValues.disabled ?? false;
    res.lx.showColorPicker = propValues.showColorPicker ?? false;
    res.lx.showLinkEditor = propValues.showLinkEditor ?? true;
    res.lx.tooltip = propValues.tooltip;
    res.lx.showPlaceholderPicker = propValues.showPlaceholderPicker ?? false;
    res.lx.showImagePicker = propValues.showImagePicker ?? false;
    res.lx.showUnderlineToggle = propValues.showUnderlineToggle ?? false;
    res.lx.showHeadingPicker = propValues.showHeadingPicker ?? false;
    res.lx.imageMaxSize = propValues.imageMaxSize ?? 3000000;
    res.lx.dictionary = propValues.dictionary;
    res.lx.labelId = propValues.labelId;
    res.lx.texts = propValues.texts;
    res.readOnly = propValues.readOnly ?? false;
  } else if (component === 'LxSection') {
    res.type = 'object';
    res.lx = res.lx || {};
    res.properties = res.properties || {};
    res.title = propValues.label;
    res.description = propValues.description;
    res.lx.columnCount = Number(propValues.columnCount) || 1;
    res.lx.requiredMode = propValues.requiredMode || 'none';
    res.lx.icon = propValues.icon;
    res.lx.iconSet = propValues.iconSet || 'cds';
    res.lx.customClass = propValues.customClass;
    res.lx.badge = propValues.badge;
    res.lx.actionDefinitions = propValues.actionDefinitions;
    res.lx.orientation = propValues.orientation;
  } else if (component === 'LxForm') {
    res.type = 'object';
    res.lx = res.lx || {};
    res.properties = res.properties || {};
    res.lx.columnCount = Number(propValues.columnCount) || 1;
    res.lx.showHeader = propValues.showHeader ?? true;
    res.lx.stickyHeader = propValues.stickyHeader ?? true;
    res.lx.showFooter = propValues.showFooter ?? true;
    res.lx.stickyFooter = propValues.stickyFooter ?? true;
    res.lx.showPreHeaderInfo = propValues.showPreHeaderInfo ?? true;
    res.lx.showPostHeaderInfo = propValues.showPostHeaderInfo ?? true;
    res.lx.index = propValues.index;
    res.lx.indexType = propValues.indexType || 'none';
    res.lx.requiredMode = propValues.requiredMode || 'none';
    res.lx.kind = propValues.kind || 'default';
    res.lx.orientation = propValues.orientation || 'vertical';
    res.lx.hasSkipLink = propValues.hasSkipLink || false;
    res.lx.actionDefinitions = propValues.actionDefinitions;
    res.lx.texts = propValues.texts;
  } else if (component === 'LxFilters') {
    res.type = 'object';
    res.lx = res.lx || {};
    res.properties = res.properties || {};
    res.title = propValues.label;
    res.description = propValues.description;
    res.lx.defaultValues = propValues.defaultValues || {};
    res.lx.useDefaults = propValues.useDefaults || false;
    res.lx.usesFilters = propValues.usesFilters || false;
    res.lx.filterButtonKind = propValues.filterButtonKind || 'tertiary';
    res.lx.columnCount = propValues.columnCount || 3;
    res.lx.expanded = propValues.expanded || false;
    res.lx.disabled = propValues.disabled || false;
    res.lx.fastFilters = propValues.fastFilters || [];
    res.lx.fastIdAttribute = propValues.fastIdAttribute || 'id';
    res.lx.fastNameAttribute = propValues.fastNameAttribute || 'name';
    res.lx.badge = propValues.badge;
    res.lx.badgeType = propValues.badgeType || 'default';
    res.lx.texts = propValues.texts;
  }

  return res;
}

// Watch props, and change schema accordingly
watch(
  () => props.componentProps,
  (newVal) => {
    const res = propsToSchema(props.componentName, newVal);

    if (props.componentName === 'LxViewLayout') {
      emits('update:viewLayout', newVal?.kind);
    } else emits('update:componentModel', res);
  },
  { deep: true }
);

const componentPropsModel = computed({
  get() {
    return props.componentProps;
  },
  set(value) {
    emits('update:componentProps', value);
  },
});

const navigation = computed(() => {
  if (props.componentName) {
    const nav = props.navigation.map((item, idx, arr) => {
      if (idx === arr.length - 1) {
        return { ...item, active: true };
      }
      return item;
    });
    return nav;
  }
  return [];
});

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

const propSearchModel = ref(null);

function isDeletable() {
  return props.componentName && props.componentName !== 'LxViewLayout';
}

function isDuplicatable() {
  return (
    props.componentName &&
    props.componentName !== 'LxViewLayout' &&
    props.componentName !== 'LxFilters'
  );
}
</script>
<template>
  <div class="lx-panel">
    <div class="button-side">
      <LxButton
        :icon="open ? 'close-panel' : 'open-panel'"
        variant="icon-only"
        :label="open ? displayTexts?.closePanel : displayTexts?.openPanel"
        kind="secondary"
        @click="togglePanel(open)"
      />

      <LxButton
        icon="config"
        variant="icon-only"
        :label="displayTexts?.config"
        kind="secondary"
        :active="open && tab === 'config'"
        @click="(tab = 'config'), (open = true)"
      />

      <LxButton
        icon="components"
        variant="icon-only"
        :label="displayTexts?.components"
        kind="secondary"
        :active="open && tab === 'components'"
        @click="(tab = 'components'), (open = true)"
      />

      <LxButton
        icon="settings"
        variant="icon-only"
        :label="displayTexts?.settings"
        kind="secondary"
        :active="open && tab === 'settings'"
        @click="(tab = 'settings'), (open = true)"
      />
    </div>
    <div class="panel-side" v-if="open">
      <div>
        <div
          class="config-header"
          :class="[{ 'has-selected-element': componentName && tab === 'config' }]"
        >
          <LxDropDownMenu
            v-if="tab === 'config'"
            :actionDefinitions="navigation"
            @actionClick="changeNavigationItem"
          >
            <div class="header-wrapper">
              <template v-if="componentName">
                <p>{{ componentName }}</p>
                <LxIcon value="menu" />
              </template>
            </div>
          </LxDropDownMenu>
          <div v-else class="header-wrapper">
            <p v-if="tab === 'components'">{{ displayTexts?.components }}</p>
            <p v-else-if="tab === 'settings'">{{ displayTexts?.settings }}</p>
            <p v-else>{{ displayTexts?.actionPanel }}</p>
          </div>
        </div>

        <div class="panel-main" v-if="tab === 'config'">
          <div class="button-group">
            <LxButton
              icon="copy"
              kind="secondary"
              :label="displayTexts?.duplicate"
              :disabled="!isDuplicatable()"
              @click="emits('duplicateComponent')"
            />

            <LxButton
              icon="delete"
              kind="secondary"
              :label="displayTexts?.delete"
              :disabled="!isDeletable()"
              :destructive="true"
              @click="emits('removeComponent')"
            />
          </div>

          <LxTextInput
            v-model="propSearchModel"
            kind="search"
            :placeholder="displayTexts?.searchProps"
            :disabled="!componentName"
            class="prop-search"
          />

          <ConstructorPropRenderer
            v-if="componentName"
            v-model="componentPropsModel"
            :componentName="componentName"
            :componentPropsDefinitions="componentPropsDefinitions"
            :searchString="propSearchModel"
            v-model:componentModel="compModel"
            v-model:schemaKey="schemaKeyModel"
            :schemaKeyError="schemaKeyError"
            :navigation="navigation"
            :texts="displayTexts"
          />
          <div v-else class="no-component-wrapper">
            <LxEmptyState :label="displayTexts?.noComponentSelected" />
          </div>
        </div>
        <div v-if="tab === 'components'" class="panel-main lx-region" style="padding: 0.25rem">
          <LxList
            listType="1"
            :hasSearch="true"
            :items="componentItems"
            :groupDefinitions="usageGroupDefinitions"
            groupAttribute="usageGroup"
            :hideFilteredItems="true"
            icon="add"
            :texts="{
              placeholder: displayTexts?.searchComponents,
              clear: displayTexts?.clear,
              noItems: displayTexts?.noItems,
              notFoundSearch: displayTexts?.notFoundSearch,
            }"
            @actionClick="(_, id) => emits('componentAdd', id)"
          />
        </div>
        <div v-if="tab === 'settings'">
          <div class="settings-wrapper">
            <LxButton
              kind="secondary"
              :label="displayTexts?.import"
              icon="upload"
              @click="emits('import')"
            />
            <LxButton
              kind="secondary"
              :label="displayTexts?.export"
              icon="save"
              @click="emits('export')"
            />
            <LxButton
              kind="secondary"
              :label="displayTexts?.editSchema"
              icon="edit"
              @click="emits('editSchema')"
            />
            <LxButton
              kind="secondary"
              :label="displayTexts?.editModel"
              icon="editItem"
              @click="emits('editModel')"
            />
            <LxButton
              kind="secondary"
              :label="displayTexts?.reportIssue"
              icon="bug"
              @click="emits('reportIssue')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
