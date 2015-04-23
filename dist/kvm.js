(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":9}],2:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":10}],3:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":11}],4:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],5:[function(require,module,exports){
"use strict";

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{}],6:[function(require,module,exports){
"use strict";

var _Object$getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor")["default"];

exports["default"] = function get(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    desc = parent = getter = undefined;
    _again = false;
    var object = _x,
        property = _x2,
        receiver = _x3;

    var desc = _Object$getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
        _x2 = property;
        _x3 = receiver;
        _again = true;
        continue _function;
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  }
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/get-own-property-descriptor":2}],7:[function(require,module,exports){
"use strict";

exports["default"] = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

exports.__esModule = true;
},{}],8:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
};

exports.__esModule = true;
},{}],9:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/$').core.Object.assign;
},{"../../modules/$":21,"../../modules/es6.object.assign":29}],10:[function(require,module,exports){
require('../../modules/es6.object.statics-accept-primitives');
module.exports = require('../../modules/$').core.Object.getOwnPropertyDescriptor;
},{"../../modules/$":21,"../../modules/es6.object.statics-accept-primitives":30}],11:[function(require,module,exports){
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$').core.Promise;
},{"../modules/$":21,"../modules/es6.promise":31,"../modules/es6.string.iterator":32,"../modules/web.dom.iterable":33}],12:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":21}],13:[function(require,module,exports){
var $ = require('./$');
// 19.1.2.1 Object.assign(target, source, ...)
/*eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/*eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = $.getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":21}],14:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":21,"./$.wks":27}],15:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":12}],16:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp.prototype = C.prototype;
    }(out);
    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // export
    $.hide(exports, key, exp);
  }
}
module.exports = $def;
},{"./$":21}],17:[function(require,module,exports){
module.exports = function($){
  $.FW   = false;
  $.path = $.core;
  return $;
};
},{}],18:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],19:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":27}],20:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , ctx               = require('./$.ctx')
  , cof               = require('./$.cof')
  , $def              = require('./$.def')
  , assertObject      = require('./$.assert').obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = {}
  , IteratorPrototype = {};
// Safari has byggy iterators w/o `next`
var BUGGY = 'keys' in [] && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor.prototype
    , iter  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT] || value;
  // Define iterator
  if($.FW)setIterator(proto, iter);
  if(iter !== value){
    var iterProto = $.getProto(iter.call(new Constructor));
    // Set @@toStringTag to native iterators
    cof.set(iterProto, NAME + ' Iterator', true);
    // FF fix
    if($.FW)$.has(proto, FF_ITERATOR) && setIterator(iterProto, $.that);
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = $.that;
  return iter;
}
function getIterator(it){
  var Symbol  = $.g.Symbol
    , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
  return assertObject(getIter.call(it));
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function stepCall(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
var $iter = module.exports = {
  BUGGY: BUGGY,
  Iterators: Iterators,
  prototype: IteratorPrototype,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  stepCall: stepCall,
  close: closeIterator,
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol
      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: getIterator,
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || $iter.prototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  },
  define: defineIterator,
  std: function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
    function createIter(kind){
      return function(){
        return new Constructor(this, kind);
      };
    }
    $iter.create(Constructor, NAME, next);
    var entries = createIter('key+value')
      , values  = createIter('value')
      , proto   = Base.prototype
      , methods, key;
    if(DEFAULT == 'value')values = defineIterator(Base, NAME, values, 'values');
    else entries = defineIterator(Base, NAME, entries, 'entries');
    if(DEFAULT){
      methods = {
        entries: entries,
        keys:    IS_SET ? values : createIter('key'),
        values:  values
      };
      $def($def.P + $def.F * BUGGY, NAME, methods);
      if(FORCE)for(key in methods){
        if(!(key in proto))$.hide(proto, key, methods[key]);
      }
    }
  },
  forOf: function(iterable, entries, fn, that){
    var iterator = getIterator(iterable)
      , f = ctx(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done){
      if(stepCall(iterator, f, step.value, entries) === false){
        return closeIterator(iterator);
      }
    }
  }
};
},{"./$":21,"./$.assert":12,"./$.cof":14,"./$.ctx":15,"./$.def":16,"./$.wks":27}],21:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value)); // eslint-disable-line no-use-before-define
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  it: function(it){
    return it;
  },
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  // Dummy, fix for not array-like ES3 string in es5 module
  assertDefined: assertDefined,
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":17}],22:[function(require,module,exports){
var $ = require('./$');
module.exports = function(C){
  if($.DESC && $.FW)$.setDesc(C, require('./$.wks')('species'), {
    configurable: true,
    get: $.that
  });
};
},{"./$":21,"./$.wks":27}],23:[function(require,module,exports){
'use strict';
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(pos){
    var s = String($.assertDefined(this))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":21}],24:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , global             = $.g
  , isFunction         = $.isFunction
  , html               = $.html
  , document           = global.document
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , postMessage        = global.postMessage
  , addEventListener   = global.addEventListener
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    };
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document.createElement('script')){
    defer = function(id){
      html.appendChild(document.createElement('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":21,"./$.cof":14,"./$.ctx":15,"./$.invoke":18}],25:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":21}],26:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var $           = require('./$')
  , UNSCOPABLES = require('./$.wks')('unscopables');
if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  if($.FW)[][UNSCOPABLES][key] = true;
};
},{"./$":21,"./$.wks":27}],27:[function(require,module,exports){
var global = require('./$').g
  , store  = {};
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":21,"./$.uid":25}],28:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
$iter.std(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'key'  )return step(0, index);
  if(kind == 'value')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'value');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":21,"./$.iter":20,"./$.uid":25,"./$.unscope":26}],29:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":13,"./$.def":16}],30:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
function wrapObjectMethod(METHOD, MODE){
  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
    , f   = 0
    , o   = {};
  o[METHOD] = MODE == 1 ? function(it){
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function(it){
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function(it){
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : MODE == 5 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : function(it){
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch(e){
    f = 1;
  }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf', 5);
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');
},{"./$":21,"./$.def":16}],31:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , ctx     = require('./$.ctx')
  , cof     = require('./$.cof')
  , $def    = require('./$.def')
  , assert  = require('./$.assert')
  , $iter   = require('./$.iter')
  , SPECIES = require('./$.wks')('species')
  , RECORD  = require('./$.uid').safe('record')
  , forOf   = $iter.forOf
  , PROMISE = 'Promise'
  , global  = $.g
  , process = global.process
  , asap    = process && process.nextTick || require('./$.task').set
  , P       = global[PROMISE]
  , Base    = P
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , test;

// helpers
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  if(isObject(it))then = it.then;
  return isFunction(then) ? then : false;
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function notify(record, isReject){
  var chain = record.c;
  if(isReject || chain.length)asap(function(){
    var promise = record.p
      , value   = record.v
      , ok      = record.s == 1
      , i       = 0;
    if(isReject && isUnhandled(promise)){
      setTimeout(function(){
        if(isUnhandled(promise)){
          if(cof(process) == 'process'){
            process.emit('unhandledRejection', value, promise);
          } else if(global.console && isFunction(console.error)){
            console.error('Unhandled promise rejection', value);
          }
        }
      }, 1e3);
    } else while(chain.length > i)!function(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError(PROMISE + '-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }(chain[i++]);
    chain.length = 0;
  });
}
function $reject(value){
  var record = this;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  notify(record, true);
}
function $resolve(value){
  var record = this
    , then, wrapper;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      wrapper = {r: record, d: false}; // wrap
      then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch(err){
    $reject.call(wrapper || {r: record, d: false}, err); // wrap
  }
}

// constructor polyfill
if(!(isFunction(P) && isFunction(P.resolve) && P.resolve(test = new P(function(){})) == test)){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE),       // <- promise
      c: [],                                  // <- chain
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  $.mix(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      record.s && notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * (P != Base), {Promise: P});
cof.set(P, PROMISE);
require('./$.species')(P);

// statics
$def($def.S, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new (getConstructor(this))(function(res, rej){
      rej(r);
    });
  },
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
      ? x : new (getConstructor(this))(function(res){
        res(x);
      });
  }
});
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
}), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":21,"./$.assert":12,"./$.cof":14,"./$.ctx":15,"./$.def":16,"./$.iter":20,"./$.iter-detect":19,"./$.species":22,"./$.task":24,"./$.uid":25,"./$.wks":27}],32:[function(require,module,exports){
var set   = require('./$').set
  , at    = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
$iter.std(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = at.call(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":21,"./$.iter":20,"./$.string-at":23,"./$.uid":25}],33:[function(require,module,exports){
require('./es6.array.iterator');
var $           = require('./$')
  , Iterators   = require('./$.iter').Iterators
  , ITERATOR    = require('./$.wks')('iterator')
  , ArrayValues = Iterators.Array
  , NodeList    = $.g.NodeList;
if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
  $.hide(NodeList.prototype, ITERATOR, ArrayValues);
}
Iterators.NodeList = ArrayValues;
},{"./$":21,"./$.iter":20,"./$.wks":27,"./es6.array.iterator":28}],34:[function(require,module,exports){
"use strict";

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require("./utils");

var _utils2 = _interopRequireWildcard(_utils);

var _Emitter5 = require("./emitter");

var _Emitter6 = _interopRequireWildcard(_Emitter5);

var Hook = new _Emitter6["default"]();

var Data = {
	baseUrl: "",
	vars: {},
	packages: {},
	alias: {},
	shims: {}
};

var ModuleCache = {
	MODULES: {},
	insert: function insert(module) {
		var path = module.path;
		var mapId = module.path.id || module.path.uri;
		var driver = Driver.getDriver(path);
		if (!this.MODULES[mapId]) {
			this.MODULES[mapId] = module;
			driver && driver.$emit("loaded", module);
		}
		return this.MODULES[mapId];
	},
	find: function find(path) {
		return this.MODULES[path.id || path.uri] || this.MODULES[path.id] || this.MODULES[path.uri];
	}
};

var Request = (function (_Emitter) {
	function Request(sender, reqs, callback) {
		_classCallCheck(this, Request);

		_get(Object.getPrototypeOf(Request.prototype), "constructor", this).call(this);
		this.sender = sender;
		this.reqs = _utils2["default"].isArray(reqs) ? reqs : [reqs];
		this.drivers = [];
		this.results = [];
		this.callback = callback;
		this._parseReqs();
		this.send();
	}

	_inherits(Request, _Emitter);

	_createClass(Request, [{
		key: "_createDriver",
		value: function _createDriver(path) {
			var driver = Driver.getDriver(path),
			    that = this;
			if (!driver) {
				driver = new Driver(path);
				driver.beforeLoad();
				if (!driver.module) {
					this.drivers.push(driver);
				} else {
					that._done(driver.module);
				}
			}
			if (!driver.module) {
				driver.$on("loaded", function (module) {
					driver.module = module;
					that._done(module);
				});
			} else {
				that._done(driver.module);
			}
		}
	}, {
		key: "_parseReqs",
		value: function _parseReqs() {
			var that = this,
			    module = undefined;
			this.reqs = this.reqs.filter(function (req) {
				return !!req;
			});
			if (this.reqs.length > 0) {
				this.reqs.forEach(function (path) {
					module = that.sender.getInjector(path);
					module = module || path.getModule();
					if (module) {
						that._done(module);
					} else {
						that._createDriver(path);
					}
				});
			} else {
				that.callback([]);
			}
		}
	}, {
		key: "_checkDone",
		value: function _checkDone() {
			return this.reqs.length == this.results.length;
		}
	}, {
		key: "_done",
		value: function _done(module) {
			this.results.push(module);
			if (this._checkDone()) {
				if (_utils2["default"].isFunction(this.callback)) {
					this.callback(this.results);
				}
			}
		}
	}, {
		key: "send",
		value: function send() {
			this.drivers.forEach(function (driver) {
				driver.load();
			});
		}
	}], [{
		key: "fetch",
		value: function fetch(sender, paths) {
			paths = _utils2["default"].isArray(paths) ? paths : [paths];
			return new _Promise(function (resolve) {
				new Request(sender, paths, function (modules) {
					resolve(modules);
				});
			});
		}
	}]);

	return Request;
})(_Emitter6["default"]);

var Driver = (function (_Emitter2) {
	function Driver(path) {
		_classCallCheck(this, Driver);

		_get(Object.getPrototypeOf(Driver.prototype), "constructor", this).call(this);
		this.path = path;
		this.module = null;
		if (!Driver.getDriver(path)) {
			Driver.addDriver(this);
		}
	}

	_inherits(Driver, _Emitter2);

	_createClass(Driver, [{
		key: "beforeLoad",
		value: function beforeLoad() {
			Hook.$emit("DRIVER_BEFORE_LOAD", this);
		}
	}, {
		key: "load",
		value: function load() {
			var path = this.path;
			var uri = path.uri;
			uri = _utils2["default"].addQueryString(uri, path.query);
			uri = _utils2["default"].addHashString(uri, path.hash);
			if (path.ext != "js") {
				Hook.$emit("DRIVER_LOADER_" + path.ext.toLocaleUpperCase(), this);
			} else {
				this._loadJS(uri, this.loaded.bind(this));
			}
		}
	}, {
		key: "loaded",
		value: function loaded(err, res) {
			var path = this.path;
			if (path.ext != "js") {
				Dectorator.define(path.id, function () {
					return res;
				});
			} else {
				Hook.$emit("DRIVER_LOADED", this, err, res);
			}
		}
	}, {
		key: "_loadJS",
		value: function _loadJS(url, callback) {
			var doc = document;
			var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
			var baseElement = head.getElementsByTagName("base")[0];
			var node = doc.createElement("script");
			node.async = true;
			node.src = url;
			addOnload(node, callback);

			baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);

			function addOnload(node, callback) {
				var supportOnload = ("onload" in node);

				if (supportOnload) {
					node.onload = onload;
					node.onerror = function () {
						onload(true);
					};
				} else {
					node.onreadystatechange = function () {
						if (/loaded|complete/.test(node.readyState)) {
							onload();
						}
					};
				}

				function onload(e) {
					// Ensure only run once and handle memory leak in IE
					node.onload = node.onerror = node.onreadystatechange = null;

					// Remove the script to reduce memory leak
					if (Dectorator.data("debug")) {
						head.removeChild(node);
					}

					// Dereference the node
					node = null;

					callback && callback(e);
				}
			}
		}
	}], [{
		key: "getDriver",
		value: function getDriver(path) {
			return Driver.DRIVERS[path.uri];
		}
	}, {
		key: "addDriver",
		value: function addDriver(driver) {
			Driver.DRIVERS[driver.path.uri] = driver;
		}
	}, {
		key: "registerDriverLoaded",
		value: function registerDriverLoaded(method) {
			if (!_utils2["default"].isFunction(method)) {
				return;
			}Hook.$on("DRIVER_LOADED", function (that) {
				method.call(that);
			});
		}
	}, {
		key: "registerDriverLoader",
		value: function registerDriverLoader(ext, method) {
			if (!_utils2["default"].isFunction(method)) {
				return;
			}ext = ext.trim();
			ext = ext.toUpperCase();
			Hook.$one("DRIVER_LOADER_" + ext, function (that) {
				method.call(that, that.path.uri, that.loaded.bind(that));
			});
		}
	}, {
		key: "registerDriverBeforeLoad",
		value: function registerDriverBeforeLoad(method) {
			if (!_utils2["default"].isFunction(method)) {
				return;
			}Hook.$on("DRIVER_BEFORE_LOAD", function (that) {
				method.call(that);
			});
		}
	}]);

	return Driver;
})(_Emitter6["default"]);

Driver.DRIVERS = {};

var Path = (function (_Emitter3) {
	function Path(id, baseUrl) {
		_classCallCheck(this, Path);

		_get(Object.getPrototypeOf(Path.prototype), "constructor", this).call(this);
		this.baseUrl = baseUrl || Data.baseUrl;
		this.id = id || "";
		this._initId();
		this._maper();
		this._parser();
		this._initUri();
	}

	_inherits(Path, _Emitter3);

	_createClass(Path, [{
		key: "_initId",
		value: function _initId() {
			if (!this.id) {
				return;
			}var _id = this.id;
			this.query = _utils2["default"].getQuery(_id);
			this.hash = _utils2["default"].getHash(this.id);
			this.id = this.id.replace(/(#|\?).*/, "");
		}
	}, {
		key: "_initUri",
		value: function _initUri() {
			this.baseUrl = this.baseUrl.replace(/\/$/, "") + "/";
			this.uri = this.uri ? _utils2["default"].resolvePath(this.baseUrl, this.uri) : this.id ? _utils2["default"].resolvePath(this.baseUrl, this.id) : _utils2["default"].getCurrentScript().uri;
			this._initExt();
		}
	}, {
		key: "_initExt",
		value: function _initExt() {
			var ext = this.uri.match(/\.(\w+)$/);
			if (ext && ext[1]) {
				ext = ext[1].toLocaleLowerCase();
				if (Path.__EXTS__.indexOf(ext) != -1) {
					this.ext = ext;
				} else {
					this.$emit("FILE_EXTS_PARSER", this);
					if (!Path.__EXTS__.indexOf(this.ext)) {
						this.ext = "js";
					}
				}
			} else {
				this.ext = "js";
				this.uri += ".js";
			}
		}
	}, {
		key: "_maper",
		value: function _maper() {
			if (!this.id) {
				return;
			}Hook.$emit("PATH_MAPER", this);
		}
	}, {
		key: "_parser",
		value: function _parser() {
			if (!this.id) {
				return;
			}this._parseVars();
			Hook.$emit("PATH_PARSER", this);
		}
	}, {
		key: "_parseVars",
		value: function _parseVars() {
			this.baseUrl = this.template(this.baseUrl);
			this.id = this.template(this.id);
			this.uri = this.uri ? this.template(this.uri) : "";
		}
	}, {
		key: "getModule",
		value: function getModule() {
			return ModuleCache.find(this);
		}
	}, {
		key: "equal",
		value: function equal(path) {
			return this.id && this.id == path.id || this.uri && this.uri == path.uri;
		}
	}, {
		key: "getMap",
		value: function getMap(obj) {
			var result = null,
			    that = this;
			if (_utils2["default"].isArray(obj)) {
				obj.forEach(function (item) {
					if (item.equal && item.equal(that) || item.path && item.path.equal(that)) {
						result = item;
						return false;
					}
				});
			} else if (_utils2["default"].isObject(obj)) {
				return obj && obj[this.id || this.uri];
			}
			return result;
		}
	}, {
		key: "template",
		value: function template(url) {
			if (!_utils2["default"].isString(url)) throw new Error("路径类型错误");
			var reg = /\{([^{}]+)\}/g,
			    res = undefined,
			    that = this;
			res = url.replace(reg, function (match, param) {
				return Data.vars && Data.vars[param] ? Data.vars[param] : param;
			});
			if (reg.test(res)) {
				return that.template(res);
			} else {
				return res;
			}
		}
	}], [{
		key: "registerFileExtParser",
		value: function registerFileExtParser(method) {
			if (!_utils2["default"].isFunction(method)) {
				return;
			}Hook.$on("FILE_EXTS_PARSER", function (that) {
				method.call(that);
			});
		}
	}, {
		key: "registerPathParser",
		value: function registerPathParser(method) {
			if (!_utils2["default"].isFunction(method)) {
				return;
			}Hook.$on("PATH_PARSER", function (that) {
				method.call(that);
			});
		}
	}, {
		key: "registerPathMaper",
		value: function registerPathMaper(method) {
			if (!_utils2["default"].isFunction(method)) {
				return;
			}Hook.$on("PATH_MAPER", function (that) {
				method.call(that);
			});
		}
	}, {
		key: "createPath",
		value: function createPath(id, baseUrl) {
			return new Path(id, baseUrl);
		}
	}]);

	return Path;
})(_Emitter6["default"]);

Path.__EXTS__ = ["js", "css", "json", "jsonp", "tpl", "html"];

var Module = (function (_Emitter4) {
	function Module(meta) {
		_classCallCheck(this, Module);

		_get(Object.getPrototypeOf(Module.prototype), "constructor", this).call(this);
		_utils2["default"].options(this, {
			path: null,
			depPaths: [],
			factory: null,
			injectors: {},
			installed: false,
			module: {
				exports: null
			}
		}, meta);
		Hook.$emit("MODULE_PARSER", this);
	}

	_inherits(Module, _Emitter4);

	_createClass(Module, [{
		key: "getInjector",
		value: function getInjector(path) {
			var injector = this.injectors[path.id];
			if (injector) {
				return Module.createModule(path.id, injector);
			}
		}
	}, {
		key: "invoke",
		value: function invoke() {
			var that = this;
			return new _Promise(function (resolve) {
				if (that.installed) {
					resolve(_Promise.resolve(that.module.exports));
				} else if (that.factory) {
					resolve(_Promise.resolve(that._inject()));
				} else {
					if (that.path && !that.factory) {
						resolve(Request.fetch(that, that.path).then(function (modules) {
							return _Promise.resolve(modules[0]._inject());
						}));
					} else {
						throw new Error("模块不符合规范!");
					}
				}
			});
		}
	}, {
		key: "_collectDeps",
		value: function _collectDeps() {
			var that = this,
			    dependencies = [],
			    injector = undefined;
			return Request.fetch(this, this.depPaths).then(function (modules) {
				return new _Promise(function (resolve) {
					if (that.depPaths.length > 0) {
						that.depPaths.forEach(function (path, index) {
							injector = path.getMap(modules);
							if (injector) {
								dependencies[index] = injector.invoke();
								if (dependencies.length == that.depPaths.length) {
									resolve(_Promise.all(dependencies));
								}
							}
						});
					} else {
						resolve(_Promise.all([]));
					}
				});
			});
		}
	}, {
		key: "_inject",
		value: function _inject() {
			var that = this;
			return this._collectDeps().then(function (dependencies) {
				var instance = that.factory.apply(null, dependencies);
				if (that.module.exports) {
					instance = that.module.exports;
				} else {
					that.module.exports = instance;
				}
				that.installed = true;
				return instance;
			});
		}
	}], [{
		key: "createModule",
		value: function createModule() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return new Module(Module.parseMeta.apply(null, args));
		}
	}, {
		key: "parseMeta",
		value: function parseMeta() {
			for (var _len2 = arguments.length, params = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				params[_key2] = arguments[_key2];
			}

			var meta = {},
			    auto_path = false;
			if (_utils2["default"].isBoolean(params[0])) {
				auto_path = params[0];
				params = params.slice(1);
			}
			params.forEach(function (param) {
				if (_utils2["default"].isFunction(param)) {
					meta.factory = param;
				} else if (_utils2["default"].isArray(param)) {
					if (_utils2["default"].isFunction(param[param.length - 1])) {
						meta.factory = param[param.length - 1];
						meta.depPaths = param.slice(0, param.length - 1).map(function (id) {
							return new Path(id);
						});
					} else {
						meta.depPaths = param.map(function (id) {
							return new Path(id);
						});
					}
				} else if (_utils2["default"].isString(param)) {
					meta.path = new Path(param);
				} else if (_utils2["default"].isObject(param)) {
					meta.injectors = param;
				}
			});
			if (!meta.path && auto_path) {
				meta.path = new Path();
			}
			return meta;
		}
	}, {
		key: "registerModuleParser",
		value: function registerModuleParser(method) {
			if (!_utils2["default"].isFunction(method)) {
				return;
			}Hook.$on("MODULE_PARSER", function (that) {
				method.call(that);
			});
		}
	}]);

	return Module;
})(_Emitter6["default"]);

var PluginInterface = {
	registerModuleParser: Module.registerModuleParser,

	registerDriverLoader: Driver.registerDriverLoader,
	registerDriverLoaded: Driver.registerDriverLoaded,
	registerDriverBeforeLoad: Driver.registerDriverBeforeLoad,

	registerFileExtParser: Path.registerFileExtParser,
	registerPathParser: Path.registerPathParser,
	registerPathMaper: Path.registerPathMaper,

	createModule: Module.createModule,
	createPath: Path.createPath
};

var Dectorator = {

	config: function config(options) {
		_utils2["default"].options(Data, options);
	},

	data: function data(name) {
		return Data[name] ? Data[name] : Data;
	},

	define: function define() {
		for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
			args[_key3] = arguments[_key3];
		}

		ModuleCache.insert(Module.createModule.apply(null, [true].concat(args)));
		return this;
	},

	invoke: function invoke() {
		for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
			args[_key4] = arguments[_key4];
		}

		return Module.createModule.apply(null, args).invoke();
	},

	use: function use(id, callback) {
		var module = Module.createModule(id);
		module.invoke(function (instance) {
			_utils2["default"].isFunction(callback) && callback(instance);
		})["catch"](function (e) {
			throw e;
		});
	},

	registerPlugin: function registerPlugin(factory) {
		if (_utils2["default"].isFunction(factory)) {
			factory.call(this, PluginInterface);
		}
	}
};

exports["default"] = Dectorator;
module.exports = exports["default"];

},{"./emitter":35,"./utils":37,"babel-runtime/core-js/promise":3,"babel-runtime/helpers/class-call-check":4,"babel-runtime/helpers/create-class":5,"babel-runtime/helpers/get":6,"babel-runtime/helpers/inherits":7,"babel-runtime/helpers/interop-require-wildcard":8}],35:[function(require,module,exports){
"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require("./utils");

var _utils2 = _interopRequireWildcard(_utils);

var Emitter = (function () {
	function Emitter(events) {
		_classCallCheck(this, Emitter);

		if (events) this.$$EVENTS = events;else this.$$EVENTS = {};
	}

	_createClass(Emitter, [{
		key: "$on",
		value: function $on(names, fn) {
			var _this = this;
			names.split(",").forEach(function (_name) {
				if (_utils2["default"].isFunction(fn)) {
					if (_this.$$EVENTS[_name] && _utils2["default"].isArray(_this.$$EVENTS[_name])) _this.$$EVENTS[_name].push(fn);else _this.$$EVENTS[_name] = [fn];
				}
			});
			return this;
		}
	}, {
		key: "$one",
		value: function $one(names, fn) {
			var _this = this;
			names.split(",").forEach(function (_name) {
				if (_utils2["default"].isFunction(fn)) {
					if (!_this.$$EVENTS[_name]) _this.$$EVENTS[_name] = [fn];
				}
			});
			return this;
		}
	}, {
		key: "$emit",
		value: function $emit(_name) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			var events = this.$$EVENTS[_name];
			if (events && _utils2["default"].isArray(events)) {
				for (var i = 0; i < events.length; i++) {
					events[i].apply(null, args);
				}
			}
			return this;
		}
	}, {
		key: "$remove",
		value: function $remove(_name, fn) {
			var events = this.$$EVENTS[_name];
			if (events && _utils2["default"].isArray(events)) {
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
	}]);

	return Emitter;
})();

exports["default"] = Emitter;
module.exports = exports["default"];

},{"./utils":37,"babel-runtime/helpers/class-call-check":4,"babel-runtime/helpers/create-class":5,"babel-runtime/helpers/interop-require-wildcard":8}],36:[function(require,module,exports){
"use strict";

var _Object$assign = require("babel-runtime/core-js/object/assign")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

var _utils = require("./utils");

var _utils2 = _interopRequireWildcard(_utils);

var _Emitter = require("./emitter");

var _Emitter2 = _interopRequireWildcard(_Emitter);

var _core = require("./core");

var _core2 = _interopRequireWildcard(_core);

var KVM = {};
window.kvm = window.KVM = KVM;
window.kvm.Module = window.kvm.module = _core2["default"];
window.define = _core2["default"].define;
_Object$assign(KVM, _utils2["default"]);

_core2["default"].define("$emitter", function () {
	return _Emitter2["default"];
});

},{"./core":34,"./emitter":35,"./utils":37,"babel-runtime/core-js/object/assign":1,"babel-runtime/helpers/interop-require-wildcard":8}],37:[function(require,module,exports){
'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
var hasOwnProperty = Object.prototype.hasOwnProperty;

var TYPES = 'Function,String,Array,Object,Number,Boolean'.split(',');

var utils = {
	isReference: function isReference(val) {
		return this.isArray(val) || this.isObject(val);
	},
	isValue: function isValue(val) {
		return !this.isReference(val);
	},
	isEmpty: function isEmpty(obj) {
		if (obj == null) {
			return true;
		}if (obj.length > 0) {
			return false;
		}if (obj.length === 0) {
			return true;
		}for (var key in obj) {
			if (hasOwnProperty.call(obj, key)) {
				return false;
			}
		}

		return true;
	},
	options: function options() {
		for (var _len = arguments.length, source = Array(_len), _key = 0; _key < _len; _key++) {
			source[_key] = arguments[_key];
		}

		return _Object$assign.apply(Object, source);
	},
	addQueryString: function addQueryString(url, query) {
		var parser = document.createElement('a');
		var str = '?';
		var key = undefined;
		parser.href = url.replace('?', '');
		for (key in query) {
			str += '' + key + '=' + query[key] + '&';
		}
		parser.search = str.replace(/&$/, '');
		return parser.toString();
	},
	getQuery: function getQuery(url) {
		var parser = document.createElement('a');
		parser.href = url;
		return this.resolveQuery(parser.search);
	},
	getHash: function getHash(url) {
		var parser = document.createElement('a');
		parser.href = url;
		return parser.hash.replace(/^#/, '');
	},
	addHashString: function addHashString(url, hash) {
		var parser = document.createElement('a');
		parser.href = url;
		parser.hash = '#' + hash.replace(/^#/, '');
		return parser.toString();
	},
	resolveQuery: function resolveQuery(query) {
		var vars = query.replace('?', '').split('&'),
		    result = {};
		for (var i = 0; i < vars.length; i++) {
			if (vars[i]) {
				var pair = vars[i].split('=');
				result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
			}
		}
		return result;
	},
	isAbsolutePath: function isAbsolutePath(path) {
		var reg = new RegExp('^(?:[a-z]+:)?//', 'i');
		return reg.test(path);
	},
	resolvePath: function resolvePath() {
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		var numUrls = args.length;

		if (numUrls === 0) {
			throw new Error('resolveUrl requires at least one argument; got none.');
		}

		var base = document.createElement('base');
		base.href = args[0];

		if (numUrls === 1) {
			return base.href;
		}

		var head = document.getElementsByTagName('head')[0];
		head.insertBefore(base, head.firstChild);

		var a = document.createElement('a');
		var resolved = '';

		for (var index = 1; index < numUrls; index++) {
			a.href = args[index];
			resolved = a.href;
			base.href = resolved;
		}

		head.removeChild(base);
		return resolved;
	},
	before: function before(context, name, fn) {
		var _fn;
		context = context || window;
		_fn = context[name];
		context[name] = function () {
			for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				args[_key3] = arguments[_key3];
			}

			var result = fn.apply(context, args);
			args.push(result);
			_fn.apply(context, args);
			return result;
		};
	},
	after: function after(context, name, fn) {
		var _fn;
		context = context || window;
		_fn = context[name];
		context[name] = function () {
			for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
				args[_key4] = arguments[_key4];
			}

			var result = _fn.apply(context, args);
			args.push(result);
			return fn.apply(context, args);
		};
	},
	getCurrentScript: function getCurrentScript() {
		var uri = (function _getCur() {
			var doc = document;
			var head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;
			if (doc.currentScript) {
				return doc.currentScript.src;
			}
			var stack = undefined;
			try {
				a.b.c();
			} catch (e) {
				stack = e.stack;
				if (!stack && window.opera) {
					stack = (String(e).match(/of linked script \S+/g) || []).join(' ');
				}
			}
			if (stack) {
				stack = stack.split(/[@ ]/g).pop();
				stack = stack[0] == '(' ? stack.slice(1, -1) : stack;
				return stack.replace(/(:\d+)?:\d+$/i, '');
			}
			var nodes = head.getElementsByTagName('script');
			for (var i = 0, node = undefined; node = nodes[i++];) {
				if (node.readyState === 'interactive') {
					return node.className = node.src;
				}
			}
		})();
		return {
			uri: uri.replace(/(#|\?).*/, ''),
			query: this.getQuery(uri),
			hash: this.getHash(uri)
		};
	}
};

TYPES.forEach(function (name) {
	return utils['is' + name] = function (val) {
		return Object.prototype.toString.call(val) === '[object ' + name + ']';
	};
});

exports['default'] = utils;
module.exports = exports['default'];

},{"babel-runtime/core-js/object/assign":1}]},{},[36])