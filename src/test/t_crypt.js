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
const C=require("../main/crypt.js");
const Test=require("../main/test.js");
const {u:_,is}=Core;
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function tearDown(){
  0&&console.log("tearDown called()") }
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.runtest(
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.deftest("Crypt").
  begin(env=>{ 0&&console.log("setup called()") }).
  ensure("encrypt;decrypt",()=>{
    let s="hello world?";
    let ok1= C.decrypt(C.encrypt("hello world?",42),42) == s;
    let ok2= C.decrypt(C.encrypt("hello world?",36),42) != s;
    let ok3= C.encrypt("hello world?",3) != s;
    let ok4= C.decrypt(C.encrypt("hello world?",-56),-56) == s;
    return ok1&&ok2&&ok3&&ok4;
  }).end(tearDown)).then(function(r){
  Test.prn(r);
  });

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//EOF


