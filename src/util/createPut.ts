import { Store, Dispatch, AnyAction } from 'redux';
import { NAMESPACE_DIVIDER } from './constant';
import { assert, isReduxAction } from './utils';

export default function createPut(store: Store, namespace?: string): Dispatch {
  if (!namespace) {
    return store.dispatch;
  }

  return function put(action: AnyAction = {}): AnyAction {
    assert(
      isReduxAction(action),
      'the dispatch action must be an redux action',
    );

    const { type, ...rest } = action;
    const params = type.split(NAMESPACE_DIVIDER);
    if (params.length >= 2) {
      const currentNamespace = params
        .slice(0, params.length - 1)
        .join(NAMESPACE_DIVIDER);

      if (currentNamespace === namespace) {
        console.warn(
          `when dispatch it's own model action, the namespace can be omit, [${type}]`,
        );
      }

      return store.dispatch({ type, ...rest });
    }

    return store.dispatch({
      type: `${namespace}${NAMESPACE_DIVIDER}${type}`,
      ...rest,
    });
  };
}
