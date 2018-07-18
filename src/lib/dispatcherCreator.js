import { assert } from './util'

const actionCache = {}

export default function(namespace, model, zoro) {
  if (actionCache[namespace]) return actionCache[namespace]

  if (!actionCache[namespace]) {
    const actions = model.getActions()

    actionCache[namespace] = Object.keys(actions).reduce(function(
      dispatcher,
      name,
    ) {
      return {
        ...dispatcher,
        [name]: function(...rest) {
          assert(!!zoro.store, `dispatch action must be call after app.start()`)
          return zoro.store.dispatch(actions[name](...rest))
        },
      }
    })
  }

  return actionCache[namespace]
}
