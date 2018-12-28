# 安装

```bash
$ npm install --save @opcjs/zoro
```

如果你习惯于使用yarn，可以执行如下命令

```bash
$ yarn add @opcjs/zoro
```

## 微信原生小程序

在微信原生小程序中使用zoro，无需执行安装命令，直接拷贝[zoro仓库](https://github.com/FaureWu/zoro)目录下的dist文件到小程序中即可

dist目录下包含两个文件：

* zoro.js zoro库主体文件，相关api查看api文档
* weapp-redux.js 类似react-redux，提供connect, connectComponent, setStore三个主要函数

需要使用zoro plugin，请直接拷贝[zoro plugin仓库](https://github.com/FaureWu/zoro-plugin)目录下的dist文件到小程序中即可

dist目录下包含一下几个插件

* zoro-loading.js 全局loading插件
* zoro-mixin.js 用于提取model共用逻辑插件

## 插件安装

```bash
$ npm install --save @opcjs/zoro-plugin
```

或者通过yarn

```bash
$ yarn add @opcjs/zoro-plugin
```

