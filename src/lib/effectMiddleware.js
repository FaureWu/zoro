import {
  isFunction,
  putCreator,
  selectCreator,
  splitType,
  noop,
  assert,
  isAction,
  isUndefined,
} from './util'
import {
  PLUGIN_EVENT,
  INTERCEPT_ACTION,
  INTERCEPT_EFFECT,
  NAMESPACE_DIVIDER,
} from './constant'

let _zoro

const middleware = ({ dispatch }) => next => async action => {
  const { type } = action
  const handler = _zoro.getEffects()[type]
  if (isFunction(handler)) {
    try {
      _zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_EFFECT, action, _zoro.store)
      await _zoro.handleEffect.apply(undefined, [action])
      const effectIntercept = _zoro.handleIntercepts[INTERCEPT_EFFECT] || noop
      const resolveAction = await effectIntercept(action, {
        store: _zoro.store,
        NAMESPACE_DIVIDER,
      })

      assert(
        isUndefined(resolveAction) || isAction(resolveAction),
        'the effect intercept return must be an action or none',
      )

      const targetAction = { ...action, ...resolveAction, type }
      const { namespace } = splitType(type)
      const result = await handler(targetAction, {
        selectAll: selectCreator(_zoro.store),
        select: selectCreator(_zoro.store, namespace),
        put: putCreator(_zoro.store, namespace),
      })
      return Promise.resolve(result)
    } catch (e) {
      _zoro.plugin.emit(PLUGIN_EVENT.ON_ERROR, e, action, _zoro.store)
      _zoro.handleError.apply(undefined, [e])
      return Promise.reject(e)
    } finally {
      _zoro.plugin.emit(PLUGIN_EVENT.ON_DID_EFFECT, action, _zoro.store)
    }
  }
  _zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_ACTION, action, _zoro.store)
  _zoro.handleAction.apply(undefined, [action])

  const actionIntercept = _zoro.handleIntercepts[INTERCEPT_ACTION] || noop
  const resolveAction = actionIntercept(action, {
    store: _zoro.store,
    NAMESPACE_DIVIDER,
  })

  assert(
    isUndefined(resolveAction) || isAction(resolveAction),
    'the action intercept return must be an action or none',
  )

  const targetAction = { ...action, ...resolveAction, type }
  _zoro.plugin.emit(PLUGIN_EVENT.ON_DID_ACTION, targetAction, _zoro.store)

  return next(targetAction)
}

export default zoro => {
  _zoro = zoro
  return middleware
}
