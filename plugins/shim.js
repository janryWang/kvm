/**
 * 可以使kvm支持包装器
 */
(function () {
	kvm.module.registerPlugin(function (API) {
		var shims = kvm.module.data('shims');
		API.registerPathMaper(function () {
			var shim = shims[this.id];
			if (shim) {
				this.uri = shim.uri || shim.url;
				this._parser();
			}
		});

		API.registerDriverBeforeLoad(function () {
			var path = this.path;
			var shim = shims[path.id];
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
			var shim = shims[path.id];
			if (shim && !path.getModule()) {
				if (kvm.isFunction(shim.factory)) {
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

