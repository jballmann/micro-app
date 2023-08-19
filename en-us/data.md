The `micro-app` provides a flexible set of data communication mechanisms to facilitate data transfer between the base app and the sub-app.

Under normal circumstances, the communication between the base app and the sub-app is bound.
The base app can only send data to the specified sub-apps, and the sub-apps can only send data to the base.
This way, we can effectively avoid data contamination and prevent multiple sub-apps from influencing each other.

We also provide global communication to facilitate data communication across apps.


## I. Sub-apps get data from the base application
`micro-app` injects a global object with the name `microApp` into the sub-app, through which the sub-app can interact with the base app

There are two ways to get data from the base app:

#### Way 1：Direct access to data
```js
const data = window.microApp.getData() // Returns the data sent down by the base
```

#### Way 2：Register listener

See [API](/en-us/api.md#adddatalistener-1) for details
```js
function dataListener (data) {
  console.log('Data from the base app', data)
}

// Register listener
window.microApp.addDataListener(dataListener: Function, autoTrigger?: boolean)

// Unregister listener
window.microApp.removeDataListener(dataListener: Function)

// Clear all listener (except global) of the current sub-app
window.microApp.clearDataListener()
```


## II. Sub-app sends data to the base app
```js
// dispatch only accepts an object as argument
window.microApp.dispatch({type: 'Data sent by the sub-app'})
```

## III. Base app sends data to sub-application
There are two ways in which the base app can send data to the sub-app:

#### Way 1: Send data via the data attribute

<!-- tabs:start -->

#### **React**
In React we need to use a polyfill.

Add polyfill including comments at the top of the file where the `<micro-app>` element is located.
```js
/** @jsxRuntime classic */
/** @jsx jsxCustomEvent */
import jsxCustomEvent from '@micro-zoe/micro-app/polyfill/jsx-custom-event'
```

**Usage**
```js
<micro-app
  name='my-app'
  url='xx'
  data={this.state.dataForChild} // data only accepts object, it uses strict comparison (===), and will be resent when a new data object is passed in
/>
```

#### **Vue**
In vue, it is the same way as binding normal properties
```js
<template>
  <micro-app
    name='my-app'
    url='xx'
    :data='dataForChild' // data accepts only object and will be resent when data changes
  />
</template>

<script>
export default {
  data () {
    return {
      dataForChild: {type: 'Data sent to the sub-app'}
    }
  }
}
</script>
```
<!-- tabs:end -->

#### Way 2: Send data manually

Sending data manually requires that the sub-apps that should receive the data be specified via `name`.
The value must be consistent with the `name` in the `<micro-app>` element.
```js
import microApp from '@micro-zoe/micro-app'

// Send data to the sub-app my-app, the second parameter of setData accepts only an object
microApp.setData('my-app', {type: 'New data'})
```

## IV. Getting data from sub-apps by the base app
There are three ways for the base app to get data from the sub-app：

#### Way 1：Direct access to data
```js
import microApp from '@micro-zoe/micro-app'

const childData = microApp.getData(appName) // Returns sub-app's data
```

#### Way 2: Listening to datachange events

<!-- tabs:start -->

#### **React**
In React we need to use a polyfill

Add polyfill including comments at the top of the file where the `<micro-app>` element is located.
```js
/** @jsxRuntime classic */
/** @jsx jsxCustomEvent */
import jsxCustomEvent from '@micro-zoe/micro-app/polyfill/jsx-custom-event'
```

**Usage**
```js
<micro-app
  name='my-app'
  url='xx'
  // The data are in the event.detail.data field, and datachange is triggered every time the sub-app sends data
  onDataChange={(e) => console.log('Data from sub-apps：', e.detail.data)}
/>
```

#### **Vue**
Listening in Vue is the same as for normal events
```js
<template>
  <micro-app
    name='my-app'
    url='xx'
    // The data are in the event.detail.data field, and datachange is triggered every time the sub-app sends data
    @datachange='handleDataChange'
  />
</template>

<script>
export default {
  methods: {
    handleDataChange (e) {
      console.log('Data from sub-app:', e.detail.data)
    }
  }
}
</script>
```
<!-- tabs:end -->

#### Way 3: Register listener

Register a listener requires that the `name` of the sub-app is consistent with the `name` in the `<micro-app>` element.

See [API](/en-us/api.md#adddatalistener) for details

```js
import microApp from '@micro-zoe/micro-app'

function dataListener (data) {
  console.log('Data from the sub-app my-app', data)
}

microApp.addDataListener(appName: string, dataListener: Function, autoTrigger?: boolean)

// Unregister function that listens to the sub-app
microApp.removeDataListener(appName: string, dataListener: Function)

// Clear all functions that listen to the sub-app
microApp.clearDataListener(appName: string)
```


## Global data communication
Global data communication sends data to the base app and all sub-apps. It is applicable in cross-application communication scenarios.

#### Send global data

<!-- tabs:start -->

#### **Base App**
```js
import microApp from '@micro-zoe/micro-app'

// setGlobalData only accepts an objects as argument
microApp.setGlobalData({type: 'New global data'})
```

#### **Sub-App**

```js
// setGlobalData only accepts an objects as argument
window.microApp.setGlobalData({type: 'New global data'})
```
<!-- tabs:end -->


#### Getting global data

<!-- tabs:start -->

#### **Base App**
```js
import microApp from '@micro-zoe/micro-app'

// Direct access to data
const globalData = microApp.getGlobalData() // Returns global data

function dataListener (data) {
  console.log('Global data', data)
}

// See API for details
microApp.addGlobalDataListener(dataListener: Function, autoTrigger?: boolean)

// Unregister global data listener
microApp.removeGlobalDataListener(dataListener: Function)

// Clear all global data listener bound to base app
microApp.clearGlobalDataListener()
```

#### **Sub-App**

```js
// Direct access to data
const globalData = window.microApp.getGlobalData() // Returns global data

function dataListener (data) {
  console.log('Global data', data)
}

// See API for details
window.microApp.addGlobalDataListener(dataListener: Function, autoTrigger?: boolean)

// Unregister global data listener
window.microApp.removeGlobalDataListener(dataListener: Function)

// Clear all global data listener bound to sub-app
window.microApp.clearGlobalDataListener()
```
<!-- tabs:end -->


## Communication methods after closing the sandbox
After the sandbox is closed, the default communication function of the sub-app is disabled.
At this time, you can manually register the communication object to realize the consistent function.

**Registration method: Initialize the communication object for the sub-app in the base app**

```js
import { EventCenterForMicroApp } from '@micro-zoe/micro-app'

// Note: Each sub-app is assigned a separate communication object based on the appName
window.eventCenterForAppxx = new EventCenterForMicroApp(appName)
```

The sub-app can then communicate through the registered `eventCenterForAppxx` object. The API is the same as `window.microApp`, and there is no change in the way the base communicates.

**Sub-app communication method：**
```js
// Direct access to data
const data = window.eventCenterForAppxx.getData() // Return data

function dataListener (data) {
  console.log('Data from the base app', data)
}

// See API of normal addDataListener
window.eventCenterForAppxx.addDataListener(dataListener: Function, autoTrigger?: boolean)

// Unregister listener
window.eventCenterForAppxx.removeDataListener(dataListener: Function)

// Clear all listener (except global) of the current sub-app
window.eventCenterForAppxx.clearDataListener()

// The sub-app sends data to the base app, acceps only an objects as argument
window.eventCenterForAppxx.dispatch({type: 'Data sent by the sub-app'})
```


> [!TIP]
>
> 1. data accepts only objects
>
> 2. Strict comparisons (===) are made when data changes, and identical data objects do not trigger updates
>
> 3. When the sub-app is unmounted, all listeners in the sub-app are automatically unregistered. Listener in the base app needs to be handled manually by the developer.
