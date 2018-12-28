# mixin插件

mixin插件用于提取公共逻辑，复用于model之间

我们来看一下一个完整的mixin结构

```js
import zoro from '@opcjs/zoro'
import { createMixin } from '@opcjs/zoro-plugin'

const app = zoro()
app.model(...)
app.use(createMixin({
	namespace: 'common',
    state: {},
    reducers: {
        update(action, state) {
            return { ...state, ...action.payload }
        },
    },
    effects: {
        asyncAction(action, { put, select, selectAll }) {
            ...
        }
    },
}))
const store = app.start()
```

可以发现mixin的定义结构除开setup外，定义方法与model一致，详细查看[MODEL API](/API/MODEL.md)，优先级如下：

model > 后定义的mixin > 先定义的mixin

定义好mixin，使用方法如下：

```js
export default {
    namespace: 'model',
    state: {},
    mixins: ['common'],
    effects: {
        async queryData(action, { put }) {
            const { data } = await getDataFromServer()
            // 调用common mixin下的update action
            put({ type: 'update', payload: data })
        }
    }
}
```

## 微信原生小程序中使用

```js
import createMixin from './zoro-mixin'
```

