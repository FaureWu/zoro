import createReducer from './createReducer'
import { assert, isFunction, noop, isObject } from './util'
import { NAMESPACE_DIVIDER } from './constant'

const assertOpts = ({ namespace, reducers, effects, setup }) => {
  assert(
    !!namespace,
    `the model's namespace is necessary, but we get ${namespace}`,
  )
  assert(
    isObject(reducers),
    `the ${namespace} model reducers must an Object, but we get ${typeof reducers}`,
  )
  assert(
    isObject(effects),
    `the ${namespace} model effects must an Object, but we get ${typeof effects}`,
  )
  assert(
    isFunction(setup),
    `the ${namespace} setup must be a Function, but we get ${typeof setup}`,
  )
}

class Model {
  constructor(opts) {
    const { namespace, state, reducers = {}, effects = {}, setup = noop } = opts

    assertOpts({ namespace, reducers, effects, setup })

    this.namespace = namespace
    this.defaultState = state
    this.reducers = this.createReducer(reducers)
    this.effects = this.createEffects(effects)
    this.actions = this.createActions({
      ...reducers,
      ...effects,
    })
    this.handleSetup = setup
  }

  getNamespace() {
    return this.namespace
  }

  getEffects() {
    return this.effects
  }

  getReducers() {
    return this.reducers
  }

  getDefaultState() {
    return this.defaultState
  }

  getActions() {
    return this.actions
  }

  createActionType(type) {
    return `${this.namespace}${NAMESPACE_DIVIDER}${type}`
  }

  createReducer(reducers) {
    const _reducers = Object.keys(reducers).reduce((combine, key) => {
      const reducer = reducers[key]
      const type = this.createActionType(key)
      assert(
        isFunction(reducer),
        `the reducer must be an function, but we get ${typeof reducer} with type ${type}`,
      )
      return { ...combine, [type]: reducer }
    }, {})

    return createReducer(this.defaultState || null, _reducers)
  }

  createActions(actions) {
    const _that = this
    return Object.keys(actions).reduce(
      (combine, name) => ({
        ...combine,
        [name]: function(payload, meta, error) {
          return {
            type: _that.createActionType(name),
            payload,
            meta,
            error,
          }
        },
      }),
      {},
    )
  }

  createEffects(effects) {
    return Object.keys(effects).reduce((combine, key) => {
      const effect = effects[key]
      const type = this.createActionType(key)
      assert(
        isFunction(effect),
        `the effect must be an function, but we get ${typeof effect} with type ${type}`,
      )
      return { ...combine, [type]: effect }
    }, {})
  }
}

export default Model
