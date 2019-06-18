# perf插件

perf插件用于收集查看相关性能数据，辅助性能优化

> 此插件需要zoro版本2.3.2及以上

首先看下如何引入该插件

```js
import zoro from '@opcjs/zoro'
import { createPerf } from '@opcjs/zoro-plugin'

const app = zoro()
app.model(...)
// 我们需要传递一个全局变量
// 此变量用于内部挂载相关性能打印函数
// scope在微信小程序环境中是wx，在浏览器环境中是window
app.use(createPerf(scope))
const store = app.start()
```

通过上面的接入，我们会在得到如下四个函数scope.printEffect()，scope.printConnect()，scope.printConnentData()，scope.clear()

## scope.printEffect()

打印异步action的性能数据，如执行次数，每次的执行时间等

<img src="https://gxm-ecommerce.oss-cn-shenzhen.aliyuncs.com/user_upload/rc-upload-1548257687880-2.png" />

## scope.printConnect()

> 由于依赖于connect及connectComponent函数，仅能统计调用了connect和connectComponent相关性能数据，意味着仅能用于使用了以上两个函数的微信小程序中，对于第三方的connect无效，如Taro中connect，wepy中connect，react-redux中connect等

打印组件渲染性能数据，如渲染次数，每次渲染时间等

<img src="https://gxm-ecommerce.oss-cn-shenzhen.aliyuncs.com/user_upload/rc-upload-1548257687880-6.png" />

我们可以针对上面数据排查多余的重复渲染，及适当减少每次connect数据量，仅链接用于渲染的数据等优化手段

## scope.printConnentData(componentName, connectID)

* componentName 必填 <String> 上方获取的Component Name
* connectID 选填 <String> 上方获取的Connect ID

比如我们希望查看`pages/home/modules/carousel/index`组件的每一次更新前后数据对比，执行如下

```js
wx.printConnectData('pages/home/modules/carousel/index')
```

<img src="https://gxm-ecommerce.oss-cn-shenzhen.aliyuncs.com/user_upload/rc-upload-1548257687880-8.png">

可以看出第一个渲染，数据有0个banner变为1个banner，第二次渲染变成了2个banner，并不存在任何无效渲染

那我们如何仅查看第二次渲染数据对比呢？执行如下命令

```js
wx.printConnectData('pages/home/modules/carousel/index', 'c84844da-56f2-4cfe-a1cb-4a0a035b529d')
```

<img src="https://gxm-ecommerce.oss-cn-shenzhen.aliyuncs.com/user_upload/rc-upload-1548257687880-10.png">

## scope.clear()

清除之前获取的性能数据

## 微信小程序中使用

```js
import zoro from './zoro'
import createPerf from './zoro-perf'
import { setStore } from './weapp-redux'

const app = zoro()
app.model(...)
app.use(createPerf(wx))
const store = app.start()

setStore(store, app)
```

## 特别提示

该插件仅用于开发环境辅助性能优化，实际生产中请注释调相关代码

