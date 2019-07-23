import * as Redux from 'redux';
import * as Z from '../type';
import createReduxStore from './store';
import Model from './model';
import effectMiddlewareCreator from './effectMiddleware';
import Plugin from '../util/plugin';
import { assert, noop } from '../util/utils';
import {
  PLUGIN_EVENT,
  NAMESPACE_DIVIDER,
  INTERCEPT_TYPE,
  INTERCEPT_ACTION,
  INTERCEPT_EFFECT,
} from '../util/constant';
import createPut from '../util/createPut';
import createSelect from '../util/createSelect';

function assertOptions(config: Z.Config): void {
  const {
    initialState = {},
    extraMiddlewares = [],
    extraEnhancers = [],
    onEffect = noop,
    onAction = noop,
    onReducer = noop,
    onSetup = noop,
    onError = noop,
  } = config;

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
  private initState: Z.State = {};

  private models: Z.Models = {};

  private modelConfigs: Z.ModelConfig[] = [];

  private middlewares: Redux.Middleware[] = [];

  private enhancers: Redux.StoreEnhancer[] = [];

  private isSetup: boolean = false;

  private plugin: Z.Plugin;

  private store: Redux.Store;

  private intercepts: Z.Intercepts = {
    [INTERCEPT_ACTION]: [],
    [INTERCEPT_EFFECT]: [],
  };

  public onError?: Z.OnError;

  public onEffect?: Z.OnAction;

  public onAction?: Z.OnAction;

  public onReducer?: Z.OnReducer;

  public onSetup?: Z.OnSetup;

  public constructor(config: Z.Config = {}) {
    assertOptions(config);

    const {
      initialState,
      extraMiddlewares,
      extraEnhancers,
      onEffect,
      onAction,
      onReducer,
      onSetup,
      onError,
    } = config;

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

    this.middlewares = [effectMiddlewareCreator(this)];
    if (extraMiddlewares) {
      this.middlewares = this.middlewares.concat(extraMiddlewares);
    }
  }

  private getRootReducer(): Redux.Reducer<any, Z.Action> {
    const rootReducer: Z.Reducers = Object.keys(this.models).reduce(
      (reducers: Z.Reducers, namespace: string): Z.Reducers => {
        const model: Z.Model = this.models[namespace];
        let reducer: Redux.Reducer<any, Z.Action> = model.getReducer();

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
      },
      {},
    );

    return Redux.combineReducers(rootReducer);
  }

  private getInitState(): Z.State {
    const pluginInitState = this.getPlugin().emitWithLoop(
      PLUGIN_EVENT.INJECT_INITIAL_STATE,
      this.initState,
    );

    return {
      ...this.initState,
      ...pluginInitState,
    };
  }

  private replaceReducer(): void {
    const rootReducer: Redux.Reducer<any, Z.Action> = this.getRootReducer();
    this.getStore().replaceReducer(rootReducer);
  }

  private createModel(modelConfig: Z.ModelConfig): Z.Model {
    let nextModelConfig = this.getPlugin().emitWithLoop(
      PLUGIN_EVENT.ON_BEFORE_CREATE_MODEL,
      modelConfig,
    );

    if (typeof nextModelConfig !== 'object' || nextModelConfig === null) {
      nextModelConfig = modelConfig;
    }

    const initState = this.getInitState();
    if (
      typeof nextModelConfig.state === 'undefined' &&
      typeof nextModelConfig.namespace === 'string'
    ) {
      nextModelConfig.state = initState[nextModelConfig.namespace];
    }

    const model: Z.Model = new Model(nextModelConfig);
    const namespace = model.getNamespace();
    assert(
      typeof this.models[namespace] === 'undefined',
      `the model namespace must be unique, we get duplicate namespace ${namespace}`,
    );
    this.models[namespace] = model;
    this.getPlugin().emit(PLUGIN_EVENT.ON_AFTER_CREATE_MODEL, model);

    return model;
  }

  private createModels(modelConfigs: Z.ModelConfig[]): Z.Models {
    return modelConfigs.reduce(
      (models: Z.Models, modelConfig: Z.ModelConfig): Z.Models => {
        const model = this.createModel(modelConfig);
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

  private createStore(): Redux.Store {
    const rootReducer: Redux.Reducer<any, Z.Action> = this.getRootReducer();
    this.injectPluginMiddlewares();
    this.injectPluginEnhancers();

    return createReduxStore({
      rootReducer,
      middlewares: this.middlewares,
      enhancers: this.enhancers,
    });
  }

  private setupModel(models: Z.Models): void {
    const store = this.getStore();

    Object.keys(models).forEach((namespace: string): void => {
      const model: Z.Model = models[namespace];
      this.getPlugin().emit(PLUGIN_EVENT.ON_SETUP_MODEL, model);
      const setup: Z.ModelSetup | undefined = model.getSetup();
      if (typeof setup === 'function') {
        setup({
          put: createPut(store, namespace),
          select: createSelect(store, namespace),
          selectAll: createSelect(store),
        });
      }
    });
  }

  public getPlugin(): Z.Plugin {
    return this.plugin;
  }

  public getStore(): Redux.Store {
    assert(
      typeof this.store !== 'undefined',
      'the redux store is not create before call start()',
    );

    return this.store;
  }

  public getIntercepts(
    type: string,
  ): Z.ActionIntercept[] | Z.EffectIntercept[] {
    return this.intercepts[type] || [];
  }

  public getModel(namespace: string): Z.Model {
    const model: Z.Model = this.models[namespace];
    assert(
      typeof model !== 'undefined',
      `the ${namespace} model unkown when get model`,
    );

    return model;
  }

  public getModelEffects(namespace: string): Z.ModelEffects {
    const model: Z.Model = this.models[namespace];
    assert(
      typeof model !== 'undefined',
      `the ${namespace} model unkown when get model effects`,
    );

    return model.getEffects();
  }

  public setModel(modelConfig: Z.ModelConfig): void {
    this.modelConfigs.push(modelConfig);
    if (this.store) {
      const model: Z.Model = this.createModel(modelConfig);
      this.replaceReducer();

      if (this.isSetup) {
        this.setupModel({ [model.getNamespace()]: model });
      }
    }
  }

  public setModels(modelConfigs: Z.ModelConfig[]): void {
    assert(
      modelConfigs instanceof Array,
      `the models must be an Array, but we get ${typeof modelConfigs}`,
    );

    this.modelConfigs = this.modelConfigs.concat(modelConfigs);

    if (this.store) {
      const models: Z.Models = this.createModels(modelConfigs);
      this.replaceReducer();

      if (this.isSetup) {
        this.setupModel(models);
      }
    }
  }

  public setIntercept(
    type: string,
    intercept: Z.ActionIntercept | Z.EffectIntercept,
  ): void {
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

  public usePlugin(pluginCreator: Z.PluginCreator): void {
    assert(
      typeof pluginCreator === 'function',
      `the use plugin must be a function, but we get ${typeof pluginCreator}`,
    );

    pluginCreator(this.getPlugin(), {
      DIVIDER: NAMESPACE_DIVIDER,
      PLUGIN_EVENT,
    });
  }

  public start(setup: boolean = true): Redux.Store {
    this.injectPluginModels();
    this.createModels(this.modelConfigs);
    const store = (this.store = this.createStore());

    store.subscribe((): void => {
      const plugin = this.getPlugin();
      if (plugin.has(PLUGIN_EVENT.ON_SUBSCRIBE)) {
        plugin.emit(PLUGIN_EVENT.ON_SUBSCRIBE, store);
      }
    });

    if (setup) {
      this.setup();
    }

    return store;
  }

  public setup(): void {
    if (this.isSetup) {
      return;
    }

    const store = this.getStore();

    this.setupModel(this.models);

    if (typeof this.onSetup === 'function') {
      this.onSetup({
        put: createPut(store),
        select: createSelect(store),
      });
    }
    this.getPlugin().emit(PLUGIN_EVENT.ON_SETUP, store);
  }
}

export default Zoro;
