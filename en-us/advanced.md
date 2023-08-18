## 1. Customize fetch
By customizing the built-in fetch, you can modify the fetch configuration (e.g. add cookies or header information), or intercept HTML, JS, CSS and other static resources.

A custom fetch must be a Promise that returns a string type.

```js
import microApp from '@micro-zoe/micro-app'

microApp.start({
  /**
   * Customize fetch
   * @param {string} url resource address
   * @param {object} options fetch config
   * @param {string|null} appName app name
   * @returns Promise<string>
  */
  fetch (url, options, appName) {
    if (url === 'http://localhost:3001/error.js') {
      // Intercept http://localhost:3001/error.js
      return Promise.resolve('')
    }
    
    const config = {
      // Fetch does not come with cookies by default, if you need to add cookies you need to configure credentials
      credentials: 'include', // Request with cookies
    }

    return window.fetch(url, Object.assign(options, config)).then((res) => {
      return res.text()
    })
  }
})
```

> [!NOTE]
> 1. If a cross-domain request is made with a cookie, then `Access-Control-Allow-Origin` can't be set to `*`


## 2. Performance & Memory Optimization
`micro-app` supports two modes for rendering micro-frontends:

- **Default mode:** Sub-apps execute all JS sequentially on initial and subsequent renders to ensure consistency across multiple renders.
- **UMD mode:** The sub-app exposes the `mount` and `unmount` methods. All JS is executed only on the initial rendering, and only these two methods are executed on subsequent renders.

Normally the Default mode is sufficient for most projects, but the UMD mode provides better performance and memory performance when rendering multiple times.

**Does my project need to be switched to umd mode?**

If the sub-app rendering and unmounting is infrequent, then using the Default mode is sufficient.
For very frequent rendering and unmountig of sub-apps it is recommended to use UMD mode.

**Switch to UMD mode: sub-app registers mount and unmount methods on window**

<!-- tabs:start -->

#### **React**
```js
// index.js
import React from "react"
import ReactDOM from "react-dom"
import App from './App'

// 👇 Put rendering into the mount function -- Required
export function mount () {
  ReactDOM.render(<App />, document.getElementById("root"))
}

// 👇 Put the unmounting into the unmount function -- Required
export function unmount () {
  ReactDOM.unmountComponentAtNode(document.getElementById("root"))
}

// Registering mount and unmount methods in the micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering in non-micro-frontend env
  mount()
}
```

#### **Vue2**
Uses `vue-router3.x`

```js
// main.js
import Vue from 'vue'
import router from './router'
import App from './App.vue'

let app = null
// 👇 Put rendering into the mount function -- Required
function mount () {
  app = new Vue({
    router,
    render: h => h(App),
  }).$mount('#app')
}

// 👇 Put the unmounting into the unmount function -- Required
function unmount () {
  app.$destroy()
  app.$el.innerHTML = ''
  app = null
}

// Registering mount and unmount methods in the micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering in non-micro-frontend env
  mount()
}
```

#### **Vue3**
Uses `vue-router4.x`

```js
// main.js
import { createApp } from 'vue'
import * as VueRouter from 'vue-router'
import routes from './router'
import App from './App.vue'

let app = null
let router = null
let history = null
// 👇 Put rendering into the mount function -- Required
function mount () {
  history = VueRouter.createWebHistory(window.__MICRO_APP_BASE_ROUTE__ || '/')
  router = VueRouter.createRouter({
    history,
    routes,
  })

  app = createApp(App)
  app.use(router)
  app.mount('#app')
}

// 👇 Put the unmounting into the unmount function -- Required
function unmount () {
  app.unmount()
  history.destroy()
  app = null
  router = null
  history = null
}

// Registering mount and unmount methods in the micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering in non-micro-frontend env
  mount()
}
```

#### ** Angular **
Uses `Angular 11`

```js
// main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

declare global {
  interface Window {
    microApp: any
    __MICRO_APP_NAME__: string
    __MICRO_APP_ENVIRONMENT__: string
  }
}

let app = null;
// 👇 Put rendering into the mount function -- Required
async function mount () {
  app = await platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err))
}

// 👇 Put the unmounting into the unmount function -- Required
function unmount () {
  // Angular will delete the root element app-root when executing destroy in some scenarios, you can delete app.destroy() to avoid this issue
  app.destroy();
  app = null;
}

// Registering mount and unmount methods in the micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering in non-micro-frontend env
  mount();
}
```


#### **Vite**
Because Vite closes the sandbox when it is used as a sub-app, the `__MICRO_APP_ENVIRONMENT__` and `__MICRO_APP_NAME__` variables are invalidated.
So you need to determine whether it is the micro-frontend env or not manually and fill in the value of the app name.

Example for Vue3 + vue-router4:
```js
// main.js
import { createApp } from 'vue'
import * as VueRouter from 'vue-router'
import routes from './router'
import App from './App.vue'

let app = null
let router = null
let history = null
// 👇 Put rendering into the mount function -- Required
function mount () {
  history = VueRouter.createWebHashHistory()
  router = VueRouter.createRouter({
    history,
    routes,
  })

  app = createApp(App)
  app.use(router)
  app.mount('#app')
}

// 👇 Put the unmounting into the unmount function -- Required
function unmount () {
  app.unmount()
  history.destroy()
  app = null
  router = null
  history = null
}

// Registering mount and unmount methods in the micro-frontend env
if (isInMicroEnv) {
  // The name of the app, i.e. the value of the name attribute of the <micro-app> element
  window[`micro-app-${appName}`] = { mount, unmount }
} else {
  // Direct rendering in non-micro-frontend env
  mount()
}
```

#### **Others**
```js
// entry.js

// 👇 Put rendering into the mount function -- Required
function mount () {
  ...
}

// 👇 Put the unmounting into the unmount function -- Required
function unmount () {
  ...
}

// Registering mount and unmount methods in the micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering in non-micro-frontend env
  mount()
}
```
<!-- tabs:end -->

#### Customize name

Normally the registration function is of the form `window['micro-app-${window.__MICRO_APP_NAME__}'] = {}`, but customized names are also supported: `window['custom-name'] = {}`.

Custom values need to be specified in the `library` attribute of the `<micro-app>` tag.

```html
<micro-app
  name='xxx'
  url='xxx'
  library='custom-name' 👈
></micro-app>
```

> [!NOTE]
>
> 1. Both mount and unmount methods are required!
>
> 2. Next.js, Nuxt and other SSR frameworks do not support UMD mode when used as a sub-app.
>
> 3. Since the `unmount` function is registered, unregistering the event listener `window.addEventListener('unmount', () => {})` is not required
>
> 4. In UMD mode, because the initial and subsequent rendering logic are different, there may be some problems, see [#138](https://github.com/micro-zoe/micro-app/issues/138)
