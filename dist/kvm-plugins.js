/**
 * 可以使kvm支持别名机制
 */
(function(){
	kvm.module.registerPlugin(function(API){
		API.registerPathMaper(function(){
			var alias = kvm.module.data('alias');
			if(kvm.isAbsolutePath(this.id)) return;
			if(alias[this.id]){
				this.uri = alias[this.id];
				this._parser();
			}
		});
	});
})();

/**
 * 可以使kvm支持commonjs规范
 */

(function(){

	kvm.module.registerPlugin(function(API){
		API.registerModuleParser(function(){
			function uniquePath(paths){
				var i,j;
				for(i=0;i < paths.length;i++){
					for(j=i+1;j < paths.length;j++){
						if(paths[i].equal(paths[j])){
							paths.splice(j,1);
						}
					}
				}
				return paths;
			}
			this.injectCommonjs = function(){
				var _this = this;
				this.injectors.exports = function () {
					_this.module.exports = _this.module.exports || {};
					return _this.module.exports;
				};
				this.injectors.module = function(){
					return _this.module;
				};
				this.injectors.require = function(){
					return function(id){
						var path = API.createPath(id);
						var module = path.getModule();
						return module && module.module && module.module.exports ? module.module.exports : {};
					}
				};
			};
			this.collectDeps = function(){
				var deps;
				if(kvm.isFunction(this.factory)) {
					deps = this.parseDependencies(this.factory.toString());
					deps = deps.map(function(id){
						return API.createPath(id);
					});
					this.depPaths = uniquePath(this.depPaths.concat(deps));
				}
			};
			this.parseDependencies = function (s) {
				if(s.indexOf('require') == -1) {
					return [];
				}
				var index = 0, peek, length = s.length, isReg = 1, modName = 0, parentheseState = 0, parentheseStack = [], res = [];
				while(index < length) {
					readch();
					if(isBlank()) {
					}
					else if(isQuote()) {
						dealQuote();
						isReg = 1
					}
					else if(peek == '/') {
						readch();
						if(peek == '/') {
							index = s.indexOf('\n', index);
							if(index == -1) {
								index = s.length;
							}
						}
						else if(peek == '*') {
							index = s.indexOf('*/', index);
							if(index == -1) {
								index = length;
							}
							else {
								index += 2;
							}
						}
						else if(isReg) {
							dealReg();
							isReg = 0
						}
						else {
							index--;
							isReg = 1;
						}
					}
					else if(isWord()) {
						dealWord();
					}
					else if(isNumber()) {
						dealNumber();
					}
					else if(peek == '(') {
						parentheseStack.push(parentheseState);
						isReg = 1
					}
					else if(peek == ')') {
						isReg = parentheseStack.pop();
					}
					else {
						isReg = peek != ']';
						modName = 0
					}
				}
				return res;
				function readch() {
					peek = s.charAt(index++);
				}
				function isBlank() {
					return /\s/.test(peek);
				}
				function isQuote() {
					return peek == '"' || peek == "'";
				}
				function dealQuote() {
					var start = index;
					var c = peek;
					var end = s.indexOf(c, start);
					if(end == -1) {
						index = length;
					}
					else if(s.charAt(end - 1) != '\\') {
						index = end + 1;
					}
					else {
						while(index < length) {
							readch();
							if(peek == '\\') {
								index++;
							}
							else if(peek == c) {
								break;
							}
						}
					}
					if(modName) {
						res.push(s.slice(start, index - 1));
						modName = 0;
					}
				}
				function dealReg() {
					index--;
					while(index < length) {
						readch();
						if(peek == '\\') {
							index++
						}
						else if(peek == '/') {
							break
						}
						else if(peek == '[') {
							while(index < length) {
								readch();
								if(peek == '\\') {
									index++;
								}
								else if(peek == ']') {
									break;
								}
							}
						}
					}
				}
				function isWord() {
					return /[a-z_$]/i.test(peek);
				}
				function dealWord() {
					var s2 = s.slice(index - 1);
					var r = /^[\w$]+/.exec(s2)[0];
					parentheseState = {
						'if': 1,
						'for': 1,
						'while': 1,
						'with': 1
					}[r];
					isReg = {
						'break': 1,
						'case': 1,
						'continue': 1,
						'debugger': 1,
						'delete': 1,
						'do': 1,
						'else': 1,
						'false': 1,
						'if': 1,
						'in': 1,
						'instanceof': 1,
						'return': 1,
						'typeof': 1,
						'void': 1
					}[r];
					modName = /^require\s*\(\s*(['"]).+?\1\s*\)/.test(s2);
					if(modName) {
						r = /^require\s*\(\s*['"]/.exec(s2)[0];
						index += r.length - 2;
					}
					else {
						index += /^[\w$]+(?:\s*\.\s*[\w$]+)*/.exec(s2)[0].length - 1;
					}
				}
				function isNumber() {
					return /\d/.test(peek)
						|| peek == '.' && /\d/.test(s.charAt(index));
				}
				function dealNumber() {
					var s2 = s.slice(index - 1);
					var r;
					if(peek == '.') {
						r = /^\.\d+(?:E[+-]?\d*)?\s*/i.exec(s2)[0];
					}
					else if(/^0x[\da-f]*/i.test(s2)) {
						r = /^0x[\da-f]*\s*/i.exec(s2)[0];
					}
					else {
						r = /^\d+\.?\d*(?:E[+-]?\d*)?\s*/i.exec(s2)[0];
					}
					index += r.length - 1;
					isReg = 0;
				}
			};
			function needParse(depPaths){
				var result = false;
				depPaths.forEach(function(path){
					if(path.id == "require"){
						result = true;
						return false;
					}
				});
				return result;
			}
			this.injectCommonjs();
			if(this.factory && needParse(this.depPaths)) {
				this.collectDeps();
			}
		});
	});
})();

/**
 * 可以使kvm加载css文件
 */
(function(){
	kvm.module.registerPlugin(function(API){
		API.registerDriverLoader('css',function(uri,callback){
			var doc = document;
			var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
			var ss = window.document.createElement( "link" );
			var sheets = window.document.styleSheets;
			var _this = this;
			ss.rel = "stylesheet";
			ss.href = uri;
			ss.media = "only x";
			if( callback ) {
				ss.onload = function(){
					callback && callback(null,ss);
				};

				ss.onerror = function(){
					callback && callback(true);
				};
			}
			head.appendChild(ss);
			ss.onloadcssdefined = function( cb ){
				var defined;
				for( var i = 0; i < sheets.length; i++ ){
					if( sheets[ i ].href && sheets[ i ].href.indexOf( uri ) > -1 ){
						defined = true;
					}
				}
				if( defined ){
					cb();
				} else {
					setTimeout(function() {
						ss.onloadcssdefined( cb );
					});
				}
			};
			ss.onloadcssdefined(function() {
				ss.media = _this.path.query && _this.path.query.media || "all";
			});
		});

		API.registerDriverLoaded(function (err,res) {
			var path = this.path;
			if(path.ext == "css" && !err){
				kvm.module.define(path.id, function(){
					return res;
				});
			}
		});
	});
})();

/**
 * 可以使kvm加载json文件
 */
/**
 * 可以使kvm支持包管理
 */
(function () {
	kvm.module.registerPlugin(function (API) {
		var Data = kvm.module.data();
		API.registerPathParser(function () {
			var baseUrl = Data.baseUrl;
			var packages = Data.packages;
			var packname, index,
				uri = this.uri || this.id;
			if(!uri) return;
			index = uri.indexOf("/");
			packname = uri.substr(0, index);
			if (packages && packages[packname]) {
				this.baseUrl = packages[packname].uri || packages[packname].url || baseUrl;
				this.uri = uri.substr(index + 1);
				this._parseVars();
			}
		});
	});
})();


/**
 * 可以使kvm支持包装器
 */
(function () {
	kvm.module.registerPlugin(function (API) {
		var Data = kvm.module.data();
		API.registerPathMaper(function () {
			var shim = Data.shims[this.id];
			if (shim) {
				this.uri = shim.uri || shim.url;
				this._parser();
			}
		});

		API.registerDriverBeforeLoad(function () {
			var path = this.path;
			var shim = Data.shims[path.id];
			if (shim) {
				if (shim.exports && !shim.factory) {
					if (window[shim.exports]) {
						this.module = API.createModule(path.id, function () {
							return window[shim.exports];
						});
					}
				}
			}
		});

		API.registerDriverLoaded(function () {
			var path = this.path;
			var shim = Data.shims[path.id];
			if (shim && !path.getModule()) {
				if (kvm.isFunction(shim.factory) || kvm.isArray(shim.factory)) {
					kvm.module.define(path.id, shim.factory);
				} else {
					kvm.module.define(path.id, function () {
						return window[shim.exports]
					});
				}
			}
		});
	});
})();


/**
 * 可以使kvm加载html模板
 */