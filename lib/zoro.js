"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _redux = require("redux");

var _model = _interopRequireDefault(require("./model"));

var _pluginEvent = _interopRequireDefault(require("./pluginEvent"));

var _store = _interopRequireDefault(require("./store"));

var _constant = require("./constant");

var _effectMiddleware = _interopRequireDefault(require("./effectMiddleware"));

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
    var _opts$initialState = opts.initialState,
        initialState = _opts$initialState === void 0 ? {} : _opts$initialState,
        _opts$onEffect = opts.onEffect,
        onEffect = _opts$onEffect === void 0 ? _util.noop : _opts$onEffect,
        _opts$onAction = opts.onAction,
        onAction = _opts$onAction === void 0 ? _util.noop : _opts$onAction,
        _opts$onSetup = opts.onSetup,
        onSetup = _opts$onSetup === void 0 ? _util.noop : _opts$onSetup,
        _opts$onError = opts.onError,
        onError = _opts$onError === void 0 ? _util.noop : _opts$onError;
    this.models = {};
    this.actions = {};
    this.middlewares = [(0, _effectMiddleware.default)(this)];
    this.handleError = onError;
    this.handleEffect = onEffect;
    this.handleAction = onAction;
    this.handleSetup = onSetup;
    this.initialState = initialState;
    this.plugin = new _pluginEvent.default();
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
    key: "getEffects",
    value: function getEffects() {
      var _this2 = this;

      return Object.keys(this.models).reduce(function (effects, namespace) {
        var model = _this2.models[namespace];
        return _objectSpread({}, effects, model.getEffects());
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
    key: "injectModels",
    value: function injectModels(models) {
      var _this4 = this;

      (0, _util.assert)((0, _util.isArray)(models), "the models must be an Array, but we get ".concat(_typeof(models)));
      models.forEach(function (opts) {
        var model = new _model.default(opts);
        assertModelUnique(_this4, model);
        _this4.models[model.getNamespace()] = model;
      });

      if (this.store) {
        this.replaceReducer();
      }
    }
  }, {
    key: "injectMiddlewares",
    value: function injectMiddlewares(middlewares) {
      var _this5 = this;

      (0, _util.assert)((0, _util.isArray)(middlewares), "the middlewares must be an Array, but we get ".concat(_typeof(middlewares)));
      middlewares.forEach(function (middleware) {
        _this5.middlewares.push(middleware);
      });
    }
  }, {
    key: "createStore",
    value: function createStore() {
      var rootReducer = this.getRootReducer();
      var pluginMiddlewares = this.plugin.emit(_constant.PLUGIN_EVENT.INJECT_MIDDLEWARES);

      if (pluginMiddlewares instanceof Array) {
        this.injectMiddlewares(pluginMiddlewares);
      }

      var pluginInitialState = this.plugin.emit(_constant.PLUGIN_EVENT.INJECT_INITIAL_STATE, this.initialState);
      return (0, _store.default)({
        rootReducer: rootReducer,
        middlewares: this.middlewares,
        initialState: _objectSpread({}, this.initialState, pluginInitialState || {}, this.getDefaultState())
      });
    }
  }, {
    key: "replaceReducer",
    value: function replaceReducer() {
      var rootReducer = this.getRootReducer();
      this.store.replaceReducer(rootReducer);
    }
  }, {
    key: "setupModel",
    value: function setupModel() {
      var _this6 = this;

      Object.keys(this.models).forEach(function (namespace) {
        var model = _this6.models[namespace];
        model.handleSetup.apply(undefined, [{
          put: (0, _util.putCreator)(_this6.store, namespace),
          select: (0, _util.selectCreator)(_this6.store, namespace),
          selectAll: (0, _util.selectCreator)(_this6.store)
        }]);
      });
    }
  }, {
    key: "use",
    value: function use(creator) {
      (0, _util.assert)(typeof creator === 'function', "the use plugin must be a function, but we get ".concat(_typeof(creator)));
      creator(this.plugin, {
        DIVIDER: _constant.NAMESPACE_DIVIDER,
        PLUGIN_EVENT: _constant.PLUGIN_EVENT
      });
    }
  }, {
    key: "setup",
    value: function setup() {
      var _this7 = this;

      var pluginModels = this.plugin.emit(_constant.PLUGIN_EVENT.INJECT_MODELS);

      if (pluginModels instanceof Array) {
        this.injectModels(pluginModels);
      }

      var store = this.store = this.createStore();
      this.setupModel();
      this.handleSetup.apply(undefined, [{
        put: (0, _util.putCreator)(store),
        select: (0, _util.selectCreator)(store)
      }]);
      this.plugin.emit(_constant.PLUGIN_EVENT.ON_SETUP, store);
      store.subscribe(function () {
        _this7.plugin.emit(_constant.PLUGIN_EVENT.ON_SUBSCRIBE, store);
      });
      return store;
    }
  }]);

  return Zoro;
}();

exports.default = Zoro;