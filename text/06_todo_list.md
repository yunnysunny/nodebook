## 6 用 Express 和 MongoDB 写一个 todo list


练习一种语言或是 framework 最快的入门方式就是写一个 todo list 了.他包含了基本的 C.R.U.D. ( 新增, 读取, 更新, 删除 ). 这篇文章将用 node.js里最通用的 framework Express 架构 application 和 MongoDB 来储存资料.



- 原文
<http://dreamerslab.com/blog/tw/write-a-todo-list-with-express-and-mongodb/>

- 功能

*无需登录, 用 cookie 来辨别每一问用户*可以新增, 读取, 更新,
删除待办事项( todo item )

- 安装

开发环境 开始之前请确定你已经安装了 node.js, Express 和 MongoDB,
如果没有可以参考下列文章. 
How to setup a node.js development environment on Mac OSX Lion &lt;http://dreamerslab.com/blog/tw/how-to-setup-a-node-js-development-environment-on-mac-osx-lion/&gt;

How to setup a node.js development environment on Ubuntu 11.04 &lt;http://dreamerslab.com/blog/tw/how-to-setup-a-node-js-development-environment-on-ubuntu-11-04/&gt;

How to setup a node.js development environment on Windows &lt;http://dreamerslab.com/blog/tw/how-to-setup-a-node-js-development-environment-on-windows/&gt;

### 6.1 node.js 套件

参考文档 :
npm basic commands<http://dreamerslab.com/blog/en/npm-basic-commands/>
- 安装 Express

    $ npm install express@2.5.11 -g

这个练习里我们用 Mongoose 这个 ORM. 为何会需要一个必须定义 schema 的 ORM
来操作一个 schema-less 的资料库呢? 原因是在一般的网站资料结构的关联,
验证都是必须处理的问题. Mongoose 在这方面可以帮你省去很多功夫.
我们会在后面才看如何安装.

- 步骤

用 Express 的 command line 工具帮我们生成一个 project 雏形 预设的
template engine 是 jade, 在这里我们改用比较平易近人的 ejs.

    $ express todo -t ejs

    create : todo
    create : todo/package.json
    create : todo/app.js
    create : todo/public
    create : todo/public/javascripts
    create : todo/public/images
    create : todo/public/stylesheets
    create : todo/public/stylesheets/style.css
    create : todo/routes
    create : todo/routes/index.js
    create : todo/views
    create : todo/views/layout.ejs
    create : todo/views/index.ejs

在专案根目录增加 .gitignore 档案

    .DS_Store
    node_modules
    *.sock

将 connect 以及 mongoose 加入 dependencies，编辑 package.json

    {
      "name"         : "todo",
      "version"      : "0.0.1",
      "private"      : true,
      "dependencies" : {
        "connect"  : "1.8.7",
        "express"  : "2.5.11",
        "ejs"      : "0.8.3",
        "mongoose" : "3.2.0"
      }
    }

### 6.2 安装 dependencies

    $ cd todo && npm install -l

Hello world 开启 express server 然后打开浏览器浏览 127.0.0.1:3000
就会看到欢迎页面.

    $ node app.js

Project 档案结构

    todo
    |-- node_modules
    |   |-- ejs
    |   |-- express
    |   `-- mongoose
    |
    |-- public
    |   |-- images
    |   |-- javascripts
    |   `-- stylesheets
    |       |-- style.css
    |
    |-- routes
    |   `-- index.js
    |
    |-- views
    |   |-- index.ejs
    |   `-- layout.ejs
    |
    |-- .gitignore
    |
    |-- app.js
    |
    `-- package.json

-   node_modules - 包含所有 project 相关套件.
-   public - 包含所有静态档案.
-   routes - 所有动作包含商业逻辑.
-   views - 包含 action views, partials 还有 layouts.
-   app.js - 包含设定, middlewares, 和 routes 的分配.
-   package.json - 相关套件的设定档.

### 6.3 MongoDB 以及 Mongoose 设定

在 Ubuntu 上 MongoDB 开机后便会自动开启. 在 Mac
上你需要手动输入下面的指令.

    $ mongod --dbpath /usr/local/db

在根目录下新增一个档案叫做 db.js 来设定 MongoDB 和定义 schema.

```javascript
var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var Todo = new Schema({
    user_id    : String,
    content    : String,
    updated_at : Date
});

mongoose.model( 'Todo', Todo );

mongoose.connect( 'mongodb://localhost/express-todo' );
```

在 app.js 里 require.

    require( './db' );

将 require routes 移动到 db config 之后.

```javascript
var express = require( 'express' );

var app = module.exports = express.createServer();

// 设定 mongoose
require( './db' );

// 设定 middleware
// 删除 methodOverride, 新增 favicon, logger 并将 static middleware 往上移
app.configure( function (){
  app.set( 'views', __dirname + '/views' );
  app.set( 'view engine', 'ejs' );
  app.use( express.favicon());
  app.use( express.static( __dirname + '/public' ));
  app.use( express.logger());
  app.use( express.bodyParser());
  app.use( app.router );
});

app.configure( 'development', function (){
  app.use( express.errorHandler({ dumpExceptions : true, showStack : true }));
});

app.configure( 'production', function (){
  app.use( express.errorHandler());
});

// Routes
var routes = require( './routes' );

app.get( '/', routes.index );

app.listen( 3000, function (){
  console.log( 'Express server listening on port %d in %s mode', app.address().port, app.settings.env );
});
```

修改 project title "routes/index.js"

```javascript
exports.index = function ( req, res ){
  res.render( 'index', { title : 'Express Todo Example' });
};
```

### 6.4 修改 index view


我们需要一个 text input 来新增待办事项. 在这里我们用 POST form
来传送资料. views/index.ejs

    <h1><%= title %></h1>
    <form action="/create" method="post" accept-charset="utf-8">
      <input type="text" name="content" />
    </form>

新增待办事项以及存档，routes/index.js，首先先 require mongoose 和 Todo
model.

```javascript
var mongoose = require( 'mongoose' );
var Todo     = mongoose.model( 'Todo' );
```

新增成功后将页面导回首页.

```javascript
exports.create = function ( req, res ){
  new Todo({
    content    : req.body.content,
    updated_at : Date.now()
  }).save( function( err, todo, count ){
    res.redirect( '/' );
  });
};
```

将这个新增的动作加到 routes 里.

app.js

```javascript
// 新增下列语法到 routes
app.post( '/create', routes.create );
```

显示待办事项 routes/index.js

```javascript
// 查询资料库来取得所有待办是事项.
exports.index = function ( req, res ){
  Todo.find( function ( err, todos, count ){
    res.render( 'index', {
        title : 'Express Todo Example',
        todos : todos
    });
  });
};
```

views/index.ejs

```javascript
// 在最下面跑循环来秀出所有待办事项.
<% todos.forEach( function( todo ){ %>
  <p><%= todo.content %></p>
<% }); %>
```

删除待办事项 在每一个待办事项的旁边加一个删除的连结. routes/index.js

```javascript
// 根据待办事项的 id 来删除他
exports.destroy = function ( req, res ){
  Todo.findById( req.params.id, function ( err, todo ){
    todo.remove( function ( err, todo ){
      res.redirect( '/' );
    });
  });
};
```

views/index.ejs

    // 在循环里加一个删除连结
    <% todos.forEach( function ( todo ){ %>
      <p>
        <span>
          <%= todo.content %>
        </code>
        <span>
          <a href="/destroy/<%= todo._id %>" title="Delete this todo item">Delete</a>
        </code>
      </p>
    <% }); %>

将这个删除的动作加到 routes 里. app.js

```javascript
//新增下列语法到routes
app.get( '/destroy/:id', routes.destroy );
```

编辑待办事项 当鼠标点击待办事项时将他转成一个 text input.

routes/index.js

```javascript
exports.edit = function ( req, res ){
  Todo.find( function ( err, todos ){
    res.render( 'edit', {
        title   : 'Express Todo Example',
        todos   : todos,
        current : req.params.id
    });
  });
};
```

Edit view 基本上和 index view 差不多,唯一的不同是在选取的那个待办事项变成 text input.

views/edit.ejs

    <h1><%= title %></h1>
    <form action="/create" method="post" accept-charset="utf-8">
      <input type="text" name="content" />
    </form>

    <% todos.forEach( function ( todo ){ %>
      <p>
        <span>
          <% if( todo._id == current ){ %>
          <form action="/update/<%= todo._id %>" method="post" accept-charset="utf-8">
            <input type="text" name="content" value="<%= todo.content %>" />
          </form>
          <% }else{ %>
            <a href="/edit/<%= todo._id %>" title="Update this todo item"><%= todo.content %></a>
          <% } %>
        </code>
        <span>
          <a href="/destroy/<%= todo._id %>" title="Delete this todo item">Delete</a>
        </code>
      </p>
    <% }); %>

将待办事项包在一个 link 里, link 可以连到 edit 动作. views/index.ejs

    <h1><%= title %></h1>
    <form action="/create" method="post" accept-charset="utf-8">
      <input type="text" name="content" />
    </form>

    <% todos.forEach( function ( todo ){ %>
      <p>
        <span>
          <a href="/edit/<%= todo._id %>" title="Update this todo item"><%= todo.content %></a>
        </code>
        <span>
          <a href="/destroy/<%= todo._id %>" title="Delete this todo item">Delete</a>
        </code>
      </p>
    <% }); %>

将这个编辑的动作加到 routes 里. app.js

    // 新增下列语法到 routes
    app.get( '/edit/:id', routes.edit );

更新待办事项 新增一个 update 动作来更新待办事项. routes/index.js

```javascript
// 结束后重新导回首页
exports.update = function ( req, res ){
  Todo.findById( req.params.id, function ( err, todo ){
    todo.content    = req.body.content;
    todo.updated_at = Date.now();
    todo.save( function ( err, todo, count ){
      res.redirect( '/' );
    });
  });
};
```

将这个更新的动作加到 routes 里. app.js

    // 新增下列语法到 routes
    app.post( '/update/:id', routes.update );

排序 现在待办事项是最早产生的排最前面, 我们要将他改为最晚产生的放最前面.

routes/index.js

```javascript
exports.index = function ( req, res ){
  Todo.
    find().
    sort( '-updated_at' ).
    exec( function ( err, todos ){
      res.render( 'index', {
          title : 'Express Todo Example',
          todos : todos
      });
    });
};

exports.edit = function ( req, res ){
  Todo.
    find().
    sort( '-updated_at' ).
    exec( function ( err, todos ){
      res.render( 'edit', {
          title   : 'Express Todo Example',
          todos   : todos,
          current : req.params.id
      });
    });
};
```

多重用户 现在所有用户看到的都是同一份资料. 意思就是说每一个人的 todo list 都长得一样, 资料都有可能被其他人修改. 我们可以用 cookie来记录用户资讯让每个人有自己的 todo list. Express 已经有内建的 cookie,只要在 app.js 新增一个 middleware 就好. 另外我们也会需要新增一个依据cookie 来抓取当下的用户的 middleware. 

app.js

```javascript
var express = require( 'express' );

var app = module.exports = express.createServer();

// 设定 mongoose
require( './db' );

// 将 routes 移到 middlewares 设定上面
var routes = require( './routes' );

// 设定 middleware
// 删除 methodOverride, 新增 favicon, logger 并将 static middleware 往上移
app.configure( function (){
  app.set( 'views', __dirname + '/views' );
  app.set( 'view engine', 'ejs' );
  app.use( express.favicon());
  app.use( express.static( __dirname + '/public' ));
  app.use( express.logger());
  app.use( express.cookieParser());
  app.use( express.bodyParser());
  app.use( routes.current_user );
  app.use( app.router );
});

app.configure( 'development', function (){
  app.use( express.errorHandler({ dumpExceptions : true, showStack : true }));
});

app.configure( 'production', function (){
  app.use( express.errorHandler());
});

// Routes
app.get( '/', routes.index );
app.post( '/create', routes.create );
app.get( '/destroy/:id', routes.destroy );
app.get( '/edit/:id', routes.edit );
app.post( '/update/:id', routes.update );

app.listen( 3000, function (){
  console.log( 'Express server listening on port %d in %s mode', app.address().port, app.settings.env );
});
```

routes/index.js

```javascript
var mongoose = require( 'mongoose' );
var Todo     = mongoose.model( 'Todo' );
var utils    = require( 'connect' ).utils;

exports.index = function ( req, res, next ){
  Todo.
    find({ user_id : req.cookies.user_id }).
    sort( '-updated_at' ).
    exec( function ( err, todos, count ){
      if( err ) return next( err );

      res.render( 'index', {
          title : 'Express Todo Example',
          todos : todos
      });
    });
};

exports.create = function ( req, res, next ){
  new Todo({
      user_id    : req.cookies.user_id,
      content    : req.body.content,
      updated_at : Date.now()
  }).save( function ( err, todo, count ){
    if( err ) return next( err );

    res.redirect( '/' );
  });
};

exports.destroy = function ( req, res, next ){
  Todo.findById( req.params.id, function ( err, todo ){
    if( todo.user_id !== req.cookies.user_id ){
      return utils.forbidden( res );
    }

    todo.remove( function ( err, todo ){
      if( err ) return next( err );

      res.redirect( '/' );
    });
  });
};

exports.edit = function( req, res, next ){
  Todo.
    find({ user_id : req.cookies.user_id }).
    sort( '-updated_at' ).
    exec( function ( err, todos ){
      if( err ) return next( err );

      res.render( 'edit', {
        title   : 'Express Todo Example',
        todos   : todos,
        current : req.params.id
      });
    });
};

exports.update = function( req, res, next ){
  Todo.findById( req.params.id, function ( err, todo ){
    if( todo.user_id !== req.cookies.user_id ){
      return utils.forbidden( res );
    }

    todo.content    = req.body.content;
    todo.updated_at = Date.now();
    todo.save( function ( err, todo, count ){
      if( err ) return next( err );

      res.redirect( '/' );
    });
  });
};

// ** 注意!! express 会将 cookie key 转成小写 **
exports.current_user = function ( req, res, next ){
  if( !req.cookies.user_id ){
    res.cookie( 'user_id', utils.uid( 32 ));
  }

  next();
};
```

### 6.5 Error handling

要处理错误我们需要新增 next 参数到每个 action 里.一旦错误发生遍将他传给下一个 middleware 去处理. 

routes/index.js

```javascript
... function ( req, res, next ){
  // ...
};

...( function( err, todo, count ){
  if( err ) return next( err );

  // ...
});
```

### 6.6 Run application


    $ node app.js

到此为止我们已经完成了大部分的功能了. 原始码里有多加了一点 css让他看起来更美观. 赶快开启你的 server 来玩玩看吧 :)
