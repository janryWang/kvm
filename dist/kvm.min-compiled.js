/**
 ** kvm.js - 一款兼容AMD,CMD,angular模块规范同时支持依赖注入的模块管理器
 ** @author Janry
 ** @version v0.1.6
 **/
"use strict";

!(function (global) {
  function _type(e) {
    return Object.prototype.toString.call(e);
  }function isReference(e) {
    return isArray(e) || isObject(e);
  }function isValue(e) {
    return !isReference(e);
  }function isEmpty(e) {
    if (null == e) {
      return !0;
    }if (e.length > 0) {
      return !1;
    }if (0 === e.length) {
      return !0;
    }for (var n in e) if (hasOwnProperty.call(e, n)) {
      return !1;
    }return !0;
  }function toArray() {
    var e;return (e = [].slice.apply(arguments), [].slice.apply(e[0], e.slice(1)));
  }function getKeyLength(e) {
    return isArray(e) ? e.length : isObject(e) ? Object.keys(e).length : 0;
  }function unique(e) {
    for (var n = 0; n < e.length; ++n) for (var t = n + 1; t < e.length; ++t) e[n] === e[t] && e.splice(t--, 1);return e;
  }function bind(e, n) {
    var t = toArray(arguments);return (t = t.slice(2), function () {
      return isFunction(e) ? e.apply(n, toArray(arguments).concat(t)) : void 0;
    });
  }function forEach(e, n, t) {
    var r, i, o, s;if (isFunction(n)) {
      if (isReference(e)) {
        for (i = Object.keys(e), o = i.length, r = 0, s = [], 0 == o && isFunction(t) && t(); o > r && n(e[i[r]], i[r]) !== !1;) s.push(r++);return s;
      }isFunction(t) && t();
    }
  }function guid() {
    function e() {
      return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
    }return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e();
  }function eachTask() {
    var e,
        n,
        t,
        r = toArray(arguments),
        i = [];isArray(r[0]) && (e = r[0], 2 == r.length && (t = r[1]), r.length > 2 && (n = r[1], t = r[2]), (function o(e, r) {
      var s,
          u,
          c = e.length;c > r && (s = function () {
        i = toArray(arguments), c > r + 1 ? o(e, r + 1) : t.apply(null, i);
      }, u = function () {
        i = toArray(arguments), isFunction(n) ? (i.unshift(s), n.apply(null, i)) : c > r + 1 ? o(e, r + 1) : t.apply(null, i);
      }, isFunction(e[r]) ? (i.unshift(u), e[r].apply(null, i)) : isFunction(n) && (i = [e[r], s], n.apply(null, i)));
    })(e, 0));
  }function merge() {
    var _arguments = arguments;
    var _again = true;

    _function: while (_again) {
      e = n = t = r = i = undefined;
      _again = false;
      var e,
          n,
          t,
          r = !1,
          i = !0;e = toArray(_arguments), isBoolean(e[0]) && (r = e[0], e = e.slice(1)), isFunction(e[e.length - 1]) && (t = e[e.length - 1], e.pop()), isBoolean(e[e.length - 1]) && (i = e[e.length - 1], e.pop()), n = e.length;
      if (2 > n) {
        return e[0];
      } else {
        if (2 === n) {
          return (forEach(e[1], function (n, o) {
            isFunction(t) && t(o, e[0], e[1]), void 0 !== e[1][o] && null !== e[1][o] && (i ? (isReference(e[1][o]) && (e[0][o] = e[0][o] || (isArray(e[1][o]) ? [] : {})), r && isReference(n) ? merge(r, e[0][o], n, i, t) : e[0][o] = n) : e[0][o] || (isReference(e[1][o]) && (e[0][o] = e[0][o] || (isArray(e[1][o]) ? [] : {})), r && isReference(n) ? merge(r, e[0][o], n, i, t) : e[0][o] = n));
          }), e[0]);
        } else {
          _arguments = [r, e[0], merge.apply(null, [r].concat(e.slice(1)))];
          _again = true;
          continue _function;
        }
      }
    }
  }function copy() {
    var e, n, t, r, i, o;return (e = toArray(arguments), t = !1, isBoolean(e[0]) && (t = e[0] === !0 ? !0 : !1, e = e.slice(1)), isValue(e[0]) ? e[0] : (n = e[1] && isFunction(e[1]) ? e[1] : !1, i = e[2] && isString(e[2]) ? e[2] : "", r = isArray(e[0]) ? 1 : 2, o = e[0].constructor(), forEach(e[0], function (e, s) {
      var u, c;c = i ? 2 === r ? i + "." + s : i + "[" + s + "]" : s, n ? (u = n(e, s, c), isBoolean(u) ? u && t && isReference(e) ? (o[s] = copy(t, e, n, c), c = i) : o[s] = e : t && isReference(e) ? (o[s] = copy(t, e, n, c), c = i) : o[s] = e) : t && isReference(e) ? (o[s] = copy(t, e, n, c), c = i) : o[s] = e;
    }), o));
  }function Class(e, n) {
    return (e && e.constructor && isFunction(e.constructor) && e.constructor !== Object ? (_class = function () {
      return e.constructor.apply(this, toArray(arguments));
    }, _class.toString = function () {
      return e.constructor.toString();
    }) : _class = function () {}, merge(_class.prototype, e), merge(_class, n), _class);
  }for (var TYPES = "Function,String,Array,Object,Number,Boolean".split(","), hasOwnProperty = Object.prototype.hasOwnProperty, i = 0; i < TYPES.length; i++) eval("function is" + TYPES[i] + "(val){return _type(val) === \"[object " + TYPES[i] + "]\"};");Class.inherit = function () {
    function e(e, n) {
      function t() {
        return e.apply(this, n);
      }return (t.prototype = e.prototype, new t());
    }function n() {
      var t = e(i, toArray(arguments));return (merge(this, t, !1), this.$super = n, this.$parent && isArray(this.$parent) ? this.$parent.push(t) : this.$parent = [t], t);
    }var t = toArray(arguments);if (2 == t.length) {
      var r = t[0],
          i = t[1];isFunction(r) && isFunction(i) && (merge(r.prototype, i.prototype, !1, function (e, n, t) {
        if (t.$$isprotocol === !0 && isFunction(t[e]) && !isFunction(n[e])) throw "The subclass does not follow protocol";
      }), r.prototype.$super = n, r.prototype.$parent = i.prototype, r.prototype.constructor = r);
    } else if (t.length > 2) for (var o = 1; o < t.length; o++) Class.inherit(t[0], t[o]);
  }, Class.extend = function (e, n, t) {
    isFunction(e) && (merge(e.prototype, n), merge(e, t));
  }, Class.protocol = function (e) {
    return (e.$$isprotocol = !0, Class(e));
  };var Emitter = Class({ constructor: function constructor(e) {
      this.__$$events__ = e ? e : {};
    }, $on: function $on(e, n) {
      var t = this;return (e = e.split(","), forEach(e, function (e) {
        isFunction(n) && (t.__$$events__[e] && isArray(t.__$$events__[e]) ? t.__$$events__[e].push(n) : t.__$$events__[e] = [n]);
      }), this);
    }, $one: function $one(e, n) {
      var t = this;return (e = e.split(","), forEach(e, function (e) {
        isFunction(n) && (t.__$$events__[e] || (t.__$$events__[e] = [n]));
      }), this);
    }, $emit: function $emit(e) {
      var n = toArray(arguments),
          t = 0,
          r = this.__$$events__[e];if (r && isArray(r)) for (t; t < r.length; t++) r[t].apply(null, n.slice(1));return this;
    }, $remove: function $remove(e, n) {
      var t = this.__$$events__[e];if (t && isArray(t)) if (n) for (var r = t.length - 1; r >= 0; r--) n === t[r] && t.splice(r, 1);else delete this.__$$events__[e];return this;
    } });Manager.define("$class", function () {
    return Class;
  }), Manager.define("$emitter", function () {
    return Emitter;
  }), global.kvm = {}, merge(global.kvm, { isArray: isArray, isString: isString, isFunction: isFunction, isObject: isObject, isReference: isReference, isEmpty: isEmpty, isBoolean: isBoolean, getKeyLength: getKeyLength, isValue: isValue, guid: guid, unique: unique, toArray: toArray, bind: bind, forEach: forEach, merge: merge, eachTask: eachTask, copy: copy, Class: Class, Emitter: Emitter }), global.KVM = global.kvm, global.kvm.module = Manager, global.KVM.Module = Manager, global.define = Manager.define, global.define.amd = !0;
})(window), (function () {
  kvm.module.registerPlugin(function (e) {
    e.registerPathMaper(function () {
      var e = kvm.module.data("alias");this.isAbsolutePath(this.id) || e[this.id] && (this.uri = e[this.id], this._parser());
    });
  });
})(), (function () {
  kvm.module.registerPlugin(function (e) {
    e.registerModuleParser(function () {
      function n(e) {
        var n, t;for (n = 0; n < e.length; n++) for (t = n + 1; t < e.length; t++) e[n].equal(e[t]) && e.splice(t, 1);return e;
      }function t(e) {
        var n = !1;return (kvm.forEach(e, function (e) {
          return "require" == e.id ? (n = !0, !1) : void 0;
        }), n);
      }this.injectCommonjs = function () {
        var n = this;this.injectors.exports = function () {
          return (n.module.exports = n.module.exports || {}, n.module.exports);
        }, this.injectors.module = function () {
          return n.module;
        }, this.injectors.require = function () {
          return function (n) {
            var t = e.createPath(n),
                r = t.getModule();return r && r.module && r.module.exports ? r.module.exports : {};
          };
        };
      }, this.collectDeps = function () {
        var t;kvm.isFunction(this.factory) && (t = this.parseDependencies(this.factory.toString()), t = t.map(function (n) {
          return e.createPath(n);
        }), this.depPaths = n(this.depPaths.concat(t)));
      }, this.parseDependencies = function (e) {
        function n() {
          f = e.charAt(l++);
        }function t() {
          return /\s/.test(f);
        }function r() {
          return "\"" == f || "'" == f;
        }function i() {
          var t = l,
              r = f,
              i = e.indexOf(r, t);if (-1 == i) l = h;else if ("\\" != e.charAt(i - 1)) l = i + 1;else for (; h > l;) if ((n(), "\\" == f)) l++;else if (f == r) break;d && (g.push(e.slice(t, l - 1)), d = 0);
        }function o() {
          for (l--; h > l;) if ((n(), "\\" == f)) l++;else {
            if ("/" == f) break;if ("[" == f) for (; h > l;) if ((n(), "\\" == f)) l++;else if ("]" == f) break;
          }
        }function s() {
          return /[a-z_$]/i.test(f);
        }function u() {
          var n = e.slice(l - 1),
              t = /^[\w$]+/.exec(n)[0];m = ({ "if": 1, "for": 1, "while": 1, "with": 1 })[t], p = ({ "break": 1, "case": 1, "continue": 1, "debugger": 1, "delete": 1, "do": 1, "else": 1, "false": 1, "if": 1, "in": 1, "instanceof": 1, "return": 1, "typeof": 1, "void": 1 })[t], d = /^require\s*\(\s*(['"]).+?\1\s*\)/.test(n), d ? (t = /^require\s*\(\s*['"]/.exec(n)[0], l += t.length - 2) : l += /^[\w$]+(?:\s*\.\s*[\w$]+)*/.exec(n)[0].length - 1;
        }function c() {
          return /\d/.test(f) || "." == f && /\d/.test(e.charAt(l));
        }function a() {
          var n,
              t = e.slice(l - 1);n = "." == f ? /^\.\d+(?:E[+-]?\d*)?\s*/i.exec(t)[0] : /^0x[\da-f]*/i.test(t) ? /^0x[\da-f]*\s*/i.exec(t)[0] : /^\d+\.?\d*(?:E[+-]?\d*)?\s*/i.exec(t)[0], l += n.length - 1, p = 0;
        }if (-1 == e.indexOf("require")) return [];for (var f, l = 0, h = e.length, p = 1, d = 0, m = 0, v = [], g = []; h > l;) n(), t() || (r() ? (i(), p = 1) : "/" == f ? (n(), "/" == f ? (l = e.indexOf("\n", l), -1 == l && (l = e.length)) : "*" == f ? (l = e.indexOf("*/", l), -1 == l ? l = h : l += 2) : p ? (o(), p = 0) : (l--, p = 1)) : s() ? u() : c() ? a() : "(" == f ? (v.push(m), p = 1) : ")" == f ? p = v.pop() : (p = "]" != f, d = 0));return g;
      }, this.injectCommonjs(), this.factory && t(this.depPaths) && this.collectDeps();
    });
  });
})(), (function () {
  kvm.module.registerPlugin(function (e) {
    e.registerModuleParser(function () {
      function n(e) {
        var n, t;for (n = 0; n < e.length; n++) for (t = n + 1; t < e.length; t++) e[n].equal(e[t]) && e.splice(t, 1);return e;
      }function t(e) {
        var n = !1;return (kvm.forEach(e, function (e) {
          return "require" == e.id ? (n = !0, !1) : void 0;
        }), n);
      }this.injectCommonjs = function () {
        var n = this;this.injectors.exports = function () {
          return (n.module.exports = n.module.exports || {}, n.module.exports);
        }, this.injectors.module = function () {
          return n.module;
        }, this.injectors.require = function () {
          return function (n) {
            var t = e.createPath(n),
                r = t.getModule();return r && r.module && r.module.exports ? r.module.exports : {};
          };
        };
      }, this.collectDeps = function () {
        var t;kvm.isFunction(this.factory) && (t = this.parseDependencies(this.factory.toString()), t = t.map(function (n) {
          return e.createPath(n);
        }), this.depPaths = n(this.depPaths.concat(t)));
      }, this.parseDependencies = function (e) {
        function n() {
          f = e.charAt(l++);
        }function t() {
          return /\s/.test(f);
        }function r() {
          return "\"" == f || "'" == f;
        }function i() {
          var t = l,
              r = f,
              i = e.indexOf(r, t);if (-1 == i) l = h;else if ("\\" != e.charAt(i - 1)) l = i + 1;else for (; h > l;) if ((n(), "\\" == f)) l++;else if (f == r) break;d && (g.push(e.slice(t, l - 1)), d = 0);
        }function o() {
          for (l--; h > l;) if ((n(), "\\" == f)) l++;else {
            if ("/" == f) break;if ("[" == f) for (; h > l;) if ((n(), "\\" == f)) l++;else if ("]" == f) break;
          }
        }function s() {
          return /[a-z_$]/i.test(f);
        }function u() {
          var n = e.slice(l - 1),
              t = /^[\w$]+/.exec(n)[0];m = ({ "if": 1, "for": 1, "while": 1, "with": 1 })[t], p = ({ "break": 1, "case": 1, "continue": 1, "debugger": 1, "delete": 1, "do": 1, "else": 1, "false": 1, "if": 1, "in": 1, "instanceof": 1, "return": 1, "typeof": 1, "void": 1 })[t], d = /^require\s*\(\s*(['"]).+?\1\s*\)/.test(n), d ? (t = /^require\s*\(\s*['"]/.exec(n)[0], l += t.length - 2) : l += /^[\w$]+(?:\s*\.\s*[\w$]+)*/.exec(n)[0].length - 1;
        }function c() {
          return /\d/.test(f) || "." == f && /\d/.test(e.charAt(l));
        }function a() {
          var n,
              t = e.slice(l - 1);n = "." == f ? /^\.\d+(?:E[+-]?\d*)?\s*/i.exec(t)[0] : /^0x[\da-f]*/i.test(t) ? /^0x[\da-f]*\s*/i.exec(t)[0] : /^\d+\.?\d*(?:E[+-]?\d*)?\s*/i.exec(t)[0], l += n.length - 1, p = 0;
        }if (-1 == e.indexOf("require")) return [];for (var f, l = 0, h = e.length, p = 1, d = 0, m = 0, v = [], g = []; h > l;) n(), t() || (r() ? (i(), p = 1) : "/" == f ? (n(), "/" == f ? (l = e.indexOf("\n", l), -1 == l && (l = e.length)) : "*" == f ? (l = e.indexOf("*/", l), -1 == l ? l = h : l += 2) : p ? (o(), p = 0) : (l--, p = 1)) : s() ? u() : c() ? a() : "(" == f ? (v.push(m), p = 1) : ")" == f ? p = v.pop() : (p = "]" != f, d = 0));return g;
      }, this.injectCommonjs(), this.factory && t(this.depPaths) && this.collectDeps();
    });
  });
})(), (function () {
  kvm.module.registerPlugin(function (e) {
    e.registerDriverLoader("css", function (e, n) {
      var t = document,
          r = t.head || t.getElementsByTagName("head")[0] || t.documentElement,
          i = window.document.createElement("link"),
          o = window.document.styleSheets,
          s = this;i.rel = "stylesheet", i.href = e, i.media = "only x", n && (i.onload = function () {
        n && n(null, i);
      }, i.onerror = function () {
        n && n(!0);
      }), r.appendChild(i), i.onloadcssdefined = function (n) {
        for (var t, r = 0; r < o.length; r++) o[r].href && o[r].href.indexOf(e) > -1 && (t = !0);t ? n() : setTimeout(function () {
          i.onloadcssdefined(n);
        });
      }, i.onloadcssdefined(function () {
        i.media = s.path.query && s.path.query.media || "all";
      });
    }), e.registerDriverLoaded(function (e, n) {
      var t = this.path;"css" != t.ext || e || kvm.module.define(t.id, function () {
        return n;
      });
    });
  });
})(), define("$do", function () {
  function e(n, t, r) {
    r = kvm.isBoolean(r) && r === !1 ? !1 : !0, kvm.isFunction(t) && kvm.forEach(n, function (n, i) {
      kvm.isReference(n) && r ? (t(n, i), e(n, t)) : t(n, i);
    });
  }function n(e, n, t) {
    var r, i;return (r = !1, i = function (e, n) {
      var t, r, i;for (t = e.length, r = n.length, i = 0; r > i;) {
        if (n.charAt(i) !== e.charAt(i)) return !1;i++;
      }if (i === r) {
        if (t === r) return !0;if (t > r && "[.".indexOf(e.charAt(r)) > -1) return !0;
      }
    }, kvm.forEach(n, function (n) {
      return (r = t ? i(n, e) : i(e, n), r ? !1 : void 0);
    }), r);
  }function t(e, n) {
    this.data = e, this._commands.__parent__ = this, this._filters.__parent__ = this, n && this.exec(n);
  }var r = { OPERATORS: "$remove,$set,$push,$slice,$concat,$pop,$unshift,$merge,$deep_merge,$clone,$find,$sort,$foreach".split(","), FILTERS: "$gt,$lt,$is,$not,$gte,$lte,$icontains,$contains,$in,$not_in,$and,$or".split(","), SORTS: "$desc,$asc".split(","), CLONES: "$white_list,$black_list,$filter,$deep".split(","), COMMONS: "$callback".split(",") },
      i = (function () {
    var e, n, t, i, o, s;t = {};for (n in r) for (s = r[n], i = 0, o = s.length; o > i; i++) e = s[i], t[e] = !0;return t;
  })();return (kvm.merge(t.prototype, { _collect: function _collect(e) {
      var n, t;if ((t = { operators: {}, filters: {}, sorts: {}, clones: {}, commons: {}, props: {}, value: null }, !kvm.isReference(e))) {
        return (t.value = e, t);
      }for (n in e) r.OPERATORS.indexOf(n) > -1 ? t.operators[n] = e[n] : r.FILTERS.indexOf(n) > -1 ? t.filters[n] = e[n] : r.SORTS.indexOf(n) > -1 ? t.sorts[n] = e[n] : r.CLONES.indexOf(n) > -1 ? t.clones[n] = e[n] : r.COMMONS.indexOf(n) > -1 ? t.commons[n] = e[n] : t.props[n] = e[n];return t;
    }, _filters: { $is: function $is(e, n) {
        return e === n;
      }, $not: function $not(e, n) {
        return e !== n;
      }, $gt: function $gt(e, n) {
        return e > n;
      }, $lt: function $lt(e, n) {
        return n > e;
      }, $gte: function $gte(e, n) {
        return e >= n;
      }, $lte: function $lte(e, n) {
        return n >= e;
      }, $icontains: function $icontains(e, n) {
        return e.toLowerCase().indexOf(n.toLowerCase()) > -1;
      }, $contains: function $contains(e, n) {
        return e.indexOf(n) > -1;
      }, $in: function $in(e, n) {
        return n.indexOf(e) > -1;
      }, $not_in: function $not_in(e, n) {
        return -1 === n.indexOf(e);
      } }, _commands: { $set: function $set(e, n) {
        var t, r, i, o;i = n.props, o = [];for (t in i) r = i[t], kvm.isReference(r) ? (e[t] = e[t] || r.constructor(), o.push(this.$set(e[t], this.__parent__._collect(r)))) : o.push(e[t] = r);return o;
      }, $remove: function $remove(e, n) {
        var t, r, i, o;i = n.props, o = [];for (t in i) r = i[t], o.push(kvm.isArray(e) || r !== !0 ? void 0 : delete e[t]);return o;
      }, $slice: function $slice(e, n) {
        var t, r, i, o;i = n.props, o = [];for (t in i) r = i[t], e[t] && kvm.isArray(e[t]) ? (kvm.isArray(r) || (r = [r]), o.push(e[t] = e[t].slice.apply(e[t], r))) : o.push(void 0);return o;
      }, $push: function $push(e, n) {
        var t, r, i, o;i = n.props, o = [];for (t in i) r = i[t], o.push(e[t] && kvm.isArray(e[t]) ? e[t].push(r) : void 0);return o;
      }, $concat: function $concat(e, n) {
        var t, r, i, o;i = n.props, o = [];for (t in i) r = i[t], e[t] && kvm.isArray(e[t]) ? (kvm.isArray(r) || (r = [r]), o.push(e[t] = e[t].concat(r))) : o.push(void 0);return o;
      }, $pop: function $pop(e, n) {
        var t, r, i, o;i = n.props, o = [];for (t in i) r = i[t], o.push(e[t] && kvm.isArray(e[t]) ? e[t].pop() : void 0);return o;
      }, $unshift: function $unshift(e, n) {
        var t, r, i, o;i = n.props, o = [];for (t in i) r = i[t], o.push(e[t] && kvm.isArray(e[t]) ? e[t].unshift(r) : void 0);return o;
      }, $merge: function $merge(e, n) {
        return kvm.merge(e, n.props);
      }, $deep_merge: function $deep_merge(e, n) {
        return kvm.merge(!0, e, n.props);
      }, $clone: function $clone(e, t) {
        var r, i, o, s, u, c;return (s = !!t.clones.$deep, c = t.clones.$white_list, r = t.clones.$black_list, o = t.clones.$filter, i = t.commons.$callback, u = kvm.isEmpty(c) ? kvm.isEmpty(r) ? kvm.isFunction(o) ? kvm.copy(s, e, function (e, n, t) {
          var r;return (kvm.isFunction(o) && (r = o(e, n, t)), kvm.isBoolean(r) ? r ? !0 : !1 : !0);
        }) : kvm.copy(s, e) : kvm.copy(s, e, function (e, t, i) {
          var s;return n(i, r) ? !1 : (kvm.isFunction(o) && (s = o(e, t, i)), kvm.isBoolean(s) ? s ? !0 : !1 : !0);
        }) : kvm.copy(s, e, function (e, t, i) {
          var s;return n(i, c, !0) ? kvm.isEmpty(r) ? !0 : n(i, r) ? !1 : (kvm.isFunction(o) && (s = o(e, t, i)), kvm.isBoolean(s) ? s ? !0 : !1 : !0) : !1;
        }), kvm.isFunction(i) ? i(u) : void 0);
      }, $find: function $find(e, n) {
        function t(e, n) {
          var t = !0;return e == n ? t : (void 0 == e || null == e ? n && (t = !n) : t = e, t);
        }var r, i, o, s;return (s = this, r = n.commons.$callback, i = Object.keys(n.filters).length, o = [], kvm.isEmpty(n.filters) ? o = e : kvm.forEach(e, function (e) {
          var r = 0,
              u = t(n.filters.$and, n.filters.$or);kvm.isEmpty(e) || (kvm.forEach(n.filters, function (n, i) {
            if ("$or" == i || "$and" == i) return !0;var o = 0,
                u = t(n.$and, n.$or);kvm.forEach(n, function (n, t) {
              return "$or" == t || "$and" == t ? !0 : s.__parent__._filters[i](e[t], n) ? u ? o++ : (o++, !1) : void 0;
            }), u ? o >= kvm.getKeyLength(n) && r++ : o > 0 && r++;
          }), u ? r > 0 && o.push(e) : r >= i && o.push(e));
        }), kvm.isFunction(r) ? r(o) : void 0);
      }, $foreach: function $foreach(e, n) {
        return kvm.isFunction(n.value) ? kvm.forEach(e, n.value) : void 0;
      }, $sort: function $sort(e, n) {
        var t, r, i, o;if (kvm.isArray(e) && kvm.isReference(n.value)) {
          i = n.props, o = [];for (t in i) r = i[t], o.push("desc" === r ? e.sort(function (e, n) {
            return kvm.isReference(e) && kvm.isReference(n) ? e[t] < n[t] ? 1 : -1 : n > e ? 1 : -1;
          }) : e.sort(function (e, n) {
            return kvm.isReference(e) && kvm.isReference(n) ? e[t] > n[t] ? 1 : -1 : e > n ? 1 : -1;
          }));return o;
        }return e.sort("desc" === n.value ? function (e, n) {
          return n - e;
        } : function (e, n) {
          return e - n;
        });
      } }, _exec: function _exec(e, n) {
      var t, r, o;o = [];for (r in n) t = n[r], this._commands[r] ? o.push(this._commands[r](e, this._collect(t))) : kvm.isReference(t) && !i[r] ? (e[r] = e[r] || t.constructor(), o.push(this._exec(e[r], t))) : o.push(void 0);return o;
    }, exec: function exec(e) {
      return this._exec(this.data, e);
    } }), t.exec = function (n, r, i) {
    return (kvm.isFunction(i) && e(r, function (e, n) {
      var t;("$find" == n || "$clone" == n) && (t = e.$callback || function () {}, e.$callback = function () {
        var e = kvm.toArray(arguments);i.apply(null, e), t.apply(null, e);
      });
    }), new t(n, r));
  }, t);
}), (function () {
  kvm.module.registerPlugin(function (e) {
    var n = kvm.module.data("baseUrl"),
        t = kvm.module.data("packages");e.registerPathParser(function () {
      var e,
          r,
          i = this.uri || this.id;i && (r = i.indexOf("/"), e = i.substr(0, r), t && t[e] && (this.baseUrl = t[e].uri || t[e].url || n, this.uri = i.substr(r + 1), this._parseVars()));
    });
  });
})(), (function () {
  kvm.module.registerPlugin(function (e) {
    var n = kvm.module.data("shims");e.registerPathMaper(function () {
      var e = n[this.id];e && (this.uri = e.uri || e.url, this._parser());
    }), e.registerDriverBeforeLoad(function () {
      var t = this.path,
          r = n[t.id];r && r.exports && !r.factory && window[r.exports] && (this.module = e.createModule(t.id, function () {
        return window[r.exports];
      }));
    }), e.registerDriverLoaded(function () {
      var e = this.path,
          t = n[e.id];t && !e.getModule() && (kvm.isFunction(t.factory) ? kvm.module.define(e.id, t.factory) : kvm.module.define(e.id, function () {
        return window[t.exports];
      }));
    });
  });
})();

//# sourceMappingURL=kvm.min-compiled.js.map