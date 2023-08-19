The concept of element isolation comes from ShadowDom, i.e. elements in ShadowDom can be duplicated but won't conflict with other external elements.
micro-app implements a similar functionality to ShadowDom, where elements won't escape from ``<micro-app>`` element boundaries, and sub-apps can only perform add, delete, change, and check operations on their own elements.

**Give me a chestnut🌰 :**

Both the base app and the sub-app have an element `<div id='root'></div>`.
At this point the sub-app gets its own internal `#root` element that can be accessed via `document.querySelector('#root')`, not the base app's.

**Can a base app get elements of a sub-app?**

It is possible!

This is different from ShadowDom, where the base has the role of orchestrating the whole picture under the micro-frontend.
So we don't have restrictions on the behavior of the base apps in how they manipulate the elements of the sub-apps.

### Unbinding elements
By default, when a sub-app manipulates an element, it binds the element scope.
The unbinding process is asynchronous, which may result in rendering errors, which can be avoided by proactively unbinding the element.

After executing the `removeDomScope` method, the element scope is reset to the base app.

<!-- tabs:start -->
#### **Base App**
```js
import { removeDomScope } from '@micro-zoe/micro-app'

// Reset scope
removeDomScope()
```

#### **Sub-App**
```js
// Reset scope
window.microApp.removeDomScope()
```
<!-- tabs:end -->

