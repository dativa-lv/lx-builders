export function getDefaultStateDictionary() {
  const translations = {
    draft: 'Melnraksts',
    new: 'Jauns',
    editing: 'Rediģēšana',
    edited: 'Rediģēts',
    disabling: 'Atspējošana',
    disabled: 'Atspējots',
    inactive: 'Neaktīvs',
    finishing: 'Pabeigšana',
    finished: 'Pabeigts',
    deleting: 'Dzēšana',
    deleted: 'Dzēsts',
    ongoing: 'Notiek',
    incomplete: 'Nepabeigts',
    waiting: 'Gaidīšana',
    signed: 'Parakstīts',
    error: 'Kļūda',
    default: 'Noklusējuma',
  };
  return Object.entries(translations).map(([id, name]) => ({
    value: id,
    displayName: name,
    displayType: id,
  }));
}

export function getNewItemSchema(id) {
  switch (id) {
    case 'LxTextInput':
      return {
        type: 'string',
        title: 'New Text Input',
        lx: {},
      };

    case 'LxTextArea':
      return {
        type: 'string',
        title: 'New Text Area',
        lx: {
          kind: 'multiline',
        },
      };

    case 'LxDateTimePicker':
      return {
        type: 'string',
        title: 'New Date time picker',
        format: 'date',
      };

    case 'LxDateTimeRange':
      return {
        type: 'object',
        title: 'New LxDateTimeRange',
        lx: {
          displayType: 'dateTimeRange',
        },
      };

    case 'LxAutoComplete':
      return {
        type: 'string',
        title: 'New LxAutoComplete',
        lx: {
          displayType: 'autoComplete',
        },
      };

    case 'LxValuePicker':
      return {
        type: 'string',
        title: 'New LxValuePicker',
        lx: {
          variant: 'default',
          items: [
            { id: 'option1', name: 'Option 1' },
            { id: 'option2', name: 'Option 2' },
            { id: 'option3', name: 'Option 3' },
          ],
        },
      };
    case 'LxCheckbox':
      return {
        type: 'boolean',
        title: 'New LxCheckbox',
        lx: {
          displayType: 'checkbox',
        },
      };

    case 'LxContentSwitcher':
      return {
        type: 'string',
        title: 'New LxContentSwitcher',
        lx: {
          displayType: 'contentSwitcher',
          items: [
            { id: 'option1', name: 'Option 1' },
            { id: 'option2', name: 'Option 2' },
            { id: 'option3', name: 'Option 3' },
          ],
        },
      };
    case 'LxNumberInput':
      return {
        type: 'integer',
        title: 'New LxNumberInput',
        lx: {
          displayType: 'numberInput',
        },
      };

    case 'LxToggle':
      return {
        type: 'boolean',
        title: 'New Toggle',
        lx: {},
      };

    case 'LxQrScanner':
      return {
        type: 'object',
        title: 'New LxQrScanner',
        lx: {
          displayType: 'qrScanner',
        },
      };

    case 'LxFileUploader':
      return {
        type: 'array',
        title: 'New LxFileUploader',
        lx: {
          displayType: 'file',
        },
      };

    case 'LxDurationInput':
      return {
        type: 'integer',
        title: 'New LxDurationInput',
        lx: {
          displayType: 'durationInput',
        },
      };

    case 'LxVisualPicker':
      return {
        type: 'string',
        title: 'New LxVisualPicker',
        lx: {
          displayType: 'visualPicker',
        },
      };

    case 'LxDrawPad':
      return {
        type: 'string',
        title: 'New LxDrawPad',
        lx: {
          displayType: 'drawPad',
        },
      };

    case 'LxCamera':
      return {
        type: 'string',
        title: 'New LxCamera',
        lx: {
          displayType: 'camera',
        },
      };

    case 'LxMarkdownTextArea':
      return {
        type: 'string',
        title: 'New LxMarkdownTextArea',
        lx: {
          displayType: 'markdown',
        },
      };

    case 'LxFilters':
      return {
        type: 'object',
        title: 'New LxFilters',
        lx: {
          displayType: 'filters',
        },
        properties: {},
      };

    case 'LxSection':
      return {
        type: 'object',
        title: 'New LxSection',
        lx: {
          displayType: 'section',
        },
        properties: {},
      };

    case 'LxForm':
      return {
        type: 'object',
        title: 'New LxForm',
        lx: {
          displayType: 'form',
          indexType: 'none',
        },
        properties: {},
      };

    case 'LxList':
      return {
        type: 'array',
        title: 'New LxList',
        lx: {
          displayType: 'list',
          actionDefinitions: [],
          includeUnspecifiedGroups: true,
        },
      };

    case 'LxDataGrid':
      return {
        type: 'array',
        title: 'New LxDataGrid',
        lx: {
          displayType: 'table',
          columnDefinitions: [
            {
              id: 'id',
              attributeName: 'id',
              name: 'Id',
            },
            {
              id: 'name',
              attributeName: 'name',
              name: 'Name',
            },
          ],
        },
      };

    case 'primaryText':
      return {
        type: 'string',
        title: 'New Primary Text',
        lx: {
          displayType: 'primaryText',
        },
      };
    case 'secondaryText':
      return {
        type: 'string',
        title: 'New Secondary Text',
        lx: {
          displayType: 'secondaryText',
        },
      };

    case 'defaultText':
      return {
        type: 'string',
        title: 'New Text',
      };

    case 'LxStateDisplay':
      return {
        type: 'string',
        title: 'New LxStateDisplay',
        lx: {
          displayType: 'stateDisplay',
          dictionary: getDefaultStateDictionary(),
        },
      };

    case 'LxFlag': {
      return {
        type: 'string',
        title: 'New LxFlag',
        lx: {
          displayType: 'flag',
        },
      };
    }

    case 'LxIcon':
      return {
        type: 'string',
        title: 'New LxIcon',
        lx: {
          displayType: 'icon',
        },
      };
    case 'LxPersonDisplay':
      return {
        type: 'string',
        title: 'New LxPersonDisplay',
        lx: {
          displayType: 'personDisplay',
        },
      };
    case 'LxStack':
      return {
        type: 'string',
        title: 'New LxStack',
        lx: {
          displayType: 'stack',
        },
      };

    default:
      break;
  }
  return null;
}

export function getLXComponents() {
  return [
    {
      id: 'LxTextInput',
      name: 'LxTextInput',
      usageGroup: 'inputs',
    },
    {
      id: 'LxTextArea',
      name: 'LxTextArea',
      usageGroup: 'inputs',
    },
    {
      id: 'LxDateTimePicker',
      name: 'LxDateTimePicker',
      usageGroup: 'inputs',
    },
    {
      id: 'LxDateTimeRange',
      name: 'LxDateTimeRange',
      usageGroup: 'inputs',
    },
    {
      id: 'LxAutoComplete',
      name: 'LxAutoComplete',
      usageGroup: 'inputs',
    },
    {
      id: 'LxValuePicker',
      name: 'LxValuePicker',
      usageGroup: 'inputs',
    },
    {
      id: 'LxCheckbox',
      name: 'LxCheckbox',
      usageGroup: 'inputs',
    },
    {
      id: 'LxContentSwitcher',
      name: 'LxContentSwitcher',
      usageGroup: 'inputs',
    },
    {
      id: 'LxNumberInput',
      name: 'LxNumberInput',
      usageGroup: 'inputs',
    },
    {
      id: 'LxToggle',
      name: 'LxToggle',
      usageGroup: 'inputs',
    },
    {
      id: 'LxQrScanner',
      name: 'LxQrScanner',
      usageGroup: 'inputs',
    },
    {
      id: 'LxFileUploader',
      name: 'LxFileUploader',
      usageGroup: 'inputs',
    },
    {
      id: 'LxDurationInput',
      name: 'LxDurationInput',
      usageGroup: 'inputs',
    },
    {
      id: 'LxVisualPicker',
      name: 'LxVisualPicker',
      usageGroup: 'inputs',
    },
    {
      id: 'LxDrawPad',
      name: 'LxDrawPad',
      usageGroup: 'inputs',
    },
    {
      id: 'LxCamera',
      name: 'LxCamera',
      usageGroup: 'inputs',
    },
    {
      id: 'LxMarkdownTextArea',
      name: 'LxMarkdownTextArea',
      usageGroup: 'inputs',
    },
  ];
}

export const getDisplayComponents = () => [
  {
    id: 'primaryText',
    name: 'Primary text',
  },
  {
    id: 'secondaryText',
    name: 'Secondary text',
  },
  {
    id: 'defaultText',
    name: 'Text',
  },
  {
    id: 'LxStateDisplay',
    name: 'LxStateDisplay',
  },
  {
    id: 'LxIcon',
    name: 'LxIcon',
  },
  {
    id: 'LxFlag',
    name: 'LxFlag',
  },
  {
    id: 'LxPersonDisplay',
    name: 'LxPersonDisplay',
  },
  {
    id: 'LxStack',
    name: 'LxStack',
  },
];

export const columnDefinitionsSizes = [
  { id: '*', name: '*' },
  { id: 'xs', name: 'xs' },
  { id: 's', name: 's' },
  { id: 'm', name: 'm' },
  { id: 'l', name: 'l' },
  { id: 'xl', name: 'xl' },
];

export const columnDefinitionsTypes = [
  { id: 'default', name: 'default' },
  { id: 'number', name: 'number' },
  { id: 'decimal', name: 'decimal' },
  { id: 'boolean', name: 'boolean' },
  // TODO: Add support for dictionary definition
  // { id: 'state', name: 'state' },
  { id: 'rating', name: 'rating' },
  { id: 'array', name: 'array' },
  { id: 'flag', name: 'flag' },
  { id: 'person', name: 'person' },
  { id: 'icon', name: 'icon' },
  { id: 'date', name: 'date' },
  { id: 'dateTime', name: 'dateTime' },
  { id: 'dateTimeFull', name: 'dateTimeFull' },
  { id: 'tooltip-text', name: 'tooltip-text' },
];

export const columnDefinitionsKinds = [
  {
    id: 'default',
    name: 'default',
  },
  {
    id: 'clickable',
    name: 'clickable',
  },
  {
    id: 'primary',
    name: 'primary',
  },
  {
    id: 'secondary',
    name: 'secondary',
  },
  {
    id: 'extra',
    name: 'extra',
  },
];

export const badgeDefinitionTypeItems = [
  {
    id: 'auto',
    name: 'auto',
  },
  {
    id: 'number',
    name: 'number',
  },
  {
    id: 'text',
    name: 'text',
  },
];

export const badgeTypeItems = [
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
];

export const iconSetItems = [
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
    id: 'phosphor',
    name: 'phosphor',
  },
];

export const listCategoryItems = [
  'red',
  'blue',
  'teal',
  'green',
  'purple',
  'orange',
  'yellow',
  'bad',
  'new',
  'good',
  'draft',
  'error',
  'edited',
  'signed',
  'ongoing',
  'waiting',
  'deleted',
  'disabled',
  'inactive',
  'finished',
  'incomplete',
].map((category) => ({ id: category, name: category }));

const orientationIconMap = {
  vertical: 'orientation-vertical',
  horizontal: 'orientation-horizontal',
  overlay: 'overlay',
};

const horizontalAlignmentIconMap = {
  leading: 'position-left',
  trailing: 'position-right',
  center: 'position-horizontal-center',
  stretch: 'fit-to-width',
};

const verticalAlignmentIconMap = {
  leading: 'position-top',
  trailing: 'position-bottom',
  center: 'position-vertical-center',
  stretch: 'fit-to-height',
};

export function getOptionIcon(prop, option) {
  switch (prop) {
    case 'orientation':
      return orientationIconMap[option];
    case 'horizontalAlignment':
      return horizontalAlignmentIconMap[option];
    case 'verticalAlignment':
      return verticalAlignmentIconMap[option];
    default:
      return null;
  }
}

export const stateDisplayTypes = [
  'draft',
  'new',
  'editing',
  'edited',
  'disabling',
  'disabled',
  'inactive',
  'finishing',
  'finished',
  'deleting',
  'deleted',
  'ongoing',
  'incomplete',
  'waiting',
  'signed',
  'error',
  'default',
  'red',
  'green',
  'blue',
  'black',
  'purple',
  'orange',
  'yellow',
  'teal',
  'red-full',
  'green-full',
  'blue-full',
  'black-full',
  'purple-full',
  'orange-full',
  'yellow-full',
  'teal-full',
].map((type) => ({ id: type, name: type }));

export const stateDisplayShapes = ['circle', 'diamond', 'icon', 'custom'].map((shape) => ({
  id: shape,
  name: shape,
}));

export const COMPONENT_SCHEMA_BUILDERS = {
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
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
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
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
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
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
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
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
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
    res.lx.disabled = p.disabled || false;
    res.lx.timeAdjust = p.timeAdjust;
    res.lx.locale = p.locale;
    res.lx.rangeMonths = p.rangeMonths || 'next';
    res.lx.clearIfNotExact = p.clearIfNotExact || false;
    res.lx.labelId = p.labelId;
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
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
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
    res.lx.texts = p.texts || {};
    res.readOnly = p.readOnly || false;
  },
  LxNumberInput: (res, p) => {
    res.type = 'integer';
    res.lx.min = p.min || 0;
    res.lx.max = p.max || 9999;
    res.lx.step = p.step || 1;
    res.lx.stepMultiplier = p.stepMultiplier || 5;
    res.lx.hasInput = p.hasInput || false;
    res.lx.labelId = p.labelId;
    res.lx.disabled = p.disabled || false;
    res.lx.kind = p.kind || 'slider';
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
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
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
    res.lx.texts = p.texts || {};
  },
  LxVisualPicker: (res, p) => {
    res.type = p.selectionKind === 'multiple' ? 'array' : 'string';
    res.lx.kind = p.kind || 'europe';
    res.lx.mode = p.mode || 'default';
    res.lx.selectionKind = p.selectionKind || 'multiple';
    res.lx.labelId = p.labelId;
    res.lx.texts = p.texts || {};
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
    res.readOnly = p.readOnly || false;
  },
  LxDurationInput: (res, p) => {
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
    res.lx.helperText = p.helperText;
    res.lx.helperTextKind = p.helperTextKind || 'label';
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
  LxList: (res, p) => {
    res.type = 'array';
    res.properties = res.properties || {};
    res.description = p.description;

    res.lx.actionDefinitions = p.actionDefinitions;
    res.lx.groupDefinitions =
      p.groupDefinitions && p.groupDefinitions?.length !== 0 ? p.groupDefinitions : null;
    res.lx.toolbarActionDefinitions = p.toolbarActionDefinitions;
    res.lx.selectionActionDefinitions = p.selectionActionDefinitions;
    res.lx.kind = p.kind || 'default';
    res.lx.listType = p.listType || '3';
    res.lx.hasSelecting = p.hasSelecting || false;
    res.lx.selectionKind = p.selectionKind || 'single';
    res.lx.hasSearch = p.hasSearch || false;
    res.lx.searchSide = p.searchSide || 'client';
    res.lx.searchMode = p.searchMode || 'default';
    res.lx.hideFilteredItems = p.hideFilteredItems || false;
    res.lx.showLoadMore = p.showLoadMore || false;
    res.lx.stickyToolbar = p.stickyToolbar || false;
    res.lx.icon = p.icon || 'open';
    res.lx.iconSet = p.iconSet || 'cds';
    res.lx.hasVirtualization = p.hasVirtualization;
    res.lx.includeUnspecifiedGroups = p.includeUnspecifiedGroups || false;
    res.lx.hasSkipLink = p.hasSkipLink || false;

    res.lx.loading = p.loading || false;
    res.lx.busy = p.busy || false;

    res.lx.actionLayout = p.actionLayout || 'default';
    res.lx.emptyStateActionDefinitions = p.emptyStateActionDefinitions;
    res.lx.emptyStateIcon = p.emptyStateIcon;

    res.lx.idAttribute = p.idAttribute || 'id';
    res.lx.nameAttribute = p.nameAttribute || 'name';
    res.lx.descriptionAttribute = p.descriptionAttribute || 'description';
    res.lx.hrefAttribute = p.hrefAttribute || 'href';
    res.lx.groupAttribute = p.groupAttribute || 'group';
    res.lx.clickableAttribute = p.clickableAttribute || 'clickable';
    res.lx.iconAttribute = p.iconAttribute || 'icon';
    res.lx.iconSetAttribute = p.iconSetAttribute || 'iconSet';
    res.lx.tooltipAttribute = p.tooltipAttribute || 'tooltip';
    res.lx.categoryAttribute = p.categoryAttribute || 'category';
    res.lx.childrenAttribute = p.childrenAttribute || 'children';
    res.lx.hasChildrenAttribute = p.hasChildrenAttribute || 'hasChildren';
    res.lx.selectableAttribute = p.selectableAttribute || 'selectable';
    res.lx.orderAttribute = p.orderAttribute || 'order';

    res.lx.texts = p.texts || {};
  },
  LxDataGrid: (res, p) => {
    res.type = 'array';
    res.properties = res.properties || {};
    res.description = p.description;

    res.lx.label = p.label;
    res.lx.description = p.description;
    res.lx.columnDefinitions = p.columnDefinitions;
    res.lx.idAttribute = p.idAttribute || 'id';
    res.lx.scrollable = p.scrollable || false;
    res.lx.loading = p.loading || false;
    res.lx.busy = p.busy || false;
    res.lx.skeletonRowCount = p.skeletonRowCount || 10;
    res.lx.showHeader = p.showHeader || false;
    res.lx.showToolbar = p.showToolbar;
    res.lx.showStatusbar = p.showStatusbar;
    res.lx.showAllColumns = p.showAllColumns || false;
    res.lx.hasSorting = p.hasSorting || false;
    res.lx.sortingIgnoreEmpty = p.sortingIgnoreEmpty;
    res.lx.itemsPerPage = p.itemsPerPage || 20;
    res.lx.itemsTotal = p.itemsTotal || 0;
    res.lx.sortingMode = p.sortingMode || 'strip';
    res.lx.actionDefinitions = p.actionDefinitions;
    res.lx.defaultActionName = p.defaultActionName || 'open';
    res.lx.toolbarActionDefinitions = p.toolbarActionDefinitions;
    res.lx.hasVirtualization = p.hasVirtualization;
    res.lx.stickyHeader = p.stickyHeader || false;
    res.lx.hasPaging = p.hasPaging || false;
    res.lx.hasSelecting = p.hasSelecting || false;
    res.lx.selectionKind = p.selectionKind || 'multiple';
    res.lx.sortingSide = p.sortingSide || 'client';
    res.lx.emptyStateActionDefinitions = p.emptyStateActionDefinitions;
    res.lx.emptyStateIcon = p.emptyStateIcon;
    res.lx.hasSearch = p.hasSearch || false;
    res.lx.searchMode = p.searchMode || 'default';
    res.lx.searchString = p.searchString;

    res.lx.fullBleed = p.fullBleed;
    res.lx.badgeDefinitions = p.badgeDefinitions;
    res.lx.stickyToolbar = p.stickyToolbar || false;
    res.lx.texts = p.texts || {};
  },
  LxStack: (res, p) => {
    res.type = 'object';
    res.properties = res.properties || {};

    res.lx.orientation = p.orientation;
    res.lx.kind = p.kind;
    res.lx.mode = p.mode;
    res.lx.horizontalAlignment = p.horizontalAlignment;
    res.lx.verticalAlignment = p.verticalAlignment;
    res.lx.horizontalConfig = p.horizontalConfig;
    res.lx.verticalConfig = p.verticalConfig;
  },
  LxFlag: (res, p) => {
    res.type = 'string';
    res.lx = res.lx || {};
    res.lx.displayType = 'flag';

    res.lx.title = p.title;
    res.lx.size = p.size;
  },
  LxStateDisplay: (res, p) => {
    res.type = 'string';
    res.lx = res.lx || {};
    res.lx.displayType = 'stateDisplay';

    res.lx.dictionary = p.dictionary || [];
  },
  LxIcon: (res, p) => {
    res.type = 'string';
    res.lx = res.lx || {};
    res.lx.displayType = 'icon';

    res.lx.iconSet = p.iconSet;
    res.lx.variant = p.variant;
    res.lx.customClass = p.customClass;
    res.lx.animation = p.animation;
    res.lx.meaningful = p.meaningful;
    res.lx.title = p.title;
    res.lx.desc = p.desc;
  },
  LxPersonDisplay: (res, p) => {
    res.type = 'string';
    res.lx = res.lx || {};
    res.lx.displayType = 'personDisplay';

    res.lx.kind = p.kind;
    res.lx.size = p.size;
    res.lx.variant = p.variant;
    res.lx.icon = p.icon;
    res.lx.iconSet = p.iconSet;
    res.lx.maxLength = p.maxLength;
  },
};
