## 4 NPM 包管理工具

在Node出现之前，我们在做前端的时候经常用到一些开发工具使用ruby和python开发的（比如说[sass](https://sass-lang.com/)，一种CSS预编译语言，依赖于ruby；(Pygments)[https://pygments.org/] ，一种代码语法高亮插件，依赖于python），这个时候就会看到[gem](https://rubygems.org/)和[pip](https://pypi.python.org/pypi)的身影。熟悉java的同学，应该也对[maven](https://maven.apache.org/)如数家珍。和这些语言类似，Node 也提供了包管理工具，它就是 npm ，全名为 **N**ode **P**ackage **M**anager，集成于 Node 的安装程序中。

### 4.1 使用NPM

npm 不仅可用于安装新的包，它也支持搜寻、列出已安装模块及更新的功能。

npm 目前拥有数以百万计的包，可以在 https://www.npmjs.com/ 使用关键字搜寻包。举例来说，在关键字栏位输入“coffee-script”，下方的清单就会自动列出包含 coffee-script 关键字的包。

![image](images/node_npm_registry.png)

虽然也可以通过`npm search`来在命令行中查询，但是初次查询过程中要在本地建立索引，等待的时间巨漫长，还是不介绍的为好。

找到需要的包后，即可使用以下指令安装：

    npm install coffee-script

> 在 win 10 下的 powershell 中运行命令，如果出现提示 `无法加载文件，因为在此系统上禁止运行脚本` 的提示，那么需要使用超级管理员打开 powershell ，然后运行 `set-ExecutionPolicy RemoteSigned`，接着会提示`是否要更改执行策略`，输入 y。操作完成之后，即可执行 npm 命令。

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
我们在来稍微留意一下，我们配置的这个express的版本号，咦，`^`是个什么鬼？讲这个东东，还要从[Semantic Versioning](https://semver.org/)这个概念讲起，它将版本号分为三段：  

1. 主版本，你可以在这个版本中做不兼容性改动
2. 小版本，你可以在这个版本上增加共嗯那个，不过要向后兼容
3. 补丁版本，在这里可以做一些bug修复，不过依然要保持向后兼容

在这里对于express来说，主版本号是`4`，小版本号是`14`，补丁版本号是`0`。啰嗦了这么多，那么`^`呢，它告诉你使用从`4.14.0`到`5.0.0`（不包括5.0.0）之间的最新版本，也就是说它选择的版本号 x 的取值范围:`4.14.0<=x<5.0.0`。不过，如果版本号是 `0` 打头的一个字符串，比如说 `0.1.2` `0.0.2`，则会被特殊对待，对于前者来说， 0.1.0<=x<0.2.0，对于后者来说 0.0.0<=x<0.1.0。
除了`^`，还有一个版本号标识符`~`也很常用，假设我们将这里express的版本号设置为`~4.14.0`，那么它表示从`4.14.0`到`4.15.0`（不包括4.15.0）之间的最新版本，也就是说它选择的版本号x的取值范围：`4.14.0<=x<4.15.0`。  
另外还有一些版本号的特殊标志符，由于不常用，有需要的可以参考https://docs.npmjs.com/cli/v6/using-npm/semver 。
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
npm install -g cnpm --registry=https://registry.npmmirror.com
```

**命令 4.2.1**

不过你需要注意，由于最新版本的cnpm不兼容低版本node,如果你当前使用的node版本低于4.x，那么你需要在安装的时候指定版本号：  

```
npm install -g cnpm@3.4.1 --registry=https://registry.npmmirror.com
```

**命令 4.2.2**

否则的话，安装完之后运行命令会报错。  
接着你可以使用 cnpm 来代替 npm，比如说`cnpm install`来代替`npm install`，又可以愉快的玩耍了。  

但是我们在使用一些第三方工具的时候，其包裹的命令行内部会调用 npm install 命令来安装依赖包，这时候 cnpm 排不上用场，那么将 npm 的安装源手动切换到淘宝源，就是解决这个问题的大法：

```shell
npm config set registry https://registry.npmmirror.com
```

**命令 4.2.3**

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
本来就讨厌往系统盘写入数据文件，这下子非要改掉它这个默认设置不可了。我们命令

```
npm config set prefix "D:\npm"
```

**命令 4.2.4**

> 设置完成后，记得将 d:\npm 添加到环境变量 PATH 中，否则在终端中无法找到全局安装的命令。

这样你使用 `npm install -g package` 命令安装的包就会被放置到 ${prefix}/node_modules   下。同时使用命令

```
npm config set cache "D:\npm-cache"
```

**命令 4.2.5**

可以设置npm的缓存路径，否则的话它默认会缓存一部分下载的包到系统目录中。

我们推荐仅仅在全局安装命令行工具类型的包，因为同一个包在不同项目中很有可能使用不同的版本，所以如果将其安装在全局的话，就没办法使用不同版本了。如果你非要将某一个类库安装到全局的话，那就增加一个 `NODE_PATH` 环境变量，指向我们刚才设置的目录 `D:\npm`。

### 4.3 其他一些命令

如果你想查看当前全局安装了哪些包，可以使用`npm list -g`命令，运行完成后会打印一个目录树，但是如果安装的包比较多的话，在命令行中会打印不全，所以可以采用重定向的方式将打印结果输出到硬盘，例如`npm list -g > d:\package.txt`。 如果不加`-g`参数就是打印当前目录下 `node_modules` 文件夹下的包结构。

有时候，我们需要将安装好的包删除掉，如果包是安装在项目目录下的话，其实直接可以把 `node_modules` 下对应的文件夹删除即可，如果是全局安装的话，那还是使用命令进行卸载吧，比如卸载我们上面安装的 express-generator ： `npm uninstall express-generator -g`。同样这里的 `-g` 是说卸载全局安装的 express-generator 包。

### 4.4 yarn

我们在4.1节提到 Semantic Versioning 这个概念，但是这个约定全凭开发者去自觉遵守显然不现实。在之前的开发中，我使用supertest 这个包来做单元测试，当时安装的是 2.0.0 版本，过了几天我新建了一个项目使用 npm install 来安装依赖的时候被安装的是2.0.1版本。按理来说依照规则，小版本变更应该是用来修改bug的，没想到我运行单元测试之后直接在 supertest 中报了语法错误。去网上一查，当前报错代码在 node 4.x中才能避免，而我用的是 0.10.x，然后手动查看了一下 supertest 的 package.json 文件，发现它在这一个小版本改动中悄悄的将 engine 属性的 node 版本改为>=4.0.0。单纯使用一个包都可能会导致风险，更不用说在一个庞大的项目中使用大量的依赖，那个时候可真叫牵一发而动全身。

[yarn](https://yarnpkg.com) 正是 facebook 的开发人员在开发 React Native 的时候实在无法忍受第三方包版本号变更带来的兼容问题，怒而开发之。

> 需要注意的yarn需要 node 版本大于4.0.0。

yarn 很多命令和 npm相似，比如说 `yarn init` 对应 `npm init` 来初始化项目， `yarn install` 对应 `npm install` 来读取配置文件安装依赖包。

不过通过 `yarn install` 安装过程中，yarn 将下载下来的包都缓存到了本地（这个缓存路径在windows下默认为C:\Users\\[user]\AppData\Local\Yarn\cache），下次如果换个项目再安装相同包，并且版本号也跟之前安装的一样的话，它就直接从缓存中读取出来。同时，yarn 在安装包的时候是并行的，而 npm 在安装包时串行的，必须第一个包安装完成之后才能安装第二个包。所以综上两点，yarn 安装包的速度要比 npm 快。

我们通过 `npm save [pakcage] --save` 来将依赖包安装到当前项目下，同时将配置写入 package.json 文件，在 yarn 中 使用 `yarn add [package]` 即可，如果你要想全局安装包可以用 `yarn global add [package]` (之前我们通过**命令4.2.3**设置过全局包安装的路径，yarn 也会读取这个设置)。此外 yarn global 还有一些很有用的命令，大家可以参见[这里](https://yarnpkg.com/en/docs/cli/global)。

不过我们通过 `yarn add [package]` 后，他还会在当前目录下生成或者修改一个 yarn.lock 文件。例如我们运行 `yarn add express` 后就会发现文件 yarn.lock 中内容如下：

```
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


accepts@~1.3.3:
  version "1.3.3"
  resolved "https://registry.yarnpkg.com/accepts/-/accepts-1.3.3.tgz#c3ca7434938648c3e0d9c1e328dd68b622c284ca"
  dependencies:
    mime-types "~2.1.11"
    negotiator "0.6.1"

array-flatten@1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/array-flatten/-/array-flatten-1.1.1.tgz#9a5f699051b1e7073328f2a008968b64ea2955d2"

content-disposition@0.5.1:
  version "0.5.1"
  resolved "https://registry.yarnpkg.com/content-disposition/-/content-disposition-0.5.1.tgz#87476c6a67c8daa87e32e87616df883ba7fb071b"
```

**代码 4.2.1 yarn.lock示例**  

你会发现里面罗列了express各个依赖的版本号（ version 字段），下载地址（ resolved 字段），我们仅仅截取了前面几行，因为 express 包中依赖关系比较复杂，生成的这个 lock 文件也比较长。项目初始化的老兄，通过 yarn add 的方式安装好包之后，需要将这个 yarn.lock 提交到版本库，这样你的小伙伴通过 `yarn install` 安装的各个依赖就和初始化的老兄用的一样了，这样就避免了团队中各个开发者通过 npm install 安装到本地的包的版本号不一致而导致的各种难以排查的问题了。

更多关于 npm 和 yarn 的对比可以参见[官方文档](https://yarnpkg.com/en/docs/migrating-from-npm)。

不过我们在使用 yarn 的时候，因为 yarn 在底层依然得使用 npm 进行安装，所以依然无法避免因网络原因导致的包无法下载的问题，不过我们可以直接将 npm 的安装源设置为 cnpm 提供的安装源：

```shell
yarn config set registry https://registry.npmmirror.com
```

**命令4.4.1**  

> 如果之前通过 **命令 4.2.3** 命令设置过第三方源，那么这个设置的优先级会大于通过 yarn 命令设置的优先级。特别是 npm 命令和 yarn 命令设置的源地址不同的时候，你会发现明明 yarn 切换到了淘宝源，运行 yarn add 后源地址却不是淘宝源的。其实通过 yarn 命令切换源后，它会在 ~/.yarnrc 中写入新的源的配置，同样使用 config 命令切换源后，它会写入 ~/.npmrc 中。运行 yarn add 时，它会先读取 ~/.npmrc 中的配置，再读取 ~/.yarnrc 的配置。所以解决问题的思路就是要么删除 ~/.npmrc 中关于 registry 的配置，要么将其改成跟 yarn 中配置的源地址一致。

同时你可以通过命令来设置 yarn 命令安装的包的路径：

```shell
yarn config set global-folder "d:\yarn"
```

**命令 4.4.2**

设置完后，记得将对应的 ```d:/yarn/global/bin``` 添加到环境变量，这样全局安装的命令行程序才能被从终端上找得到。

当然与 npm 命令对应的，也可以设置缓存路径：

```shell
yarn config set cache-folder "D:\yarn_cache"
```

**命令 4.4.3**

使用 yarn 的还有一个好处是，当前项目版本是锁定的 yarn.lock 文件中的（从 node 6 开始，也有类似的功能，有一个 package.lock 的文件来锁定版本号）。这样带来的好处是，假设 package.json 中定义的某个版本号是 ^1.0.0，按理来说 1.0.0 和 1.n.m 都是符合这个版本约束的，两个开发者在协作开发的时候，如果两人安装的小版本号不一致，就会导致未知问题。yarn.lock 的一个重要作用就是，就是将各个包用的版本号一开始就锁死。例如在 **代码 4.2.1** 中，yarn.lock 规定 accepts 用的是 1.3.3，多个开发者在协作开发时，从代码仓库中检出项目代码，初始化运行 yarn install 后安装的 accepts 也会是 1.3.3，即使当前 accepts 包有最新的版本 1.4.x，也不会被安装。

随着项目的开发迭代，各个包的版本难免会被更新，更新 yarn.lock 的某个包的版本号大体有如下几种方法。

直接使用 `yarn add packageName@x.y.z`， 这样 yarn.lock 和 package.json 都会被更新，且 package.json 中的包版本号会被写死为 `x.y.z`，而不是我们常见的  `^a.b.c` 格式。

使用 `yarn upgrade-interactive --latest` , 需要手动选择升级的依赖包，按空格键选择，a 键切换所有，i 键反选选择。这种方式如果升级的包的版本号中主版本号没有变，则只会更改 yarn.lock，不会更改 package.json。比如说当前安装版本是 1.1.0，升级到版本是 1.20，则用这个命令后，package.json 不改变；当前安装版本为 1.1.0，升级到版本是 2.0.0，则用这个命令后，package.json 和 yarn.lock 都会更改。

### 4.5 发布自己的包到 npmjs

刚才演示了这么命令都是安装别人的包，现在我们自己开发一个包。首先你要注册一个npmjs的账号（注册地址：https://www.npmjs.com/signup ）。注册完成后，通过`npm adduser`命令来将注册的账号绑定到本地机器上，运行完改命令后会让你输入 npmjs 的注册账号和密码。  
要想在 npmjs 上发布自己的包，首先要做的是明确你发布的包名在这个网站上有没有存在，在4.1小节，我们上来就介绍了怎么通过包名搜索npmjs上的包。不过，这里提供一个简单暴力的方法，就是直接在浏览器里输入：npmjs.com/package/packageName ， 将packName替换成你所想创建的包名，然后回车，如果打开的网页中有404映入你的眼帘，恭喜你，这个包名没有被占用。  
我这里演示一下，我开发包slogger的过程，首先在浏览器地址栏里输入：npmjs.com/package/slogger ，很不幸，slogger 这个包名已经被占用了。于是乎我输入 npmjs.com/package/node-slogger ，咦没有被占用（我们应该用发展的眼光的看待问题）。接着新建一个目录 node-slogger ，在命令行中进入这个目录，运行 `npm init`: 

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
注意我们在 `git repository` 位置填写了一个 git 地址，这就意味着当前的代码要托管在github上。接着我们编写代码，然后将代码push到github，接着给预发布的代码打一个tag，最后运行`npm publish`（在此之前需要运行 `npm login` 完成在 npmjs 网站上的授权），打完收工，现在我们看 https://npmjs.com/package/node-slogger ，包已经可以访问了！

使用 publish 命令有如下两个注意点：

如果你待发布的代码中含有可执行脚本，且在安装的时候需要运行这个可执行脚本，则你的 publish 命令是不能在 Windows 上运行的，否则你发布的包是没有可执行权限的。

其次如果你之前使用 **命令4.2.3** 手动切换非官方源的话，是没法直接 publish 成功的，这种情况下执行 publish 命令，会将其发布到淘宝源上去，但是我们又没有淘宝源的账号（况且我们也不想发布到淘宝源）。解决的方法是删除 ~/.npmrc 中的这行配置 `registry=https://registry.npmmirror.com/`。当然通过 `npm config set registry https://registry.npmjs.org/` 也能实现相当的效果。

### 4.6 发布自己的包到私有仓库

有的时候，我们写的包是公司内部使用的，不适合公开发布，为了方便大家协作开发，需要一个私有仓库。网上很多教程，都是借用 cnpm 的源代码，自己搭建类似于 cnpm 的系统来做私有仓库，不过这么做维护比较复杂，笔者没有这么做过，而是借用 npm 自带的功能来实现类似的功能。

npm 中的 dependices ，默认是从镜像仓库中来拉取代码，其实这个地址也可以写成一个 git 地址，比如说类似于 `https://git-domain/project-path.git` 或者 `git@git-domain:project-path.git` 这种格式。不过推荐使用后者，这样可以借助于 git 仓库自带的部署密钥的功能，更好的控制权限。

鉴于目前市面上使用最多的 git 私有托管工具是 gitlab，所以下面的教程内容会直接使用 [gitlab](https://gitlab.com) 做演示。首先在 gitlab 上创建一个项目，https://gitlab.com/yunnysunny/myecho。提交完代码后，打开菜单 **Repository** -> **Tags**，点击 **New tag** 按钮，创建一个 git tag。

![](images/create_tag_on_gitlab.png)

**图 4.6.1**

这里创建的版本号是 v0.1.0。

接着到了关键的一步，设置部署密钥。输入 key 的内容和标题后，点击 **Add key** 按钮。

![](images/add_deploy_key_on_gitlab.png)

**图 4.6.2**

添加成功后，就会显示在下面的列表中

![](images/enabled_deploy_key_on_gitlab.png)

**图 4.6.3**

这样就算是配置完成了，下次在发布新版本的时候，直接按照 **图4.6.1** 的步骤打个 tag 即可。

最后就是引用这个新创建的包了，使用命令 `npm install git@gitlab.com:yunnysunny/myecho.git#v0.1.0`, 即可完成安装（注意井号后面是 tag 名称）。一般来说，如果是公司的开发人员的话，对于要安装的自定义依赖包是有项目权限的，这时候不用更改任何 ssh 配置，就能完成对其的下载。但是如果要在服务器上运行这个安装命令的话，大家肯定不会把某一位同事的开发用的 git 密钥文件放置在服务器上，这时候就需要在服务器上配置部署密钥了，修改 ~/.ssh/config ，添加类似如下配置即可：

```
# 主机名要改成内网的 gitlab 地址
Host gitlab.com
  Hostname gitlab.com
  User git
  IdentityFile ~/.ssh/test_ssh
```
