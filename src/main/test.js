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
  function _module(){
    function _f(s){
      return s.startsWith("P")
    }
    function rstr(len,ch){
      let out="";
      while(len>0){
        out += ch;
        --len;
      }
      return out;
    }
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
    function ensure_eq(env,form,expected){
      let out;
      try{
        out = form.call(env)===expected ? t_ok : t_bad;
      }catch(e){
        out= t_bad;
      }
      return out;
    }
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
    const t_bad="Failed";
    const t_ok="Passed";
    const _T={
      deftest(name){
        let iniz=null;
        let finz=null;
        let arr=null;
        let env=null;
        let x={
          ensure_eq(n,w,f){
            arr.push([n,w,f]);
            return x;
          },
          ensure_ex(n,f){
            arr.push([n,f]);
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
            return function(){
              iniz && iniz(env);
              let out=[];
              for(let r,a,i=0;i<arr.length;++i){
                a=arr[i];
                r="";
                switch(a.length){
                  case 3: r=ensure_eq(env,a[2],a[1]); break;
                  case 2: r=ensure_ex(env,a[1],"any"); break;
                }
                if(r)
                  out.push(`${r}: ${a[0]}`);
              }
              arr.length=0;
              finz && finz(env);
              return out;
            }
          }
        };
        return x;
      },
      runtest(title,test){
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
          title,
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
    return _T;
  }


  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module === "object" && module.exports){
    module.exports=_module()
  }else{
    gscope["io/czlab/mcfud/test"]= _module
  }

})(this);


