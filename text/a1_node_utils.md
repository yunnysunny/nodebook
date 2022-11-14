## A1 Node.js 好用工具介绍

工欲善其事必先利其器，Node 语言的发展离不开一帮优质第三方库。下面提到的各个包基本在书中没有提到，属于查漏补缺，这里仅仅是列一个清单，供大家查阅。

### A1.1  log.io

可以在浏览器中实时监控服务器的日志的一个库。

<http://logio.org/>

```
npm config set unsafe-perm true 
npm install -g --prefix=/usr/local log.io
log.io server start

http://localhost:8998
```

### A1.2 socket.io

websocket给前端带来了变革，从此前端也可以光明正大的用上长连接，socket.io正是顺应此时势而生的的。它在高版本浏览器上使用 websocket ， 在低版本浏览器上使用 ajax 轮询，保证对所有浏览器的兼容。虽然本书没有对其拿出专门的章节进行介绍，但是它真的很重要。

<https://socket.io/>

```
npm install socket.io
```
