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
**代码 10.2.1** 

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

**代码 10.2.2 hello.cc**

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

**配置文件 10.2.1**

> [gyp](https://gyp.gsrc.io/) （**G**enerate **Y**our **P**roject）是一种跨平台的项目构建工具，是谷歌员工在开发 [chromium](https://www.chromium.org/) 项目时衍生出来的工具。Node.js 扩展说白了也是基于 V8 的 API 基础上的，所以它也采用 gyp 技术。

编写完成之后在 hello.cc 目录下运行命令行 `node-gyp configure` ，成功之后会生成一个 build 文件夹，里面包含当前代码生成的 c++ 编译用文件。接着运行 `node-gyp build` 就能生成扩展包了。

编译成功后，我们就可以在 js 代码中引用这个扩展库了：

```javascript
// hello.js
const addon = require('./build/Release/addon');

console.log(addon.hello());
// Prints: 'world'
```

**代码 10.2.3 hello.js**

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

**代码 10.2.4 hello.cc 的 nan 版**

可以看到和**代码10.2.2**相比**代码10.2.4**要简洁不少，这里 NAN_METHOD(Method) 经过宏定义解析为 `void Method(const Nan::FunctionCallbackInfo<v8::Value>& info)`，所以你看到在函数 `Method` 内部会有一个 info 对象，能够在编译的时候被正确识别。同时宏定义 NAN_MODULE_INIT(Init) 会被转化为 `void Init(v8::Local<v8::Object> target)` 所以你会在函数内部看到一个 target 对象。同时**代码 10.2.2** 第13行中 `Isolate* isolate = args.GetIsolate();` 这个代码在函数 `NaN::New<String>` 中被封装在其内部，所以在**代码 10.2.4** 中没有看到这段代码。

###  10.3 映射 C++ 类

C++ addone 最精髓的地方，就是将 一个 JavaScript 类映射为一个 C++ 类，这样就会产生一个有趣的效果，你通过 new 构建的 js 对象，它的成员函数都被映射成 C++ 类中的成员函数。

下面举的例子可能可能看上去很傻，因为我们又写 对 `a+b` 求值的函数了，但是这种很天真的代码最好理解不过了。注意，这个例子改写自项目 [node-addon-examples](https://github.com/nodejs/node-addon-examples)  中的 [object_wrap](https://github.com/nodejs/node-addon-examples/tree/master/6_object_wrap/nan) 小节。首先是 C++ 头文件定义：

```c++
#ifndef MY_CALC_H
#define MY_CALC_H

#include <nan.h>

class MyCalc : public Nan::ObjectWrap {
public:
    static void Init(v8::Handle<v8::Object> module);
private:
    explicit MyCalc(double value=0);
    ~MyCalc();

    static NAN_METHOD(New);
    static NAN_METHOD(PlusOne);
    static NAN_METHOD(GetValue);
    static Nan::Persistent<v8::Function> constructor;
    double _value;
};

#endif
```

**代码 10.3.1 MyCalc.h**

首先注意的一点是，类 `MyCalc` 要继承自 `Nan::ObjectWrap` ，按照惯例这个类中还要有一个 Persistent 类型的句柄用来承载 js 类的构造函数，MyCalc 类中唯一对外公开的函数就是 Init，其参数 module 正是对应的是 Node 中的 module 对象。

```c++
#include "MyCalc.h"

Nan::Persistent<v8::Function> MyCalc::constructor;

MyCalc::MyCalc(double value): _value(value) {

}

MyCalc::~MyCalc() {

}

void MyCalc::Init(v8::Handle<v8::Object> module) {
    // Prepare constructor template
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);//使用ShmdbNan::New<Object>函数作为构造函数
    tpl->SetClassName(Nan::New<v8::String>("MyCalc").ToLocalChecked());//js中的类名为MyCalc
    tpl->InstanceTemplate()->SetInternalFieldCount(1);//指定js类的成员字段个数

    Nan::SetPrototypeMethod(tpl,"addOne",PlusOne);//js类的成员函数名为addOne,我们将其映射为 C++中的PlusOne函数
    Nan::SetPrototypeMethod(tpl,"getValue",GetValue);//js类的成员函数名为getValue,我们将其映射为 C++中的GetValue函数
    
    //Persistent<Function> constructor = Persistent<Function>::New/*New等价于js中的new*/(tpl->GetFunction());//new一个js实例
    constructor.Reset(tpl->GetFunction());
    module->Set(Nan::New<v8::String>("exports").ToLocalChecked(), tpl->GetFunction());
}

NAN_METHOD(MyCalc::New) {
    if (info.IsConstructCall()) {
        // 通过 `new MyCalc(...)` 方式调用
        double value = info[0]->IsUndefined() ? 0 : info[0]->NumberValue();
        MyCalc* obj = new MyCalc(value);
        obj->Wrap(info.This());
        info.GetReturnValue().Set(info.This());
    } else {
        // 通过 `MyCalc(...)` 方式调用, 转成使用构造函数方式调用
        const int argc = 1;
        v8::Local<v8::Value> argv[argc] = { info[0] };
        v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor);
        info.GetReturnValue().Set(cons->NewInstance(argc, argv));
    }
}

NAN_METHOD(MyCalc::GetValue) {
    MyCalc* obj = ObjectWrap::Unwrap<MyCalc>(info.Holder());
    info.GetReturnValue().Set(Nan::New(obj->_value));
}

NAN_METHOD(MyCalc::PlusOne) {
    MyCalc* obj = ObjectWrap::Unwrap<MyCalc>(info.Holder());
    double wannaAddValue = info[0]->IsUndefined() ? 1 : info[0]->NumberValue();

    obj->_value += wannaAddValue;
    info.GetReturnValue().Set(Nan::New(obj->_value));
}
```

**代码 10.3.2 MyCalc.cc**

注意到在 Init 函数中，定义了一个 js 类的实现，并且将其成员函数和 C++ 类的成员函数做了绑定，其中构造函数绑定为 New ，getValue 绑定为 GetValue，addOne 绑定为 PlusOne。Init 函数中的最后一行类似于我们在 js 中的 module.exports = MyCalc 操作。对于 C++ 函数 New GetValue PlusOne 来说，我们在定义的时候都使用了宏 NAN_METHOD，这样我们在函数内部就直接拥有了 info 这个变量，这个跟 **代码 10.2.4** 中的使用方法是一样的。

同时留意到在函数 GetValue 和 PlusOne 中，`MyCalc* obj = ObjectWrap::Unwrap<MyCalc>(info.Holder());`，这一句将 js 对象转化为 C++对象，然后操作 C++ 对象的属性。相反在 函数 New 中 `obj->Wrap(info.This());` 是一个相反的过程，将 C++ 对象转化为 js 对象。

### 10.4 使用线程池

前面几小节介绍了 Nan 的基本使用，可是即使使用了 C++ addon 技术，默认情况下，你所写的代码依然运行在 V8 主线程上，所以说在面对高并发的情况下，如果你的 C++ 代码是计算密集型的，它依然会抢占 V8 主线程的 CPU 时间，最严重的后果当然就是事件轮询的 CPU 时间被抢占导致整个 Node 处理效率下降。所以说釜底抽薪之术还是使用线程。

Nan 中提供了 AsyncWorker 类，它内部封装了 libuv 中的 uv_queue_work，可以在将计算代码直接丢到 libuv 的线程做处理，处理完成之后再通知 V8 主线程。

下面是一个简单的小例子：

```c++
#include <string>
#include <nan.h>
#include <sstream>

#ifdef WINDOWS_SPECIFIC_DEFINE
#include <windows.h>
typedef DWORD ThreadId;
#else
#include <unistd.h>
#include <pthread.h>
typedef unsigned int ThreadId;
#endif
using v8::Function;
using v8::FunctionTemplate;
using v8::Local;
using v8::Value;
using v8::String;

using Nan::AsyncQueueWorker;
using Nan::AsyncWorker;
using Nan::Callback;
using Nan::HandleScope;
using Nan::New;
using Nan::Null;
using Nan::ThrowError;
using Nan::Set;
using Nan::GetFunction;

NAN_METHOD(doAsyncWork);


static ThreadId __getThreadId() {
    ThreadId nThreadID;
#ifdef WINDOWS_SPECIFIC_DEFINE
    
    nThreadID = GetCurrentProcessId();
    nThreadID = (nThreadID << 16) + GetCurrentThreadId();
#else
    nThreadID = getpid();
    nThreadID = (nThreadID << 16) + pthread_self();
#endif
    return nThreadID;
}

static void __tsleep(unsigned int millisecond) {
#ifdef WINDOWS_SPECIFIC_DEFINE
    ::Sleep(millisecond);
#else
    usleep(millisecond*1000);
#endif
}


class ThreadWoker : public AsyncWorker {
    private:
        std::string str;
    public:
        ThreadWoker(Callback *callback,std::string str)
            : AsyncWorker(callback), str(str) {}
        ~ThreadWoker() {}
        void Execute() {
            ThreadId tid = __getThreadId();
            printf("[%s]: Thread in uv_worker: %d\n",__FUNCTION__,tid);

            __tsleep(1000);
            printf("sleep 1 seconds in uv_work\n");
            std::stringstream ss;
            ss << " worker function: ";
            ss << __FUNCTION__;
            ss << " worker thread id ";
            ss << tid;
            str += ss.str();
        }
        void HandleOKCallback () {
            HandleScope scope;

            Local<Value> argv[] = {
                Null(),
                Nan::New<String>("the result:"+str).ToLocalChecked()
            };

            callback->Call(2, argv);
        };
};


NAN_METHOD(doAsyncWork) {
    printf("[%s]: Thread id in V8: %d\n",__FUNCTION__,__getThreadId());
    if(info.Length() < 2) { 
        ThrowError("Wrong number of arguments"); 
        return info.GetReturnValue().Set(Nan::Undefined());
    }
  
  
    if (!info[0]->IsString() || !info[1]->IsFunction()) {
        ThrowError("Wrong number of arguments");
        return info.GetReturnValue().Set(Nan::Undefined());
    }
    
    //
    Callback *callback = new Callback(info[1].As<Function>());
    Nan::Utf8String param1(info[0]);
    std::string str = std::string(*param1); 
    AsyncQueueWorker(new ThreadWoker(callback, str));
    info.GetReturnValue().Set(Nan::Undefined());
}

NAN_MODULE_INIT(InitAll) {

  Set(target, New<String>("doAsyncWork").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(doAsyncWork)).ToLocalChecked());
}

NODE_MODULE(binding, InitAll)
```

**代码 10.4.1 async_simple.cc**

为了简单起见，将所有代码写到一个 c++ 文件中，注意到在**代码 10.4.1**中使用了自定义宏定义 `WINDOWS_SPECIFIC_DEFINE`，在 `binding.gyp` 中是支持添加自定义宏定义和编译参数的，下面是这个项目中用到的 `binding.gyp` 文件：

```
{
  'targets': [
    {
      'target_name': 'async-simple',
      'defines': [
        'DEFINE_FOO',
        'DEFINE_A_VALUE=value',
      ],
      "include_dirs" : [
            "<!(node -e \"require('nan')\")"
      ],
      'conditions' : [
            ['OS=="linux"', {
              'defines': [
                'LINUX_DEFINE',
              ],
              
              'libraries':[
                  '-lpthread'
              ],
              'sources': [ 'async_simple.cc' ]
            }],
            ['OS=="win"', {
              'defines': [
                'WINDOWS_SPECIFIC_DEFINE',
              ],
              'sources': [ 'async_simple.cc' ]
            }]
        ]
      
    }
  ]
}
```

**代码 10.4.2 binding.gyp**

`binding.gyp` 中的最外层的 `defines` 变量是全局环境变量，`conditions` 中可以放置各种条件判断，`OS=="linux"` 代表当前的操作系统是 linux，其下的 `defines` 下定义的宏定义，只有在 linux 系统下才起作用，所以在代码 10.4.1 中的环境变量 `WINDOWS_SPECIFIC_DEFINE` 只用在 windows 上才起作用，我们使用这个宏定义来做条件编译，以保证能够正确使用线程函数（其实libuv 中封装了各种跨平台的线程函数，这里不做多讨论）。

继续回到**代码 10.4.1**，类 ThreadWorker 中，函数 Execute 用来执行耗时函数，它将在 libuv 中的线程池中执行，函数 HandleOKCallback 在函数 Execute 执行完成后被调用，用来将处理结果通知 libuv 的事件轮询，它在 V8 主线程中执行。

最终给出测试用的 js 代码，又回到了我们熟悉的回调函数模式：

```javascript
var asyncSimple = require('./build/Release/async-simple');

asyncSimple.doAsyncWork('prefix:',function(err,result) {
    console.log(err, result);
});
```

**代码 10.4.3 addon.js**

### 10.5 代码

本章代码位于 https://github.com/yunnysunny/nodebook-sample/tree/master/chapter10

 