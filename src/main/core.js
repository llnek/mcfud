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
 * Copyright © 2025, Kenneth Leung. All rights reserved. */


;(function(window,doco,seed_rand,UNDEF){

  "use strict";

  if(typeof module=="object" && module.exports){
    //seed_rand=require("../tpcl/seedrandom.min")
  }else{
    doco=window.document
  }

  /**Create the module.
  */
  function _module(){

    const root=window,
          int=Math.floor,
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
    function isEven(n){ return (n<0?-n:n)%2 == 0 }
    function isUndef(o){ return o===undefined }
    function isColl(o){ return isVec(o)||isMap(o)||isObj(o) }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //original source from https://developer.mozilla.org
    function completeAssign(target, source){
      let descriptors = Object.keys(source).reduce((acc, key)=>{
        acc[key] = Object.getOwnPropertyDescriptor(source, key);
        return acc;
      }, {});
      // By default, Object.assign copies enumerable Symbols, too
      Object.getOwnPropertySymbols(source).forEach(sym=>{
        let d= Object.getOwnPropertyDescriptor(source, sym);
        if(d.enumerable)
          descriptors[sym] = d;
      });
      return Object.defineProperties(target, descriptors);
    }

    /**
     * @module mcfud/core
     */

    const GOLDEN_RATIO=1.6180339887;
    const PRNG=(function(){
      if(seed_rand)
        return seed_rand();
      if(Math.seedrandom)
        return new Math.seedrandom();
      return function(){ return Math.random() }
    })();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _randXYInclusive(min,max){
      return min + int(PRNG() * (max-min+1))
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _preAnd(conds,msg){
      conds.forEach(c=>{
        if(!c[0](c[1]))
          throw new TypeError(`wanted ${msg}`)
      });
      return true
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _preOr(conds,msg){
      for(let c,i=0;i<conds.length;++i){
        c=conds[i];
        if(c[0](c[1])){return true}
      }
      throw new TypeError(`wanted ${msg}`)
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _pre(f,arg,msg){
      if(!f(arg))
        throw new TypeError(`wanted ${msg}`);
      return true
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //-- regex handling file names
    const BNAME=/(\/|\\\\)([^(\/|\\\\)]+)$/g;
    //-- regex handling file extensions
    const FEXT=/(\.[^\.\/\?\\]*)(\?.*)?$/;

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _fext(path,incdot){
      let t=FEXT.exec(path);
      if(t && t[1]){
        t= t[1].toLowerCase();
        if(!incdot) t=t.substring(1);
      }else{ t="" }
      return t;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _everyF(F,_1,args){
      const b=F(_1);
      switch(args.length){
        case 0: return b;
        case 1: return b && F(args[0]);
        case 2: return b && F(args[0]) && F(args[1]);
        case 3: return b && F(args[0]) && F(args[1]) && F(args[2]);
        default: return b && args.every(x => F(x));
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const EPSILON= 0.0000000001;
    let _seqNum= 0;
    const _$={};

    /** @namespace module:mcfud/core.is */
    const is={
      /**Check if input(s) are type `function`.
       * @memberof module:mcfud/core.is
       * @param {any} f anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      fun(f, ...args){ return _everyF(isFun,f,args) },
      /**Check if input(s) are type `string`.
       * @memberof module:mcfud/core.is
       * @param {any} s anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      str(s, ...args){ return _everyF(isStr,s,args) },
      //void0(obj){ return obj === void 0 },
      /**Check if input(s) are type `undefined`.
       * @memberof module:mcfud/core.is
       * @param {any} obj anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      undef(o, ...args){ return _everyF(isUndef,o,args) },
      /**Check if input(s) are type `Map`.
       * @memberof module:mcfud/core.is
       * @param {any} m anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      map(m, ...args){ return _everyF(isMap,m,args) },
      /**Check if input(s) are type `Set`.
       * @memberof module:mcfud/core.is
       * @param {any} m anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      set(s, ...args){ return _everyF(isSet,s,args) },
      /**Check if input(s) are type `number`.
       * @memberof module:mcfud/core.is
       * @param {any} n anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      num(n, ...args){ return _everyF(isNum,n,args) },
      /**Check if input is a boolean.
       * @memberof module:mcfud/core.is
       * @param {boolean} n
       * @return {boolean}
       */
      bool(n, ...args){ return _everyF(isBool,n,args) },
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
      vec(v, ...args){ return _everyF(isVec,v,args) },
      /**Check if input is type `array` and is same or at least the size of `len`.
       * @memberof module:mcfud/core.is
       * @param {any} v anything
       * @param {number} len min size
       * @param {boolean} must true if must match exact size
       * @return {boolean}
       */
      vecN(v,len,must=false){
        return isVec(v) && (must ? v.length==len : v.length >= len)
      },
      /**Check if input(s) are type `object`.
       * @memberof module:mcfud/core.is
       * @param {any} o anything
       * @param {...any} args more of anything
       * @return {boolean}
       */
      obj(o, ...args){ return _everyF(isObj,o,args) },
      /**Check if this collection is `not empty`.
       * @memberof module:mcfud/core.is
       * @param {object|array|map} o
       * @return {boolean}
       */
      notEmpty(o){ return _.size(o) > 0 },
      /**Check if this collection is `empty`.
       * @memberof module:mcfud/core.is
       * @param {object|array|map} o
       * @return {boolean}
       */
      isEmpty(o){ return _.size(o) == 0 },
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
      SORT_DESC: 1,
      SORT_ASC: -1,
      /** error message */
      error(...args){ console.error(...args) },
      /** warn message */
      warn(...args){ console.warn(...args) },
      /** log message */
      log(...args){ console.log(...args) },
      /**
       * @param {Error} e
       * @return stack trace
       */
      prnStk(e){
        let m;
        try{ m=e.stack; }catch(x){}
        return ["", m || (new Error()).stack].join("");
      },
      /**Divide this number as integer.
       * @memberof module:mcfud/core._
       * @param {number} a
       * @param {number} b
       * @return {number} integer result
       */
      ndiv(a,b){
        return Math.floor(a/b)
      },
      /**Check if this float approximates zero.
       * @memberof module:mcfud/core._
       * @param {number} a
       * @return {boolean}
       */
      feq0(a){
        return a >= -EPSILON && a <= EPSILON;
      },
      /**Check if these 2 floats are equal.
       * @memberof module:mcfud/core._
       * @param {number} a
       * @param {number} b
       * @param {number} diff [EPSILON]
       * @return {boolean}
       */
      feq(a, b, diff=EPSILON){
        //return Math.abs(a-b) < EPSILON
        return a >= b-diff && a <= b+diff;
      },
      /**Convert hex string to binary string.
       * @memberof module:mcfud/core._
       * @param {string} s
       * @return {string} binary str
       */
      hexToBin(s){
        const Table = {
          "0": "0000", "1": "0001", "2": "0010", "3": "0011", "4": "0100",
          "5": "0101", "6": "0110", "7": "0111", "8": "1000", "9": "1001",
          "a": "1010", "b": "1011", "c": "1100", "d": "1101", "e": "1110", "f": "1111",
          "A": "1010", "B": "1011", "C": "1100", "D": "1101", "E": "1110", "F": "1111"
        };
        let ret="";
        for(let n,i=0; i<s.length; ++i){
          if(n=Table[s[i]]){
            ret += n;
          }else{
            ret=UNDEF;
            break;
          }
        }
        return ret;
      },
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
      p2(x=0,y=0){ return {x, y} },
      /**Unless n is a number, return it else 0.
       * @memberof module:mcfud/core._
       * @param {number} n
       * @return {number} n or 0
       */
      numOrZero(n){ return isNaN(n) ? 0 : n },
      /**Set values to array.
       * @memberof module:mcfud/core._
       * @param {array} a
       * @param {...any} args
       * @return {array} a
       */
      setVec(a, ...args){
        args.forEach((v,i)=> a[i]=v);
        return a;
      },
      /**If not even, make it even either smaller or bigger.
       * @memberof module:mcfud/core._
       * @param {number} n
       * @param {boolean} dir false smaller, true bigger
       * @return {number}
       */
      evenN(n,dir=false){
        n=int(n);
        return isEven(n)?n:(dir?n+1:n-1) },
      /**Check if a is null or undefined - `not real`.
       * @memberof module:mcfud/core._
       * @param {any} a
       * @return {boolean}
       */
      nichts(a){return a===undefined||a===null},
      /**Check if a is not null and not undefined.
       * @memberof module:mcfud/core._
       * @param {any} a
       * @return {boolean}
       */
      echt(a){return a!==undefined&&a!==null},
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
       * @param {boolean} wrap
       * @return {number}
       */
      percentRemain(amt, total, wrap=false){
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
      /**Items in a as keys, mapped to items in b as values.
       * @memberof module:mcfud/core._
       * @param {array} a
       * @param {array} b
       * @param {Map} out [undefined]
       * @return {Map}
       */
      zipMap(a,b,out=UNDEF){
        let n=Math.min(a.length,b.length),
            i,m= out || new Map();
        for(i=0;i<n;++i){
          m.set(a[i],b[i])
        }
        return m;
      },
      /**Items in a as keys, mapped to items in b as values.
       * @memberof module:mcfud/core._
       * @param {array} a
       * @param {array} b
       * @param {Map} out [undefined]
       * @return {Map}
       */
      zip(a,b,out=UNDEF){
        return this.zipMap(a,b,out)
      },
      /**Items in a as keys, mapped to items in b as values.
       * @memberof module:mcfud/core._
       * @param {array} a
       * @param {array} b
       * @param {Object} out [undefined]
       * @return {Object}
       */
      zipObj(a,b,out=UNDEF){
        let n=Math.min(a.length,b.length),
            i,m= out || {};
        for(i=0;i<n;++i){
          m[a[i]]= b[i];
        }
        return m;
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
      /**Copy these keys from object/map.
       * @memberof module:mcfud/core._
       * @param {object|map} des
       * @param {object|map} src
       * @param {string[]} keys to copy
       * @return {object|map} des
       */
      copyKeys(des,src,keys){
        _preOr([[isMap,des],[isObj,des]],"map/object");
        if(src instanceof Map)
          _.assert(des instanceof Map, "expected Map");
        this.seq(keys).forEach(k=>{
          if(isMap(src)){
            src.has(k) && des.set(k, src.get(k));
          }else if(is.own(src,k)){
            des[k]=src[k]
          }else if(src[k] !== undefined){
            des[k]=src[k];
          }
        });
        return des;
      },
      /**Set a value to many keys
       * @memberof module:mcfud/core._
       * @param {object|map} c
       * @param {string[]} keys to be set
       * @param {any} v
       * @return {object|map} c
       */
      setManyKeys(c,keys,v){
        _preOr([[isMap,c],[isObj,c]],"map/object");
        this.seq(keys).forEach(k=>{
          if(isMap(c)){
            c.set(k, v)
          }else{
            c[k]=v
          }
        });
        return c;
      },
      /**Clear out these keys
       * @memberof module:mcfud/core._
       * @param {object|map} c
       * @param {string[]} keys to be removed
       * @return {object|map} c
       */
      clearKeys(c,keys){
        _preOr([[isMap,c],[isObj,c]],"map/object");
        this.seq(keys).forEach(k=>{
          if(isMap(c)){
            c.delete(k)
          }else{
            delete c[k]
          }
        });
        return c;
      },
      /**Assert that the condition is not true.
       * @memberof module:mcfud/core._
       * @param {any} a boolean expression
       * @param {...any} anything
       * @throws Error if condition is true
       * @return {boolean} true
       */
      assertNot(cond, ...args){
        return this.assert(!cond,...args)
      },
      /**Assert that the condition is true.
       * @memberof module:mcfud/core._
       * @param {any} a boolean expression
       * @param {...any} anything
       * @throws Error if condition is false
       * @return {boolean} true
       */
      assert(cond, ...args){
        if(!cond)
          throw args.length==0 ? "Assertion!" : args.join("");
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
      },
      /**Get a random int between min and max (inclusive).
       * @memberof module:mcfud/core._
       * @param {number} min
       * @param {number} max
       * @return {number}
       */
      randInt2(min,max){
        return min + int(PRNG() * (max-min+1)) },
      /**Get a random float between min and max (exclude max).
       * @memberof module:mcfud/core._
       * @param {number} min
       * @param {number} max
       * @return {number}
       */
      randFloat2(min, max){
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
      randInt(num){ return int(PRNG()*num) },
      /**Get a random float between 0 and 1.
       * @memberof module:mcfud/core._
       * @return {number}
       */
      rand(js=false){ return js? Math.random(): PRNG() },
      /**Returns a random number fitting a Gaussian, or normal, distribution.
       * @param {number} v number of times rand is summed, should be >= 1
       * @return {number}
       */
      randGaussian(v=6){
        //adding a random value to the last increases the variance of the random numbers.
        //Dividing by the number of times you add normalises the result to a range of 0–1
        let i,r=0;
        for(i=0; i<v; ++i) r += this.rand();
        return r/v;
      },
      /**
       * @param {array|number} arg
       * @return {number[]}
       */
      randSpan(arg){
        let len = is.vec(arg) ? arg.length : arg;
        this.assert(is.num(len) && len > 1, "bad width to randSpan");
        let a= this.randInt(len),
            b= this.randInt(len);
        if(a==b){
          a=0; b=len-1;
        }
        return a<b ? [a,b] : [b,a];
      },
      /**
       * @return {number}
       */
      randSign(){ return PRNG()>0.5 ? -1 : 1 },
      /**Divide into 2 parts based on golden-ratio.
       * @memberof module:mcfud/core._
       * @param {number} len
       * @return {array} [a,b]
       */
      toGoldenRatio(len){
        let a= len / GOLDEN_RATIO,
            b= a / GOLDEN_RATIO;
        return [this.rounded(a),this.rounded(b)];
      },
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
        let i,n=0;
        for(i=0; i<s.length; ++i)
          n= Math.imul(31, n) + s.charCodeAt(i)
        return n;
      },
      /**Clear array.
       * @memberof module:mcfud/core._
       * @deprecated
       * @param {array} a
       * @return {array} a
       */
      cls(a){
        return this.trunc(a)
      },
      /**Clear array.
       * @memberof module:mcfud/core._
       * @param {array} a
       * @return {array} a
       */
      trunc(a){
        try{ a.length=0 }catch(e){}
        return a;
      },
      /**Randomly choose n items from this array.
       * @memberof module:mcfud/core._
       * @param {any[]} arr
       * @param {number} howMany
       * @return {array} the samples
       */
      randSample(arr,n=1){
        let a,ret;
        if(n==1){
          ret= [this.randItem(arr)]
        }else if(n==0){
          ret=[]
        }else if(n>0){
          a= this.shuffle(arr,false);
          ret = n>=a.length ? a : a.slice(0,n);
        }
        return ret;
      },
      /**Randomly choose an item from this array.
       * @memberof module:mcfud/core._
       * @param {any[]} arr
       * @param {boolean} wantIndex [false]
       * @return {any}
       */
      randItem(arr,wantIndex=false){
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
              rc= arr[i= (int(PRNG()*arr.length))];
          }
        }
        return wantIndex ? [rc,i] : rc;
      },
      /**Randomly choose A or B.
       * @memberof module:mcfud/core._
       * @param {any} a
       * @param {any} b
       * @return {any}
       */
      randAorB(a,b){
        return PRNG() > 0.5 ? a : b
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
        let i,out=new Map();
        for(i=0;i<args.length;){
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
        let i,out={};
        for(i=0;i<args.length;){
          out[args[i]]=args[i+1]; i+=2; }
        return out;
      },
      /**Creates a javascript array.
       * @memberof module:mcfud/core._
       * @param {...any} args data to initialize array
       * @return {any[]}
       */
      jsVec(...args){ return args.length==0 ? [] : args.slice() },
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
        let i,len= Math.min(des.length,src.length);
        for(i=0;i<len;++i) des[i]=src[i];
        return des;
      },
      /**Append all or some items from `src` to `des`.
       * @memberof module:mcfud/core._
       * @param {any[]} des
       * @param {any[]} src
       * @param {boolean} reset false
       * @return {any[]}
       */
      append(des,src=[],reset=false){
        _preAnd([[isVec,des],[isVec,src]],"arrays");
        if(reset) des.length=0;
        for(let i=0;i<src.length;++i) des.push(src[i]);
        return des;
      },
      /**Fill array with v.
       * @memberof module:mcfud/core._
       * @param {number|any[]} a if number, creates array of `a` size
       * @param {number|function} v
       * @return {any[]}
       */
      fill(a,v, ...args){
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
                                    : (isSet(o)||isMap(o)) ? o.size : o ? this.keys(o).length : 0
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
        if(arguments.length==1){
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
              j= int(PRNG() * (i+1));
              x= res[i];
              res[i] = res[j];
              res[j] = x;
            }
        }
        return inplace?this.copy(obj,res):res;
      },
      shuffle2(obj,inplace=true){
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
            for(let s,r,i=0,n=res.length; i<n; ++i){
              // choose index uniformly in [i, n-1]
              r = i + int(PRNG() * (n - i));
              s= res[r];
              res[r] = res[i];
              res[i] = s;
            }
        }
        return inplace?this.copy(obj,res):res;
      },
      shuffle3(obj,inplace=true){
        let a= inplace? obj : Slicer.call(obj,0);
        return a.sort((x,y)=> this.rand()>0.5?-1:(this.rand()>0.5?1:0))
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
      equals(a,b){
        if(isObject(a) && isObject(b)){
          let pa,ka= Object.keys(a);
          let pb,kb= Object.keys(b);
          if(ka.length==kb.length){
            for(let i=0;i<ka.length;++i){
              pa=ka[i];
              pb=kb[i];
              if(this.equals(pa,pb) &&
                 this.equals(a[pa],b[pb])){
                continue
              }
              return false;
            }
            return true;
          }
          return false;
        }
        if(isVec(a) && isVec(b)){
          if(a.length==b.length){
            for(let i=0;i<a.length;++i){
              if(!this.equals(a[i],b[i])) return false
            }
            return true;
          }
          return false;
        }
        if(isNum(a) && isNum(b)) return a==b;
        if(isStr(a) && isStr(b)) return a==b;
        if(isBool(a) && isBool(b)) return a==b;
        if(a===null && b===null) return true;
        if(a===undefined && b===undefined) return true;
        throw Error("cant call equals for these types");
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
      /**Remaps a value from one range to another range.
       * e.g. rmap(2, 0, 10, 0, 100) = 20
       * @memberof module:mcfud/core._
       * @param {number} n
       * @param {number} startR1
       * @param {number} endR1
       * @param {number} startR2
       * @param {number} endR2
       * @return {number} new value
       */
      rmap(n, startR1, endR1, startR2, endR2){
        return ((n-startR1)/(endR1-startR1))*(endR2-startR2)+startR2
      },
      /**Iterate n times, calling the provided function.
       * @memberof module:mcfud/core._
       * @param {number} n
       * @param {callback} fn
       * @param {any} target
       * @param {...any} args
       */
      dotimes(n,fn,target, ...args){
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
      conj(coll, ...items){
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
        if(typeof arg == "string")
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
        return arguments.length==1 ? false
          : isMap(coll) ? coll.has(key)
          : isVec(coll) ? coll.indexOf(key) != -1
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
      inject(des, ...args){
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
        let i,z,out = [];
        for(i=0,z=v.length; i<z; ++i)
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
          if(typeof ext != "object" || ext === null || !original[key]){
            original[key] = ext;
          }else{
            if(typeof original[key] != "object"){
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
       * @param {string} pad padding character
       * @return {string}
      */
      prettyNumber(num, digits=2, pad="0"){
        return this.strPadLeft(Number(num).toString(), digits, pad)
      },
      /**Pretty print millis in nice
       * hour,minutes,seconds format.
       * @memberof module:mcfud/core._
       * @param {number} ms
       * @return {string}
       */
      prettyMillis(ms){
        let h,m,s= int(ms/1000);
        m=int(s/60);
        ms=ms-s*1000;
        s=s-m*60;
        h= int(m/60);
        m=m-h*60;
        let out=[];
        out.push(`${s}.${ms} secs`);
        if(m>0 || h>0)
          out.push(`${m} mins, `);
        if(h>0)
          out.push(`${h} hrs, `);
        return out.reverse().join("");
      },
      /**Swap 2 elements in the array.
       * @memberof module:mcfud/core._
       * @param {array} arr
       * @param {number} a
       * @param {number} b
       * @return {array} arr
      */
      swap(arr,a,b){
        let t= arr[a];
        arr[a]=arr[b];
        arr[b]=t;
        return arr;
      },
      /**List indexes of this array
       * @memberof module:mcfud/core._
       * @param {array} arr
       * @param {boolean} scramble
       * @return {array} list of indexes
      */
      listIndexesOf(arr, scramble){
        let xs= _.fill(arr.length, (i)=>i);
        return scramble? this.shuffle(xs) : xs;
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
        if(arguments.length==2 &&
           arguments[1].hack==911){ wnd=arguments[1] }
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
        if(isVec(event) && arguments.length==1)
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
        if(isVec(event) && arguments.length==1)
          event.forEach(e => this.delEvent.apply(this, e));
        else
          target.removeEventListener(event,cb,arg)
      },
      /**Rounds a double up or down depending on its value.
       * @memberof module:mcfud/core._
       * @param {number} val
       * @return {number}
       */
      rounded(val){
        return this.roundUnderOffset(val, 0.5)
      },
      /**Rounds a double up or down depending on
       * whether its mantissa is higher or lower than offset.
       * @memberof module:mcfud/core._
       * @param {number} val
       * @return {number}
       */
      roundUnderOffset(val, offset){
        const integral = int(val);
        return (val - integral) < offset ? integral : (integral + 1);
      },
      /**Create a comparator function for sorting.
       * If no functions are supplied, then integral comparisons are assumed.
       * @memberof module:mcfud/core._
       * @param {number} flag -ve ascending, +ve descending
       * @param {Function} fa
       * @param {Function} fb
       * @return {Function}
       */
      comparator(flag,fa,fb){
        if(arguments.length==1){
          //integral comparisons
          return flag<0 ? function(a,b){ return a<b?-1:(a>b?1:0) }
                        : function(a,b){ return a>b?-1:(a<b?1:0) }
        }else{
          return flag<0 ? function(a,b){ let ra=fa(a), rb=fb(b); return ra<rb?-1:(ra>rb?1:0) }
                        : function(a,b){ let ra=fa(a), rb=fb(b); return ra>rb?-1:(ra<rb?1:0) }
        }
      },
      /**A comparator function for sorting numbers in ascending order.
       * @memberof module:mcfud/core._
       * @param {number} a
       * @param {number} b
       * @return {number}
       */
      CMPINTASC(a,b){
        return a-b
      },
      /**A comparator function for sorting numbers in descending order.
       * @memberof module:mcfud/core._
       * @param {number} a
       * @param {number} b
       * @return {number}
       */
      CMPINTDESC(a,b){
        return b-a
      },
      /**Find the largest value in the array, with its index.
       * @memberof module:mcfud/core._
       * @param {array} arr
       * @return {array} [index, value]
       */
      argMax(arr){
        let max= -Infinity, pos= -1;
        arr.forEach((v,i)=>{
          if(v>max){
            max=v;pos=i;
          }
        });
        return [pos, max];
      },
      /**Group same items in the array.
       * @memberof module:mcfud/core._
       * @param {array} arr
       * @param {function} cmpFn
       * @return {array} [[value, count], ...., []]
       */
      groupSimilar(arr, cmpFn){
        return arr.reduce((acc,v)=>{
          let rc= acc.find(a=> cmpFn(a[0],v));
          if(rc){
            rc[1] += 1;
          }else{
            acc.push([v, 1]);
          }
          return acc;

        }, []);
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
      pub(subject, ...args){
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
        if(arguments.length==1 && !is.vec(subject)){
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
  if(typeof module=="object" && module.exports){
    module.exports=_module();
  }else{
    window["io/czlab/mcfud/core"]=_module
  }

})(this);

