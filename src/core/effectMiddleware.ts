import * as Redux from 'redux';
import * as Z from '../zoro';
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

async function doneEffectIntercepts(
  intercepts: Z.EffectIntercept[],
  action: Z.Action,
  option: Z.InterceptOption,
): Promise<Z.Action> {
  if (intercepts.length <= 0) return action;

  const effectIntercepts: Z.EffectIntercept[] = intercepts.slice(0);
  async function doneEffectIntercept(prevAction: Z.Action): Promise<Z.Action> {
    const effectIntercept = effectIntercepts.shift();
    let nextAction = prevAction;
    // @ts-ignore
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

  const resultAction = await doneEffectIntercept(action);

  return resultAction;
}

async function doneEffect(
  effect: Z.ModelEffect,
  action: Z.Action,
  zoro: Z.Zoro,
): Promise<any> {
  const effectId = uuid();
  const plugin = zoro.getPlugin();
  const store = zoro.getStore();

  plugin.emit(PLUGIN_EVENT.ON_WILL_EFFECT, action, { store, effectId });

  if (typeof zoro.onEffect === 'function') {
    zoro.onEffect(action);
  }

  const effectIntercepts = zoro.getIntercepts(INTERCEPT_EFFECT);
  const nextAction = await doneEffectIntercepts(
    effectIntercepts as Z.EffectIntercept[],
    action,
    {
      store,
      NAMESPACE_DIVIDER,
    },
  );

  const { namespace }: Z.ModelType = parseModelActionType(nextAction.type);

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
  intercepts: Z.ActionIntercept[],
  action: Z.Action,
  option: Z.InterceptOption,
): Z.Action {
  if (intercepts.length <= 0) return action;

  return intercepts.reduce(
    (nextAction: Z.Action, intercept: Z.ActionIntercept): Z.Action => {
      const resolveAction = intercept(nextAction, option);

      if (typeof resolveAction !== 'undefined') {
        assert(
          isReduxAction(resolveAction),
          'the action intercept return must be an action or none',
        );

        return resolveAction as Z.Action;
      }

      return nextAction;
    },
    action,
  );
}

export default function effectMiddlewareCreator(
  zoro: Z.Zoro,
): Redux.Middleware {
  return (): Z.MiddlewareHandlerLv1 => (
    next: Redux.Dispatch<Z.Action>,
  ): Z.MiddlewareHandlerLv2 => (action: Z.Action): Z.Action | Promise<any> => {
    const { namespace }: Z.ModelType = parseModelActionType(action.type);
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
    const nextAction = doneActionIntercepts(
      actionIntercepts as Z.ActionIntercept[],
      action,
      {
        store,
        NAMESPACE_DIVIDER,
      },
    );

    plugin.emit(PLUGIN_EVENT.ON_DID_ACTION, nextAction, {
      store,
      actionId,
    });

    return next(nextAction);
  };
}
