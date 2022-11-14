## A4 HTTP请求参数

既然我们称 Node.js 是一门后端语言，那他就应该能处理 HTTP 请求中的请求参数，比如说我在 URL 上添加查询参数（类似于这种 `/xxx?a=1&b=2`），再比如说通过表单提交数据。 Node 确实提供了处理这两种数据的能力，只不过让人感觉到稍显“低级”。为什么这么说来，下面就一一道来。  

### A4.1 GET 请求

首先我们来简单描述一下 HTTP 请求，打开浏览器，并且打开开发者工具，然后使用谷歌搜 `node`，我们定向到开发者工具的 Network 标签页，然后开第一条网络请求，鼠标单击点开这条网络请求，会显示格式化好的HTTP 请求和响应的数据包内容：  
![谷歌搜索](./images/google_search.png)  
**图 A4.1.2 使用谷歌搜索 node**  

我们这里仅仅关注一下 `General` 部分，`Request URL` 中 `?` 后面是一大串请求参数，在我们这里是

`?newwindow=1&safe=strict&site=&source=hp&q=node&oq=node`

，由于参数太长了，我们故意省略掉一些。然后还有一个参数 `Request Method（请求方法）` 为 GET，HTTP 协议中很几种常用的请求方法：GET POST HEAD PUT DELETE，其中最常用的就是前两者。这个栗子中给出的请求方法正是 GET 请求，它将参数类似 `?key1=value&key2=value2` 方式组织在一起，拼接在请求地址的后面，发送到服务器端，服务器要解析这个请求参数，然后得到参数 key1 的值是 value1， key2 的值是 value2，继而进行逻辑处理。  
具体到上面这个栗子中，我们要在后端取到 `source` 这个参数的值，应该怎么做呢？ 可能很多之前有 php 或者 java 经验的开发者，会通过 `$_GET['source']` 或者 `request.getParamater("source")` 能够轻而易举的把这件事给办了，但是 node 不行。下面我们对**代码 3.3.1**稍加改造来实现这个目的：

```javascript
const http = require('http');
const url = require('url');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const query = url.parse(req.url,true).query;
  console.log(query);
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Hello World from ${query['source']}\n`);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

**代码 A4.1.1 get.js GET 请求参数处理**  

运行 `node get.js`，打开浏览器输入 `http://127.0.0.1:3000/?newwindow=1&safe=strict&site=&source=hp&q=node&oq=node`，会打印出 `Hello World from hp`。

注意**代码 A4.1.1** 中的 `url` 库的 [parse](https://nodejs.org/dist/latest-v6.x/docs/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost)函数，它对 URL 地址进行解析，得到 URL 中的域名、请求路径等参数，其中第二参数在这里要设置true，否则它不会解析请求参数。 

### A4.2 POST 请求

刚才我们在演示 GET 请求的使用的是谷歌搜索的栗子，它的请求参数在地址栏中都可以看到，这种方式简介明了，你甚至可以给朋友发一个网址，他就可以搜出来跟你一样的内容。但是有时候，我们还要在互联网上做一些比较隐私的事情，比如说登录某个网站，你肯定不想让你的用户名、密码出现在浏览器的地址栏中，这个时候 POST 请求就派上用场了。

我们把**代码 A4.1.1**稍微修改一番，来演示一下后端怎样读取 POST 参数：

```javascript
const http = require('http');
const url = require('url');
const qs = require('querystring');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const query = url.parse(req.url,true).query;
  let postStr = '';
  req.on('data',function(data) {                
    postStr += data;
  });
  req.on('end', function() {
    const post = qs.parse(postStr);
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Hello ${post['name']} World from ${query['source'] || 'unknown'}\n`);
  });

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

**代码 A4.2.1 post.js POST参数处理**

从**代码 A4.2.1**可以看出处理 POST 参数时竟然要需要从流中读取数据，这是由于在 HTTP 协议中 POST 数据被认为可以发送大容量的请求数据，所以为了防止堵塞，Node 强制使用流来处理这部分数据。

由于不能直接通过浏览器输入地址来测试 POST 请求，所以推荐大家使用一个 chrome app来测试 POST 请求，它就是 [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?utm_source=chrome-ntp-icon)。安装完成之后，打开主界面，下拉菜单区域选择 `POST`，然后输入地址 `http://localhost:3000`，打开 Body 标签，选择`x-www-form-urlencoded`，最后点击 Send 按钮，完成后就会输出`Hello sunny World from unknown`。

![Postman 发送 POST 请求](./images/postman_post.png)  
**图 A4.2.1 Postman 发送 POST 请求**

这里之所以需要选择`x-www-form-urlencoded`，是由于 POST 数据包有很多组织方式，我们最常用的就是这种方式，其数据格式依然是`key1=value1&key2=value2`，而 Node 自带的 [querystring.parse函数](https://nodejs.org/dist/latest-v6.x/docs/api/querystring.html#querystring_querystring_parse_str_sep_eq_options) 正是用来处理这种字符串的。同时我们可以点击 Code 按钮，来查看 POST请求发送的请求数据包：

![POST请求数据包](./images/post_package.png)  
**图 A4.2.2 POST请求数据包**

你可以留意到请求包中当中有一个空行（HTTP协议中用空行来分割请求头和请求正文），空格下面的`name=sunny&password=1234`就是我们 POST 到后台的数据。