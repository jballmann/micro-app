With the config, we can decide to turn certain features on or off.

## name
- Desc: `App Name`
- Type: `string`
- Default: `Required`
- Usage: `<micro-app name='xx'></micro-app>`
- Note: Must begin with a letter and may not include special symbols other than hyphens and underscores

Each `name` corresponds to an application, and names must be unique when multiple applications are rendered at the same time.

When the value of `name` changes, the current app is unmounted and re-rendered.

## url
- Desc: `App address`
- Type: `string`
- Default: `Required`
- Usage: `<micro-app name='xx' url='xx'></micro-app>`

Base app and sub-app are essentially on the same page, where the `url` is just the HTML address.
The routing of the sub-app is still based on the browser address.

When the value of `url` changes, the current application is unmounted and re-rendered with the new `url` value.

## baseroute
- Desc: `Base route for sub-app`
- Type: `string`
- Default: `''`
- Usage: `<micro-app name='xx' url='xx' baseroute='/my-page/'></micro-app>`

In the micro-frontend env, a sub-app can get the value of baseroute from window.__MICRO_APP_BASE_ROUTE__ for setting up a new base route

If the base app uses a history router and the sub-app uses a hash router, you do not need to set up a baseroute.

## inline
- Desc: `Use inline script`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' inline></micro-app>`

By default, the sub-app's JS will be extracted and run in the background.

When `inline` is turned on, the extracted JS will be inserted as script tag to run in the app, which is more convenient for debugging in a dev env.

> [!NOTE]
> Turning on `inline` can be cause a slight performance loss and is generally only used in dev envs.

## destroy
- Desc: `Force deletion of cached resources when unmounting`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' destroy></micro-app>`

By default, static resources are cached after a sub-app is unmounted for better performance when re-rendering.

Turn on destroy, the sub-app will clear the cache resources after unmounting and re-request the data when rendering again.

## disableScopecss
- Desc: `Disable style isolation`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' disable-scopecss></micro-app>`

Disabling style isolation can improve page rendering speed, but before doing so, make sure that the styles don't pollute other apps.

## disableSandbox
- Desc: `Disable JS sandboxing`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' disable-sandbox></micro-app>`

Disabling sandboxing can lead to some unforeseen problems and is not normally recommended.

> [!NOTE]
> The following features will be disabled when sandboxing is disabled:
> 
> 1. Style isolation
>
> 2. Isolation of elements
>
> 3. Static resource path completion
>
> 4. Global variables such as `__MICRO_APP_ENVIRONMENT__` or `__MICRO_APP_PUBLIC_PATH__`
>
> 5. `baseroute`


## ssr
- Desc: `enable SSR mode`
- Type: `string(boolean)`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' ssr></micro-app>`
- Version: `0.5.3 or later`

When the sub-app is SSR, you need to set the `ssr` attribute. Now, the micro-app will load the sub-app based on the SSR pattern.

## keep-alive
- Desc: `Enable keep-alive mode`
- Type: `string(boolean)`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' keep-alive></micro-app>`
- Version: `0.6.0 or later`

With keep-alive turned on, apps go into the cache when they are unmounted, rather than destroying them. This preserves the state of the app and improves the performance of re-rendering

The priority of keep-alive is less than [destroy](/en-us/configure?id=destroy), and keep-alive will fail when both exist.

## shadowDOM
- Desc: `Enable shadowDOM`
- Type: `string(boolean)`
- Default: `false`
- Usage: `<micro-app name='xx' url='xx' shadowDOM></micro-app>`

The shadowDOM has greater style isolation, and when turned on, the `<micro-app>` tag becomes a true WebComponent.

However, shadowDOM is not very compatible with the React framework and some UI libraries, and often has unforeseen problems.
So it is not recommended to use it unless you are well aware of the problems it can cause and are able to solve them.


## Global config
The global configuration affects every sub-app, so please use it with care!

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

If you do not want to use the global configuration in an app, you can configure it individually:
```html
<micro-app 
  name='xx' 
  url='xx' 
  inline='false'
  destroy='false'
  disableScopecss='false'
  disableSandbox='false'
  shadowDOM='false'
  ssr='false'
></micro-app>
```

## Other configs
### global
When multiple sub-apps use the same JS or CSS resource, setting the `global` attribute in link or script tags will extract the file as a public file and share it with other apps.

Setting the `global` attribute puts the file into the public cache the first time it is loaded. Other sub-apps will read the content directly from the cache when loading the same resource, thus improving rendering speed.

**Usage**
```html
<link rel="stylesheet" href="xx.css" global>
<script src="xx.js" global></script>
```

### globalAssets
globalAssets is used to set global shared resources, which is the same idea as preloading: Resources are loaded when the browser is idle and are put into the cache to improve rendering efficiency.

When a sub-app loads a JS or CSS resource with the same address, it will fetch the data directly from the cache, thus improving rendering speed.

**Usage**
```js
// index.js
import microApp from '@micro-zoe/micro-app'

microApp.start({
  globalAssets: {
    js: ['jsAddress1', 'jsAddress2', ...], // JS addresses
    css: ['cssAddress1', 'cssAddress2', ...], // CSS addresses
  }
})
```

### exclude (filter elements)
When the sub-app doesn't need to load a certain JS or CSS, you can set the `exclude` attribute in the link, script or style tag. When the micro-app encounters an element with the exclude attribute it will delete it.

**Usage**
```html
<link rel="stylesheet" href="xx.css" exclude>
<script src="xx.js" exclude></script>
<style exclude></style>
```

### ignore (ignore elements)
When a link, script or style element has the `ignore` attribute, the micro-app will not process it and the element will be rendered untouched.

Example with jsonp

jsonp will create a script element to load the data. Under normal circumstances the script will be intercepted, which results in jsonp request failure. Here, you can add the `ignore` attribute to the script element to skip the interception.

```js
// Modify the jsonp method by adding the ignore attribute after creating the script element
const script = document.createElement('script')
script.setAttribute('ignore', 'true')
```
