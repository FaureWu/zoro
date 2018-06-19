"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("./util");

var _constant = require("./constant");

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

var _zoro;

var middleware = function middleware(_ref) {
  var dispatch = _ref.dispatch;
  return function (next) {
    return (
      /*#__PURE__*/
      function () {
        var _ref2 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(action) {
          var type, handler, _splitType, namespace, result;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _zoro.handleAction.apply(undefined, [action]);

                  _zoro.plugin.emit(_constant.PLUGIN_EVENT.ON_WILL_ACTION, action, _zoro.store);

                  type = action.type;
                  handler = _zoro.getEffects()[type];

                  if (!(0, _util.isFunction)(handler)) {
                    _context.next = 23;
                    break;
                  }

                  _context.prev = 5;

                  _zoro.handleEffect.apply(undefined, [action]);

                  _zoro.plugin.emit(_constant.PLUGIN_EVENT.ON_WILL_EFFECT, action, _zoro.store);

                  _splitType = (0, _util.splitType)(type), namespace = _splitType.namespace;
                  _context.next = 11;
                  return handler(action, {
                    selectAll: (0, _util.selectCreator)(_zoro.store),
                    select: (0, _util.selectCreator)(_zoro.store, namespace),
                    put: (0, _util.putCreator)(_zoro.store, namespace)
                  });

                case 11:
                  result = _context.sent;
                  return _context.abrupt("return", result);

                case 15:
                  _context.prev = 15;
                  _context.t0 = _context["catch"](5);

                  _zoro.handleError.apply(undefined, [_context.t0]);

                  _zoro.plugin.emit(_constant.PLUGIN_EVENT.ON_ERROR, _context.t0, _zoro.store);

                  throw _context.t0;

                case 20:
                  _context.prev = 20;

                  _zoro.plugin.emit(_constant.PLUGIN_EVENT.ON_DID_EFFECT, action, _zoro.store);

                  return _context.finish(20);

                case 23:
                  _zoro.plugin.emit(_constant.PLUGIN_EVENT.ON_DID_ACTION, action, _zoro.store);

                  return _context.abrupt("return", next(action));

                case 25:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[5, 15, 20, 23]]);
        }));

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      }()
    );
  };
};

var _default = function _default(zoro) {
  _zoro = zoro;
  return middleware;
};

exports.default = _default;