# 安装

```bash
$ npm install --save @opcjs/zoro
```

如果你习惯于使用yarn，可以执行如下命令

```bash
$ yarn add @opcjs/zoro
```

## 插件安装

```bash
$ npm install --save @opcjs/zoro-plugin
```

或者通过yarn

```bash
$ yarn add @opcjs/zoro-plugin
```

## 特别提醒

zoro 3.X版本如需使用插件需配合zoro-plugin 3.X版本，否则部分功能将无法使用

## 微信原生小程序安装

> 2.x版本

在微信原生小程序中使用zoro，直接拷贝[zoro仓库](https://github.com/FaureWu/zoro)对应release目录下的dist文件到小程序中即可

dist目录下包含两个文件：

* zoro.js zoro库主体文件，相关api查看api文档
* weapp-redux.js 类似react-redux，提供connect, connectComponent, setStore三个主要函数

需要使用zoro plugin，请直接拷贝[zoro plugin仓库](https://github.com/FaureWu/zoro-plugin)目录下的dist文件到小程序中即可

dist目录下包含一下几个插件

* zoro-loading.js 全局loading插件
* zoro-mixin.js 用于提取model共用逻辑插件
* zoro-perf.js 收集查看相关性能数据，用于辅助性能优化

> 3.x版本

微信原生小程序中使用zoro，直接拷贝[zoro仓库](https://github.com/FaureWu/zoro)对应release目录下的dist/zoro.weapp.js文件到小程序中即可

如需使用typescript，还需拷贝dist/zoro.weapp.d.ts文件到同一层级目录即可

## 特别注意

* 3.x 版本已将weep-redux合并如zoro中，无需单独引入weapp-redux，对应的api查看[weapp-redux](/API/WEAPP-REDUX.md)

* 3.x 版本对应提供了两个编译文件zoro.weapp.js及zoro.weapp-gen.js，如果你使用的开发工具支持es6增强编译选项，则直接使用zoro.weapp.js，否则为了支持async/await，请不要使用zero.weapp.js，而是拷贝zoro.weapp-gen.js重命名为zoro.weapp.js

如需使用zoro plugin，请直接拷贝[zoro plugin仓库](https://github.com/FaureWu/zoro-plugin)目录下的dist相关文件到小程序中即可

dist中包含几个插件

* loading.js 全局loading插件
* mixin.js 用于提取model共用逻辑插件
* perf.js 收集查看相关性能数据，用于辅助性能优化

如需使用typescript，还需拷贝对应的同名d.ts文件到同一层级目录即可