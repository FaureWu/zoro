import * as Redux from 'redux';
import * as Z from '../zoro';

const window =
  (function(): any {
    // @ts-ignore
    return this;
  })() || Function('return this')();

export default function createReduxStore(config: Z.StoreConfig): Redux.Store {
  const composeEnhancers =
    window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : Redux.compose;

  const store = Redux.createStore(
    config.rootReducer,
    undefined,
    composeEnhancers(
      Redux.applyMiddleware(...config.middlewares),
      ...config.enhancers,
    ),
  );

  return store;
}
