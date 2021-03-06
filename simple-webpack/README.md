# 实现webpack核心打包原理
> 本项目适合：了解webpack大概运行机制，配置过webpack，想学习webpack bundle原理的人。
> 如果对webpack不太了解，请到[webpack官方文档](https://webpack.docschina.org/)学习后再看本文。

webpack是前端常用的打包构建工具，很多前端知道怎么配置但是并不了解原理是什么。webpack是一个基于事件流（生命周期）的构建工具，有以下几个核心概念：
* 应用入口
* 应用出口
* loader(解析css，sass，jsx，ts，tsx等非js文件时先用一系列loader转译为js文件)
* 生命周期hooks(webpack运行过程中会有不同的生命周期，如：读取配置config.js，创建webpack实例，开始编译，编译结束，提交产物等)
* plugin（webpack为上面的生命周期暴露钩子，plugin可以在这些钩子中注册回调函数，实现在不同webpack生命周期执行特定任务的功能）
* bundle(贯穿webpack始终，从入口模块开始解析，收集模块依赖和模块代码，整理成依赖图后返回一个可以被浏览器运行的js文件)

这个项目主要是关于bundle的，去掉loader等其他复杂概念，简单实现一个构建打包流程。
要实现一个打包过程，需要实现以下几点：
* 找到应用入口
* 遍历文件，根据import记录不同模块之间的依赖关系
    * fs读文件
    * babel parser解析为语法抽象树AST
    * babel traverse遍历AST，具体观察者模式访问import节点拿到依赖，收集起来
    * babel core生成文件es5代码code，收集起来
    * 返回一个{file,code,deps}对象
* 生成依赖图
    * 用数组存这个依赖图
    * 读取入口文件
    * 递归地去读文件的依赖，把{file,code,deps}存进数组
* 实现一个require()函数，将依赖图中记录的代码片段执行，同时可以递归的调用依赖模块
    * 构造一个立即调用表达式，把我们读好的图作为参数传进去
    * 构造require函数，当require依赖图中某个file，我们就去依赖图找到对应的code和deps
    * 用eval执行对应的code，code中的require会递归调用我们构造的require方法
    * 把这个立即调用表达式写到dist目录中的js文件，就可以在浏览器上执行
