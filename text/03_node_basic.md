## 3 Node 基础

### 3.1 安装

打开 [Node官网](https://nodejs.org) ,引入眼帘的就是它的下载地址了，windows下提供的是安装程序（下载完之后直接双击安装），linux下提供的是源码包（需要编译安装），详细安装流程这里省略掉，我想这个不会难倒各位好汉。

### 3.2 旋风开始

在讲 Node 语法之前先直接引入一段 Node 的小例子，我们就从这个例子着手。首先我们在随意目录下创建两个文件 `a.js` `b.js`。

```javascript
exports.doAdd = function(x,y) {
    return x+y;
};
```
**代码 3.2.1 a.js**  

```javascript
const a = require('./a');

console.log(a.doAdd(1,2));
```
**代码 3.2.2 b.js**  

和普通前端 javascript 不同的是，这里有两个关键字 `exports` 和 `require`。这就牵扯到模块化的概念了，javascript 这门语言设计的初衷是开发一门脚本语言，让美工等从业人员也能快速掌握并做出各种网页特效来，加之当初语言创作者开发这门语言的周期非常之短，所以在 javascript 漫长的发展过程中一直是没有模块这个语言特性的（直到最近ES6的出现才打破了这个格局）。

>
Node 是最近几年才发展起来的语言，前端 js 发展的历史要远远长于他，2000 年以后随着 [Ajax](https://zh.wikipedia.org/wiki/AJAX) 技术越来越流行，js的代码开始和后端代码进行交互，逻辑越来越复杂，也越来越需要以工程化的角度去组织它的代码。模块化就是其中一项亟待解决的问题，期间出现了很多模块化的规范，[CommonJS](https://en.wikipedia.org/wiki/CommonJS) 就是其中的一个解决方案。由于其采用同步的模式加载模块，逐渐被前端所抛弃，但是却特别适合服务器端的架构，服务器端只需要在启动前的时候把所有模块加载到内存，启动完成后所有模块就都可以被调用了。

我们在命令行中进入刚才我们新创建的那个文件夹下，然后运行 `node b.js`，会输出 `3` ，这就意味着你的第一个node程序编写成功了。

在a.js中 exports 对象会被 `导出`，在 b.js 中通过require 就能得到这个被导出的对象，所以我们能访问这个被导出对象的 doAdd 函数。假设我们在 a.js 中还有一个局部变量：

```javascript
var tag = 'in a.js';
exports.doAdd = function(x,y) {
    console.log(tag,x,y);
    return x+y;
};
```
**代码 3.2.3 a.js**  

这里定义的 `tag` 变量是没法在 `b.js` 中读取的，其作用区域仅仅被局限在 `a.js` 中。如果在 b.js 中打印 `console.log(a.tag)` 会输出 `undefined`。


这里 `b.js` 里我们引用 `a.js` 时用 require('./a')，假设我们现在的目录结构是这样的

```
---a.js
---b.js
---lib
|-------c.js
```
**目录3.2.1**

这个时候我们在b.js 中就可以通过 `const c = require('./lib/c');` 来引入 c.js。同时 node 本身还包含了各种系统API。比如通过require('fs')，可以引入系统自带的 [文件操作库](https://nodejs.org/dist/latest-v6.x/docs/api/fs.html)。下面就举一个操作文件的栗子：

```javascript
const fs = require('fs');

exports.getData = function(path,callback) {
    fs.exists(path,statCallback);
    
    function statCallback(exists) {
        if (!exists) {
            return callback(path+'不存在');
        }
        const stream = fs.createReadStream(path);
        let data = '';
        stream.on('data',function(chunk) {
            data += chunk;
        });
        stream.on('end',function() {
            callback(false,data);
        });
    }
};

```
**代码 3.2.4 c.js**

代码 3.2.4中 函数 `exists` 用来判断文件是否存在， `createReadStream` 函数返回一个 **readable stream(可读流)**，node 中IO（包括文件IO和网络IO）处理采用 [stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html) (流)的方式进行处理。同时在流的内部还使用[EventEmitter](https://nodejs.org/dist/latest-v6.x/docs/api/events.html#events_class_eventemitter)来触发事件，具体到 **代码 3.2.4** 中，我们会看到 `data` 事件和 `end` 事件，分别表示当前有新读入的数据、当前的数据全都读取完毕了。

接下来我们写一个测试代码来对 c.js 进行测试：

```javascript
const path = require('path');
const c = require('./lib/c');

c.getData(path.join(__dirname,'test.txt'),function(err,data) {
    console.log(err,data);
});
```
**代码 3.2.5 fs_test.js**  

注意上述代码中的全局变量 `__dirname` 他获取的是当前代码文件所在的路径，我们在 fs_test.js 同级目录下放了一个 test.txt，所以这里使用 `path.join(__dirname,'test.txt')` 来获取一个绝对路径。假设我们的test.txt 在目录data中，

```
---fs_test.js
---data
|------test.txt
```
**目录 3.2.2**  
那么就写 `path.join(__dirname,'data/test.txt')`。

## 3.3 做一个Apache
现在我们做个更让人兴奋的栗子，做一个 Apache，当然这里的 Apache 不是武装直升机，而是一个服务器，熟悉php的人对他肯定不会陌生。你在本地安装它之后，然后在其默认的网站目录中放一张图片，我们假设它为a.jpg，然后你就可以通过 http://localhost/a.jpg 来访问它了。下面的内容就是要模拟这个过程。

要做这个处理，我们首先要搞懂 node 中的 http 包。我们抄一段 node 官网给出的快速搭建 http 服务器的代码吧：

```javascript
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```
**代码 3.3.1 example.js**

直接运行 `node example.js`，然后我们打开 chrome ，输入网址 http://localhost:3000,就会在网页上看到 `Hello world`。OK，我们回头看一下代码，关键部分在于 `createServer` 的回调函数上，这里有两个参数 `req` 和 `res`，这两个变量也是 [stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html) 类型，前者是**readable stream(可读流)**，后者是**writeable stream(可写流)**，从字面意思上推测出前者是用来读取数据的，而后者是用来写入数据的。大家还有没有记得我们在**代码 3.2.4**中函数`fs.createReadStream` 也返回一个 readable stream。接下来就是一个见证奇迹的时刻， stream 类上有一个成员函数叫做 `pipe`，就像它的名字 **管道** 一样，他可以将两个流通过管子连接起来：

![pipe原理示意图](images/pipe.png)

**图 3.3.1 pipe原理**  

有了pipe这个功能，我们就能将 fs.createReadStream 函数得到的可读流转接到res这个可写流上去了。说干就干，我们简单修改一下代码 3.3.1，就可以让其成为一个 Apache：

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;
const imageDir = __dirname + '/images';


const server = http.createServer((req, res) => {
    const url = req.url;
    const _path = path.join(imageDir , url);
    fs.exists(_path,function(exists) {
        if (exists) {
            res.statusCode = 200;
            res.setHeader('Content-Type', `image/${path.extname(url).replace('.','')}`);
            fs.createReadStream(_path).pipe(res);
        } else {
            res.statusCode = 404;
            res.end('Not Found');
        }
    });
    
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```
**代码3.3.2 app.js**

我们仅仅使用了一句`fs.createReadStream(_path).pipe(res);`,就便捷的将文件流输出到HTTP的响应流中了，是不是很强大。OK来看一下效果，运行 `node app.js`，在浏览器中打开 `http://localhost:3000/a.png` 就能看到显示效果。

![最终我们的apache显示效果](images/success.png)  
**图 3.3.2 最终我们的apache显示效果**
## 3.4 流进阶

node 的 stream API 是 node 的核心，HTTP 和 TCP 的各种 API ，都是基于 stream 之上的。但是 stream API 本身又过于复杂，让人难以理解。虽然官方文档洋洋洒洒写了一长串的说明，但是好多实现的细节是没有在文档中透露出来的，究其原因还是内部逻辑太繁琐，导致很难用几段话讲清楚。

### 3.4.1 原理分析

首先 stream 的设计初衷是为了“节流”，说的直白些就是内存中待处理的数据量过大，如果处理的速度过慢，就是导致内存中挤压的数据越来越多，最终导致进程不稳定或者内存溢出进而崩溃，而 stream 的存在，就是构建一个缓冲地带。stream 的类（从功能上分为两种 [`Writable`](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_class_stream_writable) 和 [`Readable`](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_class_stream_readable) ）在初始化的时候会指定一个 `highWaterMark` 参数，借助此来约定内部使用缓冲区的长度，超过这个参数，就不应该往缓冲区添加数据了。下面对于 `Readable` 和 `Writable` 中的 `highWaterMark` 的使用流程分别进行说明。

`Readable` 通过 [push](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_readable_push_chunk_encoding) 函数添加数据，数据在其内部存储为一个双向链接的数据结构（具体参见 [BufferList](https://github.com/nodejs/node/blob/master/lib/internal/streams/buffer_list.js) 源码，令人遗憾的是这么方便的数据结构在 Node API 中却没有暴露），如果当前链表中的数据长度达到 `highWaterMark`，`push` 函数就会返回 `false`，不过你依然可以调用 `push` 写入数据。有就是说内部链表的数据长度会大于 `highWaterMark`，Node 内部对于可读流的内存控制完全交给了调用者本身，这个 `highWaterMark` 就是一个警示作用，告诉你现在缓冲区已经满了，你自己看着办吧，如果你不理会，继续往里面写，撑爆了内存是你自己的责任，于我无关。`Readable` 通过 [read](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_readable_read_size) 函数读取数据，读取的时候可以指定长度，如果指定了长度就从内部链表的队尾移出指定长度的元素交给调用者；如果没有指定长度，就会把所有元素移出交给用户。

`Writable` 内部维持一个计数器，代表有多少条数据还未写入完成，通过 [write](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_writable_write_chunk_encoding_callback) 函数添加数据，此时计数器加一（假设我们此时只写一条数据），其内部调用 [_write](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_writable_write_chunk_encoding_callback_1) 来实现实际的写操作，在 `_write` 实际写完之后在其回调函数中计数器减一。每次调用 `write` 时，如果计数器的值小于 `highWaterMark`，就返回 `true`，这样你可以安心的写；如果为 `false` 就代表当前待写入的数据超标了，如果再写入就有可能会导致内存中的数据越积越多，最终雪崩。这种将主动权放给调用者的行为是和 `Readable` 是如出一辙的。

### 3.4.2 创建自定义读写流

#### 3.4.2.1 自定义可读流

先实现一个可读流，具体代码如下：

```javascript
const { Readable } = require('stream');

class MyReadable extends Readable {
  constructor(options) {
    super(options);
    
  }
  _read() {
    console.log('_read has been called');
    const index = Math.random() * 0xff;
    this.push(Buffer.from([index & 0xff]));
  }
}

const reader = new MyReadable({
    highWaterMark:4,
});
const initSize =6;
for (let i=0;i<initSize;i++) {
    const pushResult = reader.push(Buffer.from([i & 0xff]));
    if (!pushResult) {
        console.warn('reach highwatermark, you have better not to push',i);
    }
}
console.log(reader.read());

```

**代码 3.4.2.1.1**

可读流依靠 `push` 函数来将数据添加到内部缓冲区，同时在当前事件轮询 “阶段” 的末尾判断缓冲区长度是否低于 `highWaterMark` ，如果低于这个值，就会强制触发调用 `read(0)`，这个调用只会填充满当前的缓冲区，尝试让其的长度达到 `highWaterMark`。

> Node 中使用 process.nextTick 函数来将代码置于当前事件轮询 “阶段” 的末尾执行。事件轮询处在 1.2 节中有介绍，常见的阶段有 定时器回调阶段、pending 回调阶段、IO 事件轮询回调阶段、check 回调阶段，在任意以上阶段的回调中使用 nextTick 函数的话，则 nextTick 函数回调中将此阶段回调队列执行完成后，跟随执行。不过需要注意，如果 nextTick 执行次数过多，将会延长当前阶段的执行时间，导致其他阶段 “饥饿”。

read 函数内部会级联调用 _read ，我们一般会将数据的 push 操作放到 _read 中，虽然你可以手动调用 push 来写入内部缓冲区，但是将数据写入放到 _read 中可以尽量让流本身在读写之间达到平衡。

#### 3.4.2.2 自定义可写流

```javascript
const { Writable } = require('stream');

class MyWritable extends Writable {
  _write(chunk, encoding, callback) {
    setTimeout(function() {
      callback();
    },100);
  }
}

const writer = new MyWritable({
  highWaterMark: 3
});

for (var i=0;i<6;i++) {
   const result = writer.write(Buffer.from([i & 0xff]));
   console.log('推荐下次继续写',result);
}
writer.on('drain',function() {
  console.log('现在可以放心写了');
});
writer.on('error',function(err) {
  console.error('写错误',err);
});
```

**代码 2.4.2.2.1**

这里为了更快的观察可写流内置缓冲区被写满的现象，这里将 `highWaterMark` 的值设置为 3，这样在 15 行循环到 2 的时候写操作就会返回 false。正常情况下 write 函数返回 false 的时候，就需要停下写入，等待 `drain` 事件触发后再写入，上面的程序明显是一个不规范的写法。

`_write` 函数是供给内部调用使用的，在自己来实现可写流的子类时，这个函数是必须要实现的。`_write` 内部通过 `callback` 函数来标记写入完成。这个回调函数调用之前，认为数据是没有写入成功的。

### 3.4.3 可读流的两种读取模式

可读流提供了两种读取模式，flow 模式和 no-flow 模式，可读流有一个 `readableFlowing` 属性，默认为 `null`。如果给可读流对象增加 `data` 事件监听、调用函数 `resume` / `pipe` ，将会使用可读流进入 flow 模式，当时`readableFlowing` 会被置为 true。调用 `pause` / `unpipe` 函数会将可读流切换到 no-flow 模式，并且将 `readableFlowing` 置为 false，这个时候必须手动调用函数 `resume` / `pipe` 才能将其切换回 flow 模式，如果在这种情况下添加 `data` 事件是无法切换为 flow 模式的。

将流职位 no-flow 还有一种方式就是添加 `readable` 事件监听。注意，如果你同时给可读流添加了 `readable` 和 `data` 的事件，则 `readable` 的优先级高于 `data`，流将回进入 no-flow 模式。当你将 `readable` 事件移出，只保留 `data` 事件时，则回到 flow 模式。

在可读流的使用过程中，你应该尽量选择一种读取模式，以此降低自己代码的复杂度。Node 中通过调用可读流不同函数来隐式的修改其工作模式的方式，确实是一种比较让人艰涩难懂的设计。

### 3.4.4 可写流的缓冲区

为了防止可写写流写入的速度过快，可写流提供了两个函数 `cork` 和 `uncork`，调用 `cork` 后会把要写入的数据缓存起来，直到调用函数 `uncork` 后才会一股脑将缓存的数据做真正的写入。

### 3.4.5 highWaterMark 的计算单位

`highWaterMark` 默认以字节为单位，但是在以下两种情况下，它的单位会发生改变：流对象的构造函数支持传入 `objectMode` 参数，默认为 `false`，如果设置为 `true`，则 `highWaterMark` 的单位变成对象个数；流对象的构造函数支持传入 `defaultEncoding` 参数，对于可读流来说默认为 `null`（此时 `highWaterMark` 的单位为字节），对于可写流来说默认为 `utf-8`（此时如果写入的数据中含有中文等字符，则写入的元素个数算 1 个，而不是 3 个）。 不过如果同时设置 `objectMode` 为 `true` 和 自定义的 `defaultEncoding` 参数时，`defaultEncoding` 参数将会被忽略。

流对象，还支持通过调用 `setDefaultEncoding` 来在使用过程中修改编码方式，这个时候会使读写流的计数方式动态发生更改，也算是一个比较隐蔽的坑。

## 3.5 TCP

之所以将 TCP 的内容放到流教程的后面，是由于 TCP 中的 [net.Socket](https://nodejs.org/dist/latest-v12.x/docs/api/net.html#net_class_net_socket) 类就是继承自 [stream.Duplex](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_class_stream_duplex) 类。上一节中没有讲 `Duplex` 类，它相当于将可读流和可写流的功能合二为一，不过其内部读写的数据是分别存储在两个缓冲区中，不相互影响；于其对应的是类 [stream.Transform](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_class_stream_transform)，它也是将可读流和可写流的功能合二为一，不过其内部读写流的缓冲区是共享的。

TCP 属于传输层协议，大家都对 HTTP 的服务编写比较熟悉，我们可以通过 API 方便的发送请求、接收响应数据。但是你发送的 HTTP 请求时，在 API 底层要封装成符合 HTTP 协议的请求数据数据包，同意在接收响应后，也是 API 底层帮我们把 HTTP 数据包解析出来，抛到应用层。HTTP 1.x 时代，只能通过客户端发送请求来触发通信流动，服务器端不能主动给客户端发送数据，如果想实现全双工的通信，就直接的就是借助 TCP 层面的协议。

> HTTP 2.x 开始，服务器端和客户端可以互相发送数据，与此类似的功能，还包括 html5 标准中的 websocket 协议。





## 3.5 总结

我们用两个小节讲述了 Node 中如何处理静态资源和动态请求，看完这些之后，如果你是一个初学者，可能会因此打退堂鼓，这也太麻烦了，如果通过这种方式来处理数据，跟 php java 之类的比起来毫无优势可言嘛。大家不要着急，Node 社区已经给大家准备了各种优秀的 Web 开发框架，比如说 [Express](https://expressjs.com/)、[Koa](http://koajs.com/)，绝对让你爱不释手。你可以从本书的第 6 章中学习到 express 基本知识。

本章示例代码可以从这里找到：https://github.com/yunnysunny/nodebook-sample/tree/master/chapter3 。
