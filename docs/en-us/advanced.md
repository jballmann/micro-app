## 1. Customize fetch
By replacing the framework's own fetch functionality with a custom fetch function,
you can modify the fetch configuration (e.g. add cookies or header information),
or intercept HTML, JS, CSS and other static resources.

The custom fetch must be a Promise that returns a string.

```js
import microApp from '@micro-zoe/micro-app'

microApp.start({
  /**
   * custom fetch
   * @param {string} url Resource address
   * @param {object} options Fetch request config
   * @param {string|null} appName Application name
   * @returns Promise<string>
  */
  fetch (url, options, appName) {
    if (url === 'http://localhost:3001/error.js') {
      // Delete the content of http://localhost:3001/error.js
      return Promise.resolve('')
    }
    
    const config = {
      // Fetch does not come with cookies by default，if you need to add credential cookies you must configure it
      credentials: 'include', // Request with cookies
    }

    return window.fetch(url, Object.assign(options, config)).then((res) => {
      return res.text()
    })
  }
})
```

> [!NOTE]
> 1. If a cross-domain request uses cookies, then `Access-Control-Allow-Origin` can not be set to `*`

## 2. Performance & memory optimization
`micro-app` supports two modes for rendering micro-fontends:

- **Default mode:** Sub-applications will execute all JS sequentially on initial and follow-up renders to ensure consistency across multiple renders.
- **UMD mode:** Sub-applications exposes `mount` and `unmount` methods. All JS is executed only at the initial rendering. At follow-up renderings only the two methods are executed. This mode provides a better performance for multiple renderings.

**Does my project have to switch to UMD mode?**

If sub-application rendering and uninstallation is infrequent, using the default mode is sufficient.In tha case that rendering and uninstallation is very frequent it is recommend to use the UMD mode.

**Switch to UMD mode: Register mount and unmount methods on window**

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

// 👇 Put the uninstall operation into the unmount function -- Required
export function unmount () {
  ReactDOM.unmountComponentAtNode(document.getElementById("root"))
}

// Register mount and unmount in micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering for non-micro-frontend env
  mount()
}
```

#### **Vue2**
Here it is only used in combination with `vue-router3.x`

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

// 👇 Put the uninstall operation into the unmount function -- Required
function unmount () {
  app.$destroy()
  app.$el.innerHTML = ''
  app = null
}

// Register mount and unmount in micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering for non-micro-frontend env
  mount()
}
```

#### **Vue3**
Here it is only used in combination with `vue-router4.x`

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

// 👇 Put the uninstall operation into the unmount function -- Required
function unmount () {
  app.unmount()
  history.destroy()
  app = null
  router = null
  history = null
}

// Register mount and unmount in micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering for non-micro-frontend env
  mount()
}
```

#### **Angular**
Take `Angular 11` for instance.

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

// 👇 Put the uninstall operation into the unmount function -- Required
function unmount () {
  // Angular will delete the root element app-root when executing destroy in some scenarios. You can delete app.destroy() to avoid this issue.
  app.destroy();
  app = null;
}

// Register mount and unmount in micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering for non-micro-frontend env
  mount();
}
```
#### **Vite**
Because Vite closes the sandbox when it is used as a sub-application, the `__MICRO_APP_ENVIRONMENT__` and `__MICRO_APP_NAME__` variables are invalidated.
So you need to determine whether it is executed in a micro-frontend env or not manually by filling in the app's name value by yourself.

Here is an example for Vue3 + vue-router4：
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

// 👇 Put the uninstall operation into the unmount function -- Required
function unmount () {
  app.unmount()
  history.destroy()
  app = null
  router = null
  history = null
}

// Register mount and unmount in micro-frontend env
if (isInMicroAppEnv) {
  // The name of the application, i.e. the value of the name attribute of the <micro-app> element
  window[`micro-app-${appName}`] = { mount, unmount }
} else {
  // Direct rendering for non-micro-frontend env
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

// 👇 Put the uninstall operation into the unmount function -- Required
function unmount () {
  ...
}

// Register mount and unmount in micro-frontend env
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // Direct rendering for non-micro-frontend env
  mount()
}
```
<!-- tabs:end -->

#### Custom names
The usual registration function is of the form `window['micro-app-' + window.__MICRO_APP_NAME__}] = {}`, but custom names are also supported: `window['customName'] = {}`

Custom values need to be specified in the `library` attribute of the `<micro-app>` tag.

```html
<micro-app
  name='xxx'
  url='xxx'
  library='customName' 👈
></micro-app>
```
> [!NOTE]
>
> 1. Both the mount and unmount methods are required!
>
> 2. Next.js, Nuxt and other SSR frameworks do not support UMD mode when used as sub-application.
>
> 3. Since the `unmount` method is registered, removing the event listener `window.addEventListener('unmount', () => {})` is not required.
>
> 4. In UMD mode, because the initial and follow-up rendering logics are different, there may be some problems：[#138](https://github.com/micro-zoe/micro-app/issues/138)
