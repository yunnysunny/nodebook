## 4 NPM 套件管理工具


npm 全名为 **N**ode **P**ackage **M**anager，是 Node.js 的套件（package）管理工具， 类似 Perl 的 ppm 或 PHP 的 PEAR等。安装 npm 后，使用 `npm install module_name` 指令即可安装新套件，维护管理套件的工作会更加轻松。

npm 可以让 Node.js 的开发者，直接利用、扩充线上的套件库（packages registry），加速软体专案的开发。npm 提供很友善的搜寻功能，可以快速找到、安装需要的套件，当这些套件发行新版本时，npm 也可以协助开发者自动更新这些套件。

npm 不仅可用于安装新的套件，它也支持搜寻、列出已安装模组及更新的功能。

### 4.1 安装 NPM

Node.js 在 0.6.3 版本开始内建 npm，读者安装的版本若是此版本或更新的版本，就可以略过以下安装说明。

若要检查 npm 是否正确安装，可以使用以下的指令：

    npm -v

**执行结果说明**

若 npm 正确安装，执行 `npm -v` 将会看到类似 1.1.0-2 的版本讯息。

若读者安装的 Node.js 版本比较旧，或是有兴趣尝试自己动手安装 npm 工具，则可以参考以下的说明。

#### 4.1.1 安装于 Windows 系统

Node.js for Windows 于 0.6.2 版开始内建 npm，使用 nodejs.org 官方提供的安装程序，不需要进一步的设定，就可以立即使用 npm 指令，对于 Windows 的开发者来说，大幅降低环境设定的问题与门槛。

除了使用 Node.js 内建的 npm，读者也可以从 npm 官方提供的以下网址：

<http://npmjs.org/dist/>

这是由 npm 提供的 Fancy Windows Install 版本，请下载压缩档（例如：`npm-1.1.0-3.zip`），并将压缩档内容解压缩至 Node.js的安装路径（例如：`C:\Program Files\nodejs`）。

解压缩后，在 Node.js 的安装路径下，应该有以下的档案及资料夹。

-   npm.cmd （档案）
-   node\_modules （资料夹）

#### 4.1.2 安装于 Linux 系统

Ubuntu Linux 的用户，可以加入 [NPM Unoffcial PPA](https://launchpad.net/~gias-kay-lee/+archive/npm) 这个 repository，即可使用 apt-get 完成 npm 安装。

**Ubuntu Linux 使用 apt-get 安装 npm**

    sudo apt-get install python-software-properties
    sudo add-apt-repository ppa:gias-kay-lee/npm
    sudo apt-get update
    sudo apt-get install npm

npm 官方提供的安装程序 `install.sh`，可以适用于大多数的 Linux 系统。使用这个安装程序，请先确认：

1.  系统已安装 curl 工具（请使用 `curl --version` 查看版本讯息）
2.  已安装 Node.js 并且 PATH 正确设置
3.  Node.js 的版本必须大于 0.4.x

以下为 npm 提供的安装指令：

    curl http://npmjs.org/install.sh | sh

安装成功会看到如下讯息：

**install.sh 安装成功的讯息**

    npm@1.0.105 /home/USERNAME/local/node/lib/node_modules/npm
    It worked

#### 4.1.3 安装于 Mac OS X

建议采用与 Node.js 相同的方式，进行 npm 的安装。例如使用 MacPorts 安装 Node.js，就同样使用 MacPorts 安装 npm，这样对日后的维护才会更方便容易。

使用 MacPorts 安装 npm 是本书比较建议的方式，它可以让 npm 的安装、删除及更新工作自动化，将会帮助开发者节省宝贵时间。

**安装 MacPorts 的提示**

在 MacPorts 网站，可以取得 OS X 系统版本对应的安装程序（例如 10.6 或10.7）。

<http://www.macports.org/>

安装过程会询问系统管理者密码，使用预设的选项完成安装即可。安装 MacPorts 之后，在终端机执行 `port -v` 将会看到 MacPorts的版本讯息。

安装 npm 之前，先更新 MacPorts 的套件清单，以确保安装的 npm 是最新版本。

    sudo port -d selfupdate

接着安装 npm。

    sudo port install npm

若读者的 Node.js 并非使用 MacPorts 安装，则不建议使用 MacPorts 安装 npm，因为 MacPorts 会自动检查并安装相依套件，而 npm 相依 nodejs，所以 MacPorts 也会一并将 nodejs 套件安装，造成先前读者使用其它方式安装的 nodejs 被覆盖。

读者可以先使用 MacPorts 安装 curl（`sudo port install curl`），再参考 Linux 的 install.sh 安装方式，即可使用 npm 官方提供的安装程序。

#### 4.1.4 NPM 安装后测试

npm 是指令列工具（command-line tool），使用时请先打开系统的文字终端机工具。

测试 npm 安装与设定是否正确，请输入指令如下：

    npm -v

或是：

    npm --version

如果 npm 已经正确安装设定，就会显示版本讯息：

**执行结果（范例）**

    1.1.0-2

### 4.2 使用 NPM 安装套件

npm 目前拥有超过 6000 种套件（packages），可以在 [npm registry](http://search.npmjs.org/) 使用关键字搜寻套件。

<http://search.npmjs.org/>

举例来说，在关键字栏位输入“coffee-script”，下方的清单就会自动列出包含 coffee-script 关键字的套件。

![image](https://raw.githubusercontent.com/yunnysunny/nodebook/master/images/zh-tw/node_npm_registry.png)

接着我们回到终端机模式的操作，`npm` 的指令工具本身就可以完成套件搜寻的任务。

例如，以下的指令同样可以找出 coffee-script 相关套件。

    npm search coffee-script

以下是搜寻结果的参考画面：

![image](https://raw.githubusercontent.com/yunnysunny/nodebook/master/images/zh-tw/node_npm_search.png)

找到需要的套件后（例如 express），即可使用以下指令安装：

    npm install coffee-script

值得注意的一点是，使用 `npm install` 会将指定的套件，安装在工作目录（Working Directory）的 `node_modules` 资料夹下。

以 Windows 为例，如果执行 `npm install` 的目录位于：

`C:\project1`

那么 npm 将会自动建立一个 node\_modules 的子目录（如果不存在）。

`C:\project1\node_modules`

并且将下载的套件，放置于这个子目录，例如：

`C:\project1\node_modules\coffee-script`

这个设计让专案可以个别管理相依的套件，并且可以在专案布署或发行时，将这些套件（位于 node\_modules）一并打包，方便其它专案的用户不必再重新下载套件。

这个 `npm install` 的预设安装模式为 **local**(本地)，只会变更当前专案的资料夹，不会影响系统。

另一种安装模式称为 **global**（全域），这种模式会将套件安装到系统资料夹，也就是 npm 安装路径的 `node_modules` 资料夹，
例如：

`C:\Program Files\nodejs\node_modules`

是否要使用全域安装，可以按照套件是否提供**新指令**来判断，举例来说，express 套件提供 `express` 这个指令，而 coffee-script 则提供 `coffee` 指令。

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

若未将 Node.js 套件安装路径加入环境变数 NODE\_PATH，在引入时会回报错误。

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

::

:   echo 'NODE\_PATH="/usr/lib/node\_modules"' | sudo tee -a
    /etc/environment

### 4.3 套件的更新及维护

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

接下来，本节要介绍开发过程常用的 npm 指令。使用 `list` 可以列出已安装套件：

    npm list

**执行结果（范例）**

    ├── coffee-script@1.2.0 
    └─┬ express@2.5.6 
      ├─┬ connect@1.8.5 
      │ └── formidable@1.0.8 
      ├── mime@1.2.4 
      ├── mkdirp@0.0.7 
      └── qs@0.4.1 

检视某个套件的详细资讯，例如：

    npm show express

升级所有套件（如果该套件已发布更新版本）：

    npm update

升级指定的套件：

    npm update express

删除指定的套件：

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

需要注意的是 `dependencies` 的设定，它用于指定专案相依的套件名称及版本：

-   `"express": "2.5.5"`

    //代表此专案相依版本 2.5.5 的 express 套件
-   `"coffee-script": "latest"`

    //使用最新版的 coffee-script 套件（每次更新都会检查新版）
-   `"mongoose": ">= 2.5.3"`

    //使用版本大于 2.5.3 的 mongoose 套件

假设某个套件的新版可能造成专案无法正常运作，就必须指定套件的版本，避免专案的程序码来不及更新以兼容新版套件。通常在开发初期的专案，需要尽可能维持新套件的兼容性（以取得套件的更新或修正），可以用“`>=`”设定最低兼容的版本，或是使用“`latest`”设定永远保持最新套件。
