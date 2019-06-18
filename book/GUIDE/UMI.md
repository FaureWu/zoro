#UMI框架中使用

关于如何使用umi快速搭建应用，请移步[umi官网](<https://umijs.org/zh/guide/getting-started.html>)，请创建不包含dva类型的应用

该文章仅阐述如何在umi框架使用zoro库

## 安装umi-plugin-zoro

```bash
$ npm install --save-dev umi-plugin-zoro
or
$ yarn add -D umi-plugin-zoro
```

## 在umi配置文件中（config.js/.umirc.js）添加插件

```js
export default {
  plugins: [
    ['umi-plugin-react', {
      antd: true,
      dva: false, // 关闭dva插件
      dynamicImport: { webpackChunkName: true },
      title: 'umi-zoro',
      dll: true,

      routes: {
        exclude: [
          /components\//,
          /models\//,
        ],
      },
    }],
    'umi-plugin-zoro', // 添加zoro插件
  ],
}

```

## zoro库相关配置方式添加

在src/app.js文件中

```js
import { Toast } from 'antd-mobile'
import { createLoading } from '@opcjs/zoro-plugin'

export const zoro = {
  config: {
    onError(error) {
      console.error(error)
      if (error.message) {
        Toast.info(error.message, 2)
      }
    },
    initialState = {},
  	extraMiddlewares = [],
    extraEnhancers = [],
    onEffect() {},
    onAction() {},
    onReducer() {},
    onSetup() {},
  },

  plugins: [
    createLoading(),
    // 添加其他zoro插件
  ],
}
```

## model存放目录

只需在src/models或者src/model(开启单数配置情况下)，或者放于个子页面中的models或者model目录下，umi-plugin-zoro会自动引入到项目中

与dva存放规则及引入规则一致(参考dva插件使用)
