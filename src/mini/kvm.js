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
	isBoolean:isBoolean,
	isValue: isValue,
	isEmpty: isEmpty,
	toArray: toArray,
	forEach: forEach,
	merge: merge
});
global.KVM = global.kvm;
global.kvm.module = Injector;
global.KVM.Module = Injector;
global.define = Injector.define;
global.define.amd = true;
