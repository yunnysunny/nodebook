## 7 Node.js 最佳实践

### 7.1 配置文件
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
**代码 7.1 使用配置文件**  
### 7.2 自动重启
作为一个健壮的线上环境，肯定不希望自己的应用程序垮掉。然而，现实开发中在代码中总是会时不时出现未捕获的异常导致程序崩溃，真实编程实践中，我们肯定会对代码慎之又慎，但是想要代码100%无bug是不可能的，想想那个整天升级打补丁的微软。  
我们用下面代码监听未捕获异常：  

```javascript
process.on('uncaughtException', function(err) {
    try {
        errorlogger.error('出现重大异常，重启当前进程',err);
    } catch(e) {
        console.log('请检查日志文件是否存在',e);
    }

    console.log('kill current proccess:'+process.pid);
    process.exit();
});
```
**代码 7.2.1 监听未捕获异常**  
在`代码 7.2.1`中最后一行将当前进程强制退出，这是由于如果如果不这么做的话，很有可能会触发内存泄漏。我们肯定希望进程在意外退出的时候，能够重新再启动。这种需求其实可以使用 Node 的 cluster 来实现，这里我们不讲如何通过代码来达到如上需求，我们介绍一个功能十分之完备的工具——[pm2](http://pm2.keymetrics.io/)。  
首先我们运行 `cnpm install pm2 -g` 对其进行全局安装。为了做对比，我们首先来观察不用pm2的效果。本章用的源码是第6章的基础上完成的，由于在第6章中我们使用了登陆拦截器，为了不破坏这个结构，我们新生成一个路由器，放置在 `routes/test.js`，然后在 `app.js` 中引入这个拦截器：

```javascript
app.use('/test',testRotes);
app.use(authFilter);
app.use('/', routes);
```
**代码 7.2.2 添加测试路由器**  
然后在 `routes/test.js` 中添加让程序崩溃的代码：

```javascript
router.get('/user', function(req, res) {
  setTimeout(function() {
    console.log(noneExistVar.pp);
    res.send('respond with a resource');
  },0);  
});
```
**代码 7.2.3 导致进程崩溃**  
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
                                                                                                              
│ www      │ 0  │ fork │ 5804 │ online │ 0       │ 10s    │ 28.328 MB   │ disabled │                                              
└──────────┴────┴──────┴──────┴────────┴─────────┴────────┴─────────────┴──────────┘                                                                  
                                                                                                              
 Use `pm2 show <id|name>` to get more details about an app
```  
**输出 7.2.1**  
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
**配置文件 7.2.1 process.json**  
> 我为啥要在日志文件的路径配置项上写linux路径呢，因为在 windows 下使用 pm2 ，一旦出现未捕获异常，进程重启的时候，都会弹出命令行窗口来抢占当前的桌面。所以我只能在 linux 下进行测试。并且经过测试，如果使用node 0.10.x版本的话，遇到未捕获异常时，进程无法重启，会僵死，所以推荐使用 4.x+版本。


接着运行如下命令来启动项目：

```
pm2 start process.json
```  
**命令 7.2.1**  
如果你想重启当前项目，运行：  

```
pm2 restart process.json
```
**命令 7.2.2**  

如果想关闭当前进程，运行：

```
pm2 stop process.json
```
**命令 7.2.3**  


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
chapter7-0 load var [debuglogfilename],value: /tmp/weibo.debug.log
chapter7-0 load var [tracelogfilename],value: /tmp/weibo.trace.log
chapter7-0 load var [errorlogfilename],value: /tmp/weibo.error.log
chapter7-0 [2016-09-16 23:28:14.908] [INFO] console - load var [db],value: { url: 'mongodb://localhost:27017/live',
chapter7-0   dbOption: { safe: true } }
chapter7-0 [2016-09-16 23:28:14.934] [INFO] console - load var [redis],value: { port: 6379, host: '127.0.0.1' }
chapter7-0 [2016-09-16 23:28:15.003] [INFO] console - Listening on port 8100
```
**输出 7.2.1**  
我们看到进程自己重启了，最终实现了我们的目的。  
### 7.2 单元测试
对于一个程序员来说不仅要写代码，还要验证一下代码写得到底对不对，写单元测试就是一个通用且有效的解决方案。单元测试很重要，可以将错误扼杀在摇篮中，如果你认为没有写单元测试也过得很好，也许等我介绍完 [mocha](http://mochajs.org/) 之后，你会改变主意的。  
下面给出一个栗子，领导给了小明一个计算器的项目，不过这个项目周期比较长，后期需要增加更多的人手，所以对于每一个模块都要有相应的测试用例。下面是小明开工后写的第一个函数，一个加法函数：

```javascript
function add(a,b) {
    return a+b;
}
```
**代码 7.2.1 add函数**  
小明之前没有接触过单元测试，于是乎他写出的测试用例是这样的：

```javascript
var s = add(1,2);
if (s == 3) {
    console.log('恭喜你，加法测试成功了');
} else {
    console.error('哎呦，加法测试出错了啊');
}
```  
**代码 7.2.2 不使用测试框架的测试用例**  
接着他又写了减法函数、乘法函数、除法函数，但是随着模块的增加，他逐渐的意识到一个问题，如果按照代码7.2.2的模式的话，一则输出格式比较乱，而且测试结果没有最终统计信息，不能一下子得出成功数和失败数。于是乎他去网上找资料，然后他就发现了大名鼎鼎的 `mocha`。  
研究了一番，小明发现 `mocha` 提供了测试结果输出格式化和测试结果统计的功能，也就是说对于上面那个加法测试用例，就可以这么写了：

```javascript
var assert = require('assert');
describe('Calculator', function() {
  describe('#add()', function() {
    it('should get 3 when 1 add 2', function() {
      assert.equal(3, add(1,2));
    });
  });
});
```  
**代码 7.2.3 使用mocha改写测试用例**  
官网上说， mocha 在使用的时候，可以使用全局安装的模式，也可以安装为当前项目的开发依赖包（即在安装的时候使用`--save-dev`参数），不过小明考虑到以后各个项目都要用得到，于是决定进行全局安装（`npm install mocha -g`）。  
安装完之后，小明兴奋的新建了文件`calculator_test.js`:  

```javascript
var assert = require('assert');
var calculator = require('./calculator');

describe('Calculator', function() {
  describe('#add()', function() {
    it('should get 3 when 1 add 2', function() {
      assert.equal(3, calculator.add(1,2));
    });
  });
});
```  
**代码 7.2.4 文件calculator_test.js部分代码**  
接着他运行`node calculator_test.js`，没想到结果打出他的意料，报错了：

```
e:\kuaipan\code\node\myapp\chapter7\src\test\mocha>node calculator_test.js                                                     
                                                                                                                               
e:\kuaipan\code\node\myapp\chapter7\src\test\mocha\calculator_test.js:4                                                        
describe('Calculator', function() {                                                                                            
^                                                                                                                              
ReferenceError: describe is not defined                                                                                        
    at Object.<anonymous> (e:\kuaipan\code\node\myapp\chapter7\src\test\mocha\calculator_test.js:4:1)                          
    at Module._compile (module.js:456:26)                                                                                      
    at Object.Module._extensions..js (module.js:474:10)                                                                        
    at Module.load (module.js:356:32)                                                                                          
    at Function.Module._load (module.js:312:12)                                                                                
    at Function.Module.runMain (module.js:497:10)                                                                              
    at startup (node.js:119:16)                                                                                                
    at node.js:929:3
```  
**输出 7.2.1 命令node calculator_test.js的输出**  
一定是小问题，小明心里嘀咕着，然后顺手打开了google，直接搜索`ReferenceError: describe is not defined                                                                         `在第一页就发现了答案，原来要运行`mocha calculator_test.js`（还是谷歌靠谱）。运行完正确的命令后，果然看到想要的结果了：

```
e:\kuaipan\code\node\myapp\chapter7\src\test\mocha>mocha calculator_test.js                                                    
                                                                                                                               
                                                                                                                               
  Calculator                                                                                                                   
    #add()                                                                                                                     
      √ should get 3 when 1 add 2                                                                                              
                                                                                                                               
                                                                                                                               
  1 passing (7ms)
```
**输出 7.2.2 命令mocha calculator_test.js的输出**  
小明发现，这里之所以使用 node 自带的 assert 包，是由于 mocha 仅仅本身没有提供断言（Assertion）库，所以他又尝试了几种常用的断言库。  
**1.should.js**  
他使用的格式是 (something).should 或者 should(something)，更多使用方法还得参阅其[github文档](https://github.com/Automattic/expect.js "") ，例如上面我们使用 assert 进行判断的代码就可以写成:

```javascript
var should = require('should');

(calculator.add(1,2)).should.be.exactly(3).and.be.a.Number();
```  
**代码 7.2.5 should判断1**  
或者：  

```javascript
var should = require('should/as-function');

should(calculator.add(1,2)).be.exactly(3).and.be.a.Number();
```  
**代码 7.2.6 should判断2**  
> 画外音，上面仅仅是简单说明使用方法，完整的测试用例大家可以参见第七章源码`test/mocha/calculator_should1.js` 和 `test/mocha/calculator_should2.js`。  

**2.expect.js**  
首先给出expect.js的[github地址](https://github.com/Automattic/expect.js) ，下面是用expect重写的测试用例：  

```javascript
var expect = require('expect.js');
expect(calculator.add(1,2)).to.be(3);
```  
**代码 7.2.7 expect判断**  
**3.chai**  
[chai](http://chaijs.com/)将前面提到的assert should expect融合到了一起，你仅仅需要使用 chai 这一个包就能享用以上三者的功能，所以前面讲到的三种判断在chai中是这么实现的：  

```javascript
var chai = require('chai');

var assert = chai.assert;//use assert
assert.equal(3, calculator.add(1,2));

chai.should();//use should
(calculator.add(1,2)).should.be.equal(3).and.be.a('number');

var expect = chai.expect;//use expect
expect(calculator.add(1,2)).to.equal(3);
```  
**代码 7.2.8 使用chai判断**  
这个 chai 还真是个大杀器呢。不过注意，在 chai 中

    to
    be
    been
    is
    that
    which
    and
    has
    have
    with
    at
    of
    same
只能作为属性使用，不能作为函数使用（除非你自己写代码把这些属性覆盖掉），所以`to.be(3)`要写作`to.equal(3)`，另外 chai 中也没有`exactly` 这个函数，所以这里也是用`equal`来替代，同时在 chai 中`a`只能作为函数使用，其函数声明为`a(type)`,所以这里用了`a('number')`，其他技术细节，请移步官方API [BDD部分](http://chaijs.com/api/bdd/)。  



