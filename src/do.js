var COMMANDS = {
	OPERATORS: "$remove,$set,$push,$slice,$concat,$pop,$unshift,$merge,$deep_merge,$clone,$find,$sort,$foreach".split(","),
	FILTERS: "$gt,$lt,$is,$not,$gte,$lte,$icontains,$contains,$in,$not_in,$and,$or".split(","),
	SORTS: "$desc,$asc".split(","),
	CLONES: "$white_list,$black_list,$filter,$deep".split(","),
	COMMONS: "$callback".split(",")
};
var KEYWORDS = (function () {
	var cmd_name,
		cmds_name,
		keywords,
		_i,
		_len,
		_ref;
	keywords = {};
	for (cmds_name in COMMANDS) {
		_ref = COMMANDS[cmds_name];
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			cmd_name = _ref[_i];
			keywords[cmd_name] = true;
		}
	}
	return keywords;
})();

function Do(data, cmds) {
	this.data = data;
	this._commands.__parent__ = this;
	this._filters.__parent__ = this;
	if (cmds) {
		this.exec(cmds);
	}
}

merge(Do.prototype, {
	_collect: function (obj) {
		var name,
			res;
		res = {
			operators: {},
			filters: {},
			sorts: {},
			clones: {},
			commons: {},
			props: {},
			value: null
		};
		if (!isReference(obj)) {
			res.value = obj;
			return res;
		}
		for (name in obj) {
			if (COMMANDS.OPERATORS.indexOf(name) > -1) {
				res.operators[name] = obj[name];
			} else if (COMMANDS.FILTERS.indexOf(name) > -1) {
				res.filters[name] = obj[name];
			} else if (COMMANDS.SORTS.indexOf(name) > -1) {
				res.sorts[name] = obj[name];
			} else if (COMMANDS.CLONES.indexOf(name) > -1) {
				res.clones[name] = obj[name];
			} else if (COMMANDS.COMMONS.indexOf(name) > -1) {
				res.commons[name] = obj[name];
			} else {
				res.props[name] = obj[name];
			}
		}
		return res;
	},
	_filters: {
		$is: function (a, b) {
			return a === b;
		},
		$not: function (a, b) {
			return a !== b;
		},
		$gt: function (a, b) {
			return a > b;
		},
		$lt: function (a, b) {
			return a < b;
		},
		$gte: function (a, b) {
			return a >= b;
		},
		$lte: function (a, b) {
			return a <= b;
		},
		$icontains: function (a, b) {
			return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
		},
		$contains: function (a, b) {
			return a.indexOf(b) > -1;
		},
		$in: function (a, b) {
			return b.indexOf(a) > -1;
		},
		$not_in: function (a, b) {
			return b.indexOf(a) === -1;
		}
	},
	_commands:{
		$set: function (ref, collected) {
			var prop_name,
				prop_val,
				_ref,
				_results;
			_ref = collected.props;
			_results = [];
			for (prop_name in _ref) {
				prop_val = _ref[prop_name];
				if (isReference(prop_val)) {
					ref[prop_name] = ref[prop_name] || prop_val.constructor();
					_results.push(this.$set(ref[prop_name], this.__parent__._collect(prop_val)));
				} else {
					_results.push(ref[prop_name] = prop_val);
				}
			}
			return _results;
		},
		$remove: function (ref, collected) {
			var prop_name,
				prop_val,
				_ref,
				_results;
			_ref = collected.props;
			_results = [];
			for (prop_name in _ref) {
				prop_val = _ref[prop_name];
				if (!isArray(ref) && prop_val === true) {
					_results.push(delete ref[prop_name]);
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		},
		$slice: function (ref, collected) {
			var prop_name,
				prop_val,
				_ref,
				_results;
			_ref = collected.props;
			_results = [];
			for (prop_name in _ref) {
				prop_val = _ref[prop_name];
				if (ref[prop_name] && isArray(ref[prop_name])) {
					if (!isArray(prop_val)) {
						prop_val = [prop_val];
					}
					_results.push(ref[prop_name] = ref[prop_name].slice.apply(ref[prop_name], prop_val));
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		},
		$push: function (ref, collected) {
			var prop_name,
				prop_val,
				_ref,
				_results;
			_ref = collected.props;
			_results = [];
			for (prop_name in _ref) {
				prop_val = _ref[prop_name];
				if (ref[prop_name] && isArray(ref[prop_name])) {
					_results.push(ref[prop_name].push(prop_val));
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		},
		$concat: function (ref, collected) {
			var prop_name,
				prop_val,
				_ref,
				_results;
			_ref = collected.props;
			_results = [];
			for (prop_name in _ref) {
				prop_val = _ref[prop_name];
				if (ref[prop_name] && isArray(ref[prop_name])) {
					if (!isArray(prop_val)) {
						prop_val = [prop_val];
					}
					_results.push(ref[prop_name] = ref[prop_name].concat(prop_val));
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		},
		$pop: function (ref, collected) {
			var prop_name,
				prop_val,
				_ref,
				_results;
			_ref = collected.props;
			_results = [];
			for (prop_name in _ref) {
				prop_val = _ref[prop_name];
				if (ref[prop_name] && isArray(ref[prop_name])) {
					_results.push(ref[prop_name].pop());
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		},
		$unshift: function (ref, collected) {
			var prop_name,
				prop_val,
				_ref,
				_results;
			_ref = collected.props;
			_results = [];
			for (prop_name in _ref) {
				prop_val = _ref[prop_name];
				if (ref[prop_name] && isArray(ref[prop_name])) {
					_results.push(ref[prop_name].unshift(prop_val));
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		},
		$merge: function (ref, collected) {
			return merge(ref, collected.props);
		},
		$deep_merge: function (ref, collected) {
			return merge(true, ref, collected.props);
		},
		$clone: function (ref, collected) {
			var blackList,
				callback,
				filter,
				isDeep,
				res,
				whiteList;
			isDeep = !!collected.clones.$deep;
			whiteList = collected.clones.$white_list;
			blackList = collected.clones.$black_list;
			filter = collected.clones.$filter;
			callback = collected.commons.$callback;
			if (!isEmpty(whiteList)) {
				res = copy(isDeep, ref,
					function (item, name, path) {
						var filter_res;
						if (inPaths(path, whiteList, true)) {
							if (!isEmpty(blackList)) {
								if (!inPaths(path, blackList)) {
									if (isFunction(filter)) {
										filter_res = filter(item, name, path);
									}
									if (isBoolean(filter_res)) {
										if (filter_res) {
											return true;
										} else {
											return false;
										}
									} else {
										return true;
									}
								} else {
									return false;
								}
							} else {
								return true;
							}
						} else {
							return false;
						}
					});
			} else if (!isEmpty(blackList)) {
				res = copy(isDeep, ref,
					function (item, name, path) {
						var filter_res;
						if (!inPaths(path, blackList)) {
							if (isFunction(filter)) {
								filter_res = filter(item, name, path);
							}
							if (isBoolean(filter_res)) {
								if (filter_res) {
									return true;
								} else {
									return false;
								}
							} else {
								return true;
							}
						} else {
							return false;
						}
					});
			} else if (isFunction(filter)) {
				res = copy(isDeep, ref,
					function (item, name, path) {
						var filter_res;
						if (isFunction(filter)) {
							filter_res = filter(item, name, path);
						}
						if (isBoolean(filter_res)) {
							if (filter_res) {
								return true;
							} else {
								return false;
							}
						} else {
							return true;
						}
					});
			} else {
				res = copy(isDeep, ref);
			}
			if (isFunction(callback)) {
				return callback(res);
			}
		},
		$find: function (ref, collected) {
			var callback,
				condition_length,
				res,
				_this;
			_this = this;
			callback = collected.commons.$callback;
			condition_length = Object.keys(collected.filters).length;
			res = [];
			if (!isEmpty(collected.filters)) {
				forEach(ref,//遍历数组
					function (ref_item) {
						var ok1 = 0;
						var isAnd1 = _isAnd(collected.filters.$and,collected.filters.$or);
						if (!isEmpty(ref_item)) {
							forEach(collected.filters,//遍历筛选器,两层条件
								function (filter_body, filter_name) {
									if(filter_name == "$or" || filter_name == "$and") return true;
									var ok2 = 0;
									var isAnd2 = _isAnd(filter_body.$and,filter_body.$or);
									forEach(filter_body,
										function (item, key) {
											if(key == "$or" || key == "$and") return true;
											if (_this.__parent__._filters[filter_name](ref_item[key], item)) {
												if(isAnd2) {
													return ok2++;
												} else {
													ok2++;
													return false;
												}
											}
										});
									if(isAnd2) {
										if (ok2 >= getKeyLength(filter_body)) {//入内层筛选条件全部成立，组合条件成立
											ok1++;
										}
									} else {
										if(ok2 > 0){
											ok1++;
										}
									}
								});
							if(!isAnd1) {
								if (ok1 >= condition_length) {//如果外层筛选条件全部成立则推入数组
									res.push(ref_item);
								}
							} else {
								if (ok1 > 0 ) {
									res.push(ref_item);
								}
							}
						}
					});
			} else {
				res = ref;
			}
			if (isFunction(callback)) {
				return callback(res);
			}
			function _isAnd(and,or){
				var res = true;
				if(and == or){
					return res;
				} else {
					if(and == undefined || and == null){
						if(or){
							res = !or;
						}
					} else {
						res = and;
					}
				}
				return res;
			}
		},
		$foreach: function (ref, collected) {
			if (isFunction(collected.value)) {
				return forEach(ref, collected.value);
			}
		},
		$sort: function (ref, collected) {
			var key,
				val,
				_ref,
				_results;
			if (isArray(ref) && isReference(collected.value)) {
				_ref = collected.props;
				_results = [];
				for (key in _ref) {
					val = _ref[key];
					if (val === "desc") {
						_results.push(ref.sort(function (a, b) {
							if (isReference(a) && isReference(b)) {
								if (a[key] < b[key]) {
									return 1;
								} else {
									return -1;
								}
							} else {
								if (a < b) {
									return 1;
								} else {
									return -1;
								}
							}
						}));
					} else {
						_results.push(ref.sort(function (a, b) {
							if (isReference(a) && isReference(b)) {
								if (a[key] > b[key]) {
									return 1;
								} else {
									return -1;
								}
							} else {
								if (a > b) {
									return 1;
								} else {
									return -1;
								}
							}
						}));
					}
				}
				return _results;
			} else {
				if (collected.value === "desc") {
					return ref.sort(function (a, b) {
						return b - a;
					});
				} else {
					return ref.sort(function (a, b) {
						return a - b;
					});
				}
			}
		}
	},
	_exec:function (ref, cmd_obj) {
		var cmd_body,
			cmd_name,
			_results;
		_results = [];
		for (cmd_name in cmd_obj) {
			cmd_body = cmd_obj[cmd_name];
			if (this._commands[cmd_name]) {
				_results.push(this._commands[cmd_name](ref, this._collect(cmd_body)));
			} else if (isReference(cmd_body) && !KEYWORDS[cmd_name]) {
				ref[cmd_name] = ref[cmd_name] || cmd_body.constructor();
				_results.push(this._exec(ref[cmd_name], cmd_body));
			} else {
				_results.push(void 0);
			}
		}
		return _results;
	},
	exec:function(cmds){
		return this._exec(this.data, cmds);
	}
});

Do.exec = function (data, cmds, hook) {
	isFunction(hook) && crawlObject(cmds, function (val, key) {
		var old_callback;
		if (key == "$find" || key == "$clone") {
			old_callback = val.$callback || function () {
			};
			val.$callback = function () {
				var args = toArray(arguments);
				hook.apply(null, args);
				old_callback.apply(null, args);
			};
		}
	});
	return new Do(data, cmds);
};
