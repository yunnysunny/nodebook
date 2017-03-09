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

和普通前端 javascript 不同的是，这里有两个关键字 `exports` 和 `require`。这就牵扯到模块话的概念了，javascript 这门语言设计的初衷是开发一门脚本语言，让美工等从业人员也能快速掌握并做出各种网页特效来，加之当初语言创作者开发这门语言的周期非常之短，所以在 javascript 漫长的发展过程中一直是没有模块这个语言特性的（直到最近ES6的出现才打破了这个格局）。

>
Node 是最近几年才发展起来的语言，前端 js 发展的历史要远远长于他，2000年以后随着 [Ajax](https://zh.wikipedia.org/wiki/AJAX)技术越来越流行，js的代码开始和后端代码进行交互，逻辑越来越复杂，也越来越需要以工程化的角度去组织它的代码。模块化就是其中一项亟待解决的问题，期间出现了很多模块化的规范，[CommonJS](https://en.wikipedia.org/wiki/CommonJS)就是其中的一个解决方案。由于其采用同步的模式加载模块，逐渐被前端所抛弃，但是却特别适合服务器端的架构，服务器端只需要在启动前的时候把所有模块加载到内存，启动完成后所有模块就都可以被调用了。

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

代码 3.2.4中 函数 `exists` 用来判断文件是否存在， `createReadStream` 函数返回一个 **readable stream(可读流)**，node 中IO（包括文件IO和网络IO）处理采用[stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html)(流)的方式进行处理。同时在流的内部还使用[EventEmitter](https://nodejs.org/dist/latest-v6.x/docs/api/events.html#events_class_eventemitter)来触发事件，具体到 代码 3.2.4中，我们会看到 `data` 事件和 `end` 事件，分别表示当前有新读入的数据、当前的数据全都读取完毕了。

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

![pipe原理示意图](https://raw.githubusercontent.com/yunnysunny/nodebook/master/images/pipe.png)

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

![最终我们的apache显示效果](https://raw.githubusercontent.com/yunnysunny/nodebook/master/images/success.png)  
**图 3.3.2 最终我们的apache显示效果**

## 3.4 HTTP请求参数

既然我们称 Node.js 是一门后端语言，那他就应该能处理 HTTP 请求中的请求参数，比如说我在 URL 上添加查询参数（类似于这种 `/xxx?a=1&b=2`），再比如说通过表单提交数据。 Node 确实提供了处理这两种数据的能力，只不过让人感觉到稍显“低级”。






