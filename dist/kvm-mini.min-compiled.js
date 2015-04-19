/**
 ** kvm.js - 一款兼容AMD,CMD,angular模块规范同时支持依赖注入的模块管理器
 ** @author Janry
 ** @version v0.1.6
 **/
"use strict";

!(function (global) {
  function _type(n) {
    return Object.prototype.toString.call(n);
  }function isReference(n) {
    return isArray(n) || isObject(n);
  }function isValue(n) {
    return !isReference(n);
  }function isEmpty(n) {
    if (null == n) {
      return !0;
    }if (n.length > 0) {
      return !1;
    }if (0 === n.length) {
      return !0;
    }for (var t in n) if (hasOwnProperty.call(n, t)) {
      return !1;
    }return !0;
  }function toArray() {
    var n;return (n = [].slice.apply(arguments), [].slice.apply(n[0], n.slice(1)));
  }function getKeyLength(n) {
    return isArray(n) ? n.length : isObject(n) ? Object.keys(n).length : 0;
  }function unique(n) {
    for (var t = 0; t < n.length; ++t) for (var e = t + 1; e < n.length; ++e) n[t] === n[e] && n.splice(e--, 1);return n;
  }function bind(n, t) {
    var e = toArray(arguments);return (e = e.slice(2), function () {
      return isFunction(n) ? n.apply(t, toArray(arguments).concat(e)) : void 0;
    });
  }function forEach(n, t, e) {
    var r, i, o, s;if (isFunction(t)) {
      if (isReference(n)) {
        for (i = Object.keys(n), o = i.length, r = 0, s = [], 0 == o && isFunction(e) && e(); o > r && t(n[i[r]], i[r]) !== !1;) s.push(r++);return s;
      }isFunction(e) && e();
    }
  }function guid() {
    function n() {
      return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
    }return n() + n() + "-" + n() + "-" + n() + "-" + n() + "-" + n() + n() + n();
  }function eachTask() {
    var n,
        t,
        e,
        r = toArray(arguments),
        i = [];isArray(r[0]) && (n = r[0], 2 == r.length && (e = r[1]), r.length > 2 && (t = r[1], e = r[2]), (function o(n, r) {
      var s,
          a,
          u = n.length;u > r && (s = function () {
        i = toArray(arguments), u > r + 1 ? o(n, r + 1) : e.apply(null, i);
      }, a = function () {
        i = toArray(arguments), isFunction(t) ? (i.unshift(s), t.apply(null, i)) : u > r + 1 ? o(n, r + 1) : e.apply(null, i);
      }, isFunction(n[r]) ? (i.unshift(a), n[r].apply(null, i)) : isFunction(t) && (i = [n[r], s], t.apply(null, i)));
    })(n, 0));
  }function merge() {
    var _arguments = arguments;
    var _again = true;

    _function: while (_again) {
      n = t = e = r = i = undefined;
      _again = false;
      var n,
          t,
          e,
          r = !1,
          i = !0;n = toArray(_arguments), isBoolean(n[0]) && (r = n[0], n = n.slice(1)), isFunction(n[n.length - 1]) && (e = n[n.length - 1], n.pop()), isBoolean(n[n.length - 1]) && (i = n[n.length - 1], n.pop()), t = n.length;
      if (2 > t) {
        return n[0];
      } else {
        if (2 === t) {
          return (forEach(n[1], function (t, o) {
            isFunction(e) && e(o, n[0], n[1]), void 0 !== n[1][o] && null !== n[1][o] && (i ? (isReference(n[1][o]) && (n[0][o] = n[0][o] || (isArray(n[1][o]) ? [] : {})), r && isReference(t) ? merge(r, n[0][o], t, i, e) : n[0][o] = t) : n[0][o] || (isReference(n[1][o]) && (n[0][o] = n[0][o] || (isArray(n[1][o]) ? [] : {})), r && isReference(t) ? merge(r, n[0][o], t, i, e) : n[0][o] = t));
          }), n[0]);
        } else {
          _arguments = [r, n[0], merge.apply(null, [r].concat(n.slice(1)))];
          _again = true;
          continue _function;
        }
      }
    }
  }function copy() {
    var n, t, e, r, i, o;return (n = toArray(arguments), e = !1, isBoolean(n[0]) && (e = n[0] === !0 ? !0 : !1, n = n.slice(1)), isValue(n[0]) ? n[0] : (t = n[1] && isFunction(n[1]) ? n[1] : !1, i = n[2] && isString(n[2]) ? n[2] : "", r = isArray(n[0]) ? 1 : 2, o = n[0].constructor(), forEach(n[0], function (n, s) {
      var a, u;u = i ? 2 === r ? i + "." + s : i + "[" + s + "]" : s, t ? (a = t(n, s, u), isBoolean(a) ? a && e && isReference(n) ? (o[s] = copy(e, n, t, u), u = i) : o[s] = n : e && isReference(n) ? (o[s] = copy(e, n, t, u), u = i) : o[s] = n) : e && isReference(n) ? (o[s] = copy(e, n, t, u), u = i) : o[s] = n;
    }), o));
  }function Class(n, t) {
    return (n && n.constructor && isFunction(n.constructor) && n.constructor !== Object ? (_class = function () {
      return n.constructor.apply(this, toArray(arguments));
    }, _class.toString = function () {
      return n.constructor.toString();
    }) : _class = function () {}, merge(_class.prototype, n), merge(_class, t), _class);
  }for (var TYPES = "Function,String,Array,Object,Number,Boolean".split(","), hasOwnProperty = Object.prototype.hasOwnProperty, i = 0; i < TYPES.length; i++) eval("function is" + TYPES[i] + "(val){return _type(val) === \"[object " + TYPES[i] + "]\"};");Class.inherit = function () {
    function n(n, t) {
      function e() {
        return n.apply(this, t);
      }return (e.prototype = n.prototype, new e());
    }function t() {
      var e = n(i, toArray(arguments));return (merge(this, e, !1), this.$super = t, this.$parent && isArray(this.$parent) ? this.$parent.push(e) : this.$parent = [e], e);
    }var e = toArray(arguments);if (2 == e.length) {
      var r = e[0],
          i = e[1];isFunction(r) && isFunction(i) && (merge(r.prototype, i.prototype, !1, function (n, t, e) {
        if (e.$$isprotocol === !0 && isFunction(e[n]) && !isFunction(t[n])) throw "The subclass does not follow protocol";
      }), r.prototype.$super = t, r.prototype.$parent = i.prototype, r.prototype.constructor = r);
    } else if (e.length > 2) for (var o = 1; o < e.length; o++) Class.inherit(e[0], e[o]);
  }, Class.extend = function (n, t, e) {
    isFunction(n) && (merge(n.prototype, t), merge(n, e));
  }, Class.protocol = function (n) {
    return (n.$$isprotocol = !0, Class(n));
  };var Emitter = Class({ constructor: function constructor(n) {
      this.__$$events__ = n ? n : {};
    }, $on: function $on(n, t) {
      var e = this;return (n = n.split(","), forEach(n, function (n) {
        isFunction(t) && (e.__$$events__[n] && isArray(e.__$$events__[n]) ? e.__$$events__[n].push(t) : e.__$$events__[n] = [t]);
      }), this);
    }, $one: function $one(n, t) {
      var e = this;return (n = n.split(","), forEach(n, function (n) {
        isFunction(t) && (e.__$$events__[n] || (e.__$$events__[n] = [t]));
      }), this);
    }, $emit: function $emit(n) {
      var t = toArray(arguments),
          e = 0,
          r = this.__$$events__[n];if (r && isArray(r)) for (e; e < r.length; e++) r[e].apply(null, t.slice(1));return this;
    }, $remove: function $remove(n, t) {
      var e = this.__$$events__[n];if (e && isArray(e)) if (t) for (var r = e.length - 1; r >= 0; r--) t === e[r] && e.splice(r, 1);else delete this.__$$events__[n];return this;
    } });Manager.define("$class", function () {
    return Class;
  }), Manager.define("$emitter", function () {
    return Emitter;
  }), global.kvm = {}, merge(global.kvm, { isArray: isArray, isString: isString, isFunction: isFunction, isObject: isObject, isReference: isReference, isEmpty: isEmpty, isBoolean: isBoolean, getKeyLength: getKeyLength, isValue: isValue, guid: guid, unique: unique, toArray: toArray, bind: bind, forEach: forEach, merge: merge, eachTask: eachTask, copy: copy, Class: Class, Emitter: Emitter }), global.KVM = global.kvm, global.kvm.module = Manager, global.KVM.Module = Manager, global.define = Manager.define, global.define.amd = !0;
})(window);

//# sourceMappingURL=kvm-mini.min-compiled.js.map