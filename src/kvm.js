import utils from "./utils";
import Emitter from "./emitter";
import core from "./core";

let KVM = {};
window.kvm = window.KVM = KVM;
window.kvm.Module = window.kvm.module = core;
window.define = core.define;
Object.assign(KVM,utils);

core.define("$emitter",function(){
	return Emitter;
});

