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
function isShallowEqual(a, b) {
  if (a === b) return true;
  var aks = Object.keys(a);
  var bks = Object.keys(b);
  if (aks.length !== bks.length) return false;
  return aks.every(function (k) {
    return b.hasOwnProperty(k) && a[k] === b[k];
  });
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

function defaultMapToProps() {
  return {};
}

var connect = function connect(mapStateToProps, mapDispatchToProps) {
  var shouldMapStateToProps = isFunction(mapStateToProps);
  var shouldMapDispatchToProps = isFunction(mapDispatchToProps);
  return function (config) {
    var mapState = shouldMapStateToProps ? mapStateToProps : defaultMapToProps;
    var mapDispatch = shouldMapDispatchToProps ? mapDispatchToProps : defaultMapToProps;
    var prevMappedState = {};
    var unsubscribe = null;

    function subscribe(options) {
      if (!isFunction(unsubscribe)) return null;
      var mappedState = mapState(_store.getState(), options);
      if (isShallowEqual(mappedState, prevMappedState)) return null;
      this.setData(mappedState);
      prevMappedState = mappedState;
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
    }

    function onUnload() {
      if (isFunction(config.onUnload)) {
        config.onUnload.call();
      }

      if (isFunction(unsubscribe)) {
        unsubscribe();
        unsubscribe = null;
      }
    }

    return _extends({}, config, mapDispatch, {
      onLoad: onLoad,
      onUnload: onUnload
    });
  };
};

export { setStore, connect };
