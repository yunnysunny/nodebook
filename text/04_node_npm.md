## 4 NPM 包管理工具

在Node出现之前，我们在做前端的时候经常用到一些开发工具使用ruby和python开发的（比如说[sass](http://sass-lang.com/)，一种CSS预编译语言，依赖于ruby；(Pygments)[http://pygments.org/] ，一种代码语法高亮插件，依赖于python），这个时候就会看到[gem](https://rubygems.org/)和[pip](https://pypi.python.org/pypi)的身影。熟悉java的同学，应该也对[maven](https://maven.apache.org/)如数家珍。和这些语言类似，Node 也提供了包管理工具，它就是 npm ，全名为 **N**ode **P**ackage **M**anager，集成于 Node 的安装程序中。

## 4.1 使用NPM
npm 不仅可用于安装新的包，它也支持搜寻、列出已安装模块及更新的功能。


npm 目前拥有数以百万计的包，可以在 https://www.npmjs.com/ 使用关键字搜寻包。举例来说，在关键字栏位输入“coffee-script”，下方的清单就会自动列出包含 coffee-script 关键字的包。

![image](https://raw.githubusercontent.com/yunnysunny/nodebook/master/images/zh-tw/node_npm_registry.png)

虽然也可以通过`npm search`来在命令行中查询，但是初次查询过程中要在本地建立索引，等待的时间巨漫长，还是不介绍的为好。

找到需要的包后，即可使用以下指令安装：

    npm install coffee-script
运行完之后，就会在当前目录下的 `node_modules`目录下安装coffee-script包。
```
|
----node_modules
    |
    -----coffee-script
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

另一种安装模式称为 **global**（全域），这种模式会将包安装到系统资料夹，也就是 npm 安装路径的 `node_modules` 资料夹，
例如：

`C:\Program Files\nodejs\node_modules`

是否要使用全域安装，可以按照包是否提供**新指令**来判断，举例来说，express 包提供 `express` 这个指令，而 coffee-script 则提供 `coffee` 指令。

在 local 安装模式中，这些指令的程序档案，会被安装到 `node_modules` 的 `.bin` 这个隐藏资料夹下。除非将 .bin 的路径加入 PATH 环境变数，否则要执行这些指令将会相当不便。

为了方便指令的执行，我们可以在 `npm install` 加上 `-g` 或 `--global` 参数，启用 global 安装模式。例如：

    npm install -g coffee-script
    npm install -g express

使用 global 安装模式，需要注意执行权限与搜寻路径的问题，若权限不足，可能会出现类似以下的错误讯息：

    npm ERR! Error: EACCES, permission denied '...'
    npm ERR! 
    npm ERR! Please try running this command again as root/Administrator.

要获得足够得执行权限，请参考以下说明：

-   Windows 7 或 2008 以上，在“命令提示字符”的捷径按右键，
    选择“以系统管理员身份执行”，
    执行 npm 指令时就会具有 Administrator 身份。
-   Mac OS X 或 Linux 系统，可以使用 `sudo` 指令，例如：
     `sudo npm install -g express`
-   Linux 系统可以使用 root 权限登录，或是以“`sudo su -`”切换成 root
    身份。
    （使用 root 权限操作系统相当危险，因此并不建议使用这种方式。）

若加上 `-g` 参数，使用 `npm install -g coffee-script` 完成安装后，就可以在终端机执行 `coffee` 指令。例如：

    coffee -v

**执行结果（范例）**

    CoffeeScript version 1.2.0

若未将 Node.js 包安装路径加入环境变数 NODE_PATH，在引入时会回报错误。

**报错范例**

    module.js:340
        throw err;
              ^
    Error: Cannot find module 'express'
        at Function.Module._resolveFilename (module.js:338:15)
        at Function.Module._load (module.js:280:25)
        at Module.require (module.js:362:17)
        at require (module.js:378:17)
        at Object.<anonymous> (/home/clifflu/test/node.js/httpd/express.js:3:15)
        at Module._compile (module.js:449:26)
        at Object.Module._extensions..js (module.js:467:10)
        at Module.load (module.js:356:32)
        at Function.Module._load (module.js:312:12)
        at Module.runMain (module.js:492:10)

**使用 ubuntu PPA 安装 Node.js 的设定范例**

    echo 'NODE_PATH="/usr/lib/node_modules"' | sudo tee -a
    /etc/environment

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

检视某个包的详细资讯，例如：

    npm show express

升级所有包（如果该包已发布更新版本）：

    npm update

升级指定的包：

    npm update express

删除指定的包：

    npm uninstall express

### 4.4 使用 package.json

对于正式的 Node.js 专案，可以建立一个命名为 `package.json` 的设定档（纯文字格式），档案内容参考范例如下：

**package.json（范例）**

    {
        "name": "application-name"
      , "version": "0.0.1"
      , "private": true
      , "dependencies": {
          "express": "2.5.5"
        , "coffee-script": "latest"
        , "mongoose": ">= 2.5.3"
      }
    }

其中 `name` 与 `version` 按照专案的需求设置。

需要注意的是 `dependencies` 的设定，它用于指定专案相依的包名称及版本：

-   `"express": "2.5.5"`

    //代表此专案相依版本 2.5.5 的 express 包
-   `"coffee-script": "latest"`

    //使用最新版的 coffee-script 包（每次更新都会检查新版）
-   `"mongoose": ">= 2.5.3"`

    //使用版本大于 2.5.3 的 mongoose 包

假设某个包的新版可能造成专案无法正常运作，就必须指定包的版本，避免专案的程序码来不及更新以兼容新版包。通常在开发初期的专案，需要尽可能维持新包的兼容性（以取得包的更新或修正），可以用“`>=`”设定最低兼容的版本，或是使用“`latest`”设定永远保持最新包。
