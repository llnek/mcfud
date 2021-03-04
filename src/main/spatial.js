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
 * Copyright © 2020-2021, Kenneth Leung. All rights reserved. */

;(function(gscope){

  "use strict";

  /**Creates the module.
   */
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    const MFL=Math.floor;
    const {u:_,is} = Core;

    /**
      * @module mcfud/spatial
      */

    /**
     * @typedef {object} SpatialGrid
     * @property {function} reset()
     * @property {function} degrid()
     * @property {function} engrid()
     * @property {function} search(node)
     * @property {function} searchAndExec(node,cb)
     */

    /**Creates a 2d spatial grid. */
    function SpatialGrid(cellW,cellH){
      const _grid= new Map();
      return{
        //get grid() {return _grid},
        searchAndExec(item,cb){
          let ret,
              g= item.getSpatial();
          for(let X,Y,y = g.y1; y <= g.y2; ++y){
            if(Y=_grid.get(y))
              for(let vs,r,x= g.x1; x <= g.x2; ++x)
                if(X=Y.get(x)){
                  vs=X.values();
                  r= vs.next();
                  while(!r.done){
                    if(ret=cb(item,r.value)){
                      x=y=Infinity;
                      break;
                    }
                    ret=null;
                    r= vs.next();
                  }
                }
          }
          return ret;
        },
        search(item){
          let out=[],
              g= item.getSpatial();
          for(let y = g.y1; y <= g.y2; ++y){
            if(Y=_grid.get(y))
              for(let x= g.x1; x <= g.x2; ++x)
                if(X=Y.get(x))
                  X.forEach(v=>out.push(v))
          }
          return out;
        },
        engrid(item,skipAdd){
          let g = item.getSpatial(),
              r = item.getBBox(),
              gridX1 = MFL(r.x1 / cellW),
              gridY1 = MFL(r.y1 / cellH),
              gridX2 = MFL(r.x2/cellW),
              gridY2 = MFL(r.y2/ cellH);

          if(g.x1 !== gridX1 || g.x2 !== gridX2 ||
             g.y1 !== gridY1 || g.y2 !== gridY2){
            this.degrid(item);
            g.x1= gridX1;
            g.x2= gridX2;
            g.y1= gridY1;
            g.y2= gridY2;
            if(!skipAdd) this._insert(item);
          }
          return item;
        },
        reset(){
          _grid.clear()
        },
        _insert(item){
          let g= item.getSpatial();
          if(is.num(g.x1)){
            for(let X,Y,y= g.y1; y <= g.y2; ++y){
              if(!_grid.has(y))
                _grid.set(y, new Map());
              Y=_grid.get(y);
              for(let x= g.x1; x <= g.x2; ++x){
                if(!Y.has(x))
                  Y.set(x, new Map());
                X=Y.get(x);
                _.assoc(X,item.getGuid(), item);
              }
            }
          }
        },
        degrid(item){
          let g= item.getSpatial();
          if(is.num(g.x1)){
            for(let X,Y,y= g.y1; y <= g.y2; ++y){
              if(Y=_grid.get(y))
                for(let x= g.x1; x<=g.x2; ++x)
                  if(X=Y.get(x))
                    _.dissoc(X,item.getGuid())
            }
          }
        }
      };
    }

    const _$={
      /**
       * @memberof module:mcfud/spatial
       * @param {number} cellWidth
       * @param {number} cellHeight
       * @return {SpatialGrid}
       */
      spatialGrid(cellWidth=320,cellHeight=320){
        return SpatialGrid(cellWidth,cellHeight)
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"));
  }else{
    gscope["io/czlab/mcfud/spatial"]=_module
  }

})(this);


