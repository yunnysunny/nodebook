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

#### 2.1.5 函数

### 2.2 对象

其实对象也是一种数据类型，只不过由于它太特殊，所以这里单独拿出来讲。




