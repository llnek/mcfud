!function(f,a,c){var s,l=256,p="random",d=c.pow(l,6),g=c.pow(2,52),y=2*g,h=l-1;function n(n,t,r){function e(){for(var n=u.g(6),t=d,r=0;n<g;)n=(n+r)*l,t*=l,r=u.g(1);for(;y<=n;)n/=2,t/=2,r>>>=1;return(n+r)/t}var o=[],i=j(function n(t,r){var e,o=[],i=typeof t;if(r&&"object"==i)for(e in t)try{o.push(n(t[e],r-1))}catch(n){}return o.length?o:"string"==i?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[n,S(a)]:null==n?function(){try{var n;return s&&(n=s.randomBytes)?n=n(l):(n=new Uint8Array(l),(f.crypto||f.msCrypto).getRandomValues(n)),S(n)}catch(n){var t=f.navigator,r=t&&t.plugins;return[+new Date,f,r,f.screen,S(a)]}}():n,3),o),u=new m(o);return e.int32=function(){return 0|u.g(4)},e.quick=function(){return u.g(4)/4294967296},e.double=e,j(S(u.S),a),(t.pass||r||function(n,t,r,e){return e&&(e.S&&v(e,u),n.state=function(){return v(u,{})}),r?(c[p]=n,t):n})(e,i,"global"in t?t.global:this==c,t.state)}function m(n){var t,r=n.length,u=this,e=0,o=u.i=u.j=0,i=u.S=[];for(r||(n=[r++]);e<l;)i[e]=e++;for(e=0;e<l;e++)i[e]=i[o=h&o+n[e%r]+(t=i[e])],i[o]=t;(u.g=function(n){for(var t,r=0,e=u.i,o=u.j,i=u.S;n--;)t=i[e=h&e+1],r=r*l+i[h&(i[e]=i[o=h&o+t])+(i[o]=t)];return u.i=e,u.j=o,r})(l)}function v(n,t){return t.i=n.i,t.j=n.j,t.S=n.S.slice(),t}function j(n,t){for(var r,e=n+"",o=0;o<e.length;)t[h&o]=h&(r^=19*t[h&o])+e.charCodeAt(o++);return S(t)}function S(n){return String.fromCharCode.apply(0,n)}if(j(c.random(),a),"object"==typeof module&&module.exports){module.exports=n;try{s=require("crypto")}catch(n){}}else"function"==typeof define&&define.amd?define(function(){return n}):c["seed"+p]=n}("undefined"!=typeof self?self:this,[],Math);
/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright © 2013-2021, Kenneth Leung. All rights reserved. */

;(function(window,doco,seed_rand){

  "use strict";

  if(typeof module==="object" && module.exports){
    seed_rand=require("../tpcl/seedrandom.min")
  }else{
    doco=window.document
  }

  /**Create the module.
  */
  function _module(){
    const root=window,
          MFL=Math.floor,
          Slicer=Array.prototype.slice,
          toStr=Object.prototype.toString;
    function isObj(obj){ return toStr.call(obj) == "[object Object]" }
    function isObject(obj){ return isObj(obj) }
    function isNil(obj){ return toStr.call(obj) == "[object Null]" }
    function isFun(obj){ return toStr.call(obj) == "[object Function]" }
    function isVec(obj){ return toStr.call(obj) == "[object Array]" }
    function isMap(obj){ return toStr.call(obj) == "[object Map]" }
    function isSet(obj){ return toStr.call(obj) == "[object Set]" }
    function isStr(obj){ return toStr.call(obj) == "[object String]" }
    function isNum(obj){ return toStr.call(obj) == "[object Number]" }
    function isBool(obj){ return toStr.call(obj) == "[object Boolean]" }
    function isEven(n){ return n>0 ? (n%2 === 0) : ((-n)%2 === 0) }
    function isUndef(o){ return o===undefined }
    function isColl(o){ return isVec(o)||isMap(o)||isObj(o) }

    //original source from https://developer.mozilla.org
    function completeAssign(target, source){
      let descriptors = Object.keys(source).reduce((descriptors, key) => {
        descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
        return descriptors;
      }, {});
      // By default, Object.assign copies enumerable Symbols, too
      Object.getOwnPropertySymbols(source).forEach(sym => {
        let descriptor = Object.getOwnPropertyDescriptor(source, sym);
        if (descriptor.enumerable) {
          descriptors[sym] = descriptor;
        }
      });
      Object.defineProperties(target, descriptors);
      return target;
    }

    /**
     * @module mcfud/core
     */

    /**
     * @private
     * @var {function}
     */
    let PRNG= seed_rand?seed_rand():new Math.seedrandom();

    /** @ignore */
    function _randXYInclusive(min,max){
      return MFL(PRNG() * (max-min+1) + min) }

    /** @ignore */
    function _preAnd(conds,msg){
      for(let c,i=0;i<conds.length;++i){
        c=conds[i];
        if(!c[0](c[1]))
          throw new TypeError(`wanted ${msg}`) }
      return true;
    }

    /** @ignore */
    function _preOr(conds,msg){
      for(let c,i=0;i<conds.length;++i){
        c=conds[i];
        if(c[0](c[1])){return true}
      }
      throw new TypeError(`wanted ${msg}`); }

    /** @ignore */
    function _pre(f,arg,msg){
      if(!f(arg)){
        throw new TypeError(`wanted ${msg}`) } else {return true} }

    //-- regex handling file names
    const BNAME=/(\/|\\\\)([^(\/|\\\\)]+)$/g;
    //-- regex handling file extensions
    const FEXT=/(\.[^\.\/\?\\]*)(\?.*)?$/;

    /** @ignore */
    function _fext(path,incdot){
      let t=FEXT.exec(path);
      if(t && t[1]){
        t= t[1].toLowerCase();
        if(!incdot) t=t.substring(1);
      }else{ t="" }
      return t;
    }

    /**
     * private
     * @var {number}
     */
    const EPSILON= 0.0000000001;

    /**
     * @private
     * @var {number}
     */
    let _seqNum= 0;

    /** @ignore */
    function _everyF(F,_1,args){
      let b=F(_1);
      switch(args.length){
      case 0: return b;
      case 1: return b && F(args[0]);
      case 2: return b && F(args[0]) && F(args[1]);
      case 3: return b && F(args[0]) && F(args[1]) && F(args[2]);
      default: return b && args.every(x => F(x));
      }
    }

    const _$={};

    /** @namespace module:mcfud/core.is */
    const is={
      /**Check if input(s) are type `function`.
       * @memberof module:mcfud/core.is
       * @param {any} f anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      fun(f,...args){ return _everyF(isFun,f,args) },
      /**Check if input(s) are type `string`.
       * @memberof module:mcfud/core.is
       * @param {any} s anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      str(s,...args){ return _everyF(isStr,s,args) },
      //void0(obj){ return obj === void 0 },
      /**Check if input(s) are type `undefined`.
       * @memberof module:mcfud/core.is
       * @param {any} obj anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      undef(o,...args){ return _everyF(isUndef,o,args) },
      /**Check if input(s) are type `Map`.
       * @memberof module:mcfud/core.is
       * @param {any} m anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      map(m,...args){ return _everyF(isMap,m,args) },
      /**Check if input(s) are type `Set`.
       * @memberof module:mcfud/core.is
       * @param {any} m anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      set(s,...args){ return _everyF(isSet,s,args) },
      /**Check if input(s) are type `number`.
       * @memberof module:mcfud/core.is
       * @param {any} n anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      num(n,...args){ return _everyF(isNum,n,args) },
      /**Check if input is a boolean.
       * @memberof module:mcfud/core.is
       * @param {boolean} n
       * @return {boolean}
       */
      bool(n,...args){ return _everyF(isBool,n,args) },
      /**Check if input is a positive number.
       * @memberof module:mcfud/core.is
       * @param {number} n
       * @return {boolean}
       */
      pos(n){ return isNum(n)&&n>0 },
      /**Check if input is a negative number.
       * @memberof module:mcfud/core.is
       * @param {number} n
       * @return {boolean}
       */
      neg(n){ return isNum(n)&&n<0 },
      /**Check if input(s) are type `array`.
       * @memberof module:mcfud/core.is
       * @param {any} v anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      vec(v,...args){ return _everyF(isVec,v,args) },
      /**Check if input(s) are type `object`.
       * @memberof module:mcfud/core.is
       * @param {any} o anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      obj(o,...args){ return _everyF(isObj,o,args) },
      /**Check if this collection is `not empty`.
       * @memberof module:mcfud/core.is
       * @param {object|array|map} o
       * @return {boolean}
       */
      some(o){ return _.size(o) > 0 },
      /**Check if this collection is `empty`.
       * @memberof module:mcfud/core.is
       * @param {object|array|map} o
       * @return {boolean}
       */
      none(o){ return _.size(o) === 0 },
      /**Check if this property belongs to this object.
       * @memberof module:mcfud/core.is
       * @param {object} o
       * @param {string} p name of the property
       * @return {boolean}
       */
      own(o,p){ return Object.prototype.hasOwnProperty.call(o,p) }
    };

    /** @namespace module:mcfud/core._ */
    const _={
      /** error message */
      error(...args){
        console.error(...args) },
      /** log message */
      log(...args){
        console.log(...args) },
      /**Re-seed the internal prng object.
       * @memberof module:mcfud/core._
       * @return {number}
       */
      srand(){ PRNG= seed_rand?seed_rand():new Math.seedrandom() },
      /**Check if this float approximates zero.
       * @memberof module:mcfud/core._
       * @param {number} a
       * @return {boolean}
       */
      feq0(a){ return Math.abs(a) < EPSILON },
      /**Check if these 2 floats are equal.
       * @memberof module:mcfud/core._
       * @param {number} a
       * @param {number} b
       * @return {boolean}
       */
      feq(a, b){ return Math.abs(a-b) < EPSILON },
      /** Fuzzy greater_equals */
      //fgteq(a,b){ return a>b || this.feq(a,b) },
      /** Fuzzy less_equals */
      //flteq(a,b){ return a<b || this.feq(a,b) },
      /**Serialize input to JSON.
       * @memberof module:mcfud/core._
       * @param {any} o anything
       * @return {string} JSON string
       */
      pack(o){ return JSON.stringify(o) },
      /**Deserialize from JSON.
       * @memberof module:mcfud/core._
       * @param {string} input
       * @return {any} valid js data
       */
      unpack(s){ return JSON.parse(s) },
      /**Package x,y as a tuple.
       * @memberof module:mcfud/core._
       * @param {number} x
       * @param {number} y
       * @return {number[]} [x,y]
       */
      v2(x=0,y=0){ return [x,y] },
      /**Package x,y as an object.
       * @memberof module:mcfud/core._
       * @param {number} x
       * @param {number} y
       * @return {object} {x,y}
       */
      p2(x=0,y=0){ return {x: x, y: y} },
      /**Unless n is a number, return it else 0.
       * @memberof module:mcfud/core._
       * @param {number} n
       * @return {number} n or 0
       */
      numOrZero(n){ return isNaN(n) ? 0 : n },
      /**Unless a is defined, return it else b.
       * @memberof module:mcfud/core._
       * @param {any} a
       * @param {any} b
       * @return {any} a or b
       */
      setVec(a,...args){
        args.forEach((v,i)=> a[i]=v)
      },
      /**If not even, make it even.
       * @memberof module:mcfud/core._
       * @param {number} n
       * @return {number}
       */
      evenN(n,dir){
        n=Math.floor(n);
        return isEven(n)?n:(dir?n+1:n-1) },
      /**Check if a is null or undefined - `not real`.
       * @memberof module:mcfud/core._
       * @param {any} a
       * @return {boolean}
       */
      nichts(a){return a===undefined||a===null},
      /**If a is `not-real` return b.
       * @memberof module:mcfud/core._
       * @param {any} a
       * @param {any} b
       * @return {any}
       */
      nor(a,b){ return a===undefined||a===null?b:a },
      /**If a is `undefined` return b.
       * @memberof module:mcfud/core._
       * @param {any} a
       * @param {any} b
       * @return {any}
       */
      or(a,b){ return a===undefined?b:a },
      /**Coerce input into a number, if not return the default.
       * @memberof module:mcfud/core._
       * @param {string} input
       * @param {number} dft
       * @return {number}
       */
      toNum(s,dft){
        const n=parseFloat(s);
        return (isNaN(n) && isNum(dft)) ? dft : n;
      },
      /**How mych left as a ratio.
       * @memberof module:mcfud/core._
       * @param {number} amt
       * @param {number} total
       * @return {number}
       */
      percentRemain(amt, total, wrap){
        if(amt>total){
          amt= wrap ? amt%total : total
        }
        return Math.max(0,total-amt)/total;
      },
      /**Break version string into `Major.Minor.Patch`.
       * @memberof module:mcfud/core._
       * @param {string} s
       * @return {number[]} [major,minor,patch]
       */
      splitVerStr(s){
        const arr=(""+(s || "")).split(".").filter(s=> s.length>0);
        return [this.toNum(arr[0],0),
                this.toNum(arr[1],0),
                this.toNum(arr[2],0)]
      },
      /**Compare 2 version strings, like a standard comparator.
       * @memberof module:mcfud/core._
       * @param {string} v1
       * @param {string} v2
       * @return {number} -1 is less, +1 is greater, 0 is same.
       */
      cmpVerStrs(v1,v2){
        let a1= this.splitVerStr(""+v1);
        let a2= this.splitVerStr(""+v2);
        if(a1[0] > a2[0]) return 1;
        else if(a1[0] < a2[0]) return -1;
        if(a1[1] > a2[1]) return 1;
        else if(a1[1] < a2[1]) return -1;
        if(a1[2] > a2[2]) return 1;
        else if(a1[2] < a2[2]) return -1;
        return 0;
      },
      /**
      * @ignore
      */
      pdef(obj){
        return (obj.configurable=true) && (obj.enumerable=true) && obj
      },
      /**Look for files matching any one of these extensions.
       * @memberof module:mcfud/core._
       * @param {string[]} list of file paths
       * @param {string[]} list of file extensions
       * @return {string[]} matching files
       */
      findFiles(files, exts){
        return files.filter(s=> exts.indexOf(_fext(s,1)) > -1)
      },
      /**Chop input into chunks of `count` items.
       * @memberof module:mcfud/core._
       * @param {number} count number of items in each chunk
       * @param {any[]} arr list of items
       * @return {any[][]}
       */
      partition(count,arr){
        const out=[];
        for(let row,j,i=0;;){
          row=[];
          for(j=0;j<count;++j){
            if(i<arr.length){
              row.push(arr[i++]);
            }else{
              j=-1; break; }
          }
          if(row.length>0) out.push(row);
          if(j<0) break;
        }
        return out;
      },
      /**Get keys of object/map.
       * @memberof module:mcfud/core._
       * @param {object|map} o
       * @return {string[]}
       */
      keys(o){
        return isMap(o) ? Array.from(o.keys())
                        : (isObj(o) ? Object.keys(o) : [])
      },
      /**Clone object/map but exclude these keys.
       * @memberof module:mcfud/core._
       * @param {object|map} c
       * @param {string[]} keys to exclude
       * @return {object|map}
       */
      selectNotKeys(c,keys){
        _preOr([[isMap,c],[isObj,c]],"map/object");
        const out= isMap(c) ? new Map() : {};
        keys=this.seq(keys);
        this.doseq(c,(v,k)=> (!keys.includes(k)) && this.assoc(out,k,v));
        return out;
      },
      /**Choose these keys from object/map.
       * @memberof module:mcfud/core._
       * @param {object|map} c
       * @param {string[]} keys to copy
       * @return {object|map}
       */
      selectKeys(c,keys){
        _preOr([[isMap,c],[isObj,c]],"map/object");
        const out= isMap(c) ? new Map() : {};
        this.seq(keys).forEach(k=>{
          if(isMap(c)){
            c.has(k) && out.set(k, c.get(k));
          }else if(is.own(c,k)){ out[k]=c[k] }
        });
        return out;
      },
      /**Assert that the condition is not true.
       * @memberof module:mcfud/core._
       * @param {any} a boolean expression
       * @param {...any} anything
       * @throws Error if condition is true
       * @return {boolean} true
       */
      assertNot(cond,...args){
        return this.assert(!cond,...args)
      },
      /**Assert that the condition is true.
       * @memberof module:mcfud/core._
       * @param {any} a boolean expression
       * @param {...any} anything
       * @throws Error if condition is false
       * @return {boolean} true
       */
      assert(cond,...args){
        if(!cond)
          throw args.length===0 ? "Assertion!" : args.join("");
        return true;
      },
      /**Check if target has none of these keys.
       * @memberof module:mcfud/core._
       * @param {string[]} keys to test
       * @param {object|map} target
       * @return {boolean}
       */
      noSuchKeys(keys,target){
        return !this.some(this.seq(keys),k=> this.has(target,k)?k:null)
        //if(r) console.log("keyfound="+r);
        //return !r;
      },
      /**Get a random int between min and max (inclusive).
       * @memberof module:mcfud/core._
       * @param {number} min
       * @param {number} max
       * @return {number}
       */
      randInt2(min,max){ return _randXYInclusive(min,max) },
      /**Get a random float between min and max.
       * @memberof module:mcfud/core._
       * @param {number} min
       * @param {number} max
       * @return {number}
       */
      randFloat(min, max){
        return min + PRNG() * (max-min)
      },
      /**Get a random float between -1 and 1.
       * @memberof module:mcfud/core._
       * @return {number}
       */
      randMinus1To1(){ return 2*(PRNG()-0.5) },
      /**Get a random int between 0 and num.
       * @memberof module:mcfud/core._
       * @param {number} num
       * @return {number}
       */
      randInt(num){ return MFL(PRNG()*num) },
      /**Get a random float between 0 and 1.
       * @memberof module:mcfud/core._
       * @return {number}
       */
      rand(js=false){ return js? Math.random(): PRNG() },
      /**Randomly choose -1 or 1.
       * @memberof module:mcfud/core._
       * @return {number}
       */
      randSign(){ return PRNG()>0.5 ? -1 : 1 },
      /**Check if obj is a sub-class of this parent-class.
       * @memberof module:mcfud/core._
       * @param {class} type
       * @param {object} obj
       * @return {boolean}
       */
      inst(type,obj){ return obj instanceof type },
      /**Calculate the hashCode of this string, like java's hashCode.
       * @memberof module:mcfud/core._
       * @param {string} s
       * @return {number}
       */
      hashCode(s){
        let n=0;
        for(let i=0; i<s.length; ++i)
          n= Math.imul(31, n) + s.charCodeAt(i)
        return n;
      },
      /**Randomly choose an item from this array.
       * @memberof module:mcfud/core._
       * @param {any[]} arr
       * @param {wantIndex} boolean
       * @return {any}
       */
      randItem(arr,wantIndex){
        let rc,i= -1;
        if(arr){
          switch(arr.length){
            case 0:
            case 1:
              rc=arr[i=0];
              break;
            case 2:
              rc= arr[i= this.randSign()>0?1:0];
              break;
            default:
              rc= arr[i= (MFL(PRNG()*arr.length))];
          }
        }
        return wantIndex ? [rc,i] : rc;
      },
      /**Check if string represents a percentage value.
       * @memberof module:mcfud/core._
       * @param {string} s
       * @return {boolean}
       */
      isPerc(s){
        return isStr(s) && s.match(/^([0-9])(\.?[0-9]+|[0-9]*)%$/)
      },
      /**Check if number is even.
       * @memberof module:mcfud/core._
       * @param {number} n
       * @return {boolean}
       */
      isEven(n){ return isEven(n) },
      /**Creates a javascript Map.
       * @memberof module:mcfud/core._
       * @param {...any} args data to initialize the Map
       * @return {map}
       */
      jsMap(...args){
        _pre(isEven,args.length,"even n# of args");
        let out=new Map();
        for(let i=0;i<args.length;){
          out.set(args[i],args[i+1]); i+=2; }
        return out;
      },
      /**Creates a javascript object.
       * @memberof module:mcfud/core._
       * @param {...any} args data to initialie the object
       * @return {object}
       */
      jsObj(...args){
        _pre(isEven,args.length,"even n# of args");
        let out={};
        for(let i=0;i<args.length;){
          out[args[i]]=args[i+1]; i+=2; }
        return out;
      },
      /**Creates a javascript array.
       * @memberof module:mcfud/core._
       * @param {...any} args data to initialize array
       * @return {any[]}
       */
      jsVec(...args){ return args.length===0 ? [] : args.slice() },
      /**Get the last index.
       * memberof module:mcfud/core._
       * @param {any[]} c
       * @return {number} -1 if c is empty or not an array
       */
      lastIndex(c){ return (isVec(c) && c.length>0) ? c.length-1 : -1 },
      /**Get the first element.
       * @memberof module:mcfud/core._
       * @param {any[]} c
       * @return {any} undefined if c is empty or not an array
       */
      first(c){ if(isVec(c) && c.length>0) return c[0] },
      /**Get the last element.
       * @memberof module:mcfud/core._
       * @param {any[]} c
       * @return {any} undefined if c is empty or not an array
       */
      last(c){ if(isVec(c) && c.length>0) return c[c.length-1] },
      /**
       * @memberof module:mcfud/core._
       * @see {@link module:mcfud/core._.first}
       */
      head(c){ return this.first(c) },
      /**
       * @memberof module:mcfud/core._
       * @see {@link module:mcfud/core._.last}
       */
      tail(c){ return this.last(c) },
      /**Get the floor of a number.
       * @memberof module:mcfud/core._
       * @param {number} v
       * @return {number}
       */
      floor(v){ return Math.floor(v) },
      /**Get the ceiling of a number.
       * @memberof module:mcfud/core._
       * @param {number} v
       * @return {number}
       */
      ceil(v){ return Math.ceil(v) },
      /**Get the absolute value of a number.
       * @memberof module:mcfud/core._
       * @param {number} v
       * @return {number}
       */
      abs(v){ return Math.abs(v) },
      /**Get the square root of a number.
       * @memberof module:mcfud/core._
       * @param {number} v
       * @return {number}
       */
      sqrt(v){ return Math.sqrt(v) },
      /**Choose min value from these numbers.
       * @memberof module:mcfud/core._
       * @param {...number} args
       * @return {number}
       */
      min(...args){ return Math.min(...args) },
      /**Choose max value from these numbers.
       * @memberof module:mcfud/core._
       * @param {...number} args
       * @return {number}
       */
      max(...args){ return Math.max(...args) },
      /**Take a slice of an array.
       * @memberof module:mcfud/core._
       * @param {any[]} a source
       * @param {number} i start index
       * @return {any[]}
       */
      slice(a,i){ return Slicer.call(a, i) },
      /**Check if *every* item in the list equals v.
       * @memberof module:mcfud/core._
       * @param {any[]} c
       * @param {any|function} v
       * @return {boolean}
       */
      every(c,v){
        _pre(isVec,c,"array");
        for(let i=0;i<c.length;++i){
          if(isFun(v)){
            if(!v(c[i])) return false;
          }else if(c[i] != v) return false;
        }
        return c.length>0;
      },
      /**Check if *every* item in the list not-equals v.
       * @memberof module:mcfud/core._
       * @param {array} c
       * @param {any|function} v
       * @return {boolean}
       */
      notAny(c,v){
        _pre(isVec,c,"array");
        for(let i=0;i<c.length;++i){
          if(isFun(v)){
            if(v(c[i])) return false;
          }else if(c[i] === v) return false;
        }
        return c.length>0;
      },
      /**Copy all or some items from `src` to `des`.
       * Does not *grow* the `des` array.
       * @memberof module:mcfud/core._
       * @param {any[]} des
       * @param {any[]} src
       * @return {any[]}
       */
      copy(des,src=[]){
        _preAnd([[isVec,des],[isVec,src]],"arrays");
        const len= Math.min(des.length,src.length);
        for(let i=0;i<len;++i) des[i]=src[i];
        return des;
      },
      /**Append all or some items from `src` to `des`.
       * @memberof module:mcfud/core._
       * @param {any[]} des
       * @param {any[]} src
       * @return {any[]}
       */
      append(des,src=[]){
        _preAnd([[isVec,des],[isVec,src]],"arrays");
        for(let i=0;i<src.length;++i) des.push(src[i]);
        return des;
      },
      /**Fill array with v.
       * @memberof module:mcfud/core._
       * @param {number|any[]} a if number, creates array of `a` size
       * @param {number|function} v
       * @return {any[]}
       */
      fill(a,v,...args){
        if(isNum(a)){a= new Array(a)}
        if(isVec(a))
          for(let i=0;i<a.length;++i)
            a[i]= isFun(v) ? v(i,...args) : v;
        return a;
      },
      /**Get the size of this input.
       * @memberof module:mcfud/core._
       * @param {object|array|string|map|set} o
       * @return {number}
       */
      size(o){
        return (isVec(o)||isStr(o)) ? o.length
                                    : (isSet(o)||isMap(o)) ? o.size
                                       : o ? this.keys(o).length : 0
      },
      /**Get the next sequence number.
       * @memberof module:mcfud/core._
       * @return {number}
       */
      nextId(){ return ++_seqNum },
      /**Get the current time in millis.
       * @memberof module:mcfud/core._
       * @return {number}
       */
      now(){ return Date.now() },
      /**Find the file extension.
       * @memberof module:mcfud/core._
       * @param {string} path
       * @return {string}
       */
      fileExt(path){ return _fext(path) },
      /**Find the file name, no extension.
       * @memberof module:mcfud/core._
       * @param {string} path
       * @return {string}
       */
      fileBase(path){
        let name,res,pos=path.indexOf("?");
        if(pos>0) path=path.substring(0,pos);
        path=path.replace(/(\/|\\\\)$/, "");
        res= BNAME.exec(path);
        name="";
        if(res){
          name=res[2];
          pos=name.lastIndexOf(".");
          if(pos>0) name=name.substring(0,pos);
        }
        return name;
      },
      /**Create a list of numbers from start to end,
       * like a `Range` object.
       * @memberof module:mcfud/core._
       * @param {number} start
       * @param {number} stop
       * @param {number} step
       * @return {number[]}
       */
      range(start,stop,step=1){
        if(arguments.length===1){
          stop=start; start=0; step=1; }
        let len = (stop-start)/step;
        const res=[];
        len= Math.ceil(len);
        len= Math.max(0,len);
        res.length=len;
        for(let i=0;i<len;++i){
          res[i] = start;
          start += step;
        }
        return res;
      },
      /**Shuffle items in this array.
       * @memberof module:mcfud/core._
       * @param {any[]} obj
       * @param {boolean} inplace true by default
       * @return {any[]}
       */
      shuffle(obj,inplace=true){
        _pre(isVec,obj,"array");
        const res=Slicer.call(obj,0);
        switch(res.length){
          case 0:
          case 1:
            break;
          case 2:
            if(this.randSign()>0){
              let a=res[0];
              res[0]=res[1];
              res[1]=a;
            }
            break;
          default:
            for(let x,j,i= res.length-1; i>0; --i){
              j= MFL(PRNG() * (i+1));
              x= res[i];
              res[i] = res[j];
              res[j] = x;
            }
        }
        return inplace?this.copy(obj,res):res;
      },
      shuffle2(obj,inplace=true){
        _pre(isVec,obj,"array");
        if(obj.length<3){
          obj= this.shuffle(obj,inplace)
        }else{
          const n = obj.length,
                res=Slicer.call(obj,0);
          for(let s,r,i=0; i<n; ++i){
            // choose index uniformly in [i, n-1]
            r = i + MFL(PRNG() * (n - i));
            s= obj[r];
            obj[r] = obj[i];
            obj[i] = s;
          }
        }
        return obj;
      },
      /**Get the distinct items only.
       * @memberof module:mcfud/core._
       * @param {any[]} arr
       * @return {any[]}
       */
      uniq(arr){
        _pre(isVec,arr,"array");
        if(false){
          let prev,res= [];
          Slicer.call(arr).sort().forEach(a=>{
            if(a !== undefined &&
               a !== prev) res.push(a);
            prev = a;
          });
          return res;
        }
        //faster?
        return Array.from(new Set(arr));
      },
      /**Functional map but return same type as `obj`.
       * @memberof module:mcfud/core._
       * @param {object|map|array} obj
       * @param {callback} fn
       * @param {any} target context for `fn`
       * @return {object|map|array}
       */
      map(obj, fn, target){
        _pre(isColl,obj,"array/map/object");
        if(isVec(obj)){
          return obj.map(fn,target);
        }else{
          const res=isMap(obj)?new Map():{};
          this.doseq(obj,(v,k)=>{
            this.assoc(res,k,fn.call(target,v,k,obj))})
          return res;
        }
      },
      /**`find` with extra arguments.
       * @memberof module:mcfud/core._
       * @param {object|map|array} coll
       * @param {callback} fn
       * @param {any} target
       * @return {array} [key,value] or undefined
       */
      find(coll,fn,target){
        let res,
            cont=true,
            args=Slicer.call(arguments,3);
        this.doseq(coll, (v,k)=>{
          if(cont && fn.apply(target, [v,k].concat(args))){
            res=[k,v];
            cont=false;
          }
        });
        return res;
      },
      /**`some` with extra arguments.
       * @memberof module:mcfud/core._
       * @param {object|map|array} coll
       * @param {callback} fn
       * @param {any} target
       * @return {any} undefined if not found
       */
      some(coll,fn,target){
        let res,
            cont=true,
            args=Slicer.call(arguments,3);
        this.doseq(coll,(v,k)=>{
          if(cont){
            res=fn.apply(target, [v,k].concat(args));
            if(res) cont=false; else res=undefined;
          }
        });
        return res;
      },
      /**Each item in the array is an object,
      * invoke obj.method with extra args.
      * @memberof module:mcfud/core._
      * @param {object[]} arr
      * @param {string} key method-name
      */
      invoke(arr,key){
        let args=Slicer.call(arguments,2);
        isVec(arr) &&
          //invoke the method on each object
          arr.forEach(o=> o[key].apply(o, args));
      },
      /**Run function after some delay.
       * @memberof module:mcfud/core._
       * @param {number} wait
       * @param {callback} f
       * @return {number} timeout id
       */
      delay(wait,f){ return setTimeout(f,wait) },
      /**Create a once/repeat timer.
       * @memberof module:mcfud/core._
       * @param {callback} f
       * @param {number} delay
       * @param {boolean} repeat default false
       * @return {object} timer handle, use handle.id to cancel
       */
      timer(f,delay=0,repeat=false){
        return {
          repeat: !!repeat,
          id: repeat ? setInterval(f,delay) : setTimeout(f,delay)
        };
      },
      /**Cancel a timer.
       * @memberof module:mcfud/core._
       * @param {object} handle
       */
      clear(handle){
        if(handle && handle.id){
          handle.repeat ? clearInterval(handle.id)
                        : clearTimeout(handle.id)
          handle.id=0;
        }else if(is.pos(handle)){
          clearTimeout(handle);
        }
      },
      /**Iterate n times, calling the provided function.
       * @memberof module:mcfud/core._
       * @param {number} n
       * @param {callback} fn
       * @param {any} target
       * @param {any} args
       */
      dotimes(n,fn,target,...args){
        for(let i=0;i<n;++i)
          fn.call(target,i, ...args);
      },
      /**Iterate a collection(array) in reverse.
       * @memberof module:mcfud/core._
       * @param {any[]} coll
       * @param {callback} fn
       * @param {any} target
       */
      rseq(coll,fn,target){
        _pre(isVec,coll,"array");
        if(coll.length>0)
          for(let i=coll.length-1;i>=0;--i)
            fn.call(target, coll[i],i,coll)
      },
      /**Iterate a collection.
       * @memberof module:mcfud/core._
       * @param {object|map|array} coll
       * @param {callback} fn
       * @param {any} target
       */
      doseq(coll,fn,target){
        if(isVec(coll)){
          coll.forEach(fn,target)
        }else if(isMap(coll)){
          coll.forEach((v,k)=> fn.call(target,v,k,coll))
        }else if(isObj(coll)){
          Object.keys(coll).forEach(k=> fn.call(target, coll[k], k, coll))
        }
      },
      /**Iterate but ignore nulls/undefs.
       * @memberof module:mcfud/core._
       * @see {@link module:mcfud/core._.doseq}
       */
      doseqEx(coll,fn,target){
        this.doseq(coll,(v,k)=>
          v!==undefined&&v!==null&&fn.call(target,v,k,coll))
      },
      /**Remove a key from collection.
       * @memberof module:mcfud/core._
       * @param {map|object} coll
       * @param {string} key
       * @return {any} previous value
       */
      dissoc(coll,key){
        if(arguments.length>2){
          let prev,i=1;
          for(;i<arguments.length;++i)
            prev=this.dissoc(coll,arguments[i]);
          return prev;
        }else{
          let prev;
          if(isMap(coll)){
            prev=coll.get(key);
            coll.delete(key);
          }else if(isObj(coll)){
            prev= coll[key];
            delete coll[key];
          }
          return prev;
        }
      },
      /**Get the value of property `key`.
       * @memberof module:mcfud/core._
       * @param {object|map} coll
       * @param {string} key
       * @return {any} undefined if not found
       */
      get(coll,key){
        if(key !== undefined){
          if(isMap(coll)) return coll.get(key);
          else if(coll) return coll[key];
        }
      },
      /**Assign value to property `key`.
       * @memberof module:mcfud/core._
       * @param {map|object} coll
       * @param {string} key
       * @param {any} value
       * @return {any} previous value
       */
      assoc(coll,key,value){
        if(arguments.length>3){
          if(((arguments.length-1)%2) !== 0)
            throw "wanted even count of args";
          let prev, i=1;
          for(;i<arguments.length;){
            prev= this.assoc(coll,arguments[i],arguments[i+1]);
            i+=2;
          }
          return prev;
        }else{
          let prev;
          if(isMap(coll)){
            prev=coll.get(key);
            coll.set(key,value);
          }else if(coll){
            prev=coll[key];
            coll[key]=value;
          }
          return prev;
        }
      },
      /**Remove an item from this array.
       * @memberof module:mcfud/core._
       * @param {any[]} coll
       * @param {any} item
       * @return {boolean} true if removed
       */
      disj(coll,item){
        const i = coll ? coll.indexOf(item) : -1;
        if(i > -1) coll.splice(i,1);
        return i > -1;
      },
      /**Append item to array.
       * @memberof module:mcfud/core._
       * @param {any[]} coll
       * @param {...any} items
       * @return {any[]} coll
       */
      conj(coll,...items){
        if(coll)
          items.forEach(o=> coll.push(o));
        return coll;
      },
      /**Make input-string into array.
       * @memberof module:mcfud/core._
       * @param {string} arg
       * @param {string|regex} sep
       * @return {any[]}
       */
      seq(arg,sep=/[,; \t\n]+/){
        if(typeof arg === "string")
          arg= arg.split(sep).map(s=>s.trim()).filter(s=>s.length>0);
        if(!isVec(arg)){arg = [arg]}
        return arg;
      },
      /**Check if collection has property `key`.
       * @memberof module:mcfud/core._
       * @param {array|map|object} coll
       * @param {any} key
       * @return {boolean}
       */
      has(coll,key){
        return arguments.length===1 ? false
          : isMap(coll) ? coll.has(key)
          : isVec(coll) ? coll.indexOf(key) !== -1
          : isObj(coll) ? is.own(coll, key) : false;
      },
      /**Add keys to `des` only if that key is absent.
       * @memberof module:mcfud/core._
       * @param {map|object} des
       * @param {object} additions
       * @return {map|object}
       */
      patch(des,additions){
        _pre(isObj,(des=des||{}),"object");
        if(additions)
          Object.keys(additions).forEach(k=>{
            if(!this.has(des,k))
              des[k]=additions[k];
          });
        return des;
      },
      /**Deep clone.
       * @memberof module:mcfud/core._
       * @param {any} obj
       * @return {any} obj's clone
       */
      clone(obj){
        return obj ? this.unpack(this.pack(obj)) : obj
      },
      /**Merge other objects into `des`.
       * @memberof module:mcfud/core._
       * @param {object} des
       * @param {...object} args
       * @return {object}
       */
      inject(des,...args){
        des=des || {};
        args.forEach(s=> s && completeAssign(des,s));
        return des;
      },
      /**Deep copy of array/nested arrays.
       * @memberof module:mcfud/core._
       * @param {any[]} v
       * @return {any[]}
       */
      deepCopyArray(v){
        _pre(isVec,v,"array");
        const out = [];
        for(let i=0,z=v.length; i<z; ++i)
          out[i]= isVec(v[i]) ? this.deepCopyArray(v[i]) : v[i];
        return out;
      },
      /**Deep merge of 2 objects.
       * @memberof module:mcfud/core._
       * @param {object} original
       * @param {object} extended
       * @return {object} a new object
      */
      mergeEx(original, extended){
        return this.merge(this.merge({}, original), extended)
      },
      /**Deep merge of 2 objects in-place.
       * @memberof module:mcfud/core._
       * @param {object} original
       * @param {object} extended
       * @return {object} the modified original object
      */
      merge(original, extended){
        let key,ext;
        Object.keys(extended).forEach(key=>{
          ext= extended[key];
          if(typeof ext !== "object" || ext === null || !original[key]){
            original[key] = ext;
          }else{
            if(typeof original[key] !== "object"){
              original[key] = ext instanceof Array ? [] : {}
            }
            this.merge(original[key], ext);
          }
        });
        return original;
      },
      /**
       * Creates a throttled function that only invokes `func` at most once per
       * every `wait` milliseconds (or once per browser frame). The throttled function
       * comes with a `cancel` method to cancel delayed `func` invocations and a
       * `flush` method to immediately invoke them. Provide `options` to indicate
       * whether `func` should be invoked on the leading and/or trailing edge of the
       * `wait` timeout. The `func` is invoked with the last arguments provided to the
       * throttled function. Subsequent calls to the throttled function return the
       * result of the last `func` invocation.
       */
      //original source: https://github.com/lodash/lodash/throttle.js
      throttle(func, wait, options){
        let leading = true
        let trailing = true

        if (typeof func !== 'function') {
          throw new TypeError('Expected a function')
        }
        if (isObj(options)) {
          leading = 'leading' in options ? !!options.leading : leading
          trailing = 'trailing' in options ? !!options.trailing : trailing
        }
        return this.debounce(func, wait, {
          leading,
          trailing,
          'maxWait': wait
        })
      },
      /**
       * Creates a debounced function that delays invoking `func` until after `wait`
       * milliseconds have elapsed since the last time the debounced function was
       * invoked, or until the next browser frame is drawn. The debounced function
       * comes with a `cancel` method to cancel delayed `func` invocations and a
       * `flush` method to immediately invoke them. Provide `options` to indicate
       * whether `func` should be invoked on the leading and/or trailing edge of the
       * `wait` timeout. The `func` is invoked with the last arguments provided to the
       * debounced function. Subsequent calls to the debounced function return the
       * result of the last `func` invocation.
      */
      //original source: https://github.com/lodash/lodash/debounce.js
      debounce(func, wait, options){
        let lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime

        let lastInvokeTime = 0
        let leading = false
        let maxing = false
        let trailing = true

        // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
        const useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function')

        if (typeof func !== 'function') {
          throw new TypeError('Expected a function')
        }
        wait = +wait || 0
        if (isObject(options)) {
          leading = !!options.leading
          maxing = 'maxWait' in options
          maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
          trailing = 'trailing' in options ? !!options.trailing : trailing
        }

        function invokeFunc(time) {
          const args = lastArgs
          const thisArg = lastThis

          lastArgs = lastThis = undefined
          lastInvokeTime = time
          result = func.apply(thisArg, args)
          return result
        }

        function startTimer(pendingFunc, wait) {
          if (useRAF) {
            root.cancelAnimationFrame(timerId)
            return root.requestAnimationFrame(pendingFunc)
          }
          return setTimeout(pendingFunc, wait)
        }

        function cancelTimer(id) {
          if (useRAF) {
            return root.cancelAnimationFrame(id)
          }
          clearTimeout(id)
        }

        function leadingEdge(time) {
          // Reset any `maxWait` timer.
          lastInvokeTime = time
          // Start the timer for the trailing edge.
          timerId = startTimer(timerExpired, wait)
          // Invoke the leading edge.
          return leading ? invokeFunc(time) : result
        }

        function remainingWait(time) {
          const timeSinceLastCall = time - lastCallTime
          const timeSinceLastInvoke = time - lastInvokeTime
          const timeWaiting = wait - timeSinceLastCall

          return maxing
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting
        }

        function shouldInvoke(time) {
          const timeSinceLastCall = time - lastCallTime
          const timeSinceLastInvoke = time - lastInvokeTime

          // Either this is the first call, activity has stopped and we're at the
          // trailing edge, the system time has gone backwards and we're treating
          // it as the trailing edge, or we've hit the `maxWait` limit.
          return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
        }

        function timerExpired() {
          const time = Date.now()
          if (shouldInvoke(time)) {
            return trailingEdge(time)
          }
          // Restart the timer.
          timerId = startTimer(timerExpired, remainingWait(time))
        }

        function trailingEdge(time) {
          timerId = undefined

          // Only invoke if we have `lastArgs` which means `func` has been
          // debounced at least once.
          if (trailing && lastArgs) {
            return invokeFunc(time)
          }
          lastArgs = lastThis = undefined
          return result
        }

        function cancel() {
          if (timerId !== undefined) {
            cancelTimer(timerId)
          }
          lastInvokeTime = 0
          lastArgs = lastCallTime = lastThis = timerId = undefined
        }

        function flush() {
          return timerId === undefined ? result : trailingEdge(Date.now())
        }

        function pending() {
          return timerId !== undefined
        }

        function debounced(...args) {
          const time = Date.now()
          const isInvoking = shouldInvoke(time)

          lastArgs = args
          lastThis = this
          lastCallTime = time

          if (isInvoking) {
            if (timerId === undefined) {
              return leadingEdge(lastCallTime)
            }
            if (maxing) {
              // Handle invocations in a tight loop.
              timerId = startTimer(timerExpired, wait)
              return invokeFunc(lastCallTime)
            }
          }
          if (timerId === undefined) {
            timerId = startTimer(timerExpired, wait)
          }
          return result
        }
        debounced.cancel = cancel
        debounced.flush = flush
        debounced.pending = pending
        return debounced
      },
      /**Create a function that will
      * flip the result of original func.
      * @memberof module:mcfud/core._
      * @param {function} func
      * @return {function} a wrapped function
      */
      negate(func){
        _pre(isFun,func,"function");
        return function(...args){
          return !func.apply(this, args)
        }
      },
      /**Maybe pad a string (right side.)
       * @memberof module:mcfud/core._
       * @param {string} str
       * @param {number} len
       * @param {string} s
       * @return {string}
      */
      strPadRight(str, len, s){
        return (len -= str.length)>0 ?
          str+new Array(Math.ceil(len/s.length)+1).join(s).substr(0, len) : str
      },
      /**Maybe pad a string (left side.)
       * @memberof module:mcfud/core._
       * @param {string} str
       * @param {number} len
       * @param {string} s
       * @return {string}
      */
      strPadLeft(str, len, s){
        return (len -= str.length)>0 ?
          new Array(Math.ceil(len/s.length)+1).join(s).substr(0, len) + str : str
      },
      /**Safely split a string, null and empty strings are removed.
       * @memberof module:mcfud/core._
       * @param {string} s
       * @param {string} sep
       * @return {string[]}
      */
      safeSplit(s, sep){
        return (s||"").trim().split(sep).filter(z=> z.length>0)
      },
      /**Capitalize the first char.
       * @memberof module:mcfud/core._
       * @param {string} str
       * @return {string}
       */
      capitalize(str){
        return str.charAt(0).toUpperCase() + str.slice(1)
      },
      /**Maybe pad the number with zeroes.
       * @memberof module:mcfud/core._
       * @param {number} num
       * @param {number} digits
       * @return {string}
      */
      prettyNumber(num, digits=2){
        return this.strPadLeft(Number(num).toString(), digits, "0")
      },
      /**Pretty print millis in nice
       * hour,minutes,seconds format.
       * @memberof module:mcfud/core._
       * @param {number} ms
       * @return {string}
       */
      prettyMillis(ms){
        let h,m,s= MFL(ms/1000);
        m=MFL(s/60);
        ms=ms-s*1000;
        s=s-m*60;
        h= MFL(m/60);
        m=m-h*60;
        let out=[];
        out.push(`${s}.${ms} secs`);
        if(m>0 || h>0)
          out.push(`${m} mins, `);
        if(h>0)
          out.push(`${h} hrs, `);
        return out.reverse().join("");
      },
      /**Remove some arguments from the front.
       * @memberof module:mcfud/core._
       * @param {arguments} args
       * @param {number} num
       * @return {any[]} remaining arguments
      */
      dropArgs(args, num){
        return args.length>num ? Slicer.call(args, num) : []
      },
      /**Check if url is secure.
       * @memberof module:mcfud/core._
       * @return {boolean}
       */
      isSSL(){
        return window && window.location && window.location.protocol.indexOf("https") >= 0
      },
      /**Check if url is mobile.
       * @memberof module:mcfud/core._
       * @param {object} navigator
       * @return {boolean}
       */
      isMobile(navigator){
        return navigator && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      /**Check if browser is safari.
       * @memberof module:mcfud/core._
       * @param {object} navigator
       * @return {boolean}
       */
      isSafari(navigator){
        return navigator && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
      },
      /**Check if url is cross-origin.
       * @memberof module:mcfud/core._
       * @param {string} url
       * @return {boolean}
       */
      isCrossOrigin(url) {
        let wnd=window;
        if(arguments.length===2 &&
           arguments[1].hack===911){ wnd=arguments[1] }
        if(wnd&&wnd.location&&url){
          const pos= url.indexOf("://");
          if(pos>0){
            let end= url.indexOf("/", pos+3);
            let o = end<0 ? url : url.substring(0, end);
            return o != wnd.location.origin;
          }
        }
      },
      /**Add an event listener to this target.
       * @memberof module:mcfud/core._
       * @param {string} event
       * @param {any} target
       * @param {callback} cb
       * @param {any} arg
       */
      addEvent(event,target,cb,arg){
        if(isVec(event) && arguments.length===1)
          event.forEach(e=> this.addEvent.apply(this, e));
        else
          target.addEventListener(event,cb,arg)
      },
      /**Remove this event listener from this target.
       * @memberof module:mcfud/core._
       * @param {string} event
       * @param {any} target
       * @param {callback} cb
       * @param {any} arg
       */
      delEvent(event,target,cb,arg){
        if(isVec(event) && arguments.length===1)
          event.forEach(e => this.delEvent.apply(this, e));
        else
          target.removeEventListener(event,cb,arg)
      }
    };

    /** @namespace module:mcfud/core.dom */
    const dom={
      /**Get a list of the document's elements that
       * match the specified selector(s).
       * @memberof module:mcfud/core.dom
       * @param {string} sel a valid CSS selector
       * @return {NodeList}
       */
      qSelector(sel){ return doco.querySelectorAll(sel) },
      /**Get the element whose id property
       * matches the specified string.
       * @memberof module:mcfud/core.dom
       * @param {string} id
       * @return {Element} undefined if not found
       */
      qId(id){ return doco.getElementById(id) },
      /**Get the parent node.
       * @memberof module:mcfud/core.dom
       * @param {Node}
       * @return {Node} undefined if not found
       */
      parent(e){ if(e) return e.parentNode },
      /**Adds a node to the parent, will be added to the end.
       * @memberof module:mcfud/core.dom
       * @param {Node} par
       * @param {Node}
       * @return {Node} the child
       */
      conj(par,child){ return par.appendChild(child) },
      /**Get a live HTMLCollection of elements with the given tag name.
       * @memberof module:mcfud/core.dom
       * @param {string} tag
       * @param {string} ns namespaceURI
       * @return {HTMLCollection}
       */
      byTag(tag, ns){
        return !isStr(ns) ? doco.getElementsByTagName(id)
                          : doco.getElementsByTagNameNS(ns,tag) },
      /**Get or set attributes on this element.
       * @memberof module:mcfud/core.dom
       * @param {Element} e
       * @param {object|string} attrs
       * @return {Element} e
       */
      attrs(e, attrs){
        if(!isObj(attrs) && attrs){
          if(arguments.length > 2)
            e.setAttribute(attrs, arguments[2]);
          return e.getAttribute(attrs);
        }
        if(attrs)
          _.doseq(attrs, (v,k)=> e.setAttribute(k,v));
        return e;
      },
      /**Get or set CSS styles on this element.
       * @memberof module:mcfud/core.dom
       * @param {Element} e
       * @param {object|string} styles
       * @return {Element} e
       */
      css(e, styles){
        if(!isObj(styles) && styles){
          if(arguments.length > 2)
            e.style[styles]= arguments[2];
          return e.style[styles];
        }
        if(styles)
          _.doseq(styles, (v,k)=> e.style[k]=v);
        return e;
      },
      /**Insert a container node between the child and it's current parent,
       * for example, par <- child will become par <- wrapper <- child.
       * @memberof module:mcfud/core.dom
       * @param {Node} child
       * @param {Node} wrapper
       * @return {Node} wrapper
       */
      wrap(child,wrapper){
        const p=child.parentNode;
        wrapper.appendChild(child);
        p.appendChild(wrapper);
        return wrapper;
      },
      /**Create a new element, and maybe assign attributes/styles.
       * @memberof module:mcfud/core.dom
       * @param {string} tag
       * @param {object} attributes
       * @param {object} styles
       * @return {Element}
       */
      newElm(tag, attrs, styles){
        const e = doco.createElement(tag);
        this.attrs(e,attrs);
        this.css(e,styles);
        return e;
      },
      /**Create a new text node, and maybe assign attributes/styles.
       * @memberof module:mcfud/core.dom
       * @param {string} tag
       * @param {object} attributes
       * @param {object} styles
       * @return {Node}
       */
      newTxt(tag, attrs, styles){
        const e = doco.createTextNode(tag);
        this.attrs(e,attrs);
        this.css(e,styles);
        return e;
      }
    };

    /**
     * @ignore
     */
    const NULL={};
    /**
     * @ignore
     */
    const ZA=[];

    /**Publish-subscribe
     * @class
     */
    class CEventBus{
      constructor(){
        this._tree=new Map();
        this._targets=new Map();
      }
      /**
       * Subscribe to an event.
       * @param {any[]} [event,target]
       * @param {callback} cb
       * @param {any} ctx
       * @param {array} extras
       * @return {CEventBus} self
       */
      sub(subject,cb,ctx,extras){
        let event=subject[0],
            target=subject[1];
        //remember each target
        if(target && !this._targets.has(target)){
          this._targets.set(target,1)
        }
        //handle multiple events in one string
        _.seq(event).forEach(e=>{
          if(!cb) cb=e;
          if(isStr(cb)) { ctx=ctx || target; cb=ctx[cb]; }
          if(!cb) throw "Error: no callback for sub()";
          if(!this._tree.has(e)) this._tree.set(e, _.jsMap());
          let m= this._tree.get(e);
          target=target||NULL;
          !m.has(target) && m.set(target,[]);
          m.get(target).push([cb,ctx,extras]);
        });
        return this;
      }
      /**
       * Trigger an event.
       * @param {any[]} [event,target]
       * @param {...any} args
       * @return {CEventBus} self
       */
      pub(subject,...args){
        let m,t,
            event=subject[0],
            target=subject[1] || NULL;
        if(target === NULL ||
           this._targets.has(target)){
          _.seq(event).forEach(e=>{
            t=this._tree.get(e);
            m= t && t.get(target);
            m && m.forEach(s=>{
              s[0].apply(s[1],args.concat(s[2] || ZA));
            });
          });
        }
        return this;
      }
      /**
       * Remove all subscribers.
       * @return {CEventBus} self
       */
      reset(){
        this._targets.clear();
        this._tree.clear();
        return this;
      }
      drop(target){
        if(this._targets.has(target)){
          this._targets.delete(target);
          let it=this._tree.values();
          for(let r=it.next(); !r.done;){
            r.value.delete(target);
            r=it.next();
          }
        }
        return this;
      }
      /**
       * Unsubscribe to an event.
       * @param {any[]} [event,target]
       * @param {callback} cb
       * @param {any} ctx
       * @return {CEventBus} self
       */
      unsub(subject,cb,ctx){
        if(arguments.length===1 && !is.vec(subject)){
          this.drop(subject);
        }else{
          let event=subject[0],
              target=subject[1] || NULL;
          if(target === NULL ||
             this._targets.has(target)){
            let t,m, es=_.seq(event);
            es.forEach(e=>{
              t= this._tree.get(e);
              m= t && t.get(target);
              if(m){
                if(isStr(cb)) { ctx=ctx || target; cb=ctx[cb]; }
                if(cb)
                  for(let i= m.length-1;i>=0;--i)
                    if(m[i][0] === cb && m[i][1] === ctx) m.splice(i,1);
              }
            });
          }
        }
        return this;
      }
    }

    /**Create a pub/sub event manager.
     * @memberof module:mcfud/core
     * @return {CEventBus}
     */
    function EventBus(){
      return new CEventBus()
    }

    //browser only--------------------------------------------------------------
    if(doco){ _$.dom=dom }else{
      delete _["addEvent"];
      delete _["delEvent"];
    }

    _$.EventBus=EventBus;
    _$.is=is;
    _$.u=_;

    return _$;
  }

  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module==="object" && module.exports){
    module.exports=_module()
  }else{
    window["io/czlab/mcfud/core"]=_module
  }

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
   */
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    //const EPSILON= 0.0000000001;
    const NEG_DEG_2PI= -360;
    const DEG_2PI= 360;
    const TWO_PI= 2*Math.PI;
    const PI= Math.PI;
    const {is,u:_}= Core;

    /**
     * @module mcfud/math
     */

    /** @ignore */
    function _mod_deg(deg){
      return deg<0 ? -(-deg%DEG_2PI) : deg%DEG_2PI }

    const _$={
      /**Liner interpolation.
       * @memberof module:mcfud/math
       * @param {number} startv
       * @param {number} endv
       * @param {number} t
       * @return {number}
       */
      lerp(startv, endv, t){
        return (1-t) * startv + t * endv
      },
      /**The modulo operator.
       * @memberof module:mcfud/math
       * @param {number} x
       * @param {number} N
       * @return {number}
       */
      xmod(x,N){
        return x<0 ? x-(-(N + N*Math.floor(-x/N))) : x%N
      },
      /**Limit the value to within these 2 numbers.
       * @memberof module:mcfud/math
       * @param {number} min
       * @param {number} max
       * @param {number} v a value
       * @return {number}
       */
      clamp(min,max,v){
        return v<min ? min : (v>max ? max : v)
      },
      /**Square a number.
       * @memberof module:mcfud/math
       * @param {number} a
       * @return {number} q^2
       */
      sqr(a){ return a*a },
      /**Check if 2 numbers are approximately the same.
       * @memberof module:mcfud/math
       * @param {number} a
       * @param {number} b
       * @return {boolean}
       */
      fuzzyEq(a,b){ return _.feq(a,b) },
      /**Check if the number is approximately zero.
       * @memberof module:mcfud/math
       * @param {number} n
       * @return {boolean}
       */
      fuzzyZero(n){ return _.feq0(n) },
      /**Convert radians to degrees.
       * @memberof module:mcfud/math
       * @param {number} r
       * @return {number} degrees
       */
      radToDeg(r){ return _mod_deg(DEG_2PI * r/TWO_PI) },
      /**Convert degrees to radians.
       * @memberof module:mcfud/math
       * @param {number} d
       * @return {number} radians
       */
      degToRad(d){ return TWO_PI * _mod_deg(d)/DEG_2PI },
      /**Hypotenuse squared.
       * @memberof module:mcfud/math
       * @param {number} x
       * @param {number} y
       * @return {number}
       */
      pythag2(x,y){ return x*x + y*y },
      /**Hypotenuse.
       * @memberof module:mcfud/math
       * @param {number} x
       * @param {number} y
       * @return {number}
       */
      pythag(x,y){ return Math.sqrt(x*x + y*y) },
      /** @ignore */
      wrap(i,len){ return (i+1) % len },
      /**Is it more a or b?
       * @ignore
       */
      biasGreater(a,b){
        const biasRelative= 0.95;
        const biasAbsolute= 0.01;
        return a >= (b*biasRelative + a*biasAbsolute)
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/math"]=_module
  }

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2020-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Creates the module.
  */
  function _module(Core=null){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_, is}= Core;

    function assertArgs(a,b){
      _.assert(!is.num(a) && !is.num(b) && a && b, "wanted 2 vecs");
    }

    function assertArg(a){
      _.assert(!is.num(a) && a, "wanted vec");
    }

    function _ctor(b,x=0,y=0){ return b ? [x,y] : {x:x,y:y} }

    const MVPool={};

    class MV{
      constructor(){
        this.x=0;
        this.y=0;
      }
      unit(out){
        if(is.bool(out)){ out=_ctor(out) }
        if(is.vec(out)){out[0]=this.x;out[1]=this.y}else{
          out.x=this.x;out.y=this.y;
        }
        return out;
      }
      bind(v){
        if(is.vec(v)){this.x=v[0];this.y=v[1]}else{
          this.x=v.x;this.y=v.y
        }
        return this;
      }
      op(code,b,c){
        let out=MVPool.take();
        out.x=this.x;
        out.y=this.y;
        switch(code){
          case"+":
            if(is.num(b)) out.x += b;
            if(is.num(c)) out.y += c;
            break;
          case"-":
            if(is.num(b)) out.x -= b;
            if(is.num(c)) out.y -= c;
            break;
          case"*":
            if(is.num(b)) out.x *= b;
            if(is.num(c)) out.y *= c;
            break;
          case "/":
            if(is.num(b)) out.x /= b;
            if(is.num(c)) out.y /= c;
            break;
        }
        return out;
      }
      "+"(m){ return this.op("+",m.x,m.y) }
      "-"(m){ return this.op("-",m.x,m.y) }
      "*"(m){ return this.op("*",m.x,m.y) }
      "/"(m){ return this.op("/",m.x,m.y) }
    }

    _.inject(MVPool,{
      take(){ return this._pool.pop() },
      drop(...args){
        args.forEach(a=>{
          a.x=0;a.y=0;
          this._pool.push(a); })
      },
      _pool:_.fill(16,()=>new MV())
    });

    /** @module mcfud/vec2 */

    /**
     * @typedef {number[]} Vec2
     */

    /**Rotate a vector around a pivot. */
    function _v2rot(ax,ay,cos,sin,cx,cy,out){
      const x_= ax-cx;
      const y_= ay-cy;
      const x= cx+(x_*cos - y_*sin);
      const y= cy+(x_ * sin + y_ * cos);
      if(is.vec(out)){
        out[0]=x;out[1]=y;
      }else{
        out.x=x;out.y=y;
      }
      return out;
    }

    function _opXXX(a,b,op,local){
      let p1=MVPool.take().bind(a);
      let out,pr;
      if(is.num(b)){
        pr=p1.op(op,b,b);
      }else{
        let p2=MVPool.take().bind(b);
        pr=p1[op](p2);
        MVPool.drop(p2);
      }
      out=pr.unit(local?a:is.vec(a));
      MVPool.drop(p1,pr);
      return out;
    }

    const _$={
      /**Create a free vector.
       * @memberof module:mcfud/vec2
       * @param {number} x
       * @param {number} y
       * @return {Vec2}
       */
      vec(x=0,y=0){ return _ctor(true,x,y) },
      /**Create a free vector.
       * @memberof module:mcfud/vec2
       * @param {number} x
       * @param {number} y
       * @return {object}
       */
      vecXY(x=0,y=0){ return _ctor(false,x,y) },
      /**Vector addition: A+B.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      add(a,b){
        return _.assert(arguments.length===2) && _opXXX(a,b,"+") },
      /**Vector addition: A=A+B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      add$(a,b){
        return _.assert(arguments.length===2) && _opXXX(a,b,"+",true) },
      /**Vector subtraction: A-B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      sub(a,b){
        return _.assert(arguments.length===2) && _opXXX(a,b,"-") },
      /**Vector subtraction: A=A-B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      sub$(a,b){
        return _.assert(arguments.length===2) && _opXXX(a,b,"-",true) },
      /**Vector multiply: A*B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      mul(a,b){
        return _.assert(arguments.length===2) && _opXXX(a,b,"*") },
      /**Vector multiply: A=A*B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      mul$(a,b){
        return _.assert(arguments.length===2) && _opXXX(a,b,"*",true) },
      /**Vector division: A/B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      div(a,b){
        return _.assert(arguments.length===2) && _opXXX(a,b,"/") },
      /**Vector division: A=A/B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      div$(a,b){
        return _.assert(arguments.length===2) && _opXXX(a,b,"/",true) },
      /**Dot product of 2 vectors,
       * cos(t) = a·b / (|a| * |b|)
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {number}
       */
      dot(a,b){
        assertArgs(a,b);
        let p1=MVPool.take().bind(a);
        let p2=MVPool.take().bind(b);
        let out=p1.x*p2.x + p1.y*p2.y;
        MVPool.drop(p1,p2);
        return out;
      },
      /**Check if these 2 points are equal.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {boolean}
       */
      equals(a,b){
        let p1=MVPool.take().bind(a);
        let p2=MVPool.take().bind(b);
        ok= p1.x==p2.x && p1.y==p2.y;
        MVPool.drop(p1,p2);
        return ok;
      },
      /**Create a vector A->B, calculated by doing B-A.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {Vec2}
       */
      vecAB(a,b){
        assertArgs(a,b);
        let p1=MVPool.take().bind(a);
        let p2=MVPool.take().bind(b);
        let pr=MVPool.take();
        pr.x=p2.x-p1.x;
        pr.y=p2.y-p1.y;
        let out=pr.unit(is.vec(a));
        MVPool.drop(p1,p2,pr);
        return out;
      },
      /**Vector length squared.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @return {number}
       */
      len2(a){ return this.dot(a,a) },
      /**Length of a vector.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @return {number}
       */
      len(a){ return Math.sqrt(this.len2(a)) },
      /**Distance between 2 vectors, squared.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {number}
       */
      dist2(a,b){
        return this.len2( this.sub(b,a))
      },
      /**Distance between 2 vectors.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {number}
       */
      dist(a,b){ return Math.sqrt(this.dist2(a,b)) },
      /**Normalize this vector: a/|a|
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @return {Vec2} undefined if zero length
       */
      unit(a){
        let p1=MVPool.take().bind(a);
        let d=this.len(a);
        if(_.feq0(d)){
          p1.x=0;
          p1.y=0;
        }else{
          p1.x /= d;
          p1.y /= d;
        }
        let out= p1.unit(is.vec(a));
        MVPool.drop(p1);
        return out;
      },
      /**Normalize this vector: a=a/|a|
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @return {Vec2} undefined if zero length
       */
      unit$(a){
        let p1=MVPool.take().bind(a);
        let d=this.len(a);
        if(_.feq0(d)){
          p1.x=0;
          p1.y=0;
        }else{
          p1.x /= d;
          p1.y /= d;
        }
        let out= p1.unit(a);
        MVPool.drop(p1);
        return out;
      },
      /**Copy `src` into `des`.
       * @memberof module:mcfud/vec2
       * @param {Vec2} des
       * @param {Vec2} src
       * @return {Vec2}
       */
      copy(des,src){
        assertArgs(des,src);
        let p1=MVPool.take().bind(des);
        let p2=MVPool.take().bind(src);
        p1.x=p2.x;
        p1.y=p2.y;
        let out= p1.unit(des);
        MVPool.drop(p1,p2);
        return out;
      },
      /**Make a copy of this vector.
       * @memberof module:mcfud/vec2
       * @param {Vec2} v
       * @return {Vec2}
       */
      clone(v){
        let p1= MVPool.take().bind(v);
        let out= p1.unit(is.vec(v));
        MVPool.drop(p1);
        return out;
      },
      /**Copy values(args) into `des`.
       * @memberof module:mcfud/vec2
       * @param {Vec2} des
       * @param {number} x
       * @param {number} y
       * @return {Vec2}
       */
      set(des,x,y){
        let p1= MVPool.take().bind(des);
        if(is.num(x)) p1.x=x;
        if(is.num(y)) p1.y=y;
        let out= p1.unit(des);
        MVPool.drop(p1);
        return out;
      },
      /**Copy value into `v`.
       * @memberof module:mcfud/vec2
       * @param {Vec2} v
       * @param {number} x
       * @return {Vec2}
       */
      setX(v,x){
        return this.set(v,x) },
      /**Copy value into `v`.
       * @memberof module:mcfud/vec2
       * @param {Vec2} v
       * @param {number} y
       * @return {Vec2}
       */
      setY(v,y){
        return this.set(v,null,y) },
      /**Rotate a vector around a pivot.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number} rot
       * @param {Vec2} [pivot]
       * @return {Vec2}
       */
      rot(a,rot,pivot=null){
        let p1= MVPool.take().bind(a);
        let cx=0,cy=0;
        if(pivot){
          let p2=MVPool.take().bind(pivot);
          cx=p2.x;
          cy=p2.y;
          MVPool.drop(p2);
        }
        let out= _v2rot(p1.x,p1.y,
                        Math.cos(rot),
                        Math.sin(rot), cx,cy,_ctor(is.vec(a)));
        MVPool.drop(p1);
        return out;
      },
      /**Rotate a vector around a pivot: a=rot(a,...)
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number} rot
       * @param {Vec2} [pivot]
       * @return {Vec2}
       */
      rot$(a,rot,pivot){
        let p1= MVPool.take().bind(a);
        let cx=0,cy=0;
        if(pivot){
          let p2=MVPool.take().bind(pivot);
          cx=p2.x;
          cy=p2.y;
          MVPool.drop(p2);
        }
        let out= _v2rot(p1.x,p1.y,
                        Math.cos(rot),
                        Math.sin(rot), cx,cy,a);
        MVPool.drop(p1);
        return out;
      },
      /**2d cross product.
       * The sign of the cross product (AxB) tells you whether the 2nd vector (B)
       * is on the left or right side of the 1st vector (A), +ve implies
       * B is left of A, (rotate ccw to B), -ve means B is right of A (rotate cw to B).
       * The absolute value of the 2D cross product is the sine of the angle
       * in between the two vectors.
       * @memberof module:mcfud/vec2
       * @param {number|Vec2} p1
       * @param {number|Vec2} p2
       * @return {number|Vec2}
       */
      cross(p1,p2){
        let out;
        if(is.num(p1)){
          let b= MVPool.take().bind(p2);
          let r= MVPool.take();
          r.x=-p1 * b.y;
          r.y=p1 * b.x;
          out=r.unit(is.vec(p2));
          MVPool.drop(b,r);
        }
        else if(is.num(p2)){
          let b= MVPool.take().bind(p1);
          let r= MVPool.take();
          r.x=p2 * b.y;
          r.y= -p2 * b.x;
          out=r.unit(is.vec(p1));
          MVPool.drop(b,r);
        }else{
          assertArgs(p1,p2);
          let a= MVPool.take().bind(p1);
          let b= MVPool.take().bind(p2);
          out= a.x * b.y - a.y * b.x;
          MVPool.drop(a,b);
        }
        return out;
      },
      /**Angle (in radians) between these 2 vectors.
       * a.b = cos(t)*|a||b|
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {number}
       */
      angle(a,b){ return Math.acos(this.dot(a,b)/(this.len(a)*this.len(b))) },
      /**Change vector to be perpendicular to what it was before, effectively
       * rotates it 90 degrees(normal).
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {boolean} ccw counter-clockwise?
       * @return {Vec2}
       */
      normal(a,ccw=false){
        let p1=MVPool.take().bind(a);
        let pr=MVPool.take();
        if(ccw){
          pr.x= -p1.y;
          pr.y= p1.x;
        }else{
          pr.x= p1.y;
          pr.y= -p1.x;
        }
        let out= pr.unit(is.vec(a));
        MVPool.drop(p1,pr);
        return out;
      },
      /**Change vector to be perpendicular to what it was before, effectively
       * rotates it 90 degrees(normal), A=normal(A).
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {boolean} ccw counter-clockwise?
       * @return {Vec2}
       */
      normal$(a,ccw=false){
        let p1=MVPool.take().bind(a);
        let pr=MVPool.take();
        if(ccw){
          pr.x= -p1.y;
          pr.y= p1.x;
        }else{
          pr.x= p1.y;
          pr.y= -p1.x;
        }
        let out= pr.unit(a);
        MVPool.drop(p1,pr);
        return out;
      },
      /**Find scalar projection A onto B.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {number}
       */
      proj_scalar(a,b){ return this.dot(a,b)/this.len(b) },
      /**Find vector A projection onto B.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {Vec2}
       */
      proj(a,b){
        const bn = this.unit(b);
        this.mul$(bn, this.dot(a,bn));
        let pr=MVPool.take().bind(bn);
        let out=pr.unit(is.vec(a));
        MVPool.drop(pr);
        return out;
      },
      /**Find the perpedicular vector.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {Vec2}
       */
      perp(a,b){ return this.sub(a, this.proj(a,b)) },
      /**Reflect a ray, normal must be normalized.
       * @memberof module:mcfud/vec2
       * @param {Vec2} ray
       * @param {Vec2} surface_normal
       * @return {Vec2}
       */
      reflect(ray,surface_normal){
        //ray of light hitting a surface, find the reflected ray
        //reflect= ray - 2(ray.surface_normal)surface_normal
        let v= 2*this.dot(ray,surface_normal);
        return this.sub(ray, this.mul(surface_normal, v));
      },
      /**Negate a vector.
       * @memberof module:mcfud/vec2
       * @param {Vec2} v
       * @return {Vec2}
       */
      flip(v){ return this.mul(v, -1) },
      /**Negate a vector, v=flip(v).
       * @memberof module:mcfud/vec2
       * @param {Vec2} v
       * @return {Vec2}
       */
      flip$(v){ return this.mul$(v, -1) },
      /**Move a bunch of points.
       * @memberof module:mcfud/vec2
       * @param {Vec2} pos
       * @param {...Vec2} args
       * @return {Vec2[]}
       */
      translate(pos,...args){
        let pr,p2,p1=MVPool.take().bind(pos);
        let ret,out;
        if(args.length===1 && is.vec(args[0]) && !is.num(args[0][0])){
          args=args[0];
        }
        ret=args.map(a=>{
          p2=MVPool.take().bind(a);
          pr=p2["+"](p1);
          out= pr.unit(is.vec(a));
          MVPool.drop(p2,pr);
          return out;
        });
        MVPool.drop(p1);
        return ret;
      }
    };
    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/vec2"]=_module
  }

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2020-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
   */
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const ATAN2= Math.atan2;
    const COS= Math.cos;
    const SIN= Math.sin;
    const TAN= Math.tan;
    const MFL=Math.floor;
    const {u:_, is}= Core;

    /**
     * @module mcfud/matrix
     */

    /**
     * @typedef {object} MatrixObject
     * @property {number[]} dim size of the matrix[row,col]
     * @property {number[]} cells internal data
     */

    /**
     * @typedef {number[]} Vec3
     */

    /**
     * @typedef {number[]} VecN
     */

    /** @ignore */
    function _arrayEq(a1,a2){
      //2 numeric arrays are equal?
      for(let i=0;i<a1.length;++i){
        if(!_.feq(a1[i],a2[i])) return false }
      return true
    }

    /** @ignore */
    function _odd(n){ return n%2 !== 0 }

    /** @ignore */
    function _cell(rows,cols,r,c){
      //index where matrix is mapped to 1D array.
      return (c-1) + ((r-1)*cols)
    }

    /** @ignore */
    function _matnew(rows,cols,cells){
      return {dim: [rows,cols], cells: cells}
    }

    /** @ignore */
    function _new_mat(rows,cols){
      return _matnew(rows,cols, _.fill(rows*cols,0))
    }

    const _$={
      /** @ignore */
      v4(x=0,y=0,z=0,K=0){ return [x,y,z,K] },
      /**Create a 3D vector.
       * @memberof module:mcfud/matrix
       * @param {number} x
       * @param {number} y
       * @param {number} z
       * @return {Vec3}
       */
      v3(x=0,y=0,z=0){ return [x,y,z] },
      /**Dot product of 3D vectors.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @param {Vec3} b
       * @return {number}
      */
      dot(a,b){
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
      },
      /**Cross product of 2 3D vectors.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @param {Vec3} b
       * @return {Vec3}
       */
      cross(a,b){
        return this.v3(a[1] * b[2] - a[2] * b[1],
                       a[2] * b[0] - a[0] * b[2],
                       a[0] * b[1] - a[1] * b[0])
      },
      /**The length of this vector, squared.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @return {number}
       */
      len2(a){ return this.dot(a,a) },
      /**The length of this vector.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @return {number}
       */
      len(a){ return Math.sqrt(this.len2(a)) },
      /**Normalize this vector, if possible.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @return {Vec3} undefined if error
       */
      unit(a){
        let d=this.len(a);
        if(!_.feq0(d))
          return [a[0]/d, a[1]/d, a[2]/d];
      },
      /**Vector operation A - B.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @param {number|Vec3} b
       * @return {Vec3}
       */
      sub(a,b){
        return is.num(b) ? this.v3(a[0]-b, a[1]-b, a[2]-b)
                         : this.v3(a[0]-b[0], a[1]-b[1], a[2]-b[2])
      },
      /**Vector operation A + B.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @param {number|Vec3} b
       * @return {Vec3}
       */
      add(a,b){
        return is.num(b) ? this.v3(a[0]+b, a[1]+b, a[2]+b)
                         : this.v3(a[0]+b[0], a[1]+b[1], a[2]+b[2])
      },
      /**Vector operation A x B.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @param {number|Vec3} b
       * @return {Vec3}
       */
      mul(a,b){
        return is.num(b) ? this.v3(a[0]*b, a[1]*b, a[2]*b)
                         : this.v3(a[0]*b[0], a[1]*b[1], a[2]*b[2])
      },
      /**Vector operation A / B.
       * @memberof module:mcfud/matrix
       * @param {Vec3} a
       * @param {number|Vec3} b
       * @return {Vec3}
       */
      div(a,b){
        return is.num(b) ? this.v3(a[0]/b, a[1]/b, a[2]/b)
                         : this.v3(a[0]/b[0], a[1]/b[1], a[2]/b[2])
      },
      /**Create a matrix.
       * @memberof module:mcfud/matrix
       * @param {number[]} [rows,cols]
       * @param {...number} args values for the matrix (row-major)
       * @return {MatrixObject} new matrix
       */
      matrix([rows,cols],...args){
        const sz= rows*cols;
        return args.length===0 ? _new_mat(rows,cols)
                               : _.assert(sz===args.length) && _matnew(rows,cols,args)
      },
      /**Get or set the value at this position.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m
       * @param {number} row
       * @param {number} col
       * @param {number} [value]
       * @return {number|MatrixObject}
       */
      matCell(m,row,col,value){
        const c= _cell(m.dim[0],m.dim[1],row,col);
        if(c>=0 && c<m.cells.length){
          if(is.num(value)){
            m.cells[c]=value; return m }
          return m.cells[c]
        }
      },
      /**Create an `Identity` matrix.
       * @memberof module:mcfud/matrix
       * @param {number} sz  size of the matrix
       * @return {MatrixObject} new matrix
       */
      matIdentity(sz){
        const out=_.assert(sz>0) &&
                  _.fill(sz*sz,0);
        for(let i=0;i<sz;++i)
          out[_cell(sz,sz,i+1,i+1)] = 1;
        return _matnew(sz, sz, out);
      },
      /**Create a matrix of zeroes.
       * @memberof module:mcfud/matrix
       * @param {number} sz  size of the matrix
       * @return {MatrixObject} new matrix
       */
      matZero(sz){
        return _.assert(sz>0) &&
               _matnew(sz,sz,_.fill(sz*sz,0))
      },
      /**Get the rows of this matrix,
       * for example, if the matrix is
       * [1 230
       *  0 1 0
       *  0 0 1] then the rows majors are
       *  [1 2 3], [0 1 0], [0 0 1]
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {number[][]}
       */
      matRowMajors(m){
        const [rows,cols]=m.dim;
        return _.partition(cols,m.cells)
      },
      /**Get the cols of this matrix,
       * for example, if the matrix is
       * [1 2 3
       *  4 5 6
       *  7 8 9] then the column majors are
       *  [1 4 7], [2 5 8], [7 8 9]
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {number[][]}
       */
      matColMajors(m){
        const [rows,cols]=m.dim;
        const out=[];
        for(let a,c=0;c<cols;++c){
          a=[];
          for(let r=0;r<rows;++r){
            a.push(m.cells[r*cols+c])
          }
          out.push(a)
        }
        return out;
      },
      /**Create a 2x2 matrix.
       * @memberof module:mcfud/matrix
       * @param {number} _11
       * @param {number} _12
       * @param {number} _21
       * @param {number} _22
       * @return {MatrixObject} new matrix
       */
      mat2(_11,_12,_21,_22){
        return this.matrix([2,2],_11,_12,_21,_22)
      },
      /**Create a 3x3 matrix.
       * @memberof module:mcfud/matrix
       * @param {number} _11
       * @param {number} _12
       * @param {number} _13
       * @param {number} _21
       * @param {number} _22
       * @param {number} _23
       * @param {number} _31
       * @param {number} _32
       * @param {number} _33
       * @return {MatrixObject} new matrix
       */
      mat3(_11,_12,_13,_21,_22,_23,_31,_32,_33){
        return this.matrix([3,3], _11,_12,_13,_21,_22,_23,_31,_32,_33)
      },
      /**Create a 4x4 matrix.
       * @memberof module:mcfud/matrix
       * @param {number} _11
       * @param {number} _12
       * @param {number} _13
       * @param {number} _14
       * @param {number} _21
       * @param {number} _22
       * @param {number} _23
       * @param {number} _24
       * @param {number} _31
       * @param {number} _32
       * @param {number} _33
       * @param {number} _34
       * @param {number} _41
       * @param {number} _42
       * @param {number} _43
       * @param {number} _44
       * @return {MatrixObject} new matrix
       */
      mat4(_11,_12,_13,_14,_21,_22,_23,_24,
           _31,_32,_33,_34, _41,_42,_43,_44){
        return this.matrix([4,4],
                           _11,_12,_13,_14,_21,_22,_23,_24,
                           _31,_32,_33,_34,_41,_42,_43,_44)
      },
      /**Check if these 2 matrices are equal.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} a matrix A
       * @param {MatrixObject} b matrix B
       * @return {boolean}
       */
      matEq(a,b){
        return a.dim[0]===b.dim[0] &&
               a.dim[1]===b.dim[1] && _arrayEq(a.cells,b.cells)
      },
      /**Transpose this matrix.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {MatrixObject} new matrix
       */
      matXpose(m){
        const [rows,cols]= m.dim;
        const sz=rows*cols;
        const tmp=[];
        for(let i=0;i<sz;++i)
          tmp.push(m.cells[MFL(i/rows) + cols*(i%rows)]);
        return _matnew(cols,rows,tmp)
      },
      /**Multiply this matrix with a scalar value.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @param {number} n scalar
       * @return {MatrixObject} new matrix
       */
      matScale(m,n){
        return _matnew(m.dim[0],m.dim[1],m.cells.map(x=> x*n))
      },
      /** Multiply these 2 matrices.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} a matrix A
       * @param {MatrixObject} b matrix B
       * @return {MatrixObject} new matrix
       */
      matMult(a,b){
        let [aRows,aCols]=a.dim;
        let [bRows,bCols]=b.dim;
        let aCells=a.cells;
        let bCells=b.cells;
        _.assert(aCols===bRows, "mismatch matrices");
        let out=new Array(aRows*bCols);
        for(let i=0; i<aRows; ++i)
          for(let j=0; j<bCols; ++j){
            out[j+i*bCols]=
              _.range(bRows).reduce((acc,k)=> {
                return acc + aCells[k+i*aCols] * bCells[j+ k*bCols] },0);
          }
        return _matnew(aRows,bCols,out)
      },
      /**Find the `Determinent` this matrix.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {number}
       */
      matDet(m){
        let [rows,cols]=m.dim;
        let tmp=[];
        if(cols===2)
          return this._matDet2x2(m);
        for(let c=0; c< cols;++c)
          _.conj(tmp,this.matDet(this.matCut(m,1,c+1)));
        return _.range(cols).reduce((acc,j)=>{
          let v=tmp[j];
          return acc + m.cells[j] * (_odd(j) ? -v : v)
        },0)
      },
      /** @ignore */
      _matDet2x2(m){
        _.assert(m.cells.length===4);
        return m.cells[0]*m.cells[3] - m.cells[1]*m.cells[2]
      },
      /**Extract a portion of a matrix by
       * getting rid of a row and col.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @param {number} row the row to cut (1-indexed)
       * @param {number} col the col to cut (1-indexed)
       * @return {MatrixObject} new matrix
       */
      matCut(m,row,col){
        const [rows,cols]=m.dim;
        //change to zero indexed
        let _row = row-1;
        let _col= col-1;
        let tmp=[];
        for(let i=0; i<rows; ++i)
          for(let j=0; j<cols; ++j){
            if(!(i === _row || j === _col))
              _.conj(tmp, m.cells[j+i*cols]);
          }
        return _matnew(rows-1,cols-1, tmp)
      },
      /**Find the `Matrix Minor` of this matrix.
       * A "minor" is the determinant of the square matrix
       * formed by deleting one row and one column from
       * some larger square matrix.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {MatrixObject} new matrix
       */
      matMinor(m){
        const [rows,cols]=m.dim;
        let tmp=[];
        _.assert(rows===cols);
        if(cols===2)
          return this._matMinor2x2(m);
        for(let i=0; i< rows;++i)
          for(let j=0; j<cols; ++j){
            //mat-cut is 1-indexed
            _.conj(tmp,this.matDet(this.matCut(m,i+1,j+1)));
          }
        return _matnew(rows,cols,tmp)
      },
      /** @ignore */
      _matMinor2x2(m){
        return _.assert(m.cells.length===4) &&
               this.mat2(m.cells[3],m.cells[2],m.cells[1],m.cells[0])
      },
      /**Find the `Matrix Cofactor` of this matrix.
       * The cofactor is a signed minor.
       * The cofactor of aij is denoted by Aij and is defined as
       * Aij = (-1)^(i+j) Mij
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m
       * @return {MatrixObject} new matrix
       */
      matCofactor(m){
        const minor=this.matMinor(m);
        const [rows,cols]=minor.dim;
        let tmp=minor.cells.slice();
        for(let r=0;r<rows;++r)
          for(let p,c=0;c<cols;++c){
            p=r*cols+c;
            if(_odd(r+c))
              tmp[p]= -tmp[p];
          }
        return _matnew(rows,cols,tmp)
      },
      /**Find the adjugate of a square matrix.
       * An `Adjugate` is the transpose of its cofactor matrix.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {MatrixObject} new matrix
       */
      matAdjugate(m){
        return this.matXpose(this.matCofactor(m))
      },
      /** @ignore */
      _minv2x2(m){
        const [rows,cols]=m.dim;
        _.assert(m.cells.length===4&&rows===2&&cols===2);
        let r,c=m.cells;
        let det= c[0]*c[3] - c[1]*c[2];
        if(_.feq0(det))
          r=this.matIdentity(rows);
        else{
          let _det= 1/det;
          r= this.mat2(c[3]*_det, -c[1] * _det,
                       -c[2] * _det, c[0] * _det);
        }
        return r
      },
      /**Find the `Inverse` of this matrix.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {MatrixObject} new matrix
       */
      matInv(m){
        const [rows,cols]=m.dim;
        if(cols===2)
          return this._minv2x2(m);
        let d= this.matDet(m);
        return _.feq0(d) ? this.matIdentity(rows)
                         : this.matScale(this.matAdjugate(m), 1/d)
      },
      /**Matrix from column majors.
       * @memberof module:mcfud/matrix
       * @param {number[][]} list of column values
       * @return {MatrixObject} new matrix
       */
      matFromColMajor(arr){
        let numCols= arr.length,
            rows=arr[0].length,
            out=_new_mat(rows,numCols);
        for(let C,c=0;c<arr.length;++c){
          C=arr[c];
          for(let r=0;r<C.length;++r){
            out.cells[r*numCols+c]=C[r];
          }
        }
        return out;
      },
      /**Get the list of `Column Major` vectors from this matrix.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {number[][]}
       */
      matToColMajor(m){
        const [rows,cols]=m.dim;
        const ret=[],
              out=m.cells.slice();
        for(let a,i=0,c=0;c<cols;++c){
          a=[];
          for(let r=0;r<rows;++r)
            a.push(m.cells[r*cols+c]);
          ret.push(a);
        }
        return ret;
      },
      /**Create a 3D scale matrix.
       * @memberof module:mcfud/matrix
       * @param {Vec3} v
       * @return {MatrixObject} new matrix
       */
      scale3D(v){
        const out=this.matIdentity(4);
        out.cells[_cell(4,4,1,1)]=v[0];
        out.cells[_cell(4,4,2,2)]=v[1];
        out.cells[_cell(4,4,3,3)]=v[2];
        return out;
      },
      /**Create a 3D translation matrix.
       * @memberof module:mcfud/matrix
       * @param {Vec3} v
       * @return {MatrixObject} new matrix
       */
      translate3D(v){
        const out=this.matIdentity(4);
        out.cells[_cell(4,4,4,1)]=v[0];
        out.cells[_cell(4,4,4,2)]=v[1];
        out.cells[_cell(4,4,4,3)]=v[2];
        return out;
      },
      /**Create a 3D rotation matrix, rotation order *IMPORTANT*
       * @memberof module:mcfud/matrix
       * @param {number} roll x rotation in radians.
       * @param {number} pitch y rotation in radians.
       * @param {number} yaw z rotation in radians.
       * @return {MatrixObject} new matrix
       */
      rot3D(roll,pitch,yaw){
        //x,y,z order is important, matrix not commutative
        return this.matMult(this.zRot3D(yaw),
                            this.matMult(this.yRot3D(pitch),
                                         this.xRot3D(roll)));
      },
      /**Multiply matrix and  vector.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @param {VecN} v the vector
       * @return {VecN} vector
       */
      matVMult(m,v){
        let cols=m.dim[1];
        let rows=v.length;
        _.assert(cols===rows);
        let r= this.matMult(m, _matnew(rows, 1, v));
        let c=r.cells;
        r.cells=null;
        return c
      },
      /**Rotate a 2x2 matrix, counter-clockwise.
       * @memberof module:mcfud/matrix
       * @param {number} rot in radians
       * @return {MatrixObject} new matrix
       */
      rot2D(rot){
        return this.mat2(COS(rot),-SIN(rot),SIN(rot),COS(rot))
      },
      /**Rotate on x-axis.
       * @memberof module:mcfud/matrix
       * @param {number} rad value in radians
       * @return {MatrixObject} new matrix
       */
      xRot3D(rad){
        return this.mat4(1,0,0,0,
                         0,COS(rad),-SIN(rad),0,
                         0,SIN(rad),COS(rad),0,
                         0,0,0,1)
      },
      /**Rotate on y-axis.
       * @memberof module:mcfud/matrix
       * @param {number} rad value in radians
       * @return {MatrixObject} new matrix
       */
      yRot3D(rad){
        return this.mat4(COS(rad),0,SIN(rad),0,
                         0,1, 0, 0,
                         -SIN(rad), 0, COS(rad), 0,
                         0,0,0,1)
      },
      /**Rotate on z-axis.
       * @memberof module:mcfud/matrix
       * @param {number} rad value in radians
       * @return {MatrixObject} new matrix
       */
      zRot3D(rad){
        return this.mat4(COS(rad), -SIN(rad), 0, 0,
                         SIN(rad),COS(rad), 0, 0,
                         0, 0, 1, 0,
                         0, 0, 0, 1)
      },
      /**Check if m is an `identity` matrix.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {boolean}
       */
      isIdentity(m){
        const [rows,cols]=m.dim;
        if(rows===cols){
          for(let v,r=0;r<rows;++r){
            for(let c=0;c<cols;++c){
              v=m.cells[r*cols+c];
              if((r+1)===(c+1)){
                if(v !== 1) return false;
              }else if(v !== 0) return false;
            }
          }
          return true
        }else{
          return false
        }
      },
      /**Check if matrix is `orthogonal`.
       * @memberof module:mcfud/matrix
       * @param {MatrixObject} m the matrix
       * @return {boolean}
       */
      isOrthogonal(m){
        //Given a square matrixA, to check for its orthogonality steps are:
        //Find the determinant of A. If, it is 1 then,
        //find the inverse matrix of inv(A) and transpose of xpos(A),
        //if xpose(A) X inv(A) === I
        //then A will be orthogonal
        let r,d= this.matDet(m);
        return Math.abs(d)===1 &&
               this.isIdentity(this.matMult(this.matXpose(m), this.matInv(m)));
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/matrix"]=_module
  }

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  const VISCHS=" @N/\\Ri2}aP`(xeT4F3mt;8~%r0v:L5$+Z{'V)\"CKIc>z.*"+
               "fJEwSU7juYg<klO&1?[h9=n,yoQGsW]BMHpXb6A|D#q^_d!-";
  const VISCHS_LEN=VISCHS.length;

  /**Create the module.
  */
  function _module(Core){
    if(!Core)
      Core= gscope["io/czlab/mcfud/core"]();
    const {u:_} = Core;

    /**
     * @module mcfud/crypt
     */

    /**Find the offset. */
    function _calcDelta(shift){
      return Math.abs(shift) % VISCHS_LEN
    }

    /**Get the char at the index. */
    function _charat(pos,string_){
      return (string_ || VISCHS).charAt(pos)
    }

    /**Index for this char. */
    function _getch(ch){
      for(let i=0;i<VISCHS_LEN;++i){
        if(_charat(i)===ch)
          return i;
      }
      return -1
    }

    /**Rotate right. */
    function _rotr(delta, cpos){
      let pos= cpos+delta;
      return _charat(pos >= VISCHS_LEN ? (pos-VISCHS_LEN) : pos)
    }

    /**Rotate left. */
    function _rotl(delta, cpos){
      let pos= cpos-delta;
      return _charat(pos< 0 ? (VISCHS_LEN+pos) : pos)
    }

    const _$={
      /**Encrypt source by shifts.
       * @memberof module:mcfud/crypt
       * @param {string} src
       * @param {number} shift
       * @return {string} encrypted text
       */
      encrypt(src, shift){
        if(shift===0){ return src }
        function _f(shift,delta,cpos){
          return shift<0 ? _rotr(delta,cpos) : _rotl(delta,cpos) }
        let out=[];
        let p,d=_calcDelta(shift);
        src.split("").forEach(c=>{
          p=_getch(c);
          out.push(p<0 ? c : _f(shift,d,p));
        });
        return out.join("");
      },
      /**Decrypt text by shifts.
       * @memberof module:mcfud/crypt
       * @param {string} cipherText
       * @param {number} shift
       * @return {string} decrypted text
       */
      decrypt(cipherText,shift){
        if(shift===0){ return cipherText }
        function _f(shift,delta,cpos) {
          return shift< 0 ? _rotl(delta,cpos) : _rotr(delta,cpos) }
        let p,out=[];
        let d= _calcDelta(shift);
        cipherText.split("").forEach(c=>{
          p= _getch(c);
          out.push(p<0 ? c : _f(shift,d,p));
        });
        return out.join("");
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/crypt"]=_module;
  }

})(this);


// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
  */
  function _module(Core){

    if(!Core)
      Core=gscope["io/czlab/mcfud/core"]();

    /**
     * @module mcfud/fsm
     */

    /**
     * @typedef {object} FSMStateTransition
     * @property {string} target  switching to this target state
     * @property {function} action() run this code upon the transition
     */

    /**
     * @typedef {object} FSMStateTransitionList
     * @property {FSMStateTransition} transition-1 user defined transition
     * @property {FSMStateTransition} ...          more
     * @property {FSMStateTransition} transition-n  user defined transition
     */

    /**
     * @typedef {object} FSMState
     * @property {function} enter() run this code when the FSM switches to this state
     * @property {function} exit()  run this code when the FSM switches away from this state
     * @property {FSMStateTransitionList} transitions  a list of state transition definitions
     */

    /**
     * @typedef {object} FSMDefn
     * @property {function} initState() return the initial state
     * @property {FSMState} state-1 a user defined state
     * @property {FSMState} ...     more
     * @property {FSMState} state-n a user defined state
     */

    /**
     * @typedef {object} FSMObject
     * @property {function} state() returns the current state
     * @property {function} process() execute any runnable code defined by the current state
     * @property {function} trigger(event) apply this event to the state machine
     */

    const _$={
      /**Create a FSM instance.
       * @memberof module:mcfud/fsm
       * @param {FSMDefn} defn
       * @return {FSMObject}
       */
      fsm(defn){
        let _state=defn.initState();
        return {
          /** the current state */
          state(){
            return _state },
          /** run the current state `code` */
          process(){
            const fromStateObj=defn[_state];
            if(fromStateObj)
              fromStateObj.run && fromStateObj.run();
          },
          /** apply an event */
          trigger(event="change",options){
            const fromStateObj= defn[_state];
            const tx= fromStateObj &&
                      fromStateObj.transitions[event];
            //react to this event
            if(tx){
              const nextState = tx.target;
              const nextStateObj = defn[nextState];
              if(nextStateObj){
                fromStateObj.exit && fromStateObj.exit();
                nextStateObj.enter && nextStateObj.enter();
                if(options && options.action){
                  options.action();
                }else if(tx.action){
                  options ? tx.action(options) : tx.action();
                }
                return (_state = nextState);
              }
            }
          }
        }
      }
    };
    return _$;
  }

  /**Sample definition syntax/format.
   * @ignore
   */
  const sample={
    /** provides the initial state of this FSM */
    initState(){ return "happy"},
    /** follow by a list of state definitions */
    "happy":{
      enter(){ console.log("happy: entering") },
      exit(){ console.log("happy: exiting") },
      transitions:{
        "rain":{
          target: "sad",
          action(){ console.log("from happy to sad") }
        }
      }
    },
    "sad":{
      enter(){ console.log("sad: entering") },
      exit(){ console.log("sad: exiting") },
      transitions:{
        "sun":{
          target: "happy",
          action(){ console.log("from sad to happy") }
        }
      }
    }
  };

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/fsm"]=_module
  }

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
   */
  function _module(Core,_M){

    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();

    const TWO_PI=Math.PI*2;
    const {u:_}=Core;

    /**
     * @module mcfud/gfx
     */

    /**
     * @typedef {number[]} Vec2
     */

    /**
     * @memberof module:mcfud/gfx
     * @class
     * @property {number[]} m
     */
    class TXMatrix2D{
      /**
       * @param {Vec2[]} source
       */
      constructor(source){
        if(source){
          this.m = [];
          this.clone(source);
        }else{
          this.m = [1,0,0,0,1,0];
        }
      }
      /**Toggle this into an `Identity` matrix
       * @return {TXMatrix2D} self
       */
      identity(){
        const m = this.m;
        m[0] = 1; m[1] = 0; m[2] = 0;
        m[3] = 0; m[4] = 1; m[5] = 0;
        return this;
      }
      /**Deep clone a matrix.
       * @param {TXMatrix2D}
       * @return {TXMatrix2D} self
       */
      clone(matrix){
        let d = this.m,
            s = matrix.m;
        d[0]=s[0]; d[1]=s[1]; d[2] = s[2];
        d[3]=s[3]; d[4]=s[4]; d[5] = s[5];
        return this;
      }
      /**Multiply by this matrix
       * @param {TXMatrix2D} matrix
       * @return {TXMatrix2D} self
       */
      multiply(matrix){
        let a = this.m,
            b = matrix.m;
        let m11 = a[0]*b[0] + a[1]*b[3];
        let m12 = a[0]*b[1] + a[1]*b[4];
        let m13 = a[0]*b[2] + a[1]*b[5] + a[2];
        let m21 = a[3]*b[0] + a[4]*b[3];
        let m22 = a[3]*b[1] + a[4]*b[4];
        let m23 = a[3]*b[2] + a[4]*b[5] + a[5];

        a[0]=m11; a[1]=m12; a[2] = m13;
        a[3]=m21; a[4]=m22; a[5] = m23;
        return this;
      }
      /**Apply rotation.
       * @param {number} radians
       * @return {TXMatrix2D} self
       */
      rotate(radians){
        if(!_.feq0(radians)){
          let m=this.m,
              cos = Math.cos(radians),
              sin = Math.sin(radians);
          let m11 = m[0]*cos  + m[1]*sin;
          let m12 = -m[0]*sin + m[1]*cos;
          let m21 = m[3]*cos  + m[4]*sin;
          let m22 = -m[3]*sin + m[4]*cos;
          m[0] = m11; m[1] = m12;
          m[3] = m21; m[4] = m22;
        }
        return this;
      }
      /**Apply rotation (in degrees).
       * @param {number} degrees
       * @return {TXMatrix2D} self
       */
      rotateDeg(degrees){
        return _.feq0(degrees)? this: this.rotate(Math.PI * degrees / 180)
      }
      /**Apply scaling.
       * @param {number} sx
       * @param {number} sy
       * @return {TXMatrix2D} self
       */
      scale(sx,sy){
        let m = this.m;
        if(sy===undefined){ sy=sx }
        m[0] *= sx;
        m[1] *= sy;
        m[3] *= sx;
        m[4] *= sy;
        return this;
      }
      /**Apply translation.
       * @param {number} tx
       * @param {number} ty
       * @return {TXMatrix2D} self
       */
      translate(tx,ty){
        let m = this.m;
        m[2] += m[0]*tx + m[1]*ty;
        m[5] += m[3]*tx + m[4]*ty;
        return this;
      }
      /**Transform this point.
       * @param {number} x
       * @param {number} y
       * @return {Vec2}
       */
      transform(x,y){
        return [ x * this.m[0] + y * this.m[1] + this.m[2],
                 x * this.m[3] + y * this.m[4] + this.m[5] ];
      }
      /**@see {@link module:mcfud/gfx.TXMatrix2D#transform}
       * @param {object} obj
       * @return {object} obj
       */
      transformPoint(obj){
        const [x,y]= this.transform(obj.x,obj.y);
        obj.x = x;
        obj.y = y;
        return obj;
      }
      /**@see {@link module:mcfud/gfx.TXMatrix2D#transform}
       * @param {Vec2} inArr
       * @return {Vec2}
       */
      transformArray(inArr){
        return this.transform(inArr[0],inArr[1])
      }
      /**Set HTML5 2d-context's transformation matrix.
       * @param {object} html5 2d-context
       */
      setContextTransform(ctx){
        const m = this.m;
        // source:
        //  m[0] m[1] m[2]
        //  m[3] m[4] m[5]
        //  0     0   1
        //
        // destination:
        //  m11  m21  dx
        //  m12  m22  dy
        //  0    0    1
        //  setTransform(m11, m12, m21, m22, dx, dy)
        ctx.transform(m[0],m[3],m[1],m[4],m[2],m[5]);
      }
    }

    const _$={
      TXMatrix2D,
      /**Html5 Text Style object.
       * @example
       * "14px 'Arial'" "#dddddd" "left" "top"
       * @memberof module:mcfud/gfx
       * @param {string} font
       * @param {string|number} fill
       * @param {string} [align]
       * @param {string} [base]
       * @return {object} style object
       */
      textStyle(font,fill,align,base){
        const x={font: font, fill: fill};
        if(align) x.align=align;
        if(base) x.base=base;
        return x;
      },
      /**Draw the shape onto the html5 canvas.
       * @memberof module:mcfud/gfx
       * @param {object} ctx html5 2d-context
       * @param {object} s a shape
       * @param (...any) args
       */
      drawShape(ctx,s,...args){
        if(s && s.draw)
          s.draw(ctx,...args)
      },
      /**Apply styles to the canvas.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {object} style object
       */
      cfgStyle(ctx,styleObj){
        const {line,stroke} =styleObj;
        if(line){
          if(line.cap)
            ctx.lineCap=line.cap;
          if(line.width)
            ctx.lineWidth=line.width;
        }
        if(stroke){
          if(stroke.style)
            ctx.strokeStyle=stroke.style;
        }
      },
      /**Draw and connect this set of points onto the canvas.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {Vec2[]} points
       * @param {number} [size] n# of points to draw
       */
      drawPoints(ctx,points,size){
        if(size === undefined) size=points.length;
        _.assert(size<=points.length);
        ctx.beginPath();
        for(let p,q,i2,i=0;i<size;++i){
          i2= (i+1)%size;
          p=points[i];
          q=points[i2];
          ctx.moveTo(p[0],p[1]);
          ctx.lineTo(q[0],q[1]);
        }
        ctx.stroke();
      },
      /**Draw a polygonal shape.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {Polygon} poly
       */
      drawShapePoly(ctx,poly){
        return this.drawPoints(ctx,poly.points);
      },
      /**Draw a circle onto the canvas.  If a starting point
       * is provided, draw a line to the center.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {number} x
       * @param {number} y
       * @param {radius} r
       */
      drawCircle(ctx,x,y,radius){
        ctx.beginPath();
        ctx.arc(x,y,radius,0,TWO_PI,true);
        ctx.closePath();
        ctx.stroke();
      },
      /**Draw a circular shape.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {Circle} circle
       */
      drawShapeCircle(ctx,circle){
        return this.drawCircle(ctx,circle.pos[0],circle.pos[1],circle.radius)
      },
      /**Draw a rectangle.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d=context
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @param {number} rot
       */
      drawRect(ctx,x,y,width,height,rot){
        let left=x;
        let top= y - height;
        ctx.save();
        ctx.translate(left,top);
        ctx.rotate(rot);
        ctx.strokeRect(0,0,width,height);
        ctx.restore();
      },
      /**Draw a rectangular shape.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {Rect} rect
       */
      drawShapeRect(ctx,rect){
        return this.drawRect(ctx,rect.pos[0],rect.pos[1],
                             rect.width,rect.height,rect.rotation)
      },
      /**Draw a line.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {number} x1
       * @param {number} y1
       * @param {number} x2
       * @param {number} y2
       */
      drawLine(ctx,x1,y1,x2,y2){
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
        //ctx.closePath();
      },
      /**Draw a 2d line.
       * @memberof module:mcfud/gfx
       * @param {ctx} html5 2d-context
       * @param {Line} line
       */
      drawShapeLine(ctx,line){
        return this.drawLine(ctx,line.p[0],line.p[1],line.q[0],line.q[1])
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"),
                           require("./math"))
  }else{
    gscope["io/czlab/mcfud/gfx"]=_module
  }

})(this);


// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /** @ignore */
  const [LEFT_VORONOI, MID_VORONOI, RIGHT_VORONOI]= [1,0,-1];

  /**Create the module.
   */
  function _module(Core,_M,_V){

    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();
    if(!_V) _V=gscope["io/czlab/mcfud/vec2"]();

    const MFL=Math.floor;
    const ABS=Math.abs;
    const MaxVerts=36;
    const {u:_}=Core;

    /**
     * @module mcfud/geo2d
     */

    /**
     * @typedef {number[]} Vec2
     */

    /**Check if point inside a polygon.
     * @see https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
     * @ignore
     */
    function _pointInPoly(testx,testy,points){
      let c=false,
          nvert=points.length;
      for(let p,q, i=0, j=nvert-1; i<nvert;){
        p=points[i];
        q=points[j];
        if(((p[1]>testy) !== (q[1]>testy)) &&
          (testx < (q[0]-p[0]) * (testy-p[1]) / (q[1]-p[1]) + p[0])) c = !c;
        j=i;
        ++i;
      }
      return c
    }

    /**Original source from Randy Gaul's impulse-engine:
     * https://github.com/RandyGaul/ImpulseEngine#Shape.h
     */
    function _orderPoints(vertices){
      const count=vertices.length;
      const hull= _.assert(count <= MaxVerts) && _.fill(MaxVerts);
      //find the right-most point
      let rightMost=0,
          maxX= vertices[0][0];
      for(let x,i=1; i<count; ++i){
        x=vertices[i][0];
        if(x>maxX){
          maxX= x;
          rightMost= i;
        }else if(_.feq(x, maxX) &&
                 vertices[i][1]<vertices[rightMost][1]){
          //if same x then choose one with smaller y
          rightMost = i;
        }
      }
      let hpos=0,
          cur=rightMost;
      //examine all the points, sorting them in order of ccw from the rightmost, one by one
      //and eventually wraps back to the rightmost point, at which time exit this inf-loop
      for(;;){
        hull[hpos]=cur;
        //search for next index that wraps around the hull
        //by computing cross products to find the most counter-clockwise
        //vertex in the set, given the previos hull index
        let next= 0,
            hp=hull[hpos];
        for(let e1,e2,c,i=1; i<count; ++i){
          if(next===cur){
            next= i; continue } //same point, skip
          //cross every set of three unique vertices
          //record each counter clockwise third vertex and add
          //to the output hull
          //see: http://www.oocities.org/pcgpe/math2d.html
          e1= _V.sub(vertices[next], vertices[hp]);
          e2= _V.sub(vertices[i], vertices[hp]);
          c= _V.cross(e1,e2);
          if(c<0){
            //counterclockwise, e2 on left of e1
            next=i}
          //cross product is zero then e vectors are on same line
          //therefore want to record vertex farthest along that line
          if(_.feq0(c) && _V.len2(e2) > _V.len2(e1)){next=i}
        }
        //we found the *next* point *left,ccw* of last hull point
        cur=next;
        ++hpos;
        //conclude algorithm upon wrap-around
        if(next===rightMost){ break }
      }
      const result=[];
      for(let i=0; i<hpos; ++i)
        result.push(_V.clone(vertices[hull[i]]));
      return result;
    }

    /**A Rectangle, standard Cartesian: bottom-left corner + width + height.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} pos
     * @property {number} width
     * @property {number} height
     */
    class Rect{
      /**
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       */
      constructor(x,y,width,height){
        switch(arguments.length){
          case 2:
            this.pos= _V.vec();
            this.width=x;
            this.height=y;
            break;
          case 4:
            this.pos=_V.vec(x,y);
            this.width=width;
            this.height=height;
            break;
          default:
            throw "Error: bad input to Rect()";
        }
      }
    }

    /**An Area.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {number} width
     * @property {number} height
     */
    class Area{
      /**
       * @param {number} w
       * @param {number} h
       */
      constructor(w,h){
        this.width=w;
        this.height=h;
      }
      /**
       * @return {Area}
       */
      half(){
        return new Area(MFL(this.width/2),MFL(this.height/2))
      }
    }

    /**A Line.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} p
     * @property {Vec2} q
     */
    class Line{
      /**
       * @param {number} x1
       * @param {number} y1
       * @param {number} x2
       * @param {number} y2
       */
      constructor(x1,y1,x2,y2){
        this.p= _V.vec(x1,y1);
        this.q= _V.vec(x2,y2);
      }
    }

    /**A Circle.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} pos
     * @property {number} radius
     * @property {number} orient
     */
    class Circle{
      /**
       * @param {number} r
       */
      constructor(r){
        this.radius=r;
        this.orient=0;
        this.pos=_V.vec();
      }
      /**Set the rotation.
       * @param {number} r
       * @return {Circle} self
       */
      setOrient(r){
        this.orient=r;
        return this;
      }
      /**Set origin.
       * @param {number} x
       * @param {number} y
       * @return {Circle} self
       */
      setPos(x,y){
        _V.set(this.pos,x,y);
        return this;
      }
    }

    /**A Polygon, points are specified in COUNTER-CLOCKWISE order.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} pos
     * @property {Vec2[]} normals
     * @property {Vec2[]} edges
     * @property {Vec2[]} points
     * @property {number} orient
     * @property {Vec2[]} calcPoints
     */
    class Polygon{
      /**
       * @param {number} x
       * @param {number} y
       */
      constructor(x,y){
        this.calcPoints=null;
        this.normals=null;
        this.edges=null;
        this.points=null;
        this.orient = 0;
        this.pos=_V.vec();
        this.setPos(x,y);
      }
      /**Set origin.
       * @param {number} x
       * @param {number} y
       * @return {Polygon} self
       */
      setPos(x=0,y=0){
        _V.set(this.pos,x,y);
        return this;
      }
      /**Set vertices.
       * @param {Vec2[]} points
       * @return {Polygon} self
       */
      set(points){
        this.calcPoints= this.calcPoints || [];
        this.normals= this.normals || [];
        this.edges= this.edges || [];
        this.calcPoints.length=0;
        this.normals.length=0;
        this.edges.length=0;
        this.points= _.assert(points.length>2) &&
                     _orderPoints(points);
        _.doseq(this.points, p=>{
          this.calcPoints.push(_V.vec());
          this.edges.push(_V.vec());
          this.normals.push(_V.vec());
        });
        return this._recalc();
      }
      /**Set rotation.
       * @param {number} rot
       * @return {Polygon} self
       */
      setOrient(rot){
        this.orient = rot;
        return this._recalc();
      }
      /**Move the points.
       * @param {number} x
       * @param {number} y
       * @return {Polygon} self
       */
      translate(x, y){
        _.doseq(this.points,p=>{
          p[0] += x; p[1] += y;
        });
        return this._recalc();
      }
      /** @ignore */
      _recalc(){
        if(this.points){
          _.doseq(this.points,(p,i)=>{
            _V.copy(this.calcPoints[i],p);
            if(!_.feq0(this.orient))
              _V.rot$(this.calcPoints[i],this.orient);
          });
          let i2,p1,p2;
          _.doseq(this.points,(p,i)=>{
            i2= (i+1) % this.calcPoints.length;
            p1=this.calcPoints[i];
            p2=this.calcPoints[i2];
            this.edges[i]= _V.sub(p2,p1);
            this.normals[i]= _V.unit(_V.normal(this.edges[i]));
          });
        }
        return this;
      }
      /**Return the translated polygon points.
       * @param {Polygon} poly
       * @return {array} points
       */
      static translateCalcPoints(poly){
        return _V.translate(poly.pos,poly.calcPoints)
      }
    }

    /** @ignore */
    function toPolygon(r){
      return new Polygon(r.pos[0],
                         r.pos[1]).set([_V.vec(r.width,0),
                                        _V.vec(r.width,r.height),
                                        _V.vec(0,r.height),_V.vec()])
    }

    /**A collision manifold.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} overlapN  overlap normal
     * @property {Vec2} overlapV  overlap vector
     * @property {number} overlap overlap magnitude
     * @property {object} A
     * @property {object} B
     * @property {boolean} AInB
     * @property {boolean} BInA
     */
    class Manifold{
      /**
       * @param {Vec2} overlapN
       * @param {Vec2} overlapV
       * @param {object} A
       * @param {object} B
       */
      constructor(A,B){
        this.overlapN = _V.vec();
        this.overlapV = _V.vec();
        this.A = A;
        this.B = B;
        this.clear();
      }
      swap(){
        let m=new Manifold();
        let aib=this.AInB;
        let bia=this.BInA;
        let a=this.A;

        m.overlap=this.overlap;
        m.A=this.B;
        m.B=a;
        m.AInB=bia;
        m.BInA=aib;
        m.overlapN=_V.flip(this.overlapN);
        m.overlapV=_V.flip(this.overlapV);
        //m.overlapV[0]=m.overlapN[0]*this.overlap;
        //m.overlapV[1]=m.overlapN[1]*this.overlap;
        return m;
      }
      /**Reset to zero. */
      clear(){
        this.overlap = Infinity;
        this.AInB = true;
        this.BInA = true;
        return this;
      }
    }

    //------------------------------------------------------------------------
    // 2d collision using Separating Axis Theorem.
    // see https://github.com/jriecken/sat-js
    //------------------------------------------------------------------------

    /**Check all shadows onto this axis and
     * find the min and max.
     */
    function _findProjRange(points, axis){
      let min = Infinity,
          max = -Infinity;
      for(let dot,i=0; i<points.length; ++i){
        dot= _V.dot(points[i],axis);
        if(dot<min) min = dot;
        if(dot>max) max = dot;
      }
      return [min,max]
    }

    /** @ignore */
    function _voronoiRegion(line, point){
      let n2 = _V.len2(line),
          dp = _V.dot(point,line);
      //If pt is beyond the start of the line, left voronoi region
      //If pt is beyond the end of the line, right voronoi region
      return dp<0 ? LEFT_VORONOI : (dp>n2 ? RIGHT_VORONOI : MID_VORONOI)
    }

    /** @ignore */
    function _testSAT(aPos,aPoints, bPos,bPoints, axis, resolve){
      let [minA,maxA] =_findProjRange(aPoints, axis);
      let [minB,maxB] =_findProjRange(bPoints, axis);
      //B relative to A; A--->B
      let vAB= _V.vecAB(aPos,bPos);
      let proj= _V.dot(vAB,axis);
      //move B's range to its position relative to A.
      minB += proj;
      maxB += proj;
      if(minA>maxB || minB>maxA){ return true }
      if(resolve){
        let overlap = 0;
        //A starts left of B
        if(minA<minB){
          resolve.AInB = false;
          //A ends before B does, have to pull A out of B
          if(maxA < maxB){
            overlap= maxA - minB;
            resolve.BInA = false;
          }else{
            //B is fully inside A.  Pick the shortest way out.
            let [d1,d2] = [maxA - minB, maxB - minA];
            overlap = d1 < d2 ? d1 : -d2;
          }
        //B starts left than A
        }else{
          resolve.BInA = false;
          //B ends before A ends, have to push A out of B
          if(maxA>maxB){
            overlap = minA - maxB;
            resolve.AInB = false;
          }else{
            //A is fully inside B.  Pick the shortest way out.
            let [d1,d2] = [maxA - minB, maxB - minA];
            overlap = d1 < d2 ? d1 : -d2;
          }
        }
        //if smallest amount of overlap, set it as the minimum overlap.
        let absOverlap= Math.abs(overlap);
        if(absOverlap < resolve.overlap){
          resolve.overlap = absOverlap;
          _V.copy(resolve.overlapN,axis);
          if(overlap<0)
            _V.flip$(resolve.overlapN);
        }
      }
    }

    /**
     * @private
     * @var {Manifold}
     */
    const _RES= new Manifold();

    /**
     * @private
     * @var {Polygon}
     */
    const _FAKE_POLY= toPolygon(new Rect(0,0, 1, 1));

    /** @ignore */
    function _circle_circle(a, b, resolve){
      let vAB= _V.vecAB(a.pos,b.pos);
      let r_ab = a.radius+b.radius;
      let r2 = r_ab*r_ab;
      let d2 = _V.len2(vAB);
      let status= !(d2 > r2);
      if(status && resolve){
        let dist = Math.sqrt(d2);
        resolve.A = a;
        resolve.B = b;
        resolve.overlap = r_ab - dist;
        _V.copy(resolve.overlapN, _V.unit$(vAB));
        _V.copy(resolve.overlapV, _V.mul(vAB,resolve.overlap));
        resolve.AInB = a.radius <= b.radius && dist <= b.radius - a.radius;
        resolve.BInA = b.radius <= a.radius && dist <= a.radius - b.radius;
      }
      return status;
    }

    /** @ignore */
    function _poly_circle(polygon, circle, resolve){
      // get position of the circle relative to the polygon.
      let vPC= _V.vecAB(polygon.pos,circle.pos);
      let r2 = circle.radius*circle.radius;
      let cps = polygon.calcPoints;
      let edge = _V.vec();
      let point;
      // for each edge in the polygon:
      for(let next,prev, overlap,overlapN,len=cps.length,i=0; i<len; ++i){
        next = i === len-1 ? 0 : i+1;
        prev = i === 0 ? len-1 : i-1;
        overlap = 0;
        overlapN = null;
        _V.copy(edge,polygon.edges[i]);
        // calculate the center of the circle relative to the starting point of the edge.
        point=_V.vecAB(cps[i],vPC);
        // if the distance between the center of the circle and the point
        // is bigger than the radius, the polygon is definitely not fully in
        // the circle.
        if(resolve && _V.len2(point) > r2){
          resolve.AInB = false;
        }
        // calculate which Voronoi region the center of the circle is in.
        let region = _voronoiRegion(edge, point);
        if(region === LEFT_VORONOI){
          // need to make sure we're in the RIGHT_VORONOI of the previous edge.
          _V.copy(edge,polygon.edges[prev]);
          // calculate the center of the circle relative the starting point of the previous edge
          let point2= _V.vecAB(cps[prev],vPC);
          region = _voronoiRegion(edge, point2);
          if(region === RIGHT_VORONOI){
            // it's in the region we want.  Check if the circle intersects the point.
            let dist = _V.len(point);
            if(dist>circle.radius){
              // No intersection
              return false;
            } else if(resolve){
              // intersects, find the overlap.
              resolve.BInA = false;
              overlapN = _V.unit(point);
              overlap = circle.radius - dist;
            }
          }
        } else if(region === RIGHT_VORONOI){
          // need to make sure we're in the left region on the next edge
          _V.copy(edge,polygon.edges[next]);
          // calculate the center of the circle relative to the starting point of the next edge.
          _V.sub$(_V.copy(point,vPC),cps[next]);
          region = _voronoiRegion(edge, point);
          if(region === LEFT_VORONOI){
            // it's in the region we want.  Check if the circle intersects the point.
            let dist = _V.len(point);
            if(dist>circle.radius){
              return false;
            } else if(resolve){
              resolve.BInA = false;
              overlapN = _V.unit(point);
              overlap = circle.radius - dist;
            }
          }
        }else{
          // check if the circle is intersecting the edge,
          // change the edge into its "edge normal".
          let normal = _V.unit$(_V.normal(edge));
          // find the perpendicular distance between the center of the circle and the edge.
          let dist = _V.dot(point,normal);
          let distAbs = Math.abs(dist);
          // if the circle is on the outside of the edge, there is no intersection.
          if(dist > 0 && distAbs > circle.radius){
            return false;
          } else if(resolve){
            overlapN = normal;
            overlap = circle.radius - dist;
            // if the center of the circle is on the outside of the edge, or part of the
            // circle is on the outside, the circle is not fully inside the polygon.
            if(dist >= 0 || overlap < 2 * circle.radius){
              resolve.BInA = false;
            }
          }
        }
        // if this is the smallest overlap we've seen, keep it.
        // (overlapN may be null if the circle was in the wrong Voronoi region).
        if(overlapN && resolve && Math.abs(overlap) < Math.abs(resolve.overlap)){
          resolve.overlap = overlap;
          _V.copy(resolve.overlapN,overlapN);
        }
      }
      // calculate the final overlap vector - based on the smallest overlap.
      if(resolve){
        resolve.A = polygon;
        resolve.B = circle;
        _V.mul$(_V.copy(resolve.overlapV,resolve.overlapN),resolve.overlap);
      }
      return true;
    }

    /** @ignore */
    function _circle_poly(circle, polygon, resolve){
      let result = _poly_circle(polygon, circle, resolve);
      if(result && resolve){
        // flip A and B
        let a = resolve.A;
        let aInB = resolve.AInB;
        _V.flip$(resolve.overlapN);
        _V.flip$(resolve.overlapV);
        resolve.A = resolve.B;
        resolve.B = a;
        resolve.AInB = resolve.BInA;
        resolve.BInA = aInB;
      }
      return result;
    }

    /** @ignore */
    function _poly_poly(a, b, resolve){
      let pa = a.calcPoints;
      let pb = b.calcPoints;
      for(let i=0; i < pa.length; ++i){
        if(_testSAT(a.pos, pa, b.pos, pb, a.normals[i], resolve))
          return false;
      }
      for(let i=0;i < pb.length; ++i){
        if(_testSAT(a.pos, pa, b.pos, pb, b.normals[i], resolve))
          return false;
      }
      if(resolve){
        if(resolve.overlap===0 || _.feq0(resolve.overlap))
          return false;
        resolve.A = a;
        resolve.B = b;
        _V.copy(resolve.overlapV,resolve.overlapN);
        _V.mul$(resolve.overlapV,resolve.overlap);
      }
      return true;
    }

    const _$={
      Rect,
      Area,
      Line,
      Circle,
      Polygon,
      Manifold,
      /**Sort vertices in counter clockwise order.
       * @memberof module:mcfud/geo2d
       * @param {Vec2[]} vs
       * @return {Vec2[]}
       */
      orderVertices(vs){ return _orderPoints(vs) },
      /**Calculate the area of this polygon.
       * @memberof module:mcfud/geo2d
       * @param{Vec2[]} points
       * @return {number}
       */
      polyArea(points,sort=false){
        let ps= sort? this.orderVertices(points) : points;
        let area=0;
        for(let p,q,i2,len=ps.length,i=0;i<len;++i){
          i2= (i+1)%len;
          p=ps[i];
          q=ps[i2];
          area += (p[0]*q[1] - q[0]*p[1]);
        }
        return MFL(ABS(area)/2)
      },
      /**Find the center point of this polygon.
       * @memberof module:mcfud/geo2d
       * @param {Vec2[]} points
       * @return {Vec2}
       */
      calcPolygonCenter(points,sort=false){
        const ps= sort?this.orderVertices(points):points;
        const A= 6*this.polyArea(ps);
        let cx=0;
        let cy=0;
        for(let p,q,i2,i=0,len=ps.length;i<len;++i){
          i2= (i+1)%len;
          p=ps[i];
          q=ps[i2];
          cx += (p[0]+q[0]) * (p[0]*q[1]-q[0]*p[1]);
          cy += (p[1]+q[1]) * (p[0]*q[1]-q[0]*p[1]);
        }
        return _V.vec(MFL(cx/A), MFL(cy/A))
      },
      /**Get the AABB rectangle.
       * @memberof module:mcfud/geo2d
       * @param {Circle|Polygon} obj
       * @param {Vec} [pos]
       * @return {Rect}
       */
      getAABB(obj,pos=null){
        if(!pos){
          pos=obj.pos;
        }
        if(_.has(obj,"radius")){
          return new Rect(pos[0]-obj.radius,
                          pos[1]-obj.radius,
                          obj.radius*2, obj.radius*2)
        }else{
          let cps= _V.translate(pos, obj.calcPoints);
          let xMin= cps[0][0];
          let yMin= cps[0][1];
          let xMax= xMin;
          let yMax= yMin;
          for(let p,i=1; i<cps.length; ++i){
            p= cps[i];
            if(p[0] < xMin) xMin = p[0];
            if(p[0] > xMax) xMax = p[0];
            if(p[1] < yMin) yMin = p[1];
            if(p[1] > yMax) yMax = p[1];
          }
          return new Rect(xMin, yMin, xMax - xMin, yMax - yMin)
        }
      },
      /**Shift a set of points.
       * @memberof module:mcfud/geo2d
       * @param {Vec2[]} points
       * @param {Vec2|number} delta
       * @return {Vec2[]}
       */
      shiftPoints(points,delta){
        return points.map(v=> _V.add(v,delta))
      },
      /**Rotate a set of points.
       * @memberof module:mcfud/geo2d
       * @param {Vec2[]} points
       * @param {number} rot
       * @param {Vec2} [pivot]
       */
      rotPoints(points,rot,pivot){
        return points.map(v=> _V.rot(v,rot,pivot))
      },
      /**Find the vertices of a rectangle, centered at origin.
       * @memberof module:mcfud/geo2d
       * @param {number} w
       * @param {number} h
       * @return {Vec2[]} points in counter-cwise, bottom-right first
       */
      calcRectPoints(w,h){
        const hw=MFL(w/2);
        const hh=MFL(h/2);
        return [_V.vec(hw,-hh), _V.vec(hw,hh),
                _V.vec(-hw,hh), _V.vec(-hw,-hh)]
      },
      /**Create a Line object.
       * @memberof module:mcfud/geo2d
       * @return {Line}
       */
      line(x1,y1,x2,y2){ return new Line(x1,y1,x2,y2) },
      /**Check if 2 rects are equal.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r1
       * @param {Rect} r2
       * @return {boolean}
       */
      rectEqRect(r1,r2){
        return r1.width===r2.width &&
               r1.height===r2.height &&
               r1.pos[0]===r2.pos[0] &&
               r1.pos[1]===r2.pos[1]
      },
      /**Check if `R` contains `r`.
       * @memberof module:mcfud/geo2d
       * @param {Rect} R
       * @param {Rect} r
       * @return {boolean}
       */
      rectContainsRect(R,r){
        return !(R.pos[0] >= r.pos[0] ||
                 R.pos[1] >= r.pos[1] ||
                 (R.pos[0]+R.width) <= (r.pos[0]+r.width) ||
                 (R.pos[1]+R.height) <= (r.pos[1]+r.height))
      },
      /**Get the right side on the x-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMaxX(r){ return r.pos[0] + r.width },
      /**Get the middle on the x-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMidX(r){ return r.pos[0] + MFL(r.width/2) },
      /**Get the left on the x-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMinX(r){ return r.pos[0] },
      /**Get the top on the y-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMaxY(r){ return r.pos[1] + r.height },
      /**Get the mid point on the y-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMidY(r){ return r.pos[1] + MFL(r.height/2) },
      /**Get the bottom on the y-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMinY(r){ return r.pos[1] },
      /**Check if point lies inside rect.
       * @memberof module:mcfud/geo2d
       * @param {Rect} R
       * @param {number} x
       * @param {number} y
       * @return {boolean}
       */
      rectContainsPoint(R,x,y){
        return x >= this.rectGetMinX(R) &&
               x <= this.rectGetMaxX(R) &&
               y >= this.rectGetMinY(R) &&
               y <= this.rectGetMaxY(R)
      },
      /**Check if 2 rects intersects.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r1
       * @param {Rect} r2
       * @return {boolean}
       */
      rectOverlayRect(r1,r2){
        return !((r1.pos[0]+r1.width) < r2.pos[0] ||
                 (r2.pos[0]+r2.width) < r1.pos[0] ||
                 (r1.pos[1]+r1.height) < r2.pos[1] ||
                 (r2.pos[1]+r2.height) < r1.pos[1])
      },
      /**Find the union of these 2 rects.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r1
       * @param {Rect} r2
       * @return {Rect}
       */
      rectUnion(r1,r2){
        const x= Math.min(r1.pos[0],r2.pos[0]);
        const y= Math.min(r1.pos[1],r2.pos[1]);
        return new Rect(x,y,
                        Math.max(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                        Math.max(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
      },
      /**Find the intersection of these 2 rects.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r1
       * @param {Rect} r2
       * @return {Rect}
       */
      rectIntersection(r1,r2){
        if(this.rectOverlayRect(r1,r2)){
          const x= Math.max(r1.pos[0],r2.pos[0]);
          const y= Math.max(r1.pos[1],r2.pos[1]);
          return new Rect(x,y,
                          Math.min(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                          Math.min(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
        }
      },
      /**Check if circle contains this point.
       * @memberof module:mcfud/geo2d
       * @param {number} px
       * @param {number} py
       * @param {Circle} c
       * @return {boolean}
       */
      hitTestPointCircle(px, py, c){
        let dx=px-c.pos[0];
        let dy=py-c.pos[1];
        return dx*dx+dy*dy <= c.radius*c.radius;
      },
      /**If these 2 circles collide, return the manifold.
       * @memberof module:mcfud/geo2d
       * @param {Circle} a
       * @param {Circle} b
       * @return {Manifold} if false undefined
       */
      hitCircleCircle(a, b){
        let m=new Manifold();
        if(_circle_circle(a,b,m)) return m;
      },
      /**Check if these 2 circles collide.
       * @memberof module:mcfud/geo2d
       * @param {Circle} a
       * @param {Circle} b
       * @return {boolean}
       */
      hitTestCircleCircle(a, b){
        return _circle_circle(a,b,new Manifold());
      },
      /**If this polygon collides with the circle, return the manifold.
       * @memberof module:mcfud/geo2d
       * @param {Polygon} p
       * @param {Circle} c
       * @return {Manifold} if false undefined
       */
      hitPolygonCircle(p, c){
        let m=new Manifold();
        if(_poly_circle(p,c,m)) return m;
      },
      /**Check if polygon collides with the circle.
       * @memberof module:mcfud/geo2d
       * @param {Polygon} p
       * @param {Circle} c
       * @return {boolean}
       */
      hitTestPolygonCircle(p, c){
        return _poly_circle(p,c,new Manifold())
      },
      /**If this circle collides with polygon, return the manifold.
       * @memberof module:mcfud/geo2d
       * @param {Circle} c
       * @param {Polygon} p
       * @return {Manifold} if false undefined
       */
      hitCirclePolygon(c, p){
        let m=new Manifold();
        if(_circle_poly(c,p,m)) return m;
      },
      /**Check if this circle collides with the polygon.
       * @memberof module:mcfud/geo2d
       * @param {Circle} c
       * @param {Polygon} p
       * @return {boolean}
       */
      hitTestCirclePolygon(c, p){
        return _circle_poly(c,p,new Manifold())
      },
      /**If these 2 polygons collide, return the manifold.
       * @memberof module:mcfud/geo2d
       * @param {Polygon} a
       * @param {Polygon} b
       * @return {Manifold} if false undefined
       */
      hitPolygonPolygon(a, b){
        let m=new Manifold();
        if(_poly_poly(a,b,m)) return m;
      },
      /**Check if these 2 polygons collide.
       * @memberof module:mcfud/geo2d
       * @param {Polygon} a
       * @param {Polygon} b
       * @return {boolean}
       */
      hitTestPolygonPolygon(a, b){
        return _poly_poly(a,b,new Manifold())
      },
      /**Check if a point is inside these polygon vertices.
       * @memberof module:mcfud/geo2d
       * @param {number} testx
       * @param {number} testy
       * @param {Vec2[]} ps
       * @return {boolean}
       */
      hitTestPointInPolygon(testx,testy,ps){
        let c;
        for(let p,q,len=ps.length, i=0, j=len-1; i<len;){
          p=ps[i];
          q=ps[j];
          if(((p[1]>testy) !== (q[1]>testy)) &&
             (testx < (q[0]-p[0]) * (testy-p[1]) / (q[1]-p[1]) + p[0])) c = !c;
          j=i;
          ++i;
        }
        return c;
      },
      /**Check if point is inside this polygon.
       * @memberof module:mcfud/geo2d
       * @param {number} testx
       * @param {number} testy
       * @param {Polygon} poly
       * @return {boolean}
       */
      hitTestPointPolygon(testx,testy,poly){
        return this.hitTestPointInPolygon(testx,testy,
                                          _V.translate(poly.pos,poly.calcPoints))
      },
      hitTestLinePolygon(p,p2, poly){
        let vs=Polygon.translateCalcPoints(poly);
        for(let i=0,i2=0; i<vs.length; ++i){
          i2= i+1;
          if(i2 == vs.length) i2=0;
          let [hit,t] = this.lineIntersect2D(p,p2, vs[i],vs[i2]);
          if(hit)
            return [hit,t];
        }
        return [false];
      },
      lineIntersect2D(p, p2, q, q2){
        let x1=p[0],y1=p[1];
        let x2=p2[0],y2=p2[1];
        let x3=q[0],y3=q[1];
        let x4=q2[0],y4=q2[1];
        let t;//forL1
        let u;//forL2
        let d= (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
        //TODO: handle collinear correctly!?
        if(_.feq0(d))
          return [false];//parallel

        t=(x1-x3)*(y3-y4)-(y1-y3)*(x3-x4);
        t /= d;
        u=(x1-x3)*(y1-y2)-(y1-y3)*(x1-x2);
        u /= d;

        if(0<=t && t<=1 && 0<=u && u<=1){
          return [true, t, [x1+t*(x2-x1), y1+t*(y2-y1)]]
        }else{
          return [false]
        }
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"),
                           require("./math"),
                           require("./vec2"))
  }else{
    gscope["io/czlab/mcfud/geo2d"]=_module
  }

})(this);

/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright © 2020-2021, Kenneth Leung. All rights reserved. */

;(function(gscope){

  "use strict";

  /**Creates the module.
   */
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    const MFL=Math.floor;
    const {u:_,is} = Core;

    /**
      * @module mcfud/spatial
      */

    /**
     * @typedef {object} SpatialGrid
     * @property {function} reset()
     * @property {function} degrid()
     * @property {function} engrid()
     * @property {function} search(node)
     * @property {function} searchAndExec(node,cb)
     */

    /**Creates a 2d spatial grid. */
    function SpatialGrid(cellW,cellH){
      const _grid= new Map();
      return{
        searchAndExec(item,cb){
          let ret,
              g= item.getSpatial();
          for(let X,Y,y = g.y1; y <= g.y2; ++y){
            if(Y=_grid.get(y))
              for(let vs,r,x= g.x1; x <= g.x2; ++x)
                if(X=Y.get(x)){
                  vs=X.values();
                  r= vs.next();
                  while(!r.done){
                    if(item !== r.value){
                      if(ret=cb(item,r.value)){
                        x=y=Infinity;
                        break;
                      }
                    }
                    ret=null;
                    r= vs.next();
                  }
                }
          }
          return ret;
        },
        search(item,incItem=false){
          let X,Y,out=[],
              g= item.getSpatial();
          for(let y = g.y1; y <= g.y2; ++y){
            if(Y=_grid.get(y))
              for(let x= g.x1; x <= g.x2; ++x)
                if(X=Y.get(x))
                  X.forEach(v=>{
                    if(v===item && !incItem){}else{
                      out.push(v)
                    }
                  })
          }
          return out
        },
        engrid(item,skipAdd){
          if(!item){return}
          let r = item.getBBox(),
              g = item.getSpatial(),
              gridX1 = MFL(r.x1 / cellW),
              gridY1 = MFL(r.y1 / cellH),
              gridX2 = MFL(r.x2/cellW),
              gridY2 = MFL(r.y2/ cellH);
          if(g.x1 !== gridX1 || g.x2 !== gridX2 ||
             g.y1 !== gridY1 || g.y2 !== gridY2){
            this.degrid(item);
            g.x1= gridX1;
            g.x2= gridX2;
            g.y1= gridY1;
            g.y2= gridY2;
            if(!skipAdd) this._register(item);
          }
          return item;
        },
        reset(){
          _grid.clear() },
        _register(item){
          let g= item.getSpatial();
          if(is.num(g.x1)){
            for(let X,Y,y= g.y1; y <= g.y2; ++y){
              if(!_grid.has(y))
                _grid.set(y, new Map());
              Y=_grid.get(y);
              for(let x= g.x1; x <= g.x2; ++x){
                if(!Y.has(x))
                  Y.set(x, new Map());
                X=Y.get(x);
                _.assoc(X,item.getGuid(), item);
              }
            }
          }
        },
        degrid(item){
          if(item){
            let g= item.getSpatial();
            if(is.num(g.x1)){
              for(let X,Y,y= g.y1; y <= g.y2; ++y){
                if(Y=_grid.get(y))
                  for(let x= g.x1; x<=g.x2; ++x)
                    if(X=Y.get(x))
                      _.dissoc(X,item.getGuid())
              }
            }
          }
        }
      }
    }

    const _$={
      /**
       * @memberof module:mcfud/spatial
       * @param {number} cellWidth
       * @param {number} cellHeight
       * @return {SpatialGrid}
       */
      spatialGrid(cellWidth=320,cellHeight=320){
        return SpatialGrid(cellWidth,cellHeight)
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"));
  }else{
    gscope["io/czlab/mcfud/spatial"]=_module
  }

})(this);



/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright © 2020-2021, Kenneth Leung. All rights reserved. */

;(function(gscope){

  "use strict";

  /**Creates the module.
   */
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    const MFL=Math.floor;
    const {u:_} = Core;

    /**
      * @module mcfud/quadtree
      */

    /**
     * @typedef {object} QuadTree
     * @property {function} insert(node)
     * @property {function} search(node)
     * @property {function} remove(node)
     * @property {function} reset()
     * @property {function} prune()
     * @property {function} searchAndExec(node,cb)
     */

    /**
     * @typedef {object} QuadTreeNode
     * @property {number} x
     * @property {number} y
     * @property {number} width
     * @property {number} height
     * @property {function} getBBox()
     */

    /**Creates a QuadTree. */
    function QuadTree(left,right,top,bottom,maxCount,maxDepth,level){
      let boxes=null,
          objects = [];
      //if flipped the co-ord system is LHS (like a browser, y grows down, objects are top-left+width_height)
      //else RHS (standard, y grows up, objects are left-bottom+width_height)
      let flipped=(top<bottom),
          midX= MFL((left+right)/2),
          midY= MFL((top+bottom)/2);
      //find which quadrants r touches
      function _locate(r){
        let x,y,width,height;
        if(r.getBBox){
          let {x1,x2,y1,y2}=r.getBBox();
          x=x1;y=y1;width=x2-x1;height=flipped? y2-y1:y1-y2;
        }else if(r.x !== undefined && r.y !== undefined && r.width !== undefined && r.height !== undefined){
          x=r.x; y=r.y; width=r.width; height=r.height;
        }
        let out=[],
            left= x<midX,
            right= x+width>midX,
            up= flipped? (y<midY) : (y+height>midY),
            down= flipped? (y+height>midY): (y<midY);
        if(up){
          if(left) out.push(3);
          if(right) out.push(0); }
        if(down){
          if(left) out.push(2);
          if(right) out.push(1); }
        return out;
      }

      //split into 4 quadrants
      function _split(){
        //3|0
        //---
        //2|1
        _.assert(boxes===null);
        boxes=[QuadTree(midX, right,top,midY,maxCount,maxDepth,level+1),
               QuadTree(midX, right, midY, bottom,maxCount,maxDepth,level+1),
               QuadTree(left, midX, midY, bottom,maxCount,maxDepth,level+1),
               QuadTree(left, midX, top, midY,maxCount,maxDepth,level+1)];
      }

      const bbox={x1:left,x2:right,y1:top,y2:bottom};
      return{
        boundingBox(){ return bbox },
        subTrees(){return boxes},
        dbg(f){ return f(objects,boxes,maxCount,maxDepth,level) },
        insert:function(node){
          for(let n=0;n<arguments.length;++n){
            node=arguments[n];
            if(boxes){
              _locate(node).forEach(i=> boxes[i].insert(node))
            }else{
              objects.push(node);
              if(objects.length > maxCount && level < maxDepth){
                _split();
                objects.forEach(o=> _locate(o).forEach(i=> boxes[i].insert(o)));
                objects.length=0;
              }
            }
          }
        },
        remove(node){
          if(boxes){
            boxes.forEach(b=>b.remove(node))
          }else{
            _.disj(objects,node)
          }
        },
        isLeaf(){
          return boxes===null ? -1 : objects.length
        },
        prune(){
          if(boxes){
            let sum=0,
                total=0;
            for(let b,i=0;i<boxes.length;++i){
              b=boxes[i];
              b.prune();
              n=b.isLeaf();
              if(n>=0){
                ++sum;
                total+=n;
              }
            }
            if(sum===boxes.length){//4
              //subtrees are leaves and total count is small
              //enough so pull them up into this node
              if(total<maxCount){
                _.assert(objects.length===0,
                         "quadtree wanted zero items");
                boxes.forEach(b=>b._swap(objects));
                boxes=null;
                //now this node is a leaf!
              }
            }
          }
        },
        _swap(out){
          objects.forEach(b=>out.push(b))
          objects.length=0;
        },
        reset(){
          objects.length=0;
          boxes && boxes.forEach(b=> b.reset());
          boxes=null;
        },
        searchAndExec(node,cb,skipSelf){
          let ret;
          if(boxes){
            let ns=_locate(node);
            for(let i=0;i<ns.length;++i){
              ret=boxes[ns[i]].searchAndExec(node,cb,skipSelf);
              if(ret){break;}
            }
          }else{
            for(let o,i=0;i<objects.length;++i){
              o=objects[i];
              if(skipSelf && o===node){continue}
              if(ret=cb(o,node)){ break }
            }
          }
          return ret;
        },
        search(node,skipSelf){
          //handle duplicates
          const bin=new Map();
          const out = [];
          if(skipSelf){bin.set(node,null)}
          if(boxes){
            _locate(node).forEach(i=>{
              boxes[i].search(node).forEach(o=>{
                if(!bin.has(o)){
                  bin.set(o,null);
                  out.push(o);
                }
              })
            })
          }
          objects.forEach(o=>{
            if(!bin.has(o)){
              bin.set(o,null);
              out.push(o);
            }
          });
          //found all objects closeby
          bin.clear();
          return out;
        }
      };
    }

    const _$={
      /**
       * @memberof module:mcfud/quadtree
       * @param {object} region {left,right,top,bottom} the bounding region
       * @param {number} maxCount maximum number of objects in each tree
       * @param {number} maxDepth maximum depth of tree
       * @return {QuadTree}
       */
      quadtree(region,maxCount=12,maxDepth=5){
        const {left,right,top,bottom}=region;
        return QuadTree(left,right,top,bottom,maxCount,maxDepth,0)
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"));
  }else{
    gscope["io/czlab/mcfud/qtree"]=_module
  }

})(this);



/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright © 2013-2021, Kenneth Leung. All rights reserved. */

;(function(gscope){

  "use strict";

  /**Creates the module.
   */
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_}=Core;

    /**
      * @module mcfud/negamax
      */

    /**
     * @memberof module:mcfud/negamax
     * @class
     * @property {any} lastBestMove
     * @property {any} state
     * @property {any} other
     * @property {any} cur
     */
    class GFrame{
      /**
       * @param {any} cur
       * @param {any} other
       */
      constructor(cur,other){
        this.lastBestMove=null;
        this.state= null;
        this.other=other;
        this.cur=cur;
      }
      /**Make a copy of this.
       * @param {function} cp  able to make a copy of state
       * @return {GFrame}
       */
      clone(cp){
        const f= new GFrame();
        f.state=cp(this.state);
        f.lastBestMove=this.lastBestMove;
        f.other=this.other;
        f.cur=this.cur;
        return f;
      }
    }

    /**Represents a game board.
     * @memberof module:mcfud/negamax
     * @class
     */
    class GameBoard{
      constructor(){}
      /**Get the function that copies a game state.
       * @return {function}
       */
      getStateCopier(){}
      /**Get the first move.
       * @param {GFrame} frame
       * @return {any}
       */
      getFirstMove(frame){}
      /**Get the list of next possible moves.
       * @param {GFrame} frame
       * @return {any[]}
       */
      getNextMoves(frame){}
      /**Calculate the score.
       * @param {GFrame} frame
       * @return {number}
       */
      evalScore(frame){}
      /**Check if game is a draw.
       * @param {GFrame} frame
       * @return {boolean}
       */
      isStalemate(frame){}
      /**Check if game is over.
       * @param {GFrame} frame
       * @return {boolean}
       */
      isOver(frame){}
      /**Reverse previous move.
       * @param {GFrame} frame
       * @param {any} move
       */
      unmakeMove(frame, move){
        if(!this.undoMove)
          throw Error("Need Implementation");
        this.switchPlayer(frame);
        this.undoMove(frame, move);
      }
      //undoMove(frame, move){}
      //doMove(frame, move){ }
      /**Make a move.
       * @param {GFrame} frame
       * @param {any} move
       */
      makeMove(frame, move){
        if(!this.doMove)
          throw Error("Need Implementation!");
        this.doMove(frame, move);
        this.switchPlayer(frame);
      }
      /**Switch to the other player.
       * @param {GFrame} frame
       */
      switchPlayer(snap){
        let t = snap.cur;
        snap.cur= snap.other;
        snap.other= t;
      }
      /**Get the other player.
       * @param {any} pv player
       * @return {any}
       */
      getOtherPlayer(pv){
        if(pv === this.actors[1]) return this.actors[2];
        if(pv === this.actors[2]) return this.actors[1];
      }
      /**Get the current player.
       * @return {any}
       */
      getPlayer(){
        return this.actors[0]
      }
      /**Take a snapshot of current game state.
       * @return {GFrame}
       */
      takeGFrame(){}
      run(seed,actor){
        this.getAlgoActor=()=>{ return actor }
        this.syncState(seed,actor);
        let pos= this.getFirstMove();
        if(_.nichts(pos))
          pos= _$.evalNegaMax(this);
        return pos;
      }
    }

    /** @ignore */
    function _calcScore(board,game,depth,maxDepth){
      //if the other player wins, then return a -ve else +ve
      //maxer == 1 , minus == -1
      let score=board.evalScore(game,depth,maxDepth);
      /*
      if(!_.feq0(score))
        score -= 0.01*depth*Math.abs(score)/score;
      return score;
      */
      return score * (1 + 0.001 * depth);
    }

    //option2
    //
    function _negaAlphaBeta(board, game, depth, maxDepth, alpha, beta){

      if(depth===0 || board.isOver(game)){
        return { depth, value: _calcScore(board,game,depth,maxDepth) }
      }

      let state=game,
          copier= board.getStateCopier(),
          openMoves= _.shuffle(board.getNextMoves(game));

      for(let rc, move, i=0; i< openMoves.length; ++i){
        move= openMoves[i];
        if(!board.undoMove){
          _.assert(copier, "Missing state copier!");
          game= state.clone(copier);
        }
        board.makeMove(game, move);
        rc = _negaAlphaBeta(board, game, depth-1,
                                         maxDepth,
                                         {value: -beta.value, move: beta.move},
                                         {value: -alpha.value, move: alpha.move});
        //now, roll it back
        if(board.undoMove)
          board.unmakeMove(game, move);
        rc.value = -rc.value;
        rc.move = move;
        if(rc.value>alpha.value){
          alpha = {value: rc.value, move: move, depth: rc.depth};
        }
        if(alpha.value >= beta.value){
          return beta;
        }
      }

      return JSON.parse(JSON.stringify(alpha));
    }
    //
    //

    /**Implements the NegaMax Min-Max algo.
     * @see {@link https://github.com/Zulko/easyAI}
     * @param {GameBoard} board
     * @param {GFrame} game
     * @param {number} depth
     * @param {number} maxDepth
     * @param {number} alpha
     * @param {number} beta
     * @return {number}
     */
    function _negaMax(board, game, depth,maxDepth,alpha, beta){

      if(depth===0 || board.isOver(game)){
        return [_calcScore(board,game,depth,maxDepth),null]
      }

      let openMoves = _.shuffle(board.getNextMoves(game)),
          copier= board.getStateCopier(),
          state=game,
          bestValue = -Infinity,
          bestMove = openMoves[0];

      if(depth===maxDepth)
        state.lastBestMove=bestMove;

      for(let rc, move, i=0; i<openMoves.length; ++i){
        if(!board.undoMove){
          _.assert(copier, "Missing state copier!");
          game=state.clone(copier);
        }
        move = openMoves[i];
        //try a move
        board.makeMove(game, move);
        rc= - _negaMax(board, game, depth-1, maxDepth, -beta, -alpha)[0];
        //now, roll it back
        if(board.undoMove)
          board.unmakeMove(game, move);
        //how did we do ?
        if(bestValue < rc){
          bestValue = rc;
          bestMove = move
        }
        if(alpha < rc){
          alpha=rc;
          if(depth === maxDepth)
            state.lastBestMove = move;
          if(alpha >= beta) break;
        }
      }
      return [bestValue, state.lastBestMove];
    }

    const _$={
      algo:"negamax",
      GFrame,
      GameBoard,
      /**Make a move on the game-board using negamax algo.
       * @memberof module:mcfud/negamax
       * @param {GameBoard} board
       * @return {any} next best move
       */
      XXevalNegaMax(board){
        const f= board.takeGFrame();
        const d= board.depth;
        let score,move;
        [score,move]= _negaMax(board, f, d,d, -Infinity, Infinity);
        if(_.nichts(move))
          console.log(`evalNegaMax: score=${score}, pos= ${move}, lastBestMove=${move}`);
        return move;
      },
      evalNegaMax(board){
        const f= board.takeGFrame();
        const d= board.depth;
        let {value, move} = _negaAlphaBeta(board, f, d, d, {value: -Infinity },
                                                           {value: Infinity  });
        if(_.nichts(move))
          console.log(`evalNegaMax: score= ${value}, pos= ${move}`);
        return move;
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/negamax"]=_module
  }

})(this);


/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright © 2013-2021, Kenneth Leung. All rights reserved. */

;(function(gscope){

  "use strict";

  /**Creates the module.
   */
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_}=Core;

    /**
      * @module mcfud/minimax
      */

    /**
     * @memberof module:mcfud/minimax
     * @class
     * @property {any} state
     * @property {any} other
     * @property {any} cur
     */
    class GFrame{
      /**
       * @param {any} cur
       * @param {any} other
       */
      constructor(cur,other){
        this.cur=cur;
        this.state= null;
        this.other=other;
      }
      /**Make a copy of this.
       * @param {function} cp  able to make a copy of state
       * @return {GFrame}
       */
      clone(cp){
        const f= new GFrame();
        f.state=cp(this.state);
        f.other=this.other;
        f.cur=this.cur;
        return f;
      }
    }

    /**Represents a game board.
     * @memberof module:mcfud/minimax
     * @class
     */
    class GameBoard{
      constructor(){
        this.aiActor=null;
      }
      /**Get the function that copies a game state.
       * @return {function}
       */
      getStateCopier(){}
      /**Get the first move.
       * @param {GFrame} frame
       * @return {any}
       */
      getFirstMove(frame){}
      /**Get the list of next possible moves.
       * @param {GFrame} frame
       * @return {any[]}
       */
      getNextMoves(frame){}
      /**Calculate the score.
       * @param {GFrame} frame
       * @param {number} depth
       * @param {number} maxDepth
       * @return {number}
       */
      evalScore(frame,depth,maxDepth){}
      /**Check if game is a draw.
       * @param {GFrame} frame
       * @return {boolean}
       */
      isStalemate(frame){}
      /**Check if game is over.
       * @param {GFrame} frame
       * @return {boolean}
       */
      isOver(frame,move){}
      /**Reverse previous move.
       * @param {GFrame} frame
       * @param {any} move
       */
      unmakeMove(frame, move){
        if(!this.undoMove)
          throw Error("Need Implementation");
        this.switchPlayer(frame);
        this.undoMove(frame, move);
      }
      //undoMove(frame, move){}
      //doMove(frame, move){ }
      /**Make a move.
       * @param {GFrame} frame
       * @param {any} move
       */
      makeMove(frame, move){
        if(!this.doMove)
          throw Error("Need Implementation!");
        this.doMove(frame, move);
        this.switchPlayer(frame);
      }
      /**Take a snapshot of current game state.
       * @return {GFrame}
       */
      takeGFrame(){}
      /**Switch to the other player.
       * @param {GFrame} snap
       */
      switchPlayer(snap){
        let t = snap.cur;
        snap.cur= snap.other;
        snap.other= t;
      }
      /**Get the other player.
       * @param {any} pv player
       * @return {any}
       */
      getOtherPlayer(pv){
        if(pv === this.actors[1]) return this.actors[2];
        if(pv === this.actors[2]) return this.actors[1];
      }
      /**Get the current player.
       * @return {any}
       */
      getPlayer(){
        return this.actors[0]
      }
      /**Run the algo and get a move.
       * @param {any} seed
       * @param {any} actor
       * @return {any}  the next move
       */
      run(seed,actor){
        this.getAlgoActor=()=>{ return actor }
        this.syncState(seed,actor);
        let pos= this.getFirstMove();
        if(_.nichts(pos))
          pos= _$.evalMiniMax(this);
        return pos;
      }
    }

    /** @ignore */
    function _calcScore(board,game,depth,maxDepth){
      //+ve if AI wins
      return board.evalScore(game,depth,maxDepth)
    }

    /**Implements the Min-Max (alpha-beta) algo.
     * @param {GameBoard} board
     * @param {GFrame} game
     * @param {number} depth
     * @param {number} maxDepth
     * @param {number} alpha
     * @param {number} beta
     * @return {number}
     */
    function _miniMax(board, game, depth,maxDepth, alpha, beta, maxing){
      if(depth===0 || board.isOver(game)){
        return [_calcScore(board,game,depth,maxDepth),null]
      }
      ///////////
      let state=game,
          copier= board.getStateCopier(),
          openMoves= _.shuffle(board.getNextMoves(game));
      if(maxing){
        let rc,pos,move,
            bestMove=openMoves[0], maxValue = -Infinity;
        for(let i=0; i<openMoves.length; ++i){
          if(!board.undoMove){
            _.assert(copier,"Missing state copier!");
            game=state.clone(copier);
          }
          move=openMoves[i];
          board.makeMove(game, move);
					rc= _miniMax(board, game, depth-1, maxDepth, alpha, beta, !maxing)[0];
          if(board.undoMove)
            board.unmakeMove(game,move);
					alpha = Math.max(rc,alpha);
          if(rc > maxValue){
						maxValue = rc;
						bestMove = move;
          }
					if(beta <= alpha){break}
        }
        return [maxValue,bestMove];
      }else{
			  let rc,pos,move,
            bestMove=openMoves[0], minValue = Infinity;
        for(let i=0; i<openMoves.length; ++i){
          if(!board.undoMove){
            _.assert(copier, "Missing state copier!");
            game=state.clone(copier);
          }
          move=openMoves[i];
          board.makeMove(game, move);
					rc = _miniMax(board, game, depth-1, maxDepth, alpha, beta, !maxing)[0];
          if(board.undoMove)
            board.unmakeMove(game, move);
					beta = Math.min(rc,beta);
          if(rc < minValue){
						minValue = rc;
						bestMove = move;
          }
					if(beta <= alpha){break}
        }
        return [minValue,bestMove];
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      algo: "minimax",
      GFrame,
      GameBoard,
      /**Make a move on the game-board using minimax algo.
       * @memberof module:mcfud/minimax
       * @param {GameBoard} board
       * @return {any} next best move
       */
      evalMiniMax(board){
        const f= board.takeGFrame();
        const d= board.depth;
        let score,move;
        [score, move]= _miniMax(board, f, d,d, -Infinity, Infinity, true);
        if(_.nichts(move))
          console.log(`evalMiniMax: score=${score}, pos= ${move}`);
        return move;
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/minimax"]=_module
  }

})(this);


// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
   */
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();

    const CMP=(a,b)=>{return a<b?-1:(a>b?1:0)};
    const int=Math.floor;
    const {is, u:_}= Core;
    /**
     * @module mcfud/algo_basic
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function dbgIter(o){
      let s="";
      for(let v, it=o.iterator(); it.hasNext();)
        s+= it.next() + " ";
      return s;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _checkKey(key){
      if(!is.num(key) && !is.str(key))
        throw Error(`expected either number or string`);
      return true;
    }

    /**Original source from https://github.com/awstuff/TreeMap.js
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {root} top of the map
     * @property {n} number of elements in map
     */
    class TreeMap{
      constructor(C){
        this.compare=C || CMP;
        this.root=null;
        this.n=0;
      }
      size(){
        return this.n
      }
      contains(key){
        return this.get(key) !== undefined
      }
      get(key){
        _checkKey(key);
        function _get(key,node,res){
          if(node) res=key < node.key?_get(key, node.left)
                                     :(key > node.key? _get(key, node.right): node.value);
          return res;
        }
        if(this.n>0)
          return _get(key,this.root);
      }
      set(key, value){
        let self=this;
        function _set(key, value, node){
          if(!node){
            self.n+=1;
            return{key,value,left:null,right:null};
          }
          let c= self.compare(key,node.key);
          if(c<0){
            node.left = _set(key, value, node.left);
          }else if(c>0){
            node.right = _set(key, value, node.right);
          }else{
            node.value = value;
          }
          return node;
        }
        _checkKey(key);
        this.root = _set(key, value, this.root);
      }
      _getMaxNode(node){
        while(node !== null && node.right !== null){ node = node.right }
        return node;
      }
      _getMaxKey(){
        let n = this._getMaxNode(this.root);
        if(n)
          return n.key;
      }
      _getMinNode(node){
        while(node !== null && node.left !== null){ node = node.left }
        return node;
      }
      _getMinKey(){
        let n = this._getMinNode(this.root);
        if(n)
          return n.key;
      }
      remove(key){
        let self=this;
        function _del(key, node){
          if(node){
            if(key < node.key){
              node.left = _del(key, node.left);
            }else if(key > node.key){
              node.right = _del(key, node.right);
            }else{
              if(node.left && node.right){
                let m = self._getMaxNode(node.left), k = m.key, v = m.value;
                m.value = node.value;
                m.key = node.key;
                node.key = k;
                node.value = v;
                node.left = _del(key, node.left);
              }else if(node.left){
                node=node.left;
                self.n -=1;
              }else if(node.right){
                node= node.right;
                self.n -=1;
              }else{
                node= null;
                self.n -=1;
              }
            }
          }
          return node;
        }
        _checkKey(key);
        this.root = _del(key, this.root);
      }
      keys(){
        let out=new Queue();
        this.forEach((v,k)=> out.enqueue(k));
        return out;
      }
      firstKey(){
        let q,k;
        if(this.n>0){
          q= this.keys();
          k=q.head();
        }
        return k;
      }
      lastKey(){
        let q,k;
        if(this.n>0){
          q= this.keys();
          k=q.tail();
        }
        return k;
      }
      forEach(cb, ctx){
        function _invokeCb(ctx,cb){
          return cb && cb.apply(ctx, Array.prototype.slice.call(arguments, 2)) }
        function _each(node, cb, ctx, internal){
          if(!node)
            return _invokeCb(ctx, internal);
          _each(node.left, cb, ctx, function(){
            _invokeCb(ctx, cb, node.value, node.key);
            _each(node.right, cb, ctx, function(){ _invokeCb(ctx, internal) });
          });
        }
        _each(this.root, cb, ctx);
      }
      static test(){
        let t= new TreeMap();
        t.set(3, "3"); t.set(2,"2"); t.set(7,"7"), t.set(1,"1");
        console.log(`firstKey= ${t.firstKey()}`);
        console.log(`lastKey= ${t.lastKey()}`);
        console.log(dbgIter(t.keys()));
        console.log(`k= ${t.get(3)}`);
        console.log(`has 2 = ${t.contains(2)}`);
        console.log(`has size = ${t.size()}`);
        t.remove(1);
        console.log(`has size = ${t.size()}`);
        console.log(dbgIter(t.keys()));
        console.log(`k= ${t.get(2)}`);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Helper linked list
     * @memberof module:mcfud/algo_basic
     * @param {any} item
     * @param {object} next
     * @return {object}
     */
    function Node(item,next=null){
      return { item, next }
    }
    /**Represents a bag (or multiset) of generic items.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} beginning of bag
     * @property {n} number of elements in bag
     */
    class Bag{
      constructor(){
        this.first = null;
        this.n = 0;
      }
      /**Returns true if this bag is empty.
       * @return {@code true} if this bag is empty;
       *         {@code false} otherwise
       */
      isEmpty(){
        return this.first == null;
      }
      /**Returns the number of items in this bag.
       * @return the number of items in this bag
       */
      size(){
        return this.n;
      }
      /**Adds the item to this bag.
       * @param  item the item to add to this bag
       */
      add(item){
        this.first = Node(item, this.first);
        this.n++;
      }
      /**Returns an iterator that iterates over the items in this bag in arbitrary order.
       * @return an iterator that iterates over the items in this bag in arbitrary order
       */
      iterator(){
        let current = this.first;
        return{
          remove(){ throw Error("Unsupported")  },
          hasNext(){ return current != null },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            let item = current.item;
            current = current.next;
            return item;
          }
        }
      }
      static test(){
        let obj= new Bag();
        "to be or not to - be - - that - - - is".split(" ").forEach(n=> obj.add(n));
        console.log("size of bag = " + obj.size());
        obj=obj.iterator();
        while(obj.hasNext()){
          console.log(obj.next());
        }
      }
    }

    /**Represents a last-in-first-out (LIFO) stack of generic items.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} top of stack
     * @property {n} size of stack
     */
    class Stack{
      constructor(){
        this.first = null;
        this.n = 0;
      }
      /**Returns true if this stack is empty.
       * @return true if this stack is empty; false otherwise
       */
      isEmpty(){
        return this.first == null;
      }
      /**Returns the number of items in this stack.
       * @return the number of items in this stack
       */
      size(){
        return this.n;
      }
      /**Adds the item to this stack.
       * @param  item the item to add
       */
      push(item){
        this.first = Node(item, this.first);
        this.n++;
      }
      /**Removes and returns the item most recently added to this stack.
       * @return the item most recently added
       * @throws Error if this stack is empty
       */
      pop(){
        if(this.isEmpty())
          throw Error("Stack underflow");
        let item = this.first.item; // save item to return
        this.first = this.first.next;            // delete first node
        --this.n;
        return item;                   // return the saved item
      }
      /**Returns (but does not remove) the item most recently added to this stack.
       * @return the item most recently added to this stack
       * @throws NoSuchElementException if this stack is empty
       */
      peek(){
        if(this.isEmpty())
          throw Error("Stack underflow");
        return this.first.item;
      }
      /**Returns a string representation of this stack.
       * @return the sequence of items in this stack in LIFO order, separated by spaces
       */
      toString(){
        let out="",
            s= this.iterator();
        while(s.hasNext())
          out += s.next() + " ";
        return out;
      }
      /**Returns an iterator to this stack that iterates through the items in LIFO order.
       * @return an iterator to this stack that iterates through the items in LIFO order
       */
      iterator(){
        let current = this.first;
        return{
          remove(){ throw Error("Unsupported") },
          hasNext(){ return current != null },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            let item = current.item;
            current = current.next;
            return item;
          }
        }
      }
      static test(){
        let obj= new Stack();
        "to be or not to - be - - that - - - is".split(" ").forEach(s=>{
          if(s != "-"){
            obj.push(s);
          }else if(!obj.isEmpty()){
            console.log(obj.pop() + " ");
          }
        });
        console.log("(" + obj.size() + " left on stack)");
      }
    }

    /**Represents a first-in-first-out (FIFO) queue of generic items.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} beginning of queue
     * @property {last} end of queue
     * @property {n} number of elements on queue
     */
    class LinkedQueue{
      constructor(){
        this.first = null; // beginning of queue
        this.last  = null; //end of queue
        this.n = 0; // number of elements on queue
      }
      /**Is this queue empty?
       * @return true if this queue is empty; false otherwise
       */
      isEmpty(){
        return this.first == null;
      }
      /**Returns the number of items in this queue.
       * @return the number of items in this queue
       */
      size(){
        return this.n;
      }
      /**Returns the item least recently added to this queue.
       * @return the item least recently added to this queue
       * @throws Error if this queue is empty
       */
      peek(){
        if(this.isEmpty())
          throw Error("Queue underflow");
        return this.first.item;
      }
      /**Adds the item to this queue.
       * @param item the item to add
       */
      enqueue(item){
        let oldlast = this.last;
        this.last = Node(item);
        if(this.isEmpty())
          this.first = this.last;
        else
          oldlast.next = this.last;
        ++this.n;
        //assert check();
      }
      /**Removes and returns the item on this queue that was least recently added.
       * @return the item on this queue that was least recently added
       * @throws Error if this queue is empty
       */
      dequeue(){
        if(this.isEmpty())
          throw Error("Queue underflow");
        let item = this.first.item;
        this.first = this.first.next;
        --this.n;
        if(this.isEmpty()) this.last = null;   // to avoid loitering
        //assert check();
        return item;
      }
      /**Returns a string representation of this queue.
       * @return the sequence of items in FIFO order, separated by spaces
       */
      toString(){
        let out="",
            it=this.iterator();
        while(it.hasNext()){
          out += it.next() + " ";
        }
        return out;
      }
      /**Returns an iterator that iterates over the items in this queue in FIFO order.
       * @return an iterator that iterates over the items in this queue in FIFO order
       */
      iterator(){
        let current = this.first;
        return{
          remove(){ throw Error("UnsupportedOperationException") },
          hasNext(){ return current != null },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            let item = current.item;
            current = current.next;
            return item;
          }
        }
      }
      static test(){
        let obj= new LinkedQueue();
        "to be or not to - be - - that - - - is".split(" ").forEach(s=>{
          if(s != "-"){
            obj.enqueue(s);
          }else if(!obj.isEmpty()){
            console.log(obj.dequeue() + " ");
          }
        });
        console.log("(" + obj.size() + " left on queue)");
      }
    }

    /**
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} beginning of queue
     * @property {last} end of queue
     * @property {n} number of elements on queue
     */
    class Queue{
      /**
       * Initializes an empty queue.
       */
      constructor(){
        this.first = null;
        this.last  = null;
        this.n = 0;
      }
      /**Returns true if this queue is empty.
       * @return {@code true} if this queue is empty; {@code false} otherwise
       */
      isEmpty(){
        return this.first == null;
      }
      /**Returns the number of items in this queue.
       * @return the number of items in this queue
       */
      size(){
        return this.n;
      }
      head(){
        return this.first && this.first.item;
      }
      tail(){
        return this.last && this.last.item;
      }
      /**Returns the item least recently added to this queue.
       * @return the item least recently added to this queue
       * @throws Error if this queue is empty
       */
      peek(){
        if(this.isEmpty()) throw Error("Queue underflow");
        return this.first.item;
      }
      /**Adds the item to this queue.
       * @param  item the item to add
       */
      enqueue(item){
        let oldlast = this.last;
        this.last = Node(item);
        if(this.isEmpty()) this.first = this.last;
        else oldlast.next = this.last;
        this.n+=1;
      }
      /**Removes and returns the item on this queue that was least recently added.
       * @return the item on this queue that was least recently added
       * @throws Error if this queue is empty
       */
      dequeue(){
        if(this.isEmpty()) throw Error("Queue underflow");
        let item = this.first.item;
        this.first = this.first.next;
        this.n-=1;
        if(this.isEmpty()) this.last = null;   // to avoid loitering
        return item;
      }
      /**Returns a string representation of this queue.
       * @return the sequence of items in FIFO order, separated by spaces
       */
      toString(){
        let s = "";
        for(let item, it=this.iterator(); it.hasNext();){
          s+= item + " ";
        }
        return s;
      }
      /**Returns an iterator that iterates over the items in this queue in FIFO order.
       * @return an iterator that iterates over the items in this queue in FIFO order
       */
      iterator(){
        let current=this.first;
        return{
          remove(){ throw Error("UnsupportedOperationException") },
          hasNext(){ return current != null },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            let item = current.item;
            current = current.next;
            return item;
          }
        }
      }
      static test(){
        let queue = new Queue();
        "to be or not to - be - - that - - - is".split(/\s+/).forEach(s=>{
          if(s!="-")
            queue.enqueue(s);
          else if(!queue.isEmpty())
            console.log(queue.dequeue() + " ");
        });
        console.log("(" + queue.size() + " left on queue)");
      }
    }

    /**Represents an ordered symbol table of generic key-value pairs.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} beginning of queue
     * @property {last} end of queue
     * @property {n} number of elements on queue
     */
    class ST{
      constructor(){
        this.st = new TreeMap();
      }
      /**Returns the value associated with the given key in this symbol table.
       *
       * @param  key the key
       * @return the value associated with the given key if the key is in this symbol table;
       *         {@code null} if the key is not in this symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(_.nichts(key)) throw Error("calls get() with null key");
        return this.st.get(key);
      }
      /**
       * Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(_.nichts(key)) throw Error("calls put() with null key");
        if(val === undefined) this.st.remove(key);
        else this.st.set(key, val);
      }
      /**
       * Removes the specified key and its associated value from this symbol table
       * (if the key is in this symbol table).
       * This is equivalent to {@code remove()}, but we plan to deprecate {@code delete()}.
       *
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      remove(key){
        if(_.nichts(key)) throw Error("calls remove() with null key");
        this.st.remove(key);
      }
      /**Returns true if this symbol table contain the given key.
       *
       * @param  key the key
       * @return {@code true} if this symbol table contains {@code key} and
       *         {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        if(_.nichts(key)) throw Error("calls contains() with null key");
        return this.st.contains(key);
      }
      /**Returns the number of key-value pairs in this symbol table.
       *
       * @return the number of key-value pairs in this symbol table
       */
      size(){
        return this.st.size();
      }
      /**Returns true if this symbol table is empty.
       *
       * @return {@code true} if this symbol table is empty and {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**Returns all keys in this symbol table.
       * <p>
       * To iterate over all of the keys in the symbol table named {@code st},
       * use the foreach notation: {@code for (Key key : st.keys())}.
       *
       * @return all keys in this symbol table
       */
      keys(){
        return this.st.keys();
      }
      /**Returns the smallest key in this symbol table.
       *
       * @return the smallest key in this symbol table
       * @throws Error if this symbol table is empty
       */
      min(){
        if(this.isEmpty()) throw Error("calls min() with empty symbol table");
        return this.st.firstKey();
      }
      /**Returns the largest key in this symbol table.
       * @return the largest key in this symbol table
       * @throws Error if this symbol table is empty
       */
      max(){
        if(this.isEmpty()) throw Error("calls max() with empty symbol table");
        return this.st.lastKey();
      }
      /**Returns the smallest key in this symbol table greater than or equal to {@code key}.
       *
       * @param  key the key
       * @return the smallest key in this symbol table greater than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        if(_.nichts(key)) throw Error("argument to ceiling() is null");
        let w,k,q= this.st.keys();
        let it=q.iterator();
        while(it.hasNext()){
          k=it.next();
          if(k == key || k>key){
            w=k;
            break;
          }
        }
        if(w===undefined) throw Error("argument to ceiling() is too large");
        return w;
      }
      /**Returns the largest key in this symbol table less than or equal to {@code key}.
       *
       * @param  key the key
       * @return the largest key in this symbol table less than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        if(_.nichts(key)) throw Error("argument to floor() is null");
        let w,k,q= this.st.keys();
        let it=q.iterator();
        while(it.hasNext()){
          k=it.next();
          if(k == key || k<key){
            w=k;
          }
        }
        if(w===undefined) throw Error("argument to floor() is too small");
        return w;
      }
      static test(){
        let t= new ST();
        t.put("a",1);t.put("g", 9); t.put("c",3); t.put("j",10); t.put("z",26); t.put("x",24);
        console.log(`isEmpty= ${t.isEmpty()}`);
        console.log(`size= ${t.size()}`);
        console.log(`get-c= ${t.get("c")}`);
        console.log(`contains z= ${t.contains("z")}`);
        console.log(`contains m= ${t.contains("m")}`);
        console.log(dbgIter(t.keys()));
        console.log(`ceil w= ${t.ceiling("w")}`);
        console.log(`floor k= ${t.floor("k")}`);
        console.log(`min = ${t.min()}`);
        console.log(`max = ${t.max()}`);
        t.remove("x");
        console.log(dbgIter(t.keys()));
      }
    }

    /**Represents an ordered symbol table of generic key-value pairs.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {number} height  height of tree
     * @property {number} n  number of key-value pairs in the B-tree
     * @property {object} root root of tree
     */
    class BTree{
      // max children per B-tree node = M-1 (must be even and greater than 2)
      static M = 4;
      Node(k){
        return{
          m:k,    // number of children
          children: new Array(BTree.M) // children
        }
      }
      // internal nodes: only use key and next external nodes: only use key and value
      Entry(key,val,next=null){
        return{ key, val, next }
      }
      /**
       * Initializes an empty B-tree.
       */
      constructor(compareFn){
        this.root = this.Node(0);
        this.compare=compareFn;
        this._height=0;
        this.n=0;
      }
      /**
       * Returns true if this symbol table is empty.
       * @return {@code true} if this symbol table is empty; {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**
       * Returns the number of key-value pairs in this symbol table.
       * @return the number of key-value pairs in this symbol table
       */
      size() {
        return this.n;
      }
      /**
       * Returns the height of this B-tree (for debugging).
       *
       * @return the height of this B-tree
       */
      height(){
        return this._height;
      }
      /**
       * Returns the value associated with the given key.
       *
       * @param  key the key
       * @return the value associated with the given key if the key is in the symbol table
       *         and {@code null} if the key is not in the symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(_.nichts(key)) throw Error("argument to get() is null");
        return this._search(this.root, key, this._height);
      }
      _search(x, key, ht){
        let cs = x.children;
        // external node
        if(ht == 0){
          for(let j = 0; j < x.m; j++)
            if(this.compare(key, cs[j].key)==0) return cs[j].val;
        }else{ // internal node
          for(let j = 0; j < x.m; j++)
            if(j+1 == x.m ||
               this.compare(key, cs[j+1].key)<0)
              return this._search(cs[j].next, key, ht-1);
        }
      }
      /**
       * Inserts the key-value pair into the symbol table, overwriting the old value
       * with the new value if the key is already in the symbol table.
       * If the value is {@code null}, this effectively deletes the key from the symbol table.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(_.nichts(key)) throw Error("argument key to put() is null");
        let u = this._insert(this.root, key, val, this._height);
        this.n++;
        if(!u) return;
        // need to split root
        let t = this.Node(2);
        t.children[0] = this.Entry(this.root.children[0].key, null, this.root);
        t.children[1] = this.Entry(u.children[0].key, null, u);
        this.root = t;
        this._height++;
      }
      _insert(h, key, val, ht){
        let j,
            t = this.Entry(key, val);
        if(ht == 0){
          for(j = 0; j < h.m; j++)
            if(this.compare(key, h.children[j].key)<0) break;
        }else{ // internal node
          for(j = 0; j < h.m; j++){
            if((j+1 == h.m) ||
               this.compare(key, h.children[j+1].key)<0){
              let u = this._insert(h.children[j++].next, key, val, ht-1);
              if(!u) return null;
              t.key = u.children[0].key;
              t.val = null;
              t.next = u;
              break;
            }
          }
        }
        for(let i = h.m; i > j; i--)
          h.children[i] = h.children[i-1];
        h.children[j] = t;
        h.m++;
        if(h.m >= BTree.M) return this._split(h);
      }
      // split node in half
      _split(h){
        let m2=int(BTree.M/2),
            t = this.Node(m2);
        h.m = m2;
        for(let j = 0; j < m2; j++)
          t.children[j] = h.children[m2+j];
        return t;
      }
      /**
       * Returns a string representation of this B-tree (for debugging).
       *
       * @return a string representation of this B-tree.
       */
      toString() {
        function _s(h, ht, indent){
          let s= "", cs= h.children;
          if(ht == 0){
            for(let j = 0; j < h.m; j++)
              s+= `${indent}${cs[j].key} ${cs[j].val}\n`;
          }else{
            for(let j = 0; j < h.m; j++){
              if(j > 0)
                s+= `${indent}(${cs[j].key})\n`;
              s+= _s(cs[j].next, ht-1, indent+"     ");
            }
          }
          return s;
        }
        return _s(this.root, this._height, "") + "\n";
      }
      static test(){
        let st = new BTree(CMP);
        st.put("www.cs.princeton.edu", "128.112.136.12");
        st.put("www.cs.princeton.edu", "128.112.136.11");
        st.put("www.princeton.edu",    "128.112.128.15");
        st.put("www.yale.edu",         "130.132.143.21");
        st.put("www.simpsons.com",     "209.052.165.60");
        st.put("www.apple.com",        "17.112.152.32");
        st.put("www.amazon.com",       "207.171.182.16");
        st.put("www.ebay.com",         "66.135.192.87");
        st.put("www.cnn.com",          "64.236.16.20");
        st.put("www.google.com",       "216.239.41.99");
        st.put("www.nytimes.com",      "199.239.136.200");
        st.put("www.microsoft.com",    "207.126.99.140");
        st.put("www.dell.com",         "143.166.224.230");
        st.put("www.slashdot.org",     "66.35.250.151");
        st.put("www.espn.com",         "199.181.135.201");
        st.put("www.weather.com",      "63.111.66.11");
        st.put("www.yahoo.com",        "216.109.118.65");
        console.log("cs.princeton.edu:  " + st.get("www.cs.princeton.edu"));
        console.log("hardvardsucks.com: " + st.get("www.harvardsucks.com"));
        console.log("simpsons.com:      " + st.get("www.simpsons.com"));
        console.log("apple.com:         " + st.get("www.apple.com"));
        console.log("ebay.com:          " + st.get("www.ebay.com"));
        console.log("dell.com:          " + st.get("www.dell.com"));
        console.log("");
        console.log("size:    " + st.size());
        console.log("height:  " + st.height());
        console.log(st.toString());
        console.log("");
      }
    }

    /**Represents a <em>d</em>-dimensional mathematical vector.
     *  Vectors are mutable: their values can be changed after they are created.
     *  It includes methods for addition, subtraction,
     *  dot product, scalar product, unit vector, and Euclidean norm.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {number} d  dimension
     * @property {ST} st the vector, represented by index-value pairs
     */
    class SparseVector{
     /**Initializes a d-dimensional zero vector.
       * @param d the dimension of the vector
       */
      constructor(d){
        this.d  = d;
        this.st = new ST();
      }
     /**Sets the ith coordinate of this vector to the specified value.
       * @param  i the index
       * @param  value the new value
       * @throws Error unless i is between 0 and d-1
       */
      put(i, value){
        if(i < 0 || i >= this.d) throw Error("Illegal index");
        if(_.feq0(value)) this.st.remove(i);
        else this.st.put(i, value);
      }
      /**Returns the ith coordinate of this vector.
       * @param  i the index
       * @return the value of the ith coordinate of this vector
       * @throws Error unless i is between 0 and d-1
       */
      get(i){
        if(i < 0 || i >= this.d) throw Error("Illegal index");
        return this.st.contains(i)? this.st.get(i): 0;
      }
      /**Returns the number of nonzero entries in this vector.
       * @return the number of nonzero entries in this vector
       */
      nnz(){
        return this.st.size();
      }
      /**Returns the dimension of this vector.
       *
       * @return the dimension of this vector
       */
      dimension(){
        return this.d;
      }
      /**Returns the inner product of this vector with the specified vector.
       *
       * @param  that the other vector
       * @return the dot product between this vector and that vector
       * @throws Error if the lengths of the two vectors are not equal
       */
      dot(that){
        if(this.d != that.d) throw Error("Vector lengths disagree");
        let sum = 0.0;
        // iterate over the vector with the fewest nonzeros
        if(this.st.size() <= that.st.size()){
          for(let i,it=this.st.keys().iterator();it.hasNext();){
            i=it.next();
            if(that.st.contains(i)) sum += this.get(i) * that.get(i);
          }
        }else {
          for(let i,it= that.st.keys().iterator();it.hasNext();){
            i=it.next();
            if(this.st.contains(i)) sum += this.get(i) * that.get(i);
          }
        }
        return sum;
      }
      /**Returns the inner product of this vector with the specified array.
       *
       * @param  vec the array
       * @return the dot product between this vector and that array
       * @throws Error if the dimensions of the vector and the array are not equal
       */
      dotWith(vec){
        let sum = 0;
        for(let i,it= this.st.keys().iterator();it.hasNext();){
          i=it.next();
          sum += vec[i] * this.get(i);
        }
        return sum;
      }
      /**Returns the magnitude of this vector.
       * This is also known as the L2 norm or the Euclidean norm.
       *
       * @return the magnitude of this vector
       */
      magnitude(){
        return Math.sqrt(this.dot(this));
      }
      /**Returns the scalar-vector product of this vector with the specified scalar.
       *
       * @param  alpha the scalar
       * @return the scalar-vector product of this vector with the specified scalar
       */
      scale(alpha){
        let c = new SparseVector(this.d);
        for(let i,it= this.st.keys().iterator();it.hasNext();){
          i=it.next();
          c.put(i, alpha * this.get(i));
        }
        return c;
      }
      /**Returns the sum of this vector and the specified vector.
       *
       * @param  that the vector to add to this vector
       * @return the sum of this vector and that vector
       * @throws Error if the dimensions of the two vectors are not equal
       */
      plus(that){
        if(this.d != that.d) throw Error("Vector lengths disagree");
        let c = new SparseVector(this.d);
        for(let i, it=this.st.keys().iterator();it.hasNext();){
          i=it.next();
          c.put(i, this.get(i)); // c = this
        }
        for(let i,it= that.st.keys().iterator();it.hasNext();){
          i=it.next();
          c.put(i, that.get(i) + c.get(i));     // c = c + that
        }
        return c;
      }
      /**Returns a string representation of this vector.
       * @return a string representation of this vector, which consists of the
       *         the vector entries, separates by commas, enclosed in parentheses
       */
      toString(){
        let s="";
        for(let i,it= this.st.keys().iterator();it.hasNext();){
          i=it.next();
          s+= `(${i}, ${this.st.get(i)}) `;
        }
        return s;
      }
      static test(){
        let a = new SparseVector(10),
            b = new SparseVector(10);
        a.put(3, 0.50);
        a.put(9, 0.75);
        a.put(6, 0.11);
        a.put(6, 0.00);
        b.put(3, 0.60);
        b.put(4, 0.90);
        console.log("a = " + a.toString());
        console.log("b = " + b.toString());
        console.log("a dot b = " + a.dot(b));
        console.log("a + b   = " + a.plus(b).toString());
      }
    }

    //SparseVector.test();
    //BTree.test();
    //ST.test();
    //TreeMap.test();
    //Queue.test();
    //LinkedQueue.test();
    //Stack.test();
    //Bag.test();

    const _$={
      BTree,Bag,Stack,LinkedQueue,Queue,ST,TreeMap,SparseVector
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"))
  }else{
    gscope["io/czlab/mcfud/algo/basic"]=_module
  }

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
   */
  function _module(Core,Basic){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!Basic) Basic= gscope["io/czlab/mcfud/algo/basic"]();
    const CMP=(a,b)=>{ return a<b?-1:(a>b?1:0) }
    const int=Math.floor;
    const {is,u:_}= Core;
    const {Bag,Stack,Node}= Basic;

    /**
     * @module mcfud/algo_sort
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function less(v, w, cmp){ return cmp(v,w) < 0 }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function exch(a, i, j){
      const swap = a[i];
      a[i] = a[j];
      a[j] = swap;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isSorted(a,C){ return isSorted3(a, 0, a.length,C) }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isSorted3(a, lo, hi,C){
      for(let i = lo + 1; i < hi; ++i)
        if(less(a[i], a[i-1], C)) return false;
      return true;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function show(a){
      for(let i = 0; i < a.length; ++i) console.log(a[i])
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Provides static methods for sorting an array using insertion sort.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Insertion{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       * @return {array}
       */
      static sort(a,compareFn){
        const n = a.length;
        for(let i=1; i<n; ++i){
          for(let j=i; j>0 && less(a[j], a[j-1],compareFn); --j){
            exch(a, j, j-1);
          }
        }
        return a;
      }
      /**Rearranges the subarray a[lo..hi) in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {number} lo left endpoint (inclusive)
       * @param {number} hi right endpoint (exclusive)
       * @param {function} compareFn
       * @return {array}
       */
      static sortRange(a, lo, hi,compareFn){
        for(let i = lo + 1; i < hi; ++i){
          for(let j = i; j > lo && less(a[j], a[j-1],compareFn); --j){
            exch(a, j, j-1);
          }
        }
        return a;
      }
      /**Returns a permutation that gives the elements in the array in ascending order.
       * @param a the array
       * @return a permutation {@code p[]} such that {@code a[p[0]]}, {@code a[p[1]]},
       *    ..., {@code a[p[n-1]]} are in ascending order
       */
      static indexSort(a,compareFn){
        // do not change the original array a[]
        let n = a.length;
        let index = new Array(n);
        for(let i=0; i<n; ++i) index[i] = i;
        for(let i=1; i<n; ++i)
          for(let j=i; j>0 && less(a[index[j]], a[index[j-1]],compareFn); --j)
            exch(index, j, j-1);
        return index;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(Insertion.sort(obj,CMP));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Insertion.sortRange(obj,0,obj.length,CMP));
      }
    }

    /**Provides a static method for sorting an array using an optimized
     * binary insertion sort with half exchanges.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class BinaryInsertion{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       * @return {array}
       */
      static sort(a,compareFn){
        let mid,lo,hi,n = a.length;
        for(let v,i = 1; i < n; ++i){
          // binary search to determine index j at which to insert a[i]
          lo = 0; hi = i; v = a[i];
          while(lo < hi){
            mid = lo + int((hi - lo) / 2);
            if(less(v, a[mid],compareFn)) hi = mid;
            else lo = mid + 1;
          }
          // insetion sort with "half exchanges"
          // (insert a[i] at index j and shift a[j], ..., a[i-1] to right)
          for(let j = i; j > lo; --j) a[j] = a[j-1];
          a[lo] = v;
        }
        return a;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(BinaryInsertion.sort(obj,CMP));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(BinaryInsertion.sort(obj,CMP));
      }
    }

    /**Provides static methods for sorting an array using <em>selection sort</em>.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Selection{
      /**Rearranges the array in ascending order, using a comparator.
       * @param {array} a the array
       * @param {function} comparator the comparator specifying the order
       */
      static sort(a, compareFn){
        let min,n = a.length;
        for(let i = 0; i < n; ++i){
          min = i;
          for(let j = i+1; j < n; ++j)
            if(less(a[j], a[min],compareFn)) min = j;
          exch(a, i, min);
        }
        return a;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(Selection.sort(obj,CMP));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Selection.sort(obj,CMP));
      }
    }

    /**Provides static methods for sorting an array using <em>Shellsort</em>.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Shell{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       * @return {array}
       */
      static sort(a, compareFn){
        let n = a.length,
            h=1,
            n3=int(n/3);
        // 3x+1 increment sequence:  1, 4, 13, 40, 121, 364, 1093, ...
        while(h < n3) h = 3*h + 1;
        while(h >= 1){
          // h-sort the array
          for(let i = h; i < n; ++i){
            for(let j = i; j >= h && less(a[j], a[j-h],compareFn); j -= h)
              exch(a, j, j-h);
          }
          h=int(h/3);
        }
        return a;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(Shell.sort(obj,CMP));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Shell.sort(obj,CMP));
      }
    }
    /***************************************************************************
     *  Index mergesort.
     ***************************************************************************/
    // stably merge a[lo .. mid] with a[mid+1 .. hi] using aux[lo .. hi]
    function mergeIndex(a, index, aux, lo, mid, hi,C){
      // copy to aux[]
      for(let k = lo; k <= hi; ++k){ aux[k] = index[k] }
      // merge back to a[]
      let i = lo, j = mid+1;
      for(let k = lo; k <= hi; ++k){
        if(i > mid) index[k] = aux[j++];
        else if(j > hi) index[k] = aux[i++];
        else if(less(a[aux[j]], a[aux[i]],C)) index[k] = aux[j++];
        else index[k] = aux[i++];
      }
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // stably merge a[lo .. mid] with a[mid+1 ..hi] using aux[lo .. hi]
    function merge(a, aux, lo, mid, hi,C){
      // precondition: a[lo .. mid] and a[mid+1 .. hi] are sorted subarrays
      //assert isSorted(a, lo, mid);
      //assert isSorted(a, mid+1, hi);
      // copy to aux[]
      for(let k = lo; k <= hi; ++k){ aux[k] = a[k] }
      // merge back to a[]
      let i = lo, j = mid+1;
      for(let k = lo; k <= hi; ++k){
        if(i > mid) a[k] = aux[j++];
        else if(j > hi) a[k] = aux[i++];
        else if(less(aux[j], aux[i],C)) a[k] = aux[j++];
        else a[k] = aux[i++];
      }
      // postcondition: a[lo .. hi] is sorted
      //assert isSorted(a, lo, hi);
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // mergesort a[lo..hi] using auxiliary array aux[lo..hi]
    function sort(a, aux, lo, hi,C){
      if(hi <= lo){}else{
        let mid = lo + int((hi - lo) / 2);
        sort(a, aux, lo, mid,C);
        sort(a, aux, mid + 1, hi,C);
        merge(a, aux, lo, mid, hi,C);
      }
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // mergesort a[lo..hi] using auxiliary array aux[lo..hi]
    function sortIndex(a, index, aux, lo, hi,C){
      if(hi <= lo){}else{
        let mid = lo + int((hi - lo) / 2);
        sortIndex(a, index, aux, lo, mid,C);
        sortIndex(a, index, aux, mid + 1, hi,C);
        mergeIndex(a, index, aux, lo, mid, hi,C);
      }
      return a;
    }

    /**Provides static methods for sorting an array
     * using a top-down, recursive version of <em>mergesort</em>.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Merge{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       * @return {array}
       */
      static sort(a,compareFn){
        let aux = new Array(a.length);
        sort(a, aux, 0, a.length-1,compareFn);
        return a;
      }
      /**Returns a permutation that gives the elements in the array in ascending order.
       * @param {array} a the array
       * @return a permutation {@code p[]} such that {@code a[p[0]]}, {@code a[p[1]]},
       *    ..., {@code a[p[N-1]]} are in ascending order
       */
      static indexSort(a,C){
        let n = a.length,
            index = new Array(n);
        for(let i = 0; i < n; ++i) index[i] = i;
        let aux = new Array(n);
        sortIndex(a, index, aux, 0, n-1,C);
        return index;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(Merge.sort(obj,CMP));
        //Merge.indexSort(obj,CMP).forEach(x=> console.log("x= "+x));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Merge.sort(obj,CMP));
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function XXshuffle(a){
      for(let t,j,i = a.length - 1; i > 0; --i){
        j = int(_.rand() * (i + 1));
        t= a[i];
        a[i] = a[j];
        a[j] = t;
      }
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //function less(v, w,C){ return (v == w)?false:C(v,w)<0 }
    // quicksort the subarray from a[lo] to a[hi]
    function sort(a, lo, hi,C){
      if(hi <= lo){}else{
        let j = partition(a, lo, hi,C);
        sort(a, lo, j-1,C);
        sort(a, j+1, hi,C);
      }
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // partition the subarray a[lo..hi] so that a[lo..j-1] <= a[j] <= a[j+1..hi]
    // and return the index j.
    function partition(a, lo, hi,C){
      let i = lo,
          v = a[lo],
          j = hi + 1;
      while(true){
        // find item on lo to swap
        while(less(a[++i], v,C)){
          if(i == hi) break;
        }
        // find item on hi to swap
        while(less(v, a[--j],C)){
          if(j == lo) break;// redundant since a[lo] acts as sentinel
        }
        // check if pointers cross
        if(i >= j) break;
        exch(a, i, j);
      }
      // put partitioning item v at a[j]
      exch(a, lo, j);
      // now, a[lo .. j-1] <= a[j] <= a[j+1 .. hi]
      return j;
    }

    /**Provides static methods for sorting an array using bubble sort.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Bubble{
      /**
       * Rearranges the array in ascending order, using the natural order.
       * @param a the array to be sorted
       */
      static sort(a,C){
        function less(v, w){ return C(v,w) < 0 }
        function exch(a, i, j){
          let swap = a[i];
          a[i] = a[j];
          a[j] = swap;
        }
        let n = a.length;
        for(let x, i = 0; i < n; i++){
          x = 0;
          for(let j = n-1; j > i; j--){
            if(less(a[j], a[j-1])){
              exch(a, j, j-1);
              x++;
            }
          }
          if(x == 0) break;
        }
        return a;
      }
      static test(){
        let obj="bed bug dad yes zoo all bad yet".split(" ");
        Bubble.sort(obj,CMP);
        for(let i=0;i<obj.length;++i)
          console.log(obj[i]);
      }
    }

    /**Provides static methods for sorting an array and
     * selecting the ith smallest element in an array using quicksort.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Quick{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       */
      static sort(a,compareFn){
        _.shuffle(a);
        sort(a, 0, a.length - 1,compareFn);
        return a;
      }
      /**Rearranges the array so that {@code a[k]} contains the kth smallest key;
       * {@code a[0]} through {@code a[k-1]} are less than (or equal to) {@code a[k]}; and
       * {@code a[k+1]} through {@code a[n-1]} are greater than (or equal to) {@code a[k]}.
       *
       * @param  {array} a the array
       * @param  {number} k the rank of the key
       * @param {function} compareFn
       * @return the key of rank {@code k}
       * @throws Error unless {@code 0 <= k < a.length}
       */
      static select(a, k,compareFn){
        if(k < 0 || k >= a.length)
          throw Error(`index is not between 0 and ${a.length}: ${k}`);
        _.shuffle(a);
        let lo = 0, hi = a.length - 1;
        while(hi > lo){
          let i = partition(a, lo, hi, compareFn);
          if(i > k) hi = i - 1;
          else if(i < k) lo = i + 1;
          else return a[i];
        }
        return a[lo];
      }
      static test(){
        let obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Quick.sort(obj,CMP));
        obj="SORTEXAMPLE".split("");
        show(Quick.sort(obj, CMP));
        _.shuffle(obj)
        obj.forEach((s,i)=> console.log(Quick.select(obj,i,CMP)));
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function less4(a,i, j,C){ return less(a[i], a[j],C) }
    function swim(k, M){
      while(k > 1 && less4(M.pq, int(k/2), k,M.comparator)){
        exch(M.pq, k, int(k/2));
        k = int(k/2);
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function sink(k,M){
      let j;
      while(2*k <= M.n){
        j = 2*k;
        if(j < M.n && less4(M.pq, j, j+1,M.comparator)) j++;
        if(!less4(M.pq, k, j,M.comparator)) break;
        exch(M.pq, k, j);
        k = j;
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // is pq[1..n] a max heap?
    function isMaxHeap(M){
      for(let i=1; i <= M.n; ++i)
        if(_.nichts(M.pq[i])) return false;

      for(let i = M.n+1; i < M.pq.length; ++i)
        if(!_.nichts(M.pq[i])) return false;

      if(!_.nichts(M.pq[0])) return false;
      return isMaxHeapOrdered(1,M);
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // is subtree of pq[1..n] rooted at k a max heap?
    function isMaxHeapOrdered(k,M){
      if(k > M.n) return true;
      let left = 2*k,
          right = 2*k + 1;
      if(left  <= M.n && less4(M.pq, k, left,M.comparator))  return false;
      if(right <= M.n && less4(M.pq, k, right,M.comparator)) return false;
      return isMaxHeapOrdered(left,M) && isMaxHeapOrdered(right,M);
    }
    // resize the underlying array to have the given capacity
    function _resize(c,M){
      //assert c > n;
      const temp = new Array(c);
      for(let i = 1; i <= M.n; ++i) temp[i] = M.pq[i];
      M.pq = temp;
    }

    /**Represents a priority queue of generic keys.
     * @memberof module:mcfud/algo_sort
     * @class
     * @property {function} comparator
     * @property {number} n // number of items on priority queue
     * @property {array} pq // store items at indices 1 to n
     */
    class MinPQ{
      /**Initializes an empty priority queue with the given initial capacity.
       * @param  initCapacity the initial capacity of this priority queue
       */
      constructor(compareFn, keys){
        this.comparator = compareFn;
        this.n=0;
        if(is.vec(keys)){
          this.pq = new Array(keys.length + 1);
          this.n = keys.length;
          for(let i = 0; i < this.n; ++i) this.pq[i+1] = keys[i];
          for(let k = int(this.n/2); k >= 1; --k) this.sink(k,this);
        }else{
          this.pq= new Array(is.num(keys)? keys: 2);
        }
      }
      /**Returns true if this priority queue is empty.
       * @return {@code true} if this priority queue is empty; {@code false} otherwise
       */
      isEmpty(){
        return this.n == 0;
      }
      /**Returns the number of keys on this priority queue.
       * @return the number of keys on this priority queue
       */
      size(){
        return this.n;
      }
      /**Returns a smallest key on this priority queue.
       * @return a smallest key on this priority queue
       * @throws Error if this priority queue is empty
       */
      min(){
        if(this.isEmpty()) throw Error("Priority queue underflow");
        return this.pq[1];
      }
      // resize the underlying array to have the given capacity
      _resize(c){
        _.assert(c> this.n,"bad resize capacity");
        let temp = new Array(c);
        for(let i = 1; i <= this.n; i++) temp[i] = this.pq[i];
        this.pq = temp;
      }
      /**Adds a new key to this priority queue.
       * @param  x the key to add to this priority queue
       */
      insert(x){
        // double size of array if necessary
        if(this.n == this.pq.length - 1) this._resize(2 * this.pq.length);
        // add x, and percolate it up to maintain heap invariant
        this.pq[++this.n] = x;
        this.swim(this.n);
        //assert isMinHeap();
      }
      /**Removes and returns a smallest key on this priority queue.
       * @return a smallest key on this priority queue
       * @throws Error if this priority queue is empty
       */
      delMin(){
        if(this.isEmpty()) throw Error("Priority queue underflow");
        let min = this.pq[1];
        exch(this.pq, 1, this.n--);
        this.sink(1);
        this.pq[this.n+1] = null;     // to avoid loitering and help with garbage collection
        if((this.n > 0) && (this.n == (this.pq.length - 1) / 4)) this._resize(this.pq.length / 2);
        //assert isMinHeap();
        return min;
      }
      swim(k){
        while(k > 1 && this.greater(int(k/2), k)){
          exch(this.pq, k, int(k/2));
          k = int(k/2);
        }
      }
      sink(k){
        while(2*k <= this.n){
          let j = 2*k;
          if(j < this.n && this.greater(j, j+1)) j++;
          if(!this.greater(k, j)) break;
          exch(this.pq, k, j);
          k = j;
        }
      }
      greater(i, j){
        return this.comparator(this.pq[i], this.pq[j]) > 0;
      }
      // is pq[1..n] a min heap?
      isMinHeap(){
        for(let i = 1; i <= this.n; i++) if(_.nichts(this.pq[i])) return false;
        for(let i = this.n+1; i < this.pq.length; i++) if(!_.nichts(this.pq[i])) return false;
        if(!_.nichts(this.pq[0])) return false;
        return this.isMinHeapOrdered(1);
      }
      // is subtree of pq[1..n] rooted at k a min heap?
      isMinHeapOrdered(k){
        if(k > this.n) return true;
        let left = 2*k;
        let right = 2*k + 1;
        if(left  <= this.n && this.greater(k, left))  return false;
        if(right <= this.n && this.greater(k, right)) return false;
        return this.isMinHeapOrdered(left) && this.isMinHeapOrdered(right);
      }
      /**Returns an iterator that iterates over the keys on this priority queue
       * in ascending order.
       * <p>
       * The iterator doesn't implement {@code remove()} since it's optional.
       *
       * @return an iterator that iterates over the keys in ascending order
       */
      iterator(){
        // add all items to copy of heap takes linear time since already in heap order so no keys move
        let copy = new MinPQ(this.comparator, this.size());
        for(let i = 1; i <= this.n; i++) copy.insert(this.pq[i]);
        return{
          remove(){ throw Error("UnsupportedOperationException") },
          hasNext(){ return !copy.isEmpty() },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            return copy.delMin();
          }
        }
      }
      static test(){
        let msg="",
            obj= new MinPQ(CMP);
        "PQE".split("").forEach(s=>obj.insert(s));
        msg += obj.delMin() + " ";
        "XAM".split("").forEach(s=>obj.insert(s));
        msg += obj.delMin() + " ";
        "PLE".split("").forEach(s=>obj.insert(s));
        msg += obj.delMin() + " ";
        console.log(msg)
        console.log("(" + obj.size() + " left on pq)");
      }
    }

      /**Represents a priority queue of generic keys.
       * @memberof module:mcfud/algo_sort
       * @class
       * @property {function} comparator
       * @property {number} n // number of items on priority queue
       * @property {array} pq // store items at indices 1 to n
       */
      class MaxPQ{
        /**Initializes an empty priority queue with the given initial capacity,
         * using the given comparator.
         * @param {function} compareFn
         * @param {any} keys
         */
        constructor(compareFn, keys){
          this.comparator = compareFn;
          this.n=0;
          if(is.vec(keys)){
            this.pq = new Array(keys.length + 1);
            this.n = keys.length;
            for(let i = 0; i < this.n; ++i) this.pq[i+1] = keys[i];
            for(let k = int(this.n/2); k >= 1; --k) sink(k,this);
          }else{
            this.pq= new Array(is.num(keys)? keys: 2);
          }
        }
        /**Returns true if this priority queue is empty.
         * @return {@code true} if this priority queue is empty;
         *         {@code false} otherwise
         */
        isEmpty(){
          return this.n == 0
        }
        /**Returns the number of keys on this priority queue.
         * @return the number of keys on this priority queue
         */
        size(){
          return this.n
        }
        /**Returns a largest key on this priority queue.
         * @return a largest key on this priority queue
         * @throws Error if this priority queue is empty
         */
        max(){
          if(this.isEmpty())
            throw Error("Priority queue underflow");
          return this.pq[1];
        }
        /**Adds a new key to this priority queue.
         * @param  x the new key to add to this priority queue
         */
        insert(x){
          // double size of array if necessary
          if(this.n == this.pq.length-1) _resize(2 * this.pq.length, this);
          // add x, and percolate it up to maintain heap invariant
          this.n+=1;
          this.pq[this.n] = x;
          swim(this.n, this);
          //assert isMaxHeap();
        }
        /**Removes and returns a largest key on this priority queue.
         * @return a largest key on this priority queue
         * @throws Error if this priority queue is empty
     */
    delMax(){
      if(this.isEmpty())
        throw Error("Priority queue underflow");
      let max = this.pq[1];
      exch(this.pq, 1, this.n, this.comparator);
      this.n-=1;
      sink(1,this);
      this.pq[this.n+1] = null;     // to avoid loitering and help with garbage collection
      if(this.n > 0 &&
         this.n == (this.pq.length - 1)/4) _resize(int(this.pq.length / 2), this);
      return max;
    }
    /**Returns an iterator that iterates over the keys on this priority queue
     * in descending order.
     * The iterator doesn't implement {@code remove()} since it's optional.
     * @return an iterator that iterates over the keys in descending order
     */
    iterator(){
      // add all items to copy of heap
      // takes linear time since already in heap order so no keys move
      const copy = new MaxPQ(this.comparator, this.size());
      for(let i = 1; i <= this.n; ++i) copy.insert(this.pq[i]);
      return{
        remove(){ throw Error("UnsupportedOperationException") },
        hasNext(){ return !copy.isEmpty() },
        next(){
          if(!this.hasNext()) throw Error("NoSuchElementException");
          return copy.delMax();
        }
      }
    }
    static test(){
      let msg="",
          obj= new MaxPQ(CMP);
      "PQE".split("").forEach(s=>obj.insert(s));
      msg += obj.delMax() + " ";
      "XAM".split("").forEach(s=>obj.insert(s));
      msg += obj.delMax() + " ";
      "PLE".split("").forEach(s=>obj.insert(s));
      msg += obj.delMax() + " ";
      console.log(msg)
      console.log("(" + obj.size() + " left on pq)");
    }
  }

  /***************************************************************************
   * Helper functions for comparisons and swaps.
   * Indices are "off-by-one" to support 1-based indexing.
   ***************************************************************************/
  function lessOneOff(pq, i, j, C){
    return C(pq[i-1], pq[j-1]) < 0
  }
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  function exchOneOff(pq, i, j){
    const swap = pq[i-1];
    pq[i-1] = pq[j-1];
    pq[j-1] = swap;
  }
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  function sink4(pq, k, n,C){
    while(2*k <= n){
      let j = 2*k;
      if(j < n && lessOneOff(pq, j, j+1,C)) j++;
      if(!lessOneOff(pq, k, j,C)) break;
      exchOneOff(pq, k, j);
      k = j;
    }
  }

  /**Provides a static method to sort an array using <em>heapsort</em>.
   * @memberof module:mcfud/algo_sort
   * @class
   */
  class Heap{
    /**Rearranges the array in ascending order, using the natural order.
     * @param {array} pq the array to be sorted
     * @param {function} compareFn
     */
    static sort(pq,compareFn){
      let n = pq.length;
      // heapify phase
      for(let k = int(n/2); k >= 1; --k)
        sink4(pq, k, n, compareFn);
      // sortdown phase
      let k = n;
      while(k > 1){
        exchOneOff(pq, 1, k--);
        sink4(pq, 1, k,compareFn);
      }
      //////
      return pq;
    }
    static test(){
      let obj="SORTEXAMPLE".split("");
      show(Heap.sort(obj,CMP));
      obj="bed bug dad yes zoo all bad yet".split(" ");
      show(Heap.sort(obj,CMP));
    }
  }

  /**Represents an indexed priority queue of generic keys.
   * @memberof module:mcfud/algo_sort
   * @class
   * @property {number} maxN  maximum number of elements on PQ
   * @property {number} n number of elements on PQ
   * @property {array} pq  binary heap using 1-based indexing
   * @property {array} qp  inverse of pq - qp[pq[i]] = pq[qp[i]] = i
   * @property {array} mKeys  keys[i] = priority of i
   */
  class IndexMinPQ{
    /**
     * Initializes an empty indexed priority queue with indices between {@code 0}
     * and {@code maxN - 1}.
     * @param  maxN the keys on this priority queue are index from {@code 0} {@code maxN - 1}
     * @throws Error if {@code maxN < 0}
     */
    constructor(maxN,compareFn){
      if(maxN < 0) throw Error(`IllegalArgumentException`);
      this.compare=compareFn;
      this.maxN = maxN;
      this.n = 0;
      this.mKeys = new Array(maxN+1);    // make this of length maxN??
      this.pq = new Array(maxN + 1);
      this.qp   = new Array(maxN + 1);                   // make this of length maxN??
      for(let i = 0; i <= maxN; i++) this.qp[i] = -1;
    }
    /**Returns true if this priority queue is empty.
     *
     * @return {@code true} if this priority queue is empty;
     *         {@code false} otherwise
     */
    isEmpty() {
      return this.n == 0;
    }
    /**Is {@code i} an index on this priority queue?
     *
     * @param  i an index
     * @return {@code true} if {@code i} is an index on this priority queue;
     *         {@code false} otherwise
     * @throws Error unless {@code 0 <= i < maxN}
     */
    contains(i){
      this.validateIndex(i);
      return this.qp[i] != -1;
    }
    /**Returns the number of keys on this priority queue.
     * @return the number of keys on this priority queue
     */
    size(){
      return this.n;
    }
    /**Associates key with index {@code i}.
     *
     * @param  i an index
     * @param  key the key to associate with index {@code i}
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if there already is an item associated
     *         with index {@code i}
     */
    insert(i, key){
      this.validateIndex(i);
      if(this.contains(i)) throw Error("index is already in the priority queue");
      this.n++;
      this.qp[i] = this.n;
      this.pq[this.n] = i;
      this.mKeys[i] = key;
      this.swim(this.n);
    }
    /**Returns an index associated with a minimum key.
     *
     * @return an index associated with a minimum key
     * @throws Error if this priority queue is empty
     */
    minIndex(){
      if(this.n == 0) throw Error("Priority queue underflow");
      return this.pq[1];
    }
    /**Returns a minimum key.
     *
     * @return a minimum key
     * @throws Error if this priority queue is empty
     */
    minKey(){
      if(this.n == 0) throw Error("Priority queue underflow");
      return this.mKeys[this.pq[1]];
    }
    /**
     * Removes a minimum key and returns its associated index.
     * @return an index associated with a minimum key
     * @throws Error if this priority queue is empty
     */
    delMin(){
      if(this.n == 0) throw Error("Priority queue underflow");
      let min = this.pq[1];
      this.exch(1, this.n--);
      this.sink(1);
      _.assert(min == this.pq[this.n+1], "No good");
      this.qp[min] = -1;        // delete
      this.mKeys[min] = null;    // to help with garbage collection
      this.pq[this.n+1] = -1;        // not needed
      return min;
    }
    /**
     * Returns the key associated with index {@code i}.
     *
     * @param  i the index of the key to return
     * @return the key associated with index {@code i}
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error no key is associated with index {@code i}
     */
    keyOf(i){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      return this.mKeys[i];
    }
    /**
     * Change the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to change
     * @param  key change the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error no key is associated with index {@code i}
     */
    changeKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      this.mKeys[i] = key;
      this.swim(this.qp[i]);
      this.sink(this.qp[i]);
    }
    /**
     * Decrease the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to decrease
     * @param  key decrease the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if {@code key >= keyOf(i)}
     * @throws Error no key is associated with index {@code i}
     */
    decreaseKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      let c=this.compare(this.mKeys[i],key);
      if(c== 0)
        throw Error("Calling decreaseKey() with a key equal to the key in the priority queue");
      if(c< 0)
        throw Error("Calling decreaseKey() with a key strictly greater than the key in the priority queue");
      this.mKeys[i] = key;
      this.swim(this.qp[i]);
    }
    /**
     * Increase the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to increase
     * @param  key increase the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if {@code key <= keyOf(i)}
     * @throws Error no key is associated with index {@code i}
     */
    increaseKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      let c= this.compare(this.mKeys[i],key);
      if(c==0)
        throw Error("Calling increaseKey() with a key equal to the key in the priority queue");
      if(c>0)
        throw Error("Calling increaseKey() with a key strictly less than the key in the priority queue");
      this.mKeys[i] = key;
      this.sink(this.qp[i]);
    }
    /**
     * Remove the key associated with index {@code i}.
     *
     * @param  i the index of the key to remove
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     * @throws NoSuchElementException no key is associated with index {@code i}
     */
    delete(i){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      let index = this.qp[i];
      this.exch(index, this.n--);
      this.swim(index);
      this.sink(index);
      this.mKeys[i] = null;
      this.qp[i] = -1;
    }
    validateIndex(i){
      if(i < 0) throw Error("index is negative: " + i);
      if(i >= this.maxN) throw Error("index >= capacity: " + i);
    }
    greater(i, j){
      return this.compare(this.mKeys[this.pq[i]],this.mKeys[this.pq[j]]) > 0;
    }
    exch(i, j){
      let swap = this.pq[i];
      this.pq[i] = this.pq[j];
      this.pq[j] = swap;
      this.qp[this.pq[i]] = i;
      this.qp[this.pq[j]] = j;
    }
    swim(k){
      while(k > 1 && this.greater(k/2, k)) {
        this.exch(k, k/2);
        k = k/2;
      }
    }
    sink(k){
      while(2*k <= this.n){
          let j = 2*k;
          if(j < this.n && this.greater(j, j+1)) j++;
          if(!this.greater(k, j)) break;
          this.exch(k, j);
          k = j;
      }
    }
    /**
     * Returns an iterator that iterates over the keys on the
     * priority queue in ascending order.
     * The iterator doesn't implement {@code remove()} since it's optional.
     *
     * @return an iterator that iterates over the keys in ascending order
     */
    iterator(){
      // create a new pq
      let copy= new IndexMinPQ(this.pq.length-1, this.compare);
      // add all elements to copy of heap
      // takes linear time since already in heap order so no keys move
      for(let i = 1; i <= this.n; i++)
        copy.insert(this.pq[i], this.mKeys[this.pq[i]]);
      return{
        remove(){ throw Error(`UnsupportedOperationException`) },
        hasNext(){ return !copy.isEmpty() },
        next(){
          if(!this.hasNext()) throw Error(`NoSuchElementException`);
          return copy.delMin();
        }
      }
    }
    static test(){
      // insert a bunch of strings
      let strings = [ "it", "was", "the", "best", "of", "times", "it", "was", "the", "worst" ];
      let pq = new IndexMinPQ(strings.length,CMP);
      for(let i = 0; i < strings.length; i++)
        pq.insert(i, strings[i]);
      // delete and print each key
      while(!pq.isEmpty()){
        let i = pq.delMin();
        console.log(i + " " + strings[i]);
      }
      console.log("");
      // reinsert the same strings
      for(let i = 0; i < strings.length; i++) {
          pq.insert(i, strings[i]);
      }
      // print each key using the iterator
      for(let i,it=pq.iterator();it.hasNext();){
        i=it.next();
        console.log(i + " " + strings[i]);
      }
      while(!pq.isEmpty()){ pq.delMin() }
    }
  }

  /**Represents an indexed priority queue of generic keys.
   * @memberof module:mcfud/algo_sort
   * @class
   * @property {number} maxN  maximum number of elements on PQ
   * @property {number} n number of elements on PQ
   * @property {array} pq  binary heap using 1-based indexing
   * @property {array} qp  inverse of pq - qp[pq[i]] = pq[qp[i]] = i
   * @property {array} mKeys  keys[i] = priority of i
   */
  class IndexMaxPQ{
    /**Initializes an empty indexed priority queue with indices between {@code 0}
     * and {@code maxN - 1}.
     * @param  maxN the keys on this priority queue are index from {@code 0} to {@code maxN - 1}
     * @throws Error if {@code maxN < 0}
     */
    constructor(maxN,compareFn){
      if(maxN < 0) throw Error("IllegalArgumentException");
      this.compare=compareFn;
      this.maxN = maxN;
      this.n = 0;
      this.mKeys = new Array(maxN + 1);    // make this of length maxN??
      this.pq   = new Array(maxN + 1);
      this.qp   = new Array(maxN + 1);  // make this of length maxN??
      for(let i = 0; i <= maxN; i++) this.qp[i] = -1;
    }
    /**Returns true if this priority queue is empty.
     * @return {@code true} if this priority queue is empty; {@code false} otherwise
     */
    isEmpty(){
      return this.n == 0;
    }
    /**Is {@code i} an index on this priority queue?
     *
     * @param  i an index
     * @return {@code true} if {@code i} is an index on this priority queue; {@code false} otherwise
     * @throws Error unless {@code 0 <= i < maxN}
     */
    contains(i){
      this.validateIndex(i);
      return this.qp[i] != -1;
    }
    /**Returns the number of keys on this priority queue.
     * @return the number of keys on this priority queue
     */
    size(){
      return this.n;
    }
   /**Associate key with index i.
     *
     * @param  i an index
     * @param  key the key to associate with index {@code i}
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if there already is an item associated with index {@code i}
     */
    insert(i, key){
      this.validateIndex(i);
      if(this.contains(i)) throw Error("index is already in the priority queue");
      this.n++;
      this.qp[i] = this.n;
      this.pq[this.n] = i;
      this.mKeys[i] = key;
      this.swim(this.n);
    }
    /**Returns an index associated with a maximum key.
     *
     * @return an index associated with a maximum key
     * @throws Error if this priority queue is empty
     */
    maxIndex(){
      if(this.n == 0) throw Error("Priority queue underflow");
      return this.pq[1];
    }
    /**Returns a maximum key.
     *
     * @return a maximum key
     * @throws Error if this priority queue is empty
     */
    maxKey(){
      if(this.n == 0) throw Error("Priority queue underflow");
      return this.mKeys[this.pq[1]];
    }
    /**Removes a maximum key and returns its associated index.
     *
     * @return an index associated with a maximum key
     * @throws Error if this priority queue is empty
     */
    delMax(){
      if(this.n == 0) throw Error("Priority queue underflow");
      let max = this.pq[1];
      this.exch(1, this.n--);
      this.sink(1);
      _.assert(this.pq[this.n+1] == max,"bad delMax");
      this.qp[max] = -1;        // delete
      this.mKeys[max] = null;    // to help with garbage collection
      this.pq[this.n+1] = -1;        // not needed
      return max;
    }
    /**Returns the key associated with index {@code i}.
     *
     * @param  i the index of the key to return
     * @return the key associated with index {@code i}
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error no key is associated with index {@code i}
     */
    keyOf(i){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      return this.mKeys[i];
    }
    /**Change the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to change
     * @param  key change the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     */
    changeKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      this.mKeys[i] = key;
      this.swim(this.qp[i]);
      this.sink(this.qp[i]);
    }
    /**Increase the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to increase
     * @param  key increase the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if {@code key <= keyOf(i)}
     * @throws Error no key is associated with index {@code i}
     */
    increaseKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      if(this.compare(this.mKeys[i],key) == 0)
        throw Error("Calling increaseKey() with a key equal to the key in the priority queue");
      if(this.compare(this.mKeys[i],key) > 0)
        throw Error("Calling increaseKey() with a key that is strictly less than the key in the priority queue");
      this.mKeys[i] = key;
      this.swim(this.qp[i]);
    }
    /**Decrease the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to decrease
     * @param  key decrease the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if {@code key >= keyOf(i)}
     * @throws Error no key is associated with index {@code i}
     */
    decreaseKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      if(this.compare(this.mKeys[i],key) == 0)
        throw Error("Calling decreaseKey() with a key equal to the key in the priority queue");
      if(this.compare(this.mKeys[i],key) < 0)
        throw Error("Calling decreaseKey() with a key that is strictly greater than the key in the priority queue");
      this.mKeys[i] = key;
      this.sink(this.qp[i]);
    }
    /**Remove the key on the priority queue associated with index {@code i}.
     *
     * @param  i the index of the key to remove
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error no key is associated with index {@code i}
     */
    delete(i){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      let index = this.qp[i];
      this.exch(index, this.n--);
      this.swim(index);
      this.sink(index);
      this.mKeys[i] = null;
      this.qp[i] = -1;
    }
    validateIndex(i){
      if(i < 0) throw Error("index is negative: " + i);
      if(i >= this.maxN) throw Error("index >= capacity: " + i);
    }
    less(i,j){
      return this.compare(this.mKeys[this.pq[i]], this.mKeys[this.pq[j]]) < 0;
    }
    exch(i, j){
      let swap = this.pq[i];
      this.pq[i] = this.pq[j];
      this.pq[j] = swap;
      this.qp[this.pq[i]] = i;
      this.qp[this.pq[j]] = j;
    }
    swim(k){
      while(k > 1 && this.less(int(k/2), k)) {
        this.exch(k, int(k/2));
        k = int(k/2);
      }
    }
    sink(k){
      while (2*k <= this.n){
        let j = 2*k;
        if(j < this.n && this.less(j, j+1)) j++;
        if(!this.less(k, j)) break;
        this.exch(k, j);
        k = j;
      }
    }
    /**Returns an iterator that iterates over the keys on the
     * priority queue in descending order.
     * The iterator doesn't implement {@code remove()} since it's optional.
     *
     * @return an iterator that iterates over the keys in descending order
     */
    iterator(){
      // add all elements to copy of heap takes linear time since already in heap order so no keys move
      let copy = new IndexMaxPQ(this.pq.length - 1,this.compare);
      for(let i = 1; i <= this.n; i++) copy.insert(this.pq[i], this.mKeys[this.pq[i]]);
      return{
        remove() { throw Error("UnsupportedOperationException")  },
        hasNext() { return !copy.isEmpty() },
        next(){
          if(!this.hasNext()) throw Error("NoSuchElementException");
          return copy.delMax();
        }
      }
    }
    static test(){
      // insert a bunch of strings
      let strings = [ "it", "was", "the", "best", "of", "times", "it", "was", "the", "worst" ];
      let pq = new IndexMaxPQ(strings.length, CMP);
      for(let i = 0; i < strings.length; i++){
        pq.insert(i, strings[i]);
      }
      for(let i,it=pq.iterator(); it.hasNext();){
        i=it.next();
        console.log(i + " " + strings[i]);
      }
      console.log("");
      // increase or decrease the key
      for(let i = 0; i < strings.length; i++){
        if(_.rand()<0.5)
          pq.increaseKey(i, strings[i] + strings[i]);
        else
          pq.decreaseKey(i, strings[i].substring(0, 1));
      }
      // delete and print each key
      while(!pq.isEmpty()){
        let key = pq.maxKey();
        let i = pq.delMax();
        console.log(i + " " + key);
      }
      console.log("");
      // reinsert the same strings
      for(let i = 0; i < strings.length; i++) {
        pq.insert(i, strings[i]);
      }
      // delete them in random order
      let perm = new Array(strings.length);
      for(let i = 0; i < strings.length; i++) perm[i] = i;
      _.shuffle(perm);
      for(let i = 0; i < perm.length; i++){
        let key = pq.keyOf(perm[i]);
        pq.delete(perm[i]);
        console.log(perm[i] + " " + key);
      }
    }
  }

  //Bubble.test();
  //IndexMaxPQ.test();
  //MinPQ.test();
  //IndexMinPQ.test();
  //Heap.test();
  //MaxPQ.test();
  //Quick.test();
  //Merge.test();
  //Shell.test();
  //Selection.test();
  //BinaryInsertion.test();
  //Insertion.test();

  const _$={
    Insertion,BinaryInsertion,Selection,Shell,Merge,Bubble,Quick,MinPQ, MaxPQ,Heap,IndexMinPQ,IndexMaxPQ
  };

  return _$;
}

//export--------------------------------------------------------------------
if(typeof module === "object" && module.exports){
  module.exports=_module(require("../main/core"),require("./basic"))
}else{
  gscope["io/czlab/mcfud/algo/sort"]=_module
}

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
   */
  function _module(Core,Basic){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!Basic) Basic= gscope["io/czlab/mcfud/algo/basic"]();
    const CMP=(a,b)=>{ return a<b?-1:(a>b?1:0) };
    const int=Math.floor;
    const {is,u:_}= Core;
    const {Bag,Stack,Queue}= Basic;

    /**
     * @module mcfud/algo_search
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Provides a client for reading in a sequence of words and printing a word
     * (exceeding a given length) that occurs most frequently.
     * @memberof module:mcfud/algo_search
     * @class
     */
    class FrequencyCounter{
      /**
       * @param {array} input the list of words
       * @param {number} keySize the minimum word length
       * @return {array} [word, max]
       */
      static count(input,keySize){
        let m=new Map(),
            words=0,
            max="", distinct=0;
        // compute frequency counts
        for(let s,i=0;i<input.length;++i){
          s=input[i];
          if(s.length<keySize)continue;
          ++words;
          if(m.has(s)){
            m.set(s, m.get(s)+1)
          }else{
            m.set(s, 1);
            ++distinct;
          }
        }
        // find a key with the highest frequency count
        m.set(max, 0);
        Array.from(m.keys()).forEach(k=>{
          if(m.get(k) > m.get(max)) max = k;
        });
        return [max, m.get(max)];
      }
      static test(){
        let s= `it was the best of times it was the worst of times
        it was the age of wisdom it was the age of foolishness
        it was the epoch of belief it was the epoch of incredulity
        it was the season of light it was the season of darkness
        it was the spring of hope it was the winter of despair`.split(" ");
        let [m,v]= FrequencyCounter.count(s,1);
        console.log("" + m + " " + v);
        //console.log("distinct = " + distinct);
        //console.log("words= " + words);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SNode(key,val,next){ return {key,val,next} }
    /**
     * @memberof module:mcfud/algo_search
     * @class
     * @property {object} first // the linked list of key-value pairs
     * @property {number} n // number of key-value pairs
     */
    class SequentialSearchST{
      constructor(){
        this.n=0;
        this.first=null;
      }
      /**Returns the number of key-value pairs in this symbol table.
       * @return the number of key-value pairs in this symbol table
       */
      size(){
        return this.n;
      }
      /**Returns true if this symbol table is empty.
       * @return {@code true} if this symbol table is empty;
       *         {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**Returns true if this symbol table contains the specified key.
       * @param  key the key
       * @return {@code true} if this symbol table contains {@code key};
       *         {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        if(key === null)
          throw Error(`argument to contains is null`);
        return this.get(key) != undefined;
      }
      /**Returns the value associated with the given key in this symbol table.
       * @param  key the key
       * @return the value associated with the given key if the key is in the symbol table
       *     and {@code null} if the key is not in the symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(key == null)
          throw Error(`argument to get is null`);
        for(let x = this.first; x != null; x = x.next){
          if(key==x.key)
            return x.val;
        }
      }
      /**Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(key == null)
          throw Error(`first argument to put is null`);
        if(val == null){
          this.delete(key);
          return;
        }
        for(let x = this.first; x != null; x = x.next){
          if(key==x.key){
            x.val = val;
            return;
          }
        }
        //add to head
        this.first = SNode(key, val, this.first);
        this.n +=1;
      }
      /**Removes the specified key and its associated value from this symbol table
       * (if the key is in this symbol table).
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        let self=this;
        // delete key in linked list beginning at Node x
        // warning: function call stack too large if table is large
        function _delete(x, key){
          if(x == null) return null;
          if(key==x.key){
            self.n -= 1;
            return x.next;
          }
          x.next = _delete(x.next, key);
          return x;
        }
        if(key == null)
          throw Error(`argument to delete is null`);
        this.first = _delete(this.first, key);
      }
      /**Returns all keys in the symbol table as an {@code Iterable}.
       * To iterate over all of the keys in the symbol table named {@code st},
       * use the foreach notation: {@code for (Key key : st.keys())}.
       *
       * @return all keys in the symbol table
       */
      keys(){
        let out=[];
        for(let x = this.first; x != null; x = x.next) out.push(x.key);
        return out;
      }
      /////
      static eval(input){
        let obj=new SequentialSearchST();
        input.forEach((s,i)=> obj.put(s,i));
        return obj
      }
      static test(){
        let obj=SequentialSearchST.eval("SEARCHEXAMPLE".split(""));
        obj.keys().forEach(k=>{
          console.log(`key=${k}, val=${obj.get(k)}`)
        })
      }
    }

    /**
     * @memberof module:mcfud/algo_search
     * @class
     * @property {array} mKeys
     * @property {array} vals
     * @property {number} n
     * @property {function} compare
     */
    class BinarySearchST{
      /**
       * Initializes an empty symbol table with the specified initial capacity.
       * @param capacity the maximum capacity
       */
      constructor(compareFn){
        this.mKeys= new Array(2);
        this.vals= new Array(2);
        this.compare=compareFn;
        this.n=0;
        // resize the underlying arrays
        this.resize=(c)=>{
          let tempk = new Array(c),
              tempv = new Array(c);
          for(let i=0; i<this.n; ++i){
            tempk[i] = this.mKeys[i];
            tempv[i] = this.vals[i];
          }
          this.vals = tempv;
          this.mKeys = tempk;
        };
        this.assertOk=(p)=>{
          if(p===null||p===undefined)
            throw Error("Invalid argument");
          return true;
        }
        this.nnil=(p)=>{ return p===null || p===undefined };
        /***************************************************************************
         *  Check internal invariants.
         ***************************************************************************/
        this.assertCheck=()=>{
          let isSorted=()=>{
            // are the items in the array in ascending order?
            for(let i=1; i<this.size(); ++i)
              if(this.compare(this.mKeys[i],this.mKeys[i-1]) < 0) return false;
            return true;
          };
          let rankCheck=()=>{
            // check that rank(select(i)) = i
            for(let i=0; i<this.size(); ++i)
              if(i != this.rank(this.select(i))) return false;
            for(let i=0; i<this.size(); ++i)
              if(this.compare(this.mKeys[i],this.select(this.rank(this.mKeys[i]))) != 0) return false;
            return true;
          };
          return isSorted() && rankCheck();
        };
      }
      /**
       * Returns true if this symbol table is empty.
       *
       * @return {@code true} if this symbol table is empty;
       *         {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**
       * Does this symbol table contain the given key?
       *
       * @param  key the key
       * @return {@code true} if this symbol table contains {@code key} and
       *         {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        return this.assertOk(key) && this.get(key) !== undefined
      }
      /**
       * Returns the value associated with the given key in this symbol table.
       *
       * @param  key the key
       * @return the value associated with the given key if the key is in the symbol table
       *         and {@code null} if the key is not in the symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(this.assertOk(key) && !this.isEmpty()){
          let i = this.rank(key);
          if(i < this.n &&
             this.compare(this.mKeys[i],key) == 0) return this.vals[i];
        }
      }
      /**
       * Returns the number of keys in this symbol table strictly less than {@code key}.
       *
       * @param  key the key
       * @return the number of keys in the symbol table strictly less than {@code key}
       * @throws Error if {@code key} is {@code null}
       */
      rank(key){
        this.assertOk(key);
        let mid,cmp,
            lo = 0, hi = this.n-1;
        while(lo <= hi){
          mid = lo + Math.floor((hi - lo) / 2);
          cmp = this.compare(key,this.mKeys[mid]);
          if(cmp < 0) hi = mid - 1;
          else if(cmp > 0) lo = mid + 1;
          else return mid;
        }
        return lo;
      }
      /**
       * Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(this.assertOk(key) && this.nnil(val)){
          this.delete(key);
        }else{
          let i = this.rank(key);
          // key is already in table
          if(i < this.n && this.compare(this.mKeys[i],key) == 0){
            this.vals[i] = val;
          }else{
            // insert new key-value pair
            if(this.n == this.mKeys.length)
              this.resize(2*this.mKeys.length);
            for(let j = this.n; j > i; --j){
              this.mKeys[j] = this.mKeys[j-1];
              this.vals[j] = this.vals[j-1];
            }
            this.n+=1;
            this.mKeys[i] = key;
            this.vals[i] = val;
            this.assertCheck();
          }
        }
      }
      /**
       * Removes the specified key and associated value from this symbol table
       * (if the key is in the symbol table).
       *
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        if(this.assertOk(key) && this.isEmpty()){
          return
        }else{
          // compute rank
          let i = this.rank(key);
          // key not in table
          if(i == this.n || this.compare(this.mKeys[i],key) != 0){
            return;
          }else{
            for(let j = i; j < this.n-1; j++){
              this.mKeys[j] = this.mKeys[j+1];
              this.vals[j] = this.vals[j+1];
            }
            this.n-=1;
            this.mKeys[n] = null;  // to avoid loitering
            this.vals[n] = null;
            // resize if 1/4 full
            if(this.n > 0 &&
               this.n == Math.floor(this.mKeys.length/4))
              this.resize(this.mKeys.length/2);
            this.assertCheck();
          }
        }
      }
      /**
       * Removes the smallest key and associated value from this symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMin(){
        if(this.isEmpty())
          throw Error(`Symbol table underflow error`);
        this.delete(this.min());
      }
      /**
       * Removes the largest key and associated value from this symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMax(){
        if(this.isEmpty())
          throw Error(`Symbol table underflow error`);
        this.delete(this.max());
      }
      /***************************************************************************
       *  Ordered symbol table methods.
       ***************************************************************************/
      /**
       * Returns the smallest key in this symbol table.
       *
       * @return the smallest key in this symbol table
       * @throws Error if this symbol table is empty
       */
      min(){
        if(this.isEmpty())
          throw Error(`called min with empty symbol table`);
        return this.mKeys[0];
      }
      /**
       * Returns the largest key in this symbol table.
       *
       * @return the largest key in this symbol table
       * @throws Error if this symbol table is empty
       */
      max(){
        if(this.isEmpty())
          throw Error(`called max with empty symbol table`);
        return this.mKeys[this.n-1];
      }
      /**
       * Return the kth smallest key in this symbol table.
       *
       * @param  k the order statistic
       * @return the {@code k}th smallest key in this symbol table
       * @throws Error unless {@code k} is between 0 and
       *        <em>n</em>–1
       */
      select(k){
        if(k < 0 || k >= this.size())
          throw Error(`called select with invalid argument: ${k}`);
        return this.mKeys[k];
      }
      /**
       * Returns the largest key in this symbol table less than or equal to {@code key}.
       *
       * @param  key the key
       * @return the largest key in this symbol table less than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        let i = this.assertOk(key) && this.rank(key);
        if(i < this.n &&
           this.compare(key,this.mKeys[i]) == 0)
          return this.mKeys[i];
        if(i == 0)
          throw Error(`argument to floor is too small`);
        return this.mKeys[i-1];
      }
      /**
       * Returns the smallest key in this symbol table greater than or equal to {@code key}.
       *
       * @param  key the key
       * @return the smallest key in this symbol table greater than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        let i = this.assertOk(key) && this.rank(key);
        if(i == n)
          throw Error(`argument to ceiling is too large`);
        return this.mKeys[i];
      }
      /**
       * Returns the number of keys in this symbol table in the specified range.
       *
       * @param lo minimum endpoint
       * @param hi maximum endpoint
       * @return the number of keys in this symbol table between {@code lo}
       *         (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *         is {@code null}
       */
      size(lo, hi){
        if(arguments.length==0){
          return this.n;
        }
        this.assertOk(lo) && this.assertOk(hi);
        return this.compare(lo,hi)>0 ?0
                                     :(this.contains(hi)?(this.rank(hi)-this.rank(lo)+1)
                                                        :(this.rank(hi)-this.rank(lo)));
      }
      /**
       * Returns all keys in this symbol table in the given range,
       * as an {@code Iterable}.
       *
       * @param lo minimum endpoint
       * @param hi maximum endpoint
       * @return all keys in this symbol table between {@code lo}
       *         (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *         is {@code null}
       */
      keys(lo, hi){
        if(arguments.length==0){
          lo=this.min();
          hi=this.max();
        }
        this.assertOk(lo) && this.assertOk(hi);
        let out=[];
        if(this.compare(lo,hi) > 0){}else{
          for(let i=this.rank(lo); i<this.rank(hi); i++)
            out.push(this.mKeys[i]);
          if(this.contains(hi))
            out.push(this.mKeys[this.rank(hi)]);
        }
        return out;
      }
      static eval(input,compareFn){
        let obj= new BinarySearchST(compareFn);
        input.forEach((s,i)=> obj.put(s,i));
        return obj;
      }
      static test(){
        let b= BinarySearchST.eval("SEARCHEXAMPLE".split(""),(a,b)=>{
          return a<b?-1:(a>b?1:0)
        });
        b.keys().forEach(k=>{
          console.log(`${k} = ${b.get(k)}`)
        });
      }
    }

    /**Represents an ordered symbol table of generic key-value pairs.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {object} root
     * @property {function} compare
     */
    class BST{
      constructor(compareFn){
        this.nil=(x)=>{ return x===null || x===undefined };
        this.compare=compareFn;
        this.root=null;
        this.assertOk=(x)=>{
          if(x===null || x===undefined)
            throw Error("Invalid argument");
          return true;
        };
        this.assertCheck=()=>{
          if(!this.isBST(this.root,null,null)) console.log("Not in symmetric order");
          if(!this.isSizeConsistent(this.root)) console.log("Subtree counts not consistent");
          if(!this.isRankConsistent()) console.log("Ranks not consistent");
          return this.isBST(this.root,null,null) && this.isSizeConsistent(this.root) && this.isRankConsistent();
        };
        // is the tree rooted at x a BST with all keys strictly between min and max
        // (if min or max is null, treat as empty constraint)
        // Credit: Bob Dondero's elegant solution
        this.isBST=(x, min, max)=>{
          if(this.nil(x)) return true;
          if(!this.nil(min) && this.compare(x.key,min) <= 0) return false;
          if(!this.nil(max) && this.compare(x.key,max) >= 0) return false;
          return this.isBST(x.left, min, x.key) && this.isBST(x.right, x.key, max);
        };
        this.isSizeConsistent=(x)=>{
          if(this.nil(x)) return true;
          if(x.size != (this._sizeNode(x.left) + this._sizeNode(x.right) + 1)) return false;
          return this.isSizeConsistent(x.left) && this.isSizeConsistent(x.right);
        };
        // check that ranks are consistent
        this.isRankConsistent=()=>{
          for(let i=0; i<this.size(); ++i)
            if(i != this.rank(this.select(i))) return false;
          for(let i=0,ks=this.keys();i<ks.length;++i)
            if(this.compare(ks[i],this.select(this.rank(ks[i]))) != 0) return false;
          return true;
        };
      }
      Node(key, val, size){
        return{ key,val,size, left:null, right:null }
      }
      /**
       * Returns true if this symbol table is empty.
       * @return {@code true} if this symbol table is empty; {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**
       * Does this symbol table contain the given key?
       *
       * @param  key the key
       * @return {@code true} if this symbol table contains {@code key} and
       *         {@code false} otherwise
       * @throws IllegalArgumentException if {@code key} is {@code null}
       */
      contains(key){
        return this.assertOk(key) && this.get(key) != undefined;
      }
      /**
       * Returns the value associated with the given key.
       *
       * @param  key the key
       * @return the value associated with the given key if the key is in the symbol table
       *         and {@code null} if the key is not in the symbol table
       * @throws IllegalArgumentException if {@code key} is {@code null}
       */
      get(key){
        return this._getNode(this.root, key);
      }
      _getNode(x, key){
        if(this.assertOk(key) && this.nil(x)){
          return undefined;
        }
        let cmp = this.compare(key,x.key);
        return cmp < 0? this._getNode(x.left, key) :(cmp > 0? this._getNode(x.right, key) : x.val);
      }
      /**
       * Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(this.assertOk(key) && this.nil(val)){
          this.delete(key);
        }else{
          this.root = this._putNode(this.root, key, val);
          this.assertCheck();
        }
      }
      _putNode(x, key, val){
        if(this.nil(x)){
          return this.Node(key, val, 1);
        }
        let cmp = this.compare(key,x.key);
        if(cmp < 0) x.left = this._putNode(x.left,  key, val);
        else if(cmp > 0) x.right = this._putNode(x.right, key, val);
        else x.val = val;
        x.size = 1 + this._sizeNode(x.left) + this._sizeNode(x.right);
        return x;
      }
      /**
       * Removes the smallest key and associated value from the symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMin(){
        if(this.isEmpty()) throw Error("Symbol table underflow");
        this.root = this._deleteMinNode(this.root);
        this.assertCheck();
      }
      _deleteMinNode(x){
        if(this.nil(x.left)) return x.right;
        x.left = this._deleteMinNode(x.left);
        x.size = this._sizeNode(x.left) + this._sizeNode(x.right) + 1;
        return x;
      }
      /**
       * Removes the largest key and associated value from the symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMax(){
        if(this.isEmpty()) throw Error("Symbol table underflow");
        this.root = this._deleteMaxNode(this.root);
        this.assertCheck();
      }
      _deleteMaxNode(x){
        if(this.nil(x.right)) return x.left;
        x.right = this._deleteMaxNode(x.right);
        x.size = this._sizeNode(x.left) + this._sizeNode(x.right) + 1;
        return x;
      }
      /**
       * Removes the specified key and its associated value from this symbol table
       * (if the key is in this symbol table).
       *
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        this.assertOk(key);
        this.root = this._deleteNode(root, key);
        this.assertCheck();
      }
      _deleteNode(x, key){
        if(this.nil(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp < 0) x.left = this._deleteNode(x.left,  key);
        else if(cmp > 0) x.right = this._deleteNode(x.right, key);
        else{
          if(this.nil(x.right)) return x.left;
          if(this.nil(x.left)) return x.right;
          let t = x;
          x = this._minNode(t.right);
          x.right = this._deleteMinNode(t.right);
          x.left = t.left;
        }
        x.size = this._sizeNode(x.left) + this._sizeNode(x.right) + 1;
        return x;
      }
      /**
       * Returns the smallest key in the symbol table.
       *
       * @return the smallest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      min(){
        if(this.isEmpty())
          throw Error(`calls min with empty symbol table`);
        return this._minNode(this.root).key;
      }
      _minNode(x){
        return this.nil(x.left)? x: this._minNode(x.left);
      }
      /**
       * Returns the largest key in the symbol table.
       *
       * @return the largest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      max(){
        if(this.isEmpty())
          throw Error(`calls max with empty symbol table`);
        return this._maxNode(this.root).key;
      }
      _maxNode(x){
        return this.nil(x.right)? x: this._maxNode(x.right);
      }
      /**
       * Returns the largest key in the symbol table less than or equal to {@code key}.
       *
       * @param  key the key
       * @return the largest key in the symbol table less than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        if(this.assertOk(key) && this.isEmpty())
          throw Error(`calls floor with empty symbol table`);
        let x = this._floorNode(this.root, key);
        if(this.nil(x))
          throw Error(`argument to floor is too small`);
        return x.key;
      }
      _floorNode(x, key){
        if(this.nil(x)){
          return null;
        }
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp < 0) return this._floorNode(x.left, key);
        let t = this._floorNode(x.right, key);
        return this.nil(t)?x: t;
      }
      floor2(key){
        let x = this._floor2(root, key, null);
        if(this.nil(x))
          throw Error(`argument to floor is too small`);
        return x;
      }
      _floor2(x, key, best){
        if(this.nil(x)){
          return best;
        }
        let cmp = this.compare(key,x.key);
        return cmp < 0? this._floor2(x.left, key, best): (cmp > 0? this._floor2(x.right, key, x.key): x.key);
      }
      /**
       * Returns the smallest key in the symbol table greater than or equal to {@code key}.
       *
       * @param  key the key
       * @return the smallest key in the symbol table greater than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        if(this.assertOk(key) && this.isEmpty())
          throw Error(`calls ceiling with empty symbol table`);
        let x = this._ceilingNode(root, key);
        if(this.nil(x))
          throw Error(`argument to floor is too large`);
        return x.key;
      }
      _ceilingNode(x, key){
        if(this.nil(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp < 0){
          let t = this._ceilingNode(x.left, key);
          return t? t: x;
        }
        return this._ceilingNode(x.right, key);
      }
      /**
       * Return the key in the symbol table of a given {@code rank}.
       * This key has the property that there are {@code rank} keys in
       * the symbol table that are smaller. In other words, this key is the
       * ({@code rank}+1)st smallest key in the symbol table.
       *
       * @param  rank the order statistic
       * @return the key in the symbol table of given {@code rank}
       * @throws IllegalArgumentException unless {@code rank} is between 0 and
       *        <em>n</em>–1
       */
      select(rank){
        if(rank < 0 || rank >= this.size())
          throw Error(`argument to select is invalid: ${rank}`);
        return this._selectNode(this.root, rank);
      }
      // Return key in BST rooted at x of given rank.
      // Precondition: rank is in legal range.
      _selectNode(x, rank){
        if(this.nil(x)) return null;
        let leftSize = this._sizeNode(x.left);
        if(leftSize > rank) return this._selectNode(x.left,  rank);
        if(leftSize < rank) return this._selectNode(x.right, rank - leftSize - 1);
        return x.key;
      }
      /**
       * Return the number of keys in the symbol table strictly less than {@code key}.
       *
       * @param  key the key
       * @return the number of keys in the symbol table strictly less than {@code key}
       * @throws Error if {@code key} is {@code null}
       */
      rank(key){
        return this.assertOk(key) && this._rankNode(key, this.root);
      }
      // Number of keys in the subtree less than key.
      _rankNode(key, x){
        if(this.nil(x)) return 0;
        let cmp = this.compare(key,x.key);
        return cmp < 0? this._rankNode(key, x.left)
                      : (cmp > 0? (1 + this._sizeNode(x.left) + this._rankNode(key, x.right)) :this._sizeNode(x.left));
      }
      /**
       * Returns all keys in the symbol table in the given range,
       * as an {@code Iterable}.
       *
       * @param  lo minimum endpoint
       * @param  hi maximum endpoint
       * @return all keys in the symbol table between {@code lo}
       *         (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *         is {@code null}
       */
      keys(lo, hi){
        if(arguments.length==0){
          if(this.isEmpty()) return [];
          lo=this.min();
          hi=this.max();
        }
        this.assertOk(lo) && this.assertOk(hi);
        return this._keysNode(this.root, [], lo, hi);
      }
      _keysNode(x, queue, lo, hi){
        if(this.nil(x)){}else{
          let cmplo = this.compare(lo,x.key);
          let cmphi = this.compare(hi,x.key);
          if(cmplo < 0) this._keysNode(x.left, queue, lo, hi);
          if(cmplo <= 0 && cmphi >= 0) queue.push(x.key);
          if(cmphi > 0) this._keysNode(x.right, queue, lo, hi);
        }
        return queue;
      }
      // return number of key-value pairs in BST rooted at x
      _sizeNode(x){
        return this.nil(x)?0: x.size;
      }
      /**
       * Returns the number of keys in the symbol table in the given range.
       *
       * @param  lo minimum endpoint
       * @param  hi maximum endpoint
       * @return the number of keys in the symbol table between {@code lo}
       *         (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *         is {@code null}
       */
      size(lo, hi){
        if(arguments.length==0){
          return this._sizeNode(this.root)
        }
        this.assertOk(lo) && this.assertOk(hi);
        return this.compare(lo,hi)>0? 0
                                    : (this.contains(hi)? (this.rank(hi) - this.rank(lo) + 1): (this.rank(hi) - this.rank(lo)));
      }
      /**
       * Returns the height of the BST (for debugging).
       *
       * @return the height of the BST (a 1-node tree has height 0)
       */
      height(){
        return this._heightNode(this.root);
      }
      _heightNode(x){
        return this.nil(x)? -1 : (1 + Math.max(this._heightNode(x.left), this._heightNode(x.right)))
      }
      /**
       * Returns the keys in the BST in level order (for debugging).
       *
       * @return the keys in the BST in level order traversal
       */
      levelOrder(){
        let keys = [],
            x,queue = [];
        queue.push(this.root);
        while(queue.length>0){
          x = queue.pop();
          if(!this.nil(x)){
            keys.push(x.key);
            queue.push(x.left, x.right);
          }
        }
        return keys;
      }
      static eval(input,compareFn){
        let b=new BST(compareFn);
        input.forEach((s,i)=> b.put(s,i));
        return b;
      }
      static test(){
        let obj= BST.eval("SEARCHEXAMPLE".split(""),(a,b)=>{
          return a<b?-1:(a>b?1:0)
        });
        obj.levelOrder().forEach(s=>{
          console.log(`${s} = ${obj.get(s)}`)
        });
        console.log("");
        obj.keys().forEach(s=>{
          console.log(`${s} = ${obj.get(s)}`)
        });
      }
    }

    /**
     * @memberof module:mcfud/algo_search
     * @class
     * @property {object} root
     * @property {function} compare
     */
    class RedBlackBST{
      static BLACK = false;
      static RED= true;
      constructor(compareFn){
        this.nil= (x)=>{ return x===null || x===undefined };
        this.compare=compareFn;
        this.root=null;
        this.assertOk=(x)=>{
          if(x===null||x===undefined) throw Error("Invalid argument");
          return true;
        }
        this.assertCheck=()=>{
          // is the tree rooted at x a BST with all keys strictly between min and max
          // (if min or max is null, treat as empty constraint)
          // Credit: Bob Dondero's elegant solution
          let isBST3=(x, min, max)=>{
            if(this.nil(x)) return true;
            if(min && this.compare(x.key,min) <= 0) return false;
            if(max && this.compare(x.key,max) >= 0) return false;
            return isBST3(x.left, min, x.key) && isBST3(x.right, x.key, max);
          };
          let isSizeConsistent=(x)=>{
            if(this.nil(x)) return true;
            if(x.size != this._sizeNode(x.left) + this._sizeNode(x.right) + 1) return false;
            return isSizeConsistent(x.left) && isSizeConsistent(x.right);
          }
          // check that ranks are consistent
          let isRankConsistent=()=>{
            for(let i = 0; i < this.size(); ++i)
              if(i != this._rankNode(this.select(i))) return false;
            for(let i=0,ks=this.keys(); i<ks.length;++i)
              if(this.compare(ks[i],this.select(this._rankNode(key))) != 0) return false;
            return true;
          };
          // Does the tree have no red right links, and at most one (left)
          // red links in a row on any path?
          let is23=(x)=>{
            if(this.nil(x)) return true;
            if(this._isRed(x.right)) return false;
            if (x !== this.root && this._isRed(x) && this._isRed(x.left)) return false;
            return is23(x.left) && is23(x.right);
          }
          // do all paths from root to leaf have same number of black edges?
          let isBalanced=()=>{
            let black = 0;     // number of black links on path from root to min
            let x = this.root;
            while(x != null){
              if(!this._isRed(x)) black++;
              x = x.left;
            }
            return isBalanced2(this.root, black);
          };
          // does every path from the root to a leaf have the given number of black links?
          let isBalanced2=(x, black)=>{
            if(this.nil(x)) return black == 0;
            if(!this._isRed(x)) black--;
            return isBalanced2(x.left, black) && isBalanced2(x.right, black);
          };
          return isBST(this.root,null,null) && isSizeConsistent(this.root) && isRankConsistent() && is23(this.root) && isBalanced();
        };
      }
      Node(key, val, color, size){
        //color is parent color
        return {key,val,color,size,left:null,right:null}
      }
      // is node x red; false if x is null ?
      _isRed(x){
        return this.nil(x)?false:x.color=== RedBlackBST.RED
      }
      //number of node in subtree rooted at x; 0 if x is null
      _sizeNode(x){
        return this.nil(x)?0:x.size
      }
      /**
       * Is this symbol table empty?
       * @return {@code true} if this symbol table is empty and {@code false} otherwise
       */
      isEmpty(){
        return this.root === null;
      }
      /***************************************************************************
       *  Standard BST search.
       ***************************************************************************/
      /**
       * Returns the value associated with the given key.
       * @param key the key
       * @return the value associated with the given key if the key is in the symbol table
       *     and {@code null} if the key is not in the symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        return this.assertOk(key) && this._getNode(this.root, key);
      }
      // value associated with the given key in subtree rooted at x; null if no such key
      _getNode(x, key){
        while(x != null){
          let cmp = this.compare(key,x.key);
          if(cmp < 0) x = x.left;
          else if(cmp > 0) x = x.right;
          else return x.val;
        }
      }
      /**
       * Does this symbol table contain the given key?
       * @param key the key
       * @return {@code true} if this symbol table contains {@code key} and
       *     {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        return this.get(key) !== undefined
      }
      /***************************************************************************
       *  Red-black tree insertion.
       ***************************************************************************/
      /**
       * Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param key the key
       * @param val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(this.assertOk(key) && this.nil(val)){
          this.delete(key);
        }else{
          this.root = this._putNode(this.root, key, val);
          this.root.color = RedBlackBST.BLACK;
        }
      }
      // insert the key-value pair in the subtree rooted at h
      _putNode(h, key, val){
        if(this.nil(h)) return this.Node(key, val, RedBlackBST.RED, 1);
        let cmp = this.compare(key,h.key);
        if(cmp < 0) h.left  = this._putNode(h.left, key, val);
        else if(cmp > 0) h.right = this._putNode(h.right, key, val);
        else h.val = val;
        // fix-up any right-leaning links
        if(this._isRed(h.right) && !this._isRed(h.left))  h = this._rotateLeft(h);
        if(this._isRed(h.left)  &&  this._isRed(h.left.left)) h = this._rotateRight(h);
        if(this._isRed(h.left)  &&  this._isRed(h.right)) this._flipColors(h);
        h.size = this._sizeNode(h.left) + this._sizeNode(h.right) + 1;
        return h;
      }
      /***************************************************************************
       *  Red-black tree deletion.
       ***************************************************************************/
      /**
       * Removes the smallest key and associated value from the symbol table.
       * @throws Error if the symbol table is empty
       */
      deleteMin(){
        if(this.isEmpty())
          throw Error("BST underflow");
        // if both children of root are black, set root to red
        if(!this._isRed(this.root.left) &&
           !this._isRed(this.root.right))
          this.root.color = RedBlackBST.RED;
        this.root = this._deleteMinNode(this.root);
        if(!this.isEmpty()) this.root.color = RedBlackBST.BLACK;
      }
      // delete the key-value pair with the minimum key rooted at h
      _deleteMinNode(h){
        if(this.nil(h.left)) return null;
        if(!this._isRed(h.left) &&
           !this._isRed(h.left.left))
          h = this._moveRedLeft(h);
        h.left = this._deleteMinNode(h.left);
        return this._balance(h);
      }
      /**
       * Removes the largest key and associated value from the symbol table.
       * @throws Error if the symbol table is empty
       */
      deleteMax(){
        if(this.isEmpty())
          throw Error("BST underflow");
        // if both children of root are black, set root to red
        if(!this._isRed(this.root.left) &&
           !this._isRed(this.root.right))
          this.root.color = RedBlackBST.RED;
        this.root = this._deleteMaxNode(this.root);
        if(!this.isEmpty()) this.root.color = RedBlackBST.BLACK;
      }
      // delete the key-value pair with the maximum key rooted at h
      _deleteMaxNode(h){
        if(this._isRed(h.left)) h = this._rotateRight(h);
        if(this.nil(h.right)) return null;
        if(!this._isRed(h.right) &&
           !this._isRed(h.right.left))
          h = this._moveRedRight(h);
        h.right = this._deleteMaxNode(h.right);
        return this._balance(h);
      }
      /**
       * Removes the specified key and its associated value from this symbol table
       * (if the key is in this symbol table).
       *
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        if(this.assertOk(key) && !this.contains(key)){}else{
          //if both children of root are black, set root to red
          if(!this._isRed(this.root.left) &&
             !this._isRed(this.root.right)) this.root.color = RedBlackBST.RED;
          this.root = this._deleteNode(this.root, key);
          if(!this.isEmpty()) this.root.color = RedBlackBST.BLACK;
        }
      }
      // delete the key-value pair with the given key rooted at h
      _deleteNode(h, key){
        if(this.compare(key,h.key) < 0){
          if(!this._isRed(h.left) &&
             !this._isRed(h.left.left))
            h = this._moveRedLeft(h);
          h.left = this._deleteNode(h.left, key);
        }else{
          if(this._isRed(h.left))
            h = this._rotateRight(h);
          if(this.compare(key,h.key) == 0 &&
             this.nil(h.right)) return null;
          if(!this._isRed(h.right) &&
             !this._isRed(h.right.left))
            h = this._moveRedRight(h);
          if(this.compare(key,h.key) == 0){
            let x = this._minNode(h.right);
            h.key = x.key;
            h.val = x.val;
            h.right = this._deleteMinNode(h.right);
          }else{
            h.right = this._deleteNode(h.right, key);
          }
        }
        return this._balance(h);
      }
      /***************************************************************************
       *  Red-black tree helper functions.
       ***************************************************************************/
      // make a left-leaning link lean to the right
      _rotateRight(h){
        if(this.nil(h) || !this._isRed(h.left))
          throw Error("bad input to rotateRight");
        let x = h.left;
        h.left = x.right;
        x.right = h;
        x.color = x.right.color;
        x.right.color = RedBlackBST.RED;
        x.size = h.size;
        h.size = this._sizeNode(h.left) + this._sizeNode(h.right) + 1;
        return x;
      }
      // make a right-leaning link lean to the left
      _rotateLeft(h){
        if(this.nil(h) || !this._isRed(h.right))
          throw Error("bad input to rotateLeft");
        let x = h.right;
        h.right = x.left;
        x.left = h;
        x.color = x.left.color;
        x.left.color = RedBlackBST.RED;
        x.size = h.size;
        h.size = this._sizeNode(h.left) + this._sizeNode(h.right) + 1;
        return x;
      }
      // flip the colors of a node and its two children
      _flipColors(h){
        // h must have opposite color of its two children
        // assert (h != null) && (h.left != null) && (h.right != null);
        // assert (!isRed(h) &&  isRed(h.left) &&  isRed(h.right))
        //    || (isRed(h)  && !isRed(h.left) && !isRed(h.right));
        h.color = !h.color;
        h.left.color = !h.left.color;
        h.right.color = !h.right.color;
      }
      // Assuming that h is red and both h.left and h.left.left
      // are black, make h.left or one of its children red.
      _moveRedLeft(h){
        // assert (h != null);
        // assert isRed(h) && !isRed(h.left) && !isRed(h.left.left);
        this._flipColors(h);
        if(this._isRed(h.right.left)){
          h.right = this._rotateRight(h.right);
          h = this._rotateLeft(h);
          this._flipColors(h);
        }
        return h;
      }
      // Assuming that h is red and both h.right and h.right.left
      // are black, make h.right or one of its children red.
      _moveRedRight(h){
        // assert (h != null);
        // assert isRed(h) && !isRed(h.right) && !isRed(h.right.left);
        this._flipColors(h);
        if(this._isRed(h.left.left)){
          h = this._rotateRight(h);
          this._flipColors(h);
        }
        return h;
      }
      // restore red-black tree invariant
      _balance(h){
        // assert (h != null);
        if(this._isRed(h.right) && !this._isRed(h.left))    h = this._rotateLeft(h);
        if(this._isRed(h.left) && this._isRed(h.left.left)) h = this._rotateRight(h);
        if(this._isRed(h.left) && this._isRed(h.right))     this._flipColors(h);
        h.size = this._sizeNode(h.left) + this._sizeNode(h.right) + 1;
        return h;
      }
      /***************************************************************************
       *  Utility functions.
       ***************************************************************************/
      /**
       * Returns the height of the BST (for debugging).
       * @return the height of the BST (a 1-node tree has height 0)
       */
      height(){
        return this._height(this.root);
      }
      _height(x){
        return this.nil(x)? -1: (1 + Math.max(this._height(x.left), this._height(x.right)));
      }
      /***************************************************************************
       *  Ordered symbol table methods.
       ***************************************************************************/
      /**
       * Returns the smallest key in the symbol table.
       * @return the smallest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      min(){
        if(this.isEmpty())
          throw Error(`calls min with empty symbol table`);
        return this._minNode(this.root).key;
      }
      // the smallest key in subtree rooted at x; null if no such key
      _minNode(x){
        return this.nil(x.left)? x: this._minNode(x.left);
      }
      /**
       * Returns the largest key in the symbol table.
       * @return the largest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      max(){
        if(this.isEmpty())
          throw Error(`calls max with empty symbol table`);
        return this._maxNode(this.root).key;
      }
      // the largest key in the subtree rooted at x; null if no such key
      _maxNode(x){
        return this.nil(x.right)? x : this._maxNode(x.right);
      }
      /**
       * Returns the largest key in the symbol table less than or equal to {@code key}.
       * @param key the key
       * @return the largest key in the symbol table less than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        if(this.assertOk(key) && this.isEmpty())
          throw Error(`calls floor with empty symbol table`);
        let x = this._floorNode(this.root, key);
        if(this.nil(x))
          throw Error(`argument to floor is too small`);
        return x.key;
      }
      // the largest key in the subtree rooted at x less than or equal to the given key
      _floorNode(x, key){
        if(this.nil(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp < 0)  return this._floorNode(x.left, key);
        let t = this._floorNode(x.right, key);
        return t? t: x;
      }
      /**
       * Returns the smallest key in the symbol table greater than or equal to {@code key}.
       * @param key the key
       * @return the smallest key in the symbol table greater than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        if(this.assertOk(key) && this.isEmpty())
          throw Error(`calls ceiling with empty symbol table`);
        let x = this._ceilingNode(this.root, key);
        if(this.nil(x))
          throw Error(`argument to ceiling is too small`);
        return x.key;
      }
      // the smallest key in the subtree rooted at x greater than or equal to the given key
      _ceilingNode(x, key){
        if(this.nil(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp > 0)  return this._ceilingNode(x.right, key);
        let t = this._ceilingNode(x.left, key);
        return t? t: x;
      }
      /**
       * Return the key in the symbol table of a given {@code rank}.
       * This key has the property that there are {@code rank} keys in
       * the symbol table that are smaller. In other words, this key is the
       * ({@code rank}+1)st smallest key in the symbol table.
       *
       * @param  rank the order statistic
       * @return the key in the symbol table of given {@code rank}
       * @throws Error unless {@code rank} is between 0 and
       *        <em>n</em>–1
       */
      select(rank){
        if(rank < 0 || rank >= this.size())
            throw Error(`argument to select is invalid: ${rank}`);
        return this._selectNode(this.root, rank);
      }
      // Return key in BST rooted at x of given rank.
      // Precondition: rank is in legal range.
      _selectNode(x, rank){
        if(this.nil(x)) return null;
        let leftSize = this._sizeNode(x.left);
        return leftSize > rank? this._selectNode(x.left,  rank)
                              : (leftSize < rank? this._selectNode(x.right, rank - leftSize - 1): x.key);
      }
      /**
       * Return the number of keys in the symbol table strictly less than {@code key}.
       * @param key the key
       * @return the number of keys in the symbol table strictly less than {@code key}
       * @throws Error if {@code key} is {@code null}
       */
      rank(key){
        return this.assertOk(key) && this._rankNode(key, this.root);
      }
      // number of keys less than key in the subtree rooted at x
      _rankNode(key, x){
        if(this.nil(x)) return 0;
        let cmp = this.compare(key,x.key);
        return cmp < 0? this._rankNode(key, x.left)
                      :(cmp > 0? (1 + this._sizeNode(x.left) + this._rankNode(key, x.right)) :  this._sizeNode(x.left));
      }
      /***************************************************************************
       *  Range count and range search.
       ***************************************************************************/
      /**
       * Returns all keys in the symbol table in the given range,
       * as an {@code Iterable}.
       *
       * @param  lo minimum endpoint
       * @param  hi maximum endpoint
       * @return all keys in the symbol table between {@code lo}
       *    (inclusive) and {@code hi} (inclusive) as an {@code Iterable}
       * @throws Error if either {@code lo} or {@code hi}
       *    is {@code null}
       */
      keys(lo, hi){
        if(arguments.length==0){
          if(this.isEmpty()) return [];
          lo=this.min();
          hi=this.max();
        }
        this.assertOk(lo) && this.assertOk(hi);
        return this._keysNode(this.root, [], lo, hi);
      }
      // add the keys between lo and hi in the subtree rooted at x
      // to the queue
      _keysNode(x, queue, lo, hi){
        if(!this.nil(x)){
          let cmplo = this.compare(lo,x.key);
          let cmphi = this.compare(hi,x.key);
          if(cmplo < 0) this._keysNode(x.left, queue, lo, hi);
          if(cmplo <= 0 && cmphi >= 0) queue.push(x.key);
          if(cmphi > 0) this._keysNode(x.right, queue, lo, hi);
        }
        return queue;
      }
      /**
       * Returns the number of keys in the symbol table in the given range.
       *
       * @param  lo minimum endpoint
       * @param  hi maximum endpoint
       * @return the number of keys in the symbol table between {@code lo}
       *    (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *    is {@code null}
       */
      size(lo, hi){
        if(argmuments.length==0){
          return this._sizeNode(this.root);
        }else{
          this.assertOk(lo) && this.assertOk(hi);
          return this.compare(lo,hi) > 0? 0
                                        :(this.contains(hi)? (this._rankNode(hi) - this._rankNode(lo) + 1)
                                                           : (this._rankNode(hi) - this._rankNode(lo)));
        }
      }
      static eval(input,compareFn){
        let b= new RedBlackBST(compareFn);
        input.forEach((s,i)=> b.put(s,i));
        return b;
      }
      static test(){
        let obj= RedBlackBST.eval("SEARCHEXAMPLE".split(""), (a,b)=>{
          return a<b?-1:(a>b?1:0)
        });
        obj.keys().forEach(s=>{
          console.log(`${s} = ${obj.get(s)}`)
        });
      }
    }

    /**Provides a static method for binary searching for an integer in a sorted array of integers.
     * @memberof module:mcfud/algo_search
     * @class
     */
    class BinarySearch{
      /**Returns the index of the specified key in the specified array.
       * @param  a the array of integers, must be sorted in ascending order
       * @param  key the search key
       * @return index of key in array {@code a} if present; {@code -1} otherwise
       */
      static indexOf(a, key){
        let lo = 0,
            hi = a.length - 1;
        while(lo <= hi){
          // Key is in a[lo..hi] or not present.
          let mid = lo + (hi - lo) / 2;
          if(key < a[mid]) hi = mid - 1;
          else if(key > a[mid]) lo = mid + 1;
          else return mid;
        }
        return -1;
      }
      static test(){
        let inp= "84 48 68 10 18 98 12 23 54 57 33 16 77 11 29".split(" ").map(s=>{ return +s }).sort();
        let t="23 50 10 99 18 23 98 84 11 10 48 77 13 54 98 77 77 68".split(" ").map(s=>{return +s});
        t.forEach(n=>{
          if(BinarySearch.indexOf(inp,n)<0)
            console.log(n);
        })
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    function _validateVertex(v,V){
      if(v < 0 || v >= V)
        throw Error(`vertex ${v} is not between 0 and ${V-1}`);
    }
    /**Represents an undirected graph of vertices named 0 through <em>V</em> – 1.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {number} V number of vertices
     * @property {number} E number of edges
     * @property {array} adjls list of adjacents
     */
    class Graph{
      static copy(G){
        if(G.V() < 0)
          throw Error("Number of vertices must be non-negative");
        let ret=new Graph(G.V());
        ret.edges= G.E();
        // update adjacency lists
        ret.adjls = new Array(G.V());
        for(let v = 0; v < V; ++v) ret.adjls[v] = new Bag();
        for(let v = 0; v < G.V(); ++v){
          // reverse so that adjacency list is in same order as original
          let reverse = new Stack();
          let it= G.adjls[v].iterator();
          while(it.hasNext()){
            reverse.push(it.next())
          }
          it=reverse.iterator();
          while(it.hasNext()){
            this.adjls[v].add(it.next())
          }
        }
        return ret;
      }
      /**
       * Initializes an empty graph with {@code V} vertices and 0 edges.
       * param V the number of vertices
       *
       * @param  V number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0)
          throw Error("Number of vertices must be non-negative");
        this.adjls = new Array(V);
        this.verts = V;
        this.edges = 0;
        for(let v = 0; v < V; ++v) this.adjls[v] = new Bag();
      }
      /**
       * Returns the number of vertices in this graph.
       *
       * @return the number of vertices in this graph
       */
      V(){
        return this.verts;
      }
      /**
       * Returns the number of edges in this graph.
       *
       * @return the number of edges in this graph
       */
      E(){
        return this.edges;
      }
      /**
       * Adds the undirected edge v-w to this graph.
       *
       * @param  v one vertex in the edge
       * @param  w the other vertex in the edge
       * @throws IllegalArgumentException unless both {@code 0 <= v < V} and {@code 0 <= w < V}
       */
      addEdge(v, w){
        _validateVertex(v,this.verts);
        _validateVertex(w,this.verts);
        this.edges++;
        this.adjls[v].add(w);
        this.adjls[w].add(v);
      }
      /**
       * Returns the vertices adjacent to vertex {@code v}.
       *
       * @param  v the vertex
       * @return the vertices adjacent to vertex {@code v}, as an iterable
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v, this.verts);
        return this.adjls[v];
      }
      /**
       * Returns the degree of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the degree of vertex {@code v}
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      degree(v){
        _validateVertex(v, this.verts);
        return this.adjls[v].size();
      }
      /**
       * Returns a string representation of this graph.
       *
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists
       */
      toString(){
        let out=`${this.verts} vertices, ${this.edges} edges\n`;
        for(let it,v = 0; v < this.verts; ++v){
          out += `${v}: `;
          it= this.adjls[v].iterator();
          while(it.hasNext()){
            out += `${it.next()} `;
          }
          out += "\n";
        }
        return out;
      }
      static test(){
        let obj= new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){
          obj.addEdge(a[i], a[i+1]);
        }
        console.log(obj.toString());
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // depth first search from v
    function _dfs(G, v,M){
      let w,it= G.adj(v).iterator();
      M.nCount++;
      M.bMarked[v] = true;
      while(it.hasNext()){
        w=it.next();
        if(!M.bMarked[w]) _dfs(G, w,M);
      }
    }
    /**
     * @memberof module:mcfud/algo_search
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     * @property {number} count number of vertices connected to s
     */
    class DepthFirstSearch{
      /**
       * Computes the vertices in graph {@code G} that are
       * connected to the source vertex {@code s}.
       * @param G the graph
       * @param s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V()); // marked[v] = is there an s-v path?
        this.nCount=0; // number of vertices connected to s
        _validateVertex(s,this.bMarked.length);
        _dfs(G, s, this);
      }
      /**
       * Is there a path between the source vertex {@code s} and vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a path, {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      marked(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns the number of vertices connected to the source vertex {@code s}.
       * @return the number of vertices connected to the source vertex {@code s}
       */
      count(){
        return this.nCount;
      }
      static test(){
        let g=new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){ g.addEdge(a[i], a[i+1]); }
        let obj= new DepthFirstSearch(g, 0);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log(obj.count() != g.V()? "NOT connected" :"connected");
        obj= new DepthFirstSearch(g, 9);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log(obj.count() != g.V()? "NOT connected" :"connected");
      }
    }
    /**Represents a data type for finding the vertices connected to a source vertex <em>s</em> in the undirected graph.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     */
    class NonrecursiveDFS{
      /**
       * Computes the vertices connected to the source vertex {@code s} in the graph {@code G}.
       * @param G the graph
       * @param s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V()); // marked[v] = is there an s-v path?
        _validateVertex(s,this.bMarked.length);
        // to be able to iterate over each adjacency list, keeping track of which
        // vertex in each adjacency list needs to be explored next
        let adj = new Array(G.V());
        for(let v = 0; v < G.V(); ++v)
          adj[v] = G.adj(v).iterator();
        // depth-first search using an explicit stack
        let it,v,w,stack = new Stack();
        this.bMarked[s] = true;
        stack.push(s);
        while(!stack.isEmpty()){
          v = stack.peek();
          it=adj[v];
          if(it.hasNext()){
            w = it.next();
            //console.log(`check ${w}`);
            if(!this.bMarked[w]){
              // discovered vertex w for the first time
              this.bMarked[w] = true;
              // edgeTo[w] = v;
              stack.push(w);
              //console.log(`dfs(${w})`);
            }
          }else{
            //console.log(`${v} done`);
            stack.pop();
          }
        }
      }
      /**
       * Is vertex {@code v} connected to the source vertex {@code s}?
       * @param v the vertex
       * @return {@code true} if vertex {@code v} is connected to the source vertex {@code s},
       *    and {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      marked(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      static test(){
        let g = new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){ g.addEdge(a[i], a[i+1]); }
        let obj = new NonrecursiveDFS(g, 0);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log("***");
        obj = new NonrecursiveDFS(g, 9);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // depth first search from v
    function _dfs(G, v,M){
      let w,it=G.adj(v).iterator();
      M.bMarked[v] = true;
      while(it.hasNext()){
        w=it.next();
        if(!M.bMarked[w]){
          M.edgeTo[w] = v;
          _dfs(G, w,M);
        }
      }
    }

    /**Represents a data type for finding paths from a source vertex <em>s</em>
     * to every other vertex in an undirected graph.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     * @property {number} s source index
     * @property {array} edgeTo edgeTo[v] = last edge on s-v path
     */
    class DepthFirstPaths{
      /**
       * Computes a path between {@code s} and every other vertex in graph {@code G}.
       * @param G the graph
       * @param s the source vertex
       * @throws IllegalArgumentException unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        this.edgeTo = new Array(G.V());
        this.s = s; // source vertex
        _validateVertex(s,this.bMarked.length);
        _dfs(G, s,this);
      }
      /**
       * Is there a path between the source vertex {@code s} and vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a path, {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns a path between the source vertex {@code s} and vertex {@code v}, or
       * {@code null} if no such path.
       * @param  v the vertex
       * @return the sequence of vertices on a path between the source vertex
       *         {@code s} and vertex {@code v}, as an Iterable
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this.bMarked.length);
        if(!this.hasPathTo(v)) return null;
        let path = new Stack();
        for(let x = v; x != this.s; x = this.edgeTo[x]) path.push(x);
        path.push(this.s);
        return path;
      }
      static test(){
        let G = new Graph(6);
        let s=0,a=[0,5,2,4,2,3,1,2,0,1,3,4,3,5,0,2];
        for(let i=0;i<a.length; i+=2){ G.addEdge(a[i], a[i+1]) }
        let obj = new DepthFirstPaths(G, s);
        for(let m,it,x, v = 0; v < G.V(); ++v){
          if(obj.hasPathTo(v)){
            m= `${s} to ${v}:  `;
            it=obj.pathTo(v).iterator();
            while(it.hasNext()){
              x=it.next();
              m += x==s? x : `-${x}`;
            }
            console.log(m);
          }else{
            console.log(`${s} to ${v}:  not connected\n`);
          }
        }
      }
    }

    /**Represents an ordered symbol table of generic key-value pairs.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {object} root the root node
     */
    class AVLTreeST{
      Node(key, val, height, size){
        // height: height of the subtree
        // size: number of nodes in subtree
        return {key, val, height, size, left:null, right: null}
      }
      constructor(compareFn){
        this.compare=compareFn;
        this.root=null;
      }
      /**Checks if the symbol table is empty.
       * @return {@code true} if the symbol table is empty.
       */
      isEmpty(){
        return this.root == null;
      }
      /**Returns the number key-value pairs in the symbol table.
       * @return the number key-value pairs in the symbol table
       */
      size(){
        return this._sizeNode(root);
      }
      /**Returns the number of nodes in the subtree.
       * @param x the subtree
       * @return the number of nodes in the subtree
       */
      _sizeNode(x){
        return x == null? 0:x.size;
      }
      /**Returns the height of the internal AVL tree. It is assumed that the
       * height of an empty tree is -1 and the height of a tree with just one node
       * is 0.
       * @return the height of the internal AVL tree
       */
      height(){
        return this._heightNode(this.root);
      }
      /**Returns the height of the subtree.
       * @param x the subtree
       * @return the height of the subtree.
       */
      _heightNode(x){
        return x == null? -1: x.height;
      }
      /**Returns the value associated with the given key.
       * @param key the key
       * @return the value associated with the given key if the key is in the
       *         symbol table and {@code null} if the key is not in the
       *         symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(_.nichts(key)) throw Error("argument to get() is null");
        let x = this._getNode(this.root, key);
        if(x) return x.val;
      }
      /**Returns value associated with the given key in the subtree or
       * {@code null} if no such key.
       *
       * @param x the subtree
       * @param key the key
       * @return value associated with the given key in the subtree or
       *         {@code null} if no such key
       */
      _getNode(x, key){
        if(!x) return null;
        let cmp = this.compare(key,x.key);
        if(cmp < 0) return this._getNode(x.left, key);
        if(cmp > 0) return this._getNode(x.right, key);
        return x;
      }
      /**Checks if the symbol table contains the given key.
       *
       * @param key the key
       * @return {@code true} if the symbol table contains {@code key}
       *         and {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        return this.get(key) !== undefined;
      }
      /**
       * Inserts the specified key-value pair into the symbol table, overwriting
       * the old value with the new value if the symbol table already contains the
       * specified key. Deletes the specified key (and its associated value) from
       * this symbol table if the specified value is {@code null}.
       *
       * @param key the key
       * @param val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(_.nichts(key)) throw Error("first argument to put() is null");
        if(val === undefined ){
          this.delete(key);
        }else{
          this.root = this._putNode(this.root, key, val);
        }
      }
      /**Inserts the key-value pair in the subtree. It overrides the old value
       * with the new value if the symbol table already contains the specified key
       * and deletes the specified key (and its associated value) from this symbol
       * table if the specified value is {@code null}.
       *
       * @param x the subtree
       * @param key the key
       * @param val the value
       * @return the subtree
       */
      _putNode(x, key, val){
        if(!x) return this.Node(key, val, 0, 1);
        let cmp = this.compare(key,x.key);
        if(cmp < 0){
          x.left = this._putNode(x.left, key, val);
        }else if(cmp > 0){
          x.right = this._putNode(x.right, key, val);
        }else{
          x.val = val;
          return x;
        }
        x.size = 1 + this._sizeNode(x.left) + this._sizeNode(x.right);
        x.height = 1 + Math.max(this._heightNode(x.left), this._heightNode(x.right));
        return this._balanceNode(x);
      }
      /**
       * Restores the AVL tree property of the subtree.
       *
       * @param x the subtree
       * @return the subtree with restored AVL property
       */
      _balanceNode(x){
        if(this._balanceFactor(x) < -1){
          if(this._balanceFactor(x.right) > 0) x.right = this._rotateRight(x.right);
          x = this._rotateLeft(x);
        }else if(this._balanceFactor(x) > 1){
          if(this._balanceFactor(x.left) < 0) x.left = this._rotateLeft(x.left);
          x = this._rotateRight(x);
        }
        return x;
      }
      /**
       * Returns the balance factor of the subtree. The balance factor is defined
       * as the difference in height of the left subtree and right subtree, in
       * this order. Therefore, a subtree with a balance factor of -1, 0 or 1 has
       * the AVL property since the heights of the two child subtrees differ by at
       * most one.
       *
       * @param x the subtree
       * @return the balance factor of the subtree
       */
      _balanceFactor(x){
        return this._heightNode(x.left) - this._heightNode(x.right);
      }
      /**
       * Rotates the given subtree to the right.
       *
       * @param x the subtree
       * @return the right rotated subtree
       */
      _rotateRight(x){
        let y = x.left;
        x.left = y.right;
        y.right = x;
        y.size = x.size;
        x.size = 1 + this._sizeNode(x.left) + this._sizeNode(x.right);
        x.height = 1 + Math.max(this._heightNode(x.left), this._heightNode(x.right));
        y.height = 1 + Math.max(this._heightNode(y.left), this._heightNode(y.right));
        return y;
      }
      /**
       * Rotates the given subtree to the left.
       *
       * @param x the subtree
       * @return the left rotated subtree
       */
      _rotateLeft(x){
        let y = x.right;
        x.right = y.left;
        y.left = x;
        y.size = x.size;
        x.size = 1 + this._sizeNode(x.left) + this._sizeNode(x.right);
        x.height = 1 + Math.max(this._heightNode(x.left), this._heightNode(x.right));
        y.height = 1 + Math.max(this._heightNode(y.left), this._heightNode(y.right));
        return y;
      }
      /**
       * Removes the specified key and its associated value from the symbol table
       * (if the key is in the symbol table).
       *
       * @param key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        if(_.nichts(key)) throw Error("argument to delete() is null");
        if(this.contains(key))
          this.root = this._deleteNode(this.root, key);
      }
      /**
       * Removes the specified key and its associated value from the given
       * subtree.
       *
       * @param x the subtree
       * @param key the key
       * @return the updated subtree
       */
      _deleteNode(x, key){
        let cmp = this.compare(key,x.key);
        if(cmp < 0){
          x.left = this._deleteNode(x.left, key);
        }else if(cmp > 0){
          x.right = this._deleteNode(x.right, key);
        }else{
          if(!x.left) return x.right;
          if(!x.right) return x.left;
          let y = x;
          x = min(y.right);
          x.right = this.deleteMin(y.right);
          x.left = y.left;
        }
        x.size = 1 + this._sizeNode(x.left) + this._sizeNode(x.right);
        x.height = 1 + Math.max(this._heightNode(x.left), this._heightNode(x.right));
        return this._balance(x);
      }
      /**Removes the smallest key and associated value from the symbol table.
       * @throws Error if the symbol table is empty
       */
      deleteMin(){
        if(this.isEmpty()) throw Error("called deleteMin() with empty symbol table");
        this.root = this._deleteMinNode(this.root);
      }
      /**Removes the smallest key and associated value from the given subtree.
       *
       * @param x the subtree
       * @return the updated subtree
       */
      _deleteMinNode(x){
        if(!x.left) return x.right;
        x.left = this._deleteMinNode(x.left);
        x.size = 1 + this._sizeNode(x.left) + this._sizeNode(x.right);
        x.height = 1 + Math.max(this._heightNode(x.left), this._heightNode(x.right));
        return this._balance(x);
      }
      /**Removes the largest key and associated value from the symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMax(){
        if(this.isEmpty()) throw Error("called deleteMax() with empty symbol table");
        this.root = this._deleteMaxNode(this.root);
      }
      /**Removes the largest key and associated value from the given subtree.
       *
       * @param x the subtree
       * @return the updated subtree
       */
      _deleteMaxNode(x){
        if(!x.right) return x.left;
        x.right = this._deleteMaxNode(x.right);
        x.size = 1 + this._sizeNode(x.left) + this._sizeNode(x.right);
        x.height = 1 + Math.max(this._heightNode(x.left), this._heightNode(x.right));
        return this._balance(x);
      }
      /**Returns the smallest key in the symbol table.
       *
       * @return the smallest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      min(){
        if(this.isEmpty()) throw Error("called min() with empty symbol table");
        return this._minNode(root).key;
      }
      /**Returns the node with the smallest key in the subtree.
       *
       * @param x the subtree
       * @return the node with the smallest key in the subtree
       */
      _minNode(x){
        return !x.left ? x: this._minNode(x.left);
      }
      /**Returns the largest key in the symbol table.
       *
       * @return the largest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      max(){
        if(this.isEmpty()) throw Error("called max() with empty symbol table");
        return this._maxNode(root).key;
      }
      /**Returns the node with the largest key in the subtree.
       *
       * @param x the subtree
       * @return the node with the largest key in the subtree
       */
      _maxNode(x){
        return !x.right ? x: this._maxNode(x.right);
      }
      /**
       * Returns the largest key in the symbol table less than or equal to
       * {@code key}.
       *
       * @param key the key
       * @return the largest key in the symbol table less than or equal to
       *         {@code key}
       * @throws Error if the symbol table is empty
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        if(_.nichts(key)) throw Error("argument to floor() is null");
        if(this.isEmpty()) throw Error("called floor() with empty symbol table");
        let x = this._floorNode(this.root, key);
        if(x) return x.key;
      }
      /**
       * Returns the node in the subtree with the largest key less than or equal
       * to the given key.
       *
       * @param x the subtree
       * @param key the key
       * @return the node in the subtree with the largest key less than or equal
       *         to the given key
       */
      _floorNode(x, key){
        if(_.nichts(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp < 0) return this._floorNode(x.left, key);
        let y = this._floorNode(x.right, key);
        return y?  y : x;
      }
      /**Returns the smallest key in the symbol table greater than or equal to
       * {@code key}.
       *
       * @param key the key
       * @return the smallest key in the symbol table greater than or equal to
       *         {@code key}
       * @throws Error if the symbol table is empty
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        if(_.nichts(key)) throw Error("argument to ceiling() is null");
        if(this.isEmpty()) throw Error("called ceiling() with empty symbol table");
        let x = this._ceilingNode(this.root, key);
        if(x) return x.key;
      }
      /**Returns the node in the subtree with the smallest key greater than or
       * equal to the given key.
       *
       * @param x the subtree
       * @param key the key
       * @return the node in the subtree with the smallest key greater than or
       *         equal to the given key
       */
      _ceilingNode(x, key){
        if(_.nichts(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp > 0) return this._ceilingNode(x.right, key);
        let y = this._ceilingNode(x.left, key);
        return y? y: x;
      }
      /**Returns the kth smallest key in the symbol table.
       *
       * @param k the order statistic
       * @return the kth smallest key in the symbol table
       * @throws Error unless {@code k} is between 0 and {@code size() -1 }
       */
      select(k){
        if(k < 0 || k >= this.size()) throw Error("k is not in range 0-" + (this.size() - 1));
        let n= this._selectNode(root, k);
        if(n) return n.key;
      }
      /**Returns the node with key the kth smallest key in the subtree.
       *
       * @param x the subtree
       * @param k the kth smallest key in the subtree
       * @return the node with key the kth smallest key in the subtree
       */
      _selectNode(x, k){
        if(_.nichts(x)) return null;
        let t = this._sizeNode(x.left);
        if(t > k) return this._selectNode(x.left, k);
        if(t < k) return this._selectNode(x.right, k - t - 1);
        return x;
      }
      /**Returns the number of keys in the symbol table strictly less than
       * {@code key}.
       *
       * @param key the key
       * @return the number of keys in the symbol table strictly less than
       *         {@code key}
       * @throws Error if {@code key} is {@code null}
       */
      rank(key){
        if(_.nichts(key)) throw Error("argument to rank() is null");
        return this._rankNode(key, this.root);
      }
      /**Returns the number of keys in the subtree less than key.
       *
       * @param key the key
       * @param x the subtree
       * @return the number of keys in the subtree less than key
       */
      _rankNode(key, x){
        if(_.nichts(x)) return 0;
        let cmp = this.compare(key,x.key);
        if(cmp < 0) return this._rankNode(key, x.left);
        if(cmp > 0) return 1 + this._sizeNode(x.left) + this._rankNode(key, x.right);
        return this._sizeNode(x.left);
      }
      /**Returns all keys in the symbol table.
       *
       * @return all keys in the symbol table
       */
      keys(){
        return this.keysInOrder();
      }
      /**Returns all keys in the symbol table following an in-order traversal.
       *
       * @return all keys in the symbol table following an in-order traversal
       */
      keysInOrder(){
        let queue = new Queue();
        this._keysInOrderNode(this.root, queue);
        return queue;
      }
      /**Adds the keys in the subtree to queue following an in-order traversal.
       *
       * @param x the subtree
       * @param queue the queue
       */
      _keysInOrderNode(x, queue){
        if(!_.nichts(x)){
          this._keysInOrderNode(x.left, queue);
          queue.enqueue(x.key);
          this._keysInOrderNode(x.right, queue);
        }
      }
      /**Returns all keys in the symbol table following a level-order traversal.
       * @return all keys in the symbol table following a level-order traversal.
       */
      keysLevelOrder(){
        let queue = new Queue();
        if(!this.isEmpty()){
          let queue2 = new Queue();
          queue2.enqueue(this.root);
          while(!queue2.isEmpty()){
            let x = queue2.dequeue();
            queue.enqueue(x.key);
            if(!x.left ){
              queue2.enqueue(x.left);
            }
            if(x.right ){
              queue2.enqueue(x.right);
            }
          }
        }
        return queue;
      }
      /**Returns all keys in the symbol table in the given range.
       *
       * @param lo the lowest key
       * @param hi the highest key
       * @return all keys in the symbol table between {@code lo} (inclusive)
       *         and {@code hi} (exclusive)
       * @throws Error if either {@code lo} or {@code hi} is {@code null}
       */
      keysBetween(lo, hi){
        if(_.nichts(lo)) throw Error("first argument to keys() is null");
        if(_.nichts(hi)) throw Error("second argument to keys() is null");
        let queue = new Queue();
        this._keysNode(this.root, queue, lo, hi);
        return queue;
      }
      /**
       * Adds the keys between {@code lo} and {@code hi} in the subtree
       * to the {@code queue}.
       *
       * @param x the subtree
       * @param queue the queue
       * @param lo the lowest key
       * @param hi the highest key
       */
      _keysNode(x, queue, lo, hi){
        if(x){
          let cmplo = this.compare(lo,x.key);
          let cmphi = this.compare(hi,x.key);
          if(cmplo < 0) this._keysNode(x.left, queue, lo, hi);
          if(cmplo <= 0 && cmphi >= 0) queue.enqueue(x.key);
          if(cmphi > 0) this._keysNode(x.right, queue, lo, hi);
        }
      }
      /**Returns the number of keys in the symbol table in the given range.
       *
       * @param lo minimum endpoint
       * @param hi maximum endpoint
       * @return the number of keys in the symbol table between {@code lo}
       *         (inclusive) and {@code hi} (exclusive)
       * @throws Error if either {@code lo} or {@code hi} is {@code null}
       */
      sizeBetween(lo, hi){
        if(_.nichts(lo)) throw Error("first argument to size() is null");
        if(_.nichts(hi)) throw Error("second argument to size() is null");
        if(this.compare(lo,hi) > 0) return 0;
        if(this.contains(hi)) return this.rank(hi) - this.rank(lo) + 1;
        return this.rank(hi) - this.rank(lo);
      }
      /**Checks if the AVL tree invariants are fine.
       *
       * @return {@code true} if the AVL tree invariants are fine
       */
      check(){
        let self=this;
        function isAVL(x){
          if(!x) return true;
          let bf = self._balanceFactor(x);
          if(bf > 1 || bf < -1) return false;
          return isAVL(x.left) && isAVL(x.right);
        }
        function isBST(x, min, max){
          if(!x) return true;
          if(!min && self.compare(x.key,min) <= 0) return false;
          if(!max && self.compare(x.key,max) >= 0) return false;
          return isBST(x.left, min, x.key) && isBST(x.right, x.key, max);
        }
        function isSizeConsistent(x){
          if(!x) return true;
          if(x.size != self._sizeNode(x.left) + self._sizeNode(x.right) + 1) return false;
          return isSizeConsistent(x.left) && isSizeConsistent(x.right);
        }
        function isRankConsistent(){
          for(let i = 0; i < self.size(); i++)
            if(i != self.rank(self.select(i))) return false;
          for(let k, it=self.keys().iterator();it.hasNext();){
            k=it.next();
            if(this.compare(k,self.select(self.rank(key))) != 0) return false;
          }
          return true;
        }
        return isBST(this.root,null,null) && isAVL(this.root) && isSizeConsistent(this.root) && isRankConsistent();
      }
      static test(){
        let st = new AVLTreeST(CMP);
        "SEARCHEXAMPLE".split("").forEach((s,i)=> st.put(s,i));
        for(let s,it=st.keys().iterator();it.hasNext();){
          s=it.next();
          console.log(s + " " + st.get(s));
        }
      }
    }

    //AVLTreeST.test();
    //DepthFirstPaths.test();
    //NonrecursiveDFS.test();
    //DepthFirstSearch.test();
    //Graph.test();
    //BinarySearch.test();
    //RedBlackBST.test();
    //BST.test();
    //BinarySearchST.test();
    //SequentialSearchST.test();
    //FrequencyCounter.test();

    const _$={
      AVLTreeST,
      DepthFirstPaths,
      NonrecursiveDFS,
      DepthFirstSearch,
      Graph,
      BinarySearch,
      RedBlackBST,
      BST,
      BinarySearchST,
      SequentialSearchST,
      FrequencyCounter
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./basic"))
  }else{
    gscope["io/czlab/mcfud/algo/search"]=_module
  }

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
   */
  function _module(Core,Basic,Sort){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!Basic) Basic= gscope["io/czlab/mcfud/algo/basic"]();
    if(!Sort) Sort= gscope["io/czlab/mcfud/algo/sort"]();
    const CMP=(a,b)=>{return a<b?-1:(a>b?1:0)};
    const int=Math.floor;
    const {is,u:_}= Core;
    const {Bag,Stack,Queue,ST}= Basic;
    const {IndexMinPQ}= Sort;
    /**
     * @module mcfud/algo_graph
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function dbgIter(o){
      let s="";
      for(let v, it=o.iterator(); it.hasNext();)
        s+= it.next() + " ";
      return s;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _validateVertex(v,V){
      if(v < 0 || v >= V)
        throw Error(`vertex ${v} is not between 0 and ${V-1}`);
    }

    /**Represents an undirected graph of vertices named 0 through <em>V</em> – 1.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} V number of vertices
     * @property {number} E number of edges
     * @property {array} adjls list of adjacents
     */
    class Graph{
      static copy(G){
        if(G.V() < 0)
          throw Error("Number of vertices must be non-negative");
        let ret=new Graph(G.V());
        ret.edges= G.E();
        // update adjacency lists
        ret.adjls = new Array(G.V());
        for(let v = 0; v < V; ++v) ret.adjls[v] = new Bag();
        for(let v = 0; v < G.V(); ++v){
          // reverse so that adjacency list is in same order as original
          let reverse = new Stack();
          let it= G.adjls[v].iterator();
          while(it.hasNext()){
            reverse.push(it.next())
          }
          it=reverse.iterator();
          while(it.hasNext()){
            this.adjls[v].add(it.next())
          }
        }
        return ret;
      }
      /**
       * Initializes an empty graph with {@code V} vertices and 0 edges.
       * param V the number of vertices
       *
       * @param  V number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0)
          throw Error("Number of vertices must be non-negative");
        this.adjls = new Array(V);
        this.verts = V;
        this.edges = 0;
        for(let v = 0; v < V; ++v) this.adjls[v] = new Bag();
      }
      /**
       * Returns the number of vertices in this graph.
       *
       * @return the number of vertices in this graph
       */
      V(){
        return this.verts;
      }
      /**
       * Returns the number of edges in this graph.
       *
       * @return the number of edges in this graph
       */
      E(){
        return this.edges;
      }
      /**
       * Adds the undirected edge v-w to this graph.
       *
       * @param  v one vertex in the edge
       * @param  w the other vertex in the edge
       * @throws IllegalArgumentException unless both {@code 0 <= v < V} and {@code 0 <= w < V}
       */
      addEdge(v, w){
        _validateVertex(v,this.verts);
        _validateVertex(w,this.verts);
        this.edges++;
        this.adjls[v].add(w);
        this.adjls[w].add(v);
      }
      /**
       * Returns the vertices adjacent to vertex {@code v}.
       *
       * @param  v the vertex
       * @return the vertices adjacent to vertex {@code v}, as an iterable
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v, this.verts);
        return this.adjls[v];
      }
      /**
       * Returns the degree of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the degree of vertex {@code v}
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      degree(v){
        _validateVertex(v, this.verts);
        return this.adjls[v].size();
      }
      /**
       * Returns a string representation of this graph.
       *
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists
       */
      toString(){
        let out=`${this.verts} vertices, ${this.edges} edges\n`;
        for(let it,v = 0; v < this.verts; ++v){
          out += `${v}: `;
          it= this.adjls[v].iterator();
          while(it.hasNext()){
            out += `${it.next()} `;
          }
          out += "\n";
        }
        return out;
      }
      static test(){
        let obj= new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){
          obj.addEdge(a[i], a[i+1]);
        }
        console.log(obj.toString());
      }
    }


    /**
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     * @property {number} count number of vertices connected to s
     */
    class DepthFirstSearch{
      /**
       * Computes the vertices in graph {@code G} that are
       * connected to the source vertex {@code s}.
       * @param G the graph
       * @param s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V()); // marked[v] = is there an s-v path?
        this.nCount=0; // number of vertices connected to s
        _validateVertex(s,this.bMarked.length);
        this._dfs(G, s);
      }
      //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
      // depth first search from v
      _dfs(G, v){
        let w,it= G.adj(v).iterator();
        this.nCount+=1;
        this.bMarked[v] = true;
        while(it.hasNext()){
          w=it.next();
          if(!this.bMarked[w]) this._dfs(G, w);
        }
      }
      /**
       * Is there a path between the source vertex {@code s} and vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a path, {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      marked(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns the number of vertices connected to the source vertex {@code s}.
       * @return the number of vertices connected to the source vertex {@code s}
       */
      count(){
        return this.nCount;
      }
      static test(){
        let g=new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){ g.addEdge(a[i], a[i+1]); }
        let obj= new DepthFirstSearch(g, 0);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log(obj.count() != g.V()? "NOT connected" :"connected");
        obj= new DepthFirstSearch(g, 9);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log(obj.count() != g.V()? "NOT connected" :"connected");
      }
    }
    /**Represents a data type for finding the vertices connected to a source vertex <em>s</em> in the undirected graph.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     */
    class NonrecursiveDFS{
      /**
       * Computes the vertices connected to the source vertex {@code s} in the graph {@code G}.
       * @param G the graph
       * @param s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V()); // marked[v] = is there an s-v path?
        _validateVertex(s,this.bMarked.length);
        // to be able to iterate over each adjacency list, keeping track of which
        // vertex in each adjacency list needs to be explored next
        let adj = new Array(G.V());
        for(let v = 0; v < G.V(); ++v)
          adj[v] = G.adj(v).iterator();
        // depth-first search using an explicit stack
        let it,v,w,stack = new Stack();
        this.bMarked[s] = true;
        stack.push(s);
        while(!stack.isEmpty()){
          v = stack.peek();
          it=adj[v];
          if(it.hasNext()){
            w = it.next();
            //console.log(`check ${w}`);
            if(!this.bMarked[w]){
              // discovered vertex w for the first time
              this.bMarked[w] = true;
              // edgeTo[w] = v;
              stack.push(w);
              //console.log(`dfs(${w})`);
            }
          }else{
            //console.log(`${v} done`);
            stack.pop();
          }
        }
      }
      /**
       * Is vertex {@code v} connected to the source vertex {@code s}?
       * @param v the vertex
       * @return {@code true} if vertex {@code v} is connected to the source vertex {@code s},
       *    and {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      marked(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      static test(){
        let g = new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){ g.addEdge(a[i], a[i+1]); }
        let obj = new NonrecursiveDFS(g, 0);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log("***");
        obj = new NonrecursiveDFS(g, 9);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
      }
    }

    /**Represents a data type for finding paths from a source vertex <em>s</em>
     * to every other vertex in an undirected graph.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     * @property {number} s source index
     * @property {array} edgeTo edgeTo[v] = last edge on s-v path
     */
    class DepthFirstPaths{
      /**
       * Computes a path between {@code s} and every other vertex in graph {@code G}.
       * @param G the graph
       * @param s the source vertex
       * @throws IllegalArgumentException unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        this.edgeTo = new Array(G.V());
        this.s = s; // source vertex
        _validateVertex(s,this.bMarked.length);
        this._dfs(G, s);
      }
      //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
      // depth first search from v
      _dfs(G, v){
        let w,it=G.adj(v).iterator();
        this.bMarked[v] = true;
        while(it.hasNext()){
          w=it.next();
          if(!this.bMarked[w]){
            this.edgeTo[w] = v;
            this._dfs(G, w);
          }
        }
      }
      /**
       * Is there a path between the source vertex {@code s} and vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a path, {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns a path between the source vertex {@code s} and vertex {@code v}, or
       * {@code null} if no such path.
       * @param  v the vertex
       * @return the sequence of vertices on a path between the source vertex
       *         {@code s} and vertex {@code v}, as an Iterable
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this.bMarked.length);
        if(!this.hasPathTo(v)) return null;
        let path = new Stack();
        for(let x = v; x != this.s; x = this.edgeTo[x]) path.push(x);
        path.push(this.s);
        return path;
      }
      static test(){
        let G = new Graph(6);
        let s=0,a=[0,5,2,4,2,3,1,2,0,1,3,4,3,5,0,2];
        for(let i=0;i<a.length; i+=2){ G.addEdge(a[i], a[i+1]) }
        let obj = new DepthFirstPaths(G, s);
        for(let m,it,x, v = 0; v < G.V(); ++v){
          if(obj.hasPathTo(v)){
            m= `${s} to ${v}:  `;
            it=obj.pathTo(v).iterator();
            while(it.hasNext()){
              x=it.next();
              m += x==s? x : `-${x}`;
            }
            console.log(m);
          }else{
            console.log(`${s} to ${v}:  not connected\n`);
          }
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // breadth-first search from a single source
    function _bfs(G, s, M){
      return _bfss(G,[s],M);
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // breadth-first search from multiple sources
    function _bfss(G, sources, M){
      let it,v,q = [];
      for(let v = 0; v < G.V(); ++v)
        M.mDistTo[v] = Infinity;
      sources.forEach(s=>{
        M.bMarked[s] = true;
        M.mDistTo[s] = 0;
        q.push(s);
      });
      while(q.length>0){
        v = q.shift();
        for(let w, it=G.adj(v).iterator(); it.hasNext();){
          w=it.next();
          if(!M.bMarked[w]){
            M.edgeTo[w] = v;
            M.mDistTo[w] = M.mDistTo[v] + 1;
            M.bMarked[w] = true;
            q.push(w);
          }
        }
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // check optimality conditions for single source
    function _check(G, s,M){
      // check that the distance of s = 0
      if(M.mDistTo[s] != 0)
        throw Error(`distance of source ${s} to itself = ${M.mDistTo[s]}`);
      // check that for each edge v-w dist[w] <= dist[v] + 1
      // provided v is reachable from s
      for(let it,v = 0; v < G.V(); ++v){
        for(let m,w, it=G.adj(v).iterator(); it.hasNext();){
          w=it.next();
          if(M.hasPathTo(v) != M.hasPathTo(w)){
            m=("edge " + v + "-" + w);
            m+= ("hasPathTo(" + v + ") = " + M.hasPathTo(v));
            m+=("hasPathTo(" + w + ") = " + M.hasPathTo(w));
            throw Error(m);
          }
          if(M.hasPathTo(v) && (M.mDistTo[w] > (M.mDistTo[v]+1))){
            m= ("edge " + v + "--" + w);
            m+= ("distTo[" + v + "] = " + M.mDistTo[v]);
            m+=("distTo[" + w + "] = " + M.mDistTo[w]);
            throw Error(m);
          }
        }
      }
      // check that v = edgeTo[w] satisfies distTo[w] = distTo[v] + 1
      // provided v is reachable from s
      for(let m,v,w = 0; w < G.V(); ++w){
        if(!M.hasPathTo(w) || w == s) continue;
        v = M.edgeTo[w];
        if(M.mDistTo[w] != M.mDistTo[v] + 1){
          m=("shortest path edge " + v + "-" + w);
          m+=("distTo[" + v + "] = " + M.mDistTo[v]);
          m+=("distTo[" + w + "] = " + M.mDistTo[w]);
          throw Error(m);
        }
      }
      return true;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _validateVertices(vertices,M){
      if(!vertices)
        throw Error("argument is null");
      let count = 0,
          V = M.bMarked.length;
      vertices.forEach(v=>{
        ++count;
        if(v == null)
          throw Error("vertex is null");
        _validateVertex(v,M.bMarked.length);
      });
      if(count == 0)
        throw Error("zero vertices");
    }
    /**Represents a data type for finding shortest paths (number of edges)
     * from a source vertex <em>s</em> (or a set of source vertices)
     * to every other vertex in an undirected graph.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     * @property {array} mDistTo  number of edges shortest s-v path
     * @property {array} edgeTo previous edge on shortest s-v path
     */
    class BreadthFirstPaths{
      /**
       * Computes the shortest path between the source vertex {@code s}
       * and every other vertex in the graph {@code G}.
       * @param G the graph
       * @param s the source vertex
       * @throws IllegalArgumentException unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        this.mDistTo = new Array(G.V());
        this.edgeTo = new Array(G.V());
        if(!Array.isArray(s)){
          s=[s]
        }
        _validateVertices(s,this);
        _bfss(G, s,this);
        _check(G, s, this);
      }
      /**
       * Is there a path between the source vertex {@code s} (or sources) and vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a path, and {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns the number of edges in a shortest path between the source vertex {@code s}
       * (or sources) and vertex {@code v}?
       * @param v the vertex
       * @return the number of edges in such a shortest path
       *         (or {@code Integer.MAX_VALUE} if there is no such path)
       * @throws Error unless {@code 0 <= v < V}
       */
      distTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.mDistTo[v];
      }
      /**
       * Returns a shortest path between the source vertex {@code s} (or sources)
       * and {@code v}, or {@code null} if no such path.
       * @param  v the vertex
       * @return the sequence of vertices on a shortest path, as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this.bMarked.length);
        if(!this.hasPathTo(v)) return null;
        let x,path = new Stack();
        for(x = v; this.mDistTo[x] != 0; x = this.edgeTo[x]){
          path.push(x);
        }
        path.push(x);
        return path;
      }
      static test(){
        let s=0,G=new Graph(6);
        let a=[0,5,2,4,2,3,1,2,0,1,3,4,3,5,0,2];
        for(let i=0;i<a.length; i+=2){ G.addEdge(a[i], a[i+1]) }
        console.log(G.toString());
        let obj = new BreadthFirstPaths(G, s);
        for(let m,v = 0; v < G.V(); ++v){
          if(obj.hasPathTo(v)){
            m= `${s} to ${v} (${obj.distTo(v)}):  `;
            for(let x,it=obj.pathTo(v).iterator(); it.hasNext();){
              x=it.next();
              m += x == s? `${x}`: `-${x}`;
            }
            console.log(m);
          }else{
            console.log(`${s} to ${v} (-):  not connected\n`);
          }
        }
      }
    }

    /**Represents a weighted edge in an {@link EdgeWeightedGraph}.
     * Each edge consists of two integers.
     * (naming the two vertices) and a real-value weight.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} v
     * @property {number} w
     * @property {number} weight
     */
    class Edge{
      /**Initializes an edge between vertices {@code v} and {@code w} of
       * the given {@code weight}.
       * @param  v one vertex
       * @param  w the other vertex
       * @param  weight the weight of this edge
       * @throws Error if either {@code v} or {@code w}
       *         is a negative integer
       * @throws Error if {@code weight} is {@code NaN}
       */
      constructor(v, w, weight){
        if(v < 0) throw Error("vertex index must be a non-negative integer");
        if(w < 0) throw Error("vertex index must be a non-negative integer");
        this.v = v;
        this.w = w;
        this._weight = weight;
      }
      /**Returns the weight of this edge.
       * @return the weight of this edge
       */
      weight(){
        return this._weight
      }
      /**Returns either endpoint of this edge.
       * @return either endpoint of this edge
       */
      either(){
        return this.v;
      }
      /**Returns the endpoint of this edge that is different from the given vertex.
       * @param  vertex one endpoint of this edge
       * @return the other endpoint of this edge
       * @throws Error if the vertex is not one of the
       *         endpoints of this edge
       */
      other(vertex){
        if(vertex == this.v) return this.w;
        if(vertex == this.w) return this.v;
        throw Error("Illegal endpoint");
      }
      /**Compares two edges by weight.
       * Note that {@code compareTo()} is not consistent with {@code equals()},
       * which uses the reference equality implementation inherited from {@code Object}.
       *
       * @param  that the other edge
       * @return a negative integer, zero, or positive integer depending on whether
       *         the weight of this is less than, equal to, or greater than the
       *         argument edge
       */
      compareTo(that){
        return this._weight< that._weight?-1:(this._weight>that._weight?1:0)
      }
      /**Returns a string representation of this edge.
       * @return a string representation of this edge
       */
      toString(){
        return `${this.v}-${this.w} ${this._weight}`;
      }
      static test(){
        console.log(new Edge(12, 34, 5.67).toString());
      }
    }

    /**Represents an edge-weighted graph of vertices named 0 through <em>V</em> – 1,
     * where each undirected edge is of type {@link Edge} and has a real-valued weight.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} _V
     * @property {number} _E
     * @property {array} adjls
     */
    class EdgeWeightedGraph{
      /**
       * Initializes an empty edge-weighted graph with {@code V} vertices and 0 edges.
       *
       * @param  V the number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0) throw Error("Number of vertices must be non-negative");
        this.adjls = new Array(V);
        this._V = V;
        this._E = 0;
        for(let v = 0; v < V; ++v) this.adjls[v] = new Bag();
      }
      /**
       * Initializes a random edge-weighted graph with {@code V} vertices and <em>E</em> edges.
       *
       * @param  V the number of vertices
       * @param  E the number of edges
       * @throws Error if {@code V < 0}
       * @throws Error if {@code E < 0}
       */
      static randGraph(V, E){
        let g= new EdgeWeightedGraph(V);
        if(E < 0) throw Error("Number of edges must be non-negative");
        for(let wt,v,w,i = 0; i < E; ++i){
          v = _.randInt2(0,V);
          w = _.randInt2(0,V);
          wt = Math.round(100 * _.rand()) / 100.0;
          g.addEdge(new Edge(v, w, wt));
        }
        return g;
      }
      /**Initializes a new edge-weighted graph that is a deep copy of {@code G}.
       * @param  G the edge-weighted graph to copy
       */
      clone(){
        let g= new EdgeWeightedGraph(this.V());
        g._E = this.E();
        for(let it,r,v = 0; v < this.V(); ++v){
          // reverse so that adjacency list is in same order as original
          r= new Stack();
          it=this.adjls[v].iterator();
          while(it.hasNext()){
            r.push(it.next())
          }
          r.forEach(e=> g.adjls[v].add(e))
        }
        return g;
      }
      /**Returns the number of vertices in this edge-weighted graph.
       * @return the number of vertices in this edge-weighted graph
       */
      V(){
        return this._V;
      }
      /**Returns the number of edges in this edge-weighted graph.
       * @return the number of edges in this edge-weighted graph
       */
      E(){
        return this._E;
      }
      /**Adds the undirected edge {@code e} to this edge-weighted graph.
       * @param  e the edge
       * @throws Error unless both endpoints are between {@code 0} and {@code V-1}
       */
      addEdge(e){
        let v = e.either(),
            w = e.other(v);
        _validateVertex(v,this._V);
        _validateVertex(w,this._V);
        this.adjls[v].add(e);
        this.adjls[w].add(e);
        this._E +=1;
      }
      /**Returns the edges incident on vertex {@code v}.
       * @param  v the vertex
       * @return the edges incident on vertex {@code v} as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v,this._V);
        return this.adjls[v];
      }
      /**Returns the degree of vertex {@code v}.
       * @param  v the vertex
       * @return the degree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      degree(v){
        _validateVertex(v,this._V);
        return this.adjls[v].size();
      }
      /**Returns all edges in this edge-weighted graph.
       * To iterate over the edges in this edge-weighted graph, use foreach notation:
       * {@code for (Edge e : G.edges())}.
       *
       * @return all edges in this edge-weighted graph, as an iterable
       */
      edges(){
        let list = new Bag();
        for(let it,s,e,v = 0; v < V; ++v){
          s= 0;
          it=this.adjls[v].iterator();
          while(it.hasNext()){
            e=it.next();
            if(e.other(v) > v){
              list.add(e);
            }
            // add only one copy of each self loop (self loops will be consecutive)
            else if(e.other(v) == v){
              if(s % 2 == 0) list.add(e);
              ++s;
            }
          }
        }
        return list;
      }
      /**Returns a string representation of the edge-weighted graph.
       * This method takes time proportional to <em>E</em> + <em>V</em>.
       *
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists of edges
       */
      toString(){
        let s = `${this._V} ${this._E}\n`;
        for(let it,v = 0; v < this._V; ++v){
          s+= `${v}: `;
          it=this.adjls[v].iterator();
          while(it.hasNext()){
            s+= `${it.next()} `;
          }
          s+="\n";
        }
        return s;
      }
      static test(){
        let V=8,g= new EdgeWeightedGraph(V);
        let d=`4 5 0.35 4 7 0.37 5 7 0.28 0 7 0.16 1 5 0.32 0 4 0.38 2 3 0.17 1 7 0.19 0 2 0.26 1 2 0.36 1 3 0.29 2 7 0.34 6 2 0.40 3 6 0.52 6 0 0.58 6 4 0.93`.split(" ").map(s=> {return +s});
        for(let i=0;i<d.length;i+=3){
          _validateVertex(d[i],V);
          _validateVertex(d[i+1],V);
          g.addEdge(new Edge(d[i],d[i+1], d[i+2]));
        }
        console.log(g.toString());
      }
    }

    /**Represents a data type for determining the connected components in an undirected graph.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked   marked[v] = has vertex v been marked?
     * @property {number} id id[v] = id of connected component containing v
     * @property {number} size size[id] = number of vertices in given component
     * @property {number} nCount  number of connected components
     */
    class CC{
      /** Computes the connected components of the undirected graph {@code G}.
       * @param {Graph} undirected or edgeweighted graph
       */
      constructor(G){
        this.bMarked = new Array(G.V());
        this._id = new Array(G.V());
        this._size = new Array(G.V());
        this.nCount=0;
        for(let v = 0; v < G.V(); ++v){
          if(!this.bMarked[v]){
            this._dfs(G, v);
            ++this.nCount;
          }
        }
      }
      // depth-first search for a Graph
      _dfs(G, v){
        let e,w,it= G.adj(v).iterator();
        this.bMarked[v] = true;
        this._id[v] = this.nCount;
        this._size[this.nCount] += 1;
        if(G instanceof EdgeWeightedGraph){
          while(it.hasNext()){
            e=it.next();
            w = e.other(v);
            if(!this.bMarked[w]) this._dfs(G, w);
          }
        }else{
          while(it.hasNext()){
            w=it.next();
            if(!this.bMarked[w]) this._dfs(G, w);
          }
        }
      }
      /**Returns the component id of the connected component containing vertex {@code v}.
       * @param  v the vertex
       * @return the component id of the connected component containing vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      id(v){
        _validateVertex(v,this.bMarked.length);
        return this._id[v];
      }
      /**Returns the number of vertices in the connected component containing vertex {@code v}.
       * @param  v the vertex
       * @return the number of vertices in the connected component containing vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      size(v){
        _validateVertex(v, this.bMarked.length);
        return this._size[this._id[v]];
      }
      /**Returns the number of connected components in the graph {@code G}.
       * @return the number of connected components in the graph {@code G}
       */
      count(){
        return this.nCount;
      }
      /**Returns true if vertices {@code v} and {@code w} are in the same
       * connected component.
       *
       * @param  v one vertex
       * @param  w the other vertex
       * @return {@code true} if vertices {@code v} and {@code w} are in the same
       *         connected component; {@code false} otherwise
       * @throws Error unless {@code 0 <= v < V}
       * @throws Error unless {@code 0 <= w < V}
       */
      connected(v, w){
        _validateVertex(v,this.bMarked.length);
        _validateVertex(w, this.bMarked.length);
        return this.id(v) == this.id(w);
      }
      static test(){
        let V=13,G = new Graph(V);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){ G.addEdge(a[i], a[i+1]); }
        //console.log(G.toString());
        let cc = new CC(G);
        // number of connected components
        let m = cc.count();
        console.log(m + " components");
        // compute list of vertices in each connected component
        let components = new Array(m);
        for(let i = 0; i < m; i++){
          components[i] = [];
        }
        for(let v = 0; v < G.V(); v++){
          components[cc.id(v)].push(v);
        }
        // print results
        for(let s,i = 0; i < m; i++){
          s="";
          components[i].forEach(v=> s+= v.toString()+" ");
          console.log(s);
        }
      }
    }

    /**Represents a directed graph of vertices
     *  named 0 through <em>V</em> - 1.
     *  It supports the following two primary operations: add an edge to the digraph,
     *  iterate over all of the vertices adjacent from a given vertex.
     *  It also provides
     *  methods for returning the indegree or outdegree of a vertex,
     *  the number of vertices <em>V</em> in the digraph,
     *  the number of edges <em>E</em> in the digraph, and the reverse digraph.
     *  Parallel edges and self-loops are permitted.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked   marked[v] = has vertex v been marked?
     * @property {number} id id[v] = id of connected component containing v
     * @property {number} size size[id] = number of vertices in given component
     * @property {number} nCount  number of connected components
     */
    class Digraph{
      static load(V,data){
        if(V<0)
          throw Error("number of vertices in a Digraph must be non-negative");
        let g= new Digraph(V);
        for(let i = 0; i < data.length; i+=2){
          g.addEdge(data[i], data[i+1]);
        }
        return g;
      }
      //private final int V;           // number of vertices in this digraph
      //private int E;                 // number of edges in this digraph
      //private Bag<Integer>[] adj;    // adj[v] = adjacency list for vertex v
      //private int[] indegree;        // indegree[v] = indegree of vertex v
      /**Initializes an empty digraph with <em>V</em> vertices.
       * @param  V the number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0) throw Error("Number of vertices in a Digraph must be non-negative");
        this._V = V;
        this._E = 0;
        this._indegree = new Array(V);
        this.adjls = new Array(V);
        for(let v = 0; v < V; v++) this.adjls[v] = new Bag();
      }
      /**Initializes a new digraph that is a deep copy of the specified digraph.
       * @return {object} digraph copy
       * @throws Error if {@code G} is {@code null}
       */
      clone(){
        let g=new Digraph(this.V());
        g._E = this.E();
        // update indegrees
        g._indegree = new Array(g.V());
        for(let v = 0; v < g.V(); v++)
          g._indegree[v] = this._indegree(v);
        // update adjacency lists
        for(let it,r,v = 0; v < g.V(); v++){
          // reverse so that adjacency list is in same order as original
          r= new Stack();
          it=this.adjls[v].iterator();
          while(it.hasNext()){
            r.push(it.next())
          }
          it=r.iterator();
          while(it.hasNext())
            g.adjls[v].add(it.next());
        }
        return g;
      }
      /**Returns the number of vertices in this digraph.
       * @return the number of vertices in this digraph
       */
      V(){
        return this._V;
      }
      /**Returns the number of edges in this digraph.
       * @return the number of edges in this digraph
       */
      E(){
        return this._E;
      }
      /**Adds the directed edge v→w to this digraph.
       *
       * @param  v the tail vertex
       * @param  w the head vertex
       * @throws Error unless both {@code 0 <= v < V} and {@code 0 <= w < V}
       */
      addEdge(v, w){
        _validateVertex(v,this._V);
        _validateVertex(w,this._V);
        this.adjls[v].add(w);
        this._indegree[w] +=1;
        ++this._E;
      }
      /**Returns the vertices adjacent from vertex {@code v} in this digraph.
       *
       * @param  v the vertex
       * @return the vertices adjacent from vertex {@code v} in this digraph, as an iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v,this._V);
        return this.adjls[v];
      }
      /**Returns the number of directed edges incident from vertex {@code v}.
       * This is known as the <em>outdegree</em> of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the outdegree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      outdegree(v){
        _validateVertex(v,this._V);
        return this.adjls[v].size();
      }
      /**Returns the number of directed edges incident to vertex {@code v}.
       * This is known as the <em>indegree</em> of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the indegree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      indegree(v){
        _validateVertex(v,this._V);
        return this._indegree[v];
      }
      /**Returns the reverse of the digraph.
       * @return the reverse of the digraph
       */
      reverse(){
        let r= new Digraph(this._V);
        for(let it,v = 0; v < this._V; v++){
          it=this.adjls[v].iterater();
          while(it.hasNext())
            r.addEdge(it.next(), v);
        }
        return r;
      }
      /**Returns a string representation of the graph.
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists
       */
      toString(){
        let s= `${this._V} vertices, ${this._E} edges\n`;
        for(let it,v = 0; v < this._V; v++){
          s+= `${v}: `
          it=this.adjls[v].iterator();
          while(it.hasNext())
            s+= `${it.next()} `;
          s+="\n";
        }
        return s;
      }
      static test(){
        let s= "4  2 2  3 3  2 6  0 0  1 2  0 11 12 12  9 9 10 9 11 7  9 10 12 11  4 4  3 3  5 6  8 8  6 5  4 0  5 6  4 6  9 7  6";
        let g= Digraph.load(13, s.split(/\s+/).map(n=>{ return +n }));
        console.log(g.toString());
        return g;
      }
    }

    /**Represents a data type for determining the vertices reachable
     * from a given source vertex <em>s</em> (or set of source vertices) in a digraph.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked  marked[v] = true iff v is reachable from source(s)
     * @property {number} nCount  number of vertices reachable from source(s)
     */
    class DirectedDFS{
      /**
       * Computes the vertices in digraph {@code G} that are
       * reachable from the source vertex {@code s}.
       * @param G the digraph
       * @param s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        if(!is.vec(s)) s=[s];
        this._validateVertices(s);
        s.forEach(v=>{
          if(!this.bMarked[v]) this._dfs(G, v);
        });
      }
      _dfs(G, v){
        this.mCount+=1;
        this.bMarked[v] = true;
        for(let w,it=G.adj(v).iterator(); it.hasNext();){
          w=it.next();
          if(!this.bMarked[w]) this._dfs(G, w);
        }
      }
      /**Is there a directed path from the source vertex (or any
       * of the source vertices) and vertex {@code v}?
       * @param  v the vertex
       * @return {@code true} if there is a directed path, {@code false} otherwise
       * @throws Error unless {@code 0 <= v < V}
       */
      marked(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**Returns the number of vertices reachable from the source vertex
       * (or source vertices).
       * @return the number of vertices reachable from the source vertex
       *   (or source vertices)
       */
      count(){
        return this.mCount;
      }
      // throw an IllegalArgumentException if vertices is null, has zero vertices,
      // or has a vertex not between 0 and V-1
      _validateVertices(vertices){
        let V = this.bMarked.length;
        let cnt = 0;
        vertices.forEach(v=>{
          cnt++;
          _validateVertex(v,V);
        });
        if(cnt == 0)
          throw Error("zero vertices");
      }
      static test(){
        let G= Digraph.test()
        let dfs = new DirectedDFS(G, [1,2,6]);
        // print out vertices reachable from sources
        for(let v = 0; v < G.V(); v++){
          if(dfs.marked(v)) console.log(v + " ");
        }
      }
    }

    /**Represents a data type for determining whether a digraph has a directed cycle.
     *  The <em>hasCycle</em> operation determines whether the digraph has
     *  a simple directed cycle and, if so, the <em>cycle</em> operation
     *  returns one.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked  marked[v] = has vertex v been marked?
     * @property {Stack} cycle  directed cycle (or null if no such cycle)
     * @property {array} edgeTo edgeTo[v] = previous vertex on path to v
     * @property {array} onStack onStack[v] = is vertex on the stack?
     */
    class DirectedCycle{
      /**Determines whether the digraph {@code G} has a directed cycle and, if so,
       * finds such a cycle.
       * @param G the digraph
       */
      constructor(G){
        this.bMarked  = new Array(G.V());
        this.onStack = new Array(G.V());
        this.edgeTo  = new Array(G.V());
        this.mCycle=null;
        for(let v = 0; v < G.V(); v++)
          if(!this.bMarked[v] && this.mCycle == null) this._dfs(G, v);
      }
      // run DFS and find a directed cycle (if one exists)
      _dfs(G, v){
        this.onStack[v] = true;
        this.bMarked[v] = true;
        for(let w, it=G.adj(v).iterator(); it.hasNext();){
          w=it.next();
          // short circuit if directed cycle found
          if(this.mCycle != null) return;
          // found new vertex, so recur
          else if(!this.bMarked[w]){
            this.edgeTo[w] = v;
            this._dfs(G, w);
          }
          // trace back directed cycle
          else if(this.onStack[w]){
            this.mCycle = new Stack();
            for(let x = v; x != w; x = this.edgeTo[x]){
              this.mCycle.push(x);
            }
            this.mCycle.push(w);
            this.mCycle.push(v);
            this.check();
          }
        }
        this.onStack[v] = false;
      }
      /**
       * Does the digraph have a directed cycle?
       * @return {@code true} if the digraph has a directed cycle, {@code false} otherwise
       */
      hasCycle(){
        return this.mCycle != null;
      }
      /**
       * Returns a directed cycle if the digraph has a directed cycle, and {@code null} otherwise.
       * @return a directed cycle (as an iterable) if the digraph has a directed cycle,
       *    and {@code null} otherwise
       */
      cycle(){
        return this.mCycle;
      }
      // certify that digraph has a directed cycle if it reports one
      check(){
        if(this.hasCycle()){
          // verify cycle
          let first = -1, last = -1;
          for(let v,it=this.cycle().iterator(); it.hasNext();){
            v=it.next();
            if(first == -1) first = v;
            last = v;
          }
          if(first != last)
            throw Error(`cycle begins with ${first} and ends with ${last}\n`);
        }
        return true;
      }
      static test(){
        let T2="2 3 0 6 0 1 2 0 11 12  9 12  9 10  9 11 3 5 8 7 5 4 0 5 6 4 6 9 7 6".split(/\s+/).map(n=>{return +n});
        let s="";
        let finder =[new DirectedCycle(Digraph.test()), new DirectedCycle(Digraph.load(13,T2))];
        finder.forEach(f=>{
          if(f.hasCycle()){
            console.log("Directed cycle: ");
            s="";
            for(let v,it=f.cycle().iterator(); it.hasNext();){
              s+=`${it.next()} `;
            }
            console.log(s);
          }else{
            console.log("No directed cycle");
          }
        });
      }
    }

    /**Represents a weighted edge in an
     *  {@link EdgeWeightedDigraph}. Each edge consists of two integers
     *  (naming the two vertices) and a real-value weight. The data type
     *  provides methods for accessing the two endpoints of the directed edge and
     *  the weight.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} v
     * @property {number} w
     * @property {number} weight
     */
    class DirectedEdge{
      /**
       * Initializes a directed edge from vertex {@code v} to vertex {@code w} with
       * the given {@code weight}.
       * @param v the tail vertex
       * @param w the head vertex
       * @param weight the weight of the directed edge
       * @throws IllegalArgumentException if either {@code v} or {@code w}
       *    is a negative integer
       * @throws IllegalArgumentException if {@code weight} is {@code NaN}
       */
      constructor(v, w, weight){
        if (v < 0) throw Error("Vertex names must be non-negative integers");
        if (w < 0) throw Error("Vertex names must be non-negative integers");
        this.v = v;
        this.w = w;
        this._weight = weight;
      }
      /**
       * Returns the tail vertex of the directed edge.
       * @return the tail vertex of the directed edge
       */
      from(){
        return this.v;
      }
      /**
       * Returns the head vertex of the directed edge.
       * @return the head vertex of the directed edge
       */
      to(){
        return this.w;
      }
      /**
       * Returns the weight of the directed edge.
       * @return the weight of the directed edge
       */
      weight(){
        return this._weight;
      }
      /**
       * Returns a string representation of the directed edge.
       * @return a string representation of the directed edge
       */
      toString(){
        return `${this.v}->${this.w} ${Number(this._weight).toFixed(2)}`
      }
      static test(){
        console.log(new DirectedEdge(12, 34, 5.67).toString());
      }
    }

    /**Represents a edge-weighted digraph of vertices named 0 through <em>V</em> - 1,
     * where each directed edge is of type {@link DirectedEdge} and has a real-valued weight.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} _V number of vertices in this digraph
     * @property {number} _E number of edges in this digraph
     * @property {array} adjls adj[v] = adjacency list for vertex v
     * @property {array} _indegree  indegree[v] = indegree of vertex v
     */
    class EdgeWeightedDigraph{
      /**Initializes an empty edge-weighted digraph with {@code V} vertices and 0 edges.
       *
       * @param  V the number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0) throw Error("Number of vertices in a Digraph must be non-negative");
        this._V = V;
        this._E = 0;
        this._indegree = new Array(V);
        this.adjls = new Array(V);
        for(let v = 0; v < V; v++) this.adjls[v] = new Bag();
      }
      static randGraph(V, E){
        if (E < 0) throw Error("Number of edges in a Digraph must be non-negative");
        let g= new EdgeWeightedDigraph(V);
        for(let i = 0; i < E; i++)
          g.addEdge(new DirectedEdge(_.randInt2(0,V),_.randInt2(0,V), 0.01 * _randInt2(0,100)));
        return g;
      }
      static load(V,data){
        if(V < 0) throw Error("number of vertices in a Digraph must be non-negative");
        let g= new EdgeWeightedDigraph(V);
        for(let i = 0; i < data.length; i+=3){
          _validateVertex(data[i],V);
          _validateVertex(data[i+1],V);
          //console.log(`d1=${data[i]}, d2=${data[i+1]}, d3=${data[i+2]}`);
          g.addEdge(new DirectedEdge(data[i],data[i+1],data[i+2]));
        }
        return g;
      }
      clone(){
        let g= new EdgeWeightedDigraph(this.V());
        g._E = this.E();
        for(let v = 0; v < this.V(); v++)
          g._indegree[v] = this._indegree(v);
        for(let r,v = 0; v < this.V(); v++){
          // reverse so that adjacency list is in same order as original
          r= new Stack();
          for(let e,it=this.adjls[v].iterator(); it.hasNext();){
            r.push(it.next());
          }
          for(let e,it=r.iterator();it.hasNext();){
            g.adjls[v].add(it.next());
          }
        }
        return g;
      }
      /**Returns the number of vertices in this edge-weighted digraph.
       *
       * @return the number of vertices in this edge-weighted digraph
       */
      V(){
        return this._V;
      }
      /**Returns the number of edges in this edge-weighted digraph.
       *
       * @return the number of edges in this edge-weighted digraph
       */
      E(){
        return this._E;
      }
      /**Adds the directed edge {@code e} to this edge-weighted digraph.
       *
       * @param  e the edge
       * @throws Error unless endpoints of edge are between {@code 0}
       *         and {@code V-1}
       */
      addEdge(e){
        _.assert(e instanceof DirectedEdge,"Expected DirectedEdge");
        let v = e.from();
        let w = e.to();
        _validateVertex(v,this._V);
        _validateVertex(w,this._V);
        this.adjls[v].add(e);
        this._indegree[w]+=1;
        this._E++;
      }
      /**Returns the directed edges incident from vertex {@code v}.
       *
       * @param  v the vertex
       * @return the directed edges incident from vertex {@code v} as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v,this._V);
        return this.adjls[v];
      }
      /**Returns the number of directed edges incident from vertex {@code v}.
       * This is known as the <em>outdegree</em> of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the outdegree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      outdegree(v){
        _validateVertex(v,this._V);
        return this.adjls[v].size();
      }
      /**Returns the number of directed edges incident to vertex {@code v}.
       * This is known as the <em>indegree</em> of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the indegree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      indegree(v){
        _validateVertex(v,this._V);
        return this._indegree[v];
      }
      /**Returns all directed edges in this edge-weighted digraph.
       * To iterate over the edges in this edge-weighted digraph, use foreach notation:
       * {@code for (DirectedEdge e : G.edges())}.
       *
       * @return all edges in this edge-weighted digraph, as an iterable
       */
      edges(){
        let list = new Bag();
        for(let v = 0; v < this._V; v++){
          for(let e, it= this.adj(v).iterator(); it.hasNext();) list.add(it.next());
        }
        return list;
      }
      /**Returns a string representation of this edge-weighted digraph.
       *
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists of edges
       */
      toString(){
        let s= `${this._V} ${this._E}\n`;
        for(let v = 0; v < this._V; v++){
          s+= `${v}: `;
          for(let e,it= this.adjls[v].iterator(); it.hasNext();){
            s+= `${it.next()}  `;
          }
          s+="\n";
        }
        return s;
      }
      static test(){
        let data=
        `4 5 0.35
        5 4 0.35
        4 7 0.37
        5 7 0.28
        7 5 0.28
        5 1 0.32
        0 4 0.38
        0 2 0.26
        7 3 0.39
        1 3 0.29
        2 7 0.34
        6 2 0.40
        3 6 0.52
        6 0 0.58
        6 4 0.93`.split(/\s+/).map(n=>{return +n});
        let G = EdgeWeightedDigraph.load(8,data);
        console.log(G.toString());
      }
    }

    /**Represents a data type for determining depth-first search ordering of the vertices in a digraph
     *  or edge-weighted digraph, including preorder, postorder, and reverse postorder.
     *  <p>
     *  This implementation uses depth-first search.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = has v been marked in dfs?
     * @property {array} _pre pre[v]    = preorder  number of v
     * @property {array} _post post[v]   = postorder number of v
     * @property {array} preorder vertices in preorder
     * @property {array} postorder vertices in postorder
     * @property {number} preCounter counter or preorder numbering
     * @property {number} postCounter counter for postorder numbering
     */
    class DepthFirstOrder{
      /**Determines a depth-first order for the digraph {@code G}.
       * @param G the digraph
       */
      constructor(G){
        this._pre    = new Array(G.V());
        this._post   = new Array(G.V());
        this.preCounter=0;
        this.postCounter=0;
        this.postorder = new Queue();
        this.preorder  = new Queue();
        this.bMarked    = new Array(G.V());
        for(let v = 0; v < G.V(); v++)
          if(!this.bMarked[v]) this._dfs(G, v);
        //assert check();
      }
      // run DFS in edge-weighted digraph G from vertex v and compute preorder/postorder
      // run DFS in digraph G from vertex v and compute preorder/postorder
      _dfs(G, v){
        this.bMarked[v] = true;
        this._pre[v] = this.preCounter++;
        this.preorder.enqueue(v);
        for(let w, it=G.adj(v).iterator(); it.hasNext();){
          w= (G instanceof EdgeWeightedDigraph)? it.next().to() : it.next();
          if(!this.bMarked[w]) this._dfs(G, w);
        }
        this.postorder.enqueue(v);
        this._post[v] = this.postCounter++;
      }
      /**Returns the preorder number of vertex {@code v}.
       * @param  v the vertex
       * @return the preorder number of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      pre(v){
        _validateVertex(v,this.bMarked.length);
        return this._pre[v];
      }
      /**Returns the postorder number of vertex {@code v}.
       * @param  v the vertex
       * @return the postorder number of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      post(v){
        _validateVertex(v,this.bMarked.length);
        return this._post[v];
      }
      /**Returns the vertices in postorder.
       * @return the vertices in postorder, as an iterable of vertices
       */
      postOrder(){
        return this.postorder;
      }
      /**Returns the vertices in preorder.
       * @return the vertices in preorder, as an iterable of vertices
       */
      preOrder(){
        return this.preorder;
      }
      /**Returns the vertices in reverse postorder.
       * @return the vertices in reverse postorder, as an iterable of vertices
       */
      reversePost(){
        let r= new Stack(),
            it= this.postorder.iterator();
        while(it.hasNext())
          r.push(it.next());
        return r;
      }
      // check that pre() and post() are consistent with pre(v) and post(v)
      check(){
        // check that post(v) is consistent with post()
        let r = 0;
        this.postOrder().forEach(v=>{
          if(this.post(v) != r)
            throw Error("post(v) and post() inconsistent");
          r++;
        })
        // check that pre(v) is consistent with pre()
        r = 0;
        this.preOrder().forEach(v=>{
          if(this.pre(v) != r)
            throw Error("pre(v) and pre() inconsistent");
          r++;
        });
        return true;
      }
      static test(){
        let G = Digraph.load(13,
                             "2 3 0 6 0 1 2 0 11 12  9 12  9 10  9 11 3 5 8 7 5 4 0 5 6 4 6 9 7 6".split(/\s+/).map(n=>{return +n}));
        console.log(G.toString());

        let s,dfs = new DepthFirstOrder(G);
        console.log("   v  pre post");
        console.log("--------------");
        for(let v = 0; v < G.V(); v++)
          console.log(`${v} ${dfs.pre(v)} ${dfs.post(v)}\n`);

        console.log("Preorder:  ");
        console.log(dbgIter(dfs.preOrder()));

        console.log("Postorder:  ");
        console.log(dbgIter(dfs.postOrder()));
        console.log("");

        console.log("Reverse postorder: ");
        console.log(dbgIter(dfs.reversePost()));
      }
    }

    /**Represents a data type for
     *  determining whether an edge-weighted digraph has a directed cycle.
     *  The <em>hasCycle</em> operation determines whether the edge-weighted
     *  digraph has a directed cycle and, if so, the <em>cycle</em> operation
     *  returns one.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = has v been marked in dfs?
     * @property {array} edgeTo  edgeTo[v] = previous edge on path to v
     * @property {array} onStack onStack[v] = is vertex on the stack?
     * @property {Stack} mCycle directed cycle (or null if no such cycle)
     */
    class EdgeWeightedDirectedCycle{
      /**
       * Determines whether the edge-weighted digraph {@code G} has a directed cycle and,
       * if so, finds such a cycle.
       * @param G the edge-weighted digraph
       */
      constructor(G){
        _.assert(G instanceof EdgeWeightedDigraph,"Expected EdgeWeightedDigraph");
        this.bMarked  = new Array(G.V());
        this.onStack = new Array(G.V());
        this.edgeTo  = new Array(G.V());
        for(let v = 0; v < G.V(); v++)
          if(!this.bMarked[v]) this._dfs(G, v);
        //check();
      }
      // check that algorithm computes either the topological order or finds a directed cycle
      _dfs(G, v){
        this.onStack[v] = true;
        this.bMarked[v] = true;
        for(let w,e,it=G.adj(v).iterator();it.hasNext();){
          e=it.next();
          w= e.to();
          // short circuit if directed cycle found
          if(this.mCycle != null) return;
          // found new vertex, so recur
          else if(!this.bMarked[w]){
            this.edgeTo[w] = e;
            this._dfs(G, w);
          }
          // trace back directed cycle
          else if(this.onStack[w]){
            this.mCycle = new Stack();
            let f = e;
            while(f.from() != w){
              this.mCycle.push(f);
              f = this.edgeTo[f.from()];
            }
            this.mCycle.push(f);
            return;
          }
        }
        this.onStack[v] = false;
      }
      /**
       * Does the edge-weighted digraph have a directed cycle?
       * @return {@code true} if the edge-weighted digraph has a directed cycle,
       * {@code false} otherwise
       */
      hasCycle(){
        return this.mCycle != null;
      }
      /**
       * Returns a directed cycle if the edge-weighted digraph has a directed cycle,
       * and {@code null} otherwise.
       * @return a directed cycle (as an iterable) if the edge-weighted digraph
       *    has a directed cycle, and {@code null} otherwise
       */
      cycle(){
        return this.mCycle;
      }
      // certify that digraph is either acyclic or has a directed cycle
      check(){
        // edge-weighted digraph is cyclic
        if(this.hasCycle()){
          // verify cycle
          let first = null, last = null;
          for(let e, it=this.cycle().iterator(); it.hasNext();){
            if(first == null) first = e;
            if(last != null){
              if(last.to() != e.from())
                throw Error(`cycle edges ${last} and ${e} not incident\n`);
            }
            last = e;
          }
          if(last.to() != first.from())
            throw Error(`cycle edges ${last} and ${first} not incident\n`);
        }
        return true;
      }
      static test(){
        // create random DAG with V vertices and E edges; then add F random edges
        let V = 13,E=8, F=6;
        let G = new EdgeWeightedDigraph(V);
        let vertices = new Array(V);
        for(let i = 0; i < V; i++) vertices[i] = i;
        _.shuffle(vertices);
        for(let wt,v,w,i = 0; i < E; i++){
          do{
            v = _.randInt2(0,V);
            w = _.randInt2(0,V);
          }while(v >= w);
          wt = _.rand();
          G.addEdge(new DirectedEdge(v, w, wt));
        }
        // add F extra edges
        for(let i = 0; i < F; i++){
          G.addEdge(new DirectedEdge(_.randInt2(0,V),_.randInt2(0,V),_.rand()));
        }
        console.log(G.toString());
        // find a directed cycle
        let s,finder = new EdgeWeightedDirectedCycle(G);
        if(finder.hasCycle()){
          console.log("Cycle: " + dbgIter(finder.cycle()));
        }else{
          console.log("No directed cycle");
        }
      }
    }

    /**Represents a digraph, where the
     *  vertex names are arbitrary strings.
     *  By providing mappings between string vertex names and integers,
     *  it serves as a wrapper around the
     *  {@link Digraph} data type, which assumes the vertex names are integers
     *  between 0 and <em>V</em> - 1.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {ST} st string -> index
     * @property {array} keys index  -> string
     * @property {Graph} _graph the underlying digraph
     */
    class SymbolGraph{
      /**
       * Initializes a graph from a file using the specified delimiter.
       * Each line in the file contains
       * the name of a vertex, followed by a list of the names
       * of the vertices adjacent to that vertex, separated by the delimiter.
       * @param filename the name of the file
       * @param delimiter the delimiter between fields
       */
      constructor(data){
        this.st = new ST();
        // First pass builds the index by reading strings to associate distinct strings with an index
        data.forEach(row=> row.forEach((s,i)=>{
          if(!this.st.contains(s)) this.st.put(s, this.st.size())
        }));
        //inverted index to get string keys in an array
        this.keys = new Array(this.st.size());
        for(let n,it= this.st.keys().iterator();it.hasNext();){
          n=it.next();
          this.keys[this.st.get(n)] = n;
        }
        // second pass builds the graph by connecting first vertex on each line to all others
        this._graph = new Graph(this.st.size());
        data.forEach(row=>{
          let v = this.st.get(row[0]);
          for(let w,i = 1; i < row.length; ++i){
            w = this.st.get(row[i]);
            this._graph.addEdge(v, w);
          }
        })
      }
      /**
       * Does the graph contain the vertex named {@code s}?
       * @param s the name of a vertex
       * @return {@code true} if {@code s} is the name of a vertex, and {@code false} otherwise
       */
      contains(s){
        return this.st.contains(s);
      }
      /**
       * Returns the integer associated with the vertex named {@code s}.
       * @param s the name of a vertex
       * @return the integer (between 0 and <em>V</em> - 1) associated with the vertex named {@code s}
       */
      indexOf(s){
        return this.st.get(s);
      }
      /**
       * Returns the name of the vertex associated with the integer {@code v}.
       * @param  v the integer corresponding to a vertex (between 0 and <em>V</em> - 1)
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       * @return the name of the vertex associated with the integer {@code v}
       */
      nameOf(v){
        _validateVertex(v,this._graph.V());
        return this.keys[v];
      }
      /**
       * Returns the graph assoicated with the symbol graph. It is the client's responsibility
       * not to mutate the graph.
       * @return the graph associated with the symbol graph
       */
      graph(){
        return this._graph;
      }
      static test(){
        let data=`JFK MCO
                  ORD DEN
                  ORD HOU
                  DFW PHX
                  JFK ATL
                  ORD DFW
                  ORD PHX
                  ATL HOU
                  DEN PHX
                  PHX LAX
                  JFK ORD
                  DEN LAS
                  DFW HOU
                  ORD ATL
                  LAS LAX
                  ATL MCO
                  HOU MCO
                  LAS PHX`.split(/\s+/);
        let sg = new SymbolGraph(_.partition(2,data));
        let graph = sg.graph();
        ["JFK","LAX"].forEach(k=>{
          if(sg.contains(k)){
            let s = sg.indexOf(k);
            console.log(k)
            for(let v,it= graph.adj(s).iterator(); it.hasNext();)
              console.log("   " + sg.nameOf(it.next()));
          }else{
            console.log("input not contain '" + k + "'");
          }
        });
      }
    }

    /**Represents a digraph, where the
     *  vertex names are arbitrary strings.
     *  By providing mappings between string vertex names and integers,
     *  it serves as a wrapper around the
     *  {@link Digraph} data type, which assumes the vertex names are integers
     *  between 0 and <em>V</em> - 1.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {ST} st string -> index
     * @property {array} keys index  -> string
     * @property {Digraph} graph the underlying digraph
     */
    class SymbolDigraph{
      /**
       * Initializes a digraph from a file using the specified delimiter.
       * Each line in the file contains
       * the name of a vertex, followed by a list of the names
       * of the vertices adjacent to that vertex, separated by the delimiter.
       * @param filename the name of the file
       * @param delimiter the delimiter between fields
       */
      constructor(data){
        this.st = new ST();
        // First pass builds the index by reading strings to associate
        // distinct strings with an index
        data.forEach(row=> row.forEach(s=>{
          if(!this.st.contains(s))
            this.st.put(s, this.st.size())
        }));
        // inverted index to get string keys in an array
        this.keys = new Array(this.st.size());
        for(let n,it=this.st.keys().iterator();it.hasNext();){
          n=it.next();
          this.keys[this.st.get(n)] = n;
        }
        // second pass builds the digraph by connecting first vertex on each
        // line to all others
        this.graph = new Digraph(this.st.size());
        data.forEach(row=> {
          let v = this.st.get(row[0]);
          for(let w,i = 1; i < row.length; i++){
            w = this.st.get(row[i]);
            this.graph.addEdge(v, w);
          }
        });
      }
      /**
       * Does the digraph contain the vertex named {@code s}?
       * @param s the name of a vertex
       * @return {@code true} if {@code s} is the name of a vertex, and {@code false} otherwise
       */
      contains(s){
        return this.st.contains(s);
      }
      /**
       * Returns the integer associated with the vertex named {@code s}.
       * @param s the name of a vertex
       * @return the integer (between 0 and <em>V</em> - 1) associated with the vertex named {@code s}
       */
      indexOf(s){
        return this.st.get(s);
      }
      /**
       * Returns the name of the vertex associated with the integer {@code v}.
       * @param  v the integer corresponding to a vertex (between 0 and <em>V</em> - 1)
       * @return the name of the vertex associated with the integer {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      nameOf(v){
        _validateVertex(v, this.graph.V());
        return this.keys[v];
      }
      /**
       * Returns the digraph assoicated with the symbol graph. It is the client's responsibility
       * not to mutate the digraph.
       *
       * @return the digraph associated with the symbol digraph
       */
      digraph(){
        return this.graph;
      }
      static test(){
        let s=`JFK MCO
              ORD DEN
              ORD HOU
              DFW PHX
              JFK ATL
              ORD DFW
              ORD PHX
              ATL HOU
              DEN PHX
              PHX LAX
              JFK ORD
              DEN LAS
              DFW HOU
              ORD ATL
              LAS LAX
              ATL MCO
              HOU MCO
              LAS PHX`.split(/\s+/);
        let data=[];
        for(let i=0;i<s.length;i+=2) data.push([s[i],s[i+1]]);
        let sg = new SymbolDigraph(data);
        let G = sg.digraph();
        ["JFK","ATL","LAX"].forEach(x=>{
          let z=G.adj(sg.indexOf(x)), it=z?z.iterator():null;
          if(it)while(it.hasNext()){
            console.log("   " + sg.nameOf(it.next()));
          }
        });
      }
    }

    /**Represents a data type for
     *  determining a topological order of a <em>directed acyclic graph</em> (DAG).
     *  A digraph has a topological order if and only if it is a DAG.
     *  The <em>hasOrder</em> operation determines whether the digraph has
     *  a topological order, and if so, the <em>order</em> operation
     *  returns one.
     * @memberof module:mcfud/algo_graph
     * @class
     */
    class Topological{
      /**
       * Determines whether the digraph {@code G} has a topological order and, if so,
       * finds such a topological order.
       * @param G the digraph
       */
      constructor(G){
        this._order=null;
        this.rank=null;
        if(G instanceof Digraph){
          let finder = new DirectedCycle(G);
          if(!finder.hasCycle()){
            let dfs = new DepthFirstOrder(G);
            this._order = dfs.reversePost();
            this.rank = new Array(G.V());
            for(let v,i=0,it=this._order.iterator(); it.hasNext();) this.rank[it.next()] = i++;
          }
        }else if(G instanceof EdgeWeightedDigraph){
          let finder = new EdgeWeightedDirectedCycle(G);
          if(!finder.hasCycle()){
              let dfs = new DepthFirstOrder(G);
              this._order = dfs.reversePost();
          }
        }
      }
      /**
       * Returns a topological order if the digraph has a topologial order,
       * and {@code null} otherwise.
       * @return a topological order of the vertices (as an interable) if the
       *    digraph has a topological order (or equivalently, if the digraph is a DAG),
       *    and {@code null} otherwise
       */
      order(){
        return this._order;
      }
      /**
       * Does the digraph have a topological order?
       * @return {@code true} if the digraph has a topological order (or equivalently,
       *    if the digraph is a DAG), and {@code false} otherwise
       */
      hasOrder(){
        return this._order != null;
      }
      /**
       * The the rank of vertex {@code v} in the topological order;
       * -1 if the digraph is not a DAG
       *
       * @param v the vertex
       * @return the position of vertex {@code v} in a topological order
       *    of the digraph; -1 if the digraph is not a DAG
       * @throws Error unless {@code 0 <= v < V}
       */
      rank(v){
        _validateVertex(v,this.rank.length);
        if(this.hasOrder()) return this.rank[v];
        else return -1;
      }
      static test(){
        let sg = new SymbolDigraph(
        [[`Algorithms`,`Theoretical CS`,`Databases`,`Scientific Computing`],
[`Introduction to CS`,`Advanced Programming`,`Algorithms`],
[`Advanced Programming`,`Scientific Computing`],
[`Scientific Computing`,`Computational Biology`],
[`Theoretical CS`,`Computational Biology`,`Artificial Intelligence`],
[`Linear Algebra`,`Theoretical CS`],
[`Calculus`,`Linear Algebra`],
[`Artificial Intelligence`,`Neural Networks`,`Robotics`,`Machine Learning`],
[`Machine Learning`,`Neural Networks`]]);
        let topological = new Topological(sg.digraph());
        for(let v,it=topological.order().iterator(); it.hasNext();){
          console.log(sg.nameOf(it.next()));
        }
      }
    }

    /**Represents a data type for solving the
     *  single-source shortest paths problem in edge-weighted digraphs
     *  where the edge weights are non-negative.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} marked  marked[v] = true iff v is reachable from s
     * @property {array} edgeTo  edgeTo[v] = last edge on path from s to v
     * @property {number} s source vertex
     */
    class DepthFirstDirectedPaths{
      /**
       * Computes a directed path from {@code s} to every other vertex in digraph {@code G}.
       * @param  G the digraph
       * @param  s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        this.edgeTo = new Array(G.V());
        this.s = s;
        _validateVertex(s,this.bMarked.length);
        this._dfs(G, s);
      }
      _dfs(G, v){
        this.bMarked[v] = true;
        for(let w,it= G.adj(v).iterator();it.hasNext();){
          w=it.next();
          if(!this.bMarked[w]){
            this.edgeTo[w] = v;
            this._dfs(G, w);
          }
        }
      }
      /**
       * Is there a directed path from the source vertex {@code s} to vertex {@code v}?
       * @param  v the vertex
       * @return {@code true} if there is a directed path from the source
       *         vertex {@code s} to vertex {@code v}, {@code false} otherwise
       * @throws Error unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns a directed path from the source vertex {@code s} to vertex {@code v}, or
       * {@code null} if no such path.
       * @param  v the vertex
       * @return the sequence of vertices on a directed path from the source vertex
       *         {@code s} to vertex {@code v}, as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this.bMarked.length);
        if(!this.hasPathTo(v)) return null;
        let path = new Stack();
        for(let x = v; x != this.s; x = this.edgeTo[x]) path.push(x);
        path.push(this.s);
        return path;
      }
      static test(){
        let D=`4  2 2  3 3  2 6  0 0  1 2  0 11 12 12  9 9 10
              9 11 7  9 10 12 11  4 4  3 3  5 6
              8 8  6 5  4 0  5 6  4 6  9 7  6`.split(/\s+/).map(n=>{return +n});
        let s=3,G = Digraph.load(13,D);
        let msg, dfs = new DepthFirstDirectedPaths(G, s);
        for(let v = 0; v < G.V(); v++){
          if(dfs.hasPathTo(v)){
            msg= `${s} to ${v}:  `;
            for(let x,it= dfs.pathTo(v).iterator();it.hasNext();){
              x=it.next();
              if(x == s) msg += `${x}`;
              else msg += `-${x}`;
            }
            console.log(msg);
          }else{
            console.log(`${s} to ${v}:  not connected\n`);
          }
        }
      }
    }

    /**Represents a data type for solving the
     *  single-source shortest paths problem in edge-weighted digraphs
     *  where the edge weights are non-negative.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} marked marked[v] = is there an s->v path?
     * @property {array} edgeTo edgeTo[v] = last edge on shortest s->v path
     * @property {array} distTo distTo[v] = length of shortest s->v path
     */
    class BreadthFirstDirectedPaths{
      /**Computes the shortest path from {@code s} and every other vertex in graph {@code G}.
       * @param G the digraph
       * @param s the source vertex
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      constructor(G, s){
        if(!is.vec(s)) s= [s];
        this.bMarked = new Array(G.V());
        this.mDistTo = new Array(G.V());
        this.edgeTo = new Array(G.V());
        for(let v = 0; v < G.V(); v++)
          this.mDistTo[v] = Infinity;
        this._validateVertices(s);
        this._bfs(G, s);
      }
      _bfs(G, sources){
        let q = new Queue();
        sources.forEach(s=>{
          this.bMarked[s] = true;
          this.mDistTo[s] = 0;
          q.enqueue(s);
        });
        while(!q.isEmpty()){
          let v = q.dequeue();
          for(let w, it= G.adj(v).iterator();it.hasNext();){
            w=it.next();
            if(!this.bMarked[w]){
              this.edgeTo[w] = v;
              this.mDistTo[w] = this.mDistTo[v] + 1;
              this.bMarked[w] = true;
              q.enqueue(w);
            }
          }
        }
      }
      /**Is there a directed path from the source {@code s} (or sources) to vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a directed path, {@code false} otherwise
       * @throws Error unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns the number of edges in a shortest path from the source {@code s}
       * (or sources) to vertex {@code v}?
       * @param v the vertex
       * @return the number of edges in such a shortest path
       *         (or {@code Integer.MAX_VALUE} if there is no such path)
       * @throws Error unless {@code 0 <= v < V}
       */
      distTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.mDistTo[v];
      }
      /**
       * Returns a shortest path from {@code s} (or sources) to {@code v}, or
       * {@code null} if no such path.
       * @param v the vertex
       * @return the sequence of vertices on a shortest path, as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this.bMarked.length);
        if(!this.hasPathTo(v)) return null;
        let x,path = new Stack();
        for(x = v; this.mDistTo[x] != 0; x = this.edgeTo[x]) path.push(x);
        path.push(x);
        return path;
      }
      _validateVertices(vertices){
        if(!vertices)
          throw Error("argument is null");
        let cnt=0,
            V = this.bMarked.length;
        vertices.forEach(v=>{
          ++cnt;
          _validateVertex(v,V);
        });
        if(cnt == 0)
          throw Error("zero vertices");
      }
      static test(){
       let D=`4  2 2  3 3  2 6  0 0  1 2  0 11 12 12  9 9 10
              9 11 7  9 10 12 11  4 4  3 3  5 6
              8 8  6 5  4 0  5 6  4 6  9 7  6`.split(/\s+/).map(n=>{return +n});
        let s=3,G = Digraph.load(13,D);
        //console.log(G.toString());
        let msg,bfs = new BreadthFirstDirectedPaths(G,s);
        for(let v = 0; v < G.V(); v++){
          msg="";
          if(bfs.hasPathTo(v)){
            msg= `${s} to ${v} (${bfs.distTo(v)}):  `;
            for(let x,it= bfs.pathTo(v).iterator();it.hasNext();){
              x=it.next();
              if(x == s) msg+= `${x}`;
              else msg += `->${x}`;
            }
            console.log(msg);
          }else{
            console.log(`${s} to ${v} (-):  not connected\n`);
          }
        }
      }
    }

    /**Represents a data type for solving the
     *  single-source shortest paths problem in edge-weighted digraphs
     *  where the edge weights are non-negative.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} distTo   distTo[v] = distance  of shortest s->v path
     * @property {array} edgeTo   edgeTo[v] = last edge on shortest s->v path
     * @property {IndexMinPQ} pq priority queue of vertices
     */
    class DijkstraSP{
      /**
       * Computes a shortest-paths tree from the source vertex {@code s} to every other
       * vertex in the edge-weighted digraph {@code G}.
       *
       * @param  G the edge-weighted digraph
       * @param  s the source vertex
       * @throws Error if an edge weight is negative
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s,compareFn){
        _.assert(G instanceof EdgeWeightedDigraph,"Expected EdgeWeightedDigraph");
        for(let e,it=G.edges().iterator();it.hasNext();){
          e=it.next();
          if(e.weight() < 0)
            throw Error(`edge ${e} has negative weight`);
        }
        this._distTo = new Array(G.V());
        this.edgeTo = new Array(G.V());
        _validateVertex(s, G.V());
        for(let v = 0; v < G.V(); v++)
          this._distTo[v] = Infinity;
        this._distTo[s] = 0.0;
        // relax vertices in order of distance from s
        this.pq = new IndexMinPQ(G.V(),compareFn);
        this.pq.insert(s, this._distTo[s]);
        while(!this.pq.isEmpty()){
          let v = this.pq.delMin();
          for(let it=G.adj(v).iterator(); it.hasNext();)
            this._relax(it.next());
        }
        // check optimality conditions
        //assert check(G, s);
      }
      // relax edge e and update pq if changed
      _relax(e){
        let v = e.from(), w = e.to();
        if(this._distTo[w] > this._distTo[v] + e.weight()){
          this._distTo[w] = this._distTo[v] + e.weight();
          this.edgeTo[w] = e;
          if(this.pq.contains(w)) this.pq.decreaseKey(w, this._distTo[w]);
          else this.pq.insert(w, this._distTo[w]);
        }
      }
      /**
       * Returns the length of a shortest path from the source vertex {@code s} to vertex {@code v}.
       * @param  v the destination vertex
       * @return the length of a shortest path from the source vertex {@code s} to vertex {@code v};
       *         {@code Double.POSITIVE_INFINITY} if no such path
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      distTo(v){
        _validateVertex(v,this._distTo.length);
        return this._distTo[v];
      }
      /**
       * Returns true if there is a path from the source vertex {@code s} to vertex {@code v}.
       *
       * @param  v the destination vertex
       * @return {@code true} if there is a path from the source vertex
       *         {@code s} to vertex {@code v}; {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this._distTo.length);
        return this._distTo[v] < Infinity;
      }
      /**
       * Returns a shortest path from the source vertex {@code s} to vertex {@code v}.
       *
       * @param  v the destination vertex
       * @return a shortest path from the source vertex {@code s} to vertex {@code v}
       *         as an iterable of edges, and {@code null} if no such path
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this._distTo.length);
        if(!this.hasPathTo(v)) return null;
        let path = new Stack();
        for(let e = this.edgeTo[v]; e != null; e = this.edgeTo[e.from()]){
          path.push(e);
        }
        return path;
      }
      // check optimality conditions:
      // (i) for all edges e:            distTo[e.to()] <= distTo[e.from()] + e.weight()
      // (ii) for all edge e on the SPT: distTo[e.to()] == distTo[e.from()] + e.weight()
      check(G, s){
        // check that edge weights are non-negative
        for(let e,it=G.edges().iterator();it.hasNext();){
          if(it.next().weight() < 0)
            throw Error("negative edge weight detected");
        }
        // check that distTo[v] and edgeTo[v] are consistent
        if(this._distTo[s] != 0.0 || this.edgeTo[s] != null)
          throw Error("distTo[s] and edgeTo[s] inconsistent");
        ////
        for(let v = 0; v < G.V(); v++){
          if(v == s) continue;
          if(this.edgeTo[v] == null && this._distTo[v] != Infinity)
            throw Error("distTo[] and edgeTo[] inconsistent");
        }
        // check that all edges e = v->w satisfy distTo[w] <= distTo[v] + e.weight()
        for(let v = 0; v < G.V(); v++){
          for(let w,e,it=G.adj(v).iterator();it.hasNext();){
            e=it.next();
            w = e.to();
            if(this._distTo[v] + e.weight() < this._distTo[w])
              throw Error(`edge ${e} not relaxed`);
          }
        }
        // check that all edges e = v->w on SPT satisfy distTo[w] == distTo[v] + e.weight()
        for(let v,e,w = 0; w < G.V(); w++){
          if(this.edgeTo[w] == null) continue;
          e = this.edgeTo[w];
          v = e.from();
          if(w != e.to()) throw Error("bad");
          if(this._distTo[v] + e.weight() != this._distTo[w])
            throw Error(`edge ${e} on shortest path not tight`);
        }
        return true;
      }
      static test(){
        let data= `4 5 0.35
                  5 4 0.35
                  4 7 0.37
                  5 7 0.28
                  7 5 0.28
                  5 1 0.32
                  0 4 0.38
                  0 2 0.26
                  7 3 0.39
                  1 3 0.29
                  2 7 0.34
                  6 2 0.40
                  3 6 0.52
                  6 0 0.58
                  6 4 0.93`.split(/\s+/).map(n=>{return +n});
        let G = EdgeWeightedDigraph.load(8,data);
        //console.log(G.toString());
        let s=0,sp = new DijkstraSP(G, s,CMP);
        // print shortest path
        for(let t = 0; t < G.V(); t++){
          if(sp.hasPathTo(t)){
            console.log(`${s} to ${t} (${Number(sp.distTo(t)).toFixed(2)})  ${dbgIter(sp.pathTo(t))}`);
          }else{
            console.log(`${s} to ${t}         no path\n`);
          }
        }
      }
    }

    //DepthFirstDirectedPaths.test();
    //BreadthFirstDirectedPaths.test();
    //SymbolGraph.test();
    //DijkstraSP.test();
    //Topological.test();
    //SymbolDigraph.test();
    //EdgeWeightedDirectedCycle.test();
    //DepthFirstOrder.test();
    //EdgeWeightedDigraph.test();
    //DirectedEdge.test();
    //DirectedCycle.test();
    //DirectedDFS.test();
    //Digraph.test();
    //CC.test();
    //EdgeWeightedGraph.test();
    //Edge.test();
    //BreadthFirstPaths.test();
    //DepthFirstPaths.test();
    //NonrecursiveDFS.test();
    //DepthFirstSearch.test();
    //Graph.test();

    const _$={
      DepthFirstDirectedPaths,
      BreadthFirstDirectedPaths,
      SymbolGraph,
      DijkstraSP,
      Topological,
      SymbolDigraph,
      EdgeWeightedDirectedCycle,
      DepthFirstOrder,
      EdgeWeightedDigraph,
      DirectedEdge,
      DirectedCycle,
      DirectedDFS,
      Digraph,
      CC,
      EdgeWeightedGraph,
      Edge,
      BreadthFirstPaths,
      DepthFirstPaths,
      NonrecursiveDFS,
      DepthFirstSearch,
      Graph
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./basic"), require("./sort"))
  }else{
    gscope["io/czlab/mcfud/algo/graph"]=_module
  }

})(this);



// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2020-2021, Kenneth Leung. All rights reserved.

;(function(gscope){
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  "use strict";
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  /**Creates the module.
   */
  function _module(Core,Colors){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!Colors){
      throw "Fatal: No Colors!"
    }
    const {is,u:_}=Core;

    /** @module mcfud/test */

    /**
     * @typedef {object} TestSuiteObject
     * @property {function} ensure(name,func)
     * @property {function} eerror(name,func)
     * @property {function} begin(set-up)
     * @property {function} end(tear-down)
     */

    /**
     * @typedef {object} TestSuiteReport
     * @property {string} title
     * @property {string} date
     * @property {number} total
     * @property {number} duration
     * @property {any[]} passed
     * @property {any[]} skippd
     * @property {any[]} failed
     */

    /**Checks for non-failure. */
    function _f(s){ return !s.startsWith("F") }

    /**Make a string. */
    function rstr(len,ch){
      let out="";
      while(len>0){
        out += ch; --len }
      return out;
    }

    /**Check if valid exception was thrown. */
    function ex_thrown(expected,e){
      let out=t_bad;
      if(e){
        if(is.str(expected)){
          out= expected==="any" || expected===e ? t_ok : t_bad
        }else if(expected instanceof e){ out=t_ok }
      }
      return out;
    }

    /**Run the given form and check its result. */
    function ensure_eq(env,name,form){
      return new Promise((resolve,reject)=>{
        let out;
        try{
          out=form.call(env);
          if(out instanceof Promise){
            out.then(function(res){
              resolve(`${res?t_ok:t_bad}: ${name}`);
            })
          }else{
            out= out ? (out===709394?t_skip:t_ok) : t_bad;
            resolve(`${out}: ${name}`);
          }
        }catch(e){
          out= t_bad;
          resolve(`${out}: ${name}`);
        }
      })
    }

    /** Run the given form and check if exception was thrown. */
    function ensure_ex(env,name,form,error){
      return new Promise((resolve,reject)=>{
        let out;
        try{
          out=form.call(env);
          out=out===709394?t_ok:ex_thrown(error,null);
        }catch(e){
          out=ex_thrown(error,e) }
        resolve(`${out}: ${name}`);
      })
    }

    /**
     * @private
     * @var {string}
     */
    const [t_skip,t_bad,t_ok]=["Skippd", "Failed", "Passed"];

    const _$={
      /**Print report to stdout.
       * @memberof module:mcfud/test
       * @param {TestSuiteReport} r
       */
      prn(r){
        const ok= r.passed.length;
        const sum=r.total;
        const perc=ok/sum*100;
        console.log(Colors.white(rstr(78,"+")));
        console.log(Colors.white.bold(r.title));
        console.log(Colors.white(r.date));
        console.log(Colors.white(rstr(78,"+")));
        if(r.passed.length>0)
          console.log(Colors.green(r.passed.join("\n")));
        if(r.skippd.length>0)
          console.log(Colors.grey(r.skippd.join("\n")));
        if(r.failed.length>0)
          console.log(Colors.magenta(r.failed.join("\n")));
        console.log(Colors.white(rstr(78,"=")));
        console.log(Colors.yellow(["Passed: ",ok,"/",sum," [",perc|0,"%]"].join("")));
        console.log(Colors.magenta(`Failed: ${sum-ok}`));
        console.log(Colors.white(["cpu-time: ",_.prettyMillis(r.duration)].join("")));
        console.log(Colors.white(rstr(78,"=")));
      },
      /**Define a test suite.
       * @memberof module:mcfud/test
       * @param {string} name
       * @return {TestSuiteObject}
       */
      deftest(name){
        let [iniz,finz,arr,env]= [null,null,null,null];
        const x={
          ensure(n,f){
            arr.push([1,n,f]);
            return x;
          },
          eerror(n,f){
            arr.push([911,n,f]);
            return x;
          },
          begin(f){
            env={};
            arr=[];
            iniz=f;
            return x;
          },
          end(f){
            finz=f;
            let F=function(){
              return new Promise((RR,j)=>{
                iniz && iniz(env);
                let _prev,out=[];
                for(let p,a,i=0;i<arr.length;++i){
                  a=arr[i];
                  switch(a[0]){
                    case 1: p=ensure_eq(env,a[1],a[2]); break;
                    case 911: p=ensure_ex(env,a[1],a[2],"any"); break; }
                  if(!_prev){_prev=p}else{
                    _prev= _prev.then(function(msg){
                      out.push(msg);
                      return p;
                    });
                  }
                }
                if(_prev){
                  _prev.then(function(msg){
                    out.push(msg);
                    arr.length=0;
                    finz && finz(env);
                    RR(out);
                  });
                }
              });
            };
            return (F.title=name) && F;
          }
        };
        return x;
      },
      /** @ignore */
      _run(test){
        return new Promise((resolve,reject)=>{
          test().then(function(arr){
            resolve(arr);
          });
        })
      },
      /**Execute this test suite.
       * @memberof module:mcfud/test
       * @param {function} test
       * @param {string} title
       * @return {Promise}
       */
      runtest(test,title){
        const mark= Date.now();
        return this._run(test).then(function(res){
          const mark2= Date.now();
          const out={
            title: title||test.title,
            date: new Date().toString(),
            total: res.length,
            duration: mark2-mark,
            passed: res.filter(s=>s[0]==="P"),
            skippd: res.filter(s=>s[0]==="S"),
            failed: res.filter(s=>s[0]==="F")
          };
          return new Promise((resolve)=>{
            resolve(out);
          })
        })
      }
    };

    return _$;
  }
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"), require("colors/safe"))
  }else{
    gscope["io/czlab/mcfud/test"]= _module
  }

})(this);


