import { NAMESPACE_DIVIDER } from './constant'

export const isArray = arr => arr instanceof Array

export const isObject = obj =>
  obj !== null && typeof obj === 'object' && !isArray(obj)

export const isBoolean = bool => typeof bool === 'boolean'

export const isFunction = func => typeof func === 'function'

export const isUndefined = undef => typeof undef === 'undefined'

export const isString = str => typeof str === 'string'

export const isAction = action => isObject(action) && isString(action.type)

export const assert = (validate, message) => {
  if (
    (isBoolean(validate) && !validate) ||
    (isFunction(validate) && !validate())
  ) {
    throw new Error(message)
  }
}

export const warn = (validate, message) => {
  if (
    (isBoolean(validate) && !validate) ||
    (isFunction(validate) && !validate())
  ) {
    console.warn(message)
  }
}

export const splitType = (type, divider = NAMESPACE_DIVIDER) => {
  const types = type.split(divider)
  assert(
    types.length > 1,
    `the model action type is not include the namespace, the type is ${type}`,
  )

  return {
    namespace: types.slice(0, types.length - 1).join(divider),
    type: types.slice(-1),
  }
}

export const noop = () => {}

export function putCreator(store, namespace) {
  if (!namespace) {
    return store.dispatch
  }

  return function({ type, ...rest }) {
    assert(
      !!type,
      'the action you dispatch is not a correct format, we need a type property',
    )
    const types = type.split(NAMESPACE_DIVIDER)
    if (types.length >= 2) {
      const _namespace = types
        .slice(0, types.length - 1)
        .join(NAMESPACE_DIVIDER)

      if (_namespace === namespace) {
        warn(
          false,
          `we don't need the dispatch with namespace, if you call in the model, [${type}]`,
        )
      }

      return store.dispatch({ type, ...rest })
    }

    return store.dispatch({
      type: `${namespace}${NAMESPACE_DIVIDER}${type}`,
      ...rest,
    })
  }
}

export function selectCreator(store, namespace) {
  return function(handler) {
    let state = store.getState()

    if (namespace && state[namespace]) {
      state = state[namespace]
    }

    if (!isFunction(handler)) {
      return state
    }

    return handler(state)
  }
}

export function isShallowEqual(a, b) {
  if (a === b) return true
  const aks = Object.keys(a)
  const bks = Object.keys(b)
  if (aks.length !== bks.length) return false
  return aks.every(k => {
    return b.hasOwnProperty(k) && a[k] === b[k]
  })
}

export function isShallowInclude(parent, child) {
  const childks = Object.keys(child)

  return childks.every(k => {
    return parent.hasOwnProperty(k) && parent[k] === child[k]
  })
}

export function getConnectStoreData(current, pre) {
  const childks = Object.keys(current)

  return childks.reduce(
    (result, key) => ({
      ...result,
      [key]: pre[key],
    }),
    {},
  )
}

export function isSupportProxy() {
  return typeof Proxy === 'function'
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    placeholder => {
      const random = Math.floor(Math.random() * 16)
      const value = placeholder === 'x' ? random : (random & 0x3) | 0x8
      return value.toString(16)
    },
  )
}

export function diff(current, next) {
  let empty = true
  const data = Object.keys(current).reduce((result, key) => {
    if (current[key] === next[key]) {
      return result
    }

    empty = false
    result[key] = next[key]
    return result
  }, {})

  return { empty, data }
}
