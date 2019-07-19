import { Reducer, AnyAction, Middleware, StoreEnhancer, Store } from 'redux';
export interface Option {
  rootReducer: Reducer<any, AnyAction>;
  middlewares: Middleware[];
  enhancers: StoreEnhancer[];
}
export interface GlobalState {
  [namespace: string]: any;
}
export default function createReduxStore(option: Option): Store<GlobalState>;
