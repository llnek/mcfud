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
 * Copyright © 2025, Kenneth Leung. All rights reserved. */


;(function(UNDEF){

  "use strict";


  /**Create the module.
  */
  function _module(Core,V2,FSM,Crypt,Gfx,Geo,M,Mx,Spat,Q,Test,Basic){
    return {
      Core:Core,
      Vec2:V2,
      FSM:FSM,
      Crypt:Crypt,
      Gfx:Gfx,
      Geo2d:Geo,
      Math:M,
      Matrix:Mx,
      Spatial:Spat,
      QuadTree:Q,
      Test:Test,
      Basic:Basic
    }
  }

  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module=="object" && module.exports){
    module.exports=_module(require("./main/core.js"),
      require("./main/vec2.js"),
      require("./main/fsm.js"),
      require("./main/crypt.js"),
      require("./main/gfx.js"),
      require("./main/geo2d.js"),
      require("./main/math.js"),
      require("./main/matrix.js"),
      require("./main/spatial.js"),
      require("./main/quadtree.js"),
      require("./main/test.js"),
      require("./algo/basic.js")
    );
  }else{
  }

})(this);

