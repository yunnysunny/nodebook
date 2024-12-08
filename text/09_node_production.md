## 9 Node.js 最佳实践

### 9.1 配置文件

一般代码的运行的环境起码应该包括本地开发环境和线上运行环境，那么问题来了，你开发环境用的配置信息可是跟线上环境不一样的。那么已经存储这个配置信息呢？在代码中写死肯定是最low的方式。更通用的方式是使用配置文件，可是你一旦将这个配置文件就面临一个问题，你这个配置文件一旦提交到了 git 之后，你的同事 pull 代码之后，就有可能就他本地配置文件覆盖掉，而这个配置文件中又包含了本地文件路径有关的配置，但是你和你的同事用的还不是一个操作系统（一个 windows，一个 mac），想想这个场景就恶心。那如果我们不将这个配置文件提交 git 呢？每次新增配置文件选项，都需要口头通知你的同事们，又比如有新同事加入到这个项目来了，你只能把你电脑上存储的配置文件发他一份，让他做相应的修改再使用，想想这个场景就恶心。  
其实解决这个问题的办法也很简单，就是在 git 上放置一个配置文件的示例文件，我们就假设它为 `config.example.json` ，里面写入所有的示例配置项。然后在 `.gitignore` 中将 `config.json` 添加进去，最后你在代码中加载 `config.json` 这个配置文件，这样子的话大家都可以使用自己的配置文件，不会相互干扰，同时在 git 还存留了一份示例文件，配置项的更改都可以呈现到这个示例文件上。貌似是个完美的解决方案，其实这种解决方案不仅适用用 node ，任何语言都适用。  
但，这并不是问题的终点，我们是给出了一个配置示例文件 `config.example.json`，但是如果配置项有修改，你的同事不修改 `config.example.json` 怎么办？那就把错误扼杀在摇篮中吧，在我们的项目中会引入一个 `setting.js` 的文件来负责做配置项校验，在应用加载时，如果检测到某个参数不存在或者非法，就直接退出当前进程，让你启动不起来：  

```javascript
var log4js = require('log4js');
var mongoskin = require('mongoskin');
var redis = require('redis');
var slogger = require('node-slogger');

var configObj = require('../config.json');
var settings = require('./lib/settings').init(configObj);
exports.port = settings.loadNecessaryInt('port');

//保证配置文件中的debugfilename属性存在，且其所在目录在当前硬盘中存在
var debugFile = settings.loadNecessaryFile('debuglogfilename', true);
var traceFile = settings.loadNecessaryFile('tracelogfilename', true);
var errorFile = settings.loadNecessaryFile('errorlogfilename', true);

log4js.configure({
    appenders: [
        {type: 'console'},
        {type: 'dateFile', filename: debugFile, 'pattern': 'dd', backups: 10, category: 'debug'}, //
        {type: 'dateFile', filename: traceFile, 'pattern': 'dd', category: 'trace'},
        {type: 'file', filename: errorFile, maxLogSize: 1024000, backups: 10, category: 'error'}
    ],
    replaceConsole: true
});

var debugLogger = exports.debuglogger = log4js.getLogger('debug');
var traceLogger = exports.tracelogger = log4js.getLogger('trace');
var errorLogger = exports.errorlogger = log4js.getLogger('error');
slogger.init({
    debugLogger:debugLogger,
    traceLogger:traceLogger,
    errorLogger:errorLogger
});


var dbConfig = settings.loadNecessaryObject('db');//保证配置文件中的db属性存在
if (dbConfig.url instanceof Array) {
    exports.db = mongoskin.db(dbConfig.url, dbConfig.dbOption, dbConfig.relsetOption);
} else {
    exports.db = mongoskin.db(dbConfig.url, dbConfig.dbOption);
}

var redisConfig = settings.loadNecessaryObject('redis');//保证配置文件中的redis属性存在
exports.redis = redis.createClient(redisConfig.port, redisConfig.host);
```

**代码 9.1 使用配置文件**  

### 9.2 自动重启

作为一个健壮的线上环境，肯定不希望自己的应用程序垮掉。然而，现实开发中在代码中总是会时不时出现未捕获的异常导致程序崩溃，真实编程实践中，我们肯定会对代码慎之又慎，但是想要代码100%无bug是不可能的，想想那个整天升级打补丁的微软。  
我们用下面代码监听未捕获异常：  

```javascript
process.on('uncaughtException', function(err) {
    try {
        errorlogger.error('出现重大异常，重启当前进程',err);
    } catch(e) {
        console.log('请检查日志文件是否存在',e);
    }

    console.log('kill current process:'+process.pid);
    process.exit();
});
```

**代码 9.2.1 监听未捕获异常**  
在`代码 9.2.1`中最后一行将当前进程强制退出，这是由于如果不这么做的话，很有可能会触发内存泄漏。我们肯定希望进程在意外退出的时候，能够重新再启动。这种需求其实可以使用 Node 的 cluster 来实现，这里我们不讲如何通过代码来达到如上需求，我们介绍一个功能十分之完备的工具——[pm2](https://pm2.keymetrics.io/)。  
首先我们运行 `cnpm install pm2 -g` 对其进行全局安装。为了做对比，我们首先来观察不用pm2的效果。本章用的源码是第6章的基础上完成的，由于在第6章中我们使用了登陆拦截器，为了不破坏这个结构，我们新生成一个路由器，放置在 `routes/test.js`，然后在 `app.js` 中引入这个拦截器：

```javascript
app.use('/test',testRotes);
app.use(authFilter);
app.use('/', routes);
```

**代码 9.2.2 添加测试路由器**  
然后在 `routes/test.js` 中添加让程序崩溃的代码：

```javascript
router.get('/user', function(req, res) {
  setTimeout(function() {
    console.log(noneExistVar.pp);
    res.send('respond with a resource');
  },0);  
});
```

**代码 9.2.3 导致进程崩溃**  
可能你要问，这个地方为啥要加个 `setTimeout` ，因为如果你不把这个错误放到异步代码中，就会像**代码 5.2.6**那样被express本身捕获到，就不会触发未捕获异常了。  
最后启动应用，访问 `/test/user` 路径，不出意外，程序崩溃了。  
然后我们用 pm2 来启动:  

`pm2 start src/bin/www`   
运行成功后会有如下输出：

```
[PM2] Spawning PM2 daemon                                                                                                         
[PM2] PM2 Successfully daemonized                                                                                                 
[PM2] Starting src/bin/www in fork_mode (1 instance)                                                                              
[PM2] Done.                                                                                                                       
┌──────────┬────┬──────┬──────┬────────┬─────────┬────────┬─────────────┬──────────┐                                                                  

│ App name │ id │ mode │ pid  │ status │ restart │ uptime │ memory      │ watching │                                              
├──────────┼────┼──────┼──────┼────────┼─────────┼────────┼─────────────┼──────────┤                                                                  

│ www      │ 0  │ fork │ 5804 │ online │ 0       │ 10s    │ 29.328 MB   │ disabled │                                              
└──────────┴────┴──────┴──────┴────────┴─────────┴────────┴─────────────┴──────────┘                                                                  

 Use `pm2 show <id|name>` to get more details about an app
```

**输出 9.2.1**  
pm2 命令还有好多命令行参数，如果单纯手敲的话就太麻烦了，幸好它还提供了通过配置文件的形式来指定各个参数值，它支持使用 json 或者 yaml 格式来书写配置文件，下面给出一个 json 格式的配置文件：

```json
{
  apps : [{
    name        : "chapter7",
    script      : "./src/bin/www",
    instances   : 2,
    watch       : true,
    error_file  : "/temp/log/pm2/chapter7/error.log",
    out_file    : "/temp/log/pm2/chapter7/out.log",
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
      "NODE_ENV": "production"
    }
  }]
}
```

**配置文件 9.2.1 process.json**  

> 我为啥要在日志文件的路径配置项上写linux路径呢，因为在 windows 下使用 pm2 ，一旦出现未捕获异常，进程重启的时候，都会弹出命令行窗口来抢占当前的桌面。所以我只能在 linux 下进行测试。并且经过测试，如果使用node 0.10.x版本的话，遇到未捕获异常时，进程无法重启，会僵死，所以推荐使用 4.x+版本。

接着运行如下命令来启动项目：

```
pm2 start process.json
```

**命令 9.2.1**  
如果你想重启当前项目，运行：  

```
pm2 restart process.json
```

**命令 9.2.2**  

如果想关闭当前进程，运行：

```
pm2 stop process.json
```

**命令 9.2.3**  

你还可以使用命令 `pm2 logs chapter7` 来查看当前项目的日志。最后我们来测试一下，访问我们故意为之的错误页面`http://localhost:8100/test/user`,会看到控制台中会打印重启日志：

```
chapter7-0 ReferenceError: noneExistVar is not defined
chapter7-0     at null._onTimeout (/home/gaoyang/code/expressdemo/chapter7/src/routes/test.js:7:17)
chapter7-0     at Timer.listOnTimeout (timers.js:92:15)
chapter7-0 [2016-09-16 23:28:14.016] [ERROR] error - 出现重大异常，重启当前进程 [ReferenceError: noneExistVar is not defined]
chapter7-0 ReferenceError: noneExistVar is not defined
chapter7-0     at null._onTimeout (/home/gaoyang/code/expressdemo/chapter7/src/routes/test.js:7:17)
chapter7-0     at Timer.listOnTimeout (timers.js:92:15)
chapter7-0 [2016-09-16 23:28:14.025] [INFO] console - kill current proccess:6053
chapter7-0 load var [port],value: 8100
chapter7-0 load var [debuglogfilename],value: /tmp/debug.log
chapter7-0 load var [tracelogfilename],value: /tmp/trace.log
chapter7-0 load var [errorlogfilename],value: /tmp/error.log
chapter7-0 [2016-09-16 23:28:14.908] [INFO] console - load var [db],value: { url: 'mongodb://localhost:27017/live',
chapter7-0   dbOption: { safe: true } }
chapter7-0 [2016-09-16 23:28:14.934] [INFO] console - load var [redis],value: { port: 6379, host: '127.0.0.1' }
chapter7-0 [2016-09-16 23:28:15.003] [INFO] console - Listening on port 8100
```

**输出 9.2.1**  
我们看到进程自己重启了，最终实现了我们的目的。  

### 9.3 开机自启动

虽然我们在服务上线的时候，可以请高僧来给服务器开光，其实只要不是傻子就看得出来那只不过博眼球的无耻炒作而已。机器不是你想不宕就不宕，所以说给你的服务加一个开机自启动，是绝对有必要的，庆幸的是 pm2 也提供了这种功能。

以下演示命令是在 Ubuntu 16.04 做的，其他服务器差别不大，首先运行 `pm2 startup`，正常情况会有如下输出：

```
[PM2] Writing init configuration in /etc/init.d/pm2-root
[PM2] Making script booting at startup...
>>> Executing chmod +x /etc/init.d/pm2-root
[DONE] 
>>> Executing mkdir -p /var/lock/subsys
[DONE] 
>>> Executing touch /var/lock/subsys/pm2-root
[DONE] 
>>> Executing chkconfig --add pm2-root
[DONE] 
>>> Executing chkconfig pm2-root on
[DONE] 
>>> Executing initctl list
rc stop/waiting
tty (/dev/tty3) start/running, process 2312
tty (/dev/tty2) start/running, process 2310
tty (/dev/tty1) start/running, process 2308
tty (/dev/tty6) start/running, process 2318
tty (/dev/tty5) start/running, process 2316
tty (/dev/tty4) start/running, process 2314
plymouth-shutdown stop/waiting
control-alt-delete stop/waiting
rcS-emergency stop/waiting
kexec-disable stop/waiting
quit-plymouth stop/waiting
rcS stop/waiting
prefdm stop/waiting
init-system-dbus stop/waiting
splash-manager stop/waiting
start-ttys stop/waiting
rcS-sulogin stop/waiting
serial stop/waiting
[DONE] 
+---------------------------------------+
[PM2] Freeze a process list on reboot via:
$ pm2 save

[PM2] Remove init script via:
$ pm2 unstartup systemv
```

按照上面的提示，用 `pm2 save` 产生当前所有已经启动的 pm2 应用列表，这样下次服务器在重启的时候就会加载这个列表，把应用再重新启动起来。

最后，如果不想再使用开机启动功能，运行 `pm2 unstartup systemv` 即可取消。

### 9.4 使用docker

随着智能设备的蓬勃发展，整个互联网的网民总数出现了井喷，对于软件开发者来说，面对的用户群体越来庞大，需求变化原来越快，导致软件开发的规模越来越大，复杂度越来越高。为了应对这些趋势，最近几年一些新的技术渐渐被大家接受，比如说 [devops](https://zh.wikipedia.org/wiki/DevOps)，比如说我们接下来要讲的 [docker](https://zh.wikipedia.org/wiki/Docker_(%E8%BB%9F%E9%AB%94)) 容器。

有了docker，大家就可以本地开发代码，然后开发完成之后直接打一个包扔到服务器上运行，这个包就是我们所说的容器，它跟宿主机无关，不管运行在何种宿主机上，它的内部环境都是一致。所以说有了docker，我们再也不用担心在本地跑的好好的，结果一到服务器就出错的问题了。

>  当然如果你们服务器使用了Docker 技术的话，9.3小节的内容就没有必要使用了。因为在 docker 上是不用设置开机服务的。同时我们也不用使用 PM2 技术来进行重启，docker 中会监听 1 号进程的运行情况，一旦这个进程退出整个容器也就处于退出状态，如果你在启动 docker 的时候加了 `--restart=always` 参数，那么容器随后也会被 docker 守护程序再启动起来。

为了能够运行 docker 容器，我们需要现有一个镜像，这个镜像通过 Dockerfile 文件来声明构建过程。一个简单的 Nodejs 的 Dockerfile 的格式可以是这样的：

```dockerfile
FROM node
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "app.js"]
```

**代码 9.4.1 chapter9/simple/Dockerfile**

通过 `docker build . -t app:simple` 可以创建 app:simple 这个镜像；然后通过 `docker run app:simple` 即可运行这个镜像，运行后输出 `Example app listening on port 3000`。

> 为了演示简单，这里的 app.js 只是一个 Express 的 helloworld 程序:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
```

**代码 9.4.2 chapter9/simple/app.js**

这么简单使用，看上去是没啥问题的，但是打包出来的镜像个头是比较大的，同时会影响打包和部署的时间。我们可以将 代码 9.4.1 中的 `FROM node` 换成 `FROM node:slim` 。之前我们使用的 FROM node 其实是 FROM node:latest 的缩写，它制作的时候使用的基础镜像包含了额外的一些软件包，但是我们平常用不到，但是 node:slim 这个版本基于一个精简版本的基础镜像制作而成，制作出来的体积会大大减少。我们复制代码 9.4.1，然后重命名为 slim.Dockerfile 文件，将第一行改为 FROM node:slim 。接着运行 `podman build . -f slim.Dockerfile -t app:slim` 即可打出来我们需要的更见轻量的镜像了。

不过平常我们在开发过程中会安装很多开发依赖，这些开发依赖根本不需要被打包出来的程序所使用，所以代码 9.4.1 中可以优化为 npm install --omit=dev ，这样就只会将生产依赖打包到镜像中，如果开发依赖的包有很多的话，可能又会减轻很多体积。

还有一个需要注意的，npm 等包管理工具，在安装过程中同时还会写入磁盘缓存方便加快后续安装，但是我们的镜像打出来后就不会再重复运行安装了，这些缓存是很没有必要的。这时候我们可以利用 dockerfile 的构建阶段来做出来一个“两段式”的结构：

```dockerfile
FROM node AS build
WORKDIR /app
COPY .npmrc .
COPY ./package-lock.json .
COPY ./package.json .
RUN npm install --omit=dev
FROM node:slim AS app
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
CMD ["node", "app.js"]
```

**代码 9.4.3 chapter9/simple/two-stages.Dockerfile**

这里的构建分为 build 和 app 两个阶段，在 build 阶段我们把 .npmrc package-lock.json packge.json 三个文件拷贝到镜像中，用来安装生产依赖包。之所以要单独放一个 .npmrc 文件，是想通过修改 npm 的镜像源来加快 npm 的安装过程，否则使用官方源在国内安装是十分缓慢的。



### 9.5 代码

参见 https://github.com/yunnysunny/nodebook-sample/tree/master/chapter9 。