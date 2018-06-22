### Taro 框架的接入

#### `taro/src/app.js`

```js
import Taro, { Component } from 'taro'
import { Provider } from '@tarojs/redux'
import zoro from 'zoro'

const app = zoro()
app.model(...) // 注册单个model
app.models([...]) // 注册多个model
app.use(...) // 注册hook

const store = app.start() // 启动并创建store

class App extends Component {
  config = {
    pages: ['pages/index/index'],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
  }

  render() {
    return <Index />
  }
}

Taro.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
)
```

#### `taro/src/models/testModel.js`

```js
import ajax from '../utils/ajax'

export const namespace = 'test'

export default {
  namespace,

  state: {},

  effects: {
    async queryTest({ payload }, { put }) {
      const { data } = await ajax.get(API.getTest, payload)
      put({
        type: 'save',
        payload: data,
      })

      return data
    },
  },

  reducers: {
    save({ payload }) {
      return payload
    },
  },
}

```

#### `taro/src/pages/index/index.js`

```js
import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { bindActionCreators } from 'redux'
import { actions } from '../../zoro'
import { namespace } from '../../models/test'
import './index.scss'

@connect(
  state => ({
    data: state[namespace],
  }),
  dispatch => bindActionCreators(actions(namespace), dispatch),
)
export default class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
  }

  componentWillMount() {}

  componentDidMount() {
    const { queryTest } = this.props
    queryTest().then(data => console.log(data))
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    const { data } = this.props
    console.log(data)

    return (
      <View className="index">
        <Text>Hello world!</Text>
      </View>
    )
  }
}

```
