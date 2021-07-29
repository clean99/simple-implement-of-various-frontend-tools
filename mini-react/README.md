# 手把手教你手写一个mini-react框架
在实现react之前，我们同样来看看react的几个核心概念:
## JSX与虚拟dom
我们都知道，在jsx文件中我们可以直接在函数中返回一个类似html的标签，如：

```
return (
  <div>
    Hello  Word
  </div>
)
```

这种语法实际上并不是js所拥有的，它需要通过babel转译为原生js后才能被正常执行：

```
上面jsx转换后为一个函数调用，返回一个对象，分别记录了该节点的type，props，children
return React.createElement(
  "div",
  null,
  "Hello"
)
```

而React.createElement创建出来的对象就是我们熟知的虚拟dom。
这里有人可能会迷惑怎么把虚拟dom转成函数的？后面会详细讲解babel的原理。

```
最简单的一个createElement实现，返回一个对象
function createElement(type, props, ...children) {
  props.children = children;
  return {
    type,
    props,
    children,
  };
}
上面那个例子返回的就是{ type:"div",props:{value:"Hello"},children:null }
```

## 为什么react要使用jsx/虚拟dom？
原因主要有以下两点：
* 如果没有虚拟dom，我们更新/创建dom的时候都需要直接操作dom，用各种getElementById等难记又难用的方法去实现一个很简单的操作，完全没必要。而用react我们基本不需要用到dom的方法，数据直接写在dom标签里，更新state自动重新渲染dom，非常方便
* 用js对象代替dom对象管理，效率显著提升。react虚拟dom其实是维护了与dom对应的一颗节点树，某个state更新react会计算diff，计算出真正需要重新渲染的dom，再进行最小范围的局部重新渲染。
## 准备工作：环境搭建
我们主要要实现react和react-dom库，所以为了省去一些细节（如babel转译虚拟dom配置），我们直接用create-react-app创建一个react项目，然后我们自己实现react和react-dom就行。

```
npx create-react-app minireact
cd minireact
yarn start
启动项目
```

我们把src中除了App.js和index.js外其他无关东西删掉，保留index.js和App.js中部分代码

```
//App.js

function App() {
  return (
    <div className="App">
      hello
    </div>
  );
}

export default App;

//index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
ReactDOM.render(
    <App />,
  document.getElementById('root')
);

```
可以看到，index.js中 import了react和react-dom，分别使用了他们的react.createElement和react-dom.render方法,我们主要就是要实现这两个方法。
现在，我们在根目录下建一个my-react.js和my-react-dom.js文件，用于存放我们实现的react和react-dom,然后我们就可以正式开始了！
## 实现react.createElement
我们先看看react.createElement要做什么,在babel官网转译我们的App.js代码，会得到：
```
//原代码
function App() {
  return (
    <div className="App">
      hello
    </div>
  );
}

export default App;

//转译后的代码
"use strict";
······
function App() {
  return React.createElement("div", {
    className: "App"
  }, "hello");
}

var _default = App;
exports.default = _default;

```

可以看到，虚拟dom变成react.createElement的调用，输入是type,props,最后是children。所以我们可以构造如下函数：

```
function createElement(type, props, ...children){
	props.children = children;
	return {
	    type,
	    props,
	};
}

export default {createElement};
```