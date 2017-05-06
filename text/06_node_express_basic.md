## 6 Express 介绍

提到node，那么就不得不提大名鼎鼎的 [express](http://expressjs.com/)，作为一个web framework，它几乎满足了你所有的愿望 。
本篇的内容主要讲述express的基本使用。

### 6.1 Express 安装

当然作为一个web framework，必然要牵扯到各种配置。聪明人肯定不是吧所有配置代码从头到尾敲出来，
这就要提到 [express-generator](https://github.com/expressjs/generator) 。首先运行

`npm install -g express-generator`

来安装，这里用`-g`参数来将其安装为全局位置，因为这个样子我们就能将其安装后生成的可执行程序添加到环境变量中了。


接着运行`express -e first-app && cd first-app`，其中命令中`-e`参数是说使用 [ejs](https://github.com/tj/ejs)模板引擎来渲染视图。
`first-app`就是我们生成程序生成的目录，紧接着我们通过 `cd` 命令进入了这个目录。最后我们运行 `npm install` 命令来安装所需依赖。
最终在图形化界面中进入这个目录，会看到如下文件列表：  

```
--bin
----www
--public
----images
----javascripts
----stylesheets
--routes
--views
--app.js
--package.json
```  
**目录 6.1.1**  

### 6.2 Express 基本操作

express的所有配置信息在app.js中：

```javascript
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
```  
**代码 6.2.1 app.js**  
express处理网络请求，是以一种被称之为 `middlewave(也翻译为中间件)` 机制进行的，即网络请求先经过第一个middlewave，如果处理完成则直接返回，否则调用 `next()` 函数将当前请求丢给下一个middlewave进行处理。我们看到app.js中有很多 `app.use`函数的调用，正是这个函数配置了一个个的middleware。  
其中`app.use(bodyParser.json());`处理请求头为`application/json`的数据，其实这个middleware一般用不到；`app.use(bodyParser.urlencoded({ extended: false }));`这句话是处理form表单数据的，这个用处就大了。`app.use(cookieParser());`是用来处理cookie的，没有这个middleware的话，无法读取http请求中的cookie数据。`app.use(express.static(path.join(__dirname, 'public')));`是定义从 `public` 路径读取静态文件。之前讲过当前项目目录中存在`public` 文件夹，假设我们在其下 `javascripts` 目录中放置一个 `query.js` 文件，那么我们在html中就可以这么引用这个静态文件：

`<script type="text/javascript" src="/javascripts/jquery.js"></script>`

其他静态文件依次类推。

如果是做网站项目的话，还缺少对于session的支持，这个要在后面单独讲。接下来是很重要的路由映射部分，因为项目中的url映射都是
在这里配置的。我们这里只看 `routes/index.js` 文件：

```javasripts
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
```  
**代码 6.2.2 routes/index.js**  
> 在express 3.x中，定义路由需要使用到在`app.js`中定义的`app`对象，写成`app.get('/path',function(req,res){})`的样式，不过经过本人测试
在express 4.x中依然可用。如果采用express 3.x的编写方式，那么routes/index.js可以写成这样：  
> 
```javascript
module.exports = function (app) {
    app.get('/', function(req, res) {
      res.render('index', { title: 'Express' });
    });
}
```  
对应在app.js中，需要将`app.use('/',routes);`替换成`routes(app);`。两种写作手法而已，看个人喜好。

我们看到这里仅仅只有一个根路径的映射，假设我们网站上还有一个 `/about` 的路径。那么就可以在`index.js`中再追加一条：

```javascript
router.get('/about', function(req, res) {
  res.render('index', { title: 'about' });
});
```  
**代码 6.2.3**  
app.js中定义的 `app.use('/',routes);`，其实其中的`/`仅仅是定义路由的路径前缀而已，从这种意义上来讲，`routes/index.js` 和 `routes/user.js` 的代码是可以合并的。我们删除`user.js` 文件，然后在index.js中追加一段代码：  

```javascript
/* GET users listing. */
router.get('/user', function(req, res) {
  res.send('respond with a resource');
});
```  
**代码 6.2.4**  
这样我们就可以删除掉`app.use('/users', users);`了。其实如果看完上述关于路由器的介绍，熟悉express 3的用户会发现，除了语法和3.x不一样以外，功能上没啥不同。不过事实并非如此，`index.js`中的router对象还可以直接用来定义middleware，我们在 `index.js` 开头再添加一段代码：  

```javascript
// middleware specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
```  
**代码 6.2.5**  
那么上述代码定义的这个middleware就仅仅对 `index.js` 内部定义的地址起作用，对于这个路由器文件外的代码是不起作用的，这个设计就比较灵活了。之前咱们在 `app.js` 中通过 `app.use` 来定义middleware，那么理论上所有的请求都要经过这种middleware进行处理的，除非在经过这个middleware之前，已经有其他的middleware把HTTP请求处理完成了。   
最后看错误捕获这一块了，`app.js`中对于代码捕获区分了相中情况，如果当前是开发环境就在出错的时候打印堆栈，否则只显示错误名称。我们现在修改一下 `/user` 的路由代码：  

```javascript
router.get('/user', function(req, res) {
  console.log(noneExistVar.pp);
  res.send('respond with a resource');
});
```  
**代码 6.2.6**  
接着运行项目（关于如何运行项目，将在下面讲到），然后在浏览器中打开http://localhost:3000/user，浏览器直接显示错误堆栈：  

```
noneExistVar is not defined

ReferenceError: noneExistVar is not defined
    at D:\code\eapp\first-app\routes\index.js:15:14
    at Layer.handle [as handle_request] (D:\code\eapp\first-app\node_modules\express\lib\router\layer.js:95:5)
    at next (D:\code\eapp\first-app\node_modules\express\lib\router\route.js:131:13)
    at Route.dispatch (D:\code\eapp\first-app\node_modules\express\lib\router\route.js:112:3)
    at Layer.handle [as handle_request] (D:\code\eapp\first-app\node_modules\express\lib\router\layer.js:95:5)
    at D:\code\eapp\first-app\node_modules\express\lib\router\index.js:277:22
    at Function.process_params (D:\code\eapp\first-app\node_modules\express\lib\router\index.js:330:12)
    at next (D:\code\eapp\first-app\node_modules\express\lib\router\index.js:271:10)
    at Function.handle (D:\code\eapp\first-app\node_modules\express\lib\router\index.js:176:3)
    at router (D:\code\eapp\first-app\node_modules\express\lib\router\index.js:46:12)
```  
**输出 6.2.1**  
这说明，程序默认走到 `app.get('env') === 'development'` 这个条件中去了。`app.get('env')` 其实是读取的环境变量 `NODE_ENV` ,这是一个express专用的环境变量，express官方推荐在生产环境将其设置为 `production`（参考[这里](http://expressjs.com/en/advanced/best-practice-performance.html#env)）后会带来三倍的性能提升。官方推荐使用 `systemd` 或者 `Upstart`来设置环境变量，不过如果你的程序不是开机自启动的话，直接配置 `.bash_profile`文件即可，也就是说直接在该文件中添加 `export NODE_ENV=production`。

### 6.6 模板引擎 ###

在代码6.2.2中遇到了一个`render`函数，这个函数就是express中用于加载模板的函数。通过代码也可以大体看出，第一个参数是模板的名字，它所代表的文件位于视图文件夹`views`目录下的`index.ejs`（`ejs`文件后缀是`ejs`模板引擎的默认后缀）；而第二个参数即为传递给这个模板的参数。
接着看一下在模板中，是怎样使用刚才传递的那个`titile`参数的，打开`views`文件夹下的`index.ejs`：

```html
	<!DOCTYPE html>
	<html>
	  <head>
	    <title><%= title %></title>
	    <link rel='stylesheet' href='/stylesheets/style.css' />
	  </head>
	  <body>
	    <h1><%= title %></h1>
	    <p>Welcome to <%= title %></p>
	  </body>
	</html>
```  
可以看到使用<%=titile%>的方式就可以把之前render函数中传递的title参数读取出来。
扩展一下在ejs中还有两个常见的标签：
<%- %>:读取变量中的值且对于变量中的html特殊符号（比如<、>、&、”等）不进行转义，如果使用<%=%>就会把特殊符号转义，
<%%>:写在这个标签里的语句会直接当成代码来解析，比如说如下代码：  

	<% if (status == 0) { %>
	<input  type="button" value="启用" />
	<% } else { %>
	<input  type="button" value="禁用" />
	<% } %>


### 6.7  Express 中的GET和POST ###

接下来的内容来讲一下express中怎样使用get和post，首先我们在views文件夹下新建目录user,然后在user目录下新建文件sign.ejs(当然你也可以把它当成静态页，放到public中；但是正常环境下，对于html一般都是通过视图的方式来加载)。

```html
	<!DOCTYPE html>
	<html>
	<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Node.js注册演示</title>
	</head>
	<body>
	<h1>注册</h1>
	<form id="signup" method="get" action="/users/do/sign">
	<label>   帐号：</label><input type="text" name="username" />
	<label>   Email：</label><input type="text" name="email" />
	<input type="submit" value="注册" /><br>
	</form>
	</body>
	</html>
```  
**代码6.7.1 sign.ejs代码**

这里表单method是get（虽然一般情况下网服务器添加数据都是用post方式，但是这里为了演示方便，现将其写成get）。接下来看一下express中怎样在GET方式下获取表单中的数据。为了演示用户注册这个流程，我们新建`controllers`目录，在里面创建user_controller.js文件：

```javascript
	exports.showSign = function(req, res) {
		res.render('user/sign');
	}
	
	exports.doSign = function(req, res) {
		var name = req.query.name;
		var email = req.query.email;
		res.send('恭喜' + name +'注册成功，你的邮箱为:'+email);
	}
```  
**代码6.7.2 user_controller.js文件中处理函数**

> web编程中广泛使用MVC（模型Model、视图View、控制器Controller，这三个单词的缩写）的设计模式，在项目创建`controllers`正是为了符合这一模式，同时你还需要创建一个models文件夹，专门负责处理数据。具体的使用流程是这样的：`controllers`里面放置请求处理的代码，即接收请求参数，对其进行有效性校验，然后调用`models`里面的代码进行数据操作（比如说数据库的增删改查等操作），拿到处理结果后加载视图进行渲染。关于MVC的介绍，可以参见[维基百科](https://zh.wikipedia.org/wiki/MVC)。

然后添加相应的路由如下：

```javascript
	router.get('/users/sign', user.showSign);
    router.get('/users/do/sign', user.doSign);
```
**代码6.7.3 新增路由配置**

运行`npm start`，即可查看效果，打开http://localhost:3000/users/sign ，可看到如下界面：

![注册显示界面](https://raw.githubusercontent.com/yunnysunny/expressdemo/master/chapter5/show.png)

输入数据后，点击注册，显示提示信息：

![注册成功显示界面](https://raw.githubusercontent.com/yunnysunny/expressdemo/master/chapter5/do.png)

这就完成了get操作，但是前面提到了类似于这种注册操作一般都是用post的，将上面的代码改成post是很简单的，只需在代码代码6.7.1 中将表单的method改成post，代码6.7.2中获取请求数据是这么写的：

```javascript
	var name = req.query.name;
	var email = req.query.email;
```
如果改成post，只需将其改为

```javascript
	var name = req.body.name;
	var email = req.body.email;
```
### 6.8  Express AJAX 应用示例 ###
还是上面的例子，只不过这次换成用ajax来提交数据，我们在views/user文件夹下再新建文件sign2.ejs：

```html
	<!DOCTYPE html>
	<html>
	<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Node.js注册演示</title>
	<script language="javascript" src="/javascripts/jquery-1.10.2.js"></script>
	</head>
	<body>
	<h1>注册</h1>
	<form id="signup" method="post" action="/users/sign2">
	<label>帐号：</label><input type="text" name="name" /><br />
	<label>Email：</label><input type="text" name="email" /><br />
	<input type="submit" value="注册" /><br>
	</form>
	<script language="javascript">
		$(document).ready(function() {
			$('#signup').submit(function() {
				$.post($(this).attr('action'),$(this).serialize(),function(result) {
					if (result.code == 0) {
						alert('注册成功');
					} else {
						if (result.msg) {
							alert(result.msg);
						} else {
							alert('服务器异常');
						}
					}
				},'json')
				return false;
			});
		});
	</script>
	</body>
	</html>
```
**代码6.8.1 sign2.ejs**

为了使用ajax，我们引入了jquery，并将jquery-1.10.2.js放到了public/javascripts文件夹下，为了演示ajax和普通请求处理的区别，这里仅仅给出处理post请求的代码：

```javascript
	exports.doSign2 = function(req, res) {
		var name = req.body.name;
		var result = {};
		if (!name) {
			result.code = 1;
			result.msg = '账号不能为空';
			res.send(result);
			return;
		}
		var email = req.body.email;
		if (!email) {
			result.code = 2;
			result.msg = '邮箱不能为空';
			res.send(result);
			return;
		}
		res.send({code : 0});
	}
```
**代码6.8.2 ajax后台处理代码**

express中res的send函数中传一个json对象，则发送给浏览器的时候会自动序列化成json字符串。  
我们继续添加两个路由：

```javascript
router.get('/users/sign2', user.showSign2);
router.post('/users/do/sign2', user.doSign2);
```  
**代码6.8.3 ajax相关路由**  
重启项目后访问地址http://localhost:3000/users/sign2 即可进行测试。
### 6.9 代码
本章用的部分代码：https://github.com/yunnysunny/expressdemo/tree/master/chapter6
