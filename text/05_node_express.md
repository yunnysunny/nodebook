## 5 Express 介绍

在前面的node.js 基础当中介绍许多许多开设http的使用方法及介绍，以及许多基本的node.js 基本应用。

接下来要介绍一个包称为[Express](<http://expressjs.com/>)，这个包主要帮忙解决许多node.js http server所需要的基本服务，让开发http service变得更为容易，不需要像之前需要透过层层模块（module）才有办法开始编写自己的程序。

这个包是由TJ Holowaychuk制作而成的包，里面包含基本的路由处理(route)，http资料处理（GET/POST/PUT），另外还与样板包（js html template engine）搭配，同时也可以处理许多复杂化的问题。

### 5.1 Express 安装

安装方式十分简单，只要透过之前介绍的 NPM就可以使用简单的指令安装，指令如下，

```
npm install -g express
```

这边建议需要将此包安装成为全域模块，方便日后使用。

### 5.2 Express 基本操作

express 的使用也十分简单，先来建立一个基本的hello world ，

```javascript
var app = require('express').createServer(),
    port = 1337; 

app.listen(port);

app.get('/', function(req, res){
    res.send('hello world');
});

console.log('start express server\n');
```

可以从上面的程序码发现，基本操作与node.js http的建立方式没有太大差异，主要差在当我们设定路由时，可以直接透过 app.get方式设定回应与接受方式。

### 5.3 Express 路由处理

Express 对于 http服务上有许多包装，让开发者使用及设定上更为方便，例如有几个路由设定，那我们就统一藉由app.get 来处理，

```javascript
// ... Create http server

app.get('/', function(req, res){
    res.send('hello world');
});

app.get('/test', function(req, res){                                                                                                                                       
    res.send('test render');
});

app.get('/user/', function(req, res){
    res.send('user page');
});
```

如上面的程序码所表示，app.get可以带入两个参数，第一个是路径名称设定，第二个为回应函数(call back function)，回应函数里面就如同之前的 createServer 方法，里面包含request， response两个对象可供使用。用户就可以透过浏览器，输入不同的url切换到不同的页面，显示不同的结果。

路由设定上也有基本的配对方式，让用户从浏览器输入的网址可以是一个变数，只要符合型态就可以有对应的页面产出，例如，

```javascript
// ... Create http server

app.get('/user/:id', function(req, res){                                                                                                                                   
    res.send('user: ' + req.params.id);
}); 

app.get('/:number', function(req, res){
    res.send('number: ' + req.params.number);
}); 
```

里面使用到:number ，从网址输入之后就可以直接使用 req.params.number取得所输入的资料，变成url 参数使用，当然前面也是可以加上路径的设定，/user/:id，在浏览器上路径必须符合 /user/xxx，透过req.params.id就可以取到 xxx这个字符串值。

另外，express参数处理也提供了路由参数配对处理，也可以透过正规表示法作为参数设定，

```javascript
var app = require('express').createServer(),
    port = 1337; 

app.listen(port);

app.get(/^\/ip?(?:\/(\d{2,3})(?:\.(\d{2,3}))(?:\.(\d{2,3}))(?:\.(\d{2,3})))?/, 
function(req, res){                                                                                            
    res.send(req.params);
});
```

上面程序码，可以发现后面路由设定的型态是正规表示法，里面设定格式为 /ip之后，必须要加上ip型态才会符合资料格式，同时取得ip资料已经由正规表示法将资料做分群，因此可以取得ip的四个数字。

此程序执行之后，可以透过浏览器测试，输入网址为localhost:3000/ip/255.255.100.10，可以从页面获得资料，

```
[
    "255",
    "255",
    "100",
    "10"
]
```

此章节全部范例程序码如下，

```javascript
    /**
     * @overview
     *
     * @author Caesar Chi
     * @blog clonn.blogspot.com
     * @version 2012/02/26
     */
    
    // create server.
    var app = require('express').createServer(),
        port = 1337; 
    
    app.listen(port);
    
    // normal style
    app.get('/', function(req, res){
        res.send('hello world');
    });
    
    app.get('/test', function(req, res){
        res.send('test render');
    });
    
    // parameter style
    app.get('/user/:id', function(req, res){
        res.send('user: ' + req.params.id);
    });
    
    app.get('/:number', function(req, res){
        res.send('number: ' + req.params.number);
    });
    
    // REGX style
    app.get(/^\/ip?(?:\/(\d{2,3})(?:\.(\d{2,3}))(?:\.(\d{2,3})))?/, 
    function(req, res){
        res.send(req.params);
    });
    
    app.get('*', function(req, res){
        res.send('Page not found!', 404);
    });
    
    console.log('start express server\n');
```


### 5.4 Express middleware

Express 里面有一个十分好用的应用概念称为middleware，可以透过 middleware
做出复杂的效果，同时上面也有介绍 next 方法参数传递，就是靠 middleware
的概念来传递参数，让开发者可以明确的控制程序逻辑。

```javascript
// .. create http server
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session());
```

上面都是一种 middleware 的使用方式，透过 app.use方式里面载入函数执行方法，回应函数会包含叁个基本参数，response，request， next，其中next 表示下一个 middleware执行函数，同时会自动将预设叁个参数继续带往下个函数执行，底下有个实验，

```javascript
    /**
     * Module dependencies.
     */
    var express = require('express');
    var app = express.createServer();
    var port = 1337;
    
    function middleHandler(req, res, next) {
        console.log("execute middle ware");
        next();
    }
    
    app.use(function (req, res, next) {
        console.log("first middle ware");                                                                                                             
        next();
    });
    
    app.use(function (req, res, next) {
        console.log("second middle ware");                                                                                                             
        next();
    });
    
    app.get('/', middleHandler, function (req, res) {
        console.log("end middleware function");
        res.send("page render finished");
    });
    
    app.listen(port);
    console.log('start server');
````
上面的片段程序执行后，开启浏览器，连结上localhost:1337/，会发现服务器回应结果顺序如下，

    first middle ware
    second middle ware
    execute middle ware
    end middleware function

从上面的结果可以得知，刚才设定的 middleware 都生效了，在 app.use 设定的middleware 是所有url 皆会执行方法，如果有指定特定方法，就可以使用app.get 的 middleware 设定，在 app.get函数的第二个参数，就可以带入函数，或者是匿名函数，只要函数里面最后会接受request, response, next 这叁个参数，同时也有正确指定 next函数的执行时机，最后都会执行到最后一个方法，当然开发者也可以评估程序逻辑要执行到哪一个阶段，让逻辑可以更为分明。

### 5.5 Express 路由应用

在实际开发上可能会遇到需要使用参数等方式，混和变数一起使用，express里面提供了一个很棒的处理方法 app.all这个方式，可以先采用基本路由配对，再将设定为每个不同的处理方式，开发者可以透过这个方式简化自己的程序逻辑，

```javascript
    /**
     * @overview
     *
     * @author 
     * @version 2012/02/26
     */

    // create server.
    var app = require('express').createServer(),
        port = 1337, 
        users = [
            {name: 'Clonn'},
            {name: 'Chi'}
        ];

    app.listen(port);

    app.all('/user/:id/:op?', function(req, res, next){
        req.user = users[req.params.id];
        if (req.user) {
            next();
        } else {
            next(new Error('cannot find user ' + req.params.id));
        }
    });

    app.get('/user/:id', function(req, res){
        res.send('viewing ' + req.user.name);
    });

    app.get('/user/:id/edit', function(req, res){
        res.send('editing ' + req.user.name);
    });

    app.get('/user/:id/delete', function(req, res){
        res.send('deleting ' + req.user.name);
    });

    app.get('*', function(req, res){
        res.send('Page not found!', 404);
    });

    console.log('start express server\n');
```


内部宣告一组预设的用户分别给予名称设定，藉由app.all这个方法，可以先将路由雏形建立，再接下来设定 app.get的路径格式，只要符合格式就会分配进入对应的方法中，像上面的程序当中，如果用户输入路径为
/user/0 ，除了执行 app.all 程序之后，执行next 方法就会对应到路径设定为/user/:id 的这个方法当中。如果用户输入路径为 /user/0/edit ，就会执行到/user/:id/edit 的对应方法。

### 5.6 模板引擎 ###
express作为一个mvc框架，肯定不能仅仅是处理静态页，作为MVC中的V（视图），是其的有机组成部分。谈到视图，则不得不谈模板引擎，C（控制器）处理完请求后需要将处理后的数据发挥给视图层，这就没法回避从控制器中传递参数到视图层的问题，而在视图层解析这些参数正式模板引擎所要完成的任务。express中是没有内置的模板引擎的，他所使用的都是第三方的模板引擎，比如ejs、jade等。
下面通过命令行来快速生成一个express项目：
`express -e ejs myapp`
命令会在当前执行目录下创建一个myapp文件夹，进入myapp目录下，会发现我们熟悉的pagekage.json文件，很明显里面含有对于express、ejs依赖的说明，但是目录下却没有文件夹node_modules，所以需要运行`npm install`来安装所有所需的依赖。接着打开文件夹中的app.js，会发现生成的代码如下：

```javascript	
	/**
	 * Module dependencies.
	 */
	
	var express = require('express');
	var routes = require('./routes');
	var user = require('./routes/user');
	var http = require('http');
	var path = require('path');
	
	var app = express();
	
	// all environments
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	
	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}
	
	app.get('/', routes.index);
	app.get('/users', user.list);
	
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
```
**代码片段 5.5.1**    
注意这两行： 

```javascript  
	app.set('views', __dirname + '/views');   
	app.set('view engine', 'ejs');      
```
它代表使用的模板引擎为ejs，并且把所有的模板文件都放到了当前文件夹下的views目录中。然后看一下：

 ```javascript  
	app.use(express.static(path.join(__dirname, 'public')));
```
这代表将静态页放到了当前文件夹下的public目录中。最后看一下路由设置：

```javascript
	app.get('/', routes.index);
```
我们找到routes.index文件的定义（位于routes目录下index.js文件中）：

```javascript
	exports.index = function(req, res){
	  res.render('index', { title: 'Express' });
	};
```
这里面遇到了一个render函数，这个函数就是express中用于加载模板的函数。通过代码也可以大体看出，第一个参数是模板的名字，它所代表的文件位于视图文件夹views目录下的index.ejs（ejs文件后缀是ejs模板引擎的默认后缀）；而第二个参数即为传递给这个模板的参数。
接着看一下在模板中，是怎样使用刚才传递的那个titile参数的，打开views文件夹下的index.ejs：

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
	<input  type=”button” value=”启用” />
	<% } else { %>
	<input  type=”button” value=”禁用” />
	<% } %>


### 5.7  Express 中的GET和POST ###

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
**代码5.7.1 sign.ejs代码**

这里表单method是get（虽然一般情况下网服务器添加数据都是用post方式，但是这里为了演示方便，现将其写成get）。接下来看一下express中怎样在GET方式下获取表单中的数据。为了演示用户注册这个流程，我们在routes/user.js中添加两个方法：

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
**代码5.7.2 新增user.js文件中处理函数**

然后在app.js中添加相应的路由如下：

```javascript
	app.get('/users/sign', user.showSign);
	app.get('/users/do/sign', user.doSign);
```
**代码5.7.3 新增app.js中路由配置**

运行`node app.js`，即可查看效果，打开http://localhost:3000/users/sign ，可看到如下界面：

![注册显示界面](https://raw.github.com/yunnysunny/expressdemo/master/show.png)

输入数据后，点击注册，显示提示信息：

![注册成功显示界面](https://raw.github.com/yunnysunny/expressdemo/master/do.png)

这就完成了get操作，但是前面提到了类似于这种注册操作一般都是用post的，将上面的代码改成post是很简单的，只需在代码代码5.7.1 中将表单的method改成post，代码5.7.2中获取请求数据是这么写的：

```javascript
	var name = req.query.name;
	var email = req.query.email;
```
如果改成post，只需将其改为

```javascript
	var name = req.body.name;
	var email = req.body.email;
```
### 5.8  Express AJAX 应用示例 ###
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
**代码5.8.1 sign2.ejs**

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
**代码5.8.2 ajax后台处理代码**

express中res的send函数中传一个json对象，则发送给浏览器的时候会自动序列化成json字符串。

### 5.9 代码
本章用的部分代码：https://github.com/yunnysunny/expressdemo
