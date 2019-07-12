import * as Redux from 'redux';
import { assert } from './utils';

type Handler = (action: Redux.AnyAction, state: any) => any;

interface Handlers {
  [propName?: string]: Handler;
}

export default function createReducer(
  initialState: any,
  handlers: Handlers = {},
): Redux.Reducer {
  return function reducer(
    state: any = initialState,
    action: Redux.AnyAction,
  ): any {
    if ({}.hasOwnProperty.call(handlers, action.type)) {
      const handler = handlers[action.type];
      assert(
        typeof handler === 'function',
        `the reducer handler should be a function, but we get ${typeof handler}`,
      );

      return handler(action, state);
    }

    return state;
  };
}
