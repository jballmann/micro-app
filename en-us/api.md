<!-- tabs:start -->

# **Base App API**
## start
**Description:** micro-app registration function, executed globally once

**Definition:**
```js
start (options?: {
  tagName?: string, // Tag name, default: micro-app
  shadowDOM?: boolean, // Enable shadowDOM, default: false
  destroy?: boolean, // Force the destruction of all cached resources when the sub-app is unmounted, default: false
  inline?: boolean, // Use inline script to execute JS, default: false
  disableScopecss?: boolean, // Disable style isolation globally，default: false
  disableSandbox?: boolean, // Disable sandboxing globally, default: false
  ssr?: boolean, // Enable SSR mode globally, default: false
  // Life Cycle
  lifeCycles?: {
    created?(e?: CustomEvent): void
    beforemount?(e?: CustomEvent): void
    mounted?(e?: CustomEvent): void
    unmount?(e?: CustomEvent): void
    error?(e?: CustomEvent): void
  },
  // Preloading, supports array or function
  preFetchApps?: Array<{
    name: string,
    url: string,
    disableScopecss?: boolean,
    disableSandbox?: boolean,
    shadowDOM?: boolean
  }> | (() => Array<{
    name: string,
    url: string,
    disableScopecss?: boolean,
    disableSandbox?: boolean,
    shadowDOM?: boolean
  }>),
  // Plugin system for handling JS files of sub-apps
  plugins?: {
    // Global plugins that acts on all sub-apps
    global?: Array<{
      // Optional, Strongly isolated global vars (by default global vars that can't be found by the sub-app are passed to the base app, scopeProperties disables this behavior)
      scopeProperties?: string[],
      // Optional, Escape external global vars (vars in escapeProperties are assigned to both the sub-app and the native window)
      escapeProperties?: string[],
      // Optional, If the function returns `true` then no script and link tags are created
      excludeChecker?: (url: string) => boolean
      // Optional, If the function returns `true`, micro-app will not process it and the element will be rendered untouched
      ignoreChecker?: (url: string) => boolean
      // Optional, Loader config
      options?: any,
      // Optional, JS handler function, must return code
      loader?: (code: string, url: string, options: any, info: sourceScriptInfo) => string,
      // Optional, HTML handler function, must return code
      processHtml?: (code: string, url: string, options: unknown) => string
    }>

    // 子应用插件
    modules?: {
      // These plugins will only work on the specified app
      [name: string]: Array<{
        // See scopeProperties of global plugins
        scopeProperties?: string[],
        // See escapeProperties of global plugins
        escapeProperties?: string[],
        // See excludeChecker of global plugins
        excludeChecker?: (url: string) => boolean
        // See ignoreChecker of global plugins
        ignoreChecker?: (url: string) => boolean
        // See options of global plugins
        options?: any,
        // See loader of global plugins
        loader?: (code: string, url: string, options: any, info: sourceScriptInfo) => string,
        // See processHtml of global plugins
        processHtml?: (code: string, url: string, options: unknown) => string
      }>
    }
  },
  // Redefining the fetch method for intercept resource requests
  fetch?: (url: string, options: Record<string, any>, appName: string | null) => Promise<string>
  // Global static resources
  globalAssets?: {
    js?: string[], // JS addresses
    css?: string[], // CSS addresses
  },
  // Specify that some special dynamically loaded micro-app resources (CSS/JS) will not be hijacked by micro-app
  excludeAssetFilter?: (assetUrl: string) => boolean
})
```

**Usage:**
```js
// index.js
import microApp from '@micro-zoe/micro-app'

microApp.start()
```

## preFetch
**Description:** Preloading, loads static resources in the order in which they were passed in during the browser's idle time

**Definition:**
```js
preFetch([
  {
    name: string,
    url: string,
    disableScopecss?: boolean,
    disableSandbox?: boolean,
  },
])
```

**Usage:**
```js
import { preFetch } from '@micro-zoe/micro-app'

// Option 1
preFetch([
  { name: 'my-app1', url: 'xxx' },
  { name: 'my-app2', url: 'xxx' },
])

// Option 2
preFetch(() => [
  { name: 'my-app1', url: 'xxx' },
  { name: 'my-app2', url: 'xxx' },
])
```


## getActiveApps
**Description:** Get all running sub-apps, excluding uninstalled and preloaded

**Version:** 0.5.2 or later

**Definition:**
```js
/**
 * @param excludeHiddenApp Filter keep-alive applications that are in the hidden state, default: false
 */
function getActiveApps(excludeHiddenApp?: boolean): string[]
```

**Usage:**
```js
import { getActiveApps } from '@micro-zoe/micro-app'

getActiveApps() // [appName, appName, ...]

getActiveApps(true) // Keep-alive in the hidden state will be filtered
```

## getAllApps
**Description:**  Get all sub-apps, including uninstalled and pre-loaded

**Version:** 0.5.2 or later

**Definition:**
```js
function getAllApps(): string[]
```

**Usage:**
```js
import { getAllApps } from '@micro-zoe/micro-app'

getAllApps() // [appName, appName, ...]
```


## version
**Description:** Get version

**Way 1**
```js
import { version } from '@micro-zoe/micro-app'
```

**Way 2** Use version attribute of the micro-app element
```js
document.querySelector('micro-app').version
```

## pureCreateElement
**Description:** Creates unbound pure element

**Usage:**
```js
import { pureCreateElement } from '@micro-zoe/micro-app'

const pureDiv = pureCreateElement('div')

document.body.appendChild(pureDiv)
```


## removeDomScope
**Description:** Unbinding an element, typically used in cases where the base element is incorrectly bound to the sub-app due to the influence of the sub-app's element binding

**Usage:**
```js
import { removeDomScope } from '@micro-zoe/micro-app'

// Reset scope
removeDomScope()
```


## EventCenterForMicroApp
**Description:** Creates an object for communicating with the sub-app when the sandbox is closed (e.g., Vite)

**Usage:**
```js
import { EventCenterForMicroApp } from '@micro-zoe/micro-app'

// Each sub-app gets a separate communication object based on the appName
window.eventCenterForAppName = new EventCenterForMicroApp(appName)
```

For details, see: [How to communicate after closing the sandbox](/en-us/data?id=How to communicate after closing the sandbox)


## unmountApp
**Description:** Unmount app manually

**Version:** 0.6.1 or later

**Definition:**
```js
// unmountApp params
interface unmountAppParams {
  /**
   * destroy: Force unmounting the app and delete cached resources, default: false
   * Priority: Above clearAliveState
   * For unmounted apps and keep-alive apps in background: App state and cached resources are cleared
   * For running apps: App is unmounted and the state and cached resources will be cleared
   */
  destroy?: boolean;
  /**
   * clearAliveState: Clear the cache state of the app, default: false
   * For keep-alive apps: Uninstall and clear the state and keep the cached resources
   * For others: Perform the normal uninstallation process and keep the cached resources
   * Addendum: Whether the keep-alive app is running or has been pushed into the background, the uninstall operation will be performed, app's cache state is cleared and the cached resources are preserved
   */
  clearAliveState?: boolean;
}

function unmountApp(appName: string, options?: unmountAppParams): Promise<void>
```

**Usage:**
```js
// Normal
unmountApp(appName).then(() => console.log('Unmounting successful'))

// Unmount app and clear the cached resources
unmountApp(appName, { destroy: true }).then(() => console.log('Unmounting successful'))

// Unmount and clear the state if the sub-app is keep-alive, or otherwise unmount normally
unmountApp(appName, { clearAliveState: true }).then(() => console.log('Unmouting successful'))

// If both destroy and clearAliveState are true, clearAliveState will be ignored
unmountApp(appName, { destroy: true, clearAliveState: true }).then(() => console.log('Unmounting successful'))
```

## unmountAllApps
**Description:** Unmount all apps manually

**Version:** 0.6.1 or later

**Definition:**
```js
// See unmountAppParams at unmountApp

function unmountAllApps(appName: string, options?: unmountAppParams): Promise<void>
```

**Usage:**
```js
// Normal
unmountAllApps().then(() => console.log('卸载成功'))

// Unmount app and clear the cached resources
unmountAllApps({ destroy: true }).then(() => console.log('卸载成功'))

// Unmount and clear the state if the sub-app is keep-alive, or otherwise unmount normally
unmountAllApps({ clearAliveState: true }).then(() => console.log('卸载成功'))

// If both destroy and clearAliveState are true, clearAliveState will be ignored
unmountAllApps({ destroy: true, clearAliveState: true }).then(() => console.log('卸载成功'))
```

## setData
**Description:** Send data to the specified app

**Definition:**
```js
setData(appName: String, data: Object)
```

**Usage:**
```js
import microApp from '@micro-zoe/micro-app'

// Send data to the sub-app my-app, the second parameter of setData accepts only an object
microApp.setData('my-app', {type: 'New data'})
```

## getData
**Description:** Get the data of the specified sub-app

**Definition:**
```js
getData(appName: String): Object
```

**Usage:**
```js
import microApp from '@micro-zoe/micro-app'

const childData = microApp.getData('my-app') // Returns data of the my-app sub-app
```

## addDataListener
**Description:** Register listener for data changes in the specified sub-app

**Definition:**
```js
/**
 * Register listener
 * appName: App name
 * dataListener: Listener function
 * autoTrigger: If there are cached data when first binding the listener function, you need to actively trigger it once, default: false
 */
microApp.addDataListener(appName: string, dataListener: Function, autoTrigger?: boolean)
```

**Usage:**
```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('Data from the sub-app my-app', data)
}

microApp.addDataListener('my-app', dataListener)
```

## removeDataListener
**Description:** Unregister the data listener for the specified sub-app

**Usage:**

```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('Data from the sub-app my-app', data)
}

// Remove the data-listening function that listens to my-app
microApp.removeDataListener('my-app', dataListener)
```

## clearDataListener
**Description:** Clear all data listener for the specified sub-app

**Usage:**

```js
import microApp from '@micro-zoe/micro-app'

// Clear all data listener that listens to my-app
microApp.clearDataListener('my-app')
```


## getGlobalData
**描述：**获取全局数据

**使用方式：**
```js
import microApp from '@micro-zoe/micro-app'

// 直接获取数据
const globalData = microApp.getGlobalData() // 返回全局数据
```


## addGlobalDataListener
**描述：**绑定数据监听函数

**介绍：**
```js
/**
 * 绑定监听函数
 * dataListener: 绑定函数
 * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
 */
microApp.addGlobalDataListener(dataListener: Function, autoTrigger?: boolean)
```

**使用方式：**
```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('全局数据', data)
}

microApp.addGlobalDataListener(dataListener)
```

## removeGlobalDataListener
**描述：**解绑全局数据监听函数

**使用方式：**

```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('全局数据', data)
}

microApp.removeGlobalDataListener(dataListener)
```

## clearGlobalDataListener
**描述：**清空基座应用绑定的所有全局数据监听函数

**使用方式：**

```js
import microApp from '@micro-zoe/micro-app'

microApp.clearGlobalDataListener()
```

## setGlobalData
**描述：**发送全局数据

**使用方式：**

```js
import microApp from '@micro-zoe/micro-app'

// setGlobalData只接受对象作为参数
microApp.setGlobalData({type: '全局数据'})
```


<!--
  ---------------------------------------------------------------------
  -------------------------------  分割线  -----------------------------
  ---------------------------------------------------------------------
-->

# ** 子应用API **

## pureCreateElement
**描述：**创建无绑定的纯净元素，该元素可以逃离元素隔离的边界，不受子应用沙箱的控制

**版本限制：** 0.8.2及以上版本

**使用方式：**
```js
const pureDiv = window.microApp.pureCreateElement('div')

document.body.appendChild(pureDiv)
```


## removeDomScope
**描述：**解除元素绑定，通常用于受子应用元素绑定影响，导致基座元素错误绑定到子应用的情况

**版本限制：** 0.8.2及以上版本

**使用方式：**
```js
// 重置作用域
window.microApp.removeDomScope()
```

## rawWindow
**描述：**获取真实的window

**使用方式：**
```js
window.rawWindow
```

## rawDocument
**描述：**获取真实的document

**使用方式：**
```js
window.rawDocument
```


## getData
**描述：**获取基座下发的data数据

**使用方式：**
```js
const data = window.microApp.getData() // 返回基座下发的data数据
```

## addDataListener
**描述：**绑定数据监听函数

**介绍：**
```js
/**
 * 绑定监听函数，监听函数只有在数据变化时才会触发
 * dataListener: 绑定函数
 * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
 * !!!重要说明: 因为子应用是异步渲染的，而基座发送数据是同步的，
 * 如果在子应用渲染结束前基座应用发送数据，则在绑定监听函数前数据已经发送，在初始化后不会触发绑定函数，
 * 但这个数据会放入缓存中，此时可以设置autoTrigger为true主动触发一次监听函数来获取数据。
 */
window.microApp.addDataListener(dataListener: Function, autoTrigger?: boolean)
```

**使用方式：**
```js
function dataListener (data) {
  console.log('来自基座应用的数据', data)
}

window.microApp.addDataListener(dataListener)
```

## removeDataListener
**描述：**解绑数据监听函数

**使用方式：**

```js
function dataListener (data) {
  console.log('来自基座应用的数据', data)
}

window.microApp.removeDataListener(dataListener)
```

## clearDataListener
**描述：**清空当前子应用的所有数据监听函数(全局数据函数除外)

**使用方式：**

```js
window.microApp.clearDataListener()
```

## dispatch
**描述：**向基座应用发送数据

**使用方式：**

```js
// dispatch只接受对象作为参数
window.microApp.dispatch({type: '子应用发送的数据'})
```


## getGlobalData
**描述：**获取全局数据

**使用方式：**
```js
const globalData = window.microApp.getGlobalData() // 返回全局数据
```


## addGlobalDataListener
**描述：**绑定数据监听函数

**介绍：**
```js
/**
 * 绑定监听函数
 * dataListener: 绑定函数
 * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
 */
window.microApp.addGlobalDataListener(dataListener: Function, autoTrigger?: boolean)

```

**使用方式：**
```js
function dataListener (data) {
  console.log('全局数据', data)
}

window.microApp.addGlobalDataListener(dataListener)
```

## removeGlobalDataListener
**描述：**解绑全局数据监听函数

**使用方式：**

```js
function dataListener (data) {
  console.log('全局数据', data)
}

window.microApp.removeGlobalDataListener(dataListener)
```

## clearGlobalDataListener
**描述：**清空当前子应用绑定的所有全局数据监听函数

**使用方式：**

```js
window.microApp.clearGlobalDataListener()
```

## setGlobalData
**描述：**发送全局数据

**使用方式：**

```js
// setGlobalData只接受对象作为参数
window.microApp.setGlobalData({type: '全局数据'})
```
<!-- tabs:end -->
