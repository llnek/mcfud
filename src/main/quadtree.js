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
 * Copyright © 2021, Kenneth Leung. All rights reserved. */

;(function(global){
  "use strict";
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  global["io.czlab.mcfud.qtree"]=function(){
    if(_singleton){ return _singleton }
    class QuadTree{
      constructor(x1,y1,x2,y2,maxCount,maxDepth){
        this.maxCount= maxCount || 12;
        this.maxDepth= maxDepth || 5;
        this.objects = [];
        this.boxes=null;
        this.level=0;
        this.x1=x1;
        this.x2=x2;
        this.y1=y1;
        this.y2=y2;
        this.midX= (x1+x2)/2;
        this.midY= (y1+y2)/2;
      }
      _ctree(x1,y1,x2,y2){
        let q=new QuadTree(x1,y1,x2,y2,this.maxCount,this.maxDepth);
        q.level=this.level+1;
        return q;
      }
      _split(){
        _.assert(this.boxes===null);
        //3|0
        //---
        //2|1
        this.boxes=[this._ctree(this.midX, this.y1,this.x2,this.midY),
                    this._ctree(this.midX, this.midY, this.x2,this.y2),
                    this._ctree(this.x1, this.midY, this.midX, this.y2),
                    this._ctree( this.x1, this.y1, this.midX,this.midY)];
      }
      _locate(r){
        let up= r.y < this.midY;
        let left= r.x < this.midX;
        let right= r.x + r.width > this.midX;
        let down= r.y + r.height > this.midY;
        if(up){
          if(left) out.push(3);
          if(right) out.push(0);
        }
        if(down){
          if(left) out.push(2);
          if(right) out.push(1);
        }
        return out;
      }
      insert(node){
        let out;
        if(this.boxes){
          this._locate(node).forEach(i=>{
            this.boxes[i].insert(node)
          });
        }else{
          this.objects.push(node);
          if(this.objects.length > this.maxCount &&
             this.level < this.maxDepth){
            this._split();
            this.objects.forEach(o=>{
              this._locate(o).forEach(i=>{
                this.boxes[i].insert(o)
              });
            });
            this.objects.length=0;
          }
        }
      }
      search(node){
        //handle duplicates
        let bin=new Map();
        let out = [];
        if(this.boxes){
          this._locate(node).forEach(i=>{
            this.boxes[i].search(node).forEach(o=>{
              if(!bin.has(o)){
                bin.set(o,null);
                out.push(o);
              }
            })
          })
        }
        this.objects.forEach(o=>{
          if(!bin.has(o)){
            bin.set(o,null);
            out.push(o);
          }
        });
        //found all objects closeby
        return out;
      }
      reset(){
        this.objects.length=0;
        this.boxes && this.boxes.forEach(b=>{
          b.reset()
        });
        this.boxes=null;
      }
    }

    return _singleton={
      quadtree(region,maxcount,maxdepth){
        return new QuadTree(region.x1,region.y1,region.x2,region.y2,maxcount,maxdepth);
      }
    };

  };

})(this);


