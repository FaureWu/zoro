import { AnyAction } from 'redux';
import zoro, { dispatcher } from '../src/index';
import { Option as ModelOption } from '../src/core/model';

function delay(time: number): Promise<void> {
  // eslint-disable-next-line
  return new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, time));
}

const model1: ModelOption = {
  namespace: 'model1',
};

const model2: ModelOption = {
  namespace: 'model2',
  state: {
    count: 1,
  },
  setup(operator): void {
    const count = operator.select().count;
    operator.put({ type: 'add', payload: { count: count + 4 } });
  },
  reducers: {
    add(action, state): any {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};

const model3: ModelOption = {
  namespace: 'model3',
  state: {
    count: 1,
  },
  reducers: {
    add(action, state): any {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
  effects: {
    async asyncAdd(action, operator): Promise<string> {
      await delay(200);
      // const count = operator.select((state: any): number => state.count);
      const count = operator.selectAll(
        (state: any): number => state.model3.count,
      );
      operator.put({ type: 'add', payload: { count: count + 1 } });
      return 'result';
    },
  },
};

describe('Integration Test', (): void => {
  const app = zoro({
    initialState: {
      model1: 'model1',
      model2: null,
      model3: {},
    },
    onSetup(operator): void {
      const state = operator.select();
      operator.put({
        type: 'model3/add',
        payload: { count: state.model3.count + 6 },
      });
    },
  });
  app.model(model1);
  app.model([model2, model3]);
  const store = app.start();

  test('base demo test', async (): Promise<void> => {
    expect(store.getState()).toEqual({
      model1: 'model1',
      model2: { count: 5 },
      model3: { count: 7 },
    });

    dispatcher.model2.add({ count: 3 });
    expect(store.getState()).toEqual({
      model1: 'model1',
      model2: { count: 3 },
      model3: { count: 7 },
    });

    const result = await dispatcher.model3.asyncAdd();
    expect(store.getState()).toEqual({
      model1: 'model1',
      model2: { count: 3 },
      model3: { count: 8 },
    });

    expect(result).toEqual('result');
  });

  test('action intercept test', async (): Promise<void> => {
    app.intercept.action(
      (action): AnyAction => {
        action.payload.count += 1;
        return action;
      },
    );
    app.intercept.action(
      (action): AnyAction => {
        action.payload.count += 2;
        return action;
      },
    );

    dispatcher.model3.add({ count: 10 });
    expect(store.getState().model3).toEqual({
      count: 13,
    });

    app.intercept.effect(
      async (): Promise<void> => {
        await delay(100);
      },
    );

    await dispatcher.model3.asyncAdd();
    expect(store.getState().model3).toEqual({
      count: 17,
    });
  });
});
