#KVM.js模块管理器(v0.0.3)
带给你不一样的模块管理体验

#API接口

###KVM.module

 * KVM.module.define 定义模块
    这里，全局define也可以定义模块
```
    define([dep1,dep2,....],function(dep1,dep2,...){ //定义匿名模块
      
    })
    define([dep1,dep2,....,function(dep1,dep2,...){ //定义匿名模块,angular风格
      
    }])
    define(function(dep1,dep2,...){ //定义匿名模块,无依赖
      
    })
    定义id模块，id就是模块路径
    define(id,后面的和匿名定义模块一样)
    
    定义注入的依赖
    
    define(id,deps,facotry,injectors)
    
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
           }]
        }
     },
     alias:{//路径别名，就是为了懒人准备的
        player:"./modules/Player"//这样映射后每次依赖的时候就不需要每次都使用长长的路径id了
     }
  }
```
 
 * KVM.module.data 返回当前配置
```
  KVM.module.data(name);如果name为空返回所有配置，如果name不为空则返回相应的配置项
```

###KVM.isArray 判断是否是数组
 

###KVM.isString 判断是否是字符串


###KVM.isObject 判断是否是对象，这个对象不包括数组


###KVM.isFunction 判断是否是函数


###KVM.isBoolean 判断是否是布尔值


###KVM.isReference 判断是否是引用类型


###KVM.isValue 判断是否是值类型


###KVM.isEmpty 判断对象是否为空，可以判断数组也可以判断对象


###KVM.guid 获取一个唯一的guid值


###KVM.unique 对数组去重


###KVM.toArray 转换为数组


###KVM.bind 函数上下文绑定
```
var obj = {
    name:"hello world"
};
function fun(param){
    console.log(param+this.name);
}
kvm.bind(fun,obj)("janry,");

//output janry,hello world

```

###KVM.forEach 遍历，可以遍历数组，也可以遍历对象
```
kvm.forEach(arr,function(item,key){

},function(){//如果arr的类型不是数组或者数组长度为0会触发该回调

})

```

###KVM.merge 合并对象，类似jquery的extend,支持深度合并也支持浅合并，深度合并只需要第一个参数设置为true


###KVM.copy 复制对象，可以通过回调动态的设置哪些属性浅拷贝，哪些属性深拷贝
```
kvm.copy(isDeep/*可选*/,source/*源对象*/,callback/*筛选回调，参数：item,key,path*/)
如果 callback 返回true，而且设置了isDeep为true，则对于某个属性是深度拷贝，否则是浅拷贝
```
###$class 类构造器

###$emitter 事件分发器
