### Wepy 框架的接入

#### `iwepy` 快速搭建小程序开发环境
[iwepy 完整代码库链接](https://github.com/FaureWu/iwepy)

一整套完整的小程序开发解决方案，集成如下库
[iview-weapp 小程序组件库](https://weapp.iviewui.com/)
[zoro redux框架](https://github.com/FaureWu/zoro)

解决如下问题：
* 全局loading管理
* 异步请求方案
* 全局错误捕获
* redux易用性

### wepy接入zoro库简易demo

#### `wepy/src/app.wpy`

```js
import { setStore } from 'wepy-redux'
import zoro from 'roronoa-zoro'
import { createLoading } from 'roronoa-zoro/plugin'
import testModel from './models/test'

const app = zoro()
app.model(testModel) // 注册单个model或多个model，多个时为数组
app.use(createLoading()) // 注册单个或多个hook，多个时为数组
const store = app.start(false) // 启动并创建store
setStore(store)

export default class extends wepy.app {
  config = {
    pages: [
      'pages/index'
    ],
    window: {
      navigationBarBackgroundColor: '#fafafa',
      navigationBarTitleText: 'iwepy演示小程序',
      navigationBarTextStyle: 'black',
      backgroundTextStyle: 'dark',
      backgroundColor: '#f9f9f9',
    },
    debug: false,
  }

  constructor() {
    super()
    this.use('promisify')
  }

  onLaunch() {
    app.setup()
  }
}
```

#### `wepy/src/models/testModel.js`

```js
import wepy from 'wepy'

export const namespace = 'test'

export default {
  namespace,

  state: {},

  effects: {
    async getTest({ payload: { url } }, { put }) {
      const { data: { data } } = await wepy.request(url)
      put({ type: 'save', payload: data })
    },
  },

  reducers: {
    save({ payload }) {
      return payload
    },
  },
}

```

#### `wepy/src/pages/index.wpy`

```js
import wepy from 'wepy'
import { connect } from 'wepy-redux'
import { apis } from '@/config'
import { actions } from 'roronoa-zoro'
import { namespace } from 'models/test'

@connect(
  state => ({
    name: state[namespace].name,
    description: state[namespace].description,
  }),
  {
    fetchTest: actions(namespace).getTest,
  },
)

export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: 'wepy 演示demo'
  }

  onLoad() {
    const { fetchTest } = this.methods
    fetchTest({ url: apis.getTest })
  }
}

```
