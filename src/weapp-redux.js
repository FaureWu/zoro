import { assert, isFunction, getConnectStoreData } from './lib/util'
import diff from './lib/diff'
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

    function subscribe(options) {
      if (!isFunction(unsubscribe)) return null

      const mappedState = mapState(_store.getState(), options)
      const differents = diff(
        mappedState,
        getConnectStoreData(this.data, mappedState),
      )

      if (Object.keys(differents).length > 0) {
        this.setData(differents)
      }
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
    }

    function onUnload() {
      if (isFunction(config.onUnload)) {
        config.onUnload.call()
      }

      if (isFunction(unsubscribe)) {
        unsubscribe()
        unsubscribe = null
      }
    }

    return {
      ...config,
      ...mapDispatch,
      onLoad,
      onUnload,
    }
  }
}

export const connectComponent = function(componentConfig) {
  return createConnectComponent(_store)(componentConfig)
}
