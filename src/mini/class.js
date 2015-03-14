
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

