linux环境下，安装 c/c++ 编译环境是比较简单的，在 windows 下却比较复杂。一般是采用 安装 `windows-build-tools 来解决,即运行

```
npm install --global --production windows-build-tool
```

但是我在安装的时候，安装到 python 这一步的时候卡住了：

```
> windows-build-tools@5.2.2 postinstall D:\npm\node_modules\windows-build-tools
> node ./dist/index.js



Downloading python-2.7.15.amd64.msi
[>                                            ] 0.0% (0 B/s)
Downloaded python-2.7.15.amd64.msi. Saved to C:\Users\yunny\.windows-build-tools\python-2.7.15.amd64.msi.
Downloading vs_BuildTools.exe
[>                                            ] 0.0% (0 B/s)
Downloaded vs_BuildTools.exe. Saved to C:\Users\yunny\.windows-build-tools\vs_BuildTools.exe.

Starting installation...
Launched installers, now waiting for them to finish.
This will likely take some time - please be patient!

Status from the installers:
---------- Visual Studio Build Tools ----------
Still waiting for installer log file...
------------------- Python --------------------
Successfully installed Python 2.7
```

查看了一下官方的 issue，发现有好多人遇到了这个问题，比如说 issue [116](https://github.com/felixrieseberg/windows-build-tools/issues/116) ，但是我发现里面给出的解决方案不适合我。因为解决方案中需要修改安装目录下的一个 build-tools-log.txt 文件，但是我的安装目录下没有这个文件。（网上也有给出先安装 4.0.0 版本，然后再安装最先版本的解决方案，这个试过了也不行，具体 issue 链接在[这里](https://github.com/felixrieseberg/windows-build-tools/issues/172#issuecomment-484091133)）。

既然这个 windows-build-tool 这么难用，我就决定自己安装了。其实就是安装 vs build tools 而已。但是在网上找到微软官网链接 [Visual Studio 2019](https://visualstudio.microsoft.com/downloads/) 把  vs build tools 的下载链接给移除了，不知道是什么原因。网上找了一个，说是通过 choco 命令可以直接安装。于是乎，我决定安装 choco，但是试了一下 chocolatey 官网的安装命令，使用管理员在 powershell 中运行如下命令：

```
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

但是运行完成之后失败了，会有如下输出：

```
Forcing web requests to allow TLS v1.2 (Required for requests to Chocolatey - The package manager for Windows)
Getting latest version of the Chocolatey package for download.
Not using proxy.
Getting Chocolatey from https://community.chocolatey.org/api/v2/package/chocolatey/0.10.15.
Downloading https://community.chocolatey.org/api/v2/package/chocolatey/0.10.15 to C:\Users\yunny\AppData\Local\Temp\chocolatey\chocoInstall\chocolatey.zip
Not using proxy.
Extracting C:\Users\yunny\AppData\Local\Temp\chocolatey\chocoInstall\chocolatey.zip to C:\Users\yunny\AppData\Local\Temp\chocolatey\chocoInstall
Remove-Item : 找不到路径“C:\Users\yunny\AppData\Local\Temp\chocolatey\chocoInstall\_rels\.rels”，因为该路径不存在。
所在位置 C:\Windows\system32\WindowsPowerShell\v1.0\Modules\Microsoft.PowerShell.Archive\Microsoft.PowerShell.Archive.psm1:411 字符: 46
+ ...                 $expandedItems | % { Remove-Item $_ -Force -Recurse }
+                                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (C:\Users\yunny\...all\_rels\.rels:String) [Remove-Item], ItemNotFoundException
    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.RemoveItemCommand
```

排查了一下，应该是下载的 C:\Users\yunny\AppData\Local\Temp\chocolatey\chocoInstall\[chocolatey.zip](http://chocolatey.zip/) 文件没有被正常解压，导致后续的文件找不到。

我接着看官方文档，除了在 powershell 中直接安装外，还有好多安装方式，最简单的一种是使用 nuget 命令。不过需要先安装 nuget 命令。我从 https://dist.nuget.org/win-x86-commandline/latest/nuget.exe 上将其下载下来，然后移动到任意一个环境变量 PATH 所在目录中，然后执行 

```
nuget install chocolatey
```

我本以为这样就可以了，结果它只是下载了一个安装脚本而已，运行完后会生成一个 chocolatey.0.10.14 文件夹（0.10.14是其版本号），进入到这个目录中的 tools 文件夹，执行 

```
.\chocolateyInstall.ps1
```

然后安装过程中，竟然还是有报错：

```
Creating ChocolateyInstall as an environment variable (targeting 'Machine')
  Setting ChocolateyInstall to 'C:\ProgramData\chocolatey'
WARNING: It's very likely you will need to close and reopen your shell
  before you can use choco.
错误: 拒绝访问注册表路径。
Restricting write permissions to Administrators
We are setting up the Chocolatey package repository.
The packages themselves go to 'C:\ProgramData\chocolatey\lib'
  (i.e. C:\ProgramData\chocolatey\lib\yourPackageName).
A shim file for the command line goes to 'C:\ProgramData\chocolatey\bin'
  and points to an executable in 'C:\ProgramData\chocolatey\lib\yourPackageName'.

Creating Chocolatey folders if they do not already exist.

WARNING: You can safely ignore errors related to missing log files when
  upgrading from a version of Chocolatey less than 0.9.9.
  'Batch file could not be found' is also safe to ignore.
  'The system cannot find the file specified' - also safe.
Copy-Item : 对路径“C:\ProgramData\chocolatey\tools\checksum.exe.config”的访问被拒绝。
所在位置 C:\Users\yunny\chocolatey.0.10.14\tools\chocolateysetup.psm1:409 字符: 3
+   Copy-Item $chocInstallFolder\* $chocolateyPath -Recurse -Force
+   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : PermissionDenied: (checksum.exe.config:FileInfo) [Copy-Item], UnauthorizedAccessException
    + FullyQualifiedErrorId : CopyFileInfoItemUnauthorizedAccessError,Microsoft.PowerShell.Commands.CopyItemCommand

Copy-Item : 对路径“C:\ProgramData\chocolatey\tools\checksum.exe.config”的访问被拒绝。
所在位置 C:\Users\yunny\chocolatey.0.10.14\tools\chocolateysetup.psm1:409 字符: 3
+   Copy-Item $chocInstallFolder\* $chocolateyPath -Recurse -Force
+   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : PermissionDenied: (checksum.exe.config:FileInfo) [Copy-Item], UnauthorizedAccessException
    + FullyQualifiedErrorId : CopyDirectoryInfoItemUnauthorizedAccessError,Microsoft.PowerShell.Commands.CopyItemCommand

PATH environment variable does not have C:\ProgramData\chocolatey\bin in it. Adding...
使用“4”个参数调用“SetValue”时发生异常:“尝试执行未经授权的操作。”
所在位置 C:\Users\yunny\chocolatey.0.10.14\tools\chocolateyInstall\helpers\functions\Set-EnvironmentVariable.ps1:97 字符: 3
+   [Microsoft.Win32.Registry]::SetValue($keyHive + "\" + $registryKey, ...
+   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [], MethodInvocationException
    + FullyQualifiedErrorId : UnauthorizedAccessException

错误: 拒绝访问注册表路径。
警告: Not setting tab completion: Profile file does not exist at 'E:\mydoc\WindowsPowerShell\Microsoft.PowerShell_profile.ps1'.
Chocolatey (choco.exe) is now ready.
You can call choco from anywhere, command line or powershell by typing choco.
Run choco /? for a list of functions.
You may need to shut down and restart powershell and/or consoles
 first prior to using choco.
```

全都是写注册表失败，我真是无语了，我都是超级管理员了为何写注册表还失败了？我本以为现在又凉了，没有想到运行 choco 命令正常输出了版本号，说明安装成功了！

解决运行

```
choco install visualstudio2017buildtools
```

来安装vs build tools，这个过程倒是很顺利，没有报错。之所以安装 2017 版本，是由于笔者之前电脑上就是用的 2017 版本，为了保险起见就用了这个版本。

剩下的就是来测试安装原生依赖包了，结果上来就失败了，找不到 python，提示这个错误

```
Can't find Python executable "python", you can set the PYTHON env variable.
```

我的电脑上原来有一个 python 2.7，先通过

```
npm config set python=d:\python27\python.exe
```

然后发现不管用。

将其从 .npmrc 中删除掉，接着尝试将 d:\python27\python.exe 添加入环境变量 PATH 中，不管用。

去掉刚才 PATH 中新增的 python.exe，创建一个新的环境变量 PYTHON ，赋值为 d:\python27\python.exe，不管用。

不过在慌乱之中，我从 windows store 上安装了 python3，从目前看运行 node-gyp 时，运行的是 python3 版本，然后可以编译代码了。

> 微软从来都没有让人好好使用命令行的基因，一个全新的操作系统中有 python.exe，运行的时候却打开 windows store 让人手动安装。 编译程序，我们用命令行就够了，却非要我们装 vs studio，这个巨大无比的桌面程序。