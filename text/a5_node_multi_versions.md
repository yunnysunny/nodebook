## A 5 安装多版本 Node

Node 基本上在每年国庆节放假回来后，就会发布一个 LTS 版本，会给开发者带来具有新特性的稳定版本。对于开发者来说，肯定会有跟进新版特性的需求，但是有可能在升级过程中又会发现部分项目的依赖包短时间内又不能兼容新版本的 Node，这样就导致一个比较尴尬的现象，你本地开发环境起码得维护两个 Node 版本来回切换。[nvm](https://github.com/nvm-sh/nvm) 就是解决这个需求的一个命令行工具。

### A 5.1 安装

#### A 5.1.1 类 Uinx 环境

linux 和 mac 中才可以使用 nvm。

使用 curl 或者 wget 命令进行安装，也就是说 **命令 A5.1.1.1** 和 **命令 A5.1.1.2** 任选一个。

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

**命令 A 5.1.1.1**

```shell
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

**命令 A 5.1.1.2**

然后修改 `~/.bashrc` 添加如下代码

```shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

**命令 A 5.1.1.3**

然后 `source ~/.bashrc` 可以让 **命令  A5.1.1.3** 生效，运行 `nvm` 命令即可给出帮助信息打印。

#### A 5.1.2 Windows 环境

Windows 环境需要使用  [nvm-windows](https://github.com/coreybutler/nvm-windows) 命令，需要去其 github 版本发布地址上下载安装包或者绿色安装文件，推荐直接下载安装包，目前最新版本 [1.1.7](https://github.com/coreybutler/nvm-windows/releases/download/1.1.7/nvm-setup.zip)。

安装过程中会让你选择 Node 程序的存放目录，如果这个目录中已经安装了 Node，使用 nvm 命令切换版本的时候，会强制将当前目录覆盖掉，不过一般我们的 Node 安装目录一般也不会放啥重要文件，所以说无所谓。

nvm-windows 比 nvm 多了一个功能，可以设定下载 Node 和 Npm 的地址。通过运行 `nvm node_mirror https://npm.taobao.org/mirrors/node/` 和 `nvm npm_mirror https://npm.taobao.org/mirrors/npm/` 即可从阿里镜像站下载 Node 和 Npm 了。

### A 5.2 使用

#### A 5.2.1 查看当前安装的版本

```shell
$ nvm list

  * 14.17.4 (Currently using 64-bit executable)
```

#### A 5.2.2 安装具体版本

这里演示的是安装 16.7.0 这个版本。

```shell
$ nvm install 16.7.0

Downloading node.js version 16.7.0 (64-bit)...
Complete
Creating d:\Users\yunny\AppData\Roaming\nvm\temp

Downloading npm version 7.20.3... Complete
Installing npm v7.20.3...

Installation complete. If you want to use this version, type

nvm use 16.7.0
```

#### A 5.2.3 切换版本

将当前的版本切换为 16.7.0

```shell
$ nvm use 16.7.0
```
