## 10 Node.js 的 c++ 扩展

Node 的优点是处理 IO 密集型操作，对于互联网应用来说，很大一部分内容都是 IO 处理（包括文件 IO和网络IO），但是还是有部分功能属于计算密集型操作。如果遇到这种计算密集型操作，推荐的解决方案是使用其他语言来实现，然后提供一个服务，让 Node 来进行调用。不过我们这章要讲的是 Node 的 C++ 扩展，也就是说，我们可以通过这种方式是 Node 代码直接 “桥接” 到 C++ 上，以此来解决计算密集型操作。但是我在前面为什么推荐使用其他语言来提供计算密集型的服务呢，因为一旦你的这个这个计算服务稍微一上规模，你的代码开发就要面临横跨两个语种的境况，给程序调试增加了很多不确定性。所以说，如果你要做的计算应用的功能比较单一的话，可以考虑做成 C++ 扩展。

Node 的 C++ 扩展功能是依赖于 V8 来实现的，但是在 Node 每次做大的版本升级的时候，都会有可能对应升级 V8 的版本，相应的扩展 API 的定义也很有可能发生变化，所以下面要重点介绍 nan 这个第三方包的，它提供了一系列的宏定义和包装函数，来对这些不同版本的扩展 API 进行封装。

### 10.1 准备工作
为了能够编译我们的 C++ 扩展，我们需要做一些准备工作，首先需要全局安装 [node-gyp](https://github.com/nodejs/node-gyp) 这个包：`npm install -g node-gyp`。不过此包还依赖于 python 2.7（必须得用2.7版本，安装3.0是不管用的）。同时需要安装 C++ 编译工具，在 linux 下需要使用 [GCC](https://gcc.gnu.org/)，Mac 下需要使用 [Xcode](https://developer.apple.com/xcode/download/)，Windows 下需要安装 [Visual Studio](https://www.visualstudio.com/products/visual-studio-community-vs) (版本要求是2015，低于此版本的不可以，高于此版本的作者本身没有做过测试)，大家可以选择安装社区版，因为专业版和旗舰版都是收费的，如果想进一步减小安装后占用磁盘的体积可以安装 [Visual C++ Build Tools](http://landinghub.visualstudio.com/visual-cpp-build-tools) 。按照官方说明在windows下安装完 Visual Stuido 和 node-gyp 后，还需要使用命令 `npm config set msvs_version 2015` 来指定 node-gyp 使用的 VS 版本。

> 不过经笔者测试发现，如果在 Windows 中同时安装了多个 VS 工具时， node-gyp 有可能使用错误的版本进行编译，笔者电脑上同时安装了 build tool 2015 和 vs 2012，编译的时候老是会选择使用 vs 2012，不得已将 vs 2012 卸载掉，但是依然报错，最后在 node-gyp 命令中添加参数 ` --msvs_version=2015` 才解决。

### 10.2 hello world
为了演示如何编译一个 C++ 扩展，我们从亘古不变的 hello world 程序入手，这个程序取自 Node [C++扩展的官方文档](https://nodejs.org/dist/latest-v6.x/docs/api/addons.html)。我们的目的是在 C++ 扩展中实现如下代码：

```javascript
exports.hello = () => 'world';
```
**代码 10.1.1** 

这看上去有些拿大炮打蚊子的味道，这段代码太简单了，而我们竟然要用 C++ 将其实现一番，是的这一节关注的并不是代码本身，还是如何使用工具进行编译，所以我们选择了最简单的代码。首先我们创建 hello.cc 文件：

```c++
// hello.cc
#include <node.h>

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
}

void init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
}

NODE_MODULE(addon, init)

}  // namespace demo
```

**代码 10.1.2 hello.cc**

然后创建 `binding.gyp` ，注意这里面的 target_name 属性要和 NODE_MODULE 宏定义中的第一个参数保持相同。

```json
{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "hello.cc" ]
    }
  ]
}
```

**配置文件 10.1.1**

> [gyp](https://gyp.gsrc.io/) （**G**enerate **Y**our **P**roject）是一种跨平台的项目构建工具，是谷歌员工在开发 [chromium](https://www.chromium.org/) 项目时衍生出来的工具。Node.js 扩展说白了也是基于 V8 的 API 基础上的，所以它也采用 gyp 技术。

编写完成之后在 hello.cc 目录下运行命令行 `node-gyp configure` ，成功之后会生成一个 build 文件夹，里面包含当前代码生成的 c++ 编译用文件。接着运行 `node-gyp build` 就能生成扩展包了。

编译成功后，我们就可以在 js 代码中引用这个扩展库了：

```javascript
// hello.js
const addon = require('./build/Release/addon');

console.log(addon.hello());
// Prints: 'world'
```

**代码 10.1.3 hello.js**

之前讲过本章的重点是使用 nan 这个包来实现扩展编写，所以我们就先拿这个 hello world 下手。首先是安装 nan 包：`npm install nan --save`。然后编写 hello.cc：

```c++
// hello.cc
#include <nan.h>

using namespace v8;

NAN_METHOD(Method) {
  info.GetReturnValue().Set(Nan::New<String>("world").ToLocalChecked());
}

NAN_MODULE_INIT (Init) {
  Nan::Export(target, "hello", Method);
}

NODE_MODULE(hello_nan, Init)
```

**代码 10.1.4 hello.cc 的 nan 版**

可以看到和**代码10.1.2**相比**代码10.1.4**要简洁不少，这里 NAN_METHOD(Method) 经过宏定义解析为 `void Method(const Nan::FunctionCallbackInfo<v8::Value>& info)`，所以你看到在函数 `Method` 内部会有一个 info 对象，能够在编译的时候被正确识别。同时宏定义 NAN_MODULE_INIT(Init) 会被转化为 `void Init(v8::Local<v8::Object> target)` 所以你会在函数内部看到一个 target 对象。