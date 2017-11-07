## Node.js 调优

作为一门后端语言，肯定要求运行的效率最优化，以实现对于资源最小损耗，这一章正是围绕这个话题展开。调优是一个有挑战性的活儿，可能经常让人摸不着头脑，下面的内容尽量使用实例来带入一个个调优的场景。

### 11.1 准备工作

首先我们准备一个 http server 端代码，请求后返回一个二维码图片：

```javascript
var http = require('http');
var ccap = require('ccap')();//Instantiated ccap class 

http.createServer(function (request, response) {
    if(request.url == '/favicon.ico')return response.end('');//Intercept request favicon.ico
    var ary = ccap.get();
    var txt = ary[0];
    var buf = ary[1];
    response.end(buf);
    console.log(txt);
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');
```

**代码 11.1.1 app.js**

对于 node 版本大于 6.3 的会比较简单，运行

```shell
node --inspect=9229 app.js
```

**命令 11.1.1**

启动的 node 进程会带有调试功能，使用 Chrome DevTools 即可远程查看当前运行的 js 源码，并且能够生成 CPU 和 内存快照，这对于我们分析性能十分有帮助。

运行完**命令11.1.1**之后，我们在控制台上会看到如下输出：

```
> node --inspect=9229 app.js

Debugger listening on port 9229.
Warning: This is an experimental feature and could change at any time.
To start debugging, open the following URL in Chrome:
    chrome-devtools://devtools/remote/serve_file/@60cd6e859b9f557d2312f5bf532f6aec5f284980/inspector.html?experiments=true&v8only=true
&ws=127.0.0.1:9229/1a19bc9d-7175-4df3-b131-2eca35c7c844
Server running at http://127.0.0.1:8124/
Debugger attached
```

**输出 11.1.1**

我们将输出的地址 `chrome-devtools://devtools/remote/serve_file/@60cd6e859b9f557d2312f5bf532f6aec5f284980/inspector.html?experiments=true&v8only=true
&ws=127.0.0.1:9229/1a19bc9d-7175-4df3-b131-2eca35c7c844` 贴到 chrome 地址栏中访问，然后我们看到的竟然是一个空白页，好多教程中都说会直接打开一个 chrome 开发面板，然而并没有（我使用的是 Chrome 62 版本）。这时候，你在任何一个网页中手动打开一个开发面板，

![](images/inspect_dev.png)

**图 11.1.1**

你会发现多了一个 Node 的小图标，我用红色矩形专门标记了出来，点击这个图标又弹出了一个面板，

![](images/new_inspect_dev.png)

**图 11.1.2**

里面有一个按钮 `Add connection`，其实我们只需要记住启动node程序的 `inspect` 参数即可将远程调试我们的 node 程序。我们点开他的 `Source` tab 页，能够找到我们启动的 app.js 的源码：

![](images/inspect_source.png)**图 11.1.3**

> 这项功能对于chrome来说还处于实验状态，所以在操作过程中如果你的浏览器崩溃，不要怀疑，这属于正常现象。

### 11.2 压力测试

要想知道性能如何，需要首先借助压力测试工具，这里我们选择开源的 [JMeter](http://jmeter.apache.org/) 。

打开 JMeter 后，首先创建一个线程组，用过 LoadRunner 的同学，可能会比较熟悉`用户数`，这个概念对应到 JMeter 的话，就是线程组中的线程

![](images/add_thread_group.png)

**图 11.2.1 添加线程组**

接着我们添加一个 HTTP 请求的默认参数

![](images/add_http_request_config.png)

**图 11.2.2 HTTP请求默认参数设置**

在这里我们仅仅需要设置 ip 和端口号即可：

![](images/http_default_request_config.png)

**图 11.2.3 设置HTTP请求默认参数**

其实这个步骤并不是必须的，下面我们要设置一个 http 请求的 sampler，在那里面设置请求的 ip 和端口号也是可以的，只不过这里提前设置好了，这样如果你想对当前网站配置多个请求 sampler 的时候，可以省去公共部分的配置，特别当你的请求都有公共参数的时候，不过由于我们这里仅仅测试一个 URL，所以优势没有体现出来。

![](images/jmeter_http_req_sampler.png)

**图 11.2.4 添加 HTTP 请求 sampler**

由于前面在图 11.2.3 中已经设置了请求的 ip 和端口，这里仅仅设置一下请求路径即可：

![](images/http_request_sampler_config.png)

**图 11.2.5 配置 HTTP 请求 sampler**

最后点击工具栏中的按钮 ![](images/start_test.png)即可开始测试。

接着我们回到线程组的配置，

![](images/thread_group_config.png)

里面配置的线程数，可以控制同时发送请求的线程数，我们在做测试的时候逐步增加线程数，然后查看 Node 进程的 CPU 占有率，直到达到 100% （windows下多核CPU的操作系统，显示看是否达到100%/n，其中n为 CPU 核心数，比如说常见的 4 核心的 windows，达到 25%，则代表一颗 CPU 核心被吃满）。

当你的 Node 进程达到满负载之后，回到**图11.1.2**的 Profiler 标签页，选择 Start 按钮开始生成 CPU profile 文件，等待一段时间时候，选择 Stop 则会得到一份 CPU profile，

![](images/cpu_profile.png)

**图 11.2.6 生成的 CPU profile 文件**

通过分析可知 Socket 的write 操作和原生代码操作（即第二行标记为program的调用）比较耗费CPU，由于我们在**代码11.1.1** 使用了 ccap 这个验证码生成库，而这个库的核心代码是 C/C++ 编写的，所以耗时操作统一算在 program 身上。

