import {
  createStore,
  applyMiddleware,
  compose,
  Reducer,
  AnyAction,
  Middleware,
  StoreEnhancer,
  Store,
} from 'redux';

const window =
  (function(): any {
    // @ts-ignore
    return this;
  })() || Function('return this')();

export interface Options {
  initialState: any;
  rootReducer: Reducer<any, AnyAction>;
  middlewares: Middleware[];
  enhancers: StoreEnhancer[];
}

export default function createReduxStore(options: Options): Store {
  const composeEnhancers =
    window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const store = createStore(
    options.rootReducer,
    options.initialState,
    composeEnhancers(
      applyMiddleware(...options.middlewares),
      ...options.enhancers,
    ),
  );

  return store;
}
