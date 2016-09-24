# 关于本书

这是一本关于 Node.js 技术的开放源码电子书，原书由台湾nodejs社区提供。感谢台湾nodejs社区的前辈提供这么优秀的教程，不过现在本书在台湾社区已经停止了维护，之前线上的观看地址http://book.nodejs.tw 也已关闭。为了让大家学习到这么优秀的教程，我决定将其复活，所以才有了这个项目。

本书的线上阅读网址，与 GitHub 资料同步更新。

<http://nodebook.whyun.com/>

本书适合 Node.js初学者至进阶开发者，也欢迎您在学习时一起参与本书内容撰写。


## 根目录结构

-   readme.md -&gt; 本书说明
-   text -&gt; 内含各章节详细资料
-   src -&gt; 范例程式码摆放位置

## 授权

**Node.js 台湾社群协作电子书**採用创用CC姓名标示-非商业性授权。
**您不必为本书付费。**

**Node.js Wiki Book** book is licensed under the
Attribution-NonCommercial 3.0 Unported license. **You should not have
paid for this book.**

您可以复制、散布及修改本书内容，但请勿将本书用于商业用途。

您可以在以下网址取得授权条款全文。

<http://creativecommons.org/licenses/by-nc/3.0/legalcode>

## 作者

本书由 Node.js Taiwan 社群成员协作，以下名单依照字母排序。

-   Caesar Chi (clonn)
-   Fillano Feng (fillano)
-   Kevin Shu (Kevin)
-   lyhcode <http://about.me/lyhcode>
-   yunnysunny <https://github.com/yunnysunny>

Node.js Taiwan是一个自由开放的技术学习社群，我们欢迎您加入一起学习、研究及分享。

## 源码

本书最新的源码（中文版）网址如下：

<http://github.com/yunnysunny/nodebook>

## 编译
本书使用[kitabu](https://github.com/fnando/kitabu)进行编译，`kitabu`是一个ruby模块，安装ruby需要保证系统的ruby版本在2.2.0及以上，不推荐在windows上安装使用，因为经过我的测试在windows上生成的pdf会出现乱码的情况。  
运行`gem install kitabu`安装kitabu，将本项目clone到任意目录，然后进入 `config` 文件夹，将 `kitabu.example.yml` 重命名为 `kitabu.yml`。接着进入clone到的目录运行`kitabu export`，运行完成后就会在output目录中找到`nodebook.html`，即为生成的网页版电子书。