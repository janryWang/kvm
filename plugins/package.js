/**
 * 可以使kvm支持包管理
 */
(function () {
	kvm.module.registerPlugin(function (API) {
		var baseUrl = kvm.module.data('baseUrl');
		var packages = kvm.module.data('packages');
		API.registerPathParser(function () {
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

