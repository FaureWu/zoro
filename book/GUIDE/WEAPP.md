# 微信原生小程序中使用

微信原生小程序安装方法，如有不清楚请查看[安装文档](/INSTALL.md)中的关于微信原生小程序部分的说明

通过微信开发者工具生成空白项目，这是一个简单的hello world工程项目，接下来将会演示如何改造它

## STEP1

分析微信空白项目模版，我们可以改造其中的登录及其用户信息获取模块，创建一个user model

```js
// 3.x版本后，如果开启增强编译，无需引入regeneratorRuntime
import { regeneratorRuntime } from '../utils/zoro'
import { promise } from '../utils/util'

// 首先对于需要使用的接口进行promise化
const wxGetSetting = promise(wx.getSetting)
const wxGetUserInfo = promise(wx.getUserInfo)

export default {
  namespace: 'user',
  state: {
    userInfo: {}, // 给用户信息一个默认值
    canGetUserInfo: false, // 标记用户是否已经授权
  }, 
  effects: {
    async login() {
      const { code } = await wxLogin()
      // 发送code到后台服务器中获取openId, sessionKey, unionId
    },
    async getUserInfo() {
      const { authSetting } = await wxGetSetting()
      if (authSetting['scope.userInfo']) {
        const { userInfo } = await wxGetUserInfo()
        put({ type: 'update', payload: { userInfo, canGetUserInfo: true } })
      } else {
         put({ type: 'update', payload: { canGetUserInfo: false } })
      }
    },
  },
  reducers: {
    update({ payload }, state) {
      return { ...state, ...payload }
    },
  },
}
```

这里有一个需要注意的地方，为什么我们需要在头部引入regeneratorRuntime呢？因为在该文件中我们使用到了新语法async，await

无论在哪个文件中，只要我们使用了async，await都必须在头部引入regeneratorRuntime

> 如开启了开发工具的增强编译，无需引入regeneratorRuntime

## STEP2

 修改入口文件app.js

```js
import zoro from './utils/zoro'
import { setStore } from './utils/weapp-redux'
// 新增引入user model
import user from './models/user'

const app = zoro()
// 新增引入user model
app.model(user)
const store = app.start(false)

setStore(store)

App({
  onLaunch() {
    app.setup()
    // 触发登录
    dispatcher.user.login()
    /* 删除原有代码逻辑
     wx.login({
       success: res => {
         // 发送 res.code 到后台换取 openId, sessionKey, unionId
       }
     })
    */
    // 触发获取用户信息
    dispatcher.user.getUserInfo()
    /* 删除原有代码逻辑
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    */
  }
  /* 删除原有逻辑
  globalData: {
    userInfo: null
  }
  */
})
```

## STEP3

修改pages/index页面

```js
import { dispatcher } from '../../utils/zoro'
import { connect } from '../../utils/weapp-redux'

// 链接state到页面，返回值用于注册到微信Page中
const config = connect(state => ({
  userInfo: state.user.userInfo,
  hasUserInfo: state.user.hasUserInfo,
}))({
  data: {
    motto: 'Hello World',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  getUserInfo: function(e) {
    // 更新用户数据
    dispatcher.user.update({ userInfo: e.detail.userInfo, hasUserInfo: true })
  }
})

Page(config)
```

值得注意的是connect用于连接redux数据到页面中，对于自定义组件则需要用到connectComponent函数，用法与connect一致