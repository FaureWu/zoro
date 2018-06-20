"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.actions = void 0;

require("regenerator-runtime/runtime");

var _zoro2 = _interopRequireDefault(require("./lib/zoro"));

var _util = require("./lib/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _zoro;

function App(zoro) {
  _zoro = zoro;
}

App.prototype.model = function (models) {
  if (models instanceof Array) {
    _zoro.injectModels.call(_zoro, models);

    return this;
  }

  _zoro.injectModels.call(_zoro, [models]);

  return this;
};

App.prototype.use = function (plugins) {
  if (typeof plugins === 'function') {
    _zoro.use.call(_zoro, plugins);

    return this;
  }

  (0, _util.assert)(plugins instanceof Array, "the use param must be a function or a plugin Array, but we get ".concat(_typeof(plugins)));
  plugins.forEach(function (plugin) {
    return _zoro.use.call(_zoro, plugin);
  });
  return this;
};

App.prototype.start = function () {
  var result = _zoro.setup.call(_zoro);

  this.store = _zoro.store;
  return result;
};

var actions = function actions(namespace) {
  var models = _zoro.models;
  (0, _util.assert)(!!models[namespace], "the ".concat(namespace, " model not define"));
  return models[namespace].getActions();
};

exports.actions = actions;

var _default = function _default() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new App(new _zoro2.default(opts));
};

exports.default = _default;