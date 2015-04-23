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

