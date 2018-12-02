import { assert, isFunction, isShallowInclude } from './lib/util'
import createConnectComponent from './lib/createConnectComponent'

function isReduxStore(store) {
  return ['subscribe', 'dispatch', 'getState'].every(method =>
    store.hasOwnProperty(method),
  )
}

let _store = null

export const setStore = function(store) {
  assert(
    isReduxStore(store),
    'the store you provider not a standrand redux store',
  )

  _store = store
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
      if (isShallowInclude(this.data, mappedState)) return null

      this.setData(mappedState)
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
