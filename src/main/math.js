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

  /**Create the module.
   */
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    //const EPSILON= 0.0000000001;
    const NEG_DEG_2PI= -360;
    const DEG_2PI= 360;
    const TWO_PI= 2*Math.PI;
    const PI= Math.PI;
    const {is,u:_}= Core;

    /**
     * @module mcfud/math
     */

    /** @ignore */
    function _mod_deg(deg){
      return deg<0 ? -(-deg%DEG_2PI) : deg%DEG_2PI }

    const _$={
      /**Liner interpolation.
       * @memberof module:mcfud/math
       * @param {number} startv
       * @param {number} endv
       * @param {number} t
       * @return {number}
       */
      lerp(startv, endv, t){
        return (1-t) * startv + t * endv
      },
      /**The modulo operator.
       * @memberof module:mcfud/math
       * @param {number} x
       * @param {number} N
       * @return {number}
       */
      xmod(x,N){
        return x<0 ? x-(-(N + N*Math.floor(-x/N))) : x%N
      },
      /**Limit the value to within these 2 numbers.
       * @memberof module:mcfud/math
       * @param {number} min
       * @param {number} max
       * @param {number} v a value
       * @return {number}
       */
      clamp(min,max,v){
        return v<min ? min : (v>max ? max : v)
      },
      /**Square a number.
       * @memberof module:mcfud/math
       * @param {number} a
       * @return {number} q^2
       */
      sqr(a){ return a*a },
      /**Check if 2 numbers are approximately the same.
       * @memberof module:mcfud/math
       * @param {number} a
       * @param {number} b
       * @return {boolean}
       */
      fuzzyEq(a,b){ return _.feq(a,b) },
      /**Check if the number is approximately zero.
       * @memberof module:mcfud/math
       * @param {number} n
       * @return {boolean}
       */
      fuzzyZero(n){ return _.feq0(n) },
      /**Convert radians to degrees.
       * @memberof module:mcfud/math
       * @param {number} r
       * @return {number} degrees
       */
      radToDeg(r){ return _mod_deg(DEG_2PI * r/TWO_PI) },
      /**Convert degrees to radians.
       * @memberof module:mcfud/math
       * @param {number} d
       * @return {number} radians
       */
      degToRad(d){ return TWO_PI * _mod_deg(d)/DEG_2PI },
      /**Hypotenuse squared.
       * @memberof module:mcfud/math
       * @param {number} x
       * @param {number} y
       * @return {number}
       */
      pythag2(x,y){ return x*x + y*y },
      /**Hypotenuse.
       * @memberof module:mcfud/math
       * @param {number} x
       * @param {number} y
       * @return {number}
       */
      pythag(x,y){ return Math.sqrt(x*x + y*y) },
      /** @ignore */
      wrap(i,len){ return (i+1) % len },
      /**Is it more a or b?
       * @ignore
       */
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


