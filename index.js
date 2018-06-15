"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.actions = void 0;

require("babel-polyfill");

var _zoro2 = _interopRequireDefault(require("./lib/zoro"));

var _util = require("./lib/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _zoro;

function App(zoro) {
  _zoro = zoro;
}

App.prototype.model = function () {
  _zoro.model.apply(_zoro, arguments);

  return this;
};

App.prototype.models = function () {
  _zoro.models.apply(_zoro, arguments);

  return this;
};

App.prototype.middleware = function () {
  _zoro.middleware.apply(_zoro, arguments);

  return this;
};

App.prototype.middlewares = function () {
  _zoro.middlewares.apply(_zoro, arguments);

  return this;
};

App.prototype.start = function () {
  var result = _zoro.start.apply(_zoro, arguments);

  this.store = _zoro.store;
  return result;
};

var actions = function actions(namespace) {
  var models = _zoro.models;
  (0, _util.assert)(!!models[namespace], "the ".concat(namespace, " model not define"));
  return models[namespace];
};

exports.actions = actions;

var _default = function _default(opts) {
  return new App(new _zoro2.default(opts));
};

exports.default = _default;