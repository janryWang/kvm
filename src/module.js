/**
 * 模块加载器
 */
var Loader = function () {
	var loader_stack = {};

	var Request = Class({
		constructor: function (req_list, callback) {
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
				if(loader_stack[uri]){
					loader = loader_stack[uri];
				}
				if (!loader && !(cache_module = ModuleDB.get(id,uri))) {//获取一个唯一的loader
					if(shims[id]) {
						try {
							if(isFunction(shims[id].checkConflict)){
								if(shims[id].checkConflict() === false){
									throw new Error('fake error');
								}
							} else {
								if(!shims[id].factory && shims[id].exports){
									shims[id].factory = function () {
										return global[shims[id].exports];
									};
									if(!global[shims[id].exports]) {
										throw new Error('fake error');
									}
								} else {
									throw new Error('fake error');
								}
							}
							return done(Injector.define(id, shims[id].factory));
						} catch (e) {
							loader = new ScriptLoader(id, uri, function () {
								Injector.define(id, shims[id].factory);
							});
						}
					} else {
						loader = new ScriptLoader(id, uri);
					}
					loader && (loader_stack[loader.uri] = loader);
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
		},
		_destroy:function(){
			delete this.results;
			delete this.loaders;
			delete this.req_list;
		},
		_checkDone: function () {
			return this.req_list.length == this.results.length;
		}
	});


	var ScriptLoader = Class({
		constructor: function (id,uri,callback) {
			this.id = id;
			this.uri = uri;
			this.callback = callback;
			this.module = null;
			this.$super();
		},
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
					if (!Injector.data("debug")) {
						head.removeChild(node);
					}

					// Dereference the node
					node = null;

					callback && callback(e);
				}
			}
		}
	});


	Class.inherit(ScriptLoader, Emitter);


	return Class({
		constructor:function(module){
			this.module = module;
		},
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
			Loader.fetchList(deps,callback);
		},
		//请求某一模块
		fetch: function (callback) {
			Loader.fetchList([this.module.id], function(res){
				if(res && res.length > 0){
					isFunction(callback) && callback(res[0]);
				}
			});
		}

	},{
		//获取一个加载请求
		getLoader: function (id,uri,callback) {
			var uri = uri || Injector.resolve(id);
			if(!uri){
				throw new Error('资源未标识');
			}
			if(loader_stack[uri]){
				callback(loader_stack[uri]);
			}
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
}();

var Module = Class({
	constructor: function (meta) {
		merge(this,{
			id:"",
			uri:"",
			dep_ids:[],
			factory:null,
			injectors:{},
			installed:false,
			module:{
				exports:{}
			}
		},meta);
		this.$super();
		this.injectExports();
		this.collectDeps();
	},
	injectExports:function(){
		var _this = this;
		this.injectors.exports = function(){
			return _this.module.exports;
		};
		this.injectors.module = function(){
			return _this.module;
		};
		this.injectors.require = function(){
			return function(id){
				var uri = Injector.resolve(id);
				var module = ModuleDB.get(id,uri);
				return module.module.exports;
			}
		};
	},
	collectDeps:function(){
		if(isFunction(this.factory)) {
			this.dep_ids = unique(this.dep_ids.concat(this.parseDependencies(this.factory.toString())));
		}
	},
	parseDependencies:function (s) {
		if(s.indexOf('require') == -1) {
			return [];
		}
		var index = 0, peek, length = s.length, isReg = 1, modName = 0, parentheseState = 0, parentheseStack = [], res = [];
		while(index < length) {
			readch();
			if(isBlank()) {
			}
			else if(isQuote()) {
				dealQuote();
				isReg = 1
			}
			else if(peek == '/') {
				readch();
				if(peek == '/') {
					index = s.indexOf('\n', index);
					if(index == -1) {
						index = s.length;
					}
				}
				else if(peek == '*') {
					index = s.indexOf('*/', index);
					if(index == -1) {
						index = length;
					}
					else {
						index += 2;
					}
				}
				else if(isReg) {
					dealReg();
					isReg = 0
				}
				else {
					index--;
					isReg = 1;
				}
			}
			else if(isWord()) {
				dealWord();
			}
			else if(isNumber()) {
				dealNumber();
			}
			else if(peek == '(') {
				parentheseStack.push(parentheseState);
				isReg = 1
			}
			else if(peek == ')') {
				isReg = parentheseStack.pop();
			}
			else {
				isReg = peek != ']';
				modName = 0
			}
		}
		return res;
		function readch() {
			peek = s.charAt(index++);
		}
		function isBlank() {
			return /\s/.test(peek);
		}
		function isQuote() {
			return peek == '"' || peek == "'";
		}
		function dealQuote() {
			var start = index;
			var c = peek;
			var end = s.indexOf(c, start);
			if(end == -1) {
				index = length;
			}
			else if(s.charAt(end - 1) != '\\') {
				index = end + 1;
			}
			else {
				while(index < length) {
					readch();
					if(peek == '\\') {
						index++;
					}
					else if(peek == c) {
						break;
					}
				}
			}
			if(modName) {
				res.push(s.slice(start, index - 1));
				modName = 0;
			}
		}
		function dealReg() {
			index--;
			while(index < length) {
				readch();
				if(peek == '\\') {
					index++
				}
				else if(peek == '/') {
					break
				}
				else if(peek == '[') {
					while(index < length) {
						readch();
						if(peek == '\\') {
							index++;
						}
						else if(peek == ']') {
							break;
						}
					}
				}
			}
		}
		function isWord() {
			return /[a-z_$]/i.test(peek);
		}
		function dealWord() {
			var s2 = s.slice(index - 1);
			var r = /^[\w$]+/.exec(s2)[0];
			parentheseState = {
				'if': 1,
				'for': 1,
				'while': 1,
				'with': 1
			}[r];
			isReg = {
				'break': 1,
				'case': 1,
				'continue': 1,
				'debugger': 1,
				'delete': 1,
				'do': 1,
				'else': 1,
				'false': 1,
				'if': 1,
				'in': 1,
				'instanceof': 1,
				'return': 1,
				'typeof': 1,
				'void': 1
			}[r];
			modName = /^require\s*\(\s*(['"]).+?\1\s*\)/.test(s2);
			if(modName) {
				r = /^require\s*\(\s*['"]/.exec(s2)[0];
				index += r.length - 2;
			}
			else {
				index += /^[\w$]+(?:\s*\.\s*[\w$]+)*/.exec(s2)[0].length - 1;
			}
		}
		function isNumber() {
			return /\d/.test(peek)
				|| peek == '.' && /\d/.test(s.charAt(index));
		}
		function dealNumber() {
			var s2 = s.slice(index - 1);
			var r;
			if(peek == '.') {
				r = /^\.\d+(?:E[+-]?\d*)?\s*/i.exec(s2)[0];
			}
			else if(/^0x[\da-f]*/i.test(s2)) {
				r = /^0x[\da-f]*\s*/i.exec(s2)[0];
			}
			else {
				r = /^\d+\.?\d*(?:E[+-]?\d*)?\s*/i.exec(s2)[0];
			}
			index += r.length - 1;
			isReg = 0;
		}
	}
});

Class.inherit(Module, Emitter);

/**
 * 模块缓存器
 */
var ModuleDB = function () {
	var modules = {};
	return {
		add: function (module) {
			if (!this.get(module.id, module.uri)) {
				modules[module.id || module.uri] = module;
				Loader.getLoader(module.id,module.uri,function(loader){
					loader.$emit('loaded', module);
				});
			}
			return this;
		},
		get: function (id, uri) {
			return modules[id] || modules[uri];
		}
	}
}();


var Injector = function () {
	var data = {
		baseUrl:window.location.href,
		shims:{},
		vars:{},
		packages:{},
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
			injectors={},
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
	 * @private
	 */
	function _invoke(resolve, module, dep_mods) {
		var dep_instances = [], inst_nums = 0;
		function inject(index, instance) {
			var _inst;
			if (instance) {
				dep_instances[index] = instance;
				inst_nums++;
			}
			if (inst_nums == module.dep_ids.length) {
				if(!module.installed) {
					if(module.dep_ids.indexOf('module') != -1 || module.dep_ids.indexOf('exports') != -1){
						module.factory.apply(null, dep_instances);
						_inst = module.module.exports;
					} else {
						_inst = module.module.exports = module.factory.apply(null, dep_instances) || {};
					}
					module.installed = true;
				} else {
					_inst = module.module.exports;
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
						if (dep.installed) {
							inject(index, dep.module.exports);
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

	function template(url){
		if(!isString(url)) throw new Error('路径类型错误');
		var reg = /\{([^{}]+)\}/g,res;
		res = url.replace(reg,function(match,param){
			return data.vars[param] ? data.vars[param] : param
		});
		if(reg.test(res)){
			return template(res);
		} else {
			return res;
		}
	}

	function addSl(url){
		return url.replace(/\/$/,"")+"/";
	}

	function alias2shim(id){
		id = data.shims[id] ? (data.shims[id].url || data.shims[id].uri) : data.alias[id] ? data.alias[id] : id;
		id = template(id);
		id = data.shims[id] ? (data.shims[id].url || data.shims[id].uri) : id;
		return id;
	}

	/**
	 * 支持包管理
	 */

	function getPackage(id){
		var name,index;
		index = id.indexOf("/");
		name = id.substr(0,index);

		if(data.packages && data.packages[name]){
			return {
				name:addSl(data.packages[name].url || data.packages[name].uri || ""),
				path:id.substr(index+1)
			};
		}
		return {
			name:"",
			path:id
		};
	}


	return {
		config: function (options) {
			merge(data,options);
		},
		resolve: function (id) {
			var pack;
			id = alias2shim(id);
			pack = getPackage(id);
			return normalize(pack.name || data.baseUrl, pack.path);
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
			return tmp_mod;
		},
		invoke: function () {
			var loader,
				tmp_mod = _parseModule.apply(null, toArray(arguments));
			loader = new Loader(tmp_mod);
			return new Promise(function (resolve) {
				if (tmp_mod.id && !tmp_mod.factory) {//调用远程模块
					loader.fetch(function (module) {
						module = merge(tmp_mod,module);
						loader.setModule(module);
						if(module.dep_ids.length > 0) {
							loader.fetchDeps(function (dep_mods) {
								_invoke(resolve, module, dep_mods);
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