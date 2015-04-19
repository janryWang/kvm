const TYPES = 'Function,String,Array,Object,Number,Boolean'.split(',');
const hasOwnProperty = Object.prototype.hasOwnProperty;

let utils = {
	isReference(val){
		return this.isArray(val) || this.isObject(val);
	},
	isValue(val){
		return !this.isReference(val);
	},
	isEmpty(obj){
		if (obj == null) return true;

		if (obj.length > 0)   return false;
		if (obj.length === 0)  return true;
		for (var key in obj) {
			if (hasOwnProperty.call(obj, key)) return false;
		}

		return true;
	},
	options(...source){
		return Object.assign.apply(Object,source);
	}
};

TYPES.forEach((name) => utils[`is#{name}`] = (val) => Object.prototype.toString.call(val) === `[object #{name}]`);

export default utils;


