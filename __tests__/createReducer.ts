import * as Redux from 'redux';
import createReducer from '../src/util/createReducer';

describe('FILE: util/createReducer', (): void => {
  const handlers = {
    ACTION_TYPE: (action: Redux.AnyAction, state: any): any => state,
  };

  test('createReducer(): init state', (): void => {
    const reducer = createReducer({ a: 1 }, handlers);
    expect(reducer(undefined, { type: 'ACTION_TYPE' })).toEqual({ a: 1 });
    expect(reducer({ b: 2 }, { type: 'ACTION_TYPE' })).toEqual({ b: 2 });
  });

  test('createReducer(): pass the error action', (): void => {
    const reducer = createReducer(undefined, handlers);
    expect((): void => {
      reducer(undefined, {} as Redux.AnyAction);
    }).toThrow('the action must be an redux action');
  });

  test('createReducer(): unkown action type return init state', (): void => {
    const reducer = createReducer(undefined, handlers);
    expect(reducer(undefined, { type: 'UNKOWN_ACTION' })).toEqual(null);
  });
});
