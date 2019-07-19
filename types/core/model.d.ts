import { Reducer, AnyAction } from 'redux';
import { Select } from '../util/createSelect';
import { Put } from '../util/createPut';
import { CustomReducers } from '../util/createReducer';
export interface ActionType {
  namespace: string;
  type: string;
}
export interface Operator {
  selectAll: Select;
  select: Select;
  put: Put;
}
export interface GlobalOperator {
  select: Select;
  put: Put;
}
export declare type Effect = (
  action: AnyAction,
  operator: Operator,
) => void | Promise<any>;
export interface Effects {
  [propName: string]: Effect;
}
export declare type ActionCreator = (
  payload?: any,
  meta?: any,
  error?: boolean,
) => AnyAction;
export interface ActionCreators {
  [propName: string]: ActionCreator;
}
export declare type Setup = (operator: Operator) => void;
export interface Option {
  namespace: string;
  state?: any;
  reducers?: CustomReducers;
  effects?: Effects;
  setup?: Setup;
}
declare class Model {
  private namespace;
  private initState;
  private reducer;
  private effects;
  private actionCreators;
  private setup;
  private createReducer;
  private createEffects;
  private createActionCreators;
  constructor(options: Option);
  getNamespace(): string;
  getInitState(): any;
  getReducer(): Reducer<any, AnyAction>;
  getEffects(): Effects;
  getActionCreators(): ActionCreators;
  getSetup(): Setup | undefined;
}
export default Model;
