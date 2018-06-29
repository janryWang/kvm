<img src="https://raw.githubusercontent.com/janryWang/kvm/master/logo.png" width="499" height="260" alt="KVM.js 模块管理器(v0.0.3)">

KVM.js 模块管理器(v0.2.0),带给你不一样的模块管理体验

支持AMD,CMD规范，支持依赖注入，支持插件式加载脚本

>如果你需要做一个浏览器书签，或者chrome插件，或者第三方组件，对于嵌入到对方网站上的情况，
>你不能保证对方是否已经存在有你所依赖的相关库，这样就可能存在浪费资源的情况，所以我添加了冲突检测机制
>使得该加载器更加智能化

#bower安装

[![Greenkeeper badge](https://badges.greenkeeper.io/janryWang/kvm.svg)](https://greenkeeper.io/)

```
bower install kvm
```

 
#更新日志

v0.2.0
===
* 修复commonjs在safari下的性能问题
* ES6重构，兼容至IE9
* 将插件全部作为独立包
* 支持在路径中直接添加querystring或者hashstring来作为版本迭代指令或者第三方插件指令

v0.1.5
===
* 重构，将内部模块解耦,以Promise为核心，可通过模块返回Promise对象来延迟加载依赖
* 依赖可以依赖css，在querystring中使用media="xxxx"可以控制响应式样式表范围
* 添加了插件模式，可以随意的给kvm添加各种插件

v0.1.0
===

* 已做添加包管理机制
* 已添加cmd规范支持
* 性能提升，实测为requirejs的2倍多
* 因为维护时间有限，已经放弃mini版本的维护，非常抱歉.


#API接口

KVM.module

 * KVM.module.define 定义模块,这里，全局define也可以定义模块
    
```
    define([dep1,dep2,....],function(dep1,dep2,...){ //定义匿名模块
      
    })
    define([dep1,dep2,....,function(dep1,dep2,...){ //定义匿名模块,angular风格
      
    }])
    define(function(){ //定义匿名模块,无依赖
      
    })
    define(["require","exports","module"],function(require,exports,module){//commonjs风格
        var depA = require("depA");

        module.exports = function(){
           return depA.fun();
        };

        or

        exports.fun = function(){
            return depA.fun();
        };
    })
    定义id模块，id就是模块路径
    define(id,后面的和匿名定义模块一样)
    
    定义注入的依赖
    
    define(id,deps,facotry,injectors)

    injectors的规范：
        {
          module_id:[dep1,dep2,dep3,...,fucntion(dep1,dep2,dep3){//这里可以是数组也可以是函数，随便你怎样搞

          }]
        }
    
```

 * KVM.module.invoke 调用模块
 
```
    KVM.module.invoke('{module id}',injectors) //调用模块，可以指定模块路径，injectors是临时注入的依赖，同时它也能依赖其他模块
    KVM.module.invoke([dep1,dep2,...,function(dep1,dep2,...){ //调用匿名模块，通常用于临时将某些依赖合并使用
    
    }],injectors);

    injectors的规范：
    {
      module_id:[dep1,dep2,dep3,...,fucntion(dep1,dep2,dep3){//这里可以是数组也可以是函数，随便你怎样搞
      
      }]
    }
    
    invoke调用后返回的结果是一个promise对象，所以通过then可以获得模块的实例
    
```

 * KVM.module.use 使用某一模块，功能单一，没有注入依赖的功能
 
```
    KVM.module.use('id',function(instance){//仅仅只能使用id来调用，不能像invoke一样调用一个匿名工厂
    
    });
    
```
 
 * KVM.module.config 参数配置
 
```
  KVM.module.config(options);
  
  options = {
     baseUrl:"",//项目基础路径，这个对于按需加载应用来说是必须要配置
     shims:{//模块包装器，主要是为了兼容第三方模块
        angular:{
           url:"",
           facotry:[deps,function(){//这里定义facotry可以是数组也可以是函数，随便你怎样搞
              return angular
           }],
           exports:"$"//该字段针对于注入到全局作用域的第三方组件的组件名，可以用其替代factory，也能自动检测冲突，比如该例子，如果$存在于全局域中，系统就不会再请求脚本了
        }
     },
     vars:{
        mod:"./modules",
        hello:"{mod}/hello"//变量中可以互相重用
     },
     alias:{//路径别名，就是为了懒人准备的
        player:"{mod}/Player"//这样映射后每次依赖的时候就不需要每次都使用长长的路径id了,同时还支持别名路径的重用,通过使用{}语法来链接vars中的属性
     },
     packages:{//包管理机制
        packageName:{
            url:""//包路径
        }
     }
  }
```
 
 * KVM.module.data 返回当前配置
 
```
  KVM.module.data(name);如果name为空返回所有配置，如果name不为空则返回相应的配置项
  
```

KVM.isArray 判断是否是数组
 

KVM.isString 判断是否是字符串


KVM.isObject 判断是否是对象，这个对象不包括数组


KVM.isFunction 判断是否是函数


KVM.isBoolean 判断是否是布尔值


KVM.isReference 判断是否是引用类型


KVM.isValue 判断是否是值类型


KVM.isEmpty 判断对象是否为空，可以判断数组也可以判断对象


###内置模块接口


####$emitter 事件分发器

```
var event = new $emitter(cache/*外部缓存事件队列*/);

event.$on(“eventName”,callback) 注册事件

event.$emit("eventName",param1,param2,....) 触发事件

event.$remove("eventName",callback) 删除事件

event.$one("eventName",callback) 注册事件，对于一个事件名只能注册一个事件处理器

```

###插件接口

```

kvm.module.registerPlugin(function(interface){
    ....
});

这是相关暴露出来的插件接口

let PluginInterface = {
	registerModuleParser: Module.registerModuleParser,//用于模块解析，参造commonjs插件

	registerDriverLoader: Driver.registerDriverLoader,//用于各种加载驱动程序
	registerDriverLoaded: Driver.registerDriverLoaded,//驱动加载后的回调
	registerDriverBeforeLoad: Driver.registerDriverBeforeLoad,//驱动加载前的回调

	registerFileExtParser: Path.registerFileExtParser,//文件后缀解析器
	registerPathParser: Path.registerPathParser,//路径解析器
	registerPathMaper: Path.registerPathMaper,//路径映射解析器

	createModule: Module.createModule,//创建一个模块
	createPath: Path.createPath//创建一个path
};

```
