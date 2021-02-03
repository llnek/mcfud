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
 * Copyright © 2013-2021, Kenneth Leung. All rights reserved. */

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"use strict";

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
const Core=require("../main/core.js");
const V=require("../main/vec2.js");
const Test=require("../main/test.js");
const {u:_,is}=Core;
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function tearDown(){
  0&&console.log("tearDown called()") }
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.runtest(
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.deftest("Vec2").
  begin(env=>{ 0&&console.log("setup called()") }).
  ensure("pool;object",()=>{
    V._switchMode(true);
    let z=V._checkPoolSize();
    let a=V.vec();
    let z1=V._checkPoolSize();
    V.reclaim(a);
    let z2=V._checkPoolSize();
    return z1+1===z && z2===z && is.obj(a) && a.x===0 && a.y===0;
  }).
  ensure("pool;array",()=>{
    V._switchMode(false);
    let z=V._checkPoolSize();
    let a=V.vec();
    let z1=V._checkPoolSize();
    V.reclaim(a);
    let z2=V._checkPoolSize();
    return z1+1===z && z2===z && is.vec(a) && a.length===2;
  }).
  ensure("+",()=>{
    V._switchMode(false);
    let v=V.add(V.vec(3,0),V.vec(0,3));//3,3
    let v1=V.add(v,3);//6,6
    let v2=V.add(v,1,6);//4,9
    V.add$(v,3);//6,6
    V.add$(v,3,6);//9,12
    V.add$(v,V.vec(0,3));//9,15
    ///
    V._switchMode(true);
    let a=V.add(V.vec(3,0),V.vec(0,3));//3,3
    let a1=V.add(a,3);//6,6
    let a2=V.add(a,1,6);//4,9
    V.add$(a,3);//6,6
    V.add$(a,3,6);//9,12
    V.add$(a,V.vec(0,3));//9,15
    return v[0]===9 && v[1]===15 && v1[0]===6&&v1[1]===6 && v2[0]===4 &&v2[1]===9 &&
           a.x===9 && a.y===15 && a1.x===6&&a1.y===6 && a2.x===4 &&a2.y===9;
  }).
  ensure("-",()=>{
    V._switchMode(false);
    let v=V.sub(V.vec(3,3),V.vec(0,3));//3,0
    let v1=V.sub(v,3);//0,-3
    let v2=V.sub(v,1,6);//2,-6
    V.sub$(v,3);//0,-3
    V.sub$(v,3,6);//-3,-9
    V.sub$(v,V.vec(0,3));//-3,-12
    //
    V._switchMode(true);
    let a=V.sub(V.vec(3,3),V.vec(0,3));//3,0
    let a1=V.sub(a,3);//0,-3
    let a2=V.sub(a,1,6);//2,-6
    V.sub$(a,3);//0,-3
    V.sub$(a,3,6);//-3,-9
    V.sub$(a,V.vec(0,3));//-3,-12
    return v[0]===-3 && v[1]===-12 && v1[0]===0&&v1[1]===-3 && v2[0]===2 &&v2[1]===-6 &&
           a.x===-3 && a.y===-12 && a1.x===0&&a1.y===-3 && a2.x===2 &&a2.y===-6;
  }).
  ensure("*",()=>{
    V._switchMode(false);
    let v=V.mul(V.vec(1,2),V.vec(2,3));//2,6
    let v1=V.mul(v,3);//6,18
    let v2=V.mul(v,1,6);//2,36
    V.mul$(v,3);//6,18
    V.mul$(v,3,6);//18,108
    V.mul$(v,V.vec(1,2));//18,216
    //
    V._switchMode(true);
    let a=V.mul(V.vec(1,2),V.vec(2,3));//2,6
    let a1=V.mul(a,3);//6,18
    let a2=V.mul(a,1,6);//2,36
    V.mul$(a,3);//6,18
    V.mul$(a,3,6);//18,108
    V.mul$(a,V.vec(1,2));//18,216
    return v[0]===18 && v[1]===216 && v1[0]===6&&v1[1]===18 && v2[0]===2 &&v2[1]===36 &&
           a.x===18 && a.y===216 && a1.x===6&&a1.y===18 && a2.x===2 &&a2.y===36;
  }).
  ensure("/",()=>{
    V._switchMode(false);
    let v=V.div(V.vec(36,48),V.vec(2,3));//18,16
    let v1=V.div(v,2);//9,8
    let v2=V.div(v,1,4);//18,4
    V.div$(v,2);//9,8
    V.div$(v,3,2);//3,4
    V.div$(v,V.vec(1,1));//3,4
    //
    V._switchMode(true);
    let a=V.div(V.vec(36,48),V.vec(2,3));//18,16
    let a1=V.div(a,2);//9,8
    let a2=V.div(a,1,4);//18,4
    V.div$(a,2);//9,8
    V.div$(a,3,2);//3,4
    V.div$(a,V.vec(1,1));//3,4
    return v[0]===3 && v[1]===4 && v1[0]===9&&v1[1]===8 && v2[0]===18 &&v2[1]===4 &&
           a.x===3 && a.y===4 && a1.x===9&&a1.y===8 && a2.x===18 &&a2.y===4 ;
  }).
  ensure("dot",()=>{
    let ok1,ok2;
    V._switchMode(false);
    try{ V.dot(V.vec(2,4), [2,3,4]); return 0 }catch(e){
      try{ V.dot(V.vec(2,4), 0); return 0 }catch(e){
        ok1= 28===V.dot(V.vec(2,4),V.vec(4,5));
      }
    }
    V._switchMode(true);
    try{ V.dot(V.vec(2,4), {}); return 0 }catch(e){
      try{ V.dot(V.vec(2,4), 0); return 0 }catch(e){
        ok2= 28===V.dot(V.vec(2,4),V.vec(4,5));
      }
    }
    return ok1&&ok2;
  }).
  ensure("vecAB",()=>{
    let ok1,ok2;
    V._switchMode(false);
    try{ V.vecAB(V.vec(2,4), [2,3,4]); return 0 }catch(e){
      try{ V.vecAB(V.vec(2,4), 0); return 0 }catch(e){
        ok1=V.vecAB(V.vec(2,4),V.vec(4,5));
      }
    }
    V._switchMode(true);
    try{ V.vecAB(V.vec(2,4), {}); return 0 }catch(e){
      try{ V.vecAB(V.vec(2,4)); return 0 }catch(e){
        ok2=V.vecAB(V.vec(2,4),V.vec(4,5));
      }
    }
    return ok1[0]===ok2.x && ok1[1]===ok2.y && ok1[0]===2 && ok1[1]===1;
  }).
  ensure("len;len2",()=>{
    V._switchMode(false);
    let ok1= 5===V.len(V.vec(3,4)) && 25===V.len2(V.vec(3,4));
    V._switchMode(true);
    let ok2= 5===V.len(V.vec(3,4)) && 25===V.len2(V.vec(3,4));
    return ok1&&ok2;
  }).
  ensure("dist;dist2",()=>{
    V._switchMode(false);
    let ok1= 5===V.dist(V.vec(4,0),V.vec(0,3)) && 25===V.dist2(V.vec(4,0),V.vec(0,3));
    V._switchMode(true);
    let ok2= 5===V.dist(V.vec(4,0),V.vec(0,3)) && 25===V.dist2(V.vec(4,0),V.vec(0,3));
    return ok1&&ok2;
  }).
  ensure("unit",()=>{
    V._switchMode(false);
    let v= V.vec(4,3);
    let w=V.unit(v);
    V.unit$(v);
    let ok1= w[0]===4/5 && w[1]===3/5 && w[0]===v[0] && w[1]===v[1];
    V._switchMode(true);
    v= V.vec(4,3);
    w=V.unit(v);
    V.unit$(v);
    let ok2= w.x===4/5 && w.y===3/5 && w.x===v.x && w.y===v.y;
    return ok1&&ok2;
  }).
  ensure("set;copy",()=>{
    V._switchMode(false);
    let v=V.vec(1,2);
    let w=V.vec(3,4);
    V.copy(v,20,10);
    V.set(w, V.vec(10,20));
    let ok1= v[0]===20&&v[1]===10 && w[0]===10 && w[1]===20;
    V._switchMode(true);
    v=V.vec(1,2);
    w=V.vec(3,4);
    V.copy(v,20,10);
    V.set(w, V.vec(10,20));
    let ok2= v.x===20&&v.y===10 && w.x===10 && w.y===20;
    return ok1&&ok2;
  }).
  ensure("clone",()=>{
    V._switchMode(false);
    let v=V.clone(V.vec(3,4));
    V._switchMode(true);
    let w=V.clone(V.vec(3,4));
    return v[0]===3&&v[1]===4&&w.x===3&&w.y===4;
  }).
  ensure("rot",()=>{
    V._switchMode(false);
    let v=V.vec(4,0);
    let v1=V.rot(v,Math.PI/2);
    V.rot$(v,Math.PI/2);
    let ok1= _.feq0(v[0])&&v[1]===4 && _.feq0(v1[0])&&v1[1]===4;
    V._switchMode(true);
    v=V.vec(4,0);
    v1=V.rot(v,Math.PI/2);
    V.rot$(v,Math.PI/2);
    let ok2= _.feq0(v.x)&&v.y===4 && _.feq0(v1.x)&&v1.y===4;
    return ok1&&ok2;
  }).
  ensure("cross",()=>{
    V._switchMode(false);
    let v=V.vec(3,4);
    let w=V.vec(4,3);
    let ok1= V.cross(v,w)===-7 && V.cross(v,2)[0]===8 && V.cross(v,2)[1]===-6 &&
             V.cross(2,w)[0]===-6 && V.cross(2,w)[1]===8;
    V._switchMode(true);
    v=V.vec(3,4);
    w=V.vec(4,3);
    let ok2= V.cross(v,w)===-7 && V.cross(v,2).x===8 && V.cross(v,2).y===-6 &&
             V.cross(2,w).x===-6 && V.cross(2,w).y===8;
    return ok1&&ok2;
  }).
  ensure("angle",()=>{
    V._switchMode(false);
    let ok1= _.feq(Math.PI,V.angle(V.vec(4,0), V.vec(-4,0)));
    V._switchMode(true);
    let ok2= _.feq(Math.PI/2,V.angle(V.vec(4,0), V.vec(0,-4)));
    return ok1&&ok2;
  }).
  ensure("normal",()=>{
    V._switchMode(false);
    let v=V.vec(4,3);
    let w=V.normal(v);
    V.normal$(v);
    let ok1= w[0]===3&&w[1]===-4 &&v[0]===3&&v[1]===-4;
    V._switchMode(true);
    v=V.vec(4,3);
    w=V.normal(v);
    V.normal$(v);
    let ok2= w.x===3&&w.y===-4 &&v.x===3&&v.y===-4;
    return ok1&&ok2;
  }).
  ensure("normal;ccw",()=>{
    V._switchMode(false);
    let v=V.vec(4,3);
    let w=V.normal(v,true);
    V.normal$(v,true);
    let ok1= w[0]===-3&&w[1]===4 &&v[0]===-3&&v[1]===4;
    V._switchMode(true);
    v=V.vec(4,3);
    w=V.normal(v,true);
    V.normal$(v,true);
    let ok2= w.x===-3&&w.y===4 &&v.x===-3&&v.y===4;
    return ok1&&ok2;
  }).
  ensure("proj_scalar",()=>{
    V._switchMode(false);
    let v=V.vec(4,3);
    let w=V.vec(8,0);
    let ok1= V.proj_scalar(v,w);
    V._switchMode(true);
    v=V.vec(4,3);
    w=V.vec(8,0);
    let ok2= V.proj_scalar(v,w);
    return ok1===ok2 && ok2===4;
  }).
  ensure("proj",()=>{
    V._switchMode(false);
    let v=V.vec(4,3);
    let w=V.vec(8,0);
    let ok1= V.proj(v,w);
    V._switchMode(true);
    v=V.vec(4,3);
    w=V.vec(8,0);
    let ok2= V.proj(v,w);
    return ok1[0]===4 && ok1[1]===0 && ok2.x===4 && ok2.y===0;
  }).
  ensure("perp",()=>{
    V._switchMode(false);
    let v=V.vec(4,3);
    let w=V.vec(8,0);
    let ok1= V.perp(v,w);
    V._switchMode(true);
    v=V.vec(4,3);
    w=V.vec(8,0);
    let ok2= V.perp(v,w);
    return ok1[0]===0&&ok1[1]===3 && ok2.x===0&&ok2.y===3;
  }).
  ensure("reflect",()=>{
    V._switchMode(false);
    let n=V.unit(V.vec(0,4));
    let d=V.vec(-4,-3);
    let r1=V.reflect(d,n);
    V._switchMode(true);
    n=V.unit(V.vec(0,4));
    d=V.vec(-4,-3);
    let r2=V.reflect(d,n);
    return r1[0]===-4&&r1[1]===3 && r2.x===-4&&r2.y===3;
  }).
  ensure("flip",()=>{
    V._switchMode(false);
    let v=V.vec(4,3);
    let w= V.flip(v);
    V.flip$(v);
    let ok1= v[0]===-4&&v[1]===-3 && w[0]===-4&&w[1]===-3;
    V._switchMode(true);
    v=V.vec(4,3);
    w= V.flip(v);
    V.flip$(v);
    let ok2= v.x===-4&&v.y===-3 && w.x===-4&&w.y===-3;
    return ok1&&ok2;
  }).
  ensure("translate",()=>{
    V._switchMode(false);
    let pos=V.vec(1,1);
    let v= V.translate(pos,V.vec(3,4),V.vec(-4,-3));
    V._switchMode(true);
    pos=V.vec(1,1);
    let w= V.translate(pos,V.vec(3,4),V.vec(-4,-3));
    return v.length===2&&w.length===2 &&
           v[0][0]===4&&v[0][1]===5&&
           v[1][0]===-3&&v[1][1]===-2&&
           w[0].x===4&&w[0].y===5&&
           w[1].x===-3&&w[1].y===-2;
  }).end(tearDown)).then(function(r){
  Test.prn(r);
  });

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//EOF


