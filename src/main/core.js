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
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  "use strict";
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  if(typeof module==="object" && module.exports){
    seed_rand=require("../tpcl/seedrandom.min")
  }else{
    doco=window.document
  }
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  /**
   * @private
   * @function
   */
  function _module(){
    let PRNG= seed_rand?seed_rand():new Math.seedrandom();
    const OBJ=Object.prototype;
    const ARR=Array.prototype;
    const slicer=ARR.slice;
    const tostr=OBJ.toString;
    const _C={};
    function isObject(obj){ return tostr.call(obj) === "[object Object]" }
    function isFun(obj){ return tostr.call(obj) === "[object Function]" }
    function isArray(obj){ return tostr.call(obj) === "[object Array]" }
    function isMap(obj){ return tostr.call(obj) === "[object Map]" }
    function isStr(obj){ return typeof obj === "string" }
    function isNum(obj){ return tostr.call(obj) === "[object Number]" }
    function _randXYInclusive(min,max){
      return Math.floor(PRNG() * (max - min + 1) + min)
    }
    //regexes handling file paths
    const BNAME=/(\/|\\\\)([^(\/|\\\\)]+)$/g;
    const FEXT=/(\.[^\.\/\?\\]*)(\?.*)?$/;
    function _fext(path){
      let t=FEXT.exec(path);
      return t && t[1]  ? t[1].toLowerCase() : "";
    }
    //https://github.com/bryc/code/blob/master/jshash/PRNGs.md
    //xoshiro128+ (128-bit state generator in 32-bit)
    const xoshiro128p=(function(a,b,c,d){
      return function(){
        let t = b << 9, r = a + d;
            c = c ^ a;
            d = d ^ b;
            b = b ^ c;
            a = a ^ d;
            c = c ^ t;
            d = (d << 11) | (d >>> 21);
        return (r >>> 0) / 4294967296;
      };
    })(Date.now(),Date.now(),Date.now(),Date.now()); // simple seeding??
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
    /**
     * @private
     * @function
     */
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
    /**
     * @private
     * @var {object}
     */
    const is={
      fun(f,...args){ return _everyF(isFun,f,args) },
      str(s,...args){ return _everyF(isStr,s,args) },
      void0(obj){ return obj === void 0 },
      undef(obj){ return obj === undefined },
      some(obj){ return _.size(obj) > 0 },
      none(obj){ return _.size(obj) === 0 },
      map(m,...args){ return _everyF(isMap,m,args) },
      num(n,...args){ return _everyF(isNum,n,args) },
      vec(v,...args){ return _everyF(isArray,v,args) },
      obj(o,...args){ return _everyF(isObject,o,args) }
    };
    /**
     * @private
     * @var {object}
     */
    const _={
      /** Re-seed a random */
      srand(){ PRNG = new Math.seedrandom() },
      /** Fuzzy zero */
      feq0(a){ return Math.abs(a) < EPSILON },
      /** Fuzzy equals */
      feq(a, b){ return Math.abs(a - b) < EPSILON },
      /** Fuzzy greater_equals */
      fgteq(a,b){ return a>b || this.feq(a,b) },
      /** Fuzzy less_equals */
      flteq(a,b){ return a<b || this.feq(a,b) },
      /** Serialize to JSON */
      pack(o){ return JSON.stringify(o) },
      /** Deserialize from JSON */
      unpack(s){ return JSON.parse(s) },
      /** Put values into array */
      v2(x,y){ return [x,y] },
      /** 2D point(x,y) */
      p2(x,y){ return {x: x, y: y} },
      /** Return it if it's a number else 0 */
      numOrZero(n){ return isNaN(n) ? 0 : n },
      /** Return b if a doesn't exist else a */
      or(a,b){ return a===undefined?b:a },
      /** Convert input into number, if not return the default */
      toNumber(s,dft){
        let n=parseFloat(s);
        return (isNaN(n) && isNum(dft)) ? dft : n;
      },
      /** Break version string into Major.Minor.Patch */
      splitVerStr(s){
        const arr=(""+(s || "")).split(".").filter(s=> s.length>0);
        return [this.toNumber(arr[0],0),
                this.toNumber(arr[1],0),
                this.toNumber(arr[2],0)]
      },
      /** Compare 2 versions like a standard comparator */
      cmpVerStrs(V1,V2){
        let v1= this.splitVerStr(""+V1);
        let v2= this.splitVerStr(""+V2);
        if(v1[0] > v2[0]) return 1;
        else if(v1[0] < v2[0]) return -1;
        if(v1[1] > v2[1]) return 1;
        else if(v1[1] < v2[1]) return -1;
        if(v1[2] > v2[2]) return 1;
        else if(v1[2] < v2[2]) return -1;
        return 0;
      },
      /** Look for files matching any one of these extensions */
      findFiles(files, exts){
        return files.filter(s=> exts.indexOf(_fext(s)) > -1);
      },
      pdef(obj){
        obj.configurable=obj.enumerable=true;
        return obj;
      },
      /** Chop input into chunks of `count` items */
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
      XXrange(start,end){
        _.assert(is.num(start));
        const out=[];
        if(arguments.length===1){ end=start; start=0 }
        _.assert(is.num(end));
        for(let i=start;i<end;++i){ out.push(i) }
        return out
      },
      /** Returns keys of object or Map. */
      keys(obj){
        return isMap(obj) ? Array.from(obj.keys())
                          : (isObject(obj) ? Object.keys(obj) : []);
      },
      /** Clone object/Map but exclude these keys */
      selectNotKeys(c,keys){
        _.assert(isMap(c)||isObject(c),"Expecting object/map.");
        const out= isMap(c) ? new Map() : {};
        keys=_.seq(keys);
        _.doseq(c,(v,k)=>{
          if(!keys.includes(k))
            isMap(out) ? out.set(k, v) : out[k]=v;
        });
        return out;
      },
      /** Choose these keys from object/map */
      selectKeys(c,keys){
        _.assert(isMap(c)||isObject(c),"Expecting object/map.");
        const out= isMap(c) ? new Map() : {};
        _.seq(keys).forEach(k=>{
          if(isMap(c)){
            c.has(k) && out.set(k, c.get(k));
          }else if(OBJ.hasOwnProperty.call(c, k)){
            out[k]=c[k];
          }
        });
        return out;
      },
      /** assert the condition is false */
      assertNot(cond,...args){
        return _.assert(!cond,...args)
      },
      /** assert the condition is true */
      assert(cond){
        if(!cond)
          throw (arguments.length<2) ? "Assert Failed!" : slicer.call(arguments,1).join("");
        return true
      },
      /** true if target has none of these keys */
      noSuchKeys(keys,target){
        return !_.some(_.seq(keys),k => _.has(target,k)?k:null);
        //if(r) console.log("keyfound="+r);
        //return !r;
      },
      /** a random float between min and max-1 */
      randFloat(min, max){
        return min + PRNG() * (max - min)
      },
      /** a random float between -1 and 1 */
      randMinus1To1(){ return (PRNG()-0.5) * 2 },
      /** a random int between 0 and num */
      randInt(num){ return (PRNG() * num)|0 },
      /** a random int between min and max */
      randInt2: _randXYInclusive,
      /** a random float between 0 and 1 */
      rand(){ return PRNG() },
      /** randomly choose -1 or 1 */
      randSign(){ return _.rand() > 0.5 ? -1 : 1 },
      /** true if obj is subclass of type */
      inst(type,obj){ return obj instanceof type },
      /** Calculate hashCode of this string, like java hashCode */
      hashCode(s){
        let n=0;
        for(let i=0; i<s.length; ++i)
          n= Math.imul(31, n) + s.charCodeAt(i)|0;
        return n;
      },
      /** Randomly choose an item from this array */
      randArrayItem(arr){
        if(arr && arr.length>0)
          return arr.length===1 ? arr[0] : arr[_.randInt(arr.length)]
      },
      /** true if string represents a percentage value */
      isPerc(s){
        return isStr(s) && s.match(/^([0-9])(\.?[0-9]+|[0-9]*)%$/)
      },
      /** true if number is even */
      isEven(n){
        return n>0 ? (n % 2 === 0) : ((-n) % 2 === 0);
      },
      /** Creates a javascript Map */
      jsMap(){ return new Map() },
      /** Creates a javascript object */
      jsObj(){ return {} },
      /** Creates a javascript array */
      jsVec(...args){
        return args.length===0 ? [] : args.slice()
      },
      /** Returns the last index */
      lastIndex(c){
        return (c && c.length>0) ? c.length-1 : -1
      },
      /** Returns the first element */
      first(c){ if(c && c.length>0) return c[0] },
      /** Returns the last element */
      last(c){ if(c&& c.length>0) return c[c.length-1] },
      head(c){ return _.first(c) },
      tail(c){ return _.last(c) },
      /** floor a number */
      floor(v){ return Math.floor(v) },
      /** ceiling a number */
      ceil(v){ return Math.ceil(v) },
      /** absolute value */
      abs(v){ return Math.abs(v) },
      /** square root number */
      sqrt(v){ return Math.sqrt(v) },
      /** choose min from 2 */
      min(...args){ return Math.min(...args) },
      /** choose max from 2 */
      max(...args){ return Math.max(...args) },
      /** Take a slice of an array */
      slice(a,i){ return slicer.call(a, i) },
      /** true only if every item in list equals v */
      every(c,v){
        for(let i=0;i<c.length;++i)
          if(c[i] !== v) return false;
        return c.length>0;
      },
      /** true only if no item in list equals v */
      notAny(c,v){
        for(let i=0;i<c.length;++i)
          if(c[i] === v) return false;
        return c.length>0;
      },
      /** Copy all or some items from `from` to `to` */
      copy(to,from){
        if(!from){return to}
        if(!to){
          return from ? from.slice() : undefined }
        let len= Math.min(to.length,from.length);
        for(let i=0;i<len;++i) to[i]=from[i];
        return to;
      },
      /** Append all or some items from `from` to `to` */
      append(to,from){
        if(!from){return to}
        if(!to){
          return from ? from.slice() : undefined }
        for(let i=0;i<from.length;++i) to.push(from[i]);
        return to;
      },
      /** Fill array with v or v() */
      fill(a,v){
        if(a)
          for(let i=0;i<a.length;++i){
            a[i]= isFun(v) ? v() : v;
          }
        return a;
      },
      /** Return the size of object/map/array */
      size(obj){
        return isArray(obj) ? obj.length
                            : (isMap(obj) ? obj.size
                                          : (obj ? _.keys(obj).length : 0))
      },
      /** Next sequence number */
      nextId(){ return ++_seqNum },
      /** Time in milliseconds */
      now(){ return Date.now() },
      /** Find file extension */
      fileExt(path){ return _fext(path) },
      /** Find file name, no extension */
      fileBase(path){
        let pos=path.indexOf("?");
        if(pos>0)
          path=path.substring(0,pos);
        let res= BNAME.exec(path.replace(/(\/|\\\\)$/, ""));
        let name="";
        if(res){
          name = res[2];
          pos=name.lastIndexOf(".");
          if(pos>0)
            name=name.substring(0,pos);
        }
        return name;
      },
      /** return a list of numbers from start to end - like a Range object */
      range(start,stop,step=1){
        if(arguments.length===1){
          stop=start;
          start=0;
          step=1;
        }
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
      /** Shuffle items */
      shuffle(obj){
        const res=slicer.call(obj,0);
        for(let x,j,i= res.length-1; i>0; --i){
          j = Math.floor(PRNG() * (i+1));
          x = res[i];
          res[i] = res[j];
          res[j] = x;
        }
        return res;
      },
      /** Return only the distinct items */
      uniq(arr){
        if(false){
          let prev,res= [];
          slicer.call(arr).sort().forEach(a=>{
            if(a !== undefined &&
               a !== prev) res.push(a);
            prev = a;
          });
          return res;
        }
        return Array.from(new Set(arr));
      },
      /** functional map */
      map(obj, fn,target){
        const res= [];
        _.doseq(obj, (v,k)=>{
          res.push(fn.call(target, v,k,obj));
        });
        return res;
      },
      /** `find` with extra args */
      find(coll,fn,target){
        let args=slicer.call(arguments,3);
        let res,cont=true;
        _.doseq(coll, (v,k)=>{
          if(cont && fn.apply(target, [v, k].concat(args))){
            res=[k, v];
            cont=false;
          }
        });
        return res;
      },
      /** `some` with extra args */
      some(coll,fn,target){
        let args=slicer.call(arguments,3);
        let res,cont=true;
        _.doseq(coll,(v,k)=>{
          if(cont){
            res = fn.apply(target, [v, k].concat(args));
            if(res) cont=false;
          }
        });
        return res;
      },
      /** Each item in the array is an object, invoke obj.method with extra args */
      invoke(arr,method_name){
        let args=slicer.call(arguments,2);
        isArray(arr) &&
          arr.forEach(x => x[key].apply(x, args));
      },
      /** Run function after some delay */
      delay(wait,f){ return setTimeout(f,wait) },
      /** Create a once/repeat timer */
      timer(f,delay=0,repeat=false){
        return {
          repeat: !!repeat,
          id: repeat ? setInterval(f,delay) : setTimeout(f,delay)
        }
      },
      /** clear a timer */
      clear(handle){
        if(handle)
          handle.repeat ? clearInterval(handle.id)
                        : clearTimeout(handle.id)
      },
      /** Iterate a collection in reverse */
      rseq(coll,fn,target){
        if(isArray(coll) && coll.length>0)
          for(let i=coll.length-1;i>=0;--i){
            fn.call(target, coll[i],i)
          }
      },
      /** Iterate a collection */
      doseq(coll,fn,target){
        if(isArray(coll)){
          coll.forEach(fn,target);
        }else if(isMap(coll)){
          coll.forEach((v,k)=> fn.call(target,v,k,coll));
        }else if(coll){
          Object.keys(coll).forEach(k=>{
            fn.call(target, coll[k], k, coll);
          });
        }
      },
      /** Remove a key from collection */
      dissoc(coll,key){
        if(arguments.length>2){
          let prev,i=1;
          for(;i<arguments.length;++i)
            prev=_.dissoc(coll,arguments[i]);
          return prev;
        }else{
          let val;
          if(isMap(coll)){
            val=coll.get(key);
            coll.delete(key);
          }else if(coll){
            val = coll[key];
            delete coll[key];
          }
          return val;
        }
      },
      /** Return the value of property `key` */
      get(coll,key){
        if(key !== undefined){
          if(isMap(coll)) return coll.get(key);
          else if(coll) return coll[key];
        }
      },
      /** Set property `key` */
      assoc(coll,key,value){
        if(arguments.length>3){
          if(((arguments.length-1)%2) !== 0)
            throw "ArityError: expecting even count of args.";
          let prev, i=1;
          for(;i < arguments.length;){
            prev= _.assoc(coll,arguments[i],arguments[i+1]);
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
      /** Remove item from array */
      disj(coll,obj){
        let i = coll ? coll.indexOf(obj) : -1;
        if(i > -1) coll.splice(i,1);
        return i > -1;
      },
      /** Append item to array */
      conj(coll,...objs){
        if(coll)
          objs.forEach(o => coll.push(o));
        return coll;
      },
      /** Make input into array */
      seq(arg,sep=","){
        if(typeof arg === "string")
          arg = arg.split(sep).map(s=>s.trim()).filter(s=>s.length>0);
        if(!isArray(arg)) arg = [arg];
        return arg;
      },
      /** true if collection has property `key` */
      has(coll,key){
        return arguments.length===1 ? false
          : isMap(coll) ? coll.has(key)
          : isArray(coll) ? coll.indexOf(key) !== -1
          : coll ? OBJ.hasOwnProperty.call(coll, key) : false;
      },
      /** Add these keys to `des` only if the key is missing */
      patch(des,additions){
        des=des || {};
        if(additions)
          Object.keys(additions).forEach(k=>{
            if(!_.has(des,k))
              des[k]=additions[k];
          });
        return des;
      },
      /** Deep clone */
      clone(obj){
        return obj ? _.unpack(_.pack(obj)) : obj
      },
      /** Merge others into `des` */
      inject(des){
        let args=slicer.call(arguments,1);
        des=des || {};
        args.forEach(s=>{
          if(s) Object.assign(des,s);
        });
        return des;
      },
      /** Deep copy array/array of arrays */
      deepCopyArray(v){
        _.assert(is.vec(v),"Expected array");
        const out = [];
        for(let i=0,z=v.length; i<z; ++i)
          out[i]= is.vec(v[i]) ? _.deepCopyArray(v[i]) : v[i];
        return out;
      },
      /**
       * Merge 2 objects together.
       * @function
       * @param {Object} original
       * @param {Object} extended
       * @return {Object} a new object
      */
      mergeEx(original, extended){
        return _.merge(_.merge({}, original), extended)
      },
      /**
       * Merge 2 objects in place.
       * @function
       * @param {Object} original
       * @param {Object} extended
       * @return {Object} the modified original object
      */
      merge(original, extended){
        let key,ext;
        Object.keys(extended).forEach(key=>{
          ext = extended[key];
          if(typeof ext !== "object" || ext === null || !original[key]){
            original[key] = ext;
          }else{
            if(typeof original[key] !== "object"){
              original[key] = ext instanceof Array ? [] : {}
            }
            _.merge(original[key], ext);
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
       *
       * **Note:** If `leading` and `trailing` options are `true`, `func` is
       * invoked on the trailing edge of the timeout only if the throttled function
       * is invoked more than once during the `wait` timeout.
       *
       * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
       * until the next tick, similar to `setTimeout` with a timeout of `0`.
       *
       * If `wait` is omitted in an environment with `requestAnimationFrame`, `func`
       * invocation will be deferred until the next frame is drawn (typically about
       * 16ms).
       *
       * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
       * for details over the differences between `throttle` and `debounce`.
       *
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to throttle.
       * @param {number} [wait=0]
       *  The number of milliseconds to throttle invocations to; if omitted,
       *  `requestAnimationFrame` is used (if available).
       * @param {Object} [options={}] The options object.
       * @param {boolean} [options.leading=true]
       *  Specify invoking on the leading edge of the timeout.
       * @param {boolean} [options.trailing=true]
       *  Specify invoking on the trailing edge of the timeout.
       * @returns {Function} Returns the new throttled function.
       * @example
       *
       * // Avoid excessively updating the position while scrolling.
       * jQuery(window).on('scroll', throttle(updatePosition, 100))
       *
       * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
       * const throttled = throttle(renewToken, 300000, { 'trailing': false })
       * jQuery(element).on('click', throttled)
       *
       * // Cancel the trailing throttled invocation.
       * jQuery(window).on('popstate', throttled.cancel)
       */
      throttle(func, wait, options){
        let leading = true;
        let trailing = true;
        _.assert(is.fun(func),"Expecting a function");
        if(is.obj(options)){
          leading = "leading" in options ? !!options.leading : leading;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        return _.debounce(func, wait, { leading, trailing, "maxWait": wait });
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
       *
       * **Note:** If `leading` and `trailing` options are `true`, `func` is
       * invoked on the trailing edge of the timeout only if the debounced function
       * is invoked more than once during the `wait` timeout.
       *
       * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
       * until the next tick, similar to `setTimeout` with a timeout of `0`.
       *
       * If `wait` is omitted in an environment with `requestAnimationFrame`, `func`
       * invocation will be deferred until the next frame is drawn (typically about
       * 16ms).
       *
       * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
       * for details over the differences between `debounce` and `throttle`.
       *
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to debounce.
       * @param {number} [wait=0]
       *  The number of milliseconds to delay; if omitted, `requestAnimationFrame` is
       *  used (if available).
       * @param {Object} [options={}] The options object.
       * @param {boolean} [options.leading=false]
       *  Specify invoking on the leading edge of the timeout.
       * @param {number} [options.maxWait]
       *  The maximum time `func` is allowed to be delayed before it's invoked.
       * @param {boolean} [options.trailing=true]
       *  Specify invoking on the trailing edge of the timeout.
       * @returns {Function} Returns the new debounced function.
       * @example
       *
       * // Avoid costly calculations while the window size is in flux.
       * jQuery(window).on('resize', debounce(calculateLayout, 150))
       *
       * // Invoke `sendMail` when clicked, debouncing subsequent calls.
       * jQuery(element).on('click', debounce(sendMail, 300, {
       *   'leading': true,
       *   'trailing': false
       * }))
       *
       * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
       * const debounced = debounce(batchLog, 250, { 'maxWait': 1000 })
       * const source = new EventSource('/stream')
       * jQuery(source).on('message', debounced)
       *
       * // Cancel the trailing debounced invocation.
       * jQuery(window).on('popstate', debounced.cancel)
       *
       * // Check for pending invocations.
       * const status = debounced.pending() ? "Pending..." : "Ready"
      */
      //lifted from https://github.com/lodash/lodash
      debounce(func, wait, options){
        let lastArgs,
            lastThis,
            maxWait,
            result,
            timerId,
            lastCallTime,
            lastInvokeTime = 0,
            leading = false,
            maxing = false,
            trailing = true;
        _.assert(is.fun(func),"expecting function");
        wait = wait || 0;
        if(is.obj(options)){
          leading = !!options.leading;
          maxing = "maxWait" in options;
          maxWait = maxing ? Math.max(options.maxWait || 0, wait) : maxWait;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        function _invokeFunc(time){
          let args = lastArgs;
          let thisArg = lastThis;
          lastArgs = lastThis = undefined;
          lastInvokeTime = time;
          result = func.apply(thisArg, args);
          return result;
        }
        function _leadingEdge(time){
          // Reset any `maxWait` timer.
          lastInvokeTime = time;
          // Start the timer for the trailing edge.
          timerId = setTimeout(_timerExpired, wait);
          // Invoke the leading edge.
          return leading ? _invokeFunc(time) : result;
        }
        function _remainingWait(time){
          let timeSinceLastCall = time - lastCallTime;
          let timeSinceLastInvoke = time - lastInvokeTime;
          let timeWaiting = wait - timeSinceLastCall;
          return maxing
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
        }
        function _shouldInvoke(time){
          let timeSinceLastCall = time - lastCallTime;
          let timeSinceLastInvoke = time - lastInvokeTime;
          // Either this is the first call, activity has stopped and we're at the
          // trailing edge, the system time has gone backwards and we're treating
          // it as the trailing edge, or we've hit the `maxWait` limit.
          return lastCallTime === undefined ||
                 (timeSinceLastCall >= wait) ||
                 (timeSinceLastCall < 0) ||
                 (maxing && timeSinceLastInvoke >= maxWait);
        }
        function _timerExpired(){
          let time = _.now();
          if(_shouldInvoke(time)){
            return _trailingEdge(time);
          }
          // Restart the timer.
          timerId = setTimeout(_timerExpired, _remainingWait(time));
        }
        function _trailingEdge(time){
          timerId = undefined;
          // Only invoke if we have `lastArgs` which means `func` has been
          // debounced at least once.
          if(trailing && lastArgs){
            return _invokeFunc(time);
          }
          lastArgs = lastThis = undefined;
          return result;
        }
        function _cancel() {
          if(timerId !== undefined){
            clearTimeout(timerId);
          }
          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined;
        }
        function _flush() {
          return timerId === undefined ? result : _trailingEdge(_.now());
        }
        function _debounced(){
          let time = _.now();
          let isInvoking = _shouldInvoke(time);
          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;
          if(isInvoking){
            if(timerId === undefined){
              return _leadingEdge(lastCallTime);
            }
            if(maxing){
              // Handle invocations in a tight loop.
              clearTimeout(timerId);
              timerId = setTimeout(_timerExpired, wait);
              return _invokeFunc(lastCallTime);
            }
          }
          if(timerId === undefined){
            timerId = setTimeout(_timerExpired, wait);
          }
          return result;
        }
        //_debounced.cancel = cancel;
        //_debounced.flush = flush;
        return _debounced;
      },
      /** Return a function that will return the negation of original func */
      negate(func){
        _.assert(is.fun(func),"expected function");
        return function(...args){
          return !func.apply(this, args)
        }
      },
      /**
       * Maybe pad a string (right side.)
       * @function
       * @param {String} str
       * @param {Number} len
       * @param {String} s
       * @return {String}
      */
      strPadRight(str, len, s){
        return (len -= str.length)>0 ? str+new Array(Math.ceil(len/s.length)+1).join(s).substr(0, len) : str
      },
      /**
       * Maybe pad a string (left side.)
       * @function
       * @param {String} str
       * @param {Number} len
       * @param {String} s
       * @return {String}
      */
      strPadLeft(str, len, s){
        return (len -= str.length)>0 ? new Array(Math.ceil(len/s.length)+1).join(s).substr(0, len) + str : str
      },
      /**
       * Safely split a string, null and empty strings are removed.
       * @function
       * @param {String} s
       * @param {String} sep
       * @return {Array.String}
      */
      safeSplit(s, sep){
        return s.trim().split(sep).filter(z => z.length>0)
      },
      /** Capitalize the first char */
      capitalize(str){
        return str.charAt(0).toUpperCase() + str.slice(1)
      },
      /**
       * Maybe pad the number with zeroes.
       * @function
       * @param {Number} num
       * @param {Number} digits
       * @return {String}
      */
      prettyNumber(num, digits=2){
        return _.strPadLeft(Number(num).toString(), digits, "0")
      },
      /**
       * Remove some arguments from the front.
       * @function
       * @param {Javascript.arguments} args
       * @param {Number} num
       * @return {Array} remaining arguments
      */
      dropArgs(args, num){
        return args.length > num ? Array.prototype.slice(args, num) : []
      },
      /** true if url is secure */
      isSSL(){
        return window && window.location && window.location.protocol.indexOf("https") >= 0
      },
      /** true if url is mobile */
      isMobile(navigator){
        return navigator && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      /** true if browser is safari */
      isSafari(navigator){
        return navigator && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
      },
      /** true if cross-origin */
      isCrossOrigin(url) {
        if(url) {
          let pos= url.indexOf("://");
          if(pos > 0){
            let end= url.indexOf("/", pos+3);
            let o = end<0 ? url : url.substring(0, end);
            return o !== window.location.origin;
          }
        }
      }
    };
    //browser only--------------------------------------------------------------
    if(doco){
      _.addEvent=function(event,target,cb,arg){
        if(isArray(event) && arguments.length===1)
          event.forEach(e => this.addEvent.apply(this, e));
        else
          target.addEventListener(event,cb,arg);
      };
      _.delEvent=function(event,target,cb,arg){
        if(isArray(event) && arguments.length===1)
          event.forEach(e => this.delEvent.apply(this, e));
        else
          target.removeEventListener(event,cb,arg);
      };
    }
    /**
     * @public
     * @var {object}
     */
    const dom={
      qSelector(sel){ return doco.querySelectorAll(sel) },
      qId(id){ return doco.getElementById(id) },
      parent(e){ if(e) return e.parentNode },
      conj(par,child){ return par.appendChild(child) },
      byTag(tag, ns){
        return !is.str(ns) ? doco.getElementsByTagName(id)
                           : doco.getElementsByTagNameNS(ns,tag) },
      attrs(e, attrs){
        if(!is.obj(attrs) && attrs){
          if(arguments.length > 2)
            e.setAttribute(attrs, arguments[2]);
          return e.getAttribute(attrs);
        }
        if(attrs)
          _.doseq(attrs, (v,k) => e.setAttribute(k,v));
        return e;
      },
      css(e, styles){
        if(!is.obj(styles) && styles){
          if(arguments.length > 2)
            e.style[styles]= arguments[2];
          return e.style[styles];
        }
        if(styles)
          _.doseq(styles, (v,k) => { e.style[k]= v });
        return e;
      },
      wrap(child,wrapper){
        let p=child.parentNode;
        wrapper.appendChild(child);
        p.appendChild(wrapper);
        return wrapper;
      },
      newElm(tag, attrs, styles){
        let e = doco.createElement(tag);
        this.attrs(e,attrs);
        this.css(e,styles);
        return e;
      },
      newTxt(tag, attrs, styles){
        let e = doco.createTextNode(tag);
        this.attrs(e,attrs);
        this.css(e,styles);
        return e;
      }
    };
    /**
     * @public
     * @function
     */
    const EventBus= function(){
      let _tree= _.jsMap();
      let NULL={};
      let ZA=[];
      return {
        sub(subject,cb,ctx,extras){
          let event=subject[0], target=subject[1];
          //handle multiple events in one string
          _.seq(event).forEach(e=>{
            if(!cb) cb=e;
            if(is.str(cb)) { ctx=ctx || target; cb=ctx[cb]; }
            if(!cb) throw "Error: no callback for sub()";
            if(!_tree.has(e)) _tree.set(e, _.jsMap());
            let m= _tree.get(e);
            target=target||NULL;
            !m.has(target) && m.set(target,[]);
            m.get(target).push([cb,ctx,extras]);
          });
        },
        pub(subject,...args){
          let m,t,event=subject[0], target=subject[1] || NULL;
          _.seq(event).forEach(e=>{
            t=_tree.get(e);
            m= t && t.get(target);
            m && m.forEach(s=>{
              s[0].apply(s[1],args.concat(s[2] || ZA));
            });
          });
        },
        unsub(subject,cb,ctx){
          let event=subject[0], target=subject[1] || NULL;
          let t,m, es=_.seq(event);
          es.forEach(e=>{
            t= _tree.get(e);
            m= t && t.get(target);
            if(m){
              if(is.str(cb)) { ctx=ctx || target; cb=ctx[cb]; }
              if(!cb){
                //t.delete(target);
              }
              else
                for(let i= m.length-1;i>=0;--i)
                    if(m[i][0] === cb && m[i][1] === ctx) m.splice(i,1);
            }
          });
        }
      };
    };

    if(doco){ _C.dom=dom }
    _C.EventBus= EventBus;
    _C.u= _;
    _C.is= is;
    return _C;
  }

  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module==="object" && module.exports){
    module.exports=_module()
  }else{
    window["io/czlab/mcfud/core"]=_module
  }

})(this);


