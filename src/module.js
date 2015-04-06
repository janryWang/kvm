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
						if (!Manager.data("debug")) {
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
