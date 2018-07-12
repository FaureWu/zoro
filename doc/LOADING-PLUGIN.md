### loading plugin使用文档

> loading插件的使用很方便，只需要简单一步便可快速引入

#### 使用方法

```js
import zoro from 'roronoa-zoro'
import { createLoading } from 'roronoa-zoro/plugin'

const app = zoro()
app.use(createLoading())
const store = app.start()
```

#### `createLoading(opt)`

* `opt.namespace` `<String>` 定义loading信息在state中的属性名，可省略，默认值为loading

#### `loading plugin在redux中的存储结构`

```js
{
  loading: {
    global: false,
    model: {
      user: false,
      todos: false,
      ...
    },
    effect: {
      'user/getUser': false,
      ...
    }
  }
}
```

> user, todos皆为model命名（namespace），user/getUser为user model中effect getUser

`state.loading.global` 任意effect发起时会被置为true
`state.loading.model` model中有effect发起时，model对应的属性被置为true
`state.loading.effect` model中的effect发起时，对应的属性被置为true

> 该插件仅仅维护了一个loading state在redux中，使用该状态与redux其他state使用一致
