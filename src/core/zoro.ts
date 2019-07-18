import {
  Middleware,
  StoreEnhancer,
  AnyAction,
  Reducer,
  Store,
  combineReducers,
  createStore,
} from 'redux';
import Model, {
  Option as ModelOption,
  Operator as ModelOperator,
  Setup as ModelSetup,
  Effects as ModelEffects,
} from './model';
import effectMiddlewareCreator from './effectMiddleware';
import Plugin from '../util/plugin';
import { assert, noop } from '../util/utils';
import {
  PLUGIN_EVENT,
  NAMESPACE_DIVIDER,
  PluginEvent,
  INTERCEPT_TYPE,
} from '../util/constant';
import createPut from '../util/createPut';
import createSelect from '../util/createSelect';

export interface Models {
  [namespace: string]: Model;
}

export type OnError = (e: Error) => void;

export type OnAction = (action: AnyAction) => void;

export interface OnReducerOption {
  namespace: string;
  [propName: string]: any;
}

export type OnReducer = (
  reducer: Reducer<any, AnyAction>,
  option: OnReducerOption,
) => Reducer<any, AnyAction>;

export type OnSetup = (operator: ModelOperator) => void;

export interface State {
  [namespace: string]: any;
}

export interface Options {
  initialState?: State;
  extraMiddlewares?: Middleware[];
  extraEnhancers?: StoreEnhancer[];
  onEffect?: OnAction;
  onAction?: OnAction;
  onReducer?: OnReducer;
  onSetup?: OnSetup;
  onError?: OnError;
}

export interface Reducers {
  [namespace: string]: Reducer<any, AnyAction>;
}

export interface PluginCreatorOption {
  DIVIDER: string;
  PLUGIN_EVENT: PluginEvent;
}

export type PluginCreator = (plugin: Plugin, option: PluginOption) => void;

export interface InterceptOption {
  store: Store;
  NAMESPACE_DIVIDER: string;
}

export type Intercept = (
  action: AnyAction,
  option: InterceptOption,
) => Promise<any>;

export interface Intercepts {
  [typeName: string]: Intercept[];
}

function assertOptions(options: Options): void {
  const {
    initialState = {},
    extraMiddlewares = [],
    extraEnhancers = [],
    onEffect = noop,
    onAction = noop,
    onReducer = noop,
    onSetup = noop,
    onError = noop,
  } = options;

  assert(
    typeof initialState === 'object' && initialState !== null,
    `initialState must be an Object, but we get ${typeof initialState}`,
  );
  assert(
    extraMiddlewares instanceof Array,
    `extraMiddlewares must be an Array, but we get ${typeof extraMiddlewares}`,
  );
  assert(
    extraEnhancers instanceof Array,
    `extraEnhancers must be an Array, but we get ${typeof extraEnhancers}`,
  );
  assert(
    typeof onEffect === 'function',
    `the onEffect must be an function handler, but we get ${typeof onEffect}`,
  );
  assert(
    typeof onAction === 'function',
    `the onAction must be an function handler, but we get ${typeof onAction}`,
  );
  assert(
    typeof onReducer === 'function',
    `the onReducer must be an function handler, but we get ${typeof onReducer}`,
  );
  assert(
    typeof onSetup === 'function',
    `the onSetup must be an function handler, but we get ${typeof onSetup}`,
  );
  assert(
    typeof onError === 'function',
    `the onError must be an function handler, but we get ${typeof onError}`,
  );
}

class Zoro {
  private initState: State = {};

  private models: Models = {};

  private modelOptions: ModelOption[] = [];

  private middlewares: Middleware[] = [];

  private enhancers: StoreEnhancer[] = [];

  private isSetup: boolean = false;

  private plugin: Plugin;

  private store: Store;

  private intercepts: Intercepts = {};

  public onError?: OnError;

  public onEffect?: OnAction;

  public onAction?: OnAction;

  public onReducer?: OnReducer;

  public onSetup?: OnSetup;

  public constructor(options: Options) {
    assertOptions(options);

    const {
      initialState,
      extraMiddlewares,
      extraEnhancers,
      onEffect,
      onAction,
      onReducer,
      onSetup,
      onError,
    } = options;

    this.plugin = new Plugin();

    if (initialState) {
      this.initState = initialState;
    }

    if (extraEnhancers) {
      this.enhancers = extraEnhancers;
    }

    if (onEffect) {
      this.onEffect = onEffect;
    }

    if (onAction) {
      this.onAction = onAction;
    }

    if (onReducer) {
      this.onReducer = onReducer;
    }

    if (onSetup) {
      this.onSetup = onSetup;
    }

    if (onError) {
      this.onError = onError;
    }

    if (extraMiddlewares) {
      this.middlewares = [effectMiddlewareCreator(this)].concat(
        extraMiddlewares,
      );
    }
  }

  private getRootReducer(): Reducer<any, AnyAction> {
    const rootReducer: Reducer<any, AnyAction> = Object.keys(
      this.models,
    ).reduce((reducers: Reducers, namespace: string): Reducers => {
      const model: Model = this.models[namespace];
      let reducer: Reducer<any, AnyAction> = model.getReducer();

      if (this.onReducer) {
        const nextReducer = this.onReducer(reducer, { namespace });

        if (typeof nextReducer === 'function') {
          reducer = nextReducer;
        } else {
          console.warn(
            `onReducer need return a Reducer, but we get ${typeof nextReducer}`,
          );
        }
      }

      const nextReducer = this.getPlugin().emitWithLoop(
        PLUGIN_EVENT.ON_REDUCER,
        reducer,
        { namespace },
      );

      if (typeof nextReducer === 'function') {
        reducer = nextReducer;
      }

      reducers[namespace] = reducer;

      return reducers;
    }, {});

    return combineReducers(rootReducer);
  }

  private getInitState(): State {
    const modelInitState = Object.keys(this.models).reduce(
      (state: any, namespace): any => {
        const model = this.models[namespace];
        state[namespace] = model.getInitState();

        return state;
      },
      {},
    );

    const state = {
      ...this.initState,
      ...modelInitState,
    };

    const pluginInitState = this.getPlugin().emitWithLoop(
      PLUGIN_EVENT.INJECT_INITIAL_STATE,
      state,
    );

    return {
      ...state,
      ...pluginInitState,
    };
  }

  private replaceReducer(): void {
    const rootReducer = this.getRootReducer();
    this.getStore().replaceReducer(rootReducer);
  }

  private createModel(modelOption: ModelOption): Model {
    let nextModelOption = this.getPlugin().emitWithLoop(
      PLUGIN_EVENT.ON_CREATE_MODEL,
      modelOption,
    );

    if (typeof nextModelOption !== 'object' || nextModelOption === null) {
      nextModelOption = modelOption;
    }

    const model: Model = new Model(nextModelOption);
    const namespace = model.getNamespace();
    assert(
      typeof this.models[namespace] === 'undefined',
      `the model namespace must be unique, we get duplicate namespace ${namespace}`,
    );
    this.models[namespace] = model;

    return model;
  }

  private createModels(modelOptions: ModelOption[]): Model[] {
    return modelOptions.reduce(
      (models: Models, modelOption: ModelOption): Models => {
        const model = this.createModel(modelOption);
        models[model.getNamespace()] = model;

        return models;
      },
      {},
    );
  }

  private injectPluginMiddlewares(): void {
    const pluginMiddlewares = this.getPlugin().emitWithResultSet(
      PLUGIN_EVENT.INJECT_MIDDLEWARES,
    );

    if (typeof pluginMiddlewares !== 'undefined') {
      assert(
        pluginMiddlewares instanceof Array,
        `the inject plugin middlewares must be an Array, but we get ${typeof pluginMiddlewares}`,
      );
      this.middlewares = this.middlewares.concat(pluginMiddlewares);
    }
  }

  private injectPluginEnhancers(): void {
    const pluginEnhancers = this.getPlugin().emitWithResultSet(
      PLUGIN_EVENT.INJECT_ENHANCERS,
    );

    if (typeof pluginEnhancers !== 'undefined') {
      assert(
        pluginEnhancers instanceof Array,
        `the inject plugin enhancers must be an Array, but we get ${typeof pluginEnhancers}`,
      );
      this.enhancers = this.enhancers.concat(pluginEnhancers);
    }
  }

  private injectPluginModels(): void {
    const pluginModels = this.getPlugin().emitWithResultSet(
      PLUGIN_EVENT.INJECT_MODELS,
    );
    if (typeof pluginModels !== 'undefined') {
      assert(
        pluginModels instanceof Array,
        `the inject plugin models must be an Array, but we get ${typeof pluginModels}`,
      );

      this.setModels(pluginModels);
    }
  }

  private createStore(): Store {
    const rootReducer: Reducer<any, AnyAction> = this.getRootReducer();
    this.injectPluginMiddlewares();
    this.injectPluginEnhancers();
    const initialState: any = this.getInitState();

    return createStore({
      rootReducer,
      middlewares: this.middlewares,
      enhancers: this.enhancers,
      initialState,
    });
  }

  private setupModel(models: Models): void {
    const store: Store = this.getStore();

    Object.keys(models).forEach((namespace: string): void => {
      const model: Model = models[namespace];
      this.getPlugin().emit(PLUGIN_EVENT.ON_SETUP_MODEL, model);
      const setup: ModelSetup = model.getSetup();
      if (typeof setup === 'function') {
        setup({
          put: createPut(store, namespace),
          select: createSelect(store, namespace),
          selectAll: createSelect(store),
        });
      }
    });
  }

  public getPlugin(): Plugin {
    return this.plugin;
  }

  public getStore(): Store {
    assert(
      typeof this.store !== 'undefined',
      'the redux store is not create before call start()',
    );

    return this.store;
  }

  public getIntercepts(type: string): Intercept[] {
    return this.intercepts[type] || [];
  }

  public getModelEffects(namespace: string): ModelEffects {
    const model: Model = this.models[namespace];
    assert(
      typeof model !== 'undefined',
      `the ${namespace} model unkown when get model effects`,
    );

    return model.getEffects();
  }

  public setModel(modelOption: ModelOption): void {
    this.modelOptions.push(modelOption);
    if (this.store) {
      const model: Model = this.createModel(modelOption);
      this.replaceReducer();

      if (this.isSetup) {
        this.setupModel(model);
      }
    }
  }

  public setModels(modelOptions: ModelOption[]): void {
    assert(
      modelOptions instanceof Array,
      `the models must be an Array, but we get ${typeof modelOptions}`,
    );

    this.modelOptions = this.modelOptions.concat(modelOptions);

    if (this.store) {
      const models: Models = this.createModels(modelOptions);
      this.replaceReducer();

      if (this.isSetup) {
        this.setupModel(models);
      }
    }
  }

  public setIntercept(type: string, intercept: Intercept): void {
    assert(
      INTERCEPT_TYPE.indexOf(type) !== -1,
      `we get an unkown intercept type, it's ${type}`,
    );

    assert(
      typeof intercept === 'function',
      `the intercept must be a Function, but we get ${typeof intercept}`,
    );

    if (!(this.intercepts[type] instanceof Array)) {
      this.intercepts[type] = [];
    }

    this.intercepts[type].push(intercept);
  }

  public usePlugin(pluginCreator: PluginCreator): void {
    assert(
      typeof pluginCreator === 'function',
      `the use plugin must be a function, but we get ${typeof pluginCreator}`,
    );

    pluginCreator(this.getPlugin(), {
      DIVIDER: NAMESPACE_DIVIDER,
      PLUGIN_EVENT,
    });
  }

  public start(setup: boolean = true): Store {
    this.injectPluginModels();
    this.createModels(this.modelOptions);
    const store: Store = (this.store = this.createStore());

    if (setup) {
      this.setupModel();
    }

    store.subscribe((): void => {
      const plugin = this.getPlugin();
      if (plugin.has(PLUGIN_EVENT.ON_SUBSCRIBE)) {
        plugin.emit(PLUGIN_EVENT.ON_SUBSCRIBE, store);
      }
    });

    return store;
  }

  public setup(): void {
    if (this.isSetup) {
      return;
    }

    const store = this.getStore();

    this.setupModel(this.models);
    this.onSetup({
      put: createPut(store),
      select: createSelect(store),
    });
    this.getPlugin().emit(PLUGIN_EVENT.ON_SETUP, store);
  }
}

export default Zoro;
