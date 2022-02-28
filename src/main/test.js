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
// Copyright © 2020-2022, Kenneth Leung. All rights reserved.

;(function(gscope,UNDEF){
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  "use strict";
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  /**Creates the module.
   */
  function _module(Core,Colors){

    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!Colors){
      throw "Fatal: No Colors!"
    }
    const {is,u:_}=Core;

    /** @module mcfud/test */

    /**
     * @typedef {object} TestSuiteObject
     * @property {function} ensure(name,func)
     * @property {function} eerror(name,func)
     * @property {function} begin(set-up)
     * @property {function} end(tear-down)
     */

    /**
     * @typedef {object} TestSuiteReport
     * @property {string} title
     * @property {string} date
     * @property {number} total
     * @property {number} duration
     * @property {any[]} passed
     * @property {any[]} skippd
     * @property {any[]} failed
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Checks for non-failure. */
    const _f=(s)=> !s.startsWith("F");

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Make a string. */
    function rstr(len,ch){
      let out="";
      while(len>0){
        out += ch; --len }
      return out;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Check if valid exception was thrown. */
    function ex_thrown(expected,e){
      let out=t_bad;
      if(e){
        if(is.str(expected)){
          out= expected=="any" || expected==e ? t_ok : t_bad
        }else if(expected instanceof e){ out=t_ok }
      }
      return out;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Run the given form and check its result. */
    function ensure_eq(env,name,form){
      return new Promise((resolve,reject)=>{
        let out;
        try{
          out=form.call(env);
          if(out instanceof Promise){
            out.then(function(res){
              resolve(`${res?t_ok:t_bad}: ${name}`);
            })
          }else{
            out= out ? (out==709394?t_skip:t_ok) : t_bad;
            resolve(`${out}: ${name}`);
          }
        }catch(e){
          out= t_bad;
          resolve(`${out}: ${name}`);
        }
      })
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /** Run the given form and check if exception was thrown. */
    function ensure_ex(env,name,form,error){
      return new Promise((resolve,reject)=>{
        let out;
        try{
          out=form.call(env);
          out=out==709394?t_ok:ex_thrown(error,null);
        }catch(e){
          out=ex_thrown(error,e) }
        resolve(`${out}: ${name}`);
      })
    }

    /**
     * @private
     * @var {string}
     */
    const [t_skip,t_bad,t_ok]=["Skippd", "Failed", "Passed"];

    const _$={
      /**Print report to stdout.
       * @memberof module:mcfud/test
       * @param {TestSuiteReport} r
       */
      prn(r){
        const ok= r.passed.length;
        const sum=r.total;
        const perc=ok/sum*100;
        console.log(Colors.white(rstr(78,"+")));
        console.log(Colors.white.bold(r.title));
        console.log(Colors.white(r.date));
        console.log(Colors.white(rstr(78,"+")));
        if(r.passed.length>0)
          console.log(Colors.green(r.passed.join("\n")));
        if(r.skippd.length>0)
          console.log(Colors.grey(r.skippd.join("\n")));
        if(r.failed.length>0)
          console.log(Colors.magenta(r.failed.join("\n")));
        console.log(Colors.white(rstr(78,"=")));
        console.log(Colors.yellow(["Passed: ",ok,"/",sum," [",perc|0,"%]"].join("")));
        console.log(Colors.magenta(`Failed: ${sum-ok}`));
        console.log(Colors.white(["cpu-time: ",_.prettyMillis(r.duration)].join("")));
        console.log(Colors.white(rstr(78,"=")));
      },
      /**Define a test suite.
       * @memberof module:mcfud/test
       * @param {string} name
       * @return {TestSuiteObject}
       */
      deftest(name){
        let [iniz,finz,arr,env]= [null,null,null,null];
        const x={
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
      /** @ignore */
      _run(test){
        return new Promise((resolve,reject)=>{
          test().then(function(arr){
            resolve(arr);
          });
        })
      },
      /**Execute this test suite.
       * @memberof module:mcfud/test
       * @param {function} test
       * @param {string} title
       * @return {Promise}
       */
      runtest(test,title){
        const mark= Date.now();
        return this._run(test).then(function(res){
          const mark2= Date.now();
          const out={
            title: title||test.title,
            date: new Date().toString(),
            total: res.length,
            duration: mark2-mark,
            passed: res.filter(s=>s[0]=="P"),
            skippd: res.filter(s=>s[0]=="S"),
            failed: res.filter(s=>s[0]=="F")
          };
          return new Promise((resolve)=>{
            resolve(out);
          })
        })
      }
    };

    return _$;
  }
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  //exports
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"), require("colors/safe"))
  }else{
    gscope["io/czlab/mcfud/test"]= _module
  }

})(this);


