import Zoro from './zoro'
import dispatcherCreator from './dispatcherCreator'
import { assert, isFunction, isObject, isShallowEqual } from './util'

let _zoro
let _store
function App(zoro) {
  _zoro = zoro
}

App.prototype.model = function(models) {
  if (models instanceof Array) {
    _zoro.injectModels.call(_zoro, models)

    return this
  }

  _zoro.injectModels.call(_zoro, [models])
  return this
}

App.prototype.use = function(plugins) {
  if (typeof plugins === 'function') {
    _zoro.use.call(_zoro, plugins)

    return this
  }

  assert(
    plugins instanceof Array,
    `the use param must be a function or a plugin Array, but we get ${typeof plugins}`,
  )

  plugins.forEach(plugin => _zoro.use.call(_zoro, plugin))

  return this
}

App.prototype.start = function(setup = true) {
  _store = _zoro.start.call(_zoro, setup)
  this.store = _store

  return _store
}

App.prototype.setup = function() {
  _zoro.setup.call(_zoro)
}

export const actions = function(namespace) {
  const models = _zoro.models
  assert(!!models[namespace], `the ${namespace} model not define`)
  return models[namespace].getActions()
}

export const createDispatcher = function(namespace) {
  const models = _zoro.models
  assert(!!models[namespace], `the ${namespace} model not define`)
  return dispatcherCreator(namespace, models[namespace], _zoro)
}

function defaultMapToProps() {
  return {}
}

export const connectComponent = function(mapStateToProps, mapDispatchToProps) {
  const shouldMapStateToProps = isFunction(mapStateToProps)
  const shouldMapDispatchToProps = isFunction(mapDispatchToProps)

  return config => {
    const mapState = shouldMapStateToProps ? mapStateToProps : defaultMapToProps
    const mapDispatch = shouldMapDispatchToProps
      ? mapDispatchToProps
      : defaultMapToProps

    let prevMappedState = {}
    let unsubscribe = null

    function subscribe() {
      if (!isFunction(unsubscribe)) return null

      const mappedState = mapState(_store.getState())
      if (isShallowEqual(mappedState, prevMappedState)) return null

      this.setData(mappedState)
      prevMappedState = mappedState
    }

    function attached() {
      assert(_store !== null, 'we should call app.start() before the connectComponent')

      if (shouldMapStateToProps) {
        unsubscribe = _store.subscribe(subscribe.bind(this))
        subscribe.call(this)
      }

      if (isObject(config.lifetimes) && isFunction(config.lifetimes.attached)) {
        config.lifetimes.attached.call(this)
      } else if (isFunction(config.attached)) {
        config.attached.call(this)
      }
    }

    function detached() {
      if (isObject(config.lifetimes) && isFunction(config.lifetimes.detached)) {
        config.lifetimes.detached.call(this)
      } else if (isFunction(config.detached)) {
        config.detached.call(this)
      }

      if (isFunction(unsubscribe)) {
        unsubscribe()
        unsubscribe = null
      }
    }

    const componentConfig = { ...config, methods: { ...config.methods, ...mapDispatch } }

    if (isObject(config.lifetimes)) {
      componentConfig.lifetimes.attached = attached
      componentConfig.lifetimes.detached = detached
    } else {
      componentConfig.attached = attached
      componentConfig.detached = detached
    }

    return componentConfig
  }
}

export default (opts = {}) => new App(new Zoro(opts))
