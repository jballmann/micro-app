<!-- tabs:start -->

# **Base App API**
## start
**Description:** micro-app registration function, executed globally once

**Definition：**
```js
start (options?: {
  tagName?: string, // Tag name, default: micro-app
  shadowDOM?: boolean, // Enable shadowDOM，default: false
  destroy?: boolean, // Force the destruction of all cached resources when sub-app is unmounted，default: false
  inline?: boolean, // Use inline script to execute JS，default: false
  disableScopecss?: boolean, // Globally disable style isolation, default: false
  disableSandbox?: boolean, // Disable sandboxing globally, default: false
  ssr?: boolean, // Enable SSR mode globally，default: false
  // Global life cycle
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
  // Plugin system for handling sub-app JS files
  plugins?: {
    // Global plugins that work on all sub-app JS files
    global?: Array<{
      // Optional, strongly isolated global vars (by default global vars that cannot be found by the sub-app are passed to the base app, scopeProperties disables this behavior)
      scopeProperties?: string[],
      // Optional, escape external global vars (vars in escapeProperties are assigned to both the sub-app and the native window)
      escapeProperties?: string[],
      // Optional, if function returns `true` then no script or link tag is created
      excludeChecker?: (url: string) => boolean
      // Optional，if function returns `true`, micro-app will not process it and the element will be rendered untouched
      ignoreChecker?: (url: string) => boolean
      // Optional，loader options
      options?: any,
      // Optional，JS handler, must return code
      loader?: (code: string, url: string, options: any, info: sourceScriptInfo) => string,
      // Optional，HTML handler, must return code
      processHtml?: (code: string, url: string, options: unknown) => string
    }>

    // Sub-app plugins
    modules?: {
      // Plugins will only work on the named application
      [name: string]: Array<{
        // See scopeProperties of global plugins
        scopeProperties?: string[],
        // See escapeProperties of global plugins
        escapeProperties?: string[],
        // See executeChecker of global plugins
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
  // Redefining fetch method to intercept resource requests
  fetch?: (url: string, options: Record<string, any>, appName: string | null) => Promise<string>
  // Global static resources
  globalAssets?: {
    js?: string[], // js地址
    css?: string[], // css地址
  },
})
```

**Usage:**
```js
// index.js
import microApp from '@micro-zoe/micro-app'

microApp.start()
```

## preFetch
**Description:** Preloads static resources during the idle time of the browser, loads in the order the items are passed

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
**Description:** Get running sub-apps, excluding unmounted and preloaded

**Version:** 0.5.2 or later

**Definition:**
```js
/**
 * @param excludeHiddenApp Filter keep-alive apps in the hidden state, default: false
 */
function getActiveApps(excludeHiddenApp?: boolean): string[]
```

**Usage:**
```js
import { getActiveApps } from '@micro-zoe/micro-app'

getActiveApps() // [appName1, appName2, ...]

getActiveApps(true) // Keep-alive in the hidden state are filtered
```

## getAllApps
**Description:** Get all sub-apps, including unmounted and preloaded
**Version:** 0.5.2 or later

**Definition:**
```js
function getAllApps(): string[]
```

**Usage:**
```js
import { getAllApps } from '@micro-zoe/micro-app'

getAllApps() // [appName1, appName2, ...]
```


## version
**Description:** Get version

**Way 1:**
```js
import { version } from '@micro-zoe/micro-app'
```

**Way 2:** Get version via version attribute of micro-app element
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
**Description:** Unbinding an element, typically used in cases where the base element is incorrectly bound to the sub-app due to the influence of element binding of the sub-app

**Usage:**
```js
import { removeDomScope } from '@micro-zoe/micro-app'

// Reset scope
removeDomScope()
```


## EventCenterForMicroApp
**Description:** Creates object for communicating with sub-apps when sandboxed is closed (e.g. Vite)

**Usage:**
```js
import { EventCenterForMicroApp } from '@micro-zoe/micro-app'

// Each sub-app has a separate communication object
window.eventCenterForAppName = new EventCenterForMicroApp(appName)
```

For details see：[How to communicate after closing the sandbox](/zh-cn/data?id=How to communicate after closing the sandbox)


## unmountApp
**Description:** Unmount app manually

**Version:** 0.6.1 or later

**Definition:**
```js
// unmountApp Parameters
interface unmountAppParams {
  /**
   * destroy: Force unmounting and delete cached resources，default: false
   * Priority: Above clearAliveState
   * For unmounted apps or keep-alive apps in background: App state and cached resources are cleared
   * For running apps: Unmounting and state and cached resources are cleared
   */
  destroy?: boolean;
  /**
   * clearAliveState: Clear app state，default：false
   * App is keep-alive: Unmount and clear state and keep cached resources
   * Other apps: Perform normal unmouting and keep cached resources
   * Addendum: Whether the keep-alive app is running or has been pushed into the background, the unmouting and state clearing will be performed and cached resources are kept
   */
  clearAliveState?: boolean;
}

function unmountApp(appName: string, options?: unmountAppParams): Promise<void>
```

**Usage:**
```js
// Normal
unmountApp(appName).then(() => console.log('Unmount successfully'))

// Unmount and clear cached resources
unmountApp(appName, { destroy: true }).then(() => console.log('Unmount successfully'))

// Unmount and clear state if the sub-app is keep-alive, or unmount normally if the app is not keep-alive
unmountApp(appName, { clearAliveState: true }).then(() => console.log('Unmount successfully'))

// If both destroy and clearAliveState are true，clearAliveState is ignored
unmountApp(appName, { destroy: true, clearAliveState: true }).then(() => console.log('Unmount successfully'))
```

## unmountAllApps
**Description:** Unmount of all apps manually

**Version:** 0.6.1 or later

**Definition:**
```js
// See unmountAppParams from unmountApp

function unmountAllApps(options?: unmountAppParams): Promise<void>
```

**Usage:**
```js
// Normal
unmountAllApps().then(() => console.log('Unmount successfully'))

// Unmount and clear cached resources
unmountAllApps({ destroy: true }).then(() => console.log('Unmount successfully'))

// Unmount and clear state if the sub-app is keep-alive, or unmount normally if the app is not keep-alive
unmountAllApps({ clearAliveState: true }).then(() => console.log('Unmount successfully'))

// If both destroy and clearAliveState are true，clearAliveState is ignored
unmountAllApps({ destroy: true, clearAliveState: true }).then(() => console.log('Unmount successfully'))
```

## setData
**Description:** Sends data to specified sub-app

**Definition:**
```js
setData(appName: String, data: Object)
```

**Usage:**
```js
import microApp from '@micro-zoe/micro-app'

// Send data to sub-app my-app, 2nd paramter of setData accepts only objects
microApp.setData('my-app', {type: 'New data'})
```

## getData
**Description:** Get data of sub-app

**Definition:**
```js
getData(appName: String): Object
```

**Usage:**
```js
import microApp from '@micro-zoe/micro-app'

const childData = microApp.getData('my-app') // Returns data of my-app
```

## addDataListener
**Description:** Register listener for data changes in specified sub-app

**Definition:**
```js
/**
 * Register listener
 * appName: App name
 * dataListener: Listener function
 * autoTrigger: If there are cached data when register the listener, you need to actively trigger it once, default: false
 */
microApp.addDataListener(appName: string, dataListener: Function, autoTrigger?: boolean)
```

**Usage:**
```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('Data from sup-app my-app', data)
}

microApp.addDataListener('my-app', dataListener)
```

## removeDataListener
**Description:** Unregister data listener for specified sub-app

**Usage:**

```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('Data from sub-app my-app', data)
}

// Unregister listener that listens to my-app
microApp.removeDataListener('my-app', dataListener)
```

## clearDataListener
**Description:** Clear all data listener for specified sub-app

**Usage:**

```js
import microApp from '@micro-zoe/micro-app'

// Unregister all listeners that listen to my-app
microApp.clearDataListener('my-app')
```


## getGlobalData
**Description:** Get global data

**Usage:**
```js
import microApp from '@micro-zoe/micro-app'

// Direct access to data
const globalData = microApp.getGlobalData() // Returns global data
```


## addGlobalDataListener
**Description:** Register data listener

**Definition:**
```js
/**
 * Register listener
 * dataListener: Listener function
 * autoTrigger: If there are cached data when register the listener, you need to actively trigger it once, default: false
 */
microApp.addGlobalDataListener(dataListener: Function, autoTrigger?: boolean)
```

**Usage:**
```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('Global data', data)
}

microApp.addGlobalDataListener(dataListener)
```

## removeGlobalDataListener
**Description:** Unregister global data listener

**Usage:**

```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('Global data', data)
}

microApp.removeGlobalDataListener(dataListener)
```

## clearGlobalDataListener
**Description:** Clear all global data listener

**Usage:**

```js
import microApp from '@micro-zoe/micro-app'

microApp.clearGlobalDataListener()
```

## setGlobalData
**Description:** Send global data

**Usage:**

```js
import microApp from '@micro-zoe/micro-app'

// setGlobalData accepts only objects as parameter
microApp.setGlobalData({type: 'New data'})
```


<!--
  ---------------------------------------------------------------------
  -------------------------------  Splitter  -----------------------------
  ---------------------------------------------------------------------
-->

# ** Sub-App API **

## pureCreateElement
**Description:** Creates unbound, pure elements that escape the boundaries of element isolation and are not controlled by the sub-app sandbox

**Version:** 0.8.2 or later

**Usage:**
```js
const pureDiv = window.microApp.pureCreateElement('div')

document.body.appendChild(pureDiv)
```


## removeDomScope
**Description:** Unbinding an element, typically used in cases where the base element is incorrectly bound to the sub-app due to the influence of element binding of the sub-app

**Version:** 0.8.2 or later

**Usage:**
```js
// Reset scope
window.microApp.removeDomScope()
```

## rawWindow
**Description:** Get the native window

**Usage:**
```js
window.rawWindow
```

## rawDocument
**Description:** Get the native document

**Usage:**
```js
window.rawDocument
```

## getData
**Description:** Get the data sent down from the base app

**Usage:**
```js
const data = window.microApp.getData() // Returns the data sent down by the base app
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
