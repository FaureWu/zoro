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
function getConnectStoreData(pre, current) {
  var childks = Object.keys(current);
  return childks.reduce(function (result, key) {
    var _extends2;

    return _extends({}, result, (_extends2 = {}, _extends2[key] = pre[key], _extends2));
  }, {});
}

/**
 * 由于时间关系，此文件炒录于westore库中的diff算法
 * https://github.com/dntzhang/westore
 * 如有侵权请联系我
 */
var ARRAYTYPE = '[object Array]';
var OBJECTTYPE = '[object Object]';
var FUNCTIONTYPE = '[object Function]';

function syncKeys(current, pre) {
  if (current === pre) return;
  var rootCurrentType = type(current);
  var rootPreType = type(pre);

  if (rootCurrentType === OBJECTTYPE && rootPreType === OBJECTTYPE) {
    if (Object.keys(current).length >= Object.keys(pre).length) {
      for (var key in pre) {
        var currentValue = current[key];

        if (currentValue === undefined) {
          current[key] = null;
        } else {
          syncKeys(currentValue, pre[key]);
        }
      }
    }
  } else if (rootCurrentType === ARRAYTYPE && rootPreType === ARRAYTYPE) {
    if (current.length >= pre.length) {
      pre.forEach(function (item, index) {
        syncKeys(current[index], item);
      });
    }
  }
}

function _diff(current, pre, path, result) {
  if (current === pre) return;
  var rootCurrentType = type(current);
  var rootPreType = type(pre);

  if (rootCurrentType === OBJECTTYPE) {
    if (rootPreType !== OBJECTTYPE || Object.keys(current).length < Object.keys(pre).length) {
      setResult(result, path, current);
    } else {
      var _loop = function _loop(key) {
        var currentValue = current[key];
        var preValue = pre[key];
        var currentType = type(currentValue);
        var preType = type(preValue);

        if (currentType !== ARRAYTYPE && currentType !== OBJECTTYPE) {
          if (currentValue !== pre[key]) {
            setResult(result, (path === '' ? '' : path + '.') + key, currentValue);
          }
        } else if (currentType === ARRAYTYPE) {
          if (preType !== ARRAYTYPE) {
            setResult(result, (path === '' ? '' : path + '.') + key, currentValue);
          } else {
            if (currentValue.length < preValue.length) {
              setResult(result, (path === '' ? '' : path + '.') + key, currentValue);
            } else {
              currentValue.forEach(function (item, index) {
                _diff(item, preValue[index], (path === '' ? '' : path + '.') + key + '[' + index + ']', result);
              });
            }
          }
        } else if (currentType === OBJECTTYPE) {
          if (preType !== OBJECTTYPE || Object.keys(currentValue).length < Object.keys(preValue).length) {
            setResult(result, (path === '' ? '' : path + '.') + key, currentValue);
          } else {
            for (var subKey in currentValue) {
              _diff(currentValue[subKey], preValue[subKey], (path === '' ? '' : path + '.') + key + '.' + subKey, result);
            }
          }
        }
      };

      for (var key in current) {
        _loop(key);
      }
    }
  } else if (rootCurrentType === ARRAYTYPE) {
    if (rootPreType !== ARRAYTYPE) {
      setResult(result, path, current);
    } else {
      if (current.length < pre.length) {
        setResult(result, path, current);
      } else {
        current.forEach(function (item, index) {
          _diff(item, pre[index], path + '[' + index + ']', result);
        });
      }
    }
  } else {
    setResult(result, path, current);
  }
}

function setResult(result, k, v) {
  var t = type(v);

  if (t !== FUNCTIONTYPE) {
    result[k] = v;
  }
}

function type(obj) {
  return Object.prototype.toString.call(obj);
}

function diff(current, pre) {
  var result = {};
  syncKeys(current, pre);

  _diff(current, pre, '', result);

  return result;
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

      function subscribe() {
        if (!isFunction(unsubscribe)) return null;
        var mappedState = mapState(store.getState());
        var differents = diff(mappedState, getConnectStoreData(this.data, mappedState));

        if (Object.keys(differents).length > 0) {
          this.setData(differents);
        }
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

      function show() {
        assert(store !== null, 'we should call app.start() before the connectComponent');

        if (shouldMapStateToProps) {
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
        methods: _extends({}, config.methods, mapDispatch)
      });

      if (isObject(config.lifetimes)) {
        componentConfig.lifetimes.attached = attached;
      } else {
        componentConfig.attached = attached;
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

    function subscribe(options) {
      if (!isFunction(unsubscribe)) return null;
      var mappedState = mapState(_store.getState(), options);
      var differents = diff(mappedState, getConnectStoreData(this.data, mappedState));

      if (Object.keys(differents).length > 0) {
        this.setData(differents);
      }
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
var connectComponent = function connectComponent(componentConfig) {
  return createConnectComponent(_store)(componentConfig);
};

export { setStore, connect, connectComponent };
