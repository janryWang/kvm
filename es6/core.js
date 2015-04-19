import * as utils from "utils";
import * as Emitter from "emitter";

let Hook = new Emitter();

let Data = {
	baseUrl:window.location.href,
	vars:{},
	packages:{},
	alias:{},
	shims:{}
};

let ModuleCache = {
	MODULES: {},
	insert(_module_) {
		let path = _module_.path;
		let mapId = _module_.path.id || _module_.path.uri;
		let driver = _.Driver.getDriver(path);
		if(!this.MODULES[mapId]){
			this.MODULES[mapId] = _module_;
			driver && driver.$emit("loaded",_module_);
		}
		return this.MODULES[mapId];
	},
	find(path) {
		return this.MODULES[path.id || path.uri] || this.MODULES[path.id] || this.MODULES[path.uri];
	}
};

class Module extends Emitter {
	constructor(meta){
		super();
		utils.options(this,{
			path: null,
			depPaths: [],
			factory: null,
			injectors: {},
			installed: false,
			module: {
				exports: null
			}
		},meta);
	}
}