# Model API 介绍

一个model，我们可以看作是redux中state，action，type，reducer以及一个异步中间件effect的集合，一个较为完整的model定义如下：

```js
export default {
    namespace: 'counter',
    state: {
        count: 0,
    },
    setup({ put, select, selectAll }) {
        
    },
    reducers: {
        add(action, state) {
            return { ...state, count: state.count + 1 }
        },
        minus(action, state) {
            return { ...state, count: state.count - 1 }
        },
    },
    effects: {
        async delayAdd(action, { put, select, selectAll }) {
            await delay(2000)
            put({ type: 'add' })
        },
    },
}
```

一个model的定义包含以上5个字段

## namespace `<String>`

model的全局唯一命名，是全局state中注册的key，可用于获取model state，触发model action

## state `<Any>`

state是model初始值，优先级如下：initial state < plugin state < model state，理论上可以是任意的值，但多数情况下，我们希望这是一个javascript的对象

## setup(options) `<Function>`

应用初始化调用`app.start()`或者`app.setup()`时触发，主要设计用于处理本模块中的初始化工作，支持async, await异步语法

* options.put(action) `<Function>`

  用于触发同步action及异步action，支持await等待返回结果

  ```js
  put({ type: 'actionName' }) // 触发本model中的action
  const result = await put({ type: 'asyncActionName' }) // 触发本model中的异步action
  put({ type: 'modelName/actionName' }) // 触发外部model的action
  put({ type: 'modelName/asyncActionName' }) // 触发外部model中的异步action
  ```

  `action参数举例{ type, payload, meta, error }符合标准action定义`

* options.select(handler) `<Function>`

  用于获取本model中的state

  ```js
  const modelState = select()
  // 或者
  const count = select(state => state.count)
  ```

* options.selectAll(handler) `<Function>`

  用于获取全局state

  ```js
  const globalState = selectAll()
  // 或者
  const modelState = selectAll(state => state['modelName'])
  ```

## reducers `<Object>`

用于定义同步action，也是唯一可修改redux state的入口

```js
{
    reducers: {
        add(action, state) {
            // 改变state，返回一个新的state
        }
    }
}
```

## effects `<Object>`

用于定义异步action，支持async，await

```js
{
    effects: {
        async delayAdd(action, { put, select, selectAll }) {
            await delay(2000)
            put({ type: 'add' })
        },
    }
}
```

put，select，selectAll前面已经解释了，这里不再描述