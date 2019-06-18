import { isFunction, isObject } from './util'

function getValue(key, newValue, oldValue, props, data) {
  const values = Object.keys(props).reduce((result, key) => {
    result[key] = data[key]
    return result
  }, {})

  return {
    newValues: { ...values, [key]: newValue },
    oldValues: { ...values, [key]: oldValue },
  }
}

export default function connectObserver(config, mergeState) {
  const { properties, onObserver, ...rest } = config
  if (!isFunction(onObserver)) return config

  let props = Object.keys(properties).reduce((target, key) => {
    let prop = properties[key]
    if (isFunction(prop) || prop === null) {
      prop = { type: prop }
    }
    const observer = prop.observer
    prop.observer = function(newValue, oldValue, changedPath) {
      if (isFunction(observer)) {
        observer.call(this, newValue, oldValue, changedPath)
      }

      if (newValue !== oldValue) {
        const { newValues, oldValues } = getValue(
          key,
          newValue,
          oldValue,
          props,
          this.data,
        )
        onObserver.call(this, newValues, oldValues)
      }
    }

    target[key] = prop
    return target
  }, {})

  if (isObject(mergeState)) {
    Object.keys(mergeState).forEach(key => {
      if (!props[key]) {
        props[key] = { type: null }
      }

      if (isFunction(props[key].observer)) return
      props[key].observer = function(newValue, oldValue) {
        if (newValue !== oldValue) {
          const { newValues, oldValues } = getValue(
            key,
            newValue,
            oldValue,
            props,
            this.data,
          )
          onObserver.call(this, newValues, oldValues)
        }
      }
    })
  }

  rest.properties = props

  return rest
}
