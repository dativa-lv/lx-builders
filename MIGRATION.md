# LX/UI Builder Migration Guide

### createLxBuilders

Make sure you're using [`myApp.use(createLxBuilders)`](src/main.js) in your project.

Example:
```js
myApp.use(createLxBuilders, {
  environment: 'local',
});
```