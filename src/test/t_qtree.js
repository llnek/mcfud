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
 * Copyright © 2013-2022, Kenneth Leung. All rights reserved. */

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"use strict";

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
const Core=require("../main/core.js");
const Q=require("../main/quadtree.js");
const Test=require("../main/test.js");
const {u:_,is}=Core;
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function tearDown(){
  0&&console.log("tearDown called()") }
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function Node(msg,x1,y1,w,h){
  return {data: msg,x:x1,y:y1,width:w,height:h}
}
function dbgShow(objects,boxes,C,D,level){
  let s=`level#${level}\n`,
      objs= objects.map(o=> `${o.data}:(${o.x},${o.y})`).join("\n");
  s += objs;
  if(boxes){
    s += "Quads\n";
    boxes.forEach((b,i)=>{
      s+= `Q${i}{\n` + b.dbg(dbgShow) + "}\n"
    });
  }
  return s;
}
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.runtest(
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.deftest("QuadTree").
  begin().
  ensure("quadtree;lhs",()=>{
    let q= Q.quadtree({left:0,right:480,bottom:640,top:0},2,2);
    let a=Node("a",460,100,20,20);
    let b=Node("b",460,600,20,20);
    let c=Node("c",100,500,20,20);
    let d=Node("d",100,100,20,20);
    let e=Node("e",30,260,100,100);
    let f= Node("f",230,300,100,100);
    let ok1,ok2,ok3,ok4,ok5,ok6,ok7,out;
    q.insert(a,b,c,d);

    out=q.search(a);
    ok1= out.length===1 && out[0]===a;
    out=q.search(b);
    ok2= out.length===1 && out[0]===b;
    out=q.search(c);
    ok3= out.length===1 && out[0]===c;
    out=q.search(d);
    ok4= out.length===1 && out[0]===d;

    q.insert(e);
    out=q.search(e);
    ok5= out.length===3 && out.map(o=>o.data).sort().join("")=="cde";

    q.insert(f);
    out=q.search(e);
    ok6= out.length===2 && out.map(o=>o.data).sort().join("")=="ef";

    out=q.search(f);
    ok7= out.length===4 && out.map(o=>o.data).sort().join("")=="abef";

    return ok1 && ok2 && ok3 && ok4 && ok5 && ok6 && ok7;
  }).
  ensure("quadtree;rhs",()=>{
    let q= Q.quadtree({left:0,right:480,bottom:0,top:640},2,2);
    let a=Node("a",460,600,20,20);
    let b=Node("b",460,100,20,20);
    let c=Node("c",100,100,20,20);
    let d=Node("d",100,500,20,20);
    let e=Node("e",30,260,100,100);
    let f= Node("f",230,300,100,100);
    let ok1,ok2,ok3,ok4,ok5,ok6,ok7,out;
    q.insert(a,b,c,d);

    out=q.search(a);
    ok1= out.length===1 && out[0]===a;
    out=q.search(b);
    ok2= out.length===1 && out[0]===b;
    out=q.search(c);
    ok3= out.length===1 && out[0]===c;
    out=q.search(d);
    ok4= out.length===1 && out[0]===d;

    q.insert(e);
    out=q.search(e);
    ok5= out.length===3 && out.map(o=>o.data).sort().join("")=="cde";

    q.insert(f);
    out=q.search(e);
    ok6= out.length===2 && out.map(o=>o.data).sort().join("")=="ef";

    out=q.search(f);
    ok7= out.length===4 && out.map(o=>o.data).sort().join("")=="abef";

    return ok1 && ok2 && ok3 && ok4 && ok5 && ok6 && ok7;
  }).end(tearDown)).then(function(r){
  Test.prn(r);
  });

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//EOF


