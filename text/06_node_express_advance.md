## 6 Express 进阶
第5章讲了Express的入门知识，这一节趁热打铁要讲一下高级技术。
## 6.1 使用 session
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
其实express默认的session是存储在内存里的，但是这种做法不适合在生产环境使用，首先node如果使用cluster模式的话，内存无法共享，也就是说只能使用单进程；其次，如果在线人数一直增多的话，会造成内存猛增。所以这里的`store`参数使用了redis。
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