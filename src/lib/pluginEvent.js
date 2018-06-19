import { assert } from './util'

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

    return handlers.reduce((result, handler) => {
      return handler.apply(undefined, rest)
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
