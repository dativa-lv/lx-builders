# LxFilterBuilder guide

`LxFilterBuilder` is a declarative component for building filter bars from JSON Schema.

It follows the same core principles as [LxFormBuilder](./FormBuilder.md), so this guide focuses on behavior that is specific to filtering.

`LxFilterBuilder` renders an expandable filter bar (`LxFilters`).
When collapsed, it can show a summary of active filters.
When expanded, it renders an `LxForm` with input fields generated from schema.

The component includes built-in UX logic (labels, summaries, active-filter indicators) to reduce manual setup. If needed, you can override this behavior through props.

## Props

LxFilterBuilder props:
- `modelValue` - The prop is used to bind a value to the component. It supports two-way data binding in Vue components
- `schema` - Defines the input fields for the filter
- `readOnly` - Indicates whether the component is in read-only mode
- `mode` - Determines whether the form will be built from modelValue or schema
- `defaultValues` - The default values for the filter component description and usage indicator
- `useDefaults` -  Indicates whether to use initial modelValue props values as default values for the description and usage indicator. If `false` uses values provided in `defaultValues` prop
- `label` - The label for the filter component
- `description` - The description for the filter component. If not defined get applied automatically based on inputs defined in schema and expanded state of the filters
- `usesFilters` - Indicates whether the filter values differ from default values. If not defined get applied automatically based on inputs defined in schema and expanded state of the filters
- `filterButtonKind` - The kind of the filter buttons
- `columnCount` - The number of columns for form inside of the filter component
- `expanded` - Indicates whether the filter component is expanded
- `disabled` - Indicates whether the filter component is disabled
- `fastFilters` - The list of fast filters
- `fastIdAttribute` - The attribute used to identify fast filters
- `fastNameAttribute` - The attribute used to name fast filters
- `badge` - Badge text to be displayed on the filter component
- `badgeIcon` - Badge icon to be displayed on the filter component inside badge
- `badgeType` - The type of the badge
- `badgeTitle` - Badge title to be displayed on the filter badge when badge is provided
- `validations` - Determines invalidation messages for the filters input fields
- `closeOnFilter` - Determines whether the filter panel should close automatically after a filter is applied
- `hasShortlistReset` - Determines whether the reset button is shown in the collapsed state
- `filteredModelValue` - The object containing filtered model values. If undefined uses `modelValue` props values
- `texts` - The object containing text translations

## Emits

LxFilterBuilder emits:
- `update:modelValue` - Emitted when any filter field value changes (used by `v-model` two-way binding)
- `filter` - Emitted when the user applies filters (for example by pressing the search/apply action)
- `resetFilters` - Emitted when the user resets/clears filters from the filter bar
- `fastFilterClick` - Emitted when a fast filter item is clicked
- `update:expanded` - Emitted when expanded state changes in controlled mode (`v-model:expanded`)
- `rowActionClick` - Re-emitted from `LxFormBuilder` when an action is triggered in row-based fields
- `emit` - Generic pass-through event re-emitted from `LxFormBuilder` for custom schema-driven emits

## Examples

```js
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Username',
    },
    scoreFrom: {
      type: 'number',
      title: 'Score from',
    },
    dateFrom: {
      type: 'string',
      format: 'date',
      title: 'Date from',
    },
    dateTill: {
      type: 'string',
      format: 'date',
      title: 'Date till',
    },
    status: {
      type: 'array',
      title: 'Status',
      enum: ['New', 'Accepted', 'Declined', 'Other'],
      lx: {
        variant: 'tags',
      },
    },
    hasAttachments: {
      type: 'boolean',
      title: 'Has attachments',
    },
  },
};
```

This schema creates a filter bar with 6 input fields:
- `name` - Username field rendered as a plain text input (`LxTextInput`)
- `scoreFrom` - Minimum score field rendered as a decimal numeric input (`LxTextInput` with `decimal` mask)
- `dateFrom` - Start date field rendered as a date picker (`LxDateTimePicker`)
- `dateTill` - End date field rendered as a date picker (`LxDateTimePicker`)
- `status` - Status field rendered as a multi-select from predefined values (`LxValuePicker` with `variant="tags"` and `selectionKind="multiple"`)
- `hasAttachments` - Binary yes/no field rendered as a toggle (`LxToggle`)

### Automatic description and usesFilters indicator

One advantage of using LxFilterBuilder is that the filter bar `usesFilters` indicator works automatically.

The component compares the current `modelValue` against the `modelValue` snapshot captured at mount time. If any value differs from that baseline, the `usesFilters` indicator is shown, and the changed values are displayed in the filter bar description based on their data types.

#### lx.filterDescription
The display text can be customized with `lx.filterDescription` in the schema. For example, if you want to label one date as "Date from" and the other as "Date till", you can define custom text for each field.

For example:
```js

const schema = {
  type: 'object',
  properties: {
    dateFrom: {
      type: 'string',
      format: 'date',
      title: 'Date from',
      lx: {
        filterDescription: 'Date from: '
      }
    },
    dateTill: {
      type: 'string',
      format: 'date',
      title: 'Date till',
      lx: {
        filterDescription: 'Date till: '
      }
    }
  },
};
```

This makes it easy to distinguish between the two dates.

#### defaultValues prop

The `defaultValues` prop is intended for cases where you want to compare against a different baseline model than the initial `modelValue` when LxFilterBuilder is mounted. This is useful when filter values are loaded after the component has already mounted.

If this prop is defined, description and `usesFilters` changes are compared against the values provided in `defaultValues`.

#### filteredModelValue prop

The `filteredModelValue` prop improves usability further. The `usesFilters` indicator should ideally be applied only after filters are actually applied to the list, so the description matches the data currently displayed below the filters.

This can be achieved using `filteredModelValue`. It is intended to store a clone of `modelValue` when LxFilterBuilder emits `filter` and `resetFilters`.

In this way, the description changes only when input changes are actually applied to the list.