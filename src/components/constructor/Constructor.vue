<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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
  edit: 'Labot',

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
};

const displayTexts = computed(() => lxGeneralUtils.getDisplayTexts(props.texts, textsDefault));

const model = ref({});

const emits = defineEmits(['update:schema', 'update:modelValue', 'error', 'schemaCopy']);

const schemaModel = computed({
  get() {
    return props.schema;
  },
  set(value) {
    emits('update:schema', value);
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

const panelTabl = ref(null);

const confirmDialog = ref();

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

// Positions the selection highlight over the provided DOM element
function colorBorder(e) {
  highlight.value.el = e.target;

  if (!highlight.value.el) return;

  const r = highlight.value.el.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  const p = highlight.value.padding;

  highlight.value.style = {
    left: `${r.left - p}px`,
    top: `${r.top - p + scrollY}px`,
    width: `${r.width + p * 2}px`,
    height: `${r.height + p * 2}px`,
  };
  highlight.value.visible = true;
}

function updateSelectedElement() {
  nextTick(() => {
    colorBorder({ target: highlight.value.el });
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
function findPositionInSchema(path = null) {
  const pathToUse = path || schemaPath.value;
  const res = [];

  schemaPropertiesStack.value = pathToUse?.split('.');
  schemaPropertiesStack.value?.forEach((x) => {
    res.push('properties', x);
  });
  return res;
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

  if (!hasProperties) {
    return false;
  }

  if (getItemDisplayType(item) !== 'form') {
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

  navigationNames.includes('LxSection', formIndex + 1);
}

// Updated infomration about the currenly selected element:
// Can it be moved to left or right, can it be moved outside or inside and more
function getPositionInfo(schema, currentSchema) {
  if (!schemaPath.value || !currentSchema) {
    resetElementInfo();
  }

  const currentKey = schemaPath.value?.split('.')?.slice(-1)[0];
  const parentPath = schemaPath.value?.includes('.')
    ? schemaPath.value?.split('.')?.slice(0, -1)?.join('.')
    : null;

  const parentSchema = parentPath
    ? getValueByPath(schema, findPositionInSchema(parentPath))
    : schema;
  const siblingProperties = parentSchema?.properties;

  const siblingKeys = Object.keys(siblingProperties);
  const currentIndex = siblingKeys.indexOf(currentKey);
  const nextKey = currentIndex >= 0 ? siblingKeys[currentIndex + 1] : null;
  const nextSchema = nextKey ? siblingProperties[nextKey] : null;
  const previousKey = currentIndex > 0 ? siblingKeys[currentIndex - 1] : null;

  elementInfo.value.canMoveBack = !!previousKey;
  elementInfo.value.canMoveForward = !!nextKey;

  // Move inside is allowed only forward
  elementInfo.value.canMoveForwardIn =
    hasContainerProperties(nextSchema) && componentName.value !== 'LxSection';

  const grandParentPath = parentPath?.includes('.')
    ? parentPath?.split('.')?.slice(0, -1).join('.')
    : null;
  const parentKey = parentPath?.split('.')?.slice(-1)[0] || null;
  const canMoveOut = !!parentPath && !!parentKey && !!grandParentPath;

  elementInfo.value.moveOut = canMoveOut && !checkIfInsideFilterSection(navigation.value);
}

// Listens for click on the constructor area
// identifies the clicked component based on the builderRegistry and updates state
function clickEventListener() {
  document.getElementById('constructor')?.addEventListener('click', (e) => {
    let elem = e.target;
    let registryElem = null;
    // Walk up the DOM tree until we find an element with an id in the registry
    while (elem) {
      if ((elem.dataset.id && builderRegistry.get(elem.dataset.id)) || isLxRowClicked(elem.id)) {
        if (isLxRowClicked(elem.id)) {
          const lxRowWrapper = elem.id?.replace(/-wrapper$/, '');
          registryElem = builderRegistry.get(lxRowWrapper);
        } else {
          registryElem = builderRegistry.get(elem.dataset.id || elem.id);
        }
        break;
      }

      elem = elem.parentElement;
    }

    if (registryElem) {
      componentName.value = registryElem.type;
      componentPropsDefinitions.value = registryElem.node.type.props;
      componentProps.value = lxFormatUtils.objectClone(registryElem.props);
      colorBorder({ target: elem });
      schemaPath.value = registryElem.builderName;
      navigation.value = registryElem.componentStack;
      schemaKey.value = schemaPath.value?.includes('.')
        ? schemaPath.value?.split('.')?.slice(-1)[0]
        : schemaPath.value;
      schemaKeyError.value = null;
    }

    // Find the selected item in schema
    currentItem.value = getValueByPath(schemaModel.value, findPositionInSchema());

    const parentSchemaPath = schemaPath.value?.includes('.')
      ? schemaPath.value?.split('.')?.join('.')
      : null;

    // Find the parent item of selected item in schema
    parentItem.value = getValueByPath(
      schemaModel.value,
      findPositionInSchema(parentSchemaPath)?.slice(0, -1)
    );

    // Update information about selected element
    getPositionInfo(schemaModel.value, currentItem.value);

    // Open the tab with component configuration
    panelTabl.value = 'config';
  });
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
  const res = [];
  schemaPropertiesStack.value = schemaPath.value?.split('.');
  schemaPropertiesStack.value?.forEach((x) => {
    res.push('properties', x);
  });

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

// Makes component selected based on provided schemaPath
function selectComponentBySchemaPath(newSchemaPath) {
  if (!newSchemaPath) return;

  nextTick(() => {
    const registryItems = Array.from(builderRegistry.all().entries());
    const targetEntry = registryItems.find(([, item]) => item?.builderName === newSchemaPath);
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

function moveElementInside() {
  if (!schemaPath.value) return;

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
    const targetSectionEntries = Object.entries(targetSchema.properties || {}).filter(
      ([, child]) => getItemDisplayType(child) === 'section'
    );

    const targetSectionEntry = targetSectionEntries[0];

    const [sectionKey, sectionSchema] = targetSectionEntry;

    targetContainerSchema = sectionSchema;
    targetContainerPath = [targetContainerPath, sectionKey].filter(Boolean).join('.');
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

// Moves element outside of current container
function moveElementOutside(position) {
  if (!schemaPath.value || (position !== 'next' && position !== 'previous')) return;

  const currentSchemaPath = schemaPath.value;
  const currentKey = schemaPath.value?.split('.')?.slice(-1)[0];
  const parentPath = schemaPath.value?.includes('.')
    ? schemaPath.value?.split('.')?.slice(0, -1)?.join('.')
    : null;

  if (!parentPath) return;

  const grandParentPath = parentPath?.includes('.')
    ? parentPath?.split('.')?.slice(0, -1)?.join('.')
    : null;
  const parentKey = parentPath?.split('.')?.slice(-1)[0] || null;
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

  let outsideContainerSchema = grandParentSchema;
  let outsideContainerSchemaPath = grandParentSchemaPath;
  let outsideContainerProperties = grandParentProperties;
  let outsideAnchorKey = parentKey;

  if (
    getItemDisplayType(parentSchema) === 'section' &&
    getItemDisplayType(grandParentSchema) === 'form'
  ) {
    const greatGrandParentPath = grandParentPath?.includes('.')
      ? grandParentPath?.split('.')?.slice(0, -1)?.join('.')
      : null;
    const greatGrandParentKey = grandParentPath?.split('.')?.slice(-1)[0] || null;
    const greatGrandParentSchemaPath = greatGrandParentPath
      ? findPositionInSchema(greatGrandParentPath)
      : null;
    const greatGrandParentSchema = greatGrandParentSchemaPath
      ? getValueByPath(schemaClone, greatGrandParentSchemaPath)
      : schemaClone;

    outsideContainerSchema = greatGrandParentSchema;
    outsideContainerSchemaPath = greatGrandParentSchemaPath;
    outsideContainerProperties = greatGrandParentSchema?.properties;
    outsideAnchorKey = greatGrandParentKey;
  }

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

  if (componentId === 'LxDateTimeRange') {
    const modelClone = lxFormatUtils.objectClone(model.value || {});
    const modelContainerPath = getModelPathFromSchemaPath(schemaContainerPath);
    setValueByPath(modelClone, [...modelContainerPath, key], {});
    model.value = modelClone;
    emits('update:modelValue', modelClone);
  }
}

// Adds component in schema, based on provided component id
function addComponent(id) {
  // find position in schema
  let positionPath = null;
  if (schemaPath.value?.includes('.'))
    positionPath = findPositionInSchema(schemaPath.value?.split('.')?.slice(0, -1)?.join('.'));

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;

  const insertAfterKey = schemaPath.value?.split('.')?.slice(-1)[0];
  const newKey = lxStringUtils.generateUUID();

  const newProp = getNewItemSchema(id);

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

// Adds component inside LxSection
function addComponentInside(id) {
  // find position in schema
  let positionPath = null;
  positionPath = findPositionInSchema(schemaPath.value?.split('.')?.join('.'));

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;

  const insertAfterKey = Object.keys(positionValue.properties || {})[
    Object.keys(positionValue.properties || {}).length - 1
  ];
  const newKey = lxStringUtils.generateUUID();

  const newProp = getNewItemSchema(id);

  const oldProps = positionValue.properties;
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

  initializeModelValueForAddedComponent(id, newKey, positionPath);

  const containerSchemaPath = getSchemaPathFromPositionPath(positionPath);
  const addedSchemaPath = [containerSchemaPath, newKey].filter(Boolean).join('.');
  selectComponentBySchemaPath(addedSchemaPath);
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
    elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
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

// Removes the selected component from schema
function removeCurrentComponent() {
  // find position in schema
  let positionPath = null;
  if (schemaPath.value?.includes('.'))
    positionPath = findPositionInSchema(schemaPath.value?.split('.')?.slice(0, -1)?.join('.'));

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;
  // get the key to remove
  const removeKey = schemaPath.value?.split('.')?.slice(-1)[0];

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

  // Clear selection
  highlight.value.visible = false;
  componentName.value = null;
  navigation.value = [];
  currentItem.value = null;
  resetNextElementInfo();
  resetLowerNestingInfo();
}

// Duplicate the selected component in schema
function duplicateCurrentComponent() {
  // find position in schema
  let positionPath = null;
  if (schemaPath.value?.includes('.'))
    positionPath = findPositionInSchema(schemaPath.value?.split('.')?.slice(0, -1)?.join('.'));

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;

  const duplicateKey = schemaPath.value?.split('.')?.slice(-1)[0];
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

  const parentSchemaPath = getSchemaPathFromPositionPath(positionPath);
  const duplicatedSchemaPath = [parentSchemaPath, newKey].filter(Boolean).join('.');
  selectComponentBySchemaPath(duplicatedSchemaPath);
}

// Moves the selected component up of down in schema in the same nesting level
function moveElement(direction) {
  // find position in schema
  let positionPath = null;
  if (schemaPath.value?.includes('.'))
    positionPath = findPositionInSchema(schemaPath.value?.split('.')?.slice(0, -1)?.join('.'));

  // get value that need to be modified
  const positionValue = positionPath
    ? getValueByPath(schemaModel.value, positionPath)
    : schemaModel.value;

  const moveKey = schemaPath.value?.split('.')?.slice(-1)[0];

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
    emits('error', 'Invalid file content');
    return;
  }

  const text = decodeBase64Utf8(base64);
  fileContent.value = text;
}

function clearSelectedElement() {
  highlight.value.visible = false;
  componentName.value = null;
  navigation.value = [];
  currentItem.value = null;
  resetNextElementInfo();
  resetLowerNestingInfo();
}

// Handles import modal actions
function importActionClicked(actionId) {
  if (actionId === 'save' && fileContent.value) {
    importInvalidMessage.value = null;
    if (!isValidJSONObject(fileContent.value)) {
      importInvalidMessage.value = displayTexts.value?.invalidJsonObject;

      emits('error', 'Invalid JSON file content');
      return;
    }
    try {
      const parsed = JSON.parse(fileContent.value);
      schemaModel.value = parsed;
      importModal.value.close();

      // Clear selection after import
      clearSelectedElement();
    } catch (e) {
      importInvalidMessage.value = displayTexts.value?.errorParsingJsonContent;
      emits('error', 'Error parsing JSON content');
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

      emits('error', 'Invalid JSON file content');
      return;
    }
    try {
      const parsed = JSON.parse(editSchemaContent.value);
      schemaModel.value = parsed;
      editSchemaModal.value.close();
    } catch (e) {
      emits('error', 'Error parsing JSON content');
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
      emits('error', 'Invalid JSON content');
      return;
    }
    try {
      const parsed = JSON.parse(editModelContent.value);
      model.value = parsed;
      editModelModal.value.close();
    } catch (e) {
      emits('error', 'Error parsing JSON content');
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

    setValueByPath(schemaModel.value, findPositionInSchema(parentSchemaPath)?.slice(0, -1), res);
  } catch (error) {
    schemaKeyError.value = displayTexts.value?.schemaKeyUpdateError;
  }
}

// When component is mounted adds event listeners for click and keyboard keys for moving elements
onMounted(() => {
  clickEventListener();
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
  return { hasForm, hasFilters, isSectionInFilterForm };
});
</script>
<template>
  <div>
    <div id="constructor-overlay">
      <div v-show="highlight.visible" class="highlight" :style="highlight.style">
        <div class="highlight-toolbar">
          <LxButton
            v-if="elementInfo.canMoveForwardIn && canMoveComponent()"
            icon="move-inside"
            variant="icon-only"
            :label="displayTexts.moveInside"
            kind="ghost"
            @click="moveElementInside()"
          />
          <LxButton
            v-if="elementInfo.moveOut && canMoveComponent()"
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
        </div>
        <div class="highlight-toolbar highlight-toolbar-remove">
          <LxButton
            v-if="componentName !== 'LxViewLayout'"
            icon="delete"
            variant="icon-only"
            :label="displayTexts.delete"
            kind="ghost"
            :destructive="true"
            @click="openRemoveComponentConfirmation"
          />
        </div>
      </div>
    </div>
    <Panel
      :componentName="componentName"
      :componentProps="componentProps"
      :componentPropsDefinitions="componentPropsDefinitions"
      :navigation="navigation"
      :componentModel="currentItem"
      :schemaKey="schemaKey"
      :schemaKeyError="schemaKeyError"
      :schemaInfo="schemaInfo"
      v-model:selectedTab="panelTabl"
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
    />

    <div id="constructor">
      <LxViewBuilder :schema="schema" v-model="model" :builderOptions="{ useRegistry: true }" />
    </div>

    <LxModal
      ref="exportModal"
      :label="displayTexts?.exportModal"
      size="m"
      :actionDefinitions="[{ id: 'close', name: displayTexts?.close, kind: 'secondary' }]"
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
