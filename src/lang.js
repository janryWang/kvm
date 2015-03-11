
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
	return function () {
		if (isFunction(fun)) return fun.apply(context, toArray(arguments));
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
 * 爬对象，默认深度遍历
 * @param obj 目标对象
 * @param callback 回调函数
 * @param isDeep 是否深度遍历
 */
function crawlObject(obj, callback, isDeep) {
	isDeep = isBoolean(isDeep) && isDeep === false ? false : true;
	if (!isFunction(callback)) return;
	forEach(obj, function (val, key) {
		if (isReference(val) && isDeep) {
			callback(val, key);
			crawlObject(val, callback);
		} else {
			callback(val, key);
		}
	});
}


/**
 * 合并对象，可以深度合并也可以浅合并
 * target,[source_1,...source_n]
 * @returns {*}
 */
function merge() {
	var args,
		args_length,
		isDeep;
	args = toArray(arguments);
	isDeep = false;
	if (isBoolean(args[0])) {
		isDeep = args[0] === true ? true : false;
		args = args.slice(1);
	}
	args_length = args.length;
	if (args_length < 2) {
		return args[0];
	}
	if (args_length === 2) {
		forEach(args[1],
			function (item, name) {
				if (args[1][name] !== undefined && args[1][name] !== null) {
					args[0][name] = args[0][name] || args[1][name].constructor();
					if (isDeep && isReference(item)) {
						merge(isDeep, args[0][name], item);
					} else {
						args[0][name] = item;
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