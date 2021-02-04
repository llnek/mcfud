// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  "use strict";
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    /**
     * @private
     * @var {object}
     */
    const _$={
      fsm(defn){
        let _state=defn.initState();
        return {
          /** the current state */
          state(){
            return _state },
          /** run the current state `code` */
          process(){
            const fromStateObj=defn[_state];
            if(fromStateObj)
              fromStateObj.run && fromStateObj.run();
          },
          /** apply an event */
          trigger(event="change"){
            const fromStateObj= defn[_state];
            const tx= fromStateObj &&
                      fromStateObj.transitions[event];
            //react to this event
            if(tx){
              const nextState = tx.target;
              const nextStateObj = defn[nextState];
              if(nextStateObj){
                fromStateObj.exit && fromStateObj.exit();
                nextStateObj.enter && nextStateObj.enter();
                tx.action && tx.action();
                return (_state = nextState);
              }
            }
          }
        }
      }
    };
    return _$;
  }
  /**Sample definition syntax/format.
   * @private
   * @var {object}
   */
  const sample={
    /** provides the initial state of this FSM */
    initState(){ return "happy"},
    /** follow by a list of state definitions */
    "happy":{
      enter(){ console.log("happy: entering") },
      exit(){ console.log("happy: exiting") },
      transitions:{
        "rain":{
          target: "sad",
          action(){ console.log("from happy to sad") }
        }
      }
    },
    "sad":{
      enter(){ console.log("sad: entering") },
      exit(){ console.log("sad: exiting") },
      transitions:{
        "sun":{
          target: "happy",
          action(){ console.log("from sad to happy") }
        }
      }
    }
  };

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/fsm"]=_module
  }

})(this);


