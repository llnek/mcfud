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
    if(!GA) GA= gscope["io/czlab/mcfud/algo/ga"]();
    const int=Math.floor;
    const {is,u:_}= Core;
    const {wrapNumObjGtr,wrapNumObjLsr,cycle,hillClimb,Chromosome,swapGeneAt}= GA;

    /**
     * @module mcfud/algo_circuits
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**
     * @memberof module:mcfud/algo_circuits
     * @class
     */
    class Not{
      constructor(input){
        this.input = input
      }
      getOutput(){
        let v;
        if(_.echt(this.input))
          v=this.input.getOutput();
        if(_.echt(v)) return !v;
      }
      toString(){
        return this.input?`Not(${this.input})` : "Not(?)"
      }
      static inputCount(){ return 1 }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    class GateWith2Inputs{
      constructor(inputA, inputB, label, fnTest){
        this.inputA = inputA;
        this.inputB = inputB;
        this.label = label;
        this.fnTest = fnTest;
      }
      getOutput(){
        let a,b;
        if(_.echt(this.inputA) && _.echt(this.inputB)){
          a= this.inputA.getOutput();
          b= this.inputB.getOutput();
        }
        if(_.echt(a) && _.echt(b)) return this.fnTest(a, b);
      }
      static inputCount(){ return 2 }
      toString(){
        return (_.nichts(this.inputA) ||
                _.nichts(this.inputB)) ? `${this.label}` : `${this.label}(${this.inputA} ${this.inputB})`
      }
    }

    class And extends GateWith2Inputs{
      constructor(inputA, inputB){
        super(inputA, inputB, "And", (a,b)=> a && b)
      }
    }

    class Or extends GateWith2Inputs{
      constructor(inputA, inputB){
        super(inputA, inputB, "Or", (a,b)=> a || b)
      }
    }

    class Xor extends GateWith2Inputs{
      constructor(inputA, inputB){
        super(inputA, inputB, "Xor", (a,b)=> a != b)
      }
    }

    class Source{
      constructor(sourceId, sourceContainer){
        this.sourceId = sourceId;
        this.sourceContainer = sourceContainer;
      }
      getOutput(){
        return this.sourceContainer.get(this.sourceId)
      }
      toString(){
        return this.sourceId
      }
      static inputCount(){ return 0 }
    }

    class Circuits{
      static Node(createGate, indexA, indexB){ return{ createGate, indexA, indexB } }
      static test(){
        let extra,inputs = new Map();
        let maxLength=50;
        let rules = [[[false, false], false],
                 [[false, true], true],
                 [[true, false], true],
                 [[true, true], true]];
        let expectedLength = 6;
        let gates = [[(i1,i2)=> new And(i1,i2), And],
                     [(i1,i2)=> new Not(i1), Not]];
        let sources = [[(i1,i2)=> new Source("A", inputs), Source],
                       [(i1,i2)=> new Source("B", inputs), Source]];
        function nodesToCircuit(genes){
          let circuit = [], usedIndexes = [];
          for(let node,i=0;i<genes.length;++i){
            let inputA, inputB;
            node=genes[i];
            let used= new Set([i]);
            if(_.echt(node.indexA) && i > node.indexA){
              inputA = circuit[node.indexA];
              used.add(usedIndexes[node.indexA]);
              if(_.echt(node.indexB) && i > node.indexB){
                inputB = circuit[node.indexB];
                used.add(usedIndexes[node.indexB]);
              }
            }
            circuit.push(node.createGate(inputA, inputB));
            usedIndexes.push(Array.from(used));
          }
          return[_.last(circuit), _.last(usedIndexes)];
        }
        function calcFit(genes){
          let circuit = nodesToCircuit(genes)[0];
          let sourceLabels = "ABCD";
          let rulesPassed = 0;
          rules.forEach(rule=>{
            inputs.clear();
            _.zip(sourceLabels, rule[0], inputs);
            if(circuit.getOutput() == rule[1]) ++rulesPassed;
          });
          return wrapNumObjGtr(rulesPassed)
        }
        function createGene(index){
          let gateType= index<sources.length ? sources[index] : _.randItem(gates);
          let indexA, indexB;
          if(gateType[1].inputCount() > 0)
            indexA = _.randInt2(0, index);
          if(gateType[1].inputCount() > 1){
            indexB = _.randInt2(0, index);
            if(indexB == indexA)
              indexB = _.randInt2(0, index);
          }
          //console.log("pppp="+index);
          return Circuits.Node(gateType[0], indexA, indexB);
        }
        function mutate(childGenes, fnCreateGene, fnGetFitness, sourceCount){
          let count = _.randInt2(1, 5);
          let f0 = fnGetFitness(childGenes);
          while(count > 0){
            count -= 1;
            let indexesUsed = nodesToCircuit(childGenes)[1].reduce((acc,i)=>{
              if(i>=sourceCount) acc.push(i);
              return acc;
            },[]);
            if(indexesUsed.length == 0) return;
            let index = _.randItem(indexesUsed);
            childGenes[index] = fnCreateGene(index);
            if(fnGetFitness(childGenes).gt(f0)) return;
          }
        }
        //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
        function fnOptimizationFunction(variableLength){
          maxLength = variableLength;
          extra={
            calcFit,
            mutate: fnMutate,
            create: fnCreate,
            poolSize:3,
            maxSeconds:30000,
            optimal: wrapNumObjGtr(rules.length)
          }
          //console.log("before cycle======");
          let r= cycle(null, extra);
          //console.log("rrr===="+r);
          return r;
        }
        function fnCreate(){
          return _.fill(maxLength,0).map((v,i)=> createGene(i))
        }
        function fnMutate(genes){
          mutate(genes, createGene, calcFit, sources.length)
        }
        //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
        function fnIsImprovement(currentBest, child){
          return child.fitness.eq(wrapNumObjGtr(rules.length)) &&
                 nodesToCircuit(child.genes)[1].length < nodesToCircuit(currentBest.genes)[1].length
        }
        //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
        function fnIsOptimal(child){
          return child.fitness.eq(wrapNumObjGtr(rules.length)) &&
                 nodesToCircuit(child.genes)[1].length <= expectedLength;
        }
        //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
        function fnGetNextFeatureValue(currentBest){
          return nodesToCircuit(currentBest.genes)[1].length
        }

        //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
        let X={}
        let best = hillClimb(fnOptimizationFunction, fnIsImprovement,
                             fnIsOptimal, fnGetNextFeatureValue, maxLength, X);
        let cc=nodesToCircuit(best.genes)[0];
        GA.showBest(best,X);
        console.log(`${cc}`);
        console.log(`f=${best.fitness}`);
      }
    }
    Circuits.test();

    const _$={ };
    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./ga"))
  }else{
    gscope["io/czlab/mcfud/algo/algo_circuits"]=_module
  }

})(this);


