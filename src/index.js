import 'babel-polyfill'
import Zoro from './lib/zoro'
import { assert } from './lib/util'

let _zoro
function App(zoro) {
  _zoro = zoro
}

App.prototype.model = function() {
  _zoro.model.apply(_zoro, arguments)
  return this
}

App.prototype.models = function() {
  _zoro.models.apply(_zoro, arguments)
  return this
}

App.prototype.middleware = function() {
  _zoro.middleware.apply(_zoro, arguments)
  return this
}

App.prototype.middlewares = function() {
  _zoro.middlewares.apply(_zoro, arguments)
  return this
}

App.prototype.start = function() {
  const result = _zoro.start.apply(_zoro, arguments)
  this.store = _zoro.store
  return result
}

export const actions = function(namespace) {
  const models = _zoro.models
  assert(!!models[namespace], `the ${namespace} model not define`)
  return models[namespace]
}

export default opts => new App(new Zoro(opts))
