// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };
  Module['load'] = function load(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (typeof console !== 'undefined') {
    Module['print'] = function print(x) {
      console.log(x);
    };
    Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + Pointer_stringify(code) + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;
function demangle(func) {
  try {
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}
function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}
function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
var memoryInitializer = null;
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 1192;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([236,41,28,63,99,110,80,63,19,252,64,63,140,242,9,63,38,217,73,63,84,255,135,62,105,242,167,62,183,174,128,62,145,174,63,62,108,198,60,63,218,86,85,63,164,29,98,62,102,183,166,61,61,23,70,63,33,4,116,63,94,60,197,62,17,3,88,63,42,231,231,62,14,122,232,61,225,233,35,63,157,57,119,63,17,47,6,63,115,60,115,63,165,150,76,63,233,219,65,63,122,126,45,63,6,74,76,62,16,233,203,61,245,113,25,61,195,175,63,62,85,140,27,62,195,253,82,63,64,1,118,63,39,31,57,63,8,196,136,62,151,205,61,63,130,255,240,62,74,67,118,63,253,123,21,62,15,104,27,62,177,237,14,63,249,51,68,63,156,151,79,63,13,62,205,62,43,15,223,61,98,22,91,63,106,83,28,61,104,69,218,62,58,156,143,62,134,62,106,63,54,133,86,63,192,8,21,63,84,0,188,62,39,176,28,63,153,11,22,63,111,94,16,63,85,24,250,62,4,201,120,63,179,62,227,62,43,64,124,63,12,122,179,60,197,74,29,63,42,115,231,61,227,221,51,62,57,123,10,62,181,118,147,62,237,147,68,63,27,138,137,62,225,141,170,62,38,81,94,63,101,44,72,63,146,243,22,63,45,121,228,62,235,251,119,63,145,220,147,61,249,71,168,62,109,84,130,62,153,169,48,63,245,109,164,62,231,196,92,63,77,70,210,62,13,202,127,63,17,117,159,62,190,253,88,62,244,249,22,63,109,79,30,63,166,168,72,63,35,15,104,62,186,8,7,63,166,50,100,63,245,6,124,62,117,66,19,63,154,52,84,62,31,196,27,62,241,150,3,63,168,5,50,63,144,92,56,63,227,247,49,62,3,171,160,62,38,63,187,61,28,10,34,62,150,82,237,61,106,187,208,62,23,199,130,61,13,160,125,63,123,121,50,62,226,115,108,63,174,157,85,63,133,73,109,61,252,147,181,62,193,159,201,62,135,38,82,63,11,247,36,63,120,36,30,62,242,76,101,63,83,69,212,62,188,248,238,62,225,244,218,62,160,208,14,61,0,33,9,62,135,187,28,63,93,31,75,63,216,74,10,62,17,92,58,63,118,77,186,62,43,113,157,62,76,219,94,63,35,178,156,62,97,111,95,115,105,109,100,95,115,111,97,95,110,111,115,115,101,109,97,116,104,46,99,0,40,110,112,104,105,32,37,32,52,41,32,61,61,32,48,0,97,109,98,105,101,110,116,95,111,99,99,108,117,115,105,111,110,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }
  var _sin=Math_sin;
  var _cos=Math_cos;
  var _emscripten_float32x4_and=undefined;
  var _emscripten_float32x4_or=undefined;
  var _emscripten_float32x4_signmask=undefined;
  var _emscripten_float32x4_lessThan=undefined;
  var _emscripten_float32x4_andNot=undefined;
  var _emscripten_float32x4_greaterThan=undefined;
  var _emscripten_int32x4_bitsToFloat32x4=undefined;
  var _emscripten_float32x4_xor=undefined;
  var _emscripten_float32x4_sqrt=undefined;
  var _sqrt=Math_sqrt;
  var _fabs=Math_abs;
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
      return (ptr-num)|0;
    }
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;
  function _free() {
  }
  Module["_free"] = _free;
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
        if (!total) {
          // early out
          return callback(null);
        }
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat, node;
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.position = position;
          return position;
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
          FS.FSNode.prototype = {};
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          this.stack = stackTrace();
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureErrnoError();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0, 0];
// EMSCRIPTEN_START_FUNCS
function _orthoBasis($basis,$n){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $n; $n=STACKTOP;STACKTOP = (STACKTOP + 12)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($n)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($n)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($n)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $basis_addr;
 $basis_addr=$basis;
 var $0=$basis_addr;
 var $arrayidx=(($0+24)|0);
 var $1=$arrayidx;
 var $2=$n;
 assert(12 % 1 === 0);HEAP32[(($1)>>2)]=HEAP32[(($2)>>2)];HEAP32[((($1)+(4))>>2)]=HEAP32[((($2)+(4))>>2)];HEAP32[((($1)+(8))>>2)]=HEAP32[((($2)+(8))>>2)];
 var $3=$basis_addr;
 var $arrayidx1=(($3+12)|0);
 var $x=(($arrayidx1)|0);
 HEAPF32[(($x)>>2)]=0;
 var $4=$basis_addr;
 var $arrayidx2=(($4+12)|0);
 var $y=(($arrayidx2+4)|0);
 HEAPF32[(($y)>>2)]=0;
 var $5=$basis_addr;
 var $arrayidx3=(($5+12)|0);
 var $z=(($arrayidx3+8)|0);
 HEAPF32[(($z)>>2)]=0;
 var $x4=(($n)|0);
 var $6=HEAPF32[(($x4)>>2)];
 var $conv=$6;
 var $cmp=$conv<(0.6);
 if($cmp){label=2;break;}else{label=4;break;}
 case 2: 
 var $x6=(($n)|0);
 var $7=HEAPF32[(($x6)>>2)];
 var $conv7=$7;
 var $cmp8=$conv7>(-0.6);
 if($cmp8){label=3;break;}else{label=4;break;}
 case 3: 
 var $8=$basis_addr;
 var $arrayidx10=(($8+12)|0);
 var $x11=(($arrayidx10)|0);
 HEAPF32[(($x11)>>2)]=1;
 label=13;break;
 case 4: 
 var $y12=(($n+4)|0);
 var $9=HEAPF32[(($y12)>>2)];
 var $conv13=$9;
 var $cmp14=$conv13<(0.6);
 if($cmp14){label=5;break;}else{label=7;break;}
 case 5: 
 var $y17=(($n+4)|0);
 var $10=HEAPF32[(($y17)>>2)];
 var $conv18=$10;
 var $cmp19=$conv18>(-0.6);
 if($cmp19){label=6;break;}else{label=7;break;}
 case 6: 
 var $11=$basis_addr;
 var $arrayidx22=(($11+12)|0);
 var $y23=(($arrayidx22+4)|0);
 HEAPF32[(($y23)>>2)]=1;
 label=12;break;
 case 7: 
 var $z25=(($n+8)|0);
 var $12=HEAPF32[(($z25)>>2)];
 var $conv26=$12;
 var $cmp27=$conv26<(0.6);
 if($cmp27){label=8;break;}else{label=10;break;}
 case 8: 
 var $z30=(($n+8)|0);
 var $13=HEAPF32[(($z30)>>2)];
 var $conv31=$13;
 var $cmp32=$conv31>(-0.6);
 if($cmp32){label=9;break;}else{label=10;break;}
 case 9: 
 var $14=$basis_addr;
 var $arrayidx35=(($14+12)|0);
 var $z36=(($arrayidx35+8)|0);
 HEAPF32[(($z36)>>2)]=1;
 label=11;break;
 case 10: 
 var $15=$basis_addr;
 var $arrayidx38=(($15+12)|0);
 var $x39=(($arrayidx38)|0);
 HEAPF32[(($x39)>>2)]=1;
 label=11;break;
 case 11: 
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 var $16=$basis_addr;
 var $arrayidx42=(($16)|0);
 var $17=$basis_addr;
 var $arrayidx43=(($17+12)|0);
 var $18=$basis_addr;
 var $arrayidx44=(($18+24)|0);
 _vcross($arrayidx42,$arrayidx43,$arrayidx44);
 var $19=$basis_addr;
 var $arrayidx45=(($19)|0);
 _vnormalize($arrayidx45);
 var $20=$basis_addr;
 var $arrayidx46=(($20+12)|0);
 var $21=$basis_addr;
 var $arrayidx47=(($21+24)|0);
 var $22=$basis_addr;
 var $arrayidx48=(($22)|0);
 _vcross($arrayidx46,$arrayidx47,$arrayidx48);
 var $23=$basis_addr;
 var $arrayidx49=(($23+12)|0);
 _vnormalize($arrayidx49);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }
}
function _vcross($c,$v0,$v1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $v0; $v0=STACKTOP;STACKTOP = (STACKTOP + 12)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($v0)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($v0)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($v0)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];
 var tempParam = $v1; $v1=STACKTOP;STACKTOP = (STACKTOP + 12)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($v1)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($v1)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($v1)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];
 var $c_addr;
 $c_addr=$c;
 var $y=(($v0+4)|0);
 var $0=HEAPF32[(($y)>>2)];
 var $z=(($v1+8)|0);
 var $1=HEAPF32[(($z)>>2)];
 var $mul=($0)*($1);
 var $z1=(($v0+8)|0);
 var $2=HEAPF32[(($z1)>>2)];
 var $y2=(($v1+4)|0);
 var $3=HEAPF32[(($y2)>>2)];
 var $mul3=($2)*($3);
 var $sub=($mul)-($mul3);
 var $4=$c_addr;
 var $x=(($4)|0);
 HEAPF32[(($x)>>2)]=$sub;
 var $z4=(($v0+8)|0);
 var $5=HEAPF32[(($z4)>>2)];
 var $x5=(($v1)|0);
 var $6=HEAPF32[(($x5)>>2)];
 var $mul6=($5)*($6);
 var $x7=(($v0)|0);
 var $7=HEAPF32[(($x7)>>2)];
 var $z8=(($v1+8)|0);
 var $8=HEAPF32[(($z8)>>2)];
 var $mul9=($7)*($8);
 var $sub10=($mul6)-($mul9);
 var $9=$c_addr;
 var $y11=(($9+4)|0);
 HEAPF32[(($y11)>>2)]=$sub10;
 var $x12=(($v0)|0);
 var $10=HEAPF32[(($x12)>>2)];
 var $y13=(($v1+4)|0);
 var $11=HEAPF32[(($y13)>>2)];
 var $mul14=($10)*($11);
 var $y15=(($v0+4)|0);
 var $12=HEAPF32[(($y15)>>2)];
 var $x16=(($v1)|0);
 var $13=HEAPF32[(($x16)>>2)];
 var $mul17=($12)*($13);
 var $sub18=($mul14)-($mul17);
 var $14=$c_addr;
 var $z19=(($14+8)|0);
 HEAPF32[(($z19)>>2)]=$sub18;
 STACKTOP=sp;return;
}
function _vnormalize($c){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $c_addr;
 var $length;
 $c_addr=$c;
 var $0=$c_addr;
 var $1=$c_addr;
 var $call=_vdot($0,$1);
 var $conv=$call;
 var $call1=Math_sqrt($conv);
 var $conv2=$call1;
 $length=$conv2;
 var $2=$length;
 var $conv3=$2;
 var $call4=Math_abs($conv3);
 var $cmp=$call4>(1e-17);
 if($cmp){label=2;break;}else{label=3;break;}
 case 2: 
 var $3=$length;
 var $4=$c_addr;
 var $x=(($4)|0);
 var $5=HEAPF32[(($x)>>2)];
 var $div=($5)/($3);
 HEAPF32[(($x)>>2)]=$div;
 var $6=$length;
 var $7=$c_addr;
 var $y=(($7+4)|0);
 var $8=HEAPF32[(($y)>>2)];
 var $div6=($8)/($6);
 HEAPF32[(($y)>>2)]=$div6;
 var $9=$length;
 var $10=$c_addr;
 var $z=(($10+8)|0);
 var $11=HEAPF32[(($z)>>2)];
 var $div7=($11)/($9);
 HEAPF32[(($z)>>2)]=$div7;
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function _ambient_occlusion(){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+1464)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $a_addr_i337=sp;
 var $b_addr_i338=(sp)+(16);
 var $a_addr_i335=(sp)+(32);
 var $b_addr_i336=(sp)+(48);
 var $w_addr_i329;
 var $_compoundliteral_i330=(sp)+(64);
 var $a_addr_i327=(sp)+(80);
 var $w_addr_i321;
 var $_compoundliteral_i322=(sp)+(96);
 var $a_addr_i318=(sp)+(112);
 var $b_addr_i319=(sp)+(128);
 var $w_addr_i312;
 var $_compoundliteral_i313=(sp)+(144);
 var $a_addr_i309=(sp)+(160);
 var $b_addr_i310=(sp)+(176);
 var $w_addr_i303;
 var $_compoundliteral_i304=(sp)+(192);
 var $a_addr_i300=(sp)+(208);
 var $b_addr_i301=(sp)+(224);
 var $a_addr_i297=(sp)+(240);
 var $b_addr_i298=(sp)+(256);
 var $a_addr_i294=(sp)+(272);
 var $b_addr_i295=(sp)+(288);
 var $w_addr_i288;
 var $_compoundliteral_i289=(sp)+(304);
 var $a_addr_i285=(sp)+(320);
 var $b_addr_i286=(sp)+(336);
 var $w_addr_i279;
 var $_compoundliteral_i280=(sp)+(352);
 var $a_addr_i276=(sp)+(368);
 var $b_addr_i277=(sp)+(384);
 var $w_addr_i270;
 var $_compoundliteral_i271=(sp)+(400);
 var $a_addr_i267=(sp)+(416);
 var $b_addr_i268=(sp)+(432);
 var $a_addr_i264=(sp)+(448);
 var $b_addr_i265=(sp)+(464);
 var $a_addr_i261=(sp)+(480);
 var $b_addr_i262=(sp)+(496);
 var $w_addr_i255;
 var $_compoundliteral_i256=(sp)+(512);
 var $a_addr_i252=(sp)+(528);
 var $b_addr_i253=(sp)+(544);
 var $w_addr_i246;
 var $_compoundliteral_i247=(sp)+(560);
 var $a_addr_i243=(sp)+(576);
 var $b_addr_i244=(sp)+(592);
 var $w_addr_i237;
 var $_compoundliteral_i238=(sp)+(608);
 var $a_addr_i234=(sp)+(624);
 var $b_addr_i235=(sp)+(640);
 var $a_addr_i231=(sp)+(656);
 var $b_addr_i232=(sp)+(672);
 var $a_addr_i228=(sp)+(688);
 var $b_addr_i229=(sp)+(704);
 var $w_addr_i222;
 var $_compoundliteral_i223=(sp)+(720);
 var $w_addr_i216;
 var $_compoundliteral_i217=(sp)+(736);
 var $w_addr_i210;
 var $_compoundliteral_i211=(sp)+(752);
 var $w_addr_i204;
 var $_compoundliteral_i205=(sp)+(768);
 var $w_addr_i198;
 var $_compoundliteral_i199=(sp)+(784);
 var $a_addr_i195=(sp)+(800);
 var $b_addr_i196=(sp)+(816);
 var $a_addr_i193=(sp)+(832);
 var $b_addr_i194=(sp)+(848);
 var $z_addr_i184;
 var $y_addr_i185;
 var $x_addr_i186;
 var $w_addr_i187;
 var $_compoundliteral_i188=(sp)+(864);
 var $z_addr_i175;
 var $y_addr_i176;
 var $x_addr_i177;
 var $w_addr_i178;
 var $_compoundliteral_i179=(sp)+(880);
 var $a_addr_i173=(sp)+(896);
 var $w_addr_i167;
 var $_compoundliteral_i168=(sp)+(912);
 var $z_addr_i;
 var $y_addr_i;
 var $x_addr_i;
 var $w_addr_i161;
 var $_compoundliteral_i162=(sp)+(928);
 var $a_addr_i159=(sp)+(944);
 var $b_addr_i160=(sp)+(960);
 var $a_addr_i158=(sp)+(976);
 var $b_addr_i=(sp)+(992);
 var $p_addr_i;
 var $a_addr_i=(sp)+(1008);
 var $w_addr_i;
 var $_compoundliteral_i=(sp)+(1024);
 var $col=(sp)+(1040);
 var $i;
 var $j;
 var $ntheta;
 var $nphi;
 var $eps;
 var $p=(sp)+(1056);
 var $basis=(sp)+(1072);
 var $occlusion;
 var $occlusionx4=(sp)+(1112);
 var $theta=(sp)+(1128);
 var $phi0;
 var $phi1;
 var $phi2;
 var $phi3;
 var $sinphi=(sp)+(1144);
 var $cosphi=(sp)+(1160);
 var $x77=(sp)+(1176);
 var $y79=(sp)+(1192);
 var $z81=(sp)+(1208);
 var $dirx=(sp)+(1224);
 var $diry=(sp)+(1240);
 var $dirz=(sp)+(1256);
 var $orgx=(sp)+(1272);
 var $orgy=(sp)+(1288);
 var $orgz=(sp)+(1304);
 var $t=(sp)+(1320);
 var $hit=(sp)+(1336);
 var $px=(sp)+(1352);
 var $py=(sp)+(1368);
 var $pz=(sp)+(1384);
 var $nx=(sp)+(1400);
 var $ny=(sp)+(1416);
 var $nz=(sp)+(1432);
 var $occlusionTmp=(sp)+(1448);
 $ntheta=8;
 $nphi=8;
 $eps=0.00009999999747378752;
 var $0=HEAPF32[((1172)>>2)];
 var $1=$eps;
 var $2=HEAPF32[((1184)>>2)];
 var $mul=($1)*($2);
 var $add=($0)+($mul);
 var $x=(($p)|0);
 HEAPF32[(($x)>>2)]=$add;
 var $3=HEAPF32[((1176)>>2)];
 var $4=$eps;
 var $5=HEAPF32[((1188)>>2)];
 var $mul1=($4)*($5);
 var $add2=($3)+($mul1);
 var $y=(($p+4)|0);
 HEAPF32[(($y)>>2)]=$add2;
 var $6=HEAPF32[((1180)>>2)];
 var $7=$eps;
 var $8=HEAPF32[((1192)>>2)];
 var $mul3=($7)*($8);
 var $add4=($6)+($mul3);
 var $z=(($p+8)|0);
 HEAPF32[(($z)>>2)]=$add4;
 var $arraydecay=(($basis)|0);
 _orthoBasis($arraydecay,1184);
 $occlusion=0;
 $w_addr_i=0;
 var $9=$w_addr_i;
 var $vecinit_i=SIMD.float32x4.withX(float32x4.splat(0),$9);
 var $10=$w_addr_i;
 var $vecinit1_i=SIMD.float32x4.withY($vecinit_i,$10);
 var $11=$w_addr_i;
 var $vecinit2_i=SIMD.float32x4.withZ($vecinit1_i,$11);
 var $12=$w_addr_i;
 var $vecinit3_i=SIMD.float32x4.withW($vecinit2_i,$12);
 (HEAPF32[(($_compoundliteral_i)>>2)]=$vecinit3_i.x,HEAPF32[((($_compoundliteral_i)+(4))>>2)]=$vecinit3_i.y,HEAPF32[((($_compoundliteral_i)+(8))>>2)]=$vecinit3_i.z,HEAPF32[((($_compoundliteral_i)+(12))>>2)]=$vecinit3_i.w);
 var $13=float32x4(HEAPF32[(($_compoundliteral_i)>>2)],HEAPF32[((($_compoundliteral_i)+(4))>>2)],HEAPF32[((($_compoundliteral_i)+(8))>>2)],HEAPF32[((($_compoundliteral_i)+(12))>>2)]);
 (HEAPF32[(($occlusionx4)>>2)]=$13.x,HEAPF32[((($occlusionx4)+(4))>>2)]=$13.y,HEAPF32[((($occlusionx4)+(8))>>2)]=$13.z,HEAPF32[((($occlusionx4)+(12))>>2)]=$13.w);
 $j=0;
 label=2;break;
 case 2: 
 var $14=$j;
 var $15=$ntheta;
 var $cmp=($14|0)<($15|0);
 if($cmp){label=3;break;}else{label=11;break;}
 case 3: 
 var $16=$nphi;
 var $rem=(((($16|0))%(4))&-1);
 var $cmp5=($rem|0)==0;
 if($cmp5){var $18=1;label=5;break;}else{label=4;break;}
 case 4: 
 ___assert_fail(544,520,318,560);
 throw "Reached an unreachable!";
 label=5;break;
 case 5: 
 var $18;
 var $lor_ext=($18&1);
 $i=0;
 label=6;break;
 case 6: 
 var $19=$i;
 var $20=$nphi;
 var $cmp7=($19|0)<($20|0);
 if($cmp7){label=7;break;}else{label=9;break;}
 case 7: 
 var $21=$j;
 var $22=$ntheta;
 var $mul9=(Math_imul($21,$22)|0);
 var $23=$i;
 var $add10=((($mul9)+($23))|0);
 var $arrayidx=((888+($add10<<2))|0);
 var $24=HEAPF32[(($arrayidx)>>2)];
 var $25=$j;
 var $26=$ntheta;
 var $mul11=(Math_imul($25,$26)|0);
 var $27=$i;
 var $add12=((($mul11)+($27))|0);
 var $add13=((($add12)+(1))|0);
 var $arrayidx14=((888+($add13<<2))|0);
 var $28=HEAPF32[(($arrayidx14)>>2)];
 var $29=$j;
 var $30=$ntheta;
 var $mul15=(Math_imul($29,$30)|0);
 var $31=$i;
 var $add16=((($mul15)+($31))|0);
 var $add17=((($add16)+(2))|0);
 var $arrayidx18=((888+($add17<<2))|0);
 var $32=HEAPF32[(($arrayidx18)>>2)];
 var $33=$j;
 var $34=$ntheta;
 var $mul19=(Math_imul($33,$34)|0);
 var $35=$i;
 var $add20=((($mul19)+($35))|0);
 var $add21=((($add20)+(3))|0);
 var $arrayidx22=((888+($add21<<2))|0);
 var $36=HEAPF32[(($arrayidx22)>>2)];
 $z_addr_i=$24;
 $y_addr_i=$28;
 $x_addr_i=$32;
 $w_addr_i161=$36;
 var $37=$w_addr_i161;
 var $vecinit_i163=SIMD.float32x4.withX(float32x4.splat(0),$37);
 var $38=$x_addr_i;
 var $vecinit1_i164=SIMD.float32x4.withY($vecinit_i163,$38);
 var $39=$y_addr_i;
 var $vecinit2_i165=SIMD.float32x4.withZ($vecinit1_i164,$39);
 var $40=$z_addr_i;
 var $vecinit3_i166=SIMD.float32x4.withW($vecinit2_i165,$40);
 (HEAPF32[(($_compoundliteral_i162)>>2)]=$vecinit3_i166.x,HEAPF32[((($_compoundliteral_i162)+(4))>>2)]=$vecinit3_i166.y,HEAPF32[((($_compoundliteral_i162)+(8))>>2)]=$vecinit3_i166.z,HEAPF32[((($_compoundliteral_i162)+(12))>>2)]=$vecinit3_i166.w);
 var $41=float32x4(HEAPF32[(($_compoundliteral_i162)>>2)],HEAPF32[((($_compoundliteral_i162)+(4))>>2)],HEAPF32[((($_compoundliteral_i162)+(8))>>2)],HEAPF32[((($_compoundliteral_i162)+(12))>>2)]);
 (HEAPF32[(($a_addr_i173)>>2)]=$41.x,HEAPF32[((($a_addr_i173)+(4))>>2)]=$41.y,HEAPF32[((($a_addr_i173)+(8))>>2)]=$41.z,HEAPF32[((($a_addr_i173)+(12))>>2)]=$41.w);
 var $42=float32x4(HEAPF32[(($a_addr_i173)>>2)],HEAPF32[((($a_addr_i173)+(4))>>2)],HEAPF32[((($a_addr_i173)+(8))>>2)],HEAPF32[((($a_addr_i173)+(12))>>2)]);
 var $call_i174=SIMD.float32x4.sqrt($42);
 (HEAPF32[(($theta)>>2)]=$call_i174.x,HEAPF32[((($theta)+(4))>>2)]=$call_i174.y,HEAPF32[((($theta)+(8))>>2)]=$call_i174.z,HEAPF32[((($theta)+(12))>>2)]=$call_i174.w);
 var $43=$j;
 var $44=$ntheta;
 var $mul25=(Math_imul($43,$44)|0);
 var $45=$i;
 var $add26=((($mul25)+($45))|0);
 var $arrayidx27=((632+($add26<<2))|0);
 var $46=HEAPF32[(($arrayidx27)>>2)];
 var $conv=$46;
 var $mul28=((6.283185307179586))*($conv);
 var $conv29=$mul28;
 $phi0=$conv29;
 var $47=$j;
 var $48=$ntheta;
 var $mul30=(Math_imul($47,$48)|0);
 var $49=$i;
 var $add31=((($mul30)+($49))|0);
 var $add32=((($add31)+(1))|0);
 var $arrayidx33=((632+($add32<<2))|0);
 var $50=HEAPF32[(($arrayidx33)>>2)];
 var $conv34=$50;
 var $mul35=((6.283185307179586))*($conv34);
 var $conv36=$mul35;
 $phi1=$conv36;
 var $51=$j;
 var $52=$ntheta;
 var $mul37=(Math_imul($51,$52)|0);
 var $53=$i;
 var $add38=((($mul37)+($53))|0);
 var $add39=((($add38)+(2))|0);
 var $arrayidx40=((632+($add39<<2))|0);
 var $54=HEAPF32[(($arrayidx40)>>2)];
 var $conv41=$54;
 var $mul42=((6.283185307179586))*($conv41);
 var $conv43=$mul42;
 $phi2=$conv43;
 var $55=$j;
 var $56=$ntheta;
 var $mul44=(Math_imul($55,$56)|0);
 var $57=$i;
 var $add45=((($mul44)+($57))|0);
 var $add46=((($add45)+(3))|0);
 var $arrayidx47=((632+($add46<<2))|0);
 var $58=HEAPF32[(($arrayidx47)>>2)];
 var $conv48=$58;
 var $mul49=((6.283185307179586))*($conv48);
 var $conv50=$mul49;
 $phi3=$conv50;
 var $59=$phi0;
 var $conv51=$59;
 var $call52=Math_sin($conv51);
 var $conv53=$call52;
 var $60=$phi1;
 var $conv54=$60;
 var $call55=Math_sin($conv54);
 var $conv56=$call55;
 var $61=$phi2;
 var $conv57=$61;
 var $call58=Math_sin($conv57);
 var $conv59=$call58;
 var $62=$phi3;
 var $conv60=$62;
 var $call61=Math_sin($conv60);
 var $conv62=$call61;
 $z_addr_i175=$conv53;
 $y_addr_i176=$conv56;
 $x_addr_i177=$conv59;
 $w_addr_i178=$conv62;
 var $63=$w_addr_i178;
 var $vecinit_i180=SIMD.float32x4.withX(float32x4.splat(0),$63);
 var $64=$x_addr_i177;
 var $vecinit1_i181=SIMD.float32x4.withY($vecinit_i180,$64);
 var $65=$y_addr_i176;
 var $vecinit2_i182=SIMD.float32x4.withZ($vecinit1_i181,$65);
 var $66=$z_addr_i175;
 var $vecinit3_i183=SIMD.float32x4.withW($vecinit2_i182,$66);
 (HEAPF32[(($_compoundliteral_i179)>>2)]=$vecinit3_i183.x,HEAPF32[((($_compoundliteral_i179)+(4))>>2)]=$vecinit3_i183.y,HEAPF32[((($_compoundliteral_i179)+(8))>>2)]=$vecinit3_i183.z,HEAPF32[((($_compoundliteral_i179)+(12))>>2)]=$vecinit3_i183.w);
 var $67=float32x4(HEAPF32[(($_compoundliteral_i179)>>2)],HEAPF32[((($_compoundliteral_i179)+(4))>>2)],HEAPF32[((($_compoundliteral_i179)+(8))>>2)],HEAPF32[((($_compoundliteral_i179)+(12))>>2)]);
 (HEAPF32[(($sinphi)>>2)]=$67.x,HEAPF32[((($sinphi)+(4))>>2)]=$67.y,HEAPF32[((($sinphi)+(8))>>2)]=$67.z,HEAPF32[((($sinphi)+(12))>>2)]=$67.w);
 var $68=$phi0;
 var $conv64=$68;
 var $call65=Math_cos($conv64);
 var $conv66=$call65;
 var $69=$phi1;
 var $conv67=$69;
 var $call68=Math_cos($conv67);
 var $conv69=$call68;
 var $70=$phi2;
 var $conv70=$70;
 var $call71=Math_cos($conv70);
 var $conv72=$call71;
 var $71=$phi3;
 var $conv73=$71;
 var $call74=Math_cos($conv73);
 var $conv75=$call74;
 $z_addr_i184=$conv66;
 $y_addr_i185=$conv69;
 $x_addr_i186=$conv72;
 $w_addr_i187=$conv75;
 var $72=$w_addr_i187;
 var $vecinit_i189=SIMD.float32x4.withX(float32x4.splat(0),$72);
 var $73=$x_addr_i186;
 var $vecinit1_i190=SIMD.float32x4.withY($vecinit_i189,$73);
 var $74=$y_addr_i185;
 var $vecinit2_i191=SIMD.float32x4.withZ($vecinit1_i190,$74);
 var $75=$z_addr_i184;
 var $vecinit3_i192=SIMD.float32x4.withW($vecinit2_i191,$75);
 (HEAPF32[(($_compoundliteral_i188)>>2)]=$vecinit3_i192.x,HEAPF32[((($_compoundliteral_i188)+(4))>>2)]=$vecinit3_i192.y,HEAPF32[((($_compoundliteral_i188)+(8))>>2)]=$vecinit3_i192.z,HEAPF32[((($_compoundliteral_i188)+(12))>>2)]=$vecinit3_i192.w);
 var $76=float32x4(HEAPF32[(($_compoundliteral_i188)>>2)],HEAPF32[((($_compoundliteral_i188)+(4))>>2)],HEAPF32[((($_compoundliteral_i188)+(8))>>2)],HEAPF32[((($_compoundliteral_i188)+(12))>>2)]);
 (HEAPF32[(($cosphi)>>2)]=$76.x,HEAPF32[((($cosphi)+(4))>>2)]=$76.y,HEAPF32[((($cosphi)+(8))>>2)]=$76.z,HEAPF32[((($cosphi)+(12))>>2)]=$76.w);
 var $77=float32x4(HEAPF32[(($cosphi)>>2)],HEAPF32[((($cosphi)+(4))>>2)],HEAPF32[((($cosphi)+(8))>>2)],HEAPF32[((($cosphi)+(12))>>2)]);
 var $78=float32x4(HEAPF32[(($theta)>>2)],HEAPF32[((($theta)+(4))>>2)],HEAPF32[((($theta)+(8))>>2)],HEAPF32[((($theta)+(12))>>2)]);
 (HEAPF32[(($a_addr_i193)>>2)]=$77.x,HEAPF32[((($a_addr_i193)+(4))>>2)]=$77.y,HEAPF32[((($a_addr_i193)+(8))>>2)]=$77.z,HEAPF32[((($a_addr_i193)+(12))>>2)]=$77.w);
 (HEAPF32[(($b_addr_i194)>>2)]=$78.x,HEAPF32[((($b_addr_i194)+(4))>>2)]=$78.y,HEAPF32[((($b_addr_i194)+(8))>>2)]=$78.z,HEAPF32[((($b_addr_i194)+(12))>>2)]=$78.w);
 var $79=float32x4(HEAPF32[(($a_addr_i193)>>2)],HEAPF32[((($a_addr_i193)+(4))>>2)],HEAPF32[((($a_addr_i193)+(8))>>2)],HEAPF32[((($a_addr_i193)+(12))>>2)]);
 var $80=float32x4(HEAPF32[(($b_addr_i194)>>2)],HEAPF32[((($b_addr_i194)+(4))>>2)],HEAPF32[((($b_addr_i194)+(8))>>2)],HEAPF32[((($b_addr_i194)+(12))>>2)]);
 var $mul_i=SIMD.float32x4.mul($79,$80);
 (HEAPF32[(($x77)>>2)]=$mul_i.x,HEAPF32[((($x77)+(4))>>2)]=$mul_i.y,HEAPF32[((($x77)+(8))>>2)]=$mul_i.z,HEAPF32[((($x77)+(12))>>2)]=$mul_i.w);
 var $81=float32x4(HEAPF32[(($sinphi)>>2)],HEAPF32[((($sinphi)+(4))>>2)],HEAPF32[((($sinphi)+(8))>>2)],HEAPF32[((($sinphi)+(12))>>2)]);
 var $82=float32x4(HEAPF32[(($theta)>>2)],HEAPF32[((($theta)+(4))>>2)],HEAPF32[((($theta)+(8))>>2)],HEAPF32[((($theta)+(12))>>2)]);
 (HEAPF32[(($a_addr_i195)>>2)]=$81.x,HEAPF32[((($a_addr_i195)+(4))>>2)]=$81.y,HEAPF32[((($a_addr_i195)+(8))>>2)]=$81.z,HEAPF32[((($a_addr_i195)+(12))>>2)]=$81.w);
 (HEAPF32[(($b_addr_i196)>>2)]=$82.x,HEAPF32[((($b_addr_i196)+(4))>>2)]=$82.y,HEAPF32[((($b_addr_i196)+(8))>>2)]=$82.z,HEAPF32[((($b_addr_i196)+(12))>>2)]=$82.w);
 var $83=float32x4(HEAPF32[(($a_addr_i195)>>2)],HEAPF32[((($a_addr_i195)+(4))>>2)],HEAPF32[((($a_addr_i195)+(8))>>2)],HEAPF32[((($a_addr_i195)+(12))>>2)]);
 var $84=float32x4(HEAPF32[(($b_addr_i196)>>2)],HEAPF32[((($b_addr_i196)+(4))>>2)],HEAPF32[((($b_addr_i196)+(8))>>2)],HEAPF32[((($b_addr_i196)+(12))>>2)]);
 var $mul_i197=SIMD.float32x4.mul($83,$84);
 (HEAPF32[(($y79)>>2)]=$mul_i197.x,HEAPF32[((($y79)+(4))>>2)]=$mul_i197.y,HEAPF32[((($y79)+(8))>>2)]=$mul_i197.z,HEAPF32[((($y79)+(12))>>2)]=$mul_i197.w);
 $w_addr_i329=1;
 var $85=$w_addr_i329;
 var $vecinit_i331=SIMD.float32x4.withX(float32x4.splat(0),$85);
 var $86=$w_addr_i329;
 var $vecinit1_i332=SIMD.float32x4.withY($vecinit_i331,$86);
 var $87=$w_addr_i329;
 var $vecinit2_i333=SIMD.float32x4.withZ($vecinit1_i332,$87);
 var $88=$w_addr_i329;
 var $vecinit3_i334=SIMD.float32x4.withW($vecinit2_i333,$88);
 (HEAPF32[(($_compoundliteral_i330)>>2)]=$vecinit3_i334.x,HEAPF32[((($_compoundliteral_i330)+(4))>>2)]=$vecinit3_i334.y,HEAPF32[((($_compoundliteral_i330)+(8))>>2)]=$vecinit3_i334.z,HEAPF32[((($_compoundliteral_i330)+(12))>>2)]=$vecinit3_i334.w);
 var $89=float32x4(HEAPF32[(($_compoundliteral_i330)>>2)],HEAPF32[((($_compoundliteral_i330)+(4))>>2)],HEAPF32[((($_compoundliteral_i330)+(8))>>2)],HEAPF32[((($_compoundliteral_i330)+(12))>>2)]);
 var $90=float32x4(HEAPF32[(($theta)>>2)],HEAPF32[((($theta)+(4))>>2)],HEAPF32[((($theta)+(8))>>2)],HEAPF32[((($theta)+(12))>>2)]);
 var $91=float32x4(HEAPF32[(($theta)>>2)],HEAPF32[((($theta)+(4))>>2)],HEAPF32[((($theta)+(8))>>2)],HEAPF32[((($theta)+(12))>>2)]);
 (HEAPF32[(($a_addr_i337)>>2)]=$90.x,HEAPF32[((($a_addr_i337)+(4))>>2)]=$90.y,HEAPF32[((($a_addr_i337)+(8))>>2)]=$90.z,HEAPF32[((($a_addr_i337)+(12))>>2)]=$90.w);
 (HEAPF32[(($b_addr_i338)>>2)]=$91.x,HEAPF32[((($b_addr_i338)+(4))>>2)]=$91.y,HEAPF32[((($b_addr_i338)+(8))>>2)]=$91.z,HEAPF32[((($b_addr_i338)+(12))>>2)]=$91.w);
 var $92=float32x4(HEAPF32[(($a_addr_i337)>>2)],HEAPF32[((($a_addr_i337)+(4))>>2)],HEAPF32[((($a_addr_i337)+(8))>>2)],HEAPF32[((($a_addr_i337)+(12))>>2)]);
 var $93=float32x4(HEAPF32[(($b_addr_i338)>>2)],HEAPF32[((($b_addr_i338)+(4))>>2)],HEAPF32[((($b_addr_i338)+(8))>>2)],HEAPF32[((($b_addr_i338)+(12))>>2)]);
 var $mul_i339=SIMD.float32x4.mul($92,$93);
 (HEAPF32[(($a_addr_i335)>>2)]=$89.x,HEAPF32[((($a_addr_i335)+(4))>>2)]=$89.y,HEAPF32[((($a_addr_i335)+(8))>>2)]=$89.z,HEAPF32[((($a_addr_i335)+(12))>>2)]=$89.w);
 (HEAPF32[(($b_addr_i336)>>2)]=$mul_i339.x,HEAPF32[((($b_addr_i336)+(4))>>2)]=$mul_i339.y,HEAPF32[((($b_addr_i336)+(8))>>2)]=$mul_i339.z,HEAPF32[((($b_addr_i336)+(12))>>2)]=$mul_i339.w);
 var $94=float32x4(HEAPF32[(($a_addr_i335)>>2)],HEAPF32[((($a_addr_i335)+(4))>>2)],HEAPF32[((($a_addr_i335)+(8))>>2)],HEAPF32[((($a_addr_i335)+(12))>>2)]);
 var $95=float32x4(HEAPF32[(($b_addr_i336)>>2)],HEAPF32[((($b_addr_i336)+(4))>>2)],HEAPF32[((($b_addr_i336)+(8))>>2)],HEAPF32[((($b_addr_i336)+(12))>>2)]);
 var $sub_i=SIMD.float32x4.sub($94,$95);
 (HEAPF32[(($a_addr_i327)>>2)]=$sub_i.x,HEAPF32[((($a_addr_i327)+(4))>>2)]=$sub_i.y,HEAPF32[((($a_addr_i327)+(8))>>2)]=$sub_i.z,HEAPF32[((($a_addr_i327)+(12))>>2)]=$sub_i.w);
 var $96=float32x4(HEAPF32[(($a_addr_i327)>>2)],HEAPF32[((($a_addr_i327)+(4))>>2)],HEAPF32[((($a_addr_i327)+(8))>>2)],HEAPF32[((($a_addr_i327)+(12))>>2)]);
 var $call_i328=SIMD.float32x4.sqrt($96);
 (HEAPF32[(($z81)>>2)]=$call_i328.x,HEAPF32[((($z81)+(4))>>2)]=$call_i328.y,HEAPF32[((($z81)+(8))>>2)]=$call_i328.z,HEAPF32[((($z81)+(12))>>2)]=$call_i328.w);
 var $97=float32x4(HEAPF32[(($x77)>>2)],HEAPF32[((($x77)+(4))>>2)],HEAPF32[((($x77)+(8))>>2)],HEAPF32[((($x77)+(12))>>2)]);
 var $arrayidx86=(($basis)|0);
 var $x87=(($arrayidx86)|0);
 var $98=HEAPF32[(($x87)>>2)];
 $w_addr_i321=$98;
 var $99=$w_addr_i321;
 var $vecinit_i323=SIMD.float32x4.withX(float32x4.splat(0),$99);
 var $100=$w_addr_i321;
 var $vecinit1_i324=SIMD.float32x4.withY($vecinit_i323,$100);
 var $101=$w_addr_i321;
 var $vecinit2_i325=SIMD.float32x4.withZ($vecinit1_i324,$101);
 var $102=$w_addr_i321;
 var $vecinit3_i326=SIMD.float32x4.withW($vecinit2_i325,$102);
 (HEAPF32[(($_compoundliteral_i322)>>2)]=$vecinit3_i326.x,HEAPF32[((($_compoundliteral_i322)+(4))>>2)]=$vecinit3_i326.y,HEAPF32[((($_compoundliteral_i322)+(8))>>2)]=$vecinit3_i326.z,HEAPF32[((($_compoundliteral_i322)+(12))>>2)]=$vecinit3_i326.w);
 var $103=float32x4(HEAPF32[(($_compoundliteral_i322)>>2)],HEAPF32[((($_compoundliteral_i322)+(4))>>2)],HEAPF32[((($_compoundliteral_i322)+(8))>>2)],HEAPF32[((($_compoundliteral_i322)+(12))>>2)]);
 (HEAPF32[(($a_addr_i318)>>2)]=$97.x,HEAPF32[((($a_addr_i318)+(4))>>2)]=$97.y,HEAPF32[((($a_addr_i318)+(8))>>2)]=$97.z,HEAPF32[((($a_addr_i318)+(12))>>2)]=$97.w);
 (HEAPF32[(($b_addr_i319)>>2)]=$103.x,HEAPF32[((($b_addr_i319)+(4))>>2)]=$103.y,HEAPF32[((($b_addr_i319)+(8))>>2)]=$103.z,HEAPF32[((($b_addr_i319)+(12))>>2)]=$103.w);
 var $104=float32x4(HEAPF32[(($a_addr_i318)>>2)],HEAPF32[((($a_addr_i318)+(4))>>2)],HEAPF32[((($a_addr_i318)+(8))>>2)],HEAPF32[((($a_addr_i318)+(12))>>2)]);
 var $105=float32x4(HEAPF32[(($b_addr_i319)>>2)],HEAPF32[((($b_addr_i319)+(4))>>2)],HEAPF32[((($b_addr_i319)+(8))>>2)],HEAPF32[((($b_addr_i319)+(12))>>2)]);
 var $mul_i320=SIMD.float32x4.mul($104,$105);
 var $106=float32x4(HEAPF32[(($y79)>>2)],HEAPF32[((($y79)+(4))>>2)],HEAPF32[((($y79)+(8))>>2)],HEAPF32[((($y79)+(12))>>2)]);
 var $arrayidx90=(($basis+12)|0);
 var $x91=(($arrayidx90)|0);
 var $107=HEAPF32[(($x91)>>2)];
 $w_addr_i312=$107;
 var $108=$w_addr_i312;
 var $vecinit_i314=SIMD.float32x4.withX(float32x4.splat(0),$108);
 var $109=$w_addr_i312;
 var $vecinit1_i315=SIMD.float32x4.withY($vecinit_i314,$109);
 var $110=$w_addr_i312;
 var $vecinit2_i316=SIMD.float32x4.withZ($vecinit1_i315,$110);
 var $111=$w_addr_i312;
 var $vecinit3_i317=SIMD.float32x4.withW($vecinit2_i316,$111);
 (HEAPF32[(($_compoundliteral_i313)>>2)]=$vecinit3_i317.x,HEAPF32[((($_compoundliteral_i313)+(4))>>2)]=$vecinit3_i317.y,HEAPF32[((($_compoundliteral_i313)+(8))>>2)]=$vecinit3_i317.z,HEAPF32[((($_compoundliteral_i313)+(12))>>2)]=$vecinit3_i317.w);
 var $112=float32x4(HEAPF32[(($_compoundliteral_i313)>>2)],HEAPF32[((($_compoundliteral_i313)+(4))>>2)],HEAPF32[((($_compoundliteral_i313)+(8))>>2)],HEAPF32[((($_compoundliteral_i313)+(12))>>2)]);
 (HEAPF32[(($a_addr_i309)>>2)]=$106.x,HEAPF32[((($a_addr_i309)+(4))>>2)]=$106.y,HEAPF32[((($a_addr_i309)+(8))>>2)]=$106.z,HEAPF32[((($a_addr_i309)+(12))>>2)]=$106.w);
 (HEAPF32[(($b_addr_i310)>>2)]=$112.x,HEAPF32[((($b_addr_i310)+(4))>>2)]=$112.y,HEAPF32[((($b_addr_i310)+(8))>>2)]=$112.z,HEAPF32[((($b_addr_i310)+(12))>>2)]=$112.w);
 var $113=float32x4(HEAPF32[(($a_addr_i309)>>2)],HEAPF32[((($a_addr_i309)+(4))>>2)],HEAPF32[((($a_addr_i309)+(8))>>2)],HEAPF32[((($a_addr_i309)+(12))>>2)]);
 var $114=float32x4(HEAPF32[(($b_addr_i310)>>2)],HEAPF32[((($b_addr_i310)+(4))>>2)],HEAPF32[((($b_addr_i310)+(8))>>2)],HEAPF32[((($b_addr_i310)+(12))>>2)]);
 var $mul_i311=SIMD.float32x4.mul($113,$114);
 var $115=float32x4(HEAPF32[(($z81)>>2)],HEAPF32[((($z81)+(4))>>2)],HEAPF32[((($z81)+(8))>>2)],HEAPF32[((($z81)+(12))>>2)]);
 var $arrayidx94=(($basis+24)|0);
 var $x95=(($arrayidx94)|0);
 var $116=HEAPF32[(($x95)>>2)];
 $w_addr_i303=$116;
 var $117=$w_addr_i303;
 var $vecinit_i305=SIMD.float32x4.withX(float32x4.splat(0),$117);
 var $118=$w_addr_i303;
 var $vecinit1_i306=SIMD.float32x4.withY($vecinit_i305,$118);
 var $119=$w_addr_i303;
 var $vecinit2_i307=SIMD.float32x4.withZ($vecinit1_i306,$119);
 var $120=$w_addr_i303;
 var $vecinit3_i308=SIMD.float32x4.withW($vecinit2_i307,$120);
 (HEAPF32[(($_compoundliteral_i304)>>2)]=$vecinit3_i308.x,HEAPF32[((($_compoundliteral_i304)+(4))>>2)]=$vecinit3_i308.y,HEAPF32[((($_compoundliteral_i304)+(8))>>2)]=$vecinit3_i308.z,HEAPF32[((($_compoundliteral_i304)+(12))>>2)]=$vecinit3_i308.w);
 var $121=float32x4(HEAPF32[(($_compoundliteral_i304)>>2)],HEAPF32[((($_compoundliteral_i304)+(4))>>2)],HEAPF32[((($_compoundliteral_i304)+(8))>>2)],HEAPF32[((($_compoundliteral_i304)+(12))>>2)]);
 (HEAPF32[(($a_addr_i300)>>2)]=$115.x,HEAPF32[((($a_addr_i300)+(4))>>2)]=$115.y,HEAPF32[((($a_addr_i300)+(8))>>2)]=$115.z,HEAPF32[((($a_addr_i300)+(12))>>2)]=$115.w);
 (HEAPF32[(($b_addr_i301)>>2)]=$121.x,HEAPF32[((($b_addr_i301)+(4))>>2)]=$121.y,HEAPF32[((($b_addr_i301)+(8))>>2)]=$121.z,HEAPF32[((($b_addr_i301)+(12))>>2)]=$121.w);
 var $122=float32x4(HEAPF32[(($a_addr_i300)>>2)],HEAPF32[((($a_addr_i300)+(4))>>2)],HEAPF32[((($a_addr_i300)+(8))>>2)],HEAPF32[((($a_addr_i300)+(12))>>2)]);
 var $123=float32x4(HEAPF32[(($b_addr_i301)>>2)],HEAPF32[((($b_addr_i301)+(4))>>2)],HEAPF32[((($b_addr_i301)+(8))>>2)],HEAPF32[((($b_addr_i301)+(12))>>2)]);
 var $mul_i302=SIMD.float32x4.mul($122,$123);
 (HEAPF32[(($a_addr_i297)>>2)]=$mul_i311.x,HEAPF32[((($a_addr_i297)+(4))>>2)]=$mul_i311.y,HEAPF32[((($a_addr_i297)+(8))>>2)]=$mul_i311.z,HEAPF32[((($a_addr_i297)+(12))>>2)]=$mul_i311.w);
 (HEAPF32[(($b_addr_i298)>>2)]=$mul_i302.x,HEAPF32[((($b_addr_i298)+(4))>>2)]=$mul_i302.y,HEAPF32[((($b_addr_i298)+(8))>>2)]=$mul_i302.z,HEAPF32[((($b_addr_i298)+(12))>>2)]=$mul_i302.w);
 var $124=float32x4(HEAPF32[(($a_addr_i297)>>2)],HEAPF32[((($a_addr_i297)+(4))>>2)],HEAPF32[((($a_addr_i297)+(8))>>2)],HEAPF32[((($a_addr_i297)+(12))>>2)]);
 var $125=float32x4(HEAPF32[(($b_addr_i298)>>2)],HEAPF32[((($b_addr_i298)+(4))>>2)],HEAPF32[((($b_addr_i298)+(8))>>2)],HEAPF32[((($b_addr_i298)+(12))>>2)]);
 var $add_i299=SIMD.float32x4.add($124,$125);
 (HEAPF32[(($a_addr_i294)>>2)]=$mul_i320.x,HEAPF32[((($a_addr_i294)+(4))>>2)]=$mul_i320.y,HEAPF32[((($a_addr_i294)+(8))>>2)]=$mul_i320.z,HEAPF32[((($a_addr_i294)+(12))>>2)]=$mul_i320.w);
 (HEAPF32[(($b_addr_i295)>>2)]=$add_i299.x,HEAPF32[((($b_addr_i295)+(4))>>2)]=$add_i299.y,HEAPF32[((($b_addr_i295)+(8))>>2)]=$add_i299.z,HEAPF32[((($b_addr_i295)+(12))>>2)]=$add_i299.w);
 var $126=float32x4(HEAPF32[(($a_addr_i294)>>2)],HEAPF32[((($a_addr_i294)+(4))>>2)],HEAPF32[((($a_addr_i294)+(8))>>2)],HEAPF32[((($a_addr_i294)+(12))>>2)]);
 var $127=float32x4(HEAPF32[(($b_addr_i295)>>2)],HEAPF32[((($b_addr_i295)+(4))>>2)],HEAPF32[((($b_addr_i295)+(8))>>2)],HEAPF32[((($b_addr_i295)+(12))>>2)]);
 var $add_i296=SIMD.float32x4.add($126,$127);
 (HEAPF32[(($dirx)>>2)]=$add_i296.x,HEAPF32[((($dirx)+(4))>>2)]=$add_i296.y,HEAPF32[((($dirx)+(8))>>2)]=$add_i296.z,HEAPF32[((($dirx)+(12))>>2)]=$add_i296.w);
 var $128=float32x4(HEAPF32[(($x77)>>2)],HEAPF32[((($x77)+(4))>>2)],HEAPF32[((($x77)+(8))>>2)],HEAPF32[((($x77)+(12))>>2)]);
 var $arrayidx100=(($basis)|0);
 var $y101=(($arrayidx100+4)|0);
 var $129=HEAPF32[(($y101)>>2)];
 $w_addr_i288=$129;
 var $130=$w_addr_i288;
 var $vecinit_i290=SIMD.float32x4.withX(float32x4.splat(0),$130);
 var $131=$w_addr_i288;
 var $vecinit1_i291=SIMD.float32x4.withY($vecinit_i290,$131);
 var $132=$w_addr_i288;
 var $vecinit2_i292=SIMD.float32x4.withZ($vecinit1_i291,$132);
 var $133=$w_addr_i288;
 var $vecinit3_i293=SIMD.float32x4.withW($vecinit2_i292,$133);
 (HEAPF32[(($_compoundliteral_i289)>>2)]=$vecinit3_i293.x,HEAPF32[((($_compoundliteral_i289)+(4))>>2)]=$vecinit3_i293.y,HEAPF32[((($_compoundliteral_i289)+(8))>>2)]=$vecinit3_i293.z,HEAPF32[((($_compoundliteral_i289)+(12))>>2)]=$vecinit3_i293.w);
 var $134=float32x4(HEAPF32[(($_compoundliteral_i289)>>2)],HEAPF32[((($_compoundliteral_i289)+(4))>>2)],HEAPF32[((($_compoundliteral_i289)+(8))>>2)],HEAPF32[((($_compoundliteral_i289)+(12))>>2)]);
 (HEAPF32[(($a_addr_i285)>>2)]=$128.x,HEAPF32[((($a_addr_i285)+(4))>>2)]=$128.y,HEAPF32[((($a_addr_i285)+(8))>>2)]=$128.z,HEAPF32[((($a_addr_i285)+(12))>>2)]=$128.w);
 (HEAPF32[(($b_addr_i286)>>2)]=$134.x,HEAPF32[((($b_addr_i286)+(4))>>2)]=$134.y,HEAPF32[((($b_addr_i286)+(8))>>2)]=$134.z,HEAPF32[((($b_addr_i286)+(12))>>2)]=$134.w);
 var $135=float32x4(HEAPF32[(($a_addr_i285)>>2)],HEAPF32[((($a_addr_i285)+(4))>>2)],HEAPF32[((($a_addr_i285)+(8))>>2)],HEAPF32[((($a_addr_i285)+(12))>>2)]);
 var $136=float32x4(HEAPF32[(($b_addr_i286)>>2)],HEAPF32[((($b_addr_i286)+(4))>>2)],HEAPF32[((($b_addr_i286)+(8))>>2)],HEAPF32[((($b_addr_i286)+(12))>>2)]);
 var $mul_i287=SIMD.float32x4.mul($135,$136);
 var $137=float32x4(HEAPF32[(($y79)>>2)],HEAPF32[((($y79)+(4))>>2)],HEAPF32[((($y79)+(8))>>2)],HEAPF32[((($y79)+(12))>>2)]);
 var $arrayidx104=(($basis+12)|0);
 var $y105=(($arrayidx104+4)|0);
 var $138=HEAPF32[(($y105)>>2)];
 $w_addr_i279=$138;
 var $139=$w_addr_i279;
 var $vecinit_i281=SIMD.float32x4.withX(float32x4.splat(0),$139);
 var $140=$w_addr_i279;
 var $vecinit1_i282=SIMD.float32x4.withY($vecinit_i281,$140);
 var $141=$w_addr_i279;
 var $vecinit2_i283=SIMD.float32x4.withZ($vecinit1_i282,$141);
 var $142=$w_addr_i279;
 var $vecinit3_i284=SIMD.float32x4.withW($vecinit2_i283,$142);
 (HEAPF32[(($_compoundliteral_i280)>>2)]=$vecinit3_i284.x,HEAPF32[((($_compoundliteral_i280)+(4))>>2)]=$vecinit3_i284.y,HEAPF32[((($_compoundliteral_i280)+(8))>>2)]=$vecinit3_i284.z,HEAPF32[((($_compoundliteral_i280)+(12))>>2)]=$vecinit3_i284.w);
 var $143=float32x4(HEAPF32[(($_compoundliteral_i280)>>2)],HEAPF32[((($_compoundliteral_i280)+(4))>>2)],HEAPF32[((($_compoundliteral_i280)+(8))>>2)],HEAPF32[((($_compoundliteral_i280)+(12))>>2)]);
 (HEAPF32[(($a_addr_i276)>>2)]=$137.x,HEAPF32[((($a_addr_i276)+(4))>>2)]=$137.y,HEAPF32[((($a_addr_i276)+(8))>>2)]=$137.z,HEAPF32[((($a_addr_i276)+(12))>>2)]=$137.w);
 (HEAPF32[(($b_addr_i277)>>2)]=$143.x,HEAPF32[((($b_addr_i277)+(4))>>2)]=$143.y,HEAPF32[((($b_addr_i277)+(8))>>2)]=$143.z,HEAPF32[((($b_addr_i277)+(12))>>2)]=$143.w);
 var $144=float32x4(HEAPF32[(($a_addr_i276)>>2)],HEAPF32[((($a_addr_i276)+(4))>>2)],HEAPF32[((($a_addr_i276)+(8))>>2)],HEAPF32[((($a_addr_i276)+(12))>>2)]);
 var $145=float32x4(HEAPF32[(($b_addr_i277)>>2)],HEAPF32[((($b_addr_i277)+(4))>>2)],HEAPF32[((($b_addr_i277)+(8))>>2)],HEAPF32[((($b_addr_i277)+(12))>>2)]);
 var $mul_i278=SIMD.float32x4.mul($144,$145);
 var $146=float32x4(HEAPF32[(($z81)>>2)],HEAPF32[((($z81)+(4))>>2)],HEAPF32[((($z81)+(8))>>2)],HEAPF32[((($z81)+(12))>>2)]);
 var $arrayidx108=(($basis+24)|0);
 var $y109=(($arrayidx108+4)|0);
 var $147=HEAPF32[(($y109)>>2)];
 $w_addr_i270=$147;
 var $148=$w_addr_i270;
 var $vecinit_i272=SIMD.float32x4.withX(float32x4.splat(0),$148);
 var $149=$w_addr_i270;
 var $vecinit1_i273=SIMD.float32x4.withY($vecinit_i272,$149);
 var $150=$w_addr_i270;
 var $vecinit2_i274=SIMD.float32x4.withZ($vecinit1_i273,$150);
 var $151=$w_addr_i270;
 var $vecinit3_i275=SIMD.float32x4.withW($vecinit2_i274,$151);
 (HEAPF32[(($_compoundliteral_i271)>>2)]=$vecinit3_i275.x,HEAPF32[((($_compoundliteral_i271)+(4))>>2)]=$vecinit3_i275.y,HEAPF32[((($_compoundliteral_i271)+(8))>>2)]=$vecinit3_i275.z,HEAPF32[((($_compoundliteral_i271)+(12))>>2)]=$vecinit3_i275.w);
 var $152=float32x4(HEAPF32[(($_compoundliteral_i271)>>2)],HEAPF32[((($_compoundliteral_i271)+(4))>>2)],HEAPF32[((($_compoundliteral_i271)+(8))>>2)],HEAPF32[((($_compoundliteral_i271)+(12))>>2)]);
 (HEAPF32[(($a_addr_i267)>>2)]=$146.x,HEAPF32[((($a_addr_i267)+(4))>>2)]=$146.y,HEAPF32[((($a_addr_i267)+(8))>>2)]=$146.z,HEAPF32[((($a_addr_i267)+(12))>>2)]=$146.w);
 (HEAPF32[(($b_addr_i268)>>2)]=$152.x,HEAPF32[((($b_addr_i268)+(4))>>2)]=$152.y,HEAPF32[((($b_addr_i268)+(8))>>2)]=$152.z,HEAPF32[((($b_addr_i268)+(12))>>2)]=$152.w);
 var $153=float32x4(HEAPF32[(($a_addr_i267)>>2)],HEAPF32[((($a_addr_i267)+(4))>>2)],HEAPF32[((($a_addr_i267)+(8))>>2)],HEAPF32[((($a_addr_i267)+(12))>>2)]);
 var $154=float32x4(HEAPF32[(($b_addr_i268)>>2)],HEAPF32[((($b_addr_i268)+(4))>>2)],HEAPF32[((($b_addr_i268)+(8))>>2)],HEAPF32[((($b_addr_i268)+(12))>>2)]);
 var $mul_i269=SIMD.float32x4.mul($153,$154);
 (HEAPF32[(($a_addr_i264)>>2)]=$mul_i278.x,HEAPF32[((($a_addr_i264)+(4))>>2)]=$mul_i278.y,HEAPF32[((($a_addr_i264)+(8))>>2)]=$mul_i278.z,HEAPF32[((($a_addr_i264)+(12))>>2)]=$mul_i278.w);
 (HEAPF32[(($b_addr_i265)>>2)]=$mul_i269.x,HEAPF32[((($b_addr_i265)+(4))>>2)]=$mul_i269.y,HEAPF32[((($b_addr_i265)+(8))>>2)]=$mul_i269.z,HEAPF32[((($b_addr_i265)+(12))>>2)]=$mul_i269.w);
 var $155=float32x4(HEAPF32[(($a_addr_i264)>>2)],HEAPF32[((($a_addr_i264)+(4))>>2)],HEAPF32[((($a_addr_i264)+(8))>>2)],HEAPF32[((($a_addr_i264)+(12))>>2)]);
 var $156=float32x4(HEAPF32[(($b_addr_i265)>>2)],HEAPF32[((($b_addr_i265)+(4))>>2)],HEAPF32[((($b_addr_i265)+(8))>>2)],HEAPF32[((($b_addr_i265)+(12))>>2)]);
 var $add_i266=SIMD.float32x4.add($155,$156);
 (HEAPF32[(($a_addr_i261)>>2)]=$mul_i287.x,HEAPF32[((($a_addr_i261)+(4))>>2)]=$mul_i287.y,HEAPF32[((($a_addr_i261)+(8))>>2)]=$mul_i287.z,HEAPF32[((($a_addr_i261)+(12))>>2)]=$mul_i287.w);
 (HEAPF32[(($b_addr_i262)>>2)]=$add_i266.x,HEAPF32[((($b_addr_i262)+(4))>>2)]=$add_i266.y,HEAPF32[((($b_addr_i262)+(8))>>2)]=$add_i266.z,HEAPF32[((($b_addr_i262)+(12))>>2)]=$add_i266.w);
 var $157=float32x4(HEAPF32[(($a_addr_i261)>>2)],HEAPF32[((($a_addr_i261)+(4))>>2)],HEAPF32[((($a_addr_i261)+(8))>>2)],HEAPF32[((($a_addr_i261)+(12))>>2)]);
 var $158=float32x4(HEAPF32[(($b_addr_i262)>>2)],HEAPF32[((($b_addr_i262)+(4))>>2)],HEAPF32[((($b_addr_i262)+(8))>>2)],HEAPF32[((($b_addr_i262)+(12))>>2)]);
 var $add_i263=SIMD.float32x4.add($157,$158);
 (HEAPF32[(($diry)>>2)]=$add_i263.x,HEAPF32[((($diry)+(4))>>2)]=$add_i263.y,HEAPF32[((($diry)+(8))>>2)]=$add_i263.z,HEAPF32[((($diry)+(12))>>2)]=$add_i263.w);
 var $159=float32x4(HEAPF32[(($x77)>>2)],HEAPF32[((($x77)+(4))>>2)],HEAPF32[((($x77)+(8))>>2)],HEAPF32[((($x77)+(12))>>2)]);
 var $arrayidx114=(($basis)|0);
 var $z115=(($arrayidx114+8)|0);
 var $160=HEAPF32[(($z115)>>2)];
 $w_addr_i255=$160;
 var $161=$w_addr_i255;
 var $vecinit_i257=SIMD.float32x4.withX(float32x4.splat(0),$161);
 var $162=$w_addr_i255;
 var $vecinit1_i258=SIMD.float32x4.withY($vecinit_i257,$162);
 var $163=$w_addr_i255;
 var $vecinit2_i259=SIMD.float32x4.withZ($vecinit1_i258,$163);
 var $164=$w_addr_i255;
 var $vecinit3_i260=SIMD.float32x4.withW($vecinit2_i259,$164);
 (HEAPF32[(($_compoundliteral_i256)>>2)]=$vecinit3_i260.x,HEAPF32[((($_compoundliteral_i256)+(4))>>2)]=$vecinit3_i260.y,HEAPF32[((($_compoundliteral_i256)+(8))>>2)]=$vecinit3_i260.z,HEAPF32[((($_compoundliteral_i256)+(12))>>2)]=$vecinit3_i260.w);
 var $165=float32x4(HEAPF32[(($_compoundliteral_i256)>>2)],HEAPF32[((($_compoundliteral_i256)+(4))>>2)],HEAPF32[((($_compoundliteral_i256)+(8))>>2)],HEAPF32[((($_compoundliteral_i256)+(12))>>2)]);
 (HEAPF32[(($a_addr_i252)>>2)]=$159.x,HEAPF32[((($a_addr_i252)+(4))>>2)]=$159.y,HEAPF32[((($a_addr_i252)+(8))>>2)]=$159.z,HEAPF32[((($a_addr_i252)+(12))>>2)]=$159.w);
 (HEAPF32[(($b_addr_i253)>>2)]=$165.x,HEAPF32[((($b_addr_i253)+(4))>>2)]=$165.y,HEAPF32[((($b_addr_i253)+(8))>>2)]=$165.z,HEAPF32[((($b_addr_i253)+(12))>>2)]=$165.w);
 var $166=float32x4(HEAPF32[(($a_addr_i252)>>2)],HEAPF32[((($a_addr_i252)+(4))>>2)],HEAPF32[((($a_addr_i252)+(8))>>2)],HEAPF32[((($a_addr_i252)+(12))>>2)]);
 var $167=float32x4(HEAPF32[(($b_addr_i253)>>2)],HEAPF32[((($b_addr_i253)+(4))>>2)],HEAPF32[((($b_addr_i253)+(8))>>2)],HEAPF32[((($b_addr_i253)+(12))>>2)]);
 var $mul_i254=SIMD.float32x4.mul($166,$167);
 var $168=float32x4(HEAPF32[(($y79)>>2)],HEAPF32[((($y79)+(4))>>2)],HEAPF32[((($y79)+(8))>>2)],HEAPF32[((($y79)+(12))>>2)]);
 var $arrayidx118=(($basis+12)|0);
 var $z119=(($arrayidx118+8)|0);
 var $169=HEAPF32[(($z119)>>2)];
 $w_addr_i246=$169;
 var $170=$w_addr_i246;
 var $vecinit_i248=SIMD.float32x4.withX(float32x4.splat(0),$170);
 var $171=$w_addr_i246;
 var $vecinit1_i249=SIMD.float32x4.withY($vecinit_i248,$171);
 var $172=$w_addr_i246;
 var $vecinit2_i250=SIMD.float32x4.withZ($vecinit1_i249,$172);
 var $173=$w_addr_i246;
 var $vecinit3_i251=SIMD.float32x4.withW($vecinit2_i250,$173);
 (HEAPF32[(($_compoundliteral_i247)>>2)]=$vecinit3_i251.x,HEAPF32[((($_compoundliteral_i247)+(4))>>2)]=$vecinit3_i251.y,HEAPF32[((($_compoundliteral_i247)+(8))>>2)]=$vecinit3_i251.z,HEAPF32[((($_compoundliteral_i247)+(12))>>2)]=$vecinit3_i251.w);
 var $174=float32x4(HEAPF32[(($_compoundliteral_i247)>>2)],HEAPF32[((($_compoundliteral_i247)+(4))>>2)],HEAPF32[((($_compoundliteral_i247)+(8))>>2)],HEAPF32[((($_compoundliteral_i247)+(12))>>2)]);
 (HEAPF32[(($a_addr_i243)>>2)]=$168.x,HEAPF32[((($a_addr_i243)+(4))>>2)]=$168.y,HEAPF32[((($a_addr_i243)+(8))>>2)]=$168.z,HEAPF32[((($a_addr_i243)+(12))>>2)]=$168.w);
 (HEAPF32[(($b_addr_i244)>>2)]=$174.x,HEAPF32[((($b_addr_i244)+(4))>>2)]=$174.y,HEAPF32[((($b_addr_i244)+(8))>>2)]=$174.z,HEAPF32[((($b_addr_i244)+(12))>>2)]=$174.w);
 var $175=float32x4(HEAPF32[(($a_addr_i243)>>2)],HEAPF32[((($a_addr_i243)+(4))>>2)],HEAPF32[((($a_addr_i243)+(8))>>2)],HEAPF32[((($a_addr_i243)+(12))>>2)]);
 var $176=float32x4(HEAPF32[(($b_addr_i244)>>2)],HEAPF32[((($b_addr_i244)+(4))>>2)],HEAPF32[((($b_addr_i244)+(8))>>2)],HEAPF32[((($b_addr_i244)+(12))>>2)]);
 var $mul_i245=SIMD.float32x4.mul($175,$176);
 var $177=float32x4(HEAPF32[(($z81)>>2)],HEAPF32[((($z81)+(4))>>2)],HEAPF32[((($z81)+(8))>>2)],HEAPF32[((($z81)+(12))>>2)]);
 var $arrayidx122=(($basis+24)|0);
 var $z123=(($arrayidx122+8)|0);
 var $178=HEAPF32[(($z123)>>2)];
 $w_addr_i237=$178;
 var $179=$w_addr_i237;
 var $vecinit_i239=SIMD.float32x4.withX(float32x4.splat(0),$179);
 var $180=$w_addr_i237;
 var $vecinit1_i240=SIMD.float32x4.withY($vecinit_i239,$180);
 var $181=$w_addr_i237;
 var $vecinit2_i241=SIMD.float32x4.withZ($vecinit1_i240,$181);
 var $182=$w_addr_i237;
 var $vecinit3_i242=SIMD.float32x4.withW($vecinit2_i241,$182);
 (HEAPF32[(($_compoundliteral_i238)>>2)]=$vecinit3_i242.x,HEAPF32[((($_compoundliteral_i238)+(4))>>2)]=$vecinit3_i242.y,HEAPF32[((($_compoundliteral_i238)+(8))>>2)]=$vecinit3_i242.z,HEAPF32[((($_compoundliteral_i238)+(12))>>2)]=$vecinit3_i242.w);
 var $183=float32x4(HEAPF32[(($_compoundliteral_i238)>>2)],HEAPF32[((($_compoundliteral_i238)+(4))>>2)],HEAPF32[((($_compoundliteral_i238)+(8))>>2)],HEAPF32[((($_compoundliteral_i238)+(12))>>2)]);
 (HEAPF32[(($a_addr_i234)>>2)]=$177.x,HEAPF32[((($a_addr_i234)+(4))>>2)]=$177.y,HEAPF32[((($a_addr_i234)+(8))>>2)]=$177.z,HEAPF32[((($a_addr_i234)+(12))>>2)]=$177.w);
 (HEAPF32[(($b_addr_i235)>>2)]=$183.x,HEAPF32[((($b_addr_i235)+(4))>>2)]=$183.y,HEAPF32[((($b_addr_i235)+(8))>>2)]=$183.z,HEAPF32[((($b_addr_i235)+(12))>>2)]=$183.w);
 var $184=float32x4(HEAPF32[(($a_addr_i234)>>2)],HEAPF32[((($a_addr_i234)+(4))>>2)],HEAPF32[((($a_addr_i234)+(8))>>2)],HEAPF32[((($a_addr_i234)+(12))>>2)]);
 var $185=float32x4(HEAPF32[(($b_addr_i235)>>2)],HEAPF32[((($b_addr_i235)+(4))>>2)],HEAPF32[((($b_addr_i235)+(8))>>2)],HEAPF32[((($b_addr_i235)+(12))>>2)]);
 var $mul_i236=SIMD.float32x4.mul($184,$185);
 (HEAPF32[(($a_addr_i231)>>2)]=$mul_i245.x,HEAPF32[((($a_addr_i231)+(4))>>2)]=$mul_i245.y,HEAPF32[((($a_addr_i231)+(8))>>2)]=$mul_i245.z,HEAPF32[((($a_addr_i231)+(12))>>2)]=$mul_i245.w);
 (HEAPF32[(($b_addr_i232)>>2)]=$mul_i236.x,HEAPF32[((($b_addr_i232)+(4))>>2)]=$mul_i236.y,HEAPF32[((($b_addr_i232)+(8))>>2)]=$mul_i236.z,HEAPF32[((($b_addr_i232)+(12))>>2)]=$mul_i236.w);
 var $186=float32x4(HEAPF32[(($a_addr_i231)>>2)],HEAPF32[((($a_addr_i231)+(4))>>2)],HEAPF32[((($a_addr_i231)+(8))>>2)],HEAPF32[((($a_addr_i231)+(12))>>2)]);
 var $187=float32x4(HEAPF32[(($b_addr_i232)>>2)],HEAPF32[((($b_addr_i232)+(4))>>2)],HEAPF32[((($b_addr_i232)+(8))>>2)],HEAPF32[((($b_addr_i232)+(12))>>2)]);
 var $add_i233=SIMD.float32x4.add($186,$187);
 (HEAPF32[(($a_addr_i228)>>2)]=$mul_i254.x,HEAPF32[((($a_addr_i228)+(4))>>2)]=$mul_i254.y,HEAPF32[((($a_addr_i228)+(8))>>2)]=$mul_i254.z,HEAPF32[((($a_addr_i228)+(12))>>2)]=$mul_i254.w);
 (HEAPF32[(($b_addr_i229)>>2)]=$add_i233.x,HEAPF32[((($b_addr_i229)+(4))>>2)]=$add_i233.y,HEAPF32[((($b_addr_i229)+(8))>>2)]=$add_i233.z,HEAPF32[((($b_addr_i229)+(12))>>2)]=$add_i233.w);
 var $188=float32x4(HEAPF32[(($a_addr_i228)>>2)],HEAPF32[((($a_addr_i228)+(4))>>2)],HEAPF32[((($a_addr_i228)+(8))>>2)],HEAPF32[((($a_addr_i228)+(12))>>2)]);
 var $189=float32x4(HEAPF32[(($b_addr_i229)>>2)],HEAPF32[((($b_addr_i229)+(4))>>2)],HEAPF32[((($b_addr_i229)+(8))>>2)],HEAPF32[((($b_addr_i229)+(12))>>2)]);
 var $add_i230=SIMD.float32x4.add($188,$189);
 (HEAPF32[(($dirz)>>2)]=$add_i230.x,HEAPF32[((($dirz)+(4))>>2)]=$add_i230.y,HEAPF32[((($dirz)+(8))>>2)]=$add_i230.z,HEAPF32[((($dirz)+(12))>>2)]=$add_i230.w);
 var $x128=(($p)|0);
 var $190=HEAPF32[(($x128)>>2)];
 $w_addr_i222=$190;
 var $191=$w_addr_i222;
 var $vecinit_i224=SIMD.float32x4.withX(float32x4.splat(0),$191);
 var $192=$w_addr_i222;
 var $vecinit1_i225=SIMD.float32x4.withY($vecinit_i224,$192);
 var $193=$w_addr_i222;
 var $vecinit2_i226=SIMD.float32x4.withZ($vecinit1_i225,$193);
 var $194=$w_addr_i222;
 var $vecinit3_i227=SIMD.float32x4.withW($vecinit2_i226,$194);
 (HEAPF32[(($_compoundliteral_i223)>>2)]=$vecinit3_i227.x,HEAPF32[((($_compoundliteral_i223)+(4))>>2)]=$vecinit3_i227.y,HEAPF32[((($_compoundliteral_i223)+(8))>>2)]=$vecinit3_i227.z,HEAPF32[((($_compoundliteral_i223)+(12))>>2)]=$vecinit3_i227.w);
 var $195=float32x4(HEAPF32[(($_compoundliteral_i223)>>2)],HEAPF32[((($_compoundliteral_i223)+(4))>>2)],HEAPF32[((($_compoundliteral_i223)+(8))>>2)],HEAPF32[((($_compoundliteral_i223)+(12))>>2)]);
 (HEAPF32[(($orgx)>>2)]=$195.x,HEAPF32[((($orgx)+(4))>>2)]=$195.y,HEAPF32[((($orgx)+(8))>>2)]=$195.z,HEAPF32[((($orgx)+(12))>>2)]=$195.w);
 var $y130=(($p+4)|0);
 var $196=HEAPF32[(($y130)>>2)];
 $w_addr_i216=$196;
 var $197=$w_addr_i216;
 var $vecinit_i218=SIMD.float32x4.withX(float32x4.splat(0),$197);
 var $198=$w_addr_i216;
 var $vecinit1_i219=SIMD.float32x4.withY($vecinit_i218,$198);
 var $199=$w_addr_i216;
 var $vecinit2_i220=SIMD.float32x4.withZ($vecinit1_i219,$199);
 var $200=$w_addr_i216;
 var $vecinit3_i221=SIMD.float32x4.withW($vecinit2_i220,$200);
 (HEAPF32[(($_compoundliteral_i217)>>2)]=$vecinit3_i221.x,HEAPF32[((($_compoundliteral_i217)+(4))>>2)]=$vecinit3_i221.y,HEAPF32[((($_compoundliteral_i217)+(8))>>2)]=$vecinit3_i221.z,HEAPF32[((($_compoundliteral_i217)+(12))>>2)]=$vecinit3_i221.w);
 var $201=float32x4(HEAPF32[(($_compoundliteral_i217)>>2)],HEAPF32[((($_compoundliteral_i217)+(4))>>2)],HEAPF32[((($_compoundliteral_i217)+(8))>>2)],HEAPF32[((($_compoundliteral_i217)+(12))>>2)]);
 (HEAPF32[(($orgy)>>2)]=$201.x,HEAPF32[((($orgy)+(4))>>2)]=$201.y,HEAPF32[((($orgy)+(8))>>2)]=$201.z,HEAPF32[((($orgy)+(12))>>2)]=$201.w);
 var $z132=(($p+8)|0);
 var $202=HEAPF32[(($z132)>>2)];
 $w_addr_i210=$202;
 var $203=$w_addr_i210;
 var $vecinit_i212=SIMD.float32x4.withX(float32x4.splat(0),$203);
 var $204=$w_addr_i210;
 var $vecinit1_i213=SIMD.float32x4.withY($vecinit_i212,$204);
 var $205=$w_addr_i210;
 var $vecinit2_i214=SIMD.float32x4.withZ($vecinit1_i213,$205);
 var $206=$w_addr_i210;
 var $vecinit3_i215=SIMD.float32x4.withW($vecinit2_i214,$206);
 (HEAPF32[(($_compoundliteral_i211)>>2)]=$vecinit3_i215.x,HEAPF32[((($_compoundliteral_i211)+(4))>>2)]=$vecinit3_i215.y,HEAPF32[((($_compoundliteral_i211)+(8))>>2)]=$vecinit3_i215.z,HEAPF32[((($_compoundliteral_i211)+(12))>>2)]=$vecinit3_i215.w);
 var $207=float32x4(HEAPF32[(($_compoundliteral_i211)>>2)],HEAPF32[((($_compoundliteral_i211)+(4))>>2)],HEAPF32[((($_compoundliteral_i211)+(8))>>2)],HEAPF32[((($_compoundliteral_i211)+(12))>>2)]);
 (HEAPF32[(($orgz)>>2)]=$207.x,HEAPF32[((($orgz)+(4))>>2)]=$207.y,HEAPF32[((($orgz)+(8))>>2)]=$207.z,HEAPF32[((($orgz)+(12))>>2)]=$207.w);
 $w_addr_i204=99999998430674940;
 var $208=$w_addr_i204;
 var $vecinit_i206=SIMD.float32x4.withX(float32x4.splat(0),$208);
 var $209=$w_addr_i204;
 var $vecinit1_i207=SIMD.float32x4.withY($vecinit_i206,$209);
 var $210=$w_addr_i204;
 var $vecinit2_i208=SIMD.float32x4.withZ($vecinit1_i207,$210);
 var $211=$w_addr_i204;
 var $vecinit3_i209=SIMD.float32x4.withW($vecinit2_i208,$211);
 (HEAPF32[(($_compoundliteral_i205)>>2)]=$vecinit3_i209.x,HEAPF32[((($_compoundliteral_i205)+(4))>>2)]=$vecinit3_i209.y,HEAPF32[((($_compoundliteral_i205)+(8))>>2)]=$vecinit3_i209.z,HEAPF32[((($_compoundliteral_i205)+(12))>>2)]=$vecinit3_i209.w);
 var $212=float32x4(HEAPF32[(($_compoundliteral_i205)>>2)],HEAPF32[((($_compoundliteral_i205)+(4))>>2)],HEAPF32[((($_compoundliteral_i205)+(8))>>2)],HEAPF32[((($_compoundliteral_i205)+(12))>>2)]);
 (HEAPF32[(($t)>>2)]=$212.x,HEAPF32[((($t)+(4))>>2)]=$212.y,HEAPF32[((($t)+(8))>>2)]=$212.z,HEAPF32[((($t)+(12))>>2)]=$212.w);
 $w_addr_i198=0;
 var $213=$w_addr_i198;
 var $vecinit_i200=SIMD.float32x4.withX(float32x4.splat(0),$213);
 var $214=$w_addr_i198;
 var $vecinit1_i201=SIMD.float32x4.withY($vecinit_i200,$214);
 var $215=$w_addr_i198;
 var $vecinit2_i202=SIMD.float32x4.withZ($vecinit1_i201,$215);
 var $216=$w_addr_i198;
 var $vecinit3_i203=SIMD.float32x4.withW($vecinit2_i202,$216);
 (HEAPF32[(($_compoundliteral_i199)>>2)]=$vecinit3_i203.x,HEAPF32[((($_compoundliteral_i199)+(4))>>2)]=$vecinit3_i203.y,HEAPF32[((($_compoundliteral_i199)+(8))>>2)]=$vecinit3_i203.z,HEAPF32[((($_compoundliteral_i199)+(12))>>2)]=$vecinit3_i203.w);
 var $217=float32x4(HEAPF32[(($_compoundliteral_i199)>>2)],HEAPF32[((($_compoundliteral_i199)+(4))>>2)],HEAPF32[((($_compoundliteral_i199)+(8))>>2)],HEAPF32[((($_compoundliteral_i199)+(12))>>2)]);
 (HEAPF32[(($hit)>>2)]=$217.x,HEAPF32[((($hit)+(4))>>2)]=$217.y,HEAPF32[((($hit)+(8))>>2)]=$217.z,HEAPF32[((($hit)+(12))>>2)]=$217.w);
 var $218=float32x4(HEAPF32[(($dirx)>>2)],HEAPF32[((($dirx)+(4))>>2)],HEAPF32[((($dirx)+(8))>>2)],HEAPF32[((($dirx)+(12))>>2)]);
 var $219=float32x4(HEAPF32[(($diry)>>2)],HEAPF32[((($diry)+(4))>>2)],HEAPF32[((($diry)+(8))>>2)],HEAPF32[((($diry)+(12))>>2)]);
 var $220=float32x4(HEAPF32[(($dirz)>>2)],HEAPF32[((($dirz)+(4))>>2)],HEAPF32[((($dirz)+(8))>>2)],HEAPF32[((($dirz)+(12))>>2)]);
 var $221=float32x4(HEAPF32[(($orgx)>>2)],HEAPF32[((($orgx)+(4))>>2)],HEAPF32[((($orgx)+(8))>>2)],HEAPF32[((($orgx)+(12))>>2)]);
 var $222=float32x4(HEAPF32[(($orgy)>>2)],HEAPF32[((($orgy)+(4))>>2)],HEAPF32[((($orgy)+(8))>>2)],HEAPF32[((($orgy)+(12))>>2)]);
 var $223=float32x4(HEAPF32[(($orgz)>>2)],HEAPF32[((($orgz)+(4))>>2)],HEAPF32[((($orgz)+(8))>>2)],HEAPF32[((($orgz)+(12))>>2)]);
 _ray_sphere_intersect_simd($t,$hit,$px,$py,$pz,$nx,$ny,$nz,$218,$219,$220,$221,$222,$223,584);
 var $224=float32x4(HEAPF32[(($dirx)>>2)],HEAPF32[((($dirx)+(4))>>2)],HEAPF32[((($dirx)+(8))>>2)],HEAPF32[((($dirx)+(12))>>2)]);
 var $225=float32x4(HEAPF32[(($diry)>>2)],HEAPF32[((($diry)+(4))>>2)],HEAPF32[((($diry)+(8))>>2)],HEAPF32[((($diry)+(12))>>2)]);
 var $226=float32x4(HEAPF32[(($dirz)>>2)],HEAPF32[((($dirz)+(4))>>2)],HEAPF32[((($dirz)+(8))>>2)],HEAPF32[((($dirz)+(12))>>2)]);
 var $227=float32x4(HEAPF32[(($orgx)>>2)],HEAPF32[((($orgx)+(4))>>2)],HEAPF32[((($orgx)+(8))>>2)],HEAPF32[((($orgx)+(12))>>2)]);
 var $228=float32x4(HEAPF32[(($orgy)>>2)],HEAPF32[((($orgy)+(4))>>2)],HEAPF32[((($orgy)+(8))>>2)],HEAPF32[((($orgy)+(12))>>2)]);
 var $229=float32x4(HEAPF32[(($orgz)>>2)],HEAPF32[((($orgz)+(4))>>2)],HEAPF32[((($orgz)+(8))>>2)],HEAPF32[((($orgz)+(12))>>2)]);
 _ray_sphere_intersect_simd($t,$hit,$px,$py,$pz,$nx,$ny,$nz,$224,$225,$226,$227,$228,$229,600);
 var $230=float32x4(HEAPF32[(($dirx)>>2)],HEAPF32[((($dirx)+(4))>>2)],HEAPF32[((($dirx)+(8))>>2)],HEAPF32[((($dirx)+(12))>>2)]);
 var $231=float32x4(HEAPF32[(($diry)>>2)],HEAPF32[((($diry)+(4))>>2)],HEAPF32[((($diry)+(8))>>2)],HEAPF32[((($diry)+(12))>>2)]);
 var $232=float32x4(HEAPF32[(($dirz)>>2)],HEAPF32[((($dirz)+(4))>>2)],HEAPF32[((($dirz)+(8))>>2)],HEAPF32[((($dirz)+(12))>>2)]);
 var $233=float32x4(HEAPF32[(($orgx)>>2)],HEAPF32[((($orgx)+(4))>>2)],HEAPF32[((($orgx)+(8))>>2)],HEAPF32[((($orgx)+(12))>>2)]);
 var $234=float32x4(HEAPF32[(($orgy)>>2)],HEAPF32[((($orgy)+(4))>>2)],HEAPF32[((($orgy)+(8))>>2)],HEAPF32[((($orgy)+(12))>>2)]);
 var $235=float32x4(HEAPF32[(($orgz)>>2)],HEAPF32[((($orgz)+(4))>>2)],HEAPF32[((($orgz)+(8))>>2)],HEAPF32[((($orgz)+(12))>>2)]);
 _ray_sphere_intersect_simd($t,$hit,$px,$py,$pz,$nx,$ny,$nz,$230,$231,$232,$233,$234,$235,616);
 var $236=float32x4(HEAPF32[(($dirx)>>2)],HEAPF32[((($dirx)+(4))>>2)],HEAPF32[((($dirx)+(8))>>2)],HEAPF32[((($dirx)+(12))>>2)]);
 var $237=float32x4(HEAPF32[(($diry)>>2)],HEAPF32[((($diry)+(4))>>2)],HEAPF32[((($diry)+(8))>>2)],HEAPF32[((($diry)+(12))>>2)]);
 var $238=float32x4(HEAPF32[(($dirz)>>2)],HEAPF32[((($dirz)+(4))>>2)],HEAPF32[((($dirz)+(8))>>2)],HEAPF32[((($dirz)+(12))>>2)]);
 var $239=float32x4(HEAPF32[(($orgx)>>2)],HEAPF32[((($orgx)+(4))>>2)],HEAPF32[((($orgx)+(8))>>2)],HEAPF32[((($orgx)+(12))>>2)]);
 var $240=float32x4(HEAPF32[(($orgy)>>2)],HEAPF32[((($orgy)+(4))>>2)],HEAPF32[((($orgy)+(8))>>2)],HEAPF32[((($orgy)+(12))>>2)]);
 var $241=float32x4(HEAPF32[(($orgz)>>2)],HEAPF32[((($orgz)+(4))>>2)],HEAPF32[((($orgz)+(8))>>2)],HEAPF32[((($orgz)+(12))>>2)]);
 _ray_plane_intersect_simd($t,$hit,$px,$py,$pz,$nx,$ny,$nz,$236,$237,$238,$239,$240,$241,1144);
 var $242=float32x4(HEAPF32[(($occlusionx4)>>2)],HEAPF32[((($occlusionx4)+(4))>>2)],HEAPF32[((($occlusionx4)+(8))>>2)],HEAPF32[((($occlusionx4)+(12))>>2)]);
 var $243=float32x4(HEAPF32[(($hit)>>2)],HEAPF32[((($hit)+(4))>>2)],HEAPF32[((($hit)+(8))>>2)],HEAPF32[((($hit)+(12))>>2)]);
 $w_addr_i167=1;
 var $244=$w_addr_i167;
 var $vecinit_i169=SIMD.float32x4.withX(float32x4.splat(0),$244);
 var $245=$w_addr_i167;
 var $vecinit1_i170=SIMD.float32x4.withY($vecinit_i169,$245);
 var $246=$w_addr_i167;
 var $vecinit2_i171=SIMD.float32x4.withZ($vecinit1_i170,$246);
 var $247=$w_addr_i167;
 var $vecinit3_i172=SIMD.float32x4.withW($vecinit2_i171,$247);
 (HEAPF32[(($_compoundliteral_i168)>>2)]=$vecinit3_i172.x,HEAPF32[((($_compoundliteral_i168)+(4))>>2)]=$vecinit3_i172.y,HEAPF32[((($_compoundliteral_i168)+(8))>>2)]=$vecinit3_i172.z,HEAPF32[((($_compoundliteral_i168)+(12))>>2)]=$vecinit3_i172.w);
 var $248=float32x4(HEAPF32[(($_compoundliteral_i168)>>2)],HEAPF32[((($_compoundliteral_i168)+(4))>>2)],HEAPF32[((($_compoundliteral_i168)+(8))>>2)],HEAPF32[((($_compoundliteral_i168)+(12))>>2)]);
 (HEAPF32[(($a_addr_i159)>>2)]=$243.x,HEAPF32[((($a_addr_i159)+(4))>>2)]=$243.y,HEAPF32[((($a_addr_i159)+(8))>>2)]=$243.z,HEAPF32[((($a_addr_i159)+(12))>>2)]=$243.w);
 (HEAPF32[(($b_addr_i160)>>2)]=$248.x,HEAPF32[((($b_addr_i160)+(4))>>2)]=$248.y,HEAPF32[((($b_addr_i160)+(8))>>2)]=$248.z,HEAPF32[((($b_addr_i160)+(12))>>2)]=$248.w);
 var $249=float32x4(HEAPF32[(($a_addr_i159)>>2)],HEAPF32[((($a_addr_i159)+(4))>>2)],HEAPF32[((($a_addr_i159)+(8))>>2)],HEAPF32[((($a_addr_i159)+(12))>>2)]);
 var $250=float32x4(HEAPF32[(($b_addr_i160)>>2)],HEAPF32[((($b_addr_i160)+(4))>>2)],HEAPF32[((($b_addr_i160)+(8))>>2)],HEAPF32[((($b_addr_i160)+(12))>>2)]);
 var $call_i=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($249), SIMD.float32x4.bitsToInt32x4($250)));
 (HEAPF32[(($a_addr_i158)>>2)]=$242.x,HEAPF32[((($a_addr_i158)+(4))>>2)]=$242.y,HEAPF32[((($a_addr_i158)+(8))>>2)]=$242.z,HEAPF32[((($a_addr_i158)+(12))>>2)]=$242.w);
 (HEAPF32[(($b_addr_i)>>2)]=$call_i.x,HEAPF32[((($b_addr_i)+(4))>>2)]=$call_i.y,HEAPF32[((($b_addr_i)+(8))>>2)]=$call_i.z,HEAPF32[((($b_addr_i)+(12))>>2)]=$call_i.w);
 var $251=float32x4(HEAPF32[(($a_addr_i158)>>2)],HEAPF32[((($a_addr_i158)+(4))>>2)],HEAPF32[((($a_addr_i158)+(8))>>2)],HEAPF32[((($a_addr_i158)+(12))>>2)]);
 var $252=float32x4(HEAPF32[(($b_addr_i)>>2)],HEAPF32[((($b_addr_i)+(4))>>2)],HEAPF32[((($b_addr_i)+(8))>>2)],HEAPF32[((($b_addr_i)+(12))>>2)]);
 var $add_i=SIMD.float32x4.add($251,$252);
 (HEAPF32[(($occlusionx4)>>2)]=$add_i.x,HEAPF32[((($occlusionx4)+(4))>>2)]=$add_i.y,HEAPF32[((($occlusionx4)+(8))>>2)]=$add_i.z,HEAPF32[((($occlusionx4)+(12))>>2)]=$add_i.w);
 label=8;break;
 case 8: 
 var $253=$i;
 var $add139=((($253)+(4))|0);
 $i=$add139;
 label=6;break;
 case 9: 
 label=10;break;
 case 10: 
 var $254=$j;
 var $inc=((($254)+(1))|0);
 $j=$inc;
 label=2;break;
 case 11: 
 var $arraydecay142=(($occlusionTmp)|0);
 var $255=float32x4(HEAPF32[(($occlusionx4)>>2)],HEAPF32[((($occlusionx4)+(4))>>2)],HEAPF32[((($occlusionx4)+(8))>>2)],HEAPF32[((($occlusionx4)+(12))>>2)]);
 $p_addr_i=$arraydecay142;
 (HEAPF32[(($a_addr_i)>>2)]=$255.x,HEAPF32[((($a_addr_i)+(4))>>2)]=$255.y,HEAPF32[((($a_addr_i)+(8))>>2)]=$255.z,HEAPF32[((($a_addr_i)+(12))>>2)]=$255.w);
 var $256=float32x4(HEAPF32[(($a_addr_i)>>2)],HEAPF32[((($a_addr_i)+(4))>>2)],HEAPF32[((($a_addr_i)+(8))>>2)],HEAPF32[((($a_addr_i)+(12))>>2)]);
 var $257=$p_addr_i;
 var $258=$257;
 (HEAPF32[(($258)>>2)]=$256.x,HEAPF32[((($258)+(4))>>2)]=$256.y,HEAPF32[((($258)+(8))>>2)]=$256.z,HEAPF32[((($258)+(12))>>2)]=$256.w);
 var $arrayidx143=(($occlusionTmp)|0);
 var $259=HEAPF32[(($arrayidx143)>>2)];
 var $arrayidx144=(($occlusionTmp+4)|0);
 var $260=HEAPF32[(($arrayidx144)>>2)];
 var $add145=($259)+($260);
 var $arrayidx146=(($occlusionTmp+8)|0);
 var $261=HEAPF32[(($arrayidx146)>>2)];
 var $add147=($add145)+($261);
 var $arrayidx148=(($occlusionTmp+12)|0);
 var $262=HEAPF32[(($arrayidx148)>>2)];
 var $add149=($add147)+($262);
 $occlusion=$add149;
 var $263=$ntheta;
 var $264=$nphi;
 var $mul150=(Math_imul($263,$264)|0);
 var $conv151=($mul150|0);
 var $265=$occlusion;
 var $sub=($conv151)-($265);
 var $266=$ntheta;
 var $267=$nphi;
 var $mul152=(Math_imul($266,$267)|0);
 var $conv153=($mul152|0);
 var $div=($sub)/($conv153);
 $occlusion=$div;
 var $268=$occlusion;
 var $x154=(($col)|0);
 HEAPF32[(($x154)>>2)]=$268;
 var $269=$occlusion;
 var $y155=(($col+4)|0);
 HEAPF32[(($y155)>>2)]=$269;
 var $270=$occlusion;
 var $z156=(($col+8)|0);
 HEAPF32[(($z156)>>2)]=$270;
 var $x157=(($col)|0);
 var $271=HEAPF32[(($x157)>>2)];
 STACKTOP=sp;return $271;
  default: assert(0, "bad label: " + label);
 }
}
Module["_ambient_occlusion"] = _ambient_occlusion;
function _ray_sphere_intersect_simd($t,$hit,$px,$py,$pz,$nx,$ny,$nz,$dirx,$diry,$dirz,$orgx,$orgy,$orgz,$sphere){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+2864)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $a_addr_i386=sp;
 var $b_addr_i387=(sp)+(16);
 var $a_addr_i383=(sp)+(32);
 var $b_addr_i384=(sp)+(48);
 var $a_addr_i380=(sp)+(64);
 var $b_addr_i381=(sp)+(80);
 var $a_addr_i377=(sp)+(96);
 var $b_addr_i378=(sp)+(112);
 var $a_addr_i374=(sp)+(128);
 var $b_addr_i375=(sp)+(144);
 var $a_addr_i371=(sp)+(160);
 var $b_addr_i372=(sp)+(176);
 var $a_addr_i368=(sp)+(192);
 var $b_addr_i369=(sp)+(208);
 var $a_addr_i365=(sp)+(224);
 var $b_addr_i366=(sp)+(240);
 var $a_addr_i362=(sp)+(256);
 var $b_addr_i363=(sp)+(272);
 var $a_addr_i359=(sp)+(288);
 var $b_addr_i360=(sp)+(304);
 var $a_addr_i356=(sp)+(320);
 var $b_addr_i357=(sp)+(336);
 var $a_addr_i353=(sp)+(352);
 var $b_addr_i354=(sp)+(368);
 var $a_addr_i350=(sp)+(384);
 var $b_addr_i351=(sp)+(400);
 var $a_addr_i347=(sp)+(416);
 var $b_addr_i348=(sp)+(432);
 var $a_addr_i344=(sp)+(448);
 var $b_addr_i345=(sp)+(464);
 var $a_addr_i341=(sp)+(480);
 var $b_addr_i342=(sp)+(496);
 var $a_addr_i338=(sp)+(512);
 var $b_addr_i339=(sp)+(528);
 var $a_addr_i336=(sp)+(544);
 var $a_addr_i333=(sp)+(560);
 var $b_addr_i334=(sp)+(576);
 var $a_addr_i330=(sp)+(592);
 var $b_addr_i331=(sp)+(608);
 var $a_addr_i327=(sp)+(624);
 var $b_addr_i328=(sp)+(640);
 var $a_addr_i324=(sp)+(656);
 var $b_addr_i325=(sp)+(672);
 var $w_addr_i318;
 var $_compoundliteral_i319=(sp)+(688);
 var $a_addr_i315=(sp)+(704);
 var $b_addr_i316=(sp)+(720);
 var $w_addr_i309;
 var $_compoundliteral_i310=(sp)+(736);
 var $a_addr_i306=(sp)+(752);
 var $b_addr_i307=(sp)+(768);
 var $a_addr_i303=(sp)+(784);
 var $b_addr_i304=(sp)+(800);
 var $a_addr_i301=(sp)+(816);
 var $a_addr_i298=(sp)+(832);
 var $b_addr_i299=(sp)+(848);
 var $a_addr_i296=(sp)+(864);
 var $a_addr_i293=(sp)+(880);
 var $b_addr_i294=(sp)+(896);
 var $w_addr_i287;
 var $_compoundliteral_i288=(sp)+(912);
 var $a_addr_i285=(sp)+(928);
 var $a_addr_i282=(sp)+(944);
 var $b_addr_i283=(sp)+(960);
 var $a_addr_i279=(sp)+(976);
 var $b_addr_i280=(sp)+(992);
 var $w_addr_i273;
 var $_compoundliteral_i274=(sp)+(1008);
 var $a_addr_i270=(sp)+(1024);
 var $b_addr_i271=(sp)+(1040);
 var $w_addr_i264;
 var $_compoundliteral_i265=(sp)+(1056);
 var $a_addr_i261=(sp)+(1072);
 var $b_addr_i262=(sp)+(1088);
 var $a_addr_i258=(sp)+(1104);
 var $b_addr_i259=(sp)+(1120);
 var $a_addr_i255=(sp)+(1136);
 var $b_addr_i256=(sp)+(1152);
 var $a_addr_i252=(sp)+(1168);
 var $b_addr_i253=(sp)+(1184);
 var $a_addr_i249=(sp)+(1200);
 var $b_addr_i250=(sp)+(1216);
 var $a_addr_i246=(sp)+(1232);
 var $b_addr_i247=(sp)+(1248);
 var $a_addr_i243=(sp)+(1264);
 var $b_addr_i244=(sp)+(1280);
 var $w_addr_i237;
 var $_compoundliteral_i238=(sp)+(1296);
 var $a_addr_i234=(sp)+(1312);
 var $b_addr_i235=(sp)+(1328);
 var $w_addr_i228;
 var $_compoundliteral_i229=(sp)+(1344);
 var $a_addr_i225=(sp)+(1360);
 var $b_addr_i226=(sp)+(1376);
 var $a_addr_i222=(sp)+(1392);
 var $b_addr_i223=(sp)+(1408);
 var $a_addr_i219=(sp)+(1424);
 var $b_addr_i220=(sp)+(1440);
 var $a_addr_i216=(sp)+(1456);
 var $b_addr_i217=(sp)+(1472);
 var $a_addr_i213=(sp)+(1488);
 var $b_addr_i214=(sp)+(1504);
 var $a_addr_i210=(sp)+(1520);
 var $b_addr_i211=(sp)+(1536);
 var $a_addr_i207=(sp)+(1552);
 var $b_addr_i208=(sp)+(1568);
 var $a_addr_i204=(sp)+(1584);
 var $b_addr_i205=(sp)+(1600);
 var $a_addr_i201=(sp)+(1616);
 var $b_addr_i202=(sp)+(1632);
 var $a_addr_i198=(sp)+(1648);
 var $b_addr_i199=(sp)+(1664);
 var $a_addr_i195=(sp)+(1680);
 var $b_addr_i196=(sp)+(1696);
 var $a_addr_i193=(sp)+(1712);
 var $w_addr_i187;
 var $_compoundliteral_i188=(sp)+(1728);
 var $a_addr_i184=(sp)+(1744);
 var $b_addr_i185=(sp)+(1760);
 var $a_addr_i182=(sp)+(1776);
 var $a_addr_i179=(sp)+(1792);
 var $b_addr_i180=(sp)+(1808);
 var $a_addr_i176=(sp)+(1824);
 var $b_addr_i177=(sp)+(1840);
 var $w_addr_i170;
 var $_compoundliteral_i171=(sp)+(1856);
 var $a_addr_i167=(sp)+(1872);
 var $b_addr_i168=(sp)+(1888);
 var $a_addr_i164=(sp)+(1904);
 var $b_addr_i165=(sp)+(1920);
 var $a_addr_i161=(sp)+(1936);
 var $b_addr_i162=(sp)+(1952);
 var $a_addr_i159=(sp)+(1968);
 var $b_addr_i160=(sp)+(1984);
 var $a_addr_i156=(sp)+(2000);
 var $b_addr_i157=(sp)+(2016);
 var $a_addr_i153=(sp)+(2032);
 var $b_addr_i154=(sp)+(2048);
 var $a_addr_i150=(sp)+(2064);
 var $b_addr_i151=(sp)+(2080);
 var $a_addr_i147=(sp)+(2096);
 var $b_addr_i148=(sp)+(2112);
 var $a_addr_i144=(sp)+(2128);
 var $b_addr_i145=(sp)+(2144);
 var $a_addr_i141=(sp)+(2160);
 var $b_addr_i142=(sp)+(2176);
 var $a_addr_i139=(sp)+(2192);
 var $b_addr_i140=(sp)+(2208);
 var $a_addr_i136=(sp)+(2224);
 var $b_addr_i137=(sp)+(2240);
 var $a_addr_i133=(sp)+(2256);
 var $b_addr_i134=(sp)+(2272);
 var $a_addr_i130=(sp)+(2288);
 var $b_addr_i131=(sp)+(2304);
 var $w_addr_i124;
 var $_compoundliteral_i125=(sp)+(2320);
 var $a_addr_i121=(sp)+(2336);
 var $b_addr_i122=(sp)+(2352);
 var $a_addr_i119=(sp)+(2368);
 var $b_addr_i120=(sp)+(2384);
 var $a_addr_i116=(sp)+(2400);
 var $b_addr_i117=(sp)+(2416);
 var $a_addr_i113=(sp)+(2432);
 var $b_addr_i114=(sp)+(2448);
 var $w_addr_i107;
 var $_compoundliteral_i108=(sp)+(2464);
 var $a_addr_i104=(sp)+(2480);
 var $b_addr_i105=(sp)+(2496);
 var $a_addr_i102=(sp)+(2512);
 var $b_addr_i103=(sp)+(2528);
 var $a_addr_i=(sp)+(2544);
 var $b_addr_i=(sp)+(2560);
 var $w_addr_i;
 var $_compoundliteral_i=(sp)+(2576);
 var $t_addr;
 var $hit_addr;
 var $px_addr;
 var $py_addr;
 var $pz_addr;
 var $nx_addr;
 var $ny_addr;
 var $nz_addr;
 var $dirx_addr=(sp)+(2592);
 var $diry_addr=(sp)+(2608);
 var $dirz_addr=(sp)+(2624);
 var $orgx_addr=(sp)+(2640);
 var $orgy_addr=(sp)+(2656);
 var $orgz_addr=(sp)+(2672);
 var $sphere_addr;
 var $rsx=(sp)+(2688);
 var $rsy=(sp)+(2704);
 var $rsz=(sp)+(2720);
 var $B=(sp)+(2736);
 var $C=(sp)+(2752);
 var $D=(sp)+(2768);
 var $cond1=(sp)+(2784);
 var $t2=(sp)+(2800);
 var $cond2=(sp)+(2816);
 var $lengths=(sp)+(2832);
 var $cond3=(sp)+(2848);
 $t_addr=$t;
 $hit_addr=$hit;
 $px_addr=$px;
 $py_addr=$py;
 $pz_addr=$pz;
 $nx_addr=$nx;
 $ny_addr=$ny;
 $nz_addr=$nz;
 (HEAPF32[(($dirx_addr)>>2)]=$dirx.x,HEAPF32[((($dirx_addr)+(4))>>2)]=$dirx.y,HEAPF32[((($dirx_addr)+(8))>>2)]=$dirx.z,HEAPF32[((($dirx_addr)+(12))>>2)]=$dirx.w);
 (HEAPF32[(($diry_addr)>>2)]=$diry.x,HEAPF32[((($diry_addr)+(4))>>2)]=$diry.y,HEAPF32[((($diry_addr)+(8))>>2)]=$diry.z,HEAPF32[((($diry_addr)+(12))>>2)]=$diry.w);
 (HEAPF32[(($dirz_addr)>>2)]=$dirz.x,HEAPF32[((($dirz_addr)+(4))>>2)]=$dirz.y,HEAPF32[((($dirz_addr)+(8))>>2)]=$dirz.z,HEAPF32[((($dirz_addr)+(12))>>2)]=$dirz.w);
 (HEAPF32[(($orgx_addr)>>2)]=$orgx.x,HEAPF32[((($orgx_addr)+(4))>>2)]=$orgx.y,HEAPF32[((($orgx_addr)+(8))>>2)]=$orgx.z,HEAPF32[((($orgx_addr)+(12))>>2)]=$orgx.w);
 (HEAPF32[(($orgy_addr)>>2)]=$orgy.x,HEAPF32[((($orgy_addr)+(4))>>2)]=$orgy.y,HEAPF32[((($orgy_addr)+(8))>>2)]=$orgy.z,HEAPF32[((($orgy_addr)+(12))>>2)]=$orgy.w);
 (HEAPF32[(($orgz_addr)>>2)]=$orgz.x,HEAPF32[((($orgz_addr)+(4))>>2)]=$orgz.y,HEAPF32[((($orgz_addr)+(8))>>2)]=$orgz.z,HEAPF32[((($orgz_addr)+(12))>>2)]=$orgz.w);
 $sphere_addr=$sphere;
 var $0=float32x4(HEAPF32[(($orgx_addr)>>2)],HEAPF32[((($orgx_addr)+(4))>>2)],HEAPF32[((($orgx_addr)+(8))>>2)],HEAPF32[((($orgx_addr)+(12))>>2)]);
 var $1=$sphere_addr;
 var $center=(($1)|0);
 var $x=(($center)|0);
 var $2=HEAPF32[(($x)>>2)];
 $w_addr_i=$2;
 var $3=$w_addr_i;
 var $vecinit_i=SIMD.float32x4.withX(float32x4.splat(0),$3);
 var $4=$w_addr_i;
 var $vecinit1_i=SIMD.float32x4.withY($vecinit_i,$4);
 var $5=$w_addr_i;
 var $vecinit2_i=SIMD.float32x4.withZ($vecinit1_i,$5);
 var $6=$w_addr_i;
 var $vecinit3_i=SIMD.float32x4.withW($vecinit2_i,$6);
 (HEAPF32[(($_compoundliteral_i)>>2)]=$vecinit3_i.x,HEAPF32[((($_compoundliteral_i)+(4))>>2)]=$vecinit3_i.y,HEAPF32[((($_compoundliteral_i)+(8))>>2)]=$vecinit3_i.z,HEAPF32[((($_compoundliteral_i)+(12))>>2)]=$vecinit3_i.w);
 var $7=float32x4(HEAPF32[(($_compoundliteral_i)>>2)],HEAPF32[((($_compoundliteral_i)+(4))>>2)],HEAPF32[((($_compoundliteral_i)+(8))>>2)],HEAPF32[((($_compoundliteral_i)+(12))>>2)]);
 (HEAPF32[(($a_addr_i102)>>2)]=$0.x,HEAPF32[((($a_addr_i102)+(4))>>2)]=$0.y,HEAPF32[((($a_addr_i102)+(8))>>2)]=$0.z,HEAPF32[((($a_addr_i102)+(12))>>2)]=$0.w);
 (HEAPF32[(($b_addr_i103)>>2)]=$7.x,HEAPF32[((($b_addr_i103)+(4))>>2)]=$7.y,HEAPF32[((($b_addr_i103)+(8))>>2)]=$7.z,HEAPF32[((($b_addr_i103)+(12))>>2)]=$7.w);
 var $8=float32x4(HEAPF32[(($a_addr_i102)>>2)],HEAPF32[((($a_addr_i102)+(4))>>2)],HEAPF32[((($a_addr_i102)+(8))>>2)],HEAPF32[((($a_addr_i102)+(12))>>2)]);
 var $9=float32x4(HEAPF32[(($b_addr_i103)>>2)],HEAPF32[((($b_addr_i103)+(4))>>2)],HEAPF32[((($b_addr_i103)+(8))>>2)],HEAPF32[((($b_addr_i103)+(12))>>2)]);
 var $sub_i=SIMD.float32x4.sub($8,$9);
 (HEAPF32[(($rsx)>>2)]=$sub_i.x,HEAPF32[((($rsx)+(4))>>2)]=$sub_i.y,HEAPF32[((($rsx)+(8))>>2)]=$sub_i.z,HEAPF32[((($rsx)+(12))>>2)]=$sub_i.w);
 var $10=float32x4(HEAPF32[(($orgy_addr)>>2)],HEAPF32[((($orgy_addr)+(4))>>2)],HEAPF32[((($orgy_addr)+(8))>>2)],HEAPF32[((($orgy_addr)+(12))>>2)]);
 var $11=$sphere_addr;
 var $center2=(($11)|0);
 var $y=(($center2+4)|0);
 var $12=HEAPF32[(($y)>>2)];
 $w_addr_i107=$12;
 var $13=$w_addr_i107;
 var $vecinit_i109=SIMD.float32x4.withX(float32x4.splat(0),$13);
 var $14=$w_addr_i107;
 var $vecinit1_i110=SIMD.float32x4.withY($vecinit_i109,$14);
 var $15=$w_addr_i107;
 var $vecinit2_i111=SIMD.float32x4.withZ($vecinit1_i110,$15);
 var $16=$w_addr_i107;
 var $vecinit3_i112=SIMD.float32x4.withW($vecinit2_i111,$16);
 (HEAPF32[(($_compoundliteral_i108)>>2)]=$vecinit3_i112.x,HEAPF32[((($_compoundliteral_i108)+(4))>>2)]=$vecinit3_i112.y,HEAPF32[((($_compoundliteral_i108)+(8))>>2)]=$vecinit3_i112.z,HEAPF32[((($_compoundliteral_i108)+(12))>>2)]=$vecinit3_i112.w);
 var $17=float32x4(HEAPF32[(($_compoundliteral_i108)>>2)],HEAPF32[((($_compoundliteral_i108)+(4))>>2)],HEAPF32[((($_compoundliteral_i108)+(8))>>2)],HEAPF32[((($_compoundliteral_i108)+(12))>>2)]);
 (HEAPF32[(($a_addr_i116)>>2)]=$10.x,HEAPF32[((($a_addr_i116)+(4))>>2)]=$10.y,HEAPF32[((($a_addr_i116)+(8))>>2)]=$10.z,HEAPF32[((($a_addr_i116)+(12))>>2)]=$10.w);
 (HEAPF32[(($b_addr_i117)>>2)]=$17.x,HEAPF32[((($b_addr_i117)+(4))>>2)]=$17.y,HEAPF32[((($b_addr_i117)+(8))>>2)]=$17.z,HEAPF32[((($b_addr_i117)+(12))>>2)]=$17.w);
 var $18=float32x4(HEAPF32[(($a_addr_i116)>>2)],HEAPF32[((($a_addr_i116)+(4))>>2)],HEAPF32[((($a_addr_i116)+(8))>>2)],HEAPF32[((($a_addr_i116)+(12))>>2)]);
 var $19=float32x4(HEAPF32[(($b_addr_i117)>>2)],HEAPF32[((($b_addr_i117)+(4))>>2)],HEAPF32[((($b_addr_i117)+(8))>>2)],HEAPF32[((($b_addr_i117)+(12))>>2)]);
 var $sub_i118=SIMD.float32x4.sub($18,$19);
 (HEAPF32[(($rsy)>>2)]=$sub_i118.x,HEAPF32[((($rsy)+(4))>>2)]=$sub_i118.y,HEAPF32[((($rsy)+(8))>>2)]=$sub_i118.z,HEAPF32[((($rsy)+(12))>>2)]=$sub_i118.w);
 var $20=float32x4(HEAPF32[(($orgz_addr)>>2)],HEAPF32[((($orgz_addr)+(4))>>2)],HEAPF32[((($orgz_addr)+(8))>>2)],HEAPF32[((($orgz_addr)+(12))>>2)]);
 var $21=$sphere_addr;
 var $center5=(($21)|0);
 var $z=(($center5+8)|0);
 var $22=HEAPF32[(($z)>>2)];
 $w_addr_i124=$22;
 var $23=$w_addr_i124;
 var $vecinit_i126=SIMD.float32x4.withX(float32x4.splat(0),$23);
 var $24=$w_addr_i124;
 var $vecinit1_i127=SIMD.float32x4.withY($vecinit_i126,$24);
 var $25=$w_addr_i124;
 var $vecinit2_i128=SIMD.float32x4.withZ($vecinit1_i127,$25);
 var $26=$w_addr_i124;
 var $vecinit3_i129=SIMD.float32x4.withW($vecinit2_i128,$26);
 (HEAPF32[(($_compoundliteral_i125)>>2)]=$vecinit3_i129.x,HEAPF32[((($_compoundliteral_i125)+(4))>>2)]=$vecinit3_i129.y,HEAPF32[((($_compoundliteral_i125)+(8))>>2)]=$vecinit3_i129.z,HEAPF32[((($_compoundliteral_i125)+(12))>>2)]=$vecinit3_i129.w);
 var $27=float32x4(HEAPF32[(($_compoundliteral_i125)>>2)],HEAPF32[((($_compoundliteral_i125)+(4))>>2)],HEAPF32[((($_compoundliteral_i125)+(8))>>2)],HEAPF32[((($_compoundliteral_i125)+(12))>>2)]);
 (HEAPF32[(($a_addr_i133)>>2)]=$20.x,HEAPF32[((($a_addr_i133)+(4))>>2)]=$20.y,HEAPF32[((($a_addr_i133)+(8))>>2)]=$20.z,HEAPF32[((($a_addr_i133)+(12))>>2)]=$20.w);
 (HEAPF32[(($b_addr_i134)>>2)]=$27.x,HEAPF32[((($b_addr_i134)+(4))>>2)]=$27.y,HEAPF32[((($b_addr_i134)+(8))>>2)]=$27.z,HEAPF32[((($b_addr_i134)+(12))>>2)]=$27.w);
 var $28=float32x4(HEAPF32[(($a_addr_i133)>>2)],HEAPF32[((($a_addr_i133)+(4))>>2)],HEAPF32[((($a_addr_i133)+(8))>>2)],HEAPF32[((($a_addr_i133)+(12))>>2)]);
 var $29=float32x4(HEAPF32[(($b_addr_i134)>>2)],HEAPF32[((($b_addr_i134)+(4))>>2)],HEAPF32[((($b_addr_i134)+(8))>>2)],HEAPF32[((($b_addr_i134)+(12))>>2)]);
 var $sub_i135=SIMD.float32x4.sub($28,$29);
 (HEAPF32[(($rsz)>>2)]=$sub_i135.x,HEAPF32[((($rsz)+(4))>>2)]=$sub_i135.y,HEAPF32[((($rsz)+(8))>>2)]=$sub_i135.z,HEAPF32[((($rsz)+(12))>>2)]=$sub_i135.w);
 var $30=float32x4(HEAPF32[(($rsx)>>2)],HEAPF32[((($rsx)+(4))>>2)],HEAPF32[((($rsx)+(8))>>2)],HEAPF32[((($rsx)+(12))>>2)]);
 var $31=float32x4(HEAPF32[(($dirx_addr)>>2)],HEAPF32[((($dirx_addr)+(4))>>2)],HEAPF32[((($dirx_addr)+(8))>>2)],HEAPF32[((($dirx_addr)+(12))>>2)]);
 (HEAPF32[(($a_addr_i139)>>2)]=$30.x,HEAPF32[((($a_addr_i139)+(4))>>2)]=$30.y,HEAPF32[((($a_addr_i139)+(8))>>2)]=$30.z,HEAPF32[((($a_addr_i139)+(12))>>2)]=$30.w);
 (HEAPF32[(($b_addr_i140)>>2)]=$31.x,HEAPF32[((($b_addr_i140)+(4))>>2)]=$31.y,HEAPF32[((($b_addr_i140)+(8))>>2)]=$31.z,HEAPF32[((($b_addr_i140)+(12))>>2)]=$31.w);
 var $32=float32x4(HEAPF32[(($a_addr_i139)>>2)],HEAPF32[((($a_addr_i139)+(4))>>2)],HEAPF32[((($a_addr_i139)+(8))>>2)],HEAPF32[((($a_addr_i139)+(12))>>2)]);
 var $33=float32x4(HEAPF32[(($b_addr_i140)>>2)],HEAPF32[((($b_addr_i140)+(4))>>2)],HEAPF32[((($b_addr_i140)+(8))>>2)],HEAPF32[((($b_addr_i140)+(12))>>2)]);
 var $mul_i=SIMD.float32x4.mul($32,$33);
 var $34=float32x4(HEAPF32[(($rsy)>>2)],HEAPF32[((($rsy)+(4))>>2)],HEAPF32[((($rsy)+(8))>>2)],HEAPF32[((($rsy)+(12))>>2)]);
 var $35=float32x4(HEAPF32[(($diry_addr)>>2)],HEAPF32[((($diry_addr)+(4))>>2)],HEAPF32[((($diry_addr)+(8))>>2)],HEAPF32[((($diry_addr)+(12))>>2)]);
 (HEAPF32[(($a_addr_i147)>>2)]=$34.x,HEAPF32[((($a_addr_i147)+(4))>>2)]=$34.y,HEAPF32[((($a_addr_i147)+(8))>>2)]=$34.z,HEAPF32[((($a_addr_i147)+(12))>>2)]=$34.w);
 (HEAPF32[(($b_addr_i148)>>2)]=$35.x,HEAPF32[((($b_addr_i148)+(4))>>2)]=$35.y,HEAPF32[((($b_addr_i148)+(8))>>2)]=$35.z,HEAPF32[((($b_addr_i148)+(12))>>2)]=$35.w);
 var $36=float32x4(HEAPF32[(($a_addr_i147)>>2)],HEAPF32[((($a_addr_i147)+(4))>>2)],HEAPF32[((($a_addr_i147)+(8))>>2)],HEAPF32[((($a_addr_i147)+(12))>>2)]);
 var $37=float32x4(HEAPF32[(($b_addr_i148)>>2)],HEAPF32[((($b_addr_i148)+(4))>>2)],HEAPF32[((($b_addr_i148)+(8))>>2)],HEAPF32[((($b_addr_i148)+(12))>>2)]);
 var $mul_i149=SIMD.float32x4.mul($36,$37);
 var $38=float32x4(HEAPF32[(($rsz)>>2)],HEAPF32[((($rsz)+(4))>>2)],HEAPF32[((($rsz)+(8))>>2)],HEAPF32[((($rsz)+(12))>>2)]);
 var $39=float32x4(HEAPF32[(($dirz_addr)>>2)],HEAPF32[((($dirz_addr)+(4))>>2)],HEAPF32[((($dirz_addr)+(8))>>2)],HEAPF32[((($dirz_addr)+(12))>>2)]);
 (HEAPF32[(($a_addr_i153)>>2)]=$38.x,HEAPF32[((($a_addr_i153)+(4))>>2)]=$38.y,HEAPF32[((($a_addr_i153)+(8))>>2)]=$38.z,HEAPF32[((($a_addr_i153)+(12))>>2)]=$38.w);
 (HEAPF32[(($b_addr_i154)>>2)]=$39.x,HEAPF32[((($b_addr_i154)+(4))>>2)]=$39.y,HEAPF32[((($b_addr_i154)+(8))>>2)]=$39.z,HEAPF32[((($b_addr_i154)+(12))>>2)]=$39.w);
 var $40=float32x4(HEAPF32[(($a_addr_i153)>>2)],HEAPF32[((($a_addr_i153)+(4))>>2)],HEAPF32[((($a_addr_i153)+(8))>>2)],HEAPF32[((($a_addr_i153)+(12))>>2)]);
 var $41=float32x4(HEAPF32[(($b_addr_i154)>>2)],HEAPF32[((($b_addr_i154)+(4))>>2)],HEAPF32[((($b_addr_i154)+(8))>>2)],HEAPF32[((($b_addr_i154)+(12))>>2)]);
 var $mul_i155=SIMD.float32x4.mul($40,$41);
 (HEAPF32[(($a_addr_i159)>>2)]=$mul_i149.x,HEAPF32[((($a_addr_i159)+(4))>>2)]=$mul_i149.y,HEAPF32[((($a_addr_i159)+(8))>>2)]=$mul_i149.z,HEAPF32[((($a_addr_i159)+(12))>>2)]=$mul_i149.w);
 (HEAPF32[(($b_addr_i160)>>2)]=$mul_i155.x,HEAPF32[((($b_addr_i160)+(4))>>2)]=$mul_i155.y,HEAPF32[((($b_addr_i160)+(8))>>2)]=$mul_i155.z,HEAPF32[((($b_addr_i160)+(12))>>2)]=$mul_i155.w);
 var $42=float32x4(HEAPF32[(($a_addr_i159)>>2)],HEAPF32[((($a_addr_i159)+(4))>>2)],HEAPF32[((($a_addr_i159)+(8))>>2)],HEAPF32[((($a_addr_i159)+(12))>>2)]);
 var $43=float32x4(HEAPF32[(($b_addr_i160)>>2)],HEAPF32[((($b_addr_i160)+(4))>>2)],HEAPF32[((($b_addr_i160)+(8))>>2)],HEAPF32[((($b_addr_i160)+(12))>>2)]);
 var $add_i=SIMD.float32x4.add($42,$43);
 (HEAPF32[(($a_addr_i167)>>2)]=$mul_i.x,HEAPF32[((($a_addr_i167)+(4))>>2)]=$mul_i.y,HEAPF32[((($a_addr_i167)+(8))>>2)]=$mul_i.z,HEAPF32[((($a_addr_i167)+(12))>>2)]=$mul_i.w);
 (HEAPF32[(($b_addr_i168)>>2)]=$add_i.x,HEAPF32[((($b_addr_i168)+(4))>>2)]=$add_i.y,HEAPF32[((($b_addr_i168)+(8))>>2)]=$add_i.z,HEAPF32[((($b_addr_i168)+(12))>>2)]=$add_i.w);
 var $44=float32x4(HEAPF32[(($a_addr_i167)>>2)],HEAPF32[((($a_addr_i167)+(4))>>2)],HEAPF32[((($a_addr_i167)+(8))>>2)],HEAPF32[((($a_addr_i167)+(12))>>2)]);
 var $45=float32x4(HEAPF32[(($b_addr_i168)>>2)],HEAPF32[((($b_addr_i168)+(4))>>2)],HEAPF32[((($b_addr_i168)+(8))>>2)],HEAPF32[((($b_addr_i168)+(12))>>2)]);
 var $add_i169=SIMD.float32x4.add($44,$45);
 (HEAPF32[(($B)>>2)]=$add_i169.x,HEAPF32[((($B)+(4))>>2)]=$add_i169.y,HEAPF32[((($B)+(8))>>2)]=$add_i169.z,HEAPF32[((($B)+(12))>>2)]=$add_i169.w);
 var $46=float32x4(HEAPF32[(($rsx)>>2)],HEAPF32[((($rsx)+(4))>>2)],HEAPF32[((($rsx)+(8))>>2)],HEAPF32[((($rsx)+(12))>>2)]);
 var $47=float32x4(HEAPF32[(($rsx)>>2)],HEAPF32[((($rsx)+(4))>>2)],HEAPF32[((($rsx)+(8))>>2)],HEAPF32[((($rsx)+(12))>>2)]);
 (HEAPF32[(($a_addr_i179)>>2)]=$46.x,HEAPF32[((($a_addr_i179)+(4))>>2)]=$46.y,HEAPF32[((($a_addr_i179)+(8))>>2)]=$46.z,HEAPF32[((($a_addr_i179)+(12))>>2)]=$46.w);
 (HEAPF32[(($b_addr_i180)>>2)]=$47.x,HEAPF32[((($b_addr_i180)+(4))>>2)]=$47.y,HEAPF32[((($b_addr_i180)+(8))>>2)]=$47.z,HEAPF32[((($b_addr_i180)+(12))>>2)]=$47.w);
 var $48=float32x4(HEAPF32[(($a_addr_i179)>>2)],HEAPF32[((($a_addr_i179)+(4))>>2)],HEAPF32[((($a_addr_i179)+(8))>>2)],HEAPF32[((($a_addr_i179)+(12))>>2)]);
 var $49=float32x4(HEAPF32[(($b_addr_i180)>>2)],HEAPF32[((($b_addr_i180)+(4))>>2)],HEAPF32[((($b_addr_i180)+(8))>>2)],HEAPF32[((($b_addr_i180)+(12))>>2)]);
 var $mul_i181=SIMD.float32x4.mul($48,$49);
 var $50=float32x4(HEAPF32[(($rsy)>>2)],HEAPF32[((($rsy)+(4))>>2)],HEAPF32[((($rsy)+(8))>>2)],HEAPF32[((($rsy)+(12))>>2)]);
 var $51=float32x4(HEAPF32[(($rsy)>>2)],HEAPF32[((($rsy)+(4))>>2)],HEAPF32[((($rsy)+(8))>>2)],HEAPF32[((($rsy)+(12))>>2)]);
 (HEAPF32[(($a_addr_i184)>>2)]=$50.x,HEAPF32[((($a_addr_i184)+(4))>>2)]=$50.y,HEAPF32[((($a_addr_i184)+(8))>>2)]=$50.z,HEAPF32[((($a_addr_i184)+(12))>>2)]=$50.w);
 (HEAPF32[(($b_addr_i185)>>2)]=$51.x,HEAPF32[((($b_addr_i185)+(4))>>2)]=$51.y,HEAPF32[((($b_addr_i185)+(8))>>2)]=$51.z,HEAPF32[((($b_addr_i185)+(12))>>2)]=$51.w);
 var $52=float32x4(HEAPF32[(($a_addr_i184)>>2)],HEAPF32[((($a_addr_i184)+(4))>>2)],HEAPF32[((($a_addr_i184)+(8))>>2)],HEAPF32[((($a_addr_i184)+(12))>>2)]);
 var $53=float32x4(HEAPF32[(($b_addr_i185)>>2)],HEAPF32[((($b_addr_i185)+(4))>>2)],HEAPF32[((($b_addr_i185)+(8))>>2)],HEAPF32[((($b_addr_i185)+(12))>>2)]);
 var $mul_i186=SIMD.float32x4.mul($52,$53);
 var $54=float32x4(HEAPF32[(($rsz)>>2)],HEAPF32[((($rsz)+(4))>>2)],HEAPF32[((($rsz)+(8))>>2)],HEAPF32[((($rsz)+(12))>>2)]);
 var $55=float32x4(HEAPF32[(($rsz)>>2)],HEAPF32[((($rsz)+(4))>>2)],HEAPF32[((($rsz)+(8))>>2)],HEAPF32[((($rsz)+(12))>>2)]);
 (HEAPF32[(($a_addr_i195)>>2)]=$54.x,HEAPF32[((($a_addr_i195)+(4))>>2)]=$54.y,HEAPF32[((($a_addr_i195)+(8))>>2)]=$54.z,HEAPF32[((($a_addr_i195)+(12))>>2)]=$54.w);
 (HEAPF32[(($b_addr_i196)>>2)]=$55.x,HEAPF32[((($b_addr_i196)+(4))>>2)]=$55.y,HEAPF32[((($b_addr_i196)+(8))>>2)]=$55.z,HEAPF32[((($b_addr_i196)+(12))>>2)]=$55.w);
 var $56=float32x4(HEAPF32[(($a_addr_i195)>>2)],HEAPF32[((($a_addr_i195)+(4))>>2)],HEAPF32[((($a_addr_i195)+(8))>>2)],HEAPF32[((($a_addr_i195)+(12))>>2)]);
 var $57=float32x4(HEAPF32[(($b_addr_i196)>>2)],HEAPF32[((($b_addr_i196)+(4))>>2)],HEAPF32[((($b_addr_i196)+(8))>>2)],HEAPF32[((($b_addr_i196)+(12))>>2)]);
 var $mul_i197=SIMD.float32x4.mul($56,$57);
 (HEAPF32[(($a_addr_i216)>>2)]=$mul_i186.x,HEAPF32[((($a_addr_i216)+(4))>>2)]=$mul_i186.y,HEAPF32[((($a_addr_i216)+(8))>>2)]=$mul_i186.z,HEAPF32[((($a_addr_i216)+(12))>>2)]=$mul_i186.w);
 (HEAPF32[(($b_addr_i217)>>2)]=$mul_i197.x,HEAPF32[((($b_addr_i217)+(4))>>2)]=$mul_i197.y,HEAPF32[((($b_addr_i217)+(8))>>2)]=$mul_i197.z,HEAPF32[((($b_addr_i217)+(12))>>2)]=$mul_i197.w);
 var $58=float32x4(HEAPF32[(($a_addr_i216)>>2)],HEAPF32[((($a_addr_i216)+(4))>>2)],HEAPF32[((($a_addr_i216)+(8))>>2)],HEAPF32[((($a_addr_i216)+(12))>>2)]);
 var $59=float32x4(HEAPF32[(($b_addr_i217)>>2)],HEAPF32[((($b_addr_i217)+(4))>>2)],HEAPF32[((($b_addr_i217)+(8))>>2)],HEAPF32[((($b_addr_i217)+(12))>>2)]);
 var $add_i218=SIMD.float32x4.add($58,$59);
 (HEAPF32[(($a_addr_i222)>>2)]=$mul_i181.x,HEAPF32[((($a_addr_i222)+(4))>>2)]=$mul_i181.y,HEAPF32[((($a_addr_i222)+(8))>>2)]=$mul_i181.z,HEAPF32[((($a_addr_i222)+(12))>>2)]=$mul_i181.w);
 (HEAPF32[(($b_addr_i223)>>2)]=$add_i218.x,HEAPF32[((($b_addr_i223)+(4))>>2)]=$add_i218.y,HEAPF32[((($b_addr_i223)+(8))>>2)]=$add_i218.z,HEAPF32[((($b_addr_i223)+(12))>>2)]=$add_i218.w);
 var $60=float32x4(HEAPF32[(($a_addr_i222)>>2)],HEAPF32[((($a_addr_i222)+(4))>>2)],HEAPF32[((($a_addr_i222)+(8))>>2)],HEAPF32[((($a_addr_i222)+(12))>>2)]);
 var $61=float32x4(HEAPF32[(($b_addr_i223)>>2)],HEAPF32[((($b_addr_i223)+(4))>>2)],HEAPF32[((($b_addr_i223)+(8))>>2)],HEAPF32[((($b_addr_i223)+(12))>>2)]);
 var $add_i224=SIMD.float32x4.add($60,$61);
 var $62=$sphere_addr;
 var $radius=(($62+12)|0);
 var $63=HEAPF32[(($radius)>>2)];
 var $64=$sphere_addr;
 var $radius18=(($64+12)|0);
 var $65=HEAPF32[(($radius18)>>2)];
 var $mul=($63)*($65);
 $w_addr_i228=$mul;
 var $66=$w_addr_i228;
 var $vecinit_i230=SIMD.float32x4.withX(float32x4.splat(0),$66);
 var $67=$w_addr_i228;
 var $vecinit1_i231=SIMD.float32x4.withY($vecinit_i230,$67);
 var $68=$w_addr_i228;
 var $vecinit2_i232=SIMD.float32x4.withZ($vecinit1_i231,$68);
 var $69=$w_addr_i228;
 var $vecinit3_i233=SIMD.float32x4.withW($vecinit2_i232,$69);
 (HEAPF32[(($_compoundliteral_i229)>>2)]=$vecinit3_i233.x,HEAPF32[((($_compoundliteral_i229)+(4))>>2)]=$vecinit3_i233.y,HEAPF32[((($_compoundliteral_i229)+(8))>>2)]=$vecinit3_i233.z,HEAPF32[((($_compoundliteral_i229)+(12))>>2)]=$vecinit3_i233.w);
 var $70=float32x4(HEAPF32[(($_compoundliteral_i229)>>2)],HEAPF32[((($_compoundliteral_i229)+(4))>>2)],HEAPF32[((($_compoundliteral_i229)+(8))>>2)],HEAPF32[((($_compoundliteral_i229)+(12))>>2)]);
 (HEAPF32[(($a_addr_i246)>>2)]=$add_i224.x,HEAPF32[((($a_addr_i246)+(4))>>2)]=$add_i224.y,HEAPF32[((($a_addr_i246)+(8))>>2)]=$add_i224.z,HEAPF32[((($a_addr_i246)+(12))>>2)]=$add_i224.w);
 (HEAPF32[(($b_addr_i247)>>2)]=$70.x,HEAPF32[((($b_addr_i247)+(4))>>2)]=$70.y,HEAPF32[((($b_addr_i247)+(8))>>2)]=$70.z,HEAPF32[((($b_addr_i247)+(12))>>2)]=$70.w);
 var $71=float32x4(HEAPF32[(($a_addr_i246)>>2)],HEAPF32[((($a_addr_i246)+(4))>>2)],HEAPF32[((($a_addr_i246)+(8))>>2)],HEAPF32[((($a_addr_i246)+(12))>>2)]);
 var $72=float32x4(HEAPF32[(($b_addr_i247)>>2)],HEAPF32[((($b_addr_i247)+(4))>>2)],HEAPF32[((($b_addr_i247)+(8))>>2)],HEAPF32[((($b_addr_i247)+(12))>>2)]);
 var $sub_i248=SIMD.float32x4.sub($71,$72);
 (HEAPF32[(($C)>>2)]=$sub_i248.x,HEAPF32[((($C)+(4))>>2)]=$sub_i248.y,HEAPF32[((($C)+(8))>>2)]=$sub_i248.z,HEAPF32[((($C)+(12))>>2)]=$sub_i248.w);
 var $73=float32x4(HEAPF32[(($B)>>2)],HEAPF32[((($B)+(4))>>2)],HEAPF32[((($B)+(8))>>2)],HEAPF32[((($B)+(12))>>2)]);
 var $74=float32x4(HEAPF32[(($B)>>2)],HEAPF32[((($B)+(4))>>2)],HEAPF32[((($B)+(8))>>2)],HEAPF32[((($B)+(12))>>2)]);
 (HEAPF32[(($a_addr_i252)>>2)]=$73.x,HEAPF32[((($a_addr_i252)+(4))>>2)]=$73.y,HEAPF32[((($a_addr_i252)+(8))>>2)]=$73.z,HEAPF32[((($a_addr_i252)+(12))>>2)]=$73.w);
 (HEAPF32[(($b_addr_i253)>>2)]=$74.x,HEAPF32[((($b_addr_i253)+(4))>>2)]=$74.y,HEAPF32[((($b_addr_i253)+(8))>>2)]=$74.z,HEAPF32[((($b_addr_i253)+(12))>>2)]=$74.w);
 var $75=float32x4(HEAPF32[(($a_addr_i252)>>2)],HEAPF32[((($a_addr_i252)+(4))>>2)],HEAPF32[((($a_addr_i252)+(8))>>2)],HEAPF32[((($a_addr_i252)+(12))>>2)]);
 var $76=float32x4(HEAPF32[(($b_addr_i253)>>2)],HEAPF32[((($b_addr_i253)+(4))>>2)],HEAPF32[((($b_addr_i253)+(8))>>2)],HEAPF32[((($b_addr_i253)+(12))>>2)]);
 var $mul_i254=SIMD.float32x4.mul($75,$76);
 var $77=float32x4(HEAPF32[(($C)>>2)],HEAPF32[((($C)+(4))>>2)],HEAPF32[((($C)+(8))>>2)],HEAPF32[((($C)+(12))>>2)]);
 (HEAPF32[(($a_addr_i258)>>2)]=$mul_i254.x,HEAPF32[((($a_addr_i258)+(4))>>2)]=$mul_i254.y,HEAPF32[((($a_addr_i258)+(8))>>2)]=$mul_i254.z,HEAPF32[((($a_addr_i258)+(12))>>2)]=$mul_i254.w);
 (HEAPF32[(($b_addr_i259)>>2)]=$77.x,HEAPF32[((($b_addr_i259)+(4))>>2)]=$77.y,HEAPF32[((($b_addr_i259)+(8))>>2)]=$77.z,HEAPF32[((($b_addr_i259)+(12))>>2)]=$77.w);
 var $78=float32x4(HEAPF32[(($a_addr_i258)>>2)],HEAPF32[((($a_addr_i258)+(4))>>2)],HEAPF32[((($a_addr_i258)+(8))>>2)],HEAPF32[((($a_addr_i258)+(12))>>2)]);
 var $79=float32x4(HEAPF32[(($b_addr_i259)>>2)],HEAPF32[((($b_addr_i259)+(4))>>2)],HEAPF32[((($b_addr_i259)+(8))>>2)],HEAPF32[((($b_addr_i259)+(12))>>2)]);
 var $sub_i260=SIMD.float32x4.sub($78,$79);
 (HEAPF32[(($D)>>2)]=$sub_i260.x,HEAPF32[((($D)+(4))>>2)]=$sub_i260.y,HEAPF32[((($D)+(8))>>2)]=$sub_i260.z,HEAPF32[((($D)+(12))>>2)]=$sub_i260.w);
 var $80=float32x4(HEAPF32[(($D)>>2)],HEAPF32[((($D)+(4))>>2)],HEAPF32[((($D)+(8))>>2)],HEAPF32[((($D)+(12))>>2)]);
 $w_addr_i273=0;
 var $81=$w_addr_i273;
 var $vecinit_i275=SIMD.float32x4.withX(float32x4.splat(0),$81);
 var $82=$w_addr_i273;
 var $vecinit1_i276=SIMD.float32x4.withY($vecinit_i275,$82);
 var $83=$w_addr_i273;
 var $vecinit2_i277=SIMD.float32x4.withZ($vecinit1_i276,$83);
 var $84=$w_addr_i273;
 var $vecinit3_i278=SIMD.float32x4.withW($vecinit2_i277,$84);
 (HEAPF32[(($_compoundliteral_i274)>>2)]=$vecinit3_i278.x,HEAPF32[((($_compoundliteral_i274)+(4))>>2)]=$vecinit3_i278.y,HEAPF32[((($_compoundliteral_i274)+(8))>>2)]=$vecinit3_i278.z,HEAPF32[((($_compoundliteral_i274)+(12))>>2)]=$vecinit3_i278.w);
 var $85=float32x4(HEAPF32[(($_compoundliteral_i274)>>2)],HEAPF32[((($_compoundliteral_i274)+(4))>>2)],HEAPF32[((($_compoundliteral_i274)+(8))>>2)],HEAPF32[((($_compoundliteral_i274)+(12))>>2)]);
 (HEAPF32[(($a_addr_i282)>>2)]=$80.x,HEAPF32[((($a_addr_i282)+(4))>>2)]=$80.y,HEAPF32[((($a_addr_i282)+(8))>>2)]=$80.z,HEAPF32[((($a_addr_i282)+(12))>>2)]=$80.w);
 (HEAPF32[(($b_addr_i283)>>2)]=$85.x,HEAPF32[((($b_addr_i283)+(4))>>2)]=$85.y,HEAPF32[((($b_addr_i283)+(8))>>2)]=$85.z,HEAPF32[((($b_addr_i283)+(12))>>2)]=$85.w);
 var $86=float32x4(HEAPF32[(($a_addr_i282)>>2)],HEAPF32[((($a_addr_i282)+(4))>>2)],HEAPF32[((($a_addr_i282)+(8))>>2)],HEAPF32[((($a_addr_i282)+(12))>>2)]);
 var $87=float32x4(HEAPF32[(($b_addr_i283)>>2)],HEAPF32[((($b_addr_i283)+(4))>>2)],HEAPF32[((($b_addr_i283)+(8))>>2)],HEAPF32[((($b_addr_i283)+(12))>>2)]);
 var $call_i284=SIMD.int32x4.bitsToFloat32x4(SIMD.float32x4.greaterThan($86, $87));
 (HEAPF32[(($cond1)>>2)]=$call_i284.x,HEAPF32[((($cond1)+(4))>>2)]=$call_i284.y,HEAPF32[((($cond1)+(8))>>2)]=$call_i284.z,HEAPF32[((($cond1)+(12))>>2)]=$call_i284.w);
 var $88=float32x4(HEAPF32[(($cond1)>>2)],HEAPF32[((($cond1)+(4))>>2)],HEAPF32[((($cond1)+(8))>>2)],HEAPF32[((($cond1)+(12))>>2)]);
 (HEAPF32[(($a_addr_i285)>>2)]=$88.x,HEAPF32[((($a_addr_i285)+(4))>>2)]=$88.y,HEAPF32[((($a_addr_i285)+(8))>>2)]=$88.z,HEAPF32[((($a_addr_i285)+(12))>>2)]=$88.w);
 var $89=float32x4(HEAPF32[(($a_addr_i285)>>2)],HEAPF32[((($a_addr_i285)+(4))>>2)],HEAPF32[((($a_addr_i285)+(8))>>2)],HEAPF32[((($a_addr_i285)+(12))>>2)]);
 var $call_i286=SIMD.float32x4.bitsToInt32x4($89).signMask;
 var $tobool=($call_i286|0)!=0;
 if($tobool){label=2;break;}else{label=5;break;}
 case 2: 
 var $90=float32x4(HEAPF32[(($B)>>2)],HEAPF32[((($B)+(4))>>2)],HEAPF32[((($B)+(8))>>2)],HEAPF32[((($B)+(12))>>2)]);
 $w_addr_i287=-2147483648;
 var $91=$w_addr_i287;
 var $vecinit_i289=SIMD.int32x4.withX(int32x4.splat(0),$91);
 var $92=$w_addr_i287;
 var $vecinit1_i290=SIMD.int32x4.withY($vecinit_i289,$92);
 var $93=$w_addr_i287;
 var $vecinit2_i291=SIMD.int32x4.withZ($vecinit1_i290,$93);
 var $94=$w_addr_i287;
 var $vecinit3_i292=SIMD.int32x4.withW($vecinit2_i291,$94);
 (HEAP32[(($_compoundliteral_i288)>>2)]=$vecinit3_i292.x,HEAP32[((($_compoundliteral_i288)+(4))>>2)]=$vecinit3_i292.y,HEAP32[((($_compoundliteral_i288)+(8))>>2)]=$vecinit3_i292.z,HEAP32[((($_compoundliteral_i288)+(12))>>2)]=$vecinit3_i292.w);
 var $95=int32x4(HEAP32[(($_compoundliteral_i288)>>2)],HEAP32[((($_compoundliteral_i288)+(4))>>2)],HEAP32[((($_compoundliteral_i288)+(8))>>2)],HEAP32[((($_compoundliteral_i288)+(12))>>2)]);
 (HEAP32[(($a_addr_i296)>>2)]=$95.x,HEAP32[((($a_addr_i296)+(4))>>2)]=$95.y,HEAP32[((($a_addr_i296)+(8))>>2)]=$95.z,HEAP32[((($a_addr_i296)+(12))>>2)]=$95.w);
 var $96=int32x4(HEAP32[(($a_addr_i296)>>2)],HEAP32[((($a_addr_i296)+(4))>>2)],HEAP32[((($a_addr_i296)+(8))>>2)],HEAP32[((($a_addr_i296)+(12))>>2)]);
 var $call_i297=SIMD.int32x4.bitsToFloat32x4($96);
 (HEAPF32[(($a_addr_i298)>>2)]=$90.x,HEAPF32[((($a_addr_i298)+(4))>>2)]=$90.y,HEAPF32[((($a_addr_i298)+(8))>>2)]=$90.z,HEAPF32[((($a_addr_i298)+(12))>>2)]=$90.w);
 (HEAPF32[(($b_addr_i299)>>2)]=$call_i297.x,HEAPF32[((($b_addr_i299)+(4))>>2)]=$call_i297.y,HEAPF32[((($b_addr_i299)+(8))>>2)]=$call_i297.z,HEAPF32[((($b_addr_i299)+(12))>>2)]=$call_i297.w);
 var $97=float32x4(HEAPF32[(($a_addr_i298)>>2)],HEAPF32[((($a_addr_i298)+(4))>>2)],HEAPF32[((($a_addr_i298)+(8))>>2)],HEAPF32[((($a_addr_i298)+(12))>>2)]);
 var $98=float32x4(HEAPF32[(($b_addr_i299)>>2)],HEAPF32[((($b_addr_i299)+(4))>>2)],HEAPF32[((($b_addr_i299)+(8))>>2)],HEAPF32[((($b_addr_i299)+(12))>>2)]);
 var $call_i300=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.xor(SIMD.float32x4.bitsToInt32x4($97), SIMD.float32x4.bitsToInt32x4($98)));
 var $99=float32x4(HEAPF32[(($D)>>2)],HEAPF32[((($D)+(4))>>2)],HEAPF32[((($D)+(8))>>2)],HEAPF32[((($D)+(12))>>2)]);
 (HEAPF32[(($a_addr_i301)>>2)]=$99.x,HEAPF32[((($a_addr_i301)+(4))>>2)]=$99.y,HEAPF32[((($a_addr_i301)+(8))>>2)]=$99.z,HEAPF32[((($a_addr_i301)+(12))>>2)]=$99.w);
 var $100=float32x4(HEAPF32[(($a_addr_i301)>>2)],HEAPF32[((($a_addr_i301)+(4))>>2)],HEAPF32[((($a_addr_i301)+(8))>>2)],HEAPF32[((($a_addr_i301)+(12))>>2)]);
 var $call_i302=SIMD.float32x4.sqrt($100);
 (HEAPF32[(($a_addr_i303)>>2)]=$call_i300.x,HEAPF32[((($a_addr_i303)+(4))>>2)]=$call_i300.y,HEAPF32[((($a_addr_i303)+(8))>>2)]=$call_i300.z,HEAPF32[((($a_addr_i303)+(12))>>2)]=$call_i300.w);
 (HEAPF32[(($b_addr_i304)>>2)]=$call_i302.x,HEAPF32[((($b_addr_i304)+(4))>>2)]=$call_i302.y,HEAPF32[((($b_addr_i304)+(8))>>2)]=$call_i302.z,HEAPF32[((($b_addr_i304)+(12))>>2)]=$call_i302.w);
 var $101=float32x4(HEAPF32[(($a_addr_i303)>>2)],HEAPF32[((($a_addr_i303)+(4))>>2)],HEAPF32[((($a_addr_i303)+(8))>>2)],HEAPF32[((($a_addr_i303)+(12))>>2)]);
 var $102=float32x4(HEAPF32[(($b_addr_i304)>>2)],HEAPF32[((($b_addr_i304)+(4))>>2)],HEAPF32[((($b_addr_i304)+(8))>>2)],HEAPF32[((($b_addr_i304)+(12))>>2)]);
 var $sub_i305=SIMD.float32x4.sub($101,$102);
 (HEAPF32[(($t2)>>2)]=$sub_i305.x,HEAPF32[((($t2)+(4))>>2)]=$sub_i305.y,HEAPF32[((($t2)+(8))>>2)]=$sub_i305.z,HEAPF32[((($t2)+(12))>>2)]=$sub_i305.w);
 var $103=float32x4(HEAPF32[(($t2)>>2)],HEAPF32[((($t2)+(4))>>2)],HEAPF32[((($t2)+(8))>>2)],HEAPF32[((($t2)+(12))>>2)]);
 $w_addr_i318=0;
 var $104=$w_addr_i318;
 var $vecinit_i320=SIMD.float32x4.withX(float32x4.splat(0),$104);
 var $105=$w_addr_i318;
 var $vecinit1_i321=SIMD.float32x4.withY($vecinit_i320,$105);
 var $106=$w_addr_i318;
 var $vecinit2_i322=SIMD.float32x4.withZ($vecinit1_i321,$106);
 var $107=$w_addr_i318;
 var $vecinit3_i323=SIMD.float32x4.withW($vecinit2_i322,$107);
 (HEAPF32[(($_compoundliteral_i319)>>2)]=$vecinit3_i323.x,HEAPF32[((($_compoundliteral_i319)+(4))>>2)]=$vecinit3_i323.y,HEAPF32[((($_compoundliteral_i319)+(8))>>2)]=$vecinit3_i323.z,HEAPF32[((($_compoundliteral_i319)+(12))>>2)]=$vecinit3_i323.w);
 var $108=float32x4(HEAPF32[(($_compoundliteral_i319)>>2)],HEAPF32[((($_compoundliteral_i319)+(4))>>2)],HEAPF32[((($_compoundliteral_i319)+(8))>>2)],HEAPF32[((($_compoundliteral_i319)+(12))>>2)]);
 (HEAPF32[(($a_addr_i327)>>2)]=$103.x,HEAPF32[((($a_addr_i327)+(4))>>2)]=$103.y,HEAPF32[((($a_addr_i327)+(8))>>2)]=$103.z,HEAPF32[((($a_addr_i327)+(12))>>2)]=$103.w);
 (HEAPF32[(($b_addr_i328)>>2)]=$108.x,HEAPF32[((($b_addr_i328)+(4))>>2)]=$108.y,HEAPF32[((($b_addr_i328)+(8))>>2)]=$108.z,HEAPF32[((($b_addr_i328)+(12))>>2)]=$108.w);
 var $109=float32x4(HEAPF32[(($a_addr_i327)>>2)],HEAPF32[((($a_addr_i327)+(4))>>2)],HEAPF32[((($a_addr_i327)+(8))>>2)],HEAPF32[((($a_addr_i327)+(12))>>2)]);
 var $110=float32x4(HEAPF32[(($b_addr_i328)>>2)],HEAPF32[((($b_addr_i328)+(4))>>2)],HEAPF32[((($b_addr_i328)+(8))>>2)],HEAPF32[((($b_addr_i328)+(12))>>2)]);
 var $call_i329=SIMD.int32x4.bitsToFloat32x4(SIMD.float32x4.greaterThan($109, $110));
 var $111=float32x4(HEAPF32[(($t2)>>2)],HEAPF32[((($t2)+(4))>>2)],HEAPF32[((($t2)+(8))>>2)],HEAPF32[((($t2)+(12))>>2)]);
 var $112=$t_addr;
 var $113=float32x4(HEAPF32[(($112)>>2)],HEAPF32[((($112)+(4))>>2)],HEAPF32[((($112)+(8))>>2)],HEAPF32[((($112)+(12))>>2)]);
 (HEAPF32[(($a_addr_i330)>>2)]=$111.x,HEAPF32[((($a_addr_i330)+(4))>>2)]=$111.y,HEAPF32[((($a_addr_i330)+(8))>>2)]=$111.z,HEAPF32[((($a_addr_i330)+(12))>>2)]=$111.w);
 (HEAPF32[(($b_addr_i331)>>2)]=$113.x,HEAPF32[((($b_addr_i331)+(4))>>2)]=$113.y,HEAPF32[((($b_addr_i331)+(8))>>2)]=$113.z,HEAPF32[((($b_addr_i331)+(12))>>2)]=$113.w);
 var $114=float32x4(HEAPF32[(($a_addr_i330)>>2)],HEAPF32[((($a_addr_i330)+(4))>>2)],HEAPF32[((($a_addr_i330)+(8))>>2)],HEAPF32[((($a_addr_i330)+(12))>>2)]);
 var $115=float32x4(HEAPF32[(($b_addr_i331)>>2)],HEAPF32[((($b_addr_i331)+(4))>>2)],HEAPF32[((($b_addr_i331)+(8))>>2)],HEAPF32[((($b_addr_i331)+(12))>>2)]);
 var $call_i332=SIMD.int32x4.bitsToFloat32x4(SIMD.float32x4.lessThan($114, $115));
 (HEAPF32[(($a_addr_i333)>>2)]=$call_i329.x,HEAPF32[((($a_addr_i333)+(4))>>2)]=$call_i329.y,HEAPF32[((($a_addr_i333)+(8))>>2)]=$call_i329.z,HEAPF32[((($a_addr_i333)+(12))>>2)]=$call_i329.w);
 (HEAPF32[(($b_addr_i334)>>2)]=$call_i332.x,HEAPF32[((($b_addr_i334)+(4))>>2)]=$call_i332.y,HEAPF32[((($b_addr_i334)+(8))>>2)]=$call_i332.z,HEAPF32[((($b_addr_i334)+(12))>>2)]=$call_i332.w);
 var $116=float32x4(HEAPF32[(($a_addr_i333)>>2)],HEAPF32[((($a_addr_i333)+(4))>>2)],HEAPF32[((($a_addr_i333)+(8))>>2)],HEAPF32[((($a_addr_i333)+(12))>>2)]);
 var $117=float32x4(HEAPF32[(($b_addr_i334)>>2)],HEAPF32[((($b_addr_i334)+(4))>>2)],HEAPF32[((($b_addr_i334)+(8))>>2)],HEAPF32[((($b_addr_i334)+(12))>>2)]);
 var $call_i335=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($116), SIMD.float32x4.bitsToInt32x4($117)));
 (HEAPF32[(($cond2)>>2)]=$call_i335.x,HEAPF32[((($cond2)+(4))>>2)]=$call_i335.y,HEAPF32[((($cond2)+(8))>>2)]=$call_i335.z,HEAPF32[((($cond2)+(12))>>2)]=$call_i335.w);
 var $118=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 (HEAPF32[(($a_addr_i336)>>2)]=$118.x,HEAPF32[((($a_addr_i336)+(4))>>2)]=$118.y,HEAPF32[((($a_addr_i336)+(8))>>2)]=$118.z,HEAPF32[((($a_addr_i336)+(12))>>2)]=$118.w);
 var $119=float32x4(HEAPF32[(($a_addr_i336)>>2)],HEAPF32[((($a_addr_i336)+(4))>>2)],HEAPF32[((($a_addr_i336)+(8))>>2)],HEAPF32[((($a_addr_i336)+(12))>>2)]);
 var $call_i337=SIMD.float32x4.bitsToInt32x4($119).signMask;
 var $tobool36=($call_i337|0)!=0;
 if($tobool36){label=3;break;}else{label=4;break;}
 case 3: 
 var $120=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $121=float32x4(HEAPF32[(($t2)>>2)],HEAPF32[((($t2)+(4))>>2)],HEAPF32[((($t2)+(8))>>2)],HEAPF32[((($t2)+(12))>>2)]);
 (HEAPF32[(($a_addr_i338)>>2)]=$120.x,HEAPF32[((($a_addr_i338)+(4))>>2)]=$120.y,HEAPF32[((($a_addr_i338)+(8))>>2)]=$120.z,HEAPF32[((($a_addr_i338)+(12))>>2)]=$120.w);
 (HEAPF32[(($b_addr_i339)>>2)]=$121.x,HEAPF32[((($b_addr_i339)+(4))>>2)]=$121.y,HEAPF32[((($b_addr_i339)+(8))>>2)]=$121.z,HEAPF32[((($b_addr_i339)+(12))>>2)]=$121.w);
 var $122=float32x4(HEAPF32[(($a_addr_i338)>>2)],HEAPF32[((($a_addr_i338)+(4))>>2)],HEAPF32[((($a_addr_i338)+(8))>>2)],HEAPF32[((($a_addr_i338)+(12))>>2)]);
 var $123=float32x4(HEAPF32[(($b_addr_i339)>>2)],HEAPF32[((($b_addr_i339)+(4))>>2)],HEAPF32[((($b_addr_i339)+(8))>>2)],HEAPF32[((($b_addr_i339)+(12))>>2)]);
 var $call_i340=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($122), SIMD.float32x4.bitsToInt32x4($123)));
 var $124=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $125=$t_addr;
 var $126=float32x4(HEAPF32[(($125)>>2)],HEAPF32[((($125)+(4))>>2)],HEAPF32[((($125)+(8))>>2)],HEAPF32[((($125)+(12))>>2)]);
 (HEAPF32[(($a_addr_i341)>>2)]=$124.x,HEAPF32[((($a_addr_i341)+(4))>>2)]=$124.y,HEAPF32[((($a_addr_i341)+(8))>>2)]=$124.z,HEAPF32[((($a_addr_i341)+(12))>>2)]=$124.w);
 (HEAPF32[(($b_addr_i342)>>2)]=$126.x,HEAPF32[((($b_addr_i342)+(4))>>2)]=$126.y,HEAPF32[((($b_addr_i342)+(8))>>2)]=$126.z,HEAPF32[((($b_addr_i342)+(12))>>2)]=$126.w);
 var $127=float32x4(HEAPF32[(($a_addr_i341)>>2)],HEAPF32[((($a_addr_i341)+(4))>>2)],HEAPF32[((($a_addr_i341)+(8))>>2)],HEAPF32[((($a_addr_i341)+(12))>>2)]);
 var $128=float32x4(HEAPF32[(($b_addr_i342)>>2)],HEAPF32[((($b_addr_i342)+(4))>>2)],HEAPF32[((($b_addr_i342)+(8))>>2)],HEAPF32[((($b_addr_i342)+(12))>>2)]);
 var $call_i343=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($127)), SIMD.float32x4.bitsToInt32x4($128)));
 (HEAPF32[(($a_addr_i344)>>2)]=$call_i340.x,HEAPF32[((($a_addr_i344)+(4))>>2)]=$call_i340.y,HEAPF32[((($a_addr_i344)+(8))>>2)]=$call_i340.z,HEAPF32[((($a_addr_i344)+(12))>>2)]=$call_i340.w);
 (HEAPF32[(($b_addr_i345)>>2)]=$call_i343.x,HEAPF32[((($b_addr_i345)+(4))>>2)]=$call_i343.y,HEAPF32[((($b_addr_i345)+(8))>>2)]=$call_i343.z,HEAPF32[((($b_addr_i345)+(12))>>2)]=$call_i343.w);
 var $129=float32x4(HEAPF32[(($a_addr_i344)>>2)],HEAPF32[((($a_addr_i344)+(4))>>2)],HEAPF32[((($a_addr_i344)+(8))>>2)],HEAPF32[((($a_addr_i344)+(12))>>2)]);
 var $130=float32x4(HEAPF32[(($b_addr_i345)>>2)],HEAPF32[((($b_addr_i345)+(4))>>2)],HEAPF32[((($b_addr_i345)+(8))>>2)],HEAPF32[((($b_addr_i345)+(12))>>2)]);
 var $call_i346=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($129), SIMD.float32x4.bitsToInt32x4($130)));
 var $131=$t_addr;
 (HEAPF32[(($131)>>2)]=$call_i346.x,HEAPF32[((($131)+(4))>>2)]=$call_i346.y,HEAPF32[((($131)+(8))>>2)]=$call_i346.z,HEAPF32[((($131)+(12))>>2)]=$call_i346.w);
 var $132=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $133=$hit_addr;
 var $134=float32x4(HEAPF32[(($133)>>2)],HEAPF32[((($133)+(4))>>2)],HEAPF32[((($133)+(8))>>2)],HEAPF32[((($133)+(12))>>2)]);
 (HEAPF32[(($a_addr_i347)>>2)]=$132.x,HEAPF32[((($a_addr_i347)+(4))>>2)]=$132.y,HEAPF32[((($a_addr_i347)+(8))>>2)]=$132.z,HEAPF32[((($a_addr_i347)+(12))>>2)]=$132.w);
 (HEAPF32[(($b_addr_i348)>>2)]=$134.x,HEAPF32[((($b_addr_i348)+(4))>>2)]=$134.y,HEAPF32[((($b_addr_i348)+(8))>>2)]=$134.z,HEAPF32[((($b_addr_i348)+(12))>>2)]=$134.w);
 var $135=float32x4(HEAPF32[(($a_addr_i347)>>2)],HEAPF32[((($a_addr_i347)+(4))>>2)],HEAPF32[((($a_addr_i347)+(8))>>2)],HEAPF32[((($a_addr_i347)+(12))>>2)]);
 var $136=float32x4(HEAPF32[(($b_addr_i348)>>2)],HEAPF32[((($b_addr_i348)+(4))>>2)],HEAPF32[((($b_addr_i348)+(8))>>2)],HEAPF32[((($b_addr_i348)+(12))>>2)]);
 var $call_i349=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($135), SIMD.float32x4.bitsToInt32x4($136)));
 var $137=$hit_addr;
 (HEAPF32[(($137)>>2)]=$call_i349.x,HEAPF32[((($137)+(4))>>2)]=$call_i349.y,HEAPF32[((($137)+(8))>>2)]=$call_i349.z,HEAPF32[((($137)+(12))>>2)]=$call_i349.w);
 var $138=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $139=float32x4(HEAPF32[(($orgx_addr)>>2)],HEAPF32[((($orgx_addr)+(4))>>2)],HEAPF32[((($orgx_addr)+(8))>>2)],HEAPF32[((($orgx_addr)+(12))>>2)]);
 var $140=float32x4(HEAPF32[(($dirx_addr)>>2)],HEAPF32[((($dirx_addr)+(4))>>2)],HEAPF32[((($dirx_addr)+(8))>>2)],HEAPF32[((($dirx_addr)+(12))>>2)]);
 var $141=$t_addr;
 var $142=float32x4(HEAPF32[(($141)>>2)],HEAPF32[((($141)+(4))>>2)],HEAPF32[((($141)+(8))>>2)],HEAPF32[((($141)+(12))>>2)]);
 (HEAPF32[(($a_addr_i350)>>2)]=$140.x,HEAPF32[((($a_addr_i350)+(4))>>2)]=$140.y,HEAPF32[((($a_addr_i350)+(8))>>2)]=$140.z,HEAPF32[((($a_addr_i350)+(12))>>2)]=$140.w);
 (HEAPF32[(($b_addr_i351)>>2)]=$142.x,HEAPF32[((($b_addr_i351)+(4))>>2)]=$142.y,HEAPF32[((($b_addr_i351)+(8))>>2)]=$142.z,HEAPF32[((($b_addr_i351)+(12))>>2)]=$142.w);
 var $143=float32x4(HEAPF32[(($a_addr_i350)>>2)],HEAPF32[((($a_addr_i350)+(4))>>2)],HEAPF32[((($a_addr_i350)+(8))>>2)],HEAPF32[((($a_addr_i350)+(12))>>2)]);
 var $144=float32x4(HEAPF32[(($b_addr_i351)>>2)],HEAPF32[((($b_addr_i351)+(4))>>2)],HEAPF32[((($b_addr_i351)+(8))>>2)],HEAPF32[((($b_addr_i351)+(12))>>2)]);
 var $mul_i352=SIMD.float32x4.mul($143,$144);
 (HEAPF32[(($a_addr_i356)>>2)]=$139.x,HEAPF32[((($a_addr_i356)+(4))>>2)]=$139.y,HEAPF32[((($a_addr_i356)+(8))>>2)]=$139.z,HEAPF32[((($a_addr_i356)+(12))>>2)]=$139.w);
 (HEAPF32[(($b_addr_i357)>>2)]=$mul_i352.x,HEAPF32[((($b_addr_i357)+(4))>>2)]=$mul_i352.y,HEAPF32[((($b_addr_i357)+(8))>>2)]=$mul_i352.z,HEAPF32[((($b_addr_i357)+(12))>>2)]=$mul_i352.w);
 var $145=float32x4(HEAPF32[(($a_addr_i356)>>2)],HEAPF32[((($a_addr_i356)+(4))>>2)],HEAPF32[((($a_addr_i356)+(8))>>2)],HEAPF32[((($a_addr_i356)+(12))>>2)]);
 var $146=float32x4(HEAPF32[(($b_addr_i357)>>2)],HEAPF32[((($b_addr_i357)+(4))>>2)],HEAPF32[((($b_addr_i357)+(8))>>2)],HEAPF32[((($b_addr_i357)+(12))>>2)]);
 var $add_i358=SIMD.float32x4.add($145,$146);
 (HEAPF32[(($a_addr_i368)>>2)]=$138.x,HEAPF32[((($a_addr_i368)+(4))>>2)]=$138.y,HEAPF32[((($a_addr_i368)+(8))>>2)]=$138.z,HEAPF32[((($a_addr_i368)+(12))>>2)]=$138.w);
 (HEAPF32[(($b_addr_i369)>>2)]=$add_i358.x,HEAPF32[((($b_addr_i369)+(4))>>2)]=$add_i358.y,HEAPF32[((($b_addr_i369)+(8))>>2)]=$add_i358.z,HEAPF32[((($b_addr_i369)+(12))>>2)]=$add_i358.w);
 var $147=float32x4(HEAPF32[(($a_addr_i368)>>2)],HEAPF32[((($a_addr_i368)+(4))>>2)],HEAPF32[((($a_addr_i368)+(8))>>2)],HEAPF32[((($a_addr_i368)+(12))>>2)]);
 var $148=float32x4(HEAPF32[(($b_addr_i369)>>2)],HEAPF32[((($b_addr_i369)+(4))>>2)],HEAPF32[((($b_addr_i369)+(8))>>2)],HEAPF32[((($b_addr_i369)+(12))>>2)]);
 var $call_i370=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($147), SIMD.float32x4.bitsToInt32x4($148)));
 var $149=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $150=$px_addr;
 var $151=float32x4(HEAPF32[(($150)>>2)],HEAPF32[((($150)+(4))>>2)],HEAPF32[((($150)+(8))>>2)],HEAPF32[((($150)+(12))>>2)]);
 (HEAPF32[(($a_addr_i371)>>2)]=$149.x,HEAPF32[((($a_addr_i371)+(4))>>2)]=$149.y,HEAPF32[((($a_addr_i371)+(8))>>2)]=$149.z,HEAPF32[((($a_addr_i371)+(12))>>2)]=$149.w);
 (HEAPF32[(($b_addr_i372)>>2)]=$151.x,HEAPF32[((($b_addr_i372)+(4))>>2)]=$151.y,HEAPF32[((($b_addr_i372)+(8))>>2)]=$151.z,HEAPF32[((($b_addr_i372)+(12))>>2)]=$151.w);
 var $152=float32x4(HEAPF32[(($a_addr_i371)>>2)],HEAPF32[((($a_addr_i371)+(4))>>2)],HEAPF32[((($a_addr_i371)+(8))>>2)],HEAPF32[((($a_addr_i371)+(12))>>2)]);
 var $153=float32x4(HEAPF32[(($b_addr_i372)>>2)],HEAPF32[((($b_addr_i372)+(4))>>2)],HEAPF32[((($b_addr_i372)+(8))>>2)],HEAPF32[((($b_addr_i372)+(12))>>2)]);
 var $call_i373=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($152)), SIMD.float32x4.bitsToInt32x4($153)));
 (HEAPF32[(($a_addr_i374)>>2)]=$call_i370.x,HEAPF32[((($a_addr_i374)+(4))>>2)]=$call_i370.y,HEAPF32[((($a_addr_i374)+(8))>>2)]=$call_i370.z,HEAPF32[((($a_addr_i374)+(12))>>2)]=$call_i370.w);
 (HEAPF32[(($b_addr_i375)>>2)]=$call_i373.x,HEAPF32[((($b_addr_i375)+(4))>>2)]=$call_i373.y,HEAPF32[((($b_addr_i375)+(8))>>2)]=$call_i373.z,HEAPF32[((($b_addr_i375)+(12))>>2)]=$call_i373.w);
 var $154=float32x4(HEAPF32[(($a_addr_i374)>>2)],HEAPF32[((($a_addr_i374)+(4))>>2)],HEAPF32[((($a_addr_i374)+(8))>>2)],HEAPF32[((($a_addr_i374)+(12))>>2)]);
 var $155=float32x4(HEAPF32[(($b_addr_i375)>>2)],HEAPF32[((($b_addr_i375)+(4))>>2)],HEAPF32[((($b_addr_i375)+(8))>>2)],HEAPF32[((($b_addr_i375)+(12))>>2)]);
 var $call_i376=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($154), SIMD.float32x4.bitsToInt32x4($155)));
 var $156=$px_addr;
 (HEAPF32[(($156)>>2)]=$call_i376.x,HEAPF32[((($156)+(4))>>2)]=$call_i376.y,HEAPF32[((($156)+(8))>>2)]=$call_i376.z,HEAPF32[((($156)+(12))>>2)]=$call_i376.w);
 var $157=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $158=float32x4(HEAPF32[(($orgy_addr)>>2)],HEAPF32[((($orgy_addr)+(4))>>2)],HEAPF32[((($orgy_addr)+(8))>>2)],HEAPF32[((($orgy_addr)+(12))>>2)]);
 var $159=float32x4(HEAPF32[(($diry_addr)>>2)],HEAPF32[((($diry_addr)+(4))>>2)],HEAPF32[((($diry_addr)+(8))>>2)],HEAPF32[((($diry_addr)+(12))>>2)]);
 var $160=$t_addr;
 var $161=float32x4(HEAPF32[(($160)>>2)],HEAPF32[((($160)+(4))>>2)],HEAPF32[((($160)+(8))>>2)],HEAPF32[((($160)+(12))>>2)]);
 (HEAPF32[(($a_addr_i377)>>2)]=$159.x,HEAPF32[((($a_addr_i377)+(4))>>2)]=$159.y,HEAPF32[((($a_addr_i377)+(8))>>2)]=$159.z,HEAPF32[((($a_addr_i377)+(12))>>2)]=$159.w);
 (HEAPF32[(($b_addr_i378)>>2)]=$161.x,HEAPF32[((($b_addr_i378)+(4))>>2)]=$161.y,HEAPF32[((($b_addr_i378)+(8))>>2)]=$161.z,HEAPF32[((($b_addr_i378)+(12))>>2)]=$161.w);
 var $162=float32x4(HEAPF32[(($a_addr_i377)>>2)],HEAPF32[((($a_addr_i377)+(4))>>2)],HEAPF32[((($a_addr_i377)+(8))>>2)],HEAPF32[((($a_addr_i377)+(12))>>2)]);
 var $163=float32x4(HEAPF32[(($b_addr_i378)>>2)],HEAPF32[((($b_addr_i378)+(4))>>2)],HEAPF32[((($b_addr_i378)+(8))>>2)],HEAPF32[((($b_addr_i378)+(12))>>2)]);
 var $mul_i379=SIMD.float32x4.mul($162,$163);
 (HEAPF32[(($a_addr_i383)>>2)]=$158.x,HEAPF32[((($a_addr_i383)+(4))>>2)]=$158.y,HEAPF32[((($a_addr_i383)+(8))>>2)]=$158.z,HEAPF32[((($a_addr_i383)+(12))>>2)]=$158.w);
 (HEAPF32[(($b_addr_i384)>>2)]=$mul_i379.x,HEAPF32[((($b_addr_i384)+(4))>>2)]=$mul_i379.y,HEAPF32[((($b_addr_i384)+(8))>>2)]=$mul_i379.z,HEAPF32[((($b_addr_i384)+(12))>>2)]=$mul_i379.w);
 var $164=float32x4(HEAPF32[(($a_addr_i383)>>2)],HEAPF32[((($a_addr_i383)+(4))>>2)],HEAPF32[((($a_addr_i383)+(8))>>2)],HEAPF32[((($a_addr_i383)+(12))>>2)]);
 var $165=float32x4(HEAPF32[(($b_addr_i384)>>2)],HEAPF32[((($b_addr_i384)+(4))>>2)],HEAPF32[((($b_addr_i384)+(8))>>2)],HEAPF32[((($b_addr_i384)+(12))>>2)]);
 var $add_i385=SIMD.float32x4.add($164,$165);
 (HEAPF32[(($a_addr_i386)>>2)]=$157.x,HEAPF32[((($a_addr_i386)+(4))>>2)]=$157.y,HEAPF32[((($a_addr_i386)+(8))>>2)]=$157.z,HEAPF32[((($a_addr_i386)+(12))>>2)]=$157.w);
 (HEAPF32[(($b_addr_i387)>>2)]=$add_i385.x,HEAPF32[((($b_addr_i387)+(4))>>2)]=$add_i385.y,HEAPF32[((($b_addr_i387)+(8))>>2)]=$add_i385.z,HEAPF32[((($b_addr_i387)+(12))>>2)]=$add_i385.w);
 var $166=float32x4(HEAPF32[(($a_addr_i386)>>2)],HEAPF32[((($a_addr_i386)+(4))>>2)],HEAPF32[((($a_addr_i386)+(8))>>2)],HEAPF32[((($a_addr_i386)+(12))>>2)]);
 var $167=float32x4(HEAPF32[(($b_addr_i387)>>2)],HEAPF32[((($b_addr_i387)+(4))>>2)],HEAPF32[((($b_addr_i387)+(8))>>2)],HEAPF32[((($b_addr_i387)+(12))>>2)]);
 var $call_i388=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($166), SIMD.float32x4.bitsToInt32x4($167)));
 var $168=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $169=$py_addr;
 var $170=float32x4(HEAPF32[(($169)>>2)],HEAPF32[((($169)+(4))>>2)],HEAPF32[((($169)+(8))>>2)],HEAPF32[((($169)+(12))>>2)]);
 (HEAPF32[(($a_addr_i380)>>2)]=$168.x,HEAPF32[((($a_addr_i380)+(4))>>2)]=$168.y,HEAPF32[((($a_addr_i380)+(8))>>2)]=$168.z,HEAPF32[((($a_addr_i380)+(12))>>2)]=$168.w);
 (HEAPF32[(($b_addr_i381)>>2)]=$170.x,HEAPF32[((($b_addr_i381)+(4))>>2)]=$170.y,HEAPF32[((($b_addr_i381)+(8))>>2)]=$170.z,HEAPF32[((($b_addr_i381)+(12))>>2)]=$170.w);
 var $171=float32x4(HEAPF32[(($a_addr_i380)>>2)],HEAPF32[((($a_addr_i380)+(4))>>2)],HEAPF32[((($a_addr_i380)+(8))>>2)],HEAPF32[((($a_addr_i380)+(12))>>2)]);
 var $172=float32x4(HEAPF32[(($b_addr_i381)>>2)],HEAPF32[((($b_addr_i381)+(4))>>2)],HEAPF32[((($b_addr_i381)+(8))>>2)],HEAPF32[((($b_addr_i381)+(12))>>2)]);
 var $call_i382=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($171)), SIMD.float32x4.bitsToInt32x4($172)));
 (HEAPF32[(($a_addr_i365)>>2)]=$call_i388.x,HEAPF32[((($a_addr_i365)+(4))>>2)]=$call_i388.y,HEAPF32[((($a_addr_i365)+(8))>>2)]=$call_i388.z,HEAPF32[((($a_addr_i365)+(12))>>2)]=$call_i388.w);
 (HEAPF32[(($b_addr_i366)>>2)]=$call_i382.x,HEAPF32[((($b_addr_i366)+(4))>>2)]=$call_i382.y,HEAPF32[((($b_addr_i366)+(8))>>2)]=$call_i382.z,HEAPF32[((($b_addr_i366)+(12))>>2)]=$call_i382.w);
 var $173=float32x4(HEAPF32[(($a_addr_i365)>>2)],HEAPF32[((($a_addr_i365)+(4))>>2)],HEAPF32[((($a_addr_i365)+(8))>>2)],HEAPF32[((($a_addr_i365)+(12))>>2)]);
 var $174=float32x4(HEAPF32[(($b_addr_i366)>>2)],HEAPF32[((($b_addr_i366)+(4))>>2)],HEAPF32[((($b_addr_i366)+(8))>>2)],HEAPF32[((($b_addr_i366)+(12))>>2)]);
 var $call_i367=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($173), SIMD.float32x4.bitsToInt32x4($174)));
 var $175=$py_addr;
 (HEAPF32[(($175)>>2)]=$call_i367.x,HEAPF32[((($175)+(4))>>2)]=$call_i367.y,HEAPF32[((($175)+(8))>>2)]=$call_i367.z,HEAPF32[((($175)+(12))>>2)]=$call_i367.w);
 var $176=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $177=float32x4(HEAPF32[(($orgz_addr)>>2)],HEAPF32[((($orgz_addr)+(4))>>2)],HEAPF32[((($orgz_addr)+(8))>>2)],HEAPF32[((($orgz_addr)+(12))>>2)]);
 var $178=float32x4(HEAPF32[(($dirz_addr)>>2)],HEAPF32[((($dirz_addr)+(4))>>2)],HEAPF32[((($dirz_addr)+(8))>>2)],HEAPF32[((($dirz_addr)+(12))>>2)]);
 var $179=$t_addr;
 var $180=float32x4(HEAPF32[(($179)>>2)],HEAPF32[((($179)+(4))>>2)],HEAPF32[((($179)+(8))>>2)],HEAPF32[((($179)+(12))>>2)]);
 (HEAPF32[(($a_addr_i362)>>2)]=$178.x,HEAPF32[((($a_addr_i362)+(4))>>2)]=$178.y,HEAPF32[((($a_addr_i362)+(8))>>2)]=$178.z,HEAPF32[((($a_addr_i362)+(12))>>2)]=$178.w);
 (HEAPF32[(($b_addr_i363)>>2)]=$180.x,HEAPF32[((($b_addr_i363)+(4))>>2)]=$180.y,HEAPF32[((($b_addr_i363)+(8))>>2)]=$180.z,HEAPF32[((($b_addr_i363)+(12))>>2)]=$180.w);
 var $181=float32x4(HEAPF32[(($a_addr_i362)>>2)],HEAPF32[((($a_addr_i362)+(4))>>2)],HEAPF32[((($a_addr_i362)+(8))>>2)],HEAPF32[((($a_addr_i362)+(12))>>2)]);
 var $182=float32x4(HEAPF32[(($b_addr_i363)>>2)],HEAPF32[((($b_addr_i363)+(4))>>2)],HEAPF32[((($b_addr_i363)+(8))>>2)],HEAPF32[((($b_addr_i363)+(12))>>2)]);
 var $mul_i364=SIMD.float32x4.mul($181,$182);
 (HEAPF32[(($a_addr_i359)>>2)]=$177.x,HEAPF32[((($a_addr_i359)+(4))>>2)]=$177.y,HEAPF32[((($a_addr_i359)+(8))>>2)]=$177.z,HEAPF32[((($a_addr_i359)+(12))>>2)]=$177.w);
 (HEAPF32[(($b_addr_i360)>>2)]=$mul_i364.x,HEAPF32[((($b_addr_i360)+(4))>>2)]=$mul_i364.y,HEAPF32[((($b_addr_i360)+(8))>>2)]=$mul_i364.z,HEAPF32[((($b_addr_i360)+(12))>>2)]=$mul_i364.w);
 var $183=float32x4(HEAPF32[(($a_addr_i359)>>2)],HEAPF32[((($a_addr_i359)+(4))>>2)],HEAPF32[((($a_addr_i359)+(8))>>2)],HEAPF32[((($a_addr_i359)+(12))>>2)]);
 var $184=float32x4(HEAPF32[(($b_addr_i360)>>2)],HEAPF32[((($b_addr_i360)+(4))>>2)],HEAPF32[((($b_addr_i360)+(8))>>2)],HEAPF32[((($b_addr_i360)+(12))>>2)]);
 var $add_i361=SIMD.float32x4.add($183,$184);
 (HEAPF32[(($a_addr_i353)>>2)]=$176.x,HEAPF32[((($a_addr_i353)+(4))>>2)]=$176.y,HEAPF32[((($a_addr_i353)+(8))>>2)]=$176.z,HEAPF32[((($a_addr_i353)+(12))>>2)]=$176.w);
 (HEAPF32[(($b_addr_i354)>>2)]=$add_i361.x,HEAPF32[((($b_addr_i354)+(4))>>2)]=$add_i361.y,HEAPF32[((($b_addr_i354)+(8))>>2)]=$add_i361.z,HEAPF32[((($b_addr_i354)+(12))>>2)]=$add_i361.w);
 var $185=float32x4(HEAPF32[(($a_addr_i353)>>2)],HEAPF32[((($a_addr_i353)+(4))>>2)],HEAPF32[((($a_addr_i353)+(8))>>2)],HEAPF32[((($a_addr_i353)+(12))>>2)]);
 var $186=float32x4(HEAPF32[(($b_addr_i354)>>2)],HEAPF32[((($b_addr_i354)+(4))>>2)],HEAPF32[((($b_addr_i354)+(8))>>2)],HEAPF32[((($b_addr_i354)+(12))>>2)]);
 var $call_i355=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($185), SIMD.float32x4.bitsToInt32x4($186)));
 var $187=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $188=$pz_addr;
 var $189=float32x4(HEAPF32[(($188)>>2)],HEAPF32[((($188)+(4))>>2)],HEAPF32[((($188)+(8))>>2)],HEAPF32[((($188)+(12))>>2)]);
 (HEAPF32[(($a_addr_i324)>>2)]=$187.x,HEAPF32[((($a_addr_i324)+(4))>>2)]=$187.y,HEAPF32[((($a_addr_i324)+(8))>>2)]=$187.z,HEAPF32[((($a_addr_i324)+(12))>>2)]=$187.w);
 (HEAPF32[(($b_addr_i325)>>2)]=$189.x,HEAPF32[((($b_addr_i325)+(4))>>2)]=$189.y,HEAPF32[((($b_addr_i325)+(8))>>2)]=$189.z,HEAPF32[((($b_addr_i325)+(12))>>2)]=$189.w);
 var $190=float32x4(HEAPF32[(($a_addr_i324)>>2)],HEAPF32[((($a_addr_i324)+(4))>>2)],HEAPF32[((($a_addr_i324)+(8))>>2)],HEAPF32[((($a_addr_i324)+(12))>>2)]);
 var $191=float32x4(HEAPF32[(($b_addr_i325)>>2)],HEAPF32[((($b_addr_i325)+(4))>>2)],HEAPF32[((($b_addr_i325)+(8))>>2)],HEAPF32[((($b_addr_i325)+(12))>>2)]);
 var $call_i326=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($190)), SIMD.float32x4.bitsToInt32x4($191)));
 (HEAPF32[(($a_addr_i315)>>2)]=$call_i355.x,HEAPF32[((($a_addr_i315)+(4))>>2)]=$call_i355.y,HEAPF32[((($a_addr_i315)+(8))>>2)]=$call_i355.z,HEAPF32[((($a_addr_i315)+(12))>>2)]=$call_i355.w);
 (HEAPF32[(($b_addr_i316)>>2)]=$call_i326.x,HEAPF32[((($b_addr_i316)+(4))>>2)]=$call_i326.y,HEAPF32[((($b_addr_i316)+(8))>>2)]=$call_i326.z,HEAPF32[((($b_addr_i316)+(12))>>2)]=$call_i326.w);
 var $192=float32x4(HEAPF32[(($a_addr_i315)>>2)],HEAPF32[((($a_addr_i315)+(4))>>2)],HEAPF32[((($a_addr_i315)+(8))>>2)],HEAPF32[((($a_addr_i315)+(12))>>2)]);
 var $193=float32x4(HEAPF32[(($b_addr_i316)>>2)],HEAPF32[((($b_addr_i316)+(4))>>2)],HEAPF32[((($b_addr_i316)+(8))>>2)],HEAPF32[((($b_addr_i316)+(12))>>2)]);
 var $call_i317=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($192), SIMD.float32x4.bitsToInt32x4($193)));
 var $194=$pz_addr;
 (HEAPF32[(($194)>>2)]=$call_i317.x,HEAPF32[((($194)+(4))>>2)]=$call_i317.y,HEAPF32[((($194)+(8))>>2)]=$call_i317.z,HEAPF32[((($194)+(12))>>2)]=$call_i317.w);
 var $195=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $196=$px_addr;
 var $197=float32x4(HEAPF32[(($196)>>2)],HEAPF32[((($196)+(4))>>2)],HEAPF32[((($196)+(8))>>2)],HEAPF32[((($196)+(12))>>2)]);
 var $198=$sphere_addr;
 var $center57=(($198)|0);
 var $x58=(($center57)|0);
 var $199=HEAPF32[(($x58)>>2)];
 $w_addr_i309=$199;
 var $200=$w_addr_i309;
 var $vecinit_i311=SIMD.float32x4.withX(float32x4.splat(0),$200);
 var $201=$w_addr_i309;
 var $vecinit1_i312=SIMD.float32x4.withY($vecinit_i311,$201);
 var $202=$w_addr_i309;
 var $vecinit2_i313=SIMD.float32x4.withZ($vecinit1_i312,$202);
 var $203=$w_addr_i309;
 var $vecinit3_i314=SIMD.float32x4.withW($vecinit2_i313,$203);
 (HEAPF32[(($_compoundliteral_i310)>>2)]=$vecinit3_i314.x,HEAPF32[((($_compoundliteral_i310)+(4))>>2)]=$vecinit3_i314.y,HEAPF32[((($_compoundliteral_i310)+(8))>>2)]=$vecinit3_i314.z,HEAPF32[((($_compoundliteral_i310)+(12))>>2)]=$vecinit3_i314.w);
 var $204=float32x4(HEAPF32[(($_compoundliteral_i310)>>2)],HEAPF32[((($_compoundliteral_i310)+(4))>>2)],HEAPF32[((($_compoundliteral_i310)+(8))>>2)],HEAPF32[((($_compoundliteral_i310)+(12))>>2)]);
 (HEAPF32[(($a_addr_i306)>>2)]=$197.x,HEAPF32[((($a_addr_i306)+(4))>>2)]=$197.y,HEAPF32[((($a_addr_i306)+(8))>>2)]=$197.z,HEAPF32[((($a_addr_i306)+(12))>>2)]=$197.w);
 (HEAPF32[(($b_addr_i307)>>2)]=$204.x,HEAPF32[((($b_addr_i307)+(4))>>2)]=$204.y,HEAPF32[((($b_addr_i307)+(8))>>2)]=$204.z,HEAPF32[((($b_addr_i307)+(12))>>2)]=$204.w);
 var $205=float32x4(HEAPF32[(($a_addr_i306)>>2)],HEAPF32[((($a_addr_i306)+(4))>>2)],HEAPF32[((($a_addr_i306)+(8))>>2)],HEAPF32[((($a_addr_i306)+(12))>>2)]);
 var $206=float32x4(HEAPF32[(($b_addr_i307)>>2)],HEAPF32[((($b_addr_i307)+(4))>>2)],HEAPF32[((($b_addr_i307)+(8))>>2)],HEAPF32[((($b_addr_i307)+(12))>>2)]);
 var $sub_i308=SIMD.float32x4.sub($205,$206);
 (HEAPF32[(($a_addr_i293)>>2)]=$195.x,HEAPF32[((($a_addr_i293)+(4))>>2)]=$195.y,HEAPF32[((($a_addr_i293)+(8))>>2)]=$195.z,HEAPF32[((($a_addr_i293)+(12))>>2)]=$195.w);
 (HEAPF32[(($b_addr_i294)>>2)]=$sub_i308.x,HEAPF32[((($b_addr_i294)+(4))>>2)]=$sub_i308.y,HEAPF32[((($b_addr_i294)+(8))>>2)]=$sub_i308.z,HEAPF32[((($b_addr_i294)+(12))>>2)]=$sub_i308.w);
 var $207=float32x4(HEAPF32[(($a_addr_i293)>>2)],HEAPF32[((($a_addr_i293)+(4))>>2)],HEAPF32[((($a_addr_i293)+(8))>>2)],HEAPF32[((($a_addr_i293)+(12))>>2)]);
 var $208=float32x4(HEAPF32[(($b_addr_i294)>>2)],HEAPF32[((($b_addr_i294)+(4))>>2)],HEAPF32[((($b_addr_i294)+(8))>>2)],HEAPF32[((($b_addr_i294)+(12))>>2)]);
 var $call_i295=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($207), SIMD.float32x4.bitsToInt32x4($208)));
 var $209=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $210=$nx_addr;
 var $211=float32x4(HEAPF32[(($210)>>2)],HEAPF32[((($210)+(4))>>2)],HEAPF32[((($210)+(8))>>2)],HEAPF32[((($210)+(12))>>2)]);
 (HEAPF32[(($a_addr_i279)>>2)]=$209.x,HEAPF32[((($a_addr_i279)+(4))>>2)]=$209.y,HEAPF32[((($a_addr_i279)+(8))>>2)]=$209.z,HEAPF32[((($a_addr_i279)+(12))>>2)]=$209.w);
 (HEAPF32[(($b_addr_i280)>>2)]=$211.x,HEAPF32[((($b_addr_i280)+(4))>>2)]=$211.y,HEAPF32[((($b_addr_i280)+(8))>>2)]=$211.z,HEAPF32[((($b_addr_i280)+(12))>>2)]=$211.w);
 var $212=float32x4(HEAPF32[(($a_addr_i279)>>2)],HEAPF32[((($a_addr_i279)+(4))>>2)],HEAPF32[((($a_addr_i279)+(8))>>2)],HEAPF32[((($a_addr_i279)+(12))>>2)]);
 var $213=float32x4(HEAPF32[(($b_addr_i280)>>2)],HEAPF32[((($b_addr_i280)+(4))>>2)],HEAPF32[((($b_addr_i280)+(8))>>2)],HEAPF32[((($b_addr_i280)+(12))>>2)]);
 var $call_i281=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($212)), SIMD.float32x4.bitsToInt32x4($213)));
 (HEAPF32[(($a_addr_i270)>>2)]=$call_i295.x,HEAPF32[((($a_addr_i270)+(4))>>2)]=$call_i295.y,HEAPF32[((($a_addr_i270)+(8))>>2)]=$call_i295.z,HEAPF32[((($a_addr_i270)+(12))>>2)]=$call_i295.w);
 (HEAPF32[(($b_addr_i271)>>2)]=$call_i281.x,HEAPF32[((($b_addr_i271)+(4))>>2)]=$call_i281.y,HEAPF32[((($b_addr_i271)+(8))>>2)]=$call_i281.z,HEAPF32[((($b_addr_i271)+(12))>>2)]=$call_i281.w);
 var $214=float32x4(HEAPF32[(($a_addr_i270)>>2)],HEAPF32[((($a_addr_i270)+(4))>>2)],HEAPF32[((($a_addr_i270)+(8))>>2)],HEAPF32[((($a_addr_i270)+(12))>>2)]);
 var $215=float32x4(HEAPF32[(($b_addr_i271)>>2)],HEAPF32[((($b_addr_i271)+(4))>>2)],HEAPF32[((($b_addr_i271)+(8))>>2)],HEAPF32[((($b_addr_i271)+(12))>>2)]);
 var $call_i272=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($214), SIMD.float32x4.bitsToInt32x4($215)));
 var $216=$nx_addr;
 (HEAPF32[(($216)>>2)]=$call_i272.x,HEAPF32[((($216)+(4))>>2)]=$call_i272.y,HEAPF32[((($216)+(8))>>2)]=$call_i272.z,HEAPF32[((($216)+(12))>>2)]=$call_i272.w);
 var $217=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $218=$py_addr;
 var $219=float32x4(HEAPF32[(($218)>>2)],HEAPF32[((($218)+(4))>>2)],HEAPF32[((($218)+(8))>>2)],HEAPF32[((($218)+(12))>>2)]);
 var $220=$sphere_addr;
 var $center64=(($220)|0);
 var $y65=(($center64+4)|0);
 var $221=HEAPF32[(($y65)>>2)];
 $w_addr_i264=$221;
 var $222=$w_addr_i264;
 var $vecinit_i266=SIMD.float32x4.withX(float32x4.splat(0),$222);
 var $223=$w_addr_i264;
 var $vecinit1_i267=SIMD.float32x4.withY($vecinit_i266,$223);
 var $224=$w_addr_i264;
 var $vecinit2_i268=SIMD.float32x4.withZ($vecinit1_i267,$224);
 var $225=$w_addr_i264;
 var $vecinit3_i269=SIMD.float32x4.withW($vecinit2_i268,$225);
 (HEAPF32[(($_compoundliteral_i265)>>2)]=$vecinit3_i269.x,HEAPF32[((($_compoundliteral_i265)+(4))>>2)]=$vecinit3_i269.y,HEAPF32[((($_compoundliteral_i265)+(8))>>2)]=$vecinit3_i269.z,HEAPF32[((($_compoundliteral_i265)+(12))>>2)]=$vecinit3_i269.w);
 var $226=float32x4(HEAPF32[(($_compoundliteral_i265)>>2)],HEAPF32[((($_compoundliteral_i265)+(4))>>2)],HEAPF32[((($_compoundliteral_i265)+(8))>>2)],HEAPF32[((($_compoundliteral_i265)+(12))>>2)]);
 (HEAPF32[(($a_addr_i261)>>2)]=$219.x,HEAPF32[((($a_addr_i261)+(4))>>2)]=$219.y,HEAPF32[((($a_addr_i261)+(8))>>2)]=$219.z,HEAPF32[((($a_addr_i261)+(12))>>2)]=$219.w);
 (HEAPF32[(($b_addr_i262)>>2)]=$226.x,HEAPF32[((($b_addr_i262)+(4))>>2)]=$226.y,HEAPF32[((($b_addr_i262)+(8))>>2)]=$226.z,HEAPF32[((($b_addr_i262)+(12))>>2)]=$226.w);
 var $227=float32x4(HEAPF32[(($a_addr_i261)>>2)],HEAPF32[((($a_addr_i261)+(4))>>2)],HEAPF32[((($a_addr_i261)+(8))>>2)],HEAPF32[((($a_addr_i261)+(12))>>2)]);
 var $228=float32x4(HEAPF32[(($b_addr_i262)>>2)],HEAPF32[((($b_addr_i262)+(4))>>2)],HEAPF32[((($b_addr_i262)+(8))>>2)],HEAPF32[((($b_addr_i262)+(12))>>2)]);
 var $sub_i263=SIMD.float32x4.sub($227,$228);
 (HEAPF32[(($a_addr_i255)>>2)]=$217.x,HEAPF32[((($a_addr_i255)+(4))>>2)]=$217.y,HEAPF32[((($a_addr_i255)+(8))>>2)]=$217.z,HEAPF32[((($a_addr_i255)+(12))>>2)]=$217.w);
 (HEAPF32[(($b_addr_i256)>>2)]=$sub_i263.x,HEAPF32[((($b_addr_i256)+(4))>>2)]=$sub_i263.y,HEAPF32[((($b_addr_i256)+(8))>>2)]=$sub_i263.z,HEAPF32[((($b_addr_i256)+(12))>>2)]=$sub_i263.w);
 var $229=float32x4(HEAPF32[(($a_addr_i255)>>2)],HEAPF32[((($a_addr_i255)+(4))>>2)],HEAPF32[((($a_addr_i255)+(8))>>2)],HEAPF32[((($a_addr_i255)+(12))>>2)]);
 var $230=float32x4(HEAPF32[(($b_addr_i256)>>2)],HEAPF32[((($b_addr_i256)+(4))>>2)],HEAPF32[((($b_addr_i256)+(8))>>2)],HEAPF32[((($b_addr_i256)+(12))>>2)]);
 var $call_i257=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($229), SIMD.float32x4.bitsToInt32x4($230)));
 var $231=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $232=$ny_addr;
 var $233=float32x4(HEAPF32[(($232)>>2)],HEAPF32[((($232)+(4))>>2)],HEAPF32[((($232)+(8))>>2)],HEAPF32[((($232)+(12))>>2)]);
 (HEAPF32[(($a_addr_i249)>>2)]=$231.x,HEAPF32[((($a_addr_i249)+(4))>>2)]=$231.y,HEAPF32[((($a_addr_i249)+(8))>>2)]=$231.z,HEAPF32[((($a_addr_i249)+(12))>>2)]=$231.w);
 (HEAPF32[(($b_addr_i250)>>2)]=$233.x,HEAPF32[((($b_addr_i250)+(4))>>2)]=$233.y,HEAPF32[((($b_addr_i250)+(8))>>2)]=$233.z,HEAPF32[((($b_addr_i250)+(12))>>2)]=$233.w);
 var $234=float32x4(HEAPF32[(($a_addr_i249)>>2)],HEAPF32[((($a_addr_i249)+(4))>>2)],HEAPF32[((($a_addr_i249)+(8))>>2)],HEAPF32[((($a_addr_i249)+(12))>>2)]);
 var $235=float32x4(HEAPF32[(($b_addr_i250)>>2)],HEAPF32[((($b_addr_i250)+(4))>>2)],HEAPF32[((($b_addr_i250)+(8))>>2)],HEAPF32[((($b_addr_i250)+(12))>>2)]);
 var $call_i251=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($234)), SIMD.float32x4.bitsToInt32x4($235)));
 (HEAPF32[(($a_addr_i243)>>2)]=$call_i257.x,HEAPF32[((($a_addr_i243)+(4))>>2)]=$call_i257.y,HEAPF32[((($a_addr_i243)+(8))>>2)]=$call_i257.z,HEAPF32[((($a_addr_i243)+(12))>>2)]=$call_i257.w);
 (HEAPF32[(($b_addr_i244)>>2)]=$call_i251.x,HEAPF32[((($b_addr_i244)+(4))>>2)]=$call_i251.y,HEAPF32[((($b_addr_i244)+(8))>>2)]=$call_i251.z,HEAPF32[((($b_addr_i244)+(12))>>2)]=$call_i251.w);
 var $236=float32x4(HEAPF32[(($a_addr_i243)>>2)],HEAPF32[((($a_addr_i243)+(4))>>2)],HEAPF32[((($a_addr_i243)+(8))>>2)],HEAPF32[((($a_addr_i243)+(12))>>2)]);
 var $237=float32x4(HEAPF32[(($b_addr_i244)>>2)],HEAPF32[((($b_addr_i244)+(4))>>2)],HEAPF32[((($b_addr_i244)+(8))>>2)],HEAPF32[((($b_addr_i244)+(12))>>2)]);
 var $call_i245=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($236), SIMD.float32x4.bitsToInt32x4($237)));
 var $238=$ny_addr;
 (HEAPF32[(($238)>>2)]=$call_i245.x,HEAPF32[((($238)+(4))>>2)]=$call_i245.y,HEAPF32[((($238)+(8))>>2)]=$call_i245.z,HEAPF32[((($238)+(12))>>2)]=$call_i245.w);
 var $239=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $240=$pz_addr;
 var $241=float32x4(HEAPF32[(($240)>>2)],HEAPF32[((($240)+(4))>>2)],HEAPF32[((($240)+(8))>>2)],HEAPF32[((($240)+(12))>>2)]);
 var $242=$sphere_addr;
 var $center71=(($242)|0);
 var $z72=(($center71+8)|0);
 var $243=HEAPF32[(($z72)>>2)];
 $w_addr_i237=$243;
 var $244=$w_addr_i237;
 var $vecinit_i239=SIMD.float32x4.withX(float32x4.splat(0),$244);
 var $245=$w_addr_i237;
 var $vecinit1_i240=SIMD.float32x4.withY($vecinit_i239,$245);
 var $246=$w_addr_i237;
 var $vecinit2_i241=SIMD.float32x4.withZ($vecinit1_i240,$246);
 var $247=$w_addr_i237;
 var $vecinit3_i242=SIMD.float32x4.withW($vecinit2_i241,$247);
 (HEAPF32[(($_compoundliteral_i238)>>2)]=$vecinit3_i242.x,HEAPF32[((($_compoundliteral_i238)+(4))>>2)]=$vecinit3_i242.y,HEAPF32[((($_compoundliteral_i238)+(8))>>2)]=$vecinit3_i242.z,HEAPF32[((($_compoundliteral_i238)+(12))>>2)]=$vecinit3_i242.w);
 var $248=float32x4(HEAPF32[(($_compoundliteral_i238)>>2)],HEAPF32[((($_compoundliteral_i238)+(4))>>2)],HEAPF32[((($_compoundliteral_i238)+(8))>>2)],HEAPF32[((($_compoundliteral_i238)+(12))>>2)]);
 (HEAPF32[(($a_addr_i234)>>2)]=$241.x,HEAPF32[((($a_addr_i234)+(4))>>2)]=$241.y,HEAPF32[((($a_addr_i234)+(8))>>2)]=$241.z,HEAPF32[((($a_addr_i234)+(12))>>2)]=$241.w);
 (HEAPF32[(($b_addr_i235)>>2)]=$248.x,HEAPF32[((($b_addr_i235)+(4))>>2)]=$248.y,HEAPF32[((($b_addr_i235)+(8))>>2)]=$248.z,HEAPF32[((($b_addr_i235)+(12))>>2)]=$248.w);
 var $249=float32x4(HEAPF32[(($a_addr_i234)>>2)],HEAPF32[((($a_addr_i234)+(4))>>2)],HEAPF32[((($a_addr_i234)+(8))>>2)],HEAPF32[((($a_addr_i234)+(12))>>2)]);
 var $250=float32x4(HEAPF32[(($b_addr_i235)>>2)],HEAPF32[((($b_addr_i235)+(4))>>2)],HEAPF32[((($b_addr_i235)+(8))>>2)],HEAPF32[((($b_addr_i235)+(12))>>2)]);
 var $sub_i236=SIMD.float32x4.sub($249,$250);
 (HEAPF32[(($a_addr_i225)>>2)]=$239.x,HEAPF32[((($a_addr_i225)+(4))>>2)]=$239.y,HEAPF32[((($a_addr_i225)+(8))>>2)]=$239.z,HEAPF32[((($a_addr_i225)+(12))>>2)]=$239.w);
 (HEAPF32[(($b_addr_i226)>>2)]=$sub_i236.x,HEAPF32[((($b_addr_i226)+(4))>>2)]=$sub_i236.y,HEAPF32[((($b_addr_i226)+(8))>>2)]=$sub_i236.z,HEAPF32[((($b_addr_i226)+(12))>>2)]=$sub_i236.w);
 var $251=float32x4(HEAPF32[(($a_addr_i225)>>2)],HEAPF32[((($a_addr_i225)+(4))>>2)],HEAPF32[((($a_addr_i225)+(8))>>2)],HEAPF32[((($a_addr_i225)+(12))>>2)]);
 var $252=float32x4(HEAPF32[(($b_addr_i226)>>2)],HEAPF32[((($b_addr_i226)+(4))>>2)],HEAPF32[((($b_addr_i226)+(8))>>2)],HEAPF32[((($b_addr_i226)+(12))>>2)]);
 var $call_i227=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($251), SIMD.float32x4.bitsToInt32x4($252)));
 var $253=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $254=$nz_addr;
 var $255=float32x4(HEAPF32[(($254)>>2)],HEAPF32[((($254)+(4))>>2)],HEAPF32[((($254)+(8))>>2)],HEAPF32[((($254)+(12))>>2)]);
 (HEAPF32[(($a_addr_i219)>>2)]=$253.x,HEAPF32[((($a_addr_i219)+(4))>>2)]=$253.y,HEAPF32[((($a_addr_i219)+(8))>>2)]=$253.z,HEAPF32[((($a_addr_i219)+(12))>>2)]=$253.w);
 (HEAPF32[(($b_addr_i220)>>2)]=$255.x,HEAPF32[((($b_addr_i220)+(4))>>2)]=$255.y,HEAPF32[((($b_addr_i220)+(8))>>2)]=$255.z,HEAPF32[((($b_addr_i220)+(12))>>2)]=$255.w);
 var $256=float32x4(HEAPF32[(($a_addr_i219)>>2)],HEAPF32[((($a_addr_i219)+(4))>>2)],HEAPF32[((($a_addr_i219)+(8))>>2)],HEAPF32[((($a_addr_i219)+(12))>>2)]);
 var $257=float32x4(HEAPF32[(($b_addr_i220)>>2)],HEAPF32[((($b_addr_i220)+(4))>>2)],HEAPF32[((($b_addr_i220)+(8))>>2)],HEAPF32[((($b_addr_i220)+(12))>>2)]);
 var $call_i221=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($256)), SIMD.float32x4.bitsToInt32x4($257)));
 (HEAPF32[(($a_addr_i213)>>2)]=$call_i227.x,HEAPF32[((($a_addr_i213)+(4))>>2)]=$call_i227.y,HEAPF32[((($a_addr_i213)+(8))>>2)]=$call_i227.z,HEAPF32[((($a_addr_i213)+(12))>>2)]=$call_i227.w);
 (HEAPF32[(($b_addr_i214)>>2)]=$call_i221.x,HEAPF32[((($b_addr_i214)+(4))>>2)]=$call_i221.y,HEAPF32[((($b_addr_i214)+(8))>>2)]=$call_i221.z,HEAPF32[((($b_addr_i214)+(12))>>2)]=$call_i221.w);
 var $258=float32x4(HEAPF32[(($a_addr_i213)>>2)],HEAPF32[((($a_addr_i213)+(4))>>2)],HEAPF32[((($a_addr_i213)+(8))>>2)],HEAPF32[((($a_addr_i213)+(12))>>2)]);
 var $259=float32x4(HEAPF32[(($b_addr_i214)>>2)],HEAPF32[((($b_addr_i214)+(4))>>2)],HEAPF32[((($b_addr_i214)+(8))>>2)],HEAPF32[((($b_addr_i214)+(12))>>2)]);
 var $call_i215=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($258), SIMD.float32x4.bitsToInt32x4($259)));
 var $260=$nz_addr;
 (HEAPF32[(($260)>>2)]=$call_i215.x,HEAPF32[((($260)+(4))>>2)]=$call_i215.y,HEAPF32[((($260)+(8))>>2)]=$call_i215.z,HEAPF32[((($260)+(12))>>2)]=$call_i215.w);
 var $261=$nx_addr;
 var $262=float32x4(HEAPF32[(($261)>>2)],HEAPF32[((($261)+(4))>>2)],HEAPF32[((($261)+(8))>>2)],HEAPF32[((($261)+(12))>>2)]);
 var $263=$nx_addr;
 var $264=float32x4(HEAPF32[(($263)>>2)],HEAPF32[((($263)+(4))>>2)],HEAPF32[((($263)+(8))>>2)],HEAPF32[((($263)+(12))>>2)]);
 (HEAPF32[(($a_addr_i210)>>2)]=$262.x,HEAPF32[((($a_addr_i210)+(4))>>2)]=$262.y,HEAPF32[((($a_addr_i210)+(8))>>2)]=$262.z,HEAPF32[((($a_addr_i210)+(12))>>2)]=$262.w);
 (HEAPF32[(($b_addr_i211)>>2)]=$264.x,HEAPF32[((($b_addr_i211)+(4))>>2)]=$264.y,HEAPF32[((($b_addr_i211)+(8))>>2)]=$264.z,HEAPF32[((($b_addr_i211)+(12))>>2)]=$264.w);
 var $265=float32x4(HEAPF32[(($a_addr_i210)>>2)],HEAPF32[((($a_addr_i210)+(4))>>2)],HEAPF32[((($a_addr_i210)+(8))>>2)],HEAPF32[((($a_addr_i210)+(12))>>2)]);
 var $266=float32x4(HEAPF32[(($b_addr_i211)>>2)],HEAPF32[((($b_addr_i211)+(4))>>2)],HEAPF32[((($b_addr_i211)+(8))>>2)],HEAPF32[((($b_addr_i211)+(12))>>2)]);
 var $mul_i212=SIMD.float32x4.mul($265,$266);
 var $267=$ny_addr;
 var $268=float32x4(HEAPF32[(($267)>>2)],HEAPF32[((($267)+(4))>>2)],HEAPF32[((($267)+(8))>>2)],HEAPF32[((($267)+(12))>>2)]);
 var $269=$ny_addr;
 var $270=float32x4(HEAPF32[(($269)>>2)],HEAPF32[((($269)+(4))>>2)],HEAPF32[((($269)+(8))>>2)],HEAPF32[((($269)+(12))>>2)]);
 (HEAPF32[(($a_addr_i207)>>2)]=$268.x,HEAPF32[((($a_addr_i207)+(4))>>2)]=$268.y,HEAPF32[((($a_addr_i207)+(8))>>2)]=$268.z,HEAPF32[((($a_addr_i207)+(12))>>2)]=$268.w);
 (HEAPF32[(($b_addr_i208)>>2)]=$270.x,HEAPF32[((($b_addr_i208)+(4))>>2)]=$270.y,HEAPF32[((($b_addr_i208)+(8))>>2)]=$270.z,HEAPF32[((($b_addr_i208)+(12))>>2)]=$270.w);
 var $271=float32x4(HEAPF32[(($a_addr_i207)>>2)],HEAPF32[((($a_addr_i207)+(4))>>2)],HEAPF32[((($a_addr_i207)+(8))>>2)],HEAPF32[((($a_addr_i207)+(12))>>2)]);
 var $272=float32x4(HEAPF32[(($b_addr_i208)>>2)],HEAPF32[((($b_addr_i208)+(4))>>2)],HEAPF32[((($b_addr_i208)+(8))>>2)],HEAPF32[((($b_addr_i208)+(12))>>2)]);
 var $mul_i209=SIMD.float32x4.mul($271,$272);
 var $273=$nz_addr;
 var $274=float32x4(HEAPF32[(($273)>>2)],HEAPF32[((($273)+(4))>>2)],HEAPF32[((($273)+(8))>>2)],HEAPF32[((($273)+(12))>>2)]);
 var $275=$nz_addr;
 var $276=float32x4(HEAPF32[(($275)>>2)],HEAPF32[((($275)+(4))>>2)],HEAPF32[((($275)+(8))>>2)],HEAPF32[((($275)+(12))>>2)]);
 (HEAPF32[(($a_addr_i204)>>2)]=$274.x,HEAPF32[((($a_addr_i204)+(4))>>2)]=$274.y,HEAPF32[((($a_addr_i204)+(8))>>2)]=$274.z,HEAPF32[((($a_addr_i204)+(12))>>2)]=$274.w);
 (HEAPF32[(($b_addr_i205)>>2)]=$276.x,HEAPF32[((($b_addr_i205)+(4))>>2)]=$276.y,HEAPF32[((($b_addr_i205)+(8))>>2)]=$276.z,HEAPF32[((($b_addr_i205)+(12))>>2)]=$276.w);
 var $277=float32x4(HEAPF32[(($a_addr_i204)>>2)],HEAPF32[((($a_addr_i204)+(4))>>2)],HEAPF32[((($a_addr_i204)+(8))>>2)],HEAPF32[((($a_addr_i204)+(12))>>2)]);
 var $278=float32x4(HEAPF32[(($b_addr_i205)>>2)],HEAPF32[((($b_addr_i205)+(4))>>2)],HEAPF32[((($b_addr_i205)+(8))>>2)],HEAPF32[((($b_addr_i205)+(12))>>2)]);
 var $mul_i206=SIMD.float32x4.mul($277,$278);
 (HEAPF32[(($a_addr_i201)>>2)]=$mul_i209.x,HEAPF32[((($a_addr_i201)+(4))>>2)]=$mul_i209.y,HEAPF32[((($a_addr_i201)+(8))>>2)]=$mul_i209.z,HEAPF32[((($a_addr_i201)+(12))>>2)]=$mul_i209.w);
 (HEAPF32[(($b_addr_i202)>>2)]=$mul_i206.x,HEAPF32[((($b_addr_i202)+(4))>>2)]=$mul_i206.y,HEAPF32[((($b_addr_i202)+(8))>>2)]=$mul_i206.z,HEAPF32[((($b_addr_i202)+(12))>>2)]=$mul_i206.w);
 var $279=float32x4(HEAPF32[(($a_addr_i201)>>2)],HEAPF32[((($a_addr_i201)+(4))>>2)],HEAPF32[((($a_addr_i201)+(8))>>2)],HEAPF32[((($a_addr_i201)+(12))>>2)]);
 var $280=float32x4(HEAPF32[(($b_addr_i202)>>2)],HEAPF32[((($b_addr_i202)+(4))>>2)],HEAPF32[((($b_addr_i202)+(8))>>2)],HEAPF32[((($b_addr_i202)+(12))>>2)]);
 var $add_i203=SIMD.float32x4.add($279,$280);
 (HEAPF32[(($a_addr_i198)>>2)]=$mul_i212.x,HEAPF32[((($a_addr_i198)+(4))>>2)]=$mul_i212.y,HEAPF32[((($a_addr_i198)+(8))>>2)]=$mul_i212.z,HEAPF32[((($a_addr_i198)+(12))>>2)]=$mul_i212.w);
 (HEAPF32[(($b_addr_i199)>>2)]=$add_i203.x,HEAPF32[((($b_addr_i199)+(4))>>2)]=$add_i203.y,HEAPF32[((($b_addr_i199)+(8))>>2)]=$add_i203.z,HEAPF32[((($b_addr_i199)+(12))>>2)]=$add_i203.w);
 var $281=float32x4(HEAPF32[(($a_addr_i198)>>2)],HEAPF32[((($a_addr_i198)+(4))>>2)],HEAPF32[((($a_addr_i198)+(8))>>2)],HEAPF32[((($a_addr_i198)+(12))>>2)]);
 var $282=float32x4(HEAPF32[(($b_addr_i199)>>2)],HEAPF32[((($b_addr_i199)+(4))>>2)],HEAPF32[((($b_addr_i199)+(8))>>2)],HEAPF32[((($b_addr_i199)+(12))>>2)]);
 var $add_i200=SIMD.float32x4.add($281,$282);
 (HEAPF32[(($a_addr_i193)>>2)]=$add_i200.x,HEAPF32[((($a_addr_i193)+(4))>>2)]=$add_i200.y,HEAPF32[((($a_addr_i193)+(8))>>2)]=$add_i200.z,HEAPF32[((($a_addr_i193)+(12))>>2)]=$add_i200.w);
 var $283=float32x4(HEAPF32[(($a_addr_i193)>>2)],HEAPF32[((($a_addr_i193)+(4))>>2)],HEAPF32[((($a_addr_i193)+(8))>>2)],HEAPF32[((($a_addr_i193)+(12))>>2)]);
 var $call_i194=SIMD.float32x4.sqrt($283);
 (HEAPF32[(($lengths)>>2)]=$call_i194.x,HEAPF32[((($lengths)+(4))>>2)]=$call_i194.y,HEAPF32[((($lengths)+(8))>>2)]=$call_i194.z,HEAPF32[((($lengths)+(12))>>2)]=$call_i194.w);
 $w_addr_i187=-2147483648;
 var $284=$w_addr_i187;
 var $vecinit_i189=SIMD.int32x4.withX(int32x4.splat(0),$284);
 var $285=$w_addr_i187;
 var $vecinit1_i190=SIMD.int32x4.withY($vecinit_i189,$285);
 var $286=$w_addr_i187;
 var $vecinit2_i191=SIMD.int32x4.withZ($vecinit1_i190,$286);
 var $287=$w_addr_i187;
 var $vecinit3_i192=SIMD.int32x4.withW($vecinit2_i191,$287);
 (HEAP32[(($_compoundliteral_i188)>>2)]=$vecinit3_i192.x,HEAP32[((($_compoundliteral_i188)+(4))>>2)]=$vecinit3_i192.y,HEAP32[((($_compoundliteral_i188)+(8))>>2)]=$vecinit3_i192.z,HEAP32[((($_compoundliteral_i188)+(12))>>2)]=$vecinit3_i192.w);
 var $288=int32x4(HEAP32[(($_compoundliteral_i188)>>2)],HEAP32[((($_compoundliteral_i188)+(4))>>2)],HEAP32[((($_compoundliteral_i188)+(8))>>2)],HEAP32[((($_compoundliteral_i188)+(12))>>2)]);
 (HEAP32[(($a_addr_i182)>>2)]=$288.x,HEAP32[((($a_addr_i182)+(4))>>2)]=$288.y,HEAP32[((($a_addr_i182)+(8))>>2)]=$288.z,HEAP32[((($a_addr_i182)+(12))>>2)]=$288.w);
 var $289=int32x4(HEAP32[(($a_addr_i182)>>2)],HEAP32[((($a_addr_i182)+(4))>>2)],HEAP32[((($a_addr_i182)+(8))>>2)],HEAP32[((($a_addr_i182)+(12))>>2)]);
 var $call_i183=SIMD.int32x4.bitsToFloat32x4($289);
 var $290=float32x4(HEAPF32[(($lengths)>>2)],HEAPF32[((($lengths)+(4))>>2)],HEAPF32[((($lengths)+(8))>>2)],HEAPF32[((($lengths)+(12))>>2)]);
 (HEAPF32[(($a_addr_i176)>>2)]=$call_i183.x,HEAPF32[((($a_addr_i176)+(4))>>2)]=$call_i183.y,HEAPF32[((($a_addr_i176)+(8))>>2)]=$call_i183.z,HEAPF32[((($a_addr_i176)+(12))>>2)]=$call_i183.w);
 (HEAPF32[(($b_addr_i177)>>2)]=$290.x,HEAPF32[((($b_addr_i177)+(4))>>2)]=$290.y,HEAPF32[((($b_addr_i177)+(8))>>2)]=$290.z,HEAPF32[((($b_addr_i177)+(12))>>2)]=$290.w);
 var $291=float32x4(HEAPF32[(($a_addr_i176)>>2)],HEAPF32[((($a_addr_i176)+(4))>>2)],HEAPF32[((($a_addr_i176)+(8))>>2)],HEAPF32[((($a_addr_i176)+(12))>>2)]);
 var $292=float32x4(HEAPF32[(($b_addr_i177)>>2)],HEAPF32[((($b_addr_i177)+(4))>>2)],HEAPF32[((($b_addr_i177)+(8))>>2)],HEAPF32[((($b_addr_i177)+(12))>>2)]);
 var $call_i178=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($291)), SIMD.float32x4.bitsToInt32x4($292)));
 $w_addr_i170=9.99999983775159e-18;
 var $293=$w_addr_i170;
 var $vecinit_i172=SIMD.float32x4.withX(float32x4.splat(0),$293);
 var $294=$w_addr_i170;
 var $vecinit1_i173=SIMD.float32x4.withY($vecinit_i172,$294);
 var $295=$w_addr_i170;
 var $vecinit2_i174=SIMD.float32x4.withZ($vecinit1_i173,$295);
 var $296=$w_addr_i170;
 var $vecinit3_i175=SIMD.float32x4.withW($vecinit2_i174,$296);
 (HEAPF32[(($_compoundliteral_i171)>>2)]=$vecinit3_i175.x,HEAPF32[((($_compoundliteral_i171)+(4))>>2)]=$vecinit3_i175.y,HEAPF32[((($_compoundliteral_i171)+(8))>>2)]=$vecinit3_i175.z,HEAPF32[((($_compoundliteral_i171)+(12))>>2)]=$vecinit3_i175.w);
 var $297=float32x4(HEAPF32[(($_compoundliteral_i171)>>2)],HEAPF32[((($_compoundliteral_i171)+(4))>>2)],HEAPF32[((($_compoundliteral_i171)+(8))>>2)],HEAPF32[((($_compoundliteral_i171)+(12))>>2)]);
 (HEAPF32[(($a_addr_i164)>>2)]=$call_i178.x,HEAPF32[((($a_addr_i164)+(4))>>2)]=$call_i178.y,HEAPF32[((($a_addr_i164)+(8))>>2)]=$call_i178.z,HEAPF32[((($a_addr_i164)+(12))>>2)]=$call_i178.w);
 (HEAPF32[(($b_addr_i165)>>2)]=$297.x,HEAPF32[((($b_addr_i165)+(4))>>2)]=$297.y,HEAPF32[((($b_addr_i165)+(8))>>2)]=$297.z,HEAPF32[((($b_addr_i165)+(12))>>2)]=$297.w);
 var $298=float32x4(HEAPF32[(($a_addr_i164)>>2)],HEAPF32[((($a_addr_i164)+(4))>>2)],HEAPF32[((($a_addr_i164)+(8))>>2)],HEAPF32[((($a_addr_i164)+(12))>>2)]);
 var $299=float32x4(HEAPF32[(($b_addr_i165)>>2)],HEAPF32[((($b_addr_i165)+(4))>>2)],HEAPF32[((($b_addr_i165)+(8))>>2)],HEAPF32[((($b_addr_i165)+(12))>>2)]);
 var $call_i166=SIMD.int32x4.bitsToFloat32x4(SIMD.float32x4.greaterThan($298, $299));
 (HEAPF32[(($cond3)>>2)]=$call_i166.x,HEAPF32[((($cond3)+(4))>>2)]=$call_i166.y,HEAPF32[((($cond3)+(8))>>2)]=$call_i166.z,HEAPF32[((($cond3)+(12))>>2)]=$call_i166.w);
 var $300=float32x4(HEAPF32[(($cond3)>>2)],HEAPF32[((($cond3)+(4))>>2)],HEAPF32[((($cond3)+(8))>>2)],HEAPF32[((($cond3)+(12))>>2)]);
 var $301=$nx_addr;
 var $302=float32x4(HEAPF32[(($301)>>2)],HEAPF32[((($301)+(4))>>2)],HEAPF32[((($301)+(8))>>2)],HEAPF32[((($301)+(12))>>2)]);
 var $303=float32x4(HEAPF32[(($lengths)>>2)],HEAPF32[((($lengths)+(4))>>2)],HEAPF32[((($lengths)+(8))>>2)],HEAPF32[((($lengths)+(12))>>2)]);
 (HEAPF32[(($a_addr_i161)>>2)]=$302.x,HEAPF32[((($a_addr_i161)+(4))>>2)]=$302.y,HEAPF32[((($a_addr_i161)+(8))>>2)]=$302.z,HEAPF32[((($a_addr_i161)+(12))>>2)]=$302.w);
 (HEAPF32[(($b_addr_i162)>>2)]=$303.x,HEAPF32[((($b_addr_i162)+(4))>>2)]=$303.y,HEAPF32[((($b_addr_i162)+(8))>>2)]=$303.z,HEAPF32[((($b_addr_i162)+(12))>>2)]=$303.w);
 var $304=float32x4(HEAPF32[(($a_addr_i161)>>2)],HEAPF32[((($a_addr_i161)+(4))>>2)],HEAPF32[((($a_addr_i161)+(8))>>2)],HEAPF32[((($a_addr_i161)+(12))>>2)]);
 var $305=float32x4(HEAPF32[(($b_addr_i162)>>2)],HEAPF32[((($b_addr_i162)+(4))>>2)],HEAPF32[((($b_addr_i162)+(8))>>2)],HEAPF32[((($b_addr_i162)+(12))>>2)]);
 var $div_i163=SIMD.float32x4.div($304,$305);
 (HEAPF32[(($a_addr_i156)>>2)]=$300.x,HEAPF32[((($a_addr_i156)+(4))>>2)]=$300.y,HEAPF32[((($a_addr_i156)+(8))>>2)]=$300.z,HEAPF32[((($a_addr_i156)+(12))>>2)]=$300.w);
 (HEAPF32[(($b_addr_i157)>>2)]=$div_i163.x,HEAPF32[((($b_addr_i157)+(4))>>2)]=$div_i163.y,HEAPF32[((($b_addr_i157)+(8))>>2)]=$div_i163.z,HEAPF32[((($b_addr_i157)+(12))>>2)]=$div_i163.w);
 var $306=float32x4(HEAPF32[(($a_addr_i156)>>2)],HEAPF32[((($a_addr_i156)+(4))>>2)],HEAPF32[((($a_addr_i156)+(8))>>2)],HEAPF32[((($a_addr_i156)+(12))>>2)]);
 var $307=float32x4(HEAPF32[(($b_addr_i157)>>2)],HEAPF32[((($b_addr_i157)+(4))>>2)],HEAPF32[((($b_addr_i157)+(8))>>2)],HEAPF32[((($b_addr_i157)+(12))>>2)]);
 var $call_i158=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($306), SIMD.float32x4.bitsToInt32x4($307)));
 var $308=float32x4(HEAPF32[(($cond3)>>2)],HEAPF32[((($cond3)+(4))>>2)],HEAPF32[((($cond3)+(8))>>2)],HEAPF32[((($cond3)+(12))>>2)]);
 var $309=$nx_addr;
 var $310=float32x4(HEAPF32[(($309)>>2)],HEAPF32[((($309)+(4))>>2)],HEAPF32[((($309)+(8))>>2)],HEAPF32[((($309)+(12))>>2)]);
 (HEAPF32[(($a_addr_i150)>>2)]=$308.x,HEAPF32[((($a_addr_i150)+(4))>>2)]=$308.y,HEAPF32[((($a_addr_i150)+(8))>>2)]=$308.z,HEAPF32[((($a_addr_i150)+(12))>>2)]=$308.w);
 (HEAPF32[(($b_addr_i151)>>2)]=$310.x,HEAPF32[((($b_addr_i151)+(4))>>2)]=$310.y,HEAPF32[((($b_addr_i151)+(8))>>2)]=$310.z,HEAPF32[((($b_addr_i151)+(12))>>2)]=$310.w);
 var $311=float32x4(HEAPF32[(($a_addr_i150)>>2)],HEAPF32[((($a_addr_i150)+(4))>>2)],HEAPF32[((($a_addr_i150)+(8))>>2)],HEAPF32[((($a_addr_i150)+(12))>>2)]);
 var $312=float32x4(HEAPF32[(($b_addr_i151)>>2)],HEAPF32[((($b_addr_i151)+(4))>>2)],HEAPF32[((($b_addr_i151)+(8))>>2)],HEAPF32[((($b_addr_i151)+(12))>>2)]);
 var $call_i152=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($311)), SIMD.float32x4.bitsToInt32x4($312)));
 (HEAPF32[(($a_addr_i144)>>2)]=$call_i158.x,HEAPF32[((($a_addr_i144)+(4))>>2)]=$call_i158.y,HEAPF32[((($a_addr_i144)+(8))>>2)]=$call_i158.z,HEAPF32[((($a_addr_i144)+(12))>>2)]=$call_i158.w);
 (HEAPF32[(($b_addr_i145)>>2)]=$call_i152.x,HEAPF32[((($b_addr_i145)+(4))>>2)]=$call_i152.y,HEAPF32[((($b_addr_i145)+(8))>>2)]=$call_i152.z,HEAPF32[((($b_addr_i145)+(12))>>2)]=$call_i152.w);
 var $313=float32x4(HEAPF32[(($a_addr_i144)>>2)],HEAPF32[((($a_addr_i144)+(4))>>2)],HEAPF32[((($a_addr_i144)+(8))>>2)],HEAPF32[((($a_addr_i144)+(12))>>2)]);
 var $314=float32x4(HEAPF32[(($b_addr_i145)>>2)],HEAPF32[((($b_addr_i145)+(4))>>2)],HEAPF32[((($b_addr_i145)+(8))>>2)],HEAPF32[((($b_addr_i145)+(12))>>2)]);
 var $call_i146=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($313), SIMD.float32x4.bitsToInt32x4($314)));
 var $315=$nx_addr;
 (HEAPF32[(($315)>>2)]=$call_i146.x,HEAPF32[((($315)+(4))>>2)]=$call_i146.y,HEAPF32[((($315)+(8))>>2)]=$call_i146.z,HEAPF32[((($315)+(12))>>2)]=$call_i146.w);
 var $316=float32x4(HEAPF32[(($cond3)>>2)],HEAPF32[((($cond3)+(4))>>2)],HEAPF32[((($cond3)+(8))>>2)],HEAPF32[((($cond3)+(12))>>2)]);
 var $317=$ny_addr;
 var $318=float32x4(HEAPF32[(($317)>>2)],HEAPF32[((($317)+(4))>>2)],HEAPF32[((($317)+(8))>>2)],HEAPF32[((($317)+(12))>>2)]);
 var $319=float32x4(HEAPF32[(($lengths)>>2)],HEAPF32[((($lengths)+(4))>>2)],HEAPF32[((($lengths)+(8))>>2)],HEAPF32[((($lengths)+(12))>>2)]);
 (HEAPF32[(($a_addr_i141)>>2)]=$318.x,HEAPF32[((($a_addr_i141)+(4))>>2)]=$318.y,HEAPF32[((($a_addr_i141)+(8))>>2)]=$318.z,HEAPF32[((($a_addr_i141)+(12))>>2)]=$318.w);
 (HEAPF32[(($b_addr_i142)>>2)]=$319.x,HEAPF32[((($b_addr_i142)+(4))>>2)]=$319.y,HEAPF32[((($b_addr_i142)+(8))>>2)]=$319.z,HEAPF32[((($b_addr_i142)+(12))>>2)]=$319.w);
 var $320=float32x4(HEAPF32[(($a_addr_i141)>>2)],HEAPF32[((($a_addr_i141)+(4))>>2)],HEAPF32[((($a_addr_i141)+(8))>>2)],HEAPF32[((($a_addr_i141)+(12))>>2)]);
 var $321=float32x4(HEAPF32[(($b_addr_i142)>>2)],HEAPF32[((($b_addr_i142)+(4))>>2)],HEAPF32[((($b_addr_i142)+(8))>>2)],HEAPF32[((($b_addr_i142)+(12))>>2)]);
 var $div_i143=SIMD.float32x4.div($320,$321);
 (HEAPF32[(($a_addr_i136)>>2)]=$316.x,HEAPF32[((($a_addr_i136)+(4))>>2)]=$316.y,HEAPF32[((($a_addr_i136)+(8))>>2)]=$316.z,HEAPF32[((($a_addr_i136)+(12))>>2)]=$316.w);
 (HEAPF32[(($b_addr_i137)>>2)]=$div_i143.x,HEAPF32[((($b_addr_i137)+(4))>>2)]=$div_i143.y,HEAPF32[((($b_addr_i137)+(8))>>2)]=$div_i143.z,HEAPF32[((($b_addr_i137)+(12))>>2)]=$div_i143.w);
 var $322=float32x4(HEAPF32[(($a_addr_i136)>>2)],HEAPF32[((($a_addr_i136)+(4))>>2)],HEAPF32[((($a_addr_i136)+(8))>>2)],HEAPF32[((($a_addr_i136)+(12))>>2)]);
 var $323=float32x4(HEAPF32[(($b_addr_i137)>>2)],HEAPF32[((($b_addr_i137)+(4))>>2)],HEAPF32[((($b_addr_i137)+(8))>>2)],HEAPF32[((($b_addr_i137)+(12))>>2)]);
 var $call_i138=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($322), SIMD.float32x4.bitsToInt32x4($323)));
 var $324=float32x4(HEAPF32[(($cond3)>>2)],HEAPF32[((($cond3)+(4))>>2)],HEAPF32[((($cond3)+(8))>>2)],HEAPF32[((($cond3)+(12))>>2)]);
 var $325=$ny_addr;
 var $326=float32x4(HEAPF32[(($325)>>2)],HEAPF32[((($325)+(4))>>2)],HEAPF32[((($325)+(8))>>2)],HEAPF32[((($325)+(12))>>2)]);
 (HEAPF32[(($a_addr_i130)>>2)]=$324.x,HEAPF32[((($a_addr_i130)+(4))>>2)]=$324.y,HEAPF32[((($a_addr_i130)+(8))>>2)]=$324.z,HEAPF32[((($a_addr_i130)+(12))>>2)]=$324.w);
 (HEAPF32[(($b_addr_i131)>>2)]=$326.x,HEAPF32[((($b_addr_i131)+(4))>>2)]=$326.y,HEAPF32[((($b_addr_i131)+(8))>>2)]=$326.z,HEAPF32[((($b_addr_i131)+(12))>>2)]=$326.w);
 var $327=float32x4(HEAPF32[(($a_addr_i130)>>2)],HEAPF32[((($a_addr_i130)+(4))>>2)],HEAPF32[((($a_addr_i130)+(8))>>2)],HEAPF32[((($a_addr_i130)+(12))>>2)]);
 var $328=float32x4(HEAPF32[(($b_addr_i131)>>2)],HEAPF32[((($b_addr_i131)+(4))>>2)],HEAPF32[((($b_addr_i131)+(8))>>2)],HEAPF32[((($b_addr_i131)+(12))>>2)]);
 var $call_i132=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($327)), SIMD.float32x4.bitsToInt32x4($328)));
 (HEAPF32[(($a_addr_i121)>>2)]=$call_i138.x,HEAPF32[((($a_addr_i121)+(4))>>2)]=$call_i138.y,HEAPF32[((($a_addr_i121)+(8))>>2)]=$call_i138.z,HEAPF32[((($a_addr_i121)+(12))>>2)]=$call_i138.w);
 (HEAPF32[(($b_addr_i122)>>2)]=$call_i132.x,HEAPF32[((($b_addr_i122)+(4))>>2)]=$call_i132.y,HEAPF32[((($b_addr_i122)+(8))>>2)]=$call_i132.z,HEAPF32[((($b_addr_i122)+(12))>>2)]=$call_i132.w);
 var $329=float32x4(HEAPF32[(($a_addr_i121)>>2)],HEAPF32[((($a_addr_i121)+(4))>>2)],HEAPF32[((($a_addr_i121)+(8))>>2)],HEAPF32[((($a_addr_i121)+(12))>>2)]);
 var $330=float32x4(HEAPF32[(($b_addr_i122)>>2)],HEAPF32[((($b_addr_i122)+(4))>>2)],HEAPF32[((($b_addr_i122)+(8))>>2)],HEAPF32[((($b_addr_i122)+(12))>>2)]);
 var $call_i123=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($329), SIMD.float32x4.bitsToInt32x4($330)));
 var $331=$ny_addr;
 (HEAPF32[(($331)>>2)]=$call_i123.x,HEAPF32[((($331)+(4))>>2)]=$call_i123.y,HEAPF32[((($331)+(8))>>2)]=$call_i123.z,HEAPF32[((($331)+(12))>>2)]=$call_i123.w);
 var $332=float32x4(HEAPF32[(($cond3)>>2)],HEAPF32[((($cond3)+(4))>>2)],HEAPF32[((($cond3)+(8))>>2)],HEAPF32[((($cond3)+(12))>>2)]);
 var $333=$nz_addr;
 var $334=float32x4(HEAPF32[(($333)>>2)],HEAPF32[((($333)+(4))>>2)],HEAPF32[((($333)+(8))>>2)],HEAPF32[((($333)+(12))>>2)]);
 var $335=float32x4(HEAPF32[(($lengths)>>2)],HEAPF32[((($lengths)+(4))>>2)],HEAPF32[((($lengths)+(8))>>2)],HEAPF32[((($lengths)+(12))>>2)]);
 (HEAPF32[(($a_addr_i119)>>2)]=$334.x,HEAPF32[((($a_addr_i119)+(4))>>2)]=$334.y,HEAPF32[((($a_addr_i119)+(8))>>2)]=$334.z,HEAPF32[((($a_addr_i119)+(12))>>2)]=$334.w);
 (HEAPF32[(($b_addr_i120)>>2)]=$335.x,HEAPF32[((($b_addr_i120)+(4))>>2)]=$335.y,HEAPF32[((($b_addr_i120)+(8))>>2)]=$335.z,HEAPF32[((($b_addr_i120)+(12))>>2)]=$335.w);
 var $336=float32x4(HEAPF32[(($a_addr_i119)>>2)],HEAPF32[((($a_addr_i119)+(4))>>2)],HEAPF32[((($a_addr_i119)+(8))>>2)],HEAPF32[((($a_addr_i119)+(12))>>2)]);
 var $337=float32x4(HEAPF32[(($b_addr_i120)>>2)],HEAPF32[((($b_addr_i120)+(4))>>2)],HEAPF32[((($b_addr_i120)+(8))>>2)],HEAPF32[((($b_addr_i120)+(12))>>2)]);
 var $div_i=SIMD.float32x4.div($336,$337);
 (HEAPF32[(($a_addr_i113)>>2)]=$332.x,HEAPF32[((($a_addr_i113)+(4))>>2)]=$332.y,HEAPF32[((($a_addr_i113)+(8))>>2)]=$332.z,HEAPF32[((($a_addr_i113)+(12))>>2)]=$332.w);
 (HEAPF32[(($b_addr_i114)>>2)]=$div_i.x,HEAPF32[((($b_addr_i114)+(4))>>2)]=$div_i.y,HEAPF32[((($b_addr_i114)+(8))>>2)]=$div_i.z,HEAPF32[((($b_addr_i114)+(12))>>2)]=$div_i.w);
 var $338=float32x4(HEAPF32[(($a_addr_i113)>>2)],HEAPF32[((($a_addr_i113)+(4))>>2)],HEAPF32[((($a_addr_i113)+(8))>>2)],HEAPF32[((($a_addr_i113)+(12))>>2)]);
 var $339=float32x4(HEAPF32[(($b_addr_i114)>>2)],HEAPF32[((($b_addr_i114)+(4))>>2)],HEAPF32[((($b_addr_i114)+(8))>>2)],HEAPF32[((($b_addr_i114)+(12))>>2)]);
 var $call_i115=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($338), SIMD.float32x4.bitsToInt32x4($339)));
 var $340=float32x4(HEAPF32[(($cond3)>>2)],HEAPF32[((($cond3)+(4))>>2)],HEAPF32[((($cond3)+(8))>>2)],HEAPF32[((($cond3)+(12))>>2)]);
 var $341=$nz_addr;
 var $342=float32x4(HEAPF32[(($341)>>2)],HEAPF32[((($341)+(4))>>2)],HEAPF32[((($341)+(8))>>2)],HEAPF32[((($341)+(12))>>2)]);
 (HEAPF32[(($a_addr_i104)>>2)]=$340.x,HEAPF32[((($a_addr_i104)+(4))>>2)]=$340.y,HEAPF32[((($a_addr_i104)+(8))>>2)]=$340.z,HEAPF32[((($a_addr_i104)+(12))>>2)]=$340.w);
 (HEAPF32[(($b_addr_i105)>>2)]=$342.x,HEAPF32[((($b_addr_i105)+(4))>>2)]=$342.y,HEAPF32[((($b_addr_i105)+(8))>>2)]=$342.z,HEAPF32[((($b_addr_i105)+(12))>>2)]=$342.w);
 var $343=float32x4(HEAPF32[(($a_addr_i104)>>2)],HEAPF32[((($a_addr_i104)+(4))>>2)],HEAPF32[((($a_addr_i104)+(8))>>2)],HEAPF32[((($a_addr_i104)+(12))>>2)]);
 var $344=float32x4(HEAPF32[(($b_addr_i105)>>2)],HEAPF32[((($b_addr_i105)+(4))>>2)],HEAPF32[((($b_addr_i105)+(8))>>2)],HEAPF32[((($b_addr_i105)+(12))>>2)]);
 var $call_i106=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($343)), SIMD.float32x4.bitsToInt32x4($344)));
 (HEAPF32[(($a_addr_i)>>2)]=$call_i115.x,HEAPF32[((($a_addr_i)+(4))>>2)]=$call_i115.y,HEAPF32[((($a_addr_i)+(8))>>2)]=$call_i115.z,HEAPF32[((($a_addr_i)+(12))>>2)]=$call_i115.w);
 (HEAPF32[(($b_addr_i)>>2)]=$call_i106.x,HEAPF32[((($b_addr_i)+(4))>>2)]=$call_i106.y,HEAPF32[((($b_addr_i)+(8))>>2)]=$call_i106.z,HEAPF32[((($b_addr_i)+(12))>>2)]=$call_i106.w);
 var $345=float32x4(HEAPF32[(($a_addr_i)>>2)],HEAPF32[((($a_addr_i)+(4))>>2)],HEAPF32[((($a_addr_i)+(8))>>2)],HEAPF32[((($a_addr_i)+(12))>>2)]);
 var $346=float32x4(HEAPF32[(($b_addr_i)>>2)],HEAPF32[((($b_addr_i)+(4))>>2)],HEAPF32[((($b_addr_i)+(8))>>2)],HEAPF32[((($b_addr_i)+(12))>>2)]);
 var $call_i=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($345), SIMD.float32x4.bitsToInt32x4($346)));
 var $347=$nz_addr;
 (HEAPF32[(($347)>>2)]=$call_i.x,HEAPF32[((($347)+(4))>>2)]=$call_i.y,HEAPF32[((($347)+(8))>>2)]=$call_i.z,HEAPF32[((($347)+(12))>>2)]=$call_i.w);
 label=4;break;
 case 4: 
 label=5;break;
 case 5: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_ray_sphere_intersect_simd"] = _ray_sphere_intersect_simd;
function _ray_plane_intersect_simd($t,$hit,$px,$py,$pz,$nx,$ny,$nz,$dirx,$diry,$dirz,$orgx,$orgy,$orgz,$plane){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+2272)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $a_addr_i374=sp;
 var $b_addr_i375=(sp)+(16);
 var $w_addr_i368;
 var $_compoundliteral_i369=(sp)+(32);
 var $a_addr_i365=(sp)+(48);
 var $b_addr_i366=(sp)+(64);
 var $a_addr_i363=(sp)+(80);
 var $a_addr_i360=(sp)+(96);
 var $b_addr_i361=(sp)+(112);
 var $a_addr_i357=(sp)+(128);
 var $b_addr_i358=(sp)+(144);
 var $a_addr_i355=(sp)+(160);
 var $b_addr_i356=(sp)+(176);
 var $a_addr_i352=(sp)+(192);
 var $b_addr_i353=(sp)+(208);
 var $a_addr_i349=(sp)+(224);
 var $b_addr_i350=(sp)+(240);
 var $w_addr_i343;
 var $_compoundliteral_i344=(sp)+(256);
 var $w_addr_i337;
 var $_compoundliteral_i338=(sp)+(272);
 var $a_addr_i334=(sp)+(288);
 var $b_addr_i335=(sp)+(304);
 var $a_addr_i331=(sp)+(320);
 var $b_addr_i332=(sp)+(336);
 var $a_addr_i328=(sp)+(352);
 var $b_addr_i329=(sp)+(368);
 var $w_addr_i322;
 var $_compoundliteral_i323=(sp)+(384);
 var $a_addr_i319=(sp)+(400);
 var $b_addr_i320=(sp)+(416);
 var $a_addr_i316=(sp)+(432);
 var $b_addr_i317=(sp)+(448);
 var $a_addr_i314=(sp)+(464);
 var $w_addr_i308;
 var $_compoundliteral_i309=(sp)+(480);
 var $a_addr_i305=(sp)+(496);
 var $b_addr_i306=(sp)+(512);
 var $a_addr_i302=(sp)+(528);
 var $b_addr_i303=(sp)+(544);
 var $w_addr_i296;
 var $_compoundliteral_i297=(sp)+(560);
 var $a_addr_i293=(sp)+(576);
 var $b_addr_i294=(sp)+(592);
 var $a_addr_i291=(sp)+(608);
 var $a_addr_i288=(sp)+(624);
 var $b_addr_i289=(sp)+(640);
 var $w_addr_i282;
 var $_compoundliteral_i283=(sp)+(656);
 var $a_addr_i279=(sp)+(672);
 var $b_addr_i280=(sp)+(688);
 var $a_addr_i276=(sp)+(704);
 var $b_addr_i277=(sp)+(720);
 var $a_addr_i273=(sp)+(736);
 var $b_addr_i274=(sp)+(752);
 var $a_addr_i270=(sp)+(768);
 var $b_addr_i271=(sp)+(784);
 var $a_addr_i267=(sp)+(800);
 var $b_addr_i268=(sp)+(816);
 var $a_addr_i264=(sp)+(832);
 var $b_addr_i265=(sp)+(848);
 var $a_addr_i261=(sp)+(864);
 var $b_addr_i262=(sp)+(880);
 var $a_addr_i258=(sp)+(896);
 var $b_addr_i259=(sp)+(912);
 var $a_addr_i255=(sp)+(928);
 var $b_addr_i256=(sp)+(944);
 var $w_addr_i249;
 var $_compoundliteral_i250=(sp)+(960);
 var $a_addr_i246=(sp)+(976);
 var $b_addr_i247=(sp)+(992);
 var $a_addr_i243=(sp)+(1008);
 var $b_addr_i244=(sp)+(1024);
 var $a_addr_i240=(sp)+(1040);
 var $b_addr_i241=(sp)+(1056);
 var $a_addr_i237=(sp)+(1072);
 var $b_addr_i238=(sp)+(1088);
 var $a_addr_i234=(sp)+(1104);
 var $b_addr_i235=(sp)+(1120);
 var $w_addr_i228;
 var $_compoundliteral_i229=(sp)+(1136);
 var $a_addr_i225=(sp)+(1152);
 var $b_addr_i226=(sp)+(1168);
 var $a_addr_i222=(sp)+(1184);
 var $b_addr_i223=(sp)+(1200);
 var $a_addr_i219=(sp)+(1216);
 var $b_addr_i220=(sp)+(1232);
 var $a_addr_i216=(sp)+(1248);
 var $b_addr_i217=(sp)+(1264);
 var $a_addr_i213=(sp)+(1280);
 var $b_addr_i214=(sp)+(1296);
 var $w_addr_i207;
 var $_compoundliteral_i208=(sp)+(1312);
 var $a_addr_i204=(sp)+(1328);
 var $b_addr_i205=(sp)+(1344);
 var $a_addr_i202=(sp)+(1360);
 var $a_addr_i199=(sp)+(1376);
 var $b_addr_i200=(sp)+(1392);
 var $w_addr_i193;
 var $_compoundliteral_i194=(sp)+(1408);
 var $a_addr_i190=(sp)+(1424);
 var $b_addr_i191=(sp)+(1440);
 var $a_addr_i187=(sp)+(1456);
 var $b_addr_i188=(sp)+(1472);
 var $a_addr_i184=(sp)+(1488);
 var $b_addr_i185=(sp)+(1504);
 var $w_addr_i178;
 var $_compoundliteral_i179=(sp)+(1520);
 var $a_addr_i176=(sp)+(1536);
 var $b_addr_i177=(sp)+(1552);
 var $a_addr_i173=(sp)+(1568);
 var $b_addr_i174=(sp)+(1584);
 var $a_addr_i170=(sp)+(1600);
 var $b_addr_i171=(sp)+(1616);
 var $a_addr_i167=(sp)+(1632);
 var $b_addr_i168=(sp)+(1648);
 var $w_addr_i161;
 var $_compoundliteral_i162=(sp)+(1664);
 var $a_addr_i158=(sp)+(1680);
 var $b_addr_i159=(sp)+(1696);
 var $w_addr_i152;
 var $_compoundliteral_i153=(sp)+(1712);
 var $w_addr_i146;
 var $_compoundliteral_i147=(sp)+(1728);
 var $a_addr_i143=(sp)+(1744);
 var $b_addr_i144=(sp)+(1760);
 var $a_addr_i140=(sp)+(1776);
 var $b_addr_i141=(sp)+(1792);
 var $a_addr_i137=(sp)+(1808);
 var $b_addr_i138=(sp)+(1824);
 var $w_addr_i131;
 var $_compoundliteral_i132=(sp)+(1840);
 var $a_addr_i128=(sp)+(1856);
 var $b_addr_i129=(sp)+(1872);
 var $w_addr_i122;
 var $_compoundliteral_i123=(sp)+(1888);
 var $w_addr_i116;
 var $_compoundliteral_i117=(sp)+(1904);
 var $a_addr_i113=(sp)+(1920);
 var $b_addr_i114=(sp)+(1936);
 var $a_addr_i111=(sp)+(1952);
 var $b_addr_i112=(sp)+(1968);
 var $a_addr_i108=(sp)+(1984);
 var $b_addr_i109=(sp)+(2000);
 var $w_addr_i102;
 var $_compoundliteral_i103=(sp)+(2016);
 var $a_addr_i=(sp)+(2032);
 var $b_addr_i=(sp)+(2048);
 var $w_addr_i;
 var $_compoundliteral_i=(sp)+(2064);
 var $t_addr;
 var $hit_addr;
 var $px_addr;
 var $py_addr;
 var $pz_addr;
 var $nx_addr;
 var $ny_addr;
 var $nz_addr;
 var $dirx_addr=(sp)+(2080);
 var $diry_addr=(sp)+(2096);
 var $dirz_addr=(sp)+(2112);
 var $orgx_addr=(sp)+(2128);
 var $orgy_addr=(sp)+(2144);
 var $orgz_addr=(sp)+(2160);
 var $plane_addr;
 var $d=(sp)+(2176);
 var $v=(sp)+(2192);
 var $cond1=(sp)+(2208);
 var $dp=(sp)+(2224);
 var $t2=(sp)+(2240);
 var $cond2=(sp)+(2256);
 $t_addr=$t;
 $hit_addr=$hit;
 $px_addr=$px;
 $py_addr=$py;
 $pz_addr=$pz;
 $nx_addr=$nx;
 $ny_addr=$ny;
 $nz_addr=$nz;
 (HEAPF32[(($dirx_addr)>>2)]=$dirx.x,HEAPF32[((($dirx_addr)+(4))>>2)]=$dirx.y,HEAPF32[((($dirx_addr)+(8))>>2)]=$dirx.z,HEAPF32[((($dirx_addr)+(12))>>2)]=$dirx.w);
 (HEAPF32[(($diry_addr)>>2)]=$diry.x,HEAPF32[((($diry_addr)+(4))>>2)]=$diry.y,HEAPF32[((($diry_addr)+(8))>>2)]=$diry.z,HEAPF32[((($diry_addr)+(12))>>2)]=$diry.w);
 (HEAPF32[(($dirz_addr)>>2)]=$dirz.x,HEAPF32[((($dirz_addr)+(4))>>2)]=$dirz.y,HEAPF32[((($dirz_addr)+(8))>>2)]=$dirz.z,HEAPF32[((($dirz_addr)+(12))>>2)]=$dirz.w);
 (HEAPF32[(($orgx_addr)>>2)]=$orgx.x,HEAPF32[((($orgx_addr)+(4))>>2)]=$orgx.y,HEAPF32[((($orgx_addr)+(8))>>2)]=$orgx.z,HEAPF32[((($orgx_addr)+(12))>>2)]=$orgx.w);
 (HEAPF32[(($orgy_addr)>>2)]=$orgy.x,HEAPF32[((($orgy_addr)+(4))>>2)]=$orgy.y,HEAPF32[((($orgy_addr)+(8))>>2)]=$orgy.z,HEAPF32[((($orgy_addr)+(12))>>2)]=$orgy.w);
 (HEAPF32[(($orgz_addr)>>2)]=$orgz.x,HEAPF32[((($orgz_addr)+(4))>>2)]=$orgz.y,HEAPF32[((($orgz_addr)+(8))>>2)]=$orgz.z,HEAPF32[((($orgz_addr)+(12))>>2)]=$orgz.w);
 $plane_addr=$plane;
 var $0=$plane_addr;
 var $p=(($0)|0);
 var $x=(($p)|0);
 var $1=HEAPF32[(($x)>>2)];
 $w_addr_i=$1;
 var $2=$w_addr_i;
 var $vecinit_i=SIMD.float32x4.withX(float32x4.splat(0),$2);
 var $3=$w_addr_i;
 var $vecinit1_i=SIMD.float32x4.withY($vecinit_i,$3);
 var $4=$w_addr_i;
 var $vecinit2_i=SIMD.float32x4.withZ($vecinit1_i,$4);
 var $5=$w_addr_i;
 var $vecinit3_i=SIMD.float32x4.withW($vecinit2_i,$5);
 (HEAPF32[(($_compoundliteral_i)>>2)]=$vecinit3_i.x,HEAPF32[((($_compoundliteral_i)+(4))>>2)]=$vecinit3_i.y,HEAPF32[((($_compoundliteral_i)+(8))>>2)]=$vecinit3_i.z,HEAPF32[((($_compoundliteral_i)+(12))>>2)]=$vecinit3_i.w);
 var $6=float32x4(HEAPF32[(($_compoundliteral_i)>>2)],HEAPF32[((($_compoundliteral_i)+(4))>>2)],HEAPF32[((($_compoundliteral_i)+(8))>>2)],HEAPF32[((($_compoundliteral_i)+(12))>>2)]);
 var $7=$plane_addr;
 var $n=(($7+12)|0);
 var $x1=(($n)|0);
 var $8=HEAPF32[(($x1)>>2)];
 $w_addr_i102=$8;
 var $9=$w_addr_i102;
 var $vecinit_i104=SIMD.float32x4.withX(float32x4.splat(0),$9);
 var $10=$w_addr_i102;
 var $vecinit1_i105=SIMD.float32x4.withY($vecinit_i104,$10);
 var $11=$w_addr_i102;
 var $vecinit2_i106=SIMD.float32x4.withZ($vecinit1_i105,$11);
 var $12=$w_addr_i102;
 var $vecinit3_i107=SIMD.float32x4.withW($vecinit2_i106,$12);
 (HEAPF32[(($_compoundliteral_i103)>>2)]=$vecinit3_i107.x,HEAPF32[((($_compoundliteral_i103)+(4))>>2)]=$vecinit3_i107.y,HEAPF32[((($_compoundliteral_i103)+(8))>>2)]=$vecinit3_i107.z,HEAPF32[((($_compoundliteral_i103)+(12))>>2)]=$vecinit3_i107.w);
 var $13=float32x4(HEAPF32[(($_compoundliteral_i103)>>2)],HEAPF32[((($_compoundliteral_i103)+(4))>>2)],HEAPF32[((($_compoundliteral_i103)+(8))>>2)],HEAPF32[((($_compoundliteral_i103)+(12))>>2)]);
 (HEAPF32[(($a_addr_i111)>>2)]=$6.x,HEAPF32[((($a_addr_i111)+(4))>>2)]=$6.y,HEAPF32[((($a_addr_i111)+(8))>>2)]=$6.z,HEAPF32[((($a_addr_i111)+(12))>>2)]=$6.w);
 (HEAPF32[(($b_addr_i112)>>2)]=$13.x,HEAPF32[((($b_addr_i112)+(4))>>2)]=$13.y,HEAPF32[((($b_addr_i112)+(8))>>2)]=$13.z,HEAPF32[((($b_addr_i112)+(12))>>2)]=$13.w);
 var $14=float32x4(HEAPF32[(($a_addr_i111)>>2)],HEAPF32[((($a_addr_i111)+(4))>>2)],HEAPF32[((($a_addr_i111)+(8))>>2)],HEAPF32[((($a_addr_i111)+(12))>>2)]);
 var $15=float32x4(HEAPF32[(($b_addr_i112)>>2)],HEAPF32[((($b_addr_i112)+(4))>>2)],HEAPF32[((($b_addr_i112)+(8))>>2)],HEAPF32[((($b_addr_i112)+(12))>>2)]);
 var $mul_i=SIMD.float32x4.mul($14,$15);
 var $16=$plane_addr;
 var $p4=(($16)|0);
 var $y=(($p4+4)|0);
 var $17=HEAPF32[(($y)>>2)];
 $w_addr_i116=$17;
 var $18=$w_addr_i116;
 var $vecinit_i118=SIMD.float32x4.withX(float32x4.splat(0),$18);
 var $19=$w_addr_i116;
 var $vecinit1_i119=SIMD.float32x4.withY($vecinit_i118,$19);
 var $20=$w_addr_i116;
 var $vecinit2_i120=SIMD.float32x4.withZ($vecinit1_i119,$20);
 var $21=$w_addr_i116;
 var $vecinit3_i121=SIMD.float32x4.withW($vecinit2_i120,$21);
 (HEAPF32[(($_compoundliteral_i117)>>2)]=$vecinit3_i121.x,HEAPF32[((($_compoundliteral_i117)+(4))>>2)]=$vecinit3_i121.y,HEAPF32[((($_compoundliteral_i117)+(8))>>2)]=$vecinit3_i121.z,HEAPF32[((($_compoundliteral_i117)+(12))>>2)]=$vecinit3_i121.w);
 var $22=float32x4(HEAPF32[(($_compoundliteral_i117)>>2)],HEAPF32[((($_compoundliteral_i117)+(4))>>2)],HEAPF32[((($_compoundliteral_i117)+(8))>>2)],HEAPF32[((($_compoundliteral_i117)+(12))>>2)]);
 var $23=$plane_addr;
 var $n6=(($23+12)|0);
 var $y7=(($n6+4)|0);
 var $24=HEAPF32[(($y7)>>2)];
 $w_addr_i131=$24;
 var $25=$w_addr_i131;
 var $vecinit_i133=SIMD.float32x4.withX(float32x4.splat(0),$25);
 var $26=$w_addr_i131;
 var $vecinit1_i134=SIMD.float32x4.withY($vecinit_i133,$26);
 var $27=$w_addr_i131;
 var $vecinit2_i135=SIMD.float32x4.withZ($vecinit1_i134,$27);
 var $28=$w_addr_i131;
 var $vecinit3_i136=SIMD.float32x4.withW($vecinit2_i135,$28);
 (HEAPF32[(($_compoundliteral_i132)>>2)]=$vecinit3_i136.x,HEAPF32[((($_compoundliteral_i132)+(4))>>2)]=$vecinit3_i136.y,HEAPF32[((($_compoundliteral_i132)+(8))>>2)]=$vecinit3_i136.z,HEAPF32[((($_compoundliteral_i132)+(12))>>2)]=$vecinit3_i136.w);
 var $29=float32x4(HEAPF32[(($_compoundliteral_i132)>>2)],HEAPF32[((($_compoundliteral_i132)+(4))>>2)],HEAPF32[((($_compoundliteral_i132)+(8))>>2)],HEAPF32[((($_compoundliteral_i132)+(12))>>2)]);
 (HEAPF32[(($a_addr_i140)>>2)]=$22.x,HEAPF32[((($a_addr_i140)+(4))>>2)]=$22.y,HEAPF32[((($a_addr_i140)+(8))>>2)]=$22.z,HEAPF32[((($a_addr_i140)+(12))>>2)]=$22.w);
 (HEAPF32[(($b_addr_i141)>>2)]=$29.x,HEAPF32[((($b_addr_i141)+(4))>>2)]=$29.y,HEAPF32[((($b_addr_i141)+(8))>>2)]=$29.z,HEAPF32[((($b_addr_i141)+(12))>>2)]=$29.w);
 var $30=float32x4(HEAPF32[(($a_addr_i140)>>2)],HEAPF32[((($a_addr_i140)+(4))>>2)],HEAPF32[((($a_addr_i140)+(8))>>2)],HEAPF32[((($a_addr_i140)+(12))>>2)]);
 var $31=float32x4(HEAPF32[(($b_addr_i141)>>2)],HEAPF32[((($b_addr_i141)+(4))>>2)],HEAPF32[((($b_addr_i141)+(8))>>2)],HEAPF32[((($b_addr_i141)+(12))>>2)]);
 var $mul_i142=SIMD.float32x4.mul($30,$31);
 var $32=$plane_addr;
 var $p10=(($32)|0);
 var $z=(($p10+8)|0);
 var $33=HEAPF32[(($z)>>2)];
 $w_addr_i146=$33;
 var $34=$w_addr_i146;
 var $vecinit_i148=SIMD.float32x4.withX(float32x4.splat(0),$34);
 var $35=$w_addr_i146;
 var $vecinit1_i149=SIMD.float32x4.withY($vecinit_i148,$35);
 var $36=$w_addr_i146;
 var $vecinit2_i150=SIMD.float32x4.withZ($vecinit1_i149,$36);
 var $37=$w_addr_i146;
 var $vecinit3_i151=SIMD.float32x4.withW($vecinit2_i150,$37);
 (HEAPF32[(($_compoundliteral_i147)>>2)]=$vecinit3_i151.x,HEAPF32[((($_compoundliteral_i147)+(4))>>2)]=$vecinit3_i151.y,HEAPF32[((($_compoundliteral_i147)+(8))>>2)]=$vecinit3_i151.z,HEAPF32[((($_compoundliteral_i147)+(12))>>2)]=$vecinit3_i151.w);
 var $38=float32x4(HEAPF32[(($_compoundliteral_i147)>>2)],HEAPF32[((($_compoundliteral_i147)+(4))>>2)],HEAPF32[((($_compoundliteral_i147)+(8))>>2)],HEAPF32[((($_compoundliteral_i147)+(12))>>2)]);
 var $39=$plane_addr;
 var $n12=(($39+12)|0);
 var $z13=(($n12+8)|0);
 var $40=HEAPF32[(($z13)>>2)];
 $w_addr_i161=$40;
 var $41=$w_addr_i161;
 var $vecinit_i163=SIMD.float32x4.withX(float32x4.splat(0),$41);
 var $42=$w_addr_i161;
 var $vecinit1_i164=SIMD.float32x4.withY($vecinit_i163,$42);
 var $43=$w_addr_i161;
 var $vecinit2_i165=SIMD.float32x4.withZ($vecinit1_i164,$43);
 var $44=$w_addr_i161;
 var $vecinit3_i166=SIMD.float32x4.withW($vecinit2_i165,$44);
 (HEAPF32[(($_compoundliteral_i162)>>2)]=$vecinit3_i166.x,HEAPF32[((($_compoundliteral_i162)+(4))>>2)]=$vecinit3_i166.y,HEAPF32[((($_compoundliteral_i162)+(8))>>2)]=$vecinit3_i166.z,HEAPF32[((($_compoundliteral_i162)+(12))>>2)]=$vecinit3_i166.w);
 var $45=float32x4(HEAPF32[(($_compoundliteral_i162)>>2)],HEAPF32[((($_compoundliteral_i162)+(4))>>2)],HEAPF32[((($_compoundliteral_i162)+(8))>>2)],HEAPF32[((($_compoundliteral_i162)+(12))>>2)]);
 (HEAPF32[(($a_addr_i170)>>2)]=$38.x,HEAPF32[((($a_addr_i170)+(4))>>2)]=$38.y,HEAPF32[((($a_addr_i170)+(8))>>2)]=$38.z,HEAPF32[((($a_addr_i170)+(12))>>2)]=$38.w);
 (HEAPF32[(($b_addr_i171)>>2)]=$45.x,HEAPF32[((($b_addr_i171)+(4))>>2)]=$45.y,HEAPF32[((($b_addr_i171)+(8))>>2)]=$45.z,HEAPF32[((($b_addr_i171)+(12))>>2)]=$45.w);
 var $46=float32x4(HEAPF32[(($a_addr_i170)>>2)],HEAPF32[((($a_addr_i170)+(4))>>2)],HEAPF32[((($a_addr_i170)+(8))>>2)],HEAPF32[((($a_addr_i170)+(12))>>2)]);
 var $47=float32x4(HEAPF32[(($b_addr_i171)>>2)],HEAPF32[((($b_addr_i171)+(4))>>2)],HEAPF32[((($b_addr_i171)+(8))>>2)],HEAPF32[((($b_addr_i171)+(12))>>2)]);
 var $mul_i172=SIMD.float32x4.mul($46,$47);
 (HEAPF32[(($a_addr_i176)>>2)]=$mul_i142.x,HEAPF32[((($a_addr_i176)+(4))>>2)]=$mul_i142.y,HEAPF32[((($a_addr_i176)+(8))>>2)]=$mul_i142.z,HEAPF32[((($a_addr_i176)+(12))>>2)]=$mul_i142.w);
 (HEAPF32[(($b_addr_i177)>>2)]=$mul_i172.x,HEAPF32[((($b_addr_i177)+(4))>>2)]=$mul_i172.y,HEAPF32[((($b_addr_i177)+(8))>>2)]=$mul_i172.z,HEAPF32[((($b_addr_i177)+(12))>>2)]=$mul_i172.w);
 var $48=float32x4(HEAPF32[(($a_addr_i176)>>2)],HEAPF32[((($a_addr_i176)+(4))>>2)],HEAPF32[((($a_addr_i176)+(8))>>2)],HEAPF32[((($a_addr_i176)+(12))>>2)]);
 var $49=float32x4(HEAPF32[(($b_addr_i177)>>2)],HEAPF32[((($b_addr_i177)+(4))>>2)],HEAPF32[((($b_addr_i177)+(8))>>2)],HEAPF32[((($b_addr_i177)+(12))>>2)]);
 var $add_i=SIMD.float32x4.add($48,$49);
 (HEAPF32[(($a_addr_i187)>>2)]=$mul_i.x,HEAPF32[((($a_addr_i187)+(4))>>2)]=$mul_i.y,HEAPF32[((($a_addr_i187)+(8))>>2)]=$mul_i.z,HEAPF32[((($a_addr_i187)+(12))>>2)]=$mul_i.w);
 (HEAPF32[(($b_addr_i188)>>2)]=$add_i.x,HEAPF32[((($b_addr_i188)+(4))>>2)]=$add_i.y,HEAPF32[((($b_addr_i188)+(8))>>2)]=$add_i.z,HEAPF32[((($b_addr_i188)+(12))>>2)]=$add_i.w);
 var $50=float32x4(HEAPF32[(($a_addr_i187)>>2)],HEAPF32[((($a_addr_i187)+(4))>>2)],HEAPF32[((($a_addr_i187)+(8))>>2)],HEAPF32[((($a_addr_i187)+(12))>>2)]);
 var $51=float32x4(HEAPF32[(($b_addr_i188)>>2)],HEAPF32[((($b_addr_i188)+(4))>>2)],HEAPF32[((($b_addr_i188)+(8))>>2)],HEAPF32[((($b_addr_i188)+(12))>>2)]);
 var $add_i189=SIMD.float32x4.add($50,$51);
 $w_addr_i193=-2147483648;
 var $52=$w_addr_i193;
 var $vecinit_i195=SIMD.int32x4.withX(int32x4.splat(0),$52);
 var $53=$w_addr_i193;
 var $vecinit1_i196=SIMD.int32x4.withY($vecinit_i195,$53);
 var $54=$w_addr_i193;
 var $vecinit2_i197=SIMD.int32x4.withZ($vecinit1_i196,$54);
 var $55=$w_addr_i193;
 var $vecinit3_i198=SIMD.int32x4.withW($vecinit2_i197,$55);
 (HEAP32[(($_compoundliteral_i194)>>2)]=$vecinit3_i198.x,HEAP32[((($_compoundliteral_i194)+(4))>>2)]=$vecinit3_i198.y,HEAP32[((($_compoundliteral_i194)+(8))>>2)]=$vecinit3_i198.z,HEAP32[((($_compoundliteral_i194)+(12))>>2)]=$vecinit3_i198.w);
 var $56=int32x4(HEAP32[(($_compoundliteral_i194)>>2)],HEAP32[((($_compoundliteral_i194)+(4))>>2)],HEAP32[((($_compoundliteral_i194)+(8))>>2)],HEAP32[((($_compoundliteral_i194)+(12))>>2)]);
 (HEAP32[(($a_addr_i202)>>2)]=$56.x,HEAP32[((($a_addr_i202)+(4))>>2)]=$56.y,HEAP32[((($a_addr_i202)+(8))>>2)]=$56.z,HEAP32[((($a_addr_i202)+(12))>>2)]=$56.w);
 var $57=int32x4(HEAP32[(($a_addr_i202)>>2)],HEAP32[((($a_addr_i202)+(4))>>2)],HEAP32[((($a_addr_i202)+(8))>>2)],HEAP32[((($a_addr_i202)+(12))>>2)]);
 var $call_i203=SIMD.int32x4.bitsToFloat32x4($57);
 (HEAPF32[(($a_addr_i204)>>2)]=$add_i189.x,HEAPF32[((($a_addr_i204)+(4))>>2)]=$add_i189.y,HEAPF32[((($a_addr_i204)+(8))>>2)]=$add_i189.z,HEAPF32[((($a_addr_i204)+(12))>>2)]=$add_i189.w);
 (HEAPF32[(($b_addr_i205)>>2)]=$call_i203.x,HEAPF32[((($b_addr_i205)+(4))>>2)]=$call_i203.y,HEAPF32[((($b_addr_i205)+(8))>>2)]=$call_i203.z,HEAPF32[((($b_addr_i205)+(12))>>2)]=$call_i203.w);
 var $58=float32x4(HEAPF32[(($a_addr_i204)>>2)],HEAPF32[((($a_addr_i204)+(4))>>2)],HEAPF32[((($a_addr_i204)+(8))>>2)],HEAPF32[((($a_addr_i204)+(12))>>2)]);
 var $59=float32x4(HEAPF32[(($b_addr_i205)>>2)],HEAPF32[((($b_addr_i205)+(4))>>2)],HEAPF32[((($b_addr_i205)+(8))>>2)],HEAPF32[((($b_addr_i205)+(12))>>2)]);
 var $call_i206=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.xor(SIMD.float32x4.bitsToInt32x4($58), SIMD.float32x4.bitsToInt32x4($59)));
 (HEAPF32[(($d)>>2)]=$call_i206.x,HEAPF32[((($d)+(4))>>2)]=$call_i206.y,HEAPF32[((($d)+(8))>>2)]=$call_i206.z,HEAPF32[((($d)+(12))>>2)]=$call_i206.w);
 var $60=float32x4(HEAPF32[(($dirx_addr)>>2)],HEAPF32[((($dirx_addr)+(4))>>2)],HEAPF32[((($dirx_addr)+(8))>>2)],HEAPF32[((($dirx_addr)+(12))>>2)]);
 var $61=$plane_addr;
 var $n21=(($61+12)|0);
 var $x22=(($n21)|0);
 var $62=HEAPF32[(($x22)>>2)];
 $w_addr_i207=$62;
 var $63=$w_addr_i207;
 var $vecinit_i209=SIMD.float32x4.withX(float32x4.splat(0),$63);
 var $64=$w_addr_i207;
 var $vecinit1_i210=SIMD.float32x4.withY($vecinit_i209,$64);
 var $65=$w_addr_i207;
 var $vecinit2_i211=SIMD.float32x4.withZ($vecinit1_i210,$65);
 var $66=$w_addr_i207;
 var $vecinit3_i212=SIMD.float32x4.withW($vecinit2_i211,$66);
 (HEAPF32[(($_compoundliteral_i208)>>2)]=$vecinit3_i212.x,HEAPF32[((($_compoundliteral_i208)+(4))>>2)]=$vecinit3_i212.y,HEAPF32[((($_compoundliteral_i208)+(8))>>2)]=$vecinit3_i212.z,HEAPF32[((($_compoundliteral_i208)+(12))>>2)]=$vecinit3_i212.w);
 var $67=float32x4(HEAPF32[(($_compoundliteral_i208)>>2)],HEAPF32[((($_compoundliteral_i208)+(4))>>2)],HEAPF32[((($_compoundliteral_i208)+(8))>>2)],HEAPF32[((($_compoundliteral_i208)+(12))>>2)]);
 (HEAPF32[(($a_addr_i222)>>2)]=$60.x,HEAPF32[((($a_addr_i222)+(4))>>2)]=$60.y,HEAPF32[((($a_addr_i222)+(8))>>2)]=$60.z,HEAPF32[((($a_addr_i222)+(12))>>2)]=$60.w);
 (HEAPF32[(($b_addr_i223)>>2)]=$67.x,HEAPF32[((($b_addr_i223)+(4))>>2)]=$67.y,HEAPF32[((($b_addr_i223)+(8))>>2)]=$67.z,HEAPF32[((($b_addr_i223)+(12))>>2)]=$67.w);
 var $68=float32x4(HEAPF32[(($a_addr_i222)>>2)],HEAPF32[((($a_addr_i222)+(4))>>2)],HEAPF32[((($a_addr_i222)+(8))>>2)],HEAPF32[((($a_addr_i222)+(12))>>2)]);
 var $69=float32x4(HEAPF32[(($b_addr_i223)>>2)],HEAPF32[((($b_addr_i223)+(4))>>2)],HEAPF32[((($b_addr_i223)+(8))>>2)],HEAPF32[((($b_addr_i223)+(12))>>2)]);
 var $mul_i224=SIMD.float32x4.mul($68,$69);
 var $70=float32x4(HEAPF32[(($diry_addr)>>2)],HEAPF32[((($diry_addr)+(4))>>2)],HEAPF32[((($diry_addr)+(8))>>2)],HEAPF32[((($diry_addr)+(12))>>2)]);
 var $71=$plane_addr;
 var $n25=(($71+12)|0);
 var $y26=(($n25+4)|0);
 var $72=HEAPF32[(($y26)>>2)];
 $w_addr_i228=$72;
 var $73=$w_addr_i228;
 var $vecinit_i230=SIMD.float32x4.withX(float32x4.splat(0),$73);
 var $74=$w_addr_i228;
 var $vecinit1_i231=SIMD.float32x4.withY($vecinit_i230,$74);
 var $75=$w_addr_i228;
 var $vecinit2_i232=SIMD.float32x4.withZ($vecinit1_i231,$75);
 var $76=$w_addr_i228;
 var $vecinit3_i233=SIMD.float32x4.withW($vecinit2_i232,$76);
 (HEAPF32[(($_compoundliteral_i229)>>2)]=$vecinit3_i233.x,HEAPF32[((($_compoundliteral_i229)+(4))>>2)]=$vecinit3_i233.y,HEAPF32[((($_compoundliteral_i229)+(8))>>2)]=$vecinit3_i233.z,HEAPF32[((($_compoundliteral_i229)+(12))>>2)]=$vecinit3_i233.w);
 var $77=float32x4(HEAPF32[(($_compoundliteral_i229)>>2)],HEAPF32[((($_compoundliteral_i229)+(4))>>2)],HEAPF32[((($_compoundliteral_i229)+(8))>>2)],HEAPF32[((($_compoundliteral_i229)+(12))>>2)]);
 (HEAPF32[(($a_addr_i237)>>2)]=$70.x,HEAPF32[((($a_addr_i237)+(4))>>2)]=$70.y,HEAPF32[((($a_addr_i237)+(8))>>2)]=$70.z,HEAPF32[((($a_addr_i237)+(12))>>2)]=$70.w);
 (HEAPF32[(($b_addr_i238)>>2)]=$77.x,HEAPF32[((($b_addr_i238)+(4))>>2)]=$77.y,HEAPF32[((($b_addr_i238)+(8))>>2)]=$77.z,HEAPF32[((($b_addr_i238)+(12))>>2)]=$77.w);
 var $78=float32x4(HEAPF32[(($a_addr_i237)>>2)],HEAPF32[((($a_addr_i237)+(4))>>2)],HEAPF32[((($a_addr_i237)+(8))>>2)],HEAPF32[((($a_addr_i237)+(12))>>2)]);
 var $79=float32x4(HEAPF32[(($b_addr_i238)>>2)],HEAPF32[((($b_addr_i238)+(4))>>2)],HEAPF32[((($b_addr_i238)+(8))>>2)],HEAPF32[((($b_addr_i238)+(12))>>2)]);
 var $mul_i239=SIMD.float32x4.mul($78,$79);
 var $80=float32x4(HEAPF32[(($dirz_addr)>>2)],HEAPF32[((($dirz_addr)+(4))>>2)],HEAPF32[((($dirz_addr)+(8))>>2)],HEAPF32[((($dirz_addr)+(12))>>2)]);
 var $81=$plane_addr;
 var $n29=(($81+12)|0);
 var $z30=(($n29+8)|0);
 var $82=HEAPF32[(($z30)>>2)];
 $w_addr_i249=$82;
 var $83=$w_addr_i249;
 var $vecinit_i251=SIMD.float32x4.withX(float32x4.splat(0),$83);
 var $84=$w_addr_i249;
 var $vecinit1_i252=SIMD.float32x4.withY($vecinit_i251,$84);
 var $85=$w_addr_i249;
 var $vecinit2_i253=SIMD.float32x4.withZ($vecinit1_i252,$85);
 var $86=$w_addr_i249;
 var $vecinit3_i254=SIMD.float32x4.withW($vecinit2_i253,$86);
 (HEAPF32[(($_compoundliteral_i250)>>2)]=$vecinit3_i254.x,HEAPF32[((($_compoundliteral_i250)+(4))>>2)]=$vecinit3_i254.y,HEAPF32[((($_compoundliteral_i250)+(8))>>2)]=$vecinit3_i254.z,HEAPF32[((($_compoundliteral_i250)+(12))>>2)]=$vecinit3_i254.w);
 var $87=float32x4(HEAPF32[(($_compoundliteral_i250)>>2)],HEAPF32[((($_compoundliteral_i250)+(4))>>2)],HEAPF32[((($_compoundliteral_i250)+(8))>>2)],HEAPF32[((($_compoundliteral_i250)+(12))>>2)]);
 (HEAPF32[(($a_addr_i258)>>2)]=$80.x,HEAPF32[((($a_addr_i258)+(4))>>2)]=$80.y,HEAPF32[((($a_addr_i258)+(8))>>2)]=$80.z,HEAPF32[((($a_addr_i258)+(12))>>2)]=$80.w);
 (HEAPF32[(($b_addr_i259)>>2)]=$87.x,HEAPF32[((($b_addr_i259)+(4))>>2)]=$87.y,HEAPF32[((($b_addr_i259)+(8))>>2)]=$87.z,HEAPF32[((($b_addr_i259)+(12))>>2)]=$87.w);
 var $88=float32x4(HEAPF32[(($a_addr_i258)>>2)],HEAPF32[((($a_addr_i258)+(4))>>2)],HEAPF32[((($a_addr_i258)+(8))>>2)],HEAPF32[((($a_addr_i258)+(12))>>2)]);
 var $89=float32x4(HEAPF32[(($b_addr_i259)>>2)],HEAPF32[((($b_addr_i259)+(4))>>2)],HEAPF32[((($b_addr_i259)+(8))>>2)],HEAPF32[((($b_addr_i259)+(12))>>2)]);
 var $mul_i260=SIMD.float32x4.mul($88,$89);
 (HEAPF32[(($a_addr_i264)>>2)]=$mul_i239.x,HEAPF32[((($a_addr_i264)+(4))>>2)]=$mul_i239.y,HEAPF32[((($a_addr_i264)+(8))>>2)]=$mul_i239.z,HEAPF32[((($a_addr_i264)+(12))>>2)]=$mul_i239.w);
 (HEAPF32[(($b_addr_i265)>>2)]=$mul_i260.x,HEAPF32[((($b_addr_i265)+(4))>>2)]=$mul_i260.y,HEAPF32[((($b_addr_i265)+(8))>>2)]=$mul_i260.z,HEAPF32[((($b_addr_i265)+(12))>>2)]=$mul_i260.w);
 var $90=float32x4(HEAPF32[(($a_addr_i264)>>2)],HEAPF32[((($a_addr_i264)+(4))>>2)],HEAPF32[((($a_addr_i264)+(8))>>2)],HEAPF32[((($a_addr_i264)+(12))>>2)]);
 var $91=float32x4(HEAPF32[(($b_addr_i265)>>2)],HEAPF32[((($b_addr_i265)+(4))>>2)],HEAPF32[((($b_addr_i265)+(8))>>2)],HEAPF32[((($b_addr_i265)+(12))>>2)]);
 var $add_i266=SIMD.float32x4.add($90,$91);
 (HEAPF32[(($a_addr_i276)>>2)]=$mul_i224.x,HEAPF32[((($a_addr_i276)+(4))>>2)]=$mul_i224.y,HEAPF32[((($a_addr_i276)+(8))>>2)]=$mul_i224.z,HEAPF32[((($a_addr_i276)+(12))>>2)]=$mul_i224.w);
 (HEAPF32[(($b_addr_i277)>>2)]=$add_i266.x,HEAPF32[((($b_addr_i277)+(4))>>2)]=$add_i266.y,HEAPF32[((($b_addr_i277)+(8))>>2)]=$add_i266.z,HEAPF32[((($b_addr_i277)+(12))>>2)]=$add_i266.w);
 var $92=float32x4(HEAPF32[(($a_addr_i276)>>2)],HEAPF32[((($a_addr_i276)+(4))>>2)],HEAPF32[((($a_addr_i276)+(8))>>2)],HEAPF32[((($a_addr_i276)+(12))>>2)]);
 var $93=float32x4(HEAPF32[(($b_addr_i277)>>2)],HEAPF32[((($b_addr_i277)+(4))>>2)],HEAPF32[((($b_addr_i277)+(8))>>2)],HEAPF32[((($b_addr_i277)+(12))>>2)]);
 var $add_i278=SIMD.float32x4.add($92,$93);
 (HEAPF32[(($v)>>2)]=$add_i278.x,HEAPF32[((($v)+(4))>>2)]=$add_i278.y,HEAPF32[((($v)+(8))>>2)]=$add_i278.z,HEAPF32[((($v)+(12))>>2)]=$add_i278.w);
 $w_addr_i282=-2147483648;
 var $94=$w_addr_i282;
 var $vecinit_i284=SIMD.int32x4.withX(int32x4.splat(0),$94);
 var $95=$w_addr_i282;
 var $vecinit1_i285=SIMD.int32x4.withY($vecinit_i284,$95);
 var $96=$w_addr_i282;
 var $vecinit2_i286=SIMD.int32x4.withZ($vecinit1_i285,$96);
 var $97=$w_addr_i282;
 var $vecinit3_i287=SIMD.int32x4.withW($vecinit2_i286,$97);
 (HEAP32[(($_compoundliteral_i283)>>2)]=$vecinit3_i287.x,HEAP32[((($_compoundliteral_i283)+(4))>>2)]=$vecinit3_i287.y,HEAP32[((($_compoundliteral_i283)+(8))>>2)]=$vecinit3_i287.z,HEAP32[((($_compoundliteral_i283)+(12))>>2)]=$vecinit3_i287.w);
 var $98=int32x4(HEAP32[(($_compoundliteral_i283)>>2)],HEAP32[((($_compoundliteral_i283)+(4))>>2)],HEAP32[((($_compoundliteral_i283)+(8))>>2)],HEAP32[((($_compoundliteral_i283)+(12))>>2)]);
 (HEAP32[(($a_addr_i291)>>2)]=$98.x,HEAP32[((($a_addr_i291)+(4))>>2)]=$98.y,HEAP32[((($a_addr_i291)+(8))>>2)]=$98.z,HEAP32[((($a_addr_i291)+(12))>>2)]=$98.w);
 var $99=int32x4(HEAP32[(($a_addr_i291)>>2)],HEAP32[((($a_addr_i291)+(4))>>2)],HEAP32[((($a_addr_i291)+(8))>>2)],HEAP32[((($a_addr_i291)+(12))>>2)]);
 var $call_i292=SIMD.int32x4.bitsToFloat32x4($99);
 var $100=float32x4(HEAPF32[(($v)>>2)],HEAPF32[((($v)+(4))>>2)],HEAPF32[((($v)+(8))>>2)],HEAPF32[((($v)+(12))>>2)]);
 (HEAPF32[(($a_addr_i293)>>2)]=$call_i292.x,HEAPF32[((($a_addr_i293)+(4))>>2)]=$call_i292.y,HEAPF32[((($a_addr_i293)+(8))>>2)]=$call_i292.z,HEAPF32[((($a_addr_i293)+(12))>>2)]=$call_i292.w);
 (HEAPF32[(($b_addr_i294)>>2)]=$100.x,HEAPF32[((($b_addr_i294)+(4))>>2)]=$100.y,HEAPF32[((($b_addr_i294)+(8))>>2)]=$100.z,HEAPF32[((($b_addr_i294)+(12))>>2)]=$100.w);
 var $101=float32x4(HEAPF32[(($a_addr_i293)>>2)],HEAPF32[((($a_addr_i293)+(4))>>2)],HEAPF32[((($a_addr_i293)+(8))>>2)],HEAPF32[((($a_addr_i293)+(12))>>2)]);
 var $102=float32x4(HEAPF32[(($b_addr_i294)>>2)],HEAPF32[((($b_addr_i294)+(4))>>2)],HEAPF32[((($b_addr_i294)+(8))>>2)],HEAPF32[((($b_addr_i294)+(12))>>2)]);
 var $call_i295=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($101)), SIMD.float32x4.bitsToInt32x4($102)));
 $w_addr_i296=9.99999983775159e-18;
 var $103=$w_addr_i296;
 var $vecinit_i298=SIMD.float32x4.withX(float32x4.splat(0),$103);
 var $104=$w_addr_i296;
 var $vecinit1_i299=SIMD.float32x4.withY($vecinit_i298,$104);
 var $105=$w_addr_i296;
 var $vecinit2_i300=SIMD.float32x4.withZ($vecinit1_i299,$105);
 var $106=$w_addr_i296;
 var $vecinit3_i301=SIMD.float32x4.withW($vecinit2_i300,$106);
 (HEAPF32[(($_compoundliteral_i297)>>2)]=$vecinit3_i301.x,HEAPF32[((($_compoundliteral_i297)+(4))>>2)]=$vecinit3_i301.y,HEAPF32[((($_compoundliteral_i297)+(8))>>2)]=$vecinit3_i301.z,HEAPF32[((($_compoundliteral_i297)+(12))>>2)]=$vecinit3_i301.w);
 var $107=float32x4(HEAPF32[(($_compoundliteral_i297)>>2)],HEAPF32[((($_compoundliteral_i297)+(4))>>2)],HEAPF32[((($_compoundliteral_i297)+(8))>>2)],HEAPF32[((($_compoundliteral_i297)+(12))>>2)]);
 (HEAPF32[(($a_addr_i305)>>2)]=$call_i295.x,HEAPF32[((($a_addr_i305)+(4))>>2)]=$call_i295.y,HEAPF32[((($a_addr_i305)+(8))>>2)]=$call_i295.z,HEAPF32[((($a_addr_i305)+(12))>>2)]=$call_i295.w);
 (HEAPF32[(($b_addr_i306)>>2)]=$107.x,HEAPF32[((($b_addr_i306)+(4))>>2)]=$107.y,HEAPF32[((($b_addr_i306)+(8))>>2)]=$107.z,HEAPF32[((($b_addr_i306)+(12))>>2)]=$107.w);
 var $108=float32x4(HEAPF32[(($a_addr_i305)>>2)],HEAPF32[((($a_addr_i305)+(4))>>2)],HEAPF32[((($a_addr_i305)+(8))>>2)],HEAPF32[((($a_addr_i305)+(12))>>2)]);
 var $109=float32x4(HEAPF32[(($b_addr_i306)>>2)],HEAPF32[((($b_addr_i306)+(4))>>2)],HEAPF32[((($b_addr_i306)+(8))>>2)],HEAPF32[((($b_addr_i306)+(12))>>2)]);
 var $call_i307=SIMD.int32x4.bitsToFloat32x4(SIMD.float32x4.greaterThan($108, $109));
 (HEAPF32[(($cond1)>>2)]=$call_i307.x,HEAPF32[((($cond1)+(4))>>2)]=$call_i307.y,HEAPF32[((($cond1)+(8))>>2)]=$call_i307.z,HEAPF32[((($cond1)+(12))>>2)]=$call_i307.w);
 var $110=float32x4(HEAPF32[(($orgx_addr)>>2)],HEAPF32[((($orgx_addr)+(4))>>2)],HEAPF32[((($orgx_addr)+(8))>>2)],HEAPF32[((($orgx_addr)+(12))>>2)]);
 var $111=$plane_addr;
 var $n40=(($111+12)|0);
 var $x41=(($n40)|0);
 var $112=HEAPF32[(($x41)>>2)];
 $w_addr_i308=$112;
 var $113=$w_addr_i308;
 var $vecinit_i310=SIMD.float32x4.withX(float32x4.splat(0),$113);
 var $114=$w_addr_i308;
 var $vecinit1_i311=SIMD.float32x4.withY($vecinit_i310,$114);
 var $115=$w_addr_i308;
 var $vecinit2_i312=SIMD.float32x4.withZ($vecinit1_i311,$115);
 var $116=$w_addr_i308;
 var $vecinit3_i313=SIMD.float32x4.withW($vecinit2_i312,$116);
 (HEAPF32[(($_compoundliteral_i309)>>2)]=$vecinit3_i313.x,HEAPF32[((($_compoundliteral_i309)+(4))>>2)]=$vecinit3_i313.y,HEAPF32[((($_compoundliteral_i309)+(8))>>2)]=$vecinit3_i313.z,HEAPF32[((($_compoundliteral_i309)+(12))>>2)]=$vecinit3_i313.w);
 var $117=float32x4(HEAPF32[(($_compoundliteral_i309)>>2)],HEAPF32[((($_compoundliteral_i309)+(4))>>2)],HEAPF32[((($_compoundliteral_i309)+(8))>>2)],HEAPF32[((($_compoundliteral_i309)+(12))>>2)]);
 (HEAPF32[(($a_addr_i316)>>2)]=$110.x,HEAPF32[((($a_addr_i316)+(4))>>2)]=$110.y,HEAPF32[((($a_addr_i316)+(8))>>2)]=$110.z,HEAPF32[((($a_addr_i316)+(12))>>2)]=$110.w);
 (HEAPF32[(($b_addr_i317)>>2)]=$117.x,HEAPF32[((($b_addr_i317)+(4))>>2)]=$117.y,HEAPF32[((($b_addr_i317)+(8))>>2)]=$117.z,HEAPF32[((($b_addr_i317)+(12))>>2)]=$117.w);
 var $118=float32x4(HEAPF32[(($a_addr_i316)>>2)],HEAPF32[((($a_addr_i316)+(4))>>2)],HEAPF32[((($a_addr_i316)+(8))>>2)],HEAPF32[((($a_addr_i316)+(12))>>2)]);
 var $119=float32x4(HEAPF32[(($b_addr_i317)>>2)],HEAPF32[((($b_addr_i317)+(4))>>2)],HEAPF32[((($b_addr_i317)+(8))>>2)],HEAPF32[((($b_addr_i317)+(12))>>2)]);
 var $mul_i318=SIMD.float32x4.mul($118,$119);
 var $120=float32x4(HEAPF32[(($orgy_addr)>>2)],HEAPF32[((($orgy_addr)+(4))>>2)],HEAPF32[((($orgy_addr)+(8))>>2)],HEAPF32[((($orgy_addr)+(12))>>2)]);
 var $121=$plane_addr;
 var $n44=(($121+12)|0);
 var $y45=(($n44+4)|0);
 var $122=HEAPF32[(($y45)>>2)];
 $w_addr_i322=$122;
 var $123=$w_addr_i322;
 var $vecinit_i324=SIMD.float32x4.withX(float32x4.splat(0),$123);
 var $124=$w_addr_i322;
 var $vecinit1_i325=SIMD.float32x4.withY($vecinit_i324,$124);
 var $125=$w_addr_i322;
 var $vecinit2_i326=SIMD.float32x4.withZ($vecinit1_i325,$125);
 var $126=$w_addr_i322;
 var $vecinit3_i327=SIMD.float32x4.withW($vecinit2_i326,$126);
 (HEAPF32[(($_compoundliteral_i323)>>2)]=$vecinit3_i327.x,HEAPF32[((($_compoundliteral_i323)+(4))>>2)]=$vecinit3_i327.y,HEAPF32[((($_compoundliteral_i323)+(8))>>2)]=$vecinit3_i327.z,HEAPF32[((($_compoundliteral_i323)+(12))>>2)]=$vecinit3_i327.w);
 var $127=float32x4(HEAPF32[(($_compoundliteral_i323)>>2)],HEAPF32[((($_compoundliteral_i323)+(4))>>2)],HEAPF32[((($_compoundliteral_i323)+(8))>>2)],HEAPF32[((($_compoundliteral_i323)+(12))>>2)]);
 (HEAPF32[(($a_addr_i331)>>2)]=$120.x,HEAPF32[((($a_addr_i331)+(4))>>2)]=$120.y,HEAPF32[((($a_addr_i331)+(8))>>2)]=$120.z,HEAPF32[((($a_addr_i331)+(12))>>2)]=$120.w);
 (HEAPF32[(($b_addr_i332)>>2)]=$127.x,HEAPF32[((($b_addr_i332)+(4))>>2)]=$127.y,HEAPF32[((($b_addr_i332)+(8))>>2)]=$127.z,HEAPF32[((($b_addr_i332)+(12))>>2)]=$127.w);
 var $128=float32x4(HEAPF32[(($a_addr_i331)>>2)],HEAPF32[((($a_addr_i331)+(4))>>2)],HEAPF32[((($a_addr_i331)+(8))>>2)],HEAPF32[((($a_addr_i331)+(12))>>2)]);
 var $129=float32x4(HEAPF32[(($b_addr_i332)>>2)],HEAPF32[((($b_addr_i332)+(4))>>2)],HEAPF32[((($b_addr_i332)+(8))>>2)],HEAPF32[((($b_addr_i332)+(12))>>2)]);
 var $mul_i333=SIMD.float32x4.mul($128,$129);
 var $130=float32x4(HEAPF32[(($orgz_addr)>>2)],HEAPF32[((($orgz_addr)+(4))>>2)],HEAPF32[((($orgz_addr)+(8))>>2)],HEAPF32[((($orgz_addr)+(12))>>2)]);
 var $131=$plane_addr;
 var $n48=(($131+12)|0);
 var $z49=(($n48+8)|0);
 var $132=HEAPF32[(($z49)>>2)];
 $w_addr_i337=$132;
 var $133=$w_addr_i337;
 var $vecinit_i339=SIMD.float32x4.withX(float32x4.splat(0),$133);
 var $134=$w_addr_i337;
 var $vecinit1_i340=SIMD.float32x4.withY($vecinit_i339,$134);
 var $135=$w_addr_i337;
 var $vecinit2_i341=SIMD.float32x4.withZ($vecinit1_i340,$135);
 var $136=$w_addr_i337;
 var $vecinit3_i342=SIMD.float32x4.withW($vecinit2_i341,$136);
 (HEAPF32[(($_compoundliteral_i338)>>2)]=$vecinit3_i342.x,HEAPF32[((($_compoundliteral_i338)+(4))>>2)]=$vecinit3_i342.y,HEAPF32[((($_compoundliteral_i338)+(8))>>2)]=$vecinit3_i342.z,HEAPF32[((($_compoundliteral_i338)+(12))>>2)]=$vecinit3_i342.w);
 var $137=float32x4(HEAPF32[(($_compoundliteral_i338)>>2)],HEAPF32[((($_compoundliteral_i338)+(4))>>2)],HEAPF32[((($_compoundliteral_i338)+(8))>>2)],HEAPF32[((($_compoundliteral_i338)+(12))>>2)]);
 (HEAPF32[(($a_addr_i352)>>2)]=$130.x,HEAPF32[((($a_addr_i352)+(4))>>2)]=$130.y,HEAPF32[((($a_addr_i352)+(8))>>2)]=$130.z,HEAPF32[((($a_addr_i352)+(12))>>2)]=$130.w);
 (HEAPF32[(($b_addr_i353)>>2)]=$137.x,HEAPF32[((($b_addr_i353)+(4))>>2)]=$137.y,HEAPF32[((($b_addr_i353)+(8))>>2)]=$137.z,HEAPF32[((($b_addr_i353)+(12))>>2)]=$137.w);
 var $138=float32x4(HEAPF32[(($a_addr_i352)>>2)],HEAPF32[((($a_addr_i352)+(4))>>2)],HEAPF32[((($a_addr_i352)+(8))>>2)],HEAPF32[((($a_addr_i352)+(12))>>2)]);
 var $139=float32x4(HEAPF32[(($b_addr_i353)>>2)],HEAPF32[((($b_addr_i353)+(4))>>2)],HEAPF32[((($b_addr_i353)+(8))>>2)],HEAPF32[((($b_addr_i353)+(12))>>2)]);
 var $mul_i354=SIMD.float32x4.mul($138,$139);
 (HEAPF32[(($a_addr_i360)>>2)]=$mul_i333.x,HEAPF32[((($a_addr_i360)+(4))>>2)]=$mul_i333.y,HEAPF32[((($a_addr_i360)+(8))>>2)]=$mul_i333.z,HEAPF32[((($a_addr_i360)+(12))>>2)]=$mul_i333.w);
 (HEAPF32[(($b_addr_i361)>>2)]=$mul_i354.x,HEAPF32[((($b_addr_i361)+(4))>>2)]=$mul_i354.y,HEAPF32[((($b_addr_i361)+(8))>>2)]=$mul_i354.z,HEAPF32[((($b_addr_i361)+(12))>>2)]=$mul_i354.w);
 var $140=float32x4(HEAPF32[(($a_addr_i360)>>2)],HEAPF32[((($a_addr_i360)+(4))>>2)],HEAPF32[((($a_addr_i360)+(8))>>2)],HEAPF32[((($a_addr_i360)+(12))>>2)]);
 var $141=float32x4(HEAPF32[(($b_addr_i361)>>2)],HEAPF32[((($b_addr_i361)+(4))>>2)],HEAPF32[((($b_addr_i361)+(8))>>2)],HEAPF32[((($b_addr_i361)+(12))>>2)]);
 var $add_i362=SIMD.float32x4.add($140,$141);
 (HEAPF32[(($a_addr_i365)>>2)]=$mul_i318.x,HEAPF32[((($a_addr_i365)+(4))>>2)]=$mul_i318.y,HEAPF32[((($a_addr_i365)+(8))>>2)]=$mul_i318.z,HEAPF32[((($a_addr_i365)+(12))>>2)]=$mul_i318.w);
 (HEAPF32[(($b_addr_i366)>>2)]=$add_i362.x,HEAPF32[((($b_addr_i366)+(4))>>2)]=$add_i362.y,HEAPF32[((($b_addr_i366)+(8))>>2)]=$add_i362.z,HEAPF32[((($b_addr_i366)+(12))>>2)]=$add_i362.w);
 var $142=float32x4(HEAPF32[(($a_addr_i365)>>2)],HEAPF32[((($a_addr_i365)+(4))>>2)],HEAPF32[((($a_addr_i365)+(8))>>2)],HEAPF32[((($a_addr_i365)+(12))>>2)]);
 var $143=float32x4(HEAPF32[(($b_addr_i366)>>2)],HEAPF32[((($b_addr_i366)+(4))>>2)],HEAPF32[((($b_addr_i366)+(8))>>2)],HEAPF32[((($b_addr_i366)+(12))>>2)]);
 var $add_i367=SIMD.float32x4.add($142,$143);
 (HEAPF32[(($dp)>>2)]=$add_i367.x,HEAPF32[((($dp)+(4))>>2)]=$add_i367.y,HEAPF32[((($dp)+(8))>>2)]=$add_i367.z,HEAPF32[((($dp)+(12))>>2)]=$add_i367.w);
 var $144=float32x4(HEAPF32[(($cond1)>>2)],HEAPF32[((($cond1)+(4))>>2)],HEAPF32[((($cond1)+(8))>>2)],HEAPF32[((($cond1)+(12))>>2)]);
 var $145=float32x4(HEAPF32[(($dp)>>2)],HEAPF32[((($dp)+(4))>>2)],HEAPF32[((($dp)+(8))>>2)],HEAPF32[((($dp)+(12))>>2)]);
 var $146=float32x4(HEAPF32[(($d)>>2)],HEAPF32[((($d)+(4))>>2)],HEAPF32[((($d)+(8))>>2)],HEAPF32[((($d)+(12))>>2)]);
 (HEAPF32[(($a_addr_i374)>>2)]=$145.x,HEAPF32[((($a_addr_i374)+(4))>>2)]=$145.y,HEAPF32[((($a_addr_i374)+(8))>>2)]=$145.z,HEAPF32[((($a_addr_i374)+(12))>>2)]=$145.w);
 (HEAPF32[(($b_addr_i375)>>2)]=$146.x,HEAPF32[((($b_addr_i375)+(4))>>2)]=$146.y,HEAPF32[((($b_addr_i375)+(8))>>2)]=$146.z,HEAPF32[((($b_addr_i375)+(12))>>2)]=$146.w);
 var $147=float32x4(HEAPF32[(($a_addr_i374)>>2)],HEAPF32[((($a_addr_i374)+(4))>>2)],HEAPF32[((($a_addr_i374)+(8))>>2)],HEAPF32[((($a_addr_i374)+(12))>>2)]);
 var $148=float32x4(HEAPF32[(($b_addr_i375)>>2)],HEAPF32[((($b_addr_i375)+(4))>>2)],HEAPF32[((($b_addr_i375)+(8))>>2)],HEAPF32[((($b_addr_i375)+(12))>>2)]);
 var $add_i376=SIMD.float32x4.add($147,$148);
 $w_addr_i368=-2147483648;
 var $149=$w_addr_i368;
 var $vecinit_i370=SIMD.int32x4.withX(int32x4.splat(0),$149);
 var $150=$w_addr_i368;
 var $vecinit1_i371=SIMD.int32x4.withY($vecinit_i370,$150);
 var $151=$w_addr_i368;
 var $vecinit2_i372=SIMD.int32x4.withZ($vecinit1_i371,$151);
 var $152=$w_addr_i368;
 var $vecinit3_i373=SIMD.int32x4.withW($vecinit2_i372,$152);
 (HEAP32[(($_compoundliteral_i369)>>2)]=$vecinit3_i373.x,HEAP32[((($_compoundliteral_i369)+(4))>>2)]=$vecinit3_i373.y,HEAP32[((($_compoundliteral_i369)+(8))>>2)]=$vecinit3_i373.z,HEAP32[((($_compoundliteral_i369)+(12))>>2)]=$vecinit3_i373.w);
 var $153=int32x4(HEAP32[(($_compoundliteral_i369)>>2)],HEAP32[((($_compoundliteral_i369)+(4))>>2)],HEAP32[((($_compoundliteral_i369)+(8))>>2)],HEAP32[((($_compoundliteral_i369)+(12))>>2)]);
 (HEAP32[(($a_addr_i363)>>2)]=$153.x,HEAP32[((($a_addr_i363)+(4))>>2)]=$153.y,HEAP32[((($a_addr_i363)+(8))>>2)]=$153.z,HEAP32[((($a_addr_i363)+(12))>>2)]=$153.w);
 var $154=int32x4(HEAP32[(($a_addr_i363)>>2)],HEAP32[((($a_addr_i363)+(4))>>2)],HEAP32[((($a_addr_i363)+(8))>>2)],HEAP32[((($a_addr_i363)+(12))>>2)]);
 var $call_i364=SIMD.int32x4.bitsToFloat32x4($154);
 (HEAPF32[(($a_addr_i357)>>2)]=$add_i376.x,HEAPF32[((($a_addr_i357)+(4))>>2)]=$add_i376.y,HEAPF32[((($a_addr_i357)+(8))>>2)]=$add_i376.z,HEAPF32[((($a_addr_i357)+(12))>>2)]=$add_i376.w);
 (HEAPF32[(($b_addr_i358)>>2)]=$call_i364.x,HEAPF32[((($b_addr_i358)+(4))>>2)]=$call_i364.y,HEAPF32[((($b_addr_i358)+(8))>>2)]=$call_i364.z,HEAPF32[((($b_addr_i358)+(12))>>2)]=$call_i364.w);
 var $155=float32x4(HEAPF32[(($a_addr_i357)>>2)],HEAPF32[((($a_addr_i357)+(4))>>2)],HEAPF32[((($a_addr_i357)+(8))>>2)],HEAPF32[((($a_addr_i357)+(12))>>2)]);
 var $156=float32x4(HEAPF32[(($b_addr_i358)>>2)],HEAPF32[((($b_addr_i358)+(4))>>2)],HEAPF32[((($b_addr_i358)+(8))>>2)],HEAPF32[((($b_addr_i358)+(12))>>2)]);
 var $call_i359=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.xor(SIMD.float32x4.bitsToInt32x4($155), SIMD.float32x4.bitsToInt32x4($156)));
 var $157=float32x4(HEAPF32[(($v)>>2)],HEAPF32[((($v)+(4))>>2)],HEAPF32[((($v)+(8))>>2)],HEAPF32[((($v)+(12))>>2)]);
 (HEAPF32[(($a_addr_i355)>>2)]=$call_i359.x,HEAPF32[((($a_addr_i355)+(4))>>2)]=$call_i359.y,HEAPF32[((($a_addr_i355)+(8))>>2)]=$call_i359.z,HEAPF32[((($a_addr_i355)+(12))>>2)]=$call_i359.w);
 (HEAPF32[(($b_addr_i356)>>2)]=$157.x,HEAPF32[((($b_addr_i356)+(4))>>2)]=$157.y,HEAPF32[((($b_addr_i356)+(8))>>2)]=$157.z,HEAPF32[((($b_addr_i356)+(12))>>2)]=$157.w);
 var $158=float32x4(HEAPF32[(($a_addr_i355)>>2)],HEAPF32[((($a_addr_i355)+(4))>>2)],HEAPF32[((($a_addr_i355)+(8))>>2)],HEAPF32[((($a_addr_i355)+(12))>>2)]);
 var $159=float32x4(HEAPF32[(($b_addr_i356)>>2)],HEAPF32[((($b_addr_i356)+(4))>>2)],HEAPF32[((($b_addr_i356)+(8))>>2)],HEAPF32[((($b_addr_i356)+(12))>>2)]);
 var $div_i=SIMD.float32x4.div($158,$159);
 (HEAPF32[(($a_addr_i349)>>2)]=$144.x,HEAPF32[((($a_addr_i349)+(4))>>2)]=$144.y,HEAPF32[((($a_addr_i349)+(8))>>2)]=$144.z,HEAPF32[((($a_addr_i349)+(12))>>2)]=$144.w);
 (HEAPF32[(($b_addr_i350)>>2)]=$div_i.x,HEAPF32[((($b_addr_i350)+(4))>>2)]=$div_i.y,HEAPF32[((($b_addr_i350)+(8))>>2)]=$div_i.z,HEAPF32[((($b_addr_i350)+(12))>>2)]=$div_i.w);
 var $160=float32x4(HEAPF32[(($a_addr_i349)>>2)],HEAPF32[((($a_addr_i349)+(4))>>2)],HEAPF32[((($a_addr_i349)+(8))>>2)],HEAPF32[((($a_addr_i349)+(12))>>2)]);
 var $161=float32x4(HEAPF32[(($b_addr_i350)>>2)],HEAPF32[((($b_addr_i350)+(4))>>2)],HEAPF32[((($b_addr_i350)+(8))>>2)],HEAPF32[((($b_addr_i350)+(12))>>2)]);
 var $call_i351=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($160), SIMD.float32x4.bitsToInt32x4($161)));
 (HEAPF32[(($t2)>>2)]=$call_i351.x,HEAPF32[((($t2)+(4))>>2)]=$call_i351.y,HEAPF32[((($t2)+(8))>>2)]=$call_i351.z,HEAPF32[((($t2)+(12))>>2)]=$call_i351.w);
 var $162=float32x4(HEAPF32[(($t2)>>2)],HEAPF32[((($t2)+(4))>>2)],HEAPF32[((($t2)+(8))>>2)],HEAPF32[((($t2)+(12))>>2)]);
 $w_addr_i343=0;
 var $163=$w_addr_i343;
 var $vecinit_i345=SIMD.float32x4.withX(float32x4.splat(0),$163);
 var $164=$w_addr_i343;
 var $vecinit1_i346=SIMD.float32x4.withY($vecinit_i345,$164);
 var $165=$w_addr_i343;
 var $vecinit2_i347=SIMD.float32x4.withZ($vecinit1_i346,$165);
 var $166=$w_addr_i343;
 var $vecinit3_i348=SIMD.float32x4.withW($vecinit2_i347,$166);
 (HEAPF32[(($_compoundliteral_i344)>>2)]=$vecinit3_i348.x,HEAPF32[((($_compoundliteral_i344)+(4))>>2)]=$vecinit3_i348.y,HEAPF32[((($_compoundliteral_i344)+(8))>>2)]=$vecinit3_i348.z,HEAPF32[((($_compoundliteral_i344)+(12))>>2)]=$vecinit3_i348.w);
 var $167=float32x4(HEAPF32[(($_compoundliteral_i344)>>2)],HEAPF32[((($_compoundliteral_i344)+(4))>>2)],HEAPF32[((($_compoundliteral_i344)+(8))>>2)],HEAPF32[((($_compoundliteral_i344)+(12))>>2)]);
 (HEAPF32[(($a_addr_i334)>>2)]=$162.x,HEAPF32[((($a_addr_i334)+(4))>>2)]=$162.y,HEAPF32[((($a_addr_i334)+(8))>>2)]=$162.z,HEAPF32[((($a_addr_i334)+(12))>>2)]=$162.w);
 (HEAPF32[(($b_addr_i335)>>2)]=$167.x,HEAPF32[((($b_addr_i335)+(4))>>2)]=$167.y,HEAPF32[((($b_addr_i335)+(8))>>2)]=$167.z,HEAPF32[((($b_addr_i335)+(12))>>2)]=$167.w);
 var $168=float32x4(HEAPF32[(($a_addr_i334)>>2)],HEAPF32[((($a_addr_i334)+(4))>>2)],HEAPF32[((($a_addr_i334)+(8))>>2)],HEAPF32[((($a_addr_i334)+(12))>>2)]);
 var $169=float32x4(HEAPF32[(($b_addr_i335)>>2)],HEAPF32[((($b_addr_i335)+(4))>>2)],HEAPF32[((($b_addr_i335)+(8))>>2)],HEAPF32[((($b_addr_i335)+(12))>>2)]);
 var $call_i336=SIMD.int32x4.bitsToFloat32x4(SIMD.float32x4.greaterThan($168, $169));
 var $170=float32x4(HEAPF32[(($t2)>>2)],HEAPF32[((($t2)+(4))>>2)],HEAPF32[((($t2)+(8))>>2)],HEAPF32[((($t2)+(12))>>2)]);
 var $171=$t_addr;
 var $172=float32x4(HEAPF32[(($171)>>2)],HEAPF32[((($171)+(4))>>2)],HEAPF32[((($171)+(8))>>2)],HEAPF32[((($171)+(12))>>2)]);
 (HEAPF32[(($a_addr_i328)>>2)]=$170.x,HEAPF32[((($a_addr_i328)+(4))>>2)]=$170.y,HEAPF32[((($a_addr_i328)+(8))>>2)]=$170.z,HEAPF32[((($a_addr_i328)+(12))>>2)]=$170.w);
 (HEAPF32[(($b_addr_i329)>>2)]=$172.x,HEAPF32[((($b_addr_i329)+(4))>>2)]=$172.y,HEAPF32[((($b_addr_i329)+(8))>>2)]=$172.z,HEAPF32[((($b_addr_i329)+(12))>>2)]=$172.w);
 var $173=float32x4(HEAPF32[(($a_addr_i328)>>2)],HEAPF32[((($a_addr_i328)+(4))>>2)],HEAPF32[((($a_addr_i328)+(8))>>2)],HEAPF32[((($a_addr_i328)+(12))>>2)]);
 var $174=float32x4(HEAPF32[(($b_addr_i329)>>2)],HEAPF32[((($b_addr_i329)+(4))>>2)],HEAPF32[((($b_addr_i329)+(8))>>2)],HEAPF32[((($b_addr_i329)+(12))>>2)]);
 var $call_i330=SIMD.int32x4.bitsToFloat32x4(SIMD.float32x4.lessThan($173, $174));
 (HEAPF32[(($a_addr_i319)>>2)]=$call_i336.x,HEAPF32[((($a_addr_i319)+(4))>>2)]=$call_i336.y,HEAPF32[((($a_addr_i319)+(8))>>2)]=$call_i336.z,HEAPF32[((($a_addr_i319)+(12))>>2)]=$call_i336.w);
 (HEAPF32[(($b_addr_i320)>>2)]=$call_i330.x,HEAPF32[((($b_addr_i320)+(4))>>2)]=$call_i330.y,HEAPF32[((($b_addr_i320)+(8))>>2)]=$call_i330.z,HEAPF32[((($b_addr_i320)+(12))>>2)]=$call_i330.w);
 var $175=float32x4(HEAPF32[(($a_addr_i319)>>2)],HEAPF32[((($a_addr_i319)+(4))>>2)],HEAPF32[((($a_addr_i319)+(8))>>2)],HEAPF32[((($a_addr_i319)+(12))>>2)]);
 var $176=float32x4(HEAPF32[(($b_addr_i320)>>2)],HEAPF32[((($b_addr_i320)+(4))>>2)],HEAPF32[((($b_addr_i320)+(8))>>2)],HEAPF32[((($b_addr_i320)+(12))>>2)]);
 var $call_i321=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($175), SIMD.float32x4.bitsToInt32x4($176)));
 (HEAPF32[(($cond2)>>2)]=$call_i321.x,HEAPF32[((($cond2)+(4))>>2)]=$call_i321.y,HEAPF32[((($cond2)+(8))>>2)]=$call_i321.z,HEAPF32[((($cond2)+(12))>>2)]=$call_i321.w);
 var $177=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 (HEAPF32[(($a_addr_i314)>>2)]=$177.x,HEAPF32[((($a_addr_i314)+(4))>>2)]=$177.y,HEAPF32[((($a_addr_i314)+(8))>>2)]=$177.z,HEAPF32[((($a_addr_i314)+(12))>>2)]=$177.w);
 var $178=float32x4(HEAPF32[(($a_addr_i314)>>2)],HEAPF32[((($a_addr_i314)+(4))>>2)],HEAPF32[((($a_addr_i314)+(8))>>2)],HEAPF32[((($a_addr_i314)+(12))>>2)]);
 var $call_i315=SIMD.float32x4.bitsToInt32x4($178).signMask;
 var $tobool=($call_i315|0)!=0;
 if($tobool){label=2;break;}else{label=3;break;}
 case 2: 
 var $179=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $180=float32x4(HEAPF32[(($t2)>>2)],HEAPF32[((($t2)+(4))>>2)],HEAPF32[((($t2)+(8))>>2)],HEAPF32[((($t2)+(12))>>2)]);
 (HEAPF32[(($a_addr_i302)>>2)]=$179.x,HEAPF32[((($a_addr_i302)+(4))>>2)]=$179.y,HEAPF32[((($a_addr_i302)+(8))>>2)]=$179.z,HEAPF32[((($a_addr_i302)+(12))>>2)]=$179.w);
 (HEAPF32[(($b_addr_i303)>>2)]=$180.x,HEAPF32[((($b_addr_i303)+(4))>>2)]=$180.y,HEAPF32[((($b_addr_i303)+(8))>>2)]=$180.z,HEAPF32[((($b_addr_i303)+(12))>>2)]=$180.w);
 var $181=float32x4(HEAPF32[(($a_addr_i302)>>2)],HEAPF32[((($a_addr_i302)+(4))>>2)],HEAPF32[((($a_addr_i302)+(8))>>2)],HEAPF32[((($a_addr_i302)+(12))>>2)]);
 var $182=float32x4(HEAPF32[(($b_addr_i303)>>2)],HEAPF32[((($b_addr_i303)+(4))>>2)],HEAPF32[((($b_addr_i303)+(8))>>2)],HEAPF32[((($b_addr_i303)+(12))>>2)]);
 var $call_i304=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($181), SIMD.float32x4.bitsToInt32x4($182)));
 var $183=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $184=$t_addr;
 var $185=float32x4(HEAPF32[(($184)>>2)],HEAPF32[((($184)+(4))>>2)],HEAPF32[((($184)+(8))>>2)],HEAPF32[((($184)+(12))>>2)]);
 (HEAPF32[(($a_addr_i288)>>2)]=$183.x,HEAPF32[((($a_addr_i288)+(4))>>2)]=$183.y,HEAPF32[((($a_addr_i288)+(8))>>2)]=$183.z,HEAPF32[((($a_addr_i288)+(12))>>2)]=$183.w);
 (HEAPF32[(($b_addr_i289)>>2)]=$185.x,HEAPF32[((($b_addr_i289)+(4))>>2)]=$185.y,HEAPF32[((($b_addr_i289)+(8))>>2)]=$185.z,HEAPF32[((($b_addr_i289)+(12))>>2)]=$185.w);
 var $186=float32x4(HEAPF32[(($a_addr_i288)>>2)],HEAPF32[((($a_addr_i288)+(4))>>2)],HEAPF32[((($a_addr_i288)+(8))>>2)],HEAPF32[((($a_addr_i288)+(12))>>2)]);
 var $187=float32x4(HEAPF32[(($b_addr_i289)>>2)],HEAPF32[((($b_addr_i289)+(4))>>2)],HEAPF32[((($b_addr_i289)+(8))>>2)],HEAPF32[((($b_addr_i289)+(12))>>2)]);
 var $call_i290=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($186)), SIMD.float32x4.bitsToInt32x4($187)));
 (HEAPF32[(($a_addr_i279)>>2)]=$call_i304.x,HEAPF32[((($a_addr_i279)+(4))>>2)]=$call_i304.y,HEAPF32[((($a_addr_i279)+(8))>>2)]=$call_i304.z,HEAPF32[((($a_addr_i279)+(12))>>2)]=$call_i304.w);
 (HEAPF32[(($b_addr_i280)>>2)]=$call_i290.x,HEAPF32[((($b_addr_i280)+(4))>>2)]=$call_i290.y,HEAPF32[((($b_addr_i280)+(8))>>2)]=$call_i290.z,HEAPF32[((($b_addr_i280)+(12))>>2)]=$call_i290.w);
 var $188=float32x4(HEAPF32[(($a_addr_i279)>>2)],HEAPF32[((($a_addr_i279)+(4))>>2)],HEAPF32[((($a_addr_i279)+(8))>>2)],HEAPF32[((($a_addr_i279)+(12))>>2)]);
 var $189=float32x4(HEAPF32[(($b_addr_i280)>>2)],HEAPF32[((($b_addr_i280)+(4))>>2)],HEAPF32[((($b_addr_i280)+(8))>>2)],HEAPF32[((($b_addr_i280)+(12))>>2)]);
 var $call_i281=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($188), SIMD.float32x4.bitsToInt32x4($189)));
 var $190=$t_addr;
 (HEAPF32[(($190)>>2)]=$call_i281.x,HEAPF32[((($190)+(4))>>2)]=$call_i281.y,HEAPF32[((($190)+(8))>>2)]=$call_i281.z,HEAPF32[((($190)+(12))>>2)]=$call_i281.w);
 var $191=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $192=$hit_addr;
 var $193=float32x4(HEAPF32[(($192)>>2)],HEAPF32[((($192)+(4))>>2)],HEAPF32[((($192)+(8))>>2)],HEAPF32[((($192)+(12))>>2)]);
 (HEAPF32[(($a_addr_i273)>>2)]=$191.x,HEAPF32[((($a_addr_i273)+(4))>>2)]=$191.y,HEAPF32[((($a_addr_i273)+(8))>>2)]=$191.z,HEAPF32[((($a_addr_i273)+(12))>>2)]=$191.w);
 (HEAPF32[(($b_addr_i274)>>2)]=$193.x,HEAPF32[((($b_addr_i274)+(4))>>2)]=$193.y,HEAPF32[((($b_addr_i274)+(8))>>2)]=$193.z,HEAPF32[((($b_addr_i274)+(12))>>2)]=$193.w);
 var $194=float32x4(HEAPF32[(($a_addr_i273)>>2)],HEAPF32[((($a_addr_i273)+(4))>>2)],HEAPF32[((($a_addr_i273)+(8))>>2)],HEAPF32[((($a_addr_i273)+(12))>>2)]);
 var $195=float32x4(HEAPF32[(($b_addr_i274)>>2)],HEAPF32[((($b_addr_i274)+(4))>>2)],HEAPF32[((($b_addr_i274)+(8))>>2)],HEAPF32[((($b_addr_i274)+(12))>>2)]);
 var $call_i275=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($194), SIMD.float32x4.bitsToInt32x4($195)));
 var $196=$hit_addr;
 (HEAPF32[(($196)>>2)]=$call_i275.x,HEAPF32[((($196)+(4))>>2)]=$call_i275.y,HEAPF32[((($196)+(8))>>2)]=$call_i275.z,HEAPF32[((($196)+(12))>>2)]=$call_i275.w);
 var $197=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $198=float32x4(HEAPF32[(($orgx_addr)>>2)],HEAPF32[((($orgx_addr)+(4))>>2)],HEAPF32[((($orgx_addr)+(8))>>2)],HEAPF32[((($orgx_addr)+(12))>>2)]);
 var $199=float32x4(HEAPF32[(($dirx_addr)>>2)],HEAPF32[((($dirx_addr)+(4))>>2)],HEAPF32[((($dirx_addr)+(8))>>2)],HEAPF32[((($dirx_addr)+(12))>>2)]);
 var $200=$t_addr;
 var $201=float32x4(HEAPF32[(($200)>>2)],HEAPF32[((($200)+(4))>>2)],HEAPF32[((($200)+(8))>>2)],HEAPF32[((($200)+(12))>>2)]);
 (HEAPF32[(($a_addr_i270)>>2)]=$199.x,HEAPF32[((($a_addr_i270)+(4))>>2)]=$199.y,HEAPF32[((($a_addr_i270)+(8))>>2)]=$199.z,HEAPF32[((($a_addr_i270)+(12))>>2)]=$199.w);
 (HEAPF32[(($b_addr_i271)>>2)]=$201.x,HEAPF32[((($b_addr_i271)+(4))>>2)]=$201.y,HEAPF32[((($b_addr_i271)+(8))>>2)]=$201.z,HEAPF32[((($b_addr_i271)+(12))>>2)]=$201.w);
 var $202=float32x4(HEAPF32[(($a_addr_i270)>>2)],HEAPF32[((($a_addr_i270)+(4))>>2)],HEAPF32[((($a_addr_i270)+(8))>>2)],HEAPF32[((($a_addr_i270)+(12))>>2)]);
 var $203=float32x4(HEAPF32[(($b_addr_i271)>>2)],HEAPF32[((($b_addr_i271)+(4))>>2)],HEAPF32[((($b_addr_i271)+(8))>>2)],HEAPF32[((($b_addr_i271)+(12))>>2)]);
 var $mul_i272=SIMD.float32x4.mul($202,$203);
 (HEAPF32[(($a_addr_i267)>>2)]=$198.x,HEAPF32[((($a_addr_i267)+(4))>>2)]=$198.y,HEAPF32[((($a_addr_i267)+(8))>>2)]=$198.z,HEAPF32[((($a_addr_i267)+(12))>>2)]=$198.w);
 (HEAPF32[(($b_addr_i268)>>2)]=$mul_i272.x,HEAPF32[((($b_addr_i268)+(4))>>2)]=$mul_i272.y,HEAPF32[((($b_addr_i268)+(8))>>2)]=$mul_i272.z,HEAPF32[((($b_addr_i268)+(12))>>2)]=$mul_i272.w);
 var $204=float32x4(HEAPF32[(($a_addr_i267)>>2)],HEAPF32[((($a_addr_i267)+(4))>>2)],HEAPF32[((($a_addr_i267)+(8))>>2)],HEAPF32[((($a_addr_i267)+(12))>>2)]);
 var $205=float32x4(HEAPF32[(($b_addr_i268)>>2)],HEAPF32[((($b_addr_i268)+(4))>>2)],HEAPF32[((($b_addr_i268)+(8))>>2)],HEAPF32[((($b_addr_i268)+(12))>>2)]);
 var $add_i269=SIMD.float32x4.add($204,$205);
 (HEAPF32[(($a_addr_i261)>>2)]=$197.x,HEAPF32[((($a_addr_i261)+(4))>>2)]=$197.y,HEAPF32[((($a_addr_i261)+(8))>>2)]=$197.z,HEAPF32[((($a_addr_i261)+(12))>>2)]=$197.w);
 (HEAPF32[(($b_addr_i262)>>2)]=$add_i269.x,HEAPF32[((($b_addr_i262)+(4))>>2)]=$add_i269.y,HEAPF32[((($b_addr_i262)+(8))>>2)]=$add_i269.z,HEAPF32[((($b_addr_i262)+(12))>>2)]=$add_i269.w);
 var $206=float32x4(HEAPF32[(($a_addr_i261)>>2)],HEAPF32[((($a_addr_i261)+(4))>>2)],HEAPF32[((($a_addr_i261)+(8))>>2)],HEAPF32[((($a_addr_i261)+(12))>>2)]);
 var $207=float32x4(HEAPF32[(($b_addr_i262)>>2)],HEAPF32[((($b_addr_i262)+(4))>>2)],HEAPF32[((($b_addr_i262)+(8))>>2)],HEAPF32[((($b_addr_i262)+(12))>>2)]);
 var $call_i263=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($206), SIMD.float32x4.bitsToInt32x4($207)));
 var $208=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $209=$px_addr;
 var $210=float32x4(HEAPF32[(($209)>>2)],HEAPF32[((($209)+(4))>>2)],HEAPF32[((($209)+(8))>>2)],HEAPF32[((($209)+(12))>>2)]);
 (HEAPF32[(($a_addr_i255)>>2)]=$208.x,HEAPF32[((($a_addr_i255)+(4))>>2)]=$208.y,HEAPF32[((($a_addr_i255)+(8))>>2)]=$208.z,HEAPF32[((($a_addr_i255)+(12))>>2)]=$208.w);
 (HEAPF32[(($b_addr_i256)>>2)]=$210.x,HEAPF32[((($b_addr_i256)+(4))>>2)]=$210.y,HEAPF32[((($b_addr_i256)+(8))>>2)]=$210.z,HEAPF32[((($b_addr_i256)+(12))>>2)]=$210.w);
 var $211=float32x4(HEAPF32[(($a_addr_i255)>>2)],HEAPF32[((($a_addr_i255)+(4))>>2)],HEAPF32[((($a_addr_i255)+(8))>>2)],HEAPF32[((($a_addr_i255)+(12))>>2)]);
 var $212=float32x4(HEAPF32[(($b_addr_i256)>>2)],HEAPF32[((($b_addr_i256)+(4))>>2)],HEAPF32[((($b_addr_i256)+(8))>>2)],HEAPF32[((($b_addr_i256)+(12))>>2)]);
 var $call_i257=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($211)), SIMD.float32x4.bitsToInt32x4($212)));
 (HEAPF32[(($a_addr_i246)>>2)]=$call_i263.x,HEAPF32[((($a_addr_i246)+(4))>>2)]=$call_i263.y,HEAPF32[((($a_addr_i246)+(8))>>2)]=$call_i263.z,HEAPF32[((($a_addr_i246)+(12))>>2)]=$call_i263.w);
 (HEAPF32[(($b_addr_i247)>>2)]=$call_i257.x,HEAPF32[((($b_addr_i247)+(4))>>2)]=$call_i257.y,HEAPF32[((($b_addr_i247)+(8))>>2)]=$call_i257.z,HEAPF32[((($b_addr_i247)+(12))>>2)]=$call_i257.w);
 var $213=float32x4(HEAPF32[(($a_addr_i246)>>2)],HEAPF32[((($a_addr_i246)+(4))>>2)],HEAPF32[((($a_addr_i246)+(8))>>2)],HEAPF32[((($a_addr_i246)+(12))>>2)]);
 var $214=float32x4(HEAPF32[(($b_addr_i247)>>2)],HEAPF32[((($b_addr_i247)+(4))>>2)],HEAPF32[((($b_addr_i247)+(8))>>2)],HEAPF32[((($b_addr_i247)+(12))>>2)]);
 var $call_i248=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($213), SIMD.float32x4.bitsToInt32x4($214)));
 var $215=$px_addr;
 (HEAPF32[(($215)>>2)]=$call_i248.x,HEAPF32[((($215)+(4))>>2)]=$call_i248.y,HEAPF32[((($215)+(8))>>2)]=$call_i248.z,HEAPF32[((($215)+(12))>>2)]=$call_i248.w);
 var $216=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $217=float32x4(HEAPF32[(($orgy_addr)>>2)],HEAPF32[((($orgy_addr)+(4))>>2)],HEAPF32[((($orgy_addr)+(8))>>2)],HEAPF32[((($orgy_addr)+(12))>>2)]);
 var $218=float32x4(HEAPF32[(($diry_addr)>>2)],HEAPF32[((($diry_addr)+(4))>>2)],HEAPF32[((($diry_addr)+(8))>>2)],HEAPF32[((($diry_addr)+(12))>>2)]);
 var $219=$t_addr;
 var $220=float32x4(HEAPF32[(($219)>>2)],HEAPF32[((($219)+(4))>>2)],HEAPF32[((($219)+(8))>>2)],HEAPF32[((($219)+(12))>>2)]);
 (HEAPF32[(($a_addr_i243)>>2)]=$218.x,HEAPF32[((($a_addr_i243)+(4))>>2)]=$218.y,HEAPF32[((($a_addr_i243)+(8))>>2)]=$218.z,HEAPF32[((($a_addr_i243)+(12))>>2)]=$218.w);
 (HEAPF32[(($b_addr_i244)>>2)]=$220.x,HEAPF32[((($b_addr_i244)+(4))>>2)]=$220.y,HEAPF32[((($b_addr_i244)+(8))>>2)]=$220.z,HEAPF32[((($b_addr_i244)+(12))>>2)]=$220.w);
 var $221=float32x4(HEAPF32[(($a_addr_i243)>>2)],HEAPF32[((($a_addr_i243)+(4))>>2)],HEAPF32[((($a_addr_i243)+(8))>>2)],HEAPF32[((($a_addr_i243)+(12))>>2)]);
 var $222=float32x4(HEAPF32[(($b_addr_i244)>>2)],HEAPF32[((($b_addr_i244)+(4))>>2)],HEAPF32[((($b_addr_i244)+(8))>>2)],HEAPF32[((($b_addr_i244)+(12))>>2)]);
 var $mul_i245=SIMD.float32x4.mul($221,$222);
 (HEAPF32[(($a_addr_i240)>>2)]=$217.x,HEAPF32[((($a_addr_i240)+(4))>>2)]=$217.y,HEAPF32[((($a_addr_i240)+(8))>>2)]=$217.z,HEAPF32[((($a_addr_i240)+(12))>>2)]=$217.w);
 (HEAPF32[(($b_addr_i241)>>2)]=$mul_i245.x,HEAPF32[((($b_addr_i241)+(4))>>2)]=$mul_i245.y,HEAPF32[((($b_addr_i241)+(8))>>2)]=$mul_i245.z,HEAPF32[((($b_addr_i241)+(12))>>2)]=$mul_i245.w);
 var $223=float32x4(HEAPF32[(($a_addr_i240)>>2)],HEAPF32[((($a_addr_i240)+(4))>>2)],HEAPF32[((($a_addr_i240)+(8))>>2)],HEAPF32[((($a_addr_i240)+(12))>>2)]);
 var $224=float32x4(HEAPF32[(($b_addr_i241)>>2)],HEAPF32[((($b_addr_i241)+(4))>>2)],HEAPF32[((($b_addr_i241)+(8))>>2)],HEAPF32[((($b_addr_i241)+(12))>>2)]);
 var $add_i242=SIMD.float32x4.add($223,$224);
 (HEAPF32[(($a_addr_i234)>>2)]=$216.x,HEAPF32[((($a_addr_i234)+(4))>>2)]=$216.y,HEAPF32[((($a_addr_i234)+(8))>>2)]=$216.z,HEAPF32[((($a_addr_i234)+(12))>>2)]=$216.w);
 (HEAPF32[(($b_addr_i235)>>2)]=$add_i242.x,HEAPF32[((($b_addr_i235)+(4))>>2)]=$add_i242.y,HEAPF32[((($b_addr_i235)+(8))>>2)]=$add_i242.z,HEAPF32[((($b_addr_i235)+(12))>>2)]=$add_i242.w);
 var $225=float32x4(HEAPF32[(($a_addr_i234)>>2)],HEAPF32[((($a_addr_i234)+(4))>>2)],HEAPF32[((($a_addr_i234)+(8))>>2)],HEAPF32[((($a_addr_i234)+(12))>>2)]);
 var $226=float32x4(HEAPF32[(($b_addr_i235)>>2)],HEAPF32[((($b_addr_i235)+(4))>>2)],HEAPF32[((($b_addr_i235)+(8))>>2)],HEAPF32[((($b_addr_i235)+(12))>>2)]);
 var $call_i236=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($225), SIMD.float32x4.bitsToInt32x4($226)));
 var $227=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $228=$py_addr;
 var $229=float32x4(HEAPF32[(($228)>>2)],HEAPF32[((($228)+(4))>>2)],HEAPF32[((($228)+(8))>>2)],HEAPF32[((($228)+(12))>>2)]);
 (HEAPF32[(($a_addr_i225)>>2)]=$227.x,HEAPF32[((($a_addr_i225)+(4))>>2)]=$227.y,HEAPF32[((($a_addr_i225)+(8))>>2)]=$227.z,HEAPF32[((($a_addr_i225)+(12))>>2)]=$227.w);
 (HEAPF32[(($b_addr_i226)>>2)]=$229.x,HEAPF32[((($b_addr_i226)+(4))>>2)]=$229.y,HEAPF32[((($b_addr_i226)+(8))>>2)]=$229.z,HEAPF32[((($b_addr_i226)+(12))>>2)]=$229.w);
 var $230=float32x4(HEAPF32[(($a_addr_i225)>>2)],HEAPF32[((($a_addr_i225)+(4))>>2)],HEAPF32[((($a_addr_i225)+(8))>>2)],HEAPF32[((($a_addr_i225)+(12))>>2)]);
 var $231=float32x4(HEAPF32[(($b_addr_i226)>>2)],HEAPF32[((($b_addr_i226)+(4))>>2)],HEAPF32[((($b_addr_i226)+(8))>>2)],HEAPF32[((($b_addr_i226)+(12))>>2)]);
 var $call_i227=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($230)), SIMD.float32x4.bitsToInt32x4($231)));
 (HEAPF32[(($a_addr_i219)>>2)]=$call_i236.x,HEAPF32[((($a_addr_i219)+(4))>>2)]=$call_i236.y,HEAPF32[((($a_addr_i219)+(8))>>2)]=$call_i236.z,HEAPF32[((($a_addr_i219)+(12))>>2)]=$call_i236.w);
 (HEAPF32[(($b_addr_i220)>>2)]=$call_i227.x,HEAPF32[((($b_addr_i220)+(4))>>2)]=$call_i227.y,HEAPF32[((($b_addr_i220)+(8))>>2)]=$call_i227.z,HEAPF32[((($b_addr_i220)+(12))>>2)]=$call_i227.w);
 var $232=float32x4(HEAPF32[(($a_addr_i219)>>2)],HEAPF32[((($a_addr_i219)+(4))>>2)],HEAPF32[((($a_addr_i219)+(8))>>2)],HEAPF32[((($a_addr_i219)+(12))>>2)]);
 var $233=float32x4(HEAPF32[(($b_addr_i220)>>2)],HEAPF32[((($b_addr_i220)+(4))>>2)],HEAPF32[((($b_addr_i220)+(8))>>2)],HEAPF32[((($b_addr_i220)+(12))>>2)]);
 var $call_i221=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($232), SIMD.float32x4.bitsToInt32x4($233)));
 var $234=$py_addr;
 (HEAPF32[(($234)>>2)]=$call_i221.x,HEAPF32[((($234)+(4))>>2)]=$call_i221.y,HEAPF32[((($234)+(8))>>2)]=$call_i221.z,HEAPF32[((($234)+(12))>>2)]=$call_i221.w);
 var $235=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $236=float32x4(HEAPF32[(($orgz_addr)>>2)],HEAPF32[((($orgz_addr)+(4))>>2)],HEAPF32[((($orgz_addr)+(8))>>2)],HEAPF32[((($orgz_addr)+(12))>>2)]);
 var $237=float32x4(HEAPF32[(($dirz_addr)>>2)],HEAPF32[((($dirz_addr)+(4))>>2)],HEAPF32[((($dirz_addr)+(8))>>2)],HEAPF32[((($dirz_addr)+(12))>>2)]);
 var $238=$t_addr;
 var $239=float32x4(HEAPF32[(($238)>>2)],HEAPF32[((($238)+(4))>>2)],HEAPF32[((($238)+(8))>>2)],HEAPF32[((($238)+(12))>>2)]);
 (HEAPF32[(($a_addr_i216)>>2)]=$237.x,HEAPF32[((($a_addr_i216)+(4))>>2)]=$237.y,HEAPF32[((($a_addr_i216)+(8))>>2)]=$237.z,HEAPF32[((($a_addr_i216)+(12))>>2)]=$237.w);
 (HEAPF32[(($b_addr_i217)>>2)]=$239.x,HEAPF32[((($b_addr_i217)+(4))>>2)]=$239.y,HEAPF32[((($b_addr_i217)+(8))>>2)]=$239.z,HEAPF32[((($b_addr_i217)+(12))>>2)]=$239.w);
 var $240=float32x4(HEAPF32[(($a_addr_i216)>>2)],HEAPF32[((($a_addr_i216)+(4))>>2)],HEAPF32[((($a_addr_i216)+(8))>>2)],HEAPF32[((($a_addr_i216)+(12))>>2)]);
 var $241=float32x4(HEAPF32[(($b_addr_i217)>>2)],HEAPF32[((($b_addr_i217)+(4))>>2)],HEAPF32[((($b_addr_i217)+(8))>>2)],HEAPF32[((($b_addr_i217)+(12))>>2)]);
 var $mul_i218=SIMD.float32x4.mul($240,$241);
 (HEAPF32[(($a_addr_i213)>>2)]=$236.x,HEAPF32[((($a_addr_i213)+(4))>>2)]=$236.y,HEAPF32[((($a_addr_i213)+(8))>>2)]=$236.z,HEAPF32[((($a_addr_i213)+(12))>>2)]=$236.w);
 (HEAPF32[(($b_addr_i214)>>2)]=$mul_i218.x,HEAPF32[((($b_addr_i214)+(4))>>2)]=$mul_i218.y,HEAPF32[((($b_addr_i214)+(8))>>2)]=$mul_i218.z,HEAPF32[((($b_addr_i214)+(12))>>2)]=$mul_i218.w);
 var $242=float32x4(HEAPF32[(($a_addr_i213)>>2)],HEAPF32[((($a_addr_i213)+(4))>>2)],HEAPF32[((($a_addr_i213)+(8))>>2)],HEAPF32[((($a_addr_i213)+(12))>>2)]);
 var $243=float32x4(HEAPF32[(($b_addr_i214)>>2)],HEAPF32[((($b_addr_i214)+(4))>>2)],HEAPF32[((($b_addr_i214)+(8))>>2)],HEAPF32[((($b_addr_i214)+(12))>>2)]);
 var $add_i215=SIMD.float32x4.add($242,$243);
 (HEAPF32[(($a_addr_i199)>>2)]=$235.x,HEAPF32[((($a_addr_i199)+(4))>>2)]=$235.y,HEAPF32[((($a_addr_i199)+(8))>>2)]=$235.z,HEAPF32[((($a_addr_i199)+(12))>>2)]=$235.w);
 (HEAPF32[(($b_addr_i200)>>2)]=$add_i215.x,HEAPF32[((($b_addr_i200)+(4))>>2)]=$add_i215.y,HEAPF32[((($b_addr_i200)+(8))>>2)]=$add_i215.z,HEAPF32[((($b_addr_i200)+(12))>>2)]=$add_i215.w);
 var $244=float32x4(HEAPF32[(($a_addr_i199)>>2)],HEAPF32[((($a_addr_i199)+(4))>>2)],HEAPF32[((($a_addr_i199)+(8))>>2)],HEAPF32[((($a_addr_i199)+(12))>>2)]);
 var $245=float32x4(HEAPF32[(($b_addr_i200)>>2)],HEAPF32[((($b_addr_i200)+(4))>>2)],HEAPF32[((($b_addr_i200)+(8))>>2)],HEAPF32[((($b_addr_i200)+(12))>>2)]);
 var $call_i201=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($244), SIMD.float32x4.bitsToInt32x4($245)));
 var $246=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $247=$pz_addr;
 var $248=float32x4(HEAPF32[(($247)>>2)],HEAPF32[((($247)+(4))>>2)],HEAPF32[((($247)+(8))>>2)],HEAPF32[((($247)+(12))>>2)]);
 (HEAPF32[(($a_addr_i190)>>2)]=$246.x,HEAPF32[((($a_addr_i190)+(4))>>2)]=$246.y,HEAPF32[((($a_addr_i190)+(8))>>2)]=$246.z,HEAPF32[((($a_addr_i190)+(12))>>2)]=$246.w);
 (HEAPF32[(($b_addr_i191)>>2)]=$248.x,HEAPF32[((($b_addr_i191)+(4))>>2)]=$248.y,HEAPF32[((($b_addr_i191)+(8))>>2)]=$248.z,HEAPF32[((($b_addr_i191)+(12))>>2)]=$248.w);
 var $249=float32x4(HEAPF32[(($a_addr_i190)>>2)],HEAPF32[((($a_addr_i190)+(4))>>2)],HEAPF32[((($a_addr_i190)+(8))>>2)],HEAPF32[((($a_addr_i190)+(12))>>2)]);
 var $250=float32x4(HEAPF32[(($b_addr_i191)>>2)],HEAPF32[((($b_addr_i191)+(4))>>2)],HEAPF32[((($b_addr_i191)+(8))>>2)],HEAPF32[((($b_addr_i191)+(12))>>2)]);
 var $call_i192=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($249)), SIMD.float32x4.bitsToInt32x4($250)));
 (HEAPF32[(($a_addr_i184)>>2)]=$call_i201.x,HEAPF32[((($a_addr_i184)+(4))>>2)]=$call_i201.y,HEAPF32[((($a_addr_i184)+(8))>>2)]=$call_i201.z,HEAPF32[((($a_addr_i184)+(12))>>2)]=$call_i201.w);
 (HEAPF32[(($b_addr_i185)>>2)]=$call_i192.x,HEAPF32[((($b_addr_i185)+(4))>>2)]=$call_i192.y,HEAPF32[((($b_addr_i185)+(8))>>2)]=$call_i192.z,HEAPF32[((($b_addr_i185)+(12))>>2)]=$call_i192.w);
 var $251=float32x4(HEAPF32[(($a_addr_i184)>>2)],HEAPF32[((($a_addr_i184)+(4))>>2)],HEAPF32[((($a_addr_i184)+(8))>>2)],HEAPF32[((($a_addr_i184)+(12))>>2)]);
 var $252=float32x4(HEAPF32[(($b_addr_i185)>>2)],HEAPF32[((($b_addr_i185)+(4))>>2)],HEAPF32[((($b_addr_i185)+(8))>>2)],HEAPF32[((($b_addr_i185)+(12))>>2)]);
 var $call_i186=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($251), SIMD.float32x4.bitsToInt32x4($252)));
 var $253=$pz_addr;
 (HEAPF32[(($253)>>2)]=$call_i186.x,HEAPF32[((($253)+(4))>>2)]=$call_i186.y,HEAPF32[((($253)+(8))>>2)]=$call_i186.z,HEAPF32[((($253)+(12))>>2)]=$call_i186.w);
 var $254=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $255=$plane_addr;
 var $n84=(($255+12)|0);
 var $x85=(($n84)|0);
 var $256=HEAPF32[(($x85)>>2)];
 $w_addr_i178=$256;
 var $257=$w_addr_i178;
 var $vecinit_i180=SIMD.float32x4.withX(float32x4.splat(0),$257);
 var $258=$w_addr_i178;
 var $vecinit1_i181=SIMD.float32x4.withY($vecinit_i180,$258);
 var $259=$w_addr_i178;
 var $vecinit2_i182=SIMD.float32x4.withZ($vecinit1_i181,$259);
 var $260=$w_addr_i178;
 var $vecinit3_i183=SIMD.float32x4.withW($vecinit2_i182,$260);
 (HEAPF32[(($_compoundliteral_i179)>>2)]=$vecinit3_i183.x,HEAPF32[((($_compoundliteral_i179)+(4))>>2)]=$vecinit3_i183.y,HEAPF32[((($_compoundliteral_i179)+(8))>>2)]=$vecinit3_i183.z,HEAPF32[((($_compoundliteral_i179)+(12))>>2)]=$vecinit3_i183.w);
 var $261=float32x4(HEAPF32[(($_compoundliteral_i179)>>2)],HEAPF32[((($_compoundliteral_i179)+(4))>>2)],HEAPF32[((($_compoundliteral_i179)+(8))>>2)],HEAPF32[((($_compoundliteral_i179)+(12))>>2)]);
 (HEAPF32[(($a_addr_i173)>>2)]=$254.x,HEAPF32[((($a_addr_i173)+(4))>>2)]=$254.y,HEAPF32[((($a_addr_i173)+(8))>>2)]=$254.z,HEAPF32[((($a_addr_i173)+(12))>>2)]=$254.w);
 (HEAPF32[(($b_addr_i174)>>2)]=$261.x,HEAPF32[((($b_addr_i174)+(4))>>2)]=$261.y,HEAPF32[((($b_addr_i174)+(8))>>2)]=$261.z,HEAPF32[((($b_addr_i174)+(12))>>2)]=$261.w);
 var $262=float32x4(HEAPF32[(($a_addr_i173)>>2)],HEAPF32[((($a_addr_i173)+(4))>>2)],HEAPF32[((($a_addr_i173)+(8))>>2)],HEAPF32[((($a_addr_i173)+(12))>>2)]);
 var $263=float32x4(HEAPF32[(($b_addr_i174)>>2)],HEAPF32[((($b_addr_i174)+(4))>>2)],HEAPF32[((($b_addr_i174)+(8))>>2)],HEAPF32[((($b_addr_i174)+(12))>>2)]);
 var $call_i175=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($262), SIMD.float32x4.bitsToInt32x4($263)));
 var $264=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $265=$nx_addr;
 var $266=float32x4(HEAPF32[(($265)>>2)],HEAPF32[((($265)+(4))>>2)],HEAPF32[((($265)+(8))>>2)],HEAPF32[((($265)+(12))>>2)]);
 (HEAPF32[(($a_addr_i167)>>2)]=$264.x,HEAPF32[((($a_addr_i167)+(4))>>2)]=$264.y,HEAPF32[((($a_addr_i167)+(8))>>2)]=$264.z,HEAPF32[((($a_addr_i167)+(12))>>2)]=$264.w);
 (HEAPF32[(($b_addr_i168)>>2)]=$266.x,HEAPF32[((($b_addr_i168)+(4))>>2)]=$266.y,HEAPF32[((($b_addr_i168)+(8))>>2)]=$266.z,HEAPF32[((($b_addr_i168)+(12))>>2)]=$266.w);
 var $267=float32x4(HEAPF32[(($a_addr_i167)>>2)],HEAPF32[((($a_addr_i167)+(4))>>2)],HEAPF32[((($a_addr_i167)+(8))>>2)],HEAPF32[((($a_addr_i167)+(12))>>2)]);
 var $268=float32x4(HEAPF32[(($b_addr_i168)>>2)],HEAPF32[((($b_addr_i168)+(4))>>2)],HEAPF32[((($b_addr_i168)+(8))>>2)],HEAPF32[((($b_addr_i168)+(12))>>2)]);
 var $call_i169=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($267)), SIMD.float32x4.bitsToInt32x4($268)));
 (HEAPF32[(($a_addr_i158)>>2)]=$call_i175.x,HEAPF32[((($a_addr_i158)+(4))>>2)]=$call_i175.y,HEAPF32[((($a_addr_i158)+(8))>>2)]=$call_i175.z,HEAPF32[((($a_addr_i158)+(12))>>2)]=$call_i175.w);
 (HEAPF32[(($b_addr_i159)>>2)]=$call_i169.x,HEAPF32[((($b_addr_i159)+(4))>>2)]=$call_i169.y,HEAPF32[((($b_addr_i159)+(8))>>2)]=$call_i169.z,HEAPF32[((($b_addr_i159)+(12))>>2)]=$call_i169.w);
 var $269=float32x4(HEAPF32[(($a_addr_i158)>>2)],HEAPF32[((($a_addr_i158)+(4))>>2)],HEAPF32[((($a_addr_i158)+(8))>>2)],HEAPF32[((($a_addr_i158)+(12))>>2)]);
 var $270=float32x4(HEAPF32[(($b_addr_i159)>>2)],HEAPF32[((($b_addr_i159)+(4))>>2)],HEAPF32[((($b_addr_i159)+(8))>>2)],HEAPF32[((($b_addr_i159)+(12))>>2)]);
 var $call_i160=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($269), SIMD.float32x4.bitsToInt32x4($270)));
 var $271=$nx_addr;
 (HEAPF32[(($271)>>2)]=$call_i160.x,HEAPF32[((($271)+(4))>>2)]=$call_i160.y,HEAPF32[((($271)+(8))>>2)]=$call_i160.z,HEAPF32[((($271)+(12))>>2)]=$call_i160.w);
 var $272=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $273=$plane_addr;
 var $n90=(($273+12)|0);
 var $y91=(($n90+4)|0);
 var $274=HEAPF32[(($y91)>>2)];
 $w_addr_i152=$274;
 var $275=$w_addr_i152;
 var $vecinit_i154=SIMD.float32x4.withX(float32x4.splat(0),$275);
 var $276=$w_addr_i152;
 var $vecinit1_i155=SIMD.float32x4.withY($vecinit_i154,$276);
 var $277=$w_addr_i152;
 var $vecinit2_i156=SIMD.float32x4.withZ($vecinit1_i155,$277);
 var $278=$w_addr_i152;
 var $vecinit3_i157=SIMD.float32x4.withW($vecinit2_i156,$278);
 (HEAPF32[(($_compoundliteral_i153)>>2)]=$vecinit3_i157.x,HEAPF32[((($_compoundliteral_i153)+(4))>>2)]=$vecinit3_i157.y,HEAPF32[((($_compoundliteral_i153)+(8))>>2)]=$vecinit3_i157.z,HEAPF32[((($_compoundliteral_i153)+(12))>>2)]=$vecinit3_i157.w);
 var $279=float32x4(HEAPF32[(($_compoundliteral_i153)>>2)],HEAPF32[((($_compoundliteral_i153)+(4))>>2)],HEAPF32[((($_compoundliteral_i153)+(8))>>2)],HEAPF32[((($_compoundliteral_i153)+(12))>>2)]);
 (HEAPF32[(($a_addr_i143)>>2)]=$272.x,HEAPF32[((($a_addr_i143)+(4))>>2)]=$272.y,HEAPF32[((($a_addr_i143)+(8))>>2)]=$272.z,HEAPF32[((($a_addr_i143)+(12))>>2)]=$272.w);
 (HEAPF32[(($b_addr_i144)>>2)]=$279.x,HEAPF32[((($b_addr_i144)+(4))>>2)]=$279.y,HEAPF32[((($b_addr_i144)+(8))>>2)]=$279.z,HEAPF32[((($b_addr_i144)+(12))>>2)]=$279.w);
 var $280=float32x4(HEAPF32[(($a_addr_i143)>>2)],HEAPF32[((($a_addr_i143)+(4))>>2)],HEAPF32[((($a_addr_i143)+(8))>>2)],HEAPF32[((($a_addr_i143)+(12))>>2)]);
 var $281=float32x4(HEAPF32[(($b_addr_i144)>>2)],HEAPF32[((($b_addr_i144)+(4))>>2)],HEAPF32[((($b_addr_i144)+(8))>>2)],HEAPF32[((($b_addr_i144)+(12))>>2)]);
 var $call_i145=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($280), SIMD.float32x4.bitsToInt32x4($281)));
 var $282=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $283=$ny_addr;
 var $284=float32x4(HEAPF32[(($283)>>2)],HEAPF32[((($283)+(4))>>2)],HEAPF32[((($283)+(8))>>2)],HEAPF32[((($283)+(12))>>2)]);
 (HEAPF32[(($a_addr_i137)>>2)]=$282.x,HEAPF32[((($a_addr_i137)+(4))>>2)]=$282.y,HEAPF32[((($a_addr_i137)+(8))>>2)]=$282.z,HEAPF32[((($a_addr_i137)+(12))>>2)]=$282.w);
 (HEAPF32[(($b_addr_i138)>>2)]=$284.x,HEAPF32[((($b_addr_i138)+(4))>>2)]=$284.y,HEAPF32[((($b_addr_i138)+(8))>>2)]=$284.z,HEAPF32[((($b_addr_i138)+(12))>>2)]=$284.w);
 var $285=float32x4(HEAPF32[(($a_addr_i137)>>2)],HEAPF32[((($a_addr_i137)+(4))>>2)],HEAPF32[((($a_addr_i137)+(8))>>2)],HEAPF32[((($a_addr_i137)+(12))>>2)]);
 var $286=float32x4(HEAPF32[(($b_addr_i138)>>2)],HEAPF32[((($b_addr_i138)+(4))>>2)],HEAPF32[((($b_addr_i138)+(8))>>2)],HEAPF32[((($b_addr_i138)+(12))>>2)]);
 var $call_i139=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($285)), SIMD.float32x4.bitsToInt32x4($286)));
 (HEAPF32[(($a_addr_i128)>>2)]=$call_i145.x,HEAPF32[((($a_addr_i128)+(4))>>2)]=$call_i145.y,HEAPF32[((($a_addr_i128)+(8))>>2)]=$call_i145.z,HEAPF32[((($a_addr_i128)+(12))>>2)]=$call_i145.w);
 (HEAPF32[(($b_addr_i129)>>2)]=$call_i139.x,HEAPF32[((($b_addr_i129)+(4))>>2)]=$call_i139.y,HEAPF32[((($b_addr_i129)+(8))>>2)]=$call_i139.z,HEAPF32[((($b_addr_i129)+(12))>>2)]=$call_i139.w);
 var $287=float32x4(HEAPF32[(($a_addr_i128)>>2)],HEAPF32[((($a_addr_i128)+(4))>>2)],HEAPF32[((($a_addr_i128)+(8))>>2)],HEAPF32[((($a_addr_i128)+(12))>>2)]);
 var $288=float32x4(HEAPF32[(($b_addr_i129)>>2)],HEAPF32[((($b_addr_i129)+(4))>>2)],HEAPF32[((($b_addr_i129)+(8))>>2)],HEAPF32[((($b_addr_i129)+(12))>>2)]);
 var $call_i130=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($287), SIMD.float32x4.bitsToInt32x4($288)));
 var $289=$ny_addr;
 (HEAPF32[(($289)>>2)]=$call_i130.x,HEAPF32[((($289)+(4))>>2)]=$call_i130.y,HEAPF32[((($289)+(8))>>2)]=$call_i130.z,HEAPF32[((($289)+(12))>>2)]=$call_i130.w);
 var $290=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $291=$plane_addr;
 var $n96=(($291+12)|0);
 var $z97=(($n96+8)|0);
 var $292=HEAPF32[(($z97)>>2)];
 $w_addr_i122=$292;
 var $293=$w_addr_i122;
 var $vecinit_i124=SIMD.float32x4.withX(float32x4.splat(0),$293);
 var $294=$w_addr_i122;
 var $vecinit1_i125=SIMD.float32x4.withY($vecinit_i124,$294);
 var $295=$w_addr_i122;
 var $vecinit2_i126=SIMD.float32x4.withZ($vecinit1_i125,$295);
 var $296=$w_addr_i122;
 var $vecinit3_i127=SIMD.float32x4.withW($vecinit2_i126,$296);
 (HEAPF32[(($_compoundliteral_i123)>>2)]=$vecinit3_i127.x,HEAPF32[((($_compoundliteral_i123)+(4))>>2)]=$vecinit3_i127.y,HEAPF32[((($_compoundliteral_i123)+(8))>>2)]=$vecinit3_i127.z,HEAPF32[((($_compoundliteral_i123)+(12))>>2)]=$vecinit3_i127.w);
 var $297=float32x4(HEAPF32[(($_compoundliteral_i123)>>2)],HEAPF32[((($_compoundliteral_i123)+(4))>>2)],HEAPF32[((($_compoundliteral_i123)+(8))>>2)],HEAPF32[((($_compoundliteral_i123)+(12))>>2)]);
 (HEAPF32[(($a_addr_i113)>>2)]=$290.x,HEAPF32[((($a_addr_i113)+(4))>>2)]=$290.y,HEAPF32[((($a_addr_i113)+(8))>>2)]=$290.z,HEAPF32[((($a_addr_i113)+(12))>>2)]=$290.w);
 (HEAPF32[(($b_addr_i114)>>2)]=$297.x,HEAPF32[((($b_addr_i114)+(4))>>2)]=$297.y,HEAPF32[((($b_addr_i114)+(8))>>2)]=$297.z,HEAPF32[((($b_addr_i114)+(12))>>2)]=$297.w);
 var $298=float32x4(HEAPF32[(($a_addr_i113)>>2)],HEAPF32[((($a_addr_i113)+(4))>>2)],HEAPF32[((($a_addr_i113)+(8))>>2)],HEAPF32[((($a_addr_i113)+(12))>>2)]);
 var $299=float32x4(HEAPF32[(($b_addr_i114)>>2)],HEAPF32[((($b_addr_i114)+(4))>>2)],HEAPF32[((($b_addr_i114)+(8))>>2)],HEAPF32[((($b_addr_i114)+(12))>>2)]);
 var $call_i115=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.float32x4.bitsToInt32x4($298), SIMD.float32x4.bitsToInt32x4($299)));
 var $300=float32x4(HEAPF32[(($cond2)>>2)],HEAPF32[((($cond2)+(4))>>2)],HEAPF32[((($cond2)+(8))>>2)],HEAPF32[((($cond2)+(12))>>2)]);
 var $301=$nz_addr;
 var $302=float32x4(HEAPF32[(($301)>>2)],HEAPF32[((($301)+(4))>>2)],HEAPF32[((($301)+(8))>>2)],HEAPF32[((($301)+(12))>>2)]);
 (HEAPF32[(($a_addr_i108)>>2)]=$300.x,HEAPF32[((($a_addr_i108)+(4))>>2)]=$300.y,HEAPF32[((($a_addr_i108)+(8))>>2)]=$300.z,HEAPF32[((($a_addr_i108)+(12))>>2)]=$300.w);
 (HEAPF32[(($b_addr_i109)>>2)]=$302.x,HEAPF32[((($b_addr_i109)+(4))>>2)]=$302.y,HEAPF32[((($b_addr_i109)+(8))>>2)]=$302.z,HEAPF32[((($b_addr_i109)+(12))>>2)]=$302.w);
 var $303=float32x4(HEAPF32[(($a_addr_i108)>>2)],HEAPF32[((($a_addr_i108)+(4))>>2)],HEAPF32[((($a_addr_i108)+(8))>>2)],HEAPF32[((($a_addr_i108)+(12))>>2)]);
 var $304=float32x4(HEAPF32[(($b_addr_i109)>>2)],HEAPF32[((($b_addr_i109)+(4))>>2)],HEAPF32[((($b_addr_i109)+(8))>>2)],HEAPF32[((($b_addr_i109)+(12))>>2)]);
 var $call_i110=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.and(SIMD.int32x4.not(SIMD.float32x4.bitsToInt32x4($303)), SIMD.float32x4.bitsToInt32x4($304)));
 (HEAPF32[(($a_addr_i)>>2)]=$call_i115.x,HEAPF32[((($a_addr_i)+(4))>>2)]=$call_i115.y,HEAPF32[((($a_addr_i)+(8))>>2)]=$call_i115.z,HEAPF32[((($a_addr_i)+(12))>>2)]=$call_i115.w);
 (HEAPF32[(($b_addr_i)>>2)]=$call_i110.x,HEAPF32[((($b_addr_i)+(4))>>2)]=$call_i110.y,HEAPF32[((($b_addr_i)+(8))>>2)]=$call_i110.z,HEAPF32[((($b_addr_i)+(12))>>2)]=$call_i110.w);
 var $305=float32x4(HEAPF32[(($a_addr_i)>>2)],HEAPF32[((($a_addr_i)+(4))>>2)],HEAPF32[((($a_addr_i)+(8))>>2)],HEAPF32[((($a_addr_i)+(12))>>2)]);
 var $306=float32x4(HEAPF32[(($b_addr_i)>>2)],HEAPF32[((($b_addr_i)+(4))>>2)],HEAPF32[((($b_addr_i)+(8))>>2)],HEAPF32[((($b_addr_i)+(12))>>2)]);
 var $call_i=SIMD.int32x4.bitsToFloat32x4(SIMD.int32x4.or(SIMD.float32x4.bitsToInt32x4($305), SIMD.float32x4.bitsToInt32x4($306)));
 var $307=$nz_addr;
 (HEAPF32[(($307)>>2)]=$call_i.x,HEAPF32[((($307)+(4))>>2)]=$call_i.y,HEAPF32[((($307)+(8))>>2)]=$call_i.z,HEAPF32[((($307)+(12))>>2)]=$call_i.w);
 label=3;break;
 case 3: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }
}
function _init_scene(){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $i;
 HEAPF32[((584)>>2)]=-2;
 HEAPF32[((588)>>2)]=0;
 HEAPF32[((592)>>2)]=-3.5;
 HEAPF32[((596)>>2)]=0.5;
 HEAPF32[((600)>>2)]=-0.5;
 HEAPF32[((604)>>2)]=0;
 HEAPF32[((608)>>2)]=-3;
 HEAPF32[((612)>>2)]=0.5;
 HEAPF32[((616)>>2)]=1;
 HEAPF32[((620)>>2)]=0;
 HEAPF32[((624)>>2)]=-2.200000047683716;
 HEAPF32[((628)>>2)]=0.5;
 HEAPF32[((1144)>>2)]=0;
 HEAPF32[((1148)>>2)]=-0.5;
 HEAPF32[((1152)>>2)]=0;
 HEAPF32[((1156)>>2)]=0;
 HEAPF32[((1160)>>2)]=1;
 HEAPF32[((1164)>>2)]=0;
 $i=0;
 label=2;break;
 case 2: 
 var $0=$i;
 var $cmp=($0|0)<64;
 if($cmp){label=3;break;}else{label=5;break;}
 case 3: 
 var $1=$i;
 var $arrayidx=((264+($1<<2))|0);
 var $2=HEAPF32[(($arrayidx)>>2)];
 var $3=$i;
 var $arrayidx1=((888+($3<<2))|0);
 HEAPF32[(($arrayidx1)>>2)]=$2;
 var $4=$i;
 var $arrayidx2=((8+($4<<2))|0);
 var $5=HEAPF32[(($arrayidx2)>>2)];
 var $6=$i;
 var $arrayidx3=((632+($6<<2))|0);
 HEAPF32[(($arrayidx3)>>2)]=$5;
 label=4;break;
 case 4: 
 var $7=$i;
 var $inc=((($7)+(1))|0);
 $i=$inc;
 label=2;break;
 case 5: 
 HEAPF32[((1168)>>2)]=0.7907924056053162;
 HEAP32[((1196)>>2)]=1;
 HEAPF32[((1172)>>2)]=0.3484252095222473;
 HEAPF32[((1176)>>2)]=-0.5;
 HEAPF32[((1180)>>2)]=-0.5039370059967041;
 HEAPF32[((1184)>>2)]=0;
 HEAPF32[((1188)>>2)]=1;
 HEAPF32[((1192)>>2)]=0;
 return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_init_scene"] = _init_scene;
function _vdot($v0,$v1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $v0; $v0=STACKTOP;STACKTOP = (STACKTOP + 12)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($v0)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($v0)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($v0)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];
 var tempParam = $v1; $v1=STACKTOP;STACKTOP = (STACKTOP + 12)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($v1)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($v1)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($v1)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];
 var $x=(($v0)|0);
 var $0=HEAPF32[(($x)>>2)];
 var $x1=(($v1)|0);
 var $1=HEAPF32[(($x1)>>2)];
 var $mul=($0)*($1);
 var $y=(($v0+4)|0);
 var $2=HEAPF32[(($y)>>2)];
 var $y2=(($v1+4)|0);
 var $3=HEAPF32[(($y2)>>2)];
 var $mul3=($2)*($3);
 var $add=($mul)+($mul3);
 var $z=(($v0+8)|0);
 var $4=HEAPF32[(($z)>>2)];
 var $z4=(($v1+8)|0);
 var $5=HEAPF32[(($z4)>>2)];
 var $mul5=($4)*($5);
 var $add6=($add)+($mul5);
 STACKTOP=sp;return $add6;
}
// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    Module['calledRun'] = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
//@ sourceMappingURL=ao_simd_soa_nossemath.js.map