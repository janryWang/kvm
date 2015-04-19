import * as utils from "utils";

export class Emitter {
	constructor(events) {
		if (events)
			this.$$EVENTS = events;
		else
			this.$$EVENTS = {};

	}

	$on(names, fn) {
		let _this = this;
		names.split(",").forEach(function (_name) {
			if (utils.isFunction(fn)) {
				if (_this.$$EVENTS[_name] && utils.isArray(_this.$$EVENTS[_name]))
					_this.$$EVENTS[_name].push(fn);
				else _this.$$EVENTS[_name] = [fn];
			}
		});
		return this;
	}

	$one(names, fn) {
		let _this = this;
		names.split(",").forEach(function (_name) {
			if (utils.isFunction(fn)) {
				if (!_this.$$EVENTS[_name])
					_this.$$EVENTS[_name] = [fn];
			}
		});
		return this;
	}

	$emit(_name,...args) {

		let events = this.$$EVENTS[_name];

		if (events && Array.isArray(events)) {
			for (let i = 0; i < events.length; i++) {
				events[i].apply(null, args.slice(1));
			}
		}
		return this;
	}

	$remove(_name, fn) {
		let events = this.$$EVENTS[_name];
		if (events && Array.isArray(events)) {
			if (fn) {
				for (var i = events.length - 1; i >= 0; i--) {
					if (fn === events[i]) {
						events.splice(i, 1);
					}
				}
			} else {
				delete this.$$EVENTS[_name];
			}
		}
		return this;
	}
}