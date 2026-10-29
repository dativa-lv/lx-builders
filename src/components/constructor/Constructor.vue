<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import {
  lxFormatUtils,
  lxStringUtils,
  LxButton,
  LxStack,
  builderRegistry,
  LxModal,
  LxToolbar,
  LxFileUploader,
  LxTextArea,
  LxContentSwitcher,
  LxList,
  LxIcon,
  LxDialog,
  lxGeneralUtils,
} from '@dativa-lv/lx-ui';

import LxViewBuilder from '@/components/ViewBuilder.vue';
import { useWindowSize } from '@vueuse/core';
import { getNewItemSchema } from '@/utils/constructorUtils';
import Panel from '@/components/constructor/Panel.vue';

const props = defineProps({
  schema: {
    type: Object,
    default: () => ({}),
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  panelTeleportTarget: {
    type: String,
    default: null,
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
  chatMessageActionDefinitions: {
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
  back: 'Pārvietot atpakaļ',
  next: 'Pārvietot uz priekšu',
  delete: 'Dzēst',
  exportModal: 'Saglabāšana',
  moveOutside: 'Izvietot ārpusē',
  moveInside: 'Ievietot iekšpusē',
  close: 'Aizvērt',
  save: 'Saglabāt',
  yes: 'Jā',
  no: 'Nē',
  download: 'Lejupielādēt',
  copy: 'Kopēt',
  editSchemaModal: 'Struktūras labošana',
  componentAddModal: 'Komponenšu pievienošana',
  componentAddDescription:
    'Vai pievienot elementu iekš izvēlētā elementa vai aiz izvēlētā elementa?',
  componentAddInside: 'Ievietot iekšpusē',
  componentAddNext: 'Izvietot ārpusē',
  componentAddInsideDescription: 'Ievietot komponenti kā daļu no izvēlētā elementa',
  componentAddNextDescription: 'Ievietot komponenti ārpus izvēlētā elementa',
  importModal: 'Pievienošana no datnes',
  importFile: 'Datnes augšupielāde',
  importText: 'Teksta ievade',
  editModelModal: 'Datu labošana',
  confirmDelete: 'Vai tiešām vēlaties dzēst šo komponenti?',
  confirmImport: 'Vai tiešām vēlaties pievienot datni?',
  confirmImportDescription:
    'Esošā struktūra tiks aizvietota ar pievienoto un visi nesaglabātie dati tiks zaudēti',
  componentAddChoice: 'Izvēlieties, kur pievienot komponenti',
  invalidJsonError: 'Nederīgs JSON objekts',
  parseJsonError: 'Kļūda, apstrādājot JSON saturu',
  invalidArrayOfObjects: 'Nederīgs JSON objekts. Ievadiet masīvu ar objektiem',
  schemaKeyEmptyError: 'Atslēga nedrīkst būt tukša',
  schemaKeyParentError: 'Vecākelements nav atrasts',
  schemaKeyDuplicateError: 'Atslēga "{0}" jau eksistē. Tai jābūt unikālai',
  schemaKeyUpdateError: 'Kļūda atslēgas atjaunināšanā. Mēģiniet vēlreiz!',
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
  resetKey: 'Atiestatīt',
  searchProps: 'Meklēt propus',
  searchComponents: 'Meklēt komponenti',
  clear: 'Notīrīt',
  noItems: 'Nav ierakstu',
  notFoundSearch: 'Nav atrasts:',
  notFoundProps: 'Nav atrasts',
  actionPanel: 'Darbību panelis',
  additionalLabel: 'Additional',
  modeLabel: 'Mode',
  noComponentSelected: 'Nav izvēlēts elements',
  inputs: 'Ievadlauki',
  containers: 'Konteineri',
  lists: 'Saraksti',
  edit: 'Labot',
  editing: 'Labošana',
  searchText: 'Meklēt',
  removeItem: 'Dzēst ierakstu',
  removeItemHint: 'Nospiediet Delete, lai noņemtu ierakstu',
  addItemButtonTooltip: 'Pievienot ierakstu',
  addButtonLabel: 'Pievienot ierakstu',
  showAllFields: 'Rādīt visus laukus',
  ai: 'Ģenerēt ar MI',
  undo: 'Atcelt veiktās izmaiņas',
  confirmAddCustomItem: 'Pievienot komponenti, izmantojot customItem?',
  confirmAddCustomItemDescription:
    'Pievienojot komponenti, pašreizējā LxList struktūrā tiks pievienots arī LxStack. Esošais izkārtojums var mainīties.',
  templateEditLabel: 'Struktūras labošana',
  templateEditDescription: 'Izmaiņas tiks piemērotas visiem saraksta elementiem',
  row: 'Rinda',
  column: 'Kolonna',
  autoSize: 'Automātisks izmērs (auto)',
  sizeRatio: 'Izmēra proporcija',
  modelPathAttributeError: 'Atribūts nedrīkst būt tukšs un saturēt punktus vai atstarpes',

  fileUploader: {
    clear: 'Notīrīt',
    draggablePlaceholder: 'Ievelciet datnes, vai nospiediet šeit, lai augšupielādētu',
    close: 'Aizvērt',
    infoButton: 'Skatīt detaļas',
    download: 'Lejupielādēt',
    metaPreviewLabel: 'Priekšskatījums',
    metaPreviewDescription: 'priekšskatījums',
    metaMainLabel: 'Galvenie dati',
    metaMainAuthor: 'Autors',
    metaMainFormat: 'Formāts',
    metaMainLastModified: 'Pēdējās izmaiņas',
    metaMainDataSize: 'Datnes izmērs',
  },
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
  'update:schema',
  'update:modelValue',
  'error',
  'schemaCopy',
  'send',
  'messageActionClick',
]);

// Error message map
// invalidJson, invalidFileContent, actionDefinitionsValidation, itemsValidation

const schemaModel = computed({
  get() {
    return props.schema;
  },
  set(value) {
    emits('update:schema', value);
  },
});

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const { width, height } = useWindowSize();

const navigation = ref([]);
const componentName = ref(null);
const componentProps = ref(null);
const componentPropsDefinitions = ref(null);

const currentItem = ref(null);

const schemaPropertiesStack = ref(null);

const highlight = ref({
  visible: false,
  style: {},
  el: null,
  itemId: null, // registry id of the selected element, used to find it again after re-render
  detached: false, // selected element is temporarily not in DOM
  padding: 2, // extra space around element
});

const schemaPath = ref();
const nextElementInfo = ref({
  canPlaceInside: false,
  key: null,
  path: null,
});

const lowerNestingInfo = ref({
  canMoveOut: false,
  parentKey: null,
  parentPath: null,
  targetPath: null,
  placement: null,
});

const schemaKey = ref(null);
const parentItem = ref(null);

const exportModal = ref(null);

const importModal = ref(null);
const importFile = ref(null);
const fileContent = ref(null);
const importContentValue = ref('file'); // 'file' or 'text'
const importInvalidMessage = ref();

const editSchemaModal = ref(null);
const editSchemaContent = ref(null);
const editSchemaInvalidMessage = ref(null);

const isUploadable = computed(() => !fileContent.value);

const componentAddModal = ref(null);
const componentToAdd = ref(null);
const schemaKeyError = ref(null);

const panelTab = ref(null);

const confirmDialog = ref();

const customItemPath = ref(false);

const confirmDialogObject = ref({
  label: null,
  description: null,
  kind: 'danger',
  primaryAction: null,
  secondaryAction: null,
});

const elementInfo = ref({
  canMoveBack: false, // can move before previous sibling
  canMoveForward: false, // can move after next sibling
  moveOut: false, // can move out before parent
  canMoveForwardIn: false, // can move inside next sibling
});

function resetElementInfo() {
  elementInfo.value.canMoveBack = false;
  elementInfo.value.canMoveForward = false;
  elementInfo.value.moveOut = false;
  elementInfo.value.canMoveForwardIn = false;
}

const highlightToolbar = ref();
const isToolbarSmaller = ref(false);

const templateMode = ref(false);

// Borders of the same custom item template element in other list items (no toolbar)
const linkedHighlights = ref([]);

// Calculates highlight position and size for the provided DOM element
function getHighlightStyle(el) {
  const r = el.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  const p = highlight.value.padding;

  return {
    left: `${r.left - p}px`,
    top: `${r.top - p + scrollY}px`,
    width: `${r.width + p * 2}px`,
    height: `${r.height + p * 2}px`,
  };
}

// Positions the selection highlight over the provided DOM element
function colorBorder(e) {
  highlight.value.el = e.target;

  if (!highlight.value.el) return;

  highlight.value.style = getHighlightStyle(highlight.value.el);
  highlight.value.visible = true;
  highlight.value.detached = false;

  const toolbarWidth = highlightToolbar.value?.getBoundingClientRect()?.width;
  const highlightWidth = highlight.value.el?.getBoundingClientRect()?.width;

  // if highlight toolbar is smaller then highlighted element, then display delete button
  // in the toolbar, otherwise display it at the right side of selected element
  if (highlightWidth && toolbarWidth && highlightWidth < toolbarWidth) {
    isToolbarSmaller.value = true;
  } else {
    isToolbarSmaller.value = false;
  }
}

function getRegistryElement(itemId) {
  return (
    document.querySelector(`[data-id="${itemId}"]`) ||
    document.getElementById(`${itemId}-wrapper`) ||
    document.getElementById(itemId)
  );
}

// Draws borders around the same custom item template element in all other list items
function colorLinkedBorders() {
  linkedHighlights.value = [];
  if (!customItemPath.value || !schemaPath.value || !highlight.value.visible) return;

  linkedHighlights.value = Array.from(builderRegistry.all().entries())
    .filter(
      ([, item]) =>
        item?.builderName === schemaPath.value && item?.customItemPath === customItemPath.value
    )
    .map(([itemId]) => getRegistryElement(itemId))
    .filter((el) => el && el !== highlight.value.el && el.isConnected)
    .map((el) => getHighlightStyle(el));
}

// Finds the selected element in the current DOM, as the previous node may have been re-rendered
function resolveSelectedElement() {
  const { el, itemId } = highlight.value;
  if (el?.isConnected) return el;

  const byId = itemId ? getRegistryElement(itemId) : null;
  if (byId?.isConnected) return byId;

  if (!schemaPath.value) return null;

  const entry = Array.from(builderRegistry.all().entries()).find(
    ([id, item]) =>
      item?.builderName === schemaPath.value &&
      (item?.customItemPath || null) === (customItemPath.value || null) &&
      getRegistryElement(id)?.isConnected
  );
  if (!entry) return null;

  [highlight.value.itemId] = entry;
  return getRegistryElement(entry[0]);
}

// Recalculates all highlight positions from the current layout
function refreshHighlights() {
  if (!highlight.value.visible) return;

  const el = resolveSelectedElement();
  if (!el) {
    highlight.value.detached = true;
    linkedHighlights.value = [];
    return;
  }

  colorBorder({ target: el });
  colorLinkedBorders();
}

let isHighlightRefreshScheduled = false;

// Schedules highlight refresh after Vue has patched the DOM and the browser has calculated layout
function updateSelectedElement() {
  if (isHighlightRefreshScheduled) return;
  isHighlightRefreshScheduled = true;

  nextTick(() => {
    requestAnimationFrame(() => {
      isHighlightRefreshScheduled = false;
      refreshHighlights();
    });
  });
}

function isLxRowClicked(id) {
  const res = id?.replace(/-wrapper$/, '');
  return builderRegistry.get(res)?.type === 'LxRow';
}

// Reads a value from a nested object using provided path
function getValueByPath(obj, path) {
  return path?.reduce((o, key) => (lxGeneralUtils.isNil(o) ? undefined : o[key]), obj);
}

// Finds the correct position in schema based on components provided schemaPath
function findPositionInSchema(path = null, hasItems = null) {
  const pathToUse = path || schemaPath.value;
  const res = [];

  schemaPropertiesStack.value = pathToUse?.split('.');
  schemaPropertiesStack.value?.forEach((x) => {
    res.push('properties', x);
  });

  if (hasItems) {
    const customItemPathToUse = hasItems?.split('.');
    customItemPathToUse?.forEach((x) => {
      res.push(x);
    });
  }
  return res;
}

// Position of the container (null for schema root) and key of the selected element, including custom items
function getSelectedPosition() {
  const position = findPositionInSchema(schemaPath.value, customItemPath.value);

  return {
    positionPath: position.length > 2 ? position.slice(0, -2) : null,
    key: position[position.length - 1],
  };
}

// Get schema item displayType
function getItemDisplayType(item) {
  return item?.lx?.displayType;
}

// Checks if element can be moved inside item
// Check if item has properties and if its form also check if it has at least one section
function hasContainerProperties(item) {
  const hasProperties =
    !!item && Object.prototype.hasOwnProperty.call(item, 'properties') && !!item.properties;
  const displayType = getItemDisplayType(item);

  if (!hasProperties) {
    return false;
  }

  if (displayType === 'list' || displayType === 'table') {
    return false;
  }

  if (displayType !== 'form') {
    return true;
  }

  return Object.values(item.properties).some((child) => getItemDisplayType(child) === 'section');
}

function checkIfInsideFilterSection(navigationStack) {
  if (!Array.isArray(navigationStack)) return false;

  const navigationNames = navigationStack.map((item) => item?.name);
  const filtersIndex = navigationNames.indexOf('LxFilters');

  if (filtersIndex < 0) return false;

  const formIndex = navigationNames.indexOf('LxForm', filtersIndex + 1);
  if (formIndex < 0) return false;

  return navigationNames.includes('LxSection', formIndex + 1);
}

function getDisplayTypesForSchemaPath(schema, path) {
  if (!schema || !path) return [];

  const pathParts = path.split('.').filter(Boolean);

  return pathParts
    .map((_, index) => {
      const currentPath = pathParts.slice(0, index + 1).join('.');
      const schemaItem = getValueByPath(schema, findPositionInSchema(currentPath));

      return getItemDisplayType(schemaItem);
    })
    .filter(Boolean);
}

function canNestComponentInsideSchemaPath(componentId, targetPath, schema = schemaModel.value) {
  const displayTypes = getDisplayTypesForSchemaPath(schema, targetPath);
  const isInsideFilters = displayTypes.includes('filters');
  const isInsideForm = displayTypes.includes('form');

  if (componentId === 'LxList') {
    return !isInsideFilters;
  }

  if (componentId === 'LxDataGrid') {
    return !isInsideFilters && !isInsideForm;
  }

  return true;
}

// Nesting limits of custom items, based on what FormBuilderItem can render
const CUSTOM_ITEM_MAX_STACK_DEPTH = 2;
const CUSTOM_ITEM_MAX_DEPTH = 3;
const CUSTOM_ITEM_DEFAULT_VALUE = '—';

// Gets the custom item keys from the customItemPath -> 'items.properties.a.properties.b' -> ['a', 'b']
function getCustomItemKeys(path) {
  return (
    path
      ?.split('.')
      .slice(1)
      .filter((_, index) => index % 2 === 1) ?? []
  );
}

// Builds customItemPath from the custom item keys -> ['a', 'b'] -> 'items.properties.a.properties.b'
function buildCustomItemPath(keys) {
  return ['items', ...keys.flatMap((key) => ['properties', key])].join('.');
}

function withFlatCustomItemModelPath(componentId, itemSchema, key) {
  if (componentId === 'LxStack' || !itemSchema || !key) return itemSchema;

  const listModelPath = schemaPath.value?.split('.').filter(Boolean) || [];
  return {
    ...itemSchema,
    lx: {
      ...(itemSchema.lx || {}),
      modelPath: [...listModelPath, key].join('.'),
    },
  };
}

// Checks if custom item (with all its children) can be placed at the provided depth
function canCustomItemFitDepth(item, depth) {
  if (!item) return false;

  if (getItemDisplayType(item) === 'stack') {
    return (
      depth <= CUSTOM_ITEM_MAX_STACK_DEPTH &&
      Object.values(item.properties || {}).every((child) => canCustomItemFitDepth(child, depth + 1))
    );
  }

  return depth <= CUSTOM_ITEM_MAX_DEPTH;
}

function splitDotPath(path) {
  if (!path?.includes('.')) return { parent: null, key: path ?? null };
  const parts = path.split('.');
  return { parent: parts.slice(0, -1).join('.'), key: parts.slice(-1)[0] };
}

// Updated infomration about the currenly selected element:
// Can it be moved to left or right, can it be moved outside or inside and more
function getPositionInfo(schema, currentSchema) {
  resetElementInfo();
  if (!schemaPath.value || !currentSchema) return;

  // Same source as moveElement(), includes customItemPath
  const { positionPath, key: currentKey } = getSelectedPosition();
  const parentSchema = positionPath ? getValueByPath(schema, positionPath) : schema;
  const siblingProperties = parentSchema?.properties;
  if (!siblingProperties || !currentKey) return;

  const siblingKeys = Object.keys(siblingProperties);
  const currentIndex = siblingKeys.indexOf(currentKey);
  if (currentIndex < 0) return;

  const nextKey = siblingKeys[currentIndex + 1] ?? null;
  const nextSchema = nextKey ? siblingProperties[nextKey] : null;
  const previousKey = currentIndex > 0 ? siblingKeys[currentIndex - 1] : null;

  elementInfo.value.canMoveBack = !!previousKey;
  elementInfo.value.canMoveForward = !!nextKey;

  // Custom items can be moved in/out only within the list custom item borders
  if (customItemPath.value) {
    const depth = getCustomItemKeys(customItemPath.value).length;

    elementInfo.value.canMoveForwardIn =
      getItemDisplayType(nextSchema) === 'stack' &&
      canCustomItemFitDepth(siblingProperties[currentKey], depth + 1);
    elementInfo.value.moveOut = depth > 1;
    return;
  }

  const { parent: parentPath } = splitDotPath(schemaPath.value);

  // Move inside is allowed only forward
  elementInfo.value.canMoveForwardIn =
    hasContainerProperties(nextSchema) && componentName.value !== 'LxSection';

  if (elementInfo.value.canMoveForwardIn && nextSchema) {
    let moveInsideTargetPath = [parentPath, nextKey].filter(Boolean).join('.');

    if (getItemDisplayType(nextSchema) === 'form') {
      const targetSectionEntry = Object.entries(nextSchema.properties || {}).find(
        ([, child]) => getItemDisplayType(child) === 'section'
      );

      if (targetSectionEntry) {
        const [sectionKey] = targetSectionEntry;
        moveInsideTargetPath = [moveInsideTargetPath, sectionKey].filter(Boolean).join('.');
      } else {
        elementInfo.value.canMoveForwardIn = false;
      }
    }

    if (
      elementInfo.value.canMoveForwardIn &&
      !canNestComponentInsideSchemaPath(componentName.value, moveInsideTargetPath, schema)
    ) {
      elementInfo.value.canMoveForwardIn = false;
    }
  }

  const grandParentPath = parentPath?.includes('.')
    ? parentPath?.split('.')?.slice(0, -1).join('.')
    : null;
  const parentKey = parentPath?.split('.')?.slice(-1)[0] || null;
  const canMoveOut = !!parentPath && !!parentKey && !!grandParentPath;

  elementInfo.value.moveOut = canMoveOut && !checkIfInsideFilterSection(navigation.value);
}

function setPanelTab(tab) {
  panelTab.value = tab;
}

// Callback for clicks on the constructor area
// identifies the clicked component based on the builderRegistry and updates state
function selectElement(e) {
  let elem = e.target;
  let registryElem = null;
  let registryId = null;
  // Walk up the DOM tree until we find an element with an id in the registry

  while (elem) {
    if ((elem.dataset.id && builderRegistry.get(elem.dataset.id)) || isLxRowClicked(elem.id)) {
      let candidateId = null;
      if (isLxRowClicked(elem.id)) {
        candidateId = elem.id?.replace(/-wrapper$/, '');
      } else {
        candidateId = elem.dataset.id || elem.id;
      }
      const candidate = builderRegistry.get(candidateId);

      // LxStack and custom item elements are selectable only in template editing mode
      const isTemplateOnly = candidate?.type === 'LxStack' || !!candidate?.customItemPath;
      if (!isTemplateOnly || templateMode.value) {
        registryElem = candidate;
        registryId = candidateId;
        break;
      }
    }

    elem = elem.parentElement;
  }

  if (registryElem) {
    componentName.value = registryElem.type;
    componentPropsDefinitions.value = registryElem.node.type.props;
    componentProps.value = lxFormatUtils.objectClone(registryElem.props);
    colorBorder({ target: elem });
    highlight.value.itemId = registryId;
    schemaPath.value = registryElem.builderName;
    navigation.value = registryElem.componentStack;
    customItemPath.value = registryElem?.customItemPath;
    colorLinkedBorders();
    schemaKey.value = getSelectedPosition().key ?? null;
    schemaKeyError.value = null;

    // if not LxList, LxStack or a custom item element then panel template mode can be reset
    if (
      componentName.value !== 'LxList' &&
      componentName.value !== 'LxStack' &&
      !registryElem.customItemPath
    ) {
      templateMode.value = false;
    }
  }

  // Find the selected item in schema
  currentItem.value = getValueByPath(
    schemaModel.value,
    findPositionInSchema(null, customItemPath.value)
  );

  const parentSchemaPath = schemaPath.value?.includes('.')
    ? schemaPath.value?.split('.')?.join('.')
    : null;

  // Find the parent item of selected item in schema
  parentItem.value = getValueByPath(
    schemaModel.value,
    findPositionInSchema(parentSchemaPath, customItemPath.value)?.slice(0, -1)
  );

  getPositionInfo(schemaModel.value, currentItem.value);

  // Open the tab with component configuration
  // If ai tab is open then do not switch to config tab
  if (panelTab.value !== 'ai') {
    setPanelTab('config');
  }
}

// Checks if selected component can be moved
function canMoveComponent() {
  return (
    componentName.value === 'LxRow' ||
    componentName.value === 'LxSection' ||
    !navigation.value.some((nav) => nav.name === 'LxRow')
  );
}

function canHandleGlobalArrowKeys(eventTarget) {
  const target = eventTarget;
  if (!target || !(target instanceof HTMLElement)) return true;

  if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
    return false;
  }

  const formTags = ['INPUT', 'TEXTAREA', 'SELECT'];
  return !formTags.includes(target.tagName);
}

// Writes a value into a nested object using provided path
function setValueByPath(obj, path, value) {
  path?.reduce((o, key, index) => {
    if (index === path.length - 1) {
      // eslint-disable-next-line no-param-reassign
      o[key] = value;
    } else {
      // eslint-disable-next-line no-param-reassign
      o[key] = o[key] ?? {};
    }
    return o[key];
  }, obj);
}

function removeValueByPath(obj, path) {
  if (!Array.isArray(path) || path.length === 0) return;

  const parentPath = path.slice(0, -1);
  const keyToRemove = path[path.length - 1];
  const parentValue = parentPath.length ? getValueByPath(obj, parentPath) : obj;

  if (!parentValue || !Object.prototype.hasOwnProperty.call(parentValue, keyToRemove)) {
    return;
  }

  delete parentValue[keyToRemove];
}

function moveModelValueBranch(fromSchemaPath, toSchemaPath) {
  const fromModelPath = fromSchemaPath?.split('.')?.filter(Boolean) || [];
  const toModelPath = toSchemaPath?.split('.')?.filter(Boolean) || [];

  if (!fromModelPath.length || !toModelPath.length) return;

  const currentValue = getValueByPath(model.value, fromModelPath);
  if (lxGeneralUtils.isNil(currentValue)) return;

  const modelClone = lxFormatUtils.objectClone(model.value || {});
  setValueByPath(modelClone, toModelPath, currentValue);
  removeValueByPath(modelClone, fromModelPath);
  model.value = modelClone;
}

// Updates the current location in shcema, with the provided new value
function updateSchemaFromPanel(newSchema) {
  const res = findPositionInSchema(schemaPath.value, customItemPath.value);

  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  setValueByPath(schemaClone, res, newSchema);
  schemaModel.value = schemaClone;

  currentItem.value = newSchema;
  updateSelectedElement();
}

// Resets the information about the next element
function resetNextElementInfo() {
  nextElementInfo.value = {
    canPlaceInside: false,
    key: null,
    path: null,
  };
}

// Resets the information about the lower nesting element
function resetLowerNestingInfo() {
  lowerNestingInfo.value = {
    canMoveOut: false,
    parentKey: null,
    parentPath: null,
    targetPath: null,
    placement: null,
  };
}

function getUniqueKeyForLevel(preferredKey, levelProperties) {
  if (!preferredKey || !levelProperties) return preferredKey;

  if (!Object.prototype.hasOwnProperty.call(levelProperties, preferredKey)) {
    return preferredKey;
  }

  let generatedKey = lxStringUtils.generateUUID();
  while (Object.prototype.hasOwnProperty.call(levelProperties, generatedKey)) {
    generatedKey = lxStringUtils.generateUUID();
  }

  return generatedKey;
}

// Gets the modeLValue value from the provided path
function getModelPathFromSchemaPath(schemaPathArray) {
  if (!Array.isArray(schemaPathArray)) return [];

  return schemaPathArray.filter((pathPart) => pathPart !== 'properties');
}

// Gets the modelValue path from the current schemaPath
function getSchemaPathFromPositionPath(positionPath) {
  return getModelPathFromSchemaPath(positionPath).join('.');
}

// Makes component selected based on provided schemaPath (and customItemPath for custom items)
function selectComponentBySchemaPath(newSchemaPath, newCustomItemPath = null) {
  if (!newSchemaPath) return;

  nextTick(() => {
    const registryItems = Array.from(builderRegistry.all().entries());
    const targetEntry = registryItems.find(
      ([, item]) =>
        item?.builderName === newSchemaPath &&
        (item?.customItemPath || null) === (newCustomItemPath || null)
    );
    if (!targetEntry) return;

    const [itemId] = targetEntry;

    let elem = document.querySelector(`[data-id="${itemId}"]`);
    if (!elem) {
      elem = document.getElementById(`${itemId}-wrapper`) || document.getElementById(itemId);
    }

    if (elem) {
      elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });
}

// Moves the custom item values in every list row (model) from one key path to another
function moveListRowsValueBranch(listSchemaPath, fromKeys, toKeys) {
  const listModelPath = listSchemaPath?.split('.')?.filter(Boolean) || [];
  if (!listModelPath.length || !fromKeys.length || !toKeys.length) return;
  if (!Array.isArray(getValueByPath(model.value, listModelPath))) return;

  const modelClone = lxFormatUtils.objectClone(model.value || {});

  getValueByPath(modelClone, listModelPath).forEach((row) => {
    if (!row || typeof row !== 'object') return;

    const value = getValueByPath(row, fromKeys);
    if (lxGeneralUtils.isNil(value)) return;

    removeValueByPath(row, fromKeys);

    const targetParent = toKeys.length > 1 ? getValueByPath(row, toKeys.slice(0, -1)) : row;
    if (!lxGeneralUtils.isNil(targetParent) && typeof targetParent !== 'object') return;

    setValueByPath(row, toKeys, value);
  });

  model.value = modelClone;
}

// Sets a default value for the newly added custom item in every list row (model), so that it is visible
function initializeListRowsValueForAddedCustomItem(componentId, listSchemaPath, keys) {
  // LxStack is only a container, its children hold the values
  if (componentId === 'LxStack') return;

  const listModelPath = listSchemaPath?.split('.')?.filter(Boolean) || [];
  if (!listModelPath.length || !keys?.length) return;
  if (!Array.isArray(getValueByPath(model.value, listModelPath))) return;

  const modelClone = lxFormatUtils.objectClone(model.value || {});

  getValueByPath(modelClone, listModelPath).forEach((row) => {
    if (!row || typeof row !== 'object') return;
    if (!lxGeneralUtils.isNil(getValueByPath(row, keys))) return;

    const targetParent = keys.length > 1 ? getValueByPath(row, keys.slice(0, -1)) : row;
    if (!lxGeneralUtils.isNil(targetParent) && typeof targetParent !== 'object') return;

    setValueByPath(row, keys, CUSTOM_ITEM_DEFAULT_VALUE);
  });

  model.value = modelClone;
}

// Moves the selected custom item inside the next sibling stack
function moveCustomItemInside() {
  const keys = getCustomItemKeys(customItemPath.value);
  const { positionPath, key: currentKey } = getSelectedPosition();
  if (!positionPath || !currentKey) return;

  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  const siblingProperties = getValueByPath(schemaClone, positionPath)?.properties;
  if (!siblingProperties) return;

  const siblingKeys = Object.keys(siblingProperties);
  const targetKey = siblingKeys[siblingKeys.indexOf(currentKey) + 1];
  const currentSchema = siblingProperties[currentKey];
  const targetSchema = targetKey ? siblingProperties[targetKey] : null;

  if (
    getItemDisplayType(targetSchema) !== 'stack' ||
    !canCustomItemFitDepth(currentSchema, keys.length + 1)
  ) {
    return;
  }

  const targetProperties = targetSchema.properties || {};
  const movedKey = getUniqueKeyForLevel(currentKey, targetProperties);

  // Move-in always appends moved element as the last element in destination stack
  targetSchema.properties = { ...targetProperties, [movedKey]: currentSchema };
  delete siblingProperties[currentKey];

  schemaModel.value = schemaClone;

  const movedKeys = [...keys.slice(0, -1), targetKey, movedKey];
  // Values of referenced items (lx.modelPath) don't depend on the position in schema
  if (!currentSchema?.lx?.modelPath) moveListRowsValueBranch(schemaPath.value, keys, movedKeys);
  selectComponentBySchemaPath(schemaPath.value, buildCustomItemPath(movedKeys));
}

// Moves the selected custom item out of its parent stack, but not outside the list custom items
function moveCustomItemOutside() {
  const keys = getCustomItemKeys(customItemPath.value);
  if (keys.length < 2) return;

  const { positionPath, key: currentKey } = getSelectedPosition();
  if (!positionPath || !currentKey) return;

  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  const parentSchema = getValueByPath(schemaClone, positionPath);
  const outsideSchema = getValueByPath(schemaClone, positionPath.slice(0, -2));
  const parentKey = keys[keys.length - 2];
  const currentSchema = parentSchema?.properties?.[currentKey];
  const outsideProperties = outsideSchema?.properties;

  if (!currentSchema || !outsideProperties?.[parentKey]) return;

  const movedKey = getUniqueKeyForLevel(currentKey, outsideProperties);
  delete parentSchema.properties[currentKey];

  // Unified take-out behavior: always insert before parent stack
  outsideSchema.properties = Object.fromEntries(
    Object.entries(outsideProperties).flatMap(([key, value]) =>
      key === parentKey
        ? [
            [movedKey, currentSchema],
            [key, value],
          ]
        : [[key, value]]
    )
  );

  schemaModel.value = schemaClone;

  const movedKeys = [...keys.slice(0, -2), movedKey];
  // Values of referenced items (lx.modelPath) don't depend on the position in schema
  if (!currentSchema?.lx?.modelPath) moveListRowsValueBranch(schemaPath.value, keys, movedKeys);
  selectComponentBySchemaPath(schemaPath.value, buildCustomItemPath(movedKeys));
}

function moveElementInside() {
  if (!schemaPath.value) return;

  if (customItemPath.value) {
    moveCustomItemInside();
    return;
  }

  const currentSchemaPath = schemaPath.value;
  const currentKey = schemaPath.value?.split('.')?.slice(-1)[0];
  const parentPath = schemaPath.value?.includes('.')
    ? schemaPath.value?.split('.')?.slice(0, -1)?.join('.')
    : null;
  const parentSchemaPath = parentPath ? findPositionInSchema(parentPath) : null;
  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  const parentSchema = parentSchemaPath
    ? getValueByPath(schemaClone, parentSchemaPath)
    : schemaClone;
  const siblingProperties = parentSchema?.properties;

  if (!siblingProperties || !currentKey) return;

  const siblingKeys = Object.keys(siblingProperties);
  const currentIndex = siblingKeys.indexOf(currentKey);
  const targetKey = siblingKeys[currentIndex + 1];

  if (!targetKey) return;

  const currentSchema = siblingProperties[currentKey];
  const targetSchema = siblingProperties[targetKey];

  if (!currentSchema || !targetSchema || !hasContainerProperties(targetSchema)) return;

  let targetContainerSchema = targetSchema;
  let targetContainerPath = [parentPath, targetKey].filter(Boolean)?.join('.');

  if (getItemDisplayType(targetSchema) === 'form') {
    const targetSectionEntry = Object.entries(targetSchema.properties || {}).find(
      ([, child]) => getItemDisplayType(child) === 'section'
    );

    if (!targetSectionEntry) return;

    const [sectionKey, sectionSchema] = targetSectionEntry;

    targetContainerSchema = sectionSchema;
    targetContainerPath = [targetContainerPath, sectionKey].filter(Boolean).join('.');
  }

  if (!canNestComponentInsideSchemaPath(componentName.value, targetContainerPath, schemaClone)) {
    return;
  }

  const movedSchema = lxFormatUtils.objectClone(currentSchema);
  const targetPropertiesClone = lxFormatUtils.objectClone(targetContainerSchema.properties || {});
  const movedKey = getUniqueKeyForLevel(currentKey, targetPropertiesClone);

  // Move-in always appends moved element as the last element in destination container
  targetContainerSchema.properties = {
    ...targetPropertiesClone,
    [movedKey]: movedSchema,
  };

  setValueByPath(schemaClone, findPositionInSchema(targetContainerPath), targetContainerSchema);

  parentSchema.properties = Object.fromEntries(
    Object.entries(siblingProperties).filter(([key]) => key !== currentKey)
  );

  if (parentSchemaPath) {
    setValueByPath(schemaClone, parentSchemaPath, parentSchema);
  }

  schemaModel.value = schemaClone;

  const movedSchemaPath = [targetContainerPath, movedKey].filter(Boolean).join('.');
  moveModelValueBranch(currentSchemaPath, movedSchemaPath);
  selectComponentBySchemaPath(movedSchemaPath);
}

function getGreatGrandParent(grandParentPath, schemaClone) {
  const { parent: greatGrandParentPath, key: greatGrandParentKey } = splitDotPath(grandParentPath);

  const greatGrandParentSchemaPath = greatGrandParentPath
    ? findPositionInSchema(greatGrandParentPath)
    : null;
  const greatGrandParentSchema = greatGrandParentSchemaPath
    ? getValueByPath(schemaClone, greatGrandParentSchemaPath)
    : schemaClone;

  return {
    schema: greatGrandParentSchema,
    schemaPath: greatGrandParentSchemaPath,
    properties: greatGrandParentSchema?.properties,
    anchorKey: greatGrandParentKey,
  };
}

function resolveOutsideContainer({
  parentSchema,
  grandParentSchema,
  grandParentSchemaPath,
  grandParentProperties,
  parentKey,
  grandParentPath,
  schemaClone,
}) {
  const isSectionInForm =
    getItemDisplayType(parentSchema) === 'section' &&
    getItemDisplayType(grandParentSchema) === 'form';

  if (isSectionInForm) {
    const greatGrandParent = getGreatGrandParent(grandParentPath, schemaClone);
    if (greatGrandParent) return greatGrandParent;
  }

  return {
    schema: grandParentSchema,
    schemaPath: grandParentSchemaPath,
    properties: grandParentProperties,
    anchorKey: parentKey,
  };
}

// Moves element outside of current container
function moveElementOutside(position) {
  if (!schemaPath.value || (position !== 'next' && position !== 'previous')) return;

  if (customItemPath.value) {
    moveCustomItemOutside();
    return;
  }

  const currentSchemaPath = schemaPath.value;
  const { parent: parentPath, key: currentKey } = splitDotPath(schemaPath.value);
  if (!parentPath) return;

  const { parent: grandParentPath, key: parentKey } = splitDotPath(parentPath);
  if (!grandParentPath) return;
  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  const parentSchemaPath = parentPath ? findPositionInSchema(parentPath) : null;
  const grandParentSchemaPath = grandParentPath ? findPositionInSchema(grandParentPath) : null;
  const parentSchema = parentSchemaPath
    ? getValueByPath(schemaClone, parentSchemaPath)
    : schemaClone;
  const grandParentSchema = grandParentSchemaPath
    ? getValueByPath(schemaClone, grandParentSchemaPath)
    : schemaClone;
  const parentProperties = parentSchema?.properties;
  const grandParentProperties = grandParentSchema?.properties;

  if (!parentProperties || !currentKey || !parentKey) return;

  const {
    schema: outsideContainerSchema,
    schemaPath: outsideContainerSchemaPath,
    properties: outsideContainerProperties,
    anchorKey: outsideAnchorKey,
  } = resolveOutsideContainer({
    parentSchema,
    grandParentSchema,
    grandParentSchemaPath,
    grandParentProperties,
    parentKey,
    grandParentPath,
    schemaClone,
  });

  if (!outsideContainerProperties || !outsideAnchorKey) return;

  const currentSchema = parentProperties[currentKey];
  if (!currentSchema) return;

  const movedSchema = lxFormatUtils.objectClone(currentSchema);
  const movedKey = getUniqueKeyForLevel(currentKey, outsideContainerProperties);
  parentSchema.properties = Object.fromEntries(
    Object.entries(parentProperties).filter(([key]) => key !== currentKey)
  );

  const rebuiltOutsideProperties = {};
  Object.keys(outsideContainerProperties).forEach((key) => {
    // Unified take-out behavior: always insert before parent anchor
    if (key === outsideAnchorKey) {
      rebuiltOutsideProperties[movedKey] = movedSchema;
    }

    rebuiltOutsideProperties[key] = outsideContainerProperties[key];
  });

  outsideContainerSchema.properties = rebuiltOutsideProperties;

  if (parentSchemaPath) {
    setValueByPath(schemaClone, parentSchemaPath, parentSchema);
  }

  if (outsideContainerSchemaPath) {
    setValueByPath(schemaClone, outsideContainerSchemaPath, outsideContainerSchema);
  }

  schemaModel.value = schemaClone;

  const outsideSchemaPath = getSchemaPathFromPositionPath(outsideContainerSchemaPath);
  const movedSchemaPath = [outsideSchemaPath, movedKey].filter(Boolean).join('.');
  moveModelValueBranch(currentSchemaPath, movedSchemaPath);
  selectComponentBySchemaPath(movedSchemaPath);
}

// Initializes the modelValue for the newly added component
function initializeModelValueForAddedComponent(componentId, key, schemaContainerPath) {
  if (!key) return;

  const defaultListItems = [
    { id: 1, name: 'Item 1', description: 'Description 1' },
    { id: 2, name: 'Item 2', description: 'Description 2' },
    { id: 3, name: 'Item 3', description: 'Description 3' },
  ];

  if (componentId === 'LxDateTimeRange') {
    const modelClone = lxFormatUtils.objectClone(model.value || {});
    const modelContainerPath = getModelPathFromSchemaPath(schemaContainerPath);
    setValueByPath(modelClone, [...modelContainerPath, key], {});
    model.value = modelClone;
    emits('update:modelValue', modelClone);
  }
  if (componentId === 'LxList' || componentId === 'LxDataGrid') {
    const modelClone = lxFormatUtils.objectClone(model.value || {});
    const modelContainerPath = getModelPathFromSchemaPath(schemaContainerPath);
    setValueByPath(modelClone, [...modelContainerPath, key], defaultListItems);
    model.value = modelClone;
    emits('update:modelValue', modelClone);
  }
}

// Adds component in schema, based on provided component id
function addComponent(id) {
  // find position in schema
  const { positionPath, key: insertAfterKey } = getSelectedPosition();

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;

  const newKey = lxStringUtils.generateUUID();

  const newProp = customItemPath.value
    ? withFlatCustomItemModelPath(id, getNewItemSchema(id), newKey)
    : getNewItemSchema(id);

  const oldProps = positionValue.properties;
  const newProps = {};

  // copy over all properties except the one to remove
  Object.keys(oldProps).forEach((key) => {
    newProps[key] = oldProps[key];

    if (key === insertAfterKey) {
      newProps[newKey] = newProp;
    }
  });

  positionValue.properties = newProps;

  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  setValueByPath(schemaClone, positionPath, positionValue);
  schemaModel.value = schemaClone;

  if (customItemPath.value) {
    // Added as a sibling of the selected custom item, its value is stored flat in the list row
    const addedKeys = [...getCustomItemKeys(customItemPath.value).slice(0, -1), newKey];
    initializeListRowsValueForAddedCustomItem(id, schemaPath.value, [newKey]);
    // Custom items are registered with the list schemaPath and their own customItemPath
    selectComponentBySchemaPath(schemaPath.value, buildCustomItemPath(addedKeys));
    return;
  }

  initializeModelValueForAddedComponent(id, newKey, positionPath);

  const parentSchemaPath = getSchemaPathFromPositionPath(positionPath);
  const addedSchemaPath = [parentSchemaPath, newKey].filter(Boolean).join('.');
  selectComponentBySchemaPath(addedSchemaPath);
}

// Adds component outside of LxSection
function addComponentOutsideSelectedSection(id) {
  if (!schemaPath.value) return false;

  const currentKey = schemaPath.value?.split('.')?.slice(-1)[0];
  const parentPath = schemaPath.value?.includes('.')
    ? schemaPath.value?.split('.')?.slice(0, -1)?.join('.')
    : null;
  if (!parentPath) return false;

  const grandParentPath = parentPath?.includes('.')
    ? parentPath?.split('.')?.slice(0, -1)?.join('.')
    : null;
  const parentKey = parentPath?.split('.')?.slice(-1)[0] || null;
  if (!parentKey) return false;

  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  const parentSchemaPath = findPositionInSchema(parentPath);
  const parentSchema = getValueByPath(schemaClone, parentSchemaPath);
  const currentSchema = parentSchema?.properties?.[currentKey];

  const isSelectedSection = getItemDisplayType(currentSchema) === 'section';
  const isParentForm = getItemDisplayType(parentSchema) === 'form';

  if (!isSelectedSection || !isParentForm) return false;

  const outsideContainerSchemaPath = grandParentPath ? findPositionInSchema(grandParentPath) : null;
  const outsideContainerSchema = outsideContainerSchemaPath
    ? getValueByPath(schemaClone, outsideContainerSchemaPath)
    : schemaClone;
  const outsideContainerProperties = outsideContainerSchema?.properties;

  if (!outsideContainerProperties) return false;

  const newKey = getUniqueKeyForLevel(lxStringUtils.generateUUID(), outsideContainerProperties);
  const newProp = getNewItemSchema(id);
  const rebuiltOutsideProperties = {};

  Object.keys(outsideContainerProperties).forEach((key) => {
    // Add outside selected section's form (before the form anchor)
    if (key === parentKey) {
      rebuiltOutsideProperties[newKey] = newProp;
    }

    rebuiltOutsideProperties[key] = outsideContainerProperties[key];
  });

  outsideContainerSchema.properties = rebuiltOutsideProperties;
  if (outsideContainerSchemaPath) {
    setValueByPath(schemaClone, outsideContainerSchemaPath, outsideContainerSchema);
  }

  schemaModel.value = schemaClone;
  initializeModelValueForAddedComponent(id, newKey, outsideContainerSchemaPath);

  const outsideSchemaPath = getSchemaPathFromPositionPath(outsideContainerSchemaPath);
  const addedSchemaPath = [outsideSchemaPath, newKey].filter(Boolean).join('.');
  selectComponentBySchemaPath(addedSchemaPath);

  return true;
}

// Adds component inside LxSection, LxStack or (toListItems) the custom items of the selected list
function addComponentInside(id, toListItems = false) {
  // find position in schema
  const positionPath = toListItems
    ? [...findPositionInSchema(schemaPath.value), 'items']
    : findPositionInSchema(schemaPath.value, customItemPath.value);

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;
  if (!positionValue) return;

  const insertAfterKey = Object.keys(positionValue.properties || {})[
    Object.keys(positionValue.properties || {}).length - 1
  ];
  const newKey = lxStringUtils.generateUUID();

  const newProp =
    toListItems || customItemPath.value
      ? withFlatCustomItemModelPath(id, getNewItemSchema(id), newKey)
      : getNewItemSchema(id);

  const oldProps = positionValue.properties || {};
  const newProps = {};

  Object.keys(oldProps).forEach((key) => {
    newProps[key] = oldProps[key];
  });

  if (insertAfterKey) {
    Object.keys(newProps).forEach((key) => {
      if (key === insertAfterKey) {
        newProps[newKey] = newProp;
      }
    });
  } else {
    newProps[newKey] = newProp;
  }

  positionValue.properties = newProps;

  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  setValueByPath(schemaClone, positionPath, positionValue);
  schemaModel.value = schemaClone;

  if (toListItems || customItemPath.value) {
    // Added inside list custom items (or inside a custom item stack), its value is stored flat in the list row
    const addedKeys = [...(toListItems ? [] : getCustomItemKeys(customItemPath.value)), newKey];
    initializeListRowsValueForAddedCustomItem(id, schemaPath.value, [newKey]);
    // Custom items are registered with the list schemaPath and their own customItemPath
    selectComponentBySchemaPath(schemaPath.value, buildCustomItemPath(addedKeys));
    return;
  }

  initializeModelValueForAddedComponent(id, newKey, positionPath);

  const containerSchemaPath = getSchemaPathFromPositionPath(positionPath);
  const addedSchemaPath = [containerSchemaPath, newKey].filter(Boolean).join('.');
  selectComponentBySchemaPath(addedSchemaPath);
}

// Enables custom items for the selected list and adds the component as its first custom item, wrapped in LxStack
function addFirstCustomItemInStack(id) {
  const listPositionPath = findPositionInSchema(schemaPath.value);
  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  const listSchema = getValueByPath(schemaClone, listPositionPath);
  if (!listSchema) return;

  listSchema.lx = { ...(listSchema.lx || {}), hasCustomItems: 'nested' };

  const stackKey = lxStringUtils.generateUUID();
  const stackSchema = { ...getNewItemSchema('LxStack'), properties: {} };
  const addedKeys = [stackKey];

  if (id !== 'LxStack') {
    const newKey = lxStringUtils.generateUUID();
    stackSchema.properties[newKey] = withFlatCustomItemModelPath(id, getNewItemSchema(id), newKey);
    addedKeys.push(newKey);
  }

  // New custom item definitions, the LxStack wrapper is the only top level custom item
  listSchema.items = {
    ...(listSchema.items || {}),
    type: 'object',
    properties: { [stackKey]: stackSchema },
  };
  schemaModel.value = schemaClone;

  // The value of the added custom item is stored flat in the list row
  initializeListRowsValueForAddedCustomItem(id, schemaPath.value, addedKeys.slice(-1));
  selectComponentBySchemaPath(schemaPath.value, buildCustomItemPath(addedKeys));
}

// Asks for confirmation before adding the first custom item to the selected list
function openAddFirstCustomItemConfirm(id) {
  confirmDialogObject.value = {
    label: displayTexts.value?.confirmAddCustomItem,
    description: displayTexts.value?.confirmAddCustomItemDescription,
    kind: 'info',
    primaryAction: () => {
      addFirstCustomItemInStack(id);
      confirmDialog.value.close();
    },
    secondaryAction: null,
  };
  confirmDialog.value.open();
}

// Selects component in constructor based on provided item
function componentChangeFromPanel(item) {
  let elem = null;
  if (item.name === 'LxRow') {
    elem = document.querySelector(`#${item.id}-wrapper`);
  } else {
    elem = document.querySelector(`[data-id="${item.id}"]`);
    if (!elem) {
      elem = document.getElementById(item.id);
    }
  }

  if (elem) {
    selectElement({ target: elem });
  }
}

// Handles component addition logic - wheter confirmation modal should be opened or no
function openAddComponentOptions(id) {
  componentToAdd.value = id;

  if (componentName.value === 'LxViewLayout') {
    addComponentInside(id);
  } else if (
    componentName.value === 'LxForm' ||
    // componentName.value === 'LxFilters' ||
    componentName.value === 'LxSection'
  ) {
    if (id === 'LxSection') {
      addComponentInside(id);
    } else if (navigation.value.some((nav) => nav.name === 'LxFilters')) {
      // If LxSection is inside LxFilters then component can be added only inside it
      addComponentInside(id);
    } else {
      // Else have option to add it inside or outside
      componentAddModal.value.open();
    }
  } else if (
    componentName.value === 'LxList' &&
    templateMode.value &&
    currentItem.value?.lx?.hasCustomItems
  ) {
    addComponentInside(id, true);
  } else if (componentName.value === 'LxList' && templateMode.value) {
    openAddFirstCustomItemConfirm(id);
  } else if (componentName.value === 'LxStack' && customItemPath.value) {
    addComponentInside(id);
  } else addComponent(id);
}

// Handles component addition modal actions
function addModalActionClicked(_, actionId) {
  if (actionId === 'inside') {
    // add inside
    addComponentInside(componentToAdd.value);
    componentAddModal.value.close();
  } else if (actionId === 'next') {
    // add after
    if (componentName.value === 'LxSection') {
      const isAddedOutside = addComponentOutsideSelectedSection(componentToAdd.value);
      if (!isAddedOutside) {
        addComponent(componentToAdd.value);
      }
    } else {
      addComponent(componentToAdd.value);
    }
    componentAddModal.value.close();
  }
}

function clearSelectedElement() {
  highlight.value.visible = false;
  highlight.value.detached = false;
  highlight.value.el = null;
  highlight.value.itemId = null;
  linkedHighlights.value = [];
  componentName.value = null;
  navigation.value = [];
  currentItem.value = null;
  customItemPath.value = null;
  resetNextElementInfo();
  resetLowerNestingInfo();

  // reset panel template mode
  templateMode.value = false;
}

// Removes the selected component from schema
function removeCurrentComponent() {
  // find position in schema
  const { positionPath, key: removeKey } = getSelectedPosition();

  // remember custom item context before schema changes
  const removedCustomItemPath = customItemPath.value;
  const listSchemaPath = schemaPath.value;

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;

  const oldProps = positionValue.properties;
  const newProps = {};

  // copy over all properties except the one to remove
  Object.keys(oldProps).forEach((key) => {
    if (key !== removeKey) {
      newProps[key] = oldProps[key];
    }
  });

  positionValue.properties = newProps;

  // set back the modified value to schema
  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  setValueByPath(schemaClone, positionPath, positionValue);
  schemaModel.value = schemaClone;

  if (removedCustomItemPath && templateMode.value) {
    // Keep template mode and select the stack (or the LxList itself) that contained the removed element
    const parentKeys = getCustomItemKeys(removedCustomItemPath).slice(0, -1);
    highlight.value.visible = false;
    linkedHighlights.value = [];
    selectComponentBySchemaPath(
      listSchemaPath,
      parentKeys.length ? buildCustomItemPath(parentKeys) : null
    );
  } else if (!props.schema?.properties || Object.keys(props.schema?.properties).length === 0) {
    // If view is empty after removing the component, hilight the LxViewLayout
    const viewLayout = document.querySelector('.lx-view-layout');
    if (viewLayout) {
      setTimeout(() => {
        selectElement({ target: viewLayout });
      }, 100);
    }
  } else {
    clearSelectedElement();
  }
}

// Duplicate the selected component in schema
function duplicateCurrentComponent() {
  // find position in schema
  const { positionPath, key: duplicateKey } = getSelectedPosition();

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;

  const newKey = lxStringUtils.generateUUID();

  const newProp = lxFormatUtils.objectClone(positionValue.properties[duplicateKey]);

  const oldProps = positionValue.properties;
  const newProps = {};

  // copy over all properties and add duplicate after original
  Object.keys(oldProps).forEach((key) => {
    newProps[key] = oldProps[key];

    if (key === duplicateKey) {
      newProps[newKey] = newProp;
    }
  });

  positionValue.properties = newProps;

  const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
  setValueByPath(schemaClone, positionPath, positionValue);
  schemaModel.value = schemaClone;

  // Duplicate modelValue for every duplicated component
  const modelClone = lxFormatUtils.objectClone(model.value || {});
  const modelContainerPath = getModelPathFromSchemaPath(positionPath);
  const duplicatedModelValue = getValueByPath(modelClone, [...modelContainerPath, duplicateKey]);

  if (!lxGeneralUtils.isNil(duplicatedModelValue)) {
    setValueByPath(
      modelClone,
      [...modelContainerPath, newKey],
      lxFormatUtils.objectClone(duplicatedModelValue)
    );
    model.value = modelClone;
    emits('update:modelValue', modelClone);
  }

  const parentSchemaPath = getSchemaPathFromPositionPath(positionPath);
  const duplicatedSchemaPath = [parentSchemaPath, newKey].filter(Boolean).join('.');
  selectComponentBySchemaPath(duplicatedSchemaPath);
}

// Moves the selected component up of down in schema in the same nesting level
function moveElement(direction) {
  // find position in schema
  const { positionPath, key: moveKey } = getSelectedPosition();

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;

  const oldProps = positionValue.properties;
  const newProps = {};

  // copy over all properties except the one to remove
  const keys = Object.keys(oldProps);
  const idx = keys.indexOf(moveKey);

  if ((direction === 'up' && idx > 0) || (direction === 'down' && idx < keys.length - 1)) {
    // Move up only if not first
    if (direction === 'up') {
      keys.forEach((key, i) => {
        // Insert moveKey one position before its current index
        if (i === idx - 1) {
          newProps[moveKey] = oldProps[moveKey];
        }
        if (key !== moveKey) {
          newProps[key] = oldProps[key];
        }
      });
    } else if (direction === 'down') {
      // Move down only if not last
      keys.forEach((key, i) => {
        if (key !== moveKey) {
          newProps[key] = oldProps[key];
        }
        // Insert moveKey one position after its current index
        if (i === idx + 1) {
          newProps[moveKey] = oldProps[moveKey];
        }
      });
    }
    positionValue.properties = newProps;

    const schemaClone = lxFormatUtils.objectClone(schemaModel.value);
    setValueByPath(schemaClone, positionPath, positionValue);
    schemaModel.value = schemaClone;

    nextTick(() => {
      updateSelectedElement();
      getPositionInfo(schemaModel.value, currentItem.value);
    });
  }
}

function exportClicked() {
  exportModal.value.open();
}

function copySchema() {
  navigator.clipboard.writeText(JSON.stringify(schemaModel.value, null, 2));
  emits('schemaCopy');
}

// Saves the current schema as .json file
function saveToFile() {
  const data = JSON.stringify(schemaModel.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schema.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Handles export modal actions
function exportToolbarClicked(actionId) {
  if (actionId === 'download') {
    saveToFile();
  } else if (actionId === 'copy') {
    copySchema();
  }
}

// Opens import modal
function importClicked() {
  importContentValue.value = 'file';
  importInvalidMessage.value = null;
  importModal.value.open();
}

// Checks if provided values is valid JSON object
function isValidJSONObject(value) {
  try {
    const parsed = JSON.parse(value);

    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

// Decodes the base64 value into utf-8 string
function decodeBase64Utf8(base64Value) {
  const binary = atob(base64Value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

// Handles file upload from LxFileUploader component
function fileUpload(file) {
  if (file?.length === 0) {
    importFile.value = [];
    fileContent.value = null;
    return;
  }
  importFile.value = file;

  const base64 = file[0].content?.split(',')[1];
  if (!base64) {
    fileContent.value = null;
    emits('error', 'invalidFileContent');
    return;
  }

  const text = decodeBase64Utf8(base64);
  fileContent.value = text;
}

// Handles import modal actions
function importActionClicked(actionId) {
  if (actionId === 'save' && fileContent.value) {
    importInvalidMessage.value = null;
    if (!isValidJSONObject(fileContent.value)) {
      importInvalidMessage.value = displayTexts.value?.invalidJsonObject;

      emits('error', 'invalidJson');
      return;
    }
    try {
      const parsed = JSON.parse(fileContent.value);
      schemaModel.value = parsed;
      importModal.value.close();

      // Clear selection after import
      clearSelectedElement();
    } catch {
      importInvalidMessage.value = displayTexts.value?.parseJsonError;
      emits('error', 'parseJsonError');
    }
  }
}

const importFileSave = ref(null);

function confirmFileImport(actionId) {
  if (actionId === 'save' && fileContent.value) {
    importFileSave.value = importFile.value;
    importModal.value.close();
    confirmDialogObject.value = {
      label: displayTexts.value?.confirmImport,
      description: displayTexts.value?.confirmImportDescription,
      kind: 'question',
      primaryAction: () => {
        importFile.value = importFileSave.value;
        fileUpload(importFileSave.value);
        importActionClicked('save');
        confirmDialog.value.close();
      },
      secondaryAction: () => {
        confirmDialog.value.close();
        importModal.value.open();
        importFile.value = importFileSave.value;
        fileUpload(importFileSave.value);
      },
    };
    confirmDialog.value.open();
  }
}

// Opens schema editing modal
function editSchemaClicked() {
  editSchemaInvalidMessage.value = null;
  editSchemaContent.value = JSON.stringify(schemaModel.value, null, 2);
  editSchemaModal.value.open();
}

// Handles schema editing modal actions
function editSchemaActionClicked(actionId) {
  if (actionId === 'save' && editSchemaContent.value) {
    if (!isValidJSONObject(editSchemaContent.value)) {
      editSchemaInvalidMessage.value = displayTexts.value?.invalidJsonObject;

      emits('error', 'invalidJson');
      return;
    }
    try {
      const parsed = JSON.parse(editSchemaContent.value);
      schemaModel.value = parsed;
      editSchemaModal.value.close();
    } catch {
      emits('error', 'parseJsonError');
    }
  }
}

const editModelModal = ref(null);
const editModelContent = ref(null);
const editModelInvalidMessage = ref(null);

// Opens modelValue editing modal
function editModelClicked() {
  editModelInvalidMessage.value = null;
  editModelContent.value = JSON.stringify(model.value, null, 2);
  editModelModal.value.open();
}

// Handles modelValue editing modal actions
function editModelActionClicked(actionId) {
  if (actionId === 'save' && editModelContent.value) {
    if (!isValidJSONObject(editModelContent.value)) {
      editModelInvalidMessage.value = displayTexts.value?.invalidJsonObject;
      emits('error', 'invalidJson');
      return;
    }
    try {
      const parsed = JSON.parse(editModelContent.value);
      model.value = parsed;
      editModelModal.value.close();
    } catch {
      emits('error', 'parseJsonError');
    }
  }
}

// Updates the root LxViewLayout component
function updateViewLayout(newValue) {
  if (newValue === 'form' || newValue === 'list') {
    const newSchema = lxFormatUtils.objectClone(schemaModel.value);
    if (newSchema?.properties) {
      Object.entries(newSchema.properties).forEach(([key, value]) => {
        const itemDisplayType = value?.lx?.displayType;

        if (itemDisplayType === 'filters' && newValue === 'form') {
          newSchema.properties[key].lx.displayType = 'form';
        }
        if (itemDisplayType === 'form' && newValue === 'list') {
          newSchema.properties[key].lx.displayType = 'filters';
        }
      });
    }

    schemaModel.value = newSchema;
  }
}

function goToIssues() {
  globalThis.open('https://github.com/dativa-lv/lx-builders/issues', '_blank', 'noopener');
}

// Updates selected element side when screen size changes
watch(
  () => [width.value, height.value],
  () => {
    updateSelectedElement();
  }
);

// Opens the confirmation dialog for component removal
function openRemoveComponentConfirmation() {
  confirmDialogObject.value = {
    label: displayTexts.value?.confirmDelete,
    description: null,
    kind: 'warning',
    primaryAction: () => {
      removeCurrentComponent();
      confirmDialog.value.close();
    },
    secondaryAction: null,
  };
  confirmDialog.value.open();
}

// Renames the key value in schema
function renameKey(obj, oldKey, newKey) {
  if (oldKey === newKey || !Object.prototype.hasOwnProperty.call(obj, oldKey)) {
    return obj;
  }

  const renamedObject = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (key === oldKey) {
      renamedObject[newKey] = value;
    } else {
      renamedObject[key] = value;
    }
  });

  return renamedObject;
}

// Handles the logic of schema key update
function updateSchemaKey(newKey) {
  try {
    if (!newKey) {
      schemaKeyError.value = displayTexts.value?.schemaKeyEmptyError;
      return;
    }

    if (!parentItem.value) {
      schemaKeyError.value = displayTexts.value?.schemaKeyParentError;
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(parentItem.value, newKey) &&
      newKey !== schemaKey.value
    ) {
      const res = displayTexts.value?.schemaKeyDuplicateError?.replace('{0}', newKey);
      schemaKeyError.value = res;
      return;
    }

    schemaKeyError.value = null;

    const res = renameKey(parentItem.value, schemaKey.value, newKey);
    const parentSchemaPath = schemaPath.value?.includes('.')
      ? schemaPath.value?.split('.')?.join('.')
      : null;

    setValueByPath(
      schemaModel.value,
      findPositionInSchema(parentSchemaPath, customItemPath.value)?.slice(0, -1),
      res
    );
  } catch {
    schemaKeyError.value = displayTexts.value?.schemaKeyUpdateError;
  }
}

function outsideClickListener() {
  document.addEventListener('click', (e) => {
    const path = e.composedPath();
    const isInside = (selector) =>
      path.some((el) => el instanceof Element && el.matches?.(selector));

    if (
      !isInside('#constructor') &&
      !isInside('.lx-panel') &&
      !isInside('.popper') &&
      !isInside('#modals') &&
      !isInside('.highlight')
    ) {
      clearSelectedElement();
    }
  });
}

let constructorMutationObserver = null;
let constructorResizeObserver = null;

// When component is mounted adds event listeners for click and keyboard keys for moving elements
onMounted(() => {
  const constructorEl = document.getElementById('constructor');
  constructorEl?.addEventListener('click', (e) => {
    selectElement(e);
  });
  outsideClickListener();

  // Keep highlights in sync with layout after re-renders, stack layout changes and transitions
  if (constructorEl) {
    constructorMutationObserver = new MutationObserver(updateSelectedElement);
    constructorMutationObserver.observe(constructorEl, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    constructorResizeObserver = new ResizeObserver(updateSelectedElement);
    constructorResizeObserver.observe(constructorEl);
    constructorEl.addEventListener('transitionend', updateSelectedElement);
    constructorEl.addEventListener('animationend', updateSelectedElement);
  }

  // Does not allow to scroll the page when arrow keys are pressed
  document?.addEventListener('keydown', (e) => {
    if (!canHandleGlobalArrowKeys(e.target)) {
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
  });

  // Selected element moving, using arrow keys
  document?.addEventListener('keyup', (e) => {
    if (!canHandleGlobalArrowKeys(e.target)) {
      return;
    }

    e.preventDefault();
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      if (canMoveComponent()) {
        moveElement('up');
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      if (canMoveComponent()) {
        moveElement('down');
      }
    }
  });
});

onBeforeUnmount(() => {
  constructorMutationObserver?.disconnect();
  constructorResizeObserver?.disconnect();
});

// Checks if the path is or goes through a list that has lx.hasCustomItems
function isInsideCustomItemsList(path) {
  const keys = path?.split('.') ?? [];
  let node = schemaModel.value;

  return keys.some((key) => {
    node = node?.properties?.[key];
    return !!node?.lx?.hasCustomItems;
  });
}

const schemaInfo = computed(() => {
  const hasForm = Object.values(schemaModel.value?.properties || {}).some(
    (prop) => prop.type === 'object' && prop.lx?.displayType === 'form'
  );
  const hasFilters = Object.values(schemaModel.value?.properties || {}).some(
    (prop) => prop.type === 'object' && prop.lx?.displayType === 'filters'
  );
  const isSectionInFilterForm =
    hasFilters &&
    Object.values(schemaModel.value?.properties || {}).some(
      (prop) =>
        prop.type === 'object' &&
        prop.lx?.displayType === 'filters' &&
        Object.values(prop.properties || {}).some(
          (childProp) => childProp.type === 'object' && childProp.lx?.displayType === 'section'
        )
    );

  return {
    hasForm,
    hasFilters,
    isSectionInFilterForm,
    isInsideCustomItemsList: !!customItemPath.value || isInsideCustomItemsList(schemaPath.value),
  };
});

const selectedModelForCurrentPath = computed(() => {
  if (!schemaPath.value) return null;

  const modelPath = schemaPath.value.split('.').filter(Boolean);
  if (!modelPath.length) return model.value;

  return getValueByPath(model.value, modelPath);
});

function updateSelectedModelForCurrentPath(value) {
  if (!schemaPath.value) return;

  const modelPath = schemaPath.value.split('.').filter(Boolean);
  const modelClone = lxFormatUtils.objectClone(model.value || {});

  if (!modelPath.length) {
    model.value = value;
    return;
  }

  setValueByPath(modelClone, modelPath, value);
  model.value = modelClone;
}

function addSelectedListItem() {
  const items = selectedModelForCurrentPath.value;
  if (!Array.isArray(items) || !items.length) return;

  const lastItem = items[items.length - 1];
  if (!lastItem || typeof lastItem !== 'object' || Array.isArray(lastItem)) return;

  const newItem = lxFormatUtils.objectClone(lastItem);
  const idAttribute = currentItem.value?.lx?.idAttribute || 'id';
  newItem[idAttribute] = lxStringUtils.generateUUID();
  updateSelectedModelForCurrentPath([...items, newItem]);
  updateSelectedElement();
}

const isSchemaEmpty = computed(
  () => !schemaModel.value || Object.keys(schemaModel.value?.properties || {}).length === 0
);

function getSelectedElementPathInSchema() {
  return schemaPath.value || null;
}

defineExpose({
  selectElement,
  setPanelTab,
  getSelectedElementPathInSchema,
  clearSelectedElement,
});
</script>
<template>
  <div class="lx-constructor">
    <div id="constructor-overlay">
      <div
        v-for="(style, index) in linkedHighlights"
        :key="index"
        class="highlight highlight-linked"
        :style="style"
        :class="{ 'template-mode': templateMode }"
      />
      <div
        v-show="highlight.visible && !highlight.detached"
        class="highlight"
        :style="highlight.style"
        :class="{ 'template-mode': templateMode }"
      >
        <div class="highlight-toolbar" ref="highlightToolbar">
          <LxButton
            v-if="
              elementInfo.canMoveForwardIn &&
              canMoveComponent() &&
              (!templateMode || customItemPath)
            "
            icon="move-inside"
            variant="icon-only"
            :label="displayTexts.moveInside"
            kind="ghost"
            @click="moveElementInside()"
          />
          <LxButton
            v-if="elementInfo.moveOut && canMoveComponent() && (!templateMode || customItemPath)"
            icon="move-outside"
            variant="icon-only"
            :label="displayTexts.moveOutside"
            kind="ghost"
            @click="moveElementOutside('previous')"
          />

          <LxStack orientation="horizontal" kind="compact" v-if="canMoveComponent()">
            <LxButton
              v-if="elementInfo.canMoveBack"
              icon="back"
              variant="icon-only"
              :label="displayTexts.back"
              kind="ghost"
              @click="moveElement('up')"
            />
            <LxButton
              v-if="elementInfo.canMoveForward"
              icon="next"
              variant="icon-only"
              :label="displayTexts.next"
              kind="ghost"
              @click="moveElement('down')"
            />
          </LxStack>
          <span>{{ componentName }}</span>
          <LxButton
            v-if="componentName !== 'LxViewLayout' && isToolbarSmaller"
            icon="delete"
            variant="icon-only"
            :label="displayTexts.delete"
            kind="ghost"
            :destructive="true"
            @click="openRemoveComponentConfirmation"
          />
        </div>
        <div class="highlight-toolbar highlight-toolbar-remove">
          <LxButton
            v-if="componentName !== 'LxViewLayout' && !isToolbarSmaller"
            icon="delete"
            variant="icon-only"
            :label="displayTexts.delete"
            kind="ghost"
            :destructive="true"
            @click="openRemoveComponentConfirmation"
          />
        </div>
        <div class="highlight-footer">
          <LxButton
            v-if="componentName === 'LxList' && !templateMode"
            icon="add-item"
            variant="icon-only"
            :label="displayTexts.addItemButtonTooltip"
            :disabled="
              !Array.isArray(selectedModelForCurrentPath) || !selectedModelForCurrentPath.length
            "
            kind="ghost"
            @click="addSelectedListItem"
          />
        </div>
      </div>
    </div>
    <Teleport :to="panelTeleportTarget" :disabled="!panelTeleportTarget" defer>
      <Panel
        :componentName="componentName"
        :componentProps="componentProps"
        :componentPropsDefinitions="componentPropsDefinitions"
        :navigation="navigation"
        :componentModel="currentItem"
        :selectedModel="selectedModelForCurrentPath"
        :schemaKey="schemaKey"
        :schemaKeyError="schemaKeyError"
        :schemaInfo="schemaInfo"
        v-model:selectedTab="panelTab"
        v-model:templateMode="templateMode"
        :hasAiChat="hasAiChat"
        :chatItems="chatItems"
        :chatBusy="chatBusy"
        :chatLoading="chatLoading"
        :chatUserDefinitions="chatUserDefinitions"
        :chatHasUndoChange="chatHasUndoChange"
        :chatTyping="chatTyping"
        :chatTypingUsers="chatTypingUsers"
        :texts="displayTexts"
        @update:componentModel="updateSchemaFromPanel"
        @componentAdd="openAddComponentOptions"
        @componentChange="componentChangeFromPanel"
        @removeComponent="removeCurrentComponent"
        @duplicateComponent="duplicateCurrentComponent"
        @export="exportClicked"
        @import="importClicked"
        @editSchema="editSchemaClicked"
        @editModel="editModelClicked"
        @reportIssue="goToIssues"
        @update:viewLayout="updateViewLayout"
        @update:schemaKey="updateSchemaKey"
        @update:selectedModel="updateSelectedModelForCurrentPath"
        @send="(x) => emits('send', x)"
        @error="(x) => emits('error', x)"
        @messageActionClick="(x) => emits('messageActionClick', x)"
      />
    </Teleport>

    <div
      id="constructor"
      :class="[{ 'empty-schema': isSchemaEmpty }, { 'template-mode': templateMode }]"
    >
      <LxViewBuilder :schema="schema" v-model="model" :builderOptions="{ useRegistry: true }" />
    </div>

    <LxModal
      ref="exportModal"
      :label="displayTexts?.exportModal"
      size="m"
      :actionDefinitions="[{ id: 'close', name: displayTexts?.close, kind: 'secondary' }]"
      :texts="{ close: displayTexts?.close }"
    >
      <LxToolbar
        :actionDefinitions="[
          {
            id: 'download',
            name: displayTexts?.download,
            icon: 'download',
            kind: 'primary',
            area: 'left',
          },
          { id: 'copy', name: displayTexts?.copy, icon: 'copy' },
        ]"
        @actionClick="exportToolbarClicked"
      />
      <div class="code-display">
        <pre class="code">{{ JSON.stringify(schemaModel, null, 2) }}</pre>
      </div>
    </LxModal>

    <LxModal
      ref="importModal"
      :label="displayTexts?.importModal"
      size="m"
      :actionDefinitions="[
        { id: 'save', name: displayTexts?.save, kind: 'primary', disabled: isUploadable },
        { id: 'close', name: displayTexts?.close, kind: 'secondary' },
      ]"
      :texts="{ close: displayTexts?.close }"
      @actionClick="confirmFileImport"
      @close="
        () => {
          importFile = null;
          fileContent = null;
        }
      "
    >
      <div class="import-switcher">
        <LxContentSwitcher
          v-model="importContentValue"
          :items="[
            { id: 'file', name: displayTexts?.importFile },
            { id: 'text', name: displayTexts?.importText },
          ]"
        />
      </div>

      <div v-show="importContentValue === 'file'">
        <LxFileUploader
          :modelValue="importFile"
          :draggable="true"
          :allowedFileExtensions="['.json']"
          dataType="content"
          :texts="displayTexts?.fileUploader"
          @update:modelValue="fileUpload"
        />
      </div>

      <LxTextArea
        v-show="importContentValue === 'text'"
        v-model="fileContent"
        :rows="20"
        :invalid="!!importInvalidMessage"
        :invalidationMessage="importInvalidMessage"
      />
    </LxModal>

    <LxModal
      ref="editSchemaModal"
      :label="displayTexts?.editSchemaModal"
      size="l"
      :actionDefinitions="[
        { id: 'save', name: displayTexts?.save, kind: 'primary', disabled: !editSchemaContent },
        { id: 'close', name: displayTexts?.close, kind: 'secondary' },
      ]"
      :texts="{ close: displayTexts?.close }"
      @actionClick="editSchemaActionClicked"
    >
      <LxTextArea
        v-model="editSchemaContent"
        :rows="50"
        :invalid="!!editSchemaInvalidMessage"
        :invalidationMessage="editSchemaInvalidMessage"
      />
    </LxModal>

    <LxModal
      ref="componentAddModal"
      :label="displayTexts?.componentAddModal"
      :description="displayTexts?.componentAddModalDescription"
      :texts="{ close: displayTexts?.close }"
    >
      <p class="component-add-text">{{ displayTexts?.componentAddChoice }}</p>
      <LxList
        :items="[
          {
            id: 'next',
            name: displayTexts?.componentAddNext,
            description: displayTexts?.componentAddNextDescription,
            displayIcon: 'move-outside',
          },
          {
            id: 'inside',
            name: displayTexts?.componentAddInside,
            description: displayTexts?.componentAddInsideDescription,
            displayIcon: 'move-inside',
          },
        ]"
        listType="1"
        clickableAttribute="id"
        icon="next"
        @actionClick="addModalActionClicked"
      >
        <template #customItem="item">
          <LxStack orientation="horizontal" verticalAlignment="center">
            <LxIcon :value="item.displayIcon" />
            <LxStack kind="compact">
              <p class="lx-primary">{{ item.name }}</p>
              <p class="lx-secondary">{{ item.description }}</p>
            </LxStack>
          </LxStack>
        </template>
      </LxList>
    </LxModal>

    <LxModal
      ref="editModelModal"
      :label="displayTexts?.editModelModal"
      size="l"
      :actionDefinitions="[
        { id: 'save', name: displayTexts?.save, kind: 'primary', disabled: !editModelContent },
        { id: 'close', name: displayTexts?.close, kind: 'secondary' },
      ]"
      :texts="{ close: displayTexts?.close }"
      @actionClick="editModelActionClicked"
    >
      <LxTextArea
        v-model="editModelContent"
        :rows="20"
        :invalid="!!editModelInvalidMessage"
        :invalidationMessage="editModelInvalidMessage"
      />
    </LxModal>

    <LxDialog
      ref="confirmDialog"
      :label="confirmDialogObject?.label"
      :description="confirmDialogObject?.description"
      :kind="confirmDialogObject?.kind"
      :actionDefinitions="[
        { id: 'save', name: displayTexts?.yes, kind: 'primary' },
        { id: 'cancel', name: displayTexts?.no, kind: 'secondary' },
      ]"
      :buttonSecondaryIsCancel="confirmDialogObject?.secondaryAction ? false : true"
      :texts="{ close: displayTexts?.close }"
      @actionClick="
        (actionId) => {
          if (actionId === 'save' && confirmDialogObject?.primaryAction) {
            confirmDialogObject.primaryAction();
          } else if (actionId === 'cancel' && confirmDialogObject?.secondaryAction) {
            confirmDialogObject.secondaryAction();
          }
        }
      "
    />
  </div>
</template>
