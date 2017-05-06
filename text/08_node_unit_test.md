## 8 Node.js 单元测试


### 8.1 单元测试
对于一个程序员来说不仅要写代码，还要验证一下代码写得到底对不对，写单元测试就是一个通用且有效的解决方案。单元测试很重要，可以将错误扼杀在摇篮中，如果你认为没有写单元测试也过得很好，也许等我介绍完 [mocha](http://mochajs.org/) 之后，你会改变主意的。  
下面给出一个栗子，领导给了小明一个计算器的项目，不过这个项目周期比较长，后期需要增加更多的人手，所以对于每一个模块都要有相应的测试用例。下面是小明开工后写的第一个函数，一个加法函数：

```javascript
function add(a,b) {
    return a+b;
}
```
**代码 8.1.1 add函数**  
小明之前没有接触过单元测试，于是乎他写出的测试用例是这样的：

```javascript
var s = add(1,2);
if (s == 3) {
    console.log('恭喜你，加法测试成功了');
} else {
    console.error('哎呦，加法测试出错了啊');
}
```
**代码 8.1.2 不使用测试框架的测试用例**  
接着他又写了减法函数、乘法函数、除法函数，但是随着模块的增加，他逐渐的意识到一个问题，如果按照代码8.1.2的模式的话，一则输出格式比较乱，而且测试结果没有最终统计信息，不能一下子得出成功数和失败数。于是乎他去网上找资料，然后他就发现了大名鼎鼎的 `mocha`。  
研究了一番，小明发现 `mocha` 提供了测试结果输出格式化和测试结果统计的功能，也就是说对于上面那个加法测试用例，就可以这么写了：

```javascript
var assert = require('assert');
describe('Calculator', function() {
  describe('#add()', function() {
    it('should get 3 when 1 add 2', function() {
      assert.equal(3, add(1,2));
    });
  });
});
```
**代码 8.1.3 使用mocha改写测试用例**  
官网上说， mocha 在使用的时候，可以使用全局安装的模式，也可以安装为当前项目的开发依赖包（即在安装的时候使用`--save-dev`参数），不过小明考虑到以后各个项目都要用得到，于是决定进行全局安装（`npm install mocha -g`）。  
安装完之后，小明兴奋的新建了文件`calculator_test.js`:  

```javascript
var assert = require('assert');
var calculator = require('./calculator');

describe('Calculator', function() {
  describe('#add()', function() {
    it('should get 3 when 1 add 2', function() {
      assert.equal(3, calculator.add(1,2));
    });
  });
});
```
**代码 8.1.4 文件calculator_test.js部分代码**  
接着他运行`node calculator_test.js`，没想到结果打出他的意料，报错了：

```
e:\kuaipan\code\node\myapp\chapter7\src\test\mocha>node calculator_test.js                                                     
                                                                                                                               
e:\kuaipan\code\node\myapp\chapter7\src\test\mocha\calculator_test.js:4                                                        
describe('Calculator', function() {                                                                                            
^                                                                                                                              
ReferenceError: describe is not defined                                                                                        
    at Object.<anonymous> (e:\kuaipan\code\node\myapp\chapter7\src\test\mocha\calculator_test.js:4:1)                          
    at Module._compile (module.js:456:26)                                                                                      
    at Object.Module._extensions..js (module.js:474:10)                                                                        
    at Module.load (module.js:356:32)                                                                                          
    at Function.Module._load (module.js:312:12)                                                                                
    at Function.Module.runMain (module.js:497:10)                                                                              
    at startup (node.js:119:16)                                                                                                
    at node.js:929:3
```
**输出 8.1.1 命令node calculator_test.js的输出**  
一定是小问题，小明心里嘀咕着，然后顺手打开了google，直接搜索`ReferenceError: describe is not defined                                                                         `在第一页就发现了答案，原来要运行`mocha calculator_test.js`（还是谷歌靠谱）。运行完正确的命令后，果然看到想要的结果了：

```
e:\kuaipan\code\node\myapp\chapter7\src\test\mocha>mocha calculator_test.js                                                    
                                                                                                                               
                                                                                                                               
  Calculator                                                                                                                   
    #add()                                                                                                                     
      √ should get 3 when 1 add 2                                                                                              
                                                                                                                               
                                                                                                                               
  1 passing (7ms)
```
**输出 8.1.2 命令mocha calculator_test.js的输出**  
小明发现，这里之所以使用 node 自带的 assert 包，是由于 mocha 仅仅本身没有提供断言（Assertion）库，所以他又尝试了几种常用的断言库。  
**1.should.js**  
他使用的格式是 (something).should 或者 should(something)，更多使用方法还得参阅其[github文档](https://github.com/Automattic/expect.js "") ，例如上面我们使用 assert 进行判断的代码就可以写成:

```javascript
var should = require('should');

(calculator.add(1,2)).should.be.exactly(3).and.be.a.Number();
```
**代码 8.1.5 should判断1**  
或者：  

```javascript
var should = require('should/as-function');

should(calculator.add(1,2)).be.exactly(3).and.be.a.Number();
```
**代码 8.1.6 should判断2**  
> 画外音，上面仅仅是简单说明使用方法，完整的测试用例大家可以参见第七章源码`test/mocha/calculator_should1.js` 和 `test/mocha/calculator_should2.js`。  

**2.expect.js**  
首先给出expect.js的[github地址](https://github.com/Automattic/expect.js) ，下面是用expect重写的测试用例：  

```javascript
var expect = require('expect.js');
expect(calculator.add(1,2)).to.be(3);
```
**代码 8.1.7 expect判断**  
**3.chai**  
[chai](http://chaijs.com/)将前面提到的assert should expect融合到了一起，你仅仅需要使用 chai 这一个包就能享用以上三者的功能，所以前面讲到的三种判断在chai中是这么实现的：  

```javascript
var chai = require('chai');

var assert = chai.assert;//use assert
assert.equal(3, calculator.add(1,2));

chai.should();//use should
(calculator.add(1,2)).should.be.equal(3).and.be.a('number');

var expect = chai.expect;//use expect
expect(calculator.add(1,2)).to.equal(3);
```
**代码 8.1.8 使用chai判断**  
这个 chai 还真是个大杀器呢。不过注意，在 chai 中

    to
    be
    been
    is
    that
    which
    and
    has
    have
    with
    at
    of
    same
只能作为属性使用，不能作为函数使用（除非你自己写代码把这些属性覆盖掉），所以`to.be(3)`要写作`to.equal(3)`，另外 chai 中也没有`exactly` 这个函数，所以这里也是用`equal`来替代，同时在 chai 中`a`只能作为函数使用，其函数声明为`a(type)`,所以这里用了`a('number')`，其他技术细节，请移步官方API [BDD部分](http://chaijs.com/api/bdd/)。  

**4.supertest**  
小明将计算器的任务完成了，测试用例写的也很完备，经理对其进行了表扬。不过他同时分配了下一期的任务，公司要提供一个计算器云的业务，要将小明之前做的功能以接口的形式提供给用户调用，不过这个项目同样要给出测试用例。  
HTTP请求和本地调用从流程是有很多不一样的地方的：调用的过程中服务器可能会出现异常，返回数据有可能格式不正确，传递参数有可能出现偏差；而本地代码测试只要关心调用得到的结果是否正常就够了。不过，还好，小明找到了[supertest](https://github.com/visionmedia/supertest "") 这个mocha 断言工具。  

这里先给出小明写的一个HTTP接口：

```javascript
exports.doAdd = function(req, res) {
    var _body = req.body;
    var a = parseInt(_body.a, 10);
    if (isNaN(a)) {
        return res.send({code:1,msg:'a值非法'});
    }
    var b = parseInt(_body.b, 10);
    if (isNaN(b)) {
        return res.send({code:2,msg:'b值非法'});
    }
    res.send({code:0,data:a+b});
};
```
**代码 8.1.9 加法运算的HTTP接口**  

对应的supertest的测试用例代码就是这样的：

```javascript
var request = require('supertest');
var app = require('../../app');

describe('POST /calculator/add', function() {
  it('respond with json', function(done) {
    request(app)
      .post('/calculator/add')
      .send({a: 1,b:2})
      .expect(200, {
          code:0,data:3
      },done);
  });
});
```
**代码 8.1.10 加法运算HTTP接口的单元测试代码**  
> 此代码放置于第七章代码的目录 /src/test/http目录下，变量app其实是引用的项目根目录的app.js。  

完成了这个所谓的计算器云的项目后，小明又接到了新的任务，要做一个开发者平台，这个平台允许开发者创建基于计算云的开发者帐号和应用，然后登录进去管理自己的应用。  
为了简化我们的教程，我们姑且认为这个平台使用的登录请求是我们之前用过的`/user/login`请求，管理后台首页是`/user/admin`。我们现在来测试登录到后台这个动作。

登录过程要牵扯到我们在第6章讲过的session的知识，但是session在前端要有sessionid写入cookie中，我们的测试运行环境是命令行，不是浏览器，这就需要我们自己来维护cookie的读写操作。同时我们还需要用到 mocha 中的钩子（Hook）函数。由于我们的后台在进入之前需要先登录，所以我们要用到 mocha 中的 before 函数，它表示在所有测试用例之前执行，当然还有 beforeEach 函数，它表示在每次测试用例执行前都执行一次。显然两者的区别是前者只在所有测试用例前执行一次，而后者要在每个测试用例执行前都要重新执行。先看这个钩子函数：

```javascript
var request = require('supertest');
var app = require('../../app');
var cookie = exports.cookie = '';

before(function(done) {
    request(app)
      .post('/user/login')
      .send({username:'admin', password:'admin'})
      .expect(200,{code:0})
      .end(function(err,res) {
          if (err) {
              return done(err);
          }
          var header = res.header;
          var setCookieArray = header['set-cookie'];

          for (var i=0,len=setCookieArray.length;i<len;i++) {
              var value = setCookieArray[i];
              var result = value.match(/^express_chapter7=([a-zA-Z0-9%\.\-_]+);\s/);
              if (result && result.length > 1) {
                  exports.cookie = cookie = result[1];
                  break;
              }
          }
          if (!cookie) {
              return done(new Error('查找cookie失败'));
          }
          done();
      });
});
```
**代码 8.1.11 钩子函数**  
这里我们使用全局变量cookie来存储我们提到的 sessionid ，在 supertest 的 end 函数中，我们读取响应体变量res中的 set-cookie 头信息，通过正则把 sessionid 读取出来。注意我们这里将 `cookie` 这个变量还专门做导出了，这样子我们就可以在其他测试文件中引用这个变量了。  
接着就可以使用这个读取到的cookie来进入后台了：  

```javascript
var request = require('supertest');
var app = require('../../app');
var before = require('./login_before');

describe('Backend',function() {

    it('first test',function(done) {
        request(app)
        .get('/user/admin')
        .set('Cookie','express_chapter7=' + before.cookie)
        .expect(200,/<title>admin<\/title>/,done);
    });
});
```
**代码 8.1.12 请求中使用cookie**  
我们在模板 `user/admin.ejs` 有这么一句：`<title><%=user.account%></title>`，所以我们这里在测试时使用正则 `/<title>admin<\/title>/` 来验证是否真的进入后台了。  还有就是在读取 `cookie` 变量的时候没有直接在 require 完成之后立即读取，因为那个时候，这个变量还没有被赋值，而是在测试用例内部通过 `before.cookie` 读取。
> 注意，由于我们使用了 redis 来存储 session 数据，所以如果你忘记启动 redis 服务器的话，我们的登录操作会失败，而且在 mocha 中给出的报错提示是请求超时，这个问题比较隐蔽，大家一定要注意。

经过一番实践，小明的熟练掌握了各种测试技能，不过某天经理找打了他，“小明啊，要不你转到测试组吧”，……
> 本章配套代码：https://github.com/yunnysunny/expressdemo/tree/master/chapter8
