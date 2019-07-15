import { AnyAction, Reducer } from 'redux';
import { assert, isReduxAction } from './utils';

export type CustomReducer = (action: AnyAction, state: any) => any;

export interface CustomReducers {
  [propName: string]: CustomReducer;
}

export default function createReducer(
  initialState: any,
  handlers: CustomReducers = {},
): Reducer<any, AnyAction> {
  return function reducer(state: any = initialState, action: AnyAction): any {
    assert(isReduxAction(action), 'the action must be an redux action');

    if ({}.hasOwnProperty.call(handlers, action.type)) {
      const handler = handlers[action.type];
      assert(
        typeof handler === 'function',
        `the reducer handler should be a function, but we get ${typeof handler}`,
      );

      return handler(action, state);
    } else {
      console.warn(`you dispatch the unkown action type is ${action.type}`);
    }

    return state;
  };
}
