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
// Copyright © 2025, Kenneth Leung. All rights reserved.

;(function(gscope,UNDEF){

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
    const int=Math.floor;
    const {is,u:_}= Core;

    /**
     * @module mcfud/math
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const PERLIN_YWRAPB = 4;
    const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
    const PERLIN_ZWRAPB = 8;
    const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
    const PERLIN_SIZE = 4095;
    let _perlinArr,
        perlin_octaves = 4, // default to medium smooth
        perlin_amp_falloff = 0.5; // 50% reduction/octave

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const scaled_cosine=(i)=> 0.5 * (1.0 - Math.cos(i * Math.PI));
    const _mod_deg=(deg)=> deg<0 ? -(-deg%DEG_2PI) : deg%DEG_2PI;

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
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
        return x<0 ? x-(-(N + N*int(-x/N))) : x%N
      },
      /**Divide this number as integer.
       * @memberof module:mcfud/math
       * @param {number} a
       * @param {number} b
       * @return {number} integer result
       */
      ndiv(a,b){
        return int(a/b)
      },
      /**Calc the base to the exponent power, as in base^exponent
       * @memberof module:mcfud/math
       * @param {number} a base
       * @param {number} n exponent
       * @return {number}
       */
      pow(a,n){
        if(n==0) return 1;
        if(n==1) return a;
        if(n==2) return a*a;
        if(n==3) return a*a*a;
        return Math.pow(a,n);
      },
      /**Find the closest power of 2 value for this number.
       * e.g. pow2(33)= 64
       * @memberof module:mcfud/math
       * @param {number} n
       * @return {number} power of 2 value
       */
      pow2(x){
        let a=2;
        while (x>a){ a *= 2 } return a;
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
        const biasRelative= 0.95,
              biasAbsolute= 0.01;
        return a >= (b*biasRelative + a*biasAbsolute)
      },
      /**Re-maps a number from one range to another.
       * @param {number} n  the incoming value to be converted
       * @param {number} start1 lower bound of the value's current range
       * @param {number} stop1  upper bound of the value's current range
       * @param {number} start2 lower bound of the value's target range
       * @param {number} stop2  upper bound of the value's target range
       * @param  {boolean} [withinBounds] constrain the value to the newly mapped range
       * @return {number}
       */
      remap(n, start1, stop1, start2, stop2, withinBounds){
        const v= (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
        return !withinBounds ? v : (start2 < stop2? this.clamp(start2, stop2, v) : this.clamp(stop2, start2,v));
      },
      /**Perlin noise in 1D.
       * from https://github.com/OneLoneCoder/videos/blob/master/OneLoneCoder_PerlinNoise.cpp
       * @param {number} nCount
       * @param {number[]} fSeed
       * @param {number} nOctaves
       * @param {number} fBias
       * @param {number[]} fOutput
       * @return {number[]} fOutput
       */
      perlin1D(nCount, fSeed, nOctaves, fBias, fOutput){
        let fNoise, fScaleAcc, fScale,
            nPitch, nSample1, nSample2, fBlend, fSample;
        for(let x=0; x<nCount; ++x){
          fNoise = 0; fScaleAcc = 0; fScale = 1;
          for(let o=0; o<nOctaves; ++o){
            nPitch = nCount >> o;
            nSample1 = int(x/nPitch) * nPitch;
            nSample2 = (nSample1 + nPitch) % nCount;
            fBlend = (x - nSample1) / nPitch;
            fSample = (1 - fBlend) * fSeed[int(nSample1)] + fBlend * fSeed[int(nSample2)];

            fScaleAcc += fScale;
            fNoise += fSample * fScale;
            fScale = fScale / fBias;
          }
          //scale to seed range
          fOutput[x] = fNoise / fScaleAcc;
        }
      },
      /**Perlin noise in 2D.
       * from https://github.com/OneLoneCoder/videos/blob/master/OneLoneCoder_PerlinNoise.cpp
       * @param {number} nWidth
       * @param {number} nHeight
       * @param {number[]} fSeed
       * @param {number} nOctaves
       * @param {number} fBias
       * @param {number[]} fOutput
       * @return {number[]} fOutput
       */
      perlin2D(nWidth, nHeight, fSeed, nOctaves, fBias, fOutput){
        let fNoise, fScaleAcc, fScale,
            fBlendX, fBlendY, fSampleT, fSampleB,
            nPitch, nSampleX1, nSampleY1, nSampleX2, nSampleY2;
        for(let x=0; x<nWidth; ++x)
          for(let y=0; y<nHeight; ++y){
            fNoise = 0; fScaleAcc = 0; fScale = 1;
            for(let o=0; o<nOctaves; ++o){
              nPitch = nWidth >> o;
              nSampleX1 = int(x / nPitch) * nPitch;
              nSampleY1 = int(y / nPitch) * nPitch;
              nSampleX2 = (nSampleX1 + nPitch) % nWidth;
              nSampleY2 = (nSampleY1 + nPitch) % nHeight;
              fBlendX = (x - nSampleX1) / nPitch;
              fBlendY = (y - nSampleY1) / nPitch;
              fSampleT = (1 - fBlendX) * fSeed[int(nSampleY1 * nWidth + nSampleX1)] + fBlendX * fSeed[int(nSampleY1 * nWidth + nSampleX2)];
              fSampleB = (1 - fBlendX) * fSeed[int(nSampleY2 * nWidth + nSampleX1)] + fBlendX * fSeed[int(nSampleY2 * nWidth + nSampleX2)];

              fScaleAcc += fScale;
              fNoise += (fBlendY * (fSampleB - fSampleT) + fSampleT) * fScale;
              fScale = fScale / fBias;
            }
            //scale to seed range
            fOutput[y * nWidth + x] = fNoise / fScaleAcc;
          }
      }

    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/math"]=_module
  }

})(this);


