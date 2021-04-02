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
  function _module(UseOBJ=false,Core=null){
    class V2Obj{ constructor(){ this.x=0;this.y=0 } }
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_, is}= Core;
    const PLEN=96;
    /** @ignore */
    function _CTOR(){
      return UseOBJ ? new V2Obj() : [0,0] }
    let _POOL=_.fill(PLEN,_CTOR);

    /** @module mcfud/vec2 */

    /**
     * @typedef {number[]} Vec2
     */

    /**Put stuff back into the pool.
     */
    function _drop(...args){
      for(let a,i=0;i<args.length;++i){
        a=args[i];
        if(_POOL.length<PLEN){
          if((UseOBJ && a instanceof V2Obj) ||
            (!UseOBJ && a && a.length===2)) { _POOL.push(a) }
        }else{break}
      }
    }

    /**Take something from the pool.
     */
    function _take(x=0,y=0){
      const out= _POOL.length>0 ? _POOL.pop() : _CTOR();
      if(UseOBJ){
        out.x=x; out.y=y
      }else{
        out[0]=x; out[1]=y }
      return out;
    }

    /**4 basic arithmetic ops. */
    const _4ops={ "+": (a,b)=>a+b, "-": (a,b)=>a-b,
                  "*": (a,b)=>a*b, "/": (a,b)=>a/b };

    /**Make sure we have good data.
     */
    function _assertArgs(a,b,hint){
      if(hint===0){ /*b's type must be same as a*/ }else if(is.num(b)) {b=a}
      UseOBJ ? _.assert(a instanceof V2Obj && b instanceof V2Obj)
             : _.assert(a.length===2&&is.vec(b)&&a.length===b.length);
      return true;
    }

    /**Handles various combination of args. */
    function _vecXXX(op,a,b,c,local){
      const out= _assertArgs(a,b) ? (local ? a : _CTOR()) : null;
      const n= is.num(b);
      if(is.num(c)){
        _.assert(n,"wanted both numbers")
      }else if(n){
        c=b
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
     */
    function _v2rot_arr(a,cos,sin,pivot,local){
      const cx=pivot ? pivot[0] : 0;
      const cy=pivot ? pivot[1] : 0;
      const x_= a[0]-cx;
      const y_= a[1]-cy;
      const x= cx+(x_*cos - y_*sin);
      const y= cy+(x_ * sin + y_ * cos);
      if(local){ a[0]=x; a[1]=y }else{
        a= _take(x,y)
      }
      return a;
    }
    /**Rotate a vector(obj) around a pivot.
     */
    function _v2rot_obj(a,cos,sin,pivot,local){
      const cx=pivot ? pivot.x : 0;
      const cy=pivot ? pivot.y : 0;
      const x_= a.x-cx;
      const y_= a.y-cy;
      const x= cx+(x_*cos - y_*sin);
      const y= cy+(x_ * sin + y_ * cos);
      if(local){ a.x = x; a.y = y }else{
        a= _take(x,y)
      }
      return a;
    }
    /**2d cross product, data-type=[].
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

    const _$={
      /**Internal, for testing only. */
      _switchMode(bObj,size=16){
        UseOBJ=bObj;
        _POOL=_.fill(size||PLEN,_CTOR) },
      /**Internal, for testing only. */
      _checkPoolSize(){ return _POOL.length },
      /**Get a free vec from internal pool.
       * @memberof module:mcfud/vec2
       * @param {number} x
       * @param {number} y
       * @return {Vec2}
       */
      take(x=0,y=0){ return _take(x,y) },
      /**Put back a vec.
       * @memberof module:mcfud/vec2
       * @param {...Vec2} args
       */
      reclaim(...args){ return _drop(...args) },
      /**Create a free vector.
       * @memberof module:mcfud/vec2
       * @param {number} x
       * @param {number} y
       * @return {Vec2}
       */
      vec(x=0,y=0){ return _take(x,y) },
      /**Vector addition: A+B.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      add(a,b,c){ return _vecXXX(_4ops["+"],a,b,c) },
      /**Vector addition: A=A+B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      add$(a,b,c){ return _vecXXX(_4ops["+"],a,b,c,1) },
      /**Vector subtraction: A-B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      sub(a,b,c){ return _vecXXX(_4ops["-"],a,b,c) },
      /**Vector subtraction: A=A-B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      sub$(a,b,c){ return _vecXXX(_4ops["-"],a,b,c,1) },
      /**Vector multiply: A*B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      mul(a,b,c){ return _vecXXX(_4ops["*"],a,b,c) },
      /**Vector multiply: A=A*B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      mul$(a,b,c){ return _vecXXX(_4ops["*"],a,b,c,1) },
      /**Vector division: A/B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      div(a,b,c){ return _vecXXX(_4ops["/"],a,b,c) },
      /**Vector division: A=A/B
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number|Vec2} b
       * @return {Vec2}
       */
      div$(a,b,c){ return _vecXXX(_4ops["/"],a,b,c,1) },
      /**Dot product of 2 vectors,
       * cos(t) = a·b / (|a| * |b|)
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {number}
       */
      dot(a,b){
        if(_assertArgs(a,b,0))
          return UseOBJ ? (a.x*b.x + a.y*b.y)
                        : (a[0]*b[0] + a[1]*b[1])
      },
      /**Create a vector A->B, calculated by doing B-A.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {Vec2} b
       * @return {Vec2}
       */
      vecAB(a,b){
        if(_assertArgs(a,b,0))
          return UseOBJ ? _take(b.x-a.x,b.y-a.y)
                        : _take(b[0]-a[0],b[1]-a[1])
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
        let v= this.sub(b,a),
            d= this.len2(v);
        _drop(v);
        return d;
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
        let d=this.len(a),
            z=_.feq0(d),
            out=_CTOR();
        if(UseOBJ){
          out.x= z?0:a.x/d;
          out.y= z?0:a.y/d;
        }else{
          out[0]= z?0:a[0]/d;
          out[1]= z?0:a[1]/d;
        }
        return out;
      },
      /**Normalize this vector: a=a/|a|
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @return {Vec2} undefined if zero length
       */
      unit$(a){
        let d=this.len(a),
            z=_.feq0(d);
        if(UseOBJ){
          a.x =z?0: a.x/d;
          a.y =z?0:a.y/d;
        }else{
          a[0]=z?0:a[0]/ d;
          a[1]=z?0:a[1]/ d;
        }
        return a;
      },
      /**Copy `src` into `des`.
       * @memberof module:mcfud/vec2
       * @param {Vec2} des
       * @param {Vec2} src
       * @return {Vec2}
       */
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
      /**Make a copy of this vector.
       * @memberof module:mcfud/vec2
       * @param {Vec2} v
       * @return {Vec2}
       */
      clone(v){ return this.set(_CTOR(),v) },
      /**Copy values(args) into `des`.
       * @memberof module:mcfud/vec2
       * @param {Vec2} des
       * @param {number} x
       * @param {number} y
       * @return {Vec2}
       */
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
      /**Rotate a vector around a pivot.
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number} rot
       * @param {Vec2} [pivot]
       * @return {Vec2}
       */
      rot(a,rot,pivot=null){
        _assertArgs(a, pivot||a,0);
        const c= Math.cos(rot);
        const s= Math.sin(rot);
        return UseOBJ ? _v2rot_obj(a,c,s,pivot) : _v2rot_arr(a,c,s,pivot);
      },
      /**Rotate a vector around a pivot: a=rot(a,...)
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {number} rot
       * @param {Vec2} [pivot]
       * @return {Vec2}
       */
      rot$(a,rot,pivot){
        _assertArgs(a, pivot||a,0);
        const c= Math.cos(rot);
        const s= Math.sin(rot);
        return UseOBJ ? _v2rot_obj(a,c,s,pivot,1)
                      : _v2rot_arr(a,c,s,pivot,1);
      },
      /**2d cross product.
       * The sign of the cross product (AxB) tells you whether the 2nd vector (B)
       * is on the left or right side of the 1st vector (A), +ve implies
       * B is left of B, (rotate ccw to B), -ve means B is right of A (rotate cw to B).
       * The absolute value of the 2D cross product is the sine of the angle
       * in between the two vectors.
       * @memberof module:mcfud/vec2
       * @param {number|Vec2} p1
       * @param {number|Vec2} p2
       * @return {number|Vec2}
       */
      cross(p1,p2){ return UseOBJ ? _vecXSS_obj(p1,p2) : _vecXSS_arr(p1,p2) },
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
        _assertArgs(a,a);
        if(UseOBJ){
          return ccw ? _take(-a.y,a.x) : _take(a.y,-a.x)
        }else{
          return ccw ? _take(-a[1],a[0]) : _take(a[1],-a[0])
        }
      },
      /**Change vector to be perpendicular to what it was before, effectively
       * rotates it 90 degrees(normal), A=normal(A).
       * @memberof module:mcfud/vec2
       * @param {Vec2} a
       * @param {boolean} ccw counter-clockwise?
       * @return {Vec2}
       */
      normal$(a,ccw=false){
        _assertArgs(a,a);
        const x= UseOBJ ? a.x : a[0];
        if(UseOBJ){
          if(ccw){ a.x=-a.y; a.y= x }else{ a.x=a.y; a.y= -x }
        }else{
          if(ccw){ a[0]=-a[1]; a[1]= x }else{ a[0]=a[1]; a[1]= -x }
        }
        return a;
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
        return this.mul$(bn, this.dot(a,bn));
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
        return this.sub(ray, this.mul(surface_normal, 2*this.dot(ray,surface_normal)))
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


