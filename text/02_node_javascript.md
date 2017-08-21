## 2 JavaScript那些事

1900年代初期，Java 开始投入市场，并取得巨大成功。作为 Java 的维护者的 Sun 公司，也趁热打铁，开发出了 Applet，其实这是一个合成词，可以拆分成Application 和 little 两个单词，意译的话就是“小程序”。

同时网景（Netscape）公司想开发一门让网页制作者就能学会的脚本语言，于是他们就委派了 Brendan Eich（布兰登·艾克）这位大神。由于时间紧迫，他用了10天便开发出了一个最初版本，开始的时候这个项目的代号还叫 Mocha（好吧，听起来很熟悉吧），并在第一版发布的时候给这门语言起名 LiveScript。不过，很快网景公司和 Sun 公司开展合作，两者达成协议，将这门语言改名为 Javascript。

从此 Sun 公司的 Applet 可以运行在浏览器上，只需要一个浏览器你的应用就可以随处运行了，而 Javascript 也借着 Java 的名声炒作了一把（虽然其语言本身跟 Java 没有多大关系，不过他成功迷惑了好多语言入门者，就好像我小时候搞不清楚雷锋和雷峰塔一样）。不过后来的结果大家大概都猜到了，小程序活不久，而 js 却被大量使用，直到今天依然无可替代。

### 2.1 数据类型
JavaScript 由于当初设计之初时间紧迫，所以有好多历史遗留问题，所以对于其有些语法知识点，大家可以完全以吐槽的心态来学习，完全不用去深究。
#### 2.1.1 数字
一般编程语言都有像整数、浮点数之类的数据类型，但 js 将整数按照浮点数来存储，所以 `1 === 1.0`。不过 js 本身提供了一些浮点数转成整数（保证在显示的时候不带小数点）的函数，比如说 [Math.ceil](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil)（向上取整）、[Math.floor](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/floor)（向下取整）、[parseInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt)（将字符串转化成整数，如果参数不是字符串，会先转化为字符串）。

#### 2.1.2 布尔
布尔，也就我们常说的 `true` `false`，本来布尔就是用来做逻辑判断的，但是我们在做逻辑判断的时候也可以这个样子

```javascript
if (undefined) {
    console.log('undefined is true');
} 
if (null) {
    console.log('null is true');
} 
if ('') {
    console.log('\'\' is true');
} 
if (0) {
    console.log('0 is true');
}
if ('0') {
    console.log('\'0\' is true');
}
if (NaN) {
    console.log('NaN is true');
}
```
**代码 2.1.2.1 逻辑判断语句**

你会发现 只有 `'0' is true` 被打印出来，其他的在做逻辑判断的时候都为假。本来这一节是讲布尔型数据类型的，但是我发现实在没啥可讲的，所以我就讲些逻辑判断相关的知识。其中 `undefined` 在 js 里面表示变量未定义；`null` 代表当前变量是一个对象，但是没有初始化；`''` 代表当前是一个字符串，但是字符串中没有任何字符；`0` 表示当前是一个字符串，且字符串就只有一个0字符；NaN 代表当前变量不是数字，这个数据类型在调用 parseInt 的时候会返回，比如说 `parseInt('a')` 就返回 `NaN`。

js 判断相等有两种方式 `==` 和 `===`，两者的区别是前者在做判断前，会将等号两边的数据类型转化成一致的；而后者在做判断的时候，如果检测到等号两边数据类型不一致，直接返回false。例如 `0 == '0'` 为 true，而 `0==='0'` 为 false。最好需要注意，判断一个变量是否是NaN，不要使用等号来判断，而需要使用函数 [isNaN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/isNaN)。

最后讲述一个小技巧，使用下面方式判断一个变量是否是“不正常”的：

```
if (!x) {
    console.log('x is dirty');
}
```

#### 2.1.3 字符串
js 中字符串可以使用''或者""来包裹，'a' === "a"，有一些语言（Java或者C）中用 'a' 来表示 `字符` 类型，在 js 中是没有 `字符` 类型的。

js 中提供了N多关于字符串的函数，比如说字符串截取函数 [substring](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/substring)、替换函数 [replace](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace)、查找函数 [indexOf](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf)。

#### 2.1.4 数组

[数组](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array) 是 js 中一项重要的数据结构，我们可以通过如下方式声明一个数组：

var array = ['a','bb','cc'];

js 提供了一系列函数来对数组进行增删改查。

首先是查，你可以通过下标来访问数组元素，下标从0开始， `array[0]` 返回 `'a'` 。同时数组还有一个 `length` 属性，通过这个属性我们可以写一个遍历这个数组的 for 循环：

```javascript
for (var i=0,len=array.length;i<len;i++) {
    console.log(array[i]);
}
```
**代码 2.1.4.1 for循环遍历数组**

我们还可以通过 [indexOf](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) 函数来查找某一个元素是否在当前数组中。

然后是改， 直接举个栗子，设置 0 号元素为 `'11'`，则使用 `array[0] = '11'`，即可。

接着是增加，通过 [shift](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/shift) 函数删除数组最开头的元素， `var first = array.shift()` 调用完之后，变量 `array` 的值为 `['bb','cc']`，同时 `first` 被赋值 `'a'`。

通过 [unshift](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift) 函数可以往数组头部添加元素，例如 `array.unshift('123')`，那么 array 变量的值就变成了 `['123','a','bb','cc']`。

通过 [pop](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/pop) 可以删除数组最末尾的一个元素，例如 `var last = array.pop()` 调用完之后， array 就变成了 `['a','bb']` 同时变量 `last` 被赋值 `'cc'`。

通过 [push](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/push) 函数可以在数组末尾添加元素，例如 `array.push('333')`，则 array 变成 `['a','bb','cc','333']`。

#### 2.1.5 函数
作为一门编程语言，我们免不了在使用的时候要把某些功能封装成一个模块，函数作为模块的载体在任何程序语言中都是必不可少的， JavaScript 也不例外。在 js 中定义一个函数很简单：

```javascript
function doAdd(a,b) {
    return a + b;
}
```
**代码 2.1.5.1 函数定义**  
虽然函数体只有一行，但是这个函数却将函数三要素都澄清了：函数名 `doAdd`，参数 `a` 和 `b`，返回值 `a + b`。当然三要素并不是必不可缺的：

```javascript
var doEcho = function() {
    console.log('你好');
}
```
**代码 2.1.5.2 匿名函数**

这里其实是定义了一个匿名函数，只不过我们在定义完之后将它赋值给了变量 `doEcho`，同时这个函数在运行的时候可以不用传任何参数，同时函数内部没有任何 `return` 语句，其实这种情况跟 `return undefined` 是等价的。匿名函数一般作用是作为函数参数使用，例如下面这个栗子：

```javascript
function addLater(a,b,callback) {
    setTimeout(function() {
        var sum = a+b;
        callback(sum);
    },1000);
}

addLater(1,2,function(result) {
    console.log('the result:',result);
});
```
**代码 2.1.5.3 匿名函数使用示例** 

上面这个栗子中，addLater函数在调用的时候，第三个参数在使用的时候是一个函数，而且它是匿名的。

### 2.2 对象

其实对象也是一种数据类型，只不过由于它太特殊，所以这里单独拿出来讲。在 ES6 之前 javascript 还是一门**基于对象**的编程语言，为啥叫基于呢，因为 ES5 和之前版本的 javascript 中原生语法中没有类（class）这个关键词，你只能拿原型（prototype）来模拟一个类的行为。

> ES ( [ECMAScript](https://zh.wikipedia.org/wiki/ECMAScript) )，可以理解为 javascript 的语法标准， 2015年6月发布的 ES6 （又称 ES2015） 版本增加了N多语言特性，其中就包括类和继承的实现。由于 ES6 规避了之前版本中 javascript 中的一些糟粕设计，并且提升了开发效率，所以产生了学习 ES6 的大量前端开发人员，但是现行浏览器对于 ES6 语法的支持能力参差不齐，所以 [babeljs](https://babeljs.io) 应运而生，它提供了 ES6 转 ES5的功能，一时间产生了大量的拥趸。同时国内大神阮一峰也写了一本 [ECMAScript 6 入门](http://es6.ruanyifeng.com/) 开源图书，我想使用 ES6 语法的程序员，没有一位没有浏览过这本书的。另外 node 从4.x开始逐渐引入 ES6 语法，具体各个版本的实现情况可以参见[Node.js ES2015 Support](http://node.green/)。

我们这里先讲一下 ES5 中怎样模拟一个类，答案是使用原型：

```javascript
function PersonES5(p) {
    this.age = p.age;
    this.name = p.name;
    this.sex = p.sex;
}

PersonES5.prototype.showInfo = function() {
    console.log(this);
};

var person = new PersonES5({
    age:18,
    name:'tom',
    sex:'boy'
});

person.showInfo();
```
**代码 2.2.1 person_es5.js**  

而在 ES6 中由于直接有类的概念，所以代码语法上还是有差别的：

```javascript
class PersonES6 {
    constructor(p) {
        this.age = p.age;
        this.name = p.name;
        this.sex = p.sex;
    }
    showInfo() {
        console.log(this);
    }
}


var person = new PersonES6({
    age:18,
    name:'tom',
    sex:'boy'
});

person.showInfo();
```
**代码 2.2.2 person_es6.js**

由于 javascript 长期函数式编程思想盛行，因为我们一般不会在一个网页中呈现过多的 UI 组件，所以它的代码处理流程一般都是线性的。比如说我们在前端使用 javascript 的流程是这样的：加载网页->请求数据->渲染 UI 组件->触发事件监听，后端的流程是这样的：接收请求->数据库操作->返回处理结果。当然你会说，不对，我们处理的流程可比这复杂多了，当然随着单页应用（SPA,Single Page Application）的兴起，前端 js 的处理逻辑会越来越复杂。比如说有一天，你的经理可能会给你分配一个在线 photoshop 的需求，这时候面向对象就派上用场了，你可能需要一个抽象类来描述组件的基本属性和功能，同时派生出若干继承自这个抽象类的具体组件类，比如说矩形类、三角形类、圆形类。我想面对这么复杂需求的时候，开发者肯定会选择 ES6 来实现，更不用说如今流行 mvvm 框架都是采用 ES6 来开发。

上面啰嗦了这么多，其实是为了我自己开脱，我实在不想讲 ES5 中的原型链的知识点，为了搞清楚如何依赖原型链来实现继承，好多人都已经吐血了，这里就略过了，如果出现想用面向对象的场景，还是用 ES6 吧。

### 2.3 回调嵌套

由于在 javascript 中存在大量的异步操作，函数调用完成之后，不能立马拿到执行结果，必须在回调函数中得到执行结果，如果你在一个函数中要接连做好几次这样的异步处理，是不是画面应该是这样的：

![代码深层次嵌套](images/callback_nested.png)  
**图 2.3.1 代码深层次嵌套的即视感**

正是由于考虑到这种问题，所以 ES6 在设计的时候增加 Promise 类，不过这东西在批量处理异步回调时候依然让人不爽，大家可以参考 [A quick guide to JavaScript Promises](https://www.twilio.com/blog/2016/10/guide-to-javascript-promises.html)。我这里给大家介绍的是一个第三方回调流程控制库 [async](https://caolan.github.io/async/docs.html) (我这算不算开倒车？另外注意不要和 ES7 中的 [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) 关键字相混淆)。

我们在处理异步任务的时候，大体上分为两种情况，一种是串行操作，即处理完一个任务之后才能接着处理下一个任务；一种是并行操作，即各个任务都是独立运行的，大家一起运行，没有前后依赖关系。

对于串行运行在 async 中，可以是这样的：

```javascript
var async = require('async');

async.waterfall([
    function(callback) {
        setTimeout(function() {
            callback(false,2+3);
        },100);
    },
    function(sum,callback) {
        setTimeout(function() {
            callback(false,sum-1);
        },100);
    },
    function(left,callback) {
        setTimeout(function() {
            callback(false,left * 2);
        },100);
    }
],function(err,result) {
    console.log(err,result);
});
```

**代码 2.3.1 async waterfall方法示例**

[waterfall](https://caolan.github.io/async/docs.html#waterfall) 函数接受两个参数，第一个参数是 Array 类型，用来指明各个需要异步执行的任务，数组的第一个元素为：

```javascript
function(callback) {
  setTimeout(function() {
    callback(false,2+3);
  },100);
}
```

注意`callback(false,2+3);`这一句，调用完这一句，它就参数 2+3 这个值传递到下一个任务中去了，然后数组的第二个元素：

```javascript
function(sum,callback) {
  setTimeout(function() {
    callback(false,sum-1);
  },100);
}
```

其中里面的`sum`正是刚才我们在第一个函数中传递过来的 `3+2`，同理可得我们最终将 `4`作为参数 `left` 传递到了第三方函数中。 `waterfall` 的第二个参数是一个回调函数：

```javascript
function(err,result) {
    console.log(err,result);
}
```

其第一个参数 `err` 代表错误信息，假设我们在处理任何一个异步任务的回调时写了一个 `callback(errorInfo);`，整个 `waterfall` 函数会提前结束，并且将这个 `errorInfo` 传递到第一个参数 `err` 上；第二个参数 `result` 代表最终处理得到的结果，具体到上面那个栗子，最终的结构就应该是 `4*2` 得 `8`。

接着将并行处理，也就是 [parallel](https://caolan.github.io/async/docs.html#parallel) ，我们再举个栗子:

```javascript
var async = require('async');

async.parallel([
    function(callback) {
        setTimeout(function() {
            callback(null, 1);
        }, 200);
    },
    function(callback) {
        setTimeout(function() {
            callback(null, 2);
        }, 100);
    }
],
function(err, results) {
  	console.log(err,results);
    //最终打印结果：null [1,2] 
});
```

**代码 2.3.2 async parallel 函数示例**

和 `waterfall` 类似，只要其中有一个任务在 callback 的时候传递了一个 error 对象，就会导致整个 parallel 函数立马结束。

> 最后大家可能留意到我们的第一行使用了 `require('async')` ，这个require 函数用来加载第三方包，我们需要在代码文件所在目录运行 `npm install async --save` 来安装这个第三方包。更多关于 npm 的知识可以参见本书第4章。
>
> 本章部分代码：https://github.com/yunnysunny/nodebook-sample/tree/master/chapter2

### 2.4 参考文献
- https://www.twilio.com/blog/2016/10/guide-to-javascript-promises.html

