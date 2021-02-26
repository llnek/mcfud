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
    const {u:_} = Core;

    /**
      * @module mcfud/quadtree
      */

    /**
     * @typedef {object} QuadTree
     * @property {function} insert(node)
     * @property {function} search(node)
     * @property {function} reset()
     */

    /**
     * @typedef {object} QuadTreeNode
     * @property {number} x
     * @property {number} y
     * @property {number} width
     * @property {number} height
     * @property {function} getNodeRect()
     */

    /**Creates a QuadTree. */
    function QuadTree(left,right,top,bottom,maxCount,maxDepth,level){
      let boxes=null,
          objects = [];
      //if flipped the co-ord system is LHS (like a browser, y grows down, objects are top-left+width_height)
      //else RHS (standard, y grows up, objects are left-bottom+width_height)
      let flipped=(top<bottom),
          midX= MFL((left+right)/2),
          midY= MFL((top+bottom)/2);
      //find which quadrants r touches
      function _locate(r){
        let x,y,width,height;
        //if(_.has(r,"x") && _.has(r,"y") && _.has(r,"width") && _.has(r,"height")){
        if(r.x !== undefined && r.y !== undefined && r.width !== undefined && r.height !== undefined){
          x=r.x; y=r.y; width=r.width; height=r.height;
        }else if(r.getNodeRect){
          let b=r.getNodeRect();
          x=b.x; y=b.y; width=b.width; height=b.height;
        }
        let out=[],
            left= x<midX,
            right= x+width>midX,
            up= flipped? (y<midY) : (y+height>midY),
            down= flipped? (y+height>midY): (y<midY);
        if(up){
          if(left) out.push(3);
          if(right) out.push(0); }
        if(down){
          if(left) out.push(2);
          if(right) out.push(1); }
        return out;
      }

      //split into 4 quadrants
      function _split(){
        //3|0
        //---
        //2|1
        _.assert(boxes===null);
        boxes=[QuadTree(midX, right,top,midY,maxCount,maxDepth,level+1),
               QuadTree(midX, right, midY, bottom,maxCount,maxDepth,level+1),
               QuadTree(left, midX, midY, bottom,maxCount,maxDepth,level+1),
               QuadTree(left, midX, top, midY,maxCount,maxDepth,level+1)];
      }

      return{
        dbg(f){ return f(objects,boxes,maxCount,maxDepth,level) },
        insert:function(node){
          for(let n=0;n<arguments.length;++n){
            node=arguments[n];
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
          }
        },
        reset(){
          objects.length=0;
          boxes && boxes.forEach(b=> b.reset());
          boxes=null;
        },
        search(node){
          //handle duplicates
          const bin=new Map();
          const out = [];
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
       * @param {object} region {left,right,top,bottom} the bounding region
       * @param {number} maxCount maximum number of objects in each tree
       * @param {number} maxDepth maximum depth of tree
       * @return {QuadTree}
       */
      quadtree(region,maxCount=12,maxDepth=5){
        const {left,right,top,bottom}=region;
        return QuadTree(left,right,top,bottom,maxCount,maxDepth,0)
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"));
  }else{
    gscope["io/czlab/mcfud/qtree"]=_module
  }

})(this);


