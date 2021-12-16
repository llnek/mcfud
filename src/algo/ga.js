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
  function _module(Core,Basic,Sort){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    //if(!Basic) Basic= gscope["io/czlab/mcfud/algo/basic"]();
    //if(!Sort) Sort= gscope["io/czlab/mcfud/algo/sort"]();
    //const {Bag,Stack,Queue,StdCompare:CMP,prnIter}= Basic;
    const {min,max,abs,round,floor:int}=Math;
    const {is,u:_}= Core;

    /**
     * @module mcfud/algo_ga
     */


    /**
     * @memberof module:mcfud/algo_ga
     * @class
     */
    class CompetitionResult{
      static Loss = 0;
      static Tie = 1;
      static Win = 2;
    }

    /**
     * @memberof module:mcfud/algo_ga
     * @class
     */
    class Source{
      static Create="create"; //0
      static Mutate="mutate"; //1;
      static CrossOver="crossOver"; //2;
    }

    /**
     * @memberof module:mcfud/algo_ga
     * @class
     */

    function Chromosome(genes, fitness, source){
      return {genes, fitness, source, age:0}
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function wrapNumObjGtr(n){
      return{
        value:n,
        gt(x){ return n>x.value },
        eq(x){ return n==x.value },
        toString(){ return `${this.value}` }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function wrapNumObjLsr(n){
      return{
        value:n,
        gt(x){ return n<x.value },
        eq(x){ return n==x.value },
        toString(){ return `${this.value}` }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function genRandom(size,geneSet,calcFit){
      let n,genes = [];
      while(genes.length < size){
        n = min(size - genes,length, geneSet.length);
        genes.push.apply(genes, _.randSample(geneSet, n));
      }
      return Chromosome(genes, calcFit(genes), Source.Create);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function bisectLeft(arr,e){
      let a,i=0;
      for(;i<arr.length;++i){
        a=arr[i];
        if(a.fitness.eq(e.fitness) ||
           !e.fitness.gt(a.fitness)) break;
      }
      return i;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function tooLong(start,maxSecs){
      return maxSecs !== undefined && (_.now()-start) > maxSecs
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function* _getNextStar(newChild, create, maxAge, poolSize, maxSeconds){
      let start= _.now(),
          parent, bestParent = create();
      yield [tooLong(start,maxSeconds), bestParent];
      let parents = [bestParent],
          history = [bestParent],
          ratio,child, index,pindex, lastParentIndex;
      for(let i=0;i<poolSize-1;++i){
        parent = create();
        if(tooLong(start,maxSeconds)){ yield [true, parent] }
        if(parent.fitness.gt(bestParent.fitness)){
          yield [false, parent];
          bestParent = parent;
          history.push(parent);
        }
        parents.push(parent);
      }
      lastParentIndex = poolSize - 1;
      pindex = 1;
      while(true){
        if(tooLong(start,maxSeconds)){ yield [true, bestParent] }
        pindex = pindex>0? pindex-1 : lastParentIndex;
        parent = parents[pindex];
        child = newChild(parent, pindex, parents);
        if(parent.fitness.gt(child.fitness)){
          if(maxAge===undefined) continue;
          parent.age += 1;
          if(maxAge > parent.age) continue;
          index = bisectLeft(history, child, 0, history.length);
          ratio= index / history.length;
          if(_.rand() < Math.exp(-ratio)){
            parents[pindex] = child;
            continue;
          }
          bestParent.age = 0;
          parents[pindex] = bestParent;
          continue;
        }
        if(! child.fitness.gt(parent.fitness)){
          //same fitness
          child.age = parent.age + 1;
          parents[pindex] = child;
          continue;
        }
        child.age = 0;
        parents[pindex] = child;
        if(child.fitness.gt(bestParent.fitness)){
          bestParent = child;
          yield [false, bestParent];
          history.push(bestParent);
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _crossOver(parentGenes, index, parents, calcFit, crossOver, mutate, create){
      let donor= _.randInt(parents.length);
      if(donor == index)
        donor= (donor+1) % parents.length;
      let c= crossOver(parentGenes, parents[donor].genes);
      if(!c){
        //parent and donor are indistinguishable
        parents[donor] = create();
        return mutate(parents[index]);
      }else{
        return Chromosome(c, calcFit(c), Source.CrossOver);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _mutate(parent, geneSet, calcFit){
      let c = parent.genes.slice();
      let i= _.randInt(parent.genes.length);
      let a= _.randItem(geneSet);
      if(c[i]==a){
        //try again
        a=_.randItem(geneSet);
      }
      c[i]=a;
      return Chromosome(c, calcFit(c), Source.Mutate);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _mutateCustom(parent, custom, calcFit){
      let c = parent.genes.slice();
      custom(c);
      return Chromosome(c, calcFit(c), Source.Mutate);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function swapGeneAt(genes, a, b){
      let tmp=genes[a];
      genes[a]=genes[b];
      genes[b]=tmp;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      wrapNumObjGtr,
      wrapNumObjLsr,
      swapGeneAt,
      Chromosome,
      showBest(best,extra){
        console.log(_.fill(80,"-").join(""));
        console.log("total time: " + _.prettyMillis(extra.endTime-extra.startTime));
        console.log("total cycles= " + extra.cycles);
        console.log("fitness= "+ best.fitness);
        console.log(_.fill(80,"-").join(""));
      },
      /**
       * @memberof module:mcfud/algo_ga
       * @param
       */
      cycle(geneSet, extra){
        //custom_mutate=None, custom_create=None, maxAge=None, poolSize=1, crossover=None, maxSeconds=None){
        let {optimal,mutate,create,maxAge,
             calcFit,poolSize,crossOver,maxSeconds}=extra;
        extra.startTime=_.now();
        poolSize = poolSize||1;
        function fnMutate(parent){
          return mutate? _mutateCustom(parent, mutate, calcFit)
                       : _mutate(parent, geneSet, calcFit)
        }
        function fnCreate(){
          let genes = create();
          return Chromosome(genes, calcFit(genes), Source.Create);
        }
        //let strategyLookup = { Source.Create: fnCreate, Source.Mutate: (p)=> fnMutate(p), Source.CrossOver: (p,i,o)=> { return _crossOver(p.genes, i, o, calcFit, crossOver, fnMutate, fnCreate) } }
        //let usedStrategies = [strategyLookup[Source.Mutate]];
        function newChild(parent,index,parents){
          if(crossOver){
            return _crossOver(parent.genes, index, parents, calcFit, crossOver, fnMutate, fnCreate)
          }else{
            return fnMutate(parent)
          }
        }
        let gen= _getNextStar(newChild, fnCreate, maxAge, poolSize, maxSeconds);
        function finz(r){
          extra.endTime=_.now();
          return r;
        }
        extra.cycles=0;
        while(1){
          extra.cycles +=1;
          let [timeOut, imp]= gen.next().value;
          if(timeOut) return finz(imp);
          //console.log(imp.genes.join(","));
          if(!optimal.gt(imp.fitness)) return finz(imp);
        }
      },
      /**
       * @memberof module:mcfud/algo_ga
       * @param
       */
      hillClimb(optimizationFunction, isImprovement, isOptimal, getNextFeatureValue, initialFeatureValue,extra){
        let start= extra.startTime=_.now();
        let best = optimizationFunction(initialFeatureValue);
        //console.log("bb===="+best.genes.join(","));
        //stdout = sys.stdout sys.stdout = None
        while(!isOptimal(best)){
          let child = optimizationFunction( getNextFeatureValue(best));
          if(isImprovement(best, child)){
            best = child
            //sys.stdout = stdout
            //display(best, featureValue)
            //sys.stdout = None
          }
        }
        extra.endTime=_.now();
        return best;
      },
      /**
       * @memberof module:mcfud/algo_ga
       * @param
       */
      tournament(create, crossOver, compete, sortKey, numParents=10, maxGenerations=100){
        let best,bestScore,parents,pool=[];
        for(let i=0,z=1+numParents*numParents;i<z;++i){
          pool.push([create(),[0,0,0]])
        }
        bestScore = pool[0];
        function getSortKey(x){
          return sortKey(x[0],
                         x[1][CompetitionResult.Win],
                         x[1][CompetitionResult.Tie],
                         x[1][CompetitionResult.Loss]);
        }
        function getSortKeys(a,b){
          let x= getSortKey(a),
              y= getSortKey(b);
          return x<y?-1:(x>y?1:0);
        }
        let generation = 0;
        while(generation < maxGenerations){
          generation += 1;
          for(let i=0;i<pool.length;++i){
            for(let j=0;j<pool.length;++j){
              if(i == j) continue;
              let [playera, scorea] = pool[i];
              let [playerb, scoreb] = pool[j];
              let result = compete(playera, playerb);
              scorea[result] += 1;
              scoreb[2 - result] += 1;
            }
          }
          pool.sort(getSortKeys).reverse();
          if(getSortKey(pool[0]) > getSortKey([best, bestScore])){
            [best, bestScore] = pool[0];
            //display(best, bestScore[CompetitionResult.Win], bestScore[CompetitionResult.Tie], bestScore[CompetitionResult.Loss], generation)
          }
          parents=[];
          for(let i=0;i<numParents.length;++i){
            parents.push(pool[i][0]);
          }
          pool=[];
          for(let i=0;i<parents.length;++i)
            for(let j=0;j<parents.length;++j){
              if(i !== j)
                pool.push([crossOver(parents[i], parents[j]), [0, 0, 0]]);
            }
          parents.forEach(p=> pool.push([p,[0,0,0]]));
          pool.push([create(), [0, 0, 0]]);
        }
        return best;
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./basic"),require("./sort"))
  }else{
    gscope["io/czlab/mcfud/algo/ga"]=_module
  }

})(this);


