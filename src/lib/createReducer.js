import { assert, isObject, isFunction } from './util'

/*
 * createReducer
 * @param initialState{Any} default state
 * @param handlers{Object}
 *
 * example
 * prop: createReducer(initialState, { [ACTION_TYPE]: (action, state) => to do })
 */

export default (initialState, handlers = {}) => {
  assert(
    isObject(handlers),
    'the second argument of createReducer should be an object',
  )

  return (state = initialState, action) => {
    if ({}.hasOwnProperty.call(handlers, action.type)) {
      const handler = handlers[action.type]

      assert(
        isFunction(handler),
        `the reducer handler should be a function, but we get ${typeof handler}`,
      )

      return handler(action, state)
    }

    return state
  }
}
