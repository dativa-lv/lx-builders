<script setup>
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
  LxChat,
  LxInfoBox,
} from '@dativa-lv/lx-ui';

import { useDebounceFn } from '@vueuse/core';
import {
  getDisplayComponents,
  getLXComponents,
  COMPONENT_SCHEMA_BUILDERS,
} from '@/utils/constructorUtils';
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
  selectedModel: {
    type: [Object, Array, String, Number, Boolean],
    default: null,
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
  templateMode: {
    type: Boolean,
    default: false,
  },
  hasAiChat: {
    type: Boolean,
    default: false,
  },
  chatItems: {
    type: Array,
    default: () => [],
  },
  chatBusy: {
    type: Boolean,
    default: false,
  },
  chatLoading: {
    type: Boolean,
    default: false,
  },
  chatUserDefinitions: {
    type: Array,
    default: () => [],
  },
  chatTyping: {
    type: Boolean,
    default: false,
  },
  chatTypingUsers: {
    type: Array,
    default: () => [],
  },
  chatHasUndoChange: {
    type: Boolean,
    default: false,
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
  lists: 'Saraksti',
  close: 'Aizvērt',
  edit: 'Labot',
  editing: 'Labošana',
  searchText: 'Meklēt',
  invalidArrayOfObjects: 'Nederīgs JSON objekts. Ievadiet masīvu ar objektiem',
  removeItem: 'Dzēst ierakstu',
  removeItemHint: 'Nospiediet Delete, lai noņemtu ierakstu',
  addItemButtonTooltip: 'Pievienot ierakstu',
  addButtonLabel: 'Pievienot ierakstu',
  showAllFields: 'Rādīt visus laukus',
  ai: 'Ģenerēt ar MI',
  undo: 'Atcelt veiktās izmaiņas',
  templateEditLabel: 'Struktūras labošana',
  templateEditDescription: 'Izmaiņas tiks piemērotas visiem saraksta elementiem',
  row: 'Rinda',
  column: 'Kolonna',
  autoSize: 'Automātisks izmērs (auto)',
  sizeRatio: 'Izmēra proporcija',
  modelPathAttributeError: 'Atribūts nedrīkst būt tukšs un saturēt punktus vai atstarpes',
  validations: {
    required: 'Lauks ir obligāts',
    unique: 'Vērtībai jābūt unikālai',
  },
  chat: {
    placeholder: 'Rakstīt ziņu',
    empty: 'Sarakstē vēl nav ziņu',
    emptyDescription: 'Nosūtiet pirmo ziņu, lai sāktu sarunu',
    send: 'Sūtīt',
    error: 'Kļūda!',
    ai: 'Mākslīgais intelekts',
    scrollToBottom: 'Atgriezties pie jaunākajām ziņām',
    statusTextSingular: 'domā',
    statusTextPlural: 'domā',
    and: 'un',
    messageTimeLabel: 'Ziņas laiks',
  },
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
  'update:selectedModel',
  'error',
  'send',
  'messageActionClick',
  'update:templateMode',
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
  {
    id: 'lists',
    name: displayTexts.value?.lists,
    badgeTitle: displayTexts.value?.lists,
    expanded: true,
  },
]);

const lxComponents = ref(getLXComponents());
const displayComponents = ref(getDisplayComponents());

const isInsideCustomItemMode = computed(() => props.schemaInfo.isInsideCustomItemsList);

// Can only add LxSection if:
// It's plain LxForm, or it's LxForm inside LxFilters, but has no LxSection yet
function canAddLxSection() {
  return props.componentName === 'LxForm' && !props.schemaInfo?.isSectionInFilterForm;
}

function isInsideComponent(component) {
  return props.navigation?.some(
    (nav) => typeof nav === 'object' && nav !== null && 'name' in nav && nav.name === component
  );
}

function isSelectedComponent(component) {
  return props.componentName === component;
}

function canAddLxList() {
  if (isInsideComponent('LxFilters') && !isSelectedComponent('LxFilters')) {
    return false;
  }

  return props.componentName !== 'LxForm';
}

function canAddLxDataGrid() {
  if (isInsideComponent('LxFilters') && !isSelectedComponent('LxFilters')) {
    return false;
  }

  if (
    isInsideComponent('LxForm') &&
    !isSelectedComponent('LxForm') &&
    !isSelectedComponent('LxSection')
  ) {
    return false;
  }

  if (isInsideComponent('LxForm')) {
    return false;
  }

  return true;
}

function canAddStack() {
  return props.navigation.filter((x) => x.name === 'LxStack')?.length < 2;
}

const componentItems = computed(() => {
  if (!props.componentName) return [];
  // if LxList in template mode or user is changing custom item, show display components
  if (props.templateMode && (props.componentName === 'LxList' || isInsideCustomItemMode.value)) {
    return displayComponents.value
      .map((x) => ({
        ...x,
        clickable: x.id !== 'LxStack' || canAddStack(),
      }))
      .filter((x) => x.clickable !== false);
  }
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
    },
    {
      id: 'LxList',
      name: 'LxList',
      usageGroup: 'lists',
      clickable: canAddLxList(),
    },
    {
      id: 'LxDataGrid',
      name: 'LxDataGrid',
      usageGroup: 'lists',
      clickable: canAddLxDataGrid(),
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

const chatItemsDisplay = computed(() => {
  const items = [...props.chatItems];
  const lastAiIndex = items.findLastIndex((item) => item.userId === 'ai');

  if (lastAiIndex !== -1) {
    items[lastAiIndex] = { ...items[lastAiIndex], hasUndoLastChange: props.chatHasUndoChange };
  }

  return items;
});

const templateModeModel = computed({
  get: () => props.templateMode,
  set: (value) => {
    emits('update:templateMode', value);
  },
});

function toggleTemplateMode(newValue) {
  templateModeModel.value = newValue;
  // When turning off template edit mode, select LxList element
  if (!newValue) {
    const res = props.navigation?.find((x) => x?.name === 'LxList')?.id;
    if (res) changeNavigationItem(res);
  }
}
</script>
<template>
  <div class="lx-panel">
    <div class="button-side">
      <div class="button-group">
        <LxButton
          :icon="open ? 'close-panel' : 'open-panel'"
          variant="icon-only"
          :label="open ? displayTexts?.closePanel : displayTexts?.openPanel"
          kind="ghost"
          @click="togglePanel(open)"
        />

        <LxButton
          icon="config"
          variant="icon-only"
          :label="displayTexts?.config"
          kind="ghost"
          :active="open && tab === 'config'"
          @click="(tab = 'config'), (open = true)"
        />

        <LxButton
          icon="components"
          variant="icon-only"
          :label="displayTexts?.components"
          kind="ghost"
          :active="open && tab === 'components'"
          @click="(tab = 'components'), (open = true)"
        />
        <LxButton
          v-if="hasAiChat"
          icon="ai"
          variant="icon-only"
          :label="displayTexts?.ai"
          kind="ghost"
          :active="open && tab === 'ai'"
          @click="(tab = 'ai'), (open = true)"
        />
        <LxButton
          icon="settings"
          variant="icon-only"
          :label="displayTexts?.settings"
          kind="ghost"
          :active="open && tab === 'settings'"
          @click="(tab = 'settings'), (open = true)"
        />
      </div>
    </div>
    <div class="panel-side" v-if="open">
      <div>
        <div
          class="config-header"
          :class="[
            {
              'has-selected-element': componentName && tab === 'config',
              'has-template-edit-mode':
                (isInsideCustomItemMode || componentName === 'LxList') && tab === 'config',
              'template-edit-mode-open':
                (isInsideCustomItemMode || componentName === 'LxList') &&
                tab === 'config' &&
                templateModeModel,
            },
          ]"
        >
          <div v-if="tab === 'config'" class="config-panel-header">
            <LxDropDownMenu
              :actionDefinitions="navigation"
              placement="bottom-start"
              offsetSkid="-8"
              @actionClick="changeNavigationItem"
            >
              <div class="header-wrapper">
                <template v-if="componentName">
                  <p>{{ componentName }}</p>
                  <LxIcon value="menu" />
                </template>
              </div>
            </LxDropDownMenu>

            <LxButton
              v-if="componentName && (isInsideCustomItemMode || componentName === 'LxList')"
              :icon="templateModeModel ? 'close' : 'edit-item'"
              kind="ghost"
              :label="templateModeModel ? displayTexts?.close : displayTexts?.edit"
              variant="icon-only"
              @click="toggleTemplateMode(!templateModeModel)"
            />
          </div>
          <div v-else class="header-wrapper">
            <p v-if="tab === 'components'">{{ displayTexts?.components }}</p>
            <p v-else-if="tab === 'settings'">{{ displayTexts?.settings }}</p>
            <p v-else-if="tab === 'ai'">{{ displayTexts?.ai }}</p>
            <p v-else>{{ displayTexts?.actionPanel }}</p>
          </div>
        </div>

        <div class="panel-main" v-if="tab === 'config'">
          <!-- Template editing mode -->
          <template v-if="templateModeModel">
            <LxTextInput
              v-model="propSearchModel"
              kind="search"
              :placeholder="displayTexts?.searchProps"
              :disabled="!componentName"
              class="prop-search"
            />

            <LxInfoBox
              icon="info"
              :label="displayTexts?.templateEditLabel"
              :description="displayTexts?.templateEditDescription"
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
              :selectedModel="selectedModel"
              :templateMode="componentName === 'LxList' && templateModeModel"
              :schemaInfo="schemaInfo"
              :texts="displayTexts"
              @error="(x) => emits('error', x)"
              @update:selectedModel="(x) => emits('update:selectedModel', x)"
            />
            <div v-else class="no-component-wrapper">
              <LxEmptyState :label="displayTexts.noComponentSelected" />
            </div>
          </template>
          <!-- Default mode -->
          <template v-else>
            <div class="button-group">
              <LxButton
                icon="copy"
                kind="ghost"
                :label="displayTexts?.duplicate"
                :disabled="!isDuplicatable()"
                @click="emits('duplicateComponent')"
              />

              <LxButton
                icon="delete"
                kind="ghost"
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
              :selectedModel="selectedModel"
              :texts="displayTexts"
              @error="(x) => emits('error', x)"
              @update:selectedModel="(x) => emits('update:selectedModel', x)"
            />
            <div v-else class="no-component-wrapper">
              <LxEmptyState :label="displayTexts.noComponentSelected" />
            </div>
          </template>
        </div>

        <div v-if="tab === 'components'" class="panel-main lx-region" style="padding: 0.25rem">
          <LxInfoBox
            v-if="templateModeModel"
            icon="info"
            :label="displayTexts.templateEditLabel"
            :description="displayTexts.templateEditDescription"
          />

          <LxList
            listType="1"
            :hasSearch="true"
            :items="componentItems"
            :groupDefinitions="usageGroupDefinitions"
            groupAttribute="usageGroup"
            :hideFilteredItems="true"
            icon="add"
            :includeUnspecifiedGroups="templateModeModel"
            :texts="{
              placeholder: displayTexts?.searchComponents,
              clear: displayTexts?.clear,
              noItems: displayTexts?.noItems,
              notFoundSearch: displayTexts?.notFoundSearch,
            }"
            :hasVirtualization="false"
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
        <div v-if="tab === 'ai'">
          <div class="panel-chat lx-region-component">
            <LxChat
              :userDefinitions="chatUserDefinitions"
              :items="chatItemsDisplay"
              :busy="chatBusy"
              :loading="chatLoading"
              mode="compact"
              :messageActionDefinitions="[
                {
                  id: 'undo',
                  name: displayTexts?.undo,
                  icon: 'undo',
                  visibleByAttribute: 'hasUndoLastChange',
                  disabled: chatBusy || chatLoading,
                },
              ]"
              :typing="chatTyping"
              :typingUsers="chatTypingUsers"
              :texts="displayTexts?.chat"
              @send="(x) => emits('send', x)"
              @messageActionClick="(x) => emits('messageActionClick', x)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
