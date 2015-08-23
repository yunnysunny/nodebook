## 2 Node.js 与 JavaScript

### 2.1 JavaScript 基本型态


JavaScript 有以下几种基本型态。

 -   Boolean
 -   Number
 -   String
 -   null
 -   undefined

变数宣告的方式，就是使用var，结尾使用‘;’，如果需要连续宣告变数，可以使用 ‘,’ 做为连结符号。

```javascript
// 宣告 x 为 123, 数字体态
var x=123;

// 宣告 a 为456, b 为 'abc' 字符串型态
var a=456,
    b='abc';
```
##### 2.1.1 布尔值


布林，就只有两种数值, true, false

```javascript
var a=true,
    b=false;
```
###### 2.1.2 数字体别

Number 数字体别，可以分为整数，浮点数两种，

```javascript
var a=123,
    b=123.456;
```
###### 2.1.3 字符串型别

字符串，可以是一个字，或者是一连串的字，可以使用 '' 或 "" 做为字符串的值。(尽量使用双引号来表达字符串，因为在node里不会把单引号框住的文字当作字符串解读)

```javascript
var a="a",
    a='abc';
```
##### 2.1.4 运算子


基本介绍就是 +, -, \*, / 逻辑运算就是 && (and), || (or), \^ (xor),比较式就是 &gt;, &lt;, !=, !==, ==, ===, &gt;=, &lt;=

##### 2.1.5 判断式


这边突然离题，加入判断式来插花，判断就是 if，整个架构就是，

```javascript
if (判断a) {
    // 判断a 成立的话，执行此区域指令
} else if (判断b) {
    // 判断a 不成立，但是判断b 成立，执行此区域指令
} else {
    // 其余的事情在这边处理
}
```
整体架构就如上面描述，非 a 即b的状态，会掉进去任何一个区域里面。整体的判断能够成立，只要判断转型成Boolean 之后为 true，就会成立。大家可以这样子测试，

    Boolean(判断);

##### 2.1.6 应用


会突然讲 if 判断式，因为，前面有提到 Number, String两种型态，但是如果我们测试一下，新增一个 test.js

```javascript
var a=123,
    b='123';

if (a == b) {
    console.log('ok');
}
```
编辑 test.js 完成之后，执行底下指令

    node test.js
    // print: ok

输出结果为 ok。

这个结果是有点迥异， a 为 Number, b 为 String 型态，两者相比较，应该是为false 才对，到底发生什么事情？ 这其中原因是，在判断式中使用了 == ，JavaScript 编译器，会自动去转换变数型态，再进行比对，因此 a == b就会成立，如果不希望转型产生，就必须要使用 === 做为判断。
 
```javascript
if (a === b) {

   console.log('ok);

} else {

   console.log('not ok');

} // print: not ok
```
##### 2.1.7 转型

如果今天需要将字符串，转换成 Number 的时候，可以使用 parseInt, parseFloat的方法来进行转换，

```javascript
var a='123';
console.log(typeof parseInt(a, 10));
```
使用 typeof 方法取得资料经过转换后的结果，会取得，

    number

要注意的是，记得 parseInt后面要加上进位符号，以免造成遗憾，在这边使用的是 10 进位。

### 2.2 Null & undefined 型态差异


空无是一种很奇妙的状态，在 JavaScript 里面，null, undefined是一种奇妙的东西。今天来探讨什么是 null ，什么是 undefined.

##### 2.2.1 null

变数要经过宣告，赋予 null ，才会形成 null 型态。

```javascript
var a=null;
```
null 在 JavaScript 中表示一个空值。

##### 2.2.2 undefined

从字面上就表示目前未定义，只要一个变数在初始的时候未给予任何值的时候，就会产生undefined

```javascript
var a;

console.log(a);

// print : undefined
```
这个时候 a 就是属于 undefined 的状态。另外一种状况就是当 Object被删除的时候。

```javascript
var a = {};    
delete a;
console.log(a);

//print: undefined.
```
Object 在之后会介绍，先记住有这个东西。而使用 delete的时候，就可以让这个 Object 被删除，就会得到结果为 undefined.

##### 2.2.3 两者比较
 null,undefined在本质上差异并不大，不过实质上两者并不同，如果硬是要比较，建议使用 === 来做为判断标准，避免 null, undefined 这两者被强制转型。

```javascript
var a=null,
 b;

if (a === b) {
    console.log('same');
} else {
    console.log('different');
}

 //print: different
```
从 typeof 也可以看到两者本质上的差异，

```javascript
typeof null;
//print: 'object'

typeof undefined;
//print: 'undefined'
```
null 本质上是属于 object, 而 undefined 本质上属于 undefined ，意味着在undefined 的状态下，都是属于未定义。如果用判断式来决定，会发现另外一种状态

```javascript
Boolean(null);
// false

Boolean(undefined);
// false
```
可以观察到，如果一个变数值为 null, undefined 的状态下，都是属于 false。这样说明应该帮助到大家了解，其实要判断一个对象、属性是否存在，只需要使用if

```javascript
var a;

if (!a) {
    console.log('a is not existed');
}

//print: a is not existed
```
a 为 undefined 由判断式来决定，是属于 False 的状态。

### 2.3 JavaScript Array


阵列也是属于 JavaScript 的原生对象之一，在实际开发会有许多时候需要使用Array 的方法，先来介绍一下阵列要怎么宣告。

#### 2.3.1 阵列宣告

宣告方式，

```javascript
var a=['a', 'b', 'c'];

var a=new Array('a', 'b', 'c');
```

以上这两种方式都可以宣告成阵列，接着我们将 a 这个变数印出来看一下，

```javascript
console.log(a);
//print: [0, 1, 2]
```

Array 的排列指标从 0 开始，像上面的例子来说， a 的指标就有叁个，0, 1,2，如果要印出特定的某个阵列数值，使用方法，

```javascript
console.log(a[1]);
//print: b
```

如果要判断一个变数是不是 Array 最简单的方式就是直接使用 Array的原生方法，

```javascript
var a=['a', 'b', 'c'];

console.log(Array.isArray(a));
//print: true

var b='a';
console.log(Array.isArray(b));
//print: false
```

如果要取得阵列变数的长度可以直接使用，

```javascript
console.log(a.length);
```

length 为一个常数，型态为 Number，会列出目前阵列的长度。

##### 2.3.2 pop, shift


以前面所宣告的阵列为范例，

```javascript
var a=['a', 'b', 'c'];
```

使用 pop 可以从最后面取出阵列的最后一个值。

```javascript
console.log(a.pop());
//print: c

console.log(a.length);
//print: 2
```

同时也可以注意到，使用 pop这个方法之后，阵列的长度内容也会被输出。另外一个跟 pop 很像的方式就是shift，

```javascript
console.log(a.shift());
//print: a

console.log(a.length);
//print: 1
```

shift 跟 pop最大的差异，就是从最前面将数值取出，同时也会让呼叫的阵列少一个数组。

##### 2.3.3 slice

前面提到 pop, shift 就不得不说一下 slice，使用方式，

```javascript
console.log(a.slice(1,3));
//print: 'b', 'c'
```

第一个参数为起始指标，第二个参数为结束指标，会将这个阵列进行切割，变成一个新的阵列型态。如果需要给予新的变数，就可以这样子做，完整的范例。

```javascript
var a=['a', 'b', 'c'];

var b=a.slice(1,3);

console.log(b);
//print: 'b', 'c'
```

##### 2.3.4 concat


concat 这个方法，可以将两个 Array 组合起来，

```javascript
var a=['a'];

var b=['b', 'c'];

console.log(a.concat(b));
//print: 'a', 'b', 'c'
```

concat 会将阵列组合，之后变成全新的数组，如果以例子来说，a 阵列希望变成
\['a', 'b', 'c'\]，可以重新将数值分配给 a，范例来说

```javascript
a = a.concat(b);    
```

##### 2.3.5 Iterator


阵列资料，必须要有 Iterator，将资料巡回一次，通常是使用循环的方式，

```javascript
var a=['a', 'b', 'c'];

for(var i=0; i < a.length; i++) {
    console.log(a[i]);
}

//print: a
//       b
//       c
```

事实上可以用更简单的方式进行，

```javascript
var a=['a', 'b', 'c'];

a.forEach(function (val, idx) {
    console.log(val, idx);
});

/*
print:
a, 0
b, 1
c, 2
*/
```

在 Array 里面可以使用 foreach 的方式进行 iterator， 里面给予的 function(匿名函数)，第一个变数为 Array 的 Value, 第二个变数为 Array 的指标。其实使用 JavaScript 在网页端与服务器端的差距并不大，但是为了使 NodeJS可以发挥他最强大的能力，有一些知识还是必要的，所以还是针对这些主题介绍一下。

其中 Event Loop、Scope 以及 Callback 其实是比较需要了解的基本知识，cps、currying、flow control是更进阶的技巧与应用。

### 2.4 Event Loop


可能很多人在写Javascript时，并不知道他是怎么被执行的。这个时候可以参考一下jQuery作者John Resig一篇好文章，介绍事件及timer怎么在浏览器中执行：How JavaScript Timers Work。通常在网页中，所有的Javascript执行完毕后（这部份全部都在global scope跑，除非执行函数），接下来就是如John Resig解释的这样，所有的事件处理函数，以及timer执行的函数，会排在一个queue结构中，利用一个无穷循环，不断从queue中取出函数来执行。这个就是event loop。

（除了John Resig的那篇文章，Nicholas C. Zakas的 "Professional Javascript for Web Developer 2nd edition" 有一个试阅本：http://yuiblog.com/assets/pdf/zakas-projs-2ed-ch18.pdf，598页刚好也有简短的说明）

所以在Javascript中，虽然有异步，但是他并不是使用执行绪。所有的事件或是异步执行的函数，都是在同一个执行绪中，利用event loop的方式在执行。至于一些比较慢的动作例如I/O、网页render, reflow等，实际动作会在其他执行绪跑，等到有结果时才利用事件来触发处理函数来处理。这样的模型有几个好处：

- 没有执行绪的额外成本，所以反应速度很快。
- 不会有任何程序同时用到同一个变数，不必考虑lock，也不会产生dead lock,所以程序撰写很简单。 

但是也有一些潜在问题：
任一个函数执行时间较长，都会让其他函数更慢执行（因为一个跑完才会跑另一个）,在多核心硬件普遍的现在，无法用单一的应用程序instance发挥所有的硬件能力。用NodeJS撰写服务器程序，碰到的也是一样的状况。要让系统发挥event loop的性能，就要尽量利用事件的方式来组织程序架构。另外，对于一些有可能较为耗时的操作，可以考虑使用`process.nextTick`函数来让他以异步的方式执行，避免在同一个函数中执行太久，挡住所有函数的执行。

如果想要测试event loop怎样在“浏览器”中运行，可以在函数中呼叫alert()，这样会让所有Javascript的执行停下来，尤其会干扰所有使用timer的函数执行。有一个简单的例子，这是一个会按照设定的时间间隔严格执行动作的动画，如果时间过了就会跳过要执行的动作。点按图片以后，人物会快速旋转，但是在旋转执行完毕前按下“delay”按钮，让alert讯息等久一点，接下来的动画就完全不会出现了。

### 2.5 Scope 与 Closure


要快速理解 JavaScript 的 Scope（变数作用范围）原理，只要记住他是Lexical Scope就差不多了。简单地说，变数作用范围是按照程序定义时（或者叫做程序文本？）的上下文决定，而不是执行时的上下文决定。

为了维护程序执行时所依赖的变数，即使执行时程序运行在原本的scope之外，他的变数作用范围仍然维持不变。这时程序依赖的自由变数（定义时不是local的，而是在上一层scope定义的变数）一样可以使用，就好像被关闭起来，所以叫做Closure。用程序看比较好懂：

```javascript
function outter(arg1) {
    //arg1及free_variable1对inner函数来说，都是自由变数
    var free_variable1 = 3;
    return function inner(arg2) {
        var local_variable1 =2;//arg2及local_variable1对inner函数来说，都是本地变数
        return arg1 + arg2 + free_variable1 + local_variable1;
    };
}

var a = outter(1);//变数a 就是outter函数执行后返回的inner函数
var b = a(4);//执行inner函数，执行时上下文已经在outter函数之外，但是仍然能正常执行，
             //而且可以使用定义在outter函数里面的arg1及free_variable1变数

console.log(b);//结果10
```
在Javascript中，scope最主要的单位是函数（另外有global及eval），所以有可能制造出closure的状况，通常在形式上都是有嵌套的函数定义，而且内侧的函数使用到定义在外侧函数里面的变数。

Closure有可能会造成记忆体泄漏，主要是因为被参考的变数无法被垃圾收集机制处理，造成占用的资源无法释放，所以使用上必须考虑清楚，不要造成意外的记忆体泄漏。（在上面的例子中，如果a一直未执行，使用到的记忆体就不会被释放）

跟透过函数的参数把变数传给函数比较起来，Javascript Engine会比较难对Closure进行优化。如果有性能上的考量，这一点也需要注意。

### 2.6 Callback


要介绍 Callback 之前， 要先提到 JavaScript 的特色。

JavaScript 是一种函数式语言（functional language），所有Javascript语言内的函数，都是高阶函数(higher order function，这是数学名词，计算机用语好像是first class function，意指函数使用没有任何限制，与其他对象一样)。也就是说，函数可以作为函数的参数传给函数，也可以当作函数的返回值。这个特性，让Javascript的函数，使用上非常有弹性，而且功能强大。

callback在形式上，其实就是把函数传给函数，然后在适当的时机呼叫传入的函数。Javascript使用的事件系统，通常就是使用这种形式。NodeJS中，有一个对象叫做EventEmitter，这是NodeJS事件处理的核心对象，所有会使用事件处理的函数，都会“继承”这个对象。（这里说的继承，实作上应该像是mixin）他的使用很简单：
可以使用 对象.on(事件名称, callback函数) 或是 对象.addListener(事件名称,callback函数) 把你想要处理事件的函数传入 在 对象 中，可以使用对象.emit(事件名称, 参数...) 呼叫传入的callback函数 这是Observer Pattern的简单实作，而且跟在网页中使用DOM的addEventListener使用上很类似，也很容易上手。不过NodeJS是大量使用异步方式执行的应用，所以程序逻辑几乎都是写在callback函数中，当逻辑比较复杂时，大量的callback会让程序看起来很复杂，也比较难单元测试。举例来说：

```javascript
var p_client = new Db('integration_tests_20', 
    new Server("127.0.0.1", 27017, {}), {'pk':CustomPKFactory});
p_client.open(function(err, p_client) {
  p_client.dropDatabase(function(err, done) {
    p_client.createCollection('test_custom_key', function(err, collection) {
      collection.insert({'a':1}, function(err, docs) {
        collection.find({'_id':new ObjectID("aaaaaaaaaaaa")},
        function(err, cursor) {
          cursor.toArray(function(err, items) {
            test.assertEquals(1, items.length);
            p_client.close();
          });
        });
      });
    });
  });
});
```

这是在网络上看到的一段操作mongodb的程序码，为了循序操作，所以必须在一个callback里面呼叫下一个动作要使用的函数，这个函数里面还是会使用callback，最后就形成一个非常深的嵌套。

这样的程序码，会比较难进行单元测试。有一个简单的解决方式，是尽量不要使用匿名函数来当作callback或是event handler。透过这样的方式，就可以对各个handler做单元测试了。例如：

```javascript
var http = require('http');
var tools = {
	cookieParser: function(request, response) {
		if(request.headers['Cookie']) {
			//do parsing
		}
	}
};
var server = http.createServer(function(request, response) {
	this.emit('init', request, response);
	//...
});
server.on('init', tools.cookieParser);
server.listen(8080, '127.0.0.1');
```

更进一步，可以把tools改成外部module，例如叫做tools.js：

```javascript
module.exports = {
	cookieParser: function(request, response) {
		if(request.headers['Cookie']) {
			//do parsing
		}
	}
};
```

然后把程序改成：

```javascript
var http = require('http');

var server = http.createServer(function(request, response) {
	this.emit('init', request, response);
	//...
});
server.on('init', require('./tools').cookieParser);
server.listen(8080, '127.0.0.1');
```

这样就可以单元测试cookieParser了。例如使用nodeunit时，可以这样写：

```javascript
var testCase = require('nodeunit').testCase;
module.exports = testCase({
    "setUp": function(cb) {
		this.request = {
			headers: {
				Cookie: 'name1:val1; name2:val2'
			}
		};
		this.response = {};
		this.result = {name1:'val1',name2:'val2'};
		cb();
    },
    "tearDown": function(cb) {
        cb();
    },
    "normal_case": function(test) {
		test.expect(1);
		var obj = require('./tools').cookieParser(this.request, this.response);
		test.deepEqual(obj, this.result);
		test.done();
    }
});
```

善于利用模组，可以让程序更好维护与测试。

### 2.7 CPS（Continuation-Passing Style）


cps是callback使用上的特例，形式上就是在函数最后呼叫callback，这样就好像把函数执行后把结果交给callback继续运行，所以称作continuation-passing style。利用cps，可以在异步执行的情况下，透过传给callback的这个cps callback来获知callback执行完毕，或是取得执行结果。例如：

```html
<html>
<body>
<div id="panel" style="visibility:hidden"></div>
</body>
</html>
<script>
	var request = new XMLHttpRequest();
	request.open('GET', 'test749.txt?timestamp='+new Date().getTime(), true);
	request.addEventListener('readystatechange', (function(next){
		return function() {
			if(this.readyState===4&&this.status===200) {
				next(this.responseText);//<==传入的cps callback在动作完成时
				                                   //执行并取得结果进一步处理
			}
		};
	})(function(str){//<==这个匿名函数就是cps callback
		document.getElementById('panel').innerHTML=str;
		document.getElementById('panel').style.visibility = 'visible';
	}), false);
	request.send();
</script>
```

进一步的应用，也可以参考2-6 流程控制。

### 2.8 函数返回函数与Currying


前面的cps范例里面，使用了函数返回函数，这是为了把cps callback传递给onreadystatechange事件处理函数的方法。（因为这个事件处理函数并没有设计好会传送/接收这样的参数）实际会执行的事件处理函数其实是内层返回的那个函数，之外包覆的这个函数，主要是为了利用Closure，把next传给内层的事件处理函数。这个方法更常使用的地方，是为了解决一些scope问题。例如：

```javascript
<script>
var accu=0,count=10;
for(var i=0; i<count; i++) {
  setTimeout(
    function(){
      count--;
      accu+=i;
      if(count<=0)
        console.log(accu)
    }
  , 50)
}
</script>
```

最后得出的结果会是100，而不是想象中的45，这是因为等到setTimeout指定的函数执行时，变数i已经变成10而离开循环了。要解决这个问题，就需要透过Closure来保存变数i：

```javascript
<script>
var accu=0,count=10;
for(var i=0; i<count; i++) {
	setTimeout(
		(function(i) {
			return function(){
				count--;
				accu+=i;
				if(count<=0)
					console.log(accu)
				};
		})(i)
	, 50);
}
//浅蓝色底色的部份，是跟上面例子不一样的地方
</script>
```

函数返回函数的另外一个用途，是可以暂缓函数执行。例如：

```javascript
function add(m, n) {
  return m+n;
}
var a = add(20, 10);
console.log(a);
```

add这个函数，必须同时输入两个参数，才有办法执行。如果我希望这个函数可以先给它一个参数，等一些处理过后再给一个参数，然后得到结果，就必须用函数返回函数的方式做修改：

```javascript
function add(m) {
  return function(n) {
    return m+n;
  };
}
var wait_another_arg = add(20);//先给一个参数
var a = (function(arr) {
  var ret=0;
  for(var i=0;i<arr.length;i++) ret+=arr[i];
  return ret;
})([1,2,3,4]);//计算一下另一个参数
var b = wait_another_arg(a);//然后再继续执行
console.log(b);
```

像这样利用函数返回函数，使得原本接受多个参数的函数，可以一次接受一个参数，直到参数接收完成才执行得到结果的方式，有一个学名就叫做...Currying（柯里化）。

综合以上许多奇技淫巧，就可以透过用函数来处理函数的方式，调整程序流程。接下来看看...

### 2.9 流程控制

（以sync方式使用async函数、避开嵌套callback循序呼叫async callback等奇技淫巧）

建议参考：

-   <http://howtonode.org/control-flow>
-   <http://howtonode.org/control-flow-part-ii>
-   <http://howtonode.org/control-flow-part-iii>
-   <http://blog.mixu.net/2011/02/02/essential-node-js-patterns-and-snippets>

这几篇都是非常经典的NodeJS/Javascript流程控制好文章（mixu是在介绍一些pattern时提到这方面的主题）。不过我还是用几个简单的程序介绍一下做法跟概念：

#### 2.9.1 并发与等待


下面的程序参考了mixu文章中的做法：

``` javascript
var wait = function(callbacks, done) {
	console.log('wait start');
	var counter = callbacks.length;
	var results = [];
	var next = function(result) {//接收函数执行结果，并判断是否结束执行
		results.push(result);
		if(--counter == 0) {
			done(results);//如果结束执行，就把所有执行结果传给指定的callback处理
		}
	};
	for(var i = 0; i < callbacks.length; i++) {//依次呼叫所有要执行的函数
		callbacks[i](next);
	}
	console.log('wait end');
}

wait(
	[
		function(next){
			setTimeout(function(){
				console.log('done a');
				var result = 500;
				next(result)
			},500);
		},
		function(next){
			setTimeout(function(){
				console.log('done b');
				var result = 1000;
				next(result)
			},1000);
		},
		function(next){
			setTimeout(function(){
				console.log('done c');
				var result = 1500;
				next(1500)
			},1500);
		}
	],
	function(results){
		var ret = 0, i=0;
		for(; i<results.length; i++) {
			ret += results[i];
		}
		console.log('done all. result: '+ret);
	}
);
```

执行结果： wait start wait end done a done b done c done all. result:
3000

可以看出来，其实wait并不是真的等到所有函数执行完才结束执行，而是在所有传给他的函数执行完毕后（不论同步、异步），才执行处理结果的函数（也就是done()）

不过这样的写法，还不够实用，因为没办法实际让函数可以等待执行完毕，又能当作事件处理函数来实际使用。上面参考到的Tim Caswell的文章，里面有一种解法，不过还需要额外包装（在他的例子中）NodeJS核心的fs对象，把一些函数（例如readFile）用Currying处理。类似像这样：

```javascript
var fs = require('fs');
var readFile = function(path) {
    return function(callback, errback) {
        fs.readFile(path, function(err, data) {
            if(err) {
                errback();
            } else {
                callback(data);
            }
        });
    };
}
```

其他部份可以参考Tim Caswell的文章，他的Do.parallel跟上面的wait差不多意思，这里只提示一下他没说到的地方。

另外一种做法是去修饰一下callback，当他作为事件处理函数执行后，再用cps的方式取得结果：

```javascript
<script>
function Wait(fns, done) {
    var count = 0;
    var results = [];
    this.getCallback = function(index) {
        count++;
        return (function(waitback) {
            return function() {
                var i=0,args=[];
                for(;i<arguments.length;i++) {
                    args.push(arguments[i]);
                }
                args.push(waitback);
                fns[index].apply(this, args);
            };
        })(function(result) {
            results.push(result);
            if(--count == 0) {
                done(results);
            }
        });
    }
}
var a = new Wait(
    [
    	function(waitback) {
    		console.log('done a');
    		var result = 500;
    		waitback(result)
    	},
    	function(waitback) {
    		console.log('done b');
    		var result = 1000;
    		waitback(result)
    	},
    	function(waitback) {
    		console.log('done c');
    		var result = 1500;
    		waitback(result)
    	}
    ],
    function(results) {
        var ret = 0,
        i = 0;
        for (; i < results.length; i++) {
            ret += results[i];
        }
        console.log('done all. result: ' + ret);
    }
);
var callbacks = [
    a.getCallback(0),
    a.getCallback(1),
    a.getCallback(0),
    a.getCallback(2)
];

//一次取出要使用的callbacks，避免结果提早送出
setTimeout(callbacks[0], 500);
setTimeout(callbacks[1], 1000);
setTimeout(callbacks[2], 1500);
setTimeout(callbacks[3], 2000);
//当所有取出的callbacks执行完毕，就呼叫done()来处理结果
</script>
```

执行结果：

done a done b done a done c done all. result: 3500

上面只是一些小实验，更成熟的作品是Tim Caswell的step：https://github.com/creationix/step

如果希望真正使用同步的方式写异步，则需要使用Promise.js这一类的library来转换异步函数，不过他结构比较复杂XD（见仁见智，不过有些人认为Promise有点过头了）：http://blogs.msdn.com/b/rbuckton/archive/2011/08/15/promise-js-2-0-promise-framework-for-javascript.aspx

如果想不透过其他Library做转换，又能直接用同步方式执行异步函数，大概就要使用一些需要额外compile原始程序码的方法了。例如Bruno Jouhier的streamline.js：https://github.com/Sage/streamlinejs

#### 2.9.2 循序执行

循序执行可以协助把非常深的嵌套callback结构摊平，例如用这样的简单模组来做（serial.js）：

```javascript
module.exports = function(funs) {
    var c = 0;
    if(!isArrayOfFunctions(funs)) {
        throw('Argument type was not matched. Should be array of functions.');
    }
    return function() {
        var args = Array.prototype.slice.call(arguments, 0);
        if(!(c>=funs.length)) {
            c++;
            return funs[c-1].apply(this, args);
        }
    };
}

function isArrayOfFunctions(f) {
    if(typeof f !== 'object') return false;
    if(!f.length) return false;
    if(!f.concat) return false;
    if(!f.splice) return false;
    var i = 0;
    for(; i<f.length; i++) {
        if(typeof f[i] !== 'function') return false;
    }
    return true;
}
```

简单的测试范例（testSerial.js），使用fs模组，确定某个path是档案，然后读取印出档案内容。这样会用到两层的callback，所以测试中有使用serial的版本与nested callbacks的版本做对照：

```javascript
var serial = require('./serial'),
    fs = require('fs'),
    path = './dclient.js',
    cb = serial([
    function(err, data) {
        if(!err) {
            if(data.isFile) {
                fs.readFile(path, cb);//<=这个地方可以理解为递归
            }
        } else {
            console.log(err);
        }
    },
    function(err, data) {
        if(!err) {
            console.log('[flattened by searial:]');
            console.log(data.toString('utf8'));
        } else {
            console.log(err);
        }
    }
]);
fs.stat(path, cb);

fs.stat(path, function(err, data) {
    //第一层callback
    if(!err) {
        if(data.isFile) {
            fs.readFile(path, function(err, data) {
                //第二层callback
                if(!err) {
                    console.log('[nested callbacks:]');
                    console.log(data.toString('utf8'));
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log(err);
        }
    }
});
```

关键在于，这些callback的执行是有顺序性的，所以利用serial返回的一个函数cb来取代这些callback，然后在cb中控制每次会循序呼叫的函数，就可以把嵌套的callback摊平成循序的function阵列（就是传给serial函数的参数）。

测试中的`./dclient.js`是一个简单的dnode测试程序，放在跟testSerial.js同一个目录：

```javascript
var dnode = require('dnode');

dnode.connect(8000, 'localhost',  function(remote) {
    remote.restart(function(str) {
        console.log(str);
        process.exit();
    });
});
```

执行测试程序后，出现结果：

    [flattened by searial:]
    var dnode = require('dnode');
    
    dnode.connect(8000, 'localhost',  function(remote) {
        remote.restart(function(str) {
            console.log(str);
            process.exit();
        });
    });

    [nested callbacks:]
    var dnode = require('dnode');
    
    dnode.connect(8000, 'localhost',  function(remote) {
        remote.restart(function(str) {
            console.log(str);
            process.exit();
        });
    });


对照起来看，两种写法的结果其实是一样的，但是利用serial.js，嵌套的callback结构就会消失。不过这样也只限于顺序单纯的状况，如果函数执行的顺序比较复杂（不只是一直线），还是需要用功能更完整的流程控制模组比较好，例如
<https://github.com/caolan/async> 。
