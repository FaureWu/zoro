import {
  isFunction,
  putCreator,
  selectCreator,
  splitType,
  assert,
  isAction,
  isUndefined,
  uuid,
} from './util'
import {
  PLUGIN_EVENT,
  INTERCEPT_ACTION,
  INTERCEPT_EFFECT,
  NAMESPACE_DIVIDER,
} from './constant'

async function doneEffectIntercepts(intercepts, action, options) {
  const asyncIntercepts = intercepts.slice(0)
  let resolveAction
  async function doneEffectIntercept() {
    const asyncIntercept = asyncIntercepts.shift()
    resolveAction = await asyncIntercept(resolveAction || action, options)

    assert(
      isUndefined(resolveAction) || isAction(resolveAction),
      'the effect intercept return must be an action or none',
    )

    if (asyncIntercepts.length > 0) {
      await doneEffectIntercept()
    }
  }
  await doneEffectIntercept()

  return resolveAction
}

async function doneEffect(zoro, action, effect) {
  const { store, handleEffect, handleIntercepts, handleError } = zoro

  const key = uuid()
  zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_EFFECT, action, store, { key })
  handleEffect(action)
  const effectIntercepts = handleIntercepts[INTERCEPT_EFFECT] || []
  const resolveAction = await doneEffectIntercepts(effectIntercepts, action, {
    store,
    NAMESPACE_DIVIDER,
  })

  const targetAction = { ...action, ...resolveAction, type: action.type }
  const { namespace } = splitType(action.type)

  try {
    const result = await effect(targetAction, {
      selectAll: selectCreator(store),
      select: selectCreator(store, namespace),
      put: putCreator(store, namespace),
    })
    return Promise.resolve(result)
  } catch (e) {
    handleError(e)
    zoro.plugin.emit(PLUGIN_EVENT.ON_ERROR, e, action, store)

    return Promise.reject(e)
  } finally {
    zoro.plugin.emit(PLUGIN_EVENT.ON_DID_EFFECT, action, store, { key })
  }
}

function doneActionIntercepts(intercepts, action, options) {
  return intercepts.reduce((resolveAction, actionIntercept) => {
    const newResolveAction = actionIntercept(resolveAction, options)
    assert(
      isUndefined(newResolveAction) || isAction(newResolveAction),
      'the action intercept return must be an action or none',
    )
    return newResolveAction || resolveAction
  }, action)
}

export default function(zoro) {
  return ({ dispatch }) => next => action => {
    const { store, handleAction, handleIntercepts, effects } = zoro

    const { type } = action
    const handler = effects[type]
    if (isFunction(handler)) {
      return doneEffect(zoro, action, handler)
    }
    const key = uuid()
    zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_ACTION, action, store, { key })
    handleAction(action)

    const actionIntercepts = handleIntercepts[INTERCEPT_ACTION] || []
    const resolveAction = doneActionIntercepts(actionIntercepts, action, {
      store,
      NAMESPACE_DIVIDER,
    })

    const targetAction = { ...action, ...resolveAction, type }
    zoro.plugin.emit(PLUGIN_EVENT.ON_DID_ACTION, targetAction, store, { key })

    return next(targetAction)
  }
}
