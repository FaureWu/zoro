# TARO框架中使用

关于如何使用taro命令行工具快速创建命令，请移步[taro官方文档](https://nervjs.github.io/taro/docs/GETTING-STARTED.html)

创建项目时选择redux模版，该模版是一个计数器的redux版演示demo，我们需要对它进行改造

## STEP1

经过分析模版功能首先完成我们的counter model编写，放置于src/models/counter.js

```js
function delay(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

export default {
    namespace: 'counter',
    state: {
        num: 0,
    },
    effects: {
        async asyncAdd(action, { put }) {
            await delay(2000)
            put({ type: 'add' })
        },
    },
    reducers: {
        add(action, state) {
            return { ...state, num: state.num + 1 }
        },
        minus(action, state) {
         	return { ..state, num: state.num - 1 }  
        },
    },
}
```

## STEP2

修改入口文件src/app.js，移除老的redux相关代码

```jsx
import '@tarojs/async-await'
import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'
import zoro from '@opcjs/zoro' // 引入zoro
import counter from './models/counter' // 引入counter model

import Index from './pages/index'

import './app.scss'

// 通过zoro创建store，移除原有的代码
const app = zoro()
app.model(counter)
const store = app.start(false)

class App extends Component {
  config = {
    pages: [
      'pages/index/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }

  componentDidMount () {
    // 手动触发setup
  	app.setup()
  }

  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))

```

## STEP3

修改src/pages/index.js页面组件

```jsx
import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { dispatcher } from '@opcjs/zoro'

import './index.scss'

@connect(({ counter }) => ({
  counter
}))
class Index extends Component {
  config = {
    navigationBarTitleText: '首页'
  }

  handleAdd = () => dispatcher.counter.add()
  handleMinus = () => dispatcher.counter.minus()
  handleAsyncAdd = () => dispatcher.counter.asyncAdd()

  render () {
    const { counter } = this.props
    return (
      <View className='index'>
        <Button className='add_btn' onClick={this.handleAdd}>+</Button>
        <Button className='dec_btn' onClick={this.handleMinus}>-</Button>
        <Button className='dec_btn' onClick={this.handleAsyncAdd}>async</Button>
        <View><Text>{counter.num}</Text></View>
        <View><Text>Hello, World</Text></View>
      </View>
    )
  }
}

export default Index
```

## STEP4

删除原有的src/store，src/reducers，src/constants，src/actions，src/types目录