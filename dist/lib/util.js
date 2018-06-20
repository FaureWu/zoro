"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.putCreator = putCreator;
exports.selectCreator = selectCreator;
exports.noop = exports.splitType = exports.warn = exports.assert = exports.isArray = exports.isFunction = exports.isBoolean = void 0;

var _constant = require("./constant");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

var isBoolean = function isBoolean(bool) {
  return typeof bool === 'boolean';
};

exports.isBoolean = isBoolean;

var isFunction = function isFunction(func) {
  return typeof func === 'function';
};

exports.isFunction = isFunction;

var isArray = function isArray(arr) {
  return arr instanceof Array;
};

exports.isArray = isArray;

var assert = function assert(validate, message) {
  if (isBoolean(validate) && !validate || isFunction(validate) && !validate()) {
    throw new Error(message);
  }
};

exports.assert = assert;

var warn = function warn(validate, message) {
  if (isBoolean(validate) && !validate || isFunction(validate) && !validate()) {
    console.warn(message);
  }
};

exports.warn = warn;

var splitType = function splitType(type) {
  var divider = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _constant.NAMESPACE_DIVIDER;
  var types = type.split(divider);
  assert(types.length > 1, "the model action type is not include the namespace, the type is ".concat(type));
  return {
    namespace: types.slice(0, types.length - 1).join(divider),
    type: types.slice(-1)
  };
};

exports.splitType = splitType;

var noop = function noop() {};

exports.noop = noop;

function putCreator(store, namespace) {
  if (!namespace) {
    return store.dispatch;
  }

  return function (_ref) {
    var type = _ref.type,
        rest = _objectWithoutProperties(_ref, ["type"]);

    assert(!!type, 'the action you dispatch is not a correct format, we need a type property');
    var types = type.split(_constant.NAMESPACE_DIVIDER);

    if (types.length >= 2) {
      var _namespace = types.slice(0, types.length - 1).join(_constant.NAMESPACE_DIVIDER);

      if (_namespace === namespace) {
        warn(false, "we don't need the dispatch with namespace, if you call in the model, [".concat(type, "]"));
      }

      return store.dispatch(_objectSpread({
        type: type
      }, rest));
    }

    return store.dispatch(_objectSpread({
      type: "".concat(namespace).concat(_constant.NAMESPACE_DIVIDER).concat(type)
    }, rest));
  };
}

function selectCreator(store, namespace) {
  return function (handler) {
    var state = store.getState();

    if (namespace && state[namespace]) {
      state = state[namespace];
    }

    return handler(state);
  };
}