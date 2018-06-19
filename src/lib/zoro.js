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
    this.actions = {}
    this.middlewares = [effectMiddlewareCreator(this)]
    this.handleError = onError
    this.handleEffect = onEffect
    this.handleAction = onAction
    this.handleSetup = onSetup
    this.initialState = initialState
    this.plugin = new PluginEvent()
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
    models.forEach(opts => {
      const model = new Model(opts)
      assertModelUnique(this, model)
      this.models[model.getNamespace()] = model
    })

    if (this.store) {
      this.replaceReducer()
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

  setupModel() {
    Object.keys(this.models).forEach(namespace => {
      const model = this.models[namespace]
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

  setup() {
    const pluginModels = this.plugin.emit(PLUGIN_EVENT.INJECT_MODELS)
    if (pluginModels instanceof Array) {
      this.injectModels(pluginModels)
    }
    const store = (this.store = this.createStore())
    this.setupModel()
    this.handleSetup.apply(undefined, [
      {
        put: putCreator(store),
        select: selectCreator(store),
      },
    ])
    this.plugin.emit(PLUGIN_EVENT.ON_SETUP, store)

    store.subscribe(() => {
      this.plugin.emit(PLUGIN_EVENT.ON_SUBSCRIBE, store)
    })

    return store
  }
}
