import { createStore, applyMiddleware } from 'redux'

export default ({ rootReducer, middlewares, initialState }) => {
  // eslint-disable-next-line
  // const composeEnhancers =
  //   window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  //     ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  //     : compose
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares),
  )
  return store
}
