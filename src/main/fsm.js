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
  function _module(){
    const _R={
      fsm(defn){
        let _state=defn.initState();
        return {
          state(){ return _state },
          process(){
            let fromStateObj = defn[_state];
            if(fromStateObj)
              fromStateObj.run && fromStateObj.run();
          },
          trigger(event){
            let fromStateObj = defn[_state];
            event=event||"change";
            let tx = fromStateObj &&
                     fromStateObj.transitions[event];
            if(tx){
              let nextState = tx.target;
              let nextStateObj = defn[nextState];
              if(nextStateObj){
                fromStateObj.egress && fromStateObj.egress();
                nextStateObj.ingress && nextStateObj.ingress();
                tx.action && tx.action();
                return (_state = nextState);
              }
            }
          }
        }
      }
    };
    return _R;
  }

  /**
   * @private
   * @var {object}
   */
  const sample={
    initState(){ return "happy"},
    "happy":{
      ingress(){ console.log("happy: entering") },
      egress(){ console.log("happy: exiting") },
      transitions:{
        "rain":{
          target: "sad",
          action(){ console.log("from happy to sad") }
        }
      }
    },
    "on":{
      ingress(){ console.log("sad: entering") },
      egress(){ console.log("sad: exiting") },
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
    module.exports=_module()
  }else{
    gscope["io/czlab/mcfud/fsm"]=_module
  }

})(this);


