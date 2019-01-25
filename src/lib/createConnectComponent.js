import {
  isFunction,
  assert,
  isObject,
  uuid,
  getConnectStoreData,
  diff,
} from './util'
import { PLUGIN_EVENT } from './constant'
import connectObserver from './connectObserver'

function defaultMapToProps() {
  return {}
}

export default function(store, zoro) {
  return function(mapStateToProps, mapDispatchToProps) {
    const shouldMapStateToProps = isFunction(mapStateToProps)
    const shouldMapDispatchToProps = isFunction(mapDispatchToProps)

    if (!shouldMapStateToProps && !shouldMapDispatchToProps) {
      return connectObserver
    }

    return config => {
      const mapState = shouldMapStateToProps
        ? mapStateToProps
        : defaultMapToProps
      const mapDispatch = shouldMapDispatchToProps
        ? mapDispatchToProps
        : defaultMapToProps

      let unsubscribe = null
      let ready = false

      function subscribe() {
        if (!isFunction(unsubscribe)) return null

        const mappedState = mapState(store.getState())
        const currentState = getConnectStoreData(mappedState, this.data)

        const { data, empty } = diff(currentState, mappedState)
        if (empty) return null

        const key = uuid()
        zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_CONNECT, store, {
          key,
          name: this.is,
          currentData: currentState,
          nextData: mappedState,
        })

        this.setData(data, () => {
          zoro.plugin.emit(PLUGIN_EVENT.ON_DID_CONNECT, store, {
            key,
            name: this.is,
          })
        })
      }

      function attached() {
        assert(
          store !== null,
          'we should call app.start() before the connectComponent',
        )

        if (shouldMapStateToProps) {
          unsubscribe = store.subscribe(subscribe.bind(this))
          subscribe.call(this)
        }

        if (
          isObject(config.lifetimes) &&
          isFunction(config.lifetimes.attached)
        ) {
          config.lifetimes.attached.call(this)
        } else if (isFunction(config.attached)) {
          config.attached.call(this)
        }

        ready = true
      }

      function hide() {
        if (
          isObject(config.pageLifetimes) &&
          isFunction(config.pageLifetimes.hide)
        ) {
          config.pageLifetimes.hide.call(this)
        }

        if (isFunction(unsubscribe)) {
          unsubscribe()
          unsubscribe = null
        }
      }

      function detached() {
        if (
          isObject(config.lifetimes) &&
          isFunction(config.lifetimes.detached)
        ) {
          config.lifetimes.detached.call(this)
        } else if (isFunction(config.detached)) {
          config.detached.call(this)
        }

        if (isFunction(unsubscribe)) {
          unsubscribe()
          unsubscribe = null
        }
      }

      function show() {
        if (ready && !isFunction(unsubscribe) && shouldMapStateToProps) {
          unsubscribe = store.subscribe(subscribe.bind(this))
          subscribe.call(this)
        }

        if (
          isObject(config.pageLifetimes) &&
          isFunction(config.pageLifetimes.show)
        ) {
          config.pageLifetimes.show.call(this)
        }
      }

      const result = connectObserver(config, mapState(store.getState()))

      const componentConfig = {
        ...result,
        pageLifetimes: { ...config.pageLifetimes },
        lifetimes: { ...config.lifetimes },
        methods: { ...config.methods, ...mapDispatch(store.dispatch) },
      }

      if (isObject(config.lifetimes)) {
        componentConfig.lifetimes.attached = attached
      } else {
        componentConfig.attached = attached
      }

      if (isObject(config.lifetimes)) {
        componentConfig.lifetimes.detached = detached
      } else {
        componentConfig.detached = detached
      }

      if (!isObject(config.pageLifetimes)) {
        componentConfig.pageLifetimes = {}
      }
      componentConfig.pageLifetimes.hide = hide
      componentConfig.pageLifetimes.show = show

      return componentConfig
    }
  }
}
