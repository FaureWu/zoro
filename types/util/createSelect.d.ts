import { Store } from 'redux';
export declare type SelectCallBack = (state: any) => any;
export declare type Select = (handler?: SelectCallBack) => any;
export default function createSelect(store: Store, namespace?: string): Select;
