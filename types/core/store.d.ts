import { Reducer, AnyAction, Middleware, StoreEnhancer, Store } from 'redux';
export interface Options {
  initialState: any;
  rootReducer: Reducer<any, AnyAction>;
  middlewares: Middleware[];
  enhancers: StoreEnhancer[];
}
export default function createReduxStore(options: Options): Store;
