import * as Redux from 'redux';
import * as Z from '../type';

export default function createSelect(
  store: Redux.Store,
  namespace?: string,
): Z.Select | Z.SelectAll {
  return function select(handler?: Z.SelectHandler | Z.SelectAllHandler): any {
    let state: Z.State = store.getState();

    if (namespace) {
      state = state[namespace];
    }

    if (typeof handler === 'function') {
      return handler(state);
    }

    return state;
  };
}
