import { Middleware, Dispatch, AnyAction } from 'redux';
import Zoro, { Intercept, InterceptOption } from './zoro';
import { ActionType as ModelActionType, Effect as ModelEffect } from './model';
import createSelect from '../util/createSelect';
import createPut from '../util/createPut';
import {
  parseModelActionType,
  uuid,
  assert,
  isReduxAction,
} from '../util/utils';
import {
  PLUGIN_EVENT,
  INTERCEPT_ACTION,
  INTERCEPT_EFFECT,
  NAMESPACE_DIVIDER,
} from '../util/constant';

type Handler2 = (action: AnyAction) => AnyAction | Promise<any>;

type Handler1 = (next: Dispatch<AnyAction>) => Handler2;

async function doneEffectIntercepts(
  intercepts: Intercept[],
  action: AnyAction,
  option: InterceptOption,
): Promise<AnyAction> {
  if (intercepts.length <= 0) return action;

  const effectIntercepts: Intercept[] = intercepts.slice(0);
  async function doneEffectIntercept(prevAction: AnyAction): void {
    const effectIntercept = effectIntercepts.shift();
    let nextAction = prevAction;
    const resolveAction = await effectIntercept(prevAction, option);

    if (typeof resolveAction !== 'undefined') {
      assert(
        isReduxAction(resolveAction),
        'the effect intercept return must be an action or none',
      );

      resolveAction.type = action.type;
      nextAction = resolveAction;
    }

    if (effectIntercepts.length > 0) {
      const resultAction = await doneEffectIntercept(nextAction);
      return resultAction;
    }

    return nextAction;
  }

  const resultAction = await doneEffectIntercept();

  return resultAction;
}

async function doneEffect(
  effect: ModelEffect,
  action: AnyAction,
  zoro: Zoro,
): Promise<any> {
  const effectId = uuid();
  const plugin = zoro.getPlugin();
  const store = zoro.getStore();

  plugin.emit(PLUGIN_EVENT.ON_WILL_EFFECT, action, { store, effectId });

  if (typeof zoro.onEffect === 'function') {
    zoro.onEffect(action);
  }

  const effectIntercepts = zoro.getIntercepts(INTERCEPT_EFFECT);
  const nextAction = await doneEffectIntercepts(effectIntercepts, action, {
    store,
    NAMESPACE_DIVIDER,
  });

  const { namespace }: ModelActionType = parseModelActionType(nextAction.type);

  try {
    const result = await effect(nextAction, {
      selectAll: createSelect(store),
      select: createSelect(store, namespace),
      put: createPut(store, namespace),
    });

    return Promise.resolve(result);
  } catch (e) {
    if (typeof zoro.onError === 'function') {
      zoro.onError(e);
    }

    plugin.emit(PLUGIN_EVENT.ON_ERROR, e);

    return Promise.reject(e);
  } finally {
    plugin.emit(PLUGIN_EVENT.ON_DID_EFFECT, action, { store, effectId });
  }
}

function doneActionIntercepts(
  intercepts: Intercept[],
  action: AnyAction,
  option: InterceptOption,
): AnyAction {
  if (intercepts.length <= 0) return action;

  return intercepts.reduce(
    (nextAction: AnyAction, intercept: Intercept): AnyAction => {
      const resolveAction = intercept(nextAction, option);

      if (typeof resolveAction !== 'undefined') {
        assert(
          isReduxAction(resolveAction),
          'the action intercept return must be an action or none',
        );

        return resolveAction;
      }

      return nextAction;
    },
    action,
  );
}

export default function effectMiddlewareCreator(zoro: Zoro): Middleware {
  return (): Handler1 => (next: Dispatch<AnyAction>): Handler2 => (
    action: AnyAction,
  ): AnyAction | Promise<any> => {
    const { namespace }: ModelActionType = parseModelActionType(action.type);
    const effects = zoro.getModelEffects(namespace);
    const effect = effects[action.type];

    if (typeof effect === 'function') {
      return doneEffect(effect, action, zoro);
    }

    const store = zoro.getStore();
    const plugin = zoro.getPlugin();
    const actionId = uuid();
    plugin.emit(PLUGIN_EVENT.ON_WILL_ACTION, action, {
      store,
      actionId,
    });

    if (typeof zoro.onAction === 'function') {
      zoro.onAction(action);
    }

    const actionIntercepts = zoro.getIntercepts(INTERCEPT_ACTION);
    const nextAction = doneActionIntercepts(actionIntercepts, action, {
      store,
      NAMESPACE_DIVIDER,
    });

    plugin.emit(PLUGIN_EVENT.ON_DID_ACTION, nextAction, {
      store,
      actionId,
    });

    return next(nextAction);
  };
}
