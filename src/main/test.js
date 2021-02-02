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
    function _f(s){ return !s.startsWith("F") }

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
    function ensure_eq(env,name,form){
      return new Promise((resolve,reject)=>{
        let out;
        try{
          out=form.call(env);
          if(out instanceof Promise){
            out.then(function(res){
              resolve(`${res?t_ok:t_bad}: ${name}`);
            });
          }else{
            out= out ? (out===709394?t_skip:t_ok) : t_bad;
            resolve(`${out}: ${name}`);
          }
        }catch(e){
          out= t_bad;
          resolve(`${out}: ${name}`);
        }
      });
    }
    /**
     * @private
     * @function
     */
    function ensure_ex(env,name,form,error){
      return new Promise((resolve,reject)=>{
        let out;
        try{
          out=form.call(env);
          out=out===709394?t_ok:ex_thrown(error,null);
        }catch(e){
          out=ex_thrown(error,e);
        }
        resolve(`${out}: ${name}`);
      });
    }
    /**
     * @private
     * @var {string}
     */
    const [t_skip,t_bad,t_ok]=["Skippd", "Failed", "Passed"];
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
              return new Promise((RR,j)=>{
                iniz && iniz(env);
                let _prev,out=[];
                for(let p,a,i=0;i<arr.length;++i){
                  a=arr[i];
                  switch(a[0]){
                    case 1: p=ensure_eq(env,a[1],a[2]); break;
                    case 911: p=ensure_ex(env,a[1],a[2],"any"); break; }
                  if(!_prev){_prev=p}else{
                    _prev= _prev.then(function(msg){
                      out.push(msg);
                      return p;
                    });
                  }
                }
                if(_prev){
                  _prev.then(function(msg){
                    out.push(msg);
                    arr.length=0;
                    finz && finz(env);
                    RR(out);
                  });
                }
              });
            };
            return (F.title=name) && F;
          }
        };
        return x;
      },
      foo(test){
        return new Promise((resolve,reject)=>{
          test().then(function(arr){
            resolve(arr);
          });
        });
      },
      runtest(test,title){
        const mark= Date.now();
        return this.foo(test).then(function(res){
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
          return new Promise((r,j)=>{
            r(out);
          });
        });
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


