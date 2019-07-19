import { Store } from 'redux';
import { GlobalState } from '../core/store';

export type SelectCallBack = (state: any) => any;

export type Select = (handler?: SelectCallBack) => any;

export default function createSelect(
  store: Store<GlobalState>,
  namespace?: string,
): Select {
  return function select(handler?: SelectCallBack): any {
    let state: GlobalState = store.getState();

    if (namespace) {
      state = state[namespace];
    }

    if (typeof handler === 'function') {
      return handler(state);
    }

    return state;
  };
}
