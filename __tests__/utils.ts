import { assert } from '../src/util/utils';

describe('TEST: util/utils', (): void => {
  test('FUNC: assert(validate: boolean, message: string): void', (): void => {
    expect(assert(true, '')).toEqual(undefined);
    expect((): void => {
      assert(false, 'Error Message');
    }).toThrow('Error Message');
  });

  test('FUNC: assert(validate: ValidateFunc, message: string): void', (): void => {
    expect(assert((): boolean => true, '')).toEqual(undefined);
    expect((): void => {
      assert((): boolean => false, 'Error Message');
    }).toThrow('Error Message');
  });
});
