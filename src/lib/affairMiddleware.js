import { isFunction, assert, warn } from './util'
import { NAMESPACE_DIVIDER } from './constant'

let _zoro

function selectCreator(namespace) {
  return _zoro.store.getState()[namespace]
}

function putCreator(namespace, dispatch) {
  return function({ type, ...rest }) {
    assert(
      !!type,
      'the action you dispatch is not a correct format, we need a type property',
    )
    const [_namespace] = type.split(NAMESPACE_DIVIDER)
    if (_namespace === namespace) {
      warn(
        false,
        `we don't need the dispatch with namespace, if you call in the model, [${type}]`,
      )
    } else {
      type = `${namespace}${NAMESPACE_DIVIDER}${type}`
    }

    return dispatch({ type, ...rest })
  }
}

const middleware = ({ dispatch }) => next => async action => {
  const { type } = action
  const handler = _zoro.getAffairs()[type]
  if (isFunction(handler)) {
    try {
      const [namespace] = type.split(NAMESPACE_DIVIDER)
      const result = await handler(action, {
        select: selectCreator(namespace),
        put: putCreator(namespace, dispatch),
      })
      _zoro.handleAffair(action)
      return result
    } catch (e) {
      _zoro.handleError(e)
      throw e
    }
  }

  return next(action)
}

export default zoro => {
  _zoro = zoro
  return middleware
}
