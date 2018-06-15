import createReducer from './createReducer'
import { assert, isFunction } from './util'
import { NAMESPACE_DIVIDER } from './constant'

const assertOpts = opts => {
  const { namespace } = opts

  assert(
    !!namespace,
    `the model's namespace is necessary, but we get ${namespace}`,
  )
}

class Model {
  constructor(opts) {
    assertOpts(opts)

    const { namespace, state, reducers = {}, affairs = {} } = opts
    this.namespace = namespace
    this.defaultState = state
    this.reducers = this.createReducer(reducers)
    this.affairs = this.createAffairs(affairs)
    this.actions = this.createActions({
      ...reducers,
      ...affairs,
    })
  }

  getNamespace() {
    return this.namespace
  }

  getAffairs() {
    return this.affairs
  }

  getReducers() {
    return this.reducers
  }

  getDefaultState() {
    return this.defaultState
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

    return createReducer(this.defaultState, _reducers)
  }

  createActions(actions) {
    return Object.keys(actions).reduce(
      (combine, name) => ({
        ...combine,
        [name]: function() {
          return {
            type: this.createActionType(name),
            ...arguments,
          }
        },
      }),
      {},
    )
  }

  createAffairs(affairs) {
    return Object.keys(affairs).reduce((combine, key) => {
      const affair = affairs[key]
      const type = this.createActionType(key)
      assert(
        isFunction(affair),
        `the affair must be an function, but we get ${typeof affair} with type ${type}`,
      )
      return { ...combine, [type]: affair }
    }, {})
  }
}

export default Model
