
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
global.define.amd = true;