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
  editing: 'Labošana',
  searchText: 'Meklēt',
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

const COMPONENT_SCHEMA_BUILDERS = {
  LxTextInput: (res, p) => {
    res.type = 'string';
    res.maxLength = p.maxlength;
    res.lx.mask = p.mask || 'default';
    res.lx.kind = p.kind || 'default';
    res.lx.scale = p.scale;
    res.lx.tooltip = p.tooltip;
    res.lx.disabled = p.disabled || false;
    res.lx.uppercase = p.uppercase || false;
    res.lx.convertToString = p.convertToString || false;
    res.lx.placeholder = p.placeholder;
    res.lx.signed = p.signed || false;
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly || false;
  },
  LxToggle: (res, p) => {
    res.type = 'boolean';
    res.lx.size = p.size || 'm';
    res.lx.disabled = p.disabled || false;
    res.lx.tooltip = p.tooltip;
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly || false;
  },
  LxValuePicker: (res, p) => {
    res.type = p.selectionKind === 'multiple' ? 'array' : 'string';
    res.lx.items = p.items || [];
    res.lx.idAttribute = p.idAttribute;
    res.lx.nameAttribute = p.nameAttribute;
    res.lx.iconAttribute = p.iconAttribute;
    res.lx.iconSetAttribute = p.iconSetAttribute;
    res.lx.categoryAttribute = p.categoryAttribute;
    res.lx.descriptionAttribute = p.descriptionAttribute;
    res.lx.variant = p.variant;
    res.lx.hasSearch = p.hasSearch || false;
    res.lx.alwaysAsArray = p.alwaysAsArray || false;
    res.lx.nullable = p.nullable || false;
    res.lx.tooltip = p.tooltip;
    res.lx.texts = p.texts || {};
    res.lx.placeholder = p.placeholder;
    res.lx.disabled = p.disabled || false;
    res.readOnly = p.readOnly || false;
    res.lx.searchAttributes = p.searchAttributes;
    res.lx.hasSelectAll = p.hasSelectAll || false;
    res.lx.stickyToolbar = p.stickyToolbar || false;
    res.lx.readOnlyRenderType = p.readOnlyRenderType || 'row';
    res.lx.texts = p.texts || {};
  },
  LxRow: (res, p) => {
    res.title = p.label;
    res.lx.columnSpan = p.columnSpan || '1';
    res.lx.rowSpan = p.rowSpan || '1';
    res.lx.rowActionDefinitions = p.rowActionDefinitions;
  },
  LxTextArea: (res, p) => {
    res.type = 'string';
    res.maxLength = p.maxlength;
    res.lx.kind = 'multiline';
    res.lx.placeholder = p.placeholder;
    res.lx.rows = p.rows || 3;
    res.lx.disabled = p.disabled || false;
    res.lx.dynamicHeight = p.dynamicHeight || false;
    res.lx.tooltip = p.tooltip;
    res.lx.texts = p.texts || {};
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
    res.readOnly = p.readOnly || false;
  },
  LxDateTimePicker: (res, p) => {
    res.type = 'string';
    res.format = p.kind || 'date';
    res.lx.placeholder = p.placeholder;
    res.lx.tooltip = p.tooltip;
    res.lx.minDate = p.minDate;
    res.lx.maxDate = p.maxDate;
    res.lx.required = p.required || false;
    res.lx.disabled = p.disabled || false;
    res.lx.timeAdjust = p.timeAdjust;
    res.lx.clearIfNotExact = p.clearIfNotExact || false;
    res.lx.texts = p.texts;
    res.lx.locale = p.locale;
    res.lx.specialDates = p.specialDates;
    res.lx.dictionary = p.dictionary;
    res.lx.variant = p.variant || 'default';
    res.lx.cadenceOfMinutes = p.cadenceOfMinutes ? Number(p.cadenceOfMinutes) : 1;
    res.lx.cadenceOfSeconds = p.cadenceOfSeconds ? Number(p.cadenceOfSeconds) : 1;
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly || false;
  },
  LxAutoComplete: (res, p) => {
    res.type = p.selectionKind === 'multiple' ? 'array' : 'string';
    res.lx.items = p.items || [];
    res.lx.idAttribute = p.idAttribute || 'id';
    res.lx.nameAttribute = p.nameAttribute || 'name';
    res.lx.dictionary = p.dictionary;
    res.lx.groupId = p.groupId;
    res.lx.queryMinLength = p.queryMinLength || 0;
    res.lx.queryMaxLength = p.queryMaxLength;
    res.lx.queryDebounce = p.queryDebounce || 200;
    res.lx.placeholder = p.placeholder;
    res.lx.tooltip = p.tooltip;
    res.lx.disabled = p.disabled || false;
    res.lx.loading = p.loading || false;
    res.lx.hasDetails = p.hasDetails || false;
    res.lx.selectionKind = p.selectionKind || 'single';
    res.lx.preloadedItems = p.preloadedItems;
    res.lx.labelId = p.labelId;
    res.lx.hasSelectAll = p.hasSelectAll || false;
    res.lx.enableAdditionalText = p.enableAdditionalText || false;
    res.lx.texts = p.texts || {};
    res.lx.searchAttributes = p.searchAttributes;
    res.readOnly = p.readOnly || false;
  },
  LxCamera: (res, p) => {
    res.type = 'string';
    res.lx.cameraSwitcherMode = p.cameraSwitcherMode || 'toggle';
    res.lx.hasFlashlightToggle = p.hasFlashlightToggle || false;
    res.lx.imageSize = p.imageSize || 'default';
    res.lx.preferencesId = p.preferencesId || 'lx-camera-settings';
    res.lx.stickyToolbar = p.stickyToolbar || false;
    res.lx.actionDefinitions = p.actionDefinitions;
    res.lx.labelId = p.labelId;
    res.lx.texts = p.texts || {};
  },
  LxCheckbox: (res, p) => {
    res.type = 'boolean';
    res.lx.groupId = p.groupId;
    res.lx.label = p.label;
    res.lx.disabled = p.disabled || false;
    res.lx.value = p.value || 'none';
    res.lx.tabindex = p.tabindex || '0';
    res.lx.labelId = p.labelId;
  },
  LxContentSwitcher: (res, p) => {
    res.type = 'string';
    res.lx.items = p.items;
    res.lx.idAttribute = p.idAttribute || 'id';
    res.lx.nameAttribute = p.nameAttribute || 'name';
    res.lx.disabled = p.disabled || false;
    res.lx.kind = p.kind || 'default';
    res.lx.icon = p.icon;
    res.lx.iconSet = p.iconSet;
    res.lx.tooltip = p.tooltip;
    res.lx.labelId = p.labelId;
    res.readOnly = p.readOnly || false;
  },
  LxDateTimeRange: (res, p) => {
    res.type = 'object';
    res.format = p.kind || 'date';
    res.lx.placeholder = p.placeholder;
    res.lx.tooltip = p.tooltip;
    res.lx.minDate = p.minDate;
    res.lx.maxDate = p.maxDate;
    res.lx.required = p.required || false;
    res.lx.disabled = p.disabled || false;
    res.lx.timeAdjust = p.timeAdjust;
    res.lx.locale = p.locale;
    res.lx.rangeMonths = p.rangeMonths || 'next';
    res.lx.clearIfNotExact = p.clearIfNotExact || false;
    res.lx.labelId = p.labelId;
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly || false;
  },
  LxFileUploader: (res, p) => {
    res.type = 'array';
    res.lx.selectionKind = p.selectionKind || 'single';
    res.lx.mode = p.mode || 'default';
    res.lx.draggable = p.draggable || false;
    res.lx.dataType = p.dataType || 'meta';
    res.lx.hasSearch = p.hasSearch || false;
    res.lx.disabled = p.disabled || false;
    res.lx.loading = p.loading || false;
    res.lx.busy = p.busy || false;
    res.lx.allowedFileExtensions = p.allowedFileExtensions || [];
    res.lx.maxFileSize = p.maxFileSize || 30000000;
    res.lx.hasDownloadButton = p.hasDownloadButton || false;
    res.lx.showMeta = p.showMeta ?? true;
    res.lx.maxSizeForMeta = p.maxSizeForMeta || 30000000;
    res.lx.hasCamera = p.hasCamera || false;
    res.lx.cameraSwitcherMode = p.cameraSwitcherMode || 'toggle';
    res.lx.hasFlashlightToggle = p.hasFlashlightToggle || false;
    res.lx.imageSize = p.imageSize || 'default';
    res.lx.preferencesId = p.preferencesId || 'lx-camera-settings';
    res.lx.labelId = p.labelId;
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly || false;
  },
  LxNumberSlider: (res, p) => {
    res.type = 'integer';
    res.lx.min = p.min || 0;
    res.lx.max = p.max || 9999;
    res.lx.step = p.step || 1;
    res.lx.stepMultiplier = p.stepMultiplier || 5;
    res.lx.hasInput = p.hasInput || false;
    res.lx.labelId = p.labelId;
    res.lx.disabled = p.disabled || false;
    res.lx.kind = p.kind || 'slider';
    res.readOnly = p.readOnly || false;
  },
  LxQrScanner: (res, p) => {
    res.type = 'object';
    res.lx.formats = p.formats || ['qr_code'];
    res.lx.hasFileUploader = p.hasFileUploader ?? true;
    res.lx.selectionKind = p.selectionKind || 'single';
    res.lx.cameraSwitcherMode = p.cameraSwitcherMode || 'list';
    res.lx.hasFlashlightToggle = p.hasFlashlightToggle || false;
    res.lx.showAlerts = p.showAlerts ?? true;
    res.lx.stickyToolbar = p.stickyToolbar ?? false;
    res.lx.actionDefinitions = p.actionDefinitions;
    res.lx.labelId = p.labelId;
    res.lx.texts = p.texts || {};
  },
  LxVisualPicker: (res, p) => {
    res.type = p.selectionKind === 'multiple' ? 'array' : 'string';
    res.lx.kind = p.kind || 'europe';
    res.lx.mode = p.mode || 'default';
    res.lx.selectionKind = p.selectionKind || 'multiple';
    res.lx.labelId = p.labelId;
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly || false;
  },
  LxDayInput: (res, p) => {
    res.type = 'integer';
    res.lx.disabled = p.disabled || false;
    res.lx.kind = p.kind || 'label';
    res.lx.variant = p.variant || 'default';
    res.lx.labelId = p.labelId;
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly || false;
  },
  LxDrawPad: (res, p) => {
    res.type = 'string';
    res.lx.disabled = p.disabled ?? false;
    res.lx.width = p.width || '500';
    res.lx.height = p.height || '400';
    res.lx.instrument = p.instrument || 'brush';
    res.lx.color = p.color || 'black';
    res.lx.showInstruments = p.showInstruments ?? false;
    res.lx.showColorPicker = p.showColorPicker ?? false;
    res.lx.showClearAll = p.showClearAll ?? false;
    res.lx.labelId = p.labelId;
    res.lx.stickyToolbar = p.stickyToolbar ?? false;
    res.lx.actionDefinitions = p.actionDefinitions;
    res.lx.texts = p.texts;
    res.readOnly = p.readOnly ?? false;
  },
  LxMarkdownTextArea: (res, p) => {
    res.type = 'string';
    res.lx.placeholder = p.placeholder;
    res.lx.rows = p.rows;
    res.maxLength = p.maxlength;
    res.lx.disabled = p.disabled ?? false;
    res.lx.showColorPicker = p.showColorPicker ?? false;
    res.lx.showLinkEditor = p.showLinkEditor ?? true;
    res.lx.tooltip = p.tooltip;
    res.lx.showPlaceholderPicker = p.showPlaceholderPicker ?? false;
    res.lx.showImagePicker = p.showImagePicker ?? false;
    res.lx.showUnderlineToggle = p.showUnderlineToggle ?? false;
    res.lx.showHeadingPicker = p.showHeadingPicker ?? false;
    res.lx.imageMaxSize = p.imageMaxSize ?? 3000000;
    res.lx.dictionary = p.dictionary;
    res.lx.labelId = p.labelId;
    res.lx.stickyToolbar = p.stickyToolbar ?? false;
    res.lx.actionDefinitions = p.actionDefinitions;
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly ?? false;
  },
  LxSection: (res, p) => {
    res.type = 'object';
    res.properties = res.properties || {};
    res.title = p.label;
    res.description = p.description;
    res.lx.columnCount = Number(p.columnCount) || 1;
    res.lx.requiredMode = p.requiredMode || 'none';
    res.lx.icon = p.icon;
    res.lx.iconSet = p.iconSet || 'cds';
    res.lx.customClass = p.customClass;
    res.lx.badge = p.badge;
    res.lx.actionDefinitions = p.actionDefinitions;
    res.lx.orientation = p.orientation;
    res.lx.texts = p.texts || {};
  },
  LxForm: (res, p) => {
    res.type = 'object';
    res.properties = res.properties || {};
    res.lx.columnCount = Number(p.columnCount) || 1;
    res.lx.showHeader = p.showHeader ?? true;
    res.lx.stickyHeader = p.stickyHeader ?? true;
    res.lx.showFooter = p.showFooter ?? true;
    res.lx.stickyFooter = p.stickyFooter ?? true;
    res.lx.showPreHeaderInfo = p.showPreHeaderInfo ?? true;
    res.lx.showPostHeaderInfo = p.showPostHeaderInfo ?? true;
    res.lx.index = p.index;
    res.lx.indexType = p.indexType || 'none';
    res.lx.requiredMode = p.requiredMode || 'none';
    res.lx.kind = p.kind || 'default';
    res.lx.orientation = p.orientation || 'vertical';
    res.lx.hasSkipLink = p.hasSkipLink || false;
    res.lx.actionDefinitions = p.actionDefinitions;
    res.lx.texts = p.texts || {};
  },
  LxFilters: (res, p) => {
    res.type = 'object';
    res.properties = res.properties || {};
    res.title = p.label;
    res.description = p.description;
    res.lx.defaultValues = p.defaultValues || {};
    res.lx.useDefaults = p.useDefaults || false;
    res.lx.usesFilters = p.usesFilters || false;
    res.lx.filterButtonKind = p.filterButtonKind || 'tertiary';
    res.lx.columnCount = p.columnCount || 3;
    res.lx.expanded = p.expanded || false;
    res.lx.disabled = p.disabled || false;
    res.lx.fastFilters = p.fastFilters || [];
    res.lx.fastIdAttribute = p.fastIdAttribute || 'id';
    res.lx.fastNameAttribute = p.fastNameAttribute || 'name';
    res.lx.badge = p.badge;
    res.lx.badgeType = p.badgeType || 'default';
    res.lx.texts = p.texts || {};
  },
};

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

  const builder = COMPONENT_SCHEMA_BUILDERS[component];
  if (builder) {
    res.lx = res.lx || {};
    builder(res, propValues);
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
