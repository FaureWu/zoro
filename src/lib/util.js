export const isBoolean = bool => typeof bool === 'boolean'

export const isFunction = func => typeof func === 'function'

export const isArray = arr => arr instanceof Array

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

export function noop() {}
