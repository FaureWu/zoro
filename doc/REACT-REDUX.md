### react-redux 中的接入

#### `react-redux/src/index.js`

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import zoro from 'roronoa-zoro'
import { createLoading } from 'roronoa-zoro/plugin'
import testModel from './models/test'
import App from './components/App'

const app = zoro()
app.model(testModel) // 注册单个model或多个model，多个时为数组
app.use(createLoading()) // 注册单个或多个hook，多个时为数组

const store = app.start() // 启动并创建store

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

#### `react-redux/src/models/test.js`

```js
import axios from 'axios'

export const namespace = 'test'

export default {
  namespace,

  state: {},

  effects: {
    async queryTest({ payload }, { put }) {
      const { data } = await axios.get(API.getTest, payload)
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

#### `react-redux/src/componets/App.js`

```js
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { actions } from 'roronoa-zoro'
import { namespace } from '../models/test'

const mapStateToProps = state => ({
  name: state[namespace].name,
  description: state[namespace].description,
})
const mapDispatchToProps = dispatch => ({
  queryTest: () => dispatch(actions(namespace).queryTest())
})

class App extends Component {
  componentDidMount() {
    const { queryTest } = this.props
    queryTest()
  }

  render() {
    const { name, description } = this.props
    return (
      <div>
        <div>{name}</div>
        <div>{description}</div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

```
