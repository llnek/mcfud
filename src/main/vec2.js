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
    class V2Obj{ constructor(){ this.x=this.y=0 } }
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_, is}= Core;
    function _cobj() { return new V2Obj() }
    function _carr() { return [0,0] }
    const _CTOR= UseOBJ ? _cobj : _carr;
    const _POOL= [];
    const PLEN=96;
    /**Put stuff back into the pool.
     * @private
     * @function
     */
    function _drop(...args){
      for(let a,i=0;i<args.length;++i){
        a=args[i];
        if(_POOL.length<PLEN){
          if((UseOBJ && a instanceof V2Obj) ||
             (!UseOBJ && a && a.length===2)) _POOL.push(a)
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
    function _assertArgs(a,b){
      if(is.num(b)) b=a;
      UseOBJ ? _.assert(a instanceof V2Obj && b instanceof V2Obj)
             : _.assert(a.length===2&&a.length===b.length);
      return true;
    }
    /**
     * @private
     * @function
     */
    function _vecXXX(op,a,b,local){
      let out= _assertArgs(a,b) ? (local ? a : _CTOR()) : null;
      let n= is.num(b);
      if(UseOBJ){
        out.x=op(a.x, n?b:b.x);
        out.y=op(a.y, n?b:b.y);
      }else{
        out[0]=op(a[0], n?b:b[0]);
        out[1]=op(a[1], n?b:b[1]);
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
      if(local){
        a[0] = x;
        a[1] = y;
      }else{
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
      if(local){
        a.x = x;
        a.y = y;
      }else{
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
    }
    /**The object to export.
     * @private
     * @var {object}
     */
    const _$={
      take:_take,
      reclaim:_drop,
      vec2(x,y){ return _take(x,y) },
      /** A+B */
      add(a,b){ return _vecXXX(_4ops["+"],a,b) },
      /** A= A+B */
      add$(a,b){ return _vecXXX(_4ops["+"],a,b,1) },
      /** A-B */
      sub(a,b){ return _vecXXX(_4ops["-"],a,b) },
      /** A=A-B */
      sub$(a,b){ return _vecXXX(_4ops["-"],a,b,1) },
      /** A*B */
      mul(a,b){ return _vecXXX(_4ops["*"],a,b) },
      /** A=A*B */
      mul$(a,b){ return _vecXXX(_4ops["*"],a,b,1) },
      /** A/B */
      div(a,b){ return _vecXXX(_4ops["/"],a,b) },
      /** A=A/B */
      div$(a,b){ return _vecXXX(_4ops["/"],a,b,1) },
      /** Dot product of vectors, cos(t) = a·b / (|a| * |b|) */
      dot(a,b){
        if(_assertArgs(a,b))
          return UseOBJ ? (a.x*b.x + a.y*b.y)
                        : (a[0]*b[0] + a[1]*b[1])
      },
      /** vectorAB is calculated by doing B-A */
      makeVecAB(a,b){
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
        _assertArgs(des,src);
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
      copy(des,...args){
        _.assert(args.length===2) && _assertArgs(des,des);
        if(UseOBJ){
          des.x=args[0];
          des.y=args[1];
        }else{
          des[0]=args[0];
          des[1]=args[1];
        }
        return des;
      },
      /** Rotate a vector around a pivot */
      rot(a,rot,pivot){
        _assertArgs(a, pivot||a);
        const c= Math.cos(rot);
        const s= Math.sin(rot);
        return UseOBJ ? _v2rot_obj(a,c,s,pivot) : _v2rot_arr(a,c,s,pivot);
      },
      /** A=rot(A) */
      rot$(a,rot,pivot){
        _assertArgs(a, pivot||a);
        const c= Math.cos(rot);
        const s= Math.sin(rot);
        return UseOBJ ? _v2rot_obj(a,c,s,pivot,1)
                      : _v2rot_arr(a,c,s,pivot,1);
      },
      /** 2d cross product */
      cross(p1,p2){ return UseOBJ ? _vecXSS_obj(p1,p2) : _vecXSS_arr(p1,p2) },
      /**
       * Angle between these 2 vectors.
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
      /** Reflect a normal */
      reflect(src,normal){
        return this.sub(src, this.mul(normal, 2*this.dot(src,normal)))
      },
      /** Negate a vector */
      flip(v){ return this.mul(v, -1) },
      /** V=flip(V) */
      flip$(v){ return this.mul$(v, -1) },
      /** Move a bunch of points */
      translate(pos,...args){
        let b,a=false;
        if(args.length===1 && is.vec(args[0])){
          args=args[0];
          a=true;
        }
        b=args.length===1&&!a;
        if(UseOBJ){
          return b ? this.vec2(pos.x+args[0].x,pos.y+args[0].y)
                   : args.map(p=> this.vec2(pos.x+p.x,pos.y+p.y))
        }else{
          return b ? this.vec2(pos[0]+args[0][0],pos[1]+args[0][1])
                   : args.map(p=> this.vec2(pos[0]+p[0],pos[1]+p[1]))
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


