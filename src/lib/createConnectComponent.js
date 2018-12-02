import { isFunction, isShallowInclude, assert, isObject } from './util'

function defaultMapToProps() {
  return {}
}

export default function(store) {
  return function(mapStateToProps, mapDispatchToProps) {
    const shouldMapStateToProps = isFunction(mapStateToProps)
    const shouldMapDispatchToProps = isFunction(mapDispatchToProps)

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
        if (isShallowInclude(this.data, mappedState)) return null

        this.setData(mappedState)
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

      const componentConfig = {
        ...config,
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
