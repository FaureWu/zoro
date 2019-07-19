import { Middleware, StoreEnhancer, AnyAction, Reducer, Store } from 'redux';
import { GlobalState } from './store';
import Model, {
  Option as ModelOption,
  GlobalOperator,
  Effects as ModelEffects,
} from './model';
import Plugin from '../util/plugin';
import {
  PluginEvent,
  INTERCEPT_ACTION,
  INTERCEPT_EFFECT,
} from '../util/constant';
export interface Models {
  [namespace: string]: Model;
}
export declare type OnError = (e: Error) => void;
export declare type OnAction = (action: AnyAction) => void;
export interface OnReducerOption {
  namespace: string;
  [propName: string]: any;
}
export declare type OnReducer = (
  reducer: Reducer<any, AnyAction>,
  option: OnReducerOption,
) => Reducer<any, AnyAction>;
export declare type OnSetup = (operator: GlobalOperator) => void;
export interface State {
  [namespace: string]: any;
}
export interface Option {
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
export declare type PluginCreator = (
  plugin: Plugin,
  option: PluginCreatorOption,
) => void;
export interface InterceptOption {
  store: Store<GlobalState>;
  NAMESPACE_DIVIDER: string;
}
export declare type ActionIntercept = (
  action: AnyAction,
  option: InterceptOption,
) => void | AnyAction;
export declare type EffectIntercept = (
  action: AnyAction,
  option: InterceptOption,
) => Promise<void> | Promise<AnyAction>;
export interface Intercepts {
  [INTERCEPT_ACTION]: ActionIntercept[];
  [INTERCEPT_EFFECT]: EffectIntercept[];
}
declare class Zoro {
  private initState;
  private models;
  private modelOptions;
  private middlewares;
  private enhancers;
  private isSetup;
  private plugin;
  private store;
  private intercepts;
  onError?: OnError;
  onEffect?: OnAction;
  onAction?: OnAction;
  onReducer?: OnReducer;
  onSetup?: OnSetup;
  constructor(option?: Option);
  private getRootReducer;
  private getInitState;
  private replaceReducer;
  private createModel;
  private createModels;
  private injectPluginMiddlewares;
  private injectPluginEnhancers;
  private injectPluginModels;
  private createStore;
  private setupModel;
  getPlugin(): Plugin;
  getStore(): Store<GlobalState>;
  getIntercepts(type: string): ActionIntercept[] | EffectIntercept[];
  getModel(namespace: string): Model;
  getModelEffects(namespace: string): ModelEffects;
  setModel(modelOption: ModelOption): void;
  setModels(modelOptions: ModelOption[]): void;
  setIntercept(
    type: string,
    intercept: ActionIntercept | EffectIntercept,
  ): void;
  usePlugin(pluginCreator: PluginCreator): void;
  start(setup?: boolean): Store<GlobalState>;
  setup(): void;
}
export default Zoro;
