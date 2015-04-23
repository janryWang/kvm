const hasOwnProperty = Object.prototype.hasOwnProperty;

let TYPES = 'Function,String,Array,Object,Number,Boolean'.split(',');

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
		return Object.assign.apply(Object, source);
	},
	addQueryString(url,query){
		let parser = document.createElement('a');
		let str = "?";
		let key;
		parser.href = url.replace("?","");
		for(key in query) {
			str += `${key}=${query[key]}&`;
		}
		parser.search = str.replace(/&$/,"");
		return parser.toString();
	},
	getQuery(url){
		let parser = document.createElement('a');
		parser.href = url;
		return this.resolveQuery(parser.search);
	},
	getHash(url){
		let parser = document.createElement('a');
		parser.href = url;
		return parser.hash.replace(/^#/,"");
	},
	addHashString(url,hash){
		let parser = document.createElement('a');
		parser.href = url;
		parser.hash = "#"+hash.replace(/^#/,"");
		return parser.toString();
	},
	resolveQuery(query) {
		let vars = query.replace("?", "").split('&'), result = {};
		for (let i = 0; i < vars.length; i++) {
			if (vars[i]) {
				let pair = vars[i].split('=');
				result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
			}
		}
		return result;
	},
	isAbsolutePath(path) {
		let reg = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
		return reg.test(path);
	},
	resolvePath(...args) {
		let numUrls = args.length;

		if (numUrls === 0) {
			throw new Error("resolveUrl requires at least one argument; got none.")
		}

		let base = document.createElement("base");
		base.href = args[0];

		if (numUrls === 1) {
			return base.href
		}

		let head = document.getElementsByTagName("head")[0];
		head.insertBefore(base, head.firstChild);

		let a = document.createElement("a");
		let resolved = "";

		for (let index = 1; index < numUrls; index++) {
			a.href = args[index];
			resolved = a.href;
			base.href = resolved
		}

		head.removeChild(base);
		return resolved
	},
	before(context, name, fn){
		var _fn;
		context = context || window;
		_fn = context[name];
		context[name] = function (...args) {
			var result = fn.apply(context, args);
			args.push(result);
			_fn.apply(context,args);
			return result;
		}
	},
	after(context, name, fn){
		var _fn;
		context = context || window;
		_fn = context[name];
		context[name] = function (...args) {
			var result = _fn.apply(context,args);
			args.push(result);
			return fn.apply(context, args);
		}
	},
	getCurrentScript() {
		let uri = function _getCur() {
			let doc = document;
			let head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
			if (doc.currentScript) {
				return doc.currentScript.src;
			}
			let stack;
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
			let nodes = head.getElementsByTagName("script");
			for (let i = 0, node; node = nodes[i++];) {
				if (node.readyState === "interactive") {
					return node.className = node.src;
				}
			}
		}();
		return {
			uri:uri.replace(/(#|\?).*/, ""),
			query:this.getQuery(uri),
			hash:this.getHash(uri)
		}
	}
};


TYPES.forEach((name) => utils[`is${name}`] = (val) => Object.prototype.toString.call(val) === `[object ${name}]`);

export default utils;


