!(function(global){


var TYPES = "Function,String,Array,Object,Number,Boolean".split(",");
var hasOwnProperty = Object.prototype.hasOwnProperty;


for (var i = 0; i < TYPES.length; i++) {
	eval('function is' + TYPES[i] + '(val){return _type(val) === "[object ' + TYPES[i] + ']"};');
}

function _type(val) {
	return Object.prototype.toString.call(val);
}

/**
 * 判断某对象是否为引用类型
 * @param val
 * @returns {*}
 */

function isReference(val) {
	return isArray(val) || isObject(val);
}


/**
 * 将类似数组的对象转换为数组
 * @returns {Array.<T>}
 */
function toArray() {
	var args;
	args = [].slice.apply(arguments);
	return [].slice.apply(args[0], args.slice(1));
}


/**
 * 遍历对象
 * @param arr 需要遍历的对象，可以是哈希对象也可以是数组
 * @param callback 回调函数
 * @param faild 回调函数
 * @returns {Array} 索引数组
 */
function forEach(arr, callback, faild) {
	var index,
		keys,
		keys_length,
		_results;
	if (!isFunction(callback)) {
		return;
	}
	if (isReference(arr)) {
		keys = Object.keys(arr);
		keys_length = keys.length;
		index = 0;
		_results = [];
		if (keys_length == 0) {
			if (isFunction(faild)) {
				faild();
			}
		}
		while (index < keys_length) {
			if (callback(arr[keys[index]], keys[index]) === false) {
				break;
			}
			_results.push(index++);
		}
		return _results;
	} else {
		if (isFunction(faild)) {
			faild();
		}
	}
}


/**
 * 合并对象，可以深度合并也可以浅合并
 * target,[source_1,...source_n]
 * @returns {*}
 */
function merge() {
	var args,
		args_length,
		isDeep = false,
		isCover = true,
		callback;
	args = toArray(arguments);
	if (isBoolean(args[0])) {
		isDeep = args[0];
		args = args.slice(1);
	}
	if(isFunction(args[args.length - 1])){
		callback = args[args.length - 1];
		args.pop();
	}
	if(isBoolean(args[args.length - 1])){
		isCover = args[args.length - 1];
		args.pop();
	}
	args_length = args.length;
	if (args_length < 2) {
		return args[0];
	}
	if (args_length === 2) {
		forEach(args[1],
			function (item, name) {
				if(isFunction(callback)) callback(name,args[0],args[1]);
				if (args[1][name] !== undefined && args[1][name] !== null) {
					if(!isCover) {
						if (!args[0][name]) {
							args[0][name] = args[0][name] || args[1][name].constructor();
							if (isDeep && isReference(item)) {
								merge(isDeep, args[0][name], item,isCover,callback);
							} else {
								args[0][name] = item;
							}
						}
					} else {
						args[0][name] = args[0][name] || args[1][name].constructor();
						if (isDeep && isReference(item)) {
							merge(isDeep, args[0][name], item,isCover,callback);
						} else {
							args[0][name] = item;
						}
					}
				}
			});
		return args[0];
	} else {
		return merge(isDeep, args[0], merge.apply(null, [isDeep].concat(args.slice(1))));
	}
}

function inherit(subClass,parentClass){
	subClass.prototype.$super = function (){
		merge(this,parentClass.apply(this,toArray(arguments)));
	}
}




/**
 * 事件分发器
 * @type {*}
 */
function Emitter(events){
	if (events) {
		this.__$$events__ = events;
	} else {
		this.__$$events__ = {};
	}
}

merge(Emitter.prototype,{
	$on: function (eventNames, fn) {
		var _this = this;
		eventNames = eventNames.split(",");
		forEach(eventNames, function (eventName) {
			if (isFunction(fn)) {
				if (_this.__$$events__[eventName] && isArray(_this.__$$events__[eventName]))
					_this.__$$events__[eventName].push(fn);
				else _this.__$$events__[eventName] = [fn];
			}
		});
		return this;
	},
	$emit: function (eventName) {
		var args = toArray(arguments),
			i = 0,
			events = this.__$$events__[eventName];
		if (events && isArray(events)) {
			for (i; i < events.length; i++) {
				events[i].apply(null, args.slice(1));
			}
		}
		return this;
	},
	$remove: function (eventName, fn) {
		var events = this.__$$events__[eventName];
		if (events && isArray(events)) {
			if (fn) {
				for (var i = events.length - 1; i >= 0; i--) {
					if (fn === events[i]) {
						events.splice(i, 1);
					}
				}
			} else {
				delete this.__$$events__[eventName];
			}
		}
		return this;
	}
});
/**
 * 模块加载器
 */
var Loader = function () {
	var loader_stack = [];//栈里会有多个脚本列表，每个列表子集加载完成又会触发一次回调
	function Request(req_list, callback){
		var _this = this;
		var shims = Injector.data('shims');
		_this.req_list = req_list;
		_this.loaders = [];
		_this.results = [];

		function done(module){
			_this.results.push(module);
			if (_this._checkDone()) {
				callback(_this.results);
				_this._destroy();
				return false;
			}
		}

		forEach(req_list, function (id) {
			var loader,cache_module;
			var uri = Injector.resolve(id);

			forEach(loader_stack, function (_loader) {
				if (_loader.uri == uri) {
					loader = _loader;
					return false;
				}
			});
			if (!loader && !(cache_module = ModuleDB.get(id,uri))) {//获取一个唯一的loader
				if(shims[id]) {
					try {
						if(isFunction(shims[id].checkConflict)){
							if(shims[id].checkConflict() === false){
								throw new Error('fake error');
							}
							return done(Injector.define(id, shims[id].factory));
						} else {
							throw new Error('fake error');
						}
					} catch (e) {
						loader = new ScriptLoader(id, uri, function () {
							Injector.define(id, shims[id].factory);
						});
					}
				} else {
					loader = new ScriptLoader(id, uri);
				}
				loader && loader_stack.push(loader);
			}
			if(cache_module){
				return done(cache_module);
			}
			if(loader) {
				if (loader.module) {
					return done(loader.module);
				} else {
					_this.loaders.push(loader);
					loader.$on("loaded", function (module) {
						loader.module = module;
						return done(module);
					});
				}
			}
		});
		forEach(_this.loaders, function (loader) {
			loader.load();
		});
	}


	merge(Request.prototype,{
		_destroy:function(){
			delete this.results;
			delete this.loaders;
			delete this.req_list;
		},
		_checkDone: function () {
			return this.req_list.length == this.results.length;
		}
	});

	function ScriptLoader(id,uri,callback){
		this.id = id;
		this.uri = uri;
		this.callback = callback;
		this.module = null;
		this.$super();
	}

	inherit(ScriptLoader,Emitter);

	merge(ScriptLoader.prototype,{
		load: function () {
			this._load(this.uri,this.callback);
		},
		//加载脚本
		_load: function (url, callback) {
			var doc = document;
			var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
			var baseElement = head.getElementsByTagName("base")[0];
			var node = doc.createElement("script");
			node.async = true;
			node.src = url;
			addOnload(node, callback);

			baseElement ?
				head.insertBefore(node, baseElement) :
				head.appendChild(node);

			function addOnload(node, callback) {
				var supportOnload = "onload" in node;

				if (supportOnload) {
					node.onload = onload;
					node.onerror = function () {
						onload(true)
					}
				}
				else {
					node.onreadystatechange = function () {
						if (/loaded|complete/.test(node.readyState)) {
							onload()
						}
					}
				}

				function onload(e) {
					// Ensure only run once and handle memory leak in IE
					node.onload = node.onerror = node.onreadystatechange = null;

					// Remove the script to reduce memory leak
					if (!Injector.debug) {
						head.removeChild(node);
					}

					// Dereference the node
					node = null;

					callback && callback(e);
				}
			}
		}
	});
	function _Loader(module){
		this.module = module;
	}
	merge(_Loader.prototype,{
		setModule:function(module){
			this.module = module;
		},
		//请求模块列表
		fetchDeps: function (callback) {
			var deps = [],_this = this;
			forEach(this.module.dep_ids,function(dep_id){
				if(!(_this.module.injectors && _this.module.injectors[dep_id])){
					deps.push(dep_id);
				}
			});
			_Loader.fetchList(deps,callback);
		},
		//请求某一模块
		fetch: function (callback) {
			_Loader.fetchList([this.module.id], function(res){
				if(res && res.length > 0){
					isFunction(callback) && callback(res[0]);
				}
			});
		}
	});

	merge(_Loader,{
		//获取一个加载请求
		getLoader: function (id,uri,callback) {
			var uri = uri || Injector.resolve(id);
			if(!uri){
				throw new Error('资源未标识');
			}
			forEach(loader_stack, function (loader) {
				if (loader.uri && loader.uri == uri || loader.id && loader.id == id) {
					callback(loader);
					return false;
				}
			});
		},
		//请求模块列表
		fetchList: function () {
			var list = [];
			var args = toArray(arguments);
			var callback = args[args.length - 1];
			if (!isFunction(callback)) {
				return;
			}
			args = args.slice(0, args.length-1);
			//生成请求列表
			forEach(args, function (param) {
				if (isArray(param)) {
					list = list.concat(param);
				} else {
					list.push(param);
				}
			});
			new Request(list, callback);
		}
	});


	return _Loader;
}();

function Module(meta){
	merge(this,meta);
	this.$super();
}

inherit(Module,Emitter);


/**
 * 模块缓存器
 */
var ModuleDB = function () {
	var modules = [];

	return {
		add: function (meta) {
			var module = new Module(meta);
			if (!this.get(meta.id, meta.uri)) {
				modules.push(module);
				Loader.getLoader(meta.id,meta.uri,function(loader){
					loader.$emit('loaded', module);
				});
			}
			return this;
		},
		get: function (id, uri) {
			var module;
			forEach(modules, function (mod) {
				if ((mod.id && id && mod.id == id) || (mod.uri && uri && mod.uri == uri)) {
					module = mod;
					return false;
				}
			});
			return module;
		}
	}
}();


var Injector = function () {
	var data = {
		baseUrl:window.location.href,
		shims:{},
		vars:{},
		alias:{}
	};
	/**
	 * 获取当前脚本路径
	 */
	function getCurrentScript() {
		var doc = document;
		var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
		if (doc.currentScript) {
			return doc.currentScript.src;
		}
		var stack;
		try {
			a.b.c();
		} catch (e) {
			stack = e.stack;
			if (!stack && window.opera) {
				stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
			}
		}
		if (stack) {
			stack = stack.split(/[@ ]/g).pop();
			stack = stack[0] == "(" ? stack.slice(1, -1) : stack;
			return stack.replace(/(:\d+)?:\d+$/i, "");
		}
		var nodes = head.getElementsByTagName("script");
		for (var i = 0, node; node = nodes[i++];) {
			if (node.readyState === "interactive") {
				return node.className = node.src;
			}
		}
	}

	//path处理
	function normalize(base, id) {
		return resolvePath(base, id.replace(/\.js/,"")) + '.js';
	}


	function resolvePath() {
		var numUrls = arguments.length;

		if (numUrls === 0) {
			throw new Error("resolveUrl requires at least one argument; got none.")
		}

		var base = document.createElement("base");
		base.href = arguments[0];

		if (numUrls === 1) {
			return base.href
		}

		var head = document.getElementsByTagName("head")[0];
		head.insertBefore(base, head.firstChild);

		var a = document.createElement("a");
		var resolved;

		for (var index = 1; index < numUrls; index++) {
			a.href = arguments[index];
			resolved = a.href;
			base.href = resolved
		}

		head.removeChild(base);

		return resolved
	}

	/**
	 * 判断是否是工厂类型
	 * @param val
	 * @returns {*}
	 */
	function _isFactory(val) {
		return isFunction(val) || (isArray(val) && isFunction(val[val.length - 1]))
	}

	/**
	 * 判断是否是依赖类型
	 * @param dep_ids
	 * @returns {boolean}
	 */
	function _isDeps(dep_ids) {
		var res = true;
		if (!isArray(dep_ids)) return false;
		forEach(dep_ids, function (dep) {
			if (!isString(dep)) {
				return (res = false);
			}
		});
		return res;
	}


	/**
	 * 解析模块，可以解析指定模块和匿名模块
	 * @returns {{uri: string, id: string, dep_ids: Array, factory: Function,injectors: Object}}
	 */
	function _parseModule() {
		var params = toArray(arguments),
			id = "",
			uri = "",
			dep_ids = [],
			factory,
			injectors=null,
			auto_get_uri = true;
		if (isBoolean(params[0])) {
			auto_get_uri = params[0];
			params = params.slice(1, 4);
		} else {
			params = params.slice(0, 3);
		}
		forEach(params, function (param) {
			if (_isFactory(param)) {
				if(isFunction(param)){
					factory = param;
				} else {
					factory = param[param.length - 1];
					dep_ids = param.slice(0,param.length - 1);
				}
			} else if (_isDeps(param)) {
				dep_ids = param;
			} else if (isString(param)) {
				id = param;
				uri = Injector.resolve(id);
			} else if (isObject(param)) {
				injectors = param;
			}
		});
		if (!uri && auto_get_uri) {
			uri = getCurrentScript();
		}
		return new Module({
			uri: uri,
			id: id,
			dep_ids: dep_ids,
			factory: factory,
			injectors: injectors
		});
	}

	/**
	 * 内置调用方法，执行将已获得的依赖模块和注入包装工厂注入到模板模块的动作
	 * @param resolve
	 * @param module
	 * @param dep_mods
	 * @param is_cache
	 * @private
	 */
	function _invoke(resolve, module, dep_mods, is_cache) {
		var dep_instances = [], inst_nums = 0;
		is_cache = isBoolean(is_cache) ? is_cache : false;

		function inject(index, instance) {
			var _inst;
			if (instance) {
				dep_instances[index] = instance;
				inst_nums++;
			}
			if (inst_nums == module.dep_ids.length) {
				if (is_cache) {
					if(!module.instance) {
						_inst = module.instance = module.factory.apply(null, dep_instances);
					} else {
						_inst = module.instance;
					}
				} else {
					_inst = module.factory.apply(null, dep_instances);
				}
				resolve(_inst);
			}
		}
		forEach(module.dep_ids, function (id, index) {
			if (module.injectors && module.injectors[id]) {//包装注入优先

				Injector.invoke(module.injectors[id]).then(function (instance) {//获取某个依赖的实例
					inject(index, instance);
				}).catch(function(e){
					throw e;
				});

			} else {
				forEach(dep_mods, function (dep) {//遍历依赖模块，调用依赖，按顺序注入
					if (dep.id && dep.id == id || dep.uri && dep.uri == Injector.resolve(id)) {//寻找依赖模块
						if (dep.instance && is_cache) {
							inject(index, dep.instance);
						}
						Injector.invoke(id).then(function (instance) {
							inject(index, instance);
						}).catch(function (e) {
							throw e;
						});
					}


				});
			}
		}, function () {
			inject();
		});
	}

	/**
	 * 支持别名替换
	 * @param id
	 * @returns {*}
	 */

	function tmplate(url){
		if(!isString(url)) throw new Error('路径类型错误');
		var reg = /\{([^{}]+)\}/g,res;
		res = url.replace(reg,function(match,param){
			return data.vars[param] ? data.vars[param] : param
		});
		if(reg.test(res)){
			return tmp(res);
		} else {
			return res;
		}
	}

	return {
		config: function (options) {
			merge(data,options);
		},
		resolve: function (id) {
			id = tmplate(data.shims[id] ? (data.shims[id].url || data.shims[id].uri) : data.alias[id] ? data.alias[id] : id);
			return normalize(data.baseUrl, id);
		},
		data:function(name){
			return name ? data[name] : data;
		},
		define: function () {
			var tmp_mod = _parseModule.apply(null, toArray(arguments));
			if(tmp_mod.uri && tmp_mod.factory) {
				ModuleDB.add(tmp_mod);
			} else {
				throw new Error('模块定义不规范');
			}
		},
		invoke: function () {
			var args = toArray(arguments),
				tmp_mod,loader;
			args.unshift(false);
			tmp_mod = _parseModule.apply(null, args);
			loader = new Loader(tmp_mod);
			return new Promise(function (resolve) {
				if (tmp_mod.id && !tmp_mod.factory) {//调用远程模块
					loader.fetch(function (module) {
						module = merge(tmp_mod,module);
						loader.setModule(module);
						if(module.dep_ids.length > 0) {
							loader.fetchDeps(function (dep_mods) {
								_invoke(resolve, module, dep_mods, true);
							});
						} else {
							_invoke(resolve, module, []);
						}
					});

				} else if (!tmp_mod.id && tmp_mod.factory) {//调用匿名模块
					if(tmp_mod.dep_ids.length > 0 ) {
						loader.fetchDeps(function (dep_mods) {
							_invoke(resolve, tmp_mod, dep_mods);
						});
					} else {
						_invoke(resolve, tmp_mod, []);
					}


				} else {
					throw new Error('模块调用不符合规范');
				}
			});
		},
		//和invoke功能相同，只是会自动报错
		use: function (id,callback) {
			this.invoke(id).then(callback).catch(function(e){
				throw e;
			});
		}
	};
}();

Injector.define("$emitter",function(){
	return Emitter;
});
global.kvm = {};
merge(global.kvm,{
	isArray: isArray,
	isString: isString,
	isFunction: isFunction,
	isObject: isObject,
	isReference: isReference,
	isBoolean:isBoolean,
	toArray: toArray,
	forEach: forEach,
	merge: merge
});
global.KVM = global.kvm;
global.kvm.module = Injector;
global.KVM.Module = Injector;
global.define = Injector.define;
//global.define.amd = true;

})(window);