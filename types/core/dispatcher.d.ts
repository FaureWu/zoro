import { AnyAction } from 'redux';
import Zoro from './zoro';
export declare type CustomDispatch = (
  payload?: any,
  meta?: any,
  error?: boolean,
) => AnyAction;
export interface CustomDispatchs {
  [type: string]: CustomDispatch;
}
declare let dispatcher: {};
export declare function defineDispatcher(zoro: Zoro): void;
export default dispatcher;
