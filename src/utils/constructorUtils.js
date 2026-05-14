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
    case 'LxNumberSlider':
      return {
        type: 'integer',
        title: 'New LxNumberSlider',
        lx: {
          displayType: 'numberSlider',
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

    case 'LxDayInput':
      return {
        type: 'integer',
        title: 'New LxDayInput',
        lx: {
          displayType: 'dayInput',
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
      id: 'LxNumberSlider',
      name: 'LxNumberSlider',
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
      id: 'LxDayInput',
      name: 'LxDayInput',
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
  ];
}
