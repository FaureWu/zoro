function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var isArray = function isArray(arr) {
  return arr instanceof Array;
};
var isObject = function isObject(obj) {
  return obj !== null && typeof obj === 'object' && !isArray(obj);
};
var isBoolean = function isBoolean(bool) {
  return typeof bool === 'boolean';
};
var isFunction = function isFunction(func) {
  return typeof func === 'function';
};
var assert = function assert(validate, message) {
  if (isBoolean(validate) && !validate || isFunction(validate) && !validate()) {
    throw new Error(message);
  }
};
function isShallowInclude(parent, child) {
  var childks = Object.keys(child);
  return childks.every(function (k) {
    return parent.hasOwnProperty(k) && parent[k] === child[k];
  });
}

function defaultMapToProps() {
  return {};
}

function createConnectComponent (store) {
  return function (mapStateToProps, mapDispatchToProps) {
    var shouldMapStateToProps = isFunction(mapStateToProps);
    var shouldMapDispatchToProps = isFunction(mapDispatchToProps);
    return function (config) {
      var mapState = shouldMapStateToProps ? mapStateToProps : defaultMapToProps;
      var mapDispatch = shouldMapDispatchToProps ? mapDispatchToProps : defaultMapToProps;
      var unsubscribe = null;
      var ready = false;

      function subscribe() {
        if (!isFunction(unsubscribe)) return null;
        var mappedState = mapState(store.getState());
        if (isShallowInclude(this.data, mappedState)) return null;
        this.setData(mappedState);
      }

      function attached() {
        assert(store !== null, 'we should call app.start() before the connectComponent');

        if (shouldMapStateToProps) {
          unsubscribe = store.subscribe(subscribe.bind(this));
          subscribe.call(this);
        }

        if (isObject(config.lifetimes) && isFunction(config.lifetimes.attached)) {
          config.lifetimes.attached.call(this);
        } else if (isFunction(config.attached)) {
          config.attached.call(this);
        }

        ready = true;
      }

      function hide() {
        if (isObject(config.pageLifetimes) && isFunction(config.pageLifetimes.hide)) {
          config.pageLifetimes.hide.call(this);
        }

        if (isFunction(unsubscribe)) {
          unsubscribe();
          unsubscribe = null;
        }
      }

      function detached() {
        if (isObject(config.lifetimes) && isFunction(config.lifetimes.detached)) {
          config.lifetimes.detached.call(this);
        } else if (isFunction(config.detached)) {
          config.detached.call(this);
        }

        if (isFunction(unsubscribe)) {
          unsubscribe();
          unsubscribe = null;
        }
      }

      function show() {
        if (ready && !isFunction(unsubscribe) && shouldMapStateToProps) {
          unsubscribe = store.subscribe(subscribe.bind(this));
          subscribe.call(this);
        }

        if (isObject(config.pageLifetimes) && isFunction(config.pageLifetimes.show)) {
          config.pageLifetimes.show.call(this);
        }
      }

      var componentConfig = _extends({}, config, {
        pageLifetimes: _extends({}, config.pageLifetimes),
        lifetimes: _extends({}, config.lifetimes),
        methods: _extends({}, config.methods, mapDispatch(store.dispatch))
      });

      if (isObject(config.lifetimes)) {
        componentConfig.lifetimes.attached = attached;
      } else {
        componentConfig.attached = attached;
      }

      if (isObject(config.lifetimes)) {
        componentConfig.lifetimes.detached = detached;
      } else {
        componentConfig.detached = detached;
      }

      if (!isObject(config.pageLifetimes)) {
        componentConfig.pageLifetimes = {};
      }

      componentConfig.pageLifetimes.hide = hide;
      componentConfig.pageLifetimes.show = show;
      return componentConfig;
    };
  };
}

function isReduxStore(store) {
  return ['subscribe', 'dispatch', 'getState'].every(function (method) {
    return store.hasOwnProperty(method);
  });
}

var _store = null;
var setStore = function setStore(store) {
  assert(isReduxStore(store), 'the store you provider not a standrand redux store');
  _store = store;
};

function defaultMapToProps$1() {
  return {};
}

var connect = function connect(mapStateToProps, mapDispatchToProps) {
  var shouldMapStateToProps = isFunction(mapStateToProps);
  var shouldMapDispatchToProps = isFunction(mapDispatchToProps);
  return function (config) {
    var mapState = shouldMapStateToProps ? mapStateToProps : defaultMapToProps$1;
    var mapDispatch = shouldMapDispatchToProps ? mapDispatchToProps : defaultMapToProps$1;
    var unsubscribe = null;
    var ready = false;

    function subscribe(options) {
      if (!isFunction(unsubscribe)) return null;
      var mappedState = mapState(_store.getState(), options);
      if (isShallowInclude(this.data, mappedState)) return null;
      this.setData(mappedState);
    }

    function onLoad(options) {
      assert(_store !== null, 'we should call setStore before the connect');

      if (shouldMapStateToProps) {
        unsubscribe = _store.subscribe(subscribe.bind(this, options));
        subscribe.call(this, options);
      }

      if (isFunction(config.onLoad)) {
        config.onLoad.call(this, options);
      }

      ready = true;
    }

    function onShow() {
      if (ready && !isFunction(unsubscribe) && shouldMapStateToProps) {
        unsubscribe = _store.subscribe(subscribe.bind(this));
        subscribe.call(this);
      }

      if (isFunction(config.onShow)) {
        config.onShow.call(this);
      }
    }

    function onUnload() {
      if (isFunction(config.onUnload)) {
        config.onUnload.call(this);
      }

      if (isFunction(unsubscribe)) {
        unsubscribe();
        unsubscribe = null;
      }
    }

    function onHide() {
      if (isFunction(config.onHide)) {
        config.onHide.call(this);
      }

      if (isFunction(unsubscribe)) {
        unsubscribe();
        unsubscribe = null;
      }
    }

    return _extends({}, config, mapDispatch(_store.dispatch), {
      onLoad: onLoad,
      onUnload: onUnload,
      onShow: onShow,
      onHide: onHide
    });
  };
};
var connectComponent = function connectComponent(mapStateToProps, mapDispatchToProps) {
  return createConnectComponent(_store)(mapStateToProps, mapDispatchToProps);
};

export { setStore, connect, connectComponent };
