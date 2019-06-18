function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var PLUGIN_EVENT = {
  INJECT_INITIAL_STATE: 'injectInitialState',
  BEFORE_INJECT_MODEL: 'beforeInjectModel',
  INJECT_MODELS: 'injectModels',
  AFTER_INJECT_MODEL: 'afterInjectModel',
  INJECT_MIDDLEWARES: 'injectMiddlewares',
  INJECT_ENHANCERS: 'injectEnhancers',
  ON_REDUCER: 'onReducer',
  ON_CREATE_MODEL: 'onCreateModel',
  ON_SETUP_MODEL: 'onSetupModel',
  ON_WILL_EFFECT: 'onWillEffect',
  ON_DID_EFFECT: 'onDidEffect',
  ON_WILL_ACTION: 'onWillAction',
  ON_DID_ACTION: 'onDidAction',
  ON_SETUP: 'onSetup',
  ON_SUBSCRIBE: 'onSubscribe',
  ON_ERROR: 'onError',
  ON_WILL_CONNECT: 'onWillConnect',
  ON_DID_CONNECT: 'onDidConnect'
};

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
function getConnectStoreData(current, pre) {
  var childks = Object.keys(current);
  return childks.reduce(function (result, key) {
    var _objectSpread2;

    return _objectSpread({}, result, (_objectSpread2 = {}, _objectSpread2[key] = pre[key], _objectSpread2));
  }, {});
}
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (placeholder) {
    var random = Math.floor(Math.random() * 16);
    var value = placeholder === 'x' ? random : random & 0x3 | 0x8;
    return value.toString(16);
  });
}
function diff(current, next) {
  var empty = true;
  var data = Object.keys(current).reduce(function (result, key) {
    if (current[key] === next[key]) {
      return result;
    }

    empty = false;
    result[key] = next[key];
    return result;
  }, {});
  return {
    empty: empty,
    data: data
  };
}
function isZoroApp(app) {
  if (app && app.zoro) return true;
  return false;
}

function getValue(key, newValue, oldValue, props, data) {
  var _objectSpread2, _objectSpread3;

  var values = Object.keys(props).reduce(function (result, key) {
    result[key] = data[key];
    return result;
  }, {});
  return {
    newValues: _objectSpread({}, values, (_objectSpread2 = {}, _objectSpread2[key] = newValue, _objectSpread2)),
    oldValues: _objectSpread({}, values, (_objectSpread3 = {}, _objectSpread3[key] = oldValue, _objectSpread3))
  };
}

function connectObserver(config, mergeState) {
  var properties = config.properties,
      onObserver = config.onObserver,
      rest = _objectWithoutPropertiesLoose(config, ["properties", "onObserver"]);

  if (!isFunction(onObserver)) return config;
  var props = Object.keys(properties).reduce(function (target, key) {
    var prop = properties[key];

    if (isFunction(prop) || prop === null) {
      prop = {
        type: prop
      };
    }

    var observer = prop.observer;

    prop.observer = function (newValue, oldValue, changedPath) {
      if (isFunction(observer)) {
        observer.call(this, newValue, oldValue, changedPath);
      }

      if (newValue !== oldValue) {
        var _getValue = getValue(key, newValue, oldValue, props, this.data),
            newValues = _getValue.newValues,
            oldValues = _getValue.oldValues;

        onObserver.call(this, newValues, oldValues);
      }
    };

    target[key] = prop;
    return target;
  }, {});

  if (isObject(mergeState)) {
    Object.keys(mergeState).forEach(function (key) {
      if (!props[key]) {
        props[key] = {
          type: null
        };
      }

      if (isFunction(props[key].observer)) return;

      props[key].observer = function (newValue, oldValue) {
        if (newValue !== oldValue) {
          var _getValue2 = getValue(key, newValue, oldValue, props, this.data),
              newValues = _getValue2.newValues,
              oldValues = _getValue2.oldValues;

          onObserver.call(this, newValues, oldValues);
        }
      };
    });
  }

  rest.properties = props;
  return rest;
}

function defaultMapToProps() {
  return {};
}

function createConnectComponent (store, zoro) {
  return function (mapStateToProps, mapDispatchToProps) {
    var shouldMapStateToProps = isFunction(mapStateToProps);
    var shouldMapDispatchToProps = isFunction(mapDispatchToProps);

    if (!shouldMapStateToProps && !shouldMapDispatchToProps) {
      return connectObserver;
    }

    return function (config) {
      var mapState = shouldMapStateToProps ? mapStateToProps : defaultMapToProps;
      var mapDispatch = shouldMapDispatchToProps ? mapDispatchToProps : defaultMapToProps;
      var unsubscribe = null;
      var ready = false;

      function subscribe() {
        var _this = this;

        if (!isFunction(unsubscribe)) return null;
        var mappedState = mapState(store.getState());
        var currentState = getConnectStoreData(mappedState, this.data);

        var _diff = diff(currentState, mappedState),
            data = _diff.data,
            empty = _diff.empty;

        if (empty) return null;
        var key = uuid();

        if (zoro) {
          zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_CONNECT, store, {
            key: key,
            name: this.is,
            currentData: currentState,
            nextData: mappedState
          });
        }

        this.setData(data, function () {
          if (zoro) {
            zoro.plugin.emit(PLUGIN_EVENT.ON_DID_CONNECT, store, {
              key: key,
              name: _this.is
            });
          }
        });
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

      var result = connectObserver(config, mapState(store.getState()));

      var componentConfig = _objectSpread({}, result, {
        pageLifetimes: _objectSpread({}, config.pageLifetimes),
        lifetimes: _objectSpread({}, config.lifetimes),
        methods: _objectSpread({}, config.methods, mapDispatch(store.dispatch))
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
var _app = null;
var setStore = function setStore(store, app) {
  assert(isReduxStore(store), 'the store you provider not a standrand redux store');
  assert(app === undefined || isZoroApp(app), 'the setStore second param not a standrand zoro app');
  _store = store;
  if (isZoroApp(app)) _app = app;
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
      var _this = this;

      if (!isFunction(unsubscribe)) return null;
      var mappedState = mapState(_store.getState(), options);
      var currentState = getConnectStoreData(mappedState, this.data);

      var _diff = diff(currentState, mappedState),
          data = _diff.data,
          empty = _diff.empty;

      if (empty) return null;
      var key = uuid();

      if (isZoroApp(_app)) {
        _app.zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_CONNECT, _store, {
          key: key,
          name: this.route,
          currentData: currentState,
          nextData: mappedState
        });
      }

      this.setData(data, function () {
        if (isZoroApp(_app)) {
          _app.zoro.plugin.emit(PLUGIN_EVENT.ON_DID_CONNECT, _store, {
            key: key,
            name: _this.route
          });
        }
      });
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

    return _objectSpread({}, config, mapDispatch(_store.dispatch), {
      onLoad: onLoad,
      onUnload: onUnload,
      onShow: onShow,
      onHide: onHide
    });
  };
};
var connectComponent = function connectComponent(mapStateToProps, mapDispatchToProps) {
  if (isZoroApp(_app)) return createConnectComponent(_store, _app.zoro)(mapStateToProps, mapDispatchToProps);
  return createConnectComponent(_store)(mapStateToProps, mapDispatchToProps);
};

export { connect, connectComponent, setStore };
