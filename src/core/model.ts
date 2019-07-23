import * as Redux from 'redux';
import * as Z from '../zoro';
import createReducer from '../util/createReducer';
import { assert, noop } from '../util/utils';
import { NAMESPACE_DIVIDER } from '../util/constant';

function assertOption(config: Z.ModelConfig): void {
  const { namespace, reducers = {}, effects = {}, setup = noop } = config;

  assert(
    typeof namespace === 'string',
    `the model's namespace is necessary, but we get ${namespace}`,
  );
  assert(
    typeof reducers === 'object' && reducers !== null,
    `the ${namespace} model reducers must an Object, but we get ${typeof reducers}`,
  );
  assert(
    typeof effects === 'object' && effects !== null,
    `the ${namespace} model effects must an Object, but we get ${typeof effects}`,
  );
  assert(
    typeof setup === 'function',
    `the ${namespace} setup must be a Function, but we get ${typeof setup}`,
  );
}

class Model {
  private namespace: string;

  private initState: any;

  private reducer: Redux.Reducer<any, Z.Action>;

  private effects: Z.ModelEffects = {};

  private actionCreators: Z.ActionCreators = {};

  private setup: Z.ModelSetup = noop;

  private createReducer(
    reducers: Z.RReducers = {},
  ): Redux.Reducer<any, Z.Action> {
    const reducerHandlers: Z.RReducers = Object.keys(reducers).reduce(
      (combine: Z.RReducers, key: string): Z.RReducers => {
        const reducerHandler: Z.RReducer = reducers[key];
        assert(
          typeof reducerHandler === 'function',
          `the reducer must be an function, but we get ${typeof reducerHandler} with type ${key}`,
        );

        const type = `${this.getNamespace()}${NAMESPACE_DIVIDER}${key}`;
        return { ...combine, [type]: reducerHandler };
      },
      {},
    );

    return createReducer(this.getInitState(), reducerHandlers);
  }

  private createEffects(effects: Z.ModelEffects = {}): Z.ModelEffects {
    return Object.keys(effects).reduce(
      (combine: Z.ModelEffects, key: string): Z.ModelEffects => {
        const effect: Z.ModelEffect = effects[key];
        assert(
          typeof effect === 'function',
          `the effect must be an function, but we get ${typeof effect} with type ${key}`,
        );
        const type = `${this.getNamespace()}${NAMESPACE_DIVIDER}${key}`;
        return { ...combine, [type]: effect };
      },
      {},
    );
  }

  private createActionCreators(
    reducers: Z.RReducers = {},
    effects: Z.ModelEffects = {},
  ): Z.ActionCreators {
    const self = this;
    return Object.keys({ ...reducers, ...effects }).reduce(
      (combine: Z.ActionCreators, key: string): Z.ActionCreators => {
        combine[key] = function actionCreator(
          payload?: any,
          meta?: any,
          error?: boolean,
        ): Z.Action {
          return {
            type: `${self.getNamespace()}${NAMESPACE_DIVIDER}${key}`,
            payload,
            meta,
            error,
          };
        };

        return combine;
      },
      {},
    );
  }

  public constructor(config: Z.ModelConfig) {
    assertOption(config);

    const { namespace, state, reducers, effects, setup } = config;

    this.namespace = namespace;
    this.initState = state;
    this.reducer = this.createReducer(reducers);
    this.effects = this.createEffects(effects);
    this.actionCreators = this.createActionCreators(reducers, effects);

    if (typeof setup === 'function') {
      this.setup = setup;
    }
  }

  public getNamespace(): string {
    return this.namespace;
  }

  public getInitState(): any {
    return this.initState;
  }

  public getReducer(): Redux.Reducer<any, Z.Action> {
    return this.reducer;
  }

  public getEffects(): Z.ModelEffects {
    return this.effects;
  }

  public getActionCreators(): Z.ActionCreators {
    return this.actionCreators;
  }

  public getSetup(): Z.ModelSetup | undefined {
    return this.setup;
  }
}

export default Model;
