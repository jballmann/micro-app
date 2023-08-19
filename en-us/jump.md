
Each app's routing instance is different. An app's routing instance can only control itself and cannot affect other apps.
This includes also the base app's inability to affect sub-apps.

> Common problems such as: developers want to jump through the sidebar of the base app to control the pages of the sub-app. This can't really be done, because only the routing instance of the sub-app can control its own pages.

**There are three ways to implement jumping between applications:**


## Way 1: Jump control via data communication
*Scenario: Base controls sub-app jumps*

**Listening for data changes in sub-apps**

```js
// Listen for changes in data sent down from the base
window.microApp.addDataListener((data) => {
  // Jumps are performed when the base issues a jump command
  if (data.path) {
    router.push(data.path)
  }
})
```

**The base sends a jump command**

```js
import microApp from '@micro-zoe/micro-app'

microApp.setData('appName', { path: '/new-path/' })
```


## Way 2: Passing routing method
*Scenario: Sub-app controls base jumps*

**The base sends down the pushState function:**
<!-- tabs:start -->

#### **React**
```js
import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import microApp, { removeDomScope } from '@micro-zoe/micro-app'

export default () => {
  const history = useHistory()

  function pushState (path) {
    removeDomScope()
    history.push(path)
  }

  useEffect(() => {
    // 👇 The base sends down a method called pushState to the sub-app
    microApp.setData('appName', { pushState })
  }, [])

  return (
    <div>
      <micro-app name='app-name' url='url'></micro-app>
    </div>
  )
}
```

#### **Vue**

```html
<template>
  <micro-app
    name='appName' 
    url='url'
    :data='microAppData'
  ></micro-app>
</template>

<script>
import { removeDomScope } from '@micro-zoe/micro-app'

export default {
  data () {
    return {
      microAppData: {
        pushState: (path) => {
          removeDomScope()
          this.$router.push(path)
        }
      }
    }
  },
}
</script>
```
<!-- tabs:end -->

**Sub-app use pushState to control jumps in base:**

```js
window.microApp.getData().pushState(path)
```

## Way 3: window.history
Use [history.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) or [history.replaceState](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) for jumping

Example：
```js
window.history.pushState(history.state, '', 'page2')

// Actively trigger the popstate event once
window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }))
```

The same for hash routing:
```js
window.history.pushState(history.state, '', '#/page2')

// Actively trigger the popstate event once
window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }))
```

> [!NOTE]
>
> 1. The popstate event is sent globally, and all running apps receive the new routing address and match it, to prevent pocketing to the app's 404 page.
>
> 2. `window.history` is not applicable to all scenarios. Some frameworks such as vue-router4 or Angular will have problems. It is recommended to use here the ways 2 and 3.
