### Zoro Plugin开发

#### `function plugin(pluginEvent, opts) {}`

zoro plugin提供了部分事件
```js
export const PLUGIN_EVENT = {
  INJECT_INITIAL_STATE: 'injectInitialState',
  INJECT_MODELS: 'injectModels',
  INJECT_MIDDLEWARES: 'injectMiddlewares',
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
  // 省略middleware

  return [middleware]
})
```

#### `onWillEffect` 即将要发起一个新的effect时调用
```js
pluginEvent.on('onWillEffect', function(action, store) {
  const { namespace, type } = splitType(action.type, DIVIDER)

  dispatch({
    type: `${loadingNamespace}${DIVIDER}loading`,
    payload: { modelName: namespace, effectName: type },
  })
})
```  

#### `onDidEffect` 一个effect执行完毕时调用
```js
pluginEvent.on('onDidEffect', function(action, store) {
  const { namespace, type } = splitType(action.type, DIVIDER)

  dispatch({
    type: `${loadingNamespace}${DIVIDER}loaded`,
    payload: { modelName: namespace, effectName: type },
  })
})
``` 

#### `onWillAction` 一个action（含effect）即将执行时调用
```js
pluginEvent.on('onWillAction', function(action, store) {
  console.log(action)
})
``` 

#### `onDidAction` 一个action（含effect）执行完毕时调用
```js
pluginEvent.on('onDidAction', function(action, store) {
  console.log(action)
})
``` 

#### `onSetup` 整个框架启动时调用
```js
pluginEvent.on('onSetup', function(store) {
  store.dispatch(...)
})
```

#### `onSubscribe` redux state改变时调用
```js
pluginEvent.on('onSubscribe', function(store) {
  console.log(store.getState())
})
```

#### `onError` redux state改变时调用
```js
pluginEvent.on('onError', function(e, store) {
  console.log(e.message)
})
```

我们内部实现了一个loadingPlugin用于管理全局的loading状态[loading plugin](https://github.com/FaureWu/zoro/tree/master/src/lib/plugin/loadingPlugin.js)
