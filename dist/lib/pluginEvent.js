"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("./util");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PluginEvent =
/*#__PURE__*/
function () {
  function PluginEvent() {
    _classCallCheck(this, PluginEvent);

    this.handlers = {};
  }

  _createClass(PluginEvent, [{
    key: "emit",
    value: function emit(name) {
      for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
      }

      (0, _util.assert)(typeof name === 'string', "the plugin event's name is necessary, but we get ".concat(name));
      var handlers = this.handlers[name];

      if (!(handlers instanceof Array)) {
        return undefined;
      }

      return handlers.reduce(function (result, handler) {
        return handler.apply(undefined, rest);
      }, undefined);
    }
  }, {
    key: "on",
    value: function on(name, handler) {
      (0, _util.assert)(typeof name === 'string', "the plugin event's name is necessary, but we get ".concat(name));

      if (!(this.handlers[name] instanceof Array)) {
        this.handlers[name] = [];
      }

      this.handlers[name].push(handler);
    }
  }]);

  return PluginEvent;
}();

var _default = PluginEvent;
exports.default = _default;