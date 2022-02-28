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
// Copyright © 2013-2022, Kenneth Leung. All rights reserved.

;(function(gscope,UNDEF){

  "use strict";

  const VISCHS=(" @N/\\Ri2}aP`(xeT4F3mt;8~%r0v:L5$+Z{'V)\"CKIc>z.*"+
                "fJEwSU7juYg<klO&1?[h9=n,yoQGsW]BMHpXb6A|D#q^_d!-").split("");
  const VISCHS_LEN=VISCHS.length;

  /**Create the module.
  */
  function _module(Core){

    if(!Core)
      Core= gscope["io/czlab/mcfud/core"]();
    const {u:_} = Core;

    /**
     * @module mcfud/crypt
     */

    /**Find the offset. */
    const _calcDelta=(shift)=> Math.abs(shift) % VISCHS_LEN;

    /**Get the char at the index. */
    const _charat=(i)=> VISCHS[i];

    /**Index for this char. */
    const _getch=(ch)=> VISCHS.findIndex(c=> c==ch);

    /**Rotate right. */
    function _rotr(delta, cpos){
      let pos= cpos+delta;
      return _charat(pos >= VISCHS_LEN ? (pos-VISCHS_LEN) : pos)
    }

    /**Rotate left. */
    function _rotl(delta, cpos){
      let pos= cpos-delta;
      return _charat(pos< 0 ? (VISCHS_LEN+pos) : pos)
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _ef=(shift,delta,cpos)=> shift<0 ? _rotr(delta,cpos) : _rotl(delta,cpos);
    const _df=(shift,delta,cpos)=> shift<0 ? _rotl(delta,cpos) : _rotr(delta,cpos);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      /**Encrypt source by shifts.
       * @memberof module:mcfud/crypt
       * @param {string} src
       * @param {number} shift
       * @return {string} encrypted text
       */
      encrypt(src, shift){
        if(shift!=0){
          let p,d=_calcDelta(shift);
          p= src.split("").map(c=>{
            p=_getch(c);
            return p<0?c:_ef(shift,d,p);
          });
          src=p.join("");
        }
        return src;
      },
      /**Decrypt text by shifts.
       * @memberof module:mcfud/crypt
       * @param {string} cipherText
       * @param {number} shift
       * @return {string} decrypted text
       */
      decrypt(cipherText,shift){
        if(shift!=0){
          let p,d= _calcDelta(shift);
          p=cipherText.split("").map(c=>{
            p= _getch(c);
            return p<0?c:_df(shift,d,p);
          });
          cipherText=p.join("");
        }
        return cipherText;
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/crypt"]=_module;
  }

})(this);

