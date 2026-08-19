<script setup>
import { computed } from 'vue';
import { lxIconUtils, LxAutoComplete, LxIcon } from '@dativa-lv/lx-ui';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  iconSet: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => {
    emits('update:modelValue', value);
  },
});

function getAvailableIconsByIconSet(iconSet = 'cds') {
  return lxIconUtils.getAvailableIcons(iconSet || 'cds')?.map((i) => ({ id: i, name: i }));
}
</script>

<template>
  <LxAutoComplete v-model="model" :items="getAvailableIconsByIconSet(iconSet)">
    <template #customItem="iconItem">
      <div class="custom-auto-complete-item-with-icon lx-item-display">
        <LxIcon :value="iconItem.name" :iconSet="iconSet || 'cds'" />
        <p>{{ iconItem.name }}</p>
      </div>
    </template>
  </LxAutoComplete>
</template>
