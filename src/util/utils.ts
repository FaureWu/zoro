import { NAMESPACE_DIVIDER } from '../util/constant';
import { ActionType as ModelActionType } from '../core/model';

export function noop(): void {}

type ValidateFunc = () => boolean;

export function assert(
  validate: boolean | ValidateFunc,
  message: string,
): void {
  if (
    (typeof validate === 'boolean' && !validate) ||
    (typeof validate === 'function' && !validate())
  ) {
    throw new Error(message);
  }
}

export function isReduxAction(action: any): boolean {
  return typeof action === 'object' && action !== null && !!action.type;
}

export function parseModelActionType(actionType: string): ModelActionType {
  const parts: string[] = actionType.split(NAMESPACE_DIVIDER);
  assert(parts.length < 2, `invalid model action type, [${actionType}]`);

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
