import { createStore, applyMiddleware } from 'redux'

export default ({ rootReducer, middlewares, initialState }) => {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares),
  )
  return store
}
