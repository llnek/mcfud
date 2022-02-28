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
const G=require("../main/geo2d.js");
const Test=require("../main/test.js");
const {u:_,is}=Core;
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function _arrayEq(a1,a2){
  if(a1.length !== a2.length){return false}
  //2 numeric arrays are equal?
  for(let i=0;i<a1.length;++i){
    if(!_.feq(a1[i],a2[i]))
      return false;
  }
  return true
}
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function tearDown(){
  0&&console.log("tearDown called()") }
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.runtest(
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.deftest("Geo2d").
  begin().
  ensure("orderVertices",()=>{
    let w= G.orderVertices([[15,20],[10,10],[20,10]]);
    let z=G.orderVertices([[2,20],[30,10],[50,12],[20,30],[5,15]]);
    return w.flat().join("")=="201015201010" &&
           z.flat().join("")=="501220302205153010";
  }).
  ensure("polyArea",()=>{
    return 50===G.polyArea([[20,10],[15,20],[10,10]]) &&
           100===G.polyArea([[20,10],[20,20],[10,20],[10,10]])
  }).
  ensure("calcPolygonCenter",()=>{
    let p=G.calcPolygonCenter([[20,10],[15,20],[10,10]]);
    let q=G.calcPolygonCenter([[20,10],[20,20],[10,20],[10,10]]);
    return p.join("")=="1513" && q.join("")=="1515";
  }).
  ensure("getAABB",()=>{
    let r= G.getAABB(G.bodyWrap(new G.Circle(10),100,200));
    let w=G.getAABB(G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10],[15,0]]),100,200));
    return r.pos.join("")+r.width+r.height=="901902020" &&
           w.pos.join("")+w.width+w.height=="1102001020";
  }).
  ensure("shiftPoints",()=>{
    let w=G.shiftPoints([[20,10],[15,20],[10,10]], [4,5]);
    let z=G.shiftPoints([[20,20],[15,20],[10,10]], 6);
    return w.flat().join("")=="241519251415" &&
           z.flat().join("")=="262621261616";
  }).
  ensure("rotPoints",()=>{
    let r=G.rotPoints([[20,0],[20,20],[0,0]],Math.PI/2)
    return _arrayEq(r.flat(),[0,20,-20,20,0,0]);
  }).
  ensure("calcRectPoints",()=>{
    let p=G.calcRectPoints(20,40);
    return _arrayEq(p.flat(),[10,-20,10,20,-10,20,-10,-20]);
  }).
  ensure("line",()=>{
    let n=G.line(10,10,50,60);
    return n.p.join("")=="1010" && n.q.join("")=="5060";
  }).
  ensure("rectEqRect",()=>{
    let r;
    return G.rectEqRect(r=new G.Rect(10,20,30,40), r) &&
           !G.rectEqRect(new G.Rect(10,20,30,40), new G.Rect(10,11,30,40));
  }).
  ensure("rectContainsRect",()=>{
    return G.rectContainsRect(new G.Rect(0,0,100,100), new G.Rect(10,10,10,10)) &&
           !G.rectContainsRect(new G.Rect(10,10,10,10), new G.Rect(50,50,10,10));
  }).
  ensure("rectGetMaxX",()=>{
    return G.rectGetMaxX(new G.Rect(10,10,20,30))===30;
  }).
  ensure("rectGetMidX",()=>{
    return G.rectGetMidX(new G.Rect(10,10,20,30))===20;
  }).
  ensure("rectGetMinX",()=>{
    return G.rectGetMinX(new G.Rect(10,10,20,30))===10;
  }).
  ensure("rectGetMaxY",()=>{
    return G.rectGetMaxY(new G.Rect(10,10,20,30))===40;
  }).
  ensure("rectGetMidY",()=>{
    return G.rectGetMidY(new G.Rect(10,10,20,30))===25;
  }).
  ensure("rectGetMinY",()=>{
    return G.rectGetMinY(new G.Rect(10,10,20,30))===10;
  }).
  ensure("rectContainsPoint",()=>{
    return G.rectContainsPoint(new G.Rect(10,10,20,30),12,20) &&
           !G.rectContainsPoint(new G.Rect(10,10,20,30),5,4);
  }).
  ensure("rectOverlayRect",()=>{
    return G.rectOverlayRect(new G.Rect(0,0,100,100),new G.Rect(50,50,100,100)) &&
           !G.rectOverlayRect(new G.Rect(0,0,10,10),new G.Rect(50,50,100,100));
  }).
  ensure("rectUnion",()=>{
    let r= G.rectUnion(new G.Rect(0,0,10,10), new G.Rect(15,15,10,20));
    return r.pos.join("")+r.width+r.height=="002535";
  }).
  ensure("rectIntersection",()=>{
    let r= G.rectIntersection(new G.Rect(0,0,20,20), new G.Rect(15,15,10,20));
    let z= G.rectIntersection(new G.Rect(0,0,10,10), new G.Rect(15,15,10,20));
    return r.pos.join("")+r.width+r.height=="151555" && !z;
  }).
  ensure("hitTestPointCircle",()=>{
    return G.hitTestPointCircle(6,6, G.bodyWrap(new G.Circle(10),5,5)) &&
           !G.hitTestPointCircle(0,0, G.bodyWrap(new G.Circle(2),5,5));
  }).
  ensure("hitTestPointPolygon",()=>{
    let p=G.bodyWrap(new G.Polygon([[20,0],[15,10],[10,0]]),10,10);
    return G.hitTestPointPolygon(25,12,p) &&
           !G.hitTestPointPolygon(1,3,p);
  }).
  ensure("hitTestCircleCircle",()=>{
    return G.hitCircleCircle(G.bodyWrap(new G.Circle(5),10,10), G.bodyWrap(new G.Circle(4),12,12)) &&
           !G.hitCircleCircle(G.bodyWrap(new G.Circle(5),10,10), G.bodyWrap(new G.Circle(4),20,20));
  }).
  ensure("hitCircleCircle",()=>{
    let a=G.bodyWrap(new G.Circle(5),10,10);
    let b=G.bodyWrap(new G.Circle(4),12,12);
    let m= G.hitCircleCircle(a,b);
    let ok1,ok2,ok3;
    if(m){
      ok1= m.A===a && m.B===b &&
           _arrayEq(m.overlapN, [0.7071067811865475, 0.7071067811865475 ]) &&
           _arrayEq(m.overlapV, [4.363961030678928, 4.363961030678928 ]) &&
           _.feq(m.overlap, 6.17157287525381);
    }
    a=G.bodyWrap(new G.Circle(2),14,14);
    b=G.bodyWrap(new G.Circle(6),12,12);
    m= G.hitCircleCircle(a,b);
    if(m){
      ok2= _arrayEq(m.overlapN, [ -0.7071067811865475, -0.7071067811865475 ]) &&
           _arrayEq(m.overlapV, [ -3.65685424949238, -3.65685424949238 ]) &&
           _.feq(m.overlap, 5.17157287525381) && m.AInB && !m.BInA;
    }
    a=G.bodyWrap(new G.Circle(6),12,12);
    b=G.bodyWrap(new G.Circle(2),14,14);
    m= G.hitCircleCircle(a,b);
    if(m){
      ok3= _arrayEq(m.overlapN, [ 0.7071067811865475, 0.7071067811865475 ]) &&
           _arrayEq(m.overlapV, [ 3.65685424949238, 3.65685424949238 ]) &&
           _.feq(m.overlap, 5.17157287525381) && !m.AInB && m.BInA;
    }
    return ok1 && ok2 && ok3 &&
      !G.hitCircleCircle(G.bodyWrap(new G.Circle(5),10,10), G.bodyWrap(new G.Circle(4),20,20));
  }).
  ensure("hitTestPolygonCircle",()=>{
    return G.hitTestPolygonCircle(G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10),
                                  G.bodyWrap(new G.Circle(5),32,24)) &&
           !G.hitPolygonCircle(G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10),
                               G.bodyWrap(new G.Circle(2),45,24));
  }).
  ensure("hitPolygonCircle",()=>{
    let p=G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10);
    let c=G.bodyWrap(new G.Circle(5),32,24);
    let m=G.hitPolygonCircle(p,c);
    let ok1,ok2,ok3;
    if(m){
      ok1= _arrayEq(m.overlapN, [ 0.8944271909999159, 0.4472135954999579 ]) &&
           _arrayEq(m.overlapV, [ 1.2721359549995794, 0.6360679774997897 ]) &&
           p===m.A && c === m.B && _.feq(m.overlap, 1.4222912360003366);
    }
    p=G.bodyWrap(new G.Polygon([[20,0],[20,20],[0,20],[0,0]]),0,0);
    c=G.bodyWrap(new G.Circle(2),5,5);
    m=G.hitPolygonCircle(p,c);
    if(m){
      ok2= _arrayEq(m.overlapN, [ -1, 0 ]) &&
           _arrayEq(m.overlapV, [ -7, 0 ]) &&
           p===m.A && c===m.B && _.feq(m.overlap,7) && m.BInA;
    }
    p=G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10);
    c=G.bodyWrap(new G.Circle(50),24,28);
    m=G.hitPolygonCircle(p,c);
    if(m){
      ok3= _arrayEq(m.overlapN, [ -0.8944271909999159, 0.4472135954999579 ]) &&
           _arrayEq(m.overlapV, [ -44.721359549995796, 22.360679774997898 ]) &&
           p===m.A && c===m.B && _.feq(m.overlap,50) && m.AInB;
    }
    return ok1 && ok2 && ok3 &&
      !G.hitPolygonCircle(G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10),
                          G.bodyWrap(new G.Circle(2),45,24));
  }).
  ensure("hitCirclePolygon",()=>{
    let p=G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10);
    let c=G.bodyWrap(new G.Circle(5),32,24);
    let m=G.hitCirclePolygon(c,p);
    let ok1,ok2,ok3;
    if(m){
      ok1= _arrayEq(m.overlapN, [ -0.8944271909999159, -0.4472135954999579 ]) &&
           _arrayEq(m.overlapV, [ -1.2721359549995794, -0.6360679774997897 ]) &&
           m.A===c && m.B===p && _.feq(m.overlap, 1.4222912360003366);
    }
    p=G.bodyWrap(new G.Polygon([[20,0],[20,20],[0,20],[0,0]]),0,0);
    c=G.bodyWrap(new G.Circle(2),5,5);
    m=G.hitCirclePolygon(c,p);
    if(m){
      ok2= _arrayEq(m.overlapN, [ 1, 0 ]) &&
           _arrayEq(m.overlapV, [ 7, 0 ]) &&
           m.A===c && m.B===p && _.feq(m.overlap,7) && m.AInB;
    }
    p=G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10);
    c=G.bodyWrap(new G.Circle(50),24,28);
    m=G.hitCirclePolygon(c,p);
    if(m){
      ok3= _arrayEq(m.overlapN, [ 0.8944271909999159, -0.4472135954999579 ]) &&
           _arrayEq(m.overlapV, [ 44.721359549995796, -22.360679774997898 ]) &&
           m.A===c && m.B===p && _.feq(m.overlap,50) && m.BInA;
    }
    return ok1 && ok2 && ok3 &&
      !G.hitCirclePolygon(G.bodyWrap(new G.Circle(2),45,24),
                          G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10));
  }).
  ensure("hitTestCirclePolygon",()=>{
    return G.hitTestCirclePolygon(G.bodyWrap(new G.Circle(5),32,24),
                                  G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10)) &&
           !G.hitCirclePolygon(G.bodyWrap(new G.Circle(2),45,24),
                               G.bodyWrap(new G.Polygon([[20,10],[15,20],[10,10]]),10,10));
  }).
  ensure("hitPolygonPolygon",()=>{
    let a= G.bodyWrap(new G.Polygon([[20,0],[15,10],[0,0]]),10,10);
    let b= G.bodyWrap(new G.Polygon([[20,0],[20,20],[0,20],[0,0]]),5,5);
    let m= G.hitPolygonPolygon(a,b);
    let ok1,ok2,ok3;
    if(m){
      ok1= _arrayEq(m.overlapN, [ -0.5547001962252291, 0.8320502943378437 ]) &&
           _arrayEq(m.overlapV, [ -6.923076923076925, 10.384615384615387 ]) &&
           m.A===a && m.B===b && _.feq(m.overlap, 12.480754415067658);
    }
    a= G.bodyWrap(new G.Polygon([[20,0],[15,10],[0,0]]),10,10);
    b= G.bodyWrap(new G.Polygon([[100,0],[100,100],[0,100],[0,0]]),5,5);
    m= G.hitPolygonPolygon(a,b);
    if(m){
      ok2= _arrayEq(m.overlapN, [ 0, 1 ]) &&
           _arrayEq(m.overlapV, [ 0, 15 ]) &&
        m.A===a && m.B===b && _.feq(m.overlap,15) && m.AInB;
    }
    b= G.bodyWrap(new G.Polygon([[20,0],[15,10],[0,0]]),10,10);
    a= G.bodyWrap(new G.Polygon([[100,0],[100,100],[0,100],[0,0]]),5,5);
    m= G.hitPolygonPolygon(a,b);
    if(m){
      ok3= _arrayEq(m.overlapN, [ 0, -1 ]) &&
           _arrayEq(m.overlapV, [ 0, -15 ]) &&
           m.A===a && m.B===b && _.feq(m.overlap,15) && m.BInA;
    }

    return ok1 && ok2 && ok3 &&
      !G.hitPolygonPolygon(G.bodyWrap(new G.Polygon([[20,0],[15,10],[0,0]]),0,0),
                           G.bodyWrap(new G.Polygon([[20,0],[20,20],[0,20],[0,0]]),50,50));
  }).
  ensure("hitTestPolygonPolygon",()=>{
    return G.hitPolygonPolygon(G.bodyWrap(new G.Polygon([[20,0],[15,10],[0,0]]),10,10),
                               G.bodyWrap(new G.Polygon([[20,0],[20,20],[0,20],[0,0]]),5,5)) &&
           !G.hitPolygonPolygon(G.bodyWrap(new G.Polygon([[20,0],[15,10],[0,0]]),0,0),
                                G.bodyWrap(new G.Polygon([[20,0],[20,20],[0,20],[0,0]]),50,50));
  }).end(tearDown)).then(function(r){
  Test.prn(r);
  });

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//EOF


