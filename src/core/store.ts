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

export interface Option {
  rootReducer: Reducer<any, AnyAction>;
  middlewares: Middleware[];
  enhancers: StoreEnhancer[];
}

export interface GlobalState {
  [namespace: string]: any;
}

export default function createReduxStore(option: Option): Store<GlobalState> {
  const composeEnhancers =
    window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const store = createStore(
    option.rootReducer,
    undefined,
    composeEnhancers(
      applyMiddleware(...option.middlewares),
      ...option.enhancers,
    ),
  );

  return store;
}
