## 4 NPM 包管理工具

在Node出现之前，我们在做前端的时候经常用到一些开发工具使用ruby和python开发的（比如说[sass](http://sass-lang.com/)，一种CSS预编译语言，依赖于ruby；(Pygments)[http://pygments.org/] ，一种代码语法高亮插件，依赖于python），这个时候就会看到[gem](https://rubygems.org/)和[pip](https://pypi.python.org/pypi)的身影。熟悉java的同学，应该也对[maven](https://maven.apache.org/)如数家珍。和这些语言类似，Node 也提供了包管理工具，它就是 npm ，全名为 **N**ode **P**ackage **M**anager，集成于 Node 的安装程序中。

### 4.1 使用NPM
npm 不仅可用于安装新的包，它也支持搜寻、列出已安装模块及更新的功能。


npm 目前拥有数以百万计的包，可以在 https://www.npmjs.com/ 使用关键字搜寻包。举例来说，在关键字栏位输入“coffee-script”，下方的清单就会自动列出包含 coffee-script 关键字的包。

![image](https://raw.githubusercontent.com/yunnysunny/nodebook/master/images/zh-tw/node_npm_registry.png)

虽然也可以通过`npm search`来在命令行中查询，但是初次查询过程中要在本地建立索引，等待的时间巨漫长，还是不介绍的为好。

找到需要的包后，即可使用以下指令安装：

    npm install coffee-script
运行完之后，就会在当前目录下的 `node_modules`目录下安装coffee-script包。
```

  ├─┬ node_modules 
  │ └── coffee-script 
```
**目录结构 4.1.1 将包安装到本地后的目录结构**  
一般情况下，我们在node项目目录下创建package.json，里面包含项目名称、作者、依赖包等配置，我们可以通过 `npm init`快速创建一个package.json文件，我们新建一个目录，然后在命令执行`npm init`，则会要求你填入若干信息：
```
name: (app) test                                           
version: (1.0.0) 0.0.1                                     
description: test app                                      
entry point: (index.js)                                    
test command:                                              
git repository:                                            
keywords:                                                  
author: yunnysunny                                         
license: (ISC) MIT                                         
About to write to I:\node\app\package.json:                
                                                           
{                                                          
  "name": "test",                                          
  "version": "0.0.1",                                      
  "description": "test app",                               
  "main": "index.js",                                      
  "scripts": {                                             
    "test": "echo \"Error: no test specified\" && exit 1"  
  },                                                       
  "author": "yunnysunny",                                  
  "license": "MIT"                                         
}                                                          
                                                           
                                                           
Is this ok? (yes)                                       
```
**命令输入 4.1.1 npm init命令输入示例**  
我们接着在项目中安装express包（在第5章会讲到这个包的使用），不过我们执行命令的时候加个参数：`npm install express --save`。命令执行完成之后，再看package.json，发现多了一个配置属性：
```json
"dependencies": {
    "express": "^4.14.0"
}
```
这个dependencies属性里面描述的就是当前项目依赖的各种包，你可以通过运行`npm install packageName --save`来将其安装到本地的同时在package.json中同时添加依赖声明。当你代码开发完成时，要把项目往服务器上部署，那么这时候package.json中的依赖声明都已经写好了，这时候，你直接在项目目录运行`npm install`，就可以自动将声明中的文件全部下载安装到项目目录的`node_modules`子目录下。  
我们在来稍微留意一下，我们配置的这个express的版本号，咦，`^`是个什么鬼？讲这个东东，还要从[Semantic Versioning](http://semver.org/)这个概念讲起，它将版本号分为三段：  

1. 主版本，你可以在这个版本中做不兼容性改动
2. 小版本，你可以在这个版本上增加共嗯那个，不过要向后兼容
3. 补丁版本，在这里可以做一些bug修复，不过依然要保持向后兼容

在这里对于express来说，主版本号是`4`，小版本号是`14`，补丁版本号是`0`。啰嗦了这么多，那么`^`呢，它告诉你使用从`4.14.0`到`5.0.0`（不包括5.0.0）之间的最新版本，也就是说它选择的版本号x的取值范围:`4.14.0<=x<5.0.0`。  
除了`^`，还有一个版本号标识符`~`也很常用，假设我们将这里express的版本号设置为`~4.14.0`，那么它表示从`4.14.0`到`4.15.0`（不包括4.15.0）之间的最新版本，也就是说它选择的版本号x的取值范围：`4.14.0<=x<4.15.0`。  
另外还有一些版本号的特殊标志符，由于不常用，有需要的可以参考https://docs.npmjs.com/misc/semver 。
一般情况下，我们通过将依赖安装到项目目录下，但是有时候我们需要做全局安装，这种全局安装的包一般都是些命令行程序，这些命令行程序安装到全局后就可以保证我们通过 cmd.exe（或者bash） 中调用这些程序了。下面我们演示一下如何全局安装[express-generator](https://www.npmjs.com/package/express-generator)：  
```
npm install -g express-generator
```  
安装完成后会提示安装到了目录 `C:\Users\[用户名]\AppData\Roaming\npm\node_modules`目录下，其实这个安装目录是可以自指定的，老是往系统盘安装会让人抓狂，下面要讲到这个问题。  
安装完 express-generator ，我们在命令行中新建一个目录`mkdir first-express`，然后进入这个目录运行 `express` ，如果发现生成了一堆express项目文件，恭喜你成功了！

### 4.2 NPM用不了怎么办
互联网拉近了整个世界的距离，有时候让你感觉到近到只有一墙之隔。前面讲了很多npm的使用方法，但是我们要想到[npmjs](https://npmjs.org)毕竟是一个外国网站，作为一个开发人员，相信你也许经历过很多技术网站，安安静静的躺在那里，但是就是无法访问的问题，但是谁又能保证npmjs不会是下一个中枪者呢？  
幸好，阿里开发出了 [cnpm](https://npm.taobao.org/) ，一个完整 npmjs.org 镜像，每隔10分钟和官方库进行一次同步。其安装命令很简单：  
```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```  
不过你需要注意，由于最新版本的cnpm不兼容低版本node,如果你当前使用的node版本低于4.x，那么你需要在安装的时候指定版本号：  
```
npm install -g cnpm@3.4.1 --registry=https://registry.npm.taobao.org
```  
否则的话，安装完之后运行命令会报错。  
接着你可以使用 cnpm 来代替 npm，比如说`cnpm install`来代替`npm install`，又可以愉快的玩耍了。  

接着，我们尝试使用cnpm全局安装lodash，运行假设你的nodejs安装在windows的C盘的话，运行完`cnpm install lodash -g`后，你会惊奇的发现报错了：
```
npm ERR! Error: EPERM, mkdir 'C:\Program Files (x86)\nodejs\node_modules\lodash'
npm ERR!  { [Error: EPERM, mkdir 'C:\Program Files (x86)\nodejs\node_modules\lodash']
npm ERR!   errno: 50,
npm ERR!   code: 'EPERM',
npm ERR!   path: 'C:\\Program Files (x86)\\nodejs\\node_modules\\lodash',
npm ERR!   fstream_type: 'Directory',
npm ERR!   fstream_path: 'C:\\Program Files (x86)\\nodejs\\node_modules\\lodash',
npm ERR!   fstream_class: 'DirWriter',
npm ERR!   fstream_stack:
npm ERR!    [ 'C:\\Users\\sunny\\AppData\\Roaming\\npm\\node_modules\\cnpm\\node_modules\\npm\\node_modules\\fstream\\lib\\dir-writer.js:35:25',
npm ERR!      'C:\\Users\\sunny\\AppData\\Roaming\\npm\\node_modules\\cnpm\\node_modules\\npm\\node_modules\\mkdirp\\index.js:47:53',
npm ERR!      'Object.oncomplete (fs.js:108:15)' ] }
npm ERR!
npm ERR! Please try running this command again as root/Administrator.

npm ERR! Please include the following file with any support request:
```
**输出 4.2.1 cnpm全局安装错误输出**  
为啥呢？首先，cnpm 会在将包默认安装在nodejs安装目录下的`node_modules`子文件夹中，其次我们这里将node安装到了系统盘`C:\Program Files (x86)`目录下，最后写入这个目录需要超级管理员权限。  
本来就讨厌往系统盘写入数据文件，这下子非要改掉它这个默认设置不可了。首先我们新建一个环境变量`NODE_PATH`，将其设置为非系统目录，然后将`%NODE_PATH%`（linux中为`$NODE_PATH`）追加到`PATH`环境变量中，做完如上设置的话，运行 `npm install -g packageName` 可以保证安装到的`NODE_PATH`指定的目录下，同时由于`NODE_PATH`在环境变量`PATH`，所以可以保证安装的命令行程序可以直接被调用到。但是做完这番操作后， cnpm 还是安装到系统目录，不要着急，接下来我们修改一下用户根目录（windows下为`c:\users\[用户名]`，linux下为`$HOME`变量指向的目录）下的`.cnpmrc`文件，在里面追加一行：  
```
prefix = ${NODE_PATH}
```
然后重新执行全局安装 lodash 的命令，最终终于将其安装到 NODE_PATH 指向的目录。


### 4.3 包的更新及维护

除了前一节说明的 search 及 install 用法，npm 还提供其他许多指令（commands）。

使用 `npm help` 可以查询可用的指令。

    npm help

**执行结果（部分）**

    where <command> is one of:
        adduser, apihelp, author, bin, bugs, c, cache, completion,
        config, deprecate, docs, edit, explore, faq, find, get,
        help, help-search, home, i, info, init, install, la, link,
        list, ll, ln, login, ls, outdated, owner, pack, prefix,
        prune, publish, r, rb, rebuild, remove, restart, rm, root,
        run-script, s, se, search, set, show, star, start, stop,
        submodule, tag, test, un, uninstall, unlink, unpublish,
        unstar, up, update, version, view, whoami

使用 `npm help command` 可以查询指令的详细用法。例如：

    npm help list

接下来，本节要介绍开发过程常用的 npm 指令。使用 `list` 可以列出已安装包：

    npm list

**执行结果（范例）**

    ├── coffee-script@1.2.0 
    └─┬ express@2.5.6 
      ├─┬ connect@1.8.5 
      │ └── formidable@1.0.8 
      ├── mime@1.2.4 
      ├── mkdirp@0.0.7 
      └── qs@0.4.1 

查询某个包的详细资讯，例如：

    npm show express

升级所有包（如果该包已发布更新版本）：

    npm update

升级指定的包：

    npm update express

删除指定的包：

    npm uninstall express
    
### 4.5 发布自己的包到 npmjs  
刚才演示了这么命令都是安装别人的包，现在我们自己开发一个包。首先你要注册一个npmjs的账号（注册地址：https://www.npmjs.com/signup ）。注册完成后，通过`npm adduser`命令来将注册的账号绑定到本地机器上，运行完改命令后会让你输入 npmjs 的注册账号和密码。  
要想在 npmjs 上发布自己的包，首先要做的是明确你发布的包名在这个网站上有没有存在，在4.1小节，我们上来就介绍了怎么通过包名搜索npmjs上的包。不过，这里提供一个简单暴力的方法，就是直接在浏览器里输入：npmjs.com/package/packageName ， 将packName替换成你所想创建的包名，然后回车，如果打开的网页中有404映入你的眼帘，恭喜你，这个包名没有被占用。  
我这里演示一下，我开发包slogger的过程，首先在浏览器地址栏里输入：npmjs.com/package/slogger ，很不幸，slogger 这个包名已经被占用了。于是乎我输入 npmjs.com/package/node-slogger ，咦没有被占用（我们应该用发展的眼光的看待问题）。接着新建一个目录node-slogger，在命令行中进入这个目录，运行 `npm init`: 
```
name: (node-slogger) node-slogger                                           
version: (1.0.0) 0.0.1                                     
description: A wrapper of logger package , which can write same code even if you change you logger api.                                         
entry point: (index.js)                                    
test command:                                              
git repository: git@github.com:yunnysunny/slogger.git                                           
keywords:  logger                                                
author: yunnysunny                                         
license: (ISC) MIT
```
**输出 4.5.1 运行 npm init 后的部分输出**  
注意我们在 `git repository` 位置填写了一个 git 地址，这就意味着当前的代码要托管在github上。接着我们编写代码，然后将代码push到github，接着给预发布的代码打一个tag，最后运行`npm publish`，打完收工，现在我们看 https://npmjs.com/package/node-slogger ，包已经可以访问了！