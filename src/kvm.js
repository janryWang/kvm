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
