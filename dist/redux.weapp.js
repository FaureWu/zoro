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

function assert(validate, message) {
    if ((typeof validate === 'boolean' && !validate) ||
        (typeof validate === 'function' && !validate())) {
        throw new Error(message);
    }
}
function isObject(obj) {
    return typeof obj === 'object' && obj !== null && !(obj instanceof Array);
}
function isReduxStore(store) {
    return (isObject(store) &&
        typeof store.dispatch === 'function' &&
        typeof store.getState === 'function' &&
        typeof store.subscribe === 'function');
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

export { connect, connectComponent, setStore };
