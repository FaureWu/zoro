import { assert, isReduxAction } from '../src/util/utils';

describe('FILE: util/utils', (): void => {
  test('assert(): assertion passed', (): void => {
    expect(assert(true, '')).toEqual(undefined);
    expect(assert((): boolean => true, '')).toEqual(undefined);
  });

  test('assert(): assertion was not passed', (): void => {
    expect((): void => {
      assert(false, 'Error Message');
    }).toThrow('Error Message');
    expect((): void => {
      assert((): boolean => false, 'Error Message');
    }).toThrow('Error Message');
  });

  test('isReduxAction(): pass the right redux action', (): void => {
    expect(isReduxAction({ type: 'ACTION_TYPE' })).toEqual(true);
    expect(isReduxAction({ type: 'ACTION_TYPE', otherProps: '' })).toEqual(
      true,
    );
  });

  test('isReduxAction(): pass the error action', (): void => {
    expect(isReduxAction(undefined)).toEqual(false);
    expect(isReduxAction(null)).toEqual(false);
    expect(isReduxAction('')).toEqual(false);
    expect(isReduxAction(0)).toEqual(false);
    expect(isReduxAction(NaN)).toEqual(false);
    expect(isReduxAction((): void => {})).toEqual(false);
  });
});
