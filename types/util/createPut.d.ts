import { Store, AnyAction } from 'redux';
export declare type Put = (action: AnyAction) => AnyAction | Promise<any>;
export default function createPut(store: Store, namespace?: string): Put;
