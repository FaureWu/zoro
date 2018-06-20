"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("../util");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var loadingNamespace = '@loading';
var loadingCount = {
  global: 0,
  model: {},
  effect: {}
};
var loadingModel = {
  namespace: loadingNamespace,
  state: {
    global: false,
    model: {},
    effect: {}
  },
  reducers: {
    loading: function loading(_ref, _ref2) {
      var payload = _ref.payload;
      var global = _ref2.global,
          model = _ref2.model,
          effect = _ref2.effect;
      var modelName = payload.modelName,
          effectName = payload.effectName;
      loadingCount.global++;

      if (!loadingCount.model[modelName]) {
        loadingCount.model[modelName] = 0;
      }

      loadingCount.model[modelName]++;

      if (!loadingCount.effect["".concat(modelName, "/").concat(effectName)]) {
        loadingCount.effect["".concat(modelName, "/").concat(effectName)] = 0;
      }

      loadingCount.effect["".concat(modelName, "/").concat(effectName)]++;
      return {
        global: true,
        model: _objectSpread({}, model, _defineProperty({}, modelName, true)),
        effect: _objectSpread({}, effect, _defineProperty({}, "".concat(modelName, "/").concat(effectName), true))
      };
    },
    loaded: function loaded(_ref3, _ref4) {
      var payload = _ref3.payload;
      var global = _ref4.global,
          model = _ref4.model,
          effect = _ref4.effect;
      var modelName = payload.modelName,
          effectName = payload.effectName;
      loadingCount.global--;
      loadingCount.model[modelName]--;
      loadingCount.effect["".concat(modelName, "/").concat(effectName)]--;
      return {
        global: loadingCount.global > 0,
        model: _objectSpread({}, model, _defineProperty({}, modelName, loadingCount.model[modelName] > 0)),
        effect: _objectSpread({}, effect, _defineProperty({}, "".concat(modelName, "/").concat(effectName), loadingCount.effect["".concat(modelName, "/").concat(effectName)] > 0))
      };
    }
  }
};

function loadingPlugin(event, _ref5) {
  var DIVIDER = _ref5.DIVIDER,
      PLUGIN_EVENT = _ref5.PLUGIN_EVENT;
  event.on(PLUGIN_EVENT.INJECT_MODELS, function () {
    return [loadingModel];
  });
  event.on(PLUGIN_EVENT.ON_WILL_EFFECT, function (action, _ref6) {
    var dispatch = _ref6.dispatch;

    var _splitType = (0, _util.splitType)(action.type, DIVIDER),
        namespace = _splitType.namespace,
        type = _splitType.type;

    dispatch({
      type: "".concat(loadingNamespace).concat(DIVIDER, "loading"),
      payload: {
        modelName: namespace,
        effectName: type
      }
    });
  });
  event.on(PLUGIN_EVENT.ON_DID_EFFECT, function (action, _ref7) {
    var dispatch = _ref7.dispatch;

    var _splitType2 = (0, _util.splitType)(action.type),
        namespace = _splitType2.namespace,
        type = _splitType2.type;

    dispatch({
      type: "".concat(loadingNamespace).concat(DIVIDER, "loaded"),
      payload: {
        modelName: namespace,
        effectName: type
      }
    });
  });
}

var _default = loadingPlugin;
exports.default = _default;