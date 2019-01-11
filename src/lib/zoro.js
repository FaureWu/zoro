import { combineReducers } from 'redux'
import Model from './model'
import PluginEvent from './pluginEvent'
import createStore from './store'
import { PLUGIN_EVENT, NAMESPACE_DIVIDER, INTERCEPT_TYPE } from './constant'
import effectMiddlewareCreator from './effectMiddleware'
import {
  noop,
  assert,
  isFunction,
  isArray,
  isObject,
  putCreator,
  selectCreator,
} from './util'

const assertOpts = ({
  initialState,
  extraEnhancers,
  extraMiddlewares,
  onEffect,
  onAction,
  onReducer,
  onSetup,
  onError,
}) => {
  assert(
    isObject(initialState),
    `initialState must be an Object, but we get ${typeof initialState}`,
  )
  assert(
    isArray(extraMiddlewares),
    `extraMiddlewares must be an Array, but we get ${typeof extraMiddlewares}`,
  )
  assert(
    isArray(extraEnhancers),
    `extraEnhancers must be an Array, but we get ${typeof extraEnhancers}`,
  )
  assert(
    isFunction(onEffect),
    `the onEffect must be an function handler, but we get ${typeof onEffect}`,
  )
  assert(
    isFunction(onAction),
    `the onAction must be an function handler, but we get ${typeof onAction}`,
  )
  assert(
    isFunction(onReducer),
    `the onReducer must be an function handler, but we get ${typeof onReducer}`,
  )
  assert(
    isFunction(onSetup),
    `the onSetup must be an function handler, but we get ${typeof onSetup}`,
  )
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
    const {
      initialState = {},
      extraMiddlewares = [],
      extraEnhancers = [],
      onEffect = noop,
      onAction = noop,
      onReducer = noop,
      onSetup = noop,
      onError = noop,
    } = opts

    assertOpts({
      initialState,
      extraEnhancers,
      extraMiddlewares,
      onEffect,
      onAction,
      onReducer,
      onSetup,
      onError,
    })

    this.models = {}
    this.modelOpts = []
    this.effects = {}
    this.middlewares = [effectMiddlewareCreator(this)].concat(extraMiddlewares)
    this.enhancers = extraEnhancers
    this.handleError = onError
    this.handleEffect = onEffect
    this.handleAction = onAction
    this.handleReducer = onReducer
    this.handleSetup = onSetup
    this.handleIntercepts = {}
    this.initialState = initialState
    this.plugin = new PluginEvent()
    this._isSetup = false
  }

  getRootReducer() {
    const rootReducer = Object.keys(this.models).reduce(
      (combine, namespace) => {
        const model = this.models[namespace]
        const reducers = model.getReducers()

        let resolveReducers = this.plugin.emitLoop(
          PLUGIN_EVENT.ON_REDUCER,
          namespace,
          reducers,
        )

        if (!isFunction(resolveReducers)) {
          resolveReducers = reducers
        }

        let targetResolveReducers = this.handleReducer.apply(undefined, [
          namespace,
          resolveReducers,
        ])

        if (!isFunction(targetResolveReducers)) {
          targetResolveReducers = resolveReducers
        }

        return {
          ...combine,
          [namespace]: targetResolveReducers,
        }
      },
      {},
    )

    return combineReducers(rootReducer)
  }

  getDefaultState() {
    return Object.keys(this.models).reduce((defaultState, namespace) => {
      const model = this.models[namespace]
      const modelState = model.getDefaultState()

      if (modelState !== undefined) {
        return { ...defaultState, [namespace]: model.getDefaultState() }
      }
      return defaultState
    }, {})
  }

  setIntercept(type, handler) {
    assert(
      INTERCEPT_TYPE.indexOf(type) !== -1,
      `we get an unkown intercept type, it's ${type}`,
    )

    assert(
      isFunction(handler),
      `the intercept must be a Function, but we get ${typeof handler}`,
    )

    assert(
      !isFunction(this.handleIntercepts[type]),
      'you can only set an one intercept for one type',
    )

    this.handleIntercepts[type] = handler
  }

  injectModels(models) {
    assert(
      isArray(models),
      `the models must be an Array, but we get ${typeof models}`,
    )
    const newModelOpts = []
    models.forEach(opts => {
      const modelOpts =
        this.plugin.emitLoop(PLUGIN_EVENT.BEFORE_INJECT_MODEL, opts) || opts
      this.modelOpts.push(modelOpts)
      newModelOpts.push(modelOpts)
      this.plugin.emit(PLUGIN_EVENT.AFTER_INJECT_MODEL, modelOpts)
    })

    if (this.store) {
      const newModels = this.createModels(newModelOpts)
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
    this.middlewares = this.middlewares.concat(middlewares)
  }

  injectEnhancers(enhancers) {
    assert(
      isArray(enhancers),
      `the enhancers must be an Array, but we get ${typeof enhancers}`,
    )

    this.enhancers = this.enhancers.concat(enhancers)
  }

  createModels(modelOpts) {
    const models = {}
    modelOpts.forEach(opts => {
      const model = new Model(opts)
      const namespace = model.getNamespace()
      assertModelUnique(this, model)
      this.models[namespace] = model
      models[namespace] = model
      this.effects = { ...this.effects, ...model.getEffects() }
      this.plugin.emit(PLUGIN_EVENT.ON_CREATE_MODEL, model)
    })

    return models
  }

  createStore() {
    const rootReducer = this.getRootReducer()
    const pluginMiddlewares = this.plugin.emitCombine(
      PLUGIN_EVENT.INJECT_MIDDLEWARES,
    )
    if (isArray(pluginMiddlewares)) {
      this.injectMiddlewares(pluginMiddlewares)
    }

    const pluginEnhancers = this.plugin.emitCombine(
      PLUGIN_EVENT.INJECT_ENHANCERS,
    )
    if (isArray(pluginEnhancers)) {
      this.injectEnhancers(pluginEnhancers)
    }

    const pluginInitialState = this.plugin.emitLoop(
      PLUGIN_EVENT.INJECT_INITIAL_STATE,
      this.initialState,
    )

    return createStore({
      rootReducer,
      middlewares: this.middlewares,
      enhancers: this.enhancers,
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
      this.plugin.emit(PLUGIN_EVENT.ON_SETUP_MODEL, model)
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
      isFunction(creator),
      `the use plugin must be a function, but we get ${typeof creator}`,
    )

    creator(this.plugin, {
      DIVIDER: NAMESPACE_DIVIDER,
      PLUGIN_EVENT,
    })
  }

  start(setup) {
    const pluginModels = this.plugin.emitCombine(PLUGIN_EVENT.INJECT_MODELS)
    if (pluginModels instanceof Array) {
      this.injectModels(pluginModels)
    }
    this.createModels(this.modelOpts)
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
