#KVM.js模块管理器(v0.0.3)
带给你不一样的模块管理体验

#API接口

KVM.module

 * KVM.module.define 定义模块,这里，全局define也可以定义模块
    
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
     vars:{
        mod:"./modules",
        hello:"{mod}/hello"//变量中可以互相重用
     },
     alias:{//路径别名，就是为了懒人准备的
        player:"{mod}/Player"//这样映射后每次依赖的时候就不需要每次都使用长长的路径id了,同时还支持别名路径的重用,通过使用{}语法来链接vars中的属性
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


KVM.guid 获取一个唯一的guid值


KVM.unique 对数组去重


KVM.toArray 转换为数组


KVM.bind 函数上下文绑定

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

KVM.forEach 遍历，可以遍历数组，也可以遍历对象

```
kvm.forEach(arr,function(item,key){

},function(){//如果arr的类型不是数组或者数组长度为0会触发该回调

})

```

KVM.merge 合并对象，类似jquery的extend,支持深度合并也支持浅合并，深度合并只需要第一个参数设置为true


KVM.copy 复制对象，可以通过回调动态的设置哪些属性浅拷贝，哪些属性深拷贝

```
kvm.copy(isDeep/*可选*/,source/*源对象*/,callback/*筛选回调，参数：item,key,path*/)

如果 callback 返回true，而且设置了isDeep为true，则对于某个属性是深度拷贝，否则是浅拷贝
```

#默认模块

####$do 一个json对象的操作工具，通过传入类似dsl语法命令对象来操作数据源

####API接口

1.$do作为构造函数

```

    new $do(data/*数据源*/,cmds/*命令对象*/);这样可以直接对对象中的数据进行各种操作
    
    or 
    
    var instance = new $do(data);
    instance.exec(cmds);
    
```

2.$do.exec 静态方法

```
   $do.exec(data,cmds,hook/*拥有输出的命令中所预留的回调*/);
   
```

支持的命令有：

1.直接操作对象引用的命令
 * $remove 删除对象中的某一元素
 
 ```
    var source = {
        name:"janry"
    }
    var cmds = {
        $remove:{
            name:true
        }
    }
    $do.exec(source,cmds);//删除name
 ```
 
 * $set 给对象某一属性设置值
 
 ```
     var source = {}
     var cmds = {
         $set:{
            name:"janry"
         }
     }
     $do.exec(source,cmds);//添加name
     
 ```
 
 * $push 给对象中的某个数组push一个值
 
  ```
      var source = {
         aa:[]
      }
      var cmds = {
         aa:{
            $push:{
                name:"janry",
                age:23
            }
         }
      }
      $do.exec(source,cmds);//给aa添加一个对象
      
  ```
  
 * $slice 将对象中的某个数组截取为某个子数组，注意，数组对象的操作都是直接对数据源的引用进行操作
 
 ```
       var source = {
          aa:[1,2,3,4,5]
       }
       var cmds = {
          aa:{
             $slice:[0,2]
          }
       }
       $do.exec(source,cmds);
       //output source = {aa:[1,2]};
      
 ```
 
 * $concat 将对象中的某个数组与新数组合并
  
 ```
       var source = {
          aa:[1,2,3,4,5]
       }
       var cmds = {
          aa:{
             $concat:[122,34]
          }
       }
       $do.exec(source,cmds);
       //output source = {aa:[1,2,3,4,5,122,34]};
      
 ```
   
 * $pop 弹出对象中某个数组的最后一个元素
 
 ```
        var source = {
           aa:[1,2,3,4,5]
        }
        var cmds = {
           aa:{
              $pop:true
           }
        }
        $do.exec(source,cmds);
        //output source = {aa:[1,2,3,4]};
        
 ```
 
 * $unshift 给对象中某个数组的头部插入一个值
 
 ```
        var source = {
           aa:[1,2,3,4,5]
        }
        var cmds = {
           aa:{
              $unshift:2333
           }
        }
        $do.exec(source,cmds);
        //output source = {aa:[233,,2,3,4,5]};
        
 ```
 
 * $sort 给对象中的某个数组进行排序
 
 
 ```
        var source = {
           aa:[{name:"janry",age:23},{name:"judicy",age:20}]
        }
        var cmds = {
           aa:{
              $sort:{
                age:"$desc"//按照age降序 $asc升序
              }
           }
        }
        $do.exec(source,cmds);
        
 ```
 
 * $merge 将对象中某个对象与一个新对象进行合并

 
 ```
        var source = {
           aa:{
              name:"janry"
           }
        }
        var cmds = {
           aa:{
              $merge:{
                age:23
              }
           }
        }
        $do.exec(source,cmds);
        
 ```
 

 * $deep_merge 将对象中某个对象与一个新对象进行深度合并
 
 
 ```
        var source = {
           aa:{
              name:"janry"
           }
        }
        var cmds = {
           aa:{
              $deep_merge:{
                age:23,
                home:{
                    city:"",
                    street:"",
                    call:""
                }
              }
           }
        }
        $do.exec(source,cmds);
        
 ```
 
 
2.存在输出的命令
 * $clone 拷贝某个对象
  
   $clone还存在子命令：$deep,$white_list,$black_list,$filter,$callback
  
 ```
        var source = {
           aa:{
              name:"janry"
           }
        }
        var cmds = {
          $clone:{
            $deep:true,//深度克隆
            $white_list:[],//深度克隆白名单，名单中的数据为某属性的路径，可以是a.a.a[3]这样的
            $black_list:[],//浅克隆白名单，如果两个名单冲突，黑名单优先级大
            $filter:function(val/*属性值*/,key/*属性名*/,path/*属性所在路径*/){
                //返回true代表深度clone,返回false代表浅clone
            },
            $callback:function(cp){//克隆成功后的回调，该回调恰好在静态方法传参的hook调用后执行
            
            }
          }
        }
        //对于clone,如果把$deep:false则没有深浅一说
        $do.exec(source,cmds);
        
 ```
 
 
 * $find 搜索对象中某个数组中的目标对象
 
   $find 也存在子命令：
   
   1.$gt 筛选集合中某一属性值字典顺序大于某指定字符串的值的对象
   
   2.$lt 筛选集合中某一属性值字典顺序小于某指定字符串的值的对象
   
   3.$is 筛选集合中某一属性值字典顺序等于某指定字符串的值的对象
   
   4.$not 筛选集合中某一属性值字典顺序不等于某指定字符串的值的对象
   
   5.$gte 筛选集合中某一属性值字典顺序大于等于某指定字符串的值的对象
   
   6.$lte 筛选集合中某一属性值字典顺序小于等于某指定字符串的值的对象
   
   7.$icontains 筛选集合中某一属性值不包含指定字符串的对象
   
   8.$contains 筛选集合中某一属性值包含指定字符串的对象
   
   9.$in 筛选集合中某一属性值存在于某一字符串数组的对象
   
   10.$not_in 筛选集合中某一属性值不存在于某一字符串数组的对象
   
   11.$and,$or 对于查询条件的逻辑操作符，可以用在与$is,$lt...等命令同级，也可以用在命令的内部级别
   
```
         var source = {
                   aa:[{name:"janry",age:23},{name:"judicy",age:20}]
         }
         var cmds = {
           aa:{
              $find:{//代表查询name等于janry或age不等于20的对象集合
                $is:{
                    name:"janry"
                },
                $or:true,
                $not:{
                    age:"20"
                }
              }
           }
         }
         $do.exec(source,cmds);

```
 
 * $foreach 遍历对象中的某个指定对象
 
```
         var source = {
                   aa:[{name:"janry",age:23},{name:"judicy",age:20}]
         }
         var cmds = {
           aa:{
              $foreach:function(val,key){
                .....
              }
           }
         }
         $do.exec(source,cmds);

```

####$class 类构造器

####API接口

```

创建一个类 var Person = $class({
    原型属性或方法
},{
    静态属性或方法
});

$class.inherit(subClass/*子类*/，parantClass/*父类*/,..../*支持多继承*/);//这里的继承拥有重写的功能，子类方法属性会重写父类的方法属性

对于实例对象可以通过this.$parant来访问其父对象，$parent是一个数组，上面保存着多个父类实例对象，构造函数中需要通过调用this.$super()来调用父类构造函数

$class.protocol({..methods..});//接口协议定义，该函数返回一个接口类，如果某类继承它的话，子类的方法必须重写该接口类的所有方法，否则会报错

```

####$emitter 事件分发器

####API接口

```
var event = new $emitter(cache/*外部缓存事件队列*/);

event.$on(“eventName”,callback) 注册事件

event.$emit("eventName",param1,param2,....) 触发事件

event.$remove("eventName",callback) 删除事件



```
