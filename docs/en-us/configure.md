With the config, we can decide to turn certain features on or off.

## name
- Desc: `App name`
- Type: `string`
- Default: `Required`
- Usage: `<micro-app name='xx'></micro-app>`
- Attention: Must begin with a letter and may not have special characters other than hyphens and underscores

Each application has a `name`, and names must be unique when multiple applications are rendered at the same time.

When the value of `name` changes, the current app is unmounted and re-rendered.

## url
- Desc: `App address`
- Type: `string`
- Default: `Required`
- Usage: `<micro-app name='xx' url='xx'></micro-app>`

The base app and sub-app are essentailly on the same page, where the `url` is just the HTML address. Routing of the sub-app is still based on the browser address.

When the value of `url` changes, the current app is unmounted and re-rerendered with the new `url` value.

## baseroute
- Desc: `Base route for sub-app`
- Type: `string`
- Default: `''`
- Usage: `<micro-app name='xx' url='xx' baseroute='/my-page/'></micro-app>`

In the micro-frontend env, a sub-app can get the value of the baseroute from `window.__MICRO_APP_BASE_ROUTE__` for setting up a new baseroute.

If the base app uses a history router and the child application uses hash routes, you do not need to set up a baseroute.

## inline
- Desc: `Use inline script`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' inline></micro-app>`

By default, the JS of the sub-app is extracted and run in the background, which can make debugging difficult.

When inline is turned on, the extracted JS will be inserted as script tags to run in the application. This is more convenient for debugging at dev stage.

> [!NOTE]
> Turning on inline will cause a slight performance loss and is recommended for dev envs.

## destroy
- Desc: `Force deletion of cached resources when unmounting`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' destroy></micro-app>`

By default, static resources are cached after a sub-app is unmounted for better performance when re-rendering.

Enable destroy, the cached resources will be cleared after the sub-app is unmounted, and the data will be re-requested when it is rendered again.

## disableScopecss
- Desc: `Disable style isolation`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' disable-scopecss></micro-app>`

Disabling style isolation can improve page rendering speed. But before doing so, make sure that the styles do not pollute other apps.

## disableSandbox
- Desc: `Disable JS sandboxing`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' disable-sandbox></micro-app>`

Disabling sandboxing can lead to some unforeseen problems and is not normally recommended.

> [!NOTE]
> The following features are disabled when sandboxing is disabled:
> 
> 1. Style isolation
>
> 2. Isolation of elements
>
> 3. Static resource path completion
>
> 4. Global vars such as `__MICRO_APP_ENVIRONMENT__` or `__MICRO_APP_PUBLIC_PATH__`
>
> 5、baseroute


## ssr
- Desc: `Enable SSR mode`
- Type: `string(boolean)`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' ssr></micro-app>`
- Version: `0.5.3 or later`

When the sub-app is an SSR app, you need to set the ssr attribute. Then, micro-app will load the sub-app based on the SSR pattern.

## keep-alive
- Desc: `Enable keep-alive mode`
- Type: `string(boolean)`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' keep-alive></micro-app>`
- Version: `0.6.0 or later`

With keep-alive enabled, apps go into the cache when they are unmounted, rather than destroying them.
This preserves the state of the app and improves the performance of re-rendering.

The priority of keep-alive is lower than [destroy](/en-us/configure?id=destroy), and keep-alive will fail when both exist.

## shadowDOM
- Desc: `Enable shadowDOM`
- Type: `string(boolean)`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' shadowDOM></micro-app>`

The shadowDOM has greater style isolation, and when enabled, the `<micro-app>` tag becomes a true WebComponent.

However, shadowDOM is not very compatible with the React framework and some UI libraries, and often has unforeseen problems.
So it is not recommended to use it unless you are well aware of the problems it can cause and be able to solving them.


## Global config
The global config affects every sub-app, so please use it with care!

**Usage**

```js
import microApp from '@micro-zoe/micro-app'

microApp.start({
  inline: true, // default: false
  destroy: true, // default: false
  disableScopecss: true, // default: false
  disableSandbox: true, // default: false
  shadowDOM: true, // default: false
  ssr: true, // default: false
})
```

If you do not want to use the global config in an app, you can configure it off individually:
```html
<micro-app 
  name='xx' 
  url='xx' 
  inline='false'
  destroy='false'
  disable-scopecss='false'
  disable-sandbox='false'
  shadowDOM='false'
  ssr='false'
></micro-app>
```

## Other configs
### global
When multiple sub-apps use the same JS or CSS file, setting the `global` attribute in link or script tag. In this way, it will be shared with other apps. 

Setting the `global` attribute puts the file into the global cache the first time it is loaded.
Other sub-apps will read the content directly from the cache when loading the same resource.
This improves rendering speed.

**Usage**
```html
<link rel="stylesheet" href="xx.css" global>
<script src="xx.js" global></script>
```

### globalAssets
globalAssets is used to define global shared resources, which is the same idea as preloading.
The resource will be loaded when the browser is idle and is put into the cache to improve rendering speed.

When a sub-app loads a JS or CSS file with the same address, it will fetch the data directly from the cache, thus improving rendering speed.

**Usage**
```js
// index.js
import microApp from '@micro-zoe/micro-app'

microApp.start({
  globalAssets: {
    js: ['jsAddress1', 'jsAddress2', ...], // JS addresses
    css: ['cssAddress1', 'cssAdress2', ...], // CSS addresses
  }
})
```

### exclude (filter elements)
When the sub-app does not need to load certain JS or CSS, you can set the exclude attribute in the link, script or style tag.
If the micro-app encounters an element with the exclude attribute, it will delete it.

**Usage**
```html
<link rel="stylesheet" href="xx.css" exclude>
<script src="xx.js" exclude></script>
<style exclude></style>
```

### ignore (ignore elements)
When a link, script or style element has the ignore attribute, the micro-app will not process it and the element will be rendered untouched.

Scenarios such as：jsonp

jsonp will create a script element to load the data.
Under normal circumstances the script will be intercepted which results in a jsonp request failure.
At this time, you can add the ignore attribute to the script element to skip the interception.

```js
// Modify the jsonp method to add ignore attribute after creating the script element
const script = document.createElement('script')
script.setAttribute('ignore', 'true')
```
