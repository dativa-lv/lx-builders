# LX/UI Builder Migration Guide

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