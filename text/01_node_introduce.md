## 1 Node.js 简介

Node.js 是一个高性能、易扩充的网站应用程序开发框架 (Web Application Framework)。它诞生的原因，是为了让开发者能够更容易开发高延展性的网络服务，不需要经过太多复杂的调校、性能调整及程序修改，就能满足网络服务在不同发展阶段对性能的要求。

Ryan Dahl 是 Node.js 的催生者，目前任职于 Joyent主机托管服务公司。他开发 Node.js 的目的，就是希望能解决 Apache在连线数量过高时，缓冲区 (buffer)和系统资源会很快被耗尽的问题，希望能建立一个新的开发框架以解决这个问题。因此尝试使用性能十分优秀的V8 JavaScript Engine，让网站开发人员使用熟悉的 JavaScript语言，也能应用于后端服务程序的开发，并且具有出色的执行性能。

JavaScript 是功能强大的对象导向程序语言，但是在 JavaScript的官方规格中，主要是定义网页 (以浏览器为基础) 应用程序需要的应用程序界面(API)，对应用范围有所局限。为使 JavaScript 能够在更多用途发展， CommonJS规范一组标准函数库 (standard library)，使 JavaScript 的应用范围能够和Ruby 、 Python 及 Java 等语言同样丰富，并且能在不同的 CommonJS 兼容(compliant) JavaScript 执行环境中，使程序码具有可携性。

浏览器的 JavaScript 与实现 CommonJS 规范的 Node.js 有何不同呢？浏览器的JavaScript 提供 XMLHttpRequest，让程序可以和网页服务器建立资料传输连线，但这通常只能适用于网站开发的需求，因为我们只能用XMLHttpRequest 与网页服务器通讯，却无法利用它建立其他类型如 Telnet / FTP/ NTP 的服务器通讯。如果我们想开发网络服务程序，例如 SMTP电子邮件服务器，就必须使用 Sockets 建立 TCP (某些服务则用 UDP)监听及连线，其他程序语言如 PHP 、 Java 、 Python 、 Perl 及 Ruby等，在标准开发环境中皆有提供 Sockets API ，而浏览器的 JavaScript基于安全及贴近网站设计需求的考量下，并未将 Sockets列入标准函数库之中。而 CommonJS的规范就填补了这种基础函数库功能的空缺，遵循 CommonJS 规范的 Node.js可以直接使用 Sockets API 建立各种网络服务程序，也能够让更多同好基于JavaScript 开发符合 Node.js 的外挂模组 (Module)。

开发人员所编写出来的 Javascript脚本程序，怎么可能会比其他语言写出来的网络程序还要快上许多呢？以前的网络程序原理是将用户每次的连线(connection) 都开启一个执行绪(thread)，当连线爆增的时候将会快速耗尽系统性能，并且容易产生阻塞(block)。

Node.js 对于资源的调配有所不同，当程序接收到一笔连线(connection)，会通知作业系统透过epoll, kqueue,/dev/poll或select将连线保留，并且放入heap中配置，先让连线进入休眠(sleep) 状态，当系统通知时才会触发连线的callback。这种处理连线方式只会占用掉记忆体，并不会使用到CPU资源。另外因为采用JavaScript 语言的特性，每个 request 都会有一个callback，如此可以避免发生 block。

基于 callback 特性，目前 Node.js 大多应用于 Comet(long pulling) Request Server，或者是高连线数量的网络服务上，目前也有许多公司将 Node.js设为内部核心网络服务之一。在 Node.js 也提供了外挂管理 (Node package management)，让爱好 Node.js 轻易开发更多有趣的服务、外挂，并且提供到 npm让全世界用户快速安装使用。

本书最后执行测试版本为node.js v0.6.8，相关 API文档可查询<http://nodejs.org> 。本书所有范例均可于 Linux, Windows上执行，如遇到任何问题欢迎至<http://nodejs.tw>，询问对于 Node.js 相关问题。
