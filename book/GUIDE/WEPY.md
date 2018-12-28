# WEPY框架中使用

关于如何使用wepy命令行工具快速创建命令，请移步[wepy官方文档](https://tencent.github.io/wepy/document.html#/./doc.cli)

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
  		asyncNum: 0
    },
    effects: {
        async asyncIncrement(action, { put, select }) {
            const { asyncNum } = select()
            await delay(1000)
            put({ type: 'update', payload: { asyncNum: asyncNum + 1 } })
        },
    },
    reducers: {
        update({ payload }, state) {
            return { ...state, ...payload }
        },
        increment(action, state) {
            return { ...state, num: state.num + 1 }
        },
        decrement(action, state) {
            return { ...state, num: state.num - 1 }
        },
    },
}
```

## STEP2

修改src/components/counter.wpy组件

```vue
<script>
  import wepy from 'wepy'
  import { connect } from 'wepy-redux'
  import { dispatcher } from '@opcjs/zoro'

  // step1，删除action的导入，仅导入state
  @connect({
    stateNum (state) {
      return state.counter.num
    },
    asyncNum (state) {
      return state.counter.asyncNum
    },
  })

  export default class Counter extends wepy.component {
    methods = {
      // step2，新增如下三个方法代替原有connect的三个action
      incNum () {
      	dispatcher.counter.increment()
      },
      decNum () {
       	dispatcher.counter.decrement()  
      },
      asyncInc () {
        dispatcher.counter.asyncIncrement()
      },
    }
  }
</script>

```

## STEP3

修改入口文件src/app.wpy

```vue
<script>
import wepy from 'wepy'
import 'wepy-async-function'
import { setStore } from 'wepy-redux'

// 其他原有的代码由于较多，已省略，仅显示修改点
    
// step1，引入zoro
import zoro from '@opcjs/zoro'
import counter from './models/counter'

// step2，创建store
const app = zoro()
app.model(counter)
const store = app.start(false)
setStore(store)

export default class extends wepy.app {
  onLaunch() {
    // 手动触发setup
    app.setup()
  }
}
</script>

```

## STEP4

 删除src/stores目录