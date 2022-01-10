## 13 Web Worker

Web Worker 技术，本是前端 API，作为 HTML5 标准 API ，被各大浏览器支持。借助于 V8 引擎的东风，Node 在 10.x 开始引入 Web Worker 的 API。引入了这个API 后，Node 中也可以将应用代码单独运行在某个创建的线程中。

### 13.1 简单开始

下面是一个使用 Web Worker 的简单例子

```javascript
const path = require('path');
const { Worker } = require('worker_threads');

const worker = new Worker(
    path.join(__dirname, './worker.js'),
    workerData: { a: 1}
);
worker.postMessage('begin');
worker.on('message', (msg) => {
    console.log('info from child', msg);
});
```

**代码 13.1 parent.js**

```javascript
const { parentPort, workerData } = require('worker_threads');
console.log('data from parent', workerData);
parentPort.on('message', data => {
    parentPort.postMessage(' worker recive: ' + data);
});
```

**代码 13.2 worker.js**



