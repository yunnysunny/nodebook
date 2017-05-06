## 7 Express 进阶
第5章讲了Express的入门知识，这一节趁热打铁要讲一下高级技术。
### 7.1 使用 session
对于一个网站来说，一个不可避免的问题就是用户登录，这就牵扯到 session 问题了。为此我们需要在app.js中引入两个middleware，[cookie-parser](https://www.npmjs.com/package/cookie-parser)和[express-session](https://www.npmjs.com/package/express-session),上一章的代码6.2.1已经介绍过cookie-parser，接下来重点介绍一下`express-session`,在app.js中添加如下代码：

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
**代码 7.1.1 引入session**  
其实express默认的session是存储在内存里的，但是这种做法不适合在生产环境使用，首先node如果使用cluster模式的话，内存无法共享，也就是说只能使用单进程；其次，如果在线人数一直增多的话，会造成内存猛增。所以这里的`store`参数使用了redis，这同样也意味着你需要在你本地（或者远程机器上）启动redis服务，否则程序会报错。
session 函数的 `key` 参数代表生成cookie的名称。`resave`参数设置默认为`true`，代表每次请求结束都会重写`store`中的数据，不管当前的session有没有被修改。`saveUninitialized`参数值默认为`true`，代表将未赋值过的session写入到store，也就是说假设我们的网站需要登录，那么在未登陆之前，也会往`store`写入数据。所以我们将`resave`和`saveUninitialized`都设置为了false。
> 如果你对 session 原理不是很清楚的话，可以参见我的博文 [session的安全性](http://blog.whyun.com/posts/session/)，里面提到了session的基本原理，安全性及攻击防范。  

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
**代码7.1.2 登陆前端代码**  

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
**代码7.1.3 登陆后端代码**  
在`代码7.1.3`中通过`req.session.user`来给session增加一个user的属性，在`代码7.1.2`中登陆成功后要跳转到`/user/admin`地址上去，我们接下来看这个地址映射的后端代码：

```js
exports.admin = function(req, res) {
    var user = req.session.user;
    res.render('user/admin',{user:user});
}
```
**代码 7.1.4 读取session**  
通过`req.session.user`，就可以方便的将之前存储的`user`属性给读取出来。




### 7.3 改善我们的登陆
在7.2中，我们已经讲述了怎样使用mongodb了，下面就有机会对于我们7.1中提到的登陆进行改进了。虽然登陆在前端页面登陆仅仅是一个表单，但是在后台处理的流程就不是那么简单。这次我们决定读取数据库中的账号信息进行登陆验证，为此我们创建文件夹`models`，在其内新建文件`user_model.js`：

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
**代码 7.3.1 登陆验证逻辑**  
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
**代码 7.3.2 登陆验证控制器代码**  
我们在路由器中增加一个链接 `/user/login-with-db` 指向代码 7.3.2 中的控制器函数，修改代码7.1.2中的表单提交地址即可。
### 7.4 使用拦截器
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
**代码 7.4.1 授权拦截器逻辑**  
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
**代码 7.4.2 引入授权拦截器**  
将其放到session中间件的后面是由于，我们在这个拦截器中需要读取`req.session`变量，如果放到session中间件前面，则这个变量不存在。  
现在我们在未登录的情况下访问http://localhost:3000/user/admin ，则会直接跳转到登陆页。  
本章节代码可以从这里获取：https://github.com/yunnysunny/expressdemo/tree/master/chapter7 。