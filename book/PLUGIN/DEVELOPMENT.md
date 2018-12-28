# 插件开发

插件的定义如下：

```js
export default function plugin(event, option) {}
```

## option `<Object>`

* option.DIVIDER `<String>` 分隔modalName与actionName的符号，值为`/`
* option.PLUGIN_EVENT `<String>` 完整的支持的事件名称定义

## event `<Object>`

通过event事件监听器，我们可以获取到整个应用在加载过程中，触发的事件，通过这些事件，可以灵活实现各种功能，比如内置的loading插件实现，利用如下3个事件实现:

```js
function(event, { DIVIDER, PLUGIN_EVENT }) {
    // 创建一个loading的model
    const loadingModel = createLoadingModel(loadingNamespace)
	
    // 利用model注入事件，注入loading model到应用中
    event.on(PLUGIN_EVENT.INJECT_MODELS, function() {
      return [loadingModel]
    })
	
    // 监听异步action执行开始时，设置对应的loading状态
    event.on(PLUGIN_EVENT.ON_WILL_EFFECT, function(action, { dispatch }) {
      const { namespace, type } = splitType(action.type, DIVIDER)

      dispatch({
        type: `${loadingNamespace}${DIVIDER}loading`,
        payload: { modelName: namespace, effectName: type },
        meta: action.meta,
      })
    })
	
    // 监听异步action执行结束时，设置对应的loading状态
    event.on(PLUGIN_EVENT.ON_DID_EFFECT, function(action, { dispatch }) {
      const { namespace, type } = splitType(action.type)

      dispatch({
        type: `${loadingNamespace}${DIVIDER}loaded`,
        payload: { modelName: namespace, effectName: type },
        meta: action.meta,
      })
    })
  }
```

loading model的具体实现，这里不列出了，有兴趣的可以直接去[LOADING插件源码](https://github.com/FaureWu/zoro-plugin/blob/master/src/loading.js)

## PLUGIN_EVENT

```js
PLUGIN_EVENT = {
  INJECT_INITIAL_STATE: 'injectInitialState',
  BEFORE_INJECT_MODEL: 'beforeInjectModel',
  AFTER_INJECT_MODEL: 'afterInjectModel',
  INJECT_MODELS: 'injectModels',
  INJECT_MIDDLEWARES: 'injectMiddlewares',
  INJECT_ENHANCERS: 'injectEnhancers',
  ON_REDUCER: 'onReducer',
  ON_CREATE_MODEL: 'onCreateModel',
  ON_SETUP_MODEL: 'onSetupModel',
  ON_WILL_EFFECT: 'onWillEffect',
  ON_DID_EFFECT: 'onDidEffect',
  ON_WILL_ACTION: 'onWillAction',
  ON_DID_ACTION: 'onDidAction',
  ON_SETUP: 'onSetup',
  ON_SUBSCRIBE: 'onSubscribe',
  ON_ERROR: 'onError',
}
```

## PLUGIN_EVENT.INJECT_INITIAL_STATE

用于注入初始化state, 返回值为新的initialState

```js
event.on(PLUGIN_EVENT.INJECT_INITIAL_STATE, function(initialState) {
  // 添加自定义的初始化customInitalState
  return { ...initialState, ...customInitalState }
})
```

## PLUGIN_EVENT.BEFORE_INJECT_MODEL

注入model前执行，返回值为修改过后的model定义

```js
event.on(PLUGIN_EVENT.BEFORE_INJECT_MODEL, function(modelOption) {
  return { ...modelOption, ...newModelOption }
})
```

## PLUGIN_EVENT.AFTER_INJECT_MODEL

注入model后执行

```js
event.on(PLUGIN_EVENT.AFTER_INJECT_MODEL, function(modelOption) {})
```

## PLUGIN_EVENT.INJECT_MODELS

注入新的models，返回值为需要注入的model数组

```js
event.on(PLUGIN_EVENT.INJECT_MODELS, function() {
    return [modelOption]
})
```

## PLUGIN_EVENT.INJECT_MIDDLEWARES

注入middleware, 返回值需要注入的middleware数组

```js
event.on(PLUGIN_EVENT.INJECT_MIDDLEWARES, function() {
    return [middleware]
})
```

## PLUGIN_EVENT.INJECT_ENHANCERS

注入enhancer, 返回值需要注入的enhancer数组

```js
event.on(PLUGIN_EVENT.INJECT_ENHANCERS, function() {
    return [enhancer]
})
```

## PLUGIN_EVENT.ON_REDUCER

重定义reducer

```js
event.on(PLUGIN_EVENT.ON_REDUCER, function(namespace, reducer) {
	return undoable(reducer)
})
```

## PLUGIN_EVENT.ON_CREATE_MODEL

创建model完成后执行，此时的model不再是配置，而是真正的model对象

```js
event.on(PLUGIN_EVENT.ON_CREATE_MODEL, function(model) {})
```

## PLUGIN_EVENT.ON_SETUP_MODEL

调用`app.start()`或者`app.setup()`时触发

```js
event.on(PLUGIN_EVENT.ON_SETUP_MODEL, function(model) {})
```

## PLUGIN_EVENT.ON_WILL_EFFECT

调用异步action时触发

```js
event.on(PLUGIN_EVENT.ON_WILL_EFFECT, function(action, store) {})
```

## PLUGIN_EVENT.ON_DID_EFFECT

调用异步action结束时触发

```js
event.on(PLUGIN_EVENT.ON_DID_EFFECT, function(action, store) {})
```

## PLUGIN_EVENT.ON_WILL_ACTION

调用同步action时触发

```js
event.on(PLUGIN_EVENT.ON_WILL_ACTION, function(action, store) {})
```

## PLUGIN_EVENT.ON_DID_ACTION

调用同步action结束时触发

```js
event.on(PLUGIN_EVENT.ON_DID_ACTION, function(action, store) {})
```

## PLUGIN_EVENT.ON_SETUP

调用`app.start()`或者`app.setup()`时触发

```js
event.on(PLUGIN_EVENT.ON_SETUP, function(store) {})
```

## PLUGIN_EVENT.ON_SUBSCRIBE

redux状态改变时调用

```js
event.on(PLUGIN_EVENT.ON_SUBSCRIBE, function(store) {})
```

## PLUGIN_EVENT.ON_ERROR

异步action发生异常时触发

```js
event.on(PLUGIN_EVENT.ON_ERROR, function(error, action, store) {})
```

