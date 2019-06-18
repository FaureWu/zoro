import { assert, isFunction, getConnectStoreData, diff, uuid } from './lib/util'
import createConnectComponent from './lib/createConnectComponent'
import { PLUGIN_EVENT } from './lib/constant'

function isReduxStore(store) {
  return ['subscribe', 'dispatch', 'getState'].every(method =>
    store.hasOwnProperty(method),
  )
}

let _store = null
let _app = null

export const setStore = function(store, app) {
  assert(
    isReduxStore(store),
    'the store you provider not a standrand redux store',
  )

  _store = store
  _app = app
}

function defaultMapToProps() {
  return {}
}

export const connect = function(mapStateToProps, mapDispatchToProps) {
  const shouldMapStateToProps = isFunction(mapStateToProps)
  const shouldMapDispatchToProps = isFunction(mapDispatchToProps)

  return config => {
    const mapState = shouldMapStateToProps ? mapStateToProps : defaultMapToProps
    const mapDispatch = shouldMapDispatchToProps
      ? mapDispatchToProps
      : defaultMapToProps

    let unsubscribe = null
    let ready = false

    function subscribe(options) {
      if (!isFunction(unsubscribe)) return null

      const mappedState = mapState(_store.getState(), options)
      const currentState = getConnectStoreData(mappedState, this.data)
      const { data, empty } = diff(currentState, mappedState)
      if (empty) return null

      const key = uuid()
      if (_app.zoro) {
        _app.zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_CONNECT, _store, {
          key,
          name: this.route,
          currentData: currentState,
          nextData: mappedState,
        })
      }

      this.setData(data, () => {
        if (_app.zoro) {
          _app.zoro.plugin.emit(PLUGIN_EVENT.ON_DID_CONNECT, _store, {
            key,
            name: this.route,
          })
        }
      })
    }

    function onLoad(options) {
      assert(_store !== null, 'we should call setStore before the connect')

      if (shouldMapStateToProps) {
        unsubscribe = _store.subscribe(subscribe.bind(this, options))
        subscribe.call(this, options)
      }

      if (isFunction(config.onLoad)) {
        config.onLoad.call(this, options)
      }

      ready = true
    }

    function onShow() {
      if (ready && !isFunction(unsubscribe) && shouldMapStateToProps) {
        unsubscribe = _store.subscribe(subscribe.bind(this))
        subscribe.call(this)
      }

      if (isFunction(config.onShow)) {
        config.onShow.call(this)
      }
    }

    function onUnload() {
      if (isFunction(config.onUnload)) {
        config.onUnload.call(this)
      }

      if (isFunction(unsubscribe)) {
        unsubscribe()
        unsubscribe = null
      }
    }

    function onHide() {
      if (isFunction(config.onHide)) {
        config.onHide.call(this)
      }

      if (isFunction(unsubscribe)) {
        unsubscribe()
        unsubscribe = null
      }
    }

    return {
      ...config,
      ...mapDispatch(_store.dispatch),
      onLoad,
      onUnload,
      onShow,
      onHide,
    }
  }
}

export const connectComponent = function(mapStateToProps, mapDispatchToProps) {
  return createConnectComponent(_store)(mapStateToProps, mapDispatchToProps)
}
