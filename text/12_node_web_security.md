## 12 Web 安全

在使用任何后端语言开发 Web 应用的时候，都会遇到安全漏洞问题，比如说 XSS （Cross-site scripting，跨站脚本攻击，在网站中植入恶意代码，用户加载网页就会被触发）和 CSRF（Cross-site request forgery，跨站请求伪造，在任意网站上可以伪造请求发送到被攻击网站上）。对于 XSS 来说，现行的模板引擎（ejs、jade之类）已经做的比较好了，可以防御住常见的恶意代码注入。不过对于 CSRF 来说，就得需要借助于第三方类库了。

### 12.1 CSRF

首先看一个 CSRF 的栗子：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>美女私聊</title>
  </head>
  <body>
    <iframe name="frameNoSeen" style="display:none;"></iframe>
    <h1>美女私聊</h1>
    <form action="http://localhost:8100/article/add" target="frameNoSeen" method="post" id="js-article-add">
        <label >标题：<input name="title"/></label><br />
        <label >你想对美女说的话：<textarea rows="20" cols="50" name="content"></textarea></label><br />
        <button id="fakeButton">告诉美女</button>
    </form>
    <script src="https://upcdn.b0.upaiyun.com/libs/jquery/jquery-1.10.2.min.js" type="text/javascript"></script>
    <script>
        $(document).ready(function() {
            $('#fakeButton').click(function() {
                alert('美女已经收到你的信息');
            });
        });
    </script>
  </body>
</html>
```

**代码 12.1.1 CSRF 攻击栗子**

将**代码 12.1.1**直接保存为一个 html，用 chrome 打开即可测试。

> 注意在代码中 form 表单的提交地址为 `http://localhost:8100/article/add`，相关代码参见 项目 [nodebook-sample](https://github.com/yunnysunny/nodebook-sample/tree/master/chapter12)，启动项目后，需要首先访问http://localhost:8100，输入用户名和密码（预制用户名密码为admin admin），点击登录。保证用户处于登录状态。 

同时留意到代码中有一个 iframe 标签，而且是被隐藏的，由于我们使用表单来提交数据，但是正常情况下表单提交完成后网页会跳转，所以为了不露馅，我们将表单跳转后的网页导向到这个 iframe 中。

点击 `告诉美女` 按钮，然后在开发者工具中查看 iframe 的 html 内容，会发现里面显示 403，这是由于我们使用了  `csurf` 这个包来防御扩展攻击。我们来看看关键代码：

```javascript
var csurf = require('csurf')();

module.exports = function(app) {
    app.use(function (req, res, next) {
        csurf(req, res, next);
    });
    app.use(function (req, res, next) {
        res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
        next();
    });
};
```

**代码 12.1.2 文件 csrf_filter.js**

文件 `csrf_filter.js` 会在 `app.js` 中被引用。包 `csurf` 默认会自动对 POST PUT DELETE 等数据修改操作做校验，对于 GET HEAD OPTION 等请求会直接跳过。我们在**代码 12.1.2**中，对于每次请求都生成一个 token 字符串，置于 res.locals 变量中，这样我们就能在模板中引用 `locals.csrf`，我们在 文件 `views/article/add_article.ejs` 中的 head 标签中加入这么一句：

```html
<meta content="<%= locals.csrf || '' %>" name="csrf-token">
```

**代码 12.1.3**

同时，我们在 jquery 中做一个 ajax 全局配置：

```javascript
$(document).ready(function () {
    var token = $('meta[name="csrf-token"]').attr('content');
    if (token) {
        $.ajaxSetup({
            headers : {'X-CSRF-Token' : token}
        });
    }
});
```

**代码 12.1.4**

这样每次 ajax 请求的头部中都会带有 X-CSRF-Token 这个头信息，后端代码中包 `csurf` 会读取这个头信息，取出 token 内容做校验。

如果想做一个对比测试的话，将代码 app.js 中的第49行 `csrfFilter(app);` 注释掉，我们点击 `告诉美女` 之后就会在数据库中插入一条记录。
