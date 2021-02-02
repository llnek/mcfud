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
    const [Slicer,toStr]=[Array.prototype.slice, Object.prototype.toString];
    const MFL=Math.floor;
    function isObj(obj){ return toStr.call(obj) == "[object Object]" }
    function isNil(obj){ return toStr.call(obj) == "[object Null]" }
    function isFun(obj){ return toStr.call(obj) == "[object Function]" }
    function isVec(obj){ return toStr.call(obj) == "[object Array]" }
    function isMap(obj){ return toStr.call(obj) == "[object Map]" }
    function isStr(obj){ return toStr.call(obj) == "[object String]" }
    function isNum(obj){ return toStr.call(obj) == "[object Number]" }
    function isEven(n){ return n>0 ? (n%2 === 0) : ((-n)%2 === 0) }
    function isColl(o){ return isVec(o)||isMap(o)||isObj(o) }
    let PRNG= seed_rand?seed_rand():new Math.seedrandom();
    function _randXYInclusive(min,max){
      return MFL(PRNG() * (max-min+1) + min)
    }
    function _preAnd(conds,msg){
      for(let c,i=0;i<conds.length;++i){
        c=conds[i];
        if(!c[0](c[1]))
          throw new TypeError(`wanted ${msg}`);
      }
      return true;
    }
    function _preOr(conds,msg){
      for(let c,i=0;i<conds.length;++i){
        c=conds[i];
        if(c[0](c[1])){return true}
      }
      throw new TypeError(`wanted ${msg}`);
    }
    function _pre(f,arg,msg){
      if(!f(arg))
        throw new TypeError(`wanted ${msg}`);
      return true;
    }
    //regexes handling file paths
    const BNAME=/(\/|\\\\)([^(\/|\\\\)]+)$/g;
    const FEXT=/(\.[^\.\/\?\\]*)(\?.*)?$/;
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
     * @var {object}
     */
    const _$={};
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
      vec(v,...args){ return _everyF(isVec,v,args) },
      obj(o,...args){ return _everyF(isObj,o,args) },
      own(o,p){ return Object.prototype.hasOwnProperty.call(o,p) }
    };
    /**
     * @private
     * @var {object}
     */
    const _={
      /** Re-seed a random */
      srand(){ PRNG= seed_rand?seed_rand():new Math.seedrandom() },
      /** Fuzzy zero */
      feq0(a){ return Math.abs(a) < EPSILON },
      /** Fuzzy equals */
      feq(a, b){ return Math.abs(a-b) < EPSILON },
      /** Fuzzy greater_equals */
      //fgteq(a,b){ return a>b || this.feq(a,b) },
      /** Fuzzy less_equals */
      //flteq(a,b){ return a<b || this.feq(a,b) },
      /** Serialize to JSON */
      pack(o){ return JSON.stringify(o) },
      /** Deserialize from JSON */
      unpack(s){ return JSON.parse(s) },
      /** Put values into array */
      v2(x=0,y=0){ return [x,y] },
      /** 2D point(x,y) */
      p2(x=0,y=0){ return {x: x, y: y} },
      /** Return it if it's a number else 0 */
      numOrZero(n){ return isNaN(n) ? 0 : n },
      /** Return b if a doesn't exist else a */
      or(a,b){ return a===undefined?b:a },
      /** Convert input into number, if not return the default */
      toNumber(s,dft){
        const n=parseFloat(s);
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
      /** */
      pdef(obj){
        return (obj.configurable=true) && (obj.enumerable=true) && obj
      },
      /** Look for files matching any one of these extensions */
      findFiles(files, exts){
        return files.filter(s=> exts.indexOf(_fext(s,1)) > -1)
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
      /** Returns keys of object or Map. */
      keys(obj){
        return isMap(obj) ? Array.from(obj.keys())
                          : (isObj(obj) ? Object.keys(obj) : [])
      },
      /** Clone object/Map but exclude these keys */
      selectNotKeys(c,keys){
        _preOr([[isMap,c],[isObj,c]],"map/object");
        const out= isMap(c) ? new Map() : {};
        keys=this.seq(keys);
        this.doseq(c,(v,k)=> (!keys.includes(k)) && this.assoc(out,k,v));
        return out;
      },
      /** Choose these keys from object/map */
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
      /** assert the condition is false */
      assertNot(cond,...args){
        return this.assert(!cond,...args)
      },
      /** assert the condition is true */
      assert(cond,...args){
        if(!cond)
          throw args.length===0 ? "Assertion!" : args.join("");
        return true;
      },
      /** true if target has none of these keys */
      noSuchKeys(keys,target){
        return !this.some(this.seq(keys),k=> this.has(target,k)?k:null)
        //if(r) console.log("keyfound="+r);
        //return !r;
      },
      /** a random int between min and max */
      randInt2: _randXYInclusive,
      /** a random float between min and max-1 */
      randFloat(min, max){
        return min + PRNG() * (max-min)
      },
      /** a random float between -1 and 1 */
      randMinus1To1(){ return 2*(PRNG()-0.5) },
      /** a random int between 0 and num */
      randInt(num){ return MFL(PRNG()*num) },
      /** a random float between 0 and 1 */
      rand(){ return PRNG() },
      /** randomly choose -1 or 1 */
      randSign(){ return PRNG()>0.5 ? -1 : 1 },
      /** true if obj is subclass of type */
      inst(type,obj){ return obj instanceof type },
      /** Calculate hashCode of this string, like java hashCode */
      hashCode(s){
        let n=0;
        for(let i=0; i<s.length; ++i)
          n= Math.imul(31, n) + s.charCodeAt(i)
        return n;
      },
      /** Randomly choose an item from this array */
      randItem(arr){
        if(arr && arr.length>0)
          return arr.length===1 ? arr[0]
                                : arr[MFL(PRNG()*arr.length)]
      },
      /** true if string represents a percentage value */
      isPerc(s){
        return isStr(s) && s.match(/^([0-9])(\.?[0-9]+|[0-9]*)%$/)
      },
      /** true if number is even */
      isEven:isEven,
      /** Creates a javascript Map */
      jsMap(...args){
        _pre(isEven,args.length,"even n# of args");
        let out=new Map();
        for(let i=0;i<args.length;){
          out.set(args[i],args[i+1]);
          i+=2;
        }
        return out;
      },
      /** Creates a javascript object */
      jsObj(...args){
        _pre(isEven,args.length,"even n# of args");
        let out={};
        for(let i=0;i<args.length;){
          out[args[i]]=args[i+1];
          i+=2;
        }
        return out;
      },
      /** Creates a javascript array */
      jsVec(...args){ return args.length===0 ? [] : args.slice() },
      /** Returns the last index */
      lastIndex(c){ return (isVec(c) && c.length>0) ? c.length-1 : -1 },
      /** Returns the first element */
      first(c){ if(isVec(c) && c.length>0) return c[0] },
      /** Returns the last element */
      last(c){ if(isVec(c) && c.length>0) return c[c.length-1] },
      head(c){ return this.first(c) },
      tail(c){ return this.last(c) },
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
      slice(a,i){ return Slicer.call(a, i) },
      /** true only if every item in list equals v */
      every(c,v){
        _pre(isVec,c,"array");
        for(let i=0;i<c.length;++i){
          if(isFun(v)){
            if(!v(c[i])) return false;
          }else{
            if(c[i] !== v) return false;
          }
        }
        return c.length>0;
      },
      /** true only if no item in list equals v */
      notAny(c,v){
        _pre(isVec,c,"array");
        for(let i=0;i<c.length;++i){
          if(isFun(v)){
            if(v(c[i])) return false;
          }else{
            if(c[i] === v) return false;
          }
        }
        return c.length>0;
      },
      /** Copy all or some items from `from` to `to` */
      copy(to,from=[]){
        _preAnd([[isVec,to],[isVec,from]],"arrays");
        const len= Math.min(to.length,from.length);
        for(let i=0;i<len;++i) to[i]=from[i];
        return to;
      },
      /** Append all or some items from `from` to `to` */
      append(to,from=[]){
        _preAnd([[isVec,to],[isVec,from]],"arrays");
        for(let i=0;i<from.length;++i) to.push(from[i]);
        return to;
      },
      /** Fill array with v or v() */
      fill(a,v){
        if(isNum(a)){a= new Array(a)}
        if(isVec(a)){
          for(let i=0;i<a.length;++i)
            a[i]= isFun(v) ? v() : v;
        }
        return a;
      },
      /** Return the size of object/map/array/string */
      size(obj){
        return (isVec(obj)||isStr(obj)) ? obj.length
                          : isMap(obj) ? obj.size
                                       : obj ? this.keys(obj).length : 0
      },
      /** Next sequence number */
      nextId(){ return ++_seqNum },
      /** Time in milliseconds */
      now(){ return Date.now() },
      /** Find file extension */
      fileExt(path){ return _fext(path) },
      /** Find file name, no extension */
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
      /** return a list of numbers from start to end - like a Range object */
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
      /** Shuffle items */
      shuffle(obj){
        _pre(isVec,obj,"array");
        const res=Slicer.call(obj,0);
        for(let x,j,i= res.length-1; i>0; --i){
          j= MFL(PRNG() * (i+1));
          x= res[i];
          res[i] = res[j];
          res[j] = x;
        }
        return this.copy(obj,res);
      },
      /** Return only the distinct items */
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
        return Array.from(new Set(arr));
      },
      /** functional map but return same type as `obj` */
      map(obj, fn, target){
        _pre(isColl,obj,"array/map/object");
        if(isVec(obj)){
          return obj.map(fn,target);
        }else{
          const res={};
          this.doseq(obj,(v,k)=>{
            res[k]=fn.call(target, v,k,obj) });
          return res;
        }
      },
      /** `find` with extra args */
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
      /** `some` with extra args */
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
      /** Each item in the array is an object, invoke obj.method with extra args */
      invoke(arr,key){
        let args=Slicer.call(arguments,2);
        isVec(arr) &&
          //invoke the method on each object
          arr.forEach(o=> o[key].apply(o, args));
      },
      /** Run function after some delay */
      delay(wait,f){ return setTimeout(f,wait) },
      /** Create a once/repeat timer */
      timer(f,delay=0,repeat=false){
        return{
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
        _pre(isVec,coll,"array");
        if(coll.length>0){
          for(let i=coll.length-1;i>=0;--i)
            fn.call(target, coll[i],i,coll)
        }
      },
      /** Iterate a collection */
      doseq(coll,fn,target){
        if(isVec(coll)){
          coll.forEach(fn,target)
        }else if(isMap(coll)){
          coll.forEach((v,k)=> fn.call(target,v,k,coll))
        }else if(isObj(coll)){
          Object.keys(coll).forEach(k=> fn.call(target, coll[k], k, coll))
        }
      },
      /** Iterate collection but ignore nulls/undefs */
      doseqEx(coll,fn,target){
        this.doseq(coll,(v,k)=>
          v!==undefined&&v!==null&&fn.call(target,v,k,coll))
      },
      /** Remove a key from collection */
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
      /** Remove item from array */
      disj(coll,obj){
        const i = coll ? coll.indexOf(obj) : -1;
        if(i > -1) coll.splice(i,1);
        return i > -1;
      },
      /** Append item to array */
      conj(coll,...objs){
        if(coll)
          objs.forEach(o=> coll.push(o));
        return coll;
      },
      /** Make input into array */
      seq(arg,sep=/[,; \t\n]+/){
        if(typeof arg === "string")
          arg= arg.split(sep).map(s=>s.trim()).filter(s=>s.length>0);
        if(!isVec(arg)){arg = [arg]}
        return arg;
      },
      /** true if collection has property `key` */
      has(coll,key){
        return arguments.length===1 ? false
          : isMap(coll) ? coll.has(key)
          : isVec(coll) ? coll.indexOf(key) !== -1
          : isObj(coll) ? is.own(coll, key) : false;
      },
      /** Add these keys to `des` only if the key is missing */
      patch(des,additions){
        _pre(isObj,(des=des||{}),"object");
        if(additions)
          Object.keys(additions).forEach(k=>{
            if(!this.has(des,k))
              des[k]=additions[k];
          });
        return des;
      },
      /** Deep clone */
      clone(obj){
        return obj ? this.unpack(this.pack(obj)) : obj
      },
      /** Merge others into `des` */
      inject(des,...args){
        des=des || {};
        args.forEach(s=> s && Object.assign(des,s));
        return des;
      },
      /** Deep copy array/array of arrays */
      deepCopyArray(v){
        _pre(isVec,v,"array");
        const out = [];
        for(let i=0,z=v.length; i<z; ++i)
          out[i]= isVec(v[i]) ? this.deepCopyArray(v[i]) : v[i];
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
        return this.merge(this.merge({}, original), extended)
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
      /** Return a function that will return the negation of original func */
      negate(func){
        _pre(isFun,func,"function");
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
        return (len -= str.length)>0 ?
          str+new Array(Math.ceil(len/s.length)+1).join(s).substr(0, len) : str
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
        return (len -= str.length)>0 ?
          new Array(Math.ceil(len/s.length)+1).join(s).substr(0, len) + str : str
      },
      /**
       * Safely split a string, null and empty strings are removed.
       * @function
       * @param {String} s
       * @param {String} sep
       * @return {Array.String}
      */
      safeSplit(s, sep){
        return (s||"").trim().split(sep).filter(z=> z.length>0)
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
        return this.strPadLeft(Number(num).toString(), digits, "0")
      },
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
      /**
       * Remove some arguments from the front.
       * @function
       * @param {Javascript.arguments} args
       * @param {Number} num
       * @return {Array} remaining arguments
      */
      dropArgs(args, num){
        return args.length>num ? Slicer.call(args, num) : []
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
      }
    };
    //browser only--------------------------------------------------------------
    if(doco){
      _.addEvent=function(event,target,cb,arg){
        if(isVec(event) && arguments.length===1)
          event.forEach(e=> this.addEvent.apply(this, e));
        else
          target.addEventListener(event,cb,arg);
      };
      _.delEvent=function(event,target,cb,arg){
        if(isVec(event) && arguments.length===1)
          event.forEach(e => this.delEvent.apply(this, e));
        else
          target.removeEventListener(event,cb,arg);
      };
    }
    /**
     * @private
     * @var {object}
     */
    const dom={
      qSelector(sel){ return doco.querySelectorAll(sel) },
      qId(id){ return doco.getElementById(id) },
      parent(e){ if(e) return e.parentNode },
      conj(par,child){ return par.appendChild(child) },
      byTag(tag, ns){
        return !isStr(ns) ? doco.getElementsByTagName(id)
                          : doco.getElementsByTagNameNS(ns,tag) },
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
      wrap(child,wrapper){
        const p=child.parentNode;
        wrapper.appendChild(child);
        p.appendChild(wrapper);
        return wrapper;
      },
      newElm(tag, attrs, styles){
        const e = doco.createElement(tag);
        this.attrs(e,attrs);
        this.css(e,styles);
        return e;
      },
      newTxt(tag, attrs, styles){
        const e = doco.createTextNode(tag);
        this.attrs(e,attrs);
        this.css(e,styles);
        return e;
      }
    };
    /**
     * @private
     * @function
     */
    const EventBus=function(){
      let _tree= _.jsMap();
      let NULL={};
      let ZA=[];
      return{
        sub(subject,cb,ctx,extras){
          let event=subject[0],
              target=subject[1];
          //handle multiple events in one string
          _.seq(event).forEach(e=>{
            if(!cb) cb=e;
            if(isStr(cb)) { ctx=ctx || target; cb=ctx[cb]; }
            if(!cb) throw "Error: no callback for sub()";
            if(!_tree.has(e)) _tree.set(e, _.jsMap());
            let m= _tree.get(e);
            target=target||NULL;
            !m.has(target) && m.set(target,[]);
            m.get(target).push([cb,ctx,extras]);
          });
        },
        pub(subject,...args){
          let m,t,
              event=subject[0],
              target=subject[1] || NULL;
          _.seq(event).forEach(e=>{
            t=_tree.get(e);
            m= t && t.get(target);
            m && m.forEach(s=>{
              s[0].apply(s[1],args.concat(s[2] || ZA));
            });
          });
        },
        reset(){
          _tree.clear()
        },
        unsub(subject,cb,ctx){
          let event=subject[0],
              target=subject[1] || NULL;
          let t,m, es=_.seq(event);
          es.forEach(e=>{
            t= _tree.get(e);
            m= t && t.get(target);
            if(m){
              if(isStr(cb)) { ctx=ctx || target; cb=ctx[cb]; }
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

    return{
      is: is,
      u: _,
      dom: doco?dom:{},
      EventBus: EventBus
    };
  }

  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module==="object" && module.exports){
    module.exports=_module()
  }else{
    window["io/czlab/mcfud/core"]=_module
  }

})(this);


