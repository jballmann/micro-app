### `__MICRO_APP_ENVIRONMENT__`

**Description：Is app in a micro-frontend environment**

Determine if you are in a micro-frontend env by using `window.__MICRO_APP_ENVIRONMENT__` in the sub-app.

```js
if (window.__MICRO_APP_ENVIRONMENT__) {
  console.log('I am in a micro frontend env')
}
```

### `__MICRO_APP_NAME__`

**Description：App name**

Get the name of the app, i.e. the value of `name` attribute of the `<micro-app>` tag, in the sub-app via `window.__MICRO_APP_NAME__`.

### `__MICRO_APP_PUBLIC_PATH__`

**Description：Static resource prefixes for sub-apps**

Used to set webpack dynamic [public-path](https://webpack.docschina.org/guides/public-path/#on-the-fly) to complement the static resources of a sub-app to an absolute address starting with http.

**Step 1:** Create a file with the name `public-path.js` in the sub-app` `src` directory and add the following
```js
if (window.__MICRO_APP_ENVIRONMENT__) {
  __webpack_public_path__ = window.__MICRO_APP_PUBLIC_PATH__
}
```

**Step 2:** Import `public-path.js` at the `top most` of the sub-app's entry files
```js
import './public-path'
```

### `__MICRO_APP_BASE_ROUTE__`

**Description：Base route for sub-apps**

For more information, see [Basic Routing chapter](/en-us/route?id=Basic Routing).

### `__MICRO_APP_BASE_APPLICATION__`

**Description：Determine if the application is the base app**

This value will not take effect until after `microApp.start()` is executed.

```js
if (window.__MICRO_APP_BASE_APPLICATION__) {
  console.log('I am the base app')
}
```
