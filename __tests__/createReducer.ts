import * as Redux from 'redux';
import createReducer from '../src/util/createReducer';

describe('FILE: util/createReducer', (): void => {
  const handlers = {
    ACTION_TYPE1: (): any => undefined,
    ACTION_TYPE2: (): any => null,
    ACTION_TYPE3: (): any => ({}),
    ACTION_TYPE4: (action: Redux.AnyAction, state: any): any => state,
  };

  test('createReducer(): base test', (): void => {
    const reducer = createReducer(undefined, handlers);
    expect(reducer(undefined, { type: 'ACTION_TYPE1' })).toEqual(undefined);
    expect(reducer({}, { type: 'ACTION_TYPE2' })).toEqual(null);
    expect(reducer(undefined, { type: 'ACTION_TYPE3' })).toEqual({});
    expect(reducer({ a: 1 }, { type: 'ACTION_TYPE4' })).toEqual({ a: 1 });
  });
});
