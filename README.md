# Zoro

基于 [redux](https://github.com/reactjs/redux)、[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)的轻量级前端框架。

---

### 如何安装
```bash
npm install --save roronoa-zoro

or 

yarn add roronoa-zoro
```

### 文档快捷导航

* [开发自定义的plugin](https://github.com/FaureWu/zoro/tree/master/doc/PLUGIN.md)
* [接入taro框架](https://github.com/FaureWu/zoro/tree/master/doc/TARO.md)
* [接入wepy框架](https://github.com/FaureWu/zoro/tree/master/doc/WEPY.md)
* [react-redux接入文档](https://github.com/FaureWu/zoro/tree/master/doc/REACT-REDUX.md)

### 结合第三方库
* [taro](https://taro.aotu.io): 基于[react](https://github.com/facebook/react)多端统一开发框架 [taro接入文档](https://github.com/FaureWu/zoro/tree/master/doc/TARO.md)
* [wepy](https://tencent.github.io/wepy/): 基于[vue](https://cn.vuejs.org/v2/guide/)微信小程序组件化开发框架WePY [wepy接入文档](https://github.com/FaureWu/zoro/tree/master/doc/WEPY.md)
* [react-redux](https://redux.js.org/basics/usage-with-react): 配合第三方应用生成器如[create-react-app](https://github.com/facebook/create-react-app) [react-redux接入文档](https://github.com/FaureWu/zoro/tree/master/doc/REACT-REDUX.md)

### 导出的文件

#### roronoa-zoro
默认导出的文件

#### roronoa-zoro/plugin
导出内置定义好的plugin, 目前内置的plugin有: 
[如何开发自己的plugin](https://github.com/FaureWu/zoro/tree/master/doc/PLUGIN.md)
* **loading** 统一处理异步加载状态
```js
import zoro from 'roronoa-zoro'
import { loading } from 'roronoa-zoro/plugin'

const app = zoro()
app.use(loading)

...
```
该插件会在state的存储loading状态
**state.loading**
```json
{
  "global": false,
  "model": {
    "modelNamespace": false
  },
  "effect": {
    "modelNamespace/effectName": false
  }
}
```

### zoro API

#### `const app = zoro(opts)`

创建redux app，并且返回zoro的接口

`opts` `<Object>` 包含如下可配置属性
* `initialState` `<Object>` 初始化redux应用state，优先级如下：initialState < plugin initialState < model state
* `onEffect(action)` `<Function>` 执行effect action时触发该事件
* `onAction(action)` `<Function>` 执行action 时触发该事件，包含effect action, reducer action
* `onSetup({ put, select })` `<Function>`redux应用启动时执行
  * `put(action)` `<Function>` 用于发起一个action或者effect
  * `select(handler)` `<Function>` 用于获取当前的最新的state
* `onError(e)` `<Function>` 执行effect出错时触发该事件

#### `app.model()`

注册model到应用，可以注册一个或者多个，多个时参数为数组

#### `app.use()`

注册plugin，可以注册一个或者多个，多个时参数为数组

#### `app.start()`

启动应用，并返回redux store

#### `import { actions } from 'roronoa-zoro'`

根据命名空间获取actions
```js
import { actions } from 'roronoa-zoro'
import { connect } from 'react-redux'

const modelActions = actions(modelName)
const mapStateToProps = state => ({})
const mapDispatchToProps = dispatch => ({
  queryData: (params) => dispatch(modelActions.queryData(params))
})

connect(mapStateToProps, mapDispatchToProps)(Com)
```

所有的effect action 通过dispatch调用都返回一个Promise对象
action的参数为(payload, meta, error)

### 如何定义一个model `<Object>`
```js
export default {
  namespace: 'modelName', // 该model的名称
  setup: function({ put, select, selectAll }) {}, // model启动时调用
  state: {}, // 默认的state，可以是任意格式数据
  reducers: {}, // reducer action定义
  effects: {}, // 副作用action，主要用于处理异步
}
```

#### `namespace` `<String>`

model命名空间，需要保证唯一值

#### `setup({ put, select, selectAll })` `<Function>`
* `put(action) <Function>` 发起一个redux action
* `select(handler) <Function>` 获取当前model的state, 返回值为获取到的state
  * `handler(state) <Function>`
* `selectAll(handler) <Function>` 获取整个redux state值，返回值为获取的state
  * `handler(state) <Function>` 

你可以在这个初始化函数中执行一些初始化action，比如获取异步配置信息等

#### `state` `<Any>`

model的默认state

#### `reducers` `<Object>`

model的reducer定义
```js
export default {
  namespace: 'model',
  state: 0,
  reducers: {
    add(action, state) {
      return state + 1
    },
  },
}
```

#### `effects` `<Object>`
```js
const delay = function(time) {
  return new Promise((resolve, reject) => {
    setTimeout(time, resolve)
  })
}

export default {
  namespace: 'model',
  state: 0,
  reducers: {
    add(action, state) {
      return state + 1
    },
  },
  effects: {
    // 异步effect
    async delayAdd(action, { put, select, selectAll }) {
      await delay(1000)
      put({ type: 'add' })
    },
    // effect中调用异步effect
    async delayToDelayAdd(action, { put }) {
      await delay(1000)
      await put({ type: 'delayAdd' })
    },
    // 同步effect
    noneDelay(action, { put }) {
      put({ type: add })
    },
  },
}
```
