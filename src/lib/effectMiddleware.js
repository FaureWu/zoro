import { isFunction, putCreator, selectCreator, splitType } from './util'
import { PLUGIN_EVENT } from './constant'

let _zoro

const middleware = ({ dispatch }) => next => async action => {
  _zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_ACTION, action, _zoro.store)
  _zoro.handleAction.apply(undefined, [action])
  const { type } = action
  const handler = _zoro.getEffects()[type]
  if (isFunction(handler)) {
    try {
      _zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_EFFECT, action, _zoro.store)
      await _zoro.handleEffect.apply(undefined, [action])
      const { namespace } = splitType(type)
      const result = await handler(action, {
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
      _zoro.plugin.emit(PLUGIN_EVENT.ON_DID_ACTION, action, _zoro.store)
      _zoro.plugin.emit(PLUGIN_EVENT.ON_DID_EFFECT, action, _zoro.store)
    }
  }
  _zoro.plugin.emit(PLUGIN_EVENT.ON_DID_ACTION, action, _zoro.store)

  return next(action)
}

export default zoro => {
  _zoro = zoro
  return middleware
}
