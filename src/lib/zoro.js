import { combineReducers } from 'redux'
import Model from './model'
import PluginEvent from './pluginEvent'
import createStore from './store'
import { PLUGIN_EVENT, NAMESPACE_DIVIDER } from './constant'
import effectMiddlewareCreator from './effectMiddleware'
import {
  noop,
  assert,
  isFunction,
  isArray,
  putCreator,
  selectCreator,
} from './util'

const assertOpts = ({ onError = noop }) => {
  assert(
    isFunction(onError),
    `the onError must be an function handler, but we get ${typeof onError}`,
  )
}

const assertModelUnique = ({ models }, model) => {
  const namespace = model.getNamespace()
  assert(
    !models[namespace],
    `the model namespace must be unique, we get duplicate namespace ${namespace}`,
  )
}

export default class Zoro {
  constructor(opts) {
    assertOpts(opts)

    const {
      initialState = {},
      onEffect = noop,
      onAction = noop,
      onSetup = noop,
      onError = noop,
    } = opts

    this.models = {}
    this.middlewares = [effectMiddlewareCreator(this)]
    this.handleError = onError
    this.handleEffect = onEffect
    this.handleAction = onAction
    this.handleSetup = onSetup
    this.initialState = initialState
    this.plugin = new PluginEvent()
    this._isSetup = false
  }

  getRootReducer() {
    const rootReducer = Object.keys(this.models).reduce(
      (combine, namespace) => {
        const model = this.models[namespace]
        const reducers = model.getReducers()

        return {
          ...combine,
          [namespace]: reducers,
        }
      },
      {},
    )

    return combineReducers(rootReducer)
  }

  getEffects() {
    return Object.keys(this.models).reduce((effects, namespace) => {
      const model = this.models[namespace]
      return { ...effects, ...model.getEffects() }
    }, {})
  }

  getDefaultState() {
    return Object.keys(this.models).reduce((defaultState, namespace) => {
      const model = this.models[namespace]
      return { ...defaultState, [namespace]: model.getDefaultState() }
    }, {})
  }

  injectModels(models) {
    assert(
      isArray(models),
      `the models must be an Array, but we get ${typeof models}`,
    )
    const newModels = {}
    models.forEach(opts => {
      const model = new Model(opts)
      const namespace = model.getNamespace()
      assertModelUnique(this, model)
      this.models[namespace] = model
      newModels[namespace] = model
    })

    if (this.store) {
      this.replaceReducer()

      if (this._isSetup) {
        this.setupModel(newModels)
      }
    }
  }

  injectMiddlewares(middlewares) {
    assert(
      isArray(middlewares),
      `the middlewares must be an Array, but we get ${typeof middlewares}`,
    )
    middlewares.forEach(middleware => {
      this.middlewares.push(middleware)
    })
  }

  createStore() {
    const rootReducer = this.getRootReducer()
    const pluginMiddlewares = this.plugin.emit(PLUGIN_EVENT.INJECT_MIDDLEWARES)
    if (pluginMiddlewares instanceof Array) {
      this.injectMiddlewares(pluginMiddlewares)
    }

    const pluginInitialState = this.plugin.emit(
      PLUGIN_EVENT.INJECT_INITIAL_STATE,
      this.initialState,
    )

    return createStore({
      rootReducer,
      middlewares: this.middlewares,
      initialState: {
        ...this.initialState,
        ...(pluginInitialState || {}),
        ...this.getDefaultState(),
      },
    })
  }

  replaceReducer() {
    const rootReducer = this.getRootReducer()
    this.store.replaceReducer(rootReducer)
  }

  setupModel(models = {}) {
    Object.keys(models).forEach(namespace => {
      const model = models[namespace]
      model.handleSetup.apply(undefined, [
        {
          put: putCreator(this.store, namespace),
          select: selectCreator(this.store, namespace),
          selectAll: selectCreator(this.store),
        },
      ])
    })
  }

  use(creator) {
    assert(
      typeof creator === 'function',
      `the use plugin must be a function, but we get ${typeof creator}`,
    )

    creator(this.plugin, {
      DIVIDER: NAMESPACE_DIVIDER,
      PLUGIN_EVENT,
    })
  }

  start(setup) {
    const pluginModels = this.plugin.emit(PLUGIN_EVENT.INJECT_MODELS)
    if (pluginModels instanceof Array) {
      this.injectModels(pluginModels)
    }
    const store = (this.store = this.createStore())
    if (setup) {
      this.setup()
    }

    store.subscribe(() => {
      this.plugin.emit(PLUGIN_EVENT.ON_SUBSCRIBE, store)
    })

    return store
  }

  setup() {
    assert(!!this.store, 'the setup function must be call after start(false)')
    if (!this._isSetup) {
      this.setupModel(this.models)
      this.handleSetup.apply(undefined, [
        {
          put: putCreator(this.store),
          select: selectCreator(this.store),
        },
      ])
      this.plugin.emit(PLUGIN_EVENT.ON_SETUP, this.store)
    }
    this._isSetup = true
  }
}
