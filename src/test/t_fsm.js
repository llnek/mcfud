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
const F=require("../main/fsm.js");
const Test=require("../main/test.js");
const {u:_,is}=Core;
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function tearDown(){
  0&&console.log("tearDown called()") }
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.runtest(
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.deftest("Finite State Machine").
  begin(env=>{
    env.stack=[];
    env.sample=F.fsm({
      initState(){ return "happy"},
      "happy":{
        enter(){ env.stack.push("happy:entering") },
        exit(){ env.stack.push("happy:exiting") },
        run(){ env.stack.push("still happy") },
        transitions:{
          "rain":{
            target: "sad",
            action(){ env.stack.push("happy->sad") }}}
      },
      "sad":{
        enter(){ env.stack.push("sad:entering") },
        exit(){ env.stack.push("sad:exiting") },
        run(){ env.stack.push("still sad") },
        transitions:{
          "sun":{
            target: "happy",
            action(){ env.stack.push("sad->happy") }}}
      }
    });
  }).
  ensure("state;initial",function(){
    return "happy"==this.sample.state()
  }).
  ensure("process-1",function(){
    this.sample.process();
    return this.stack[this.stack.length-1]=="still happy"
  }).
  ensure("trigger-sad",function(){
    this.sample.trigger("rain");
    return this.stack[this.stack.length-1]=="happy->sad"
  }).
  ensure("process-2",function(){
    this.sample.process();
    return this.stack[this.stack.length-1]=="still sad"
  }).
  ensure("trigger-happy",function(){
    this.sample.trigger("sun");
    return this.stack[this.stack.length-1]=="sad->happy"
  }).
  ensure("process-3",function(){
    this.sample.process();
    return this.stack[this.stack.length-1]=="still happy"
  }).
  ensure("states;audit",function(){
    return this.stack.length===9 &&
           this.stack.join("|") == "still happy|happy:exiting|sad:entering|happy->sad|still sad|sad:exiting|happy:entering|sad->happy|still happy"
  }).end(tearDown)).then(function(r){
  Test.prn(r);
  });

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//EOF


