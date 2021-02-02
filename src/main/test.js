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
// Copyright © 2020-2021, Kenneth Leung. All rights reserved.

;(function(gscope){
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  "use strict";
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  /**
   * @private
   * @function
   */
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {is,u:_}=Core;
    /**
     * @private
     * @function
     */
    function _f(s){
      return s.startsWith("P") }

    /**
     * @private
     * @function
     */
    function rstr(len,ch){
      let out="";
      while(len>0){
        out += ch;
        --len;
      }
      return out;
    }
    /**
     * @private
     * @function
     */
    function ex_thrown(expected,e){
      let out=t_bad;
      if(e){
        if(is.str(expected)){
          out= expected==="any" || expected===e ? t_ok : t_bad;
        }else if(expected instanceof e){
          out=t_ok;
        }
      }
      return out;
    }
    /**
     * @private
     * @function
     */
    function ensure_eq(env,form){
      let out;
      try{
        out = form.call(env) ? t_ok : t_bad;
      }catch(e){
        out= t_bad;
      }
      return out;
    }
    /**
     * @private
     * @function
     */
    function ensure_ex(env,form,error){
      let out;
      try{
        form.call(env);
        out=ex_thrown(error,null);
      }catch(e){
        out=ex_thrown(error,e);
      }
      return out;
    }
    /**
     * @private
     * @var {string}
     */
    const [t_bad,t_ok]=["Failed", "Passed"];
    /**
     * @private
     * @var {object}
     */
    const _$={
      deftest(name){
        let iniz=null;
        let finz=null;
        let arr=null;
        let env=null;
        let x={
          ensure(n,f){
            arr.push([1,n,f]);
            return x;
          },
          eerror(n,f){
            arr.push([911,n,f]);
            return x;
          },
          begin(f){
            env={};
            arr=[];
            iniz=f;
            return x;
          },
          end(f){
            finz=f;
            let F=function(){
              iniz && iniz(env);
              let out=[];
              for(let r,a,i=0;i<arr.length;++i){
                a=arr[i];
                r="";
                switch(a[0]){
                  case 1: r=ensure_eq(env,a[2]); break;
                  case 911: r=ensure_ex(env,a[2],"any"); break;
                }
                if(r)
                  out.push(`${r}: ${a[1]}`);
              }
              arr.length=0;
              finz && finz(env);
              return out;
            };
            return (F.title=name) && F;
          }
        };
        return x;
      },
      runtest(test,title){
        const mark= Date.now();
        const res=test();
        const mark2= Date.now();
        const sum= res.length;
        const good= res.filter(_f);
        const ok=good.length;
        const perc= (ok/sum)*100;
        const diff=mark2-mark;
        const out= [
          rstr(78,"+"),
          title||test.title,
          new Date().toString(),
          rstr(78,"+"),
          res.join("\n"),
          rstr(78,"="),
          ["Passed: ",ok,"/",sum," [",perc|0,"%]"].join(""),
          `Failed: ${sum-ok}`,
          ["cpu-time: ",diff,"ms"].join("")].join("\n");
        return out;
      }
    };
    return _$;
  }
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/test"]= _module
  }

})(this);


