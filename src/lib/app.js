import Zoro from './zoro'
import dispatcherCreator from './dispatcherCreator'
import { PLUGIN_EVENT, INTERCEPT_ACTION, INTERCEPT_EFFECT } from './constant'
import { assert } from './util'
import createConnectComponent from './createConnectComponent'

export const dispatcher = {}

let _zoro
let _store

function defineDispatcher(model) {
  const namespace = model.getNamespace()
  Object.defineProperty(dispatcher, namespace, {
    get() {
      return dispatcherCreator(namespace, model, _zoro)
    },
    set() {
      assert(false, 'Cannot set the dispatcher')
    },
  })
}

function App(zoro) {
  _zoro = zoro

  _zoro.plugin.on(PLUGIN_EVENT.ON_CREATE_MODEL, function(model) {
    defineDispatcher(model)
  })
}

App.prototype.model = function(models) {
  if (models instanceof Array) {
    _zoro.injectModels(models)

    return this
  }

  _zoro.injectModels([models])
  return this
}

App.prototype.use = function(plugins) {
  if (typeof plugins === 'function') {
    _zoro.use(plugins)

    return this
  }

  assert(
    plugins instanceof Array,
    `the use param must be a function or a plugin Array, but we get ${typeof plugins}`,
  )

  plugins.forEach(plugin => _zoro.use(plugin))

  return this
}

App.prototype.intercept = {
  action(handler) {
    _zoro.setIntercept(INTERCEPT_ACTION, handler)
  },
  effect(handler) {
    _zoro.setIntercept(INTERCEPT_EFFECT, handler)
  },
}

App.prototype.start = function(setup = true) {
  _store = _zoro.start(setup)
  this.store = _store

  return _store
}

App.prototype.setup = function() {
  _zoro.setup()
}

// 该接口将于v3.0.0废弃，请使用dispatcher
export const actions = function(namespace) {
  const models = _zoro.models
  assert(!!models[namespace], `the ${namespace} model not define`)
  return models[namespace].getActions()
}

export const connectComponent = function(mapStateToProps, mapDispatchToProps) {
  return createConnectComponent(_store)(mapStateToProps, mapDispatchToProps)
}

export default (opts = {}) => new App(new Zoro(opts))
