/**
 * 可以使kvm支持别名机制
 */
(function(){
	kvm.module.registerPlugin(function(API){
		API.registerPathMaper(function(){
			var alias = kvm.module.data('alias');
			if (this.isAbsolutePath(this.id)) return;
			if(alias[this.id]){
				this.uri = alias[this.id];
				this._parser();
			}
		});
	});
})();
