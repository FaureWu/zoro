import * as Redux from 'redux';
import * as Z from '../src/zoro';
import createPut from '../src/util/createPut';

describe('FILE: util/createPut', (): void => {
  const store = {
    dispatch(action: Z.Action): Z.Action {
      return action;
    },
  } as Redux.Store;

  test('createPut(): dispatch self model action', (): void => {
    const put = createPut(store, 'modelNamespace');
    expect(put({ type: 'action' })).toEqual({ type: 'modelNamespace/action' });
    expect(put({ type: 'modelNamespace/action' })).toEqual({
      type: 'modelNamespace/action',
    });
    expect(put({ type: 'modelNamespace2/action' })).toEqual({
      type: 'modelNamespace2/action',
    });
  });

  test('createPut(): global dispatch', (): void => {
    const put = createPut(store);
    expect((): void => {
      put({ type: 'action' });
    }).toThrow(
      'we need a model namespace for action type, but we get [action]',
    );

    expect(put({ type: 'modelNamespace2/action' })).toEqual({
      type: 'modelNamespace2/action',
    });
  });
});
