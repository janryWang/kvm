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
 * 判断某对象是否为非引用类型
 * @param val
 * @returns {boolean}
 */
function isValue(val) {
	return !isReference(val);
}

/**
 * 判断数组或对象是否为空
 * @param obj
 * @returns {boolean}
 */
function isEmpty(obj) {
	if (obj == null) return true;

	if (obj.length > 0)    return false;
	if (obj.length === 0)  return true;
	for (var key in obj) {
		if (hasOwnProperty.call(obj, key)) return false;
	}

	return true;
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
 * 获取对象的键数量
 * @param target
 * @returns {*}
 */
function getKeyLength(target) {
	if (isArray(target)) {
		return target.length;
	} else if (isObject(target)) {
		return Object.keys(target).length;
	} else {
		return 0;
	}
}

/**
 * 将数组去重
 * @param source
 * @returns {*}
 */
function unique(source) {
	for (var i = 0; i < source.length; ++i) {
		for (var j = i + 1; j < source.length; ++j) {
			if (source[i] === source[j])
				source.splice(j--, 1);
		}
	}
	return source;
}


/**
 * @params {fun} 需要绑定的函数
 * @params {context} 上下文
 * @returns {Function}
 */
function bind(fun,context) {
	var args = toArray(arguments);
	args = args.slice(2);
	return function () {
		if (isFunction(fun)) return fun.apply(context, toArray(arguments).concat(args));
	};
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

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}


/**
 * 遍历任务队列
 * @param tasks 任务队列
 * @param iterator 迭代器
 * @param callback 终止回调
 */
function eachTask() {
	var args = toArray(arguments),
		results = [],
		tasks,
		iterator,
		callback;
	if (!isArray(args[0])) return;
	tasks = args[0];
	if (args.length == 2) {
		callback = args[1];
	}
	if (args.length > 2) {
		iterator = args[1];
		callback = args[2];
	}
	(function _eachTask(tasks, i) {
		var task_length = tasks.length, next1, next2;
		if (i < task_length) {
			next1 = function () {
				results = toArray(arguments);
				if (i + 1 < task_length) {
					_eachTask(tasks, i + 1);
				}
				else callback.apply(null, results);
			};
			next2 = function () {
				results = toArray(arguments);
				if (isFunction(iterator)) {
					results.unshift(next1);
					iterator.apply(null, results);
				} else {
					if (i + 1 < task_length) {
						_eachTask(tasks, i + 1);
					} else callback.apply(null, results);
				}
			};
			if (isFunction(tasks[i])) {
				results.unshift(next2);
				tasks[i].apply(null, results);
			} else {
				if (isFunction(iterator)) {
					results = [tasks[i], next1];
					iterator.apply(null, results);
				}
			}
		}
	})(tasks, 0);
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
				if(isFunction(callback)) {
					callback(name, args[0], args[1]);
				}
				if (args[1][name] !== undefined && args[1][name] !== null) {
					if(!isCover) {
						if (!args[0][name]) {
							if(isReference(args[1][name])){
								args[0][name] = args[0][name] || (isArray(args[1][name]) ? []:{});
							}
							if (isDeep && isReference(item)) {
								merge(isDeep, args[0][name], item,isCover,callback);
							} else {
								args[0][name] = item;
							}
						}
					} else {
						if(isReference(args[1][name])){
							args[0][name] = args[0][name] || (isArray(args[1][name]) ? []:{});
						}
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


/**
 * 复制对象，可以实现灵活的复制，某属性深度，某属性浅复制
 * @params {isDeep or target} 是否对整个对象进行深度复制，默认是浅复制，所以该参数的优先级相对于过滤器来说要高
 * @params {target} 目标对象
 * @params {filter function} 过滤器，返回false实现浅复制，true为深复制
 * @returns {*}
 */
function copy() {
	var args,
		filter,
		isDeep,
		objType,
		path,
		res;
	args = toArray(arguments);
	isDeep = false;
	if (isBoolean(args[0])) {
		isDeep = args[0] === true ? true : false;
		args = args.slice(1);
	}
	if (isValue(args[0])) {
		return args[0];
	}
	filter = args[1] && isFunction(args[1]) ? args[1] : false;
	path = args[2] && isString(args[2]) ? args[2] : "";
	objType = isArray(args[0]) ? 1 : 2;
	res = args[0].constructor();
	forEach(args[0],
		function (item, name) {
			var filter_res,
				_path;
			_path = path ? (objType === 2 ? path + "." + name : path + "[" + name + "]") : name;
			if (filter) {
				filter_res = filter(item, name, _path);
				if (isBoolean(filter_res)) {
					if (filter_res) {
						if (isDeep && isReference(item)) {
							res[name] = copy(isDeep, item, filter, _path);
							_path = path;
						} else {
							res[name] = item;
						}
					} else {
						res[name] = item;
					}
				} else {
					if (isDeep && isReference(item)) {
						res[name] = copy(isDeep, item, filter, _path);
						_path = path;
					} else {
						res[name] = item;
					}
				}
			} else {
				if (isDeep && isReference(item)) {
					res[name] = copy(isDeep, item, filter, _path);
					_path = path;
				} else {
					res[name] = item;
				}
			}
		});
	return res;
}



/**
 * 类工厂
 * @param proMethods 实例方法
 * @param staMethods 静态方法
 * @returns {*}
 * @constructor
 */
function Class(proMethods, staMethods) {
	if (proMethods && proMethods.constructor
		&& isFunction(proMethods.constructor)
		&& proMethods.constructor !== Object) {
		_class = function () {
			return proMethods.constructor.apply(this, toArray(arguments));
		};
		_class.toString = function () {
			return proMethods.constructor.toString();
		};
	} else {
		_class = function(){};
	}
	merge(_class.prototype, proMethods);
	merge(_class, staMethods);
	return _class;
}

/**
 * 继承原则，默认是子类会重写父类的方法和属性，子类会继承父类的一切方法和属性
 * 实例化对象可以通过$parent访问父对象，这样访问的父对象的属性方法不会被重写
 */
Class.inherit = function () {
	var args = toArray(arguments);

	function construct(constructor, args) {
		function F() {
			return constructor.apply(this, args);
		}

		F.prototype = constructor.prototype;
		return new F();
	}

	function _super() {
		var instance = construct(parentClass, toArray(arguments));//实例化父类
		merge(this, instance, false);//将父类的实例化对象与当前对象混合
		this.$super = _super;
		if (this.$parent && isArray(this.$parent)) {
			this.$parent.push(instance);
		} else
			this.$parent = [instance];
		return instance;
	}

	if (args.length == 2) {
		var childClass = args[0], parentClass = args[1];
		if (isFunction(childClass) && isFunction(parentClass)) {
			merge(childClass.prototype, parentClass.prototype, false, function (name, target, source) {//默认是父类方法不能覆盖子类方法
				if (source.$$isprotocol === true) {
					if (isFunction(source[name]) && !isFunction(target[name])) {
						throw "The subclass does not follow protocol";
					}
				}
			});
			childClass.prototype.$super = _super;
			childClass.prototype.$parent = parentClass.prototype;
			childClass.prototype.constructor = childClass;
		}
	} else if (args.length > 2) {
		for (var i = 1; i < args.length; i++) {
			Class.inherit(args[0], args[i]);
		}
	}

};

/**
 * 扩展类
 * @param _class
 * @param _prototype
 * @param _static
 */

Class.extend = function(_class,_prototype,_static){
	if(isFunction(_class)) {
		merge(_class.prototype, _prototype);
		merge(_class, _static);
	}
};

/**
 * 通过协议来约定接口规范
 */
Class.protocol = function (Interface) {
	Interface.$$isprotocol = true;
	return Class(Interface);
};




/**
 * 事件分发器
 * @type {*}
 */

var Emitter = Class({
	constructor: function (events) {
		if (events) {
			this.__$$events__ = events;
		} else {
			this.__$$events__ = {};
		}
	},
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
	$one:function(eventNames,fn){
		var _this = this;
		eventNames = eventNames.split(",");
		forEach(eventNames, function (eventName) {
			if (isFunction(fn)) {
				if (!_this.__$$events__[eventName])
					_this.__$$events__[eventName] = [fn];
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
 * 模块管理系统
 */

var Manager = (function () {

	var Hook = new Emitter();

	/**
	 * 管理器公共数据存储域
	 */
	var Data = {
		baseUrl:window.location.href,
		vars:{},
		packages:{},
		alias:{},
		shims:{}
	};

	/**
	 * 模块缓存器
	 */
	var ModuleCache = {
		MODULES: {},
		add: function (module) {
			var path = module.path;
			var mapId = module.path.id || module.path.uri;
			var driver = _.Driver.getDriver(path);
			if(!this.MODULES[mapId]){
				this.MODULES[mapId] = module;
				driver && driver.$emit("loaded",module);
			}
			return this.MODULES[mapId];
		},
		//寻找缓存模块，通过id,或uri来寻找
		get: function (path) {
			return this.MODULES[path.id || path.uri] || this.MODULES[path.id] || this.MODULES[path.uri];
		}
	};

	var Container = {
		Module: Class({
			constructor: function () {
				this.$super();
				this._init.apply(this, toArray(arguments));
			},
			_init: function (meta) {
				merge(this, {
					path: null,
					depPaths: [],
					factory: null,
					injectors: {},
					installed: false,
					module: {
						exports: null
					}
				}, meta);
				Hook.$emit("MODULE_PARSER", this);
			},
			_collectDeps: function () {
				var that = this,
					dependencies = [],
					injector;
				return _.Request.fetch(this, this.depPaths)
					.then(function (modules) {
						return new Promise(function (resolve) {
							forEach(that.depPaths, function (path, index) {
								injector = path.getMap(modules);
								if (injector) {
									dependencies[index] = injector.invoke();
									if (dependencies.length == that.depPaths.length) {
										resolve(Promise.all(dependencies));
									}
								}
							}, function () {
								resolve(Promise.all([]));
							});
						});
					});
			},

			_inject: function () {
				var that = this;
				return this._collectDeps().then(function (dependencies) {
					var instance = that.factory.apply(null, dependencies);
					if (that.module.exports) {
						instance = that.module.exports;
					} else {
						that.module.exports = instance;
					}
					that.installed = true;
					return instance;
				});
			},
			//寻找注入模块，通过id来索引
			getInjector: function (path) {
				var injector = this.injectors[path.id];
				if (injector) {
					return _.Module.createModule(path.id, injector);
				}
			},

			invoke: function () {
				var that = this;
				return new Promise(function (resolve) {
					if (that.installed) {
						resolve(Promise.resolve(that.module.exports));
					} else if (that.factory) {
						resolve(Promise.resolve(that._inject()));
					} else {
						if (that.path && !that.factory) {
							resolve(_.Request.fetch(that, that.path).then(function (modules) {
								return Promise.resolve(modules[0]._inject());
							}));
						} else {
							throw new Error('模块不符合规范!');
						}
					}
				});
			}

		}, {
			createModule: function () {
				return new _.Module(_.Module.parseMeta.apply(null, toArray(arguments)));
			},
			parseMeta: function () {
				var meta = {},
					params = toArray(arguments),
					auto_path = false;
				if (isBoolean(params[0])) {
					auto_path = params[0];
					params = params.slice(1);
				}
				forEach(params, function (param) {
					if (isFunction(param)) {
						meta.factory = param;
					} else if (isArray(param)) {
						if (isFunction(param[param.length - 1])) {
							meta.factory = param[param.length - 1];
							meta.depPaths = param.slice(0, param.length - 1).map(function (id) {
								return new _.Path(id);
							});
						} else {
							meta.depPaths = param.map(function (id) {
								return new _.Path(id);
							});
						}
					} else if (isString(param)) {
						meta.path = new _.Path(param);
					} else if (isObject(param)) {
						meta.injectors = param;
					}

				});
				if (!meta.path && auto_path) {
					meta.path = new _.Path();
				}
				return meta;

			},
			registerModuleParser: function (method) {
				if (!isFunction(method)) return;
				Hook.$on("MODULE_PARSER", function (that) {
					method.call(that);
				});
			}
		}),

		Request: Class({
			constructor: function () {
				this.$super();
				this._init.apply(this, toArray(arguments));
			},
			_init: function (sender, reqs, callback) {
				this.sender = sender;
				this.reqs = isArray(reqs) ? reqs : [reqs];
				this.drivers = [];
				this.results = [];
				this.callback = callback;
				this._parseReqs();
				this.send();
			},

			_createDriver: function (path) {
				var driver = _.Driver.getDriver(path),
					that = this;
				if (!driver) {
					driver = new _.Driver(path);
					driver.beforeLoad();
					if (!driver.module) {
						this.drivers.push(driver);
					} else {
						that._done(driver.module);
					}
				}
				if(!driver.module) {
					driver.$on("loaded", function (module) {
						driver.module = module;
						that._done(module);
					});
				} else {
					that._done(driver.module);
				}
			},
			_parseReqs: function () {
				var that = this, module;
				forEach(this.reqs, function (path) {
					module = that.sender.getInjector(path);
					module = module || path.getModule();
					if (module) {
						that._done(module);
					} else {
						that._createDriver(path);
					}
				}, function () {
					that.callback([]);
				});
			},
			send: function () {
				forEach(this.drivers, function (driver) {
					driver.load();
				});
			},
			_checkDone: function () {
				return this.reqs.length == this.results.length;
			},
			_done: function (module) {
				this.results.push(module);
				if (this._checkDone()) {
					if (isFunction(this.callback)) {
						this.callback(this.results);
					}
				}
			}
		}, {
			fetch: function (sender, paths) {
				paths = isArray(paths) ? paths : [paths];
				return new Promise(function (resolve) {
					new _.Request(sender, paths, function (modules) {
						resolve(modules);
					});
				});
			}
		}),

		Driver: Class({
			constructor: function () {
				this.$super();
				this._init.apply(this, toArray(arguments));
			},
			_init: function (path) {
				this.path = path;
				this.module = null;
				if (!_.Driver.getDriver(path)) {
					_.Driver.addDriver(this);
				}
			},
			loaded: function (err, res) {
				var path = this.path;
				if (path.ext != "js") {
					Dectorator.define(path.id, function () {
						return res;
					});
				} else {
					Hook.$emit("DRIVER_LOADED", this,err,res);
				}
			},
			beforeLoad: function () {
				Hook.$emit("DRIVER_BEFORE_LOAD", this);
			},
			load: function () {
				var path = this.path;
				if (path.ext != "js") {
					Hook.$emit("DRIVER_LOADER_" + path.ext.toLocaleUpperCase(), this);
				} else {
					this._loadJS(path.uri, bind(this.loaded, this));
				}
			},
			_loadJS: function (url, callback) {
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
						if (Manager.data("debug")) {
							head.removeChild(node);
						}

						// Dereference the node
						node = null;

						callback && callback(e);
					}
				}
			}
		}, {
			DRIVERS: {},
			//寻找驱动，通过uri来索引
			getDriver: function (path) {
				return this.DRIVERS[path.uri];
			},
			addDriver: function (driver) {
				this.DRIVERS[driver.path.uri] = driver;
			},
			registerDriverLoaded: function (method) {
				if (!isFunction(method)) return;
				Hook.$on("DRIVER_LOADED", function (that) {
					method.call(that);
				});
			},
			registerDriverLoader: function (ext, method) {
				if (!isFunction(method)) return;
				ext = ext.trim();
				ext = ext.toUpperCase();
				Hook.$one("DRIVER_LOADER_" + ext, function (that) {
					method.call(that, that.path.uri, bind(that.loaded, that));
				});
			},
			registerDriverBeforeLoad: function (method,err,res) {
				if (!isFunction(method)) return;
				Hook.$on("DRIVER_BEFORE_LOAD", function (that) {
					method.call(that,err,res);
				});
			}
		}),


		Path: Class({
			constructor: function () {
				this.$super();
				this._init.apply(this, toArray(arguments));
			},
			_init: function (id, baseUrl) {
				this.baseUrl = baseUrl || Data.baseUrl;
				this.id = id || "";
				this._initId();
				this._maper();
				this._parser();
				this._initUri();
			},

			__EXTS__: ["js", "css", "json", "jsonp", "tpl", "html"],

			_initId: function () {
				if (!this.id) return;
				var parser = document.createElement('a');
				parser.href = this.id;
				this.query = this.getQuery(parser.search);
				this.hash = parser.hash.replace("#", "");
				this.id = this.id.replace(/(#|\?).*/, "");
			},

			_initUri: function () {
				this.baseUrl = this.baseUrl.replace(/\/$/, "") + "/";
				this.uri =  this.uri ? this.resolvePath(this.baseUrl, this.uri) : this.id ? this.resolvePath(this.baseUrl, this.id) : this.getCurrentScript();
				this._initExt();
			},

			_initExt: function () {
				var ext = this.uri.match(/\.(\w+)$/);
				if (ext && ext[1]) {
					ext = ext[1].toLocaleLowerCase();
					if (this.__EXTS__.indexOf(ext) != -1) {
						this.ext = ext;
					} else {
						this.$emit("FILE_EXTS_PARSER", this);
						if (!this.__EXTS__.indexOf(this.ext)){
							this.ext = "js";
						}
					}
				} else {
					this.ext = "js";
					this.uri += ".js";
				}
			},

			_maper:function(){
				if (!this.id) return;
				Hook.$emit("PATH_MAPER", this);
			},


			_parser: function () {
				if (!this.id) return;
				this._parseVars();
				Hook.$emit("PATH_PARSER", this);

			},

			_parseVars: function () {
				this.baseUrl = this.template(this.baseUrl);
				this.id = this.template(this.id);
			},

			getModule: function () {
				return ModuleCache.get(this);
			},

			equal: function (path) {
				return (this.id && this.id == path.id) || (this.uri && this.uri == path.uri);
			},

			getMap: function (obj) {
				var result, that = this;
				if (isArray(obj)) {
					forEach(obj, function (item) {
						if (item.equal && item.equal(that) || (item.path && item.path.equal(that))) {
							result = item;
							return false;
						}
					});
				} else if (isObject(obj)) {
					return obj && obj[this.id || this.uri];
				}
				return result;
			},

			template: function (url) {
				if (!isString(url)) throw new Error('路径类型错误');
				var reg = /\{([^{}]+)\}/g, res, that = this;
				res = url.replace(reg, function (match, param) {
					return Data.vars && Data.vars[param] ? Data.vars[param] : param
				});
				if (reg.test(res)) {
					return that.template(res);
				} else {
					return res;
				}
			},
			getQuery: function (query) {
				var vars = query.replace("?", "").split('&'), result = {};
				for (var i = 0; i < vars.length; i++) {
					var pair = vars[i].split('=');
					result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
				}
				return result;
			},
			isAbsolutePath: function (path) {
				var reg = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
				return reg.test(path);
			},
			resolvePath: function () {
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
			},

			getCurrentScript: function () {
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
		}, {
			registerFileExtParser: function (method) {
				if (!isFunction(method)) return;
				Hook.$on("FILE_EXTS_PARSER", function (that) {
					method.call(that);
				});
			},
			registerPathParser: function (method) {
				if (!isFunction(method)) return;
				Hook.$on("PATH_PARSER", function (that) {
					method.call(that);
				});
			},
			registerPathMaper: function (method) {
				if (!isFunction(method)) return;
				Hook.$on("PATH_MAPER", function (that) {
					method.call(that);
				});
			},
			createPath: function (id,baseUrl) {
				return new _.Path(id,baseUrl);
			}
		})
	};

	var _ = Container;

	var PluginAPI = {
		registerModuleParser: _.Module.registerModuleParser,

		registerDriverLoader: _.Driver.registerDriverLoader,
		registerDriverLoaded:_.Driver.registerDriverLoaded,
		registerDriverBeforeLoad: _.Driver.registerDriverBeforeLoad,

		registerFileExtParser: _.Path.registerFileExtParser,
		registerPathParser: _.Path.registerPathParser,
		registerPathMaper: _.Path.registerPathMaper,

		createModule: _.Module.createModule,
		createPath: _.Path.createPath
	};



	forEach(Container,function(_,className){
		Class.inherit(Container[className], Emitter);
	});

	/**
	 *  返回一个装饰器
	 */
	var Dectorator = {
		/**
		 * 配置方法
		 */
		config: function (config) {
			merge(true,Data, config);
			return this;
		},
		/**
		 * 获取全局数据
		 */
		data: function (name) {
			return Data[name] ? Data[name] : Data;
		},
		/**
		 * 模块定义方法
		 */
		define: function () {
			ModuleCache.add(_.Module.createModule.apply(null,[true].concat(toArray(arguments))));
			return this;
		},
		/**
		 * 模块调用方法
		 */
		invoke: function () {
			return _.Module.createModule.apply(null,toArray(arguments)).invoke();
		},
		/**
		 * 使用模块方法
		 */
		use: function (id,callback) {
			var module = _.Module.createModule(id);
			module.invoke(function(instance){
				isFunction(callback) && callback(instance);
			}).catch(function(e){
				throw e;
			});
		},
		/**
		 * 插件注册工厂方法
		 */
		registerPlugin: function (factory) {
			if (isFunction(factory)) {
				factory.call(this, PluginAPI);
			}
		}
	};

	return Dectorator;
})();

Manager.define("$class",function(){
	return Class;
});
Manager.define("$emitter",function(){
	return Emitter;
});
global.kvm = {};
merge(global.kvm,{
	isArray: isArray,
	isString: isString,
	isFunction: isFunction,
	isObject: isObject,
	isReference: isReference,
	isEmpty: isEmpty,
	isBoolean:isBoolean,
	getKeyLength: getKeyLength,
	isValue: isValue,
	guid:guid,
	unique: unique,
	toArray: toArray,
	bind: bind,
	forEach: forEach,
	merge: merge,
	eachTask: eachTask,
	copy: copy,
	Class:Class,
	Emitter:Emitter
});
global.KVM = global.kvm;
global.kvm.module = Manager;
global.KVM.Module = Manager;
global.define = Manager.define;
global.define.amd = true;

})(window);