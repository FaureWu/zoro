// @ts-nocheck
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */
var global$1 = {};
var Op = Object.prototype;
var hasOwn = Op.hasOwnProperty;
var undefined$1; // More compressible than void 0.
var $Symbol = typeof Symbol === "function" ? Symbol : {};
var iteratorSymbol = $Symbol.iterator || "@@iterator";
var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

var inModule = typeof module === "object";
var runtime = global$1.regeneratorRuntime;

// Define the runtime globally (as expected by generated code) as either
// module.exports (if we're in a module) or a new, empty object.
runtime = global$1.regeneratorRuntime = inModule ? module.exports : {};

function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
}
runtime.wrap = wrap;

// Try/catch helper to minimize deoptimizations. Returns a completion
// record like context.tryEntries[i].completion. This interface could
// have been (and was previously) designed to take a closure to be
// invoked without arguments, but in all the cases we care about we
// already have an existing method we want to call, so there's no need
// to create a new function object. We can even get away with assuming
// the method takes exactly one argument, since that happens to be true
// in every case, so we don't have to touch the arguments object. The
// only additional allocation required is the completion record, which
// has a stable shape and so hopefully should be cheap to allocate.
function tryCatch(fn, obj, arg) {
    try {
        return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
        return { type: "throw", arg: err };
    }
}

var GenStateSuspendedStart = "suspendedStart";
var GenStateSuspendedYield = "suspendedYield";
var GenStateExecuting = "executing";
var GenStateCompleted = "completed";

// Returning this object from the innerFn has the same effect as
// breaking out of the dispatch switch statement.
var ContinueSentinel = {};

// Dummy constructor functions that we use as the .constructor and
// .constructor.prototype properties for functions that return Generator
// objects. For full spec compliance, you may wish to configure your
// minifier not to mangle the names of these two functions.
function Generator() { }
function GeneratorFunction() { }
function GeneratorFunctionPrototype() { }

// This is a polyfill for %IteratorPrototype% for environments that
// don't natively support it.
var IteratorPrototype = {};
IteratorPrototype[iteratorSymbol] = function () {
    return this;
};

var getProto = Object.getPrototypeOf;
var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
if (NativeIteratorPrototype &&
    NativeIteratorPrototype !== Op &&
    hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
}

var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
GeneratorFunctionPrototype.constructor = GeneratorFunction;
GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

// Helper for defining the .next, .throw, and .return methods of the
// Iterator interface in terms of a single ._invoke method.
function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
        prototype[method] = function (arg) {
            return this._invoke(method, arg);
        };
    });
}

runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
        ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
};

runtime.mark = function (genFun) {
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
        }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
};

// Within the body of any async function, `await x` is transformed to
// `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
// `hasOwn.call(value, "__await")` to determine if the yielded value is
// meant to be awaited.
runtime.awrap = function (arg) {
    return { __await: arg };
};

function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
            reject(record.arg);
        } else {
            var result = record.arg;
            var value = result.value;
            if (value &&
                typeof value === "object" &&
                hasOwn.call(value, "__await")) {
                return Promise.resolve(value.__await).then(function (value) {
                    invoke("next", value, resolve, reject);
                }, function (err) {
                    invoke("throw", err, resolve, reject);
                });
            }

            return Promise.resolve(value).then(function (unwrapped) {
                // When a yielded Promise is resolved, its final value becomes
                // the .value of the Promise<{value,done}> result for the
                // current iteration.
                result.value = unwrapped;
                resolve(result);
            }, function (error) {
                // If a rejected Promise was yielded, throw the rejection back
                // into the async generator function so it can be handled there.
                return invoke("throw", error, resolve, reject);
            });
        }
    }

    var previousPromise;

    function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
            return new Promise(function (resolve, reject) {
                invoke(method, arg, resolve, reject);
            });
        }

        return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
                callInvokeWithMethodAndArg,
                // Avoid propagating failures to Promises returned by later
                // invocations of the iterator.
                callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
}

defineIteratorMethods(AsyncIterator.prototype);
AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
};
runtime.AsyncIterator = AsyncIterator;

// Note that simple async functions are implemented on top of
// AsyncIterator objects; they just return a Promise for the value of
// the final result produced by the iterator.
runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
            return result.done ? result.value : iter.next();
        });
};

function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
        if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
            if (method === "throw") {
                throw arg;
            }

            // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
            var delegate = context.delegate;
            if (delegate) {
                var delegateResult = maybeInvokeDelegate(delegate, context);
                if (delegateResult) {
                    if (delegateResult === ContinueSentinel) continue;
                    return delegateResult;
                }
            }

            if (context.method === "next") {
                // Setting context._sent for legacy support of Babel's
                // function.sent implementation.
                context.sent = context._sent = context.arg;

            } else if (context.method === "throw") {
                if (state === GenStateSuspendedStart) {
                    state = GenStateCompleted;
                    throw context.arg;
                }

                context.dispatchException(context.arg);

            } else if (context.method === "return") {
                context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;

            var record = tryCatch(innerFn, self, context);
            if (record.type === "normal") {
                // If an exception is thrown from innerFn, we leave state ===
                // GenStateExecuting and loop back for another invocation.
                state = context.done
                    ? GenStateCompleted
                    : GenStateSuspendedYield;

                if (record.arg === ContinueSentinel) {
                    continue;
                }

                return {
                    value: record.arg,
                    done: context.done
                };

            } else if (record.type === "throw") {
                state = GenStateCompleted;
                // Dispatch the exception by looping back around to the
                // context.dispatchException(context.arg) call above.
                context.method = "throw";
                context.arg = record.arg;
            }
        }
    };
}

// Call delegate.iterator[context.method](context.arg) and handle the
// result, either by returning a { value, done } result from the
// delegate iterator, or by modifying context.method and context.arg,
// setting context.delegate to null, and returning the ContinueSentinel.
function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
            if (delegate.iterator.return) {
                // If the delegate iterator has a return method, give it a
                // chance to clean up.
                context.method = "return";
                context.arg = undefined$1;
                maybeInvokeDelegate(delegate, context);

                if (context.method === "throw") {
                    // If maybeInvokeDelegate(context) changed context.method from
                    // "return" to "throw", let that override the TypeError below.
                    return ContinueSentinel;
                }
            }

            context.method = "throw";
            context.arg = new TypeError(
                "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
    }

    if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
        }

    } else {
        // Re-yield the result returned by the delegate method.
        return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
}

// Define Generator.prototype.{next,throw,return} in terms of the
// unified ._invoke helper method.
defineIteratorMethods(Gp);

Gp[toStringTagSymbol] = "Generator";

// A Generator should always return itself as the iterator object when the
// @@iterator function is called on it. Some browsers' implementations of the
// iterator prototype chain incorrectly implement this, causing the Generator
// object to not be returned from this call. This ensures that doesn't happen.
// See https://github.com/facebook/regenerator/issues/274 for more details.
Gp[iteratorSymbol] = function () {
    return this;
};

Gp.toString = function () {
    return "[object Generator]";
};

function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
        entry.catchLoc = locs[1];
    }

    if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
}

function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
}

function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
}

runtime.keys = function (object) {
    var keys = [];
    for (var key in object) {
        keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
        while (keys.length) {
            var key = keys.pop();
            if (key in object) {
                next.value = key;
                next.done = false;
                return next;
            }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
    };
};

function values(iterable) {
    if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
            return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
            return iterable;
        }

        if (!isNaN(iterable.length)) {
            var i = -1, next = function next() {
                while (++i < iterable.length) {
                    if (hasOwn.call(iterable, i)) {
                        next.value = iterable[i];
                        next.done = false;
                        return next;
                    }
                }

                next.value = undefined$1;
                next.done = true;

                return next;
            };

            return next.next = next;
        }
    }

    // Return an iterator with no values.
    return { next: doneResult };
}
runtime.values = values;

function doneResult() {
    return { value: undefined$1, done: true };
}

Context.prototype = {
    constructor: Context,

    reset: function (skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
            for (var name in this) {
                // Not sure about the optimal order of these conditions:
                if (name.charAt(0) === "t" &&
                    hasOwn.call(this, name) &&
                    !isNaN(+name.slice(1))) {
                    this[name] = undefined$1;
                }
            }
        }
    },

    stop: function () {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
            throw rootRecord.arg;
        }

        return this.rval;
    },

    dispatchException: function (exception) {
        if (this.done) {
            throw exception;
        }

        var context = this;
        function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
                // If the dispatched exception was caught by a catch block,
                // then let that catch block handle the exception normally.
                context.method = "next";
                context.arg = undefined$1;
            }

            return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
                // Exception thrown outside of any try block that could handle
                // it, so set the completion value of the entire function to
                // throw the exception.
                return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc");
                var hasFinally = hasOwn.call(entry, "finallyLoc");

                if (hasCatch && hasFinally) {
                    if (this.prev < entry.catchLoc) {
                        return handle(entry.catchLoc, true);
                    } else if (this.prev < entry.finallyLoc) {
                        return handle(entry.finallyLoc);
                    }

                } else if (hasCatch) {
                    if (this.prev < entry.catchLoc) {
                        return handle(entry.catchLoc, true);
                    }

                } else if (hasFinally) {
                    if (this.prev < entry.finallyLoc) {
                        return handle(entry.finallyLoc);
                    }

                } else {
                    throw new Error("try statement without catch or finally");
                }
            }
        }
    },

    abrupt: function (type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc <= this.prev &&
                hasOwn.call(entry, "finallyLoc") &&
                this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
            }
        }

        if (finallyEntry &&
            (type === "break" ||
                type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
        }

        return this.complete(record);
    },

    complete: function (record, afterLoc) {
        if (record.type === "throw") {
            throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
            this.next = record.arg;
        } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
        }

        return ContinueSentinel;
    },

    finish: function (finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc) {
                this.complete(entry.completion, entry.afterLoc);
                resetTryEntry(entry);
                return ContinueSentinel;
            }
        }
    },

    "catch": function (tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if (record.type === "throw") {
                    var thrown = record.arg;
                    resetTryEntry(entry);
                }
                return thrown;
            }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
    },

    delegateYield: function (iterable, resultName, nextLoc) {
        this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
        };

        if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
        }

        return ContinueSentinel;
    }
};

var runtime$1 = runtime;var regeneratorRuntime = runtime;

// @ts-nocheck

/* eslint-disable */
if (typeof Promise !== 'function') {
  throw new TypeError('A global Promise is required');
}

if (typeof Promise.prototype["finally"] !== 'function') {
  var speciesConstructor = function speciesConstructor(O, defaultConstructor) {
    if (!O || typeof O !== 'object' && typeof O !== 'function') {
      throw new TypeError('Assertion failed: Type(O) is not Object');
    }

    var C = O.constructor;

    if (typeof C === 'undefined') {
      return defaultConstructor;
    }

    if (!C || typeof C !== 'object' && typeof C !== 'function') {
      throw new TypeError('O.constructor is not an Object');
    }

    var S = typeof Symbol === 'function' && typeof Symbol.species === 'symbol' ? C[Symbol.species] : undefined;

    if (S == null) {
      return defaultConstructor;
    }

    if (typeof S === 'function' && S.prototype) {
      return S;
    }

    throw new TypeError('no constructor found');
  };

  var shim = {
    "finally": function _finally(onFinally) {
      var promise = this;

      if (typeof promise !== 'object' || promise === null) {
        throw new TypeError('"this" value is not an Object');
      }

      var C = speciesConstructor(promise, Promise); // throws if SpeciesConstructor throws

      if (typeof onFinally !== 'function') {
        return Promise.prototype.then.call(promise, onFinally, onFinally);
      }

      return Promise.prototype.then.call(promise, function (x) {
        return new C(function (resolve) {
          return resolve(onFinally());
        }).then(function () {
          return x;
        });
      }, function (e) {
        return new C(function (resolve) {
          return resolve(onFinally());
        }).then(function () {
          throw e;
        });
      });
    }
  };
  Object.defineProperty(Promise.prototype, 'finally', {
    configurable: true,
    writable: true,
    value: shim["finally"]
  });
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function symbolObservablePonyfill(root) {
	var result;
	var Symbol = root.Symbol;

	if (typeof Symbol === 'function') {
		if (Symbol.observable) {
			result = Symbol.observable;
		} else {
			result = Symbol('observable');
			Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
}

/* global window */

var root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = symbolObservablePonyfill(root);

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var randomString = function randomString() {
  return Math.random().toString(36).substring(7).split('').join('.');
};

var ActionTypes = {
  INIT: "@@redux/INIT" + randomString(),
  REPLACE: "@@redux/REPLACE" + randomString(),
  PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
    return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
  }
};

/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  var proto = obj;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */

function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
    throw new Error('It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function.');
  }

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;
  /**
   * This makes a shallow copy of currentListeners so we can use
   * nextListeners as a temporary list while dispatching.
   *
   * This prevents any bugs around consumers calling
   * subscribe/unsubscribe in the middle of a dispatch.
   */

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */


  function getState() {
    if (isDispatching) {
      throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
    }

    return currentState;
  }
  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */


  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    if (isDispatching) {
      throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
    }

    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
      }

      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }
  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */


  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }

    return action;
  }
  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */


  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
    // Any reducers that existed in both the new and old rootReducer
    // will receive the previous state. This effectively populates
    // the new state tree with any relevant data from the old one.

    dispatch({
      type: ActionTypes.REPLACE
    });
  }
  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */


  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe: unsubscribe
        };
      }
    }, _ref[result] = function () {
      return this;
    }, _ref;
  } // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.


  dispatch({
    type: ActionTypes.INIT
  });
  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[result] = observable, _ref2;
}

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionDescription = actionType && "action \"" + String(actionType) + "\"" || 'an action';
  return "Given " + actionDescription + ", reducer \"" + key + "\" returned undefined. " + "To ignore an action, you must explicitly return the previous state. " + "If you want this reducer to hold no value, you can return null instead of undefined.";
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, {
      type: ActionTypes.INIT
    });

    if (typeof initialState === 'undefined') {
      throw new Error("Reducer \"" + key + "\" returned undefined during initialization. " + "If the state passed to the reducer is undefined, you must " + "explicitly return the initial state. The initial state may " + "not be undefined. If you don't want to set a value for this reducer, " + "you can use null instead of undefined.");
    }

    if (typeof reducer(undefined, {
      type: ActionTypes.PROBE_UNKNOWN_ACTION()
    }) === 'undefined') {
      throw new Error("Reducer \"" + key + "\" returned undefined when probed with a random type. " + ("Don't try to handle " + ActionTypes.INIT + " or other actions in \"redux/*\" ") + "namespace. They are considered private. Instead, you must return the " + "current state for any unknown actions, unless it is undefined, " + "in which case you must return the initial state, regardless of the " + "action type. The initial state may not be undefined, but can be null.");
    }
  });
}
/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */


function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};

  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  var finalReducerKeys = Object.keys(finalReducers); // This is used to make sure we don't warn about the same

  var shapeAssertionError;

  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(state, action) {
    if (state === void 0) {
      state = {};
    }

    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    var hasChanged = false;
    var nextState = {};

    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(_key, action);
        throw new Error(errorMessage);
      }

      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments));
  };
}
/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass an action creator as the first argument,
 * and get a dispatch wrapped function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */


function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error("bindActionCreators expected an object or a function, instead received " + (actionCreators === null ? 'null' : typeof actionCreators) + ". " + "Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?");
  }

  var boundActionCreators = {};

  for (var key in actionCreators) {
    var actionCreator = actionCreators[key];

    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }

  return boundActionCreators;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    keys.push.apply(keys, Object.getOwnPropertySymbols(object));
  }

  if (enumerableOnly) keys = keys.filter(function (sym) {
    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
  });
  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */

function applyMiddleware() {
  for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function () {
      var store = createStore.apply(void 0, arguments);

      var _dispatch = function dispatch() {
        throw new Error('Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.');
      };

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch() {
          return _dispatch.apply(void 0, arguments);
        }
      };
      var chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = compose.apply(void 0, chain)(store.dispatch);
      return _objectSpread2({}, store, {
        dispatch: _dispatch
      });
    };
  };
}

var Redux = /*#__PURE__*/Object.freeze({
__DO_NOT_USE__ActionTypes: ActionTypes,
applyMiddleware: applyMiddleware,
bindActionCreators: bindActionCreators,
combineReducers: combineReducers,
compose: compose,
createStore: createStore
});

var window$1 = (function () {
    // @ts-ignore
    return this;
})() || Function('return this')();
function createReduxStore(config) {
    var composeEnhancers = window$1 && window$1.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window$1.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        : compose;
    var store = createStore(config.rootReducer, undefined, composeEnhancers.apply(void 0, [applyMiddleware.apply(Redux, config.middlewares)].concat(config.enhancers)));
    return store;
}

var NAMESPACE_DIVIDER = '/';
var PLUGIN_EVENT = {
    INJECT_INITIAL_STATE: 'injectInitialState',
    INJECT_MODELS: 'injectModels',
    INJECT_MIDDLEWARES: 'injectMiddlewares',
    INJECT_ENHANCERS: 'injectEnhancers',
    ON_REDUCER: 'onReducer',
    ON_BEFORE_CREATE_MODEL: 'onBeforeCreateModel',
    ON_AFTER_CREATE_MODEL: 'onAfterCreateModel',
    ON_SETUP_MODEL: 'onSetupModel',
    ON_WILL_EFFECT: 'onWillEffect',
    ON_DID_EFFECT: 'onDidEffect',
    ON_WILL_ACTION: 'onWillAction',
    ON_DID_ACTION: 'onDidAction',
    ON_SETUP: 'onSetup',
    ON_SUBSCRIBE: 'onSubscribe',
    ON_ERROR: 'onError',
    ON_WILL_CONNECT: 'onWillConnect',
    ON_DID_CONNECT: 'onDidConnect',
};
var INTERCEPT_ACTION = 'INTERCEPT_ACTION';
var INTERCEPT_EFFECT = 'INTERCEPT_EFFECT';
var INTERCEPT_TYPE = [INTERCEPT_ACTION, INTERCEPT_EFFECT];

function noop() { }
function assert(validate, message) {
    if ((typeof validate === 'boolean' && !validate) ||
        (typeof validate === 'function' && !validate())) {
        throw new Error(message);
    }
}
function isObject(obj) {
    return typeof obj === 'object' && obj !== null && !(obj instanceof Array);
}
function isReduxAction(action) {
    return typeof action === 'object' && action !== null && !!action.type;
}
function isReduxStore(store) {
    return (isObject(store) &&
        typeof store.dispatch === 'function' &&
        typeof store.getState === 'function' &&
        typeof store.subscribe === 'function');
}
function parseModelActionType(actionType) {
    var parts = actionType.split(NAMESPACE_DIVIDER);
    assert(parts.length >= 2, "invalid model action type, [" + actionType + "]");
    return {
        namespace: parts.slice(0, parts.length - 1).join(NAMESPACE_DIVIDER),
        type: parts[parts.length - 1],
    };
}
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (placeholder) {
        var random = Math.floor(Math.random() * 16);
        var value = placeholder === 'x' ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}
function getConnectStoreData(current, pre) {
    var childks = Object.keys(current);
    return childks.reduce(function (result, key) {
        var _a;
        return (__assign({}, result, (_a = {}, _a[key] = pre[key], _a)));
    }, {});
}
function diff(current, next) {
    var empty = true;
    var data = Object.keys(current).reduce(function (result, key) {
        if (current[key] === next[key]) {
            return result;
        }
        empty = false;
        result[key] = next[key];
        return result;
    }, {});
    if (empty)
        return;
    return data;
}

function createReducer(initialState, handlers) {
    if (initialState === void 0) { initialState = null; }
    if (handlers === void 0) { handlers = {}; }
    assert(typeof handlers === 'object' && handlers !== null, 'the reducer handlers must be an object');
    return function reducer(state, action) {
        if (state === void 0) { state = initialState; }
        assert(isReduxAction(action), 'the action must be an redux action');
        if ({}.hasOwnProperty.call(handlers, action.type)) {
            var handler = handlers[action.type];
            assert(typeof handler === 'function', 'the reducer handler should be a function');
            return handler(action, state);
        }
        return state;
    };
}

function assertOption(config) {
    var namespace = config.namespace, _a = config.reducers, reducers = _a === void 0 ? {} : _a, _b = config.effects, effects = _b === void 0 ? {} : _b, _c = config.setup, setup = _c === void 0 ? noop : _c;
    assert(typeof namespace === 'string', "the model's namespace is necessary, but we get " + namespace);
    assert(typeof reducers === 'object' && reducers !== null, "the " + namespace + " model reducers must an Object, but we get " + typeof reducers);
    assert(typeof effects === 'object' && effects !== null, "the " + namespace + " model effects must an Object, but we get " + typeof effects);
    assert(typeof setup === 'function', "the " + namespace + " setup must be a Function, but we get " + typeof setup);
}
var Model = /** @class */ (function () {
    function Model(config) {
        this.effects = {};
        this.actionCreators = {};
        this.setup = noop;
        assertOption(config);
        var namespace = config.namespace, state = config.state, reducers = config.reducers, effects = config.effects, setup = config.setup;
        this.namespace = namespace;
        this.initState = state;
        this.reducer = this.createReducer(reducers);
        this.effects = this.createEffects(effects);
        this.actionCreators = this.createActionCreators(reducers, effects);
        if (typeof setup === 'function') {
            this.setup = setup;
        }
    }
    Model.prototype.createReducer = function (reducers) {
        var _this = this;
        if (reducers === void 0) { reducers = {}; }
        var reducerHandlers = Object.keys(reducers).reduce(function (combine, key) {
            var _a;
            var reducerHandler = reducers[key];
            assert(typeof reducerHandler === 'function', "the reducer must be an function, but we get " + typeof reducerHandler + " with type " + key);
            var type = "" + _this.getNamespace() + NAMESPACE_DIVIDER + key;
            return __assign({}, combine, (_a = {}, _a[type] = reducerHandler, _a));
        }, {});
        return createReducer(this.getInitState(), reducerHandlers);
    };
    Model.prototype.createEffects = function (effects) {
        var _this = this;
        if (effects === void 0) { effects = {}; }
        return Object.keys(effects).reduce(function (combine, key) {
            var _a;
            var effect = effects[key];
            assert(typeof effect === 'function', "the effect must be an function, but we get " + typeof effect + " with type " + key);
            var type = "" + _this.getNamespace() + NAMESPACE_DIVIDER + key;
            return __assign({}, combine, (_a = {}, _a[type] = effect, _a));
        }, {});
    };
    Model.prototype.createActionCreators = function (reducers, effects) {
        if (reducers === void 0) { reducers = {}; }
        if (effects === void 0) { effects = {}; }
        var self = this;
        return Object.keys(__assign({}, reducers, effects)).reduce(function (combine, key) {
            combine[key] = function actionCreator(payload, meta, error) {
                return {
                    type: "" + self.getNamespace() + NAMESPACE_DIVIDER + key,
                    payload: payload,
                    meta: meta,
                    error: error,
                };
            };
            return combine;
        }, {});
    };
    Model.prototype.getNamespace = function () {
        return this.namespace;
    };
    Model.prototype.getInitState = function () {
        return this.initState;
    };
    Model.prototype.getReducer = function () {
        return this.reducer;
    };
    Model.prototype.getEffects = function () {
        return this.effects;
    };
    Model.prototype.getActionCreators = function () {
        return this.actionCreators;
    };
    Model.prototype.getSetup = function () {
        return this.setup;
    };
    return Model;
}());

function createSelect(store, namespace) {
    return function select(handler) {
        var state = store.getState();
        if (namespace) {
            state = state[namespace];
        }
        if (typeof handler === 'function') {
            return handler(state);
        }
        return state;
    };
}

function createPut(store, namespace) {
    return function put(action) {
        assert(isReduxAction(action), 'the dispatch action must be an redux action');
        var type = action.type, rest = __rest(action, ["type"]);
        var params = type.split(NAMESPACE_DIVIDER);
        if (params.length >= 2) {
            var currentNamespace = params
                .slice(0, params.length - 1)
                .join(NAMESPACE_DIVIDER);
            if (currentNamespace === namespace) {
                console.warn("when dispatch it's own model action, the namespace can be omit, [" + type + "]");
            }
            return store.dispatch(action);
        }
        assert(typeof namespace !== 'undefined', "we need a model namespace for action type, but we get [" + type + "]");
        return store.dispatch(__assign({ type: "" + namespace + NAMESPACE_DIVIDER + type }, rest));
    };
}

function doneEffectIntercepts(intercepts, action, option) {
    return __awaiter(this, void 0, void 0, function () {
        function doneEffectIntercept(prevAction) {
            return __awaiter(this, void 0, void 0, function () {
                var effectIntercept, nextAction, resolveAction, resultAction_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            effectIntercept = effectIntercepts.shift();
                            nextAction = prevAction;
                            return [4 /*yield*/, effectIntercept(prevAction, option)];
                        case 1:
                            resolveAction = _a.sent();
                            if (typeof resolveAction !== 'undefined') {
                                assert(isReduxAction(resolveAction), 'the effect intercept return must be an action or none');
                                resolveAction.type = action.type;
                                nextAction = resolveAction;
                            }
                            if (!(effectIntercepts.length > 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, doneEffectIntercept(nextAction)];
                        case 2:
                            resultAction_1 = _a.sent();
                            return [2 /*return*/, resultAction_1];
                        case 3: return [2 /*return*/, nextAction];
                    }
                });
            });
        }
        var effectIntercepts, resultAction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (intercepts.length <= 0)
                        return [2 /*return*/, action];
                    effectIntercepts = intercepts.slice(0);
                    return [4 /*yield*/, doneEffectIntercept(action)];
                case 1:
                    resultAction = _a.sent();
                    return [2 /*return*/, resultAction];
            }
        });
    });
}
function doneEffect(effect, action, zoro) {
    return __awaiter(this, void 0, void 0, function () {
        var effectId, plugin, store, resolveAction, effectIntercepts, nextAction, namespace, result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    effectId = uuid();
                    plugin = zoro.getPlugin();
                    store = zoro.getStore();
                    resolveAction = plugin.emitWithLoop(PLUGIN_EVENT.ON_WILL_EFFECT, action, {
                        store: store,
                        effectId: effectId,
                    });
                    if (typeof resolveAction !== 'undefined') {
                        assert(isReduxAction(resolveAction), 'the on will effect plugin event need return must be an action or none');
                        resolveAction.type = action.type;
                    }
                    else
                        resolveAction = action;
                    if (typeof zoro.onEffect === 'function') {
                        zoro.onEffect(resolveAction);
                    }
                    effectIntercepts = zoro.getIntercepts(INTERCEPT_EFFECT);
                    return [4 /*yield*/, doneEffectIntercepts(effectIntercepts, resolveAction, {
                            store: store,
                            NAMESPACE_DIVIDER: NAMESPACE_DIVIDER,
                        })];
                case 1:
                    nextAction = _a.sent();
                    namespace = parseModelActionType(nextAction.type).namespace;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, 5, 6]);
                    return [4 /*yield*/, effect(nextAction, {
                            selectAll: createSelect(store),
                            select: createSelect(store, namespace),
                            put: createPut(store, namespace),
                        })];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, Promise.resolve(result)];
                case 4:
                    e_1 = _a.sent();
                    if (typeof zoro.onError === 'function') {
                        zoro.onError(e_1);
                    }
                    plugin.emit(PLUGIN_EVENT.ON_ERROR, e_1, action, { store: store });
                    return [2 /*return*/, Promise.reject(e_1)];
                case 5:
                    plugin.emit(PLUGIN_EVENT.ON_DID_EFFECT, action, { store: store, effectId: effectId });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function doneActionIntercepts(intercepts, action, option) {
    if (intercepts.length <= 0)
        return action;
    return intercepts.reduce(function (nextAction, intercept) {
        var resolveAction = intercept(nextAction, option);
        if (typeof resolveAction !== 'undefined') {
            assert(isReduxAction(resolveAction), 'the action intercept return must be an action or none');
            return resolveAction;
        }
        return nextAction;
    }, action);
}
function effectMiddlewareCreator(zoro) {
    return function () { return function (next) { return function (action) {
        var namespace = parseModelActionType(action.type).namespace;
        var effects = zoro.getModelEffects(namespace);
        var effect = effects[action.type];
        if (typeof effect === 'function') {
            return doneEffect(effect, action, zoro);
        }
        var store = zoro.getStore();
        var plugin = zoro.getPlugin();
        var actionId = uuid();
        var resolveAction = plugin.emitWithLoop(PLUGIN_EVENT.ON_WILL_ACTION, action, {
            store: store,
            actionId: actionId,
        });
        if (typeof resolveAction !== 'undefined') {
            assert(isReduxAction(resolveAction), 'the on will action plugin event need return must be an action or none');
            resolveAction.type = action.type;
        }
        else
            resolveAction = action;
        if (typeof zoro.onAction === 'function') {
            zoro.onAction(resolveAction);
        }
        var actionIntercepts = zoro.getIntercepts(INTERCEPT_ACTION);
        var nextAction = doneActionIntercepts(actionIntercepts, resolveAction, {
            store: store,
            NAMESPACE_DIVIDER: NAMESPACE_DIVIDER,
        });
        plugin.emit(PLUGIN_EVENT.ON_DID_ACTION, nextAction, {
            store: store,
            actionId: actionId,
        });
        return next(nextAction);
    }; }; };
}

var Plugin = /** @class */ (function () {
    function Plugin() {
        this.eventHandlers = {};
    }
    Plugin.prototype.on = function (eventName, eventHandler) {
        assert(typeof eventName === 'string', "the plugin event's name is necessary, but we get " + eventName);
        var eventHandlers = this.eventHandlers[eventName];
        if (!(eventHandlers instanceof Array)) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(eventHandler);
    };
    Plugin.prototype.emit = function (eventName) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        assert(typeof eventName === 'string', "the plugin event's name is necessary, but we get " + eventName);
        var eventHandlers = this.eventHandlers[eventName];
        if (eventHandlers instanceof Array) {
            eventHandlers.forEach(function (eventHandler) {
                eventHandler.apply(void 0, params);
            });
        }
    };
    Plugin.prototype.emitWithResultSet = function (eventName) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        assert(typeof eventName === 'string', "the plugin event's name is necessary, but we get " + eventName);
        var eventHandlers = this.eventHandlers[eventName];
        if (eventHandlers instanceof Array) {
            return eventHandlers.reduce(function (result, eventHandler) {
                var returnData = eventHandler.apply(void 0, params);
                if (returnData instanceof Array) {
                    return result.concat(returnData);
                }
                return result;
            }, []);
        }
        return [];
    };
    Plugin.prototype.emitWithLoop = function (eventName, data) {
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        assert(typeof eventName === 'string', "the plugin event's name is necessary, but we get " + eventName);
        var eventHandlers = this.eventHandlers[eventName];
        if (eventHandlers instanceof Array) {
            return eventHandlers.reduce(function (result, eventHandler) {
                var prev = typeof result !== 'undefined' ? result : data;
                var next = eventHandler.apply(void 0, [prev].concat(params));
                return typeof next !== 'undefined' ? next : prev;
            }, undefined);
        }
        return undefined;
    };
    Plugin.prototype.has = function (eventName) {
        var eventHandlers = this.eventHandlers[eventName];
        return eventHandlers instanceof Array && eventHandlers.length > 0;
    };
    return Plugin;
}());

function assertOptions(config) {
    var _a = config.initialState, initialState = _a === void 0 ? {} : _a, _b = config.extraMiddlewares, extraMiddlewares = _b === void 0 ? [] : _b, _c = config.extraEnhancers, extraEnhancers = _c === void 0 ? [] : _c, _d = config.onEffect, onEffect = _d === void 0 ? noop : _d, _e = config.onAction, onAction = _e === void 0 ? noop : _e, _f = config.onReducer, onReducer = _f === void 0 ? noop : _f, _g = config.onSetup, onSetup = _g === void 0 ? noop : _g, _h = config.onError, onError = _h === void 0 ? noop : _h;
    assert(typeof initialState === 'object' && initialState !== null, "initialState must be an Object, but we get " + typeof initialState);
    assert(extraMiddlewares instanceof Array, "extraMiddlewares must be an Array, but we get " + typeof extraMiddlewares);
    assert(extraEnhancers instanceof Array, "extraEnhancers must be an Array, but we get " + typeof extraEnhancers);
    assert(typeof onEffect === 'function', "the onEffect must be an function handler, but we get " + typeof onEffect);
    assert(typeof onAction === 'function', "the onAction must be an function handler, but we get " + typeof onAction);
    assert(typeof onReducer === 'function', "the onReducer must be an function handler, but we get " + typeof onReducer);
    assert(typeof onSetup === 'function', "the onSetup must be an function handler, but we get " + typeof onSetup);
    assert(typeof onError === 'function', "the onError must be an function handler, but we get " + typeof onError);
}
var Zoro = /** @class */ (function () {
    function Zoro(config) {
        var _a;
        if (config === void 0) { config = {}; }
        this.initState = {};
        this.models = {};
        this.modelConfigs = [];
        this.middlewares = [];
        this.enhancers = [];
        this.isSetup = false;
        this.intercepts = (_a = {},
            _a[INTERCEPT_ACTION] = [],
            _a[INTERCEPT_EFFECT] = [],
            _a);
        assertOptions(config);
        var initialState = config.initialState, extraMiddlewares = config.extraMiddlewares, extraEnhancers = config.extraEnhancers, onEffect = config.onEffect, onAction = config.onAction, onReducer = config.onReducer, onSetup = config.onSetup, onError = config.onError;
        this.plugin = new Plugin();
        if (initialState) {
            this.initState = initialState;
        }
        if (extraEnhancers) {
            this.enhancers = extraEnhancers;
        }
        if (onEffect) {
            this.onEffect = onEffect;
        }
        if (onAction) {
            this.onAction = onAction;
        }
        if (onReducer) {
            this.onReducer = onReducer;
        }
        if (onSetup) {
            this.onSetup = onSetup;
        }
        if (onError) {
            this.onError = onError;
        }
        this.middlewares = [effectMiddlewareCreator(this)];
        if (extraMiddlewares) {
            this.middlewares = this.middlewares.concat(extraMiddlewares);
        }
    }
    Zoro.prototype.getRootReducer = function () {
        var _this = this;
        var rootReducer = Object.keys(this.models).reduce(function (reducers, namespace) {
            var model = _this.models[namespace];
            var reducer = model.getReducer();
            if (_this.onReducer) {
                var nextReducer_1 = _this.onReducer(reducer, { namespace: namespace });
                if (typeof nextReducer_1 === 'function') {
                    reducer = nextReducer_1;
                }
                else {
                    console.warn("onReducer need return a Reducer, but we get " + typeof nextReducer_1);
                }
            }
            var nextReducer = _this.getPlugin().emitWithLoop(PLUGIN_EVENT.ON_REDUCER, reducer, { namespace: namespace });
            if (typeof nextReducer === 'function') {
                reducer = nextReducer;
            }
            reducers[namespace] = reducer;
            return reducers;
        }, {});
        return combineReducers(rootReducer);
    };
    Zoro.prototype.getInitState = function () {
        var pluginInitState = this.getPlugin().emitWithLoop(PLUGIN_EVENT.INJECT_INITIAL_STATE, this.initState);
        return __assign({}, this.initState, pluginInitState);
    };
    Zoro.prototype.replaceReducer = function () {
        var rootReducer = this.getRootReducer();
        this.getStore().replaceReducer(rootReducer);
    };
    Zoro.prototype.createModel = function (modelConfig) {
        var nextModelConfig = this.getPlugin().emitWithLoop(PLUGIN_EVENT.ON_BEFORE_CREATE_MODEL, modelConfig);
        if (typeof nextModelConfig !== 'object' || nextModelConfig === null) {
            nextModelConfig = modelConfig;
        }
        var initState = this.getInitState();
        if (typeof nextModelConfig.state === 'undefined' &&
            typeof nextModelConfig.namespace === 'string') {
            nextModelConfig.state = initState[nextModelConfig.namespace];
        }
        var model = new Model(nextModelConfig);
        var namespace = model.getNamespace();
        if (typeof this.models[namespace] !== 'undefined') {
            console.warn("the model namespace must be unique, we get duplicate namespace " + namespace);
            return;
        }
        this.models[namespace] = model;
        this.getPlugin().emit(PLUGIN_EVENT.ON_AFTER_CREATE_MODEL, model);
        return model;
    };
    Zoro.prototype.createModels = function (modelConfigs) {
        var _this = this;
        return modelConfigs.reduce(function (models, modelConfig) {
            var model = _this.createModel(modelConfig);
            if (!model)
                return models;
            models[model.getNamespace()] = model;
            return models;
        }, {});
    };
    Zoro.prototype.injectPluginMiddlewares = function () {
        var pluginMiddlewares = this.getPlugin().emitWithResultSet(PLUGIN_EVENT.INJECT_MIDDLEWARES);
        if (typeof pluginMiddlewares !== 'undefined') {
            assert(pluginMiddlewares instanceof Array, "the inject plugin middlewares must be an Array, but we get " + typeof pluginMiddlewares);
            this.middlewares = this.middlewares.concat(pluginMiddlewares);
        }
    };
    Zoro.prototype.injectPluginEnhancers = function () {
        var pluginEnhancers = this.getPlugin().emitWithResultSet(PLUGIN_EVENT.INJECT_ENHANCERS);
        if (typeof pluginEnhancers !== 'undefined') {
            assert(pluginEnhancers instanceof Array, "the inject plugin enhancers must be an Array, but we get " + typeof pluginEnhancers);
            this.enhancers = this.enhancers.concat(pluginEnhancers);
        }
    };
    Zoro.prototype.injectPluginModels = function () {
        var pluginModels = this.getPlugin().emitWithResultSet(PLUGIN_EVENT.INJECT_MODELS);
        if (typeof pluginModels !== 'undefined') {
            assert(pluginModels instanceof Array, "the inject plugin models must be an Array, but we get " + typeof pluginModels);
            this.setModels(pluginModels);
        }
    };
    Zoro.prototype.createStore = function () {
        var rootReducer = this.getRootReducer();
        this.injectPluginMiddlewares();
        this.injectPluginEnhancers();
        return createReduxStore({
            rootReducer: rootReducer,
            middlewares: this.middlewares,
            enhancers: this.enhancers,
        });
    };
    Zoro.prototype.setupModel = function (models) {
        var _this = this;
        var store = this.getStore();
        Object.keys(models).forEach(function (namespace) {
            var model = models[namespace];
            _this.getPlugin().emit(PLUGIN_EVENT.ON_SETUP_MODEL, model);
            var setup = model.getSetup();
            if (typeof setup === 'function') {
                setup({
                    put: createPut(store, namespace),
                    select: createSelect(store, namespace),
                    selectAll: createSelect(store),
                });
            }
        });
    };
    Zoro.prototype.getPlugin = function () {
        return this.plugin;
    };
    Zoro.prototype.getStore = function () {
        assert(typeof this.store !== 'undefined', 'the redux store is not create before call start()');
        return this.store;
    };
    Zoro.prototype.getIntercepts = function (type) {
        return this.intercepts[type] || [];
    };
    Zoro.prototype.getModel = function (namespace) {
        var model = this.models[namespace];
        assert(typeof model !== 'undefined', "the " + namespace + " model unkown when get model");
        return model;
    };
    Zoro.prototype.getModelEffects = function (namespace) {
        var model = this.models[namespace];
        assert(typeof model !== 'undefined', "the " + namespace + " model unkown when get model effects");
        return model.getEffects();
    };
    Zoro.prototype.setModel = function (modelConfig) {
        var _a;
        this.modelConfigs.push(modelConfig);
        if (this.store) {
            var model = this.createModel(modelConfig);
            if (!model)
                return;
            this.replaceReducer();
            if (this.isSetup) {
                this.setupModel((_a = {}, _a[model.getNamespace()] = model, _a));
            }
        }
    };
    Zoro.prototype.setModels = function (modelConfigs) {
        assert(modelConfigs instanceof Array, "the models must be an Array, but we get " + typeof modelConfigs);
        this.modelConfigs = this.modelConfigs.concat(modelConfigs);
        if (this.store) {
            var models = this.createModels(modelConfigs);
            this.replaceReducer();
            if (this.isSetup) {
                this.setupModel(models);
            }
        }
    };
    Zoro.prototype.setIntercept = function (type, intercept) {
        assert(INTERCEPT_TYPE.indexOf(type) !== -1, "we get an unkown intercept type, it's " + type);
        assert(typeof intercept === 'function', "the intercept must be a Function, but we get " + typeof intercept);
        if (!(this.intercepts[type] instanceof Array)) {
            this.intercepts[type] = [];
        }
        this.intercepts[type].push(intercept);
    };
    Zoro.prototype.usePlugin = function (pluginCreator) {
        assert(typeof pluginCreator === 'function', "the use plugin must be a function, but we get " + typeof pluginCreator);
        pluginCreator(this.getPlugin(), {
            DIVIDER: NAMESPACE_DIVIDER,
            PLUGIN_EVENT: PLUGIN_EVENT,
        });
    };
    Zoro.prototype.start = function (setup) {
        var _this = this;
        if (setup === void 0) { setup = true; }
        this.injectPluginModels();
        this.createModels(this.modelConfigs);
        var store = (this.store = this.createStore());
        store.subscribe(function () {
            var plugin = _this.getPlugin();
            if (plugin.has(PLUGIN_EVENT.ON_SUBSCRIBE)) {
                plugin.emit(PLUGIN_EVENT.ON_SUBSCRIBE, store);
            }
        });
        if (setup) {
            this.setup();
        }
        return store;
    };
    Zoro.prototype.setup = function () {
        if (this.isSetup) {
            return;
        }
        var store = this.getStore();
        this.setupModel(this.models);
        if (typeof this.onSetup === 'function') {
            this.onSetup({
                put: createPut(store),
                select: createSelect(store),
            });
        }
        this.getPlugin().emit(PLUGIN_EVENT.ON_SETUP, store);
    };
    return Zoro;
}());

var dispatcher = {};
var cache = {};
function createDispatch(model, zoro) {
    var namespace = model.getNamespace();
    if (typeof cache[namespace] !== 'undefined') {
        return cache[namespace];
    }
    var modelActionCreators = model.getActionCreators();
    cache[namespace] = Object.keys(modelActionCreators).reduce(function (combine, type) {
        combine[type] = function dispatch(payload, meta, error) {
            var store = zoro.getStore();
            return store.dispatch(modelActionCreators[type](payload, meta, error));
        };
        return combine;
    }, {});
    return cache[namespace];
}
function defineDispatcher(zoro) {
    zoro
        .getPlugin()
        .on(PLUGIN_EVENT.ON_AFTER_CREATE_MODEL, function fn(model) {
        var namespace = model.getNamespace();
        Object.defineProperty(dispatcher, namespace, {
            get: function () {
                return createDispatch(model, zoro);
            },
            set: function () {
                assert(false, 'cannot set the dispatcher');
            },
        });
    });
}

function defineIntercept(app, zoro) {
    app.intercept = {
        action: function (intercept) {
            zoro.setIntercept(INTERCEPT_ACTION, intercept);
        },
        effect: function (intercept) {
            zoro.setIntercept(INTERCEPT_EFFECT, intercept);
        },
    };
}
var App = /** @class */ (function () {
    function App(zoro) {
        assert(zoro instanceof Zoro, 'invalid app option, we need the zoro object');
        this.zoro = zoro;
        defineDispatcher(this.zoro);
        defineIntercept(this, this.zoro);
    }
    App.prototype.model = function (modelConfigs) {
        if (modelConfigs instanceof Array) {
            this.zoro.setModels(modelConfigs);
            return this;
        }
        this.zoro.setModel(modelConfigs);
        return this;
    };
    App.prototype.use = function (plugins) {
        var _this = this;
        if (plugins instanceof Array) {
            plugins.forEach(function (plugin) {
                _this.zoro.usePlugin(plugin);
            });
            return this;
        }
        this.zoro.usePlugin(plugins);
        return this;
    };
    App.prototype.start = function (setup) {
        if (setup === void 0) { setup = true; }
        return this.zoro.start(setup);
    };
    App.prototype.setup = function () {
        this.zoro.setup();
    };
    return App;
}());

var Tracker = /** @class */ (function () {
    function Tracker() {
        this.status = {};
        this.events = {};
    }
    Tracker.prototype.on = function (name, resolve, reject) {
        var events = this.events[name];
        if (!(events instanceof Array)) {
            events = [];
        }
        events.push({ resolve: resolve, reject: reject });
        this.events[name] = events;
    };
    Tracker.prototype.trigger = function (name) {
        var callbacks = this.events[name];
        if (callbacks instanceof Array) {
            callbacks.forEach(function (_a) {
                var resolve = _a.resolve;
                if (typeof resolve !== 'function')
                    return;
                resolve();
            });
            delete this.events[name];
        }
    };
    Tracker.prototype.reject = function (name) {
        var callbacks = this.events[name];
        if (callbacks instanceof Array) {
            callbacks.forEach(function (_a) {
                var reject = _a.reject;
                if (typeof reject !== 'function')
                    return;
                reject();
            });
            delete this.events[name];
        }
    };
    Tracker.prototype.rejectAll = function () {
        var _this = this;
        Object.keys(this.events).forEach(function (name) { return _this.reject(name); });
    };
    Tracker.prototype.get = function (name) {
        return !!this.status[name];
    };
    Tracker.prototype.set = function (name) {
        this.status[name] = true;
        this.trigger(name);
    };
    Tracker.prototype.unset = function (name) {
        if (typeof name === 'string') {
            delete this.status[name];
            this.reject(name);
            return;
        }
        this.status = {};
        this.rejectAll();
    };
    Tracker.prototype.wait = function (name) {
        var _this = this;
        if (this.get(name))
            ;
        return new Promise(function (resolve, reject) {
            _this.on(name, resolve, reject);
        });
    };
    return Tracker;
}());

function defaultMapToProps() {
    return {};
}
function createConnectComponent(store, zoro) {
    assert(isReduxStore(store), 'connectComponent can be call after call setStore');
    return function connectComponent(mapStateToProps, mapDispatchToProps) {
        var shouldMapStateToProps = typeof mapStateToProps === 'function';
        var shouldMapDispatchToProps = typeof mapDispatchToProps === 'function';
        return function createComponentConfig(config) {
            var mapState = shouldMapStateToProps
                ? mapStateToProps
                : defaultMapToProps;
            var mapDispatch = shouldMapDispatchToProps
                ? mapDispatchToProps
                : defaultMapToProps;
            var unsubscribe;
            var ready = false;
            function subscribe() {
                var _this = this;
                if (typeof unsubscribe !== 'function') {
                    return;
                }
                // @ts-ignore
                var mappedState = mapState(store.getState());
                // @ts-ignore
                var currentState = getConnectStoreData(mappedState, this.data);
                var diffData = diff(currentState, mappedState);
                if (typeof diffData === 'undefined')
                    return;
                var connectId = uuid();
                if (typeof zoro === 'object' &&
                    zoro != null &&
                    !(zoro instanceof Array)) {
                    var plugin_1 = zoro.getPlugin();
                    plugin_1.emit(PLUGIN_EVENT.ON_WILL_CONNECT, store, {
                        connectId: connectId,
                        // @ts-ignore
                        name: this.is,
                        currentData: currentState,
                        nextData: mappedState,
                    });
                    // @ts-ignore
                    this.setData(diffData, function () {
                        plugin_1.emit(PLUGIN_EVENT.ON_DID_CONNECT, store, {
                            connectId: connectId,
                            // @ts-ignore
                            name: _this.is,
                        });
                    });
                }
                else {
                    // @ts-ignore
                    this.setData(diffData);
                }
            }
            function attached() {
                if (shouldMapStateToProps) {
                    // @ts-ignore
                    unsubscribe = store.subscribe(subscribe.bind(this));
                    // @ts-ignore
                    subscribe.call(this);
                }
                if (isObject(config.lifetimes) &&
                    typeof config.lifetimes.attached === 'function') {
                    // @ts-ignore
                    config.lifetimes.attached.call(this);
                }
                else if (typeof config.attached === 'function') {
                    // @ts-ignore
                    config.attached.call(this);
                }
                ready = true;
            }
            function detached() {
                if (isObject(config.lifetimes) &&
                    typeof config.lifetimes.detached === 'function') {
                    // @ts-ignore
                    config.lifetimes.detached.call(this);
                }
                else if (typeof config.detached === 'function') {
                    // @ts-ignore
                    config.detached.call(this);
                }
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                    unsubscribe = undefined;
                }
            }
            function show() {
                if (ready &&
                    typeof unsubscribe !== 'function' &&
                    shouldMapStateToProps) {
                    // @ts-ignore
                    unsubscribe = store.subscribe(subscribe.bind(this));
                    // @ts-ignore
                    subscribe.call(this);
                }
                if (isObject(config.pageLifetimes) &&
                    typeof config.pageLifetimes.show === 'function') {
                    // @ts-ignore
                    config.pageLifetimes.show.call(this);
                }
            }
            function hide() {
                if (isObject(config.pageLifetimes) &&
                    typeof config.pageLifetimes.hide === 'function') {
                    // @ts-ignore
                    config.pageLifetimes.hide.call(this);
                }
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                    unsubscribe = undefined;
                }
            }
            var componentConfig = __assign({}, config, { 
                // @ts-ignore
                methods: __assign({}, config.methods, mapDispatch(store.dispatch)) });
            if (isObject(config.lifetimes)) {
                componentConfig.lifetimes.attached = attached;
            }
            else {
                componentConfig.attached = attached;
            }
            if (isObject(config.lifetimes)) {
                componentConfig.lifetimes.detached = detached;
            }
            else {
                componentConfig.detached = detached;
            }
            if (!isObject(config.pageLifetimes)) {
                componentConfig.pageLifetimes = {};
            }
            componentConfig.pageLifetimes.hide = hide;
            componentConfig.pageLifetimes.show = show;
            return componentConfig;
        };
    };
}

var scope = {};
function defaultMapToProps$1() {
    return {};
}
function setStore(store, zoro) {
    assert(isReduxStore(store), 'the store you provider not a standrand redux store');
    scope.store = store;
    if (isObject(zoro)) {
        scope.zoro = zoro;
    }
}
function connect(mapStateToProps, mapDispatchToProps) {
    assert(isReduxStore(scope.store), 'connect can be call after call setStore');
    var shouldMapStateToProps = typeof mapStateToProps === 'function';
    var shouldMapDispatchToProps = typeof mapDispatchToProps === 'function';
    return function createConnectConfig(config) {
        var mapState = shouldMapStateToProps
            ? mapStateToProps
            : defaultMapToProps$1;
        var mapDispatch = shouldMapDispatchToProps
            ? mapDispatchToProps
            : defaultMapToProps$1;
        var unsubscribe;
        var ready = false;
        var loadOption;
        function subscribe(option) {
            var _this = this;
            if (typeof unsubscribe !== 'function') {
                return;
            }
            // @ts-ignore
            var mappedState = mapState(scope.store.getState(), option);
            // @ts-ignore
            var currentState = getConnectStoreData(mappedState, this.data);
            var diffData = diff(currentState, mappedState);
            if (typeof diffData === 'undefined')
                return;
            var connectId = uuid();
            if (typeof scope.zoro === 'object' &&
                scope.zoro != null &&
                !(scope.zoro instanceof Array)) {
                var plugin_1 = scope.zoro.getPlugin();
                plugin_1.emit(PLUGIN_EVENT.ON_WILL_CONNECT, scope.store, {
                    connectId: connectId,
                    // @ts-ignore
                    name: this.route,
                    currentData: currentState,
                    nextData: mappedState,
                });
                // @ts-ignore
                this.setData(diffData, function () {
                    plugin_1.emit(PLUGIN_EVENT.ON_DID_CONNECT, scope.store, {
                        connectId: connectId,
                        // @ts-ignore
                        name: _this.route,
                    });
                });
            }
            else {
                // @ts-ignore
                this.setData(diffData);
            }
        }
        function onLoad(option) {
            loadOption = option;
            if (shouldMapStateToProps) {
                // @ts-ignore
                unsubscribe = scope.store.subscribe(subscribe.bind(this, loadOption));
                // @ts-ignore
                subscribe.call(this, loadOption);
            }
            if (typeof config.onLoad === 'function') {
                // @ts-ignore
                config.onLoad.call(this, loadOption);
            }
            ready = true;
        }
        function onUnload() {
            if (typeof config.onUnload === 'function') {
                // @ts-ignore
                config.onUnload.call(this);
            }
            if (typeof unsubscribe === 'function') {
                unsubscribe();
                unsubscribe = undefined;
            }
        }
        function onShow() {
            if (ready && typeof unsubscribe !== 'function' && shouldMapStateToProps) {
                // @ts-ignore
                unsubscribe = scope.store.subscribe(subscribe.bind(this, loadOption));
                // @ts-ignore
                subscribe.call(this, loadOption);
            }
            if (typeof config.onShow === 'function') {
                // @ts-ignore
                config.onShow.call(this);
            }
        }
        function onHide() {
            if (typeof config.onHide === 'function') {
                // @ts-ignore
                config.onHide.call(this);
            }
            if (typeof unsubscribe === 'function') {
                unsubscribe();
                unsubscribe = undefined;
            }
        }
        return __assign({}, config, mapDispatch(scope.store.dispatch), { onLoad: onLoad,
            onUnload: onUnload,
            onShow: onShow,
            onHide: onHide });
    };
}
function connectComponent(mapStateToProps, mapDispatchToProps) {
    if (typeof scope.store === 'object' &&
        scope.store !== null &&
        !(scope.store instanceof Array)) {
        return createConnectComponent(scope.store, scope.zoro)(mapStateToProps, mapDispatchToProps);
    }
    throw new Error('connectComponent can be call after call setStore');
}

// @ts-ignore
function zoro(config) {
    if (config === void 0) { config = {}; }
    var zoro = new Zoro(config);
    return new App(zoro);
}

export default zoro;
export { Tracker, connect, connectComponent, dispatcher, runtime$1 as regeneratorRuntime, setStore };
