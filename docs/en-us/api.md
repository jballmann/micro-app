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

// Send data to sub-app my-app, 2nd parameter of setData accepts only objects
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

# **Sub-App API**

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
**Description:** Register data listener

**Definition:**
```js
/**
 * Register listener that only is triggered when data changes
 * dataListener: Listener function
 * autoTrigger: If there are cached data when register the listener, you need to actively trigger it once, default: false
 * !!!IMPORTANT: Because the sub-app is rendered asynchronous and the base app sends data synchronously, the base app send data before the sub-app is rendered. Therefore the data has already been sent before the registration of listener, which will not be triggered after initialization. The data are in the cache and you can set autoTrigger to true to actively trigger the listener function once to get the data.
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
**Description:** Clear all data listener (except global data functions) for current sub-app

**Usage:**

```js
window.microApp.clearDataListener()
```

## dispatch
**Description:** Send data to base app

**Usage:**

```js
// dispatch only accepts object as argument
window.microApp.dispatch({type: 'Data sent by sub-app'})
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
 * autoTrigger: If there are cached data when register the listener, you need to actively trigger it once, default: false
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
**Description:** Clear all global data listener bound to current sub-app

**Usage:**

```js
window.microApp.clearGlobalDataListener()
```

## setGlobalData
**Description:** Send global data

**Usage:**

```js
// setGlobalData accepts only object as argument
window.microApp.setGlobalData({type: 'Global data'})
```
<!-- tabs:end -->
