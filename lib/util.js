"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noop = noop;
exports.warn = exports.assert = exports.isArray = exports.isFunction = exports.isBoolean = void 0;

var isBoolean = function isBoolean(bool) {
  return typeof bool === 'boolean';
};

exports.isBoolean = isBoolean;

var isFunction = function isFunction(func) {
  return typeof func === 'function';
};

exports.isFunction = isFunction;

var isArray = function isArray(arr) {
  return arr instanceof Array;
};

exports.isArray = isArray;

var assert = function assert(validate, message) {
  if (isBoolean(validate) && !validate || isFunction(validate) && !validate()) {
    throw new Error(message);
  }
};

exports.assert = assert;

var warn = function warn(validate, message) {
  if (isBoolean(validate) && !validate || isFunction(validate) && !validate()) {
    console.warn(message);
  }
};

exports.warn = warn;

function noop() {}