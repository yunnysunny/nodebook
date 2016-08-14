## 7 Node.js 最佳实践

### 7.1 配置文件
一般代码的运行的环境起码应该包括本地开发环境和线上运行环境，那么问题来了，你开发环境用的配置信息可是跟线上环境不一样的。那么已经存储这个配置信息呢？在代码中写死肯定是最low的方式。更通用的方式是使用配置文件，可是你一旦将这个配置文件就面临一个问题，你这个配置文件一旦提交到了 git 之后，你的同事 pull 代码之后，就有可能就他本地配置文件覆盖掉，而这个配置文件中又包含了本地文件路径有关的配置，但是你和你的同事用的还不是一个操作系统（一个 windows，一个 mac），想想这个场景就恶心。那如果我们不将这个配置文件提交 git 呢？每次新增配置文件选项，都需要口头通知你的同事们，又比如有新同事加入到这个项目来了，你只能把你电脑上存储的配置文件发他一份，让他做相应的修改再使用，想想这个场景就恶心。  
其实解决这个问题的办法也很简单，就是在 git 上放置一个配置文件的示例文件，我们就假设它为 `config.example.json` ，里面写入所有的示例配置项。然后在 `.gitignore` 中将 `config.json` 添加进去，最后你在代码中加载 `config.json` 这个配置文件，这样子的话大家都可以使用自己的配置文件，不会相互干扰，同时在 git 还存留了一份示例文件，配置项的更改都可以呈现到这个示例文件上。貌似是个完美的解决方案，其实这种解决方案不仅适用用 node ，任何语言都适用。  
但，这并不是问题的终点，我们是给出了一个配置示例文件 `config.example.json`，但是如果配置项有修改，你的同事不修改 `config.example.json` 怎么办？那就把错误扼杀在摇篮中吧，在我们的项目中会引入一个 `setting.js` 的文件来负责做配置项校验，在应用加载时，如果检测到某个参数不存在或者非法，就直接退出当前进程，让你启动不起来：  

```js
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
**代码 7.1**  
### 自动重启
### 单元测试