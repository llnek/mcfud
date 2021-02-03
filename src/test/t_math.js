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
const M=require("../main/math.js");
const Test=require("../main/test.js");
const {u:_,is}=Core;
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function tearDown(){
  0&&console.log("tearDown called()") }
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.runtest(
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.deftest("Math").
  begin(env=>{ 0&&console.log("setup called()") }).
  ensure("lerp",()=>{
    let out=[];
    for(let i=1;i<=10;++i)
      out.push(M.lerp(10,20,0.1*i));
    return out.join(",")=="11,12,13,14,15,16,17,18,19,20";
  }).
  ensure("xmod",()=>{
    return M.xmod(10,3)===1 && M.xmod(18,3)===0 && M.xmod(-19,3)===2 && M.xmod(-35,9)===1;
  }).
  ensure("clamp",()=>{
    return M.clamp(10,20,7)===10 && M.clamp(10,20,13)===13 && M.clamp(10,20,100)===20;
  }).
  ensure("sqr",()=>{
    return M.sqr(3)===9 && M.sqr(-2)===4;
  }).
  ensure("fuzzyZero",()=>{
    return M.fuzzyZero(0.000000000003) && !M.fuzzyZero(4-5);
  }).
  ensure("fuzzyEq",()=>{
    return M.fuzzyEq(1/10000,1/10000) && !M.fuzzyEq(3,4);
  }).
  ensure("radToDeg;degToRad",()=>{
    return _.feq(90,M.radToDeg(M.degToRad(90))) &&
           _.feq(Math.PI,M.degToRad(M.radToDeg(Math.PI)));
  }).
  ensure("pythag;pythag2",()=>{
    return M.pythag(3,4)===5 && M.pythag2(3,4)===25;
  }).
  ensure("wrap",()=>{
    return M.wrap(3,10)===4 && M.wrap(10,10)===1;
  }).
  ensure("biasGreater",()=>{
    return !M.biasGreater(10,11);
  }).end(tearDown)).then(function(r){
  Test.prn(r);
  });

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//EOF


