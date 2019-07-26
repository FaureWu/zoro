import * as Redux from 'redux';
import { INTERCEPT_ACTION, INTERCEPT_EFFECT } from './util/constant';

export interface PLUGINEVENT {
  INJECT_INITIAL_STATE: string;
  INJECT_MODELS: string;
  INJECT_MIDDLEWARES: string;
  INJECT_ENHANCERS: string;
  ON_REDUCER: string;
  ON_BEFORE_CREATE_MODEL: string;
  ON_AFTER_CREATE_MODEL: string;
  ON_SETUP_MODEL: string;
  ON_WILL_EFFECT: string;
  ON_DID_EFFECT: string;
  ON_WILL_ACTION: string;
  ON_DID_ACTION: string;
  ON_SETUP: string;
  ON_SUBSCRIBE: string;
  ON_ERROR: string;
  ON_WILL_CONNECT: string;
  ON_DID_CONNECT: string;
}

export interface Action extends Redux.Action<any> {
  [props: string]: any;
}

export interface State {
  [namespace: string]: any;
}

export type RReducer = (action: Action, state: any) => any;

export interface RReducers {
  [propName: string]: RReducer;
}

export type Dispatcher = (payload?: any, meta?: any, error?: boolean) => Action;

export interface Dispatchers {
  [type: string]: Dispatcher;
}

export interface DispatcherGroup {
  [namespace: string]: Dispatchers;
}

export type AssertValidate = () => boolean;

export type PluginEvent = (...params: any[]) => any;

export interface PluginEvents {
  [eventName: string]: PluginEvent[];
}

export type SelectHandler = (state: any) => any;

export type Select = (handler?: SelectHandler) => any;

export type SelectAllHandler = (state: State) => any;

export type SelectAll = (handler?: SelectAllHandler) => any;

export type Put = (action: Action) => Action | Promise<any>;

export interface GlobalOperator {
  select: Select;
  put: Put;
}

export interface Operator extends GlobalOperator {
  selectAll: SelectAll;
}

export interface Models {
  [namespace: string]: Model;
}

export type OnError = (e: Error) => void;

export type OnAction = (action: Action) => void;

export interface OnReducerOption {
  namespace: string;
  [propName: string]: any;
}

export type OnReducer = (
  reducer: Redux.Reducer<any, Action>,
  option: OnReducerOption,
) => Redux.Reducer<any, Action>;

export type OnSetup = (operator: GlobalOperator) => void;

export interface Config {
  initialState?: State;
  extraMiddlewares?: Redux.Middleware[];
  extraEnhancers?: Redux.StoreEnhancer[];
  onEffect?: OnAction;
  onAction?: OnAction;
  onReducer?: OnReducer;
  onSetup?: OnSetup;
  onError?: OnError;
}

export interface Reducers {
  [namespace: string]: Redux.Reducer<any, Action>;
}

export interface PluginCreatorOption {
  DIVIDER: string;
  PLUGIN_EVENT: PLUGINEVENT;
}

export type PluginCreator = (
  plugin: Plugin,
  option: PluginCreatorOption,
) => void;

export interface InterceptOption {
  store: Redux.Store;
  NAMESPACE_DIVIDER: string;
}

export type ActionIntercept = (
  action: Action,
  option: InterceptOption,
) => void | Action;

export type EffectIntercept = (
  action: Action,
  option: InterceptOption,
) => Promise<void> | Promise<Action>;

export interface Intercepts {
  [INTERCEPT_ACTION]: ActionIntercept[];
  [INTERCEPT_EFFECT]: EffectIntercept[];
}

export interface ModelType {
  namespace: string;
  type: string;
}

export type ModelEffect = (
  action: Action,
  operator: Operator,
) => void | Promise<any>;

export interface ModelEffects {
  [propName: string]: ModelEffect;
}

export type ActionCreator = (
  payload?: any,
  meta?: any,
  error?: boolean,
) => Action;

export interface ActionCreators {
  [propName: string]: ActionCreator;
}

export type ModelSetup = (operator: Operator) => void;

export interface ModelConfig {
  namespace: string;
  state?: any;
  reducers?: RReducers;
  effects?: ModelEffects;
  setup?: ModelSetup;
  [prop: string]: any;
}

export interface StoreConfig {
  rootReducer: Redux.Reducer<any, Action>;
  middlewares: Redux.Middleware[];
  enhancers: Redux.StoreEnhancer[];
}

export type MiddlewareHandlerLv2 = (action: Action) => Action | Promise<any>;

export type MiddlewareHandlerLv1 = (
  next: Redux.Dispatch<Action>,
) => MiddlewareHandlerLv2;

export interface RegisterIntercepts {
  action: (intercept: ActionIntercept) => void;
  effect: (intercept: EffectIntercept) => void;
}

export class Plugin {
  public on(eventName: string, eventHandler: PluginEvent): void;

  public emit(eventName: string, ...params: any[]): void;

  public emitWithResultSet(eventName: string, ...params: any[]): any[];

  public emitWithLoop(eventName: string, data: any, ...params: any[]): any;

  public has(eventName: string): boolean;
}

export class Model {
  constructor(config: ModelConfig);

  public getNamespace(): string;

  public getInitState(): any;

  public getReducer(): Redux.Reducer<any, Action>;

  public getEffects(): ModelEffects;

  public getActionCreators(): ActionCreators;

  public getSetup(): ModelSetup | undefined;
}

export class Zoro {
  constructor(config?: Config);

  public onError?: OnError;

  public onEffect?: OnAction;

  public onAction?: OnAction;

  public onReducer?: OnReducer;

  public onSetup?: OnSetup;

  public getPlugin(): Plugin;

  public getStore(): Redux.Store;

  public getIntercepts(type: string): ActionIntercept[] | EffectIntercept[];

  public getModel(namespace: string): Model;

  public getModelEffects(namespace: string): ModelEffects;

  public setModel(modelConfig: ModelConfig): void;

  public setModels(modelConfigs: ModelConfig[]): void;

  public setIntercept(
    type: string,
    intercept: ActionIntercept | EffectIntercept,
  ): void;

  public usePlugin(pluginCreator: PluginCreator): void;

  public start(setup?: boolean): Redux.Store;

  public setup(): void;
}

export class App {
  constructor(zoro: Zoro);

  public intercept: RegisterIntercepts;

  public model(modelConfigs: ModelConfig | ModelConfig[]): App;

  public use(plugins: PluginCreator | PluginCreator[]): App;

  public start(setup?: boolean): Redux.Store;

  public setup(): void;
}

export interface Scope {
  zoro?: Zoro;
  store?: Redux.Store;
}

export interface ComponentConfig {
  [props: string]: any;
}

export type MapStateToComponent = (state: State) => object;
export type MapDispatchToComponent = (dispatch: Redux.Dispatch) => object;
export type CreateComponentConfig = (
  config: ComponentConfig,
) => ComponentConfig;

export type ConnectComponent = (
  mapStateToComponent?: MapStateToComponent,
  mapDispatchToComponent?: MapDispatchToComponent,
) => CreateComponentConfig;

export interface PageConfig {
  [props: string]: any;
}

export type MapStateToPage = (state: State, option: object) => object;
export type MapDispatchToPage = (dispatch: Redux.Dispatch) => object;
export type CreatePageConfig = (config: PageConfig) => PageConfig;

export type Connect = (
  mapStateToPage?: MapStateToPage,
  mapDispatchToPage?: MapDispatchToPage,
) => CreatePageConfig;

export function setStore(store: Redux.Store, zoro?: Zoro): void;

export function connectComponent(
  mapStateToComponent?: MapStateToComponent,
  mapDispatchToComponent?: MapDispatchToComponent,
): ConnectComponent;

export function connect(
  mapStateToPage?: MapStateToPage,
  mapDispatchToPage?: MapDispatchToPage,
): Connect;

export const dispatcher: DispatcherGroup;

export default function zoro(config?: Config): App;
