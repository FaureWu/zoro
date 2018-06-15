"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _redux = require("redux");

var _model = _interopRequireDefault(require("./model"));

var _store = _interopRequireDefault(require("./store"));

var _affairMiddleware = _interopRequireDefault(require("./affairMiddleware"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var assertOpts = function assertOpts(_ref) {
  var _ref$onError = _ref.onError,
      onError = _ref$onError === void 0 ? _util.noop : _ref$onError;
  (0, _util.assert)((0, _util.isFunction)(onError), "the onError must be an function handler, but we get ".concat(_typeof(onError)));
};

var assertModelUnique = function assertModelUnique(_ref2, model) {
  var models = _ref2.models;
  var namespace = model.getNamespace();
  (0, _util.assert)(!models[namespace], "the model namespace must be unique, we get duplicate namespace ".concat(namespace));
};

var Zoro =
/*#__PURE__*/
function () {
  function Zoro(opts) {
    _classCallCheck(this, Zoro);

    assertOpts(opts);
    var _opts$onError = opts.onError,
        onError = _opts$onError === void 0 ? _util.noop : _opts$onError,
        _opts$initialState = opts.initialState,
        initialState = _opts$initialState === void 0 ? {} : _opts$initialState,
        _opts$onAffair = opts.onAffair,
        onAffair = _opts$onAffair === void 0 ? _util.noop : _opts$onAffair;
    this.models = {};
    this.actions = {};
    this.middlewares = [];
    this.handleError = onError;
    this.handleAffair = onAffair;
    this.initialState = initialState;
  }

  _createClass(Zoro, [{
    key: "getRootReducer",
    value: function getRootReducer() {
      var _this = this;

      var rootReducer = Object.keys(this.models).reduce(function (combine, namespace) {
        var model = _this.models[namespace];
        var reducers = model.getReducers();
        return _objectSpread({}, combine, _defineProperty({}, namespace, reducers));
      }, {});
      return (0, _redux.combineReducers)(rootReducer);
    }
  }, {
    key: "getAffairs",
    value: function getAffairs() {
      var _this2 = this;

      return Object.keys(this.models).reduce(function (affairs, namespace) {
        var model = _this2.models[namespace];
        return _objectSpread({}, affairs, model.getAffairs());
      }, {});
    }
  }, {
    key: "getDefaultState",
    value: function getDefaultState() {
      var _this3 = this;

      return Object.keys(this.models).reduce(function (defaultState, namespace) {
        var model = _this3.models[namespace];
        return _objectSpread({}, defaultState, _defineProperty({}, namespace, model.getDefaultState()));
      }, {});
    }
  }, {
    key: "model",
    value: function model(opts) {
      var model = new _model.default(opts);
      assertModelUnique(this, model);
      this.models[model.getNamespace()] = model;
    }
  }, {
    key: "models",
    value: function models(_models) {
      var _this4 = this;

      (0, _util.assert)((0, _util.isArray)(_models), "the models must be an Array, but we get ".concat(_typeof(_models)));

      _models.forEach(function (model) {
        return _this4.model(model);
      });
    }
  }, {
    key: "middleware",
    value: function middleware(_middleware) {
      (0, _util.assert)(!!_middleware, 'the middleware must has one param, but we get none');
      this.middlewares.push(_middleware);
    }
  }, {
    key: "middlewares",
    value: function middlewares(_middlewares) {
      var _this5 = this;

      (0, _util.assert)((0, _util.isArray)(_middlewares), "the middlewares must be an Array, but we get ".concat(_typeof(_middlewares)));

      _middlewares.forEach(function (middleware) {
        return _this5.middleware(middleware);
      });
    }
  }, {
    key: "createStore",
    value: function createStore() {
      var rootReducer = this.getRootReducer();
      var affairMiddleware = (0, _affairMiddleware.default)(this);
      var middlewares = [affairMiddleware].concat(this.middlewares);
      return (0, _store.default)({
        rootReducer: rootReducer,
        middlewares: middlewares,
        initialState: _objectSpread({}, this.initialState, this.getDefaultState())
      });
    }
  }, {
    key: "start",
    value: function start() {
      this.store = this.createStore();
      return this.store;
    }
  }]);

  return Zoro;
}();

exports.default = Zoro;