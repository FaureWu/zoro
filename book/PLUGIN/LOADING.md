# loading插件

loading插件用于管理应用的加载状态，无需再每个页面或者组件中去维护loading态

使用方式方便，易懂

```js
import zoro from '@opcjs/zoro'
import { createLoading } from '@opcjs/zoro-plugin'

const app = zoro()
app.model(...)
app.use(createLoading())
const store = app.start()
```

当我们引入该插件，该插件会在全局添加如下state

```json
{
    "loading": {
        "global": false,
        "model": {},
        "effect": {}
    }
}
```

当我们发起一个异步action，比如dispatcher.user.login()，状态改变如下:

```json
{
    "loading": {
        "global": true,
        "model": {
            "user": true
        },
        "effect": {
            "user/login": true
        }
    }
}
```

当login调用结束，状态改变如下：

```json
{
    "loading": {
        "global": false,
        "model": {
            "user": false
        },
        "effect": {
            "user/login": false
        }
    }
}
```

* global 标记全局中是否有异步action在执行
* model 标记对应model中是否有异步action在执行
* effect 标记某个异步action是否在执行中

## 临时禁止loading 

> zoro-plugin@2.1.1版本及以后支持

某些情况下，我们可能想要禁止某个异步action触发loading

```js
 dispatcher.goods.queryGoods({}, { disableLoading: true })
```

这样本次触发异步action，不再设置loading状态

## 区分loading场景

> zoro-plugin@2.1.1版本及以后支持

对于复杂场景，我们需要区分不同场景或者不同时刻，比如初次加载场景，以及刷新的场景

这是非常常见的场景，对于h5业务或者小程序业务，往往我们为了优化用户体验，在页面首次加载时，会首先呈现骨架屏，再次刷新时，不会显示骨架屏，那么我们如何区分这两个场景呢

比如首次加载场景

```js
dispatcher.goods.queryGoods({}, { loadingKey: 'init' })
```

此时的状态改变如下

```json
{
    "loading": {
        "global": true,
        "model": {
            "user": false,
            "goods": true,
        },
        "effect": {
            "user/login": false
        },
        "init": {
            "goods/queryGoods": true
        }
    }
}
```

再次刷新（指的下拉刷新，或者上拉刷新或者其他方式）

```js
dispatcher.goods.queryGoods()
```

状态改变如下:

```json
{
    "loading": {
        "global": true,
        "model": {
            "user": false,
            "goods": true,
        },
        "effect": {
            "user/login": false,
            "goods/queryGoods": true,
        },
        "init": {
            "goods/queryGoods": false
        }
    }
}
```

## createLoading(option) `<Function>`

* option.namespace `<String>` 定义存储在全局state中的key名，默认值为loading

## 微信原生小程序中使用

```js
import createLoading from './zoro-loading'
```

