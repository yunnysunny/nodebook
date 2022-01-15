## 13 Web Worker

Web Worker 技术，本是前端 API，作为 HTML5 标准 API ，被各大浏览器支持。借助于 V8 引擎的东风，Node 在 10.x 开始引入 Web Worker 的 API。引入了这个API 后，Node 中也可以将应用代码单独运行在某个创建的线程中。

### 13.1 简单开始

下面是一个使用 Web Worker 的简单例子

```javascript
const path = require('path');
const { Worker } = require('worker_threads');

const worker = new Worker(
    path.join(__dirname, './worker.js'),
    { workerData: { a: 1} }
);
worker.postMessage('begin');
worker.on('message', (msg) => {
    console.log('info from child', msg);
});
worker.on('error', (err) => {
    // 子线程崩溃时，会抛出异常，触发 error 事件，这里可以重新触发线程的创建过程，保证线程一直在线
    console.error('worker emmit error', err);
});
worker.on('exit', (code) => {
    //线程退出事件
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

Web Woker 的构造函数比较简单，只有两个参数，第一个参数为 js 代码路径或者 js 代码字符串，第二个参数用来传递给子线程初始化参数，该参数目前仅支持 `workerData` 这一个属性，通过 **代码 13.2 worker.js** 可以看出，它被注入到了子线程的上下文中了，可以通过读取 `require('worker_threads').workerData` 来直接获取它的值。

Web Woker 的 API 本身并不复杂，但是它为 Node 的编程打开了一扇大门。站在大门口的开发者们，相比于新 API 带来的兴奋感，我们更应该提防“乐极生悲”。

当前 Node 中使用多进程来利用多核 CPU 资源。每个 CPU 核心在使用的过程中，都会被拆分成各个时间片，然后操作系统通过轮转各个时间片给具体的某个线程，来保证各个线程都能获得时间被处理。但是让每个 CPU 核心都有活干，却可能仅仅是一个理想状态。“一个和尚挑水喝，两个和尚抬水喝，三个和尚没水喝”的故事还经常萦绕在耳边，其实根本原因就在于组织调度没有做好。虽然你创建的每个 Web Worker 都运行在独立的线程上，而且这些独立线程不会让 V8 的主线程卡顿，但是我们可以这么认为吗？我只能说上面说法，在满足一定条件下是正确的，这个条件就是你创建的线程总数一定要在一个可控的范围内。前面讲到操作系统通过轮转时间片来让每个线程都得到处理时间。

![](images/cpu_schedule.png)

**图 13.1 CPU 调度流程**

用户的各个应用中创建的线程，都会在内核中通过调度算法进行分配 CPU 核心。如果线程数少，那么调度算法的损耗比较小，但是一旦用户的应用程序的线程规模失控，整个调度过程就会变得十分低效，会严重拖垮整个系统的性能。我们做这么一个假设，假设去银行办理业务的时候，必须通过大堂经理来决定办业务的顾客是去哪个窗口，如果当前办业务的人数居多，这个大堂经理肯定会忙不过来。

同时我们还应该留意到 CPU 核心在处理完一个线程，然后切换到下一个线程的时候，需要做上下文切换，即需要将上一个线程的数据切换出当前核心，然后把下一个线程的数据切入当前核心。虽然这个过程很快，但是分跟谁比，相比 CPU 的运算指令来说，这就是一个慢操作，也就是说单个核心上频繁的 CPU 线程切换，会让 CPU 的有效利用率下降。

我们再考虑一个极端情况，就是假定现在所有被等待调度的线程，里面的用户代码都是做运算，那么每个线程都可以在一定时间内把单个 CPU 核心吃满，这也就是我们常说的计算密集型的线程。假设当前主机的 CPU 核心数为 N，那么操作系统中最多服务 N 个计算密集型线程，超过 N 个后，线程和线程之间就必须得互相竞争 CPU 的时间片，导致每个线程的处理时延被拉大。然而我们在 Node 中开启 Web Worker ，很多情况下就是为了处理计算密集型任务，这种情况下最好不要将创建的 Web Worker 数大于 CPU 核心数。在实际使用中，一般会采用池化技术来限定线程的使用数目，让 CPU 核心数得到合理的运用。

> 关于 Web Worker 池化的技术，可以参考笔者的项目 [yunnysunny/threads](https://github.com/yunnysunny/threads)。

线程和进程都可以用来控制并发，且线程比进程要更加轻量级，为何社区没有对于 Web Worker 出现大面积使用的情况呢？可能有些人面对 Web Worker 的时候还会发出上述的疑问。

Web Worker 虽是线程级别的技术，但是它是从浏览器领域中引入的 API，跟传统后端语言中线程相比欠缺了很多关键技术细节。







