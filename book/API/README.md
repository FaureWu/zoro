# API文档

## zoro(options) `<Function>`

该函数用于创建zoro应用的app

```js
import zoro from '@opcjs/zoro'
const app = zoro()
```

该函数支持配置参数，参数解释如下

## options.initialState `<Object>`

初始化全局的state值，优先级如下：initial state < plugin state < model state

也就是说相同字段会被上一级覆盖

### options.extraMiddlewares `<Array>`

用于添加额外的redux middleware

### options.extraEnhancers `<Array>`

用于添加额外的redux enhancer

### options.onEffect(action) `<Function>`

监听用户调用model effect action

### options.onAction(action) `<Function>`

监听用户调用model reducer action

> 自2.2.0版本之后调用异步action不再触发onAction

### options.onReducer(modelNamespace, reducer) `<Function>`

用于扩展reducer，比如redux-undo

```js
import zoro from '@opcjs/zoro'
import { undoable } from 'redux-undo'

const app = zoro({
    onReducer(modelNamespace, reducer) {
        return undoable(reducer)
    }
})
```

### options.onSetup(param) `<Function>`

应用启动时触发，当用户调用`app.start(false)`时，需要主动调用app.setup()才会触发

* param.put() `<Function>`

 用于触发同步action或者异步action

```js
import zoro from '@opcjs/zoro'

const app = zoro({
    async onSetup({ put }) {
        await put({ type: 'modelName/asyncActionName' })
        put({ type: 'modelName/actionName' })
    }
})
```

* param.select() `<Function>`

获取全局state状态值

```js
import zoro from '@opcjs/zoro'
const app = zoro({
    async onSetup({ select }) {
        const state = select()
        // 或者
        const modelState = select(state => state['modelName'])
    }
})
```

### options.onError(error) `<Function>`

用于捕获所有的effect中抛出的异常，常用于全局错误处理，详见[全局错误处理](/GUIDE/GLOBAL_ERROR.md)

---



## app.model(params) `<Function>`

该函数用于注册model到应用中，支持注册单个或者多个model，注册多个时参数params为数组

```js
import zoro from '@opcjs/zoro'
const app = zoro()
app.model(model)
app.model([model1, model2])
```

## app.use(params) `<Function>`

该函数用于注册plugin到应用中，支持注册单个或者多个plugin，注册多个时参数params为数组，该函数调用推荐在`app.model`之前调用，否则可能导致部分plugin无法正常工作

```js
import zoro from '@opcjs/zoro'
import { createLoading } from '@opcjs/zoro'
const app = zoro()
app.use(createLoading())
```

## app.start(steup) `<Function>`

启动应用初始化工作

* setup <Boolean> 

  设置是否延迟setup的调用，主要用于微信小程序中延迟到环境ready后调用

## app.setup() `<Function>`

手动调用setup，会触发全局的onSetup函数，model中的setup，plugin中的onSetupModel该函数仅在`app.start(false)`时才需调用

## app.intercept `<Object>`

用于设置相关拦截器，目前支持的拦截器类型如下

* app.intercept.action(handler) `<Function>` 拦截action触发，不包含异步action部分

使用方式举例如下，假如我们希望能拦截user model的所有action，并为其统一添加用户id参数

```js
app.intercept.action(function(action, { store, NAMESPACE_DIVIDER }) {
    const [namespace, actionName] = action.type.split(NAMESPACE_DIVIDER)
    if (namespace === 'user') {
        return { type: action.type, payload: { ...action.payload, memberNo: 'memberNo' } }
    }
})
```

* app.intercept.effect(handler) `<Function>` 拦截异步action触发

该函数与`app.intercept.action`相似，却别在于该函数支持异步模式

使用方式举例如下，假设我们有多个异步请求，他们依赖于登录授权，我们可以为此设置登录拦截器

```js
app.intercept.effect(async function(action, { store, NAMESPACE_DIVIDER }) {
    // 我们通过meta参数noAuth标记该action是否需要授权
    if (action.meta && action.meta.noAuth) return action // 无需授权，直接返回继续执行
    await waitLogin() // 需要授权，等待授权完成
    return action
})
```

---



## dispatcher `<Object>`

用于外部快捷触发action

```js
import { dispatcher } from '@opcjs/zoro'
dispatcher.counter.add()
```

对于异步类型的action可以结合await使用

```js
const result = await dispatcher.counter.asyncAdd()
```

> result为异步action的返回值，更多信息查看[MODEL API](/API/MODEL.md)

 同时也支持Promise语法

```js
dispatcher.counter.asyncAdd().then(...).catch(...)
```

同步类型的action至2.2.5版本之后不再支持.then(...)

---



## connectComponent(mapStateToCom, mapDispatchToCom) `<Function>`

详细使用方法查看[微信原生小程序WEAPP REDUX文档](/API/WEAPP-REDUX.md)

对于taro，wepy支持微信原生小程序组件，因此提供该函数用于连接微信原生组件

