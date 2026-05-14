# LX/UI Builder Migration Guide

## 2.1.8

### Breaking changes

#### ViewBuilder changes

LxViewBuilder form section behavior has been unified.

You must now explicitly define the default section - it is no longer created automatically.
The first defined section will be treated as the default.

See the [ViewBuilder guide](/docs/ViewBuilder.md)  for updated schema examples.

The schema and logic for LxFormBuilder and LxFilterBuilder have remained the same.

## createLxBuilders

Make sure you're using [`myApp.use(createLxBuilders)`](src/main.js) in your project.

Example:
```js
myApp.use(createLxBuilders, {
  environment: 'local',
});
```

## 1.11 → 2.0

### Breaking changes

See the [lx/ui migration guide](https://github.com/dativa-lv/lx-ui/blob/main/MIGRATION.md#111--20) to adapt to all breaking changes.