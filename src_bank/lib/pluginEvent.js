import { assert, isUndefined, isArray } from './util'

class PluginEvent {
  constructor() {
    this.handlers = {}
  }

  emit(name, ...rest) {
    assert(
      typeof name === 'string',
      `the plugin event's name is necessary, but we get ${name}`,
    )

    const handlers = this.handlers[name]
    if (!(handlers instanceof Array)) {
      return undefined
    }

    handlers.forEach(handler => {
      handler.apply(undefined, rest)
    })
  }

  emitCombine(name, ...rest) {
    assert(
      typeof name === 'string',
      `the plugin event's name is necessary, but we get ${name}`,
    )

    const handlers = this.handlers[name]
    if (!(handlers instanceof Array)) {
      return undefined
    }

    return handlers.reduce((result, handler) => {
      const data = handler.apply(undefined, rest)
      if (isArray(data)) {
        return result.concat(data)
      }

      return result
    }, [])
  }

  emitLoop(name, ...rest) {
    assert(
      typeof name === 'string',
      `the plugin event's name is necessary, but we get ${name}`,
    )

    const handlers = this.handlers[name]
    if (!(handlers instanceof Array)) {
      return undefined
    }

    let preData
    return handlers.reduce((result, handler) => {
      if (!isUndefined(preData)) {
        rest[0] = preData
      }
      const data = handler.apply(undefined, rest)
      if (!isUndefined(data)) {
        preData = data
      }

      return data
    }, undefined)
  }

  on(name, handler) {
    assert(
      typeof name === 'string',
      `the plugin event's name is necessary, but we get ${name}`,
    )

    if (!(this.handlers[name] instanceof Array)) {
      this.handlers[name] = []
    }

    this.handlers[name].push(handler)
  }
}

export default PluginEvent
