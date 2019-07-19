import { AnyAction, Reducer } from 'redux';
import { assert, isReduxAction } from './utils';

export type CustomReducer = (action: AnyAction, state: any) => any;

export interface CustomReducers {
  [propName: string]: CustomReducer;
}

export default function createReducer(
  initialState: any = null,
  handlers: CustomReducers = {},
): Reducer<any, AnyAction> {
  assert(
    typeof handlers === 'object' && handlers !== null,
    'the reducer handlers must be an object',
  );

  return function reducer(state: any = initialState, action: AnyAction): any {
    assert(isReduxAction(action), 'the action must be an redux action');

    if ({}.hasOwnProperty.call(handlers, action.type)) {
      const handler = handlers[action.type];
      assert(
        typeof handler === 'function',
        'the reducer handler should be a function',
      );

      return handler(action, state);
    } else {
      console.warn(`you dispatch the unkown action type is ${action.type}`);
    }

    return state;
  };
}
