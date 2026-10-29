<script setup>
import { resolveListModelPath } from '@/utils/builderUtils';
import {
  LxFlag,
  LxStateDisplay,
  LxPersonDisplay,
  LxIcon,
  lxFormatUtils,
  lxStringUtils,
  lxBuilderUtils,
} from '@dativa-lv/lx-ui';

import { computed, getCurrentInstance, onUnmounted } from 'vue';

const props = defineProps({
  id: { type: String, default: () => lxStringUtils.generateUUID() },
  item: { type: Object, default: () => ({}) },
  itemValue: { type: Object, default: () => ({}) },
  itemName: { type: String, default: '' },
  useStyles: { type: Boolean, default: false },
  row: { type: Object, default: null },
  listPath: { type: String, default: null },
  builderOptions: { type: Object, default: () => ({}) },
});

const source = computed(() => {
  const modelPath = props.itemValue?.lx?.modelPath;
  if (!props.row || !modelPath) return props.item;

  return { [props.itemName]: resolveListModelPath(modelPath, props.row, props.listPath) };
});

function getElementStyles(item) {
  let res = '';
  if (item?.lx?.stackRow) {
    res += `grid-row: ${item?.lx?.stackRow};`;
  }
  if (item?.lx?.stackColumn) {
    res += `grid-column: ${item?.lx?.stackColumn};`;
  }
  return res;
}

function getType(itemValue) {
  if (itemValue?.type === 'boolean') {
    return 'bool';
  }
  if (itemValue?.type === 'array') {
    return 'array';
  }
  if (itemValue?.type === 'string' && itemValue?.format === 'date') {
    return 'date';
  }
  if (
    itemValue?.type === 'string' &&
    (itemValue?.format === 'dateTime' || itemValue?.format === 'date-time')
  ) {
    return 'dateTime';
  }
  return 'default';
}

function listDisplayText(itemValue, item, itemName) {
  return lxFormatUtils.formatValue(
    item?.[itemName] || itemValue?.lx?.value,
    getType(itemValue),
    itemValue?.lx?.texts
      ? { yes: itemValue?.lx?.texts?.valueYes, no: itemValue?.lx?.texts?.valueNo }
      : undefined
  );
}

function isNotComponent(itemValue) {
  return !['icon', 'flag', 'stateDisplay', 'personDisplay'].includes(itemValue?.lx?.displayType);
}

function getDisplayType(itemValue) {
  const translations = {
    primaryText: 'PrimaryText',
    secondaryText: 'SecondaryText',
  };
  return translations?.[itemValue?.lx?.displayType] || 'Text';
}

if (props.builderOptions?.useRegistry && isNotComponent(props.itemValue)) {
  const instance = getCurrentInstance();
  // Adds default texts to ensure they are available in the builder instance
  lxBuilderUtils.registerBuilderInstance({
    name: getDisplayType(props.itemValue),
    instance,
    props,
    builderName: props.builderOptions?.schemaPath,
    componentStack: props.builderOptions?.componentStack?.concat([
      { id: props?.id, name: getDisplayType(props.itemValue) },
    ]),
    customItemPath: props.builderOptions?.customItemPath,
  });

  onUnmounted(() => {
    lxBuilderUtils.unregisterBuilderInstance(props?.id);
  });
}
</script>
<template>
  <p
    :data-id="id"
    class="lx-primary"
    v-if="itemValue?.lx?.displayType === 'primaryText'"
    :style="useStyles ? getElementStyles(itemValue) : null"
  >
    {{ listDisplayText(itemValue, source, itemName) }}
  </p>
  <p
    :data-id="id"
    class="lx-secondary"
    v-else-if="itemValue?.lx?.displayType === 'secondaryText'"
    :style="useStyles ? getElementStyles(itemValue) : null"
  >
    {{ listDisplayText(itemValue, source, itemName) }}
  </p>

  <LxFlag
    v-else-if="itemValue?.lx?.displayType === 'flag'"
    :value="source?.[itemName]?.value || source?.[itemName] || itemValue?.lx?.value"
    :size="source?.[itemName]?.size || itemValue?.lx?.size"
    :title="source?.[itemName]?.title || itemValue?.lx?.title"
    :style="useStyles ? getElementStyles(itemValue) : null"
    :builderOptions="builderOptions"
  />

  <LxStateDisplay
    v-else-if="itemValue?.lx?.displayType === 'stateDisplay'"
    :value="source?.[itemName]?.value || source?.[itemName] || itemValue?.lx?.value"
    :dictionary="source?.[itemName]?.dictionary || itemValue?.lx?.dictionary"
    :style="useStyles ? getElementStyles(itemValue) : null"
    :builderOptions="builderOptions"
  />

  <LxPersonDisplay
    v-else-if="itemValue?.lx?.displayType === 'personDisplay'"
    :value="source?.[itemName]?.value || source?.[itemName] || itemValue?.lx?.value"
    :name="source?.[itemName]?.name || itemValue?.lx?.name"
    :kind="source?.[itemName]?.kind || itemValue?.lx?.kind"
    :size="source?.[itemName]?.size || itemValue?.lx?.size"
    :variant="source?.[itemName]?.variant || itemValue?.lx?.variant"
    :description="source?.[itemName]?.description || itemValue?.lx?.description"
    :role="source?.[itemName]?.role || itemValue?.lx?.role"
    :institution="source?.[itemName]?.institution || itemValue?.lx?.institution"
    :icon="source?.[itemName]?.icon || itemValue?.lx?.icon"
    :iconSet="source?.[itemName]?.iconSet || itemValue?.lx?.iconSet"
    :idAttribute="source?.[itemName]?.idAttribute || itemValue?.lx?.idAttribute"
    :nameAttribute="source?.[itemName]?.nameAttribute || itemValue?.lx?.nameAttribute"
    :firstNameAttribute="
      source?.[itemName]?.firstNameAttribute || itemValue?.lx?.firstNameAttribute
    "
    :lastNameAttribute="source?.[itemName]?.lastNameAttribute || itemValue?.lx?.lastNameAttribute"
    :descriptionAttribute="
      source?.[itemName]?.descriptionAttribute || itemValue?.lx?.descriptionAttribute
    "
    :roleAttribute="source?.[itemName]?.roleAttribute || itemValue?.lx?.roleAttribute"
    :institutionAttribute="
      source?.[itemName]?.institutionAttribute || itemValue?.lx?.institutionAttribute
    "
    :iconAttribute="source?.[itemName]?.iconAttribute || itemValue?.lx?.iconAttribute"
    :iconSetAttribute="source?.[itemName]?.iconSetAttribute || itemValue?.lx?.iconSetAttribute"
    :maxLength="source?.[itemName]?.maxLength || itemValue?.lx?.maxLength"
    :texts="source?.[itemName]?.texts || itemValue?.lx?.texts"
    :style="useStyles ? getElementStyles(itemValue) : null"
    :builderOptions="builderOptions"
  />

  <LxIcon
    v-else-if="itemValue?.lx?.displayType === 'icon'"
    :value="source?.[itemName]?.value || source?.[itemName] || itemValue?.lx?.value"
    :iconSet="source?.[itemName]?.iconSet || itemValue?.lx?.iconSet"
    :variant="source?.[itemName]?.variant || itemValue?.lx?.variant"
    :customClass="source?.[itemName]?.customClass || itemValue?.lx?.customClass"
    :animation="source?.[itemName]?.animation || itemValue?.lx?.animation"
    :meaningful="source?.[itemName]?.meaningful || itemValue?.lx?.meaningful"
    :title="source?.[itemName]?.title || itemValue?.lx?.title"
    :desc="source?.[itemName]?.desc || itemValue?.lx?.desc"
    :texts="source?.[itemName]?.texts || itemValue?.lx?.texts"
    :style="useStyles ? getElementStyles(itemValue) : null"
    :builderOptions="builderOptions"
  />
  <p v-else :data-id="id" :style="useStyles ? getElementStyles(itemValue) : null">
    {{ listDisplayText(itemValue, source, itemName) }}
  </p>
</template>
