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
    const EPSILON= 0.0000000001;
    const NEG_DEG_2PI= -360;
    const DEG_2PI= 360;
    const TWO_PI= 2*Math.PI;
    const PI= Math.PI;
    const {is,u:_}= Core;
    const _M={EPSILON:EPSILON};
    /**
     * @public
     * @function
     */
    _M.lerp=function(startv, endv, t){
      return (1 - t) * startv + t * endv
    };
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
      return v<min ? min : (v>max ? max : v)
    };
    /**
     * @function
     * @public
     */
    _M.sqr=function(a){ return a*a };
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
    /**
     * Hypotenuse squared.
     * @public
     * @function
     */
    _M.pythag2=function(x,y){ return x*x + y*y };
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

    return _M;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/math"]=_module
  }

})(this);


