import { combineReducers } from 'redux'
import Model from './model'
import createStore from './store'
import affairMiddlewareCreator from './affairMiddleware'
import { noop, assert, isFunction, isArray } from './util'

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

    const { onError = noop, initialState = {}, onAffair = noop } = opts

    this.models = {}
    this.actions = {}
    this.middlewares = []
    this.handleError = onError
    this.handleAffair = onAffair
    this.initialState = initialState
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

  getAffairs() {
    return Object.keys(this.models).reduce((affairs, namespace) => {
      const model = this.models[namespace]
      return { ...affairs, ...model.getAffairs() }
    }, {})
  }

  getDefaultState() {
    return Object.keys(this.models).reduce((defaultState, namespace) => {
      const model = this.models[namespace]
      return { ...defaultState, [namespace]: model.getDefaultState() }
    }, {})
  }

  model(opts) {
    const model = new Model(opts)
    assertModelUnique(this, model)
    this.models[model.getNamespace()] = model
  }

  models(models) {
    assert(
      isArray(models),
      `the models must be an Array, but we get ${typeof models}`,
    )
    models.forEach(model => this.model(model))
  }

  middleware(middleware) {
    assert(!!middleware, 'the middleware must has one param, but we get none')
    this.middlewares.push(middleware)
  }

  middlewares(middlewares) {
    assert(
      isArray(middlewares),
      `the middlewares must be an Array, but we get ${typeof middlewares}`,
    )
    middlewares.forEach(middleware => this.middleware(middleware))
  }

  createStore() {
    const rootReducer = this.getRootReducer()
    const affairMiddleware = affairMiddlewareCreator(this)
    const middlewares = [affairMiddleware].concat(this.middlewares)
    return createStore({
      rootReducer,
      middlewares,
      initialState: {
        ...this.initialState,
        ...this.getDefaultState(),
      },
    })
  }

  start() {
    this.store = this.createStore()
    return this.store
  }
}
