"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _createReducer2 = _interopRequireDefault(require("./createReducer"));

var _util = require("./util");

var _constant = require("./constant");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var assertOpts = function assertOpts(opts) {
  var namespace = opts.namespace;
  (0, _util.assert)(!!namespace, "the model's namespace is necessary, but we get ".concat(namespace));
};

var Model =
/*#__PURE__*/
function () {
  function Model(opts) {
    _classCallCheck(this, Model);

    assertOpts(opts);
    var namespace = opts.namespace,
        state = opts.state,
        setup = opts.setup,
        _opts$reducers = opts.reducers,
        reducers = _opts$reducers === void 0 ? {} : _opts$reducers,
        _opts$affairs = opts.affairs,
        affairs = _opts$affairs === void 0 ? {} : _opts$affairs;
    this.namespace = namespace;
    this.defaultState = state;
    this.reducers = this.createReducer(reducers);
    this.affairs = this.createAffairs(affairs);
    this.actions = this.createActions(_objectSpread({}, reducers, affairs));
  }

  _createClass(Model, [{
    key: "getNamespace",
    value: function getNamespace() {
      return this.namespace;
    }
  }, {
    key: "getAffairs",
    value: function getAffairs() {
      return this.affairs;
    }
  }, {
    key: "getReducers",
    value: function getReducers() {
      return this.reducers;
    }
  }, {
    key: "getDefaultState",
    value: function getDefaultState() {
      return this.defaultState;
    }
  }, {
    key: "createActionType",
    value: function createActionType(type) {
      return "".concat(this.namespace).concat(_constant.NAMESPACE_DIVIDER).concat(type);
    }
  }, {
    key: "createReducer",
    value: function createReducer(reducers) {
      var _this = this;

      var _reducers = Object.keys(reducers).reduce(function (combine, key) {
        var reducer = reducers[key];

        var type = _this.createActionType(key);

        (0, _util.assert)((0, _util.isFunction)(reducer), "the reducer must be an function, but we get ".concat(_typeof(reducer), " with type ").concat(type));
        return _objectSpread({}, combine, _defineProperty({}, type, reducer));
      }, {});

      return (0, _createReducer2.default)(this.defaultState, _reducers);
    }
  }, {
    key: "createActions",
    value: function createActions(actions) {
      return Object.keys(actions).reduce(function (combine, name) {
        return _objectSpread({}, combine, _defineProperty({}, name, function () {
          return _objectSpread({
            type: this.createActionType(name)
          }, arguments);
        }));
      }, {});
    }
  }, {
    key: "createAffairs",
    value: function createAffairs(affairs) {
      var _this2 = this;

      return Object.keys(affairs).reduce(function (combine, key) {
        var affair = affairs[key];

        var type = _this2.createActionType(key);

        (0, _util.assert)((0, _util.isFunction)(affair), "the affair must be an function, but we get ".concat(_typeof(affair), " with type ").concat(type));
        return _objectSpread({}, combine, _defineProperty({}, type, affair));
      }, {});
    }
  }]);

  return Model;
}();

var _default = Model;
exports.default = _default;