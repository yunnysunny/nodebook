## 5 数据库

我们在使用 node 处理业务逻辑的时候难免要和数据打交道，这时候数据库就派上用场了。在 node 中我们最常用的数据库有两种，redis 和 mongodb。本章也正是围绕这两个数据库展开讲解。

### 5.1 redis

[redis](https://redis.io) 提供 key-value 类型的存储结构，是一种内存数据库，因此数据查询速度特别快，而且它还可以通过配置来实现将数据定期备份到磁盘上的功能，一定程度上解决进程掉线后数据恢复的问题。

node 中推荐使用 [ioredis](https://github.com/luin/ioredis) 这个驱动来对 redis 进行操作。[redis](https://github.com/NodeRedis/node_redis) 这个驱动虽然使用人数更多，但是从 redis 3.x 开始增加了 cluster 模式，但是这个驱动并不支持这种模式，所以不推荐使用。

```javascript
var Redis = require('ioredis');
/**
 * 如果不传参数默认连接127.0.0.1:6379端口
 * */
var redis = new Redis(/*{"port" : 6379,"host" : "127.0.0.1",password: 'auth'}*/);//没有密码不需要传password参数
/*
var clusterRedis = [
    {
        "host":"127.0.0.1",            
        "port":6379
    },
    {
        "host":"127.0.0.1",            
        "port":6380
    }
];
var redis =  new Redis.Cluster(clusterRedis,{redisOptions:{password: 'auth'});//集群连接方式
*/

redis.set('foo', 'bar', function(err,reply) {
  console.log(err, reply);//正常情况打印 null 'OK'
});
redis.get('foo', function (err, result) {
  console.log(err,result);//正常情况打印 null 'bar'
});
```

**代码 5.1.1 redis命令基本演示**

redis 中大多数的命令格式都是这样的 `command key param1 prama2 ...` 对应 ioredis 中的函数就是 `redis.command(key, param1, param2, ...)` 比如说 **代码5.1.1** 中的栗子，我们在 redis-cli 中执行 `set foo bar` 命令就对应我们的 `redis.set('foo', 'bar')` 这行代码。注意到我们这里在接收处理结果的时候都是使用 callback 的方式，ioredis 内部也支持 promise 方式来接收处理结构，你只需要将回调函数去掉，改成 then 函数：

```javascript
redis.set('foo','bar').then(function(reply) {
  
});
```

**代码 5.1.2 使用 promise 方式接收返回数据**

有时候我们在使用 redis 的时候，在一个处理逻辑中要连续发送多条 redis 命令，这时候你可以考虑用 ioredis 中提供的 pipeline 或者 multi 函数。

使用 pipeline 时 ioredis 内部将一系列指令缓存到内存，最后通过 exec 函数执行后打包发送到 redis 服务器，而且它支持链式的调用方式：

```javascript
redis.pipeline().set('foo', 'bar').get('foo').exec(function (err, results) {
});
```

**代码 5.1.3 pipeline 链式调用**

甚至可以在调用每个命令的时候都加一个回调函数，这里在get位置加一个回调函数：

```javascript
redis.pipeline().set('foo', 'bar').get('foo',function(err,result) {
    console.log('get foo',err,result);
}).exec(function (err, results) {
    console.log('with single callback',err, results);
});
```

**代码 5.1.4 pipeline 链式函数中加回调**

当然这里还有一种更加简洁的调用方式，就是都把参数放到数组里：

```javascript
redis.pipeline([
    ['set','foo','bar'],
    ['get','foo']
]).exec(function(err,results) {
    console.log('array params',err,results);
});
```

**代码 5.1.5 pipeline 数组参数调用方式**

multi 函数跟 pipeline 函数的区别是，multi 提供了事务的功能，提交到 redis 服务器的命令的会被依次执行，pipeline 则是批量执行一批提交一批指令，但是在 redis 内部都是独立执行的，没有先后顺序，只是最终服务器将所有处理结果一起返回给了调用者。不过要想完全保证事务的原子性，我们还需要使用 watch 函数，防止我们在事务中操作一个事务的过程中，当前操作的某一个键值又被其他连接的客户端给修改了：

```javascript
redis.watch('foo');
redis.multi().set('foo', 'bar').get('foo').exec(function (err, results) {
    redis.unwatch();
    console.log('chain',err, results);
});
```

**代码 5.1.6 multi 事务操作代码**

最后一件需要重点指明的事情是，如果你当前使用了 cluster 方式连接 redis，那么最好不要使用 pipeline 和 multi 因为，ioredis 在调用这两个函数的时候，仅仅会往一个节点发送指令，但是你又不能保证你这里面操作的所有键值都在一个节点上，所以说调用这两个函数的时候很有可能会失败。

### 5.2 mongodb

 [mongodb](https://www.mongodb.com/)官方提供了 Node.js 的 mongodb 驱动，不过鉴于其提供驱动的功能太过于简单，所以又涌现了许多基于官方驱动上开发的第三方驱动。下面要讲两个使用广泛的第三方驱动，[mongoskin](https://github.com/kissjs/node-mongoskin) 和 [mongoose](http://mongoosejs.com/) 。

#### 5.2.1 mongoskin

我们这里先讲 [mongoskin](https://github.com/kissjs/node-mongoskin)，在介绍之前先讲清楚一个概念，传统关系型数据库中，有表的概念，mongodb有collection的概念，其实是同一种东西，我在这里仍然称呼collection为`表`。    
为了演示它的用法，我们先不在 express 中使用它，而是写个简单的的测试函数。

```js
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/live", {native_parser:false});
db.bind('article');
```

**代码 5.2.1.1 初始化mongoskin**  
在代码 `5.2.1.1` 中，可以看出我们创建了一个mongo连接，服务器服务器地址为`localhost`,端口为`80`,参数 `native_parser` 代表是否使用原生代码来解析 mongodb 的 [bson](https://www.mongodb.com/json-and-bson) 数据。如果开启这个选项，需要在安装 `mongoskin` 模块的时候可以编译原生代码，如果你的开发环境是 Windows，且没有安装臃肿的Visual Studio的话，是没法编译原生代码的，那么这个参数就设置为 `false`。  
注意最后一句 `db.bind('article')` 函数[bind](https://github.com/kissjs/node-mongoskin#dbbindname-options)返回一个`Collection`对象，它在db对象上绑定一个`article`属性，指向刚才返回的对象，这句话在 mongoskin 中等同于 `db.article = db.collection('article');` （ `collection`其实为原生mongodb驱动里面获取一个`Collection`的封装函数），调用完 `bind` 函数后我们就可以通过`db.article`来操作一系列的增删改查了。  
首先是插入单条数据：  

```js
db.article.insert({
    name:'chapter5',content:'Express.js 基础',createTime:new Date('2016/07/03')
},function(err,ret) {
    console.log('单条插入',err,ret);
});
```

**代码 5.2.1.2 mongoskin插入单条数据**  
接着是插入多条数据，仅仅把第一个参数改成数组就可以了：  

```js
db.article.insert([
    {name:'chapter1',content:'Node.js 简介',createTime:new Date('2016/07/01')},
    {name:'chapter2',content:'Node.js 基础',createTime:new Date('2016/07/02')}
],function(err,ret) {
    console.log('插入数组',err,ret);
});
```

**代码 5.2.1.3 mongoskin插入多条数据**  
修改单条数据：  

```js
db.article.update({name:'chapter2'},{
    $set:{content:'Node.js 入门'}
},function(err,ret) {
    console.log('更新单条数据',err,ret);
});
```

**代码 5.2.1.4 mogonskin修改单条数据**  
**注意**第二个参数中需要有一个`$set`属性，否则整条数据将会被替换掉，如果直接将第二个参数写成了`{content:'Node.js 入门'}`，则操作完成之后，数据库里当前记录就变成了`{_id:主键值,content:'Node.js 入门'}`,之前的属性`name`和`createTime`就都丢失了。
**代码 5.2.1.5 mongoskin修改单条数据**  
如果想修改多条数据，只需要增加一个参数：

```js
db.article.update({name:'chapter2'},{
    $set:{content:'Node.js 入门'}
},{multi:true},function(err,ret) {
    console.log('更新单条数据',err,ret);
});
```

相比较代码 5.2.1.4 这里多了一个参数，`{multi:true}`告诉数据库服务器，要更新多条数据。
**代码 5.2.1.6 mongoskin修改多条数据**  
删除和更新相反，默认情况下是删除多条记录：

```js
db.article.remove({name:'chapter1'},function(err,ret) {
    console.log('删除数据',err,ret);
});
```

**代码 5.2.1.7 mongoskin删除多条记录** 
如果想删除一条记录，则增加一个参数 `{justone:true}`,即改成：  

```js
db.article.remove({name:'chapter1'},{justone:true},function(err,ret) {
    console.log('删除数据',err,ret);
});
```

**代码 5.2.1.8 mongoskin删除单条记录** 
查询一条记录：  

```js
db.article.findOne({name:'chapter2'},function(err,item) {
    console.log('查询单条数据',err,item);
});
```

**代码 5.2.1.9 mongoskin查询单体记录**  
代码 5.2.1.7 中回调函数得到`item`变量即为查询后得到的记录。  
查询多条记录：  

```js
db.article.findItems({},function(err, items) {
    console.log('查询多条数据',err,items);
});
```

**代码 5.2.1.10 mongoskin查询多条记录**
上面演练了一遍mongoskin的增删改查，不过，我们将其和传统的关系型数据库做对比，发现还少了点东西。比如说：一条记录有多个字段，我只想返回若干字段怎么弄；表中的数据过多，想分页显示怎么弄；对于需要使用事务的情形，怎么弄。  
对于前两个问题，只需要在查询的时候加参数即可。比如我们想查询7月1日都有哪些文章发布，我们只关心文章名称，同时由于数据量很大，无法全部显示出来，需要做分页，那么查询语句可以这么写：

```js
db.article.findItems({
    createTime:{$gte:new Date(2016,6,1),$lt:new Date(2016,6,2)}
},{
    fields:{name:1,createTime:1},skip:1,limit:1,sort:{createTime:-1}
},function(err, items) {
    console.log('查询多条数据',err,items);
});
```

**代码 5.2.1.11 mongoskin自定义查询选项**  
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

  ```
  {
      new:{Boolean} 是否返回更新后的内容,默认为false
      upsert: {Boolean} 不存在时是否插入,默认为false
      remove : {Boolean} 查询到结果后将其删除，此字段优先级高于 upsert,默认为false
      fields:{Object} 指定查询返回结果中要返回的字符，默认为null
  }    
  ```

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

**代码 5.2.1.12 函数findAndModify演示**  
但是要注意，`findAndModify` 会同时持有读写锁，也就是在这个函数操作过程中，其他命令是会被堵塞住，一直等待这个函数操作完成或者出错，其他命令才会有机会接着执行。所以一般情况下，不要使用这个函数，除非是非常关键的数据，要求精度很高才使用这个函数，比如说订单状态修改之类的操作，但是就像`代码 5.2.1.10`之中的操作，纯属拿大炮打蚊子了。即使非要用到这个函数的情况，也尽量保证查询的时候可以使用索引，尽量减少锁持有的时间。  
对于一些非关键性数据，但是又必须保证某个字段在写入的时候保持唯一性，那么在这个字段上增加一个唯一索引，就可以了。在mongodb的命令行中执行如下命令：

```js
db.collectionName.ensureIndex({fieldName:1},{unique:true});
```

**命令 5.2.1.1 创建唯一索引**  

> 之前已经提过，mongoskin只不过是对与原生mongodb node驱动的封装，其基于`collection`的操作函数的各个参数都是通用的，另一方面mongoskin官方给出的API文档并不详尽，所以如果要想了解详细的各个操作函数的说明，可以参考[mongodb node驱动的官方文档](http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html)。

#### 5.2.2 mongoose

前面讲了 mongskin ，算是 mongodb 知识点的开胃菜， mongoskin 中的函数绝大部分和 mongodb 命令行是类似的。下面要讲的 mongoose 却稍有不同，因为其有一个 ODM (**O**bject **D**ata **M**odel) 的概念，类似于 [hibernate](http://hibernate.org/) 开发中用到的 [ORM (**O**bject **R**elational **M**apping)](https://zh.wikipedia.org/wiki/%E5%AF%B9%E8%B1%A1%E5%85%B3%E7%B3%BB%E6%98%A0%E5%B0%84) 的概念，它提供了一种将 mongodb 中字段映射为 JavaScript 对象属性的能力。如果我们用 mongoose 来实现一系列的增删改查操作，就必须先定义一个 Schema，不过下面要先讲怎样在 mongoose 中建立连接，否则接下来的例子就没法运行了：

```javascript
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/live', {/*user:'username',pass:'password'*/}); // connect to database
```

**代码 5.2.2.1 mongoose 建立连接代码**

在 mongoose 中使用 [connect](http://mongoosejs.com/docs/connections.html) 函数可以初始化 mongodb 连接，第一个参数代表 mongodb 的连接字符串，第二个参数存放连接控制参数，比如说用户名、密码之类的。其实第一个字符串中有更多连接参数控制，可以参考 mongodb 的 [官方文档](https://docs.mongodb.com/manual/reference/connection-string/)，其中就包括用户名和密码信息（格式为` mongodb://username:password@host:port/database?options...`），但是如果你的密码中有特殊字符的话（比如说`@`），就比较难办了，所以将用户名和密码放到第二个参数中比较保险。

接下来就将mongoose中非常之重要的 Schema，首先直接构造一个我们在 5.2.1 小节中使用过的 article 的schema 声明：

```javascript
var mongoose = require('mongoose');
require('./conn');//代码5.2.2.1对应的代码

var Schema = mongoose.Schema;

var articleSchema = new Schema({
  name:  String,
  content:   String,
  comments: [{ body: String, date: Date }],
  create_at: { type: Date, default: Date.now }
});
var Article = mongoose.model('article', articleSchema);
```

**代码 5.2.2.2 声明 Schema**

通过以上代码可以总结出 shema 干的事情就是把数据库的各个字段的数据类型定义出来，最后我们还通过 model 函数获得了一个 mongoose 中的 Model 类，mongoose 的增删改查都通过这个类来进行。注意第一个参数代表表名。

```javascript
new Article({
    name:'chapter5',
    content:'Express.js 基础',
    comments : [
        {body:'写的不多',date:new Date('2016-10-11')},
        {body:'我顶',date:new Date('2017-01-01')}
    ],
    create_at:new Date('2016/07/03')
}).save(function(err,item) {
    console.log(err,item);
});
```

**代码 5.2.2.3 mongoose 插入操作**

为啥说 model 函数得到的是类呢，通过 **代码 5.2.2.3** 就可以看出，我们通过 new 生成一个对象实例，然后调用其 save 函数将其插入数据库。如果我们将 `create_at` 属性去掉，那么其值就会自动取当前时间。不过等你执行完上述代码后，查看数据库，咦，surprise，数据库里竟然多了一个名字叫 articles 的表，不是说 model 的第一个参数是执行关联的表明吗，明明在 代码 5.2.2.2 中指定的表明是 article 啊？是的，不要惊讶，mongoose 默认就是这么设计的，如果你想绑定到一个自定义的一个表明上，可以在实例化 Schema 的时候，传入一个可选参数：

```javascript
var articleSchema = new Schema({/*此处省略字段定义*/},{collection:'article'});
```

这样将 articleShema 插入model 后得到的 Article 就绑定表 article 上了。

说了插入单条，再说一下批量插入，这时候使用 [insertMany](http://mongoosejs.com/docs/api.html#model_Model.insertMany) 函数即可：

```javascript
Article.insertMany([
    {name:'chapter1',content:'Node.js 简介1',create_at:new Date('2016/07/01')},
    {name:'chapter1',content:'Node.js 简介2',create_at:new Date('2016/07/01')},
    {name:'chapter1',content:'Node.js 简介3',create_at:new Date('2016/07/01')},
    {name:'chapter2',content:'Node.js 基础4',create_at:new Date('2016/07/02')},
    {name:'chapter2',content:'Node.js 基础5',create_at:new Date('2016/07/02')}
],function(err,ret) {
    console.log('插入数组',err,ret);
});
```

**代码 5.2.2.4 mongoose 批量插入操作**

mongoose 的修改操作和官方 API 差不多：

```javascript
Article.update({name:'chapter2'},{
    $set:{content:'Node.js 入门'}
},function(err,ret) {
    console.log('更新单条数据',err,ret);
});
Article.update({name:'chapter2'},{
    $set:{content:'Node.js 入门'}
},{multi:true},function(err,ret) {
    console.log('更新多条数据',err,ret);
});
```

 **代码 5.2.2.5 mongoose 修改操作** 

不过它的删除稍微有些不同，就是删除的时候仅仅只能指定一个查询参数，如果你想仅仅删除一条的话，那就需要先查询出来，然后再删除。

```javascript
Article.findOne({name:'chapter1'}).remove().exec(function(err,ret) {
    console.log('删除数据',err,ret);
});
Article.remove({name:'chapter1'},function(err,ret) {
    console.log('删除数据',err,ret);
});
```

**代码 5.2.2.6 mongoose 删除操作**

上面总结了一下 mongoose 的一些基本用法，不过前面的描述还不足以体现 mongoose 的强大，下面讲到的一些高级用法，绝对能让你感到惊艳。

首先 mongoose 提供了中间件（ middleware ）的功能，我们可以在执行数据命令前和执行后添加钩子函数，先上代码：

```javascript
var mongoose = require('mongoose');
require('./conn');//代码6.2.2.1对应的代码

var Schema = mongoose.Schema;

var articleSchema = new Schema({
  name:  String,
  content:   String,
  comments: [{ body: String, date: Date }],
  create_at: { type: Date, default: Date.now }
});

articleSchema.pre('save',function(next) {
    this.content = this.name  + '\n' + this.content;
    next();
});

articleSchema.post('save', function(doc) {
    console.log('%s has been saved', doc._id);
});

var Article = mongoose.model('article', articleSchema);

new Article({
    name:'chapter5',
    content:'Node 中使用数据库',
    comments : [
        {body:'写的不多',date:new Date('2016-10-11')},
        {body:'我顶',date:new Date('2017-01-01')}
    ],
    create_at:'2017-02-11'
}).save(function(err,item) {
    console.log(err,item);
});
```

**代码 5.2.2.7 save 的中间件函数演示**

我们创建了一个 article 的 schema 定义，同时定义了两个中间件。通过 `pre('save')` 操作，我们在文章的第一行拼接了文章的标题，然后注意一定要调用 `next` 函数，否则当前数据库操作就不会得到执行。通过 `post('save')` 操作用来在数据库操作完成之后执行一些级联操作，这里我们简单的打印了一下日志。这两个中间件函数会先于 `save` 函数的回调函数前执行。

在调用 save 函数时，mongoose 中还提供了一个 validate 中间件，他会在 pre('save') 之前被触发，用来校验传入 save 函数的各个属性是不是合法：

```javascript
articleSchema.pre('validate',function(next) {
    if (/<script>/.test(this.content)) {
        return next(new Error('文章内容非法'));
    }
    next();
});
new Article({
    name:'chapter5',
    content:'Node 中使用数据库<script>alert(document.cookie)</script>',
}).save(function(err,item) {
    console.log(err,item);
});
```

**代码 5.2.2.8 save 的 validate 中间件函数演示**

上面的代码执行后，会抛出异常，因为我们的 article content 字段中包含 script 标签。令人欣喜的是，mongoose 还提供将 validate 中间件直接加到 schema 定义上的功能：

```javascript
var mongoose = require('mongoose');
require('./conn');//代码6.2.2.1对应的代码

var Schema = mongoose.Schema;

var articleSchema = new Schema({
    name:  {
        type:String,
        required: [true,'必须提供文章标题'],
        maxlength : [50,'文章标题不能多于50个字符']
    },
    isbn : {
        type:String,
        unique:true,
        sparse: true
    },
    content:  {
        type:String,
        validate:{
            validator : function() {
                return !(/<script>/.test(this.content));
            },
            message : '文章内容非法'
        }
    },
    starts : {
        type:Number,
        min:0,
        max:[5,'最多只能给5颗星'],
        default:0
    },
    level : {
        type:String,
        enum:['专家推荐','潜力无限','家有作家初长成','我只是个小学生']
    },
    category : {
        type:String,
        enum:{
            values:['诗歌','散文','杂文','议论文','小说'],
            message:'当前标签不支持'
        }
    },
    cover_url : {
        type:String,
        match:[/^http(s?):\/\//,'封面图格式非法']
    },
    comments: [{ body: String, date: Date }],
    create_at: { type: Date, default: Date.now }
});

articleSchema.pre('save',function(next) {
    this.content = this.name  + '\n' + this.content;
    next();
});

articleSchema.post('save', function(doc) {
    console.log('%s has been saved', doc._id);
});

var Article = mongoose.model('article', articleSchema);

new Article({
    name:'chapter5',
    content:'Node 中使用数据库<script>alert(document.cookie)</script>',
}).save(function(err,item) {
    if (err && err.name === 'ValidationError') {
        for (var field in err.errors) {
            var error = err.errors[field];
            console.error(error.message,error.path,error.value);
        }
    }
});
```

**代码 5.2.2.9 在 schema 中使用校验器**

mongoose 内建了好多校验器（validator），多余所有类型字段来说都可以使用 [required](http://mongoosejs.com/docs/api.html#schematype_SchemaType-required) 校验器，对于 Number 类型字段来说，可以使用 [min](http://mongoosejs.com/docs/api.html#schema_number_SchemaNumber-min) 和 [max](http://mongoosejs.com/docs/api.html#schema_number_SchemaNumber-max) 校验器，对于 String 类型字段来说，可以使用 [enum](http://mongoosejs.com/docs/api.html#schema_string_SchemaString-enum) [match](http://mongoosejs.com/docs/api.html#schema_string_SchemaString-match) [maxlength](http://mongoosejs.com/docs/api.html#schema_string_SchemaString-maxlength) [minlength](http://mongoosejs.com/docs/api.html#schema_string_SchemaString-minlength) 校验器。

所有校验器都可以设置在校验失败后的错误提示信息，如果相对某一个字段设置 required 约束，那么可以写成 `required:true` ，还可以进一步指定校验失败后的提示信息，也就是写成这样 `requried:[true,'这个字段必须指定']` 。但是对于 enum 来说，由于本身定义的时候就是一个数组结构（参见上面代码中 `level` 字段的定义），所以 mongoose 内部在定义其 message 属性时使用这样一个 Object 结构：`{values:[/*枚举字段定义*/],message:'出错提示信息'}` 。

还记得在**代码 5.2.2.8**中我们自定义的那个 content 字段的校验中间件不？这个中间件可以直接写到 schema 定义中，在**代码 5.2.2.9**中的 content 字段中的 validate 属性，就能替换掉之前我们写过的校验中间件。

最终你在调用 save 函数之前，这层层的字段定义约束都会被执行，如果校验出错，那么 save 回调函数返回的第一个参数中的 name 属性的值将是 `ValidationError`，让你后其 errors 属性中保存着字段的详细信息的一个 key-value数据结构，键名是出错的字段名，值是一个包含错误详情的对象，这个对象中 message 属性就是我们在 schema 中设置的出错信息， path 是出错的字段名，value 是引起出错的具体的设置的值。

最终需要注意，unique 这个约束并不是一个  ValidationError （实际上其 name 属性值为 MongoError），所以你  save 失败后得到的error 对象中没有errors 属性。unique 和 sparse 仅仅是 schema 调用 mongodb 的驱动创建了数据库索引而已。**代码 5.2.2.9** 中关于 isbn 的约束，也可以通过 schema 中的 [index](http://mongoosejs.com/docs/api.html#schema_Schema-index) 函数来实现：

```javascript
articleSchema.index('isbn',{unique:true,sparse:true});
```

**代码 5.2.2.10**

前面讲了许多 mongoose 的插入、修改之类的操作，一直没有提到查询操作，下面就来讲一下查询。

在讲查询之前，需要先将我们在代码5.2.2.9中定义的 articleSchema 进行一下扩充，增加下面这个字段：

```javascript
_author : {type:Schema.Types.ObjectId,ref:'user'},
```

**代码 5.2.2.11**

至于其中的 _ref 属性是怎么回事，我们先买个关子，一会儿再说。

mongoose 在查询方面，有好多细节做了优化，比如说在筛选返回字段的时候可以直接通过字符串来指定：

```javascript
Article.findOne({name:nameRand},'name -_id',function(err,item) {
  if (err) {
    return console.error('findOne',err);
  }
  console.log('findOne',item && item.name === nameRand);
});
```

**代码 5.2.2.12 mongoose 查询使用字符串筛选字段**

mongoose 的查询中的各个控制参数都可以链式的调用各个函数来解决，比如说上例中用到的字段筛选可以使用 [select](http://mongoosejs.com/docs/api.html#query_Query-select) 函数来替代，即改成 `Article.findOne({name:nameRand}).select('name -_id').exec(function(err,item) {});` 当中可以添加无数个链式函数来控制查询行为，比如说 [limit](http://mongoosejs.com/docs/api.html#query_Query-limit) [skip](http://mongoosejs.com/docs/api.html#query_Query-skip) [lean](http://mongoosejs.com/docs/api.html#query_Query-lean) 等等，最后以 [exec](http://mongoosejs.com/docs/api.html#query_Query-exec) 函数结尾添加回调函数。mongoose 查询默认返回的是 [MongooseDocuments](http://mongoosejs.com/docs/api.html#document-js) 类型对象，使用lean 函数后可以将其转成普通 javascript 对象：

```javascript
Article.find({name:/^name/}).select('_author').lean().exec(function(err,items) {
  if (err) {
    return console.error('find',err);
  }
  console.log('find',items);
});
```

**代码 5.2.2.13 mongoose 查询返回纯 javascript 对象**

转纯 javascript 对象的使用场景一般比较少见，当我们拿查询的结果作为参数来调用一些第三方库（比如说 [protobufjs](https://github.com/dcodeIO/protobuf.js) ）时，不调用lean的情况下会出错。

最后还要暴一下 mongoose 中的大杀器，就是联合查询，其实 mongdb 本身是没有联合查询功能的，这个功能是在 mongoose 层面延伸的功能：

```javascript
Article
  .findById(articleId)
  .select('name _author')
  .populate('_author','nickname -_id')
  .exec(function(err,item) {
  if (err) {
    return console.error('findById',err);
  }
  console.log('populate',item);
});
```

**代码 5.2.2.14 mongoose 联合查询功能**

还记得我们在**代码 5.2.2.10**中卖的关子不，我们看到其中有一个 _ref 属性，它的作用就是告诉 mongoose _author 字段的值对应 users 表中的主键字段，如果在查询的时候使用 populate 函数，则 mongoose 将在底层做两次查询（查询 articles 表 和 users 表），然后把查询结果合并。最终得到的结构演示如下：

```javascript
{ name: 'name0.6169953700982793',
  _author: { nickname: 'nick0.09724390163323227' },
  _id: 5916e9178be9f133b4798002 }
```

### 5.3 代码

本章代码参见这里：https://github.com/yunnysunny/nodebook-sample/tree/master/chapter5