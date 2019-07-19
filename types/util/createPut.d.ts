import { Store, AnyAction } from 'redux';
import { GlobalState } from '../core/store';
export declare type Put = (action: AnyAction) => AnyAction | Promise<any>;
export default function createPut(
  store: Store<GlobalState>,
  namespace?: string,
): Put;
