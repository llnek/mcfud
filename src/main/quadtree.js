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
 * Copyright © 2020-2022, Kenneth Leung. All rights reserved. */

;(function(gscope,UNDEF){

  "use strict";

  /**Creates the module.
   */
  function _module(Core,_M){

    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!_M) _M= gscope["io/czlab/mcfud/math"]();
    const int=Math.floor;
    const {u:_} = Core;

    /**
      * @module mcfud/quadtree
      */

    /**
     * @typedef {object} QuadTree
     * @property {function} insert(node)
     * @property {function} search(node)
     * @property {function} remove(node)
     * @property {function} reset()
     * @property {function} prune()
     * @property {function} searchAndExec(node,cb)
     */

    /**
     * @typedef {object} QuadTreeNode
     * @property {number} x
     * @property {number} y
     * @property {number} width
     * @property {number} height
     * @property {function} getBBox()
     */

    /**Creates a QuadTree. */
    function QuadTree(X1,X2,Y1,Y2,maxCount,maxDepth,level){
      let boxes=null,
          objects = [];
      let midX= _M.ndiv(X1+X2,2),
          midY= _M.ndiv(Y1+Y2,2);

      //find which quadrants r touches
      function _locate(r){
        function _loc({x1,x2,y1,y2}){
          let out=[],
              left= x1<midX,
              right= x2>midX;
          if(y1<midY){
            if(left) out.push(3);
            if(right) out.push(0);
          }
          if(y2>midY){
            if(left) out.push(2);
            if(right) out.push(1);
          }
          return out;
        }
        /////
        if(r.getBBox){
          return _loc(r.getBBox())
        }else{
          _.assert(r.x1 !== undefined && r.y1 !== undefined &&
                   r.x2 !== undefined && r.y2 !== undefined,"wanted bbox for quadtree");
          return _loc(r)
        }
      }

      //split into 4 quadrants
      function _split(){
        //flipit
        //3|0
        //---
        //2|1
        _.assert(boxes===null);
        boxes=[QuadTree(midX, X2, Y1,midY,     maxCount,maxDepth,level+1),
               QuadTree(midX, X2, midY, Y2, maxCount,maxDepth,level+1),
               QuadTree(X1, midX, midY, Y2, maxCount,maxDepth,level+1),
               QuadTree(X1, midX, Y1, midY,    maxCount,maxDepth,level+1)];
      }

      const bbox={x1:X1,x2:X2,y1:Y1,y2:Y2};
      return{
        boundingBox(){ return bbox },
        subTrees(){return boxes},
        dbg(f){ return f(objects,boxes,maxCount,maxDepth,level) },
        insert(...nodes){
          nodes.forEach(node=>{
            if(boxes){
              _locate(node).forEach(i=> boxes[i].insert(node))
            }else{
              objects.push(node);
              if(objects.length > maxCount && level < maxDepth){
                _split();
                objects.forEach(o=> _locate(o).forEach(i=> boxes[i].insert(o)));
                objects.length=0;
              }
            }
          })
        },
        remove(node){
          if(boxes){
            boxes.forEach(b=>b.remove(node))
          }else{
            _.disj(objects,node)
          }
        },
        isLeaf(){
          return boxes===null ? -1 : objects.length
        },
        prune(){
          if(boxes){
            let sum=0,
                total=0;
            for(let b,i=0;i<boxes.length;++i){
              b=boxes[i];
              b.prune();
              n=b.isLeaf();
              if(n>=0){
                ++sum;
                total+=n;
              }
            }
            if(sum==boxes.length){//4
              //subtrees are leaves and total count is small
              //enough so pull them up into this node
              if(total<maxCount){
                _.assert(objects.length==0, "quadtree wanted zero items");
                boxes.forEach(b=>b._swap(objects));
                boxes=null;
                //now this node is a leaf!
              }
            }
          }
        },
        _swap(out){
          objects.forEach(b=>out.push(b))
          objects.length=0;
        },
        reset(){
          objects.length=0;
          boxes && boxes.forEach(b=> b.reset());
          boxes=null;
        },
        searchAndExec(node,cb,skipSelf){
          let ret;
          if(boxes){
            let ns=_locate(node);
            for(let i=0;i<ns.length;++i){
              ret=boxes[ns[i]].searchAndExec(node,cb,skipSelf);
              if(ret){break;}
            }
          }else{
            for(let o,i=0;i<objects.length;++i){
              o=objects[i];
              if(skipSelf && o===node){continue}
              if(ret=cb(o,node)){ break }
            }
          }
          return ret;
        },
        search(node,skipSelf){
          //handle duplicates
          const bin=new Map();
          const out = [];
          if(skipSelf){bin.set(node,null)}
          if(boxes){
            _locate(node).forEach(i=>{
              boxes[i].search(node).forEach(o=>{
                if(!bin.has(o)){
                  bin.set(o,null);
                  out.push(o);
                }
              })
            })
          }
          objects.forEach(o=>{
            if(!bin.has(o)){
              bin.set(o,null);
              out.push(o);
            }
          });
          //found all objects closeby
          bin.clear();
          return out;
        }
      };
    }

    const _$={
      /**
       * @memberof module:mcfud/quadtree
       * @param {object} region {x1,x2,y1,y2} the bounding region
       * @param {number} maxCount maximum number of objects in each tree
       * @param {number} maxDepth maximum depth of tree
       * @return {QuadTree}
       */
      quadtree(region,maxCount=12,maxDepth=5){
        const {x1,x2,y1,y2}=region;
        return QuadTree(x1,x2,y1,y2,maxCount,maxDepth,0)
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"),require("./math"));
  }else{
    gscope["io/czlab/mcfud/qtree"]=_module
  }

})(this);


