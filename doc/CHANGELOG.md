### 更新日志

该文件中所列的版本皆为稳定版本

#### `2018-08-24`
> version 1.3.1
* 新增dispatcher，详见api文档

#### `2018-08-23`
> version 1.2.4
* 新增connectComponent用于链接redux到小程序原生组件中

#### `2018-08-15`
> version 1.2.0
* 优化model生成时机，app.use和app.model不在需要注意调用顺序

#### `2018-08-14`
> version 1.1.11
* 修复createDispatcher出错，需要使用createDispatcher请使用1.1.6， 1.1.7，或者1.1.11及以上

#### `2018-07-31`
> version 1.1.8
* 新增原生小程序支持

#### `2018-07-18`
> version 1.1.8
* 优化createDispatcher，增加缓存

#### `2018-07-15`
> version 1.1.7
* 修复effect发生错误时依旧执行.then的bug

#### `2018-07-14`
> verison 1.1.6
* 新增actions增强函数createDispatcher

#### `2018-07-11` 
> version 1.1.5
* 修复initialState无法生效的bug
* 新增自定义plugin事件(beforeInjectModel, afterInjectModel)
* 新增extendModelPlugin，用于扩展model
* 更新文档
