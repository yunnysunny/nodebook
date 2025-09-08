## A1 Node.js 好用工具介绍

工欲善其事必先利其器，Node 语言的发展离不开一帮优质第三方库。下面提到的各个包基本在书中没有提到，属于查漏补缺，这里仅仅是列一个清单，供大家查阅。

### A1.1  log.io

可以在浏览器中实时监控服务器的日志的一个库。

<http://logio.org/>

```
npm config set unsafe-perm true 
npm install -g --prefix=/usr/local log.io
log.io server start

http://localhost:8998
```

### A1.2 socket.io

websocket给前端带来了变革，从此前端也可以光明正大的用上长连接，socket.io正是顺应此时势而生的的。它在高版本浏览器上使用 websocket ， 在低版本浏览器上使用 ajax 轮询，保证对所有浏览器的兼容。虽然本书没有对其拿出专门的章节进行介绍，但是它真的很重要。

<https://socket.io/>

```
npm install socket.io
```

### A1.3 npm-check-updates

`npm-check-updates` 是一个检查并升级 `package.json` 中依赖版本号的工具。它不安装包，只修改 package.json，实际安装仍需你运行 `npm install` / `pnpm install` / `yarn install`，- 支持交互式选择、过滤依赖类型、指定升级策略等。

可以全局安装 `npm-check-updates`

```bash
npm install npm-check-updates -g 
```

然后在项目目录中运行 `npx ncu` ，可以查看当前项目可以升级的包列表，但是不会做任何修改；运行 `npx ncu -u` 会修改 package.json，但是不会做安装动作；运行 `npx ncu -i` 会出现交互式选择界面，使用空格键可以对指定包做选择或者取消选择，使用方向键来选择某个指定包，选择完成后回车会提示你是否现在安装。

### A1.4 depcheck

`depcheck` 帮你扫描项目中「未使用」的依赖和「缺失」的依赖，保持 `package.json` 干净整洁。未使用的依赖，会导致你的项目臃肿，甚至会影响打包的体积；缺失的依赖有可能导致在生产环境中由于只安装了生产依赖，很有可能导致缺失依赖导致程序启动报错。

程序使用很简单

```bash
npm install depcheck -g
```

之后在项目根目录直接运行 `depcheck` 命令即可，如果项目中有问题，会有如下输出：

```
Unused devDependencies
* @nestjs/schematics
* @types/jest
* @typescript-eslint/utils
* jest-junit
* source-map-support
* ts-loader
* tsconfig-paths
Missing dependencies
* @opentelemetry/sdk-trace-base: .\src\instrumentation.ts
```

有一些 `devDependencies` 是开发工具用到的，项目源代码中没有直接引用，所以会被暴漏出来，所以不要着急将它们移除。`dependencies` 中的缺失依赖是我们应该重点关注的。