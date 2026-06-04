# LxConstructor guide

LxConstructor is a tool for creating schemas that can later be used with LX builder components, especially LxViewBuilder. It provides a more user-friendly way to create a schema than writing it manually.

At the moment, Constructor supports Form and Filter creation with various input components.

Support for additional components and more layout options will be added later.

## Requirements

- Vue (v3.5.17 or later)
- @dativa-lv/lx-ui (v2.1.7 or later) 
- @dativa-lv/lx-builders (v2.1.8 or later)

To use Constructor locally, make sure your project includes the required Vue and LX dependencies.

## Usage

### Existing LX project

If you already have an LX portal project set up, most of the work is already done.
Make sure that `@dativa-lv/lx-builders` is installed, then import LxConstructor into your view.

Pass reactive references to the `schema` and `modelValue` bindings.

You can use a template like this:

```vue
<script setup>
import { ref } from 'vue';
import { LxConstructor } from '@dativa-lv/lx-builders';

const schema = ref({
  type: 'object',
  properties: {},
});
const model = ref({});
</script>

<template>
  <div>
    <LxConstructor v-model:schema="schema" v-model="model" />
  </div>
</template>
```

### Empty project

This is an example of how to set up LxConstructor in a simple single-page Vue application.

Create a new Vue project:
```bash
npm create vue@latest
```

Install the lx-ui library:
```bash
npm install @dativa-lv/lx-ui@latest
```

Install the lx-builders library:
```bash
npm install @dativa-lv/lx-builders@latest
```

Start the project:
```bash
npm run dev
```

Add the required stylesheet imports to `main.js`:
```js
import '@dativa-lv/lx-ui/dist/bundles/lx-bt-demo.css';
import '@dativa-lv/lx-builders/dist/styles/lx-constructor.css';
```

Add this example to `App.vue`:
```vue
<script setup>
import { ref } from 'vue';
import { LxShell } from '@dativa-lv/lx-ui';
import { LxConstructor } from '@dativa-lv/lx-builders';

const schema = ref({
  type: 'object',
  properties: {},
});
const model = ref({});
</script>

<template>
  <div class="lx">
    <LxShell systemName="Constructor" systemNameShort="Constructor" :pageBreadcrumbs="[]">
      <LxConstructor v-model:schema="schema" v-model="model" />
    </LxShell>
  </div>
</template>
```

That is all you need to get started with LxConstructor.