"use strict";

var _index = _interopRequireWildcard(require("./index"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

var delay = function delay(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};

var app = (0, _index.default)({
  onError: function onError(e) {
    console.log('onError: ', e);
  },
  onEffect: function onEffect(effect) {
    console.log('onEffect: ', effect);
  },
  onAction: function onAction(action) {
    console.log('onAction: ', action);
  },
  onSetup: function () {
    var _onSetup = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(_ref) {
      var put, select, _actions, timeout3;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              put = _ref.put, select = _ref.select;
              _actions = (0, _index.actions)('test'), timeout3 = _actions.timeout3;
              _context.next = 4;
              return put(timeout3());

            case 4:
              console.log('end', select(function (state) {
                return state;
              }));

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function onSetup(_x) {
      return _onSetup.apply(this, arguments);
    };
  }()
});
app.use(_index.loadingPlugin);
app.model({
  namespace: 'test',
  state: {
    eee: 2
  },
  setup: function () {
    var _setup = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(_ref2) {
      var put, select;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              put = _ref2.put, select = _ref2.select;
              _context2.next = 3;
              return put({
                type: 'timeout'
              });

            case 3:
              _context2.next = 5;
              return put({
                type: 'test/timeout2'
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function setup(_x2) {
      return _setup.apply(this, arguments);
    };
  }(),
  effects: {
    timeout: function () {
      var _timeout = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(action, _ref3) {
        var put;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                put = _ref3.put;
                _context3.next = 3;
                return delay(1000);

              case 3:
                put({
                  type: 'save',
                  payload: {
                    name: 'test',
                    error: false
                  }
                });
                _context3.next = 6;
                return put({
                  type: 'timeout2'
                });

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function timeout(_x3, _x4) {
        return _timeout.apply(this, arguments);
      };
    }(),
    timeout2: function () {
      var _timeout2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(action, _ref4) {
        var put;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                put = _ref4.put;
                _context4.next = 3;
                return delay(2000);

              case 3:
                put({
                  type: 'save',
                  payload: {
                    name: 'test1',
                    error: false
                  }
                });

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function timeout2(_x5, _x6) {
        return _timeout2.apply(this, arguments);
      };
    }(),
    timeout3: function () {
      var _timeout3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(action, _ref5) {
        var put;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                put = _ref5.put;
                _context5.next = 3;
                return delay(3000);

              case 3:
                put({
                  type: 'save',
                  payload: {
                    name: 'test3',
                    error: false
                  }
                });

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function timeout3(_x7, _x8) {
        return _timeout3.apply(this, arguments);
      };
    }()
  },
  reducers: {
    save: function save(_ref6) {
      var payload = _ref6.payload;
      return payload;
    }
  }
});
var store = app.start();
store.subscribe(function () {
  return console.log('subscribe state: ', store.getState());
});
store.dispatch({
  type: 'test/timeout'
}).then(function (data) {
  return console.log('test/timeout callback: ', data);
}).catch(function (e) {
  return console.log('test/timeout onError: ', e);
});
app.model({
  namespace: 'eee'
});