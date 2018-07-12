import { isObject, isArray, noop } from '../util'

let extendModel = {}

function extendModelPlugin(event, { DIVIDER, PLUGIN_EVENT }) {
  const {
    state = {},
    reducers = {},
    effects = {},
    excludeModels,
    includeModels,
  } = extendModel

  event.on(PLUGIN_EVENT.BEFORE_INJECT_MODEL, function(modelOpts) {
    const { namespace } = modelOpts

    if (!namespace) return modelOpts

    if (isArray(includeModels)) {
      if (includeModels.indexOf(namespace) === -1) return modelOpts
    } else if (isArray(excludeModels) && excludeModels.indexOf(namespace) !== -1) return modelOpts

    return {
      ...modelOpts,
      state: { ...state, ...modelOpts.state },
      reducers: { ...reducers, ...modelOpts.reducers },
      effects: { ...effects, ...modelOpts.effects },
    }
  })
}

export default opts => {
  if (!isObject(opts)) return noop

  extendModel = opts

  return extendModelPlugin
}
