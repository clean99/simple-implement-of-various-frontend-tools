# 通过实现一个超简单的Jest学习测试原理

Jest是JavaScript测试必备的框架之一，很多人使用过他写js的单元测试，集成测试等。但是很少有人读过Jest的源码，了解过他的底层原理。要学习一个抽象最好的方法就是了解它的实现，这样你在遇到报错的时候就能根据原理分析原因，而不至于晕头转向。接下来我会实现一个尽可能简单Jest，去掉没必要的细节，帮助你学习它的运行原理，了解它的核心思想。

## 目录结构

* test.js中存放测试函数以及简易版Jest
* README.md中存放step by step的教程

## 教程

### expect函数的抽象过程

首先我们index.js中有两个函数`sum`和`subtract`为我们要测试的函数：
```js

const sum = (a, b) => a - b;
const subtract = (a, b) => a - b;

```

我们要测试`sum`这个函数运行结果是否正确。我们可以假设2 + 3 = 5是正确的，如果不正确的话，函数本身是不会报错的，我们可以手动添加一个报错，这就是一个最简单的测试。

```js

// ...

const expected = 5;

const result = sum(2, 3);

if(result !== expected) {
    throw new Error(`${result} is not equal to ${expected}`);
}

```

这时候运行`test.js`，会抛出一个错误：

```bash

throw new Error(`${result} is not equal to ${expected}`)
^

Error: -1 is not equal to 5

```

我们把`sum`函数改正之后，测试就能通过了。

继续给`subtract`添加测试:

```js

const expected = 1;

const result = subtract(3, 2);

if(result !== expected) {
    throw new Error(`${result} is not equal to ${expected}`);
}

```

我们会发现，这一系列操作很常见，可以抽象为一个函数方便复用：

```js

function expectToBe(expected, result) {
    if(result !== expected) {
        throw new Error(`${result} is not equal to ${expected}`);
    }
}

expectToBe(5, sum(2, 3));
expectToBe(1, subtract(3, 2));

```

通常，我们的测试不仅仅要判断 `!==`，还可能要有对象之间属性相等，数组长度，有某个对象属性等等。。。我们可以再进一步抽象一个expect函数，返回一系列的断言操作：

```js

function expect(result) {
    return {
        toBe(expected) {
            if(result !== expected) {
                throw new Error(`${result} is not equal to ${expected}`);
            }
        },
        toHaveLength(length) {
            // ...
        },
        toBeDefined() {
            // ...
        },
    };
}

expect(sum(2, 3)).toBe(5);

```

这样一个最基本的expect函数就写好了。

### test函数的抽象过程

现在我们的expect函数可以正常运行了，但是有两个问题：
1. 当有多个测试用例同时出错时，expect在第一个错误throw error并退出，无法显示后面用例的错误情况。
2. 现在的报错可读性不高，只返回了一个函数调用栈，如果能在每个测试前面添加一小段说明，会大幅提高可读性。

针对第一个问题，我们可以用一个函数把expect函数包起来，并且用`try...catch`手动处理错误，这样就不会在expect函数报错的时候程序直接退出。

```js

function test(callback) {
    try {
        callback();
    } catch(err) {
        console.error(err);
    }
}

```

这样我们还是不能看出是哪个测试出了问题，所以我们可以在test函数上添加一个字符串用来指示不同的测试，并添加一个指示说明成功通过测试：

```js

function test(name, callback) {
    try {
        callback();
        console.log(name);
        console.log('✅ pass');
    } catch(err) {
        console.log(name);
        console.error(`❌ ${err}`);
        console.error(err);
    }
}

test('sum 2 and 3 should equal to 5', () => {
    expect(sum(2, 3)).toEqual(5);
});

test('subtract 3 and 2 should equal to 1', () => {
    expect(subtract(3, 2)).toEqual(1);
})

```

这样一个最基本的test函数就完成了。报错信息如下：

```bash

> simple-jest@1.0.0 test
> node test.js

sum 2 and 3 should equal to 5
✅ pass
subtract 3 and 2 should equal to 1
❌ Error: 5 is not equal to 1

```

### 兼容Async/Await异步编程

现在我们已经可以测试同步函数了，那如果想要测试`async`函数呢？我们知道，`async`函数抛出的错误并不能被同步函数的`try...catch`捕捉到，因为同步函数读到异步函数后不是直接执行它，而是把它放到一个队列里，等同步函数执行完才可能执行这些异步函数。我们可以利用`await`来等待我们的`callback`执行完后再继续执行同步函数，这样我们就可以捕获到错误了。

```js

const sleepAndReturn = async (time, text) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(text), time);
    });
}

async function test(name, callback) {
    try {
        await callback();
        console.log(name);
        console.log('✅ pass');
    } catch(err) {
        console.log(name);
        console.error(`❌ ${err}`);
        console.error(err);
    }
}

test('sleepAndReturn function should return Hello eventually', async () => {
    expect(await sleepAndReturn(1000, 'Hello')).toEqual('Hello');
});

```

```bash

sleepAndReturn function should return Hello eventually
✅ pass

```

### 将测试函数设置为全局可用

现在我们有两个函数`test`和`expect`，他们在每一个测试文件中都会使用，每次都去import他们是很啰嗦的，我们可以设置为全局函数。

我们先把这两个函数移动到`test-setup.js`文件中，再利用`node --require ./test-setup.js`每次自动引入这个文件。

```js
// test-setup.js

function expect(result) {
    // ...
}

async function test(name, callback) {
    // ...
}

global.expect = expect;

global.test = test;


```

```bash

node --require ./test-setup.js test.js

```

### 总结

以上就是jest最基本的实现原理，我们可以直接引入jest[Read more](https://jestjs.io/)然后使用这些函数，它会提供非常全面的工具帮助你完成测试。测试本质上就是为代码添加一些用例（或者说条件），如果用例失败则返回一些方便开发者debug的信息。我们从jest可以学到如何一步步抽象出一个通用的、用户友好的库。