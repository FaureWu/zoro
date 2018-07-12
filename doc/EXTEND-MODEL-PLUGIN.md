### extend model plugin使用文档

> extend model plugin用于实现model与model之间的公用逻辑

> 支持定义多个plugin

#### 使用方法

```js
import zoro from 'roronoa-zoro'
import { extendModel } from 'roronoa-zoro/plugin'

const app = zoro()
app.use(extendModel({
  state: {},
  reducers: {
    updateState(action, state) {
      return { ...state, ...action.payload }
    },
  },
}))
const store = app.start()
...
```

#### `extendModel(opt)`

* `opt.state` `<Any>` 定义公共state，用于合入model的state中, 优先级低于model state，相同字段会被覆盖
* `opt.reducers` `<Object>` 定义公共reducers，用于合入model的reducers中，优先级低于model reducers，相同会被覆盖
* `opt.effects` `<Object>` 定义公共effects，用于合入model的effects中，优先级低于model effects，相同会被覆盖
* `opt.includeModels` `<Array>` 定义所要涵盖的model，值为model namespace
* `opt.excludeModels` `<Array>` 定义要排除的model，值为model namespace

> 当`includeModels`和`excludeModels`都未定义时，默认涵盖所有的model，`includeModels`优先级高于`excludeModels`，意味着假如有如下场景，我们定义`includeModels: ['model1', 'model2']`，并且定义`excludeModels: ['model2']`，实则excludeModels被忽略，涵盖的model有`model1` `model2`

#### 使用场景

后台管理系统中，我们时常会遇到表格展示，他们都有很多共性，比如塞选，分页，因此我们可以给这样的model定一个共同的模型，这里会保存塞选值，分页信息等

`以antd分页为例`：
```js
app.use(extendModel({
  state: {
    pagination: {
      current: 0,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 50, 100],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`,
    },
  },

  reducers: {
    updatePagination({ payload }, state) {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...payload
        }
      }
    },
  },

  includeModel: ['table1', 'table2'],
}))

// models/table1.js table1的model定义
import queryTableList from 'utils/request' // queryTableList是一个异步请求，返回Promise

export default {
  namespace: 'table1',

  state: {
    lists: [],
  },

  effect: {
    async queryTableList({ payload }, { put, select }) {
      const { pagination } = select() // 获取分页信息
      const response = await queryTableList({ ...payload, pagination }) // 传递分页信息及其他参数给服务器，服务器返回信息
      put({ type: 'updatePagination', payload: response.pagination }) // 存储分页信息
      put({ type: 'save', payload: response.data }) // 存储当前信息
    },
  },

  reducers: {
    save({ payload }, state) {
      return {
        ...state,
        lists: payload,
      }
    }
  },
}

// components/table1.js
import React, { PureComponent } from 'react'
import { actions } from 'roronoa-zoro'
import { Table } from 'antd'
import { connect } from 'react-redux' // 这里可以是其他库的连接器, 比如wepy中是wepy-redux, taro中是@tarojs/redux

const { queryTableList, updatePagination } = actions('table1')
const mapStateToProps = state => ({
  pagination: state.table1.pagination,
  lists: state.table1.lists,
})
const mapDispatchToProps = dispatch => ({
  queryTableList: (params) => dispatch(queryTableList(params)),
  updatePagination: (pagination) => dispatch(updatePagination(pagination)),
})

class Table1 extends PureComponent {
  columns = [
    {
      key: 'name',
      title: '名称',
      dataIndex: 'name',
    },
    {
      key: 'age',
      title: '年龄',
      dataIndex: 'age',
    },
  ]

  handleChange = pagination => {
    const { updatePagination } = this.props
    updatePagination(pagination)
  }

  render() {
    const { lists, pagination } = this.props

    return (
      <Table
        columns={this.columns}
        dataSource={lists}
        pagination={pagination}
        onChange={this.handleChange}
      />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Table1)
```

> 以上只是提出了一种该插件的使用场景，还有很多场景可以提取公用
