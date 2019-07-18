import * as Redux from 'redux';
import Model, { Operator } from '../src/core/model';
import createPut from '../src/util/createPut';
import createSelect from '../src/util/createSelect';
import { noop } from '../src/util/utils';

function delay(time: number): Promise<void> {
  // eslint-disable-next-line
  return new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, time));
}

describe('FILE: core/model', (): void => {
  test('new Model(): empty model test', (): void => {
    const model = new Model({
      namespace: 'model1',
    });
    const reducer = model.getReducer();
    expect(model.getNamespace()).toEqual('model1');
    expect(model.getInitState()).toEqual(undefined);
    expect(reducer(undefined, { type: 'ACTION_TYPE' })).toEqual(undefined);
    expect(model.getEffects()).toEqual({});
    expect(model.getActionCreators()).toEqual({});
    expect(model.getSetup()).toEqual(noop);
  });

  test('new Model(): base model test', async (): Promise<void> => {
    const model = new Model({
      namespace: 'model2',
      state: {
        count: 1,
      },
      reducers: {
        add(action: Redux.AnyAction, state: any): any {
          return { ...state, count: state.count + action.payload };
        },
      },
      effects: {
        async asyncAdd(
          action: Redux.AnyAction,
          operator: Operator,
        ): Promise<void> {
          await delay(100);
          operator.put({ type: 'add', payload: action.payload });
        },
        async asyncAdd2(
          action: Redux.AnyAction,
          operator: Operator,
        ): Promise<string> {
          await delay(100);
          operator.put({ type: 'add', payload: action.payload });
          return 'return value test';
        },
      },
    });

    const store = {
      dispatch(action: Redux.AnyAction): Redux.AnyAction {
        return action;
      },
    } as Redux.Store;

    const operator: Operator = {
      select: createSelect(store, 'model2'),
      selectAll: createSelect(store),
      put: createPut(store, 'model2'),
    };

    const reducer = model.getReducer();
    expect(model.getInitState()).toEqual({ count: 1 });
    expect(reducer(undefined, { type: 'model2/add', payload: 2 })).toEqual({
      count: 3,
    });
    const effects = model.getEffects();
    const result = await effects['model2/asyncAdd'](
      { type: 'model2/asyncAdd' },
      operator,
    );
    expect(result).toEqual(undefined);
    const result2 = await effects['model2/asyncAdd2'](
      { type: 'model2/asyncAdd2' },
      operator,
    );
    expect(result2).toEqual('return value test');
  });
});
