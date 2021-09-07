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

  "use strict";

  /**Create the module.
  */
  function _module(Core){

    if(!Core)
      Core=gscope["io/czlab/mcfud/core"]();

    /**
     * @module mcfud/fsm
     */

    /**
     * @typedef {object} FSMStateTransition
     * @property {string} target  switching to this target state
     * @property {function} action() run this code upon the transition
     */

    /**
     * @typedef {object} FSMStateTransitionList
     * @property {FSMStateTransition} transition-1 user defined transition
     * @property {FSMStateTransition} ...          more
     * @property {FSMStateTransition} transition-n  user defined transition
     */

    /**
     * @typedef {object} FSMState
     * @property {function} enter() run this code when the FSM switches to this state
     * @property {function} exit()  run this code when the FSM switches away from this state
     * @property {FSMStateTransitionList} transitions  a list of state transition definitions
     */

    /**
     * @typedef {object} FSMDefn
     * @property {function} initState() return the initial state
     * @property {FSMState} state-1 a user defined state
     * @property {FSMState} ...     more
     * @property {FSMState} state-n a user defined state
     */

    /**
     * @typedef {object} FSMObject
     * @property {function} state() returns the current state
     * @property {function} process() execute any runnable code defined by the current state
     * @property {function} trigger(event) apply this event to the state machine
     */

    const _$={
      /**Create a FSM instance.
       * @memberof module:mcfud/fsm
       * @param {FSMDefn} defn
       * @return {FSMObject}
       */
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
          trigger(event="change",options){
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
                if(options && options.action){
                  options.action();
                }else if(tx.action){
                  options ? tx.action(options) : tx.action();
                }
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
   * @ignore
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


