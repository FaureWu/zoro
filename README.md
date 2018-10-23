2.* 文档 | [1.* 文档](https://github.com/FaureWu/zoro/blob/master/README-V1.md)

# zoro

[![](https://img.shields.io/npm/v/@opcjs/zoro.svg?style=flat-square)](https://npmjs.org/package/@opcjs/zoro)
[![](https://img.shields.io/npm/dt/@opcjs/zoro.svg?style=flat-square)](https://npmjs.org/package/@opcjs/zoro)
[![](https://img.shields.io/npm/l/@opcjs/zoro.svg?style=flat-square)](https://npmjs.org/package/@opcjs/zoro)

基于 [redux](https://github.com/reactjs/redux)、[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)的轻量级前端框架，用于快速接入redux，省去配置redux的一堆繁琐操作

> 目前不支持创建多个实例

---

## 如何安装
```bash
$ npm install --save @opcjs/zoro
```

or

```bash
$ yarn add @opcjs/zoro
```

> 微信原生小程序中引入请查看 [快速接入原生小程序文档](https://github.com/FaureWu/zoro/blob/master/doc/V2/WEAPP.md)

## 简介

> 该项目已于实际项目中使用，且正式上线

* **快速入手** 仅有 6 个 [api](https://github.com/FaureWu/zoro/blob/master/doc/V2/API.md)
* **可扩展** 支持插件机制，可实现自定义开发插件
* **插件机制** 框架内置多个实用插件
* **全局错误处理** 不用一次次重复的书写错误处理代码

`查看目前可用的所有插`[@opcjs/zoro-plugin](https://github.com/FaureWu/zoro-plugin)

## 教程

* [打造前端大秘宝之状态处理框架ZORO](https://www.jianshu.com/p/19f852252500)

## 文档链接

* [api文档](https://github.com/FaureWu/zoro/blob/master/doc/V2/API.md)
* [如何开发自定义的plugin](https://github.com/FaureWu/zoro/blob/master/doc/V2/PLUGIN.md)
* [插件列表](https://github.com/FaureWu/zoro-plugin)

## 插件
2.*版本的插件已经重zoro中独立出去，项目地址[zoro-plugin](https://github.com/FaureWu/zoro-plugin)

## 快速接入

* [接入taro框架](https://github.com/FaureWu/zoro/blob/master/doc/V2/TARO.md)
* [接入wepy框架](https://github.com/FaureWu/zoro/blob/master/doc/V2/WEPY.md)
* [react-redux接入文档](https://github.com/FaureWu/zoro/blob/master/doc/V2/REACT_REDUX.md)
* [原生小程序接入文档](https://github.com/FaureWu/zoro/blob/master/doc/V2/WEAPP.md)

> 其他框架接入暂未整理，接入方式大同小异

## 模版

* [iwepy](https://github.com/FaureWu/iwepy) 一套基于wepy, iview-weapp, zoro的完整的小程序开发解决方案

## 应用案例

<img src="https://img.baobeicang.com/user_upload/rc-upload-1539741270100-2.jpeg" width="150" />

## 开发交流

请添加微信 `Faure5` 备注 `zoro` 咨询，开源不易，如果好用，欢迎star

<img src="https://img.baobeicang.com/user_upload/rc-upload-1539676937885-2.jpeg" width="150" />

## License

[MIT](https://tldrlegal.com/license/mit-license)
