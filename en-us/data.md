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

#### ** React **
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


#### 获取全局数据

<!-- tabs:start -->

#### ** 基座应用 **
```js
import microApp from '@micro-zoe/micro-app'

// 直接获取数据
const globalData = microApp.getGlobalData() // 返回全局数据

function dataListener (data) {
  console.log('全局数据', data)
}

/**
 * 绑定监听函数
 * dataListener: 绑定函数
 * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
 */
microApp.addGlobalDataListener(dataListener: Function, autoTrigger?: boolean)

// 解绑监听函数
microApp.removeGlobalDataListener(dataListener: Function)

// 清空基座应用绑定的所有全局数据监听函数
microApp.clearGlobalDataListener()
```

#### ** 子应用 **

```js
// 直接获取数据
const globalData = window.microApp.getGlobalData() // 返回全局数据

function dataListener (data) {
  console.log('全局数据', data)
}

/**
 * 绑定监听函数
 * dataListener: 绑定函数
 * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
 */
window.microApp.addGlobalDataListener(dataListener: Function, autoTrigger?: boolean)

// 解绑监听函数
window.microApp.removeGlobalDataListener(dataListener: Function)

// 清空当前子应用绑定的所有全局数据监听函数
window.microApp.clearGlobalDataListener()
```
<!-- tabs:end -->


## 关闭沙箱后的通信方式
沙箱关闭后，子应用默认的通信功能失效，此时可以通过手动注册通信对象实现一致的功能。

**注册方式：在基座应用中为子应用初始化通信对象**

```js
import { EventCenterForMicroApp } from '@micro-zoe/micro-app'

// 注意：每个子应用根据appName单独分配一个通信对象
window.eventCenterForAppxx = new EventCenterForMicroApp(appName)
```

子应用就可以通过注册的`eventCenterForAppxx`对象进行通信，其api和`window.microApp`一致，*基座通信方式没有任何变化。*

**子应用通信方式：**
```js
// 直接获取数据
const data = window.eventCenterForAppxx.getData() // 返回data数据

function dataListener (data) {
  console.log('来自基座应用的数据', data)
}

/**
 * 绑定监听函数
 * dataListener: 绑定函数
 * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
 */
window.eventCenterForAppxx.addDataListener(dataListener: Function, autoTrigger?: boolean)

// 解绑监听函数
window.eventCenterForAppxx.removeDataListener(dataListener: Function)

// 清空当前子应用的所有绑定函数(全局数据函数除外)
window.eventCenterForAppxx.clearDataListener()

// 子应用向基座应用发送数据，只接受对象作为参数
window.eventCenterForAppxx.dispatch({type: '子应用发送的数据'})
```


> [!TIP]
>
> 1、data只接受对象类型
>
> 2、数据变化时会进行严格对比(===)，相同的data对象不会触发更新。
>
> 3、在子应用卸载时，子应用中所有的数据绑定函数会自动解绑，基座应用中的数据解绑需要开发者手动处理。
