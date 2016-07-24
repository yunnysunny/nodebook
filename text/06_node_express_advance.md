## 6 Express 进阶
第5章讲了Express的入门知识，这一节趁热打铁要讲一下高级技术。
### 6.1 使用 session
对于一个网站来说，一个不可避免的问题就是用户登录，这就牵扯到 session 问题了。为此我们需要在app.js中引入两个middleware，[cookie-parser](https://www.npmjs.com/package/cookie-parser)和[express-session](https://www.npmjs.com/package/express-session),上一章的代码5.2.1已经介绍过cookie-parser，接下来重点介绍一下`express-session`,在app.js中添加如下代码：
  
```js
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require('redis');

app.use(cookieParser());//
app.use(session({
    secret: 'GG##@$',
    cookie:{domain:'localhost'},
    key:'express_chapter6',
    resave:false,
    saveUninitialized:false,
    store: new RedisStore({
        client:redis.createClient(6379, '127.0.0.1');,
        ttl:3600*72,
        db:2,
        prefix:'session:chapter6:'
    })

}));

```
**代码 6.1.1 引入session**  
其实express默认的session是存储在内存里的，但是这种做法不适合在生产环境使用，首先node如果使用cluster模式的话，内存无法共享，也就是说只能使用单进程；其次，如果在线人数一直增多的话，会造成内存猛增。所以这里的`store`参数使用了redis，这同样也意味着你需要在你本地（或者远程机器上）启动redis服务，否则程序会报错。
session 函数的 `key` 参数代表生成cookie的名称。`resave`参数设置默认为`true`，代表每次请求结束都会重写`store`中的数据，不管当前的session有没有被修改。`saveUninitialized`参数值默认为`true`，代表将未赋值过的session写入到store，也就是说假设我们的网站需要登录，那么在未登陆之前，也会往`store`写入数据。所以我们将`resave`和`saveUninitialized`都设置为了false。
> 如果你对 session 和 cookie 原理不是很清楚的话，可以参见我的两篇博文。  

为了减少篇幅，给出的代码都是片段形式：
```html
<form method="post" action="/user/login" id="loginForm">
    <p><input name="username" /><label for="username">用户名</label><p/>
    <p><input name="password" type="password" /><label for="password">密码</label><p/>
    <p><input type="submit" value="登陆" /><p/>
</form>
<script src="//upcdn.b0.upaiyun.com/libs/jquery/jquery-1.10.2.min.js" type="text/javascript"></script>
<script type="text/javascript">
    $(document).ready(function() {
        $('#loginForm').submit(function() {
            var $this = $(this);
            $.ajax({
                method:$this.attr('method'),
                url:$this.attr('action'),
                data:$this.serialize(),
                dataType:'json'
            }).done(function(result) {
                if (result.code == 0) {
                    return location.href = '/user/admin';
                }
                alert(result.msg || '服务器异常');
            }).fail(function() {
                alert('网络异常');
            });
            return false;
        });
    });
</script>
```
**代码6.1.2 登陆前端代码**  
```js
exports.login = function(req, res) {
    var _body = req.body;
    var username = _body.username;
    var password = _body.password;
    if (username === 'admin' && password === 'admin') {
        req.session.user = {account:username};
        return res.send({code:0});
    }
    res.send({code:1,msg:'用户名或者密码错误'});
}
```
**代码6.1.3 登陆后端代码**  
在`代码6.1.3`中通过`req.session.user`来给session增加一个user的属性，在`代码6.1.2`中登陆成功后要跳转到`/user/admin`地址上去，我们接下来看这个地址映射的后端代码：
```js
exports.admin = function(req, res) {
    var user = req.session.user;
    res.render('user/admin',{user:user});
}
```
**代码 6.1.4 读取session**  
通过`req.session.user`，就可以方便的将之前存储的`user`属性给读取出来。

### 6.2 使用mongodb
web开发离不开数据库，那么和 Node.js 最搭配的数据是啥呢？当然是 [mongodb](https://www.mongodb.com/)。我们这里只要讲 [mongoskin](https://github.com/kissjs/node-mongoskin)，一个在原生node mongodb驱动基础上做封装的模块的使用。  
在介绍之前先讲清楚一个概念，传统关系型数据库中，有表的概念，mongodb有collection的概念，其实是同一种东西，我在这里仍然称呼collection为`表`。    
为了演示它的用法，我们先不在 express 中使用它，而是写个简单的的测试函数。
```js
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/live", {native_parser:false});
db.bind('article');
```
**代码 6.2.1 初始化mongoskin**  
在代码 `6.2.1` 中，可以看出我们创建了一个mongo连接，服务器服务器地址为`localhost`,端口为`80`,参数 `native_parser` 代表是否使用原生代码来解析 mongodb 的 [bson](https://www.mongodb.com/json-and-bson) 数据。如果开启这个选项，需要在安装 `mongoskin` 模块的时候可以编译原生代码，如果你的开发环境是 Windows，且没有安装臃肿的Visual Studio的话，是没法编译原生代码的，那么这个参数就设置为 `false`。  
注意最后一句 `db.bind('article')` 函数[bind](https://github.com/kissjs/node-mongoskin#dbbindname-options)返回一个`Collection`对象，它在db对象上绑定一个`article`属性，指向刚才返回的对象，所以这句话等同于 `db.article = db.collection('article');` （ `collection`其实为原生mongodb驱动里面获取一个`Collection`的封装函数），下面我们就可以通过`db.article`来操作一系列的增删改查了。  
首先是插入单条数据：  
```js
db.article.insert({
    name:'chapter5',content:'Express.js 基础',createTime:new Date('2016/07/03')
},function(err,ret) {
    console.log('单条插入',err,ret);
});
```
**代码 6.2.2 mongoskin插入单条数据**  
接着是插入多条数据，仅仅把第一个参数改成数组就可以了：  
```js
db.article.insert([
    {name:'chapter1',content:'Node.js 简介',createTime:new Date('2016/07/01')},
    {name:'chapter2',content:'Node.js 基础',createTime:new Date('2016/07/02')}
],function(err,ret) {
    console.log('插入数组',err,ret);
});
```
**代码 6.2.3 mongoskin插入多条数据**  
修改单条数据：  
```js
db.article.update({name:'chapter2'},{
    $set:{content:'Node.js 入门'}
},function(err,ret) {
    console.log('更新单条数据',err,ret);
});
```
**代码 6.2.4 mogonskin修改单条数据**  
**注意**第二个参数中需要有一个`$set`属性，否则整条数据将会被替换掉，如果直接将第二个参数
写成了`{content:'Node.js 入门'}`，则操作完成之后，数据库里当前记录就变成了`{_id:主键值,content:'Node.js 入门'}`,
之前的属性`name`和`createTime`就都丢失了。
**代码 6.2.5 mongoskin修改单条数据**  
如果想修改多条数据，只需要增加一个参数：
db.article.update({name:'chapter2'},{
    $set:{content:'Node.js 入门'}
},{multi:true},function(err,ret) {
    console.log('更新单条数据',err,ret);
});
```
相比较代码 6.2.4 这里多了一个参数，`{multi:true}`告诉数据库服务器，要更新多条数据。
**代码 6.2.6 mongoskin修改多条数据**  
删除和更新相反，默认情况下是删除多条记录：
```js
db.article.remove({name:'chapter1'},function(err,ret) {
    console.log('删除数据',err,ret);
});
```
**代码 6.2.7 mongoskin删除多条记录** 
如果想删除一条记录，则增加一个参数 `{justone:true}`,即改成：  
```js
db.article.remove({name:'chapter1'},{justone:true},function(err,ret) {
    console.log('删除数据',err,ret);
});
```
**代码 6.2.8 mongoskin删除单条记录** 
查询一条记录：  
```js
db.article.findOne({name:'chapter2'},function(err,item) {
    console.log('查询单条数据',err,item);
});
```
**代码 6.2.9 mongoskin查询单体记录**  
代码 6.2.7 中回调函数得到`item`变量即为查询后得到的记录。  
查询多条记录：  
```js
db.article.findItems({},function(err, items) {
    console.log('查询多条数据',err,items);
});
```
**代码 6.2.10 mongoskin查询多条记录**
上面演练了一遍mongoskin的增删改查，不过，我们将其和传统的关系型数据库做对比，发现还少了点东西。比如说：一条记录有多个字段，
我只想返回若干字段怎么弄；表中的数据过多，想分页显示怎么弄；对于需要使用事务的情形，怎么弄。  
对于前两个问题，只需要在查询的时候加参数即可。比如我们想查询7月1日都有哪些文章发布，我们只关心文章名称，同时由于数据量很大，
无法全部显示出来，需要做分页，那么查询语句可以这么写：
```js
db.article.findItems({
    createTime:{$gte:new Date(2016,6,1),$lt:new Date(2016,6,2)}
},{
    fields:{name:1,createTime:1},skip:1,limit:1,sort:{createTime:-1}
},function(err, items) {
    console.log('查询多条数据',err,items);
});
```
**代码 6.2.11 mongoskin自定义查询选项**  
在这里我们通过`fields`来控制返回字段名，`skip:1`代表跳过第一条记录，`limit:1`代表从跳过的记录后面取1条记录，同时我们还增加了
`sort`属性，按照`createTime`字段的倒序排列。  
对于最后一个问题，很遗憾，mongodb中确实没有事务，不过它还是提供了一个带有锁功能的操作函数，就是 `findAndModify`。这个函数的参数比较多，
下面直接给出参数列表：

**函数声明**    

findAndModify(query, sort, update , options , callback)    

**参数声明**    

- query{Object}查询条件    
- sort{Array}排序    
- update{Object}更新的内容    
- option

        {
            new:{Boolean} 是否返回更新后的内容,默认为false
            upsert: {Boolean} 不存在时是否插入,默认为false
            remove : {Boolean} 查询到结果后将其删除，此字段优先级高于 upsert,默认为false
            fields:{Object} 指定查询返回结果中要返回的字符，默认为null
        }    
- callback{Function} 此回调函数有两个参数：

    - error {Error} 错误对象，成功时为null
    - result {Object}
        ```js
        {
            value : {Object} 函数findAndModify返回的数据记录
            lastErrorObject : { updatedExisting: true, n: 1, connectionId: 14, err: null, ok: 1 } 大体格式是这样的
            ok ： {Number} 成功返回1
                                
        }
        ```

举个例子，现在有一张表comment，它的数据结构是这样的：
```json
{
    "_id" : ObjectId("5792f2db03d07723cff9ab35"),
    "author" : "1vglr42hwqb",
    "content" : "twicgcbk7xd",
    "articleId" : ObjectId("5792288c0c0c422b282f2f93"),
    "createTime" : 1468304429853.0000000000000000
}
```
现在我们将使用函数`findAndModify`查询文章ID为`ObjectId("5792288c0c0c422b282f2f93")`最近的一条评论，将其`content`字段改成`评论已被删除`:
```js
db.comment.findAndModify({
    articleId:mongo.helper.toObjectID("5792288c0c0c422b282f2f93")
},{'createTime':-1},{$set:{content:'评论已被删除'}},{
    fields:{author:1,content:1},new:true,upsert:false,remove:false
},function(err, result) {
    console.log('修改后数据',err,result);
});
```
**代码 6.2.12 函数findAndModify演示**  
但是要注意，`findAndModify` 会同时持有读写锁，也就是在这个函数操作过程中，其他命令是会被堵塞住，一直等待这个函数操作完成或者出错，其他命令才会有机会接着执行。所以一般情况下，不要使用这个函数，除非是非常关键的数据，要求精度很高才使用这个函数，比如说订单状态修改之类的操作，但是就像`代码 6.2.10`之中的操作，纯属拿大炮打蚊子了。即使非要用到这个函数的情况，也尽量保证查询的时候可以使用索引，尽量减少锁持有的时间。  
对于一些非关键性数据，但是又必须保证某个字段在写入的时候保持唯一性，那么在这个字段上增加一个唯一索引，就可以了。在mongodb的命令行中执行如下命令：
```js
db.collectionName.ensureIndex({fieldName:1},{unique:true});
```
**命令 6.2.1 创建唯一索引**  
> 之前已经提过，mongoskin只不过是对与原生mongodb node驱动的封装，其基于`collection`的操作函数的各个参数都是通用的，另一方面mongoskin官方给出的API文档并不详尽，所以如果要想了解详细的各个操作函数的说明，可以参考[mongodb node驱动的官方文档](http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html)。

### 6.3 改善我们的登陆
在6.2中，我们已经讲述了怎样使用mongodb了，下面就有机会对于我们6.1中提到的登陆进行改进了。虽然登陆在前端页面登陆仅仅是一个表单，但是在后台处理的流程就不是那么简单。这次我们决定读取数据库中的账号信息进行登陆验证，为此我们创建文件夹`models`，在其内新建文件`user_model.js`：
```js
var crypto = require('crypto');
var collection = require('./index');
var users = collection.users;

var passwordValid = exports.passwordValid = function(passwordInput,passwordDb) {
    return crypto.createHash('sha256').update(passwordInput).digest('base64') === passwordDb;
}

exports.loginCheck = function(username,password,callback) {
    users.findOne({account:username},function(err,item) {
        if (err) {
            console.error('查询用户时失败',err);
            return callback('查询用户时失败');
        }
        if (!item) {
            return callback('当前用户不存在');
        }
        if (!passwordValid(password,item.passwd)) {
            return callback('用户名或者密码错误');
        }
        item.passwd = undefined;
        callback(false,item);
    });
};
```
**代码 6.3.1 登陆验证逻辑**  
> 其实单纯用md5/sha1/sha256这些算法来说，都存在被破解的可能性，国内有网站http://cmd5.com 几乎可以破解一切弱密码，解决方案就是使用更长的密码（可以通过用户名和密码进行拼接来计算哈希值），或者使用hmac算法。这里为了演示，使用了最简单的方式。  

那么现在控制器中的代码就可以这么写：  
```js
exports.loginWithDb = function(req, res) {
    var _body = req.body;
    var username = _body.username;
    var password = _body.password;
    if (!username) {
        return res.send({code:1,msg:'用户名不能为空'});
    }
    userModel.loginCheck(username,password,function(err,item) {
        if (err) {
            return res.send({code:1,msg:err});
        }
        req.session.user = item;
        res.send({code:0});
    });
};
```
**代码 6.3.2 登陆验证控制器代码**  
我们在路由器中增加一个链接 `/user/login-with-db` 指向代码 6.3.2 中的控制器函数，修改代码6.1.2中的表单提交地址即可。
### 6.4 使用拦截器
之前的章节中介绍过express的middleware，翻译一下就是中间件，下面的内容其实是做一个中间件，但是为啥我给它起名叫拦截器呢，因为我认为对于业务逻辑处理叫拦截器更贴切，因为我理解的middleware仅仅负责解析http数据，不处理业务逻辑。仅仅是个人见解。  
之前我们已经做了登陆操作，但是对于一个网站的若干地址（比如说后台地址），不登录是没法用的，我们需要用户在加载这些地址的时候，如果检测到当前处于未登录状态，就统一跳转到登陆页。在每一个控制器中都做一遍登陆状态判断来决定是否跳转，显然是一个笨拙的方法。但是如果使用了拦截器，一切问题就显得简单了。  
我们新建文件夹`filters`，然后在其内新建文件`auth_filter.js`:
```js
const ERROR_NO_LOGIN = 0xffff0000;
module.exports = function(req, res, next) {
    var path = req.path;
    if (path === '/' || path === '/user/login') {//这些路径不需要做登陆验证
        return next();
    }
    if (req.session && req.session.user) {//已经登陆了
        return next();
    }
    //以下为没有登陆的处理逻辑
    if (req.xhr) {//当前请求为ajax请求
        return res.send({code:ERROR_NO_LOGIN,msg:'尚未登陆'});
    }
    res.redirect('/');//普通请求
};
```
**代码 6.4.1 授权拦截器逻辑**  
同时我们在`app.js`中引入这段代码： 
```js
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require('redis');

var routes = require('./routes/index');
var authFilter = require('./filters/auth_filter');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'GG##@$',
    cookie:{domain:'localhost'},
    key:'express_chapter6',
    resave:false,
    saveUninitialized:false,
    store: new RedisStore({
        client:redis.createClient(6379, '127.0.0.1'),
        ttl:3600*72,
        db:2,
        prefix:'session:chapter6:'
    })

}));
app.use(authFilter);
app.use('/', routes);
```
**代码 6.4.2 引入授权拦截器**  
将其放到session中间件的后面是由于，我们在这个拦截器中需要读取`req.session`变量，如果放到session中间件前面，则这个变量不存在。  
现在我们在未登录的情况下访问http://localhost:3000/user/admin ，则会直接跳转到登陆页。  
本章节代码可以从这里获取：https://github.com/yunnysunny/expressdemo/tree/master/chapter6 。