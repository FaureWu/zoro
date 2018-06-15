/*
 * createReducer
 * @param initialState{Any} default state
 * @param handlers{Object}
 *
 * example
 * prop: createReducer(initialState, { [ACTION_TYPE]: (action, state) => to do })
 */

export default (initialState, handlers) => (state = initialState, action) =>
  ({}.hasOwnProperty.call(handlers, action.type)
    ? handlers[action.type](action, state)
    : state)
