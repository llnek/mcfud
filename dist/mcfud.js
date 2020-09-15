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
 * Copyright © 2020, Kenneth Leung. All rights reserved. */

;(function(global){
  "use strict";
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  /**
   * @public
   * @function
   */
  global["io.czlab.mcfud.core"]=function(){
    if(_singleton){ return _singleton }
    const document=global.document;
    const OBJ=Object.prototype;
    const ARR=Array.prototype;
    const slicer=ARR.slice;
    const tostr=OBJ.toString;
    const _C={};

    function isObject(obj){ return tostr.call(obj) === "[object Object]"; }
    function isArray(obj){ return tostr.call(obj) === "[object Array]"; }
    function isMap(obj){ return tostr.call(obj) === "[object Map]"; }
    function isStr(obj){ return typeof obj === "string"; }
    function isNum(obj){ return tostr.call(obj) === "[object Number]"; }
    function _randXYInclusive(min,max){
      return Math.floor(Math.random() * (max - min + 1) + min);
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
    const EPSILON= 0.00001;
    /**
     * @private
     * @var {number}
      */
    let _seqNum= 0;
    /**
     * @public
     * @var {object}
     */
    const _={
      feq:function(a, b){
        // <= instead of < for NaN comparison safety
        return Math.abs(a - b) <= EPSILON;
      },
      fgteq:function(a,b){
        return a>b || this.feq(a,b);
      },
      flteq:function(a,b){
        return a<b || this.feq(a,b);
      },
      pack: function(o){ return JSON.stringify(o) },
      unpack: function(s){ return JSON.parse(s) },
      v2: function(x,y){ return [x,y] },
      p2: function(x,y){ return {x: x, y: y} },
      numOrZero: function(n){ return isNaN(n) ? 0 : n },
      parseNumber: function(s,dft){
        let n=parseFloat(s);
        return (isNaN(n) && isNum(dft)) ? dft : n;
      },
      splitVerStr: function(s){
        let arr=(""+(s || "")).split(".").filter(s=> s.length>0);
        let major=this.parseNumber(arr[0],0);
        let minor=this.parseNumber(arr[1],0);
        let patch=this.parseNumber(arr[2],0);
        return [major, minor, patch];
      },
      cmpVerStrs: function(V1,V2){
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
      findFiles: function(files, exts){
        return files.filter(s=> exts.indexOf(_fext(s)) > -1);
      },
      pdef: function(obj){
        obj.enumerable=true;
        obj.configurable=true;
        return obj;
      },
      partition: function(count,arr){
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
      range:function(start,end){
        _.assert(start !== undefined);
        let out=[];
        if(arguments.length===1){ end=start; start=0 }
        for(let i=start;i<end;++i){ out.push(i) }
        return out
      },
      keys: function(obj){
        return isMap(obj) ? Array.from(obj.keys())
                          : (isObject(obj) ? Object.keys(obj) : []);
      },
      selectKeys: function(coll,keys){
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
      assert: function(cond){
        if(!cond)
          throw (arguments.length<2) ? "Assert Failed!" : slicer.call(arguments,1).join("");
        return true
      },
      noSuchKeys: function(keys,target){
        let r=this.some(this.seq(keys),k => this.has(target,k)?k:null);
        if(r) console.log("keyfound="+r);
        return !r;
      },
      randFloat: function(min, max){
        return min + Math.random() * (max - min);
      },
      randMinus1To1: function(){ return (Math.random() - 0.5) * 2 },
      randInt: function(num){ return _randXYInclusive(0,num) },
      randInt2: _randXYInclusive,
      rand: function(){ return Math.random() },
      inst: function(type,obj){ return obj instanceof type },
      isPerc: function(s){
        return isStr(s) && s.match(/^([0-9])(\.?[0-9]+|[0-9]*)%$/);
      },
      jsMap: function(){ return new Map() },
      jsObj: function(){ return {} },
      jsVec: function(...args){
        return args.length===0 ? [] : args.slice();
      },
      floor: function(v){ return Math.floor(v) },
      ceil: function(v){ return Math.ceil(v) },
      abs: function(v){ return Math.abs(v) },
      sqrt: function(v){ return Math.sqrt(v) },
      min: function(a,b){ return Math.min(a,b) },
      max: function(a,b){ return Math.max(a,b) },
      slice: function(a,i){ return slicer.call(a, i) },
      every: function(c,v){
        for(let i=0;i<c.length;++i)
          if(c[i] !== v) return false;
        return c.length>0;
      },
      notAny: function(c,v){
        for(let i=0;i<c.length;++i)
          if(c[i] === v) return false;
        return c.length>0;
      },
      copy: function(to,from){
        if(!from) return to;
        if(!to) return from.slice();
        let len= Math.min(to.length,from.length);
        for(let i=0;i<len;++i) to[i]=from[i];
        return to;
      },
      append: function(to,from){
        if(!from) return to;
        if(!to) return from.slice();
        for(let i=0;i<from.length;++i) to.push(from[i]);
        return to;
      },
      fill: function(a,v){
        if(a)
          for(let i=0;i<a.length;++i) a[i]=v;
        return a;
      },
      size: function(obj){
        let len=0;
        if(isArray(obj)) len= obj.length;
        else if(isMap(obj)) len=obj.size;
        else if(obj) len=_.keys(obj).length;
        return len;
      },
      nextId: function(){ return ++_seqNum },
      now: function(){ return Date.now() },
      fileExt: _fext,
      fileNoExt: function(name){
        let pos= name.lastIndexOf(".");
        return pos>0 ? name.substring(0,pos) : name;
      },
      range: function(start,stop,step=1){
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
      shuffle: function(obj){
        let res=slicer.call(obj,0);
        for(let x,j,i= res.length-1; i>0; --i){
          j = Math.floor(Math.random() * (i+1));
          x = res[i];
          res[i] = res[j];
          res[j] = x;
        }
        return res;
      },
      uniq: function(arr){
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
      map: function(obj, fn,target){
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
      find: function(obj,fn,target){
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
      some: function(obj,fn,target){
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
      invoke: function(arr,key){
        let args=slicer.call(arguments,2);
        if(isArray(arr))
          arr.forEach(x => x[key].apply(x, args));
      },
      timer: function(f,delay=0){
        return setTimeout(f,delay);
      },
      clear: function(id){
        clearTimeout(id);
      },
      rseq: function(obj,fn,target){
        if(isArray(obj))
          for(let i=obj.length-1;i>=0;--i)
            fn.call(target, obj[i],i);
      },
      doseq: function(obj,fn,target){
        if(isArray(obj))
          obj.forEach(fn,target);
        else if(isMap(obj))
          obj.forEach((v,k)=> fn.call(target,v,k,obj));
        else if(obj)
          for(let k in obj)
            if(OBJ.hasOwnProperty.call(obj,k))
            fn.call(target, obj[k], k, obj);
      },
      dissoc: function(obj,key){
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
      get: function(obj,key){
        if(typeof key !== "undefined"){
          if(isMap(obj)) return obj.get(key);
          else if(obj) return obj[key];
        }
      },
      assoc: function(obj,key,value){
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
      disj: function(coll,obj){
        let i = coll ? coll.indexOf(obj) : -1;
        if(i > -1) coll.splice(i,1);
        return i > -1;
      },
      conj: function(coll,...objs){
        if(coll)
          objs.forEach(o => coll.push(o));
        return coll;
      },
      seq: function(arg,sep=","){
        if(typeof arg === "string")
          arg = arg.split(sep).map(s=>s.trim()).filter(s=>s.length>0);
        if(!isArray(arg)) arg = [arg];
        return arg;
      },
      has: function(obj,key){
        if(!key)
          return false;
        if(isMap(obj))
          return obj.has(key);
        if(isArray(obj))
          return obj.indexOf(key) !== -1;
        if(obj)
          return OBJ.hasOwnProperty.call(obj, key);
      },
      patch: function(des,additions){
        des=des || {};
        if(additions)
          Object.keys(additions).forEach(k=>{
            if(des[k]===undefined)
              des[k]=additions[k];
          });
        return des;
      },
      clone: function(obj){
        if(obj)
          obj=JSON.parse(JSON.stringify(obj));
        return obj;
      },
      inject: function(des){
        let args=slicer.call(arguments,1);
        des=des || {};
        args.forEach(s=>{
          if(s) Object.assign(des,s);
        });
        return des;
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
    const is={
      fun: function(obj){ return tostr.call(obj) === "[object Function]" },
      str: function(obj){ return typeof obj === "string" },
      void0: function(obj){ return obj === void 0 },
      undef: function(obj){ return obj === undefined },
      obj: isObject,
      map: isMap,
      num: isNum,
      vec: isArray,
      some: function(obj){ return _.size(obj) > 0 },
      none: function(obj){ return _.size(obj) === 0 }
    };
    /**
     * @public
     * @var {object}
     */
    const dom={
      qSelector: function(sel){ return document.querySelectorAll(sel) },
      qId: function(id){ return document.getElementById(id) },
      parent: function(e){ return e ? e.parentNode : undefined },
      conj: function(par,child){ return par.appendChild(child) },
      byTag: function(tag, ns){
        return !is.str(ns) ? document.getElementsByTagName(id)
                           : document.getElementsByTagNameNS(ns,tag) },
      attrs: function(e, attrs){
        if(!is.obj(attrs) && attrs){
          if(arguments.length > 2)
            e.setAttribute(attrs, arguments[2]);
          return e.getAttribute(attrs);
        }
        if(attrs)
          _.doseq(attrs, (v,k) => e.setAttribute(k,v));
        return e;
      },
      css: function(e, styles){
        if(!is.obj(styles) && styles){
          if(arguments.length > 2)
            e.style[styles]= arguments[2];
          return e.style[styles];
        }
        if(styles)
          _.doseq(styles, (v,k) => { e.style[k]= v; });
        return e;
      },
      wrap: function(child,wrapper){
        let p=child.parentNode;
        wrapper.appendChild(child);
        p.appendChild(wrapper);
        return wrapper;
      },
      newElm: function(tag, attrs, styles){
        let e = document.createElement(tag);
        this.attrs(e,attrs);
        this.css(e,styles);
        return e;
      },
      newTxt: function(tag, attrs, styles){
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
      return {
        sub: function(subject,cb,ctx){
          if(is.vec(subject) && arguments.length===1 && is.vec[subject[0]]){
            subject.forEach(e => { if(is.vec(e)) this.sub.apply(this, e); });
          }else{
            let event=subject[0], target=subject[1];
            //handle multiple events in one string
            _.seq(event).forEach(e => {
              if(!cb) cb=e;
              if(is.str(cb)) { ctx=ctx || target; cb=ctx[cb]; }
              if(!cb) throw "Error: no callback for sub()";
              if(!_tree.has(e)) _tree.set(e, _.jsMap());
              let m= _tree.get(e);
              !m.has(target) && m.set(target,[]);
              m.get(target).push([cb,ctx]);
              //if(!_tree.has(target)) _tree.set(target, _.jsMap());
              //let m= _tree.get(target);
              //!m.has(e) && m.set(e,[]);
              //m.get(e).push([cb,ctx]);
            });
          }
        },
        pub: function(subject,data){
          if(is.vec(subject) && arguments.length===1 && is.vec[subject[0]]){
            subject.forEach(e => { if(is.vec(e)) this.pub.apply(this, e); });
          }else{
            let m,t,event=subject[0], target=subject[1];
            _.seq(event).forEach(e=>{
              t=_tree.get(e);
              m= t && t.get(target);
              m && m.forEach(s => s[0].call(s[1],data));
            });
            /*
            let m,t= _tree.get(target);
            if(t)
              _.seq(event).forEach(e => {
                if(m= t.get(e))
                  m.forEach(s => s[0].call(s[1],data));
              });
              */
          }
        },
        unsub: function(subject,cb,ctx){
          if(is.vec(subject) && arguments.length===1 && is.vec[subject[0]]){
            subject.forEach(e => { if(is.vec(e)) this.unsub.apply(this, e); });
          }else{
            let event=subject[0], target=subject[1];
            let t,m, es=_.seq(event);
            es.forEach(e => {
              t= _tree.get(e);
              m= t && t.get(target);
              if(m){
                if(is.str(cb)) { ctx=ctx || target; cb=ctx[cb]; }
                if(!cb)
                  t.delete(target);
                else
                  for(let i= m.length-1;i>=0;--i)
                      if(m[i][0] === cb && m[i][1] === ctx) m.splice(i,1);
              }
            });
  /*
            let t= _tree.get(target);
            if(t) {
              if(!cb)
                es.forEach(e => t.delete(e));
              else {
                if(is.str(cb)) { ctx=ctx || target; cb=ctx[cb]; }
                es.forEach(e => {
                  if(!cb)
                    t.delete(e);
                  else if(ss= t.get(e))
                    for(let i= ss.length-1;i>=0;--i)
                      if(ss[i][0] === cb && ss[i][1] === ctx) ss.splice(i,1);
                });
              }
            }
            */
          }
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
// Copyright © 2020, Kenneth Leung. All rights reserved.

;(function(global){
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  /**
   * @public
   * @function
   */
  global["io.czlab.mcfud.math"]=function(){
    if(_singleton) { return _singleton }
    const Core= global["io.czlab.mcfud.core"]();
    const _=Core.u;
    const is=Core.is;
    const EPSILON= 0.0000000001;
    const NEG_DEG_2PI= -360;
    const DEG_2PI= 360;
    const TWO_PI= 2*Math.PI;
    const PI= Math.PI;
    const ATAN2= Math.atan2;
    const ACOS= Math.acos;
    const COS= Math.cos;
    const SIN= Math.sin;
    const TAN= Math.tan;
    const _M={EPSILON: EPSILON};
    function _odd(n){ return n%2 !== 0 }
    /**
     * Proper modulo.
     * @public
     * @function
     */
    _M.xmod=function(x,N){
      return x < 0 ? x-(-(N + N*Math.floor(-x/N))) : x%N
    };
    /**
     * @public
     * @function
     */
    _M.clamp=function(min,max,v){
      if(v < min) return min;
      if(v > max) return max;
      return v
    };
    /**
     * @function
     * @public
     */
    _M.sqr=function(a){
      return a*a
    };
    /**
     * @public
     * @function
     */
    _M.fuzzyEq=function(a,b){
      return Math.abs(a-b) < EPSILON
    };
    /**
     * @public
     * @function
     */
    _M.fuzzyZero=function(n){
      return this.fuzzyEq(n, 0.0)
    };
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //;;VECTORS
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**
     * Fuzzy match.
     * @private
     * @function
     */
    function _cmp_eq(x,y){
      return Math.abs(x-y) <= (EPSILON * Math.max(1, Math.max(Math.abs(x), Math.abs(y))))
    }
    /**
     * @public
     * @function
     */
    _M.V2=function(x,y){
      return [x||0, y||0]
    };
    /**
     * @public
     * @function
     */
    _M.V3=function(x,y,z){
      return [x||0, y||0, z||0]
    };
    /**
     * @public
     * @function
     */
    _M.V4=function(x,y,z,a){
      return [x||0, y||0, z||0, a||0]
    };
    /**
     * @private
     * @function
     */
    function _mod_deg(deg){
      return deg<0 ? -(-deg%DEG_2PI) : deg%DEG_2PI
    }
    /**
     * Radian to degree.
     *
     * @function
     * @public
     */
    _M.radToDeg=function(r){
      return _mod_deg(DEG_2PI * r/TWO_PI)
    };
    /**
     * Degree to radian.
     *
     * @public
     * @function
     */
    _M.degToRad=function(d){
      return TWO_PI * _mod_deg(d)/DEG_2PI
    };
    const _4ops={ "+": (a,b)=>a+b, "-": (a,b)=>a-b,
                  "*": (a,b)=>a*b, "/": (a,b)=>a/b };
    function _vecXXX(op,a,b,local){
      if(is.vec(b) &&
         a.length !== b.length)
        throw "Error: Mismatch vector length";
      let n= is.num(b);
      let out= local ? a : new Array(a.length);
      for(let i=0;i<a.length;++i)
        out[i]=op(a[i], n?b:b[i]);
      return out;
      //return is.num(b) ? a.map(v => op(v,b)) : (a.length===b.length) ? a.map((v,i) => op(v,b[i])) : undefined
    }
    /**
     * @public
     * @function
     */
    _M.vecAdd=function(a,b){ return _vecXXX(_4ops["+"],a,b) };
    /**
     * @public
     * @function
     */
    _M.vecAddSelf=function(a,b){ return _vecXXX(_4ops["+"],a,b,1) };
    /**
     * @function
     * @public
     */
    _M.vecSub=function(a,b){ return _vecXXX(_4ops["-"],a,b) };
    /**
     * @public
     * @function
     */
    _M.vecSubSelf=function(a,b){ return _vecXXX(_4ops["-"],a,b,1) };
    /**
     * @public
     * @function
     */
    _M.vecMul=function(a,b){ return _vecXXX(_4ops["*"],a,b) };
    /**
     * @public
     * @function
     */
    _M.vecMulSelf=function(a,b){ return _vecXXX(_4ops["*"],a,b,1) };
    /**
     * @public
     * @function
     */
    _M.vecDiv=function(a,b){ return _vecXXX(_4ops["/"],a,b) };
    /**
     * @public
     * @function
     */
    _M.vecDivSelf=function(a,b){ return _vecXXX(_4ops["/"],a,b,1) };
    /**
     * Dot product of vectors, cosα = a·b / (|a| * |b|).
     *
     * @public
     * @function
     * @returns {number}
     */
    _M.vecDot=function(a,b){
      if(a.length===b.length)
        return a.reduce((S,v,i) => S+v*b[i], 0)
    }
    /**
     * @public
     * @function
     */
    _M.vecLen2=function(a){ return this.vecDot(a,a) }
    /**
     * @public
     * @function
     */
    _M.vecLen=function(a){ return Math.sqrt(this.vecLen2(a)) }
    /**
     * @public
     * @function
     */
    _M.vecDist2=function(a,b){ return this.vecLen2(this.vecSub(b,a)) }
    /**
     * @public
     * @function
     */
    _M.vecDist=function(a,b){ return Math.sqrt(this.vecDist2(a,b)) }
    /**
     * Unit-vector.
     * @public
     * @function
     */
    _M.vecUnit=function(a){
      let d=this.vecLen(a);
      return d > EPSILON ? a.map(v => v/d) : a.map(v => 0)
    };
    /**
     * @public
     * @function
     */
    _M.vecSet=function(des,src){
      _.assert(des.length===src.length);
      for(let i=0;i<src.length;++i){
        des[i]=src[i];
      }
      return des
    }
    /**
     * @public
     * @function
     */
    _M.vecClone=function(v){
      return v.slice()
    };
    /**
     * @public
     * @function
     */;
    _M.vecCopy=function(des,...args){
      _.assert(des.length===args.length);
      for(let i=0;i<args.length;++i){
        des[i]=args[i];
      }
      return des
    };
    /**
     * @public
     * @function
     */
    _M.vec2Rot=function(a,rot,center){
      let cx=center ? center[0] : 0;
      let cy=center ? center[1] : 0;
      let x_= a[0] - cx;
      let y_= a[1] - cy;
      let cos= COS(rot);
      let sin=SIN(rot);
      return this.V2(cx + (x_*cos - y_*sin),
                     cy + (x_ * sin + y_ * cos))
    };
    /**
     * @public
     * @function
     */
    _M.vec2Cross=function(p1,p2){
      if(is.vec(p1) && is.vec(p2)){
        return p1[0] * p2[1] - p1[1] * p2[0]
      }
      if(is.vec(p1) && is.num(a)){
        return this.V2(p2 * p1[1], -p2 * p1[0])
      }
      if(is.num(p1) && is.vec(p2)){
        return this.V2( -p1 * p2[1], p1 * p2[0])
      }
    };
    /**
     * @public
     * @function
     */
    _M.vec3Cross=function(a,b){
      return this.V3(a.y * b.z - a.z * b.y,
                     a.z * b.x - a.x * b.z,
                     a.x * b.y - a.y * b.x)
    };
    /**
     * Angle between these 2 vectors.
     * a.b = cos(t)*|a||b|
     * @public
     * @function
     */
    _M.vecAngle=function(a,b){
      return ACOS(this.vecDot(a,b) / (this.vecLen(a) * this.vecLen(b)))
    };
    /**
     * Find scalar projection.
     * @public
     * @function
     * @returns {number}
     */
    _M.proj=function(a,b){
      return this.vecDot(a,b)/this.vecLen(b)
    };
    /**Find vector projection.
     * @public
     * @function
     */
    _M.vecProj=function(a,b){
      return this.vecMul(b, this.vec2Dot(a,b)/this.vec2Len2(b))
    };
    /**
     * Find the perpedicular vector.
     * @public
     * @function
     */
    _M.vecPerp=function(a,b){ return this.vecSub(a, this.vecProj(a,b)) };
    /**
     * Reflect a normal.
     * @public
     * @function
     */
    _M.vecReflect=function(src,normal){
      return this.vecSub(src, this.vecMul(normal, 2*this.vecDot(src,normal)))
    };
    /**
     * Negate a vector.
     * @public
     * @function
     */
    //_M.vecNeg=function(v){ return this.vecMul(v, -1) };
    _M.vecFlip=function(v){ return this.vecMul(v, -1) };
    /**
     * @public
     * @function
     */
    _M.vecFlipSelf=function(v){ return this.vecMulSelf(v, -1) };
    //_M.vecReverse=function(v){ return this.vecMul(v, -1) };
    /**
     * Normal of a vector.
     *
     * if v is ------------------> then
     *         |
     *         |
     *         v
     * if s=true, then
     *         ^
     *         |
     *         |
     *         -------------------->
     * @public
     * @function
     */
    _M.vecNormal=function(v,s){
      //origin = (0,0) => x1=0,y1=0, x2= vx, y2=vy
      let x1=0;
      let y1=0;
      let dy= v[1] - y1;
      let dx= v[0] - x1;
      return s ? this.V2(-dy, dx) : this.V2(dy, -dx)
    };
    /**
     * Minimum values of vectors.
     * @public
     * @function
     */
    _M.vecMin=function(a,b){
      let ret=[];
      if(a.length===b.length)
        for(let i=0; i<a.length;++i)
          ret.push(Math.min(a[i],b[i]));
      return ret
    };
    /**
     * Maximum values of vectors.
     * @public
     * @function
     */
    _M.vecMax=function(a,b){
      let ret=[];
      if(a.length===b.length)
        for(let i=0; i<a.length;++i)
          ret.push(Math.max(a[i],b[i]));
      return ret
    };
    /**
     * @private
     * @function
     */
    function _arrayEq(a1,a2){
      //2 numeric arrays are equal?
      for(let i=0;i<a1.length;++i){
        if(!_M.fuzzyEq(a1[i],a2[i]))
          return false;
      }
      return true
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //MATRIX
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //index where matrix is mapped to 1D array.
    function _cell(rows,cols,r,c){
      return (c-1) + ((r-1)*cols)
    }
    function _matnew(rows,cols,cells){
      return {dim: [rows,cols], cells: cells}
    }
    function _new_mat(rows,cols){
      return _matnew(rows,cols, _.fill(new Array(rows*cols),0))
    }
    /**
     * @public
     * @function
     */
    _M.matrix=function(dim,...args){
      let rows=dim[0];
      let cols=dim[1];
      let sz= rows*cols;
      return args.length===0 ? _new_mat(rows,cols)
                             : _.assert(sz===args.length) && _matnew(rows,cols,args)
    };
    /**
     * @public
     * @function
     */
    _M.matIdentity=function(sz){
      let out=_.fill(new Array(sz*sz),0);
      for(let i=0;i<sz;++i)
        out[_cell(sz,sz,i+1,i+1)] = 1;
      return _matnew(sz, sz, out)
    };
    /**
     * Matrix with zeroes.
     * @public
     * @function
     */
    _M.matZero=function(sz){
      return _.assert(sz>0) &&
             _matnew(sz,sz,_.fill(new Array(sz*sz),0))
    };
    /**
     * A 2x2 matrix.
     * @public
     * @function
     */
    _M.mat2=function(_11,_12,_21,_22){
      return this.matrix([2,2], _11,_12,_21,_22)
    };
    /**
     * A 3x3 matrix.
     * @public
     * @function
     */
    _M.mat3=function(_11,_12,_13,_21,_22,_23,_31,_32,_33){
      return this.matrix([3,3], _11,_12,_13,_21,_22,_23,_31,_32,_33)
    };
    /**
     * A 4x4 matrix.
     * @public
     * @function
     */
    _M.mat4=function(_11,_12,_13,_14,_21,_22,_23,_24,
                     _31,_32,_33,_34, _41,_42,_43,_44){
      return this.matrix([4,4],
                         _11,_12,_13,_14,_21,_22,_23,_24,
                         _31,_32,_33,_34,_41,_42,_43,_44)
    };
    /**
     * Matrices are equals.
     * @public
     * @function
     */
    _M.matEq=function(a,b){
      return a.dim[0]===b.dim[0] &&
             a.dim[1]===b.dim[1] ? this.arrayEq(a.cells,b.cells) : false
    };
    /**
     * Matrices are different.
     * @public
     * @function
     */
    _M.matNeq=function(a,b){ return !this.matEq(a,b) };
    /**
     * Transpose a matrix.
     * @function
     * @public
     */
    _M.matXpose=function(m){
      let rows=m.dim[0];
      let cols=m.dim[1];
      let sz=rows*cols;
      let tmp=[];
      for(let i=0;i<sz;++i)
        tmp.push(m.cells[(i/rows) + cols*(i%rows)]);
      return _matnew(cols,rows,tmp)
    };
    /**
     * Inverse a 3x3 matrix - fast.
     * @public
     * @function
     */
    _M.mat3FastInverse=function(m){
      return _.assert(m.dim[0]===3 && m.dim[1]===3) && this.matXpose(m)
    };
    /**
     * Inverse a 4x4 matrx - fast.
     * @public
     * @function
     */
    _M.mat4FastInverse=function(m){
      _assert(m.dim[0]===4&&m.dim[1]===4);
      let rows=m.dim[0],cols=m.dim[1];
      let out=this.matXpose(m);
      let p=_.partition(cols,m.cells);
      let m1=p[0],m2=p[1],m3=p[2],m4=p[3];
      let right=m1.slice(0,3);
      let up=m2.slice(0,3);
      let forward=m3.slice(0,3);
      let position=m4.slice(0,3);
      m.cells[_cell(4,4,1,4)]= 0;
      m.cells[_cell(4,4,2,4)]= 0;
      m.cells[_cell(4,4,3,4)]=0;
      m.cells[_cell(4,4,4,1)]= -this.vecDot(right,position);
      m.cells[_cell(4,4,4,2)]= -this.vecDot(up,position);
      m.cells[_cell(4,4,4,3)]= -this.vecDot(forward,position);
      return out;
    };
    /**
     * Scalar multiply a matrix.
     * @public
     * @function
     */
    _M.matScale=function(m,n){
      return _matnew(m.dim[0],m.dim[1],m.cells.map(x => x*n))
    };
    /**
     * Multiply 2 matrices.
     * @public
     * @function
     */
    _M.matMult=function(a,b){
      let aRows=a.dim[0], aCols=a.dim[1], aCells=a.cells;
      let bRows=b.dim[0], bCols=b.dim[1], bCells=b.cells;
      _.assert(aCols===bRows, "mismatch matrices");
      let out=new Array(aRows*bCols);
      for(let i=0; i<aRows; ++i)
        for(let j=0; j<bCols; ++j){
          out[j+i*bCols]=
            _.range(bRows).reduce((acc,k) => {
              return acc + aCells[k+i*aCols] * bCells[j+ k*bCols] },0);
        }
      return _matnew(aRows,bCols,out)
    };
    /** Determinent.
     *
     * @public
     * @function
     */
    _M.matDet=function(m){
      let rows=m.dim[0], cols=m.dim[1];
      let tmp=[];
      for(let c=0; c< cols;++c)
        _.conj(tmp,this.matDet(this.matCut(m,1,c+1)));
      return _.range(cols).reduce((acc,j) => {
        let v=tmp[j];
        return acc + m.cells[j] * (_odd(j) ? -v : v)
      },0)
    };
    /**
     * Matrix determinent.
     * @public
     * @function
     */
    _M.matDet2x2=function(m){
      _.assert(m.cells.length===4);
      return m.cells[0]*m.cells[3] - m.cells[1] * m.cells[2]
    };
    /**
     * Extract a portion of a matrix.
     * Get rid of a row and col.
     * @public
     * @function
     */
    _M.matCut=function(m,row,col){
      let rows=m.dim[0], cols=m.dim[1];
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
    };
    /**
     * Matrix minor.
     * @public
     * @function
     */
    _M.matMinor=function(m){
      let rows=m.dim[0], cols=m.dim[1];
      let tmp=[];
      for(let i=0; i< rows;++i)
        for(let j=0; j<cols; ++j){
          //mat-cut is 1-indexed
          _.conj(tmp,this.matDet(this.matCut(m,i+1,j+1)));
        }
      return _matnew(rows,cols,tmp)
    };
    /**
     * @public
     * @function
     */
    _M.matMinor2x2=function(m){
      return _.assert(m.cells.length===4) &&
             this.mat2(m.cells[3],m.cells[2],m.cells[1],m.cells[0])
    };
    /**
     * Matrix co-factor.
     * @public
     * @function
     */
    _M.matCofactor=function(m){
      let minor=this.matMinor(m);
      let rows=minor.dim[0];
      let cols=minor.dim[1];
      let tmp=m.cells.slice();
      for(let len=rows*cols,i=0; i< len; ++i){
        if(_odd(i))
          tmp[i]= -tmp[i];
      }
      return _matnew(rows,cols,tmp)
    };
    /**
     * Matrix adjugate.
     * @public
     * @function
     */
    _M.matAdjugate=function(m){
      return this.matXpose(this.matCofactor(m))
    };
    /**
     * Inverse matrix.
     * @public
     * @function
     */
    _M.matInverse2x2=function(m){
      let rows=m.dim[0], cols=m.dim[1];
      _.assert(m.cells.length===4&&rows===2&&cols===2);
      let r,c=m.cells;
      let det= c[0]*c[3] - c[1]*c[2];
      if(this.fuzzyZero(det))
        r=this.matIdentity(rows);
      else{
        let _det= 1/det;
        r= this.mat2(c[3]*_det, -c[1] * _det,
                     -c[2] * _det, c[0] * _det);
      }
      return r
    };
    /**
     * @function
     * @public
     */
    _M.matInverse=function(m){
      let rows=m.dim[0],cols=m.dim[1];
      let d= this.matDet(m);
      return this.fuzzyZero(d) ? this.matIdentity(rows)
                               : this.matScale(this.matAdjugate(m), 1/d)
    };
    /**
     * Matrix from column major.
     * @function
     * @public
     */
    _M.matFromColMajor=function(m){
      return this.matXpose(m)
    };
    /**
     * Matrix to column major.
     * @public
     * @function
     */
    _M.matToColMajor=function(m){
      return this.matXpose(m)
    };
    /**
     * Translate a 3x3 matrix.
     * @public
     * @function
     */
    _M.mat4Txlate=function(v3){
      let out= _.assert(v3.length===3) && this.matIdentity(4);
      out.cells[_cell(4,4,4,1)]= v3[0];
      out.cells[_cell(4,4,4,2)]= v3[1];
      out.cells[_cell(4,4,4,3)]= v3[2];
      return out
    };
    /**
     * Matrix from matrix-translation.
     *
     * @public
     * @function
     * @param m a 3x3 matrix
     * @returns 4x4 matrix
     */
    _M.matFromMX_3x3=function(m){
      _.assert(m.cells.length===9);
      let rows=m.dim[0], cols=m.dim[1];
      let p=_.partition(cols,m.cells);
      let r1=p[0], r2=p[1], r3=p[2];
      return _matnew(rows+1,cols+1, r1.concat(0, r2, 0, r3, 0, [0,0,0,1]))
    };
    /**
     * Get the translation of a matrix.
     * @public
     * @function
     * @param m 4x4 matrix
     * @returns 3d vector
     */
    _M.getTranslation4x4=function(m){
      _.assert(m.cells.length===16);
      let c=m.cells;
      return this.V3(c[_cell(4,4,4,1)],
                     c[_cell(4,4,4,2)],
                     c[_cell(4,4,4,3)])
    };
    /**
     * Matrix from vector-translation.
     * @public
     * @function
     * @param v3 3d vector
     * @returns 4x4 matrix
     */
    _M.matFromVX_V3=function(v3){
      _.assert(v3.length===3);
      let out=this.matIdentity(4);
      let c=out.cells;
      c[_cell(4,4,1,1)]= v3[0];
      c[_cell(4,4,2,2)]= v3[1];
      c[_cell(4,4,3,3)]= v3[2];
      return out
    };
    /**
     * Get scale from matrix-translation.
     * @public
     * @function
     * @param m4 4x4 matrix
     * @returns 3d vector
     */
    _M.getScaleFromMX_4x4=function(m4){
      _.assert(m4.cells.length===16);
      let rows=m4.dim[0], cols=m4.dim[1];
      let p= _.partition(cols,m4.cells);
      let r1=p[0],r2=p[1],r3=p[2];
      return this.V3(r1[0], r2[1], r3[2])
    };
    /**
     * Multiply matrix and  vector.
     * @public
     * @function
     * @returns vector
     */
    _M.matVMult=function(m,v){
      let cols=m.dim[1];
      let rows=v.length;
      _.assert(cols===rows);
      let r= this.matMult(m, _matnew(rows, 1, v));
      let c=r.cells;
      r.cells=null;
      return c
    };
    /**
     * Rotate a 2x2 matrix, counter-clockwise
     * @function
     * @public
     */
    _M.rotation2x2=function(rot){
      return this.mat2(COS(rot),-SIN(rot),SIN(rot),COS(rot))
    };
    /**
     * 3D rotation.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.yawPitchRoll=function(yaw,pitch,roll){
      return this.mat4(COS(roll) * COS(yaw) +
                       SIN(roll)*SIN(pitch)*SIN(yaw),
                       SIN(roll)*COS(pitch),
                       COS(roll)* -SIN(yaw) +
                       SIN(roll)*SIN(pitch)*COS(yaw),
                       0,
                       -SIN(roll)*COS(yaw) +
                       COS(roll)*SIN(pitch)*SIN(yaw),
                       COS(roll)*COS(pitch),
                       SIN(roll)*SIN(yaw) +
                       COS(roll)*SIN(pitch)*COS(yaw),
                       0,
                       COS(pitch)*SIN(yaw),
                       -SIN(pitch),
                       COS(pitch)*COS(yaw),
                       0,
                       0,0,0,1)
    };
    /**
     * Rotate on x-axis in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.xRotation=function(rad){
      return this.mat4(1,0,0,0,
                       0,COS(rad),SIN(rad),0,
                       0,-SIN(rad),COS(rad),0,
                       0,0,0,1)
    };
    /**
     * Rotate on x-axis in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _M.xRotation3x3=function(rad){
      return this.mat3(1,0,0,
                       0, COS(rad), SIN(rad),
                       0, -SIN(rad), COS(rad))
    };
    /**
     * Rotate on y-axis in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.yRotation=function(rad){
      return this.mat4(COS(rad),0,-SIN(rad),0,
                       0,1, 0, 0,
                       SIN(rad), 0, COS(rad), 0,
                       0,0,0,1)
    };
    /**
     * Rotate on y-axis in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _M.yRotation3x3=function(rad){
      return this.mat3(COS(rad), 0, -SIN(rad),
                       0, 1, 0,
                       SIN(rad), 0, COS(rad))
    };
    /**
     * Rotate in z-axis in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.zRotation=function(rad){
      return this.mat4(COS(rad), SIN(rad), 0, 0,
                       -SIN(rad),COS(rad), 0, 0,
                       0, 0, 1, 0,
                       0, 0, 0, 1)
    };
    /**
     * Rotate in z-axis in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _M.zRotation3x3=function(rad){
      return this.mat3(COS(rad),SIN(rad), 0,
                       -SIN(rad),COS(rad), 0,
                       0, 0, 1)
    };
    /**
     * Rotation in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.mat4Rotation=function(pitch,yaw,roll){
      return this.matMult(
               this.matMult(this.zRotation(roll),
                            this.xRotation(pitch)), this.yRotation(yaw))
    };
    /**
     * Rotation in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _M.mat3Rotation=function(pitch,yaw,roll){
      return this.matMult(
               this.matMult(this.zRotation3x3(roll),
                            this.xRotation3x3(pitch)),this.yRotation3x3(yaw))
    };
    /**
     * Orthogonal of matrix.
     * @public
     * @function
     * @param m 4x4 matrix
     * @returns 4x4 matrix
     */
    _M.matOrthogonal4x4=function(m){
      _.assert(m.cells.length===16);
      let rows=m.dim[0],cols=m.dim[1];
      let p= _.partition(cols,m.cells);
      let r1=p[0], r2=p[1], r3=p[2], r4=p[3];
      let xAxis=r1.slice(0,3);
      let yAxis=r2.slice(0,3);
      let zAxis=this.vec3Cross(xAxis,yAxis);
      let _x=this.vec3Cross(yAxis,zAxis);
      let _y=this.vec3Cross(zAxis,xAxis);
      let _z=this.vec3Cross(xAxis,yAxis);
      return this.mat4(_x[0],_x[1],_x[2],r1[3],
                       _y[0],_y[1],_y[2],r2[3],
                       _z[0],_z[1],_z[2],r3[3],
                       r4[0],r4[1],r4[2],r4[3])
    };
    /**
     * @public
     * @function
     * @param m 3x3 matrix
     * @returns 3x3 matrix
     */
    _M.matOrthogonal3x3=function(m){
      _.assert(m.cells.length===9);
      let rows=m.dim[0], cols=m.dim[1];
      let p= _.partition(cols,m.cells);
      let r1=p[0], r2=p[1], r3=p[2];
      let xAxis=r1;//this.V3(r1[0],r1[1],r1[2]);
      let yAxis=r2;//this.V3(r2[0],r2[1],r2[2]);
      let zAxis=this.vec3Cross(xAxis,yAxis);
      let _x=this.vec3Cross(yAxis,zAxis);
      let _y=this.vec3Cross(zAxis,xAxis);
      let _z=this.vec3Cross(xAxis,yAxis);
      return this.mat3(_x[0],_x[1],_x[2],
                       _y[0],_y[1],_y[2],
                       _z[0],_z[1],_z[2])
    };
    /**
     * Rotate on this axis by this angle in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.mat4AxisAngle=function(axis ,rad){
      _.assert(axis.length===3);
      let x=axis[0],y=axis[1],z=axis[2];
      let d= this.vecLen(axis);
      let c=COS(rad);
      let s=SIN(rad);
      let t= 1-c;
      if(!this.fuzzyEq(d,1)){
        let ilen= 1/d;
        x *= ilen;
        y *= ilen;
        z *= ilen;
      }
      return this.mat4(c+t*x*x,
                       t*x*y+s*z,
                       t*x*z-s*y,
                       0,
                       t*x*y-s*z,
                       c + t*y*y,
                       t*y*z+s*x,
                       0,
                       t*x*z+s*y,
                       t*y*z-s*x,
                       c + t*z*z,
                       0,
                       0,0,0,1)
    };
    /**
     * Rotate on this axis by this angle in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _M.axisAngle3x3=function(axis,rad){
      _.assert(axis.length===3);
      let x=axis[0],y=axis[1],z=axis[2];
      let c=COS(rad);
      let s=SIN(rad);
      let t= 1-c;
      let d= this.vecLen(axis);
      if(!this.fuzzyEq(d,1)){
        let ilen=1/d;
        x *= ilen;
        y *= ilen;
        z *= ilen;
      }
      return this.mat3(c + t*x*x,
                       t*x*y + s*z,
                       t*x*z - s*y,
                       t*x*y - s*z,
                       c + t*y*y,
                       t*y*z + s*x,
                       t*x*z + s*y,
                       t*y*z - s*x,
                       c + t*z*z)
    };
    /**
     * Multiply vector and 4x4 matrix.
     * @function
     * @public
     * @returns 3d vector
     */
    _M.matMultV3M4=function(v3,m4){
      _.assert(v3.length===3&&m4.cells.length===16);
      let x=v3[0],y=v3[1],z=v3[2];
      let p=_.partition(4,m4.cells);
      let r1=p[0],r2=p[1],r3=p[2],r4=p[3];
      return this.V3(x*r1[0] + y*r2[0] + z*r3[0] + 1*r4[0],
                     x*r1[1] + y*r2[1] + z*r3[1] + 1*r4[1],
                     x*r1[2] + y*r2[2] + z*r3[2] + 1*r4[2])
    };
    /**
     * Multiply vector and 4x4 matrix.
     * @public
     * @function
     * @returns 3d vector
     */
    _M.mat3MultVX_4x4=function(v3,m4){
      _.assert(v3.length===3&&m4.cells.length===16);
      let x=v3[0],y=v3[1],z=v3[2];
      let p=_.partition(4,m4.cells);
      let r1=p[0],r2=p[1],r3=p[2],r4=p[3];
      return this.V3(x*r1[0] + y*r2[0] + z*r3[0] + 0*r4[0],
                     x*r1[1] + y*r2[1] + z*r3[1] + 0*r4[1],
                     x*r1[2] + y*r2[2] + z*r3[2] + 0*r4[2])
    };
    /**
     * Multiply vector and 3x3 matrix.
     * * @public
     * @function
     * @returns 3d vector
     */
    _M.mat3MultVX_3x3=function(v3,m3){
      _.assert(v3.length===3&&m3.cells.length===9);
      let x=v3[0],y=v3[1],z=v3[2];
      let p=_.partition(3,m3.cells);
      let r1=p[0],r2=p[1],r3=p[2];
      return this.V3(
        this.vecDot(v3, this.V3(r1[0],r2[0],r3[0])),
        this.vecDot(v3, this.V3(r1[1],r2[1],r3[1])),
        this.vecDot(v3, this.V3(r1[2],r2[2],r3[2])))
    };
    /**
     * Transform a 4x4 matrix.
     * @public
     * @function
     * @param eulerRotation 3d vector
     * @returns 4x4 matrix
     */
    _M.mat4TxformViaRotation=function(scale,eulerRotation,translate){
      _.assert(eulerRotation.length===3);
      let x=eulerRotation[0];
      let y=eulerRotation[1];
      let z=eulerRotation[2];
      return this.matMult(
        this.matMult(this.matFromVX(scale),
                     this.mat4Rotation(x,y,z)),
        this.mat4Txlate(translate))
    };
    /**
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.mat4TxformViaAxisAngle=function(scale,rotationAxis, rotationAngle,translate){
      return this.matMult(
        this.matMult(this.matFromVX(scale),
                     this.mat4AxisAngle(rotationAxis,
                                        rotationAngle)),
        this.mat4Txlate(translate))
    };
    /**
     * View of a 4D matrix.
     * @public
     * @function
     */
    _M.mat4LookAt=function(pos,target,up){
      let fwd=this.vecUnit(this.vecSub(target,pos));
      let right=this.vecUnit(this.vec3Cross(up,fwd));
      let newUp=this.vecCross(fwd,right);
      return this.mat4(right[0],newUp[0],fwd[0],0,
                       right[1],newUp[1],fwd[1],0,
                       right[2],newUp[2],fwd[2],0,
                       -this.vecDot(right,pos),
                       -this.vecDot(newUp,pos),
                       -this.vecDot(fwd,pos), 1)
    };
    /**
     * 4D projection.
     * https://msdn.microsoft.com/en-us/library/windows/desktop/bb147302(v=vs.85).aspx
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.mat4Proj=function(fov,aspect,zNear,zFar){
      let tanHalfFov= TAN(fov*0.5);
      let fovY=1/tanHalfFov;//cot(fov/2)
      let fovX=fovY/aspect; //cot(fov/2) / aspect
      let r33= zFar / (zFar - zNear);// far/range
      let ret= this.matIdentity(4);
      ret.cells[_cell(4,4,1,1)]= fovX;
      ret.cells[_cell(4,4,2,2)]=fovY;
      ret.cells[_cell(4,4,3,3)]= r33;
      ret.cells[_cell(4,4,3,4)]= 1;
      ret.cells[_cell(4,4,4,3)]= -zNear*r33; //-near * (far / range)
      ret.cells[_cell(4,4,4,4)]=0;
      return ret
    };
    /**
     * Orthogonal to this 4x4 matrix.
     * Derived following: http://www.songho.ca/opengl/gl_projectionmatrix.html
     * Above was wrong, it was OpenGL style, our matrices are DX style
     * Correct impl:
     * https://msdn.microsoft.com/en-us/library/windows/desktop/bb205347(v=vs.85).aspx
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _M.mat4Ortho=function(left,right,bottom,top,zNear,zFar){
      let _11= (right-left)/2;
      let _22= (top-bottom)/2;
      let _33= (zFar-zNear)/1;
      let _41= (left+right)/(left-right);
      let _42= (top+bottom)/(bottom-top);
      let _43= zNear/(zNear-zFar);
      return this.mat4(_11,0,0,0,
                       0,_22,0, 0,
                       0, 0, _33, 0,
                       _41, _42, _43, 1)
    };
    /**
     * Decompose matrix.
     * @public
     * @function
     * @param rot1 3x3 matrix
     * @returns 3d vector
     */
    _M.matDecompose3x3=function(rot1){
      let rot= this.matXpose(rot1);
      let p= _.partition(3, rot);
      let r1=p[0],r2=p[1],r3=p[2];
      let sy= Math.sqrt(r1[0]*r1[0] + r2[0]*r2[0]);
      let singular= sy< 1e-6;
      return !singular ? this.V3(ATAN2(r3[1],r3[2]),
                                 ATAN2(-r3[0],sy),
                                 ATAN2(r2[0],r1[0]))
                       : this.V3(ATAN2(-r2[2],r2[1]),
                                 ATAN2(-r3[0],sy), 0)
    };
    /**
     * Hypotenuse squared.
     * @public
     * @function
     */
    _M.pythagSQ=function(x,y){ return x*x + y*y };
    /**
     * Hypotenuse.
     * @public
     * @function
     */
    _M.pythag=function(x,y){ return Math.sqrt(x*x + y*y) };
    /**
     * Modulo of the next increment.
     * @function
     * @public
     */
    _M.wrap=function(i,len){ return (i+1) % len };
    /**
     * Is it more a or b?
     * @public
     * @function
     */
    _M.biasGreater=function(a,b){
      const biasRelative= 0.95;
      const biasAbsolute= 0.01;
      return a >= (b*biasRelative + a*biasAbsolute)
    };

    return (_singleton=_M);
  };

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
// Copyright © 2013-2020, Kenneth Leung. All rights reserved.

;(function(global){
  "use strict";
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  const VISCHS=" @N/\\Ri2}aP`(xeT4F3mt;8~%r0v:L5$+Z{'V)\"CKIc>z.*"+
               "fJEwSU7juYg<klO&1?[h9=n,yoQGsW]BMHpXb6A|D#q^_d!-";
  const VISCHS_LEN=VISCHS.length;
  /**
   * @public
   * @function
   */
  global["io.czlab.mcfud.crypt"]=function(){
    const Core=global["io.czlab.mcfud.core"]();
    const _=Core.u;
    const _C={};
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
        if(charat(i)===ch)
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
     * Encrypt source by shifts.
     * @public
     * @function
     */
    _C.encrypt=function(src, shift){
      if(shift===0){ return src }
      function _f(shift,delta,cpos){
        return shift<0 ? _rotr(delta,cpos) : _rotl(delta,cpos)
      }
      let out=[];
      let d=_calcDelta(shift);
      src.split().forEach(c => {
        let p=_getch(c);
        out.push(p<0 ? c : _f(shift,d,p));
      })
      return out.join("")
    };
    /**
     * Decrypt text by shifts.
     * @public
     * @function
     */
    _C.decrypt=function(cipherText,shift){
      if(shift===0){ return cipherText }
      function _f(shift,delta,cpos) {
        return shift< 0 ? _rotl(delta,cpos) : _rotr(delta,cpos)
      }
      let p,out=[];
      let d= _calcDelta(shift);
      cipherText.split("").forEach(c => {
        p= _getch(c);
        out.push(p<0 ? c : _f(shift,d,p));
      });
      return out.join("")
    };

    return _singleton= _C;
  };

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
// Copyright © 2020, Kenneth Leung. All rights reserved.

;(function(global){
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  global["io.czlab.mcfud.gfx"]=function(){
    if(_singleton){ return _singleton }
    const Core=global["io.czlab.mcfud.core"]();
    const _M=global["io.czlab.mcfud.math"]();
    const _=Core.u;
    const _G={};
    const TWO_PI=Math.PI*2;
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
    };
    /**
     * @public
     * @function
     */
    _G.drawShapeLine=function(ctx,line){
      return this.drawLine(ctx,line.p[0],line.p[1],line.q[0],line.q[1]);
    };

    return (_singleton=_G);
  };

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
// Copyright © 2020, Kenneth Leung. All rights reserved.
;
(function(global){
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  global["io.czlab.mcfud.geo2d"]=function(){
    if(_singleton) { return _singleton }
    const _M=global["io.czlab.mcfud.math"]();
    const Core=global["io.czlab.mcfud.core"]();
    const _=Core.u;
    const _G={};
    /**
     * @public
     * @class
     */
    class Box4{
      constructor(left,bottom,right,top){
        this.left=left;
        this.right=right;
        this.top=top;
        this.bottom=bottom;
      }
    }
    /**
     * @public
     * @class
     */
    class Rect{
      constructor(x,y,width,height){
        if(arguments.length===2){
          this.width=x;
          this.height=y;
          this.pos= _M.V2();
        }else{
          this.pos=_M.V2(x,y);
          this.width=width;
          this.height=height;
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
        return new Area(this.width/2,this.height/2)
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
        p=poly.points[i];
        q=poly.points[i2];
        area += (p[0]*q[1] - q[0]*p[1]);
      }
      return Math.abs(area)/2
    }
    /**
     * Find the center point of this polygon.
     * @public
     * @function
     */
    _G.calcPolyCenter=function(points){
      let A= 6*this.polyArea(points);
      let cx=0;
      let cy=0;
      for(let p,q,i2,i=0,len=points.length;i<len;++i){
        i2= (i+1)%len;
        p=points[i];
        q=points[i2];
        cx += (p[0]+q[0]) * (p[0]*q[1]-q[0]*p[1]);
        cy += (p[1]+q[1]) * (p[0]*q[1]-q[0]*p[1]);
      }
      return _M.V2(cx/A, cy/A)
    };
    /**
     * @public
     * @class
     */
    class Polygon{
      constructor(){
        this.points=[];
      }
    }
    /**
     * @public
     * @class
     */
    class Line{
      constructor(x1,y1,x2,y2){
        this.p= _M.V2(x1,y1);
        this.q= _M.V2(x2,y2);
      }
    }
    /**
     * @public
     * @class
     */
    class Circle{
      constructor(radius){
        this.radius=radius;
      }
    }
    /**
     * Shift a set of points.
     * @public
     * @function
     */
    _G.shiftPoints=function(ps,delta){
      return ps.map(v => _M.vecAdd(v,delta))
    };
    /**
     * Rotate a set of points.
     * @public
     * @function
     */
    _G.rotPoints=function(ps,rot,pivot){
      return ps.map(v => _M.vec2Rot(v,rot,pivot))
    };
    /**
     * Find the vertices of a rectangle.
     * @public
     * @function
     * @returns points in counter-cwise, bottom-right first.
     */
    _G.calcRectPoints=function(w,h){
      let w2=w/2;
      let h2=h/2;
      return [_M.V2(hw,-hh),
              _M.V2(hw,hh),
              _M.V2(-hw,hh),
              _M.V2(-hw,-hh)];
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
    /**
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
      return r.pos[0] + r.width/2
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
      return r.pos[1] + r.height/2
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
    _G.containsPoint=function(r,x,y){
      return x >= this.rectGetMinX(r) &&
             x <= this.rectGetMaxX(r) &&
             y >= this.rectGetMinY(r) &&
             y <= this.rectGetMaxY(r)
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
      let x= Math.min(r1.pos[0],r2.pos[0]);
      let y= Math.min(r1.pos[1],r2.pos[1]);
      return new Rect(x,y,
                      Math.max(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                      Math.max(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
    };
    /**
     * @public
     * @function
     */
    _G.rectIntersectsRect=function(r1,r2){
      let x= Math.max(r1.pos[0],r2.pos[0]);
      let y= Math.max(r1.pos[1],r2.pos[1]);
      return new Rect(x,y,
                      Math.min(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                      Math.min(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
    };

    return _singleton= _.inject(_G, {Circle: Circle,
                                     Line: Line,
                                     Polygon: Polygon, Rect: Rect, Area: Area});
  };

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
 * Copyright © 2013-2020, Kenneth Leung. All rights reserved. */

;(function(global) {
  "use strict";
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  /**
   * @public
   * @function
   */
  global["io.czlab.mcfud.negamax"]= function(){
    if(_singleton){ return _singleton }
    const Core=global["io.czlab.mcfud.core"]();
    const _= Core.u;
    const _N={};
    const PINF = 1000000;
    /**
     * @public
     * @class
     */
    class FFrame{
      constructor(sz){
        this.state= _.fill(new Array(sz*sz),0);
        this.lastBestMove=0;
        this.other=0;
        this.cur=0;
      }
    }
    /**
     * @public
     * @class
     */
    class GameBoard{
      constructor(){
      }
      getNextMoves(frame){}
      evalScore(frame){}
      isStalemate(frame){}
      isOver(f){}
      undoMove(frame, move){}
      makeMove(f, move){}
      switchPlayer(frame){}
      takeFFrame(){}
    }
    /**Nega Min-Max algo.
     * @private
     * @function
     */
    function _negaMax(board, game, maxDepth, depth, alpha, beta){
      if(depth === 0 ||
         board.isOver(game)) return board.evalScore(game);

      let openMoves = board.getNextMoves(game),
          bestValue = -PINF,
          bestMove = openMoves[0];

      if(depth === maxDepth)
        game.lastBestMove = openMoves[0];

      for(let rc, move, i=0; i<openMoves.length; ++i){
        move = openMoves[i];
        //try a move
        board.makeMove(game, move);
        board.switchPlayer(game);
        rc= - _negaMax(board, game, maxDepth, depth-1, -beta, -alpha);
        //now, roll it back
        board.switchPlayer(game);
        board.undoMove(game, move);
        //how did we do ?
        bestValue = _.max(bestValue, rc);
        if(alpha < rc){
          alpha = rc;
          bestMove = move;
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
      _negaMax(board, f, 10, 10, -PINF, PINF);
      return f.lastBestMove;
    };

    return _singleton= _.inject(_N,{ FFrame: FFrame, GameBoard: GameBoard });
  };

})(this);

