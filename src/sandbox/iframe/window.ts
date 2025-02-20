import type {
  microAppWindowType,
  MicroEventListener,
  CommonEffectHook,
} from '@micro-app/types'
import type IframeSandbox from './index'
import globalEnv from '../../libs/global_env'
import bindFunctionToRawTarget from '../bind_function'
import {
  rawDefineProperty,
  isFunction,
  logWarn,
} from '../../libs/utils'
import {
  GLOBAL_KEY_TO_WINDOW,
  SCOPE_WINDOW_EVENT,
  SCOPE_WINDOW_ON_EVENT,
} from '../../constants'
import {
  escape2RawWindowKeys,
  escape2RawWindowRegExpKeys,
} from './special_key'

/**
 * patch window of child app
 * @param appName app name
 * @param microAppWindow microWindow of child app
 * @param sandbox WithSandBox
 * @returns EffectHook
 */
export function patchWindow (
  appName: string,
  microAppWindow: microAppWindowType,
  sandbox: IframeSandbox,
): CommonEffectHook {
  patchWindowProperty(appName, microAppWindow)
  createProxyWindow(microAppWindow, sandbox)
  return patchWindowEffect(microAppWindow)
}
/**
 * rewrite special properties of window
 * @param appName app name
 * @param microAppWindow child app microWindow
 */
function patchWindowProperty (
  appName: string,
  microAppWindow: microAppWindowType,
):void {
  const rawWindow = globalEnv.rawWindow

  escape2RawWindowKeys.forEach((key: string) => {
    microAppWindow[key] = bindFunctionToRawTarget(rawWindow[key], rawWindow)
  })

  Object.getOwnPropertyNames(microAppWindow)
    .filter((key: string) => {
      escape2RawWindowRegExpKeys.some((reg: RegExp) => {
        if (reg.test(key) && key in microAppWindow.parent) {
          if (isFunction(rawWindow[key])) {
            microAppWindow[key] = bindFunctionToRawTarget(rawWindow[key], rawWindow)
          } else {
            const { configurable, enumerable } = Object.getOwnPropertyDescriptor(microAppWindow, key) || {
              configurable: true,
              enumerable: true,
            }
            if (configurable) {
              rawDefineProperty(microAppWindow, key, {
                configurable,
                enumerable,
                get: () => rawWindow[key],
                set: (value) => { rawWindow[key] = value },
              })
            }
          }
          return true
        }
        return false
      })

      return /^on/.test(key) && !SCOPE_WINDOW_ON_EVENT.includes(key)
    })
    .forEach((eventName: string) => {
      const { enumerable, writable, set } = Object.getOwnPropertyDescriptor(microAppWindow, eventName) || {
        enumerable: true,
        writable: true,
      }
      try {
      /**
       * 如果设置了iframeWindow上的这些on事件，处理函数会设置到原生window上，但this会绑定到iframeWindow
       * 获取这些值，则直接从原生window上取
       * 总结：这些on事件全部都代理到原生window上
       *
       * TODO:
       * 1、如果子应用没有设置，基座设置了on事件，子应用触发事件是会不会执行基座的函数？
       *    比如 基座定义了 window.onpopstate，子应用执行跳转会不会触发基座的onpopstate函数？
       *
       * 2、如果基座和子应用同时定义，基座的绑定函数被覆盖，比如 window.onclick
       *    这种情况一定会发生，除非定义一套复杂的处理逻辑，可以让基座的子应用的方法同时存在，又独立运行。
       *    注意点：
       *      1、多层嵌套
       *      2、卸载时清空绑定函数
       */
        rawDefineProperty(microAppWindow, eventName, {
          enumerable,
          configurable: true,
          get: () => rawWindow[eventName],
          set: writable ?? !!set
            ? (value) => { rawWindow[eventName] = isFunction(value) ? value.bind(microAppWindow) : value }
            : undefined,
        })
      } catch (e) {
        logWarn(e, appName)
      }
    })
}

/**
 * create proxyWindow with Proxy(microAppWindow)
 * @param microAppWindow micro app window
 * @param sandbox IframeSandbox
 */
function createProxyWindow (
  microAppWindow: microAppWindowType,
  sandbox: IframeSandbox,
): void {
  const rawWindow = globalEnv.rawWindow
  const customProperties: PropertyKey[] = []

  const proxyWindow = new Proxy(microAppWindow, {
    get: (target: microAppWindowType, key: PropertyKey): unknown => {
      if (key === 'location') {
        return sandbox.proxyLocation
      }

      if (GLOBAL_KEY_TO_WINDOW.includes(key.toString())) {
        return proxyWindow
      }

      if (customProperties.includes(key)) {
        return Reflect.get(target, key)
      }

      return bindFunctionToRawTarget(Reflect.get(target, key), target)
    },
    set: (target: microAppWindowType, key: PropertyKey, value: unknown): boolean => {
      /**
       * TODO:
       * 1、location域名相同，子应用内部跳转时的处理
       * 2、和with沙箱的变量相同，提取成公共数组
       */
      if (key === 'location') {
        return Reflect.set(rawWindow, key, value)
      }

      if (!Reflect.has(target, key)) {
        customProperties.push(key)
      }

      Reflect.set(target, key, value)

      if (sandbox.escapeProperties.includes(key)) {
        !Reflect.has(rawWindow, key) && sandbox.escapeKeys.add(key)
        Reflect.set(rawWindow, key, value)
      }

      return true
    },
    has: (target: microAppWindowType, key: PropertyKey) => key in target,
    deleteProperty: (target: microAppWindowType, key: PropertyKey): boolean => {
      if (Reflect.has(target, key)) {
        sandbox.escapeKeys.has(key) && Reflect.deleteProperty(rawWindow, key)
        return Reflect.deleteProperty(target, key)
      }
      return true
    },
  })

  sandbox.proxyWindow = proxyWindow
}

function patchWindowEffect (microAppWindow: microAppWindowType): CommonEffectHook {
  const { rawWindow, rawAddEventListener, rawRemoveEventListener } = globalEnv
  const eventListenerMap = new Map<string, Set<MicroEventListener>>()
  const sstEventListenerMap = new Map<string, Set<MicroEventListener>>()

  function getEventTarget (type: string): Window {
    return SCOPE_WINDOW_EVENT.includes(type) ? microAppWindow : rawWindow
  }

  // TODO: listener 是否需要绑定microAppWindow，否则函数中的this指向原生window
  microAppWindow.addEventListener = function (
    type: string,
    listener: MicroEventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const listenerList = eventListenerMap.get(type)
    if (listenerList) {
      listenerList.add(listener)
    } else {
      eventListenerMap.set(type, new Set([listener]))
    }
    listener && (listener.__MICRO_APP_MARK_OPTIONS__ = options)
    rawAddEventListener.call(getEventTarget(type), type, listener, options)
  }

  microAppWindow.removeEventListener = function (
    type: string,
    listener: MicroEventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const listenerList = eventListenerMap.get(type)
    if (listenerList?.size && listenerList.has(listener)) {
      listenerList.delete(listener)
    }
    rawRemoveEventListener.call(getEventTarget(type), type, listener, options)
  }

  const reset = (): void => {
    sstEventListenerMap.clear()
  }

  /**
   * NOTE:
   *  1. about timer(events & properties should record & rebuild at all modes, exclude default mode)
   *  2. record maybe call twice when unmount prerender, keep-alive app manually with umd mode
   * 4 modes: default-mode、umd-mode、prerender、keep-alive
   * Solution:
   *  1. default-mode(normal): clear events & timers, not record & rebuild anything
   *  2. umd-mode(normal): not clear timers, record & rebuild events
   *  3. prerender/keep-alive(default, umd): not clear timers, record & rebuild events
   *
   * TODO: 现在的 清除、记录和恢复操作分散的太零散，sandbox、create_app中都有分散，将代码再优化一下，集中处理
   */
  const record = (): void => {
    // record window event
    eventListenerMap.forEach((listenerList, type) => {
      if (listenerList.size) {
        const cacheList = sstEventListenerMap.get(type) || []
        sstEventListenerMap.set(type, new Set([...cacheList, ...listenerList]))
      }
    })
  }

  // rebuild event and timer before remount app
  const rebuild = (): void => {
    // rebuild window event
    sstEventListenerMap.forEach((listenerList, type) => {
      for (const listener of listenerList) {
        microAppWindow.addEventListener(type, listener, listener?.__MICRO_APP_MARK_OPTIONS__)
      }
    })

    reset()
  }

  const release = (): void => {
    // Clear window binding events
    if (eventListenerMap.size) {
      eventListenerMap.forEach((listenerList, type) => {
        for (const listener of listenerList) {
          rawRemoveEventListener.call(getEventTarget(type), type, listener)
        }
      })
      eventListenerMap.clear()
    }
  }

  return {
    reset,
    record,
    rebuild,
    release,
  }
}
