import * as Redux from 'redux';
import createSelect from '../src/util/createSelect';

describe('FILE: util/createSelect', (): void => {
  const store = {
    getState: (): any => ({ model1: { a: 1 }, model2: { b: 1 } }),
  } as Redux.Store;

  test('createSelect(): selectAll test', (): void => {
    const selectAll = createSelect(store);
    expect(selectAll()).toEqual(store.getState());
    expect(selectAll((state): any => state.model1)).toEqual(
      store.getState().model1,
    );
  });

  test('createSelect(): select test', (): void => {
    const select = createSelect(store, 'model2');
    expect(select()).toEqual(store.getState().model2);
    expect(select((state): any => state.b)).toEqual(1);
  });
});
