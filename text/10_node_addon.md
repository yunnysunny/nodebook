## 10 Node.js 的 c++ 扩展

Node 的优点是处理 IO 密集型操作，对于互联网应用来说，很大一部分内容都是 IO 处理（包括文件 IO和网络IO），但是还是有部分功能属于计算密集型操作。如果遇到这种计算密集型操作，推荐的解决方案是使用其他语言来实现，然后提供一个服务，让 Node 来进行调用。不过我们这章要讲的是 Node 的 C++ 扩展，也就是说，我们可以通过这种方式是 Node 代码直接 “桥接” 到 C++ 上，以此来解决计算密集型操作。但是我在前面为什么推荐使用其他语言来提供计算密集型的服务呢，因为一旦你的这个计算服务稍微一上规模，你的代码开发就要面临横跨两个语种的境况，给程序调试增加了很多不确定性。所以说，如果你要做的计算应用的功能比较单一的话，可以考虑做成 C++ 扩展。

Node 的 C++ 扩展功能是依赖于 V8 来实现的，但是在 Node 每次做大的版本升级的时候，都会有可能对应升级 V8 的版本，相应的扩展 API 的定义也很有可能发生变化，所以下面会首先介绍 [nan](https://www.npmjs.com/package/nan) 这个第三方包的，它提供了一系列的宏定义和包装函数，来对这些不同版本的扩展 API 进行封装。

### 10.1 准备工作

为了能够编译我们的 C++ 扩展，我们需要做一些准备工作，首先需要全局安装 [node-gyp](https://github.com/nodejs/node-gyp) 这个包：`npm install -g node-gyp`。同时需要安装 C++ 编译工具，在 linux 下需要使用 [GCC](https://gcc.gnu.org/)；Mac 下需要使用 [Xcode](https://developer.apple.com/xcode/download/)；Windows 下需要安装 [Visual Studio](https://www.visualstudio.com/products/visual-studio-community-vs) ，大家可以选择安装社区版，因为专业版和旗舰版都是收费的，如果想进一步减小安装后占用磁盘的体积可以安装 [Visual C++ Build Tools](https://visualstudio.microsoft.com/zh-hans/visual-cpp-build-tools/) ，详细的安装说明可以参见 [附 A6](https://nodebook.whyun.com/a6_node_native_addon_config)。

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
  args.GetReturnValue().Set(String::NewFromUtf8(
      isolate, "world").ToLocalChecked());
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

### 10.3 映射 C++ 类

C++ addon 最精髓的地方，就是将 一个 JavaScript 类映射为一个 C++ 类，这样就会产生一个有趣的效果，你通过 new 构建的 js 对象，它的成员函数都被映射成 C++ 类中的成员函数。

下面举的例子可能可能看上去很傻，因为我们又写 对 `a+b` 求值的函数了，但是这种很天真的代码最好理解不过了。注意，这个例子改写自项目 [node-addon-examples](https://github.com/nodejs/node-addon-examples)  中的 [object_wrap](https://github.com/nodejs/node-addon-examples/tree/master/6_object_wrap/nan) 小节。首先是 C++ 头文件定义：

```c++
#ifndef MY_CALC_H
#define MY_CALC_H

#include <nan.h>

class MyCalc : public Nan::ObjectWrap {
public:
    static void Init(v8::Local<v8::Object> module);
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

首先注意的一点是，类 `MyCalc` 要继承自 `Nan::ObjectWrap` ，按照惯例这个类中还要有一个 Persistent 类型的句柄用来承载 js 类的构造函数，MyCalc 类中唯一对外公开的函数就是 Init，其参数 `module` 正是对应的是 Node 中的 module 对象。

```c++
#include "MyCalc.h"

Nan::Persistent<v8::Function> MyCalc::constructor;

MyCalc::MyCalc(double value): _value(value) {

}

MyCalc::~MyCalc() {

}

void MyCalc::Init(v8::Local<v8::Object> module) {
    v8::Local<v8::Context> context = module->CreationContext();
    Nan::HandleScope scope;

    // Prepare constructor template
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);//使用ShmdbNan::New<Object>函数作为构造函数
    tpl->SetClassName(Nan::New<v8::String>("MyCalc").ToLocalChecked());//js中的类名为MyCalc
    tpl->InstanceTemplate()->SetInternalFieldCount(1);//指定js类的成员字段个数

    Nan::SetPrototypeMethod(tpl,"addOne",PlusOne);//js类的成员函数名为addOne,我们将其映射为 C++中的PlusOne函数
    Nan::SetPrototypeMethod(tpl,"getValue",GetValue);//js类的成员函数名为getValue,我们将其映射为 C++中的GetValue函数

    constructor.Reset(tpl->GetFunction(context).ToLocalChecked());
    module->Set(context,
               Nan::New<v8::String>("exports").ToLocalChecked(),
               tpl->GetFunction(context).ToLocalChecked());
}

NAN_METHOD(MyCalc::New) {
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    if (info.IsConstructCall()) {
        // 通过 `new MyCalc(...)` 方式调用
        double value = info[0]->IsUndefined() ? 0 : info[0]->NumberValue(context).FromJust();
        MyCalc* obj = new MyCalc(value);
        obj->Wrap(info.This());
        info.GetReturnValue().Set(info.This());
    } else {
        // 通过 `MyCalc(...)` 方式调用, 转成使用构造函数方式调用
        const int argc = 1;
        v8::Local<v8::Value> argv[argc] = { info[0] };
        v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor);
        info.GetReturnValue().Set(cons->NewInstance(context, argc, argv).ToLocalChecked());
    }
}

NAN_METHOD(MyCalc::GetValue) {
    MyCalc* obj = ObjectWrap::Unwrap<MyCalc>(info.Holder());
    info.GetReturnValue().Set(Nan::New(obj->_value));
}

NAN_METHOD(MyCalc::PlusOne) {
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    MyCalc* obj = ObjectWrap::Unwrap<MyCalc>(info.Holder());
    double wannaAddValue = info[0]->IsUndefined() ? 1 : info[0]->NumberValue(context).FromJust();

    obj->_value += wannaAddValue;
    info.GetReturnValue().Set(Nan::New(obj->_value));
}
```

**代码 10.3.2 MyCalc.cc**

注意到在 `Init` 函数中，定义了一个 js 类的实现，并且将其成员函数和 C++ 类的成员函数做了绑定，其中构造函数绑定为 `New` ，`getValue` 绑定为 `GetValue`，`addOne` 绑定为 `PlusOne`。`Init` 函数中的最后一行类似于我们在 js 中的 `module.exports = MyCalc` 操作。对于 C++ 函数 `New` `GetValue` `PlusOne` 来说，我们在定义的时候都使用了宏 `NAN_METHOD`，这样我们在函数内部就直接拥有了 `info` 这个变量，这个跟 **代码 10.2.4** 中的使用方法是一样的。

同时留意到在函数 `GetValue` 和 `PlusOne` 中，`MyCalc* obj = ObjectWrap::Unwrap<MyCalc>(info.Holder());`，这一句将 js 对象转化为 C++对象，然后操作 C++ 对象的属性。相反在 函数 New 中 `obj->Wrap(info.This());` 是一个相反的过程，将 C++ 对象转化为 js 对象。

### 10.4 使用线程池

前面几小节介绍了 Nan 的基本使用，可是即使使用了 C++ addon 技术，默认情况下，你所写的代码依然运行在 V8 主线程上，所以说在面对高并发的情况下，如果你的 C++ 代码是计算密集型的，它依然会抢占 V8 主线程的 CPU 时间，最严重的后果当然就是事件轮询的 CPU 时间被抢占导致整个 Node 处理效率下降。所以说使用多线程在这种情况下会是一个更优解。

Nan 中提供了 `AsyncWorker` 类，它内部封装了 libuv 中的 `uv_queue_work`，可以在将计算代码直接丢到 libuv 的线程做处理，处理完成之后再通知 V8 主线程。

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

```json
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

`binding.gyp` 中的最外层的 `defines` 变量是全局环境变量，`conditions` 中可以放置各种条件判断，`OS=="linux"` 代表当前的操作系统是 linux，其下的 `defines` 下定义的宏定义，只有在 linux 系统下才起作用，所以在 **代码 10.4.1** 中的环境变量 `WINDOWS_SPECIFIC_DEFINE` 只用在 windows 上才起作用，我们使用这个宏定义来做条件编译，以保证能够正确使用线程函数（其实 libuv 中封装了各种跨平台的线程函数，这里不做多讨论）。

继续回到 **代码 10.4.1**，类 `ThreadWorker` 中，函数 `Execute` 用来执行耗时函数，它将在 libuv 中的线程池中执行，函数 `HandleOKCallback` 在函数 `Execute` 执行完成后被调用，用来将处理结果通知 libuv 的事件轮询，它在 V8 主线程中执行。

最终给出测试用的 js 代码，又回到了我们熟悉的回调函数模式：

```javascript
var asyncSimple = require('./build/Release/async-simple');

asyncSimple.doAsyncWork('prefix:',function(err,result) {
    console.log(err, result);
});
```

**代码 10.4.3 addon.js**

### 10.5 N-API

Node 的 C++ addon 直接调用 V8 API 来完成原生代码和 JavaScript 的桥接工作，但是 V8 的 API 每年都几乎有大的版本升级，从而可能导致若干的数据类型或者函数被删除掉，这样就不得不迫使 addon 的开发者去升级他们的代码，以适应新版本的改动。Node 从 12.x 开始使用 7.x 版本的 v8，这个版本对于废弃 API 做了很多的删除，就导致了各个使用 addon 项目的社区一片哀鸿（具体可以参见这个 [issue](https://github.com/nodejs/node/issues/23122)）。

> Node 12 开始，删除了 `V8:Handle`，需要使用 v8::Local 替代；删除了 `Local<Value>::ToString`，需要替换为 `MaybeLocal<String>::ToString(Local<Context>)` ，与此类似的还有  Value 类上的各种转化函数；删除了非 Maybe 版本的 `FunctionTemplate::GetFunction` `Function::New` `Function::Call` 等函数，需要在调用这些函数的时候传递 `Local<Context>` 参数以使用 Maybe 版本的 API。

从 Node 10.x 开始，worker 线程的 API 被引入，这样导致一个问题，就是 c/c++ 中的静态变量，在整个进程中是共享的，而引入多线程机制后，这些静态变量可能会被多个线程读写，从而导致进程崩溃。Node 官方为此为 addon 提供了上下文感知功能。

**代码 10.2.2** 中，为了导出 C++ 函数，使用了 `NODE_MODULE` 这个宏定义，与其对应的上下文感知版本的宏定义是 `NODE_MODULE_INIT`，这个宏定义仅仅是将以下内容缩写成了一行，便于大家少写代码：

```c++
extern "C" NODE_MODULE_EXPORT void
NODE_MODULE_INITIALIZER(Local<Object> exports,
                        Local<Value> module,
                        Local<Context> context)
```

所以可以看出来使用宏定义 `NODE_MODULE_INIT`，你还需要自己编写函数体，这样才是一个完整的符合语法要求的代码块。那么这个函数体内应该写什么呢，你可以将你代码中牵扯到静态变量的清理的代码全都抽离到这个代码块中。当然你也可以使用原来的 `NODE_MODULE` 宏，在需要添加清理的地方，给自己的代码下桩，不过这个样子会让自己的代码显得比较混乱。下面的代码改编自是官方给出的[例子]()：

```c++
// addon.cc
#include <node.h>
#include <assert.h>
#include <stdlib.h>

using node::AddEnvironmentCleanupHook;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::Object;

// Note: In a real-world application, do not rely on static/global data.
static char cookie[] = "yum yum";
static int cleanup_cb1_called = 0;
static int cleanup_cb2_called = 0;

static void cleanup_cb1(void* arg) {
  Isolate* isolate = static_cast<Isolate*>(arg);
  HandleScope scope(isolate);
  Local<Object> obj = Object::New(isolate);
  assert(!obj.IsEmpty());  // assert VM is still alive
  assert(obj->IsObject());
  cleanup_cb1_called++;
}

static void cleanup_cb2(void* arg) {
  assert(arg == static_cast<void*>(cookie));
  cleanup_cb2_called++;
}

static void sanity_check(void*) {
  assert(cleanup_cb1_called == 1);
  assert(cleanup_cb2_called == 1);
}

void Method(const v8::FunctionCallbackInfo<v8::Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(v8::String::NewFromUtf8(
      isolate, "world").ToLocalChecked());
}

// Initialize this addon to be context-aware.
NODE_MODULE_INIT(/* exports, module, context */) {
  Isolate* isolate = context->GetIsolate();

  AddEnvironmentCleanupHook(isolate, sanity_check, nullptr);
  AddEnvironmentCleanupHook(isolate, cleanup_cb2, cookie);
  AddEnvironmentCleanupHook(isolate, cleanup_cb1, isolate);
  NODE_SET_METHOD(exports, "hello", Method);
}
```

**代码 10.5.1**

从上述代码上看，使用流程还是略显复杂的。`AddEnvironmentCleanupHook` 函数原型是

```c++
void AddEnvironmentCleanupHook(v8::Isolate* isolate,
                               void (*fun)(void* arg),
                               void* arg);
```

第 2 个参数是一个回调函数，第 3 个参数是传递给回调函数的参数，也就是被清理对象的指针。这些调用 `AddEnvironmentCleanupHook` 时传递的回调函数，会按照后进先出的顺序，在加载当前扩展的线程退出之前被执行，所以 **代码 10.5.1** 中三个回调函数的执行顺寻为 `cleanup_cb1` `cleanup_cb2` `sanity_check`。由于例子中给的静态变量都是在栈上申请的内存，所以在三个回调函数中没有写其销毁函数，如果你的静态变量的类型是句柄的话，需要调用其清理函数，完成对于句柄指向的对象的清理动作，对于代码 10.3.2 来说，就要在函数 `MyCalc::Init` 中添加如下代码：

```c++
node::AddEnvironmentCleanupHook(isolate, [](void*) {
    constructor.Reset();
}, nullptr);
```

Node 社区本身不维护 V8，对于 V8 的 API 变更只能采取跟随策略，所以每次 V8 有大的变动，都会伤筋动骨，所以 Node 从 8.x 开始引入了 N-API 的接口。它对于 V8 API 进行一次抽象，在其基础上又封装了一层，保证基于 N-API 开发的代码在 V8 API 发生变动的时候，可以保持不用更改。虽然 N-API 本身也会历经版本变动，但是总体上比 V8 的变动要小。下面是一个 N-API 的 hello world 程序，代码来自官方文档：

```c++
// hello.cc using Node-API
#include <node_api.h>

namespace demo {

napi_value Method(napi_env env, napi_callback_info args) {
  napi_value greeting;
  napi_status status;

  status = napi_create_string_utf8(env, "world", NAPI_AUTO_LENGTH, &greeting);
  if (status != napi_ok) return nullptr;
  return greeting;
}

napi_value init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value fn;

  status = napi_create_function(env, nullptr, 0, Method, nullptr, &fn);
  if (status != napi_ok) return nullptr;

  status = napi_set_named_property(env, exports, "hello", fn);
  if (status != napi_ok) return nullptr;
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)

}  // namespace demo
```

**代码 10.5.2**

N-API 的 API 设计符合如下风格：

所有的 N-API 的调用的返回值都是 `napi_status` 类型，如果返回值为 `napi_ok`，则代表调用成功。

 你需要使用指针来承载你要返回的数据内容，比如说 **代码 10.5.2** 中第 10 行，通过函数 `napi_create_string_utf8` 来获取一个 JavaScript 字符串时，需要在最后一个参数位传递变量 `greeting` 的指针。

所有的 JavaScript 类型，在 N-API 中都是 `napi_value` 类型。

最后一条，由于 N-API 的调用返回值是 `napi_status` 类型，它是一个枚举类型，如果想获取具体的错误描述信息，可以调用 `napi_get_last_error_info` 函数来完成。不过在 N-API 的调用返回值为非 `napi_ok` 的情况下，还有可能函数内部会抛出异常，可以通过函数 `napi_is_exception_pending` 来判断当前调用是否会产生异常。下面是一个使用示例：

```c++
// addon.h
#ifndef _ADDON_H_
#define _ADDON_H_
#include <js_native_api.h>
napi_value create_addon(napi_env env);
#endif  // _ADDON_H_
```

**代码 10.5.3**

```c++
// addon.c
#include "addon.h"

#define NAPI_CALL(env, call)                                      \
  do {                                                            \
    napi_status status = (call);                                  \
    if (status != napi_ok) {                                      \
      const napi_extended_error_info* error_info = NULL;          \
      napi_get_last_error_info((env), &error_info);               \
      const char* err_message = error_info->error_message;        \
      bool is_pending;                                            \
      napi_is_exception_pending((env), &is_pending);              \
      if (!is_pending) {                                          \
        const char* message = (err_message == NULL)               \
            ? "empty error message"                               \
            : err_message;                                        \
        napi_throw_error((env), NULL, message);                   \
        return NULL;                                              \
      }                                                           \
    }                                                             \
  } while(0)

static napi_value
DoSomethingUseful(napi_env env, napi_callback_info info) {
  // Do something useful.
  return NULL;
}

napi_value create_addon(napi_env env) {
  napi_value result;
  NAPI_CALL(env, napi_create_object(env, &result));

  napi_value exported_function;
  NAPI_CALL(env, napi_create_function(env,
                                      "doSomethingUseful",
                                      NAPI_AUTO_LENGTH,
                                      DoSomethingUseful,
                                      NULL,
                                      &exported_function));

  NAPI_CALL(env, napi_set_named_property(env,
                                         result,
                                         "doSomethingUseful",
                                         exported_function));

  return result;
}
```

**代码 10.5.4**

```c++
// addon_node.c
#include <node_api.h>
#include "addon.h"

NAPI_MODULE_INIT() {
  // This function body is expected to return a `napi_value`.
  // The variables `napi_env env` and `napi_value exports` may be used within
  // the body, as they are provided by the definition of `NAPI_MODULE_INIT()`.
  return create_addon(env);
}
```

**代码 10.5.5**

### 10.6 代码

本章代码位于 https://github.com/yunnysunny/nodebook-sample/tree/master/chapter10

### 参考资料

- V8 API Changes https://docs.google.com/document/d/1g8JFi8T_oAE_7uAri7Njtig7fKaPDfotU6huOa1alds