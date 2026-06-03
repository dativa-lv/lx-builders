<h1 align="center">lx/builders</h1>

<p align="center">
 Declarative <strong>Vue.js 3</strong> tools that transform schemas and configuration into consistent, production-ready user interfaces <a href="https://github.com/dativa-lv/lx-ui">powered by <strong>LX/UI</strong></a>.
</p>
<p align="center">
    JSON Schema in. LX/UI view out.
</p>

<p align="center">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/%40dativa-lv%2Flx-builders?color=green" />
    <img alt="NPM Version" src="https://img.shields.io/npm/v/%40dativa-lv%2Flx-builders?color=green" />
    <img alt="NPM License" src="https://img.shields.io/npm/l/%40dativa-lv%2Flx-builders?color=white" />
    <a href="https://github.com/dativa-lv/lx-ui"><img alt="Powered by LX/UI" src="https://img.shields.io/badge/powered%20by-lx%2Fui-0960BC"/></a>
</p>

<p align="center">
 <img src="https://img.shields.io/github/package-json/dependency-version/dativa-lv/lx-builders/peer/@dativa-lv/lx-ui" alt="LX/UI Version" />
  <img src="https://img.shields.io/github/package-json/dependency-version/dativa-lv/lx-ui/peer/vue" alt="Vue.js Version" />
  <img src="https://img.shields.io/github/package-json/dependency-version/dativa-lv/lx-ui/dev/vite" alt="Vite Version" />
  <img src="https://img.shields.io/github/package-json/packageManager/dativa-lv/lx-builders?label=package%20manager" alt="Package Manager" />
</p>

![lx/builders](https://raw.githubusercontent.com/dativa-lv/lx-builders/main/public/imgs/cover.png)

## Play around

Check out our [🌐&nbsp;Form Builder Demo](https://lx-ui.dev/resources/forms/builder) or try the <a href="https://lx-ui.dev/resources/constructor-dashboard">🛠️&nbsp;LxConstructor<sup>(beta)</sup></a> live.

## Design with
- <a href="https://json-schema.org">🌐&nbsp;JSON Schema</a>
- <a href="/docs/Constructor.md">ℹ️&nbsp;LxConstructor<sup>(beta)</sup></a>

## Render with
- <a href="/docs/ViewBuilder.md">ℹ️&nbsp;LxViewBuilder</a>
- <a href="/docs/FormBuilder.md">ℹ️&nbsp;LxFormBuilder</a>
- ℹ️&nbsp;LxFilterBuilder

## Get

Get using bun:
```bash
bun add '@dativa-lv/lx-builders@latest'
```

Get using pnpm:
```bash
pnpm i '@dativa-lv/lx-builders@latest'
```

For migration tips refer to [ℹ️&nbsp;Migration Guide](https://github.com/dativa-lv/lx-builders/blob/main/MIGRATION.md)

## Use

Use together with lx/ui library:
```js
import { createPinia } from 'pinia';
import { createLx } from '@dativa-lv/lx-ui';
import { createLxBuilders } from '@dativa-lv/lx-builders';
import App from '@/App.vue';
…
const myApp = createApp(App);
myApp.use(createPinia());
myApp.use(createLx());
myApp.use(createLxBuilders());
…
```

## Develop

```bash
pnpm i
pnpm build
```

Read more about development in [ℹ️&nbsp;Development manual](https://github.com/dativa-lv/lx-builders/blob/main/DEVELOPMENT.md)