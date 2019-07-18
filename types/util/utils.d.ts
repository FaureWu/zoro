import { ActionType as ModelActionType } from '../core/model';
export declare function noop(): void;
declare type ValidateFunc = () => boolean;
export declare function assert(
  validate: boolean | ValidateFunc,
  message: string,
): void;
export declare function isReduxAction(action: any): boolean;
export declare function parseModelActionType(
  actionType: string,
): ModelActionType;
export declare function uuid(): string;
export {};
