# 微信原生小程序结合redux API介绍

微信原生小程序安装zoro，请查看[安装文档](/INSTALL.md)中的微信原生小程序部分

如何在微信原生小程序使用zoro，请查看[微信原生小程序中使用](/GUIDE/WEAPP.md)

当我们完成微信原生小程序安装zoro步骤后，我们会得到两个文件

* zoro.js zoro主库文件，相关api，请移步[ZORO API](/API/README.md)
* weapp-redux.js 这里主要介绍的该文件中API使用，该文件用于结合微信原生小程序和redux

## setStore(store) `<Function>`

设置redux store

```js
import { setStore } from './weapp-redux'
setStore(store)
```

## connect(mapStateToPage, mapDispatchToPage)(pageConfig) `<Function>`

链接redux state，redux action到页面组件中

```js
import { connect } from './weapp-redux'
const config = connect(mapStateToPage, mapDispatchToPage)(pageConfig)
Page(config)
```

* mapStateToPage(handler) `<Function>`

  ```js
  function mapStateToPage(state) { return { counter: state.counter } } 
  ```

* mapDispatchToPage(handler) `<Function>`

  第二个参数基本无需使用，请使用`dispatcher`代替

  ```js
  function mapDispatchToPage(dispatch) { return { add: () => dispatch({ type: 'counter/add' }) } }
  ```

## connectComponent(mapStateToCom, mapDispatchToCom)(comConfig) `<Function>`

链接redux state，redux action到自定义组件中

```js
import { connectComponent } from './weapp-redux'
const config = connectComponent(mapStateToCom, mapDispatchToCom)(comConfig)
Component(config)
```

* mapStateToCom(handler) `<Function>` 使用方法同`mapStateToPage`
* mapDispatchToCom(handler) `<Function>` 使用方法同`mapDispatchToPage`，请使用`dispatcher`代替

## 特别提示

connect及connectComponent为了减少重复渲染，内部会做浅对比