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
