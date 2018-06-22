import { NAMESPACE_DIVIDER } from './constant'

export const isArray = arr => arr instanceof Array

export const isObject = obj =>
  obj !== null && typeof obj === 'object' && !isArray(obj)

export const isBoolean = bool => typeof bool === 'boolean'

export const isFunction = func => typeof func === 'function'

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

    return handler(state)
  }
}
