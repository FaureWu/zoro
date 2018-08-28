import Zoro from './zoro'
import dispatcherCreator from './dispatcherCreator'
import { PLUGIN_EVENT } from './constant'
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

export const connectComponent = function(componentConfig) {
  return createConnectComponent(_store)(componentConfig)
}

export default (opts = {}) => new App(new Zoro(opts))
