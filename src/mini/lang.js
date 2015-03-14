
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

