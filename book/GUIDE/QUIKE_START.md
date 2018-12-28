# 快速开始

这里我们以一个简单的React记数器应用来快速的了解zoro的使用方法，首先让我们看一下计数器实现代码

```jsx
import React, { Component } from 'react'
import { render } from 'react-dom'

class Counter extends Component {
    state = {
        count: 0,
    }
    
	handleAdd = () => this.setState({ count: this.state.count + 1 })
	handleReduce = () => this.setState({ count: this.state.count - 1 })

    render() {
        const { count } = this.state
        
        return (
        	<div>
            	<div onClick={this.handleAdd}>+</div>
                <div>{count}</div>
                <div onClick={this.handleReduce}>-</div>
            </div>
        )
    }
}

render(<Counter />, rootNode)
```

这是一个很简易的计数器应用，虽然这样如此小型应用引入redux或者zoro是完全没有必要的，这里仅仅是为了让你对zoro的特性有一个大体的了解

接下来我们一起用zoro来改造这个应用

首先我们需要引入redux与react结合库react-redux，以及zoro库

```js
import { Provider } from 'react-redux'
import zoro from '@opcjs/zoro'
```

创建redux的store

```js
const app = zoro()
const store = app.start()
```

将创建好的store注入到应用中

```jsx
render(<Provider store={store}><Counter /></Provider>, rootNode)
```

此时应用的创建已经完成，但是这样似乎还没有什么用，我们缺乏redux中状态的处理函数reducer的实现，在zoro中有一个特性叫做model，用于定义数据处理流程，首先我们实现计数器的model，名字就叫counter

```js
export default {
    namespace: 'counter',
    state: {
        count: 0,
    },
    reducers: {
        add(action, state) {
            return { count: state.count + 1 }
        },
        reduce(action, state) {
            return { count: state.count -1 }
        },
    },
}
```

我解释下model的定义，每一个model都有一个全局唯一的命名空间namespace，后续会介绍这有什么用，model中存放数据在state中，这里的state与redux中的state基本一致，reducers用于定义同步数据处理的action，我们定义了两个action，一个增加计数器1，一个减少计数器1，model的详细定义查看[MODEL API](/API/MODEL.md)

引入model到zoro中

```js
import counter from './models/counter'

const app = zoro()
app.model(counter) // 新增引入counter
const store = app.start()
```

修改我们的counter组件

```jsx
import { connect } from 'react-redux'
import { dispatcher } from '@opcjs/zoro'

class Counter extends Component {
    // state = {
    //    count: 0,
    // }
    
   	// handleAdd = () => this.setState({ count: this.state.count + 1 })
	// handleReduce = () => this.setState({ count: this.state.count - 1 })
    
	handleAdd = () => dispatcher.counter.add()
	handleReduce = () => dispatcher.counter.reduce()

    render() {
        // const { count } = this.state
        const { count } = this.props
        
        return (
        	<div>
            	<div onClick={this.handleAdd}>+</div>
                <div>{count}</div>
                <div onClick={this.handleReduce}>-</div>
            </div>
        )
    }
}

const CCounter = connect(({ counter }) => ({
    count: counter.count,
}), null)(Counter)

render(<Provider store={store}><CCounter /></Provider>, rootNode)
```

就此，一个完整的改造就完成了，在上面的例子中，你可能注意到了dispatcher，这是一个action的触发器，比如我们想要出发计数器加一，我们可以调用dispatcher.counter.add()，这里的counter就是前面model定义时的namespace

完整改造代码如下

#### ./model/counter.js

```js
export default {
    namespace: 'counter',
    state: {
        count: 0,
    },
    reducers: {
        add(action, state) {
            return { count: state.count + 1 }
        },
        reduce(action, state) {
            return { count: state.count -1 }
        },
    },
}
```

./index.js

```jsx
import React, { Component } from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import zoro, { dispatcher } from '@opcjs/zoro'

import counter from './models/counter'

const app = zoro()
app.model(counter)
const store = app.start()

class Counter extends Component {
	handleAdd = () => dispatcher.counter.add()
	handleReduce = () => dispatcher.counter.reduce()

    render() {
        const { count } = this.props
        
        return (
        	<div>
            	<div onClick={this.handleAdd}>+</div>
                <div>{count}</div>
                <div onClick={this.handleReduce}>-</div>
            </div>
        )
    }
}

const CCounter = connect(({ counter }) => ({
    count: counter.count,
}), null)(Counter)

render(<Provider store={store}><CCounter /></Provider>, rootNode)
```

## 异步数据流

 上面我们介绍了如何通过zoro处理同步数据流的问题，那我们的异步数据流该怎么处理呢

异步数据流的处理主要依靠model的effect，这是一个封装过后的redux异步中间件，支持async，await语法

我们扩展一下上面计数器的功能，在计数器加减之前需要去后台请求获取可变化的计数范围

修改counter model

```js
import axios from 'axios'

export default {
    namespace: 'counter',
    state: {
        count: 0,
        max: 0, // 新增max数据
    },
    effects: {
        // 新增请求最大计数值的异步action
        async queryCounterRange(action, { put }) {
            const { max = 0 } = await axios.get('serverHost/couter/range')
            put({ type: 'update', payload: { max } })
        },
    },
    reducers: {
        // 新增update同步action
        update({ payload }, state) {
            return { ...state, ...payload }
        },
        add(action, state) {
            return { count: state.count + 1 }
        },
        reduce(action, state) {
            return { count: state.count -1 }
        },
    },
}
```

我们新增了一个异步action，queryCounterRange，他会请求后台服务，获取可增加的最大值，并通过update action存储到state中供界面使用

修改counter组件

```jsx
import React, { Component } from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import zoro, { dispatcher } from '@opcjs/zoro'

import counter from './models/counter'

const app = zoro()
app.model(counter)
const store = app.start()

class Counter extends Component {
    componentDidMount() {
        // 页面初始化后触发请求计数最大值
        dispatcher.counter.queryCounterRange()
    }
	handleAdd = () => {
        // 增加计数值判定
        const { count, max } = this.props
        if (count < max) {
            dispatcher.counter.add()
        }
    }
	handleReduce = () => {
        // 增加计数值判定
        const { count } = this.props
        if (count > 0) {
            dispatcher.counter.reduce()
        }
    }
    render() {
        const { count } = this.props
        
        return (
        	<div>
            	<div onClick={this.handleAdd}>+</div>
                <div>{count}</div>
                <div onClick={this.handleReduce}>-</div>
            </div>
        )
    }
}

const CCounter = connect(({ counter }) => ({
    count: counter.count,
    // 增加最大计数值导入
    max: counter.max,
}), null)(Counter)

render(<Provider store={store}><CCounter /></Provider>, rootNode)
```

更多特性请查看[API文档](/API/README.md)
