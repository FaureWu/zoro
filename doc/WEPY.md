### Wepy 框架的接入

#### `wepy/src/app.wpy`

```js
import { setStore } from 'wepy-redux'
import zoro from 'roronoa-zoro'
import { loading } from 'roronoa-zoro/plugin'
import testModel from './models/test'

const app = zoro()
app.model(testModel) // 注册单个model或多个model，多个时为数组
app.use(loading) // 注册单个或多个hook，多个时为数组

const store = app.start() // 启动并创建store

setStore(store)

export default class extends wepy.app {
  config = {
    pages: [
      'pages/index'
    ],
    window: {
      navigationBarBackgroundColor: '#fafafa',
      navigationBarTitleText: '果小美商城',
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
