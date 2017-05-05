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
var redis =  new Redis.Cluster(clusterRedis,{password: 'auth'});//集群连接方式
*/

redis.set('foo', 'bar');
redis.get('foo', function (err, result) {
  console.log(result);
});
```

**代码 5.1.1 redis命令基本演示**

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