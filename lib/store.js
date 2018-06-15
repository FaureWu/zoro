"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _redux = require("redux");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _default = function _default(_ref) {
  var rootReducer = _ref.rootReducer,
      middlewares = _ref.middlewares,
      initialState = _ref.initialState;
  var store = (0, _redux.createStore)(rootReducer, initialState, _redux.applyMiddleware.apply(void 0, _toConsumableArray(middlewares)));
  return store;
};

exports.default = _default;