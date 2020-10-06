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
    function isFun(obj){ return tostr.call(obj) === "[object Function]" }
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
    //const EPSILON= 0.00001;
    const EPSILON= 0.0000000001;
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
        return min + Math.random() * (max - min);
      },
      randMinus1To1(){ return (Math.random() - 0.5) * 2 },
      randInt(num){ return _randXYInclusive(0,num) },
      randInt2: _randXYInclusive,
      rand(){ return Math.random() },
      inst(type,obj){ return obj instanceof type },
      isPerc(s){
        return isStr(s) && s.match(/^([0-9])(\.?[0-9]+|[0-9]*)%$/);
      },
      jsMap(){ return new Map() },
      jsObj(){ return {} },
      jsVec(...args){
        return args.length===0 ? [] : args.slice();
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
          j = Math.floor(Math.random() * (i+1));
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
      timer(f,delay=0){
        return setTimeout(f,delay);
      },
      clear(id){
        id !== undefined && clearTimeout(id);
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
      return {
        sub(subject,cb,ctx){
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
        pub(subject,data){
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
        unsub(subject,cb,ctx){
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


