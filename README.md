# zoro

[![](https://img.shields.io/npm/v/roronoa-zoro.svg?style=flat-square)](https://npmjs.org/package/roronoa-zoro) [![](https://img.shields.io/npm/dt/roronoa-zoro.svg?style=flat-square)](https://npmjs.org/package/roronoa-zoro) [![](https://img.shields.io/npm/l/roronoa-zoro.svg?style=flat-square)](https://npmjs.org/package/roronoa-zoro)

基于 [redux](https://github.com/reactjs/redux)、[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)的轻量级前端框架，用于快速接入redux，省去配置redux的一堆繁琐操作

> 目前不支持创建多个实例

---

## 如何安装
```bash
$ npm install --save roronoa-zoro
```

or

```bash
$ yarn add roronoa-zoro
```

## 简介

> 个人维护项目，长期维护，目前主要使用于个人项目中

* **快速入手** 仅有 6 个 [api](https://github.com/FaureWu/zoro/tree/master/doc/API.md)，对 redux 用户尤其友好
* **可扩展** 支持插件机制，可实现自定义开发插件
* **内置插件** 框架内置多个实用插件

## 文档链接

* [api文档](https://github.com/FaureWu/zoro/tree/master/doc/API.md)
* [如何开发自定义的plugin](https://github.com/FaureWu/zoro/tree/master/doc/PLUGIN.md)
* [更新日志](https://github.com/FaureWu/zoro/tree/master/doc/CHANGELOG.md)

## 插件
* [loading plugin](https://github.com/FaureWu/zoro/tree/master/doc/LOADING-PLUGIN.md) 全局自动记录loading状态，减少重复工作
* [extend model plugin](https://github.com/FaureWu/zoro/tree/master/doc/EXTEND-MODEL-PLUGIN.md) 扩展model，实现model公共逻辑，减少重复工作

> 欢迎各位开发者，提供更多的插件

## 快速接入

* [接入taro框架](https://github.com/FaureWu/zoro/tree/master/doc/TARO.md)
* [接入wepy框架](https://github.com/FaureWu/zoro/tree/master/doc/WEPY.md)
* [react-redux接入文档](https://github.com/FaureWu/zoro/tree/master/doc/REACT-REDUX.md)

> 其他框架接入暂未整理，接入方式大同小异

## 模版

* [iwepy](https://github.com/FaureWu/iwepy) 一套基于wepy, iview-weapp, zoro的完整的小程序开发解决方案

## 开发交流

请添加微信 `Faure5` 备注 `zoro` 咨询

## License

[MIT](https://tldrlegal.com/license/mit-license)
