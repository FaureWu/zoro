import { AnyAction, Reducer } from 'redux';
export declare type CustomReducer = (action: AnyAction, state: any) => any;
export interface CustomReducers {
  [propName: string]: CustomReducer;
}
export default function createReducer(
  initialState?: any,
  handlers?: CustomReducers,
): Reducer<any, AnyAction>;
