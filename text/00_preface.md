## 前言

Node.js 是 JavaScript 后端开发语言。从诞生之初就备受关注，到如今说到最火的后端 Web 开发，Node 说自己是第二，没有人敢说他是第一。正是 Node 的兴起，还带动了前端 JS 的热度，react.js  vue.js 这些前端 JS 也火借东风，烧的很旺，甚至连“全栈”这个词也悄然登上了招聘启事的热搜关键字。也许我能够做的就是在这把大火里再添几把柴。

**声明**  
首先声明本电子书并不是本人创作，nodejs台湾协作电子书（源码参见[github地址](https://github.com/nodejs-tw/nodejs-wiki-book) ），是[台湾nodejs社区](http://nodejs.tw)发起的一套nodejs入门教程，本人初学nodejs之时，受其启发颇深。现在台湾社区的兄弟们对其已经停止维护，想想这么优秀的教程就这样白白流逝掉，是一件让人惋惜的事情的事情，于是乎我利用业余时间将其复活。

但是在整理的过程中发现了若干问题，首先繁体中文和简体中文的语言使用上还是有差别，之前耳熟能详的词语到了繁体中文中就变了个叫法，搞的自己差点摸不着头脑；其次，当时书籍写作的时候 Node 的版本还是0.6，如今时过境迁 Node 连6.0都出来了，好多知识点也发生了变化；最后，我也对原书的有些章节安排不是很满意。正是以上三点原因促成了我重写此书的决定。

线上预览地址：http://nodebook.whyun.com

本书github地址：https://github.com/yunnysunny/nodebook

同时欢迎大家提交pull request来完善文档内容。

**电子书下载**  
本书同时提供多种格式的电子书供下载：

- [pdf格式下载](https://www.gitbook.com/download/pdf/book/yunnysunny/nodebook "pdf下载")
- [epub格式下载](https://www.gitbook.com/download/epub/book/yunnysunny/nodebook "epub下载")
- [mobi格式下载](https://www.gitbook.com/download/mobi/book/yunnysunny/nodebook "mobi下载")


**阅读指引**

* 如果你之前有socket和多线程的编程经验，可以看第1章，没有上述经验的编程者也可以阅读此章，只不过在阅读过程中可能会遇到概念一时半会儿理解不了。
* 如果之前没有接触过 javascript 这门语言，可以从第2章开始阅读，第2章讲述了一些 javascript 的基础语法。
* 如果之前接触过 javascript ，但是没有接触过 Node.js ，可以从第3章开始阅读，第3章讲述了一些 Node.js 的基础 API。
* 如果之前接触过 Node.js ，但是没有用过数据库操作，可以阅读第5章，第5章讲述了 Node 中操作 redis 、mongodb 的 API 如何使用；如果没有使用 express ，可以阅读第6章和第7章，这两章讲述了如何利用 express 这个 HTTP 编程框架。
* 最后介绍一下一些独立章节，第4章讲述了 npm 命令的使用教程；第8章讲述了如何使用单元测试框架mocha；第9章讲述了一些线上环境的最佳实践，包括配置文件、进程管理、 docker 等内容；第10章讲述如何编写 c++ 扩展。