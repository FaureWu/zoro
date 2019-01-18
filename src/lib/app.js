import Zoro from './zoro'
import dispatcherCreator from './dispatcherCreator'
import { PLUGIN_EVENT, INTERCEPT_ACTION, INTERCEPT_EFFECT } from './constant'
import { assert, isSupportProxy } from './util'
import createConnectComponent from './createConnectComponent'

let _zoro
let _store

let dispatcher = {}

function defineDispatcher(zoro, model) {
  const namespace = model.getNamespace()
  Object.defineProperty(dispatcher, namespace, {
    get() {
      return dispatcherCreator(namespace, model, zoro)
    },
    set() {
      assert(false, 'Cannot set the dispatcher')
    },
  })
}

if (isSupportProxy()) {
  dispatcher = new Proxy(
    {},
    {
      get(target, key) {
        const model = _zoro.models[key]
        return dispatcherCreator(key, model, _zoro)
      },
      set() {
        assert(false, 'Cannot set the dispatcher')
      },
    },
  )
}

export { dispatcher }

function App(zoro) {
  this.zoro = zoro

  _zoro = zoro

  if (!isSupportProxy()) {
    this.zoro.plugin.on(PLUGIN_EVENT.ON_CREATE_MODEL, function(model) {
      defineDispatcher(zoro, model)
    })
  }
}

App.prototype.model = function(models) {
  if (models instanceof Array) {
    this.zoro.injectModels(models)

    return this
  }

  this.zoro.injectModels([models])
  return this
}

App.prototype.use = function(plugins) {
  if (typeof plugins === 'function') {
    this.zoro.use(plugins)

    return this
  }

  assert(
    plugins instanceof Array,
    `the use param must be a function or a plugin Array, but we get ${typeof plugins}`,
  )

  plugins.forEach(plugin => this.zoro.use(plugin))

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
  _store = this.zoro.start(setup)
  this.store = _store

  return _store
}

App.prototype.setup = function() {
  this.zoro.setup()
}

// 该接口将于v3.0.0废弃，请使用dispatcher
export const actions = function(namespace) {
  const models = _zoro.models
  assert(!!models[namespace], `the ${namespace} model not define`)
  return models[namespace].getActions()
}

export const connectComponent = function(mapStateToProps, mapDispatchToProps) {
  return createConnectComponent(_store, _zoro)(
    mapStateToProps,
    mapDispatchToProps,
  )
}

export default function(options) {
  return new App(new Zoro(options))
}
