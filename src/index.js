import 'regenerator-runtime/runtime'
import Zoro from './lib/zoro'
import { assert } from './lib/util'

let _zoro
function App(zoro) {
  _zoro = zoro
}

App.prototype.model = function(models) {
  if (models instanceof Array) {
    _zoro.injectModels.call(_zoro, models)

    return this
  }

  _zoro.injectModels.call(_zoro, [models])
  return this
}

App.prototype.use = function(plugins) {
  if (typeof plugins === 'function') {
    _zoro.use.call(_zoro, plugins)

    return this
  }

  assert(
    plugins instanceof Array,
    `the use param must be a function or a plugin Array, but we get ${typeof plugins}`,
  )

  plugins.forEach(plugin => _zoro.use.call(_zoro, plugin))

  return this
}

App.prototype.start = function(setup = true) {
  const store = _zoro.start.call(_zoro, setup)
  this.store = store

  return store
}

App.prototype.setup = function() {
  _zoro.setup.call(_zoro)
}

export const actions = function(namespace) {
  const models = _zoro.models
  assert(!!models[namespace], `the ${namespace} model not define`)
  return models[namespace].getActions()
}

export default (opts = {}) => new App(new Zoro(opts))
