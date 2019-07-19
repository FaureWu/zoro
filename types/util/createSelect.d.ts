import { Store } from 'redux';
import { GlobalState } from '../core/store';
export declare type SelectCallBack = (state: any) => any;
export declare type Select = (handler?: SelectCallBack) => any;
export default function createSelect(
  store: Store<GlobalState>,
  namespace?: string,
): Select;
