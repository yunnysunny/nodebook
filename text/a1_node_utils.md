## A1 Node.js 好用工具介绍

工欲善其事必先利其器，Node 语言的发展离不开一帮优质第三方库。下面提到的各个包基本上在书中都有提到，这里仅仅是列一个清单，供大家查阅。

### A1.1  log.io

Real-time log monitoring in your browser

<http://logio.org/>

```
npm config set unsafe-perm true 
npm install -g --prefix=/usr/local log.io
log.io server start

http://localhost:8998
```
    
### A1.2 log4js

node日志打印工具，可以在控制台格式化输出日志，可以将日志打印到指定文件，日志文件可以按照日期或者大小进行拆分。我们在**代码 7.1**中曾经出现过它的身影。

<https://github.com/nomiddlename/log4js-node>

```
npm install log4js
```

### A1.3 mongoskin

对于原生 mongo node 驱动进行封装，使其对开发者更友好。在6.2章节曾经拿出一整节来讲它的使用。

<https://github.com/kissjs/node-mongoskin>

```
npm install mongoskin
```

### A1.4 socket.io

websocket给前端带来了变革，从此前端也可以光明正大的用上长连接，socket.io正是顺应此时势而生的的。它在高版本浏览器上使用 websocket ， 在低版本浏览器上使用 ajax 轮询，保证对所有浏览器的兼容。虽然本书没有对其拿出专门的章节进行介绍，但是它真的很重要。

<http://socket.io/>

```
npm install socket.io
```

### A1.5 mocha

鼎鼎大名js单元测试框架，本书专门拿出7.3一个章节对其进行介绍。

<http://mochajs.org/>

```
npm install --global mocha
```

### A1.6 nan

如果你是个 node 原生扩展的开发者，一定曾经对于V8各个版本API接口不兼容而大为光火，幸好有了 nan 这个包，它抽象出来了一个头文件来解决这个问题，从此扩展开发者就可以写一套代码运行在各个版本的node上了。本书第8章有对其的内容介绍。

```
npm install nan
```

### A1.7 express

在 Node 的web框架领域，如果express 敢称第二，没有人敢称第一。虽然我们把他列到了最后，但是不代表他是不重要的。本书专门拿出第5、6两章来讲述他的使用。

```
npm install express
```
