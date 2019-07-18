import { Middleware, StoreEnhancer, AnyAction, Reducer, Store } from 'redux';
import Model, {
  Option as ModelOption,
  Operator as ModelOperator,
  Effects as ModelEffects,
} from './model';
import Plugin from '../util/plugin';
import { PluginEvent } from '../util/constant';
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
export declare type OnSetup = (operator: ModelOperator) => void;
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
  store: Store;
  NAMESPACE_DIVIDER: string;
}
export declare type Intercept = (
  action: AnyAction,
  option: InterceptOption,
) => void | AnyAction | Promise<AnyAction> | Promise<void>;
export interface Intercepts {
  [type: string]: Intercept[];
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
  constructor(option: Option);
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
  getStore(): Store;
  getIntercepts(type: string): Intercept[];
  getModel(namespace: string): Model;
  getModelEffects(namespace: string): ModelEffects;
  setModel(modelOption: ModelOption): void;
  setModels(modelOptions: ModelOption[]): void;
  setIntercept(type: string, intercept: Intercept): void;
  usePlugin(pluginCreator: PluginCreator): void;
  start(setup?: boolean): Store;
  setup(): void;
}
export default Zoro;
