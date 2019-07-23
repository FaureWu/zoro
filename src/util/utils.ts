import * as Z from '../zoro';
import { NAMESPACE_DIVIDER } from '../util/constant';

export function noop(): void {}

export function assert(
  validate: boolean | Z.AssertValidate,
  message: string,
): void {
  if (
    (typeof validate === 'boolean' && !validate) ||
    (typeof validate === 'function' && !validate())
  ) {
    throw new Error(message);
  }
}

export function isObject(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && !(obj instanceof Array);
}

export function isReduxAction(action: any): boolean {
  return typeof action === 'object' && action !== null && !!action.type;
}

export function isReduxStore(store: any): boolean {
  return (
    isObject(store) &&
    typeof store.dispatch === 'function' &&
    typeof store.getState === 'function' &&
    typeof store.subscribe === 'function'
  );
}

export function parseModelActionType(actionType: string): Z.ModelType {
  const parts: string[] = actionType.split(NAMESPACE_DIVIDER);
  assert(parts.length >= 2, `invalid model action type, [${actionType}]`);

  return {
    namespace: parts.slice(0, parts.length - 1).join(NAMESPACE_DIVIDER),
    type: parts[parts.length - 1],
  };
}

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (placeholder: string): string => {
      const random = Math.floor(Math.random() * 16);
      const value = placeholder === 'x' ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    },
  );
}

export function getConnectStoreData(current: object, pre: object): object {
  const childks = Object.keys(current);

  return childks.reduce(
    (result: object, key: string): object => ({
      ...result,
      [key]: pre[key],
    }),
    {},
  );
}

export function diff(current: object, next: object): object | undefined {
  let empty = true;
  const data = Object.keys(current).reduce(
    (result: object, key: string): object => {
      if (current[key] === next[key]) {
        return result;
      }

      empty = false;
      result[key] = next[key];
      return result;
    },
    {},
  );

  if (empty) return;

  return data;
}
