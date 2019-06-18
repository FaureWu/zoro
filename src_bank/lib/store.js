import { createStore, applyMiddleware, compose } from 'redux'

// eslint-disable-next-line
const window = (function() { return this })() || Function("return this")();

export default ({ rootReducer, middlewares, initialState, enhancers }) => {
  // eslint-disable-next-line
  const composeEnhancers =
    window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares), ...enhancers),
  )
  return store
}
