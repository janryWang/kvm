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
/**
 * 可以使kvm支持别名机制
 */
(function(){
	kvm.module.registerPlugin(function(API){
		API.registerPathMaper(function(){
			var alias = kvm.module.data('alias');
			if (this.isAbsolutePath(this.id)) return;
			if(alias[this.id]){
				this.uri = alias[this.id];
				this._parser();
			}
		});
	});
})();

/**
 * 可以使kvm支持commonjs规范
 */

'use strict';

(function () {

	kvm.module.registerPlugin(function (API) {
		API.registerModuleParser(function () {
			function uniquePath(paths) {
				var i, j;
				for (i = 0; i < paths.length; i++) {
					for (j = i + 1; j < paths.length; j++) {
						if (paths[i].equal(paths[j])) {
							paths.splice(j, 1);
						}
					}
				}
				return paths;
			}
			this.injectCommonjs = function () {
				var _this = this;
				this.injectors.exports = function () {
					_this.module.exports = _this.module.exports || {};
					return _this.module.exports;
				};
				this.injectors.module = function () {
					return _this.module;
				};
				this.injectors.require = function () {
					return function (id) {
						var path = API.createPath(id);
						var module = path.getModule();
						return module && module.module && module.module.exports ? module.module.exports : {};
					};
				};
			};
			this.collectDeps = function () {
				var deps;
				if (kvm.isFunction(this.factory)) {
					deps = this.parseDependencies(this.factory.toString());
					deps = deps.map(function (id) {
						return API.createPath(id);
					});
					this.depPaths = uniquePath(this.depPaths.concat(deps));
				}
			};
			this.parseDependencies = function (s) {
				if (s.indexOf('require') == -1) {
					return [];
				}
				var index = 0,
				    peek,
				    length = s.length,
				    isReg = 1,
				    modName = 0,
				    parentheseState = 0,
				    parentheseStack = [],
				    res = [];
				while (index < length) {
					readch();
					if (isBlank()) {} else if (isQuote()) {
						dealQuote();
						isReg = 1;
					} else if (peek == '/') {
						readch();
						if (peek == '/') {
							index = s.indexOf('\n', index);
							if (index == -1) {
								index = s.length;
							}
						} else if (peek == '*') {
							index = s.indexOf('*/', index);
							if (index == -1) {
								index = length;
							} else {
								index += 2;
							}
						} else if (isReg) {
							dealReg();
							isReg = 0;
						} else {
							index--;
							isReg = 1;
						}
					} else if (isWord()) {
						dealWord();
					} else if (isNumber()) {
						dealNumber();
					} else if (peek == '(') {
						parentheseStack.push(parentheseState);
						isReg = 1;
					} else if (peek == ')') {
						isReg = parentheseStack.pop();
					} else {
						isReg = peek != ']';
						modName = 0;
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
					return peek == '"' || peek == '\'';
				}
				function dealQuote() {
					var start = index;
					var c = peek;
					var end = s.indexOf(c, start);
					if (end == -1) {
						index = length;
					} else if (s.charAt(end - 1) != '\\') {
						index = end + 1;
					} else {
						while (index < length) {
							readch();
							if (peek == '\\') {
								index++;
							} else if (peek == c) {
								break;
							}
						}
					}
					if (modName) {
						res.push(s.slice(start, index - 1));
						modName = 0;
					}
				}
				function dealReg() {
					index--;
					while (index < length) {
						readch();
						if (peek == '\\') {
							index++;
						} else if (peek == '/') {
							break;
						} else if (peek == '[') {
							while (index < length) {
								readch();
								if (peek == '\\') {
									index++;
								} else if (peek == ']') {
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
					parentheseState = ({
						'if': 1,
						'for': 1,
						'while': 1,
						'with': 1
					})[r];
					isReg = ({
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
					})[r];
					modName = /^require\s*\(\s*(['"]).+?\1\s*\)/.test(s2);
					if (modName) {
						r = /^require\s*\(\s*['"]/.exec(s2)[0];
						index += r.length - 2;
					} else {
						index += /^[\w$]+(?:\s*\.\s*[\w$]+)*/.exec(s2)[0].length - 1;
					}
				}
				function isNumber() {
					return /\d/.test(peek) || peek == '.' && /\d/.test(s.charAt(index));
				}
				function dealNumber() {
					var s2 = s.slice(index - 1);
					var r;
					if (peek == '.') {
						r = /^\.\d+(?:E[+-]?\d*)?\s*/i.exec(s2)[0];
					} else if (/^0x[\da-f]*/i.test(s2)) {
						r = /^0x[\da-f]*\s*/i.exec(s2)[0];
					} else {
						r = /^\d+\.?\d*(?:E[+-]?\d*)?\s*/i.exec(s2)[0];
					}
					index += r.length - 1;
					isReg = 0;
				}
			};
			function needParse(depPaths) {
				var result = false;
				kvm.forEach(depPaths, function (path) {
					if (path.id == 'require') {
						result = true;
						return false;
					}
				});
				return result;
			}
			this.injectCommonjs();
			if (this.factory && needParse(this.depPaths)) {
				this.collectDeps();
			}
		});
	});
})();

//# sourceMappingURL=commonjs-compiled.js.map
/**
 * 可以使kvm支持commonjs规范
 */

(function(){

	kvm.module.registerPlugin(function(API){
		API.registerModuleParser(function(){
			function uniquePath(paths){
				var i,j;
				for(i=0;i < paths.length;i++){
					for(j=i+1;j < paths.length;j++){
						if(paths[i].equal(paths[j])){
							paths.splice(j,1);
						}
					}
				}
				return paths;
			}
			this.injectCommonjs = function(){
				var _this = this;
				this.injectors.exports = function () {
					_this.module.exports = _this.module.exports || {};
					return _this.module.exports;
				};
				this.injectors.module = function(){
					return _this.module;
				};
				this.injectors.require = function(){
					return function(id){
						var path = API.createPath(id);
						var module = path.getModule();
						return module && module.module && module.module.exports ? module.module.exports : {};
					}
				};
			};
			this.collectDeps = function(){
				var deps;
				if(kvm.isFunction(this.factory)) {
					deps = this.parseDependencies(this.factory.toString());
					deps = deps.map(function(id){
						return API.createPath(id);
					});
					this.depPaths = uniquePath(this.depPaths.concat(deps));
				}
			};
			this.parseDependencies = function (s) {
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
			};
			function needParse(depPaths){
				var result = false;
				kvm.forEach(depPaths,function(path){
					if(path.id == "require"){
						result = true;
						return false;
					}
				});
				return result;
			}
			this.injectCommonjs();
			if(this.factory && needParse(this.depPaths)) {
				this.collectDeps();
			}
		});
	});
})();

/**
 * 可以使kvm加载css文件
 */
(function(){
	kvm.module.registerPlugin(function(API){
		API.registerDriverLoader('css',function(uri,callback){
			var doc = document;
			var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
			var ss = window.document.createElement( "link" );
			var sheets = window.document.styleSheets;
			var _this = this;
			ss.rel = "stylesheet";
			ss.href = uri;
			ss.media = "only x";
			if( callback ) {
				ss.onload = function(){
					callback && callback(null,ss);
				};

				ss.onerror = function(){
					callback && callback(true);
				};
			}
			head.appendChild(ss);
			ss.onloadcssdefined = function( cb ){
				var defined;
				for( var i = 0; i < sheets.length; i++ ){
					if( sheets[ i ].href && sheets[ i ].href.indexOf( uri ) > -1 ){
						defined = true;
					}
				}
				if( defined ){
					cb();
				} else {
					setTimeout(function() {
						ss.onloadcssdefined( cb );
					});
				}
			};
			ss.onloadcssdefined(function() {
				ss.media = _this.path.query && _this.path.query.media || "all";
			});
		});

		API.registerDriverLoaded(function (err,res) {
			var path = this.path;
			if(path.ext == "css" && !err){
				kvm.module.define(path.id, function(){
					return res;
				});
			}
		});
	});
})();

define("$do",function(){


	function crawlObject(obj, callback,isDeep){
		isDeep = kvm.isBoolean(isDeep) && isDeep === false ? false : true;
		if (!kvm.isFunction(callback)) return;
		kvm.forEach(obj, function (val, key) {
			if (kvm.isReference(val) && isDeep) {
				callback(val, key);
				crawlObject(val, callback);
			} else {
				callback(val, key);
			}
		});
	}


	function inPaths(path, paths, _swap) {
		var res, _inPath;
		res = false;
		_inPath = function(a, b) {
			var a_l, b_l, index;
			a_l = a.length;
			b_l = b.length;
			index = 0;
			while (index < b_l) {
				if (b.charAt(index) !== a.charAt(index)) {
					return false;
				}
				index++;
			}
			if (index === b_l) {
				if (a_l === b_l) {
					return true;
				} else if (a_l > b_l && "[.".indexOf(a.charAt(b_l)) > -1) {
					return true;
				}
			}
		};
		kvm.forEach(paths, function(_path) {
			res = _swap ? _inPath(_path, path) : _inPath(path, _path);
			if (res) {
				return false;
			}
		});
		return res;
	}



	var COMMANDS = {
		OPERATORS: "$remove,$set,$push,$slice,$concat,$pop,$unshift,$merge,$deep_merge,$clone,$find,$sort,$foreach".split(","),
		FILTERS: "$gt,$lt,$is,$not,$gte,$lte,$icontains,$contains,$in,$not_in,$and,$or".split(","),
		SORTS: "$desc,$asc".split(","),
		CLONES: "$white_list,$black_list,$filter,$deep".split(","),
		COMMONS: "$callback".split(",")
	};
	var KEYWORDS = (function () {
		var cmd_name,
			cmds_name,
			keywords,
			_i,
			_len,
			_ref;
		keywords = {};
		for (cmds_name in COMMANDS) {
			_ref = COMMANDS[cmds_name];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				cmd_name = _ref[_i];
				keywords[cmd_name] = true;
			}
		}
		return keywords;
	})();

	function Do(data, cmds) {
		this.data = data;
		this._commands.__parent__ = this;
		this._filters.__parent__ = this;
		if (cmds) {
			this.exec(cmds);
		}
	}

	kvm.merge(Do.prototype, {
		_collect: function (obj) {
			var name,
				res;
			res = {
				operators: {},
				filters: {},
				sorts: {},
				clones: {},
				commons: {},
				props: {},
				value: null
			};
			if (!kvm.isReference(obj)) {
				res.value = obj;
				return res;
			}
			for (name in obj) {
				if (COMMANDS.OPERATORS.indexOf(name) > -1) {
					res.operators[name] = obj[name];
				} else if (COMMANDS.FILTERS.indexOf(name) > -1) {
					res.filters[name] = obj[name];
				} else if (COMMANDS.SORTS.indexOf(name) > -1) {
					res.sorts[name] = obj[name];
				} else if (COMMANDS.CLONES.indexOf(name) > -1) {
					res.clones[name] = obj[name];
				} else if (COMMANDS.COMMONS.indexOf(name) > -1) {
					res.commons[name] = obj[name];
				} else {
					res.props[name] = obj[name];
				}
			}
			return res;
		},
		_filters: {
			$is: function (a, b) {
				return a === b;
			},
			$not: function (a, b) {
				return a !== b;
			},
			$gt: function (a, b) {
				return a > b;
			},
			$lt: function (a, b) {
				return a < b;
			},
			$gte: function (a, b) {
				return a >= b;
			},
			$lte: function (a, b) {
				return a <= b;
			},
			$icontains: function (a, b) {
				return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
			},
			$contains: function (a, b) {
				return a.indexOf(b) > -1;
			},
			$in: function (a, b) {
				return b.indexOf(a) > -1;
			},
			$not_in: function (a, b) {
				return b.indexOf(a) === -1;
			}
		},
		_commands:{
			$set: function (ref, collected) {
				var prop_name,
					prop_val,
					_ref,
					_results;
				_ref = collected.props;
				_results = [];
				for (prop_name in _ref) {
					prop_val = _ref[prop_name];
					if (kvm.isReference(prop_val)) {
						ref[prop_name] = ref[prop_name] || prop_val.constructor();
						_results.push(this.$set(ref[prop_name], this.__parent__._collect(prop_val)));
					} else {
						_results.push(ref[prop_name] = prop_val);
					}
				}
				return _results;
			},
			$remove: function (ref, collected) {
				var prop_name,
					prop_val,
					_ref,
					_results;
				_ref = collected.props;
				_results = [];
				for (prop_name in _ref) {
					prop_val = _ref[prop_name];
					if (!kvm.isArray(ref) && prop_val === true) {
						_results.push(delete ref[prop_name]);
					} else {
						_results.push(void 0);
					}
				}
				return _results;
			},
			$slice: function (ref, collected) {
				var prop_name,
					prop_val,
					_ref,
					_results;
				_ref = collected.props;
				_results = [];
				for (prop_name in _ref) {
					prop_val = _ref[prop_name];
					if (ref[prop_name] && kvm.isArray(ref[prop_name])) {
						if (!kvm.isArray(prop_val)) {
							prop_val = [prop_val];
						}
						_results.push(ref[prop_name] = ref[prop_name].slice.apply(ref[prop_name], prop_val));
					} else {
						_results.push(void 0);
					}
				}
				return _results;
			},
			$push: function (ref, collected) {
				var prop_name,
					prop_val,
					_ref,
					_results;
				_ref = collected.props;
				_results = [];
				for (prop_name in _ref) {
					prop_val = _ref[prop_name];
					if (ref[prop_name] && kvm.isArray(ref[prop_name])) {
						_results.push(ref[prop_name].push(prop_val));
					} else {
						_results.push(void 0);
					}
				}
				return _results;
			},
			$concat: function (ref, collected) {
				var prop_name,
					prop_val,
					_ref,
					_results;
				_ref = collected.props;
				_results = [];
				for (prop_name in _ref) {
					prop_val = _ref[prop_name];
					if (ref[prop_name] && kvm.isArray(ref[prop_name])) {
						if (!kvm.isArray(prop_val)) {
							prop_val = [prop_val];
						}
						_results.push(ref[prop_name] = ref[prop_name].concat(prop_val));
					} else {
						_results.push(void 0);
					}
				}
				return _results;
			},
			$pop: function (ref, collected) {
				var prop_name,
					prop_val,
					_ref,
					_results;
				_ref = collected.props;
				_results = [];
				for (prop_name in _ref) {
					prop_val = _ref[prop_name];
					if (ref[prop_name] && kvm.isArray(ref[prop_name])) {
						_results.push(ref[prop_name].pop());
					} else {
						_results.push(void 0);
					}
				}
				return _results;
			},
			$unshift: function (ref, collected) {
				var prop_name,
					prop_val,
					_ref,
					_results;
				_ref = collected.props;
				_results = [];
				for (prop_name in _ref) {
					prop_val = _ref[prop_name];
					if (ref[prop_name] && kvm.isArray(ref[prop_name])) {
						_results.push(ref[prop_name].unshift(prop_val));
					} else {
						_results.push(void 0);
					}
				}
				return _results;
			},
			$merge: function (ref, collected) {
				return kvm.merge(ref, collected.props);
			},
			$deep_merge: function (ref, collected) {
				return kvm.merge(true, ref, collected.props);
			},
			$clone: function (ref, collected) {
				var blackList,
					callback,
					filter,
					isDeep,
					res,
					whiteList;
				isDeep = !!collected.clones.$deep;
				whiteList = collected.clones.$white_list;
				blackList = collected.clones.$black_list;
				filter = collected.clones.$filter;
				callback = collected.commons.$callback;
				if (!kvm.isEmpty(whiteList)) {
					res = kvm.copy(isDeep, ref,
						function (item, name, path) {
							var filter_res;
							if (inPaths(path, whiteList, true)) {
								if (!kvm.isEmpty(blackList)) {
									if (!inPaths(path, blackList)) {
										if (kvm.isFunction(filter)) {
											filter_res = filter(item, name, path);
										}
										if (kvm.isBoolean(filter_res)) {
											if (filter_res) {
												return true;
											} else {
												return false;
											}
										} else {
											return true;
										}
									} else {
										return false;
									}
								} else {
									return true;
								}
							} else {
								return false;
							}
						});
				} else if (!kvm.isEmpty(blackList)) {
					res = kvm.copy(isDeep, ref,
						function (item, name, path) {
							var filter_res;
							if (!inPaths(path, blackList)) {
								if (kvm.isFunction(filter)) {
									filter_res = filter(item, name, path);
								}
								if (kvm.isBoolean(filter_res)) {
									if (filter_res) {
										return true;
									} else {
										return false;
									}
								} else {
									return true;
								}
							} else {
								return false;
							}
						});
				} else if (kvm.isFunction(filter)) {
					res = kvm.copy(isDeep, ref,
						function (item, name, path) {
							var filter_res;
							if (kvm.isFunction(filter)) {
								filter_res = filter(item, name, path);
							}
							if (kvm.isBoolean(filter_res)) {
								if (filter_res) {
									return true;
								} else {
									return false;
								}
							} else {
								return true;
							}
						});
				} else {
					res = kvm.copy(isDeep, ref);
				}
				if (kvm.isFunction(callback)) {
					return callback(res);
				}
			},
			$find: function (ref, collected) {
				var callback,
					condition_length,
					res,
					_this;
				_this = this;
				callback = collected.commons.$callback;
				condition_length = Object.keys(collected.filters).length;
				res = [];
				if (!kvm.isEmpty(collected.filters)) {
					kvm.forEach(ref,//遍历数组
						function (ref_item) {
							var ok1 = 0;
							var isAnd1 = _isAnd(collected.filters.$and,collected.filters.$or);
							if (!kvm.isEmpty(ref_item)) {
								kvm.forEach(collected.filters,//遍历筛选器,两层条件
									function (filter_body, filter_name) {
										if(filter_name == "$or" || filter_name == "$and") return true;
										var ok2 = 0;
										var isAnd2 = _isAnd(filter_body.$and,filter_body.$or);
										kvm.forEach(filter_body,
											function (item, key) {
												if(key == "$or" || key == "$and") return true;
												if (_this.__parent__._filters[filter_name](ref_item[key], item)) {
													if(isAnd2) {
														return ok2++;
													} else {
														ok2++;
														return false;
													}
												}
											});
										if(isAnd2) {
											if (ok2 >= kvm.getKeyLength(filter_body)) {//入内层筛选条件全部成立，组合条件成立
												ok1++;
											}
										} else {
											if(ok2 > 0){
												ok1++;
											}
										}
									});
								if(!isAnd1) {
									if (ok1 >= condition_length) {//如果外层筛选条件全部成立则推入数组
										res.push(ref_item);
									}
								} else {
									if (ok1 > 0 ) {
										res.push(ref_item);
									}
								}
							}
						});
				} else {
					res = ref;
				}
				if (kvm.isFunction(callback)) {
					return callback(res);
				}
				function _isAnd(and,or){
					var res = true;
					if(and == or){
						return res;
					} else {
						if(and == undefined || and == null){
							if(or){
								res = !or;
							}
						} else {
							res = and;
						}
					}
					return res;
				}
			},
			$foreach: function (ref, collected) {
				if (kvm.isFunction(collected.value)) {
					return kvm.forEach(ref, collected.value);
				}
			},
			$sort: function (ref, collected) {
				var key,
					val,
					_ref,
					_results;
				if (kvm.isArray(ref) && kvm.isReference(collected.value)) {
					_ref = collected.props;
					_results = [];
					for (key in _ref) {
						val = _ref[key];
						if (val === "desc") {
							_results.push(ref.sort(function (a, b) {
								if (kvm.isReference(a) && kvm.isReference(b)) {
									if (a[key] < b[key]) {
										return 1;
									} else {
										return -1;
									}
								} else {
									if (a < b) {
										return 1;
									} else {
										return -1;
									}
								}
							}));
						} else {
							_results.push(ref.sort(function (a, b) {
								if (kvm.isReference(a) && kvm.isReference(b)) {
									if (a[key] > b[key]) {
										return 1;
									} else {
										return -1;
									}
								} else {
									if (a > b) {
										return 1;
									} else {
										return -1;
									}
								}
							}));
						}
					}
					return _results;
				} else {
					if (collected.value === "desc") {
						return ref.sort(function (a, b) {
							return b - a;
						});
					} else {
						return ref.sort(function (a, b) {
							return a - b;
						});
					}
				}
			}
		},
		_exec:function (ref, cmd_obj) {
			var cmd_body,
				cmd_name,
				_results;
			_results = [];
			for (cmd_name in cmd_obj) {
				cmd_body = cmd_obj[cmd_name];
				if (this._commands[cmd_name]) {
					_results.push(this._commands[cmd_name](ref, this._collect(cmd_body)));
				} else if (kvm.isReference(cmd_body) && !KEYWORDS[cmd_name]) {
					ref[cmd_name] = ref[cmd_name] || cmd_body.constructor();
					_results.push(this._exec(ref[cmd_name], cmd_body));
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		},
		exec:function(cmds){
			return this._exec(this.data, cmds);
		}
	});

	Do.exec = function (data, cmds, hook) {
		kvm.isFunction(hook) && crawlObject(cmds, function (val, key) {
			var old_callback;
			if (key == "$find" || key == "$clone") {
				old_callback = val.$callback || function () {
				};
				val.$callback = function () {
					var args = kvm.toArray(arguments);
					hook.apply(null, args);
					old_callback.apply(null, args);
				};
			}
		});
		return new Do(data, cmds);
	};

	return Do;

});

/**
 * 可以使kvm加载json文件
 */
/**
 * 可以使kvm支持包管理
 */
(function () {
	kvm.module.registerPlugin(function (API) {
		var baseUrl = kvm.module.data('baseUrl');
		var packages = kvm.module.data('packages');
		API.registerPathParser(function () {
			var packname, index,
				uri = this.uri || this.id;
			if(!uri) return;
			index = uri.indexOf("/");
			packname = uri.substr(0, index);
			if (packages && packages[packname]) {
				this.baseUrl = packages[packname].uri || packages[packname].url || baseUrl;
				this.uri = uri.substr(index + 1);
				this._parseVars();
			}
		});
	});
})();


/**
 * 可以使kvm支持包装器
 */
(function () {
	kvm.module.registerPlugin(function (API) {
		var shims = kvm.module.data('shims');
		API.registerPathMaper(function () {
			var shim = shims[this.id];
			if (shim) {
				this.uri = shim.uri || shim.url;
				this._parser();
			}
		});

		API.registerDriverBeforeLoad(function () {
			var path = this.path;
			var shim = shims[path.id];
			if (shim) {
				if (shim.exports && !shim.factory) {
					if (window[shim.exports]) {
						this.module = API.createModule(path.id, function () {
							return window[shim.exports];
						});
					}
				}
			}
		});

		API.registerDriverLoaded(function () {
			var path = this.path;
			var shim = shims[path.id];
			if (shim && !path.getModule()) {
				if (kvm.isFunction(shim.factory)) {
					kvm.module.define(path.id, shim.factory);
				} else {
					kvm.module.define(path.id, function () {
						return window[shim.exports]
					});
				}
			}
		});
	});
})();


/**
 * 可以使kvm加载html模板
 */