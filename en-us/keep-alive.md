*Supported by version 0.6.0 and later*

When switching between apps, you want sometimes to preserve the state of those apps in order to restore the user's operational behavior and improve the performance of repetitive rendering.
This can be achieved by turning on the keep-alive mode.

With keep-alive turned on, apps are not destroyed when unmounted, instead they are pushed to run in the background.

## Usage
```html
<micro-app name='xx' url='xx' keep-alive></micro-app>
```

## Life cycle
The biggest difference between keep-alive mode and normal mode is the lifecycle, as it is not really unmounted and the `unmount` event is not triggered.

The life cycle in the base and sub-app is as follows:

### Base App

#### 1. created
Triggered after the `<micro-app>` tag is initialized and before loading resources

#### 2. beforemount
Triggered `(executed only once on initialization)` after loading resources is complete and before starting rendering.

#### 3. mounted
Triggered `(executed only once on initialization)` after the sub-app has finished rendering.

#### 4. error
Triggered on sub-app rendering errors, only errors that would cause the rendering to terminate will trigger this event.

#### 5. afterhidden
Triggered when the sub-app is uninstalled.

#### 6. beforeshow
Trigger `(not executed on initialization)` before the sub-app renders again.

#### 7. aftershow
Triggers `(not executed on initialization)` after the sub-app is rendered again.


#### Listening to life cycle
<!-- tabs:start -->

#### ** React **
Since React doesn't support custom events, we need to use a polyfill.

Add polyfill including comments at the top of the file where the `<micro-app>` tag is located.
```js
/** @jsxRuntime classic */
/** @jsx jsxCustomEvent */
import jsxCustomEvent from '@micro-zoe/micro-app/polyfill/jsx-custom-event'
```

**Usage**
```js
<micro-app
  name='xx'
  url='xx'
  onCreated={() => console.log('micro-app element is created')}
  onBeforemount={() => console.log('is about to be rendered, is only executed once at init')}
  onMounted={() => console.log('has been rendered, is only executed once at init')}
  onAfterhidden={() => console.log('uninstalled')}
  onBeforeshow={() => console.log('is about to be re-rendered, not executed on init')}
  onAftershow={() => console.log('has been re-rendered, is not executed on init')}
  onError={() => console.log('rendering error')}
/>
```

#### **Vue**
Listening in Vue is the same as for normal events
```html
<template>
  <micro-app
    name='xx'
    url='xx'
    @created='created'
    @beforemount='beforemount'
    @mounted='mounted'
    @afterhidden='afterhidden'
    @beforeshow='beforeshow'
    @aftershow='aftershow'
    @error='error'
  />
</template>

<script>
export default {
  methods: {
    created () {
      console.log('micro-app element is created'),
    },
    beforemount () {
      console.log('is about to be rendered, is only executed once at init'),
    },
    mounted () {
      console.log('has been rendered, is only executed once at init'),
    },
    afterhidden () {
      console.log('uninstalled'),
    },
    beforeshow () {
      console.log('is about to be re-rendered, not executed on init'),
    },
    aftershow () {
      console.log('has been re-rendered, is not executed on init'),
    },
    error () {
      console.log('rendering error),
    }
  }
}
</script>
```
<!-- tabs:end -->

### Sub-App
In keep-alive mode, when the sub-app is uninstalled and re-rendered, micro-app will send a custom event named `appstate-change` to the sub-app.
The sub-app can get the current state by listening to this event, the state value can be obtained by the `event.detail.appState`.

There are three values for `event.detail.appState`: ``afterhidden` (unloaded), `belowshow` (about to render), and `aftershow` (alread rendered).

```js
// Listen to app status in keep-alive mode
window.addEventListener('appstate-change', function (e) {
  if (e.detail.appState === 'afterhidden') {
    console.log('uninstalled')
  } else if (e.detail.appState === 'beforeshow') {
    console.log('about to be re-rendered')
  } else if (e.detail.appState === 'aftershow') {
    console.log('it is been re-rendered')
  }
})
```

The `appstate-change` event is not triggered when the app is initialized.


## Common problems
#### 1. Mismatch between url and page when rendering again
A keep-alive app will retain the page state when it is uninstalled and restore it directly when it is rendered again.
When the url of the app when it is rendered again is not the same as when it was left, there is a problem of mismatch between the url and the page.

If this issue is bothering you, you can fix it by listening to the `appstate-change` event at `beforeshow` to jump to the corresponding page based on the url.

#### 2. How do I restore the page scroll position?
The micro-app does not record the page scroll position and does not recover them when the app is rendered again. It is up to the developer to record and recover it.

#### 3. Loss of state after switching pages within a sub-app
The micro-app's keep-alive is at application level, it will only keep the state of the currently active page to ensure state retention when the app is uninstalled and re-rendered.
If you want to cache specific pages or components, you need to use the capabilities of the sub-app framework, e.g. Vue's keep-alive.
