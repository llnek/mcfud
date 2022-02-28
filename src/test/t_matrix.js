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
const M=require("../main/matrix.js");
const Test=require("../main/test.js");
const {u:_,is}=Core;
const PIE=Math.PI;
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
Test.deftest("Math").
  begin(env=>{ 0&&console.log("setup called()") }).
  ensure("v3",()=>{
    return M.v3(1,2,3).join("")=="123"
  }).
  ensure("dot",()=>{
    return M.dot(M.v3(2,3,4),M.v3(4,5,6))===47
  }).
  ensure("cross",()=>{
    return M.cross(M.v3(2,3,4),M.v3(4,3,5)).join("")=="36-6"
  }).
  ensure("len;len2",()=>{
    let n;
    return (n=M.len2(M.v3(3,4,5)))===50 && _.feq(M.len(M.v3(3,4,5)),Math.sqrt(50))
  }).
  ensure("unit",()=>{
    let u=M.unit(M.v3(3,4,5));
    return _.feq(u[0], 0.4242640687119285) && _.feq(u[1], 0.565685424949238) && _.feq(u[2], 0.7071067811865475)
  }).
  ensure("add",()=>{
    return M.add(M.v3(3,4,5),M.v3(1,2,3)).join("")=="468" &&
           M.add(M.v3(3,4,5),3).join("")=="678";
  }).
  ensure("sub",()=>{
    return M.sub(M.v3(3,4,5),M.v3(1,2,3)).join("")=="222" &&
           M.sub(M.v3(3,4,5),2).join("")=="123";
  }).
  ensure("mul",()=>{
    return M.mul(M.v3(3,4,5),M.v3(1,2,3)).join("")=="3815" &&
           M.mul(M.v3(3,4,5),2).join("")=="6810";
  }).
  ensure("div",()=>{
    return M.div(M.v3(9,4,15),M.v3(3,2,3)).join("")=="325" &&
           M.div(M.v3(12,4,8),2).join("")=="624";
  }).
  ensure("matrix",()=>{
    let m=M.matrix([2,2]);
    let ok1=m.dim.join("")=="22" && m.cells.join("")=="0000"
    let w=M.matrix([2,2],1,2,3,4);
    let ok2=w.dim.join("")=="22" && w.cells.join("")=="1234"
    return ok1&&ok2;
  }).
  ensure("matIdentity",()=>{
    let m=M.matIdentity(3);
    return m.dim.join("")=="33" && m.cells.join("")=="100010001";
  }).
  ensure("matZero",()=>{
    let m=M.matZero(3);
    return m.dim.join("")=="33" && m.cells.join("")=="000000000";
  }).
  ensure("mat2",()=>{
    let m=M.mat2(1,2,3,4);
    return m.dim.join("")=="22" && m.cells.join("")=="1234";
  }).
  ensure("mat3",()=>{
    let m=M.mat3(1,2,3,4,5,6,7,8,9);
    return m.dim.join("")=="33" && m.cells.join("")=="123456789";
  }).
  ensure("mat4",()=>{
    let m=M.mat4(1,2,3,4,5,6,7,8,8,7,6,5,4,3,2,1);
    return m.dim.join("")=="44" && m.cells.join("")=="1234567887654321";
  }).
  ensure("matEq",()=>{
    return M.matEq(M.mat2(1,2,3,4),M.mat2(1,2,3,4)) &&
           !M.matEq(M.mat2(1,2,3,4),M.mat2(0,2,3,4)) &&
           !M.matEq(M.mat2(1,2,3,4),M.mat3(1,2,3,4,5,6,7,8,9));
  }).
  ensure("matXpose",()=>{
    let m=M.mat3(1,2,3,4,5,6,7,8,9);
    let w=M.matXpose(m);
    return w.dim.join("")=="33" && w.cells.join("")=="147258369";
  }).
  ensure("matScale",()=>{
    let m=M.mat3(1,2,3,4,1,6,7,8,1);
    let w=M.matScale(m,2);
    return w.dim.join("")=="33" && w.cells.join("")=="246821214162";
  }).
  ensure("matMult",()=>{
    let m=M.mat2(1,2,3,4);
    let n=M.mat2(4,3,2,1);
    let w=M.matMult(m,n);
    let ok1= w.dim.join("")=="22" && w.cells.join("")=="852013";
    n=M.matrix([2,1],6,3);
    w=M.matMult(m,n);
    let ok2= w.dim.join("")=="21" && w.cells.join("")=="1230";
    return ok1&&ok2;
  }).
  ensure("matCut",()=>{
    //123
    //456
    //789
    let m=M.mat3(1,2,3,4,5,6,7,8,9);
    return M.matCut(m,1,1).cells.join("")=="5689" &&
    M.matCut(m,1,2).cells.join("")=="4679" &&
    M.matCut(m,1,3).cells.join("")=="4578" &&
    M.matCut(m,2,1).cells.join("")=="2389" &&
    M.matCut(m,2,2).cells.join("")=="1379" &&
    M.matCut(m,2,3).cells.join("")=="1278" &&
    M.matCut(m,3,1).cells.join("")=="2356" &&
    M.matCut(m,3,2).cells.join("")=="1346" &&
    M.matCut(m,3,3).cells.join("")=="1245";
  }).
  ensure("matDet",()=>{
    //123
    //456
    //789
    return M.matDet(M.mat3(1,2,3,4,5,6,7,8,9))===0 &&
           M.matDet(M.mat3(1,2,3,14,5,6,7,8,9))===60 &&
           M.matDet(M.mat3(1,2,-13,14,5,6,7,38,-9))===-6398 ;
  }).
  ensure("matMinor",()=>{
    let m=M.mat3(1,2,3,4,6,2,7,8,9);
    return M.matMinor(m).cells.join("")=="3822-10-6-12-6-14-10-2"
  }).
  ensure("matCofactor",()=>{
    let m=M.mat3(1,2,3,4,6,2,7,8,9);
    let n=M.mat2(3,9,8,5);
    return M.matCofactor(m).cells.join("")=="38-22-106-126-1410-2" &&
           M.matCofactor(n).cells.join("")=="5-8-93";
  }).
  ensure("matAdjugate",()=>{
    let m=M.mat3(1,4,6,-9,7,5,12,5,8);
    let n=M.mat2(3,9,8,5);
    return M.matAdjugate(m).cells.join("")=="31-2-22132-64-59-1294343" &&
           M.matAdjugate(n).cells.join("")=="5-9-83";
  }).
  ensure("matInv",()=>{
    let w=M.matInv(M.mat3(1,2,3,5,6,7,-3,5,8));
    let u=M.matInv(M.mat2(9,-2,10,-5));
    return _arrayEq(w.cells, [0.65,-0.05,-0.2,
                              -3.05,0.85,0.4,
                              2.15,-0.55,-0.2]) &&
           _arrayEq(u.cells,[0.2,-0.08,0.4,-0.36]);
  }).
  ensure("matCell",()=>{
    let m=M.mat2(1,2,3,4);
    return 4===M.matCell(m,2,2) && 9===M.matCell(M.matCell(m,2,1,9),2,1);
  }).
  ensure("colMajor;from",()=>{
    let u=M.matFromColMajor([[9,2],[4,10],[5,3]]);
    let w=M.matFromColMajor([[9,10,2],[2,5,8],[4,3,1]]);
    return u.dim.join("")=="23" && u.cells.join("")=="9452103" &&
           w.dim.join("")=="33" && w.cells.join("") =="9241053281";
  }).
  ensure("colMajor;to",()=>{
    let u=M.matToColMajor(M.matrix([2,3],9,4,5,2,10,3));
    let w=M.matToColMajor(M.matrix([3,3],9,2,4,10,5,3,2,8,1));
    return u.length===3 && u.flat().join("")=="9241053" &&
           w.length===3 && w.flat().join("")=="9102258431";
  }).
  ensure("matRowMajors",()=>{
    let w=M.matRowMajors(M.mat3(1,2,3,4,5,6,7,8,9));
    return w.length===3 &&
           w[0].join("")=="123" &&
           w[1].join("")=="456" && w[2].join("")=="789";
  }).
  ensure("matColMajors",()=>{
    let w=M.matColMajors(M.mat3(1,2,3,4,5,6,7,8,9));
    return w.length===3 &&
           w[0].join("")=="147" &&
           w[1].join("")=="258" && w[2].join("")=="369";
  }).
  ensure("scale3D",()=>{
    let w=M.scale3D(M.v3(5,6,7));
    return w.dim.join("")=="44" &&
           w.cells.join("")=="5000060000700001";
  }).
  ensure("translate3D",()=>{
    let w=M.translate3D(M.v3(5,6,7));
    return w.dim.join("")=="44" &&
           w.cells.join("")=="1000010000105671";
  }).
  ensure("isIdentity",()=>{
    let m= M.matZero(4);
    let n= M.matZero(2);
    m.cells[0]=m.cells[5]=m.cells[10]=m.cells[15]=1;
    n.cells[0]=n.cells[3]=1;
    return M.isIdentity(m) && M.isIdentity(n);
  }).
  ensure("isOrthogonal",()=>{
    return M.isOrthogonal(M.matrix([2,2],-1,0,0,1)) &&
           !M.isOrthogonal(M.matrix([3,3],1,2,3,4,5,6,7,8,9));
  }).
  ensure("matVMult",()=>{
    let w=M.matVMult(M.mat3(1,2,3,4,5,6,7,8,9),M.v3(2,3,4));
    return w.join("")=="204774";
  }).
  ensure("rot2D",()=>{
    let w=M.rot2D(Math.PI/3);
    return _arrayEq(w.cells,[1/2, Math.sqrt(3)/-2, Math.sqrt(3)/2, 1/2]);
  }).
  ensure("xRot3D",()=>{
    let w= M.xRot3D(PIE/2)//90 degrees
    let r= M.matVMult(w,M.v4(2,3,4));
    return _arrayEq(r,[2,-4,3,0]);
  }).
  ensure("yRot3D",()=>{
    let w= M.yRot3D(PIE/2)//90 degrees
    let r= M.matVMult(w,M.v4(2,-4,3));
    return _arrayEq(r,[3,-4,-2,0]);
  }).
  ensure("zRot3D",()=>{
    let w= M.zRot3D(PIE/2)//90 degrees
    let r= M.matVMult(w,M.v4(3,-4,-2));
    return _arrayEq(r,[4,3,-2,0]);
  }).
  ensure("rot3D",()=>{
    let w=M.rot3D(Math.PI/2,Math.PI/2,Math.PI/2);
    let r= M.matVMult(w,M.v4(2,3,4));
    return _arrayEq(r,[4,3,-2,0]);
  }).end(tearDown)).then(function(r){
  Test.prn(r);
  });

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//EOF


