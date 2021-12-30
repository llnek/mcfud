/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright © 2020-2021, Kenneth Leung. All rights reserved. */

;(function(window){

  "use strict";

  /**Create the module.
   */
  function _module(Core,GA){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!GA) GA= gscope["io/czlab/mcfud/algo/NNetGA"]();
    const int=Math.floor;
    const {is,u:_}= Core;
    const {NumericFitness,runGACycle,
           hillClimb, runGASearch,Chromosome,showBest,calcStats}= GA;

    /**
     * @module mcfud/algo_mower
     */
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const GRASS = " #";
    const MOWED = " .";
    const MOWER = "M";

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function Direction(index, xOff, yOff, symbol){
      return{index,xOff,yOff,symbol,
        moveFrom(loc, dist=1){
          return Location(loc.x + dist* this.xOff, loc.y + dist* this.yOff)
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function Location(x, y){
      return {x,y,move(xo,yo){
        return Location(this.x + xo, this.y + yo)
      }}
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const North = Direction(0, 0, -1, "^");
    const East = Direction(1, 1, 0, ">");
    const South = Direction(2, 0, 1, "v");
    const West = Direction(3, -1, 0, "<");
    const Directions= [North,East,South,West];

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function getDirAfterTurnLeft90(dir){
      let newIndex = dir.index>0? dir.index - 1: Directions.length-1;
      for(let i=0;i<Directions.length;++i)
        if(Directions[i].index==newIndex) return Directions[i]
      _.assert(false, "Boom!");
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function getDirAfterTurnRight90(dir){
      let newIndex = dir.index< Directions.length-1?dir.index+1:0;
      for(let i=0;i<Directions.length;++i)
        if(Directions[i].index==newIndex) return Directions[i]
      _.assert(false, "Boom!");
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function ToroidField(width, height, initValue){
      return{
        width, height, field: _.fill(height,()=> _.fill(width,initValue)),
        fixLocation(pos){
          let loc = Location(pos.x, pos.y);
          if(loc.x < 0){
            loc.x += this.width
          }else if(loc.x >= this.width){
            loc.x %= this.width
          }
          if(loc.y < 0){
            loc.y += this.height
          }else if(loc.y >= this.height){
            loc.y %= this.height
          }
          return [loc, true]
        },
        set(loc, symbol){
          this.field[loc.y][loc.x] = symbol
        },
        countMowed(sum=0){
          for(let y=0;y<this.height;++y)
            for(let x=0;x<this.width;++x)
              if(this.field[y][x] != GRASS) sum+=1;
          return sum;
        },
        display(mower){
          for(let row,y=0;y<this.height;++y){
            if(y != mower.loc.y){
              row=this.field[y].join(" ");
            }else{
              let r = this.field[y].slice();
              r[mower.loc.x] = `${MOWER}${mower.dir.symbol}`;
              row = r.join(" ");
            }
            console.log(row);
          }
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function Mower(loc, dir){
      return{
        loc,dir,stepCount:0,
        turnLeft(){
          this.stepCount += 1;
          this.dir= getDirAfterTurnLeft90(this.dir)
        },
        mow(field){
          let isValid,newLocation = this.dir.moveFrom(this.loc);
          [newLocation, isValid] = field.fixLocation(newLocation);
          if(isValid){
            this.loc= newLocation;
            this.stepCount += 1;
            field.set(this.loc, this.stepCount>9?this.stepCount: ` ${this.stepCount}`);
          }
        }
      }
    }

    class Mow{
      constructor(){}
      toString(){ return "mow" }
      execute(mower, field){
        mower.mow(field)
      }
    }

    class Turn{
      constructor(){}
      toString(){ return "turn" }
      execute(mower, field){
        mower.turnLeft()
      }
    }

    class Repeat{
      constructor(opCount, times){
        this.opCount = opCount;
        this.times = times;
        this.ops = [];
      }
      execute(mower, field){
        for(let i=0;i<this.times;++i)
          this.ops.forEach(o=> o.execute(mower,field))
      }
      toString(){
        return `repeat(${this.ops.length>0?this.ops.join(" "):this.opCount},${this.times})`;
      }
    }

    class Func{
      constructor(expectCall=false){
        this.ops = [];
        this.expectCall = expectCall;
        this.id = null;
      }
      execute(mower, field){
        this.ops.forEach(o=> o.execute(mower,field))
      }
      toString(){
        return `func${this.id?this.id:""}: ${this.ops.join(" ")}`
      }
    }

    class Call{
      constructor(funcId=null){
        this.funcId = funcId;
        this.funcs = null;
      }
      execute(mower, field){
        funcId = this.funcId==null?0:this.funcId;
        if(this.funcs.length > funcId)
          this.funcs[funcId].execute(mower, field)
      }
      toString(){
        return `call-${this.funcId!=null?this.funcId:"func"}`
      }
    }

    class Program{
      constructor(genes){
        let temp = genes.slice();
        let funcs = [];
        let start,end,func;

        for(let i=temp.length-1;i>=0;--i){
          if(temp[i] instanceof Repeat){
            start = i+ 1;
            end = Math.min(i + temp[i].opCount + 1, temp.length);
            temp[i].ops = temp.slice(start,end);
            temp.splice(start,end-start);
            continue;
          }
          if(temp[i] instanceof Call){
            temp[i].funcs = funcs;
          }
          if(temp[i] instanceof Func){
            if(funcs.length > 0 && !temp[i].expectCall){
              temp[i] = Call();
              temp[i].funcs = funcs;
              continue;
            }
            start = i+ 1;
            end = temp.length;
            func = Func();
            if(temp[i].expectCall)
              func.id = funcs.length;

            func.ops=[];
            for(let o,t=start;t<end;++t){
              o=temp[t];
              if(!(o instanceof Repeat) || (o instanceof Repeat && o.ops>0)){
                func.ops.push(o)
              }
            }
            funcs.push(func);
            temp.splice(i,end-i);
          }
        }

        for(let func,f=0;f<funcs.length;++f){
          func=funcs[f];
          for(let fid,i=func.ops.length-1;i>=0;--i){
            if(func.ops[i] instanceof Call){
              fid = func.ops[i].funcId;
              if(fid==null) continue;
              if(fid >= funcs.length || funcs[fid].ops.length == 0) func.ops.splice(i,1);
            }
          }
        }

        for(let fid,i=temp.length-1;i>=0;--i){
          if(temp[i] instanceof Call){
            fid = temp[i].funcId;
            if(fid==null) continue;
            if(fid >= funcs.length || funcs[fid].ops.length == 0) temp.splice(i,1);
          }
        }

        this.main = temp;
        this.funcs = funcs;
      }
      evaluate(mower, field){
        this.main.forEach(m=> m.execute(mower, field))
      }
      print(){
        if(this.funcs)
          this.funcs.forEach(f=>{
            if(f.id != null && f.ops.length == 0){}else{
              console.log(f.toString())
            }
          });
        console.log(this.main.join(" "));
      }
    }

    function Fitness(totalMowed, totalInstructions, stepCount, info){
      return{
        info, totalMowed, totalInstructions, stepCount,
        gt(b){
          if(this.totalMowed != b.totalMowed)
            return this.totalMowed > b.totalMowed;
          if(this.stepCount != b.stepCount)
            return this.stepCount < b.stepCount;
          return this.totalInstructions < b.totalInstructions;
        },
        eq(b){
          return this.totalMowed == b.totalMowed &&
                 this.stepCount == b.stepCount &&
                 this.totalInstructions == b.totalInstructions;
        },
        lt(b){
          return !eq(b) && !this.gt(b)
        },
        clone(){
          return Fitness(this.totalMowed, this.totalInstructions, this.stepCount, this.info)
        },
        score(){
          return this.totalMowed
        },
        toString(){
          return `${this.totalMowed} mowed with ${this.totalInstructions} instructions and ${this.stepCount} steps`
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    class LawnMower{
      static test(){
        let width = 8,height = 8;
        let geneSet = [()=> new Mow(),
                       ()=> new Turn()];
                       //()=> new Repeat(_.randInt(8), _.randInt(8))];
        let minGenes = width*height,
            maxGenes = int(1.5*minGenes),
            maxMutationRounds = 3,
            expectedNumberOfSteps = 78,
            expectedNumberOfInstructions = 78;

        function fnCreateField(){
          return ToroidField(width, height,GRASS);
        }

        let mowerStartLocation = Location(int(width / 2), int(height / 2));
        let mowerStartDirection = South;

        function create(){
          let g=[],n= _.randInt2(1, height);
          for(let i=1;i<n;++i)
            g.push(_.randItem(geneSet)());
          return GA.Chromosome(g,calcFit(g));
        }

        function fnEvaluate(instructions){
          let prog= new Program(instructions);
          let mower = Mower(mowerStartLocation, mowerStartDirection);
          let field = fnCreateField();
          prog.evaluate(mower, field);
          return [field, mower, prog];
        }

        function calcFit(genes){
          let [field, mower, _] = fnEvaluate(genes);
          return Fitness(field.countMowed(), genes.length, mower.stepCount, [field,mower])
        }

        function mutate(genes){
          let count = _.randInt2(1, maxMutationRounds);
          let f0 = calcFit(genes);
          while(count > 0){
            count -= 1;
            if(calcFit(genes).gt(f0)) return;
            if(genes.length == 0 || (genes.length < maxGenes && _.randInt2(0, 5) == 0)){
              genes.push(_.randItem(geneSet)());
              continue;
            }
            if(genes.length > minGenes && _.randInt2(0, 50) == 0){
              genes.splice( _.randInt(genes.length),1);
              continue;
            }
            genes[_.randInt(genes.length)]= _.randItem(geneSet)();
          }
        }

        function crossOver(b1,b2){
          GA.crossOverRND(b1,b2,GA.CrossOverRate)
        }

        let optimal= Fitness(width * height,
                                 expectedNumberOfInstructions,
                                 expectedNumberOfSteps);

        let extra={maxCycles:80,calcFit,create,mutate,crossOver,poolSize:10};
        let [xxx,best]= GA.runGASearch(optimal,extra);
        GA.showBest(best,extra);
        let info= best.fitness.info;
        info[0].display(info[1]);
      }
    }
    LawnMower.test();
}
  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./genetic"))
  }else{
    gscope["io/czlab/mcfud/algo/mower"]=_module
  }

})(this);


