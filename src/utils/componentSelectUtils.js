import { isDate } from '@/utils/builderUtils';

export const otherSelectRules = [
  { displayType: 'stack', types: ['object'], component: 'stack' },
  { displayType: 'autoComplete', types: ['string', 'array', 'object'], component: 'autoComplete' },
  { displayType: 'button', types: ['string', 'object'], component: 'button' },
  { displayType: 'camera', types: ['string'], component: 'camera' },
  { displayType: 'fileViewer', types: ['string'], component: 'fileViewer' },
  { displayType: 'flag', types: ['string', 'object'], component: 'flag' },
  { displayType: 'icon', types: ['string', 'object'], component: 'icon' },
  { displayType: 'illustration', types: ['string', 'object'], component: 'illustration' },
  { displayType: 'link', types: ['string', 'object'], component: 'link' },
  { displayType: 'contentSwitcher', types: ['string'], component: 'contentSwitcher' },
  { displayType: 'markdown', types: ['string'], component: 'markdownTextArea' },
  {
    displayType: 'personDisplay',
    types: ['string', 'object', 'array'],
    component: 'personDisplay',
  },
  { displayType: 'qr', types: ['string', 'object'], component: 'qr' },
  { displayType: 'qrScanner', types: ['object'], component: 'qrScanner' },
  { displayType: 'richTextDisplay', types: ['string', 'object'], component: 'richTextDisplay' },
  { displayType: 'stateDisplay', types: ['string', 'object'], component: 'stateDisplay' },
  { displayType: 'steps', types: ['string'], component: 'steps' },
  { displayType: 'visualPicker', types: ['string', 'array'], component: 'visualPicker' },
  { displayType: 'durationInput', types: ['integer', 'object'], component: 'durationInput' },
  { displayType: 'drawPad', types: ['string'], component: 'drawPad' },
  { displayType: 'logoDisplay', types: ['string', 'object'], component: 'logoDisplay' },
  { displayType: 'dropDownMenu', types: ['string', 'object'], component: 'dropDownMenu' },
  { displayType: 'numberInput', types: ['integer'], component: 'numberInput' },
  { displayType: 'rating', types: ['integer', 'number'], component: 'rating' },
  { displayType: 'checkbox', types: ['boolean'], component: 'checkbox' },
  {
    displayType: 'dataVisualizer',
    types: ['array', 'object'],
    component: 'dataVisualizer',
  },
  { displayType: 'file', types: ['array'], component: 'file' },
  { displayType: 'text', types: ['string'], component: 'text' },
  { displayType: 'dateTimeRange', types: ['object'], component: 'dateTimeRange' },
  { displayType: 'infoBox', types: ['object'], component: 'infoBox' },
  { displayType: 'card', types: ['boolean'], component: 'card' },
  { displayType: 'emptyState', types: ['object'], component: 'emptyState' },
  { displayType: 'errorPage', types: ['object'], component: 'errorPage' },
  { displayType: 'loader', types: ['string', 'number'], component: 'loader' },
  { displayType: 'toolbar', types: ['object'], component: 'toolbar' },
];

function matchesRowType(row, supportedTypes) {
  return supportedTypes.includes(row?.type);
}

export function getOtherSelectComponent(row, options = {}) {
  const displayType = row?.lx?.displayType;
  if (!displayType) return null;

  const excludedDisplayTypes = options?.excludedDisplayTypes || [];
  if (excludedDisplayTypes.includes(displayType)) return null;

  const rule = otherSelectRules.find((item) => item.displayType === displayType);
  if (rule && matchesRowType(row, rule.types)) {
    return rule.component;
  }

  return null;
}

export function stringSelect(row) {
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

export function arraySelect(row) {
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
  if (row?.type === 'array' && row?.lx?.displayType === 'chat') return 'chat';
  return '';
}

// value - current model value of the row, as object components depend on whether it is set
export function objectSelect(row, value) {
  const hasValue = value !== undefined && value !== null;

  if (row?.lx?.displayType === 'map' && row?.type === 'object') return 'map';
  if (row?.type === 'object' && hasValue && row?.lx?.displayType === 'modal') return 'objectList';
  if (row?.type === 'object' && !value && row?.lx?.displayType === 'modal') return 'objectButton';
  if (row?.type === 'object' && hasValue) return 'dataBlock';
  return '';
}

function isIndicatorComponent(displayType) {
  const indicatorDisplayTypes = [
    'primaryText',
    'secondaryText',
    'flag',
    'stateDisplay',
    'personDisplay',
    'icon',
    'badge',
  ];
  return indicatorDisplayTypes.includes(displayType);
}

/**
 * Returns the name of the component used to render the provided schema row
 * @param {Object} row - schema of the property
 * @param {Object} options
 * @param {*} options.value - current model value of the property
 * @param {string[]} options.excludedDisplayTypes - displayTypes ignored by other component selection
 * @param {Function} options.onUnrendered - called when no component matches the row
 */
export function selectRowComponent(row, options = {}) {
  const { value, excludedDisplayTypes, onUnrendered } = options;

  if (row?.lx?.wrapper === 'placeholder') return 'lxPlaceholder';

  const indicatorComponent = isIndicatorComponent(row?.lx?.displayType);
  if (indicatorComponent) return 'indicator';

  const otherComponent = getOtherSelectComponent(row, { excludedDisplayTypes });
  if (otherComponent) return otherComponent;

  const stringComponent = stringSelect(row);
  if (stringComponent) return stringComponent;

  if (row?.type === 'integer') return 'textInputInteger';

  if (row?.type === 'boolean') return 'toggle';

  if ((row?.type === 'string' && (row?.lx?.variant || row?.enum)) || row?.type === 'array') {
    const arrayComponent = arraySelect(row);
    if (arrayComponent) return arrayComponent;
  }

  const objectComponent = objectSelect(row, value);
  if (objectComponent) return objectComponent;

  onUnrendered?.();
  return 'lxPlaceholder';
}
