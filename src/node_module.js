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


;(function(gscope, UNDEF){

  "use strict";

  /**Create the module.
  */
  function _moduleNode(Core,V2,FSM,Crypt,Gfx,Geo,M,Mx,Spat,Q,Test,Basic){
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

  function _module(){
    return {
      Core: gscope["io/czlab/mcfud/core"](),
      Vec2: gscope["io/czlab/mcfud/vec2"](),
      FSM: gscope["io/czlab/mcfud/fsm"](),
      Crypt:  gscope["io/czlab/mcfud/crypt"](),
      Gfx: gscope["io/czlab/mcfud/gfx"](),
      Geo2d: gscope["io/czlab/mcfud/geo2d"](),
      Math: gscope["io/czlab/mcfud/math"](),
      Matrix: gscope["io/czlab/mcfud/matrix"](),
      Spatial: gscope["io/czlab/mcfud/spatial"](),
      QuadTree: gscope["io/czlab/mcfud/qtree"](),
      //Test: gscope["io/czlab/mcfud/test"](),
      Basic: gscope["io/czlab/mcfud/algo/basic"]()
    }
  }

  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module=="object" && module.exports){
    module.exports=_moduleNode(require("./main/core.js"),
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
    gscope["io/czlab/mcfud"]=_module;
  }

})(this);

