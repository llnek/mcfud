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
       * B is left of B, (rotate ccw to B), -ve means B is right of A (rotate cw to B).
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


