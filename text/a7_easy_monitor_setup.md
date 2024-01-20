## A7 easy-monitor 环境搭建

easy-monitor 是一个 alinode 的平替开源项目。

### A 7.1 准备环境

easy-monitor 需要 MySQL 和 redis 两个外部服务来存储数据和缓存。所以在开始配置之前起码需要准备一台 MySQL 和 redis。
为了方便使用，笔者将用到服务制作成了 docker 镜像，所以这里还需要用到 docker 运行环境。

### A 7.2 拓扑结构

easy-monitor 的组件比较复杂，所以需要先讲清楚其拓扑结构才能将其正确的部署。

![](images/easy_monitor_data_flow.drawio.png)

> 这里面 xtransit-server 是一个 websocket 服务器，其他两个服务是 http 服务器。xtransit-server 用来和 xtransit 进程建立长连接，xprofiler-console 服务用来提供管理后台，xtransit-mannager 用来处理性能日志数据。

> 虽然 xtransit 部分的功能，可以合并到应用服务代码中，但是这样有可能会干扰应用服务程序本身，所以这里给出拓扑图的时候，将其和应用服务进程分离开。

整个架构图中有两条数据流线，一条是日志收集数据流，一条是指令控制数据流。前者是将应用服务中采集到的性能指标日志发送到服务器端。后者是通过 console 控制台中发送生成 CPU Profile 或者堆快照的指令到应用程序中，同时还可以通过发送指令来命令 xtransit 进程将收集到日志文件上传到服务器端。

考虑到不同公司的网络拓扑结构会有不同，比如说有的公司内部所有服务之间网络是互通的，可以通过 IP 地址直接访问；但是有的公司会将公共服务单独隔离到一个子网中，外部必须通过网络边缘的反向代理服务器来访问。

对于需要配置反向代理服务器的情况，我们一般会选择使用 nginx，这种情况下，xtransit 进程会通过 nginx 来访问 xtransit-server 和 xprofiler-console 。下面只画出三者之间的拓扑结构：
![](images/easy_monitor_with_nginx_data_flow.drawio.png)
为了实现上图的拓扑结构，需要在 nginx 中配置不同的域名来实现反代到不同服务的目的。
### A 7.3 运行服务器端
#### A 7.3.1 数据库初始化

库 `xprofiler_console` 使用 [xprofiler-console/db/init.sql](https://github.com/X-Profiler/xprofiler-console/blob/master/db/init.sql) 进行初始化，库 `xprofiler_logs` 使用 [xtransit-manager/db/init.sql](https://github.com/X-Profiler/xtransit-manager/blob/master/db/init.sql) 以及 [xtransit-manager/db/date.sql](https://github.com/X-Profiler/xtransit-manager/blob/master/db/date.sql) 进行初始化。
> 使用 dbear 等工具的时候，新建完连接后，默认只能执行单条 SQL 语句，将上面的 SQL 代码全选复制到其控制台中执行时，会报语法错误。需要设置驱动属性的 `allowMultiQueries` 参数为 true ：![](images/allow_multi_sql.png)


这里需要注意的是，easy-monitor 后端服务使用的 MySQL 库是 [egg-mysql](https://github.com/eggjs/egg-mysql)，其最终是对 [mysql](https://github.com/mysqljs/mysql)的封装，但是这个库有一个缺陷，MySQL 8 默认使用的 caching_sha2_password 的鉴权方式，但是这个库不支持这种鉴权模式。所以在如果你使用的数据库是 MySQL 8 的话（使用 docker 创建的 MySQL 容器，默认版本就是 8.x 的版本），在不修改默认配置的情况下，得用超级管理员新建一个用户用来提供对 `xprofiler_console` 和 `xprofiler_logs` 两个库的访问：
```sql
CREATE USER 'easy'@'%' IDENTIFIED WITH mysql_native_password BY '********';
grant all privileges on xprofiler_console.* to 'easy'@'%';
grant all privileges on xprofiler_logs.* to 'easy'@'%';
flush privileges;
```
#### 7.3.2 启动服务器端
为了简化部署，笔者做了一个集成 xtransit-server xprofiler-console xtransit-mannager 三个服务的 docker 容器，是基于官方的 [all-in-one](https://github.com/X-Profiler/all-in-one) 项目优化而来。之所以重新做一个镜像出来，是由于官方镜像将配置信息采用磁盘文件映射的方式来提供，不是很贴合传统运维使用习惯，所以这里提供了一版全部通过环境变量来设置的镜像。
> 项目地址为 [whyun-docker/node (github.com)](https://github.com/whyun-docker/node)

由于牵扯到的环境变量比较多，所以这里直接给出一个 .env 文件：
```env
CONSOLE_MYSQL_HOST=mysql 访问 ip 或者域名
CONSOLE_MYSQL_PORT=mysql 端口号
CONSOLE_MYSQL_USER=mysql 用户名
CONSOLE_MYSQL_PASSWORD=mysql 密码
LOGS_MYSQL_HOST=mysql 访问 ip 或者域名
LOGS_MYSQL_PORT=mysql 端口号
LOGS_MYSQL_USER=mysql 用户名
LOGS_MYSQL_PASSWORD=mysql 密码
REDIS_SERVER=reidsIp1:redisPort1[,redisIp2:redisPort2]
REDIS_PASSWORD=redis 密码
CONSOLE_BASE_URL=console 服务的访问地址，例如 http://xxx-console.domian.com
```
然后我们可以通过 `sudo docker run --env-file ./.env -p 8443:8443 -p 8543:8543 -p 9190:9190 --name=easy-monitor -d yunnysunny/easy-monitor` 来启动服务。