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
 * autoTrigger: If there are cached data when first binding the listener function, you need to actively trigger it once, default: false
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

// setGlobalData only accepts an object as argument
microApp.setGlobalData({type: 'New data'})
```


<!--
  ---------------------------------------------------------------------
  -------------------------------  Splitter  -----------------------------
  ---------------------------------------------------------------------
-->

# **Sub-App API**

## pureCreateElement
**Description:** Create unbound, pure elements that escape the boundaries of element isolation and are not controlled by the sub-app sandbox

**Version:** 0.8.2 or later

**Usage:**
```js
const pureDiv = window.microApp.pureCreateElement('div')

document.body.appendChild(pureDiv)
```


## removeDomScope
**Description:** Unbinding an element, typically used in cases where the base element is incorrectly bound to the sub-app due to the influence of the sub-app's element binding

**Version:** 0.8.2 or later

**Usage:**
```js
// Reset scope
window.microApp.removeDomScope()
```

## rawWindow
**Description:** Get native window

**Usage:**
```js
window.rawWindow
```

## rawDocument
**Description:** Get native document

**Usage:**
```js
window.rawDocument
```


## getData
**Description:** Get data sent down from the base

**Usage:**
```js
const data = window.microApp.getData() // Returns the data sent down by the base
```

## addDataListener
**Description:** Register data listener

**Definition:**
```js
/**
 * Register listener that is only triggered when the data changes
 * dataListener: Listener function
 * autoTrigger: If there are cached data when first binding the listener function, you need to actively trigger it once, default: false
 * !!!IMPORTANT: Because the sub-app is rendered asynchronously and the base sends the data synchronously, the base app sends the data before the sub-app is rendered and the data listener is registered. The listener will not be triggered after initialization by default. But the data will be put into the cache and you can set autoTrigger to true to actively trigger the listener function to get the data once.
 */
window.microApp.addDataListener(dataListener: Function, autoTrigger?: boolean)
```

**Usage:**
```js
function dataListener (data) {
  console.log('Data from base app', data)
}

window.microApp.addDataListener(dataListener)
```

## removeDataListener
**Description:** Unregister data listener

**Usage:**

```js
function dataListener (data) {
  console.log('Data from base app', data)
}

window.microApp.removeDataListener(dataListener)
```

## clearDataListener
**Description:** Clear all data listener (except global) for the current sub-app

**Usage:**

```js
window.microApp.clearDataListener()
```

## dispatch
**Description:** Send data to the base application

**Usage:**

```js
// dispatch only accepts an objects as argument
window.microApp.dispatch({type: 'Data from sub-app'})
```


## getGlobalData
**Description:** Get global data

**Usage:**
```js
const globalData = window.microApp.getGlobalData() // Returns global data
```


## addGlobalDataListener
**Description:** Register data listener

**Definition:**
```js
/**
 * Register listener
 * dataListener: Listener function
 * autoTrigger: If there are cached data when first binding the listener function, you need to actively trigger it once, default: false
 */
window.microApp.addGlobalDataListener(dataListener: Function, autoTrigger?: boolean)

```

**Usage:**
```js
function dataListener (data) {
  console.log('Global data', data)
}

window.microApp.addGlobalDataListener(dataListener)
```

## removeGlobalDataListener
**Description:** Unregister global data listener

**Usage:**

```js
function dataListener (data) {
  console.log('Global data', data)
}

window.microApp.removeGlobalDataListener(dataListener)
```

## clearGlobalDataListener
**Description:** Clear all global data listener

**Usage:**

```js
window.microApp.clearGlobalDataListener()
```

## setGlobalData
**Description:** Send global data

**Usage:**

```js
// setGlobalData only accepts an object as argument
window.microApp.setGlobalData({type: '全局数据'})
```
<!-- tabs:end -->
