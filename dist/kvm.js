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
var COMMANDS = {
	OPERATORS: "$remove,$set,$push,$slice,$concat,$pop,$unshift,$merge,$deep_merge,$find,$sort,$foreach".split(","),
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

merge(Do.prototype, {
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
		if (!isReference(obj)) {
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
				if (isReference(prop_val)) {
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
				if (!isArray(ref) && prop_val === true) {
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
				if (ref[prop_name] && isArray(ref[prop_name])) {
					if (!isArray(prop_val)) {
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
				if (ref[prop_name] && isArray(ref[prop_name])) {
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
				if (ref[prop_name] && isArray(ref[prop_name])) {
					if (!isArray(prop_val)) {
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
				if (ref[prop_name] && isArray(ref[prop_name])) {
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
				if (ref[prop_name] && isArray(ref[prop_name])) {
					_results.push(ref[prop_name].unshift(prop_val));
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		},
		$merge: function (ref, collected) {
			return merge(ref, collected.props);
		},
		$deep_merge: function (ref, collected) {
			return merge(true, ref, collected.props);
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
			if (!isEmpty(whiteList)) {
				res = copy(isDeep, ref,
					function (item, name, path) {
						var filter_res;
						if (inPaths(path, whiteList, true)) {
							if (!isEmpty(blackList)) {
								if (!inPaths(path, blackList)) {
									if (isFunction(filter)) {
										filter_res = filter(item, name, path);
									}
									if (isBoolean(filter_res)) {
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
			} else if (!isEmpty(blackList)) {
				res = copy(isDeep, ref,
					function (item, name, path) {
						var filter_res;
						if (!inPaths(path, blackList)) {
							if (isFunction(filter)) {
								filter_res = filter(item, name, path);
							}
							if (isBoolean(filter_res)) {
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
			} else if (isFunction(filter)) {
				res = copy(isDeep, ref,
					function (item, name, path) {
						var filter_res;
						if (isFunction(filter)) {
							filter_res = filter(item, name, path);
						}
						if (isBoolean(filter_res)) {
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
				res = copy(isDeep, ref);
			}
			if (isFunction(callback)) {
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
			if (!isEmpty(collected.filters)) {
				forEach(ref,//遍历数组
					function (ref_item) {
						var ok1 = 0;
						var isAnd1 = _isAnd(collected.filters.$and,collected.filters.$or);
						if (!isEmpty(ref_item)) {
							forEach(collected.filters,//遍历筛选器,两层条件
								function (filter_body, filter_name) {
									if(filter_name == "$or" || filter_name == "$and") return true;
									var ok2 = 0;
									var isAnd2 = _isAnd(filter_body.$and,filter_body.$or);
									forEach(filter_body,
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
										if (ok2 >= getKeyLength(filter_body)) {//入内层筛选条件全部成立，组合条件成立
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
			if (isFunction(callback)) {
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
			if (isFunction(collected.value)) {
				return forEach(ref, collected.value);
			}
		},
		$sort: function (ref, collected) {
			var key,
				val,
				_ref,
				_results;
			if (isArray(ref) && isReference(collected.value)) {
				_ref = collected.props;
				_results = [];
				for (key in _ref) {
					val = _ref[key];
					if (val === "desc") {
						_results.push(ref.sort(function (a, b) {
							if (isReference(a) && isReference(b)) {
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
							if (isReference(a) && isReference(b)) {
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
			} else if (isReference(cmd_body) && !KEYWORDS[cmd_name]) {
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
	isFunction(hook) && crawlObject(cmds, function (val, key) {
		var old_callback;
		if (key == "$find" || key == "$clone") {
			old_callback = val.$callback || function () {
			};
			val.$callback = function () {
				var args = toArray(arguments);
				hook.apply(null, args);
				old_callback.apply(null, args);
			};
		}
	});
	return new Do(data, cmds);
};

/**
 * 类工厂
 * @param proMethods 实例方法
 * @param staMethods 静态方法
 * @returns {*}
 * @constructor
 */
function Class(proMethods, staMethods) {
	var _class;
	if (proMethods && proMethods.constructor && isFunction(proMethods.constructor)) {
		_class = function () {
			return proMethods.constructor.apply(this, toArray(arguments));
		};
		_class.toString = function () {
			return proMethods.constructor.toString();
		};
	} else {
		_class = function () {
		};
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
/**
 * 模块加载器
 */
var Loader = function () {
	var loader_stack = [];//栈里会有多个脚本列表，每个列表子集加载完成又会触发一次回调

	var Request = Class({
		constructor: function (req_list, callback) {
			var _this = this;
			var shims = Injector.data('shims');
			_this.req_list = req_list;
			_this.loaders = [];
			_this.results = [];
			forEach(req_list, function (id) {
				var loader,cache_module;
				var uri = Injector.resolve(id);

				forEach(loader_stack, function (_loader) {
					if (_loader.uri == uri) {
						loader = _loader;
						return false;
					}
				});
				if (!loader) {//获取一个唯一的loader
					loader = new ScriptLoader(id,uri,function(){
						//如果存在shim模块
						if(shims[id]){
							Injector.define(id,shims[id].factory);
						}
					});
					loader_stack.push(loader);
				}
				if(loader.module){
					_this.results.push(loader.module);
					if (_this._checkDone()) {
						callback(_this.results);
						return false;
					}
				} else if(cache_module = ModuleDB.get(id,uri)){
					_this.results.push(cache_module);
					if (_this._checkDone()) {
						callback(_this.results);
						return false;
					}
				} else {
					_this.loaders.push(loader);
					loader.$on("loaded", function (module) {
						loader.module = module;
						_this.results.push(module);
						if (_this._checkDone()) {
							callback(_this.results);
							return false;
						}
					});
				}
			});
			forEach(_this.loaders, function (loader) {
				loader.load();
			});
		},
		_checkDone: function () {
			return this.req_list.length == this.results.length;
		}
	});


	var ScriptLoader = Class({
		constructor: function (id,uri,callback) {
			var _this = this;
			this.id = id;
			this.uri = uri;
			this.callback = callback;
			this.state = "pendding";
			this.module = null;
			this.$super();
			this.$on("loaded", function () {
				_this.state = "done";
			});
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
		},

	},{
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
}();

var Module = Class({
	constructor: function (meta) {
		merge(this,{
			id:"",
			uri:"",
			dep_ids:[],
			factory:null,
			injectors:null
		},meta);
		this.$super();
		this.register();

	},
	register: function () {
		var _this = this;
		this.$on("loaded", function () {
			_this.loaded = true;
		});
		this.$on("invoked", function () {
			_this.invoked = true;
		});
	}
});

/**
 * 模块缓存器
 */
var ModuleDB = function () {
	var modules = [];


	Class.inherit(Module, Emitter);

	return {
		add: function (meta) {
			var module = new Module(meta);
			if (!this.get(meta.id, meta.uri)) {
				modules.push(module);
				module.$emit("loaded");
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
		if (isUnnormalId(id)) return id;
		if (isRelativePath(id)) return resolvePath(base, id) + '.js';
		return id;
	}

	function isUnnormalId(id) {
		return (/^https?:|^file:|^\/|\.js$/).test(id);
	}

	function isRelativePath(path) {
		return (path + '').indexOf('.') === 0;
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
			var _ins;
			if (instance) {
				dep_instances[index] = instance;
				inst_nums++;
			}
			if (inst_nums == module.dep_ids.length) {
				if (is_cache) {
					if(!module.instance) {
						_ins = module.instance = module.factory.apply(null, dep_instances);
					} else {
						_ins = module.instance;
					}
				} else {
					_ins = module.factory.apply(null, dep_instances);
				}
				module.$emit("invoked");
				resolve(_ins);
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


Injector.define("$do",function(){
	return Do;
});
Injector.define("$dataOperator",function(){
	return Do;
});
Injector.define("$class",function(){
	return Class;
});
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
	copy: copy
});
global.KVM = global.kvm;
global.kvm.module = Injector;
global.KVM.Module = Injector;
global.define = Injector.define;
})(window);