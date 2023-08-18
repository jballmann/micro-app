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
      // fetch does not come with cookies by default, if you need to add cookies you need to configure credentials
      credentials: 'include', // request with cookies
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

#### ** React **
```js
// index.js
import React from "react"
import ReactDOM from "react-dom"
import App from './App'

// 👇 将渲染操作放入 mount 函数 -- 必填
export function mount () {
  ReactDOM.render(<App />, document.getElementById("root"))
}

// 👇 将卸载操作放入 unmount 函数 -- 必填
export function unmount () {
  ReactDOM.unmountComponentAtNode(document.getElementById("root"))
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // 非微前端环境直接渲染
  mount()
}
```

#### ** Vue2 **
这里只介绍配合`vue-router3.x`的用法

```js
// main.js
import Vue from 'vue'
import router from './router'
import App from './App.vue'

let app = null
// 👇 将渲染操作放入 mount 函数 -- 必填
function mount () {
  app = new Vue({
    router,
    render: h => h(App),
  }).$mount('#app')
}

// 👇 将卸载操作放入 unmount 函数 -- 必填
function unmount () {
  app.$destroy()
  app.$el.innerHTML = ''
  app = null
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // 非微前端环境直接渲染
  mount()
}
```

#### ** Vue3 **
这里只介绍配合`vue-router4.x`的用法

```js
// main.js
import { createApp } from 'vue'
import * as VueRouter from 'vue-router'
import routes from './router'
import App from './App.vue'

let app = null
let router = null
let history = null
// 👇 将渲染操作放入 mount 函数 -- 必填
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

// 👇 将卸载操作放入 unmount 函数 -- 必填
function unmount () {
  app.unmount()
  history.destroy()
  app = null
  router = null
  history = null
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // 非微前端环境直接渲染
  mount()
}
```

#### ** Angular **
以`angular11`为例。

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
// 👇 将渲染操作放入 mount 函数 -- 必填
async function mount () {
  app = await platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err))
}

// 👇 将卸载操作放入 unmount 函数 -- 必填
function unmount () {
  // angular在部分场景下执行destroy时会删除根元素app-root，此时可删除app.destroy()以避免这个问题
  app.destroy();
  app = null;
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // 非微前端环境直接渲染
  mount();
}
```


#### ** Vite **
因为vite作为子应用时关闭了沙箱，导致`__MICRO_APP_ENVIRONMENT__`和`__MICRO_APP_NAME__`两个变量失效，所以需要自行判断是否微前端环境以及手动填写应用name值。

这里以 vue3 + vue-router4 为例：
```js
// main.js
import { createApp } from 'vue'
import * as VueRouter from 'vue-router'
import routes from './router'
import App from './App.vue'

let app = null
let router = null
let history = null
// 👇 将渲染操作放入 mount 函数 -- 必填
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

// 👇 将卸载操作放入 unmount 函数 -- 必填
function unmount () {
  app.unmount()
  history.destroy()
  app = null
  router = null
  history = null
}

// 微前端环境下，注册mount和unmount方法
if (如果是微前端环境) {
  // 应用的name值，即 <micro-app> 元素的name属性值
  window[`micro-app-${应用的name值}`] = { mount, unmount }
} else {
  // 非微前端环境直接渲染
  mount()
}
```

#### ** 其它 **
```js
// entry.js

// 👇 将渲染操作放入 mount 函数 -- 必填
function mount () {
  ...
}

// 👇 将卸载操作放入 unmount 函数 -- 必填
function unmount () {
  ...
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // 非微前端环境直接渲染
  mount()
}
```
<!-- tabs:end -->

#### 自定义名称

通常注册函数的形式为 `window['micro-app-${window.__MICRO_APP_NAME__}'] = {}`，但也支持自定义名称，`window['自定义的名称'] = {}`

自定义的值需要在`<micro-app>`标签中通过`library`属性指定。

```html
<micro-app
  name='xxx'
  url='xxx'
  library='自定义的名称' 👈
></micro-app>
```

> [!NOTE]
>
> 1、mount和unmount方法都是必须的
>
> 2、nextjs, nuxtjs等ssr框架作为子应用时暂不支持umd模式
>
> 3、因为注册了`unmount`函数，所以卸载监听事件 `window.addEventListener('unmount', () => {})` 就不需要了
>
> 4、umd模式下，因为初次渲染和后续渲染逻辑不同，可能会出现一些问题，如：[#138](https://github.com/micro-zoe/micro-app/issues/138)
