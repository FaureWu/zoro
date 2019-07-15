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

export function noop(): void {}
