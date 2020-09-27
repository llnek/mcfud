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
  /**
   * @public
   * @function
   */
  global["io.czlab.mcfud.vec2"]=function(UseOBJ){
    class V2Obj{ constructor(){ this.x=0; this.y=0; } }
    const Core= global["io.czlab.mcfud.core"]();
    const _M= global["io.czlab.mcfud.math"]();
    if(_M.Vec2){return _M.Vec2}
    const EPSILON= 0.0000000001;
    const _=Core.u;
    const is=Core.is;
    const _V={};
    function _cobj() { return new V2Obj() }
    function _carr() { return [0,0] }
    const _CTOR= UseOBJ ? _cobj : _carr;
    const _POOL= _.fill(new Array(128), _CTOR);
    /**
     * @private
     * @function
     */
    function _drop(...args){
      args.forEach(a => {
        if(a){
          if(UseOBJ){
            if(a instanceof V2Obj) _POOL.push(a)
          }else{
            if(a.length===2) _POOL.push(a)
          }
        }
      })
    }
    /**
     * @private
     * @function
     */
    function _take(x,y){
      let out= _POOL.length>0 ? _POOL.pop() : _CTOR();
      if(UseOBJ){
        out.x=x||0;
        out.y=y||0;
      }else{
        out[0]=x||0;
        out[1]=y||0;
      }
      return out;
    }
    /**
     * @public
     * @function
     */
    _V.V2=function(x,y){ return _take(x,y) };
    _V.takeV2=_take;
    _V.dropV2=_drop;
    /**
     * @private
     * @var {object}
     */
    const _4ops={ "+": (a,b)=>a+b, "-": (a,b)=>a-b,
                  "*": (a,b)=>a*b, "/": (a,b)=>a/b };
    /**
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
    /**
     * @public
     * @function
     */
    _V.vecAdd=function(a,b){ return _vecXXX(_4ops["+"],a,b) };
    /**
     * @public
     * @function
     */
    _V.vecAddSelf=function(a,b){ return _vecXXX(_4ops["+"],a,b,1) };
    /**
     * @function
     * @public
     */
    _V.vecSub=function(a,b){ return _vecXXX(_4ops["-"],a,b) };
    /**
     * @public
     * @function
     */
    _V.vecSubSelf=function(a,b){ return _vecXXX(_4ops["-"],a,b,1) };
    /**
     * @public
     * @function
     */
    _V.vecMul=function(a,b){ return _vecXXX(_4ops["*"],a,b) };
    /**
     * @public
     * @function
     */
    _V.vecMulSelf=function(a,b){ return _vecXXX(_4ops["*"],a,b,1) };
    /**
     * @public
     * @function
     */
    _V.vecDiv=function(a,b){ return _vecXXX(_4ops["/"],a,b) };
    /**
     * @public
     * @function
     */
    _V.vecDivSelf=function(a,b){ return _vecXXX(_4ops["/"],a,b,1) };
    /**
     * Dot product of vectors, cosα = a·b / (|a| * |b|).
     *
     * @public
     * @function
     * @returns {number}
     */
    _V.vecDot=function(a,b){
      return _assertArgs(a,b) ? (UseOBJ ? (a.x * b.x + a.y * b.y)
                                        : (a[0]*b[0] + a[1]*b[1])) : undefined
    }
    /**
     * @public
     * @function
     */
    _V.makeVecAB=function(a,b){
      return _take(b[0]-a[0],b[1]-a[1])
    };
    /**
     * @public
     * @function
     */
    _V.vecLen2=function(a){ return this.vecDot(a,a) }
    /**
     * @public
     * @function
     */
    _V.vecLen=function(a){ return Math.sqrt(this.vecLen2(a)) }
    /**
     * @public
     * @function
     */
    _V.vecDist2=function(a,b){
      let v= this.vecSub(b,a);
      let d= this.vecLen2(v);
      _drop(v);
      return d;
    }
    /**
     * @public
     * @function
     */
    _V.vecDist=function(a,b){ return Math.sqrt(this.vecDist2(a,b)) }
    /**
     * Unit-vector.
     * @public
     * @function
     */
    _V.vecUnit=function(a){
      let d=this.vecLen(a);
      let out= _CTOR();
      if(d>EPSILON){
        if(UseOBJ){
          out.x = a.x/d;
          out.y = a.y/d;
        }else{
          out[0] = a[0]/d;
          out[1] = a[1]/d;
        }
      }
      return out;
    };
    /**
     * @public
     * @function
     */
    _V.vecUnitSelf=function(a){
      let d=this.vecLen(a);
      if(d>EPSILON){
        if(UseOBJ){
          a.x /= d;
          a.y /= d;
        }else{
          a[0] /= d;
          a[1] /= d;
        }
      }
      return a;
    };
    /**
     * @public
     * @function
     */
    _V.vecSet=function(des,src){
      _assertArgs(des,src);
      if(UseOBJ){
        des.x=src.x;
        des.y=src.y;
      }else{
        des[0]=src[0];
        des[1]=src[1];
      }
      return des
    }
    /**
     * @public
     * @function
     */
    _V.vecClone=function(v){
      return this.vecSet(_CTOR(),v)
    };
    /**
     * @public
     * @function
     */;
    _V.vecCopy=function(des,...args){
      _.assert(args.length===2) && _assertArgs(des,des);
      if(UseOBJ){
        des.x=args[0];
        des.y=args[1];
      }else{
        des[0]=args[0];
        des[1]=args[1];
      }
      return des
    };
    /**
     * @private
     * @function
     */
    function _v2rot_arr(a,cos,sin,center,local){
      let cx=center ? center[0] : 0;
      let cy=center ? center[1] : 0;
      let x_= a[0] - cx;
      let y_= a[1] - cy;
      let x= cx + (x_*cos - y_*sin);
      let y= cy + (x_ * sin + y_ * cos);
      if(local){
        a[0] = x;
        a[1] = y;
      }else{
        a= _take(x,y);
      }
      return a;
    }
    /**
     * @private
     * @function
     */
    function _v2rot_obj(a,cos,sin,center,local){
      let cx=center ? center.x : 0;
      let cy=center ? center.y : 0;
      let x_= a.x - cx;
      let y_= a.y - cy;
      let x= cx + (x_*cos - y_*sin);
      let y= cy + (x_ * sin + y_ * cos);
      if(local){
        a.x = x;
        a.y = y;
      }else{
        a= _take(x,y);
      }
      return a;
    }
    /**
     * @public
     * @function
     */
    _V.vec2Rot=function(a,rot,center){
      _assertArgs(a, center || a);
      let c= Math.cos(rot);
      let s= Math.sin(rot);
      return UseOBJ ? _v2rot_obj(a,c,s,center) : _v2rot_arr(a,c,s,center);
    };
    /**
     * @public
     * @function
     */
    _V.vec2RotSelf=function(a,rot,center){
      _assertArgs(a, center || a);
      let c= Math.cos(rot);
      let s= Math.sin(rot);
      return UseOBJ ? _v2rot_obj(a,c,s,center,1) : _v2rot_arr(a,c,s,center,1);
    };
    /**
     * @private
     * @function
     */
    function _vecXSS_arr(p1,p2){
      if(is.vec(p1) && is.vec(p2)){
        _assertArgs(p1,p2);
        return p1[0] * p2[1] - p1[1] * p2[0]
      }
      if(is.vec(p1) && is.num(a)){
        _assertArgs(p1,p1);
        return _take(p2 * p1[1], -p2 * p1[0])
      }
      if(is.num(p1) && is.vec(p2)){
        _assertArgs(p2,p2);
        return _take( -p1 * p2[1], p1 * p2[0])
      }
    }
    /**
     * @private
     * @function
     */
    function _vecXSS_obj(p1,p2){
      if(p1 instanceof V2Obj && p2 instanceof V2Obj){
        return p1.x * p2.y - p1.y * p2.x
      }
      if(p1 instanceof V2Obj && is.num(a)){
        return _take(p2 * p1.y, -p2 * p1.x)
      }
      if(is.num(p1) && p2 instanceof V2Obj){
        return _take( -p1 * p2.y, p1 * p2.x)
      }
    }
    /**
     * @public
     * @function
     */
    _V.vec2Cross=function(p1,p2){
      return UseOBJ ? _vecXSS_obj(p1,p2) : _vecXSS_arr(p1,p2)
    };
    /**
     * Angle between these 2 vectors.
     * a.b = cos(t)*|a||b|
     * @public
     * @function
     */
    _V.vecAngle=function(a,b){
      return Math.acos(this.vecDot(a,b) / (this.vecLen(a) * this.vecLen(b)))
    };
    /**
     * Change vector to be perpendicular to what it was before, effectively
     * rotates it 90 degrees in a clockwise direction.
     * @public
     * @function
     */
    _V.perpSelf=function(a,ccw){
      _assertArgs(a,a);
      let x = UseOBJ ? a.x : a[0];
      if(UseOBJ){
        if(ccw){
          a.x=-a.y;
          a.y= x;
        }else{
          a.x=a.y;
          a.y= -x;
        }
      }else{
        if(ccw){
          a[0]=-a[1];
          a[1]= x;
        }else{
          a[0]=a[1];
          a[1]= -x;
        }
      }
      return a;
    };
    /**
     * Change vector to be perpendicular to what it was before, effectively
     * rotates it 90 degrees in a clockwise direction.
     * @public
     * @function
     */
    _V.perp=function(a,ccw){
      _assertArgs(a,a);
      if(UseOBJ){
        return ccw ? _take(-a.y,a.x) : _take(a.y,-a.x)
      }else{
        return ccw ? _take(-a[1],a[0]) : _take(a[1],-a[0])
      }
    };
    /**
     * Find scalar projection.
     * @public
     * @function
     * @returns {number}
     */
    _V.proj=function(a,b){
      return this.vecDot(a,b)/this.vecLen(b)
    };
    /**Find vector projection.
     * @public
     * @function
     */
    _V.vecProj=function(a,b){
      // (a.b')b'
      let bn = this.vecUnit(b);
      return this.vecMulSelf(bn, this.vecDot(a,bn));
      //return this.vecMul(b, this.vecDot(a,b)/this.vecLen2(b))
    };
    /**
     * Find the perpedicular vector.
     * @public
     * @function
     */
    _V.vecPerp=function(a,b){ return this.vecSub(a, this.vecProj(a,b)) };
    /**
     * Reflect a normal.
     * @public
     * @function
     */
    _V.vecReflect=function(src,normal){
      return this.vecSub(src, this.vecMul(normal, 2*this.vecDot(src,normal)))
    };
    /**
     * Negate a vector.
     * @public
     * @function
     */
    _V.vecFlip=function(v){ return this.vecMul(v, -1) };
    /**
     * @public
     * @function
     */
    _V.vecFlipSelf=function(v){ return this.vecMulSelf(v, -1) };
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
    _V.vecNormal=function(v,s){
      _assertArgs(v,v);
      //origin = (0,0) => x1=0,y1=0, x2= vx, y2=vy
      let x1=0;
      let y1=0;
      let dy;
      let dx;
      if(UseOBJ){
        dy= v.y - y1;
        dx= v.x - x1;
      }else{
        dy= v[1] - y1;
        dx= v[0] - x1;
      }
      return s ? _take(-dy, dx) : _take(dy, -dx)
    };
    /**
     * @public
     * @function
     */
    _V.translate=function(pos,...args){
      let a=false;
      if(args.length===1 && is.vec(args[0])){
        args=args[0];
        a=true;
      }
      return args.length===1 && !a ? this.V2(pos[0]+args[0][0],pos[1]+args[0][1])
                                   : args.map(p => this.V2(pos[0]+p[0],pos[1]+p[1]))
    };

    return (_M.Vec2=_V)
  };

})(this);


