"use strict";

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

var delay = function delay(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};

var app = (0, _index.default)({
  initialState: {
    loading: false,
    test: {
      eee: 1
    }
  },
  onError: function onError(e) {
    console.log('onError: ', e);
  },
  onAffair: function onAffair(action) {
    console.log('onAffair: ', action);
  }
});
app.model({
  namespace: 'test',
  state: {
    eee: 2
  },
  affairs: {
    timeout: function () {
      var _timeout = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(action, _ref) {
        var put;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                put = _ref.put;
                _context.next = 3;
                return delay(2000);

              case 3:
                put({
                  type: 'save',
                  payload: {
                    name: 'test',
                    error: false
                  }
                });

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function timeout(_x, _x2) {
        return _timeout.apply(this, arguments);
      };
    }()
  },
  reducers: {
    save: function save(_ref2) {
      var payload = _ref2.payload;
      return payload;
    }
  }
});
var store = app.start();
store.dispatch({
  type: 'test/timeout'
}).then(function (data) {
  return console.log('then: ', data);
}).catch(function (e) {
  return console.log('error: ', e);
});
console.log('init state: ', store.getState());
store.subscribe(function () {
  return console.log('state: ', store.getState());
});