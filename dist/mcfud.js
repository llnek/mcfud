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
  /**
   * @private
   * @function
   */
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    //const EPSILON= 0.0000000001;
    const NEG_DEG_2PI= -360;
    const DEG_2PI= 360;
    const TWO_PI= 2*Math.PI;
    const PI= Math.PI;
    const {is,u:_}= Core;
    function _mod_deg(deg){
      return deg<0 ? -(-deg%DEG_2PI) : deg%DEG_2PI
    }
    const _$={
      /** liner interpolation */
      lerp(startv, endv, t){
        return (1-t) * startv + t * endv
      },
      /** Proper modulo. */
      xmod(x,N){
        return x<0 ? x-(-(N + N*Math.floor(-x/N))) : x%N
      },
      clamp(min,max,v){
        return v<min ? min : (v>max ? max : v)
      },
      sqr(a){ return a*a },
      fuzzyEq(a,b){ return _.feq(a,b) },
      fuzzyZero(n){ return _.feq0(n) },
      radToDeg(r){ return _mod_deg(DEG_2PI * r/TWO_PI) },
      degToRad(d){ return TWO_PI * _mod_deg(d)/DEG_2PI },
      /** Hypotenuse squared. */
      pythag2(x,y){ return x*x + y*y },
      /** Hypotenuse. */
      pythag(x,y){ return Math.sqrt(x*x + y*y) },
      /** Modulo of the next increment. */
      wrap(i,len){ return (i+1) % len },
      /** Is it more a or b? */
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
  /**
   * @private
   * @function
   */
  function _module(UseOBJ=false,Core=null){
    class V2Obj{ constructor(){ this.x=0;this.y=0 } }
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_, is}= Core;
    const PLEN=96;
    function _CTOR(){
      return UseOBJ ? new V2Obj() : [0,0] }
    let _POOL=_.fill(PLEN,_CTOR);
    /**Put stuff back into the pool.
     * @private
     * @function
     */
    function _drop(...args){
      for(let a,i=0;i<args.length;++i){
        a=args[i];
        if(_POOL.length<PLEN){
          if((UseOBJ && a instanceof V2Obj) ||
            (!UseOBJ && a && a.length===2)) {
            _POOL.push(a);
          }
        }else{break}
      }
    }
    /**Take something from the pool.
     * @private
     * @function
     */
    function _take(x=0,y=0){
      const out= _POOL.length>0 ? _POOL.pop() : _CTOR();
      if(UseOBJ){
        out.x=x;
        out.y=y;
      }else{
        out[0]=x;
        out[1]=y;
      }
      return out;
    }
    /**
     * @private
     * @var {object}
     */
    const _4ops={ "+": (a,b)=>a+b, "-": (a,b)=>a-b,
                  "*": (a,b)=>a*b, "/": (a,b)=>a/b };
    /**Make sure we have good data.
     * @private
     * @function
     */
    function _assertArgs(a,b,hint){
      if(hint===0){
        //b's type must be same as arg[0]
      }else if(is.num(b)) {b=a}
      UseOBJ ? _.assert(a instanceof V2Obj && b instanceof V2Obj)
             : _.assert(a.length===2&&is.vec(b)&&a.length===b.length);
      return true;
    }
    /**
     * @private
     * @function
     */
    function _vecXXX(op,a,b,c,local){
      let out= _assertArgs(a,b) ? (local ? a : _CTOR()) : null;
      let n= is.num(b);
      if(is.num(c)){
        _.assert(is.num(b),"wanted number");
      }else if(n){
        c=b;
      }
      if(UseOBJ){
        out.x=op(a.x, n?b:b.x);
        out.y=op(a.y, n?c:b.y);
      }else{
        out[0]=op(a[0], n?b:b[0]);
        out[1]=op(a[1], n?c:b[1]);
      }
      return out;
    }
    /**Rotate a vector([]) around a pivot.
     * @private
     * @function
     */
    function _v2rot_arr(a,cos,sin,pivot,local){
      const cx=pivot ? pivot[0] : 0;
      const cy=pivot ? pivot[1] : 0;
      const x_= a[0] - cx;
      const y_= a[1] - cy;
      const x= cx + (x_*cos - y_*sin);
      const y= cy + (x_ * sin + y_ * cos);
      if(local){ a[0] = x; a[1] = y; }else{
        a= _take(x,y);
      }
      return a;
    }
    /**Rotate a vector(obj) around a pivot.
     * @private
     * @function
     */
    function _v2rot_obj(a,cos,sin,pivot,local){
      const cx=pivot ? pivot.x : 0;
      const cy=pivot ? pivot.y : 0;
      const x_= a.x - cx;
      const y_= a.y - cy;
      const x= cx + (x_*cos - y_*sin);
      const y= cy + (x_ * sin + y_ * cos);
      if(local){ a.x = x; a.y = y; }else{
        a= _take(x,y);
      }
      return a;
    }
    /**2d cross product, data-type=[].
     * @private
     * @function
     */
    function _vecXSS_arr(p1,p2){
      //v2 X v2
      if(is.vec(p1) && is.vec(p2)){
        _assertArgs(p1,p2);
        return p1[0] * p2[1] - p1[1] * p2[0]
      }
      //v2 X num
      if(is.vec(p1) && is.num(p2)){
        _assertArgs(p1,p1);
        return _take(p2 * p1[1], -p2 * p1[0])
      }
      //num X v2
      if(is.num(p1) && is.vec(p2)){
        _assertArgs(p2,p2);
        return _take(-p1 * p2[1], p1 * p2[0])
      }
      _.assert(false,"cross(): bad args");
    }
    /**2d cross product, data-type=object.
     * @private
     * @function
     */
    function _vecXSS_obj(p1,p2){
      //v2 X v2
      if(p1 instanceof V2Obj && p2 instanceof V2Obj){
        return p1.x * p2.y - p1.y * p2.x
      }
      //v2 X num
      if(p1 instanceof V2Obj && is.num(p2)){
        return _take(p2 * p1.y, -p2 * p1.x)
      }
      //num X v2
      if(is.num(p1) && p2 instanceof V2Obj){
        return _take(-p1 * p2.y, p1 * p2.x)
      }
      _.assert(false,"cross(): bad args");
    }
    /**The object to export.
     * @private
     * @var {object}
     */
    const _$={
      /** internal, for testing only */
      _switchMode(bObj,size=16){
        UseOBJ=bObj;
        _POOL=_.fill(size||PLEN,_CTOR); },
      /** internal, for testing only */
      _checkPoolSize(){ return _POOL.length },
      take:_take,
      reclaim:_drop,
      vec(x,y){ return _take(x,y) },
      /** A+B */
      add(a,b,c){ return _vecXXX(_4ops["+"],a,b,c) },
      /** A= A+B */
      add$(a,b,c){ return _vecXXX(_4ops["+"],a,b,c,1) },
      /** A-B */
      sub(a,b,c){ return _vecXXX(_4ops["-"],a,b,c) },
      /** A=A-B */
      sub$(a,b,c){ return _vecXXX(_4ops["-"],a,b,c,1) },
      /** A*B */
      mul(a,b,c){ return _vecXXX(_4ops["*"],a,b,c) },
      /** A=A*B */
      mul$(a,b,c){ return _vecXXX(_4ops["*"],a,b,c,1) },
      /** A/B */
      div(a,b,c){ return _vecXXX(_4ops["/"],a,b,c) },
      /** A=A/B */
      div$(a,b,c){ return _vecXXX(_4ops["/"],a,b,c,1) },
      /** Dot product of vectors, cos(t) = a·b / (|a| * |b|) */
      dot(a,b){
        if(_assertArgs(a,b,0))
          return UseOBJ ? (a.x*b.x + a.y*b.y)
                        : (a[0]*b[0] + a[1]*b[1])
      },
      /** vectorAB is calculated by doing B-A */
      vecAB(a,b){
        if(_assertArgs(a,b,0))
          return UseOBJ ? _take(b.x-a.x,b.y-a.y)
                        : _take(b[0]-a[0],b[1]-a[1])
      },
      /** length square */
      len2(a){ return this.dot(a,a) },
      len(a){ return Math.sqrt(this.len2(a)) },
      /** distance square */
      dist2(a,b){
        let v= this.sub(b,a),
            d= this.len2(v);
        _drop(v);
        return d;
      },
      /** distance */
      dist(a,b){ return Math.sqrt(this.dist2(a,b)) },
      /** unit vector */
      unit(a){
        let d=this.len(a),
            out= _CTOR();
        if(!_.feq0(d)){
          if(UseOBJ){
            out.x= a.x/d;
            out.y= a.y/d;
          }else{
            out[0]= a[0]/d;
            out[1]= a[1]/d;
          }
        }
        return out;
      },
      /** A=unit(A) */
      unit$(a){
        let d=this.len(a);
        if(!_.feq0(d)){
          if(UseOBJ){
            a.x /= d;
            a.y /= d;
          }else{
            a[0] /= d;
            a[1] /= d;
          }
        }
        return a;
      },
      /** Copy `src` into `des` */
      set(des,src){
        _assertArgs(des,src,0);
        if(UseOBJ){
          des.x=src.x;
          des.y=src.y;
        }else{
          des[0]=src[0];
          des[1]=src[1];
        }
        return des;
      },
      /** */
      clone(v){ return this.set(_CTOR(),v) },
      /** Copy values(args) into `des` */
      copy(des,x,y){
        _.assert(is.num(x)&&is.num(y),"wanted numbers");
        if(UseOBJ){
          des.x=x;
          des.y=y;
        }else{
          des[0]=x;
          des[1]=y;
        }
        return des;
      },
      /** Rotate a vector around a pivot */
      rot(a,rot,pivot){
        _assertArgs(a, pivot||a,0);
        const c= Math.cos(rot);
        const s= Math.sin(rot);
        return UseOBJ ? _v2rot_obj(a,c,s,pivot) : _v2rot_arr(a,c,s,pivot);
      },
      /** A=rot(A) */
      rot$(a,rot,pivot){
        _assertArgs(a, pivot||a,0);
        const c= Math.cos(rot);
        const s= Math.sin(rot);
        return UseOBJ ? _v2rot_obj(a,c,s,pivot,1)
                      : _v2rot_arr(a,c,s,pivot,1);
      },
      /** 2d cross product */
      cross(p1,p2){ return UseOBJ ? _vecXSS_obj(p1,p2) : _vecXSS_arr(p1,p2) },
      /**
       * Angle (in radians) between these 2 vectors.
       * a.b = cos(t)*|a||b|
       */
      angle(a,b){ return Math.acos(this.dot(a,b)/(this.len(a)*this.len(b))) },
      /**
       * Change vector to be perpendicular to what it was before, effectively
       * rotates it 90 degrees(normal)
       */
      normal(a,ccw=false){
        _assertArgs(a,a);
        if(UseOBJ){
          return ccw ? _take(-a.y,a.x) : _take(a.y,-a.x)
        }else{
          return ccw ? _take(-a[1],a[0]) : _take(a[1],-a[0])
        }
      },
      /** A=normal(A) */
      normal$(a,ccw=false){
        _assertArgs(a,a);
        const x= UseOBJ ? a.x : a[0];
        if(UseOBJ){
          if(ccw){ a.x=-a.y; a.y= x; }else{ a.x=a.y; a.y= -x; }
        }else{
          if(ccw){ a[0]=-a[1]; a[1]= x; }else{ a[0]=a[1]; a[1]= -x; }
        }
        return a;
      },
      /** Find scalar projection A onto B */
      proj_scalar(a,b){ return this.dot(a,b)/this.len(b) },
      /** Find vector A projection onto B */
      proj(a,b){
        const bn = this.unit(b);
        return this.mul$(bn, this.dot(a,bn));
      },
      /** Find the perpedicular vector */
      perp(a,b){ return this.sub(a, this.proj(a,b)) },
      /** Reflect a ray, normal must be normalized */
      reflect(ray,surface_normal){
        //ray of light hitting a surface, find the reflected ray
        //reflect= ray - 2(ray.surface_normal)surface_normal
        return this.sub(ray, this.mul(surface_normal, 2*this.dot(ray,surface_normal)))
      },
      /** Negate a vector */
      flip(v){ return this.mul(v, -1) },
      /** V=flip(V) */
      flip$(v){ return this.mul$(v, -1) },
      /** Move a bunch of points */
      translate(pos,...args){
        _assertArgs(pos,pos);
        let b,a=false;
        if(args.length===1 && is.vec(args[0])){
          args=args[0];
          a=true;
        }
        if(args.length>0){
          _assertArgs(pos,args[0],0);
          b=args.length===1&&!a;
          if(UseOBJ){
            return b ? this.vec(pos.x+args[0].x,pos.y+args[0].y)
                     : args.map(p=> this.vec(pos.x+p.x,pos.y+p.y))
          }else{
            return b ? this.vec(pos[0]+args[0][0],pos[1]+args[0][1])
                     : args.map(p=> this.vec(pos[0]+p[0],pos[1]+p[1]))
          }
        }
      }
    };
    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(false, require("./core"))
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
  /**
   * @private
   * @function
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
     * @private
     * @function
     */
    function _arrayEq(a1,a2){
      //2 numeric arrays are equal?
      for(let i=0;i<a1.length;++i){
        if(!_.feq(a1[i],a2[i]))
          return false;
      }
      return true
    }
    /**
     * @private
     * @function
     */
    function _odd(n){ return n%2 !== 0 }
    /**
     * Index where matrix is mapped to 1D array.
     * @private
     * @function
     */
    function _cell(rows,cols,r,c){
      return (c-1) + ((r-1)*cols)
    }
    /**Cells are provided.
     * @private
     * @function
     */
    function _matnew(rows,cols,cells){
      return {dim: [rows,cols], cells: cells}
    }
    /**Cells are all zeroes.
     * @private
     * @function
     */
    function _new_mat(rows,cols){
      return _matnew(rows,cols, _.fill(rows*cols,0))
    }
    /**
     * @private
     * @var {object}
     */
    const _$={
      V4(x=0,y=0,z=0,K=0){ return [x,y,z,K] },
      V3(x=0,y=0,z=0){ return [x,y,z] },
      /* 3D dot product */
      dot(a,b){
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
      },
      cross(a,b){
        return this.V3(a[1] * b[2] - a[2] * b[1],
                       a[2] * b[0] - a[0] * b[2],
                       a[0] * b[1] - a[1] * b[0])
      },
      len2(a){ return this.dot(a,a) },
      len(a){ return Math.sqrt(this.len2(a)) },
      unit(a){
        let d=this.len(a);
        let out=this.V3();
        if(!_.feq0(d)){
          out[0]=a[0]/d;
          out[1]=a[1]/d;
          out[2]=a[2]/d;
        }
        return out;
      },
      sub(a,b){
        return is.num(b) ? this.V3(a[0]-b, a[1]-b, a[2]-b)
                         : this.V3(a[0]-b[0], a[1]-b[1], a[2]-b[2])
      },
      add(a,b){
        return is.num(b) ? this.V3(a[0]+b, a[1]+b, a[2]+b)
                         : this.V3(a[0]+b[0], a[1]+b[1], a[2]+b[2])
      },
      mul(a,b){
        return is.num(b) ? this.V3(a[0]*b, a[1]*b, a[2]*b)
                         : this.V3(a[0]*b[0], a[1]*b[1], a[2]*b[2])
      },
      div(a,b){
        return is.num(b) ? this.V3(a[0]/b, a[1]/b, a[2]/b)
                         : this.V3(a[0]/b[0], a[1]/b[1], a[2]/b[2])
      },
      matrix([rows,cols],...args){
        const sz= rows*cols;
        return args.length===0 ? _new_mat(rows,cols)
                               : _.assert(sz===args.length) && _matnew(rows,cols,args)
      },
      matIdentity(sz){
        const out=_.fill(sz*sz,0);
        for(let i=0;i<sz;++i)
          out[_cell(sz,sz,i+1,i+1)] = 1;
        return _matnew(sz, sz, out)
      },
      matZero(sz){
        return _.assert(sz>0) &&
               _matnew(sz,sz,_.fill(sz*sz,0))
      },
      matRowMajors(m){
        const [rows,cols]=m.dim;
        return _.partition(cols,m.cells)
      },
      matColMajors(m){
        const [rows,cols]=m.dim;
        const out=[];
        for(let a,c=0;c<cols;++c){
          a=[];
          for(let r=0;r<rows;++r){
            a.push(m.cells[r*cols+c])
          }
          out.push(a);
        }
        return out;
      },
      /** A 2x2 matrix. */
      mat2(_11,_12,_21,_22){
        return this.matrix([2,2],_11,_12,_21,_22)
      },
      /** A 3x3 matrix. */
      mat3(_11,_12,_13,_21,_22,_23,_31,_32,_33){
        return this.matrix([3,3], _11,_12,_13,_21,_22,_23,_31,_32,_33)
      },
      /** A 4x4 matrix. */
      mat4(_11,_12,_13,_14,_21,_22,_23,_24,
           _31,_32,_33,_34, _41,_42,_43,_44){
        return this.matrix([4,4],
                           _11,_12,_13,_14,_21,_22,_23,_24,
                           _31,_32,_33,_34,_41,_42,_43,_44)
      },
      /** Matrices are equal */
      matEq(a,b){
        return a.dim[0]===b.dim[0] &&
               a.dim[1]===b.dim[1] ? _arrayEq(a.cells,b.cells) : false
      },
      /** Matrices are not equal */
      matNEq(a,b){ return !this.matEq(a,b) },
      /** Transpose a matrix */
      matXpose(m){
        const [rows,cols]= m.dim;
        const sz=rows*cols;
        const tmp=[];
        for(let i=0;i<sz;++i)
          tmp.push(m.cells[MFL(i/rows) + cols*(i%rows)]);
        return _matnew(cols,rows,tmp)
      },
      /** Scalar multiply a matrix */
      matScale(m,n){
        return _matnew(m.dim[0],m.dim[1],m.cells.map(x=> x*n))
      },
      /** Multiply 2 matrices */
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
      /** Determinent */
      matDet(m){
        let [rows,cols]=m.dim;
        let tmp=[];
        if(cols===2)
          return this.matDet2x2(m);
        for(let c=0; c< cols;++c)
          _.conj(tmp,this.matDet(this.matCut(m,1,c+1)));
        return _.range(cols).reduce((acc,j)=>{
          let v=tmp[j];
          return acc + m.cells[j] * (_odd(j) ? -v : v)
        },0)
      },
      /** Matrix determinent */
      matDet2x2(m){
        _.assert(m.cells.length===4);
        return m.cells[0]*m.cells[3] - m.cells[1] * m.cells[2]
      },
      /** Extract a portion of a matrix; get rid of a row and col */
      matCut(m,row,col){
        let [rows,cols]=m.dim;
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
      /** Matrix minor */
      matMinor(m){
        let [rows,cols]=m.dim;
        let tmp=[];
        if(cols===2)
          return this.matMinor2x2(m);
        for(let i=0; i< rows;++i)
          for(let j=0; j<cols; ++j){
            //mat-cut is 1-indexed
            _.conj(tmp,this.matDet(this.matCut(m,i+1,j+1)));
          }
        return _matnew(rows,cols,tmp)
      },
      matMinor2x2(m){
        return _.assert(m.cells.length===4) &&
               this.mat2(m.cells[3],m.cells[2],m.cells[1],m.cells[0])
      },
      /** Matrix co-factor */
      matCofactor(m){
        let minor=this.matMinor(m);
        let [rows,cols]=minor.dim;
        let tmp=minor.cells.slice();
        for(let r=0;r<rows;++r)
          for(let p,c=0;c<cols;++c){
            p=r*cols+c;
            if(_odd(r+c))
              tmp[p]= -tmp[p];
          }
        return _matnew(rows,cols,tmp)
      },
      /** Matrix adjugate */
      matAdjugate(m){
        return this.matXpose(this.matCofactor(m))
      },
      /** Inverse a matrix */
      _minv2x2(m){
        let [rows,cols]=m.dim;
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
      /** Inverse a matrix*/
      matInverse(m){
        let [rows,cols]=m.dim;
        if(cols===2)
          return this._minv2x2(m);
        let d= this.matDet(m);
        return _.feq0(d) ? this.matIdentity(rows)
                         : this.matScale(this.matAdjugate(m), 1/d)
      },
      /** Matrix from column major */
      matFromColMajor(arr,numCols){
        _.assert(arr.length%numCols===0);
        let rows=arr.length/numCols,
            out=_new_mat(rows,numCols);
        for(let r,c,i=0;i<arr.length;++i){
          r=i%rows;
          c=MFL(i/rows);
          out.cells[r*numCols+c]=arr[i];
        }
        return out;
      },
      /** Matrix to column major */
      matToColMajor(m){
        const [rows,cols]=m.dim;
        const out=m.cells.slice();
        for(let i=0,c=0;c<cols;++c)
          for(let r=0;r<rows;++r){
            out[i++]=m.cells[r*cols+c];
          }
        return {cells: out, depth:rows};
      },
      scale3D(V3){
        let out=this.matIdentity(4);
        out.cells[_cell(4,4,1,1)]=V3[0];
        out.cells[_cell(4,4,2,2)]=V3[1];
        out.cells[_cell(4,4,3,3)]=V3[2];
        return out;
      },
      translate3D(V3){
        let out=this.matIdentity(4);
        out.cells[_cell(4,4,4,1)]=V3[0];
        out.cells[_cell(4,4,4,2)]=V3[1];
        out.cells[_cell(4,4,4,3)]=V3[2];
        return out;
      },
      /** Rotation in 3D, order *important* */
      rot3D(roll,pitch,yaw){
        //x,y,z order is important, matrix not commutative
        return this.matMult(this.zRot3D(yaw),
                            this.matMult(this.yRot3D(pitch),
                                         this.xRot3D(roll)));
      },
      /** Multiply matrix and  vector */
      matVMult(m,v){
        let cols=m.dim[1];
        let rows=v.length;
        _.assert(cols===rows);
        let r= this.matMult(m, _matnew(rows, 1, v));
        let c=r.cells;
        r.cells=null;
        return c
      },
      /** Rotate a 2x2 matrix, counter-clockwise */
      rot2D(rot){
        return this.mat2(COS(rot),-SIN(rot),SIN(rot),COS(rot))
      },
      /** Rotate on x-axis in 4D */
      xRot3D(rad){
        return this.mat4(1,0,0,0,
                         0,COS(rad),-SIN(rad),0,
                         0,SIN(rad),COS(rad),0,
                         0,0,0,1)
      },
      /** Rotate on y-axis in 4D */
      yRot3D(rad){
        return this.mat4(COS(rad),0,SIN(rad),0,
                         0,1, 0, 0,
                         -SIN(rad), 0, COS(rad), 0,
                         0,0,0,1)
      },
      /** Rotate in z-axis in 4D */
      zRot3D(rad){
        return this.mat4(COS(rad), -SIN(rad), 0, 0,
                         SIN(rad),COS(rad), 0, 0,
                         0, 0, 1, 0,
                         0, 0, 0, 1)
      },
      /** True if m is an `identity` matrix */
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
          return true;
        }else{
          return false;
        }
      },
      /** Test if matrix is `orthogonal` */
      isOrthogonal(m){
        //Given a square matrixA, to check for its orthogonality steps are:
        //Find the determinant of A. If, it is 1 then,
        //find the inverse matrix of inv(A) and transpose of xpos(A),
        //if xpose(A) X inv(A) === I
        //then A will be orthogonal
        let r,d= this.matDet(m);
        return Math.abs(d)===1 &&
               this.isIdentity(this.matMult(this.matXpose(m), this.matInverse(m)));
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
  /**
   * @private
   * @function
   */
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    const {u:_} = Core;
    /**
     * Find the offset.
     * @private
     * @function
     */
    function _calcDelta(shift){
      return Math.abs(shift) % VISCHS_LEN
    }
    /**
     * Get the char at the index.
     * @private
     * @function
     */
    function _charat(pos,string_){
      return (string_ || VISCHS).charAt(pos)
    }
    /**
     * Index for this char.
     * @private
     * @function
     */
    function _getch(ch){
      for(let i=0;i<VISCHS_LEN;++i){
        if(_charat(i)===ch)
          return i;
      }
      return -1
    }
    /**
     * Rotate right.
     * @private
     * @function
     */
    function _rotr(delta, cpos){
      let pos= cpos+delta;
      return _charat(pos >= VISCHS_LEN ? (pos-VISCHS_LEN) : pos)
    }
    /**
     * Rotate left.
     * @private
     * @function
     */
    function _rotl(delta, cpos){
      let pos= cpos-delta;
      return _charat(pos< 0 ? (VISCHS_LEN+pos) : pos)
    }
    /**
     * @private
     * @var {object}
     */
    const _$={
      /** Encrypt source by shifts. */
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
      /** Decrypt text by shifts. */
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
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  "use strict";
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    /**
     * @private
     * @var {object}
     */
    const _$={
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
          trigger(event="change"){
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
                tx.action && tx.action();
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
   * @private
   * @var {object}
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
  /**
   * @private
   * @function
   */
  function _module(Core,_M){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();

    const TWO_PI=Math.PI*2;
    const {u:_}=Core;
    const _G={};
    /**
     * Html5 Text Style object.
     * @public
     * @function
     */
    _G.textStyle=function(font,fill,align,base){
      //"14px 'Arial'" "#dddddd" "left" "top"
      return {font: font, fill: fill, align: align, base: base}
    };
    /**
     * Draw the shape onto the html5 canvas.
     * @public
     * @function
     */
    _G.drawShape=function(ctx,s,...args){
      if(s.draw)
        s.draw(ctx,...args)
    };
    /**
     * Apply styles to the canvas.
     * @public
     * @function
     */
    _G.cfgStyle=function(ctx,styleObj){
      if(styleObj){
        let line=styleObj.line;
        let stroke=styleObj.stroke;
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
      }
    };
    /**
     * Draw and connect this set of points onto the canvas.
     * @public
     * @function
     */
    _G.drawPoints=function(ctx,points,size){
      if(size === undefined) size=points.length;
      ctx.beginPath();
      for(let i=0;i<size;++i){
        let i2= (i+1)%size;
        let p=points[i];
        let q=points[i2];
        ctx.moveTo(p[0],p[1]);
        ctx.lineTo(q[0],q[1]);
      }
      ctx.stroke();
    };
    /**
     * @public
     * @function
     */
    _G.drawShapePoly=function(ctx,poly){
      return this.drawPoints(ctx,poly.points);
    };
    /**
     * Draw a circle onto the canvas.  If a starting point
     * is provided, draw a line to the center.
     * @public
     * @function
     */
    _G.drawCircle=function(ctx,x,y,radius){
      ctx.beginPath();
      ctx.arc(x,y,radius,0,TWO_PI,true);
      ctx.closePath();
      ctx.stroke();
    };
    /**
     * @public
     * @function
     */
    _G.drawShapeCircle=function(ctx,circle){
      this.drawCircle(ctx,circle.pos[0],circle.pos[1],circle.radius);
    };
    /**
     * @public
     * @function
     */
    _G.drawRect=function(ctx,x,y,width,height,rot){
      let left=x;
      let top= y - height;
      ctx.save();
      ctx.translate(left,top);
      ctx.rotate(rot);
      ctx.strokeRect(0,0,width,height);
      ctx.restore();
    };
    /**
     * @public
     * @function
     */
    _G.drawShapeRect=function(ctx,rect){
      return this.drawRet(ctx,rect.pos[0],rect.pos[1],
                          rect.width,rect.height,rect.rotation);
    };
    /**
     * @public
     * @function
     */
    _G.drawLine=function(ctx,x1,y1,x2,y2){
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
      //ctx.closePath();
    };
    /**
     * @public
     * @function
     */
    _G.drawShapeLine=function(ctx,line){
      return this.drawLine(ctx,line.p[0],line.p[1],line.q[0],line.q[1]);
    };
    /**
     * @public
     * @class
     */
    class TXMatrix2d{
      constructor(source){
        if(source){
          this.m = [];
          this.clone(source);
        }else{
          this.m = [1,0,0,0,1,0];
        }
      }
      identity(){
        let m = this.m;
        m[0] = 1; m[1] = 0; m[2] = 0;
        m[3] = 0; m[4] = 1; m[5] = 0;
        return this;
      }
      clone(matrix){
        let d = this.m, s = matrix.m;
        d[0]=s[0]; d[1]=s[1]; d[2] = s[2];
        d[3]=s[3]; d[4]=s[4]; d[5] = s[5];
        return this;
      }
      multiply(matrix){
        let a = this.m, b = matrix.m;
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
      rotate(radians){
        if(radians === 0){ return this; }
        let cos = Math.cos(radians),
            sin = Math.sin(radians),
            m = this.m;

        let m11 = m[0]*cos  + m[1]*sin;
        let m12 = m[0]*-sin + m[1]*cos;
        let m21 = m[3]*cos  + m[4]*sin;
        let m22 = m[3]*-sin + m[4]*cos;

        m[0] = m11; m[1] = m12; // m[2] == m[2]
        m[3] = m21; m[4] = m22; // m[5] == m[5]
        return this;
      }
      rotateDeg(degrees){
        if(degrees === 0){ return this }
        return this.rotate(Math.PI * degrees / 180);
      }
      scale(sx,sy){
        let m = this.m;
        if(sy === undefined){ sy = sx; }
        m[0] *= sx;
        m[1] *= sy;
        m[3] *= sx;
        m[4] *= sy;
        return this;
      }
      translate(tx,ty){
        let m = this.m;
        m[2] += m[0]*tx + m[1]*ty;
        m[5] += m[3]*tx + m[4]*ty;
        return this;
      }
      transform(x,y){
        return [ x * this.m[0] + y * this.m[1] + this.m[2],
                 x * this.m[3] + y * this.m[4] + this.m[5] ];
      }
      transformPoint(obj){
        let x = obj.x, y = obj.y;
        obj.x = x * this.m[0] + y * this.m[1] + this.m[2];
        obj.y = x * this.m[3] + y * this.m[4] + this.m[5];
        return obj;
      }
      transformArray(inArr,outArr){
        let x = inArr[0], y = inArr[1];
        outArr[0] = x * this.m[0] + y * this.m[1] + this.m[2];
        outArr[1] = x * this.m[3] + y * this.m[4] + this.m[5];
        return outArr;
      }
      transformX(x,y){
        return x * this.m[0] + y * this.m[1] + this.m[2];
      }
      transformY(x,y){
        return x * this.m[3] + y * this.m[4] + this.m[5];
      }
      setContextTransform(ctx){
        let m = this.m;
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

    return _.inject(_G, {TXMatrix2d: TXMatrix2d});
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
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  "use strict";
  /**
   * @private
   * @function
   */
  function _module(Core,_M,_V){
    const [LEFT_VORONOI, MID_VORONOI, RIGHT_VORONOI]= [1,0,-1];
    //dependencies
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();
    if(!_V) _V=gscope["io/czlab/mcfud/vec2"]();
    const MaxVertices=36;
    const {u:_}=Core;
    const _G={};
    /**Standard Cartesian: bottom-left corner + width + height.
     * @public
     * @class
     */
    class Rect{
      constructor(x,y,width,height){
        switch(arguments.length){
          case 2:
            this.pos= _V.vec2();
            this.width=x;
            this.height=y;
            break;
          case 4:
            this.pos=_V.vec2(x,y);
            this.width=width;
            this.height=height;
            break;
          default:
            throw "Error: bad input to Rect()";
        }
      }
    }
    /**
     * @public
     * @class
     */
    class Area{
      constructor(w,h){
        this.width=w;
        this.height=h;
      }
      half(){
        return new Area(this.width/2|0,this.height/2|0)
      }
    }
    /**
     * Calculate the area of this polygon.
     * @private
     * @function
     */
    _G.polyArea=function(points){
      let area=0;
      for(let p,q,i2,len=points.length,i=0;i<len;++i){
        i2= (i+1)%len;
        p=points[i];
        q=points[i2];
        area += (p[0]*q[1] - q[0]*p[1]);
      }
      return Math.abs(area)/2|0;
    }
    /**
     * Find the center point of this polygon.
     * @public
     * @function
     */
    _G.calcPolyCenter=function(points){
      let A= 6*_G.polyArea(points);
      let cx=0;
      let cy=0;
      for(let p,q,i2,i=0,len=points.length;i<len;++i){
        i2= (i+1)%len;
        p=points[i];
        q=points[i2];
        cx += (p[0]+q[0]) * (p[0]*q[1]-q[0]*p[1]);
        cy += (p[1]+q[1]) * (p[0]*q[1]-q[0]*p[1]);
      }
      return _V.vec2(cx/A|0, cy/A|0);
    };
    /**
     * Copied from Randy Gaul's impulse-engine:
     * https://github.com/RandyGaul/ImpulseEngine#Shape.h
     * @private
     * @function
     */
    function _orderPoints(vertices){
      let count=vertices.length;
      _.assert(count > 2 && count <= MaxVertices); // at least 3
      //find the right-most point
      let rightMost=0;
      let highestX= vertices[0][0];
      for(let x,i=1; i<count; ++i){
        x=vertices[i][0];
        if(x>highestX){
          highestX= x;
          rightMost= i;
        }else if(_.feq(x, highestX) &&
                 vertices[i][1]<vertices[rightMost][1]){
          //if same x then choose one with smaller y
          rightMost = i;
        }
      }
      let hull=new Array(MaxVertices);
      let indexHull=rightMost;
      let outCount=0;
      for(;;){
        hull[outCount]=indexHull;
        //search for next index that wraps around the hull
        //by computing cross products to find the most counter-clockwise
        //vertex in the set, given the previos hull index
        let nextHullIndex = 0;
        for(let i=1; i<count; ++i){
          // skip if same coordinate as we need three unique
          // points in the set to perform a cross product
          if(nextHullIndex === indexHull){
            nextHullIndex = i;
            continue;
          }
          //cross every set of three unique vertices
          //record each counter clockwise third vertex and add
          //to the output hull
          //see: http://www.oocities.org/pcgpe/math2d.html
          let e1= _V.vecSub(vertices[nextHullIndex], vertices[hull[outCount]]);
          let e2= _V.vecSub(vertices[i], vertices[hull[outCount]]);
          let c= _V.vec2Cross(e1,e2);
          if(c<0.0)
            nextHullIndex=i;
          //cross product is zero then e vectors are on same line
          //therefore want to record vertex farthest along that line
          if(_.feq0(c) && _V.vecLen2(e2) > _V.vecLen2(e1))
            nextHullIndex = i;
        }
        ++outCount;
        indexHull=nextHullIndex;
        //conclude algorithm upon wrap-around
        if(nextHullIndex===rightMost){
          break;
        }
      }
      const result=[];
      for(let i=0; i<outCount; ++i)
        result.push(_V.vecClone(vertices[hull[i]]));
      return result;
    }
    /**
     * @public
     * @class
     */
    class Line{
      constructor(x1,y1,x2,y2){
        this.p= _V.vec2(x1,y1);
        this.q= _V.vec2(x2,y2);
      }
    }
    /**
     * @public
     * @class
     */
    class Circle{
      constructor(r){
        this.radius=r;
        this.orient=0;
        this.pos=_V.vec2();
      }
      setOrient(r){
        this.orient=r;
        return this;
      }
      setPos(x,y){
        _V.vecCopy(this.pos,x,y);
        return this;
      }
    }
    /**
     * Points are specified in COUNTER-CLOCKWISE order
     * @public
     * @class
     */
    class Polygon{
      constructor(x,y){
        this.calcPoints=null;
        this.normals=null;
        this.edges=null;
        this.points=null;
        this.orient = 0;
        this.pos=_V.vec2();
        this.setPos(x,y);
      }
      setPos(x=0,y=0){
        _V.vecCopy(this.pos,x,y);
        return this;
      }
      set(points){
        this.calcPoints= this.calcPoints || [];
        this.normals= this.normals || [];
        this.edges= this.edges || [];
        this.calcPoints.length=0;
        this.normals.length=0;
        this.edges.length=0;
        this.points= _orderPoints(points);
        _.doseq(this.points, p=>{
          this.calcPoints.push(_V.vec2());
          this.edges.push(_V.vec2());
          this.normals.push(_V.vec2());
        });
        return this._recalc();
      }
      setOrient(rot){
        this.orient = rot;
        return this._recalc();
      }
      translate(x, y){
        _.doseq(this.points,p=>{
          p[0] += x; p[1] += y;
        });
        return this._recalc();
      }
      _recalc(){
        if(this.points){
          _.doseq(this.points,(p,i)=>{
            _V.vecSet(this.calcPoints[i],p);
            if(!_.feq0(this.orient))
              _V.vec2RotSelf(this.calcPoints[i],this.orient);
          });
          let i2,p1,p2;
          _.doseq(this.points,(p,i)=>{
            i2= (i+1) % this.calcPoints.length;
            p1=this.calcPoints[i];
            p2=this.calcPoints[i2];
            this.edges[i]= _V.vecSub(p2,p1);
            this.normals[i]= _V.vecUnit(_V.perp(this.edges[i]));
          });
        }
        return this;
      }
    }
    /**
     * @public
     * @function
     */
    function toPolygon(r){
      return new Polygon(r.pos[0],
                         r.pos[1]).set([_V.vec2(r.width,0),
                                        _V.vec2(r.width,r.height),
                                        _V.vec2(0,r.height),_V.vec2()])
    }
    /**
     * @public
     * @class
     */
    class Manifold{
      constructor(A,B){
        this.overlapN = _V.vec2();
        this.overlapV = _V.vec2();
        this.A = A;
        this.B = B;
        this.clear();
      }
      clear(){
        this.overlap = Infinity;
        this.AInB = true;
        this.BInA = true;
        return this;
      }
    }
    /**
     * @public
     * @function
     */
    _G.getAABB=function(obj){
      if(_.has(obj,"radius")){
        return new _G.Rect(obj.pos[0]-obj.radius,
                           obj.pos[1]-obj.radius,
                           obj.radius*2, obj.radius*2)
      }else{
        let cps= _V.translate(obj.pos, obj.calcPoints);
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
        return new _G.Rect(xMin,
                           yMin,
                           xMax - xMin, yMax - yMin)
      }
    };
    /**
     * Shift a set of points.
     * @public
     * @function
     */
    _G.shiftPoints=function(points,delta){
      return points.map(v=> _V.vecAdd(v,delta))
    };
    /**
     * Rotate a set of points.
     * @public
     * @function
     */
    _G.rotPoints=function(points,rot,pivot){
      return points.map(v=> _V.vec2Rot(v,rot,pivot))
    };
    /**
     * Find the vertices of a rectangle.
     * @public
     * @function
     * @returns points in counter-cwise, bottom-right first.
     */
    _G.calcRectPoints=function(w,h){
      let hw=w/2|0;
      let hh=h/2|0;
      return [_V.vec2(hw,-hh),
              _V.vec2(hw,hh),
              _V.vec2(-hw,hh),
              _V.vec2(-hw,-hh)]
    };
    /**
     * @public
     * @function
     */
    _G.line=function(x1,y1,x2,y2){
      return new Line(x1,y1,x2,y2)
    };
    /**
     * @public
     * @function
     */
    _G.rectEqRect=function(r1,r2){
      return r1.width===r2.width &&
             r1.height===r2.height &&
             r1.pos[0]===r2.pos[0] &&
             r1.pos[1]===r2.pos[1]
    };
    /**Test if `R` contains `r`.
     * @public
     * @function
     */
    _G.rectContainsRect=function(R,r){
      return !(R.pos[0] >= r.pos[0] ||
               R.pos[1] >= r.pos[1] ||
               (R.pos[0]+R.width) <= (r.pos[0]+r.width) ||
               (R.pos[1]+R.height) <= (r.pos[1]+r.height))
    };
    /**
     * Right side on the x-axis.
     * @public
     * @function
     */
    _G.rectGetMaxX=function(r){
      return r.pos[0] + r.width
    }
    /**
     * Middle on the x-axis.
     * @public
     * @function
     */
    _G.rectGetMidX=function(r){
      return r.pos[0] + r.width/2|0
    };
    /**
     * @public
     * @function
     */
    _G.rectGetMinX=function(r){
      return r.pos[0]
    };
    /**
     * @public
     * @function
     */
    _G.rectGetMaxY=function(r){
      return r.pos[1] + r.height
    };
    /**
     * Mid point on the y-axis.
     * @public
     * @function
     */
    _G.rectGetMidY=function(r){
      return r.pos[1] + r.height/2|0
    };
    /**
     * @public
     * @function
     */
    _G.rectGetMinY=function(r){
      return r.pos[1]
    }
    /**
     * If point lies inside rect.
     * @public
     * @function
     */
    _G.rectContainsPoint=function(R,x,y){
      return x >= this.rectGetMinX(R) &&
             x <= this.rectGetMaxX(R) &&
             y >= this.rectGetMinY(R) &&
             y <= this.rectGetMaxY(R)
    };
    /**
     * @public
     * @function
     */
    _G.rectIntersectsRect=function(r1,r2){
      return !((r1.pos[0]+r1.width) < r2.pos[0] ||
               (r2.pos[0]+r2.width) < r1.pos[0] ||
               (r1.pos[1]+r1.height) < r2.pos[1] ||
               (r2.pos[1]+r2.height) < r1.pos[1])
    };
    /**
     * Find the union of two rects.
     * @public
     * @function
     */
    _G.rectUnionsRect=function(r1,r2){
      const x= Math.min(r1.pos[0],r2.pos[0]);
      const y= Math.min(r1.pos[1],r2.pos[1]);
      return new Rect(x,y,
                      Math.max(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                      Math.max(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
    };
    /**
     * @public
     * @function
     */
    _G.rectIntersectsRect=function(r1,r2){
      const x= Math.max(r1.pos[0],r2.pos[0]);
      const y= Math.max(r1.pos[1],r2.pos[1]);
      return new Rect(x,y,
                      Math.min(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                      Math.min(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
    };
    //------------------------------------------------------------------------
    // 2d collision using Separating Axis Theorem.
    // see https://github.com/jriecken/sat-js
    //------------------------------------------------------------------------
    /**
     * @private
     * @function
     */
    function _findProjRange(points, axis){
      let min = Infinity;
      let max = -Infinity;
      for(let dot,i=0; i<points.length; ++i){
        dot= _V.vecDot(points[i],axis);
        if(dot < min) min = dot;
        if(dot > max) max = dot;
      }
      return _V.take(min,max)
    }
    /**
     * @private
     * @function
     */
    function _voronoiRegion(line, point){
      let dp = _V.vecDot(point,line);
      let len2 = _V.vecLen2(line);
      //If pt is beyond the start of the line, left voronoi region
      //If pt is beyond the end of the line, right voronoi region
      return dp<0 ? LEFT_VORONOI : (dp>len2 ? RIGHT_VORONOI : MID_VORONOI)
    }
    /**
     * @private
     * @function
     */
    function _testSAT(aPos,aPoints, bPos,bPoints, axis, resolve){
      let [minA,maxA] =_findProjRange(aPoints, axis);
      let [minB,maxB] =_findProjRange(bPoints, axis);
      //B relative to A; A--->B
      let vAB= _V.vecSub(bPos,aPos);
      let proj= _V.vecDot(vAB,axis);
      //move B's range to its position relative to A.
      minB += proj;
      maxB += proj;
      _V.reclaim(vAB);
      if(minA>maxB || minB>maxA){
        return true
      }
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
          _V.vecSet(resolve.overlapN,axis);
          if(overlap<0)
            _V.vecFlipSelf(resolve.overlapN);
        }
      }
    }
    /**
     * @public
     * @function
     */
    _G.hitTestPointCircle=function(p, c){
      const d2 = _V.vecLen2(_V.vecSub(p,c.pos));
      return d2 <= c.radius * c.radius;
    };
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
    /**
     * @public
     * @function
     */
    _G.hitTestPointPolygon=function(p, poly){
      _V.vecSet(_FAKE_POLY.pos,p);
      let res= _G.hitTestPolygonPolygon(_FAKE_POLY, poly, _RES.clear());
      return res ? _RES.AInB : false;
    };
    /**
     * @private
     * @function
     */
    function _circle_circle(a, b, resolve){
      let r_ab = a.radius + b.radius;
      let vAB= _V.vecSub(b.pos,a.pos);
      let r2 = r_ab * r_ab;
      let d2 = _V.vecLen2(vAB);
      let status= !(d2 > r2);
      if(status && resolve){
        let dist = Math.sqrt(d2);
        resolve.A = a;
        resolve.B = b;
        resolve.overlap = r_ab - dist;
        _V.vecSet(resolve.overlapN, _V.vecUnitSelf(vAB));
        _V.vecSet(resolve.overlapV, _V.vecMul(vAB,resolve.overlap));
        resolve.AInB = a.radius <= b.radius && dist <= b.radius - a.radius;
        resolve.BInA = b.radius <= a.radius && dist <= a.radius - b.radius;
      }
      _V.reclaim(vAB);
      return status;
    }
    /**
     * @public
     * @function
     */
    _G.hitCircleCircle=function(a, b){
      let m=new Manifold();
      return _circle_circle(a,b,m) ? m : null
    };
    /**
     * @public
     * @function
     */
    _G.hitTestCircleCircle=function(a, b){
      return _circle_circle(a,b,new Manifold());
    };
    /**
     * @private
     * @function
     */
    function _poly_circle(polygon, circle, resolve){
      // get position of the circle relative to the polygon.
      let vPC= _V.vecSub(circle.pos,polygon.pos);
      let r2 = circle.radius * circle.radius;
      let cps = polygon.calcPoints;
      let edge = _V.take();
      let point;// = _V.take();
      // for each edge in the polygon:
      for(let len=cps.length,i=0; i < len; ++i){
        let next = i === len-1 ? 0 : i+1;
        let prev = i === 0 ? len-1 : i-1;
        let overlap = 0;
        let overlapN = null;
        _V.vecSet(edge,polygon.edges[i]);
        // calculate the center of the circle relative to the starting point of the edge.
        point=_V.vecSub(vPC,cps[i]);
        // if the distance between the center of the circle and the point
        // is bigger than the radius, the polygon is definitely not fully in
        // the circle.
        if(resolve && _V.vecLen2(point) > r2){
          resolve.AInB = false;
        }
        // calculate which Voronoi region the center of the circle is in.
        let region = _voronoiRegion(edge, point);
        if(region === LEFT_VORONOI){
          // need to make sure we're in the RIGHT_VORONOI of the previous edge.
          _V.vecSet(edge,polygon.edges[prev]);
          // calculate the center of the circle relative the starting point of the previous edge
          let point2= _V.vecSub(vPC,cps[prev]);
          region = _voronoiRegion(edge, point2);
          if(region === RIGHT_VORONOI){
            // it's in the region we want.  Check if the circle intersects the point.
            let dist = _V.vecLen(point);
            if(dist > circle.radius){
              // No intersection
              _V.reclaim(vPC,edge,point,point2);
              return false;
            } else if(resolve){
              // intersects, find the overlap.
              resolve.BInA = false;
              overlapN = _V.vecUnit(point);
              overlap = circle.radius - dist;
            }
          }
          _V.reclaim(point2);
        } else if(region === RIGHT_VORONOI){
          // need to make sure we're in the left region on the next edge
          _V.vecSet(edge,polygon.edges[next]);
          // calculate the center of the circle relative to the starting point of the next edge.
          _V.vecSubSelf(_V.vecSet(point,vPC),cps[next]);
          region = _voronoiRegion(edge, point);
          if(region === LEFT_VORONOI){
            // it's in the region we want.  Check if the circle intersects the point.
            let dist = _V.vecLen(point);
            if(dist > circle.radius){
              _V.reclaim(vPC,edge,point);
              return false;
            } else if(resolve){
              resolve.BInA = false;
              overlapN = _V.vecUnit(point);
              overlap = circle.radius - dist;
            }
          }
        }else{
          // check if the circle is intersecting the edge,
          // change the edge into its "edge normal".
          let normal = _V.vecUnitSelf(_V.perp(edge));
          // find the perpendicular distance between the center of the circle and the edge.
          let dist = _V.vecDot(point,normal);
          let distAbs = Math.abs(dist);
          // if the circle is on the outside of the edge, there is no intersection.
          if(dist > 0 && distAbs > circle.radius){
            _V.reclaim(vPC,normal,point);
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
          _V.vecSet(resolve.overlapN,overlapN);
        }
      }
      // calculate the final overlap vector - based on the smallest overlap.
      if(resolve){
        resolve.A = polygon;
        resolve.B = circle;
        _V.vecMulSelf(_V.vecSet(resolve.overlapV,resolve.overlapN),resolve.overlap);
      }
      _V.reclaim(vPC,edge,point);
      return true;
    }
    /**
     * @public
     * @function
     */
    _G.hitPolygonCircle=function(polygon, circle){
      let m=new Manifold();
      return _poly_circle(polygon,circle,m) ? m : null
    };
    /**
     * @public
     * @function
     */
    _G.hitTestPolygonCircle=function(polygon, circle){
      return _poly_circle(polygon,circle,new Manifold());
    };
    /**
     * @private
     * @function
     */
    function _circle_poly(circle, polygon, resolve){
      let result = _poly_circle(polygon, circle, resolve);
      if(result && resolve){
        // flip A and B
        let a = resolve.A;
        let aInB = resolve.AInB;
        _V.vecFlipSelf(resolve.overlapN);
        _V.vecFlipSelf(resolve.overlapV);
        resolve.A = resolve.B;
        resolve.B = a;
        resolve.AInB = resolve.BInA;
        resolve.BInA = aInB;
      }
      return result;
    }
    /**
     * @public
     * @function
     */
    _G.hitCirclePolygon=function(circle, polygon){
      let m=new Manifold();
      return _circle_poly(circle,polygon,m) ? m : null
    };
    /**
     * @public
     * @function
     */
    _G.hitTestCirclePolygon=function(circle, polygon){
      return _circle_poly(circle,polygon,new Manifold());
    };
    /**
     * @private
     * @function
     */
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
        if(resolve.overlap===0 || _M.fuzzyZero(resolve.overlap))
          return false;
        resolve.A = a;
        resolve.B = b;
        _V.vecSet(resolve.overlapV,resolve.overlapN);
        _V.vecMulSelf(resolve.overlapV,resolve.overlap);
      }
      return true;
    }
    /**
     * @public
     * @function
     */
    _G.hitPolygonPolygon=function(a, b){
      let m=new Manifold();
      return _poly_poly(a,b,m) ? m : null
    };
    /**
     * @public
     * @function
     */
    _G.hitTestPolygonPolygon=function(a, b){
      return _poly_poly(a,b,new Manifold());
    };

    return _.inject(_G, {Circle: Circle,
                         Line: Line,
                         Box: Box,
                         Manifold: Manifold,
                         Polygon: Polygon, Rect: Rect, Area: Area});
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
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  "use strict";
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  /**
   * @private
   * @function
   */
  function _module(){
    class QuadTree{
      constructor(x1,y1,x2,y2,maxCount,maxDepth){
        this.maxCount= maxCount || 12;
        this.maxDepth= maxDepth || 5;
        this.objects = [];
        this.boxes=null;
        this.level=0;
        this.x1=x1;
        this.x2=x2;
        this.y1=y1;
        this.y2=y2;
        this.midX= (x1+x2)/2;
        this.midY= (y1+y2)/2;
      }
      _ctree(x1,y1,x2,y2){
        let q=new QuadTree(x1,y1,x2,y2,this.maxCount,this.maxDepth);
        q.level=this.level+1;
        return q;
      }
      _split(){
        _.assert(this.boxes===null);
        //3|0
        //---
        //2|1
        this.boxes=[this._ctree(this.midX, this.y1,this.x2,this.midY),
                    this._ctree(this.midX, this.midY, this.x2,this.y2),
                    this._ctree(this.x1, this.midY, this.midX, this.y2),
                    this._ctree( this.x1, this.y1, this.midX,this.midY)];
      }
      _locate(r){
        let up= r.y < this.midY;
        let left= r.x < this.midX;
        let right= r.x + r.width > this.midX;
        let down= r.y + r.height > this.midY;
        if(up){
          if(left) out.push(3);
          if(right) out.push(0);
        }
        if(down){
          if(left) out.push(2);
          if(right) out.push(1);
        }
        return out;
      }
      insert(node){
        let out;
        if(this.boxes){
          this._locate(node).forEach(i=>{
            this.boxes[i].insert(node)
          });
        }else{
          this.objects.push(node);
          if(this.objects.length > this.maxCount &&
             this.level < this.maxDepth){
            this._split();
            this.objects.forEach(o=>{
              this._locate(o).forEach(i=>{
                this.boxes[i].insert(o)
              });
            });
            this.objects.length=0;
          }
        }
      }
      search(node){
        //handle duplicates
        let bin=new Map();
        let out = [];
        if(this.boxes){
          this._locate(node).forEach(i=>{
            this.boxes[i].search(node).forEach(o=>{
              if(!bin.has(o)){
                bin.set(o,null);
                out.push(o);
              }
            })
          })
        }
        this.objects.forEach(o=>{
          if(!bin.has(o)){
            bin.set(o,null);
            out.push(o);
          }
        });
        //found all objects closeby
        return out;
      }
      reset(){
        this.objects.length=0;
        this.boxes && this.boxes.forEach(b=>{
          b.reset()
        });
        this.boxes=null;
      }
    }

    return {
      quadtree(region,maxcount,maxdepth){
        return new QuadTree(region.x1,region.y1,region.x2,region.y2,maxcount,maxdepth);
      }
    };
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module()
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
  /**
   * @private
   * @function
   */
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_}=Core;
    const _N={};
    //const PINF = 1000000;
    /**
     * @public
     * @class
     */
    class FFrame{
      constructor(){
        this.lastBestMove=null;
        this.state= null;
        this.other=0;
        this.cur=0;
      }
      clone(){
        let f= new FFrame();
        f.state=_.deepCopyArray(this.state);
        f.lastBestMove=this.lastBestMove;
        f.other=this.other;
        f.cur=this.cur;
        return f;
      }
    }
    /**
     * @public
     * @class
     */
    class GameBoard{
      constructor(){
      }
      getFirstMove(frame){}
      getNextMoves(frame){}
      evalScore(frame){}
      isStalemate(frame){}
      isOver(f){}
      //undoMove(frame, move){}
      makeMove(f, move){}
      switchPlayer(frame){}
      takeFFrame(){}
    }
    /**Nega Min-Max algo.
     * @private
     * @function
     */
    function _negaMax(board, game, maxDepth, depth, alpha, beta){
      if(depth === 0 || board.isOver(game)){
        let score=board.evalScore(game);
        if(score !== 0)
          score -= 0.01*depth*Math.abs(score)/score;
        return score;
      }

      let openMoves = board.getNextMoves(game),
          state=game,
          bestValue = -Infinity,
          bestMove = openMoves[0];

      if(depth === maxDepth)
        game.lastBestMove = openMoves[0];

      for(let rc, move, i=0; i<openMoves.length; ++i){
        if(!board.undoMove){
          game=state.clone();
        }
        move = openMoves[i];
        //try a move
        board.makeMove(game, move);
        board.switchPlayer(game);
        rc= - _negaMax(board, game, maxDepth, depth-1, -beta, -alpha);
        //now, roll it back
        if(board.undoMove){
          board.switchPlayer(game);
          board.undoMove(game, move);
        }
        //how did we do ?
        //bestValue = _.max(bestValue, rc);
        if(bestValue < rc){
          bestValue = rc;
          bestMove = move
        }
        if(alpha < rc){
          alpha = rc;
          //bestMove = move;
          if(depth === maxDepth)
            game.lastBestMove = move;
          if(alpha >= beta) break;
        }
      }
      return bestValue;
    }
    /**
     * Main method for nega-max algo.
     * @public
     * @function
     */
    _N.evalNegaMax=function(board){
      let f= board.takeFFrame();
      _negaMax(board, f, board.depth, board.depth, -Infinity, Infinity);
      return f.lastBestMove;
    };

    return _.inject(_N,{ FFrame: FFrame, GameBoard: GameBoard });
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/negamax"]=_module
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
  /**
   * @private
   * @function
   */
  function _module(Core,Colors){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!Colors){
      throw "Fatal: No Colors!";
    }
    const {is,u:_}=Core;
    /**
     * @private
     * @function
     */
    function _f(s){ return !s.startsWith("F") }

    /**
     * @private
     * @function
     */
    function rstr(len,ch){
      let out="";
      while(len>0){
        out += ch;
        --len;
      }
      return out;
    }
    /**
     * @private
     * @function
     */
    function ex_thrown(expected,e){
      let out=t_bad;
      if(e){
        if(is.str(expected)){
          out= expected==="any" || expected===e ? t_ok : t_bad;
        }else if(expected instanceof e){
          out=t_ok;
        }
      }
      return out;
    }
    /**
     * @private
     * @function
     */
    function ensure_eq(env,name,form){
      return new Promise((resolve,reject)=>{
        let out;
        try{
          out=form.call(env);
          if(out instanceof Promise){
            out.then(function(res){
              resolve(`${res?t_ok:t_bad}: ${name}`);
            });
          }else{
            out= out ? (out===709394?t_skip:t_ok) : t_bad;
            resolve(`${out}: ${name}`);
          }
        }catch(e){
          out= t_bad;
          resolve(`${out}: ${name}`);
        }
      });
    }
    /**
     * @private
     * @function
     */
    function ensure_ex(env,name,form,error){
      return new Promise((resolve,reject)=>{
        let out;
        try{
          out=form.call(env);
          out=out===709394?t_ok:ex_thrown(error,null);
        }catch(e){
          out=ex_thrown(error,e);
        }
        resolve(`${out}: ${name}`);
      });
    }
    /**
     * @private
     * @var {string}
     */
    const [t_skip,t_bad,t_ok]=["Skippd", "Failed", "Passed"];
    /**
     * @private
     * @var {object}
     */
    const _$={
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
      deftest(name){
        let iniz=null;
        let finz=null;
        let arr=null;
        let env=null;
        let x={
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
      _run(test){
        return new Promise((resolve,reject)=>{
          test().then(function(arr){
            resolve(arr);
          });
        });
      },
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
          return new Promise((resolve,j)=>{
            resolve(out);
          });
        });
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


