### 微信原生小程序接入

> 由于微信原生小程序不支持npm包安装，需要手动引入

#### 如何安装

克隆仓库到本地
```bash
git clone https://github.com/FaureWu/zoro.git
```

安装依赖
```bash
cd ./zoro
npm install
```
or
```bash
cd ./zoro
yarn
```

构建仓库
```bash
npm run build
```
or
```bash
yarn build
```

以上命令会生成一个dist文件夹，拷贝整个dist文件夹到原生小程序根目录下，重命名为 `zoro`

dist目录下会生成两个文件:
* `zoro` 本仓库主入口文件
* `weapp-redux` 用于链接redux和weapp的库，提供setStore，connect工具
  * `setStore` 设置store
  * `connect(mapStateToProps, mapDispatchToProps)(pageConfig)` 只可用于链接到page中，无法链接到app中
  * `connectComponent(mapStateToProps, mapDispatchToProps)(componentConfig)` 用于链接到原生小程序component组件中

#### `weapp/app.js`
```js
import zoro from './zoro/zoro'
import { setStore } from './zoro/weapp-redux'
import demoModel from './models/demo'

const app = zoro()
app.model(demoModel) // 注册单个model或多个model，多个时为数组

const store = app.start(false) // 启动并创建store, 阻止默认初始化动作

setStore(store)

App({
  onLaunch: function () {
    app.setup() // 启动初始化
  },
  ...
})

```

由于微信原生小程序的wx.request不支持Promise化调用，需要进行一次封装

#### `weapp/utils/request`

这里仅仅是一个案例，你需要根据实际情况封装即可

```js
export default params =>
  new Promise((resolve, reject) =>
    wx.request({
      ...params,
      success: resolve,
      fail: reject,
    })
```

#### `weapp/models/testModel.js`

```js
import { regeneratorRuntime } from '../zoro/zoro' // 需要在使用到async, await的文件中引入regeneratorRuntime
import request from '../utils/request'

export default {
  namespace: 'demo',
  state: {},
  effects: {
    async queryData({ payload }, { put }) {
      const { data } = await request({ url: '/demo', data: payload }, payload)
      put({
        type: 'save',
        payload: data,
      })
    },
  },
  reducers: {
    save({ payload }) {
      return payload
    },
  },
}

```

#### `weapp/pages/index/index.js`

```js
import { dispatcher } from '../../zoro/zoro'
import { connect } from '../../zoro/weapp-redux'

// connect支持两个参数mapStateToProps, mapDispatchToProps
// 使用方法参考，仅支持前两个参数https://github.com/reduxjs/react-redux/blob/HEAD/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options

// connect会把数据合并到data中
const config = connect(
  state => ({
    demo: state.demo,
  }),
)({
  data: { ... },
  onLoad: function () {
    dispatcher.demo.queryData()
  },
})

Page(config)

```
