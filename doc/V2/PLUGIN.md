### zoro plugin开发文档

#### `function plugin(pluginEvent, opts) {}`

#### `opts` `<Object>`
* `DIVIDER` `<String>` model命名空间与action的分隔符
* `PLUGIN_EVENT` `<Object>` zoro提供的plugin event事件对象

zoro plugin提供了部分事件
```js
export const PLUGIN_EVENT = {
  INJECT_INITIAL_STATE: 'injectInitialState',
  BEFORE_INJECT_MODEL: 'beforeInjectModel',
  INJECT_MODELS: 'injectModels',
  AFTER_INJECT_MODEL: 'afterInjectModel',
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

#### `injectInitialState` 注入初始化state, 返回值为新的initialState
```js
pluginEvent.on('injectInitialState', function(initialState) {
  return { ...initialState, ...customInitalState }
})
```

#### `beforeInjectModel` 注入model前执行，返回值为新的model定义
```js
pluginEvent.on('beforeInjectModel', function(model) {
  return { ...model, ...extraModel }
})
```

#### `afterInjectModel` 注入model完成后
```js
pluginEvent.on('afterInjectModel', function(model) {
  return { ...model, ...extraModel }
})
```

#### `injectModels` 注入新的models，返回值为需要注入的model数组
```js
pluginEvent.on('injectModels', function() {
  // 省略loadingModel定义

  return [loadingModel]
})
```

#### `injectMiddlewares` 注入middleware, 返回值需要注入的middleware数组
```js
pluginEvent.on('injectMiddlewares', function() {
  // 省略middleware定义

  return [middleware]
})
```

#### `injectEnhancers` 注入enhancer, 返回值需要注入的enhancer数组
```js
pluginEvent.on('injectEnhancers', function() {
  // 省略enhancer定义

  return [enhancer]
})
```

#### `onReducer` 定义重定义reducer
```js
pluginEvent.on('onReducer', function(namespace, reducer) {
  return undoable(reducer)
})
```

#### `onWillEffect` 即将要发起一个新的effect时触发
```js
pluginEvent.on('onWillEffect', function(action, store) {
  const { namespace, type } = splitType(action.type, DIVIDER)

  dispatch({
    type: `${loadingNamespace}${DIVIDER}loading`,
    payload: { modelName: namespace, effectName: type },
  })
})
```  

#### `onDidEffect` 一个effect执行完毕时触发
```js
pluginEvent.on('onDidEffect', function(action, store) {
  const { namespace, type } = splitType(action.type, DIVIDER)

  dispatch({
    type: `${loadingNamespace}${DIVIDER}loaded`,
    payload: { modelName: namespace, effectName: type },
  })
})
``` 

#### `onWillAction` 一个action（含effect）即将执行时触发
```js
pluginEvent.on('onWillAction', function(action, store) {
  console.log(action)
})
``` 

#### `onDidAction` 一个action（含effect）执行完毕时触发
```js
pluginEvent.on('onDidAction', function(action, store) {
  console.log(action)
})
``` 

#### `onSetup` 整个框架启动时触发
```js
pluginEvent.on('onSetup', function(store) {
  store.dispatch(...)
})
```

#### `onSubscribe` redux state改变时触发
```js
pluginEvent.on('onSubscribe', function(store) {
  console.log(store.getState())
})
```

#### `onError` redux effect抛出错误时触发
```js
pluginEvent.on('onError', function(e, action, store) {
  console.log(e.message)
})
```


更多自定义plugin的使用方法，请参考内置plugin源码
[loading plugin](https://github.com/FaureWu/zoro/tree/master/src/lib/plugin/loadingPlugin.js) [extend plugin](https://github.com/FaureWu/zoro/tree/master/src/lib/plugin/extendModelPlugin.js)

