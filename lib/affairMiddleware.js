"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("./util");

var _constant = require("./constant");

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

var _zoro;

function selectCreator(namespace) {
  return _zoro.store.getState()[namespace];
}

function putCreator(namespace, dispatch) {
  return function (_ref) {
    var type = _ref.type,
        rest = _objectWithoutProperties(_ref, ["type"]);

    (0, _util.assert)(!!type, 'the action you dispatch is not a correct format, we need a type property');

    var _type$split = type.split(_constant.NAMESPACE_DIVIDER),
        _type$split2 = _slicedToArray(_type$split, 1),
        _namespace = _type$split2[0];

    if (_namespace === namespace) {
      (0, _util.warn)(false, "we don't need the dispatch with namespace, if you call in the model, [".concat(type, "]"));
    } else {
      type = "".concat(namespace).concat(_constant.NAMESPACE_DIVIDER).concat(type);
    }

    return dispatch(_objectSpread({
      type: type
    }, rest));
  };
}

var middleware = function middleware(_ref2) {
  var dispatch = _ref2.dispatch;
  return function (next) {
    return (
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(action) {
          var type, handler, _type$split3, _type$split4, namespace, result;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  type = action.type;
                  handler = _zoro.getAffairs()[type];

                  if (!(0, _util.isFunction)(handler)) {
                    _context.next = 16;
                    break;
                  }

                  _context.prev = 3;
                  _type$split3 = type.split(_constant.NAMESPACE_DIVIDER), _type$split4 = _slicedToArray(_type$split3, 1), namespace = _type$split4[0];
                  _context.next = 7;
                  return handler(action, {
                    select: selectCreator(namespace),
                    put: putCreator(namespace, dispatch)
                  });

                case 7:
                  result = _context.sent;

                  _zoro.handleAffair(action);

                  return _context.abrupt("return", result);

                case 12:
                  _context.prev = 12;
                  _context.t0 = _context["catch"](3);

                  _zoro.handleError(_context.t0);

                  throw _context.t0;

                case 16:
                  return _context.abrupt("return", next(action));

                case 17:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[3, 12]]);
        }));

        return function (_x) {
          return _ref3.apply(this, arguments);
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