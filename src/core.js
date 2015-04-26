import utils from "./utils";
import Emitter from "./emitter";


let Hook = new Emitter();

let Data = {
	baseUrl: "",
	vars: {},
	packages: {},
	alias: {},
	shims: {},
	version:""
};

let ModuleCache = {
	MODULES: {},
	insert(module) {
		let path = module.path;
		let mapId = module.path.id || module.path.uri;
		let driver = Driver.getDriver(path);
		if (!this.MODULES[mapId]) {
			this.MODULES[mapId] = module;
			driver && driver.$emit("loaded", module);
		}
		return this.MODULES[mapId];
	},
	find(path) {
		return this.MODULES[path.id || path.uri] || this.MODULES[path.id] || this.MODULES[path.uri];
	}
};

class Request extends Emitter {
	constructor(sender, reqs, callback) {
		super();
		this.sender = sender;
		this.reqs = utils.isArray(reqs) ? reqs : [reqs];
		this.drivers = [];
		this.results = [];
		this.callback = callback;
		this._parseReqs();
		this.send();
	}

	static fetch(sender, paths) {
		paths = utils.isArray(paths) ? paths : [paths];
		return new Promise(function (resolve) {
			new Request(sender, paths, function (modules) {
				resolve(modules);
			});
		});
	}

	_createDriver(path) {
		let driver = Driver.getDriver(path),
			that = this;
		if (!driver) {
			driver = new Driver(path);
			driver.beforeLoad();
			if (!driver.module) {
				this.drivers.push(driver);
			} else {
				return that._done(driver.module);
			}
		}
		if (!driver.module) {
			driver.$on("loaded", function (module) {
				driver.module = module;
				that._done(module);
			});
		} else {
			that._done(driver.module);
		}
		return this;
	}

	_parseReqs() {
		let that = this, module;
		this.reqs = this.reqs.filter((req)=> !!req);
		if (this.reqs.length > 0) {
			this.reqs.forEach(function (path) {
				module = that.sender.getInjector(path);
				module = module || path.getModule();
				if (module) {
					that._done(module);
				} else {
					that._createDriver(path);
				}
			});
		} else {
			that.callback([]);
		}
		return this;
	}

	_checkDone() {
		return this.reqs.length == this.results.length;
	}

	_done(module) {
		this.results.push(module);
		if (this._checkDone()) {
			if (utils.isFunction(this.callback)) {
				this.callback(this.results);
			}
		}
		return this;
	}

	send() {
		this.drivers.forEach(function (driver) {
			driver.load();
		});
		return this;
	}


}

class Driver extends Emitter {
	constructor(path) {
		super();
		this.path = path;
		this.module = null;
		if (!Driver.getDriver(path)) {
			Driver.addDriver(this);
		}
	}

	static getDriver(path) {
		return Driver.DRIVERS[path.uri];
	}

	static addDriver(driver) {
		Driver.DRIVERS[driver.path.uri] = driver;
	}

	static registerDriverLoaded(method) {
		if (!utils.isFunction(method)) return;
		Hook.$on("DRIVER_LOADED", function (that) {
			method.call(that);
		});
	}

	static registerDriverLoader(ext, method) {
		if (!utils.isFunction(method)) return;
		ext = ext.trim();
		ext = ext.toUpperCase();
		Hook.$one("DRIVER_LOADER_" + ext, function (that) {
			method.call(that, that.path.uri, that.loaded.bind(that));
		});
	}

	static registerDriverBeforeLoad(method) {
		if (!utils.isFunction(method)) return;
		Hook.$on("DRIVER_BEFORE_LOAD", function (that) {
			method.call(that);
		});
	}

	beforeLoad() {
		Hook.$emit("DRIVER_BEFORE_LOAD", this);
	}

	load() {
		let path = this.path;
		let uri = path.uri;
		uri = utils.addQueryString(uri,Object.assign({version:Data.version},path.query));
		uri = utils.addHashString(uri,path.hash);
		if (path.ext != "js") {
			Hook.$emit("DRIVER_LOADER_" + path.ext.toLocaleUpperCase(), this);
		} else {
			this._loadJS(uri, this.loaded.bind(this));
		}
	}

	loaded(err, res) {
		let path = this.path;
		if (path.ext != "js") {
			Dectorator.define(path.id, function () {
				return res;
			});
		} else {
			Hook.$emit("DRIVER_LOADED", this, err, res);
		}
	}

	_loadJS(url, callback) {
		let doc = document;
		let head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
		let baseElement = head.getElementsByTagName("base")[0];
		let node = doc.createElement("script");
		node.async = true;
		node.src = url;
		addOnload(node, callback);

		baseElement ?
			head.insertBefore(node, baseElement) :
			head.appendChild(node);

		function addOnload(node, callback) {
			let supportOnload = "onload" in node;

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
				if (Dectorator.data("debug")) {
					head.removeChild(node);
				}

				// Dereference the node
				node = null;

				callback && callback(e);
			}
		}
	}
}

Driver.DRIVERS = {};


class Path extends Emitter {
	constructor(id, baseUrl) {
		super();
		this.baseUrl = baseUrl || Data.baseUrl;
		this.id = id || "";
		this._initId();
		this._maper();
		this._parser();
		this._initUri();
	}

	static registerFileExtParser(method) {
		if (!utils.isFunction(method)) return;
		Hook.$on("FILE_EXTS_PARSER", function (that) {
			method.call(that);
		});
	}

	static registerPathParser(method) {
		if (!utils.isFunction(method)) return;
		Hook.$on("PATH_PARSER", function (that) {
			method.call(that);
		});
	}

	static registerPathMaper(method) {
		if (!utils.isFunction(method)) return;
		Hook.$on("PATH_MAPER", function (that) {
			method.call(that);
		});
	}

	static createPath(id, baseUrl) {
		return new Path(id, baseUrl);
	}

	_initId() {
		if (!this.id) return;
		let _id = this.id;
		this.query = utils.getQuery(_id);
		this.hash = utils.getHash(this.id);
		this.id = this.id.replace(/(#|\?).*/, "");
	}

	_initUri() {
		this.baseUrl = this.baseUrl.replace(/\/$/, "") + "/";
		this.uri = this.uri ? utils.resolvePath(this.baseUrl, this.uri) :
			this.id ? utils.resolvePath(this.baseUrl, this.id) : utils.getCurrentScript().uri;
		this._initExt();
	}

	_initExt() {
		let ext = this.uri.match(/\.(\w+)$/);
		if (ext && ext[1]) {
			ext = ext[1].toLocaleLowerCase();
			if (Path.__EXTS__.indexOf(ext) != -1) {
				this.ext = ext;
			} else {
				this.$emit("FILE_EXTS_PARSER", this);
				if (!Path.__EXTS__.indexOf(this.ext)) {
					this.ext = "js";
				}
			}
		} else {
			this.ext = "js";
			this.uri += ".js";
		}
	}

	_maper() {
		if (!this.id) return;
		Hook.$emit("PATH_MAPER", this);
	}

	_parser() {
		if (!this.id) return;
		this._parseVars();
		Hook.$emit("PATH_PARSER", this);
	}

	_parseVars() {
		this.baseUrl = this.template(this.baseUrl);
		this.id = this.template(this.id);
		this.uri = this.uri ? this.template(this.uri) : "";
	}

	getModule() {
		return ModuleCache.find(this);
	}

	equal(path) {
		return (this.id && this.id == path.id) || (this.uri && this.uri == path.uri);
	}

	getMap(obj) {
		let result = null, that = this;
		if (utils.isArray(obj)) {
			obj.forEach(function (item) {
				if (item.equal && item.equal(that) || (item.path && item.path.equal(that))) {
					result = item;
					return false;
				}
			});
		} else if (utils.isObject(obj)) {
			return obj && obj[this.id || this.uri];
		}
		return result;
	}

	template(url) {
		if (!utils.isString(url)) throw new Error('路径类型错误');
		let reg = /\{([^{}]+)\}/g, res, that = this;
		res = url.replace(reg, function (match, param) {
			return Data.vars && Data.vars[param] ? Data.vars[param] : param
		});
		if (reg.test(res)) {
			return that.template(res);
		} else {
			return res;
		}
	}

}

Path.__EXTS__ = ["js", "css", "json", "jsonp", "tpl", "html"];

class Module extends Emitter {
	constructor(meta) {
		super();
		utils.options(this, {
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
	}

	getInjector(path) {
		let injector = this.injectors[path.id];
		if (injector) {
			return Module.createModule(path.id, injector);
		}
	}

	invoke() {
		let that = this;
		return new Promise(function (resolve) {
			if (that.installed) {
				resolve(Promise.resolve(that.module.exports));
			} else if (that.factory) {
				resolve(Promise.resolve(that._inject()));
			} else {
				if (that.path && !that.factory) {
					resolve(Request.fetch(that, that.path).then(function (modules) {
						return Promise.resolve(modules[0]._inject());
					}));
				} else {
					throw new Error('模块不符合规范!');
				}
			}
		});
	}

	static createModule(...args) {
		return new Module(Module.parseMeta.apply(null, args));
	}

	static parseMeta(...params) {
		let meta = {},
			auto_path = false;
		if (utils.isBoolean(params[0])) {
			auto_path = params[0];
			params = params.slice(1);
		}
		params.forEach(function (param) {
			if (utils.isFunction(param)) {
				meta.factory = param;
			} else if (utils.isArray(param)) {
				if (utils.isFunction(param[param.length - 1])) {
					meta.factory = param[param.length - 1];
					meta.depPaths = param.slice(0, param.length - 1).map(function (id) {
						return new Path(id);
					});
				} else {
					meta.depPaths = param.map(function (id) {
						return new Path(id);
					});
				}
			} else if (utils.isString(param)) {
				meta.path = new Path(param);
			} else if (utils.isObject(param)) {
				meta.injectors = param;
			}

		});
		if (!meta.path && auto_path) {
			meta.path = new Path();
		}
		return meta;
	}

	static registerModuleParser(method) {
		if (!utils.isFunction(method)) return;
		Hook.$on("MODULE_PARSER", function (that) {
			method.call(that);
		});
	}

	_collectDeps() {
		let that = this,
			dependencies = [],
			injector;
		return Request.fetch(this, this.depPaths)
			.then(function (modules) {
				return new Promise(function (resolve) {
					if (that.depPaths.length > 0) {
						that.depPaths.forEach(function (path, index) {
							injector = path.getMap(modules);
							if (injector) {
								dependencies[index] = injector.invoke();
								if (dependencies.length == that.depPaths.length) {
									resolve(Promise.all(dependencies));
								}
							}
						});
					} else {
						resolve(Promise.all([]));
					}
				});
			});
	}

	_inject() {
		let that = this;
		return this._collectDeps().then(function (dependencies) {
			let instance = that.factory.apply(null, dependencies);
			if (that.module.exports) {
				instance = that.module.exports;
			} else {
				that.module.exports = instance;
			}
			that.installed = true;
			return instance;
		});
	}
}


let PluginInterface = {
	registerModuleParser: Module.registerModuleParser,

	registerDriverLoader: Driver.registerDriverLoader,
	registerDriverLoaded: Driver.registerDriverLoaded,
	registerDriverBeforeLoad: Driver.registerDriverBeforeLoad,

	registerFileExtParser: Path.registerFileExtParser,
	registerPathParser: Path.registerPathParser,
	registerPathMaper: Path.registerPathMaper,

	createModule: Module.createModule,
	createPath: Path.createPath
};

let Dectorator = {

	config(options){
		utils.options(Data, options);
	},

	data(name){
		return Data[name] ? Data[name] : Data;
	},

	define(...args){
		ModuleCache.insert(Module.createModule.apply(null, [true].concat(args)));
		return this;
	},

	invoke(...args){
		return Module.createModule.apply(null, args).invoke();
	},

	use(id, callback){
		let module = Module.createModule(id);
		module.invoke(function (instance) {
			utils.isFunction(callback) && callback(instance);
		}).catch(function (e) {
			throw e;
		});
	},

	registerPlugin(factory){
		if (utils.isFunction(factory)) {
			factory.call(this, PluginInterface);
		}
	}
};

export default Dectorator;