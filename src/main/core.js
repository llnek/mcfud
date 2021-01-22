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

;(function(global){
  "use strict";
  let window=null;
  let _singleton=null;
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }else if(typeof exports === "object" && exports){
    global=exports;
  }else if(global.document){
    window=global;
  }
  /**
   * @public
   * @function
   */
  global["io/czlab/mcfud/core"]=function(){
    if(_singleton){ return _singleton }
    let PRNG = new Math.seedrandom();
    const document=global.document;
    const OBJ=Object.prototype;
    const ARR=Array.prototype;
    const slicer=ARR.slice;
    const tostr=OBJ.toString;
    const _C={};

    function isObject(obj){ return tostr.call(obj) === "[object Object]"; }
    function isFun(obj){ return tostr.call(obj) === "[object Function]" }
    function isArray(obj){ return tostr.call(obj) === "[object Array]"; }
    function isMap(obj){ return tostr.call(obj) === "[object Map]"; }
    function isStr(obj){ return typeof obj === "string"; }
    function isNum(obj){ return tostr.call(obj) === "[object Number]"; }
    function _randXYInclusive(min,max){
      return Math.floor(PRNG() * (max - min + 1) + min);
    }
    function _fext(name){
      let pos= name.lastIndexOf(".");
      return pos>0 ? name.substring(pos+1).toLowerCase() : "";
    }

    //https://github.com/bryc/code/blob/master/jshash/PRNGs.md
    //xoshiro128+ (128-bit state generator in 32-bit)
    const xoshiro128p = (function(a,b,c,d){
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
    //const EPSILON= 0.00001;
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
     * @public
     * @var {object}
     */
    const is={
      fun(f,...args){ return _everyF(isFun,f,args) },
      str(s,...args){ return _everyF(isStr,s,args) },
      void0(obj){ return obj === void 0 },
      undef(obj){ return obj === undefined },
      obj(o,...args){ return _everyF(isObject,o,args) },
      map(m,...args){ return _everyF(isMap,m,args) },
      num(n,...args){ return _everyF(isNum,n,args) },
      vec(v,...args){ return _everyF(isArray,v,args) },
      some(obj){ return _.size(obj) > 0 },
      none(obj){ return _.size(obj) === 0 }
    };
    /**
     * @public
     * @var {object}
     */
    const _={
      srand(){
        PRNG = new Math.seedrandom()
      },
      feq0(a){
        return Math.abs(a) < EPSILON
      },
      feq(a, b){
        // <= instead of < for NaN comparison safety
        return Math.abs(a - b) <= EPSILON;
      },
      fgteq(a,b){
        return a>b || this.feq(a,b);
      },
      flteq(a,b){
        return a<b || this.feq(a,b);
      },
      pack(o){ return JSON.stringify(o) },
      unpack(s){ return JSON.parse(s) },
      v2(x,y){ return [x,y] },
      p2(x,y){ return {x: x, y: y} },
      numOrZero(n){ return isNaN(n) ? 0 : n },
      or(a,b){ return a===undefined?b:a },
      parseNumber(s,dft){
        let n=parseFloat(s);
        return (isNaN(n) && isNum(dft)) ? dft : n;
      },
      splitVerStr(s){
        let arr=(""+(s || "")).split(".").filter(s=> s.length>0);
        let major=this.parseNumber(arr[0],0);
        let minor=this.parseNumber(arr[1],0);
        let patch=this.parseNumber(arr[2],0);
        return [major, minor, patch];
      },
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
      findFiles(files, exts){
        return files.filter(s=> exts.indexOf(_fext(s)) > -1);
      },
      pdef(obj){
        obj.enumerable=true;
        obj.configurable=true;
        return obj;
      },
      partition(count,arr){
        let out=[];
        for(let row,i=0;;){
          row=[];
          for(let j=0;j<count;++j){
            if(i<arr.length){
              row.push(arr[i]);
              ++i;
            }else{
              if(row.length>0) out.push(row);
              return out;
            }
          }
        }
      },
      range(start,end){
        _.assert(start !== undefined);
        let out=[];
        if(arguments.length===1){ end=start; start=0 }
        for(let i=start;i<end;++i){ out.push(i) }
        return out
      },
      keys(obj){
        return isMap(obj) ? Array.from(obj.keys())
                          : (isObject(obj) ? Object.keys(obj) : []);
      },
      selectNotKeys(coll,keys){
        let out;
        if(isMap(coll) || isObject(coll)){
          out= isMap(coll) ? new Map() : {};
          keys=_.seq(keys);
          _.doseq(coll,(v,k)=>{
            if(!keys.includes(k)){
              if(isMap(out))
                out.set(k, v);
              else
                out[k]= v;
            }
          });
        }
        return out;
      },
      selectKeys(coll,keys){
        let out;
        if(isMap(coll) || isObject(coll)){
          if(isMap(coll)) out=new Map();
          else out={};
          this.seq(keys).forEach(k=>{
            if(isMap(coll)){
              if(coll.has(k))
                out.set(k, coll.get(k));
            }else{
              if(OBJ.hasOwnProperty.call(coll, k))
                out[k]= coll[k];
            }
          });
        }
        return out;
      },
      assertNot(cond){
        if(cond)
          throw (arguments.length<2) ? "Assert Failed!" : slicer.call(arguments,1).join("");
        return true
      },
      assert(cond){
        if(!cond)
          throw (arguments.length<2) ? "Assert Failed!" : slicer.call(arguments,1).join("");
        return true
      },
      noSuchKeys(keys,target){
        let r=this.some(this.seq(keys),k => this.has(target,k)?k:null);
        if(r) console.log("keyfound="+r);
        return !r;
      },
      randFloat(min, max){
        return min + PRNG() * (max - min);
      },
      randMinus1To1(){ return (PRNG() - 0.5) * 2 },
      randInt(num){ return Math.floor(PRNG() * num) },
      randInt2: _randXYInclusive,
      rand(){ return PRNG() },
      randSign(){ return _.rand() > 0.5 ? -1 : 1 },
      inst(type,obj){ return obj instanceof type },
      hashCode(s){
        let h=0;
        for(let i=0; i<s.length; ++i)
          h = Math.imul(31, h) + s.charCodeAt(i) | 0;// force to be 32 bit int via | 0
        return h;
      },
      randArrayItem(arr){
        if(arr)
          return arr.length===0 ? null : arr.length === 1 ? arr[0] : arr[_.floor(_.rand() * arr.length)]
      },
      isPerc(s){
        return isStr(s) && s.match(/^([0-9])(\.?[0-9]+|[0-9]*)%$/);
      },
      isEven(n){
        return n>0 ? (n % 2 === 0) : ((-n) % 2 === 0);
      },
      jsMap(){ return new Map() },
      jsObj(){ return {} },
      jsVec(...args){
        return args.length===0 ? [] : args.slice();
      },
      lastIndex(coll){
        return (coll && coll.length) ? coll.length-1 : -1
      },
      head(coll){
        return (coll && coll.length) ? coll[0] : undefined
      },
      tail(coll){
        return (coll && coll.length) ? coll[coll.length-1] : undefined
      },
      floor(v){ return Math.floor(v) },
      ceil(v){ return Math.ceil(v) },
      abs(v){ return Math.abs(v) },
      sqrt(v){ return Math.sqrt(v) },
      min(a,b){ return Math.min(a,b) },
      max(a,b){ return Math.max(a,b) },
      slice(a,i){ return slicer.call(a, i) },
      every(c,v){
        for(let i=0;i<c.length;++i)
          if(c[i] !== v) return false;
        return c.length>0;
      },
      notAny(c,v){
        for(let i=0;i<c.length;++i)
          if(c[i] === v) return false;
        return c.length>0;
      },
      copy(to,from){
        if(!from) return to;
        if(!to) return from.slice();
        let len= Math.min(to.length,from.length);
        for(let i=0;i<len;++i) to[i]=from[i];
        return to;
      },
      append(to,from){
        if(!from) return to;
        if(!to) return from.slice();
        for(let i=0;i<from.length;++i) to.push(from[i]);
        return to;
      },
      fill(a,v){
        if(a)
          for(let i=0;i<a.length;++i){
            a[i] = isFun(v) ? v() : v;
          }
        return a;
      },
      size(obj){
        let len=0;
        if(isArray(obj)) len= obj.length;
        else if(isMap(obj)) len=obj.size;
        else if(obj) len=_.keys(obj).length;
        return len;
      },
      nextId(){ return ++_seqNum },
      now(){ return Date.now() },
      fileExt: _fext,
      fileNoExt(name){
        let pos= name.lastIndexOf(".");
        return pos>0 ? name.substring(0,pos) : name;
      },
      range(start,stop,step=1){
        if(typeof stop==="undefined"){
          stop=start; start=0; step=1;
        }
        let res=[];
        let len = (stop-start)/step;
        len = Math.ceil(len);
        len = Math.max(0, len);
        res.length=len;
        for(let i=0;i<len;++i){
          res[i] = start;
          start += step;
        }
        return res;
      },
      shuffle(obj){
        let res=slicer.call(obj,0);
        for(let x,j,i= res.length-1; i>0; --i){
          j = Math.floor(PRNG() * (i+1));
          x = res[i];
          res[i] = res[j];
          res[j] = x;
        }
        return res;
      },
      uniq(arr){
        let res= [];
        let prev= null;
        arr = slicer.call(arr).sort();
        arr.forEach(a=>{
          if(a !== undefined &&
             a !== prev) res.push(a);
          prev = a;
        });
        return res;
      },
      map(obj, fn,target){
        let res= [];
        if(isArray(obj))
          res= obj.map(fn,target);
        else if(isMap(obj)){
          obj.forEach((v,k)=>{
            res.push(fn.call(target, v,k,obj));
          });
        }else if(obj){
          for(let k in obj)
            if(OBJ.hasOwnProperty.call(obj, k))
              res.push(fn.call(target, obj[k],k,obj));
        }
        return res;
      },
      find(obj,fn,target){
        let args=slicer.call(arguments,3);
        if(isArray(obj)){
          for(let i=0,z=obj.length;i<z;++i)
            if(fn.apply(target, [obj[i], i].concat(args)))
              return obj[i];
        }else if(isMap(obj)){
          let ks=Array.from(obj.keys());
          for(let k,i=0,z=ks.length;i<z;++i){
            k=ks[i];
            if(fn.apply(target, [obj.get(k), k].concat(args)))
            return [k, obj.get(k)];
          }
        }else if(obj){
          for(let k in obj)
            if(OBJ.hasOwnProperty.call(obj, k) &&
               fn.apply(target, [obj[k], k].concat(args)))
              return [k,obj[k]];
        }
      },
      some(obj,fn,target){
        let res;
        let args=slicer.call(arguments,3);
        if(isArray(obj)){
          for(let i=0,z=obj.length;i<z;++i)
            if(res = fn.apply(target, [obj[i], i].concat(args)))
              return res;
        }else if(isMap(obj)){
          let ks=Array.from(obj.keys());
          for(let k,i=0,z=ks.length;i<z;++i){
            k=ks[i];
            if(res = fn.apply(target, [obj.get(k), k].concat(args)))
              return res;
          }
        }else if(obj){
          for(let k in obj)
            if(OBJ.hasOwnProperty.call(obj, k))
              if(res = fn.apply(target, [obj[k], k].concat(args)))
                return res;
        }
      },
      invoke(arr,key){
        let args=slicer.call(arguments,2);
        if(isArray(arr))
          arr.forEach(x => x[key].apply(x, args));
      },
      delay(wait,f){
        return setTimeout(f,wait);
      },
      timer(f,delay=0,repeat=false){
        return {
          repeat: !!repeat,
          id: repeat ? setInterval(f,delay) : setTimeout(f,delay)
        }
      },
      clear(handle){
        if(handle)
          handle.repeat ? clearInterval(handle.id)
                        : clearTimeout(handle.id)
      },
      rseq(obj,fn,target){
        if(isArray(obj) && obj.length>0)
          for(let i=obj.length-1;i>=0;--i)
            fn.call(target, obj[i],i);
      },
      doseq(obj,fn,target){
        if(isArray(obj))
          obj.forEach(fn,target);
        else if(isMap(obj))
          obj.forEach((v,k)=> fn.call(target,v,k,obj));
        else if(obj)
          for(let k in obj)
            if(OBJ.hasOwnProperty.call(obj,k))
            fn.call(target, obj[k], k, obj);
      },
      dissoc(obj,key){
        if(arguments.length>2){
          let prev,i=1;
          for(;i<arguments.length;++i)
            prev=this.dissoc(obj,arguments[i]);
          return prev;
        }else{
          let val;
          if(isMap(obj)){
            val=obj.get(key);
            obj.delete(key);
          }else if(obj){
            val = obj[key];
            delete obj[key];
          }
          return val;
        }
      },
      get(obj,key){
        if(typeof key !== "undefined"){
          if(isMap(obj)) return obj.get(key);
          else if(obj) return obj[key];
        }
      },
      assoc(obj,key,value){
        if(arguments.length>3){
          if(((arguments.length-1)%2) !== 0)
            throw "ArityError: expecting even count of args.";
          let prev, i=1;
          for(;i < arguments.length;){
            prev= this.assoc(obj,arguments[i],arguments[i+1]);
            i+=2;
          }
          return prev;
        }else{
          let prev;
          if(isMap(obj)){
            prev=obj.get(key);
            obj.set(key,value);
          }else if(obj){
            prev=obj[key];
            obj[key]=value;
          }
          return prev;
        }
      },
      disj(coll,obj){
        let i = coll ? coll.indexOf(obj) : -1;
        if(i > -1) coll.splice(i,1);
        return i > -1;
      },
      conj(coll,...objs){
        if(coll)
          objs.forEach(o => coll.push(o));
        return coll;
      },
      seq(arg,sep=","){
        if(typeof arg === "string")
          arg = arg.split(sep).map(s=>s.trim()).filter(s=>s.length>0);
        if(!isArray(arg)) arg = [arg];
        return arg;
      },
      has(obj,key){
        if(!key)
          return false;
        if(isMap(obj))
          return obj.has(key);
        if(isArray(obj))
          return obj.indexOf(key) !== -1;
        if(obj)
          return OBJ.hasOwnProperty.call(obj, key);
      },
      patch(des,additions){
        des=des || {};
        if(additions)
          Object.keys(additions).forEach(k=>{
            if(des[k]===undefined)
              des[k]=additions[k];
          });
        return des;
      },
      clone(obj){
        if(obj)
          obj=JSON.parse(JSON.stringify(obj));
        return obj;
      },
      inject(des){
        let args=slicer.call(arguments,1);
        des=des || {};
        args.forEach(s=>{
          if(s) Object.assign(des,s);
        });
        return des;
      },
      deepCopyArray(v){
        _.assert(is.vec(v),"Expected array");
        let out = [];
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
        let key = undefined;
        let ext = undefined;
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
      negate(func){
        _.assert(is.fun(func),"expected function");
        return function(...args){
          return !func.apply(this, args)
        }
      },
      reject(coll, func){
        return _.doseq(coll,_.negate(func))
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
        return _.reject(s.trim().split(sep), (z) => z.length===0)
      },
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
      isSSL(){
        return window && window.location && window.location.protocol.indexOf("https") >= 0
      },
      isMobile(navigator){
        return navigator && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      isSafari(navigator){
        return navigator && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
      }
    };
    //browser only--------------------------------------------------------------
    if(document){
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
      qSelector(sel){ return document.querySelectorAll(sel) },
      qId(id){ return document.getElementById(id) },
      parent(e){ return e ? e.parentNode : undefined },
      conj(par,child){ return par.appendChild(child) },
      byTag(tag, ns){
        return !is.str(ns) ? document.getElementsByTagName(id)
                           : document.getElementsByTagNameNS(ns,tag) },
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
          _.doseq(styles, (v,k) => { e.style[k]= v; });
        return e;
      },
      wrap(child,wrapper){
        let p=child.parentNode;
        wrapper.appendChild(child);
        p.appendChild(wrapper);
        return wrapper;
      },
      newElm(tag, attrs, styles){
        let e = document.createElement(tag);
        this.attrs(e,attrs);
        this.css(e,styles);
        return e;
      },
      newTxt(tag, attrs, styles){
        let e = document.createTextNode(tag);
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

    if(document){ _C.dom=dom }
    _C.EventBus= EventBus;
    _C.u= _;
    _C.is= is;
    return (_singleton=_C);
  };

})(this);


