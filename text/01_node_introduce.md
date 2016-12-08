## 1 Node.js 体系结构

其实我就是想写一下 Node 的底层架构，但是说道底层这个东西，我就想起来了我上学时候的一门课《计算机体系机构》，就是把计算机各个部件的运行原理给串起来来讲，所以我就把这章的名字定为 Node.js 体系结构，但愿讲得够底层。

### 1.1 网络 IO 模型变迁
Node.js 是一门服务器语言，为了体现 Node 的优越性，我们这里不得不扯一下服务器开发的一些历史。

我们最常见的服务器程序一般是基于 HTTP 和 TCP 协议来提供服务的，HTTP 底层又基于 TCP ，所以我们直接来描述 TCP 协议在服务器端实现的逻辑。在操作系统中TCP的通信过程又被称之为网络IO操作，下面描述的就是网络IO操作的简史。

TCP 服务在建立完 socket 监听后，会调用 accept() 函数来监听客户端的连接请求，但是这个过程是堵塞的。也就是说如果函数没有返回，当前线程会一直等待，而且在这个等待的过程中无法做任何事情。伪代码如下：

```
while(true) {
    socket = accept();
}
```
**代码 1.1.1 socket建立连接伪代码**

代码 1.1中我们通过accept函数，服务器和客户端之间建立了一个socket连接，建立完连接之后，就可以开始发送接收数据的操作。但是当程序运行到accept函数的时候，是堵塞的，也就是说这个函数不运行完成，代码是没法继续运行的。
假设我们现在 accept 函数返回了，那么我们就可以读取这个连接发送过来的请求数据了：

```
while(true) {
    socket = accept();
    while(true) {
        data = read(socket);
        //process_data(data);//处理数据
    }
}
```
**代码 1.1.2 读取socket数据伪代码**

不过和 accept 一样，这个 read 函数依然是堵塞的。照这个趋势下去，一个服务器只能给一个连接做服务了，其他的连接就干等着。这可不是我们想要的结果。

我们的前辈们想到的解决方案是fork子[进程](https://zh.wikipedia.org/wiki/%E8%A1%8C%E7%A8%8B)，每次跟客户端建立一个连接，都创建一个新的子进程来维护当前连接，在这个新的子进程中进行发送和接收数据。这种子进程的模型的典型代表就是 Apache 1.x。我们来看一下伪代码：

```
while(true) {//主进程代码
    socket = accept();
    var child = fork(socket);
}

while(true) {//子进程代码
    data = read(socket);
}
```
**代码 1.1.3 子进程读取socket数据伪代码**

看上去是一个好的解决方案，各个socket连接在读取数据的时候都是在单独的一个进程中完成的，不会互相堵塞。不过进程的创建是一个耗时的操作，而且操作系统对于启动的最大进程数也是有限制的，如果服务器创建大量线程，有可能导致系统其他进程无法启动(所以一般服务器都会限制启动子进程的最大数目，这个时候在程序里面会维护一个socket队列，来决定那些连接被丢入子进程进行处理。)。这个时候[线程](https://zh.wikipedia.org/wiki/%E7%BA%BF%E7%A8%8B)便进入了大家的视野，它作为cpu的最小调度单位，具有比进程更少的资源占用，最好的性能。线程有进程创建，对于一个进程来说，它所创建的线程共享其内存数据，且可以被统一管理。由于使用线程的逻辑和使用进程的逻辑类似，所以这里不给出伪代码。 Apache 从2.x开始增加了对多线程的支持。  

即使使用了线程，但是计算机的CPU每次可以处理的线程数是有限的（单核CPU每次处理一个线程，双核可以同时处理两个，Intel使用超线程技术，可以使一个核心处理两个线程，所以说我们常用的i5处理器，虽然是两核但是却可以同时处理四线程），为了让各个线程公平对待，CPU在单位时间内会切换正在处理的线程。但是这个切换动作是比较耗时的，CPU在将处理的线程任务切换走之前要暂存线程的内存，在切换入一个新的要处理的进程之前要读取之前暂存的线程内存，当然还要考虑到CPU内部还要有一套调度算法，来决定什么时候将线程切换到CPU进行处理。所以说使用线程也会遇到性能瓶颈，不会像我们想的那样，线程数起的越多，性能越好。

不过在操作系统中有非堵塞IO（nonblocking IO）的概念，既然它叫这个名，那么我们前面讲的就应该叫堵塞IO（blocking io）了。我们还是通过类比来解释在读取socket数据时两者的区别，同时看看这个传说中的非堵塞IO能否解决我们的问题。

我们把socket通讯过程类比为你在淘宝上买东西的过程，你在淘宝上下单买了件商品（socket连接建立了）。不过为了了解到包裹是否送达了，你需要定时给快递员打电话咨询。不过你在打完电话之后还可以忙别的，比如说看会儿书，喝喝茶。然后你想起来，我靠还有一个快递呢，于是赶紧再打一个电话，结果发现人家快递员已经在楼下等了半天。所以说，要想尽早得到快递，你得一直跟快递员打电话（俗称呼死他）。

> 有人问，为什么不是快递员给你打电话，而是你给快递员打电话，首先声明一下，为了简化描述的工作量，我们现在先按照linux操作系统来讲，在linux系统中只能用户去调用内核函数，没有内核函数主动通知用户程序的功能。我们这里内核函数就是快递员，用户程序就是你自己，所以只能你自己打电话给快递员。同时大家需要注意，对于非堵塞 IO 这个定义，有不同的叫法，有的管我们刚才提到的这种方式交非堵塞 IO ，但是有的管 IO 多路复用 （下面马上讲）叫非堵塞 IO。

OK，下面要轮到我们的 IO 多路复用闪亮登场了。 一般你在淘宝上买东西，填写邮寄方式的时候，都是直接写你自己的地址，不过淘宝其实提供了菜鸟驿站这个东西，你可以在不方便的情况下把，把包裹的邮寄地址写成菜鸟驿站。这个样子你的所有快递就都可以由菜鸟驿站来代收了，不过你仍然要打电话询问驿站的工作人员，快递来了吗（因为我们用的是linux，在这个操作系统下，内核是不会主动通知用户程序的）。

回到上面的栗子，你可能会问如果单纯一件商品的话，自己直接等快递显然比先送到菜鸟驿站再打电话问要快。是的，没错！但是不要忘了，为了收多件快递，没订购一件商品，都要克隆出另外一个你（fork子进程或者创建线程），来等着收快递，一旦你淘宝上下单量很大，管理这些克隆人的成本就会陡增（主要耗费在进程或线程的上下文切换和调度）。所以说在连接数不大的情况下使用堵塞IO反而效率更高。

这个IO 多路复用在linxu上几经更新，发展到现在，使用的最新技术就是 epool ，nginx底层就是利用了这个技术。其实通过前面的栗子，我们发现 IO 多路复用中依然有堵塞过程（不断打电话给菜鸟驿站的过程），但是我们在实际编程中可以专门做一个子线程来做打电话的工作（相当于给你请了一个秘书），然后主线程可以该干嘛干嘛。

## 1.2 libuv

Node 的开发者 Ryan dahl，起初想构建一个可以处理大量HTTP连接的web服务，他知道使用C语言可以实现这个目标，前面章节讲到 IO 多路复用在大量连接数的时候，性能要优于堵塞 IO。但那是C语言开发效率太低了，特别是当你做web开发的时候，当时恰逢08年，谷歌刚推出V8引擎，我们的Ryan dahl经过各种选型和权衡后，最终选择用C、C++做了一个 IO 处理层，结合V8引擎，组成了 Node。这个 IO 处理层，就是我们现在说到的 libuv。

我们前面的内容是基于 linux 描述的，但是类似于 epool 的操作，在不同的操作系统实现库函数是不同的，在 windows 上有IOCP，MAC上有kqueue,SunOS上有event ports，这个时候有一个抽象层对外提供统一的 api 是一个好的选择，libuv就解决了这个问题，但是这不是他所有的功能。

libuv的[官方文档](http://docs.libuv.org/en/v1.x/design.html)在阐述他的架构的时候给出来这么[一张图](http://docs.libuv.org/en/v1.x/_images/architecture.png)，但是仅仅凭着这么一张图并不能让你对其内部机制理解得更透彻。

我们知道 node 使用了 V8 引擎，但是在 node 里面 V8 充当的角色更多的是语法解析层面，另外它还充当了 JavaScript 和 c/c++ 的桥梁。但是我们都知道 Node 中一切皆可异步，但这并不是通过 V8 来实现的，充当这个角色的是 libuv。libuv 作为实现此功能的幕后工作者，一直不显山不露水，今天就要将其请到前台来给大家展示一下。

js 怎样做一个异步代码，`setTimeout`函数即可搞定：

```javascript
setTimeout(function(){console.log('timeout 0');},0);
console.log('outter');
```  
**代码 1.2.1 一个简单的js定时器演示**

> 最终输出结果先是打印 `outter` 然后打印 `timeout 0`。

想要深挖为什么会出现这样的结果，要首先来研究一下 libuv 的事件轮询机制。在libuv中，有一个**句柄（handle）**的概念，每个句柄中存储数据和回调函数之类的信息，句柄在使用前要添加到对应的**队列（queue）**或者**堆（heap）**中，其实只有定时器句柄使用了[最小堆](https://zh.wikipedia.org/wiki/%E6%9C%80%E5%A4%A7%E2%80%94%E6%9C%80%E5%B0%8F%E5%A0%86)的数据结构，其他句柄使用队列的数据结构进行存储。libuv在进行每一次事件轮询的时候都会从每个类型的句柄中取出一个句柄进行处理。具体到代码**1.2.1**，调用完`setTimeout`之后，将创建一个定时器句柄添加到libuv内部的堆中（前面提到存储定时器句柄的数据结构是堆），如果在某一次事件轮询中取到这个句柄，则会触发它的回调函数。下面是事件轮询的源码：

```c
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
  int timeout;
  int r;
  int ran_pending;

  r = uv__loop_alive(loop);
  if (!r)
    uv__update_time(loop);

  while (r != 0 && loop->stop_flag == 0) {
    uv__update_time(loop);
    uv__run_timers(loop);
    ran_pending = uv__run_pending(loop);
    uv__run_idle(loop);
    uv__run_prepare(loop);

    timeout = 0;
    if ((mode == UV_RUN_ONCE && !ran_pending) || mode == UV_RUN_DEFAULT)
      timeout = uv_backend_timeout(loop);

    uv__io_poll(loop, timeout);
    uv__run_check(loop);
    uv__run_closing_handles(loop);

    if (mode == UV_RUN_ONCE) {
      /* UV_RUN_ONCE implies forward progress: at least one callback must have
       * been invoked when it returns. uv__io_poll() can return without doing
       * I/O (meaning: no callbacks) when its timeout expires - which means we
       * have pending timers that satisfy the forward progress constraint.
       *
       * UV_RUN_NOWAIT makes no guarantees about progress so it's omitted from
       * the check.
       */
      uv__update_time(loop);
      uv__run_timers(loop);
    }

    r = uv__loop_alive(loop);
    if (mode == UV_RUN_ONCE || mode == UV_RUN_NOWAIT)
      break;
  }

  /* The if statement lets gcc compile it to a conditional store. Avoids
   * dirtying a cache line.
   */
  if (loop->stop_flag != 0)
    loop->stop_flag = 0;

  return r;
}
```  
**代码 1.2.2 事件轮询源码**  

可能很多人对C代码不是很熟，没有关系，我们直接给出他的流程图，参数 `uv_run_mode` 代表当i安事件轮询使用的方式，如果是
