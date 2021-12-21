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
  function _module(Core,GA){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!GA) GA= gscope["io/czlab/mcfud/algo/NNetGA"]();
    const int=Math.floor;
    const {is,u:_}= Core;
    const {NumericFitness,runGACycle,
           runGASearch,Chromosome,showBest,calcStats}= GA;

    /**
     * @module mcfud/algo_gaex
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Guess a password.
     * @memberof module:mcfud/algo_gaex
     * @class
     */
    class CH1{
      static test(input){
        let geneSet = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.,".split("");
        let gs=geneSet.slice();
        let target=input.split(""),
            N=target.length,
            optimal= NumericFitness(N);
        function calcFit(guess){
          let sum=0;
          for(let i=0;i<N;++i)
            if(target[i]==guess[i]) ++sum;
          return NumericFitness(sum);
        }
        function create(){
          let genes= _.shuffle(gs).slice(0,N);
          return Chromosome(genes, calcFit(genes));
        }
        function XXmutate(b){
          return GA.mutateIM(b,GA.MutationRate);
        }
        function mutate(c){
          if(_.rand()<=GA.MutationRate){
            let i= _.randInt(c.length);
            c[i]= _.randItem(gs);
          }
        }
        function crossOver(b1,b2){
          return GA.crossOverRND(b1,b2,GA.CrossOverRate);
        }
        let pop,best,s,extra;
        //console.log("ready...");
        if(1){
          extra= {maxSeconds:5,create, calcFit, mutate, crossOver, targetScore:12, NUM_ELITES:6};
          pop= runGACycle(100,extra)[1];
          s=calcStats(pop);
          best=s.best;
        }
        if(0){
          extra= {maxSeconds:5,maxAge:50,create, calcFit, mutate, crossOver, poolSize:6};
          best= runGASearch(optimal,extra)[1];
        }
        showBest(best,extra);
        console.log("best=" + best.genes.join(""));
      }
    }
    CH1.test("Hello World!");

    const _$={ };
    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./genetic"))
  }else{
    gscope["io/czlab/mcfud/algo/gaex"]=_module
  }

})(this);


